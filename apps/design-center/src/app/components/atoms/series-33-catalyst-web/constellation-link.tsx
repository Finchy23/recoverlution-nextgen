/**
 * ATOM 322: THE CONSTELLATION LINK ENGINE
 * Series 33 — Catalyst Web · Position 2
 *
 * 5 nodes in dark void. Drag glowing line node-to-node.
 * Final connection illuminates entire constellation.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const NODES = [
  { x: 0.5, y: 0.2 }, { x: 0.75, y: 0.4 }, { x: 0.65, y: 0.7 },
  { x: 0.35, y: 0.7 }, { x: 0.25, y: 0.4 },
];

export default function ConstellationLinkAtom({
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
    linked: [false, false, false, false, false] as boolean[],
    currentFrom: -1, drawing: false,
    allLinked: false, linkAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.linked.fill(true);

      const linkedCount = s.linked.filter(Boolean).length;
      if (linkedCount >= 5 && !s.allLinked) { s.allLinked = true; cb.onHaptic('completion'); }
      if (s.allLinked) s.linkAnim = Math.min(1, s.linkAnim + 0.012 * ms);
      cb.onStateChange?.(s.allLinked ? 0.5 + s.linkAnim * 0.5 : linkedCount / 5 * 0.5);

      const nR = px(0.01, minDim);

      // Links
      for (let i = 0; i < 5; i++) {
        if (!s.linked[i]) continue;
        const next = (i + 1) % 5;
        ctx.beginPath();
        ctx.moveTo(NODES[i].x * w, NODES[i].y * h);
        ctx.lineTo(NODES[next].x * w, NODES[next].y * h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.2 + s.linkAnim * 0.3) * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      // Nodes
      for (let i = 0; i < 5; i++) {
        const lit = s.linked[i] || (i > 0 && s.linked[i - 1]);
        if (lit && s.allLinked) {
          const gR = nR * 4;
          const gg = ctx.createRadialGradient(NODES[i].x * w, NODES[i].y * h, 0, NODES[i].x * w, NODES[i].y * h, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.linkAnim * entrance));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg; ctx.fillRect(NODES[i].x * w - gR, NODES[i].y * h - gR, gR * 2, gR * 2);
        }
        ctx.beginPath(); ctx.arc(NODES[i].x * w, NODES[i].y * h, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lit ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (lit ? 0.6 : 0.3) * entrance);
        ctx.fill();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const findNode = (mx: number, my: number) => {
      for (let i = 0; i < 5; i++) {
        if (Math.sqrt((mx - NODES[i].x) ** 2 + (my - NODES[i].y) ** 2) < 0.08) return i;
      }
      return -1;
    };
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const idx = findNode(mx, my);
      if (idx >= 0) { st.current.currentFrom = idx; st.current.drawing = true; cbRef.current.onHaptic('drag_snap'); }
    };
    const onUp = (e: PointerEvent) => {
      const s = st.current; if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const idx = findNode(mx, my);
      if (idx >= 0 && idx !== s.currentFrom) {
        const link = Math.min(s.currentFrom, idx);
        if (!s.linked[link]) { s.linked[link] = true; cbRef.current.onHaptic('step_advance'); }
      }
      s.drawing = false; s.currentFrom = -1;
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', () => { st.current.drawing = false; });
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
