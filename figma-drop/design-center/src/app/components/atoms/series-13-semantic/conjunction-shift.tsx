/**
 * ATOM 124: THE CONJUNCTION SHIFT ENGINE
 * ========================================
 * Series 13 — Semantic Translators · Position 4
 *
 * Two opposing text blocks separated by a red vibrating "BUT".
 * Tap "BUT" — it spins into calm blue "AND". Blocks slide together.
 *
 * PHYSICS: Crossfade text morphing, node linking, structural binding
 * INTERACTION: Tap to transform
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB,
} from '../atom-utils';

export default function ConjunctionShiftAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    tapped: false,
    transformAnim: 0,
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;

      if (s.tapped) s.transformAnim = Math.min(1, s.transformAnim + 0.018);
      const ta = easeOutCubic(s.transformAnim);

      // Background
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Block positions: repulsion → attraction
      const maxGap = minDim * 0.18;
      const minGap = minDim * 0.02;
      const gap = maxGap - ta * (maxGap - minGap);

      const blockW = minDim * 0.15;
      const blockH = minDim * 0.08;
      const leftX = cx - gap - blockW / 2;
      const rightX = cx + gap - blockW / 2;

      // Left block
      const leftColor = lerpColor(baseC, accentC, 0.3 + ta * 0.3);
      ctx.fillStyle = rgba(leftColor, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(leftX, cy - blockH / 2, blockW, blockH);
      const fs = Math.max(7, minDim * 0.012);
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(leftColor, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('I am scared', leftX + blockW / 2, cy);

      // Right block
      const rightColor = lerpColor(baseC, accentC, 0.3 + ta * 0.3);
      ctx.fillStyle = rgba(rightColor, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.fillRect(rightX, cy - blockH / 2, blockW, blockH);
      ctx.fillStyle = rgba(rightColor, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('I am brave', rightX + blockW / 2, cy);

      // Conjunction word
      const conjFs = Math.max(12, minDim * 0.03);
      const redC: RGB = lerpColor(accentC, [220, 60, 50], 0.3);
      const blueC: RGB = lerpColor(accentC, [80, 160, 220], 0.5);
      const conjColor = lerpColor(redC, blueC, ta);

      // Vibration when BUT
      const vib = !s.tapped && !p.reducedMotion
        ? Math.sin(s.frameCount * 0.3 * ms) * minDim * 0.002
        : 0;

      // Spin effect
      const spinScale = s.tapped && ta < 0.5
        ? Math.cos(ta * Math.PI * 4) // rapid spin during first half
        : 1;

      ctx.save();
      ctx.translate(cx, cy + vib);
      ctx.scale(Math.abs(spinScale), 1);
      ctx.font = `700 ${conjFs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(conjColor, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fillText(ta > 0.5 ? 'AND' : 'BUT', 0, 0);
      ctx.restore();

      // Unified structure glow when merged
      if (ta > 0.8) {
        const uGlowR = minDim * 0.12 * (ta - 0.8) * 5;
        const uGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, uGlowR);
        uGrad.addColorStop(0, rgba(blueC, EMPHASIS_ALPHA.focal.min * entrance * (ta - 0.8) * 5));
        uGrad.addColorStop(1, rgba(blueC, 0));
        ctx.fillStyle = uGrad;
        ctx.fillRect(cx - uGlowR, cy - uGlowR, uGlowR * 2, uGlowR * 2);
      }

      if (s.transformAnim >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(ta);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (_e: PointerEvent) => {
      if (!stateRef.current.tapped) {
        stateRef.current.tapped = true;
        cbRef.current.onHaptic('tap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}