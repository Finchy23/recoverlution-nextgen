import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function KineticDecayHalflifeAtom({
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
    energy: 1,
    settled: 0,
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

      s.energy = clamp(s.energy - dt * 0.08, 0, 1);
      if (s.energy <= 0.18) s.settled = clamp(s.settled + dt * 0.28, 0, 1);
      const resolve = easeOutCubic(s.settled);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([12, 12, 18], s.primaryRgb, 0.16);
      const ember = lerpColor([248, 186, 128], s.accentRgb, 0.34);
      const ash = lerpColor([198, 220, 255], s.primaryRgb, 0.16);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const r = minDim * (0.08 + s.energy * 0.05);
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * (1 + i * 0.35), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ember, (s.energy * 0.22 - i * 0.04) * entrance);
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ember, (0.2 + s.energy * 0.65) * entrance);
      ctx.fill();

      if (resolve > 0.05) {
        ctx.beginPath();
        ctx.arc(cx, cy + minDim * 0.08, minDim * (0.04 + resolve * 0.03), 0, Math.PI * 2);
        ctx.fillStyle = rgba(ash, resolve * 0.6 * entrance);
        ctx.fill();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = () => {
      stateRef.current.energy = clamp(stateRef.current.energy - 0.1, 0, 1);
      callbacksRef.current.onHaptic('error_boundary');
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
