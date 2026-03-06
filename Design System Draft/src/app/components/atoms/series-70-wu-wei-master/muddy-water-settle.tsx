/**
 * ATOM 691: THE MUDDY WATER ENGINE
 * ==================================
 * Series 70 — Wu Wei Master · Position 1
 *
 * Cure overthinking by proving stillness is the answer. Every swipe
 * stirs more silt. Remove hands for 8 continuous seconds — gravity
 * settles the particles leaving the UI crystal clear.
 *
 * PHYSICS:
 *   - 200+ silt particles fill viewport in chaotic brownian motion
 *   - Each pointer contact violently agitates particles (stir effect)
 *   - Particles have gravity + drag coefficient (Stokes settling)
 *   - Without input: particles slowly drift downward, clearing top
 *   - 8 seconds of stillness → water becomes crystal clear
 *   - Settled particles form beautiful sediment layer at bottom
 *   - Touching during settling resets — particles erupt back upward
 *   - Clarity progress tracked as inverse of silt density above midline
 *
 * INTERACTION:
 *   Touch → stirs silt (counterproductive)
 *   Hands off 8s → gravity settles → crystal clarity
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static clear water with sediment at bottom
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total silt particles */
const PARTICLE_COUNT = 200;
/** Gravity acceleration (fraction/frame²) */
const GRAVITY = 0.00008;
/** Drag coefficient (velocity multiplier per frame) */
const DRAG = 0.985;
/** Stir force — how much touching agitates particles */
const STIR_FORCE = 0.015;
/** Stir radius of influence (fraction) */
const STIR_RADIUS = 0.25;
/** Stillness required for settling (frames at 60fps ≈ 8 seconds) */
const SETTLE_FRAMES = 480;
/** Particle size range */
const PARTICLE_SIZE_MIN = 0.002;
const PARTICLE_SIZE_MAX = 0.006;
/** Settled layer max height */
const SEDIMENT_MAX_H = 0.06;
/** Water clarity glow at full clear */
const CLARITY_GLOW_R = 0.45;
/** Breath does not affect this atom */
const STEP_AT = 0.5;
/** Core visibility radius when clear */
const CORE_R = SIZE.md;

interface SiltParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  settled: boolean;
  mass: number;       // heavier particles settle faster
  brownian: number;   // individual brownian amplitude
}

