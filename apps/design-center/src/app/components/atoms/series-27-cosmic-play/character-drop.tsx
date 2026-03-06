/**
 * ATOM 267: THE CHARACTER DROP ENGINE
 * ======================================
 * Series 27 — Cosmic Play · Position 7
 *
 * The curtain drops. Step out of the spotlight into the warm backstage.
 * The performance is over. You can stop performing. The harsh spotlight
 * dissolves into warm holographic amber as the curtain descends.
 *
 * SIGNATURE TECHNIQUE: Holographic Diffraction + Generative Art
 *   - Spotlight rendered with prismatic edge fringing (chromatic aberration)
 *   - Curtain folds shimmer with holographic diffraction as they descend
 *   - Backstage warmth emerges as golden holographic radiance
 *   - Post-curtain: generative light mandala of self-acceptance blooms
 *
 * PHYSICS:
 *   - Harsh white/accent spotlight cone illuminating center stage
 *   - Spotlight has chromatic aberration at edges (RGB split)
 *   - Swipe down → heavy curtain descends with draped fold physics
 *   - Each curtain fold has holographic shimmer based on fold angle
 *   - As curtain covers spotlight: harsh → warm amber backstage glow
 *   - Post-curtain: generative mandala pattern of warm light petals
 *   - 8 rendering layers: spotlight + chromatic edges, backstage glow,
 *     curtain body, curtain folds + holographic shimmer, curtain edge glow,
 *     warmth center orb, acceptance mandala, progress
 *   - Breath couples to: backstage warmth, mandala pulse, curtain shimmer
 *
 * INTERACTION:
 *   Swipe down → drop curtain (swipe_commit → completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Warm backstage state with mandala
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

/** Spotlight radius (fraction of minDim) */
const SPOTLIGHT_R = SIZE.md * 0.65;
/** Curtain descent speed per frame */
const CURTAIN_SPEED = 0.008;
/** Swipe distance threshold to trigger curtain drop */
const SWIPE_THRESHOLD = 0.08;
/** Number of curtain drape fold segments */
const DRAPE_SEGMENTS = 24;
/** Curtain gravity acceleration factor */
const CURTAIN_WEIGHT = 0.003;
/** Breath warmth modulation factor */
const BREATH_WARMTH = 0.2;
/** Breath curtain shimmer modulation */
const BREATH_SHIMMER = 0.05;
/** Breath mandala pulse modulation */
const BREATH_MANDALA = 0.003;
/** Number of backstage glow layers */
const GLOW_LAYERS = 5;
/** Warm amber target color */
const WARM_AMBER: RGB = [200, 160, 100];
/** Chromatic aberration offset (px fraction) */
const CHROMA_OFFSET = 0.004;
/** Number of mandala petals */
const MANDALA_PETALS = 10;
/** Mandala radius (fraction of minDim) */
const MANDALA_R = SIZE.md * 0.5;
/** Holographic fold shimmer segments */
const HOLO_FOLD_COUNT = 8;
/** Specular highlight size for warmth orb */
const WARMTH_SPECULAR_R = 0.015;
/** Warmth orb radius (fraction of minDim) */
const WARMTH_ORB_R = 0.025;
/** Curtain bottom edge glow height */
const EDGE_GLOW_H = 0.025;

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Hue (0–1) → RGB for holographic effects.
 */
