/**
 * ATOM 148: THE WORST-CASE SIMULATOR ENGINE · Series 15 · Position 8
 * Swirling fog of fear. Drag to strip it into sterile wireframe blueprint.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function WorstCaseSimulatorAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    clarity: 0, dragging: false,
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
      const wireC: RGB = lerpColor(accentC, [100, 180, 220], 0.4);

      const cl = s.clarity;

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Fog particles (reduce with clarity)
      if (!p.reducedMotion) {
        const fogCount = Math.round(30 * (1 - cl));
        for (let i = 0; i < fogCount; i++) {
          const fx = cx + Math.sin(s.frameCount * 0.005 * ms + i * 2.1) * minDim * 0.2;
          const fy = cy + Math.cos(s.frameCount * 0.007 * ms + i * 1.7) * minDim * 0.15;
          const fr = minDim * (0.02 + Math.sin(i * 3.3) * 0.01);
          ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2);
          ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * (1 - cl) * entrance * 0.5);
          ctx.fill();
        }
      }

      // Wireframe (appears with clarity)
      if (cl > 0.1) {
        ctx.strokeStyle = rgba(wireC, ELEMENT_ALPHA.primary.max * cl * entrance);
        ctx.lineWidth = minDim * 0.0006;

        // Box
        const bW = minDim * 0.15; const bH = minDim * 0.1;
        ctx.strokeRect(cx - bW / 2, cy - bH / 2, bW, bH);

        // Internal grid lines
        ctx.beginPath();
        ctx.moveTo(cx - bW / 2, cy); ctx.lineTo(cx + bW / 2, cy);
        ctx.moveTo(cx, cy - bH / 2); ctx.lineTo(cx, cy + bH / 2);
        ctx.stroke();

        // Label
        const fs2 = Math.max(6, minDim * 0.009);
        ctx.font = `${fs2}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(wireC, ELEMENT_ALPHA.text.min * cl * entrance);
        ctx.fillText('WORST_CASE.plan', cx, cy - bH / 2 - minDim * 0.015);
        ctx.fillText(`survivability: ${Math.round(cl * 100)}%`, cx, cy + bH / 2 + minDim * 0.025);
      }

      // Slider
      const sliderY = cy + minDim * 0.18;
      const sliderW = minDim * 0.35;
      const sliderLeft = cx - sliderW / 2;
      ctx.beginPath(); ctx.moveTo(sliderLeft, sliderY); ctx.lineTo(sliderLeft + sliderW, sliderY);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      const handleX = sliderLeft + sliderW * cl;
      ctx.beginPath(); ctx.arc(handleX, sliderY, minDim * 0.012, 0, Math.PI * 2);
      ctx.fillStyle = rgba(wireC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      const fs = Math.max(7, minDim * 0.009);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Vague', sliderLeft, sliderY + minDim * 0.025);
      ctx.textAlign = 'right'; ctx.fillText('Concrete', sliderLeft + sliderW, sliderY + minDim * 0.025);

      if (cl >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(cl);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const sliderW = minDim2 * 0.35;
      const sliderLeft = viewport.width / 2 - sliderW / 2;
      stateRef.current.clarity = Math.max(0, Math.min(1, (px - sliderLeft) / sliderW));
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}