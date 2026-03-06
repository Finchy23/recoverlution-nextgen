/**
 * ATOM 119: THE FRICTION POLISH ENGINE
 * ======================================
 * Series 12 — Friction Mechanics · Position 9
 *
 * A rocky track. Rub the screen to sand it smooth.
 * The avatar glides effortlessly on the polished surface.
 *
 * PHYSICS: Surface smoothing, bump-map reduction, zero-friction
 * INTERACTION: Drag to sand/polish
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

const GRID_COLS = 20;
const GRID_ROWS = 6;

export default function FrictionPolishAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    // Bump map: 1 = rough, 0 = smooth
    bumps: Array.from({ length: GRID_COLS * GRID_ROWS }, () => 0.5 + Math.random() * 0.5),
    smoothness: 0,
    dragging: false,
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;

      // Calculate smoothness
      const totalBump = s.bumps.reduce((a, b) => a + b, 0);
      s.smoothness = 1 - totalBump / (GRID_COLS * GRID_ROWS);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Track area
      const trackTop = cy - minDim * 0.06;
      const trackH = minDim * 0.12;
      const cellW = w / GRID_COLS;
      const cellH = trackH / GRID_ROWS;

      // Draw bump map cells
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const idx = r * GRID_COLS + c;
          const bump = s.bumps[idx];
          const x = c * cellW;
          const y = trackTop + r * cellH;
          const cellColor = lerpColor(accentC, baseC, bump);
          const alpha = (ELEMENT_ALPHA.primary.min + bump * ELEMENT_ALPHA.primary.max) * entrance;
          ctx.fillStyle = rgba(cellColor, alpha);
          ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);

          // Jagged bump indicators
          if (bump > 0.1 && !p.reducedMotion) {
            const jh = bump * minDim * 0.004;
            ctx.fillStyle = rgba(baseC, bump * ELEMENT_ALPHA.secondary.max * entrance);
            ctx.fillRect(x + cellW * 0.3, y, cellW * 0.4, jh);
          }
        }
      }

      // Avatar (glides when smooth)
      const avatarR = minDim * 0.012;
      const glideX = s.smoothness > 0.8
        ? cx + Math.sin(s.frameCount * 0.03 * ms) * minDim * 0.15 * (s.smoothness - 0.8) * 5
        : cx;
      ctx.beginPath();
      ctx.arc(glideX, trackTop - avatarR * 2, avatarR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Status
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.smoothness < 0.85) {
        ctx.fillText('Rub to smooth the path', cx, trackTop + trackH + minDim * 0.05);
      } else {
        ctx.fillText('Frictionless.', cx, trackTop + trackH + minDim * 0.05);
      }

      if (s.smoothness >= 0.9 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.smoothness);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const smooth = (px: number, py: number) => {
      const s = stateRef.current;
      const trackTop = viewport.height / 2 - Math.min(viewport.width, viewport.height) * 0.06;
      const trackH = Math.min(viewport.width, viewport.height) * 0.12;
      const cellW = viewport.width / GRID_COLS;
      const cellH = trackH / GRID_ROWS;

      const c = Math.floor(px / cellW);
      const r = Math.floor((py - trackTop) / cellH);
      if (c >= 0 && c < GRID_COLS && r >= 0 && r < GRID_ROWS) {
        // Smooth a 3x3 area
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
              const idx = nr * GRID_COLS + nc;
              s.bumps[idx] = Math.max(0, s.bumps[idx] - 0.05);
            }
          }
        }
      }
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      const rect = canvas.getBoundingClientRect();
      smooth(
        (e.clientX - rect.left) / rect.width * viewport.width,
        (e.clientY - rect.top) / rect.height * viewport.height
      );
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      smooth(
        (e.clientX - rect.left) / rect.width * viewport.width,
        (e.clientY - rect.top) / rect.height * viewport.height
      );
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}