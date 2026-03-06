/**
 * ATOM 348: THE IMPLOSION CORE ENGINE
 * Series 35 — Pressure Vessel · Position 8
 *
 * Scattered particles. Hold to trigger controlled implosion.
 * All compress into infinitely dense glowing singularity.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const PARTICLE_COUNT = 50;

export default function ImplosionCoreAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({ x: Math.random(), y: Math.random() })),
    holding: false, implosion: 0, collapsed: false, collapseAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.implosion = 1;

      if (s.holding) s.implosion = Math.min(1, s.implosion + 0.005 * ms);
      if (s.implosion >= 0.98 && !s.collapsed) { s.collapsed = true; cb.onHaptic('completion'); }
      if (s.collapsed) s.collapseAnim = Math.min(1, s.collapseAnim + 0.015 * ms);
      cb.onStateChange?.(s.collapsed ? 0.5 + s.collapseAnim * 0.5 : s.implosion * 0.5);

      const pull = s.implosion * 0.04;
      for (const pt of s.particles) {
        pt.x += (0.5 - pt.x) * pull * ms; pt.y += (0.5 - pt.y) * pull * ms;
        if (!s.collapsed) {
          ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * (1 - s.implosion * 0.5) * entrance); ctx.fill();
        }
      }

      if (s.collapsed) {
        const sR = px(0.005 + (1 - s.collapseAnim) * 0.01, minDim);
        ctx.beginPath(); ctx.arc(cx, cy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.8 * entrance); ctx.fill();
        const gR = px(0.06 * s.collapseAnim, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * s.collapseAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

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
