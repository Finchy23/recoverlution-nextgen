import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type P = { x: number; y: number };

export default function MoltingShellCrackAtom({
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
  const pinchRef = useRef<{ active: boolean; startDist: number; startCrack: number }>({ active: false, startDist: 0, startCrack: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    crack: 0,
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
    const pointers = new Map<number, P>();
    const distance = () => {
      const pts = [...pointers.values()];
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const resolve = easeOutCubic(s.crack);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([14, 14, 18], s.primaryRgb, 0.15);
      const shell = lerpColor([104, 120, 146], s.primaryRgb, 0.2);
      const core = lerpColor([248, 218, 156], s.accentRgb, 0.36);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const halfW = minDim * 0.11;
      const halfH = minDim * 0.24;
      const spread = resolve * minDim * 0.12;
      roundedRect(ctx, cx - halfW - spread, cy - halfH / 2, halfW, halfH, minDim * 0.04);
      ctx.fillStyle = rgba(shell, (0.32 + (1 - resolve) * 0.46) * entrance);
      ctx.fill();
      roundedRect(ctx, cx + spread, cy - halfH / 2, halfW, halfH, minDim * 0.04);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, minDim * (0.05 + resolve * 0.08), 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.28 + resolve * 0.58) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const point = (e: PointerEvent): P => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };
    const update = () => {
      if (pointers.size !== 2) return;
      const d = distance();
      if (!pinchRef.current.active) {
        pinchRef.current = { active: true, startDist: d, startCrack: stateRef.current.crack };
        callbacksRef.current.onHaptic('hold_start');
        return;
      }
      stateRef.current.crack = clamp(pinchRef.current.startCrack + (d - pinchRef.current.startDist) / viewport.width, 0, 1);
    };
    const onDown = (e: PointerEvent) => { pointers.set(e.pointerId, point(e)); canvas.setPointerCapture(e.pointerId); update(); };
    const onMove = (e: PointerEvent) => { if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, point(e)); update(); };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); pinchRef.current.active = false; canvas.releasePointerCapture(e.pointerId); };

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
