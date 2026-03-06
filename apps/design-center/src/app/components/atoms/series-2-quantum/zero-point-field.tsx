/**
 * ATOM 018: THE ZERO-POINT FIELD ENGINE
 * =======================================
 * Series 2 — Quantum Mechanics · Position 8
 *
 * The void is not dead — it is teeming with latent, infinite
 * energy waiting for an architect. The screen appears completely
 * empty. OLED blackness. Nothing.
 *
 * But beneath the surface: a dense, hyper-energetic hexagonal
 * lattice of quantum vacuum fluctuations — ~600 particles
 * vibrating at high frequency, all at opacity 0.
 *
 * When the user presses (holds) on the glass, the hidden grid
 * erupts beneath their finger. Sustained hold widens the
 * revelation radius. Multiple fingers reveal multiple zones.
 * Release → the grid fades back to invisible. The emptiness
 * was always full.
 *
 * PHYSICS:
 *   - 600+ particle hexagonal lattice at opacity 0
 *   - Touch point = revelation epicenter
 *   - Hold duration → revelation radius expansion
 *   - Each particle vibrates with quantum energy (micro-oscillation)
 *   - Gaussian falloff at revelation edge
 *   - Multiple simultaneous touch points supported
 *   - Release: slow fade back to invisible
 *
 * HAPTIC JOURNEY:
 *   Touch   → hold_start (silence breaks)
 *   Hold 2s → hold_threshold (grid fully erupts)
 *   Expand  → step_advance at each radius milestone
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No vibration, static reveal
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS (all viewport-relative via minDim * factor)
// =====================================================================

/** Hexagonal grid cell size as fraction of minDim */
const CELL_SIZE_FRAC = 0.032;
/** Maximum reveal radius as fraction of min dimension */
const MAX_REVEAL_FRAC = 0.4;
/** Reveal growth rate per frame (fraction of max) */
const REVEAL_GROWTH_RATE = 0.014;
/** Reveal decay rate per frame when not touching */
const REVEAL_DECAY_RATE = 0.006;
/** Vibration amplitude as fraction of minDim */
const VIBRATION_AMP_FRAC = 0.004;
/** Vibration frequency */
const VIBRATION_FREQ = 0.12;
/** Hold threshold in frames (~2s) */
const HOLD_THRESHOLD_FRAMES = 120;
/** Reveal milestones for step_advance (fraction of max) */
const STEP_MILESTONES = [0.15, 0.35, 0.55, 0.75, 0.95];

// =====================================================================
// GRID PARTICLE
// =====================================================================

interface VacuumParticle {
  homeX: number;
  homeY: number;
  /** Vibration phase offset */
  phase: number;
  /** Vibration angle (direction of oscillation) */
  vibAngle: number;
  /** Individual brightness */
  brightness: number;
  /** Size as fraction of minDim */
  sizeFrac: number;
  /** Energy level (affects vibration speed) */
  energy: number;
}

function createGrid(w: number, h: number, cellSize: number): VacuumParticle[] {
  const particles: VacuumParticle[] = [];
  const rowH = cellSize * 0.866;
  const rows = Math.ceil(h / rowH) + 2;
  const cols = Math.ceil(w / cellSize) + 2;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const offset = r % 2 === 0 ? 0 : cellSize * 0.5;
    for (let c = 0; c < cols; c++) {
      const x = c * cellSize + offset;
      particles.push({
        homeX: x,
        homeY: y,
        phase: Math.random() * Math.PI * 2,
        vibAngle: Math.random() * Math.PI * 2,
        brightness: 0.4 + Math.random() * 0.6,
        sizeFrac: 0.0015 + Math.random() * 0.003,
        energy: 0.5 + Math.random() * 0.5,
      });
    }
  }
  return particles;
}

// =====================================================================
// TOUCH POINT
// =====================================================================

interface RevealPoint {
  x: number;
  y: number;
  /** Current reveal radius (0–1 fraction of max) */
  radius: number;
  /** Whether this point is actively held */
  active: boolean;
  /** Frames held */
  holdFrames: number;
  /** Pointer ID */
  pointerId: number;
}

