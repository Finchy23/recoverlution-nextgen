/**
 * ATOM 299: THE OCEAN DROP ENGINE
 * =================================
 * Series 30 — Loving Awareness · Position 9
 *
 * The drop is terrified of the ocean. Tap it — it loses its boundary,
 * but its impact sends a massive silver ripple across the entire world.
 *
 * PHYSICS:
 *   - Single luminous droplet (SIZE.md) hovering above vast ocean surface
 *   - Droplet trembles with surface tension (fear of dissolution)
 *   - Volumetric moonlight column illuminates drop from above
 *   - Teardrop shape with refraction shimmer and specular highlight
 *   - Tap to release — droplet falls with accelerating gravity
 *   - Impact: surface tension collapses, boundary dissolves
 *   - Massive concentric ripple rings expand with caustic light
 *   - Splash particles arc upward with gravity return
 *   - Ocean depth layers with subtle parallax wave motion
 *   - Breath modulates drop tremor amplitude, ocean wave height, glow warmth
 *   - Post-impact: ocean surface shimmers with integrated droplet energy
 *
 * INTERACTION:
 *   Tap → droplet falls → impact → ripples expand
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static ripple pattern with integrated glow
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

/** Droplet visual radius */
const DROP_R = SIZE.md;                  // 0.22
/** Droplet starting Y position */
const DROP_START_Y = 0.26;
/** Ocean surface Y position */
const OCEAN_SURFACE_Y = 0.60;
/** Gravity acceleration per frame */
const FALL_ACCEL = 0.00055;
/** Terminal fall velocity */
const FALL_MAX = 0.02;
/** Surface tension tremor amplitude */
const TREMOR_AMP = 0.004;
/** Tremor oscillation frequency */
const TREMOR_FREQ = 5.5;
/** Number of ripple rings spawned */
const RIPPLE_COUNT = 8;
/** Ripple expansion speed */
const RIPPLE_SPEED = 0.0035;
/** Ripple max lifetime in frames */
const RIPPLE_LIFE = 200;
/** Surface shimmer particle count (post-impact) */
const SURFACE_SHIMMER_COUNT = 40;
/** Splash particle count on impact */
const SPLASH_COUNT = 20;
/** Splash initial speed */
const SPLASH_SPEED = 0.007;
/** Splash lifetime */
const SPLASH_LIFE = 45;
/** Breath modulates drop tremor */
const BREATH_TREMOR = 0.06;
/** Breath modulates ocean wave height */
const BREATH_WAVE = 0.04;
/** Breath modulates glow warmth */
const BREATH_WARMTH = 0.05;
/** Glow rendering layers */
const GLOW_LAYERS = 5;
/** Moonlight column radius (fraction of minDim) */
const MOONLIGHT_R = 0.08;
/** Moonlight column height */
const MOONLIGHT_HEIGHT = 0.35;
/** Specular highlight on drop */
const DROP_SPECULAR_R = 0.012;
/** Caustic light pattern count on water surface */
const CAUSTIC_COUNT = 15;
/** Ocean depth layer count */
const DEPTH_LAYERS = 3;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Expanding ripple ring */
interface Ripple {
  radius: number;
  life: number;
  maxLife: number;
  speed: number;
  /** Phase offset for caustic shimmer */
  phase: number;
}

