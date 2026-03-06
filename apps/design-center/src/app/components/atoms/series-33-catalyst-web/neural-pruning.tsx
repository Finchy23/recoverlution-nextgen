/**
 * ATOM 326: THE NEURAL PRUNING ENGINE
 * Series 33 — Catalyst Web · Position 6
 *
 * Over-connected web of lines. Swipe to sever excess.
 * Core lines absorb energy, glowing brighter. Subtraction adds power.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function NeuralPruningAtom({
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
    nodes: Array.from({ length: 12 }, () => ({ x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.7 })),
    lines: [] as { a: number; b: number; core: boolean; alive: boolean }[],
    pruned: 0, totalExcess: 0, completed: false,
    swiping: false, lastX: 0, lastY: 0,
  });

  useEffect(() => {
    // Generate connections
    const s = st.current;
    s.lines = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
      const dist = Math.sqrt((s.nodes[i].x - s.nodes[j].x) ** 2 + (s.nodes[i].y - s.nodes[j].y) ** 2);
      if (dist < 0.35) s.lines.push({ a: i, b: j, core: dist < 0.15, alive: true });
    }
    s.totalExcess = s.lines.filter(l => !l.core).length;
  }, []);
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
      if (p.phase === 'resolve') s.lines.forEach(l => { if (!l.core) l.alive = false; });

      const aliveExcess = s.lines.filter(l => !l.core && l.alive).length;
      const pruneRatio = s.totalExcess > 0 ? 1 - aliveExcess / s.totalExcess : 1;
      if (pruneRatio >= 0.9 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      cb.onStateChange?.(pruneRatio);

      const coreGlow = 0.3 + pruneRatio * 0.5;

      // Draw lines
      for (const line of s.lines) {
        if (!line.alive) continue;
        const a = s.nodes[line.a]; const b = s.nodes[line.b];
        ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h);
        ctx.strokeStyle = rgba(line.core ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (line.core ? coreGlow : 0.12) * entrance);
        ctx.lineWidth = px(line.core ? 0.0015 : 0.0006, minDim); ctx.stroke();
      }

      // Nodes
      for (const n of s.nodes) {
        ctx.beginPath(); ctx.arc(n.x * w, n.y * h, px(0.004, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.2 + pruneRatio * 0.3) * entrance); ctx.fill();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      st.current.swiping = true;
      const rect = canvas.getBoundingClientRect();
      st.current.lastX = (e.clientX - rect.left) / rect.width;
      st.current.lastY = (e.clientY - rect.top) / rect.height;
    };
    const onMove = (e: PointerEvent) => {
      const s = st.current; if (!s.swiping) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      // Check line intersections
      for (const line of s.lines) {
        if (!line.alive || line.core) continue;
        const a = s.nodes[line.a]; const b = s.nodes[line.b];
        // Simple proximity check to swipe line
        const midX = (a.x + b.x) / 2; const midY = (a.y + b.y) / 2;
        if (Math.sqrt((mx - midX) ** 2 + (my - midY) ** 2) < 0.05) {
          line.alive = false; cbRef.current.onHaptic('swipe_commit');
        }
      }
      s.lastX = mx; s.lastY = my;
    };
    const onUp = () => { st.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
