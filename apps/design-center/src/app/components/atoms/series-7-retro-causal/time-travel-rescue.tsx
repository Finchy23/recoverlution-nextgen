/**
 * ATOM 069: THE TIME TRAVEL ENGINE
 * ==================================
 * Series 7 — Retro-Causal · Position 9
 *
 * A part of the psyche is still trapped in a past traumatic moment,
 * waiting to be saved. The present, sovereign adult reaches back
 * through time and physically extracts the child.
 *
 * PHYSICS:
 *   - Deep dark portal: concentric rings receding into Z-depth
 *   - Tiny vibrating light trapped at deepest point
 *   - User presses and drags upward to extract the light
 *   - Light grows larger and warmer as it surfaces
 *   - Initial friction (hard to pull free) then release
 *   - Merge with avatar outline at surface → warm radial pulse
 *
 * INTERACTION:
 *   Drag (vertical upward) → extract trapped light from depth
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No vibration, drag without resistance animation
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

const PORTAL_RING: RGB = [60, 50, 80];
const PORTAL_DEEP: RGB = [20, 15, 30];
const TRAPPED_LIGHT: RGB = [220, 200, 160];
const SURFACE_WARM: RGB = [255, 240, 200];
const AVATAR_OUTLINE: RGB = [180, 175, 195];
const MERGE_PULSE: RGB = [240, 225, 190];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const RING_COUNT = 8;
const FRICTION_ZONE = 0.2; // first 20% of drag has 0.3x multiplier
const FRICTION_MULTIPLIER = 0.3;
const LIGHT_MIN_SIZE_RATIO = 0.005;
const LIGHT_MAX_SIZE_RATIO = 0.035;

// =====================================================================
// COMPONENT
// =====================================================================

export default function TimeTravelRescueAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    depthT: 0, // 0 = trapped at bottom, 1 = fully surfaced
    targetDepthT: 0,
    isDragging: false,
    dragStartY: 0,
    dragStartT: 0,
    lastLayer: -1,
    merged: false,
    mergeGlow: 0,
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

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.resolved) return;
      s.isDragging = true;
      s.dragStartY = e.clientY;
      s.dragStartT = s.depthT;
      onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const deltaY = s.dragStartY - e.clientY;
      const range = h * 0.5;
      let rawT = s.dragStartT + deltaY / range;
      if (rawT < FRICTION_ZONE && s.dragStartT < FRICTION_ZONE) {
        const frictionDelta = (rawT - s.dragStartT) * FRICTION_MULTIPLIER;
        rawT = s.dragStartT + frictionDelta;
      }
      s.targetDepthT = Math.max(0, Math.min(1, rawT));
      const layer = Math.floor(s.targetDepthT * RING_COUNT);
      if (layer !== s.lastLayer && layer > s.lastLayer) {
        s.lastLayer = layer;
        onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isDragging = false;
      if (s.targetDepthT > 0.9 && !s.resolved) {
        s.targetDepthT = 1;
        s.merged = true;
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

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Depth smoothing
      const depthLerp = p.reducedMotion ? 0.3 : 0.06;
      s.depthT += (s.targetDepthT - s.depthT) * depthLerp;

      // Merge glow
      if (s.merged) {
        s.mergeGlow = Math.min(1, s.mergeGlow + 0.02);
        if (s.mergeGlow > 0.8 && !s.resolved) {
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }

      onStateChange?.(s.depthT);

      const primaryRgb = parseColor(p.color);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Portal rings ───────────────────────────────────
      const maxR = minDim * 0.35;
      const ringCol = lerpColor(PORTAL_RING, primaryRgb, 0.04);
      const deepCol = lerpColor(PORTAL_DEEP, primaryRgb, 0.02);

      // Deep darkness at centre
      const deepR = maxR * 0.15;
      const deepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      deepGrad.addColorStop(0, rgba(deepCol, ELEMENT_ALPHA.secondary.max * ent));
      deepGrad.addColorStop(1, rgba(deepCol, 0));
      ctx.fillStyle = deepGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
      ctx.fill();

      // Concentric rings (perspective: inner = deeper)
      for (let i = 0; i < RING_COUNT; i++) {
        const depth = (RING_COUNT - i) / RING_COUNT;
        const r = maxR * (0.12 + 0.88 * (i / RING_COUNT));
        const ringAlpha = ELEMENT_ALPHA.secondary.min * ent * (0.5 + depth * 0.5);

        // Slight parallax offset per ring
        const offsetX = p.reducedMotion ? 0 : Math.sin(s.frame * 0.005 + i * 0.8) * depth * minDim * 0.003;
        const offsetY = p.reducedMotion ? 0 : Math.cos(s.frame * 0.007 + i * 1.1) * depth * minDim * 0.003;

        ctx.strokeStyle = rgba(ringCol, ringAlpha);
        ctx.lineWidth = minDim * (0.0006 + (1 - depth) * 0.0006);
        ctx.beginPath();
        ctx.ellipse(cx + offsetX, cy + offsetY, r, r * 0.85, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ── Trapped / rescued light ────────────────────────
      // Position: at depth 0 = deepest centre, at depth 1 = top of portal
      const lightDepth = 1 - s.depthT;
      const lightR = minDim * (LIGHT_MIN_SIZE_RATIO + (LIGHT_MAX_SIZE_RATIO - LIGHT_MIN_SIZE_RATIO) * s.depthT);
      const lightY = cy + (maxR * 0.6) * (1 - s.depthT) - (maxR * 0.3) * s.depthT;
      const lightX = cx;

      // Vibration (trapped state)
      const vibX = p.reducedMotion ? 0 : (1 - s.depthT) * (Math.random() - 0.5) * minDim * 0.003;
      const vibY = p.reducedMotion ? 0 : (1 - s.depthT) * (Math.random() - 0.5) * minDim * 0.003;

      const lightCol = lerpColor(
        lerpColor(TRAPPED_LIGHT, primaryRgb, 0.04),
        lerpColor(SURFACE_WARM, primaryRgb, 0.03),
        s.depthT,
      );
      const lightAlpha = ELEMENT_ALPHA.primary.min + (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min) * (0.3 + s.depthT * 0.7);

      // Outer glow
      const glowR = lightR * 3;
      const grad = ctx.createRadialGradient(
        lightX + vibX, lightY + vibY, 0,
        lightX + vibX, lightY + vibY, glowR,
      );
      grad.addColorStop(0, rgba(lightCol, lightAlpha * ent * 0.5));
      grad.addColorStop(1, rgba(lightCol, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lightX + vibX, lightY + vibY, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Core
      const coreGrad = ctx.createRadialGradient(
        lightX + vibX, lightY + vibY, 0,
        lightX + vibX, lightY + vibY, lightR,
      );
      coreGrad.addColorStop(0, rgba(lightCol, lightAlpha * ent));
      coreGrad.addColorStop(1, rgba(lightCol, lightAlpha * ent * 0.3));
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(lightX + vibX, lightY + vibY, lightR, 0, Math.PI * 2);
      ctx.fill();

      // ── Avatar outline (at surface) ────────────────────
      const avatarY = cy - maxR * 0.45;
      const avatarR = minDim * 0.025;
      const avatarCol = lerpColor(AVATAR_OUTLINE, primaryRgb, 0.04);
      const avatarAlpha = ELEMENT_ALPHA.secondary.min * ent;

      ctx.strokeStyle = rgba(avatarCol, avatarAlpha);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.moveTo(cx - minDim * 0.08, cy);
      ctx.lineTo(cx + minDim * 0.08, cy);
      ctx.stroke();

      // ── Merge pulse ────────────────────────────────────
      if (s.mergeGlow > 0) {
        const pulseR = minDim * 0.12 * s.mergeGlow;
        const pulseCol = lerpColor(MERGE_PULSE, primaryRgb, 0.04);
        const pulseGrad = ctx.createRadialGradient(cx, avatarY, 0, cx, avatarY, pulseR);
        pulseGrad.addColorStop(0, rgba(pulseCol, ELEMENT_ALPHA.glow.max * ent * s.mergeGlow * 0.6));
        pulseGrad.addColorStop(1, rgba(pulseCol, 0));
        ctx.fillStyle = pulseGrad;
        ctx.beginPath();
        ctx.arc(cx, avatarY, pulseR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Instruction ────────────────────────────────────
      if (s.depthT < 0.1 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const labelCol = lerpColor(PORTAL_RING, primaryRgb, 0.06);
        ctx.fillStyle = rgba(labelCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('reach in and pull them out', cx, h * 0.9);
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