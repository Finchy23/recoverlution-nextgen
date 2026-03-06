/**
 * ATOM 195: THE EVENT HORIZON ENGINE · Series 20 · Position 5
 * The next step is off the map. Trust your feet. Step.
 * Drag toward the singularity — gravitational pull stretches UI into the void.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

export default function EventHorizonAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    pullProgress: 0, dragging: false, lastY: 0, completionFired: false,
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
      const voidC: RGB = lerpColor(baseC, [10, 5, 20], 0.7);
      const edgeC: RGB = lerpColor(accentC, [255, 140, 40], 0.3);
      const safeC: RGB = lerpColor(baseC, [200, 220, 255], 0.5);
      const pp = easeOutCubic(s.pullProgress);

      // Background darkens with pull
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
      bgGrad.addColorStop(0, rgba(voidC, pp * 0.15 * entrance));
      bgGrad.addColorStop(1, rgba(baseC, ELEMENT_ALPHA.glow.max * (1 - pp * 0.5) * entrance));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Event horizon ring
      const horizonR = minDim * (0.12 - pp * 0.04);
      ctx.beginPath(); ctx.arc(cx, cy, horizonR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(edgeC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.lineWidth = minDim * 0.0016; ctx.stroke();
      // Accretion glow
      const aGrad = ctx.createRadialGradient(cx, cy, horizonR * 0.8, cx, cy, horizonR * 1.5);
      aGrad.addColorStop(0, rgba(edgeC, ELEMENT_ALPHA.glow.max * (1 + pp) * entrance));
      aGrad.addColorStop(1, rgba(edgeC, 0));
      ctx.fillStyle = aGrad; ctx.fillRect(cx - horizonR * 1.5, cy - horizonR * 1.5, horizonR * 3, horizonR * 3);

      // Spaghettification — grid lines distort toward center
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + s.frameCount * 0.003 * ms;
        const outerR = minDim * 0.25;
        const innerR = horizonR * (1 - pp * 0.3);
        const ox = cx + Math.cos(angle) * outerR;
        const oy = cy + Math.sin(angle) * outerR;
        const ix = cx + Math.cos(angle) * innerR;
        const iy = cy + Math.sin(angle) * innerR;
        ctx.beginPath(); ctx.moveTo(ox, oy);
        const mid = outerR * 0.5;
        const mx = cx + Math.cos(angle + pp * 0.3 * ms) * mid;
        const my = cy + Math.sin(angle + pp * 0.3 * ms) * mid;
        ctx.quadraticCurveTo(mx, my, ix, iy);
        ctx.strokeStyle = rgba(edgeC, ELEMENT_ALPHA.tertiary.max * (0.5 + pp * 0.5) * entrance);
        ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      }

      // Void center
      ctx.beginPath(); ctx.arc(cx, cy, horizonR * 0.3 * (1 + pp), 0, Math.PI * 2);
      ctx.fillStyle = rgba(voidC, Math.min(EMPHASIS_ALPHA.accent.max, pp * 0.5) * entrance); ctx.fill();

      // After crossing — calm safety glow
      if (pp > 0.9) {
        const safeAlpha = (pp - 0.9) / 0.1;
        const sGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.2);
        sGrad.addColorStop(0, rgba(safeC, ELEMENT_ALPHA.glow.max * safeAlpha * entrance));
        sGrad.addColorStop(1, rgba(safeC, 0));
        ctx.fillStyle = sGrad; ctx.fillRect(0, 0, w, h);
      }

      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(pp > 0.8 ? safeC : baseC, ELEMENT_ALPHA.text.min * entrance);
      if (pp < 0.95) ctx.fillText('Drag toward the horizon', cx, h - minDim * 0.04);
      else ctx.fillText('Safe.', cx, h - minDim * 0.04);

      if (pp >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.pullProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const dy = Math.abs(e.clientY - s.lastY);
      s.pullProgress = Math.min(1, s.pullProgress + dy * 0.003);
      s.lastY = e.clientY;
      if (s.pullProgress > 0.5 && s.pullProgress < 0.52) cbRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}
