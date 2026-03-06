import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, easeOutCubic, lerpColor, parseColor, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const HOLD_MS = 4000;
const STEP_T = 0.48;
const COMPLETE_T = 0.985;

type Point = { x: number; y: number };

export default function VoidDeprivationAtom({
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ reducedMotion, phase, color, accentColor });
  const holdRef = useRef<{ active: boolean; point: Point | null; startedAt: number | null }>({
    active: false,
    point: null,
    startedAt: null,
  });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    reveal: 0,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
  useEffect(() => {
    propsRef.current = { reducedMotion, phase, color, accentColor };
  }, [reducedMotion, phase, color, accentColor]);
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

      if (holdRef.current.active && holdRef.current.startedAt !== null) {
        const elapsed = performance.now() - holdRef.current.startedAt;
        s.reveal = clamp(elapsed / HOLD_MS, 0, 1);
      } else if (p.phase === 'resolve') {
        s.reveal += (1 - s.reveal) * 0.05;
      }

      const reveal = easeOutCubic(s.reveal);
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

      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, 0.96 * entrance)})`;
      ctx.fillRect(0, 0, w, h);

      const pt = holdRef.current.point ?? { x: w * 0.5, y: h * 0.54 };
      const warm = lerpColor(s.accentRgb, [255, 212, 176], 0.72);
      const soul = lerpColor(s.primaryRgb, [248, 250, 255], 0.88);
      const glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, minDim * (0.08 + reveal * 0.26));
      glow.addColorStop(0, rgba(soul, (0.06 + reveal * 0.74) * entrance));
      glow.addColorStop(0.45, rgba(warm, (0.03 + reveal * 0.42) * entrance));
      glow.addColorStop(1, rgba(warm, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(pt.x - minDim * 0.28, pt.y - minDim * 0.28, minDim * 0.56, minDim * 0.56);

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, minDim * (0.012 + reveal * 0.028), 0, Math.PI * 2);
      ctx.fillStyle = rgba(soul, (0.04 + reveal * 0.88) * entrance);
      ctx.fill();

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
      holdRef.current = { active: true, point: getPoint(e), startedAt: performance.now() };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!holdRef.current.active) return;
      holdRef.current.point = getPoint(e);
    };
    const onUp = (e: PointerEvent) => {
      holdRef.current.active = false;
      holdRef.current.startedAt = null;
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
