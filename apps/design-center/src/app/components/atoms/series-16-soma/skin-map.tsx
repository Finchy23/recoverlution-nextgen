/**
 * ATOM 151: THE SKIN MAP ENGINE · Series 16 · Position 1
 * Draw on a silhouette to locate where trauma lives in the body.
 * UV-painted strokes glow and warm where you touch.
 */
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';

interface Mark { x: number; y: number; r: number; age: number }

export default function SkinMapAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    marks: [] as Mark[], drawing: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const warmC: RGB = lerpColor(accentC, [255, 140, 80], 0.4);

      // Background glow
      const ms0 = motionScale(p.reducedMotion);
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.04 * ms0) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Body silhouette (simple outline)
      const bodyH = minDim * 0.35; const bodyW = minDim * 0.12;
      const headR = minDim * 0.028;
      const headY = cy - bodyH * 0.42;

      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001;
      // Head
      ctx.beginPath(); ctx.arc(cx, headY, headR, 0, Math.PI * 2); ctx.stroke();
      // Neck
      ctx.beginPath(); ctx.moveTo(cx, headY + headR); ctx.lineTo(cx, headY + headR + minDim * 0.015); ctx.stroke();
      // Torso
      const shoulderY = headY + headR + minDim * 0.015;
      const hipY = shoulderY + bodyH * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.5, shoulderY);
      ctx.lineTo(cx - bodyW * 0.4, hipY);
      ctx.lineTo(cx + bodyW * 0.4, hipY);
      ctx.lineTo(cx + bodyW * 0.5, shoulderY);
      ctx.stroke();
      // Arms
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.5, shoulderY);
      ctx.lineTo(cx - bodyW * 1.1, shoulderY + bodyH * 0.25);
      ctx.moveTo(cx + bodyW * 0.5, shoulderY);
      ctx.lineTo(cx + bodyW * 1.1, shoulderY + bodyH * 0.25);
      ctx.stroke();
      // Legs
      const legBottom = hipY + bodyH * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx - bodyW * 0.4, hipY); ctx.lineTo(cx - bodyW * 0.5, legBottom);
      ctx.moveTo(cx + bodyW * 0.4, hipY); ctx.lineTo(cx + bodyW * 0.5, legBottom);
      ctx.stroke();

      // Painted marks
      for (const m of s.marks) {
        m.age++;
        const ms = motionScale(p.reducedMotion);
        const pulse = !p.reducedMotion ? 1 + Math.sin(s.frameCount * 0.03 * ms + m.age * 0.1) * 0.15 : 1;
        const markR = m.r * pulse;
        const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, markR * 3);
        grd.addColorStop(0, rgba(warmC, EMPHASIS_ALPHA.accent.min * entrance));
        grd.addColorStop(0.5, rgba(warmC, ELEMENT_ALPHA.glow.max * entrance));
        grd.addColorStop(1, rgba(warmC, 0));
        ctx.fillStyle = grd;
        ctx.fillRect(m.x - markR * 3, m.y - markR * 3, markR * 6, markR * 6);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText(s.marks.length === 0 ? 'Draw where you hold it' : `${s.marks.length} point${s.marks.length > 1 ? 's' : ''} mapped`, cx, legBottom + minDim * 0.05);

      cbRef.current.onStateChange?.(Math.min(1, s.marks.length / 10));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const addMark = (e: PointerEvent) => {
      if (!stateRef.current.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * viewport.width;
      const y = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      stateRef.current.marks.push({ x, y, r: minDim2 * 0.012, age: 0 });
    };
    const onDown = (e: PointerEvent) => { stateRef.current.drawing = true; canvas.setPointerCapture(e.pointerId); addMark(e); cbRef.current.onHaptic('drag_snap'); };
    const onMove = (e: PointerEvent) => { addMark(e); };
    const onUp = (e: PointerEvent) => { stateRef.current.drawing = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}