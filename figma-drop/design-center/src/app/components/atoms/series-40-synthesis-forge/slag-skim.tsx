/**
 * ATOM 396: THE SLAG SKIM ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 6
 *
 * Cure lingering toxic residue. A delicate horizontal swipe skims
 * the ugly crust off to reveal a flawlessly pure mirror finish.
 *
 * PHYSICS:
 *   - Large rectangular molten pool fills center viewport
 *   - Thin ugly crusty slag layer floating on the surface
 *   - Slag rendered as rough, noisy, irregular shapes
 *   - Delicate rightward swipe physically pushes slag off the edge
 *   - Pure mirror surface revealed beneath — reflective gradient
 *   - Slag chunks fall off the right edge with gravity
 *   - Completed mirror surface glows with pristine radiance
 *
 * INTERACTION:
 *   Swipe right → pushes slag rightward incrementally
 *   Each swipe chunk triggers haptic
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static pristine mirror pool with glow
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

/** Pool width (hero sized) */
const POOL_W_FRAC = SIZE.xl;
/** Pool height */
const POOL_H_FRAC = 0.22;
/** Slag skim increment per rightward pixel */
const SKIM_RATE = 0.003;
/** Skim completion threshold */
const SKIM_THRESHOLD = 0.92;
/** Slag chunk count (visual noise particles) */
const SLAG_CHUNKS = 30;
/** Falling slag gravity */
const FALL_GRAVITY = 0.15;
/** Mirror reflection shimmer speed */
const SHIMMER_SPEED = 0.02;
/** Mirror glow radius */
const MIRROR_GLOW_MULT = 1.4;
/** Slag surface roughness amplitude */
const SLAG_ROUGHNESS = 0.008;
/** Completion animation speed */
const COMPLETE_SPEED = 0.01;

// =====================================================================
// STATE TYPES
// =====================================================================

