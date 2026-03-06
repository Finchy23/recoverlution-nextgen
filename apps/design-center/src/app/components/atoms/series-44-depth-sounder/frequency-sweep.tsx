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

type Point = { x: number; y: number };

export default function FrequencySweepAtom({
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
    sweepT: 0,
    sweepDir: 1,
    reveal: 0,
    holding: false,
    halfFired: false,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    knotFoundFired: false,
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

    const knot = () => ({ x: viewport.width * 0.42, y: viewport.height * 0.61 });

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.holding = true;

      s.sweepT += 0.007 * s.sweepDir * ms;
      if (s.sweepT >= 1) {
        s.sweepT = 1;
        s.sweepDir = -1;
      }
      if (s.sweepT <= 0) {
        s.sweepT = 0;
        s.sweepDir = 1;
      }

      const k = knot();
      const sweepY = h * (0.12 + s.sweepT * 0.76);
      const sweepHit = 1 - clamp(Math.abs(sweepY - k.y) / (minDim * 0.08), 0, 1);
      if (sweepHit > 0.86 && !s.knotFoundFired) {
        s.knotFoundFired = true;
        cb.onHaptic('step_advance');
      }
      if (sweepHit < 0.15) {
        s.knotFoundFired = false;
      }

      if (s.holding && sweepHit > 0.55) {
        s.reveal = Math.min(1, s.reveal + 0.024 * ms);
      } else {
        s.reveal = Math.max(0, s.reveal - 0.01 * ms);
      }

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      const tension = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('hold_threshold');
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
      const dense = lerpColor([4, 6, 10], primary, 0.1);
      const knotColor = lerpColor(accent, [255, 232, 214], 0.5);
      const clarity = lerpColor(primary, [244, 247, 255], 0.9);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(0.55, rgba(field, Math.min(0.07, (0.015 + reveal * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.9, (0.22 + tension * 0.16) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      for (let i = 0; i <= 48; i++) {
        const x = (i / 48) * w;
        const wave = Math.sin(i * 0.55 + s.sweepT * Math.PI * 3.4) * minDim * 0.004 * sweepHit;
        const knotPull = Math.exp(-Math.pow((x - k.x) / (minDim * 0.12), 2)) * minDim * 0.026 * sweepHit * tension;
        const y = sweepY + wave - knotPull;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(clarity, Math.min(0.34, (0.08 + 0.14 * (0.3 + sweepHit * 0.7)) * entrance * boost));
      ctx.lineWidth = px(0.005, minDim);
      ctx.stroke();

      const knotGlow = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, minDim * 0.18);
      knotGlow.addColorStop(0, rgba(knotColor, Math.min(0.24, (0.04 + sweepHit * 0.16 + reveal * 0.08 + s.revealFlash * 0.04) * entrance * boost)));
      knotGlow.addColorStop(1, rgba(knotColor, 0));
      ctx.fillStyle = knotGlow;
      ctx.fillRect(k.x - minDim * 0.18, k.y - minDim * 0.18, minDim * 0.36, minDim * 0.36);

      ctx.beginPath();
      ctx.arc(k.x, k.y, px(0.032, minDim) * (1 - reveal * 0.42 + breathAmplitude * 0.015), 0, Math.PI * 2);
      ctx.fillStyle = rgba(knotColor, Math.min(0.84, (0.16 + sweepHit * 0.2 + tension * 0.24) * entrance * boost));
      ctx.fill();

      if (reveal > 0.06) {
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + s.sweepT * 1.2;
          const radius = minDim * (0.035 + i * 0.008) * tension;
          ctx.beginPath();
          ctx.moveTo(k.x + Math.cos(angle) * radius * 0.2, k.y + Math.sin(angle) * radius * 0.2);
          ctx.lineTo(k.x + Math.cos(angle) * radius, k.y + Math.sin(angle) * radius);
          ctx.strokeStyle = rgba(accent, Math.min(0.18, (0.04 + tension * 0.14) * entrance * boost));
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, minDim * 0.42);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(k.x - minDim * 0.42, k.y - minDim * 0.42, minDim * 0.84, minDim * 0.84);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const point = getPoint(e);
      const s = stateRef.current;
      const k = knot();
      if (Math.hypot(point.x - k.x, point.y - k.y) < Math.min(viewport.width, viewport.height) * 0.11) {
        s.holding = true;
        callbacksRef.current.onHaptic('hold_start');
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
