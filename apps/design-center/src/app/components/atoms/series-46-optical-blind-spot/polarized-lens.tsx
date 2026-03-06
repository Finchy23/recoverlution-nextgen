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
  motionScale,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

export default function PolarizedLensAtom({
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
    lens: 0.22,
    dragging: false,
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
      if (!s.dragging) {
        const target = p.phase === 'resolve' ? 0.82 : s.lens;
        s.lens += (target - s.lens) * 0.08 * ms;
      }
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp((s.lens - 0.18) / 0.64, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.7;
        cb.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const milk = lerpColor([255, 255, 255], primary, 0.04);
      const polar = lerpColor(primary, accent, 0.28);
      const truth = lerpColor(primary, [4, 7, 16], 0.74);
      const halo = lerpColor(accent, [255, 245, 232], 0.62);

      ctx.fillStyle = rgba(milk, 1);
      ctx.fillRect(0, 0, w, h);

      const rowY = cy;
      const letterSpacing = minDim * 0.09;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${Math.round(minDim * 0.19)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.985)';
      ctx.fillText('SEE', cx, rowY);

      const lensX = w * s.lens;
      const lensW = minDim * 0.38;
      const lensGrad = ctx.createLinearGradient(lensX - lensW * 0.5, 0, lensX + lensW * 0.5, 0);
      lensGrad.addColorStop(0, rgba(polar, 0.08 * entrance * boost));
      lensGrad.addColorStop(0.5, rgba(polar, 0.38 * entrance * boost));
      lensGrad.addColorStop(1, rgba(polar, 0.08 * entrance * boost));
      ctx.fillStyle = lensGrad;
      ctx.fillRect(lensX - lensW * 0.5, 0, lensW, h);

      ctx.save();
      ctx.beginPath();
      ctx.rect(lensX - lensW * 0.5, 0, lensW, h);
      ctx.clip();
      ctx.fillStyle = rgba(truth, Math.min(0.96, (0.18 + reveal * 0.72) * entrance * boost));
      ctx.fillText('SEE', cx, rowY);
      ctx.restore();

      const scan = ctx.createRadialGradient(lensX, cy, 0, lensX, cy, minDim * 0.44);
      scan.addColorStop(0, rgba(halo, (0.1 + reveal * 0.16 + s.revealFlash * 0.08) * entrance));
      scan.addColorStop(1, rgba(halo, 0));
      ctx.fillStyle = scan;
      ctx.fillRect(lensX - minDim * 0.44, cy - minDim * 0.44, minDim * 0.88, minDim * 0.88);

      ctx.strokeStyle = rgba(truth, Math.min(0.56, (0.12 + reveal * 0.3) * entrance * boost));
      ctx.lineWidth = px(0.007, minDim);
      ctx.strokeRect(lensX - lensW * 0.5, h * 0.08, lensW, h * 0.84);

      ctx.beginPath();
      ctx.moveTo(lensX, h * 0.1);
      ctx.lineTo(lensX, h * 0.9);
      ctx.strokeStyle = rgba(halo, Math.min(0.48, (0.12 + reveal * 0.22) * entrance * boost));
      ctx.lineWidth = px(0.004, minDim);
      ctx.stroke();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getX = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * viewport.width;
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.lens = clamp(getX(e) / viewport.width, 0.18, 0.82);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.lens = clamp(getX(e) / viewport.width, 0.18, 0.82);
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

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
