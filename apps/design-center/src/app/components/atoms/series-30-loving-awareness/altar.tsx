/**
 * ATOM 294: THE ALTAR ENGINE
 * ============================
 * Series 30 — Loving Awareness · Position 4
 *
 * Some burdens are too heavy for the ego. Place them on the altar —
 * the stone combusts into weightless glowing embers.
 *
 * PHYSICS:
 *   - Heavy dark burden-stone (SIZE.md) at top, gravitationally heavy
 *   - Luminous altar platform with sacred geometry (hexagonal mandala)
 *   - Drag burden down onto altar — it resists, feels heavy (DRAG_WEIGHT)
 *   - Volumetric god rays emanate upward from altar surface
 *   - On contact: dramatic combustion — stone fractures into 80+ embers
 *   - Embers drift upward with thermal physics (warm convective rise)
 *   - Heat shimmer distortion above altar during combustion
 *   - Incense-like smoke trails from hottest embers
 *   - Specular highlight on burden stone surface
 *   - Breath modulates altar glow warmth, ember drift speed, god ray length
 *   - Post-combustion peace: warm golden haze with eternal altar glow
 *
 * INTERACTION:
 *   Drag (burden to altar) → combustion → embers rise
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static altar with soft ember glow above
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

/** Burden stone radius */
const BURDEN_R = 0.17;
/** Burden starting Y position (fraction of height) */
const BURDEN_START_Y = 0.22;
/** Altar Y position (fraction of height) */
const ALTAR_Y = 0.76;
/** Altar platform width (fraction of minDim) */
const ALTAR_WIDTH = 0.32;
/** Altar platform height */
const ALTAR_HEIGHT = 0.04;
/** Distance threshold for combustion trigger */
const COMBUSTION_THRESHOLD = 0.065;
/** Number of embers spawned on combustion */
const EMBER_COUNT = 80;
/** Ember upward drift speed */
const EMBER_RISE_SPEED = 0.0022;
/** Ember horizontal drift amplitude */
const EMBER_DRIFT = 0.0012;
/** Ember maximum lifetime in frames */
const EMBER_LIFE = 130;
/** Minimum ember size */
const EMBER_SIZE_MIN = 0.0025;
/** Maximum ember size */
const EMBER_SIZE_MAX = 0.008;
/** Drag heaviness factor (0–1, lower = heavier) */
const DRAG_WEIGHT = 0.65;
/** Breath modulates altar glow warmth */
const BREATH_WARMTH = 0.06;
/** Breath modulates ember drift speed */
const BREATH_DRIFT = 0.05;
/** Breath modulates god ray length */
const BREATH_RAY = 0.04;
/** Altar glow rendering layers */
const ALTAR_GLOW_LAYERS = 5;
/** Sacred geometry sides (hexagonal base) */
const SACRED_GEO_SIDES = 6;
/** Sacred inner ring count */
const SACRED_INNER_RINGS = 3;
/** Volumetric god ray count from altar */
const GOD_RAY_COUNT = 10;
/** God ray max length */
const GOD_RAY_LENGTH = 0.35;
/** Heat shimmer particle count */
const SHIMMER_COUNT = 20;
/** Specular highlight on burden stone */
const BURDEN_SPECULAR_R = 0.015;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Thermal ember particle */
interface Ember {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  life: number; maxLife: number;
  heat: number;
  /** Unique wobble for organic drift */
  wobble: number;
}

