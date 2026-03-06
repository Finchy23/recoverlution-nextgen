/**
 * ATOM 364: THE TRANSFORMER COIL ENGINE · S37 · Position 4
 * Chaotic high-voltage input. Wind coil by circular drag. Output becomes smooth sustained current.
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
const COIL_WINDS = 6;
export default function TransformerCoilAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const cbRef = useRef({ onHaptic, onStateChange }); const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({ entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), winds: 0, dragging: false, lastAngle: 0, totalRot: 0, regulated: false, regAnim: 0, completed: false });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; let animId: number;
    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase); s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.winds = COIL_WINDS;
      const ratio = Math.min(1, s.winds / COIL_WINDS);
      if (ratio >= 1 && !s.regulated) { s.regulated = true; cb.onHaptic('completion'); }
      if (s.regulated) s.regAnim = Math.min(1, s.regAnim + 0.01 * ms);
      cb.onStateChange?.(s.regulated ? 0.5 + s.regAnim * 0.5 : ratio * 0.5);
      // Input wave (left) — chaotic
      const inputChaos = 1 - ratio;
      ctx.beginPath();
      for (let x = 0; x < w * 0.3; x += 2) {
        const y = cy + Math.sin(x * 0.05 + s.frameCount * 0.15 * (1 + inputChaos)) * minDim * 0.08 * (1 + inputChaos * 2) * (Math.sin(x * 0.1) + 1);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance); ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      // Coil in center — large
      const coilR = minDim * 0.1;
      for (let i = 0; i < Math.min(s.winds, COIL_WINDS); i++) {
        const a = (i / COIL_WINDS) * Math.PI * 2;
        const cR = coilR * (0.6 + i * 0.06);
        ctx.beginPath(); ctx.arc(cx, cy, cR, a, a + Math.PI * 0.8);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.15 + ratio * 0.2) * entrance);
        ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, px(0.012, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.fill();
      // Output wave (right) — smooth
      if (ratio > 0.2) {
        ctx.beginPath();
        for (let x = w * 0.7; x < w; x += 2) {
          const y = cy + Math.sin((x - w * 0.7) * 0.03 + s.frameCount * 0.02) * minDim * 0.03 * ratio;
          if (x === w * 0.7) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * ratio * entrance); ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      }
      if (s.regulated) { const gR = minDim * 0.15; const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR); gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.regAnim * entrance)); gg.addColorStop(1, rgba(s.primaryRgb, 0)); ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2); }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.dragging = true; const rect = canvas.getBoundingClientRect(); st.current.lastAngle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2); };
    const onMove = (e: PointerEvent) => { if (!st.current.dragging) return; const rect = canvas.getBoundingClientRect(); const a = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2); let d = a - st.current.lastAngle; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; st.current.totalRot += Math.abs(d); st.current.winds = Math.floor(st.current.totalRot / (Math.PI * 2)); st.current.lastAngle = a; };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
