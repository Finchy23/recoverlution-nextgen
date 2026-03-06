import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function ConfluenceMergeAtom({
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
  const dragRef = useRef<{ active: boolean; last: Point | null }>({ active: false, last: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodeX: 0.32,
    nodeY: 0.2,
    merging: false,
    merge: 0,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
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

      if (s.merging) {
        s.merge = Math.min(1, s.merge + 0.017);
        s.nodeX += (0.5 - s.nodeX) * 0.07;
        s.nodeY += 0.008;
        if (s.merge >= 1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      const resolve = easeOutCubic(s.merge);
      cb.onStateChange?.(resolve);
      const blue = lerpColor([84, 190, 255], s.primaryRgb, 0.24);
      const red = lerpColor([255, 88, 92], s.accentRgb, 0.1);
      const violet = lerpColor(blue, red, 0.52);

      ctx.strokeStyle = rgba(blue, 0.18 * entrance);
      ctx.lineWidth = px(0.018, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.18, 0);
      ctx.quadraticCurveTo(w * 0.34, cy * 0.9, cx, h * 0.56);
      ctx.stroke();

      ctx.strokeStyle = rgba(red, 0.18 * entrance);
      ctx.beginPath();
      ctx.moveTo(w * 0.82, 0);
      ctx.quadraticCurveTo(w * 0.66, cy * 0.9, cx, h * 0.56);
      ctx.stroke();

      if (s.merging) {
        ctx.strokeStyle = rgba(violet, (0.22 + resolve * 0.18) * entrance);
        ctx.lineWidth = px(0.024, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.56);
        ctx.lineTo(cx, h * (0.56 + resolve * 0.38));
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(w * s.nodeX, h * s.nodeY, minDim * 0.038, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.merging ? violet : blue, 0.78 * entrance);
      ctx.fill();

      if (!s.merging) {
        ctx.beginPath();
        ctx.arc(cx, h * 0.56, minDim * 0.075, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(violet, 0.14 * entrance);
        ctx.lineWidth = px(0.008, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };

    const onDown = (e: PointerEvent) => {
      if (stateRef.current.merging) return;
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const s = stateRef.current;
      if (!drag.active || !drag.last || s.merging) return;
      const pt = getPoint(e);
      s.nodeX = clamp(s.nodeX + (pt.x - drag.last.x) / viewport.width, 0.14, 0.86);
      s.nodeY = clamp(s.nodeY + (pt.y - drag.last.y) / viewport.height, 0.12, 0.62);
      drag.last = pt;
      const dx = s.nodeX - 0.5;
      const dy = s.nodeY - 0.56;
      if (Math.sqrt(dx * dx + dy * dy) < 0.09) {
        s.merging = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, last: null };
      canvas.releasePointerCapture(e.pointerId);
      if (stateRef.current.merging) callbacksRef.current.onHaptic('swipe_commit');
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
