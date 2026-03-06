/**
 * ATOM 290: THE ANCHOR SEAL
 * ============================
 * Series 29 — Interoceptive Anchor · Position 10 (Series Capstone)
 *
 * A wandering spark pulled to dead center under your thumb.
 * A single perfect incredibly deep sustained note. You are Here.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Wandering spark trail generates topographic contour memory lines
 *   - Center zone displays emerging Chladni mandala that crystallizes
 *     as the spark is held in place — the body's resonance converging
 *   - On seal: full viewport Chladni pattern stamps in from center
 *   - Capstone: the most elaborate contour + Chladni atom in S29
 *
 * PHYSICS:
 *   - Spark wanders chaotically (Brownian motion + wander force)
 *   - Hold → magnetic pull toward center (gravity well)
 *   - Within center zone + held → threshold timer → seal stamp
 *   - 8 layers: wander contour field, Chladni centering mandala,
 *     center target + crosshair, trail path, threshold progress,
 *     spark glow (5-layer), spark body + specular, seal stamp + bloom
 *   - Breath couples to: spark glow warmth, Chladni clarity, contour drift
 *
 * INTERACTION:
 *   Hold → pull spark to center (hold_start → hold_threshold → seal_stamp)
 *   Release → spark drifts away
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static centered spark with full Chladni + seal ring
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

/** Spark base radius when wandering */
const SPARK_R_BASE = 0.009;
/** Spark radius when sealed (hero size) */
const SPARK_R_SEALED = SIZE.sm * 0.4;
/** Brownian wander force magnitude */
const WANDER_FORCE = 0.0005;
/** Wander direction change rate */
const WANDER_CHANGE = 0.02;
/** Magnetic pull force toward center when holding */
const PULL_FORCE = 0.004;
/** Velocity damping per frame */
const FRICTION = 0.96;
/** Center zone radius for seal detection (fraction) */
const CENTER_ZONE = 0.035;
/** Frames of sustained centering needed for seal (~2s) */
const THRESHOLD_TIME = 120;
/** Seal ring radius (fraction of minDim) */
const SEAL_RING_R = 0.16;
/** Trail sample length */
const TRAIL_LENGTH = 50;
/** Spark glow layer count */
const SPARK_GLOW_LAYERS = 5;
/** Flash decay rate */
const FLASH_DECAY = 0.95;
/** Topographic contour count around spark trail */
const CONTOUR_RINGS = 8;
/** Contour spacing */
const CONTOUR_SPACING = 0.015;
/** Chladni resolution for center mandala */
const CHLADNI_RES = 26;
/** Chladni threshold */
const CHLADNI_THRESH = 0.14;
/** Chladni dot radius */
const CHLADNI_DOT = 0.003;
/** Breath warmth coupling */
const BREATH_WARMTH = 0.06;
/** Breath Chladni clarity coupling */
const BREATH_CLARITY = 0.04;
/** Specular offset */
const SPECULAR_OFFSET = 0.22;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Trail point with aging */
interface TrailPoint {
  x: number; y: number;
  age: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw topographic contour rings around current spark position.
 * These represent the "memory" of where the spark has been — the
 * terrain of wandering attention.
 */
function drawWanderContours(
  ctx: CanvasRenderingContext2D,
  sparkX: number, sparkY: number,
  w: number, h: number, minDim: number,
  rgb: RGB, entrance: number, frame: number,
  nearness: number, breathAmp: number,
): void {
  for (let i = 0; i < CONTOUR_RINGS; i++) {
    const baseR = px(CONTOUR_SPACING * (i + 1), minDim);
    const breathDrift = breathAmp * px(0.002, minDim) * Math.sin(i * 0.5 + frame * 0.004);
    const r = baseR + breathDrift;
    // Contours fade as nearness increases (attention is focusing)
    const alpha = ALPHA.atmosphere.max * 0.2 * (1 - nearness * 0.6) *
      (1 - i / CONTOUR_RINGS) * entrance;

    ctx.beginPath();
    const steps = 32;
    for (let a = 0; a <= steps; a++) {
      const angle = (a / steps) * Math.PI * 2;
      const wobble = 1 + 0.08 * Math.sin(angle * 4 + i * 1.3 + frame * 0.004);
      const px2 = sparkX * w + Math.cos(angle) * r * wobble;
      const py2 = sparkY * h + Math.sin(angle) * r * wobble;
      if (a === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(i % 3 === 0 ? STROKE.thin : STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw Chladni mandala pattern at center.
 * Visibility increases with nearness and center time.
 * On seal: full mandala crystallizes.
 */
function drawCenterChladni(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number,
  nearness: number, centerFrac: number,
  sealed: boolean, frame: number,
): void {
  const vis = sealed ? 1 : Math.max(0, nearness * 0.3 + centerFrac * 0.7);
  if (vis < 0.05) return;

  // Modal numbers increase as seal approaches (more complex pattern)
  const n = sealed ? 5 : 2 + Math.floor(centerFrac * 3);
  const m = sealed ? 4 : 3 + Math.floor(centerFrac * 2);
  const fieldR = px(sealed ? 0.38 : 0.15 + centerFrac * 0.15, minDim);
  const dotR = px(CHLADNI_DOT, minDim);
  const timeShift = sealed ? frame * 0.0002 : 0;

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES - 1)) * 2 - 1;
      if (nx * nx + ny * ny > 1) continue;

      const val = Math.abs(
        Math.cos(n * Math.PI * (nx + timeShift)) * Math.cos(m * Math.PI * ny) -
        Math.cos(m * Math.PI * (nx + timeShift)) * Math.cos(n * Math.PI * ny)
      );

      if (val < CHLADNI_THRESH) {
        const x = cx + nx * fieldR;
        const y = cy + ny * fieldR;
        const intensity = (1 - val / CHLADNI_THRESH) * vis;
        const alpha = ALPHA.content.max * (sealed ? 0.12 : 0.08) * intensity * entrance;
        ctx.beginPath();
        ctx.arc(x, y, dotR * (0.3 + intensity * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, alpha);
        ctx.fill();
      }
    }
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function AnchorSealAtom({
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
    sparkX: 0.25 + Math.random() * 0.5,
    sparkY: 0.25 + Math.random() * 0.5,
    vx: (Math.random() - 0.5) * 0.003,
    vy: (Math.random() - 0.5) * 0.003,
    wanderAngle: Math.random() * Math.PI * 2,
    holding: false,
    holdNotified: false,
    thresholdNotified: false,
    centerTime: 0,
    sealed: false,
    sealFlash: 0,
    trail: [] as TrailPoint[],
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
        s.sparkX = 0.5; s.sparkY = 0.5; s.sealed = true;
      }

      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb, p.breathAmplitude * BREATH_WARMTH);

      // ═══════════════════════════════════════════════════════════════
      // SPARK PHYSICS
      // ═══════════════════════════════════════════════════════════════
      if (!s.sealed) {
        if (s.holding) {
          const dx = 0.5 - s.sparkX;
          const dy = 0.5 - s.sparkY;
          s.vx += dx * PULL_FORCE * ms;
          s.vy += dy * PULL_FORCE * ms;
        } else {
          s.wanderAngle += (Math.random() - 0.5) * WANDER_CHANGE;
          s.vx += Math.cos(s.wanderAngle) * WANDER_FORCE * ms;
          s.vy += Math.sin(s.wanderAngle) * WANDER_FORCE * ms;
        }

        s.vx *= FRICTION;
        s.vy *= FRICTION;
        s.sparkX += s.vx * ms;
        s.sparkY += s.vy * ms;

        if (s.sparkX < 0.08 || s.sparkX > 0.92) s.vx *= -0.5;
        if (s.sparkY < 0.08 || s.sparkY > 0.92) s.vy *= -0.5;
        s.sparkX = Math.max(0.05, Math.min(0.95, s.sparkX));
        s.sparkY = Math.max(0.05, Math.min(0.95, s.sparkY));

        const distToCenter = Math.hypot(s.sparkX - 0.5, s.sparkY - 0.5);
        if (distToCenter < CENTER_ZONE && s.holding) {
          s.centerTime += ms;
          if (s.centerTime > THRESHOLD_TIME * 0.5 && !s.thresholdNotified) {
            s.thresholdNotified = true;
            cb.onHaptic('hold_threshold');
          }
          if (s.centerTime >= THRESHOLD_TIME) {
            s.sealed = true;
            s.sparkX = 0.5;
            s.sparkY = 0.5;
            s.sealFlash = 1;
            cb.onHaptic('seal_stamp');
          }
        } else {
          s.centerTime = Math.max(0, s.centerTime - 0.8 * ms);
        }

        if (s.frameCount % 2 === 0) {
          s.trail.push({ x: s.sparkX, y: s.sparkY, age: 0 });
          if (s.trail.length > TRAIL_LENGTH) s.trail.shift();
        }
      }

      if (s.sealFlash > 0) s.sealFlash *= FLASH_DECAY;
      for (const tp of s.trail) tp.age += 0.02;

      const distToCenter = Math.hypot(s.sparkX - 0.5, s.sparkY - 0.5);
      const nearness = s.sealed ? 1 : Math.max(0, 1 - distToCenter * 5);
      const centerFrac = Math.min(1, s.centerTime / THRESHOLD_TIME);
      const sx = s.sparkX * w;
      const sy = s.sparkY * h;
      const sparkR = px(s.sealed ? SPARK_R_SEALED : SPARK_R_BASE + nearness * 0.006, minDim);

      cb.onStateChange?.(s.sealed ? 1 : centerFrac);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Wander contour field (topographic terrain)
      // ═══════════════════════════════════════════════════════════════
      if (!s.sealed) {
        drawWanderContours(ctx, s.sparkX, s.sparkY, w, h, minDim,
          s.primaryRgb, entrance, s.frameCount, nearness, p.breathAmplitude);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni centering mandala
      // ═══════════════════════════════════════════════════════════════
      drawCenterChladni(ctx, cx, cy, minDim,
        lerpColor(warmRgb, s.primaryRgb, 0.5),
        entrance, nearness, centerFrac, s.sealed, s.frameCount);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Center target + crosshair
      // ═══════════════════════════════════════════════════════════════
      const targetR = px(CENTER_ZONE * 1.2, minDim);

      // Target glow (intensifies with nearness)
      if (nearness > 0.15 || s.sealed) {
        const tgR = targetR * (s.sealed ? 4 : 3);
        const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, tgR);
        tg.addColorStop(0, rgba(warmRgb,
          ALPHA.glow.max * 0.08 * Math.max(nearness, s.sealed ? 1 : 0) * entrance));
        tg.addColorStop(0.4, rgba(s.primaryRgb,
          ALPHA.glow.max * 0.02 * nearness * entrance));
        tg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tg;
        ctx.fillRect(cx - tgR, cy - tgR, tgR * 2, tgR * 2);
      }

      // Target ring
      ctx.beginPath();
      ctx.arc(cx, cy, targetR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb,
        ALPHA.content.max * (s.sealed ? 0.03 : 0.04 + nearness * 0.08) * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // Crosshair
      const chS = targetR * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - chS, cy); ctx.lineTo(cx + chS, cy);
      ctx.moveTo(cx, cy - chS); ctx.lineTo(cx, cy + chS);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Trail path (wander memory with glow)
      // ═══════════════════════════════════════════════════════════════
      if (!s.sealed && s.trail.length > 1) {
        ctx.lineCap = 'round';
        for (let i = 1; i < s.trail.length; i++) {
          const tp = s.trail[i];
          const prevTp = s.trail[i - 1];
          const fade = Math.max(0, 1 - tp.age);
          if (fade < 0.05) continue;
          const t = i / s.trail.length;
          ctx.beginPath();
          ctx.moveTo(prevTp.x * w, prevTp.y * h);
          ctx.lineTo(tp.x * w, tp.y * h);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * fade * t * entrance);
          ctx.lineWidth = px(STROKE.hairline + STROKE.thin * t, minDim);
          ctx.stroke();
        }
        ctx.lineCap = 'butt';

        // Trail dots at intervals
        for (let i = 0; i < s.trail.length; i += 5) {
          const tp = s.trail[i];
          const fade = Math.max(0, 1 - tp.age);
          if (fade < 0.1) continue;
          const dotR = px(0.002, minDim) * fade;
          ctx.beginPath();
          ctx.arc(tp.x * w, tp.y * h, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * fade * entrance);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Threshold progress arc
      // ═══════════════════════════════════════════════════════════════
      if (!s.sealed && s.centerTime > 0) {
        const progAngle = centerFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, targetR * 1.6, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Tick marks on progress
        const ticks = 8;
        for (let t = 0; t < Math.floor(centerFrac * ticks); t++) {
          const tickAngle = -Math.PI / 2 + (t / ticks) * Math.PI * 2;
          const tInner = targetR * 1.5;
          const tOuter = targetR * 1.7;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(tickAngle) * tInner, cy + Math.sin(tickAngle) * tInner);
          ctx.lineTo(cx + Math.cos(tickAngle) * tOuter, cy + Math.sin(tickAngle) * tOuter);
          ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.1 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Spark shadow + glow (5-layer, 5-stop)
      // ═══════════════════════════════════════════════════════════════
      const sparkIntensity = s.sealed ? 1 : 0.3 + nearness * 0.4;

      // Shadow
      if (sparkR > 3) {
        const shY = sy + sparkR * 0.3;
        const shG = ctx.createRadialGradient(sx, shY, 0, sx, shY, sparkR * 1.3);
        shG.addColorStop(0, `rgba(0,0,0,${0.06 * entrance})`);
        shG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shG;
        ctx.beginPath();
        ctx.ellipse(sx, shY, sparkR * 1.3, sparkR * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glow layers
      for (let i = SPARK_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = sparkR * (2 + i * 2.5 + (s.sealed ? 8 : nearness * 4));
        const gA = ALPHA.glow.max * sparkIntensity * (0.08 + (s.sealed ? 0.12 : 0)) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, gR);
        gg.addColorStop(0, rgba(warmRgb, gA + s.sealFlash * 0.15));
        gg.addColorStop(0.2, rgba(warmRgb, gA * 0.5));
        gg.addColorStop(0.5, rgba(s.primaryRgb, gA * 0.12));
        gg.addColorStop(0.8, rgba(s.primaryRgb, gA * 0.02));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(sx - gR, sy - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Spark body (5-stop gradient + specular)
      // ═══════════════════════════════════════════════════════════════
      const bodyG = ctx.createRadialGradient(sx, sy, 0, sx, sy, sparkR);
      const bodyA = ALPHA.content.max * (sparkIntensity * 0.6 + 0.2 + s.sealFlash * 0.2) * entrance;
      bodyG.addColorStop(0, rgba(lerpColor(warmRgb, [255, 255, 255] as unknown as RGB, 0.15), bodyA));
      bodyG.addColorStop(0.25, rgba(warmRgb, bodyA));
      bodyG.addColorStop(0.55, rgba(s.primaryRgb, bodyA * 0.6));
      bodyG.addColorStop(0.85, rgba(s.primaryRgb, bodyA * 0.2));
      bodyG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.arc(sx, sy, sparkR, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      if (sparkR > 3) {
        const spX = sx - sparkR * SPECULAR_OFFSET;
        const spY2 = sy - sparkR * SPECULAR_OFFSET;
        const spR = sparkR * 0.22;
        const sg = ctx.createRadialGradient(spX, spY2, 0, spX, spY2, spR);
        sg.addColorStop(0, `rgba(255,255,255,${0.35 * entrance})`);
        sg.addColorStop(0.4, `rgba(255,255,255,${0.08 * entrance})`);
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(spX, spY2, spR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Seal flash + seal ring + emanating rings + cardinal dots
      // ═══════════════════════════════════════════════════════════════

      // Seal flash burst
      if (s.sealFlash > 0.01) {
        const fR = px(SIZE.lg * s.sealFlash, minDim);
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fR);
        fg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * s.sealFlash * 0.4 * entrance));
        fg.addColorStop(0.3, rgba(warmRgb, ALPHA.glow.max * s.sealFlash * 0.12 * entrance));
        fg.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.max * s.sealFlash * 0.03 * entrance));
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(cx - fR, cy - fR, fR * 2, fR * 2);
      }

      if (s.sealed) {
        const sealR = px(SEAL_RING_R, minDim);

        // Double seal ring
        ctx.beginPath();
        ctx.arc(cx, cy, sealR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, sealR * 1.08, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Emanating rings
        for (let i = 0; i < 4; i++) {
          const rPhase = (s.frameCount * 0.003 + i * 0.25) % 1;
          const rR = sparkR * 3 + rPhase * sealR;
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmRgb,
            ALPHA.content.max * 0.05 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Cardinal markers + intercardinal dots
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const isCardinal = i % 2 === 0;
          const mx2 = cx + Math.cos(angle) * sealR;
          const my2 = cy + Math.sin(angle) * sealR;
          const dotR = px(isCardinal ? 0.004 : 0.002, minDim);
          ctx.beginPath();
          ctx.arc(mx2, my2, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(warmRgb,
            ALPHA.content.max * (isCardinal ? 0.2 : 0.08) * entrance);
          ctx.fill();
        }

        // "HERE" indicator — single vertical line below seal
        const hereY = cy + sealR + px(0.02, minDim);
        const hereLen = px(0.015, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, hereY);
        ctx.lineTo(cx, hereY + hereLen);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, hereY + hereLen + px(0.003, minDim), px(0.003, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
