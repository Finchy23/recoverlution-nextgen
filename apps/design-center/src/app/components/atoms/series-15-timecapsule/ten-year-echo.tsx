/**
 * ATOM 149: THE 10-YEAR ECHO ENGINE · Series 15 · Position 9
 * Hold to "record" a waveform. It crystallizes into a diamond and drops
 * into a deep starfield.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function TenYearEchoAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, recordProgress: 0, crystallized: false, dropAnim: 0,
    waveform: new Array(40).fill(0) as number[],
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
      const diamondC: RGB = lerpColor(accentC, [200, 220, 255], 0.4);

      if (s.holding && !s.crystallized) {
        s.recordProgress = Math.min(1, s.recordProgress + 0.005);
        // Generate waveform
        s.waveform.shift();
        const ms = motionScale(p.reducedMotion);
        s.waveform.push(Math.sin(s.frameCount * 0.15 * ms) * 0.5 + Math.sin(s.frameCount * 0.07 * ms) * 0.3 + Math.random() * 0.2);
      }
      if (s.recordProgress >= 1 && !s.crystallized) { s.crystallized = true; cb.onHaptic('seal_stamp'); }
      if (s.crystallized) s.dropAnim = Math.min(1, s.dropAnim + 0.01);
      const da = easeOutCubic(s.dropAnim);

      // Background with stars
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms + da * 0.1) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Stars (appear with drop)
      if (da > 0.2 && !p.reducedMotion) {
        for (let i = 0; i < 20; i++) {
          const sx = (Math.sin(i * 7.3) * 0.5 + 0.5) * w;
          const sy = (Math.cos(i * 5.1) * 0.5 + 0.5) * h;
          ctx.fillStyle = rgba(diamondC, ELEMENT_ALPHA.tertiary.max * da * entrance * (0.3 + Math.sin(s.frameCount * 0.02 * ms + i) * 0.2));
          ctx.fillRect(sx, sy, minDim * 0.002, minDim * 0.002);
        }
      }

      // Waveform (fades as crystallized)
      if (!s.crystallized) {
        const waveW = minDim * 0.3;
        const waveLeft = cx - waveW / 2;
        ctx.beginPath();
        for (let i = 0; i < s.waveform.length; i++) {
          const wx = waveLeft + (i / s.waveform.length) * waveW;
          const wy = cy + s.waveform[i] * minDim * 0.04;
          i === 0 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.strokeStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance * s.recordProgress);
        ctx.lineWidth = minDim * 0.001; ctx.stroke();

        // Record indicator
        const recR = minDim * 0.008;
        ctx.beginPath(); ctx.arc(cx - minDim * 0.18, cy - minDim * 0.06, recR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(accentC, [220, 50, 40] as RGB, 0.3), ELEMENT_ALPHA.primary.max * (0.5 + Math.sin(s.frameCount * 0.1 * ms) * 0.5) * entrance);
        ctx.fill();
      }

      // Diamond (crystallized waveform)
      if (s.crystallized) {
        const diamondY = cy - da * minDim * 0.15;
        const dSize = minDim * 0.03 * (1 - da * 0.3);
        ctx.save(); ctx.translate(cx, diamondY);
        ctx.beginPath();
        ctx.moveTo(0, -dSize); ctx.lineTo(dSize * 0.6, 0);
        ctx.lineTo(0, dSize); ctx.lineTo(-dSize * 0.6, 0);
        ctx.closePath();
        ctx.fillStyle = rgba(diamondC, EMPHASIS_ALPHA.accent.max * entrance);
        ctx.fill();

        const dgR = dSize * 3;
        const dgGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, dgR);
        dgGrad.addColorStop(0, rgba(diamondC, EMPHASIS_ALPHA.focal.min * entrance * (1 - da * 0.5)));
        dgGrad.addColorStop(1, rgba(diamondC, 0));
        ctx.fillStyle = dgGrad;
        ctx.fillRect(-dgR, -dgR, dgR * 2, dgR * 2);
        ctx.restore();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.crystallized) ctx.fillText('Hold to record', cx, cy + minDim * 0.12);
      else if (da > 0.5) ctx.fillText('Time capsule sealed.', cx, cy + minDim * 0.12);

      if (da >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.crystallized ? 0.5 + da * 0.5 : s.recordProgress * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}