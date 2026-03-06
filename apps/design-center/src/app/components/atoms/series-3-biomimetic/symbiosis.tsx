/**
 * ATOM 025: THE SYMBIOSIS ENGINE
 * ================================
 * Series 3 — Biomimetic Algorithms · Position 5
 *
 * Burnout comes from believing you must constantly output. You
 * cannot exhale forever; you must let the forest breathe back
 * into you. This atom teaches the ecological principle of mutual
 * exchange through a living figure-8 of particles flowing
 * between two symbiotic entities.
 *
 * Two organic orbs sit on opposite sides — one warm (Self),
 * one cool (Forest). Between them, particles trace a perpetual
 * lemniscate (figure-8), shifting color as they cross: warm
 * particles cool as they reach the forest; cool particles warm
 * as they return. Breath amplitude drives flow velocity. A
 * horizontal drag bias adjusts the exchange ratio — finding the
 * exact equilibrium where both entities glow at equal brightness.
 *
 * PHYSICS:
 *   - Two entity orbs with independent health/brightness
 *   - 80 particles flowing on a lemniscate path
 *   - Color shift along path: warm ↔ cool gradient
 *   - Breath amplitude drives flow speed
 *   - Horizontal drag adjusts exchange bias (-1 to +1)
 *   - Entity health = net particle flow in their direction
 *   - Equilibrium = |healthSelf - healthForest| → 0
 *   - When equilibrium is near-perfect: both entities pulse in sync
 *
 * HAPTIC JOURNEY:
 *   breath_peak   flow surge
 *   drag_snap    → equilibrium crossings (at 0.0 bias)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static particle positions, no flow animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PARTICLE_COUNT = 80;
/** Lemniscate semi-axis as fraction of viewport width */
const LEMNI_A_FRAC = 0.28;
/** Entity orb radius as fraction of min dimension */
const ENTITY_RADIUS_FRAC = 0.06;
/** Base flow speed (radians/frame around the lemniscate) */
const BASE_FLOW_SPEED = 0.008;
/** Breath flow multiplier */
const BREATH_FLOW_MULT = 0.02;
/** Entity health response rate */
const HEALTH_RESPONSE = 0.002;
/** Health decay toward neutral */
const HEALTH_DECAY = 0.0005;
/** Drag sensitivity for bias adjustment */
const DRAG_SENSITIVITY = 0.003;
/** Equilibrium snap distance for haptic */
const EQUIL_SNAP = 0.05;

// =====================================================================
// PARTICLE
// =====================================================================

interface FlowParticle {
  /** Parametric position on lemniscate (0 to 2π) */
  theta: number;
  /** Individual speed variation */
  speedMult: number;
  /** Size */
  size: number;
  /** Brightness */
  brightness: number;
}

function createParticles(minDim: number): FlowParticle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    theta: (i / PARTICLE_COUNT) * Math.PI * 2,
    speedMult: 0.8 + Math.random() * 0.4,
    size: minDim * (0.002 + Math.random() * 0.004),
    brightness: 0.4 + Math.random() * 0.6,
  }));
}

// =====================================================================
// LEMNISCATE MATH
// =====================================================================

/**
 * Lemniscate of Bernoulli: r² = a² · cos(2θ)
 * Parametric form for continuous loop:
 *   x = a · cos(t) / (1 + sin²(t))
 *   y = a · sin(t) · cos(t) / (1 + sin²(t))
 */
function lemniscatePoint(theta: number, a: number, cx: number, cy: number): { x: number; y: number } {
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const denom = 1 + sinT * sinT;
  return {
    x: cx + a * cosT / denom,
    y: cy + a * sinT * cosT / denom,
  };
}

/**
 * Which "side" of the lemniscate is this theta on?
 * Returns -1 for left entity (Self), +1 for right entity (Forest)
 */
function lemniscateSide(theta: number): number {
  const cosT = Math.cos(theta);
  return cosT >= 0 ? 1 : -1;
}

// =====================================================================
// COLOR
// =====================================================================

