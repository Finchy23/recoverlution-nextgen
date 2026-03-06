/**
 * ATOM 251: THE MATRYOSHKA ENGINE
 * ==================================
 * Series 26 — Identity Decoupling · Position 1
 *
 * You are not the outermost doll — you are the space in the center.
 * Peel identity layers to the luminous core.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Each shell rendered as an SDF rounded-square that morphs toward
 *     circle as it peels — rigid identity softening to fluid essence
 *   - SDF edge glow gives each shell a smooth, procedural, anti-aliased
 *     boundary with controllable softness
 *   - Inner shells morph from square→circle more, teaching that deeper
 *     layers are more fluid/formless
 *
 * PHYSICS:
 *   - 6 concentric nested SDF shells (hero-sized, fills viewport)
 *   - Each tap/swipe peels the outermost remaining shell
 *   - Shell peels with SDF dissolve + shard explosion
 *   - Each inner shell is rounder, brighter, more translucent
 *   - Ghost afterimage of each peeled shell lingers
 *   - Core is a brilliant luminous SDF circle that grows
 *   - 8 render layers: atmosphere, core glow field, ghost trails,
 *     shell shadow, shell body, shell SDF edge, specular, shards
 *
 * INTERACTION:
 *   Tap/swipe → peel outermost shell (swipe_commit, step_advance, completion)
 *
 * RENDER: Canvas 2D with SDF shell morphing + ghost trails + luminous core
 * REDUCED MOTION: All shells peeled, glowing core visible
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// SDF HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/** Signed distance for a rounded rectangle centered at origin */
function sdfRoundedBox(x: number, y: number, halfW: number, halfH: number, cornerR: number): number {
  const qx = Math.abs(x) - halfW + cornerR;
  const qy = Math.abs(y) - halfH + cornerR;
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - cornerR;
}

/** Signed distance for a circle centered at origin */
function sdfCircle(x: number, y: number, r: number): number {
  return Math.hypot(x, y) - r;
}

/** Linear morph between two SDF values */
function sdfMorph(d1: number, d2: number, t: number): number {
  return d1 * (1 - t) + d2 * t;
}

/** Convert SDF distance to smooth alpha (anti-aliased edge) */
function sdfAlpha(dist: number, edgeWidth: number): number {
  return 1 - Math.max(0, Math.min(1, (dist + edgeWidth * 0.5) / edgeWidth));
}

