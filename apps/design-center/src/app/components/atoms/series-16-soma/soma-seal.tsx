/**
 * ATOM 160: THE SOMA SEAL · Series 16 · Position 10
 * Hold to generate a fingerprint-like organic shape that expands
 * outward with a deep 60 BPM pulse. The body knowing.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function SomaSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, growth: 0, sealed: false, sealAnim: 0,
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
      const organicC: RGB = lerpColor(accentC, [200, 170, 140], 0.3);

      if (s.holding && !s.sealed) s.growth = Math.min(1, s.growth + 0.004);
      if (s.growth >= 1 && !s.sealed) { s.sealed = true; cb.onHaptic('seal_stamp'); }
      if (s.sealed) s.sealAnim = Math.min(1, s.sealAnim + 0.015);
      const sa = easeOutCubic(s.sealAnim);

      // 60 BPM pulse (1 beat per second)
      const ms = motionScale(p.reducedMotion);
      const bpm60 = !p.reducedMotion ? Math.sin(s.frameCount * (Math.PI * 2 / 60) * ms) : 0;
      const pulse = 0.5 + bpm60 * 0.5 * s.growth;

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.04 * ms + s.growth * 0.1) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * (1 + pulse * 0.5) * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Fingerprint rings
      const maxR = minDim * (0.06 + s.growth * 0.1);
      const ringCount = Math.ceil(s.growth * 8);
      for (let i = 0; i < ringCount; i++) {
        const t = (i + 1) / 8;
        const rr = maxR * t * (1 + pulse * 0.05);

        ctx.beginPath();
        // Organic wobble
        const segments = 40;
        for (let j = 0; j <= segments; j++) {
          const angle = (j / segments) * Math.PI * 2;
          const wobble = !p.reducedMotion
            ? Math.sin(angle * 3 + i * 0.5) * minDim * 0.003 * s.growth
            : 0;
          const px = cx + Math.cos(angle) * (rr + wobble);
          const py = cy + Math.sin(angle) * (rr * 0.7 + wobble); // Slightly elliptical
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();

        const ringAlpha = s.sealed ? (1 + sa) : 1;
        ctx.strokeStyle = rgba(organicC, ELEMENT_ALPHA.primary.max * ringAlpha * (1 - t * 0.3) * entrance);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }

      // Center core
      const coreR = minDim * 0.01 * (1 + pulse * 0.3);
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(organicC, ELEMENT_ALPHA.primary.max * (1.5 + s.growth) * entrance);
      ctx.fill();

      // Seal glow
      if (s.sealed) {
        const sealR = maxR * (1 + sa * 0.5);
        const sGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sealR);
        sGrad.addColorStop(0, rgba(organicC, EMPHASIS_ALPHA.focal.min * sa * entrance));
        sGrad.addColorStop(1, rgba(organicC, 0));
        ctx.fillStyle = sGrad;
        ctx.fillRect(cx - sealR, cy - sealR, sealR * 2, sealR * 2);
      }

      // Pulse indicator
      if (s.growth > 0.3) {
        const piR = minDim * 0.003;
        const piY = cy + maxR + minDim * 0.04;
        ctx.beginPath(); ctx.arc(cx, piY, piR * (1 + pulse), 0, Math.PI * 2);
        ctx.fillStyle = rgba(organicC, ELEMENT_ALPHA.primary.max * pulse * entrance);
        ctx.fill();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.sealed) ctx.fillText('Hold to grow', cx, cy + maxR + minDim * 0.08);
      else if (sa > 0.5) ctx.fillText('The body knows.', cx, cy + maxR + minDim * 0.08);

      if (sa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.growth);
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