/**
 * ATOM 013: THE DOUBLE SLIT ENGINE
 * ==================================
 * Series 2 — Quantum Mechanics · Position 3
 *
 * How you look at a problem literally changes the nature of
 * the problem itself. Particles stream through two slits.
 * When UNOBSERVED (no touch), they behave as waves — flowing,
 * interfering, forming beautiful sine-band patterns. The INSTANT
 * the user touches the screen ("observing"), the wave collapses
 * into a rigid grid of discrete particles. Lift the finger,
 * the grid dissolves back to waves. Binary. Instant. True.
 *
 * PHYSICS:
 *   - 300 particles streaming through 2 slit positions
 *   - WAVE MODE (unobserved): sine-wave interference, constructive/
 *     destructive bands, flowing horizontal motion
 *   - PARTICLE MODE (observed): snap to regular grid, discrete dots,
 *     no flow — frozen, individual, measurable
 *   - Transition is INSTANT on touch (not gradual) — that IS the point
 *   - The interference pattern uses the double-slit equation:
 *     I(y) = cos²(π·d·y / (λ·L)) where d=slit spacing, λ=wavelength
 *   - step_advance fires each time mode toggles
 *
 * INTERACTION:
 *   Touch down  → SNAP to particle mode (observed)
 *   Touch up    → DISSOLVE to wave mode (unobserved)
 *   Observable  → wave plays forever without input
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static wave/particle, no streaming animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PARTICLE_COUNT = 300;
/** Slit spacing as fraction of viewport height */
const SLIT_SPACING_FRAC = 0.25;
/** Slit width as fraction of viewport height */
const SLIT_WIDTH_FRAC = 0.02;
/** Slit wall X position as fraction of viewport width */
const SLIT_WALL_X_FRAC = 0.2;
/** Interference wavelength (controls band spacing) */
const WAVELENGTH = 0.08;
/** Wave flow speed (px/frame) */
const WAVE_FLOW_SPEED = 1.2;
/** Grid columns for particle mode */
const GRID_COLS = 20;
/** Grid rows for particle mode */
const GRID_ROWS = 15;
/** Snap speed for wave→particle transition */
const SNAP_SPEED = 0.2;
/** Dissolve speed for particle→wave transition */
const DISSOLVE_SPEED = 0.08;

// =====================================================================
// PARTICLE
// =====================================================================

interface SlitParticle {
  /** Current X position */
  x: number;
  /** Current Y position */
  y: number;
  /** Wave-mode target X */
  waveX: number;
  /** Wave-mode target Y */
  waveY: number;
  /** Grid-mode target X */
  gridX: number;
  /** Grid-mode target Y */
  gridY: number;
  /** Individual wave phase offset */
  wavePhase: number;
  /** Wave amplitude for this particle */
  waveAmp: number;
  /** Brightness */
  brightness: number;
  /** Size */
  size: number;
  /** Which slit this particle came through (0 or 1) */
  slit: number;
  /** Horizontal flow progress (0–1, wraps) */
  flowT: number;
  /** Individual flow speed */
  flowSpeed: number;
}

