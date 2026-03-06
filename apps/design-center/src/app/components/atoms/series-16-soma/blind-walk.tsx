/**
 * ATOM 157: THE BLIND WALK ENGINE · Series 16 · Position 7
 * Tap to take steps in darkness. Each step reveals a drumbeat glow.
 * After 3 steps, golden light floods — the floor was always there.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const TOTAL_STEPS = 3;

export default function BlindWalkAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    steps: 0, stepAnims: [] as number[], floodAnim: 0,
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
      const goldC: RGB = lerpColor(accentC, [255, 210, 100], 0.4);

      const complete = s.steps >= TOTAL_STEPS;
      if (complete) s.floodAnim = Math.min(1, s.floodAnim + 0.012);
      const fa = easeOutCubic(s.floodAnim);

      // Advance step anims
      for (let i = 0; i < s.stepAnims.length; i++) {
        s.stepAnims[i] = Math.min(1, s.stepAnims[i] + 0.03);
      }

      // Background — mostly dark, lightens on completion
      const bgBrightness = fa * 0.3;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.glow.min * entrance);
      ctx.fillRect(0, 0, w, h);

      // Golden flood on completion
      if (fa > 0) {
        const floodR = minDim * 0.5 * fa;
        const fGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, floodR);
        fGrad.addColorStop(0, rgba(goldC, EMPHASIS_ALPHA.focal.max * fa * entrance));
        fGrad.addColorStop(0.6, rgba(goldC, ELEMENT_ALPHA.glow.max * fa * entrance));
        fGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = fGrad; ctx.fillRect(0, 0, w, h);
      }

      // Step footprints
      const footSpacing = minDim * 0.1;
      const footStartY = cy + minDim * 0.08;
      for (let i = 0; i < s.stepAnims.length; i++) {
        const sa = easeOutCubic(s.stepAnims[i]);
        const footY = footStartY - i * footSpacing;
        const footX = cx + (i % 2 === 0 ? -1 : 1) * minDim * 0.03;

        // Footprint glow
        const glowR2 = minDim * 0.05 * sa;
        const fgGrad = ctx.createRadialGradient(footX, footY, 0, footX, footY, glowR2);
        fgGrad.addColorStop(0, rgba(goldC, EMPHASIS_ALPHA.focal.max * sa * entrance));
        fgGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = fgGrad;
        ctx.fillRect(footX - glowR2, footY - glowR2, glowR2 * 2, glowR2 * 2);

        // Foot shape
        ctx.beginPath();
        ctx.ellipse(footX, footY, minDim * 0.012, minDim * 0.02, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba(goldC, EMPHASIS_ALPHA.focal.max * sa * entrance);
        ctx.fill();
      }

      // Instructions
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      if (!complete) {
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText(`Tap to step (${s.steps}/${TOTAL_STEPS})`, cx, cy + minDim * 0.18);
      } else if (fa > 0.7) {
        ctx.fillStyle = rgba(goldC, ELEMENT_ALPHA.text.max * fa * entrance);
        ctx.fillText('The ground was always there.', cx, cy + minDim * 0.18);
      }

      if (fa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.steps / TOTAL_STEPS);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.steps < TOTAL_STEPS) { s.steps++; s.stepAnims.push(0); cbRef.current.onHaptic('step_advance'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}