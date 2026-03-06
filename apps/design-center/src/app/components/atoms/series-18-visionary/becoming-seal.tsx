/**
 * ATOM 180: THE BECOMING SEAL · Series 18 · Position 10
 * Three silhouettes — past, present, future. Drag them together
 * to integrate the timeline. Blinding unified white flash.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function BecomingSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    pastX: 0.25, futureX: 0.75, dragging: '' as '' | 'past' | 'future',
    merged: false, mergeAnim: 0, completionFired: false,
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
      const pastC: RGB = lerpColor(accentC, [140, 120, 160], 0.4);
      const presentC: RGB = lerpColor(accentC, [200, 200, 200], 0.3);
      const futureC: RGB = lerpColor(accentC, [120, 180, 220], 0.4);

      if (s.merged) s.mergeAnim = Math.min(1, s.mergeAnim + 0.015);
      const ma = easeOutCubic(s.mergeAnim);

      // Check for merge
      if (!s.merged && Math.abs(s.pastX - 0.5) < 0.06 && Math.abs(s.futureX - 0.5) < 0.06) {
        s.merged = true; cb.onHaptic('seal_stamp');
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      const silH = minDim * 0.12;
      const silW = minDim * 0.03;

      const drawSilhouette = (x: number, color: RGB, alpha: number, label: string) => {
        // Head
        ctx.beginPath(); ctx.arc(x, cy - silH * 0.35, silW * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, ELEMENT_ALPHA.primary.max * alpha * entrance); ctx.fill();
        // Body
        ctx.fillRect(x - silW * 0.3, cy - silH * 0.2, silW * 0.6, silH * 0.4);
        // Label
        const fs = Math.max(6, minDim * 0.009);
        ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(color, ELEMENT_ALPHA.text.min * alpha * entrance);
        ctx.fillText(label, x, cy + silH * 0.35);
      };

      if (!s.merged) {
        drawSilhouette(s.pastX * w, pastC, 1, 'Past');
        drawSilhouette(cx, presentC, 1.5, 'Present');
        drawSilhouette(s.futureX * w, futureC, 1, 'Future');
      } else {
        // Merging animation
        const px = s.pastX * w + (cx - s.pastX * w) * ma;
        const fx = s.futureX * w + (cx - s.futureX * w) * ma;
        drawSilhouette(px, pastC, 1 - ma * 0.5, 'Past');
        drawSilhouette(cx, presentC, 1.5, 'Present');
        drawSilhouette(fx, futureC, 1 - ma * 0.5, 'Future');

        // White flash
        if (ma > 0.5) {
          const flashR = minDim * 0.25 * ma;
          const fGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
          fGrad.addColorStop(0, rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), EMPHASIS_ALPHA.focal.max * (ma - 0.5) * 2 * entrance));
          fGrad.addColorStop(1, rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), 0));
          ctx.fillStyle = fGrad; ctx.fillRect(0, 0, w, h);
        }
      }

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.merged) ctx.fillText('Drag past & future to center', cx, cy + minDim * 0.18);
      else ctx.fillText('Timeline integrated.', cx, cy + minDim * 0.18);

      if (ma >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.merged ? 1 : 0);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.merged) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const s = stateRef.current;
      if (Math.abs(px - s.pastX) < 0.08) s.dragging = 'past';
      else if (Math.abs(px - s.futureX) < 0.08) s.dragging = 'future';
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      if (s.dragging === 'past') s.pastX = Math.max(0.1, Math.min(0.55, px));
      else s.futureX = Math.max(0.45, Math.min(0.9, px));
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = ''; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}