/**
 * ATOM 374: THE WINNOWING WIND ENGINE
 * =====================================
 * Series 38 — Magnetic Sieve · Position 4
 *
 * Cure clinging to obsolete habits. Digital wind effortlessly
 * blows away lightweight chaff leaving only dense unmovable seeds.
 *
 * PHYSICS:
 *   - Hundreds of tiny particles resting on a horizontal plane
 *   - User taps rhythmically synced with breath to generate wind gusts
 *   - Lightweight chaff particles scatter and fly off edges
 *   - Dense seed particles are unmoved by even the strongest gust
 *   - Wind ripples visible as horizontal wave distortions
 *   - Seeds glow brighter as chaff clears around them
 *   - Breath amplitude modulates wind gust visual intensity
 *
 * INTERACTION:
 *   Tap (rhythmic) → generates wind gusts from left
 *   Breath (passive) → modulates gust power visual
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static scene with seeds on plane, chaff scattered off-screen
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total particles on the plane */
const TOTAL_PARTICLES = 120;
/** Dense seed particles (unmovable) */
const SEED_COUNT = 5;
/** Ground plane Y position (fraction of viewport) */
const GROUND_Y = 0.62;
/** Wind gust velocity applied to chaff per tap */
const GUST_FORCE = 0.012;
/** Gravity pulling chaff back down */
const CHAFF_GRAVITY = 0.0004;
/** Air resistance slowing horizontal movement */
const AIR_DRAG = 0.985;
/** Seed radius — large and dense */
const SEED_R_FRAC = 0.018;
/** Chaff radius range — small and varied */
const CHAFF_R_MIN = 0.003;
const CHAFF_R_MAX = 0.008;
/** Wind ripple wave speed */
const RIPPLE_SPEED = 0.06;
/** Number of wind ripple lines */
const RIPPLE_COUNT = 6;
/** How much breath modulates gust visual */
const BREATH_GUST_FACTOR = 0.2;
/** Gust visual duration (frames) */
const GUST_DURATION = 30;
/** Seed glow radius multiplier */
const SEED_GLOW_MULT = 6;
/** Completion threshold — fraction of chaff removed */
const CLEAR_THRESHOLD = 0.85;

// =====================================================================
// STATE TYPES
// =====================================================================

interface ChaffParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;      // lighter = more affected by wind
  blown: boolean;    // off screen
  rotation: number;
  rotSpeed: number;
}

interface SeedParticle {
  x: number;
  y: number;
  radius: number;
  wobble: number;    // slight wobble when wind hits, then settles
}

// =====================================================================
// HELPERS
// =====================================================================

function createChaff(count: number): ChaffParticle[] {
  return Array.from({ length: count }, () => ({
    x: 0.08 + Math.random() * 0.84,
    y: GROUND_Y - Math.random() * 0.02,
    vx: 0,
    vy: 0,
    radius: CHAFF_R_MIN + Math.random() * (CHAFF_R_MAX - CHAFF_R_MIN),
    mass: 0.1 + Math.random() * 0.4,
    blown: false,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.03,
  }));
}

