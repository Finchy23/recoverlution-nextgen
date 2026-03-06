import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Leaf = { x: number; y: number; r: number; off: number };

export default function SeasonalShedAtom({
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
    shed: 0,
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
    const leaves: Leaf[] = Array.from({ length: 24 }, (_, i) => ({
      x: 0.32 + ((i * 0.07) % 0.36),
      y: 0.18 + ((i * 0.11) % 0.3),
      r: 0.01 + (i % 4) * 0.004,
      off: (i % 5) * 0.02,
    }));

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.58, w, h, minDim, s.primaryRgb, entrance);

      const resolve = easeOutCubic(s.shed);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([10, 12, 16], s.primaryRgb, 0.15);
      const trunk = lerpColor([88, 68, 52], s.accentRgb, 0.12);
      const leaf = lerpColor([232, 140, 86], s.accentRgb, 0.18);
      const core = lerpColor([202, 222, 255], s.primaryRgb, 0.28);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = rgba(trunk, 0.78 * entrance);
      ctx.lineWidth = px(0.02, minDim);
      ctx.beginPath();
      ctx.moveTo(cx, h * 0.84);
      ctx.lineTo(cx, h * 0.34);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, h * 0.46);
      ctx.lineTo(w * 0.36, h * 0.28);
      ctx.moveTo(cx, h * 0.44);
      ctx.lineTo(w * 0.64, h * 0.26);
      ctx.stroke();

      for (const l of leaves) {
        const fall = resolve * (0.28 + l.off);
        ctx.beginPath();
        ctx.ellipse(w * l.x, h * (l.y + fall), minDim * l.r * 1.6, minDim * l.r, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(leaf, (0.3 + (1 - resolve) * 0.55) * entrance);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, h * 0.3, minDim * 0.028, 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.26 + resolve * 0.5) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      if ((e.movementX ** 2 + e.movementY ** 2) < 800) return;
      stateRef.current.shed = clamp(stateRef.current.shed + 0.16, 0, 1);
      callbacksRef.current.onHaptic('step_advance');
    };
    canvas.addEventListener('pointermove', onMove);
    raf = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
