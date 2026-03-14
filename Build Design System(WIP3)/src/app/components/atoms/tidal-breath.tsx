/**
 * ATOM: TIDAL-BREATH — The Rhythm Beneath
 * Approach: Engage — guide the body into a slower rhythm
 *
 * A luminous horizon line breathes across the center.
 * Below: dense bioluminescent particles flow in tidal currents.
 * Above: sparse particles drift like sky dust.
 * The system has its own breath rhythm — slightly slower than yours.
 * Match it. Let it pull you deeper.
 *
 * INTERACTION: Breath (entrainment)
 * RESOLVE: After system detects 3 matched breath cycles
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance,
  clamp,
} from './atom-utils';

const WATER_PARTICLES = 120;
const SKY_PARTICLES = 25;
const TIDE_PERIOD = 10;            // seconds for full tide cycle
const TIDE_AMPLITUDE = 0.08;       // fraction of height
const CURRENT_SPEED = 0.3;
const DRIFT_SPEED = 0.08;

interface TideParticle {
  x: number;
  baseY: number;       // relative to horizon (negative = above, positive = below)
  vx: number;
  size: number;
  brightness: number;
  phase: number;
  depthFactor: number; // 0-1, how deep below horizon
}

function createWaterParticles(w: number, h: number): TideParticle[] {
  return Array.from({ length: WATER_PARTICLES }, () => ({
    x: Math.random() * w,
    baseY: Math.random() * h * 0.42,
    vx: (CURRENT_SPEED + Math.random() * CURRENT_SPEED) * (Math.random() > 0.3 ? 1 : -1),
    size: 0.6 + Math.random() * 1.8,
    brightness: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    depthFactor: Math.random(),
  }));
}

function createSkyParticles(w: number, h: number): TideParticle[] {
  return Array.from({ length: SKY_PARTICLES }, () => ({
    x: Math.random() * w,
    baseY: -(Math.random() * h * 0.38),
    vx: (Math.random() - 0.5) * DRIFT_SPEED,
    size: 0.4 + Math.random() * 1.2,
    brightness: 0.15 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    depthFactor: 0,
  }));
}

export default function TidalBreathAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    water: [] as TideParticle[],
    sky: [] as TideParticle[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    time: 0,
    resolved: false,
    resolveGlow: 0,
    matchedCycles: 0,
    lastBreathPeak: false,
    initialized: false,
  });

  useEffect(() => { cbRef.current = { onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve }; }, [props.onHaptic, props.onStateChange, props.onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor }; }, [props.breathAmplitude, props.reducedMotion, props.phase, props.color, props.accentColor]);
  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(props.color); s.accentRgb = parseColor(props.accentColor); }, [props.color, props.accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = props.viewport.width, h = props.viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    if (!s.initialized) {
      s.water = createWaterParticles(w, h);
      s.sky = createSkyParticles(w, h);
      s.initialized = true;
    }

    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(50, now - lastTime) / 1000;
      lastTime = now;
      const p = propsRef.current, cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.time += dt;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Tide rhythm ──
      const tideCycle = (Math.sin(s.time * Math.PI * 2 / TIDE_PERIOD - Math.PI / 2) + 1) / 2;
      const tideOffset = (tideCycle - 0.5) * h * TIDE_AMPLITUDE;

      // Breath entrainment: detect when user breath peaks align with tide peaks
      const breathPeak = p.breathAmplitude > 0.7;
      const tidePeak = tideCycle > 0.85;
      if (breathPeak && tidePeak && !s.lastBreathPeak) {
        s.matchedCycles++;
        cb.onHaptic('breath_peak');
        if (s.matchedCycles >= 3 && !s.resolved) {
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }
      s.lastBreathPeak = breathPeak;
      cb.onStateChange?.(clamp(s.matchedCycles / 3, 0, 1));

      const horizonY = h * 0.48 + tideOffset;

      // ── Ocean gradient ──
      const oceanGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      oceanGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.2), 0.03 * entrance));
      oceanGrad.addColorStop(0.4, rgba(s.primaryRgb, 0.025 * entrance));
      oceanGrad.addColorStop(1, rgba(lerpColor(s.primaryRgb, [5, 8, 15] as RGB, 0.6), 0.015 * entrance));
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // ── Horizon line ──
      const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
      const lineAlpha = (0.06 + p.breathAmplitude * 0.04) * entrance;
      lineGrad.addColorStop(0, 'rgba(0,0,0,0)');
      lineGrad.addColorStop(0.15, rgba(s.accentRgb, lineAlpha * 0.3));
      lineGrad.addColorStop(0.5, rgba(s.accentRgb, lineAlpha));
      lineGrad.addColorStop(0.85, rgba(s.accentRgb, lineAlpha * 0.3));
      lineGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, horizonY - 0.5, w, 1);

      // Horizon glow
      const glowH = minDim * 0.05;
      const hGlow = ctx.createLinearGradient(0, horizonY - glowH, 0, horizonY + glowH);
      hGlow.addColorStop(0, 'rgba(0,0,0,0)');
      hGlow.addColorStop(0.5, rgba(s.accentRgb, 0.02 * entrance));
      hGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, horizonY - glowH, w, glowH * 2);

      // ── Water particles ──
      for (const pt of s.water) {
        if (!p.reducedMotion) {
          // Tidal current + depth-based speed
          pt.x += pt.vx * (1 + pt.depthFactor * 0.5);

          // Wrap horizontally
          if (pt.x < -10) pt.x = w + 10;
          if (pt.x > w + 10) pt.x = -10;
        }

        const py = horizonY + pt.baseY + Math.sin(s.time * 0.8 + pt.phase) * 2;
        const shimmer = p.reducedMotion ? 0.7 : 0.5 + 0.5 * Math.sin(s.time * 1.2 + pt.phase * 3);
        const depthAlpha = (1 - pt.depthFactor * 0.4) * pt.brightness * shimmer * entrance;

        // Bioluminescent glow
        const glowR = pt.size * 5;
        const gGrad = ctx.createRadialGradient(pt.x, py, 0, pt.x, py, glowR);
        gGrad.addColorStop(0, rgba(s.accentRgb, depthAlpha * 0.15));
        gGrad.addColorStop(0.3, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.4), depthAlpha * 0.05));
        gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(pt.x - glowR, py - glowR, glowR * 2, glowR * 2);

        // Core
        ctx.beginPath();
        ctx.arc(pt.x, py, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, depthAlpha * 0.5);
        ctx.fill();
      }

      // ── Sky particles ──
      for (const pt of s.sky) {
        if (!p.reducedMotion) {
          pt.x += pt.vx;
          if (pt.x < -5) pt.x = w + 5;
          if (pt.x > w + 5) pt.x = -5;
        }

        const py = horizonY + pt.baseY;
        const shimmer = p.reducedMotion ? 0.7 : 0.4 + 0.6 * Math.sin(s.time * 0.5 + pt.phase * 2);
        const alpha = pt.brightness * shimmer * entrance * 0.3;

        ctx.beginPath();
        ctx.arc(pt.x, py, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.accentRgb, [200, 210, 230] as RGB, 0.5), alpha);
        ctx.fill();
      }

      // ── Resolve glow ──
      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const rGrad = ctx.createLinearGradient(0, horizonY - minDim * 0.1, 0, horizonY + minDim * 0.1);
        rGrad.addColorStop(0, 'rgba(0,0,0,0)');
        rGrad.addColorStop(0.5, rgba(s.accentRgb, s.resolveGlow * 0.05 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, horizonY - minDim * 0.1, w, minDim * 0.2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); };
  }, [props.viewport.width, props.viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}