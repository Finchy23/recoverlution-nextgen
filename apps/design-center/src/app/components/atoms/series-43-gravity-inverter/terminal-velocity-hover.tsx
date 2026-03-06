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
const FLASH_DECAY = 0.024;
const STEP_T = 0.56;
const COMPLETE_T = 0.965;
const STREAKS = 70;

type Pointer = { x: number; y: number };

export default function TerminalVelocityHoverAtom({
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
    pointers: new Map<number, Pointer>(),
    spread: 0,
    baseDistance: 0,
    baseSpread: 0,
    hoverThresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    holdStarted: false,
    fallbackDrag: false,
    fallbackStartX: 0,
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

    const seeds = Array.from({ length: STREAKS }, (_, i) => ({
      x: ((i * 37) % STREAKS) / STREAKS,
      y: ((i * 17) % STREAKS) / STREAKS,
      len: 0.03 + ((i * 11) % 7) * 0.008,
      phase: i * 0.4,
    }));

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
      if (p.phase === 'resolve' && s.pointers.size === 0 && !s.fallbackDrag) s.spread += (1 - s.spread) * 0.08;

      const reveal = easeOutCubic(clamp(s.spread, 0, 1));
      const fallSpeed = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.hoverThresholdFired) {
        s.hoverThresholdFired = true;
        s.revealFlash = 0.76;
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
      const field = lerpColor(primary, accent, 0.24);
      const threat = lerpColor([8, 9, 14], accent, 0.2);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 238, 212], 0.62);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.88);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + fallSpeed * 0.08 + reveal * 0.04) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + fallSpeed * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.98);
      dread.addColorStop(0, rgba(threat, Math.min(0.34, (0.1 + fallSpeed * 0.18) * entrance * boost)));
      dread.addColorStop(0.56, rgba(dense, Math.min(0.16, (0.05 + fallSpeed * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      for (const seed of seeds) {
        const speed = minDim * (0.08 + fallSpeed * 0.44);
        const y = ((seed.y + s.frameCount * 0.006 * (0.4 + fallSpeed * 2.6) * ms) % 1) * h;
        const x = seed.x * w + Math.sin(seed.phase + s.frameCount * 0.008 * ms) * minDim * 0.02 * fallSpeed;
        const length = minDim * (seed.len + fallSpeed * 0.14);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + length);
        ctx.strokeStyle = rgba(ember, Math.min(0.34, (0.06 + fallSpeed * 0.24) * entrance * boost));
        ctx.lineWidth = px(0.0016 + fallSpeed * 0.0018, minDim);
        ctx.stroke();
      }

      const ringR = minDim * (0.1 + reveal * 0.16);
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(clarity, Math.min(0.26, (0.04 + reveal * 0.16) * entrance * boost));
      ctx.lineWidth = px(0.0032, minDim);
      ctx.stroke();

      if (reveal > 0.12) {
        for (let i = 0; i < 2; i++) {
          const wingW = minDim * (0.06 + reveal * 0.1);
          const wingH = minDim * (0.012 + reveal * 0.018);
          const side = i === 0 ? -1 : 1;
          ctx.beginPath();
          ctx.ellipse(cx + side * minDim * 0.14 * reveal, cy, wingW, wingH, side * 0.26, 0, Math.PI * 2);
          ctx.fillStyle = rgba(clarity, Math.min(0.24, (0.04 + reveal * 0.18) * entrance * boost));
          ctx.fill();
        }
      }

      const nodeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, px(0.18, minDim));
      nodeGlow.addColorStop(0, rgba(clarity, Math.min(0.24, (0.04 + reveal * 0.16 + s.revealFlash * 0.05) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(cx - minDim * 0.18, cy - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(cx, cy, px(0.028, minDim) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.98, (0.22 + reveal * 0.5 + fallSpeed * 0.1) * entrance * boost));
      ctx.fill();

      if (s.pointers.size >= 2 || s.fallbackDrag) {
        const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * (0.22 + reveal * 0.12));
        aura.addColorStop(0, rgba(ember, Math.min(0.18, (0.04 + reveal * 0.1) * entrance * boost)));
        aura.addColorStop(1, rgba(ember, 0));
        ctx.fillStyle = aura;
        ctx.fillRect(cx - minDim * 0.34, cy - minDim * 0.34, minDim * 0.68, minDim * 0.68);
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.48);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.48, cy - minDim * 0.48, minDim * 0.96, minDim * 0.96);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent): Pointer => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const distance = () => {
      const points = [...stateRef.current.pointers.values()];
      if (points.length < 2) return 0;
      return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointers.set(e.pointerId, getPoint(e));
      canvas.setPointerCapture(e.pointerId);
      if (s.pointers.size === 2) {
        s.baseDistance = distance();
        s.baseSpread = s.spread;
        if (!s.holdStarted) {
          s.holdStarted = true;
          callbacksRef.current.onHaptic('hold_start');
        }
      } else if (s.pointers.size === 1) {
        s.fallbackDrag = true;
        s.fallbackStartX = [...s.pointers.values()][0].x;
        s.baseSpread = s.spread;
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointers.has(e.pointerId)) return;
      s.pointers.set(e.pointerId, getPoint(e));
      if (s.pointers.size >= 2 && s.baseDistance > 0) {
        const delta = (distance() - s.baseDistance) / 220;
        s.spread = clamp(s.baseSpread + delta, 0, 1);
      } else if (s.fallbackDrag) {
        const point = [...s.pointers.values()][0];
        const delta = Math.abs(point.x - s.fallbackStartX) / 260;
        s.spread = clamp(s.baseSpread + delta, 0, 1);
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pointers.delete(e.pointerId);
      stateRef.current.fallbackDrag = stateRef.current.pointers.size > 0;
      canvas.releasePointerCapture(e.pointerId);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      if (!s.holdStarted) {
        s.holdStarted = true;
        callbacksRef.current.onHaptic('hold_start');
      }
      s.spread = clamp(s.spread + (-e.deltaY / 600), 0, 1);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('wheel', onWheel);
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
