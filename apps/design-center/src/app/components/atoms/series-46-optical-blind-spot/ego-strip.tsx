import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor,
  lerpColor,
  rgba,
  easeOutCubic,
  setupCanvas,
  advanceEntrance,
  drawAtmosphere,
  px,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.5;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function EgoStripAtom({
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
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    charge: 0,
    burst: 0,
    holding: false,
    origin: null as Point | null,
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
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (s.holding || p.phase === 'resolve') s.charge = Math.min(1, s.charge + 0.02);
      else s.charge = Math.max(0, s.charge - 0.012);
      s.burst += ((s.charge > 0.72 ? 1 : 0) - s.burst) * 0.12;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02);

      const reveal = easeOutCubic(clamp(s.burst, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.76;
        cb.onHaptic('swipe_commit');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([4, 6, 12], primary, 0.1);
      const armor = lerpColor(accent, [255, 158, 118], 0.44);
      const core = lerpColor(primary, [246, 248, 255], 0.96);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.88);
      bg.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.18) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        const radius = minDim * (0.08 + t * 0.035 + (1 - reveal) * 0.12);
        const scatter = reveal * minDim * (0.04 + t * 0.1);
        ctx.beginPath();
        ctx.arc(cx + scatter * Math.cos(t * Math.PI * 6), cy + scatter * Math.sin(t * Math.PI * 6), radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(armor, Math.min(0.72, (0.12 + (1 - reveal) * 0.42) * entrance * boost * (1 - t * 0.06)));
        ctx.lineWidth = px(0.006 - t * 0.0003, minDim);
        ctx.stroke();
      }

      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.24);
      coreGlow.addColorStop(0, rgba(core, (0.08 + reveal * 0.28 + s.revealFlash * 0.08) * entrance));
      coreGlow.addColorStop(1, rgba(core, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - minDim * 0.24, cy - minDim * 0.24, minDim * 0.48, minDim * 0.48);

      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.028 * (1 + breathAmplitude * 0.03), 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, Math.min(0.96, (0.12 + reveal * 0.8) * entrance * boost));
      ctx.fill();

      if (s.holding) {
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * (0.14 + s.charge * 0.08), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(core, Math.min(0.34, (0.08 + s.charge * 0.18) * entrance * boost));
        ctx.lineWidth = px(0.004, minDim);
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
      const point = getPoint(e);
      stateRef.current.origin = point;
      stateRef.current.holding = Math.hypot(point.x - viewport.width * 0.5, point.y - viewport.height * 0.5) < Math.min(viewport.width, viewport.height) * 0.18;
      if (stateRef.current.holding) {
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.holding || !s.origin) return;
      const point = getPoint(e);
      const drag = Math.hypot(point.x - s.origin.x, point.y - s.origin.y);
      if (drag > Math.min(viewport.width, viewport.height) * 0.18) s.charge = Math.max(s.charge, 0.82);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      stateRef.current.origin = null;
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
