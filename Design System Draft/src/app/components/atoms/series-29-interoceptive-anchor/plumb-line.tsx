/**
 * ATOM 283: THE PLUMB LINE ENGINE
 * ==================================
 * Series 29 — Interoceptive Anchor · Position 3
 *
 * Anxiety makes you float. Find the gravitational center —
 * hold the device in absolute physical stillness. The plumb
 * bob rattles, swings, and then locks with a metallic clack.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Gravitational terrain rendered as elevation contour map
 *   - Contour center tracks the pendulum bob — when it settles,
 *     contour lines converge to a single point (dead center)
 *   - Chladni nodal pattern reveals in the "locking zone" — the
 *     resonance frequency of stillness made visible
 *
 * PHYSICS:
 *   - Plumb bob on string, pointer movement = device tilt
 *   - Bob swings/rattles in response, damping toward center
 *   - 8 layers: contour terrain, Chladni lock zone, target ring,
 *     string + pivot, bob shadow, bob glow, bob body+specular,
 *     progress/lock flash
 *   - Breath couples to: contour warmth, glow intensity, bob mass feel
 *   - When bob centers and velocity < threshold → locks after 90 frames
 *
 * INTERACTION:
 *   Move pointer = simulated tilt → bob swings
 *   Hold still → bob settles → locks (step_advance → completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static locked plumb bob at center with contour + Chladni
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Pendulum string length (fraction of minDim) */
const STRING_LENGTH = 0.50;
/** Bob radius — conical weight body (fraction of minDim) */
const BOB_R = SIZE.sm * 0.5;
/** Gravitational acceleration */
const GRAVITY = 0.0008;
/** Angular velocity damping per frame */
const DAMPING = 0.994;
/** Pointer-movement to tilt force sensitivity */
const TILT_SENSITIVITY = 0.0015;
/** Velocity threshold for lock detection */
const LOCK_VELOCITY_THRESHOLD = 0.0003;
/** Angle threshold for lock detection */
const LOCK_ANGLE_THRESHOLD = 0.015;
/** Frames of near-stillness required for lock */
const LOCK_HOLD_FRAMES = 90;
/** Target crosshair ring radius */
const TARGET_R = 0.02;
/** Number of glow passes for bob */
const BOB_GLOW_LAYERS = 4;
/** Topographic contour ring count */
const CONTOUR_RINGS = 16;
/** Contour ring spacing (fraction of minDim) */
const CONTOUR_SPACING = 0.026;
/** Chladni grid resolution (NxN) */
const CHLADNI_RES = 22;
/** Chladni nodal threshold */
const CHLADNI_THRESHOLD = 0.14;
/** Chladni dot size */
const CHLADNI_DOT = 0.003;
/** Specular highlight offset (fraction of bob radius) */
const SPECULAR_OFFSET = 0.25;
/** Breath warmth coupling */
const BREATH_WARMTH = 0.05;

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw gravitational terrain contours centered on bob.
 * Lines converge toward the target as bob approaches center.
 */
