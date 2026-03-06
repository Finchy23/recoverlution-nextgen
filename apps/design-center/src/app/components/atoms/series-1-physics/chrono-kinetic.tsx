/**
 * ATOM 001: THE CHRONO-KINETIC ENGINE
 * ====================================
 * Series 1 — Physics Engines · Position 1
 *
 * Anxiety accelerates time; depression freezes it.
 * This atom gives the user physical control over the
 * perception of time through rotational friction,
 * heavy digital flywheels, and velocity-mapped visuals.
 *
 * PHYSICS:
 *   - Concentric rings rotating at layered velocities
 *   - Particle streams flowing along ring paths
 *   - Inertia-based flywheel with friction decay
 *   - Haptic detents at 30° intervals (clock positions)
 *   - Hold-to-sustain patience muscle mechanic
 *   - Breath modulates ring width and core glow
 *
 * INTERACTION:
 *   Drag (rotational) → controls angular velocity
 *   Hold (sustained)  → slowly builds momentum
 *   Breath (passive)  → pulses ring widths and glow
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static rings, no rotation, opacity transitions only
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS — the engine's character
// =====================================================================

/** Velocity decay per frame — high = heavy, low = frictionless */
const FRICTION = 0.988;
/** Maximum angular velocity (radians/frame) */
const MAX_VELOCITY = 0.12;
/** Minimum velocity below which we clamp to zero */
const VELOCITY_EPSILON = 0.0001;
/** Number of haptic detent positions around the dial */
const DETENT_COUNT = 12;
/** Radians per detent */
const DETENT_STEP = (Math.PI * 2) / DETENT_COUNT;
/** Velocity gain per frame while holding (patience muscle) */
const HOLD_ACCELERATION = 0.00015;
/** Frames of stillness before hold mode activates */
const HOLD_THRESHOLD_FRAMES = 30; // ~500ms at 60fps
/** Drag sensitivity — maps pointer angular delta to velocity */
const DRAG_SENSITIVITY = 0.4;
/** Movement threshold (px) to distinguish drag from hold */
const DRAG_THRESHOLD = 4;

// =====================================================================
// RING DEFINITIONS — the concentric mechanism
// =====================================================================
// Each ring is a layer of the temporal mechanism.
// Outer rings are cosmic scale (fast, ethereal).
// Inner rings are human scale (slow, grounded).

interface RingDef {
  /** Radius as fraction of min(width, height) / 2 */
  radiusRatio: number;
  /** Stroke width as fraction of minDim */
  widthFrac: number;
  /** Base opacity */
  opacity: number;
  /** Velocity multiplier relative to master velocity */
  velocityMult: number;
  /** Number of tick marks on this ring */
  tickCount: number;
  /** Tick length as fraction of ring radius */
  tickLength: number;
  /** Breath coupling strength (0–1) */
  breathResponse: number;
}

const RINGS: readonly RingDef[] = [
  { radiusRatio: 0.88, widthFrac: 0.0008, opacity: 0.06,  velocityMult: 1.6,  tickCount: 120, tickLength: 0.015, breathResponse: 0.02 },
  { radiusRatio: 0.78, widthFrac: 0.0012, opacity: 0.08,  velocityMult: 1.2,  tickCount: 60,  tickLength: 0.02,  breathResponse: 0.03 },
  { radiusRatio: 0.65, widthFrac: 0.0016, opacity: 0.12,  velocityMult: 0.85, tickCount: 24,  tickLength: 0.03,  breathResponse: 0.04 },
  { radiusRatio: 0.50, widthFrac: 0.0024, opacity: 0.18,  velocityMult: 0.55, tickCount: 12,  tickLength: 0.04,  breathResponse: 0.06 },
  { radiusRatio: 0.35, widthFrac: 0.0036, opacity: 0.25,  velocityMult: 0.30, tickCount: 8,   tickLength: 0.05,  breathResponse: 0.08 },
  { radiusRatio: 0.20, widthFrac: 0.005,  opacity: 0.35,  velocityMult: 0.12, tickCount: 4,   tickLength: 0.06,  breathResponse: 0.10 },
  { radiusRatio: 0.08, widthFrac: 0.007,  opacity: 0.50,  velocityMult: 0.03, tickCount: 0,   tickLength: 0,     breathResponse: 0.15 },
] as const;

/** Number of orbital particles */
const PARTICLE_COUNT = 60;

// =====================================================================
// PARTICLE SYSTEM
// =====================================================================

interface Particle {
  ring: number;       // which ring index
  angle: number;      // position on ring (radians)
  sizeFrac: number;   // base radius as fraction of minDim
  brightness: number; // base opacity multiplier
  phase: number;      // individual phase offset for shimmer
}

function createParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      ring: Math.floor(Math.random() * (RINGS.length - 1)), // not on core ring
      angle: Math.random() * Math.PI * 2,
      sizeFrac: 0.001 + Math.random() * 0.003,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ChronoKineticAtom({
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable refs for callbacks and props that change frequently
  // — prevents the render loop from restarting on every parent render
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange };
  }, [onHaptic, onStateChange]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    velocity: 0,
    angle: 0,
    ringAngles: RINGS.map(() => Math.random() * Math.PI * 2),
    particles: createParticles(),
    isDragging: false,
    isHolding: false,
    holdFrames: 0,
    lastPointerAngle: 0,
    pointerStartX: 0,
    pointerStartY: 0,
    hasMoved: false,
    lastDetentIndex: 0,
    entranceProgress: 0,
    frameCount: 0,
    // Color caches (updated when props change)
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
  });

  // Update cached colors when props change
  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const w = viewport.width;
      const h = viewport.height;

      // Resize canvas if needed
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) / 2;
      const breath = p.breathAmplitude;
      s.frameCount++;

      // ── Entrance animation ──────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Hold detection ──────────────────────────────────
      if (s.isDragging && !s.hasMoved) {
        s.holdFrames++;
        if (!s.isHolding && s.holdFrames > HOLD_THRESHOLD_FRAMES) {
          s.isHolding = true;
          cb.onHaptic('hold_threshold');
        }
      }

      // ── Physics step ───────────────────────────────────
      if (!p.reducedMotion) {
        // Hold builds momentum (patience muscle)
        if (s.isHolding) {
          const direction = s.velocity >= 0 ? 1 : -1;
          const holdDir = s.velocity === 0 ? 1 : direction;
          s.velocity += HOLD_ACCELERATION * holdDir;
          s.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, s.velocity));
        }

        // Friction
        if (!s.isDragging || !s.hasMoved) {
          s.velocity *= FRICTION;
        }

        // Epsilon clamp
        if (Math.abs(s.velocity) < VELOCITY_EPSILON) {
          s.velocity = 0;
        }

        // Advance ring angles
        for (let i = 0; i < RINGS.length; i++) {
          s.ringAngles[i] += s.velocity * RINGS[i].velocityMult;
        }
        s.angle += s.velocity;

        // Haptic detents
        const detentIndex = Math.floor(((s.angle % (Math.PI * 2)) + Math.PI * 2) / DETENT_STEP) % DETENT_COUNT;
        if (detentIndex !== s.lastDetentIndex && Math.abs(s.velocity) > 0.003) {
          cb.onHaptic('drag_snap');
          s.lastDetentIndex = detentIndex;
        }
      }

      // ── State reporting ─────────────────────────────────
      const normalizedVelocity = Math.min(1, Math.abs(s.velocity) / MAX_VELOCITY);
      cb.onStateChange?.(normalizedVelocity);

      // ── Color computation ───────────────────────────────
      const activeColor = lerpColor(s.primaryRgb, s.accentRgb, normalizedVelocity * 0.6);

      // ── Layer 1: Core glow ──────────────────────────────
      const glowRadius = maxR * (0.25 + breath * 0.05) * entrance;
      const glowAlpha = (0.08 + breath * 0.04 + normalizedVelocity * 0.06) * entrance;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      coreGrad.addColorStop(0, rgba(activeColor, glowAlpha));
      coreGrad.addColorStop(0.5, rgba(activeColor, glowAlpha * 0.4));
      coreGrad.addColorStop(1, rgba(activeColor, 0));
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Layer 2: Rings ──────────────────────────────────
      for (let i = 0; i < RINGS.length; i++) {
        const ring = RINGS[i];
        const ringEntrance = easeOutExpo(Math.max(0, Math.min(1, (entrance - (RINGS.length - 1 - i) * 0.08) / 0.5)));
        if (ringEntrance <= 0) continue;

        const breathOffset = breath * ring.breathResponse * maxR;
        const r = maxR * ring.radiusRatio + breathOffset;
        const baseAngle = p.reducedMotion ? 0 : s.ringAngles[i];
        const ringAlpha = ring.opacity * ringEntrance;

        // Ring arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(activeColor, ringAlpha);
        ctx.lineWidth = ring.widthFrac * maxR;
        ctx.stroke();

        // Tick marks
        if (ring.tickCount > 0) {
          const tickStep = (Math.PI * 2) / ring.tickCount;
          const tickLen = maxR * ring.tickLength;
          // At high velocity, ticks become shorter and more transparent
          const tickFade = Math.max(0.15, 1 - normalizedVelocity * 0.7);
          const tickScale = Math.max(0.3, 1 - normalizedVelocity * 0.5);

          for (let t = 0; t < ring.tickCount; t++) {
            const tickAngle = baseAngle + t * tickStep;
            const cos = Math.cos(tickAngle);
            const sin = Math.sin(tickAngle);
            const innerR = r - tickLen * tickScale;
            const outerR = r + tickLen * tickScale;

            ctx.beginPath();
            ctx.moveTo(cx + cos * innerR, cy + sin * innerR);
            ctx.lineTo(cx + cos * outerR, cy + sin * outerR);
            ctx.strokeStyle = rgba(activeColor, ringAlpha * tickFade * 0.6);
            ctx.lineWidth = ring.widthFrac * maxR * 0.4;
            ctx.stroke();
          }
        }
      }

      // ── Layer 3: Particles ──────────────────────────────
      if (!p.reducedMotion) {
        const trailMult = Math.min(1, normalizedVelocity * 3);

        for (const particle of s.particles) {
          const ring = RINGS[particle.ring];
          if (!ring) continue;

          const ringEntrance = easeOutExpo(Math.max(0, Math.min(1, (entrance - (RINGS.length - 1 - particle.ring) * 0.08) / 0.5)));
          if (ringEntrance <= 0) continue;

          // Advance particle along its ring
          particle.angle += s.velocity * ring.velocityMult;

          const breathOffset = breath * ring.breathResponse * maxR;
          const r = maxR * ring.radiusRatio + breathOffset;

          // Shimmer
          const shimmer = 0.7 + 0.3 * Math.sin(s.frameCount * 0.03 + particle.phase);

          // At low velocity: bright, crystallized dots
          // At high velocity: elongated, dim trails
          const particleAlpha = particle.brightness * shimmer * ringEntrance *
            (0.15 + (1 - normalizedVelocity) * 0.25);

          const px = cx + Math.cos(particle.angle) * r;
          const py = cy + Math.sin(particle.angle) * r;

          const pSize = particle.sizeFrac * maxR * 2;

          // Trail (only at speed)
          if (trailMult > 0.05) {
            const trailSteps = Math.floor(4 + trailMult * 8);
            const trailAngleStep = s.velocity * ring.velocityMult * 1.5;

            for (let t = trailSteps; t > 0; t--) {
              const trailAngle = particle.angle - trailAngleStep * t;
              const tx = cx + Math.cos(trailAngle) * r;
              const ty = cy + Math.sin(trailAngle) * r;
              const trailAlpha = particleAlpha * trailMult * (1 - t / trailSteps) * 0.4;

              ctx.beginPath();
              ctx.arc(tx, ty, pSize * 0.6, 0, Math.PI * 2);
              ctx.fillStyle = rgba(activeColor, trailAlpha);
              ctx.fill();
            }
          }

          // Main particle
          ctx.beginPath();
          ctx.arc(px, py, pSize * (1 + breath * 0.2), 0, Math.PI * 2);
          ctx.fillStyle = rgba(activeColor, particleAlpha);
          ctx.fill();

          // Glow halo on bright particles
          if (particle.brightness > 0.7 && normalizedVelocity < 0.5) {
            ctx.beginPath();
            ctx.arc(px, py, pSize * 3, 0, Math.PI * 2);
            ctx.fillStyle = rgba(activeColor, particleAlpha * 0.15);
            ctx.fill();
          }
        }
      }

      // ── Layer 4: Center point ───────────────────────────
      const minDim = Math.min(w, h);
      const centerSize = minDim * (0.004 + breath * 0.002) * entrance;
      const centerAlpha = (0.4 + breath * 0.2 + normalizedVelocity * 0.2) * entrance;

      ctx.beginPath();
      ctx.arc(cx, cy, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = rgba(activeColor, centerAlpha);
      ctx.fill();

      // Center glow
      ctx.beginPath();
      ctx.arc(cx, cy, centerSize * 4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(activeColor, centerAlpha * 0.15);
      ctx.fill();

      // ── Resolve phase: decelerate to stillness ──────────
      if (p.phase === 'resolve') {
        s.velocity *= 0.95; // faster decay than normal friction
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ─────────────────────────
    const getPointerAngle = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = clientX - rect.left - cx;
      const dy = clientY - rect.top - cy;
      return Math.atan2(dy, dx);
    };
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = true;
      s.isHolding = false;
      s.holdFrames = 0;
      s.hasMoved = false;
      s.lastPointerAngle = getPointerAngle(e.clientX, e.clientY);
      s.pointerStartX = e.clientX;
      s.pointerStartY = e.clientY;
      callbacksRef.current.onHaptic('tap');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const dx = e.clientX - s.pointerStartX;
      const dy = e.clientY - s.pointerStartY;
      if (!s.hasMoved && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        s.hasMoved = true;
        s.isHolding = false;
        s.holdFrames = 0;
      }
      if (s.hasMoved) {
        const newAngle = getPointerAngle(e.clientX, e.clientY);
        let delta = newAngle - s.lastPointerAngle;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        s.velocity += delta * DRAG_SENSITIVITY;
        s.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, s.velocity));
        s.lastPointerAngle = newAngle;
      }
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = false;
      s.isHolding = false;
      s.holdFrames = 0;
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
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
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