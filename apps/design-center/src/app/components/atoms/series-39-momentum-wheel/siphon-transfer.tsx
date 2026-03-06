/**
 * ATOM 387: THE SIPHON TRANSFER ENGINE
 * ======================================
 * Series 39 — Momentum Wheel · Position 7
 *
 * Cure spending hours fueled by anxiety while believing you have
 * zero energy for your art. Siphon and convert the wasted fuel.
 *
 * PHYSICS:
 *   - Two digital liquid tanks side by side
 *   - Left tank: full of chaotic agitated red liquid (anxiety fuel)
 *   - Right tank: empty calm destination (creation fuel)
 *   - User drags from left tank to right to draw siphon tube
 *   - Once connected: fluid automatically transfers and converts
 *   - Red chaotic particles become calm blue particles through tube
 *   - Liquid levels animate: source drains, destination fills
 *   - Breath modulates the flow rate through the siphon
 *
 * INTERACTION:
 *   Drag (from source to dest) → connects siphon tube
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static tanks with tube connected, dest full
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

/** Tank width (fraction of minDim) */
const TANK_W_FRAC = 0.15;
/** Tank height (fraction of minDim) */
const TANK_H_FRAC = SIZE.md;
/** Tank corner radius */
const TANK_CORNER_FRAC = 0.012;
/** Left tank center X (fraction of viewport) */
const SRC_X_FRAC = 0.25;
/** Right tank center X */
const DEST_X_FRAC = 0.75;
/** Tank vertical center */
const TANK_Y_FRAC = 0.50;
/** Flow rate (level change per frame) */
const FLOW_RATE = 0.0025;
/** Breath flow modulation */
const BREATH_FLOW_FACTOR = 0.25;
/** Flow particle count in tube */
const FLOW_PARTICLE_COUNT = 12;
/** Flow particle speed */
const FLOW_PARTICLE_SPEED = 0.015;
/** Agitation amplitude for source liquid */
const AGITATION_AMP = 0.008;
/** Agitation frequency */
const AGITATION_FREQ = 0.12;
/** Bubble count in source tank */
const BUBBLE_COUNT = 15;
/** Tube arc height (fraction of minDim) */
const TUBE_ARC_FRAC = 0.12;
/** Tube thickness */
const TUBE_THICKNESS_FRAC = 0.005;
/** Siphon drag connection threshold */
const CONNECT_THRESHOLD = 0.08;
/** Completion glow duration */
const COMPLETION_RATE = 0.008;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Bubble {
  x: number;   // within tank (0-1)
  y: number;   // within liquid (0-1)
  r: number;   // radius multiplier
  speed: number;
  phase: number;
}

interface FlowParticle {
  t: number;   // 0-1 position along tube path
  active: boolean;
}

// =====================================================================
// HELPERS
// =====================================================================

function createBubbles(): Bubble[] {
  return Array.from({ length: BUBBLE_COUNT }, () => ({
    x: 0.1 + Math.random() * 0.8,
    y: Math.random(),
    r: 0.3 + Math.random() * 0.7,
    speed: 0.002 + Math.random() * 0.004,
    phase: Math.random() * Math.PI * 2,
  }));
}

