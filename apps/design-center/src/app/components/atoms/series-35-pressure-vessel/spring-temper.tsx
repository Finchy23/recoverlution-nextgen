/**
 * ATOM 349: THE SPRING TEMPER ENGINE
 * Series 35 — Pressure Vessel · Position 9
 *
 * Coiled spring compressed by repeated taps. Each tap compresses more.
 * Release launches the spring into elastic expansion with stored energy.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const MAX_TAPS = 10;

export default function SpringTemperAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    taps: 0, released: false, releaseAnim: 0, completed: false, springY: 0.5,
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
      if (p.phase === 'resolve') s.taps = MAX_TAPS;

      const compression = Math.min(1, s.taps / MAX_TAPS);
      if (compression >= 1 && !s.released) { s.released = true; cb.onHaptic('completion'); }
      if (s.released) {
        s.releaseAnim = Math.min(1, s.releaseAnim + 0.015 * ms);
        s.springY = 0.5 - s.releaseAnim * 0.3;
      }
      cb.onStateChange?.(s.released ? 0.5 + s.releaseAnim * 0.5 : compression * 0.5);

      // Spring coils
      const coils = 8;
      const springTop = s.released ? s.springY * h : h * (0.35 + compression * 0.15);
      const springBot = h * 0.7;
      const springW = px(0.03, minDim);
      ctx.beginPath();
      for (let i = 0; i <= coils * 10; i++) {
        const t = i / (coils * 10);
        const y = springTop + t * (springBot - springTop);
        const x = cx + Math.sin(t * coils * Math.PI * 2) * springW;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(s.released ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * (0.3 + compression * 0.2) * entrance);
      ctx.lineWidth = px(0.0015, minDim); ctx.stroke();

      // Energy indicator
      if (compression > 0 && !s.released) {
        const eR = px(0.01 + compression * 0.015, minDim);
        ctx.beginPath(); ctx.arc(cx, springBot + px(0.02, minDim), eR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * compression * entrance); ctx.fill();
      }

      // Release glow
      if (s.released) {
        const gR = px(0.04 * s.releaseAnim, minDim);
        const gg = ctx.createRadialGradient(cx, springTop, 0, cx, springTop, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.releaseAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, springTop - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { if (!st.current.released && st.current.taps < MAX_TAPS) { st.current.taps++; cbRef.current.onHaptic('tap'); } };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
