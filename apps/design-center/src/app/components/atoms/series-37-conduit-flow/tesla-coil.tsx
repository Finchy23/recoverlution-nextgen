/** ATOM 369: TESLA COIL · S37 P9 — Hold to charge. Wireless arcs jump to distant nodes. Influence without contact. */
import { useRef, useEffect } from 'react'; import type { AtomProps } from '../types'; import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
export default function TeslaCoilAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const cbRef = useRef({ onHaptic, onStateChange }); const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed }); useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]); useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({ entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), holding: false, charge: 0, receivers: [{x:0.2,y:0.25,lit:false},{x:0.8,y:0.3,lit:false},{x:0.75,y:0.75,lit:false},{x:0.25,y:0.7,lit:false}], allLit: false, litAnim: 0, completed: false });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; let animId: number;
    const render = () => { const s = st.current; const p = propsRef.current; const cb = cbRef.current; const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height); const ms = motionScale(p.reducedMotion); s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase); s.entranceProgress = progress; if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (s.holding) s.charge = Math.min(1, s.charge + 0.004 * ms); else s.charge = Math.max(0, s.charge - 0.002);
      if (p.phase === 'resolve') s.charge = 1;
      for (let i = 0; i < s.receivers.length; i++) { if (!s.receivers[i].lit && s.charge > 0.25 * (i + 1)) { s.receivers[i].lit = true; cb.onHaptic('step_advance'); } }
      if (s.receivers.every(r => r.lit) && !s.allLit) { s.allLit = true; cb.onHaptic('completion'); } if (s.allLit) s.litAnim = Math.min(1, s.litAnim + 0.01 * ms);
      cb.onStateChange?.(s.allLit ? 0.5 + s.litAnim * 0.5 : s.charge * 0.5);
      // Central coil
      const coilR = minDim * 0.04; ctx.beginPath(); ctx.arc(cx, cy, coilR, 0, Math.PI * 2); ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.3 + s.charge * 0.3) * entrance); ctx.lineWidth = px(0.003, minDim); ctx.stroke();
      if (s.charge > 0.1) { const gR = minDim * (0.04 + s.charge * 0.08); const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR); gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.charge * entrance)); gg.addColorStop(1, rgba(s.primaryRgb, 0)); ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2); }
      // Arcs to receivers
      for (const r of s.receivers) { if (!r.lit) { ctx.beginPath(); ctx.arc(r.x * w, r.y * h, px(0.01, minDim), 0, Math.PI * 2); ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance); ctx.fill(); continue; }
        // Arc path
        ctx.beginPath(); let ax = cx; let ay = cy; ctx.moveTo(ax, ay); const segs = 6; for (let i = 1; i <= segs; i++) { const t = i / segs; ax = cx + (r.x * w - cx) * t + (Math.random() - 0.5) * minDim * 0.02; ay = cy + (r.y * h - cy) * t + (Math.random() - 0.5) * minDim * 0.02; ctx.lineTo(ax, ay); }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance); ctx.lineWidth = px(0.0015, minDim); ctx.stroke();
        const gR = px(0.02, minDim); const rg = ctx.createRadialGradient(r.x * w, r.y * h, 0, r.x * w, r.y * h, gR); rg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance)); rg.addColorStop(1, rgba(s.primaryRgb, 0)); ctx.fillStyle = rg; ctx.fillRect(r.x * w - gR, r.y * h - gR, gR * 2, gR * 2);
        ctx.beginPath(); ctx.arc(r.x * w, r.y * h, px(0.01, minDim), 0, Math.PI * 2); ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill(); }
      ctx.restore(); animId = requestAnimationFrame(render); };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); }; const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
