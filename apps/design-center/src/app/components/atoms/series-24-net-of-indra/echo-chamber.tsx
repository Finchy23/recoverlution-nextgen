/**
 * ATOM 235: THE ECHO CHAMBER ENGINE
 * ====================================
 * Series 24 — Net of Indra · Position 5
 *
 * What you emit returns. Tap aggressively — a harsh wave reflects
 * back amplified. Tap softly — a gentle wave returns as warmth.
 * The universe mirrors your energy.
 *
 * PHYSICS:
 *   - Circular chamber boundary (SIZE.lg radius)
 *   - Tap anywhere → emits a concentric wave from tap point
 *   - Wave propagates outward, reflects off chamber walls
 *   - Hard taps (fast successive) emit harsh accent-colored waves
 *   - Soft taps (slow, deliberate) emit warm primary-colored waves
 *   - Reflected waves converge back to center with amplified glow
 *   - Chamber walls glow at reflection points
 *   - Accumulated soft taps fill chamber with warm resonance
 *   - Breath modulates wave propagation speed
 *
 * INTERACTION:
 *   Tap → emits wave (intensity based on tap frequency)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static resonant chamber with warm glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Chamber wall radius */
const CHAMBER_R = SIZE.lg;
/** Wave expansion speed */
const WAVE_SPEED = 0.006;
/** Wave lifetime (frames) */
const WAVE_LIFE = 120;
/** Max concurrent waves */
const MAX_WAVES = 12;
/** Fast-tap threshold (frames between taps for "harsh") */
const HARSH_THRESHOLD = 15;
/** Soft taps needed for completion */
const SOFT_TAPS_NEEDED = 6;
/** Breath wave speed modulation */
const BREATH_WAVE = 0.2;
/** Wall glow duration (frames) */
const WALL_GLOW_LIFE = 40;
/** Resonance buildup per soft tap */
const RESONANCE_PER_TAP = 0.15;
/** Resonance decay rate */
const RESONANCE_DECAY = 0.0005;
/** Reflection particle count */
const REFLECT_PARTICLES = 4;
/** Glow layers for resonance */
const GLOW_LAYERS = 4;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Wave {
  /** Origin point (normalized 0-1) */
  ox: number; oy: number;
  /** Current radius (fraction of minDim) */
  radius: number;
  /** Remaining life frames */
  life: number;
  /** Is this a harsh or soft emission */
  harsh: boolean;
  /** Has this wave reflected */
  reflected: boolean;
}

