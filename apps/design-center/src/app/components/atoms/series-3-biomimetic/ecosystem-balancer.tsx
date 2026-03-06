/**
 * ATOM 028: THE ECOSYSTEM BALANCER
 * ==================================
 * Series 3 — Biomimetic Algorithms · Position 8
 *
 * The old paradigm fights bad habits — attacking algae with
 * bleach. The ecological paradigm introduces counter-balances —
 * adding snails. You don't fight the dark; you add more light.
 *
 * Dark particles multiply exponentially, overwhelming the screen.
 * The user taps to introduce glowing "light" particles. These
 * don't destroy the dark — they naturally regulate through
 * Lotka-Volterra predator-prey dynamics. The system oscillates
 * toward equilibrium. Too many light particles overshoot and
 * crash. The beauty: watching chaos settle into organic harmony
 * without violence.
 *
 * PHYSICS:
 *   - Lotka-Volterra population dynamics (prey = dark, predator = light)
 *   - Dark particles: reproduce near each other, spread outward
 *   - Light particles: consume nearby dark, reproduce when fed, die when starved
 *   - Population oscillation toward equilibrium
 *   - No "delete" button — only introduction of new variables
 *   - Breath modulates reproduction rate (deeper = faster cycling)
 *
 * HAPTIC JOURNEY:
 *   Tap to introduce   → drag_snap (new variable enters)
 *   Balance approaches  → step_advance
 *   Sustained balance   → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Slower particle movement, no reproduction animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Starting dark particle count */
const INITIAL_DARK = 60;
/** Light particles per tap */
const LIGHT_PER_TAP = 8;
/** Max total particles */
const MAX_PARTICLES = 300;
/** Dark reproduction rate (probability per frame per particle) */
const DARK_REPRO_RATE = 0.002;
/** Light consumption radius as fraction of minDim */
const CONSUME_RADIUS_FRAC = 0.036;
/** Light reproduction after consuming */
const LIGHT_REPRO_CHANCE = 0.15;
/** Light starvation rate (frames without eating before death) */
const LIGHT_STARVE_FRAMES = 300;
/** Particle max speed */
const MAX_SPEED = 1.2;
/** Balance threshold: |dark% - 0.5| < this = balanced */
const BALANCE_THRESHOLD = 0.08;
/** Sustained balance frames for completion */
const BALANCE_SUSTAIN = 180;

// =====================================================================
// PARTICLE
// =====================================================================

interface EcoParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'dark' | 'light';
  size: number;
  age: number;
  lastAte: number; // frame (light only)
  alpha: number;
  pulsePhase: number;
}

function spawnDark(w: number, h: number, frame: number, minDim: number): EcoParticle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * MAX_SPEED * minDim * 0.002,
    vy: (Math.random() - 0.5) * MAX_SPEED * minDim * 0.002,
    type: 'dark',
    size: minDim * (0.004 + Math.random() * 0.004),
    age: 0,
    lastAte: frame,
    alpha: 0,
    pulsePhase: Math.random() * Math.PI * 2,
  };
}

