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
const IGNORE_TARGET = 300;
const STEP_T = 0.44;
const COMPLETE_T = 0.965;

export default function ShadowKnotHealAtom({
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
    ignoreFrames: 0,
    tighten: 0,
    dust: 0,
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

      s.ignoreFrames += 1;
      const ignoreReveal = clamp(s.ignoreFrames / IGNORE_TARGET, 0, 1);
      s.dust += ((p.phase === 'resolve' ? 1 : ignoreReveal) - s.dust) * 0.08 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.dust, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('completion');
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
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const knot = lerpColor(accent, [255, 176, 118], 0.54);
      const dust = lerpColor(primary, [246, 248, 255], 0.9);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const loops = 5 + Math.round(s.tighten * 3);
      for (let i = 0; i < loops; i++) {
        const angle = (i / loops) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * minDim * 0.02, cy + Math.sin(angle) * minDim * 0.02, minDim * (0.04 - reveal * 0.02), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(knot, Math.min(0.68, (0.14 + (1 - reveal) * 0.36) * entrance * boost));
        ctx.lineWidth = px(0.0032, minDim);
        ctx.stroke();
      }

      if (reveal > 0.2) {
        for (let i = 0; i < 18; i++) {
          const t = i / 18;
          const drift = reveal * minDim * 0.18;
          ctx.beginPath();
          ctx.arc(cx + (t - 0.5) * drift * 1.6, cy - drift * 0.3 + Math.sin(t * Math.PI * 2) * drift * 0.18, minDim * 0.006, 0, Math.PI * 2);
          ctx.fillStyle = rgba(dust, Math.min(0.68, (0.08 + reveal * 0.36 + s.revealFlash * 0.04) * entrance * boost));
          ctx.fill();
        }
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onTouch = () => {
      stateRef.current.ignoreFrames = 0;
      stateRef.current.tighten = clamp(stateRef.current.tighten + 0.12, 0, 1);
      callbacksRef.current.onHaptic('error_boundary');
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onTouch);
    canvas.addEventListener('pointermove', onTouch);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onTouch);
      canvas.removeEventListener('pointermove', onTouch);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
