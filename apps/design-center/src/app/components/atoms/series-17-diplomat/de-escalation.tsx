/**
 * ATOM 168: THE DE-ESCALATION ENGINE · Series 17 · Position 8
 * Heat gauge at maximum. Hold to cool the system down.
 * Red erratic particles calm into blue steady heartbeat.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Spark { x: number; y: number; vx: number; vy: number; }

export default function DeEscalationAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    heat: 1, holding: false, sparks: [] as Spark[],
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    // Init sparks
    const minDim0 = Math.min(viewport.width, viewport.height);
    for (let i = 0; i < 25; i++) {
      stateRef.current.sparks.push({
        x: viewport.width * 0.5 + (Math.random() - 0.5) * minDim0 * 0.3,
        y: viewport.height * 0.5 + (Math.random() - 0.5) * minDim0 * 0.3,
        vx: (Math.random() - 0.5) * minDim0 * 0.004,
        vy: (Math.random() - 0.5) * minDim0 * 0.004,
      });
    }

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const hotC: RGB = lerpColor(accentC, [220, 60, 40], 0.3);
      const coolC: RGB = lerpColor(accentC, [60, 120, 200], 0.4);

      if (s.holding) s.heat = Math.max(0, s.heat - 0.003 - p.breathAmplitude * 0.001);
      const tempC: RGB = lerpColor(coolC, hotC, s.heat);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(tempC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Sparks — speed proportional to heat
      for (const sp of s.sparks) {
        const speed = s.heat;
        sp.x += sp.vx * speed;
        sp.y += sp.vy * speed;
        // Bounce
        if (sp.x < cx - minDim * 0.2 || sp.x > cx + minDim * 0.2) sp.vx *= -1;
        if (sp.y < cy - minDim * 0.2 || sp.y > cy + minDim * 0.2) sp.vy *= -1;
        // Toward center as heat drops
        sp.vx += (cx - sp.x) * 0.0001 * (1 - s.heat);
        sp.vy += (cy - sp.y) * 0.0001 * (1 - s.heat);

        const spR = minDim * (0.003 + s.heat * 0.003);
        ctx.beginPath(); ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(tempC, ELEMENT_ALPHA.primary.max * (1 + s.heat) * entrance);
        ctx.fill();
      }

      // Central pulse (visible as system cools)
      if (s.heat < 0.5) {
        const pulsePhase = !p.reducedMotion ? Math.sin(s.frameCount * 0.05 * ms) : 0.5;
        const pulseR = minDim * 0.03 * (1 + pulsePhase * 0.2) * (1 - s.heat);
        ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(coolC, ELEMENT_ALPHA.primary.max * (1 - s.heat) * 2 * entrance);
        ctx.fill();
      }

      // Heat gauge
      const barW = minDim * 0.005; const barH = minDim * 0.2;
      const barX = cx + minDim * 0.18; const barY = cy - barH / 2;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = rgba(tempC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fillRect(barX, barY + barH * (1 - s.heat), barW, barH * s.heat);

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.heat > 0.05) ctx.fillText('Hold to cool', cx, cy + minDim * 0.18);
      else ctx.fillText('De-escalated.', cx, cy + minDim * 0.18);

      if (s.heat <= 0.02 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(1 - s.heat);
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