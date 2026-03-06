import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  motionScale,
  parseColor,
  px,
  rgba,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

export default function ImpossibleContainerAtom({
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
  const activeRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    fill: 0,
    vanish: 0,
    guilt: 0,
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

      if (activeRef.current) s.fill = Math.min(1, s.fill + 0.02 * ms);
      else {
        s.fill = Math.max(0, s.fill - 0.03 * ms);
        s.guilt += (1 - s.guilt) * 0.04 * ms;
        s.vanish += (Math.max(0, s.guilt - 0.5) - s.vanish) * 0.05 * ms;
      }
      if (p.phase === 'resolve') s.vanish += (1 - s.vanish) * 0.08 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.vanish, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
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
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const bucket = lerpColor(primary, [246, 248, 255], 0.9);
      const pour = lerpColor(accent, [255, 190, 124], 0.6);
      const warning = lerpColor(accent, [255, 110, 102], 0.56);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const bucketAlpha = Math.max(0, 1 - reveal);
      ctx.beginPath();
      ctx.moveTo(cx - minDim * 0.12, cy - minDim * 0.12);
      ctx.lineTo(cx + minDim * 0.12, cy - minDim * 0.12);
      ctx.lineTo(cx + minDim * 0.08, cy + minDim * 0.14);
      ctx.lineTo(cx - minDim * 0.08, cy + minDim * 0.14);
      ctx.closePath();
      ctx.strokeStyle = rgba(bucket, Math.min(0.7, (0.14 + bucketAlpha * 0.34) * entrance * boost));
      ctx.lineWidth = px(0.006, minDim);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - minDim * 0.06, cy + minDim * 0.14);
      ctx.lineTo(cx - minDim * 0.02, cy + minDim * 0.2);
      ctx.lineTo(cx + minDim * 0.02, cy + minDim * 0.14);
      ctx.strokeStyle = rgba(bucket, Math.min(0.64, (0.12 + bucketAlpha * 0.28) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      ctx.fillStyle = rgba(pour, Math.min(0.72, (0.12 + s.fill * 0.4) * bucketAlpha * entrance * boost));
      ctx.fillRect(cx - minDim * 0.074, cy + minDim * 0.14 - minDim * 0.22 * s.fill, minDim * 0.148, minDim * 0.22 * s.fill);

      if (!activeRef.current && s.guilt > 0.12 && bucketAlpha > 0.02) {
        ctx.beginPath();
        ctx.arc(cx, cy - minDim * 0.24, minDim * 0.018 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
        ctx.fillStyle = rgba(warning, Math.min(0.74, (0.08 + s.guilt * 0.34) * entrance * boost));
        ctx.fill();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      activeRef.current = true;
      stateRef.current.guilt = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      activeRef.current = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
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