interface FallingChunk {
  x: number;
  y: number;
  vy: number;
  size: number;
  life: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SlagSkimAtom({
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

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    skimProgress: 0,
    swiping: false,
    lastX: 0,
    skimmed: false,
    completeAnim: 0,
    completed: false,
    fallingChunks: [] as FallingChunk[],
    lastHapticStep: 0,
    slagNoise: Array.from({ length: SLAG_CHUNKS }, () => ({
      xOffset: Math.random() * 0.04 - 0.02,
      yOffset: Math.random() * 0.01 - 0.005,
      size: 0.003 + Math.random() * 0.005,
    })),
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

      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.skimmed) {
        s.skimProgress = Math.min(1, s.skimProgress + 0.02);
      }

      // ── Skim detection ──────────────────────────────
      if (s.skimProgress >= SKIM_THRESHOLD && !s.skimmed) {
        s.skimmed = true;
        cb.onHaptic('completion');
      }
      if (s.skimmed) {
        s.completeAnim = Math.min(1, s.completeAnim + COMPLETE_SPEED * ms);
      }

      // ── Step haptics ────────────────────────────────
      const currentStep = Math.floor(s.skimProgress * 5);
      if (currentStep > s.lastHapticStep && !s.skimmed) {
        s.lastHapticStep = currentStep;
        cb.onHaptic('swipe_commit');
      }

      // ── Falling chunks ──────────────────────────────
      for (let i = s.fallingChunks.length - 1; i >= 0; i--) {
        const ch = s.fallingChunks[i];
        ch.vy += FALL_GRAVITY * ms;
        ch.y += ch.vy * ms;
        ch.life -= 0.01;
        if (ch.life <= 0 || ch.y > h + 50) {
          s.fallingChunks.splice(i, 1);
        }
      }

      cb.onStateChange?.(s.skimmed
        ? 0.5 + easeOutCubic(s.completeAnim) * 0.5
        : s.skimProgress * 0.5);

      const poolW = px(POOL_W_FRAC, minDim);
      const poolH = px(POOL_H_FRAC, minDim);
      const poolL = cx - poolW / 2;
      const poolT = cy - poolH / 2;
      const poolR = poolL + poolW;
      const complete = easeOutCubic(s.completeAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Pristine mirror pool
        const gR = poolW * 0.6;
        const sg = ctx.createRadialGradient(cx, cy, poolW * 0.1, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(poolL, poolT, poolW, poolH);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.strokeRect(poolL, poolT, poolW, poolH);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const skim = s.skimProgress;

      // ── Pool shadow ─────────────────────────────────
      const shadowR = poolW * 0.6;
      const shadow = ctx.createRadialGradient(cx, cy + poolH * 0.2, 0, cx, cy, shadowR);
      shadow.addColorStop(0, rgba(s.accentRgb, ALPHA.atmosphere.max * 0.05 * entrance));
      shadow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

      // ── Pure mirror surface (revealed portion) ──────
      const revealWidth = skim * poolW;
      if (revealWidth > 0) {
        // Mirror gradient
        const mirrorGrad = ctx.createLinearGradient(poolL, poolT, poolL, poolT + poolH);
        mirrorGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * (0.25 + complete * 0.1) * entrance));
        mirrorGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * (0.35 + complete * 0.15) * entrance));
        mirrorGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * (0.2 + complete * 0.1) * entrance));

        ctx.save();
        ctx.beginPath();
        ctx.rect(poolL, poolT, revealWidth, poolH);
        ctx.clip();
        ctx.fillStyle = mirrorGrad;
        ctx.fillRect(poolL, poolT, poolW, poolH);

        // Shimmer highlight
        const shimmerX = poolL + (Math.sin(s.frameCount * SHIMMER_SPEED) * 0.5 + 0.5) * revealWidth;
        const shimmerR = poolH * 0.8;
        const sg = ctx.createRadialGradient(shimmerX, cy, 0, shimmerX, cy, shimmerR);
        sg.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
          ALPHA.glow.max * 0.15 * skim * entrance,
        ));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(shimmerX - shimmerR, cy - shimmerR, shimmerR * 2, shimmerR * 2);
        ctx.restore();
      }

      // ── Slag layer (remaining portion) ──────────────
      if (!s.skimmed || complete < 0.5) {
        const slagFade = s.skimmed ? 1 - complete * 2 : 1;
        const slagStartX = poolL + revealWidth;
        const slagW = poolW - revealWidth;

        if (slagW > 0 && slagFade > 0) {
          // Rough slag body
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.18 * slagFade * entrance);
          ctx.fillRect(slagStartX, poolT, slagW, px(SLAG_ROUGHNESS * 3, minDim));

          // Slag noise chunks
          for (const chunk of s.slagNoise) {
            const chX = slagStartX + Math.abs(chunk.xOffset) * slagW + chunk.xOffset * poolW;
            const chY = poolT + chunk.yOffset * poolH;
            if (chX >= slagStartX && chX <= poolR) {
              ctx.beginPath();
              ctx.arc(chX, chY, px(chunk.size, minDim), 0, Math.PI * 2);
              ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * slagFade * entrance);
              ctx.fill();
            }
          }
        }
      }

      // ── Pool border ─────────────────────────────────
      ctx.strokeStyle = rgba(
        s.skimmed ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * (0.15 + complete * 0.1) * entrance,
      );
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.strokeRect(poolL, poolT, poolW, poolH);

      // ── Falling slag chunks ─────────────────────────
      for (const ch of s.fallingChunks) {
        ctx.beginPath();
        ctx.arc(ch.x, ch.y, px(ch.size, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * ch.life * entrance);
        ctx.fill();
      }

      // ── Mirror completion glow ──────────────────────
      if (s.skimmed) {
        const gR = poolW * 0.5 * MIRROR_GLOW_MULT;
        const mg = ctx.createRadialGradient(cx, cy, poolW * 0.1, cx, cy, gR);
        mg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * complete * entrance));
        mg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * complete * entrance));
        mg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ── Skim progress indicator ─────────────────────
      if (!s.skimmed && skim > 0) {
        ctx.beginPath();
        ctx.moveTo(poolL, poolT + poolH + px(0.015, minDim));
        ctx.lineTo(poolL + skim * poolW, poolT + poolH + px(0.015, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.swiping = true;
      stateRef.current.lastX = e.clientX;
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.skimmed) return;

      const dx = e.clientX - s.lastX;
      if (dx > 3) {
        const increment = dx * SKIM_RATE * 0.1;
        s.skimProgress = Math.min(1, s.skimProgress + increment);
        s.lastX = e.clientX;

        // Spawn falling chunk at slag edge
        const minDim = Math.min(viewport.width, viewport.height);
        const poolW = px(POOL_W_FRAC, minDim);
        const poolL = viewport.width / 2 - poolW / 2;
        s.fallingChunks.push({
          x: poolL + s.skimProgress * poolW,
          y: viewport.height / 2 - px(POOL_H_FRAC, minDim) / 2,
          vy: 0,
          size: 0.002 + Math.random() * 0.004,
          life: 1,
        });
      }
    };

    const onUp = () => {
      stateRef.current.swiping = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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
          cursor: 'e-resize',
        }}
      />
    </div>
  );
}
