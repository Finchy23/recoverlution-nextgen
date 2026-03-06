/**
 * ATOM 137: THE GOSSIP FIREWALL ENGINE · Series 14 · Position 7
 * Toxic green line approaches. Hold your node to become a sinkhole.
 * The toxic data is absorbed and extinguished.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function GossipFirewallAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, holdProgress: 0,
    toxicT: 0, absorbed: false, absorbAnim: 0,
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
      const toxicC: RGB = lerpColor(accentC, [80, 200, 80], 0.3);

      if (s.holding) s.holdProgress = Math.min(1, s.holdProgress + 0.01);
      if (!s.absorbed && !p.reducedMotion) s.toxicT = Math.min(0.9, s.toxicT + 0.002);

      // Check absorption
      if (s.holdProgress > 0.3 && s.toxicT > 0.6 && !s.absorbed) {
        s.absorbed = true; cb.onHaptic('hold_threshold');
      }
      if (s.absorbed) s.absorbAnim = Math.min(1, s.absorbAnim + 0.02);
      const aa = easeOutCubic(s.absorbAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Source node (top-left)
      const srcX = minDim * 0.15; const srcY = minDim * 0.15;
      ctx.beginPath(); ctx.arc(srcX, srcY, minDim * 0.012, 0, Math.PI * 2);
      ctx.fillStyle = rgba(toxicC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fill();

      // Toxic line
      if (!s.absorbed) {
        const endX = srcX + (cx - srcX) * s.toxicT;
        const endY = srcY + (cy - srcY) * s.toxicT;
        ctx.beginPath(); ctx.moveTo(srcX, srcY); ctx.lineTo(endX, endY);
        ctx.strokeStyle = rgba(toxicC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.002;
        if (!p.reducedMotion) ctx.setLineDash([minDim * 0.005, minDim * 0.003]);
        ctx.stroke(); ctx.setLineDash([]);
      }

      // User node / sinkhole
      const sinkR = minDim * (0.02 + s.holdProgress * 0.02);
      const sinkColor = s.holdProgress > 0.3 ? lerpColor(baseC, [20, 20, 25], s.holdProgress) : baseC;
      ctx.beginPath(); ctx.arc(cx, cy, sinkR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(sinkColor, ELEMENT_ALPHA.primary.max * (1.5 + s.holdProgress) * entrance);
      ctx.fill();

      // Absorption vortex
      if (s.absorbed && aa < 1) {
        const vR = minDim * 0.06 * (1 - aa);
        ctx.beginPath(); ctx.arc(cx, cy, vR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(toxicC, ELEMENT_ALPHA.primary.max * (1 - aa) * entrance);
        ctx.lineWidth = minDim * 0.001; ctx.stroke();
      }

      // Third node (target that was protected)
      const targetX = w - minDim * 0.15; const targetY = h - minDim * 0.15;
      ctx.beginPath(); ctx.arc(targetX, targetY, minDim * 0.012, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fill();

      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.absorbed) ctx.fillText('Hold to absorb', cx, cy + sinkR + minDim * 0.04);
      else if (aa > 0.5) ctx.fillText('Contained.', cx, cy + sinkR + minDim * 0.04);

      if (aa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.absorbed ? 0.5 + aa * 0.5 : s.holdProgress * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}