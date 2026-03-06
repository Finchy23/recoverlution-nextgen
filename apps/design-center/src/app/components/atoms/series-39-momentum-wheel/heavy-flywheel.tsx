/**
 * ATOM 381: THE HEAVY FLYWHEEL ENGINE
 * =====================================
 * Series 39 — Momentum Wheel · Position 1
 *
 * Cure the crushing paralysis of starting. Consecutive swipes
 * overcome massive rotational inertia until the wheel spins
 * endlessly on its own.
 *
 * PHYSICS:
 *   - Giant dense flywheel fills center viewport (SIZE.lg)
 *   - Thick visible rim with embedded mass particles
 *   - Each downward swipe adds angular velocity
 *   - Massive rotational inertia — 10 consecutive pushes required
 *   - Friction grinds heavy in early swipes, sparks fly off rim
 *   - After critical threshold — wheel enters perpetual effortless spin
 *   - Breath modulates the perpetual glow intensity
 *
 * INTERACTION:
 *   Swipe down (repeated) → adds rotational velocity
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static wheel at rest with perpetual glow halo
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Wheel outer radius */
const WHEEL_R_FRAC = SIZE.lg;
/** Wheel rim thickness (fraction of wheel radius) */
const RIM_THICKNESS = 0.12;
/** Number of spokes radiating from hub */
const SPOKE_COUNT = 12;
/** Hub radius at wheel center */
const HUB_R_FRAC = 0.035;
/** Embedded mass particles on the rim */
const MASS_PARTICLE_COUNT = 24;
/** Swipes required to reach perpetual motion */
const SWIPES_TO_PERPETUAL = 10;
/** Angular velocity added per swipe (rad/frame) */
const SPEED_PER_SWIPE = 0.005;
/** Friction decay before perpetual (lower = more friction) */
const FRICTION_DECAY = 0.994;
/** Target speed for perpetual motion (rad/frame) */
const PERPETUAL_SPEED = 0.05;
/** Sparks spawned per swipe */
const SPARKS_PER_SWIPE = 8;
/** Swipe distance threshold (px) */
const SWIPE_THRESHOLD = 20;
/** Breath glow modulation on perpetual state */
const BREATH_GLOW_FACTOR = 0.15;

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