/** Splash particle arcing upward then falling */
interface SplashParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function OceanDropAtom({
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
    dropY: DROP_START_Y,
    dropVY: 0,
    released: false,
    impacted: false,
    impactTime: 0,
    dissolveProgress: 0,
    ripples: [] as Ripple[],
    splashes: [] as SplashParticle[],
    shimmerParticles: Array.from({ length: SURFACE_SHIMMER_COUNT }, () => ({
      x: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
      size: 0.0015 + Math.random() * 0.003,
    })),
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
      const warmColor = lerpColor(s.primaryRgb, s.accentRgb, 0.15 + breath * BREATH_WARMTH);

      // ── Reduced motion ──────────────────────────────────────
      if (p.reducedMotion) {
        const surfY = OCEAN_SURFACE_Y * h;
        for (let i = 0; i < 5; i++) {
          const rR = px(0.08 + i * 0.1, minDim);
          ctx.beginPath();
          ctx.ellipse(cx, surfY, rR, rR * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * (1 - i * 0.18) * entrance);
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
        const ig = ctx.createRadialGradient(cx, surfY, 0, cx, surfY, px(0.3, minDim));
        ig.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.22 * entrance));
        ig.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
        ig.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ig;
        ctx.fillRect(0, surfY - px(0.3, minDim), w, px(0.6, minDim));
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (p.phase === 'resolve' && !s.released) { s.released = true; }

      // ── Drop physics ──────────────────────────────────────
      if (s.released && !s.impacted) {
        s.dropVY = Math.min(FALL_MAX, s.dropVY + FALL_ACCEL * ms);
        s.dropY += s.dropVY * ms;

        if (s.dropY >= OCEAN_SURFACE_Y) {
          s.impacted = true;
          s.impactTime = s.frameCount;
          cb.onHaptic('tap');
          for (let i = 0; i < RIPPLE_COUNT; i++) {
            s.ripples.push({
              radius: 0,
              life: RIPPLE_LIFE * (0.7 + Math.random() * 0.3),
              maxLife: RIPPLE_LIFE,
              speed: RIPPLE_SPEED * (0.85 + Math.random() * 0.3),
              phase: Math.random() * Math.PI * 2,
            });
          }
          for (let i = 0; i < SPLASH_COUNT; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.9;
            const speed = SPLASH_SPEED * (0.25 + Math.random() * 0.75);
            s.splashes.push({
              x: 0.5, y: OCEAN_SURFACE_Y,
              vx: Math.cos(angle) * speed * 0.3,
              vy: Math.sin(angle) * speed,
              life: SPLASH_LIFE, maxLife: SPLASH_LIFE,
              size: 0.002 + Math.random() * 0.004,
            });
          }
        }
      }

      if (s.impacted) {
        s.dissolveProgress = Math.min(1, s.dissolveProgress + 0.007 * ms);
      }

      // Ripple animation
      for (let i = s.ripples.length - 1; i >= 0; i--) {
        const ripple = s.ripples[i];
        ripple.radius += ripple.speed * ms;
        ripple.life -= ms;
        if (ripple.life <= 0) s.ripples.splice(i, 1);
      }

      // Splash animation
      for (let i = s.splashes.length - 1; i >= 0; i--) {
        const sp = s.splashes[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.00018 * ms; // gravity
        sp.life -= ms;
        if (sp.life <= 0) s.splashes.splice(i, 1);
      }

      if (s.dissolveProgress >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.impacted ? 0.3 + s.dissolveProgress * 0.7 : s.released ? 0.1 : 0);

      const surfY = OCEAN_SURFACE_Y * h;
      const breathWave = breath * BREATH_WAVE;

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 1: Ocean depth layers (parallax wave strata)
      // ═════════════════════════════════════════════════════════════
      for (let layer = DEPTH_LAYERS - 1; layer >= 0; layer--) {
        const layerY = surfY + (layer + 1) * h * 0.08;
        const layerAlpha = ALPHA.atmosphere.min * 0.06 * (1 - layer * 0.25) * entrance;
        const layerGrad = ctx.createLinearGradient(0, layerY, 0, layerY + h * 0.06);
        layerGrad.addColorStop(0, rgba(s.primaryRgb, layerAlpha));
        layerGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = layerGrad;
        ctx.fillRect(0, layerY, w, h * 0.06);
      }

      // Ocean body gradient
      const oceanGrad = ctx.createLinearGradient(0, surfY, 0, h);
      oceanGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.18 * entrance));
      oceanGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.08 * entrance));
      oceanGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, surfY, w, h - surfY);

      // Surface wave line with breath modulation
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const waveY = surfY + Math.sin(x * 0.01 + time * 0.5) * px(0.003 + breathWave * 0.003, minDim)
          + Math.sin(x * 0.025 + time * 0.8) * px(0.001, minDim);
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.14 * entrance);
      ctx.lineWidth = px(0.0012, minDim);
      ctx.stroke();

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 2: Moonlight column (before impact)
      // ═════════════════════════════════════════════════════════════
      if (!s.impacted) {
        const moonR = px(MOONLIGHT_R, minDim);
        const moonTop = Math.max(0, (DROP_START_Y - MOONLIGHT_HEIGHT) * h);
        const moonBot = surfY;
        const moonGrad = ctx.createLinearGradient(cx, moonTop, cx, moonBot);
        moonGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * entrance));
        moonGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
        moonGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * entrance));
        moonGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = moonGrad;
        ctx.fillRect(cx - moonR, moonTop, moonR * 2, moonBot - moonTop);
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 3: Ripples with caustic light
      // ═════════════════════════════════════════════════════════════
      for (const ripple of s.ripples) {
        const lifeRatio = ripple.life / ripple.maxLife;
        const rR = px(ripple.radius, minDim);
        const rAlpha = ALPHA.content.max * 0.28 * lifeRatio * entrance;

        // Perspective ellipse
        ctx.beginPath();
        ctx.ellipse(cx, surfY, rR, rR * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, rAlpha);
        ctx.lineWidth = px(0.002 * lifeRatio, minDim);
        ctx.stroke();

        // Caustic light along ripple circumference
        if (rR > 0) {
          const causticAlpha = ALPHA.glow.max * 0.06 * lifeRatio * entrance;
          const rglow = ctx.createRadialGradient(cx, surfY, rR * 0.85, cx, surfY, rR * 1.15);
          rglow.addColorStop(0, rgba(warmColor, 0));
          rglow.addColorStop(0.4, rgba(warmColor, causticAlpha));
          rglow.addColorStop(0.6, rgba(warmColor, causticAlpha * 0.5));
          rglow.addColorStop(1, rgba(warmColor, 0));
          ctx.fillStyle = rglow;
          ctx.fillRect(cx - rR * 1.15, surfY - rR * 0.4, rR * 2.3, rR * 0.8);
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 4: Caustic light patterns on surface (post-impact)
      // ═════════════════════════════════════════════════════════════
      if (s.impacted && s.dissolveProgress > 0.1) {
        const causticIntensity = Math.min(1, (s.dissolveProgress - 0.1) / 0.5);
        for (let i = 0; i < CAUSTIC_COUNT; i++) {
          const ca = (i / CAUSTIC_COUNT) * Math.PI * 2 + time * 0.15;
          const cr = px(0.05 + 0.15 * Math.sin(time * 0.5 + i * 1.3), minDim);
          const ccx = cx + Math.cos(ca) * cr;
          const ccy = surfY + Math.sin(ca) * cr * 0.25;
          const causR = px(0.008 + 0.005 * Math.sin(time * 2 + i), minDim);
          const cAlpha = ALPHA.glow.max * 0.06 * causticIntensity * (0.5 + 0.5 * Math.sin(time * 3 + i * 0.7)) * entrance;

          const cg = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, causR);
          cg.addColorStop(0, rgba(warmColor, cAlpha));
          cg.addColorStop(1, rgba(warmColor, 0));
          ctx.fillStyle = cg;
          ctx.fillRect(ccx - causR, ccy - causR, causR * 2, causR * 2);
        }
      }

      // Surface shimmer particles (post-impact)
      if (s.impacted) {
        for (const sh of s.shimmerParticles) {
          const shimX = sh.x * w;
          const shimY = surfY + Math.sin(time * sh.speed + sh.phase) * px(0.008, minDim);
          const shimAlpha = ALPHA.content.max * 0.12 * s.dissolveProgress * (0.5 + 0.5 * Math.sin(time * 2 + sh.phase)) * entrance;
          const shimR = px(sh.size, minDim);

          const sg = ctx.createRadialGradient(shimX, shimY, 0, shimX, shimY, shimR * 2);
          sg.addColorStop(0, rgba(warmColor, shimAlpha));
          sg.addColorStop(1, rgba(warmColor, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(shimX - shimR * 2, shimY - shimR * 2, shimR * 4, shimR * 4);

          ctx.beginPath();
          ctx.arc(shimX, shimY, shimR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(warmColor, shimAlpha * 0.6);
          ctx.fill();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 5: Drop (before impact) with refraction + specular
      // ═════════════════════════════════════════════════════════════
      if (!s.impacted) {
        const dropY = s.dropY * h;
        const dropR = px(DROP_R * 0.28, minDim) * (1 + breath * BREATH_TREMOR);

        // Breath-coupled tremor
        const tremX = Math.sin(time * TREMOR_FREQ) * px(TREMOR_AMP + breath * 0.002, minDim);
        const tremY = Math.cos(time * TREMOR_FREQ * 1.3) * px(TREMOR_AMP * 0.5, minDim);
        const dx = cx + tremX;
        const dy = dropY + tremY;

        // Drop multi-layer glow (5-stop)
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = dropR * (2 + i * 1.1);
          const gA = ALPHA.glow.max * 0.16 * entrance / (i + 1);
          const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, gR);
          dg.addColorStop(0, rgba(s.primaryRgb, gA));
          dg.addColorStop(0.2, rgba(s.primaryRgb, gA * 0.65));
          dg.addColorStop(0.45, rgba(s.primaryRgb, gA * 0.25));
          dg.addColorStop(0.75, rgba(s.primaryRgb, gA * 0.06));
          dg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = dg;
          ctx.fillRect(dx - gR, dy - gR, gR * 2, gR * 2);
        }

        // Drop body — teardrop with 4-stop gradient
        const bodyGrad = ctx.createRadialGradient(dx, dy, 0, dx, dy, dropR);
        bodyGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.7 * entrance));
        bodyGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.45 * entrance));
        bodyGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance));
        bodyGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(dx, dy, dropR, 0, Math.PI * 2);
        ctx.fill();

        // Surface tension ring (Fresnel edge)
        ctx.beginPath();
        ctx.arc(dx, dy, dropR * 1.12, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * (0.6 + 0.4 * Math.sin(time * 0.8)) * entrance);
        ctx.lineWidth = px(0.0015, minDim);
        ctx.stroke();

        // Specular highlight
        const specX = dx - dropR * 0.25;
        const specY = dy - dropR * 0.3;
        const specR = px(DROP_SPECULAR_R, minDim);
        const specG = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
        specG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.45 * entrance));
        specG.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance));
        specG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = specG;
        ctx.fillRect(specX - specR, specY - specR, specR * 2, specR * 2);

        // Secondary reflection
        ctx.beginPath();
        ctx.arc(dx + dropR * 0.15, dy + dropR * 0.2, specR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.fill();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 6: Splash particles
      // ═════════════════════════════════════════════════════════════
      for (const sp of s.splashes) {
        const lr = sp.life / sp.maxLife;
        const spx = sp.x * w;
        const spy = sp.y * h;
        const sR = px(sp.size * lr, minDim);
        const sAlpha = ALPHA.content.max * 0.55 * lr * entrance;

        const sg = ctx.createRadialGradient(spx, spy, 0, spx, spy, sR * 2);
        sg.addColorStop(0, rgba(s.primaryRgb, sAlpha * 0.5));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(spx - sR * 2, spy - sR * 2, sR * 4, sR * 4);

        ctx.beginPath();
        ctx.arc(spx, spy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, sAlpha);
        ctx.fill();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 7: Integration glow (post-dissolve)
      // ═════════════════════════════════════════════════════════════
      if (s.dissolveProgress > 0.25) {
        const intFrac = (s.dissolveProgress - 0.25) / 0.75;
        const intR = px(0.35 * intFrac, minDim);
        const intG = ctx.createRadialGradient(cx, surfY, 0, cx, surfY, intR);
        intG.addColorStop(0, rgba(warmColor, ALPHA.glow.max * 0.18 * intFrac * entrance));
        intG.addColorStop(0.3, rgba(warmColor, ALPHA.glow.max * 0.08 * intFrac * entrance));
        intG.addColorStop(0.6, rgba(warmColor, ALPHA.glow.max * 0.02 * intFrac * entrance));
        intG.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = intG;
        ctx.fillRect(cx - intR, surfY - intR, intR * 2, intR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = () => {
      if (!stateRef.current.released) {
        stateRef.current.released = true;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
