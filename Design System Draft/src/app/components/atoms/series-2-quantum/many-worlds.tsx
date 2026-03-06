/**
 * ATOM 014: THE MANY-WORLDS ENGINE
 * ==================================
 * Series 2 — Quantum Mechanics · Position 4
 *
 * Fatalism is the belief you're locked on a single doomed track.
 * This atom proves that every micro-choice forks reality into
 * infinite new timelines. You are never stuck — at every moment,
 * branches exist.
 *
 * A luminous timeline trunk rises from the bottom. At each
 * decision node, it forks into 2–3 branches. The user drags
 * their "core" point of light forward. At each fork they swipe
 * to choose a branch. Chosen branches solidify; unchosen ones
 * fade to ghost trails that shimmer faintly — still real in
 * many-worlds, just de-prioritised.
 *
 * PHYSICS:
 *   - Procedural Bezier-curve tree generation
 *   - Each fork: 2–3 branches with organic curvature
 *   - Core particle follows chosen path with momentum
 *   - Swipe direction picks the branch
 *   - Unchosen branches: exponential opacity decay
 *   - Ghost trails never vanish — they shimmer
 *   - Camera scrolls to track core progress
 *   - At resolution: full tree visible as branching history
 *
 * INTERACTION:
 *   Drag / Swipe → choose branch at fork
 *   Observable   → tree gently sways, ghosts shimmer
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static tree, no sway, instant branch selection
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of fork levels in the tree */
const FORK_COUNT = 5;
/** Vertical spacing between forks as fraction of viewport height */
const FORK_SPACING_FRAC = 0.3;
/** Maximum lateral spread per branch (fraction of width) */
const MAX_SPREAD = 0.25;
/** Branch curve control point offset (fraction of fork spacing) */
const CURVE_OFFSET = 0.4;
/** Core particle radius */
const CORE_RADIUS = 6;
/** Core glow radius multiplier */
const CORE_GLOW_MULT = 8;
/** Ghost branch minimum opacity */
const GHOST_MIN_OPACITY = 0.04;
/** Ghost fade rate per frame */
const GHOST_FADE_RATE = 0.015;
/** Swipe threshold to choose a branch (pixels) */
const SWIPE_THRESHOLD = 25;
/** How many chevrons to show per branch hint */
const HINT_CHEVRON_COUNT = 3;
/** Chevron travel speed along branch (fraction per frame) */
const CHEVRON_SPEED = 0.004;
/** First-fork hint text fade duration (frames) */
const HINT_TEXT_FADE_FRAMES = 90;

// =====================================================================
// TREE GENERATION
// =====================================================================

interface BranchNode {
  x: number;
  y: number;
}

interface Branch {
  from: BranchNode;
  to: BranchNode;
  /** Control point for the Bezier curve */
  cx: number;
  cy: number;
  /** Which fork level this branch belongs to */
  forkLevel: number;
  /** Index within this fork's branches */
  branchIndex: number;
  /** Is this the chosen branch? */
  chosen: boolean;
  /** Current opacity (1 = solid, fades to ghost) */
  opacity: number;
  /** Target opacity */
  targetOpacity: number;
  /** Width */
  width: number;
  /** Sway phase offset */
  swayPhase: number;
}

interface Fork {
  /** Y position of this fork */
  y: number;
  /** X position of the fork point */
  x: number;
  /** Branches emanating from this fork */
  branches: Branch[];
  /** Which branch was chosen (-1 = not yet) */
  chosenIndex: number;
  /** Whether the core has reached this fork */
  reached: boolean;
}

