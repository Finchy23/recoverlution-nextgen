/**
 * ATOM 333: THE FABRIC TEAR ENGINE
 * Series 34 — Chaos Loom · Position 3
 *
 * Tight digital fabric. Pinch rips it apart revealing
 * pure clean glowing void underneath.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

export default function FabricTearAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    tearProgress: 0, torn: false, tornAnim: 0, completed: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const pointers = new Map<number, { x: number; y: number }>();

    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.tearProgress = 1;

      if (s.tearProgress >= 0.95 && !s.torn) { s.torn = true; cb.onHaptic('completion'); }
      if (s.torn) s.tornAnim = Math.min(1, s.tornAnim + 0.012 * ms);
      cb.onStateChange?.(s.torn ? 0.5 + s.tornAnim * 0.5 : s.tearProgress * 0.5);

      const tearGap = s.tearProgress * w * 0.4;
      const leftEdge = cx - tearGap / 2;
      const rightEdge = cx + tearGap / 2;

      // Fabric (left half)
      if (s.tearProgress < 1) {
        // Woven grid pattern
        const step = px(0.008, minDim);
        for (let y = 0; y < h; y += step) {
          // Left fabric
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Math.max(0, leftEdge), y);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * (1 - s.tearProgress * 0.5) * entrance);
          ctx.lineWidth = px(0.0004, minDim); ctx.stroke();
          // Right fabric
          ctx.beginPath(); ctx.moveTo(Math.min(w, rightEdge), y); ctx.lineTo(w, y);
          ctx.stroke();
        }
        for (let x = 0; x < w; x += step) {
          if (x < leftEdge) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
          if (x > rightEdge) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        }
      }

      // Tear edges (jagged)
      if (s.tearProgress > 0.01) {
        for (const edge of [leftEdge, rightEdge]) {
          ctx.beginPath();
          for (let y = 0; y < h; y += 4) {
            const jag = Math.sin(y * 0.1 + s.frameCount * 0.01) * px(0.003, minDim) * s.tearProgress;
            if (y === 0) ctx.moveTo(edge + jag, y); else ctx.lineTo(edge + jag, y);
          }
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
          ctx.lineWidth = px(0.0008, minDim); ctx.stroke();
        }
      }

      // Void glow in center
      if (s.tearProgress > 0.3) {
        const gR = px(0.08 * s.tearProgress, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.tearProgress * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        const pts = Array.from(pointers.values());
        const dist = Math.abs(pts[0].x - pts[1].x);
        const rect = canvas.getBoundingClientRect();
        st.current.tearProgress = Math.min(1, dist / rect.width * 2);
      }
    };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); };
    // Single-finger fallback: swipe from center outward
    let singleStart = 0;
    const onDown2 = (e: PointerEvent) => { singleStart = e.clientX; };
    const onMove2 = (e: PointerEvent) => {
      if (pointers.size >= 2) return;
      const rect = canvas.getBoundingClientRect();
      st.current.tearProgress = Math.min(1, Math.abs(e.clientX - singleStart) / rect.width * 3);
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerdown', onDown2);
    canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointermove', onMove2);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerdown', onDown2); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointermove', onMove2); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>);
}
