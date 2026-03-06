/**
 * ATOM 052: THE LAG SPIKE ENGINE (The Frustration Gap)
 * =====================================================
 * Series 6 — Meta-System & Glitch · Position 2
 *
 * The ego expects instant digital gratification. A 3-second
 * delay — that's all it takes to expose the addiction. When
 * the screen doesn't respond, anger spikes. The user feels
 * rage at a piece of glass. And THAT is the lesson.
 *
 * A single, beautiful, minimal button sits at the centre of
 * the canvas. It says "Continue." It is the most inviting
 * element on the screen. Everything about it whispers: tap me.
 *
 * The user taps.
 *
 * Nothing happens. The button does not animate. No haptic. No
 * colour change. No loading spinner. NOTHING. The canvas is
 * frozen dead. For exactly 3,000 milliseconds.
 *
 * During this void: the user's autonomic nervous system goes
 * into overdrive. They'll tap again. And again. They'll think
 * the app is broken. They'll feel frustration — real,
 * measurable, somatic frustration — at a rectangle of glass
 * that failed to entertain them for three seconds.
 *
 * After 3000ms: the button dissolves. The screen gently
 * clears. Soft typography emerges:
 *
 *   "Why are you angry at a screen?"
 *   "It was three seconds."
 *   "Breathe in the gap."
 *
 * The lesson is delivered. Completion.
 *
 * HAPTIC:
 *   During freeze → NOTHING (that IS the point)
 *   After reveal → step_advance (a gentle pulse)
 *   Completion → completion
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: Same experience — the delay is the mechanic,
 *   not the animation. Text appears faster after reveal.
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const FREEZE_DURATION_MS = 3000;
const REVEAL_FADE_FRAMES = 120;     // Frames for text to fade in
const BUTTON_DISSOLVE_FRAMES = 40;  // Frames for button to dissolve
const COMPLETE_DELAY_FRAMES = 300;  // Frames after reveal before completion

// Palette
const BG_DARK: RGB = [4, 4, 5];
const BUTTON_BORDER: RGB = [80, 75, 70];
const BUTTON_TEXT: RGB = [140, 135, 125];
const BUTTON_GLOW: RGB = [100, 95, 85];
const REVEAL_TEXT: RGB = [150, 145, 130];
const BREATHE_TEXT: RGB = [170, 160, 130];

// =====================================================================
// COMPONENT
// =====================================================================

type LagPhase = 'waiting' | 'frozen' | 'dissolving' | 'revealing' | 'complete';

export default function LagSpikeAtom({
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
    phase: 'waiting' as LagPhase,
    freezeStartTime: -1,   // performance.now() when freeze started
    dissolveFrame: -1,
    revealFrame: -1,
    completeFrame: -1,
    resolved: false,
    revealFired: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    // Button state
    buttonPulse: 0,
    rageTapCount: 0,        // Count taps during freeze (for debrief)
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

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    // Button dimensions
    const btnW = minDim * 0.3;
    const btnH = minDim * 0.08;
    const btnR = btnH * 0.15; // border radius
    const btnX = cx - btnW / 2;
    const btnY = cy - btnH / 2;

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.phase === 'waiting') {
        s.phase = 'frozen';
        s.freezeStartTime = performance.now();
      } else if (s.phase === 'frozen') {
        s.rageTapCount++;
      }
      canvas.setPointerCapture(e.pointerId);
    };
    canvas.addEventListener('pointerdown', onDown);

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

      // ── Freeze timer check ─────────────────────────────
      if (s.phase === 'frozen' && s.freezeStartTime > 0) {
        const elapsed = performance.now() - s.freezeStartTime;
        if (elapsed >= FREEZE_DURATION_MS) {
          s.phase = 'dissolving';
          s.dissolveFrame = s.frameCount;
          cb.onHaptic('step_advance');
          s.revealFired = true;
        }
      }

      if (s.phase === 'dissolving') {
        const elapsed = s.frameCount - s.dissolveFrame;
        if (elapsed >= BUTTON_DISSOLVE_FRAMES) {
          s.phase = 'revealing';
          s.revealFrame = s.frameCount;
        }
      }

      if (s.phase === 'revealing') {
        const elapsed = s.frameCount - s.revealFrame;
        if (elapsed >= COMPLETE_DELAY_FRAMES && !s.resolved) {
          s.resolved = true;
          s.phase = 'complete';
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // State metric
      const progress =
        s.phase === 'waiting' ? 0 :
        s.phase === 'frozen' ? 0.1 + ((performance.now() - s.freezeStartTime) / FREEZE_DURATION_MS) * 0.4 :
        s.phase === 'dissolving' ? 0.5 + ((s.frameCount - s.dissolveFrame) / BUTTON_DISSOLVE_FRAMES) * 0.1 :
        s.phase === 'revealing' ? 0.6 + ((s.frameCount - s.revealFrame) / COMPLETE_DELAY_FRAMES) * 0.4 :
        1;
      cb.onStateChange?.(Math.min(1, progress));

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

      // ── The Button ─────────────────────────────────────
      if (s.phase === 'waiting' || s.phase === 'frozen' || s.phase === 'dissolving') {
        let buttonAlpha = 1;
        if (s.phase === 'dissolving') {
          const t = (s.frameCount - s.dissolveFrame) / BUTTON_DISSOLVE_FRAMES;
          buttonAlpha = Math.max(0, 1 - t);
        }

        // Subtle pulse (only in waiting state)
        const pulse = (s.phase === 'waiting' && !p.reducedMotion)
          ? 1 + Math.sin(s.frameCount * 0.015) * 0.008
          : 1;

        const bw = btnW * pulse;
        const bh = btnH * pulse;
        const bx = cx - bw / 2;
        const by = cy - bh / 2;

        // Button glow (very subtle invitation)
        if (s.phase === 'waiting') {
          const glowCol = lerpColor(BUTTON_GLOW, s.accentRgb, 0.06);
          const glowR = minDim * 0.12;
          const glowGrad = ctx.createRadialGradient(cx, cy, bh, cx, cy, glowR);
          glowGrad.addColorStop(0, rgba(glowCol, 0.008 * buttonAlpha * ent));
          glowGrad.addColorStop(1, rgba(glowCol, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(0, 0, w, h);
        }

        // Button border
        const borderCol = lerpColor(BUTTON_BORDER, s.primaryRgb, 0.06);
        ctx.beginPath();
        roundRect(ctx, bx, by, bw, bh, btnR);
        ctx.strokeStyle = rgba(borderCol, 0.06 * buttonAlpha * ent);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();

        // Button text
        const textCol = lerpColor(BUTTON_TEXT, s.accentRgb, 0.05);
        const fontSize = Math.round(minDim * 0.022);
        ctx.font = `300 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(textCol, 0.08 * buttonAlpha * ent);
        ctx.fillText('Continue', cx, cy);
      }

      // ── Reveal text ────────────────────────────────────
      if (s.phase === 'revealing' || s.phase === 'complete') {
        const elapsed = s.phase === 'complete'
          ? REVEAL_FADE_FRAMES
          : s.frameCount - s.revealFrame;
        const fadeSpeed = p.reducedMotion ? 3 : 1;
        const t = Math.min(1, (elapsed * fadeSpeed) / REVEAL_FADE_FRAMES);
        const eased = easeOutExpo(t);

        const fontSize = Math.round(minDim * 0.022);
        const lineHeight = fontSize * 2.2;
        ctx.font = `200 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const revealLines = [
          'Why are you angry at a screen?',
          '',
          'It was three seconds.',
          '',
          'Breathe in the gap.',
        ];

        const blockH = revealLines.length * lineHeight;
        const startY = cy - blockH / 2;

        for (let i = 0; i < revealLines.length; i++) {
          if (!revealLines[i]) continue;

          // Each line staggers in
          const lineDelay = i * 0.15;
          const lineT = Math.max(0, Math.min(1, (t - lineDelay) / (1 - lineDelay)));
          const lineAlpha = easeOutExpo(lineT);

          const isBreatheLine = i === revealLines.length - 1;
          const col = isBreatheLine
            ? lerpColor(BREATHE_TEXT, s.accentRgb, 0.08)
            : lerpColor(REVEAL_TEXT, s.accentRgb, 0.04);
          const alpha = (isBreatheLine ? 0.08 : 0.06) * lineAlpha * eased * ent;

          ctx.fillStyle = rgba(col, alpha);
          ctx.fillText(revealLines[i], cx, startY + i * lineHeight);
        }

        // Subtle breath-coupled glow around "breathe" line
        if (t > 0.5) {
          const breathGlow = lerpColor(BREATHE_TEXT, s.accentRgb, 0.06);
          const breathR = minDim * 0.15;
          const breathY = startY + (revealLines.length - 1) * lineHeight;
          const breathGrad = ctx.createRadialGradient(cx, breathY, 0, cx, breathY, breathR);
          const bAlpha = (t - 0.5) * 2 * 0.008 * (1 + p.breathAmplitude * 0.3) * ent;
          breathGrad.addColorStop(0, rgba(breathGlow, bAlpha));
          breathGrad.addColorStop(0.5, rgba(breathGlow, bAlpha * 0.2));
          breathGrad.addColorStop(1, rgba(breathGlow, 0));
          ctx.fillStyle = breathGrad;
          ctx.fillRect(0, 0, w, h);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
          cursor: 'default',
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