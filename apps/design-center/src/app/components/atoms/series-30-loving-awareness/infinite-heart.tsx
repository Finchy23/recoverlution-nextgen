/**
 * ATOM 297: THE INFINITE HEART ENGINE
 * =====================================
 * Series 30 — Loving Awareness · Position 7
 *
 * The heart does not break — it breaks OPEN to hold more. Press the
 * center — the glass shatters but the light continues to expand.
 *
 * PHYSICS:
 *   - Crystalline heart-shaped boundary (SIZE.lg) with inner warm glow
 *   - Glass surface has refraction shimmer and Fresnel edge highlights
 *   - Hold center to build internal pressure (visible pulsing + cracks)
 *   - Pressure cracks emit volumetric light shafts from within
 *   - Sacred geometry pattern overlays heart boundary (12-fold)
 *   - At threshold: glass shatters into specular-lit fragments
 *   - Light expands past boundary with subsurface scattering glow
 *   - Heartbeat rhythm syncs to breath coupling (drives)
 *   - Post-shatter: deep slow universal heartbeat with god rays
 *   - Breath modulates heartbeat depth, crack light warmth, shard drift
 *
 * INTERACTION:
 *   Hold (center) → builds pressure → shatters boundary → infinite expansion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static expanded heart light with sacred geometry
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Heart boundary radius */
const HEART_R = SIZE.lg;                         // 0.32
/** Post-shatter expanded radius (fills viewport) */
const EXPANDED_R = 0.56;
/** Pressure build rate per frame while holding */
const PRESSURE_RATE = 0.005;
/** Pressure at which glass shatters */
const SHATTER_THRESHOLD = 0.85;
/** Number of glass shards on shatter */
const SHARD_COUNT = 24;
/** Shard outward drift speed */
const SHARD_DRIFT = 0.0018;
/** Heartbeat oscillation speed */
const HEARTBEAT_SPEED = 0.028;
/** Heartbeat visual strength (scale modulation) */
const HEARTBEAT_STRENGTH = 0.14;
/** Post-shatter expansion rate */
const EXPAND_RATE = 0.007;
/** Breath modulates heartbeat depth */
const BREATH_HEARTBEAT = 0.08;
/** Breath modulates crack warmth */
const BREATH_WARMTH = 0.06;
/** Breath modulates shard drift */
const BREATH_DRIFT = 0.04;
/** Multi-layer glow depth */
const GLOW_LAYERS = 5;
/** Pulse ring count (post-shatter heartbeat visualization) */
const PULSE_RING_COUNT = 4;
/** Pressure crack light shaft count */
const CRACK_SHAFT_COUNT = 10;
/** Crack shaft max length */
const CRACK_SHAFT_LEN = 0.25;
/** Sacred geometry overlay petals */
const SACRED_PETALS = 12;
/** Fresnel edge highlight width */
const FRESNEL_WIDTH = 0.006;
/** Specular highlight radius */
const SPECULAR_R = 0.02;
/** Subsurface scattering glow radius multiplier */
const SSS_MULTIPLIER = 1.4;
/** Volumetric god ray count (post-shatter) */
const GOD_RAY_COUNT = 14;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Glass shard fragment */
interface HeartShard {
  angle: number;
  dist: number;
  speed: number;
  rotation: number;
  rotSpeed: number;
  size: number;
  /** Unique shimmer phase for glass-like refraction */
  shimmerPhase: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER: Draw parametric heart curve
// ═════════════════════════════════════════════════════════════════════

function drawHeartPath(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
) {
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += 0.04) {
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    const scale = r / 17;
    const px2 = cx + x * scale;
    const py2 = cy + y * scale;
    if (a === 0) ctx.moveTo(px2, py2);
    else ctx.lineTo(px2, py2);
  }
  ctx.closePath();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function InfiniteHeartAtom({
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
    holding: false,
    pressure: 0,
    shattered: false,
    expansion: 0,
    heartbeatPhase: 0,
    shards: [] as HeartShard[],
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
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;
      const warmColor = lerpColor(s.primaryRgb, s.accentRgb, 0.2 + breath * BREATH_WARMTH);

      // ── Reduced motion ──────────────────────────────────────
      if (p.reducedMotion) {
        const rR = px(EXPANDED_R * 0.5, minDim);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = rR * (1.5 + i);
          const gA = ALPHA.glow.max * 0.28 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.5));
          gg.addColorStop(0.6, rgba(s.primaryRgb, gA * 0.15));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        drawHeartPath(ctx, cx, cy, rR * 0.6);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (p.phase === 'resolve' && !s.shattered) { s.pressure = 1; }

      // ── Pressure build ──────────────────────────────────────
      if (s.holding && !s.shattered) {
        s.pressure = Math.min(1, s.pressure + PRESSURE_RATE * ms);
      } else if (!s.shattered) {
        s.pressure = Math.max(0, s.pressure - PRESSURE_RATE * 0.25 * ms);
      }

      // Heartbeat — breath-driven
      s.heartbeatPhase += HEARTBEAT_SPEED * ms * (1 + breath * 0.5);
      const heartbeat = Math.pow(Math.max(0, Math.sin(s.heartbeatPhase)), 6);

      // Step haptic
      if (s.pressure >= 0.5 && !s.stepNotified && !s.shattered) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      // Shatter
      if (s.pressure >= SHATTER_THRESHOLD && !s.shattered) {
        s.shattered = true;
        cb.onHaptic('step_advance');
        for (let i = 0; i < SHARD_COUNT; i++) {
          s.shards.push({
            angle: (i / SHARD_COUNT) * Math.PI * 2 + Math.random() * 0.25,
            dist: HEART_R * 0.45,
            speed: SHARD_DRIFT * (0.4 + Math.random() * 0.8),
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            size: 0.012 + Math.random() * 0.016,
            shimmerPhase: Math.random() * Math.PI * 2,
          });
        }
      }

      // Post-shatter
      if (s.shattered) {
        s.expansion = Math.min(1, s.expansion + EXPAND_RATE * ms);
        const breathDrift = 1 + breath * BREATH_DRIFT;
        for (const shard of s.shards) {
          shard.dist += shard.speed * ms * breathDrift;
          shard.rotation += shard.rotSpeed * ms;
        }
      }

      if (s.expansion >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.shattered ? 0.5 + s.expansion * 0.5 : s.pressure * 0.5);

      // ── Derived render values ─────────────────────────────
      const currentR = s.shattered
        ? HEART_R + s.expansion * (EXPANDED_R - HEART_R)
        : HEART_R * (1 + s.pressure * 0.12);
      const breathScale = 1 + breath * BREATH_HEARTBEAT;
      const heartR = px(currentR * 0.5, minDim) * breathScale;
      const pressurePulse = s.shattered ? 0 : s.pressure * 0.08 * heartbeat;

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 1: Volumetric light shafts through pressure cracks
      // ═════════════════════════════════════════════════════════════
      if (!s.shattered && s.pressure > 0.35) {
        const crackIntensity = (s.pressure - 0.35) / 0.65;
        for (let i = 0; i < CRACK_SHAFT_COUNT; i++) {
          const ca = (i / CRACK_SHAFT_COUNT) * Math.PI * 2 + time * 0.08 + i * 0.3;
          const shaftLen = px(CRACK_SHAFT_LEN * crackIntensity * (0.5 + 0.5 * Math.sin(time * 1.5 + i)), minDim);
          const sx = cx + Math.cos(ca) * heartR * 0.65;
          const sy = cy + Math.sin(ca) * heartR * 0.65;
          const ex = cx + Math.cos(ca) * (heartR * 0.65 + shaftLen);
          const ey = cy + Math.sin(ca) * (heartR * 0.65 + shaftLen);

          const sg = ctx.createLinearGradient(sx, sy, ex, ey);
          const sa = ALPHA.glow.max * 0.15 * crackIntensity * entrance;
          sg.addColorStop(0, rgba(warmColor, sa));
          sg.addColorStop(0.3, rgba(warmColor, sa * 0.4));
          sg.addColorStop(1, rgba(warmColor, 0));
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = sg;
          ctx.lineWidth = px(0.005 * crackIntensity, minDim);
          ctx.stroke();
        }
      }

      // Post-shatter volumetric god rays
      if (s.shattered && s.expansion > 0.1) {
        for (let i = 0; i < GOD_RAY_COUNT; i++) {
          const ra = (i / GOD_RAY_COUNT) * Math.PI * 2 + time * 0.02;
          const rayLen = px(0.45 * s.expansion * (0.5 + 0.5 * Math.sin(time * 0.5 + i * 0.8)), minDim);
          const rx1 = cx + Math.cos(ra) * px(0.02, minDim);
          const ry1 = cy + Math.sin(ra) * px(0.02, minDim);
          const rx2 = cx + Math.cos(ra) * rayLen;
          const ry2 = cy + Math.sin(ra) * rayLen;

          const rg = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
          const rAlpha = ALPHA.glow.max * 0.08 * s.expansion * entrance;
          rg.addColorStop(0, rgba(warmColor, rAlpha));
          rg.addColorStop(0.3, rgba(warmColor, rAlpha * 0.4));
          rg.addColorStop(0.7, rgba(warmColor, rAlpha * 0.1));
          rg.addColorStop(1, rgba(warmColor, 0));
          ctx.beginPath();
          ctx.moveTo(rx1, ry1);
          ctx.lineTo(rx2, ry2);
          ctx.strokeStyle = rg;
          ctx.lineWidth = px(0.005 * s.expansion, minDim);
          ctx.stroke();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 2: Inner radiance glow (5-stop gradients)
      // ═════════════════════════════════════════════════════════════
      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = heartR * (1.2 + i * 0.75 + pressurePulse * 3);
        const intensity = s.shattered ? (0.15 + s.expansion * 0.3) : (0.05 + s.pressure * 0.22);
        const gA = ALPHA.glow.max * intensity * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(warmColor, gA));
        gg.addColorStop(0.15, rgba(warmColor, gA * 0.75));
        gg.addColorStop(0.4, rgba(warmColor, gA * 0.3));
        gg.addColorStop(0.7, rgba(warmColor, gA * 0.08));
        gg.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // Subsurface scattering glow — light passing through translucent heart
      if (!s.shattered && s.pressure > 0.2) {
        const sssR = heartR * SSS_MULTIPLIER;
        const sssAlpha = ALPHA.glow.max * 0.08 * (s.pressure - 0.2) / 0.8 * entrance;
        const ssg = ctx.createRadialGradient(cx, cy, heartR * 0.5, cx, cy, sssR);
        ssg.addColorStop(0, rgba(warmColor, sssAlpha));
        ssg.addColorStop(0.5, rgba(warmColor, sssAlpha * 0.3));
        ssg.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = ssg;
        ctx.fillRect(cx - sssR, cy - sssR, sssR * 2, sssR * 2);
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 3: Heart boundary with sacred geometry + Fresnel
      // ═════════════════════════════════════════════════════════════
      if (!s.shattered) {
        // Sacred geometry overlay on heart
        const geoAlpha = ALPHA.content.max * 0.08 * (1 + s.pressure * 0.3) * entrance;
        for (let i = 0; i < SACRED_PETALS; i++) {
          const a = (i / SACRED_PETALS) * Math.PI * 2 + time * 0.05;
          const pr = heartR * 0.85;
          const px1 = cx + Math.cos(a) * pr * 0.3;
          const py1 = cy + Math.sin(a) * pr * 0.3;
          const px2 = cx + Math.cos(a) * pr;
          const py2 = cy + Math.sin(a) * pr;
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.strokeStyle = rgba(s.primaryRgb, geoAlpha);
          ctx.lineWidth = px(0.0008, minDim);
          ctx.stroke();
        }

        // Heart boundary with Fresnel edge
        drawHeartPath(ctx, cx, cy, heartR * (1 + pressurePulse));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.25 + s.pressure * 0.25) * entrance);
        ctx.lineWidth = px(0.003, minDim);
        ctx.stroke();

        // Fresnel edge highlight (brighter at glancing angles)
        drawHeartPath(ctx, cx, cy, heartR * (1 + pressurePulse) * 1.01);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * (0.5 + 0.5 * Math.sin(time * 0.8)) * entrance);
        ctx.lineWidth = px(FRESNEL_WIDTH, minDim);
        ctx.stroke();

        // Specular highlight on glass surface
        const specX = cx - heartR * 0.2;
        const specY = cy - heartR * 0.3;
        const specR2 = px(SPECULAR_R, minDim) * (1 + s.pressure * 0.5);
        const specG = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR2);
        specG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance));
        specG.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance));
        specG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = specG;
        ctx.fillRect(specX - specR2, specY - specR2, specR2 * 2, specR2 * 2);

        // Pressure cracks with glow
        if (s.pressure > 0.35) {
          const crackCount = Math.floor(s.pressure * 10);
          for (let i = 0; i < crackCount; i++) {
            const ca = (i / crackCount) * Math.PI * 2 + time * 0.15;
            const cl = heartR * 0.35 * (s.pressure - 0.35) / 0.65;
            const crx = cx + Math.cos(ca) * heartR * 0.65;
            const cry = cy + Math.sin(ca) * heartR * 0.65;
            const endX = crx + Math.cos(ca + 0.25) * cl;
            const endY = cry + Math.sin(ca + 0.25) * cl;

            // Crack glow
            const cgR = px(0.01, minDim);
            const cg = ctx.createRadialGradient(crx, cry, 0, crx, cry, cgR);
            cg.addColorStop(0, rgba(warmColor, ALPHA.glow.max * 0.15 * (s.pressure - 0.35) / 0.65 * entrance));
            cg.addColorStop(1, rgba(warmColor, 0));
            ctx.fillStyle = cg;
            ctx.fillRect(crx - cgR, cry - cgR, cgR * 2, cgR * 2);

            // Crack line
            ctx.beginPath();
            ctx.moveTo(crx, cry);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = rgba(warmColor, ALPHA.content.max * 0.35 * (s.pressure - 0.35) / 0.65 * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 4: Glass shards (post-shatter) with shimmer
      // ═════════════════════════════════════════════════════════════
      for (const shard of s.shards) {
        const sx = cx + Math.cos(shard.angle) * px(shard.dist, minDim);
        const sy = cy + Math.sin(shard.angle) * px(shard.dist, minDim);
        const shardFade = 1 - Math.min(1, shard.dist / 0.75);
        const shardAlpha = ALPHA.content.max * 0.3 * shardFade * entrance;
        if (shardAlpha < 0.01) continue;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(shard.rotation);
        const ss = px(shard.size, minDim);

        // Shard body — glass-like gradient
        ctx.beginPath();
        ctx.moveTo(-ss, -ss * 0.5);
        ctx.lineTo(ss * 0.5, -ss);
        ctx.lineTo(ss, ss * 0.3);
        ctx.lineTo(-ss * 0.3, ss * 0.7);
        ctx.closePath();

        const shardGrad = ctx.createLinearGradient(-ss, -ss, ss, ss);
        shardGrad.addColorStop(0, rgba(s.primaryRgb, shardAlpha * 0.4));
        shardGrad.addColorStop(0.4, rgba(s.primaryRgb, shardAlpha));
        shardGrad.addColorStop(0.7, rgba(s.primaryRgb, shardAlpha * 0.5));
        shardGrad.addColorStop(1, rgba(s.primaryRgb, shardAlpha * 0.15));
        ctx.fillStyle = shardGrad;
        ctx.fill();

        // Glass shimmer (refraction-like highlight)
        const shimmer = 0.5 + 0.5 * Math.sin(time * 2 + shard.shimmerPhase);
        ctx.strokeStyle = rgba(s.primaryRgb, shardAlpha * 0.4 * shimmer);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.stroke();

        ctx.restore();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 5: Heartbeat pulse rings (post-shatter)
      // ═════════════════════════════════════════════════════════════
      if (s.shattered && heartbeat > 0.05) {
        for (let i = 0; i < PULSE_RING_COUNT; i++) {
          const ringPhase = (s.heartbeatPhase * 0.15 + i * 0.3) % 1;
          const ringR = heartR * (0.4 + ringPhase * 2.5);
          const ringA = ALPHA.content.max * 0.1 * (1 - ringPhase) * heartbeat * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmColor, ringA);
          ctx.lineWidth = px(0.0015 * (1 - ringPhase), minDim);
          ctx.stroke();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 6: Core warm point with heartbeat
      // ═════════════════════════════════════════════════════════════
      const coreR = px(0.022, minDim) * (1 + heartbeat * HEARTBEAT_STRENGTH) * breathScale;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2);
      coreGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * (0.55 + (s.shattered ? 0.4 : s.pressure * 0.3)) * entrance));
      coreGrad.addColorStop(0.3, rgba(warmColor, ALPHA.content.max * 0.3 * entrance));
      coreGrad.addColorStop(0.7, rgba(warmColor, ALPHA.content.max * 0.08 * entrance));
      coreGrad.addColorStop(1, rgba(warmColor, 0));
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core bright point
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.6 + heartbeat * 0.3) * entrance);
      ctx.fill();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────────
    const onDown = () => {
      stateRef.current.holding = true;
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = () => { stateRef.current.holding = false; };
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
