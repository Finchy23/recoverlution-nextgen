/**
 * ATOM 163: THE PERSPECTIVE SWAP ENGINE · Series 17 · Position 3
 * Two windows side by side. Drag to rotate 180° and adopt the
 * opponent's view. Color palette inverts on swap.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function PerspectiveSwapAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    rotation: 0, dragging: false, lastX: 0, swapped: false, swapAnim: 0,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const youC: RGB = lerpColor(accentC, [100, 160, 220], 0.4);
      const themC: RGB = lerpColor(accentC, [220, 140, 80], 0.4);

      if (s.swapped) s.swapAnim = Math.min(1, s.swapAnim + 0.02);
      const sa = easeOutCubic(s.swapAnim);
      const rotNorm = Math.min(1, Math.abs(s.rotation) / 180);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Two windows with perspective projection
      const winW = minDim * 0.13; const winH = minDim * 0.16;
      const gap = minDim * 0.02;
      const scaleX = Math.cos(s.rotation * Math.PI / 180);
      const leftColor = lerpColor(youC, themC, rotNorm);
      const rightColor = lerpColor(themC, youC, rotNorm);

      // Left window
      const lx = cx - gap / 2 - winW * Math.abs(scaleX);
      ctx.fillStyle = rgba(leftColor, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(lx, cy - winH / 2, winW * Math.abs(scaleX) * 2, winH);

      // Right window
      const rx = cx + gap / 2;
      ctx.fillStyle = rgba(rightColor, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(rx, cy - winH / 2, winW * Math.abs(scaleX) * 2, winH);

      // Labels
      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `600 ${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      const youLabel = rotNorm > 0.5 ? 'Them' : 'You';
      const themLabel = rotNorm > 0.5 ? 'You' : 'Them';
      ctx.fillStyle = rgba(leftColor, ELEMENT_ALPHA.text.max * entrance);
      ctx.fillText(youLabel, lx + winW * Math.abs(scaleX), cy);
      ctx.fillStyle = rgba(rightColor, ELEMENT_ALPHA.text.max * entrance);
      ctx.fillText(themLabel, rx + winW * Math.abs(scaleX), cy);

      // Rotation indicator
      ctx.beginPath();
      ctx.arc(cx, cy + minDim * 0.14, minDim * 0.02, 0, Math.PI * 2 * rotNorm);
      ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Swap flash
      if (s.swapped) {
        const flashR = minDim * 0.2 * sa;
        const fGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
        fGrad.addColorStop(0, rgba(accentC, EMPHASIS_ALPHA.focal.min * (1 - sa) * entrance));
        fGrad.addColorStop(1, rgba(accentC, 0));
        ctx.fillStyle = fGrad; ctx.fillRect(cx - flashR, cy - flashR, flashR * 2, flashR * 2);
      }

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.swapped) ctx.fillText('Drag to rotate perspective', cx, cy + minDim * 0.2);
      else ctx.fillText('Perspectives swapped.', cx, cy + minDim * 0.2);

      if (s.swapped && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(rotNorm);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.swapped) return;
      stateRef.current.dragging = true; stateRef.current.lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.swapped) return;
      const dx = e.clientX - s.lastX;
      s.rotation = Math.max(-180, Math.min(180, s.rotation + dx * 0.5));
      s.lastX = e.clientX;
      if (Math.abs(s.rotation) >= 175 && !s.swapped) { s.swapped = true; s.rotation = 180; cbRef.current.onHaptic('drag_snap'); }
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}