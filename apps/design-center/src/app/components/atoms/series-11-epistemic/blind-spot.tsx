/**
 * ATOM 105: THE BLIND SPOT ENGINE
 * ================================
 * Series 11 — Epistemic Constructs · Position 5
 *
 * The screen is dark. The user's thumb acts as a volumetric
 * flashlight. Drag into the dark corners to reveal hidden text.
 * Hold the light on text until the shadows disappear.
 *
 * PHYSICS: Radial masking, dynamic lighting, shadow rendering
 * INTERACTION: Drag (flashlight), hold to dissolve shadows
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA,
  EMPHASIS_ALPHA,
  motionScale,
  type RGB,
} from '../atom-utils';

const HIDDEN_TRUTHS = [
  { label: 'My part in this', xf: 0.18, yf: 0.22 },
  { label: 'What I avoid', xf: 0.82, yf: 0.25 },
  { label: 'The pattern', xf: 0.15, yf: 0.75 },
  { label: 'The real fear', xf: 0.85, yf: 0.78 },
  { label: 'What I already know', xf: 0.5, yf: 0.88 },
];

export default function BlindSpotAtom({
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
    lightX: -1, lightY: -1, lightActive: false,
    revealed: new Array(HIDDEN_TRUTHS.length).fill(0) as number[], // 0→1
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

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;
      const ms = motionScale(p.reducedMotion);
      const lightR = minDim * (0.15 + p.breathAmplitude * 0.02 * ms);

      // Dark overlay — the "darkness"
      ctx.fillStyle = rgba(lerpColor(baseC, [5, 5, 10] as RGB, 0.85), 0.03 * entrance);
      ctx.fillRect(0, 0, w, h);

      // Subtle center glow
      const cGlowR = minDim * 0.3 * entrance;
      const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cGlowR);
      cGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.min * entrance));
      cGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = cGrad;
      ctx.fillRect(0, 0, w, h);

      // If light is active, reveal hidden truths nearby
      if (s.lightActive) {
        // Draw flashlight cone
        const lGrad = ctx.createRadialGradient(s.lightX, s.lightY, 0, s.lightX, s.lightY, lightR);
        lGrad.addColorStop(0, rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance));
        lGrad.addColorStop(0.5, rgba(accentC, ELEMENT_ALPHA.secondary.max * entrance));
        lGrad.addColorStop(1, rgba(accentC, 0));
        ctx.fillStyle = lGrad;
        ctx.fillRect(s.lightX - lightR, s.lightY - lightR, lightR * 2, lightR * 2);

        // Check proximity to each hidden truth
        for (let i = 0; i < HIDDEN_TRUTHS.length; i++) {
          const ht = HIDDEN_TRUTHS[i];
          const hx = ht.xf * w;
          const hy = ht.yf * h;
          const dx = s.lightX - hx;
          const dy = s.lightY - hy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < lightR * 0.8 && s.revealed[i] < 1) {
            s.revealed[i] = Math.min(1, s.revealed[i] + 0.008);
            if (s.revealed[i] >= 1) {
              cb.onHaptic('step_advance');
            }
          }
        }
      }

      // Draw hidden truths
      const fontSize = Math.max(9, minDim * 0.018);
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < HIDDEN_TRUTHS.length; i++) {
        const ht = HIDDEN_TRUTHS[i];
        const hx = ht.xf * w;
        const hy = ht.yf * h;
        const rev = s.revealed[i];
        if (rev < 0.01) continue;

        const textColor = lerpColor(baseC, accentC, rev);
        const alpha = rev * ELEMENT_ALPHA.text.max * entrance * 1.5;

        // Shadow behind text (shrinks as revealed)
        if (rev < 1) {
          const shadowLen = minDim * 0.08 * (1 - rev);
          ctx.fillStyle = rgba(baseC, (1 - rev) * 0.02 * entrance);
          ctx.fillRect(hx - minDim * 0.08, hy + fontSize * 0.5, minDim * 0.16, shadowLen);
        }

        // Dot indicator
        const dotR = minDim * 0.004 * easeOutCubic(rev);
        ctx.beginPath();
        ctx.arc(hx, hy - fontSize, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(textColor, alpha);
        ctx.fill();

        // Text
        ctx.fillStyle = rgba(textColor, alpha);
        ctx.fillText(ht.label, hx, hy);
      }

      // Check completion
      const allRevealed = s.revealed.every(r => r >= 1);
      if (allRevealed && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.revealed.reduce((a, b) => a + b, 0) / HIDDEN_TRUTHS.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const updateLight = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.lightX = (e.clientX - rect.left) / rect.width * viewport.width;
      stateRef.current.lightY = (e.clientY - rect.top) / rect.height * viewport.height;
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.lightActive = true;
      updateLight(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => { if (stateRef.current.lightActive) updateLight(e); };
    const onUp = (e: PointerEvent) => {
      stateRef.current.lightActive = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}