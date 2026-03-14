/**
 * THREAD MAP — The Growing Constellation
 *
 * As the user seals entries, luminous points appear in the dark.
 * Each point is a sealed piece of their story.
 * Threads connect them — the architecture of their truth
 * becoming visible, one sealed page at a time.
 *
 * The user sees the shape of their journey forming.
 * Not data. Not charts. Not progress bars.
 * A constellation. Their constellation.
 *
 * Canvas 2D: node + thread constellation with gentle drift.
 */

import { useRef, useEffect, useCallback } from 'react';
import type { TalkEntry } from './talk-types';
import { LANES } from './talk-types';

import { room, font } from '../design-system/surface-tokens';

const SERIF = font.serif;

interface ThreadMapProps {
  entries: TalkEntry[];
  color: string;
  breath: number;
  visible: boolean;
  width: number;
  height: number;
}

export function ThreadMap({
  entries,
  color,
  breath,
  visible,
  width,
  height,
}: ThreadMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible || entries.length === 0) return;
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

    const t = Date.now() * 0.001;
    const [r, g, b] = parseHex(color);
    const breathPhase = Math.sin(breath * Math.PI * 2);

    // ── Draw threads between consecutive entries ──
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1];
      const curr = entries[i];

      const px = prev.threadPosition.x * width;
      const py = prev.threadPosition.y * height;
      const cx2 = curr.threadPosition.x * width;
      const cy2 = curr.threadPosition.y * height;

      // Bezier control point — slight arc
      const midX = (px + cx2) / 2 + Math.sin(i * 2.3) * 15;
      const midY = (py + cy2) / 2 + Math.cos(i * 1.7) * 10;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(midX, midY, cx2, cy2);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.03)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ── Draw entry nodes ──
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const ex = entry.threadPosition.x * width;
      const ey = entry.threadPosition.y * height;

      // Gentle drift
      const dx = Math.sin(t * 0.2 + i * 1.9) * 3;
      const dy = Math.cos(t * 0.15 + i * 2.3) * 2;
      const nx = ex + dx;
      const ny = ey + dy;

      // Node size based on response length
      const responseWeight = Math.min(1, entry.response.length / 200);
      const nodeSize = 2 + responseWeight * 3 + breathPhase * 0.5;

      // Glow
      const glowRadius = 10 + responseWeight * 10;
      const glowGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowRadius);
      glowGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.06 + responseWeight * 0.04).toFixed(4)})`);
      glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.15 + responseWeight * 0.15).toFixed(3)})`;
      ctx.fill();

      // Newest entry gets extra brightness
      if (i === entries.length - 1) {
        ctx.beginPath();
        ctx.arc(nx, ny, nodeSize * 0.4, 0, Math.PI * 2);
        const bright = Math.min(255, r + 50);
        const brightG = Math.min(255, g + 50);
        const brightB = Math.min(255, b + 50);
        ctx.fillStyle = `rgba(${bright},${brightG},${brightB},0.25)`;
        ctx.fill();
      }
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [entries, color, breath, visible, width, height]);

  useEffect(() => {
    if (!visible || entries.length === 0) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, render]);

  if (!visible || entries.length === 0) return null;

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