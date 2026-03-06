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

export default function ZAxisFlattenAtom({
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
    flatten: 0,
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

      if (s.holding) s.flatten = Math.min(1, s.flatten + 0.022 * ms);
      else s.flatten = Math.max(0, s.flatten - 0.018 * ms);

      const reveal = easeOutCubic(clamp(s.flatten, 0, 1));
      const depth = 1 - reveal;
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
      const field = lerpColor(primary, accent, 0.14);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const line = lerpColor(primary, [244, 247, 255], 0.92);
      const ember = lerpColor(accent, [255, 236, 210], 0.58);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stage.addColorStop(0, rgba(field, Math.min(0.14, (0.04 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + depth * 0.22) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const rectW = minDim * (0.18 + t * 0.56 * depth + (1 - depth) * 0.32);
        const rectH = minDim * (0.03 + t * 0.16 * depth);
        const y = cy - minDim * 0.18 + t * minDim * 0.36;
        ctx.beginPath();
        ctx.roundRect(cx - rectW * 0.5, y - rectH * 0.5, rectW, rectH, rectH * 0.5);
        ctx.strokeStyle = rgba(line, Math.min(0.24, (0.06 + depth * 0.12 + reveal * 0.08) * entrance * boost * (1 - t * 0.08)));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      if (reveal > 0.1) {
        ctx.beginPath();
        ctx.roundRect(cx - minDim * 0.34, cy - minDim * 0.035, minDim * 0.68, minDim * 0.07, minDim * 0.035);
        ctx.fillStyle = rgba(line, Math.min(0.82, (0.16 + reveal * 0.54) * entrance * boost));
        ctx.fill();
      }

      const palmGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.28);
      palmGlow.addColorStop(0, rgba(ember, Math.min(0.18, (0.02 + reveal * 0.12 + s.revealFlash * 0.04) * entrance * boost)));
      palmGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = palmGlow;
      ctx.fillRect(cx - minDim * 0.28, cy - minDim * 0.28, minDim * 0.56, minDim * 0.56);

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.48);
        flash.addColorStop(0, rgba(line, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(line, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.48, cy - minDim * 0.48, minDim * 0.96, minDim * 0.96);
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
      if (Math.abs(p.x - viewport.width * 0.5) < viewport.width * 0.22 && Math.abs(p.y - viewport.height * 0.5) < viewport.height * 0.18) {
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
