/**
 * ATOM 346: THE FAULT LINE RELEASE ENGINE
 * Series 35 — Pressure Vessel · Position 6
 *
 * Stable surface with hidden fault. Swipe along exact line
 * to trigger tectonic release and reorganization.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

export default function FaultLineReleaseAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const faultAngle = useRef(0.3 + Math.random() * 0.4); // diagonal fault
  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    released: false, releaseAnim: 0, completed: false,
    swipeHits: 0, swiping: false,
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
      if (p.phase === 'resolve') s.released = true;

      if (s.released) s.releaseAnim = Math.min(1, s.releaseAnim + 0.01 * ms);
      if (s.releaseAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      cb.onStateChange?.(s.released ? s.releaseAnim : 0);

      // Surface grid
      const step = px(0.025, minDim);
      const shift = s.released ? s.releaseAnim * px(0.02, minDim) : 0;
      for (let x = step; x < w; x += step) {
        ctx.beginPath(); ctx.moveTo(x + (x < cx ? -shift : shift), 0); ctx.lineTo(x + (x < cx ? -shift : shift), h);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.04 * entrance); ctx.lineWidth = px(0.0003, minDim); ctx.stroke();
      }
      for (let y = step; y < h; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y + (y < cy ? -shift : shift)); ctx.lineTo(w, y + (y < cy ? -shift : shift));
        ctx.stroke();
      }

      // Fault line (subtle)
      const fa = faultAngle.current;
      const fStartX = 0; const fStartY = h * fa;
      const fEndX = w; const fEndY = h * (1 - fa);
      ctx.beginPath(); ctx.moveTo(fStartX, fStartY); ctx.lineTo(fEndX, fEndY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (s.released ? 0.4 * s.releaseAnim : 0.04) * entrance);
      ctx.lineWidth = px(s.released ? 0.002 : 0.0004, minDim); ctx.stroke();

      // Release energy wave
      if (s.released) {
        const waveW = s.releaseAnim * w * 0.3;
        const midX = cx; const midY = cy;
        ctx.beginPath(); ctx.ellipse(midX, midY, waveW, waveW * 0.3, fa, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * (1 - s.releaseAnim) * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.swiping = true; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.swiping || st.current.released) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const fa = faultAngle.current;
      const expectedY = fa + (1 - 2 * fa) * mx;
      if (Math.abs(my - expectedY) < 0.08) { st.current.swipeHits++; if (st.current.swipeHits > 5) { st.current.released = true; cbRef.current.onHaptic('swipe_commit'); } }
    };
    const onUp = () => { st.current.swiping = false; st.current.swipeHits = 0; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
