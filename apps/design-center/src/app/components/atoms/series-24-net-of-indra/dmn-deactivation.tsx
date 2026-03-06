/**
 * ATOM 234: THE DMN DEACTIVATION ENGINE
 * =======================================
 * Series 24 — Net of Indra · Position 4
 *
 * The Default Mode Network maintains the rigid self/other boundary.
 * Tap the ego circle — dissolve its surface tension into the background
 * flow. The boundary was always an illusion.
 *
 * PHYSICS:
 *   - Central ego-sphere (SIZE.lg) with visible surface tension membrane
 *   - Surrounding field of 60 ambient particles flowing freely
 *   - Ego membrane rendered as oscillating boundary with refraction
 *   - Tap → surface tension weakens, membrane becomes porous
 *   - Particles begin passing through (each pass = haptic tick)
 *   - After enough taps, membrane dissolves entirely
 *   - Ego particles disperse and merge with ambient field
 *   - Final state: unified flowing field with no boundaries
 *   - Breath modulates ambient flow speed and membrane wobble
 *
 * INTERACTION:
 *   Tap (on ego sphere) → weakens surface tension
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static unified field, no boundary
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Ego sphere radius */
const EGO_R = SIZE.lg;
/** Membrane oscillation points */
const MEMBRANE_POINTS = 48;
/** Membrane wobble amplitude at full tension */
const WOBBLE_AMP = 0.008;
/** Ambient particle count */
const AMBIENT_COUNT = 60;
/** Ego interior particle count */
const EGO_PARTICLES = 20;
/** Taps required to fully dissolve */
const TAPS_TO_DISSOLVE = 8;
/** Tension reduction per tap */
const TENSION_DROP = 0.12;
/** Breath wobble multiplier */
const BREATH_WOBBLE = 0.15;
/** Breath flow speed multiplier */
const BREATH_FLOW = 0.2;
/** Particle speed range */
const PARTICLE_SPEED_MIN = 0.0005;
const PARTICLE_SPEED_MAX = 0.002;
/** Dissolution spread speed */
const DISSOLVE_SPEED = 0.006;
/** Glow layers */
const GLOW_LAYERS = 4;

// =====================================================================
// STATE TYPES
// =====================================================================

interface FlowParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  brightness: number;
  phase: number;
  /** Was this originally inside the ego sphere */
  isEgo: boolean;
}

// =====================================================================
// HELPERS
// =====================================================================

