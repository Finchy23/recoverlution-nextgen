/**
 * ATOM 342: THE VACUUM CHAMBER ENGINE
 * Series 35 — Pressure Vessel · Position 2
 *
 * Hold to activate vacuum pump. Atmosphere drains.
 * Only 3 heaviest truths remain floating.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, FONT_SIZE } from '../atom-utils';

const PARTICLE_COUNT = 50;

export default function VacuumChamberAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    particles: Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8,
      weight: i < 3 ? 1 : 0.1 + Math.random() * 0.3, alive: true,
    })),
    holding: false, vacuum: 0, cleared: false, clearAnim: 0, completed: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.vacuum = 1;

      if (s.holding) s.vacuum = Math.min(1, s.vacuum + 0.004 * ms);
      else if (!s.cleared) s.vacuum = Math.max(0, s.vacuum - 0.001);

      for (const pt of s.particles) {
        if (pt.weight < s.vacuum && pt.alive) pt.alive = false;
      }
      const remaining = s.particles.filter(p2 => p2.alive).length;
      if (remaining <= 3 && !s.cleared && s.vacuum > 0.5) { s.cleared = true; cb.onHaptic('completion'); }
      if (s.cleared) s.clearAnim = Math.min(1, s.clearAnim + 0.012 * ms);
      cb.onStateChange?.(s.cleared ? 0.5 + s.clearAnim * 0.5 : s.vacuum * 0.5);

      // Haze
      if (s.vacuum < 0.8) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.05 * (1 - s.vacuum) * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      for (const pt of s.particles) {
        if (!pt.alive) continue;
        const isHeavy = pt.weight >= 1;
        const r = px(isHeavy ? 0.008 : 0.003, minDim);
        ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(isHeavy ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (isHeavy ? 0.6 : 0.2) * entrance);
        ctx.fill();
        if (isHeavy && s.cleared) {
          const gR = r * 4;
          const gg = ctx.createRadialGradient(pt.x * w, pt.y * h, 0, pt.x * w, pt.y * h, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.clearAnim * entrance));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg; ctx.fillRect(pt.x * w - gR, pt.y * h - gR, gR * 2, gR * 2);
        }
      }

      // Vacuum gauge
      ctx.beginPath(); ctx.arc(w * 0.92, h * 0.08, px(0.015, minDim), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.vacuum);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(0.001, minDim); ctx.stroke();

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); };
    const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
