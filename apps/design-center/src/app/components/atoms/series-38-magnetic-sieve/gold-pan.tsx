/**
 * ATOM 379: THE GOLD PAN ENGINE
 * ================================
 * Series 38 — Magnetic Sieve · Position 9
 *
 * Prove that 90% of effort was not wasted — the gold was there
 * the whole time. Shake to wash away dirt and reveal the nugget.
 *
 * PHYSICS:
 *   - Heavy digital pan filled with dirt particles and rocks
 *   - User physically shakes device left and right (rapid swipes)
 *   - Water washes useless dirt over edges with each shake
 *   - Dirt particles slide and scatter with momentum physics
 *   - After sufficient shaking, a single glowing dense gold nugget
 *     remains gleaming at center
 *   - Breath modulates the gold nugget's final glow intensity
 *
 * INTERACTION:
 *   Rapid horizontal swipes → shakes the pan, washes dirt
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static gold nugget in empty pan
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Pan radius as fraction of minDim */
const PAN_R_FRAC = 0.32;
/** Pan rim thickness */
const PAN_RIM_FRAC = 0.008;
/** Number of dirt particles */
const DIRT_COUNT = 90;
/** Dirt particle size range */
const DIRT_R_MIN = 0.004;
const DIRT_R_MAX = 0.014;
/** Rock (larger dirt) count within dirt */
const ROCK_COUNT = 12;
/** Gold nugget radius */
const NUGGET_R_FRAC = 0.025;
/** Shake force applied to dirt per direction change */
const SHAKE_FORCE = 0.015;
/** Gravity toward pan center (keeps things in pan) */
const PAN_GRAVITY = 0.0003;
/** Friction on pan surface */
const SURFACE_FRICTION = 0.94;
/** Direction change detection threshold (px) */
const DIR_CHANGE_THRESHOLD = 12;
/** Fraction of dirt that must be removed for completion */
const WASH_COMPLETE = 0.80;
/** Gold glow expansion multiplier */
const GOLD_GLOW_MULT = 7;
/** Breath glow factor on nugget */
const BREATH_GOLD_FACTOR = 0.12;
/** Water visual alpha */
const WATER_ALPHA = 0.04;

// =====================================================================
// STATE TYPES
// =====================================================================

interface DirtParticle {
  x: number;           // relative to pan center (-1 to 1)
  y: number;
  vx: number;
  vy: number;
  radius: number;
  washed: boolean;      // fell off pan edge
  isRock: boolean;
  rotation: number;
  mass: number;         // heavier = harder to wash
}

// =====================================================================
// HELPERS
// =====================================================================

