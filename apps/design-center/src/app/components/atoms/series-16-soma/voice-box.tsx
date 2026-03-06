/**
 * ATOM 156: THE VOICE BOX ENGINE · Series 16 · Position 6
 * Hold to build pressure in a central knot. On release, particles
 * explode outward—simulating primal vocal release without mic.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Particle { x: number; y: number; vx: number; vy: number; life: number }

export default function VoiceBoxAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, pressure: 0, exploded: false, particles: [] as Particle[],
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
      const burstC: RGB = lerpColor(accentC, [255, 120, 60], 0.4);

      if (s.holding && !s.exploded) s.pressure = Math.min(1, s.pressure + 0.004);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Central knot (pre-explosion)
      if (!s.exploded) {
        const knotR = minDim * (0.025 + s.pressure * 0.02);
        const vibration = !p.reducedMotion ? s.pressure * Math.sin(s.frameCount * 0.4 * ms) * minDim * 0.005 : 0;

        // Pressure rings
        for (let i = 0; i < 3; i++) {
          const ringR = knotR + minDim * (0.02 + i * 0.015) * s.pressure;
          ctx.beginPath(); ctx.arc(cx + vibration, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(burstC, ELEMENT_ALPHA.primary.max * s.pressure * (1 - i * 0.3) * entrance);
          ctx.lineWidth = minDim * 0.001; ctx.stroke();
        }

        // Core knot
        ctx.beginPath(); ctx.arc(cx + vibration, cy, knotR, 0, Math.PI * 2);
        const kGrad = ctx.createRadialGradient(cx + vibration, cy, 0, cx + vibration, cy, knotR);
        kGrad.addColorStop(0, rgba(burstC, ELEMENT_ALPHA.primary.max * (1 + s.pressure * 2) * entrance));
        kGrad.addColorStop(1, rgba(burstC, ELEMENT_ALPHA.glow.max * entrance));
        ctx.fillStyle = kGrad; ctx.fill();

        // Pressure bar
        const barW = minDim * 0.2; const barH = minDim * 0.006;
        const barX = cx - barW / 2; const barY = cy + minDim * 0.1;
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = rgba(burstC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(barX, barY, barW * s.pressure, barH);
      }

      // Particles
      for (const part of s.particles) {
        part.x += part.vx; part.y += part.vy;
        part.vx *= 0.98; part.vy *= 0.98;
        part.life -= 0.008;
        if (part.life > 0) {
          const pR = minDim * 0.004 * part.life;
          ctx.beginPath(); ctx.arc(part.x, part.y, pR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(burstC, EMPHASIS_ALPHA.focal.max * part.life * 2 * entrance);
          ctx.fill();
        }
      }
      s.particles = s.particles.filter(p2 => p2.life > 0);

      // Post-explosion check
      if (s.exploded && s.particles.length === 0 && !s.completionFired) {
        s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.exploded) ctx.fillText('Hold to build, release to shatter', cx, cy + minDim * 0.16);
      else if (s.particles.length < 10) ctx.fillText('Discharged.', cx, cy + minDim * 0.16);

      cb.onStateChange?.(s.exploded ? 1 : s.pressure);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.exploded) return;
      stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current; s.holding = false; canvas.releasePointerCapture(e.pointerId);
      if (s.pressure > 0.5 && !s.exploded) {
        s.exploded = true; cbRef.current.onHaptic('step_advance');
        const cx2 = viewport.width / 2; const cy2 = viewport.height / 2;
        const minDim2 = Math.min(viewport.width, viewport.height);
        for (let i = 0; i < 60; i++) {
          const angle = (i / 60) * Math.PI * 2 + Math.random() * 0.3;
          const speed = minDim2 * (0.003 + Math.random() * 0.005) * s.pressure;
          s.particles.push({ x: cx2, y: cy2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.8 + Math.random() * 0.2 });
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}