/**
 * ATOM 280: THE ANICCA SEAL
 * ============================
 * Series 28 — Impermanence Engine · Position 10 (Series Capstone)
 *
 * A sculpture naturally, softly dissolves on its own.
 * Watch. This too shall pass. Total peace with the void.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Sculpture rendered as crystalline cloth polyhedron (woven facets)
 *   - Each facet is a triangular cloth patch with fiber edges
 *   - Dissolution: fibers loosen, patches detach, float upward
 *   - Entropy arc: rigid ordered geometry → fiber loosening → peaceful void
 *   - Each particle carries a fading thread that unravels
 *   - No interaction needed — pure observation of beautiful entropy
 *
 * PHYSICS:
 *   - Polyhedron: 20 triangular cloth facets (icosahedron-like)
 *   - Auto-dissolve: random facet loosening over ~8 seconds
 *   - Facets detach with cloth flutter (drape/wave as they rise)
 *   - Fiber edges between facets thin and snap
 *   - Rising particles trail unraveling threads
 *   - Void gradually fills with peaceful ambient light
 *   - 8 render layers: atmosphere, polyhedron shadow, remaining facets,
 *     fiber edges, dissolving facets, unraveling threads, void glow, seal stamp
 *
 * INTERACTION:
 *   Pure observation → auto-dissolution → seal_stamp
 *
 * RENDER: Canvas 2D with cloth-polyhedron dissolution
 * REDUCED MOTION: Static peaceful void (post-dissolution)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Polyhedron radius (fraction of minDim) */
const POLY_R = 0.22;
/** Number of triangular facets */
const FACET_COUNT = 20;
/** Dissolution speed (fraction per frame) */
const DISSOLVE_RATE = 0.0012;
/** Delay before dissolution begins (frames) */
const DISSOLVE_DELAY = 90;
/** Facet rise speed when detached */
const RISE_SPEED = 0.0008;
/** Facet flutter amplitude */
const FLUTTER_AMP = 0.008;
/** Thread unravel trail length */
const THREAD_TRAIL = 8;
/** Void glow layers */
const VOID_GLOW_LAYERS = 5;
/** Rotation speed of polyhedron (radians per frame) */
const ROTATE_SPEED = 0.003;
/** Facet opacity when intact */
const FACET_OPACITY = 0.22;
/** Thread fiber count per facet edge */
const EDGE_FIBERS = 2;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface Facet {
  /** Triangle vertices (3 points, each {angle, elevation}) */
  v1: { angle: number; elev: number };
  v2: { angle: number; elev: number };
  v3: { angle: number; elev: number };
  /** Whether detached from polyhedron */
  detached: boolean;
  /** Detach progress 0-1 */
  detachProgress: number;
  /** Rise offset after detach */
  riseY: number;
  /** Flutter phase */
  flutterPhase: number;
  /** Horizontal drift */
  driftX: number;
  /** Dissolve order (when to start loosening) */
  dissolveOrder: number;
  /** Thread trail points */
  trail: { x: number; y: number; alpha: number }[];
}

// ═════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════

function createFacets(): Facet[] {
  const facets: Facet[] = [];
  // Generate pseudo-icosahedron facets
  for (let i = 0; i < FACET_COUNT; i++) {
    const baseAngle = (i / FACET_COUNT) * Math.PI * 2;
    const ring = Math.floor(i / 5);
    const elev = (ring - 2) * 0.4;
    const spread = 0.35;
    facets.push({
      v1: { angle: baseAngle, elev: elev },
      v2: { angle: baseAngle + spread, elev: elev + 0.25 },
      v3: { angle: baseAngle - spread * 0.3, elev: elev + 0.4 },
      detached: false,
      detachProgress: 0,
      riseY: 0,
      flutterPhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.0003,
      dissolveOrder: Math.random(),
      trail: [],
    });
  }
  // Sort by dissolve order for sequential dissolution
  facets.sort((a, b) => a.dissolveOrder - b.dissolveOrder);
  return facets;
}

/** Project 3D spherical coords to 2D */
function projectVertex(
  angle: number, elev: number, radius: number, rotation: number,
  cx: number, cy: number
): { x: number; y: number; depth: number } {
  const a = angle + rotation;
  const x = cx + Math.cos(a) * Math.cos(elev) * radius;
  const y = cy + Math.sin(elev) * radius * 0.8; // slight vertical compress
  const depth = Math.sin(a) * Math.cos(elev); // -1 to 1
  return { x, y, depth };
}

