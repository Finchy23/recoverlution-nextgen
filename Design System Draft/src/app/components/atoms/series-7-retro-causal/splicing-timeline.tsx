/**
 * ATOM 064: THE SPLICING ENGINE
 * ===============================
 * Series 7 — Retro-Causal · Position 4
 *
 * Depression is an editor that selectively cuts out all the light,
 * leaving only the dark frames. This atom requires the user to
 * manually splice the "good part" back into the timeline.
 *
 * PHYSICS:
 *   - Horizontal filmstrip of 8 frames with a 3-frame dark gap
 *   - Bright draggable clip fragment in staging area below
 *   - Magnetic snap engages within proximity threshold
 *   - Post-snap illumination cascade left-to-right
 *
 * INTERACTION:
 *   Drag → move clip toward gap, magnetic snap locks it
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Clip teleports on release near target, instant cascade
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo, easeOutCubic, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const FRAME_WARM: RGB = [180, 155, 120];
const FRAME_DIM: RGB = [60, 55, 70];
const GAP_OUTLINE: RGB = [80, 70, 90];
const CLIP_BRIGHT: RGB = [230, 200, 120];
const ILLUMINATION: RGB = [255, 230, 160];
const BG_BASE: RGB = [18, 16, 24];
const SPROCKET: RGB = [50, 48, 58];

// =====================================================================
// CONSTANTS
// =====================================================================

const TOTAL_FRAMES = 8;
const GAP_START = 3; // frames 3,4,5 are the gap (0-indexed)
const GAP_COUNT = 3;
const SNAP_DISTANCE_RATIO = 0.04; // of minDim
const SNAP_LERP = 0.2;
const CASCADE_DELAY = 6; // frames between each strip illumination

// =====================================================================
// COMPONENT
// =====================================================================

export default function SplicingTimelineAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    // Clip position (relative to viewport)
    clipX: 0,
    clipY: 0,
    clipHomeX: 0,
    clipHomeY: 0,
    // Interaction
    isDragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    // Snap state
    isSnapping: false,
    snapProgress: 0,
    snapTargetX: 0,
    snapTargetY: 0,
    // Cascade
    cascadeFrame: -1, // -1 = not started
    frameAlphas: new Float32Array(TOTAL_FRAMES), // illumination per frame
    // Resolution
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
    const cx = w / 2;
    const cy = h / 2;

    const frameW = minDim * 0.075;
    const frameH = minDim * 0.055;
    const gap = minDim * 0.012;
    const stripW = TOTAL_FRAMES * (frameW + gap) - gap;
    const stripX = cx - stripW / 2;
    const stripY = cy - frameH / 2;
    const gapCenterIdx = GAP_START + GAP_COUNT / 2;
    const gapCenterX = stripX + gapCenterIdx * (frameW + gap) - gap / 2;
    const gapCenterY = stripY + frameH / 2;
    const clipHomeX = cx;
    const clipHomeY = cy + minDim * 0.18;
    const clipW = GAP_COUNT * (frameW + gap) - gap;
    const clipH = frameH;

    const layout = { w, h, cx, cy, minDim, frameW, frameH, gap, stripX, stripY, stripW, gapCenterX, gapCenterY, clipHomeX, clipHomeY, clipW, clipH };

    // Init clip position
    const s = stateRef.current;
    if (!s.clipHomeX && !s.clipHomeY) {
      s.clipX = clipHomeX;
      s.clipY = clipHomeY;
      s.clipHomeX = clipHomeX;
      s.clipHomeY = clipHomeY;
    }

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      if (s.isSnapping || s.resolved) return;
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const dx = px - s.clipX;
      const dy = py - s.clipY;
      if (Math.abs(dx) < clipW / 2 + minDim * 0.015 && Math.abs(dy) < clipH / 2 + minDim * 0.015) {
        s.isDragging = true;
        s.dragOffsetX = dx;
        s.dragOffsetY = dy;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      s.clipX = (e.clientX - rect.left) / rect.width * w - s.dragOffsetX;
      s.clipY = (e.clientY - rect.top) / rect.height * h - s.dragOffsetY;
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      if (!s.isDragging) return;
      s.isDragging = false;
      const dx = s.clipX - gapCenterX;
      const dy = s.clipY - gapCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < SNAP_DISTANCE_RATIO * minDim + clipW * 0.3) {
        s.isSnapping = true;
        s.snapProgress = 0;
        s.snapTargetX = gapCenterX;
        s.snapTargetY = gapCenterY;
        onHaptic('drag_snap');
        if (propsRef.current.reducedMotion) {
          s.clipX = gapCenterX;
          s.clipY = gapCenterY;
          s.isSnapping = false;
          s.cascadeFrame = 0;
          for (let i = 0; i < TOTAL_FRAMES; i++) s.frameAlphas[i] = 1;
          s.resolved = true;
          onHaptic('seal_stamp');
          onHaptic('completion');
          onResolve?.();
        }
      } else {
        s.clipX = clipHomeX;
        s.clipY = clipHomeY;
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

      const primaryRgb = parseColor(p.color);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);

      // Canvas setup
      const { w, h, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(layout.cx, layout.cy, 0, layout.cx, layout.cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Snap animation
      if (s.isSnapping && !p.reducedMotion) {
        s.snapProgress = Math.min(1, s.snapProgress + SNAP_LERP);
        const ease = easeOutCubic(s.snapProgress);
        s.clipX += (s.snapTargetX - s.clipX) * SNAP_LERP;
        s.clipY += (s.snapTargetY - s.clipY) * SNAP_LERP;

        if (s.snapProgress >= 0.95) {
          s.clipX = s.snapTargetX;
          s.clipY = s.snapTargetY;
          s.isSnapping = false;
          s.cascadeFrame = 0;
          onHaptic('seal_stamp');
        }
      }

      // Cascade animation
      if (s.cascadeFrame >= 0 && !s.resolved) {
        s.cascadeFrame++;
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          const triggerFrame = i * CASCADE_DELAY;
          if (s.cascadeFrame > triggerFrame) {
            const t = Math.min(1, (s.cascadeFrame - triggerFrame) / 20);
            s.frameAlphas[i] = Math.max(s.frameAlphas[i], easeOutExpo(t));
          }
        }
        // Check if cascade complete
        if (s.cascadeFrame > TOTAL_FRAMES * CASCADE_DELAY + 20) {
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }

      // Report state
      const progress = s.resolved ? 1 : s.isSnapping ? 0.5 : 0;
      onStateChange?.(progress);

      // ── Draw filmstrip ─────────────────────────────────
      const { frameW, frameH, gap, stripX, stripY, clipW, clipH } = layout;

      // Sprocket holes (top and bottom of strip)
      const sprocketCol = lerpColor(SPROCKET, primaryRgb, 0.03);
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const fx = stripX + i * (frameW + gap);
        const sprocketSize = minDim * 0.008;
        // Top sprockets
        ctx.fillStyle = rgba(sprocketCol, ELEMENT_ALPHA.tertiary.max * ent);
        ctx.fillRect(fx + frameW * 0.15, stripY - sprocketSize * 2.5, sprocketSize, sprocketSize);
        ctx.fillRect(fx + frameW * 0.55, stripY - sprocketSize * 2.5, sprocketSize, sprocketSize);
        // Bottom sprockets
        ctx.fillRect(fx + frameW * 0.15, stripY + frameH + sprocketSize * 1, sprocketSize, sprocketSize);
        ctx.fillRect(fx + frameW * 0.55, stripY + frameH + sprocketSize * 1, sprocketSize, sprocketSize);
      }

      // Draw frames
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const isGap = i >= GAP_START && i < GAP_START + GAP_COUNT;
        const fx = stripX + i * (frameW + gap);
        const illumination = s.frameAlphas[i];

        if (isGap && !s.resolved && s.cascadeFrame < 0) {
          // Empty gap — dashed outline
          ctx.strokeStyle = rgba(
            lerpColor(GAP_OUTLINE, primaryRgb, 0.04),
            ELEMENT_ALPHA.secondary.min * ent,
          );
          ctx.lineWidth = minDim * 0.0006;
          const dash = minDim * 0.004;
          ctx.setLineDash([dash, dash]);
          ctx.strokeRect(fx, stripY, frameW, frameH);
          ctx.setLineDash([]);
        } else {
          // Filled frame
          const baseAlpha = isGap
            ? ELEMENT_ALPHA.primary.min * ent * (s.cascadeFrame >= 0 ? 1 : 0)
            : ELEMENT_ALPHA.primary.min * ent;
          const warmAlpha = baseAlpha + illumination * (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min) * ent;

          const frameCol = lerpColor(
            lerpColor(FRAME_DIM, primaryRgb, 0.03),
            lerpColor(FRAME_WARM, primaryRgb, 0.03),
            0.3 + illumination * 0.7,
          );
          ctx.fillStyle = rgba(frameCol, warmAlpha);
          ctx.fillRect(fx, stripY, frameW, frameH);

          // Inner content suggestion (small rects)
          const innerCol = lerpColor(ILLUMINATION, primaryRgb, 0.04);
          ctx.fillStyle = rgba(innerCol, ELEMENT_ALPHA.tertiary.max * ent * (0.3 + illumination * 0.7));
          ctx.fillRect(fx + frameW * 0.2, stripY + frameH * 0.3, frameW * 0.3, frameH * 0.15);
          ctx.fillRect(fx + frameW * 0.15, stripY + frameH * 0.55, frameW * 0.5, frameH * 0.1);

          // Illumination glow
          if (illumination > 0.1) {
            const glowAlpha = ELEMENT_ALPHA.glow.min * ent * illumination;
            const grad = ctx.createRadialGradient(
              fx + frameW / 2, stripY + frameH / 2, 0,
              fx + frameW / 2, stripY + frameH / 2, frameW * 0.8,
            );
            grad.addColorStop(0, rgba(lerpColor(ILLUMINATION, primaryRgb, 0.04), glowAlpha));
            grad.addColorStop(1, rgba(lerpColor(ILLUMINATION, primaryRgb, 0.04), 0));
            ctx.fillStyle = grad;
            ctx.fillRect(fx - frameW * 0.3, stripY - frameH * 0.3, frameW * 1.6, frameH * 1.6);
          }
        }
      }

      // ── Draw draggable clip (if not snapped into gap) ──
      if (!s.resolved || s.cascadeFrame < TOTAL_FRAMES * CASCADE_DELAY) {
        const isInGap = s.cascadeFrame >= 0;
        if (!isInGap) {
          const clipCol = lerpColor(CLIP_BRIGHT, primaryRgb, 0.04);
          const clipAlpha = ELEMENT_ALPHA.primary.max * ent;

          // Clip glow
          const glowR = Math.max(clipW, clipH) * 0.6;
          const breathPulse = p.reducedMotion ? 0 : p.breathAmplitude * 0.1;
          const grad = ctx.createRadialGradient(
            s.clipX, s.clipY, 0,
            s.clipX, s.clipY, glowR * (1 + breathPulse),
          );
          grad.addColorStop(0, rgba(clipCol, ELEMENT_ALPHA.glow.max * ent * 0.5));
          grad.addColorStop(1, rgba(clipCol, 0));
          ctx.fillStyle = grad;
          ctx.fillRect(s.clipX - glowR, s.clipY - glowR, glowR * 2, glowR * 2);

          // Clip body
          ctx.fillStyle = rgba(clipCol, clipAlpha);
          ctx.fillRect(s.clipX - clipW / 2, s.clipY - clipH / 2, clipW, clipH);

          // Clip inner detail
          ctx.fillStyle = rgba(lerpColor(ILLUMINATION, primaryRgb, 0.03), ELEMENT_ALPHA.secondary.max * ent);
          ctx.fillRect(s.clipX - clipW * 0.3, s.clipY - clipH * 0.15, clipW * 0.6, clipH * 0.1);

          // Border
          ctx.strokeStyle = rgba(clipCol, ELEMENT_ALPHA.secondary.max * ent);
          ctx.lineWidth = minDim * 0.0006;
          ctx.strokeRect(s.clipX - clipW / 2, s.clipY - clipH / 2, clipW, clipH);
        }
      }

      // ── Instruction ────────────────────────────────────
      if (!s.resolved && s.cascadeFrame < 0) {
        const labelAlpha = ELEMENT_ALPHA.text.min * ent * 0.7;
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(FRAME_WARM, primaryRgb, 0.05), labelAlpha);
        ctx.fillText('drag the light back into the timeline', layout.cx, layout.clipHomeY + clipH);
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
        cursor: stateRef.current.isDragging ? 'grabbing' : 'grab',
      }}
    />
  );
}