/**
 * ATOM 166: THE THIRD CHAIR ENGINE · Series 17 · Position 6
 * Two dots fight chaotically. Pinch/drag to zoom out and observe.
 * Distance brings clarity — you become the audience.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function ThirdChairAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    zoom: 1, dragging: false, lastY: 0, elevated: false, elevAnim: 0,
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
      const dotAC: RGB = lerpColor(accentC, [220, 100, 80], 0.3);
      const dotBC: RGB = lerpColor(accentC, [80, 100, 220], 0.3);

      if (s.zoom < 0.3 && !s.elevated) { s.elevated = true; cb.onHaptic('drag_snap'); }
      if (s.elevated) s.elevAnim = Math.min(1, s.elevAnim + 0.015);
      const ea = easeOutCubic(s.elevAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Two fighting dots with chaotic motion
      const chaos = s.zoom; // More zoom = more chaos visible
      const t = s.frameCount * 0.05 * ms;
      const dotR = minDim * 0.02 * s.zoom;
      const sep = minDim * 0.06 * s.zoom;
      const ax = cx - sep + (!p.reducedMotion ? Math.sin(t * 3.1) * minDim * 0.02 * s.zoom : 0);
      const ay = cy + (!p.reducedMotion ? Math.cos(t * 2.7) * minDim * 0.015 * s.zoom : 0);
      const bx = cx + sep + (!p.reducedMotion ? Math.sin(t * 2.3 + 1) * minDim * 0.02 * s.zoom : 0);
      const by = cy + (!p.reducedMotion ? Math.cos(t * 3.5 + 2) * minDim * 0.015 * s.zoom : 0);

      // Chaotic lines between them
      if (s.zoom > 0.5) {
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = rgba(lerpColor(accentC, [220, 60, 60] as RGB, 0.3), ELEMENT_ALPHA.primary.max * s.zoom * entrance);
        ctx.lineWidth = minDim * 0.001 * s.zoom; ctx.stroke();
      }

      ctx.beginPath(); ctx.arc(ax, ay, dotR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(dotAC, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill();
      ctx.beginPath(); ctx.arc(bx, by, dotR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(dotBC, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill();

      // Observer platform (appears as you zoom out)
      if (s.zoom < 0.7) {
        const platAlpha = (1 - s.zoom / 0.7);
        const platY = cy + minDim * 0.18;
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * platAlpha * entrance);
        ctx.fillRect(cx - minDim * 0.04, platY, minDim * 0.08, minDim * 0.003);
        // Observer dot
        ctx.beginPath(); ctx.arc(cx, platY - minDim * 0.01, minDim * 0.008, 0, Math.PI * 2);
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * platAlpha * 2 * entrance);
        ctx.fill();
      }

      // Zoom indicator
      const barW = minDim * 0.15; const barH = minDim * 0.004;
      const barX = cx - barW / 2; const barY = h - minDim * 0.06;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fillRect(barX, barY, barW * (1 - s.zoom), barH);

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.elevated) ctx.fillText('Drag up to rise above', cx, h - minDim * 0.02);
      else ctx.fillText('You are the observer.', cx, h - minDim * 0.02);

      if (s.elevated && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(1 - s.zoom);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const dy = stateRef.current.lastY - e.clientY;
      stateRef.current.zoom = Math.max(0.15, Math.min(1, stateRef.current.zoom - dy * 0.003));
      stateRef.current.lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}