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
  roundedRect,
  setupCanvas,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.48;
const COMPLETE_T = 0.965;

export default function PrisonWallMeltAtom({
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
    melt: 0,
    cracks: 0,
    holding: false,
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

      if (s.holding || p.phase === 'resolve') s.melt += (1 - s.melt) * 0.08 * ms;
      else s.melt *= 0.94;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.melt, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('hold_threshold');
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
      const glass = lerpColor(primary, [246, 248, 255], 0.94);
      const warmth = lerpColor(accent, [255, 228, 206], 0.76);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      roundedRect(ctx, w * 0.18, h * 0.18, w * 0.64, h * 0.64, minDim * 0.03);
      ctx.fillStyle = rgba(glass, Math.max(0.08, (0.22 + s.cracks * 0.06) * (1 - reveal) * entrance * boost));
      ctx.fill();
      ctx.strokeStyle = rgba(glass, Math.min(0.42, (0.08 + (1 - reveal) * 0.24) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      for (let i = 0; i < s.cracks; i++) {
        const t = i / Math.max(1, s.cracks);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(t * Math.PI * 2.4) * minDim * 0.26, cy + Math.sin(t * Math.PI * 2.4) * minDim * 0.18);
        ctx.strokeStyle = rgba(glass, Math.min(0.58, (0.12 + s.cracks * 0.04) * (1 - reveal) * entrance * boost));
        ctx.lineWidth = px(0.0026, minDim);
        ctx.stroke();
      }

      const warmthGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.3);
      warmthGlow.addColorStop(0, rgba(warmth, (0.06 + reveal * 0.28 + s.revealFlash * 0.08) * entrance));
      warmthGlow.addColorStop(1, rgba(warmth, 0));
      ctx.fillStyle = warmthGlow;
      ctx.fillRect(cx - minDim * 0.3, cy - minDim * 0.3, minDim * 0.6, minDim * 0.6);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      if (!stateRef.current.holding) stateRef.current.cracks = Math.min(8, stateRef.current.cracks + 1);
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };
    const onTap = () => {
      stateRef.current.cracks = Math.min(8, stateRef.current.cracks + 1);
      callbacksRef.current.onHaptic('tap');
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('click', onTap);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('click', onTap);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
