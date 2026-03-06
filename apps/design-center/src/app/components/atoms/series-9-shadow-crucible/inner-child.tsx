/**
 * ATOM 089: THE INNER CHILD ENGINE
 * Series 9 — Shadow & Crucible · Position 9
 * Drop the armour. Concentric spinning rings shed one by one on gentle hold.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const RING_METAL: RGB = [100, 95, 115];
const RING_SHEDDING: RGB = [80, 75, 95];
const CORE_WARM: RGB = [220, 190, 150];
const CORE_GLOW: RGB = [240, 220, 180];
const BG_BASE: RGB = [18, 16, 24];

const RING_COUNT = 4;
const HOLD_PER_RING = 60; // 1s per ring

export default function InnerChildAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0, isHolding: false, holdFrames: 0,
    ringsDropped: 0, ringAngles: [0, 0.5, 1, 1.5],
    ringAlphas: [1, 1, 1, 1], coreReveal: 0,
    resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.isHolding = true; stateRef.current.holdFrames = 0;
      onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isHolding = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;
    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;

      if (s.isHolding && !s.resolved) {
        s.holdFrames++;
        const ringToShed = Math.floor(s.holdFrames / HOLD_PER_RING);
        if (ringToShed > s.ringsDropped && s.ringsDropped < RING_COUNT) {
          s.ringsDropped = Math.min(RING_COUNT, ringToShed);
          onHaptic('step_advance');
        }
      }

      // Fade shed rings
      for (let i = 0; i < RING_COUNT; i++) {
        if (i < s.ringsDropped) {
          s.ringAlphas[i] = Math.max(0, s.ringAlphas[i] - 0.02);
        }
      }

      // Core reveal
      s.coreReveal = Math.min(1, s.ringsDropped / RING_COUNT);
      if (s.ringsDropped >= RING_COUNT && !s.resolved) {
        s.resolved = true; onHaptic('completion'); onResolve?.();
      }
      onStateChange?.(s.coreReveal);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Core glow (breath-synced)
      if (s.coreReveal > 0) {
        const bPulse = p.reducedMotion ? 0 : p.breathAmplitude * 0.2;
        const coreR = minDim * 0.03 * s.coreReveal * (1 + bPulse);
        const glowR = coreR * 4;
        const glowCol = lerpColor(CORE_GLOW, primaryRgb, 0.04);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        grad.addColorStop(0, rgba(glowCol, ELEMENT_ALPHA.glow.max * ent * s.coreReveal * 0.5));
        grad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();

        const coreCol = lerpColor(CORE_WARM, primaryRgb, 0.04);
        ctx.fillStyle = rgba(coreCol, ELEMENT_ALPHA.primary.max * ent * s.coreReveal);
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fill();
      }

      // Rings (outer to inner, shed outer first)
      const ringCol = lerpColor(RING_METAL, primaryRgb, 0.04);
      const shedCol = lerpColor(RING_SHEDDING, primaryRgb, 0.04);
      for (let i = RING_COUNT - 1; i >= 0; i--) {
        if (s.ringAlphas[i] < 0.01) continue;
        const r = minDim * (0.06 + i * 0.03);
        if (!p.reducedMotion) {
          s.ringAngles[i] += (0.02 - i * 0.004) * (1 - s.coreReveal * 0.8);
        }
        const isShedding = i < s.ringsDropped;
        const col = isShedding ? shedCol : ringCol;
        const alpha = ELEMENT_ALPHA.primary.max * ent * s.ringAlphas[i];

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.ringAngles[i]);

        // Ring arc segments
        for (let seg = 0; seg < 3; seg++) {
          const sa = (seg / 3) * Math.PI * 2;
          const ea = sa + Math.PI * 0.55;
          ctx.strokeStyle = rgba(col, alpha);
          ctx.lineWidth = minDim * 0.002;
          ctx.beginPath();
          ctx.arc(0, 0, r + (isShedding ? s.frame * minDim * 0.00003 * (1 - s.ringAlphas[i]) : 0), sa, ea);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (!s.resolved && s.ringsDropped === 0) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(RING_METAL, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('hold gently to drop the armour', cx, h * 0.9);
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'pointer' }}
    />
  );
}