/**
 * ATOM 132: THE FORCEFIELD ENGINE · Series 14 · Position 2
 * Press center to expand a translucent sphere. Red particles
 * bounce off harmlessly. Soft muffled thuds.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Particle { x: number; y: number; vx: number; vy: number; bounced: boolean; }

export default function ForcefieldAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, shieldR: 0, shieldActive: false,
    particles: [] as Particle[],
    bouncedCount: 0, completionFired: false,
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
      const redC: RGB = lerpColor(accentC, [220, 70, 60], 0.3);

      // Shield expansion
      const targetR = s.holding ? minDim * 0.15 : minDim * 0.03;
      s.shieldR += (targetR - s.shieldR) * 0.08;
      s.shieldActive = s.shieldR > minDim * 0.08;

      // Spawn particles
      if (!p.reducedMotion && s.frameCount % 8 === 0) {
        const edge = Math.random() * 4;
        let px: number, py: number;
        if (edge < 1) { px = Math.random() * w; py = -10; }
        else if (edge < 2) { px = w + 10; py = Math.random() * h; }
        else if (edge < 3) { px = Math.random() * w; py = h + 10; }
        else { px = -10; py = Math.random() * h; }
        const angle = Math.atan2(cy - py, cx - px) + (Math.random() - 0.5) * 0.5;
        const speed = minDim * (0.002 + Math.random() * 0.002);
        s.particles.push({ x: px, y: py, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, bounced: false });
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Shield
      if (s.shieldR > minDim * 0.04) {
        ctx.beginPath(); ctx.arc(cx, cy, s.shieldR, 0, Math.PI * 2);
        const sGrad = ctx.createRadialGradient(cx, cy, s.shieldR * 0.8, cx, cy, s.shieldR);
        sGrad.addColorStop(0, rgba(accentC, 0));
        sGrad.addColorStop(0.8, rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance));
        sGrad.addColorStop(1, rgba(accentC, ELEMENT_ALPHA.primary.max * entrance));
        ctx.fillStyle = sGrad;
        ctx.fill();
      }

      // Center node
      ctx.beginPath(); ctx.arc(cx, cy, minDim * 0.015, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        // Shield collision
        if (s.shieldActive && !pt.bounced) {
          const dx = pt.x - cx; const dy = pt.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < s.shieldR) {
            const nx = dx / dist; const ny = dy / dist;
            pt.vx = nx * minDim * 0.004; pt.vy = ny * minDim * 0.004;
            pt.bounced = true;
            s.bouncedCount++;
            if (s.bouncedCount % 3 === 0) cb.onHaptic('tap');
          }
        }
        if (pt.x < -50 || pt.x > w + 50 || pt.y < -50 || pt.y > h + 50) {
          s.particles.splice(i, 1); continue;
        }
        const pr = minDim * 0.004;
        const pColor = pt.bounced ? baseC : redC;
        const pAlpha = (pt.bounced ? 0.3 : 1) * ELEMENT_ALPHA.primary.max * entrance;
        ctx.fillStyle = rgba(pColor, pAlpha);
        // Jagged shape
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const a = (j / 5) * Math.PI * 2;
          const jr = pr * (0.6 + Math.sin(j * 3) * 0.4);
          j === 0 ? ctx.moveTo(pt.x + Math.cos(a) * jr, pt.y + Math.sin(a) * jr) : ctx.lineTo(pt.x + Math.cos(a) * jr, pt.y + Math.sin(a) * jr);
        }
        ctx.closePath(); ctx.fill();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText(s.shieldActive ? 'Protected.' : 'Hold to shield', cx, cy + minDim * 0.2);

      if (s.bouncedCount >= 10 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(Math.min(1, s.bouncedCount / 10));
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