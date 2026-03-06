/**
 * ATOM 256: THE RESUME BURNER ENGINE
 * =====================================
 * Series 26 — Identity Decoupling · Position 6
 *
 * You are not your achievements or failures. Burn the resume —
 * find the indestructible diamond beneath.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Resume rendered as SDF rounded rectangle with crisp edges
 *   - Burn progresses as SDF boundary erodes inward with noise
 *   - Ash particles follow SDF contour as they detach
 *   - Diamond revealed beneath has crystalline SDF faceted shape
 *     with impossibly sharp edges (SDF precision showcase)
 *   - SDF morph: document rectangle → diamond polygon → glowing point
 *
 * PHYSICS:
 *   - Resume document (SDF rect) with text lines
 *   - Hold to ignite → burn front crawls inward along SDF contour
 *   - Ash particles scatter on wind vectors
 *   - Diamond emerges from center as document burns away
 *   - 8 render layers: atmosphere, diamond glow, document shadow,
 *     document body, burn edge, ash particles, diamond body, specular
 *
 * INTERACTION:
 *   Hold to burn (hold_start, step_advance, completion)
 *
 * RENDER: Canvas 2D with SDF document erosion + diamond emergence
 * REDUCED MOTION: Diamond fully revealed, glowing
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Document width (fraction of minDim) */
const DOC_W = 0.22;
/** Document height */
const DOC_H = 0.30;
/** Burn rate per frame while holding */
const BURN_RATE = 0.004;
/** Ash particle count spawned per frame during burn */
const ASH_PER_FRAME = 2;
/** Ash particle lifetime */
const ASH_LIFE = 0.9;
/** Ash drift speed */
const ASH_DRIFT = 0.003;
/** Diamond hero radius */
const DIAMOND_R = 0.10;
/** Diamond glow layers */
const GLOW_LAYERS = 6;
/** Burn edge glow color (warm orange) */
const BURN_WARM: RGB = [255, 160, 60];
/** Number of text lines on resume */
const TEXT_LINES = 8;
/** Step threshold for haptic */
const STEP_THRESHOLD = 0.5;
/** Diamond facet count */
const DIAMOND_FACETS = 6;
/** Specular highlight size */
const SPECULAR_R = 0.02;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface AshParticle {
  x: number; y: number; vx: number; vy: number;
  life: number; size: number; rotation: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw the burning SDF document */
function drawDocument(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, burnT: number, entrance: number,
  breathMod: number, frameCount: number,
) {
  if (burnT >= 1) return;

  const docW = px(DOC_W, minDim);
  const docH = px(DOC_H, minDim);
  const remaining = 1 - burnT;

  // ── Document shadow ─────────────────────────────────────────
  const shOff = px(0.006, minDim);
  ctx.fillStyle = rgba(color, ALPHA.glow.min * 0.08 * remaining * entrance);
  ctx.beginPath();
  ctx.roundRect(cx - docW / 2 + shOff, cy - docH / 2 + shOff, docW * remaining, docH, docW * 0.02);
  ctx.fill();

  // ── Document body (SDF rect with eroding edge) ──────────────
  const bodyW = docW * remaining;
  ctx.beginPath();
  ctx.roundRect(cx - docW / 2, cy - docH / 2, bodyW, docH, docW * 0.02);

  const docGrad = ctx.createLinearGradient(cx - docW / 2, cy - docH / 2, cx - docW / 2 + bodyW, cy + docH / 2);
  const docA = ALPHA.content.max * 0.2 * remaining * entrance;
  docGrad.addColorStop(0, rgba(color, docA * 0.9));
  docGrad.addColorStop(0.3, rgba(color, docA * 0.7));
  docGrad.addColorStop(0.7, rgba(color, docA * 0.5));
  docGrad.addColorStop(1, rgba(color, docA * 0.3));
  ctx.fillStyle = docGrad;
  ctx.fill();

  // Document stroke
  ctx.strokeStyle = rgba(color, docA * 0.5);
  ctx.lineWidth = px(STROKE.thin, minDim);
  ctx.stroke();

  // ── Text lines ──────────────────────────────────────────────
  for (let line = 0; line < TEXT_LINES; line++) {
    const lineY = cy - docH / 2 + docH * ((line + 1) / (TEXT_LINES + 1));
    const lineW = bodyW * (0.5 + Math.sin(line * 2.3) * 0.2) * 0.7;
    const lineX = cx - docW / 2 + bodyW * 0.15;

    if (lineX + lineW > cx - docW / 2 + bodyW * 0.9) continue;

    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + lineW, lineY);
    ctx.strokeStyle = rgba(color, docA * 0.2);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }

  // ── Burn edge glow (SDF contour highlight) ──────────────────
  if (burnT > 0.02) {
    const burnX = cx - docW / 2 + bodyW;
    const burnGrad = ctx.createLinearGradient(burnX - px(0.02, minDim), 0, burnX + px(0.01, minDim), 0);
    burnGrad.addColorStop(0, rgba(BURN_WARM, 0));
    burnGrad.addColorStop(0.5, rgba(BURN_WARM, ALPHA.glow.max * 0.2 * entrance));
    burnGrad.addColorStop(0.8, rgba(BURN_WARM, ALPHA.glow.max * 0.35 * entrance));
    burnGrad.addColorStop(1, rgba(BURN_WARM, 0));

    ctx.fillStyle = burnGrad;
    ctx.fillRect(burnX - px(0.02, minDim), cy - docH / 2 - px(0.01, minDim),
      px(0.03, minDim), docH + px(0.02, minDim));

    // Burn edge sparkle particles
    for (let sp = 0; sp < 4; sp++) {
      const spY = cy - docH / 2 + Math.random() * docH;
      const spR = px(0.002, minDim);
      ctx.beginPath();
      ctx.arc(burnX + Math.random() * px(0.008, minDim), spY, spR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(BURN_WARM, ALPHA.content.max * 0.2 * entrance);
      ctx.fill();
    }
  }

  // ── Document specular ───────────────────────────────────────
  const specX = cx - docW / 2 + bodyW * 0.3;
  const specY = cy - docH * 0.2;
  const specR = px(SPECULAR_R * 2, minDim);
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, docA * 0.1));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, specR, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw the emerging diamond with SDF faceted precision */
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, revealT: number, entrance: number,
  breathMod: number, frameCount: number,
) {
  if (revealT < 0.1) return;

  const dR = px(DIAMOND_R * revealT, minDim) * breathMod;
  const time = frameCount * 0.008;

  // ── Diamond glow field ──────────────────────────────────────
  for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
    const gR = dR * (1.8 + revealT * 2.5 + i * 0.8);
    const gA = ALPHA.glow.max * 0.08 * revealT * entrance / (i + 1);
    const warmColor = lerpColor(color, [255, 245, 220] as RGB, revealT * 0.2);
    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
    gg.addColorStop(0, rgba(warmColor, gA * 1.2));
    gg.addColorStop(0.25, rgba(warmColor, gA * 0.5));
    gg.addColorStop(0.6, rgba(color, gA * 0.1));
    gg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
  }

  // ── Diamond body (faceted SDF polygon) ──────────────────────
  ctx.beginPath();
  ctx.moveTo(cx, cy - dR);
  ctx.lineTo(cx + dR * 0.65, cy - dR * 0.18);
  ctx.lineTo(cx + dR * 0.5, cy + dR * 0.6);
  ctx.lineTo(cx, cy + dR * 0.85);
  ctx.lineTo(cx - dR * 0.5, cy + dR * 0.6);
  ctx.lineTo(cx - dR * 0.65, cy - dR * 0.18);
  ctx.closePath();

  const diamondGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, dR);
  const dA = ALPHA.content.max * 0.35 * revealT * entrance;
  diamondGrad.addColorStop(0, rgba([255, 252, 240] as RGB, dA * 0.8));
  diamondGrad.addColorStop(0.3, rgba(color, dA * 0.6));
  diamondGrad.addColorStop(0.7, rgba(color, dA * 0.35));
  diamondGrad.addColorStop(1, rgba(color, dA * 0.15));
  ctx.fillStyle = diamondGrad;
  ctx.fill();

  ctx.strokeStyle = rgba(color, dA * 0.5);
  ctx.lineWidth = px(STROKE.thin, minDim);
  ctx.stroke();

  // ── Facet lines ─────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(cx, cy - dR);
  ctx.lineTo(cx, cy + dR * 0.85);
  ctx.moveTo(cx - dR * 0.65, cy - dR * 0.18);
  ctx.lineTo(cx + dR * 0.65, cy - dR * 0.18);
  ctx.moveTo(cx - dR * 0.5, cy + dR * 0.6);
  ctx.lineTo(cx + dR * 0.5, cy + dR * 0.6);
  ctx.moveTo(cx, cy - dR);
  ctx.lineTo(cx + dR * 0.5, cy + dR * 0.6);
  ctx.moveTo(cx, cy - dR);
  ctx.lineTo(cx - dR * 0.5, cy + dR * 0.6);
  ctx.strokeStyle = rgba(color, dA * 0.08);
  ctx.lineWidth = px(STROKE.hairline, minDim);
  ctx.stroke();

  // ── Inner fire sparkles ─────────────────────────────────────
  for (let i = 0; i < 5; i++) {
    const sx = cx + Math.cos(time + i * 1.4) * dR * 0.3;
    const sy = cy + Math.sin(time * 0.8 + i * 1.9) * dR * 0.25;
    const sR = px(0.003, minDim) * revealT;
    ctx.beginPath();
    ctx.arc(sx, sy, sR, 0, Math.PI * 2);
    ctx.fillStyle = rgba([255, 250, 230] as RGB, ALPHA.content.max * 0.15 * revealT * entrance);
    ctx.fill();
  }

  // ── Diamond specular ────────────────────────────────────────
  const specX = cx - dR * 0.2;
  const specY = cy - dR * 0.3;
  const specR = dR * 0.2;
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, dA * 0.25));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, specR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ResumeBurnerAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    burnProgress: 0,
    holding: false, holdNotified: false,
    ashParticles: [] as AshParticle[],
    stepNotified: false, completed: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.burnProgress = 1; s.completed = true;
      }

      const breathMod = 1 + p.breathAmplitude * 0.04;

      // Burn physics
      if (s.holding && !s.completed) {
        s.burnProgress = Math.min(1, s.burnProgress + BURN_RATE * ms);

        // Spawn ash
        if (s.frameCount % 2 === 0) {
          const docW = px(DOC_W, minDim);
          const docH = px(DOC_H, minDim);
          const burnX = cx - docW / 2 + docW * (1 - s.burnProgress);
          for (let a = 0; a < ASH_PER_FRAME; a++) {
            s.ashParticles.push({
              x: burnX / w, y: (cy - docH / 2 + Math.random() * docH) / h,
              vx: (Math.random() * 0.5 + 0.5) * ASH_DRIFT,
              vy: (Math.random() - 0.6) * ASH_DRIFT,
              life: ASH_LIFE, size: 0.002 + Math.random() * 0.004,
              rotation: Math.random() * Math.PI * 2,
            });
          }
        }
      }

      // Ash physics
      for (let i = s.ashParticles.length - 1; i >= 0; i--) {
        const a = s.ashParticles[i];
        a.x += a.vx * ms; a.y += a.vy * ms;
        a.vy += 0.00002 * ms;
        a.rotation += 0.02 * ms;
        a.life -= 0.006 * ms;
        if (a.life <= 0) s.ashParticles.splice(i, 1);
      }

      // Haptics
      if (s.burnProgress >= STEP_THRESHOLD && !s.stepNotified) {
        s.stepNotified = true; cb.onHaptic('step_advance');
      }
      if (s.burnProgress >= 1 && !s.completed) {
        s.completed = true; cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.burnProgress);

      const diamondAlpha = Math.max(0, (s.burnProgress - 0.3) / 0.7);

      // ═══════════════════════════════════════════════════════
      // LAYER 1-2: Diamond glow + body
      // ═══════════════════════════════════════════════════════
      drawDiamond(ctx, cx, cy, minDim, s.primaryRgb, diamondAlpha, entrance, breathMod, s.frameCount);

      // ═══════════════════════════════════════════════════════
      // LAYER 3-4: Burning document
      // ═══════════════════════════════════════════════════════
      drawDocument(ctx, cx, cy, minDim, s.accentRgb, s.burnProgress, entrance, breathMod, s.frameCount);

      // ═══════════════════════════════════════════════════════
      // LAYER 5: Ash particles
      // ═══════════════════════════════════════════════════════
      for (const a of s.ashParticles) {
        ctx.save();
        ctx.translate(a.x * w, a.y * h);
        ctx.rotate(a.rotation);
        const aR = px(a.size, minDim);
        // Ash glow
        const ashGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, aR * 2);
        ashGrad.addColorStop(0, rgba(BURN_WARM, ALPHA.content.max * 0.08 * a.life * entrance));
        ashGrad.addColorStop(1, rgba(BURN_WARM, 0));
        ctx.fillStyle = ashGrad;
        ctx.fillRect(-aR * 2, -aR * 2, aR * 4, aR * 4);
        // Ash body
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * a.life * entrance);
        ctx.fillRect(-aR, -aR * 0.5, aR * 2, aR);
        ctx.restore();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 6: Progress ring
      // ═══════════════════════════════════════════════════════
      if (!s.completed && s.burnProgress > 0) {
        const pR = px(0.36, minDim);
        const pAngle = s.burnProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pR, -Math.PI / 2, -Math.PI / 2 + pAngle);
        ctx.strokeStyle = rgba(BURN_WARM, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = () => {
      stateRef.current.holding = true;
      if (!stateRef.current.holdNotified) {
        stateRef.current.holdNotified = true;
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
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'pointer',
      }} />
    </div>
  );
}
