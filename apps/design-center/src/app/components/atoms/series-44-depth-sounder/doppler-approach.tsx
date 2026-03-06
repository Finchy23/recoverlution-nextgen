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
const FLASH_DECAY = 0.022;
const STEP_T = 0.5;
const COMPLETE_T = 0.965;

export default function DopplerApproachAtom({
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

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    approach: 0,
    cycle: 0,
    caught: false,
    settle: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    errorCooldown: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      if (s.errorCooldown > 0) s.errorCooldown--;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.caught = true;

      if (!s.caught) {
        const velocity = 0.006 + Math.pow(s.approach, 2.1) * 0.05;
        s.approach += velocity * ms;
        if (s.approach >= 1.04) {
          s.approach = 0;
          s.cycle++;
        }
      } else {
        s.settle = Math.min(1, s.settle + 0.024 * ms);
      }

      const reveal = easeOutCubic(clamp(s.settle, 0, 1));
      const tension = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('step_advance');
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
      const dense = lerpColor([3, 5, 10], primary, 0.08);
      const threat = lerpColor([8, 8, 14], accent, 0.16);
      const clarity = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.6);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.94);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(0.55, rgba(field, Math.min(0.07, (0.015 + reveal * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.94, (0.22 + tension * 0.16) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const impactR = minDim * 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, impactR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(clarity, Math.min(0.22, (0.08 + reveal * 0.08) * entrance * boost));
      ctx.lineWidth = px(0.003, minDim);
      ctx.stroke();

      const incomingR = minDim * (0.42 - Math.pow(clamp(s.approach, 0, 1), 0.85) * 0.34);
      const incomingAlpha = Math.min(0.88, (0.18 + Math.pow(clamp(s.approach, 0, 1), 1.4) * 0.54) * entrance * boost);
      const incomingGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, incomingR * 1.25);
      incomingGlow.addColorStop(0, rgba(ember, incomingAlpha * 0.18));
      incomingGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = incomingGlow;
      ctx.fillRect(cx - incomingR * 1.25, cy - incomingR * 1.25, incomingR * 2.5, incomingR * 2.5);

      if (!s.caught) {
        ctx.beginPath();
        ctx.arc(cx, cy, incomingR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ember, incomingAlpha);
        ctx.lineWidth = px(0.01, minDim) * (0.5 + Math.pow(clamp(s.approach, 0, 1), 1.8) * 1.6);
        ctx.stroke();
      }

      if (s.caught) {
        ctx.beginPath();
        ctx.arc(cx, cy, impactR + reveal * minDim * 0.03, 0, Math.PI * 2);
        ctx.fillStyle = rgba(clarity, Math.min(0.92, (0.24 + reveal * 0.48) * entrance * boost));
        ctx.fill();
      }

      const pulseCount = 4;
      for (let i = 0; i < pulseCount; i++) {
        const ringT = clamp(s.approach - i * 0.18, 0, 1);
        if (ringT <= 0 || s.caught) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * (0.06 + ringT * 0.28), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ember, Math.min(0.18, (0.06 + ringT * 0.12) * entrance * boost * (1 - i * 0.16)));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.46);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.46, cy - minDim * 0.46, minDim * 0.92, minDim * 0.92);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const onDown = () => {
      const s = stateRef.current;
      if (s.caught) return;
      const impactWindow = Math.abs(s.approach - 0.92);
      if (impactWindow < 0.08) {
        s.caught = true;
        callbacksRef.current.onHaptic('tap');
      } else if (s.errorCooldown === 0) {
        s.errorCooldown = 18;
        callbacksRef.current.onHaptic('step_advance');
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
