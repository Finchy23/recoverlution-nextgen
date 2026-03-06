/**
 * ATOM 312: THE DISSONANT CHORD ENGINE
 * Series 32 — Cymatic Engine · Position 2
 *
 * Two sine waves vibrating out of phase. Pinch compresses until
 * frequencies align into smooth harmonic hum.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

export default function DissonantChordAtom({
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
    separation: 1, // 1 = full dissonance, 0 = aligned
    pinching: false, aligned: false, alignAnim: 0, completed: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const pointers = new Map<number, { x: number; y: number }>();

    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.separation = 0;

      // Relax back to dissonance when not pinching
      if (!s.pinching && !s.aligned) s.separation = Math.min(1, s.separation + 0.003);

      if (s.separation < 0.05 && !s.aligned) { s.aligned = true; cb.onHaptic('completion'); }
      if (s.aligned) s.alignAnim = Math.min(1, s.alignAnim + 0.012 * ms);
      cb.onStateChange?.(s.aligned ? 0.5 + s.alignAnim * 0.5 : (1 - s.separation) * 0.5);

      const harmony = 1 - s.separation;
      const freq1 = 0.03; const freq2 = 0.03 + s.separation * 0.02;
      const amp = px(0.06, minDim);
      const yOff1 = cy - px(0.04 * s.separation, minDim);
      const yOff2 = cy + px(0.04 * s.separation, minDim);

      // Draw wave 1
      ctx.beginPath();
      for (let x = 0; x < w; x += 2) {
        const val = Math.sin(x * freq1 + s.frameCount * 0.04) * amp * (s.aligned ? 0.5 + s.alignAnim * 0.5 : 1);
        if (x === 0) ctx.moveTo(x, yOff1 + val); else ctx.lineTo(x, yOff1 + val);
      }
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(0.0015, minDim); ctx.stroke();

      // Draw wave 2
      ctx.beginPath();
      for (let x = 0; x < w; x += 2) {
        const val = Math.sin(x * freq2 + s.frameCount * 0.04 + Math.PI * s.separation) * amp * (s.aligned ? 0.5 + s.alignAnim * 0.5 : 1);
        if (x === 0) ctx.moveTo(x, yOff2 + val); else ctx.lineTo(x, yOff2 + val);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(0.0015, minDim); ctx.stroke();

      // Harmonic glow when aligned
      if (s.aligned) {
        const gR = px(0.1 * s.alignAnim, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.alignAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size >= 2) st.current.pinching = true; };
    const onMove = (e: PointerEvent) => {
      const old = pointers.get(e.pointerId); if (!old) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2) {
        const pts = Array.from(pointers.values());
        const dist = Math.sqrt((pts[0].x - pts[1].x) ** 2 + (pts[0].y - pts[1].y) ** 2);
        const rect = canvas.getBoundingClientRect();
        const normDist = dist / rect.width;
        st.current.separation = Math.max(0, Math.min(1, normDist * 2));
      }
    };
    const onUp = (e: PointerEvent) => { pointers.delete(e.pointerId); if (pointers.size < 2) st.current.pinching = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>);
}
