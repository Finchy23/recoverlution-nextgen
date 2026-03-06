/**
 * ATOM 384: THE GYROSCOPE BALANCE ENGINE
 * ========================================
 * Series 39 — Momentum Wheel · Position 4
 *
 * Cure emotional fragility. Increase the spin speed until the
 * gyroscope becomes mathematically unshakeable by any external force.
 *
 * PHYSICS:
 *   - 3D-projected gyroscope with 3 concentric gimbal rings
 *   - Slow spin: rings wobble erratically, tilt-angle high
 *   - Each rapid tap adds RPMs to the inner rotor
 *   - Higher RPM mathematically reduces wobble amplitude
 *   - Above stability threshold: gyroscope locks dead-center
 *   - Violent swipes post-stabilization bounce harmlessly off
 *   - Breath modulates the stabilization glow intensity
 *
 * INTERACTION:
 *   Tap (rapid) → increases RPMs
 *   Swipe (post-stable) → deflection test, bounces off
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static stable gyroscope with concentric rings and glow
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

/** Outer gimbal ring radius */
const OUTER_RING_FRAC = SIZE.lg;
/** Middle ring is 75% of outer */
const MID_RING_RATIO = 0.75;
/** Inner rotor is 50% of outer */
const INNER_RING_RATIO = 0.50;
/** RPM added per tap */
const RPM_PER_TAP = 0.8;
/** Maximum achievable RPM */
const MAX_RPM = 15;
/** RPM threshold for stability */
const STABLE_RPM = 12;
/** Natural RPM decay per frame */
const RPM_DECAY = 0.003;
/** Wobble amplitude at zero RPM */
const MAX_WOBBLE = 0.25;
/** Wobble frequency (rad/frame) */
const WOBBLE_FREQ_X = 0.037;
const WOBBLE_FREQ_Y = 0.029;
/** Ellipse perspective ratio (simulates 3D tilt) */
const PERSPECTIVE_MIN = 0.25;
const PERSPECTIVE_MAX = 0.80;
/** Ring stroke weight */
const RING_STROKE_FRAC = 0.003;
/** Rotor disc dots count */
const ROTOR_DOTS = 8;
/** Hub radius */
const HUB_R_FRAC = 0.018;
/** Stability glow radius multiplier */
const STABLE_GLOW_MULT = 1.6;
/** Breath glow modulation */
const BREATH_GLOW_FACTOR = 0.18;
/** Deflection bounce-back spring constant */
const BOUNCE_SPRING = 0.12;
/** Deflection damping */
const BOUNCE_DAMP = 0.88;
/** Swipe velocity threshold to register as "violent" */
const SWIPE_VELOCITY_THRESHOLD = 8;
/** Max deflection particles */
const MAX_DEFLECT_PARTICLES = 20;

// =====================================================================
// STATE TYPES
// =====================================================================

