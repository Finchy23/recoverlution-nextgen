/**
 * ATOM 323: THE GRAVITY INVERSION ENGINE
 * Series 33 — Catalyst Web · Position 3
 *
 * Nodes piled at bottom crushed by gravity. Swipe up inverts gravity.
 * Nodes float up and reorganize into new airy sequence.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const NODE_COUNT = 20;

export default function GravityInversionAtom({
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
    nodes: Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: 0.15 + (i % 5) * 0.17 + Math.random() * 0.05,
      y: 0.78 + Math.floor(i / 5) * 0.04 + Math.random() * 0.02,
      vy: 0, targetY: 0,
    })),
    gravity: 1, inverted: false, invertAnim: 0, completed: false,
    swipeStartY: 0, swiping: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    // Assign airy target positions
    const s = st.current;
    for (let i = 0; i < NODE_COUNT; i++) {
      s.nodes[i].targetY = 0.1 + (i / NODE_COUNT) * 0.6;
    }

    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.inverted = true;

      if (s.inverted) {
        s.invertAnim = Math.min(1, s.invertAnim + 0.01 * ms);
        if (s.invertAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.inverted ? s.invertAnim : 0);

      const nR = px(0.006, minDim);

      for (const n of s.nodes) {
        if (s.inverted) {
          n.y += (n.targetY - n.y) * 0.02 * ms;
        } else {
          n.vy += 0.0002 * ms;
          n.y = Math.min(0.92, n.y + n.vy);
          if (n.y >= 0.92) n.vy = 0;
        }
        ctx.beginPath(); ctx.arc(n.x * w, n.y * h, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.inverted ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (s.inverted ? 0.4 + s.invertAnim * 0.2 : 0.3) * entrance);
        ctx.fill();
      }

      // Gravity arrow indicator
      const arrowY = s.inverted ? 0.15 : 0.85;
      const arrowDir = s.inverted ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(w * 0.05, h * arrowY);
      ctx.lineTo(w * 0.05, h * (arrowY - 0.04 * arrowDir));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.lineWidth = px(0.001, minDim); ctx.stroke();

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.swiping = true; st.current.swipeStartY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.swiping || st.current.inverted) return;
      if (st.current.swipeStartY - e.clientY > 80) {
        st.current.inverted = true; cbRef.current.onHaptic('swipe_commit'); st.current.swiping = false;
      }
    };
    const onUp = () => { st.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