// =====================================================================
// COLOR
// =====================================================================

const GRID_CORE: RGB = [180, 160, 255];
const GRID_ENERGY: RGB = [120, 100, 220];
const REVEAL_GLOW: RGB = [160, 140, 240];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ZeroPointFieldAtom({
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

  // ── Single effect: native events + rAF loop ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);
    const maxRevealR = minDim * MAX_REVEAL_FRAC;
    const cellSize = minDim * CELL_SIZE_FRAC;
    const vibAmp = minDim * VIBRATION_AMP_FRAC;

    // ── Mutable state ──────────────────────────────────
    const s = {
      grid: createGrid(w, h, cellSize),
      revealPoints: [] as RevealPoint[],
      maxRevealed: 0,
      lastStep: -1,
      entranceProgress: 0,
      frameCount: 0,
      primaryRgb: parseColor(color),
      accentRgb: parseColor(accentColor),
    };

    // ── Helper: normalised coords from pointer event ───
    const getPos = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [
        (e.clientX - rect.left) / rect.width * w,
        (e.clientY - rect.top) / rect.height * h,
      ];
    };

    // ── Native pointer handlers (multi-touch) ──────────
    const onDown = (e: PointerEvent) => {
      const [px, py] = getPos(e);
      s.revealPoints.push({
        x: px, y: py,
        radius: 0.08,  // Immediate seed radius so grid appears instantly
        active: true,
        holdFrames: 0,
        pointerId: e.pointerId,
      });
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const [px, py] = getPos(e);
      const point = s.revealPoints.find(p => p.pointerId === e.pointerId);
      if (point && point.active) {
        point.x = px;
        point.y = py;
      }
    };

    const onUp = (e: PointerEvent) => {
      const point = s.revealPoints.find(p => p.pointerId === e.pointerId);
      if (point) {
        point.active = false;
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // ── Animation loop ─────────────────────────────────
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      s.primaryRgb = parseColor(p.color);
      s.accentRgb = parseColor(p.accentColor);

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Background — THE VOID ─────────────────────────
      const bgBase = lerpColor([0, 0, 0], s.primaryRgb, 0.008);
      ctx.clearRect(0, 0, w, h);
      // No full-rect fill — void stays transparent (glass-floating)

      // ── Update reveal points ──────────────────────────
      let currentMaxReveal = 0;

      for (let i = s.revealPoints.length - 1; i >= 0; i--) {
        const rp = s.revealPoints[i];
        if (rp.active) {
          rp.holdFrames++;
          rp.radius = Math.min(1, rp.radius + REVEAL_GROWTH_RATE);

          if (rp.holdFrames === HOLD_THRESHOLD_FRAMES) {
            cb.onHaptic('hold_threshold');
          }
        } else {
          rp.radius = Math.max(0, rp.radius - REVEAL_DECAY_RATE);
          if (rp.radius <= 0) {
            s.revealPoints.splice(i, 1);
            continue;
          }
        }
        currentMaxReveal = Math.max(currentMaxReveal, rp.radius);
      }

      // Step advance
      if (currentMaxReveal > s.maxRevealed) {
        s.maxRevealed = currentMaxReveal;
      }
      for (let si = 0; si < STEP_MILESTONES.length; si++) {
        if (currentMaxReveal >= STEP_MILESTONES[si] && si > s.lastStep) {
          s.lastStep = si;
          cb.onHaptic('step_advance');
        }
      }
      if (currentMaxReveal < 0.05 && s.lastStep >= 0) {
        s.lastStep = -1;
        s.maxRevealed = 0;
      }

      // ── State reporting ───────────────────────────────
      cb.onStateChange?.(currentMaxReveal);

      // ── Render grid particles ─────────────────────────
      if (s.revealPoints.length > 0) {
        for (const particle of s.grid) {
          let maxInfluence = 0;

          for (const rp of s.revealPoints) {
            const dx = particle.homeX - rp.x;
            const dy = particle.homeY - rp.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const revealR = rp.radius * maxRevealR;
            if (dist < revealR) {
              const normalised = dist / revealR;
              const influence = Math.exp(-normalised * normalised * 3);
              maxInfluence = Math.max(maxInfluence, influence * rp.radius);
            }
          }

          if (maxInfluence < 0.005) continue;

          // Vibration
          let vx = 0;
          let vy = 0;
          if (!p.reducedMotion) {
            const vPhase = s.frameCount * VIBRATION_FREQ * particle.energy + particle.phase;
            vx = Math.cos(particle.vibAngle) * Math.sin(vPhase) * vibAmp * maxInfluence;
            vy = Math.sin(particle.vibAngle) * Math.cos(vPhase * 1.3) * vibAmp * maxInfluence;
          }

          const px = particle.homeX + vx;
          const py = particle.homeY + vy;
          const particleSize = particle.sizeFrac * minDim;

          const alpha = maxInfluence * particle.brightness * 0.75 * entrance;
          const energyT = maxInfluence * particle.energy;

          const pColor = lerpColor(
            lerpColor(GRID_ENERGY, s.primaryRgb, 0.1),
            lerpColor(GRID_CORE, s.accentRgb, 0.15),
            energyT,
          );

          // Particle glow
          if (maxInfluence > 0.15) {
            const glowR = particleSize * 5 * maxInfluence;
            const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
            glowGrad.addColorStop(0, rgba(pColor, alpha * 0.25));
            glowGrad.addColorStop(0.5, rgba(pColor, alpha * 0.08));
            glowGrad.addColorStop(1, rgba(pColor, 0));
            ctx.fillStyle = glowGrad;
            ctx.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2);
          }

          // Particle core
          const coreSize = particleSize * (0.5 + maxInfluence * 0.5);
          ctx.beginPath();
          ctx.arc(px, py, Math.max(minDim * 0.0005, coreSize), 0, Math.PI * 2);
          ctx.fillStyle = rgba(pColor, alpha);
          ctx.fill();
        }

        // ── Hexagonal connection lines (high influence) ──
        const connThreshold = 0.4;
        for (const rp of s.revealPoints) {
          if (rp.radius < connThreshold) continue;
          const revealR = rp.radius * maxRevealR;
          const lineAlpha = (rp.radius - connThreshold) * 0.02 * entrance;

          ctx.lineWidth = minDim * 0.0008;
          const lineColor = lerpColor(GRID_ENERGY, s.primaryRgb, 0.15);

          const nearParticles: { x: number; y: number }[] = [];
          for (const particle of s.grid) {
            const dx = particle.homeX - rp.x;
            const dy = particle.homeY - rp.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < revealR * 0.7) {
              nearParticles.push({ x: particle.homeX, y: particle.homeY });
            }
          }

          for (let i = 0; i < nearParticles.length; i++) {
            const a = nearParticles[i];
            for (let j = i + 1; j < nearParticles.length; j++) {
              const b = nearParticles[j];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d > cellSize * 1.2 || d < cellSize * 0.5) continue;

              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = rgba(lineColor, lineAlpha);
              ctx.stroke();
            }
          }
        }

        // ── Reveal zone atmosphere ──────────────────────
        for (const rp of s.revealPoints) {
          if (rp.radius < 0.05) continue;
          const revealR = rp.radius * maxRevealR;
          const atmGrad = ctx.createRadialGradient(rp.x, rp.y, 0, rp.x, rp.y, revealR);
          const aColor = lerpColor(REVEAL_GLOW, s.primaryRgb, 0.15);
          atmGrad.addColorStop(0, rgba(aColor, rp.radius * 0.06 * entrance));
          atmGrad.addColorStop(0.4, rgba(aColor, rp.radius * 0.025 * entrance));
          atmGrad.addColorStop(0.8, rgba(aColor, rp.radius * 0.006 * entrance));
          atmGrad.addColorStop(1, rgba(aColor, 0));
          ctx.fillStyle = atmGrad;
          ctx.fillRect(rp.x - revealR, rp.y - revealR, revealR * 2, revealR * 2);
        }
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