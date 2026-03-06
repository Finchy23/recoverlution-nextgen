import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function DopplerShiftApproachAtom({
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
  const dragRef = useRef<{ active: boolean; offsetY: number }>({ active: false, offsetY: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    depth: 0,
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

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.52, w, h, minDim, s.primaryRgb, entrance);

      const resolve = easeOutCubic(s.depth);
      cb.onStateChange?.(resolve);
      if (resolve > 0.28 && resolve < 0.31) cb.onHaptic('step_advance');
      if (resolve > 0.64 && resolve < 0.67) cb.onHaptic('step_advance');
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([10, 12, 18], s.primaryRgb, 0.15);
      const horizon = lerpColor([210, 230, 255], s.primaryRgb, 0.24);
      const speck = lerpColor([248, 218, 156], s.accentRgb, 0.36);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const horizonY = h * 0.22;
      ctx.strokeStyle = rgba(horizon, 0.24 * entrance);
      ctx.lineWidth = px(0.004, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.18, horizonY);
      ctx.lineTo(w * 0.82, horizonY);
      ctx.stroke();

      const y = horizonY + resolve * h * 0.46;
      const r = minDim * (0.006 + resolve * 0.09);
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(cx, y, r * (1 + i * 0.55), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(speck, (0.12 + resolve * 0.18 - i * 0.05) * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, y, r, 0, Math.PI * 2);
      ctx.fillStyle = rgba(speck, (0.4 + resolve * 0.45) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };
    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      const originY = viewport.height * (0.22 + stateRef.current.depth * 0.46);
      if (Math.hypot(pt.x - viewport.width / 2, pt.y - originY) > viewport.height * 0.08) return;
      dragRef.current = { active: true, offsetY: pt.y - originY };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      stateRef.current.depth = clamp((pt.y - dragRef.current.offsetY - viewport.height * 0.22) / (viewport.height * 0.46), 0, 1);
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
