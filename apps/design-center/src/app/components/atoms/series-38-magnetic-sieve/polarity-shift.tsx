/**
 * ATOM 372: THE POLARITY SHIFT ENGINE
 * =====================================
 * Series 38 — Magnetic Sieve · Position 2
 *
 * Cure people-pleasing. Generate a repelling field that bounces
 * incoming distractions harmlessly into the void.
 *
 * PHYSICS:
 *   - Dozens of aggressive projectile nodes fly inward from all edges
 *   - Hold thumb in center to generate expanding magnetic repelling field
 *   - Shield radius grows with hold duration, pulses with breath
 *   - Projectiles deflect violently off shield with spark bursts
 *   - After 12 successful deflections, shield becomes permanent monument
 *   - Undeflected projectiles pass through center causing screen shake
 *
 * INTERACTION:
 *   Hold (center) → generates repelling field
 *   Release       → shield collapses, vulnerability returns
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static shield dome with frozen deflected projectiles
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Maximum shield radius as fraction of minDim */
const SHIELD_R_MAX = 0.28;
/** Shield growth rate per frame while holding */
const SHIELD_GROW_RATE = 0.018;
/** Shield decay rate per frame when released */
const SHIELD_DECAY_RATE = 0.008;
/** Minimum shield power to deflect (0-1) */
const DEFLECT_THRESHOLD = 0.25;
/** Number of projectiles in the field */
const PROJECTILE_COUNT = 16;
/** Projectile speed (fraction of viewport per frame) */
const PROJECTILE_SPEED = 0.004;
/** Projectile radius as fraction of minDim */
const PROJECTILE_R_FRAC = 0.012;
/** Deflection bounce velocity multiplier */
const BOUNCE_MULT = 2.2;
/** Number of successful deflections for completion */
const DEFLECT_TARGET = 12;
/** Core node radius at center */
const CORE_R_FRAC = 0.022;
/** Shield ring count for layered rendering */
const SHIELD_RINGS = 3;
/** Spark count per deflection */
const SPARK_COUNT = 6;
/** How much breath affects shield size */
const BREATH_SHIELD_FACTOR = 0.08;
/** Screen shake magnitude */
const SHAKE_MAGNITUDE = 0.008;
/** Shake decay rate */
const SHAKE_DECAY = 0.88;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Projectile {
  x: number;       // fraction
  y: number;       // fraction
  vx: number;      // velocity fraction/frame
  vy: number;      // velocity fraction/frame
  deflected: boolean;
  opacity: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function spawnProjectile(): Projectile {
  // Spawn from random edge, aimed roughly at center
  const edge = Math.floor(Math.random() * 4);
  let x: number, y: number, vx: number, vy: number;
  const spread = 0.3; // aim spread

  switch (edge) {
    case 0: // top
      x = 0.1 + Math.random() * 0.8; y = -0.05;
      vx = (0.5 - x) * spread + (Math.random() - 0.5) * 0.002;
      vy = PROJECTILE_SPEED * (0.8 + Math.random() * 0.4);
      break;
    case 1: // bottom
      x = 0.1 + Math.random() * 0.8; y = 1.05;
      vx = (0.5 - x) * spread + (Math.random() - 0.5) * 0.002;
      vy = -PROJECTILE_SPEED * (0.8 + Math.random() * 0.4);
      break;
    case 2: // left
      x = -0.05; y = 0.1 + Math.random() * 0.8;
      vx = PROJECTILE_SPEED * (0.8 + Math.random() * 0.4);
      vy = (0.5 - y) * spread + (Math.random() - 0.5) * 0.002;
      break;
    default: // right
      x = 1.05; y = 0.1 + Math.random() * 0.8;
      vx = -PROJECTILE_SPEED * (0.8 + Math.random() * 0.4);
      vy = (0.5 - y) * spread + (Math.random() - 0.5) * 0.002;
      break;
  }
  return { x, y, vx, vy, deflected: false, opacity: 1 };
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function PolarityShiftAtom({
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
    holding: false,
    shieldPower: 0,        // 0→1 shield strength
    deflections: 0,
    completed: false,
    completionAnim: 0,
    projectiles: Array.from({ length: PROJECTILE_COUNT }, () => spawnProjectile()),
    sparks: [] as Spark[],
    shakeX: 0,
    shakeY: 0,
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

      // ── Apply screen shake ──────────────────────────
      if (Math.abs(s.shakeX) > 0.0001 || Math.abs(s.shakeY) > 0.0001) {
        ctx.translate(s.shakeX * minDim, s.shakeY * minDim);
        s.shakeX *= SHAKE_DECAY;
        s.shakeY *= SHAKE_DECAY;
      }

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve') {
        s.holding = true;
      }

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const shieldR = px(SHIELD_R_MAX, minDim);

        // Static shield dome
        for (let ring = SHIELD_RINGS - 1; ring >= 0; ring--) {
          const rr = shieldR * (1 - ring * 0.15);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance / (ring + 1));
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }

        // Shield fill
        const shieldGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, shieldR);
        shieldGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        shieldGlow.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance));
        shieldGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = shieldGlow;
        ctx.fillRect(cx - shieldR, cy - shieldR, shieldR * 2, shieldR * 2);

        // Frozen deflected projectiles
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const dist = shieldR * 1.3;
          const px2 = cx + Math.cos(angle) * dist;
          const py2 = cy + Math.sin(angle) * dist;
          const pR = px(PROJECTILE_R_FRAC, minDim);
          ctx.beginPath();
          ctx.arc(px2, py2, pR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
          ctx.fill();
        }

        // Core
        ctx.beginPath();
        ctx.arc(cx, cy, px(CORE_R_FRAC, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Shield power ────────────────────────────────
      if (s.holding || s.completed) {
        s.shieldPower = Math.min(1, s.shieldPower + SHIELD_GROW_RATE * ms);
      } else {
        s.shieldPower = Math.max(0, s.shieldPower - SHIELD_DECAY_RATE * ms);
      }

      const breathShieldMod = 1 + breath * BREATH_SHIELD_FACTOR;
      const activeShieldR = px(SHIELD_R_MAX * s.shieldPower * breathShieldMod, minDim);

      // ── Projectile physics ──────────────────────────
      for (const pr of s.projectiles) {
        pr.x += pr.vx * ms;
        pr.y += pr.vy * ms;

        // Check shield deflection
        if (!pr.deflected && s.shieldPower >= DEFLECT_THRESHOLD) {
          const dx = pr.x - 0.5;
          const dy = pr.y - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const shieldFrac = SHIELD_R_MAX * s.shieldPower * breathShieldMod;

          if (dist < shieldFrac + 0.02) {
            // Deflect!
            const norm = dist || 0.001;
            pr.vx = (dx / norm) * PROJECTILE_SPEED * BOUNCE_MULT;
            pr.vy = (dy / norm) * PROJECTILE_SPEED * BOUNCE_MULT;
            pr.deflected = true;
            s.deflections++;
            cb.onHaptic('tap');

            // Spawn sparks at collision point
            const sparkX = pr.x * w;
            const sparkY = pr.y * h;
            for (let i = 0; i < SPARK_COUNT; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 1 + Math.random() * 3;
              s.sparks.push({
                x: sparkX, y: sparkY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
              });
            }
          }
        }

        // Check if undeflected projectile hits center
        if (!pr.deflected) {
          const dx = pr.x - 0.5;
          const dy = pr.y - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.03) {
            // Hit! Screen shake
            s.shakeX = (Math.random() - 0.5) * SHAKE_MAGNITUDE;
            s.shakeY = (Math.random() - 0.5) * SHAKE_MAGNITUDE;
            // Respawn
            Object.assign(pr, spawnProjectile());
          }
        }

        // Fade deflected projectiles
        if (pr.deflected) {
          pr.opacity = Math.max(0, pr.opacity - 0.012);
        }

        // Respawn when off-screen
        if (pr.x < -0.2 || pr.x > 1.2 || pr.y < -0.2 || pr.y > 1.2 || pr.opacity <= 0) {
          Object.assign(pr, spawnProjectile());
        }
      }

      // ── Completion check ────────────────────────────
      if (s.deflections >= DEFLECT_TARGET && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      // ── State reporting ─────────────────────────────
      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : Math.min(0.5, s.deflections / (DEFLECT_TARGET * 2)));

      // ── Draw shield ─────────────────────────────────
      if (s.shieldPower > 0.02) {
        // Outer glow dome
        const domeGlow = ctx.createRadialGradient(
          cx, cy, activeShieldR * 0.4,
          cx, cy, activeShieldR * 1.3,
        );
        domeGlow.addColorStop(0, rgba(s.primaryRgb, 0));
        domeGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * s.shieldPower * entrance));
        domeGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = domeGlow;
        const glowExtent = activeShieldR * 1.4;
        ctx.fillRect(cx - glowExtent, cy - glowExtent, glowExtent * 2, glowExtent * 2);

        // Concentric shield rings
        for (let ring = SHIELD_RINGS - 1; ring >= 0; ring--) {
          const rr = activeShieldR * (1 - ring * 0.12);
          const ringAlpha = ALPHA.content.max * (0.08 + ring * 0.04) * s.shieldPower * entrance;

          // Pulsing ring
          const pulse = 1 + Math.sin(s.frameCount * 0.04 + ring * 1.2) * 0.03 * ms;
          ctx.beginPath();
          ctx.arc(cx, cy, rr * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ringAlpha);
          ctx.lineWidth = px(0.0015 + ring * 0.0005, minDim);
          ctx.stroke();
        }

        // Shield interior fill
        const interiorGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, activeShieldR);
        interiorGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.6 * s.shieldPower * entrance));
        interiorGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.atmosphere.min * s.shieldPower * entrance));
        interiorGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = interiorGrad;
        ctx.fillRect(cx - activeShieldR, cy - activeShieldR, activeShieldR * 2, activeShieldR * 2);
      }

      // ── Draw projectiles ────────────────────────────
      for (const pr of s.projectiles) {
        const ppx = pr.x * w;
        const ppy = pr.y * h;
        const pR = px(PROJECTILE_R_FRAC, minDim);
        const pColor = pr.deflected ? s.primaryRgb : s.accentRgb;
        const pAlpha = pr.opacity * entrance;

        // Projectile glow
        const pGlowR = pR * 3;
        const pGlow = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, pGlowR);
        pGlow.addColorStop(0, rgba(pColor, ALPHA.glow.max * 0.3 * pAlpha));
        pGlow.addColorStop(1, rgba(pColor, 0));
        ctx.fillStyle = pGlow;
        ctx.fillRect(ppx - pGlowR, ppy - pGlowR, pGlowR * 2, pGlowR * 2);

        // Projectile body
        ctx.beginPath();
        ctx.arc(ppx, ppy, pR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, ALPHA.content.max * 0.3 * pAlpha);
        ctx.fill();
      }

      // ── Draw sparks ─────────────────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.life -= 0.025;

        if (sp.life <= 0) {
          s.sparks.splice(i, 1);
          continue;
        }

        const spR = px(0.003 * sp.life, minDim);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255], 0.4),
          ALPHA.content.max * sp.life * 0.6 * entrance,
        );
        ctx.fill();
      }

      // ── Draw core node ──────────────────────────────
      const coreR = px(CORE_R_FRAC, minDim) * (1 + breath * 0.06);

      // Core glow
      const coreGlowR = coreR * 5;
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreGlowR);
      coreGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
      coreGlow.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
      coreGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - coreGlowR, cy - coreGlowR, coreGlowR * 2, coreGlowR * 2);

      // Core body
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      // Core bright center
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
        ALPHA.content.max * 0.3 * entrance,
      );
      ctx.fill();

      // ── Deflection counter arc ──────────────────────
      if (s.deflections > 0 && !s.completed) {
        const counterR = px(0.06, minDim);
        const counterAngle = (s.deflections / DEFLECT_TARGET) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, activeShieldR > counterR + 10 ? activeShieldR + px(0.015, minDim) : counterR + px(0.04, minDim),
          -Math.PI / 2, -Math.PI / 2 + counterAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
