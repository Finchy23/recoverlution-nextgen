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

export default function SilentRunningAtom({
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
    holding: false,
    stealth: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
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

    const blips = Array.from({ length: 18 }, (_, i) => ({
      x: 0.16 + (i % 6) * 0.14,
      y: 0.18 + Math.floor(i / 6) * 0.18,
      phase: i * 0.61,
    }));

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

      if (s.holding) s.stealth = Math.min(1, s.stealth + 0.023 * ms);
      else s.stealth = Math.max(0, s.stealth - 0.018 * ms);

      const reveal = easeOutCubic(clamp(s.stealth, 0, 1));
      const noise = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('breath_peak');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const chaos = lerpColor(accent, [255, 86, 86], 0.28);
      const silence = lerpColor(primary, [160, 220, 255], 0.4);
      const field = lerpColor(primary, accent, 0.14);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + noise * 0.08 + reveal * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba([2, 4, 8], Math.min(0.98, (0.26 + noise * 0.3 + reveal * 0.2) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      for (const blip of blips) {
        const pulse = (Math.sin(progress * Math.PI * 10 + blip.phase) + 1) * 0.5;
        const x = blip.x * w;
        const y = blip.y * h;
        ctx.beginPath();
        ctx.arc(x, y, minDim * (0.008 + pulse * 0.012) * noise, 0, Math.PI * 2);
        ctx.fillStyle = rgba(chaos, Math.min(0.42, (0.08 + pulse * 0.24) * entrance * noise * boost));
        ctx.fill();
      }

      for (let i = 0; i < 5; i++) {
        const y = h * (0.2 + i * 0.14);
        ctx.beginPath();
        ctx.moveTo(w * 0.12, y + Math.sin(progress * Math.PI * (7 + i)) * minDim * 0.01 * noise);
        for (let x = 0; x <= 32; x++) {
          const xx = w * 0.12 + (w * 0.76 * x) / 32;
          const yy = y + Math.sin(progress * Math.PI * (7 + i) + x * 0.6) * minDim * 0.014 * noise;
          ctx.lineTo(xx, yy);
        }
        ctx.strokeStyle = rgba(chaos, Math.min(0.18, (0.04 + noise * 0.12) * entrance * boost));
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      const toggleX = cx;
      const toggleY = h * 0.8;
      const trackW = minDim * 0.24;
      const knobX = toggleX - trackW * 0.25 + reveal * trackW * 0.5;
      ctx.beginPath();
      ctx.roundRect(toggleX - trackW * 0.5, toggleY - minDim * 0.032, trackW, minDim * 0.064, minDim * 0.032);
      ctx.fillStyle = rgba(silence, Math.min(0.18, (0.04 + reveal * 0.12) * entrance * boost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(knobX, toggleY, minDim * 0.026, 0, Math.PI * 2);
      ctx.fillStyle = rgba(silence, Math.min(0.94, (0.14 + reveal * 0.56) * entrance * boost));
      ctx.fill();

      const pulseR = minDim * (0.045 + breathAmplitude * 0.012 + reveal * 0.04);
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(silence, Math.min(0.34, (0.02 + reveal * 0.28 + s.revealFlash * 0.06) * entrance * boost));
      ctx.lineWidth = px(0.006, minDim);
      ctx.stroke();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.5);
        flash.addColorStop(0, rgba(silence, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(silence, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.5, cy - minDim * 0.5, minDim * 1, minDim * 1);
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
      const p = getPoint(e);
      const toggleX = viewport.width * 0.5;
      const toggleY = viewport.height * 0.8;
      if (Math.abs(p.x - toggleX) < viewport.width * 0.16 && Math.abs(p.y - toggleY) < viewport.height * 0.08) {
        stateRef.current.holding = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('hold_start');
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