// Symbiotic palette
const SELF_WARM: RGB = [200, 140, 70];         // Warm amber (Self)
const FOREST_COOL: RGB = [70, 160, 120];       // Cool green (Forest)
const EXCHANGE_MID: RGB = [140, 150, 95];      // Midpoint blend
const EQUIL_GLOW: RGB = [160, 200, 130];       // Equilibrium achieved

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SymbiosisAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; },
    [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    particles: [] as FlowParticle[],
    // Entity health: 0 = starved, 0.5 = balanced, 1 = overfed
    selfHealth: 0.5,
    forestHealth: 0.5,
    // Exchange bias: -1 = all to self, 0 = balanced, +1 = all to forest
    bias: 0,
    // Drag state
    isDragging: false,
    dragStartX: 0,
    dragBiasStart: 0,
    // Equilibrium haptic
    lastNearEquil: false,
    // Breath tracking
    lastBreathPeak: false,
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

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isDragging = true;
      s.dragStartX = (e.clientX - rect.left) / rect.width * w;
      s.dragBiasStart = s.bias;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isDragging) return;
      const dx = ((e.clientX - rect.left) / rect.width * w) - s.dragStartX;
      s.bias = Math.max(-1, Math.min(1, s.dragBiasStart + dx * DRAG_SENSITIVITY));
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.particles = createParticles(minDim);
      s.initialized = true;
    }

    const cx = w / 2;
    const cy = h / 2;
    const lemnA = w * LEMNI_A_FRAC;
    const entityR = minDim * ENTITY_RADIUS_FRAC;

    // Entity positions (at the foci of the lemniscate)
    const selfX = cx - lemnA * 0.5;
    const selfY = cy;
    const forestX = cx + lemnA * 0.5;
    const forestY = cy;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

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

      // ── Breath tracking ───────────────────────────────
      const breathHigh = p.breathAmplitude > 0.7;
      if (breathHigh && !s.lastBreathPeak) {
        cb.onHaptic('breath_peak');
      }
      s.lastBreathPeak = breathHigh;

      // ── Flow speed ───────────────────────────────────
      const flowSpeed = BASE_FLOW_SPEED + p.breathAmplitude * BREATH_FLOW_MULT;

      // ── Particle flow ─────────────────────────────────
      let selfFlux = 0;
      let forestFlux = 0;

      for (const particle of s.particles) {
        if (!p.reducedMotion) {
          // Bias affects flow: positive bias speeds up particles heading toward forest
          const side = lemniscateSide(particle.theta);
          const biasEffect = 1 + s.bias * side * 0.3;
          particle.theta += flowSpeed * particle.speedMult * Math.max(0.2, biasEffect);
          if (particle.theta > Math.PI * 2) particle.theta -= Math.PI * 2;
        }

        // Track flux: which entity is receiving particles
        const side = lemniscateSide(particle.theta);
        if (side < 0) selfFlux += 1;
        else forestFlux += 1;
      }

      // ── Entity health ─────────────────────────────────
      const selfRatio = selfFlux / PARTICLE_COUNT;
      const forestRatio = forestFlux / PARTICLE_COUNT;
      s.selfHealth += (selfRatio - s.selfHealth) * HEALTH_RESPONSE;
      s.forestHealth += (forestRatio - s.forestHealth) * HEALTH_RESPONSE;
      // Gently pull toward 0.5 (natural equilibrium tendency)
      s.selfHealth += (0.5 - s.selfHealth) * HEALTH_DECAY;
      s.forestHealth += (0.5 - s.forestHealth) * HEALTH_DECAY;

      // ── Equilibrium detection ─────────────────────────
      const equilDelta = Math.abs(s.selfHealth - s.forestHealth);
      const nearEquil = equilDelta < EQUIL_SNAP;
      if (nearEquil && !s.lastNearEquil) {
        cb.onHaptic('drag_snap');
      }
      s.lastNearEquil = nearEquil;

      // ── State reporting ───────────────────────────────
      // 1 = perfect equilibrium, 0 = maximum imbalance
      cb.onStateChange?.(1 - Math.min(1, equilDelta * 4));

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([6, 8, 5], s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle split atmosphere: warm left, cool right
      const leftGrad = ctx.createRadialGradient(selfX, selfY, 0, selfX, selfY, w * 0.4);
      leftGrad.addColorStop(0, rgba(lerpColor(SELF_WARM, s.primaryRgb, 0.2), 0.02 * s.selfHealth * 2 * entrance));
      leftGrad.addColorStop(1, rgba(lerpColor(SELF_WARM, s.primaryRgb, 0.2), 0));
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, w, h);

      const rightGrad = ctx.createRadialGradient(forestX, forestY, 0, forestX, forestY, w * 0.4);
      rightGrad.addColorStop(0, rgba(lerpColor(FOREST_COOL, s.accentRgb, 0.15), 0.02 * s.forestHealth * 2 * entrance));
      rightGrad.addColorStop(1, rgba(lerpColor(FOREST_COOL, s.accentRgb, 0.15), 0));
      ctx.fillStyle = rightGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Lemniscate path (ghostly guide) ───────────────
      if (!p.reducedMotion) {
        ctx.beginPath();
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2;
          const pt = lemniscatePoint(t, lemnA, cx, cy);
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(lerpColor(EXCHANGE_MID, s.primaryRgb, 0.1), 0.025 * entrance);
        ctx.lineWidth = minDim * 0.0016;
        ctx.stroke();
      }

      // ─ Particles ─────────────────────────────────────
      for (const particle of s.particles) {
        const pt = lemniscatePoint(particle.theta, lemnA, cx, cy);

        // Color: warm near Self, cool near Forest, blended at center
        const side = lemniscateSide(particle.theta);
        const sideT = (side + 1) / 2; // 0 = Self side, 1 = Forest side
        // Smooth transition: cosine-based for organic feel
        const cosBlend = Math.cos(particle.theta);
        const colorT = (cosBlend + 1) / 2; // 0 = Self, 1 = Forest

        const pColor = lerpColor(
          lerpColor(SELF_WARM, s.primaryRgb, 0.08),
          lerpColor(FOREST_COOL, s.accentRgb, 0.08),
          colorT,
        );

        const alpha = particle.brightness * 0.3 * entrance;

        // Glow
        if (particle.size > minDim * 0.003) {
          const glowR = particle.size * 2.5;
          const glowGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
          glowGrad.addColorStop(0, rgba(pColor, alpha * 0.15));
          glowGrad.addColorStop(1, rgba(pColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(pt.x - glowR, pt.y - glowR, glowR * 2, glowR * 2);
        }

        // Core
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, alpha);
        ctx.fill();
      }

      // ── Entity orbs ───────────────────────────────────
      // Self (warm, left)
      drawEntity(ctx, selfX, selfY, entityR, s.selfHealth,
        SELF_WARM, s.primaryRgb, entrance, s.frameCount, p.reducedMotion, nearEquil, minDim);

      // Forest (cool, right)
      drawEntity(ctx, forestX, forestY, entityR, s.forestHealth,
        FOREST_COOL, s.accentRgb, entrance, s.frameCount, p.reducedMotion, nearEquil, minDim);

      // ── Equilibrium glow (center, when balanced) ──────
      if (nearEquil) {
        const eqAlpha = (1 - equilDelta / EQUIL_SNAP) * 0.06 * entrance;
        const eqPulse = p.reducedMotion ? 1 : (0.85 + 0.15 * Math.sin(s.frameCount * 0.02));
        const eqColor = lerpColor(EQUIL_GLOW, s.accentRgb, 0.15);
        const eqR = minDim * 0.15;
        const eqGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, eqR);
        eqGrad.addColorStop(0, rgba(eqColor, eqAlpha * eqPulse));
        eqGrad.addColorStop(0.5, rgba(eqColor, eqAlpha * 0.3 * eqPulse));
        eqGrad.addColorStop(1, rgba(eqColor, 0));
        ctx.fillStyle = eqGrad;
        ctx.fillRect(cx - eqR, cy - eqR, eqR * 2, eqR * 2);
      }

      // ── Bias indicator (very subtle) ──────────────────
      if (Math.abs(s.bias) > 0.05) {
        const biasAlpha = Math.abs(s.bias) * 0.04 * entrance;
        const biasX = cx + s.bias * lemnA * 0.3;
        ctx.beginPath();
        ctx.arc(biasX, cy + entityR * 2.5, minDim * 0.004, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(EXCHANGE_MID, s.primaryRgb, 0.1),
          biasAlpha,
        );
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
}

