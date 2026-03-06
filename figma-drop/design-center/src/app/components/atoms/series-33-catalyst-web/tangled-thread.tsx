/**
 * ATOM 324: THE TANGLED THREAD ENGINE
 * Series 33 — Catalyst Web · Position 4
 *
 * Two knotted lines. Drag overlapping loops outward to untangle
 * into separate parallel clarity.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const KNOT_POINTS = 8;

export default function TangledThreadAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const mkPoints = (yBase: number) => Array.from({ length: KNOT_POINTS }, (_, i) => ({
    x: 0.15 + (i / (KNOT_POINTS - 1)) * 0.7,
    y: yBase + Math.sin(i * 1.5) * 0.08 * (1 - i / KNOT_POINTS),
    targetY: yBase,
  }));

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    lineA: mkPoints(0.45), lineB: mkPoints(0.55),
    dragging: null as { line: 'A' | 'B'; idx: number } | null,
    untangled: false, untangleAnim: 0, completed: false,
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
      if (p.phase === 'resolve') { s.lineA.forEach(p2 => p2.y = 0.42); s.lineB.forEach(p2 => p2.y = 0.58); }

      // Check untangle: all A above all B
      let separated = true;
      for (const a of s.lineA) for (const b of s.lineB) { if (Math.abs(a.y - b.y) < 0.08) separated = false; }
      if (separated && !s.untangled && s.frameCount > 30) { s.untangled = true; cb.onHaptic('completion'); }
      if (s.untangled) s.untangleAnim = Math.min(1, s.untangleAnim + 0.012 * ms);
      cb.onStateChange?.(s.untangled ? 0.5 + s.untangleAnim * 0.5 : separated ? 0.4 : 0.1);

      // Settle toward straight lines when untangled
      if (s.untangled) {
        for (const p2 of s.lineA) p2.y += (0.4 - p2.y) * 0.02 * ms;
        for (const p2 of s.lineB) p2.y += (0.6 - p2.y) * 0.02 * ms;
      }

      // Draw lines
      for (const [line, rgb] of [[s.lineA, s.accentRgb], [s.lineB, s.primaryRgb]] as const) {
        ctx.beginPath();
        for (let i = 0; i < line.length; i++) {
          if (i === 0) ctx.moveTo(line[i].x * w, line[i].y * h);
          else ctx.lineTo(line[i].x * w, line[i].y * h);
        }
        ctx.strokeStyle = rgba(rgb as RGB, ALPHA.content.max * (s.untangled ? 0.5 : 0.35) * entrance);
        ctx.lineWidth = px(0.002, minDim); ctx.stroke();
        // Control points
        for (const pt of line) {
          ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, px(0.004, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(rgb as RGB, ALPHA.content.max * 0.3 * entrance); ctx.fill();
        }
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = st.current; if (s.untangled) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      for (const [line, name] of [[s.lineA, 'A'], [s.lineB, 'B']] as const) {
        for (let i = 0; i < line.length; i++) {
          if (Math.sqrt((mx - line[i].x) ** 2 + (my - line[i].y) ** 2) < 0.05) {
            s.dragging = { line: name as 'A' | 'B', idx: i }; cbRef.current.onHaptic('drag_snap'); return;
          }
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = st.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      const line = s.dragging.line === 'A' ? s.lineA : s.lineB;
      line[s.dragging.idx].y = Math.max(0.1, Math.min(0.9, my));
    };
    const onUp = () => { st.current.dragging = null; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
