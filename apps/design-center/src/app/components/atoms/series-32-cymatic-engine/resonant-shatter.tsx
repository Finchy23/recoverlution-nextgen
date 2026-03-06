/**
 * ATOM 313: THE RESONANT SHATTER ENGINE
 * Series 32 — Cymatic Engine · Position 3
 *
 * Hold thumb to increase pitch. Glass vibrates harder until
 * exact resonant frequency shatters it effortlessly into light.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function ResonantShatterAtom({
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
    holding: false, pitch: 0, shattered: false, shatterAnim: 0, completed: false,
    shards: [] as { x: number; y: number; vx: number; vy: number; life: number; size: number }[],
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
      if (p.phase === 'resolve') s.pitch = 1;

      if (s.holding && !s.shattered) s.pitch = Math.min(1, s.pitch + 0.004);
      if (!s.holding && !s.shattered) s.pitch = Math.max(0, s.pitch - 0.002);

      if (s.pitch >= 1 && !s.shattered) {
        s.shattered = true; cb.onHaptic('completion');
        for (let i = 0; i < 20; i++) {
          const a = Math.random() * Math.PI * 2;
          s.shards.push({ x: cx, y: cy, vx: Math.cos(a) * (1 + Math.random() * 3), vy: Math.sin(a) * (1 + Math.random() * 3), life: 0.5 + Math.random() * 0.5, size: px(0.003 + Math.random() * 0.005, minDim) });
        }
      }
      if (s.shattered) s.shatterAnim = Math.min(1, s.shatterAnim + 0.012 * ms);
      cb.onStateChange?.(s.shattered ? 0.5 + s.shatterAnim * 0.5 : s.pitch * 0.5);

      const blockR = px(0.07, minDim);
      const vibAmp = s.pitch * px(0.005, minDim);

      if (!s.shattered) {
        // Glass block with vibration
        const vx = Math.sin(s.frameCount * 0.5 * (1 + s.pitch * 3)) * vibAmp;
        ctx.save(); ctx.translate(cx + vx, cy);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const r = blockR;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (0.15 + s.pitch * 0.1) * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * (0.3 + s.pitch * 0.2) * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
        // Crack lines at high pitch
        if (s.pitch > 0.6) {
          const crackAlpha = (s.pitch - 0.6) * 2.5;
          for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + 0.3;
            ctx.beginPath(); ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * blockR * crackAlpha, Math.sin(a) * blockR * crackAlpha);
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * crackAlpha * entrance);
            ctx.lineWidth = px(0.0005, minDim); ctx.stroke();
          }
        }
        ctx.restore();
        // Pitch indicator
        ctx.beginPath(); ctx.arc(cx, cy, blockR + px(0.015, minDim), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.pitch);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(0.0015, minDim); ctx.stroke();
      } else {
        // Shards
        for (const sh of s.shards) {
          sh.x += sh.vx * ms; sh.y += sh.vy * ms; sh.life -= 0.006;
          if (sh.life <= 0) continue;
          ctx.beginPath(); ctx.arc(sh.x, sh.y, sh.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * sh.life * 0.3 * entrance); ctx.fill();
        }
        // Light core
        const lR = px(0.04 * s.shatterAnim, minDim);
        const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, lR * 3);
        lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * s.shatterAnim * entrance));
        lg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lg; ctx.fillRect(cx - lR * 3, cy - lR * 3, lR * 6, lR * 6);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); };
    const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
