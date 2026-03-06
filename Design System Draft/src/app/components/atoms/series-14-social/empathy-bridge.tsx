/**
 * ATOM 134: THE EMPATHY BRIDGE ENGINE · Series 14 · Position 4
 * Drag 3 glowing stones to form a bridge across a chasm. Only then
 * can the Truth packet cross safely.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const STONES = ['Validation', 'Listening', 'Patience'];

export default function EmpathyBridgeAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    stonesPlaced: 0, crossAnim: 0,
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

      if (s.stonesPlaced >= STONES.length) s.crossAnim = Math.min(1, s.crossAnim + 0.01);
      const ca = easeOutCubic(s.crossAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Chasm
      const chasmY = cy;
      const chasmH = minDim * 0.04;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 0.5 * entrance);
      ctx.fillRect(cx - minDim * 0.15, chasmY, minDim * 0.3, chasmH);

      // Platforms
      const leftX = cx - minDim * 0.2; const rightX = cx + minDim * 0.2;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fillRect(leftX - minDim * 0.05, chasmY, minDim * 0.1, chasmH);
      ctx.fillRect(rightX - minDim * 0.05, chasmY, minDim * 0.1, chasmH);

      // Bridge stones
      for (let i = 0; i < s.stonesPlaced; i++) {
        const t = (i + 0.5) / STONES.length;
        const sx = leftX + (rightX - leftX) * t;
        const stoneW = minDim * 0.08; const stoneH = chasmH;
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
        ctx.fillRect(sx - stoneW / 2, chasmY, stoneW, stoneH);
        const fs = Math.max(6, minDim * 0.009);
        ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText(STONES[i], sx, chasmY - minDim * 0.015);
      }

      // Truth packet
      const packetR = minDim * 0.015;
      const packetX = s.stonesPlaced >= STONES.length ? leftX + (rightX - leftX) * ca : leftX;
      ctx.beginPath(); ctx.arc(packetX, chasmY - packetR * 1.5, packetR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(accentC, [255, 255, 255], 0.3), EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();
      const tf = Math.max(6, minDim * 0.008);
      ctx.font = `${tf}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Truth', packetX, chasmY - packetR * 1.5);

      // "Other" on right
      ctx.fillText('Other', rightX, chasmY - minDim * 0.04);
      ctx.fillText('You', leftX, chasmY - minDim * 0.04);

      // Prompt
      if (s.stonesPlaced < STONES.length) {
        const pf = Math.max(8, minDim * 0.013);
        ctx.font = `${pf}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText(`Tap to place: ${STONES[s.stonesPlaced]}`, cx, chasmY + chasmH + minDim * 0.06);
      }

      if (ca >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.((s.stonesPlaced + ca) / (STONES.length + 1));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.stonesPlaced < STONES.length) { s.stonesPlaced++; cbRef.current.onHaptic('drag_snap'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}