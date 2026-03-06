/**
 * ATOM 681: THE ARCHIMEDES LEVER ENGINE
 * ========================================
 * Series 69 — Minimum Effective Dose · Position 1
 *
 * Cure brute-force exhaustion. Find the hidden fulcrum. Place the
 * plank over it. A single effortless one-finger press on the far
 * end multiplies torque by 1000x launching the massive block.
 *
 * PHYSICS:
 *   - Colossal block sits on left side of screen (SIZE.xl scale)
 *   - Direct tapping on block drains energy bar (error_boundary)
 *   - Subtle fulcrum triangle hidden at bottom-center
 *   - Phase 1: Tap fulcrum to reveal it (drag_snap)
 *   - Phase 2: Drag plank to rest on fulcrum under block
 *   - Phase 3: Tap far end of plank → torque multiplication
 *   - Block launches upward with exponential deceleration
 *   - Energy bar: starts at 100%, brute attempts drain 25% each
 *   - Lever press costs only 0.1% — thousand-fold multiplication
 *
 * INTERACTION:
 *   Tap block → drains energy (error_boundary)
 *   Tap fulcrum → reveals it (drag_snap)
 *   Tap lever end → launches block (completion)
 *
 * RENDER: Canvas 2D + fulcrum/plank physics visualization
 * REDUCED MOTION: Static launched block at apex with lever visible
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const BLOCK_SIZE = 0.15;
const BLOCK_X = 0.3;
const BLOCK_START_Y = 0.55;
const FULCRUM_X = 0.45;
const FULCRUM_Y = 0.68;
const FULCRUM_SIZE = 0.02;
const LEVER_LENGTH = 0.35;
const LEVER_THICKNESS = 0.004;
const PRESS_ZONE_R = 0.04;
const LAUNCH_SPEED = 0.012;
const LAUNCH_DECEL = 0.9985;
const ENERGY_MAX = 1;
const ENERGY_DRAIN = 0.25;
const ENERGY_LEVER_COST = 0.001;
const GLOW_LAYERS = 4;
const TORQUE_MULTIPLIER_VIS = 0.4;    // visual arc for torque display

export default function ArchimedesLeverAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
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
    energy: ENERGY_MAX,
    fulcrumFound: false,
    leverPlaced: false,
    launched: false,
    blockY: BLOCK_START_Y,
    blockVY: 0,
    leverAngle: 0,
    launchGlow: 0,
    completed: false,
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
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        // Static: block at top, lever visible
        const bS = px(BLOCK_SIZE, minDim);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.fillRect(BLOCK_X * w - bS / 2, h * 0.15 - bS / 2, bS, bS);
        // Lever
        const fX = FULCRUM_X * w; const fY = FULCRUM_Y * h;
        ctx.beginPath();
        ctx.moveTo(fX, fY);
        ctx.lineTo(fX - px(0.012, minDim), fY + px(0.02, minDim));
        ctx.lineTo(fX + px(0.012, minDim), fY + px(0.02, minDim));
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') {
        s.fulcrumFound = true; s.leverPlaced = true; s.launched = true;
        s.blockY = 0.1;
      }

      // ── Launch physics ────────────────────────────────────
      if (s.launched && !s.completed) {
        s.blockVY *= LAUNCH_DECEL;
        s.blockY -= s.blockVY * ms;
        s.leverAngle = Math.min(0.4, s.leverAngle + 0.008 * ms);
        s.launchGlow = Math.min(1, s.launchGlow + 0.02 * ms);

        if (s.blockY < 0.05) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
        } else {
          cb.onStateChange?.(0.6 + (BLOCK_START_Y - s.blockY) / BLOCK_START_Y * 0.4);
        }
      }

      // ── 1. Energy bar ─────────────────────────────────────
      if (!s.completed) {
        const barW = px(0.2, minDim);
        const barH = px(0.005, minDim);
        const barX = cx - barW / 2;
        const barY = h * 0.92;
        // Background
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        // Fill
        const energyColor = s.energy > 0.3 ? s.primaryRgb : s.accentRgb;
        ctx.fillStyle = rgba(energyColor, ALPHA.content.max * 0.25 * entrance);
        ctx.fillRect(barX, barY, barW * s.energy, barH);
      }

      // ── 2. Fulcrum ────────────────────────────────────────
      const fX = FULCRUM_X * w;
      const fY = FULCRUM_Y * h;
      const fS = px(FULCRUM_SIZE, minDim);

      // Fulcrum glow when found
      if (s.fulcrumFound) {
        const fg = ctx.createRadialGradient(fX, fY, 0, fX, fY, fS * 3);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(fX - fS * 3, fY - fS * 3, fS * 6, fS * 6);
      }

      // Fulcrum triangle
      ctx.beginPath();
      ctx.moveTo(fX, fY);
      ctx.lineTo(fX - fS * 0.8, fY + fS * 1.2);
      ctx.lineTo(fX + fS * 0.8, fY + fS * 1.2);
      ctx.closePath();
      const fulcrumAlpha = s.fulcrumFound ? 0.4 : 0.04 + 0.02 * Math.sin(time * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * fulcrumAlpha * entrance);
      ctx.fill();

      // ── 3. Lever (plank) ──────────────────────────────────
      if (s.leverPlaced) {
        const leverLen = px(LEVER_LENGTH, minDim);
        const leverH = px(LEVER_THICKNESS, minDim);

        ctx.save();
        ctx.translate(fX, fY);
        ctx.rotate(-s.leverAngle);

        // Lever body
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
        const leftExtent = leverLen * 0.35;   // short side under block
        const rightExtent = leverLen * 0.65;  // long side for press
        ctx.fillRect(-leftExtent, -leverH / 2, leftExtent + rightExtent, leverH);

        // Press zone indicator (far end)
        if (!s.launched) {
          const pressX = rightExtent * 0.9;
          const pulse = 0.5 + 0.5 * Math.sin(time * 3);
          ctx.beginPath();
          ctx.arc(pressX, 0, px(PRESS_ZONE_R * 0.6, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * pulse * entrance);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pressX, 0, px(0.005, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
          ctx.fill();
        }

        ctx.restore();
      }

      // ── 4. Block ──────────────────────────────────────────
      const bX = BLOCK_X * w;
      const bY = s.blockY * h;
      const bS = px(BLOCK_SIZE, minDim);

      // Block shadow/glow
      if (s.launched) {
        const bg = ctx.createRadialGradient(bX, bY, 0, bX, bY, bS);
        bg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * s.launchGlow * entrance));
        bg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = bg;
        ctx.fillRect(bX - bS, bY - bS, bS * 2, bS * 2);
      }

      // Block body
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (s.launched ? 0.3 : 0.45) * entrance);
      ctx.fillRect(bX - bS / 2, bY - bS / 2, bS, bS);

      // Block inner detail (weight lines)
      for (let i = 0; i < 3; i++) {
        const lineY = bY - bS * 0.3 + i * bS * 0.3;
        ctx.beginPath();
        ctx.moveTo(bX - bS * 0.3, lineY);
        ctx.lineTo(bX + bS * 0.3, lineY);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── 5. Launch trail ───────────────────────────────────
      if (s.launched && s.blockY < BLOCK_START_Y - 0.05) {
        for (let i = 0; i < 5; i++) {
          const trailY = bY + bS * 0.5 + i * px(0.015, minDim);
          const trailAlpha = ALPHA.content.max * 0.06 * (1 - i / 5) * entrance;
          ctx.beginPath();
          ctx.moveTo(bX - bS * 0.2, trailY);
          ctx.lineTo(bX + bS * 0.2, trailY);
          ctx.strokeStyle = rgba(s.accentRgb, trailAlpha);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── 6. Torque multiplication arc ──────────────────────
      if (s.launched && s.launchGlow > 0.2) {
        const arcR = px(TORQUE_MULTIPLIER_VIS * s.launchGlow, minDim);
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.1 + i * 0.33) % 1;
          const rR = arcR * (0.3 + rPhase * 0.7);
          ctx.beginPath();
          ctx.arc(fX, fY, rR, -Math.PI, 0);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const cb = callbacksRef.current;
      if (s.completed) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Check: tap on lever press zone (far end)?
      if (s.leverPlaced && !s.launched) {
        const pressX = FULCRUM_X + LEVER_LENGTH * 0.65 * 0.9;
        const pressY = FULCRUM_Y;
        if (Math.hypot(mx - pressX, my - pressY) < PRESS_ZONE_R * 1.5) {
          s.launched = true;
          s.blockVY = LAUNCH_SPEED;
          s.energy = Math.max(0, s.energy - ENERGY_LEVER_COST);
          cb.onHaptic('tap');
          return;
        }
      }

      // Check: tap on fulcrum zone?
      if (!s.fulcrumFound) {
        if (Math.hypot(mx - FULCRUM_X, my - FULCRUM_Y) < FULCRUM_SIZE * 3) {
          s.fulcrumFound = true;
          cb.onHaptic('drag_snap');
          cb.onStateChange?.(0.2);
          return;
        }
      }

      // Check: tap to place lever (after fulcrum found)?
      if (s.fulcrumFound && !s.leverPlaced) {
        if (Math.hypot(mx - FULCRUM_X, my - FULCRUM_Y) < 0.15) {
          s.leverPlaced = true;
          cb.onHaptic('tap');
          cb.onStateChange?.(0.4);
          return;
        }
      }

      // Check: tap on block (brute force — counterproductive)?
      const blockDist = Math.hypot(mx - BLOCK_X, my - s.blockY);
      if (blockDist < BLOCK_SIZE) {
        s.energy = Math.max(0, s.energy - ENERGY_DRAIN);
        cb.onHaptic('error_boundary');
        cb.onStateChange?.(0.05);
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
