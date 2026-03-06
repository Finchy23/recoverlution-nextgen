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
  roundedRect,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function GrandCanyonCarveAtom({
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
  const dragRef = useRef<{ active: boolean; lastAngle: number | null }>({ active: false, lastAngle: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    years: 0,
    completionFired: false,
    steps: [false, false],
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

      const carve = easeOutCubic(clamp(s.years / 1800, 0, 1));
      cb.onStateChange?.(carve);
      if (carve >= 0.35 && !s.steps[0]) {
        s.steps[0] = true;
        cb.onHaptic('step_advance');
      }
      if (carve >= 0.72 && !s.steps[1]) {
        s.steps[1] = true;
        cb.onHaptic('step_advance');
      }
      if (carve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      const earth = lerpColor([92, 70, 48], s.primaryRgb, 0.1);
      const deep = lerpColor([62, 36, 24], s.accentRgb, 0.14);
      const stream = lerpColor([84, 192, 255], s.accentRgb, 0.48);
      const rim = lerpColor([248, 210, 168], s.primaryRgb, 0.24);

      ctx.fillStyle = rgba(earth, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      roundedRect(ctx, w * 0.12, h * 0.14, w * 0.76, h * 0.54, minDim * 0.05);
      ctx.fillStyle = rgba(lerpColor(earth, rim, 0.1), 0.94 * entrance);
      ctx.fill();

      const canyonDepth = minDim * 0.24 * carve;
      ctx.beginPath();
      ctx.moveTo(w * 0.26, h * 0.2);
      ctx.bezierCurveTo(w * 0.34, h * 0.34, w * 0.44, h * 0.54, w * 0.5, h * (0.28 + carve * 0.12));
      ctx.bezierCurveTo(w * 0.58, h * 0.44, w * 0.66, h * 0.6, w * 0.76, h * 0.64);
      ctx.lineTo(w * 0.76, h * 0.64 + canyonDepth);
      ctx.bezierCurveTo(w * 0.66, h * 0.54 + canyonDepth, w * 0.58, h * 0.38 + canyonDepth, w * 0.5, h * (0.22 + carve * 0.18) + canyonDepth);
      ctx.bezierCurveTo(w * 0.42, h * 0.46 + canyonDepth, w * 0.34, h * 0.42 + canyonDepth, w * 0.26, h * 0.2 + canyonDepth);
      ctx.closePath();
      ctx.fillStyle = rgba(deep, (0.12 + carve * 0.64) * entrance);
      ctx.fill();

      ctx.strokeStyle = rgba(stream, (0.3 + carve * 0.4) * entrance);
      ctx.lineWidth = px(0.01 + carve * 0.012, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.24, h * 0.18);
      ctx.bezierCurveTo(w * 0.34, h * 0.32, w * 0.42, h * 0.56, w * 0.52, h * (0.3 + carve * 0.16));
      ctx.bezierCurveTo(w * 0.6, h * 0.5, w * 0.68, h * 0.56, w * 0.78, h * 0.64);
      ctx.stroke();

      const dialCx = cx;
      const dialCy = h * 0.84;
      const dialR = minDim * 0.12;
      ctx.beginPath();
      ctx.arc(dialCx, dialCy, dialR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor([24, 24, 28], s.primaryRgb, 0.12), 0.78 * entrance);
      ctx.fill();
      ctx.strokeStyle = rgba(rim, 0.4 * entrance);
      ctx.lineWidth = px(0.008, minDim);
      ctx.stroke();
      const angle = carve * Math.PI * 3.5 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(dialCx, dialCy);
      ctx.lineTo(dialCx + Math.cos(angle) * dialR * 0.8, dialCy + Math.sin(angle) * dialR * 0.8);
      ctx.strokeStyle = rgba(rim, 0.9 * entrance);
      ctx.lineWidth = px(0.01, minDim);
      ctx.stroke();

      ctx.fillStyle = rgba(rim, 0.18 * entrance);
      ctx.font = `${px(0.022, minDim)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(s.years)} kyr`, cx, h * 0.95);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getAngle = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      const y = ((e.clientY - rect.top) / rect.height) * viewport.height;
      const dx = x - viewport.width / 2;
      const dy = y - viewport.height * 0.84;
      return Math.atan2(dy, dx);
    };

    const onDown = (e: PointerEvent) => {
      dragRef.current = { active: true, lastAngle: getAngle(e) };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || dragRef.current.lastAngle == null) return;
      const angle = getAngle(e);
      let delta = angle - dragRef.current.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      stateRef.current.years = clamp(stateRef.current.years + Math.abs(delta) * 220, 0, 1800);
      callbacksRef.current.onHaptic('drag_snap');
      dragRef.current.lastAngle = angle;
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, lastAngle: null };
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
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