function hueToRgb(hue: number): RGB {
  const h = ((hue % 1) + 1) % 1;
  const c = 0.55;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = 0.35;
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
 * Draw warm backstage acceptance mandala.
 */
function drawAcceptanceMandala(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  warmColor: RGB, entrance: number, time: number,
  intensity: number, breathAmp: number,
): void {
  const baseR = px(MANDALA_R, minDim) * intensity;

  // Mandala petals
  for (let i = 0; i < MANDALA_PETALS; i++) {
    const angle = (i / MANDALA_PETALS) * Math.PI * 2 + time * 0.002 + breathAmp * BREATH_MANDALA * 40;
    const petalHue = (i / MANDALA_PETALS * 0.15 + 0.08 + time * 0.0005) % 1;
    const petalColor = lerpColor(warmColor, hueToRgb(petalHue), 0.25);
    const petalLen = baseR * (0.6 + Math.sin(time * 0.003 + i) * 0.15);
    const petalW = baseR * 0.12;
    const perpX = -Math.sin(angle) * petalW;
    const perpY = Math.cos(angle) * petalW;
    const tipX = cx + Math.cos(angle) * petalLen;
    const tipY = cy + Math.sin(angle) * petalLen;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + perpX * 1.5, cy + perpY * 1.5, tipX, tipY);
    ctx.quadraticCurveTo(cx - perpX * 1.5, cy - perpY * 1.5, cx, cy);
    ctx.fillStyle = rgba(petalColor, ALPHA.content.max * 0.035 * intensity * entrance);
    ctx.fill();
  }

  // Concentric rings
  for (let r = 0; r < 3; r++) {
    const ringR = baseR * (0.3 + r * 0.25);
    const ringPhase = (time * 0.004 + r * 0.33) % 1;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(warmColor, ALPHA.content.max * 0.03 * (1 - ringPhase * 0.5) * intensity * entrance);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function CharacterDropAtom({
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
    curtainY: 0,
    dropping: false,
    swipeStartY: 0,
    completed: false,
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

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION — warm backstage with mandala
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        const warmColor = lerpColor(s.primaryRgb, WARM_AMBER, 0.3);
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = px(SIZE.xl * (0.3 + gi * 0.15), minDim);
          const gA = ALPHA.glow.max * 0.06 * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(warmColor, gA));
          gg.addColorStop(0.4, rgba(warmColor, gA * 0.3));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        drawAcceptanceMandala(ctx, cx, cy, minDim, warmColor, entrance, 0, 1, 0);
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.curtainY = 1; s.completed = true; }

      // ═══════════════════════════════════════════════════════════════
      // CURTAIN PHYSICS
      // ═══════════════════════════════════════════════════════════════
      if (s.dropping) {
        s.curtainY = Math.min(1, s.curtainY + CURTAIN_SPEED * ms + s.curtainY * CURTAIN_WEIGHT * ms);
      }
      if (s.curtainY >= 0.95 && !s.completed) {
        s.completed = true;
        s.curtainY = 1;
        cb.onHaptic('completion');
      }
      if (s.completed) s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : s.curtainY * 0.5);

      const warmth = s.curtainY * (1 + breath * BREATH_WARMTH);
      const warmColor = lerpColor(s.primaryRgb, WARM_AMBER, warmth * 0.3);
      const breathShimmer = breath * BREATH_SHIMMER;

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Spotlight with chromatic aberration
      // ═══════════════════════════════════════════════════════════════
      const spotlightIntensity = 1 - s.curtainY;
      if (spotlightIntensity > 0.01) {
        const spotR = px(SPOTLIGHT_R, minDim);

        // RGB-split spotlight edges (chromatic aberration)
        const chromOff = px(CHROMA_OFFSET * spotlightIntensity, minDim);

        // Red channel (slightly left)
        const rg = ctx.createRadialGradient(cx - chromOff, cy, spotR * 0.05, cx - chromOff, cy, spotR);
        rg.addColorStop(0, rgba([255, 100, 100] as unknown as RGB, ALPHA.glow.max * 0.04 * spotlightIntensity * entrance));
        rg.addColorStop(0.7, rgba([255, 100, 100] as unknown as RGB, ALPHA.glow.max * 0.01 * spotlightIntensity * entrance));
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(cx - spotR - chromOff, cy - spotR, spotR * 2, spotR * 2);

        // Blue channel (slightly right)
        const bg = ctx.createRadialGradient(cx + chromOff, cy, spotR * 0.05, cx + chromOff, cy, spotR);
        bg.addColorStop(0, rgba([100, 100, 255] as unknown as RGB, ALPHA.glow.max * 0.04 * spotlightIntensity * entrance));
        bg.addColorStop(0.7, rgba([100, 100, 255] as unknown as RGB, ALPHA.glow.max * 0.01 * spotlightIntensity * entrance));
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(cx - spotR + chromOff, cy - spotR, spotR * 2, spotR * 2);

        // Main spotlight cone
        const spotGrad = ctx.createRadialGradient(cx, cy - px(0.05, minDim), spotR * 0.08, cx, cy, spotR);
        spotGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.15 * spotlightIntensity * entrance));
        spotGrad.addColorStop(0.4, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * spotlightIntensity * entrance));
        spotGrad.addColorStop(0.7, rgba(s.accentRgb, ALPHA.glow.max * 0.02 * spotlightIntensity * entrance));
        spotGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(cx - spotR, cy - spotR, spotR * 2, spotR * 2);

        // Spotlight edge ring
        ctx.beginPath();
        ctx.arc(cx, cy, spotR * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.04 * spotlightIntensity * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Inner ring
        ctx.beginPath();
        ctx.arc(cx, cy, spotR * 0.4, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.02 * spotlightIntensity * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Warm backstage glow (fades in as curtain descends)
      // ═══════════════════════════════════════════════════════════════
      if (s.curtainY > 0.1) {
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = px(SIZE.xl * (0.25 + gi * 0.15), minDim);
          const gA = ALPHA.glow.max * 0.06 * s.curtainY * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(warmColor, gA));
          gg.addColorStop(0.25, rgba(warmColor, gA * 0.5));
          gg.addColorStop(0.55, rgba(warmColor, gA * 0.12));
          gg.addColorStop(0.85, rgba(s.primaryRgb, gA * 0.03));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Curtain body (gradient fill)
      // ═══════════════════════════════════════════════════════════════
      if (s.curtainY > 0.01) {
        const curtainBottom = s.curtainY * h;

        // Main curtain fill
        const curtainGrad = ctx.createLinearGradient(0, 0, 0, curtainBottom);
        curtainGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.09 * entrance));
        curtainGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
        curtainGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance));
        curtainGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.02 * entrance));
        ctx.fillStyle = curtainGrad;
        ctx.fillRect(0, 0, w, curtainBottom);

        // ═══════════════════════════════════════════════════════════
        // LAYER 4 — Curtain fold lines with holographic shimmer
        // ═══════════════════════════════════════════════════════════
        for (let i = 0; i < DRAPE_SEGMENTS; i++) {
          const foldX = (i / DRAPE_SEGMENTS) * w;
          const foldIntensity = Math.sin((i / DRAPE_SEGMENTS) * Math.PI * 7) * 0.5 + 0.5;
          const foldWobble = Math.sin(time * 0.015 + i * 0.8) * px(0.003, minDim) * s.curtainY;

          // Fold line
          ctx.beginPath();
          ctx.moveTo(foldX + foldWobble, 0);
          ctx.lineTo(foldX + foldWobble * 2, curtainBottom);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.025 * foldIntensity * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();

          // Holographic shimmer on every other fold
          if (i % 3 === 0 && s.curtainY > 0.3) {
            const holoFoldHue = (i / DRAPE_SEGMENTS + time * 0.001 + breathShimmer * 3) % 1;
            const holoColor = hueToRgb(holoFoldHue);
            ctx.beginPath();
            ctx.moveTo(foldX + foldWobble, 0);
            ctx.lineTo(foldX + foldWobble * 2, curtainBottom);
            ctx.strokeStyle = rgba(holoColor, ALPHA.content.max * 0.015 * foldIntensity * s.curtainY * entrance);
            ctx.lineWidth = px(STROKE.thin, minDim);
            ctx.stroke();
          }
        }

        // ═══════════════════════════════════════════════════════════
        // LAYER 5 — Curtain bottom edge with prismatic glow
        // ═══════════════════════════════════════════════════════════

        // Heavy bottom edge
        ctx.beginPath();
        ctx.moveTo(0, curtainBottom);
        ctx.lineTo(w, curtainBottom);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.07 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Prismatic edge glow (warm amber + rainbow fringe)
        const edgeH = px(EDGE_GLOW_H, minDim);
        const eg = ctx.createLinearGradient(0, curtainBottom, 0, curtainBottom + edgeH);
        eg.addColorStop(0, rgba(warmColor, ALPHA.glow.max * 0.06 * s.curtainY * entrance));
        eg.addColorStop(0.3, rgba(warmColor, ALPHA.glow.max * 0.03 * s.curtainY * entrance));
        eg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = eg;
        ctx.fillRect(0, curtainBottom, w, edgeH);

        // Rainbow fringe line along edge
        if (s.curtainY > 0.4) {
          for (let fi = 0; fi < HOLO_FOLD_COUNT; fi++) {
            const fiFrac = fi / HOLO_FOLD_COUNT;
            const fiHue = (fiFrac + time * 0.002) % 1;
            const fiColor = hueToRgb(fiHue);
            const fiX1 = fiFrac * w;
            const fiX2 = (fiFrac + 1 / HOLO_FOLD_COUNT) * w;

            ctx.beginPath();
            ctx.moveTo(fiX1, curtainBottom + px(0.002, minDim));
            ctx.lineTo(fiX2, curtainBottom + px(0.002, minDim));
            ctx.strokeStyle = rgba(fiColor, ALPHA.content.max * 0.04 * s.curtainY * entrance);
            ctx.lineWidth = px(STROKE.thin, minDim);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Warmth center orb (backstage beacon)
      // ═══════════════════════════════════════════════════════════════
      if (s.curtainY > 0.5) {
        const orbIntensity = (s.curtainY - 0.5) * 2;
        const orbR = px(WARMTH_ORB_R * orbIntensity, minDim);

        if (orbR > 0.5) {
          // Orb body (5-stop)
          const og = ctx.createRadialGradient(
            cx - orbR * 0.15, cy - orbR * 0.15, orbR * 0.05,
            cx, cy, orbR,
          );
          og.addColorStop(0, rgba(lerpColor(warmColor, [255, 255, 255] as unknown as RGB, 0.35),
            ALPHA.content.max * 0.4 * orbIntensity * entrance));
          og.addColorStop(0.3, rgba(warmColor, ALPHA.content.max * 0.3 * orbIntensity * entrance));
          og.addColorStop(0.6, rgba(warmColor, ALPHA.content.max * 0.15 * orbIntensity * entrance));
          og.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance));
          og.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.beginPath();
          ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
          ctx.fillStyle = og;
          ctx.fill();

          // Specular
          const spR = px(WARMTH_SPECULAR_R * orbIntensity, minDim);
          const sp = ctx.createRadialGradient(cx - spR * 0.3, cy - spR * 0.3, 0, cx, cy, spR);
          sp.addColorStop(0, `rgba(255,255,255,${0.3 * orbIntensity * entrance})`);
          sp.addColorStop(0.5, `rgba(255,255,255,${0.06 * orbIntensity * entrance})`);
          sp.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sp;
          ctx.beginPath();
          ctx.arc(cx, cy, spR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Acceptance mandala (post-completion bloom)
      // ═══════════════════════════════════════════════════════════════
      if (s.completed && s.completionGlow > 0.1) {
        drawAcceptanceMandala(ctx, cx, cy, minDim, warmColor, entrance,
          s.frameCount, s.completionGlow, breath);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Progress + swipe prompt
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed && s.curtainY > 0.02) {
        const progR = px(0.04, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.4, minDim), progR, -Math.PI / 2, -Math.PI / 2 + s.curtainY * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // Swipe down prompt
      if (!s.dropping && !s.completed) {
        const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.025);
        // Down arrow hint
        const arrowY = cy + px(0.15, minDim);
        const arrowH = px(0.02, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, arrowY);
        ctx.lineTo(cx - arrowH, arrowY - arrowH);
        ctx.moveTo(cx, arrowY);
        ctx.lineTo(cx + arrowH, arrowY - arrowH);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * pulse * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.swipeStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const dy = (e.clientY - s.swipeStartY) / rect.height;
      if (dy > SWIPE_THRESHOLD && !s.dropping) {
        s.dropping = true;
        callbacksRef.current.onHaptic('swipe_commit');
      }
    };
    const onUp = (e: PointerEvent) => {
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }}
      />
    </div>
  );
}
