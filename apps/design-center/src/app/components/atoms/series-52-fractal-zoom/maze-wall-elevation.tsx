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
const STEP_T = 0.44;
const COMPLETE_T = 0.965;

export default function MazeWallElevationAtom({
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
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    elevation: 0.08,
    dragging: false,
    thresholdFired: false,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
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
      if (!s.dragging && p.phase === 'resolve') s.elevation += (0.94 - s.elevation) * 0.08;

      const reveal = easeOutCubic(clamp((s.elevation - 0.08) / 0.86, 0, 1));
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
      const deep = lerpColor([4, 5, 10], primary, 0.1);
      const wall = lerpColor(accent, [132, 145, 166], 0.22);
      const path = lerpColor(primary, [246, 248, 255], 0.92);
      ctx.fillStyle = rgba(deep, 0.96 * entrance);
      ctx.fillRect(0, 0, w, h);

      const wallAlpha = (0.22 + (1 - reveal) * 0.46) * entrance;
      roundedRect(ctx, w * 0.18, h * (0.22 - reveal * 0.08), w * 0.64, h * (0.56 - reveal * 0.18), minDim * 0.02);
      ctx.fillStyle = rgba(wall, wallAlpha);
      ctx.fill();

      const gridY = h * (0.24 + reveal * 0.06);
      const mazeAlpha = reveal * 0.7 * entrance;
      for (let i = 0; i < 5; i += 1) {
        const y = gridY + i * minDim * 0.08;
        ctx.beginPath();
        ctx.moveTo(w * 0.24, y);
        ctx.lineTo(w * 0.76, y);
        ctx.strokeStyle = rgba(wall, mazeAlpha);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }
      for (let i = 0; i < 6; i += 1) {
        const x = w * 0.24 + i * w * 0.086;
        ctx.beginPath();
        ctx.moveTo(x, gridY);
        ctx.lineTo(x, gridY + minDim * 0.32);
        ctx.strokeStyle = rgba(wall, mazeAlpha * (i % 2 === 0 ? 1 : 0.65));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      if (reveal > 0.15) {
        ctx.beginPath();
        ctx.moveTo(w * 0.28, gridY + minDim * 0.26);
        ctx.lineTo(w * 0.28, gridY + minDim * 0.08);
        ctx.lineTo(w * 0.52, gridY + minDim * 0.08);
        ctx.lineTo(w * 0.52, gridY + minDim * 0.2);
        ctx.lineTo(w * 0.72, gridY + minDim * 0.2);
        ctx.strokeStyle = rgba(path, reveal * 0.9 * entrance);
        ctx.lineWidth = px(0.008, minDim);
        ctx.stroke();
      }

      const sliderY = h * 0.84;
      ctx.beginPath();
      ctx.moveTo(w * 0.24, sliderY);
      ctx.lineTo(w * 0.76, sliderY);
      ctx.strokeStyle = rgba(path, 0.22 * entrance);
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      const knobX = w * (0.24 + s.elevation * 0.52);
      ctx.beginPath();
      ctx.arc(knobX, sliderY, minDim * 0.028, 0, Math.PI * 2);
      ctx.fillStyle = rgba(path, (0.24 + reveal * 0.56) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getProgress = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * viewport.width;
      return clamp((x / viewport.width - 0.24) / 0.52, 0.08, 0.94);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.elevation = getProgress(e);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.elevation = getProgress(e);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
