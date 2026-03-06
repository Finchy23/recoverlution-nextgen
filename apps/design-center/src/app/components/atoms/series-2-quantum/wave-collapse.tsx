/**
 * ATOM 011: THE WAVE COLLAPSE ENGINE
 * ====================================
 * Series 2 — Quantum Mechanics · Position 1
 *
 * Anxiety is a probability cloud — a million terrible things
 * that might happen. Observing forces collapse into a single,
 * manageable reality. The entire viewport is a living Gaussian
 * haze of quantum particles. Hold to observe. Breath drives
 * the rate of collapse. At full crystallisation, the single
 * truth emerges.
 *
 * PHYSICS:
 *   - 220 quantum probability particles, each a Gaussian blur sphere
 *   - Brownian drift in uncollapsed state (random walk)
 *   - Hold creates a focal observation point — collapse radiates outward
 *   - Each particle's blur radius = (1 - collapseProgress) × maxBlur
 *   - Breath amplitude DRIVES collapse rate (primary input)
 *   - At full collapse: particles lock into resonant crystal lattice
 *   - Collapse ripples outward from observation point at wave speed
 *
 * HAPTIC JOURNEY:
 *   Start   → wide, airy, diffuse static (probability)
 *   Middle  → static tightens, becomes rhythmic
 *   End     → single sharp crystalline ping
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No brownian drift, instant collapse regions
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PARTICLE_COUNT = 220;
/** Maximum blur radius as fraction of min dimension */
const MAX_BLUR_FRAC = 0.04;
/** Collapse wave speed (px/frame) */
const COLLAPSE_WAVE_SPEED = 2.5;
/** Base collapse rate per frame (modulated by breath) */
const BASE_COLLAPSE_RATE = 0.0015;
/** Breath multiplier on collapse rate */
const BREATH_COLLAPSE_MULT = 0.006;
/** Brownian motion magnitude */
const BROWNIAN_STRENGTH = 0.8;
/** Crystal lattice spacing as fraction of min dimension */
const LATTICE_SPACING = 0.035;
/** Crystallization pull strength */
const CRYSTAL_PULL = 0.015;
/** Collapse progress to start forming lattice connections */
const LATTICE_THRESHOLD = 0.85;

// =====================================================================
// PARTICLE
// =====================================================================

interface QuantumParticle {
  x: number;
  y: number;
  /** Velocity for brownian drift */
  vx: number;
  vy: number;
  /** Individual collapse progress 0–1 */
  collapse: number;
  /** Base luminosity */
  brightness: number;
  /** Size */
  size: number;
  /** Individual shimmer phase */
  shimmerPhase: number;
  /** Shimmer speed */
  shimmerSpeed: number;
  /** Crystal target position */
  crystalX: number;
  crystalY: number;
  /** Distance from collapse epicenter at time of collapse wave arrival */
  collapseDelay: number;
}

function createParticles(w: number, h: number): QuantumParticle[] {
  const particles: QuantumParticle[] = [];
  const minDim = Math.min(w, h);
  const spacing = minDim * LATTICE_SPACING;
  const cols = Math.max(1, Math.floor(w * 0.7 / spacing));
  // Compute actual rows needed for the particle count, then center
  const neededRows = Math.ceil(PARTICLE_COUNT / cols);
  const ox = (w - cols * spacing) / 2;
  const oy = (h - neededRows * spacing) / 2;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    particles.push({
      x: w * 0.1 + Math.random() * w * 0.8,
      y: h * 0.1 + Math.random() * h * 0.8,
      vx: (Math.random() - 0.5) * BROWNIAN_STRENGTH,
      vy: (Math.random() - 0.5) * BROWNIAN_STRENGTH,
      collapse: 0,
      brightness: 0.3 + Math.random() * 0.7,
      size: 1.2 + Math.random() * 2.5,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.02 + Math.random() * 0.04,
      crystalX: ox + col * spacing + spacing / 2,
      crystalY: oy + row * spacing + spacing / 2,
      collapseDelay: Infinity, // Set when collapse wave arrives
    });
  }
  return particles;
}

// =====================================================================
// COLOR
// =====================================================================

