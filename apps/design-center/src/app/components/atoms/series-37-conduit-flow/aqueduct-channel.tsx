/**
 * ATOM 362: THE AQUEDUCT ENGINE · Series 37 — Conduit Flow · Position 2
 * Draw a channel path. Scattered water-particles converge into directed power.
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
const PARTICLE_COUNT = 60;
export default function AqueductChannelAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({
    entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    channel: [] as { x: number; y: number }[], drawing: false,
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.004, channelIdx: -1 })),
    flowing: false, flowAnim: 0, completed: false,
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
      // Channel drawing
      if (s.channel.length > 5 && !s.flowing) { s.flowing = true; cb.onHaptic('completion'); }
      if (s.flowing) s.flowAnim = Math.min(1, s.flowAnim + 0.008 * ms);
      cb.onStateChange?.(s.flowing ? s.flowAnim : 0);
      // Draw channel
      if (s.channel.length > 1) {
        ctx.beginPath(); ctx.moveTo(s.channel[0].x * w, s.channel[0].y * h);
        for (let i = 1; i < s.channel.length; i++) ctx.lineTo(s.channel[i].x * w, s.channel[i].y * h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.006, minDim); ctx.stroke();
        // Channel walls
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }
      // Particles
      for (const pt of s.particles) {
        if (s.flowing && s.channel.length > 2) {
          const ci = Math.min(s.channel.length - 1, Math.floor(s.flowAnim * s.channel.length + Math.random() * 3) % s.channel.length);
          const target = s.channel[ci];
          pt.x += (target.x - pt.x) * 0.02 * ms; pt.y += (target.y - pt.y) * 0.02 * ms;
        } else {
          pt.x += pt.vx * ms; pt.y += pt.vy * ms;
          pt.vx += (Math.random() - 0.5) * 0.0003; pt.vy += (Math.random() - 0.5) * 0.0003;
          if (pt.x < 0 || pt.x > 1) pt.vx *= -1; if (pt.y < 0 || pt.y > 1) pt.vy *= -1;
        }
        const r = px(s.flowing ? 0.003 : 0.004, minDim);
        ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.flowing ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (s.flowing ? 0.35 : 0.15) * entrance); ctx.fill();
      }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.drawing = true; st.current.channel = []; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.drawing) return;
      const rect = canvas.getBoundingClientRect();
      st.current.channel.push({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    };
    const onUp = () => { st.current.drawing = false; if (st.current.channel.length > 3) cbRef.current.onHaptic('drag_snap'); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
