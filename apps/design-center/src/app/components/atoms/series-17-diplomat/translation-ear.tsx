/**
 * ATOM 164: THE TRANSLATION EAR ENGINE · Series 17 · Position 4
 * Peel through 3 layers of aggressive text to reveal the core
 * human need beneath. Drag down to scrape each layer.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const LAYERS = [
  { text: '"You\'re impossible!"', color: [220, 70, 60] as RGB },
  { text: '"I feel unheard"', color: [200, 160, 80] as RGB },
  { text: '"I need connection"', color: [100, 180, 140] as RGB },
];

export default function TranslationEarAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    peeled: 0, dragging: false, dragDist: 0, peelAnims: [0, 0, 0],
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

      for (let i = 0; i < 3; i++) if (i < s.peeled) s.peelAnims[i] = Math.min(1, s.peelAnims[i] + 0.03);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Draw layers from bottom to top
      for (let i = LAYERS.length - 1; i >= 0; i--) {
        const layer = LAYERS[i];
        const layerC: RGB = lerpColor(layer.color, accentC, 0.2);
        const peeled = i < s.peeled;
        const pa = peeled ? easeOutCubic(s.peelAnims[i]) : 0;
        const yOff = peeled ? pa * minDim * 0.12 : 0;
        const alpha = peeled ? (1 - pa * 0.7) : 1;
        const isActive = i === s.peeled && i < LAYERS.length;

        if (i > s.peeled) continue; // Haven't reached this layer yet, show only current + peeled

        const ly = cy - minDim * 0.02 + yOff;
        const boxW = minDim * 0.3; const boxH = minDim * 0.06;

        // Layer card
        ctx.fillStyle = rgba(layerC, ELEMENT_ALPHA.primary.max * alpha * (isActive ? 2 : 1) * entrance);
        ctx.fillRect(cx - boxW / 2, ly - boxH / 2, boxW, boxH);

        // Drag progress on active
        if (isActive && s.dragging) {
          const prog = Math.min(1, s.dragDist / (minDim * 0.1));
          ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
          ctx.fillRect(cx - boxW / 2, ly + boxH / 2, boxW * prog, minDim * 0.003);
        }

        // Text
        const fs = Math.max(8, minDim * (i === LAYERS.length - 1 ? 0.015 : 0.013));
        ctx.font = `${i === LAYERS.length - 1 ? '600 ' : ''}${fs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(layerC, ELEMENT_ALPHA.text.max * alpha * (isActive ? 1.5 : 0.8) * entrance);
        ctx.fillText(layer.text, cx, ly + minDim * 0.005);
      }

      // Depth label
      const fs2 = Math.max(7, minDim * 0.01);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      const depthLabels = ['Surface', 'Feeling', 'Need'];
      if (s.peeled < LAYERS.length) ctx.fillText(`Layer: ${depthLabels[s.peeled]}`, cx, cy + minDim * 0.1);

      const fs3 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs3}px -apple-system, sans-serif`;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.peeled < LAYERS.length) ctx.fillText('Drag down to peel', cx, cy + minDim * 0.18);
      else ctx.fillText('Core need revealed.', cx, cy + minDim * 0.18);

      if (s.peeled >= LAYERS.length && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.peeled / LAYERS.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    let startY = 0;
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.peeled >= LAYERS.length) return;
      stateRef.current.dragging = true; stateRef.current.dragDist = 0;
      startY = e.clientY; canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      stateRef.current.dragDist = Math.max(0, e.clientY - startY);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current; s.dragging = false; canvas.releasePointerCapture(e.pointerId);
      const minDim2 = Math.min(viewport.width, viewport.height);
      if (s.dragDist > minDim2 * 0.08 && s.peeled < LAYERS.length) {
        s.peeled++; cbRef.current.onHaptic('drag_snap');
      }
      s.dragDist = 0;
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}