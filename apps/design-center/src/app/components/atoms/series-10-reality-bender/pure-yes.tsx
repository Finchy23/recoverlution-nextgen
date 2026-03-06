/**
 * ATOM 099: THE PURE YES ENGINE
 * Series 10 — Reality Bender · Position 9
 * Zero friction. Zero limit. Hold to expand infinitely.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const BLOOM_CORE: RGB = [255, 240, 200];
const BLOOM_WARM: RGB = [240, 210, 140];
const BLOOM_OUTER: RGB = [200, 160, 100];
const RING_COLOR: RGB = [220, 200, 160];
const BG_BASE: RGB = [18, 16, 24];

export default function PureYesAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0, isHolding: false,
    bloomR: 0, bloomAccel: 0, rings: [] as { r: number; alpha: number }[],
    ringTimer: 0, hapticSent: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      stateRef.current.isHolding = true;
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

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Bloom expansion
      if (s.isHolding) {
        s.bloomAccel += minDim * 0.00004; // frictionless acceleration
        s.bloomR += s.bloomAccel;

        // Emit rings periodically
        s.ringTimer++;
        if (s.ringTimer > 30) {
          s.rings.push({ r: s.bloomR, alpha: ELEMENT_ALPHA.secondary.max });
          s.ringTimer = 0;
          if (!s.hapticSent) { onHaptic('breath_peak'); s.hapticSent = true; }
          else onHaptic('breath_peak');
        }
      } else {
        s.bloomAccel = Math.max(0, s.bloomAccel - 0.01);
        if (s.bloomAccel > 0) s.bloomR += s.bloomAccel;
      }

      // Expand and fade rings
      const ringSpeed = minDim * 0.003;
      for (const ring of s.rings) {
        ring.r += ringSpeed;
        ring.alpha *= 0.985;
      }
      s.rings = s.rings.filter(r => r.alpha > 0.002);

      // No resolution — infinite game. Report continuous state.
      const maxR = Math.max(w, h);
      onStateChange?.(Math.min(1, s.bloomR / maxR));

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Background warmth proportional to bloom
      const warmth = Math.min(1, s.bloomR / (minDim * 0.5));
      if (warmth > 0) {
        const warmGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, s.bloomR));
        warmGrad.addColorStop(0, rgba(lerpColor(BLOOM_WARM, primaryRgb, 0.04), ELEMENT_ALPHA.secondary.min * ent * warmth));
        warmGrad.addColorStop(1, rgba(lerpColor(BLOOM_OUTER, primaryRgb, 0.04), 0));
        ctx.fillStyle = warmGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Rings
      const ringCol = lerpColor(RING_COLOR, primaryRgb, 0.04);
      for (const ring of s.rings) {
        ctx.strokeStyle = rgba(ringCol, ring.alpha * ent);
        ctx.lineWidth = minDim * 0.0006;
        ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2); ctx.stroke();
      }

      // Core bloom
      if (s.bloomR > 0) {
        const breathMod = p.reducedMotion ? 0 : p.breathAmplitude * s.bloomR * 0.05;
        const coreR = Math.min(s.bloomR, minDim * 0.15) + breathMod;
        const coreCol = lerpColor(BLOOM_CORE, primaryRgb, 0.03);
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        coreGrad.addColorStop(0, rgba(coreCol, ELEMENT_ALPHA.primary.max * ent * 0.8));
        coreGrad.addColorStop(0.5, rgba(coreCol, ELEMENT_ALPHA.primary.min * ent * 0.5));
        coreGrad.addColorStop(1, rgba(coreCol, 0));
        ctx.fillStyle = coreGrad;
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fill();
      }

      // Instruction
      if (s.bloomR < minDim * 0.01) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(BLOOM_WARM, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('hold to say yes', cx, h * 0.85);
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
  }, [viewport, onStateChange, onHaptic]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'pointer' }}
    />
  );
}