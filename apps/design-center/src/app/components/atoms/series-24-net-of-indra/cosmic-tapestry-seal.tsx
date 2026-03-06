/**
 * ATOM 240: THE COSMIC TAPESTRY SEAL
 * =====================================
 * Series 24 — Net of Indra · Position 10 (SEAL CAPSTONE)
 *
 * Pull a single thread — reveal it is woven into a massive,
 * intricate, breathing masterpiece. You are essential to the
 * fabric of everything.
 *
 * PHYSICS:
 *   - Viewport filled with a dark woven grid (20x20 threads)
 *   - Each thread is a thin luminous line, barely visible
 *   - Drag any thread → it lights up golden and pulls taut
 *   - Connected threads light up in cascade (wave propagation)
 *   - As more threads illuminate, the tapestry pattern emerges
 *   - Full illumination reveals a sacred geometric pattern
 *   - The thread you pulled is the brightest — essential, unique
 *   - Seal stamp on full illumination
 *   - Breath modulates thread shimmer intensity
 *
 * INTERACTION:
 *   Drag → pulls thread, cascade illumination
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static illuminated tapestry with seal ring
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

/** Grid threads per axis */
const GRID_SIZE = 18;
/** Thread thickness at rest */
const THREAD_REST_WIDTH = 0.0004;
/** Thread thickness when illuminated */
const THREAD_LIT_WIDTH = 0.001;
/** Cascade propagation speed */
const CASCADE_SPEED = 0.015;
/** Grid margin from viewport edges (fraction) */
const GRID_MARGIN = 0.08;
/** Thread intersection node glow radius */
const NODE_GLOW_R = 0.005;
/** Breath shimmer multiplier */
const BREATH_SHIMMER = 0.2;
/** Seal ring radius */
const SEAL_R = 0.18;
/** Seal inner ring */
const SEAL_INNER_R = 0.14;
/** Completion threshold (fraction of threads lit) */
const COMPLETE_FRAC = 0.8;
/** Sacred geometry pattern emergence threshold */
const PATTERN_THRESHOLD = 0.5;
/** Gold warm color for illuminated threads */
const GOLD: RGB = [220, 195, 120];

// =====================================================================
// STATE TYPES
// =====================================================================

interface Thread {
  /** Is this a horizontal (true) or vertical (false) thread */
  horizontal: boolean;
  /** Index within its direction (0 to GRID_SIZE-1) */
  index: number;
  /** Illumination level 0-1 */
  lit: number;
  /** Was this the user-pulled thread */
  isPulled: boolean;
}

// =====================================================================
// HELPERS
// =====================================================================

