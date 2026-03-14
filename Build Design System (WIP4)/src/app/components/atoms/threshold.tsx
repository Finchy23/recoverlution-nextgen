/**
 * ATOM: THRESHOLD — The Crossing
 * Approach: Install schema — readiness, transformation
 *
 * A luminous horizontal threshold line at ~40% from top.
 * Below: dense, complex, swirling particles (the known).
 * Above: sparse, clear, gently drifting particles (the becoming).
 * Hold below the threshold and particles begin to migrate upward,
 * crossing through the line. Each particle that crosses transforms —
 * from dense/dark to light/luminous. Irreversible. Beautiful.
 *
 * INTERACTION: Hold (below the threshold)
 * RESOLVE: Majority of particles have crossed
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance, drawAtmosphere,
  pointerToCanvas, clamp,
} from './atom-utils';

const PARTICLE_COUNT = 80;
const THRESHOLD_Y_FRAC = 0.4;
const MIGRATE_SPEED = 0.4;
const RESOLVE_FRAC = 0.75;

interface CrossParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  brightness: number;
  phase: number;
  crossed: boolean;
  crossing: boolean;
  crossProgress: number;   // 0-1 transformation progress
}

function createParticles(w: number, h: number): CrossParticle[] {
  const thresholdY = h * THRESHOLD_Y_FRAC;
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const y = thresholdY + 20 + Math.random() * (h * 0.5);
    return {
      x: w * 0.1 + Math.random() * w * 0.8,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      size: 1 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      crossed: false,
      crossing: false,
      crossProgress: 0,
    };
  });
}

export default function ThresholdAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    particles: [] as CrossParticle[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    holding: false,
    holdX: 0, holdY: 0,
    crossedCount: 0,
    resolved: false,
    resolveGlow: 0,
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
    const cx = w / 2;
    const thresholdY = h * THRESHOLD_Y_FRAC;

    if (!s.initialized) { s.particles = createParticles(w, h); s.initialized = true; }

    const onDown = (e: PointerEvent) => {
      const pt = pointerToCanvas(e, canvas, w, h);
      // Must hold below the threshold
      if (pt.y > thresholdY) {
        s.holding = true;
        s.holdX = pt.x; s.holdY = pt.y;
        cbRef.current.onHaptic('hold_start');
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!s.holding) return;
      const pt = pointerToCanvas(e, canvas, w, h);
      s.holdX = pt.x; s.holdY = pt.y;
    };
    const onUp = (e: PointerEvent) => { s.holding = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // Atmosphere
      drawAtmosphere(ctx, cx, h * 0.45, w, h, minDim, s.primaryRgb, entrance);

      // ── Above threshold — clear, luminous ──
      const aboveGrad = ctx.createLinearGradient(0, 0, 0, thresholdY);
      aboveGrad.addColorStop(0, rgba(s.accentRgb, 0.008 * entrance));
      aboveGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aboveGrad;
      ctx.fillRect(0, 0, w, thresholdY);

      // ── Below threshold — dense, complex ──
      const belowGrad = ctx.createLinearGradient(0, thresholdY, 0, h);
      belowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      belowGrad.addColorStop(0.5, rgba(s.primaryRgb, 0.015 * entrance));
      belowGrad.addColorStop(1, rgba(lerpColor(s.primaryRgb, [15, 12, 8] as RGB, 0.5), 0.02 * entrance));
      ctx.fillStyle = belowGrad;
      ctx.fillRect(0, thresholdY, w, h - thresholdY);

      // ── Threshold line ──
      const lineAlpha = (0.05 + p.breathAmplitude * 0.03) * entrance;
      const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
      lineGrad.addColorStop(0, 'rgba(0,0,0,0)');
      lineGrad.addColorStop(0.12, rgba(s.accentRgb, lineAlpha * 0.3));
      lineGrad.addColorStop(0.5, rgba(s.accentRgb, lineAlpha));
      lineGrad.addColorStop(0.88, rgba(s.accentRgb, lineAlpha * 0.3));
      lineGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, thresholdY - 0.5, w, 1);

      // Threshold glow
      const tGlow = minDim * 0.03;
      const tGrad = ctx.createLinearGradient(0, thresholdY - tGlow, 0, thresholdY + tGlow);
      tGrad.addColorStop(0, 'rgba(0,0,0,0)');
      tGrad.addColorStop(0.5, rgba(s.accentRgb, 0.015 * entrance));
      tGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tGrad;
      ctx.fillRect(0, thresholdY - tGlow, w, tGlow * 2);

      // ── Update particles ──
      let crossed = 0;

      for (const pt of s.particles) {
        if (pt.crossed) {
          crossed++;
          // Above threshold — gentle drift
          if (!p.reducedMotion) {
            pt.vx += (Math.random() - 0.5) * 0.03;
            pt.vy += (Math.random() - 0.5) * 0.02 - 0.01; // drift up
            pt.vx *= 0.99; pt.vy *= 0.99;
            pt.x += pt.vx; pt.y += pt.vy;
            // Keep above threshold
            if (pt.y > thresholdY - 10) pt.vy -= 0.05;
            if (pt.y < 10) pt.vy += 0.02;
            if (pt.x < 10) pt.vx += 0.1; if (pt.x > w - 10) pt.vx -= 0.1;
          }

          // Transformed appearance
          pt.crossProgress = Math.min(1, pt.crossProgress + 0.02);
          const shimmer = p.reducedMotion ? 0.8 : 0.6 + 0.4 * Math.sin(s.frameCount * 0.01 + pt.phase);
          const alpha = pt.brightness * shimmer * entrance * 0.5;
          const pColor = lerpColor(s.primaryRgb, s.accentRgb, pt.crossProgress);

          const glowR = pt.size * (4 + pt.crossProgress * 3);
          const gGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
          gGrad.addColorStop(0, rgba(pColor, alpha * 0.25));
          gGrad.addColorStop(0.4, rgba(s.accentRgb, alpha * 0.06));
          gGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gGrad;
          ctx.fillRect(pt.x - glowR, pt.y - glowR, glowR * 2, glowR * 2);

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * (0.6 + pt.crossProgress * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = rgba(pColor, alpha * 0.5);
          ctx.fill();

        } else if (pt.crossing) {
          // Migrating upward through threshold — state change, always runs
          pt.y -= MIGRATE_SPEED;
          if (pt.y < thresholdY) {
            pt.crossed = true;
            pt.crossing = false;
          }

          // Transition appearance
          const frac = clamp((thresholdY - pt.y + 30) / 60, 0, 1);
          const pColor = lerpColor(s.primaryRgb, s.accentRgb, frac);
          const alpha = pt.brightness * entrance * 0.4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba(pColor, alpha);
          ctx.fill();

        } else {
          // Below threshold — swirling
          if (!p.reducedMotion) {
            pt.vx += (Math.random() - 0.5) * 0.15;
            pt.vy += (Math.random() - 0.5) * 0.1;
            pt.vx *= 0.97; pt.vy *= 0.97;
            pt.x += pt.vx; pt.y += pt.vy;
            // Keep below threshold
            if (pt.y < thresholdY + 10) pt.vy += 0.1;
            if (pt.y > h - 10) pt.vy -= 0.1;
            if (pt.x < 10) pt.vx += 0.1; if (pt.x > w - 10) pt.vx -= 0.1;
          }

          // Start migrating if held nearby
          if (s.holding) {
            const dx = pt.x - s.holdX, dy = pt.y - s.holdY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDim * 0.15 && Math.random() < 0.02) {
              pt.crossing = true;
              pt.vx = 0; pt.vy = 0;
            }
          }

          // Dense appearance
          const shimmer = p.reducedMotion ? 0.6 : 0.4 + 0.3 * Math.sin(s.frameCount * 0.015 + pt.phase);
          const alpha = pt.brightness * shimmer * entrance * 0.25;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, alpha);
          ctx.fill();
        }
      }

      s.crossedCount = crossed;
      cb.onStateChange?.(clamp(crossed / (PARTICLE_COUNT * RESOLVE_FRAC), 0, 1));

      // ── Resolution ──
      if (crossed >= PARTICLE_COUNT * RESOLVE_FRAC && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const rGrad = ctx.createLinearGradient(0, 0, 0, thresholdY);
        rGrad.addColorStop(0, rgba(s.accentRgb, s.resolveGlow * 0.03 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, 0, w, thresholdY);
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
  }, [props.viewport.width, props.viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}