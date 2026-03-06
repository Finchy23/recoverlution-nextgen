/**
 * ATOM 259: THE RE-ENTRY ENGINE
 * ================================
 * Series 26 — Identity Decoupling · Position 9
 *
 * Put the costume back on — but now it is light, playful, frictionless.
 * The soul shines through the fabric. You know it is a game.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Costume rendered as SDF shape that starts far away and
 *     snaps onto the figure with zero-gravity attachment
 *   - The costume SDF is now semi-transparent — soul light bleeds
 *     through the SDF boundary from inside (inverted edge glow)
 *   - SDF morph: heavy opaque rectangle → light translucent cloak
 *     with soft edges and visible inner luminance
 *   - Rainbow SDF edge shimmer shows the costume is now just a game
 *
 * PHYSICS:
 *   - Luminous figure (from atom 258) at center
 *   - Costume piece floating nearby — drag to snap onto figure
 *   - When snapped: costume becomes translucent, light shines through
 *   - SDF edges shimmer with playful holographic color
 *   - Ghost trail shows the snap trajectory
 *   - 8 render layers: atmosphere, soul glow, figure body,
 *     ghost trail, costume body, costume SDF edge, inner light, label
 *
 * INTERACTION:
 *   Drag costume to figure to snap on (drag_snap, completion)
 *
 * RENDER: Canvas 2D with SDF translucent costume + inner luminance
 * REDUCED MOTION: Costume snapped, light shining through
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

/** Figure height */
const FIGURE_H = 0.30;
/** Figure width */
const FIGURE_W = 0.09;
/** Figure center X */
const FIGURE_X = 0.5;
/** Figure center Y */
const FIGURE_Y = 0.48;
/** Costume initial X offset */
const COSTUME_START_X = 0.75;
/** Costume initial Y */
const COSTUME_START_Y = 0.45;
/** Snap distance threshold */
const SNAP_DIST = 0.08;
/** Ghost trail decay */
const GHOST_DECAY = 0.985;
/** Maximum ghost count */
const GHOST_MAX = 8;
/** Soul glow layers */
const GLOW_LAYERS = 6;
/** Costume SDF edge shimmer speed */
const SHIMMER_SPEED = 0.025;
/** Inner light ray count */
const INNER_RAY_COUNT = 10;
/** Costume translucency when snapped */
const SNAP_TRANSLUCENCY = 0.6;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface GhostPos {
  x: number; y: number; alpha: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw the luminous soul figure */
function drawSoulFigure(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, entrance: number, breathMod: number,
  frameCount: number,
) {
  const fH = px(FIGURE_H, minDim);
  const fW = px(FIGURE_W, minDim);
  const headR = fW * 0.4;

  // ── Soul glow field ─────────────────────────────────────────
  for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
    const gR = fH * (0.6 + i * 0.25) * breathMod;
    const gA = ALPHA.glow.max * 0.1 * entrance / (i + 1);
    const warmColor = lerpColor(color, [255, 245, 225] as RGB, 0.2);
    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
    gg.addColorStop(0, rgba(warmColor, gA * 1.3));
    gg.addColorStop(0.25, rgba(warmColor, gA * 0.5));
    gg.addColorStop(0.6, rgba(color, gA * 0.12));
    gg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
  }

  // ── Head ────────────────────────────────────────────────────
  const headGrad = ctx.createRadialGradient(cx, cy - fH * 0.32, 0, cx, cy - fH * 0.32, headR);
  headGrad.addColorStop(0, rgba(color, ALPHA.content.max * 0.4 * entrance));
  headGrad.addColorStop(0.5, rgba(color, ALPHA.content.max * 0.25 * entrance));
  headGrad.addColorStop(1, rgba(color, ALPHA.content.max * 0.05 * entrance));
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(cx, cy - fH * 0.32, headR, 0, Math.PI * 2);
  ctx.fill();

  // ── Torso ───────────────────────────────────────────────────
  ctx.beginPath();
  ctx.roundRect(cx - fW * 0.33, cy - fH * 0.1, fW * 0.66, fH * 0.3, fW * 0.12);
  ctx.fillStyle = rgba(color, ALPHA.content.max * 0.28 * entrance);
  ctx.fill();

  // ── Legs ────────────────────────────────────────────────────
  const legW = fW * 0.14;
  ctx.beginPath();
  ctx.roundRect(cx - fW * 0.2, cy + fH * 0.22, legW, fH * 0.2, legW * 0.3);
  ctx.fillStyle = rgba(color, ALPHA.content.max * 0.2 * entrance);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx + fW * 0.06, cy + fH * 0.22, legW, fH * 0.2, legW * 0.3);
  ctx.fill();

  // ── Head specular ───────────────────────────────────────────
  const specR = headR * 0.2;
  const specGrad = ctx.createRadialGradient(cx - headR * 0.3, cy - fH * 0.32 - headR * 0.2, 0,
    cx - headR * 0.3, cy - fH * 0.32 - headR * 0.2, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.2 * entrance));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(cx - headR * 0.3, cy - fH * 0.32 - headR * 0.2, specR, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw the costume with SDF translucent rendering */
function drawCostume(
  ctx: CanvasRenderingContext2D,
  cosX: number, cosY: number, minDim: number,
  accentColor: RGB, primaryColor: RGB, entrance: number,
  breathMod: number, frameCount: number,
  snapped: boolean, snapProgress: number,
) {
  const fH = px(FIGURE_H, minDim);
  const fW = px(FIGURE_W, minDim);
  const topY = cosY - fH * 0.4;
  const botY = cosY + fH * 0.42;
  const cosW = fW * 0.65;

  // Translucency increases after snap
  const translucency = snapped ? SNAP_TRANSLUCENCY * snapProgress : 0;
  const costumeA = ALPHA.content.max * (0.22 - translucency * 0.15) * entrance;

  // ── Costume body (SDF rounded cloak shape) ──────────────────
  ctx.beginPath();
  const cornerR = cosW * (0.1 + snapProgress * 0.3); // Softens when snapped
  ctx.roundRect(cosX - cosW, topY, cosW * 2, botY - topY, cornerR);

  const cosGrad = ctx.createLinearGradient(cosX - cosW, topY, cosX + cosW, botY);
  cosGrad.addColorStop(0, rgba(accentColor, costumeA * 0.85));
  cosGrad.addColorStop(0.3, rgba(accentColor, costumeA * 0.65));
  cosGrad.addColorStop(0.6, rgba(lerpColor(accentColor, primaryColor, translucency * 0.3), costumeA * 0.5));
  cosGrad.addColorStop(1, rgba(accentColor, costumeA * 0.3));
  ctx.fillStyle = cosGrad;
  ctx.fill();

  // ── SDF edge with shimmer ───────────────────────────────────
  const shimmerPhase = frameCount * SHIMMER_SPEED;
  const shimmerR = Math.sin(shimmerPhase) * 0.5 + 0.5;
  const shimmerG = Math.sin(shimmerPhase + 2.1) * 0.5 + 0.5;
  const shimmerB = Math.sin(shimmerPhase + 4.2) * 0.5 + 0.5;
  const shimmerColor: RGB = [
    Math.round(150 + shimmerR * 105),
    Math.round(150 + shimmerG * 105),
    Math.round(150 + shimmerB * 105),
  ];

  ctx.strokeStyle = rgba(snapped ? shimmerColor : accentColor, costumeA * (snapped ? 0.4 : 0.5));
  ctx.lineWidth = px(STROKE.thin, minDim);
  ctx.stroke();

  // ── Pattern lines (decorative) ──────────────────────────────
  for (let pl = 0; pl < 6; pl++) {
    const pY = topY + ((pl + 1) / 7) * (botY - topY);
    ctx.beginPath();
    ctx.moveTo(cosX - cosW * 0.7, pY);
    ctx.lineTo(cosX + cosW * 0.7, pY);
    ctx.strokeStyle = rgba(accentColor, costumeA * 0.1);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }

  // ── Inner light bleeding through (when snapped) ─────────────
  if (snapped && snapProgress > 0.3) {
    const innerT = (snapProgress - 0.3) / 0.7;
    const innerGrad = ctx.createRadialGradient(cosX, cosY, 0, cosX, cosY, fH * 0.5);
    innerGrad.addColorStop(0, rgba(primaryColor, ALPHA.glow.max * innerT * 0.15 * entrance));
    innerGrad.addColorStop(0.4, rgba(primaryColor, ALPHA.glow.max * innerT * 0.06 * entrance));
    innerGrad.addColorStop(1, rgba(primaryColor, 0));
    ctx.fillStyle = innerGrad;
    ctx.fillRect(cosX - fH * 0.5, cosY - fH * 0.5, fH, fH);

    // Inner light rays through fabric
    const time = frameCount * 0.005;
    for (let r = 0; r < INNER_RAY_COUNT; r++) {
      const angle = (r / INNER_RAY_COUNT) * Math.PI * 2 + time;
      const rayLen = fH * 0.3 * innerT;
      ctx.beginPath();
      ctx.moveTo(cosX, cosY);
      ctx.lineTo(cosX + Math.cos(angle) * rayLen, cosY + Math.sin(angle) * rayLen);
      ctx.strokeStyle = rgba(primaryColor, ALPHA.content.max * 0.03 * innerT * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();
    }
  }

  // ── Costume specular ────────────────────────────────────────
  const specR = cosW * 0.3;
  const specGrad = ctx.createRadialGradient(cosX - cosW * 0.2, topY + fH * 0.15, 0,
    cosX - cosW * 0.2, topY + fH * 0.15, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, costumeA * 0.1));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(cosX - cosW * 0.2, topY + fH * 0.15, specR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ReEntryAtom({
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
    costumeX: COSTUME_START_X, costumeY: COSTUME_START_Y,
    dragging: false, dragOffX: 0, dragOffY: 0,
    snapped: false, snapProgress: 0,
    ghosts: [] as GhostPos[],
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

    const figX = FIGURE_X;
    const figY = FIGURE_Y;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.snapped = true; s.snapProgress = 1; s.completed = true;
        s.costumeX = figX; s.costumeY = figY;
      }

      const breathMod = 1 + p.breathAmplitude * 0.04;

      // Snap animation
      if (s.snapped) {
        s.snapProgress = Math.min(1, s.snapProgress + 0.015 * ms);
        s.costumeX += (figX - s.costumeX) * 0.08 * ms;
        s.costumeY += (figY - s.costumeY) * 0.08 * ms;

        if (s.snapProgress >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      // Ghost decay
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      cb.onStateChange?.(s.snapped ? s.snapProgress : 0);

      // ═══════════════════════════════════════════════════════
      // LAYER 1-2: Soul figure
      // ═══════════════════════════════════════════════════════
      drawSoulFigure(ctx, figX * w, figY * h, minDim, s.primaryRgb, entrance, breathMod, s.frameCount);

      // ═══════════════════════════════════════════════════════
      // LAYER 3: Ghost trails
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        const gH = px(FIGURE_H, minDim) * 0.8;
        const gW = px(FIGURE_W, minDim) * 0.6;
        ctx.beginPath();
        ctx.roundRect(g.x * w - gW / 2, g.y * h - gH / 2, gW, gH, gW * 0.2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * g.alpha * 0.08 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 4-6: Costume with SDF translucency
      // ═══════════════════════════════════════════════════════
      drawCostume(
        ctx, s.costumeX * w, s.costumeY * h, minDim,
        s.accentRgb, s.primaryRgb, entrance, breathMod, s.frameCount,
        s.snapped, s.snapProgress,
      );

      // ═══════════════════════════════════════════════════════
      // LAYER 7: "it's just a game" label
      // ═══════════════════════════════════════════════════════
      if (s.snapped && s.snapProgress > 0.7) {
        const labelA = ALPHA.content.max * 0.06 * Math.min(1, (s.snapProgress - 0.7) * 3.3) * entrance;
        ctx.font = `${px(FONT_SIZE.xs, minDim)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, labelA);
        ctx.fillText("it's just a game", cx, cy + px(FIGURE_H * 0.55 + 0.04, minDim));
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 8: Progress indicator
      // ═══════════════════════════════════════════════════════
      if (!s.snapped) {
        // Distance indicator
        const dist = Math.hypot(s.costumeX - figX, s.costumeY - figY);
        const nearness = Math.max(0, 1 - dist / 0.4);
        if (nearness > 0.1) {
          const indR = px(0.04 + nearness * 0.02, minDim);
          ctx.beginPath();
          ctx.arc(figX * w, figY * h, indR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * nearness * 0.1 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Interaction: drag costume to snap ─────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.snapped) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      if (Math.hypot(mx - s.costumeX, my - s.costumeY) < 0.12) {
        s.dragging = true;
        s.dragOffX = mx - s.costumeX;
        s.dragOffY = my - s.costumeY;
        if (!s.dragNotified) {
          s.dragNotified = true;
          callbacksRef.current.onHaptic('drag_snap');
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const prevX = s.costumeX;
      const prevY = s.costumeY;
      s.costumeX = (e.clientX - rect.left) / rect.width - s.dragOffX;
      s.costumeY = (e.clientY - rect.top) / rect.height - s.dragOffY;

      // Ghost trail
      if (s.ghosts.length < GHOST_MAX && s.frameCount % 3 === 0) {
        s.ghosts.push({ x: prevX, y: prevY, alpha: 0.3 });
      }

      // Snap check
      if (Math.hypot(s.costumeX - figX, s.costumeY - figY) < SNAP_DIST) {
        s.snapped = true; s.dragging = false;
        callbacksRef.current.onHaptic('drag_snap');
      }
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
        touchAction: 'none', cursor: 'grab',
      }} />
    </div>
  );
}
