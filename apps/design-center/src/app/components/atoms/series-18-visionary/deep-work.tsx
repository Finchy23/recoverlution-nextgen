/**
 * ATOM 173: THE DEEP WORK ENGINE · Series 18 · Position 3
 * A heavy vault door. Drag it closed to enter unbreakable focus.
 * Light occludes as the door shuts — metallic BOOM on seal.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function DeepWorkAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    doorPos: 0, dragging: false, lastX: 0, sealed: false, sealAnim: 0,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const vaultC: RGB = lerpColor(accentC, [120, 130, 140], 0.4);
      const lightC: RGB = lerpColor(accentC, [255, 240, 200], 0.3);

      if (s.sealed) s.sealAnim = Math.min(1, s.sealAnim + 0.015);
      const sa = easeOutCubic(s.sealAnim);

      // Light behind the door (dims as door closes)
      const lightAlpha = (1 - s.doorPos) * EMPHASIS_ALPHA.focal.min * entrance;
      const lightR = minDim * 0.2;
      const lGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lightR);
      lGrad.addColorStop(0, rgba(lightC, lightAlpha));
      lGrad.addColorStop(1, rgba(lightC, 0));
      ctx.fillStyle = lGrad; ctx.fillRect(0, 0, w, h);

      // Door frame
      const frameW = minDim * 0.28; const frameH = minDim * 0.35;
      const fx = cx - frameW / 2; const fy = cy - frameH / 2;
      ctx.strokeStyle = rgba(vaultC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.lineWidth = minDim * 0.002;
      ctx.strokeRect(fx, fy, frameW, frameH);

      // Door slab (slides from left)
      const doorW = frameW * s.doorPos;
      ctx.fillStyle = rgba(vaultC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fillRect(fx, fy, doorW, frameH);

      // Door rivets
      if (doorW > minDim * 0.03) {
        const rivetR = minDim * 0.003;
        for (let ry = 0; ry < 3; ry++) {
          const ryP = fy + (ry + 1) * frameH / 4;
          ctx.beginPath(); ctx.arc(fx + doorW * 0.5, ryP, rivetR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(vaultC, [200, 200, 200], 0.3), ELEMENT_ALPHA.primary.max * entrance);
          ctx.fill();
        }
      }

      // Handle on door edge
      if (doorW > minDim * 0.01) {
        const hx = fx + doorW - minDim * 0.005;
        ctx.fillStyle = rgba(lerpColor(vaultC, [180, 180, 180], 0.5), EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(hx, cy - minDim * 0.02, minDim * 0.008, minDim * 0.04);
      }

      // Seal glow flash
      if (sa > 0) {
        const sGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.15 * (1 - sa * 0.5));
        sGrad.addColorStop(0, rgba(vaultC, ELEMENT_ALPHA.glow.max * (1 - sa) * 3 * entrance));
        sGrad.addColorStop(1, rgba(vaultC, 0));
        ctx.fillStyle = sGrad; ctx.fillRect(0, 0, w, h);
      }

      // Remaining light slit
      if (s.doorPos < 1) {
        const slitW = frameW * (1 - s.doorPos);
        ctx.fillStyle = rgba(lightC, ELEMENT_ALPHA.primary.max * (1 - s.doorPos) * entrance);
        ctx.fillRect(fx + doorW, fy, slitW, frameH);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.sealed) ctx.fillText('Drag right to seal the vault', cx, fy + frameH + minDim * 0.05);
      else ctx.fillText('Deep work sealed.', cx, fy + frameH + minDim * 0.05);

      if (s.sealed && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(s.doorPos);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.sealed) return;
      stateRef.current.dragging = true; stateRef.current.lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.sealed) return;
      const dx = e.clientX - s.lastX;
      s.doorPos = Math.max(0, Math.min(1, s.doorPos + dx * 0.004));
      s.lastX = e.clientX;
      if (s.doorPos >= 0.98 && !s.sealed) { s.sealed = true; s.doorPos = 1; cbRef.current.onHaptic('drag_snap'); }
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}