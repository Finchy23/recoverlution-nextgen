/**
 * ATOM 289: THE WEIGHT OF THE WORLD ENGINE
 * ===========================================
 * Series 29 — Interoceptive Anchor · Position 9
 *
 * You are holding the sky with your shoulders. Let go —
 * the ceiling shatters into a million weightless golden sparks.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Ceiling pressure rendered as descending topographic contours
 *   - Contour lines compress as the weight increases (isobars)
 *   - Post-shatter: Chladni liberation pattern crystallizes in the
 *     open sky — the resonance frequency of freedom
 *   - Teaches: release creates space for new patterns to emerge
 *
 * PHYSICS:
 *   - Dark ceiling pressing down with contour isobars
 *   - Hold to resist → grinding exhaustion, core compresses
 *   - Release after 3s+ → ceiling shatters, sparks fly up
 *   - 8 layers: pressure contours, ceiling body, pressure cracks,
 *     strain lines, core glow+body+specular, shards+sparks,
 *     liberation Chladni, sky glow
 *   - Breath couples to: core resilience, contour warmth, spark brightness
 *
 * INTERACTION:
 *   Hold → resist the weight (hold_start)
 *   Release after 3s+ → explosive liberation (hold_release → completion)
 *   Release too early → ceiling resettles
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static open sky with floating sparks + Chladni
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

/** Ceiling resting position (fraction of height) */
const CEILING_Y = 0.3;
/** Ceiling press speed per frame when holding */
const PRESS_SPEED = 0.0008;
/** Maximum ceiling press position */
const MAX_PRESS = 0.55;
/** Minimum hold frames to shatter (~3s) */
const MIN_HOLD_TO_SHATTER = 180;
/** Core node base radius */
const CORE_BASE_R = SIZE.sm;
/** Core compression under pressure */
const CORE_COMPRESS = 0.06;
/** Number of sparks on shatter */
const SPARK_COUNT = 80;
/** Spark upward speed */
const SPARK_SPEED = 0.004;
/** Spark lifespan in frames */
const SPARK_LIFE = 140;
/** Number of ceiling shards */
const SHARD_COUNT = 24;
/** Shard drift speed */
const SHARD_SPEED = 0.003;
/** Strain line count */
const STRAIN_LINES = 8;
/** Core glow layers */
const CORE_GLOW_LAYERS = 5;
/** Pressure contour count */
const PRESSURE_CONTOUR_COUNT = 10;
/** Pressure contour spacing */
const PRESSURE_CONTOUR_SPACING = 0.02;
/** Chladni resolution for liberation pattern */
const CHLADNI_RES = 24;
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

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  size: number; life: number;
  phase: number;
}

