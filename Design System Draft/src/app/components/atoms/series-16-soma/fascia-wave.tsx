/**
 * ATOM 153: THE FASCIA WAVE ENGINE · Series 16 · Position 3
 * Hold to build tension in a tensile band. Release triggers a slow-motion
 * wave that propagates across the screen — myofascial discharge.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function FasciaWaveAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, tension: 0, released: false, waveProgress: 0,
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
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const waveC: RGB = lerpColor(accentC, [180, 120, 200], 0.3);

      if (s.holding && !s.released) s.tension = Math.min(1, s.tension + 0.005);
      if (s.released) s.waveProgress = Math.min(1, s.waveProgress + 0.008);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Tension band
      const bandY = cy;
      const bandW = minDim * 0.4;
      const bandLeft = cx - bandW / 2;
      const segments = 60;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const bx = bandLeft + t * bandW;
        let by = bandY;

        if (!s.released) {
          // Taut vibration
          const vibAmp = s.tension * minDim * 0.02;
          const vibFreq = 10 + s.tension * 20;
          by += Math.sin(t * Math.PI) * vibAmp * (!p.reducedMotion ? Math.sin(s.frameCount * 0.3 * ms + t * vibFreq) : 0.5);
        } else {
          // Wave propagation
          const wavePos = s.waveProgress;
          const dist = Math.abs(t - wavePos);
          const waveWidth = 0.15;
          if (dist < waveWidth) {
            const waveShape = Math.cos((dist / waveWidth) * Math.PI * 0.5);
            by += waveShape * minDim * 0.06 * s.tension * (1 - s.waveProgress * 0.5);
          }
        }

        i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
      }

      const bandAlpha = s.released ? (1 - s.waveProgress * 0.3) : (0.5 + s.tension * 0.5);
      ctx.strokeStyle = rgba(waveC, ELEMENT_ALPHA.primary.max * bandAlpha * 2 * entrance);
      ctx.lineWidth = minDim * (0.002 + s.tension * 0.003);
      ctx.stroke();

      // Tension indicator
      if (!s.released) {
        const barW = minDim * 0.2; const barH = minDim * 0.008;
        const barX = cx - barW / 2; const barY = cy + minDim * 0.1;
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = rgba(waveC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(barX, barY, barW * s.tension, barH);
      }

      // Wave glow trail
      if (s.released) {
        const trailX = bandLeft + s.waveProgress * bandW;
        const trailR = minDim * 0.08 * s.tension;
        const tGrad = ctx.createRadialGradient(trailX, bandY, 0, trailX, bandY, trailR);
        tGrad.addColorStop(0, rgba(waveC, EMPHASIS_ALPHA.focal.min * (1 - s.waveProgress) * entrance));
        tGrad.addColorStop(1, rgba(waveC, 0));
        ctx.fillStyle = tGrad;
        ctx.fillRect(trailX - trailR, bandY - trailR, trailR * 2, trailR * 2);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.released) ctx.fillText('Hold to build tension', cx, cy + minDim * 0.16);
      else if (s.waveProgress > 0.9) ctx.fillText('Released.', cx, cy + minDim * 0.16);

      if (s.waveProgress >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.released ? 0.5 + s.waveProgress * 0.5 : s.tension * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.released) return;
      stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.holding = false; canvas.releasePointerCapture(e.pointerId);
      if (s.tension > 0.3 && !s.released) { s.released = true; cbRef.current.onHaptic('drag_snap'); }
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}