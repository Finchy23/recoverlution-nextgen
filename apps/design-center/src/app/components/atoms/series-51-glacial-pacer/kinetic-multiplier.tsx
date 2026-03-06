import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const HOLD_MS = 4000;
const STEP_T = 0.42;
const COMPLETE_T = 0.985;

type Point = { x: number; y: number; t: number };

export default function KineticMultiplierAtom({
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
  const holdRef = useRef<{ active: boolean; start: number | null; last: Point | null }>({ active: false, start: null, last: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    charge: 0,
    thresholdFired: false,
    completionFired: false,
    resetFlash: 0,
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
      const { w, h, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.56, cy, w, h, minDim, s.primaryRgb, entrance);
      if (holdRef.current.active && holdRef.current.start !== null) {
        const elapsed = performance.now() - holdRef.current.start;
        s.charge = clamp(elapsed / HOLD_MS, 0, 1);
      } else if (p.phase === 'resolve') {
        s.charge += (1 - s.charge) * 0.08;
      }
      s.resetFlash = Math.max(0, s.resetFlash - 0.03);

      const reveal = easeOutCubic(s.charge);
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
      const boulder = lerpColor([62, 72, 88], accent, 0.18);
      const push = lerpColor(accent, [255, 214, 186], 0.72);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const trackY = cy + minDim * 0.08;
      ctx.fillStyle = rgba(boulder, 0.16 * entrance);
      ctx.fillRect(w * 0.14, trackY, w * 0.72, minDim * 0.018);

      const boulderX = w * (0.68 + reveal * 0.12);
      roundedRect(ctx, boulderX - minDim * 0.18, cy - minDim * 0.16, minDim * 0.36, minDim * 0.32, minDim * 0.04);
      ctx.fillStyle = rgba(boulder, (0.22 + reveal * 0.28) * entrance);
      ctx.fill();

      const pusherX = w * 0.28;
      roundedRect(ctx, pusherX - minDim * 0.045, cy - minDim * 0.08, minDim * 0.09, minDim * 0.16, minDim * 0.02);
      ctx.fillStyle = rgba(push, (0.14 + reveal * 0.5 + s.resetFlash * 0.16) * entrance);
      ctx.fill();

      const wave = ctx.createLinearGradient(pusherX, 0, boulderX, 0);
      wave.addColorStop(0, rgba(push, 0));
      wave.addColorStop(1, rgba(push, (0.04 + reveal * 0.18) * entrance));
      ctx.fillStyle = wave;
      ctx.fillRect(pusherX, cy - minDim * 0.06, boulderX - pusherX, minDim * 0.12);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
        t: performance.now(),
      };
    };

    const onDown = (e: PointerEvent) => {
      holdRef.current = { active: true, start: performance.now(), last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!holdRef.current.active || !holdRef.current.last) return;
      const next = getPoint(e);
      const prev = holdRef.current.last;
      const dx = Math.abs(next.x - prev.x);
      const dt = Math.max(16, next.t - prev.t);
      const speed = dx / dt;
      if (speed > 1.2) {
        holdRef.current.start = performance.now();
        stateRef.current.charge = 0;
        stateRef.current.resetFlash = 1;
      }
      holdRef.current.last = next;
    };
    const onUp = (e: PointerEvent) => {
      holdRef.current = { active: false, start: null, last: null };
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
