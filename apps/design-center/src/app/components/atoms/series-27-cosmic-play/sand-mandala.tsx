/**
 * ATOM 262: THE SAND MANDALA ENGINE
 * ====================================
 * Series 27 — Cosmic Play · Position 2
 *
 * Build a stunning mandala — then blow it away. The joy was in the
 * building. Non-attachment to the beautiful.
 *
 * PHYSICS:
 *   - Draw on canvas → sand grains deposited with 8-fold symmetry
 *   - Each grain is a small colored particle with individual physics
 *   - Grains color-shift based on distance from center (rings of color)
 *   - Guide circles + radial lines show sacred geometry scaffolding
 *   - Once enough grains placed: swipe horizontally to scatter
 *   - Scatter = directional wind → all particles fly off with tumble
 *   - Wind creates trailing wisps behind each grain
 *   - Post-scatter: empty center blooms with acceptance glow
 *   - Breath modulates grain shimmer while building
 *
 * INTERACTION:
 *   Draw → build mandala (drag_snap)
 *   Swipe → scatter (swipe_commit → completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static fully-built mandala
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Symmetry fold count */
const SYMMETRY = 8;
/** Grain visual size base */
const GRAIN_SIZE = 0.002;
/** Max grains in mandala */
const MAX_GRAINS = 500;
/** Wind scatter speed */
const WIND_SPEED = 0.008;
/** Swipe distance threshold (fraction of width) */
const SWIPE_THRESHOLD = 0.1;
/** Guide circle count */
const GUIDE_CIRCLES = 4;
/** Guide circle max radius */
const GUIDE_MAX_R = 0.22;
/** Post-scatter bloom speed */
const BLOOM_SPEED = 0.004;
/** Breath shimmer multiplier */
const BREATH_SHIMMER = 0.2;
/** Glow layers for bloom */
const GLOW_LAYERS = 5;
/** Minimum grains before scatter allowed */
const MIN_GRAINS_SCATTER = 40;
/** Grain color ring count */
const COLOR_RINGS = 4;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Grain {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  /** Scattered state */
  scattered: boolean;
  /** Distance from center when placed (for coloring) */
  ringDist: number;
  /** Individual phase for shimmer */
  phase: number;
  /** Rotation for tumble during scatter */
  rotation: number;
  rotSpeed: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SandMandalaAtom({
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
    grains: [] as Grain[],
    drawing: false,
    dragNotified: false,
    scattered: false,
    swipeStartX: 0,
    swiping: false,
    completed: false,
    bloomProgress: 0,
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
        s.scattered = true;
        s.completed = true;
      }

      // ── Reduced motion: static mandala ──────────────────
      if (p.reducedMotion) {
        // Draw guide circles
        for (let r = 1; r <= GUIDE_CIRCLES; r++) {
          ctx.beginPath();
          ctx.arc(cx, cy, px(GUIDE_MAX_R * r / GUIDE_CIRCLES, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
        // Draw placeholder grains in mandala pattern
        for (let ring = 1; ring <= 3; ring++) {
          const ringR = GUIDE_MAX_R * ring / 3;
          for (let i = 0; i < SYMMETRY * 3; i++) {
            const angle = (i / (SYMMETRY * 3)) * Math.PI * 2;
            const gx = cx + Math.cos(angle) * px(ringR, minDim);
            const gy = cy + Math.sin(angle) * px(ringR, minDim);
            const gR = px(GRAIN_SIZE, minDim);
            ctx.beginPath();
            ctx.arc(gx, gy, gR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, ring / 3), ALPHA.content.max * 0.2 * entrance);
            ctx.fill();
          }
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // SCATTER PHYSICS
      // ════════════════════════════════════════════════════
      if (s.scattered) {
        let allGone = true;
        for (const g of s.grains) {
          if (!g.scattered) {
            g.scattered = true;
            const windAngle = Math.random() * Math.PI * 0.4 - Math.PI * 0.2; // mostly rightward
            g.vx = Math.cos(windAngle) * WIND_SPEED * (0.5 + Math.random());
            g.vy = Math.sin(windAngle) * WIND_SPEED * (0.3 + Math.random() * 0.7);
            g.rotSpeed = (Math.random() - 0.5) * 0.1;
          }
          g.x += g.vx * ms;
          g.y += g.vy * ms;
          g.rotation += g.rotSpeed * ms;
          g.vx *= 0.997;
          g.vy *= 0.997;
          if (g.x > -0.15 && g.x < 1.15 && g.y > -0.15 && g.y < 1.15) allGone = false;
        }
        if (allGone && s.grains.length > 0 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
        // Bloom animation
        if (s.completed || allGone) {
          s.bloomProgress = Math.min(1, s.bloomProgress + BLOOM_SPEED * ms);
        }
      }

      cb.onStateChange?.(
        s.completed ? 0.5 + s.bloomProgress * 0.5 :
        s.scattered ? 0.5 :
        Math.min(0.5, s.grains.length / MAX_GRAINS * 0.5),
      );

      const shimmer = 1 + breath * BREATH_SHIMMER;

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Guide scaffolding (pre-scatter)
      // ════════════════════════════════════════════════════
      if (!s.scattered) {
        // Guide circles
        for (let r = 1; r <= GUIDE_CIRCLES; r++) {
          const guideR = px(GUIDE_MAX_R * r / GUIDE_CIRCLES, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, guideR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.025 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Radial guide lines
        for (let i = 0; i < SYMMETRY; i++) {
          const angle = (i / SYMMETRY) * Math.PI * 2;
          const lineLen = px(GUIDE_MAX_R, minDim);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * lineLen, cy + Math.sin(angle) * lineLen);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.018 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Center dot
        const centerR = px(0.004, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Mandala center glow
      // ════════════════════════════════════════════════════
      if (s.grains.length > 20 && !s.scattered) {
        const fillFrac = s.grains.length / MAX_GRAINS;
        const glowR = px(SIZE.md * 0.4 * fillFrac, minDim);
        for (let gi = 2; gi >= 0; gi--) {
          const gR = glowR * (1 + gi * 0.6);
          const gA = ALPHA.glow.max * 0.04 * fillFrac * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Sand grains
      // ════════════════════════════════════════════════════
      for (const g of s.grains) {
        const gx = g.x * w;
        const gy = g.y * h;
        if (gx < -30 || gx > w + 30 || gy < -30 || gy > h + 30) continue;

        const gR = px(g.size, minDim);
        const colorT = Math.min(1, g.ringDist / GUIDE_MAX_R);
        const grainColor = lerpColor(s.primaryRgb, s.accentRgb, colorT * 0.6);
        const grainShimmer = g.scattered ? 1 : (0.7 + 0.3 * Math.sin(time * 2 + g.phase)) * shimmer;

        // Grain glow halo (for non-scattered)
        if (!g.scattered && gR > 0.3) {
          const ggR = gR * 2.5;
          const gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, ggR);
          gg.addColorStop(0, rgba(grainColor, ALPHA.glow.max * 0.05 * grainShimmer * entrance));
          gg.addColorStop(1, rgba(grainColor, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(gx - ggR, gy - ggR, ggR * 2, ggR * 2);
        }

        // Grain body
        ctx.beginPath();
        ctx.arc(gx, gy, gR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          grainColor,
          ALPHA.content.max * (g.scattered ? 0.12 : 0.22) * grainShimmer * entrance,
        );
        ctx.fill();

        // Scatter trail (wisp behind scattered grain)
        if (g.scattered && Math.hypot(g.vx, g.vy) > 0.001) {
          const trailLen = px(0.01, minDim);
          const trailAngle = Math.atan2(-g.vy, -g.vx);
          const tx = gx + Math.cos(trailAngle) * trailLen;
          const ty = gy + Math.sin(trailAngle) * trailLen;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(tx, ty);
          ctx.strokeStyle = rgba(grainColor, ALPHA.content.max * 0.06 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Post-scatter acceptance bloom
      // ════════════════════════════════════════════════════
      if (s.bloomProgress > 0) {
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const bR = px(SIZE.md * (0.2 + s.bloomProgress * 0.5 + gi * 0.08), minDim);
          const bA = ALPHA.glow.max * 0.08 * s.bloomProgress * entrance / (gi + 1);
          const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, bR);
          bg.addColorStop(0, rgba(s.primaryRgb, bA));
          bg.addColorStop(0.25, rgba(s.primaryRgb, bA * 0.5));
          bg.addColorStop(0.6, rgba(s.primaryRgb, bA * 0.1));
          bg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = bg;
          ctx.fillRect(cx - bR, cy - bR, bR * 2, bR * 2);
        }

        // Bloom core
        const coreR = px(0.008 * s.bloomProgress, minDim);
        if (coreR > 0.5) {
          const cGrad = ctx.createRadialGradient(cx - coreR * 0.15, cy - coreR * 0.15, coreR * 0.1, cx, cy, coreR);
          cGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.3 * s.bloomProgress * entrance));
          cGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * s.bloomProgress * entrance));
          cGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance));
          ctx.beginPath();
          ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fillStyle = cGrad;
          ctx.fill();
        }
      }

      // ── Progress ring ──────────────────────────────────
      if (!s.scattered && s.grains.length > 5) {
        const progR = px(SIZE.xs, minDim);
        const prog = s.grains.length / MAX_GRAINS;
        ctx.beginPath();
        ctx.arc(cx, cy - px(GUIDE_MAX_R + 0.04, minDim), progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Add grains with 8-fold symmetry ─────────────────
    const addGrain = (mx: number, my: number) => {
      const s = stateRef.current;
      if (s.scattered || s.grains.length >= MAX_GRAINS) return;
      const dx = mx - 0.5;
      const dy = my - 0.5;
      const dist = Math.hypot(dx, dy);
      const baseAngle = Math.atan2(dy, dx);

      for (let i = 0; i < SYMMETRY; i++) {
        const angle = baseAngle + (i / SYMMETRY) * Math.PI * 2;
        s.grains.push({
          x: 0.5 + Math.cos(angle) * dist + (Math.random() - 0.5) * 0.004,
          y: 0.5 + Math.sin(angle) * dist + (Math.random() - 0.5) * 0.004,
          vx: 0, vy: 0,
          size: GRAIN_SIZE + Math.random() * 0.001,
          scattered: false,
          ringDist: dist,
          phase: Math.random() * Math.PI * 2,
          rotation: 0,
          rotSpeed: 0,
        });
      }
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.scattered) return;
      s.drawing = true;
      s.swiping = true;
      s.swipeStartX = e.clientX;
      const rect = canvas.getBoundingClientRect();
      addGrain((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      addGrain((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);

      // Check for swipe to scatter
      if (s.swiping && Math.abs(e.clientX - s.swipeStartX) / rect.width > SWIPE_THRESHOLD && s.grains.length > MIN_GRAINS_SCATTER) {
        s.scattered = true;
        s.swiping = false;
        s.drawing = false;
        callbacksRef.current.onHaptic('swipe_commit');
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.drawing = false;
      stateRef.current.swiping = false;
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
