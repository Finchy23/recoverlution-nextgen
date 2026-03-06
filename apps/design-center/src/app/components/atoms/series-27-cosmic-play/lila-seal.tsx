/**
 * ATOM 270: THE LILA SEAL
 * ==========================
 * Series 27 — Cosmic Play · Position 10 (SERIES CAPSTONE)
 *
 * I am not the dancer, I am the dance. No targets, no score.
 * A ribbon follows your touch — infinite play, pure flow.
 * The ribbon diffracts light like a holographic streamer.
 *
 * SIGNATURE TECHNIQUE: Holographic Diffraction + Generative Art
 *   - Ribbon trail refracts into rainbow spectrum based on curvature
 *   - Speed-dependent holographic shimmer along ribbon width
 *   - Kaleidoscopic mirror symmetry option (4-fold) emerges at flow
 *   - Generative mandala pattern blooms from sustained flow
 *   - Seal stamp is a holographic rosette with diffraction rings
 *
 * PHYSICS:
 *   - Drag anywhere → silken ribbon trail follows finger
 *   - Ribbon rendered as width-varying Bezier strip with perpendicular
 *   - Each segment's color shifts through rainbow based on curvature angle
 *   - Speed affects: width, glow intensity, holographic saturation
 *   - At high flow: 4-fold kaleidoscopic mirror creates mandala patterns
 *   - 300 frames of sustained fluid movement → seal stamps
 *   - 8 rendering layers: kaleidoscope mirror, ribbon shadow, ribbon body,
 *     ribbon edge glow, head particle burst, flow mandala, seal rosette,
 *     progress/prompt
 *   - Breath couples to: ribbon opacity, glow warmth, mandala rotation
 *   - 80+ trail points with physics-based ribbon dynamics
 *
 * INTERACTION:
 *   Drag → draw ribbon (drag_snap, seal_stamp at completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static mandala rosette with holographic seal
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

/** Maximum ribbon trail points */
const RIBBON_MAX = 90;
/** Base ribbon width (fraction of minDim) */
const RIBBON_WIDTH = 0.01;
/** Maximum ribbon width at speed */
const RIBBON_WIDTH_MAX = 0.025;
/** Speed multiplier for width expansion */
const SPEED_WIDTH_FACTOR = 5;
/** Frames of sustained drawing required to seal */
const FLOW_TO_SEAL = 300;
/** Kaleidoscope fold count for mirror symmetry */
const KALEIDO_FOLDS = 4;
/** Flow threshold to activate kaleidoscope (fraction of FLOW_TO_SEAL) */
const KALEIDO_THRESHOLD = 0.3;
/** Number of glow layers for ribbon head */
const HEAD_GLOW_LAYERS = 4;
/** Holographic hue shift speed (per unit curvature) */
const HOLO_CURVATURE_SHIFT = 0.4;
/** Head particle count when actively drawing */
const HEAD_PARTICLES = 12;
/** Head particle max life */
const HEAD_PARTICLE_LIFE = 25;
/** Seal rosette ring count */
const SEAL_RINGS = 5;
/** Seal rosette petal count */
const SEAL_PETALS = 12;
/** Seal base radius (fraction of minDim) */
const SEAL_R = SIZE.md * 0.7;
/** Ribbon edge glow width multiplier */
const EDGE_GLOW_MUL = 2.5;
/** Breath ribbon opacity modulation */
const BREATH_OPACITY = 0.12;
/** Breath glow warmth modulation */
const BREATH_WARMTH = 0.06;
/** Breath mandala rotation modulation */
const BREATH_ROTATION = 0.002;
/** Shadow offset fraction */
const SHADOW_OFFSET = 0.003;
/** Specular dot on seal */
const SEAL_SPECULAR_R = 0.012;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** A point on the ribbon trail with physics data */
interface RibbonPoint {
  x: number;
  y: number;
  speed: number;
  curvature: number;
}

/** Particle emitted from ribbon head */
interface HeadParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Hue (0–1) → RGB for holographic rainbow.
 */
