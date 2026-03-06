import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.985;

type Point = { x: number; y: number };

export default function TaprootDepthAtom({
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
  const holdRef = useRef<{ active: boolean; start: number | null }>({ active: false, start: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    depth: 0,
    brittleFlash: 0,
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
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.52, w, h, minDim, s.primaryRgb, entrance);
      if (holdRef.current.active && holdRef.current.start !== null) {
        s.depth = clamp((performance.now() - holdRef.current.start) / 8000, 0, 1);
      } else if (p.phase === 'resolve') {
        s.depth += (1 - s.depth) * 0.08;
      }
      s.brittleFlash = Math.max(0, s.brittleFlash - 0.04);

      const reveal = easeOutCubic(clamp(s.depth, 0, 1));
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
      const soil = lerpColor([18, 12, 10], accent, 0.1);
      const root = lerpColor(accent, [196, 154, 112], 0.46);
      const seed = lerpColor(primary, [244, 248, 255], 0.92);
      ctx.fillStyle = rgba(soil, 0.94 * entrance);
      ctx.fillRect(0, 0, w, h);

      const seedY = h * 0.28;
      ctx.beginPath();
      ctx.arc(cx, seedY, minDim * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = rgba(seed, (0.2 + reveal * 0.6) * entrance);
      ctx.fill();

      for (let i = -3; i <= 3; i += 1) {
        const spread = i / 3;
        const branchLen = minDim * 0.11 * (1 - reveal);
        ctx.beginPath();
        ctx.moveTo(cx, seedY + minDim * 0.02);
        ctx.lineTo(cx + spread * branchLen, seedY + minDim * 0.06 + Math.abs(spread) * minDim * 0.05);
        ctx.strokeStyle = rgba(root, (0.08 + (1 - reveal) * 0.18 + s.brittleFlash * 0.12) * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(cx, seedY + minDim * 0.02);
      ctx.lineTo(cx, seedY + minDim * (0.08 + reveal * 0.54));
      ctx.strokeStyle = rgba(root, (0.12 + reveal * 0.42) * entrance);
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      holdRef.current = { active: true, start: performance.now() };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      if (!holdRef.current.active) return;
      holdRef.current = { active: false, start: null };
      if (stateRef.current.depth < 0.14) {
        stateRef.current.brittleFlash = 1;
        callbacksRef.current.onHaptic('error_boundary');
      }
      canvas.releasePointerCapture(e.pointerId);
    };
    const onTap = () => {
      if (!holdRef.current.active) {
        stateRef.current.brittleFlash = 1;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('click', onTap);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('click', onTap);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