interface WallGlow {
  /** Angle on chamber wall */
  angle: number;
  /** Remaining life */
  life: number;
  /** Harsh or soft */
  harsh: boolean;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EchoChamberAtom({
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
    waves: [] as Wave[],
    wallGlows: [] as WallGlow[],
    lastTapFrame: -999,
    softTapCount: 0,
    resonance: 0,
    completed: false,
    stepNotified: false,
    completionGlow: 0,
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
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve') {
        s.resonance = 1;
        s.completed = true;
      }

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        const chamR = px(CHAMBER_R, minDim);
        // Warm resonant fill
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = chamR * (0.6 + i * 0.3);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance / (i + 1)));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        // Chamber ring
        ctx.beginPath();
        ctx.arc(cx, cy, chamR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // WAVE PHYSICS
      // ════════════════════════════════════════════════════
      const waveSpeedMod = 1 + breath * BREATH_WAVE;
      const chamR = CHAMBER_R;

      for (let i = s.waves.length - 1; i >= 0; i--) {
        const wave = s.waves[i];
        wave.radius += WAVE_SPEED * waveSpeedMod * ms;
        wave.life -= ms;

        // Check wall reflection
        const waveDistFromCenter = Math.sqrt(
          Math.pow(wave.ox - 0.5, 2) + Math.pow(wave.oy - 0.5, 2),
        );
        if (wave.radius > chamR - waveDistFromCenter && !wave.reflected) {
          wave.reflected = true;
          // Spawn wall glows at reflection points
          const reflectAngle = Math.atan2(wave.oy - 0.5, wave.ox - 0.5);
          for (let j = 0; j < REFLECT_PARTICLES; j++) {
            const ga = reflectAngle + (j / REFLECT_PARTICLES - 0.5) * Math.PI * 0.5;
            s.wallGlows.push({ angle: ga, life: WALL_GLOW_LIFE, harsh: wave.harsh });
          }
          cb.onHaptic(wave.harsh ? 'error_boundary' : 'tap');
        }

        if (wave.life <= 0) s.waves.splice(i, 1);
      }

      // Wall glow decay
      for (let i = s.wallGlows.length - 1; i >= 0; i--) {
        s.wallGlows[i].life -= ms;
        if (s.wallGlows[i].life <= 0) s.wallGlows.splice(i, 1);
      }

      // Resonance decay
      s.resonance = Math.max(0, s.resonance - RESONANCE_DECAY * ms);

      // Completion
      if (s.softTapCount >= SOFT_TAPS_NEEDED * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.softTapCount >= SOFT_TAPS_NEEDED && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      }

      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : (s.softTapCount / SOFT_TAPS_NEEDED) * 0.5);

      const chamRPx = px(chamR, minDim);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Chamber background glow (resonance)
      // ════════════════════════════════════════════════════
      if (s.resonance > 0.01) {
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = chamRPx * (0.5 + i * 0.25 + s.resonance * 0.3);
          const gA = ALPHA.glow.max * 0.06 * s.resonance * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Chamber wall
      // ════════════════════════════════════════════════════

      // Wall shadow
      const wallShadowR = chamRPx * 1.15;
      const wallShadow = ctx.createRadialGradient(cx, cy, chamRPx * 0.9, cx, cy, wallShadowR);
      wallShadow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * entrance));
      wallShadow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = wallShadow;
      ctx.fillRect(cx - wallShadowR, cy - wallShadowR, wallShadowR * 2, wallShadowR * 2);

      // Wall ring
      ctx.beginPath();
      ctx.arc(cx, cy, chamRPx, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.08 + s.resonance * 0.1) * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Inner detail ring
      ctx.beginPath();
      ctx.arc(cx, cy, chamRPx * 0.97, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Wall glow points
      // ════════════════════════════════════════════════════
      for (const wg of s.wallGlows) {
        const lr = wg.life / WALL_GLOW_LIFE;
        const gwx = cx + Math.cos(wg.angle) * chamRPx;
        const gwy = cy + Math.sin(wg.angle) * chamRPx;
        const glowR = px(0.03 * lr, minDim);
        const glowColor = wg.harsh ? s.accentRgb : s.primaryRgb;

        const wgGrad = ctx.createRadialGradient(gwx, gwy, 0, gwx, gwy, glowR);
        wgGrad.addColorStop(0, rgba(glowColor, ALPHA.glow.max * 0.2 * lr * entrance));
        wgGrad.addColorStop(0.3, rgba(glowColor, ALPHA.glow.max * 0.08 * lr * entrance));
        wgGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = wgGrad;
        ctx.fillRect(gwx - glowR, gwy - glowR, glowR * 2, glowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Propagating waves
      // ════════════════════════════════════════════════════
      for (const wave of s.waves) {
        const lr = wave.life / WAVE_LIFE;
        const waveRPx = px(wave.radius, minDim);
        const waveCx = wave.ox * w;
        const waveCy = wave.oy * h;
        const waveColor = wave.harsh ? s.accentRgb : s.primaryRgb;

        // Wave ring
        ctx.beginPath();
        ctx.arc(waveCx, waveCy, waveRPx, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(waveColor, ALPHA.content.max * 0.15 * lr * entrance);
        ctx.lineWidth = px(STROKE.thin + STROKE.hairline * lr * 3, minDim);
        ctx.stroke();

        // Wave glow
        if (lr > 0.3) {
          const innerR = Math.max(0, waveRPx - px(0.01, minDim));
          const outerR = waveRPx + px(0.01, minDim);
          const wg = ctx.createRadialGradient(waveCx, waveCy, innerR, waveCx, waveCy, outerR);
          wg.addColorStop(0, rgba(waveColor, 0));
          wg.addColorStop(0.5, rgba(waveColor, ALPHA.glow.max * 0.06 * lr * entrance));
          wg.addColorStop(1, rgba(waveColor, 0));
          ctx.fillStyle = wg;
          ctx.fillRect(waveCx - outerR, waveCy - outerR, outerR * 2, outerR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Center resonance indicator
      // ════════════════════════════════════════════════════
      if (s.resonance > 0.05) {
        const centerR = px(0.01 + s.resonance * 0.015, minDim);
        const cGrad = ctx.createRadialGradient(
          cx - centerR * 0.2, cy - centerR * 0.2, centerR * 0.1,
          cx, cy, centerR,
        );
        cGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.35 * s.resonance * entrance));
        cGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * s.resonance * entrance));
        cGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.05 * s.resonance * entrance));
        ctx.beginPath();
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
        ctx.fillStyle = cGrad;
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.ellipse(cx - centerR * 0.2, cy - centerR * 0.25, centerR * 0.25, centerR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * s.resonance * entrance);
        ctx.fill();
      }

      // ── Progress ───────────────────────────────────────
      if (!s.completed && s.softTapCount > 0) {
        const progR = px(SIZE.xs, minDim);
        const prog = s.softTapCount / SOFT_TAPS_NEEDED;
        ctx.beginPath();
        ctx.arc(cx, cy - px(CHAMBER_R + 0.05, minDim), progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Tap to emit wave ────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.waves.length >= MAX_WAVES) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const framesSinceLastTap = s.frameCount - s.lastTapFrame;
      const isHarsh = framesSinceLastTap < HARSH_THRESHOLD;

      s.waves.push({
        ox: mx, oy: my,
        radius: 0.005,
        life: WAVE_LIFE,
        harsh: isHarsh,
        reflected: false,
      });

      if (!isHarsh) {
        s.softTapCount++;
        s.resonance = Math.min(1, s.resonance + RESONANCE_PER_TAP);
      }

      s.lastTapFrame = s.frameCount;
      callbacksRef.current.onHaptic('tap');
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
