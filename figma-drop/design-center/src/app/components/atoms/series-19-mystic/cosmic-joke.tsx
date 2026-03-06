/**
 * ATOM 183: THE COSMIC JOKE ENGINE · Series 19 · Position 3
 * Profoundly serious, but fundamentally not. Drag rigid oppressive
 * lines — they bend into a smile, grey flips to warm gold.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function CosmicJokeAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    bendProgress: 0, dragging: false, lastY: 0, completed: false, completionFired: false,
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
      const greyC: RGB = lerpColor(baseC, [120, 120, 130], 0.4);
      const goldC: RGB = lerpColor(accentC, [240, 200, 80], 0.3);
      const blendC: RGB = lerpColor(greyC, goldC, s.bendProgress);

      if (s.bendProgress >= 0.95 && !s.completed) { s.completed = true; s.bendProgress = 1; }

      // Background — shifts from cold to warm
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(blendC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(blendC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Face circle
      const faceR = minDim * 0.1;
      ctx.beginPath(); ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(blendC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.lineWidth = minDim * 0.0012; ctx.stroke();

      // Eyes — dots
      const eyeY = cy - faceR * 0.2;
      const eyeSpread = faceR * 0.35;
      ctx.beginPath(); ctx.arc(cx - eyeSpread, eyeY, minDim * 0.006, 0, Math.PI * 2);
      ctx.fillStyle = rgba(blendC, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + eyeSpread, eyeY, minDim * 0.006, 0, Math.PI * 2);
      ctx.fill();

      // Mouth — morphs from flat line to smile
      const mouthY = cy + faceR * 0.2;
      const mouthW = faceR * 0.5;
      const bend = s.bendProgress * minDim * 0.04;
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY);
      ctx.quadraticCurveTo(cx, mouthY + bend, cx + mouthW, mouthY);
      ctx.strokeStyle = rgba(blendC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.lineWidth = minDim * 0.0016; ctx.stroke();

      // Rigid horizontal lines that bend with progress
      const lineCount = 5;
      for (let i = 0; i < lineCount; i++) {
        const ly = cy - minDim * 0.16 + i * minDim * 0.08;
        const lb = s.bendProgress * minDim * 0.02 * Math.sin((i + 1) * 0.8);
        ctx.beginPath();
        ctx.moveTo(cx - minDim * 0.2, ly);
        ctx.quadraticCurveTo(cx, ly + lb, cx + minDim * 0.2, ly);
        ctx.strokeStyle = rgba(blendC, ELEMENT_ALPHA.tertiary.max * (1 + s.bendProgress) * entrance);
        ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      }

      // Warm glow at completion
      if (s.completed) {
        const wGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, faceR * 2);
        wGrad.addColorStop(0, rgba(goldC, EMPHASIS_ALPHA.focal.min * entrance));
        wGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = wGrad; ctx.fillRect(0, 0, w, h);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.completed) ctx.fillText('Drag down to bend', cx, cy + faceR + minDim * 0.08);
      else ctx.fillText('The cosmic joke.', cx, cy + faceR + minDim * 0.08);

      if (s.completed && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.bendProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { if (stateRef.current.completed) return; stateRef.current.dragging = true; stateRef.current.lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const dy = e.clientY - s.lastY;
      s.bendProgress = Math.max(0, Math.min(1, s.bendProgress + dy * 0.003));
      s.lastY = e.clientY;
      if (s.bendProgress > 0.3 && s.bendProgress < 0.31) cbRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}