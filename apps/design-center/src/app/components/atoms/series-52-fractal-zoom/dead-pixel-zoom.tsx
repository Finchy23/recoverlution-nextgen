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

export default function DeadPixelZoomAtom({
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
      s.shimmer += 0.018;
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
      const voidColor = lerpColor([4, 6, 10], primary, 0.1);
      const pixel = lerpColor([255, 72, 72], accent, 0.16);
      const weaveA = lerpColor(primary, [245, 247, 255], 0.68);
      const weaveB = lerpColor(accent, [252, 214, 154], 0.46);

      ctx.fillStyle = rgba(voidColor, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);

      const cols = 12;
      const rows = 18;
      const cellW = w / cols;
      const cellH = h / rows;
      const tapestryAlpha = (0.08 + reveal * 0.56) * entrance;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const mix = ((x + y) % 4) / 3;
          const tone = lerpColor(weaveA, weaveB, mix);
          const pulse = 0.75 + 0.25 * Math.sin(s.shimmer * 3 + x * 0.5 + y * 0.4);
          ctx.fillStyle = rgba(tone, tapestryAlpha * pulse);
          ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
        }
      }

      const maxSize = minDim * 0.72;
      const minSize = minDim * 0.02;
      const pixelSize = maxSize + (minSize - maxSize) * reveal;
      const jitter = (1 - reveal) * minDim * 0.012 * Math.sin(s.shimmer * 10);
      ctx.fillStyle = rgba(pixel, (0.4 + (1 - reveal) * 0.56) * entrance);
      ctx.fillRect(cx - pixelSize * 0.5 + jitter, cy - pixelSize * 0.5 - jitter, pixelSize, pixelSize);

      if (reveal > 0.2) {
        ctx.strokeStyle = rgba(weaveA, (reveal * 0.28) * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.strokeRect(cx - pixelSize * 0.5, cy - pixelSize * 0.5, pixelSize, pixelSize);
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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
