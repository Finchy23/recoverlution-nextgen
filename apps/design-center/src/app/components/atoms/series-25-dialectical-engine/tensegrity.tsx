/**
 * ATOM 241: THE TENSEGRITY ENGINE
 * ==================================
 * Series 25 — Dialectical Engine · Position 1
 *
 * The structure floats because opposing tensions are perfectly balanced.
 * Conflicting emotions hold the psyche together — pull too hard and it
 * collapses; find the balance and it levitates with humming stillness.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - Between each strut pair, a standing-wave interference pattern
 *     renders visible constructive/destructive fringes
 *   - Balanced tension → bright fringes (constructive superposition)
 *   - Imbalance → fringes dissolve (destructive cancellation)
 *   - The fringe field teaches: opposing forces in harmony create beauty
 *
 * PHYSICS:
 *   - 6 node vertices forming a hexagonal tensegrity
 *   - 3 compression struts (rigid bars with gradient fills)
 *   - 12 tension cables with dynamic coloring (tension→accent, slack→primary)
 *   - Spring constraints maintain distance between connection points
 *   - Interference fringe field between strut endpoints
 *   - Over-pulling any node cascades collapse with error haptic
 *   - Perfect balance → all struts float → structure hums with stability
 *   - Balance progress visualized as ring + node glow intensification
 *   - Breath modulates rest-state breathing animation (gentle float)
 *   - Completion sparks radiate from center with dual-layer glow
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + center glow field
 *   2. Interference fringe field (signature technique)
 *   3. Tension cables with Fresnel glow
 *   4. Compression struts with shadow + gradient
 *   5. Nodes with multi-layer glow + specular
 *   6. Chromatic fringe halo at balance
 *   7. Progress ring
 *   8. Completion sparks
 *
 * INTERACTION:
 *   Drag nodes → perturb structure (drag_snap, error_boundary, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Balanced structure with full glow + fringes, static
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale, type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Vertex count (hexagonal) */
const NODE_COUNT = 6;
/** Compression strut pairs */
const STRUT_PAIRS: [number, number][] = [[0, 3], [1, 4], [2, 5]];
/** Hex layout radius */
const HEX_RADIUS = SIZE.md;
/** Spring stiffness for cable constraints */
const SPRING_K = 0.004;
/** Velocity damping per frame */
const DAMPING = 0.93;
/** Natural cable rest length */
const REST_DIST = 0.14;
/** Displacement threshold for collapse error */
const COLLAPSE_THRESHOLD = 0.08;
/** Displacement threshold for "balanced" */
const BALANCE_THRESHOLD = 0.015;
/** Frames in balance for completion */
const BALANCE_FRAMES_NEEDED = 100;
/** Node jewel radius */
const NODE_R = 0.012;
/** Compression strut width */
const STRUT_W = 0.004;
/** Tension cable width */
const CABLE_W = 0.001;
/** Glow bloom layers */
const GLOW_LAYERS = 5;
/** Center glow radius at full balance */
const CENTER_GLOW_R = SIZE.lg * 0.8;
/** Completion spark count */
const SPARK_COUNT = 10;
/** Spark lifetime (frames) */
const SPARK_LIFE = 45;
/** Progress ring radius */
const PROGRESS_R = SIZE.md * 0.65;
/** Breath float amplitude */
const BREATH_FLOAT = 0.003;
/** Breath glow modulation */
const BREATH_GLOW = 0.15;
/** Node glow layers */
const NODE_GLOW_LAYERS = 3;
/** Interference fringe wavelength (viewport fraction) */
const FRINGE_WAVELENGTH = 0.018;
/** Number of fringe sample lines per strut pair */
const FRINGE_SAMPLES = 40;
/** Fringe field perpendicular spread */
const FRINGE_SPREAD = 0.06;
/** Chromatic fringe halo radius at full balance */
const CHROMATIC_HALO_R = SIZE.md * 0.45;
/** Fresnel cable edge intensity */
const FRESNEL_INTENSITY = 0.12;

// =====================================================================
// STATE TYPES
// =====================================================================

