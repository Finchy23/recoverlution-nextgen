/**
 * ATOM 169: THE MIRROR NEURON ENGINE · Series 17 · Position 9
 * A face-like form appears. Tap to cycle through expressions —
 * mirroring each one. Mask dissolves into warm connecting light.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const EXPRESSIONS = ['😠', '😢', '😨', '😊'];

export default function MirrorNeuronAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    current: 0, mirrored: 0, mirrorAnims: [0, 0, 0, 0], dissolveAnim: 0,
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
      const warmC: RGB = lerpColor(accentC, [220, 180, 120], 0.3);

      for (let i = 0; i < 4; i++) if (i < s.mirrored) s.mirrorAnims[i] = Math.min(1, s.mirrorAnims[i] + 0.03);
      const complete = s.mirrored >= EXPRESSIONS.length;
      if (complete) s.dissolveAnim = Math.min(1, s.dissolveAnim + 0.015);
      const da = easeOutCubic(s.dissolveAnim);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Dissolving warm glow on completion
      if (da > 0) {
        const dR = minDim * 0.25 * da;
        const dGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, dR);
        dGrad.addColorStop(0, rgba(warmC, EMPHASIS_ALPHA.focal.max * da * entrance));
        dGrad.addColorStop(1, rgba(warmC, 0));
        ctx.fillStyle = dGrad; ctx.fillRect(cx - dR, cy - dR, dR * 2, dR * 2);
      }

      if (!complete) {
        // "Their" face (left)
        const faceSize = minDim * 0.06;
        const leftX = cx - minDim * 0.1;
        const rightX = cx + minDim * 0.1;

        // Their expression
        ctx.font = `${faceSize}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillText(EXPRESSIONS[s.current], leftX, cy + faceSize * 0.3);

        // "Your" mirror (right) — empty circle until tapped
        ctx.beginPath(); ctx.arc(rightX, cy, minDim * 0.035, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * entrance);
        ctx.lineWidth = minDim * 0.001; ctx.stroke();

        // Mirror line
        ctx.beginPath(); ctx.moveTo(cx, cy - minDim * 0.05); ctx.lineTo(cx, cy + minDim * 0.05);
        ctx.setLineDash([minDim * 0.004, minDim * 0.004]);
        ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
        ctx.lineWidth = minDim * 0.0006; ctx.stroke();
        ctx.setLineDash([]);

        const fs2 = Math.max(7, minDim * 0.01);
        ctx.font = `${fs2}px -apple-system, sans-serif`;
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('Their', leftX, cy + minDim * 0.06);
        ctx.fillText('Yours', rightX, cy + minDim * 0.06);
      }

      // Mirrored history
      const histY = cy + minDim * 0.12;
      for (let i = 0; i < s.mirrored; i++) {
        const ha = easeOutCubic(s.mirrorAnims[i]);
        const hx = cx - minDim * 0.1 + i * minDim * 0.06;
        ctx.globalAlpha = ha;
        ctx.font = `${minDim * 0.025}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillText(EXPRESSIONS[i], hx, histY);
        ctx.globalAlpha = 1;
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!complete) ctx.fillText('Tap to mirror', cx, cy + minDim * 0.2);
      else if (da > 0.5) ctx.fillText('Connection established.', cx, cy + minDim * 0.2);

      if (da >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.mirrored / EXPRESSIONS.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      if (s.mirrored >= EXPRESSIONS.length) return;
      s.mirrored++; s.current = Math.min(EXPRESSIONS.length - 1, s.current + 1);
      cbRef.current.onHaptic('step_advance');
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}