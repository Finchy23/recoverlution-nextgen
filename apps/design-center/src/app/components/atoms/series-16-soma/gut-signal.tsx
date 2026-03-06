/**
 * ATOM 159: THE GUT SIGNAL ENGINE · Series 16 · Position 9
 * Two options flash. Tap your gut instinct before the timer expires.
 * The unchosen side shatters.
 */
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';

export default function GutSignalAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    timer: 1, chosen: -1, shatterAnim: 0,
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
      const leftC: RGB = lerpColor(accentC, [100, 180, 220], 0.3);
      const rightC: RGB = lerpColor(accentC, [220, 160, 80], 0.3);

      // Timer countdown
      if (s.chosen < 0 && entrance > 0.5) s.timer = Math.max(0, s.timer - 0.002);
      if (s.chosen >= 0) s.shatterAnim = Math.min(1, s.shatterAnim + 0.02);
      const sa = easeOutCubic(s.shatterAnim);

      // Background
      const urgency = 1 - s.timer;
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * (1 + urgency * 0.5) * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Two sides
      const boxW = minDim * 0.12; const boxH = minDim * 0.12;
      const leftX = cx - minDim * 0.1; const rightX = cx + minDim * 0.1;
      const boxY = cy - boxH / 2;

      for (let side = 0; side < 2; side++) {
        const bx = side === 0 ? leftX - boxW / 2 : rightX - boxW / 2;
        const sideColor = side === 0 ? leftC : rightC;
        const isChosen = s.chosen === side;
        const isShattered = s.chosen >= 0 && !isChosen;

        if (!isShattered) {
          ctx.fillStyle = rgba(sideColor, ELEMENT_ALPHA.primary.max * (isChosen ? 2 : 1) * entrance);
          ctx.fillRect(bx, boxY, boxW, boxH);

          if (isChosen) {
            const gR = boxW;
            const gGrad = ctx.createRadialGradient(bx + boxW / 2, boxY + boxH / 2, 0, bx + boxW / 2, boxY + boxH / 2, gR);
            gGrad.addColorStop(0, rgba(sideColor, EMPHASIS_ALPHA.focal.min * sa * entrance));
            gGrad.addColorStop(1, rgba(sideColor, 0));
            ctx.fillStyle = gGrad;
            ctx.fillRect(bx + boxW / 2 - gR, boxY + boxH / 2 - gR, gR * 2, gR * 2);
          }
        } else {
          // Shatter fragments
          for (let i = 0; i < 8; i++) {
            const fx = bx + boxW / 2 + (Math.sin(i * 2.3) * minDim * 0.06 * sa);
            const fy = boxY + boxH / 2 + (Math.cos(i * 1.7) * minDim * 0.06 * sa) + sa * minDim * 0.05;
            const fSize = minDim * 0.01 * (1 - sa * 0.5);
            ctx.fillStyle = rgba(sideColor, ELEMENT_ALPHA.primary.max * (1 - sa) * entrance);
            ctx.fillRect(fx - fSize / 2, fy - fSize / 2, fSize, fSize);
          }
        }

        const fs2 = Math.max(7, minDim * 0.011);
        ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        if (!isShattered) {
          ctx.fillStyle = rgba(sideColor, ELEMENT_ALPHA.text.min * entrance);
          ctx.fillText(side === 0 ? 'A' : 'B', bx + boxW / 2, boxY + boxH + minDim * 0.025);
        }
      }

      // Timer bar
      if (s.chosen < 0) {
        const barW = minDim * 0.25; const barH = minDim * 0.005;
        const barX = cx - barW / 2; const barY = cy + minDim * 0.13;
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        const timerColor: RGB = s.timer < 0.3 ? [220, 60, 40] : baseC;
        ctx.fillStyle = rgba(timerColor, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(barX, barY, barW * s.timer, barH);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.chosen < 0) ctx.fillText('Trust your gut — tap now', cx, cy + minDim * 0.18);
      else if (sa > 0.8) ctx.fillText('Instinct honored.', cx, cy + minDim * 0.18);

      if (sa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.chosen >= 0 ? 1 : 0);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.chosen >= 0) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      stateRef.current.chosen = px < 0.5 ? 0 : 1;
      cbRef.current.onHaptic('tap');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}