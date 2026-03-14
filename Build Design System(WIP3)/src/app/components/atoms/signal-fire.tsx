/**
 * ATOM: SIGNAL-FIRE — The Pattern in the Noise
 * Approach: Provoke thought — stop trying. The pattern reveals itself.
 *
 * Dense particle field with random Brownian motion (noise).
 * Hidden within: a slow breathing spiral that emerges and fades.
 * Over time the noise particles decelerate, making the signal
 * more visible. No touch needed — observation IS the intervention.
 *
 * INTERACTION: Observe (patience reveals)
 * RESOLVE: Signal-to-noise ratio crosses clarity threshold
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance, drawAtmosphere,
  clamp,
} from './atom-utils';

const NOISE_COUNT = 140;
const SIGNAL_COUNT = 35;
const NOISE_DECAY = 0.9984;        // Noise slows over time — signal visible ~7s, resolves ~14s
const SPIRAL_SPEED = 0.0004;
const CLARITY_THRESHOLD = 0.75;

interface NoiseParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  brightness: number;
  phase: number;
  energy: number;          // 1 = full noise, decays toward 0
}

interface SignalParticle {
  angle: number;            // position on spiral
  radiusFrac: number;       // 0-1 distance from center
  size: number;
  brightness: number;
  phase: number;
}

function createNoise(w: number, h: number): NoiseParticle[] {
  return Array.from({ length: NOISE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 2.5,
    vy: (Math.random() - 0.5) * 2.5,
    size: 0.5 + Math.random() * 1.5,
    brightness: 0.2 + Math.random() * 0.4,
    phase: Math.random() * Math.PI * 2,
    energy: 1,
  }));
}

function createSignal(): SignalParticle[] {
  return Array.from({ length: SIGNAL_COUNT }, (_, i) => ({
    angle: (i / SIGNAL_COUNT) * Math.PI * 6 + Math.random() * 0.3, // 3 spiral turns
    radiusFrac: i / SIGNAL_COUNT,
    size: 0.8 + Math.random() * 1.2,
    brightness: 0.5 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
  }));
}

export default function SignalFireAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    noise: [] as NoiseParticle[],
    signal: [] as SignalParticle[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    spiralAngle: 0,
    clarity: 0,
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
    const cx = w / 2, cy = h / 2;

    if (!s.initialized) {
      s.noise = createNoise(w, h);
      s.signal = createSignal();
      s.initialized = true;
    }

    let animId: number;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Spiral rotates
      if (!p.reducedMotion) s.spiralAngle += SPIRAL_SPEED;

      // ── Update noise ──
      let avgEnergy = 0;
      for (const n of s.noise) {
        // Energy decay is state, not animation — always runs
        n.energy *= NOISE_DECAY;

        if (!p.reducedMotion) {
          n.vx += (Math.random() - 0.5) * 0.3 * n.energy;
          n.vy += (Math.random() - 0.5) * 0.3 * n.energy;
          n.vx *= 0.96;
          n.vy *= 0.96;
          n.x += n.vx * n.energy;
          n.y += n.vy * n.energy;

          // Wrap
          if (n.x < 0) n.x += w;
          if (n.x > w) n.x -= w;
          if (n.y < 0) n.y += h;
          if (n.y > h) n.y -= h;
        }
        avgEnergy += n.energy;
      }
      avgEnergy /= NOISE_COUNT;

      // Clarity = inverse of noise energy
      s.clarity = clamp(1 - avgEnergy, 0, 1);
      cb.onStateChange?.(s.clarity);

      // ── Render noise ──
      for (const n of s.noise) {
        const shimmer = p.reducedMotion ? 0.7 : 0.5 + 0.5 * Math.sin(s.frameCount * 0.02 + n.phase);
        const alpha = n.brightness * shimmer * n.energy * entrance * 0.3;
        if (alpha < 0.005) continue;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.primaryRgb, [60, 50, 80] as RGB, 0.3), alpha);
        ctx.fill();
      }

      // ── Render signal (spiral) ──
      const signalAlpha = clamp(s.clarity * 2 - 0.3, 0, 1); // fades in as noise clears
      const spiralR = minDim * 0.28;

      if (signalAlpha > 0.01) {
        for (let i = 0; i < s.signal.length; i++) {
          const sp = s.signal[i];
          const angle = sp.angle + s.spiralAngle;
          const r = sp.radiusFrac * spiralR;
          const sx = cx + Math.cos(angle) * r;
          const sy = cy + Math.sin(angle) * r;

          const breathPulse = p.reducedMotion ? 0.85 : 0.7 + 0.3 * Math.sin(s.frameCount * 0.015 + sp.phase);
          const alpha = sp.brightness * signalAlpha * breathPulse * entrance * 0.5;

          // Signal glow
          const glowR = sp.size * 5;
          const gGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
          gGrad.addColorStop(0, rgba(s.accentRgb, alpha * 0.3));
          gGrad.addColorStop(0.4, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), alpha * 0.08));
          gGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gGrad;
          ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);

          // Core
          ctx.beginPath();
          ctx.arc(sx, sy, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, alpha * 0.6);
          ctx.fill();

          // Spiral connections
          if (i > 0) {
            const prev = s.signal[i - 1];
            const pa = prev.angle + s.spiralAngle;
            const pr = prev.radiusFrac * spiralR;
            const px = cx + Math.cos(pa) * pr;
            const py = cy + Math.sin(pa) * pr;

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = rgba(s.accentRgb, alpha * 0.08);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // ── Resolution ──
      if (s.clarity > CLARITY_THRESHOLD && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const rR = minDim * 0.35;
        const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rR);
        rGrad.addColorStop(0, rgba(s.accentRgb, s.resolveGlow * 0.05 * entrance));
        rGrad.addColorStop(0.5, rgba(s.primaryRgb, s.resolveGlow * 0.02 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(cx - rR, cy - rR, rR * 2, rR * 2);
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