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
const STEP_T = 0.46;
const COMPLETE_T = 0.965;

export default function DoppelgangerMergeAtom({
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
    userX: viewport.width * 0.34,
    userY: viewport.height * 0.56,
    merge: 0,
    errorCooldown: 0,
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

      if (!draggingRef.current || p.phase === 'resolve') s.merge += ((p.phase === 'resolve' ? 1 : 0.88) - s.merge) * 0.08 * ms;
      else s.merge += (0 - s.merge) * 0.12 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.merge, 0, 1));
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
      const field = lerpColor(primary, accent, 0.18);
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const self = lerpColor(primary, [244, 247, 255], 0.92);
      const other = lerpColor(accent, [255, 220, 204], 0.8);
      const whole = lerpColor(self, other, 0.5);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const targetX = s.userX + (cx - s.userX) * reveal;
      const targetY = s.userY + (cy - s.userY) * reveal;
      const ghostStartX = w - s.userX;
      const ghostStartY = h - s.userY;
      const ghostX = ghostStartX + (cx - ghostStartX) * reveal;
      const ghostY = ghostStartY + (cy - ghostStartY) * reveal;

      ctx.beginPath();
      ctx.arc(targetX, targetY, minDim * 0.034 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(self, whole, reveal), Math.min(0.94, (0.18 + (1 - reveal) * 0.38 + reveal * 0.26) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ghostX, ghostY, minDim * 0.032 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(other, whole, reveal), Math.min(0.88, (0.16 + (1 - reveal) * 0.4 + reveal * 0.22) * entrance * boost));
      ctx.fill();

      const mergeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.28);
      mergeGlow.addColorStop(0, rgba(whole, (0.08 + reveal * 0.28 + s.revealFlash * 0.08) * entrance));
      mergeGlow.addColorStop(1, rgba(whole, 0));
      ctx.fillStyle = mergeGlow;
      ctx.fillRect(cx - minDim * 0.28, cy - minDim * 0.28, minDim * 0.56, minDim * 0.56);

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const point = getPoint(e);
      if (Math.hypot(point.x - stateRef.current.userX, point.y - stateRef.current.userY) < Math.min(viewport.width, viewport.height) * 0.09) {
        draggingRef.current = true;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const point = getPoint(e);
      stateRef.current.userX = clamp(point.x, viewport.width * 0.14, viewport.width * 0.86);
      stateRef.current.userY = clamp(point.y, viewport.height * 0.18, viewport.height * 0.82);
      if (stateRef.current.errorCooldown === 0) {
        stateRef.current.errorCooldown = 20;
        callbacksRef.current.onHaptic('error_boundary');
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
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
