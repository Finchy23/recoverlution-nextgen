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
const STILLNESS_MS = 3000;
const STEP_T = 0.54;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function KleinEscapeAtom({
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
    dragging: false,
    nodeT: 0.1,
    stillnessStart: 0,
    stillnessProgress: 0,
    revealFlash: 0,
    thresholdFired: false,
    completionFired: false,
    errorCooldown: 0,
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

    const pathPoint = (cx: number, cy: number, minDim: number, t: number): Point => {
      const a = minDim * 0.22;
      const b = minDim * 0.13;
      const k = t * Math.PI * 2;
      return {
        x: cx + Math.cos(k) * a + Math.cos(k * 2) * minDim * 0.055,
        y: cy + Math.sin(k) * b + Math.sin(k * 2) * minDim * 0.12,
      };
    };

    const projectT = (cx: number, cy: number, minDim: number, p: Point) => {
      let bestT = 0;
      let bestD = Number.POSITIVE_INFINITY;
      for (let i = 0; i < 180; i++) {
        const t = i / 180;
        const pt = pathPoint(cx, cy, minDim, t);
        const d = Math.hypot(pt.x - p.x, pt.y - p.y);
        if (d < bestD) {
          bestD = d;
          bestT = t;
        }
      }
      return bestT;
    };

    const render = (now: number) => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      if (s.errorCooldown > 0) s.errorCooldown--;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (!s.dragging) {
        if (s.stillnessStart === 0) s.stillnessStart = now;
        s.stillnessProgress = clamp((now - s.stillnessStart) / STILLNESS_MS, 0, 1);
      } else {
        s.stillnessStart = 0;
        s.stillnessProgress = 0;
      }

      if (p.phase === 'resolve' && !s.dragging) s.stillnessProgress += (1 - s.stillnessProgress) * 0.08;

      const reveal = easeOutCubic(clamp(s.stillnessProgress, 0, 1));
      const trap = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('hold_release');
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
      const threat = lerpColor([10, 9, 16], accent, 0.18);
      const dense = lerpColor([5, 6, 11], primary, 0.1);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 234, 208], 0.58);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.8);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.05 + trap * 0.08) * entrance * boost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + trap * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.94);
      dread.addColorStop(0, rgba(threat, Math.min(0.34, (0.1 + trap * 0.18) * entrance * boost)));
      dread.addColorStop(0.58, rgba(dense, Math.min(0.18, (0.05 + trap * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const centerHoleR = minDim * (0.08 + reveal * 0.08);
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerHoleR * 2.4);
      innerGlow.addColorStop(0, rgba(clarity, Math.min(0.18, (0.03 + reveal * 0.14 + s.revealFlash * 0.06) * entrance * boost)));
      innerGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = innerGlow;
      ctx.fillRect(cx - centerHoleR * 2.4, cy - centerHoleR * 2.4, centerHoleR * 4.8, centerHoleR * 4.8);

      const loops = 2;
      for (let loop = 0; loop < loops; loop++) {
        ctx.beginPath();
        for (let i = 0; i <= 220; i++) {
          const t = i / 220;
          const pt = pathPoint(cx, cy, minDim, t + loop * 0.07);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = rgba(loop === 0 ? ember : threat, Math.min(0.62, (0.2 + trap * 0.24 + reveal * 0.08) * entrance * boost));
        ctx.lineWidth = px(loop === 0 ? 0.032 : 0.015, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      const node = pathPoint(cx, cy, minDim, s.nodeT);
      const nodeGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, minDim * 0.14);
      nodeGlow.addColorStop(0, rgba(ember, Math.min(0.36, (0.12 + trap * 0.18) * entrance * boost)));
      nodeGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = nodeGlow;
      ctx.fillRect(node.x - minDim * 0.14, node.y - minDim * 0.14, minDim * 0.28, minDim * 0.28);
      ctx.beginPath();
      ctx.arc(node.x, node.y, px(0.028, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, Math.min(0.98, (0.34 + trap * 0.34) * entrance * boost));
      ctx.fill();

      if (reveal > 0.18) {
        const shardCount = 26;
        for (let i = 0; i < shardCount; i++) {
          const t = i / shardCount;
          const ang = t * Math.PI * 2 + s.frameCount * 0.004 * ms;
          const dist = centerHoleR * (0.8 + reveal * 4.2);
          const shardX = cx + Math.cos(ang) * dist;
          const shardY = cy + Math.sin(ang) * dist;
          const len = minDim * (0.012 + reveal * 0.018);
          ctx.save();
          ctx.translate(shardX, shardY);
          ctx.rotate(ang + t * 3);
          ctx.beginPath();
          ctx.moveTo(-len * 0.6, -len * 0.3);
          ctx.lineTo(len, 0);
          ctx.lineTo(-len * 0.4, len * 0.44);
          ctx.closePath();
          ctx.fillStyle = rgba(i % 2 === 0 ? clarity : ember, Math.min(0.18, reveal * 0.18 * entrance * boost));
          ctx.fill();
          ctx.restore();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.46);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.46, cy - minDim * 0.46, minDim * 0.92, minDim * 0.92);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.stillnessStart = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const { x, y } = getPoint(e);
      const nextT = projectT(viewport.width * 0.5, viewport.height * 0.5, Math.min(viewport.width, viewport.height), { x, y });
      const projected = pathPoint(viewport.width * 0.5, viewport.height * 0.5, Math.min(viewport.width, viewport.height), nextT);
      const dist = Math.hypot(projected.x - x, projected.y - y);
      s.nodeT = (nextT + 0.18) % 1;
      if (dist > Math.min(viewport.width, viewport.height) * 0.12 && s.errorCooldown === 0) {
        s.errorCooldown = 16;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      stateRef.current.stillnessStart = performance.now();
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
