/**
 * ATOM 286: THE TECTONIC DROP ENGINE
 * =====================================
 * Series 29 — Interoceptive Anchor · Position 6
 *
 * The ego hovers above the head. Drop it into the gut —
 * the node becomes a heavy silent red anchor with a massive
 * shockwave on impact.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Pre-drop: chaotic contour lines swirl around the floating ego
 *   - Impact shockwave distorts topographic terrain outward
 *   - Post-landing: Chladni pattern crystallizes around the anchor
 *     as the ground resonates from the impact — stillness emerges
 *   - Teaches: dropping into the body creates stable ground
 *
 * PHYSICS:
 *   - Buzzing white ego node at top → swipe down → extreme Z-axis fall
 *   - Impact at gut-height: massive shockwave + screen-shake
 *   - Node transforms from buzzing white to deep silent anchor
 *   - 8 layers: chaos contours, nervous particles, fall trail,
 *     shockwaves, tectonic contours, node glow, node body+specular,
 *     anchor Chladni + landing symbols
 *   - Breath couples to: contour drift, anchor glow warmth, post-land pulse
 *
 * INTERACTION:
 *   Swipe down → drop the ego (swipe_commit → completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static anchor at gut-center with Chladni
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

/** Ego starting vertical position (fraction of height) */
const EGO_START_Y = 0.12;
/** Gut landing position (fraction of height) */
const GUT_Y = 0.6;
/** Ego node radius (fraction of minDim) */
const EGO_R = SIZE.sm * 0.5;
/** Anchor node radius after landing (fraction of minDim) */
const ANCHOR_R = SIZE.md;
/** Fall gravity acceleration */
const FALL_GRAVITY = 0.0012;
/** Terminal velocity during fall */
const FALL_TERMINAL = 0.025;
/** Pre-drop buzz displacement amplitude */
const BUZZ_AMP = 0.003;
/** Pre-drop buzz oscillation speed */
const BUZZ_SPEED = 20;
/** Shockwave expansion speed */
const SHOCKWAVE_SPEED = 3.5;
/** Shockwave life decay per frame */
const SHOCKWAVE_LIFE_DECAY = 0.012;
/** Screen-shake decay multiplier */
const SCREEN_SHAKE_DECAY = 0.92;
/** Maximum nervous particles spawned pre-drop */
const NERVOUS_PARTICLES = 16;
/** Swipe distance threshold (fraction of height) */
const SWIPE_THRESHOLD = 0.08;
/** Glow layers for the node */
const NODE_GLOW_LAYERS = 5;
/** Chaos contour count (pre-drop) */
const CHAOS_CONTOUR_COUNT = 8;
/** Tectonic contour count (post-landing) */
const TECTONIC_CONTOUR_COUNT = 12;
/** Tectonic contour spacing */
const TECTONIC_SPACING = 0.028;
/** Chladni grid resolution for landing pattern */
const CHLADNI_RES = 22;
/** Chladni threshold */
const CHLADNI_THRESH = 0.15;
/** Chladni dot radius */
const CHLADNI_DOT = 0.003;
/** Breath warmth coupling */
const BREATH_WARMTH = 0.05;
/** Specular offset */
const SPECULAR_OFFSET = 0.25;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

interface NervousParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
}

