/**
 * ATOM 327: THE RIPPLE EFFECT ENGINE
 * Series 33 — Catalyst Web · Position 7
 *
 * Stagnant pool of nodes. Single center tap triggers
 * displacement ripple; dormant nodes awaken to perpetual flow.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const NODE_COUNT = 40;

export default function RippleEffectAtom({
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
    nodes: Array.from({ length: NODE_COUNT }, () => ({
      x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8,
      vx: 0, vy: 0, awake: false,
    })),
    tapped: false, rippleR: 0, rippleAnim: 0, completed: false,
    tapX: 0.5, tapY: 0.5,
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
      if (p.phase === 'resolve' && !s.tapped) s.tapped = true;

      if (s.tapped) {
        s.rippleR += 0.004 * ms;
        s.rippleAnim = Math.min(1, s.rippleAnim + 0.008 * ms);
        // Wake nodes hit by ripple
        for (const n of s.nodes) {
          const d = Math.sqrt((n.x - s.tapX) ** 2 + (n.y - s.tapY) ** 2);
          if (d < s.rippleR && !n.awake) {
            n.awake = true;
            const a = Math.atan2(n.y - s.tapY, n.x - s.tapX);
            n.vx = Math.cos(a) * 0.002; n.vy = Math.sin(a) * 0.002;
          }
        }
        if (s.rippleAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.tapped ? s.rippleAnim : 0);

      // Ripple rings
      if (s.tapped) {
        for (let i = 0; i < 3; i++) {
          const rR = (s.rippleR - i * 0.03) * minDim;
          if (rR <= 0) continue;
          ctx.beginPath(); ctx.arc(s.tapX * w, s.tapY * h, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * Math.max(0, 1 - s.rippleR * 1.5) * entrance);
          ctx.lineWidth = px(0.0008, minDim); ctx.stroke();
        }
      }

      // Nodes
      const nR = px(0.003, minDim);
      for (const n of s.nodes) {
        if (n.awake) {
          n.x += n.vx * ms; n.y += n.vy * ms;
          n.vx += (Math.random() - 0.5) * 0.0001; n.vy += (Math.random() - 0.5) * 0.0001;
          n.vx *= 0.998; n.vy *= 0.998;
          if (n.x < 0.05 || n.x > 0.95) n.vx *= -1;
          if (n.y < 0.05 || n.y > 0.95) n.vy *= -1;
        }
        ctx.beginPath(); ctx.arc(n.x * w, n.y * h, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(n.awake ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (n.awake ? 0.5 : 0.15) * entrance);
        ctx.fill();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (st.current.tapped) return;
      const rect = canvas.getBoundingClientRect();
      st.current.tapX = (e.clientX - rect.left) / rect.width;
      st.current.tapY = (e.clientY - rect.top) / rect.height;
      st.current.tapped = true; cbRef.current.onHaptic('tap');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
