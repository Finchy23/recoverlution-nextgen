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
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
type Point = { x: number; y: number };

export default function OxbowPivotAtom({
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
    path: [] as Point[],
    progress: 0,
    heat: 0,
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

      s.heat *= 0.94;
      const resolved = easeOutCubic(s.progress);
      cb.onStateChange?.(resolved);
      if (resolved >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const terrain = lerpColor([46, 40, 34], s.primaryRgb, 0.08);
      const bank = lerpColor([136, 116, 88], s.accentRgb, 0.16);
      const river = lerpColor([80, 188, 255], s.accentRgb, 0.46);
      const lake = lerpColor([120, 210, 255], s.primaryRgb, 0.34);
      const heat = lerpColor([255, 104, 78], s.accentRgb, 0.16);

      ctx.fillStyle = rgba(terrain, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 4; i += 1) {
        ctx.strokeStyle = rgba(bank, (0.08 + i * 0.025) * entrance);
        ctx.lineWidth = px(0.01 + i * 0.006, minDim);
        ctx.beginPath();
        ctx.moveTo(w * 0.16, h * (0.2 + i * 0.15));
        ctx.lineTo(w * 0.84, h * (0.24 + i * 0.15));
        ctx.stroke();
      }

      if (s.path.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = rgba(river, (0.3 + resolved * 0.55) * entrance);
        ctx.lineWidth = minDim * 0.05;
        ctx.beginPath();
        ctx.moveTo(s.path[0].x, s.path[0].y);
        for (const pt of s.path.slice(1)) ctx.lineTo(pt.x, pt.y);
        ctx.stroke();

        if (resolved > 0.72) {
          ctx.beginPath();
          ctx.ellipse(w * 0.44, h * 0.54, minDim * 0.1, minDim * 0.07, 0.4, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lake, 0.34 * entrance);
          ctx.fill();
        }
      }

      if (s.heat > 0.02) {
        ctx.strokeStyle = rgba(heat, s.heat * 0.4 * entrance);
        ctx.lineWidth = px(0.014, minDim);
        ctx.beginPath();
        ctx.moveTo(w * 0.18, h * 0.5);
        ctx.lineTo(w * 0.82, h * 0.5);
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
      const pt = getPoint(e);
      stateRef.current.path = [pt];
      dragRef.current = { active: true, last: pt };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const pt = getPoint(e);
      const s = stateRef.current;
      const prev = dragRef.current.last;
      s.path.push(pt);
      if (s.path.length > 72) s.path.shift();
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      const dist = Math.hypot(dx, dy);
      const prev2 = s.path[s.path.length - 3];
      let curvature = 0;
      if (prev2) {
        const a1 = Math.atan2(prev.y - prev2.y, prev.x - prev2.x);
        const a2 = Math.atan2(pt.y - prev.y, pt.x - prev.x);
        curvature = Math.abs(a2 - a1);
      }
      if (curvature < 0.08) {
        s.heat = clamp(s.heat + 0.08, 0, 1);
        callbacksRef.current.onHaptic('error_boundary');
      } else {
        s.progress = clamp(s.progress + dist / viewport.width * 0.18 + curvature * 0.03, 0, 1);
        callbacksRef.current.onHaptic('drag_snap');
        if (s.progress >= 0.38 && s.progress < 0.41) callbacksRef.current.onHaptic('step_advance');
        if (s.progress >= 0.74 && s.progress < 0.77) callbacksRef.current.onHaptic('step_advance');
      }
      dragRef.current.last = pt;
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
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