function createDirt(): DirtParticle[] {
  const particles: DirtParticle[] = [];
  for (let i = 0; i < DIRT_COUNT; i++) {
    const isRock = i < ROCK_COUNT;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 0.8;
    particles.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      vx: 0,
      vy: 0,
      radius: isRock
        ? DIRT_R_MAX * (0.7 + Math.random() * 0.3)
        : DIRT_R_MIN + Math.random() * (DIRT_R_MAX - DIRT_R_MIN),
      washed: false,
      isRock,
      rotation: Math.random() * Math.PI * 2,
      mass: isRock ? 0.6 + Math.random() * 0.3 : 0.2 + Math.random() * 0.3,
    });
  }
  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function GoldPanAtom({
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
    dirt: createDirt(),
    washedCount: 0,
    completed: false,
    completionAnim: 0,
    nuggetReveal: 0,
    // Shake detection
    pointerDown: false,
    lastX: 0,
    lastDir: 0,
    shakeCount: 0,
    waterSplash: 0,        // visual splash effect timer
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
      if (p.phase === 'resolve') {
        // Auto-shake
        if (s.frameCount % 8 === 0) {
          const dir = s.frameCount % 16 === 0 ? 1 : -1;
          for (const d of s.dirt) {
            if (!d.washed) {
              d.vx += SHAKE_FORCE * dir / (d.mass + 0.1);
              d.vy += (Math.random() - 0.5) * SHAKE_FORCE * 0.3;
            }
          }
        }
      }

      const panR = px(PAN_R_FRAC, minDim);

      // ── Dirt physics ────────────────────────────────
      let washed = 0;
      for (const d of s.dirt) {
        if (d.washed) { washed++; continue; }

        // Apply pan gravity (slight pull toward center)
        const dist = Math.sqrt(d.x * d.x + d.y * d.y);
        if (dist > 0.01) {
          d.vx -= (d.x / dist) * PAN_GRAVITY * ms;
          d.vy -= (d.y / dist) * PAN_GRAVITY * ms;
        }

        // Apply friction
        d.vx *= SURFACE_FRICTION;
        d.vy *= SURFACE_FRICTION;

        // Integrate
        d.x += d.vx * ms;
        d.y += d.vy * ms;
        d.rotation += d.vx * 0.3;

        // Check if washed off pan edge
        const dDist = Math.sqrt(d.x * d.x + d.y * d.y);
        if (dDist > 1.0) {
          d.washed = true;
          washed++;
        }
      }
      s.washedCount = washed;

      // ── Nugget reveal ───────────────────────────────
      const washFraction = washed / DIRT_COUNT;
      s.nuggetReveal = Math.max(s.nuggetReveal,
        easeOutExpo(Math.max(0, (washFraction - 0.3) / 0.7)));

      // ── Completion check ────────────────────────────
      if (washFraction >= WASH_COMPLETE && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : washFraction * 0.5);

      // ── Water splash decay ──────────────────────────
      if (s.waterSplash > 0) {
        s.waterSplash = Math.max(0, s.waterSplash - 0.02);
      }

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Draw empty pan with gold nugget
        ctx.beginPath();
        ctx.arc(cx, cy, panR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(PAN_RIM_FRAC, minDim);
        ctx.stroke();

        // Nugget
        drawNugget(ctx, cx, cy, minDim, s.primaryRgb, 1, breath, entrance);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Draw pan ────────────────────────────────────
      // Pan shadow
      const shadowR = panR * 1.1;
      const shadow = ctx.createRadialGradient(cx, cy + panR * 0.05, panR * 0.8, cx, cy + panR * 0.05, shadowR);
      shadow.addColorStop(0, rgba(s.primaryRgb, 0));
      shadow.addColorStop(1, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance));
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

      // Pan surface
      const panSurface = ctx.createRadialGradient(cx, cy, 0, cx, cy, panR);
      panSurface.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance));
      panSurface.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance));
      panSurface.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = panSurface;
      ctx.beginPath();
      ctx.arc(cx, cy, panR, 0, Math.PI * 2);
      ctx.fill();

      // Pan rim
      ctx.beginPath();
      ctx.arc(cx, cy, panR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.lineWidth = px(PAN_RIM_FRAC, minDim);
      ctx.stroke();

      // Inner concentric rings (pan texture)
      for (let ring = 1; ring <= 4; ring++) {
        const rr = panR * (ring / 5);
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.2 * entrance);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.stroke();
      }

      // ── Water splash effect ─────────────────────────
      if (s.waterSplash > 0) {
        const splashAlpha = s.waterSplash * WATER_ALPHA * entrance;
        const splashGrad = ctx.createRadialGradient(cx, cy, panR * 0.3, cx, cy, panR);
        splashGrad.addColorStop(0, rgba(s.primaryRgb, 0));
        splashGrad.addColorStop(0.5, rgba(s.primaryRgb, splashAlpha));
        splashGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = splashGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, panR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw dirt particles ─────────────────────────
      for (const d of s.dirt) {
        if (d.washed) continue;

        const dpx = cx + d.x * panR;
        const dpy = cy + d.y * panR;
        const dR = px(d.radius, minDim);

        ctx.save();
        ctx.translate(dpx, dpy);
        ctx.rotate(d.rotation);

        if (d.isRock) {
          // Irregular rock shape
          ctx.beginPath();
          ctx.moveTo(-dR * 0.8, -dR * 0.6);
          ctx.lineTo(dR * 0.9, -dR * 0.4);
          ctx.lineTo(dR * 0.7, dR * 0.8);
          ctx.lineTo(-dR * 0.5, dR * 0.6);
          ctx.closePath();
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.18 * entrance);
          ctx.fill();
        } else {
          // Small dirt grain
          ctx.beginPath();
          ctx.ellipse(0, 0, dR, dR * 0.7, 0, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
          ctx.fill();
        }

        ctx.restore();
      }

      // ── Draw gold nugget ────────────────────────────
      if (s.nuggetReveal > 0.02) {
        drawNugget(ctx, cx, cy, minDim, s.primaryRgb, s.nuggetReveal, breath, entrance);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    /** Draw the gold nugget at center */
    function drawNugget(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number, minDim: number,
      rgb: RGB, reveal: number, breath: number, entrance: number,
    ) {
      const nR = px(NUGGET_R_FRAC, minDim) * reveal;
      const breathMod = 1 + breath * BREATH_GOLD_FACTOR;

      // Outer glow
      const glowR = nR * GOLD_GLOW_MULT * breathMod;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, rgba(rgb, ALPHA.glow.max * 0.45 * reveal * entrance));
      glow.addColorStop(0.2, rgba(rgb, ALPHA.glow.max * 0.25 * reveal * entrance));
      glow.addColorStop(0.5, rgba(rgb, ALPHA.glow.min * reveal * entrance));
      glow.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      // Inner warm halo
      const innerR = nR * 3;
      const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerR);
      inner.addColorStop(0, rgba(rgb, ALPHA.content.max * 0.3 * reveal * entrance));
      inner.addColorStop(0.5, rgba(rgb, ALPHA.atmosphere.max * reveal * entrance));
      inner.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = inner;
      ctx.fillRect(cx - innerR, cy - innerR, innerR * 2, innerR * 2);

      // Nugget body — irregular but roughly circular
      ctx.beginPath();
      const points = 8;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wobble = 1 + Math.sin(angle * 3.7) * 0.15 + Math.cos(angle * 2.3) * 0.1;
        const vx = cx + Math.cos(angle) * nR * wobble;
        const vy = cy + Math.sin(angle) * nR * wobble;
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.55 * reveal * entrance);
      ctx.fill();

      // Specular highlight
      const specX = cx - nR * 0.3;
      const specY = cy - nR * 0.3;
      const specR = nR * 0.4;
      const spec = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
      spec.addColorStop(0, rgba(
        lerpColor(rgb, [255, 255, 255], 0.5),
        ALPHA.content.max * 0.3 * reveal * entrance,
      ));
      spec.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = spec;
      ctx.fillRect(specX - specR, specY - specR, specR * 2, specR * 2);
    }

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers (shake detection) ─────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointerDown = true;
      s.lastX = e.clientX;
      s.lastDir = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerDown) return;

      const dx = e.clientX - s.lastX;
      const dir = dx > 0 ? 1 : -1;

      if (Math.abs(dx) > DIR_CHANGE_THRESHOLD && dir !== s.lastDir && s.lastDir !== 0) {
        // Direction changed = shake!
        s.shakeCount++;
        s.waterSplash = 1;

        // Apply shake force to all non-washed dirt
        for (const d of s.dirt) {
          if (!d.washed) {
            const force = SHAKE_FORCE / (d.mass + 0.1);
            d.vx += dir * force * (0.8 + Math.random() * 0.4);
            d.vy += (Math.random() - 0.5) * force * 0.4;
          }
        }

        callbacksRef.current.onHaptic('step_advance');
      }

      if (Math.abs(dx) > DIR_CHANGE_THRESHOLD) {
        s.lastDir = dir;
        s.lastX = e.clientX;
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pointerDown = false;
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
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
}
