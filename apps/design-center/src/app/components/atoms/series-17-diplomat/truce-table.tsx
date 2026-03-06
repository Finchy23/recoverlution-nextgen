/**
 * ATOM 162: THE TRUCE TABLE ENGINE · Series 17 · Position 2
 * Place offerings of good faith onto a shared table one by one.
 * Each offering locks into place with a heavy thud.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const OFFERINGS = ['Listening', 'Patience', 'Honesty', 'Humility'];

export default function TruceTableAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    placed: 0, dragging: -1, dragX: 0, dragY: 0, placeAnims: [0, 0, 0, 0],
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
      const tableC: RGB = lerpColor(accentC, [140, 120, 90], 0.3);
      const offerC: RGB = lerpColor(accentC, [100, 180, 160], 0.3);

      for (let i = 0; i < 4; i++) if (i < s.placed) s.placeAnims[i] = Math.min(1, s.placeAnims[i] + 0.04);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Table surface
      const tableW = minDim * 0.35; const tableH = minDim * 0.04;
      const tableX = cx - tableW / 2; const tableY = cy;
      ctx.fillStyle = rgba(tableC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(tableX, tableY, tableW, tableH);

      // Placed offerings on table
      for (let i = 0; i < s.placed; i++) {
        const pa = easeOutCubic(s.placeAnims[i]);
        const ox = tableX + (i + 0.5) * (tableW / 4);
        const oy = tableY - minDim * 0.025 * pa;
        const boxW = minDim * 0.06; const boxH = minDim * 0.025;
        ctx.fillStyle = rgba(offerC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(ox - boxW / 2, oy - boxH, boxW, boxH);
        const fs = Math.max(6, minDim * 0.009);
        ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(offerC, ELEMENT_ALPHA.text.min * pa * entrance);
        ctx.fillText(OFFERINGS[i], ox, oy - boxH - minDim * 0.008);
      }

      // Next offering (draggable or waiting)
      if (s.placed < OFFERINGS.length) {
        const nextIdx = s.placed;
        const sourceX = cx; const sourceY = cy + minDim * 0.15;
        const drawX = s.dragging === nextIdx ? s.dragX : sourceX;
        const drawY = s.dragging === nextIdx ? s.dragY : sourceY;
        const boxW = minDim * 0.07; const boxH = minDim * 0.03;
        ctx.fillStyle = rgba(offerC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(drawX - boxW / 2, drawY - boxH / 2, boxW, boxH);
        const fs = Math.max(7, minDim * 0.011);
        ctx.font = `600 ${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.text.max * entrance);
        ctx.fillText(OFFERINGS[nextIdx], drawX, drawY + minDim * 0.004);
      }

      // Instructions
      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.placed < OFFERINGS.length) ctx.fillText('Drag offering to table', cx, cy + minDim * 0.25);
      else ctx.fillText('Truce established.', cx, cy + minDim * 0.25);

      if (s.placed >= OFFERINGS.length && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.placed / OFFERINGS.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.placed >= OFFERINGS.length) return;
      s.dragging = s.placed;
      const rect = canvas.getBoundingClientRect();
      s.dragX = (e.clientX - rect.left) / rect.width * viewport.width;
      s.dragY = (e.clientY - rect.top) / rect.height * viewport.height;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (stateRef.current.dragging < 0) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.dragX = (e.clientX - rect.left) / rect.width * viewport.width;
      stateRef.current.dragY = (e.clientY - rect.top) / rect.height * viewport.height;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragging < 0) return;
      canvas.releasePointerCapture(e.pointerId);
      const cy2 = viewport.height / 2;
      if (s.dragY < cy2 + Math.min(viewport.width, viewport.height) * 0.03) {
        s.placed++; cbRef.current.onHaptic('drag_snap');
      }
      s.dragging = -1;
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}