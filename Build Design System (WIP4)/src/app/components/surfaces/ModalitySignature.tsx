/**
 * MODALITY SIGNATURE — Five Identity Animations
 *
 * Each modality has a unique canvas-based particle system
 * that expresses its essential character:
 *
 *   FLOW (yoga)        — Sine-river: particles flow in layered sine waves,
 *                         like watching water from below the surface
 *   MOVE (fitness)     — Kinetic burst: sharp angular trajectories,
 *                         particles that accelerate and collide
 *   FUEL (nourishment) — Rising warmth: gentle upward drift like steam
 *                         from a cup, slow and nurturing
 *   HOLD (meditation)  — Concentric ripples: expanding circles from center,
 *                         the geometry of stillness
 *   RISE (breathwork)  — Breath cycle: particles expand and contract
 *                         in a rhythmic pulse, the shape of inhale/exhale
 *
 * These are NOT decorative. They ARE the modality.
 * The animation runs behind the practice title on the discovery surface.
 *
 * Used by:
 *   TuneSurface — full-viewport background behind practice presentation
 *   PlaySurface — (planned) same-but-different tuner for audio/music content
 *
 * Each draw function receives a particle array, canvas dimensions, elapsed
 * time, and the modality's HSL color. Particle counts are tuned per modality
 * to balance visual density with 60fps performance.
 */

import { useEffect, useRef } from 'react';
import type { ModalityId } from '../runtime/useContentVideos';

// ─── Color palette per modality ───

const MODALITY_COLORS: Record<ModalityId, { h: number; s: number; l: number }> = {
  yoga:        { h: 157, s: 72, l: 56 },  // FLOW — teal-green
  fitness:     { h: 28,  s: 100, l: 73 }, // MOVE — warm orange
  nourishment: { h: 252, s: 90, l: 96 },  // FUEL — warm white
  meditation:  { h: 263, s: 85, l: 70 },  // HOLD — violet
  breathwork:  { h: 188, s: 100, l: 44 }, // RISE — cyan
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  life: number;
}

// ─── FLOW: Sine-river ───

function drawFlow(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  const cx = w / 2;
  const cy = h / 2;

  // Draw flowing sine layers
  for (let layer = 0; layer < 4; layer++) {
    const layerOffset = layer * 0.7;
    const amplitude = 30 + layer * 18;
    const frequency = 0.003 + layer * 0.001;
    const speed = time * (0.0004 + layer * 0.00012);
    const alpha = 0.03 - layer * 0.005;

    ctx.beginPath();
    ctx.moveTo(0, cy);
    for (let x = 0; x <= w; x += 3) {
      const y = cy + Math.sin(x * frequency + speed + layerOffset) * amplitude
        + Math.sin(x * frequency * 2.3 + speed * 1.7 + layerOffset) * amplitude * 0.3;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Particles flow along the sine
  for (const p of particles) {
    p.x += p.vx;
    if (p.x > w + 20) { p.x = -20; p.y = cy + (Math.random() - 0.5) * h * 0.6; }
    if (p.x < -20) { p.x = w + 20; p.y = cy + (Math.random() - 0.5) * h * 0.6; }

    const sineY = Math.sin(p.x * 0.004 + time * 0.0005 + p.phase) * 40;
    p.y += (cy + sineY - p.y) * 0.02;

    const pulse = Math.sin(time * 0.001 + p.phase) * 0.5 + 0.5;
    const r = p.radius * (0.6 + pulse * 0.4);
    const a = 0.08 + pulse * 0.12;

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 5);
    glow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.3})`);
    glow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 5, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a})`;
    ctx.fill();
  }
}

// ─── MOVE: Kinetic burst ───

