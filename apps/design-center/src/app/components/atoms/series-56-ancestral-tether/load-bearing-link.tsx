import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function LoadBearingLinkAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const dragRef = useRef<{ active: boolean; last: Point | null }>({ active: false, last: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    left: 0,
    right: 0,
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
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const left = easeOutCubic(s.left);
      const right = easeOutCubic(s.right);
      const resolve = Math.min(1, (left + right) * 0.5);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const base = lerpColor([16, 16, 22], s.primaryRgb, 0.18);
      const line = lerpColor([180, 210, 244], s.primaryRgb, 0.28);
      const anchor = lerpColor([218, 188, 136], s.accentRgb, 0.24);
      const core = lerpColor([242, 248, 255], s.primaryRgb, 0.5);

      ctx.fillStyle = rgba(base, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const leftAx = w * 0.12;
      const rightAx = w * 0.88;
      const y = cy;

      ctx.strokeStyle = rgba(line, (0.2 + resolve * 0.5) * entrance);
      ctx.lineWidth = px(0.008 + resolve * 0.004, minDim);
      if (left > 0.01) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx - (cx - leftAx) * left, y);
        ctx.stroke();
      }
      if (right > 0.01) {
        ctx.beginPath();
        ctx.moveTo(cx, y);
        ctx.lineTo(cx + (rightAx - cx) * right, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(leftAx, y, minDim * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = rgba(anchor, (0.12 + left * 0.7) * entrance);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightAx, y, minDim * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = rgba(anchor, (0.12 + right * 0.7) * entrance);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, y, minDim * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.18 + resolve * 0.55) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const pt = getPoint(e);
      const dx = pt.x - dragRef.current.last.x;
      if (dx < 0) stateRef.current.left = clamp(stateRef.current.left + Math.abs(dx) / viewport.width * 1.6, 0, 1);
      if (dx > 0) stateRef.current.right = clamp(stateRef.current.right + Math.abs(dx) / viewport.width * 1.6, 0, 1);
      if (stateRef.current.left >= 1 || stateRef.current.right >= 1) callbacksRef.current.onHaptic('drag_snap');
      dragRef.current.last = pt;
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, last: null };
      canvas.releasePointerCapture(e.pointerId);
      if (stateRef.current.left >= 1 && stateRef.current.right >= 1) callbacksRef.current.onHaptic('swipe_commit');
    };

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
