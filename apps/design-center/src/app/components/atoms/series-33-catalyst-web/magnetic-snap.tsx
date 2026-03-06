/**
 * ATOM 325: THE MAGNETIC SNAP ENGINE
 * Series 33 — Catalyst Web · Position 5
 *
 * Two drifting nodes. Drag one close — proximity triggers
 * violent magnetic fusion into single massive block.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function MagneticSnapAtom({
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
    nodeA: { x: 0.3, y: 0.5 }, nodeB: { x: 0.7, y: 0.5 },
    dragging: null as 'A' | 'B' | null,
    fused: false, fuseAnim: 0, completed: false,
    driftAngle: 0,
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
      if (p.phase === 'resolve') { s.nodeA.x = 0.5; s.nodeB.x = 0.5; }

      // Drift when not dragging
      if (!s.dragging && !s.fused) {
        s.driftAngle += 0.005;
        s.nodeA.x += Math.sin(s.driftAngle) * 0.0003;
        s.nodeB.x += Math.cos(s.driftAngle * 1.3) * 0.0003;
      }

      const dist = Math.sqrt((s.nodeA.x - s.nodeB.x) ** 2 + (s.nodeA.y - s.nodeB.y) ** 2);
      if (dist < 0.06 && !s.fused) { s.fused = true; cb.onHaptic('drag_snap'); }
      if (s.fused) {
        s.fuseAnim = Math.min(1, s.fuseAnim + 0.015 * ms);
        s.nodeA.x += (0.5 - s.nodeA.x) * 0.05; s.nodeA.y += (0.5 - s.nodeA.y) * 0.05;
        s.nodeB.x += (0.5 - s.nodeB.x) * 0.05; s.nodeB.y += (0.5 - s.nodeB.y) * 0.05;
        if (s.fuseAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.fused ? s.fuseAnim : 0);

      const nR = px(0.018, minDim);

      if (!s.fused || s.fuseAnim < 0.5) {
        const fadeOut = s.fused ? 1 - s.fuseAnim * 2 : 1;
        for (const node of [s.nodeA, s.nodeB]) {
          ctx.beginPath(); ctx.arc(node.x * w, node.y * h, nR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * fadeOut * entrance); ctx.fill();
        }
      }

      // Fused block
      if (s.fused) {
        const bR = px(0.025 + s.fuseAnim * 0.02, minDim);
        const bx = cx; const by = cy;
        const gR = bR * 4;
        const gg = ctx.createRadialGradient(bx, by, 0, bx, by, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.fuseAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(bx - gR, by - gR, gR * 2, gR * 2);
        ctx.beginPath(); ctx.arc(bx, by, bR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * s.fuseAnim * entrance); ctx.fill();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = st.current; if (s.fused) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      if (Math.sqrt((mx - s.nodeA.x) ** 2 + (my - s.nodeA.y) ** 2) < 0.08) s.dragging = 'A';
      else if (Math.sqrt((mx - s.nodeB.x) ** 2 + (my - s.nodeB.y) ** 2) < 0.08) s.dragging = 'B';
      if (s.dragging) cbRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = st.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const node = s.dragging === 'A' ? s.nodeA : s.nodeB;
      node.x = (e.clientX - rect.left) / rect.width; node.y = (e.clientY - rect.top) / rect.height;
    };
    const onUp = () => { st.current.dragging = null; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
