/**
 * ATOM 129: THE SILENT MIRROR ENGINE · Series 13 · Position 9
 * A pulsing microphone tempts the user to speak. Hold the "Silence"
 * anchor instead. Pulsing stops, vortex absorbs chaotic particles.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function SilentMirrorAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, holdProgress: 0,
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

      if (s.holding) s.holdProgress = Math.min(1, s.holdProgress + 0.005);
      const hp = easeOutCubic(s.holdProgress);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Microphone pulse (fades with silence)
      const micR = minDim * 0.03;
      const pulse = !p.reducedMotion ? Math.sin(s.frameCount * 0.1 * ms) * (1 - hp) : 0;
      const micGlowR = micR * (2 + pulse * 1.5);
      const micGrad = ctx.createRadialGradient(cx, cy - minDim * 0.1, 0, cx, cy - minDim * 0.1, micGlowR);
      micGrad.addColorStop(0, rgba(accentC, ELEMENT_ALPHA.primary.max * (1 - hp * 0.8) * entrance));
      micGrad.addColorStop(1, rgba(accentC, 0));
      ctx.fillStyle = micGrad;
      ctx.fillRect(cx - micGlowR, cy - minDim * 0.1 - micGlowR, micGlowR * 2, micGlowR * 2);

      ctx.beginPath();
      ctx.arc(cx, cy - minDim * 0.1, micR * (1 - hp * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * (1.5 - hp) * entrance);
      ctx.fill();

      // Chaotic particles (sucked into vortex as silence grows)
      if (!p.reducedMotion) {
        const particleCount = Math.round(12 * (1 - hp));
        for (let i = 0; i < particleCount; i++) {
          const angle = (s.frameCount * 0.02 * ms + i * 0.5);
          const dist = minDim * (0.15 + Math.sin(i * 3.7 + s.frameCount * 0.03 * ms) * 0.05) * (1 - hp * 0.7);
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(px, py, minDim * 0.003, 0, Math.PI * 2);
          ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.secondary.max * (1 - hp) * entrance);
          ctx.fill();
        }
      }

      // Vortex center (grows with silence)
      if (hp > 0.1) {
        const vR = minDim * 0.05 * hp;
        const vGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, vR);
        vGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.primary.max * hp * entrance));
        vGrad.addColorStop(0.7, rgba(baseC, ELEMENT_ALPHA.secondary.max * hp * entrance));
        vGrad.addColorStop(1, rgba(baseC, 0));
        ctx.fillStyle = vGrad;
        ctx.fillRect(cx - vR, cy - vR, vR * 2, vR * 2);
      }

      // Silence anchor
      const anchorY = cy + minDim * 0.12;
      ctx.beginPath();
      ctx.arc(cx, anchorY, minDim * 0.025, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(baseC, accentC, hp * 0.5), EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Progress ring
      if (hp > 0 && hp < 1) {
        ctx.beginPath();
        ctx.arc(cx, anchorY, minDim * 0.03, -Math.PI / 2, -Math.PI / 2 + hp * Math.PI * 2);
        ctx.strokeStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.002;
        ctx.stroke();
      }

      const fs = Math.max(7, minDim * 0.011);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText(hp < 0.1 ? 'Hold for silence' : hp < 1 ? 'Sustaining...' : 'Silence.', cx, anchorY + minDim * 0.05);

      if (s.holdProgress >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(hp);
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