function createParticles(): FlowParticle[] {
  const particles: FlowParticle[] = [];

  // Ambient field particles
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.15 + Math.random() * 0.35;
    particles.push({
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.5 + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.001,
      vy: (Math.random() - 0.5) * 0.001,
      size: 0.002 + Math.random() * 0.003,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      isEgo: false,
    });
  }

  // Ego interior particles
  for (let i = 0; i < EGO_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * EGO_R * 0.8;
    particles.push({
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.5 + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.0005,
      vy: (Math.random() - 0.5) * 0.0005,
      size: 0.003 + Math.random() * 0.003,
      brightness: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      isEgo: true,
    });
  }

  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function DmnDeactivationAtom({
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
    surfaceTension: 1,     // 1 = solid, 0 = dissolved
    tapCount: 0,
    particles: createParticles(),
    completed: false,
    stepNotified: false,
    dissolveProgress: 0,   // 0-1 dissolution animation
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
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve') {
        s.surfaceTension = 0;
        s.dissolveProgress = 1;
        s.completed = true;
      }

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        // Unified field — no boundary
        for (const pt of s.particles) {
          const ptx = pt.x * w;
          const pty = pt.y * h;
          const pR = px(pt.size, minDim);
          const pgR = pR * 3;
          const pg = ctx.createRadialGradient(ptx, pty, 0, ptx, pty, pgR);
          pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * pt.brightness * entrance));
          pg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = pg;
          ctx.fillRect(ptx - pgR, pty - pgR, pgR * 2, pgR * 2);
          ctx.beginPath();
          ctx.arc(ptx, pty, pR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * pt.brightness * entrance);
          ctx.fill();
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // DISSOLUTION PHYSICS
      // ════════════════════════════════════════════════════
      if (s.surfaceTension <= 0 && !s.completed) {
        s.dissolveProgress = Math.min(1, s.dissolveProgress + DISSOLVE_SPEED * ms);
        if (s.dissolveProgress >= 1 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }
      if (s.tapCount >= TAPS_TO_DISSOLVE * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      const tension = Math.max(0, s.surfaceTension);
      const dissolved = s.dissolveProgress;
      cb.onStateChange?.(s.completed ? 0.5 + dissolved * 0.5 : (1 - tension) * 0.5);

      // ── Particle physics ───────────────────────────────
      const flowSpeed = 1 + breath * BREATH_FLOW;
      const egoR = px(EGO_R, minDim);

      for (const pt of s.particles) {
        // Flow field (gentle circular drift)
        const dx = pt.x - 0.5;
        const dy = pt.y - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Ambient particles: circular flow
        if (!pt.isEgo || dissolved > 0.3) {
          pt.vx += (-dy * 0.00002 + (Math.random() - 0.5) * 0.00005) * flowSpeed * ms;
          pt.vy += (dx * 0.00002 + (Math.random() - 0.5) * 0.00005) * flowSpeed * ms;
        }

        // Ego particles: contained when tension high, free when dissolved
        if (pt.isEgo && tension > 0.1 && dissolved < 0.5) {
          const maxR = EGO_R * (0.8 + (1 - tension) * 0.4);
          if (dist > maxR) {
            pt.vx -= dx * 0.001 * tension;
            pt.vy -= dy * 0.001 * tension;
          }
        } else if (pt.isEgo && dissolved > 0.1) {
          // Push outward during dissolution
          pt.vx += dx * 0.00005 * dissolved * ms;
          pt.vy += dy * 0.00005 * dissolved * ms;
        }

        // Damping
        pt.vx *= 0.995;
        pt.vy *= 0.995;

        // Integrate
        pt.x += pt.vx * ms;
        pt.y += pt.vy * ms;

        // Boundary wrapping
        if (pt.x < 0.02) pt.x = 0.98;
        if (pt.x > 0.98) pt.x = 0.02;
        if (pt.y < 0.02) pt.y = 0.98;
        if (pt.y > 0.98) pt.y = 0.02;
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Ego sphere shadow + back glow
      // ════════════════════════════════════════════════════
      if (tension > 0.01) {
        // Shadow
        const shadowR = egoR * 1.5;
        const shadow = ctx.createRadialGradient(cx, cy + egoR * 0.05, egoR * 0.3, cx, cy, shadowR);
        shadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.04 * tension * entrance));
        shadow.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
        ctx.fillStyle = shadow;
        ctx.fillRect(cx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

        // Interior glow
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = egoR * (0.8 + i * 0.4);
          const gA = ALPHA.glow.max * 0.04 * tension * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.accentRgb, gA));
          gg.addColorStop(0.5, rgba(s.accentRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Flow field particles
      // ════════════════════════════════════════════════════
      for (const pt of s.particles) {
        const ptx = pt.x * w;
        const pty = pt.y * h;
        const pR = px(pt.size, minDim);

        // Skip ego particles that are still contained
        const dx = pt.x - 0.5;
        const dy = pt.y - 0.5;
        const ptDist = Math.sqrt(dx * dx + dy * dy);

        const isInside = ptDist < EGO_R;
        const particleAlpha = pt.isEgo && tension > 0.3 && isInside
          ? ALPHA.content.max * 0.2 * pt.brightness * entrance
          : ALPHA.content.max * 0.25 * pt.brightness * entrance;

        const particleColor = pt.isEgo && dissolved < 0.5
          ? lerpColor(s.accentRgb, s.primaryRgb, dissolved * 2)
          : s.primaryRgb;

        // Particle glow
        const pgR = pR * 2.5;
        const pg = ctx.createRadialGradient(ptx, pty, 0, ptx, pty, pgR);
        pg.addColorStop(0, rgba(particleColor, ALPHA.glow.max * 0.08 * pt.brightness * entrance));
        pg.addColorStop(1, rgba(particleColor, 0));
        ctx.fillStyle = pg;
        ctx.fillRect(ptx - pgR, pty - pgR, pgR * 2, pgR * 2);

        // Particle body
        ctx.beginPath();
        ctx.arc(ptx, pty, pR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(particleColor, particleAlpha);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Membrane (oscillating boundary)
      // ════════════════════════════════════════════════════
      if (tension > 0.01) {
        const wobbleAmp = WOBBLE_AMP * (1 + breath * BREATH_WOBBLE);
        const poreSize = (1 - tension) * 0.15; // gaps in membrane

        ctx.beginPath();
        for (let i = 0; i <= MEMBRANE_POINTS; i++) {
          const angle = (i / MEMBRANE_POINTS) * Math.PI * 2;
          const wobble = Math.sin(angle * 6 + time * 2) * wobbleAmp * tension +
            Math.sin(angle * 3 + time * 1.3) * wobbleAmp * 0.5 * tension;

          // Pore gaps when tension drops
          const poreGap = poreSize > 0 ? Math.max(0, Math.sin(angle * 4 + time * 0.5)) * poreSize : 0;
          const r = (EGO_R + wobble) * (1 - poreGap);

          const px2 = cx + Math.cos(angle) * px(r, minDim);
          const py2 = cy + Math.sin(angle) * px(r, minDim);

          if (i === 0) ctx.moveTo(px2, py2);
          else ctx.lineTo(px2, py2);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * (0.08 + tension * 0.12) * entrance);
        ctx.lineWidth = px(STROKE.light * tension + STROKE.hairline, minDim);
        ctx.stroke();

        // Membrane inner refraction highlight
        if (tension > 0.3) {
          ctx.beginPath();
          const hiAngle = time * 0.3;
          const hiX = cx + Math.cos(hiAngle) * egoR * 0.5;
          const hiY = cy + Math.sin(hiAngle) * egoR * 0.5;
          const hiR = egoR * 0.4;
          const hi = ctx.createRadialGradient(hiX, hiY, 0, hiX, hiY, hiR);
          hi.addColorStop(0, rgba([255, 255, 255] as RGB, 0.02 * tension * entrance));
          hi.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
          ctx.fillStyle = hi;
          ctx.fillRect(hiX - hiR, hiY - hiR, hiR * 2, hiR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Dissolution bloom
      // ════════════════════════════════════════════════════
      if (dissolved > 0.1 && dissolved < 1) {
        const bloomR = egoR * (1 + dissolved * 2);
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * dissolved * entrance));
        bloom.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * dissolved * entrance));
        bloom.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bloom;
        ctx.fillRect(cx - bloomR, cy - bloomR, bloomR * 2, bloomR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Completion unified glow
      // ════════════════════════════════════════════════════
      if (s.completed) {
        for (let i = 0; i < 3; i++) {
          const haloPhase = (time * 0.05 + i * 0.33) % 1;
          const hR = px(0.1 + haloPhase * 0.35, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, hR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * (1 - haloPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Progress ───────────────────────────────────────
      if (!s.completed && s.tapCount > 0) {
        const progR = px(SIZE.xs, minDim);
        const prog = s.tapCount / TAPS_TO_DISSOLVE;
        ctx.beginPath();
        ctx.arc(cx, cy - px(EGO_R + 0.05, minDim), progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Tap to weaken surface tension ────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const dist = Math.sqrt(mx * mx + my * my);

      if (dist < EGO_R * 1.2 && s.surfaceTension > 0) {
        s.tapCount++;
        s.surfaceTension = Math.max(0, s.surfaceTension - TENSION_DROP);
        callbacksRef.current.onHaptic('tap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
