/**
 * ATOM 277: THE EXHALE CYCLE ENGINE
 * ====================================
 * Series 28 — Impermanence Engine · Position 7
 *
 * Everything must be emptied to be refilled. Release the
 * brilliant sphere — it diffuses into warm ambient glow.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Compressed sphere wrapped in tight cloth membrane (pressure vessel)
 *   - Holding = membrane stretches taut, fibers vibrate under stress
 *   - Release = membrane tears open, sphere diffuses through cloth holes
 *   - Entropy arc: compressed order → strained membrane → released entropy
 *   - Diffused particles form ambient cloth veil across viewport
 *   - Breath coupling DRIVES the interaction (inhale = compress, exhale = release)
 *
 * PHYSICS:
 *   - Central sphere with cloth wrapping (8 meridian fibers + 5 parallels)
 *   - Hold = volumetric compression → membrane stress visible
 *   - Sphere vibrates/shakes under sustained containment
 *   - Release → sphere shatters membrane, diffuses into 80+ particles
 *   - Particles form warm ambient veil (cloth-like distributed glow)
 *   - 8 render layers: atmosphere, containment shadow, membrane back,
 *     sphere body, membrane front, stress dots, diffusion particles, completion
 *
 * INTERACTION:
 *   Hold → compress (hold_start), Release → diffuse (hold_release → completion)
 *   Breath: inhale compresses, exhale releases
 *
 * RENDER: Canvas 2D with pressure-membrane cloth + diffusion burst
 * REDUCED MOTION: Static warm ambient glow (post-diffusion)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Sphere base radius (fraction of minDim) */
const SPHERE_R = 0.22;
/** Compressed sphere radius reduction */
const COMPRESS_RATIO = 0.35;
/** Membrane meridian fiber count */
const MERIDIANS = 10;
/** Membrane parallel ring count */
const PARALLELS = 6;
/** Compression rate per frame while holding */
const COMPRESS_RATE = 0.008;
/** Maximum compression before forced release */
const MAX_COMPRESS = 0.9;
/** Shake amplitude at high compression */
const SHAKE_AMP = 0.005;
/** Shake frequency multiplier */
const SHAKE_FREQ = 15;
/** Diffusion particle count */
const DIFFUSION_COUNT = 80;
/** Diffusion particle expansion speed */
const DIFFUSION_SPEED = 0.003;
/** Diffusion particle lifetime */
const DIFFUSION_LIFE_DECAY = 0.004;
/** Membrane fiber stress glow threshold */
const STRESS_VIS_THRESHOLD = 0.4;
/** Breath coupling intensity */
const BREATH_INTENSITY = 0.3;
/** Glow layers for diffused state */
const AMBIENT_GLOW_LAYERS = 4;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface DiffusionParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; life: number;
  hueShift: number;
}