function generateTree(w: number, h: number): Fork[] {
  const forks: Fork[] = [];
  const totalH = FORK_COUNT * h * FORK_SPACING_FRAC;
  const startY = totalH + h * 0.15;
  let currentX = w / 2;

  for (let level = 0; level < FORK_COUNT; level++) {
    const forkY = startY - (level + 1) * h * FORK_SPACING_FRAC;
    const branchCount = 2 + (level % 2 === 0 ? 1 : 0); // Alternate 2 and 3 branches

    const branches: Branch[] = [];
    const spread = w * MAX_SPREAD * (0.6 + Math.random() * 0.4);

    for (let b = 0; b < branchCount; b++) {
      const fraction = branchCount === 1 ? 0.5 : b / (branchCount - 1);
      const targetX = currentX + (fraction - 0.5) * spread * 2;
      const clampedX = Math.max(w * 0.1, Math.min(w * 0.9, targetX));

      // Bezier control point — organic curvature
      const cpFraction = CURVE_OFFSET + Math.random() * 0.2;
      const cpY = forkY + (startY - (level) * h * FORK_SPACING_FRAC - forkY) * cpFraction;
      const cpX = (currentX + clampedX) / 2 + (Math.random() - 0.5) * spread * 0.3;

      branches.push({
        from: { x: currentX, y: startY - level * h * FORK_SPACING_FRAC },
        to: { x: clampedX, y: forkY },
        cx: cpX,
        cy: cpY,
        forkLevel: level,
        branchIndex: b,
        chosen: false,
        opacity: level === 0 ? 0.5 : 0.35,
        targetOpacity: level === 0 ? 0.5 : 0.35,
        width: 2.5 - level * 0.2,
        swayPhase: Math.random() * Math.PI * 2,
      });
    }

    forks.push({
      y: forkY,
      x: currentX,
      branches,
      chosenIndex: -1,
      reached: level === 0,
    });

    // For the next level, use the center branch's end as the new current X
    const midBranch = branches[Math.floor(branches.length / 2)];
    currentX = midBranch.to.x;
  }

  return forks;
}

/** Evaluate quadratic Bezier at parameter t */
function bezierPoint(
  x0: number, y0: number,
  cx: number, cy: number,
  x1: number, y1: number,
  t: number,
): [number, number] {
  const t1 = 1 - t;
  return [
    t1 * t1 * x0 + 2 * t1 * t * cx + t * t * x1,
    t1 * t1 * y0 + 2 * t1 * t * cy + t * t * y1,
  ];
}

// =====================================================================
// COLOR
// =====================================================================

