import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function SandMandalaSweepAtom({
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
  const dragRef = useRef<{ active: boolean; lastX: number; building: boolean }>({ active: false, lastX: 0, building: true });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    build: 0,
    scatter: 0,
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

    const particles = Array.from({ length: 48 }, (_, i) => ({
      angle: (i / 48) * Math.PI * 2,
      radius: 0.08 + (i % 6) * 0.028,
    }));

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const build = easeOutCubic(s.build);
      const scatter = easeOutCubic(s.scatter);
      const resolve = scatter;
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([14, 12, 16], s.primaryRgb, 0.12);
      const sand = lerpColor([244, 214, 168], s.accentRgb, 0.34);
      const dust = lerpColor([204, 224, 255], s.primaryRgb, 0.22);
      ctx.fillStyle = rgba(bg, 0.97 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (const part of particles) {
        const r = minDim * (part.radius + build * 0.14 + scatter * 0.34);
        const x = cx + Math.cos(part.angle) * r;
        const y = cy + Math.sin(part.angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, minDim * (0.008 + build * 0.006), 0, Math.PI * 2);
        ctx.fillStyle = rgba(scatter > 0 ? dust : sand, (0.14 + build * 0.72) * (1 - scatter * 0.8) * entrance);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, minDim * (0.016 + build * 0.024), 0, Math.PI * 2);
      ctx.fillStyle = rgba(sand, (0.26 + build * 0.6) * (1 - scatter) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, lastX: e.clientX, building: stateRef.current.build < 1 };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      dragRef.current.lastX = e.clientX;
      if (dragRef.current.building) {
        stateRef.current.build = clamp(stateRef.current.build + Math.abs(dx) / viewport.width * 0.9, 0, 1);
        callbacksRef.current.onHaptic('drag_snap');
      } else {
        stateRef.current.scatter = clamp(stateRef.current.scatter + Math.abs(dx) / viewport.width * 1.4, 0, 1);
        callbacksRef.current.onHaptic('swipe_commit');
      }
    };
    const onUp = (e: PointerEvent) => { dragRef.current.active = false; canvas.releasePointerCapture(e.pointerId); };

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

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
