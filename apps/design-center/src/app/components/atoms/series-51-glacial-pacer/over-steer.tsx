import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.42;
const COMPLETE_T = 0.98;

type Point = { x: number; y: number; t: number };

export default function OverSteerAtom({
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
    progressY: 0,
    laneX: 0,
    spinout: 0,
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
      if (p.phase === 'resolve') s.progressY += (1 - s.progressY) * 0.08;
      s.spinout = Math.max(0, s.spinout - 0.04);
      s.progressY = clamp(s.progressY + 0.004, 0, 1);

      const reveal = easeOutCubic(clamp(s.progressY, 0, 1));
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
      const deep = lerpColor([5, 7, 12], primary, 0.12);
      const node = lerpColor(primary, [244, 247, 255], 0.92);
      const obstacle = lerpColor(accent, [255, 186, 132], 0.66);
      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rgba(node, 0.1 * entrance);
      ctx.fillRect(cx - minDim * 0.06, h * 0.16, minDim * 0.12, h * 0.68);

      const obstacleY = h * 0.54;
      ctx.beginPath();
      ctx.arc(cx, obstacleY, minDim * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = rgba(obstacle, 0.28 * entrance);
      ctx.fill();

      const nodeY = h * (0.2 + reveal * 0.56);
      const nodeX = cx + s.laneX * minDim * 0.14 + Math.sin(s.spinout * 12) * minDim * 0.06 * s.spinout;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, minDim * 0.032, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.2 + reveal * 0.66) * entrance);
      ctx.fill();

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
      if (speed > 0.9) {
        stateRef.current.spinout = 1;
        callbacksRef.current.onHaptic('error_boundary');
      } else {
        stateRef.current.laneX = clamp(stateRef.current.laneX + dx / viewport.width, -0.45, 0.45);
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
