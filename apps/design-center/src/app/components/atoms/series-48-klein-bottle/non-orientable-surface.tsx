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
const IDLE_TARGET = 180;
const STEP_T = 0.44;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

export default function NonOrientableSurfaceAtom({
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
  const draggingRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    angle: Math.PI * 1.35,
    idleFrames: 0,
    shatter: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    errorCooldown: 0,
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

      if (!draggingRef.current) s.idleFrames += 1;
      else s.idleFrames = 0;
      const idleReveal = clamp(s.idleFrames / IDLE_TARGET, 0, 1);
      s.shatter += ((p.phase === 'resolve' ? 1 : idleReveal) - s.shatter) * 0.08 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.shatter, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('hold_release');
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
      const glass = lerpColor(primary, [246, 248, 255], 0.9);
      const core = lerpColor(accent, [255, 222, 205], 0.74);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const bottleW = minDim * 0.26;
      const bottleH = minDim * 0.42;
      ctx.beginPath();
      ctx.moveTo(cx - bottleW * 0.45, cy + bottleH * 0.38);
      ctx.bezierCurveTo(cx - bottleW * 0.62, cy + bottleH * 0.06, cx - bottleW * 0.26, cy - bottleH * 0.12, cx - bottleW * 0.16, cy - bottleH * 0.32);
      ctx.lineTo(cx - bottleW * 0.1, cy - bottleH * 0.48);
      ctx.lineTo(cx + bottleW * 0.1, cy - bottleH * 0.48);
      ctx.lineTo(cx + bottleW * 0.16, cy - bottleH * 0.32);
      ctx.bezierCurveTo(cx + bottleW * 0.26, cy - bottleH * 0.12, cx + bottleW * 0.62, cy + bottleH * 0.06, cx + bottleW * 0.45, cy + bottleH * 0.38);
      ctx.closePath();
      ctx.strokeStyle = rgba(glass, Math.min(0.58, (0.14 + (1 - reveal) * 0.26) * entrance * boost));
      ctx.lineWidth = px(0.006, minDim);
      ctx.stroke();

      const loopT = s.angle;
      const loopX = cx + Math.sin(loopT) * bottleW * 0.28;
      const loopY = cy + Math.sin(loopT * 2) * bottleH * 0.2;
      const nodeX = loopX + (cx - loopX) * reveal;
      const nodeY = loopY + (cy - loopY) * reveal;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, minDim * 0.028 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(core, Math.min(0.92, (0.18 + (1 - reveal) * 0.36 + reveal * 0.22) * entrance * boost));
      ctx.fill();

      if (reveal > 0.2) {
        for (let i = 0; i < 16; i++) {
          const t = i / 16;
          ctx.beginPath();
          ctx.moveTo(nodeX, nodeY);
          ctx.lineTo(nodeX + Math.cos(t * Math.PI * 2) * minDim * (0.08 + reveal * 0.12), nodeY + Math.sin(t * Math.PI * 2) * minDim * (0.08 + reveal * 0.12));
          ctx.strokeStyle = rgba(glass, Math.min(0.24, (0.06 + reveal * 0.16 + s.revealFlash * 0.04) * entrance * boost));
          ctx.lineWidth = px(0.0022, minDim);
          ctx.stroke();
        }
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
      draggingRef.current = true;
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.idleFrames = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const point = getPoint(e);
      stateRef.current.angle += (point.x / viewport.width - 0.5) * 0.18;
      if (stateRef.current.errorCooldown === 0) {
        stateRef.current.errorCooldown = 18;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };
    const onUp = (e: PointerEvent) => {
      draggingRef.current = false;
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
