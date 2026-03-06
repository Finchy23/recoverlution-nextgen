/**
 * ATOM 382: THE PENDULUM SWING ENGINE
 * =====================================
 * Series 39 — Momentum Wheel · Position 2
 *
 * Cure the burnout of maximum effort. Perfect timing at the
 * apex adds energy without force — rhythm replaces brute strength.
 *
 * PHYSICS:
 *   - Heavy pendulum suspended from top of viewport
 *   - Swings lazily with small initial amplitude
 *   - User taps EXACTLY at the apex (peak of swing)
 *   - Perfect timing adds kinetic energy efficiently
 *   - Mistimed taps waste energy (no effect)
 *   - Each well-timed tap increases amplitude
 *   - After sufficient amplitude → full 360° loop over the top
 *   - Breath modulates the timing window (calm = wider window)
 *
 * INTERACTION:
 *   Tap → if at apex, adds kinetic energy
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static pendulum at peak with arc trail visible
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Pivot Y position (fraction of viewport height) */
const PIVOT_Y_FRAC = 0.12;
/** Arm length (fraction of minDim) */
const ARM_LENGTH = 0.32;
/** Gravitational acceleration constant */
const GRAVITY = 0.0004;
/** Angular velocity damping (very slight) */
const DAMPING = 0.9995;
/** Energy boost per well-timed tap */
const TAP_BOOST = 0.009;
/** Timing window: angular velocity threshold for "at apex" */
const APEX_THRESHOLD_BASE = 0.004;
/** Breath widens the apex window by this factor */
const BREATH_WINDOW_FACTOR = 0.5;
/** Bob radius (fraction of minDim) */
const BOB_R_FRAC = 0.028;
/** Pivot radius */
const PIVOT_R_FRAC = 0.006;
/** Arc trail point count */
const TRAIL_COUNT = 30;
/** Full loop threshold (must reach PI radians amplitude) */
const LOOP_THRESHOLD = Math.PI;
/** Completion glow rate */
const COMPLETION_RATE = 0.008;
/** Timing flash duration (frames) */
const FLASH_DURATION = 12;

