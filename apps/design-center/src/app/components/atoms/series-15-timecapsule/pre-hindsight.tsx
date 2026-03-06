/**
 * ATOM 146: THE PRE-HINDSIGHT ENGINE · Series 15 · Position 6
 * Start at the summit. Tap to generate stepping stones backward down to base.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const STEPS = 6;

export default function PreHindsightAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    stepsRevealed: 0, completionFired: false,
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
      const goldC: RGB = lerpColor(accentC, [255, 220, 100], 0.4);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Summit (top)
      const summitY = cy - minDim * 0.15;
      const baseY = cy + minDim * 0.15;
      ctx.beginPath(); ctx.arc(cx, summitY, minDim * 0.015, 0, Math.PI * 2);
      ctx.fillStyle = rgba(goldC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();
      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `600 ${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(goldC, ELEMENT_ALPHA.text.max * entrance);
      ctx.fillText('GOAL', cx, summitY - minDim * 0.025);

      // Steps (revealed from top downward)
      for (let i = 0; i < STEPS; i++) {
        const t = (i + 1) / (STEPS + 1);
        const stepY = summitY + (baseY - summitY) * t;
        const stepX = cx + Math.sin(i * 1.5) * minDim * 0.06;

        if (i < s.stepsRevealed) {
          // Step stone
          const stepW = minDim * 0.08; const stepH = minDim * 0.02;
          ctx.fillStyle = rgba(lerpColor(goldC, baseC, t * 0.5), ELEMENT_ALPHA.primary.max * 1.5 * entrance);
          ctx.fillRect(stepX - stepW / 2, stepY - stepH / 2, stepW, stepH);

          // Connection line
          const prevX = i === 0 ? cx : cx + Math.sin((i - 1) * 1.5) * minDim * 0.06;
          const prevY = i === 0 ? summitY : summitY + (baseY - summitY) * (i / (STEPS + 1));
          ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(stepX, stepY);
          ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance);
          ctx.lineWidth = minDim * 0.0006; ctx.stroke();

          ctx.font = `${Math.max(6, minDim * 0.009)}px -apple-system, sans-serif`;
          ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
          ctx.fillText(`Step ${STEPS - i}`, stepX, stepY + minDim * 0.025);
        }
      }

      // Base (NOW)
      ctx.beginPath(); ctx.arc(cx, baseY, minDim * 0.01, 0, Math.PI * 2);
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fill();
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('NOW', cx, baseY + minDim * 0.03);

      if (s.stepsRevealed < STEPS) {
        ctx.fillText('Tap to reveal next step', cx, baseY + minDim * 0.07);
      }

      if (s.stepsRevealed >= STEPS && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.stepsRevealed / STEPS);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      if (stateRef.current.stepsRevealed < STEPS) { stateRef.current.stepsRevealed++; cbRef.current.onHaptic('step_advance'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}