export default function MuddyWaterSettleAtom({
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
    particles: Array.from({ length: PARTICLE_COUNT }, (): SiltParticle => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      size: PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN),
      settled: false,
      mass: 0.5 + Math.random() * 0.5,
      brownian: 0.0003 + Math.random() * 0.0005,
    })),
    stillFrames: 0,
    clarity: 0,         // 0–1
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

      const time = s.frameCount * 0.012;

      // ── Reduced motion ────────────────────────────────────
      if (p.reducedMotion) {
        // Clear water with sediment at bottom
        const sedH = px(SEDIMENT_MAX_H, minDim);
        const sedGrad = ctx.createLinearGradient(0, h - sedH * 2, 0, h);
        sedGrad.addColorStop(0, rgba(s.accentRgb, 0));
        sedGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
        ctx.fillStyle = sedGrad;
        ctx.fillRect(0, h - sedH * 2, w, sedH * 2);
        // Clarity core
        const cR = px(CORE_R * 0.4, minDim);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * 3);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - cR * 3, cy - cR * 3, cR * 6, cR * 6);
        ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Auto-resolve ──────────────────────────────────────
      if (p.phase === 'resolve') {
        s.stillFrames = SETTLE_FRAMES;
      }

      // ── Particle physics ──────────────────────────────────
      s.stillFrames = Math.min(SETTLE_FRAMES + 60, s.stillFrames + 1);
      let unsettledAboveMid = 0;

      for (const pt of s.particles) {
        if (pt.settled) continue;

        // Gravity (Stokes settling — heavier faster)
        pt.vy += GRAVITY * pt.mass * ms;

        // Brownian motion (decreases as stillness increases)
        const brownianScale = Math.max(0, 1 - s.stillFrames / (SETTLE_FRAMES * 0.5));
        pt.vx += (Math.random() - 0.5) * pt.brownian * brownianScale * ms;
        pt.vy += (Math.random() - 0.5) * pt.brownian * brownianScale * 0.5 * ms;

        // Drag
        pt.vx *= DRAG;
        pt.vy *= DRAG;

        // Update position
        pt.x += pt.vx * ms;
        pt.y += pt.vy * ms;

        // Horizontal wrap
        if (pt.x < 0) pt.x = 1;
        if (pt.x > 1) pt.x = 0;

        // Floor collision → settle
        if (pt.y > 1 - SEDIMENT_MAX_H * pt.mass) {
          pt.y = 1 - SEDIMENT_MAX_H * pt.mass;
          pt.vy = 0;
          pt.vx *= 0.5;
          if (Math.abs(pt.vy) < 0.0001 && s.stillFrames > SETTLE_FRAMES * 0.3) {
            pt.settled = true;
          }
        }

        // Track density above midline
        if (pt.y < 0.5) unsettledAboveMid++;
      }

      // Clarity calculation
      const maxAbove = PARTICLE_COUNT * 0.5;
      s.clarity = 1 - Math.min(1, unsettledAboveMid / maxAbove);

      // Step haptic at 50% clarity
      if (s.clarity >= STEP_AT && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      // Completion at near-full clarity
      if (s.clarity >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      cb.onStateChange?.(s.clarity);

      // ── 1. Silt particles ─────────────────────────────────
      for (const pt of s.particles) {
        const ptX = pt.x * w;
        const ptY = pt.y * h;
        const ptR = px(pt.size, minDim);
        const ptAlpha = ALPHA.content.max * (pt.settled ? 0.15 : (0.25 + pt.mass * 0.2)) * entrance;

        // Particle glow (subtle)
        if (!pt.settled && ptR > 1) {
          const pg = ctx.createRadialGradient(ptX, ptY, 0, ptX, ptY, ptR * 2);
          pg.addColorStop(0, rgba(s.accentRgb, ptAlpha * 0.3));
          pg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = pg;
          ctx.fillRect(ptX - ptR * 2, ptY - ptR * 2, ptR * 4, ptR * 4);
        }

        ctx.beginPath();
        ctx.arc(ptX, ptY, ptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ptAlpha);
        ctx.fill();
      }

      // ── 2. Sediment layer ─────────────────────────────────
      const settledCount = s.particles.filter(p2 => p2.settled).length;
      const sedimentH = px(SEDIMENT_MAX_H * settledCount / PARTICLE_COUNT, minDim);
      if (sedimentH > 1) {
        const sedGrad = ctx.createLinearGradient(0, h - sedimentH * 2, 0, h);
        sedGrad.addColorStop(0, rgba(s.accentRgb, 0));
        sedGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.12 * entrance));
        ctx.fillStyle = sedGrad;
        ctx.fillRect(0, h - sedimentH * 2, w, sedimentH * 2);
      }

      // ── 3. Clarity reveal (center glow) ───────────────────
      if (s.clarity > 0.1) {
        const clarityR = px(CLARITY_GLOW_R * s.clarity, minDim);
        for (let i = 3; i >= 0; i--) {
          const gR = clarityR * (0.5 + i * 0.5);
          const gA = ALPHA.glow.max * 0.1 * s.clarity * entrance / (i + 1);
          const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          cg.addColorStop(0, rgba(s.primaryRgb, gA));
          cg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = cg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Core node emerges from clarity
        if (s.clarity > 0.4) {
          const coreR = px(0.02 * s.clarity, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * s.clarity * 0.5 * entrance);
          ctx.fill();
        }
      }

      // ── 4. Stillness indicator (subtle ring) ──────────────
      if (s.stillFrames > 60 && !s.completed) {
        const stillProgress = Math.min(1, s.stillFrames / SETTLE_FRAMES);
        const stillAngle = stillProgress * Math.PI * 2;
        const stillR = px(SIZE.xs * 0.8, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.08, minDim), stillR, -Math.PI / 2, -Math.PI / 2 + stillAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Touch = stir (counterproductive) ──────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Reset stillness
      s.stillFrames = 0;
      s.stepNotified = false;

      // Stir all particles within radius
      for (const pt of s.particles) {
        const dx = pt.x - mx;
        const dy = pt.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < STIR_RADIUS) {
          const force = STIR_FORCE * (1 - dist / STIR_RADIUS);
          pt.vx += (Math.random() - 0.5) * force;
          pt.vy += (Math.random() - 0.5) * force - force * 0.5; // upward bias
          pt.settled = false;
        }
      }

      callbacksRef.current.onHaptic('error_boundary');
    };

    const onMove = (e: PointerEvent) => {
      // Continued stirring while finger is down
      const s = stateRef.current;
      if (s.completed) return;
      s.stillFrames = 0;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      for (const pt of s.particles) {
        const dx = pt.x - mx;
        const dy = pt.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < STIR_RADIUS * 0.5) {
          pt.vx += (Math.random() - 0.5) * STIR_FORCE * 0.3;
          pt.vy += (Math.random() - 0.5) * STIR_FORCE * 0.3;
          pt.settled = false;
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
