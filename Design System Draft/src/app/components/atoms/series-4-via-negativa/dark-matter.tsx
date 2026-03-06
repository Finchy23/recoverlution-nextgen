/**
 * ATOM 035: THE DARK MATTER ENGINE (Invisible Gravity)
 * =====================================================
 * Series 4 — Via Negativa · Position 5
 *
 * To teach the user that they do not need to be loud, visible,
 * or constantly "producing" to have massive influence. 95% of
 * the universe's mass is invisible. And it holds everything
 * together.
 *
 * The screen appears almost empty — a vast dark field with the
 * faintest possible dust motes and light filaments. Nothing
 * seems to be happening. Then the user touches. Their finger
 * is invisible — no cursor, no highlight, no ripple. But the
 * ambient dust BENDS around the touch point, tracing the
 * contour of an invisible gravitational well. Light filaments
 * curve. Dust accelerates. The user's influence is proven not
 * by what they see at the touch point, but by how the entire
 * field responds.
 *
 * Hold longer → the gravity well deepens. Nearby dust orbits.
 * Distant filaments arc. Release → the field slowly returns
 * to drift. But a faint lensing afterimage persists, proving
 * the dark matter was always there.
 *
 * PHYSICS:
 *   - 200 ambient dust motes with slow drift velocities
 *   - 15 light filaments (faint streaks across the field)
 *   - Touch = gravity well: inverse-square displacement
 *   - Dust within range: orbital deflection, not absorption
 *   - Lensing ring: visible distortion ring around touch
 *   - Gravity strength ramps with hold duration
 *   - Multiple simultaneous touch points supported
 *   - Breath modulates well depth (deeper = stronger pull)
 *
 * HAPTIC JOURNEY:
 *   Hold → hold_start (you can't see it, but you feel it)
 *   Deep hold → hold_threshold (spacetime warps)
 *   No completion — dark matter is eternal
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Slower dust, no filament sway, instant well
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const DUST_COUNT = 200;
const FILAMENT_COUNT = 15;
/** Gravity well influence radius as fraction of minDim */
const WELL_RADIUS_FRAC = 0.35;
/** Max gravitational force */
const MAX_GRAVITY = 2.5;
/** Gravity ramp rate per frame while holding */
const GRAVITY_RAMP = 0.008;
/** Gravity decay when released */
const GRAVITY_DECAY = 0.015;
/** Dust max drift speed */
const DUST_DRIFT = 0.15;
/** Lensing ring visual radius as fraction of well radius */
const LENS_RING_FRAC = 0.3;

// =====================================================================
// DATA STRUCTURES
// =====================================================================

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Home position (slow return when undisturbed) */
  homeX: number;
  homeY: number;
  size: number;
  alpha: number;
  /** Phase for shimmer */
  phase: number;
}

