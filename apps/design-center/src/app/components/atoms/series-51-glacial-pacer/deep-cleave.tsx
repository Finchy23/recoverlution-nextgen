import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const HOLD_MS = 5000;
const STEP_T = 0.44;
const COMPLETE_T = 0.985;

type Point = { x: number; y: number };

export default function DeepCleaveAtom({
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
    cleave: 0,
    dustFlash: 0,
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
        const pt = holdRef.current.point;
        const aligned = pt ? Math.abs(pt.x - viewport.width * 0.5) < viewport.width * 0.06 : false;
        if (aligned) {
          s.cleave = clamp((performance.now() - holdRef.current.start) / HOLD_MS, 0, 1);
        }
      } else if (p.phase === 'resolve') {
        s.cleave += (1 - s.cleave) * 0.08;
      }
      s.dustFlash = Math.max(0, s.dustFlash - 0.04);

      const reveal = easeOutCubic(clamp(s.cleave, 0, 1));
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
      const deep = lerpColor([6, 7, 12], primary, 0.12);
      const diamond = lerpColor(primary, [208, 236, 255], 0.76);
      const ember = lerpColor(accent, [255, 220, 188], 0.7);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const offset = reveal * minDim * 0.06;
      ctx.beginPath();
      ctx.moveTo(cx, cy - minDim * 0.14);
      ctx.lineTo(cx + minDim * 0.1 - offset, cy);
      ctx.lineTo(cx, cy + minDim * 0.14);
      ctx.lineTo(cx - minDim * 0.1 - offset, cy);
      ctx.closePath();
      ctx.fillStyle = rgba(diamond, 0.22 * entrance);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + offset, cy - minDim * 0.14);
      ctx.lineTo(cx + minDim * 0.1 + offset, cy);
      ctx.lineTo(cx + offset, cy + minDim * 0.14);
      ctx.lineTo(cx - minDim * 0.1 + offset, cy);
      ctx.closePath();
      ctx.fillStyle = rgba(diamond, (0.22 + reveal * 0.28) * entrance);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy - minDim * 0.17);
      ctx.lineTo(cx, cy + minDim * 0.17);
      ctx.strokeStyle = rgba(ember, (0.08 + reveal * 0.4) * entrance);
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      const sparkCount = Math.round(s.dustFlash * 10);
      for (let i = 0; i < sparkCount; i += 1) {
        const angle = (i / Math.max(1, sparkCount)) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * minDim * 0.08, cy + Math.sin(angle) * minDim * 0.08);
        ctx.strokeStyle = rgba(ember, s.dustFlash * 0.5 * entrance);
        ctx.lineWidth = px(0.0024, minDim);
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
      if (!holdRef.current.active) return;
      const point = getPoint(e);
      holdRef.current.point = point;
      if (Math.abs(point.x - viewport.width * 0.5) > viewport.width * 0.09) {
        stateRef.current.cleave = 0;
        stateRef.current.dustFlash = 1;
        holdRef.current.start = performance.now();
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
