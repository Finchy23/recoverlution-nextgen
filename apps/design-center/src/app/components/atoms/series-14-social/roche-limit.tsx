/**
 * ATOM 139: THE ROCHE LIMIT ENGINE · Series 14 · Position 9
 * Drag your planet close to a smaller moon. Too close = fracture.
 * Back away to safe orbit distance.
 */
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';

export default function RocheLimitAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    planetX: 0, planetY: 0, dragging: false,
    moonHealth: 1, safeOrbit: false, safeAnim: 0,
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    stateRef.current.planetX = viewport.width * 0.3;
    stateRef.current.planetY = viewport.height * 0.5;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;

      const moonX = cx + minDim * 0.1; const moonY = cy;
      const moonR = minDim * 0.025;
      const planetR = minDim * 0.04;
      const rocheDist = minDim * 0.12;
      const safeDist = minDim * 0.18;

      const dx = s.planetX - moonX; const dy = s.planetY - moonY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Damage if too close
      if (dist < rocheDist) {
        s.moonHealth = Math.max(0.2, s.moonHealth - 0.002);
        if (s.frameCount % 15 === 0) cb.onHaptic('error_boundary');
      } else if (dist > safeDist * 0.9) {
        s.moonHealth = Math.min(1, s.moonHealth + 0.003);
        if (s.moonHealth > 0.9 && !s.safeOrbit) { s.safeOrbit = true; cb.onHaptic('completion'); }
      }
      if (s.safeOrbit) s.safeAnim = Math.min(1, s.safeAnim + 0.015);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Safe orbit ring
      ctx.beginPath(); ctx.arc(moonX, moonY, safeDist, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.setLineDash([minDim * 0.004, minDim * 0.006]); ctx.stroke(); ctx.setLineDash([]);

      // Roche limit ring
      ctx.beginPath(); ctx.arc(moonX, moonY, rocheDist, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(lerpColor(accentC, [220, 70, 50] as RGB, 0.3), ELEMENT_ALPHA.secondary.max * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();

      // Moon (shakes when damaged)
      const shake = s.moonHealth < 0.8 && !p.reducedMotion ? (Math.random() - 0.5) * minDim * 0.003 * (1 - s.moonHealth) : 0;
      ctx.beginPath(); ctx.arc(moonX + shake, moonY + shake, moonR * s.moonHealth, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * (0.5 + s.moonHealth) * entrance);
      ctx.fill();

      // Fracture particles
      if (s.moonHealth < 0.7 && !p.reducedMotion) {
        for (let i = 0; i < 3; i++) {
          const a = Math.random() * Math.PI * 2;
          const pr = moonR + Math.random() * minDim * 0.02;
          ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.secondary.max * (1 - s.moonHealth) * entrance);
          ctx.fillRect(moonX + Math.cos(a) * pr, moonY + Math.sin(a) * pr, minDim * 0.002, minDim * 0.002);
        }
      }

      // Planet (user)
      ctx.beginPath(); ctx.arc(s.planetX, s.planetY, planetR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fill();

      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('You', s.planetX, s.planetY + planetR + minDim * 0.02);
      ctx.fillText('Them', moonX, moonY + moonR + minDim * 0.02);
      if (dist < rocheDist) ctx.fillText('Too close!', cx, h - minDim * 0.05);
      else if (s.safeOrbit) ctx.fillText('Safe distance.', cx, h - minDim * 0.05);

      if (s.safeAnim >= 1 && !s.completionFired) { s.completionFired = true; cb.onResolve?.(); }
      cb.onStateChange?.(s.moonHealth);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.planetX = (e.clientX - rect.left) / rect.width * viewport.width;
      stateRef.current.planetY = (e.clientY - rect.top) / rect.height * viewport.height;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }} /></div>);
}