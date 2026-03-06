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

export default function GlacialPolishAtom({
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
    polish: 0,
    blockX: viewport.width * 0.18,
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

      const resolved = easeOutCubic(s.polish);
      cb.onStateChange?.(resolved);
      if (resolved >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const rock = lerpColor([56, 58, 62], s.primaryRgb, 0.12);
      const shine = lerpColor([220, 234, 248], s.primaryRgb, 0.44);
      const ice = lerpColor([168, 220, 255], s.accentRgb, 0.45);

      ctx.fillStyle = rgba(rock, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      roundedRect(ctx, w * 0.18, h * 0.24, w * 0.64, h * 0.44, minDim * 0.05);
      const ground = ctx.createLinearGradient(w * 0.18, h * 0.24, w * 0.82, h * 0.68);
      ground.addColorStop(0, rgba(lerpColor(rock, [0, 0, 0], 0.2), 0.95 * entrance));
      ground.addColorStop(1, rgba(lerpColor(rock, shine, resolved * 0.55), 0.96 * entrance));
      ctx.fillStyle = ground;
      ctx.fill();

      for (let i = 0; i < 14; i += 1) {
        const x = w * 0.22 + (i / 13) * w * 0.56;
        const rough = (1 - resolved) * minDim * 0.025;
        ctx.strokeStyle = rgba(lerpColor(rock, [255, 255, 255], 0.18), 0.16 * entrance);
        ctx.lineWidth = px(0.004, minDim);
        ctx.beginPath();
        ctx.moveTo(x, h * 0.3);
        ctx.lineTo(x + Math.sin(i * 2.1) * rough, h * 0.62);
        ctx.stroke();
      }

      roundedRect(ctx, s.blockX - minDim * 0.12, h * 0.18, minDim * 0.24, h * 0.56, minDim * 0.03);
      ctx.fillStyle = rgba(ice, 0.76 * entrance);
      ctx.fill();

      ctx.fillStyle = rgba(shine, (0.12 + resolved * 0.32) * entrance);
      ctx.fillRect(w * 0.18, h * 0.24, s.blockX - w * 0.18, h * 0.44);

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
      dragRef.current = { active: true, last: getPoint(e) };
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || !dragRef.current.last) return;
      const pt = getPoint(e);
      const s = stateRef.current;
      const dx = pt.x - dragRef.current.last.x;
      s.blockX = clamp(s.blockX + dx, viewport.width * 0.18, viewport.width * 0.82);
      s.polish = clamp((s.blockX - viewport.width * 0.18) / (viewport.width * 0.64), 0, 1);
      if (Math.abs(dx) > 1.5) callbacksRef.current.onHaptic('drag_snap');
      if (s.polish >= 0.35 && s.polish < 0.38) callbacksRef.current.onHaptic('step_advance');
      if (s.polish >= 0.72 && s.polish < 0.75) callbacksRef.current.onHaptic('step_advance');
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
