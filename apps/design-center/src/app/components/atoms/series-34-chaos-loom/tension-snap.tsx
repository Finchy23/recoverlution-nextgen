/**
 * ATOM 335: THE TENSION SNAP ENGINE
 * Series 34 — Chaos Loom · Position 5
 *
 * Over-tightened cord vibrating violently. Swipe perpendicular
 * to snap it, releasing cathartic energy wave.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

export default function TensionSnapAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    snapped: false, snapAnim: 0, completed: false, waveR: 0,
    swipeStartY: 0, swiping: false,
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
      if (p.phase === 'resolve') s.snapped = true;

      if (s.snapped) {
        s.snapAnim = Math.min(1, s.snapAnim + 0.012 * ms);
        s.waveR += 0.005 * ms;
        if (s.snapAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.snapped ? s.snapAnim : 0);

      if (!s.snapped) {
        // Taut vibrating cord
        const vib = Math.sin(s.frameCount * 0.8) * px(0.003, minDim);
        ctx.beginPath(); ctx.moveTo(0, cy + vib); ctx.lineTo(w, cy + vib);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.lineWidth = px(0.002, minDim); ctx.stroke();
        // Tension vibration lines
        for (let i = -2; i <= 2; i++) {
          if (i === 0) continue;
          const off = i * px(0.004, minDim);
          ctx.beginPath(); ctx.moveTo(0, cy + off + vib * 0.5); ctx.lineTo(w, cy + off + vib * 0.5);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
          ctx.lineWidth = px(0.0003, minDim); ctx.stroke();
        }
      } else {
        // Snapped ends recoiling
        const recoil = s.snapAnim * px(0.08, minDim);
        ctx.beginPath(); ctx.moveTo(0, cy - recoil * Math.sin(s.frameCount * 0.1)); ctx.lineTo(cx - px(0.02, minDim), cy);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * (1 - s.snapAnim) * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + px(0.02, minDim), cy); ctx.lineTo(w, cy + recoil * Math.sin(s.frameCount * 0.1));
        ctx.stroke();
        // Energy wave
        const wR = s.waveR * minDim;
        ctx.beginPath(); ctx.arc(cx, cy, wR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * Math.max(0, 0.3 - s.waveR) * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.swiping = true; st.current.swipeStartY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.swiping || st.current.snapped) return;
      if (Math.abs(e.clientY - st.current.swipeStartY) > 40) {
        st.current.snapped = true; cbRef.current.onHaptic('swipe_commit'); st.current.swiping = false;
      }
    };
    const onUp = () => { st.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
