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

export default function CoastalShelfUndercutAtom({
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
    waves: 0,
    pulse: 0,
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
      if (!p.composed) drawAtmosphere(ctx, w / 2, h / 2, w, h, minDim, s.primaryRgb, entrance);

      s.pulse *= 0.88;
      const undercut = easeOutCubic(clamp(s.waves / 20, 0, 1));
      cb.onStateChange?.(undercut);
      if (undercut >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const sea = lerpColor([32, 56, 92], s.accentRgb, 0.35);
      const foam = lerpColor([242, 248, 255], s.primaryRgb, 0.6);
      const cliff = lerpColor([134, 110, 86], s.primaryRgb, 0.12);
      const dark = lerpColor([42, 34, 28], cliff, 0.35);

      ctx.fillStyle = rgba(sea, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      const baseLoss = minDim * 0.22 * undercut;
      const topShift = minDim * 0.11 * Math.max(0, undercut - 0.82) / 0.18;

      ctx.beginPath();
      ctx.moveTo(w * 0.55 + topShift, h * 0.1);
      ctx.lineTo(w * 0.9 + topShift, h * 0.1);
      ctx.lineTo(w * 0.9 + topShift, h * 0.64);
      ctx.lineTo(w * 0.58 + topShift, h * 0.64);
      ctx.lineTo(w * 0.52 + baseLoss, h * 0.92);
      ctx.lineTo(w * 0.44 + baseLoss, h * 0.92);
      ctx.lineTo(w * 0.5 + topShift, h * 0.58);
      ctx.lineTo(w * 0.55 + topShift, h * 0.1);
      ctx.closePath();
      const cliffGrad = ctx.createLinearGradient(w * 0.44, h * 0.1, w * 0.88, h * 0.92);
      cliffGrad.addColorStop(0, rgba(cliff, 0.96 * entrance));
      cliffGrad.addColorStop(1, rgba(dark, 0.98 * entrance));
      ctx.fillStyle = cliffGrad;
      ctx.fill();

      for (let i = 0; i < 4; i += 1) {
        const y = h * (0.58 + i * 0.08);
        const swing = minDim * (0.04 + s.pulse * 0.06);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(w * 0.28, y - swing, w * 0.55, y);
        ctx.lineTo(w * 0.55, y + minDim * 0.05);
        ctx.quadraticCurveTo(w * 0.24, y + swing, 0, y + minDim * 0.06);
        ctx.closePath();
        ctx.fillStyle = rgba(foam, (0.1 + s.pulse * 0.18) * entrance);
        ctx.fill();
      }

      ctx.fillStyle = rgba(foam, 0.16 * entrance);
      ctx.font = `${px(0.024, minDim)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${s.waves}/20`, cx, h * 0.92);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = () => {
      const s = stateRef.current;
      if (s.waves >= 20) return;
      s.waves += 1;
      s.pulse = 1;
      callbacksRef.current.onHaptic('swipe_commit');
      if (s.waves === 8 || s.waves === 14) callbacksRef.current.onHaptic('step_advance');
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'pan-x' }} />
    </div>
  );
}
