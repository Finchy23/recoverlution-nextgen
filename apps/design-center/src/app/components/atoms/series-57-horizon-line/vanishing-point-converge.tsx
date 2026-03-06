import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type P = { x: number; y: number };

export default function VanishingPointConvergeAtom({
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
  const pinchRef = useRef<{ active: boolean; startDist: number; startGap: number }>({ active: false, startDist: 0, startGap: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    gap: 0.42,
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
    const dist = () => {
      const pts = [...pointers.values()];
      if (pts.length < 2) return 0;
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.52, w, h, minDim, s.primaryRgb, entrance);

      const resolve = easeOutCubic(clamp((0.42 - s.gap) / 0.34, 0, 1));
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([12, 14, 18], s.primaryRgb, 0.15);
      const line = lerpColor([186, 214, 255], s.primaryRgb, 0.3);
      const goal = lerpColor([244, 214, 160], s.accentRgb, 0.34);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const leftX = cx - w * s.gap * 0.5;
      const rightX = cx + w * s.gap * 0.5;
      const bottomY = h * 0.86;
      const topY = h * 0.18;
      const vanishingY = h * 0.18;

      ctx.strokeStyle = rgba(line, (0.24 + resolve * 0.5) * entrance);
      ctx.lineWidth = px(0.006, minDim);
      ctx.beginPath();
      ctx.moveTo(leftX, bottomY);
      ctx.lineTo(leftX + (cx - leftX) * resolve, vanishingY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightX, bottomY);
      ctx.lineTo(rightX + (cx - rightX) * resolve, vanishingY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, vanishingY, minDim * 0.022, 0, Math.PI * 2);
      ctx.fillStyle = rgba(goal, (0.4 + resolve * 0.45) * entrance);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(leftX, topY, minDim * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = rgba(line, 0.8 * entrance);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightX, topY, minDim * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = rgba(line, 0.8 * entrance);
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
      const d = dist();
      if (!pinchRef.current.active) {
        pinchRef.current = { active: true, startDist: d, startGap: stateRef.current.gap };
        callbacksRef.current.onHaptic('drag_snap');
        return;
      }
      const next = clamp(pinchRef.current.startGap - ((pinchRef.current.startDist - d) / viewport.width) * 0.9, 0.08, 0.42);
      stateRef.current.gap = next;
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
