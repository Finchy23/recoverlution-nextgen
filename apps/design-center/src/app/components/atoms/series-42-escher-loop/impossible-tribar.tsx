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
  type RGB,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const FLASH_DECAY = 0.024;
const STEP_T = 0.48;
const COMPLETE_T = 0.95;

function drawBeam(
  ctx: CanvasRenderingContext2D,
  a: [number, number],
  b: [number, number],
  width: number,
  color: RGB,
  alpha: number,
) {
  if (alpha <= 0) return;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(a[0] + nx * width, a[1] + ny * width);
  ctx.lineTo(b[0] + nx * width, b[1] + ny * width);
  ctx.lineTo(b[0] - nx * width, b[1] - ny * width);
  ctx.lineTo(a[0] - nx * width, a[1] - ny * width);
  ctx.closePath();
  ctx.fillStyle = rgba(color, alpha);
  ctx.fill();
}

export default function ImpossibleTribarAtom({
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
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    dragging: false,
    startX: 0,
    rotation: 0,
    thresholdFired: false,
    completionFired: false,
    revealFlash: 0,
    dragCommitted: false,
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
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve' && !s.dragging) s.rotation += (1 - s.rotation) * 0.08;

      const reveal = easeOutCubic(clamp(s.rotation, 0, 1));
      const mass = 1 - reveal;
      const boost = p.composed ? 1.16 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.8;
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
      const threat = lerpColor([10, 10, 16], accent, 0.16);
      const dense = lerpColor([5, 6, 11], primary, 0.1);
      const clarity = lerpColor(primary, [244, 247, 255], 0.9);
      const warm = lerpColor(accent, [255, 237, 208], 0.58);
      const field = lerpColor(primary, accent, 0.24);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.74);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + mass * 0.08) * entrance * boost)));
      stage.addColorStop(0.6, rgba(field, Math.min(0.08, (0.02 + mass * 0.03) * entrance * boost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const dread = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.92);
      dread.addColorStop(0, rgba(threat, Math.min(0.28, (0.08 + mass * 0.14) * entrance * boost)));
      dread.addColorStop(0.55, rgba(dense, Math.min(0.16, (0.05 + mass * 0.08) * entrance * boost)));
      dread.addColorStop(1, rgba(dense, 0));
      ctx.fillStyle = dread;
      ctx.fillRect(0, 0, w, h);

      const baseR = minDim * 0.23;
      const top: [number, number] = [cx, cy - baseR];
      const left: [number, number] = [cx - baseR * 0.88, cy + baseR * 0.52];
      const right: [number, number] = [cx + baseR * 0.88, cy + baseR * 0.52];
      const gapShift = reveal * minDim * 0.28;

      const topA: [number, number] = [top[0], top[1] - gapShift * 0.18];
      const leftA: [number, number] = [left[0] - gapShift * 0.65, left[1] + gapShift * 0.18];
      const rightA: [number, number] = [right[0] + gapShift * 0.65, right[1] + gapShift * 0.18];

      const beamW = px(0.034, minDim);
      drawBeam(ctx, topA, leftA, beamW, threat, Math.min(0.64, (0.18 + mass * 0.36) * entrance * boost));
      drawBeam(ctx, leftA, rightA, beamW, dense, Math.min(0.72, (0.22 + mass * 0.34) * entrance * boost));
      drawBeam(ctx, rightA, topA, beamW, threat, Math.min(0.58, (0.16 + mass * 0.28) * entrance * boost));

      drawBeam(ctx, topA, leftA, beamW * 0.34, clarity, Math.min(0.22, (0.04 + reveal * 0.08) * entrance * boost));
      drawBeam(ctx, leftA, rightA, beamW * 0.28, warm, Math.min(0.18, (0.02 + reveal * 0.08 + breathAmplitude * 0.05 * ms) * entrance * boost));

      if (reveal > 0.18) {
        ctx.beginPath();
        ctx.moveTo(cx + baseR * 0.12, cy - baseR * 0.06);
        ctx.lineTo(cx + baseR * 0.58 + gapShift * 0.44, cy + baseR * 0.28);
        ctx.lineTo(cx + baseR * 0.18 + gapShift * 0.3, cy + baseR * 0.58);
        ctx.lineTo(cx - baseR * 0.08, cy + baseR * 0.18);
        ctx.closePath();
        ctx.fillStyle = rgba(clarity, Math.min(0.12, reveal * 0.12 * entrance * boost));
        ctx.fill();
      }

      const ringR = minDim * 0.34;
      const guide = ctx.createRadialGradient(cx, cy, ringR * 0.35, cx, cy, ringR);
      guide.addColorStop(0, rgba(clarity, 0));
      guide.addColorStop(1, rgba(clarity, Math.min(0.08, (0.03 + mass * 0.03) * entrance * boost)));
      ctx.strokeStyle = guide;
      ctx.lineWidth = px(0.0012, minDim);
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, -Math.PI * 0.2, Math.PI * 1.2);
      ctx.stroke();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.42);
        flash.addColorStop(0, rgba(clarity, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.62) * entrance));
        flash.addColorStop(1, rgba(clarity, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.42, cy - minDim * 0.42, minDim * 0.84, minDim * 0.84);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.startX = e.clientX;
      if (!stateRef.current.dragCommitted) {
        stateRef.current.dragCommitted = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      s.rotation = clamp(Math.abs(e.clientX - s.startX) / 140, 0, 1);
    };

    const onUp = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.dragging = false;
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
