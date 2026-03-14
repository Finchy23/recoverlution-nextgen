/**
 * ATOM: CYMATIC COHERENCE — Sound Made Visible
 * Series 5 — Chrono-Acoustic · Frequency visualization
 *
 * A field of particles arranged on a vibrating membrane.
 * Breath drives the frequency — low breath = chaotic,
 * high breath = particles snap into beautiful geometric patterns.
 * The Chladni plate of the nervous system.
 *
 * INTERACTION: Breath (frequency/order) · Drag (shift pattern)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB, ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';

const PARTICLE_COUNT = 180;

interface CymaticParticle {
  x: number; y: number;
  targetX: number; targetY: number;
  vx: number; vy: number;
  size: number; brightness: number;
  phase: number;
}

const CHAOS_COLOR: RGB = [90, 60, 120];
const ORDER_COLOR: RGB = [160, 200, 255];
const NODE_GLOW: RGB = [180, 220, 255];

function generatePattern(w: number, h: number, mode: number, count: number): { x: number; y: number }[] {
  const cx = w / 2, cy = h / 2, minDim = Math.min(w, h);
  const points: { x: number; y: number }[] = [];
  const lobes = 3 + Math.floor(mode * 5); // 3-8 lobes based on breath
  const gridSize = Math.max(1, Math.ceil(Math.sqrt(count)));

  for (let i = 0; i < count; i++) {
    const n1 = lobes, n2 = lobes + 1;
    const gridX = (i % gridSize) / gridSize;
    const gridY = Math.floor(i / gridSize) / gridSize;
    const chladni = Math.sin(n1 * gridX * Math.PI) * Math.sin(n2 * gridY * Math.PI);
    const nodeAngle = Math.atan2(gridY - 0.5, gridX - 0.5);
    const nodeDist = Math.abs(chladni) * minDim * 0.3;

    points.push({
      x: cx + Math.cos(nodeAngle) * nodeDist + (gridX - 0.5) * minDim * 0.15,
      y: cy + Math.sin(nodeAngle) * nodeDist + (gridY - 0.5) * minDim * 0.15,
    });
  }
  return points;
}

function createParticles(w: number, h: number): CymaticParticle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const x = w * 0.15 + Math.random() * w * 0.7;
    const y = h * 0.15 + Math.random() * h * 0.7;
    return {
      x, y, targetX: x, targetY: y,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 2, brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

export default function CymaticCoherenceAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    particles: [] as CymaticParticle[],
    smoothBreath: 0, coherence: 0,
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = viewport.width, h = viewport.height, s = stateRef.current;
    const minDim = Math.min(w, h);

    if (!s.initialized) { s.particles = createParticles(w, h); s.initialized = true; }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h); s.frameCount++;

      if (s.entranceProgress < 1) s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      const entrance = easeOutExpo(s.entranceProgress);

      s.smoothBreath += (p.breathAmplitude - s.smoothBreath) * 0.08;

      // Generate target pattern based on breath
      const pattern = generatePattern(w, h, s.smoothBreath, PARTICLE_COUNT);

      // Update targets
      for (let i = 0; i < s.particles.length; i++) {
        if (i < pattern.length) {
          s.particles[i].targetX = pattern[i].x;
          s.particles[i].targetY = pattern[i].y;
        }
      }

      // Coherence: how close particles are to their targets
      let totalDist = 0;

      for (const pt of s.particles) {
        const pullStrength = 0.02 + s.smoothBreath * 0.06; // Stronger pull with more breath
        const brownian = (1 - s.smoothBreath) * 0.4; // More chaos with less breath

        pt.vx += (pt.targetX - pt.x) * pullStrength;
        pt.vy += (pt.targetY - pt.y) * pullStrength;

        if (!p.reducedMotion) {
          pt.vx += (Math.random() - 0.5) * brownian;
          pt.vy += (Math.random() - 0.5) * brownian;
        }

        pt.vx *= 0.92; pt.vy *= 0.92;
        pt.x += pt.vx; pt.y += pt.vy;
        pt.phase += 0.015;

        totalDist += Math.hypot(pt.x - pt.targetX, pt.y - pt.targetY);
      }

      s.coherence = 1 - Math.min(1, totalDist / (PARTICLE_COUNT * minDim * 0.15));
      cb.onStateChange?.(s.coherence);

      // Background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.5);
      bgGrad.addColorStop(0, rgba(lerpColor([6, 4, 12], s.primaryRgb, 0.03), entrance * 0.025));
      bgGrad.addColorStop(1, rgba([3, 2, 6], 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Membrane visualization — faint circular boundary
      const memR = minDim * 0.35;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, memR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(lerpColor(ORDER_COLOR, s.primaryRgb, 0.15), 0.02 * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Particles
      for (const pt of s.particles) {
        const shimmer = p.reducedMotion ? 0.8 : 0.6 + 0.4 * Math.sin(pt.phase);
        const distToTarget = Math.hypot(pt.x - pt.targetX, pt.y - pt.targetY);
        const ordered = 1 - Math.min(1, distToTarget / (minDim * 0.1));

        const pColor = lerpColor(
          lerpColor(CHAOS_COLOR, s.primaryRgb, 0.15),
          lerpColor(ORDER_COLOR, s.accentRgb, 0.1),
          ordered * s.smoothBreath,
        );
        const alpha = pt.brightness * shimmer * entrance * (0.08 + ordered * 0.25);
        if (alpha < 0.005) continue;

        // Glow when ordered
        if (ordered > 0.5) {
          const glowR = pt.size * (2 + ordered * 3);
          const gGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
          gGrad.addColorStop(0, rgba(NODE_GLOW, alpha * 0.1 * ordered));
          gGrad.addColorStop(1, rgba(NODE_GLOW, 0));
          ctx.fillStyle = gGrad; ctx.fillRect(pt.x - glowR, pt.y - glowR, glowR * 2, glowR * 2);
        }

        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * (0.5 + ordered * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, alpha); ctx.fill();

        // Connection lines between nearby ordered particles
        if (ordered > 0.6 && s.coherence > 0.3) {
          for (const other of s.particles) {
            if (other === pt) continue;
            const d = Math.hypot(pt.x - other.x, pt.y - other.y);
            if (d < minDim * 0.05 && d > 3) {
              ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = rgba(ORDER_COLOR, alpha * 0.05 * s.coherence);
              ctx.lineWidth = 0.3; ctx.stroke();
              break; // One connection per particle to avoid clutter
            }
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}