export default function HeavyFlywheelAtom({
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
    angle: 0,
    speed: 0,
    swipeCount: 0,
    perpetual: false,
    perpetualAnim: 0,
    sparks: [] as Spark[],
    swiping: false,
    lastY: 0,
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
      if (p.phase === 'resolve' && !s.perpetual) {
        s.swipeCount = SWIPES_TO_PERPETUAL;
        s.speed = PERPETUAL_SPEED;
      }

      // ── Wheel physics ───────────────────────────────
      if (!s.perpetual) {
        s.speed *= FRICTION_DECAY;
      } else {
        s.speed += (PERPETUAL_SPEED - s.speed) * 0.01;
      }
      s.angle += s.speed * ms;

      // ── Perpetual threshold ─────────────────────────
      if (s.swipeCount >= SWIPES_TO_PERPETUAL && !s.perpetual) {
        s.perpetual = true;
        s.speed = PERPETUAL_SPEED;
        cb.onHaptic('completion');
      }
      if (s.perpetual) {
        s.perpetualAnim = Math.min(1, s.perpetualAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.perpetual
        ? 0.5 + s.perpetualAnim * 0.5
        : (s.swipeCount / SWIPES_TO_PERPETUAL) * 0.5);

      // ── Spark physics ───────────────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.05 * ms;
        sp.life -= 0.02;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }

      const wheelR = px(WHEEL_R_FRAC, minDim);
      const rimW = wheelR * RIM_THICKNESS;
      const speedFraction = Math.min(1, s.speed / PERPETUAL_SPEED);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Static perpetual wheel
        ctx.beginPath();
        ctx.arc(cx, cy, wheelR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = rimW;
        ctx.stroke();

        // Hub
        ctx.beginPath();
        ctx.arc(cx, cy, px(HUB_R_FRAC, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();

        // Perpetual glow
        const gR = wheelR * 1.5;
        const glow = ctx.createRadialGradient(cx, cy, wheelR * 0.3, cx, cy, gR);
        glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        glow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const wheelColor = s.perpetual ? s.primaryRgb : s.accentRgb;

      // ── Wheel shadow ────────────────────────────────
      const shadowR = wheelR * 1.15;
      const shadow = ctx.createRadialGradient(
        cx, cy + wheelR * 0.03, wheelR * 0.6,
        cx, cy, shadowR,
      );
      shadow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * entrance));
      shadow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

      // ── Perpetual glow (behind wheel) ───────────────
      if (s.perpetual) {
        const breathMod = 1 + breath * BREATH_GLOW_FACTOR;
        const gR = wheelR * (1.4 + s.perpetualAnim * 0.3) * breathMod;
        const glow = ctx.createRadialGradient(cx, cy, wheelR * 0.3, cx, cy, gR);
        glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.perpetualAnim * entrance));
        glow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * s.perpetualAnim * entrance));
        glow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ── Rim (thick outer ring) ──────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, wheelR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(wheelColor, ALPHA.content.max * (0.2 + speedFraction * 0.15) * entrance);
      ctx.lineWidth = rimW;
      ctx.stroke();

      // ── Inner rim detail ring ───────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, wheelR - rimW, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(wheelColor, ALPHA.atmosphere.max * 0.5 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ─�� Mass particles on rim ───────────────────────
      for (let i = 0; i < MASS_PARTICLE_COUNT; i++) {
        const a = s.angle + (i / MASS_PARTICLE_COUNT) * Math.PI * 2;
        const mpx = cx + Math.cos(a) * (wheelR - rimW * 0.5);
        const mpy = cy + Math.sin(a) * (wheelR - rimW * 0.5);
        const mpR = rimW * 0.25;

        ctx.beginPath();
        ctx.arc(mpx, mpy, mpR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(wheelColor, ALPHA.content.max * 0.15 * entrance);
        ctx.fill();
      }

      // ── Spokes ──────────────────────────────────────
      const hubR = px(HUB_R_FRAC, minDim);
      for (let i = 0; i < SPOKE_COUNT; i++) {
        const a = s.angle + (i / SPOKE_COUNT) * Math.PI * 2;
        const innerR = hubR * 1.5;
        const outerR = wheelR - rimW * 1.5;

        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
        ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
        ctx.strokeStyle = rgba(wheelColor, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── Hub ─────────────────────────────────────────
      // Hub glow
      const hubGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR * 3);
      hubGlow.addColorStop(0, rgba(wheelColor, ALPHA.glow.max * 0.25 * entrance));
      hubGlow.addColorStop(1, rgba(wheelColor, 0));
      ctx.fillStyle = hubGlow;
      ctx.fillRect(cx - hubR * 3, cy - hubR * 3, hubR * 6, hubR * 6);

      // Hub body
      ctx.beginPath();
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(wheelColor, ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      // Hub bright center
      ctx.beginPath();
      ctx.arc(cx, cy, hubR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(wheelColor, [255, 255, 255] as RGB, 0.3),
        ALPHA.content.max * 0.25 * entrance,
      );
      ctx.fill();

      // ── Grinding sparks ─────────────────────────────
      for (const sp of s.sparks) {
        const spR = px(0.003 * sp.life, minDim);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
          ALPHA.content.max * sp.life * 0.5 * entrance,
        );
        ctx.fill();
      }

      // ── Momentum counter arc ────────────────────────
      if (!s.perpetual && s.swipeCount > 0) {
        const counterAngle = (s.swipeCount / SWIPES_TO_PERPETUAL) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, wheelR + px(0.02, minDim), -Math.PI / 2, -Math.PI / 2 + counterAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── Speed blur lines (when fast) ────────────────
      if (speedFraction > 0.3) {
        const blurAlpha = (speedFraction - 0.3) * ALPHA.atmosphere.max * entrance;
        for (let i = 0; i < 6; i++) {
          const a = s.angle * 2 + (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx, cy, wheelR * 0.95, a, a + 0.15);
          ctx.strokeStyle = rgba(wheelColor, blurAlpha);
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
      stateRef.current.swiping = true;
      stateRef.current.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.perpetual) return;

      const dy = s.lastY - e.clientY;
      if (dy > SWIPE_THRESHOLD) {
        s.swipeCount++;
        s.speed += SPEED_PER_SWIPE;
        s.lastY = e.clientY;
        callbacksRef.current.onHaptic('swipe_commit');

        // Spawn grinding sparks at rim
        const angle = s.angle + Math.random() * Math.PI * 2;
        const wheelR = px(WHEEL_R_FRAC, Math.min(viewport.width, viewport.height));
        const sparkX = viewport.width / 2 + Math.cos(angle) * wheelR;
        const sparkY = viewport.height / 2 + Math.sin(angle) * wheelR;
        for (let i = 0; i < SPARKS_PER_SWIPE; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 1 + Math.random() * 3;
          s.sparks.push({
            x: sparkX,
            y: sparkY,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd - 1,
            life: 1,
          });
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.swiping = false;
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
          cursor: 'n-resize',
        }}
      />
    </div>
  );
}
