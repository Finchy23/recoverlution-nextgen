/**
 * ATOM 684: THE RESONANT FREQUENCY ENGINE
 * ==========================================
 * Series 69 — Minimum Effective Dose · Position 4
 *
 * A whisper shatters what a scream cannot. Tune the oscillator
 * to the exact resonant frequency — zero kinetic force, just a
 * quiet hum — massive glass wall violently shatters.
 *
 * PHYSICS:
 *   - Thick glass wall rendered as vertical slab with refraction lines
 *   - Tapping/hitting wall = absorbed harmlessly (error_boundary)
 *   - Scrubable frequency slider at bottom (0–1 range)
 *   - Resonant frequency is a specific value (randomized 0.3–0.7)
 *   - As tuning approaches resonance: wall vibrates increasingly
 *   - At exact resonance: wall shatters into fracture shards
 *   - Shards spread outward with angular momentum
 *   - Vibration amplitude proportional to proximity to resonance
 *
 * INTERACTION:
 *   Tap wall → harmlessly absorbed (error_boundary)
 *   Scrub slider → tune frequency → resonance → shatter (completion)
 *
 * RENDER: Canvas 2D with glass fracture pattern
 * REDUCED MOTION: Static shattered glass debris
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const WALL_X = 0.5;
const WALL_W = 0.04;
const WALL_H = 0.7;
const GLASS_LINES = 8;
const SLIDER_Y = 0.88;
const SLIDER_W = 0.6;
const SLIDER_H = 0.008;
const RESONANCE_TOLERANCE = 0.025;
const VIBRATION_MAX = 0.015;
const SHARD_COUNT = 35;
const SHARD_SPEED = 0.006;
const SHARD_ROTATION_SPEED = 0.05;
const GLOW_LAYERS = 3;

interface Shard {
  x: number; y: number;
  vx: number; vy: number;
  angle: number;
  rotSpeed: number;
  size: number;
  life: number;
}

export default function ResonantFrequencyShatterAtom({
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
    resonantFreq: 0.3 + Math.random() * 0.4,
    currentFreq: 0.5,
    scrubbing: false,
    shattered: false,
    shatterProgress: 0,
    shards: [] as Shard[],
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.015;

      if (p.reducedMotion) {
        // Scattered shards
        for (let i = 0; i < 12; i++) {
          const sx = cx + (Math.random() - 0.5) * px(0.3, minDim);
          const sy = cy + (Math.random() - 0.5) * px(WALL_H * 0.5, minDim);
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(Math.random() * Math.PI);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
          ctx.fillRect(-px(0.008, minDim), -px(0.003, minDim), px(0.016, minDim), px(0.006, minDim));
          ctx.restore();
        }
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.currentFreq = s.resonantFreq; }

      // ── Resonance calculation ─────────────────────────────
      const proximity = 1 - Math.abs(s.currentFreq - s.resonantFreq) / 0.5;
      const isResonant = Math.abs(s.currentFreq - s.resonantFreq) < RESONANCE_TOLERANCE;

      if (proximity > 0.7 && !s.stepNotified && !s.shattered) {
        s.stepNotified = true;
        cb.onHaptic('drag_snap');
      }

      // Shatter trigger
      if (isResonant && !s.shattered) {
        s.shattered = true;
        cb.onHaptic('completion');
        // Spawn shards
        const wallTop = 0.5 - WALL_H / 2;
        for (let i = 0; i < SHARD_COUNT; i++) {
          const sy = wallTop + Math.random() * WALL_H;
          const angle = (Math.random() - 0.5) * Math.PI;
          const speed = SHARD_SPEED * (0.3 + Math.random() * 0.7);
          s.shards.push({
            x: WALL_X + (Math.random() - 0.5) * WALL_W,
            y: sy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 0.3,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * SHARD_ROTATION_SPEED,
            size: 0.005 + Math.random() * 0.012,
            life: 80 + Math.random() * 40,
          });
        }
      }

      // Shard physics
      if (s.shattered) {
        s.shatterProgress = Math.min(1, s.shatterProgress + 0.01 * ms);
        for (let i = s.shards.length - 1; i >= 0; i--) {
          const sh = s.shards[i];
          sh.x += sh.vx * ms; sh.y += sh.vy * ms;
          sh.vy += 0.00005 * ms; // gravity
          sh.angle += sh.rotSpeed * ms;
          sh.life -= ms;
          if (sh.life <= 0) s.shards.splice(i, 1);
        }
      }

      cb.onStateChange?.(s.shattered ? 0.5 + s.shatterProgress * 0.5 : proximity * 0.5);

      const vibAmp = s.shattered ? 0 : proximity * VIBRATION_MAX;
      const vibX = Math.sin(time * 12 * proximity) * px(vibAmp, minDim);

      // ── 1. Glass wall ─────────────────────────────────────
      if (!s.shattered) {
        const wallPx = px(WALL_W, minDim);
        const wallHPx = px(WALL_H, minDim);
        const wallLeft = WALL_X * w - wallPx / 2 + vibX;
        const wallTop = cy - wallHPx / 2;

        // Wall glow
        const wg = ctx.createLinearGradient(wallLeft - wallPx, 0, wallLeft + wallPx * 2, 0);
        wg.addColorStop(0, rgba(s.accentRgb, 0));
        wg.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * entrance));
        wg.addColorStop(0.7, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * entrance));
        wg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = wg;
        ctx.fillRect(wallLeft - wallPx, wallTop, wallPx * 3, wallHPx);

        // Wall body
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.fillRect(wallLeft, wallTop, wallPx, wallHPx);

        // Refraction lines
        for (let i = 0; i < GLASS_LINES; i++) {
          const ly = wallTop + (i + 1) / (GLASS_LINES + 1) * wallHPx;
          const lx1 = wallLeft + Math.sin(time * 0.5 + i) * wallPx * 0.2;
          const lx2 = wallLeft + wallPx - Math.sin(time * 0.5 + i + 1) * wallPx * 0.2;
          ctx.beginPath();
          ctx.moveTo(lx1, ly);
          ctx.lineTo(lx2, ly + wallHPx * 0.05);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.06 * entrance);
          ctx.lineWidth = px(0.0005, minDim);
          ctx.stroke();
        }

        // Resonance stress cracks (near resonance)
        if (proximity > 0.6) {
          const crackIntensity = (proximity - 0.6) / 0.4;
          const crackCount = Math.floor(crackIntensity * 5);
          for (let i = 0; i < crackCount; i++) {
            const cy2 = wallTop + (0.2 + i * 0.15) * wallHPx;
            ctx.beginPath();
            ctx.moveTo(wallLeft, cy2);
            const segments = 3 + Math.floor(crackIntensity * 3);
            for (let j = 1; j <= segments; j++) {
              const sx = wallLeft + (j / segments) * wallPx;
              const sy = cy2 + (Math.sin(j * 3 + time * 5) * wallHPx * 0.03 * crackIntensity);
              ctx.lineTo(sx, sy);
            }
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * crackIntensity * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
      }

      // ── 2. Shards ────────────────────────────────────────
      for (const sh of s.shards) {
        const sx = sh.x * w;
        const sy = sh.y * h;
        const sSize = px(sh.size, minDim);
        const lr = sh.life / 120;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(sh.angle);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * lr * entrance);
        // Angular shard shape
        ctx.beginPath();
        ctx.moveTo(-sSize * 0.5, -sSize * 0.2);
        ctx.lineTo(sSize * 0.5, -sSize * 0.3);
        ctx.lineTo(sSize * 0.3, sSize * 0.3);
        ctx.lineTo(-sSize * 0.4, sSize * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // ── 3. Frequency slider ───────────────────────────────
      const sliderLeft = (0.5 - SLIDER_W / 2) * w;
      const sliderRight = (0.5 + SLIDER_W / 2) * w;
      const sliderY = SLIDER_Y * h;
      const sliderHPx = px(SLIDER_H, minDim);

      // Track
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
      ctx.fillRect(sliderLeft, sliderY, sliderRight - sliderLeft, sliderHPx);

      // Resonance zone hint (very subtle)
      const resX = sliderLeft + s.resonantFreq * (sliderRight - sliderLeft);
      const hintW = px(RESONANCE_TOLERANCE * 2, minDim) * (sliderRight - sliderLeft) / w;
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
      ctx.fillRect(resX - hintW, sliderY, hintW * 2, sliderHPx);

      // Knob
      const knobX = sliderLeft + s.currentFreq * (sliderRight - sliderLeft);
      ctx.beginPath();
      ctx.arc(knobX, sliderY + sliderHPx / 2, px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      // Frequency wave visualization
      if (!s.shattered) {
        const waveAmp = px(0.015 * proximity, minDim);
        ctx.beginPath();
        for (let x = sliderLeft; x < sliderRight; x += 2) {
          const t2 = (x - sliderLeft) / (sliderRight - sliderLeft);
          const y2 = sliderY - px(0.03, minDim) + Math.sin(t2 * Math.PI * 8 * s.currentFreq + time * 6) * waveAmp;
          if (x === sliderLeft) ctx.moveTo(x, y2); else ctx.lineTo(x, y2);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── 4. Post-shatter glow ──────────────────────────────
      if (s.shattered && s.shatterProgress > 0.3) {
        const clearR = px(SIZE.md * s.shatterProgress, minDim);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, clearR * 2);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * s.shatterProgress * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - clearR * 2, cy - clearR * 2, clearR * 4, clearR * 4);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Slider scrubbing
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.shattered) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;

      if (Math.abs(my - SLIDER_Y) < 0.06) {
        s.scrubbing = true;
        const mx = (e.clientX - rect.left) / rect.width;
        s.currentFreq = Math.max(0, Math.min(1, (mx - (0.5 - SLIDER_W / 2)) / SLIDER_W));
      } else {
        // Tapping wall = error
        callbacksRef.current.onHaptic('error_boundary');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.scrubbing || s.shattered) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      s.currentFreq = Math.max(0, Math.min(1, (mx - (0.5 - SLIDER_W / 2)) / SLIDER_W));
    };

    const onUp = () => { stateRef.current.scrubbing = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
