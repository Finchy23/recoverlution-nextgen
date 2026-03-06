/**
 * ATOM 176: THE OBSTACLE FLIP ENGINE · Series 18 · Position 6
 * A wall of bricks. Swipe up to flip each brick into a step.
 * The wall becomes an ascending staircase.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const BRICKS = 5;

export default function ObstacleFlipAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    flipped: 0, flipAnims: new Array(BRICKS).fill(0),
    swipeStartY: 0, swiping: false, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const wallC: RGB = lerpColor(accentC, [180, 120, 90], 0.4);
      const stepC: RGB = lerpColor(accentC, [100, 180, 140], 0.3);

      for (let i = 0; i < BRICKS; i++) if (i < s.flipped) s.flipAnims[i] = Math.min(1, s.flipAnims[i] + 0.04);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      const brickW = minDim * 0.08; const brickH = minDim * 0.035;
      const wallX = cx; const wallBaseY = cy + minDim * 0.1;

      for (let i = 0; i < BRICKS; i++) {
        const fa = easeOutCubic(s.flipAnims[i]);
        const brickY = wallBaseY - i * brickH * 1.1;

        if (fa > 0) {
          // Transitioning from wall brick to staircase step
          const stepX = cx - minDim * 0.15 + i * minDim * 0.06;
          const stepY = wallBaseY - i * minDim * 0.035;
          // Interpolate position
          const ix = wallX + (stepX - wallX) * fa;
          const iy = brickY + (stepY - brickY) * fa;
          const colr = lerpColor(wallC, stepC, fa);
          ctx.fillStyle = rgba(colr, ELEMENT_ALPHA.primary.max * (1.5 + fa * 0.5) * entrance);
          ctx.fillRect(ix - brickW / 2, iy - brickH / 2, brickW * (1 + fa * 0.2), brickH);
        } else {
          // Wall brick
          ctx.fillStyle = rgba(wallC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
          ctx.fillRect(wallX - brickW / 2, brickY - brickH / 2, brickW, brickH);
          // Mortar lines
          ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
          ctx.lineWidth = minDim * 0.0004;
          ctx.strokeRect(wallX - brickW / 2, brickY - brickH / 2, brickW, brickH);
        }
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.flipped < BRICKS) ctx.fillText('Swipe up to flip', cx, wallBaseY + minDim * 0.08);
      else ctx.fillText('Obstacles became steps.', cx, wallBaseY + minDim * 0.08);

      if (s.flipped >= BRICKS && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.flipped / BRICKS);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      stateRef.current.swiping = true; stateRef.current.swipeStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.swiping && s.swipeStartY - e.clientY > 30 && s.flipped < BRICKS) {
        s.flipped++; cbRef.current.onHaptic('swipe_commit');
      }
      s.swiping = false; canvas.releasePointerCapture(e.pointerId);
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}