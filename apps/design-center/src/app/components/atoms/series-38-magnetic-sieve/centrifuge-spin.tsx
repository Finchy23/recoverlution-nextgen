/**
 * ATOM 373: THE CENTRIFUGE SPIN ENGINE
 * ======================================
 * Series 38 — Magnetic Sieve · Position 3
 *
 * Cure emotional enmeshment with facts. Spin rapidly to pin
 * emotional noise to the outer edges, leaving clear calm fact
 * at the dead center.
 *
 * PHYSICS:
 *   - Swirling chaotic particle pool fills viewport
 *   - Rapid continuous circular finger motion spins the centrifuge
 *   - Centrifugal force separates particles by density
 *   - Heavy emotional-noise particles pin to extreme outer ring
 *   - Light fact-particles collect in pristine center zone
 *   - Center clarity zone grows with spin speed
 *   - Breath modulates the calm glow of the center zone
 *
 * INTERACTION:
 *   Circular drag → spins centrifuge, separates particles
 *   Stop          → particles slowly drift back together
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static view with particles pre-separated
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total particle count in the liquid pool */
const PARTICLE_COUNT = 60;
/** Noise (heavy) particles — pin to outside */
const NOISE_COUNT = 48;
/** Fact (light) particles — collect at center */
const FACT_COUNT = PARTICLE_COUNT - NOISE_COUNT;
/** Centrifuge max angular velocity (rad/frame) */
const MAX_SPIN_SPEED = 0.12;
/** Spin speed increase per angular drag unit */
const SPIN_ACCEL = 0.0008;
/** Spin friction decay */
const SPIN_FRICTION = 0.985;
/** How fast noise particles are pushed outward */
const CENTRIFUGAL_FORCE = 0.0015;
/** How fast fact particles are pulled inward */
const CENTRIPETAL_PULL = 0.002;
/** Noise particle radius range */
const NOISE_R_MIN = 0.006;
const NOISE_R_MAX = 0.014;
/** Fact particle radius */
const FACT_R_FRAC = 0.010;
/** Center clarity zone max radius */
const CLARITY_ZONE_R = 0.25;
/** Outer noise ring radius */
const NOISE_RING_R = 0.38;
/** Completion spin threshold (fraction of max) */
const COMPLETION_THRESHOLD = 0.7;
/** Frames at threshold for completion */
const COMPLETION_FRAMES = 120;
/** Breath glow coupling on clarity zone */
const BREATH_CLARITY_FACTOR = 0.12;
/** Particle return speed when not spinning */
const RETURN_DRIFT = 0.0003;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Particle {
  angle: number;     // radial position in the centrifuge
  dist: number;      // distance from center (fraction of minDim)
  targetDist: number; // where centrifuge wants to push/pull it
  radius: number;    // visual radius
  isNoise: boolean;
  driftSpeed: number; // unique drift rate
  phase: number;     // unique animation phase offset
}

// =====================================================================
// HELPERS
// =====================================================================

function createParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const isNoise = i < NOISE_COUNT;
    particles.push({
      angle: Math.random() * Math.PI * 2,
      dist: 0.05 + Math.random() * 0.3,
      targetDist: 0.05 + Math.random() * 0.3,
      radius: isNoise
        ? NOISE_R_MIN + Math.random() * (NOISE_R_MAX - NOISE_R_MIN)
        : FACT_R_FRAC,
      isNoise,
      driftSpeed: 0.0005 + Math.random() * 0.001,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function CentrifugeSpinAtom({
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
    particles: createParticles(),
    spinSpeed: 0,            // current angular velocity
    spinAngle: 0,            // accumulated rotation
    clarityProgress: 0,      // how separated the particles are 0→1
    completionFrames: 0,     // frames above threshold
    completed: false,
    completionAnim: 0,
    // Circular drag tracking
    pointerDown: false,
    lastAngle: 0,
    angularDelta: 0,
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
      if (p.phase === 'resolve') {
        s.spinSpeed = Math.max(s.spinSpeed, MAX_SPIN_SPEED * 0.8);
      }

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Draw pre-separated state
        const clarR = px(CLARITY_ZONE_R, minDim);
        const noiseR = px(NOISE_RING_R, minDim);

        // Clarity zone glow
        const clGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, clarR);
        clGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        clGlow.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance));
        clGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = clGlow;
        ctx.fillRect(cx - clarR, cy - clarR, clarR * 2, clarR * 2);

        // Clarity zone ring
        ctx.beginPath();
        ctx.arc(cx, cy, clarR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // Fact particles at center
        for (let i = 0; i < FACT_COUNT; i++) {
          const a = (i / FACT_COUNT) * Math.PI * 2;
          const d = clarR * 0.4;
          const ppx = cx + Math.cos(a) * d;
          const ppy = cy + Math.sin(a) * d;
          ctx.beginPath();
          ctx.arc(ppx, ppy, px(FACT_R_FRAC, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
          ctx.fill();
        }

        // Noise particles pinned at outer ring
        for (let i = 0; i < NOISE_COUNT; i++) {
          const a = (i / NOISE_COUNT) * Math.PI * 2;
          const d = noiseR + (i % 3) * px(0.02, minDim);
          const ppx = cx + Math.cos(a) * d;
          const ppy = cy + Math.sin(a) * d;
          const nR = px(NOISE_R_MIN + (i % 4) * 0.002, minDim);
          ctx.beginPath();
          ctx.arc(ppx, ppy, nR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * entrance);
          ctx.fill();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Spin physics ────────────────────────────────
      s.spinSpeed *= SPIN_FRICTION;
      s.spinAngle += s.spinSpeed * ms;
      const spinFraction = Math.abs(s.spinSpeed) / MAX_SPIN_SPEED;

      // ── Particle physics ────────────────────────────
      for (const pt of s.particles) {
        // Rotate particles with the centrifuge
        pt.angle += s.spinSpeed * 0.3 * ms;

        if (spinFraction > 0.05) {
          // Centrifuge active — separate by type
          if (pt.isNoise) {
            pt.targetDist = NOISE_RING_R + (Math.random() - 0.5) * 0.03;
          } else {
            pt.targetDist = 0.02 + Math.random() * 0.08;
          }
        } else {
          // No spin — drift back to mixed state
          pt.targetDist = 0.05 + Math.sin(s.frameCount * 0.005 + pt.phase) * 0.02
            + pt.phase * 0.04;
        }

        // Lerp distance toward target
        const force = pt.isNoise ? CENTRIFUGAL_FORCE : CENTRIPETAL_PULL;
        pt.dist += (pt.targetDist - pt.dist) * force * spinFraction * ms * 60;

        // Gentle drift when idle
        if (spinFraction < 0.05) {
          pt.dist += (pt.targetDist - pt.dist) * RETURN_DRIFT * ms * 60;
        }

        // Lazy orbital drift
        pt.angle += pt.driftSpeed * ms;
      }

      // ── Clarity progress ────────────────────────────
      s.clarityProgress = easeOutCubic(Math.min(1, spinFraction / COMPLETION_THRESHOLD));

      // ── Completion detection ────────────────────────
      if (spinFraction >= COMPLETION_THRESHOLD) {
        s.completionFrames++;
        if (s.completionFrames >= COMPLETION_FRAMES && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      } else {
        s.completionFrames = Math.max(0, s.completionFrames - 2);
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : s.clarityProgress * 0.5);

      // ── Draw outer noise ring ───────────────────────
      if (s.clarityProgress > 0.1) {
        const outerR = px(NOISE_RING_R, minDim);
        const ringAlpha = ALPHA.atmosphere.max * s.clarityProgress * 0.4 * entrance;

        // Noise ring glow
        const noiseGlow = ctx.createRadialGradient(cx, cy, outerR * 0.85, cx, cy, outerR * 1.15);
        noiseGlow.addColorStop(0, rgba(s.accentRgb, 0));
        noiseGlow.addColorStop(0.5, rgba(s.accentRgb, ringAlpha));
        noiseGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = noiseGlow;
        const extent = outerR * 1.2;
        ctx.fillRect(cx - extent, cy - extent, extent * 2, extent * 2);
      }

      // ── Draw noise particles ────────────────────────
      for (const pt of s.particles) {
        if (!pt.isNoise) continue;
        const d = px(pt.dist, minDim);
        const ppx = cx + Math.cos(pt.angle) * d;
        const ppy = cy + Math.sin(pt.angle) * d;
        const pR = px(pt.radius, minDim);

        // Subtle glow on each noise particle
        if (spinFraction > 0.2) {
          const gR = pR * 2.5;
          const g = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, gR);
          g.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.15 * entrance));
          g.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = g;
          ctx.fillRect(ppx - gR, ppy - gR, gR * 2, gR * 2);
        }

        ctx.beginPath();
        ctx.arc(ppx, ppy, pR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.fill();
      }

      // ── Draw clarity zone ───────────────────────────
      const clarR = px(CLARITY_ZONE_R * s.clarityProgress, minDim);
      if (clarR > 2) {
        const breathMod = 1 + breath * BREATH_CLARITY_FACTOR;

        // Clarity glow
        const clGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, clarR * breathMod);
        clGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.35 * s.clarityProgress * entrance));
        clGlow.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * s.clarityProgress * entrance));
        clGlow.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.atmosphere.min * s.clarityProgress * entrance));
        clGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = clGlow;
        const glowExtent = clarR * breathMod;
        ctx.fillRect(cx - glowExtent, cy - glowExtent, glowExtent * 2, glowExtent * 2);

        // Clarity boundary ring
        ctx.beginPath();
        ctx.arc(cx, cy, clarR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * s.clarityProgress * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── Draw fact particles ─────────────────────────
      for (const pt of s.particles) {
        if (pt.isNoise) continue;
        const d = px(pt.dist, minDim);
        const ppx = cx + Math.cos(pt.angle) * d;
        const ppy = cy + Math.sin(pt.angle) * d;
        const fR = px(pt.radius, minDim) * (1 + breath * 0.05);

        // Fact particle glow
        const fGlowR = fR * 4;
        const fg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, fGlowR);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.clarityProgress * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(ppx - fGlowR, ppy - fGlowR, fGlowR * 2, fGlowR * 2);

        // Fact body
        ctx.beginPath();
        ctx.arc(ppx, ppy, fR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.45 * entrance);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(ppx, ppy, fR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
          ALPHA.content.max * 0.25 * entrance,
        );
        ctx.fill();
      }

      // ── Spin speed indicator ────────────────────────
      if (spinFraction > 0.02 && !s.completed) {
        // Subtle rotating dashes around the center
        const indicR = px(CLARITY_ZONE_R * 0.6, minDim);
        const dashCount = 8;
        for (let i = 0; i < dashCount; i++) {
          const a = s.spinAngle + (i / dashCount) * Math.PI * 2;
          const x1 = cx + Math.cos(a) * (indicR - px(0.01, minDim));
          const y1 = cy + Math.sin(a) * (indicR - px(0.01, minDim));
          const x2 = cx + Math.cos(a) * (indicR + px(0.01, minDim));
          const y2 = cy + Math.sin(a) * (indicR + px(0.01, minDim));
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * spinFraction * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers (circular drag) ───────
    const getAngle = (e: PointerEvent): number => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      return Math.atan2(my, mx);
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointerDown = true;
      s.lastAngle = getAngle(e);
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerDown) return;

      const angle = getAngle(e);
      let delta = angle - s.lastAngle;

      // Handle wrap-around
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      s.spinSpeed += delta * SPIN_ACCEL * 60;
      s.spinSpeed = Math.max(-MAX_SPIN_SPEED, Math.min(MAX_SPIN_SPEED, s.spinSpeed));
      s.lastAngle = angle;

      if (Math.abs(delta) > 0.02) {
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pointerDown = false;
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
