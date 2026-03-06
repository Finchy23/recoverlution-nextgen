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
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.5;
const COMPLETE_T = 0.965;

export default function UvRevelationAtom({
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
    sweep: 0.16,
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

    const traces = [
      [0.2, 0.24, 0.76, 0.26],
      [0.28, 0.42, 0.68, 0.52],
      [0.18, 0.66, 0.82, 0.58],
      [0.58, 0.2, 0.64, 0.82],
    ];

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (!s.dragging && p.phase === 'resolve') s.sweep += (0.84 - s.sweep) * 0.08;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);

      const reveal = easeOutCubic(clamp((s.sweep - 0.12) / 0.72, 0, 1));
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
      const field = lerpColor(primary, [246, 248, 255], 0.94);
      const ink = lerpColor(primary, [12, 8, 30], 0.36);
      const ultraviolet = lerpColor(accent, [160, 110, 255], 0.52);
      const hazard = lerpColor(accent, [80, 255, 205], 0.52);

      ctx.fillStyle = rgba(field, 0.98);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 16; i++) {
        const y = h * (0.12 + i * 0.045);
        ctx.beginPath();
        ctx.moveTo(w * 0.18, y);
        ctx.lineTo(w * 0.82, y);
        ctx.strokeStyle = rgba(ink, 0.035 * entrance * boost);
        ctx.lineWidth = px(0.0024, minDim);
        ctx.stroke();
      }

      const barY = h * s.sweep;
      ctx.fillStyle = rgba(ultraviolet, 0.18 * entrance * boost);
      ctx.fillRect(0, barY - minDim * 0.09, w, minDim * 0.18);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, barY + minDim * 0.05);
      ctx.clip();
      for (const trace of traces) {
        ctx.beginPath();
        ctx.moveTo(w * trace[0], h * trace[1]);
        ctx.bezierCurveTo(w * 0.42, h * 0.38, w * 0.56, h * 0.64, w * trace[2], h * trace[3]);
        ctx.strokeStyle = rgba(hazard, Math.min(0.86, (0.14 + reveal * 0.56 + s.revealFlash * 0.08) * entrance * boost));
        ctx.lineWidth = px(0.01, minDim);
        ctx.stroke();
      }
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, barY, minDim * 0.024 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(hazard, Math.min(0.88, (0.2 + reveal * 0.36) * entrance * boost));
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getProgress = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const y = ((e.clientY - rect.top) / rect.height) * viewport.height;
      return clamp(y / viewport.height, 0.12, 0.84);
    };
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.sweep = getProgress(e);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.sweep = getProgress(e);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}
