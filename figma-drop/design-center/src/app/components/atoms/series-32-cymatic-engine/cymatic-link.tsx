/**
 * ATOM 320: THE CYMATIC LINK ENGINE
 * Series 32 — Cymatic Engine · Position 10 (Capstone)
 *
 * Two nodes in separate corners vibrating at clashing speeds.
 * Draw a line between them — acoustic string equalizes frequencies.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function CymaticLinkAtom({
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
    nodeA: { x: 0.2, y: 0.25, freq: 0.08 }, nodeB: { x: 0.8, y: 0.75, freq: 0.03 },
    drawing: false, drawStart: null as { x: number; y: number } | null,
    linked: false, linkAnim: 0, syncProgress: 0, completed: false,
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
      if (p.phase === 'resolve') s.linked = true;

      if (s.linked) {
        s.linkAnim = Math.min(1, s.linkAnim + 0.012 * ms);
        s.syncProgress = Math.min(1, s.syncProgress + 0.008 * ms);
        // Equalize frequencies
        const target = (s.nodeA.freq + s.nodeB.freq) / 2;
        s.nodeA.freq += (target - s.nodeA.freq) * 0.02 * ms;
        s.nodeB.freq += (target - s.nodeB.freq) * 0.02 * ms;
        if (s.syncProgress >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.linked ? 0.5 + s.syncProgress * 0.5 : 0);

      const nR = px(0.02, minDim);

      // Node vibration rings
      for (const node of [s.nodeA, s.nodeB]) {
        const nx = node.x * w; const ny = node.y * h;
        // Vibration circles
        const rings = 3;
        for (let i = 0; i < rings; i++) {
          const phase2 = (s.frameCount * node.freq + i * 0.8) % (Math.PI * 2);
          const rR = nR + px(0.005 + Math.sin(phase2) * 0.015, minDim);
          ctx.beginPath(); ctx.arc(nx, ny, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
          ctx.lineWidth = px(0.0005, minDim); ctx.stroke();
        }
        // Core
        ctx.beginPath(); ctx.arc(nx, ny, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.linked && s.syncProgress > 0.5 ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * 0.5 * entrance); ctx.fill();
      }

      // Link line (acoustic string)
      if (s.linked) {
        const aX = s.nodeA.x * w; const aY = s.nodeA.y * h;
        const bX = s.nodeB.x * w; const bY = s.nodeB.y * h;
        ctx.beginPath(); ctx.moveTo(aX, aY);
        // Vibrating string
        const segments = 30;
        for (let i = 1; i < segments; i++) {
          const t = i / segments;
          const lx = aX + (bX - aX) * t;
          const ly = aY + (bY - aY) * t;
          const perpX = -(bY - aY) / Math.sqrt((bX - aX) ** 2 + (bY - aY) ** 2);
          const perpY = (bX - aX) / Math.sqrt((bX - aX) ** 2 + (bY - aY) ** 2);
          const wave = Math.sin(t * Math.PI * 4 + s.frameCount * 0.06) * px(0.005 * (1 - s.syncProgress * 0.8), minDim);
          ctx.lineTo(lx + perpX * wave, ly + perpY * wave);
        }
        ctx.lineTo(bX, bY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * s.linkAnim * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      // Sync glow
      if (s.syncProgress > 0.5) {
        const midX = (s.nodeA.x + s.nodeB.x) / 2 * w;
        const midY = (s.nodeA.y + s.nodeB.y) / 2 * h;
        const gR = px(0.06 * s.syncProgress, minDim);
        const gg = ctx.createRadialGradient(midX, midY, 0, midX, midY, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.syncProgress * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(midX - gR, midY - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (st.current.linked) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const dA = Math.sqrt((mx - st.current.nodeA.x) ** 2 + (my - st.current.nodeA.y) ** 2);
      if (dA < 0.1) { st.current.drawing = true; st.current.drawStart = { x: mx, y: my }; cbRef.current.onHaptic('drag_snap'); }
    };
    const onUp = (e: PointerEvent) => {
      if (!st.current.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const dB = Math.sqrt((mx - st.current.nodeB.x) ** 2 + (my - st.current.nodeB.y) ** 2);
      if (dB < 0.15) { st.current.linked = true; cbRef.current.onHaptic('drag_snap'); }
      st.current.drawing = false;
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', () => { st.current.drawing = false; });
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
