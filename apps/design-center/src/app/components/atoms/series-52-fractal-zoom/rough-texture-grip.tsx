import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.97;
const PINCH_SPAN = 0.34;

type Point = { x: number; y: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export default function RoughTextureGripAtom({ color, accentColor, viewport, phase, composed, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const stateRef = useRef({ entranceProgress: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), pointers: {} as Record<number, Point>, pinchBaseline: 0, targetReveal: 0, reveal: 0, drift: 0, thresholdFired: false, completionFired: false });

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

      s.reveal += (s.targetReveal - s.reveal) * 0.11;
      s.drift += 0.022;
      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) { s.thresholdFired = true; cb.onHaptic('step_advance'); }
      if (reveal >= COMPLETE_T && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([4, 6, 10], primary, 0.1);
      const spike = lerpColor(accent, [235, 210, 168], 0.45);
      const rubber = lerpColor(primary, [245, 247, 255], 0.8);
      ctx.fillStyle = rgba(deep, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 18; i += 1) {
        const x = w * (0.08 + (i / 17) * 0.84);
        const height = minDim * (0.1 * (1 - reveal) + 0.012);
        ctx.beginPath();
        ctx.moveTo(x, cy + minDim * 0.18);
        ctx.lineTo(x + minDim * 0.014, cy + minDim * 0.18 - height);
        ctx.lineTo(x + minDim * 0.028, cy + minDim * 0.18);
        ctx.closePath();
        ctx.fillStyle = rgba(spike, (0.14 + (1 - reveal) * 0.34) * entrance);
        ctx.fill();
      }

      const wheelY = cy + minDim * 0.14;
      ctx.beginPath();
      ctx.arc(cx, wheelY, minDim * (0.1 + reveal * 0.12), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(rubber, reveal * 0.82 * entrance);
      ctx.lineWidth = px(0.024, minDim);
      ctx.stroke();

      for (let i = 0; i < 12; i += 1) {
        const angle = s.drift + (i / 12) * Math.PI * 2;
        const r = minDim * (0.1 + reveal * 0.12);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r * 0.72, wheelY + Math.sin(angle) * r * 0.72);
        ctx.lineTo(cx + Math.cos(angle) * r, wheelY + Math.sin(angle) * r);
        ctx.strokeStyle = rgba(rubber, reveal * 0.36 * entrance);
        ctx.lineWidth = px(0.006, minDim);
        ctx.stroke();
      }

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
