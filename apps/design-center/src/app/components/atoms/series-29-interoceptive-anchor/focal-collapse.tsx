/**
 * ATOM 285: THE FOCAL COLLAPSE ENGINE
 * ======================================
 * Series 29 — Interoceptive Anchor · Position 5
 *
 * Overwhelm = aperture too wide. Pinch the world down to a
 * single safe 1-inch circle of focus. Everything outside
 * the aperture dissolves into dark stillness.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Overwhelm chaos is rendered as chaotic, overlapping contour lines
 *   - As aperture contracts, contours outside go dark/scattered
 *   - Inside the aperture: clean Chladni resonance pattern emerges
 *   - Teaches: narrow your attention = find the signal in the noise
 *
 * PHYSICS:
 *   - Screen filled with chaotic noise particles (overwhelm)
 *   - Hold contracts aperture from full to tiny focus circle
 *   - Outside aperture: heavy vignette + noise contours
 *   - Inside aperture: serene Chladni pattern + calm glow
 *   - 8 layers: chaos contours, Chladni calm zone, vignette overlay,
 *     noise particles, aperture ring + iris, calm center glow,
 *     specular + crosshair, completion seal
 *   - Breath couples to: aperture micro-breathing, glow warmth, contour drift
 *
 * INTERACTION:
 *   Hold → aperture contracts (hold_start, step_advance)
 *   Release → aperture slowly expands
 *   Fully contracted → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static small aperture with calm center
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

/** Maximum aperture (nearly full viewport) */
const APERTURE_MAX = 0.88;
/** Minimum aperture (tiny focus point) */
const APERTURE_MIN = 0.06;
/** Aperture contraction speed per frame when holding */
const CONTRACT_SPEED = 0.003;
/** Aperture expansion speed when released */
const EXPAND_SPEED = 0.001;
/** Number of noise particles (overwhelm) */
const NOISE_COUNT = 140;
/** Noise particle drift speed */
const NOISE_SPEED = 0.002;
/** Calm core radius when fully focused */
const CALM_CORE_R = 0.05;
/** Vignette softness (transition width) */
const VIGNETTE_SOFTNESS = 0.15;
/** Glow layers for calm center */
const CALM_GLOW_LAYERS = 5;
/** Chaos contour ring count (outside aperture) */
const CHAOS_CONTOUR_COUNT = 8;
/** Chladni resolution for calm zone */
const CHLADNI_RES = 20;
/** Chladni threshold */
const CHLADNI_THRESH = 0.16;
/** Chladni dot radius */
const CHLADNI_DOT = 0.0025;
/** Iris blade count for aperture edge */
const IRIS_BLADES = 8;
/** Breath aperture micro-modulation */
const BREATH_APERTURE = 0.005;
/** Breath glow warmth coupling */
const BREATH_WARMTH = 0.06;
/** Specular offset fraction */
const SPECULAR_OFFSET = 0.22;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Chaotic noise particle */
interface NoiseParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  phase: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw chaotic overlapping contour lines OUTSIDE the aperture.
 * These represent overwhelm — the noise of too-wide attention.
 */
function drawChaosContours(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, w: number, h: number, minDim: number,
  apertureR: number, rgb: RGB, entrance: number,
  frame: number, apertureFrac: number,
): void {
  // Multiple off-center contour sources to create chaos
  const sources = [
    { x: cx * 0.6, y: cy * 0.4 },
    { x: cx * 1.4, y: cy * 0.6 },
    { x: cx * 0.8, y: cy * 1.5 },
    { x: cx * 1.2, y: cy * 1.3 },
  ];

  for (const src of sources) {
    for (let i = 0; i < CHAOS_CONTOUR_COUNT; i++) {
      const baseR = px(0.04 * (i + 1), minDim);
      const wobble = Math.sin(frame * 0.004 + i * 0.8 + src.x * 0.01) * px(0.01, minDim);
      const r = baseR + wobble;

      // Only draw portions outside aperture
      const distFromCenter = Math.hypot(src.x - cx, src.y - cy);
      if (distFromCenter + r < apertureR * 0.7) continue;

      const alpha = ALPHA.atmosphere.max * apertureFrac * 0.2 *
        (1 - i / CHAOS_CONTOUR_COUNT) * entrance;

      ctx.beginPath();
      const steps = 32;
      for (let a = 0; a <= steps; a++) {
        const angle = (a / steps) * Math.PI * 2;
        const w2 = 1 + 0.12 * Math.sin(angle * 5 + i * 0.7 + frame * 0.006);
        const px2 = src.x + Math.cos(angle) * r * w2;
        const py2 = src.y + Math.sin(angle) * r * w2;
        if (a === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(rgb, alpha);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();
    }
  }
}

/**
 * Draw Chladni pattern INSIDE the aperture — the calm signal.
 */
function drawCalmChladni(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  apertureR: number, rgb: RGB, entrance: number,
  focusFrac: number, frame: number,
): void {
  if (focusFrac < 0.3) return;
  const vis = (focusFrac - 0.3) / 0.7;
  const n = 3; const m = 5;
  const dotR = px(CHLADNI_DOT, minDim);
  const fieldR = apertureR * 0.85;

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES - 1)) * 2 - 1;
      if (nx * nx + ny * ny > 1) continue;

      const val = Math.abs(
        Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny)
        - Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny)
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

