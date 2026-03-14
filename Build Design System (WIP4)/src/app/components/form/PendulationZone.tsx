/**
 * PENDULATION ZONE — The Somatic Oscillation Field
 *
 * Canvas 2D visualization of the pendulation drag mechanic.
 * The screen is divided into two zones:
 *   - Schema zone (upper 40%) — friction, tension, the thought
 *   - Anchor zone (lower 40%) — safety, resource, the body
 *   - Transition band (middle 20%) — the oscillation corridor
 *
 * As the user drags their thumb:
 *   - Toward schema: field tints with container color, tightens
 *   - Toward anchor: field calms with resource green, softens
 *   - The transition is continuous, not binary
 *
 * The canvas renders:
 *   - A vertical gradient field showing the current position
 *   - Subtle particle drift in the direction of drag
 *   - Zone markers (dim glyphs at top and bottom)
 *   - A position indicator dot showing current pendulation depth
 */

import { useRef, useEffect, useCallback } from 'react';

interface PendulationZoneProps {
  width: number;
  height: number;
  /** 0 = anchor zone (safety), 1 = schema zone (friction) */
  position: number;
  /** Schema zone color (titration tint) */
  schemaColor: string;
  /** Anchor zone color (resource green) */
  anchorColor: string;
  /** Breath for undulation */
  breath: number;
  /** Whether the user is actively dragging */
  dragging: boolean;
  /** Whether the zone is active */
  active: boolean;
}

function parseRGBA(color: string): [number, number, number] {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
  }
  const hex = color.replace('#', '');
  if (hex.length >= 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  return [180, 140, 200];
}

export function PendulationZone({
  width,
  height,
  position,
  schemaColor,
  anchorColor,
  breath,
  dragging,
  active,
}: PendulationZoneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = Math.round(width * dpr);
    const ch = Math.round(height * dpr);

    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    timeRef.current += 0.016;
    const t = timeRef.current;

    const [sr, sg, sb] = parseRGBA(schemaColor);
    const [ar, ag, ab] = parseRGBA(anchorColor);

    // ─── Schema zone glow (top) ───
    const schemaIntensity = position * (dragging ? 1 : 0.5);
    if (schemaIntensity > 0.01) {
      const schemaGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
      schemaGrad.addColorStop(0, `rgba(${sr},${sg},${sb},${(0.04 * schemaIntensity).toFixed(4)})`);
      schemaGrad.addColorStop(0.5, `rgba(${sr},${sg},${sb},${(0.015 * schemaIntensity).toFixed(4)})`);
      schemaGrad.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
      ctx.fillStyle = schemaGrad;
      ctx.fillRect(0, 0, width, height * 0.5);
    }

    // ─── Anchor zone glow (bottom) ───
    const anchorIntensity = (1 - position) * (dragging ? 1 : 0.5);
    if (anchorIntensity > 0.01) {
      const anchorGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      anchorGrad.addColorStop(0, `rgba(${ar},${ag},${ab},0)`);
      anchorGrad.addColorStop(0.5, `rgba(${ar},${ag},${ab},${(0.015 * anchorIntensity).toFixed(4)})`);
      anchorGrad.addColorStop(1, `rgba(${ar},${ag},${ab},${(0.035 * anchorIntensity).toFixed(4)})`);
      ctx.fillStyle = anchorGrad;
      ctx.fillRect(0, height * 0.5, width, height * 0.5);
    }

    // ─── Position indicator ───
    if (dragging) {
      // Map position (0=anchor, 1=schema) to Y coordinate
      // Schema zone is top, anchor is bottom
      const indicatorY = height * (1 - position) * 0.7 + height * 0.15;
      const indicatorSize = 2 + Math.sin(t * 2) * 0.5;

      // Blend color based on position
      const mixR = Math.round(ar + (sr - ar) * position);
      const mixG = Math.round(ag + (sg - ag) * position);
      const mixB = Math.round(ab + (sb - ab) * position);

      // Glow
      const glowGrad = ctx.createRadialGradient(
        width / 2, indicatorY, 0,
        width / 2, indicatorY, 30 + position * 20,
      );
      glowGrad.addColorStop(0, `rgba(${mixR},${mixG},${mixB},${(0.08 + position * 0.06).toFixed(4)})`);
      glowGrad.addColorStop(1, `rgba(${mixR},${mixG},${mixB},0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(width / 2, indicatorY, 30 + position * 20, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(width / 2, indicatorY, indicatorSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${mixR},${mixG},${mixB},${(0.4 + position * 0.3).toFixed(3)})`;
      ctx.fill();

      // ─── Transition corridor — horizontal lines ───
      const corridorTop = height * 0.35;
      const corridorBottom = height * 0.65;
      const lineCount = 5;
      for (let i = 0; i < lineCount; i++) {
        const ly = corridorTop + (corridorBottom - corridorTop) * (i / (lineCount - 1));
        const lineAlpha = 0.015 * (1 - Math.abs(ly - indicatorY) / (height * 0.3));
        if (lineAlpha > 0.001) {
          ctx.beginPath();
          ctx.moveTo(width * 0.2, ly);
          ctx.lineTo(width * 0.8, ly);
          ctx.strokeStyle = `rgba(${mixR},${mixG},${mixB},${lineAlpha.toFixed(4)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // ─── Drift particles ───
    const particles = particlesRef.current;
    if (dragging && Math.random() < 0.3) {
      const driftDir = position > 0.5 ? -1 : 1; // drift toward the dominant zone
      particles.push({
        x: width * (0.3 + Math.random() * 0.4),
        y: height * (0.3 + Math.random() * 0.4),
        vx: (Math.random() - 0.5) * 0.3,
        vy: driftDir * (0.3 + Math.random() * 0.5),
        life: 1,
      });
    }

    // Limit particles
    if (particles.length > 20) particles.splice(0, particles.length - 20);

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const alpha = p.life * 0.04;
      const mixR = Math.round(ar + (sr - ar) * position);
      const mixG = Math.round(ag + (sg - ag) * position);
      const mixB = Math.round(ab + (sb - ab) * position);

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${mixR},${mixG},${mixB},${alpha.toFixed(4)})`;
      ctx.fill();
    }

    // ─── Zone markers ───
    // Schema marker (top)
    ctx.fillStyle = `rgba(${sr},${sg},${sb},${(dragging ? 0.08 + position * 0.05 : 0.03).toFixed(3)})`;
    ctx.font = '8px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◻', width / 2, height * 0.1);

    // Anchor marker (bottom)
    ctx.fillStyle = `rgba(${ar},${ag},${ab},${(dragging ? 0.08 + (1 - position) * 0.05 : 0.03).toFixed(3)})`;
    ctx.fillText('◎', width / 2, height * 0.88);

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [width, height, position, schemaColor, anchorColor, breath, dragging, active]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
      return;
    }

    timeRef.current = 0;
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, render]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
