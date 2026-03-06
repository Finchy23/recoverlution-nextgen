import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function CompostGrindAtom({
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
  const dragRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({ active: false, offsetX: 0, offsetY: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    x: 0.34,
    y: 0.52,
    grind: 0,
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
      const { w, h, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.5, h * 0.58, w, h, minDim, s.primaryRgb, entrance);

      const resolve = easeOutCubic(s.grind);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([14, 12, 16], s.primaryRgb, 0.15);
      const wreck = lerpColor([146, 120, 108], s.accentRgb, 0.1);
      const soil = lerpColor([80, 62, 44], s.accentRgb, 0.08);
      const grinder = lerpColor([198, 220, 255], s.primaryRgb, 0.26);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      roundedRect(ctx, w * 0.68, h * 0.44, w * 0.16, h * 0.18, minDim * 0.03);
      ctx.fillStyle = rgba(grinder, 0.28 * entrance);
      ctx.fill();
      ctx.fillStyle = rgba(soil, (0.12 + resolve * 0.66) * entrance);
      ctx.fillRect(w * 0.2, h * 0.82, w * 0.6, h * 0.08);

      const blockW = w * 0.12 * (1 - resolve * 0.8);
      const blockH = h * 0.14 * (1 - resolve * 0.7);
      roundedRect(ctx, w * s.x - blockW / 2, h * s.y - blockH / 2, blockW, blockH, minDim * 0.018);
      ctx.fillStyle = rgba(wreck, (0.3 + (1 - resolve) * 0.5) * entrance);
      ctx.fill();

      if (resolve > 0.08) {
        for (let i = 0; i < 24; i += 1) {
          const x = w * 0.74 + ((i % 6) - 2.5) * minDim * 0.03;
          const y = h * (0.68 + Math.floor(i / 6) * 0.03 + resolve * 0.16);
          ctx.beginPath();
          ctx.arc(x, y, minDim * 0.004, 0, Math.PI * 2);
          ctx.fillStyle = rgba(soil, (0.12 + resolve * 0.4) * entrance);
          ctx.fill();
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };
    const onDown = (e: PointerEvent) => {
      const pt = getPoint(e);
      dragRef.current = { active: true, offsetX: pt.x - viewport.width * stateRef.current.x, offsetY: pt.y - viewport.height * stateRef.current.y };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      stateRef.current.x = clamp((pt.x - dragRef.current.offsetX) / viewport.width, 0.18, 0.76);
      stateRef.current.y = clamp((pt.y - dragRef.current.offsetY) / viewport.height, 0.22, 0.64);
      if (stateRef.current.x > 0.64) stateRef.current.grind = clamp(stateRef.current.grind + 0.08, 0, 1);
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
