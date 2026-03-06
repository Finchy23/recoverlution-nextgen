/**
 * ATOM 268: THE JUGGLER ENGINE
 * ================================
 * Series 27 — Cosmic Play · Position 8
 *
 * Your responsibilities are not glass — they are rubber.
 * Drop them. They bounce right back. Tap to launch balls upward.
 * The more you juggle, the more they glow with holographic light.
 *
 * SIGNATURE TECHNIQUE: Holographic Diffraction + Generative Art
 *   - Each ball refracts light based on its velocity angle
 *   - Rainbow interference fringes trail behind fast-moving balls
 *   - Holographic floor reflection with angle-dependent color shift
 *   - Kaleidoscopic burst particles on each bounce
 *
 * PHYSICS:
 *   - 6 balls with individual mass, size, and hue offset
 *   - Parabolic arcs with gravity, high restitution bounce
 *   - Velocity-dependent holographic color shifts (angle → hue)
 *   - Bounce generates kaleidoscopic burst particles (8-fold symmetry)
 *   - Holographic floor reflection: mirrored ball with chromatic shift
 *   - Arc trail with rainbow diffraction gradient
 *   - 7 rendering layers: floor reflection, arc trails, ball shadow,
 *     ball glow, ball body with specular, burst particles, progress
 *   - Breath couples to: ball shimmer intensity, trail opacity, floor glow
 *   - All balls launched + 20 total bounces → completion
 *
 * INTERACTION:
 *   Tap near ball → launch upward (tap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: All balls floating at different heights with static glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Number of juggling balls */
const BALL_COUNT = 6;
/** Base ball radius (fraction of minDim) */
const BALL_BASE_R = 0.022;
/** Gravitational acceleration per frame */
const GRAVITY = 0.00038;
/** Bounce restitution coefficient — rubber balls! */
const BOUNCE_RESTITUTION = 0.88;
/** Floor y-position (fraction of viewport height) */
const FLOOR_Y = 0.82;
/** Upward velocity on launch */
const LAUNCH_VEL = 0.013;
/** Horizontal drift range on launch */
const LAUNCH_DRIFT = 0.004;
/** Left wall boundary */
const WALL_LEFT = 0.06;
/** Right wall boundary */
const WALL_RIGHT = 0.94;
/** Total bounces needed for completion */
const BOUNCES_TO_COMPLETE = 20;
/** Bounce burst particle count per bounce event */
const BURST_PARTICLES = 8;
/** Burst particle lifetime in frames */
const BURST_LIFE = 40;
/** Maximum arc trail length per ball */
const TRAIL_MAX = 24;
/** Holographic hue rotation speed (radians per unit velocity) */
const HOLO_HUE_SPEED = 12.0;
/** Floor reflection opacity factor */
const FLOOR_REFLECT_ALPHA = 0.12;
/** Number of glow passes for active balls */
const GLOW_LAYERS = 5;
/** Specular highlight offset (fraction of ball radius) */
const SPECULAR_OFFSET = 0.28;
/** Specular highlight size (fraction of ball radius) */
const SPECULAR_SIZE = 0.22;
/** Breath shimmer modulation factor */
const BREATH_SHIMMER = 0.08;
/** Breath trail opacity modulation */
const BREATH_TRAIL = 0.06;
/** Breath floor glow modulation */
const BREATH_FLOOR = 0.04;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** A juggling ball with full physics state */
interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Individual ball radius multiplier */
  rMul: number;
  /** Base hue offset 0–1 for this ball's identity color */
  hueOffset: number;
  /** Whether the ball has been launched at least once */
  launched: boolean;
  /** Total bounces this ball has made */
  bounces: number;
  /** Current holographic hue angle (radians) */
  holoAngle: number;
  /** Position trail for arc rendering */
  trail: Array<{ x: number; y: number }>;
}

/** Kaleidoscopic burst particle spawned on bounce */
interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Convert hue (0–1) to an RGB triplet via HSL with full saturation.
 * Used for holographic diffraction rainbow effect.
 */
