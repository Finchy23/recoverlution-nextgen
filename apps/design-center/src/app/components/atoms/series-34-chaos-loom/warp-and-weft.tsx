/**
 * ATOM 336: THE WARP & WEFT ENGINE
 * Series 34 — Chaos Loom · Position 6
 *
 * Chaotic flowing lines. Vertical drag then horizontal drag
 * locks into rigid organized architectural grid.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

export default function WarpAndWeftAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    warpLocked: false, weftLocked: false,
    lockAnim: 0, completed: false,
    swiping: false, startX: 0, startY: 0,
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
      if (p.phase === 'resolve') { s.warpLocked = true; s.weftLocked = true; }

      if (s.warpLocked && s.weftLocked && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      if (s.completed) s.lockAnim = Math.min(1, s.lockAnim + 0.012 * ms);
      cb.onStateChange?.(s.completed ? 0.5 + s.lockAnim * 0.5 : (s.warpLocked ? 0.25 : 0) + (s.weftLocked ? 0.25 : 0));

      const step = px(0.02, minDim);
      // Vertical lines (warp)
      for (let x = step; x < w; x += step) {
        ctx.beginPath();
        for (let y = 0; y < h; y += 3) {
          const chaos = s.warpLocked ? 0 : Math.sin(y * 0.03 + s.frameCount * 0.02 + x * 0.01) * px(0.005, minDim);
          if (y === 0) ctx.moveTo(x + chaos, y); else ctx.lineTo(x + chaos, y);
        }
        ctx.strokeStyle = rgba(s.warpLocked ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (s.warpLocked ? 0.15 + s.lockAnim * 0.15 : 0.08) * entrance);
        ctx.lineWidth = px(0.0004, minDim); ctx.stroke();
      }
      // Horizontal lines (weft)
      for (let y = step; y < h; y += step) {
        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const chaos = s.weftLocked ? 0 : Math.cos(x * 0.03 + s.frameCount * 0.02 + y * 0.01) * px(0.005, minDim);
          if (x === 0) ctx.moveTo(x, y + chaos); else ctx.lineTo(x, y + chaos);
        }
        ctx.strokeStyle = rgba(s.weftLocked ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (s.weftLocked ? 0.15 + s.lockAnim * 0.15 : 0.08) * entrance);
        ctx.lineWidth = px(0.0004, minDim); ctx.stroke();
      }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.swiping = true; st.current.startX = e.clientX; st.current.startY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.swiping) return;
      const dx = Math.abs(e.clientX - st.current.startX);
      const dy = Math.abs(e.clientY - st.current.startY);
      if (dy > 60 && !st.current.warpLocked) { st.current.warpLocked = true; cbRef.current.onHaptic('drag_snap'); st.current.swiping = false; }
      if (dx > 60 && !st.current.weftLocked) { st.current.weftLocked = true; cbRef.current.onHaptic('step_advance'); st.current.swiping = false; }
    };
    const onUp = () => { st.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