// =====================================================================
// ENTITY RENDERER
// =====================================================================

function drawEntity(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  baseR: number,
  health: number,
  entityColor: RGB,
  blendColor: RGB,
  entrance: number,
  frameCount: number,
  reducedMotion: boolean,
  nearEquil: boolean,
  minDim: number,
) {
  const vibrancy = health * 2; // 0–1 where 0.5 health = 1.0 vibrancy
  const clampedV = Math.min(1, vibrancy);
  const r = baseR * (0.8 + clampedV * 0.4);

  const pulse = reducedMotion ? 0 :
    Math.sin(frameCount * 0.015 + (nearEquil ? 0 : x * 0.01)) * 0.08;
  const totalR = r * (1 + pulse);

  const eColor = lerpColor(entityColor, blendColor, 0.12);

  // Outer glow
  const glowR = totalR * 4;
  const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, glowR);
  glowGrad.addColorStop(0, rgba(eColor, clampedV * 0.1 * entrance));
  glowGrad.addColorStop(0.3, rgba(eColor, clampedV * 0.03 * entrance));
  glowGrad.addColorStop(1, rgba(eColor, 0));
  ctx.fillStyle = glowGrad;
  ctx.fillRect(x - glowR, y - glowR, glowR * 2, glowR * 2);

  // Body
  const bodyGrad = ctx.createRadialGradient(
    x - totalR * 0.15, y - totalR * 0.15, totalR * 0.1,
    x, y, totalR,
  );
  bodyGrad.addColorStop(0, rgba(lerpColor(eColor, [255, 255, 255], 0.15), clampedV * 0.35 * entrance));
  bodyGrad.addColorStop(0.5, rgba(eColor, clampedV * 0.2 * entrance));
  bodyGrad.addColorStop(1, rgba(eColor, clampedV * 0.05 * entrance));
  ctx.beginPath();
  ctx.arc(x, y, totalR, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Inner membrane
  ctx.beginPath();
  ctx.arc(x, y, totalR * 0.85, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(eColor, clampedV * 0.08 * entrance);
  ctx.lineWidth = minDim * 0.0016;
  ctx.stroke();
}