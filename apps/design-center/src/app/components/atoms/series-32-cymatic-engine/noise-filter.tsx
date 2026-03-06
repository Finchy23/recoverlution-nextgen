/**
 * ATOM 318: THE NOISE FILTER ENGINE
 * Series 32 — Cymatic Engine · Position 8
 *
 * TV static covers screen. Circular dial removes static to
 * reveal single pristine glowing waveform.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function NoiseFilterAtom({
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
    clarity: 0, // 0 = all static, 1 = clear
    dragging: false, lastAngle: 0, dialAngle: 0,
    cleared: false, clearAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.clarity = 1;

      if (s.clarity >= 0.95 && !s.cleared) { s.cleared = true; cb.onHaptic('completion'); }
      if (s.cleared) s.clearAnim = Math.min(1, s.clearAnim + 0.012 * ms);
      cb.onStateChange?.(s.cleared ? 0.5 + s.clearAnim * 0.5 : s.clarity * 0.5);

      const noise = 1 - s.clarity;

      // Static noise
      if (noise > 0.01) {
        const step = Math.max(4, Math.round(8 * noise));
        for (let x = 0; x < w; x += step) {
          for (let y = 0; y < h; y += step) {
            if (Math.random() > noise * 0.5) continue;
            const b = Math.random() * 0.3;
            ctx.fillStyle = rgba(s.accentRgb, b * noise * entrance);
            ctx.fillRect(x, y, step, step);
          }
        }
      }

      // Clean waveform
      if (s.clarity > 0.1) {
        ctx.beginPath();
        const waveAmp = px(0.04, minDim);
        for (let x = 0; x < w; x += 2) {
          const val = Math.sin(x * 0.015 + s.frameCount * 0.02) * waveAmp;
          if (x === 0) ctx.moveTo(x, cy + val); else ctx.lineTo(x, cy + val);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * s.clarity * entrance);
        ctx.lineWidth = px(0.0015, minDim); ctx.stroke();
        // Waveform glow
        if (s.clarity > 0.5) {
          const gR = px(0.02 * s.clarity, minDim);
          for (let x = 0; x < w; x += px(0.04, minDim)) {
            const val = Math.sin(x * 0.015 + s.frameCount * 0.02) * waveAmp;
            const gg = ctx.createRadialGradient(x, cy + val, 0, x, cy + val, gR);
            gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.min * 0.2 * s.clarity * entrance));
            gg.addColorStop(1, rgba(s.primaryRgb, 0));
            ctx.fillStyle = gg; ctx.fillRect(x - gR, cy + val - gR, gR * 2, gR * 2);
          }
        }
      }

      // Dial (bottom center)
      const dialX = cx; const dialY = h * 0.85; const dialR = px(0.025, minDim);
      ctx.beginPath(); ctx.arc(dialX, dialY, dialR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      // Dial indicator
      const indX = dialX + Math.cos(s.dialAngle) * dialR * 0.7;
      const indY = dialY + Math.sin(s.dialAngle) * dialR * 0.7;
      ctx.beginPath(); ctx.arc(indX, indY, px(0.004, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height * 0.85;
      st.current.dragging = true; st.current.lastAngle = Math.atan2(my, mx);
    };
    const onMove = (e: PointerEvent) => {
      if (!st.current.dragging) return;
      const s = st.current; const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width / 2;
      const my = e.clientY - rect.top - rect.height * 0.85;
      const angle = Math.atan2(my, mx);
      let delta = angle - s.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.dialAngle += delta;
      if (delta > 0) s.clarity = Math.min(1, s.clarity + Math.abs(delta) * 0.15);
      s.lastAngle = angle;
    };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
