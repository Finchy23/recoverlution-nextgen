/**
 * ATOM 233: THE MYCELIUM NETWORK ENGINE
 * =======================================
 * Series 24 — Net of Indra · Position 3
 *
 * Five isolated trees above ground — drag downward to reveal the
 * massive bioluminescent root network connecting them all underneath.
 * The hidden connections are more vast than the visible separation.
 *
 * PHYSICS:
 *   - 5 "tree" nodes along top 1/3 of viewport, visually separate
 *   - Drag downward → reveals underground mycelium network
 *   - Network built as branching L-system from each tree's root
 *   - Bioluminescent pulse propagates through branches when revealed
 *   - Each branch segment has its own glow phase for wave propagation
 *   - Nutrient particles travel along branches between trees
 *   - Full reveal shows ALL trees connected → completion bloom
 *   - Breath modulates bioluminescent pulse intensity
 *
 * INTERACTION:
 *   Drag downward → reveals underground network depth
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static fully-revealed network with glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Number of surface trees */
const TREE_COUNT = 5;
/** Tree trunk height (fraction of viewport) */
const TRUNK_HEIGHT = 0.08;
/** Tree canopy radius */
const CANOPY_R = 0.025;
/** Ground line Y position (fraction) */
const GROUND_Y = 0.32;
/** Maximum network reveal depth (fraction) */
const MAX_DEPTH = 0.55;
/** Drag sensitivity for reveal */
const DRAG_SENSITIVITY = 0.003;
/** Branch segments per tree root */
const BRANCHES_PER_TREE = 8;
/** Branch depth levels */
const BRANCH_DEPTH = 3;
/** Bioluminescent pulse speed */
const PULSE_SPEED = 0.015;
/** Pulse wave length */
const PULSE_WAVELENGTH = 0.3;
/** Breath luminescence multiplier */
const BREATH_LUMINESCENCE = 0.25;
/** Nutrient particle count */
const NUTRIENT_COUNT = 20;
/** Nutrient travel speed */
const NUTRIENT_SPEED = 0.004;
/** Glow layers per branch junction */
const GLOW_LAYERS = 3;
/** Completion reveal threshold */
const COMPLETE_THRESHOLD = 0.85;

// =====================================================================
// STATE TYPES
// =====================================================================

interface BranchSegment {
  /** Start position (fraction) */
  x1: number; y1: number;
  /** End position */
  x2: number; y2: number;
  /** Which tree this branch belongs to */
  treeIdx: number;
  /** Depth level 0-2 */
  depth: number;
  /** Phase offset for pulse wave */
  pulsePhase: number;
  /** Branch thickness multiplier */
  thickness: number;
}

interface NutrientParticle {
  /** Current branch index */
  branchIdx: number;
  /** Progress along branch 0-1 */
  t: number;
  /** Direction: 1 = forward, -1 = reverse */
  dir: number;
  /** Visual size */
  size: number;
  /** Brightness */
  brightness: number;
}

// =====================================================================
// HELPERS
// =====================================================================

/** Generate L-system branching from tree roots */
function generateBranches(): BranchSegment[] {
  const branches: BranchSegment[] = [];
  const treeXs = Array.from({ length: TREE_COUNT }, (_, i) =>
    0.12 + (i / (TREE_COUNT - 1)) * 0.76,
  );

  for (let ti = 0; ti < TREE_COUNT; ti++) {
    const rootX = treeXs[ti];
    const rootY = GROUND_Y;

    // Generate branching structure
    const generateLevel = (x: number, y: number, angle: number, depth: number, parentThickness: number) => {
      if (depth >= BRANCH_DEPTH) return;
      const branchCount = depth === 0 ? 3 : 2;
      const spreadAngle = depth === 0 ? 0.8 : 0.5;

      for (let b = 0; b < branchCount; b++) {
        const branchAngle = angle + (b / (branchCount - 1) - 0.5) * spreadAngle * 2 +
          (Math.random() - 0.5) * 0.3;
        const length = (0.06 + Math.random() * 0.04) / (depth + 1);
        const endX = x + Math.cos(branchAngle) * length;
        const endY = y + Math.sin(branchAngle) * length * 0.8;
        const thickness = parentThickness * 0.6;

        branches.push({
          x1: x, y1: y,
          x2: Math.max(0.02, Math.min(0.98, endX)),
          y2: Math.min(GROUND_Y + MAX_DEPTH, Math.max(GROUND_Y + 0.02, endY)),
          treeIdx: ti,
          depth,
          pulsePhase: branches.length * 0.15,
          thickness,
        });

        generateLevel(endX, endY, branchAngle, depth + 1, thickness);
      }
    };

    // Main root goes downward with slight angle
    const mainAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
    generateLevel(rootX, rootY, mainAngle, 0, 1);
  }

  // Add cross-connections between nearest trees at deepest level
  const deepBranches = branches.filter(b => b.depth === BRANCH_DEPTH - 1);
  for (let i = 0; i < deepBranches.length - 1; i++) {
    const a = deepBranches[i];
    const b = deepBranches[i + 1];
    if (a.treeIdx !== b.treeIdx && Math.hypot(a.x2 - b.x2, a.y2 - b.y2) < 0.2) {
      branches.push({
        x1: a.x2, y1: a.y2,
        x2: b.x2, y2: b.y2,
        treeIdx: -1, // cross-connection
        depth: BRANCH_DEPTH,
        pulsePhase: branches.length * 0.15,
        thickness: 0.3,
      });
    }
  }

  return branches;
}