interface Shockwave {
  r: number; life: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw chaotic contour lines swirling around the ego node (pre-drop).
 */
function drawChaosContours(
  ctx: CanvasRenderingContext2D,
  nodeX: number, nodeY: number, minDim: number,
  rgb: RGB, entrance: number, frame: number,
): void {
  for (let i = 0; i < CHAOS_CONTOUR_COUNT; i++) {
    const baseR = px(0.015 * (i + 1), minDim);
    const speed = 0.02 + i * 0.005;
    const cx2 = nodeX + Math.sin(frame * speed + i) * px(0.01, minDim);
    const cy2 = nodeY + Math.cos(frame * speed * 0.7 + i) * px(0.008, minDim);
    const alpha = ALPHA.atmosphere.max * 0.2 * (1 - i / CHAOS_CONTOUR_COUNT) * entrance;

    ctx.beginPath();
    const steps = 24;
    for (let a = 0; a <= steps; a++) {
      const angle = (a / steps) * Math.PI * 2;
      const wobble = 1 + 0.2 * Math.sin(angle * 7 + frame * 0.015 + i * 1.3);
      const px2 = cx2 + Math.cos(angle) * baseR * wobble;
      const py2 = cy2 + Math.sin(angle) * baseR * wobble;
      if (a === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw tectonic contour terrain around the anchor post-landing.
 * Contours ripple outward then settle into stable elevation map.
 */
function drawTectonicContours(
  ctx: CanvasRenderingContext2D,
  anchorX: number, anchorY: number, minDim: number,
  rgb: RGB, entrance: number, landProgress: number,
  frame: number, breathAmp: number,
): void {
  if (landProgress < 0.1) return;
  const vis = Math.min(1, (landProgress - 0.1) / 0.5);
  for (let i = 0; i < TECTONIC_CONTOUR_COUNT; i++) {
    const baseR = px(TECTONIC_SPACING * (i + 2), minDim);
    const settle = 1 - (1 - landProgress) * Math.sin(i * 0.8);
    const breathDrift = breathAmp * px(BREATH_WARMTH * 0.2, minDim) * Math.cos(i * 0.4 + frame * 0.003);
    const r = baseR * settle + breathDrift;
    const alpha = ALPHA.atmosphere.max * vis * 0.3 *
      (1 - i / TECTONIC_CONTOUR_COUNT) * entrance;

    ctx.beginPath();
    const steps = 36;
    for (let a = 0; a <= steps; a++) {
      const angle = (a / steps) * Math.PI * 2;
      const wobble = 1 + 0.05 * Math.sin(angle * 4 + i * 1.1 + frame * 0.002) * settle;
      const px2 = anchorX + Math.cos(angle) * r * wobble;
      const py2 = anchorY + Math.sin(angle) * r * wobble * 0.7;
      if (a === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(i % 4 === 0 ? STROKE.thin : STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw Chladni nodal pattern that crystallizes after landing.
 */
function drawLandingChladni(
  ctx: CanvasRenderingContext2D,
  anchorX: number, anchorY: number, minDim: number,
  rgb: RGB, entrance: number, landProgress: number,
): void {
  if (landProgress < 0.4) return;
  const vis = (landProgress - 0.4) / 0.6;
  const n = 4; const m = 3;
  const fieldR = px(0.25, minDim);
  const dotR = px(CHLADNI_DOT, minDim);

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES - 1)) * 2 - 1;
      if (nx * nx + ny * ny > 1) continue;

      const val = Math.abs(
        Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny) -
        Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny)
      );

      if (val < CHLADNI_THRESH) {
        const x = anchorX + nx * fieldR;
        const y = anchorY + ny * fieldR * 0.7;
        const intensity = (1 - val / CHLADNI_THRESH) * vis;
        ctx.beginPath();
        ctx.arc(x, y, dotR * (0.4 + intensity * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.1 * intensity * entrance);
        ctx.fill();
      }
    }
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function TectonicDropAtom({
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
    nodeY: EGO_START_Y,
    fallVelocity: 0,
    falling: false,
    landed: false,
    landProgress: 0,
    shockwaves: [] as Shockwave[],
    screenShake: 0,
    nervousParticles: [] as NervousParticle[],
    swiping: false,
    swipeStartY: 0,
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

      // Screen shake
      const shakeX = s.screenShake * (Math.random() - 0.5) * px(0.012, minDim);
      const shakeY = s.screenShake * (Math.random() - 0.5) * px(0.012, minDim);
      s.screenShake *= SCREEN_SHAKE_DECAY;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion || p.phase === 'resolve') {
        s.landed = true; s.nodeY = GUT_Y; s.landProgress = 1;
      }

      // ═══════════════════════════════════════════════════════════════
      // FALL PHYSICS
      // ═══════════════════════════════════════════════════════════════
      if (s.falling && !s.landed) {
        s.fallVelocity = Math.min(FALL_TERMINAL, s.fallVelocity + FALL_GRAVITY * ms);
        s.nodeY += s.fallVelocity * ms;
        if (s.nodeY >= GUT_Y) {
          s.nodeY = GUT_Y;
          s.landed = true;
          s.screenShake = 1;
          for (let i = 0; i < 4; i++) s.shockwaves.push({ r: 0, life: 1 - i * 0.12 });
          cb.onHaptic('completion');
          s.completed = true;
        }
      }

      if (s.landed) s.landProgress = Math.min(1, s.landProgress + 0.015 * ms);

      // Shockwave physics
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.r += SHOCKWAVE_SPEED * ms;
        sw.life -= SHOCKWAVE_LIFE_DECAY * ms;
        if (sw.life <= 0) s.shockwaves.splice(i, 1);
      }

      // Nervous particles (pre-drop)
      if (!s.falling && !s.landed) {
        if (s.frameCount % 3 === 0 && s.nervousParticles.length < NERVOUS_PARTICLES) {
          const angle = Math.random() * Math.PI * 2;
          s.nervousParticles.push({
            x: 0.5 + Math.cos(angle) * 0.02,
            y: EGO_START_Y + Math.sin(angle) * 0.02,
            vx: Math.cos(angle) * 0.002 * (0.5 + Math.random()),
            vy: Math.sin(angle) * 0.002 * (0.5 + Math.random()) - 0.001,
            life: 30 + Math.random() * 25,
          });
        }
      }
      for (let i = s.nervousParticles.length - 1; i >= 0; i--) {
        const np = s.nervousParticles[i];
        np.x += np.vx * ms; np.y += np.vy * ms;
        np.life -= ms;
        if (np.life <= 0) s.nervousParticles.splice(i, 1);
      }

      cb.onStateChange?.(s.completed ? 1 : s.falling ? 0.3 + (s.nodeY - EGO_START_Y) / (GUT_Y - EGO_START_Y) * 0.7 : 0);

      const nodeX = cx;
      const nodeY = s.nodeY * h;
      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb, p.breathAmplitude * BREATH_WARMTH);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Chaos contours (pre-drop) OR tectonic contours (post)
      // ═══════════════════════════════════════════════════════════════
      if (!s.falling && !s.landed) {
        drawChaosContours(ctx, nodeX, nodeY, minDim, s.accentRgb, entrance, s.frameCount);
      }
      if (s.landed) {
        drawTectonicContours(ctx, nodeX, nodeY, minDim, s.primaryRgb, entrance,
          s.landProgress, s.frameCount, p.breathAmplitude);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Nervous particles (pre-drop only)
      // ═══════════════════════════════════════════════════════════════
      for (const np of s.nervousParticles) {
        const npR = px(0.0025, minDim) * (np.life / 50);
        // Particle glow
        const glowR = npR * 3;
        const pg = ctx.createRadialGradient(np.x * w, np.y * h, 0, np.x * w, np.y * h, glowR);
        pg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.08 * (np.life / 50) * entrance));
        pg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pg;
        ctx.fillRect(np.x * w - glowR, np.y * h - glowR, glowR * 2, glowR * 2);
        // Particle body
        ctx.beginPath();
        ctx.arc(np.x * w, np.y * h, npR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * (np.life / 50) * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Fall trail (during descent)
      // ═══════════════════════════════════════════════════════════════
      if (s.falling && !s.landed) {
        const trailTop = EGO_START_Y * h;
        const trailGrad = ctx.createLinearGradient(0, trailTop, 0, nodeY);
        trailGrad.addColorStop(0, 'rgba(0,0,0,0)');
        trailGrad.addColorStop(0.6, rgba(s.accentRgb, ALPHA.content.max * 0.06 * entrance));
        trailGrad.addColorStop(1, rgba(warmRgb, ALPHA.content.max * 0.12 * entrance));
        ctx.fillStyle = trailGrad;
        const trailW = px(0.005, minDim);
        ctx.fillRect(cx - trailW, trailTop, trailW * 2, nodeY - trailTop);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Shockwaves (impact rings with glow)
      // ═══════════════════════════════════════════════════════════════
      for (const sw of s.shockwaves) {
        const swR = sw.r;
        // Ring stroke
        ctx.beginPath();
        ctx.arc(cx, GUT_Y * h, swR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * sw.life * entrance);
        ctx.lineWidth = px(STROKE.bold * sw.life, minDim);
        ctx.stroke();
        // Ring glow spread
        const glowSpread = px(0.01, minDim);
        const rg = ctx.createRadialGradient(cx, GUT_Y * h, swR - glowSpread, cx, GUT_Y * h, swR + glowSpread);
        rg.addColorStop(0, 'rgba(0,0,0,0)');
        rg.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.05 * sw.life * entrance));
        rg.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * sw.life * entrance));
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(cx - swR - glowSpread, GUT_Y * h - swR - glowSpread,
          (swR + glowSpread) * 2, (swR + glowSpread) * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Landing Chladni pattern
      // ═══════════════════════════════════════════════════════════════
      if (s.landed) {
        drawLandingChladni(ctx, nodeX, nodeY, minDim, warmRgb, entrance, s.landProgress);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Node shadow + glow (5 layers, 5-stop)
      // ═══════════════════════════════════════════════════════════════
      const currentR = s.landed
        ? px(EGO_R + (ANCHOR_R - EGO_R) * s.landProgress, minDim)
        : px(EGO_R, minDim);
      const nodeColor = s.landed
        ? lerpColor(s.accentRgb, s.primaryRgb, s.landProgress)
        : s.accentRgb;
      const nodeIntensity = s.landed ? 0.35 + s.landProgress * 0.45 : 0.3;

      // Shadow (post-landing)
      if (s.landed) {
        const shY = nodeY + currentR * 0.6;
        const shG = ctx.createRadialGradient(nodeX, shY, 0, nodeX, shY, currentR * 1.6);
        shG.addColorStop(0, `rgba(0,0,0,${0.1 * s.landProgress * entrance})`);
        shG.addColorStop(0.5, `rgba(0,0,0,${0.03 * s.landProgress * entrance})`);
        shG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shG;
        ctx.beginPath();
        ctx.ellipse(nodeX, shY, currentR * 1.6, currentR * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Multi-layer glow
      for (let i = NODE_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = currentR * (2 + i * 2.0 + (s.landed ? s.landProgress * 3 : 0));
        const gA = ALPHA.glow.max * nodeIntensity * 0.1 * entrance / (i + 1);
        const gg = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, gR);
        gg.addColorStop(0, rgba(nodeColor, gA));
        gg.addColorStop(0.2, rgba(nodeColor, gA * 0.6));
        gg.addColorStop(0.5, rgba(nodeColor, gA * 0.15));
        gg.addColorStop(0.8, rgba(s.primaryRgb, gA * 0.03));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(nodeX - gR, nodeY - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Node body (5-stop gradient + specular + buzz)
      // ═══════════════════════════════════════════════════════════════
      const buzz = (!s.falling && !s.landed)
        ? Math.sin(time * BUZZ_SPEED) * px(BUZZ_AMP, minDim) : 0;

      const bodyG = ctx.createRadialGradient(nodeX + buzz, nodeY, 0, nodeX + buzz, nodeY, currentR);
      const bodyA = ALPHA.content.max * (nodeIntensity + 0.1) * entrance;
      bodyG.addColorStop(0, rgba(lerpColor(nodeColor, [255, 255, 255] as unknown as RGB, s.landed ? 0.08 : 0.2), bodyA));
      bodyG.addColorStop(0.3, rgba(nodeColor, bodyA));
      bodyG.addColorStop(0.6, rgba(nodeColor, bodyA * 0.7));
      bodyG.addColorStop(0.85, rgba(s.landed ? s.primaryRgb : s.accentRgb, bodyA * 0.3));
      bodyG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.arc(nodeX + buzz, nodeY, currentR, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      const spX = nodeX + buzz - currentR * SPECULAR_OFFSET;
      const spY = nodeY - currentR * SPECULAR_OFFSET;
      const spR = currentR * 0.2;
      const sg = ctx.createRadialGradient(spX, spY, 0, spX, spY, spR);
      sg.addColorStop(0, `rgba(255,255,255,${0.3 * entrance})`);
      sg.addColorStop(0.5, `rgba(255,255,255,${0.06 * entrance})`);
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(spX, spY, spR, 0, Math.PI * 2);
      ctx.fill();

      // Inner weight lines (post-landing)
      if (s.landed && s.landProgress > 0.3) {
        for (let i = 0; i < 3; i++) {
          const ly = nodeY - currentR * 0.35 + i * currentR * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodeX - currentR * 0.4, ly);
          ctx.lineTo(nodeX + currentR * 0.4, ly);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * s.landProgress * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Anchor symbol + swipe prompt + completion
      // ═══════════════════════════════════════════════════════════════
      // Anchor arrow (post-landing)
      if (s.landProgress > 0.7) {
        const aAlpha = (s.landProgress - 0.7) / 0.3;
        const arrowY = nodeY + currentR * 1.4;
        const arrowH = px(0.018, minDim);
        ctx.beginPath();
        ctx.moveTo(nodeX, arrowY);
        ctx.lineTo(nodeX - arrowH * 0.5, arrowY - arrowH);
        ctx.moveTo(nodeX, arrowY);
        ctx.lineTo(nodeX + arrowH * 0.5, arrowY - arrowH);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.14 * aAlpha * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Anchor seal ring
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, currentR * 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.08 * aAlpha * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // Swipe prompt (pre-drop)
      if (!s.falling && !s.landed) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 2);
        const arrowY = EGO_START_Y * h + px(0.06, minDim);
        const arrowLen = px(0.03, minDim);
        const arrowW = px(0.007, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, arrowY);
        ctx.lineTo(cx, arrowY + arrowLen);
        ctx.moveTo(cx, arrowY + arrowLen);
        ctx.lineTo(cx - arrowW, arrowY + arrowLen - arrowW);
        ctx.moveTo(cx, arrowY + arrowLen);
        ctx.lineTo(cx + arrowW, arrowY + arrowLen - arrowW);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * pulse * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore(); // shake
      ctx.restore(); // setupCanvas
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.falling || s.landed) return;
      s.swiping = true;
      s.swipeStartY = e.clientY;
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.falling) return;
      const rect = canvas.getBoundingClientRect();
      const dy = (e.clientY - s.swipeStartY) / rect.height;
      if (dy > SWIPE_THRESHOLD) {
        s.falling = true;
        s.swiping = false;
        callbacksRef.current.onHaptic('swipe_commit');
      }
    };

    const onUp = () => { stateRef.current.swiping = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
