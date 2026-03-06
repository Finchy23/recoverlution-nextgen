/**
 * ATOM 026: THE PRUNING ENGINE
 * ===============================
 * Series 3 — Biomimetic Algorithms · Position 6
 *
 * Boundary setting re-framed as ecological maintenance. You are
 * not cutting people off in anger; you are pruning dead branches
 * so the fruit can grow. Identify the sucker branches — swipe
 * to cut. Feel the heavy garden shears snap. Watch the sap
 * immediately reroute into the main trunk, making it thicker,
 * brighter, more alive.
 *
 * PHYSICS:
 *   - Procedural tree: trunk + 8 branches (4 healthy, 4 dead)
 *   - Sap particles flow through all branches (energy distribution)
 *   - Dead branches: grey, thin, erratic flow, wilting tips
 *   - Swipe across a dead branch to cut it
 *   - Cut: resistance → SNAP → severed branch fragments scatter
 *   - Post-cut: sap reroutes, trunk thickens, healthy branches brighten
 *   - Energy redistribution is VISIBLE and immediate
 *   - After all dead branches pruned: full vitality, completion
 *
 * HAPTIC JOURNEY:
 *   Swipe (cutting) → swipe_commit (heavy shears snap)
 *   All pruned       → completion (soft swelling glow)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No sap flow animation, instant cut effect
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Total branch count (healthy + dead) */
const BRANCH_COUNT = 8;
/** Dead branch count */
const DEAD_COUNT = 4;
/** Trunk base width as fraction of minDim */
const TRUNK_WIDTH_FRAC = 0.012;
/** Trunk height as fraction of viewport height */
const TRUNK_HEIGHT_FRAC = 0.35;
/** Branch length as fraction of viewport width */
const BRANCH_LENGTH_FRAC = 0.15;
/** Sap particles per branch */
const SAP_PER_BRANCH = 6;
/** Sap flow speed */
const SAP_SPEED = 0.008;
/** Cut threshold: swipe must cross this fraction of branch length */
const CUT_CROSS_FRAC = 0.4;
/** Fragment count per cut branch */
const FRAGMENT_COUNT = 12;
/** Fragment gravity */
const FRAG_GRAVITY = 0.04;
/** Energy redistribution speed per frame */
const ENERGY_RAMP = 0.003;

// =====================================================================
// BRANCH
// =====================================================================

interface Branch {
  /** Branch angle (radians from vertical, positive = right) */
  angle: number;
  /** Branch length */
  length: number;
  /** Attachment height on trunk (0 = base, 1 = top) */
  attachT: number;
  /** Whether this is a dead (prunable) branch */
  isDead: boolean;
  /** Whether this branch has been cut */
  isCut: boolean;
  /** Width multiplier */
  widthMult: number;
  /** Sway phase */
  swayPhase: number;
  /** Individual visual seed for slight variation */
  seed: number;
  /** Start point (computed) */
  startX: number;
  startY: number;
  /** End point (computed) */
  endX: number;
  endY: number;
  /** Current energy (0–1) — starts distributed, increases after pruning */
  energy: number;
}

interface SapParticle {
  /** Which branch index this belongs to (-1 = trunk) */
  branchIdx: number;
  /** Parametric position along the branch/trunk (0→1) */
  t: number;
  speed: number;
  size: number;
  brightness: number;
}

interface Fragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  size: number;
  alpha: number;
}

