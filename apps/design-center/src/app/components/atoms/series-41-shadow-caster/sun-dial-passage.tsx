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
const FLASH_DECAY = 0.02;
const HOLD_STEP = 0.014;
const STEP_T = 0.58;
const COMPLETE_T = 0.97;
const HIT_R = 0.1;

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

export default function SunDialPassageAtom({
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
    progress: 0,
    holding: false,
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

      if (s.holding || phase === 'resolve') s.progress = clamp(s.progress + HOLD_STEP * (s.holding ? 1 : 0.6), 0, 1);
      const reveal = easeOutCubic(s.progress);
      const night = 1 - reveal;
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
      const warm = lerpColor(accent, [255, 218, 164], 0.44);
      const late = lerpColor(primary, [255, 240, 212], 0.9);
      const shadowColor = lerpColor([4, 5, 8], primary, 0.04);

      const sky = ctx.createRadialGradient(cx, cy * 0.62, 0, cx, cy * 0.62, minDim * 0.96);
      sky.addColorStop(0, rgba(warm, Math.min(0.16, (0.03 + reveal * 0.12) * entrance * stageBoost)));
      sky.addColorStop(0.55, rgba(field, Math.min(0.12, (0.04 + night * 0.08) * entrance * stageBoost)));
      sky.addColorStop(1, rgba(shadowColor, Math.min(0.28, (0.08 + night * 0.2) * entrance * stageBoost)));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const dialX = cx;
      const dialY = h * 0.74;
      const dialR = px(0.24, minDim);
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(late, Math.min(0.18, (0.06 + reveal * 0.08) * entrance * stageBoost));
      ctx.lineWidth = px(0.0014, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(dialX, dialY, dialR * 0.74, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(late, Math.min(0.1, (0.03 + reveal * 0.04) * entrance * stageBoost));
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      const gnomonTopY = dialY - px(0.14, minDim);
      ctx.beginPath();
      ctx.moveTo(dialX, dialY);
      ctx.lineTo(dialX, gnomonTopY);
      ctx.strokeStyle = rgba(late, Math.min(0.64, (0.18 + reveal * 0.32) * entrance * stageBoost));
      ctx.lineWidth = px(0.006, minDim);
      ctx.stroke();

      const angle = mix(-1.18, 1.1, reveal);
      const sunOrbitR = px(0.36, minDim);
      const sunX = dialX + Math.cos(angle) * sunOrbitR;
      const sunY = dialY - Math.sin(angle) * sunOrbitR;

      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, px(0.18, minDim));
      sunGlow.addColorStop(0, rgba(warm, Math.min(0.42, (0.18 + reveal * 0.16 + s.revealFlash * 0.08) * entrance * stageBoost)));
      sunGlow.addColorStop(1, rgba(warm, 0));
      ctx.fillStyle = sunGlow;
      ctx.fillRect(sunX - minDim * 0.2, sunY - minDim * 0.2, minDim * 0.4, minDim * 0.4);
      ctx.beginPath();
      ctx.arc(sunX, sunY, px(0.038 + breathAmplitude * 0.004 * ms, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(warm, Math.min(0.96, (0.36 + reveal * 0.42) * entrance * stageBoost));
      ctx.fill();

      const dx = dialX - sunX;
      const dy = dialY - sunY;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dirX = dx / dist;
      const dirY = dy / dist;
      const perpX = -dirY;
      const perpY = dirX;
      const shadowLength = px(mix(1.3, 0.08, reveal), minDim);
      const shadowFar = shadowLength;
      const baseWidth = px(0.024, minDim);
      const farWidth = px(mix(0.22, 0.03, reveal), minDim);
      const endX = dialX + dirX * shadowFar;
      const endY = dialY + dirY * shadowFar;
      fillPolygon(
        ctx,
        [
          [dialX + perpX * baseWidth, dialY + perpY * baseWidth],
          [endX + perpX * farWidth, endY + perpY * farWidth],
          [endX - perpX * farWidth, endY - perpY * farWidth],
          [dialX - perpX * baseWidth, dialY - perpY * baseWidth],
        ],
        shadowColor,
        Math.min(0.56, (0.18 + night * 0.36) * entrance * stageBoost),
      );

      if (s.holding) {
        const holdRing = ctx.createRadialGradient(dialX, dialY, 0, dialX, dialY, dialR * 1.3);
        holdRing.addColorStop(0, rgba(late, Math.min(0.16, (0.06 + reveal * 0.06) * entrance * stageBoost)));
        holdRing.addColorStop(1, rgba(late, 0));
        ctx.fillStyle = holdRing;
        ctx.fillRect(dialX - dialR * 1.4, dialY - dialR * 1.4, dialR * 2.8, dialR * 2.8);
      }

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.24 + Math.max(0, reveal - 0.9) * 0.62) * entrance;
        const flash = ctx.createRadialGradient(dialX, dialY, 0, dialX, dialY, minDim * 0.4);
        flash.addColorStop(0, rgba(late, flashAlpha));
        flash.addColorStop(1, rgba(late, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(dialX - minDim * 0.4, dialY - minDim * 0.4, minDim * 0.8, minDim * 0.8);
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

    const onDown = (e: PointerEvent) => {
      const p = getPoint(e);
      const dialX = viewport.width * 0.5;
      const dialY = viewport.height * 0.74;
      const hit = Math.min(viewport.width, viewport.height) * HIT_R;
      if (Math.hypot(p.x - dialX, p.y - dialY) > hit) return;
      stateRef.current.holding = true;
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