function spawnLight(x: number, y: number, frame: number, minDim: number): EcoParticle {
  return {
    x: x + (Math.random() - 0.5) * minDim * 0.04,
    y: y + (Math.random() - 0.5) * minDim * 0.04,
    vx: (Math.random() - 0.5) * MAX_SPEED * 0.8 * minDim * 0.002,
    vy: (Math.random() - 0.5) * MAX_SPEED * 0.8 * minDim * 0.002,
    type: 'light',
    size: minDim * (0.005 + Math.random() * 0.004),
    age: 0,
    lastAte: frame,
    alpha: 0,
    pulsePhase: Math.random() * Math.PI * 2,
  };
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const DARK_PARTICLE: RGB = [50, 30, 60];        // Toxic purple-dark
const DARK_GLOW: RGB = [80, 45, 90];
const LIGHT_PARTICLE: RGB = [140, 200, 90];     // Healing green-gold
const LIGHT_GLOW: RGB = [170, 220, 110];
const EQUIL_COLOR: RGB = [160, 200, 130];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EcosystemBalancerAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    particles: [] as EcoParticle[],
    darkCount: 0,
    lightCount: 0,
    balanceFrames: 0,
    resolved: false,
    lastStepAt: 0,
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    // ── Native tap handler ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      if (s.particles.length < MAX_PARTICLES) {
        const count = Math.min(LIGHT_PER_TAP, MAX_PARTICLES - s.particles.length);
        for (let i = 0; i < count; i++) {
          s.particles.push(spawnLight(px, py, s.frameCount, minDim));
        }
        cbRef.current.onHaptic('drag_snap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    if (!s.initialized) {
      // Seed with dark particles
      for (let i = 0; i < INITIAL_DARK; i++) {
        s.particles.push(spawnDark(w, h, 0, minDim));
      }
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      const breathMod = 1 + p.breathAmplitude * 0.5;
      const spdMult = p.reducedMotion ? 0.4 : 1;

      // ══════════════════════════════════════════════════
      // POPULATION DYNAMICS
      // ══════════════════════════════════════════════════

      const newParticles: EcoParticle[] = [];
      const deadIndices = new Set<number>();

      let darkN = 0;
      let lightN = 0;

      for (let i = 0; i < s.particles.length; i++) {
        const p_ = s.particles[i];
        p_.age++;
        p_.alpha = Math.min(1, p_.alpha + 0.02);

        if (p_.type === 'dark') darkN++;
        else lightN++;
      }

      s.darkCount = darkN;
      s.lightCount = lightN;

      // Dark reproduction
      if (s.particles.length < MAX_PARTICLES) {
        for (const p_ of s.particles) {
          if (p_.type !== 'dark') continue;
          const reproRate = DARK_REPRO_RATE * breathMod;
          if (Math.random() < reproRate && s.particles.length + newParticles.length < MAX_PARTICLES) {
            const baby = spawnDark(w, h, s.frameCount, minDim);
            baby.x = p_.x + (Math.random() - 0.5) * minDim * 0.04;
            baby.y = p_.y + (Math.random() - 0.5) * minDim * 0.04;
            newParticles.push(baby);
          }
        }
      }

      // Light consumes dark
      for (let i = 0; i < s.particles.length; i++) {
        const light = s.particles[i];
        if (light.type !== 'light') continue;

        for (let j = 0; j < s.particles.length; j++) {
          if (i === j || deadIndices.has(j)) continue;
          const dark = s.particles[j];
          if (dark.type !== 'dark') continue;

          const d = Math.hypot(light.x - dark.x, light.y - dark.y);
          if (d < CONSUME_RADIUS_FRAC * minDim) {
            deadIndices.add(j);
            light.lastAte = s.frameCount;

            // Light reproduces after eating
            if (Math.random() < LIGHT_REPRO_CHANCE && s.particles.length + newParticles.length < MAX_PARTICLES) {
              newParticles.push(spawnLight(light.x, light.y, s.frameCount, minDim));
            }
            break; // One meal per frame
          }
        }

        // Starvation check
        if (s.frameCount - light.lastAte > LIGHT_STARVE_FRAMES) {
          deadIndices.add(i);
        }
      }

      // Remove dead, add new
      for (let i = s.particles.length - 1; i >= 0; i--) {
        if (deadIndices.has(i)) s.particles.splice(i, 1);
      }
      for (const np of newParticles) s.particles.push(np);

      // ── Movement ──────────────────────────────────────
      for (const p_ of s.particles) {
        // Gentle brownian drift
        p_.vx += (Math.random() - 0.5) * 0.1;
        p_.vy += (Math.random() - 0.5) * 0.1;

        const spd = Math.hypot(p_.vx, p_.vy);
        const maxS = MAX_SPEED * spdMult;
        if (spd > maxS) {
          p_.vx = (p_.vx / spd) * maxS;
          p_.vy = (p_.vy / spd) * maxS;
        }

        p_.x += p_.vx;
        p_.y += p_.vy;

        // Soft boundary
        if (p_.x < 0) { p_.x = 0; p_.vx = Math.abs(p_.vx) * 0.5; }
        if (p_.x > w) { p_.x = w; p_.vx = -Math.abs(p_.vx) * 0.5; }
        if (p_.y < 0) { p_.y = 0; p_.vy = Math.abs(p_.vy) * 0.5; }
        if (p_.y > h) { p_.y = h; p_.vy = -Math.abs(p_.vy) * 0.5; }
      }

      // ── Balance detection ─────────────────────────────
      const total = s.darkCount + s.lightCount;
      const darkRatio = total > 0 ? s.darkCount / total : 1;
      const balanced = Math.abs(darkRatio - 0.5) < BALANCE_THRESHOLD && s.lightCount > 5;

      if (balanced) {
        s.balanceFrames++;
        if (s.balanceFrames === 60 && s.balanceFrames !== s.lastStepAt) {
          s.lastStepAt = s.balanceFrames;
          cb.onHaptic('step_advance');
        }
        if (s.balanceFrames >= BALANCE_SUSTAIN && !s.resolved) {
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      } else {
        s.balanceFrames = 0;
      }

      // State: 1 = perfect balance, 0 = all dark
      const balanceScore = total > 0 ? 1 - Math.abs(darkRatio - 0.5) * 2 : 0;
      cb.onStateChange?.(s.lightCount > 0 ? balanceScore : 0);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // Background
      const bgBase = lerpColor([5, 4, 8], s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Dark atmospheric haze
      if (s.darkCount > 20) {
        const hazeAlpha = Math.min(0.03, (s.darkCount / MAX_PARTICLES) * 0.05) * entrance;
        const hazeColor = lerpColor(DARK_GLOW, s.primaryRgb, 0.08);
        ctx.fillStyle = rgba(hazeColor, hazeAlpha);
        ctx.fillRect(0, 0, w, h);
      }

      // Particles
      for (const p_ of s.particles) {
        const pulse = p.reducedMotion ? 0.7 :
          0.6 + 0.4 * Math.sin(s.frameCount * 0.03 + p_.pulsePhase);
        const alpha = p_.alpha * pulse * 0.35 * entrance;

        if (p_.type === 'dark') {
          const dkColor = lerpColor(DARK_PARTICLE, s.primaryRgb, 0.06);
          const dkGlow = lerpColor(DARK_GLOW, s.primaryRgb, 0.08);

          // Glow
          const glowR = p_.size * 3;
          const glowGrad = ctx.createRadialGradient(p_.x, p_.y, 0, p_.x, p_.y, glowR);
          glowGrad.addColorStop(0, rgba(dkGlow, alpha * 0.15));
          glowGrad.addColorStop(1, rgba(dkGlow, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(p_.x - glowR, p_.y - glowR, glowR * 2, glowR * 2);

          // Body — slightly angular (toxic)
          ctx.save();
          ctx.translate(p_.x, p_.y);
          ctx.rotate(p_.pulsePhase + s.frameCount * (p.reducedMotion ? 0 : 0.003));
          const sz = p_.size;
          ctx.beginPath();
          ctx.moveTo(0, -sz);
          ctx.lineTo(sz * 0.8, sz * 0.5);
          ctx.lineTo(-sz * 0.8, sz * 0.5);
          ctx.closePath();
          ctx.fillStyle = rgba(dkColor, alpha);
          ctx.fill();
          ctx.restore();
        } else {
          const ltColor = lerpColor(LIGHT_PARTICLE, s.accentRgb, 0.12);
          const ltGlow = lerpColor(LIGHT_GLOW, s.accentRgb, 0.1);

          // Glow (brighter)
          const glowR = p_.size * 3.5;
          const glowGrad = ctx.createRadialGradient(p_.x, p_.y, 0, p_.x, p_.y, glowR);
          glowGrad.addColorStop(0, rgba(ltGlow, alpha * 0.25));
          glowGrad.addColorStop(0.4, rgba(ltGlow, alpha * 0.05));
          glowGrad.addColorStop(1, rgba(ltGlow, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(p_.x - glowR, p_.y - glowR, glowR * 2, glowR * 2);

          // Body — round (healing)
          ctx.beginPath();
          ctx.arc(p_.x, p_.y, p_.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = rgba(ltColor, alpha);
          ctx.fill();
        }
      }

      // Balance aura (when near equilibrium)
      if (balanceScore > 0.7 && s.lightCount > 3) {
        const auraAlpha = (balanceScore - 0.7) * 0.06 * entrance;
        const auraPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.015));
        const auraColor = lerpColor(EQUIL_COLOR, s.accentRgb, 0.15);
        const aR = minDim * 0.3;
        const aGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, aR);
        aGrad.addColorStop(0, rgba(auraColor, auraAlpha * auraPulse));
        aGrad.addColorStop(0.5, rgba(auraColor, auraAlpha * 0.2 * auraPulse));
        aGrad.addColorStop(1, rgba(auraColor, 0));
        ctx.fillStyle = aGrad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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