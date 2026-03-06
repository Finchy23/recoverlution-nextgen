/**
 * ATOM 135: THE AIKIDO REDIRECT ENGINE · Series 14 · Position 5
 * Fast aggressive vector shoots toward user. Swipe a curved path
 * alongside it to redirect harmlessly off-screen.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function AikidoRedirectAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    vectorT: 0, // 0→1 position along path
    redirected: false, redirectAnim: 0,
    swipePath: [] as { x: number; y: number }[],
    swiping: false, completionFired: false,
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
      const redC: RGB = lerpColor(accentC, [220, 70, 50], 0.3);

      // Vector approaches
      if (!s.redirected && !p.reducedMotion) {
        s.vectorT = Math.min(0.9, s.vectorT + 0.003);
      }
      if (s.redirected) s.redirectAnim = Math.min(1, s.redirectAnim + 0.02);
      const ra = easeOutCubic(s.redirectAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // User avatar at center
      ctx.beginPath(); ctx.arc(cx, cy, minDim * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Incoming vector
      const startX = minDim * 0.05; const startY = minDim * 0.1;
      if (!s.redirected) {
        const vx = startX + (cx - startX) * s.vectorT;
        const vy = startY + (cy - startY) * s.vectorT;
        // Line
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(vx, vy);
        ctx.strokeStyle = rgba(redC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.002; ctx.stroke();
        // Arrow head
        ctx.beginPath(); ctx.arc(vx, vy, minDim * 0.008, 0, Math.PI * 2);
        ctx.fillStyle = rgba(redC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fill();
      } else {
        // Redirected: curves away
        const curveX = cx + minDim * 0.15 * ra;
        const curveY = cy - minDim * 0.3 * ra;
        ctx.beginPath(); ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cx - minDim * 0.05, cy, curveX, curveY);
        ctx.strokeStyle = rgba(lerpColor(redC, accentC, ra), ELEMENT_ALPHA.primary.max * (2 - ra) * entrance);
        ctx.lineWidth = minDim * 0.002; ctx.stroke();
      }

      // Swipe path visualization
      if (s.swipePath.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.swipePath[0].x, s.swipePath[0].y);
        for (let i = 1; i < s.swipePath.length; i++) ctx.lineTo(s.swipePath[i].x, s.swipePath[i].y);
        ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.001; ctx.stroke();
      }

      // Prompt
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.redirected) ctx.fillText('Swipe a curve to redirect', cx, h - minDim * 0.05);
      else if (ra > 0.5) ctx.fillText('Redirected.', cx, h - minDim * 0.05);

      if (ra >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.redirected ? ra : 0);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.redirected) return;
      s.swiping = true; s.swipePath = [];
      const rect = canvas.getBoundingClientRect();
      s.swipePath.push({ x: (e.clientX - rect.left) / rect.width * viewport.width, y: (e.clientY - rect.top) / rect.height * viewport.height });
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.swiping) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.swipePath.push({ x: (e.clientX - rect.left) / rect.width * viewport.width, y: (e.clientY - rect.top) / rect.height * viewport.height });
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current; s.swiping = false;
      canvas.releasePointerCapture(e.pointerId);
      if (s.swipePath.length > 5 && s.vectorT > 0.3) {
        s.redirected = true; cbRef.current.onHaptic('drag_snap');
      }
      s.swipePath = [];
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}