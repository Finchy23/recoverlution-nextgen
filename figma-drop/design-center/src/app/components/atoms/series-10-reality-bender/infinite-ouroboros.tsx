/**
 * ATOM 100: THE INFINITE ENGINE
 * ================================
 * Series 10 — Reality Bender · Position 10
 *
 * Mastery is not a destination. It is an eternal, beautiful loop.
 * The end is always the beginning. A lemniscate (∞) traced by
 * breath, accumulating light with every pass.
 *
 * PHYSICS:
 *   - Lemniscate of Bernoulli parametric path
 *   - Trace point orbits driven by breath coupling
 *   - Each complete loop adds luminous residue to the trail
 *   - Trail never fades — it accumulates forever
 *   - Crossing point pulses with each pass
 *   - No resolution — this is the infinite game
 *
 * INTERACTION:
 *   Breath → drives orbital speed
 *   Observable → pure contemplation
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static ∞ with gentle glow pulse
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const TRACE_COLOR: RGB = [200, 190, 230];
const TRACE_BRIGHT: RGB = [240, 230, 255];
const TRAIL_COLOR: RGB = [160, 150, 200];
const CROSSING_GLOW: RGB = [255, 240, 200];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// LEMNISCATE OF BERNOULLI
// Parametric: x = a*cos(t) / (1 + sin²(t))
//             y = a*sin(t)*cos(t) / (1 + sin²(t))
// =====================================================================

function lemniscateX(t: number, a: number): number {
  const s = Math.sin(t);
  return (a * Math.cos(t)) / (1 + s * s);
}

function lemniscateY(t: number, a: number): number {
  const s = Math.sin(t);
  return (a * Math.sin(t) * Math.cos(t)) / (1 + s * s);
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function InfiniteOuroborosAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    t: 0, // parametric position [0, 2π)
    loops: 0,
    lastCrossing: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // Pre-allocated trail canvas (logical coordinates, NOT DPR-scaled)
  useEffect(() => {
    const tc = document.createElement('canvas');
    tc.width = Math.round(viewport.width);
    tc.height = Math.round(viewport.height);
    trailCanvasRef.current = tc;
    return () => { trailCanvasRef.current = null; };
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const a = minDim * 0.2; // lemniscate scale

      // Advance parametric t (breath-driven)
      const baseSpeed = 0.015;
      const breathSpeed = p.reducedMotion ? 0 : p.breathAmplitude * 0.02;
      s.t += baseSpeed + breathSpeed;

      // Detect crossing (t near 0 or π)
      const tMod = s.t % (Math.PI * 2);
      const nearCrossing = tMod < 0.1 || Math.abs(tMod - Math.PI) < 0.1;
      if (nearCrossing && !s.lastCrossing) {
        s.loops += 0.5;
        onHaptic('breath_peak');
      }
      s.lastCrossing = nearCrossing;

      onStateChange?.((Math.sin(s.t * 0.5) + 1) / 2);

      // Current trace position
      const traceX = cx + lemniscateX(s.t, a);
      const traceY = cy + lemniscateY(s.t, a);

      // Accumulate on trail canvas (logical coordinates)
      const tc = trailCanvasRef.current;
      if (tc && !p.reducedMotion) {
        const tctx = tc.getContext('2d');
        if (tctx) {
          const trailCol = lerpColor(TRAIL_COLOR, primaryRgb, 0.04);
          const trailAlpha = ELEMENT_ALPHA.tertiary.max * ent * 0.3;
          tctx.fillStyle = rgba(trailCol, trailAlpha);
          tctx.beginPath();
          tctx.arc(traceX, traceY, minDim * 0.003, 0, Math.PI * 2);
          tctx.fill();
        }
      }

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw accumulated trail (logical-to-logical, no DPR conversion)
      if (tc) {
        ctx.drawImage(tc, 0, 0);
      }

      // Draw lemniscate guide path (faint)
      const guideCol = lerpColor(TRAIL_COLOR, primaryRgb, 0.04);
      ctx.strokeStyle = rgba(guideCol, ELEMENT_ALPHA.tertiary.min * ent);
      ctx.lineWidth = minDim * 0.0004;
      ctx.beginPath();
      for (let i = 0; i <= 200; i++) {
        const gt = (i / 200) * Math.PI * 2;
        const gx = cx + lemniscateX(gt, a);
        const gy = cy + lemniscateY(gt, a);
        if (i === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.closePath();
      ctx.stroke();

      // Crossing point glow
      if (nearCrossing) {
        const crossCol = lerpColor(CROSSING_GLOW, primaryRgb, 0.04);
        const crossR = minDim * 0.03;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, crossR);
        grad.addColorStop(0, rgba(crossCol, ELEMENT_ALPHA.glow.max * ent * 0.5));
        grad.addColorStop(1, rgba(crossCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, crossR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trace point (luminous dot)
      if (!p.reducedMotion) {
        const traceCol = lerpColor(TRACE_COLOR, primaryRgb, 0.04);
        const brightCol = lerpColor(TRACE_BRIGHT, primaryRgb, 0.03);

        // Glow
        const glowR = minDim * 0.015;
        const grad = ctx.createRadialGradient(traceX, traceY, 0, traceX, traceY, glowR);
        grad.addColorStop(0, rgba(brightCol, ELEMENT_ALPHA.primary.max * ent * 0.7));
        grad.addColorStop(1, rgba(traceCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(traceX, traceY, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = rgba(brightCol, ELEMENT_ALPHA.primary.max * ent);
        ctx.beginPath();
        ctx.arc(traceX, traceY, minDim * 0.003, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Static: gentle pulse on the whole path
        const pulse = (Math.sin(s.frame * 0.02) + 1) / 2;
        ctx.strokeStyle = rgba(
          lerpColor(TRACE_COLOR, primaryRgb, 0.04),
          ELEMENT_ALPHA.secondary.max * ent * (0.5 + pulse * 0.3),
        );
        ctx.lineWidth = minDim * 0.0012;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const gt = (i / 200) * Math.PI * 2;
          const gx = cx + lemniscateX(gt, a);
          const gy = cy + lemniscateY(gt, a);
          if (i === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Loop counter (subtle)
      if (s.loops > 0) {
        ctx.font = `${Math.round(minDim * 0.011)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(
          lerpColor(TRAIL_COLOR, primaryRgb, 0.05),
          ELEMENT_ALPHA.text.min * ent * 0.3,
        );
        ctx.fillText(`∞ × ${Math.floor(s.loops)}`, cx, cy + a * 0.8);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [viewport, onStateChange, onHaptic]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
      }}
    />
  );
}