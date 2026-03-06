/**
 * ATOM 198: THE FINAL EXHALE ENGINE · Series 20 · Position 8
 * Hold everything. Now let it all go. Drop the app and live.
 * Hold to compress — release for total particle evaporation into void.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

interface Particle { x: number; y: number; vx: number; vy: number; life: number; }

export default function FinalExhaleAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, pressure: 0, released: false, releaseAnim: 0,
    particles: [] as Particle[], holdStarted: false, thresholdFired: false, completionFired: false,
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
      const pressC: RGB = lerpColor(accentC, [220, 120, 80], 0.3);
      const voidC: RGB = lerpColor(baseC, [20, 15, 30], 0.6);

      if (s.holding && !s.released) s.pressure = Math.min(1, s.pressure + 0.006);
      if (s.pressure >= 1 && !s.thresholdFired) { s.thresholdFired = true; cb.onHaptic('hold_threshold'); }
      if (s.released) {
        s.releaseAnim = Math.min(1, s.releaseAnim + 0.015);
        if (!p.reducedMotion) {
          for (const pt of s.particles) {
            pt.x += pt.vx; pt.y += pt.vy;
            pt.vy -= 0.02; pt.life -= 0.006;
          }
        } else {
          for (const pt of s.particles) { pt.life -= 0.01; }
        }
        s.particles = s.particles.filter(pt => pt.life > 0);
      }

      const pr = easeOutCubic(s.pressure);
      const ra = easeOutCubic(s.releaseAnim);

      if (s.released) {
        ctx.fillStyle = rgba(voidC, ra * 0.03 * entrance);
        ctx.fillRect(0, 0, w, h);
      } else {
        const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
        const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
        bgGrad.addColorStop(1, rgba(baseC, 0));
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);
      }

      if (!s.released) {
        const sphereR = minDim * (0.08 - pr * 0.04);
        const vib = pr * minDim * 0.003 * Math.sin(s.frameCount * 0.3 * ms) * ms;
        ctx.beginPath(); ctx.arc(cx + vib, cy, sphereR, 0, Math.PI * 2);
        const sGrad = ctx.createRadialGradient(cx + vib, cy, 0, cx + vib, cy, sphereR);
        sGrad.addColorStop(0, rgba(pressC, EMPHASIS_ALPHA.focal.max * (0.5 + pr * 0.5) * entrance));
        sGrad.addColorStop(1, rgba(pressC, ELEMENT_ALPHA.glow.max * entrance));
        ctx.fillStyle = sGrad; ctx.fill();

        // Pressure ring
        ctx.beginPath(); ctx.arc(cx, cy, sphereR * 1.4, 0, Math.PI * 2 * pr);
        ctx.strokeStyle = rgba(pressC, ELEMENT_ALPHA.primary.max * pr * entrance);
        ctx.lineWidth = minDim * 0.0016 * pr; ctx.stroke();
      } else {
        for (const pt of s.particles) {
          const pAlpha = pt.life * ELEMENT_ALPHA.primary.max * entrance;
          const pR = minDim * 0.003 * pt.life;
          const pGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pR * 2);
          pGrad.addColorStop(0, rgba(pressC, pAlpha));
          pGrad.addColorStop(1, rgba(pressC, 0));
          ctx.fillStyle = pGrad; ctx.fillRect(pt.x - pR * 2, pt.y - pR * 2, pR * 4, pR * 4);
        }
      }

      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.released) {
        if (s.pressure < 1) ctx.fillText('Hold to compress', cx, h - minDim * 0.04);
        else ctx.fillText('Release to exhale', cx, h - minDim * 0.04);
      } else if (s.particles.length > 0) {
        ctx.fillText('Letting go...', cx, h - minDim * 0.04);
      } else {
        ctx.fillText('Live.', cx, h - minDim * 0.04);
      }

      if (s.released && s.particles.length === 0 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.released ? 0.5 + ra * 0.5 : s.pressure * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.released) return;
      s.holding = true;
      if (!s.holdStarted) { s.holdStarted = true; cbRef.current.onHaptic('hold_start'); }
    };
    const onUp = () => {
      const s = stateRef.current;
      s.holding = false;
      if (s.pressure >= 1 && !s.released) {
        s.released = true;
        const minDim2 = Math.min(viewport.width, viewport.height);
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = minDim2 * (0.001 + Math.random() * 0.003);
          s.particles.push({
            x: viewport.width / 2, y: viewport.height / 2,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - minDim2 * 0.001,
            life: 0.5 + Math.random() * 0.5,
          });
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
