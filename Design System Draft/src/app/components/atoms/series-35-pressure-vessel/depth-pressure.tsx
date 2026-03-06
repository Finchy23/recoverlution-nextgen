/**
 * ATOM 347: THE DEPTH PRESSURE ENGINE
 * Series 35 — Pressure Vessel · Position 7
 *
 * Scrub downward diving deeper. At maximum depth,
 * bioluminescent structures appear.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

export default function DepthPressureAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    depth: 0, dragging: false, startY: 0,
    deepReached: false, deepAnim: 0, completed: false,
    biolum: Array.from({ length: 8 }, () => ({ x: 0.15 + Math.random() * 0.7, y: 0.2 + Math.random() * 0.6, r: 0.01 + Math.random() * 0.02, pulse: Math.random() * Math.PI * 2 })),
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
      if (p.phase === 'resolve') s.depth = 1;

      if (s.depth >= 0.9 && !s.deepReached) { s.deepReached = true; cb.onHaptic('completion'); }
      if (s.deepReached) s.deepAnim = Math.min(1, s.deepAnim + 0.012 * ms);
      cb.onStateChange?.(s.deepReached ? 0.5 + s.deepAnim * 0.5 : s.depth * 0.5);

      // Darkness overlay
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * s.depth * 0.3 * entrance);
      ctx.fillRect(0, 0, w, h);

      // Bioluminescence (visible only at depth)
      if (s.depth > 0.5) {
        const bioAlpha = (s.depth - 0.5) * 2;
        for (const b of s.biolum) {
          b.pulse += 0.02;
          const pulse = Math.sin(b.pulse) * 0.3 + 0.7;
          const bR = px(b.r * pulse, minDim);
          const gR = bR * 3;
          const gg = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * bioAlpha * pulse * entrance));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg; ctx.fillRect(b.x * w - gR, b.y * h - gR, gR * 2, gR * 2);
          ctx.beginPath(); ctx.arc(b.x * w, b.y * h, bR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * bioAlpha * pulse * entrance); ctx.fill();
        }
      }

      // Depth gauge
      const gaugeX = w * 0.06; const gaugeT = h * 0.1; const gaugeB = h * 0.9;
      ctx.beginPath(); ctx.moveTo(gaugeX, gaugeT); ctx.lineTo(gaugeX, gaugeB);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      const kY = gaugeT + s.depth * (gaugeB - gaugeT);
      ctx.beginPath(); ctx.arc(gaugeX, kY, px(0.004, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.fill();

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.dragging = true; st.current.startY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const dy = e.clientY - st.current.startY;
      st.current.depth = Math.max(0, Math.min(1, dy / (rect.height * 0.7)));
    };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}
