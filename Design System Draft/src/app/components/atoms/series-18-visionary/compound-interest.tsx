/**
 * ATOM 172: THE COMPOUND INTEREST ENGINE · Series 18 · Position 2
 * Tap repeatedly — at first the curve is frustratingly flat.
 * Then it rockets upward exponentially. Micro-actions compound.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const TOTAL_TAPS = 12;

export default function CompoundInterestAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    taps: 0, completionFired: false,
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
      const curveC: RGB = lerpColor(accentC, [100, 200, 140], 0.3);
      const nodeC: RGB = lerpColor(accentC, [220, 200, 80], 0.3);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Chart area
      const chartL = cx - minDim * 0.18;
      const chartR = cx + minDim * 0.18;
      const chartT = cy - minDim * 0.15;
      const chartB = cy + minDim * 0.1;
      const chartW = chartR - chartL;
      const chartH = chartB - chartT;

      // Axes
      ctx.beginPath();
      ctx.moveTo(chartL, chartT); ctx.lineTo(chartL, chartB); ctx.lineTo(chartR, chartB);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();

      // Exponential curve up to current taps
      if (s.taps > 0) {
        ctx.beginPath();
        for (let i = 0; i <= s.taps; i++) {
          const t = i / TOTAL_TAPS;
          const expVal = (Math.pow(2.5, t * 3) - 1) / (Math.pow(2.5, 3) - 1);
          const px = chartL + t * chartW;
          const py = chartB - expVal * chartH;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = rgba(curveC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.0016; ctx.stroke();

        // Data points
        for (let i = 0; i <= s.taps; i++) {
          const t = i / TOTAL_TAPS;
          const expVal = (Math.pow(2.5, t * 3) - 1) / (Math.pow(2.5, 3) - 1);
          const px = chartL + t * chartW;
          const py = chartB - expVal * chartH;
          ctx.beginPath(); ctx.arc(px, py, minDim * 0.004, 0, Math.PI * 2);
          ctx.fillStyle = rgba(nodeC, EMPHASIS_ALPHA.focal.max * entrance);
          ctx.fill();
        }
      }

      // Value label
      if (s.taps > 0) {
        const t = s.taps / TOTAL_TAPS;
        const expVal = (Math.pow(2.5, t * 3) - 1) / (Math.pow(2.5, 3) - 1);
        const valPct = Math.round(expVal * 100);
        const fs3 = Math.max(8, minDim * 0.014);
        ctx.font = `600 ${fs3}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(curveC, ELEMENT_ALPHA.text.max * entrance);
        ctx.fillText(`${valPct}%`, chartR + minDim * 0.04, chartB - expVal * chartH);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.taps < TOTAL_TAPS) ctx.fillText(`Tap to compound (${s.taps}/${TOTAL_TAPS})`, cx, chartB + minDim * 0.06);
      else ctx.fillText('Compounded.', cx, chartB + minDim * 0.06);

      if (s.taps >= TOTAL_TAPS && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.taps / TOTAL_TAPS);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.taps < TOTAL_TAPS) { s.taps++; cbRef.current.onHaptic('tap'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}