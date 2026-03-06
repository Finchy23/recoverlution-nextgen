/** ATOM 367: VENTURI EFFECT · S37 P7 — Pinch channel narrow. Flow velocity increases. Constraint is amplification. */
import { useRef, useEffect } from 'react'; import type { AtomProps } from '../types'; import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
const PARTICLE_COUNT = 50;
export default function VenturiEffectAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const cbRef = useRef({ onHaptic, onStateChange }); const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed }); useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]); useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({ entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), constriction: 0, holding: false, maxed: false, maxAnim: 0, completed: false, particles: Array.from({ length: PARTICLE_COUNT }, (_, i) => ({ x: (i / PARTICLE_COUNT), y: 0.5 + (Math.random() - 0.5) * 0.3 })) });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; let animId: number;
    const render = () => { const s = st.current; const p = propsRef.current; const cb = cbRef.current; const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height); const ms = motionScale(p.reducedMotion); s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase); s.entranceProgress = progress; if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (s.holding) s.constriction = Math.min(1, s.constriction + 0.005 * ms); if (p.phase === 'resolve') s.constriction = 1;
      if (s.constriction >= 0.95 && !s.maxed) { s.maxed = true; cb.onHaptic('completion'); } if (s.maxed) s.maxAnim = Math.min(1, s.maxAnim + 0.01 * ms);
      cb.onStateChange?.(s.maxed ? 0.5 + s.maxAnim * 0.5 : s.constriction * 0.5);
      const channelH = 0.3 * (1 - s.constriction * 0.8); const speed = 0.002 + s.constriction * 0.01;
      // Channel walls
      ctx.beginPath(); ctx.moveTo(0, cy - channelH * h * 2); ctx.bezierCurveTo(cx, cy - channelH * h, cx, cy - channelH * h, w, cy - channelH * h * 2);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance); ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + channelH * h * 2); ctx.bezierCurveTo(cx, cy + channelH * h, cx, cy + channelH * h, w, cy + channelH * h * 2);
      ctx.stroke();
      // Particles flowing through
      for (const pt of s.particles) { pt.x += speed * ms; if (pt.x > 1.05) pt.x = -0.05;
        const distToCenter = Math.abs(pt.x - 0.5); const localH = channelH * (1 + distToCenter * 2); pt.y += (0.5 - pt.y) * s.constriction * 0.02;
        const r = px(0.003 - s.constriction * 0.001, minDim); ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.constriction > 0.5 ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (0.2 + s.constriction * 0.3) * entrance); ctx.fill(); }
      if (s.maxed) { const gR = minDim * 0.04; const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR); gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.maxAnim * entrance)); gg.addColorStop(1, rgba(s.primaryRgb, 0)); ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2); }
      ctx.restore(); animId = requestAnimationFrame(render); };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); }; const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
