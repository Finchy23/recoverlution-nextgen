/**
 * ATOM 316: THE SUB-BASS DROP ENGINE
 * Series 32 — Cymatic Engine · Position 6
 *
 * Frantic high pitch plunging into deep rolling sub-bass heartbeat.
 * Swipe down aggressively to ground.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function SubBassDropAtom({
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
    pitch: 1, // 1 = frantic high, 0 = grounded
    dropped: false, dropAnim: 0, completed: false,
    swipeStartY: 0, swiping: false,
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
      if (p.phase === 'resolve') s.pitch = 0;

      if (s.pitch < 0.1 && !s.dropped) { s.dropped = true; cb.onHaptic('completion'); }
      if (s.dropped) s.dropAnim = Math.min(1, s.dropAnim + 0.012 * ms);
      cb.onStateChange?.(s.dropped ? 0.5 + s.dropAnim * 0.5 : (1 - s.pitch) * 0.5);

      // High-freq visual: frantic horizontal lines
      const freq = 0.02 + s.pitch * 0.08;
      const amp = px(0.03 + s.pitch * 0.05, minDim);
      const lineCount = 6;
      for (let l = 0; l < lineCount; l++) {
        const baseY = h * (0.2 + l * 0.1);
        ctx.beginPath();
        for (let x = 0; x < w; x += 3) {
          const yOff = Math.sin(x * freq + s.frameCount * (0.02 + s.pitch * 0.08) + l * 2) * amp * (1 - s.dropAnim * 0.8);
          if (x === 0) ctx.moveTo(x, baseY + yOff); else ctx.lineTo(x, baseY + yOff);
        }
        ctx.strokeStyle = rgba(s.pitch > 0.5 ? s.accentRgb : s.primaryRgb,
          ALPHA.content.max * (0.1 + s.pitch * 0.2) * (1 - s.dropAnim * 0.5) * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      // Sub-bass pulse when dropped
      if (s.dropped) {
        const pulse = Math.sin(s.frameCount * 0.03) * 0.5 + 0.5;
        const pR = px(0.08 + pulse * 0.04, minDim) * s.dropAnim;
        const pg = ctx.createRadialGradient(cx, h * 0.7, 0, cx, h * 0.7, pR);
        pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.dropAnim * entrance));
        pg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pg; ctx.fillRect(cx - pR, h * 0.7 - pR, pR * 2, pR * 2);
        // Heartbeat circle
        const hR = px(0.015 + pulse * 0.005, minDim) * s.dropAnim;
        ctx.beginPath(); ctx.arc(cx, h * 0.7, hR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * s.dropAnim * entrance); ctx.fill();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { st.current.swiping = true; st.current.swipeStartY = e.clientY; };
    const onMove = (e: PointerEvent) => {
      if (!st.current.swiping || st.current.dropped) return;
      const dy = e.clientY - st.current.swipeStartY;
      if (dy > 50) { st.current.pitch = Math.max(0, st.current.pitch - 0.03); cbRef.current.onHaptic('swipe_commit'); }
    };
    const onUp = () => { st.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
