/**
 * ATOM 189: THE LIGHT SOURCE ENGINE · Series 19 · Position 9
 * Turn around. Look at the light that makes the movie possible.
 * Drag to rotate camera away from chaos — pure white light fills the device.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function LightSourceAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    rotation: 0, dragging: false, lastX: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const chaosC: RGB = lerpColor(accentC, [100, 80, 90], 0.4);
      const lightC: RGB = lerpColor(baseC, [255, 255, 240], 0.85);

      const rot = s.rotation; // 0 = facing chaos, 1 = facing light

      // Background — transitions from dark chaos to pure light
      const bgAlpha = ELEMENT_ALPHA.glow.max * (0.5 + rot * 3) * entrance;
      const bgC = lerpColor(chaosC, lightC, rot);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * (0.3 + rot * 0.3));
      bgGrad.addColorStop(0, rgba(bgC, bgAlpha));
      bgGrad.addColorStop(1, rgba(bgC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Chaos scene (fades out as rotate)
      if (rot < 0.8) {
        const chaosAlpha = (1 - rot) * entrance;
        // Jagged shapes
        for (let i = 0; i < 8; i++) {
          const jx = cx + Math.sin(i * 1.7 + s.frameCount * 0.02 * ms) * minDim * 0.12;
          const jy = cy + Math.cos(i * 2.3 + s.frameCount * 0.015 * ms) * minDim * 0.1;
          ctx.beginPath();
          ctx.moveTo(jx, jy - minDim * 0.02);
          ctx.lineTo(jx + minDim * 0.015, jy + minDim * 0.01);
          ctx.lineTo(jx - minDim * 0.015, jy + minDim * 0.01);
          ctx.closePath();
          ctx.fillStyle = rgba(chaosC, ELEMENT_ALPHA.primary.max * chaosAlpha);
          ctx.fill();
        }
      }

      // Light source (fades in)
      if (rot > 0.3) {
        const lightAlpha = (rot - 0.3) / 0.7;
        const lR = minDim * 0.2 * lightAlpha;
        const lGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lR);
        lGrad.addColorStop(0, rgba(lightC, EMPHASIS_ALPHA.focal.max * lightAlpha * entrance));
        lGrad.addColorStop(0.5, rgba(lightC, ELEMENT_ALPHA.glow.max * lightAlpha * entrance));
        lGrad.addColorStop(1, rgba(lightC, 0));
        ctx.fillStyle = lGrad; ctx.fillRect(0, 0, w, h);

        // Rays
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const rayLen = lR * 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
          ctx.strokeStyle = rgba(lightC, ELEMENT_ALPHA.tertiary.max * lightAlpha * entrance);
          ctx.lineWidth = minDim * 0.001; ctx.stroke();
        }
      }

      // Silhouettes at edges (the movie projections)
      if (rot < 0.6) {
        for (let i = 0; i < 4; i++) {
          const sx = minDim * 0.05 + i * (w - minDim * 0.1) / 3;
          const sh = minDim * (0.04 + Math.random() * 0.02) * (1 - rot);
          ctx.fillStyle = rgba(lerpColor(baseC, [30, 30, 40] as RGB, 0.85), ELEMENT_ALPHA.primary.max * (1 - rot * 1.5) * entrance);
          ctx.fillRect(sx - minDim * 0.01, h - sh, minDim * 0.02, sh);
        }
      }

      // Rotation indicator
      ctx.beginPath();
      ctx.arc(cx, h - minDim * 0.06, minDim * 0.015, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      // Arrow on indicator
      const ia = -Math.PI / 2 + rot * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, h - minDim * 0.06);
      ctx.lineTo(cx + Math.cos(ia) * minDim * 0.012, h - minDim * 0.06 + Math.sin(ia) * minDim * 0.012);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.001; ctx.stroke();

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(rot > 0.5 ? lerpColor(baseC, [40, 40, 40] as RGB, 0.85) : baseC, ELEMENT_ALPHA.text.min * entrance);
      if (rot < 0.9) ctx.fillText('Drag to turn around', cx, minDim * 0.05);
      else ctx.fillText('The source.', cx, minDim * 0.05);

      if (rot >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(rot);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      s.rotation = Math.max(0, Math.min(1, s.rotation + dx * 0.003));
      s.lastX = e.clientX;
      if (s.rotation > 0.5 && s.rotation < 0.52) cbRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}