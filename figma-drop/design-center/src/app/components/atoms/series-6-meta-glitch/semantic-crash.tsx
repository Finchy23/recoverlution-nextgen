/**
 * ATOM 060: THE SEMANTIC CRASH ENGINE (Loop Breaking)
 * ====================================================
 * Series 6 — Meta-System & Glitch · Position 10
 *
 * Semantic satiation — the psychological phenomenon where a
 * word loses its meaning when repeated too many times.
 *
 * The user's trigger word (e.g. "FAILURE") is rendered on screen.
 * Tapping starts the loop. The word repeats, stacking on top of
 * itself in overlapping text. As it repeats, the font morphs,
 * stretches, and distorts until it is no longer readable English —
 * just abstract, meaningless geometry.
 *
 * PHYSICS:
 *   - Typography stacking: each repeat adds a slightly offset,
 *     slightly rotated, slightly stretched copy
 *   - Font weight oscillation (100–900)
 *   - Letter-spacing expansion
 *   - Scale distortion (scaleX and scaleY diverge)
 *   - Alpha accumulation creates visual noise
 *   - After ~80 repeats: word is fully abstract geometry
 *
 * HAPTIC:
 *   - Frantic buzzing during loop
 *   - Goes flat at completion
 *
 * REDUCED MOTION: Copies appear without rotation/scale distortion
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const TARGET_COPIES = 80;
const COPIES_PER_FRAME = 2;       // Speed of the loop
const LOOP_HAPTIC_INTERVAL = 12;  // frames between buzzes

const BG_DARK: RGB = [5, 4, 7];
const WORD_COL: RGB = [160, 70, 60];       // Initial — threatening red
const WORD_FADED: RGB = [90, 85, 80];      // After satiation
const WORD_ABSTRACT: RGB = [65, 70, 80];   // Final geometry stage
const HINT_COL: RGB = [65, 60, 55];
const RESOLVE_COL: RGB = [100, 120, 95];

const TRIGGER_WORD = 'FAILURE';

interface WordCopy {
  offsetX: number;
  offsetY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  weight: number;
  letterSpacing: number;
  alpha: number;
}

export default function SemanticCrashAtom({
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
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    copies: [] as WordCopy[],
    looping: false,
    resolved: false,
    resolveAlpha: 0,
    frameCount: 0,
    loopFrame: 0,
    tapped: false,
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
    const dpr = window.devicePixelRatio || 1;
    const baseFontSize = Math.round(minDim * 0.08);

    // ── Native pointer handler ──────────────────────────
    const onDown = () => {
      if (s.resolved) return;
      if (!s.looping) {
        s.looping = true;
        s.tapped = true;
        cbRef.current.onHaptic('tap');
      }
    };
    canvas.addEventListener('pointerdown', onDown);

    let animId: number;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }

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

      // Background
      const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Loop logic ─────────────────────────────────────
      if (s.looping && s.copies.length < TARGET_COPIES) {
        s.loopFrame++;

        // Add new copies
        if (s.loopFrame % Math.max(1, Math.floor(3 - s.copies.length / 40)) === 0) {
          const progress = s.copies.length / TARGET_COPIES;
          const chaos = progress * progress; // Quadratic chaos increase

          for (let i = 0; i < COPIES_PER_FRAME && s.copies.length < TARGET_COPIES; i++) {
            s.copies.push({
              offsetX: (Math.random() - 0.5) * minDim * 0.25 * chaos,
              offsetY: (Math.random() - 0.5) * minDim * 0.20 * chaos,
              rotation: p.reducedMotion ? 0 : (Math.random() - 0.5) * Math.PI * 0.4 * chaos,
              scaleX: 1 + (Math.random() - 0.5) * 1.5 * chaos,
              scaleY: 1 + (Math.random() - 0.5) * 1.5 * chaos,
              weight: Math.round(100 + Math.random() * 800),
              letterSpacing: chaos * 15 * Math.random(),
              alpha: Math.max(0.01, 0.06 * (1 - chaos * 0.7)),
            });
          }
        }

        // Haptic buzzing
        if (s.loopFrame % LOOP_HAPTIC_INTERVAL === 0 && s.copies.length < TARGET_COPIES * 0.9) {
          cb.onHaptic('step_advance');
        }

        cb.onStateChange?.(s.copies.length / TARGET_COPIES);

        // Resolve
        if (s.copies.length >= TARGET_COPIES && !s.resolved) {
          s.resolved = true;
          s.looping = false;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // ── Render word copies ─────────────────────────────
      const progress = s.copies.length / TARGET_COPIES;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Render all accumulated copies (oldest first, newest on top)
      for (let i = 0; i < s.copies.length; i++) {
        const copy = s.copies[i];
        const copyProgress = i / TARGET_COPIES;

        // Color transitions: threatening → faded → abstract geometry
        let wordCol: RGB;
        if (copyProgress < 0.4) {
          wordCol = lerpColor(WORD_COL, WORD_FADED, copyProgress / 0.4);
        } else {
          wordCol = lerpColor(WORD_FADED, WORD_ABSTRACT, (copyProgress - 0.4) / 0.6);
        }
        wordCol = lerpColor(wordCol, s.primaryRgb, 0.03);

        ctx.save();
        ctx.translate(cx + copy.offsetX, cy + copy.offsetY);
        ctx.rotate(copy.rotation);
        ctx.scale(copy.scaleX, copy.scaleY);

        const fontSize = baseFontSize * (1 + copyProgress * 0.3);
        ctx.font = `${copy.weight} ${Math.round(fontSize)}px -apple-system, 'Helvetica Neue', sans-serif`;

        // Apply letter spacing via manual character positioning
        if (copy.letterSpacing > 1) {
          const chars = TRIGGER_WORD.split('');
          let totalW = 0;
          const charWidths = chars.map(c => {
            const m = ctx.measureText(c);
            totalW += m.width + copy.letterSpacing;
            return m.width;
          });
          totalW -= copy.letterSpacing; // Remove trailing spacing

          let charX = -totalW / 2;
          for (let c = 0; c < chars.length; c++) {
            ctx.fillStyle = rgba(wordCol, copy.alpha * ent);
            ctx.textAlign = 'left';
            ctx.fillText(chars[c], charX, 0);
            charX += charWidths[c] + copy.letterSpacing;
          }
        } else {
          ctx.fillStyle = rgba(wordCol, copy.alpha * ent);
          ctx.fillText(TRIGGER_WORD, 0, 0);
        }

        ctx.restore();
      }

      // ── Initial word (before looping) ──────────────────
      if (!s.tapped) {
        ctx.font = `700 ${baseFontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const wc = lerpColor(WORD_COL, s.primaryRgb, 0.04);
        ctx.fillStyle = rgba(wc, 0.08 * ent);
        ctx.fillText(TRIGGER_WORD, cx, cy);

        // Tap hint
        if (s.frameCount > 120) {
          const hintSize = Math.round(minDim * 0.014);
          ctx.font = `300 ${hintSize}px -apple-system, sans-serif`;
          const hc = lerpColor(HINT_COL, s.primaryRgb, 0.03);
          ctx.fillStyle = rgba(hc, 0.03 * ent);
          ctx.fillText('tap to begin the loop', cx, cy + baseFontSize * 1.5);
        }
      }

      // ── Resolve overlay ────────────────────────────────
      if (s.resolved) {
        s.resolveAlpha = Math.min(1, s.resolveAlpha + 0.003);
        if (s.resolveAlpha > 0.3) {
          const rs = Math.round(minDim * 0.018);
          ctx.font = `200 ${rs}px -apple-system, 'Helvetica Neue', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rc = lerpColor(RESOLVE_COL, s.accentRgb, 0.06);
          const ra = easeOutExpo((s.resolveAlpha - 0.3) / 0.7) * 0.06 * ent;
          ctx.fillStyle = rgba(rc, ra);
          ctx.fillText('just shapes', cx, h * 0.88);
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
      <canvas ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}