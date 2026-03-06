/**
 * ATOM 315: THE HARMONIC STACK ENGINE
 * Series 32 — Cymatic Engine · Position 5
 *
 * Three floating rings vibrating at different speeds.
 * Hold one to stabilize, tap next to lock in harmony.
 * Third lock forms stable glowing gyroscopic sphere.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function HarmonicStackAtom({
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
    rings: [
      { angle: 0, speed: 0.02, tilt: 0, locked: false, radius: 0.06 },
      { angle: Math.PI * 0.6, speed: 0.035, tilt: Math.PI / 3, locked: false, radius: 0.08 },
      { angle: Math.PI * 1.2, speed: 0.015, tilt: Math.PI * 2 / 3, locked: false, radius: 0.1 },
    ],
    holding: false, holdTarget: -1,
    allLocked: false, lockAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.rings.forEach(r => r.locked = true);

      const lockedCount = s.rings.filter(r => r.locked).length;
      if (lockedCount === 3 && !s.allLocked) { s.allLocked = true; cb.onHaptic('completion'); }
      if (s.allLocked) s.lockAnim = Math.min(1, s.lockAnim + 0.012 * ms);
      cb.onStateChange?.(s.allLocked ? 0.5 + s.lockAnim * 0.5 : lockedCount / 3 * 0.5);

      // Draw rings
      for (let i = 0; i < 3; i++) {
        const ring = s.rings[i];
        if (!ring.locked) ring.angle += ring.speed * ms;
        const rPx = px(ring.radius, minDim);
        const wobble = ring.locked ? 0 : Math.sin(s.frameCount * 0.03 + i) * px(0.003, minDim);
        ctx.save(); ctx.translate(cx + wobble, cy);
        ctx.beginPath();
        // Elliptical ring to simulate 3D tilt
        const segments = 60;
        for (let j = 0; j <= segments; j++) {
          const a = (j / segments) * Math.PI * 2;
          const rx = rPx; const ry = rPx * Math.abs(Math.cos(ring.tilt + ring.angle * 0.3));
          const px2 = Math.cos(a) * rx; const py2 = Math.sin(a) * ry;
          if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
        }
        ctx.strokeStyle = rgba(ring.locked ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (ring.locked ? 0.5 : 0.3) * entrance);
        ctx.lineWidth = px(ring.locked ? 0.002 : 0.001, minDim); ctx.stroke();
        ctx.restore();
      }

      // Gyroscopic glow when all locked
      if (s.allLocked) {
        const gR = px(0.12 * s.lockAnim, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.lockAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = st.current;
      // Lock the next unlocked ring
      for (let i = 0; i < 3; i++) {
        if (!s.rings[i].locked) { s.rings[i].locked = true; cbRef.current.onHaptic('tap'); break; }
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
