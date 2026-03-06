/**
 * ATOM 385: THE SNOWBALL ROLL ENGINE
 * ====================================
 * Series 39 — Momentum Wheel · Position 5
 *
 * Prove that tiny 5-minute micro-efforts compound into an
 * unstoppable boulder. Drag to steer downhill and absorb mass
 * with every particle touched.
 *
 * PHYSICS:
 *   - Inclined geometric plane fills viewport diagonally
 *   - Tiny single node starts at top-left corner
 *   - User drags to steer the snowball down the slope
 *   - 60 scattered particles on the slope act as mass sources
 *   - Contact absorbs particle: radius increases, speed increases
 *   - Mass and velocity compound mathematically (not linearly)
 *   - Tiny flake becomes a viewport-filling unstoppable boulder
 *   - Breath modulates the absorbed particles' glow pulse
 *
 * INTERACTION:
 *   Drag → steers the snowball across the slope
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static massive boulder with absorbed particles visible
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Initial snowball radius (tiny) */
const INITIAL_R_FRAC = 0.012;
/** Maximum snowball radius (massive) */
const MAX_R_FRAC = SIZE.xl;
/** Particle count scattered on slope */
const PARTICLE_COUNT = 60;
/** Particle radius */
const PARTICLE_R_FRAC = 0.006;
/** Absorption radius multiplier (how close to absorb) */
const ABSORB_DIST_MULT = 1.5;
/** Growth per absorbed particle (fraction of current radius) */
const GROWTH_FACTOR = 0.035;
/** Slope angle (radians from horizontal) */
const SLOPE_ANGLE = Math.PI * 0.18;
/** Gravity acceleration along slope */
const SLOPE_GRAVITY = 0.00015;
/** Maximum roll speed */
const MAX_SPEED = 0.008;
/** Drag influence (how much pointer steers) */
const STEER_STRENGTH = 0.08;
/** Roll angle rotation speed multiplier */
const ROLL_ROTATION_MULT = 3;
/** Completion threshold (fraction of particles absorbed) */
const COMPLETION_RATIO = 0.85;
/** Breath pulse factor */
const BREATH_PULSE_FACTOR = 0.12;
/** Trail length */
const TRAIL_LENGTH = 25;
/** Trail ring count rendered inside snowball */
const INTERNAL_RINGS = 5;

// =====================================================================
// STATE TYPES
// =====================================================================

interface SlopeParticle {
  x: number;          // fraction 0-1
  y: number;          // fraction 0-1
  absorbed: boolean;
  absorbTime: number; // frame when absorbed
}

// =====================================================================
// HELPERS
// =====================================================================