function hueToRgb(hue: number): RGB {
  const h = ((hue % 1) + 1) % 1;
  const c = 0.7;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = 0.25;
  let r = 0, g = 0, b = 0;
  if (h < 1/6)      { r = c; g = x; }
  else if (h < 2/6) { r = x; g = c; }
  else if (h < 3/6) { g = c; b = x; }
  else if (h < 4/6) { g = x; b = c; }
  else if (h < 5/6) { r = x; b = c; }
  else               { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)] as unknown as RGB;
}

/**
 * Calculate curvature between three consecutive points.
 * Returns signed curvature value for hue mapping.
 */
function calcCurvature(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number,
): number {
  const d1x = bx - ax, d1y = by - ay;
  const d2x = cx - bx, d2y = cy - by;
  const cross = d1x * d2y - d1y * d2x;
  const len1 = Math.hypot(d1x, d1y);
  const len2 = Math.hypot(d2x, d2y);
  if (len1 < 0.0001 || len2 < 0.0001) return 0;
  return cross / (len1 * len2);
}

/**
 * Draw the holographic seal rosette (completion stamp).
 */
function drawSealRosette(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number, time: number,
  breathAmp: number,
): void {
  const baseR = px(SEAL_R, minDim);
  const breathRot = breathAmp * BREATH_ROTATION;

  // Concentric diffraction rings
  for (let r = 0; r < SEAL_RINGS; r++) {
    const ringR = baseR * (0.3 + r * 0.18);
    const ringPhase = (time * 0.006 + r * 0.2) % 1;
    const ringHue = (r / SEAL_RINGS + time * 0.002) % 1;
    const ringColor = hueToRgb(ringHue);

    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(ringColor, ALPHA.content.max * 0.06 * entrance * (0.5 + ringPhase * 0.5));
    ctx.lineWidth = px(STROKE.thin, minDim);
    ctx.stroke();
  }

  // Rosette petals with holographic fill
  for (let p = 0; p < SEAL_PETALS; p++) {
    const petalAngle = (p / SEAL_PETALS) * Math.PI * 2 + time * 0.003 + breathRot * 20;
    const petalHue = (p / SEAL_PETALS + time * 0.001) % 1;
    const petalColor = hueToRgb(petalHue);
    const petalR = baseR * 0.5;
    const petalW = baseR * 0.12;

    const tipX = cx + Math.cos(petalAngle) * petalR;
    const tipY = cy + Math.sin(petalAngle) * petalR;
    const perpX = -Math.sin(petalAngle) * petalW;
    const perpY = Math.cos(petalAngle) * petalW;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + perpX, cy + perpY, tipX, tipY);
    ctx.quadraticCurveTo(cx - perpX, cy - perpY, cx, cy);
    ctx.fillStyle = rgba(petalColor, ALPHA.content.max * 0.04 * entrance);
    ctx.fill();
  }

  // Center specular
  const spR = px(SEAL_SPECULAR_R, minDim);
  const sg = ctx.createRadialGradient(cx - spR * 0.3, cy - spR * 0.3, 0, cx, cy, spR);
  sg.addColorStop(0, `rgba(255,255,255,${0.3 * entrance})`);
  sg.addColorStop(0.5, `rgba(255,255,255,${0.06 * entrance})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(cx, cy, spR, 0, Math.PI * 2);
  ctx.fill();

  // Outer emanation rings (breathing)
  for (let e = 0; e < 3; e++) {
    const ePhase = (time * 0.004 + e * 0.33 + breathRot * 30) % 1;
    const eR = baseR * (0.85 + ePhase * 0.35);
    ctx.beginPath();
    ctx.arc(cx, cy, eR, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.025 * (1 - ePhase) * entrance);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function LilaSealAtom({
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
    ribbon: [] as RibbonPoint[],
    headParticles: [] as HeadParticle[],
    dragging: false,
    dragNotified: false,
    flowFrames: 0,
    sealed: false,
    sealGlow: 0,
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
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION — static seal rosette
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        drawSealRosette(ctx, cx, cy, minDim, s.primaryRgb, entrance, 0, 0);
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') s.sealed = true;

      // Flow counting
      if (s.dragging) {
        s.flowFrames += ms;
        if (s.flowFrames >= FLOW_TO_SEAL && !s.sealed) {
          s.sealed = true;
          cb.onHaptic('seal_stamp');
        }
      }

      if (s.sealed) s.sealGlow = Math.min(1, s.sealGlow + 0.004 * ms);
      cb.onStateChange?.(s.sealed ? 0.5 + s.sealGlow * 0.5 : Math.min(0.5, s.flowFrames / FLOW_TO_SEAL * 0.5));

      const breathOpacity = 1 + p.breathAmplitude * BREATH_OPACITY;
      const breathWarmth = p.breathAmplitude * BREATH_WARMTH;
      const flowFrac = Math.min(1, s.flowFrames / FLOW_TO_SEAL);
      const kaleidoActive = flowFrac > KALEIDO_THRESHOLD;
      const kaleidoIntensity = kaleidoActive ? (flowFrac - KALEIDO_THRESHOLD) / (1 - KALEIDO_THRESHOLD) : 0;

      // Head particle physics
      for (let i = s.headParticles.length - 1; i >= 0; i--) {
        const hp = s.headParticles[i];
        hp.x += hp.vx * ms;
        hp.y += hp.vy * ms;
        hp.life -= ms;
        if (hp.life <= 0) s.headParticles.splice(i, 1);
      }

      // Spawn head particles when dragging
      if (s.dragging && s.ribbon.length > 0) {
        const head = s.ribbon[s.ribbon.length - 1];
        if (s.frameCount % 3 === 0) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 0.001 + Math.random() * 0.002;
          s.headParticles.push({
            x: head.x, y: head.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: HEAD_PARTICLE_LIFE,
            hue: s.frameCount * 0.008 + Math.random() * 0.2,
          });
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // RIBBON RENDERING FUNCTION (used for both real + mirrored)
      // ═══════════════════════════════════════════════════════════════
      const drawRibbonPass = (
        offsetX: number, offsetY: number,
        scaleX: number, scaleY: number,
        alphaMul: number,
      ) => {
        if (s.ribbon.length < 3) return;

        // Shadow pass
        for (let i = 2; i < s.ribbon.length; i++) {
          const pt = s.ribbon[i];
          const prev = s.ribbon[i - 1];
          const t = i / s.ribbon.length;
          const ribbonW = px(
            Math.min(RIBBON_WIDTH_MAX, RIBBON_WIDTH * (0.3 + pt.speed * SPEED_WIDTH_FACTOR)) * breathOpacity,
            minDim,
          ) * t;

          const dx = pt.x - prev.x;
          const dy = pt.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len * ribbonW;
          const ny = dx / len * ribbonW;

          const sx1 = (prev.x * scaleX + offsetX) * w + px(SHADOW_OFFSET, minDim);
          const sy1 = (prev.y * scaleY + offsetY) * h + px(SHADOW_OFFSET, minDim);
          const sx2 = (pt.x * scaleX + offsetX) * w + px(SHADOW_OFFSET, minDim);
          const sy2 = (pt.y * scaleY + offsetY) * h + px(SHADOW_OFFSET, minDim);

          ctx.beginPath();
          ctx.moveTo(sx1 + nx, sy1 + ny);
          ctx.lineTo(sx2 + nx, sy2 + ny);
          ctx.lineTo(sx2 - nx, sy2 - ny);
          ctx.lineTo(sx1 - nx, sy1 - ny);
          ctx.closePath();
          ctx.fillStyle = rgba([0, 0, 0] as unknown as RGB, 0.02 * t * entrance * alphaMul);
          ctx.fill();
        }

        // Body pass with holographic color
        for (let i = 2; i < s.ribbon.length; i++) {
          const pt = s.ribbon[i];
          const prev = s.ribbon[i - 1];
          const t = i / s.ribbon.length;
          const ribbonW = px(
            Math.min(RIBBON_WIDTH_MAX, RIBBON_WIDTH * (0.3 + pt.speed * SPEED_WIDTH_FACTOR)) * breathOpacity,
            minDim,
          ) * t;

          const dx = pt.x - prev.x;
          const dy = pt.y - prev.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len * ribbonW;
          const ny = dx / len * ribbonW;

          // Holographic color from curvature
          const segHue = (pt.curvature * HOLO_CURVATURE_SHIFT + t * 0.3 + time * 0.005) % 1;
          const segColor = lerpColor(
            lerpColor(s.primaryRgb, s.accentRgb, pt.speed * 3),
            hueToRgb(segHue),
            0.3 + flowFrac * 0.4,
          );
          const segAlpha = ALPHA.content.max * (0.06 + t * 0.18 + pt.speed * 0.12) * entrance * alphaMul * breathOpacity;

          const px1 = (prev.x * scaleX + offsetX) * w;
          const py1 = (prev.y * scaleY + offsetY) * h;
          const px2 = (pt.x * scaleX + offsetX) * w;
          const py2 = (pt.y * scaleY + offsetY) * h;

          ctx.beginPath();
          ctx.moveTo(px1 + nx, py1 + ny);
          ctx.lineTo(px2 + nx, py2 + ny);
          ctx.lineTo(px2 - nx, py2 - ny);
          ctx.lineTo(px1 - nx, py1 - ny);
          ctx.closePath();
          ctx.fillStyle = rgba(segColor, segAlpha);
          ctx.fill();

          // Edge glow (Fresnel)
          if (t > 0.3 && pt.speed > 0.003) {
            const edgeAlpha = ALPHA.glow.max * 0.04 * t * pt.speed * 20 * entrance * alphaMul;
            const edgeColor = hueToRgb((segHue + 0.15) % 1);
            ctx.beginPath();
            ctx.moveTo(px1 + nx * EDGE_GLOW_MUL, py1 + ny * EDGE_GLOW_MUL);
            ctx.lineTo(px2 + nx * EDGE_GLOW_MUL, py2 + ny * EDGE_GLOW_MUL);
            ctx.strokeStyle = rgba(edgeColor, Math.min(0.08, edgeAlpha));
            ctx.lineWidth = px(STROKE.hairline, minDim);
            ctx.stroke();
          }
        }

        // Center bright line
        if (s.ribbon.length > 2) {
          ctx.beginPath();
          for (let i = 0; i < s.ribbon.length; i++) {
            const pt = s.ribbon[i];
            const rx = (pt.x * scaleX + offsetX) * w;
            const ry = (pt.y * scaleY + offsetY) * h;
            if (i === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance * alphaMul);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      };

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Kaleidoscope mirror reflections (4-fold)
      // ═══════════════════════════════════════════════════════════════
      if (kaleidoActive && s.ribbon.length > 3) {
        // Mirror axes: horizontal, vertical, both
        drawRibbonPass(1, 0, -1, 1, kaleidoIntensity * 0.5);  // Horizontal flip
        drawRibbonPass(0, 1, 1, -1, kaleidoIntensity * 0.5);  // Vertical flip
        drawRibbonPass(1, 1, -1, -1, kaleidoIntensity * 0.3); // Both flip
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYERS 2-4 — Primary ribbon (shadow, body, edge glow)
      // ═══════════════════════════════════════════════════════════════
      drawRibbonPass(0, 0, 1, 1, 1);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Head particle burst (holographic scatter)
      // ═══════════════════════════════════════════════════════════════
      for (const hp of s.headParticles) {
        const life = hp.life / HEAD_PARTICLE_LIFE;
        const pR = px(0.003 * life, minDim);
        if (pR < 0.3) continue;
        const pColor = hueToRgb(hp.hue);
        const ppx = hp.x * w;
        const ppy = hp.y * h;

        // Particle glow
        const pgR = pR * 3;
        const pg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, pgR);
        pg.addColorStop(0, rgba(pColor, ALPHA.glow.max * 0.12 * life * entrance));
        pg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pg;
        ctx.fillRect(ppx - pgR, ppy - pgR, pgR * 2, pgR * 2);

        // Particle body
        ctx.beginPath();
        ctx.arc(ppx, ppy, pR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, ALPHA.content.max * 0.25 * life * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Head glow (when actively drawing)
      // ═══════════════════════════════════════════════════════════════
      if (s.ribbon.length > 0 && s.dragging) {
        const head = s.ribbon[s.ribbon.length - 1];
        const hx = head.x * w;
        const hy = head.y * h;

        for (let gi = HEAD_GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = px(0.018 + gi * 0.012, minDim);
          const gHue = (time * 0.02 + gi * 0.1) % 1;
          const gColor = lerpColor(s.primaryRgb, hueToRgb(gHue), 0.3 + breathWarmth);
          const gA = ALPHA.glow.max * 0.1 * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(hx, hy, 0, hx, hy, gR);
          gg.addColorStop(0, rgba(gColor, gA));
          gg.addColorStop(0.4, rgba(gColor, gA * 0.3));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(hx - gR, hy - gR, gR * 2, gR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Flow mandala (emerges at higher flow)
      // ═══════════════════════════════════════════════════════════════
      if (flowFrac > 0.5) {
        const mandalaIntensity = (flowFrac - 0.5) * 2;
        const mandalaR = px(SIZE.md * 0.4 * mandalaIntensity, minDim);
        const petalCount = 8;

        for (let pi = 0; pi < petalCount; pi++) {
          const angle = (pi / petalCount) * Math.PI * 2 + time * 0.002 + p.breathAmplitude * BREATH_ROTATION * 30;
          const petalHue = (pi / petalCount + time * 0.001) % 1;
          const petalColor = hueToRgb(petalHue);

          const tipX = cx + Math.cos(angle) * mandalaR;
          const tipY = cy + Math.sin(angle) * mandalaR;
          const pW = mandalaR * 0.15;
          const pnx = -Math.sin(angle) * pW;
          const pny = Math.cos(angle) * pW;

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.quadraticCurveTo(cx + pnx, cy + pny, tipX, tipY);
          ctx.quadraticCurveTo(cx - pnx, cy - pny, cx, cy);
          ctx.fillStyle = rgba(petalColor, ALPHA.content.max * 0.03 * mandalaIntensity * entrance);
          ctx.fill();
        }

        // Mandala ring
        ctx.beginPath();
        ctx.arc(cx, cy, mandalaR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * mandalaIntensity * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Seal rosette + progress / prompt
      // ═══════════════════════════════════════════════════════════════
      if (s.sealed) {
        drawSealRosette(ctx, cx, cy, minDim, s.primaryRgb, entrance * s.sealGlow,
          s.frameCount, p.breathAmplitude);
      }

      // Progress ring
      if (!s.sealed && s.flowFrames > 5) {
        const progR = px(0.04, minDim);
        const progAngle = flowFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, h * 0.08, progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // Idle prompt
      if (!s.dragging && !s.sealed && s.ribbon.length === 0) {
        const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.025);
        ctx.beginPath();
        ctx.arc(cx, cy, px(0.06, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * pulse * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.setLineDash([px(0.004, minDim), px(0.008, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Ribbon decay (remove old points when not drawing)
      if (!s.dragging && s.ribbon.length > 0) {
        s.ribbon.shift();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      s.ribbon = [{ x: mx, y: my, speed: 0, curvature: 0 }];
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const last = s.ribbon[s.ribbon.length - 1];
      const speed = last ? Math.hypot(mx - last.x, my - last.y) : 0;

      // Calculate curvature from last 3 points
      let curvature = 0;
      if (s.ribbon.length >= 2) {
        const prev = s.ribbon[s.ribbon.length - 2];
        curvature = calcCurvature(prev.x, prev.y, last.x, last.y, mx, my);
      }

      s.ribbon.push({ x: mx, y: my, speed, curvature });
      if (s.ribbon.length > RIBBON_MAX) s.ribbon.shift();
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
      />
    </div>
  );
}