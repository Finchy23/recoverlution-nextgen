/**
 * ATOM 056: THE REALITY TEAR ENGINE (Source Code Revelation)
 * ===========================================================
 * Series 6 — Meta-System & Glitch · Position 6
 *
 * Your deepest limiting beliefs feel like physical laws. "I am
 * broken." "I am not enough." "I can't change." They feel as
 * immutable as gravity. But they're not physics. They're code.
 * Lines of code written by someone else, running on your
 * hardware without your consent. And code can be rewritten.
 *
 * The canvas presents a pristine, beautiful UI element — a
 * minimal card with the text "I am broken." It looks finished.
 * Polished. Permanent. Like every other piece of software the
 * user has ever accepted as reality.
 *
 * The user drags horizontally. The card TEARS. Not a clean
 * split — a ragged, physical tear, as if pulling paper apart.
 * Behind the tear: raw source code is exposed.
 *
 *   const identity = {
 *     is_broken: true,    // ← this line is highlighted
 *     can_change: false,
 *     source: "external",
 *   };
 *
 * The variable `is_broken: true` pulses gently. It's a
 * tappable target. The user taps it. It flips:
 *   is_broken: false
 *
 * The code shimmers. The tear closes. The card reforms,
 * now reading: "I am whole." Completion.
 *
 * INTERACTION:
 *   1. Drag horizontally to tear the card apart
 *   2. Tap the highlighted variable to flip it
 *   3. Card reforms with new identity
 *
 * HAPTIC:
 *   Drag → drag_snap (tearing friction)
 *   Variable flip → step_advance (the rewrite)
 *   Card reform → completion
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: No tear animation, instant reveal, faster reform
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const TEAR_THRESHOLD = 0.3;        // Drag distance (as fraction of card width) to fully tear
const REFORM_FRAMES = 90;          // Frames for card to reform
const TEAR_JAGGEDNESS = 8;         // Number of jag points in tear edge
const CODE_LINES = [
  'const identity = {',
  '  is_broken: true,',
  '  can_change: false,',
  '  source: "external",',
  '};',
];
const CODE_LINES_FIXED = [
  'const identity = {',
  '  is_broken: false,',
  '  can_change: true,',
  '  source: "self",',
  '};',
];
const HIGHLIGHT_LINE = 1; // Index of the tappable variable

// Palette
const BG_DARK: RGB = [4, 4, 5];
const CARD_BG: RGB = [18, 17, 20];
const CARD_BORDER: RGB = [50, 47, 55];
const CARD_TEXT: RGB = [170, 165, 155];
const CARD_TEXT_NEW: RGB = [180, 172, 145];
const CODE_BG: RGB = [8, 8, 12];
const CODE_TEXT: RGB = [130, 145, 140];       // Default code — greenish
const CODE_KEYWORD: RGB = [160, 120, 140];    // Keywords — muted purple
const CODE_STRING: RGB = [140, 155, 120];     // Strings — muted green
const CODE_HIGHLIGHT: RGB = [200, 140, 90];   // The tappable variable
const CODE_BOOL: RGB = [180, 120, 90];        // Boolean values
const TEAR_EDGE: RGB = [35, 33, 38];
const TEAR_SHADOW: RGB = [10, 10, 12];
const REFORM_GLOW: RGB = [160, 150, 120];

type TearPhase = 'intact' | 'tearing' | 'torn' | 'flipped' | 'reforming' | 'complete';

// =====================================================================
// COMPONENT
// =====================================================================

export default function RealityTearAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    phase: 'intact' as TearPhase,
    tearAmount: 0,             // 0 = closed, 1 = fully torn
    isDragging: false,
    dragStartX: 0,
    lastSnapTear: 0,
    flipped: false,
    reformFrame: -1,
    reformProgress: 0,
    resolved: false,
    // Tear edge jag points (pre-computed)
    jagPoints: [] as Array<{ y: number; offset: number }>,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;

    // Card dimensions (viewport-relative)
    const cardW = minDim * 0.7;
    const cardH = minDim * 0.22;
    const cardX = (w - cardW) / 2;
    const cardY = (h - cardH) / 2;
    const cardR = minDim * 0.012;

    // Initialize jag points for tear edge
    if (!s.initialized) {
      const jagCount = TEAR_JAGGEDNESS + 2;
      s.jagPoints = Array.from({ length: jagCount }, (_, i) => ({
        y: (i / (jagCount - 1)) * cardH,
        offset: (Math.random() - 0.5) * minDim * 0.02,
      }));
      s.initialized = true;
    }

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      if (s.phase === 'intact' || s.phase === 'tearing') {
        s.isDragging = true;
        s.dragStartX = px;
      } else if (s.phase === 'torn' && !s.flipped) {
        const codeFontSize = Math.round(minDim * 0.018);
        const codeLineH = codeFontSize * 1.7;
        const codeStartY = cardY + cardH * 0.15;
        const highlightY = codeStartY + HIGHLIGHT_LINE * codeLineH;

        if (py >= highlightY - codeLineH * 0.3 && py <= highlightY + codeLineH * 1.2 &&
            px >= cardX && px <= cardX + cardW) {
          s.flipped = true;
          s.phase = 'flipped';
          cbRef.current.onHaptic('step_advance');
          setTimeout(() => {
            s.phase = 'reforming';
            s.reformFrame = s.frameCount;
          }, 600);
        }
      }

      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isDragging) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const cardW = minDim * 0.7;

      const dx = Math.abs(px - s.dragStartX);
      const newTear = Math.min(1, dx / (cardW * TEAR_THRESHOLD));

      if (newTear > s.tearAmount) {
        s.tearAmount = newTear;
        s.phase = 'tearing';
      }

      const snapVal = Math.floor(newTear * 8);
      if (snapVal > s.lastSnapTear) {
        s.lastSnapTear = snapVal;
        cbRef.current.onHaptic('drag_snap');
      }

      if (s.tearAmount >= 1 && s.phase !== 'torn') {
        s.phase = 'torn';
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // Entrance
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const ent = easeOutExpo(s.entranceProgress);

      // Reform animation
      if (s.phase === 'reforming') {
        const elapsed = s.frameCount - s.reformFrame;
        s.reformProgress = Math.min(1, elapsed / REFORM_FRAMES);
        s.tearAmount = Math.max(0, 1 - s.reformProgress);
        if (s.reformProgress >= 1 && !s.resolved) {
          s.phase = 'complete';
          s.tearAmount = 0;
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // Progress
      const progress =
        s.phase === 'intact' ? 0 :
        s.phase === 'tearing' ? s.tearAmount * 0.3 :
        s.phase === 'torn' ? 0.3 :
        s.phase === 'flipped' ? 0.5 :
        s.phase === 'reforming' ? 0.5 + s.reformProgress * 0.5 :
        1;
      cb.onStateChange?.(progress);

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ══════════════════════════════════════════════════

      const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ══════════════════════════════════════════════════
      // THE CARD
      // ══════════════════════════════════════════════════

      const tearGap = s.tearAmount * cardW * 0.15; // How far apart the halves are
      const halfW = cardW / 2;
      const leftShift = -tearGap / 2;
      const rightShift = tearGap / 2;

      // ── Code layer (visible through tear) ──────────────
      if (s.tearAmount > 0.05) {
        const codeAlpha = Math.min(1, s.tearAmount * 1.5);

        // Code background
        const codeBg = lerpColor(CODE_BG, s.primaryRgb, 0.003);
        ctx.fillStyle = rgba(codeBg, 0.12 * codeAlpha * ent);
        ctx.fillRect(cardX + halfW - tearGap, cardY, tearGap * 2, cardH);

        // Code text
        const codeFontSize = Math.round(minDim * 0.018);
        const codeLineH = codeFontSize * 1.7;
        ctx.font = `400 ${codeFontSize}px 'SF Mono', 'Menlo', 'Consolas', monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const lines = s.flipped || s.phase === 'reforming' || s.phase === 'complete'
          ? CODE_LINES_FIXED : CODE_LINES;
        const codeStartY = cardY + cardH * 0.15;
        const codeStartX = cardX + cardW * 0.15;

        for (let i = 0; i < lines.length; i++) {
          const ly = codeStartY + i * codeLineH;
          const line = lines[i];

          const isHighlight = i === HIGHLIGHT_LINE;
          const isKeyword = line.includes('const');
          const isString = line.includes('"');

          let lineCol: RGB;
          if (isHighlight) {
            lineCol = lerpColor(CODE_HIGHLIGHT, s.accentRgb, 0.08);
          } else if (isKeyword) {
            lineCol = lerpColor(CODE_KEYWORD, s.primaryRgb, 0.05);
          } else if (isString) {
            lineCol = lerpColor(CODE_STRING, s.accentRgb, 0.04);
          } else {
            lineCol = lerpColor(CODE_TEXT, s.primaryRgb, 0.04);
          }

          let lineAlpha = 0.08 * codeAlpha * ent;
          if (isHighlight) {
            lineAlpha = 0.12 * codeAlpha * ent;
            // Pulse if tappable
            if (s.phase === 'torn' && !s.flipped && !p.reducedMotion) {
              const pulse = 0.7 + 0.3 * Math.sin(s.frameCount * 0.05);
              lineAlpha *= pulse;
            }
          }

          ctx.fillStyle = rgba(lineCol, lineAlpha);
          ctx.fillText(line, codeStartX, ly);
        }

        // Highlight background bar
        if (s.phase === 'torn' && !s.flipped) {
          const hlY = codeStartY + HIGHLIGHT_LINE * codeLineH - minDim * 0.004;
          const hlH = codeLineH + minDim * 0.004;
          const hlCol = lerpColor(CODE_HIGHLIGHT, s.accentRgb, 0.04);
          ctx.fillStyle = rgba(hlCol, 0.015 * codeAlpha * ent);
          ctx.fillRect(codeStartX - minDim * 0.008, hlY, cardW * 0.7, hlH);
        }
      }

      // ── Left half of card ──────────────────────────────
      if (s.tearAmount < 1 || s.phase === 'reforming' || s.phase === 'complete') {
        ctx.save();
        ctx.beginPath();
        // Left clipping region (tear edge on right side)
        ctx.moveTo(cardX + leftShift, cardY);
        const tearCenterX = cardX + halfW + leftShift;
        for (const jag of s.jagPoints) {
          ctx.lineTo(tearCenterX + jag.offset * s.tearAmount, cardY + jag.y);
        }
        ctx.lineTo(cardX + leftShift, cardY + cardH);
        ctx.closePath();
        ctx.clip();

        const cardBgCol = lerpColor(CARD_BG, s.primaryRgb, 0.01);
        ctx.fillStyle = rgba(cardBgCol, 0.1 * ent);
        ctx.fillRect(cardX + leftShift, cardY, cardW, cardH);

        // Card border (left half)
        const borderCol = lerpColor(CARD_BORDER, s.primaryRgb, 0.02);
        ctx.beginPath();
        roundRect(ctx, cardX + leftShift, cardY, cardW, cardH, cardR);
        ctx.strokeStyle = rgba(borderCol, 0.04 * ent);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();

        ctx.restore();
      }

      // ── Right half of card ─────────────────────────────
      if (s.tearAmount < 1 || s.phase === 'reforming' || s.phase === 'complete') {
        ctx.save();
        ctx.beginPath();
        // Right clipping region (tear edge on left side)
        const tearCenterX = cardX + halfW + rightShift;
        ctx.moveTo(cardX + cardW + rightShift, cardY);
        for (const jag of s.jagPoints) {
          ctx.lineTo(tearCenterX + jag.offset * s.tearAmount, cardY + jag.y);
        }
        ctx.lineTo(cardX + cardW + rightShift, cardY + cardH);
        ctx.closePath();
        ctx.clip();

        const cardBgCol = lerpColor(CARD_BG, s.primaryRgb, 0.01);
        ctx.fillStyle = rgba(cardBgCol, 0.1 * ent);
        ctx.fillRect(cardX + rightShift, cardY, cardW, cardH);

        // Card border (right half)
        const borderCol = lerpColor(CARD_BORDER, s.primaryRgb, 0.02);
        ctx.beginPath();
        roundRect(ctx, cardX + rightShift, cardY, cardW, cardH, cardR);
        ctx.strokeStyle = rgba(borderCol, 0.04 * ent);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();

        ctx.restore();
      }

      // ── Card label text ────────────────────────────────
      if (s.tearAmount < 0.5 || s.phase === 'reforming' || s.phase === 'complete') {
        const textFade = s.phase === 'reforming'
          ? Math.max(0, s.reformProgress - 0.5) * 2
          : s.phase === 'complete' ? 1
          : 1 - s.tearAmount * 2;

        const isNew = s.phase === 'reforming' || s.phase === 'complete';
        const labelText = isNew ? 'I am whole.' : 'I am broken.';
        const labelCol = isNew
          ? lerpColor(CARD_TEXT_NEW, s.accentRgb, 0.08)
          : lerpColor(CARD_TEXT, s.primaryRgb, 0.05);

        const fontSize = Math.round(minDim * 0.028);
        ctx.font = `200 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(labelCol, 0.08 * textFade * ent);
        ctx.fillText(labelText, cx, cy);
      }

      // ── Tear edge shadow/highlight ─────────────────────
      if (s.tearAmount > 0.05 && s.tearAmount < 1) {
        const tearCenterX = cardX + halfW;
        const tearCol = lerpColor(TEAR_EDGE, s.primaryRgb, 0.02);
        const shadowCol = lerpColor(TEAR_SHADOW, s.primaryRgb, 0.01);

        // Left edge
        ctx.beginPath();
        for (let i = 0; i < s.jagPoints.length; i++) {
          const jag = s.jagPoints[i];
          const jx = tearCenterX + jag.offset * s.tearAmount + leftShift;
          const jy = cardY + jag.y;
          if (i === 0) ctx.moveTo(jx, jy); else ctx.lineTo(jx, jy);
        }
        ctx.strokeStyle = rgba(tearCol, 0.06 * ent);
        ctx.lineWidth = minDim * 0.0012;
        ctx.stroke();

        // Right edge
        ctx.beginPath();
        for (let i = 0; i < s.jagPoints.length; i++) {
          const jag = s.jagPoints[i];
          const jx = tearCenterX + jag.offset * s.tearAmount + rightShift;
          const jy = cardY + jag.y;
          if (i === 0) ctx.moveTo(jx, jy); else ctx.lineTo(jx, jy);
        }
        ctx.strokeStyle = rgba(shadowCol, 0.04 * ent);
        ctx.lineWidth = minDim * 0.0012;
        ctx.stroke();
      }

      // ── Reform glow ────────────────────────────────────
      if (s.phase === 'reforming' && s.reformProgress > 0.3) {
        const glowCol = lerpColor(REFORM_GLOW, s.accentRgb, 0.08);
        const glowR = minDim * 0.15;
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        const gAlpha = (s.reformProgress - 0.3) * 0.01 * (1 + p.breathAmplitude * 0.2) * ent;
        glowGrad.addColorStop(0, rgba(glowCol, gAlpha));
        glowGrad.addColorStop(0.5, rgba(glowCol, gAlpha * 0.2));
        glowGrad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Drag hint ──────────────────────────────────────
      if (s.phase === 'intact' && s.frameCount > 60 && s.frameCount < 300) {
        const hintAlpha = Math.min(0.025, (s.frameCount - 60) / 200 * 0.025) * ent;
        const hintCol = lerpColor(CARD_TEXT, s.primaryRgb, 0.04);
        const hintSize = Math.round(minDim * 0.014);
        ctx.font = `300 ${hintSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(hintCol, hintAlpha);
        ctx.fillText('← drag →', cx, cardY + cardH + minDim * 0.06);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}