/**
 * ATOM 341: THE COMPRESSION DIAMOND ENGINE
 * Series 35 — Pressure Vessel · Position 1
 *
 * Pinch inward to compress chaotic particles. At threshold,
 * material crystallizes into perfect rotating diamond.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const PARTICLE_COUNT = 40;

export default function CompressionDiamondAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({ x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003 })),
    compression: 0, crystallized: false, crystalAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.compression = 1;

      if (s.compression >= 0.95 && !s.crystallized) { s.crystallized = true; cb.onHaptic('completion'); }
      if (s.crystallized) s.crystalAnim = Math.min(1, s.crystalAnim + 0.012 * ms);
      cb.onStateChange?.(s.crystallized ? 0.5 + s.crystalAnim * 0.5 : s.compression * 0.5);

      const radius = 0.15 * (1 - s.compression * 0.7);

      if (!s.crystallized || s.crystalAnim < 0.5) {
        const fade = s.crystallized ? 1 - s.crystalAnim * 2 : 1;
        for (const pt of s.particles) {
          pt.x += (0.5 - pt.x) * s.compression * 0.02 * ms + pt.vx * (1 - s.compression) * ms;
          pt.y += (0.5 - pt.y) * s.compression * 0.02 * ms + pt.vy * (1 - s.compression) * ms;
          pt.vx += (Math.random() - 0.5) * 0.0003 * (1 - s.compression); pt.vy += (Math.random() - 0.5) * 0.0003 * (1 - s.compression);
          ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * fade * entrance); ctx.fill();
        }
      }

      if (s.crystallized) {
        const dR = px(0.04 + s.crystalAnim * 0.02, minDim);
        const rot = s.frameCount * 0.005;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
        ctx.beginPath();
        ctx.moveTo(0, -dR); ctx.lineTo(dR * 0.7, 0); ctx.lineTo(0, dR); ctx.lineTo(-dR * 0.7, 0); ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * s.crystalAnim * entrance); ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * s.crystalAnim * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
        ctx.restore();
        const gR = dR * 3;
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.crystalAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size === 2) { const pts = Array.from(pointers.values()); initDist = Math.sqrt((pts[0].x - pts[1].x) ** 2 + (pts[0].y - pts[1].y) ** 2); } };
    const onMove = (e: PointerEvent) => { if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size >= 2 && initDist > 0) { const pts = Array.from(pointers.values()); const dist = Math.sqrt((pts[0].x - pts[1].x) ** 2 + (pts[0].y - pts[1].y) ** 2); const delta = initDist - dist; if (delta > 0) st.current.compression = Math.min(1, delta / 120); } };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); };
    // Single-finger: hold
    let holdTimer = 0;
    const onDown2 = () => { holdTimer = setInterval(() => { if (!st.current.crystallized) st.current.compression = Math.min(1, st.current.compression + 0.01); }, 16); };
    const onUp2 = () => { clearInterval(holdTimer); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerdown', onDown2);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointerup', onUp2);
    canvas.addEventListener('pointercancel', onUp); canvas.addEventListener('pointercancel', onUp2);
    return () => { cancelAnimationFrame(animId); clearInterval(holdTimer); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerdown', onDown2); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointerup', onUp2); canvas.removeEventListener('pointercancel', onUp); canvas.removeEventListener('pointercancel', onUp2); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>);
}
