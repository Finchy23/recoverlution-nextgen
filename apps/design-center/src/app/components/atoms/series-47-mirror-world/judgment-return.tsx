import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  advanceEntrance,
  drawAtmosphere,
  easeOutCubic,
  lerpColor,
  motionScale,
  parseColor,
  px,
  rgba,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function JudgmentReturnAtom({
  breathAmplitude,
  reducedMotion,
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
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  const dragRef = useRef({ holding: false, start: null as Point | null, dragging: false });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    dissolve: 0,
    boomerang: 0,
    errorCooldown: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
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
      const ms = motionScale(p.reducedMotion);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (dragRef.current.holding || p.phase === 'resolve') s.dissolve += (1 - s.dissolve) * 0.08 * ms;
      else s.dissolve *= 0.92;
      if (dragRef.current.dragging) s.boomerang += (1 - s.boomerang) * 0.18 * ms;
      else s.boomerang *= 0.88;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(Math.max(s.dissolve, s.boomerang * 0.2), 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('hold_start');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.18);
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const ember = lerpColor(accent, [255, 110, 102], 0.52);
      const calm = lerpColor(primary, [246, 248, 255], 0.92);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const pathT = dragRef.current.dragging ? easeOutCubic(clamp(s.boomerang, 0, 1)) : 0;
      const particleX = cx + (w * 0.28 - cx) * pathT;
      const particleY = cy - minDim * 0.12 * Math.sin(pathT * Math.PI);
      ctx.beginPath();
      ctx.arc(particleX, particleY, minDim * 0.028 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(ember, calm, s.dissolve), Math.min(0.94, (0.2 + (1 - s.dissolve) * 0.42 + s.dissolve * 0.22) * entrance * boost));
      ctx.fill();

      if (dragRef.current.dragging && s.errorCooldown === 0) {
        s.errorCooldown = 18;
        callbacksRef.current.onHaptic('error_boundary');
      }

      if (dragRef.current.dragging) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(particleX, particleY);
        ctx.strokeStyle = rgba(ember, Math.min(0.28, (0.08 + s.boomerang * 0.18) * entrance * boost));
        ctx.lineWidth = px(0.006, minDim);
        ctx.stroke();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const point = getPoint(e);
      const cx = viewport.width * 0.5;
      const cy = viewport.height * 0.5;
      if (Math.hypot(point.x - cx, point.y - cy) < Math.min(viewport.width, viewport.height) * 0.1) {
        dragRef.current.holding = true;
        dragRef.current.start = point;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.holding || !dragRef.current.start) return;
      const point = getPoint(e);
      const drag = Math.hypot(point.x - dragRef.current.start.x, point.y - dragRef.current.start.y);
      if (drag > Math.min(viewport.width, viewport.height) * 0.1) {
        dragRef.current.dragging = true;
        dragRef.current.holding = false;
      }
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current.holding = false;
      dragRef.current.dragging = false;
      dragRef.current.start = null;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
