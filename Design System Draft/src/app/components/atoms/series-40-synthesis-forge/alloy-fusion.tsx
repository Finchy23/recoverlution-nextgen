/**
 * ATOM 392: THE ALLOY FUSION ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 2
 *
 * Cure Imposter Syndrome. Two different metals aggressively stirred
 * together create a new material stronger than both.
 *
 * PHYSICS:
 *   - Two heavy liquid-metal blocks (primary + accent colored)
 *   - Positioned left/right of center, slowly drifting
 *   - Circular stirring drags them together + blends
 *   - Progressive fusion: edges blur, colors swirl, merge
 *   - Completed alloy: single iridescent sphere with dual-color swirls
 *   - Multi-layer glow emanates from the unified mass
 *
 * INTERACTION:
 *   Drag in circular motion → accumulates stir energy
 *   Stir threshold → irreversible fusion + completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static fused alloy sphere with swirl pattern
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

/** Hero block radius */
const BLOCK_RADIUS_FRAC = 0.15;
/** Separation distance at start */
const INITIAL_SEPARATION = 0.20;
/** Stir threshold to trigger fusion (radians of cumulative rotation) */
const STIR_THRESHOLD = 14;
/** Fused alloy sphere radius */
const ALLOY_RADIUS_FRAC = SIZE.md;
/** Swirl arm count in alloy */
const SWIRL_ARMS = 6;
/** Swirl rotation speed */
const SWIRL_SPEED = 0.018;
/** Fusion animation speed */
const FUSE_SPEED = 0.01;
/** Glow expansion multiplier */
const GLOW_MULT = 1.7;
/** Step haptic interval (stir fraction) */
const STEP_INTERVAL = 0.2;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function AlloyFusionAtom({
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
    stirAmount: 0,
    dragging: false,
    lastAngle: 0,
    fused: false,
    fuseAnim: 0,
    completed: false,
    lastStep: 0,
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
      if (p.phase === 'resolve' && !s.fused) {
        s.stirAmount = Math.min(STIR_THRESHOLD, s.stirAmount + 0.15);
      }

      const ratio = Math.min(1, s.stirAmount / STIR_THRESHOLD);

      // ── Fusion detection ────────────────────────────
      if (ratio >= 1 && !s.fused) {
        s.fused = true;
        cb.onHaptic('completion');
      }
      if (s.fused) {
        s.fuseAnim = Math.min(1, s.fuseAnim + FUSE_SPEED * ms);
      }

      // ── Step haptics ────────────────────────────────
      const currentStep = Math.floor(ratio / STEP_INTERVAL);
      if (currentStep > s.lastStep && !s.fused) {
        s.lastStep = currentStep;
        cb.onHaptic('step_advance');
      }

      cb.onStateChange?.(s.fused
        ? 0.5 + easeOutCubic(s.fuseAnim) * 0.5
        : ratio * 0.5);

      const blockR = px(BLOCK_RADIUS_FRAC, minDim);
      const alloyR = px(ALLOY_RADIUS_FRAC, minDim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const gR = alloyR * GLOW_MULT;
        const sg = ctx.createRadialGradient(cx, cy, alloyR * 0.2, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.beginPath();
        ctx.arc(cx, cy, alloyR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();

        // Static swirl
        for (let i = 0; i < SWIRL_ARMS; i++) {
          const a = (i / SWIRL_ARMS) * Math.PI * 2;
          const sr = alloyR * 0.6;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * sr, cy + Math.sin(a) * sr, alloyR * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.fill();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const fuse = easeOutCubic(s.fuseAnim);
      const separation = (1 - ratio) * px(INITIAL_SEPARATION, minDim);

      // ── Shadow beneath ──────────────────────────────
      const shadowR = alloyR * 1.2;
      const shadow = ctx.createRadialGradient(cx, cy + alloyR * 0.05, 0, cx, cy, shadowR);
      shadow.addColorStop(0, rgba(s.accentRgb, ALPHA.atmosphere.max * 0.06 * entrance));
      shadow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

      // ── Two blocks (fade as fusion progresses) ──────
      if (!s.fused || fuse < 0.5) {
        const blockAlpha = s.fused ? (1 - fuse * 2) : 1;
        const wobble = ratio * Math.sin(s.frameCount * 0.04) * px(0.005, minDim);

        // Left block (accent)
        ctx.beginPath();
        ctx.arc(cx - separation - blockR * 0.3 + wobble, cy, blockR * (1 - ratio * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * blockAlpha * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * blockAlpha * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Right block (primary)
        ctx.beginPath();
        ctx.arc(cx + separation + blockR * 0.3 - wobble, cy, blockR * (1 - ratio * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * blockAlpha * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * blockAlpha * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Merge tendrils (connecting strands as ratio grows)
        if (ratio > 0.3) {
          const tendrilAlpha = (ratio - 0.3) * 1.4 * ALPHA.content.max * 0.15 * blockAlpha * entrance;
          for (let t = 0; t < 3; t++) {
            const ty = cy + (t - 1) * blockR * 0.4;
            ctx.beginPath();
            ctx.moveTo(cx - separation + wobble, ty);
            ctx.quadraticCurveTo(cx, ty + Math.sin(s.frameCount * 0.03 + t) * blockR * 0.2, cx + separation - wobble, ty);
            ctx.strokeStyle = rgba(lerpColor(s.accentRgb, s.primaryRgb, 0.5), tendrilAlpha);
            ctx.lineWidth = px(STROKE.hairline, minDim);
            ctx.stroke();
          }
        }
      }

      // ── Fused alloy sphere ──────────────────────────
      if (ratio > 0.6 || s.fused) {
        const sphereAlpha = s.fused ? fuse : (ratio - 0.6) * 2.5;
        const currentR = s.fused ? alloyR * (0.7 + fuse * 0.3) : alloyR * 0.5 * sphereAlpha;

        // Alloy glow
        const gR = currentR * GLOW_MULT;
        const ag = ctx.createRadialGradient(cx, cy, currentR * 0.2, cx, cy, gR);
        ag.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * sphereAlpha * entrance));
        ag.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.min * sphereAlpha * entrance));
        ag.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ag;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        // Alloy body
        ctx.beginPath();
        ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, s.accentRgb, 0.3),
          ALPHA.content.max * 0.35 * sphereAlpha * entrance,
        );
        ctx.fill();

        // Swirl pattern (dual-color iridescence)
        const swirlAngle = s.frameCount * SWIRL_SPEED;
        for (let i = 0; i < SWIRL_ARMS; i++) {
          const a = swirlAngle + (i / SWIRL_ARMS) * Math.PI * 2;
          const sr = currentR * (0.45 + Math.sin(a * 2 + s.frameCount * 0.01) * 0.1);
          const swirlColor = i % 2 === 0 ? s.primaryRgb : s.accentRgb;

          ctx.beginPath();
          ctx.arc(
            cx + Math.cos(a) * sr,
            cy + Math.sin(a) * sr,
            currentR * 0.18,
            0, Math.PI * 2,
          );
          ctx.fillStyle = rgba(swirlColor, ALPHA.content.max * 0.12 * sphereAlpha * entrance);
          ctx.fill();
        }

        // Bright core
        if (s.fused) {
          const coreR = currentR * 0.2;
          ctx.beginPath();
          ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.35),
            ALPHA.focal.max * 0.3 * fuse * entrance,
          );
          ctx.fill();
        }
      }

      // ── Stir progress ring ──────────────────────────
      if (!s.fused && ratio > 0) {
        const progAngle = ratio * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, alloyR + px(0.025, minDim), -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.lastAngle = Math.atan2(
        e.clientY - rect.top - rect.height / 2,
        e.clientX - rect.left - rect.width / 2,
      );
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.fused) return;
      const rect = canvas.getBoundingClientRect();
      const a = Math.atan2(
        e.clientY - rect.top - rect.height / 2,
        e.clientX - rect.left - rect.width / 2,
      );
      let d = a - s.lastAngle;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      s.stirAmount += Math.abs(d);
      s.lastAngle = a;
    };

    const onUp = () => {
      stateRef.current.dragging = false;
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
          cursor: 'grab',
        }}
      />
    </div>
  );
}
