/**
 * ATOM 340: THE TAPESTRY ENGINE
 * Series 34 — Chaos Loom · Position 10 (Capstone)
 *
 * Zoomed in on chaotic ugly pixels. Pinch to zoom out —
 * pixels resolve into stunning geometric tapestry.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

export default function TapestryIntegrationAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    zoom: 0, // 0 = zoomed in (chaos), 1 = zoomed out (pattern)
    revealed: false, revealAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.zoom = 1;

      if (s.zoom >= 0.9 && !s.revealed) { s.revealed = true; cb.onHaptic('completion'); }
      if (s.revealed) s.revealAnim = Math.min(1, s.revealAnim + 0.012 * ms);
      cb.onStateChange?.(s.revealed ? 0.5 + s.revealAnim * 0.5 : s.zoom * 0.5);

      const pixelSize = Math.max(2, px(0.03 * (1 - s.zoom) + 0.002, minDim));
      const chaos = 1 - s.zoom;

      // Draw pixel/tapestry pattern
      for (let x = 0; x < w; x += pixelSize) {
        for (let y = 0; y < h; y += pixelSize) {
          const fx = x / w; const fy = y / h;
          // Geometric pattern (mandala-ish)
          const dx = fx - 0.5; const dy = fy - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const pattern = Math.sin(dist * 20 + angle * 6) * 0.5 + 0.5;
          // Chaos noise when zoomed in
          const noise = chaos * (Math.random() * 0.5);
          const value = pattern * s.zoom + noise;
          const isAccent = pattern > 0.5;
          const rgb = isAccent ? s.accentRgb : s.primaryRgb;
          ctx.fillStyle = rgba(rgb, ALPHA.content.max * (0.05 + value * 0.2) * entrance);
          ctx.fillRect(x, y, pixelSize - 0.5, pixelSize - 0.5);
        }
      }

      // Tapestry glow overlay when zoomed out
      if (s.zoom > 0.5) {
        const gR = px(0.15 * s.zoom, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * s.zoom * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    // Pinch inward = zoom out
    const onDown = (e: PointerEvent) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size === 2) { const pts = Array.from(pointers.values()); initDist = Math.sqrt((pts[0].x - pts[1].x) ** 2 + (pts[0].y - pts[1].y) ** 2); } };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2 && initDist > 0) {
        const pts = Array.from(pointers.values());
        const dist = Math.sqrt((pts[0].x - pts[1].x) ** 2 + (pts[0].y - pts[1].y) ** 2);
        const delta = initDist - dist; // pinch inward = positive
        if (delta > 0) st.current.zoom = Math.min(1, delta / 150);
      }
    };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); };
    // Single-finger: scroll down to zoom out
    let singleY = 0;
    const onDown2 = (e: PointerEvent) => { singleY = e.clientY; };
    const onMove2 = (e: PointerEvent) => { if (pointers.size < 2) { const dy = e.clientY - singleY; if (dy > 0) st.current.zoom = Math.min(1, dy / 200); } };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerdown', onDown2);
    canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointermove', onMove2);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerdown', onDown2); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointermove', onMove2); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>);
}
