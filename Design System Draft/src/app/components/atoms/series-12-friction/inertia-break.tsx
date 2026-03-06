/**
 * ATOM 111: THE INERTIA BREAK ENGINE
 * ====================================
 * Series 12 — Friction Mechanics · Position 1
 *
 * A massive heavy block. Push it — grinding friction for the first
 * stretch, then sudden mass-drop into frictionless glide.
 *
 * PHYSICS: Breakaway force thresholds, mass-drop, kinetic gliding
 * INTERACTION: Drag to push the block
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function InertiaBreakAtom({
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
    blockX: 0, // normalized 0→1 (0=start, 1=end)
    pushing: false,
    pushStartX: 0,
    broken: false, // past breakaway threshold
    velocity: 0,
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const BREAKAWAY = 0.25; // 25% of the track

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

      // Physics: if broken free and not pushing, glide
      if (s.broken && !s.pushing && s.blockX < 1) {
        s.velocity = Math.max(s.velocity, 0.008);
        s.blockX = Math.min(1, s.blockX + s.velocity);
        s.velocity *= 0.998; // almost no friction
      }

      // Friction particles during grind
      const grinding = s.pushing && !s.broken && s.blockX > 0;

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const glowC = s.broken ? lerpColor(baseC, accentC, 0.4) : baseC;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(glowC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(glowC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Track
      const trackY = cy;
      const trackLeft = minDim * 0.1;
      const trackRight = w - minDim * 0.1;
      const trackLen = trackRight - trackLeft;

      ctx.beginPath();
      ctx.moveTo(trackLeft, trackY);
      ctx.lineTo(trackRight, trackY);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001;
      ctx.setLineDash([minDim * 0.004, minDim * 0.008]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Breakaway threshold marker
      const threshX = trackLeft + trackLen * BREAKAWAY;
      ctx.beginPath();
      ctx.moveTo(threshX, trackY - minDim * 0.015);
      ctx.lineTo(threshX, trackY + minDim * 0.015);
      ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.stroke();

      // Block
      const blockSize = minDim * (s.broken ? 0.04 : 0.06);
      const blockActualX = trackLeft + trackLen * s.blockX;
      const blockColor = s.broken ? lerpColor(baseC, accentC, 0.6) : baseC;
      const blockAlpha = ELEMENT_ALPHA.primary.max * (s.broken ? 2 : 1.5) * entrance;

      ctx.fillStyle = rgba(blockColor, blockAlpha);
      ctx.fillRect(blockActualX - blockSize / 2, trackY - blockSize / 2, blockSize, blockSize);

      // Grinding particles
      if (grinding && !p.reducedMotion) {
        for (let i = 0; i < 3; i++) {
          const px = blockActualX - blockSize / 2 + Math.random() * minDim * 0.01;
          const py = trackY + (Math.random() - 0.5) * blockSize;
          const pr = minDim * (0.001 + Math.random() * 0.002);
          ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * Math.random() * entrance);
          ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
        }
      }

      // Glide trail
      if (s.broken && s.blockX > BREAKAWAY) {
        const trailLen = Math.min(minDim * 0.15, (s.blockX - BREAKAWAY) * trackLen);
        const trailGrad = ctx.createLinearGradient(blockActualX - trailLen, trackY, blockActualX, trackY);
        trailGrad.addColorStop(0, rgba(accentC, 0));
        trailGrad.addColorStop(1, rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance));
        ctx.fillStyle = trailGrad;
        ctx.fillRect(blockActualX - trailLen, trackY - minDim * 0.003, trailLen, minDim * 0.006);
      }

      // Labels
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.broken) ctx.fillText('Push →', cx, trackY + minDim * 0.08);
      else if (s.blockX < 1) ctx.fillText('Frictionless...', cx, trackY + minDim * 0.08);

      // Completion
      if (s.blockX >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.blockX);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      s.pushing = true;
      s.pushStartX = (e.clientX - rect.left) / rect.width * viewport.width;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pushing) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width * viewport.width;
      const delta = (nx - s.pushStartX) / viewport.width;
      s.pushStartX = nx;

      if (!s.broken) {
        // Heavy friction: only 20% of movement transfers
        s.blockX = Math.max(0, Math.min(1, s.blockX + delta * 0.2));
        if (s.blockX >= 0.25) {
          s.broken = true;
          s.velocity = 0.01;
          cbRef.current.onHaptic('drag_snap');
        }
      } else {
        s.blockX = Math.max(0, Math.min(1, s.blockX + delta * 1.5));
        s.velocity = Math.abs(delta) * 0.5;
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pushing = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}