/**
 * ATOM 282: THE RESPIRATION PENDULUM ENGINE
 * ============================================
 * Series 29 — Interoceptive Anchor · Position 2
 *
 * Make the breath visible and heavy. The pendulum swings in
 * response to breath input — slow steady exhale creates
 * perfect hypnotic arc. Erratic breathing → chaotic swinging.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Pendulum swing disturbs a field of topographic contours
 *   - Contour lines ripple outward from the bob's position
 *   - Chladni nodal lines form on the "plate" of the pendulum arc
 *     when the rhythm is steady — resonance = visible pattern
 *
 * PHYSICS:
 *   - Heavy pendulum bob on long string from top-center
 *   - Hold = inhale (energy storage), Release = exhale (swing force)
 *   - Steady rhythm → clean wide arcs → Chladni patterns crystallize
 *   - Erratic rhythm → chaotic bouncing (error_boundary)
 *   - Bob has shadow, 5-stop gradient body, specular highlight
 *   - Arc trail with motion-blur gradient
 *   - 8 layers: contour field, Chladni, shadow, arc trail, string,
 *     bob glow, bob body+specular, progress/breath UI
 *   - Breath couples to: contour drift, glow warmth, trail color
 *
 * INTERACTION:
 *   Hold = inhale, Release = exhale → pendulum swing
 *   Steady rhythm → completion; erratic → error
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static pendulum at rest with golden glow + contours
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

/** Pivot point vertical position (fraction of height) */
const PIVOT_Y_FRAC = 0.08;
/** Pendulum string length (fraction of minDim) */
const STRING_LENGTH = 0.48;
/** Bob radius — hero element (fraction of minDim) */
const BOB_R = SIZE.sm;
/** Gravitational acceleration constant */
const GRAVITY = 0.0006;
/** Angular velocity damping per frame */
const DAMPING = 0.998;
/** Force multiplier from held breath duration */
const BREATH_FORCE = 0.002;
/** Angle threshold for "steady" swing */
const STEADY_THRESHOLD = 0.5;
/** Motion trail sample count */
const TRAIL_POINTS = 36;
/** Number of steady breaths needed for completion */
const STEADY_BEATS_TO_COMPLETE = 12;
/** Glow layer count for bob */
const BOB_GLOW_LAYERS = 4;
/** Contour ring count across the lower field */
const CONTOUR_RINGS = 12;
/** Contour spacing (fraction of minDim) */
const CONTOUR_SPACING = 0.03;
/** Chladni grid resolution */
const CHLADNI_RES = 24;
/** Chladni dot radius */
const CHLADNI_DOT = 0.0025;
/** Chladni zero-crossing threshold */
const CHLADNI_ZERO = 0.12;
/** Breath warmth coupling to colors */
const BREATH_WARMTH = 0.06;
/** Breath contour drift coupling */
const BREATH_CONTOUR_DRIFT = 0.03;
/** Specular offset from bob center */
const SPECULAR_OFFSET = 0.25;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Trail sample point */
interface TrailPoint {
  x: number;
  y: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw contour-like ripples emanating from bob position across lower half.
 * Contours distort based on bob displacement and breath.
 */
function drawContourField(
  ctx: CanvasRenderingContext2D,
  cx: number, h: number, minDim: number,
  bobX: number, bobY: number,
  rgb: RGB, entrance: number,
  frame: number, breathAmp: number, arcQuality: number,
): void {
  const breathDrift = breathAmp * BREATH_CONTOUR_DRIFT;
  for (let i = 0; i < CONTOUR_RINGS; i++) {
    const baseR = px(CONTOUR_SPACING * (i + 1.5), minDim);
    const drift = Math.sin(frame * 0.008 + i * 0.6) * px(0.005, minDim)
      + breathDrift * px(1, minDim) * Math.cos(i * 0.4);
    const r = baseR + drift;
    const alpha = ALPHA.atmosphere.max * (0.08 + arcQuality * 0.12) *
      (1 - i / CONTOUR_RINGS) * entrance;

    ctx.beginPath();
    const steps = 40;
    for (let a = 0; a <= steps; a++) {
      const angle = (a / steps) * Math.PI * 2;
      const wobble = 1 + 0.05 * Math.sin(angle * 4 + i * 1.3 + frame * 0.005);
      const px2 = bobX + Math.cos(angle) * r * wobble;
      const py2 = bobY + Math.sin(angle) * r * wobble * 0.6; // flatten vertically
      if (a === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(i % 4 === 0 ? STROKE.thin : STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw Chladni nodal pattern in the pendulum arc zone.
 * Pattern clarity increases with arc quality (rhythm steadiness).
 */
function drawChladniArc(
  ctx: CanvasRenderingContext2D,
  cx: number, pivotY: number, sLen: number, minDim: number,
  rgb: RGB, entrance: number, arcQuality: number, frame: number,
): void {
  if (arcQuality < 0.2) return;
  const n = 3 + Math.floor(arcQuality * 2);
  const m = 2 + Math.floor(arcQuality * 3);
  const dotR = px(CHLADNI_DOT, minDim);
  // Sample within the arc region (semicircle below pivot)
  const regionR = sLen * 1.1;
  const regionCy = pivotY + sLen * 0.5;

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES - 1));
      const dist = Math.sqrt(nx * nx + (ny - 0.5) * (ny - 0.5) * 4);
      if (dist > 1) continue;

      const val = Math.abs(
        Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny)
        - Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny)
      );

      if (val < CHLADNI_ZERO) {
        const x = cx + nx * regionR;
        const y = regionCy + ny * regionR * 0.6;
        const intensity = (1 - val / CHLADNI_ZERO) * arcQuality;
        ctx.beginPath();
        ctx.arc(x, y, dotR * (0.4 + intensity * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.12 * intensity * entrance);
        ctx.fill();
      }
    }
  }
}

/**
 * Draw specular highlight on the bob.
 */
function drawBobSpecular(
  ctx: CanvasRenderingContext2D,
  bobX: number, bobY: number, bobR: number,
  entrance: number,
): void {
  const spX = bobX - bobR * SPECULAR_OFFSET;
  const spY = bobY - bobR * SPECULAR_OFFSET;
  const spR = bobR * 0.3;
  const sg = ctx.createRadialGradient(spX, spY, 0, spX, spY, spR);
  sg.addColorStop(0, `rgba(255,255,255,${0.4 * entrance})`);
  sg.addColorStop(0.4, `rgba(255,255,255,${0.1 * entrance})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(spX, spY, spR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function RespirationPendulumAtom({
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
    angle: 0.3,
    angVel: 0,
    holding: false,
    holdDuration: 0,
    lastReleaseTime: 0,
    breathIntervals: [] as number[],
    steadyBeats: 0,
    trail: [] as TrailPoint[],
    peakAngle: 0,
    arcQuality: 0,
    completed: false,
    breathNotified: false,
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

      const pivotY = PIVOT_Y_FRAC * h;
      const sLen = px(STRING_LENGTH, minDim);

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        const bobX = cx;
        const bobY = pivotY + sLen;
        const bobRadius = px(BOB_R, minDim);
        // Static contours
        for (let i = 0; i < 6; i++) {
          const r = px(CONTOUR_SPACING * (i + 2), minDim);
          ctx.beginPath();
          ctx.arc(bobX, bobY, r, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.1 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
        // String
        ctx.beginPath();
        ctx.moveTo(cx, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
        // Bob glow + body
        const bg = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobRadius * 3);
        bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        bg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.05 * entrance));
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(bobX - bobRadius * 3, bobY - bobRadius * 3, bobRadius * 6, bobRadius * 6);
        const bodyG = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobRadius);
        bodyG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.7 * entrance));
        bodyG.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.45 * entrance));
        bodyG.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
        ctx.fillStyle = bodyG;
        ctx.beginPath();
        ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
        ctx.fill();
        drawBobSpecular(ctx, bobX, bobY, bobRadius, entrance);
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ═══════════════════════════════════════════════════════════════
      // PENDULUM PHYSICS
      // ═══════════════════════════════════════════════════════════════
      if (p.phase === 'resolve') {
        s.angle = Math.sin(s.frameCount * 0.015) * STEADY_THRESHOLD;
        s.arcQuality = 1;
      }

      if (s.holding) s.holdDuration += ms;

      const gravForce = -GRAVITY * Math.sin(s.angle) * ms;
      s.angVel += gravForce;
      s.angVel *= DAMPING;
      s.angle += s.angVel * ms;

      if (Math.abs(s.angle) > Math.abs(s.peakAngle) * 0.95) {
        s.peakAngle = s.angle;
      }

      if (s.breathIntervals.length >= 3) {
        const avg = s.breathIntervals.reduce((a, b) => a + b, 0) / s.breathIntervals.length;
        const variance = s.breathIntervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / s.breathIntervals.length;
        s.arcQuality = Math.max(0, 1 - variance / 10000);
      }

      const bobX = cx + Math.sin(s.angle) * sLen;
      const bobY = pivotY + Math.cos(s.angle) * sLen;
      const bobRadius = px(BOB_R, minDim);

      s.trail.push({ x: bobX, y: bobY });
      if (s.trail.length > TRAIL_POINTS) s.trail.shift();

      const progFrac = Math.min(1, s.steadyBeats / STEADY_BEATS_TO_COMPLETE);
      cb.onStateChange?.(progFrac);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Topographic contour field (around bob)
      // ═══════════════════════════════════════════════════════════════
      drawContourField(ctx, cx, h, minDim, bobX, bobY,
        s.primaryRgb, entrance, s.frameCount, p.breathAmplitude, s.arcQuality);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni nodal pattern (in arc zone)
      // ═══════════════════════════════════════════════════════════════
      drawChladniArc(ctx, cx, pivotY, sLen, minDim,
        lerpColor(s.primaryRgb, s.accentRgb, p.breathAmplitude * BREATH_WARMTH),
        entrance, s.arcQuality, s.frameCount);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Bob shadow
      // ═══════════════════════════════════════════════════════════════
      const shadowY = bobY + bobRadius * 0.8;
      const shadowG = ctx.createRadialGradient(bobX, shadowY, 0, bobX, shadowY, bobRadius * 1.5);
      shadowG.addColorStop(0, `rgba(0,0,0,${0.1 * entrance})`);
      shadowG.addColorStop(0.5, `rgba(0,0,0,${0.03 * entrance})`);
      shadowG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowG;
      ctx.beginPath();
      ctx.ellipse(bobX, shadowY, bobRadius * 1.5, bobRadius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Arc trail (motion blur behind bob)
      // ═══════════════════════════════════════════════════════════════
      if (s.trail.length > 2) {
        ctx.lineCap = 'round';
        for (let i = 1; i < s.trail.length; i++) {
          const t = i / s.trail.length;
          const trailColor = lerpColor(s.accentRgb, s.primaryRgb, s.arcQuality);
          ctx.beginPath();
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
          ctx.strokeStyle = rgba(trailColor, ALPHA.content.max * 0.1 * t * entrance);
          ctx.lineWidth = px(STROKE.bold * t, minDim);
          ctx.stroke();
        }
        ctx.lineCap = 'butt';
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — String + pivot
      // ═══════════════════════════════════════════════════════════════
      // String with subtle gradient
      const strGrad = ctx.createLinearGradient(cx, pivotY, bobX, bobY);
      strGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
      strGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.14 * entrance));
      strGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
      ctx.beginPath();
      ctx.moveTo(cx, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = strGrad;
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Pivot point (small ornamental circle)
      ctx.beginPath();
      ctx.arc(cx, pivotY, px(0.005, minDim), 0, Math.PI * 2);
      const pivG = ctx.createRadialGradient(cx, pivotY, 0, cx, pivotY, px(0.005, minDim));
      pivG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance));
      pivG.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance));
      ctx.fillStyle = pivG;
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Bob glow (multi-layer radial)
      // ═══════════════════════════════════════════════════════════════
      const warmBob = lerpColor(s.accentRgb, s.primaryRgb, s.arcQuality);
      for (let i = BOB_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = bobRadius * (2.5 + i * 2.0 + s.arcQuality * 2.5);
        const gA = ALPHA.glow.max * (0.06 + s.arcQuality * 0.14) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, gR);
        gg.addColorStop(0, rgba(warmBob, gA));
        gg.addColorStop(0.3, rgba(warmBob, gA * 0.4));
        gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.08));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(bobX - gR, bobY - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Bob body (5-stop gradient + specular)
      // ═══════════════════════════════════════════════════════════════
      const bodyG = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobRadius);
      const bodyA = ALPHA.content.max * (0.45 + s.arcQuality * 0.25) * entrance;
      bodyG.addColorStop(0, rgba(lerpColor(warmBob, [255, 255, 255] as unknown as RGB, 0.12), bodyA));
      bodyG.addColorStop(0.25, rgba(warmBob, bodyA));
      bodyG.addColorStop(0.6, rgba(s.primaryRgb, bodyA * 0.7));
      bodyG.addColorStop(0.85, rgba(s.primaryRgb, bodyA * 0.3));
      bodyG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlights
      drawBobSpecular(ctx, bobX, bobY, bobRadius, entrance);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Progress + breath indicator + completion
      // ═══════════════════════════════════════════════════════════════

      // Arc quality guide (faint semicircle)
      const arcR = sLen * 1.05;
      const arcSpan = STEADY_THRESHOLD * 1.2;
      ctx.beginPath();
      ctx.arc(cx, pivotY, arcR, Math.PI / 2 - arcSpan, Math.PI / 2 + arcSpan);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // Progress arc (fills as steadyBeats increase)
      if (progFrac > 0) {
        const progArcSpan = arcSpan * 2 * progFrac;
        ctx.beginPath();
        ctx.arc(cx, pivotY, arcR + px(0.005, minDim),
          Math.PI / 2 - arcSpan, Math.PI / 2 - arcSpan + progArcSpan);
        ctx.strokeStyle = rgba(warmBob, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // Breath indicator (inhale circle at bottom)
      if (s.holding) {
        const inhaleR = px(0.012, minDim) * (1 + s.holdDuration * 0.005);
        const inhaleG = ctx.createRadialGradient(cx, h * 0.92, 0, cx, h * 0.92, inhaleR);
        inhaleG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
        inhaleG.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
        inhaleG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = inhaleG;
        ctx.beginPath();
        ctx.arc(cx, h * 0.92, inhaleR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Completion bloom
      if (s.completed) {
        for (let i = 0; i < 3; i++) {
          const rPhase = (s.frameCount * 0.004 + i * 0.33) % 1;
          const rR = sLen * 0.3 * (0.5 + rPhase);
          const bloomG = ctx.createRadialGradient(
            bobX, bobY, rR - px(0.003, minDim),
            bobX, bobY, rR + px(0.003, minDim));
          bloomG.addColorStop(0, 'rgba(0,0,0,0)');
          bloomG.addColorStop(0.5, rgba(warmBob, ALPHA.content.max * 0.06 * (1 - rPhase) * entrance));
          bloomG.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bloomG;
          ctx.fillRect(bobX - rR - px(0.003, minDim), bobY - rR - px(0.003, minDim),
            (rR + px(0.003, minDim)) * 2, (rR + px(0.003, minDim)) * 2);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      s.holding = true;
      s.holdDuration = 0;
      if (!s.breathNotified) {
        s.breathNotified = true;
        callbacksRef.current.onHaptic('breath_peak');
      }
    };

    const onUp = () => {
      const s = stateRef.current;
      const cb = callbacksRef.current;
      if (!s.holding) return;
      s.holding = false;

      // Apply exhale force proportional to hold duration
      const force = Math.min(0.8, s.holdDuration * BREATH_FORCE);
      s.angVel += (s.angle >= 0 ? -1 : 1) * force;

      // Track interval for steadiness measurement
      const now = s.frameCount;
      if (s.lastReleaseTime > 0) {
        s.breathIntervals.push(now - s.lastReleaseTime);
        if (s.breathIntervals.length > 6) s.breathIntervals.shift();

        if (s.arcQuality > 0.6) {
          s.steadyBeats++;
          cb.onHaptic('step_advance');
          if (s.steadyBeats >= STEADY_BEATS_TO_COMPLETE && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
          }
        } else if (s.arcQuality < 0.3) {
          cb.onHaptic('error_boundary');
        }
      }
      s.lastReleaseTime = now;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
