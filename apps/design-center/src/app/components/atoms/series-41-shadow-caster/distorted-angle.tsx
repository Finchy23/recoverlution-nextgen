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

const LIGHT_START = 0;
const LIGHT_END = 1;
const OBJECT_POS = { x: 0.53, y: 0.7 };
const LIGHT_HANDLE_HIT = 0.1;
const PALM_HALF = 0.045;
const PALM_HEIGHT = 0.06;
const REVEAL_STEP = 0.52;
const COMPLETE_T = 0.965;
const FLASH_DECAY = 0.02;

const FINGER_OFFSETS = [-0.16, -0.08, 0, 0.08, 0.16];
const FINGER_LENGTHS = [0.56, 0.78, 0.9, 0.76, 0.58];
const FINGER_WIDTHS = [0.032, 0.036, 0.042, 0.036, 0.032];

function pointAlong(
  anchorX: number,
  anchorY: number,
  dirX: number,
  dirY: number,
  perpX: number,
  perpY: number,
  across: number,
  along: number,
): [number, number] {
  return [anchorX + perpX * across + dirX * along, anchorY + perpY * across + dirY * along];
}

function fillPath(
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

function strokePath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: RGB,
  alpha: number,
  width: number,
) {
  if (alpha <= 0 || points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = width;
  ctx.stroke();
}

export default function DistortedAngleAtom({
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
    sweep: LIGHT_START,
    dragging: false,
    swipeCommitFired: false,
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
        s.sweep += (LIGHT_END - s.sweep) * 0.08;
      }

      const reveal = easeOutCubic(clamp((s.sweep - LIGHT_START) / (LIGHT_END - LIGHT_START), 0, 1));
      const bladeMass = 1 - reveal;
      const stageBoost = p.composed ? 1.18 : 1;

      if (reveal >= REVEAL_STEP && !s.thresholdFired) {
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

      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(reveal);

      const objectX = OBJECT_POS.x * w;
      const objectY = OBJECT_POS.y * h;
      const lightX = mix(0.16 * w, objectX, reveal * 0.96);
      const lightY = mix(0.56 * h, 0.14 * h, reveal);
      const targetX = objectX;
      const targetY = 0.14 * h;

      const dx = objectX - lightX;
      const dy = objectY - lightY;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const dirX = dx / dist;
      const dirY = dy / dist;
      const perpX = -dirY;
      const perpY = dirX;

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const threat = lerpColor([8, 8, 14], accent, 0.16);
      const denseShadow = lerpColor([4, 5, 9], primary, 0.08);
      const warmth = lerpColor(accent, [255, 236, 208], 0.5);
      const objectGlow = lerpColor(primary, [234, 240, 255], 0.78);
      const handReveal = lerpColor(primary, [246, 248, 255], 0.9);
      const field = lerpColor(primary, accent, 0.28);

      const stage = ctx.createRadialGradient(objectX, objectY + minDim * 0.02, 0, objectX, objectY + minDim * 0.02, minDim * 0.48);
      stage.addColorStop(0, rgba(field, Math.min(0.16, (0.04 + bladeMass * 0.08 + reveal * 0.04) * entrance * stageBoost)));
      stage.addColorStop(0.58, rgba(field, Math.min(0.08, (0.018 + bladeMass * 0.03) * entrance * stageBoost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(objectX - minDim * 0.46, objectY - minDim * 0.34, minDim * 0.92, minDim * 0.84);

      const dreadVeil = ctx.createRadialGradient(objectX + dirX * minDim * 0.22, objectY + dirY * minDim * 0.22, 0, objectX + dirX * minDim * 0.22, objectY + dirY * minDim * 0.22, minDim * 0.98);
      dreadVeil.addColorStop(0, rgba(threat, Math.min(0.42, (0.12 + bladeMass * 0.22) * entrance * stageBoost)));
      dreadVeil.addColorStop(0.5, rgba(denseShadow, Math.min(0.24, (0.08 + bladeMass * 0.16) * entrance * stageBoost)));
      dreadVeil.addColorStop(1, rgba(denseShadow, 0));
      ctx.fillStyle = dreadVeil;
      ctx.fillRect(0, 0, w, h);

      const targetPulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.04 * ms);
      const targetGlow = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, px(0.16, minDim));
      targetGlow.addColorStop(0, rgba(handReveal, Math.min(0.18, (0.04 + reveal * 0.08 + targetPulse * 0.012) * entrance * stageBoost)));
      targetGlow.addColorStop(1, rgba(handReveal, 0));
      ctx.fillStyle = targetGlow;
      ctx.fillRect(targetX - minDim * 0.18, targetY - minDim * 0.18, minDim * 0.36, minDim * 0.36);
      ctx.beginPath();
      ctx.arc(targetX, targetY, px(0.066, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(handReveal, Math.min(0.24, (0.08 + bladeMass * 0.08) * entrance * stageBoost));
      ctx.lineWidth = px(0.0013, minDim);
      ctx.stroke();

      const shadowLength = px(mix(0.96, 0.46, reveal), minDim);
      const palmHalf = px(mix(0.018, PALM_HALF, reveal), minDim);
      const palmDepth = px(mix(0.07, PALM_HEIGHT, reveal), minDim);
      const palmTop = pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, 0, px(0.012, minDim));
      const palmBase = pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, 0, palmDepth);

      const palmPoints: [number, number][] = [
        pointAlong(palmTop[0], palmTop[1], dirX, dirY, perpX, perpY, -palmHalf * 0.7, 0),
        pointAlong(palmTop[0], palmTop[1], dirX, dirY, perpX, perpY, palmHalf * 0.7, 0),
        pointAlong(palmBase[0], palmBase[1], dirX, dirY, perpX, perpY, palmHalf, 0),
        pointAlong(palmBase[0], palmBase[1], dirX, dirY, perpX, perpY, -palmHalf, 0),
      ];
      fillPath(ctx, palmPoints, threat, Math.min(0.34, (0.1 + reveal * 0.14) * entrance * stageBoost));
      fillPath(ctx, palmPoints, denseShadow, Math.min(0.46, (0.18 + reveal * 0.22) * entrance * stageBoost));

      const fingerSpread = px(mix(0.018, 0.19, reveal), minDim);
      const fingerBaseY = px(0.018, minDim);
      const tipSplay = px(mix(0.01, 0.09, reveal), minDim);

      for (let i = 0; i < FINGER_OFFSETS.length; i++) {
        const baseAcross = fingerSpread * FINGER_OFFSETS[i];
        const tipAcross = baseAcross + tipSplay * FINGER_OFFSETS[i] * (1.35 + Math.abs(FINGER_OFFSETS[i]));
        const fingerLength = shadowLength * FINGER_LENGTHS[i];
        const fingerWidthBase = px(FINGER_WIDTHS[i], minDim) * mix(0.62, 1, reveal);
        const fingerWidthTip = fingerWidthBase * mix(0.22, 0.38, reveal);
        const baseCenter = pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, baseAcross, fingerBaseY);
        const tipCenter = pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, tipAcross, fingerLength);
        const fingerPoints: [number, number][] = [
          pointAlong(baseCenter[0], baseCenter[1], dirX, dirY, perpX, perpY, -fingerWidthBase, 0),
          pointAlong(baseCenter[0], baseCenter[1], dirX, dirY, perpX, perpY, fingerWidthBase, 0),
          pointAlong(tipCenter[0], tipCenter[1], dirX, dirY, perpX, perpY, fingerWidthTip, 0),
          pointAlong(tipCenter[0], tipCenter[1], dirX, dirY, perpX, perpY, -fingerWidthTip, 0),
        ];
        fillPath(ctx, fingerPoints, threat, Math.min(0.28, (0.08 + bladeMass * 0.04 + reveal * 0.06) * entrance * stageBoost));
        fillPath(ctx, fingerPoints, denseShadow, Math.min(0.46, (0.16 + bladeMass * 0.1 + reveal * 0.14) * entrance * stageBoost));

        if (!p.reducedMotion && reveal > 0.62) {
          strokePath(
            ctx,
            [
              pointAlong(baseCenter[0], baseCenter[1], dirX, dirY, perpX, perpY, 0, 0),
              pointAlong(tipCenter[0], tipCenter[1], dirX, dirY, perpX, perpY, 0, 0),
            ],
            handReveal,
            Math.min(0.12, (0.02 + reveal * 0.04) * entrance * stageBoost),
            px(0.0009, minDim),
          );
        }
      }

      const bladeCoreLength = shadowLength * mix(1.08, 0.42, reveal);
      const bladeHalf = px(mix(0.016, 0.006, reveal), minDim);
      const bladeTip = pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, 0, bladeCoreLength);
      const bladePoints: [number, number][] = [
        pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, -bladeHalf, px(0.02, minDim)),
        pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, bladeHalf, px(0.02, minDim)),
        pointAlong(bladeTip[0], bladeTip[1], dirX, dirY, perpX, perpY, 0, 0),
      ];
      fillPath(ctx, bladePoints, [0, 0, 0], Math.min(0.56, (0.22 + bladeMass * 0.34) * entrance * stageBoost));
      strokePath(
        ctx,
        [pointAlong(objectX, objectY, dirX, dirY, perpX, perpY, 0, px(0.02, minDim)), bladeTip],
        accent,
        Math.min(0.18, (0.04 + bladeMass * 0.06) * entrance * stageBoost),
        px(0.001, minDim),
      );

      const casterScale = px(0.08, minDim);
      const palmGlow = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, casterScale * 4.6);
      palmGlow.addColorStop(0, rgba(objectGlow, Math.min(0.36, (0.04 + reveal * 0.2 + s.revealFlash * 0.14) * entrance * stageBoost)));
      palmGlow.addColorStop(1, rgba(objectGlow, 0));
      ctx.fillStyle = palmGlow;
      ctx.fillRect(objectX - casterScale * 4.8, objectY - casterScale * 4.8, casterScale * 9.6, casterScale * 9.6);

      const palmW = casterScale * 0.72;
      const palmH = casterScale * 0.56;
      ctx.beginPath();
      ctx.roundRect(objectX - palmW / 2, objectY - palmH / 2, palmW, palmH, casterScale * 0.18);
      ctx.fillStyle = rgba(objectGlow, Math.min(0.9, (0.16 + reveal * 0.72) * entrance * stageBoost));
      ctx.fill();

      const rodSpread = casterScale * mix(0.08, 0.82, reveal);
      const rodBaseY = objectY - palmH * 0.48;
      for (let i = 0; i < FINGER_OFFSETS.length; i++) {
        const rodX = objectX + rodSpread * FINGER_OFFSETS[i];
        const rodH = casterScale * mix(0.42, 0.72 + (FINGER_LENGTHS[i] - 0.56) * 0.25, reveal);
        const rodW = casterScale * 0.08;
        ctx.beginPath();
        ctx.roundRect(rodX - rodW / 2, rodBaseY - rodH, rodW, rodH, rodW / 2);
        ctx.fillStyle = rgba(handReveal, Math.min(0.94, (0.18 + reveal * 0.7) * entrance * stageBoost));
        ctx.fill();
      }

      const beamGrad = ctx.createLinearGradient(lightX, lightY, objectX, objectY);
      beamGrad.addColorStop(0, rgba(warmth, (0.14 + reveal * 0.12) * entrance));
      beamGrad.addColorStop(1, rgba(warmth, 0));
      ctx.beginPath();
      ctx.moveTo(lightX - px(0.016, minDim), lightY + px(0.012, minDim));
      ctx.lineTo(lightX + px(0.016, minDim), lightY + px(0.012, minDim));
      ctx.lineTo(objectX + perpX * px(0.02, minDim), objectY + perpY * px(0.02, minDim));
      ctx.lineTo(objectX - perpX * px(0.02, minDim), objectY - perpY * px(0.02, minDim));
      ctx.closePath();
      ctx.fillStyle = beamGrad;
      ctx.fill();

      const handleRadius = px(mix(0.03, 0.042, reveal) + breathAmplitude * 0.004 * ms, minDim);
      const handleGlow = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, handleRadius * 3.2);
      handleGlow.addColorStop(0, rgba(warmth, Math.min(0.44, (0.22 + reveal * 0.22 + s.revealFlash * 0.12) * entrance * stageBoost)));
      handleGlow.addColorStop(0.58, rgba(warmth, Math.min(0.16, (0.08 + reveal * 0.08) * entrance * stageBoost)));
      handleGlow.addColorStop(1, rgba(warmth, 0));
      ctx.fillStyle = handleGlow;
      ctx.fillRect(lightX - handleRadius * 3.2, lightY - handleRadius * 3.2, handleRadius * 6.4, handleRadius * 6.4);
      ctx.beginPath();
      ctx.arc(lightX, lightY, handleRadius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(warmth, Math.min(0.98, (0.6 + reveal * 0.34) * entrance * stageBoost));
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lightX, lightY, handleRadius * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 251, 244], Math.min(1, (0.68 + reveal * 0.3) * entrance * stageBoost));
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0.16 * w, 0.56 * h);
      ctx.quadraticCurveTo(0.24 * w, 0.3 * h, targetX, targetY);
      ctx.strokeStyle = rgba(handReveal, Math.min(0.12, (0.04 + targetPulse * 0.025) * entrance * stageBoost));
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      if (s.revealFlash > 0.001 || reveal > 0.9) {
        const flashAlpha = (s.revealFlash * 0.22 + Math.max(0, reveal - 0.9) * 0.7) * entrance;
        const corona = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, minDim * 0.32);
        corona.addColorStop(0, rgba(handReveal, flashAlpha));
        corona.addColorStop(1, rgba(handReveal, 0));
        ctx.fillStyle = corona;
        ctx.fillRect(objectX - minDim * 0.32, objectY - minDim * 0.32, minDim * 0.64, minDim * 0.64);
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
      const lightX = mix(0.16 * viewport.width, OBJECT_POS.x * viewport.width, easeOutCubic(s.sweep) * 0.96);
      const lightY = mix(0.56 * viewport.height, 0.14 * viewport.height, easeOutCubic(s.sweep));
      const hitR = Math.min(viewport.width, viewport.height) * LIGHT_HANDLE_HIT;
      if (Math.hypot(p.x - lightX, p.y - lightY) > hitR) return;
      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const p = getPoint(e);
      const nextSweep = clamp((p.x / viewport.width - 0.16) / (OBJECT_POS.x - 0.16), 0, 1);
      if (!s.swipeCommitFired && Math.abs(nextSweep - LIGHT_START) > 0.06) {
        s.swipeCommitFired = true;
        callbacksRef.current.onHaptic('swipe_commit');
      }
      s.sweep = nextSweep;
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
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
}
