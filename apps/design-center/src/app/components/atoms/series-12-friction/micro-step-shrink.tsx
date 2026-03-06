/**
 * ATOM 112: THE MICRO-STEP ENGINE
 * =================================
 * Series 12 — Friction Mechanics · Position 2
 *
 * A terrifyingly large boulder fills the screen. Each tap
 * fractures it to 50% size. Keep tapping until it's a single
 * pixel, then flick it off.
 *
 * PHYSICS: Radial downscaling, mass depletion, friction decay
 * INTERACTION: Tap to shrink
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

const MAX_TAPS = 8; // 2^8 = 256x reduction

export default function MicroStepShrinkAtom({
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
    taps: 0,
    currentSize: 1, // animated size (1 = full)
    targetSize: 1,
    flicked: false,
    flickX: 0, flickVx: 0,
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

      // Smooth size animation
      s.currentSize += (s.targetSize - s.currentSize) * 0.1;

      // Flick physics
      if (s.flicked) {
        s.flickX += s.flickVx;
        s.flickVx *= 0.98;
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const maxR = minDim * 0.35;
      const boulderR = maxR * s.currentSize;
      const boulderX = s.flicked ? s.flickX : cx;

      if (boulderR > 0.5 && Math.abs(boulderX - cx) < w) {
        // Draw boulder
        const t = 1 - s.currentSize; // 0→1 as it shrinks
        const boulderColor = lerpColor(baseC, accentC, t * 0.6);

        // Cracks (appear at smaller sizes)
        if (s.taps > 0 && s.taps < MAX_TAPS && !p.reducedMotion) {
          const crackCount = Math.min(s.taps * 2, 8);
          ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance);
          ctx.lineWidth = minDim * 0.0004;
          for (let i = 0; i < crackCount; i++) {
            const angle = (i / crackCount) * Math.PI * 2 + s.frameCount * 0.001 * ms;
            const len = boulderR * (0.3 + Math.random() * 0.5);
            ctx.beginPath();
            ctx.moveTo(boulderX, cy);
            ctx.lineTo(
              boulderX + Math.cos(angle) * len,
              cy + Math.sin(angle) * len
            );
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(boulderX, cy, Math.max(1, boulderR), 0, Math.PI * 2);
        ctx.fillStyle = rgba(boulderColor, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(boulderColor, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();

        // Label
        if (boulderR > minDim * 0.02) {
          const fs = Math.max(6, Math.min(minDim * 0.02, boulderR * 0.3));
          ctx.font = `${fs}px -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(boulderColor, ELEMENT_ALPHA.text.min * entrance);
          ctx.fillText(s.taps >= MAX_TAPS ? '·' : 'THE TASK', boulderX, cy);
        }
      }

      // Instructions
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.taps < MAX_TAPS) {
        ctx.fillText('Tap to shrink', cx, cy + maxR + minDim * 0.06);
      } else if (!s.flicked) {
        ctx.fillText('Flick it away →', cx, cy + minDim * 0.06);
      }

      // Completion
      if (s.flicked && Math.abs(s.flickX - cx) > w && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.taps / (MAX_TAPS + 1));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.flicked) return;

      if (s.taps >= MAX_TAPS) {
        // Flick it
        s.flicked = true;
        s.flickX = viewport.width / 2;
        s.flickVx = Math.min(viewport.width, viewport.height) * 0.03;
        cbRef.current.onHaptic('step_advance');
      } else {
        s.taps++;
        s.targetSize = Math.pow(0.5, s.taps);
        cbRef.current.onHaptic('tap');
      }
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