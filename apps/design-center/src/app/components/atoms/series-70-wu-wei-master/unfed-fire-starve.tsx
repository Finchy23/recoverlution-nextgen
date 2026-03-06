/**
 * ATOM 693: THE UNFED FIRE ENGINE
 * =================================
 * Series 70 — Wu Wei Master · Position 3
 *
 * Ignoring the troll starves the fire. Swiping to stomp generates
 * wind that feeds it into an inferno. Drop all input. Deprive it
 * of oxygen. It shrinks to grey ash.
 *
 * PHYSICS:
 *   - Small aggressive fire node at center, flickering with particle flames
 *   - Each touch/swipe = aerodynamic wind = fire grows exponentially
 *   - Fire renders as layered particle system (30+ fire particles)
 *   - No input = oxygen starvation: fire shrinks logarithmically
 *   - 6 seconds of no input → fire shrinks to grey ash pile
 *   - Fire intensity drives screen-edge glow and shake
 *   - Ash particles remain as beautiful memorial of conquered flame
 *
 * INTERACTION:
 *   Touch/swipe → feeds fire (counterproductive)
 *   Hands off 6s → oxygen starvation → grey ash (completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static ash pile with faint smoke wisps
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const FIRE_PARTICLE_COUNT = 40;
const FIRE_BASE_R = 0.08;
const FIRE_MAX_R = 0.35;
const FEED_IMPULSE = 0.25;
const STARVATION_RATE = 0.003;
const STARVATION_FRAMES = 360;      // ~6 seconds
const FIRE_FLICKER_SPEED = 0.08;
const ASH_PARTICLE_COUNT = 25;
const SMOKE_PARTICLE_COUNT = 8;
const ASH_PILE_R = 0.06;

interface FireParticle {
  angle: number;
  dist: number;
  speed: number;
  size: number;
  life: number;
  maxLife: number;
  heat: number;       // 0 = ash grey, 1 = hot
}

interface AshParticle {
  x: number; y: number;
  size: number;
  settled: boolean;
}

interface SmokeWisp {
  x: number; y: number;
  vy: number;
  size: number;
  alpha: number;
}

export default function UnfedFireStarveAtom({
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
    fireIntensity: 0.4,     // 0–1
    stillFrames: 0,
    extinguished: false,
    extinguishProgress: 0,
    fireParticles: Array.from({ length: FIRE_PARTICLE_COUNT }, (): FireParticle => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.5,
      speed: 0.005 + Math.random() * 0.01,
      size: 0.003 + Math.random() * 0.006,
      life: 30 + Math.random() * 30,
      maxLife: 60,
      heat: 0.5 + Math.random() * 0.5,
    })),
    ashParticles: [] as AshParticle[],
    smokeWisps: [] as SmokeWisp[],
    stepNotified: false,
    completed: false,
    errorCount: 0,
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
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.015;
      const ashGrey: RGB = [120, 115, 110];

      if (p.reducedMotion) {
        // Static ash pile
        for (let i = 0; i < 12; i++) {
          const ax = cx + (Math.random() - 0.5) * px(ASH_PILE_R * 2, minDim);
          const ay = cy + (Math.random() - 0.5) * px(ASH_PILE_R, minDim);
          ctx.beginPath(); ctx.arc(ax, ay, px(0.003, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(ashGrey, ALPHA.content.max * 0.2 * entrance);
          ctx.fill();
        }
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.stillFrames = STARVATION_FRAMES; }

      // ── Starvation physics ────────────────────────────────
      s.stillFrames++;
      if (!s.extinguished) {
        s.fireIntensity = Math.max(0, s.fireIntensity - STARVATION_RATE * ms);

        // Step at halfway
        if (s.fireIntensity < 0.2 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }

        // Extinguish
        if (s.fireIntensity <= 0.01) {
          s.extinguished = true;
          cb.onHaptic('completion');
          // Create ash
          for (let i = 0; i < ASH_PARTICLE_COUNT; i++) {
            s.ashParticles.push({
              x: 0.5 + (Math.random() - 0.5) * 0.08,
              y: 0.5 + (Math.random() - 0.5) * 0.04,
              size: 0.002 + Math.random() * 0.003,
              settled: true,
            });
          }
        }
      }

      if (s.extinguished) {
        s.extinguishProgress = Math.min(1, s.extinguishProgress + 0.01 * ms);
        // Smoke wisps
        if (s.frameCount % 15 === 0 && s.smokeWisps.length < SMOKE_PARTICLE_COUNT) {
          s.smokeWisps.push({
            x: 0.5 + (Math.random() - 0.5) * 0.03,
            y: 0.5,
            vy: -0.001 - Math.random() * 0.001,
            size: 0.005 + Math.random() * 0.005,
            alpha: 0.15,
          });
        }
      }

      // Animate smoke
      for (let i = s.smokeWisps.length - 1; i >= 0; i--) {
        const sw = s.smokeWisps[i];
        sw.y += sw.vy * ms;
        sw.x += (Math.random() - 0.5) * 0.0005;
        sw.alpha *= 0.995;
        if (sw.alpha < 0.01 || sw.y < 0) s.smokeWisps.splice(i, 1);
      }

      cb.onStateChange?.(s.extinguished ? 0.5 + s.extinguishProgress * 0.5 : (1 - s.fireIntensity) * 0.5);

      // ── 1. Fire ───────────────────────────────────────────
      if (!s.extinguished) {
        const fireR = FIRE_BASE_R + s.fireIntensity * (FIRE_MAX_R - FIRE_BASE_R);

        // Fire glow on screen edges
        if (s.fireIntensity > 0.3) {
          const edgeGlow = ALPHA.glow.max * 0.08 * (s.fireIntensity - 0.3) / 0.7 * entrance;
          const eg = ctx.createRadialGradient(cx, cy, px(fireR * 0.3, minDim), cx, cy, px(0.6, minDim));
          eg.addColorStop(0, rgba(s.accentRgb, edgeGlow));
          eg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = eg;
          ctx.fillRect(0, 0, w, h);
        }

        // Fire core glow
        const coreGlowR = px(fireR * 0.8, minDim);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreGlowR);
        cg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * s.fireIntensity * entrance));
        cg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * s.fireIntensity * entrance));
        cg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - coreGlowR, cy - coreGlowR, coreGlowR * 2, coreGlowR * 2);

        // Fire particles
        for (const fp of s.fireParticles) {
          fp.life -= ms;
          fp.dist += fp.speed * ms * s.fireIntensity;
          fp.angle += (Math.random() - 0.5) * FIRE_FLICKER_SPEED;

          if (fp.life <= 0) {
            fp.life = fp.maxLife;
            fp.dist = Math.random() * 0.2;
            fp.angle = Math.random() * Math.PI * 2;
            fp.heat = 0.3 + Math.random() * 0.7;
          }

          const lifeRatio = fp.life / fp.maxLife;
          const fR = px(fp.size * s.fireIntensity * lifeRatio, minDim);
          if (fR < 0.3) continue;

          const fx = cx + Math.cos(fp.angle) * px(fp.dist * fireR, minDim);
          const fy = cy + Math.sin(fp.angle) * px(fp.dist * fireR, minDim) - fR * 2 * lifeRatio;
          const fAlpha = ALPHA.content.max * lifeRatio * s.fireIntensity * 0.5 * entrance;
          const fColor = lerpColor(ashGrey, s.accentRgb, fp.heat * s.fireIntensity);

          ctx.beginPath();
          ctx.arc(fx, fy, fR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(fColor, fAlpha);
          ctx.fill();
        }

        // Fire core
        const coreR = px(0.015 * s.fireIntensity, minDim);
        const flicker = 0.8 + 0.2 * Math.sin(time * 6);
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * flicker, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.6 * s.fireIntensity * entrance);
        ctx.fill();
      }

      // ── 2. Ash pile ───────────────────────────────────────
      for (const ash of s.ashParticles) {
        const ax = ash.x * w;
        const ay = ash.y * h;
        ctx.beginPath();
        ctx.arc(ax, ay, px(ash.size, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(ashGrey, ALPHA.content.max * 0.2 * s.extinguishProgress * entrance);
        ctx.fill();
      }

      // ── 3. Smoke wisps ────────────────────────────────────
      for (const sw of s.smokeWisps) {
        const swx = sw.x * w;
        const swy = sw.y * h;
        const swR = px(sw.size, minDim);
        const sg = ctx.createRadialGradient(swx, swy, 0, swx, swy, swR);
        sg.addColorStop(0, rgba(ashGrey, ALPHA.content.max * sw.alpha * entrance));
        sg.addColorStop(1, rgba(ashGrey, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(swx - swR, swy - swR, swR * 2, swR * 2);
      }

      // ── 4. Peace indicator (post-extinction) ──────────────
      if (s.extinguished && s.extinguishProgress > 0.3) {
        const peaceR = px(0.03 * s.extinguishProgress, minDim);
        const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, peaceR * 4);
        pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * s.extinguishProgress * entrance));
        pg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pg;
        ctx.fillRect(cx - peaceR * 4, cy - peaceR * 4, peaceR * 8, peaceR * 8);
        ctx.beginPath();
        ctx.arc(cx, cy, peaceR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * s.extinguishProgress * entrance);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Touch = feed fire (counterproductive) ─────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.extinguished) return;
      s.stillFrames = 0;
      s.stepNotified = false;
      s.fireIntensity = Math.min(1, s.fireIntensity + FEED_IMPULSE);
      s.errorCount++;
      callbacksRef.current.onHaptic('error_boundary');
    };

    const onMove = () => {
      const s = stateRef.current;
      if (s.extinguished) return;
      s.stillFrames = 0;
      s.fireIntensity = Math.min(1, s.fireIntensity + FEED_IMPULSE * 0.1);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
