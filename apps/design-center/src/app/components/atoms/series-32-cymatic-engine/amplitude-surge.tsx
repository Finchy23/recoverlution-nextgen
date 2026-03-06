/**
 * ATOM 317: THE AMPLITUDE SURGE ENGINE
 * Series 32 — Cymatic Engine · Position 7
 *
 * Dim geometry. Rhythmic tapping pumps amplitude.
 * Breach threshold triggers violent flash and permanent lock.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const MAX_TAPS = 12;

export default function AmplitudeSurgeAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    taps: 0, amplitude: 0, locked: false, lockAnim: 0, completed: false, flashAnim: 0,
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

      s.amplitude = s.taps / MAX_TAPS;
      if (!s.locked) s.amplitude = Math.max(0, s.amplitude - 0.0005); // slow decay
      if (s.taps >= MAX_TAPS && !s.locked) {
        s.locked = true; s.flashAnim = 1; cb.onHaptic('completion');
      }
      if (s.locked) { s.lockAnim = Math.min(1, s.lockAnim + 0.012 * ms); s.flashAnim = Math.max(0, s.flashAnim - 0.02); }
      cb.onStateChange?.(s.locked ? 0.5 + s.lockAnim * 0.5 : s.amplitude * 0.5);

      // Geometry (hexagon)
      const gR = px(0.07, minDim);
      const glow = 0.05 + s.amplitude * 0.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px2 = cx + Math.cos(a) * gR; const py2 = cy + Math.sin(a) * gR;
        if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * glow * entrance);
      ctx.lineWidth = px(0.001 + s.amplitude * 0.002, minDim); ctx.stroke();

      // Inner fill glow
      const fillR = gR * (0.5 + s.amplitude * 0.5);
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fillR);
      fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glow * 0.5 * entrance));
      fg.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = fg; ctx.fillRect(cx - fillR, cy - fillR, fillR * 2, fillR * 2);

      // Flash
      if (s.flashAnim > 0) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * s.flashAnim * 0.3 * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      // Amplitude bar
      const barX = w * 0.06; const barBot = h * 0.85; const barH = h * 0.6;
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
      ctx.fillRect(barX - px(0.003, minDim), barBot - barH, px(0.006, minDim), barH);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.fillRect(barX - px(0.003, minDim), barBot - barH * s.amplitude, px(0.006, minDim), barH * s.amplitude);

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { if (!st.current.locked) { st.current.taps++; cbRef.current.onHaptic('tap'); } };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
