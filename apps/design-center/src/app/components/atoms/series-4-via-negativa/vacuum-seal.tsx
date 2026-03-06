/**
 * ATOM 034: THE VACUUM SEAL ENGINE (Silence Containment)
 * =======================================================
 * Series 4 — Via Negativa · Position 4
 *
 * When the mind is too loud, the user doesn't need to argue
 * with the noise — they need to suffocate it. This atom
 * visually and haptically captures chaos and seals it away.
 *
 * ~120 chaotic particles jitter, dart, and buzz across the
 * viewport — pure visual noise. They represent the inner
 * cacophony. The user drags inward from any edge to close
 * a circular containment lid. As the lid radius shrinks,
 * particles compress inward — reverse-emitter implosion.
 * The moment the seal completes: every particle snaps to
 * the center in one violent frame and vanishes. The screen
 * goes perfectly still. One devastating metallic CLACK.
 * Then silence. A faint seal mark glows where the chaos
 * was entombed. The noise didn't win. You contained it.
 *
 * PHYSICS:
 *   - 120 chaos particles with erratic Brownian motion
 *   - Containment radius: starts at viewport diagonal,
 *     user drags inward to shrink
 *   - Particles beyond radius get pushed inward
 *   - Implosion acceleration as radius approaches zero
 *   - SEAL moment: all particles → center, alpha → 0
 *   - Post-seal: metallic ring glow, absolute calm
 *   - Particles jitter harder as they compress (panic)
 *
 * HAPTIC JOURNEY:
 *   Hold/drag → hold_start (containment engaged)
 *   Radius < 30% → step_advance (panic intensifies)
 *   Seal complete → seal_stamp (heavy metallic vault clack)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Slower particles, faster seal, no jitter
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const CHAOS_COUNT = 120;
const MAX_SPEED = 3.5;
const JITTER_MAG = 0.8;
/** Seal completes when radius < this fraction of minDim */
const SEAL_THRESHOLD_FRAC = 0.02;
/** Implosion force ramp */
const IMPLOSION_FORCE = 0.06;
/** Post-seal glow duration (frames) */
const SEAL_GLOW_DURATION = 300;

// =====================================================================
// CHAOS PARTICLE
// =====================================================================

interface ChaosParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  brightness: number;
  phase: number;
  /** Whether imploded (post-seal) */
  dead: boolean;
}

