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
const STEP_T = 0.54;
const COMPLETE_T = 0.965;
const PINCH_MIN = 26;
const PINCH_MAX = 220;

function fillPolygon(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: RGB,
  alpha: number,
) {
  if (alpha <= 0 || points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = rgba(color, alpha);
  ctx.fill();
}

export default function PenumbraBlurAtom({
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
    focus: 0,
    pointers: new Map<number, { x: number; y: number }>(),
    pinchActive: false,
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
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve' && !s.pinchActive) s.focus += (1 - s.focus) * 0.08;

      const reveal = easeOutCubic(clamp(s.focus, 0, 1));
      const blurMass = 1 - reveal;
      const stageBoost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
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
      const field = lerpColor(primary, accent, 0.22);
      const threat = lerpColor([8, 8, 14], accent, 0.12);
      const denseShadow = lerpColor([4, 5, 9], primary, 0.06);
      const lightColor = lerpColor(accent, [255, 240, 206], 0.48);
      const clarityColor = lerpColor(primary, [242, 247, 255], 0.9);

      const stage = ctx.createRadialGradient(cx, cy * 0.9, 0, cx, cy * 0.9, minDim * 0.74);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + blurMass * 0.08 + reveal * 0.04) * entrance * stageBoost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + blurMass * 0.03) * entrance * stageBoost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(0, 0, w, h);

      const lightX = cx;
      const lightY = h * 0.16;
      const apertureDist = px(0.18 - reveal * 0.12, minDim);
      const apertureY = lightY + px(0.02, minDim);
      const leftX = lightX - apertureDist;
      const rightX = lightX + apertureDist;

      const lightGlow = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, px(0.2, minDim));
      lightGlow.addColorStop(0, rgba(lightColor, Math.min(0.38, (0.14 + reveal * 0.18 + s.revealFlash * 0.08) * entrance * stageBoost)));
      lightGlow.addColorStop(1, rgba(lightColor, 0));
      ctx.fillStyle = lightGlow;
      ctx.fillRect(lightX - minDim * 0.22, lightY - minDim * 0.22, minDim * 0.44, minDim * 0.44);
      ctx.beginPath();
      ctx.arc(lightX, lightY, px(0.038, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lightColor, Math.min(0.94, (0.34 + reveal * 0.48) * entrance * stageBoost));
      ctx.fill();

      for (const x of [leftX, rightX]) {
        ctx.beginPath();
        ctx.roundRect(x - px(0.014, minDim), apertureY - px(0.048, minDim), px(0.028, minDim), px(0.096, minDim), px(0.01, minDim));
        ctx.fillStyle = rgba(clarityColor, Math.min(0.82, (0.16 + reveal * 0.64) * entrance * stageBoost));
        ctx.fill();
      }

      const shapeCenterX = cx;
      const shapeCenterY = h * 0.68;
      const coreShape: [number, number][] = [
        [shapeCenterX, shapeCenterY - px(0.18, minDim)],
        [shapeCenterX + px(0.11, minDim), shapeCenterY - px(0.02, minDim)],
        [shapeCenterX + px(0.05, minDim), shapeCenterY + px(0.16, minDim)],
        [shapeCenterX - px(0.05, minDim), shapeCenterY + px(0.16, minDim)],
        [shapeCenterX - px(0.11, minDim), shapeCenterY - px(0.02, minDim)],
      ];

      const layers = p.reducedMotion ? 4 : 9;
      for (let i = 0; i < layers; i++) {
        const t = layers === 1 ? 0 : i / (layers - 1);
        const spread = px((0.16 - reveal * 0.14) * (1 - t * 0.25), minDim);
        const offsetX = Math.sin(s.frameCount * 0.03 * ms + i * 0.9) * spread * (0.9 - reveal * 0.7);
        const offsetY = Math.cos(s.frameCount * 0.024 * ms + i * 1.2) * spread * (0.7 - reveal * 0.5);
        const scale = 1 + blurMass * (0.5 - t * 0.16);
        const pts = coreShape.map(([x, y]) => [shapeCenterX + (x - shapeCenterX) * scale + offsetX, shapeCenterY + (y - shapeCenterY) * scale + offsetY] as [number, number]);
        fillPolygon(
          ctx,
          pts,
          i === layers - 1 ? denseShadow : threat,
          Math.min(0.14, (0.03 + blurMass * 0.08) * entrance * stageBoost * (0.8 - t * 0.28)),
        );
      }

      fillPolygon(
        ctx,
        coreShape,
        denseShadow,
        Math.min(0.58, (0.12 + reveal * 0.34) * entrance * stageBoost),
      );

      if (reveal > 0.55) {
        ctx.beginPath();
        ctx.moveTo(coreShape[0][0], coreShape[0][1]);
        ctx.lineTo(coreShape[2][0], coreShape[2][1]);
        ctx.lineTo(coreShape[4][0], coreShape[4][1]);
        ctx.closePath();
        ctx.strokeStyle = rgba(clarityColor, Math.min(0.16, (0.04 + reveal * 0.06) * entrance * stageBoost));
        ctx.lineWidth = px(0.0011, minDim);
        ctx.stroke();
      }

      if (s.pointers.size >= 2) {
        for (const pt of s.pointers.values()) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, px(0.042 + breathAmplitude * 0.003 * ms, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(clarityColor, Math.min(0.18, (0.08 + reveal * 0.06) * entrance * stageBoost));
          ctx.lineWidth = px(0.0012, minDim);
          ctx.stroke();
        }
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.62) * entrance;
        const flash = ctx.createRadialGradient(shapeCenterX, shapeCenterY, 0, shapeCenterX, shapeCenterY, minDim * 0.32);
        flash.addColorStop(0, rgba(clarityColor, flashAlpha));
        flash.addColorStop(1, rgba(clarityColor, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(shapeCenterX - minDim * 0.32, shapeCenterY - minDim * 0.32, minDim * 0.64, minDim * 0.64);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const updateFocusFromPinch = () => {
      const pts = [...stateRef.current.pointers.values()];
      if (pts.length < 2) return;
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      stateRef.current.focus = clamp((PINCH_MAX - d) / (PINCH_MAX - PINCH_MIN), 0, 1);
    };

    const onDown = (e: PointerEvent) => {
      const p = getPoint(e);
      stateRef.current.pointers.set(e.pointerId, p);
      canvas.setPointerCapture(e.pointerId);
      if (stateRef.current.pointers.size === 2 && !stateRef.current.pinchActive) {
        stateRef.current.pinchActive = true;
        callbacksRef.current.onHaptic('hold_start');
      }
      updateFocusFromPinch();
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.pointers.has(e.pointerId)) return;
      stateRef.current.pointers.set(e.pointerId, getPoint(e));
      updateFocusFromPinch();
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pointers.delete(e.pointerId);
      if (stateRef.current.pointers.size < 2) stateRef.current.pinchActive = false;
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'zoom-in' }}
      />
    </div>
  );
}
