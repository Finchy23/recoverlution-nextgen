/**
 * ATOM 300: THE ATLAS OMEGA
 * ===========================
 * Series 30 — Loving Awareness · Position 10 (CAPSTONE — Collection 3 Finale)
 *
 * The absolute end. 299 nodes swirling like a galaxy collapse into
 * a single permanent pixel of pure white light. You are the light.
 *
 * PHYSICS:
 *   - Galaxy of 120 star-particles arranged in two logarithmic spiral arms
 *   - Stars span the full viewport, each with unique orbit + brightness
 *   - Faint dust lane rendered between arms (50 dust motes)
 *   - Hold to initiate gravitational collapse — all stars spiral inward
 *   - Collapse follows inverse-square attraction toward singularity point
 *   - As density increases: nested glow layers intensify dramatically
 *   - Volumetric god-ray spokes emerge from core at 70% collapse
 *   - At hold_threshold: collapse accelerates exponentially
 *   - At singularity: ALL particles merge into one pixel of pure light
 *   - Final state: single heartbeat-pulsing pixel + expanding radiance rings
 *   - Heartbeat syncs with breathAmplitude (breathCoupling: modulates)
 *   - Breath also modulates galaxy arm rotation speed + dust lane brightness
 *   - seal_stamp at completion — the permanent mark
 *
 * INTERACTION:
 *   Hold (anywhere) → gravitational collapse → singularity
 *   Release → collapse reverses (stars drift back out)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static singularity with volumetric radiance halo
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Number of galaxy stars */
const STAR_COUNT = 120;
/** Number of faint dust motes between spiral arms */
const DUST_COUNT = 50;
/** Number of logarithmic spiral arms */
const ARM_COUNT = 2;
/** Maximum orbit radius (fraction of minDim) */
const ORBIT_MAX = 0.46;
/** Minimum orbit radius */
const ORBIT_MIN = 0.03;
/** Gravitational collapse rate while holding */
const COLLAPSE_RATE = 0.0025;
/** Collapse reversal rate when released */
const EXPAND_RATE = 0.0035;
/** Exponential collapse acceleration threshold */
const ACCEL_THRESHOLD = 0.7;
/** Acceleration multiplier past threshold */
const ACCEL_MULT = 3.5;
/** Hold threshold haptic fires at this collapse level */
const HOLD_THRESHOLD_AT = 0.5;
/** Singularity threshold for completion */
const SINGULARITY_THRESHOLD = 0.96;
/** Star minimum size (fraction of minDim) */
const STAR_SIZE_MIN = 0.001;
/** Star maximum size */
const STAR_SIZE_MAX = 0.006;
/** Dust mote size range */
const DUST_SIZE_MIN = 0.0005;
const DUST_SIZE_MAX = 0.002;
/** Star orbit speed range */
const ORBIT_SPEED_MIN = 0.0015;
const ORBIT_SPEED_MAX = 0.007;
/** Heartbeat frequency (radians per frame) */
const HEARTBEAT_FREQ = 0.025;
/** Heartbeat strength at singularity */
const HEARTBEAT_STRENGTH = 0.18;
/** Breath modulation of heartbeat amplitude */
const BREATH_HEARTBEAT = 0.4;
/** Breath modulation of galaxy arm rotation */
const BREATH_ARM_SPEED = 0.15;
/** Breath modulation of dust brightness */
const BREATH_DUST_GLOW = 0.2;
/** Singularity core radius */
const SINGULARITY_R = 0.005;
/** Glow layers for singularity bloom */
const GLOW_LAYERS = 7;
/** Volumetric god-ray count */
const GOD_RAY_COUNT = 8;
/** God-ray angular width (radians) */
const GOD_RAY_WIDTH = 0.08;
/** God-ray emergence threshold (collapse fraction) */
const GOD_RAY_THRESHOLD = 0.65;
/** Post-singularity radiance ring count */
const RADIANCE_RINGS = 5;
/** Seal ring radius */
const SEAL_R = 0.17;
/** Seal ring secondary (inner) */
const SEAL_INNER_R = 0.13;
/** Logarithmic spiral tightness */
const SPIRAL_K = 0.3;

