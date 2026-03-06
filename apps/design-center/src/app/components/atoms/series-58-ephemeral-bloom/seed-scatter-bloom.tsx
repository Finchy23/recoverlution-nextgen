import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function SeedScatterBloomAtom({
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
    burst: 0,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const seeds = Array.from({ length: 72 }, (_, i) => ({
      angle: (i / 72) * Math.PI * 2,
      speed: 0.28 + (i % 6) * 0.04,
    }));

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (s.burst > 0 && s.burst < 1) s.burst = clamp(s.burst + dt * 0.8, 0, 1);
      const resolve = easeOutCubic(s.burst);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      const bg = lerpColor([12, 12, 18], s.primaryRgb, 0.16);
      const bloom = lerpColor([248, 214, 166], s.accentRgb, 0.36);
      const seed = lerpColor([210, 226, 255], s.primaryRgb, 0.28);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      if (resolve < 0.18) {
        for (let i = 0; i < 10; i += 1) {
          const a = (i / 10) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * minDim * 0.08, cy + Math.sin(a) * minDim * 0.08, minDim * 0.07, minDim * 0.028, a, 0, Math.PI * 2);
          ctx.fillStyle = rgba(bloom, 0.56 * entrance);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * 0.034, 0, Math.PI * 2);
        ctx.fillStyle = rgba(seed, 0.92 * entrance);
        ctx.fill();
      }

      if (resolve > 0.02) {
        for (const sdata of seeds) {
          const r = minDim * (0.02 + resolve * sdata.speed * 4.2);
          const x = cx + Math.cos(sdata.angle) * r;
          const y = cy + Math.sin(sdata.angle) * r * 0.84 + resolve * minDim * 0.18;
          ctx.beginPath();
          ctx.arc(x, y, minDim * 0.005, 0, Math.PI * 2);
          ctx.fillStyle = rgba(seed, (0.12 + (1 - resolve) * 0.42) * entrance);
          ctx.fill();
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = () => {
      if (stateRef.current.burst > 0) return;
      stateRef.current.burst = 0.08;
      callbacksRef.current.onHaptic('tap');
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'manipulation' }} /></div>;
}
