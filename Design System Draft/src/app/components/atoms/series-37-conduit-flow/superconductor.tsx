/** ATOM 368: SUPERCONDUCTOR · S37 P8 — Hold to cool system. Resistance drops to zero. Perfect flow. */
import { useRef, useEffect } from 'react'; import type { AtomProps } from '../types'; import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
export default function SuperconductorAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const cbRef = useRef({ onHaptic, onStateChange }); const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed }); useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]); useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({ entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), holding: false, temperature: 1, zeroR: false, zAnim: 0, completed: false });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; let animId: number;
    const render = () => { const s = st.current; const p = propsRef.current; const cb = cbRef.current; const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height); const ms = motionScale(p.reducedMotion); s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase); s.entranceProgress = progress; if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (s.holding) s.temperature = Math.max(0, s.temperature - 0.004 * ms); if (p.phase === 'resolve') s.temperature = 0;
      if (s.temperature <= 0.02 && !s.zeroR) { s.zeroR = true; cb.onHaptic('completion'); } if (s.zeroR) s.zAnim = Math.min(1, s.zAnim + 0.01 * ms);
      cb.onStateChange?.(s.zeroR ? 0.5 + s.zAnim * 0.5 : (1 - s.temperature) * 0.5);
      const segments = 10; const segW = w / segments;
      for (let i = 0; i < segments; i++) { const x = i * segW; const resistance = s.temperature;
        const brightness = 1 - resistance * (i / segments); const decay = 1 - (i / segments) * resistance;
        ctx.fillStyle = rgba(s.zeroR ? s.primaryRgb : s.accentRgb, ALPHA.content.max * brightness * 0.3 * entrance);
        ctx.fillRect(x, cy - minDim * 0.02, segW - 2, minDim * 0.04);
        if (resistance > 0.3) { const sparkle = Math.random() < resistance * 0.1; if (sparkle) { ctx.beginPath(); ctx.arc(x + Math.random() * segW, cy + (Math.random() - 0.5) * minDim * 0.06, px(0.002, minDim), 0, Math.PI * 2); ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * resistance * entrance); ctx.fill(); } } }
      // Perfect flow glow
      if (s.zeroR) { const lg = ctx.createLinearGradient(0, cy, w, cy); lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.zAnim * entrance)); lg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.zAnim * entrance)); lg.addColorStop(1, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.zAnim * entrance)); ctx.fillStyle = lg; ctx.fillRect(0, cy - minDim * 0.04, w, minDim * 0.08); }
      // Temp gauge
      ctx.fillStyle = rgba(s.temperature > 0.5 ? s.accentRgb : s.primaryRgb, ALPHA.content.max * 0.2 * entrance); ctx.fillRect(w * 0.92, h * 0.1, px(0.005, minDim), (h * 0.8) * s.temperature);
      ctx.restore(); animId = requestAnimationFrame(render); };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); }; const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
