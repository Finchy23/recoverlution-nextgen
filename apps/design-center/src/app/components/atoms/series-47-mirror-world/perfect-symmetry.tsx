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
const STEP_T = 0.44;
const COMPLETE_T = 0.965;
const FAST_VELOCITY = 1.25;

type DragState = {
  dragging: boolean;
  lastX: number;
  lastTime: number;
};

export default function PerfectSymmetryAtom({
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
  const dragRef = useRef<DragState>({ dragging: false, lastX: 0, lastTime: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    userX: viewport.width * 0.74,
    merge: 0,
    bounce: 0,
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

      if (dragRef.current.dragging) {
        const distanceToCenter = Math.abs(s.userX - cx);
        const targetMerge = clamp(1 - distanceToCenter / (w * 0.24), 0, 1);
        s.merge += (targetMerge - s.merge) * 0.16 * ms;
      } else {
        const target = p.phase === 'resolve' ? 1 : 0;
        s.merge += (target - s.merge) * 0.1 * ms;
      }
      s.bounce *= 0.88;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.merge, 0, 1));
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
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
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([5, 7, 13], primary, 0.1);
      const self = lerpColor(primary, [244, 247, 255], 0.92);
      const ghost = lerpColor(accent, [255, 220, 200], 0.78);
      const unified = lerpColor(self, ghost, 0.5);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.moveTo(cx, h * 0.16);
      ctx.lineTo(cx, h * 0.84);
      ctx.strokeStyle = rgba(unified, Math.min(0.18, (0.04 + reveal * 0.08) * entrance * boost));
      ctx.lineWidth = px(0.003, minDim);
      ctx.stroke();

      const userX = s.userX + s.bounce;
      const ghostX = w - userX;
      const y = cy;

      const mergeGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.24);
      mergeGlow.addColorStop(0, rgba(unified, (0.08 + reveal * 0.3 + s.revealFlash * 0.08) * entrance));
      mergeGlow.addColorStop(1, rgba(unified, 0));
      ctx.fillStyle = mergeGlow;
      ctx.fillRect(cx - minDim * 0.24, cy - minDim * 0.24, minDim * 0.48, minDim * 0.48);

      const userMix = lerpColor(self, unified, reveal);
      const ghostMix = lerpColor(ghost, unified, reveal);
      const unifiedRadius = minDim * (0.028 + reveal * 0.016);

      ctx.beginPath();
      ctx.arc(userX + (cx - userX) * reveal, y, unifiedRadius * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(userMix, Math.min(0.94, (0.2 + (1 - reveal) * 0.4 + reveal * 0.3) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ghostX + (cx - ghostX) * reveal, y, unifiedRadius * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(ghostMix, Math.min(0.84, (0.16 + (1 - reveal) * 0.44 + reveal * 0.24) * entrance * boost));
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getX = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * viewport.width;
    };

    const onDown = (e: PointerEvent) => {
      const x = getX(e);
      if (Math.abs(x - stateRef.current.userX) < viewport.width * 0.12) {
        dragRef.current = { dragging: true, lastX: x, lastTime: performance.now() };
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const x = getX(e);
      const now = performance.now();
      const deltaX = x - dragRef.current.lastX;
      const deltaT = Math.max(16, now - dragRef.current.lastTime);
      const velocity = Math.abs(deltaX / deltaT);
      dragRef.current.lastX = x;
      dragRef.current.lastTime = now;

      if (velocity > FAST_VELOCITY) {
        stateRef.current.bounce = deltaX > 0 ? px(0.03, Math.min(viewport.width, viewport.height)) : -px(0.03, Math.min(viewport.width, viewport.height));
        stateRef.current.merge = Math.max(0, stateRef.current.merge - 0.08);
        if (stateRef.current.errorCooldown === 0) {
          stateRef.current.errorCooldown = 18;
          callbacksRef.current.onHaptic('error_boundary');
        }
        return;
      }

      stateRef.current.userX = clamp(x, viewport.width * 0.5, viewport.width * 0.82);
    };

    const onUp = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      stateRef.current.userX += (viewport.width * 0.74 - stateRef.current.userX) * 0.28;
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
