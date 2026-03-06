/**
 * ATOM 192: THE GOLDEN SPIRAL ENGINE · Series 20 · Position 2
 * Growth is a spiral. You are not circling. You are ascending.
 * Drag to uncoil a Fibonacci spiral revealing 3D helical elevation.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

export default function GoldenSpiralAtom({
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
    spiralProgress: 0, dragging: false, lastY: 0, stepFired: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const PHI = (1 + Math.sqrt(5)) / 2;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const spiralC: RGB = lerpColor(accentC, [218, 165, 32], 0.3);
      const sp = easeOutCubic(s.spiralProgress);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Draw golden spiral
      const maxTurns = 5;
      const totalSteps = 300;
      const visibleSteps = Math.floor(totalSteps * sp);
      ctx.beginPath();
      for (let i = 0; i <= visibleSteps; i++) {
        const t = (i / totalSteps) * maxTurns * Math.PI * 2;
        const r = minDim * 0.005 * Math.pow(PHI, t / (Math.PI * 2));
        const elevation = sp * minDim * 0.0003 * t;
        const px = cx + Math.cos(t) * r;
        const py = cy + Math.sin(t) * r - elevation;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rgba(spiralC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.lineWidth = minDim * 0.0016; ctx.stroke();

      // Fibonacci ratio boxes (subtle)
      const fibs = [1, 1, 2, 3, 5, 8];
      for (let i = 0; i < Math.min(fibs.length, Math.floor(sp * fibs.length)); i++) {
        const boxSize = minDim * 0.008 * fibs[i];
        const angle = i * Math.PI / 2;
        const bx = cx + Math.cos(angle) * boxSize * 2;
        const by = cy + Math.sin(angle) * boxSize * 2;
        ctx.strokeStyle = rgba(spiralC, ELEMENT_ALPHA.tertiary.max * entrance);
        ctx.lineWidth = minDim * 0.0004;
        ctx.strokeRect(bx - boxSize / 2, by - boxSize / 2, boxSize, boxSize);
      }

      // Current point glow
      if (visibleSteps > 0) {
        const t = (visibleSteps / totalSteps) * maxTurns * Math.PI * 2;
        const r = minDim * 0.005 * Math.pow(PHI, t / (Math.PI * 2));
        const elevation = sp * minDim * 0.0003 * t;
        const tipX = cx + Math.cos(t) * r;
        const tipY = cy + Math.sin(t) * r - elevation;
        const tGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, minDim * 0.015);
        tGrad.addColorStop(0, rgba(spiralC, ELEMENT_ALPHA.glow.max * entrance));
        tGrad.addColorStop(1, rgba(spiralC, 0));
        ctx.fillStyle = tGrad; ctx.fillRect(tipX - minDim * 0.015, tipY - minDim * 0.015, minDim * 0.03, minDim * 0.03);
      }

      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (sp < 0.95) ctx.fillText('Drag up to ascend', cx, h - minDim * 0.04);
      else ctx.fillText('Ascending.', cx, h - minDim * 0.04);

      const currentStep = Math.floor(sp * 5);
      if (currentStep > s.stepFired) { s.stepFired = currentStep; cb.onHaptic('step_advance'); }
      if (sp >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.spiralProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const dy = s.lastY - e.clientY;
      s.spiralProgress = Math.max(0, Math.min(1, s.spiralProgress + dy * 0.003));
      s.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}