// =====================================================================
// STATE TYPES
// =====================================================================

interface GalaxyStar {
  /** Current orbital angle */
  angle: number;
  /** Base orbital radius (fraction of minDim) */
  baseOrbitR: number;
  /** Angular velocity (radians per frame) */
  orbitSpeed: number;
  /** Visual size (fraction of minDim) */
  size: number;
  /** Base brightness 0-1 */
  brightness: number;
  /** Color lerp factor between primary and accent */
  colorT: number;
  /** Individual twinkle phase offset */
  phase: number;
  /** Which spiral arm this star belongs to */
  arm: number;
  /** Radial offset from ideal arm position */
  armOffset: number;
}

interface DustMote {
  /** Orbital angle */
  angle: number;
  /** Base orbital radius */
  baseOrbitR: number;
  /** Angular velocity */
  orbitSpeed: number;
  /** Visual size */
  size: number;
  /** Phase offset for shimmer */
  phase: number;
}

// =====================================================================
// HELPERS
// =====================================================================

/** Create a galaxy with logarithmic spiral arms */
function createGalaxy(): GalaxyStar[] {
  const stars: GalaxyStar[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const arm = i % ARM_COUNT;
    const t = i / STAR_COUNT;
    // Logarithmic spiral: r = a * e^(k*theta)
    const spiralAngle = (i / (STAR_COUNT / ARM_COUNT)) * Math.PI * 4;
    const baseAngle = spiralAngle + (arm * Math.PI);
    const armOffset = (Math.random() - 0.5) * 0.12;
    const baseR = ORBIT_MIN + Math.pow(t, 0.5) * (ORBIT_MAX - ORBIT_MIN);

    stars.push({
      angle: baseAngle + (Math.random() - 0.5) * 0.4,
      baseOrbitR: baseR + armOffset,
      orbitSpeed: ORBIT_SPEED_MIN + (1 - t) * (ORBIT_SPEED_MAX - ORBIT_SPEED_MIN) * 0.6 + Math.random() * 0.002,
      size: STAR_SIZE_MIN + Math.random() * (STAR_SIZE_MAX - STAR_SIZE_MIN),
      brightness: 0.15 + Math.random() * 0.85,
      colorT: Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      arm,
      armOffset,
    });
  }
  return stars;
}

