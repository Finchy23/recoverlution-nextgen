/**
 * ATOM 330: THE ORBIT STABILIZER ENGINE
 * Series 33 — Catalyst Web · Position 10 (Capstone)
 *
 * Erratic orbiting node. Rhythmic tapping at 12 o'clock
 * locks the orbit into permanent smooth circle.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const PERFECT_TAPS = 4;

export default function OrbitStabilizerAtom({
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
    angle: 0, speed: 0.025, wobble: 0.15,
    perfectTaps: 0, locked: false, lockAnim: 0, completed: false,
    trail: [] as { x: number; y: number; age: number }[],
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
      if (p.phase === 'resolve') s.perfectTaps = PERFECT_TAPS;

      s.angle += s.speed * ms;
      if (s.perfectTaps >= PERFECT_TAPS && !s.locked) { s.locked = true; s.wobble = 0; cb.onHaptic('completion'); }
      if (s.locked) s.lockAnim = Math.min(1, s.lockAnim + 0.012 * ms);
      cb.onStateChange?.(s.locked ? 0.5 + s.lockAnim * 0.5 : s.perfectTaps / PERFECT_TAPS * 0.5);

      const orbitR = px(0.1, minDim);
      const wobbleOff = s.wobble * Math.sin(s.frameCount * 0.07) * px(0.03, minDim);
      const nodeX = cx + Math.cos(s.angle) * (orbitR + wobbleOff);
      const nodeY = cy + Math.sin(s.angle) * (orbitR + wobbleOff);
      const nR = px(0.01, minDim);

      // Trail
      s.trail.push({ x: nodeX, y: nodeY, age: 0 });
      if (s.trail.length > 50) s.trail.shift();
      for (const t of s.trail) {
        t.age += 0.015;
        if (t.age >= 1) continue;
        ctx.beginPath(); ctx.arc(t.x, t.y, nR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.locked ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (1 - t.age) * 0.15 * entrance);
        ctx.fill();
      }

      // Orbit guide
      ctx.beginPath(); ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (s.locked ? 0.2 * s.lockAnim : 0.06) * entrance);
      ctx.lineWidth = px(s.locked ? 0.0015 : 0.0005, minDim); ctx.stroke();

      // 12 o'clock marker
      const markerY = cy - orbitR;
      ctx.beginPath(); ctx.arc(cx, markerY, px(0.003, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance); ctx.fill();

      // Node
      if (s.locked) {
        const gR = nR * 3;
        const gg = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.lockAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(nodeX - gR, nodeY - gR, gR * 2, gR * 2);
      }
      ctx.beginPath(); ctx.arc(nodeX, nodeY, nR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.locked ? s.primaryRgb : s.accentRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();

      // Center
      ctx.beginPath(); ctx.arc(cx, cy, px(0.004, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance); ctx.fill();

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = st.current; if (s.locked) return;
      // Check if near 12 o'clock (angle near -PI/2 or 3PI/2)
      const normAngle = ((s.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const nearTwelve = Math.abs(normAngle - Math.PI * 1.5) < 0.3 || Math.abs(normAngle - Math.PI * 3.5) < 0.3;
      if (nearTwelve) { s.perfectTaps++; s.wobble = Math.max(0, s.wobble - 0.04); cbRef.current.onHaptic('tap'); }
      else { s.wobble = Math.min(0.2, s.wobble + 0.02); cbRef.current.onHaptic('error_boundary'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
