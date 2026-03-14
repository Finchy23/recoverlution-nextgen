/**
 * ATOM: STILL-POINT
 *
 * Particles orbit a luminous center in gravitational ellipses.
 * The field slowly settles, orbits tighten, speed decreases.
 * Touch anywhere and particles briefly scatter, then reorganize
 * more tightly around the still point.
 *
 * INTERACTION: Observe (watching IS the intervention)
 * RESOLVE: Field reaches natural stillness (orbit radius < threshold)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  pointerToCanvas, clamp,
} from './atom-utils';

const PARTICLE_COUNT = 80;
const SETTLE_RATE = 0.9978;
const SCATTER_FORCE = 8;
const SCATTER_RECOVERY = 0.97;
const CENTER_GLOW_BASE = 0.04;
const CENTER_GLOW_BREATH = 0.03;
const RESOLVE_THRESHOLD = 0.15;
const ORBIT_DAMPING = 0.998;

interface OrbitalParticle {
  angle: number;
  radius: number;
  angularVel: number;
  radialVel: number;
  size: number;
  brightness: number;
  phase: number;
}

function createParticles(w: number, h: number): OrbitalParticle[] {
  const minDim = Math.min(w, h);
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const baseRadius = minDim * (0.08 + Math.random() * 0.3);
    const speed = (0.003 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1);
    return {
      angle: Math.random() * Math.PI * 2,
      radius: baseRadius,
      angularVel: speed,
      radialVel: 0,
      size: 0.8 + Math.random() * 1.8,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

export default function StillPointAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({
    onHaptic: props.onHaptic,
    onStateChange: props.onStateChange,
    onResolve: props.onResolve,
  });
  const propsRef = useRef({
    breathAmplitude: props.breathAmplitude,
    reducedMotion: props.reducedMotion,
    phase: props.phase,
    color: props.color,
    accentColor: props.accentColor,
  });
  const stateRef = useRef({
    particles: [] as OrbitalParticle[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    resolved: false,
    resolveGlow: 0,
    avgRadius: 1,
    initialized: false,
  });

  useEffect(() => {
    cbRef.current = {
      onHaptic: props.onHaptic,
      onStateChange: props.onStateChange,
      onResolve: props.onResolve,
    };
  }, [props.onHaptic, props.onStateChange, props.onResolve]);

  useEffect(() => {
    propsRef.current = {
      breathAmplitude: props.breathAmplitude,
      reducedMotion: props.reducedMotion,
      phase: props.phase,
      color: props.color,
      accentColor: props.accentColor,
    };
  }, [props.breathAmplitude, props.reducedMotion, props.phase, props.color, props.accentColor]);

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(props.color);
    s.accentRgb = parseColor(props.accentColor);
  }, [props.color, props.accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = props.viewport.width;
    const h = props.viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;

    if (!s.initialized) {
      s.particles = createParticles(w, h);
      s.initialized = true;
    }

    const onDown = (e: PointerEvent) => {
      const pt = pointerToCanvas(e, canvas, w, h);
      cbRef.current.onHaptic('tap');
      for (const p of s.particles) {
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;
        const ddx = px - pt.x;
        const ddy = py - pt.y;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy) + 1;
        const force = SCATTER_FORCE * minDim / (dist * 10);
        p.radialVel += force * 0.3;
        p.angularVel += (Math.random() - 0.5) * 0.008;
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    let animId: number;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Center glow
      const breathPulse = CENTER_GLOW_BASE + p.breathAmplitude * CENTER_GLOW_BREATH;
      const centerR = minDim * 0.25;
      const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
      cGrad.addColorStop(0, rgba(s.accentRgb, breathPulse * entrance));
      cGrad.addColorStop(0.3, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.3), breathPulse * 0.4 * entrance));
      cGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cGrad;
      ctx.fillRect(cx - centerR, cy - centerR, centerR * 2, centerR * 2);

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.003, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, 0.5 * entrance);
      ctx.fill();

      // Update and render particles
      let totalRadius = 0;

      for (const pt of s.particles) {
        pt.radius *= SETTLE_RATE;

        if (!p.reducedMotion) {
          pt.radius += pt.radialVel;
          pt.radialVel *= SCATTER_RECOVERY;
          pt.angle += pt.angularVel;
          pt.angularVel *= ORBIT_DAMPING;
          const breathMod = 1 + (p.breathAmplitude - 0.5) * 0.1;
          pt.angle += pt.angularVel * breathMod * 0.1;
        }

        pt.radius = Math.max(minDim * 0.01, pt.radius);
        totalRadius += pt.radius;

        const px = cx + Math.cos(pt.angle) * pt.radius;
        const py = cy + Math.sin(pt.angle) * pt.radius;

        const shimmer = p.reducedMotion
          ? 0.8
          : 0.6 + 0.4 * Math.sin(s.frameCount * 0.015 + pt.phase);

        const distFrac = pt.radius / (minDim * 0.35);
        const distAlpha = clamp(1 - distFrac * 0.5, 0.2, 1);

        const pColor = lerpColor(s.primaryRgb, s.accentRgb, clamp(1 - distFrac, 0, 1) * 0.5);
        const alpha = pt.brightness * shimmer * distAlpha * entrance * 0.45;

        // Glow halo
        const glowR = pt.size * 4;
        const gGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        gGrad.addColorStop(0, rgba(pColor, alpha * 0.3));
        gGrad.addColorStop(0.4, rgba(pColor, alpha * 0.08));
        gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2);

        // Core
        ctx.beginPath();
        ctx.arc(px, py, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, alpha);
        ctx.fill();

        // Orbit trail
        if (!p.reducedMotion && pt.radius > minDim * 0.03) {
          ctx.beginPath();
          ctx.arc(cx, cy, pt.radius, pt.angle - 0.15, pt.angle, false);
          ctx.strokeStyle = rgba(s.primaryRgb, alpha * 0.08);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // State tracking
      s.avgRadius = totalRadius / PARTICLE_COUNT / (minDim * 0.35);
      const settledProgress = clamp(1 - s.avgRadius / 0.8, 0, 1);
      cb.onStateChange?.(settledProgress);

      // Resolution
      if (s.avgRadius < RESOLVE_THRESHOLD && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.006);
        const glowR = minDim * 0.35;
        const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        const pulse = 0.9 + 0.1 * Math.sin(s.frameCount * 0.015);
        rGrad.addColorStop(0, rgba(s.accentRgb, s.resolveGlow * 0.06 * pulse * entrance));
        rGrad.addColorStop(0.5, rgba(s.primaryRgb, s.resolveGlow * 0.02 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [props.viewport.width, props.viewport.height]);

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