// =====================================================================
// STATE TYPES
// =====================================================================

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function PendulumSwingAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
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
    angle: 0.3,           // initial small swing
    angVel: 0,
    maxAmplitude: 0.3,
    looped: false,
    loopAnim: 0,
    trail: [] as TrailPoint[],
    timingFlash: 0,       // visual feedback for well-timed tap
    missFlash: 0,         // visual feedback for mistimed tap
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
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.looped) {
        s.angVel += 0.002;
      }

      // ── Pendulum physics ────────────────────────────
      s.angVel -= GRAVITY * Math.sin(s.angle) * ms;
      s.angVel *= DAMPING;
      s.angle += s.angVel * ms;
      s.maxAmplitude = Math.max(s.maxAmplitude, Math.abs(s.angle));

      // ── Positions ───────────────────────────────────
      const armLen = px(ARM_LENGTH, minDim);
      const pivotX = cx;
      const pivotY = PIVOT_Y_FRAC * h;
      const bobX = pivotX + Math.sin(s.angle) * armLen;
      const bobY = pivotY + Math.cos(s.angle) * armLen;

      // ── Trail ───────────────────────────────────────
      if (!p.reducedMotion) {
        s.trail.push({ x: bobX, y: bobY, age: 0 });
        if (s.trail.length > TRAIL_COUNT) s.trail.shift();
        for (const t of s.trail) t.age++;
      }

      // ── Loop detection ──────────────────────────────
      if (s.maxAmplitude >= LOOP_THRESHOLD && !s.looped) {
        s.looped = true;
        cb.onHaptic('completion');
      }
      if (s.looped) {
        s.loopAnim = Math.min(1, s.loopAnim + COMPLETION_RATE * ms);
      }

      // Flash decay
      if (s.timingFlash > 0) s.timingFlash--;
      if (s.missFlash > 0) s.missFlash--;

      cb.onStateChange?.(s.looped
        ? 0.5 + s.loopAnim * 0.5
        : Math.min(0.5, s.maxAmplitude / LOOP_THRESHOLD * 0.5));

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const bobR = px(BOB_R_FRAC, minDim);

        // Pendulum at rest at 45° with arc
        const staticAngle = 0.8;
        const sBobX = pivotX + Math.sin(staticAngle) * armLen;
        const sBobY = pivotY + Math.cos(staticAngle) * armLen;

        // Arc trail
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, armLen, Math.PI / 2 - 0.8, Math.PI / 2 + 0.8);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.setLineDash([px(0.005, minDim), px(0.008, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arm
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(sBobX, sBobY);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Bob with glow
        const bg = ctx.createRadialGradient(sBobX, sBobY, 0, sBobX, sBobY, bobR * 4);
        bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        bg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bg;
        ctx.fillRect(sBobX - bobR * 4, sBobY - bobR * 4, bobR * 8, bobR * 8);

        ctx.beginPath();
        ctx.arc(sBobX, sBobY, bobR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const bobR = px(BOB_R_FRAC, minDim);
      const amplitudeFraction = Math.min(1, s.maxAmplitude / LOOP_THRESHOLD);

      // ── Trail arc ───────────────────────────────────
      if (s.trail.length > 2) {
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x, s.trail[0].y);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.6 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── Swing arc guide ─────────────────────────────
      const arcAngle = Math.min(Math.PI, s.maxAmplitude * 1.2);
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, armLen, Math.PI / 2 - arcAngle, Math.PI / 2 + arcAngle);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.setLineDash([px(0.004, minDim), px(0.008, minDim)]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Arm ─────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ── Pivot ───────────────────────────────────────
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, px(PIVOT_R_FRAC, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.fill();

      // ── Bob outer glow ──────────────────────────────
      const glowR = bobR * (4 + amplitudeFraction * 3);
      const bobGlow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, glowR);
      const glowIntensity = 0.2 + amplitudeFraction * 0.3;
      bobGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowIntensity * entrance));
      bobGlow.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * glowIntensity * entrance));
      bobGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bobGlow;
      ctx.fillRect(bobX - glowR, bobY - glowR, glowR * 2, glowR * 2);

      // ── Bob body ────────────────────────────────────
      const bobBodyR = bobR * (1 + breath * 0.05);
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobBodyR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      // Bob bright core
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobBodyR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
        ALPHA.content.max * 0.25 * entrance,
      );
      ctx.fill();

      // ── Timing flash ────────────────────────────────
      if (s.timingFlash > 0) {
        const flashAlpha = (s.timingFlash / FLASH_DURATION) * ALPHA.content.max * 0.1 * entrance;
        const flashR = bobR * 6;
        const fg = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, flashR);
        fg.addColorStop(0, rgba(s.primaryRgb, flashAlpha));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(bobX - flashR, bobY - flashR, flashR * 2, flashR * 2);
      }

      // ── Miss flash ───────────────────────────��──────
      if (s.missFlash > 0) {
        const mAlpha = (s.missFlash / FLASH_DURATION) * ALPHA.atmosphere.max * 0.5 * entrance;
        ctx.beginPath();
        ctx.arc(bobX, bobY, bobR * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, mAlpha);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── Apex indicator (shows timing zone) ──────────
      if (!s.looped) {
        // Draw small markers at the current swing peaks
        const peakAngle = s.maxAmplitude * 0.95;
        for (const dir of [-1, 1]) {
          const pa = dir * peakAngle;
          const markerX = pivotX + Math.sin(pa) * armLen;
          const markerY = pivotY + Math.cos(pa) * armLen;
          ctx.beginPath();
          ctx.arc(markerX, markerY, px(0.004, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.5 * entrance);
          ctx.fill();
        }
      }

      // ── Amplitude progress arc ──────────────────────
      if (!s.looped && amplitudeFraction > 0.05) {
        const progressAngle = amplitudeFraction * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, px(0.015, minDim), -Math.PI / 2, -Math.PI / 2 + progressAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── Loop completion glow ────────────────────────
      if (s.looped) {
        const loopGlowR = px(0.25, minDim) * easeOutCubic(s.loopAnim);
        const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, loopGlowR);
        lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * s.loopAnim * entrance));
        lg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lg;
        ctx.fillRect(cx - loopGlowR, cy - loopGlowR, loopGlowR * 2, loopGlowR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.looped) return;

      const breath = propsRef.current.breathAmplitude;
      const threshold = APEX_THRESHOLD_BASE * (1 + breath * BREATH_WINDOW_FACTOR);
      const atApex = Math.abs(s.angVel) < threshold;

      if (atApex) {
        // Well-timed tap! Add energy in the direction of current swing
        const direction = s.angle > 0 ? 1 : -1;
        s.angVel += direction * TAP_BOOST;
        s.timingFlash = FLASH_DURATION;
        callbacksRef.current.onHaptic('tap');
      } else {
        // Mistimed — visual feedback but no energy added
        s.missFlash = FLASH_DURATION;
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