function createBranches(w: number, h: number): Branch[] {
  const branches: Branch[] = [];
  const trunkBaseY = h * 0.85;
  const trunkTopY = trunkBaseY - h * TRUNK_HEIGHT_FRAC;
  const trunkX = w / 2;
  const branchLen = w * BRANCH_LENGTH_FRAC;

  // Create branches: alternating sides, dead ones interleaved
  const deadIndices = new Set<number>();
  // Place dead branches somewhat randomly
  while (deadIndices.size < DEAD_COUNT) {
    deadIndices.add(Math.floor(Math.random() * BRANCH_COUNT));
  }

  for (let i = 0; i < BRANCH_COUNT; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const attachT = 0.2 + (i / (BRANCH_COUNT - 1)) * 0.7;
    const isDead = deadIndices.has(i);

    // Angle: healthy branches reach upward, dead ones droop
    const baseAngle = (side * (0.4 + Math.random() * 0.3));
    const angle = isDead
      ? baseAngle + side * 0.3 + 0.2 // Droops further
      : baseAngle;

    const len = branchLen * (isDead ? (0.6 + Math.random() * 0.3) : (0.8 + Math.random() * 0.3));

    const startX = trunkX;
    const startY = trunkTopY + (trunkBaseY - trunkTopY) * (1 - attachT);
    const endX = startX + Math.sin(angle) * len;
    const endY = startY - Math.cos(angle) * len;

    branches.push({
      angle,
      length: len,
      attachT,
      isDead,
      isCut: false,
      widthMult: isDead ? 0.5 + Math.random() * 0.3 : 0.7 + Math.random() * 0.4,
      swayPhase: Math.random() * Math.PI * 2,
      seed: Math.random(),
      startX, startY,
      endX, endY,
      energy: isDead ? 0.2 : 0.5,
    });
  }

  return branches;
}

