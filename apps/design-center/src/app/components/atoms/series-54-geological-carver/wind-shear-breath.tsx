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

export default function WindShearBreathAtom({
  breathAmplitude,
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
  const propsRef = useRef({ breathAmplitude, color, accentColor, phase, composed });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    polish: 0,
    peakLatched: false,
    completionFired: false,
    steps: [false, false],
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, color, accentColor, phase, composed };
  }, [breathAmplitude, color, accentColor, phase, composed]);

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

      const amp = clamp(p.breathAmplitude, 0, 1);
      s.polish = clamp(s.polish + Math.max(0, amp - 0.42) * 0.008, 0, 1);
      const resolved = easeOutCubic(s.polish);
      cb.onStateChange?.(resolved);

      if (amp > 0.82 && !s.peakLatched) {
        s.peakLatched = true;
        cb.onHaptic('breath_peak');
      }
      if (amp < 0.35) s.peakLatched = false;
      if (resolved >= 0.35 && !s.steps[0]) {
        s.steps[0] = true;
        cb.onHaptic('step_advance');
      }
      if (resolved >= 0.72 && !s.steps[1]) {
        s.steps[1] = true;
        cb.onHaptic('step_advance');
      }
      if (resolved >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const rock = lerpColor([48, 44, 52], s.primaryRgb, 0.1);
      const sand = lerpColor([138, 114, 94], s.accentRgb, 0.2);
      const smooth = lerpColor([186, 172, 154], s.accentRgb, 0.16);
      const wind = lerpColor([232, 244, 255], s.primaryRgb, 0.58);

      ctx.fillStyle = rgba(rock, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const bodyW = minDim * (0.28 + resolved * 0.08);
      const bodyH = minDim * (0.52 - resolved * 0.1);
      const radius = minDim * (0.02 + resolved * 0.09);
      roundedRect(ctx, cx - bodyW / 2, cy - bodyH / 2, bodyW, bodyH, radius);
      const monolith = ctx.createLinearGradient(cx - bodyW / 2, cy - bodyH / 2, cx + bodyW / 2, cy + bodyH / 2);
      monolith.addColorStop(0, rgba(sand, 0.94 * entrance));
      monolith.addColorStop(1, rgba(lerpColor(rock, smooth, 0.52), 0.98 * entrance));
      ctx.fillStyle = monolith;
      ctx.fill();

      const roughCount = Math.round(24 * (1 - resolved));
      ctx.strokeStyle = rgba(lerpColor(rock, [255, 255, 255], 0.25), 0.22 * entrance);
      ctx.lineWidth = px(0.004, minDim);
      for (let i = 0; i < roughCount; i += 1) {
        const y = cy - bodyH / 2 + (i / Math.max(1, roughCount)) * bodyH;
        const swing = Math.sin(i * 2.1 + performance.now() * 0.001) * minDim * 0.016 * (1 - resolved);
        ctx.beginPath();
        ctx.moveTo(cx - bodyW * 0.42, y);
        ctx.lineTo(cx + bodyW * 0.42, y + swing);
        ctx.stroke();
      }

      for (let i = 0; i < 12; i += 1) {
        const y = h * (0.18 + i * 0.055);
        const length = w * (0.24 + amp * 0.35);
        ctx.strokeStyle = rgba(wind, (0.08 + amp * 0.12 + resolved * 0.08) * entrance);
        ctx.lineWidth = px(0.003 + amp * 0.002, minDim);
        ctx.beginPath();
        ctx.moveTo(w * 0.12, y);
        ctx.quadraticCurveTo(cx - minDim * 0.08, y - minDim * 0.018, w * 0.12 + length, y + minDim * 0.01);
        ctx.stroke();
      }

      ctx.fillStyle = rgba(wind, 0.2 * entrance);
      ctx.font = `${px(0.02, minDim)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('breathe the edges smooth', cx, h * 0.9);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(raf);
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
