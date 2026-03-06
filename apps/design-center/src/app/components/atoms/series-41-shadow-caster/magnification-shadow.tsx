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
  ALPHA,
  px,
  SIZE,
  motionScale,
  type RGB,
} from '../atom-utils';

const LIGHT_START = { x: 0.22, y: 0.62 };
const LIGHT_TARGET = { x: 0.5, y: 0.14 };
const LIGHT_BOUNDS = { minX: 0.08, maxX: 0.92, minY: 0.1, maxY: 0.78 };
const OBJECT_POS = { x: 0.5, y: 0.69 };
const OBJECT_SIZE = 0.009;
const LIGHT_R = 0.036;
const TARGET_R = 0.082;
const HANDLE_HIT = 0.095;
const SHADOW_NEAR_MAX = 0.052;
const SHADOW_NEAR_MIN = 0.011;
const SHADOW_FAR_MAX = 0.68;
const SHADOW_FAR_MIN = 0.032;
const SHADOW_LENGTH_MAX = 1.62;
const SHADOW_LENGTH_MIN = 0.08;
const THRESHOLD_T = 0.58;
const COMPLETE_T = 0.965;
const REVEAL_FLASH_DECAY = 0.018;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function drawShadowLayer(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: RGB,
  alpha: number,
) {
  if (alpha <= 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = rgba(color, alpha);
  ctx.fill();
}

export default function MagnificationShadowAtom({
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
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => {
    cbRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    lightX: LIGHT_START.x,
    lightY: LIGHT_START.y,
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
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      if (p.phase === 'resolve' && !s.dragging) {
        s.lightX += (LIGHT_TARGET.x - s.lightX) * 0.08;
        s.lightY += (LIGHT_TARGET.y - s.lightY) * 0.08;
      }

      const lightX = s.lightX * w;
      const lightY = s.lightY * h;
      const objectX = OBJECT_POS.x * w;
      const objectY = OBJECT_POS.y * h;
      const targetX = LIGHT_TARGET.x * w;
      const targetY = LIGHT_TARGET.y * h;

      const xError =
        Math.abs(s.lightX - LIGHT_TARGET.x) /
        Math.max(0.01, Math.abs(LIGHT_START.x - LIGHT_TARGET.x));
      const yError =
        Math.max(0, s.lightY - LIGHT_TARGET.y) / Math.max(0.01, LIGHT_START.y - LIGHT_TARGET.y);
      const revealRaw = 1 - clamp(xError * 0.48 + yError * 0.72, 0, 1);
      const reveal = easeOutCubic(clamp(revealRaw, 0, 1));
      const shadowMass = 1 - reveal;

      if (reveal >= THRESHOLD_T && !s.thresholdFired) {
        s.thresholdFired = true;
        s.revealFlash = 1;
        cb.onHaptic('step_advance');
      }

      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      s.revealFlash = Math.max(0, s.revealFlash - REVEAL_FLASH_DECAY * (p.reducedMotion ? 0.6 : 1));
      cb.onStateChange?.(reveal);

      const shadowColor = lerpColor([4, 5, 10], s.primaryRgb, 0.08);
      const threatShadow = lerpColor([6, 7, 14], s.accentRgb, 0.12);
      const targetColor = lerpColor(s.primaryRgb, [240, 244, 255], 0.65);
      const lightColor = lerpColor(s.accentRgb, [255, 246, 220], 0.6);
      const objectColor = lerpColor(s.primaryRgb, [232, 238, 255], 0.78);
      const fieldColor = lerpColor(s.primaryRgb, s.accentRgb, 0.32);
      const boost = p.composed ? 1.22 : 1;

      // Hero stage. This lets the atom harmonise with the atmosphere while still owning the phone.
      const stageGlow = ctx.createRadialGradient(
        objectX,
        objectY + minDim * 0.04,
        0,
        objectX,
        objectY + minDim * 0.04,
        minDim * 0.42,
      );
      stageGlow.addColorStop(
        0,
        rgba(fieldColor, Math.min(0.16, (0.05 + shadowMass * 0.07) * entrance * boost)),
      );
      stageGlow.addColorStop(
        0.6,
        rgba(fieldColor, Math.min(0.08, (0.02 + shadowMass * 0.03) * entrance * boost)),
      );
      stageGlow.addColorStop(1, rgba(fieldColor, 0));
      ctx.fillStyle = stageGlow;
      ctx.fillRect(objectX - minDim * 0.42, objectY - minDim * 0.26, minDim * 0.84, minDim * 0.68);

      ctx.beginPath();
      ctx.ellipse(
        objectX,
        objectY + px(0.028, minDim),
        px(0.18 + reveal * 0.05, minDim),
        px(0.05 + reveal * 0.012, minDim),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = rgba(
        shadowColor,
        Math.min(0.3, (0.08 + shadowMass * 0.14) * entrance * boost),
      );
      ctx.fill();

      // Global dread veil. The shadow should own the room until the light gets honest.
      const veil = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, minDim * 0.95);
      veil.addColorStop(
        0,
        rgba(threatShadow, Math.min(0.42, (0.12 + shadowMass * 0.2) * entrance * boost)),
      );
      veil.addColorStop(
        0.45,
        rgba(shadowColor, Math.min(0.28, (0.08 + shadowMass * 0.16) * entrance * boost)),
      );
      veil.addColorStop(1, rgba(shadowColor, 0));
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);

      // Overhead target halo. Not copy, just a quiet gravitational truth.
      const targetPulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.04 * ms);
      const targetGlow = ctx.createRadialGradient(
        targetX,
        targetY,
        0,
        targetX,
        targetY,
        px(TARGET_R, minDim) * 1.75,
      );
      targetGlow.addColorStop(
        0,
        rgba(
          targetColor,
          Math.min(0.18, (0.05 + reveal * 0.08 + targetPulse * 0.012) * entrance * boost),
        ),
      );
      targetGlow.addColorStop(1, rgba(targetColor, 0));
      ctx.fillStyle = targetGlow;
      ctx.fillRect(targetX - minDim * 0.2, targetY - minDim * 0.2, minDim * 0.4, minDim * 0.4);
      ctx.beginPath();
      ctx.arc(targetX, targetY, px(TARGET_R, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(
        targetColor,
        Math.min(0.26, (0.1 + shadowMass * 0.08) * entrance * boost),
      );
      ctx.lineWidth = px(0.0013, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(targetX, targetY, px(TARGET_R * 0.58, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(
        lightColor,
        Math.min(0.22, (0.08 + targetPulse * 0.04) * entrance * boost),
      );
      ctx.lineWidth = px(0.0009, minDim);
      ctx.stroke();

      // Projection geometry.
      const dx = objectX - lightX;
      const dy = objectY - lightY;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dirX = dx / dist;
      const dirY = dy / dist;
      const perpX = -dirY;
      const perpY = dirX;
      const shadowLength = px(
        SHADOW_LENGTH_MIN + shadowMass * (SHADOW_LENGTH_MAX - SHADOW_LENGTH_MIN),
        minDim,
      );
      const nearWidth = px(
        SHADOW_NEAR_MIN + shadowMass * (SHADOW_NEAR_MAX - SHADOW_NEAR_MIN),
        minDim,
      );
      const farWidth = px(SHADOW_FAR_MIN + shadowMass * (SHADOW_FAR_MAX - SHADOW_FAR_MIN), minDim);
      const endX = objectX + dirX * shadowLength;
      const endY = objectY + dirY * shadowLength;

      const baseA: [number, number] = [objectX + perpX * nearWidth, objectY + perpY * nearWidth];
      const baseB: [number, number] = [objectX - perpX * nearWidth, objectY - perpY * nearWidth];
      const farA: [number, number] = [endX + perpX * farWidth, endY + perpY * farWidth];
      const farB: [number, number] = [endX - perpX * farWidth, endY - perpY * farWidth];

      drawShadowLayer(
        ctx,
        [baseA, farA, farB, baseB],
        threatShadow,
        Math.min(0.34, (0.11 + shadowMass * 0.18) * entrance * boost),
      );
      drawShadowLayer(
        ctx,
        [
          [objectX + perpX * nearWidth * 0.62, objectY + perpY * nearWidth * 0.62],
          [endX + perpX * farWidth * 0.7, endY + perpY * farWidth * 0.7],
          [endX - perpX * farWidth * 0.7, endY - perpY * farWidth * 0.7],
          [objectX - perpX * nearWidth * 0.62, objectY - perpY * nearWidth * 0.62],
        ],
        shadowColor,
        Math.min(0.42, (0.16 + shadowMass * 0.24) * entrance * boost),
      );
      drawShadowLayer(
        ctx,
        [
          [objectX + perpX * nearWidth * 0.28, objectY + perpY * nearWidth * 0.28],
          [endX + perpX * farWidth * 0.32, endY + perpY * farWidth * 0.32],
          [endX - perpX * farWidth * 0.32, endY - perpY * farWidth * 0.32],
          [objectX - perpX * nearWidth * 0.28, objectY - perpY * nearWidth * 0.28],
        ],
        [0, 0, 0],
        Math.min(0.54, (0.24 + shadowMass * 0.34) * entrance * boost),
      );

      // Shadow edge shimmer collapsing as the lie loses leverage.
      if (!p.reducedMotion && shadowMass > 0.05) {
        ctx.beginPath();
        ctx.moveTo(farA[0], farA[1]);
        ctx.lineTo(baseA[0], baseA[1]);
        ctx.strokeStyle = rgba(
          s.accentRgb,
          Math.min(0.22, (0.03 + shadowMass * 0.07) * entrance * boost),
        );
        ctx.lineWidth = px(0.0012, minDim);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(farB[0], farB[1]);
        ctx.lineTo(baseB[0], baseB[1]);
        ctx.strokeStyle = rgba(
          s.primaryRgb,
          Math.min(0.18, (0.02 + shadowMass * 0.05) * entrance * boost),
        );
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // The source object stays tiny throughout. The point is the lie, not the drama.
      const pixelSize = px(OBJECT_SIZE + reveal * 0.0035, minDim);
      const objectGlow = ctx.createRadialGradient(
        objectX,
        objectY,
        0,
        objectX,
        objectY,
        pixelSize * (5 + reveal * 6),
      );
      objectGlow.addColorStop(
        0,
        rgba(
          objectColor,
          Math.min(0.42, (0.05 + reveal * 0.24 + s.revealFlash * 0.2) * entrance * boost),
        ),
      );
      objectGlow.addColorStop(1, rgba(objectColor, 0));
      ctx.fillStyle = objectGlow;
      ctx.fillRect(
        objectX - pixelSize * 8,
        objectY - pixelSize * 8,
        pixelSize * 16,
        pixelSize * 16,
      );
      ctx.fillStyle = rgba(objectColor, Math.min(0.98, (0.28 + reveal * 0.8) * entrance * boost));
      ctx.fillRect(objectX - pixelSize * 0.5, objectY - pixelSize * 0.5, pixelSize, pixelSize);

      // Light shaft and handle.
      const beamGrad = ctx.createLinearGradient(lightX, lightY, objectX, objectY);
      beamGrad.addColorStop(0, rgba(lightColor, (0.13 + reveal * 0.12) * entrance));
      beamGrad.addColorStop(1, rgba(lightColor, 0));
      ctx.beginPath();
      ctx.moveTo(lightX - px(0.013, minDim), lightY + px(0.012, minDim));
      ctx.lineTo(lightX + px(0.013, minDim), lightY + px(0.012, minDim));
      ctx.lineTo(objectX + perpX * px(0.018, minDim), objectY + perpY * px(0.018, minDim));
      ctx.lineTo(objectX - perpX * px(0.018, minDim), objectY - perpY * px(0.018, minDim));
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();

      const lightRadius = px(LIGHT_R + reveal * 0.01 + breathAmplitude * 0.006 * ms, minDim);
      const lightGlow = ctx.createRadialGradient(
        lightX,
        lightY,
        0,
        lightX,
        lightY,
        lightRadius * 3.2,
      );
      lightGlow.addColorStop(
        0,
        rgba(
          lightColor,
          Math.min(0.48, (0.24 + reveal * 0.26 + s.revealFlash * 0.12) * entrance * boost),
        ),
      );
      lightGlow.addColorStop(
        0.55,
        rgba(lightColor, Math.min(0.18, (0.08 + reveal * 0.1) * entrance * boost)),
      );
      lightGlow.addColorStop(1, rgba(lightColor, 0));
      ctx.fillStyle = lightGlow;
      ctx.fillRect(
        lightX - lightRadius * 3.2,
        lightY - lightRadius * 3.2,
        lightRadius * 6.4,
        lightRadius * 6.4,
      );
      ctx.beginPath();
      ctx.arc(lightX, lightY, lightRadius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lightColor, Math.min(0.98, (0.62 + reveal * 0.34) * entrance * boost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lightX, lightY, lightRadius * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 252, 245], Math.min(1, (0.65 + reveal * 0.4) * entrance * boost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lightX, lightY, lightRadius * 1.22, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(
        targetColor,
        Math.min(0.26, (0.08 + reveal * 0.06) * entrance * boost),
      );
      ctx.lineWidth = px(0.0011, minDim);
      ctx.stroke();

      // Resolution corona when the illusion breaks.
      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.2 + Math.max(0, reveal - 0.9) * 0.7) * entrance;
        const corona = ctx.createRadialGradient(
          objectX,
          objectY,
          0,
          objectX,
          objectY,
          minDim * 0.28,
        );
        corona.addColorStop(0, rgba(targetColor, flashAlpha));
        corona.addColorStop(1, rgba(targetColor, 0));
        ctx.fillStyle = corona;
        ctx.fillRect(
          objectX - minDim * 0.28,
          objectY - minDim * 0.28,
          minDim * 0.56,
          minDim * 0.56,
        );
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
      const lightX = s.lightX * viewport.width;
      const lightY = s.lightY * viewport.height;
      const hitR = Math.min(viewport.width, viewport.height) * HANDLE_HIT;
      if (Math.hypot(p.x - lightX, p.y - lightY) > hitR) return;
      s.dragging = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      s.lightX = clamp(p.x / viewport.width, LIGHT_BOUNDS.minX, LIGHT_BOUNDS.maxX);
      s.lightY = clamp(p.y / viewport.height, LIGHT_BOUNDS.minY, LIGHT_BOUNDS.maxY);
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'grab',
        }}
      />
    </div>
  );
}
