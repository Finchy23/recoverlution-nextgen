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
  roundedRect,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.48;
const COMPLETE_T = 0.965;

export default function NegativeSpaceRevealAtom({
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
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    squeeze: 0.12,
    dragging: false,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (!s.dragging && p.phase === 'resolve') s.squeeze += (0.88 - s.squeeze) * 0.08 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp((s.squeeze - 0.1) / 0.78, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.7;
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
      const field = lerpColor(primary, accent, 0.18);
      const dense = lerpColor([5, 7, 14], primary, 0.12);
      const clarity = lerpColor(primary, [246, 248, 255], 0.92);
      const ember = lerpColor(accent, [255, 238, 212], 0.72);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.88);
      bg.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.06) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.2 + (1 - reveal) * 0.18) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const clusterSpan = minDim * (0.28 - reveal * 0.18);
      const shapes = [
        { x: cx - clusterSpan, y: cy - minDim * 0.12, w: minDim * 0.22, h: minDim * 0.12 },
        { x: cx + clusterSpan, y: cy - minDim * 0.12, w: minDim * 0.22, h: minDim * 0.12 },
        { x: cx - clusterSpan, y: cy + minDim * 0.08, w: minDim * 0.22, h: minDim * 0.12 },
        { x: cx + clusterSpan, y: cy + minDim * 0.08, w: minDim * 0.22, h: minDim * 0.12 },
      ];

      for (const shape of shapes) {
        ctx.fillStyle = rgba(ember, Math.min(0.82, (0.18 + (1 - reveal) * 0.32) * entrance * boost));
        roundedRect(ctx, shape.x - shape.w * 0.5, shape.y - shape.h * 0.5, shape.w, shape.h, minDim * 0.022);
        ctx.fill();
      }

      const gapWidth = minDim * (0.03 + reveal * 0.16);
      const gapHeight = minDim * (0.26 + reveal * 0.12);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      roundedRect(ctx, cx - gapWidth * 0.5, cy - gapHeight * 0.5, gapWidth, gapHeight, minDim * 0.012);
      ctx.fill();
      roundedRect(ctx, cx - gapHeight * 0.28, cy - gapWidth * 0.5, gapHeight * 0.56, gapWidth, minDim * 0.012);
      ctx.fill();
      ctx.restore();

      const negativeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.34);
      negativeGlow.addColorStop(0, rgba(clarity, (0.06 + reveal * 0.18 + s.revealFlash * 0.06) * entrance));
      negativeGlow.addColorStop(1, rgba(clarity, 0));
      ctx.fillStyle = negativeGlow;
      ctx.fillRect(cx - minDim * 0.34, cy - minDim * 0.34, minDim * 0.68, minDim * 0.68);

      const handleOffset = minDim * (0.32 - reveal * 0.16);
      for (const dir of [-1, 1] as const) {
        ctx.beginPath();
        ctx.arc(cx + dir * handleOffset, cy, px(0.016, minDim) * (1 + breathAmplitude * 0.03), 0, Math.PI * 2);
        ctx.fillStyle = rgba(clarity, Math.min(0.92, (0.18 + reveal * 0.42) * entrance * boost));
        ctx.fill();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getProgress = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const localX = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const center = viewport.width * 0.5;
      const dist = Math.abs(localX - center) / (viewport.width * 0.38);
      return clamp(1 - dist, 0.1, 0.9);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.squeeze = getProgress(e);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.squeeze = getProgress(e);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
