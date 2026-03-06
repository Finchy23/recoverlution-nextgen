/**
 * ATOM 143: THE PREDICTION STAKE ENGINE · Series 15 · Position 3
 * Drag a metallic stake downward to drive it into ground. Ratchet clicks.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function PredictionStakeAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    depth: 0, dragging: false, lastNotch: 0,
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
      const metalC: RGB = lerpColor(baseC, [160, 160, 170], 0.4);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Ground line
      const groundY = cy + minDim * 0.08;
      ctx.beginPath(); ctx.moveTo(cx - minDim * 0.2, groundY); ctx.lineTo(cx + minDim * 0.2, groundY);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Stake
      const stakeW = minDim * 0.015; const stakeH = minDim * 0.25;
      const stakeTop = groundY - stakeH * (1 - s.depth);
      const stakeBottom = groundY + stakeH * s.depth * 0.3;

      // Above ground
      ctx.fillStyle = rgba(metalC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fillRect(cx - stakeW / 2, stakeTop, stakeW, groundY - stakeTop);

      // Point below ground
      ctx.beginPath();
      ctx.moveTo(cx - stakeW / 2, groundY);
      ctx.lineTo(cx + stakeW / 2, groundY);
      ctx.lineTo(cx, stakeBottom);
      ctx.closePath();
      ctx.fillStyle = rgba(metalC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fill();

      // Notch marks on stake
      const notchCount = 5;
      for (let i = 0; i < notchCount; i++) {
        const ny = stakeTop + (groundY - stakeTop) * ((i + 0.5) / notchCount);
        if (ny > stakeTop && ny < groundY) {
          ctx.beginPath(); ctx.moveTo(cx - stakeW / 2, ny); ctx.lineTo(cx + stakeW / 2, ny);
          ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.secondary.max * entrance);
          ctx.lineWidth = minDim * 0.0004; ctx.stroke();
        }
      }

      // Depth indicator
      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.depth < 0.95) ctx.fillText('Drag down to stake', cx, groundY + minDim * 0.1);
      else ctx.fillText('Staked.', cx, groundY + minDim * 0.1);

      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText(`${Math.round(s.depth * 100)}%`, cx, stakeTop - minDim * 0.02);

      if (s.depth >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(s.depth);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const py = (e.clientY - rect.top) / rect.height;
      const newDepth = Math.max(s.depth, Math.min(1, py * 1.5 - 0.2));
      // Ratchet haptic at notches
      const notch = Math.floor(newDepth * 5);
      if (notch > s.lastNotch) { s.lastNotch = notch; cbRef.current.onHaptic('step_advance'); }
      s.depth = newDepth;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}