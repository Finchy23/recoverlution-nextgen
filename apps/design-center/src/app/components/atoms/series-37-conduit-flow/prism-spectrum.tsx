/**
 * ATOM 363: THE PRISM SPECTRUM ENGINE · S37 · Position 3
 * Intense white beam. Position prism to split into ROYGBIV spectrum bands.
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
const SPECTRUM = [[255,60,60],[255,140,40],[255,220,50],[80,220,80],[60,160,255],[100,80,220],[180,60,200]];
export default function PrismSpectrumAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange }); const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({ entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), prismX: 0.35, prismY: 0.5, dragging: false, split: false, splitAnim: 0, completed: false });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; let animId: number;
    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (Math.abs(s.prismX - 0.35) > 0.02 && !s.split) { s.split = true; cb.onHaptic('completion'); }
      if (s.split) s.splitAnim = Math.min(1, s.splitAnim + 0.012 * ms);
      cb.onStateChange?.(s.split ? 0.5 + s.splitAnim * 0.5 : 0);
      // Input beam
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(s.prismX * w, cy);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.lineWidth = px(0.004, minDim); ctx.stroke();
      // Beam glow
      const bg = ctx.createLinearGradient(0, cy - minDim * 0.02, 0, cy + minDim * 0.02);
      bg.addColorStop(0, rgba(s.primaryRgb, 0)); bg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance)); bg.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bg; ctx.fillRect(0, cy - minDim * 0.02, s.prismX * w, minDim * 0.04);
      // Prism — large triangle
      const pS = minDim * 0.08;
      ctx.beginPath(); ctx.moveTo(s.prismX * w, cy - pS); ctx.lineTo(s.prismX * w + pS, cy + pS * 0.7); ctx.lineTo(s.prismX * w - pS, cy + pS * 0.7); ctx.closePath();
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance); ctx.fill();
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance); ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      // Output spectrum
      if (s.split) {
        for (let i = 0; i < 7; i++) {
          const spread = ((i - 3) / 3) * 0.15 * s.splitAnim;
          const endY = cy + spread * h;
          ctx.beginPath(); ctx.moveTo(s.prismX * w + pS, cy); ctx.lineTo(w, endY);
          const c = SPECTRUM[i] as [number, number, number];
          ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${ALPHA.content.max * 0.3 * s.splitAnim * entrance})`;
          ctx.lineWidth = px(0.002, minDim); ctx.stroke();
        }
      }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.dragging = true; };
    const onMove = (e: PointerEvent) => { if (!st.current.dragging) return; const rect = canvas.getBoundingClientRect(); st.current.prismX = Math.max(0.15, Math.min(0.7, (e.clientX - rect.left) / rect.width)); st.current.prismY = (e.clientY - rect.top) / rect.height; };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
