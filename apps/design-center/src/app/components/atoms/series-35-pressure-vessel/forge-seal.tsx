/**
 * ATOM 350: THE FORGE SEAL ENGINE
 * Series 35 — Pressure Vessel · Position 10 (Capstone)
 *
 * Raw glowing metal. Rhythmic hammer strikes shape it
 * into perfect sealed ring. Final strike locks permanently.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const STRIKES = 8;

export default function ForgeSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    strikes: 0, sealed: false, sealAnim: 0, completed: false, flashAnim: 0,
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
      if (p.phase === 'resolve') s.strikes = STRIKES;

      const ratio = Math.min(1, s.strikes / STRIKES);
      if (ratio >= 1 && !s.sealed) { s.sealed = true; s.flashAnim = 1; cb.onHaptic('completion'); }
      if (s.sealed) { s.sealAnim = Math.min(1, s.sealAnim + 0.012 * ms); s.flashAnim = Math.max(0, s.flashAnim - 0.02); }
      cb.onStateChange?.(s.sealed ? 0.5 + s.sealAnim * 0.5 : ratio * 0.5);

      // Ring shape forming
      const ringR = px(0.06, minDim);
      const thickness = px(0.005 + ratio * 0.01, minDim);
      const circularity = ratio; // 0 = blobby, 1 = perfect circle
      const segments = 30;

      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const wobble = (1 - circularity) * Math.sin(a * 3 + s.frameCount * 0.02) * px(0.01, minDim);
        const r = ringR + wobble;
        const x = cx + Math.cos(a) * r; const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.3 + ratio * 0.3) * entrance);
      ctx.lineWidth = thickness; ctx.stroke();

      // Inner glow
      if (ratio > 0.3) {
        const gR = ringR * 1.5;
        const gg = ctx.createRadialGradient(cx, cy, ringR * 0.5, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * ratio * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // Flash
      if (s.flashAnim > 0) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * s.flashAnim * 0.2 * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { if (!st.current.sealed) { st.current.strikes++; cbRef.current.onHaptic('tap'); } };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