function drawGravContours(
  ctx: CanvasRenderingContext2D,
  bobX: number, bobY: number,
  targetX: number, targetY: number,
  minDim: number, rgb: RGB,
  entrance: number, nearness: number,
  frame: number, breathAmp: number,
): void {
  for (let i = 0; i < CONTOUR_RINGS; i++) {
    const baseR = px(CONTOUR_SPACING * (i + 1), minDim);
    // Contour centers lerp from bob position toward target as nearness increases
    const contourCx = bobX + (targetX - bobX) * nearness * 0.3;
    const contourCy = bobY + (targetY - bobY) * nearness * 0.3;
    const breathDrift = breathAmp * px(BREATH_WARMTH * 0.3, minDim) * Math.sin(i * 0.5 + frame * 0.005);
    const r = baseR + breathDrift;
    const elevAlpha = (1 - i / CONTOUR_RINGS) * 0.35 + 0.08;
    const alpha = ALPHA.atmosphere.max * elevAlpha * entrance * (0.2 + nearness * 0.3);

    ctx.beginPath();
    const steps = 40;
    for (let a = 0; a <= steps; a++) {
      const angle = (a / steps) * Math.PI * 2;
      // Organic wobble + gravitational distortion toward target
      const distToTarget = Math.sqrt(
        Math.pow(contourCx + Math.cos(angle) * r - targetX, 2) +
        Math.pow(contourCy + Math.sin(angle) * r - targetY, 2)
      );
      const gravPull = 1 - nearness * 0.15 * Math.max(0, 1 - distToTarget / px(0.3, minDim));
      const wobble = 1 + 0.04 * Math.sin(angle * 5 + i * 1.1 + frame * 0.003) * gravPull;
      const px2 = contourCx + Math.cos(angle) * r * wobble;
      const py2 = contourCy + Math.sin(angle) * r * wobble;
      if (a === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(i % 5 === 0 ? STROKE.thin : STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw Chladni pattern in the lock zone (around target).
 * Only visible when bob is near center (nearness > 0.3).
 */
function drawChladniLockZone(
  ctx: CanvasRenderingContext2D,
  targetX: number, targetY: number,
  minDim: number, rgb: RGB,
  entrance: number, nearness: number, lockFrac: number,
): void {
  if (nearness < 0.3) return;
  const visibility = (nearness - 0.3) / 0.7;
  const n = 3 + Math.floor(lockFrac * 2);
  const m = 2 + Math.floor(lockFrac * 3);
  const fieldR = px(0.2, minDim);
  const dotR = px(CHLADNI_DOT, minDim);

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES - 1)) * 2 - 1;
      const d = Math.sqrt(nx * nx + ny * ny);
      if (d > 1) continue;

      const val = Math.abs(
        Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny) -
        Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny)
      );

      if (val < CHLADNI_THRESHOLD) {
        const x = targetX + nx * fieldR;
        const y = targetY + ny * fieldR;
        const intensity = (1 - val / CHLADNI_THRESHOLD) * visibility;
        ctx.beginPath();
        ctx.arc(x, y, dotR * (0.3 + intensity * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.1 * intensity * entrance);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw specular highlight on plumb bob.
 */
function drawBobSpecular(
  ctx: CanvasRenderingContext2D,
  bobX: number, bobY: number, bobR: number,
  entrance: number,
): void {
  const spX = bobX - bobR * SPECULAR_OFFSET * 2;
  const spY = bobY - bobR * 0.3;
  const spR = bobR * 0.3;
  const sg = ctx.createRadialGradient(spX, spY, 0, spX, spY, spR);
  sg.addColorStop(0, `rgba(255,255,255,${0.35 * entrance})`);
  sg.addColorStop(0.5, `rgba(255,255,255,${0.08 * entrance})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(spX, spY, spR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function PlumbLineAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    angle: 0.2 + (Math.random() - 0.5) * 0.3,
    angVel: 0,
    tiltForce: 0,
    lockFrames: 0,
    locked: false,
    lockFlash: 0,
    lastPointerX: -1,
    stepNotified: false,
    completed: false,
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
    let animId: number;

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

      if (p.reducedMotion || p.phase === 'resolve') {
        s.angle = 0; s.locked = true;
      }

      const pivotY = h * 0.06;
      const sLen = px(STRING_LENGTH, minDim);
      const targetX = cx;
      const targetY = pivotY + sLen;

      // ═══════════════════════════════════════════════════════════════
      // PENDULUM PHYSICS
      // ═══════════════════════════════════════════════════════════════
      if (!s.locked) {
        s.angVel += -GRAVITY * Math.sin(s.angle) * ms;
        s.angVel += s.tiltForce * TILT_SENSITIVITY * ms;
        s.tiltForce *= 0.9;
        s.angVel *= DAMPING;
        s.angle += s.angVel * ms;

        if (Math.abs(s.angle) < LOCK_ANGLE_THRESHOLD && Math.abs(s.angVel) < LOCK_VELOCITY_THRESHOLD) {
          s.lockFrames += ms;
          if (s.lockFrames > LOCK_HOLD_FRAMES * 0.5 && !s.stepNotified) {
            s.stepNotified = true;
            cb.onHaptic('step_advance');
          }
          if (s.lockFrames >= LOCK_HOLD_FRAMES) {
            s.locked = true;
            s.angle = 0;
            s.angVel = 0;
            s.lockFlash = 1;
            cb.onHaptic('completion');
            s.completed = true;
          }
        } else {
          s.lockFrames = Math.max(0, s.lockFrames - 0.5 * ms);
        }
      }

      if (s.lockFlash > 0) s.lockFlash *= 0.97;

      const bobX = cx + Math.sin(s.angle) * sLen;
      const bobY = pivotY + Math.cos(s.angle) * sLen;
      const bobR = px(BOB_R, minDim);
      const nearness = s.locked ? 1 : Math.max(0, 1 - Math.abs(s.angle) / 0.3);
      const lockFrac = Math.min(1, s.lockFrames / LOCK_HOLD_FRAMES);
      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb, p.breathAmplitude * BREATH_WARMTH);

      cb.onStateChange?.(s.completed ? 1 : Math.min(0.9, lockFrac));

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Gravitational topographic contours
      // ═══════════════════════════════════════════════════════════════
      drawGravContours(ctx, bobX, bobY, targetX, targetY, minDim,
        s.primaryRgb, entrance, nearness, s.frameCount, p.breathAmplitude);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni nodal pattern in lock zone
      // ═══════════════════════════════════════════════════════════════
      drawChladniLockZone(ctx, targetX, targetY, minDim,
        warmRgb, entrance, nearness, lockFrac);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Target ring + crosshair + target glow
      // ═══════════════════════════════════════════════════════════════
      const tR = px(TARGET_R, minDim);
      // Target glow (intensifies with nearness)
      const tg = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, tR * 5);
      tg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.12 * nearness * entrance));
      tg.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * nearness * entrance));
      tg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tg;
      ctx.fillRect(targetX - tR * 5, targetY - tR * 5, tR * 10, tR * 10);

      // Double ring (outer faint, inner strong)
      ctx.beginPath();
      ctx.arc(targetX, targetY, tR * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(targetX, targetY, tR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.06 + nearness * 0.15) * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // Crosshair
      const chS = tR * 0.7;
      ctx.beginPath();
      ctx.moveTo(targetX - chS, targetY);
      ctx.lineTo(targetX + chS, targetY);
      ctx.moveTo(targetX, targetY - chS);
      ctx.lineTo(targetX, targetY + chS);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — String + pivot mount + hash marks
      // ═══════════════════════════════════════════════════════════════
      // String gradient
      const strG = ctx.createLinearGradient(cx, pivotY, bobX, bobY);
      strG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
      strG.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
      strG.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
      ctx.beginPath();
      ctx.moveTo(cx, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = strG;
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Measurement hash marks along string
      for (let i = 1; i <= 6; i++) {
        const t = i / 7;
        const mx = cx + Math.sin(s.angle) * sLen * t;
        const my = pivotY + Math.cos(s.angle) * sLen * t;
        const perpAngle = s.angle + Math.PI / 2;
        const hLen = px(0.004, minDim);
        ctx.beginPath();
        ctx.moveTo(mx - Math.cos(perpAngle) * hLen, my - Math.sin(perpAngle) * hLen);
        ctx.lineTo(mx + Math.cos(perpAngle) * hLen, my + Math.sin(perpAngle) * hLen);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // Pivot mount (ornamental)
      const pivR = px(0.006, minDim);
      const pivG = ctx.createRadialGradient(cx, pivotY, 0, cx, pivotY, pivR);
      pivG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
      pivG.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
      pivG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = pivG;
      ctx.beginPath();
      ctx.arc(cx, pivotY, pivR, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Bob shadow
      // ═══════════════════════════════════════════════════════════════
      const shY = bobY + bobR * 1.2;
      const shG = ctx.createRadialGradient(bobX, shY, 0, bobX, shY, bobR * 1.8);
      shG.addColorStop(0, `rgba(0,0,0,${0.1 * entrance})`);
      shG.addColorStop(0.5, `rgba(0,0,0,${0.03 * entrance})`);
      shG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shG;
      ctx.beginPath();
      ctx.ellipse(bobX, shY, bobR * 1.8, bobR * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Bob glow (multi-layer radial)
      // ═══════════════════════════════════════════════════════════════
      const bobIntensity = s.locked ? 0.8 : 0.3 + nearness * 0.3;
      for (let i = BOB_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = bobR * (2.5 + i * 2.0 + (s.locked ? 4 : 0));
        const gA = ALPHA.glow.max * bobIntensity * 0.1 * entrance / (i + 1);
        const gg = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, gR);
        gg.addColorStop(0, rgba(warmRgb, gA + s.lockFlash * 0.25));
        gg.addColorStop(0.3, rgba(warmRgb, gA * 0.4));
        gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.08));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(bobX - gR, bobY - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Bob body (conical weight, 5-stop gradient + specular)
      // ═══════════════════════════════════════════════════════════════
      // Conical weight shape
      ctx.beginPath();
      ctx.moveTo(bobX - bobR * 0.7, bobY - bobR * 0.5);
      ctx.lineTo(bobX + bobR * 0.7, bobY - bobR * 0.5);
      ctx.lineTo(bobX + bobR * 0.18, bobY + bobR);
      ctx.lineTo(bobX - bobR * 0.18, bobY + bobR);
      ctx.closePath();

      // Gradient fill for the cone
      const coneG = ctx.createLinearGradient(bobX - bobR, bobY, bobX + bobR, bobY);
      const coneA = ALPHA.content.max * (s.locked ? 0.65 : 0.35 + nearness * 0.2) * entrance;
      coneG.addColorStop(0, rgba(s.primaryRgb, coneA * 0.5));
      coneG.addColorStop(0.3, rgba(warmRgb, coneA));
      coneG.addColorStop(0.5, rgba(lerpColor(warmRgb, [255, 255, 255] as unknown as RGB, 0.08), coneA));
      coneG.addColorStop(0.7, rgba(warmRgb, coneA * 0.85));
      coneG.addColorStop(1, rgba(s.primaryRgb, coneA * 0.4));
      ctx.fillStyle = coneG;
      ctx.fill();

      // Tip dot
      ctx.beginPath();
      ctx.arc(bobX, bobY + bobR * 0.9, px(0.003, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(warmRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.fill();

      // Specular highlight
      drawBobSpecular(ctx, bobX, bobY, bobR, entrance);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Lock flash + lock ring + settling progress
      // ═══════════════════════════════════════════════════════════════

      // Lock flash burst
      if (s.lockFlash > 0.01) {
        const fR = px(SIZE.md * s.lockFlash * 2.5, minDim);
        const fg = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, fR);
        fg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * s.lockFlash * 0.35 * entrance));
        fg.addColorStop(0.3, rgba(warmRgb, ALPHA.glow.max * s.lockFlash * 0.1 * entrance));
        fg.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.max * s.lockFlash * 0.02 * entrance));
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(bobX - fR, bobY - fR, fR * 2, fR * 2);
      }

      // Lock ring (double ring when locked)
      if (s.locked) {
        ctx.beginPath();
        ctx.arc(targetX, targetY, bobR * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(targetX, targetY, bobR * 2.8, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // Settling progress arc
      if (!s.locked && s.lockFrames > 0) {
        const progAngle = lockFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(targetX, targetY, tR * 2.5, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.14 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.locked) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      if (s.lastPointerX >= 0) {
        s.tiltForce = (mx - s.lastPointerX) * 30;
      }
      s.lastPointerX = mx;
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      s.lastPointerX = (e.clientX - rect.left) / rect.width;
    };

    const onLeave = () => { stateRef.current.lastPointerX = -1; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerup', onLeave);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerup', onLeave);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }} />
    </div>
  );
}
