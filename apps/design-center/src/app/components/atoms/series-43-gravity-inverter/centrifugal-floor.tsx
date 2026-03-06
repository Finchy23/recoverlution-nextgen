import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor,
  lerpColor,
  rgba,
  easeOutCubic,
  setupCanvas,
  advanceEntrance,
  drawAtmosphere,
  px,
  motionScale,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const FLASH_DECAY = 0.022;
const STEP_T = 0.56;
const COMPLETE_T = 0.965;
const DEBRIS_COUNT = 56;
const SPIN_GAIN = 0.008;
const SPIN_DECAY = 0.992;

type Debris = { x: number; y: number; vx: number; vy: number; size: number; phase: number };

function makeDebris(): Debris[] {
  return Array.from({ length: DEBRIS_COUNT }, (_, i) => ({
    x: 0.5 + Math.cos(i * 0.38) * (0.06 + (i % 7) * 0.016),
    y: 0.5 + Math.sin(i * 0.53) * (0.05 + (i % 5) * 0.018),
    vx: 0,
    vy: 0,
    size: 0.004 + (i % 4) * 0.002,
    phase: i * 0.37,
  }));
}

export default function CentrifugalFloorAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    debris: makeDebris(),
    rpm: 0,
    dragging: false,
    prevAngle: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.rpm += (1 - s.rpm) * 0.08;
      s.rpm *= SPIN_DECAY;

      let edgeCount = 0;
      for (const d of s.debris) {
        const dx = d.x - 0.5;
        const dy = d.y - 0.5;
        const dist = Math.max(0.0001, Math.hypot(dx, dy));
        const nx = dx / dist;
        const ny = dy / dist;
        if (s.rpm > 0.02) {
          d.vx += nx * s.rpm * 0.00042;
          d.vy += ny * s.rpm * 0.00042;
        } else {
          d.vx += (Math.sin(s.frameCount * 0.03 + d.phase) * 0.00012);
          d.vy += (Math.cos(s.frameCount * 0.026 + d.phase * 1.2) * 0.00012);
        }
        d.vx += (0.5 - d.x) * 0.00016 * (1 - s.rpm);
        d.vy += (0.5 - d.y) * 0.00016 * (1 - s.rpm);
        d.vx *= 0.985;
        d.vy *= 0.985;
        d.x = clamp(d.x + d.vx * ms, 0.04, 0.96);
        d.y = clamp(d.y + d.vy * ms, 0.04, 0.96);
        if (Math.hypot(d.x - 0.5, d.y - 0.5) > 0.4) edgeCount++;
      }

      const reveal = easeOutCubic(clamp(edgeCount / (DEBRIS_COUNT * 0.88), 0, 1));
      const voidness = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.74;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.22);
      const threat = lerpColor([8, 8, 14], accent, 0.16);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const clarity = lerpColor(primary, [244, 247, 255], 0.9);
      const ember = lerpColor(accent, [255, 236, 210], 0.58);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + voidness * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + voidness * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.98);
      dread.addColorStop(0, rgba(threat, Math.min(0.28, (0.08 + voidness * 0.18) * entrance * boost)));
      dread.addColorStop(0.56, rgba(dense, Math.min(0.14, (0.05 + voidness * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const safeR = minDim * (0.1 + reveal * 0.24);
      const safeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, safeR);
      safeGlow.addColorStop(0, rgba(clarity, Math.min(0.14, (0.02 + reveal * 0.1) * entrance * boost)));
      safeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = safeGlow;
      ctx.fillRect(cx - safeR, cy - safeR, safeR * 2, safeR * 2);

      if (s.rpm > 0.08) {
        for (let i = 0; i < 10; i++) {
          const a = s.frameCount * 0.03 * ms + (i / 10) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * safeR * 0.48, cy + Math.sin(a) * safeR * 0.48);
          ctx.lineTo(cx + Math.cos(a) * safeR * 0.96, cy + Math.sin(a) * safeR * 0.96);
          ctx.strokeStyle = rgba(ember, Math.min(0.12, (0.02 + s.rpm * 0.12) * entrance * boost));
          ctx.lineWidth = px(0.0016, minDim);
          ctx.stroke();
        }
      }

      const floorR = minDim * 0.44;
      ctx.beginPath();
      ctx.arc(cx, cy, floorR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(clarity, Math.min(0.22, (0.04 + reveal * 0.14) * entrance * boost));
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      for (const d of s.debris) {
        const x = d.x * w;
        const y = d.y * h;
        const r = px(d.size, minDim);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ember, Math.min(0.48, (0.08 + (Math.hypot(d.x - 0.5, d.y - 0.5)) * 0.4) * entrance * boost));
        ctx.fill();
      }

      const nodeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, px(0.18, minDim));
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.22, (0.04 + reveal * 0.16 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(cx - minDim * 0.18, cy - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(cx, cy, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.24 + reveal * 0.48 + voidness * 0.08) * entrance * boost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.5);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.5, cy - minDim * 0.5, minDim, minDim);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const y = ((e.clientY - rect.top) / rect.height) * viewport.height;
      return { x, y, angle: Math.atan2(y - viewport.height * 0.5, x - viewport.width * 0.5) };
    };

    const onDown = (e: PointerEvent) => {
      const p = getPoint(e);
      const s = stateRef.current;
      if (Math.hypot(p.x - viewport.width * 0.5, p.y - viewport.height * 0.5) > Math.min(viewport.width, viewport.height) * 0.26) return;
      s.dragging = true;
      s.prevAngle = p.angle;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      let delta = p.angle - s.prevAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.rpm = clamp(s.rpm + Math.abs(delta) * SPIN_GAIN * 100, 0, 1);
      s.prevAngle = p.angle;
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
