/**
 * ATOM 175: THE HORIZON SCAN ENGINE · Series 18 · Position 5
 * A blank horizon line. Tap to place imagined landmarks.
 * Each one locks with a deep echoing thud.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Landmark { x: number; h: number; anim: number; }

export default function HorizonScanAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    landmarks: [] as Landmark[],
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const horizonC: RGB = lerpColor(accentC, [180, 160, 120], 0.3);
      const landmarkC: RGB = lerpColor(accentC, [120, 180, 200], 0.3);

      for (const lm of s.landmarks) lm.anim = Math.min(1, lm.anim + 0.03);

      // Background — gradient sky
      const glowR = minDim * (0.4 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy - minDim * 0.1, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Horizon line
      const horizonY = cy + minDim * 0.05;
      ctx.beginPath(); ctx.moveTo(0, horizonY); ctx.lineTo(w, horizonY);
      ctx.strokeStyle = rgba(horizonC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      // Landmarks
      for (const lm of s.landmarks) {
        const la = easeOutCubic(lm.anim);
        const lh = lm.h * la;
        // Building-like shape
        const bw = minDim * 0.02;
        ctx.fillStyle = rgba(landmarkC, ELEMENT_ALPHA.primary.max * (1 + la) * entrance);
        ctx.fillRect(lm.x - bw / 2, horizonY - lh, bw, lh);
        // Peak
        ctx.beginPath();
        ctx.moveTo(lm.x - bw / 2, horizonY - lh);
        ctx.lineTo(lm.x, horizonY - lh - minDim * 0.01 * la);
        ctx.lineTo(lm.x + bw / 2, horizonY - lh);
        ctx.fillStyle = rgba(landmarkC, ELEMENT_ALPHA.primary.max * la * 2 * entrance);
        ctx.fill();
        // Glow
        const lgR = minDim * 0.03 * la;
        const lGrad = ctx.createRadialGradient(lm.x, horizonY - lh, 0, lm.x, horizonY - lh, lgR);
        lGrad.addColorStop(0, rgba(landmarkC, ELEMENT_ALPHA.glow.max * la * entrance));
        lGrad.addColorStop(1, rgba(landmarkC, 0));
        ctx.fillStyle = lGrad;
        ctx.fillRect(lm.x - lgR, horizonY - lh - lgR, lgR * 2, lgR * 2);
      }

      // Ground plane suggestion (parallax depth)
      for (let i = 1; i <= 3; i++) {
        const dy = horizonY + i * minDim * 0.03;
        ctx.beginPath(); ctx.moveTo(cx - minDim * 0.25 * i, dy); ctx.lineTo(cx + minDim * 0.25 * i, dy);
        ctx.strokeStyle = rgba(horizonC, ELEMENT_ALPHA.tertiary.max * (1 - i * 0.25) * entrance);
        ctx.lineWidth = minDim * 0.0004; ctx.stroke();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText(`Tap to place landmarks (${s.landmarks.length})`, cx, horizonY + minDim * 0.15);

      cbRef.current.onStateChange?.(Math.min(1, s.landmarks.length / 5));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const lmH = minDim2 * (0.04 + Math.random() * 0.06);
      stateRef.current.landmarks.push({ x: px, h: lmH, anim: 0 });
      cbRef.current.onHaptic('tap');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}