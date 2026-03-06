import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.44;
const COMPLETE_T = 0.98;

type Point = { x: number; y: number; t: number };

export default function FrictionBurnAtom({
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
    progress: 0,
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
      const { w, h, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, w * 0.5, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.progress += (1 - s.progress) * 0.08;
      s.errorFlash = Math.max(0, s.errorFlash - 0.04);

      const reveal = easeOutCubic(clamp(s.progress, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([6, 7, 12], primary, 0.1);
      const track = lerpColor([94, 86, 72], accent, 0.18);
      const ember = lerpColor(accent, [255, 174, 108], 0.82);
      const cool = lerpColor(primary, [214, 238, 255], 0.72);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 36; i += 1) {
        const x = w * 0.14 + (i / 35) * w * 0.72;
        ctx.beginPath();
        ctx.moveTo(x, cy - minDim * 0.12);
        ctx.lineTo(x + minDim * 0.01, cy + minDim * 0.12);
        ctx.strokeStyle = rgba(track, 0.18 * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      const nodeX = w * (0.18 + reveal * 0.64);
      ctx.beginPath();
      ctx.arc(nodeX, cy, minDim * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(cool, ember, s.errorFlash), (0.2 + reveal * 0.62) * entrance);
      ctx.fill();

      const sparkCount = Math.round(s.errorFlash * 14);
      for (let i = 0; i < sparkCount; i += 1) {
        const angle = (i / Math.max(1, sparkCount)) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(nodeX, cy);
        ctx.lineTo(nodeX + Math.cos(angle) * minDim * 0.08, cy + Math.sin(angle) * minDim * 0.08);
        ctx.strokeStyle = rgba(ember, s.errorFlash * 0.6 * entrance);
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
        t: performance.now(),
      };
    };
    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const next = getPoint(e);
      const prev = dragRef.current.last;
      const dx = next.x - prev.x;
      const dt = Math.max(16, next.t - prev.t);
      const speed = Math.abs(dx) / dt;
      if (speed > 1.15) {
        stateRef.current.progress = 0;
        stateRef.current.errorFlash = 1;
        callbacksRef.current.onHaptic('error_boundary');
      } else if (dx > 0) {
        stateRef.current.progress = clamp(stateRef.current.progress + (dx / viewport.width) * 2.8, 0, 1);
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