function createParticles(w: number, h: number): SlitParticle[] {
  const particles: SlitParticle[] = [];
  const slitWallX = w * SLIT_WALL_X_FRAC;
  const slitSpacing = h * SLIT_SPACING_FRAC;
  const slit1Y = h / 2 - slitSpacing / 2;
  const slit2Y = h / 2 + slitSpacing / 2;

  // Grid positions
  const gridMarginX = w * 0.25;
  const gridMarginY = h * 0.1;
  const gridW = w * 0.65;
  const gridH = h * 0.8;
  const cellW = gridW / GRID_COLS;
  const cellH = gridH / GRID_ROWS;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const slit = i % 2; // Alternate between slits
    const slitY = slit === 0 ? slit1Y : slit2Y;

    // Flow position (how far along the stream)
    const flowT = Math.random();
    const screenX = slitWallX + flowT * (w - slitWallX);

    // Double-slit interference: I(y) = cos²(π·d·y / (λ·L))
    // where d = slit spacing, y = screen position, λ = wavelength, L = distance
    const L = screenX - slitWallX;
    const distFromCenter = (Math.random() - 0.5) * h * 0.8;

    // Interference intensity at this y position
    const interference = Math.cos(
      Math.PI * slitSpacing * distFromCenter / (WAVELENGTH * Math.max(L, 50) * h),
    );
    const intensity = interference * interference;

    // Wave Y: follows interference pattern with some spread
    const waveY = h / 2 + distFromCenter * (0.3 + intensity * 0.7);

    // Grid position
    const gridCol = i % GRID_COLS;
    const gridRow = Math.floor(i / GRID_COLS) % GRID_ROWS;

    particles.push({
      x: screenX,
      y: waveY,
      waveX: screenX,
      waveY,
      gridX: gridMarginX + gridCol * cellW + cellW / 2,
      gridY: gridMarginY + gridRow * cellH + cellH / 2,
      wavePhase: Math.random() * Math.PI * 2,
      waveAmp: 2 + Math.random() * 8,
      brightness: 0.2 + intensity * 0.6 + Math.random() * 0.2,
      size: 0.8 + Math.random() * 2,
      slit,
      flowT,
      flowSpeed: 0.002 + Math.random() * 0.003,
    });
  }

  return particles;
}

// =====================================================================
// COLOR
// =====================================================================

