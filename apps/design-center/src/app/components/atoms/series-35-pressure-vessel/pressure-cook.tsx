/**
 * ATOM 344: THE PRESSURE COOK ENGINE
 * Series 35 — Pressure Vessel · Position 4
 *
 * Hold to apply sustained heat. Pressure builds.
 * Controlled burst reveals fully transformed material.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

export default function PressureCookAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, pressure: 0, cooked: false, cookAnim: 0, completed: false,
    steamParticles: [] as { x: number; y: number; vy: number; life: number }[],
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
      if (p.phase === 'resolve') s.pressure = 1;

      if (s.holding) s.pressure = Math.min(1, s.pressure + 0.003 * ms);
      if (s.pressure >= 0.98 && !s.cooked) { s.cooked = true; cb.onHaptic('completion'); for (let i = 0; i < 15; i++) s.steamParticles.push({ x: cx + (Math.random() - 0.5) * px(0.06, minDim), y: cy, vy: -(1 + Math.random() * 2), life: 1 }); }
      if (s.cooked) s.cookAnim = Math.min(1, s.cookAnim + 0.012 * ms);
      cb.onStateChange?.(s.cooked ? 0.5 + s.cookAnim * 0.5 : s.pressure * 0.5);

      // Vessel
      const vW = px(0.08, minDim); const vH = px(0.1, minDim);
      const vL = cx - vW; const vT = cy - vH / 2;
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(0.0015, minDim);
      ctx.beginPath(); ctx.rect(vL, vT, vW * 2, vH); ctx.stroke();
      // Lid
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (s.cooked ? 0.1 : 0.2) * entrance);
      ctx.fillRect(vL - px(0.005, minDim), vT - px(0.005, minDim), vW * 2 + px(0.01, minDim), px(0.005, minDim));

      // Internal glow (heat)
      const heatAlpha = s.pressure * 0.3;
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, vW);
      hg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * heatAlpha * entrance));
      hg.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = hg; ctx.fillRect(vL, vT, vW * 2, vH);

      // Pressure gauge
      ctx.beginPath(); ctx.arc(cx + vW + px(0.02, minDim), cy, px(0.012, minDim), Math.PI * 0.8, Math.PI * 0.8 + Math.PI * 1.4 * s.pressure);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(0.001, minDim); ctx.stroke();

      // Steam
      for (let i = s.steamParticles.length - 1; i >= 0; i--) {
        const sp = s.steamParticles[i];
        sp.y += sp.vy * ms; sp.life -= 0.008;
        if (sp.life <= 0) { s.steamParticles.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(sp.x, sp.y, px(0.003, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * sp.life * 0.2 * entrance); ctx.fill();
      }

      // Transformed result
      if (s.cooked) {
        const tR = px(0.025 * s.cookAnim, minDim);
        ctx.beginPath(); ctx.arc(cx, cy, tR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * s.cookAnim * entrance); ctx.fill();
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
