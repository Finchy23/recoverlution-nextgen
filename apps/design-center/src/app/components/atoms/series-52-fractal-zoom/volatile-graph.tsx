import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  parseColor,
  px,
  rgba,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.97;
const PINCH_SPAN = 0.34;

type Point = { x: number; y: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export default function VolatileGraphAtom({
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
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    pointers: {} as Record<number, Point>,
    pinchBaseline: 0,
    targetReveal: 0,
    reveal: 0,
    shimmer: 0,
    thresholdFired: false,
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
      const { w, h, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.58, h * 0.42, w, h, minDim, s.primaryRgb, entrance);
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
      s.shimmer += 0.014;
      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
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
      const deep = lerpColor([4, 6, 10], primary, 0.1);
      const line = lerpColor(primary, [243, 247, 255], 0.88);
      const crash = lerpColor([255, 78, 86], accent, 0.14);
      const grid = lerpColor(primary, accent, 0.24);

      ctx.fillStyle = rgba(deep, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);

      const baseY = h * 0.68;
      for (let i = 0; i < 7; i += 1) {
        const y = h * (0.16 + i * 0.1);
        ctx.beginPath();
        ctx.moveTo(w * 0.1, y);
        ctx.lineTo(w * 0.9, y);
        ctx.strokeStyle = rgba(grid, (0.08 + reveal * 0.12) * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(w * 0.12, baseY - minDim * 0.02);
      ctx.lineTo(w * 0.46, baseY - minDim * 0.01);
      ctx.lineTo(w * 0.58, baseY + minDim * (0.16 * (1 - reveal)));
      ctx.lineTo(w * 0.72, baseY - minDim * (0.18 * reveal + 0.01));
      ctx.lineTo(w * 0.88, baseY - minDim * (0.22 * reveal + 0.03));
      ctx.strokeStyle = rgba(lerpColor(crash, line, reveal), (0.36 + reveal * 0.48) * entrance);
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      const longTrend = [] as Array<[number, number]>;
      for (let i = 0; i <= 11; i += 1) {
        const t = i / 11;
        const x = w * (0.1 + t * 0.8);
        const y = baseY - minDim * (0.02 + t * 0.26) - Math.sin(s.shimmer * 2 + i) * minDim * 0.008 * (1 - reveal);
        longTrend.push([x, y]);
      }
      ctx.beginPath();
      longTrend.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = rgba(line, reveal * 0.84 * entrance);
      ctx.lineWidth = px(0.008, minDim);
      ctx.stroke();

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
      stateRef.current.pointers[e.pointerId] = getPoint(e);
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!(e.pointerId in stateRef.current.pointers)) return;
      stateRef.current.pointers[e.pointerId] = getPoint(e);
    };
    const onUp = (e: PointerEvent) => {
      delete stateRef.current.pointers[e.pointerId];
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