/**
 * Draw iris-blade aperture edge for elegant aperture visualization.
 */
function drawIrisEdge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, apertureR: number, minDim: number,
  rgb: RGB, entrance: number, focusFrac: number,
): void {
  if (focusFrac < 0.1) return;
  const bladeLen = apertureR * 0.3 * focusFrac;
  for (let i = 0; i < IRIS_BLADES; i++) {
    const angle = (i / IRIS_BLADES) * Math.PI * 2;
    const bx = cx + Math.cos(angle) * apertureR;
    const by = cy + Math.sin(angle) * apertureR;
    const innerAngle = angle + 0.3 * focusFrac;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(
      bx + Math.cos(innerAngle + Math.PI * 0.6) * bladeLen,
      by + Math.sin(innerAngle + Math.PI * 0.6) * bladeLen
    );
    ctx.lineTo(
      bx + Math.cos(innerAngle - Math.PI * 0.6) * bladeLen,
      by + Math.sin(innerAngle - Math.PI * 0.6) * bladeLen
    );
    ctx.closePath();
    ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.03 * focusFrac * entrance);
    ctx.fill();
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function FocalCollapseAtom({
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
    aperture: APERTURE_MAX,
    holding: false,
    holdNotified: false,
    noise: Array.from({ length: NOISE_COUNT }, (): NoiseParticle => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * NOISE_SPEED,
      vy: (Math.random() - 0.5) * NOISE_SPEED,
      size: 0.002 + Math.random() * 0.005,
      phase: Math.random() * Math.PI * 2,
    })),
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

      if (p.reducedMotion) { s.aperture = APERTURE_MIN; s.completed = true; }
      if (p.phase === 'resolve') { s.aperture = APERTURE_MIN; }

      // ═══════════════════════════════════════════════════════════════
      // APERTURE PHYSICS
      // ═══════════════════════════════════════════════════════════════
      const active = s.holding || p.phase === 'resolve';
      if (active && !s.completed) {
        s.aperture = Math.max(APERTURE_MIN, s.aperture - CONTRACT_SPEED * ms);
        if (s.aperture < 0.3 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }
        if (s.aperture <= APERTURE_MIN && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      } else if (!s.completed) {
        s.aperture = Math.min(APERTURE_MAX, s.aperture + EXPAND_SPEED * ms);
      }

      // Breath modulation on small aperture
      const breathMod = s.aperture < 0.15
        ? p.breathAmplitude * BREATH_APERTURE : 0;
      const effectiveAperture = s.aperture + breathMod;
      const focusFrac = 1 - (effectiveAperture - APERTURE_MIN) / (APERTURE_MAX - APERTURE_MIN);
      const apertureR = effectiveAperture * minDim * 0.5;
      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb,
        p.breathAmplitude * BREATH_WARMTH);

      cb.onStateChange?.(s.completed ? 1 : focusFrac);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Chaos contour lines (outside aperture)
      // ═══════════════════════════════════════════════════════════════
      drawChaosContours(ctx, cx, cy, w, h, minDim, apertureR,
        s.accentRgb, entrance, s.frameCount, effectiveAperture);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni calm zone (inside aperture)
      // ═══════════════════════════════════════════════════════════════
      drawCalmChladni(ctx, cx, cy, minDim, apertureR, warmRgb,
        entrance, focusFrac, s.frameCount);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Vignette overlay (darkens outside aperture)
      // ═══════════════════════════════════════════════════════════════
      const outerR = apertureR + apertureR * VIGNETTE_SOFTNESS;
      const vigGrad = ctx.createRadialGradient(cx, cy, apertureR * 0.85, cx, cy, outerR * 2.5);
      vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vigGrad.addColorStop(0.2, rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance));
      vigGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.07 * entrance));
      vigGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
      vigGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.14 * entrance));
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Noise particles (overwhelm particles outside aperture)
      // ═══════════════════════════════════════════════════════════════
      for (const n of s.noise) {
        n.x += n.vx * ms;
        n.y += n.vy * ms;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;

        const nx = n.x * w;
        const ny = n.y * h;
        const dist = Math.hypot(nx - cx, ny - cy);

        if (dist > apertureR * 0.75) {
          const nSize = px(n.size, minDim);
          const fadeIn = Math.min(1, (dist - apertureR * 0.75) / (apertureR * VIGNETTE_SOFTNESS));
          // Particle glow
          const glowR = nSize * 2;
          const pg = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowR);
          pg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.06 * fadeIn * entrance));
          pg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = pg;
          ctx.fillRect(nx - glowR, ny - glowR, glowR * 2, glowR * 2);
          // Particle body
          ctx.fillStyle = rgba(s.accentRgb,
            ALPHA.content.max * 0.1 * fadeIn * entrance);
          ctx.fillRect(nx - nSize / 2, ny - nSize / 2, nSize, nSize);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Aperture ring + iris blades
      // ═══════════════════════════════════════════════════════════════
      // Main aperture ring
      ctx.beginPath();
      ctx.arc(cx, cy, apertureR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb,
        ALPHA.content.max * (0.06 + focusFrac * 0.18) * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Iris blades
      drawIrisEdge(ctx, cx, cy, apertureR, minDim, s.primaryRgb, entrance, focusFrac);

      // Aperture ring glow (Fresnel edge)
      if (focusFrac > 0.3) {
        const ringGlowR = px(0.015, minDim);
        const rg = ctx.createRadialGradient(cx, cy, apertureR - ringGlowR, cx, cy, apertureR + ringGlowR);
        rg.addColorStop(0, 'rgba(0,0,0,0)');
        rg.addColorStop(0.4, rgba(warmRgb, ALPHA.glow.max * 0.04 * focusFrac * entrance));
        rg.addColorStop(0.6, rgba(warmRgb, ALPHA.glow.max * 0.06 * focusFrac * entrance));
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(cx - apertureR - ringGlowR, cy - apertureR - ringGlowR,
          (apertureR + ringGlowR) * 2, (apertureR + ringGlowR) * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Calm center glow (5-layer, 5-stop)
      // ═══════════════════════════════════════════════════════════════
      const calmR = px(CALM_CORE_R * (1 + focusFrac * 2.5), minDim);
      for (let i = CALM_GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = calmR * (1.5 + i * 1.8);
        const gA = ALPHA.glow.max * 0.1 * focusFrac * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(warmRgb, gA));
        gg.addColorStop(0.2, rgba(warmRgb, gA * 0.6));
        gg.addColorStop(0.5, rgba(s.primaryRgb, gA * 0.2));
        gg.addColorStop(0.8, rgba(s.primaryRgb, gA * 0.04));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // Center body dot (grows with focus)
      const dotR = px(0.005 + focusFrac * 0.015, minDim);
      const dotG = ctx.createRadialGradient(cx, cy, 0, cx, cy, dotR);
      const dotA = ALPHA.content.max * (0.2 + focusFrac * 0.5) * entrance;
      dotG.addColorStop(0, rgba(lerpColor(warmRgb, [255, 255, 255] as unknown as RGB, 0.15), dotA));
      dotG.addColorStop(0.4, rgba(warmRgb, dotA * 0.7));
      dotG.addColorStop(0.8, rgba(s.primaryRgb, dotA * 0.2));
      dotG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = dotG;
      ctx.beginPath();
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Specular + focus crosshair
      // ═══════════════════════════════════════════════════════════════
      // Specular on center dot
      if (dotR > 3) {
        const spX = cx - dotR * SPECULAR_OFFSET;
        const spY = cy - dotR * SPECULAR_OFFSET;
        const spR = dotR * 0.3;
        const sg = ctx.createRadialGradient(spX, spY, 0, spX, spY, spR);
        sg.addColorStop(0, `rgba(255,255,255,${0.3 * focusFrac * entrance})`);
        sg.addColorStop(0.5, `rgba(255,255,255,${0.06 * focusFrac * entrance})`);
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(spX, spY, spR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Focus crosshair (visible at small aperture)
      if (focusFrac > 0.7) {
        const chR = apertureR * 0.8;
        const chAlpha = (focusFrac - 0.7) / 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - chR, cy); ctx.lineTo(cx + chR, cy);
        ctx.moveTo(cx, cy - chR); ctx.lineTo(cx, cy + chR);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.05 * chAlpha * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Completion seal + bloom
      // ═══════════════════════════════════════════════════════════════
      if (s.completed) {
        // Double seal ring
        ctx.beginPath();
        ctx.arc(cx, cy, apertureR * 2, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, apertureR * 2.3, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Peaceful bloom pulses
        for (let i = 0; i < 3; i++) {
          const rPhase = (s.frameCount * 0.005 + i * 0.33) % 1;
          const rR = apertureR * (1.5 + rPhase * 3);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.04 * (1 - rPhase) * entrance);
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
