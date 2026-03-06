/**
 * ATOM 031: THE SENSORY DEPRIVATION ENGINE
 * ==========================================
 * Series 4 — Via Negativa · Position 1
 *
 * The modern nervous system is addicted to constant input and
 * terrified of boredom. This atom forces the user to sit in
 * absolute emptiness, proving that the void is safe.
 *
 * The screen goes completely, terrifyingly dark. OLED blackness.
 * No haptics. No UI. No feedback whatsoever. The user floats in
 * nothing. After 7 seconds of perfect emptiness — an eternity
 * on a phone — a single, devastating word fades into existence:
 * "Float." Then, so faintly you question your own perception,
 * the faintest warm glow breathes from the center of nothing.
 * One haptic pulse. Proof that emptiness was always alive.
 *
 * PHYSICS:
 *   - Phase 1 (0–420 frames): ABSOLUTE VOID. Canvas renders
 *     nothing but primaryRgb-tinted black. Zero interaction.
 *   - Phase 2 (420–600): "Float" emerges — alpha crawl from
 *     0 to 0.12 over 180 frames. System serif, wide tracking.
 *   - Phase 3 (600+): Center glow breathes — so faint it might
 *     be imagined. Warm, barely-there radial gradient.
 *   - Phase 4 (720): entrance_land haptic. One pulse. Done.
 *   - The Nothing Box: after glow, a delicate box outline
 *     appears. Tap to open → inside is nothing → "Perfect."
 *
 * HAPTIC JOURNEY:
 *   Total silence for 12 seconds → entrance_land (one pulse)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Faster phase transitions, no glow animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Frames of absolute void before anything happens */
const VOID_DURATION = 420; // ~7 seconds
/** Frames for text fade-in */
const TEXT_FADE_DURATION = 180; // ~3 seconds
/** Frame when glow starts */
const GLOW_START = 600;
/** Frame for haptic pulse */
const HAPTIC_FRAME = 720;
/** Frame when box outline appears */
const BOX_APPEAR = 900;
/** Frame when "Perfect" can appear (after box tap) */
const BOX_FULLY_VISIBLE = 960;
/** Max text alpha — barely there */
const TEXT_MAX_ALPHA = 0.12;
/** Max glow alpha — you question your perception */
const GLOW_MAX_ALPHA = 0.018;
/** Box outline alpha */
const BOX_ALPHA = 0.06;

// =====================================================================
// COLOR
// =====================================================================

