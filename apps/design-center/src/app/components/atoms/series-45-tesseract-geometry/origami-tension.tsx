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
const SWIPE_THRESHOLD = 0.24;
const FOLD_COUNT = 4;

export default function OrigamiTensionAtom({
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
    stage: 0,
    stageT: 0,
    dragging: false,
    dragStartX: 0,
    dragProgress: 0,
    revealFlash: 0,
    completionFired: false,
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
      if (p.phase === 'resolve' && s.stage < FOLD_COUNT) {
        s.stage = FOLD_COUNT;
        s.revealFlash = 1;
      }

      const target = s.stage / FOLD_COUNT;
      s.stageT += (target - s.stageT) * 0.12 * ms;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.stageT, 0, 1));
      const tension = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);

      if (reveal >= 0.965 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.16);
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const line = lerpColor(primary, [245, 247, 255], 0.88);
      const ember = lerpColor(accent, [255, 243, 227], 0.82);

      const stageBg = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stageBg.addColorStop(0, rgba(field, Math.min(0.15, (0.05 + reveal * 0.05) * entrance * boost)));
      stageBg.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + tension * 0.22) * entrance * boost)));
      ctx.fillStyle = stageBg;
      ctx.fillRect(0, 0, w, h);

      const size = minDim * (0.12 + reveal * 0.22);
      const layerCount = FOLD_COUNT + 1;
      for (let i = 0; i < layerCount; i++) {
        const t = i / FOLD_COUNT;
        const foldClosed = clamp((t - reveal) / 0.26, 0, 1);
        const spread = size * (reveal * 0.58);
        const offsetX = (i - FOLD_COUNT / 2) * spread * 0.22 * (1 - foldClosed);
        const offsetY = (i - FOLD_COUNT / 2) * spread * 0.08 * (1 - foldClosed);
        const flap = size * (0.66 + t * 0.22);
        const foldTilt = foldClosed * size * 0.34;

        ctx.beginPath();
        ctx.moveTo(cx + offsetX, cy - flap * 0.54 + offsetY);
        ctx.lineTo(cx + flap * 0.54 - foldTilt + offsetX, cy + offsetY);
        ctx.lineTo(cx + offsetX, cy + flap * 0.54 + offsetY);
        ctx.lineTo(cx - flap * 0.54 + foldTilt + offsetX, cy + offsetY);
        ctx.closePath();
        ctx.fillStyle = rgba(i % 2 === 0 ? ember : line, Math.min(0.18, (0.04 + reveal * 0.05 + tension * 0.04) * entrance * boost));
        ctx.fill();
        ctx.strokeStyle = rgba(i % 2 === 0 ? ember : line, Math.min(0.86, (0.14 + reveal * 0.14 + (1 - t) * tension * 0.16) * entrance * boost));
        ctx.lineWidth = px(0.0048 - t * 0.0012, minDim);
        ctx.stroke();
      }

      const coilGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.44);
      coilGlow.addColorStop(0, rgba(ember, Math.min(0.22, (0.04 + tension * 0.16 + s.revealFlash * 0.04) * entrance * boost)));
      coilGlow.addColorStop(1, rgba(ember, 0));
      ctx.fillStyle = coilGlow;
      ctx.fillRect(cx - minDim * 0.44, cy - minDim * 0.44, minDim * 0.88, minDim * 0.88);

      if (s.dragging) {
        const y = cy + minDim * 0.3;
        const startX = cx - minDim * 0.22;
        const endX = startX + minDim * 0.44 * s.dragProgress;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.strokeStyle = rgba(ember, Math.min(0.24, (0.08 + s.dragProgress * 0.08) * entrance * boost));
        ctx.lineWidth = px(0.004, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.52);
        flash.addColorStop(0, rgba(ember, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(ember, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.52, cy - minDim * 0.52, minDim * 1.04, minDim * 1.04);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getX = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * viewport.width;
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.dragStartX = getX(e);
      stateRef.current.dragProgress = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.stage >= FOLD_COUNT) return;
      const x = getX(e);
      s.dragProgress = clamp((x - s.dragStartX) / (viewport.width * SWIPE_THRESHOLD), 0, 1);
      if (s.dragProgress >= 1) {
        s.dragging = false;
        s.dragProgress = 0;
        s.stage += 1;
        s.revealFlash = 0.7;
        callbacksRef.current.onHaptic('swipe_commit');
        if (s.stage < FOLD_COUNT) callbacksRef.current.onHaptic('step_advance');
        else callbacksRef.current.onResolve?.();
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      stateRef.current.dragProgress = 0;
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
