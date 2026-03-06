/**
 * ATOM 211: THE SEMANTIC STRIPPING ENGINE
 * =========================================
 * Series 22 — Predictive Override · Position 1
 *
 * Remove the word. See it raw. React to the sensation, not the label.
 * Hold to melt text into pure chromatic expansion — the label
 * dissolves, only warm chromaticity remains.
 *
 * SIGNATURE TECHNIQUE: Sensory deconstruction — letter-by-letter
 * dissolution, individual character physics, color field emergence
 * from behind text, progressive blur-to-glow transition.
 *
 * INTERACTION: Hold → text melts → pure color emerges
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static color field
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  motionScale, type RGB,
} from '../atom-utils';

const WORDS = ['ANXIETY', 'FAILURE', 'WORTHLESS', 'BROKEN', 'ALONE'];
const MELT_RATE        = 0.006;
const COLOR_EMERGE     = 0.008;
const LETTER_DRIFT     = 0.0003;
const RESPAWN_DELAY    = 100;

interface LetterState {
  char: string; x: number; y: number;
  blur: number; drift: number; driftAngle: number;
}

interface StripState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  holding: boolean;
  meltProgress: number;        // 0-1
  colorField: number;          // 0-1
  letters: LetterState[];
  wordIndex: number;
  completed: boolean;
  respawnTimer: number;
}

function makeLetters(word: string): LetterState[] {
  return word.split('').map((char, i) => ({
    char,
    x: (i - word.length / 2) * 0.06,
    y: 0,
    blur: 0,
    drift: 0,
    driftAngle: Math.random() * Math.PI * 2,
  }));
}

function freshState(c: string, a: string): StripState {
  const idx = Math.floor(Math.random() * WORDS.length);
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    holding: false, meltProgress: 0, colorField: 0,
    letters: makeLetters(WORDS[idx]), wordIndex: idx,
    completed: false, respawnTimer: 0,
  };
}

export default function SemanticStrippingAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (s.holding) {
          s.meltProgress = Math.min(1, s.meltProgress + MELT_RATE);
          s.colorField = Math.min(1, s.colorField + COLOR_EMERGE);

          for (const l of s.letters) {
            l.blur = Math.min(1, l.blur + 0.008 + Math.random() * 0.003);
            l.drift += LETTER_DRIFT;
            l.x += Math.cos(l.driftAngle) * l.drift * ms;
            l.y += Math.sin(l.driftAngle) * l.drift * ms;
          }

          if (s.frameCount % 15 === 0) cb.onHaptic('step_advance');
          cb.onStateChange?.(s.meltProgress);

          if (s.meltProgress >= 1) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      // ── LAYER 2: Color field (emerges behind text) ──
      if (s.colorField > 0) {
        const fieldR = px(SIZE.xl, minDim) * s.colorField;
        const fieldGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fieldR);
        fieldGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.colorField * entrance));
        fieldGrad.addColorStop(0.5, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.3), ALPHA.glow.max * 0.2 * s.colorField * entrance));
        fieldGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fieldGrad;
        ctx.fillRect(cx - fieldR, cy - fieldR, fieldR * 2, fieldR * 2);
      }

      // ── LAYER 3: Warm chromaticity bands ────────────
      if (s.colorField > 0.3) {
        const bands = 5;
        for (let i = 0; i < bands; i++) {
          const bandY = cy + (i - bands / 2) * px(0.04, minDim);
          const bandAlpha = (s.colorField - 0.3) * 0.7 * ALPHA.atmosphere.max * entrance;
          const bandColor = lerpColor(s.primaryRgb, s.accentRgb, i / bands);
          ctx.fillStyle = rgba(bandColor, bandAlpha * ms);
          ctx.fillRect(0, bandY - px(0.008, minDim), w, px(0.016, minDim));
        }
      }

      // ── LAYER 4-5: Letters (melting) ────────────────
      const fontSize = Math.max(16, px(FONT_SIZE.lg * 1.2, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const l of s.letters) {
        const lx = cx + l.x * minDim;
        const ly = cy + l.y * minDim;

        // Glow behind dissolving letter
        if (l.blur > 0.3) {
          const glowR = fontSize * (0.5 + l.blur);
          const lGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, glowR);
          lGlow.addColorStop(0, rgba(s.primaryRgb, l.blur * ALPHA.glow.max * 0.2 * entrance));
          lGlow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = lGlow;
          ctx.fillRect(lx - glowR, ly - glowR, glowR * 2, glowR * 2);
        }

        // Letter itself (fading)
        const letterAlpha = Math.max(0, 1 - l.blur) * ALPHA.content.max * entrance;
        if (letterAlpha > 0.01) {
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(l.drift * 3);
          ctx.globalAlpha = letterAlpha;
          ctx.fillStyle = rgba(s.accentRgb, 1);
          ctx.fillText(l.char, 0, 0);
          ctx.globalAlpha = 1;
          ctx.restore();
        }
      }

      ctx.textBaseline = 'alphabetic';

      // ── LAYER 6: Pure sensation indicator ──────────
      if (s.colorField > 0.5) {
        const sensFont = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${sensFont}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, (s.colorField - 0.5) * 2 * ALPHA.text.max * 0.3 * entrance);
        ctx.fillText('SENSATION', cx, cy + px(0.12, minDim));
      }

      // ── LAYER 7: Melt progress ─────────────────────
      const barW = px(SIZE.md * 0.7, minDim);
      const barH = px(0.005, minDim);
      const barX = cx - barW / 2;
      const barY = h - px(0.07, minDim);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(barX, barY, barW * s.meltProgress, barH);

      // ── LAYER 8: HUD ───────────────────────────────
      const hudFont = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${hudFont}px monospace`;
      ctx.textAlign = 'center';

      if (s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('RAW', cx, h - px(0.035, minDim));
      } else if (!s.holding) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('HOLD TO DISSOLVE', cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        const sfR = px(SIZE.md, minDim);
        const sfGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sfR);
        sfGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        sfGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sfGrad;
        ctx.fillRect(cx - sfR, cy - sfR, sfR * 2, sfR * 2);
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          Object.assign(s, freshState(color, accentColor));
          s.entranceProgress = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.holding = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
