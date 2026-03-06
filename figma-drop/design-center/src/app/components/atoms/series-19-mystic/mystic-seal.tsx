/**
 * ATOM 190: THE MYSTIC SEAL · Series 19 · Position 10
 * I Am That. Draw an infinity symbol — continuous soothing
 * harmonic glide, luminescent particle trails, boundless play.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface TrailPoint { x: number; y: number; age: number; }

export default function MysticSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    trail: [] as TrailPoint[], drawing: false, totalDrawn: 0,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const trailC: RGB = lerpColor(accentC, [200, 180, 240], 0.3);
      const glowC: RGB = lerpColor(accentC, [180, 220, 255], 0.3);

      // Age and cull trail
      for (let i = s.trail.length - 1; i >= 0; i--) {
        s.trail[i].age++;
        if (s.trail[i].age > 120) s.trail.splice(i, 1);
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Ghost infinity guide
      const infR = minDim * 0.08;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const ix = cx + infR * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        const iy = cy + infR * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        if (t === 0) ctx.moveTo(ix, iy); else ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * 0.5 * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();

      // Trail rendering
      for (let i = 1; i < s.trail.length; i++) {
        const tp = s.trail[i - 1]; const tc = s.trail[i];
        const life = Math.max(0, 1 - tc.age / 120);
        ctx.beginPath(); ctx.moveTo(tp.x, tp.y); ctx.lineTo(tc.x, tc.y);
        ctx.strokeStyle = rgba(trailC, EMPHASIS_ALPHA.focal.max * life * entrance);
        ctx.lineWidth = minDim * 0.002 * life; ctx.stroke();
        // Glow particles
        if (tc.age < 20 && i % 3 === 0) {
          const gR = minDim * 0.008 * life;
          const tGrad = ctx.createRadialGradient(tc.x, tc.y, 0, tc.x, tc.y, gR);
          tGrad.addColorStop(0, rgba(glowC, ELEMENT_ALPHA.glow.max * life * entrance));
          tGrad.addColorStop(1, rgba(glowC, 0));
          ctx.fillStyle = tGrad; ctx.fillRect(tc.x - gR, tc.y - gR, gR * 2, gR * 2);
        }
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Trace infinity', cx, h - minDim * 0.04);

      cbRef.current.onStateChange?.(Math.min(1, s.totalDrawn / 200));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.drawing = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      stateRef.current.trail.push({ x: px, y: py, age: 0 });
      stateRef.current.totalDrawn++;
      if (stateRef.current.totalDrawn % 30 === 0) cbRef.current.onHaptic('breath_peak');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.drawing = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}