/**
 * ATOM 361: THE LIGHTNING ROD ENGINE
 * Series 37 — Conduit Flow · Position 1
 *
 * Chaotic electrical arcs discharging randomly across viewport.
 * Place anchor point. All chaos redirects and grounds through it.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const ARC_COUNT = 8;
const ROD_R = 0.02;

export default function LightningRodAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    arcs: Array.from({ length: ARC_COUNT }, () => ({
      sx: Math.random(), sy: Math.random() * 0.3,
      ex: Math.random(), ey: 0.5 + Math.random() * 0.5,
    })),
    anchorPlaced: false, anchorX: 0.5, anchorY: 0.5,
    groundedAnim: 0, completed: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve' && !s.anchorPlaced) { s.anchorPlaced = true; s.anchorX = 0.5; s.anchorY = 0.5; }

      if (s.anchorPlaced) {
        s.groundedAnim = Math.min(1, s.groundedAnim + 0.01 * ms);
        if (s.groundedAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.anchorPlaced ? s.groundedAnim : 0);

      // Draw arcs — chaotic when no anchor, grounded when anchor placed
      for (const arc of s.arcs) {
        if (s.frameCount % 3 === 0) {
          if (!s.anchorPlaced) { arc.ex = Math.random(); arc.ey = 0.5 + Math.random() * 0.5; }
        }
        const targetX = s.anchorPlaced ? s.anchorX : arc.ex;
        const targetY = s.anchorPlaced ? s.anchorY : arc.ey;
        arc.ex += (targetX - arc.ex) * 0.05 * s.groundedAnim;
        arc.ey += (targetY - arc.ey) * 0.05 * s.groundedAnim;

        ctx.beginPath();
        let px2 = arc.sx * w; let py = arc.sy * h;
        ctx.moveTo(px2, py);
        const segs = 8;
        for (let i = 1; i <= segs; i++) {
          const t = i / segs;
          const jitter = s.anchorPlaced ? (1 - s.groundedAnim) * 0.03 : 0.04;
          px2 = (arc.sx + (arc.ex - arc.sx) * t + (Math.random() - 0.5) * jitter) * w;
          py = (arc.sy + (arc.ey - arc.sy) * t + (Math.random() - 0.5) * jitter) * h;
          ctx.lineTo(px2, py);
        }
        ctx.strokeStyle = rgba(s.anchorPlaced ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (s.anchorPlaced ? 0.3 + s.groundedAnim * 0.2 : 0.15) * entrance);
        ctx.lineWidth = px(s.anchorPlaced ? 0.002 : 0.001, minDim); ctx.stroke();
      }

      // Anchor point
      if (s.anchorPlaced) {
        const aR = minDim * ROD_R;
        const ag = ctx.createRadialGradient(s.anchorX * w, s.anchorY * h, 0, s.anchorX * w, s.anchorY * h, aR * 5);
        ag.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * s.groundedAnim * entrance));
        ag.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ag; ctx.fillRect(s.anchorX * w - aR * 5, s.anchorY * h - aR * 5, aR * 10, aR * 10);
        ctx.beginPath(); ctx.arc(s.anchorX * w, s.anchorY * h, aR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance); ctx.fill();
        // Ground line
        ctx.beginPath(); ctx.moveTo(s.anchorX * w, s.anchorY * h + aR); ctx.lineTo(s.anchorX * w, h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * s.groundedAnim * entrance);
        ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.anchorPlaced) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.anchorX = (e.clientX - rect.left) / rect.width;
      stateRef.current.anchorY = (e.clientY - rect.top) / rect.height;
      stateRef.current.anchorPlaced = true;
      callbacksRef.current.onHaptic('tap');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
