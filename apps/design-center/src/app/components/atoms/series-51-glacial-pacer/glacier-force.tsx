import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.99;

type Point = { x: number; y: number; t: number };

export default function GlacierForceAtom({
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
  const dragRef = useRef<{ active: boolean; last: Point | null }>({ active: false, last: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    crush: 0,
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
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.4, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.crush += (1 - s.crush) * 0.08;
      s.errorFlash = Math.max(0, s.errorFlash - 0.04);

      const reveal = easeOutCubic(clamp(s.crush, 0, 1));
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
      const deep = lerpColor([6, 8, 12], primary, 0.12);
      const ice = lerpColor(primary, [224, 244, 255], 0.82);
      const dust = lerpColor(accent, [230, 214, 186], 0.52);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 9; i += 1) {
        const x = w * 0.14 + i * w * 0.08;
        const peak = minDim * (0.08 + (i % 3) * 0.05) * (1 - reveal);
        ctx.beginPath();
        ctx.moveTo(x, h * 0.82);
        ctx.lineTo(x + w * 0.04, h * 0.82 - peak);
        ctx.lineTo(x + w * 0.08, h * 0.82);
        ctx.closePath();
        ctx.fillStyle = rgba(dust, (0.16 + (1 - reveal) * 0.34) * entrance);
        ctx.fill();
      }

      const glacierY = h * (0.16 + reveal * 0.56);
      roundedRect(ctx, w * 0.12, glacierY, w * 0.76, minDim * 0.16, minDim * 0.03);
      ctx.fillStyle = rgba(ice, (0.2 + reveal * 0.5) * entrance);
      ctx.fill();
      ctx.fillStyle = rgba(ice, 0.18 * entrance);
      ctx.fillRect(w * 0.14, glacierY + minDim * 0.05, w * 0.72, minDim * 0.012);

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
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const next = getPoint(e);
      const prev = dragRef.current.last;
      const dy = next.y - prev.y;
      const dt = Math.max(16, next.t - prev.t);
      const speed = Math.abs(dy) / dt;
      if (speed > 0.9) {
        stateRef.current.errorFlash = 1;
      } else if (dy > 0) {
        stateRef.current.crush = clamp(stateRef.current.crush + (dy / viewport.height) * 1.8, 0, 1);
      }
      dragRef.current.last = next;
    };
    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, last: null };
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
