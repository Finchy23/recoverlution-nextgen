/**
 * ATOM 171: THE ESSENTIALISM ENGINE · Series 18 · Position 1
 * Cards representing "good" ideas. Drag each to the shredder —
 * only the ONE great idea remains, expanding with clarity.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const CARDS = ['Plan B', 'Side hustle', 'Maybe later', 'Nice-to-have', 'The One'];

export default function EssentialismAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    shredded: 0, dragging: -1, dragX: 0, dragY: 0,
    shredAnims: new Array(CARDS.length - 1).fill(0),
    expandAnim: 0, completionFired: false,
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
      const cardC: RGB = lerpColor(accentC, [160, 170, 180], 0.3);
      const greatC: RGB = lerpColor(accentC, [220, 200, 100], 0.3);
      const shredC: RGB = lerpColor(accentC, [200, 80, 60], 0.3);

      for (let i = 0; i < CARDS.length - 1; i++) if (i < s.shredded) s.shredAnims[i] = Math.min(1, s.shredAnims[i] + 0.04);
      const allShredded = s.shredded >= CARDS.length - 1;
      if (allShredded) s.expandAnim = Math.min(1, s.expandAnim + 0.015);
      const ea = easeOutCubic(s.expandAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Shredder zone (bottom)
      const shredY = h - minDim * 0.08;
      ctx.fillStyle = rgba(shredC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.fillRect(cx - minDim * 0.12, shredY, minDim * 0.24, minDim * 0.04);
      const shredFs = Math.max(6, minDim * 0.009);
      ctx.font = `${shredFs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(shredC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('SHREDDER', cx, shredY + minDim * 0.025);

      // Cards
      const cardW = minDim * 0.1; const cardH = minDim * 0.06;
      const startY = cy - minDim * 0.06;
      for (let i = 0; i < CARDS.length; i++) {
        const isGreat = i === CARDS.length - 1;
        if (!isGreat && i < s.shredded) {
          // Shredded particles
          const sa = easeOutCubic(s.shredAnims[i]);
          for (let p2 = 0; p2 < 6; p2++) {
            const px = cx + Math.sin(p2 * 1.3 + i) * minDim * 0.08 * sa;
            const py = shredY + Math.cos(p2 * 0.9 + i) * minDim * 0.03 * sa;
            ctx.fillStyle = rgba(cardC, ELEMENT_ALPHA.tertiary.max * (1 - sa) * entrance);
            ctx.fillRect(px - minDim * 0.005, py - minDim * 0.003, minDim * 0.01, minDim * 0.006);
          }
          continue;
        }

        const isActive = !isGreat && i === s.shredded;
        const isDragging = s.dragging === i;
        let dx: number, dy: number;

        if (isGreat) {
          // The One — centers and expands after all shredded
          const scale = allShredded ? 1 + ea * 0.6 : 1;
          const gw = cardW * scale; const gh = cardH * scale;
          dx = cx; dy = allShredded ? cy : startY;
          ctx.fillStyle = rgba(greatC, ELEMENT_ALPHA.primary.max * (1.5 + ea) * entrance);
          ctx.fillRect(dx - gw / 2, dy - gh / 2, gw, gh);
          // Glow
          if (ea > 0) {
            const gGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, gw);
            gGrad.addColorStop(0, rgba(greatC, ELEMENT_ALPHA.glow.max * ea * entrance));
            gGrad.addColorStop(1, rgba(greatC, 0));
            ctx.fillStyle = gGrad; ctx.fillRect(dx - gw, dy - gh, gw * 2, gh * 2);
          }
          const fs = Math.max(7, minDim * (0.011 + ea * 0.005));
          ctx.font = `600 ${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
          ctx.fillStyle = rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.text.max * entrance);
          ctx.fillText(CARDS[i], dx, dy + minDim * 0.004);
        } else if (isDragging) {
          dx = s.dragX; dy = s.dragY;
          ctx.fillStyle = rgba(cardC, EMPHASIS_ALPHA.focal.max * entrance);
          ctx.fillRect(dx - cardW / 2, dy - cardH / 2, cardW, cardH);
          const fs = Math.max(7, minDim * 0.01);
          ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
          ctx.fillStyle = rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.text.max * entrance);
          ctx.fillText(CARDS[i], dx, dy + minDim * 0.003);
        } else if (isActive) {
          dx = cx; dy = startY + minDim * 0.08;
          ctx.fillStyle = rgba(cardC, EMPHASIS_ALPHA.focal.max * entrance);
          ctx.fillRect(dx - cardW / 2, dy - cardH / 2, cardW, cardH);
          const fs = Math.max(7, minDim * 0.01);
          ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
          ctx.fillStyle = rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.text.max * entrance);
          ctx.fillText(CARDS[i], dx, dy + minDim * 0.003);
        }
      }

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!allShredded) ctx.fillText('Drag to shredder', cx, minDim * 0.06);
      else ctx.fillText('Essential clarity.', cx, minDim * 0.06);

      if (ea >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.shredded / (CARDS.length - 1));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.shredded >= CARDS.length - 1) return;
      s.dragging = s.shredded;
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
      const shredY = viewport.height - Math.min(viewport.width, viewport.height) * 0.08;
      if (s.dragY > shredY - Math.min(viewport.width, viewport.height) * 0.03) {
        s.shredded++; cbRef.current.onHaptic('drag_snap');
      }
      s.dragging = -1;
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}