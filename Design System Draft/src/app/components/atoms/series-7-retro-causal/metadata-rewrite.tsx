/**
 * ATOM 066: THE METADATA ENGINE
 * ===============================
 * Series 7 — Retro-Causal · Position 6
 *
 * A memory is neutral data. The pain comes from the metadata tag
 * the ego attached: "FLAW". Long-press the badge to unlock it.
 * Watch the red drain into silver. The text morphs: FLAW → DATA.
 *
 * PHYSICS:
 *   - Memory card with locked red badge reading "FLAW"
 *   - Long-press (2s) triggers unlock animation
 *   - Red colour drains downward, replaced by rising silver
 *   - Text morphs letter-by-letter: F→D, L→A, A→T, W→A
 *   - Card shadow shrinks, y-position rises (lighter weight)
 *
 * INTERACTION:
 *   Hold → unlock badge, morph text
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Instant colour change + text swap on hold threshold
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

const CARD_BG: RGB = [50, 48, 62];
const BADGE_RED: RGB = [200, 60, 50];
const BADGE_SILVER: RGB = [160, 165, 175];
const LOCK_COLOR: RGB = [240, 230, 210];
const TEXT_OLD: RGB = [220, 80, 70];
const TEXT_NEW: RGB = [170, 175, 185];
const BG_BASE: RGB = [18, 16, 24];
const SHADOW_COLOR: RGB = [10, 8, 16];

// =====================================================================
// CONSTANTS
// =====================================================================

const HOLD_THRESHOLD_FRAMES = 120; // 2 seconds at 60fps
const MORPH_STAGGER_FRAMES = 8; // frames between each letter morph
const OLD_TEXT = 'FLAW';
const NEW_TEXT = 'DATA';

// =====================================================================
// COMPONENT
// =====================================================================

export default function MetadataRewriteAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    holdFrames: 0,
    isHolding: false,
    unlocked: false,
    // Colour drain progress 0-1
    drainProgress: 0,
    // Per-letter morph progress [0-1, 0-1, 0-1, 0-1]
    letterProgress: [0, 0, 0, 0],
    morphStartFrame: -1,
    // Card float
    cardYOffset: 0,
    shadowBlur: 1,
    // Lock rotation
    lockAngle: 0,
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

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.resolved) return;
      s.isHolding = true;
      s.holdFrames = 0;
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
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      // Entrance
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Hold tracking
      if (s.isHolding && !s.unlocked) {
        s.holdFrames++;
        if (s.holdFrames >= HOLD_THRESHOLD_FRAMES) {
          s.unlocked = true;
          s.morphStartFrame = s.frame;
          onHaptic('hold_threshold');

          if (p.reducedMotion) {
            // Instant morph
            s.drainProgress = 1;
            s.letterProgress = [1, 1, 1, 1];
            s.cardYOffset = -1;
            s.shadowBlur = 0.25;
            s.lockAngle = Math.PI / 6;
            s.resolved = true;
            onHaptic('completion');
            onResolve?.();
          }
        }
      }

      // Post-unlock animations
      if (s.unlocked && !p.reducedMotion) {
        // Colour drain
        s.drainProgress = Math.min(1, s.drainProgress + 0.02);

        // Letter morph (staggered)
        const elapsed = s.frame - s.morphStartFrame;
        for (let i = 0; i < 4; i++) {
          const letterStart = 20 + i * MORPH_STAGGER_FRAMES;
          if (elapsed > letterStart) {
            s.letterProgress[i] = Math.min(1, s.letterProgress[i] + 0.05);
            if (s.letterProgress[i] >= 0.5 && s.letterProgress[i] < 0.55) {
              onHaptic('step_advance');
            }
          }
        }

        // Lock rotation
        s.lockAngle = Math.min(Math.PI / 6, s.lockAngle + 0.02);

        // Card float up
        s.cardYOffset = Math.max(-1, s.cardYOffset - 0.0125);
        s.shadowBlur = Math.max(0.25, s.shadowBlur - 0.0075);

        // Check completion
        if (s.letterProgress.every(p => p >= 1) && !s.resolved) {
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        }
      }

      // Report state
      const progress = s.resolved ? 1 :
        s.unlocked ? 0.3 + 0.7 * (s.letterProgress.reduce((a, b) => a + b, 0) / 4) :
        (s.holdFrames / HOLD_THRESHOLD_FRAMES) * 0.3;
      onStateChange?.(progress);

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

      // Card dimensions
      const cardW = minDim * 0.5;
      const cardH = minDim * 0.15;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2 + s.cardYOffset * minDim * 0.016;

      // Card shadow
      const shadowCol = lerpColor(SHADOW_COLOR, primaryRgb, 0.02);
      ctx.fillStyle = rgba(shadowCol, ELEMENT_ALPHA.secondary.min * ent * s.shadowBlur);
      ctx.beginPath();
      ctx.roundRect(cardX + minDim * 0.004, cardY + s.shadowBlur * minDim * 0.008, cardW, cardH, minDim * 0.01);
      ctx.fill();

      // Card body
      const cardCol = lerpColor(CARD_BG, primaryRgb, 0.04);
      ctx.fillStyle = rgba(cardCol, ELEMENT_ALPHA.primary.max * ent);
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, minDim * 0.01);
      ctx.fill();

      // Card inner content suggestion
      ctx.fillStyle = rgba(lerpColor(CARD_BG, primaryRgb, 0.06), ELEMENT_ALPHA.tertiary.max * ent);
      ctx.fillRect(cardX + cardW * 0.08, cardY + cardH * 0.2, cardW * 0.35, cardH * 0.12);
      ctx.fillRect(cardX + cardW * 0.08, cardY + cardH * 0.42, cardW * 0.25, cardH * 0.12);

      // ── Badge ──────────────────────────────────────────
      const badgeW = minDim * 0.12;
      const badgeH = minDim * 0.04;
      const badgeX = cardX + cardW - badgeW - cardW * 0.08;
      const badgeY = cardY + (cardH - badgeH) / 2;

      // Badge colour — drain from red to silver (vertical wipe)
      const badgeRedCol = lerpColor(BADGE_RED, primaryRgb, 0.05);
      const badgeSilverCol = lerpColor(BADGE_SILVER, primaryRgb, 0.05);
      const badgeAlpha = ELEMENT_ALPHA.primary.max * ent;

      // Red portion (shrinks from top)
      if (s.drainProgress < 1) {
        ctx.fillStyle = rgba(badgeRedCol, badgeAlpha);
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH * (1 - s.drainProgress), minDim * 0.004);
        ctx.fill();
      }

      // Silver portion (grows from bottom)
      if (s.drainProgress > 0) {
        ctx.fillStyle = rgba(badgeSilverCol, badgeAlpha);
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY + badgeH * (1 - s.drainProgress), badgeW, badgeH * s.drainProgress, minDim * 0.004);
        ctx.fill();
      }

      // Badge border
      ctx.strokeStyle = rgba(
        lerpColor(badgeRedCol, badgeSilverCol, s.drainProgress),
        ELEMENT_ALPHA.secondary.max * ent,
      );
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, minDim * 0.004);
      ctx.stroke();

      // ── Badge text (letter-by-letter morph) ────────────
      const fontSize = Math.round(minDim * 0.02);
      ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const textCX = badgeX + badgeW / 2;
      const textCY = badgeY + badgeH / 2;
      const letterSpacing = fontSize * 0.7;
      const textStartX = textCX - (letterSpacing * 1.5);

      for (let i = 0; i < 4; i++) {
        const lx = textStartX + i * letterSpacing;
        const morph = s.letterProgress[i];
        const oldChar = OLD_TEXT[i];
        const newChar = NEW_TEXT[i];
        const oldCol = lerpColor(TEXT_OLD, primaryRgb, 0.05);
        const newCol = lerpColor(TEXT_NEW, primaryRgb, 0.05);

        if (morph < 0.5) {
          // Old character fading out
          const alpha = ELEMENT_ALPHA.text.max * ent * (1 - morph * 2);
          ctx.fillStyle = rgba(oldCol, alpha);
          ctx.fillText(oldChar, lx, textCY);
        } else {
          // New character fading in
          const alpha = ELEMENT_ALPHA.text.max * ent * ((morph - 0.5) * 2);
          ctx.fillStyle = rgba(newCol, alpha);
          ctx.fillText(newChar, lx, textCY);
        }
      }

      // ── Lock icon ──────────────────────────────────────
      const lockSize = minDim * 0.012;
      const lockX = badgeX - lockSize * 2;
      const lockY = badgeY + badgeH / 2;
      const lockCol = lerpColor(LOCK_COLOR, primaryRgb, 0.05);

      ctx.save();
      ctx.translate(lockX, lockY);
      ctx.rotate(s.lockAngle);

      // Lock body (small rect)
      ctx.fillStyle = rgba(lockCol, ELEMENT_ALPHA.secondary.max * ent * (1 - s.drainProgress * 0.5));
      ctx.fillRect(-lockSize * 0.5, -lockSize * 0.2, lockSize, lockSize * 0.7);

      // Lock shackle (arc)
      ctx.strokeStyle = rgba(lockCol, ELEMENT_ALPHA.secondary.max * ent * (1 - s.drainProgress * 0.5));
      ctx.lineWidth = lockSize * 0.15;
      ctx.beginPath();
      ctx.arc(0, -lockSize * 0.2, lockSize * 0.35, Math.PI, 0);
      ctx.stroke();

      ctx.restore();

      // ── Hold progress ring ─────────────────────────────
      if (s.isHolding && !s.unlocked) {
        const holdT = s.holdFrames / HOLD_THRESHOLD_FRAMES;
        const ringR = minDim * 0.04;
        const ringCol = lerpColor(BADGE_RED, primaryRgb, 0.05);
        ctx.strokeStyle = rgba(ringCol, ELEMENT_ALPHA.primary.min * ent);
        ctx.lineWidth = minDim * 0.002;
        ctx.beginPath();
        ctx.arc(badgeX + badgeW / 2, badgeY + badgeH / 2, ringR, -Math.PI / 2, -Math.PI / 2 + holdT * Math.PI * 2);
        ctx.stroke();
      }

      // ── Instruction ────────────────────────────────────
      if (!s.unlocked) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(BADGE_SILVER, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('long-press the badge to unlock', cx, cardY + cardH + minDim * 0.06);
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