// Quantum palette
const PROBABILITY_HAZE: RGB = [90, 70, 180];   // Diffuse purple
const CRYSTALLINE: RGB = [200, 210, 255];       // Sharp ice-blue
const LATTICE_LINE: RGB = [140, 160, 220];      // Connecting blue

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function WaveCollapseAtom({
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

  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    particles: [] as QuantumParticle[],
    // Observation state
    isObserving: false,
    observeX: 0,
    observeY: 0,
    collapseWaveRadius: 0,
    globalCollapse: 0,
    holdFrames: 0,
    // Resolution
    resolved: false,
    resolveGlow: 0,
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    // Colors
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

    if (!s.initialized) {
      s.particles = createParticles(w, h);
      s.initialized = true;
    }

    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isObserving = true;
      s.holdFrames = 0;
      s.observeX = (e.clientX - rect.left) / rect.width * w;
      s.observeY = (e.clientY - rect.top) / rect.height * h;
      if (s.collapseWaveRadius === 0) {
        s.collapseWaveRadius = 1;
      }
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (s.isObserving) {
        s.observeX = (e.clientX - rect.left) / rect.width * w;
        s.observeY = (e.clientY - rect.top) / rect.height * h;
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isObserving = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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

      const maxBlur = minDim * MAX_BLUR_FRAC;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Collapse wave propagation ─────────────────────
      if (s.collapseWaveRadius > 0 && s.collapseWaveRadius < Math.max(w, h) * 1.5) {
        s.collapseWaveRadius += COLLAPSE_WAVE_SPEED;
      }

      // ── Hold tracking ─────────────────────────────────
      if (s.isObserving) {
        s.holdFrames++;
        if (s.holdFrames === 45) {
          cb.onHaptic('hold_threshold');
        }
      }

      // ── Particle physics ──────────────────────────────
      let totalCollapse = 0;

      for (const particle of s.particles) {
        // Distance from observation point
        const dx = particle.x - s.observeX;
        const dy = particle.y - s.observeY;
        const distFromObs = Math.sqrt(dx * dx + dy * dy);

        // Collapse wave: particles within the wave radius start collapsing
        if (s.collapseWaveRadius > 0 && distFromObs < s.collapseWaveRadius) {
          if (particle.collapseDelay === Infinity) {
            particle.collapseDelay = distFromObs;
          }

          // Collapse rate: breath-driven, with distance-based delay
          const waveAge = (s.collapseWaveRadius - particle.collapseDelay) / (minDim * 0.5);
          const collapseRate = Math.max(0, waveAge) *
            (BASE_COLLAPSE_RATE + p.breathAmplitude * BREATH_COLLAPSE_MULT);

          if (s.isObserving || particle.collapse > 0.1) {
            particle.collapse = Math.min(1, particle.collapse + collapseRate);
          }
        }

        // Brownian motion (scales inversely with collapse)
        if (!p.reducedMotion && particle.collapse < 0.9) {
          const brownianScale = 1 - particle.collapse;
          particle.vx += (Math.random() - 0.5) * BROWNIAN_STRENGTH * brownianScale;
          particle.vy += (Math.random() - 0.5) * BROWNIAN_STRENGTH * brownianScale;
          particle.vx *= 0.95;
          particle.vy *= 0.95;
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Soft bounds
          if (particle.x < 20) particle.vx += 0.2;
          if (particle.x > w - 20) particle.vx -= 0.2;
          if (particle.y < 20) particle.vy += 0.2;
          if (particle.y > h - 20) particle.vy -= 0.2;
        }

        // Crystal pull (when highly collapsed)
        if (particle.collapse > 0.6) {
          const pull = (particle.collapse - 0.6) * CRYSTAL_PULL;
          particle.x += (particle.crystalX - particle.x) * pull;
          particle.y += (particle.crystalY - particle.y) * pull;
          particle.vx *= 0.9;
          particle.vy *= 0.9;
        }

        totalCollapse += particle.collapse;
      }

      // ── Global collapse ───────────────────────────────
      s.globalCollapse = totalCollapse / PARTICLE_COUNT;
      cb.onStateChange?.(s.globalCollapse);

      // ── Resolution ────────────────────────────────────
      if (s.globalCollapse > 0.95 && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }
      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.008);
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([5, 4, 12], s.primaryRgb, 0.03);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(bgBase, [12, 10, 25], 0.4), entrance * 0.03));
      bgGrad.addColorStop(0.5, rgba(bgBase, entrance * 0.02));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Probability haze (fades with global collapse) ─
      if (s.globalCollapse < 0.8) {
        const hazeAlpha = (1 - s.globalCollapse * 1.2) * 0.08 * entrance;
        const hazeColor = lerpColor(PROBABILITY_HAZE, s.primaryRgb, 0.2);
        const hazeGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.5);
        hazeGrad.addColorStop(0, rgba(hazeColor, hazeAlpha));
        hazeGrad.addColorStop(0.5, rgba(hazeColor, hazeAlpha * 0.4));
        hazeGrad.addColorStop(1, rgba(hazeColor, 0));
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Collapse wave visualization ───────────────────
      if (s.collapseWaveRadius > 0 && s.collapseWaveRadius < Math.max(w, h) * 1.5) {
        const waveR = s.collapseWaveRadius;
        ctx.beginPath();
        ctx.arc(s.observeX, s.observeY, waveR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(
          lerpColor(s.accentRgb, CRYSTALLINE, 0.3),
          0.05 * (1 - waveR / (Math.max(w, h) * 1.5)) * entrance,
        );
        ctx.lineWidth = minDim * 0.002;
        ctx.stroke();
      }

      // ── Particles ─────────────────────────────────────
      for (const particle of s.particles) {
        const c = particle.collapse;
        const blurRadius = maxBlur * (1 - c);
        const shimmer = p.reducedMotion ? 1 :
          0.7 + 0.3 * Math.sin(s.frameCount * particle.shimmerSpeed + particle.shimmerPhase);

        // Color: purple haze → crystalline blue-white
        const pColor = lerpColor(
          lerpColor(PROBABILITY_HAZE, s.primaryRgb, 0.2),
          lerpColor(CRYSTALLINE, s.accentRgb, 0.15),
          c,
        );

        // Particle opacity: low when diffuse, bright when collapsed
        const baseAlpha = (0.08 + c * 0.55) * particle.brightness * shimmer * entrance;

        if (c < 0.5) {
          // Diffuse mode: large soft Gaussian blob
          const blobR = particle.size + blurRadius;
          const blobGrad = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, blobR,
          );
          blobGrad.addColorStop(0, rgba(pColor, baseAlpha));
          blobGrad.addColorStop(0.3, rgba(pColor, baseAlpha * 0.5));
          blobGrad.addColorStop(0.7, rgba(pColor, baseAlpha * 0.15));
          blobGrad.addColorStop(1, rgba(pColor, 0));
          ctx.fillStyle = blobGrad;
          ctx.fillRect(particle.x - blobR, particle.y - blobR, blobR * 2, blobR * 2);
        } else {
          // Crystallizing mode: sharp core with diminishing haze
          const hazeR = particle.size + blurRadius * 2;
          if (blurRadius > 0.5) {
            const hazeGrad = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, hazeR,
            );
            hazeGrad.addColorStop(0, rgba(pColor, baseAlpha * 0.2));
            hazeGrad.addColorStop(1, rgba(pColor, 0));
            ctx.fillStyle = hazeGrad;
            ctx.fillRect(particle.x - hazeR, particle.y - hazeR, hazeR * 2, hazeR * 2);
          }

          // Sharp core
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * (0.5 + c * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = rgba(pColor, baseAlpha);
          ctx.fill();

          // Specular highlight when highly collapsed
          if (c > 0.8) {
            ctx.beginPath();
            ctx.arc(particle.x - particle.size * 0.15, particle.y - particle.size * 0.15,
              particle.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = rgba([255, 255, 255], (c - 0.8) * 0.5 * baseAlpha);
            ctx.fill();
          }
        }
      }

      // ── Crystal lattice connections ────────────────────
      if (s.globalCollapse > LATTICE_THRESHOLD) {
        const connAlpha = (s.globalCollapse - LATTICE_THRESHOLD) / (1 - LATTICE_THRESHOLD) * 0.08 * entrance;
        const lineColor = lerpColor(LATTICE_LINE, s.primaryRgb, 0.15);
        const nearDist = minDim * LATTICE_SPACING * 1.6;

        ctx.lineWidth = minDim * 0.002;
        ctx.strokeStyle = rgba(lineColor, connAlpha);

        for (let i = 0; i < s.particles.length; i++) {
          const a = s.particles[i];
          if (a.collapse < 0.8) continue;

          // Connect to up to 4 nearest collapsed neighbors
          let connections = 0;
          for (let j = i + 1; j < s.particles.length && connections < 4; j++) {
            const b = s.particles[j];
            if (b.collapse < 0.8) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearDist) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
              connections++;
            }
          }
        }
      }

      // ── Observation focal point ───────────────────────
      if (s.isObserving) {
        const focusR = 8 + p.breathAmplitude * 4;
        const focusGrad = ctx.createRadialGradient(
          s.observeX, s.observeY, 0,
          s.observeX, s.observeY, focusR * 4,
        );
        focusGrad.addColorStop(0, rgba(s.accentRgb, 0.2 * entrance));
        focusGrad.addColorStop(0.3, rgba(s.accentRgb, 0.06 * entrance));
        focusGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = focusGrad;
        ctx.fillRect(
          s.observeX - focusR * 4, s.observeY - focusR * 4,
          focusR * 8, focusR * 8,
        );

        // Tiny core dot
        ctx.beginPath();
        ctx.arc(s.observeX, s.observeY, minDim * 0.004, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(CRYSTALLINE, s.accentRgb, 0.2), 0.4 * entrance);
        ctx.fill();
      }

      // ── Resolution glow ───────────────────────────────
      if (s.resolveGlow > 0) {
        const glowR = minDim * 0.4;
        const pulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.02));
        const rGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowR);
        rGrad.addColorStop(0, rgba(lerpColor(CRYSTALLINE, s.accentRgb, 0.15), s.resolveGlow * 0.08 * pulse * entrance));
        rGrad.addColorStop(0.5, rgba(s.accentRgb, s.resolveGlow * 0.03 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad;
        ctx.fillRect(w / 2 - glowR, h / 2 - glowR, glowR * 2, glowR * 2);
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
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}