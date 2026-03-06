/**
 * ATOM 075: THE EGO ZOOM ENGINE
 * ================================
 * Series 8 — Kinematic Topology · Position 5
 *
 * A guided expansion of identity. Press and hold — concentric
 * rings of light ripple outward: Body → Home → City → Country
 * → Species → Earth → Cosmos. Each ring pushes back the dark.
 *
 * PHYSICS:
 *   - Hold triggers sequential ring emissions (one every 60 frames)
 *   - Each ring expands outward with breath-coupled speed
 *   - Labels appear at ring's initial position
 *   - Dark vignette shrinks as rings expand
 *   - 7 identity layers total
 *
 * INTERACTION:
 *   Hold → emit identity rings
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: All rings appear simultaneously at final positions
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE & LABELS
// =====================================================================

const RING_INNER: RGB = [200, 180, 140];
const RING_OUTER: RGB = [100, 140, 200];
const LABEL_COLOR: RGB = [180, 175, 190];
const VIGNETTE: RGB = [8, 6, 14];
const BG_BASE: RGB = [18, 16, 24];

const IDENTITY_LAYERS = [
  'Body', 'Home', 'City', 'Country', 'Species', 'Earth', 'Cosmos',
];
const RING_EMIT_INTERVAL = 50; // frames between emissions

// =====================================================================
// COMPONENT
// =====================================================================

export default function EgoZoomAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    isHolding: false,
    holdFrames: 0,
    ringsEmitted: 0,
    ringRadii: new Float32Array(7), // current radius for each ring
    ringAlphas: new Float32Array(7),
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isHolding = true;
      s.holdFrames = 0;
      if (propsRef.current.reducedMotion) {
        for (let i = 0; i < 7; i++) {
          s.ringRadii[i] = minDim * 0.06 * (i + 1);
          s.ringAlphas[i] = 1;
        }
        s.ringsEmitted = 7;
        s.resolved = true;
        onHaptic('completion');
        onResolve?.();
      }
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
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const accentRgb = parseColor(p.accentColor);
      const { cx, cy } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Hold → emit rings
      if (s.isHolding && !p.reducedMotion) {
        s.holdFrames++;
        const nextRingFrame = s.ringsEmitted * RING_EMIT_INTERVAL;
        if (s.holdFrames > nextRingFrame && s.ringsEmitted < 7) {
          s.ringsEmitted++;
          onHaptic('breath_peak');
          if (s.ringsEmitted >= 7 && !s.resolved) {
            s.resolved = true;
            onHaptic('completion');
            onResolve?.();
          }
        }
      }

      // Expand active rings
      if (!p.reducedMotion) {
        const breathMod = 1 + p.breathAmplitude * 0.3;
        for (let i = 0; i < s.ringsEmitted; i++) {
          const maxR = minDim * 0.06 * (i + 1);
          if (s.ringRadii[i] < maxR) {
            s.ringRadii[i] += minDim * 0.0024 * breathMod;
            s.ringAlphas[i] = Math.min(1, s.ringAlphas[i] + 0.02);
          } else {
            // Fade slightly once expanded
            s.ringAlphas[i] = Math.max(0.5, s.ringAlphas[i] - 0.001);
          }
        }
      }

      onStateChange?.(s.ringsEmitted / 7);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Vignette (shrinks as rings expand) ─────────────
      const vigRadius = minDim * 0.1 + (s.ringsEmitted / 7) * minDim * 0.4;
      const vigCol = lerpColor(VIGNETTE, primaryRgb, 0.01);
      const vigGrad = ctx.createRadialGradient(cx, cy, vigRadius * 0.5, cx, cy, minDim * 0.55);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(1, rgba(vigCol, ELEMENT_ALPHA.secondary.max * ent * (1 - s.ringsEmitted / 7 * 0.7)));
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Draw rings ─────────────────────────────────────
      for (let i = 0; i < s.ringsEmitted; i++) {
        const r = s.ringRadii[i];
        const a = s.ringAlphas[i];
        if (r <= 0) continue;

        const t = i / 6;
        const ringCol = lerpColor(
          lerpColor(RING_INNER, primaryRgb, 0.04),
          lerpColor(RING_OUTER, accentRgb, 0.06),
          t,
        );
        const ringAlpha = ELEMENT_ALPHA.secondary.max * ent * a;

        ctx.strokeStyle = rgba(ringCol, ringAlpha);
        ctx.lineWidth = minDim * 0.0006;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Label at ring's settled position
        if (a > 0.3) {
          const labelAlpha = ELEMENT_ALPHA.text.min * ent * Math.min(1, a) * 0.5;
          const labelCol = lerpColor(LABEL_COLOR, primaryRgb, 0.05);
          ctx.font = `${Math.round(minDim * 0.012)}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = rgba(labelCol, labelAlpha);
          ctx.fillText(IDENTITY_LAYERS[i], cx, cy - r - minDim * 0.008);
        }
      }

      // ── Centre point ───────────────────────────────────
      const centreCol = lerpColor(RING_INNER, primaryRgb, 0.04);
      ctx.fillStyle = rgba(centreCol, ELEMENT_ALPHA.primary.min * ent);
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.006, 0, Math.PI * 2);
      ctx.fill();

      // ── Instruction ────────────────────────────────────
      if (s.ringsEmitted === 0) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(LABEL_COLOR, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('press and hold to expand', cx, h * 0.9);
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
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
        cursor: 'pointer',
      }}
    />
  );
}