interface TNode {
  x: number; y: number;
  vx: number; vy: number;
  restX: number; restY: number;
}

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  brightness: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function TensegrityAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildNodes = (): TNode[] => Array.from({ length: NODE_COUNT }, (_, i) => {
    const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
    return {
      x: 0.5 + Math.cos(angle) * HEX_RADIUS,
      y: 0.5 + Math.sin(angle) * HEX_RADIUS,
      vx: 0, vy: 0,
      restX: 0.5 + Math.cos(angle) * HEX_RADIUS,
      restY: 0.5 + Math.sin(angle) * HEX_RADIUS,
    };
  });

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodes: buildNodes(),
    dragIdx: -1,
    balance: 0,
    balanceFrames: 0,
    dragNotified: false,
    errorNotified: false,
    completed: false,
    sparks: [] as Spark[],
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

    // Build cable connections
    const cables: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      cables.push([i, (i + 1) % NODE_COUNT]);
      cables.push([i, (i + 2) % NODE_COUNT]);
    }

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

      // ── Reduced motion / resolve ────────────────────────
      if (p.reducedMotion || p.phase === 'resolve') {
        s.balance = 1;
        s.completed = true;
        for (const n of s.nodes) { n.x = n.restX; n.y = n.restY; n.vx = 0; n.vy = 0; }
      }

      // ════════════════════════════════════════════════════
      // SPRING PHYSICS
      // ════════════════════════════════════════════════════
      const breathOffset = Math.sin(time * 0.5) * BREATH_FLOAT * breath;

      for (let ni = 0; ni < s.nodes.length; ni++) {
        const n = s.nodes[ni];
        if (ni === s.dragIdx) continue;

        let fx = 0, fy = 0;

        // Spring to rest position (with breath float)
        const angle = (ni / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
        const breathRestX = n.restX + Math.cos(angle) * breathOffset;
        const breathRestY = n.restY + Math.sin(angle) * breathOffset;
        fx += (breathRestX - n.x) * SPRING_K * 2;
        fy += (breathRestY - n.y) * SPRING_K * 2;

        // Cable constraints
        for (const [a, b] of cables) {
          const otherIdx = a === ni ? b : b === ni ? a : -1;
          if (otherIdx < 0) continue;
          const other = s.nodes[otherIdx];
          const dx = other.x - n.x;
          const dy = other.y - n.y;
          const dist = Math.hypot(dx, dy);
          const diff = dist - REST_DIST;
          if (dist > 0.001) {
            fx += (dx / dist) * diff * SPRING_K;
            fy += (dy / dist) * diff * SPRING_K;
          }
        }

        n.vx = (n.vx + fx * ms) * DAMPING;
        n.vy = (n.vy + fy * ms) * DAMPING;
        n.x += n.vx * ms;
        n.y += n.vy * ms;
      }

      // ── Balance computation ─────────────────────────────
      let totalDisp = 0;
      for (const n of s.nodes) totalDisp += Math.hypot(n.x - n.restX, n.y - n.restY);
      const avgDisp = totalDisp / NODE_COUNT;
      s.balance = Math.max(0, Math.min(1, 1 - avgDisp / 0.06));

      if (s.balance > 0.85) s.balanceFrames += ms;
      else s.balanceFrames = Math.max(0, s.balanceFrames - 2);

      // ── Haptics ─────────────────────────────────────────
      if (avgDisp > COLLAPSE_THRESHOLD && !s.errorNotified) {
        s.errorNotified = true;
        cb.onHaptic('error_boundary');
        setTimeout(() => { stateRef.current.errorNotified = false; }, 800);
      }
      if (s.balanceFrames > BALANCE_FRAMES_NEEDED && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
        for (let i = 0; i < SPARK_COUNT; i++) {
          const sa = (i / SPARK_COUNT) * Math.PI * 2;
          const ss = 0.003 + Math.random() * 0.003;
          s.sparks.push({
            x: 0.5, y: 0.5,
            vx: Math.cos(sa) * ss, vy: Math.sin(sa) * ss,
            life: SPARK_LIFE,
            brightness: 0.5 + Math.random() * 0.5,
          });
        }
      }
      cb.onStateChange?.(s.completed ? 1 : s.balance * 0.95);

      const breathGlowMod = 1 + breath * BREATH_GLOW;

      // ── Spark physics ──────────────────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.life -= ms;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Center glow (balance indicator)
      // ════════════════════════════════════════════════════
      for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = px(CENTER_GLOW_R * (0.15 + s.balance * 0.7 + gi * 0.12), minDim) * breathGlowMod;
        const gA = ALPHA.glow.max * (0.015 + s.balance * 0.1) * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.2, rgba(s.primaryRgb, gA * 0.6));
        gg.addColorStop(0.5, rgba(s.primaryRgb, gA * 0.15));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Interference fringe field (SIGNATURE)
      // ════════════════════════════════════════════════════
      const fringeAlpha = ALPHA.glow.max * (0.03 + s.balance * 0.08) * entrance;
      const wl = px(FRINGE_WAVELENGTH, minDim);
      for (const [a, b] of STRUT_PAIRS) {
        const na = s.nodes[a];
        const nb = s.nodes[b];
        const midPx = (na.x + nb.x) / 2 * w;
        const midPy = (na.y + nb.y) / 2 * h;
        const strutAngle = Math.atan2(nb.y - na.y, nb.x - na.x);
        const perpAngle = strutAngle + Math.PI / 2;
        const strutLen = Math.hypot(nb.x - na.x, nb.y - na.y) * minDim;
        const spreadPx = px(FRINGE_SPREAD, minDim) * (0.5 + s.balance * 0.5);
        // Render fringe bands perpendicular to strut
        for (let fi = -FRINGE_SAMPLES; fi <= FRINGE_SAMPLES; fi++) {
          const t = fi / FRINGE_SAMPLES;
          const dist = t * spreadPx;
          const sx = midPx + Math.cos(perpAngle) * dist;
          const sy = midPy + Math.sin(perpAngle) * dist;
          // Double-slit interference: intensity = cos²(π·d/λ) × envelope
          const phaseShift = time * 0.8;
          const intensity = Math.pow(Math.cos(Math.PI * dist / wl + phaseShift), 2);
          const envelope = Math.exp(-t * t * 4); // Gaussian envelope
          const fA = fringeAlpha * intensity * envelope * breathGlowMod;
          if (fA < 0.001) continue;
          const fringeColor = lerpColor(s.primaryRgb, s.accentRgb, 0.5 + intensity * 0.5);
          ctx.beginPath();
          ctx.moveTo(
            sx - Math.cos(strutAngle) * strutLen * 0.35,
            sy - Math.sin(strutAngle) * strutLen * 0.35,
          );
          ctx.lineTo(
            sx + Math.cos(strutAngle) * strutLen * 0.35,
            sy + Math.sin(strutAngle) * strutLen * 0.35,
          );
          ctx.strokeStyle = rgba(fringeColor, fA);
          ctx.lineWidth = px(STROKE.hairline, minDim) * (0.5 + intensity);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Tension cables with Fresnel glow
      // ════════════════════════════════════════════════════
      for (const [a, b] of cables) {
        const na = s.nodes[a];
        const nb = s.nodes[b];
        const dist = Math.hypot(na.x - nb.x, na.y - nb.y);
        const tension = Math.abs(dist - REST_DIST) / REST_DIST;
        const cableColor = lerpColor(s.primaryRgb, s.accentRgb, Math.min(1, tension * 3));

        // Cable glow (when tense)
        if (tension > 0.1) {
          const midX = (na.x * w + nb.x * w) / 2;
          const midY = (na.y * h + nb.y * h) / 2;
          const cableGlowR = px(0.02 * tension, minDim);
          const cg = ctx.createRadialGradient(midX, midY, 0, midX, midY, cableGlowR);
          cg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.05 * tension * entrance));
          cg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.max * 0.02 * tension * entrance));
          cg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = cg;
          ctx.fillRect(midX - cableGlowR, midY - cableGlowR, cableGlowR * 2, cableGlowR * 2);
        }

        // Fresnel edge glow along cable length
        const cableLen = Math.hypot(na.x - nb.x, na.y - nb.y);
        const fresnelA = FRESNEL_INTENSITY * Math.min(1, cableLen / REST_DIST) * entrance;
        if (fresnelA > 0.005) {
          ctx.beginPath();
          ctx.moveTo(na.x * w, na.y * h);
          ctx.lineTo(nb.x * w, nb.y * h);
          ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), fresnelA * 0.5);
          ctx.lineWidth = px(CABLE_W * 3, minDim);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(na.x * w, na.y * h);
        ctx.lineTo(nb.x * w, nb.y * h);
        ctx.strokeStyle = rgba(cableColor, ALPHA.content.max * (0.06 + s.balance * 0.1) * entrance);
        ctx.lineWidth = px(CABLE_W + tension * 0.001, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Compression struts (gradient fills)
      // ════════════════════════════════════════════════════
      for (const [a, b] of STRUT_PAIRS) {
        const na = s.nodes[a];
        const nb = s.nodes[b];
        const ax = na.x * w, ay = na.y * h;
        const bx = nb.x * w, by = nb.y * h;

        // Strut shadow
        ctx.beginPath();
        ctx.moveTo(ax, ay + px(0.002, minDim));
        ctx.lineTo(bx, by + px(0.002, minDim));
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.03 * entrance);
        ctx.lineWidth = px(STRUT_W * 1.5, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Strut body with gradient
        const strutGrad = ctx.createLinearGradient(ax, ay, bx, by);
        strutGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * (0.15 + s.balance * 0.2) * entrance));
        strutGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * (0.12 + s.balance * 0.15) * entrance));
        strutGrad.addColorStop(1, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.15), ALPHA.content.max * (0.15 + s.balance * 0.2) * entrance));
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = strutGrad;
        ctx.lineWidth = px(STRUT_W, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Nodes with multi-layer glow + specular
      // ════════════════════════════════════════════════════
      for (const n of s.nodes) {
        const nx = n.x * w;
        const ny = n.y * h;
        const nR = px(NODE_R, minDim);

        // Node shadow
        const shadowR = nR * 2.5;
        const shadow = ctx.createRadialGradient(nx, ny + nR * 0.3, 0, nx, ny + nR * 0.3, shadowR);
        shadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.05 * entrance));
        shadow.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
        ctx.fillStyle = shadow;
        ctx.fillRect(nx - shadowR, ny - shadowR, shadowR * 2, shadowR * 2);

        // Multi-layer node glow
        for (let gi = NODE_GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = nR * (2 + gi * 2 + s.balance * 2);
          const gA = ALPHA.glow.max * (0.04 + s.balance * 0.06) * entrance / (gi + 1);
          const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, gR);
          ng.addColorStop(0, rgba(s.primaryRgb, gA));
          ng.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.4));
          ng.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = ng;
          ctx.fillRect(nx - gR, ny - gR, gR * 2, gR * 2);
        }

        // Node body (multi-stop gradient)
        const nodeGrad = ctx.createRadialGradient(
          nx - nR * 0.2, ny - nR * 0.2, nR * 0.1,
          nx, ny, nR,
        );
        const nodeAlpha = ALPHA.content.max * (0.2 + s.balance * 0.3) * entrance;
        nodeGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), nodeAlpha));
        nodeGrad.addColorStop(0.4, rgba(s.primaryRgb, nodeAlpha * 0.8));
        nodeGrad.addColorStop(1, rgba(s.primaryRgb, nodeAlpha * 0.3));
        ctx.beginPath();
        ctx.arc(nx, ny, nR, 0, Math.PI * 2);
        ctx.fillStyle = nodeGrad;
        ctx.fill();

        // Node edge
        ctx.beginPath();
        ctx.arc(nx, ny, nR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.1), ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Specular highlight
        if (nR > 1) {
          ctx.beginPath();
          ctx.ellipse(nx - nR * 0.2, ny - nR * 0.25, nR * 0.3, nR * 0.18, -0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.18 * (0.5 + s.balance * 0.5) * entrance);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Chromatic fringe halo at balance
      // ════════════════════════════════════════════════════
      if (s.balance > 0.3) {
        const haloR = px(CHROMATIC_HALO_R, minDim) * breathGlowMod;
        const haloIntensity = (s.balance - 0.3) / 0.7;
        // RGB split halo — slight offset per channel
        const offsets = [
          { rgb: [255, 120, 120] as RGB, dx: -2, dy: -1 },
          { rgb: [120, 255, 120] as RGB, dx: 0, dy: 1 },
          { rgb: [120, 120, 255] as RGB, dx: 2, dy: -1 },
        ];
        for (const off of offsets) {
          const hg = ctx.createRadialGradient(
            cx + off.dx, cy + off.dy, haloR * 0.7,
            cx + off.dx, cy + off.dy, haloR,
          );
          const hA = ALPHA.glow.max * 0.015 * haloIntensity * entrance;
          hg.addColorStop(0, rgba(off.rgb, 0));
          hg.addColorStop(0.5, rgba(off.rgb, hA));
          hg.addColorStop(0.8, rgba(off.rgb, hA * 0.3));
          hg.addColorStop(1, rgba(off.rgb, 0));
          ctx.fillStyle = hg;
          ctx.fillRect(cx - haloR - 5, cy - haloR - 5, haloR * 2 + 10, haloR * 2 + 10);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_R, minDim);
      const progressArc = Math.min(1, s.completed ? 1 : s.balanceFrames / BALANCE_FRAMES_NEEDED);

      // Track
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.02 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // Progress fill
      if (progressArc > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progressArc);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Completion sparks
      // ════════════════════════════════════════════════════
      for (const sp of s.sparks) {
        const lr = sp.life / SPARK_LIFE;
        const spx = sp.x * w;
        const spy = sp.y * h;
        const spR = px(0.004 * lr, minDim);

        // Spark glow
        const sgR = spR * 3;
        const sg = ctx.createRadialGradient(spx, spy, 0, spx, spy, sgR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * lr * sp.brightness * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(spx - sgR, spy - sgR, sgR * 2, sgR * 2);

        // Spark core
        ctx.beginPath();
        ctx.arc(spx, spy, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
          ALPHA.content.max * 0.4 * lr * sp.brightness * entrance,
        );
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ───────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      for (let i = 0; i < s.nodes.length; i++) {
        if (Math.hypot(mx - s.nodes[i].x, my - s.nodes[i].y) < 0.06) {
          s.dragIdx = i;
          if (!s.dragNotified) {
            s.dragNotified = true;
            callbacksRef.current.onHaptic('drag_snap');
          }
          canvas.setPointerCapture(e.pointerId);
          break;
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragIdx < 0) return;
      const rect = canvas.getBoundingClientRect();
      s.nodes[s.dragIdx].x = (e.clientX - rect.left) / rect.width;
      s.nodes[s.dragIdx].y = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragIdx = -1;
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