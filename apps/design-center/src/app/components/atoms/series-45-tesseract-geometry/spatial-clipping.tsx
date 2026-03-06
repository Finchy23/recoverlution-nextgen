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
const PINCH_SPAN = 0.34;

type Point = { x: number; y: number };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function drawMass(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  skew: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(-w * 0.52 + skew, -h * 0.24);
  ctx.bezierCurveTo(-w * 0.34, -h * 0.62, w * 0.16, -h * 0.62, w * 0.48 + skew, -h * 0.16);
  ctx.bezierCurveTo(w * 0.6, h * 0.06, w * 0.38, h * 0.46, 0, h * 0.56);
  ctx.bezierCurveTo(-w * 0.34, h * 0.48, -w * 0.62, h * 0.08, -w * 0.52 + skew, -h * 0.24);
  ctx.closePath();
  ctx.restore();
}

export default function SpatialClippingAtom({
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
    pointers: {} as Record<number, Point>,
    pinchBaseline: 0,
    targetSeparate: 0,
    separate: 0,
    jitterSeed: 0,
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
      if (p.phase === 'resolve') s.targetSeparate = 1;

      const pointerList = Object.values(s.pointers);
      if (pointerList.length >= 2) {
        const d = distance(pointerList[0], pointerList[1]);
        if (s.pinchBaseline === 0) s.pinchBaseline = d;
        s.targetSeparate = Math.max(s.targetSeparate, clamp((d - s.pinchBaseline) / (minDim * PINCH_SPAN), 0, 1));
      } else {
        s.pinchBaseline = 0;
      }

      s.separate += (s.targetSeparate - s.separate) * 0.12 * ms;
      s.jitterSeed += (0.24 + (1 - s.separate) * 0.28) * ms;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.7 : 1));

      const reveal = easeOutCubic(clamp(s.separate, 0, 1));
      const overlap = 1 - reveal;
      const boost = p.composed ? 1.18 : 1;
      cb.onStateChange?.(reveal);

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 0.74;
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
      const dense = lerpColor([4, 5, 10], primary, 0.08);
      const leftColor = lerpColor(primary, [245, 247, 255], 0.76);
      const rightColor = lerpColor(accent, [255, 241, 221], 0.74);
      const spark = lerpColor(accent, [255, 250, 242], 0.88);

      const stage = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.96);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + reveal * 0.05) * entrance * boost)));
      stage.addColorStop(1, rgba(dense, Math.min(0.98, (0.28 + overlap * 0.22) * entrance * boost)));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const separation = minDim * 0.2 * reveal;
      const jitter = p.reducedMotion ? 0 : overlap * minDim * 0.018;
      const leftJitterX = Math.sin(s.jitterSeed * 2.1) * jitter;
      const leftJitterY = Math.cos(s.jitterSeed * 2.8) * jitter * 0.7;
      const rightJitterX = Math.cos(s.jitterSeed * 2.4) * jitter;
      const rightJitterY = Math.sin(s.jitterSeed * 3.1) * jitter * 0.65;

      drawMass(ctx, cx - separation + leftJitterX, cy + leftJitterY, minDim * 0.34, minDim * 0.22, -minDim * 0.03, -0.18 + reveal * 0.08);
      ctx.fillStyle = rgba(leftColor, Math.min(0.22, (0.08 + overlap * 0.12 + reveal * 0.05) * entrance * boost));
      ctx.fill();
      ctx.strokeStyle = rgba(leftColor, Math.min(0.82, (0.14 + overlap * 0.24 + reveal * 0.16) * entrance * boost));
      ctx.lineWidth = px(0.0054, minDim);
      ctx.stroke();

      drawMass(ctx, cx + separation + rightJitterX, cy + rightJitterY, minDim * 0.34, minDim * 0.22, minDim * 0.03, 0.18 - reveal * 0.08);
      ctx.fillStyle = rgba(rightColor, Math.min(0.2, (0.07 + overlap * 0.1 + reveal * 0.05) * entrance * boost));
      ctx.fill();
      ctx.strokeStyle = rgba(rightColor, Math.min(0.78, (0.14 + overlap * 0.2 + reveal * 0.14) * entrance * boost));
      ctx.lineWidth = px(0.0054, minDim);
      ctx.stroke();

      const clippingWidth = minDim * (0.18 - reveal * 0.14);
      const clippingHeight = minDim * 0.18;
      if (clippingWidth > minDim * 0.02) {
        const burn = ctx.createRadialGradient(cx, cy, 0, cx, cy, clippingWidth * 1.6);
        burn.addColorStop(0, rgba(spark, Math.min(0.28, (0.08 + overlap * 0.18 + s.revealFlash * 0.04) * entrance * boost)));
        burn.addColorStop(1, rgba(spark, 0));
        ctx.fillStyle = burn;
        ctx.fillRect(cx - clippingWidth * 1.6, cy - clippingWidth * 1.6, clippingWidth * 3.2, clippingWidth * 3.2);

        for (let i = 0; i < 12; i++) {
          const t = i / 11;
          const x = cx + Math.sin(s.jitterSeed * 1.6 + i) * clippingWidth * 0.4;
          const y = cy - clippingHeight * 0.5 + t * clippingHeight;
          const len = clippingWidth * (0.28 + Math.cos(s.jitterSeed * 2.2 + i) * 0.12);
          ctx.beginPath();
          ctx.moveTo(x - len * 0.5, y);
          ctx.lineTo(x + len * 0.5, y);
          ctx.strokeStyle = rgba(spark, Math.min(0.74, (0.16 + overlap * 0.38) * entrance * boost * (1 - t * 0.2)));
          ctx.lineWidth = px(0.0024, minDim);
          ctx.stroke();
        }
      }

      if (pointerList.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pointerList[0].x, pointerList[0].y);
        ctx.lineTo(pointerList[1].x, pointerList[1].y);
        ctx.strokeStyle = rgba(spark, Math.min(0.2, (0.08 + reveal * 0.08) * entrance * boost));
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.54);
        flash.addColorStop(0, rgba(spark, (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.64) * entrance));
        flash.addColorStop(1, rgba(spark, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - minDim * 0.54, cy - minDim * 0.54, minDim * 1.08, minDim * 1.08);
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
      stateRef.current.pointers[e.pointerId] = getPoint(e);
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!(e.pointerId in s.pointers)) return;
      s.pointers[e.pointerId] = getPoint(e);
    };

    const onUp = (e: PointerEvent) => {
      delete stateRef.current.pointers[e.pointerId];
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
