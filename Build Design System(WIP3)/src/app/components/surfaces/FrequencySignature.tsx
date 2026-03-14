/**
 * FREQUENCY SIGNATURE — Three Sonic Identity Animations
 *
 * Each frequency has a unique canvas-based particle system
 * that expresses its essential sonic character:
 *
 *   DRIVE — Kinetic pulse: sharp angular trajectories with rhythmic
 *           burst patterns. The visual heartbeat of high BPM.
 *           Particles accelerate, collide, leave motion trails.
 *
 *   FOCUS — Steady orbit: layered concentric flows with sustained
 *           rotational symmetry. The geometry of grounded attention.
 *           Particles hold formation, breathe together.
 *
 *   DRIFT — Ambient descent: slow falling particles with long tails,
 *           dissolving into atmospheric haze. The shape of letting go.
 *           Particles fade, stretch, disappear.
 *
 * These are NOT decorative. They ARE the frequency.
 * The animation runs behind the sonic field on the PLAY surface.
 *
 * Color mapping (from hero-primary palette):
 *   DRIVE — #FFB677 (warm orange, kinetic energy)
 *   FOCUS — #00CCE0 (teal, grounding clarity)
 *   DRIFT — #A78BFA (violet, parasympathetic descent)
 */

import { useEffect, useRef } from 'react';
import { colors, signal } from '../design-system/surface-tokens';

// ─── Types ───

export type FrequencyId = 'drive' | 'focus' | 'drift';

// ─── Color palette per frequency ───

export const FREQUENCY_COLORS: Record<FrequencyId, { h: number; s: number; l: number; hex: string }> = {
  drive: { h: 28,  s: 100, l: 73, hex: colors.status.amber.bright },
  focus: { h: 188, s: 100, l: 44, hex: colors.accent.cyan.primary },
  drift: { h: 263, s: 85,  l: 70, hex: signal.drift },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  life: number;
  age: number;
}

// ─── DRIVE: Kinetic pulse ───

function drawDrive(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  const cx = w / 2;
  const cy = h / 2;

  // Pulsing core — rhythmic heartbeat
  const beatPhase = (time * 0.003) % (Math.PI * 2);
  const beatPulse = Math.pow(Math.max(0, Math.sin(beatPhase)), 3); // sharp spike

  // Radial burst lines on beat
  if (beatPulse > 0.3) {
    const burstAlpha = beatPulse * 0.06;
    const burstRadius = beatPulse * Math.min(w, h) * 0.5;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time * 0.0002;
      const innerR = 20 + beatPulse * 10;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * burstRadius, cy + Math.sin(angle) * burstRadius);
      ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${burstAlpha})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }

  // Core glow on beat
  const coreRadius = 15 + beatPulse * 25;
  const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
  coreGlow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${0.05 + beatPulse * 0.06})`);
  coreGlow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
  ctx.fillStyle = coreGlow;
  ctx.fill();

  // Particles — kinetic, angular, fast
  for (const p of particles) {
    // Angular acceleration with randomized jitter
    p.vx += (Math.random() - 0.5) * 0.2 + Math.sin(time * 0.002 + p.phase) * 0.05;
    p.vy += (Math.random() - 0.5) * 0.2 + Math.cos(time * 0.002 + p.phase) * 0.05;

    // Beat kick — particles get a burst of energy on beat
    if (beatPulse > 0.6) {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      p.vx += (dx / d) * beatPulse * 0.8;
      p.vy += (dy / d) * beatPulse * 0.8;
    }

    // Damping
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.x += p.vx;
    p.y += p.vy;

    // Gravity back to center (loose)
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 30) {
      p.vx += dx / dist * 0.06;
      p.vy += dy / dist * 0.06;
    }

    // Wrap edges
    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const a = 0.06 + Math.min(speed * 0.04, 0.18);
    const r = p.radius * (0.6 + speed * 0.1);

    // Motion trail
    const trailLen = Math.min(speed * 5, 24);
    if (trailLen > 2) {
      const nx = -p.vx / (speed || 1);
      const ny = -p.vy / (speed || 1);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + nx * trailLen, p.y + ny * trailLen);
      ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.25})`;
      ctx.lineWidth = r * 0.5;
      ctx.stroke();
    }

    // Particle
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a})`;
    ctx.fill();
  }
}

// ─── FOCUS: Steady orbit ───

function drawFocus(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.38;

  // Concentric orbit rings — steady, breathing
  for (let i = 0; i < 5; i++) {
    const ringR = maxR * (0.25 + i * 0.18);
    const breathe = Math.sin(time * 0.0006 + i * 0.8) * 0.5 + 0.5;
    const alpha = 0.02 + breathe * 0.02;

    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${alpha})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // Particles orbit at fixed radii — sustained, grounded
  for (const p of particles) {
    const orbitR = 30 + p.phase * maxR * 0.85;
    const speed = 0.0003 * (0.4 + p.phase * 0.6);
    const angle = time * speed + p.life;
    const breathe = Math.sin(time * 0.0008 + p.phase * Math.PI * 2) * 0.5 + 0.5;

    // Slight radial oscillation
    const radialOsc = Math.sin(time * 0.0005 + p.life * 2) * 8;
    const targetX = cx + Math.cos(angle) * (orbitR + radialOsc);
    const targetY = cy + Math.sin(angle) * (orbitR + radialOsc);

    p.x += (targetX - p.x) * 0.04;
    p.y += (targetY - p.y) * 0.04;

    const r = p.radius * (0.7 + breathe * 0.3);
    const a = 0.06 + breathe * 0.08;

    // Soft glow
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
    glow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.2})`);
    glow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a})`;
    ctx.fill();
  }

  // Connection lines between nearby particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 60) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${(1 - d / 60) * 0.025})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }
  }

  // Center glow — grounding point
  const breathe = Math.sin(time * 0.0005) * 0.5 + 0.5;
  const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25 + breathe * 10);
  centerGlow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${0.03 + breathe * 0.02})`);
  centerGlow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, 25 + breathe * 10, 0, Math.PI * 2);
  ctx.fillStyle = centerGlow;
  ctx.fill();
}

