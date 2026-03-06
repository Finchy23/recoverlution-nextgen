import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.975;

type Point = { x: number; y: number };

export default function EclipseMergeAtom({
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
  const dragRef = useRef({ active: false });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    sunX: 0.28,
    sunY: 0.5,
    merge: 0,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
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
      if (p.phase === 'resolve') s.merge += (1 - s.merge) * 0.08;

      const shadowX = w * 0.66;
      const shadowY = h * 0.5;
      const sx = w * s.sunX + (shadowX - w * s.sunX) * s.merge;
      const sy = h * s.sunY + (shadowY - h * s.sunY) * s.merge;
      const dist = Math.hypot(sx - shadowX, sy - shadowY);
      const target = clamp(1 - dist / (minDim * 0.18), 0, 1);
      s.merge += (target - s.merge) * 0.14;

      const reveal = easeOutCubic(clamp(s.merge, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.12);
      const sun = lerpColor(accent, [255, 224, 188], 0.86);
      const corona = lerpColor(primary, [255, 244, 198], 0.6);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(shadowX, shadowY, minDim * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = rgba([0, 0, 0], 0.7 * entrance);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, sy, minDim * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = rgba(sun, (0.18 + (1 - reveal) * 0.54) * entrance);
      ctx.fill();

      if (reveal > 0.22) {
        ctx.beginPath();
        ctx.arc(shadowX, shadowY, minDim * (0.12 + reveal * 0.08), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(corona, (0.08 + reveal * 0.5) * entrance);
        ctx.lineWidth = px(0.01, minDim);
        ctx.stroke();
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
      dragRef.current.active = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const pt = getPoint(e);
      stateRef.current.sunX = clamp(pt.x / viewport.width, 0.14, 0.86);
      stateRef.current.sunY = clamp(pt.y / viewport.height, 0.2, 0.8);
      callbacksRef.current.onHaptic('drag_snap');
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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