// Timeline palette
const CHOSEN_COLOR: RGB = [180, 170, 255];   // Bright lavender (chosen path)
const GHOST_COLOR: RGB = [100, 90, 140];     // Faded purple (unchosen)
const CORE_COLOR: RGB = [230, 225, 255];     // Core particle white-lavender
const NODE_COLOR: RGB = [150, 140, 200];     // Fork node glow

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ManyWorldsAtom({
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

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    forks: [] as Fork[],
    // Core particle
    coreX: 0,
    coreY: 0,
    coreTargetX: 0,
    coreTargetY: 0,
    currentFork: 0,
    coreProgress: 0, // 0–1 along current branch
    // Camera
    cameraY: 0,
    targetCameraY: 0,
    // Interaction
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragDeltaX: 0,
    waitingForChoice: false,
    // Resolution
    resolved: false,
    resolveGlow: 0,
    // Hint tracking
    firstChoiceMade: false,
    hintTextFade: 1, // starts visible, fades after first choice
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    // Colors
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

    if (!s.initialized) {
      s.forks = generateTree(w, h);
      // Set initial core position at the base
      const firstFork = s.forks[0];
      if (firstFork) {
        const firstBranch = firstFork.branches[0];
        s.coreX = firstBranch.from.x;
        s.coreY = firstBranch.from.y;
        s.coreTargetX = s.coreX;
        s.coreTargetY = s.coreY;
      }
      s.waitingForChoice = true;
      s.initialized = true;
    }

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

      // ── Core travel along chosen branch ───────────────
      if (!s.waitingForChoice && s.currentFork < s.forks.length) {
        const fork = s.forks[s.currentFork];
        const chosenBranch = fork.branches[fork.chosenIndex];

        if (chosenBranch) {
          s.coreProgress = Math.min(1, s.coreProgress + (p.reducedMotion ? 0.05 : 0.012));

          const [tx, ty] = bezierPoint(
            chosenBranch.from.x, chosenBranch.from.y,
            chosenBranch.cx, chosenBranch.cy,
            chosenBranch.to.x, chosenBranch.to.y,
            easeOutExpo(s.coreProgress),
          );
          s.coreTargetX = tx;
          s.coreTargetY = ty;

          // Reached the next fork
          if (s.coreProgress >= 1) {
            s.currentFork++;
            if (s.currentFork < s.forks.length) {
              // Update next fork's branches to start from chosen endpoint
              const nextFork = s.forks[s.currentFork];
              nextFork.reached = true;
              nextFork.x = chosenBranch.to.x;
              for (const branch of nextFork.branches) {
                branch.from = { ...chosenBranch.to };
              }
              s.waitingForChoice = true;
              s.coreProgress = 0;
            } else {
              // All forks completed
              if (!s.resolved) {
                s.resolved = true;
                cb.onHaptic('completion');
                cb.onResolve?.();
              }
            }
          }
        }
      }

      // Smooth core position
      s.coreX += (s.coreTargetX - s.coreX) * 0.12;
      s.coreY += (s.coreTargetY - s.coreY) * 0.12;

      // ── Camera tracking ───────────────────────────────
      s.targetCameraY = s.coreY - h * 0.6;
      s.cameraY += (s.targetCameraY - s.cameraY) * 0.04;

      // ── Ghost opacity decay ───────────────────────────
      for (const fork of s.forks) {
        for (const branch of fork.branches) {
          const diff = branch.targetOpacity - branch.opacity;
          branch.opacity += diff * GHOST_FADE_RATE;
        }
      }

      // ── State reporting ───────────────────────────────
      const progress = (s.currentFork + (s.waitingForChoice ? 0 : s.coreProgress)) / FORK_COUNT;
      cb.onStateChange?.(Math.min(1, progress));

      // ── Resolution glow ───────────────────────────────
      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.006);
      }

      // ── Hint text fade ────────────────────────────────
      if (s.firstChoiceMade) {
        s.hintTextFade = Math.max(0, s.hintTextFade - 1 / HINT_TEXT_FADE_FRAMES);
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const camY = s.cameraY;

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([5, 4, 14], s.primaryRgb, 0.03);
      const minDim = Math.min(w, h);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle vertical gradient (depth)
      const depthGrad = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, minDim * 0.5);
      depthGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [15, 10, 30], 0.8), 0.03 * entrance));
      depthGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = depthGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Draw branches ─────────────────────────────────
      for (const fork of s.forks) {
        for (const branch of fork.branches) {
          if (branch.opacity < 0.005) continue;

          const y0 = branch.from.y - camY;
          const y1 = branch.to.y - camY;
          const yc = branch.cy - camY;

          // Skip if entirely off screen
          if (Math.min(y0, y1, yc) > h + 50 || Math.max(y0, y1, yc) < -50) continue;

          const branchEntrance = easeOutExpo(
            Math.max(0, Math.min(1, (entrance - branch.forkLevel * 0.1) / 0.6)),
          );
          if (branchEntrance <= 0) continue;

          // Sway
          const sway = p.reducedMotion ? 0 :
            Math.sin(s.frameCount * 0.008 + branch.swayPhase) * 2;

          const isChosen = branch.chosen;
          const brColor = isChosen
            ? lerpColor(CHOSEN_COLOR, s.accentRgb, 0.2)
            : lerpColor(GHOST_COLOR, s.primaryRgb, 0.15);

          // Glow pass for chosen branches
          if (isChosen && branch.opacity > 0.5) {
            ctx.beginPath();
            ctx.moveTo(branch.from.x + sway * 0.5, y0);
            ctx.quadraticCurveTo(branch.cx + sway, yc, branch.to.x + sway * 0.5, y1);
            ctx.strokeStyle = rgba(brColor, branch.opacity * 0.08 * branchEntrance);
            ctx.lineWidth = branch.width * 6;
            ctx.lineCap = 'round';
            ctx.stroke();
          }

          // Main branch line
          ctx.beginPath();
          ctx.moveTo(branch.from.x + sway * 0.5, y0);
          ctx.quadraticCurveTo(branch.cx + sway, yc, branch.to.x + sway * 0.5, y1);
          ctx.strokeStyle = rgba(brColor, branch.opacity * branchEntrance);
          ctx.lineWidth = branch.width;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Ghost shimmer for unchosen branches
          if (!isChosen && branch.opacity > GHOST_MIN_OPACITY * 0.5) {
            const shimmer = p.reducedMotion ? 0.5 :
              0.3 + 0.7 * Math.sin(s.frameCount * 0.015 + branch.swayPhase * 3);
            if (shimmer > 0.6) {
              // Occasional sparkle along the ghost branch
              const sparkleT = (s.frameCount * 0.003 + branch.swayPhase) % 1;
              const [sx, sy] = bezierPoint(
                branch.from.x + sway * 0.5, y0,
                branch.cx + sway, yc,
                branch.to.x + sway * 0.5, y1,
                sparkleT,
              );
              ctx.beginPath();
              ctx.arc(sx, sy, minDim * 0.002, 0, Math.PI * 2);
              ctx.fillStyle = rgba(GHOST_COLOR, (shimmer - 0.6) * 0.3 * branch.opacity * branchEntrance);
              ctx.fill();
            }
          }
        }
      }

      // ── Fork nodes ────────────────────────────────────
      for (let i = 0; i < s.forks.length; i++) {
        const fork = s.forks[i];
        if (!fork.reached) continue;
        const ny = fork.y - camY;
        if (ny < -30 || ny > h + 30) continue;

        const nodeEntrance = easeOutExpo(
          Math.max(0, Math.min(1, (entrance - i * 0.1) / 0.5)),
        );

        const nodeR = 3 + (fork.chosenIndex >= 0 ? 0 : 2 * Math.sin(s.frameCount * 0.03));
        const nodeAlpha = (fork.chosenIndex >= 0 ? 0.15 : 0.35) * nodeEntrance;
        const nColor = lerpColor(NODE_COLOR, s.accentRgb, 0.2);

        // Node glow
        const nGrad = ctx.createRadialGradient(fork.x, ny, 0, fork.x, ny, nodeR * 5);
        nGrad.addColorStop(0, rgba(nColor, nodeAlpha * 0.4));
        nGrad.addColorStop(0.4, rgba(nColor, nodeAlpha * 0.1));
        nGrad.addColorStop(1, rgba(nColor, 0));
        ctx.fillStyle = nGrad;
        ctx.fillRect(fork.x - nodeR * 5, ny - nodeR * 5, nodeR * 10, nodeR * 10);

        // Node dot
        ctx.beginPath();
        ctx.arc(fork.x, ny, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(nColor, nodeAlpha);
        ctx.fill();

        // Waiting indicator (pulsing ring + branch hints for current fork)
        if (i === s.currentFork && s.waitingForChoice) {
          const pulseR = nodeR * (2 + (p.reducedMotion ? 0 : Math.sin(s.frameCount * 0.04)));
          ctx.beginPath();
          ctx.arc(fork.x, ny, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, 0.2 * nodeEntrance);
          ctx.lineWidth = minDim * 0.0024;
          ctx.stroke();

          // ── Traveling light dots along each available branch ──
          const hintColor = lerpColor(CHOSEN_COLOR, s.accentRgb, 0.2);
          for (let b = 0; b < fork.branches.length; b++) {
            const branch = fork.branches[b];
            const bFromY = branch.from.y - camY;
            const bToY = branch.to.y - camY;
            const bCpY = branch.cy - camY;

            // Brighten available branches when waiting
            const waitBrightness = 0.12 * nodeEntrance;
            ctx.beginPath();
            ctx.moveTo(branch.from.x, bFromY);
            ctx.quadraticCurveTo(branch.cx, bCpY, branch.to.x, bToY);
            ctx.strokeStyle = rgba(hintColor, waitBrightness);
            ctx.lineWidth = branch.width + 0.5;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Draw traveling dots (3 per branch, staggered)
            for (let d = 0; d < HINT_CHEVRON_COUNT; d++) {
              const baseT = ((s.frameCount * CHEVRON_SPEED + d / HINT_CHEVRON_COUNT + b * 0.1) % 1);
              const dotT = baseT * 0.65; // Only travel first 65% of branch
              const [dotX, dotY] = bezierPoint(
                branch.from.x, bFromY,
                branch.cx, bCpY,
                branch.to.x, bToY,
                dotT,
              );
              const dotFade = 1 - dotT / 0.65; // Fade out as they travel
              const dotR = minDim * 0.005 * (0.6 + 0.4 * dotFade);
              const dotAlpha = 0.25 * dotFade * nodeEntrance;

              // Dot glow
              const dotGlowR = dotR * 4;
              const dotGlow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, dotGlowR);
              dotGlow.addColorStop(0, rgba(hintColor, dotAlpha * 0.5));
              dotGlow.addColorStop(1, rgba(hintColor, 0));
              ctx.fillStyle = dotGlow;
              ctx.fillRect(dotX - dotGlowR, dotY - dotGlowR, dotGlowR * 2, dotGlowR * 2);

              // Dot core
              ctx.beginPath();
              ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
              ctx.fillStyle = rgba(hintColor, dotAlpha);
              ctx.fill();
            }

            // ── Endpoint label dot (larger, pulsing, at branch midpoint) ──
            const endPulse = p.reducedMotion ? 1 : (0.7 + 0.3 * Math.sin(s.frameCount * 0.05 + b * 2));
            const endR = minDim * 0.008 * endPulse;
            const [endX, endY] = bezierPoint(
              branch.from.x, bFromY,
              branch.cx, bCpY,
              branch.to.x, bToY,
              0.55,
            );
            ctx.beginPath();
            ctx.arc(endX, endY, endR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(hintColor, 0.2 * nodeEntrance * endPulse);
            ctx.fill();
          }

          // ── Left/right arrow indicators flanking the fork ──
          const arrowSpread = minDim * 0.06;
          const arrowSize = minDim * 0.012;
          const arrowBob = p.reducedMotion ? 0 : Math.sin(s.frameCount * 0.06) * minDim * 0.004;
          const arrowAlpha = 0.2 * nodeEntrance;

          // Left arrow chevron
          ctx.beginPath();
          ctx.moveTo(fork.x - arrowSpread + arrowSize + arrowBob, ny - arrowSize);
          ctx.lineTo(fork.x - arrowSpread + arrowBob, ny);
          ctx.lineTo(fork.x - arrowSpread + arrowSize + arrowBob, ny + arrowSize);
          ctx.strokeStyle = rgba(hintColor, arrowAlpha);
          ctx.lineWidth = minDim * 0.003;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Right arrow chevron
          ctx.beginPath();
          ctx.moveTo(fork.x + arrowSpread - arrowSize - arrowBob, ny - arrowSize);
          ctx.lineTo(fork.x + arrowSpread - arrowBob, ny);
          ctx.lineTo(fork.x + arrowSpread - arrowSize - arrowBob, ny + arrowSize);
          ctx.strokeStyle = rgba(hintColor, arrowAlpha);
          ctx.stroke();

          // ── "swipe to choose" text on first fork only ──
          if (!s.firstChoiceMade && s.hintTextFade > 0) {
            const fontSize = minDim * 0.026;
            ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const textAlpha = 0.35 * s.hintTextFade * nodeEntrance;
            ctx.fillStyle = rgba(hintColor, textAlpha);
            ctx.fillText('\u2190 swipe to choose \u2192', fork.x, ny + minDim * 0.045);
          }
        }
      }

      // ── Core particle ─────────────────────────────────
      const coreScreenY = s.coreY - camY;

      // Large glow
      const coreGlowR = CORE_RADIUS * CORE_GLOW_MULT;
      const pulse = p.reducedMotion ? 1 : (0.85 + 0.15 * Math.sin(s.frameCount * 0.03));
      const coreGlowGrad = ctx.createRadialGradient(
        s.coreX, coreScreenY, 0,
        s.coreX, coreScreenY, coreGlowR,
      );
      const cColor = lerpColor(CORE_COLOR, s.accentRgb, 0.15);
      coreGlowGrad.addColorStop(0, rgba(cColor, 0.2 * pulse * entrance));
      coreGlowGrad.addColorStop(0.3, rgba(cColor, 0.06 * entrance));
      coreGlowGrad.addColorStop(1, rgba(cColor, 0));
      ctx.fillStyle = coreGlowGrad;
      ctx.fillRect(
        s.coreX - coreGlowR, coreScreenY - coreGlowR,
        coreGlowR * 2, coreGlowR * 2,
      );

      // Core body
      const coreGrad = ctx.createRadialGradient(
        s.coreX - CORE_RADIUS * 0.15, coreScreenY - CORE_RADIUS * 0.15, CORE_RADIUS * 0.15,
        s.coreX, coreScreenY, CORE_RADIUS,
      );
      coreGrad.addColorStop(0, rgba([255, 255, 255], 0.7 * entrance));
      coreGrad.addColorStop(0.5, rgba(cColor, 0.5 * entrance));
      coreGrad.addColorStop(1, rgba(cColor, 0.1 * entrance));
      ctx.beginPath();
      ctx.arc(s.coreX, coreScreenY, CORE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ── Swipe preview (drag feedback) ─────────────────
      if (s.isDragging && s.waitingForChoice && Math.abs(s.dragDeltaX) > 5) {
        const previewAlpha = Math.min(0.2, Math.abs(s.dragDeltaX) / 100) * entrance;
        const previewX = s.coreX + s.dragDeltaX * 0.3;
        ctx.beginPath();
        ctx.moveTo(s.coreX, coreScreenY);
        ctx.lineTo(previewX, coreScreenY - 20);
        ctx.strokeStyle = rgba(lerpColor(CHOSEN_COLOR, s.accentRgb, 0.2), previewAlpha);
        ctx.lineWidth = minDim * 0.003;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ── Resolution glow ───────────────────────────────
      if (s.resolveGlow > 0) {
        const rPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.02));
        const rGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.4);
        rGrad.addColorStop(0, rgba(lerpColor(CHOSEN_COLOR, s.accentRgb, 0.2), s.resolveGlow * 0.06 * rPulse * entrance));
        rGrad.addColorStop(0.5, rgba(s.primaryRgb, s.resolveGlow * 0.02 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = true;
      s.dragStartX = e.clientX;
      s.dragStartY = e.clientY;
      s.dragDeltaX = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      s.dragDeltaX = e.clientX - s.dragStartX;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      s.isDragging = false;

      if (s.waitingForChoice && s.currentFork < s.forks.length) {
        const fork = s.forks[s.currentFork];
        const dx = s.dragDeltaX;

        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          const branches = fork.branches;
          let chosenIdx: number;

          if (branches.length === 2) {
            chosenIdx = dx > 0 ? 1 : 0;
          } else {
            if (Math.abs(dx) < SWIPE_THRESHOLD * 1.5) {
              chosenIdx = 1;
            } else {
              chosenIdx = dx > 0 ? 2 : 0;
            }
          }

          chosenIdx = Math.max(0, Math.min(branches.length - 1, chosenIdx));
          fork.chosenIndex = chosenIdx;

          for (let i = 0; i < branches.length; i++) {
            if (i === chosenIdx) {
              branches[i].chosen = true;
              branches[i].targetOpacity = 0.9;
            } else {
              branches[i].chosen = false;
              branches[i].targetOpacity = GHOST_MIN_OPACITY;
            }
          }

          s.waitingForChoice = false;
          s.coreProgress = 0;
          callbacksRef.current.onHaptic('swipe_commit');
          callbacksRef.current.onHaptic('step_advance');

          if (!s.firstChoiceMade) {
            s.firstChoiceMade = true;
          }
        }
      }

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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'grab',
        }}
      />
    </div>
  );
}