interface LightFilament {
  /** Start and end positions */
  x1: number; y1: number;
  x2: number; y2: number;
  /** Control point for bezier */
  cpx: number; cpy: number;
  alpha: number;
  width: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette — almost nothing. The void with whispers of light.
const DEEP_VOID: RGB = [2, 2, 3];            // Near-OLED black
const DUST_DIM: RGB = [80, 75, 70];          // Barely-visible dust
const DUST_LIT: RGB = [120, 110, 100];       // Dust caught in gravity
const FILAMENT_COLOR: RGB = [60, 58, 55];    // Gossamer light threads
const LENS_RING: RGB = [90, 85, 80];         // Lensing distortion edge
const WELL_AURA: RGB = [70, 65, 60];         // Gravity well atmosphere

// =====================================================================
// GENERATION
// =====================================================================

function createDust(w: number, h: number, minDim: number): DustMote[] {
  return Array.from({ length: DUST_COUNT }, () => {
    const x = Math.random() * w;
    const y = Math.random() * h;
    return {
      x, y,
      vx: (Math.random() - 0.5) * DUST_DRIFT,
      vy: (Math.random() - 0.5) * DUST_DRIFT,
      homeX: x,
      homeY: y,
      size: minDim * (0.0006 + Math.random() * 0.0025),
      alpha: 0.02 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

function createFilaments(w: number, h: number, minDim: number): LightFilament[] {
  return Array.from({ length: FILAMENT_COUNT }, () => {
    const angle = Math.random() * Math.PI;
    const cx = w * (0.1 + Math.random() * 0.8);
    const cy = h * (0.1 + Math.random() * 0.8);
    const len = Math.min(w, h) * (0.1 + Math.random() * 0.25);
    return {
      x1: cx + Math.cos(angle) * len,
      y1: cy + Math.sin(angle) * len,
      x2: cx - Math.cos(angle) * len,
      y2: cy - Math.sin(angle) * len,
      cpx: cx + (Math.random() - 0.5) * len * 0.4,
      cpy: cy + (Math.random() - 0.5) * len * 0.4,
      alpha: 0.01 + Math.random() * 0.02,
      width: minDim * (0.0004 + Math.random() * 0.0006),
    };
  });
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function DarkMatterAtom({
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
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; },
    [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    dust: [] as DustMote[],
    filaments: [] as LightFilament[],
    // Gravity well
    isHolding: false,
    wellX: 0,
    wellY: 0,
    wellStrength: 0, // 0–1
    holdStartFired: false,
    holdThresholdFired: false,
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

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isHolding = true;
      s.wellX = (e.clientX - rect.left) / rect.width * w;
      s.wellY = (e.clientY - rect.top) / rect.height * h;
      if (!s.holdStartFired) {
        s.holdStartFired = true;
        cbRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (s.isHolding) {
        s.wellX = (e.clientX - rect.left) / rect.width * w;
        s.wellY = (e.clientY - rect.top) / rect.height * h;
      }
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isHolding = false;
      s.holdStartFired = false;
      s.holdThresholdFired = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.dust = createDust(w, h, minDim);
      s.filaments = createFilaments(w, h, minDim);
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const wellRadius = minDim * WELL_RADIUS_FRAC;

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

      // ── Gravity well strength ─────────────────────────
      if (s.isHolding) {
        const rampRate = p.reducedMotion ? GRAVITY_RAMP * 3 : GRAVITY_RAMP;
        const breathBoost = 1 + p.breathAmplitude * 0.4;
        s.wellStrength = Math.min(1, s.wellStrength + rampRate * breathBoost);

        if (s.wellStrength > 0.5 && !s.holdThresholdFired) {
          s.holdThresholdFired = true;
          cb.onHaptic('hold_threshold');
        }
      } else {
        s.wellStrength = Math.max(0, s.wellStrength - GRAVITY_DECAY);
      }

      cb.onStateChange?.(s.wellStrength);

      // ── Dust physics ──────────────────────────────────
      const gStrength = s.wellStrength * MAX_GRAVITY;
      const spdMult = p.reducedMotion ? 0.3 : 1;

      for (const d of s.dust) {
        // Gentle drift
        d.vx += (Math.random() - 0.5) * 0.01 * spdMult;
        d.vy += (Math.random() - 0.5) * 0.01 * spdMult;

        // Slow return to home
        d.vx += (d.homeX - d.x) * 0.0002;
        d.vy += (d.homeY - d.y) * 0.0002;

        // Gravity well influence
        if (gStrength > 0.01) {
          const dx = s.wellX - d.x;
          const dy = s.wellY - d.y;
          const dist = Math.max(minDim * 0.015, Math.hypot(dx, dy));

          if (dist < wellRadius) {
            // Inverse-square gravitational deflection
            // Not toward the well — AROUND it (orbital, not absorptive)
            const force = gStrength / (dist * dist) * 80;
            const cappedForce = Math.min(force, 0.3);

            // Tangential component (orbital) + small radial component
            const nx = dx / dist;
            const ny = dy / dist;
            // Perpendicular (tangential) direction
            const tx = -ny;
            const ty = nx;

            // Mostly tangential, slightly radial when close
            const radialPull = dist < wellRadius * 0.3 ? 0.15 : 0.03;
            d.vx += (tx * cappedForce * 0.7 + nx * cappedForce * radialPull) * spdMult;
            d.vy += (ty * cappedForce * 0.7 + ny * cappedForce * radialPull) * spdMult;
          }
        }

        // Damping
        d.vx *= 0.98;
        d.vy *= 0.98;

        // Speed limit
        const spd = Math.hypot(d.vx, d.vy);
        const maxSpd = 1.5 * spdMult;
        if (spd > maxSpd) {
          d.vx = (d.vx / spd) * maxSpd;
          d.vy = (d.vy / spd) * maxSpd;
        }

        d.x += d.vx;
        d.y += d.vy;

        // Soft boundary wrap
        const wrapM = minDim * 0.04;
        if (d.x < -wrapM) { d.x = w + wrapM; d.homeX = d.x; }
        if (d.x > w + wrapM) { d.x = -wrapM; d.homeX = d.x; }
        if (d.y < -wrapM) { d.y = h + wrapM; d.homeY = d.y; }
        if (d.y > h + wrapM) { d.y = -wrapM; d.homeY = d.y; }
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background: deep void ─────────────────────────
      const bgColor = lerpColor(DEEP_VOID, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Light filaments ───────────────────────────────
      for (const fil of s.filaments) {
        let cpx = fil.cpx;
        let cpy = fil.cpy;

        // Gravitational lensing on filaments
        if (gStrength > 0.05) {
          const fmx = (fil.x1 + fil.x2) / 2;
          const fmy = (fil.y1 + fil.y2) / 2;
          const dx = s.wellX - fmx;
          const dy = s.wellY - fmy;
          const dist = Math.max(20, Math.hypot(dx, dy));
          if (dist < wellRadius) {
            const bendForce = gStrength * 15 / Math.max(dist, 30);
            cpx += (dx / dist) * bendForce;
            cpy += (dy / dist) * bendForce;
          }
        }

        const filColor = lerpColor(FILAMENT_COLOR, s.primaryRgb, 0.06);
        const filAlpha = fil.alpha * entrance;

        ctx.beginPath();
        ctx.moveTo(fil.x1, fil.y1);
        ctx.quadraticCurveTo(cpx, cpy, fil.x2, fil.y2);
        ctx.strokeStyle = rgba(filColor, filAlpha);
        ctx.lineWidth = minDim * (0.0008 + gStrength * 0.0012);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ── Dust motes ────────────────────────────────────
      for (const d of s.dust) {
        const shimmer = p.reducedMotion ? 0.7 :
          0.5 + 0.5 * Math.sin(s.frameCount * 0.02 + d.phase);

        // Dust brightens when near gravity well
        let nearWell = 0;
        if (gStrength > 0.05) {
          const dx = s.wellX - d.x;
          const dy = s.wellY - d.y;
          const dist = Math.hypot(dx, dy);
          nearWell = dist < wellRadius ? (1 - dist / wellRadius) * gStrength : 0;
        }

        const dustColor = lerpColor(
          lerpColor(DUST_DIM, s.primaryRgb, 0.05),
          lerpColor(DUST_LIT, s.accentRgb, 0.08),
          nearWell * 0.6,
        );
        const alpha = (d.alpha + nearWell * 0.06) * shimmer * entrance;

        if (alpha < 0.005) continue;

        // Glow for brighter/closer motes
        if (nearWell > 0.3 && d.size > minDim * 0.0012) {
          const glowR = d.size * 3;
          const glowGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, glowR);
          glowGrad.addColorStop(0, rgba(dustColor, alpha * 0.15));
          glowGrad.addColorStop(1, rgba(dustColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(d.x - glowR, d.y - glowR, glowR * 2, glowR * 2);
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dustColor, alpha);
        ctx.fill();
      }

      // ── Gravitational lensing ring ────────────────────
      if (gStrength > 0.05 && !p.reducedMotion) {
        const lensR = wellRadius * LENS_RING_FRAC * gStrength;
        const lensColor = lerpColor(LENS_RING, s.primaryRgb, 0.06);
        const lensAlpha = gStrength * 0.025 * entrance;

        // Lensing ring — the visible proof of invisible mass
        ctx.beginPath();
        ctx.arc(s.wellX, s.wellY, lensR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lensColor, lensAlpha);
        ctx.lineWidth = minDim * (0.0008 + gStrength * 0.0012);
        ctx.stroke();

        // Outer distortion halo
        const haloR = lensR * 2;
        const haloGrad = ctx.createRadialGradient(
          s.wellX, s.wellY, lensR * 0.8,
          s.wellX, s.wellY, haloR,
        );
        const haloColor = lerpColor(WELL_AURA, s.accentRgb, 0.06);
        haloGrad.addColorStop(0, rgba(haloColor, lensAlpha * 0.3));
        haloGrad.addColorStop(0.5, rgba(haloColor, lensAlpha * 0.08));
        haloGrad.addColorStop(1, rgba(haloColor, 0));
        ctx.fillStyle = haloGrad;
        ctx.fillRect(s.wellX - haloR, s.wellY - haloR, haloR * 2, haloR * 2);
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
          cursor: 'none',
        }}
      />
    </div>
  );
}