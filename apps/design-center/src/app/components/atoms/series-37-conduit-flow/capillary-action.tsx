/** ATOM 365: CAPILLARY ACTION · S37 P5 — Hold finger at top. Liquid rises against gravity through thin tube. Patience defeats physics. */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
const TUBE_W = 0.025; const RISE_RATE = 0.002;
export default function CapillaryActionAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const cbRef = useRef({ onHaptic, onStateChange }); const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]); useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({ entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), holding: false, level: 0, risen: false, riseAnim: 0, completed: false });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; let animId: number;
    const render = () => { const s = st.current; const p = propsRef.current; const cb = cbRef.current; const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height); const ms = motionScale(p.reducedMotion); s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase); s.entranceProgress = progress; if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance); if (p.phase === 'resolve') s.level = 1;
      if (s.holding) s.level = Math.min(1, s.level + RISE_RATE * ms); else s.level = Math.max(0, s.level - 0.0005);
      if (s.level >= 0.95 && !s.risen) { s.risen = true; cb.onHaptic('completion'); } if (s.risen) s.riseAnim = Math.min(1, s.riseAnim + 0.01 * ms); cb.onStateChange?.(s.risen ? 0.5 + s.riseAnim * 0.5 : s.level * 0.5);
      const tubeW = minDim * TUBE_W; const tubeL = cx - tubeW / 2; const reservoirY = h * 0.75; const tubeTop = h * 0.15;
      // Reservoir
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance); ctx.fillRect(cx - minDim * 0.15, reservoirY, minDim * 0.3, h - reservoirY);
      // Tube
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance); ctx.lineWidth = px(0.001, minDim); ctx.strokeRect(tubeL, tubeTop, tubeW, reservoirY - tubeTop);
      // Rising liquid
      const liquidH = (reservoirY - tubeTop) * s.level; const liquidTop = reservoirY - liquidH;
      if (s.level > 0.01) { const lg = ctx.createLinearGradient(cx, liquidTop, cx, reservoirY); lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance)); lg.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance)); ctx.fillStyle = lg; ctx.fillRect(tubeL + px(0.001, minDim), liquidTop, tubeW - px(0.002, minDim), liquidH); }
      // Top glow when risen
      if (s.risen) { const gR = minDim * 0.06; const gg = ctx.createRadialGradient(cx, tubeTop, 0, cx, tubeTop, gR); gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.riseAnim * entrance)); gg.addColorStop(1, rgba(s.primaryRgb, 0)); ctx.fillStyle = gg; ctx.fillRect(cx - gR, tubeTop - gR, gR * 2, gR * 2); }
      ctx.restore(); animId = requestAnimationFrame(render); };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); }; const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
