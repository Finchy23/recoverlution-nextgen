import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

export default function EternalOceanAtom({
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
    sealFired: false,
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

      s.progress = Math.min(1, s.progress + 0.01);
      const reveal = easeOutCubic(s.progress);
      cb.onStateChange?.(reveal);
      if (reveal > 0.82 && !s.sealFired) {
        s.sealFired = true;
        cb.onHaptic('seal_stamp');
      }
      if (reveal >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onResolve?.();
      }

      const ocean = lerpColor([74, 174, 255], s.primaryRgb, 0.22);
      const abyss = lerpColor([6, 10, 18], s.primaryRgb, 0.08);
      const mist = lerpColor([244, 250, 255], s.primaryRgb, 0.55);

      ctx.fillStyle = rgba(abyss, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 6; i += 1) {
        const r = minDim * (0.14 + i * 0.12 + reveal * 0.25);
        ctx.beginPath();
        ctx.arc(cx, cy + h * 0.08, r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ocean, (0.16 - i * 0.02 + reveal * 0.06) * entrance);
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      const nodeY = cy - h * 0.2 + reveal * h * 0.28;
      const nodeR = minDim * (0.04 * (1 - reveal) + 0.004);
      ctx.beginPath();
      ctx.arc(cx, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(mist, (0.8 - reveal * 0.65) * entrance);
      ctx.fill();

      const horizon = ctx.createLinearGradient(0, cy + h * 0.02, 0, h);
      horizon.addColorStop(0, rgba(ocean, 0));
      horizon.addColorStop(1, rgba(ocean, (0.18 + reveal * 0.2) * entrance));
      ctx.fillStyle = horizon;
      ctx.fillRect(0, cy + h * 0.02, w, h * 0.5);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(raf);
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} /></div>;
}