export default function ExhaleCycleAtom({
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
    compression: 0,
    holding: false,
    holdNotified: false,
    released: false,
    releaseNotified: false,
    completed: false,
    diffusion: [] as DiffusionParticle[],
    diffusionProgress: 0,
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
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0) * BREATH_INTENSITY;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        s.released = true; s.completed = true; s.diffusionProgress = 1;
      }
      if (p.phase === 'resolve') { s.released = true; s.diffusionProgress = 1; s.completed = true; }

      // ── Compression / release physics ───────────────────────────
      if (s.holding && !s.released) {
        // Breath coupling: inhale compresses more
        const breathMod = 1 + breath * 0.5;
        s.compression = Math.min(MAX_COMPRESS, s.compression + COMPRESS_RATE * breathMod * ms);
      } else if (!s.released) {
        s.compression = Math.max(0, s.compression - 0.004 * ms);
      }

      // Check for release trigger (either explicit pointer-up after sufficient compression, or breath exhale)
      if (s.released && s.diffusionProgress < 1) {
        s.diffusionProgress = Math.min(1, s.diffusionProgress + 0.006 * ms);
        // Update diffusion particles
        for (const dp of s.diffusion) {
          dp.x += dp.vx * ms;
          dp.y += dp.vy * ms;
          dp.size += 0.0002 * ms;
          dp.life -= DIFFUSION_LIFE_DECAY * ms;
        }
        s.diffusion = s.diffusion.filter(d => d.life > 0);

        if (s.diffusionProgress >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      cb.onStateChange?.(s.completed ? 1 : s.released ? s.diffusionProgress : s.compression * 0.5);

      const sphereR = px(SPHERE_R * (1 - s.compression * COMPRESS_RATIO), minDim);
      const stress = s.compression;

      // Shake offset at high compression
      const shake = stress > 0.5 ?
        px(SHAKE_AMP * (stress - 0.5) * 2, minDim) * Math.sin(time * SHAKE_FREQ) : 0;
      const shakeY = stress > 0.5 ?
        px(SHAKE_AMP * (stress - 0.5) * 1.5, minDim) * Math.cos(time * SHAKE_FREQ * 1.3) : 0;
      const sCx = cx + shake;
      const sCy = cy + shakeY;

      if (!s.released) {
        // ── 1. Containment shadow ─────────────────────────────────
        const shadowR = sphereR * 1.4;
        const shadowG = ctx.createRadialGradient(sCx, sCy + sphereR * 0.2, 0, sCx, sCy + sphereR * 0.2, shadowR);
        shadowG.addColorStop(0, rgba(s.primaryRgb, 0.05 * entrance));
        shadowG.addColorStop(0.5, rgba(s.primaryRgb, 0.02 * entrance));
        shadowG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = shadowG;
        ctx.fillRect(sCx - shadowR, sCy - shadowR, shadowR * 2, shadowR * 2);

        // ── 2. Membrane back fibers (behind sphere) ───────────────
        ctx.save();
        ctx.translate(sCx, sCy);
        // Back-half parallels
        for (let p_ = 0; p_ < PARALLELS; p_++) {
          const pFrac = (p_ + 1) / (PARALLELS + 1);
          const pY = (pFrac - 0.5) * 2 * sphereR;
          const pRadAtY = sphereR * Math.sin(Math.acos(Math.abs(pFrac - 0.5) * 2));
          if (pRadAtY < 1) continue;
          ctx.beginPath();
          ctx.ellipse(0, pY, pRadAtY, pRadAtY * 0.15, 0, Math.PI, Math.PI * 2);
          const fiberAlpha = ALPHA.content.max * (0.04 + stress * 0.06) * entrance;
          ctx.strokeStyle = rgba(s.primaryRgb, fiberAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
        ctx.restore();

        // ── 3. Sphere body ────────────────────────────────────────
        const bodyGrad = ctx.createRadialGradient(
          sCx - sphereR * 0.15, sCy - sphereR * 0.15, 0, sCx, sCy, sphereR);
        const warm = stress * 0.3;
        const bodyCol: RGB = [
          Math.min(255, s.primaryRgb[0] + warm * 50),
          Math.min(255, s.primaryRgb[1] + warm * 20),
          s.primaryRgb[2],
        ];
        bodyGrad.addColorStop(0, rgba(bodyCol, ALPHA.content.max * (0.32 + stress * 0.1) * entrance));
        bodyGrad.addColorStop(0.25, rgba(bodyCol, ALPHA.content.max * 0.24 * entrance));
        bodyGrad.addColorStop(0.55, rgba(s.primaryRgb, ALPHA.content.max * 0.16 * entrance));
        bodyGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
        bodyGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.02 * entrance));
        ctx.beginPath();
        ctx.arc(sCx, sCy, sphereR, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Edge
        ctx.beginPath();
        ctx.arc(sCx, sCy, sphereR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // ── 4. Membrane front fibers ──────────────────────────────
        ctx.save();
        ctx.translate(sCx, sCy);
        // Front-half parallels
        for (let p_ = 0; p_ < PARALLELS; p_++) {
          const pFrac = (p_ + 1) / (PARALLELS + 1);
          const pY = (pFrac - 0.5) * 2 * sphereR;
          const pRadAtY = sphereR * Math.sin(Math.acos(Math.abs(pFrac - 0.5) * 2));
          if (pRadAtY < 1) continue;
          ctx.beginPath();
          ctx.ellipse(0, pY, pRadAtY, pRadAtY * 0.15, 0, 0, Math.PI);
          const fiberAlpha = ALPHA.content.max * (0.06 + stress * 0.08) * entrance;
          const stressColor = lerpColor(s.primaryRgb, s.accentRgb, stress * 0.4);
          ctx.strokeStyle = rgba(stressColor, fiberAlpha);
          ctx.lineWidth = px(STROKE.hairline + stress * STROKE.thin, minDim);
          ctx.stroke();
        }

        // Meridians
        for (let m = 0; m < MERIDIANS; m++) {
          const mAngle = (m / MERIDIANS) * Math.PI;
          const wave = Math.sin(time * 3 + m * 1.5) * stress * 0.02 * sphereR;
          ctx.beginPath();
          ctx.ellipse(0, 0, sphereR, sphereR * Math.abs(Math.cos(mAngle)) * 0.3 + 1,
            mAngle + wave / sphereR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.04 + stress * 0.06) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
        ctx.restore();

        // ── 5. Stress glow dots at fiber intersections ────────────
        if (stress > STRESS_VIS_THRESHOLD) {
          const stressFrac = (stress - STRESS_VIS_THRESHOLD) / (1 - STRESS_VIS_THRESHOLD);
          for (let p_ = 0; p_ < PARALLELS; p_++) {
            for (let m = 0; m < MERIDIANS; m++) {
              const pFrac = (p_ + 1) / (PARALLELS + 1);
              const mAngle = (m / MERIDIANS) * Math.PI * 2;
              const pY = (pFrac - 0.5) * 2;
              const pRad = Math.sin(Math.acos(Math.abs(pY)));
              const dotX = sCx + Math.cos(mAngle) * pRad * sphereR;
              const dotY = sCy + pY * sphereR;
              const dotR = px(0.003 + stressFrac * 0.004, minDim);
              const dg = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, dotR);
              dg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * stressFrac * entrance));
              dg.addColorStop(1, rgba(s.accentRgb, 0));
              ctx.fillStyle = dg;
              ctx.fillRect(dotX - dotR, dotY - dotR, dotR * 2, dotR * 2);
            }
          }
        }

        // ── Specular ──────────────────────────────────────────────
        const specR = sphereR * 0.2;
        const specG = ctx.createRadialGradient(
          sCx - sphereR * 0.25, sCy - sphereR * 0.25, 0,
          sCx - sphereR * 0.25, sCy - sphereR * 0.25, specR);
        specG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.16 * entrance));
        specG.addColorStop(0.4, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.05 * entrance));
        specG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
        ctx.fillStyle = specG;
        ctx.beginPath();
        ctx.arc(sCx - sphereR * 0.25, sCy - sphereR * 0.25, specR, 0, Math.PI * 2);
        ctx.fill();

        // Compression ring
        if (stress > 0.05) {
          const cArc = stress * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(sCx, sCy, sphereR * 1.2, -Math.PI / 2, -Math.PI / 2 + cArc);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim);
          ctx.stroke();
        }
      }

      // ── 6. Diffusion particles ──────────────────────────────────
      for (const dp of s.diffusion) {
        const dpx = dp.x * w;
        const dpy = dp.y * h;
        const dpr = px(dp.size, minDim);
        const dpAlpha = ALPHA.content.max * 0.12 * dp.life * entrance;
        const dpCol: RGB = [
          Math.min(255, s.primaryRgb[0] + dp.hueShift * 30),
          Math.min(255, s.primaryRgb[1] + dp.hueShift * 15),
          s.primaryRgb[2],
        ];
        const dpg = ctx.createRadialGradient(dpx, dpy, 0, dpx, dpy, dpr);
        dpg.addColorStop(0, rgba(dpCol, dpAlpha));
        dpg.addColorStop(0.4, rgba(dpCol, dpAlpha * 0.4));
        dpg.addColorStop(0.7, rgba(dpCol, dpAlpha * 0.1));
        dpg.addColorStop(1, rgba(dpCol, 0));
        ctx.fillStyle = dpg;
        ctx.fillRect(dpx - dpr, dpy - dpr, dpr * 2, dpr * 2);
      }

      // ── 7. Ambient warm glow (post-diffusion) ──────────────────
      if (s.diffusionProgress > 0.3) {
        for (let i = AMBIENT_GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = px(0.15 + i * 0.12, minDim) * s.diffusionProgress;
          const gA = ALPHA.glow.max * 0.04 * s.diffusionProgress * entrance / (i + 1);
          const gcx = cx + Math.sin(time * 0.3 + i) * px(0.05, minDim) * s.diffusionProgress;
          const gcy = cy + Math.cos(time * 0.4 + i * 0.7) * px(0.03, minDim) * s.diffusionProgress;
          const gg = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.5, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(gcx - gR, gcy - gR, gR * 2, gR * 2);
        }
      }

      // ── 8. Completion radiance ──────────────────────────────────
      if (s.completed) {
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.03 + i * 0.33) % 1;
          const rR = px(0.06 + rPhase * 0.25, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.released) return;
      s.holding = true;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onUp = () => {
      const s = stateRef.current;
      s.holding = false;
      if (s.compression > 0.3 && !s.released) {
        s.released = true;
        if (!s.releaseNotified) {
          s.releaseNotified = true;
          callbacksRef.current.onHaptic('hold_release');
        }
        // Spawn diffusion particles
        for (let i = 0; i < DIFFUSION_COUNT; i++) {
          const angle = (i / DIFFUSION_COUNT) * Math.PI * 2 + Math.random() * 0.3;
          const speed = DIFFUSION_SPEED * (0.3 + Math.random() * 0.7);
          s.diffusion.push({
            x: 0.5 + Math.cos(angle) * 0.02,
            y: 0.5 + Math.sin(angle) * 0.02,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 0.005 + Math.random() * 0.008,
            life: 1,
            hueShift: Math.random(),
          });
        }
      }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
