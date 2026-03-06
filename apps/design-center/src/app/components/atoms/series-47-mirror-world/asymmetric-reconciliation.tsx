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
const STEP_T = 0.5;
const COMPLETE_T = 0.965;

export default function AsymmetricReconciliationAtom({
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
    friendProgress: 0,
    selfProgress: 0,
    drawingSelf: false,
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
      if (p.phase === 'resolve') s.selfProgress += (1 - s.selfProgress) * 0.08 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - 0.02 * (p.reducedMotion ? 0.7 : 1));
      if (s.errorCooldown > 0) s.errorCooldown -= 1;

      const reveal = easeOutCubic(clamp((s.friendProgress + s.selfProgress) * 0.5, 0, 1));
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
      const friend = lerpColor(primary, [244, 247, 255], 0.92);
      const self = lerpColor(accent, [255, 220, 204], 0.78);
      const healed = lerpColor(friend, self, 0.5);

      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.9);
      bg.addColorStop(0, rgba(field, Math.min(0.15, (0.04 + reveal * 0.05) * entrance * boost)));
      bg.addColorStop(1, rgba(dense, Math.min(0.96, (0.24 + (1 - reveal) * 0.16) * entrance * boost)));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const leftX = w * 0.34;
      const rightX = w * 0.66;
      const radius = minDim * 0.09;
      for (const side of [
        { x: leftX, progress: s.friendProgress, tone: friend },
        { x: rightX, progress: s.selfProgress, tone: self },
      ]) {
        ctx.beginPath();
        ctx.arc(side.x, cy, radius, Math.PI * 0.2, Math.PI * 1.8);
        ctx.strokeStyle = rgba(side.tone, Math.min(0.38, (0.1 + (1 - side.progress) * 0.18) * entrance * boost));
        ctx.lineWidth = px(0.014, minDim);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(side.x, cy, radius, Math.PI * 0.2, Math.PI * (0.2 + 1.6 * side.progress));
        ctx.strokeStyle = rgba(healed, Math.min(0.92, (0.12 + side.progress * 0.68 + s.revealFlash * 0.04) * entrance * boost));
        ctx.lineWidth = px(0.014, minDim);
        ctx.stroke();
      }

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

    const onMove = (e: PointerEvent) => {
      const p = getPoint(e);
      const leftX = viewport.width * 0.34;
      const rightX = viewport.width * 0.66;
      const cy = viewport.height * 0.5;
      const r = Math.min(viewport.width, viewport.height) * 0.12;
      if (Math.hypot(p.x - leftX, p.y - cy) < r) {
        stateRef.current.friendProgress = clamp(stateRef.current.friendProgress + 0.05, 0, 1);
      } else if (Math.hypot(p.x - rightX, p.y - cy) < r) {
        stateRef.current.drawingSelf = true;
        stateRef.current.selfProgress = clamp(stateRef.current.selfProgress + (reducedMotion ? 0.018 : 0.026), 0, 1);
        if (stateRef.current.errorCooldown === 0) {
          stateRef.current.errorCooldown = 18;
          callbacksRef.current.onHaptic('error_boundary');
        }
      }
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointermove', onMove);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [viewport.width, viewport.height, reducedMotion]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
