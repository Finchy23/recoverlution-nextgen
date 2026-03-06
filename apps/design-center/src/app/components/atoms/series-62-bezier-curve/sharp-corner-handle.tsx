/**
 * ATOM 611: THE SHARP CORNER ENGINE
 * ===================================
 * Series 62 — Bezier Curve · Position 1
 *
 * Cure the ruined-day syndrome. Drag the control handle outward
 * from the harsh 90-degree vertex — it bows into a smooth Bezier
 * curve and the node sweeps through without losing velocity.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - A grid of velocity arrows surrounds the path
 *   - At the sharp corner, arrows slam to zero (stagnation point)
 *   - As handle pulls outward, flow field smooths — arrows curve gracefully
 *   - Visible flow dynamics teach: smoothing the corner restores the flow
 *
 * PHYSICS:
 *   - Node travels along path that jerks into sharp 90° angle
 *   - Hitting vertex → crash haptics, zero momentum, stagnation field
 *   - Drag outward from vertex → pulls control handle
 *   - Corner bows into smooth Bezier, flow field reorganizes
 *   - Node sweeps through preserving velocity
 *   - Breath modulates flow arrow drift, glow warmth, node pulse
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + vignette
 *   2. Flow field arrows (phase portrait)
 *   3. Path shadow + main path with multi-stop gradient
 *   4. Vertex / control handle with specular
 *   5. Handle connection line with Fresnel glow
 *   6. Travelling node with multi-layer glow
 *   7. Progress ring around vertex
 *   8. Completion bloom + spark shower
 *
 * INTERACTION: Drag (outward from vertex) → smooths the corner
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static smoothed curve + flow field
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, PARTICLE_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Hero path occupies most of viewport */
const PATH_EXTENT = SIZE.xl;
/** Bezier control handle max reach */
const HANDLE_REACH = SIZE.md;
/** Travelling node radius */
const NODE_RADIUS = PARTICLE_SIZE.xl;
/** Node glow layers */
const NODE_GLOW_LAYERS = 4;
/** Vertex indicator radius */
const VERTEX_R = PARTICLE_SIZE.lg;
/** Control handle dot radius */
const HANDLE_R = PARTICLE_SIZE.md;
/** Path stroke weight */
const PATH_STROKE = STROKE.bold;
/** Shadow offset fraction */
const SHADOW_OFFSET = 0.004;
/** Smoothness threshold for "fully smoothed" */
const SMOOTH_THRESHOLD = 0.88;
/** Node travel speed (fraction per frame) */
const NODE_SPEED = 0.0035;
/** Flow field grid density */
const FLOW_GRID = 12;
/** Flow arrow max length */
const FLOW_ARROW_LEN = 0.025;
/** Flow field opacity */
const FLOW_ALPHA_BASE = 0.04;
/** Crash shake amplitude */
const CRASH_SHAKE_AMP = 0.006;
/** Crash shake duration frames */
const CRASH_SHAKE_DUR = 20;
/** Respawn delay frames */
const RESPAWN_DELAY = 80;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm * 1.2;
/** Completion spark count */
const SPARK_COUNT = 24;
/** Spark lifetime frames */
const SPARK_LIFE = 50;
/** Breath float amplitude */
const BREATH_FLOAT = 0.003;
/** Breath glow modulation */
const BREATH_GLOW_MOD = 0.2;
/** Specular highlight offset fraction */
const SPECULAR_OFFSET = 0.003;
/** Specular highlight size */
const SPECULAR_R = 0.004;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface EngineState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  handlePull: number;
  nodeT: number;
  nodeStopped: boolean;
  crashed: boolean;
  crashShake: number;
  dragging: boolean;
  dragStartX: number;
  dragStartY: number;
  completed: boolean;
  respawnTimer: number;
  sparks: Spark[];
  balanceFrames: number;
}

// =====================================================================
// HELPER: FLOW FIELD VELOCITY
// =====================================================================

/**
 * Compute flow velocity at a point relative to the path.
 * Returns a unit-ish direction vector influenced by the Bezier geometry.
 */
