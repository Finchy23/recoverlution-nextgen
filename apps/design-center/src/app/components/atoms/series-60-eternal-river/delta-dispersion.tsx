import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

export default function DeltaDispersionAtom({
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
    progress: 0,
    stepFired: false,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
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

      s.progress = Math.min(1, s.progress + 0.012);
      const reveal = easeOutCubic(s.progress);
      cb.onStateChange?.(reveal);
      if (reveal >= 0.5 && !s.stepFired) {
        s.stepFired = true;
        cb.onHaptic('step_advance');
      }
      if (reveal >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const river = lerpColor([94, 192, 255], s.primaryRgb, 0.22);
      const garden = lerpColor([124, 198, 124], s.accentRgb, 0.2);
      const soil = lerpColor([44, 36, 28], s.accentRgb, 0.05);

      ctx.fillStyle = rgba(soil, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = rgba(river, (0.28 - reveal * 0.08) * entrance);
      ctx.lineWidth = px(0.026 - reveal * 0.018, minDim);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h * 0.42);
      ctx.stroke();

      for (let i = 0; i < 9; i += 1) {
        const spread = (i - 4) / 4;
        const targetX = cx + spread * w * 0.34 * reveal;
        ctx.strokeStyle = rgba(river, (0.16 + reveal * 0.12) * entrance);
        ctx.lineWidth = px(0.012 - reveal * 0.004, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.42);
        ctx.quadraticCurveTo(cx + spread * w * 0.12, h * 0.6, targetX, h * 0.82);
        ctx.stroke();

        if (reveal > 0.35) {
          roundedRect(ctx, targetX - minDim * 0.03, h * 0.82 - minDim * 0.02, minDim * 0.06, minDim * 0.04, minDim * 0.01);
          ctx.fillStyle = rgba(garden, (0.1 + reveal * 0.35) * entrance);
          ctx.fill();
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(raf);
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} /></div>;
}
