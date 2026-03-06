/**
 * ATOM 181: THE MAYA VEIL ENGINE · Series 19 · Position 1
 * Rigid thoughts are projections on a screen. Tap to ripple the
 * interface like water — revealing that rigidity is mere reflection.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Ripple { x: number; y: number; age: number; }

export default function MayaVeilAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    ripples: [] as Ripple[], tapCount: 0, completionFired: false,
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
      const waterC: RGB = lerpColor(accentC, [100, 160, 220], 0.3);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // "Rigid" grid — distorted by ripples
      const gridSpacing = minDim * 0.04;
      for (let gx = gridSpacing; gx < w; gx += gridSpacing) {
        for (let gy = gridSpacing; gy < h; gy += gridSpacing) {
          let dx = 0, dy = 0;
          for (const rp of s.ripples) {
            const dist = Math.sqrt((gx - rp.x) ** 2 + (gy - rp.y) ** 2);
            const waveR = rp.age * minDim * 0.003;
            const amp = Math.max(0, 1 - Math.abs(dist - waveR) / (minDim * 0.04)) * minDim * 0.01 * Math.max(0, 1 - rp.age / 120);
            if (amp > 0) {
              const angle = Math.atan2(gy - rp.y, gx - rp.x);
              dx += Math.cos(angle) * amp * Math.sin(dist * 0.1 - rp.age * 0.2);
              dy += Math.sin(angle) * amp * Math.sin(dist * 0.1 - rp.age * 0.2);
            }
          }
          const nodeR = minDim * 0.002;
          const distort = Math.sqrt(dx * dx + dy * dy);
          const alpha = ELEMENT_ALPHA.tertiary.max * (1 + distort * 3) * entrance;
          ctx.beginPath(); ctx.arc(gx + dx, gy + dy, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(waterC, Math.min(alpha, EMPHASIS_ALPHA.focal.max));
          ctx.fill();
        }
      }

      // Ripple rings
      for (let i = s.ripples.length - 1; i >= 0; i--) {
        const rp = s.ripples[i];
        rp.age++;
        if (rp.age > 120) { s.ripples.splice(i, 1); continue; }
        const rAlpha = Math.max(0, 1 - rp.age / 120);
        const ringR = rp.age * minDim * 0.003;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(waterC, ELEMENT_ALPHA.primary.max * rAlpha * entrance);
        ctx.lineWidth = minDim * 0.001 * rAlpha; ctx.stroke();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.tapCount < 7) ctx.fillText('Tap to ripple the illusion', cx, h - minDim * 0.04);
      else ctx.fillText('Mere reflection.', cx, h - minDim * 0.04);

      if (s.tapCount >= 7 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(Math.min(1, s.tapCount / 7));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      stateRef.current.ripples.push({ x: px, y: py, age: 0 });
      stateRef.current.tapCount++;
      cbRef.current.onHaptic('tap');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}