function flowVelocity(
  fx: number, fy: number,
  p1x: number, p1y: number,
  vx: number, vy: number,
  cpx: number, cpy: number,
  p2x: number, p2y: number,
  pull: number,
): [number, number] {
  // Distance to vertex / control area
  const dvx = fx - vx;
  const dvy = fy - vy;
  const dv = Math.sqrt(dvx * dvx + dvy * dvy) + 0.001;
  const influence = Math.max(0, 1 - dv * 3.5);

  // Default: flow from p1 toward p2 direction
  const baseAngle = Math.atan2(p2y - p1y, p2x - p1x);

  if (pull < 0.15) {
    // Stagnation near vertex — arrows shrink/die
    const stag = influence * (1 - pull / 0.15);
    return [
      Math.cos(baseAngle) * (1 - stag * 0.9),
      Math.sin(baseAngle) * (1 - stag * 0.9),
    ];
  }

  // Smoothed: arrows curve around the control point
  const curveAngle = Math.atan2(cpy - vy, cpx - vx);
  const blended = baseAngle + (curveAngle - baseAngle) * influence * pull;
  return [Math.cos(blended), Math.sin(blended)];
}

/**
 * Draw a small directional arrow.
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  dx: number, dy: number,
  len: number, color: string,
) {
  const ex = x + dx * len;
  const ey = y + dy * len;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  // Arrowhead
  const headLen = len * 0.3;
  const angle = Math.atan2(dy, dx);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - Math.cos(angle - 0.5) * headLen, ey - Math.sin(angle - 0.5) * headLen);
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - Math.cos(angle + 0.5) * headLen, ey - Math.sin(angle + 0.5) * headLen);
  ctx.stroke();
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SharpCornerHandleAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<EngineState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    handlePull: 0,
    nodeT: 0,
    nodeStopped: false,
    crashed: false,
    crashShake: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    completed: false,
    respawnTimer: 0,
    sparks: [],
    balanceFrames: 0,
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

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + VIGNETTE
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // Subtle vignette
      const vig = ctx.createRadialGradient(cx, cy, minDim * 0.25, cx, cy, minDim * 0.65);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, rgba(s.primaryRgb, 0.015 * entrance));
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // Path geometry: horizontal → vertex → upward
      const ext = px(PATH_EXTENT, minDim);
      const p1x = cx - ext * 0.9;
      const p1y = cy + ext * 0.15;
      const vertX = cx;
      const vertY = cy + ext * 0.15;
      const p2x = cx;
      const p2y = cy - ext * 0.75;
      const pull = s.handlePull;

      // Control point
      const cpx = vertX + px(HANDLE_REACH, minDim) * pull;
      const cpy = vertY - px(HANDLE_REACH, minDim) * pull;

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD (Phase Portrait)
      // ═══════════════════════════════════════════════════════════
      {
        const arrowLen = px(FLOW_ARROW_LEN, minDim);
        const breathDrift = breath * 0.3;
        const flowFade = entrance * (0.6 + pull * 0.4);
        ctx.lineWidth = px(STROKE.hairline, minDim);

        for (let gx = 0; gx < FLOW_GRID; gx++) {
          for (let gy = 0; gy < FLOW_GRID; gy++) {
            const fx = w * 0.1 + (gx / (FLOW_GRID - 1)) * w * 0.8;
            const fy = h * 0.08 + (gy / (FLOW_GRID - 1)) * h * 0.84;

            // Normalized coords for velocity calc
            const fnx = fx / w;
            const fny = fy / h;

            const [vdx, vdy] = flowVelocity(
              fnx, fny,
              p1x / w, p1y / h,
              vertX / w, vertY / h,
              cpx / w, cpy / h,
              p2x / w, p2y / h,
              pull,
            );

            const mag = Math.sqrt(vdx * vdx + vdy * vdy);
            const aLen = arrowLen * mag * (0.7 + breathDrift * 0.3);
            const alpha = FLOW_ALPHA_BASE * mag * flowFade;

            // Color: stagnant=accent, flowing=primary
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, mag * pull);
            ctx.strokeStyle = rgba(arrowColor, alpha);
            drawArrow(ctx, fx, fy, vdx, vdy, aLen, '');
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: PATH SHADOW + MAIN PATH
      // ═══════════════════════════════════════════════════════════
      const drawPath = (offsetX: number, offsetY: number, strokeColor: string, width: number) => {
        ctx.beginPath();
        ctx.moveTo(p1x + offsetX, p1y + offsetY);
        if (pull < 0.05) {
          ctx.lineTo(vertX + offsetX, vertY + offsetY);
          ctx.lineTo(p2x + offsetX, p2y + offsetY);
        } else {
          const bpx = vertX - minDim * 0.04 + offsetX;
          ctx.lineTo(bpx, vertY + offsetY);
          ctx.quadraticCurveTo(cpx + offsetX, cpy + offsetY, p2x + offsetX, p2y + offsetY);
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      };

      // Shadow
      const shadowOff = px(SHADOW_OFFSET, minDim);
      drawPath(shadowOff, shadowOff, rgba([0, 0, 0] as RGB, 0.03 * entrance), px(PATH_STROKE * 1.5, minDim));

      // Main path — gradient from accent (sharp) to primary (smooth)
      const pathColor = lerpColor(s.accentRgb, s.primaryRgb, pull);
      drawPath(0, 0, rgba(pathColor, ALPHA.focal.max * entrance), px(PATH_STROKE, minDim));

      // Path glow (subtle bloom along path)
      drawPath(0, 0, rgba(pathColor, ALPHA.glow.max * pull * entrance), px(PATH_STROKE * 3, minDim));

      // Once the handle starts teaching a true curve, reveal a destination lane.
      // The point is not just "this corner is softer" but "flow has somewhere to go."
      if (pull > 0.35) {
        const laneAlpha = ((pull - 0.35) / 0.65) * entrance;
        const laneOffsets = [0.016, -0.016];
        const bpx = vertX - minDim * 0.04;

        for (const laneOffset of laneOffsets) {
          ctx.beginPath();
          ctx.moveTo(vertX, vertY + laneOffset * minDim * 0.45);
          ctx.quadraticCurveTo(
            cpx,
            cpy + laneOffset * minDim,
            p2x,
            p2y + laneOffset * minDim * 0.65,
          );
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.11 * laneAlpha);
          ctx.lineWidth = px(PATH_STROKE * 1.7, minDim);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        for (let i = 0; i < 4; i++) {
          const tLane = 0.3 + i * 0.16;
          const u = tLane;
          const u1 = 1 - u;
          const lx = u1 * u1 * bpx + 2 * u1 * u * cpx + u * u * p2x;
          const ly = u1 * u1 * vertY + 2 * u1 * u * cpy + u * u * p2y;
          ctx.beginPath();
          ctx.arc(lx, ly, px(PARTICLE_SIZE.dot * 1.1, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.16 * laneAlpha);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4: VERTEX / CONTROL HANDLE
      // ═══════════════════════════════════════════════════════════
      if (pull < SMOOTH_THRESHOLD) {
        const vertexFade = (1 - pull / SMOOTH_THRESHOLD);

        // Vertex glow
        const vGlow = ctx.createRadialGradient(vertX, vertY, 0, vertX, vertY, px(VERTEX_R * 5, minDim));
        vGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * vertexFade * entrance));
        vGlow.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.min * vertexFade * entrance));
        vGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = vGlow;
        ctx.beginPath();
        ctx.arc(vertX, vertY, px(VERTEX_R * 5, minDim), 0, Math.PI * 2);
        ctx.fill();

        // Vertex dot
        const vr = px(VERTEX_R, minDim);
        const vGrad = ctx.createRadialGradient(vertX, vertY, 0, vertX, vertY, vr);
        vGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.3), ALPHA.focal.max * vertexFade * entrance));
        vGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.focal.max * vertexFade * entrance));
        vGrad.addColorStop(0.8, rgba(s.accentRgb, ALPHA.content.max * vertexFade * entrance));
        vGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(vertX, vertY, vr, 0, Math.PI * 2);
        ctx.fill();

        // Handle dot
        const hx = vertX + (cpx - vertX) * Math.max(0.18, pull);
        const hy = vertY + (cpy - vertY) * Math.max(0.18, pull);
        const hr = px(HANDLE_R, minDim) * (1 + breath * 0.1);

        // Handle glow
        const hGlow = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr * 4);
        hGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * entrance));
        hGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        hGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hGlow;
        ctx.beginPath();
        ctx.arc(hx, hy, hr * 4, 0, Math.PI * 2);
        ctx.fill();

        // Handle body
        const hGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
        hGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.focal.max * entrance));
        hGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        hGrad.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        hGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();

        // ═════════════════════════════════════════════════════════
        // LAYER 5: HANDLE CONNECTION LINE + FRESNEL GLOW
        // ═════════════════════════════════════════════════════════
        ctx.beginPath();
        ctx.moveTo(vertX, vertY);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.7 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Fresnel edge glow on connection line
        ctx.beginPath();
        ctx.moveTo(vertX, vertY);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim);
        ctx.stroke();

        // Specular on handle
        const specX = hx - px(SPECULAR_OFFSET, minDim);
        const specY = hy - px(SPECULAR_OFFSET, minDim);
        const specR = px(SPECULAR_R, minDim);
        ctx.beginPath();
        ctx.arc(specX, specY, specR, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.8 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // NODE PHYSICS
      // ═══════════════════════════════════════════════════════════
      if (!p.reducedMotion && !s.completed) {
        if (!s.nodeStopped && !s.crashed) {
          s.nodeT += NODE_SPEED;
          // Crash at sharp vertex
          if (s.nodeT >= 0.47 && s.nodeT <= 0.53 && pull < 0.15) {
            s.crashed = true;
            s.crashShake = CRASH_SHAKE_DUR;
            s.nodeStopped = true;
            s.nodeT = 0.5;
            cb.onHaptic('error_boundary');
          }
          // Successful pass-through
          if (s.nodeT >= 1) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
            // Spawn completion sparks
            for (let i = 0; i < SPARK_COUNT; i++) {
              const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.3;
              const speed = 0.002 + Math.random() * 0.004;
              s.sparks.push({
                x: p2x / w, y: p2y / h,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: SPARK_LIFE,
                maxLife: SPARK_LIFE,
                hue: Math.random(),
              });
            }
          }
        }
        if (s.crashShake > 0) s.crashShake--;
        // Resume after smoothing
        if (s.nodeStopped && pull >= 0.3) {
          s.nodeStopped = false;
          s.crashed = false;
          cb.onHaptic('drag_snap');
        }
      }

      // ═══════════════════════════════════════════════════════════
      // RESPAWN LOGIC
      // ═══════════════════════════════════════════════════════════
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.nodeT = 0;
          s.handlePull = 0;
          s.nodeStopped = false;
          s.crashed = false;
          s.completed = false;
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: TRAVELLING NODE
      // ═══════════════════════════════════════════════════════════
      if (!s.completed || s.sparks.length > 0) {
        // Node position
        let nx: number, ny: number;
        const t = Math.min(1, s.nodeT);
        if (t <= 0.5) {
          const leg = t * 2;
          nx = p1x + (vertX - p1x) * leg;
          ny = p1y + (vertY - p1y) * leg;
        } else {
          const leg = (t - 0.5) * 2;
          if (pull > 0.15) {
            const u = leg;
            const u1 = 1 - u;
            const bpx = vertX - minDim * 0.04;
            nx = u1 * u1 * bpx + 2 * u1 * u * cpx + u * u * p2x;
            ny = u1 * u1 * vertY + 2 * u1 * u * cpy + u * u * p2y;
          } else {
            nx = vertX + (p2x - vertX) * leg;
            ny = vertY + (p2y - vertY) * leg;
          }
        }

        const shakeOff = s.crashShake > 0
          ? Math.sin(s.crashShake * 2.5) * px(CRASH_SHAKE_AMP, minDim) * ms
          : 0;

        const breathPulse = 1 + breath * 0.1;
        nx += shakeOff;
        ny += Math.sin(s.frameCount * 0.04) * px(BREATH_FLOAT, minDim) * breath * ms;

        if (!s.completed) {
          // Multi-layer node glow
          for (let g = NODE_GLOW_LAYERS; g >= 1; g--) {
            const gr = px(NODE_RADIUS, minDim) * (1 + g * 1.2) * breathPulse;
            const ga = (ALPHA.glow.max / g) * entrance * (0.6 + pull * 0.4);
            const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
            nGlow.addColorStop(0, rgba(s.primaryRgb, ga));
            nGlow.addColorStop(0.4, rgba(s.primaryRgb, ga * 0.4));
            nGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = nGlow;
            ctx.beginPath();
            ctx.arc(nx, ny, gr, 0, Math.PI * 2);
            ctx.fill();
          }

          // Node body with gradient
          const nr = px(NODE_RADIUS, minDim) * breathPulse;
          const nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
          const coreColor = lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.35);
          nGrad.addColorStop(0, rgba(coreColor, ALPHA.accent.max * entrance));
          nGrad.addColorStop(0.35, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
          nGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * entrance));
          nGrad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = nGrad;
          ctx.beginPath();
          ctx.arc(nx, ny, nr, 0, Math.PI * 2);
          ctx.fill();

          // Specular on node
          const nSpecX = nx - px(SPECULAR_OFFSET * 1.5, minDim);
          const nSpecY = ny - px(SPECULAR_OFFSET * 1.5, minDim);
          ctx.beginPath();
          ctx.arc(nSpecX, nSpecY, px(SPECULAR_R * 0.8, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * entrance);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: PROGRESS RING
      // ═══════════════════════════════════════════════════════════
      {
        const ringR = px(PROGRESS_R, minDim);
        const progressVal = pull;
        ctx.beginPath();
        ctx.arc(vertX, vertY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressVal);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.min * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Background ring
        ctx.beginPath();
        ctx.arc(vertX, vertY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: COMPLETION BLOOM + SPARKS
      // ═══════════════════════════════════════════════════════════
      if (s.sparks.length > 0) {
        const alive: Spark[] = [];
        for (const sp of s.sparks) {
          sp.x += sp.vx * ms;
          sp.y += sp.vy * ms;
          sp.vy += 0.00003; // Gravity
          sp.life -= ms;
          if (sp.life > 0) {
            alive.push(sp);
            const t = sp.life / sp.maxLife;
            const sx = sp.x * w;
            const sy = sp.y * h;
            const sparkColor = lerpColor(s.primaryRgb, s.accentRgb, sp.hue);

            // Spark glow
            const sGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, px(PARTICLE_SIZE.sm, minDim) * 3);
            sGlow.addColorStop(0, rgba(sparkColor, ALPHA.accent.max * t * entrance));
            sGlow.addColorStop(0.5, rgba(sparkColor, ALPHA.glow.max * t * entrance));
            sGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = sGlow;
            ctx.beginPath();
            ctx.arc(sx, sy, px(PARTICLE_SIZE.sm, minDim) * 3, 0, Math.PI * 2);
            ctx.fill();

            // Spark core
            ctx.beginPath();
            ctx.arc(sx, sy, px(PARTICLE_SIZE.dot, minDim) * (0.5 + t * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.focal.max * t * entrance);
            ctx.fill();
          }
        }
        s.sparks = alive;

        // Central bloom
        if (s.completed && s.respawnTimer > RESPAWN_DELAY - 20) {
          const bloomT = (s.respawnTimer - (RESPAWN_DELAY - 20)) / 20;
          const bloomR = px(SIZE.md, minDim) * (1 - bloomT) * 2;
          const bloom = ctx.createRadialGradient(p2x, p2y, 0, p2x, p2y, bloomR);
          bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
          bloom.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
          bloom.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.min * bloomT * entrance));
          bloom.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bloom;
          ctx.beginPath();
          ctx.arc(p2x, p2y, bloomR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS (native addEventListener)
    // ══════��════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.dragging = true;
      s.dragStartX = e.clientX;
      s.dragStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.dragStartX;
      const dy = s.dragStartY - e.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newPull = Math.min(1, dist / 120);
      if (newPull > s.handlePull + 0.01) {
        s.handlePull = newPull;
        callbacksRef.current.onStateChange?.(s.handlePull * 0.9);
      }
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
