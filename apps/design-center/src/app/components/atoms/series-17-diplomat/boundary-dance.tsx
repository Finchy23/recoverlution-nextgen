/**
 * ATOM 165: THE BOUNDARY DANCE ENGINE · Series 17 · Position 5
 * Two circles — you and them. Drag to find the perfect boundary
 * distance. Too close vibrates. Too far disconnects. Perfect = harmony.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function BoundaryDanceAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    youX: 0.35, youY: 0.5, dragging: false, harmonyTime: 0,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const youC: RGB = lerpColor(accentC, [100, 160, 220], 0.3);
      const themC: RGB = lerpColor(accentC, [220, 140, 100], 0.3);
      const harmonyC: RGB = lerpColor(youC, themC, 0.5);

      const themX = 0.65 * w; const themY = 0.5 * h;
      const yx = s.youX * w; const yy = s.youY * h;
      const dist = Math.sqrt((yx - themX) ** 2 + (yy - themY) ** 2);
      const idealDist = minDim * 0.12;
      const tolerance = minDim * 0.02;
      const distError = Math.abs(dist - idealDist);
      const harmony = Math.max(0, 1 - distError / (minDim * 0.08));
      const tooClose = dist < idealDist - tolerance;

      if (harmony > 0.8) s.harmonyTime = Math.min(1, s.harmonyTime + 0.008);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Connection line
      ctx.beginPath(); ctx.moveTo(yx, yy); ctx.lineTo(themX, themY);
      const lineC = harmony > 0.7 ? harmonyC : tooClose ? [220, 60, 60] as RGB : baseC;
      ctx.strokeStyle = rgba(lineC, ELEMENT_ALPHA.primary.max * harmony * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Boundary ring (ideal distance)
      ctx.beginPath(); ctx.arc(themX, themY, idealDist, 0, Math.PI * 2);
      ctx.setLineDash([minDim * 0.005, minDim * 0.005]);
      ctx.strokeStyle = rgba(harmonyC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      ctx.setLineDash([]);

      // "Them" circle
      const circR = minDim * 0.03;
      ctx.beginPath(); ctx.arc(themX, themY, circR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(themC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // "You" circle (with vibration if too close)
      const vibX = tooClose && !p.reducedMotion ? Math.sin(s.frameCount * 0.8 * ms) * minDim * 0.004 * (1 - harmony) : 0;
      ctx.beginPath(); ctx.arc(yx + vibX, yy, circR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(youC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Harmony glow
      if (harmony > 0.5) {
        const midX = (yx + themX) / 2; const midY = (yy + themY) / 2;
        const hR = minDim * 0.06 * harmony;
        const hGrad = ctx.createRadialGradient(midX, midY, 0, midX, midY, hR);
        hGrad.addColorStop(0, rgba(harmonyC, ELEMENT_ALPHA.glow.max * harmony * 2 * entrance));
        hGrad.addColorStop(1, rgba(harmonyC, 0));
        ctx.fillStyle = hGrad; ctx.fillRect(midX - hR, midY - hR, hR * 2, hR * 2);
      }

      // Labels
      const fs = Math.max(7, minDim * 0.01);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(youC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('You', yx, yy + circR + minDim * 0.02);
      ctx.fillStyle = rgba(themC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Them', themX, themY + circR + minDim * 0.02);

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (tooClose) ctx.fillText('Too close', cx, h - minDim * 0.04);
      else if (harmony > 0.7) ctx.fillText('Balanced.', cx, h - minDim * 0.04);
      else ctx.fillText('Find the right distance', cx, h - minDim * 0.04);

      if (s.harmonyTime >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(harmony);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.youX = (e.clientX - rect.left) / rect.width;
      stateRef.current.youY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }} /></div>);
}