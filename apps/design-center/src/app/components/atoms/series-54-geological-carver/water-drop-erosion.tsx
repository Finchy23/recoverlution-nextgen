import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  parseColor,
  px,
  rgba,
  roundedRect,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function WaterDropErosionAtom({
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
  const propsRef = useRef({ color, accentColor, phase, composed });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    taps: 0,
    dropPulse: 0,
    completionFired: false,
    stepMarks: [false, false, false],
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { color, accentColor, phase, composed };
  }, [color, accentColor, phase, composed]);

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

      s.dropPulse *= 0.9;
      const groove = easeOutCubic(clamp(s.taps / 50, 0, 1));
      cb.onStateChange?.(groove);

      if (groove >= 0.25 && !s.stepMarks[0]) {
        s.stepMarks[0] = true;
        cb.onHaptic('step_advance');
      }
      if (groove >= 0.5 && !s.stepMarks[1]) {
        s.stepMarks[1] = true;
        cb.onHaptic('step_advance');
      }
      if (groove >= 0.75 && !s.stepMarks[2]) {
        s.stepMarks[2] = true;
        cb.onHaptic('step_advance');
      }
      if (groove >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const slab = lerpColor([34, 32, 38], s.primaryRgb, 0.1);
      const top = lerpColor([92, 88, 82], s.accentRgb, 0.15);
      const water = lerpColor([80, 180, 255], s.accentRgb, 0.35);
      const mist = lerpColor([240, 248, 255], s.primaryRgb, 0.55);

      roundedRect(ctx, w * 0.14, h * 0.2, w * 0.72, h * 0.6, minDim * 0.04);
      const slabGrad = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.8);
      slabGrad.addColorStop(0, rgba(top, 0.94 * entrance));
      slabGrad.addColorStop(1, rgba(slab, 0.98 * entrance));
      ctx.fillStyle = slabGrad;
      ctx.fill();

      for (let i = 0; i < 6; i += 1) {
        ctx.strokeStyle = rgba(lerpColor(slab, [255, 255, 255], 0.12), (0.05 + i * 0.01) * entrance);
        ctx.lineWidth = px(0.002 + i * 0.0007, minDim);
        ctx.beginPath();
        ctx.moveTo(w * 0.18, h * (0.28 + i * 0.08));
        ctx.lineTo(w * 0.82, h * (0.24 + i * 0.09));
        ctx.stroke();
      }

      const grooveW = minDim * (0.018 + groove * 0.1);
      const grooveDepth = minDim * (0.04 + groove * 0.28);
      const grooveY = cy + grooveDepth * 0.1;
      const grooveGrad = ctx.createLinearGradient(cx, cy - grooveDepth, cx, cy + grooveDepth);
      grooveGrad.addColorStop(0, rgba(lerpColor(water, mist, 0.3), (0.2 + groove * 0.25) * entrance));
      grooveGrad.addColorStop(1, rgba(lerpColor(slab, water, 0.7), (0.45 + groove * 0.4) * entrance));
      ctx.fillStyle = grooveGrad;
      roundedRect(ctx, cx - grooveW / 2, grooveY - grooveDepth / 2, grooveW, grooveDepth, grooveW / 2);
      ctx.fill();

      const dropY = h * (0.1 + (1 - s.dropPulse) * 0.23);
      const dropR = minDim * (0.016 + groove * 0.01 + s.dropPulse * 0.012);
      ctx.beginPath();
      ctx.arc(cx, dropY, dropR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(water, (0.5 + s.dropPulse * 0.45) * entrance);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, grooveY - grooveDepth / 2 + dropR * 0.5, dropR * (0.8 + s.dropPulse), 0, Math.PI * 2);
      ctx.fillStyle = rgba(mist, (0.12 + s.dropPulse * 0.2) * entrance);
      ctx.fill();

      ctx.fillStyle = rgba(mist, 0.18 * entrance);
      ctx.font = `${px(0.028, minDim)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${s.taps}/50`, cx, h * 0.9);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = () => {
      const s = stateRef.current;
      if (s.taps >= 50) return;
      s.taps += 1;
      s.dropPulse = 1;
      callbacksRef.current.onHaptic('tap');
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'manipulation' }} />
    </div>
  );
}