interface Shard {
  x: number; y: number;
  vx: number; vy: number;
  angle: number; rotSpeed: number;
  size: number; life: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw pressure isobar contours descending from the ceiling.
 * Lines compress as pressure increases — visual representation of weight.
 */
function drawPressureContours(
  ctx: CanvasRenderingContext2D,
  w: number, ceilPx: number, minDim: number,
  rgb: RGB, entrance: number, pressure: number,
  frame: number,
): void {
  for (let i = 0; i < PRESSURE_CONTOUR_COUNT; i++) {
    const baseFrac = (i + 1) / (PRESSURE_CONTOUR_COUNT + 1);
    // Contours compress downward as pressure increases
    const y = ceilPx * baseFrac * (1 + pressure * 0.3);
    const alpha = ALPHA.atmosphere.max * 0.2 * (1 - i / PRESSURE_CONTOUR_COUNT)
      * (0.3 + pressure * 0.7) * entrance;

    ctx.beginPath();
    const steps = 32;
    for (let a = 0; a <= steps; a++) {
      const xFrac = a / steps;
      const x = xFrac * w;
      const wobble = Math.sin(xFrac * 8 + i * 1.2 + frame * 0.003) * px(0.005, minDim) * (1 + pressure);
      if (a === 0) ctx.moveTo(x, y + wobble);
      else ctx.lineTo(x, y + wobble);
    }
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(i % 3 === 0 ? STROKE.thin : STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw Chladni liberation pattern in the cleared sky after shatter.
 */
function drawLiberationChladni(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number, shatterProgress: number,
): void {
  if (shatterProgress < 0.3) return;
  const vis = (shatterProgress - 0.3) / 0.7;
  const n = 4; const m = 5;
  const fieldR = px(0.35, minDim);
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
        const x = cx + nx * fieldR;
        const y = cy + ny * fieldR;
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

export default function WeightOfWorldAtom({
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
    holding: false,
    holdNotified: false,
    holdFrames: 0,
    ceilingY: CEILING_Y,
    shattered: false,
    shatterProgress: 0,
    sparks: [] as Spark[],
    shards: [] as Shard[],
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

      if (p.reducedMotion || p.phase === 'resolve') {
        s.shattered = true; s.shatterProgress = 1;
      }

      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb, p.breathAmplitude * BREATH_WARMTH);

      // ═══════════════════════════════════════════════════════════════
      // HOLD + CEILING PHYSICS
      // ═══════════════════════════════════════════════════════════════
      if (s.holding) {
        s.holdFrames += ms;
        s.ceilingY = Math.min(MAX_PRESS, s.ceilingY + PRESS_SPEED * ms);
      } else if (!s.shattered) {
        s.ceilingY = Math.max(CEILING_Y, s.ceilingY - PRESS_SPEED * 0.5 * ms);
      }

      if (s.shattered) {
        s.shatterProgress = Math.min(1, s.shatterProgress + 0.008 * ms);
        s.ceilingY = Math.max(-0.2, s.ceilingY - 0.003 * ms);
      }

      // Spark/shard physics
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms; sp.y += sp.vy * ms;
        sp.vy -= 0.00003 * ms;
        sp.life -= ms;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }
      for (let i = s.shards.length - 1; i >= 0; i--) {
        const sh = s.shards[i];
        sh.x += sh.vx * ms; sh.y += sh.vy * ms;
        sh.vy -= 0.00005 * ms; sh.angle += sh.rotSpeed * ms;
        sh.life -= ms;
        if (sh.life <= 0) s.shards.splice(i, 1);
      }

      const ceilPx = s.ceilingY * h;
      const pressure = Math.max(0, (s.ceilingY - CEILING_Y) / (MAX_PRESS - CEILING_Y));

      cb.onStateChange?.(s.completed ? 1 : s.shattered ? 0.5 + s.shatterProgress * 0.5 :
        Math.min(0.5, s.holdFrames / MIN_HOLD_TO_SHATTER * 0.5));

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Pressure contour isobars (descending lines)
      // ═══════════════════════════════════════════════════════════════
      if (!s.shattered) {
        drawPressureContours(ctx, w, ceilPx, minDim,
          s.accentRgb, entrance, pressure, s.frameCount);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Ceiling body (oppressive sky gradient)
      // ═══════════════════════════════════════════════════════════════
      if (!s.shattered) {
        const ceilGrad = ctx.createLinearGradient(0, 0, 0, ceilPx);
        ceilGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.18 * entrance));
        ceilGrad.addColorStop(0.4, rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance));
        ceilGrad.addColorStop(0.8, rgba(s.accentRgb, ALPHA.content.max * 0.05 * entrance));
        ceilGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.02 * entrance));
        ctx.fillStyle = ceilGrad;
        ctx.fillRect(0, 0, w, ceilPx);

        // Ceiling edge line
        ctx.beginPath();
        ctx.moveTo(0, ceilPx);
        ctx.lineTo(w, ceilPx);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.14 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Pressure cracks in ceiling
      // ═══════════════════════════════════════════════════════════════
      if (!s.shattered && pressure > 0.2) {
        const crackCount = Math.floor(pressure * 6);
        for (let i = 0; i < crackCount; i++) {
          const cx2 = w * (0.15 + i * 0.12);
          const crackLen = px(0.015 + pressure * 0.015, minDim);
          ctx.beginPath();
          ctx.moveTo(cx2, ceilPx);
          const endX = cx2 + (Math.sin(i * 2.7) * 0.5) * crackLen;
          const endY = ceilPx - crackLen;
          ctx.lineTo(endX, endY);
          // Fork
          ctx.lineTo(endX - crackLen * 0.3, endY - crackLen * 0.4);
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX + crackLen * 0.2, endY - crackLen * 0.3);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * pressure * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Shards (post-shatter debris)
      // ═══════════════════════════════════════════════════════════════
      for (const sh of s.shards) {
        const sx = sh.x * w;
        const sy = sh.y * h;
        const sS = px(sh.size, minDim);
        const lr = sh.life / 80;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(sh.angle);
        // Shard with gradient
        const sg = ctx.createLinearGradient(-sS / 2, 0, sS / 2, 0);
        sg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.08 * lr * entrance));
        sg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.14 * lr * entrance));
        sg.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.04 * lr * entrance));
        ctx.fillStyle = sg;
        ctx.fillRect(-sS / 2, -sS * 0.2, sS, sS * 0.4);
        ctx.restore();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Core shadow + glow + body + specular + strain
      // ═══════════════════════════════════════════════════════════════
      const coreY = cy + (s.shattered ? -px(0.03 * s.shatterProgress, minDim) : 0);
      const coreR = px(CORE_BASE_R * (1 - pressure * CORE_COMPRESS) *
        (1 + (s.shattered ? s.shatterProgress * 0.6 : 0)) +
        p.breathAmplitude * 0.005, minDim);
      const coreColor = s.shattered
        ? lerpColor(s.accentRgb, s.primaryRgb, s.shatterProgress)
        : lerpColor(s.primaryRgb, s.accentRgb, pressure * 0.3);

      // Shadow
      const shY = coreY + coreR * 0.5;
      const shG = ctx.createRadialGradient(cx, shY, 0, cx, shY, coreR * 1.3);
      shG.addColorStop(0, `rgba(0,0,0,${0.08 * entrance})`);
      shG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shG;
      ctx.beginPath();
      ctx.ellipse(cx, shY, coreR * 1.3, coreR * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glow layers
      for (let i = CORE_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = coreR * (2 + i * 2.0 + (s.shattered ? s.shatterProgress * 5 : 0));
        const gA = ALPHA.glow.max * (s.shattered ? 0.15 : 0.06) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, gR);
        gg.addColorStop(0, rgba(coreColor, gA));
        gg.addColorStop(0.25, rgba(coreColor, gA * 0.5));
        gg.addColorStop(0.6, rgba(coreColor, gA * 0.1));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, coreY - gR, gR * 2, gR * 2);
      }

      // Core body (5-stop gradient)
      const bodyG = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, coreR);
      const bodyA = ALPHA.content.max * (s.shattered ? 0.6 + s.shatterProgress * 0.2 : 0.35) * entrance;
      bodyG.addColorStop(0, rgba(lerpColor(coreColor, [255, 255, 255] as unknown as RGB, s.shattered ? 0.12 : 0.05), bodyA));
      bodyG.addColorStop(0.3, rgba(coreColor, bodyA));
      bodyG.addColorStop(0.6, rgba(coreColor, bodyA * 0.7));
      bodyG.addColorStop(0.85, rgba(s.shattered ? s.primaryRgb : s.accentRgb, bodyA * 0.3));
      bodyG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.arc(cx, coreY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Specular
      const spX = cx - coreR * SPECULAR_OFFSET;
      const spY = coreY - coreR * SPECULAR_OFFSET;
      const spR = coreR * 0.2;
      const spG = ctx.createRadialGradient(spX, spY, 0, spX, spY, spR);
      spG.addColorStop(0, `rgba(255,255,255,${0.25 * entrance})`);
      spG.addColorStop(0.5, `rgba(255,255,255,${0.05 * entrance})`);
      spG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spG;
      ctx.beginPath();
      ctx.arc(spX, spY, spR, 0, Math.PI * 2);
      ctx.fill();

      // Strain lines (under pressure, not shattered)
      if (!s.shattered && pressure > 0.1) {
        for (let i = 0; i < STRAIN_LINES; i++) {
          const angle = (i / STRAIN_LINES) * Math.PI * 2;
          const innerR = coreR * 1.2;
          const outerR = coreR * (1.5 + pressure * 1.0);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * innerR, coreY + Math.sin(angle) * innerR);
          ctx.lineTo(cx + Math.cos(angle) * outerR, coreY + Math.sin(angle) * outerR);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.07 * pressure * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Golden sparks (gravity-defying upward drift)
      // ═══════════════════════════════════════════════════════════════
      for (const sp of s.sparks) {
        const sx = sp.x * w;
        const sy = sp.y * h;
        const lr = sp.life / SPARK_LIFE;
        const spR2 = px(sp.size * lr, minDim);
        // Spark glow
        const glowR = spR2 * 3;
        const sg2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        sg2.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.12 * lr * entrance));
        sg2.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * lr * entrance));
        sg2.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg2;
        ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);
        // Spark body
        ctx.beginPath();
        ctx.arc(sx, sy, spR2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmRgb, ALPHA.content.max * 0.45 * lr * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Liberation Chladni (post-shatter sky pattern)
      // ═══════════════════════════════════════════════════════════════
      if (s.shattered) {
        drawLiberationChladni(ctx, cx, cy * 0.6, minDim,
          warmRgb, entrance, s.shatterProgress);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Liberation sky glow + hold indicator
      // ═══════════════════════════════════════════════════════════════
      if (s.shattered && s.shatterProgress > 0.3) {
        const libR = px(SIZE.lg * s.shatterProgress, minDim);
        const lg = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, libR);
        lg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.12 * s.shatterProgress * entrance));
        lg.addColorStop(0.3, rgba(warmRgb, ALPHA.glow.max * 0.05 * s.shatterProgress * entrance));
        lg.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * s.shatterProgress * entrance));
        lg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lg;
        ctx.fillRect(cx - libR, coreY - libR, libR * 2, libR * 2);
      }

      // Hold progress (how long until shatter threshold)
      if (s.holding && !s.shattered) {
        const holdFrac = Math.min(1, s.holdFrames / MIN_HOLD_TO_SHATTER);
        const progAngle = holdFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, coreY, coreR * 1.6, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(coreColor, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.shattered) return;
      s.holding = true;
      s.holdFrames = 0;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    const onUp = () => {
      const s = stateRef.current;
      const cb = callbacksRef.current;
      if (!s.holding) return;
      s.holding = false;

      if (s.holdFrames >= MIN_HOLD_TO_SHATTER && !s.shattered) {
        s.shattered = true;
        s.completed = true;
        cb.onHaptic('hold_release');

        for (let i = 0; i < SPARK_COUNT; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = SPARK_SPEED * (0.3 + Math.random() * 0.7);
          s.sparks.push({
            x: 0.25 + Math.random() * 0.5,
            y: s.ceilingY + Math.random() * 0.1,
            vx: Math.cos(angle) * speed * 0.5,
            vy: -Math.abs(Math.sin(angle)) * speed,
            size: 0.002 + Math.random() * 0.005,
            life: SPARK_LIFE * (0.4 + Math.random() * 0.6),
            phase: Math.random() * Math.PI * 2,
          });
        }

        for (let i = 0; i < SHARD_COUNT; i++) {
          const angle = Math.random() * Math.PI * 2;
          s.shards.push({
            x: Math.random(), y: s.ceilingY * 0.5 + Math.random() * s.ceilingY * 0.5,
            vx: Math.cos(angle) * SHARD_SPEED * (0.5 + Math.random()),
            vy: -Math.abs(Math.sin(angle)) * SHARD_SPEED,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            size: 0.006 + Math.random() * 0.014,
            life: 60 + Math.random() * 50,
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
