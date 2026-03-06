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

export default function ElasticResentmentAtom({
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
    enemyX: viewport.width * 0.68,
    release: 0,
    tension: 0,
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
      if (!draggingRef.current || p.phase === 'resolve') s.release += (1 - s.release) * 0.08 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp(s.release, 0, 1));
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
      const tether = lerpColor(accent, [255, 166, 118], 0.54);
      const self = lerpColor(primary, [246, 248, 255], 0.94);
      const enemy = lerpColor(accent, [255, 210, 190], 0.78);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const selfX = viewport.width * 0.32;
      const enemyX = s.enemyX + (viewport.width * 0.84 - s.enemyX) * reveal;
      ctx.beginPath();
      ctx.moveTo(selfX, cy);
      ctx.lineTo(enemyX, cy);
      ctx.strokeStyle = rgba(tether, Math.min(0.72, (0.14 + (1 - reveal) * 0.42 + s.tension * 0.1) * entrance * boost));
      ctx.lineWidth = px(0.006 + s.tension * 0.002, minDim);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(selfX, cy, minDim * 0.03 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(self, Math.min(0.94, (0.18 + reveal * 0.2 + (1 - reveal) * 0.24) * entrance * boost));
      ctx.fill();

      ctx.beginPath();
      ctx.arc(enemyX, cy, minDim * 0.028 * (1 + breathAmplitude * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(enemy, Math.min(0.88, (0.16 + (1 - reveal) * 0.32) * entrance * boost));
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
      if (Math.abs(x - stateRef.current.enemyX) < viewport.width * 0.08) {
        draggingRef.current = true;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const x = getX(e);
      stateRef.current.enemyX = clamp(x, viewport.width * 0.6, viewport.width * 0.82);
      stateRef.current.tension = clamp((stateRef.current.enemyX - viewport.width * 0.6) / (viewport.width * 0.22), 0, 1);
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
