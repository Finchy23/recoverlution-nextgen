/**
 * ATOM 689: THE TRIM TAB ENGINE
 * ================================
 * Series 69 — Minimum Effective Dose · Position 9
 *
 * Prove you can steer the cargo ship. Zoom 10000% onto the tiny
 * trim tab at the back of the rudder — one effortless finger flip
 * lets fluid dynamics turn the rudder which turns the colossal ship.
 *
 * PHYSICS:
 *   - Colossal ship silhouette at viewport scale, moving on bad trajectory
 *   - Swiping hull = error (immense kinetic mass, no effect)
 *   - Progressive zoom: ship → rudder → trim tab (3 zoom levels)
 *   - At max zoom: tiny trim tab visible, tappable
 *   - Tap trim tab: flip activates fluid dynamics cascade
 *   - Rudder turns slowly, ship trajectory curves gracefully
 *   - Zoom back out to reveal course correction
 *
 * INTERACTION:
 *   Tap hull → error_boundary (immense mass)
 *   Tap zoom indicators → progressive zoom
 *   Tap trim tab (at max zoom) → cascade correction (completion)
 *
 * RENDER: Canvas 2D with zoom level transitions
 * REDUCED MOTION: Static corrected ship trajectory
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const ZOOM_LEVELS = 3;              // 0=ship, 1=rudder, 2=trim tab
const ZOOM_TRANSITION_SPEED = 0.025;
const SHIP_LENGTH = 0.7;
const SHIP_HEIGHT = 0.08;
const RUDDER_SIZE = 0.15;
const TRIM_TAB_SIZE = 0.03;
const TRIM_TAB_HIT_R = 0.04;
const COURSE_CORRECTION_SPEED = 0.005;
const SHIP_BAD_ANGLE = 0.15;       // radians off-course
const GLOW_LAYERS = 3;

export default function TrimTabCorrectionAtom({
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
    zoomLevel: 0,
    zoomTransition: 0,       // 0–1 smooth transition
    targetZoom: 0,
    trimTabFlipped: false,
    courseAngle: SHIP_BAD_ANGLE,
    correctionProgress: 0,
    zoomingOut: false,
    stepNotified: false,
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
        // Corrected ship trajectory
        const shipLen = px(SHIP_LENGTH * 0.5, minDim);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.moveTo(-shipLen, 0);
        ctx.lineTo(shipLen, 0);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(SHIP_HEIGHT, minDim);
        ctx.stroke();
        ctx.restore();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.trimTabFlipped = true; s.correctionProgress = 1; }

      // ── Zoom transition ───────────────────────────────────
      const targetTransition = s.targetZoom / (ZOOM_LEVELS - 1);
      s.zoomTransition += (targetTransition - s.zoomTransition) * ZOOM_TRANSITION_SPEED * ms;

      // ── Course correction ─────────────────────────────────
      if (s.trimTabFlipped) {
        s.correctionProgress = Math.min(1, s.correctionProgress + COURSE_CORRECTION_SPEED * ms);
        s.courseAngle = SHIP_BAD_ANGLE * (1 - s.correctionProgress);

        if (s.correctionProgress > 0.3 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }

        // Zoom back out after correction starts
        if (s.correctionProgress > 0.2 && !s.zoomingOut) {
          s.zoomingOut = true;
          s.targetZoom = 0;
        }

        if (s.correctionProgress >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      cb.onStateChange?.(s.completed ? 1 : s.trimTabFlipped ? 0.3 + s.correctionProgress * 0.7 :
        s.targetZoom / (ZOOM_LEVELS - 1) * 0.3);

      // ── Render based on zoom ──────────────────────────────
      const zoom = s.zoomTransition;

      // Water flow lines (background)
      const flowSpeed = 0.2 + zoom * 0.3;
      for (let i = 0; i < 8; i++) {
        const ly = cy + (i - 4) * px(0.04, minDim) * (1 - zoom * 0.5);
        const lPhase = (time * flowSpeed + i * 0.5) % 1;
        ctx.beginPath();
        ctx.moveTo(lPhase * w - w * 0.1, ly);
        ctx.lineTo(lPhase * w + px(0.08, minDim), ly);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.stroke();
      }

      if (zoom < 0.4) {
        // ── Ship view (zoom level 0) ────────────────────────
        const shipLen = px(SHIP_LENGTH * 0.5, minDim);
        const shipH = px(SHIP_HEIGHT, minDim);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.courseAngle);

        // Ship body
        ctx.beginPath();
        ctx.moveTo(-shipLen * 0.5, -shipH * 0.3);
        ctx.lineTo(shipLen * 0.5, -shipH * 0.1);
        ctx.lineTo(shipLen * 0.5, shipH * 0.1);
        ctx.lineTo(-shipLen * 0.5, shipH * 0.3);
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.fill();

        // Bow
        ctx.beginPath();
        ctx.moveTo(shipLen * 0.5, -shipH * 0.1);
        ctx.lineTo(shipLen * 0.65, 0);
        ctx.lineTo(shipLen * 0.5, shipH * 0.1);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();

        // Stern indicator (zoom target)
        if (!s.trimTabFlipped) {
          const pulse = 0.5 + 0.5 * Math.sin(time * 2);
          ctx.beginPath();
          ctx.arc(-shipLen * 0.45, 0, px(0.01, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * pulse * entrance);
          ctx.fill();
        }

        // Trajectory line
        ctx.beginPath();
        ctx.moveTo(shipLen * 0.65, 0);
        ctx.lineTo(shipLen * 1.2, 0);
        ctx.strokeStyle = rgba(s.courseAngle > 0.02 ? s.accentRgb : s.primaryRgb,
          ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();

        // Correct trajectory reference
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + shipLen * 1.2, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.setLineDash([px(0.003, minDim), px(0.006, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (zoom < 0.75) {
        // ── Rudder view (zoom level 1) ──────────────────────
        const rudderH = px(RUDDER_SIZE, minDim);
        const rudderW = px(0.015, minDim);

        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(cx - rudderW / 2, cy - rudderH / 2, rudderW, rudderH);

        // Rudder pivot
        ctx.beginPath();
        ctx.arc(cx, cy - rudderH * 0.3, px(0.005, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();

        // Trim tab indicator at bottom of rudder
        const tabY = cy + rudderH * 0.4;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
        ctx.beginPath();
        ctx.arc(cx, tabY, px(0.008, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * pulse * entrance);
        ctx.fill();

      } else {
        // ── Trim tab view (zoom level 2) ────────────────────
        const tabW = px(TRIM_TAB_SIZE * 2, minDim);
        const tabH = px(TRIM_TAB_SIZE * 0.5, minDim);
        const tabAngle = s.trimTabFlipped ? -0.3 : 0;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(tabAngle);

        // Trim tab body
        ctx.fillStyle = rgba(s.trimTabFlipped
          ? lerpColor(s.accentRgb, s.primaryRgb, 0.5)
          : s.accentRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fillRect(-tabW / 2, -tabH / 2, tabW, tabH);

        // Pivot point
        ctx.beginPath();
        ctx.arc(0, 0, px(0.004, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();

        ctx.restore();

        // Tap zone
        if (!s.trimTabFlipped) {
          const pulse = 0.5 + 0.5 * Math.sin(time * 3);
          const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, px(TRIM_TAB_HIT_R, minDim));
          tg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * pulse * entrance));
          tg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(cx - px(TRIM_TAB_HIT_R, minDim), cy - px(TRIM_TAB_HIT_R, minDim),
            px(TRIM_TAB_HIT_R * 2, minDim), px(TRIM_TAB_HIT_R * 2, minDim));
        }

        // Fluid flow arrows showing cascade
        if (s.trimTabFlipped) {
          for (let i = 0; i < 4; i++) {
            const ax = cx + px(0.04 + i * 0.03, minDim);
            const ay = cy + px(0.01 * (i + 1), minDim);
            const aPhase = (time * 0.5 + i * 0.2) % 1;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax + px(0.015, minDim), ay + px(0.005, minDim));
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * (1 - aPhase) * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
      }

      // ── Zoom level indicators ─────────────────────────────
      if (!s.trimTabFlipped) {
        for (let i = 0; i < ZOOM_LEVELS; i++) {
          const indX = cx + (i - 1) * px(0.04, minDim);
          const indY = h * 0.93;
          const indR = px(0.005, minDim);
          const active = i <= s.targetZoom;
          ctx.beginPath();
          ctx.arc(indX, indY, indR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(active ? s.primaryRgb : s.accentRgb,
            ALPHA.content.max * (active ? 0.35 : 0.1) * entrance);
          ctx.fill();
        }
      }

      // ── Completion glow ───────────────────────────────────
      if (s.completed) {
        const cR = px(SIZE.sm, minDim);
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.12 + i * 0.33) % 1;
          const rR = cR * (0.5 + rPhase * 2);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * (1 - rPhase) * entrance);
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
      if (s.completed) return;
      const cb = callbacksRef.current;

      // At max zoom: tap trim tab
      if (s.targetZoom >= ZOOM_LEVELS - 1 && s.zoomTransition > 0.7) {
        if (!s.trimTabFlipped) {
          s.trimTabFlipped = true;
          cb.onHaptic('tap');
          return;
        }
      }

      // Zoom in (progressive)
      if (!s.trimTabFlipped && s.targetZoom < ZOOM_LEVELS - 1) {
        s.targetZoom++;
        cb.onHaptic('tap');
        return;
      }

      // Default: error (hitting hull)
      if (!s.trimTabFlipped) {
        cb.onHaptic('error_boundary');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'zoom-in' }} />
    </div>
  );
}
