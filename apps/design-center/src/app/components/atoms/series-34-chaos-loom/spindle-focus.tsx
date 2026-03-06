/**
 * ATOM 332: THE SPINDLE ENGINE
 * Series 34 — Chaos Loom · Position 2
 *
 * Circular motion spools scattered noise into dense glowing ball.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

const PARTICLE_COUNT = 60;

export default function SpindleFocusAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003 })),
    spoolProgress: 0, dragging: false, lastAngle: 0, totalRotation: 0,
    spooled: false, spoolAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.spoolProgress = 1;

      if (s.spoolProgress >= 0.95 && !s.spooled) { s.spooled = true; cb.onHaptic('completion'); }
      if (s.spooled) s.spoolAnim = Math.min(1, s.spoolAnim + 0.012 * ms);
      cb.onStateChange?.(s.spooled ? 0.5 + s.spoolAnim * 0.5 : s.spoolProgress * 0.5);

      const pull = s.spoolProgress * 0.03;
      for (const pt of s.particles) {
        pt.x += (0.5 - pt.x) * pull * ms + pt.vx * (1 - s.spoolProgress) * ms;
        pt.y += (0.5 - pt.y) * pull * ms + pt.vy * (1 - s.spoolProgress) * ms;
        pt.vx += (Math.random() - 0.5) * 0.0002 * (1 - s.spoolProgress); pt.vy += (Math.random() - 0.5) * 0.0002 * (1 - s.spoolProgress);
        pt.vx *= 0.98; pt.vy *= 0.98;
        ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, px(0.002, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.spooled ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (0.2 + s.spoolProgress * 0.3) * entrance); ctx.fill();
      }
      if (s.spoolProgress > 0.5) {
        const gR = px(0.03 + s.spoolProgress * 0.03, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.spoolProgress * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.dragging = true; const rect = canvas.getBoundingClientRect(); st.current.lastAngle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2); };
    const onMove = (e: PointerEvent) => {
      if (!st.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
      let delta = angle - st.current.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2; if (delta < -Math.PI) delta += Math.PI * 2;
      st.current.totalRotation += Math.abs(delta);
      st.current.spoolProgress = Math.min(1, st.current.totalRotation / (Math.PI * 8));
      st.current.lastAngle = angle;
    };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
