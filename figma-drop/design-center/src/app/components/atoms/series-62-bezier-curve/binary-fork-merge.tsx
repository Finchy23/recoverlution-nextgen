/**
 * ATOM 613: THE BINARY FORK ENGINE
 * ==================================
 * Series 62 — Bezier Curve · Position 3
 *
 * Destroy all-or-nothing paralysis. Pinch two rigidly split paths
 * together — physics merges the extremes into a single beautiful
 * weaving central curve taking the best from both sides.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Two diverging flow streams represent the fork
 *   - As paths merge, flow lines converge into laminar central stream
 *   - Visible bifurcation → reunion topology in the vector field
 *   - Physics teaches: you don't have to choose — synthesize
 *
 * PHYSICS:
 *   - Single path forks into two rigidly opposite directions
 *   - Node freezes at junction with anxiety buzz
 *   - Drag/pinch brings paths closer
 *   - Paths merge into single weaving central Bezier
 *   - Flow field converges from chaotic to laminar
 *   - Breath modulates fork oscillation + glow intensity
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + bifurcation field glow
 *   2. Flow field vectors (divergent → convergent)
 *   3. Fork shadow + glow
 *   4. Upper path with gradient
 *   5. Lower path with gradient
 *   6. Merged central path with specular
 *   7. Junction node + frozen anxiety
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Drag (pinch paths toward center) → merges fork
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static merged path
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, PARTICLE_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Fork separation angle (radians) at full split */
const FORK_ANGLE = 0.55;
/** Path length from junction */
const PATH_LEN = SIZE.xl * 0.9;
/** Incoming path length */
const INCOMING_LEN = SIZE.lg;
/** Junction node radius */
const JUNCTION_R = PARTICLE_SIZE.xl;
/** Junction glow layers */
const JUNCTION_GLOW_LAYERS = 4;
/** Anxiety buzz amplitude */
const BUZZ_AMP = 0.004;
/** Buzz frequency */
const BUZZ_FREQ = 0.35;
/** Merge threshold for completion */
const MERGE_THRESHOLD = 0.92;
/** Flow field columns */
const FLOW_COLS = 18;
/** Flow field rows */
const FLOW_ROWS = 10;
/** Flow arrow length */
const FLOW_ARROW_LEN = 0.022;
/** Path stroke weight */
const PATH_STROKE = STROKE.bold;
/** Path glow width */
const PATH_GLOW_W = 0.007;
/** Central merged path weave amplitude */
const WEAVE_AMP = 0.015;
/** Weave frequency */
const WEAVE_FREQ = 3;
/** Completion bloom frames */
const BLOOM_FRAMES = 35;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Breath fork oscillation */
const BREATH_FORK_OSC = 0.008;
/** Specular highlight size */
const SPECULAR_R = 0.003;

// =====================================================================
// STATE TYPES
// =====================================================================

