/**
 * ATOM 191: THE PRISM RETURN ENGINE · Series 20 · Position 1
 * Pull all refracted colors back into a single blinding white truth.
 * Drag spectral beams inward — additive blending fuses them into pure white.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

export default function PrismReturnAtom({
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
    convergence: 0, dragging: false, lastX: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    // Spectral hue offsets blended through primaryRgb
    const hueTargets: RGB[] = [
      [255, 60, 60], [255, 160, 40], [255, 240, 60],
      [60, 220, 80], [60, 140, 255], [100, 60, 220], [180, 60, 200],
    ];

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb;
      const whiteC: RGB = lerpColor(baseC, [255, 255, 255], 0.85);
      const conv = easeOutCubic(s.convergence);

      // Background glow
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * (1 + conv) * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Prism triangle at center
      const prismH = minDim * 0.06;
      ctx.beginPath();
      ctx.moveTo(cx, cy - prismH);
      ctx.lineTo(cx - prismH * 0.7, cy + prismH * 0.5);
      ctx.lineTo(cx + prismH * 0.7, cy + prismH * 0.5);
      ctx.closePath();
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Spectral beams — converge toward prism
      const maxSpread = minDim * 0.18;
      for (let i = 0; i < hueTargets.length; i++) {
        const frac = (i / (hueTargets.length - 1)) - 0.5;
        const spread = maxSpread * (1 - conv);
        const startX = cx + frac * minDim * 0.3;
        const startY = cy + minDim * 0.2;
        const endX = cx + frac * spread;
        const endY = cy;

        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY);
        const beamC: RGB = lerpColor(baseC, hueTargets[i], 0.6);
        ctx.strokeStyle = rgba(beamC, EMPHASIS_ALPHA.focal.max * (1 - conv * 0.3) * entrance);
        ctx.lineWidth = minDim * (0.0016 + conv * 0.0008); ctx.stroke();

        // Beam glow
        const gR = minDim * 0.01;
        const bGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, gR);
        bGrad.addColorStop(0, rgba(beamC, ELEMENT_ALPHA.glow.max * (1 - conv * 0.7) * entrance));
        bGrad.addColorStop(1, rgba(beamC, 0));
        ctx.fillStyle = bGrad; ctx.fillRect(endX - gR, endY - gR, gR * 2, gR * 2);
      }

      // White output beam (appears as convergence increases)
      if (conv > 0.2) {
        const whiteAlpha = (conv - 0.2) / 0.8;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy - minDim * 0.15 * whiteAlpha);
        ctx.strokeStyle = rgba(whiteC, EMPHASIS_ALPHA.focal.max * whiteAlpha * entrance);
        ctx.lineWidth = minDim * 0.002 * whiteAlpha; ctx.stroke();

        // White glow burst at full convergence
        if (conv > 0.8) {
          const burstFrac = (conv - 0.8) / 0.2;
          const burstR = minDim * 0.15 * burstFrac;
          const bGrad = ctx.createRadialGradient(cx, cy - minDim * 0.05, 0, cx, cy - minDim * 0.05, burstR);
          bGrad.addColorStop(0, rgba(whiteC, EMPHASIS_ALPHA.accent.max * burstFrac * entrance));
          bGrad.addColorStop(1, rgba(whiteC, 0));
          ctx.fillStyle = bGrad; ctx.fillRect(0, 0, w, h);
        }
      }

      const fs = Math.max(minDim * 0.01, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (conv < 0.95) ctx.fillText('Drag inward to converge', cx, h - minDim * 0.04);
      else ctx.fillText('White truth.', cx, h - minDim * 0.04);

      if (conv >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.convergence);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const dx = s.lastX - e.clientX;
      s.convergence = Math.max(0, Math.min(1, s.convergence + dx * 0.004));
      s.lastX = e.clientX;
      if (s.convergence > 0.5 && s.convergence < 0.52) cbRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}
