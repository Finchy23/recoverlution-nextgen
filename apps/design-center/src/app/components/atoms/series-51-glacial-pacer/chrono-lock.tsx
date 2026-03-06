import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const HOLD_MS = 12000;
const STEP_T = 0.44;
const COMPLETE_T = 0.985;

type Point = { x: number; y: number };

export default function ChronoLockAtom({
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
  const holdRef = useRef<{ active: boolean; point: Point | null; start: number | null }>({ active: false, point: null, start: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    unlock: 0,
    errorFlash: 0,
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
      if (holdRef.current.active && holdRef.current.start !== null) {
        s.unlock = clamp((performance.now() - holdRef.current.start) / HOLD_MS, 0, 1);
      } else if (p.phase === 'resolve') {
        s.unlock += (1 - s.unlock) * 0.08;
      }
      s.errorFlash = Math.max(0, s.errorFlash - 0.04);

      const reveal = easeOutCubic(clamp(s.unlock, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('hold_threshold');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([5, 7, 12], primary, 0.12);
      const steel = lerpColor([84, 94, 110], accent, 0.22);
      const warm = lerpColor(accent, [255, 220, 188], 0.72);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      roundedRect(ctx, cx - minDim * 0.22, cy - minDim * 0.2, minDim * 0.44, minDim * 0.4, minDim * 0.04);
      ctx.fillStyle = rgba(steel, (0.2 + reveal * 0.18) * entrance);
      ctx.fill();
      roundedRect(ctx, cx - minDim * 0.07, cy - minDim * 0.07, minDim * 0.14, minDim * 0.14, minDim * 0.03);
      ctx.fillStyle = rgba(warm, (0.06 + reveal * 0.54 + s.errorFlash * 0.14) * entrance);
      ctx.fill();

      const ringCount = 4;
      for (let i = 0; i < ringCount; i += 1) {
        const ring = clamp(reveal - i * 0.18, 0, 1);
        if (ring <= 0) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * (0.06 + ring * 0.12), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warm, (0.06 + ring * 0.14) * entrance);
        ctx.lineWidth = px(0.003, minDim);
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
      holdRef.current = { active: true, point: getPoint(e), start: performance.now() };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!holdRef.current.active || !holdRef.current.point) return;
      const next = getPoint(e);
      if (Math.hypot(next.x - holdRef.current.point.x, next.y - holdRef.current.point.y) > Math.min(viewport.width, viewport.height) * 0.025) {
        holdRef.current.point = next;
        holdRef.current.start = performance.now();
        stateRef.current.unlock = 0;
        stateRef.current.errorFlash = 1;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };
    const onUp = (e: PointerEvent) => {
      holdRef.current = { active: false, point: null, start: null };
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
