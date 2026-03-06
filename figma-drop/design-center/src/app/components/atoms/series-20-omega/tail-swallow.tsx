/**
 * ATOM 199: THE TAIL SWALLOW ENGINE · Series 20 · Position 9
 * A serpent chasing its tail. The end is the beginning. The Ouroboros Loop.
 * Draw to trace the serpent — head catches tail, fusing into a perfect ring.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

export default function TailSwallowAtom({
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
    traceProgress: 0, drawing: false, fuseAnim: 0, fused: false, completionFired: false,
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
      const serpentC: RGB = lerpColor(accentC, [100, 180, 120], 0.3);
      const goldC: RGB = lerpColor(accentC, [220, 190, 80], 0.3);
      const eyeC: RGB = lerpColor(baseC, [255, 255, 200], 0.6);
      const ringR = minDim * 0.1;

      if (s.traceProgress >= 1 && !s.fused) s.fused = true;
      if (s.fused) s.fuseAnim = Math.min(1, s.fuseAnim + 0.015);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Ghost ring guide
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * 0.5 * entrance);
      ctx.lineWidth = minDim * 0.0004; ctx.setLineDash([minDim * 0.003, minDim * 0.003]); ctx.stroke();
      ctx.setLineDash([]);

      // Serpent body
      const totalAngle = s.traceProgress * Math.PI * 2;
      if (totalAngle > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + totalAngle);
        const bodyC = s.fused ? lerpColor(serpentC, goldC, easeOutCubic(s.fuseAnim)) : serpentC;
        ctx.strokeStyle = rgba(bodyC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * (0.004 + (s.fused ? easeOutCubic(s.fuseAnim) * 0.002 : 0));
        ctx.stroke();
      }

      // Serpent head
      const headAngle = -Math.PI / 2 + totalAngle;
      const headX = cx + Math.cos(headAngle) * ringR;
      const headY = cy + Math.sin(headAngle) * ringR;
      const headR = minDim * 0.008;
      ctx.beginPath(); ctx.arc(headX, headY, headR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(serpentC, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill();
      // Eyes
      const eyeOff = headR * 0.4;
      ctx.beginPath(); ctx.arc(headX - eyeOff, headY - eyeOff, headR * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(eyeC, ELEMENT_ALPHA.primary.max * entrance); ctx.fill();
      ctx.beginPath(); ctx.arc(headX + eyeOff, headY - eyeOff, headR * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Tail marker
      const tailX = cx + Math.cos(-Math.PI / 2) * ringR;
      const tailY = cy + Math.sin(-Math.PI / 2) * ringR;
      if (!s.fused) {
        ctx.beginPath(); ctx.arc(tailX, tailY, minDim * 0.004, 0, Math.PI * 2);
        ctx.fillStyle = rgba(serpentC, ELEMENT_ALPHA.tertiary.max * entrance); ctx.fill();
      }

      // Fuse glow
      if (s.fused) {
        const fa = easeOutCubic(s.fuseAnim);
        const fGrad = ctx.createRadialGradient(cx, cy, ringR * 0.7, cx, cy, ringR * 1.5);
        fGrad.addColorStop(0, rgba(goldC, ELEMENT_ALPHA.glow.max * fa * entrance));
        fGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = fGrad; ctx.fillRect(0, 0, w, h);
      }

      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.fused) ctx.fillText('Draw to trace the serpent', cx, h - minDim * 0.04);
      else ctx.fillText('The Ouroboros.', cx, h - minDim * 0.04);

      if (s.fused && s.fuseAnim >= 0.5 && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(s.traceProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.drawing = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.drawing || s.fused) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const cx2 = viewport.width / 2; const cy2 = viewport.height / 2;
      const dist = Math.sqrt((px - cx2) ** 2 + (py - cy2) ** 2);
      const minDim2 = Math.min(viewport.width, viewport.height);
      const ringR2 = minDim2 * 0.1;
      if (Math.abs(dist - ringR2) < minDim2 * 0.04) {
        s.traceProgress = Math.min(1, s.traceProgress + 0.005);
        if (s.traceProgress >= 1) cbRef.current.onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => { stateRef.current.drawing = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
