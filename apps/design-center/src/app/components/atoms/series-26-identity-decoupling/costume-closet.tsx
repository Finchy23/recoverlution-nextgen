/**
 * ATOM 254: THE COSTUME CLOSET ENGINE
 * ======================================
 * Series 26 — Identity Decoupling · Position 4
 *
 * Your personality is a suit for this incarnation. Slide the
 * cloak off the avatar — reveal the glowing silhouette of pure potential.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Cloak rendered as SDF shape with complex wavy boundary
 *   - As cloak slides off, its SDF boundary dissolves into soft noise
 *   - Revealed figure morphs from angular SDF silhouette → smooth
 *     luminous SDF circle with soft procedural edges
 *   - SDF blend zone between cloak and figure creates seamless
 *     "peeling" visual at the transition boundary
 *
 * PHYSICS:
 *   - Central avatar figure wearing heavy patterned cloak
 *   - Cloak rendered as cloth segments with wave physics
 *   - Drag right → cloak slides off, SDF boundary dissolves
 *   - Ghost silhouette lingers at previous position
 *   - Revealed figure radiates outward light rays
 *   - 8 render layers: atmosphere, figure glow, figure body,
 *     hanger rail, ghost trail, cloak body, cloak SDF edge, rays
 *
 * INTERACTION:
 *   Drag right to slide cloak off (drag_snap, completion)
 *
 * RENDER: Canvas 2D with SDF cloth dissolution + luminous reveal
 * REDUCED MOTION: Cloak removed, glowing silhouette visible
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

/** Number of cloth segments along cloak edge */
const CLOAK_SEGMENTS = 32;
/** Avatar height (fraction of minDim) */
const AVATAR_HEIGHT = 0.34;
/** Avatar width */
const AVATAR_WIDTH = 0.09;
/** Cloth wave propagation speed */
const WAVE_SPEED = 0.022;
/** Cloth wave amplitude */
const WAVE_AMP = 0.005;
/** Number of glow layers */
const GLOW_LAYERS = 6;
/** Ghost trail decay rate */
const GHOST_DECAY = 0.988;
/** Radial light ray count */
const RAY_COUNT = 14;
/** Cloak pattern line count */
const PATTERN_LINES = 10;
/** Maximum ghost silhouettes */
const GHOST_MAX = 6;
/** SDF cloak edge dissolve width */
const SDF_DISSOLVE_W = 0.02;
/** Specular highlight fraction */
const SPECULAR_FRAC = 0.15;
/** Hanger rail Y position */
const HANGER_Y = 0.22;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface GhostSilhouette {
  slidePos: number;
  alpha: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw the glowing figure silhouette with SDF morphing */
function drawRevealedFigure(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, revealT: number, entrance: number,
  breathMod: number, frameCount: number,
) {
  if (revealT < 0.01) return;

  const fH = px(AVATAR_HEIGHT, minDim);
  const fW = px(AVATAR_WIDTH, minDim);
  const bodyA = ALPHA.content.max * revealT * entrance;

  // ── Glow field ──────────────────────────────────────────────
  for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
    const gR = fH * (0.4 + revealT * 1.5 + i * 0.2) * breathMod;
    const gA = ALPHA.glow.max * revealT * 0.12 * entrance / (i + 1);
    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
    const warmColor = lerpColor(color, [255, 245, 225] as RGB, revealT * 0.25);
    gg.addColorStop(0, rgba(warmColor, gA * 1.2));
    gg.addColorStop(0.2, rgba(warmColor, gA * 0.5));
    gg.addColorStop(0.5, rgba(color, gA * 0.15));
    gg.addColorStop(0.8, rgba(color, gA * 0.03));
    gg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
  }

  // ── Head (SDF circle) ───────────────────────────────────────
  const headR = fW * (0.4 + revealT * 0.1);
  const headGrad = ctx.createRadialGradient(cx, cy - fH * 0.32, 0, cx, cy - fH * 0.32, headR);
  headGrad.addColorStop(0, rgba(color, bodyA * 0.5));
  headGrad.addColorStop(0.5, rgba(color, bodyA * 0.35));
  headGrad.addColorStop(0.8, rgba(color, bodyA * 0.2));
  headGrad.addColorStop(1, rgba(color, bodyA * 0.05));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - fH * 0.32, headR, 0, Math.PI * 2);
  ctx.fill();

  // ── Torso ───────────────────────────────────────────────────
  const torsoCorner = fW * 0.1 * (1 + revealT * 3);
  ctx.beginPath();
  ctx.roundRect(cx - fW * 0.35, cy - fH * 0.12, fW * 0.7, fH * 0.35, torsoCorner);
  ctx.fillStyle = rgba(color, bodyA * 0.35);
  ctx.fill();

  // ── Legs ────────────────────────────────────────────────────
  const legW = fW * 0.16;
  ctx.beginPath();
  ctx.roundRect(cx - fW * 0.22, cy + fH * 0.24, legW, fH * 0.22, legW * 0.3);
  ctx.fillStyle = rgba(color, bodyA * 0.28);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + fW * 0.06, cy + fH * 0.24, legW, fH * 0.22, legW * 0.3);
  ctx.fill();

  // ── Specular highlight on head ──────────────────────────────
  const specX = cx - headR * 0.35;
  const specY = cy - fH * 0.32 - headR * 0.25;
  const specR = headR * 0.25;
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, bodyA * 0.2 * revealT));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, specR, 0, Math.PI * 2);
  ctx.fill();

  // ── Light rays at full reveal ───────────────────────────────
  if (revealT > 0.7) {
    const rayA = ALPHA.content.max * (revealT - 0.7) * 3 * 0.03 * entrance;
    const time = frameCount * 0.005;
    for (let i = 0; i < RAY_COUNT; i++) {
      const angle = (i / RAY_COUNT) * Math.PI * 2 + time;
      const rayLen = fH * (0.8 + Math.sin(time * 0.7 + i * 1.1) * 0.4);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * fW * 0.5, cy + Math.sin(angle) * fW * 0.5);
      ctx.lineTo(cx + Math.cos(angle) * rayLen, cy + Math.sin(angle) * rayLen);
      ctx.strokeStyle = rgba(color, rayA);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();
    }
  }
}

