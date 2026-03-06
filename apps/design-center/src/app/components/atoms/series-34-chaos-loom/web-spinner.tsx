/**
 * ATOM 338: THE WEB SPINNER ENGINE
 * Series 34 — Chaos Loom · Position 8
 *
 * Hold and drag outward in expanding spiral. Geometric web
 * generates behind finger proving expansion is anchored.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale, type RGB } from '../atom-utils';

export default function WebSpinnerAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    webPoints: [] as { x: number; y: number }[],
    maxRadius: 0, dragging: false,
    complete: false, completeAnim: 0, completed: false,
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

      if (s.maxRadius > 0.15 && !s.complete) { s.complete = true; cb.onHaptic('completion'); }
      if (s.complete) s.completeAnim = Math.min(1, s.completeAnim + 0.012 * ms);
      cb.onStateChange?.(s.complete ? 0.5 + s.completeAnim * 0.5 : Math.min(0.5, s.maxRadius / 0.15 * 0.5));

      // Center node
      ctx.beginPath(); ctx.arc(cx, cy, px(0.005, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.fill();

      // Radial spokes
      const spokes = 8;
      for (let i = 0; i < spokes; i++) {
        const a = (i / spokes) * Math.PI * 2;
        const r = s.maxRadius * minDim;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(0.0004, minDim); ctx.stroke();
      }

      // Concentric rings at recorded radii
      const ringStep = 0.02;
      for (let r = ringStep; r <= s.maxRadius; r += ringStep) {
        ctx.beginPath(); ctx.arc(cx, cy, r * minDim, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.complete ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (0.08 + (s.complete ? s.completeAnim * 0.1 : 0)) * entrance);
        ctx.lineWidth = px(0.0005, minDim); ctx.stroke();
      }

      // Web trail
      if (s.webPoints.length > 1) {
        ctx.beginPath(); ctx.moveTo(s.webPoints[0].x, s.webPoints[0].y);
        for (let i = 1; i < s.webPoints.length; i++) ctx.lineTo(s.webPoints[i].x, s.webPoints[i].y);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.0008, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.dragging = true; cbRef.current.onHaptic('drag_snap'); };
    const onMove = (e: PointerEvent) => {
      if (!st.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
      const fx = (e.clientX - rect.left) / rect.width - 0.5;
      const fy = (e.clientY - rect.top) / rect.height - 0.5;
      const r = Math.sqrt(fx * fx + fy * fy);
      st.current.maxRadius = Math.max(st.current.maxRadius, r);
      st.current.webPoints.push({ x: mx, y: my });
      if (st.current.webPoints.length > 200) st.current.webPoints.shift();
    };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
