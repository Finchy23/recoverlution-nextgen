/**
 * ATOM 339: THE KNOT RELEASE ENGINE
 * Series 34 — Chaos Loom · Position 9
 *
 * Tight vibrating knot. Two-finger pull unravels into
 * relaxed perfectly straight line.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

export default function KnotReleaseAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    unravelProgress: 0, released: false, releaseAnim: 0, completed: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const pointers = new Map<number, { x: number; y: number }>();
    let initDist = 0;

    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.unravelProgress = 1;

      if (s.unravelProgress >= 0.95 && !s.released) { s.released = true; cb.onHaptic('completion'); }
      if (s.released) s.releaseAnim = Math.min(1, s.releaseAnim + 0.012 * ms);
      cb.onStateChange?.(s.released ? 0.5 + s.releaseAnim * 0.5 : s.unravelProgress * 0.5);

      const knottiness = 1 - s.unravelProgress;
      const knotR = px(0.04 * knottiness, minDim);
      const lineExtent = s.unravelProgress * w * 0.35;

      // Knot (tangled loops in center)
      if (knottiness > 0.01) {
        const loops = 5;
        for (let i = 0; i < loops; i++) {
          const a = (i / loops) * Math.PI * 2 + s.frameCount * 0.03 * knottiness;
          const lx = cx + Math.cos(a) * knotR;
          const ly = cy + Math.sin(a * 1.5) * knotR;
          ctx.beginPath(); ctx.arc(lx, ly, px(0.008 * knottiness, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * knottiness * entrance);
          ctx.lineWidth = px(0.001, minDim); ctx.stroke();
        }
        // Vibration
        const vib = knottiness * px(0.002, minDim) * Math.sin(s.frameCount * 0.5);
        ctx.beginPath(); ctx.arc(cx + vib, cy, px(0.01, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * knottiness * entrance); ctx.fill();
      }

      // Straight line extending from center
      if (s.unravelProgress > 0.1) {
        ctx.beginPath(); ctx.moveTo(cx - lineExtent, cy); ctx.lineTo(cx + lineExtent, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.2 + s.unravelProgress * 0.3) * entrance);
        ctx.lineWidth = px(0.0015, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) { const pts = Array.from(pointers.values()); initDist = Math.sqrt((pts[0].x - pts[1].x) ** 2 + (pts[0].y - pts[1].y) ** 2); }
    };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2 && initDist > 0) {
        const pts = Array.from(pointers.values());
        const dist = Math.sqrt((pts[0].x - pts[1].x) ** 2 + (pts[0].y - pts[1].y) ** 2);
        const delta = dist - initDist;
        if (delta > 0) st.current.unravelProgress = Math.min(1, delta / 200);
      }
    };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); if (pointers.size < 2) initDist = 0; };
    // Single-finger fallback: horizontal drag
    let singleX = 0;
    const onDown2 = (e: PointerEvent) => { singleX = e.clientX; };
    const onMove2 = (e: PointerEvent) => { if (pointers.size < 2) st.current.unravelProgress = Math.min(1, Math.abs(e.clientX - singleX) / 150); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerdown', onDown2);
    canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointermove', onMove2);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerdown', onDown2); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointermove', onMove2); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
