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
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function CrushingDepthAtom({
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
  const dragRef = useRef<{ active: boolean; pointerId: number | null }>({ active: false, pointerId: null });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    depth: 0,
    targetDepth: 0,
    thresholdFired: false,
    completionFired: false,
    sparkFlash: 0,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
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
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.34, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve') s.targetDepth = 1;
      s.depth += (s.targetDepth - s.depth) * 0.1;
      s.sparkFlash = Math.max(0, s.sparkFlash - 0.03);

      const reveal = easeOutCubic(clamp(s.depth, 0, 1));
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.sparkFlash = 0.8;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const abyss = lerpColor([3, 5, 10], primary, 0.16);
      const steel = lerpColor([96, 110, 128], accent, 0.28);
      const core = lerpColor(primary, [245, 247, 255], 0.92);
      const spark = lerpColor(accent, [255, 210, 180], 0.86);

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, rgba(lerpColor(abyss, primary, 0.15), 0.22 * entrance));
      bg.addColorStop(0.4, rgba(abyss, 0.48 * entrance));
      bg.addColorStop(1, rgba(lerpColor(abyss, [0, 0, 0], 0.56), 0.98 * entrance));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const pressure = reveal;
      const vignette = ctx.createRadialGradient(cx, h * 0.46, 0, cx, h * 0.46, minDim * 0.7);
      vignette.addColorStop(0, rgba(primary, 0));
      vignette.addColorStop(1, rgba(lerpColor([0, 0, 0], primary, 0.1), 0.18 + pressure * 0.54));
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      const nodeY = h * (0.2 + reveal * 0.62);
      const radius = minDim * (0.042 - pressure * 0.01 + breathAmplitude * 0.002);
      const squeezeX = 1 + pressure * 0.12;
      const squeezeY = 1 - pressure * 0.08;
      ctx.save();
      ctx.translate(cx, nodeY);
      ctx.scale(squeezeX, squeezeY);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, (0.22 + reveal * 0.68) * entrance);
      ctx.fill();
      ctx.restore();

      const braceY = nodeY + radius * 1.7;
      ctx.strokeStyle = rgba(steel, (0.16 + pressure * 0.36) * entrance);
      ctx.lineWidth = px(0.005, minDim);
      ctx.beginPath();
      ctx.moveTo(cx - minDim * 0.07, braceY);
      ctx.lineTo(cx + minDim * 0.07, braceY);
      ctx.stroke();

      const sparkCount = Math.max(3, Math.round(pressure * 10));
      for (let i = 0; i < sparkCount; i += 1) {
        const angle = (i / sparkCount) * Math.PI * 2 + performance.now() * 0.0024;
        const orbit = radius * (1.3 + pressure * 1.1);
        const sx = cx + Math.cos(angle) * orbit;
        const sy = nodeY + Math.sin(angle) * orbit * 0.62;
        const len = minDim * (0.008 + pressure * 0.014);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.strokeStyle = rgba(spark, (0.08 + pressure * 0.38 + s.sparkFlash * 0.2) * entrance);
        ctx.lineWidth = px(0.0025, minDim);
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
      dragRef.current = { active: true, pointerId: e.pointerId };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.active || dragRef.current.pointerId !== e.pointerId) return;
      const pt = getPoint(e);
      const next = clamp((pt.y - viewport.height * 0.18) / (viewport.height * 0.64), 0, 1);
      stateRef.current.targetDepth = Math.max(stateRef.current.targetDepth, next);
      if (next > 0.35) callbacksRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => {
      if (dragRef.current.pointerId === e.pointerId) {
        dragRef.current = { active: false, pointerId: null };
        canvas.releasePointerCapture(e.pointerId);
      }
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
