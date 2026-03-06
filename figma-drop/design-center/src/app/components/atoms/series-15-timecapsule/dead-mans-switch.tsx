/**
 * ATOM 144: THE DEAD MAN'S SWITCH ENGINE · Series 15 · Position 4
 * A spring-loaded timer ticks. Hold to wind it tighter. Release = it unwinds.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function DeadMansSwitchAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, tension: 0, angle: 0, wound: false,
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

      if (s.holding) s.tension = Math.min(1, s.tension + 0.003);
      if (s.tension >= 1 && !s.wound) { s.wound = true; cb.onHaptic('seal_stamp'); }

      if (!p.reducedMotion) s.angle += 0.01 + s.tension * 0.04;

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Clock face
      const clockR = minDim * 0.1;
      ctx.beginPath(); ctx.arc(cx, cy, clockR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Tick marks
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const inner = clockR * 0.85; const outer = clockR * 0.95;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.secondary.max * entrance);
        ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      }

      // Hand (speed varies with tension)
      const handLen = clockR * 0.7;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(s.angle) * handLen, cy + Math.sin(s.angle) * handLen);
      const handColor = lerpColor(baseC, accentC, s.tension);
      ctx.strokeStyle = rgba(handColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.lineWidth = minDim * 0.002; ctx.stroke();

      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, minDim * 0.006, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Tension arc
      ctx.beginPath();
      ctx.arc(cx, cy, clockR + minDim * 0.02, -Math.PI / 2, -Math.PI / 2 + s.tension * Math.PI * 2);
      ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * s.tension * 2 * entrance);
      ctx.lineWidth = minDim * 0.003; ctx.stroke();

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.wound) ctx.fillText('Hold to wind', cx, cy + clockR + minDim * 0.06);
      else ctx.fillText('Wound.', cx, cy + clockR + minDim * 0.06);

      if (s.wound && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.tension);
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