function createThreads(): Thread[] {
  const threads: Thread[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    threads.push({ horizontal: true, index: i, lit: 0, isPulled: false });
    threads.push({ horizontal: false, index: i, lit: 0, isPulled: false });
  }
  return threads;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function CosmicTapestrySealAtom({
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

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    threads: createThreads(),
    dragging: false,
    dragX: 0,
    dragY: 0,
    hasActivated: false,
    sealed: false,
    stepNotified: false,
    sealGlow: 0,
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

      if (p.phase === 'resolve') {
        s.threads.forEach(t => { t.lit = 1; });
        s.sealed = true;
      }

      // ── Cascade propagation ─────────────────────────────
      let anyLit = false;
      for (const t of s.threads) {
        if (t.lit > 0.05) {
          anyLit = true;
          // Propagate to adjacent threads of opposite direction at intersections
          for (const other of s.threads) {
            if (other.horizontal !== t.horizontal) {
              // They cross — propagate
              const crossLit = t.lit * 0.9;
              if (other.lit < crossLit - 0.05) {
                other.lit = Math.min(1, other.lit + CASCADE_SPEED * t.lit * ms);
              }
            }
            // Propagate to adjacent same-direction threads
            if (other.horizontal === t.horizontal && Math.abs(other.index - t.index) === 1) {
              if (other.lit < t.lit - 0.1) {
                other.lit = Math.min(1, other.lit + CASCADE_SPEED * 0.5 * t.lit * ms);
              }
            }
          }
        }
      }

      // ── Completion tracking ─────────────────────────────
      const litCount = s.threads.filter(t => t.lit > 0.7).length;
      const litFrac = litCount / s.threads.length;

      if (litFrac >= 0.4 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (litFrac >= COMPLETE_FRAC && !s.sealed) {
        s.sealed = true;
        cb.onHaptic('seal_stamp');
      }
      if (s.sealed) {
        s.sealGlow = Math.min(1, s.sealGlow + 0.006 * ms);
      }

      cb.onStateChange?.(s.sealed ? 0.5 + s.sealGlow * 0.5 : litFrac * 0.5);

      const gridL = GRID_MARGIN;
      const gridR = 1 - GRID_MARGIN;
      const gridT = GRID_MARGIN;
      const gridB = 1 - GRID_MARGIN;
      const gridW = gridR - gridL;
      const gridH = gridB - gridT;

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        // Draw fully illuminated grid
        for (const t of s.threads) {
          const threadColor = lerpColor(s.primaryRgb, GOLD, 0.5);
          if (t.horizontal) {
            const y = (gridT + (t.index / (GRID_SIZE - 1)) * gridH) * h;
            ctx.beginPath();
            ctx.moveTo(gridL * w, y);
            ctx.lineTo(gridR * w, y);
          } else {
            const x = (gridL + (t.index / (GRID_SIZE - 1)) * gridW) * w;
            ctx.beginPath();
            ctx.moveTo(x, gridT * h);
            ctx.lineTo(x, gridB * h);
          }
          ctx.strokeStyle = rgba(threadColor, ALPHA.content.max * 0.15 * entrance);
          ctx.lineWidth = px(THREAD_LIT_WIDTH, minDim);
          ctx.stroke();
        }
        // Seal ring
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Background tapestry glow
      // ════════════════════════════════════════════════════
      if (litFrac > 0.1) {
        const tapGlowR = px(0.4, minDim);
        const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, tapGlowR);
        tg.addColorStop(0, rgba(lerpColor(s.primaryRgb, GOLD, litFrac * 0.3), ALPHA.glow.max * 0.04 * litFrac * entrance));
        tg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.01 * litFrac * entrance));
        tg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tg;
        ctx.fillRect(cx - tapGlowR, cy - tapGlowR, tapGlowR * 2, tapGlowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Thread grid
      // ════════════════════════════════════════════════════
      const shimmer = 1 + breath * BREATH_SHIMMER;

      for (const t of s.threads) {
        const lit = t.lit;
        const threadWidth = px(THREAD_REST_WIDTH + lit * (THREAD_LIT_WIDTH - THREAD_REST_WIDTH), minDim);
        const threadColor = lit > 0.3
          ? lerpColor(s.primaryRgb, t.isPulled ? GOLD : lerpColor(GOLD, s.primaryRgb, 0.4), lit)
          : s.primaryRgb;
        const threadAlpha = ALPHA.content.max * (0.03 + lit * 0.15 * shimmer) * entrance;

        if (t.horizontal) {
          const y = (gridT + (t.index / (GRID_SIZE - 1)) * gridH) * h;
          ctx.beginPath();
          ctx.moveTo(gridL * w, y);
          ctx.lineTo(gridR * w, y);
        } else {
          const x = (gridL + (t.index / (GRID_SIZE - 1)) * gridW) * w;
          ctx.beginPath();
          ctx.moveTo(x, gridT * h);
          ctx.lineTo(x, gridB * h);
        }
        ctx.strokeStyle = rgba(threadColor, threadAlpha);
        ctx.lineWidth = threadWidth;
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Intersection node glows
      // ════════════════════════════════════════════════════
      for (let hi = 0; hi < GRID_SIZE; hi++) {
        const hThread = s.threads.find(t => t.horizontal && t.index === hi);
        if (!hThread || hThread.lit < 0.3) continue;

        for (let vi = 0; vi < GRID_SIZE; vi++) {
          const vThread = s.threads.find(t => !t.horizontal && t.index === vi);
          if (!vThread || vThread.lit < 0.3) continue;

          const intLit = Math.min(hThread.lit, vThread.lit);
          const ix = (gridL + (vi / (GRID_SIZE - 1)) * gridW) * w;
          const iy = (gridT + (hi / (GRID_SIZE - 1)) * gridH) * h;
          const nR = px(NODE_GLOW_R * intLit, minDim);

          if (nR > 0.3) {
            const ng = ctx.createRadialGradient(ix, iy, 0, ix, iy, nR);
            const nodeColor = lerpColor(s.primaryRgb, GOLD, intLit * 0.5);
            ng.addColorStop(0, rgba(nodeColor, ALPHA.glow.max * 0.12 * intLit * entrance));
            ng.addColorStop(0.4, rgba(nodeColor, ALPHA.glow.max * 0.04 * intLit * entrance));
            ng.addColorStop(1, rgba(nodeColor, 0));
            ctx.fillStyle = ng;
            ctx.fillRect(ix - nR, iy - nR, nR * 2, nR * 2);

            // Node dot
            ctx.beginPath();
            ctx.arc(ix, iy, px(0.001 + intLit * 0.001, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(lerpColor(nodeColor, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * 0.3 * intLit * entrance);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Sacred geometry overlay (emerges)
      // ════════════════════════════════════════════════════
      if (litFrac > PATTERN_THRESHOLD) {
        const patternAlpha = (litFrac - PATTERN_THRESHOLD) / (1 - PATTERN_THRESHOLD);

        // Diamond pattern connecting every 3rd intersection
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const pR = px(0.2 * patternAlpha, minDim);
          const ppx = cx + Math.cos(angle) * pR;
          const ppy = cy + Math.sin(angle) * pR;
          if (i === 0) ctx.moveTo(ppx, ppy);
          else ctx.lineTo(ppx, ppy);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, GOLD, 0.5), ALPHA.content.max * 0.06 * patternAlpha * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Inner sacred circle
        ctx.beginPath();
        ctx.arc(cx, cy, px(0.12 * patternAlpha, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, GOLD, 0.4), ALPHA.content.max * 0.04 * patternAlpha * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Seal (post-completion)
      // ════════════════════════════════════════════════════
      if (s.sealed) {
        // Outer seal
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, GOLD, 0.3), ALPHA.content.max * 0.15 * s.sealGlow * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Inner seal
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_INNER_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * s.sealGlow * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Cardinal ticks
        for (let i = 0; i < 8; i++) {
          const ta = (i / 8) * Math.PI * 2;
          const isCardinal = i % 2 === 0;
          const inner = px(SEAL_INNER_R, minDim);
          const outer = px(SEAL_R, minDim);
          const start = isCardinal ? inner : inner + (outer - inner) * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ta) * start, cy + Math.sin(ta) * start);
          ctx.lineTo(cx + Math.cos(ta) * outer, cy + Math.sin(ta) * outer);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (isCardinal ? 0.12 : 0.04) * s.sealGlow * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Radiance rings
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.08 + i * 0.33) % 1;
          const rR = px(0.05 + rPhase * SEAL_R, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * (1 - rPhase) * s.sealGlow * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Progress ───────────────────────────────────────
      if (!s.sealed && anyLit) {
        const progR = px(SIZE.xs, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.42, minDim), progR, -Math.PI / 2, -Math.PI / 2 + litFrac * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Drag to pull threads ────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      s.dragX = mx;
      s.dragY = my;

      // Find nearest thread
      const gridL = GRID_MARGIN;
      const gridT = GRID_MARGIN;
      const gridW = 1 - 2 * GRID_MARGIN;
      const gridH = gridW;

      let closestThread: Thread | null = null;
      let closestDist = Infinity;

      for (const t of s.threads) {
        let threadPos: number;
        let dist: number;

        if (t.horizontal) {
          threadPos = gridT + (t.index / (GRID_SIZE - 1)) * gridH;
          dist = Math.abs(my - threadPos);
        } else {
          threadPos = gridL + (t.index / (GRID_SIZE - 1)) * gridW;
          dist = Math.abs(mx - threadPos);
        }

        if (dist < closestDist && dist < 0.04) {
          closestDist = dist;
          closestThread = t;
        }
      }

      if (closestThread) {
        closestThread.lit = 1;
        closestThread.isPulled = true;
        s.hasActivated = true;
        callbacksRef.current.onHaptic('drag_snap');
      }

      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.dragX = (e.clientX - rect.left) / rect.width;
      s.dragY = (e.clientY - rect.top) / rect.height;

      // Light up nearby threads while dragging
      const gridL = GRID_MARGIN;
      const gridT = GRID_MARGIN;
      const gridW = 1 - 2 * GRID_MARGIN;
      const gridH = gridW;

      for (const t of s.threads) {
        let threadPos: number;
        let dist: number;

        if (t.horizontal) {
          threadPos = gridT + (t.index / (GRID_SIZE - 1)) * gridH;
          dist = Math.abs(s.dragY - threadPos);
        } else {
          threadPos = gridL + (t.index / (GRID_SIZE - 1)) * gridW;
          dist = Math.abs(s.dragX - threadPos);
        }

        if (dist < 0.02 && t.lit < 0.5) {
          t.lit = Math.max(t.lit, 0.6);
        }
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
      />
    </div>
  );
}