/** Create nutrient particles */
function createNutrients(branchCount: number): NutrientParticle[] {
  return Array.from({ length: NUTRIENT_COUNT }, () => ({
    branchIdx: Math.floor(Math.random() * branchCount),
    t: Math.random(),
    dir: Math.random() > 0.5 ? 1 : -1,
    size: 0.002 + Math.random() * 0.002,
    brightness: 0.4 + Math.random() * 0.6,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MyceliumNetworkAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const branches = useRef(generateBranches());

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    revealDepth: 0,     // 0-1 how much underground is visible
    dragging: false,
    lastY: 0,
    completed: false,
    stepNotified: false,
    completionGlow: 0,
    nutrients: createNutrients(branches.current.length),
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
    const allBranches = branches.current;

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

      if (p.reducedMotion || p.phase === 'resolve') {
        s.revealDepth = 1;
        s.completed = true;
      }

      // ── Completion tracking ─────────────────────────────
      if (s.revealDepth >= COMPLETE_THRESHOLD && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.revealDepth >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      }

      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : s.revealDepth * 0.5);

      const reveal = easeOutExpo(s.revealDepth);
      const revealY = GROUND_Y + reveal * MAX_DEPTH;

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Underground background gradient
      // ════════════════════════════════════════════════════
      if (reveal > 0.01) {
        const groundPx = GROUND_Y * h;
        const underGrad = ctx.createLinearGradient(0, groundPx, 0, groundPx + reveal * MAX_DEPTH * h);
        underGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.04 * entrance));
        underGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.02 * entrance));
        underGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = underGrad;
        ctx.fillRect(0, groundPx, w, reveal * MAX_DEPTH * h);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Ground line
      // ════════════════════════════════════════════════════
      const groundPxY = GROUND_Y * h;
      ctx.beginPath();
      ctx.moveTo(0, groundPxY);
      ctx.lineTo(w, groundPxY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Mycelium branches
      // ════════════════════════════════════════════════════
      const lumBreath = 1 + breath * BREATH_LUMINESCENCE;

      for (const branch of allBranches) {
        // Only render if within reveal depth
        if (branch.y1 > revealY && branch.y2 > revealY) continue;

        const bx1 = branch.x1 * w;
        const by1 = branch.y1 * h;
        const bx2 = branch.x2 * w;
        const by2 = Math.min(branch.y2, revealY) * h;

        // Bioluminescent pulse
        const pulse = Math.sin(time * PULSE_SPEED / 0.012 + branch.pulsePhase) * 0.5 + 0.5;
        const depthFade = 1 - branch.depth * 0.2;
        const branchAlpha = ALPHA.content.max * (0.05 + pulse * 0.12 * lumBreath) * depthFade * entrance;

        // Branch glow (behind)
        if (pulse > 0.4 && branch.depth < 2) {
          const midX = (bx1 + bx2) / 2;
          const midY = (by1 + by2) / 2;
          const glowR = px(0.02 * depthFade * pulse, minDim);
          const bg = ctx.createRadialGradient(midX, midY, 0, midX, midY, glowR);
          bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * pulse * lumBreath * entrance));
          bg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = bg;
          ctx.fillRect(midX - glowR, midY - glowR, glowR * 2, glowR * 2);
        }

        // Branch line
        const branchColor = branch.treeIdx === -1
          ? lerpColor(s.primaryRgb, s.accentRgb, 0.4)
          : s.primaryRgb;

        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        // Slight curve for organic feel
        const cpx = (bx1 + bx2) / 2 + (Math.sin(branch.pulsePhase) * px(0.01, minDim));
        const cpy = (by1 + by2) / 2;
        ctx.quadraticCurveTo(cpx, cpy, bx2, by2);
        ctx.strokeStyle = rgba(branchColor, branchAlpha);
        ctx.lineWidth = px(STROKE.thin + branch.thickness * STROKE.light, minDim);
        ctx.stroke();

        // Junction glow at endpoints
        if (branch.depth === 0 && pulse > 0.5) {
          for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
            const jR = px(0.005 + gi * 0.004, minDim) * pulse;
            const jg = ctx.createRadialGradient(bx2, by2, 0, bx2, by2, jR);
            jg.addColorStop(0, rgba(branchColor, ALPHA.glow.max * 0.08 * pulse * entrance / (gi + 1)));
            jg.addColorStop(1, rgba(branchColor, 0));
            ctx.fillStyle = jg;
            ctx.fillRect(bx2 - jR, by2 - jR, jR * 2, jR * 2);
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Nutrient particles
      // ════════════════════════════════════════════════════
      for (const np of s.nutrients) {
        np.t += np.dir * NUTRIENT_SPEED * ms;
        if (np.t > 1 || np.t < 0) {
          np.dir *= -1;
          np.t = Math.max(0, Math.min(1, np.t));
        }

        const branch = allBranches[np.branchIdx];
        if (!branch || branch.y2 > revealY) continue;

        const npx = (branch.x1 + (branch.x2 - branch.x1) * np.t) * w;
        const npy = (branch.y1 + (branch.y2 - branch.y1) * np.t) * h;
        const nR = px(np.size, minDim);

        // Particle glow
        const pgR = nR * 3;
        const pg = ctx.createRadialGradient(npx, npy, 0, npx, npy, pgR);
        pg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * np.brightness * entrance));
        pg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pg;
        ctx.fillRect(npx - pgR, npy - pgR, pgR * 2, pgR * 2);

        // Particle core
        ctx.beginPath();
        ctx.arc(npx, npy, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
          ALPHA.content.max * 0.3 * np.brightness * entrance,
        );
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Surface trees
      // ════════════════════════════════════════════════════
      const treeXs = Array.from({ length: TREE_COUNT }, (_, i) =>
        0.12 + (i / (TREE_COUNT - 1)) * 0.76,
      );

      for (let ti = 0; ti < TREE_COUNT; ti++) {
        const tx = treeXs[ti] * w;
        const groundY = GROUND_Y * h;

        // Trunk
        ctx.beginPath();
        ctx.moveTo(tx, groundY);
        ctx.lineTo(tx, groundY - TRUNK_HEIGHT * h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Canopy (circle with gradient)
        const canR = px(CANOPY_R, minDim);
        const canY = groundY - TRUNK_HEIGHT * h - canR;

        // Canopy glow
        const cgR = canR * 2.5;
        const cg = ctx.createRadialGradient(tx, canY, canR * 0.3, tx, canY, cgR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(tx - cgR, canY - cgR, cgR * 2, cgR * 2);

        // Canopy body
        const canGrad = ctx.createRadialGradient(
          tx - canR * 0.2, canY - canR * 0.2, canR * 0.1,
          tx, canY, canR,
        );
        canGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * 0.3 * entrance));
        canGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
        canGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
        ctx.beginPath();
        ctx.arc(tx, canY, canR, 0, Math.PI * 2);
        ctx.fillStyle = canGrad;
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.ellipse(tx - canR * 0.2, canY - canR * 0.2, canR * 0.25, canR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.15 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Completion halo
      // ════════════════════════════════════════════════════
      if (s.completionGlow > 0) {
        const haloR = px(0.4, minDim);
        const haloY = (GROUND_Y + MAX_DEPTH * 0.4) * h;
        const hg = ctx.createRadialGradient(cx, haloY, 0, cx, haloY, haloR);
        hg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * s.completionGlow * entrance));
        hg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * s.completionGlow * entrance));
        hg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(cx - haloR, haloY - haloR, haloR * 2, haloR * 2);
      }

      // ── Progress ring ──────────────────────────────────
      if (!s.completed && s.revealDepth > 0.02) {
        const progR = px(SIZE.xs, minDim);
        ctx.beginPath();
        ctx.arc(cx, GROUND_Y * h - px(0.06, minDim), progR, -Math.PI / 2, -Math.PI / 2 + s.revealDepth * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Drag downward to reveal ──────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dy = e.clientY - s.lastY;
      if (dy > 0) {
        s.revealDepth = Math.min(1, s.revealDepth + dy * DRAG_SENSITIVITY);
        if (s.revealDepth > 0.1 && !s.stepNotified) {
          callbacksRef.current.onHaptic('drag_snap');
        }
      }
      s.lastY = e.clientY;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }}
      />
    </div>
  );
}