/** Draw the cloak with SDF dissolving edges */
function drawCloak(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, accentColor: RGB, slidePos: number, entrance: number,
  breathMod: number, frameCount: number,
) {
  if (slidePos >= 1) return;

  const fH = px(AVATAR_HEIGHT, minDim);
  const fW = px(AVATAR_WIDTH, minDim);
  const cloakOffX = slidePos * fW * 3;
  const cloakX = cx + cloakOffX;
  const dissolve = slidePos;

  // ── Cloak body ──────────────────────────────────────────────
  ctx.beginPath();
  // Build cloak path with wavy SDF-like edge
  const topY = cy - fH * 0.4;
  const botY = cy + fH * 0.45;
  const leftX = cloakX - fW * 0.55;
  const rightX = cloakX + fW * 0.55;

  ctx.moveTo(leftX, topY);
  // Right edge with cloth wave physics
  for (let seg = 0; seg <= CLOAK_SEGMENTS; seg++) {
    const t = seg / CLOAK_SEGMENTS;
    const y = topY + t * (botY - topY);
    const waveX = Math.sin(t * Math.PI * 3 + frameCount * WAVE_SPEED) * px(WAVE_AMP, minDim) * breathMod;
    const dissolveNoise = dissolve * Math.sin(t * 7 + frameCount * 0.02) * px(SDF_DISSOLVE_W, minDim);
    ctx.lineTo(rightX + waveX + dissolveNoise, y);
  }
  // Bottom and left edge
  ctx.lineTo(leftX, botY);
  ctx.closePath();

  // 4-stop cloak gradient
  const cloakA = ALPHA.content.max * (0.25 - dissolve * 0.2) * entrance;
  const cloakGrad = ctx.createLinearGradient(leftX, topY, rightX, botY);
  cloakGrad.addColorStop(0, rgba(accentColor, cloakA * 0.9));
  cloakGrad.addColorStop(0.3, rgba(accentColor, cloakA * 0.7));
  cloakGrad.addColorStop(0.7, rgba(lerpColor(accentColor, color, 0.2), cloakA * 0.5));
  cloakGrad.addColorStop(1, rgba(accentColor, cloakA * 0.3));
  ctx.fillStyle = cloakGrad;
  ctx.fill();

  // Cloak stroke with SDF edge glow
  ctx.strokeStyle = rgba(accentColor, cloakA * 0.6);
  ctx.lineWidth = px(STROKE.thin, minDim);
  ctx.stroke();

  // ── Pattern lines (decorative texture) ──────────────────────
  for (let pl = 0; pl < PATTERN_LINES; pl++) {
    const pY = topY + ((pl + 1) / (PATTERN_LINES + 1)) * (botY - topY);
    const wave = Math.sin(pl * 0.8 + frameCount * 0.01) * px(0.002, minDim);
    ctx.beginPath();
    ctx.moveTo(leftX + fW * 0.15, pY + wave);
    ctx.lineTo(rightX - fW * 0.15, pY + wave);
    ctx.strokeStyle = rgba(accentColor, cloakA * 0.12);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }

  // ── SDF dissolve edge particles ─────────────────────────────
  if (dissolve > 0.1) {
    const edgeParticles = Math.floor(dissolve * 20);
    for (let ep = 0; ep < edgeParticles; ep++) {
      const epY = topY + Math.random() * (botY - topY);
      const epX = rightX + Math.sin(ep * 3.7 + frameCount * 0.03) * px(0.02, minDim);
      const epR = px(0.002 + Math.random() * 0.003, minDim);
      ctx.beginPath();
      ctx.arc(epX, epY, epR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentColor, ALPHA.content.max * 0.06 * entrance * (1 - dissolve));
      ctx.fill();
    }
  }

  // ── Cloak specular ──────────────────────────────────────────
  const specCX = cloakX - fW * 0.15;
  const specCY = cy - fH * 0.15;
  const specR = fW * 0.25;
  const specGrad = ctx.createRadialGradient(specCX, specCY, 0, specCX, specCY, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, cloakA * 0.1));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specCX, specCY, specR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function CostumeClosetAtom({
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
    slideProgress: 0,
    dragging: false, dragStartX: 0,
    ghosts: [] as GhostSilhouette[],
    dragNotified: false, completed: false,
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
        s.slideProgress = 1; s.completed = true;
      }

      const breathMod = 1 + p.breathAmplitude * 0.04;

      // Ghost decay
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      // Completion check
      if (s.slideProgress >= 0.95 && !s.completed) {
        s.slideProgress = 1; s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(Math.min(1, s.slideProgress));

      // ═══════════════════════════════════════════════════════
      // LAYER 1: Hanger rail
      // ═══════════════════════════════════════════════════════
      const railY = cy - px(AVATAR_HEIGHT * 0.5 + 0.03, minDim);
      const railGrad = ctx.createLinearGradient(cx - px(0.15, minDim), railY, cx + px(0.15, minDim), railY);
      railGrad.addColorStop(0, rgba(s.accentRgb, 0));
      railGrad.addColorStop(0.2, rgba(s.accentRgb, ALPHA.content.max * 0.06 * entrance));
      railGrad.addColorStop(0.8, rgba(s.accentRgb, ALPHA.content.max * 0.06 * entrance));
      railGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.beginPath();
      ctx.moveTo(cx - px(0.15, minDim), railY);
      ctx.lineTo(cx + px(0.15, minDim), railY);
      ctx.strokeStyle = railGrad;
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Rail specular highlight
      const railSpecGrad = ctx.createLinearGradient(cx - px(0.05, minDim), railY - 1, cx + px(0.05, minDim), railY - 1);
      railSpecGrad.addColorStop(0, rgba([255, 255, 255] as RGB, 0));
      railSpecGrad.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.06 * entrance));
      railSpecGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.beginPath();
      ctx.moveTo(cx - px(0.05, minDim), railY - 1);
      ctx.lineTo(cx + px(0.05, minDim), railY - 1);
      ctx.strokeStyle = railSpecGrad;
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // ═══════════════════════════════════════════════════════
      // LAYER 2–3: Ghost silhouettes
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        const ghostFH = px(AVATAR_HEIGHT, minDim);
        const ghostFW = px(AVATAR_WIDTH, minDim);
        const ghostOff = g.slidePos * ghostFW * 3;
        ctx.beginPath();
        ctx.roundRect(cx + ghostOff - ghostFW * 0.4, cy - ghostFH * 0.35, ghostFW * 0.8, ghostFH * 0.7, ghostFW * 0.15);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * g.alpha * 0.08 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 4–5: Revealed figure
      // ═══════════════════════════════════════════════════════
      drawRevealedFigure(ctx, cx, cy, minDim, s.primaryRgb, s.slideProgress, entrance, breathMod, s.frameCount);

      // ═══════════════════════════════════════════════════════
      // LAYER 6–7: Cloak with SDF dissolving edge
      // ═══════════════════════════════════════════════════════
      drawCloak(ctx, cx, cy, minDim, s.primaryRgb, s.accentRgb, s.slideProgress, entrance, breathMod, s.frameCount);

      // ═══════════════════════════════════════════════════════
      // LAYER 8: Progress indicator
      // ═══════════════════════════════════════════════════════
      if (!s.completed && s.slideProgress > 0) {
        const pR = px(0.37, minDim);
        const pAngle = s.slideProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pR, -Math.PI / 2, -Math.PI / 2 + pAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Interaction: drag to slide cloak ──────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.dragStartX = e.clientX;
      if (!stateRef.current.dragNotified) {
        stateRef.current.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      // Spawn ghost
      const s = stateRef.current;
      if (s.ghosts.length < GHOST_MAX) {
        s.ghosts.push({ slidePos: s.slideProgress, alpha: 0.35 });
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed) return;
      const dx = (e.clientX - s.dragStartX) / viewport.width;
      if (dx > 0) s.slideProgress = Math.min(1, s.slideProgress + dx * 0.04);
      s.dragStartX = e.clientX;
    };
    const onUp = () => { stateRef.current.dragging = false; };

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
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'e-resize',
      }} />
    </div>
  );
}
