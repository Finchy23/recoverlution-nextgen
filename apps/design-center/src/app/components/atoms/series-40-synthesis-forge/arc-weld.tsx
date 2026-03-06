/**
 * ATOM 397: THE ARC WELD ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 7
 *
 * Cure the belief that shattered trust can never be repaired.
 * Drag intense electricity down the seam — it becomes the strongest part.
 *
 * PHYSICS:
 *   - Two massive broken halves fill the viewport, pinched together
 *   - Visible jagged weak seam running vertically down the center
 *   - User drags slowly downward along the seam
 *   - Electric arc follows the touch with branching lightning
 *   - Welded portion glows intensely, seam becomes thickest point
 *   - Spark particles scatter from the weld point
 *   - Completed: unified block with luminous seam — strongest bond
 *
 * INTERACTION:
 *   Drag down center seam → welds progressively from top to bottom
 *   Off-center drag → arc fizzles (must stay on seam)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static unified block with glowing seam
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

/** Block half width */
const BLOCK_HALF_W = SIZE.md;
/** Block height */
const BLOCK_H = 0.42;
/** Seam tolerance (how close to center X the touch must be) */
const SEAM_TOLERANCE = 0.08;
/** Weld increment per valid move pixel */
const WELD_RATE = 0.004;
/** Arc spark count per frame while welding */
const SPARK_RATE = 2;
/** Max sparks alive */
const MAX_SPARKS = 50;
/** Arc branch count */
const ARC_BRANCHES = 4;
/** Arc branch spread */
const ARC_SPREAD = 0.025;
/** Seam glow radius */
const SEAM_GLOW_FRAC = 0.06;
/** Completion glow multiplier */
const COMPLETE_GLOW_MULT = 1.5;
/** Weld speed for completion anim */
const COMPLETE_SPEED = 0.008;
/** Step haptic interval */
const STEP_INTERVAL = 0.15;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ArcWeldAtom({
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
    weldProgress: 0,
    dragging: false,
    arcY: 0,
    welded: false,
    completeAnim: 0,
    completed: false,
    sparks: [] as Spark[],
    lastStep: 0,
    jaggedSeam: Array.from({ length: 20 }, (_, i) => ({
      y: i / 19,
      xOffset: (Math.random() - 0.5) * 0.02,
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
      if (p.phase === 'resolve' && !s.welded) {
        s.weldProgress = Math.min(1, s.weldProgress + 0.02);
      }

      // ── Weld detection ──────────────────────────────
      if (s.weldProgress >= 0.95 && !s.welded) {
        s.welded = true;
        cb.onHaptic('completion');
      }
      if (s.welded) {
        s.completeAnim = Math.min(1, s.completeAnim + COMPLETE_SPEED * ms);
      }

      // ── Step haptics ────────────────────────────────
      const currentStep = Math.floor(s.weldProgress / STEP_INTERVAL);
      if (currentStep > s.lastStep && !s.welded) {
        s.lastStep = currentStep;
        cb.onHaptic('step_advance');
      }

      // ── Spark physics ───────────────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.08; // Gravity
        sp.life -= 0.025;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }

      cb.onStateChange?.(s.welded
        ? 0.5 + easeOutCubic(s.completeAnim) * 0.5
        : s.weldProgress * 0.5);

      const halfW = px(BLOCK_HALF_W, minDim);
      const blockH = px(BLOCK_H, minDim);
      const blockTop = cy - blockH / 2;
      const blockBot = cy + blockH / 2;
      const complete = easeOutCubic(s.completeAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Unified block with glowing seam
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.fillRect(cx - halfW, blockTop, halfW * 2, blockH);

        // Seam glow
        const seamGR = px(SEAM_GLOW_FRAC, minDim) * 2;
        const sg = ctx.createLinearGradient(cx - seamGR, 0, cx + seamGR, 0);
        sg.addColorStop(0, rgba(s.primaryRgb, 0));
        sg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - seamGR, blockTop, seamGR * 2, blockH);

        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.strokeRect(cx - halfW, blockTop, halfW * 2, blockH);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const gap = s.welded ? 0 : px(0.004 * (1 - s.weldProgress), minDim);

      // ── Left half ───────────────────────────────────
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (0.2 + complete * 0.1) * entrance);
      ctx.fillRect(cx - halfW, blockTop, halfW - gap, blockH);

      // ── Right half ──────────────────────────────────
      ctx.fillRect(cx + gap, blockTop, halfW - gap, blockH);

      // ── Jagged seam (unwelded portion) ──────────────
      const weldedToY = blockTop + s.weldProgress * blockH;

      if (s.weldProgress < 1) {
        ctx.beginPath();
        for (let i = 0; i < s.jaggedSeam.length; i++) {
          const sy = blockTop + s.jaggedSeam[i].y * blockH;
          if (sy < weldedToY) continue;
          const sx = cx + s.jaggedSeam[i].xOffset * minDim;
          if (i === 0 || sy < weldedToY + 2) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Welded seam (completed portion) ─────────────
      if (s.weldProgress > 0) {
        // Seam line (thick, bright)
        ctx.beginPath();
        ctx.moveTo(cx, blockTop);
        ctx.lineTo(cx, weldedToY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.lineWidth = px(STROKE.medium * 1.5, minDim);
        ctx.stroke();

        // Seam glow
        const seamGR = px(SEAM_GLOW_FRAC, minDim);
        const seamGrad = ctx.createLinearGradient(cx - seamGR, 0, cx + seamGR, 0);
        seamGrad.addColorStop(0, rgba(s.primaryRgb, 0));
        seamGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        seamGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = seamGrad;
        ctx.fillRect(cx - seamGR, blockTop, seamGR * 2, weldedToY - blockTop);
      }

      // ── Active arc point (while dragging) ───────────
      if (s.dragging && !s.welded) {
        const arcDrawY = blockTop + s.weldProgress * blockH;

        // Arc glow
        const arcR = px(0.04, minDim);
        const ag = ctx.createRadialGradient(cx, arcDrawY, 0, cx, arcDrawY, arcR);
        ag.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5),
          ALPHA.focal.max * 0.6 * entrance,
        ));
        ag.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        ag.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ag;
        ctx.fillRect(cx - arcR, arcDrawY - arcR, arcR * 2, arcR * 2);

        // Lightning branches
        for (let b = 0; b < ARC_BRANCHES; b++) {
          const angle = (b / ARC_BRANCHES) * Math.PI * 2 + s.frameCount * 0.1;
          const branchLen = px(ARC_SPREAD + Math.random() * ARC_SPREAD, minDim);
          ctx.beginPath();
          ctx.moveTo(cx, arcDrawY);
          let bx = cx;
          let by = arcDrawY;
          for (let seg = 0; seg < 4; seg++) {
            bx += Math.cos(angle + (Math.random() - 0.5) * 2) * branchLen * 0.3;
            by += Math.sin(angle + (Math.random() - 0.5) * 2) * branchLen * 0.3;
            ctx.lineTo(bx, by);
          }
          ctx.strokeStyle = rgba(
            lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
            ALPHA.content.max * 0.3 * entrance,
          );
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Spawn sparks
        if (s.sparks.length < MAX_SPARKS) {
          for (let i = 0; i < SPARK_RATE; i++) {
            const angle = Math.random() * Math.PI * 2;
            s.sparks.push({
              x: cx + (Math.random() - 0.5) * 6,
              y: arcDrawY,
              vx: Math.cos(angle) * (2 + Math.random() * 4),
              vy: Math.sin(angle) * (2 + Math.random() * 4) - 2,
              life: 0.5 + Math.random() * 0.5,
            });
          }
        }
      }

      // ── Sparks ──────────────────────────────────────
      for (const sp of s.sparks) {
        const spR = px(0.002 * sp.life, minDim);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 230, 150] as RGB, 0.5),
          ALPHA.content.max * sp.life * 0.6 * entrance,
        );
        ctx.fill();
      }

      // ── Unified completion glow ─────────────────────
      if (s.welded) {
        const gR = halfW * COMPLETE_GLOW_MULT;
        const cg = ctx.createRadialGradient(cx, cy, halfW * 0.3, cx, cy, gR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * complete * entrance));
        cg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * complete * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        // Block border (unified)
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * complete * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.strokeRect(cx - halfW, blockTop, halfW * 2, blockH);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = () => {
      stateRef.current.dragging = true;
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.welded) return;

      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top) / rect.height;

      // Must be near center seam
      if (Math.abs(normX - 0.5) < SEAM_TOLERANCE) {
        // Map Y position to weld progress
        const blockTopFrac = 0.5 - BLOCK_H / 2;
        const blockBotFrac = 0.5 + BLOCK_H / 2;
        if (normY >= blockTopFrac && normY <= blockBotFrac) {
          const localY = (normY - blockTopFrac) / (blockBotFrac - blockTopFrac);
          s.weldProgress = Math.max(s.weldProgress, localY);
          s.arcY = normY;
        }
      }
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
          cursor: 'ns-resize',
        }}
      />
    </div>
  );
}
