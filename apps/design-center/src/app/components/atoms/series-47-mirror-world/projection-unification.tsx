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
const STEP_T = 0.48;
const COMPLETE_T = 0.965;

export default function ProjectionUnificationAtom({
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
  const pointersRef = useRef(new Map<number, number>());
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    divide: 1,
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

      const positions = Array.from(pointersRef.current.values()).sort((a, b) => a - b);
      if (positions.length >= 2) {
        const left = positions[0];
        const right = positions[positions.length - 1];
        const spread = clamp((right - left) / (w * 0.7), 0, 1);
        s.divide += ((1 - spread) - s.divide) * 0.16 * ms;
      } else if (positions.length === 1) {
        const spread = clamp(Math.abs(positions[0] - cx) / (w * 0.36), 0, 1);
        s.divide += ((1 - spread) - s.divide) * 0.12 * ms;
      } else if (p.phase === 'resolve') {
        s.divide += (0 - s.divide) * 0.08 * ms;
      } else {
        s.divide += (1 - s.divide) * 0.06 * ms;
      }

      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(1 - s.divide, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const leftTone = lerpColor(primary, [246, 248, 255], 0.9);
      const rightTone = lerpColor(accent, [255, 220, 204], 0.78);
      const unified = lerpColor(leftTone, rightTone, 0.5);
      const dense = lerpColor([5, 7, 13], primary, 0.1);

      ctx.fillStyle = rgba(dense, Math.min(0.96, 0.24 * entrance * boost));
      ctx.fillRect(0, 0, w, h);

      const dividerW = Math.max(px(0.01, minDim), w * s.divide * 0.18);
      const leftShift = dividerW * 0.5 * (1 - reveal);
      const rightShift = dividerW * 0.5 * (1 - reveal);

      ctx.fillStyle = rgba(lerpColor(leftTone, unified, reveal), Math.min(0.92, 0.28 * entrance * boost + reveal * 0.24));
      ctx.fillRect(0, 0, cx - dividerW * 0.5 + leftShift, h);

      ctx.fillStyle = rgba(lerpColor(rightTone, unified, reveal), Math.min(0.9, 0.26 * entrance * boost + reveal * 0.22));
      ctx.fillRect(cx + dividerW * 0.5 - rightShift, 0, w - (cx + dividerW * 0.5 - rightShift), h);

      if (s.divide > 0.02) {
        ctx.fillStyle = rgba(unified, Math.min(0.64, (0.12 + (1 - s.divide) * 0.18) * entrance * boost));
        ctx.fillRect(cx - dividerW * 0.5, 0, dividerW, h);
      }

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.34);
      glow.addColorStop(0, rgba(unified, (0.06 + reveal * 0.28 + s.revealFlash * 0.08) * entrance));
      glow.addColorStop(1, rgba(unified, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.34, cy - minDim * 0.34, minDim * 0.68, minDim * 0.68);

      ctx.beginPath();
      ctx.arc(cx, cy, minDim * (0.028 + reveal * 0.016) * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(unified, Math.min(0.96, (0.12 + reveal * 0.78) * entrance * boost));
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPointX = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * viewport.width;
    };

    const onDown = (e: PointerEvent) => {
      pointersRef.current.set(e.pointerId, getPointX(e));
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, getPointX(e));
    };
    const onUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
