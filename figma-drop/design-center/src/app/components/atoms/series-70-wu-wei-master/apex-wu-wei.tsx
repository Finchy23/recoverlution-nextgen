/**
 * ATOM 700: THE APEX WU WEI ENGINE
 * ===================================
 * Series 70 — Wu Wei Master · Position 10 (CAPSTONE — Collection 7 + Platform Finale)
 *
 * The ultimate surrender. Absolute catastrophic pandemonium.
 * Hundreds of threats. Single prompt: LET GO. Hands off the glass.
 * Kinetic input hits zero. Every single threat mathematically misses
 * by fractions of a millimetre. The chaos annihilates itself.
 * You are the untouchable center.
 *
 * PHYSICS:
 *   - 90 threat particles: spinning, tracking, converging in 3 waves
 *   - Threat storm rendered with turbulent noise field (smoke advection)
 *   - ANY touch resets stillness counter — threats accelerate + glow red
 *   - Patience progress ring fills over 5 seconds of stillness
 *   - At 5 seconds: "surrender mode" activates with dramatic haptic
 *   - In surrender: each threat recalculates to MISS by 1-2 pixels
 *   - Near-miss particles leave dual-layer spark trails as they pass
 *   - Each near-miss sends a visible shockwave ring from the core
 *   - After all threats miss: absolute silence, void settles
 *   - Core blooms with 7-layer glow and breath-coupled eternal pulse
 *   - Seal stamp with double ring + cardinal tick marks
 *   - Breath modulates: core pulse, threat orbit wobble, surrender glow warmth
 *
 * INTERACTION:
 *   Touch → resets surrender, threats accelerate (counterproductive)
 *   Hands off 5s → surrender → near-miss symphony → seal
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static serene core with seal ring and soft radiance
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

/** Total threat particles across all waves */
const THREAT_COUNT = 90;
/** Threat radius range (fraction of minDim) */
const THREAT_R_MIN = 0.004;
const THREAT_R_MAX = 0.013;
/** Threat base speed range */
const THREAT_SPEED_MIN = 0.002;
const THREAT_SPEED_MAX = 0.006;
/** Near-miss safe distance (fraction of minDim) */
const NEAR_MISS_DIST = 0.022;
/** Frames of stillness for surrender (~5 seconds at 60fps) */
const SURRENDER_FRAMES = 300;
/** Core node radius */
const CORE_R = 0.018;
/** Core glow field at full sovereignty */
const SOVEREIGN_GLOW_R = 0.35;
/** Seal ring radii */
const SEAL_R_OUTER = 0.19;
const SEAL_R_INNER = 0.15;
/** Sparks per near-miss event */
const SPARK_COUNT = 6;
/** Spark lifetime (frames) */
const SPARK_LIFE = 30;
/** Shockwave ring per near-miss */
const MAX_SHOCKWAVES = 8;
/** Threat orbit radius for pre-surrender chaos */
const CHAOS_ORBIT_R = 0.44;
/** Touch penalty — threats speed multiplier */
const TOUCH_SPEED_BOOST = 1.6;
/** Nested glow layers for core bloom */
const GLOW_LAYERS = 7;
/** Wave timing: frames between wave activations */
const WAVE_DELAY = 80;
/** Breath modulation of core pulse amplitude */
const BREATH_CORE_PULSE = 0.12;
/** Breath modulation of orbit wobble */
const BREATH_ORBIT_WOBBLE = 0.08;
/** Breath modulation of sovereignty glow warmth */
const BREATH_GLOW_WARMTH = 0.15;
/** Turbulence noise particles in storm field */
const STORM_PARTICLE_COUNT = 40;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Threat {
  /** Normalized position 0-1 */
  x: number; y: number;
  /** Velocity (normalized) */
  vx: number; vy: number;
  /** Orbital angle */
  angle: number;
  /** Orbital radius (fraction of minDim) */
  orbitR: number;
  /** Orbital angular speed */
  orbitSpeed: number;
  /** Visual size (fraction of minDim) */
  size: number;
  /** Is this threat still active */
  alive: boolean;
  /** Has this threat performed its near-miss */
  nearMissed: boolean;
  /** Wave index (0, 1, or 2) */
  wave: number;
  /** Individual phase for wobble */
  phase: number;
}

