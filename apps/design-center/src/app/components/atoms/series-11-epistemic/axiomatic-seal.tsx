/**
 * ATOM 110: THE AXIOMATIC SEAL
 * ==============================
 * Series 11 — Epistemic Constructs · Position 10
 *
 * A pool of glowing liquid digital wax. Hold thumb to stamp.
 * The liquid cools, hardening into an intricate seal.
 * The heaviest, most permanent vault-door thud.
 *
 * PHYSICS: Molten wax mechanics, heavy kinetic stamping, cooling crystallization
 * INTERACTION: Hold to stamp and seal
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

export default function AxiomaticSealAtom({
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
    holding: false,
    holdProgress: 0, // 0→1: how long held
    sealed: false,
    coolProgress: 0,
    holdFired: false,
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

      // Hold progress
      if (s.holding && !s.sealed) {
        s.holdProgress = Math.min(1, s.holdProgress + 0.008);
        if (s.holdProgress > 0.3 && !s.holdFired) {
          s.holdFired = true;
          cb.onHaptic('hold_threshold');
        }
        if (s.holdProgress >= 1) {
          s.sealed = true;
          cb.onHaptic('seal_stamp');
        }
      }

      // Cooling
      if (s.sealed) s.coolProgress = Math.min(1, s.coolProgress + 0.012);

      const cool = easeOutCubic(s.coolProgress);
      const hold = s.holdProgress;

      // Background glow
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgC = lerpColor(baseC, accentC, cool * 0.3);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(bgC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(bgC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Wax pool
      const poolR = minDim * (0.12 + hold * 0.04 - cool * 0.02);
      const waxColor = lerpColor(
        lerpColor(accentC, [255, 180, 60], 0.5),
        lerpColor(baseC, accentC, 0.7),
        cool
      );

      // Molten wax ripples
      if (!s.sealed && !p.reducedMotion) {
        const rippleCount = 3;
        for (let i = 0; i < rippleCount; i++) {
          const phase2 = (s.frameCount * 0.02 * ms + i * Math.PI * 2 / rippleCount) % (Math.PI * 2);
          const ripR = poolR * (0.8 + Math.sin(phase2) * 0.2);
          ctx.beginPath();
          ctx.arc(cx, cy, ripR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(waxColor, ELEMENT_ALPHA.secondary.max * entrance * (1 - hold * 0.5));
          ctx.lineWidth = minDim * 0.0006;
          ctx.stroke();
        }
      }

      // Main pool
      ctx.beginPath();
      ctx.arc(cx, cy, poolR, 0, Math.PI * 2);
      const poolAlpha = ELEMENT_ALPHA.primary.max * (1.5 + cool) * entrance;
      ctx.fillStyle = rgba(waxColor, poolAlpha);
      ctx.fill();

      // Seal pattern (appears as it cools)
      if (s.sealed && cool > 0.1) {
        const sealAlpha = cool * EMPHASIS_ALPHA.focal.max * entrance;
        ctx.strokeStyle = rgba(lerpColor(accentC, [255, 255, 255], 0.3), sealAlpha);
        ctx.lineWidth = minDim * 0.0008;

        // Concentric rings
        for (let i = 1; i <= 3; i++) {
          const r = poolR * 0.3 * i / 3 * cool;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Cross pattern
        const armLen = poolR * 0.25 * cool;
        for (let a = 0; a < 4; a++) {
          const angle = a * Math.PI / 2 + Math.PI / 4;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * armLen, cy + Math.sin(angle) * armLen);
          ctx.stroke();
        }

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, minDim * 0.005 * cool, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), sealAlpha * 0.5);
        ctx.fill();
      }

      // Hold ring progress indicator
      if (!s.sealed && hold > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, poolR + minDim * 0.02, -Math.PI / 2, -Math.PI / 2 + hold * Math.PI * 2);
        ctx.strokeStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.002;
        ctx.stroke();
      }

      // Prompt
      if (!s.sealed && hold < 0.01) {
        const pf = Math.max(8, minDim * 0.014);
        ctx.font = `${pf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance * (0.5 + Math.sin(s.frameCount * 0.03 * ms) * 0.3));
        ctx.fillText('Hold to seal', cx, cy + poolR + minDim * 0.06);
      }

      // Sealed text
      if (s.sealed && cool > 0.5) {
        const tf = Math.max(7, minDim * 0.012);
        ctx.font = `600 ${tf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.text.max * entrance * (cool - 0.5) * 2);
        ctx.fillText('SEALED', cx, cy + poolR + minDim * 0.05);
      }

      // Completion
      if (s.coolProgress >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.sealed ? 0.5 + s.coolProgress * 0.5 : s.holdProgress * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}