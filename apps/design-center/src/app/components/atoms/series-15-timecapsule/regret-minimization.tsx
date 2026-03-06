/**
 * ATOM 145: THE REGRET MINIMIZATION ENGINE · Series 15 · Position 5
 * Fork splits into two timelines. Drag to explore each path's 10-year outcome.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function RegretMinimizationAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    choice: 0, // -1 left, 0 center, 1 right
    dragging: false, explored: { left: false, right: false },
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const warmC: RGB = lerpColor(accentC, [255, 200, 100], 0.3);
      const coolC: RGB = lerpColor(accentC, [100, 160, 220], 0.3);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Fork point
      const forkY = cy - minDim * 0.05;
      ctx.beginPath(); ctx.arc(cx, forkY, minDim * 0.01, 0, Math.PI * 2);
      ctx.fillStyle = rgba(baseC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Left path (Choice A)
      const leftEndX = cx - minDim * 0.18; const pathEndY = cy + minDim * 0.15;
      ctx.beginPath(); ctx.moveTo(cx, forkY);
      ctx.quadraticCurveTo(cx - minDim * 0.05, cy, leftEndX, pathEndY);
      const leftActive = s.choice < -0.3;
      ctx.strokeStyle = rgba(warmC, (leftActive ? EMPHASIS_ALPHA.focal.max : ELEMENT_ALPHA.secondary.max) * entrance);
      ctx.lineWidth = minDim * (leftActive ? 0.002 : 0.001); ctx.stroke();

      // Right path (Choice B)
      const rightEndX = cx + minDim * 0.18;
      ctx.beginPath(); ctx.moveTo(cx, forkY);
      ctx.quadraticCurveTo(cx + minDim * 0.05, cy, rightEndX, pathEndY);
      const rightActive = s.choice > 0.3;
      ctx.strokeStyle = rgba(coolC, (rightActive ? EMPHASIS_ALPHA.focal.max : ELEMENT_ALPHA.secondary.max) * entrance);
      ctx.lineWidth = minDim * (rightActive ? 0.002 : 0.001); ctx.stroke();

      // Node on current position
      const nodeX = cx + s.choice * minDim * 0.18;
      const nodeY = forkY + Math.abs(s.choice) * minDim * 0.2;
      ctx.beginPath(); ctx.arc(nodeX, nodeY, minDim * 0.012, 0, Math.PI * 2);
      const nodeColor = s.choice < -0.3 ? warmC : s.choice > 0.3 ? coolC : baseC;
      ctx.fillStyle = rgba(nodeColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Labels
      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(warmC, ELEMENT_ALPHA.text.min * (leftActive ? 2 : 1) * entrance);
      ctx.fillText('Act Now', leftEndX, pathEndY + minDim * 0.03);
      if (s.explored.left) ctx.fillText('No regret.', leftEndX, pathEndY + minDim * 0.055);

      ctx.fillStyle = rgba(coolC, ELEMENT_ALPHA.text.min * (rightActive ? 2 : 1) * entrance);
      ctx.fillText('Wait', rightEndX, pathEndY + minDim * 0.03);
      if (s.explored.right) ctx.fillText('What if...', rightEndX, pathEndY + minDim * 0.055);

      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Drag to explore', cx, forkY - minDim * 0.04);

      if (s.explored.left && s.explored.right && !s.completionFired) {
        s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.();
      }
      cb.onStateChange?.(s.explored.left && s.explored.right ? 1 : (s.explored.left || s.explored.right ? 0.5 : 0));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      stateRef.current.choice = (px - 0.5) * 2;
      if (stateRef.current.choice < -0.5) stateRef.current.explored.left = true;
      if (stateRef.current.choice > 0.5) stateRef.current.explored.right = true;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}