export default function AniccaSealAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
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
    facets: createFacets(),
    dissolveProgress: 0,
    rotation: 0,
    completed: false,
    sealStamped: false,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.015;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) { s.dissolveProgress = 1; s.completed = true; }
      if (p.phase === 'resolve') { s.dissolveProgress = 1; s.completed = true; }

      // ── Dissolution physics ─────────────────────────────────────
      if (s.frameCount > DISSOLVE_DELAY) {
        s.dissolveProgress = Math.min(1, s.dissolveProgress + DISSOLVE_RATE * ms);
      }
      s.rotation += ROTATE_SPEED * ms * (1 - s.dissolveProgress * 0.8);

      const polyR = px(POLY_R, minDim);

      // Detach facets based on dissolve progress
      for (let i = 0; i < s.facets.length; i++) {
        const facet = s.facets[i];
        const threshold = i / s.facets.length;
        if (s.dissolveProgress > threshold && !facet.detached) {
          facet.detached = true;
        }
        if (facet.detached) {
          facet.detachProgress = Math.min(1, facet.detachProgress + 0.008 * ms);
          facet.riseY += RISE_SPEED * ms * facet.detachProgress;

          // Record trail
          if (s.frameCount % 5 === 0) {
            const midAngle = (facet.v1.angle + facet.v2.angle + facet.v3.angle) / 3 + s.rotation;
            const midElev = (facet.v1.elev + facet.v2.elev + facet.v3.elev) / 3;
            facet.trail.push({
              x: cx + Math.cos(midAngle) * polyR * 0.5 + facet.driftX * s.frameCount * minDim,
              y: cy + Math.sin(midElev) * polyR * 0.5 - facet.riseY * minDim,
              alpha: 0.3,
            });
            if (facet.trail.length > THREAD_TRAIL) facet.trail.shift();
          }
          for (const t of facet.trail) t.alpha *= 0.96;
        }
      }

      // Completion
      const detachedAll = s.facets.every(f => f.detached && f.detachProgress > 0.8);
      if (detachedAll && !s.completed) {
        s.completed = true;
        if (!s.sealStamped) {
          s.sealStamped = true;
          cb.onHaptic('completion');
          cb.onHaptic('seal_stamp');
        }
      }
      cb.onStateChange?.(s.completed ? 1 : s.dissolveProgress);

      // ── 1. Polyhedron shadow ────────────────────────────────────
      const remainingFrac = 1 - s.dissolveProgress;
      if (remainingFrac > 0.05) {
        const shadowR = polyR * 1.2 * remainingFrac;
        const shadowY = cy + polyR * 0.3;
        const shadowG = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowR);
        shadowG.addColorStop(0, rgba(s.primaryRgb, 0.05 * remainingFrac * entrance));
        shadowG.addColorStop(0.5, rgba(s.primaryRgb, 0.02 * remainingFrac * entrance));
        shadowG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = shadowG;
        ctx.fillRect(cx - shadowR, shadowY - shadowR, shadowR * 2, shadowR * 2);
      }

      // ── 2. Remaining facets (attached to polyhedron) ────────────
      // Sort facets by depth for back-to-front rendering
      const sortedFacets = s.facets.map((f, idx) => {
        const midAngle = (f.v1.angle + f.v2.angle + f.v3.angle) / 3;
        const midElev = (f.v1.elev + f.v2.elev + f.v3.elev) / 3;
        const p1 = projectVertex(midAngle, midElev, polyR, s.rotation, cx, cy);
        return { facet: f, idx, depth: p1.depth };
      }).sort((a, b) => a.depth - b.depth);

      for (const { facet } of sortedFacets) {
        if (facet.detached && facet.detachProgress > 0.5) continue;

        const p1 = projectVertex(facet.v1.angle, facet.v1.elev, polyR, s.rotation, cx, cy);
        const p2 = projectVertex(facet.v2.angle, facet.v2.elev, polyR, s.rotation, cx, cy);
        const p3 = projectVertex(facet.v3.angle, facet.v3.elev, polyR, s.rotation, cx, cy);

        // Skip back-facing
        if (p1.depth < -0.3 && p2.depth < -0.3 && p3.depth < -0.3) continue;

        const avgDepth = (p1.depth + p2.depth + p3.depth) / 3;
        const depthAlpha = 0.5 + avgDepth * 0.5;
        const detachFade = facet.detached ? 1 - facet.detachProgress : 1;

        // Facet fill
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        const fAlpha = ALPHA.content.max * FACET_OPACITY * depthAlpha * detachFade * entrance;
        ctx.fillStyle = rgba(s.primaryRgb, fAlpha);
        ctx.fill();

        // Facet edges (cloth fibers)
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        const eAlpha = ALPHA.content.max * 0.10 * depthAlpha * detachFade * entrance;
        ctx.strokeStyle = rgba(s.primaryRgb, eAlpha);
        ctx.lineWidth = px(STROKE.hairline + (facet.detached ? 0 : STROKE.hairline), minDim);
        ctx.stroke();

        // Specular on front-facing facets
        if (avgDepth > 0.3 && !facet.detached) {
          const sMx = (p1.x + p2.x + p3.x) / 3;
          const sMy = (p1.y + p2.y + p3.y) / 3;
          const sR = px(0.008, minDim);
          const sg = ctx.createRadialGradient(sMx, sMy, 0, sMx, sMy, sR);
          sg.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.08 * depthAlpha * entrance));
          sg.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(sMx - sR, sMy - sR, sR * 2, sR * 2);
        }
      }

      // ── 3. Dissolving facets (floating upward with cloth drape) ──
      for (const { facet } of sortedFacets) {
        if (!facet.detached || facet.detachProgress < 0.3) continue;

        const midAngle = (facet.v1.angle + facet.v2.angle + facet.v3.angle) / 3 + s.rotation;
        const midElev = (facet.v1.elev + facet.v2.elev + facet.v3.elev) / 3;
        const baseX = cx + Math.cos(midAngle) * polyR * 0.4;
        const baseY = cy + Math.sin(midElev) * polyR * 0.5;

        const flutter = Math.sin(time * 3 + facet.flutterPhase) * FLUTTER_AMP * minDim;
        const fx = baseX + facet.driftX * s.frameCount * minDim + flutter;
        const fy = baseY - facet.riseY * minDim;
        const fSize = px(0.02, minDim) * (1 - facet.detachProgress * 0.5);
        const fAlpha = ALPHA.content.max * 0.12 * (1 - facet.detachProgress * 0.8) * entrance;

        // Floating cloth patch
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(Math.sin(time * 2 + facet.flutterPhase) * 0.4);
        ctx.beginPath();
        ctx.moveTo(-fSize, -fSize * 0.5);
        ctx.lineTo(fSize * 0.8, -fSize * 0.3);
        ctx.lineTo(fSize * 0.3, fSize * 0.6);
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, fAlpha);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, fAlpha * 0.5);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
        ctx.restore();
      }

      // ── 4. Unraveling thread trails ─────────────────────────────
      for (const { facet } of sortedFacets) {
        if (facet.trail.length < 2) continue;
        ctx.beginPath();
        for (let t = 0; t < facet.trail.length; t++) {
          const tp = facet.trail[t];
          if (t === 0) ctx.moveTo(tp.x, tp.y);
          else ctx.lineTo(tp.x, tp.y);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Thread end dot
        const lastT = facet.trail[facet.trail.length - 1];
        if (lastT.alpha > 0.05) {
          const tDotR = px(0.002, minDim);
          ctx.beginPath();
          ctx.arc(lastT.x, lastT.y, tDotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * lastT.alpha * entrance);
          ctx.fill();
        }
      }

      // ── 5. Void ambient glow (grows as sculpture dissolves) ─────
      if (s.dissolveProgress > 0.2) {
        const voidFrac = easeOutCubic(s.dissolveProgress);
        for (let i = VOID_GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = px(0.12 + i * 0.10 + voidFrac * 0.15, minDim);
          const gA = ALPHA.glow.max * 0.04 * voidFrac * entrance / (i + 1);
          const gx = cx + Math.sin(time * 0.2 + i) * px(0.02, minDim) * voidFrac;
          const gy = cy + Math.cos(time * 0.3 + i * 0.5) * px(0.015, minDim) * voidFrac;
          const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.4));
          gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.1));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(gx - gR, gy - gR, gR * 2, gR * 2);
        }
      }

      // ── 6. Peace ripples (post-dissolution) ─────────────────────
      if (s.completed) {
        for (let i = 0; i < 4; i++) {
          const rPhase = (time * 0.03 + i * 0.25) % 1;
          const rR = px(0.05 + rPhase * SIZE.md, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb,
            ALPHA.content.max * 0.035 * (1 - rPhase) * entrance * easeOutCubic(1 - rPhase));
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    // Pure observation — no pointer events needed
    return () => { cancelAnimationFrame(animId); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} />
    </div>
  );
}