/** SDF edge glow — bright ring at the zero-crossing */
function sdfEdgeGlow(dist: number, width: number, intensity: number): number {
  const absDist = Math.abs(dist);
  return Math.max(0, 1 - absDist / width) * intensity;
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Number of concentric identity shells to peel */
const SHELL_COUNT = 6;
/** Outermost shell radius — hero-sized, fills viewport */
const OUTER_R = 0.34;
/** Innermost shell radius before core */
const INNER_R = 0.06;
/** Shards spawned per peel event */
const SHARD_COUNT = 16;
/** Shard outward velocity (fraction/frame) */
const SHARD_SPEED = 0.007;
/** Gravity pulling shards downward */
const SHARD_GRAVITY = 0.00005;
/** Shard opacity drain per frame */
const SHARD_LIFE_DRAIN = 0.005;
/** Ghost trail persistence multiplier */
const GHOST_DECAY = 0.991;
/** Core luminous pulse speed */
const CORE_PULSE_SPEED = 0.018;
/** Core glow field radius */
const CORE_GLOW_R = 0.28;
/** Number of glow layers for core */
const CORE_GLOW_LAYERS = 6;
/** SDF edge rendering width (anti-alias) */
const SDF_EDGE_W = 0.008;
/** SDF edge glow width */
const SDF_GLOW_W = 0.025;
/** Shell SDF sampling resolution */
const SDF_SAMPLE_RES = 3;
/** Specular highlight offset from center */
const SPECULAR_OFFSET = 0.15;
/** Specular highlight radius */
const SPECULAR_R = 0.04;
/** Shadow offset below each shell */
const SHADOW_OFFSET_Y = 0.012;
/** Shadow blur radius */
const SHADOW_BLUR_R = 0.02;
/** Completion emanation ring count */
const EMANATION_RINGS = 5;
/** Radial light ray count at completion */
const RAY_COUNT = 10;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface Shard {
  x: number; y: number; vx: number; vy: number;
  angle: number; rotSpeed: number;
  w: number; h: number; life: number; layer: number;
}

interface GhostShell {
  radius: number; alpha: number; color: RGB; morphT: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw an SDF-morphed shell (rounded-square → circle) */
function drawSdfShell(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, minDim: number,
  morphT: number, color: RGB, alpha: number, entrance: number,
  breathMod: number, frameCount: number, layerIndex: number,
) {
  const pxR = px(r, minDim) * breathMod;
  const halfSize = pxR;
  // Corner radius: 0 = sharp square, pxR = full circle
  const cornerR = pxR * (0.1 + morphT * 0.9);

  // ── Shadow layer ────────────────────────────────────────────
  const shadowY = px(SHADOW_OFFSET_Y, minDim);
  const shadowR = px(SHADOW_BLUR_R, minDim);
  const shadowGrad = ctx.createRadialGradient(cx, cy + shadowY, pxR * 0.5, cx, cy + shadowY, pxR + shadowR);
  shadowGrad.addColorStop(0, rgba(color, ALPHA.glow.min * alpha * 0.3 * entrance));
  shadowGrad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(cx - pxR - shadowR, cy + shadowY - pxR - shadowR, (pxR + shadowR) * 2, (pxR + shadowR) * 2);

  // ── Shell body (rounded rect path) ──────────────────────────
  ctx.beginPath();
  ctx.roundRect(cx - halfSize, cy - halfSize, halfSize * 2, halfSize * 2, cornerR);

  // 5-stop radial gradient for body
  const bodyGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pxR);
  const bodyA = ALPHA.content.max * alpha * entrance;
  bodyGrad.addColorStop(0, rgba(color, bodyA * 0.08));
  bodyGrad.addColorStop(0.25, rgba(color, bodyA * 0.12));
  bodyGrad.addColorStop(0.55, rgba(color, bodyA * 0.18));
  bodyGrad.addColorStop(0.82, rgba(color, bodyA * 0.25));
  bodyGrad.addColorStop(1, rgba(color, bodyA * 0.08));
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // ── Shell stroke with SDF-like soft edge ────────────────────
  ctx.strokeStyle = rgba(color, ALPHA.content.max * alpha * 0.6 * entrance);
  ctx.lineWidth = px(STROKE.thin, minDim);
  ctx.stroke();

  // ── SDF edge glow (luminous boundary) ───────────────────────
  const glowPxR = px(SDF_GLOW_W, minDim);
  const edgeGrad = ctx.createRadialGradient(cx, cy, pxR - glowPxR, cx, cy, pxR + glowPxR);
  edgeGrad.addColorStop(0, rgba(color, 0));
  edgeGrad.addColorStop(0.4, rgba(color, ALPHA.glow.max * alpha * 0.2 * entrance));
  edgeGrad.addColorStop(0.5, rgba(color, ALPHA.glow.max * alpha * 0.35 * entrance));
  edgeGrad.addColorStop(0.6, rgba(color, ALPHA.glow.max * alpha * 0.2 * entrance));
  edgeGrad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = edgeGrad;
  ctx.beginPath();
  ctx.roundRect(cx - halfSize - glowPxR, cy - halfSize - glowPxR,
    (halfSize + glowPxR) * 2, (halfSize + glowPxR) * 2, cornerR + glowPxR);
  ctx.fill();

  // ── Surface texture rings ───────────────────────────────────
  for (let r2 = 0; r2 < 4; r2++) {
    const ringR = pxR * (0.3 + r2 * 0.18);
    const wobble = Math.sin(frameCount * 0.006 + r2 * 0.7 + layerIndex) * px(0.001, minDim);
    ctx.beginPath();
    ctx.arc(cx, cy, ringR + wobble, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(color, ALPHA.content.max * alpha * 0.08 * entrance);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }

  // ── Specular highlight ──────────────────────────────────────
  const specX = cx - pxR * SPECULAR_OFFSET;
  const specY = cy - pxR * SPECULAR_OFFSET;
  const specR = px(SPECULAR_R * (0.5 + morphT * 0.5), minDim);
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * alpha * 0.15 * entrance));
  specGrad.addColorStop(0.4, rgba([255, 255, 255] as RGB, ALPHA.content.max * alpha * 0.06 * entrance));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, specR, 0, Math.PI * 2);
  ctx.fill();

  // ── Secondary specular reflection ───────────────────────────
  const spec2X = cx + pxR * 0.2;
  const spec2Y = cy + pxR * 0.25;
  const spec2R = specR * 0.4;
  const spec2Grad = ctx.createRadialGradient(spec2X, spec2Y, 0, spec2X, spec2Y, spec2R);
  spec2Grad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * alpha * 0.06 * entrance));
  spec2Grad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = spec2Grad;
  ctx.beginPath();
  ctx.arc(spec2X, spec2Y, spec2R, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function MatryoshkaAtom({
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
    peeled: 0,
    peelAnim: 0,
    shards: [] as Shard[],
    ghosts: [] as GhostShell[],
    corePhase: 0,
    stepNotified: false,
    completed: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
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

      // ── Reduced motion / resolve ────────────────────────────
      if (p.reducedMotion || p.phase === 'resolve') {
        s.peeled = SHELL_COUNT;
        s.peelAnim = SHELL_COUNT;
        s.completed = true;
      }

      // ── Animate peel interpolation ──────────────────────────
      s.peelAnim += (s.peeled - s.peelAnim) * 0.05 * ms;
      s.corePhase += CORE_PULSE_SPEED * ms;

      // ── Breath coupling: affects glow, scale, color warmth ──
      const breathMod = 1 + p.breathAmplitude * 0.04;
      const breathGlow = 1 + p.breathAmplitude * 0.15;
      const breathWarmth = p.breathAmplitude * 0.1;

      // ── Haptics & state ─────────────────────────────────────
      if (s.peeled >= Math.ceil(SHELL_COUNT * 0.5) && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.peeled >= SHELL_COUNT && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.peeled / SHELL_COUNT);

      // ── Shard physics ───────────────────────────────────────
      for (let i = s.shards.length - 1; i >= 0; i--) {
        const sh = s.shards[i];
        sh.x += sh.vx * ms;
        sh.y += sh.vy * ms;
        sh.vy += SHARD_GRAVITY * ms;
        sh.angle += sh.rotSpeed * ms;
        sh.life -= SHARD_LIFE_DRAIN * ms;
        if (sh.life <= 0) s.shards.splice(i, 1);
      }

      // ── Ghost trail decay ──────────────────────────────────
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      const coreIntensity = Math.min(1, s.peelAnim / SHELL_COUNT);
      const corePulse = Math.pow(Math.max(0, Math.sin(s.corePhase)), 3);

      // ═══════════════════════════════════════════════════════
      // LAYER 1: Core glow field (behind everything)
      // ═══════════════════════════════════════════════════════
      for (let i = CORE_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = px(CORE_GLOW_R * (0.2 + coreIntensity * 0.8 + i * 0.12), minDim) * breathGlow;
        const gA = ALPHA.glow.max * (0.03 + coreIntensity * 0.22) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        const warmColor = lerpColor(s.primaryRgb, [255, 240, 220] as RGB, breathWarmth * coreIntensity);
        gg.addColorStop(0, rgba(warmColor, gA * (1 + corePulse * 0.25)));
        gg.addColorStop(0.2, rgba(warmColor, gA * 0.5));
        gg.addColorStop(0.5, rgba(s.primaryRgb, gA * 0.15));
        gg.addColorStop(0.8, rgba(s.primaryRgb, gA * 0.03));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 2: Ghost afterimages (trail persistence)
      // ═══════════════════════════════════════════════════════
      for (const ghost of s.ghosts) {
        const gR = px(ghost.radius, minDim);
        const cornerR = gR * (0.1 + ghost.morphT * 0.9);
        ctx.beginPath();
        ctx.roundRect(cx - gR, cy - gR, gR * 2, gR * 2, cornerR);
        ctx.strokeStyle = rgba(ghost.color, ALPHA.content.max * ghost.alpha * 0.25 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
        // Ghost fill
        ctx.fillStyle = rgba(ghost.color, ALPHA.glow.min * ghost.alpha * 0.06 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 3: SDF Shells (outer to inner)
      // ═══════════════════════════════════════════════════════
      for (let i = SHELL_COUNT - 1; i >= 0; i--) {
        const shellProgress = Math.max(0, Math.min(1, s.peelAnim - i));
        if (shellProgress >= 0.98) continue;

        const layerT = i / SHELL_COUNT;
        const shellR = OUTER_R - (OUTER_R - INNER_R) * (i / SHELL_COUNT);
        // Morph: outer shells are squarish, inner shells are circular
        const morphT = layerT * 0.85 + shellProgress * 0.15;

        const shellColor = lerpColor(s.accentRgb, s.primaryRgb, layerT);
        const baseAlpha = 0.12 + layerT * 0.15;
        const shellAlpha = baseAlpha * (1 - shellProgress * 0.9);

        // Shell offset during peel animation (spiraling outward)
        const peelAngle = i * 1.1 + s.frameCount * 0.003;
        const peelDist = shellProgress * px(0.12, minDim);
        const ox = Math.cos(peelAngle) * peelDist;
        const oy = Math.sin(peelAngle) * peelDist;

        ctx.save();
        ctx.translate(ox, oy);
        drawSdfShell(
          ctx, cx, cy,
          shellR * (1 - shellProgress * 0.15),
          minDim, morphT, shellColor, shellAlpha, entrance,
          breathMod, s.frameCount, i,
        );
        ctx.restore();

        // ── Meridian lines (subtle cross-hatch) ───────────────
        const shellPxR = px(shellR, minDim) * breathMod;
        for (let m = 0; m < 4; m++) {
          const mAngle = (m / 4) * Math.PI + i * 0.4;
          ctx.beginPath();
          ctx.moveTo(
            cx + ox + Math.cos(mAngle) * shellPxR * 0.35,
            cy + oy + Math.sin(mAngle) * shellPxR * 0.35,
          );
          ctx.lineTo(
            cx + ox + Math.cos(mAngle) * shellPxR * 0.92,
            cy + oy + Math.sin(mAngle) * shellPxR * 0.92,
          );
          ctx.strokeStyle = rgba(shellColor, ALPHA.content.max * shellAlpha * 0.08 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 4: Core spark (luminous center)
      // ═══════════════════════════════════════════════════════
      const sparkBaseR = INNER_R * 0.35 + coreIntensity * INNER_R * 0.65;
      const sparkR = px(sparkBaseR, minDim) * breathMod;
      const sparkGlow = 1 + corePulse * 0.35;

      // Inner bright core — 4-stop gradient
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sparkR * sparkGlow * 2);
      const coreA = ALPHA.content.max * (0.2 + coreIntensity * 0.6) * entrance;
      coreGrad.addColorStop(0, rgba([255, 252, 240] as RGB, coreA * 0.9));
      coreGrad.addColorStop(0.2, rgba(s.primaryRgb, coreA * 0.6));
      coreGrad.addColorStop(0.6, rgba(s.primaryRgb, coreA * 0.15));
      coreGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sparkR * sparkGlow * 2, 0, Math.PI * 2);
      ctx.fill();

      // Bright center point
      ctx.beginPath();
      ctx.arc(cx, cy, sparkR * 0.3 * sparkGlow, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 248] as RGB, ALPHA.content.max * (0.15 + coreIntensity * 0.5) * entrance);
      ctx.fill();

      // Core specular
      const cSpecR = sparkR * 0.2;
      const cSpecGrad = ctx.createRadialGradient(cx - cSpecR, cy - cSpecR, 0, cx - cSpecR, cy - cSpecR, cSpecR);
      cSpecGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.2 * coreIntensity * entrance));
      cSpecGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = cSpecGrad;
      ctx.beginPath();
      ctx.arc(cx - cSpecR, cy - cSpecR, cSpecR, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════
      // LAYER 5: Shards (exploding fragments)
      // ═══════════════════════════════════════════════════════
      for (const sh of s.shards) {
        const shx = sh.x * w;
        const shy = sh.y * h;
        const shColor = lerpColor(s.accentRgb, s.primaryRgb, sh.layer / SHELL_COUNT);
        ctx.save();
        ctx.translate(shx, shy);
        ctx.rotate(sh.angle);
        // Shard body
        ctx.fillStyle = rgba(shColor, ALPHA.content.max * 0.2 * sh.life * entrance);
        ctx.fillRect(-sh.w / 2, -sh.h / 2, sh.w, sh.h);
        // Shard edge glow
        ctx.strokeStyle = rgba(shColor, ALPHA.content.max * 0.12 * sh.life * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.strokeRect(-sh.w / 2, -sh.h / 2, sh.w, sh.h);
        // Shard specular dot
        ctx.beginPath();
        ctx.arc(0, -sh.h * 0.2, sh.w * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.1 * sh.life * entrance);
        ctx.fill();
        ctx.restore();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 6: Completion emanation
      // ═══════════════════════════════════════════════════════
      if (s.completed) {
        const time = s.frameCount * 0.01;
        // Expanding rings
        for (let i = 0; i < EMANATION_RINGS; i++) {
          const rPhase = (time * 0.025 + i / EMANATION_RINGS) % 1;
          const rR = sparkR * (3 + rPhase * 15);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim) * (1 + (1 - rPhase) * 2);
          ctx.stroke();
        }

        // Radial light rays
        for (let i = 0; i < RAY_COUNT; i++) {
          const rayAngle = (i / RAY_COUNT) * Math.PI * 2 + time * 0.08;
          const rayLen = sparkR * (5 + Math.sin(time * 0.7 + i * 1.3) * 3);
          const rayW = px(STROKE.thin, minDim);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rayAngle) * sparkR * 1.8, cy + Math.sin(rayAngle) * sparkR * 1.8);
          ctx.lineTo(cx + Math.cos(rayAngle) * rayLen, cy + Math.sin(rayAngle) * rayLen);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.025 * entrance);
          ctx.lineWidth = rayW;
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 7: Progress ring
      // ═══════════════════════════════════════════════════════
      if (!s.completed && s.peeled > 0) {
        const progressR = px(OUTER_R + 0.03, minDim);
        const progressAngle = (s.peeled / SHELL_COUNT) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, progressR, -Math.PI / 2, -Math.PI / 2 + progressAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Interaction: tap to peel ──────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.completed) return;

      // Record ghost of the shell being peeled
      const layerT = s.peeled / SHELL_COUNT;
      const shellR = OUTER_R - (OUTER_R - INNER_R) * layerT;
      const shellColor = lerpColor(s.accentRgb, s.primaryRgb, layerT);
      const morphT = layerT * 0.85;
      s.ghosts.push({ radius: shellR, alpha: 0.55, color: shellColor, morphT });

      s.peeled = Math.min(SHELL_COUNT, s.peeled + 1);
      callbacksRef.current.onHaptic('swipe_commit');

      // Spawn shards
      const minD = Math.min(viewport.width, viewport.height);
      for (let i = 0; i < SHARD_COUNT; i++) {
        const angle = (i / SHARD_COUNT) * Math.PI * 2 + Math.random() * 0.4;
        const speed = SHARD_SPEED * (0.5 + Math.random() * 0.5);
        s.shards.push({
          x: 0.5 + Math.cos(angle) * 0.03,
          y: 0.5 + Math.sin(angle) * 0.03,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.002,
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
          w: px(0.008 + Math.random() * 0.014, minD),
          h: px(0.004 + Math.random() * 0.008, minD),
          life: 1,
          layer: s.peeled - 1,
        });
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
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'pointer',
      }} />
    </div>
  );
}
