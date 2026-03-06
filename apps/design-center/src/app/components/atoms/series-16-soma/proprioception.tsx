/**
 * ATOM 154: THE PROPRIOCEPTION ENGINE · Series 16 · Position 4
 * Find your center. Drag a floating point to the center target.
 * Directional cues guide you. Silence at equilibrium.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function ProprioceptionAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    pointX: 0.25, pointY: 0.3, dragging: false, centered: false, centerAnim: 0,
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
      const baseC = s.primaryRgb; const accentC = s.accentRgb;

      const px = s.pointX * w; const py = s.pointY * h;
      const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
      const maxDist = minDim * 0.3;
      const proximity = 1 - Math.min(1, dist / maxDist);

      if (proximity > 0.95 && !s.centered) { s.centered = true; cb.onHaptic('completion'); }
      if (s.centered) s.centerAnim = Math.min(1, s.centerAnim + 0.02);

      // Background
      const ms = motionScale(p.reducedMotion);
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms + proximity * 0.1) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * (1 + proximity) * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Target crosshairs (center)
      const crossLen = minDim * 0.03;
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.secondary.max * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.moveTo(cx - crossLen, cy); ctx.lineTo(cx + crossLen, cy);
      ctx.moveTo(cx, cy - crossLen); ctx.lineTo(cx, cy + crossLen);
      ctx.stroke();

      // Target circle
      ctx.beginPath(); ctx.arc(cx, cy, minDim * 0.02, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.0008; ctx.stroke();

      // Guideline (from point to center)
      if (!s.centered) {
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, cy);
        ctx.setLineDash([minDim * 0.005, minDim * 0.005]);
        ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.tertiary.max * (1 - proximity) * entrance);
        ctx.lineWidth = minDim * 0.0004; ctx.stroke();
        ctx.setLineDash([]);
      }

      // Moving point
      const pointR = minDim * (0.015 + proximity * 0.01);
      const pointColor = lerpColor(accentC, baseC, proximity * 0.3);
      ctx.beginPath(); ctx.arc(px, py, pointR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(pointColor, ELEMENT_ALPHA.primary.max * (1.5 + proximity) * entrance);
      ctx.fill();

      // Point glow (grows with proximity)
      const pgR = pointR * (2 + proximity * 3);
      const pgGrad = ctx.createRadialGradient(px, py, 0, px, py, pgR);
      pgGrad.addColorStop(0, rgba(accentC, ELEMENT_ALPHA.glow.max * (1 + proximity * 2) * entrance));
      pgGrad.addColorStop(1, rgba(accentC, 0));
      ctx.fillStyle = pgGrad;
      ctx.fillRect(px - pgR, py - pgR, pgR * 2, pgR * 2);

      // Centered flash
      if (s.centered) {
        const ca = easeOutCubic(s.centerAnim);
        const flashR = minDim * 0.15 * ca;
        const fGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
        fGrad.addColorStop(0, rgba(accentC, EMPHASIS_ALPHA.focal.min * (1 - ca) * entrance));
        fGrad.addColorStop(1, rgba(accentC, 0));
        ctx.fillStyle = fGrad;
        ctx.fillRect(cx - flashR, cy - flashR, flashR * 2, flashR * 2);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.centered) ctx.fillText('Drag to center', cx, cy + minDim * 0.15);
      else ctx.fillText('Centered.', cx, cy + minDim * 0.15);

      if (s.centered && !s.completionFired) { s.completionFired = true; cb.onResolve?.(); }
      cb.onStateChange?.(proximity);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging || stateRef.current.centered) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointX = (e.clientX - rect.left) / rect.width;
      stateRef.current.pointY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }} /></div>);
}