function createFlowParticles(): FlowParticle[] {
  return Array.from({ length: FLOW_PARTICLE_COUNT }, (_, i) => ({
    t: i / FLOW_PARTICLE_COUNT,
    active: false,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SiphonTransferAtom({
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
    sourceLevel: 1.0,
    destLevel: 0.0,
    connected: false,
    completed: false,
    completionAnim: 0,
    bubbles: createBubbles(),
    flowParticles: createFlowParticles(),
    // Drag state for tube
    dragging: false,
    dragX: 0,
    dragY: 0,
    dragStartedInSource: false,
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

    /** Get point along siphon tube bezier at t */
    function tubePoint(t: number, srcTop: { x: number; y: number }, destTop: { x: number; y: number }, arcH: number): { x: number; y: number } {
      const midX = (srcTop.x + destTop.x) / 2;
      const midY = Math.min(srcTop.y, destTop.y) - arcH;
      // Quadratic bezier
      const mt = 1 - t;
      return {
        x: mt * mt * srcTop.x + 2 * mt * t * midX + t * t * destTop.x,
        y: mt * mt * srcTop.y + 2 * mt * t * midY + t * t * destTop.y,
      };
    }

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;

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
      if (p.phase === 'resolve' && !s.connected) {
        s.connected = true;
      }

      // ── Transfer physics ────────────────────────────
      if (s.connected && s.sourceLevel > 0.01) {
        const flowRate = FLOW_RATE * (1 + breath * BREATH_FLOW_FACTOR) * ms;
        s.sourceLevel = Math.max(0, s.sourceLevel - flowRate);
        s.destLevel = Math.min(1, s.destLevel + flowRate);
      }

      if (s.destLevel >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + COMPLETION_RATE * ms);
      }

      // ── Flow particles ──────────────────────────────
      if (s.connected && s.sourceLevel > 0.02) {
        for (const fp of s.flowParticles) {
          fp.active = true;
          fp.t += FLOW_PARTICLE_SPEED * ms;
          if (fp.t >= 1) fp.t -= 1;
        }
      }

      // ── Bubbles ─────────────────────────────────────
      for (const b of s.bubbles) {
        b.y -= b.speed * ms;
        b.phase += 0.05 * ms;
        if (b.y < 0) {
          b.y = 1;
          b.x = 0.1 + Math.random() * 0.8;
        }
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : s.destLevel * 0.5);

      // ── Tank geometry ───────────────────────────────
      const tankW = px(TANK_W_FRAC, minDim);
      const tankH = px(TANK_H_FRAC, minDim);
      const tankR = px(TANK_CORNER_FRAC, minDim);
      const srcCx = SRC_X_FRAC * w;
      const destCx = DEST_X_FRAC * w;
      const tankTop = TANK_Y_FRAC * h - tankH / 2;
      const tankBot = tankTop + tankH;

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Source tank (empty)
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.beginPath();
        ctx.roundRect(srcCx - tankW / 2, tankTop, tankW, tankH, tankR);
        ctx.stroke();

        // Dest tank (full)
        ctx.beginPath();
        ctx.roundRect(destCx - tankW / 2, tankTop, tankW, tankH, tankR);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.stroke();

        // Dest liquid
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(destCx - tankW / 2 + 1, tankTop + 1, tankW - 2, tankH - 2, tankR);
        ctx.clip();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(destCx - tankW / 2, tankTop, tankW, tankH);
        ctx.restore();

        // Tube
        const srcTopPt = { x: srcCx, y: tankTop };
        const destTopPt = { x: destCx, y: tankTop };
        const arcH = px(TUBE_ARC_FRAC, minDim);
        ctx.beginPath();
        ctx.moveTo(srcTopPt.x, srcTopPt.y);
        ctx.quadraticCurveTo((srcTopPt.x + destTopPt.x) / 2, Math.min(srcTopPt.y, destTopPt.y) - arcH, destTopPt.x, destTopPt.y);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(TUBE_THICKNESS_FRAC, minDim);
        ctx.stroke();

        // Completion glow
        const glowR = tankH;
        const gg = ctx.createRadialGradient(destCx, cy, 0, destCx, cy, glowR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(destCx - glowR, cy - glowR, glowR * 2, glowR * 2);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Source tank ─────────────────────────────────
      // Tank outline
      ctx.beginPath();
      ctx.roundRect(srcCx - tankW / 2, tankTop, tankW, tankH, tankR);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Source liquid (chaotic, agitated)
      if (s.sourceLevel > 0.01) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(srcCx - tankW / 2 + 1, tankTop + 1, tankW - 2, tankH - 2, tankR);
        ctx.clip();

        const liquidTop = tankBot - tankH * s.sourceLevel;
        const agitation = Math.sin(s.frameCount * AGITATION_FREQ) * px(AGITATION_AMP, minDim);

        // Liquid body with wavy top
        ctx.beginPath();
        ctx.moveTo(srcCx - tankW / 2, liquidTop + agitation);
        for (let x = 0; x <= 1; x += 0.05) {
          const wx = srcCx - tankW / 2 + x * tankW;
          const wy = liquidTop + Math.sin(s.frameCount * 0.1 + x * 8) * px(0.003, minDim) + agitation;
          ctx.lineTo(wx, wy);
        }
        ctx.lineTo(srcCx + tankW / 2, tankBot);
        ctx.lineTo(srcCx - tankW / 2, tankBot);
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * s.sourceLevel * entrance);
        ctx.fill();

        // Agitation bubbles
        for (const b of s.bubbles) {
          if (b.y > s.sourceLevel) continue;
          const bx = srcCx - tankW / 2 + b.x * tankW;
          const by = tankBot - b.y * tankH;
          const br = px(0.003, minDim) * b.r;
          const wobble = Math.sin(b.phase) * px(0.002, minDim);
          ctx.beginPath();
          ctx.arc(bx + wobble, by, br, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.fill();
        }

        ctx.restore();
      }

      // ── Destination tank ────────────────────────────
      ctx.beginPath();
      ctx.roundRect(destCx - tankW / 2, tankTop, tankW, tankH, tankR);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Dest liquid (calm, smooth)
      if (s.destLevel > 0.01) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(destCx - tankW / 2 + 1, tankTop + 1, tankW - 2, tankH - 2, tankR);
        ctx.clip();

        const destLiquidTop = tankBot - tankH * s.destLevel;

        // Smooth calm liquid
        ctx.beginPath();
        ctx.moveTo(destCx - tankW / 2, destLiquidTop);
        ctx.lineTo(destCx + tankW / 2, destLiquidTop);
        ctx.lineTo(destCx + tankW / 2, tankBot);
        ctx.lineTo(destCx - tankW / 2, tankBot);
        ctx.closePath();

        // Gradient fill for depth
        const liquidGrad = ctx.createLinearGradient(0, destLiquidTop, 0, tankBot);
        liquidGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
        liquidGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance));
        ctx.fillStyle = liquidGrad;
        ctx.fill();

        ctx.restore();
      }

      // ── Dest tank glow (fills as level rises) ───────
      if (s.destLevel > 0.1) {
        const dgR = tankH * 0.5 * s.destLevel;
        const dg = ctx.createRadialGradient(destCx, cy, tankW * 0.2, destCx, cy, dgR);
        dg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * s.destLevel * entrance));
        dg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = dg;
        ctx.fillRect(destCx - dgR, cy - dgR, dgR * 2, dgR * 2);
      }

      // ── Siphon tube ─────────────────────────────────
      const srcTopPt = { x: srcCx + tankW * 0.3, y: tankTop + tankH * 0.1 };
      const destTopPt = { x: destCx - tankW * 0.3, y: tankTop + tankH * 0.1 };
      const arcH = px(TUBE_ARC_FRAC, minDim);

      if (s.connected) {
        // Draw tube
        ctx.beginPath();
        ctx.moveTo(srcTopPt.x, srcTopPt.y);
        ctx.quadraticCurveTo(
          (srcTopPt.x + destTopPt.x) / 2,
          Math.min(srcTopPt.y, destTopPt.y) - arcH,
          destTopPt.x, destTopPt.y,
        );
        ctx.strokeStyle = rgba(
          lerpColor(s.accentRgb, s.primaryRgb, 0.5),
          ALPHA.content.max * 0.25 * entrance,
        );
        ctx.lineWidth = px(TUBE_THICKNESS_FRAC, minDim);
        ctx.stroke();

        // Flow particles along tube
        if (s.sourceLevel > 0.02) {
          for (const fp of s.flowParticles) {
            if (!fp.active) continue;
            const pt = tubePoint(fp.t, srcTopPt, destTopPt, arcH);
            const flowColor = lerpColor(s.accentRgb, s.primaryRgb, fp.t);
            const fpR = px(0.004, minDim);

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, fpR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(flowColor, ALPHA.content.max * 0.35 * entrance);
            ctx.fill();
          }
        }
      } else if (s.dragging && s.dragStartedInSource) {
        // Draw partial tube from source to pointer
        ctx.beginPath();
        ctx.moveTo(srcTopPt.x, srcTopPt.y);
        const midY = Math.min(srcTopPt.y, s.dragY) - arcH * 0.5;
        ctx.quadraticCurveTo(
          (srcTopPt.x + s.dragX) / 2, midY,
          s.dragX, s.dragY,
        );
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(TUBE_THICKNESS_FRAC, minDim);
        ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Completion glow ─────────────────────────────
      if (s.completed) {
        const cGlowR = px(GLOW.md, minDim) * easeOutCubic(s.completionAnim);
        const cg = ctx.createRadialGradient(destCx, cy, tankW * 0.3, destCx, cy, cGlowR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.completionAnim * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(destCx - cGlowR, cy - cGlowR, cGlowR * 2, cGlowR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.connected) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;

      // Check if starting in source tank area
      if (Math.abs(mx - SRC_X_FRAC) < TANK_W_FRAC * 0.6) {
        s.dragging = true;
        s.dragStartedInSource = true;
        s.dragX = e.clientX - rect.left;
        s.dragY = e.clientY - rect.top;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.dragX = e.clientX - rect.left;
      s.dragY = e.clientY - rect.top;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragging && s.dragStartedInSource) {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width;

        // Check if ended in dest tank area
        if (Math.abs(mx - DEST_X_FRAC) < TANK_W_FRAC * 0.8) {
          s.connected = true;
          callbacksRef.current.onHaptic('drag_snap');
        }
      }
      s.dragging = false;
      s.dragStartedInSource = false;
      canvas.releasePointerCapture(e.pointerId);
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
