/**
 * ATOM 133: THE STATUS SEE-SAW ENGINE · Series 14 · Position 3
 * A plank on a fulcrum. Opponent slams their side down. Hold your
 * end steady until the plank levels to 180°.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function StatusSeesawAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    tilt: -0.4, // negative = user's side up (attacked)
    holding: false, levelProgress: 0,
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

      // Physics: tilt approaches 0 when holding
      if (s.holding) {
        s.tilt += (0 - s.tilt) * 0.02;
        if (Math.abs(s.tilt) < 0.02) {
          s.tilt = 0;
          s.levelProgress = Math.min(1, s.levelProgress + 0.02);
        }
      } else if (!p.reducedMotion) {
        // Opponent keeps attacking
        s.tilt += (-0.4 - s.tilt) * 0.01;
      }

      const lp = easeOutCubic(s.levelProgress);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Fulcrum
      const fulcrumY = cy + minDim * 0.05;
      const fulcrumH = minDim * 0.03;
      ctx.beginPath();
      ctx.moveTo(cx, fulcrumY); ctx.lineTo(cx - minDim * 0.02, fulcrumY + fulcrumH);
      ctx.lineTo(cx + minDim * 0.02, fulcrumY + fulcrumH);
      ctx.closePath();
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fill();

      // Plank
      const plankLen = minDim * 0.35;
      ctx.save();
      ctx.translate(cx, fulcrumY);
      ctx.rotate(s.tilt);
      ctx.fillStyle = rgba(lerpColor(baseC, accentC, lp * 0.5), ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(-plankLen / 2, -minDim * 0.005, plankLen, minDim * 0.01);

      // Weights on each end
      const weightR = minDim * 0.02;
      // Left (opponent)
      ctx.beginPath(); ctx.arc(-plankLen / 2 + weightR, 0, weightR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fill();
      // Right (user)
      ctx.beginPath(); ctx.arc(plankLen / 2 - weightR, 0, weightR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * (1 + lp) * entrance);
      ctx.fill();
      ctx.restore();

      // Status text
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.levelProgress < 0.1) ctx.fillText('Hold to level', cx, fulcrumY + minDim * 0.1);
      else if (lp >= 1) ctx.fillText('Balanced.', cx, fulcrumY + minDim * 0.1);

      if (s.levelProgress >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(lp);
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