// Palette — the void doesn't have a palette.
// Just the faintest warm whisper.
const VOID_BLACK: RGB = [0, 0, 0];
const EMBER_WARM: RGB = [160, 100, 60];
const TEXT_QUIET: RGB = [180, 170, 160];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SensoryDeprivationAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    frameCount: 0,
    hapticFired: false,
    boxTapped: false,
    perfectAlpha: 0,
    resolved: false,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
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

    // ── Native pointer handler ──────────────────────────
    const onDown = () => {
      if (s.frameCount >= BOX_FULLY_VISIBLE && !s.boxTapped) {
        s.boxTapped = true;
        if (!s.resolved) {
          s.resolved = true;
          cbRef.current.onHaptic('entrance_land');
          cbRef.current.onResolve?.();
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown);

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
      s.frameCount++;

      // Time scaling for reduced motion
      const frame = p.reducedMotion ? s.frameCount * 3 : s.frameCount;

      // ══════════════════════════════════════════════════
      // THE VOID
      // ══════════════════════════════════════════════════

      // Background: true black, tinted imperceptibly by primaryRgb
      const voidColor = lerpColor(VOID_BLACK, s.primaryRgb, 0.008);
      const voidGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.5);
      voidGrad.addColorStop(0, rgba(voidColor, 0.04));
      voidGrad.addColorStop(0.7, rgba(voidColor, 0.02));
      voidGrad.addColorStop(1, rgba(voidColor, 0));
      ctx.fillStyle = voidGrad;
      ctx.fillRect(0, 0, w, h);

      // State: patience in nothing
      const patience = Math.min(1, frame / (HAPTIC_FRAME + 120));
      cb.onStateChange?.(patience);

      // ══════════════════════════════════════════════════
      // PHASE 2: "Float" emerges
      // ══════════════════════════════════════════════════

      if (frame > VOID_DURATION) {
        const textProgress = Math.min(1, (frame - VOID_DURATION) / TEXT_FADE_DURATION);
        const textAlpha = easeOutExpo(textProgress) * TEXT_MAX_ALPHA;
        const textColor = lerpColor(TEXT_QUIET, s.primaryRgb, 0.1);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // System serif, wide tracking — elegant, quiet
        const fontSize = Math.round(minDim * 0.035);
        ctx.font = `300 ${fontSize}px Georgia, "Times New Roman", serif`;
        ctx.letterSpacing = `${fontSize * 0.4}px`;
        ctx.fillStyle = rgba(textColor, textAlpha);
        ctx.fillText('F l o a t', w / 2, h / 2);
        // Reset letter spacing
        ctx.letterSpacing = '0px';
      }

      // ══════════════════════════════════════════════════
      // PHASE 3: The faintest warm glow
      // ══════════════════════════════════════════════════

      if (frame > GLOW_START && !p.reducedMotion) {
        const glowProgress = Math.min(1, (frame - GLOW_START) / 300);
        const breathMod = 0.85 + p.breathAmplitude * 0.15;
        const glowAlpha = easeOutExpo(glowProgress) * GLOW_MAX_ALPHA * breathMod;
        const glowColor = lerpColor(EMBER_WARM, s.primaryRgb, 0.15);

        const glowR = minDim * 0.3;
        const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowR);
        glowGrad.addColorStop(0, rgba(glowColor, glowAlpha));
        glowGrad.addColorStop(0.3, rgba(glowColor, glowAlpha * 0.3));
        glowGrad.addColorStop(0.6, rgba(glowColor, glowAlpha * 0.05));
        glowGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ══════════════════════════════════════════════════
      // PHASE 4: Haptic pulse
      // ══════════════════════════════════════════════════

      if (frame >= HAPTIC_FRAME && !s.hapticFired) {
        s.hapticFired = true;
        cb.onHaptic('entrance_land');
      }

      // ══════════════════════════════════════════════════
      // THE NOTHING BOX
      // ═════════════════════════════════════════════════

      if (frame > BOX_APPEAR) {
        const boxProgress = Math.min(1, (frame - BOX_APPEAR) / 120);
        const boxAlpha = easeOutExpo(boxProgress) * BOX_ALPHA;
        const boxColor = lerpColor(TEXT_QUIET, s.primaryRgb, 0.08);

        const boxSize = minDim * 0.12;
        const boxX = w / 2 - boxSize / 2;
        const boxY = h * 0.68 - boxSize / 2;

        // Box outline — delicate, barely visible
        ctx.strokeStyle = rgba(boxColor, boxAlpha);
        ctx.lineWidth = minDim * 0.001;
        ctx.strokeRect(boxX, boxY, boxSize, boxSize);

        // Lid line (if not opened)
        if (!s.boxTapped) {
          ctx.beginPath();
          const lidOverhang = minDim * 0.004;
          ctx.moveTo(boxX - lidOverhang, boxY);
          ctx.lineTo(boxX + boxSize + lidOverhang, boxY);
          ctx.strokeStyle = rgba(boxColor, boxAlpha * 0.7);
          ctx.lineWidth = minDim * 0.0016;
          ctx.stroke();
        }

        // After tap: "Perfect." appears
        if (s.boxTapped) {
          s.perfectAlpha = Math.min(TEXT_MAX_ALPHA, s.perfectAlpha + 0.0008);
          const perfectColor = lerpColor(TEXT_QUIET, s.accentRgb, 0.12);
          const fontSize = Math.round(minDim * 0.025);
          ctx.font = `300 ${fontSize}px Georgia, "Times New Roman", serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(perfectColor, s.perfectAlpha);
          ctx.fillText('Perfect.', w / 2, h * 0.68 + boxSize * 0.8);

          // The box interior stays empty — the nothing IS the content
          // Open lid: slight rotation effect via lines
          ctx.beginPath();
          ctx.moveTo(boxX, boxY);
          ctx.lineTo(boxX + boxSize * 0.15, boxY - boxSize * 0.2);
          ctx.lineTo(boxX + boxSize + boxSize * 0.15, boxY - boxSize * 0.2);
          ctx.lineTo(boxX + boxSize, boxY);
          ctx.strokeStyle = rgba(boxColor, boxAlpha * 0.5);
          ctx.lineWidth = minDim * 0.0008;
          ctx.stroke();
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