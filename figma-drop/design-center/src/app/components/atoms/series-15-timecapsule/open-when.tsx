/**
 * ATOM 141: THE OPEN WHEN ENGINE · Series 15 · Position 1
 * A glowing vial fills with luminous liquid as user holds.
 * Cork seals it. Stored for later.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function OpenWhenAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false, fillLevel: 0, sealed: false, sealAnim: 0,
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
      const goldC: RGB = lerpColor(accentC, [255, 210, 80], 0.4);

      if (s.holding && !s.sealed) s.fillLevel = Math.min(1, s.fillLevel + 0.004);
      if (s.fillLevel >= 1 && !s.sealed) { s.sealed = true; cb.onHaptic('seal_stamp'); }
      if (s.sealed) s.sealAnim = Math.min(1, s.sealAnim + 0.02);
      const sa = easeOutCubic(s.sealAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Vial
      const vialW = minDim * 0.06; const vialH = minDim * 0.2;
      const vialX = cx - vialW / 2; const vialTop = cy - vialH * 0.4;

      // Glass outline
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.lineWidth = minDim * 0.001;
      ctx.beginPath();
      ctx.moveTo(vialX, vialTop);
      ctx.lineTo(vialX, vialTop + vialH);
      ctx.quadraticCurveTo(vialX, vialTop + vialH + vialW * 0.3, cx, vialTop + vialH + vialW * 0.3);
      ctx.quadraticCurveTo(vialX + vialW, vialTop + vialH + vialW * 0.3, vialX + vialW, vialTop + vialH);
      ctx.lineTo(vialX + vialW, vialTop);
      ctx.stroke();

      // Liquid fill
      const fillH = vialH * s.fillLevel;
      const fillTop = vialTop + vialH - fillH;
      const fillGrad = ctx.createLinearGradient(cx, fillTop, cx, vialTop + vialH + vialW * 0.3);
      fillGrad.addColorStop(0, rgba(goldC, EMPHASIS_ALPHA.focal.max * entrance));
      fillGrad.addColorStop(1, rgba(goldC, ELEMENT_ALPHA.primary.max * entrance));
      ctx.fillStyle = fillGrad;
      ctx.fillRect(vialX + minDim * 0.002, fillTop, vialW - minDim * 0.004, fillH + vialW * 0.3);

      // Liquid glow
      if (s.fillLevel > 0.1) {
        const lgR = vialW * 2 * s.fillLevel;
        const lgGrad = ctx.createRadialGradient(cx, vialTop + vialH * 0.5, 0, cx, vialTop + vialH * 0.5, lgR);
        lgGrad.addColorStop(0, rgba(goldC, ELEMENT_ALPHA.glow.max * s.fillLevel * entrance));
        lgGrad.addColorStop(1, rgba(goldC, 0));
        ctx.fillStyle = lgGrad;
        ctx.fillRect(cx - lgR, vialTop + vialH * 0.5 - lgR, lgR * 2, lgR * 2);
      }

      // Cork
      if (s.sealed) {
        const corkH = minDim * 0.02 * sa;
        ctx.fillStyle = rgba(lerpColor(baseC, [150, 110, 60], 0.5), EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillRect(vialX - minDim * 0.005, vialTop - corkH, vialW + minDim * 0.01, corkH);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.sealed) ctx.fillText('Hold to fill', cx, vialTop + vialH + minDim * 0.08);
      else ctx.fillText('Sealed.', cx, vialTop + vialH + minDim * 0.08);

      if (sa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.fillLevel);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}