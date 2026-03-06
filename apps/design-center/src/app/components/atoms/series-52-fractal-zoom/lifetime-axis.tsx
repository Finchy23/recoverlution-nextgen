import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.98;
const PINCH_SPAN = 0.38;

type Point = { x: number; y: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export default function LifetimeAxisAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const stateRef = useRef({ entranceProgress: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), pointers: {} as Record<number, Point>, pinchBaseline: 0, targetReveal: 0, reveal: 0, thresholdFired: false, completionFired: false });

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
      if (p.phase === 'resolve') s.targetReveal = 1;

      const pointerList = Object.values(s.pointers);
      if (pointerList.length >= 2) {
        const d = distance(pointerList[0], pointerList[1]);
        if (s.pinchBaseline === 0) s.pinchBaseline = d;
        s.targetReveal = Math.max(s.targetReveal, clamp((d - s.pinchBaseline) / (minDim * PINCH_SPAN), 0, 1));
      } else {
        s.pinchBaseline = 0;
      }

      s.reveal += (s.targetReveal - s.reveal) * 0.085;
      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) { s.thresholdFired = true; cb.onHaptic('step_advance'); }
      if (reveal >= COMPLETE_T && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([4, 6, 10], primary, 0.1);
      const line = lerpColor(primary, [245, 247, 255], 0.9);
      const hot = lerpColor([255, 94, 72], accent, 0.18);
      ctx.fillStyle = rgba(deep, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const axisY = cy;
      ctx.beginPath();
      ctx.moveTo(w * 0.12, axisY);
      ctx.lineTo(w * 0.88, axisY);
      ctx.strokeStyle = rgba(line, (0.16 + reveal * 0.4) * entrance);
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      const labels = ['TODAY', 'WEEK', 'MONTH', 'YEAR', 'DECADE'];
      labels.forEach((label, i) => {
        const t = i / (labels.length - 1);
        const x = w * (0.18 + t * 0.64);
        const alpha = Math.max(0.08, reveal * (0.24 + i * 0.14));
        ctx.fillStyle = rgba(line, alpha * entrance);
        ctx.font = `${Math.max(10, minDim * (0.018 - reveal * 0.007 + i * 0.001))}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(label, x, axisY - minDim * 0.08);
      });

      const todayX = w * (0.18 + reveal * 0.58);
      const size = minDim * (0.18 - reveal * 0.16);
      ctx.beginPath();
      ctx.arc(todayX, axisY, Math.max(minDim * 0.006, size), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(hot, line, reveal), (0.26 + (1 - reveal) * 0.46) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return { x: ((e.clientX - rect.left) / rect.width) * viewport.width, y: ((e.clientY - rect.top) / rect.height) * viewport.height };
    };
    const onDown = (e: PointerEvent) => { stateRef.current.pointers[e.pointerId] = getPoint(e); canvas.setPointerCapture(e.pointerId); callbacksRef.current.onHaptic('hold_start'); };
    const onMove = (e: PointerEvent) => { if (!(e.pointerId in stateRef.current.pointers)) return; stateRef.current.pointers[e.pointerId] = getPoint(e); };
    const onUp = (e: PointerEvent) => { delete stateRef.current.pointers[e.pointerId]; canvas.releasePointerCapture(e.pointerId); };

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
