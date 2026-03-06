/**
 * ATOM 255: THE TIME-LAPSE MIRROR ENGINE
 * =========================================
 * Series 26 — Identity Decoupling · Position 5
 *
 * The face ages, the world changes — but the eyes remain
 * absolutely stable, unchanging, glowing with quiet awareness.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Face contours rendered as SDF isoline rings that morph through
 *     age stages — each ring smoothly distorts between youth/age
 *   - Eyes rendered as stable SDF circles that NEVER change shape,
 *     teaching that the observer is changeless
 *   - SDF blending between age stages creates smooth temporal morphs
 *   - Contour lines use SDF-derived opacity for soft procedural edges
 *
 * PHYSICS:
 *   - Concentric SDF contour rings form a face
 *   - Scrub horizontally → contours morph through 5 age stages
 *   - Eye circles remain perfectly stable and luminous throughout
 *   - Ghost contour trails show previous age positions
 *   - 8 render layers: atmosphere, eye glow, age contours,
 *     eye bodies, specular, ghost trails, timeline bar, label
 *
 * INTERACTION:
 *   Drag horizontally to scrub through time (drag_snap, completion)
 *
 * RENDER: Canvas 2D with SDF contour morphing + stable eye centers
 * REDUCED MOTION: Middle age stage, eyes glowing
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

/** Number of SDF contour rings forming the face */
const CONTOUR_RINGS = 12;
/** Face radius (fraction of minDim) */
const FACE_R = 0.28;
/** Eye radius — stable throughout all stages */
const EYE_R = 0.025;
/** Eye separation from center */
const EYE_SPREAD = 0.06;
/** Eye vertical position above center */
const EYE_Y_OFF = -0.04;
/** Number of temporal age stages */
const TIMELINE_STAGES = 5;
/** Ghost contour trail decay */
const GHOST_DECAY = 0.986;
/** Maximum ghost trails */
const GHOST_MAX = 5;
/** Eye glow layers */
const GLOW_LAYERS = 5;
/** Eye pulse speed */
const EYE_PULSE_SPEED = 0.015;
/** Contour morph noise seed range */
const NOISE_RANGE = 0.04;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface GhostContour {
  timePos: number;
  alpha: number;
  contourOffsets: number[];
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Generate deterministic contour offsets for a given age stage */
function generateContourSeeds(stageCount: number, ringCount: number): number[][] {
  const seeds: number[][] = [];
  for (let s = 0; s < stageCount; s++) {
    const ringOffsets: number[] = [];
    for (let r = 0; r < ringCount; r++) {
      // Pseudo-random but deterministic per stage/ring
      const v = Math.sin(s * 17.3 + r * 7.1) * 0.5 + 0.5;
      ringOffsets.push(v * NOISE_RANGE * (1 + s * 0.3));
    }
    seeds.push(ringOffsets);
  }
  return seeds;
}

/** Interpolate contour offsets between two age stages */
function interpolateContours(seeds: number[][], timePos: number): number[] {
  const stageF = timePos * (TIMELINE_STAGES - 1);
  const stageA = Math.floor(stageF);
  const stageB = Math.min(TIMELINE_STAGES - 1, stageA + 1);
  const frac = stageF - stageA;
  return seeds[stageA].map((a, i) =>
    a * (1 - frac) + seeds[stageB][i] * frac
  );
}

/** Draw SDF contour face at given offsets */
function drawSdfFace(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, offsets: number[], alpha: number,
  entrance: number, breathMod: number, frameCount: number,
) {
  for (let r = 0; r < CONTOUR_RINGS; r++) {
    const t = (r + 1) / (CONTOUR_RINGS + 1);
    const baseR = px(FACE_R * t, minDim) * breathMod;
    const offset = offsets[r] || 0;
    const points = 36;

    ctx.beginPath();
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2;
      // SDF-like morphed radius: oval that distorts with age
      const ovalR = baseR * (1 + offset * Math.sin(angle * 2 + r * 0.5));
      const wobble = Math.sin(angle * 3 + frameCount * 0.004 + r) * px(0.001, minDim);
      const px2 = cx + Math.cos(angle) * (ovalR + wobble);
      const py2 = cy + Math.sin(angle) * (ovalR + wobble) * 1.15; // Slightly tall oval

      if (p === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }

    // Contour line opacity varies by ring depth
    const ringAlpha = ALPHA.content.max * alpha * (0.04 + t * 0.12) * entrance;
    ctx.strokeStyle = rgba(color, ringAlpha);
    ctx.lineWidth = px(STROKE.hairline + t * 0.001, minDim);
    ctx.stroke();
  }
}

/** Draw stable observer eyes */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, entrance: number, breathMod: number,
  eyePhase: number,
) {
  const eyePulse = 1 + Math.pow(Math.max(0, Math.sin(eyePhase)), 3) * 0.1;
  const eyeY = cy + px(EYE_Y_OFF, minDim);

  for (const side of [-1, 1]) {
    const eyeX = cx + px(EYE_SPREAD * side, minDim);
    const eR = px(EYE_R, minDim) * breathMod * eyePulse;

    // ── Eye glow ──────────────────────────────────────────────
    for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
      const gR = eR * (2 + i * 0.8);
      const gA = ALPHA.glow.max * 0.1 * entrance / (i + 1);
      const gg = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, gR);
      gg.addColorStop(0, rgba(color, gA));
      gg.addColorStop(0.4, rgba(color, gA * 0.3));
      gg.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = gg;
      ctx.fillRect(eyeX - gR, eyeY - gR, gR * 2, gR * 2);
    }

    // ── Eye body (stable SDF circle) ──────────────────────────
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eR);
    eyeGrad.addColorStop(0, rgba([255, 252, 240] as RGB, ALPHA.content.max * 0.5 * entrance));
    eyeGrad.addColorStop(0.3, rgba(color, ALPHA.content.max * 0.4 * entrance));
    eyeGrad.addColorStop(0.7, rgba(color, ALPHA.content.max * 0.25 * entrance));
    eyeGrad.addColorStop(1, rgba(color, ALPHA.content.max * 0.08 * entrance));
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eR, 0, Math.PI * 2);
    ctx.fill();

    // ── Eye specular ──────────────────────────────────────────
    const specX = eyeX - eR * 0.25;
    const specY = eyeY - eR * 0.3;
    const specR = eR * 0.2;
    const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
    specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.25 * entrance));
    specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(specX, specY, specR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function TimeLapseMirrorAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const contourSeeds = useRef(generateContourSeeds(TIMELINE_STAGES, CONTOUR_RINGS));

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    timePos: 0,
    dragging: false, dragNotified: false,
    ghosts: [] as GhostContour[],
    eyePhase: 0,
    completed: false,
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
        s.timePos = 1; s.completed = true;
      }

      const breathMod = 1 + p.breathAmplitude * 0.03;
      s.eyePhase += EYE_PULSE_SPEED * ms;

      // Completion
      if (s.timePos >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.timePos);

      // Ghost decay
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      const currentOffsets = interpolateContours(contourSeeds.current, s.timePos);

      // ═══════════════════════════════════════════════════════
      // LAYER 1: Ghost contour trails
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        drawSdfFace(ctx, cx, cy, minDim, s.accentRgb, g.contourOffsets, g.alpha * 0.3, entrance, breathMod, s.frameCount);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 2: Current SDF contour face
      // ═══════════════════════════════════════════════════════
      drawSdfFace(ctx, cx, cy, minDim, s.primaryRgb, currentOffsets, 1, entrance, breathMod, s.frameCount);

      // ── Face fill (subtle) ──────────────────────────────────
      const faceR = px(FACE_R, minDim) * breathMod;
      const faceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, faceR);
      faceGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.min * 0.06 * entrance));
      faceGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * 0.03 * entrance));
      faceGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, faceR, faceR * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // ═══════════════════════════════════════════════════════
      // LAYER 3: Stable observer eyes
      // ═══════════════════════════════════════════════════════
      drawEyes(ctx, cx, cy, minDim, s.primaryRgb, entrance, breathMod, s.eyePhase);

      // ═══════════════════════════════════════════════════════
      // LAYER 4: Age stage markers
      // ═══════════════════════════════════════════════════════
      const markerY = cy + px(FACE_R + 0.06, minDim);
      const markerSpan = px(0.25, minDim);
      for (let stg = 0; stg < TIMELINE_STAGES; stg++) {
        const stgX = cx + ((stg / (TIMELINE_STAGES - 1)) - 0.5) * markerSpan * 2;
        const active = Math.abs(stg / (TIMELINE_STAGES - 1) - s.timePos) < 0.12;
        ctx.beginPath();
        ctx.arc(stgX, markerY, px(0.003 + (active ? 0.002 : 0), minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (active ? 0.25 : 0.06) * entrance);
        ctx.fill();
      }

      // Timeline bar
      ctx.beginPath();
      ctx.moveTo(cx - markerSpan, markerY);
      ctx.lineTo(cx + markerSpan, markerY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // Scrub position indicator
      const scrubX = cx + (s.timePos - 0.5) * markerSpan * 2;
      ctx.beginPath();
      ctx.arc(scrubX, markerY, px(0.005, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.fill();

      // ═══════════════════════════════════════════════════════
      // LAYER 5: "The eyes never change" label
      // ═══════════════════════════════════════════════════════
      if (s.timePos > 0.3 && s.timePos < 0.95) {
        const labelA = ALPHA.content.max * 0.08 * entrance * Math.min(1, (s.timePos - 0.3) * 5);
        ctx.font = `${px(FONT_SIZE.xs, minDim)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, labelA);
        ctx.fillText('the eyes never change', cx, cy + px(FACE_R + 0.1, minDim));
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Interaction: drag to scrub time ───────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      if (!stateRef.current.dragNotified) {
        stateRef.current.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      const s = stateRef.current;
      if (s.ghosts.length < GHOST_MAX) {
        s.ghosts.push({
          timePos: s.timePos, alpha: 0.3,
          contourOffsets: interpolateContours(contourSeeds.current, s.timePos),
        });
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const prev = s.timePos;
      s.timePos = Math.max(0, Math.min(1, (mx - 0.12) / 0.76));

      if (Math.abs(s.timePos - prev) > 0.08 && s.ghosts.length < GHOST_MAX) {
        s.ghosts.push({
          timePos: prev, alpha: 0.25,
          contourOffsets: interpolateContours(contourSeeds.current, prev),
        });
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
        touchAction: 'none', cursor: 'ew-resize',
      }} />
    </div>
  );
}
