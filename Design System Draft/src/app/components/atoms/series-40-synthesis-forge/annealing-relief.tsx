/**
 * ATOM 395: THE ANNEALING ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 5
 *
 * Cure pushing through trauma too fast. Gentle sustained warmth
 * over 10 seconds erases hidden fractures, making the block unbreakable.
 *
 * PHYSICS:
 *   - Large cool solid block fills center viewport
 *   - Hidden internal micro-fractures visible as jagged lines
 *   - Press and hold to apply gentle sustained warmth
 *   - Warmth radiates inward from edges as soft glow
 *   - Fractures heal one by one (click haptics at each)
 *   - Breath modulates the warmth glow intensity
 *   - Completed: block transforms to unified luminous crystal
 *
 * INTERACTION:
 *   Hold → accumulates warmth (~10s to full)
 *   Release → warmth slowly decays (but healed fractures stay healed)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static healed crystal block with warm glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Block width (hero sized) */
const BLOCK_W_FRAC = SIZE.lg;
/** Block height */
const BLOCK_H_FRAC = 0.38;
/** Warmth accumulation rate */
const WARMTH_RATE = 0.0017;
/** Warmth decay rate */
const WARMTH_DECAY = 0.0004;
/** Number of internal fractures */
const FRACTURE_COUNT = 12;
/** Fracture heal threshold spacing */
const FRACTURE_HEAL_INTERVAL = 1 / FRACTURE_COUNT;
/** Warmth glow expansion */
const WARMTH_GLOW_MULT = 1.4;
/** Breath modulation depth */
const BREATH_MOD = 0.2;
/** Corner radius fraction */
const CORNER_R_FRAC = 0.015;
/** Healed crystal inner glow */
const CRYSTAL_GLOW_MULT = 1.6;
/** Completion animation speed */
const COMPLETE_SPEED = 0.008;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Fracture {
  x1: number; y1: number;
  x2: number; y2: number;
  midX: number; midY: number;
  healed: boolean;
  healAnim: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function generateFractures(): Fracture[] {
  return Array.from({ length: FRACTURE_COUNT }, () => {
    const cx = 0.35 + Math.random() * 0.30;
    const cy = 0.30 + Math.random() * 0.40;
    const angle = Math.random() * Math.PI;
    const len = 0.03 + Math.random() * 0.06;
    return {
      x1: cx - Math.cos(angle) * len,
      y1: cy - Math.sin(angle) * len,
      x2: cx + Math.cos(angle) * len,
      y2: cy + Math.sin(angle) * len,
      midX: cx,
      midY: cy,
      healed: false,
      healAnim: 0,
    };
  });
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function AnnealingReliefAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const fracturesRef = useRef(generateFractures());

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    holding: false,
    warmth: 0,
    allHealed: false,
    completeAnim: 0,
    completed: false,
    healedCount: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const fractures = fracturesRef.current;

      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve') {
        s.warmth = Math.min(1, s.warmth + 0.02);
      }

      // ── Warmth physics ──────────────────────────────
      if (s.holding && !s.allHealed) {
        s.warmth = Math.min(1, s.warmth + WARMTH_RATE * ms);
      } else if (!s.allHealed) {
        s.warmth = Math.max(0, s.warmth - WARMTH_DECAY * ms);
      }

      // ── Fracture healing ────────────────────────────
      let healed = 0;
      for (let i = 0; i < fractures.length; i++) {
        const threshold = (i + 1) * FRACTURE_HEAL_INTERVAL;
        if (s.warmth >= threshold && !fractures[i].healed) {
          fractures[i].healed = true;
          cb.onHaptic('step_advance');
        }
        if (fractures[i].healed) {
          fractures[i].healAnim = Math.min(1, fractures[i].healAnim + 0.015 * ms);
          healed++;
        }
      }
      s.healedCount = healed;

      // ── All healed detection ────────────────────────
      if (healed >= FRACTURE_COUNT && !s.allHealed) {
        s.allHealed = true;
        cb.onHaptic('completion');
      }
      if (s.allHealed) {
        s.completeAnim = Math.min(1, s.completeAnim + COMPLETE_SPEED * ms);
      }

      cb.onStateChange?.(s.allHealed
        ? 0.5 + easeOutCubic(s.completeAnim) * 0.5
        : (healed / FRACTURE_COUNT) * 0.5);

      const blockW = px(BLOCK_W_FRAC, minDim);
      const blockH = px(BLOCK_H_FRAC, minDim);
      const cornerR = px(CORNER_R_FRAC, minDim);
      const complete = easeOutCubic(s.completeAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Healed crystal block
        const gR = Math.max(blockW, blockH) * CRYSTAL_GLOW_MULT;
        const sg = ctx.createRadialGradient(cx, cy, blockW * 0.2, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.beginPath();
        ctx.roundRect(cx - blockW / 2, cy - blockH / 2, blockW, blockH, cornerR);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const breathMod = 1 + breath * BREATH_MOD;

      // ── Warmth glow (behind block) ──────────────────
      if (s.warmth > 0.05) {
        const warmGlowR = Math.max(blockW, blockH) * WARMTH_GLOW_MULT * breathMod;
        const wg = ctx.createRadialGradient(cx, cy, blockW * 0.1, cx, cy, warmGlowR);
        wg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * s.warmth * entrance));
        wg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * s.warmth * entrance));
        wg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = wg;
        ctx.fillRect(cx - warmGlowR, cy - warmGlowR, warmGlowR * 2, warmGlowR * 2);
      }

      // ── Block body ──────────────────────────────────
      const blockColor = s.allHealed
        ? lerpColor(s.accentRgb, s.primaryRgb, complete) as RGB
        : lerpColor(s.accentRgb, s.primaryRgb, s.warmth * 0.5) as RGB;

      ctx.beginPath();
      ctx.roundRect(cx - blockW / 2, cy - blockH / 2, blockW, blockH, cornerR);
      ctx.fillStyle = rgba(blockColor, ALPHA.content.max * (0.2 + s.warmth * 0.1 + complete * 0.1) * entrance);
      ctx.fill();

      // Block edge
      ctx.strokeStyle = rgba(blockColor, ALPHA.content.max * (0.2 + complete * 0.15) * entrance);
      ctx.lineWidth = px(STROKE.thin + complete * STROKE.medium, minDim);
      ctx.stroke();

      // ── Fracture lines (fade as healed) ─────────────
      for (const f of fractures) {
        const alpha = (1 - f.healAnim);
        if (alpha <= 0.01) continue;

        // Jagged fracture line
        ctx.beginPath();
        ctx.moveTo(f.x1 * w, f.y1 * h);
        // Add zigzag midpoint
        ctx.lineTo(
          f.midX * w + (Math.random() - 0.5) * 2 * alpha,
          f.midY * h + (Math.random() - 0.5) * 2 * alpha,
        );
        ctx.lineTo(f.x2 * w, f.y2 * h);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * alpha * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Heal glow at fracture point
        if (f.healAnim > 0 && f.healAnim < 1) {
          const healR = px(0.015, minDim);
          const hg = ctx.createRadialGradient(f.midX * w, f.midY * h, 0, f.midX * w, f.midY * h, healR);
          hg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * f.healAnim * entrance));
          hg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = hg;
          ctx.fillRect(f.midX * w - healR, f.midY * h - healR, healR * 2, healR * 2);
        }
      }

      // ── Crystal inner pattern (appears when healed) ─
      if (s.allHealed && complete > 0.1) {
        // Inner crystalline grid
        const gridLines = 5;
        const halfW = blockW / 2 * 0.8;
        const halfH = blockH / 2 * 0.8;
        ctx.globalAlpha = complete * 0.5;

        for (let i = 1; i < gridLines; i++) {
          const frac = i / gridLines;
          // Vertical
          const vx = cx - halfW + frac * halfW * 2;
          ctx.beginPath();
          ctx.moveTo(vx, cy - halfH);
          ctx.lineTo(vx, cy + halfH);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * complete * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();

          // Horizontal
          const hy = cy - halfH + frac * halfH * 2;
          ctx.beginPath();
          ctx.moveTo(cx - halfW, hy);
          ctx.lineTo(cx + halfW, hy);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * complete * entrance);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Central unity glow
        const unityR = Math.min(blockW, blockH) * 0.3 * complete;
        const ug = ctx.createRadialGradient(cx, cy, 0, cx, cy, unityR);
        ug.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.25),
          ALPHA.focal.max * 0.3 * complete * entrance,
        ));
        ug.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ug;
        ctx.fillRect(cx - unityR, cy - unityR, unityR * 2, unityR * 2);
      }

      // ── Warmth progress ring ────────────────────────
      if (!s.allHealed && s.warmth > 0) {
        const progAngle = s.warmth * Math.PI * 2;
        const ringR = Math.max(blockW, blockH) * 0.55 + px(0.02, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = () => {
      stateRef.current.holding = true;
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = () => {
      stateRef.current.holding = false;
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
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
