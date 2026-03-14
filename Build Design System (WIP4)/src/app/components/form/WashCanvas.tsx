/**
 * WASH CANVAS — Parasympathetic Clearing
 *
 * A full-screen Canvas 2D bimodal sine wave that sweeps
 * top-to-bottom, clearing the glass. The somatic wash.
 *
 * The wave is double-banded:
 *   Band 1: slow, wide, leading — the exhale
 *   Band 2: faster, narrower, trailing — the release
 *
 * Both bands carry the container's tint and dissolve
 * as they pass. Once the sweep completes, the canvas
 * fades to pure transparent — the glass is clean.
 *
 * The sweep is accompanied by a haptic smoothing:
 * the bilateral pulse transitions to a single long sine.
 */

import { useRef, useEffect, useCallback } from 'react';

interface WashCanvasProps {
  /** Container width */
  width: number;
  /** Container height */
  height: number;
  /** Color for the wash (CSS color string) */
  color: string;
  /** 0-1 progress through the wash cycle (externally driven) */
  progress: number;
  /** Breath amplitude for secondary undulation */
  breath: number;
  /** Whether the wash is active */
  active: boolean;
}

// ─── Parse CSS color to RGB ───
function parseRGBA(color: string): [number, number, number] {
  // Handle rgba() format from container tints
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
  }
  // Handle hex
  const hex = color.replace('#', '');
  if (hex.length >= 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  return [100, 180, 160]; // default wash green
}

export function WashCanvas({ width, height, color, progress, breath, active }: WashCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(0);

  const [r, g, b] = parseRGBA(color);

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

    timeRef.current += 0.016; // ~60fps
    const t = timeRef.current;

    // ─── Wave parameters ───
    // The sweep moves top to bottom over the progress range
    const sweepY = progress * height * 1.4 - height * 0.2;

    // Band 1: The exhale — wide, slow, leading
    const band1Width = height * 0.35;
    const band1Center = sweepY;
    const band1Alpha = Math.max(0, 0.04 * (1 - Math.abs(progress - 0.5) * 1.5));

    // Band 2: The release — narrower, trailing
    const band2Width = height * 0.18;
    const band2Center = sweepY - height * 0.15;
    const band2Alpha = Math.max(0, 0.06 * (1 - Math.abs(progress - 0.6) * 2));

    // ─── Draw band 1 ───
    for (let y = 0; y < height; y++) {
      const distFromCenter = Math.abs(y - band1Center) / band1Width;
      if (distFromCenter > 1.5) continue;

      // Gaussian-ish falloff
      const falloff = Math.exp(-distFromCenter * distFromCenter * 2);
      const alpha = band1Alpha * falloff;
      if (alpha < 0.001) continue;

      // Sine undulation — the wave isn't flat, it breathes
      const undulation = Math.sin(y * 0.008 + t * 0.5 + breath * Math.PI) * 0.3;
      const secondHarmonic = Math.sin(y * 0.015 + t * 1.2) * 0.15;
      const finalAlpha = alpha * (1 + undulation + secondHarmonic);

      ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, Math.min(0.12, finalAlpha)).toFixed(4)})`;
      ctx.fillRect(0, y, width, 1);
    }

    // ─── Draw band 2 ───
    for (let y = 0; y < height; y++) {
      const distFromCenter = Math.abs(y - band2Center) / band2Width;
      if (distFromCenter > 1.5) continue;

      const falloff = Math.exp(-distFromCenter * distFromCenter * 3);
      const alpha = band2Alpha * falloff;
      if (alpha < 0.001) continue;

      const undulation = Math.sin(y * 0.012 + t * 0.8 + breath * Math.PI * 1.5) * 0.25;
      const finalAlpha = alpha * (1 + undulation);

      ctx.fillStyle = `rgba(${r},${g},${b},${Math.max(0, Math.min(0.15, finalAlpha)).toFixed(4)})`;
      ctx.fillRect(0, y, width, 1);
    }

    // ─── Dissolve particles — stochastic clearing ───
    // Sparse, dim particles that drift upward as the wave passes
    if (progress > 0.1 && progress < 0.9) {
      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        // Deterministic-ish positions from time and index
        const seed = Math.sin(i * 7.37 + t * 0.3) * 0.5 + 0.5;
        const px = seed * width;
        const py = sweepY - height * 0.3 + (Math.sin(i * 13.17 + t * 0.5) * 0.5 + 0.5) * height * 0.4;
        const size = 1 + Math.sin(i * 3.7 + t) * 0.5;
        const pAlpha = 0.02 * Math.sin(i * 5.1 + t * 0.7);

        if (pAlpha > 0) {
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${pAlpha.toFixed(4)})`;
          ctx.fill();
        }
      }
    }

    // ─── Final clearing gradient — after sweep passes ───
    if (progress > 0.7) {
      const clearAlpha = (progress - 0.7) / 0.3 * 0.03;
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, `rgba(6,5,10,${clearAlpha.toFixed(4)})`);
      grad.addColorStop(1, `rgba(6,5,10,0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [width, height, r, g, b, progress, breath, active]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      timeRef.current = 0;
      return;
    }

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
