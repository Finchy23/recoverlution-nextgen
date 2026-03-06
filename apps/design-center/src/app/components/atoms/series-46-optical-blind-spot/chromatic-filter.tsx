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
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

export default function ChromaticFilterAtom({
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
    lens: 0.24,
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
      if (!s.dragging && p.phase === 'resolve') s.lens += (0.78 - s.lens) * 0.08;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);

      const reveal = easeOutCubic(clamp((s.lens - 0.2) / 0.58, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
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
      const dense = lerpColor([6, 7, 13], primary, 0.1);
      const red = lerpColor(accent, [255, 82, 82], 0.22);
      const blue = lerpColor(primary, [120, 186, 255], 0.58);
      const clarity = lerpColor(primary, [246, 248, 255], 0.94);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.88);
      bg.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const y = h * (0.18 + i * 0.045);
        ctx.beginPath();
        ctx.moveTo(w * 0.18, y);
        ctx.lineTo(w * 0.82, y + ((i % 2 === 0 ? 1 : -1) * minDim * 0.04));
        ctx.strokeStyle = rgba(i % 2 === 0 ? red : blue, Math.min(0.72, (0.18 + (i % 2 === 0 ? 0.16 : 0.2)) * entrance * boost));
        ctx.lineWidth = px(0.008 + (i % 3) * 0.0012, minDim);
        ctx.stroke();
      }

      const lensX = w * s.lens;
      const lensW = minDim * 0.34;
      ctx.fillStyle = rgba(red, 0.24 * entrance * boost);
      ctx.fillRect(lensX - lensW * 0.5, 0, lensW, h);

      ctx.save();
      ctx.beginPath();
      ctx.rect(lensX - lensW * 0.5, 0, lensW, h);
      ctx.clip();
      for (let i = 0; i < 14; i++) {
        const y = h * (0.18 + i * 0.045);
        ctx.beginPath();
        ctx.moveTo(w * 0.18, y);
        ctx.lineTo(w * 0.82, y + ((i % 2 === 0 ? 1 : -1) * minDim * 0.04));
        ctx.strokeStyle = rgba(i % 2 === 0 ? red : clarity, Math.min(0.16 + (i % 2 === 0 ? 0.02 : reveal * 0.62), 0.92) * entrance * boost);
        ctx.lineWidth = px(0.008 + (i % 3) * 0.0012, minDim);
        ctx.stroke();
      }
      ctx.restore();

      ctx.beginPath();
      ctx.arc(lensX, cy, minDim * 0.028 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(clarity, Math.min(0.88, (0.18 + reveal * 0.4) * entrance * boost));
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getX = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * viewport.width;
    };
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.lens = clamp(getX(e) / viewport.width, 0.2, 0.78);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.lens = clamp(getX(e) / viewport.width, 0.2, 0.78);
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