function createParticles(): SlopeParticle[] {
  const particles: SlopeParticle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: 0.08 + Math.random() * 0.84,
      y: 0.08 + Math.random() * 0.84,
      absorbed: false,
      absorbTime: 0,
    });
  }
  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SnowballRollAtom({
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
    ballX: 0.15,
    ballY: 0.15,
    ballR: INITIAL_R_FRAC,
    rollAngle: 0,
    speed: 0,
    particles: createParticles(),
    absorbedCount: 0,
    massive: false,
    massiveAnim: 0,
    completed: false,
    trail: [] as { x: number; y: number }[],
    // Pointer state
    dragging: false,
    pointerX: 0,
    pointerY: 0,
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
      if (p.phase === 'resolve' && !s.massive) {
        // Auto-absorb remaining particles
        for (const pt of s.particles) {
          if (!pt.absorbed) {
            pt.absorbed = true;
            pt.absorbTime = s.frameCount;
            s.absorbedCount++;
            s.ballR = Math.min(MAX_R_FRAC, s.ballR * (1 + GROWTH_FACTOR));
          }
        }
      }

      // ── Ball physics ────────────────────────────────
      if (s.dragging && !p.reducedMotion) {
        // Steer toward pointer
        const targetX = s.pointerX / w;
        const targetY = s.pointerY / h;
        s.ballX += (targetX - s.ballX) * STEER_STRENGTH * ms;
        s.ballY += (targetY - s.ballY) * STEER_STRENGTH * ms;
      }

      // Gravity along slope (always pulls down-right)
      s.speed = Math.min(MAX_SPEED, s.speed + SLOPE_GRAVITY * ms);
      s.ballX += Math.cos(SLOPE_ANGLE) * s.speed * ms;
      s.ballY += Math.sin(SLOPE_ANGLE) * s.speed * ms;

      // Wrap within bounds
      s.ballX = Math.max(0.05, Math.min(0.95, s.ballX));
      s.ballY = Math.max(0.05, Math.min(0.95, s.ballY));

      // Roll rotation
      s.rollAngle += s.speed * ROLL_ROTATION_MULT * ms / Math.max(0.01, s.ballR);

      // ── Absorption check ────────────────────────────
      const ballPxR = px(s.ballR, minDim);
      const absorbDist = s.ballR * ABSORB_DIST_MULT;

      for (const pt of s.particles) {
        if (pt.absorbed) continue;
        const dx = pt.x - s.ballX;
        const dy = pt.y - s.ballY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < absorbDist) {
          pt.absorbed = true;
          pt.absorbTime = s.frameCount;
          s.absorbedCount++;
          s.ballR = Math.min(MAX_R_FRAC, s.ballR * (1 + GROWTH_FACTOR));
          s.speed *= 1.02; // Compound velocity
          cb.onHaptic('step_advance');
        }
      }

      // ── Massive detection ───────────────────────────
      if (s.absorbedCount >= PARTICLE_COUNT * COMPLETION_RATIO && !s.massive) {
        s.massive = true;
        cb.onHaptic('completion');
      }
      if (s.massive) {
        s.massiveAnim = Math.min(1, s.massiveAnim + 0.008 * ms);
      }

      // Trail
      s.trail.push({ x: s.ballX, y: s.ballY });
      if (s.trail.length > TRAIL_LENGTH) s.trail.shift();

      cb.onStateChange?.(s.massive
        ? 0.5 + s.massiveAnim * 0.5
        : (s.absorbedCount / PARTICLE_COUNT) * 0.5);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const bigR = px(MAX_R_FRAC * 0.8, minDim);
        // Massive static ball
        const bg = ctx.createRadialGradient(cx, cy, bigR * 0.3, cx, cy, bigR * 1.5);
        bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        bg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bg;
        ctx.fillRect(cx - bigR * 1.5, cy - bigR * 1.5, bigR * 3, bigR * 3);

        ctx.beginPath();
        ctx.arc(cx, cy, bigR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
        ctx.fill();

        // Internal accumulated rings
        for (let i = 0; i < INTERNAL_RINGS; i++) {
          const rr = bigR * (0.2 + (i / INTERNAL_RINGS) * 0.7);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const bx = s.ballX * w;
      const by = s.ballY * h;

      // ── Slope lines ─────────────────────────────────
      const slopeCount = 12;
      for (let i = 0; i < slopeCount; i++) {
        const offset = (i / slopeCount) * h;
        const x1 = 0;
        const y1 = offset;
        const x2 = w;
        const y2 = offset + Math.tan(SLOPE_ANGLE) * w;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.background.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Unabsorbed particles ────────────────────────
      for (const pt of s.particles) {
        if (pt.absorbed) continue;
        const ptx = pt.x * w;
        const pty = pt.y * h;
        const ptR = px(PARTICLE_R_FRAC, minDim);

        // Subtle pulse
        const pulse = 1 + Math.sin(s.frameCount * 0.04 + pt.x * 10) * 0.15;

        ctx.beginPath();
        ctx.arc(ptx, pty, ptR * pulse, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.fill();
      }

      // ── Roll trail ──────────────────────────────────
      if (s.trail.length > 2) {
        for (let i = 1; i < s.trail.length; i++) {
          const t = i / s.trail.length;
          const tx = s.trail[i].x * w;
          const ty = s.trail[i].y * h;
          const trailR = ballPxR * t * 0.3;
          ctx.beginPath();
          ctx.arc(tx, ty, trailR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * t * entrance);
          ctx.fill();
        }
      }

      // ── Ball shadow ─────────────────────────────────
      const shadowR = ballPxR * 1.4;
      const shadow = ctx.createRadialGradient(bx, by + ballPxR * 0.1, ballPxR * 0.3, bx, by, shadowR);
      shadow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * entrance));
      shadow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(bx - shadowR, by - shadowR, shadowR * 2, shadowR * 2);

      // ── Ball glow (grows with mass) ─────────────────
      const massRatio = s.absorbedCount / PARTICLE_COUNT;
      const breathMod = 1 + breath * BREATH_PULSE_FACTOR;
      const glowR = ballPxR * (2 + massRatio * 2) * breathMod;
      const glow = ctx.createRadialGradient(bx, by, ballPxR * 0.3, bx, by, glowR);
      glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.1 + massRatio * 0.2) * entrance));
      glow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * massRatio * entrance));
      glow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(bx - glowR, by - glowR, glowR * 2, glowR * 2);

      // ── Ball body ───────────────────────────────────
      ctx.beginPath();
      ctx.arc(bx, by, ballPxR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.3 + massRatio * 0.2) * entrance);
      ctx.fill();

      // ── Internal growth rings (show accumulated mass) ──
      const ringCount = Math.min(INTERNAL_RINGS, Math.floor(s.absorbedCount / 10));
      for (let i = 0; i < ringCount; i++) {
        const rr = ballPxR * (0.3 + (i / INTERNAL_RINGS) * 0.6);
        ctx.beginPath();
        ctx.arc(bx, by, rr, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.15),
          ALPHA.atmosphere.max * 0.4 * entrance,
        );
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Roll rotation marks ─────────────────────────
      for (let i = 0; i < 4; i++) {
        const a = s.rollAngle + (i / 4) * Math.PI * 2;
        const markR = ballPxR * 0.7;
        const mx = bx + Math.cos(a) * markR;
        const my = by + Math.sin(a) * markR;
        ctx.beginPath();
        ctx.arc(mx, my, px(0.003, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2),
          ALPHA.content.max * 0.15 * entrance,
        );
        ctx.fill();
      }

      // ── Bright core ─────────────────────────────────
      ctx.beginPath();
      ctx.arc(bx, by, ballPxR * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
        ALPHA.content.max * 0.2 * entrance,
      );
      ctx.fill();

      // ── Massive completion glow ─────────────────────
      if (s.massive) {
        const mGlowR = px(GLOW.lg, minDim) * easeOutCubic(s.massiveAnim);
        const mg = ctx.createRadialGradient(bx, by, ballPxR, bx, by, mGlowR);
        mg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * s.massiveAnim * entrance));
        mg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(bx - mGlowR, by - mGlowR, mGlowR * 2, mGlowR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.pointerX = e.clientX - canvas.getBoundingClientRect().left;
      stateRef.current.pointerY = e.clientY - canvas.getBoundingClientRect().top;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointerX = e.clientX - rect.left;
      stateRef.current.pointerY = e.clientY - rect.top;
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
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