function createSapParticles(branches: Branch[]): SapParticle[] {
  const particles: SapParticle[] = [];

  // Trunk sap
  for (let i = 0; i < 10; i++) {
    particles.push({
      branchIdx: -1,
      t: Math.random(),
      speed: SAP_SPEED * (0.8 + Math.random() * 0.4),
      size: 1.5 + Math.random() * 1.5,
      brightness: 0.5 + Math.random() * 0.5,
    });
  }

  // Branch sap
  for (let b = 0; b < branches.length; b++) {
    for (let i = 0; i < SAP_PER_BRANCH; i++) {
      particles.push({
        branchIdx: b,
        t: Math.random(),
        speed: SAP_SPEED * (0.6 + Math.random() * 0.4) * (branches[b].isDead ? 0.3 : 1),
        size: 1 + Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  return particles;
}

// =====================================================================
// COLOR
// =====================================================================

// Pruning palette
const BARK_HEALTHY: RGB = [80, 65, 45];        // Warm living bark
const BARK_DEAD: RGB = [55, 50, 48];           // Grey dead wood
const SAP_ALIVE: RGB = [160, 200, 80];         // Flowing life energy
const SAP_WEAK: RGB = [70, 70, 55];            // Depleted sap
const FRUIT_GLOW: RGB = [200, 180, 70];        // Fruit/bud gold
const CANOPY_BG: RGB = [6, 9, 5];             // Deep forest night

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function PruningAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    branches: [] as Branch[],
    sapParticles: [] as SapParticle[],
    fragments: [] as Fragment[],
    // Swipe tracking
    isSwipeActive: false,
    swipeStartX: 0,
    swipeStartY: 0,
    swipeEndX: 0,
    swipeEndY: 0,
    // Pruning state
    cutCount: 0,
    trunkEnergy: 0.5,
    // Resolution
    resolved: false,
    resolveGlow: 0,
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    // ── Native swipe handlers ───────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isSwipeActive = true;
      s.swipeStartX = (e.clientX - rect.left) / rect.width * w;
      s.swipeStartY = (e.clientY - rect.top) / rect.height * h;
      s.swipeEndX = s.swipeStartX;
      s.swipeEndY = s.swipeStartY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isSwipeActive) return;
      s.swipeEndX = (e.clientX - rect.left) / rect.width * w;
      s.swipeEndY = (e.clientY - rect.top) / rect.height * h;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isSwipeActive) return;
      s.isSwipeActive = false;
      const cb = callbacksRef.current;

      const swipeDx = s.swipeEndX - s.swipeStartX;
      const swipeDy = s.swipeEndY - s.swipeStartY;
      const swipeLen = Math.sqrt(swipeDx * swipeDx + swipeDy * swipeDy);

      if (swipeLen < minDim * 0.05) { canvas.releasePointerCapture(e.pointerId); return; }

      for (const branch of s.branches) {
        if (!branch.isDead || branch.isCut) continue;
        if (linesIntersect(
          s.swipeStartX, s.swipeStartY, s.swipeEndX, s.swipeEndY,
          branch.startX, branch.startY, branch.endX, branch.endY,
        )) {
          branch.isCut = true;
          s.cutCount++;

          const midX = (branch.startX + branch.endX) / 2;
          const midY = (branch.startY + branch.endY) / 2;
          for (let i = 0; i < FRAGMENT_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            s.fragments.push({
              x: midX + (Math.random() - 0.5) * branch.length * 0.5,
              y: midY + (Math.random() - 0.5) * branch.length * 0.3,
              vx: Math.cos(angle) * speed + swipeDx * 0.01,
              vy: Math.sin(angle) * speed - 0.5,
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 0.1,
              size: minDim * (0.004 + Math.random() * 0.01),
              alpha: 0.4,
            });
          }

          const redistrib = branch.energy;
          const livingBranches = s.branches.filter(b => !b.isDead || !b.isCut);
          for (const lb of livingBranches) {
            lb.energy = Math.min(1, lb.energy + redistrib / livingBranches.length);
          }
          s.trunkEnergy = Math.min(1, s.trunkEnergy + redistrib * 0.3);
          cb.onHaptic('swipe_commit');

          if (s.cutCount >= DEAD_COUNT && !s.resolved) {
            s.resolved = true;
            cb.onHaptic('completion');
            cb.onResolve?.();
          }
          break;
        }
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.branches = createBranches(w, h);
      s.sapParticles = createSapParticles(s.branches);
      s.initialized = true;
    }

    const trunkBaseY = h * 0.85;
    const trunkTopY = trunkBaseY - h * TRUNK_HEIGHT_FRAC;
    const trunkX = w / 2;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Energy ramping (post-cut redistribution) ──────
      s.trunkEnergy = Math.min(1, s.trunkEnergy + ENERGY_RAMP * 0.1);
      for (const branch of s.branches) {
        if (!branch.isDead && branch.energy < 1) {
          branch.energy = Math.min(1, branch.energy + ENERGY_RAMP * s.cutCount * 0.15);
        }
      }

      // ── Sap particle flow ─────────────────────────────
      if (!p.reducedMotion) {
        for (const sap of s.sapParticles) {
          if (sap.branchIdx >= 0) {
            const branch = s.branches[sap.branchIdx];
            if (branch.isCut) continue; // Dead branch, no flow
          }
          sap.t += sap.speed;
          if (sap.t > 1) sap.t -= 1;
        }
      }

      // ── Fragment physics ──────────────────────────────
      for (const frag of s.fragments) {
        frag.vy += FRAG_GRAVITY;
        frag.x += frag.vx;
        frag.y += frag.vy;
        if (!p.reducedMotion) {
          frag.rotation += frag.rotSpeed;
        }
        frag.alpha = Math.max(0, frag.alpha - 0.002);
      }
      // Clean up dead fragments
      for (let i = s.fragments.length - 1; i >= 0; i--) {
        if (s.fragments[i].alpha <= 0 || s.fragments[i].y > h + 50) {
          s.fragments.splice(i, 1);
        }
      }

      // ── State reporting ───────────────────────────────
      cb.onStateChange?.(s.cutCount / DEAD_COUNT);

      // ── Resolution glow ───────────────────────────────
      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.004);
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor(CANOPY_BG, s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle organic atmosphere
      const atmGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.4);
      atmGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [12, 18, 8], 0.8), 0.03 * entrance));
      atmGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = atmGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Trunk ─────────────────────────────────────────
      const trunkW = minDim * TRUNK_WIDTH_FRAC * (1 + s.trunkEnergy * 0.8 + s.cutCount * 0.15);
      const trunkColor = lerpColor(BARK_HEALTHY, s.primaryRgb, 0.08);
      const trunkAlpha = (0.3 + s.trunkEnergy * 0.25) * entrance;

      // Trunk glow (energy)
      if (s.trunkEnergy > 0.4) {
        const tGlowW = trunkW * 4;
        const tGlowGrad = ctx.createLinearGradient(trunkX - tGlowW, 0, trunkX + tGlowW, 0);
        const sapColor = lerpColor(SAP_ALIVE, s.accentRgb, 0.15);
        tGlowGrad.addColorStop(0, rgba(sapColor, 0));
        tGlowGrad.addColorStop(0.5, rgba(sapColor, (s.trunkEnergy - 0.4) * 0.03 * entrance));
        tGlowGrad.addColorStop(1, rgba(sapColor, 0));
        ctx.fillStyle = tGlowGrad;
        ctx.fillRect(trunkX - tGlowW, trunkTopY, tGlowW * 2, trunkBaseY - trunkTopY);
      }

      // Trunk body
      ctx.beginPath();
      ctx.moveTo(trunkX - trunkW / 2, trunkBaseY);
      ctx.lineTo(trunkX - trunkW * 0.3, trunkTopY);
      ctx.lineTo(trunkX + trunkW * 0.3, trunkTopY);
      ctx.lineTo(trunkX + trunkW / 2, trunkBaseY);
      ctx.closePath();
      ctx.fillStyle = rgba(trunkColor, trunkAlpha);
      ctx.fill();

      // ── Branches ──────────────────────────────────────
      for (const branch of s.branches) {
        if (branch.isCut) continue;

        let sway = 0;
        if (!p.reducedMotion) {
          sway = Math.sin(s.frameCount * 0.005 + branch.swayPhase) * minDim * 0.004;
        }

        const ex = branch.endX + sway;
        const ey = branch.endY + sway * 0.3;

        const bWidth = minDim * TRUNK_WIDTH_FRAC * branch.widthMult * (0.5 + branch.energy * 0.5);
        const bColor = branch.isDead
          ? lerpColor(BARK_DEAD, s.primaryRgb, 0.05)
          : lerpColor(BARK_HEALTHY, s.primaryRgb, 0.08);
        const bAlpha = (branch.isDead ? 0.15 + branch.energy * 0.1 : 0.25 + branch.energy * 0.2) * entrance;

        // Branch glow (healthy only)
        if (!branch.isDead && branch.energy > 0.5) {
          const bGlowColor = lerpColor(SAP_ALIVE, s.accentRgb, 0.12);
          ctx.beginPath();
          ctx.moveTo(branch.startX, branch.startY);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = rgba(bGlowColor, (branch.energy - 0.5) * 0.04 * entrance);
          ctx.lineWidth = bWidth * 4;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Branch body
        ctx.beginPath();
        ctx.moveTo(branch.startX, branch.startY);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = rgba(bColor, bAlpha);
        ctx.lineWidth = bWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Dead branch: wilting tip indicator
        if (branch.isDead) {
          const droop = minDim * 0.008 + Math.sin(s.frameCount * 0.01 + branch.seed * 10) * (p.reducedMotion ? 0 : minDim * 0.002);
          ctx.beginPath();
          ctx.arc(ex, ey + droop, minDim * 0.004, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(BARK_DEAD, s.primaryRgb, 0.05), 0.1 * entrance);
          ctx.fill();
        }

        // Healthy branch: fruit/bud at tip
        if (!branch.isDead && branch.energy > 0.6) {
          const budSize = minDim * (0.004 + (branch.energy - 0.6) * 0.012);
          const budColor = lerpColor(FRUIT_GLOW, s.accentRgb, 0.15);
          const budAlpha = (branch.energy - 0.6) * 0.3 * entrance;

          const budGlowR = budSize * 3;
          const budGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, budGlowR);
          budGrad.addColorStop(0, rgba(budColor, budAlpha * 0.2));
          budGrad.addColorStop(1, rgba(budColor, 0));
          ctx.fillStyle = budGrad;
          ctx.fillRect(ex - budGlowR, ey - budGlowR, budGlowR * 2, budGlowR * 2);

          ctx.beginPath();
          ctx.arc(ex, ey, budSize * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = rgba(budColor, budAlpha);
          ctx.fill();
        }
      }

      // ── Sap particles ─────────────────────────────────
      if (!p.reducedMotion) {
        for (const sap of s.sapParticles) {
          let px: number, py: number;
          let sapEnergy: number;

          if (sap.branchIdx < 0) {
            // Trunk sap
            px = trunkX + (Math.random() - 0.5) * trunkW * 0.4;
            py = trunkBaseY - sap.t * (trunkBaseY - trunkTopY);
            sapEnergy = s.trunkEnergy;
          } else {
            const branch = s.branches[sap.branchIdx];
            if (branch.isCut) continue;
            px = branch.startX + (branch.endX - branch.startX) * sap.t;
            py = branch.startY + (branch.endY - branch.startY) * sap.t;
            sapEnergy = branch.energy;
          }

          const sapColor = lerpColor(
            lerpColor(SAP_WEAK, s.primaryRgb, 0.08),
            lerpColor(SAP_ALIVE, s.accentRgb, 0.1),
            sapEnergy,
          );
          const sapAlpha = sap.brightness * sapEnergy * 0.2 * entrance;

          if (sapAlpha < 0.01) continue;

          ctx.beginPath();
          ctx.arc(px, py, sap.size * minDim * 0.0008, 0, Math.PI * 2);
          ctx.fillStyle = rgba(sapColor, sapAlpha);
          ctx.fill();
        }
      }

      // ── Fragments (from cut branches) ─────────────────
      for (const frag of s.fragments) {
        if (frag.alpha <= 0) continue;
        const fragColor = lerpColor(BARK_DEAD, s.primaryRgb, 0.05);

        ctx.save();
        ctx.translate(frag.x, frag.y);
        ctx.rotate(frag.rotation);

        ctx.beginPath();
        ctx.rect(-frag.size / 2, -frag.size * 0.15, frag.size, frag.size * 0.3);
        ctx.fillStyle = rgba(fragColor, frag.alpha * entrance);
        ctx.fill();

        ctx.restore();
      }

      // ── Active swipe line (visual feedback) ───────────
      if (s.isSwipeActive) {
        const swipeDx = s.swipeEndX - s.swipeStartX;
        const swipeDy = s.swipeEndY - s.swipeStartY;
        const swipeLen = Math.sqrt(swipeDx * swipeDx + swipeDy * swipeDy);

        if (swipeLen > minDim * 0.02) {
          ctx.beginPath();
          ctx.moveTo(s.swipeStartX, s.swipeStartY);
          ctx.lineTo(s.swipeEndX, s.swipeEndY);
          ctx.strokeStyle = rgba(
            lerpColor([200, 200, 200], s.accentRgb, 0.2),
            0.08 * entrance,
          );
          ctx.lineWidth = minDim * 0.002;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // ── Resolution glow ───────────────────────────────
      if (s.resolveGlow > 0) {
        const rPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.02));
        const rColor = lerpColor(SAP_ALIVE, s.accentRgb, 0.15);
        const rR = minDim * 0.3;
        const rGrad = ctx.createRadialGradient(trunkX, trunkTopY, 0, trunkX, trunkTopY, rR);
        rGrad.addColorStop(0, rgba(rColor, s.resolveGlow * 0.1 * rPulse * entrance));
        rGrad.addColorStop(0.4, rgba(rColor, s.resolveGlow * 0.03 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad;
        ctx.fillRect(trunkX - rR, trunkTopY - rR, rR * 2, rR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}

// =====================================================================
// LINE INTERSECTION
// =====================================================================

function linesIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number,
): boolean {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 0.001) return false;

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}