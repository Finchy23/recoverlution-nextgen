/**
 * ATOM 130: THE INTERPRETER SEAL · Series 13 · Position 10
 * A solid brick wall of rigid words. Trace a vertical line down
 * the center. Wall splits into doors, light floods through.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function InterpreterSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    drawY: 0, // how far user has drawn down center
    drawing: false, split: false, splitAnim: 0, completionFired: false,
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
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const lightC: RGB = lerpColor(accentC, [255, 240, 200], 0.4);

      if (s.split) s.splitAnim = Math.min(1, s.splitAnim + 0.015);
      const sa = easeOutCubic(s.splitAnim);

      // Background
      const ms = motionScale(p.reducedMotion);
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms + sa * 0.15) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(lerpColor(baseC, lightC, sa * 0.3), ELEMENT_ALPHA.glow.max * (1 + sa * 2) * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const wallW = minDim * 0.35;
      const wallH = minDim * 0.4;
      const wallTop = cy - wallH / 2;

      if (!s.split) {
        // Solid wall
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
        ctx.fillRect(cx - wallW / 2, wallTop, wallW, wallH);

        // Brick pattern
        const brickH = minDim * 0.025;
        const brickW = minDim * 0.06;
        ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.secondary.max * entrance);
        ctx.lineWidth = minDim * 0.0004;
        for (let r = 0; r < wallH / brickH; r++) {
          const by = wallTop + r * brickH;
          ctx.beginPath(); ctx.moveTo(cx - wallW / 2, by); ctx.lineTo(cx + wallW / 2, by); ctx.stroke();
          const offset = (r % 2) * brickW / 2;
          for (let c = 0; c < wallW / brickW + 1; c++) {
            const bx = cx - wallW / 2 + c * brickW + offset;
            if (bx > cx - wallW / 2 && bx < cx + wallW / 2) {
              ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + brickH); ctx.stroke();
            }
          }
        }

        // Draw line progress
        if (s.drawY > 0) {
          ctx.beginPath();
          ctx.moveTo(cx, wallTop);
          ctx.lineTo(cx, wallTop + s.drawY * wallH);
          ctx.strokeStyle = rgba(lightC, EMPHASIS_ALPHA.focal.max * entrance);
          ctx.lineWidth = minDim * 0.002;
          ctx.stroke();
        }

        const pf = Math.max(8, minDim * 0.013);
        ctx.font = `${pf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('Trace down the center', cx, wallTop + wallH + minDim * 0.04);
      } else {
        // Split doors
        const doorGap = sa * minDim * 0.1;
        // Left door
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * (1 - sa * 0.5) * entrance);
        ctx.fillRect(cx - wallW / 2 - doorGap, wallTop, wallW / 2, wallH);
        // Right door
        ctx.fillRect(cx + doorGap, wallTop, wallW / 2, wallH);

        // Light through gap
        if (sa > 0.1) {
          const lightW = doorGap * 2 + minDim * 0.01;
          const lGrad = ctx.createLinearGradient(cx - lightW / 2, cy, cx + lightW / 2, cy);
          lGrad.addColorStop(0, rgba(lightC, 0));
          lGrad.addColorStop(0.5, rgba(lightC, EMPHASIS_ALPHA.focal.max * entrance * sa));
          lGrad.addColorStop(1, rgba(lightC, 0));
          ctx.fillStyle = lGrad;
          ctx.fillRect(cx - lightW / 2, wallTop - minDim * 0.05, lightW, wallH + minDim * 0.1);
        }
      }

      if (s.splitAnim >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(s.split ? 0.5 + sa * 0.5 : s.drawY * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      if (stateRef.current.split) return;
      stateRef.current.drawing = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s2 = stateRef.current;
      if (!s2.drawing || s2.split) return;
      const rect = canvas.getBoundingClientRect();
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const wallTop = viewport.height / 2 - minDim2 * 0.2;
      const wallH = minDim2 * 0.4;
      const progress = Math.max(0, Math.min(1, (py - wallTop) / wallH));
      if (progress > s2.drawY) s2.drawY = progress;
      if (s2.drawY >= 0.9) { s2.split = true; cbRef.current.onHaptic('drag_snap'); }
    };
    const onUp = (e: PointerEvent) => { stateRef.current.drawing = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}