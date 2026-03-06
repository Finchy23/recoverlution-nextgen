/**
 * ATOM 109: THE ECHO CANCELLATION ENGINE
 * ========================================
 * Series 11 — Epistemic Constructs · Position 9
 *
 * A voice bounces chaotically off walls (echo reflections).
 * Drag acoustic padding onto the 4 walls. Reflections stop.
 * Only the single quiet original statement remains.
 *
 * PHYSICS: Acoustic dampening walls, wave reflection, frequency isolation
 * INTERACTION: Tap walls to apply padding
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA,
  EMPHASIS_ALPHA,
  motionScale,
  type RGB,
} from '../atom-utils';

const WALL_COUNT = 4; // top, right, bottom, left

interface EchoWave {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number;
  radius: number;
}

export default function EchoCancellationAtom({
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
    wallsPadded: [false, false, false, false] as boolean[],
    wallAnims: [0, 0, 0, 0] as number[],
    echoes: [] as EchoWave[],
    quietProgress: 0,
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
      const paddedCount = s.wallsPadded.filter(Boolean).length;
      const allPadded = paddedCount >= WALL_COUNT;

      // Animate wall padding
      for (let i = 0; i < WALL_COUNT; i++) {
        if (s.wallsPadded[i] && s.wallAnims[i] < 1) {
          s.wallAnims[i] = Math.min(1, s.wallAnims[i] + 0.04);
        }
      }

      // Spawn echoes (fewer as more walls are padded)
      if (!allPadded && !p.reducedMotion && s.frameCount % (8 + paddedCount * 4) === 0) {
        const angle = Math.random() * Math.PI * 2;
        const speed = minDim * 0.003;
        s.echoes.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.8,
          radius: minDim * 0.01,
        });
      }

      // Quiet progress
      if (allPadded) s.quietProgress = Math.min(1, s.quietProgress + 0.015);

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw room boundary
      const margin = minDim * 0.08;
      const roomX = margin;
      const roomY = margin;
      const roomW = w - margin * 2;
      const roomH = h - margin * 2;

      // Walls
      const wallThickness = minDim * 0.012;
      const wallRects = [
        { x: roomX, y: roomY, w: roomW, h: wallThickness }, // top
        { x: roomX + roomW - wallThickness, y: roomY, w: wallThickness, h: roomH }, // right
        { x: roomX, y: roomY + roomH - wallThickness, w: roomW, h: wallThickness }, // bottom
        { x: roomX, y: roomY, w: wallThickness, h: roomH }, // left
      ];

      for (let i = 0; i < WALL_COUNT; i++) {
        const wr = wallRects[i];
        const padded = s.wallAnims[i];
        const wallColor = padded > 0
          ? lerpColor(baseC, accentC, padded * 0.6)
          : baseC;
        const alpha = ELEMENT_ALPHA.primary.max * (0.5 + padded * 0.5) * entrance;
        ctx.fillStyle = rgba(wallColor, alpha);
        ctx.fillRect(wr.x, wr.y, wr.w, wr.h);
      }

      // Update and draw echoes
      const dampFactor = 1 - paddedCount * 0.2; // each wall reduces echo energy
      for (let i = s.echoes.length - 1; i >= 0; i--) {
        const e = s.echoes[i];
        e.x += e.vx;
        e.y += e.vy;
        e.alpha -= 0.003 + paddedCount * 0.002;
        e.radius += minDim * 0.0003;

        // Bounce off unpadded walls
        if (e.x < roomX + wallThickness) {
          e.vx = Math.abs(e.vx) * (s.wallsPadded[3] ? 0.1 : 0.9);
          e.x = roomX + wallThickness;
        }
        if (e.x > roomX + roomW - wallThickness) {
          e.vx = -Math.abs(e.vx) * (s.wallsPadded[1] ? 0.1 : 0.9);
          e.x = roomX + roomW - wallThickness;
        }
        if (e.y < roomY + wallThickness) {
          e.vy = Math.abs(e.vy) * (s.wallsPadded[0] ? 0.1 : 0.9);
          e.y = roomY + wallThickness;
        }
        if (e.y > roomY + roomH - wallThickness) {
          e.vy = -Math.abs(e.vy) * (s.wallsPadded[2] ? 0.1 : 0.9);
          e.y = roomY + roomH - wallThickness;
        }

        if (e.alpha <= 0) { s.echoes.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(baseC, e.alpha * ELEMENT_ALPHA.primary.max * entrance * dampFactor);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();
      }

      // Central source text
      const quiet = easeOutCubic(s.quietProgress);
      const fontSize = Math.max(8, minDim * (0.016 + quiet * 0.004));
      ctx.font = `${fontSize}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textAlpha = (ELEMENT_ALPHA.text.min + quiet * ELEMENT_ALPHA.text.max) * entrance;
      ctx.fillStyle = rgba(lerpColor(baseC, accentC, quiet), textAlpha);
      ctx.fillText(allPadded ? 'Just a thought.' : 'Just a thought...', cx, cy);

      // Completion
      if (s.quietProgress >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(paddedCount / WALL_COUNT);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const margin = minDim2 * 0.08;
      const hitZone = minDim2 * 0.06;

      // Detect which wall was tapped
      if (py < margin + hitZone && !s.wallsPadded[0]) { s.wallsPadded[0] = true; cbRef.current.onHaptic('drag_snap'); }
      else if (px > viewport.width - margin - hitZone && !s.wallsPadded[1]) { s.wallsPadded[1] = true; cbRef.current.onHaptic('drag_snap'); }
      else if (py > viewport.height - margin - hitZone && !s.wallsPadded[2]) { s.wallsPadded[2] = true; cbRef.current.onHaptic('drag_snap'); }
      else if (px < margin + hitZone && !s.wallsPadded[3]) { s.wallsPadded[3] = true; cbRef.current.onHaptic('drag_snap'); }

      if (s.wallsPadded.every(Boolean)) cbRef.current.onHaptic('step_advance');
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}