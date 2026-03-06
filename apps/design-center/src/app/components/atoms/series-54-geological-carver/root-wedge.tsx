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

export default function RootWedgeAtom({
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
  const holdRef = useRef(false);
  const dragRef = useRef<{ active: boolean; offset: Point | null }>({ active: false, offset: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    seed: { x: viewport.width * 0.2, y: viewport.height * 0.8 },
    seated: false,
    growth: 0,
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

    const crackX = viewport.width * 0.5;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (holdRef.current && s.seated) s.growth = clamp(s.growth + 0.012, 0, 1);
      const resolved = easeOutCubic(s.growth);
      cb.onStateChange?.(resolved);
      if (resolved >= 0.35 && resolved < 0.38) cb.onHaptic('step_advance');
      if (resolved >= 0.72 && resolved < 0.75) cb.onHaptic('step_advance');
      if (resolved >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const stone = lerpColor([68, 62, 56], s.primaryRgb, 0.12);
      const dark = lerpColor([26, 24, 22], stone, 0.42);
      const root = lerpColor([104, 214, 116], s.accentRgb, 0.22);
      const split = minDim * 0.13 * Math.max(0, resolved - 0.7) / 0.3;

      roundedRect(ctx, w * 0.18 - split, h * 0.18, w * 0.3, h * 0.64, minDim * 0.03);
      ctx.fillStyle = rgba(stone, 0.97 * entrance);
      ctx.fill();
      roundedRect(ctx, w * 0.52 + split, h * 0.18, w * 0.3, h * 0.64, minDim * 0.03);
      ctx.fill();

      ctx.strokeStyle = rgba(dark, 0.8 * entrance);
      ctx.lineWidth = px(0.007, minDim);
      ctx.beginPath();
      ctx.moveTo(crackX, h * 0.18);
      ctx.lineTo(crackX - minDim * 0.015, h * 0.42);
      ctx.lineTo(crackX + minDim * 0.02, h * 0.66);
      ctx.lineTo(crackX, h * 0.82);
      ctx.stroke();

      if (resolved > 0) {
        ctx.strokeStyle = rgba(root, (0.34 + resolved * 0.52) * entrance);
        ctx.lineWidth = px(0.01 + resolved * 0.004, minDim);
        ctx.beginPath();
        ctx.moveTo(crackX, h * 0.75);
        ctx.lineTo(crackX, h * (0.72 - resolved * 0.36));
        ctx.lineTo(crackX - minDim * 0.08 * resolved, h * (0.6 - resolved * 0.12));
        ctx.moveTo(crackX, h * (0.62 - resolved * 0.14));
        ctx.lineTo(crackX + minDim * 0.09 * resolved, h * (0.52 - resolved * 0.18));
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(s.seed.x, s.seed.y, minDim * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = rgba(root, 0.9 * entrance);
      ctx.fill();

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
      const s = stateRef.current;
      const radius = Math.min(viewport.width, viewport.height) * 0.05;
      if (!s.seated && Math.hypot(pt.x - s.seed.x, pt.y - s.seed.y) <= radius) {
        dragRef.current = { active: true, offset: { x: s.seed.x - pt.x, y: s.seed.y - pt.y } };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (s.seated) {
        holdRef.current = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.offset) return;
      const pt = getPoint(e);
      const s = stateRef.current;
      s.seed = {
        x: pt.x + dragRef.current.offset.x,
        y: pt.y + dragRef.current.offset.y,
      };
      if (Math.abs(s.seed.x - crackX) < viewport.width * 0.03 && s.seed.y > viewport.height * 0.68) {
        s.seated = true;
        s.seed = { x: crackX, y: viewport.height * 0.75 };
        dragRef.current = { active: false, offset: null };
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onUp = (e: PointerEvent) => {
      dragRef.current = { active: false, offset: null };
      holdRef.current = false;
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
