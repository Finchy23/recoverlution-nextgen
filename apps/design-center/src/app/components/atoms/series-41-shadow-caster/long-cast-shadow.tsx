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
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const OBJECT_POS = { x: 0.48, y: 0.76 };
const LIGHT_START = { x: 0.14, y: 0.76 };
const LIGHT_END = { x: 0.5, y: 0.16 };
const HANDLE_HIT = 0.1;
const STEP_T = 0.6;
const COMPLETE_T = 0.97;
const FLASH_DECAY = 0.022;

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

export default function LongCastShadowAtom({
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
    lift: 0,
    dragging: false,
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

      if (p.phase === 'resolve' && !s.dragging) {
        s.lift += (1 - s.lift) * 0.08;
      }

      const reveal = easeOutCubic(clamp(s.lift, 0, 1));
      const futureMass = 1 - reveal;
      const stageBoost = p.composed ? 1.18 : 1;

      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 1;
        cb.onHaptic('drag_snap');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      const objectX = OBJECT_POS.x * w;
      const objectY = OBJECT_POS.y * h;
      const lightX = mix(LIGHT_START.x * w, LIGHT_END.x * w, reveal);
      const lightY = mix(LIGHT_START.y * h, LIGHT_END.y * h, reveal);
      const targetX = LIGHT_END.x * w;
      const targetY = LIGHT_END.y * h;

      const dx = objectX - lightX;
      const dy = objectY - lightY;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dirX = dx / dist;
      const dirY = dy / dist;
      const perpX = -dirY;
      const perpY = dirX;

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.22);
      const threat = lerpColor([7, 8, 14], accent, 0.12);
      const denseShadow = lerpColor([3, 4, 8], primary, 0.06);
      const warmLight = lerpColor(accent, [255, 238, 206], 0.48);
      const objectLight = lerpColor(primary, [238, 242, 255], 0.8);
      const targetColor = lerpColor(primary, [247, 249, 255], 0.9);

      const stage = ctx.createRadialGradient(objectX, objectY + minDim * 0.04, 0, objectX, objectY + minDim * 0.04, minDim * 0.56);
      stage.addColorStop(0, rgba(field, Math.min(0.18, (0.05 + futureMass * 0.08 + reveal * 0.05) * entrance * stageBoost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.02 + futureMass * 0.03) * entrance * stageBoost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(objectX - minDim * 0.56, objectY - minDim * 0.34, minDim * 1.12, minDim * 0.92);

      const veil = ctx.createLinearGradient(0, objectY, w, objectY - minDim * 0.08);
      veil.addColorStop(0, rgba(threat, Math.min(0.32, (0.1 + futureMass * 0.18) * entrance * stageBoost)));
      veil.addColorStop(0.4, rgba(denseShadow, Math.min(0.28, (0.08 + futureMass * 0.16) * entrance * stageBoost)));
      veil.addColorStop(1, rgba(denseShadow, 0));
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);

      const horizonY = objectY + px(0.036, minDim);
      ctx.beginPath();
      ctx.moveTo(px(0.08, minDim), horizonY);
      ctx.lineTo(w - px(0.08, minDim), horizonY);
      ctx.strokeStyle = rgba(targetColor, Math.min(0.12, (0.03 + reveal * 0.06) * entrance * stageBoost));
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      const targetPulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.04 * ms);
      const targetGlow = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, px(0.18, minDim));
      targetGlow.addColorStop(0, rgba(targetColor, Math.min(0.16, (0.04 + reveal * 0.08 + targetPulse * 0.012) * entrance * stageBoost)));
      targetGlow.addColorStop(1, rgba(targetColor, 0));
      ctx.fillStyle = targetGlow;
      ctx.fillRect(targetX - minDim * 0.18, targetY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(targetX, targetY, px(0.07, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(targetColor, Math.min(0.22, (0.07 + futureMass * 0.06) * entrance * stageBoost));
      ctx.lineWidth = px(0.0012, minDim);
      ctx.stroke();

      const shadowLength = px(mix(2.4, 0.1, reveal), minDim);
      const nearWidth = px(mix(0.028, 0.012, reveal), minDim);
      const farWidth = px(mix(0.62, 0.045, reveal), minDim);
      const baseA: [number, number] = [objectX + perpX * nearWidth, objectY + perpY * nearWidth];
      const baseB: [number, number] = [objectX - perpX * nearWidth, objectY - perpY * nearWidth];
      const endX = objectX + dirX * shadowLength;
      const endY = objectY + dirY * shadowLength;
      const farA: [number, number] = [endX + perpX * farWidth, endY + perpY * farWidth];
      const farB: [number, number] = [endX - perpX * farWidth, endY - perpY * farWidth];
      fillPolygon(ctx, [baseA, farA, farB, baseB], threat, Math.min(0.3, (0.1 + futureMass * 0.18) * entrance * stageBoost));
      fillPolygon(
        ctx,
        [
          [objectX + perpX * nearWidth * 0.7, objectY + perpY * nearWidth * 0.7],
          [endX + perpX * farWidth * 0.68, endY + perpY * farWidth * 0.68],
          [endX - perpX * farWidth * 0.68, endY - perpY * farWidth * 0.68],
          [objectX - perpX * nearWidth * 0.7, objectY - perpY * nearWidth * 0.7],
        ],
        denseShadow,
        Math.min(0.5, (0.22 + futureMass * 0.24) * entrance * stageBoost),
      );
      fillPolygon(
        ctx,
        [
          [objectX + perpX * nearWidth * 0.24, objectY + perpY * nearWidth * 0.24],
          [endX + perpX * farWidth * 0.14, endY + perpY * farWidth * 0.14],
          [endX - perpX * farWidth * 0.14, endY - perpY * farWidth * 0.14],
          [objectX - perpX * nearWidth * 0.24, objectY - perpY * nearWidth * 0.24],
        ],
        [0, 0, 0],
        Math.min(0.58, (0.3 + futureMass * 0.26) * entrance * stageBoost),
      );

      if (!p.reducedMotion) {
        for (let i = 0; i < 3; i++) {
          const trailT = i / 2;
          const reelAlpha = Math.max(0, futureMass - trailT * 0.18);
          if (reelAlpha <= 0) continue;
          const trailLength = shadowLength * (0.9 + trailT * 0.24);
          const trailEndX = objectX + dirX * trailLength;
          const trailEndY = objectY + dirY * trailLength;
          ctx.beginPath();
          ctx.moveTo(objectX, objectY);
          ctx.lineTo(trailEndX, trailEndY);
          ctx.strokeStyle = rgba(accent, Math.min(0.14, (0.02 + reelAlpha * 0.04) * entrance * stageBoost));
          ctx.lineWidth = px(0.001 * (1 - trailT * 0.2), minDim);
          ctx.stroke();
        }
      }

      const objectGlow = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, px(0.12, minDim));
      objectGlow.addColorStop(0, rgba(objectLight, Math.min(0.34, (0.04 + reveal * 0.2 + s.revealFlash * 0.14) * entrance * stageBoost)));
      objectGlow.addColorStop(1, rgba(objectLight, 0));
      ctx.fillStyle = objectGlow;
      ctx.fillRect(objectX - minDim * 0.14, objectY - minDim * 0.14, minDim * 0.28, minDim * 0.28);

      const postW = px(0.016, minDim);
      const postH = px(0.1, minDim);
      ctx.beginPath();
      ctx.roundRect(objectX - postW / 2, objectY - postH * 0.78, postW, postH, postW / 2);
      ctx.fillStyle = rgba(objectLight, Math.min(0.9, (0.2 + reveal * 0.7) * entrance * stageBoost));
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(objectX, objectY + px(0.014, minDim), px(0.038, minDim), px(0.014, minDim), 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(objectLight, Math.min(0.95, (0.26 + reveal * 0.7) * entrance * stageBoost));
      ctx.fill();

      const beam = ctx.createLinearGradient(lightX, lightY, objectX, objectY);
      beam.addColorStop(0, rgba(warmLight, (0.16 + reveal * 0.12) * entrance));
      beam.addColorStop(1, rgba(warmLight, 0));
      ctx.beginPath();
      ctx.moveTo(lightX - px(0.014, minDim), lightY + px(0.014, minDim));
      ctx.lineTo(lightX + px(0.014, minDim), lightY + px(0.014, minDim));
      ctx.lineTo(objectX + perpX * px(0.018, minDim), objectY + perpY * px(0.018, minDim));
      ctx.lineTo(objectX - perpX * px(0.018, minDim), objectY - perpY * px(0.018, minDim));
      ctx.closePath();
      ctx.fillStyle = beam;
      ctx.fill();

      const handleR = px(mix(0.032, 0.044, reveal) + breathAmplitude * 0.004 * ms, minDim);
      const handleGlow = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, handleR * 3.3);
      handleGlow.addColorStop(0, rgba(warmLight, Math.min(0.44, (0.22 + reveal * 0.22 + s.revealFlash * 0.12) * entrance * stageBoost)));
      handleGlow.addColorStop(0.58, rgba(warmLight, Math.min(0.16, (0.08 + reveal * 0.08) * entrance * stageBoost)));
      handleGlow.addColorStop(1, rgba(warmLight, 0));
      ctx.fillStyle = handleGlow;
      ctx.fillRect(lightX - handleR * 3.4, lightY - handleR * 3.4, handleR * 6.8, handleR * 6.8);
      ctx.beginPath();
      ctx.arc(lightX, lightY, handleR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(warmLight, Math.min(0.98, (0.62 + reveal * 0.3) * entrance * stageBoost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lightX, lightY, handleR * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 250, 243], Math.min(1, (0.7 + reveal * 0.24) * entrance * stageBoost));
      ctx.fill();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.2 + Math.max(0, reveal - 0.9) * 0.72) * entrance;
        const corona = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, minDim * 0.28);
        corona.addColorStop(0, rgba(targetColor, flashAlpha));
        corona.addColorStop(1, rgba(targetColor, 0));
        ctx.fillStyle = corona;
        ctx.fillRect(objectX - minDim * 0.28, objectY - minDim * 0.28, minDim * 0.56, minDim * 0.56);
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
      const s = stateRef.current;
      const p = getPoint(e);
      const lightX = mix(LIGHT_START.x * viewport.width, LIGHT_END.x * viewport.width, s.lift);
      const lightY = mix(LIGHT_START.y * viewport.height, LIGHT_END.y * viewport.height, s.lift);
      const hitR = Math.min(viewport.width, viewport.height) * HANDLE_HIT;
      if (Math.hypot(p.x - lightX, p.y - lightY) > hitR) return;
      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      const normalizedX = clamp((p.x / viewport.width - LIGHT_START.x) / (LIGHT_END.x - LIGHT_START.x), 0, 1);
      const normalizedY = clamp((LIGHT_START.y - p.y / viewport.height) / (LIGHT_START.y - LIGHT_END.y), 0, 1);
      s.lift = clamp(normalizedX * 0.32 + normalizedY * 0.78, 0, 1);
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