function drawMove(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  const cx = w / 2;
  const cy = h / 2;

  for (const p of particles) {
    // Angular trajectories with acceleration
    p.vx += (Math.random() - 0.5) * 0.15;
    p.vy += (Math.random() - 0.5) * 0.15;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.x += p.vx;
    p.y += p.vy;

    // Gravity toward center
    const dx = cx - p.x;
    const dy = cy - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 10) {
      p.vx += dx / dist * 0.08;
      p.vy += dy / dist * 0.08;
    }

    // Bounce off edges
    if (p.x < 0 || p.x > w) p.vx *= -0.8;
    if (p.y < 0 || p.y > h) p.vy *= -0.8;
    p.x = Math.max(0, Math.min(w, p.x));
    p.y = Math.max(0, Math.min(h, p.y));

    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const a = 0.06 + Math.min(speed * 0.04, 0.2);
    const r = p.radius * (0.5 + speed * 0.15);

    // Motion trail
    const trailLen = Math.min(speed * 4, 20);
    if (trailLen > 2) {
      const nx = -p.vx / (speed || 1);
      const ny = -p.vy / (speed || 1);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + nx * trailLen, p.y + ny * trailLen);
      ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.3})`;
      ctx.lineWidth = r * 0.6;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a})`;
    ctx.fill();
  }

  // Periodic burst lines from center
  const burstPhase = (time * 0.0003) % 1;
  if (burstPhase < 0.3) {
    const burstAlpha = (0.3 - burstPhase) * 0.08;
    const burstRadius = burstPhase * Math.min(w, h) * 0.8;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.0001;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * burstRadius, cy + Math.sin(angle) * burstRadius);
      ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${burstAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}

// ─── FUEL: Rising warmth ───

function drawFuel(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  // Particles rise gently like steam
  for (const p of particles) {
    p.vy -= 0.01; // gentle upward
    p.vx += Math.sin(time * 0.0005 + p.phase) * 0.01; // gentle sway
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.99;
    p.vy *= 0.99;

    // Reset at top
    if (p.y < -20) {
      p.y = h + 10;
      p.x = w * 0.2 + Math.random() * w * 0.6;
      p.vy = -0.2 - Math.random() * 0.3;
      p.vx = (Math.random() - 0.5) * 0.3;
    }

    // Fade as they rise
    const heightRatio = 1 - (h - p.y) / h;
    const a = heightRatio * 0.15 + 0.02;
    const r = p.radius * (0.8 + (1 - heightRatio) * 0.6);

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
    glow.addColorStop(0, `hsla(${col.h},${col.s - 30}%,${col.l}%,${a * 0.2})`);
    glow.addColorStop(1, `hsla(${col.h},${col.s - 30}%,${col.l}%,0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s - 30}%,${col.l}%,${a})`;
    ctx.fill();
  }

  // Gentle warmth gradient from bottom
  const warmth = ctx.createLinearGradient(0, h, 0, h * 0.5);
  warmth.addColorStop(0, `hsla(${col.h},${col.s - 40}%,${col.l}%,0.02)`);
  warmth.addColorStop(1, `hsla(${col.h},${col.s - 40}%,${col.l}%,0)`);
  ctx.fillStyle = warmth;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
}

// ─── HOLD: Concentric ripples ───

function drawHold(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.42;

  // Concentric expanding rings — the geometry of stillness
  for (let i = 0; i < 6; i++) {
    const phase = ((time * 0.00015 + i * 0.167) % 1);
    const radius = phase * maxR;
    const alpha = (1 - phase) * 0.06;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${alpha})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Particles orbit slowly at fixed radii — stable
  for (const p of particles) {
    const orbitRadius = 30 + p.phase * maxR * 0.8;
    const angle = time * 0.0002 * (0.5 + p.phase * 0.5) + p.life;
    const targetX = cx + Math.cos(angle) * orbitRadius;
    const targetY = cy + Math.sin(angle) * orbitRadius;

    p.x += (targetX - p.x) * 0.03;
    p.y += (targetY - p.y) * 0.03;

    const breath = Math.sin(time * 0.0008 + p.phase * Math.PI * 2) * 0.5 + 0.5;
    const r = p.radius * (0.6 + breath * 0.4);
    const a = 0.05 + breath * 0.1;

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
    glow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.25})`);
    glow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a})`;
    ctx.fill();
  }

  // Central stillpoint glow
  const breath = Math.sin(time * 0.0006) * 0.5 + 0.5;
  const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + breath * 15);
  cGlow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${0.04 + breath * 0.02})`);
  cGlow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, 30 + breath * 15, 0, Math.PI * 2);
  ctx.fillStyle = cGlow;
  ctx.fill();
}

// ─── RISE: Breath cycle ───

function drawRise(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  w: number, h: number,
  time: number,
  col: { h: number; s: number; l: number },
) {
  const cx = w / 2;
  const cy = h / 2;

  // Breath cycle — 4 seconds in, 4 seconds out
  const breathCycle = (time * 0.00015) % 1; // ~6.6s full cycle
  const breathPhase = Math.sin(breathCycle * Math.PI * 2) * 0.5 + 0.5; // 0→1→0
  const expanding = breathCycle < 0.5;

  // Breath ring
  const breathRadius = 40 + breathPhase * 70;
  const breathAlpha = 0.03 + breathPhase * 0.04;
  ctx.beginPath();
  ctx.arc(cx, cy, breathRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${breathAlpha})`;
  ctx.lineWidth = 1.5 - breathPhase * 0.5;
  ctx.stroke();

  // Inner breath glow
  const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, breathRadius);
  innerGlow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${breathAlpha * 0.3})`);
  innerGlow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
  ctx.beginPath();
  ctx.arc(cx, cy, breathRadius, 0, Math.PI * 2);
  ctx.fillStyle = innerGlow;
  ctx.fill();

  // Particles expand and contract with the breath
  for (const p of particles) {
    const baseRadius = 30 + p.phase * 100;
    const breathOffset = expanding ? breathPhase * 30 : (1 - breathPhase) * 30;
    const targetR = baseRadius + breathOffset;
    const angle = p.life + time * 0.0001 * (0.3 + p.phase * 0.4);

    const targetX = cx + Math.cos(angle) * targetR;
    const targetY = cy + Math.sin(angle) * targetR;

    p.x += (targetX - p.x) * 0.04;
    p.y += (targetY - p.y) * 0.04;

    const r = p.radius * (0.5 + breathPhase * 0.5);
    const a = 0.06 + breathPhase * 0.1;

    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
    glow.addColorStop(0, `hsla(${col.h},${col.s}%,${col.l}%,${a * 0.2})`);
    glow.addColorStop(1, `hsla(${col.h},${col.s}%,${col.l}%,0)`);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${col.h},${col.s}%,${col.l}%,${a})`;
    ctx.fill();
  }

  // Connection lines between nearby particles (O(n²) but limited to 40 particles)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 50) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `hsla(${col.h},${col.s}%,${col.l}%,${(1 - d / 50) * 0.03})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    }
  }
}

