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
const STEP_T = 0.48;
const COMPLETE_T = 0.965;

type Point = { x: number; y: number };

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation: number,
) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rotation + (Math.PI * 2 * i) / sides;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export default function CrossSectionSliceAtom({
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
    slicing: false,
    sliceX: 0,
    targetReveal: 0,
    reveal: 0,
    planeGlow: 0,
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
      if (p.phase === 'resolve') {
        s.targetReveal = 1;
        s.sliceX = cx;
      }

      s.reveal += (s.targetReveal - s.reveal) * 0.12 * ms;
      s.planeGlow += ((s.slicing ? 1 : 0.28 + s.reveal * 0.4) - s.planeGlow) * 0.12 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.reveal, 0, 1));
      const split = reveal;
      const complexity = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.72;
        cb.onHaptic('swipe_commit');
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
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const shell = lerpColor(primary, [248, 248, 255], 0.72);
      const core = lerpColor(accent, [255, 238, 214], 0.62);
      const slice = lerpColor(accent, [255, 247, 236], 0.86);
      const haze = lerpColor(primary, accent, 0.32);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.95);
      stage.addColorStop(0, rgba(field, Math.min(0.15, (0.05 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + complexity * 0.22) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const shellRadius = minDim * 0.27;
      const drift = minDim * 0.16 * split;

      ctx.save();
      ctx.translate(cx - drift, cy);
      ctx.rotate(-0.18 * split);
      for (let i = 0; i < 4; i++) {
        const alpha = Math.min(0.46, (0.06 + complexity * 0.16 + (3 - i) * 0.03) * entrance * boost);
        drawPolygon(ctx, 0, 0, shellRadius * (1 - i * 0.12), 5 + i, i * 0.48 + reveal * 0.08);
        ctx.strokeStyle = rgba(shell, alpha);
        ctx.lineWidth = px(0.0045 - i * 0.0005, minDim);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(cx + drift, cy);
      ctx.rotate(0.2 * split);
      for (let i = 0; i < 4; i++) {
        const alpha = Math.min(0.44, (0.05 + complexity * 0.15 + (3 - i) * 0.025) * entrance * boost);
        drawPolygon(ctx, 0, 0, shellRadius * (1 - i * 0.12), 6 + i, -i * 0.44 - reveal * 0.1);
        ctx.strokeStyle = rgba(shell, alpha);
        ctx.lineWidth = px(0.0042 - i * 0.00045, minDim);
        ctx.stroke();
      }
      ctx.restore();

      const dustCount = 18;
      for (let i = 0; i < dustCount; i++) {
        const t = i / dustCount;
        const side = i % 2 === 0 ? -1 : 1;
        const x = cx + side * (shellRadius * 0.32 + drift * (0.2 + t * 0.8));
        const y = cy + Math.sin(t * Math.PI * 5 + reveal * 2.6) * shellRadius * 0.44;
        const r = minDim * (0.004 + (1 - t) * 0.003) * (1 - split * 0.42);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(haze, Math.min(0.16, (0.04 + complexity * 0.08) * entrance * boost));
        ctx.fill();
      }

      if (reveal > 0.06) {
        const coreSize = minDim * (0.066 + reveal * 0.032);
        const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 2.6);
        innerGlow.addColorStop(0, rgba(core, Math.min(0.3, (0.04 + reveal * 0.18 + s.revealFlash * 0.04) * entrance * boost)));
        innerGlow.addColorStop(1, rgba(core, 0));
        ctx.fillStyle = innerGlow;
        ctx.fillRect(cx - coreSize * 2.6, cy - coreSize * 2.6, coreSize * 5.2, coreSize * 5.2);

        ctx.beginPath();
        ctx.roundRect(cx - coreSize, cy - coreSize, coreSize * 2, coreSize * 2, coreSize * 0.36);
        ctx.strokeStyle = rgba(core, Math.min(0.88, (0.12 + reveal * 0.62) * entrance * boost));
        ctx.lineWidth = px(0.005, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - coreSize * 0.82, cy);
        ctx.lineTo(cx + coreSize * 0.82, cy);
        ctx.moveTo(cx, cy - coreSize * 0.82);
        ctx.lineTo(cx, cy + coreSize * 0.82);
        ctx.strokeStyle = rgba(core, Math.min(0.52, (0.08 + reveal * 0.36) * entrance * boost));
        ctx.lineWidth = px(0.0028, minDim);
        ctx.stroke();
      }

      const planeX = s.slicing ? s.sliceX : cx;
      const planeGlow = ctx.createLinearGradient(planeX - minDim * 0.11, 0, planeX + minDim * 0.11, 0);
      planeGlow.addColorStop(0, rgba(slice, 0));
      planeGlow.addColorStop(0.5, rgba(slice, Math.min(0.42, s.planeGlow * 0.24 * entrance * boost)));
      planeGlow.addColorStop(1, rgba(slice, 0));
      ctx.fillStyle = planeGlow;
      ctx.fillRect(planeX - minDim * 0.11, cy - shellRadius * 1.4, minDim * 0.22, shellRadius * 2.8);

      ctx.beginPath();
      ctx.moveTo(planeX, cy - shellRadius * 1.16);
      ctx.lineTo(planeX, cy + shellRadius * 1.16);
      ctx.strokeStyle = rgba(slice, Math.min(0.92, (0.18 + s.planeGlow * 0.48 + reveal * 0.12) * entrance * boost));
      ctx.lineWidth = px(0.006, minDim);
      ctx.stroke();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.52);
        flash.addColorStop(0, rgba(core, (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(core, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.52, cy - minDim * 0.52, minDim * 1.04, minDim * 1.04);
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
      const band = Math.abs(p.y - viewport.height * 0.5) < viewport.height * 0.24;
      if (!band) return;
      stateRef.current.slicing = true;
      stateRef.current.sliceX = p.x;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.slicing) return;
      const p = getPoint(e);
      s.sliceX = p.x;
      const fromLeft = clamp((p.x - viewport.width * 0.18) / (viewport.width * 0.64), 0, 1);
      s.targetReveal = Math.max(s.targetReveal, fromLeft);
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.slicing = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