// ─── DRIFT: Ambient descent ───

function drawDrift(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  // Atmospheric haze layers — barely there
  for (let layer = 0; layer < 3; layer++) {
    const yCenter = h * (0.3 + layer * 0.2);
    const amplitude = 80 + layer * 40;
    const speed = time * (0.0001 + layer * 0.00005);
    const alpha = 0.015 - layer * 0.003;

    ctx.beginPath();
    ctx.moveTo(0, yCenter);
    for (let x = 0; x <= w; x += 4) {
      const y = yCenter + Math.sin(x * 0.002 + speed) * amplitude
        + Math.sin(x * 0.005 + speed * 1.3) * amplitude * 0.3;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Particles — slow descent, fading, stretching
  for (const p of particles) {
    // Gentle downward drift with horizontal sway
    p.vy += 0.005;
    p.vx += Math.sin(time * 0.0003 + p.phase * 5) * 0.008;
    p.vx *= 0.995;
    p.vy *= 0.995;
    p.x += p.vx;
    p.y += p.vy;
    p.age += 0.002;

    // Reset at bottom
    if (p.y > h + 30 || p.age > 1) {
      p.y = -20 - Math.random() * 40;
      p.x = Math.random() * w;
      p.vy = 0.1 + Math.random() * 0.2;
      p.vx = (Math.random() - 0.5) * 0.3;
      p.age = 0;
    }

    // Fade with age and height
    const heightFade = Math.min(1, (h - p.y) / h + 0.3);
    const ageFade = 1 - p.age;
    const a = 0.04 + ageFade * heightFade * 0.1;
    const r = p.radius * (0.8 + (1 - ageFade) * 0.8); // grow as they fade

    // Long vertical trail — the shape of descent
    const trailLen = 8 + (1 - ageFade) * 20;
    const trailGrad = ctx.createLinearGradient(p.x, p.y - trailLen, p.x, p.y);
    trailGrad.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
    trailGrad.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.3})`);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - trailLen);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = r * 0.4;
    ctx.stroke();

    // Soft expanding glow
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 7);
    glow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.15})`);
    glow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 7, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a})`;
    ctx.fill();
  }

  // Bottom atmospheric haze
  const hazeGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
  hazeGrad.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
  hazeGrad.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0.015)`);
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
}

// ─── Dispatch ───

const DRAW_FN: Record<FrequencyId, typeof drawDrive> = {
  drive: drawDrive,
  focus: drawFocus,
  drift: drawDrift,
};

const PARTICLE_COUNT: Record<FrequencyId, number> = {
  drive: 50,
  focus: 35,
  drift: 40,
};

// ─── Component ───

interface FrequencySignatureProps {
  frequency: FrequencyId;
  /** 0-1 intensity multiplier */
  intensity?: number;
  /** Is audio currently playing? Affects animation energy */
  playing?: boolean;
}

export function FrequencySignature({ frequency, intensity = 1, playing = false }: FrequencySignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const dimsRef = useRef({ w: 0, h: 0 });
  const initedRef = useRef<FrequencyId | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dimsRef.current = { w: rect.width, h: rect.height };
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles(w: number, h: number) {
      const count = PARTICLE_COUNT[frequency] || 35;
      const cx = w / 2;
      const cy = h / 2;

      particlesRef.current = Array.from({ length: count }, () => ({
        x: cx + (Math.random() - 0.5) * w * 0.8,
        y: cy + (Math.random() - 0.5) * h * 0.8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 0.8 + Math.random() * 2,
        phase: Math.random(),
        life: Math.random() * Math.PI * 2,
        age: Math.random() * 0.5,
      }));
      initedRef.current = frequency;
    }

    resize();
    if (initedRef.current !== frequency) {
      initParticles(dimsRef.current.w, dimsRef.current.h);
    }

    const drawFn = DRAW_FN[frequency] || drawFocus;
    const col = FREQUENCY_COLORS[frequency] || FREQUENCY_COLORS.focus;

    function draw(time: number) {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);

      // Playing state gives more energy
      const effectiveIntensity = playing ? intensity * 1.2 : intensity * 0.7;
      ctx.globalAlpha = Math.min(1, effectiveIntensity);
      drawFn(ctx, particlesRef.current, w, h, time, col);
      ctx.globalAlpha = 1;

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      initParticles(dimsRef.current.w, dimsRef.current.h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [frequency, intensity, playing]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none', pointerEvents: 'none' }}
    />
  );
}