interface NearMissSpark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  /** Brightness variation */
  brightness: number;
}

interface Shockwave {
  /** Current radius (fraction of minDim) */
  r: number;
  /** Expansion speed */
  speed: number;
  /** Remaining opacity 0-1 */
  opacity: number;
}

interface StormParticle {
  angle: number;
  r: number;
  speed: number;
  size: number;
}

// =====================================================================
// HELPERS
// =====================================================================

/** Create threat array with wave distribution */
function createThreats(): Threat[] {
  return Array.from({ length: THREAT_COUNT }, (_, i): Threat => {
    const wave = Math.floor(i / (THREAT_COUNT / 3));
    const angle = Math.random() * Math.PI * 2;
    const orbitR = CHAOS_ORBIT_R * (0.35 + Math.random() * 0.65);
    return {
      x: 0.5 + Math.cos(angle) * orbitR,
      y: 0.5 + Math.sin(angle) * orbitR,
      vx: 0, vy: 0,
      angle,
      orbitR,
      orbitSpeed: 0.002 + Math.random() * 0.006,
      size: THREAT_R_MIN + Math.random() * (THREAT_R_MAX - THREAT_R_MIN),
      alive: true,
      nearMissed: false,
      wave,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

/** Create storm field particles */
function createStorm(): StormParticle[] {
  return Array.from({ length: STORM_PARTICLE_COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    r: 0.15 + Math.random() * 0.35,
    speed: 0.001 + Math.random() * 0.003,
    size: 0.002 + Math.random() * 0.004,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ApexWuWeiAtom({
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
    // Threats
    threats: createThreats(),
    storm: createStorm(),
    // State
    stillFrames: 0,
    surrendered: false,
    surrenderProgress: 0,
    nearMissCount: 0,
    sparks: [] as NearMissSpark[],
    shockwaves: [] as Shockwave[],
    speedMultiplier: 1,
    sealed: false,
    stepNotified: false,
    wavePhase: 0,
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
      // REDUCED MOTION — static sovereign core
      // ════════════════════════════════════════════════════
      if (p.reducedMotion) {
        const cR = px(CORE_R * 2.5, minDim);

        // Sovereign glow bloom
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = cR * (3 + i * 5);
          const gA = ALPHA.glow.max * 0.28 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.15, rgba(s.primaryRgb, gA * 0.55));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.12));
          gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.02));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Core with specular
        const coreGrad = ctx.createRadialGradient(
          cx - cR * 0.15, cy - cR * 0.2, cR * 0.1, cx, cy, cR,
        );
        coreGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5), ALPHA.content.max * 0.9 * entrance));
        coreGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.content.max * 0.8 * entrance));
        coreGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance));
        ctx.beginPath();
        ctx.arc(cx, cy, cR, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.ellipse(cx - cR * 0.2, cy - cR * 0.25, cR * 0.3, cR * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.3 * entrance);
        ctx.fill();

        // Seal rings
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R_OUTER, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R_INNER, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // AUTO-RESOLVE
      // ════════════════════════════════════════════════════
      if (p.phase === 'resolve') {
        s.stillFrames = SURRENDER_FRAMES + 60;
      }

      // ════════════════════════════════════════════════════
      // STILLNESS → SURRENDER PHYSICS
      // ════════════════════════════════════════════════════
      s.stillFrames++;

      if (s.stillFrames >= SURRENDER_FRAMES && !s.surrendered && !s.sealed) {
        s.surrendered = true;
        cb.onHaptic('step_advance');
        s.stepNotified = true;
      }

      // ── Threat physics ─────────────────────────────────
      let aliveCount = 0;
      const activeWave = Math.min(2, Math.floor(s.frameCount / (SURRENDER_FRAMES * 0.5)));

      for (const t of s.threats) {
        if (!t.alive) continue;
        if (t.wave > activeWave && !s.surrendered) continue;

        aliveCount++;

        if (s.surrendered) {
          // ── Near-miss trajectory ──────────────────
          const dx = 0.5 - t.x;
          const dy = 0.5 - t.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > NEAR_MISS_DIST * 2.5 && !t.nearMissed) {
            // Approach center
            t.vx += (dx / dist) * 0.001 * ms;
            t.vy += (dy / dist) * 0.001 * ms;
          } else if (!t.nearMissed) {
            // NEAR MISS — deflect tangentially
            t.nearMissed = true;
            s.nearMissCount++;
            const tangX = -dy / dist;
            const tangY = dx / dist;
            const deflectSpeed = 0.009;
            const dir = Math.random() > 0.5 ? 1 : -1;
            t.vx = tangX * deflectSpeed * dir + (Math.random() - 0.5) * 0.002;
            t.vy = tangY * deflectSpeed * dir + (Math.random() - 0.5) * 0.002;

            // Sparks at near-miss point
            for (let j = 0; j < SPARK_COUNT; j++) {
              const sa = Math.random() * Math.PI * 2;
              const ss = 0.003 + Math.random() * 0.005;
              s.sparks.push({
                x: t.x, y: t.y,
                vx: Math.cos(sa) * ss,
                vy: Math.sin(sa) * ss,
                life: SPARK_LIFE,
                brightness: 0.5 + Math.random() * 0.5,
              });
            }

            // Shockwave from core
            if (s.shockwaves.length < MAX_SHOCKWAVES) {
              s.shockwaves.push({ r: 0.01, speed: 0.008, opacity: 0.4 });
            }
          }

          t.x += t.vx * ms;
          t.y += t.vy * ms;

          // Die when far off-screen
          if (t.x < -0.25 || t.x > 1.25 || t.y < -0.25 || t.y > 1.25) {
            t.alive = false;
          }
        } else {
          // ── Chaotic orbit ─────────────────────────
          const wobble = Math.sin(time * 2 + t.phase) * breath * BREATH_ORBIT_WOBBLE;
          t.angle += (t.orbitSpeed + wobble) * ms * s.speedMultiplier;
          t.orbitR = Math.max(0.06, t.orbitR - 0.00006 * ms);
          t.x = 0.5 + Math.cos(t.angle) * t.orbitR;
          t.y = 0.5 + Math.sin(t.angle) * t.orbitR;
        }

        t.vx *= 0.99;
        t.vy *= 0.99;
      }

      // ── Surrender progress ─────────────────────────────
      if (s.surrendered) {
        const activeThreats = s.threats.filter(t => t.alive && (t.wave <= activeWave || s.surrendered));
        s.surrenderProgress = 1 - (activeThreats.length / THREAT_COUNT);
      }

      // ── Seal ───────────────────────────────────────────
      if (s.surrendered && aliveCount === 0 && !s.sealed) {
        s.sealed = true;
        cb.onHaptic('seal_stamp');
      }

      // Speed decay
      s.speedMultiplier = Math.max(1, s.speedMultiplier * 0.997);

      cb.onStateChange?.(
        s.sealed ? 1 :
        s.surrendered ? 0.3 + s.surrenderProgress * 0.7 :
        Math.min(0.3, s.stillFrames / SURRENDER_FRAMES * 0.3),
      );

      // ── Spark + shockwave physics ──────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.life -= ms;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.r += sw.speed * ms;
        sw.opacity *= 0.96;
        if (sw.opacity < 0.01) s.shockwaves.splice(i, 1);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Storm field (pre-surrender chaos atmosphere)
      // ════════════════════════════════════════════════════
      if (!s.sealed) {
        const chaosIntensity = s.surrendered
          ? Math.max(0, 1 - s.surrenderProgress * 2)
          : Math.min(1, s.frameCount / (SURRENDER_FRAMES * 0.6));

        // Storm particles (smoke advection feel)
        for (const sp of s.storm) {
          sp.angle += sp.speed * ms * s.speedMultiplier;
          const spx = cx + Math.cos(sp.angle) * px(sp.r, minDim);
          const spy = cy + Math.sin(sp.angle) * px(sp.r, minDim);
          const stormR = px(sp.size, minDim);

          const sg = ctx.createRadialGradient(spx, spy, 0, spx, spy, stormR);
          sg.addColorStop(0, rgba(s.accentRgb, ALPHA.atmosphere.max * 0.06 * chaosIntensity * entrance));
          sg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.atmosphere.max * 0.02 * chaosIntensity * entrance));
          sg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(spx - stormR, spy - stormR, stormR * 2, stormR * 2);
        }

        // Chaos glow field
        const chaosR = px(CHAOS_ORBIT_R * 0.65, minDim);
        const cg = ctx.createRadialGradient(cx, cy, px(0.04, minDim), cx, cy, chaosR);
        cg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.05 * chaosIntensity * entrance));
        cg.addColorStop(0.4, rgba(s.accentRgb, ALPHA.glow.max * 0.02 * chaosIntensity * entrance));
        cg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - chaosR, cy - chaosR, chaosR * 2, chaosR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Threats
      // ════════════════════════════════════════════════════
      for (const t of s.threats) {
        if (!t.alive) continue;
        if (t.wave > activeWave && !s.surrendered) continue;

        const tx = t.x * w;
        const ty = t.y * h;
        const tR = px(t.size, minDim);

        // Threat glow halo
        if (tR > 0.5) {
          const tgR = tR * 2.5;
          const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, tgR);
          tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * entrance));
          tg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.max * 0.03 * entrance));
          tg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(tx - tgR, ty - tgR, tgR * 2, tgR * 2);
        }

        // Threat body with gradient
        const threatFade = t.nearMissed ? 0.15 : 0.45;
        const threatGrad = ctx.createRadialGradient(
          tx - tR * 0.15, ty - tR * 0.15, tR * 0.1,
          tx, ty, tR,
        );
        threatGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * threatFade * 1.2 * entrance));
        threatGrad.addColorStop(0.6, rgba(s.accentRgb, ALPHA.content.max * threatFade * entrance));
        threatGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * threatFade * 0.3 * entrance));
        ctx.beginPath();
        ctx.arc(tx, ty, tR, 0, Math.PI * 2);
        ctx.fillStyle = threatGrad;
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Near-miss sparks
      // ════════════════════════════════════════════════════
      for (const sp of s.sparks) {
        const lr = sp.life / SPARK_LIFE;
        const spx = sp.x * w;
        const spy = sp.y * h;
        const sR = px(0.003 * lr, minDim);

        // Spark glow
        const sgR = sR * 3;
        const sparkColor = lerpColor(s.accentRgb, s.primaryRgb, 0.6);
        const sparkGlow = ctx.createRadialGradient(spx, spy, 0, spx, spy, sgR);
        sparkGlow.addColorStop(0, rgba(sparkColor, ALPHA.glow.max * 0.2 * lr * sp.brightness * entrance));
        sparkGlow.addColorStop(1, rgba(sparkColor, 0));
        ctx.fillStyle = sparkGlow;
        ctx.fillRect(spx - sgR, spy - sgR, sgR * 2, sgR * 2);

        // Spark core
        ctx.beginPath();
        ctx.arc(spx, spy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(sparkColor, [255, 255, 255] as RGB, 0.3),
          ALPHA.content.max * 0.5 * lr * sp.brightness * entrance,
        );
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Shockwave rings (from near-misses)
      // ════════════════════════════════════════════════════
      for (const sw of s.shockwaves) {
        const swR = px(sw.r, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, swR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * sw.opacity * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim) * (1 + sw.opacity * 2);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Core — untouchable center
      // ════════════════════════════════════════════════════
      const coreGlowIntensity = s.sealed ? 1 :
        s.surrendered ? 0.35 + s.surrenderProgress * 0.45 : 0.12;
      const coreR = px(CORE_R, minDim);
      const breathPulse = 1 + breath * BREATH_CORE_PULSE;
      const warmthShift = breath * BREATH_GLOW_WARMTH;

      // Nested glow bloom
      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = coreR * (2.5 + i * 4.5 + (s.sealed ? 10 : 0)) * breathPulse;
        const gA = ALPHA.glow.max * coreGlowIntensity * 0.14 * entrance / (i + 1);
        const glowColor = lerpColor(
          lerpColor(s.accentRgb, s.primaryRgb, coreGlowIntensity),
          [255, 240, 220] as RGB,
          warmthShift * coreGlowIntensity,
        );
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(glowColor, gA));
        gg.addColorStop(0.12, rgba(glowColor, gA * 0.6));
        gg.addColorStop(0.35, rgba(glowColor, gA * 0.18));
        gg.addColorStop(0.6, rgba(glowColor, gA * 0.04));
        gg.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // Core shadow
      const coreShadowR = coreR * 3;
      const coreShadow = ctx.createRadialGradient(cx, cy + coreR * 0.3, 0, cx, cy, coreShadowR);
      coreShadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.06 * coreGlowIntensity * entrance));
      coreShadow.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
      ctx.fillStyle = coreShadow;
      ctx.fillRect(cx - coreShadowR, cy - coreShadowR, coreShadowR * 2, coreShadowR * 2);

      // Core body with multi-stop gradient
      const coreBodyR = coreR * breathPulse;
      const coreColor = lerpColor(s.primaryRgb, [255, 255, 255] as RGB, coreGlowIntensity * 0.3);
      const coreGrad = ctx.createRadialGradient(
        cx - coreBodyR * 0.15, cy - coreBodyR * 0.2, coreBodyR * 0.1,
        cx, cy, coreBodyR,
      );
      coreGrad.addColorStop(0, rgba(lerpColor(coreColor, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * (0.35 + coreGlowIntensity * 0.6) * entrance));
      coreGrad.addColorStop(0.35, rgba(coreColor, ALPHA.content.max * (0.3 + coreGlowIntensity * 0.5) * entrance));
      coreGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * (0.2 + coreGlowIntensity * 0.3) * entrance));
      coreGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
      ctx.beginPath();
      ctx.arc(cx, cy, coreBodyR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Core specular highlight
      if (coreBodyR > 1) {
        ctx.beginPath();
        ctx.ellipse(
          cx - coreBodyR * 0.2, cy - coreBodyR * 0.25,
          coreBodyR * 0.28, coreBodyR * 0.15,
          -0.3, 0, Math.PI * 2,
        );
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.25 * coreGlowIntensity * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Seal (post-completion)
      // ════════════════════════════════════════════════════
      if (s.sealed) {
        // Sovereignty radiance rings
        for (let i = 0; i < 5; i++) {
          const ringPhase = (time * 0.1 + i * 0.2) % 1;
          const rR = px(CORE_R * 4 + ringPhase * SEAL_R_OUTER, minDim);
          const rA = ALPHA.content.max * 0.06 * (1 - ringPhase) * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, rA);
          ctx.lineWidth = px(STROKE.hairline, minDim) * (1 + (1 - ringPhase) * 2);
          ctx.stroke();
        }

        // Outer seal ring
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R_OUTER, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Inner seal ring
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R_INNER, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.09 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Cardinal tick marks (8 points)
        for (let i = 0; i < 8; i++) {
          const tickAngle = (i / 8) * Math.PI * 2;
          const isCardinal = i % 2 === 0;
          const innerTick = px(SEAL_R_INNER, minDim);
          const outerTick = px(SEAL_R_OUTER, minDim);
          const tickStart = isCardinal ? innerTick : innerTick + (outerTick - innerTick) * 0.35;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tickAngle) * tickStart, cy + Math.sin(tickAngle) * tickStart);
          ctx.lineTo(cx + Math.cos(tickAngle) * outerTick, cy + Math.sin(tickAngle) * outerTick);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (isCardinal ? 0.15 : 0.06) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Patience progress (pre-surrender)
      // ════════════════════════════════════════════════════
      if (!s.surrendered && !s.sealed && s.stillFrames > 20) {
        const progR = px(SIZE.xs * 0.85, minDim);
        const prog = Math.min(1, s.stillFrames / SURRENDER_FRAMES);

        // Background ring
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.06, minDim), progR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Fill arc
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.06, minDim), progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.22 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Touch = reset surrender (counterproductive) ──────
    const onDown = () => {
      const s = stateRef.current;
      if (s.sealed) return;
      s.stillFrames = 0;
      s.surrendered = false;
      s.stepNotified = false;
      s.speedMultiplier = Math.min(3, s.speedMultiplier * TOUCH_SPEED_BOOST);
    };

    const onMove = () => {
      const s = stateRef.current;
      if (!s.sealed) {
        s.stillFrames = 0;
        s.surrendered = false;
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }}
      />
    </div>
  );
}
