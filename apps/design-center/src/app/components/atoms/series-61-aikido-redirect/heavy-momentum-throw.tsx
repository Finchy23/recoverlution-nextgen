/**
 * ATOM 602: THE HEAVY MOMENTUM ENGINE
 * =====================================
 * Series 61 — Aikido Redirect · Position 2
 *
 * Cure feeling overpowered. Pushing against massive mass fails.
 * Place finger on the edge and gently pull in the direction of
 * the fall — add micro-velocity to throw the block violently
 * past you.
 *
 * PHYSICS:
 *   - Enormous intimidating block falls slowly but unstoppably
 *   - Pushing upward fails against mathematical mass
 *   - Pulling downward (with fall direction) adds micro-velocity
 *   - Combined momentum throws block violently past user
 *   - Breath modulates the ambient glow
 *
 * INTERACTION:
 *   Drag (upward)   → fails, block grinds back
 *   Drag (downward) → adds velocity, triggers the throw
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static scene showing throw trajectory
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const BLOCK_WIDTH_FRAC = 0.28;
const BLOCK_HEIGHT_FRAC = 0.22;
const FALL_SPEED = 0.0012;
const BLOCK_MASS = 50;
const PUSH_FAIL_RESISTANCE = 0.97;
const PULL_GAIN = 0.003;
const THROW_VELOCITY = 0.04;
const THROW_DECEL = 0.96;
const DRAG_THRESHOLD = 5;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function HeavyMomentumThrowAtom({
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
    blockY: 0.08,        // top of screen (fraction of h)
    blockVy: FALL_SPEED,  // initial fall velocity
    thrown: false,
    throwVy: 0,
    completed: false,
    failShake: 0,        // frames of shake on push-up fail
    dragActive: false,
    dragStartY: 0,
    dragLastY: 0,
    pullAccum: 0,        // accumulated downward pull
    sinkGlow: 0,
    respawnTimer: 0,
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
      const breath = p.breathAmplitude;
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      const blockW = minDim * BLOCK_WIDTH_FRAC;
      const blockH = minDim * BLOCK_HEIGHT_FRAC;
      const coreY = h * 0.75;
      s.sinkGlow = Math.max(0, s.sinkGlow - 0.02 * ms);

      // ── Block physics ───────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (s.thrown) {
          s.blockY += s.throwVy;
          s.throwVy *= THROW_DECEL;
          if (s.blockY > 1.3) {
            s.completed = true;
            s.sinkGlow = 1;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = 90;
          }
        } else if (!s.dragActive) {
          s.blockY += s.blockVy;
          // Stop at user core level
          const maxY = (coreY - blockH / 2) / h;
          if (s.blockY >= maxY) {
            s.blockY = maxY;
          }
        }
      }

      // ── Respawn ─────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.blockY = 0.08;
          s.blockVy = FALL_SPEED;
          s.thrown = false;
          s.throwVy = 0;
          s.completed = false;
          s.pullAccum = 0;
          s.failShake = 0;
          s.sinkGlow = 0;
        }
      }

      // ── Fail shake ──────────────────────────────────
      if (s.failShake > 0) s.failShake--;

      const shakeX = s.failShake > 0 ? Math.sin(s.failShake * 1.5) * px(0.005, minDim) * ms : 0;

      // ── Draw block ──────────────────────────────────
      const bx = cx - blockW / 2 + shakeX;
      const by = s.blockY * h;
      const blockAlpha = s.completed ? 0 : ALPHA.content.max * entrance;

      const shaftProgress = s.thrown
        ? Math.min(1, Math.max(0, (s.blockY - (coreY - blockH / 2) / h) / 0.45))
        : s.sinkGlow;

      if (shaftProgress > 0.001) {
        const shaftW = blockW * (0.68 + shaftProgress * 0.4);
        const shaftTop = by + blockH * 0.2;
        const shaftGrad = ctx.createLinearGradient(cx, shaftTop, cx, h + blockH);
        shaftGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 2.2 * shaftProgress * entrance));
        shaftGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.background.min * 4.2 * shaftProgress * entrance));
        shaftGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = shaftGrad;
        ctx.fillRect(cx - shaftW / 2, shaftTop, shaftW, h - shaftTop + blockH);

        for (const sign of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx + sign * shaftW * 0.5, shaftTop);
          ctx.lineTo(cx + sign * shaftW * 0.26, h);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.22 * shaftProgress * entrance);
          ctx.lineWidth = px(0.0013, minDim);
          ctx.stroke();
        }
      }

      // Block shadow/glow
      const shadowGrad = ctx.createRadialGradient(cx, by + blockH / 2, 0, cx, by + blockH / 2, blockW);
      shadowGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * entrance));
      shadowGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - blockW, by - blockH / 2, blockW * 2, blockH * 2);

      // Block body
      ctx.fillStyle = rgba(s.accentRgb, blockAlpha);
      ctx.fillRect(bx, by, blockW, blockH);

      // Block edge highlight
      ctx.strokeStyle = rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.2), blockAlpha * 0.6);
      ctx.lineWidth = px(0.001, minDim);
      ctx.strokeRect(bx, by, blockW, blockH);

      // ── Draw user core ──────────────────────────────
      const coreR = px(0.02, minDim) * (1 + breath * 0.1);

      const coreGlow = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, coreR * 5);
      coreGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
      coreGlow.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
      coreGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - coreR * 5, coreY - coreR * 5, coreR * 10, coreR * 10);

      ctx.beginPath();
      ctx.arc(cx, coreY, coreR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Pull progress indicator ─────────────────────
      if (s.pullAccum > 0 && !s.thrown && !s.completed) {
        const pullProg = Math.min(1, s.pullAccum);
        const barW = minDim * 0.002;
        const barH = minDim * 0.12 * pullProg;
        const barX = cx + blockW / 2 + minDim * 0.03;
        const barY = by + blockH - barH;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * pullProg * entrance);
        ctx.fillRect(barX, barY, barW, barH);
      }

      // ── Reduced motion ──────────────────────────────
      if (p.reducedMotion) {
        // Static: block at top, arrow curving down and past
        ctx.beginPath();
        ctx.moveTo(cx, by + blockH);
        ctx.lineTo(cx, coreY + minDim * 0.1);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(0.0015, minDim);
        ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const localY = e.clientY - rect.top;
      const h = rect.height;
      const blockTop = s.blockY * h;
      const blockBot = blockTop + rect.height * BLOCK_HEIGHT_FRAC;

      // Only interact if touching near the block
      if (localY >= blockTop - 20 && localY <= blockBot + 20 && !s.thrown && !s.completed) {
        s.dragActive = true;
        s.dragStartY = e.clientY;
        s.dragLastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragActive) return;
      const dy = e.clientY - s.dragLastY;
      s.dragLastY = e.clientY;

      if (dy < -DRAG_THRESHOLD) {
        // Pushing UP → fail
        s.failShake = 12;
        callbacksRef.current.onHaptic('error_boundary');
        s.pullAccum = Math.max(0, s.pullAccum - 0.05);
      } else if (dy > 1) {
        // Pulling DOWN → building throw energy
        s.pullAccum += dy * PULL_GAIN;
        s.blockY += dy * 0.0003;

        if (s.pullAccum >= 1) {
          // THROW!
          s.thrown = true;
          s.throwVy = THROW_VELOCITY;
          s.dragActive = false;
          callbacksRef.current.onHaptic('drag_snap');
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragActive = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
