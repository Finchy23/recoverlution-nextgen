/**
 * ResonanceBurst — canvas particle burst for deep resonance milestones (20+)
 *
 * Renders a subtle outward burst of glowing particles around the stardust text
 * when a user has accumulated 20+ passage resonance detections across sessions.
 * The particles drift outward and fade, evoking stars scattering from a center point.
 *
 * Phase AB+: After the particles settle, a residual glow ring expands and fades,
 * like a halo marking the moment — persists through the stardust phase.
 *
 * Phase AC: The glow ring gradually shifts hue from the constellation's color
 * toward gold as it expands, blending personal territory with universal warmth.
 */

import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ResonanceBurstProps {
  /** Center X as fraction 0..1 */
  cx: number;
  /** Center Y as fraction 0..1 */
  cy: number;
  /** Constellation color for tinting */
  color: string;
  /** Container width */
  width: number;
  /** Container height */
  height: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export function ResonanceBurst({ cx, cy, color, width, height }: ResonanceBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = cx * width;
    const centerY = cy * height;
    const [r, g, b] = hexToRgb(color);

    // Create particles bursting outward from center
    const particles: Particle[] = [];
    const count = 28 + Math.floor(Math.random() * 12);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.2;
      const life = 80 + Math.floor(Math.random() * 120);
      particles.push({
        x: centerX + (Math.random() - 0.5) * 6,
        y: centerY + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 1 + Math.random() * 2.5,
        color: Math.random() > 0.3
          ? `rgba(${r}, ${g}, ${b}, 1)`
          : `rgba(255, 224, 136, 1)`, // gold accent
      });
    }

    let raf: number;
    let frame = 0;
    const maxFrames = 600; // ~10 seconds — extended for halo phase
    const particleEndFrame = 240; // particles die by frame ~240
    let haloStarted = false;
    let haloStartFrame = 0;
    const haloDuration = 300; // ~5 seconds of halo
    const haloMaxRadius = 80;

    const draw = () => {
      if (frame >= maxFrames) return;
      ctx.clearRect(0, 0, width, height);

      // ── Particle phase ──
      let alive = 0;
      if (frame < particleEndFrame + 60) {
        for (const p of particles) {
          if (p.life <= 0) continue;
          alive++;
          p.x += p.vx;
          p.y += p.vy;
          // Gentle deceleration
          p.vx *= 0.993;
          p.vy *= 0.993;
          p.life--;

          const progress = 1 - p.life / p.maxLife;
          // Fade in quickly then fade out gently
          const alpha = progress < 0.1
            ? progress / 0.1
            : Math.pow(p.life / p.maxLife, 0.6);
          const finalAlpha = alpha * 0.55;

          // Extract base RGB from particle color
          const isGold = p.color.includes('255, 224');
          const pr = isGold ? 255 : r;
          const pg = isGold ? 224 : g;
          const pb = isGold ? 136 : b;

          // Glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${finalAlpha * 0.15})`;
          ctx.fill();

          // Core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${finalAlpha})`;
          ctx.fill();
        }
      }

      // ── Residual glow ring phase — halo marking the moment ──
      if (alive === 0 && !haloStarted) {
        haloStarted = true;
        haloStartFrame = frame;
      }

      if (haloStarted) {
        const haloProgress = Math.min(1, (frame - haloStartFrame) / haloDuration);
        const haloTime = (frame - haloStartFrame) / 60; // seconds since halo start
        // Breathing radius: slow expansion with sine-wave pulsing overlaid
        const baseRadius = 12 + haloProgress * haloMaxRadius;
        const breathe = Math.sin(haloTime * 1.4) * 6 * (1 - haloProgress); // pulse dampens over time
        const radius = baseRadius + breathe;
        // Fade: peaks at 0.2 progress, then slowly fades; breathe modulates alpha subtly
        const breatheAlpha = 1 + Math.sin(haloTime * 1.4 + Math.PI * 0.5) * 0.15;
        const rawAlpha = haloProgress < 0.2
          ? (haloProgress / 0.2) * 0.18
          : 0.18 * Math.pow(1 - (haloProgress - 0.2) / 0.8, 0.5);
        const haloAlpha = rawAlpha * breatheAlpha;

        // Phase AC: Hue shift — interpolate from constellation color toward gold
        const goldR = 255, goldG = 224, goldB = 136;
        const hueShift = Math.pow(haloProgress, 1.5); // accelerates toward gold at the end
        const hr = Math.round(r + (goldR - r) * hueShift);
        const hg = Math.round(g + (goldG - g) * hueShift);
        const hb = Math.round(b + (goldB - b) * hueShift);

        if (haloAlpha > 0.005) {
          // Outer glow ring — lineWidth also breathes
          const breatheWidth = 2 + (1 - haloProgress) * 3 + Math.sin(haloTime * 1.4) * 0.8;
          ctx.beginPath();
          ctx.arc(centerX, centerY, Math.max(1, radius), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${hr}, ${hg}, ${hb}, ${haloAlpha})`;
          ctx.lineWidth = breatheWidth;
          ctx.stroke();

          // Inner soft glow
          const gradRadius = Math.max(2, radius);
          const grad = ctx.createRadialGradient(
            centerX, centerY, gradRadius * 0.3,
            centerX, centerY, gradRadius,
          );
          grad.addColorStop(0, `rgba(${hr}, ${hg}, ${hb}, ${haloAlpha * 0.3})`);
          grad.addColorStop(0.6, `rgba(${hr}, ${hg}, ${hb}, ${haloAlpha * 0.1})`);
          grad.addColorStop(1, `rgba(${hr}, ${hg}, ${hb}, 0)`);
          ctx.beginPath();
          ctx.arc(centerX, centerY, gradRadius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        if (haloProgress >= 1) {
          // Halo complete
          return;
        }
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };

    // Delay the burst slightly to coincide with the whisper appearing
    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(draw);
    }, 6800); // align with resonanceDepthWhisper delay of 6.5s + 0.3s

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [cx, cy, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