function createSeeds(count: number): SeedParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 0.2 + (i / (count - 1)) * 0.6,
    y: GROUND_Y,
    radius: SEED_R_FRAC,
    wobble: 0,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function WinnowingWindAtom({
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
    chaff: createChaff(TOTAL_PARTICLES - SEED_COUNT),
    seeds: createSeeds(SEED_COUNT),
    gustTimer: 0,          // countdown for gust visual
    gustCount: 0,          // total gusts delivered
    blownCount: 0,         // chaff removed
    completed: false,
    completionAnim: 0,
    ripplePhase: 0,        // wind ripple animation phase
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

    const triggerGust = () => {
      const s = stateRef.current;
      s.gustTimer = GUST_DURATION;
      s.gustCount++;

      // Apply wind force to all non-blown chaff
      for (const c of s.chaff) {
        if (c.blown) continue;
        const windEffect = GUST_FORCE / (c.mass + 0.1);
        c.vx += windEffect * (0.7 + Math.random() * 0.6);
        c.vy -= windEffect * (0.2 + Math.random() * 0.3);
        c.rotSpeed += (Math.random() - 0.3) * 0.08;
      }

      // Seeds wobble slightly but don't move
      for (const seed of s.seeds) {
        seed.wobble = 0.008;
      }

      callbacksRef.current.onHaptic('tap');
    };

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
      if (p.phase === 'resolve' && !s.completed) {
        if (s.frameCount % 10 === 0) triggerGust();
      }

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const groundPx = GROUND_Y * h;

        // Draw ground line
        ctx.beginPath();
        ctx.moveTo(0, groundPx);
        ctx.lineTo(w, groundPx);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // Draw seeds at rest with glows
        for (const seed of s.seeds) {
          const sx = seed.x * w;
          const sy = groundPx;
          const sR = px(seed.radius, minDim);
          const glowR = sR * SEED_GLOW_MULT;

          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
          glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
          glow.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
          glow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = glow;
          ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);

          ctx.beginPath();
          ctx.arc(sx, sy, sR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
          ctx.fill();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Gust timer decay ────────────────────────────
      if (s.gustTimer > 0) {
        s.gustTimer--;
        s.ripplePhase += RIPPLE_SPEED * ms;
      }

      // ── Chaff physics ───────────────────────────────
      let newBlown = 0;
      for (const c of s.chaff) {
        if (c.blown) { newBlown++; continue; }

        c.x += c.vx * ms;
        c.y += c.vy * ms;
        c.vy += CHAFF_GRAVITY * ms;
        c.vx *= AIR_DRAG;
        c.rotation += c.rotSpeed * ms;

        // Ground collision
        if (c.y > GROUND_Y && c.vy > 0) {
          c.y = GROUND_Y;
          c.vy *= -0.2;
          c.vx *= 0.7;
        }

        // Mark as blown when off right edge or far off top
        if (c.x > 1.3 || c.y < -0.3) {
          c.blown = true;
          newBlown++;
        }
      }
      s.blownCount = newBlown;

      // ── Seed wobble decay ───────────────────────────
      for (const seed of s.seeds) {
        seed.wobble *= 0.9;
      }

      // ── Completion check ────────────────────────────
      const clearFraction = s.blownCount / s.chaff.length;
      if (clearFraction >= CLEAR_THRESHOLD && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : clearFraction * 0.5);

      // ── Draw ground plane ───────────────────────────
      const groundPx = GROUND_Y * h;

      // Ground surface — subtle gradient
      const groundGrad = ctx.createLinearGradient(0, groundPx, 0, groundPx + minDim * 0.08);
      groundGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.5 * entrance));
      groundGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundPx, w, minDim * 0.08);

      // Ground line
      ctx.beginPath();
      ctx.moveTo(0, groundPx);
      ctx.lineTo(w, groundPx);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // ── Draw wind ripples ───────────────────────────
      if (s.gustTimer > 0) {
        const gustAlpha = (s.gustTimer / GUST_DURATION) * entrance;
        const breathMod = 1 + breath * BREATH_GUST_FACTOR;

        for (let i = 0; i < RIPPLE_COUNT; i++) {
          const rippleX = (s.ripplePhase * (1 + i * 0.15)) % 1.5 - 0.2;
          const rippleY = groundPx - minDim * (0.05 + i * 0.04);
          const rippleW = minDim * 0.15 * breathMod;

          ctx.beginPath();
          ctx.moveTo(rippleX * w, rippleY);
          ctx.bezierCurveTo(
            rippleX * w + rippleW * 0.3, rippleY - px(0.008, minDim),
            rippleX * w + rippleW * 0.7, rippleY + px(0.008, minDim),
            rippleX * w + rippleW, rippleY,
          );
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.6 * gustAlpha * (1 - i / RIPPLE_COUNT));
          ctx.lineWidth = px(0.0008, minDim);
          ctx.stroke();
        }
      }

      // ── Draw chaff particles ────────────────────────
      for (const c of s.chaff) {
        if (c.blown) continue;

        const cpx = c.x * w;
        const cpy = c.y * h;
        const cR = px(c.radius, minDim);

        ctx.save();
        ctx.translate(cpx, cpy);
        ctx.rotate(c.rotation);

        // Irregular chaff shape (elongated ellipse)
        ctx.beginPath();
        ctx.ellipse(0, 0, cR * 1.5, cR * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.fill();

        ctx.restore();
      }

      // ── Draw seeds ──────────────────────────────────
      const seedRevealBonus = Math.min(1, clearFraction / CLEAR_THRESHOLD);
      for (const seed of s.seeds) {
        const sx = (seed.x + Math.sin(s.frameCount * 0.1) * seed.wobble) * w;
        const sy = groundPx;
        const sR = px(seed.radius, minDim) * (1 + breath * 0.04);

        // Outer glow — intensifies as chaff clears
        const glowR = sR * SEED_GLOW_MULT * (0.5 + seedRevealBonus * 0.5);
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.15 + seedRevealBonus * 0.25) * entrance));
        glow.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * (0.5 + seedRevealBonus * 0.5) * entrance));
        glow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);

        // Inner warm halo
        const innerR = sR * 2.5;
        const inner = ctx.createRadialGradient(sx, sy, 0, sx, sy, innerR);
        inner.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
        inner.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = inner;
        ctx.fillRect(sx - innerR, sy - innerR, innerR * 2, innerR * 2);

        // Seed body
        ctx.beginPath();
        ctx.arc(sx, sy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.35 + seedRevealBonus * 0.2) * entrance);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(sx, sy, sR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255], 0.35),
          ALPHA.content.max * 0.25 * seedRevealBonus * entrance,
        );
        ctx.fill();
      }

      // ── Gust indicator (left side) ──────────────────
      if (s.gustTimer > GUST_DURATION * 0.5) {
        const gustVisual = (s.gustTimer / GUST_DURATION) * entrance;
        const arrowX = w * 0.04;
        const arrowY = groundPx - minDim * 0.08;
        const arrowLen = minDim * 0.06;

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + arrowLen, arrowY);
        ctx.lineTo(arrowX + arrowLen - px(0.008, minDim), arrowY - px(0.005, minDim));
        ctx.moveTo(arrowX + arrowLen, arrowY);
        ctx.lineTo(arrowX + arrowLen - px(0.008, minDim), arrowY + px(0.005, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * gustVisual);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      triggerGust();
      canvas.setPointerCapture(e.pointerId);
    };

    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
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