function createChaosParticles(w: number, h: number, minDim: number): ChaosParticle[] {
  return Array.from({ length: CHAOS_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * MAX_SPEED;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: minDim * (0.002 + Math.random() * 0.006),
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      dead: false,
    };
  });
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const CHAOS_DIM: RGB = [80, 60, 70];         // Noise — anxious purple-grey
const CHAOS_BRIGHT: RGB = [160, 110, 120];   // Agitated bright
const CHAOS_HOT: RGB = [200, 100, 80];       // Panic red as compressed
const VOID_BG: RGB = [3, 3, 4];             // Post-seal void
const SEAL_METAL: RGB = [140, 135, 130];     // Metallic seal ring
const SEAL_GLOW_COLOR: RGB = [100, 95, 90];  // Faint seal mark
const LID_EDGE: RGB = [120, 115, 110];       // Containment boundary

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function VacuumSealAtom({
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
    particles: [] as ChaosParticle[],
    // Containment
    isContaining: false,
    containRadius: 1, // normalized 0–1 (1 = full viewport, 0 = sealed)
    containCx: 0,
    containCy: 0,
    holdStartFired: false,
    stepFired: false,
    // Seal state
    sealed: false,
    sealFrame: 0,
    sealGlowProgress: 0,
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    if (!s.initialized) {
      s.particles = createChaosParticles(w, h, minDim);
      s.initialized = true;
    }

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.sealed) return;
      s.isContaining = true;
      s.containCx = w / 2;
      s.containCy = h / 2;
      if (!s.holdStartFired) {
        s.holdStartFired = true;
        cbRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isContaining || s.sealed) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const dx = px - s.containCx;
      const dy = py - s.containCy;
      const dist = Math.hypot(dx, dy);
      const maxR = Math.hypot(w, h) * 0.5;
      s.containRadius = Math.max(0, Math.min(1, dist / maxR));
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isContaining = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const maxR = Math.hypot(w, h) * 0.5;
    const sealThreshold = minDim * SEAL_THRESHOLD_FRAC;

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

      const containPx = s.containRadius * maxR;
      const compression = 1 - s.containRadius; // 0 = free, 1 = sealed

      // ── Containment physics ───────────────────────────
      if (!s.sealed) {
        // Auto-shrink while holding
        if (s.isContaining && s.containRadius > 0) {
          const shrinkRate = p.reducedMotion ? 0.008 : 0.003;
          s.containRadius = Math.max(0, s.containRadius - shrinkRate);
        }

        // Step advance when panic zone
        if (s.containRadius < 0.3 && !s.stepFired) {
          s.stepFired = true;
          cb.onHaptic('step_advance');
        }

        // SEAL CHECK
        if (containPx < sealThreshold && s.isContaining) {
          s.sealed = true;
          s.sealFrame = s.frameCount;
          s.containRadius = 0;
          // Kill all particles instantly
          for (const pt of s.particles) pt.dead = true;
          cb.onHaptic('seal_stamp');
          cb.onResolve?.();
        }

        // Particle physics
        const spdMult = p.reducedMotion ? 0.4 : 1;
        for (const pt of s.particles) {
          if (pt.dead) continue;

          // Erratic Brownian jitter — increases with compression
          const jitterScale = (1 + compression * 4) * spdMult;
          pt.vx += (Math.random() - 0.5) * JITTER_MAG * jitterScale;
          pt.vy += (Math.random() - 0.5) * JITTER_MAG * jitterScale;

          // Speed limit — increases slightly with compression (panic)
          const maxSpd = MAX_SPEED * (1 + compression * 0.5) * spdMult;
          const spd = Math.hypot(pt.vx, pt.vy);
          if (spd > maxSpd) {
            pt.vx = (pt.vx / spd) * maxSpd;
            pt.vy = (pt.vy / spd) * maxSpd;
          }

          pt.x += pt.vx;
          pt.y += pt.vy;

          // Implosion: push particles toward center if outside containment
          const dx = pt.x - s.containCx;
          const dy = pt.y - s.containCy;
          const dist = Math.hypot(dx, dy);
          if (dist > containPx && containPx > 0) {
            // Force toward center, proportional to how far outside
            const overshoot = dist - containPx;
            const force = IMPLOSION_FORCE * (1 + compression * 3);
            pt.vx -= (dx / dist) * force * Math.min(overshoot * 0.1, 3);
            pt.vy -= (dy / dist) * force * Math.min(overshoot * 0.1, 3);
            // Hard boundary
            pt.x = s.containCx + (dx / dist) * containPx * 0.95;
            pt.y = s.containCy + (dy / dist) * containPx * 0.95;
          }

          // Also apply mild center-pull when compressed
          if (compression > 0.3) {
            const pullForce = (compression - 0.3) * 0.01;
            pt.vx -= dx * pullForce * 0.01;
            pt.vy -= dy * pullForce * 0.01;
          }
        }
      }

      // ── Post-seal glow ────────────────────────────────
      if (s.sealed) {
        s.sealGlowProgress = Math.min(1, (s.frameCount - s.sealFrame) / SEAL_GLOW_DURATION);
      }

      // State: compression level (sealed = 1)
      cb.onStateChange?.(s.sealed ? 1 : compression);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgColor = lerpColor(VOID_BG, s.primaryRgb, 0.008);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (!s.sealed) {
        // ── Containment boundary ──────────────────────────
        if (compression > 0.01) {
          const lidColor = lerpColor(LID_EDGE, s.primaryRgb, 0.06);
          // Containment circle
          ctx.beginPath();
          ctx.arc(s.containCx, s.containCy, containPx, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(lidColor, 0.06 * entrance * compression);
          ctx.lineWidth = minDim * (0.001 + compression * 0.003);
          ctx.stroke();

          // Pressure field outside containment (darkening)
          const pressureGrad = ctx.createRadialGradient(
            s.containCx, s.containCy, containPx,
            s.containCx, s.containCy, containPx + minDim * 0.15,
          );
          pressureGrad.addColorStop(0, rgba(bgColor, 0));
          pressureGrad.addColorStop(1, rgba(lerpColor(bgColor, s.primaryRgb, 0.01), 0.3 * compression * entrance));
          ctx.fillStyle = pressureGrad;
          ctx.fillRect(0, 0, w, h);
        }

        // ── Chaos particles ───────────────────────────────
        for (const pt of s.particles) {
          if (pt.dead) continue;

          // Color shifts from anxious to panicked as compressed
          const ptColor = lerpColor(
            lerpColor(CHAOS_DIM, s.primaryRgb, 0.06),
            lerpColor(CHAOS_HOT, s.accentRgb, 0.1),
            compression * 0.6,
          );

          const pulse = p.reducedMotion ? 0.7 :
            0.5 + 0.5 * Math.sin(s.frameCount * 0.06 + pt.phase);
          const alpha = pt.brightness * (0.15 + compression * 0.2) * pulse * entrance;

          // Glow (brighter when compressed)
          if (pt.size > minDim * 0.003 && compression > 0.1) {
            const glowR = pt.size * (2 + compression * 2);
            const glowGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
            const glowColor = lerpColor(CHAOS_BRIGHT, s.accentRgb, 0.08);
            glowGrad.addColorStop(0, rgba(glowColor, alpha * 0.12));
            glowGrad.addColorStop(1, rgba(glowColor, 0));
            ctx.fillStyle = glowGrad;
            ctx.fillRect(pt.x - glowR, pt.y - glowR, glowR * 2, glowR * 2);
          }

          // Body — angular shapes for chaos (not circles)
          ctx.save();
          ctx.translate(pt.x, pt.y);
          const rot = p.reducedMotion ? pt.phase :
            pt.phase + s.frameCount * 0.015 * pt.brightness;
          ctx.rotate(rot);
          const sz = pt.size * (0.5 + compression * 0.3);
          ctx.beginPath();
          // Jagged triangle
          ctx.moveTo(0, -sz);
          ctx.lineTo(sz * 0.7, sz * 0.5);
          ctx.lineTo(-sz * 0.7, sz * 0.5);
          ctx.closePath();
          ctx.fillStyle = rgba(ptColor, alpha);
          ctx.fill();
          ctx.restore();
        }

        // ─ Chaos aura (visual noise field) ───────────────
        if (!p.reducedMotion && compression < 0.8) {
          const noiseAlpha = (1 - compression) * 0.008 * entrance;
          const noiseColor = lerpColor(CHAOS_DIM, s.primaryRgb, 0.04);
          for (let i = 0; i < 15; i++) {
            const nx = Math.random() * w;
            const ny = Math.random() * h;
            const nr = minDim * (0.002 + Math.random() * 0.004);
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fillStyle = rgba(noiseColor, noiseAlpha);
            ctx.fill();
          }
        }
      } else {
        // ══════════════════════════════════════════════════
        // POST-SEAL: Silence
        // ══════════════════════════════════════════════════

        const sealT = easeOutExpo(s.sealGlowProgress);

        // Seal mark — a perfect circle where chaos was entombed
        const sealR = minDim * 0.03;
        const sealColor = lerpColor(SEAL_METAL, s.primaryRgb, 0.08);
        const sealAlpha = (0.06 - sealT * 0.03) * entrance;

        // Faint ring
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, sealR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(sealColor, sealAlpha);
        ctx.lineWidth = minDim * (0.001 + compression * 0.003);
        ctx.stroke();

        // Inner glow — the contained energy
        const innerGlowR = sealR * 2;
        const innerGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, innerGlowR);
        const innerColor = lerpColor(SEAL_GLOW_COLOR, s.accentRgb, 0.06);
        innerGrad.addColorStop(0, rgba(innerColor, sealAlpha * 0.5));
        innerGrad.addColorStop(0.4, rgba(innerColor, sealAlpha * 0.1));
        innerGrad.addColorStop(1, rgba(innerColor, 0));
        ctx.fillStyle = innerGrad;
        ctx.fillRect(w / 2 - innerGlowR, h / 2 - innerGlowR, innerGlowR * 2, innerGlowR * 2);

        // Cross-hair seal mark
        const markLen = sealR * 0.6;
        ctx.beginPath();
        ctx.moveTo(w / 2 - markLen, h / 2);
        ctx.lineTo(w / 2 + markLen, h / 2);
        ctx.moveTo(w / 2, h / 2 - markLen);
        ctx.lineTo(w / 2, h / 2 + markLen);
        ctx.strokeStyle = rgba(sealColor, sealAlpha * 0.6);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();
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
          cursor: 'default',
        }}
      />
    </div>
  );
}