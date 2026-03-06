/**
 * ATOM 076: THE MICRO-STEP ENGINE
 * ==================================
 * Series 8 — Kinematic Topology · Position 6
 *
 * A task too massive to lift. Double-tap to shrink it until it
 * is too small to fail. Then flick the crumb away.
 *
 * PHYSICS:
 *   - Massive dark block fills 60% of viewport
 *   - Each tap shrinks by 50% with spring overshoot
 *   - Block mass decreases (physics weight label fades)
 *   - At minimum size: flick-away with zero friction
 *   - Trail of shed "weight" particles on each shrink
 *
 * INTERACTION:
 *   Tap → shrink block by 50%
 *   Drag (at min size) → flick block away for resolution
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Instant size steps, no spring overshoot
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, ATOM_BG_ALPHA, type RGB,
} from '../atom-utils';

const BLOCK_HEAVY: RGB = [55, 48, 65];
const BLOCK_LIGHT: RGB = [140, 130, 160];
const PARTICLE_COLOR: RGB = [80, 70, 95];
const WEIGHT_LABEL: RGB = [160, 80, 70];
const BG_BASE: RGB = [18, 16, 24];

const MAX_SHRINKS = 6;
const SPRING_DURATION = 30;

interface ShedParticle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number; size: number;
}

export default function MicroStepAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    shrinkCount: 0,
    currentScale: 1,
    targetScale: 1,
    springStartScale: 1,
    springFrame: -1,
    particles: [] as ShedParticle[],
    // Flick state
    isMinSize: false,
    isDragging: false,
    blockX: 0, blockY: 0,
    blockInited: false,
    dragOffsetX: 0, dragOffsetY: 0,
    flickVx: 0, flickVy: 0,
    flicked: false,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    stateRef.current.blockX = viewport.width / 2;
    stateRef.current.blockY = viewport.height / 2;
  }, [viewport]);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.resolved) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      if (s.isMinSize) {
        s.isDragging = true;
        s.dragOffsetX = px - s.blockX;
        s.dragOffsetY = py - s.blockY;
        return;
      }

      if (s.shrinkCount < MAX_SHRINKS) {
        s.shrinkCount++;
        s.springStartScale = s.currentScale;
        s.targetScale = Math.pow(0.5, s.shrinkCount);
        s.springFrame = 0;
        onHaptic('tap');

        const blockSize = minDim * 0.5 * s.currentScale;
        const shedSize = minDim * 0.004;
        for (let i = 0; i < 8; i++) {
          s.particles.push({
            x: s.blockX + (Math.random() - 0.5) * blockSize,
            y: s.blockY + (Math.random() - 0.5) * blockSize,
            vx: (Math.random() - 0.5) * minDim * 0.006,
            vy: Math.random() * minDim * 0.004 + minDim * 0.002,
            alpha: 0.06,
            size: shedSize * (0.5 + Math.random() * 1),
          });
        }

        if (s.shrinkCount >= MAX_SHRINKS) {
          s.isMinSize = true;
          onHaptic('step_advance');
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.flickVx = px - s.blockX;
      s.flickVy = py - s.blockY;
      s.blockX = px - s.dragOffsetX;
      s.blockY = py - s.dragOffsetY;
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.isDragging && s.isMinSize) {
        s.isDragging = false;
        const speed = Math.sqrt(s.flickVx * s.flickVx + s.flickVy * s.flickVy);
        if (speed > minDim * 0.006) {
          s.flicked = true;
          s.flickVx *= 0.5;
          s.flickVy *= 0.5;
          onHaptic('completion');
          if (!s.resolved) { s.resolved = true; onResolve?.(); }
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Spring animation
      if (s.springFrame >= 0 && !p.reducedMotion) {
        s.springFrame++;
        const t = Math.min(1, s.springFrame / SPRING_DURATION);
        const ease = easeOutExpo(t);
        const overshoot = t < 0.3 ? Math.sin(t * Math.PI * 3) * 0.08 * (1 - t) : 0;
        s.currentScale = s.targetScale + (s.springStartScale - s.targetScale) * (1 - ease) + overshoot;
        if (t >= 1) { s.currentScale = s.targetScale; s.springFrame = -1; }
      } else {
        const lrp = p.reducedMotion ? 0.5 : 0.08;
        s.currentScale += (s.targetScale - s.currentScale) * lrp;
      }

      // Flick physics
      if (s.flicked) {
        s.blockX += s.flickVx;
        s.blockY += s.flickVy;
        s.flickVx *= 0.98;
        s.flickVy *= 0.98;
      }

      // Particles
      for (const pt of s.particles) {
        pt.x += pt.vx; pt.y += pt.vy;
        pt.vy += minDim * 0.0001; pt.alpha *= 0.97;
      }
      s.particles = s.particles.filter(pt => pt.alpha > 0.002);

      onStateChange?.(s.shrinkCount / MAX_SHRINKS);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Init block position on first frame
      if (!s.blockInited) {
        s.blockX = cx;
        s.blockY = cy;
        s.blockInited = true;
      }

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * ATOM_BG_ALPHA));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * ATOM_BG_ALPHA * 0.5));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Particles
      const ptCol = lerpColor(PARTICLE_COLOR, primaryRgb, 0.04);
      for (const pt of s.particles) {
        ctx.fillStyle = rgba(ptCol, pt.alpha * ent);
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      }

      // Block
      const blockBaseSize = minDim * 0.5;
      const blockSize = blockBaseSize * s.currentScale;
      const bx = s.blockX - blockSize / 2;
      const by = s.blockY - blockSize / 2;

      if (bx < w + blockSize && bx > -blockSize * 2 && by < h + blockSize && by > -blockSize * 2) {
        const heaviness = 1 - s.shrinkCount / MAX_SHRINKS;
        const blockCol = lerpColor(
          lerpColor(BLOCK_HEAVY, primaryRgb, 0.04),
          lerpColor(BLOCK_LIGHT, primaryRgb, 0.04),
          1 - heaviness,
        );
        ctx.fillStyle = rgba(blockCol, ELEMENT_ALPHA.primary.max * ent);
        ctx.beginPath();
        ctx.roundRect(bx, by, blockSize, blockSize, blockSize * 0.08);
        ctx.fill();

        // Weight label
        if (heaviness > 0.1) {
          const wLabel = `${Math.round(heaviness * 100)}%`;
          const fontSize = Math.max(6, Math.round(blockSize * 0.15));
          ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const wCol = lerpColor(WEIGHT_LABEL, primaryRgb, 0.05);
          ctx.fillStyle = rgba(wCol, ELEMENT_ALPHA.text.max * ent * heaviness);
          ctx.fillText(wLabel, s.blockX, s.blockY);
        }

        // Border
        ctx.strokeStyle = rgba(blockCol, ELEMENT_ALPHA.secondary.max * ent);
        ctx.lineWidth = minDim * 0.0006;
        ctx.strokeRect(bx, by, blockSize, blockSize, blockSize * 0.08);
      }

      // Instruction
      if (!s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const lCol = lerpColor(BLOCK_LIGHT, primaryRgb, 0.05);
        ctx.fillStyle = rgba(lCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText(
          s.isMinSize ? 'now flick it away' : 'tap to shrink',
          cx, h * 0.92,
        );
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'pointer' }}
    />
  );
}