/** Create dust lane particles */
function createDust(): DustMote[] {
  return Array.from({ length: DUST_COUNT }, (_, i) => ({
    angle: Math.random() * Math.PI * 2,
    baseOrbitR: ORBIT_MIN * 2 + Math.random() * (ORBIT_MAX * 0.8 - ORBIT_MIN * 2),
    orbitSpeed: 0.0008 + Math.random() * 0.002,
    size: DUST_SIZE_MIN + Math.random() * (DUST_SIZE_MAX - DUST_SIZE_MIN),
    phase: Math.random() * Math.PI * 2,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function AtlasOmegaAtom({
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
    // Galaxy
    stars: createGalaxy(),
    dust: createDust(),
    // Collapse
    holding: false,
    collapse: 0,           // 0 = full galaxy, 1 = singularity
    heartbeatPhase: 0,
    // God-ray rotation
    godRayAngle: 0,
    // Haptics
    holdNotified: false,
    thresholdNotified: false,
    sealed: false,
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
      const time = s.frameCount * 0.012;

      // ── Atmosphere ───────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ════════════════════════════════════════════════════
      // REDUCED MOTION — static singularity with volumetric halo
      // ════════════════════════════════════════════════════
      if (p.reducedMotion) {
        const sR = px(SINGULARITY_R * 2.5, minDim);

        // Volumetric light shafts (static)
        for (let i = 0; i < GOD_RAY_COUNT; i++) {
          const rayAngle = (i / GOD_RAY_COUNT) * Math.PI * 2;
          const rayLen = px(SEAL_R * 1.2, minDim);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rayAngle);
          const rayGrad = ctx.createLinearGradient(0, 0, rayLen, 0);
          rayGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * entrance));
          rayGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * entrance));
          rayGrad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(0, -sR * 0.8);
          ctx.lineTo(rayLen, -sR * 2);
          ctx.lineTo(rayLen, sR * 2);
          ctx.lineTo(0, sR * 0.8);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Nested glow bloom
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = sR * (6 + i * 7);
          const gA = ALPHA.glow.max * 0.25 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.15, rgba(s.primaryRgb, gA * 0.6));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.15));
          gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.03));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Core with specular
        ctx.beginPath();
        ctx.arc(cx, cy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.9 * entrance);
        ctx.fill();

        // Specular highlight
        ctx.beginPath();
        ctx.ellipse(cx - sR * 0.2, cy - sR * 0.25, sR * 0.35, sR * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.25 * entrance);
        ctx.fill();

        // Seal rings
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_INNER_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // COLLAPSE PHYSICS
      // ════════════════════════════════════════════════════
      if (s.holding || p.phase === 'resolve') {
        let rate = COLLAPSE_RATE;
        if (s.collapse > ACCEL_THRESHOLD) {
          rate *= 1 + (s.collapse - ACCEL_THRESHOLD) / (1 - ACCEL_THRESHOLD) * (ACCEL_MULT - 1);
        }
        s.collapse = Math.min(1, s.collapse + rate * ms);
      } else if (!s.sealed) {
        s.collapse = Math.max(0, s.collapse - EXPAND_RATE * ms);
      }

      // Heartbeat — intensifies with collapse, modulated by breath
      const heartbeatSpeed = HEARTBEAT_FREQ * (1 + breath * BREATH_HEARTBEAT);
      s.heartbeatPhase += heartbeatSpeed * ms;
      const heartbeat = Math.pow(Math.max(0, Math.sin(s.heartbeatPhase)), 6);
      const heartbeatFactor = heartbeat * HEARTBEAT_STRENGTH * s.collapse;

      // God-ray slow rotation
      s.godRayAngle += 0.001 * ms;

      // ── Haptics ─────────────────────────────────────────
      if (s.collapse >= HOLD_THRESHOLD_AT && !s.thresholdNotified) {
        s.thresholdNotified = true;
        cb.onHaptic('hold_threshold');
      }
      if (s.collapse >= SINGULARITY_THRESHOLD && !s.sealed) {
        s.sealed = true;
        s.collapse = 1;
        cb.onHaptic('seal_stamp');
      }
      if (s.collapse < HOLD_THRESHOLD_AT * 0.5) {
        s.thresholdNotified = false;
      }

      cb.onStateChange?.(s.collapse);

      const col = s.collapse;
      const easedCol = easeOutExpo(col);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Galaxy shadow / background glow
      // ════════════════════════════════════════════════════
      const galaxyR = px(ORBIT_MAX * (1 - easedCol * 0.85), minDim);
      const galaxyShadow = ctx.createRadialGradient(
        cx, cy + galaxyR * 0.02, galaxyR * 0.3,
        cx, cy, galaxyR * 1.2,
      );
      galaxyShadow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * (1 - col * 0.5) * entrance));
      galaxyShadow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * (1 - col * 0.8) * entrance));
      galaxyShadow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = galaxyShadow;
      ctx.fillRect(cx - galaxyR * 1.2, cy - galaxyR * 1.2, galaxyR * 2.4, galaxyR * 2.4);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Dust lane (faint inter-arm particles)
      // ════════════════════════════════════════════════════
      const dustBreathMod = 1 + breath * BREATH_DUST_GLOW;
      for (const d of s.dust) {
        d.angle += d.orbitSpeed * ms * (1 + col * 1.5);
        const currentR = d.baseOrbitR * (1 - easedCol * 0.97);
        const dx = cx + Math.cos(d.angle) * px(currentR, minDim);
        const dy = cy + Math.sin(d.angle) * px(currentR, minDim);
        const shimmer = 0.4 + 0.6 * Math.sin(time * 2 + d.phase);
        const dR = px(d.size, minDim);

        ctx.beginPath();
        ctx.arc(dx, dy, dR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, s.accentRgb, 0.3),
          ALPHA.atmosphere.max * 0.2 * shimmer * dustBreathMod * (1 - col * 0.6) * entrance,
        );
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Galaxy stars (spiral arms)
      // ════════════════════════════════════════════════════
      const armSpeedMod = 1 + breath * BREATH_ARM_SPEED;
      for (const star of s.stars) {
        star.angle += star.orbitSpeed * ms * (1 + col * 2.5) * armSpeedMod;
        const currentOrbitR = star.baseOrbitR * (1 - easedCol * 0.98);
        const starX = cx + Math.cos(star.angle) * px(currentOrbitR, minDim);
        const starY = cy + Math.sin(star.angle) * px(currentOrbitR, minDim);

        // Size reduces as collapse intensifies
        const sizeMulti = Math.max(0.08, 1 - easedCol * 0.7);
        const starR = px(star.size * sizeMulti, minDim);

        // Brightness increases with density
        const brightness = star.brightness * (1 + col * 0.6);
        const twinkle = 0.5 + 0.5 * Math.sin(time * 3 + star.phase);
        const starAlpha = ALPHA.content.max * Math.min(1, brightness) * (0.25 + col * 0.45) * twinkle * entrance;

        // Color shifts toward white-hot at core
        const whiteShift = col > 0.7 ? (col - 0.7) / 0.3 : 0;
        const baseStarColor = lerpColor(s.accentRgb, s.primaryRgb, col * 0.8 + star.colorT * 0.2);
        const starColor = lerpColor(baseStarColor, [255, 255, 255] as RGB, whiteShift * 0.4);

        // Star glow halo (for brighter stars)
        if (brightness > 0.4 && starR > 0.5) {
          const sgR = starR * (3 + col * 3);
          const sg = ctx.createRadialGradient(starX, starY, 0, starX, starY, sgR);
          sg.addColorStop(0, rgba(starColor, starAlpha * 0.35));
          sg.addColorStop(0.4, rgba(starColor, starAlpha * 0.1));
          sg.addColorStop(1, rgba(starColor, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(starX - sgR, starY - sgR, sgR * 2, sgR * 2);
        }

        // Star core
        ctx.beginPath();
        ctx.arc(starX, starY, starR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(starColor, starAlpha);
        ctx.fill();

        // Star specular (only for larger stars)
        if (starR > 1.5 && brightness > 0.6) {
          ctx.beginPath();
          ctx.arc(starX - starR * 0.2, starY - starR * 0.2, starR * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, starAlpha * 0.3);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Volumetric god-rays (emerge at 65%+)
      // ════════════════════════════════════════════════════
      if (col > GOD_RAY_THRESHOLD) {
        const rayIntensity = (col - GOD_RAY_THRESHOLD) / (1 - GOD_RAY_THRESHOLD);
        const rayLen = px(SEAL_R * (0.5 + rayIntensity * 1.0), minDim) * (1 + heartbeatFactor * 2);

        for (let i = 0; i < GOD_RAY_COUNT; i++) {
          const rayAngle = s.godRayAngle + (i / GOD_RAY_COUNT) * Math.PI * 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rayAngle);

          const halfW = px(SINGULARITY_R * (1 + rayIntensity * 2), minDim);
          const endHalfW = halfW * (2 + rayIntensity * 3);

          const rayGrad = ctx.createLinearGradient(0, 0, rayLen, 0);
          rayGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * rayIntensity * entrance));
          rayGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * rayIntensity * entrance));
          rayGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.max * 0.015 * rayIntensity * entrance));
          rayGrad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = rayGrad;

          ctx.beginPath();
          ctx.moveTo(0, -halfW);
          ctx.lineTo(rayLen, -endHalfW);
          ctx.lineTo(rayLen, endHalfW);
          ctx.lineTo(0, halfW);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Singularity glow bloom
      // ════════════════════════════════════════════════════
      const coreR = px(SINGULARITY_R + col * 0.008, minDim) * (1 + heartbeatFactor);
      const glowColor = lerpColor(s.accentRgb, s.primaryRgb, col);
      const whiteCore = lerpColor(glowColor, [255, 255, 255] as RGB, col * 0.3);

      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = coreR * (3 + i * 5.5 + col * 10);
        const gA = ALPHA.glow.max * (0.015 + col * 0.35) * entrance / (i + 1);
        const layerColor = lerpColor(glowColor, whiteCore, i / GLOW_LAYERS * 0.3);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(layerColor, gA));
        gg.addColorStop(0.12, rgba(layerColor, gA * 0.65));
        gg.addColorStop(0.35, rgba(layerColor, gA * 0.2));
        gg.addColorStop(0.65, rgba(layerColor, gA * 0.04));
        gg.addColorStop(1, rgba(layerColor, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Core pixel — the singularity
      // ════════════════════════════════════════════════════

      // Core shadow
      const shadowR = coreR * 3;
      const shadow = ctx.createRadialGradient(cx, cy + coreR * 0.3, 0, cx, cy, shadowR);
      shadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.08 * col * entrance));
      shadow.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

      // Core body with multi-stop gradient
      const coreAlpha = ALPHA.content.max * (0.25 + col * 0.75) * entrance;
      const coreGrad = ctx.createRadialGradient(
        cx - coreR * 0.15, cy - coreR * 0.2, coreR * 0.1,
        cx, cy, coreR,
      );
      coreGrad.addColorStop(0, rgba(lerpColor(whiteCore, [255, 255, 255] as RGB, 0.5), coreAlpha));
      coreGrad.addColorStop(0.3, rgba(whiteCore, coreAlpha * 0.9));
      coreGrad.addColorStop(0.7, rgba(glowColor, coreAlpha * 0.7));
      coreGrad.addColorStop(1, rgba(glowColor, coreAlpha * 0.3));
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Core specular highlight
      if (coreR > 1) {
        ctx.beginPath();
        ctx.ellipse(cx - coreR * 0.2, cy - coreR * 0.25, coreR * 0.3, coreR * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.3 * col * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Heartbeat pulse rings
      // ════════════════════════════════════════════════════
      if (col > 0.25 && heartbeat > 0.05) {
        // Primary pulse ring
        const pulseR = coreR * (5 + heartbeat * 10);
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * heartbeat * col * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Secondary echo pulse (delayed)
        const echoR = pulseR * 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, echoR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * heartbeat * col * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim) * 0.5;
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Post-singularity radiance + seal
      // ════════════════════════════════════════════════════
      if (s.sealed) {
        // Expanding radiance rings
        for (let i = 0; i < RADIANCE_RINGS; i++) {
          const ringPhase = (time * 0.12 + i * (1 / RADIANCE_RINGS)) % 1;
          const ringR = px(SINGULARITY_R * 5 + ringPhase * SEAL_R * 1.2, minDim);
          const ringAlpha = ALPHA.content.max * 0.07 * (1 - ringPhase) * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ringAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim) * (1 + (1 - ringPhase) * 2);
          ctx.stroke();
        }

        // Outer seal ring
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Inner seal ring
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_INNER_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Seal tick marks (12 cardinal points)
        for (let i = 0; i < 12; i++) {
          const tickAngle = (i / 12) * Math.PI * 2;
          const innerTick = px(SEAL_INNER_R, minDim);
          const outerTick = px(SEAL_R, minDim);
          const isCardinal = i % 3 === 0;
          const tickInner = isCardinal ? innerTick : innerTick + (outerTick - innerTick) * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tickAngle) * tickInner, cy + Math.sin(tickAngle) * tickInner);
          ctx.lineTo(cx + Math.cos(tickAngle) * outerTick, cy + Math.sin(tickAngle) * outerTick);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (isCardinal ? 0.15 : 0.06) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Progress ring (during collapse, pre-seal) ──────
      if (!s.sealed && col > 0.01) {
        const progR = px(SIZE.xs, minDim);
        const progAngle = col * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.06, minDim), progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.22 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ───────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      s.holding = true;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
