/**
 * ATOM 328: THE ALIGNMENT GRID ENGINE
 * Series 33 — Catalyst Web · Position 8
 *
 * Chaotic nodes vibrating. Press and hold summons rigid grid.
 * Grid magnetically snaps all nodes to intersections.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const NODE_COUNT = 16;
const GRID_SIZE = 4;

export default function AlignmentGridAtom({
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
      x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.7,
      targetX: 0.25 + (i % GRID_SIZE) * 0.17,
      targetY: 0.25 + Math.floor(i / GRID_SIZE) * 0.17,
    })),
    holding: false, gridProgress: 0,
    aligned: false, alignAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.gridProgress = 1;

      if (s.holding) s.gridProgress = Math.min(1, s.gridProgress + 0.006 * ms);
      else if (!s.aligned) s.gridProgress = Math.max(0, s.gridProgress - 0.003);

      if (s.gridProgress >= 0.98 && !s.aligned) { s.aligned = true; cb.onHaptic('completion'); }
      if (s.aligned) s.alignAnim = Math.min(1, s.alignAnim + 0.012 * ms);
      cb.onStateChange?.(s.aligned ? 0.5 + s.alignAnim * 0.5 : s.gridProgress * 0.5);

      // Draw grid (fading in)
      if (s.gridProgress > 0.05) {
        for (let i = 0; i <= GRID_SIZE; i++) {
          const gx = (0.25 + i * 0.17) * w - 0.17 * 0.5 * w;
          const gy = (0.25 + i * 0.17) * h - 0.17 * 0.5 * h;
          // Vertical
          ctx.beginPath(); ctx.moveTo((0.25 + i * 0.17) * w, 0.17 * h); ctx.lineTo((0.25 + i * 0.17) * w, 0.83 * h);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * s.gridProgress * entrance);
          ctx.lineWidth = px(0.0004, minDim); ctx.stroke();
          // Horizontal
          ctx.beginPath(); ctx.moveTo(0.17 * w, (0.25 + i * 0.17) * h); ctx.lineTo(0.83 * w, (0.25 + i * 0.17) * h);
          ctx.stroke();
        }
      }

      // Nodes
      for (const n of s.nodes) {
        // Pull toward grid
        n.x += (n.targetX - n.x) * s.gridProgress * 0.03 * ms;
        n.y += (n.targetY - n.y) * s.gridProgress * 0.03 * ms;
        // Vibration when not aligned
        const vib = (1 - s.gridProgress) * px(0.003, minDim);
        const jx = Math.sin(s.frameCount * 0.3 + n.x * 20) * vib;
        const jy = Math.cos(s.frameCount * 0.25 + n.y * 20) * vib;

        ctx.beginPath(); ctx.arc(n.x * w + jx, n.y * h + jy, px(0.005, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.aligned ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (0.3 + s.gridProgress * 0.3) * entrance);
        ctx.fill();
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
