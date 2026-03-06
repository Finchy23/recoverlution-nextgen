/**
 * ATOM 343: THE HYDRAULIC PRESS ENGINE
 * Series 35 — Pressure Vessel · Position 3
 *
 * Drag heavy plate downward. Shape deforms, shell cracks.
 * Unbreakable core revealed.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

export default function HydraulicPressAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    plateY: 0.2, dragging: false,
    crushed: false, crushAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.plateY = 0.55;

      const compression = Math.max(0, (s.plateY - 0.2) / 0.35);
      if (compression >= 0.95 && !s.crushed) { s.crushed = true; cb.onHaptic('completion'); }
      if (s.crushed) s.crushAnim = Math.min(1, s.crushAnim + 0.012 * ms);
      cb.onStateChange?.(s.crushed ? 0.5 + s.crushAnim * 0.5 : compression * 0.5);

      // Base platform
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.fillRect(w * 0.2, h * 0.7, w * 0.6, px(0.003, minDim));

      // Shape being compressed
      const shapeY = h * 0.7;
      const squash = compression * 0.6;
      const shapeH = px(0.08 * (1 - squash), minDim);
      const shapeW = px(0.06 * (1 + squash * 0.5), minDim);

      if (!s.crushed || s.crushAnim < 0.5) {
        const fade = s.crushed ? 1 - s.crushAnim * 2 : 1;
        // Shell
        ctx.beginPath();
        ctx.ellipse(cx, shapeY - shapeH / 2, shapeW, shapeH / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * fade * entrance); ctx.fill();
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * fade * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
        // Cracks
        if (compression > 0.5) {
          const crackA = (compression - 0.5) * 2;
          for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + 0.5;
            ctx.beginPath(); ctx.moveTo(cx, shapeY - shapeH / 2);
            ctx.lineTo(cx + Math.cos(a) * shapeW * crackA, shapeY - shapeH / 2 + Math.sin(a) * shapeH * 0.5 * crackA);
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * crackA * entrance);
            ctx.lineWidth = px(0.0005, minDim); ctx.stroke();
          }
        }
      }

      // Core revealed
      if (s.crushed) {
        const cR = px(0.015 + s.crushAnim * 0.01, minDim);
        ctx.beginPath(); ctx.arc(cx, shapeY - cR, cR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * s.crushAnim * entrance); ctx.fill();
        const gR = cR * 4;
        const gg = ctx.createRadialGradient(cx, shapeY - cR, 0, cx, shapeY - cR, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.crushAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, shapeY - cR - gR, gR * 2, gR * 2);
      }

      // Press plate
      const platePixY = s.plateY * h;
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance);
      ctx.fillRect(w * 0.2, platePixY, w * 0.6, px(0.008, minDim));

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (Math.abs(my - st.current.plateY) < 0.08) { st.current.dragging = true; cbRef.current.onHaptic('drag_snap'); }
    };
    const onMove = (e: PointerEvent) => {
      if (!st.current.dragging || st.current.crushed) return;
      const rect = canvas.getBoundingClientRect();
      st.current.plateY = Math.max(0.2, Math.min(0.55, (e.clientY - rect.top) / rect.height));
    };
    const onUp = () => { st.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}
