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
  roundedRect,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.965;

export default function FocalLengthShiftAtom({
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
    focus: 0.12,
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
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (!s.dragging && p.phase === 'resolve') s.focus += (0.86 - s.focus) * 0.08;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);

      const reveal = easeOutCubic(clamp((s.focus - 0.1) / 0.76, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.7;
        cb.onHaptic('drag_snap');
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
      const foreground = lerpColor(accent, [255, 180, 116], 0.48);
      const truth = lerpColor(primary, [244, 247, 255], 0.92);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.84);
      bg.addColorStop(0, rgba(field, Math.min(0.14, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const fgAlpha = Math.max(0.08, 1 - reveal);
      for (let i = 0; i < 7; i++) {
        const x = w * (0.22 + i * 0.09);
        const y = cy + ((i % 2 === 0 ? -1 : 1) * minDim * 0.08);
        ctx.beginPath();
        ctx.arc(x, y, minDim * (0.028 + (i % 3) * 0.008), 0, Math.PI * 2);
        ctx.fillStyle = rgba(foreground, Math.min(0.76, (0.18 + fgAlpha * 0.38) * entrance * boost));
        ctx.fill();
      }

      const bgTruthY = cy - minDim * 0.02;
      ctx.beginPath();
      ctx.moveTo(w * 0.22, bgTruthY);
      ctx.bezierCurveTo(w * 0.42, cy - minDim * 0.18, w * 0.58, cy + minDim * 0.16, w * 0.78, bgTruthY);
      ctx.strokeStyle = rgba(truth, Math.min(0.92, (0.08 + reveal * 0.76 + s.revealFlash * 0.06) * entrance * boost));
      ctx.lineWidth = px(0.014, minDim);
      ctx.stroke();

      const sliderY = h * 0.82;
      ctx.beginPath();
      ctx.moveTo(w * 0.24, sliderY);
      ctx.lineTo(w * 0.76, sliderY);
      ctx.strokeStyle = rgba(truth, Math.min(0.28, (0.08 + reveal * 0.14) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      const knobX = w * (0.24 + s.focus * 0.52);
      ctx.beginPath();
      ctx.arc(knobX, sliderY, minDim * 0.028 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(truth, Math.min(0.9, (0.18 + reveal * 0.42) * entrance * boost));
      ctx.fill();

      const apertureW = minDim * (0.18 + reveal * 0.18);
      roundedRect(ctx, cx - apertureW * 0.5, cy - minDim * 0.24, apertureW, minDim * 0.48, minDim * 0.02);
      ctx.strokeStyle = rgba(truth, Math.min(0.34, (0.06 + reveal * 0.16) * entrance * boost));
      ctx.lineWidth = px(0.0035, minDim);
      ctx.stroke();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getProgress = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      return clamp((x / viewport.width - 0.24) / 0.52, 0.1, 0.86);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.focus = getProgress(e);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.focus = getProgress(e);
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