/** Heat shimmer distortion particle */
interface ShimmerMote {
  x: number; y: number;
  speed: number;
  phase: number;
  size: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER: Draw sacred hexagonal mandala on altar
// ═════════════════════════════════════════════════════════════════════

function drawAltarMandala(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  width: number, rotation: number,
  color: RGB, alpha: number,
  minDim: number,
) {
  const geoR = width * 0.55;

  // Multiple concentric hexagonal rings
  for (let ring = 0; ring < SACRED_INNER_RINGS; ring++) {
    const ringR = geoR * (0.3 + ring * 0.35);
    const ringAlpha = alpha * (1 - ring * 0.25);

    // Hexagonal vertices
    for (let i = 0; i < SACRED_GEO_SIDES; i++) {
      const a1 = (i / SACRED_GEO_SIDES) * Math.PI * 2 + rotation * (ring % 2 === 0 ? 1 : -0.5);
      const a2 = ((i + 1) / SACRED_GEO_SIDES) * Math.PI * 2 + rotation * (ring % 2 === 0 ? 1 : -0.5);
      const x1 = cx + Math.cos(a1) * ringR;
      const y1 = cy + Math.sin(a1) * ringR * 0.3; // perspective flatten
      const x2 = cx + Math.cos(a2) * ringR;
      const y2 = cy + Math.sin(a2) * ringR * 0.3;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = rgba(color, ringAlpha);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // Cross-connections to inner ring
      if (ring > 0) {
        const innerR = geoR * (0.3 + (ring - 1) * 0.35);
        const ix = cx + Math.cos(a1) * innerR;
        const iy = cy + Math.sin(a1) * innerR * 0.3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(ix, iy);
        ctx.strokeStyle = rgba(color, ringAlpha * 0.5);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.stroke();
      }
    }
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function AltarAtom({
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
    burdenY: BURDEN_START_Y,
    dragging: false,
    dragOffsetY: 0,
    combusted: false,
    combustionProgress: 0,
    embers: [] as Ember[],
    shimmerMotes: Array.from({ length: SHIMMER_COUNT }, (): ShimmerMote => ({
      x: 0.5 + (Math.random() - 0.5) * 0.25,
      y: ALTAR_Y - Math.random() * 0.3,
      speed: 0.001 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
      size: 0.003 + Math.random() * 0.005,
    })),
    altarGlow: 0,
    completed: false,
    stepNotified: false,
    mandalaRotation: 0,
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

      const goldRgb: RGB = lerpColor(s.primaryRgb, [240, 190, 80] as RGB, 0.5 + breath * BREATH_WARMTH);
      const time = s.frameCount * 0.012;
      const breathDrift = 1 + breath * BREATH_DRIFT;

      // ── Reduced motion ──────────────────────────────────────
      if (p.reducedMotion) {
        const ay = ALTAR_Y * h;
        const aW = px(ALTAR_WIDTH, minDim);
        // Altar glow
        const agR = aW * 2;
        const ag = ctx.createRadialGradient(cx, ay, 0, cx, ay, agR);
        ag.addColorStop(0, rgba(goldRgb, ALPHA.glow.max * 0.25 * entrance));
        ag.addColorStop(0.4, rgba(goldRgb, ALPHA.glow.max * 0.1 * entrance));
        ag.addColorStop(1, rgba(goldRgb, 0));
        ctx.fillStyle = ag;
        ctx.fillRect(cx - agR, ay - agR, agR * 2, agR * 2);
        ctx.fillStyle = rgba(goldRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(cx - aW, ay, aW * 2, px(ALTAR_HEIGHT, minDim));
        // Static embers
        for (let i = 0; i < 20; i++) {
          const ex = cx + (Math.random() - 0.5) * aW * 1.5;
          const ey = ay - Math.random() * h * 0.35;
          ctx.beginPath();
          ctx.arc(ex, ey, px(0.004, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(goldRgb, ALPHA.content.max * 0.3 * entrance);
          ctx.fill();
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (p.phase === 'resolve' && !s.combusted) { s.burdenY = ALTAR_Y; }

      // ── Combustion detection ──────────────────────────────────
      if (!s.combusted && Math.abs(s.burdenY - ALTAR_Y) < COMBUSTION_THRESHOLD) {
        s.combusted = true;
        cb.onHaptic('hold_release');
        for (let i = 0; i < EMBER_COUNT; i++) {
          const angle = Math.random() * Math.PI * 2;
          s.embers.push({
            x: 0.5 + (Math.random() - 0.5) * 0.12,
            y: ALTAR_Y - Math.random() * 0.02,
            vx: Math.cos(angle) * 0.001 * (0.3 + Math.random()),
            vy: -(EMBER_RISE_SPEED + Math.random() * EMBER_RISE_SPEED),
            size: EMBER_SIZE_MIN + Math.random() * (EMBER_SIZE_MAX - EMBER_SIZE_MIN),
            life: EMBER_LIFE * (0.4 + Math.random() * 0.6),
            maxLife: EMBER_LIFE,
            heat: 0.4 + Math.random() * 0.6,
            wobble: Math.random() * Math.PI * 2,
          });
        }
      }

      if (s.combusted) {
        s.combustionProgress = Math.min(1, s.combustionProgress + 0.012 * ms);
        s.altarGlow = Math.min(1, s.altarGlow + 0.008 * ms);
      }

      // Mandala rotation
      s.mandalaRotation += 0.002 * ms;

      // Halfway haptic
      if (s.burdenY > (BURDEN_START_Y + ALTAR_Y) / 2 && !s.stepNotified && !s.combusted) {
        s.stepNotified = true;
        cb.onHaptic('drag_snap');
      }

      if (s.combustionProgress >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      const prog = s.combusted ? 0.5 + s.combustionProgress * 0.5
        : (s.burdenY - BURDEN_START_Y) / (ALTAR_Y - BURDEN_START_Y) * 0.5;
      cb.onStateChange?.(Math.max(0, Math.min(1, prog)));

      const ay = ALTAR_Y * h;
      const aW = px(ALTAR_WIDTH, minDim);
      const aH = px(ALTAR_HEIGHT, minDim);
      const breathGlow = 1 + breath * BREATH_WARMTH;

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 1: Volumetric god rays from altar (upward)
      // ═════════════════════════════════════════════════════════════
      const rayIntensity = 0.3 + s.altarGlow * 0.7;
      const breathRay = 1 + breath * BREATH_RAY;
      for (let i = 0; i < GOD_RAY_COUNT; i++) {
        const baseAngle = -Math.PI / 2 + (i / (GOD_RAY_COUNT - 1) - 0.5) * Math.PI * 0.7;
        const rayLen = px(GOD_RAY_LENGTH * rayIntensity * breathRay * (0.5 + 0.5 * Math.sin(time * 0.6 + i * 0.7)), minDim);
        const rx1 = cx + Math.cos(baseAngle + Math.PI / 2) * aW * 0.5 * (i / GOD_RAY_COUNT);
        const ry1 = ay;
        const rx2 = rx1 + Math.cos(baseAngle) * rayLen;
        const ry2 = ry1 + Math.sin(baseAngle) * rayLen;

        const rg = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
        const ra = ALPHA.glow.max * 0.08 * rayIntensity * entrance;
        rg.addColorStop(0, rgba(goldRgb, ra));
        rg.addColorStop(0.2, rgba(goldRgb, ra * 0.5));
        rg.addColorStop(0.5, rgba(goldRgb, ra * 0.12));
        rg.addColorStop(1, rgba(goldRgb, 0));
        ctx.beginPath();
        ctx.moveTo(rx1, ry1);
        ctx.lineTo(rx2, ry2);
        ctx.strokeStyle = rg;
        ctx.lineWidth = px(0.006 * rayIntensity, minDim);
        ctx.stroke();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 2: Altar platform with sacred mandala
      // ═════════════════════════════════════════════════════════════

      // Altar glow layers (5-stop radial)
      for (let i = ALTAR_GLOW_LAYERS - 1; i >= 0; i--) {
        const glowR = aH * (3 + i * 2 + s.altarGlow * 5) * breathGlow;
        const gA = ALPHA.glow.max * (0.04 + s.altarGlow * 0.22) * entrance / (i + 1);
        const ag = ctx.createRadialGradient(cx, ay, 0, cx, ay, glowR);
        ag.addColorStop(0, rgba(goldRgb, gA));
        ag.addColorStop(0.2, rgba(goldRgb, gA * 0.65));
        ag.addColorStop(0.45, rgba(goldRgb, gA * 0.25));
        ag.addColorStop(0.75, rgba(goldRgb, gA * 0.06));
        ag.addColorStop(1, rgba(goldRgb, 0));
        ctx.fillStyle = ag;
        ctx.fillRect(cx - glowR, ay - glowR, glowR * 2, glowR * 2);
      }

      // Sacred geometry mandala
      drawAltarMandala(
        ctx, cx, ay,
        aW, s.mandalaRotation,
        goldRgb, ALPHA.content.max * (0.08 + s.altarGlow * 0.25) * entrance,
        minDim,
      );

      // Altar surface (gradient top)
      const surfGrad = ctx.createLinearGradient(cx - aW, ay, cx + aW, ay);
      surfGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
      surfGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.28 * entrance));
      surfGrad.addColorStop(0.5, rgba(goldRgb, ALPHA.content.max * (0.2 + s.altarGlow * 0.15) * entrance));
      surfGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * 0.28 * entrance));
      surfGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
      ctx.fillStyle = surfGrad;
      ctx.fillRect(cx - aW, ay, aW * 2, aH);

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 3: Burden stone (before combustion)
      // ═════════════════════════════════════════════════════════════
      if (!s.combusted) {
        const by = s.burdenY * h;
        const bR = px(BURDEN_R, minDim);

        // Ground shadow beneath burden
        const shadowY = by + bR * 0.9;
        ctx.save();
        ctx.translate(cx, shadowY);
        ctx.scale(1, 0.25);
        ctx.beginPath();
        ctx.arc(0, 0, bR * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.glow.max * 0.06 * entrance);
        ctx.fill();
        ctx.restore();

        // Burden glow aura
        const auraR = bR * 1.5;
        const aura = ctx.createRadialGradient(cx, by, 0, cx, by, auraR);
        aura.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.12 * entrance));
        aura.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.max * 0.04 * entrance));
        aura.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = aura;
        ctx.fillRect(cx - auraR, by - auraR, auraR * 2, auraR * 2);

        // Burden body — 4-stop gradient for depth
        const burdenGrad = ctx.createRadialGradient(cx, by, 0, cx, by, bR);
        burdenGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.45 * entrance));
        burdenGrad.addColorStop(0.35, rgba(s.accentRgb, ALPHA.content.max * 0.35 * entrance));
        burdenGrad.addColorStop(0.7, rgba(s.accentRgb, ALPHA.content.max * 0.18 * entrance));
        burdenGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = burdenGrad;
        ctx.beginPath();
        ctx.arc(cx, by, bR, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight on stone
        const specX = cx - bR * 0.25;
        const specY = by - bR * 0.3;
        const specR = px(BURDEN_SPECULAR_R, minDim);
        const specG = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
        specG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
        specG.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
        specG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = specG;
        ctx.fillRect(specX - specR, specY - specR, specR * 2, specR * 2);

        // Weight texture lines
        for (let i = 0; i < 5; i++) {
          const lineY = by + bR * (0.15 + i * 0.14);
          if (lineY < by + bR * 0.85) {
            ctx.beginPath();
            ctx.moveTo(cx - bR * 0.45, lineY);
            ctx.lineTo(cx + bR * 0.45, lineY);
            ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 4: Embers with thermal physics
      // ═════════════════════════════════════════════════════════════
      for (let i = s.embers.length - 1; i >= 0; i--) {
        const em = s.embers[i];
        em.x += em.vx * ms * breathDrift + Math.sin(time * 2 + em.wobble) * EMBER_DRIFT * ms;
        em.y += em.vy * ms * breathDrift;
        em.vy *= 0.997;
        em.life -= ms;

        if (em.life <= 0) { s.embers.splice(i, 1); continue; }

        const lifeRatio = em.life / em.maxLife;
        const emx = em.x * w;
        const emy = em.y * h;
        const emR = px(em.size * lifeRatio, minDim);
        const emAlpha = ALPHA.content.max * lifeRatio * 0.65 * entrance;
        const emColor = lerpColor(goldRgb, s.primaryRgb, 1 - em.heat * lifeRatio);

        // Ember glow (3-stop)
        const egR = emR * 3.5;
        const eg = ctx.createRadialGradient(emx, emy, 0, emx, emy, egR);
        eg.addColorStop(0, rgba(emColor, emAlpha * 0.4));
        eg.addColorStop(0.4, rgba(emColor, emAlpha * 0.12));
        eg.addColorStop(1, rgba(emColor, 0));
        ctx.fillStyle = eg;
        ctx.fillRect(emx - egR, emy - egR, egR * 2, egR * 2);

        // Ember core
        ctx.beginPath();
        ctx.arc(emx, emy, emR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(emColor, emAlpha);
        ctx.fill();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 5: Heat shimmer (post-combustion)
      // ═════════════════════════════════════════════════════════════
      if (s.combusted && s.combustionProgress > 0.1) {
        const shimIntensity = Math.min(1, (s.combustionProgress - 0.1) / 0.5);
        for (const mote of s.shimmerMotes) {
          mote.y -= mote.speed * ms;
          if (mote.y < ALTAR_Y - 0.45) {
            mote.y = ALTAR_Y - Math.random() * 0.05;
            mote.x = 0.5 + (Math.random() - 0.5) * 0.2;
          }
          const mx = mote.x * w + Math.sin(time * 3 + mote.phase) * px(0.008, minDim);
          const my = mote.y * h;
          const mAlpha = ALPHA.glow.max * 0.06 * shimIntensity * (0.5 + 0.5 * Math.sin(time * 2 + mote.phase)) * entrance;
          const mR = px(mote.size, minDim);

          ctx.beginPath();
          ctx.arc(mx, my, mR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(goldRgb, mAlpha);
          ctx.fill();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 6: Post-combustion warmth haze
      // ═════════════════════════════════════════════════════════════
      if (s.combusted && s.combustionProgress > 0.25) {
        const hazeAlpha = ALPHA.glow.max * 0.1 * (s.combustionProgress - 0.25) / 0.75 * entrance;
        const hazeR = px(0.4, minDim);
        const haze = ctx.createRadialGradient(cx, ay - hazeR * 0.5, 0, cx, ay - hazeR * 0.5, hazeR);
        haze.addColorStop(0, rgba(goldRgb, hazeAlpha));
        haze.addColorStop(0.3, rgba(goldRgb, hazeAlpha * 0.4));
        haze.addColorStop(0.6, rgba(goldRgb, hazeAlpha * 0.1));
        haze.addColorStop(1, rgba(goldRgb, 0));
        ctx.fillStyle = haze;
        ctx.fillRect(cx - hazeR, ay - hazeR * 1.5, hazeR * 2, hazeR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.combusted) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (Math.abs(my - s.burdenY) < BURDEN_R * 0.8) {
        s.dragging = true;
        s.dragOffsetY = my - s.burdenY;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      const targetY = my - s.dragOffsetY;
      s.burdenY += (targetY - s.burdenY) * DRAG_WEIGHT;
      s.burdenY = Math.max(0.1, Math.min(ALTAR_Y + 0.02, s.burdenY));
    };

    const onUp = () => { stateRef.current.dragging = false; };

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
