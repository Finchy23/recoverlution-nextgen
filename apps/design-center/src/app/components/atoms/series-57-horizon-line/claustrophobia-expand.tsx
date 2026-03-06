import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function ClaustrophobiaExpandAtom({
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
  const dragRef = useRef<{ active: boolean; startY: number; startOpen: number }>({ active: false, startY: 0, startOpen: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    openness: 0,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { color, accentColor, phase, composed };
  }, [color, accentColor, phase, composed]);
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

      const resolve = easeOutCubic(s.openness);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const base = lerpColor([10, 12, 18], s.primaryRgb, 0.16);
      const grid = lerpColor([105, 134, 180], s.primaryRgb, 0.2);
      const horizon = lerpColor([248, 225, 170], s.accentRgb, 0.36);
      const node = lerpColor([190, 215, 255], s.primaryRgb, 0.35);
      ctx.fillStyle = rgba(base, 0.97 * entrance);
      ctx.fillRect(0, 0, w, h);

      const planeTop = h * (0.18 + resolve * 0.18);
      const planeBottom = h * (0.82 - resolve * 0.22);
      const horizonY = h * (0.74 - resolve * 0.42);
      for (let i = 0; i < 8; i += 1) {
        const t = i / 7;
        const y = planeTop + (planeBottom - planeTop) * t;
        const perspective = 1 - resolve * t * 0.78;
        const lineW = w * (0.72 * perspective + 0.1);
        ctx.strokeStyle = rgba(grid, (0.08 + resolve * 0.18) * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.beginPath();
        ctx.moveTo(cx - lineW / 2, y);
        ctx.lineTo(cx + lineW / 2, y);
        ctx.stroke();
      }
      for (let i = -4; i <= 4; i += 1) {
        const t = (i + 4) / 8;
        const bottomX = w * (0.18 + t * 0.64);
        const topX = cx + (bottomX - cx) * (1 - resolve * 0.82);
        ctx.beginPath();
        ctx.moveTo(bottomX, planeBottom);
        ctx.lineTo(topX, horizonY);
        ctx.stroke();
      }

      ctx.strokeStyle = rgba(horizon, (0.35 + resolve * 0.5) * entrance);
      ctx.lineWidth = px(0.006, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.16, horizonY);
      ctx.lineTo(w * 0.84, horizonY);
      ctx.stroke();

      for (let i = 0; i < 12; i += 1) {
        const band = (i % 6) / 5;
        const x = w * (0.2 + ((i * 0.071 + 0.17) % 0.62));
        const y = planeTop + (planeBottom - planeTop) * (0.12 + band * 0.68);
        const scale = 1 - resolve * 0.74;
        ctx.beginPath();
        ctx.arc(x, y, minDim * (0.015 + band * 0.004) * scale, 0, Math.PI * 2);
        ctx.fillStyle = rgba(node, (0.16 + (1 - band) * 0.25) * entrance);
        ctx.fill();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      dragRef.current = { active: true, startY: pt.y, startOpen: stateRef.current.openness };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      const delta = (dragRef.current.startY - pt.y) / viewport.height;
      const next = clamp(dragRef.current.startOpen + delta * 1.7, 0, 1);
      if (Math.abs(next - stateRef.current.openness) > 0.08) callbacksRef.current.onHaptic('drag_snap');
      stateRef.current.openness = next;
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current.active = false;
      canvas.releasePointerCapture(e.pointerId);
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