// ─── Dispatch table ───

const DRAW_FN: Record<ModalityId, typeof drawFlow> = {
  yoga: drawFlow,
  fitness: drawMove,
  nourishment: drawFuel,
  meditation: drawHold,
  breathwork: drawRise,
};

// ─── Particle count per modality ───

const PARTICLE_COUNT: Record<ModalityId, number> = {
  yoga: 40,
  fitness: 50,
  nourishment: 30,
  meditation: 35,
  breathwork: 40,
};

// ─── Component ───

interface ModalitySignatureProps {
  modality: ModalityId;
  /** 0-1 opacity multiplier for transitions */
  intensity?: number;
}

export function ModalitySignature({ modality, intensity = 1 }: ModalitySignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const dimsRef = useRef({ w: 0, h: 0 });
  const initedRef = useRef<ModalityId | null>(null);

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
      const count = PARTICLE_COUNT[modality] || 35;
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
      }));
      initedRef.current = modality;
    }

    resize();
    if (initedRef.current !== modality) {
      initParticles(dimsRef.current.w, dimsRef.current.h);
    }

    const drawFn = DRAW_FN[modality] || drawFlow;
    const col = MODALITY_COLORS[modality] || MODALITY_COLORS.yoga;

    function draw(time: number) {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);

      ctx.globalAlpha = intensity;
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
  }, [modality, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ touchAction: 'none', pointerEvents: 'none' }}
    />
  );
}