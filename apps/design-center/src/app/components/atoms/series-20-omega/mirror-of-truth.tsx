/**
 * ATOM 194: THE MIRROR OF TRUTH ENGINE · Series 20 · Position 4
 * Look at the hero. Look at the villain. Total radical self-acceptance.
 * Drag to crossfade dark and bright masks — they fuse into one glowing face.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

export default function MirrorOfTruthAtom({
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
    blendProgress: 0, dragging: false, lastX: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const drawFace = (x: number, y: number, r: number, colr: RGB, alpha: number, minDim: number) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(colr, alpha); ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      const eyeY = y - r * 0.15; const eyeSpread = r * 0.3;
      ctx.beginPath(); ctx.arc(x - eyeSpread, eyeY, r * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = rgba(colr, alpha); ctx.fill();
      ctx.beginPath(); ctx.arc(x + eyeSpread, eyeY, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.2, y + r * 0.2);
      ctx.quadraticCurveTo(x, y + r * 0.3, x + r * 0.2, y + r * 0.2);
      ctx.strokeStyle = rgba(colr, alpha); ctx.lineWidth = minDim * 0.0004; ctx.stroke();
    };

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const darkC: RGB = lerpColor(accentC, [60, 50, 70], 0.5);
      const brightC: RGB = lerpColor(accentC, [240, 220, 180], 0.3);
      const bp = easeOutCubic(s.blendProgress);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      const faceR = minDim * 0.08;
      const separation = minDim * 0.1 * (1 - bp);

      // Dark mask (left)
      drawFace(cx - separation, cy, faceR, darkC, ELEMENT_ALPHA.primary.max * (1 - bp * 0.3) * entrance, minDim);
      if (bp < 0.4) {
        const lfs = minDim * 0.008 * (1 - bp * 2.5);
        ctx.font = `${lfs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(darkC, ELEMENT_ALPHA.text.min * (1 - bp * 2.5) * entrance);
        ctx.fillText('Shadow', cx - separation, cy + faceR + minDim * 0.02);
      }

      // Bright mask (right)
      drawFace(cx + separation, cy, faceR, brightC, ELEMENT_ALPHA.primary.max * (1 - bp * 0.3) * entrance, minDim);
      if (bp < 0.4) {
        const lfs = minDim * 0.008 * (1 - bp * 2.5);
        ctx.font = `${lfs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(brightC, ELEMENT_ALPHA.text.min * (1 - bp * 2.5) * entrance);
        ctx.fillText('Light', cx + separation, cy + faceR + minDim * 0.02);
      }

      // Fused face at center (emerges)
      if (bp > 0.3) {
        const fuseAlpha = (bp - 0.3) / 0.7;
        const humanC: RGB = lerpColor(darkC, brightC, 0.5);
        const fuseGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, faceR * 2);
        fuseGlow.addColorStop(0, rgba(humanC, ELEMENT_ALPHA.glow.max * fuseAlpha * entrance));
        fuseGlow.addColorStop(1, rgba(humanC, 0));
        ctx.fillStyle = fuseGlow; ctx.fillRect(cx - faceR * 2, cy - faceR * 2, faceR * 4, faceR * 4);
        drawFace(cx, cy, faceR * (1 + fuseAlpha * 0.2), humanC, EMPHASIS_ALPHA.focal.max * fuseAlpha * entrance, minDim);
      }

      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (bp < 0.95) ctx.fillText('Drag to merge', cx, h - minDim * 0.04);
      else ctx.fillText('Complete acceptance.', cx, h - minDim * 0.04);

      if (bp >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.blendProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const dx = Math.abs(e.clientX - s.lastX);
      s.blendProgress = Math.min(1, s.blendProgress + dx * 0.003);
      s.lastX = e.clientX;
      if (s.blendProgress > 0.5 && s.blendProgress < 0.52) cbRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}