function hueToRgb(hue: number): RGB {
  const h = ((hue % 1) + 1) % 1;
  const s = 0.7;
  const l = 0.6;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 1/6)      { r = c; g = x; }
  else if (h < 2/6) { r = x; g = c; }
  else if (h < 3/6) { g = c; b = x; }
  else if (h < 4/6) { g = x; b = c; }
  else if (h < 5/6) { r = x; b = c; }
  else               { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ] as unknown as RGB;
}

/**
 * Draw specular highlight on a sphere surface.
 */
function drawSpecular(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  entrance: number,
): void {
  const sx = cx - r * SPECULAR_OFFSET;
  const sy = cy - r * SPECULAR_OFFSET;
  const sr = r * SPECULAR_SIZE;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
  sg.addColorStop(0, `rgba(255,255,255,${0.4 * entrance})`);
  sg.addColorStop(0.5, `rgba(255,255,255,${0.1 * entrance})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw holographic floor line with chromatic glow.
 */
function drawFloor(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, minDim: number,
  rgb: RGB, entrance: number, breathAmp: number,
): void {
  const floorPx = FLOOR_Y * h;
  const glowH = px(0.025 + breathAmp * BREATH_FLOOR, minDim);

  // Floor glow gradient
  const fg = ctx.createLinearGradient(0, floorPx - glowH, 0, floorPx + glowH);
  fg.addColorStop(0, 'rgba(0,0,0,0)');
  fg.addColorStop(0.4, rgba(rgb, ALPHA.atmosphere.max * 0.03 * entrance));
  fg.addColorStop(0.5, rgba(rgb, ALPHA.atmosphere.max * 0.06 * entrance));
  fg.addColorStop(0.6, rgba(rgb, ALPHA.atmosphere.max * 0.03 * entrance));
  fg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fg;
  ctx.fillRect(w * 0.04, floorPx - glowH, w * 0.92, glowH * 2);

  // Floor line
  ctx.beginPath();
  ctx.moveTo(w * 0.04, floorPx);
  ctx.lineTo(w * 0.96, floorPx);
  ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.06 * entrance);
  ctx.lineWidth = px(STROKE.thin, minDim);
  ctx.stroke();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function JugglerAtom({
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
    balls: Array.from({ length: BALL_COUNT }, (_, i): Ball => ({
      x: 0.15 + (i / (BALL_COUNT - 1)) * 0.7,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      rMul: 0.85 + Math.random() * 0.3,
      hueOffset: i / BALL_COUNT,
      launched: false,
      bounces: 0,
      holoAngle: 0,
      trail: [],
    })),
    bursts: [] as BurstParticle[],
    totalBounces: 0,
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
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION — static floating balls with gentle glow
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        drawFloor(ctx, w, h, minDim, s.primaryRgb, entrance, 0);
        for (let i = 0; i < BALL_COUNT; i++) {
          const bx = (0.15 + (i / (BALL_COUNT - 1)) * 0.7) * w;
          const by = (0.35 + Math.sin(i * 1.3) * 0.12) * h;
          const bR = px(BALL_BASE_R * (0.85 + i * 0.05), minDim);
          const bColor = lerpColor(s.primaryRgb, s.accentRgb, i / BALL_COUNT);
          // Glow
          const gR = bR * 4;
          const gg = ctx.createRadialGradient(bx, by, 0, bx, by, gR);
          gg.addColorStop(0, rgba(bColor, ALPHA.glow.max * 0.08 * entrance));
          gg.addColorStop(0.4, rgba(bColor, ALPHA.glow.max * 0.02 * entrance));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(bx - gR, by - gR, gR * 2, gR * 2);
          // Body
          const bg = ctx.createRadialGradient(bx - bR * 0.2, by - bR * 0.2, bR * 0.1, bx, by, bR);
          bg.addColorStop(0, rgba(lerpColor(bColor, [255, 255, 255] as unknown as RGB, 0.3), ALPHA.content.max * 0.4 * entrance));
          bg.addColorStop(0.5, rgba(bColor, ALPHA.content.max * 0.35 * entrance));
          bg.addColorStop(1, rgba(bColor, ALPHA.content.max * 0.1 * entrance));
          ctx.beginPath(); ctx.arc(bx, by, bR, 0, Math.PI * 2);
          ctx.fillStyle = bg; ctx.fill();
          drawSpecular(ctx, bx, by, bR, entrance);
        }
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ═══════════════════════════════════════════════════════════════
      // BALL PHYSICS
      // ═══════════════════════════════════════════════════════════════
      for (const b of s.balls) {
        if (!b.launched) continue;

        b.vy += GRAVITY * ms;
        b.x += b.vx * ms;
        b.y += b.vy * ms;

        // Holographic angle shifts with velocity direction
        const speed = Math.hypot(b.vx, b.vy);
        b.holoAngle += speed * HOLO_HUE_SPEED * ms;

        // Trail recording
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > TRAIL_MAX) b.trail.shift();

        // Floor bounce
        if (b.y >= FLOOR_Y) {
          b.y = FLOOR_Y;
          b.vy = -Math.abs(b.vy) * BOUNCE_RESTITUTION;
          b.bounces++;
          s.totalBounces++;
          cb.onHaptic('tap');

          // Spawn kaleidoscopic burst
          for (let k = 0; k < BURST_PARTICLES; k++) {
            const angle = (k / BURST_PARTICLES) * Math.PI * 2;
            const spd = 0.002 + Math.random() * 0.003;
            s.bursts.push({
              x: b.x, y: FLOOR_Y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd * 0.6 - 0.002,
              life: BURST_LIFE,
              maxLife: BURST_LIFE,
              hue: b.hueOffset + k / BURST_PARTICLES,
              size: 0.002 + Math.random() * 0.002,
            });
          }
        }

        // Wall bounces
        if (b.x < WALL_LEFT) { b.x = WALL_LEFT; b.vx = Math.abs(b.vx); }
        if (b.x > WALL_RIGHT) { b.x = WALL_RIGHT; b.vx = -Math.abs(b.vx); }
      }

      // Burst particle physics
      for (let i = s.bursts.length - 1; i >= 0; i--) {
        const bp = s.bursts[i];
        bp.x += bp.vx * ms;
        bp.y += bp.vy * ms;
        bp.vy += 0.00005 * ms;
        bp.life -= ms;
        if (bp.life <= 0) s.bursts.splice(i, 1);
      }

      // Progress
      const launchedCount = s.balls.filter(b => b.launched).length;
      if (launchedCount >= 3 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (launchedCount >= BALL_COUNT && s.totalBounces >= BOUNCES_TO_COMPLETE && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      const progFrac = s.completed ? 1 : Math.min(0.9,
        (launchedCount / BALL_COUNT) * 0.4 + Math.min(1, s.totalBounces / BOUNCES_TO_COMPLETE) * 0.5);
      cb.onStateChange?.(progFrac);

      const breathShimmer = p.breathAmplitude * BREATH_SHIMMER;
      const breathTrail = p.breathAmplitude * BREATH_TRAIL;

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Floor with holographic reflection line
      // ═══════════════════════════════════════════════════════════════
      drawFloor(ctx, w, h, minDim, s.primaryRgb, entrance, p.breathAmplitude);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Floor reflections (inverted ghost balls)
      // ═══════════════════════════════════════════════════════════════
      for (const b of s.balls) {
        if (!b.launched) continue;
        const bx = b.x * w;
        const by = b.y * h;
        const floorPx = FLOOR_Y * h;
        const reflY = floorPx + (floorPx - by) * 0.4;
        const bR = px(BALL_BASE_R * b.rMul, minDim);
        const distFromFloor = Math.abs(by - floorPx);
        const reflAlpha = Math.max(0, FLOOR_REFLECT_ALPHA * (1 - distFromFloor / (h * 0.4)));

        if (reflAlpha > 0.005) {
          const holoHue = (b.hueOffset + b.holoAngle * 0.1) % 1;
          const reflColor = hueToRgb(holoHue);
          const rg = ctx.createRadialGradient(bx, reflY, 0, bx, reflY, bR * 1.5);
          rg.addColorStop(0, rgba(reflColor, ALPHA.content.max * reflAlpha * entrance));
          rg.addColorStop(0.5, rgba(reflColor, ALPHA.content.max * reflAlpha * 0.3 * entrance));
          rg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.ellipse(bx, reflY, bR * 1.2, bR * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Arc trails with rainbow diffraction
      // ═══════════════════════════════════════════════════════════════
      for (const b of s.balls) {
        if (b.trail.length < 3) continue;
        const speed = Math.hypot(b.vx, b.vy);
        if (speed < 0.001) continue;

        for (let i = 1; i < b.trail.length; i++) {
          const t = i / b.trail.length;
          const pt = b.trail[i];
          const trailHue = (b.hueOffset + i * 0.03 + b.holoAngle * 0.05) % 1;
          const trailColor = hueToRgb(trailHue);
          const trailR = px(BALL_BASE_R * b.rMul * 0.4 * t, minDim);
          const trailAlpha = ALPHA.content.max * (0.04 + breathTrail) * t * speed * 60 * entrance;

          if (trailR > 0.3 && trailAlpha > 0.002) {
            ctx.beginPath();
            ctx.arc(pt.x * w, pt.y * h, trailR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(trailColor, Math.min(0.15, trailAlpha));
            ctx.fill();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Ball shadows
      // ═══════════════════════════════════════════════════════════════
      for (const b of s.balls) {
        const bx = b.x * w;
        const floorPx = FLOOR_Y * h;
        const bR = px(BALL_BASE_R * b.rMul, minDim);
        const height = Math.abs(b.y - FLOOR_Y);
        const shadowScale = Math.max(0.25, 1 - height * 2);
        const shadowY = floorPx + px(0.005, minDim);

        ctx.beginPath();
        ctx.ellipse(bx, shadowY, bR * shadowScale * 1.2, bR * 0.15 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = rgba([0, 0, 0] as unknown as RGB, 0.06 * shadowScale * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Ball glow fields (multi-pass)
      // ═══════════════════════════════════════════════════════════════
      for (const b of s.balls) {
        if (!b.launched) continue;
        const bx = b.x * w;
        const by = b.y * h;
        const bR = px(BALL_BASE_R * b.rMul, minDim);
        const holoHue = (b.hueOffset + b.holoAngle * 0.1) % 1;
        const glowColor = lerpColor(s.primaryRgb, hueToRgb(holoHue), 0.5 + breathShimmer);

        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = bR * (2.0 + gi * 1.5);
          const gA = ALPHA.glow.max * (0.04 + breathShimmer * 0.5) * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(bx, by, 0, bx, by, gR);
          gg.addColorStop(0, rgba(glowColor, gA));
          gg.addColorStop(0.3, rgba(glowColor, gA * 0.4));
          gg.addColorStop(0.6, rgba(glowColor, gA * 0.1));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(bx - gR, by - gR, gR * 2, gR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Ball bodies with holographic gradient + specular
      // ═══════════════════════════════════════════════════════════════
      for (const b of s.balls) {
        const bx = b.x * w;
        const by = b.y * h;
        const bR = px(BALL_BASE_R * b.rMul, minDim);
        const holoHue = (b.hueOffset + b.holoAngle * 0.1) % 1;
        const bColor = lerpColor(
          lerpColor(s.primaryRgb, s.accentRgb, b.hueOffset),
          hueToRgb(holoHue),
          b.launched ? 0.35 + breathShimmer : 0.1,
        );
        const bodyAlpha = ALPHA.content.max * (b.launched ? 0.45 : 0.18) * entrance;

        // 5-stop body gradient
        const bg = ctx.createRadialGradient(
          bx - bR * 0.2, by - bR * 0.2, bR * 0.05,
          bx, by, bR,
        );
        bg.addColorStop(0, rgba(lerpColor(bColor, [255, 255, 255] as unknown as RGB, 0.3), bodyAlpha));
        bg.addColorStop(0.25, rgba(bColor, bodyAlpha));
        bg.addColorStop(0.55, rgba(lerpColor(bColor, s.primaryRgb, 0.3), bodyAlpha * 0.8));
        bg.addColorStop(0.85, rgba(s.primaryRgb, bodyAlpha * 0.4));
        bg.addColorStop(1, rgba(s.primaryRgb, bodyAlpha * 0.05));

        ctx.beginPath();
        ctx.arc(bx, by, bR, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        // Edge rim (holographic Fresnel)
        if (b.launched) {
          ctx.beginPath();
          ctx.arc(bx, by, bR, 0, Math.PI * 2);
          const rimColor = hueToRgb((holoHue + 0.3) % 1);
          ctx.strokeStyle = rgba(rimColor, ALPHA.content.max * 0.08 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }

        // Specular highlight
        drawSpecular(ctx, bx, by, bR, entrance);

        // Secondary reflection ellipse
        if (bR > 2) {
          ctx.beginPath();
          ctx.ellipse(bx + bR * 0.15, by + bR * 0.18, bR * 0.1, bR * 0.06, 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.06 * entrance})`;
          ctx.fill();
        }

        // Idle prompt for unlaunched balls
        if (!b.launched) {
          const pulse = 0.5 + 0.5 * Math.sin(time + b.hueOffset * Math.PI * 2);
          ctx.beginPath();
          ctx.arc(bx, by, bR * 1.6, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.025 * pulse * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.setLineDash([px(0.003, minDim), px(0.006, minDim)]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Kaleidoscopic burst particles
      // ═══════════════════════════════════════════════════════════════
      for (const bp of s.bursts) {
        const life = bp.life / bp.maxLife;
        const bpR = px(bp.size * life, minDim);
        if (bpR < 0.3) continue;

        const burstColor = hueToRgb(bp.hue);
        const bpx = bp.x * w;
        const bpy = bp.y * h;

        // Particle glow
        const pgR = bpR * 3;
        const pg = ctx.createRadialGradient(bpx, bpy, 0, bpx, bpy, pgR);
        pg.addColorStop(0, rgba(burstColor, ALPHA.glow.max * 0.12 * life * entrance));
        pg.addColorStop(0.5, rgba(burstColor, ALPHA.glow.max * 0.03 * life * entrance));
        pg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pg;
        ctx.fillRect(bpx - pgR, bpy - pgR, pgR * 2, pgR * 2);

        // Particle body
        ctx.beginPath();
        ctx.arc(bpx, bpy, bpR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(burstColor, ALPHA.content.max * 0.3 * life * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // PROGRESS ARC + COMPLETION BLOOM
      // ═══════════════════════════════════════════════════════════════
      if (progFrac > 0.01 && !s.completed) {
        const progR = px(0.04, minDim);
        const progAngle = progFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, h * 0.08, progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (s.completed) {
        // Holographic bloom — expanding rainbow rings
        for (let i = 0; i < 4; i++) {
          const rPhase = (time * 0.015 + i * 0.25) % 1;
          const rR = px(SIZE.md * (0.5 + rPhase * 3), minDim);
          const bloomHue = (time * 0.02 + i * 0.25) % 1;
          const bloomColor = hueToRgb(bloomHue);
          const bloomAlpha = ALPHA.content.max * 0.04 * (1 - rPhase) * entrance;

          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(bloomColor, bloomAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Find nearest unlaunched ball first, then nearest any ball
      let nearest: Ball | null = null;
      let minDist = 0.12;
      for (const b of s.balls) {
        if (b.launched) continue;
        const d = Math.hypot(mx - b.x, my - b.y);
        if (d < minDist) { minDist = d; nearest = b; }
      }
      // If all launched, retap to relaunch any
      if (!nearest) {
        minDist = 0.12;
        for (const b of s.balls) {
          const d = Math.hypot(mx - b.x, my - b.y);
          if (d < minDist) { minDist = d; nearest = b; }
        }
      }

      if (nearest) {
        nearest.launched = true;
        nearest.vy = -LAUNCH_VEL * (0.8 + Math.random() * 0.4);
        nearest.vx = (Math.random() - 0.5) * LAUNCH_DRIFT;
        callbacksRef.current.onHaptic('tap');
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