interface ForkState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  merge: number;
  dragging: boolean;
  dragStartY: number;
  completed: boolean;
  bloomTimer: number;
  frozenBuzz: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function BinaryForkMergeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<ForkState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    merge: 0,
    dragging: false,
    dragStartY: 0,
    completed: false,
    bloomTimer: 0,
    frozenBuzz: 0,
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

    // ═══════════════════════════════════════════════════════════════
    // RENDER LOOP
    // ═══════════════════════════════════════════════════════════════
    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const merge = s.merge;

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + BIFURCATION FIELD GLOW
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // Bifurcation anxiety glow (fades with merge)
      if (merge < 0.6) {
        const anxGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, px(SIZE.lg, minDim));
        anxGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * (1 - merge) * entrance * 0.5));
        anxGlow.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.min * (1 - merge) * entrance));
        anxGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = anxGlow;
        ctx.fillRect(0, 0, w, h);
      }

      // Junction position
      const jx = cx - px(INCOMING_LEN, minDim) * 0.3;
      const jy = cy;

      // Incoming path (from left)
      const inX = jx - px(INCOMING_LEN, minDim);

      // Fork angles (narrow as merge increases)
      const forkAngle = FORK_ANGLE * (1 - merge);
      const breathOsc = Math.sin(s.frameCount * 0.03) * px(BREATH_FORK_OSC, minDim) * breath * ms;
      const pathLen = px(PATH_LEN, minDim);

      // Upper fork endpoint
      const upAngle = -forkAngle;
      const upX = jx + Math.cos(upAngle) * pathLen;
      const upY = jy + Math.sin(upAngle) * pathLen + breathOsc;

      // Lower fork endpoint
      const dnAngle = forkAngle;
      const dnX = jx + Math.cos(dnAngle) * pathLen;
      const dnY = jy + Math.sin(dnAngle) * pathLen - breathOsc;

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD
      // ═══════════════════════════════════════════════════════════
      {
        ctx.lineWidth = px(STROKE.hairline, minDim);
        const arrowLen = px(FLOW_ARROW_LEN, minDim);

        for (let col = 0; col < FLOW_COLS; col++) {
          for (let row = 0; row < FLOW_ROWS; row++) {
            const fx = w * 0.08 + (col / (FLOW_COLS - 1)) * w * 0.84;
            const fy = h * 0.15 + (row / (FLOW_ROWS - 1)) * h * 0.7;

            // Flow direction: before junction → rightward, after → diverge/converge
            let dx = 1;
            let dy = 0;

            if (fx > jx) {
              // After junction: flow toward fork endpoints
              const t = (fx - jx) / pathLen;
              const yCenter = jy;
              if (fy < yCenter) {
                // Upper stream
                const targetY = jy + Math.sin(upAngle) * t * pathLen;
                dy = (targetY - fy) * 0.01;
              } else {
                // Lower stream
                const targetY = jy + Math.sin(dnAngle) * t * pathLen;
                dy = (targetY - fy) * 0.01;
              }
              dx = 1;
            }

            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag < 0.001) continue;
            dx /= mag;
            dy /= mag;

            const alpha = ALPHA.background.max * entrance * (0.5 + merge * 0.5);
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, merge);
            ctx.strokeStyle = rgba(arrowColor, alpha);

            const ex = fx + dx * arrowLen;
            const ey = fy + dy * arrowLen;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // Arrowhead
            const a = Math.atan2(dy, dx);
            const hl = arrowLen * 0.25;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * hl, ey - Math.sin(a - 0.5) * hl);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYERS 3-5: PATHS (shadow, upper, lower, merged)
      // ═══════════════════════════════════════════════════════════

      const drawPathLine = (
        x1: number, y1: number, x2: number, y2: number,
        color: string, width: number, cpxOff?: number, cpyOff?: number,
      ) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        if (cpxOff !== undefined && cpyOff !== undefined) {
          ctx.quadraticCurveTo(x1 + (x2 - x1) * 0.5 + cpxOff, y1 + (y2 - y1) * 0.5 + cpyOff, x2, y2);
        } else {
          ctx.lineTo(x2, y2);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
      };

      // Incoming path
      drawPathLine(
        inX, jy, jx, jy,
        rgba(s.primaryRgb, ALPHA.focal.max * entrance),
        px(PATH_STROKE, minDim),
      );

      // Incoming path glow
      drawPathLine(
        inX, jy, jx, jy,
        rgba(s.primaryRgb, ALPHA.glow.max * entrance),
        px(PATH_GLOW_W, minDim),
      );

      if (merge < 0.95) {
        // Upper fork
        const upperColor = lerpColor(s.accentRgb, s.primaryRgb, merge);
        drawPathLine(jx, jy, upX, upY,
          rgba(upperColor, ALPHA.focal.max * (1 - merge * 0.8) * entrance),
          px(PATH_STROKE, minDim));
        drawPathLine(jx, jy, upX, upY,
          rgba(upperColor, ALPHA.glow.max * (1 - merge) * entrance),
          px(PATH_GLOW_W, minDim));

        // Lower fork
        drawPathLine(jx, jy, dnX, dnY,
          rgba(upperColor, ALPHA.focal.max * (1 - merge * 0.8) * entrance),
          px(PATH_STROKE, minDim));
        drawPathLine(jx, jy, dnX, dnY,
          rgba(upperColor, ALPHA.glow.max * (1 - merge) * entrance),
          px(PATH_GLOW_W, minDim));
      }

      // Merged central path (weaving)
      if (merge > 0.15) {
        const mergedEnd = jx + pathLen;
        const weaveA = px(WEAVE_AMP, minDim) * (1 - merge) * 3;
        const pts = 30;
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const t = i / pts;
          const mx = jx + t * pathLen;
          const wv = Math.sin(t * Math.PI * 2 * WEAVE_FREQ + s.frameCount * 0.02 * ms) * weaveA;
          const my = jy + wv;
          if (i === 0) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);
        }
        const mergeColor = lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.1);
        ctx.strokeStyle = rgba(mergeColor, ALPHA.focal.max * merge * entrance);
        ctx.lineWidth = px(PATH_STROKE, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Merged glow
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * merge * entrance);
        ctx.lineWidth = px(PATH_GLOW_W, minDim);
        ctx.stroke();

        // Specular dots along merged path
        if (merge > 0.5) {
          for (let i = 0; i <= pts; i += 6) {
            const t = i / pts;
            const mx = jx + t * pathLen;
            const wv = Math.sin(t * Math.PI * 2 * WEAVE_FREQ + s.frameCount * 0.02 * ms) * weaveA;
            const my = jy + wv;
            ctx.beginPath();
            ctx.arc(mx, my - px(SPECULAR_R * 2, minDim), px(SPECULAR_R, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.min * merge * entrance);
            ctx.fill();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: JUNCTION NODE
      // ═══════════════════════════════════════════════════════════
      {
        const buzzOff = merge < 0.5
          ? Math.sin(s.frameCount * BUZZ_FREQ) * px(BUZZ_AMP, minDim) * (1 - merge * 2) * ms
          : 0;

        // Multi-glow
        for (let g = JUNCTION_GLOW_LAYERS; g >= 1; g--) {
          const gr = px(JUNCTION_R, minDim) * (1 + g * 1.4);
          const ga = (ALPHA.glow.max / g) * entrance;
          const jGlow = ctx.createRadialGradient(jx + buzzOff, jy, 0, jx + buzzOff, jy, gr);
          const glowColor = lerpColor(s.accentRgb, s.primaryRgb, merge);
          jGlow.addColorStop(0, rgba(glowColor, ga));
          jGlow.addColorStop(0.4, rgba(glowColor, ga * 0.3));
          jGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = jGlow;
          ctx.beginPath();
          ctx.arc(jx + buzzOff, jy, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Junction body
        const jr = px(JUNCTION_R, minDim) * (1 + breath * 0.1);
        const jGrad = ctx.createRadialGradient(jx + buzzOff, jy, 0, jx + buzzOff, jy, jr);
        const jCore = lerpColor(
          lerpColor(s.accentRgb, s.primaryRgb, merge),
          [255, 255, 255] as RGB, 0.3
        );
        jGrad.addColorStop(0, rgba(jCore, ALPHA.accent.max * entrance));
        jGrad.addColorStop(0.35, rgba(lerpColor(s.accentRgb, s.primaryRgb, merge), ALPHA.focal.max * entrance));
        jGrad.addColorStop(0.7, rgba(lerpColor(s.accentRgb, s.primaryRgb, merge), ALPHA.content.max * entrance));
        jGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = jGrad;
        ctx.beginPath();
        ctx.arc(jx + buzzOff, jy, jr, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(jx + buzzOff - jr * 0.3, jy - jr * 0.3, jr * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS RING + COMPLETION
      // ═══════════════════════════════════════════════════════════
      {
        const ringR = px(PROGRESS_R, minDim);
        const ringX = w * 0.92;
        const ringY = h * 0.08;

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * merge);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // Completion
      if (merge >= MERGE_THRESHOLD && !s.completed) {
        s.completed = true;
        s.bloomTimer = BLOOM_FRAMES;
        cb.onHaptic('completion');
        cb.onStateChange?.(1);
      }

      if (s.bloomTimer > 0) {
        s.bloomTimer -= ms;
        const bloomT = Math.max(0, s.bloomTimer / BLOOM_FRAMES);
        const bloomR = px(SIZE.lg, minDim) * (1 - bloomT);
        const bloom = ctx.createRadialGradient(jx, jy, 0, jx, jy, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(jx, jy, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      s.dragStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      // Horizontal drag to merge
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const newMerge = Math.min(1, Math.max(s.merge, mx * 1.2));
      if (newMerge > s.merge + 0.005) {
        s.merge = newMerge;
        callbacksRef.current.onStateChange?.(s.merge * 0.95);
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