// Quantum palette
const WAVE_COLOR: RGB = [100, 130, 220];     // Flowing blue
const PARTICLE_COLOR: RGB = [200, 210, 240]; // Sharp crystalline
const SLIT_COLOR: RGB = [60, 55, 80];        // Wall color

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function DoubleSlitAtom({
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

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange };
  }, [onHaptic, onStateChange]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    particles: [] as SlitParticle[],
    // Observation state
    isObserving: false,
    /** 0 = full wave, 1 = full particle */
    observeBlend: 0,
    toggleCount: 0,
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

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const slitWallX = w * SLIT_WALL_X_FRAC;
    const slitSpacing = h * SLIT_SPACING_FRAC;
    const slit1Y = h / 2 - slitSpacing / 2;
    const slit2Y = h / 2 + slitSpacing / 2;
    const slitW = h * SLIT_WIDTH_FRAC;

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

      const minDim = Math.min(w, h);

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Observe blend (instant snap, soft dissolve) ───
      const targetBlend = s.isObserving ? 1 : 0;
      if (s.isObserving) {
        // SNAP — instant on observation
        s.observeBlend = Math.min(1, s.observeBlend + SNAP_SPEED);
      } else {
        // DISSOLVE — gradual return to wave
        s.observeBlend = Math.max(0, s.observeBlend - DISSOLVE_SPEED);
      }
      const blend = s.observeBlend; // 0 = wave, 1 = particle

      // ── State reporting ───────────────────────────────
      cb.onStateChange?.(blend);

      // ══════════════════════════════════════════════════
      // PARTICLE PHYSICS
      // ══════════════════════════════════════════════════

      for (const particle of s.particles) {
        // Wave mode: flow and oscillate
        if (!p.reducedMotion) {
          particle.flowT += particle.flowSpeed * (1 - blend * 0.8);
          if (particle.flowT > 1) particle.flowT -= 1;

          // Recalculate wave position based on flow
          const screenX = slitWallX + particle.flowT * (w - slitWallX);
          const slitY = particle.slit === 0 ? slit1Y : slit2Y;
          const L = Math.max(50, screenX - slitWallX);

          // Interference pattern
          const spread = L * 0.003;
          const baseY = slitY + (Math.sin(particle.wavePhase + s.frameCount * 0.015) * spread);
          // Cross-slit interference oscillation
          const interPhase = particle.wavePhase + screenX * 0.02;
          const interY = Math.sin(interPhase) * particle.waveAmp * (1 + spread * 0.02);

          particle.waveX = screenX;
          particle.waveY = h / 2 + (baseY - h / 2) + interY;
        }

        // Interpolate between wave and grid positions
        const targetX = particle.waveX + (particle.gridX - particle.waveX) * blend;
        const targetY = particle.waveY + (particle.gridY - particle.waveY) * blend;

        // Smooth position interpolation
        const speed = s.isObserving ? SNAP_SPEED : DISSOLVE_SPEED;
        particle.x += (targetX - particle.x) * speed;
        particle.y += (targetY - particle.y) * speed;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([4, 3, 12], s.primaryRgb, 0.03);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Slit wall ─────────────────────────────────────
      const wallColor = lerpColor(SLIT_COLOR, s.primaryRgb, 0.1);
      const wallAlpha = 0.3 * entrance;

      // Top section (above slit 1)
      ctx.fillStyle = rgba(wallColor, wallAlpha);
      ctx.fillRect(slitWallX - 3, 0, 6, slit1Y - slitW / 2);

      // Middle section (between slits)
      ctx.fillRect(slitWallX - 3, slit1Y + slitW / 2, 6, slitSpacing - slitW);

      // Bottom section (below slit 2)
      ctx.fillRect(slitWallX - 3, slit2Y + slitW / 2, 6, h - slit2Y - slitW / 2);

      // Slit glow
      const slitGlowColor = lerpColor(s.accentRgb, [150, 140, 200], 0.3);
      for (const sy of [slit1Y, slit2Y]) {
        const slitGrad = ctx.createRadialGradient(
          slitWallX, sy, 0,
          slitWallX, sy, slitW * 3,
        );
        slitGrad.addColorStop(0, rgba(slitGlowColor, 0.12 * entrance));
        slitGrad.addColorStop(0.5, rgba(slitGlowColor, 0.03 * entrance));
        slitGrad.addColorStop(1, rgba(slitGlowColor, 0));
        ctx.fillStyle = slitGrad;
        ctx.fillRect(slitWallX - slitW * 3, sy - slitW * 3, slitW * 6, slitW * 6);
      }

      // ── Interference pattern bands (wave mode, fades in particle mode) ─
      if (blend < 0.8) {
        const bandAlpha = (1 - blend * 1.2) * 0.03 * entrance;
        const bandCount = 12;
        for (let i = 0; i < bandCount; i++) {
          const yFrac = (i / bandCount);
          const bandY = h * 0.1 + yFrac * h * 0.8;
          // Interference intensity
          const intensity = Math.cos(yFrac * Math.PI * bandCount * 0.5) ** 2;
          if (intensity < 0.3) continue;

          ctx.fillStyle = rgba(
            lerpColor(WAVE_COLOR, s.primaryRgb, 0.2),
            bandAlpha * intensity,
          );
          ctx.fillRect(slitWallX + 20, bandY - 2, w - slitWallX - 30, 4);
        }
      }

      // ── Grid lines (particle mode, fades in wave mode) ─
      if (blend > 0.2) {
        const gridAlpha = (blend - 0.2) * 0.04 * entrance;
        const gridMarginX = w * 0.25;
        const gridMarginY = h * 0.1;
        const gridW = w * 0.65;
        const gridH = h * 0.8;
        const cellW = gridW / GRID_COLS;
        const cellH = gridH / GRID_ROWS;

        ctx.strokeStyle = rgba(
          lerpColor(PARTICLE_COLOR, s.primaryRgb, 0.2),
          gridAlpha,
        );
        ctx.lineWidth = minDim * 0.0006;

        // Vertical lines
        for (let c = 0; c <= GRID_COLS; c++) {
          const gx = gridMarginX + c * cellW;
          ctx.beginPath();
          ctx.moveTo(gx, gridMarginY);
          ctx.lineTo(gx, gridMarginY + gridH);
          ctx.stroke();
        }
        // Horizontal lines
        for (let r = 0; r <= GRID_ROWS; r++) {
          const gy = gridMarginY + r * cellH;
          ctx.beginPath();
          ctx.moveTo(gridMarginX, gy);
          ctx.lineTo(gridMarginX + gridW, gy);
          ctx.stroke();
        }
      }

      // ── Particles ─────────────────────────────────────
      for (const particle of s.particles) {
        // Color transitions: wave (blue, soft) → particle (white, sharp)
        const pColor = lerpColor(
          lerpColor(WAVE_COLOR, s.primaryRgb, 0.15),
          lerpColor(PARTICLE_COLOR, s.accentRgb, 0.1),
          blend,
        );

        // Alpha: wave particles are softer, grid particles are crisper
        const waveAlpha = particle.brightness * (0.15 + particle.brightness * 0.2);
        const gridAlpha = particle.brightness * 0.45;
        const alpha = (waveAlpha + (gridAlpha - waveAlpha) * blend) * entrance;

        // Size: wave particles are larger/softer, grid particles are smaller/sharper
        const waveSize = particle.size * 1.3;
        const gridSize = particle.size * 0.7;
        const size = waveSize + (gridSize - waveSize) * blend;

        if (alpha < 0.01) continue;

        // Wave mode: soft glow
        if (blend < 0.7 && size > 0.8) {
          const glowR = size * (3 - blend * 2);
          const glowGrad = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, glowR,
          );
          glowGrad.addColorStop(0, rgba(pColor, alpha * 0.2 * (1 - blend)));
          glowGrad.addColorStop(0.5, rgba(pColor, alpha * 0.05 * (1 - blend)));
          glowGrad.addColorStop(1, rgba(pColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(particle.x - glowR, particle.y - glowR, glowR * 2, glowR * 2);
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.3, size * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, alpha);
        ctx.fill();

        // Particle mode: sharp edge highlight
        if (blend > 0.5) {
          const edgeAlpha = (blend - 0.5) * 0.3 * entrance;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size * 0.5 + 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(lerpColor(PARTICLE_COLOR, s.accentRgb, 0.1), edgeAlpha);
          ctx.lineWidth = minDim * 0.0006;
          ctx.stroke();
        }
      }

      // ── Source particles (streaming from left) ────────
      if (!p.reducedMotion && blend < 0.5) {
        const sourceAlpha = (1 - blend * 2) * 0.06 * entrance;
        const sourceColor = lerpColor(s.primaryRgb, WAVE_COLOR, 0.3);
        for (let i = 0; i < 8; i++) {
          const sx = Math.random() * slitWallX;
          const sy = h * 0.3 + Math.random() * h * 0.4;
          ctx.beginPath();
          ctx.arc(sx, sy, minDim * (0.001 + Math.random() * 0.002), 0, Math.PI * 2);
          ctx.fillStyle = rgba(sourceColor, sourceAlpha * Math.random());
          ctx.fill();
        }
      }

      // ── Mode indicator (very subtle) ──────────────────
      const labelAlpha = 0.06 * entrance;
      ctx.font = `${Math.max(9, minDim * 0.02)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      const label = blend > 0.5 ? 'observed' : 'unobserved';
      ctx.fillStyle = rgba(
        blend > 0.5
          ? lerpColor(PARTICLE_COLOR, s.accentRgb, 0.2)
          : lerpColor(WAVE_COLOR, s.primaryRgb, 0.2),
        labelAlpha,
      );
      ctx.fillText(label, w / 2, h - 20);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isObserving) {
        s.isObserving = true;
        s.toggleCount++;
        callbacksRef.current.onHaptic('tap');
        callbacksRef.current.onHaptic('step_advance');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.isObserving) {
        s.isObserving = false;
        s.toggleCount++;
        callbacksRef.current.onHaptic('step_advance');
      }
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
          cursor: 'default',
        }}
      />
    </div>
  );
}