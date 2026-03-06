/**
 * ATOM 386: THE LEVER ADVANTAGE ENGINE
 * ======================================
 * Series 39 — Momentum Wheel · Position 6
 *
 * Cure the belief that lifting heavy weight requires raw strength.
 * Reposition the fulcrum and launch the monolith with a gentle tap.
 *
 * PHYSICS:
 *   - Massive unliftable monolith sits on short end of lever beam
 *   - Fulcrum starts at center — tapping the effort-side does nothing
 *   - User drags fulcrum closer to the weight
 *   - Mechanical advantage increases as fulcrum moves
 *   - Once fulcrum is close enough, a single gentle tap launches
 *   - Monolith rises effortlessly into the air with parabolic arc
 *   - Breath modulates the launched monolith's glow
 *
 * INTERACTION:
 *   Drag → repositions fulcrum along beam
 *   Tap (effort side) → attempts to lift weight
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static lever at optimal position with monolith floating
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Beam Y position (fraction of viewport height) */
const BEAM_Y_FRAC = 0.62;
/** Beam length (fraction of viewport width) */
const BEAM_LENGTH_FRAC = 0.75;
/** Beam thickness */
const BEAM_THICKNESS_FRAC = 0.004;
/** Fulcrum triangle height */
const FULCRUM_H_FRAC = 0.05;
/** Fulcrum triangle half-width */
const FULCRUM_W_FRAC = 0.025;
/** Monolith width (fraction of minDim) */
const MONOLITH_W_FRAC = 0.12;
/** Monolith height (fraction of minDim) */
const MONOLITH_H_FRAC = 0.15;
/** Minimum fulcrum position (fraction of beam, from left) */
const FULCRUM_MIN = 0.15;
/** Maximum fulcrum position */
const FULCRUM_MAX = 0.65;
/** Fulcrum position needed for successful launch */
const LAUNCH_THRESHOLD = 0.28;
/** Effort tap zone (right portion of beam) */
const EFFORT_ZONE_START = 0.65;
/** Launch velocity (fraction of h per frame) */
const LAUNCH_VELOCITY = 0.012;
/** Launch gravity */
const LAUNCH_GRAVITY = 0.0003;
/** Maximum launch height (fraction of h) */
const MAX_LAUNCH_H = 0.45;
/** Failed push shake amplitude */
const FAIL_SHAKE_AMP = 0.005;
/** Failed push shake decay */
const FAIL_SHAKE_DECAY = 0.9;
/** Breath glow factor on launched monolith */
const BREATH_GLOW_FACTOR = 0.15;
/** Fulcrum drag hitbox padding */
const FULCRUM_HIT_PADDING = 0.06;
/** Advantage ratio display threshold */
const RATIO_SHOW_THRESHOLD = 0.4;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function LeverAdvantageAtom({
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
    fulcrumPos: 0.5,       // fraction along beam (0=left, 1=right)
    draggingFulcrum: false,
    launched: false,
    launchVy: 0,
    monolithY: 0,          // 0 = resting on beam, negative = in air
    monolithPeaked: false,
    completed: false,
    completionAnim: 0,
    failShake: 0,
    failAttempts: 0,
    // Beam tilt angle
    beamTilt: 0,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.launched) {
        s.fulcrumPos = LAUNCH_THRESHOLD - 0.05;
        s.launched = true;
        s.launchVy = -LAUNCH_VELOCITY;
      }

      // ── Launch physics ──────────────────────────────
      if (s.launched) {
        s.launchVy += LAUNCH_GRAVITY * ms;
        s.monolithY += s.launchVy * h * ms;

        if (s.monolithY < -MAX_LAUNCH_H * h && !s.monolithPeaked) {
          s.monolithPeaked = true;
        }

        if (s.monolithPeaked && s.monolithY >= 0) {
          s.monolithY = 0;
          s.launchVy = 0;
        }

        if (s.monolithY <= -MAX_LAUNCH_H * h * 0.8 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      // ── Fail shake decay ────────────────────────────
      s.failShake *= FAIL_SHAKE_DECAY;

      // ── Mechanical advantage ────────────────────────
      const advantage = s.fulcrumPos < 0.5
        ? (1 - s.fulcrumPos) / Math.max(0.05, s.fulcrumPos)
        : 1;
      const canLaunch = s.fulcrumPos <= LAUNCH_THRESHOLD;

      // ── Beam tilt (subtle based on weight distribution) ──
      if (!s.launched) {
        const targetTilt = (s.fulcrumPos - 0.3) * 0.08;
        s.beamTilt += (targetTilt - s.beamTilt) * 0.05 * ms;
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : s.launched ? 0.5 : (1 - s.fulcrumPos / 0.5) * 0.3);

      // ── Positions ───────────────────────────────────
      const beamY = BEAM_Y_FRAC * h;
      const beamLeft = cx - (BEAM_LENGTH_FRAC * w) / 2;
      const beamRight = cx + (BEAM_LENGTH_FRAC * w) / 2;
      const beamLen = beamRight - beamLeft;
      const fulcrumX = beamLeft + s.fulcrumPos * beamLen;
      const monolithX = beamLeft + beamLen * 0.15;
      const effortX = beamLeft + beamLen * 0.82;
      const mW = px(MONOLITH_W_FRAC, minDim);
      const mH = px(MONOLITH_H_FRAC, minDim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Optimal fulcrum position, monolith floating
        const fX = beamLeft + LAUNCH_THRESHOLD * beamLen;

        // Beam
        ctx.beginPath();
        ctx.moveTo(beamLeft, beamY);
        ctx.lineTo(beamRight, beamY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(BEAM_THICKNESS_FRAC, minDim);
        ctx.stroke();

        // Fulcrum
        const fH = px(FULCRUM_H_FRAC, minDim);
        const fW = px(FULCRUM_W_FRAC, minDim);
        ctx.beginPath();
        ctx.moveTo(fX, beamY);
        ctx.lineTo(fX - fW, beamY + fH);
        ctx.lineTo(fX + fW, beamY + fH);
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();

        // Floating monolith
        const floatY = beamY - mH - px(0.15, minDim);
        const mg = ctx.createRadialGradient(monolithX, floatY, 0, monolithX, floatY, mH);
        mg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        mg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(monolithX - mH, floatY - mH, mH * 2, mH * 2);

        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fillRect(monolithX - mW / 2, floatY - mH / 2, mW, mH);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const shakeOff = Math.sin(s.frameCount * 1.5) * s.failShake * minDim;

      // ── Fulcrum ─────────────────────────────────────
      const fH = px(FULCRUM_H_FRAC, minDim);
      const fW = px(FULCRUM_W_FRAC, minDim);

      // Fulcrum glow (brighter when near optimal)
      if (canLaunch && !s.launched) {
        const fGlowR = fH * 3;
        const fg = ctx.createRadialGradient(fulcrumX, beamY + fH / 2, 0, fulcrumX, beamY + fH / 2, fGlowR);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(fulcrumX - fGlowR, beamY + fH / 2 - fGlowR, fGlowR * 2, fGlowR * 2);
      }

      // Fulcrum triangle
      ctx.beginPath();
      ctx.moveTo(fulcrumX, beamY);
      ctx.lineTo(fulcrumX - fW, beamY + fH);
      ctx.lineTo(fulcrumX + fW, beamY + fH);
      ctx.closePath();
      ctx.fillStyle = rgba(
        canLaunch ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * 0.35 * entrance,
      );
      ctx.fill();

      // ── Beam (tilted slightly) ──────────────────────
      ctx.save();
      ctx.translate(fulcrumX, beamY);
      ctx.rotate(s.beamTilt);

      const leftLen = fulcrumX - beamLeft;
      const rightLen = beamRight - fulcrumX;

      ctx.beginPath();
      ctx.moveTo(-leftLen + shakeOff, 0);
      ctx.lineTo(rightLen + shakeOff, 0);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(BEAM_THICKNESS_FRAC, minDim);
      ctx.stroke();

      ctx.restore();

      // ── Monolith ────────────────────────────────────
      const monolithBaseY = s.launched
        ? beamY - mH + s.monolithY
        : beamY - mH + shakeOff;
      const monolithColor = s.launched ? s.primaryRgb : s.accentRgb;

      // Monolith shadow/glow
      if (s.launched && s.monolithY < 0) {
        const breathMod = 1 + breath * BREATH_GLOW_FACTOR;
        const launchGlowR = mH * 2 * breathMod;
        const lg = ctx.createRadialGradient(
          monolithX, monolithBaseY + mH / 2, mW * 0.3,
          monolithX, monolithBaseY + mH / 2, launchGlowR,
        );
        lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        lg.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        lg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lg;
        ctx.fillRect(
          monolithX - launchGlowR, monolithBaseY + mH / 2 - launchGlowR,
          launchGlowR * 2, launchGlowR * 2,
        );
      }

      // Monolith body
      ctx.fillStyle = rgba(monolithColor, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(monolithX - mW / 2 + shakeOff, monolithBaseY, mW, mH);

      // Monolith weight lines (show density)
      for (let i = 0; i < 5; i++) {
        const ly = monolithBaseY + mH * (0.15 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(monolithX - mW * 0.35 + shakeOff, ly);
        ctx.lineTo(monolithX + mW * 0.35 + shakeOff, ly);
        ctx.strokeStyle = rgba(monolithColor, ALPHA.atmosphere.max * 0.5 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // Monolith bright edge
      ctx.beginPath();
      ctx.moveTo(monolithX - mW / 2 + shakeOff, monolithBaseY);
      ctx.lineTo(monolithX + mW / 2 + shakeOff, monolithBaseY);
      ctx.strokeStyle = rgba(
        lerpColor(monolithColor, [255, 255, 255] as RGB, 0.2),
        ALPHA.content.max * 0.15 * entrance,
      );
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ── Effort zone indicator ───────────────────────
      if (!s.launched) {
        const effortAlpha = canLaunch
          ? ALPHA.content.max * 0.15
          : ALPHA.atmosphere.max * 0.3;
        const ezX = beamLeft + beamLen * EFFORT_ZONE_START;
        ctx.beginPath();
        ctx.arc(effortX, beamY - px(0.025, minDim), px(0.012, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          canLaunch ? s.primaryRgb : s.accentRgb,
          effortAlpha * entrance,
        );
        ctx.fill();

        // Tap hint ring
        if (canLaunch) {
          const hintPulse = 1 + Math.sin(s.frameCount * 0.06) * 0.15;
          ctx.beginPath();
          ctx.arc(effortX, beamY - px(0.025, minDim), px(0.018, minDim) * hintPulse, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Fulcrum drag zone hint ──────────────────────
      if (!s.launched && !s.draggingFulcrum) {
        // Horizontal arrows around fulcrum
        const arrowY = beamY + fH + px(0.015, minDim);
        const arrowLen = px(0.02, minDim);
        const arrowAlpha = ALPHA.atmosphere.max * 0.4 * entrance;

        ctx.beginPath();
        ctx.moveTo(fulcrumX - arrowLen, arrowY);
        ctx.lineTo(fulcrumX - arrowLen * 0.3, arrowY - px(0.004, minDim));
        ctx.lineTo(fulcrumX - arrowLen * 0.3, arrowY + px(0.004, minDim));
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, arrowAlpha);
        ctx.fill();
      }

      // ── Launch trail ────────────────────────────────
      if (s.launched && s.monolithY < -px(0.02, minDim)) {
        const trailCount = 8;
        for (let i = 0; i < trailCount; i++) {
          const t = i / trailCount;
          const ty = beamY - mH + s.monolithY * t;
          const tAlpha = (1 - t) * ALPHA.atmosphere.max * 0.3 * entrance;
          ctx.beginPath();
          ctx.moveTo(monolithX - mW * 0.2, ty + mH);
          ctx.lineTo(monolithX + mW * 0.2, ty + mH);
          ctx.strokeStyle = rgba(s.primaryRgb, tAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── Ground line ─────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(beamLeft - px(0.02, minDim), beamY + fH);
      ctx.lineTo(beamRight + px(0.02, minDim), beamY + fH);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.background.max * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.launched) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const beamLeft = 0.5 - BEAM_LENGTH_FRAC / 2;
      const beamLen = BEAM_LENGTH_FRAC;
      const fulcrumScreenX = beamLeft + s.fulcrumPos * beamLen;

      // Check if clicking near fulcrum
      if (Math.abs(mx - fulcrumScreenX) < FULCRUM_HIT_PADDING && Math.abs(my - BEAM_Y_FRAC) < 0.1) {
        s.draggingFulcrum = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      } else if (mx > beamLeft + beamLen * EFFORT_ZONE_START) {
        // Tap on effort side
        if (s.fulcrumPos <= LAUNCH_THRESHOLD) {
          // Successful launch!
          s.launched = true;
          s.launchVy = -LAUNCH_VELOCITY;
          callbacksRef.current.onHaptic('tap');
        } else {
          // Failed attempt — shake
          s.failShake = FAIL_SHAKE_AMP;
          s.failAttempts++;
          callbacksRef.current.onHaptic('error_boundary');
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.draggingFulcrum) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const beamLeft = 0.5 - BEAM_LENGTH_FRAC / 2;
      const beamLen = BEAM_LENGTH_FRAC;

      const newPos = (mx - beamLeft) / beamLen;
      s.fulcrumPos = Math.max(FULCRUM_MIN, Math.min(FULCRUM_MAX, newPos));
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.draggingFulcrum = false;
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
