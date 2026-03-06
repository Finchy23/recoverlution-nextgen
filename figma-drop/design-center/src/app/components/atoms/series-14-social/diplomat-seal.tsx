/**
 * ATOM 140: THE DIPLOMAT SEAL · Series 14 · Position 10
 * Two warring fluids (fire-orange, ice-blue) crash together.
 * Trace a circle around the chaos → they morph into balanced Yin-Yang.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function DiplomatSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    drawPath: [] as { x: number; y: number }[],
    drawing: false, sealed: false, sealAnim: 0,
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const fireC: RGB = lerpColor(accentC, [230, 140, 50], 0.3);
      const iceC: RGB = lerpColor(accentC, [80, 160, 230], 0.5);

      if (s.sealed) s.sealAnim = Math.min(1, s.sealAnim + 0.015);
      const sa = easeOutCubic(s.sealAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const yinR = minDim * 0.12;

      if (!s.sealed) {
        // Chaotic fluid blobs
        const chaos = !p.reducedMotion ? 1 : 0.3;
        for (let i = 0; i < 8; i++) {
          const angle = s.frameCount * 0.02 * ms + i * 0.8;
          const dist = minDim * (0.03 + Math.sin(i * 2.3 + s.frameCount * 0.01 * ms) * 0.04) * chaos;
          const isF = i % 2 === 0;
          const blobColor = isF ? fireC : iceC;
          const bx = cx + Math.cos(angle) * dist;
          const by = cy + Math.sin(angle) * dist;
          const br = minDim * (0.02 + Math.sin(i * 3.1) * 0.01);
          ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fillStyle = rgba(blobColor, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
          ctx.fill();
        }
      } else {
        // Yin-Yang
        const angle = !p.reducedMotion ? s.frameCount * 0.01 * ms * sa : 0;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);

        // Main circle
        ctx.beginPath(); ctx.arc(0, 0, yinR * sa, 0, Math.PI * 2);
        ctx.fillStyle = rgba(fireC, ELEMENT_ALPHA.primary.max * sa * entrance);
        ctx.fill();

        // Yin half
        ctx.beginPath(); ctx.arc(0, 0, yinR * sa, Math.PI / 2, Math.PI * 1.5);
        ctx.fillStyle = rgba(iceC, ELEMENT_ALPHA.primary.max * sa * entrance);
        ctx.fill();

        // S-curve bumps
        ctx.beginPath(); ctx.arc(0, -yinR * 0.25 * sa, yinR * 0.25 * sa, 0, Math.PI * 2);
        ctx.fillStyle = rgba(fireC, ELEMENT_ALPHA.primary.max * sa * entrance);
        ctx.fill();
        ctx.beginPath(); ctx.arc(0, yinR * 0.25 * sa, yinR * 0.25 * sa, 0, Math.PI * 2);
        ctx.fillStyle = rgba(iceC, ELEMENT_ALPHA.primary.max * sa * entrance);
        ctx.fill();

        // Dots
        ctx.beginPath(); ctx.arc(0, -yinR * 0.25 * sa, yinR * 0.06 * sa, 0, Math.PI * 2);
        ctx.fillStyle = rgba(iceC, ELEMENT_ALPHA.primary.max * sa * entrance); ctx.fill();
        ctx.beginPath(); ctx.arc(0, yinR * 0.25 * sa, yinR * 0.06 * sa, 0, Math.PI * 2);
        ctx.fillStyle = rgba(fireC, ELEMENT_ALPHA.primary.max * sa * entrance); ctx.fill();

        ctx.restore();
      }

      // Drawing path
      if (s.drawPath.length > 1) {
        ctx.beginPath(); ctx.moveTo(s.drawPath[0].x, s.drawPath[0].y);
        for (let i = 1; i < s.drawPath.length; i++) ctx.lineTo(s.drawPath[i].x, s.drawPath[i].y);
        ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.001; ctx.stroke();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.sealed) ctx.fillText('Trace a circle', cx, cy + yinR + minDim * 0.06);

      if (sa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(sa);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.sealed) return;
      stateRef.current.drawing = true; stateRef.current.drawPath = [];
      const rect = canvas.getBoundingClientRect();
      stateRef.current.drawPath.push({ x: (e.clientX - rect.left) / rect.width * viewport.width, y: (e.clientY - rect.top) / rect.height * viewport.height });
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.drawing) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.drawPath.push({ x: (e.clientX - rect.left) / rect.width * viewport.width, y: (e.clientY - rect.top) / rect.height * viewport.height });
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current; s.drawing = false;
      canvas.releasePointerCapture(e.pointerId);
      // Check if path forms a rough circle (enough points, start close to end)
      if (s.drawPath.length > 15) {
        const first = s.drawPath[0]; const last = s.drawPath[s.drawPath.length - 1];
        const d = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);
        const minDim2 = Math.min(viewport.width, viewport.height);
        if (d < minDim2 * 0.1) { s.sealed = true; cbRef.current.onHaptic('drag_snap'); }
      }
      s.drawPath = [];
    };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}