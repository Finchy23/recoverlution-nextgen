/**
 * ATOM 345: THE CARBON LAYER ENGINE
 * Series 35 — Pressure Vessel · Position 5
 *
 * Rhythmic tapping deposits micro-thin layers.
 * After 20 taps the layered structure glows — stronger than steel.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const MAX_LAYERS = 20;

export default function CarbonLayerAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    layers: 0, complete: false, completeAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.layers = MAX_LAYERS;

      const ratio = Math.min(1, s.layers / MAX_LAYERS);
      if (ratio >= 1 && !s.complete) { s.complete = true; cb.onHaptic('completion'); }
      if (s.complete) s.completeAnim = Math.min(1, s.completeAnim + 0.012 * ms);
      cb.onStateChange?.(s.complete ? 0.5 + s.completeAnim * 0.5 : ratio * 0.5);

      // Substrate
      const baseW = px(0.12, minDim); const layerH = px(0.003, minDim);
      const baseY = cy + px(0.04, minDim);

      for (let i = 0; i < Math.min(s.layers, MAX_LAYERS); i++) {
        const ly = baseY - i * layerH;
        const alpha = 0.1 + (i / MAX_LAYERS) * 0.3 + (s.complete ? s.completeAnim * 0.2 : 0);
        ctx.fillStyle = rgba(i < MAX_LAYERS * 0.5 ? s.accentRgb : s.primaryRgb,
          ALPHA.content.max * alpha * entrance);
        ctx.fillRect(cx - baseW, ly, baseW * 2, layerH - 0.5);
      }

      // Glow when complete
      if (s.complete) {
        const gR = px(0.06 * s.completeAnim, minDim);
        const gg = ctx.createRadialGradient(cx, baseY - MAX_LAYERS * layerH / 2, 0, cx, baseY - MAX_LAYERS * layerH / 2, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.completeAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; const gy = baseY - MAX_LAYERS * layerH / 2; ctx.fillRect(cx - gR, gy - gR, gR * 2, gR * 2);
      }

      // Layer counter
      ctx.beginPath(); ctx.arc(w * 0.9, h * 0.1, px(0.015, minDim), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(0.001, minDim); ctx.stroke();

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { if (st.current.layers < MAX_LAYERS) { st.current.layers++; cbRef.current.onHaptic('tap'); } };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
