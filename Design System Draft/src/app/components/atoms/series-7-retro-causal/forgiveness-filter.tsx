/**
 * ATOM 067: THE FORGIVENESS FILTER ENGINE
 * =========================================
 * Series 7 — Retro-Causal · Position 7
 *
 * Anger requires a monster. Forgiveness requires seeing the
 * terrified child inside the monster suit. Place two fingers
 * and pull apart — the massive shadow splits, revealing a
 * tiny, fragile, shivering light at the exact centre.
 *
 * PHYSICS:
 *   - Towering sharp-edged shadow dominates the screen
 *   - Two-finger spread (or single-finger drag outward) splits shadow
 *   - Shadow halves fade + separate as split increases
 *   - Inner light: tiny radial gradient, shimmers, grows slightly
 *   - Breath coupling modulates inner light pulse
 *
 * INTERACTION:
 *   Pinch-out (two-finger spread) → splits shadow
 *   Fallback: single-finger horizontal drag from centre
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Shadow halves separate instantly on gesture
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

const SHADOW_DARK: RGB = [25, 20, 35];
const SHADOW_EDGE: RGB = [40, 30, 50];
const LIGHT_CORE: RGB = [240, 220, 180];
const LIGHT_WARM: RGB = [255, 240, 200];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const SHADOW_POINTS = 14; // vertices per half
const MAX_SPLIT_RATIO = 0.4; // of viewport width
const LIGHT_MIN_R_RATIO = 0.015;
const LIGHT_MAX_R_RATIO = 0.04;

// =====================================================================
// GENERATE SHADOW VERTICES
// =====================================================================

function generateShadowHalf(
  minDim: number, cy: number, isLeft: boolean, seed: number,
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const h = minDim * 0.7;
  const w = minDim * 0.25;
  const startY = cy - h / 2;

  for (let i = 0; i < SHADOW_POINTS; i++) {
    const t = i / (SHADOW_POINTS - 1);
    const y = startY + t * h;
    // Jagged edge: random inward spikes
    const noise = Math.sin(seed + i * 5.7) * 0.35 + Math.sin(seed + i * 11.3) * 0.15;
    const baseX = w * (0.6 + noise * 0.4);
    const x = isLeft ? -baseX : baseX;
    pts.push({ x, y });
  }
  return pts;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function ForgivenessFilterAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    splitT: 0, // 0 = closed, 1 = fully open
    targetSplitT: 0,
    // Multi-touch tracking
    pointers: new Map<number, { x: number; y: number }>(),
    initialPinchDist: 0,
    // Single-touch fallback
    singleDragStartX: 0,
    isSingleDragging: false,
    // Shadow halves
    leftHalf: null as { x: number; y: number }[] | null,
    rightHalf: null as { x: number; y: number }[] | null,
    resolved: false,
    hapticSent: false,
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
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.pointers.set(e.pointerId, { x: px, y: py });

      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        s.initialPinchDist = Math.sqrt(dx * dx + dy * dy);
      } else if (s.pointers.size === 1) {
        s.singleDragStartX = px;
        s.isSingleDragging = true;
      }

      if (!s.hapticSent) {
        onHaptic('hold_start');
        s.hapticSent = true;
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      if (!s.pointers.has(e.pointerId)) return;
      s.pointers.set(e.pointerId, { x: px, y: py });

      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = dist - s.initialPinchDist;
        const maxDelta = w * MAX_SPLIT_RATIO;
        s.targetSplitT = Math.max(0, Math.min(1, delta / maxDelta));
      } else if (s.isSingleDragging) {
        const delta = Math.abs(px - s.singleDragStartX);
        const maxDelta = w * MAX_SPLIT_RATIO * 0.6;
        s.targetSplitT = Math.max(s.targetSplitT, Math.min(1, delta / maxDelta));
      }

      if (s.targetSplitT > 0.3 && s.splitT <= 0.3) onHaptic('drag_snap');
      if (s.targetSplitT > 0.6 && s.splitT <= 0.6) onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.pointers.delete(e.pointerId);

      if (s.pointers.size === 0) {
        s.isSingleDragging = false;
        if (s.targetSplitT > 0.85 && !s.resolved) {
          s.targetSplitT = 1;
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      // Entrance
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Split smoothing
      const splitLerp = p.reducedMotion ? 0.4 : 0.05;
      s.splitT += (s.targetSplitT - s.splitT) * splitLerp;

      onStateChange?.(s.splitT);

      const primaryRgb = parseColor(p.color);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);
      const { cx, cy } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Generate shadow halves once
      if (!s.leftHalf) {
        s.leftHalf = generateShadowHalf(minDim, cy, true, 17);
        s.rightHalf = generateShadowHalf(minDim, cy, false, 31);
      }

      const splitOffset = s.splitT * minDim * 0.25;
      const shadowAlpha = ELEMENT_ALPHA.primary.max * ent * (1 - s.splitT * 0.8);
      const darkCol = lerpColor(SHADOW_DARK, primaryRgb, 0.02);
      const edgeCol = lerpColor(SHADOW_EDGE, primaryRgb, 0.03);

      // ── Inner light (drawn first, behind shadows) ──────
      const lightR = minDim * (LIGHT_MIN_R_RATIO + (LIGHT_MAX_R_RATIO - LIGHT_MIN_R_RATIO) * s.splitT);
      const breathMod = p.reducedMotion ? 0 : p.breathAmplitude * lightR * 0.15;
      const shimmerX = p.reducedMotion ? 0 : Math.sin(s.frame * 0.07) * minDim * 0.001;
      const shimmerY = p.reducedMotion ? 0 : Math.cos(s.frame * 0.09) * minDim * 0.001;

      if (s.splitT > 0.1) {
        const lightAlpha = ELEMENT_ALPHA.glow.max * ent * Math.min(1, (s.splitT - 0.1) / 0.3);
        const coreCol = lerpColor(LIGHT_CORE, primaryRgb, 0.04);
        const warmCol = lerpColor(LIGHT_WARM, primaryRgb, 0.03);

        // Outer glow
        const glowR = lightR * 3;
        const outerGrad = ctx.createRadialGradient(
          cx + shimmerX, cy + shimmerY, 0,
          cx + shimmerX, cy + shimmerY, glowR + breathMod,
        );
        outerGrad.addColorStop(0, rgba(warmCol, lightAlpha * 0.4));
        outerGrad.addColorStop(1, rgba(warmCol, 0));
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(cx + shimmerX, cy + shimmerY, glowR + breathMod, 0, Math.PI * 2);
        ctx.fill();

        // Core
        const coreGrad = ctx.createRadialGradient(
          cx + shimmerX, cy + shimmerY, 0,
          cx + shimmerX, cy + shimmerY, lightR + breathMod,
        );
        coreGrad.addColorStop(0, rgba(coreCol, lightAlpha));
        coreGrad.addColorStop(0.6, rgba(coreCol, lightAlpha * 0.5));
        coreGrad.addColorStop(1, rgba(coreCol, 0));
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx + shimmerX, cy + shimmerY, lightR + breathMod, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw shadow halves ─────────────────────────────
      // Left half
      ctx.save();
      ctx.translate(cx - splitOffset, 0);
      ctx.fillStyle = rgba(darkCol, shadowAlpha);
      ctx.beginPath();
      const lh = s.leftHalf!;
      ctx.moveTo(lh[0].x, lh[0].y);
      for (let i = 1; i < lh.length; i++) ctx.lineTo(lh[i].x, lh[i].y);
      // Close along centre edge
      ctx.lineTo(0, lh[lh.length - 1].y);
      ctx.lineTo(0, lh[0].y);
      ctx.closePath();
      ctx.fill();

      // Edge highlight
      ctx.strokeStyle = rgba(edgeCol, ELEMENT_ALPHA.secondary.min * ent * (1 - s.splitT));
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.moveTo(cx, lh[0].y);
      for (let i = 1; i < lh.length; i++) ctx.lineTo(lh[i].x, lh[i].y);
      ctx.stroke();
      ctx.restore();

      // Right half
      ctx.save();
      ctx.translate(cx + splitOffset, 0);
      ctx.fillStyle = rgba(darkCol, shadowAlpha);
      ctx.beginPath();
      const rh = s.rightHalf!;
      ctx.moveTo(rh[0].x, rh[0].y);
      for (let i = 1; i < rh.length; i++) ctx.lineTo(rh[i].x, rh[i].y);
      ctx.lineTo(0, rh[rh.length - 1].y);
      ctx.lineTo(0, rh[0].y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = rgba(edgeCol, ELEMENT_ALPHA.secondary.min * ent * (1 - s.splitT));
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.moveTo(cx, rh[0].y);
      for (let i = 1; i < rh.length; i++) ctx.lineTo(rh[i].x, rh[i].y);
      ctx.stroke();
      ctx.restore();

      // ── Instruction ────────────────────────────────────
      if (s.splitT < 0.15 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const labelCol = lerpColor(SHADOW_EDGE, primaryRgb, 0.06);
        ctx.fillStyle = rgba(labelCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('pull apart the shadow', cx, h * 0.9);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
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
      }}
    />
  );
}