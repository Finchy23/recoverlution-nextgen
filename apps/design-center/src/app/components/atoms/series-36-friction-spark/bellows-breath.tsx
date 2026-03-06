/**
 * ATOM 360: THE BELLOWS ENGINE (Capstone)
 * Series 36 — Friction Spark · Position 10
 *
 * Cure giving up on a dead project. Dying incredibly dim ember.
 * Rhythmic pumping nurses it back to massive roaring light.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const EMBER_R = 0.008;
const MAX_PUMPS = 15;
const DECAY_RATE = 0.0008;
const PUMP_BOOST = 0.08;

export default function BellowsBreathAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    intensity: 0.05, pumps: 0,
    roaring: false, roarAnim: 0, completed: false,
    flameParticles: [] as { x: number; y: number; vy: number; vx: number; life: number; r: number }[],
    bellowsY: 0,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.intensity = 1;

      // Ember fades without pumping
      if (!s.roaring) s.intensity = Math.max(0.02, s.intensity - DECAY_RATE * ms);

      if (s.intensity >= 0.95 && !s.roaring) { s.roaring = true; cb.onHaptic('completion'); }
      if (s.roaring) s.roarAnim = Math.min(1, s.roarAnim + 0.008 * ms);
      s.bellowsY = Math.max(0, s.bellowsY - 0.02);
      cb.onStateChange?.(s.roaring ? 0.5 + s.roarAnim * 0.5 : s.intensity * 0.5);

      const emberY = h * 0.55;

      // ── Ember/fire ──────────────────────────────────
      const emberR = minDim * (EMBER_R + s.intensity * 0.06);
      // Multi-layer glow
      for (let layer = 3; layer >= 0; layer--) {
        const lr = emberR * (1 + layer * 1.5);
        const la = s.intensity * (0.4 - layer * 0.08);
        const eg = ctx.createRadialGradient(cx, emberY, 0, cx, emberY, lr);
        eg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * la * entrance));
        eg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = eg; ctx.fillRect(cx - lr, emberY - lr, lr * 2, lr * 2);
      }
      // Core
      ctx.beginPath(); ctx.arc(cx, emberY, emberR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.3 + s.intensity * 0.5) * entrance); ctx.fill();

      // Flame particles when intense
      if (s.intensity > 0.3) {
        if (Math.random() < s.intensity * 0.3) {
          s.flameParticles.push({
            x: cx + (Math.random() - 0.5) * emberR * 2,
            y: emberY,
            vy: -(1 + Math.random() * 3) * s.intensity,
            vx: (Math.random() - 0.5) * 0.5,
            life: 1, r: px(0.003 + Math.random() * 0.008 * s.intensity, minDim),
          });
        }
        for (let i = s.flameParticles.length - 1; i >= 0; i--) {
          const f = s.flameParticles[i];
          f.y += f.vy * ms; f.x += f.vx * ms; f.life -= 0.015;
          if (f.life <= 0) { s.flameParticles.splice(i, 1); continue; }
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r * f.life, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * f.life * entrance); ctx.fill();
        }
      }

      // Roaring: screen-filling light
      if (s.roaring) {
        const rR = minDim * 0.4 * s.roarAnim;
        const rg = ctx.createRadialGradient(cx, emberY, 0, cx, emberY, rR);
        rg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.roarAnim * entrance));
        rg.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * s.roarAnim * entrance));
        rg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
      }

      // ── Bellows at bottom ───────────────────────────
      const bY = h * 0.82 + s.bellowsY * minDim * 0.05;
      const bW = minDim * 0.2;
      const bH = minDim * 0.06;
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.beginPath();
      ctx.moveTo(cx - bW / 2, bY); ctx.lineTo(cx + bW / 2, bY);
      ctx.lineTo(cx + bW * 0.3, bY + bH); ctx.lineTo(cx - bW * 0.3, bY + bH);
      ctx.closePath(); ctx.fill();
      // Nozzle
      ctx.fillRect(cx - px(0.008, minDim), bY - minDim * 0.15, px(0.016, minDim), minDim * 0.15);

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (!s.roaring) {
        s.intensity = Math.min(1, s.intensity + PUMP_BOOST);
        s.bellowsY = 1; s.pumps++;
        callbacksRef.current.onHaptic('tap');
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