interface DeflectParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function GyroscopeBalanceAtom({
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
    rpm: 0,
    rotorAngle: 0,
    stable: false,
    stableAnim: 0,
    completed: false,
    // Wobble state
    wobblePhaseX: Math.random() * Math.PI * 2,
    wobblePhaseY: Math.random() * Math.PI * 2,
    // Deflection
    deflectX: 0,
    deflectY: 0,
    deflectVx: 0,
    deflectVy: 0,
    deflectParticles: [] as DeflectParticle[],
    // Pointer tracking
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,
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

    /** Draw an elliptical ring (3D-projected gimbal) */
    function drawRing(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      radiusX: number, radiusY: number,
      rotation: number, minDim: number,
      rgb: RGB, alpha: number,
    ) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(rgb, alpha);
      ctx.lineWidth = px(RING_STROKE_FRAC, minDim);
      ctx.stroke();
      ctx.restore();
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

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.stable) {
        s.rpm = Math.min(MAX_RPM, s.rpm + 0.15);
      }

      // ── RPM physics ─────────────────────────────────
      if (!s.stable) {
        s.rpm = Math.max(0, s.rpm - RPM_DECAY * ms);
      }
      s.rotorAngle += (s.rpm / MAX_RPM) * 0.12 * ms;

      // ── Stability detection ─────────────────────────
      if (s.rpm >= STABLE_RPM && !s.stable) {
        s.stable = true;
        cb.onHaptic('completion');
      }
      if (s.stable) {
        s.stableAnim = Math.min(1, s.stableAnim + 0.008 * ms);
        s.rpm = Math.max(STABLE_RPM, s.rpm); // Lock minimum
      }

      // ── Wobble calculation ──────────────────────────
      s.wobblePhaseX += WOBBLE_FREQ_X * ms;
      s.wobblePhaseY += WOBBLE_FREQ_Y * ms;
      const rpmFraction = Math.min(1, s.rpm / STABLE_RPM);
      const wobbleAmp = MAX_WOBBLE * (1 - rpmFraction * rpmFraction);

      // ── Deflection spring physics ───────────────────
      s.deflectVx += -s.deflectX * BOUNCE_SPRING;
      s.deflectVy += -s.deflectY * BOUNCE_SPRING;
      s.deflectVx *= BOUNCE_DAMP;
      s.deflectVy *= BOUNCE_DAMP;
      s.deflectX += s.deflectVx * ms;
      s.deflectY += s.deflectVy * ms;

      // ── Deflect particles ───────────────────────────
      for (let i = s.deflectParticles.length - 1; i >= 0; i--) {
        const dp = s.deflectParticles[i];
        dp.x += dp.vx * ms;
        dp.y += dp.vy * ms;
        dp.life -= 0.02;
        if (dp.life <= 0) s.deflectParticles.splice(i, 1);
      }

      cb.onStateChange?.(s.stable
        ? 0.5 + s.stableAnim * 0.5
        : rpmFraction * 0.5);

      const outerR = px(OUTER_RING_FRAC, minDim);
      const gcx = cx + s.deflectX * minDim;
      const gcy = cy + s.deflectY * minDim;

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Static stable gyroscope
        for (let ring = 0; ring < 3; ring++) {
          const ratio = ring === 0 ? 1 : ring === 1 ? MID_RING_RATIO : INNER_RING_RATIO;
          const rr = outerR * ratio;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rr, rr * 0.6, ring * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
          ctx.lineWidth = px(RING_STROKE_FRAC, minDim);
          ctx.stroke();
        }
        // Hub
        ctx.beginPath();
        ctx.arc(cx, cy, px(HUB_R_FRAC, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
        // Stability glow
        const sgR = outerR * STABLE_GLOW_MULT;
        const sg = ctx.createRadialGradient(cx, cy, outerR * 0.3, cx, cy, sgR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - sgR, cy - sgR, sgR * 2, sgR * 2);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const ringColor = s.stable ? s.primaryRgb : s.accentRgb;
      const wobX = Math.sin(s.wobblePhaseX) * wobbleAmp;
      const wobY = Math.cos(s.wobblePhaseY) * wobbleAmp;

      // ── Stability glow (behind gyroscope) ───────────
      if (s.stable) {
        const breathMod = 1 + breath * BREATH_GLOW_FACTOR;
        const sgR = outerR * STABLE_GLOW_MULT * breathMod;
        const sg = ctx.createRadialGradient(gcx, gcy, outerR * 0.2, gcx, gcy, sgR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.stableAnim * entrance));
        sg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * s.stableAnim * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(gcx - sgR, gcy - sgR, sgR * 2, sgR * 2);
      }

      // ── Shadow beneath ──────────────────────────────
      const shadowR = outerR * 1.1;
      const shadow = ctx.createRadialGradient(gcx, gcy + outerR * 0.05, outerR * 0.3, gcx, gcy, shadowR);
      shadow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * entrance));
      shadow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(gcx - shadowR, gcy - shadowR, shadowR * 2, shadowR * 2);

      // ── Outer gimbal ring ───────────────────────────
      const outerPerspective = PERSPECTIVE_MIN + (PERSPECTIVE_MAX - PERSPECTIVE_MIN) * (1 - Math.abs(wobX));
      drawRing(ctx, gcx, gcy, outerR, outerR * outerPerspective,
        wobX * 0.5, minDim, ringColor,
        ALPHA.content.max * (0.15 + rpmFraction * 0.1) * entrance);

      // ── Middle gimbal ring ──────────────────────────
      const midR = outerR * MID_RING_RATIO;
      const midPerspective = PERSPECTIVE_MIN + (PERSPECTIVE_MAX - PERSPECTIVE_MIN) * (1 - Math.abs(wobY));
      drawRing(ctx, gcx, gcy, midR, midR * midPerspective,
        wobY * 0.7 + Math.PI * 0.3, minDim, ringColor,
        ALPHA.content.max * (0.18 + rpmFraction * 0.12) * entrance);

      // ── Inner rotor ring ────────────────────────────
      const innerR = outerR * INNER_RING_RATIO;
      const innerPerspective = PERSPECTIVE_MIN + (PERSPECTIVE_MAX - PERSPECTIVE_MIN) * rpmFraction;
      drawRing(ctx, gcx, gcy, innerR, innerR * innerPerspective,
        s.rotorAngle, minDim, ringColor,
        ALPHA.content.max * (0.2 + rpmFraction * 0.15) * entrance);

      // ── Rotor mass dots ─────────────────────────────
      for (let i = 0; i < ROTOR_DOTS; i++) {
        const a = s.rotorAngle + (i / ROTOR_DOTS) * Math.PI * 2;
        const dotR = innerR * 0.85;
        const dx = gcx + Math.cos(a) * dotR;
        const dy = gcy + Math.sin(a) * dotR * innerPerspective;
        const dotSize = px(0.004, minDim);

        ctx.beginPath();
        ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ringColor, ALPHA.content.max * 0.2 * entrance);
        ctx.fill();
      }

      // ── Hub ─────────────────────────────────────────
      const hubR = px(HUB_R_FRAC, minDim);
      // Hub glow
      const hubGlow = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, hubR * 4);
      hubGlow.addColorStop(0, rgba(ringColor, ALPHA.glow.max * 0.2 * entrance));
      hubGlow.addColorStop(1, rgba(ringColor, 0));
      ctx.fillStyle = hubGlow;
      ctx.fillRect(gcx - hubR * 4, gcy - hubR * 4, hubR * 8, hubR * 8);

      // Hub body
      ctx.beginPath();
      ctx.arc(gcx, gcy, hubR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ringColor, ALPHA.content.max * 0.45 * entrance);
      ctx.fill();

      // Hub bright center
      ctx.beginPath();
      ctx.arc(gcx, gcy, hubR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(ringColor, [255, 255, 255] as RGB, 0.3),
        ALPHA.content.max * 0.25 * entrance,
      );
      ctx.fill();

      // ── RPM progress ring ───────────────────────────
      if (!s.stable) {
        const progAngle = rpmFraction * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(gcx, gcy, outerR + px(0.02, minDim), -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── Wobble indicator lines (pre-stable) ─────────
      if (!s.stable && wobbleAmp > 0.02) {
        const lineAlpha = wobbleAmp * ALPHA.atmosphere.max * 2 * entrance;
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + s.frameCount * 0.02;
          const len = outerR * (0.1 + wobbleAmp * 0.3);
          const sx = gcx + Math.cos(angle) * (outerR + px(0.01, minDim));
          const sy = gcy + Math.sin(angle) * (outerR + px(0.01, minDim));
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(
            sx + Math.cos(angle + 0.3) * len,
            sy + Math.sin(angle + 0.3) * len,
          );
          ctx.strokeStyle = rgba(s.accentRgb, lineAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Deflect particles ───────────────────────────
      for (const dp of s.deflectParticles) {
        const dpR = px(0.003 * dp.life, minDim);
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dpR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
          ALPHA.content.max * dp.life * 0.4 * entrance,
        );
        ctx.fill();
      }

      // ── Speed blur arcs (fast spin) ─────────────────
      if (rpmFraction > 0.5) {
        const blurAlpha = (rpmFraction - 0.5) * 2 * ALPHA.atmosphere.max * 0.6 * entrance;
        for (let i = 0; i < 4; i++) {
          const a = s.rotorAngle * 1.5 + (i / 4) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(gcx, gcy, innerR * 0.9, a, a + 0.2);
          ctx.strokeStyle = rgba(ringColor, blurAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;

      if (!s.stable) {
        // Tap to add RPMs
        s.rpm = Math.min(MAX_RPM, s.rpm + RPM_PER_TAP);
        callbacksRef.current.onHaptic('tap');
      }

      s.lastPointerX = e.clientX;
      s.lastPointerY = e.clientY;
      s.lastPointerTime = performance.now();
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      s.lastPointerX = e.clientX;
      s.lastPointerY = e.clientY;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      canvas.releasePointerCapture(e.pointerId);

      if (s.stable) {
        // Check for violent swipe
        const dt = Math.max(1, performance.now() - s.lastPointerTime);
        const dx = e.clientX - s.lastPointerX;
        const dy = e.clientY - s.lastPointerY;
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt * 16;

        if (velocity > SWIPE_VELOCITY_THRESHOLD) {
          // Deflection that bounces back
          const normDx = dx / Math.sqrt(dx * dx + dy * dy + 0.001);
          const normDy = dy / Math.sqrt(dx * dx + dy * dy + 0.001);
          s.deflectX += normDx * 0.02;
          s.deflectY += normDy * 0.02;
          callbacksRef.current.onHaptic('step_advance');

          // Spawn deflect particles
          const minDim = Math.min(viewport.width, viewport.height);
          for (let i = 0; i < 6; i++) {
            const angle = Math.atan2(normDy, normDx) + (Math.random() - 0.5) * 1.2;
            const spd = 2 + Math.random() * 4;
            s.deflectParticles.push({
              x: viewport.width / 2 + normDx * px(OUTER_RING_FRAC, minDim),
              y: viewport.height / 2 + normDy * px(OUTER_RING_FRAC, minDim),
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 1,
            });
            if (s.deflectParticles.length > MAX_DEFLECT_PARTICLES) {
              s.deflectParticles.shift();
            }
          }
        }
      }
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
