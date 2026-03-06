/**
 * ATOM 079: THE STARDUST ENGINE
 * ================================
 * Series 8 -- Kinematic Topology . Position 9
 *
 * You are not solid. You are particles temporarily holding a shape.
 * Tap the figure to break cohesion bonds. Watch yourself dissolve
 * into luminous, free-floating stardust.
 *
 * PHYSICS:
 *   - 2000 particles form a circular formation (cohesion bonds)
 *   - Tap severs bonds: particles decouple from formation
 *   - Freed particles drift outward in orbital dispersion
 *   - Each freed particle becomes luminous (alpha increase)
 *   - Hold to re-cohere (reverse -- optional)
 *
 * INTERACTION:
 *   Tap -> dissolve cohesion bonds
 *   Hold -> attempt re-cohesion (partial)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Instant dissolve, particles at final positions
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

/* ── particle shape ─────────────────────────────────────── */
const PARTICLE_COUNT = 2000;

interface Particle {
  /** Angle from center in formation */
  angle: number;
  /** Distance from center in formation (0-1 of formation radius) */
  rNorm: number;
  /** Random velocity x (viewport-relative fraction per frame) */
  vxFrac: number;
  /** Random velocity y (viewport-relative fraction per frame) */
  vyFrac: number;
  /** Tangential velocity fraction */
  vtFrac: number;
  /** Current actual x position (viewport px) */
  x: number;
  /** Current actual y position (viewport px) */
  y: number;
  /** Color blend factor 0-1 */
  colorT: number;
}

interface State {
  particles: Particle[];
  entranceProgress: number;
  dissolved: boolean;
  dispersion: number; // 0-1 how far dissolved
  holding: boolean;
  completionFired: boolean;
}

function initParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rNorm = Math.sqrt(Math.random()); // sqrt for uniform area dist
    particles.push({
      angle,
      rNorm,
      vxFrac: (Math.random() - 0.5) * 0.0006,
      vyFrac: (Math.random() - 0.5) * 0.0006,
      vtFrac: (Math.random() * 0.5 + 0.5) * 0.0003 * (Math.random() < 0.5 ? 1 : -1),
      x: 0,
      y: 0,
      colorT: i / PARTICLE_COUNT,
    });
  }
  return particles;
}

export default function StardustDissolveAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>({
    particles: initParticles(),
    entranceProgress: 0,
    dissolved: false,
    dispersion: 0,
    holding: false,
    completionFired: false,
  });

  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  /* ── interaction ─────────────────────────────────────── */

  /* ── render loop ─────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Native pointer handlers ─────────────────────────
    const onClick = () => {
      const s = stateRef.current;
      if (!s.dissolved) {
        s.dissolved = true;
        onHaptic('tap');
      }
    };
    const onDown = () => { stateRef.current.holding = true; };
    const onUp = () => { stateRef.current.holding = false; };

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);

    let raf = 0;

    const draw = () => {
      const p = propsRef.current;
      const s = stateRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Entrance
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Colors
      const primaryRgb = parseColor(p.color);
      const accentRgb = parseColor(p.accentColor);

      // Glass-floating background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(primaryRgb, ent * 0.015));
      bgGrad.addColorStop(0.6, rgba(primaryRgb, ent * 0.008));
      bgGrad.addColorStop(1, rgba(primaryRgb, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Formation radius (viewport-relative)
      const formationR = minDim * 0.08;
      const disperseR = minDim * 0.45; // max disperse radius

      // Update dispersion
      if (s.dissolved && !p.reducedMotion) {
        if (s.holding) {
          s.dispersion = Math.max(0, s.dispersion - 0.003);
        } else {
          s.dispersion = Math.min(1, s.dispersion + 0.004);
        }
      } else if (s.dissolved && p.reducedMotion) {
        s.dispersion = 1;
      }

      // Report state
      onStateChange?.(s.dispersion);

      // Check completion
      if (s.dispersion > 0.9 && !s.completionFired) {
        s.completionFired = true;
        onHaptic('completion');
      }

      // Breath modulation
      const breathMod = 1 + p.breathAmplitude * 0.05;

      // Draw particles
      const particles = s.particles;
      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i];

        // Formation position
        const formX = cx + Math.cos(pt.angle) * pt.rNorm * formationR * breathMod;
        const formY = cy + Math.sin(pt.angle) * pt.rNorm * formationR * breathMod;

        if (s.dissolved && s.dispersion > 0) {
          // Calculate dispersed position
          // Drift outward + tangential orbit
          const drift = s.dispersion * disperseR;
          const tangAngle = pt.angle + s.dispersion * pt.vtFrac * 600;
          const driftX = Math.cos(tangAngle) * (pt.rNorm * formationR + drift * (0.5 + pt.rNorm));
          const driftY = Math.sin(tangAngle) * (pt.rNorm * formationR + drift * (0.5 + pt.rNorm));
          // Add random velocity contribution
          const vDrift = s.dispersion * minDim;
          const freeX = cx + driftX + pt.vxFrac * vDrift;
          const freeY = cy + driftY + pt.vyFrac * vDrift;

          pt.x = formX + (freeX - formX) * s.dispersion;
          pt.y = formY + (freeY - formY) * s.dispersion;
        } else {
          pt.x = formX;
          pt.y = formY;
        }

        // Particle color: spectrum across swarm
        const particleColor = lerpColor(primaryRgb, accentRgb, pt.colorT);

        // Alpha: increases from packed to free
        const packedAlpha = ELEMENT_ALPHA.primary.min; // 0.04
        const freeAlpha = ELEMENT_ALPHA.primary.max;   // 0.12
        const alpha = (packedAlpha + (freeAlpha - packedAlpha) * s.dispersion) * ent;

        // Render as 1px rect for performance
        const size = minDim * 0.001 + s.dispersion * minDim * 0.001;
        ctx.fillStyle = rgba(particleColor, alpha);
        ctx.fillRect(pt.x - size * 0.5, pt.y - size * 0.5, size, size);
      }

      // Central glow (fades as particles disperse)
      if (s.dispersion < 1) {
        const glowAlpha = ELEMENT_ALPHA.glow.max * (1 - s.dispersion) * ent;
        const glowR = formationR * 1.5 * breathMod;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grad.addColorStop(0, rgba(lerpColor(primaryRgb, accentRgb, 0.3), glowAlpha));
        grad.addColorStop(1, rgba(primaryRgb, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
    };
  }, [viewport, onHaptic, onStateChange]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        cursor: 'pointer',
        touchAction: 'none',
      }}
    />
  );
}