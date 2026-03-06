/**
 * ATOM 393: THE CASTING MOLD ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 3
 *
 * Cure the failure to protect growth with structure.
 * Trace the perimeter and the liquid rushes to fill the new mold.
 *
 * PHYSICS:
 *   - Screen shows free-flowing liquid light particles drifting randomly
 *   - User traces a closed shape boundary (the mold)
 *   - On release (if path is closed enough), liquid rushes inward
 *   - Particles accelerate toward mold interior, fill from bottom up
 *   - Completed mold glows with contained energy — structure made real
 *   - The drawn boundary becomes a solid luminous frame
 *
 * INTERACTION:
 *   Draw (pointerdown + move) → trace mold boundary
 *   Release → if boundary closed, liquid fills the mold
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static filled geometric shape with glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Ambient liquid particle count */
const PARTICLE_COUNT = 60;
/** Particle drift speed */
const DRIFT_SPEED = 0.4;
/** Particle radius */
const PARTICLE_R_FRAC = 0.004;
/** Fill animation speed */
const FILL_SPEED = 0.012;
/** Minimum path points to count as valid mold */
const MIN_PATH_POINTS = 15;
/** Path closure distance threshold (fraction of minDim) */
const CLOSURE_THRESHOLD = 0.08;
/** Particle attraction speed toward mold center */
const ATTRACTION_SPEED = 0.06;
/** Hero glow radius */
const GLOW_RADIUS_MULT = 1.6;
/** Mold boundary stroke weight */
const MOLD_STROKE_FRAC = 0.003;
/** Fill glow intensity */
const FILL_GLOW_INTENSITY = 0.35;

// =====================================================================
// STATE TYPES
// =====================================================================

interface LiquidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function CastingMoldAtom({
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
    path: [] as { x: number; y: number }[],
    drawing: false,
    filled: false,
    fillAnim: 0,
    completed: false,
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * DRIFT_SPEED,
      vy: (Math.random() - 0.5) * DRIFT_SPEED,
      phase: Math.random() * Math.PI * 2,
    })) as LiquidParticle[],
    moldCenter: { x: 0.5, y: 0.5 },
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

    /** Check if point is roughly inside the drawn path */
    function pointInPath(px: number, py: number, path: { x: number; y: number }[], w: number, h: number): boolean {
      let inside = false;
      const pts = path;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i].x * w, yi = pts[i].y * h;
        const xj = pts[j].x * w, yj = pts[j].y * h;
        if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    }

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;

      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.filled) {
        // Auto-create a hexagon mold
        if (s.path.length === 0) {
          for (let i = 0; i <= 6; i++) {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
            s.path.push({ x: 0.5 + Math.cos(a) * 0.2, y: 0.5 + Math.sin(a) * 0.2 });
          }
          s.moldCenter = { x: 0.5, y: 0.5 };
          s.filled = true;
          cb.onHaptic('completion');
        }
      }

      // ── Fill animation ──────────────────────────────
      if (s.filled) {
        s.fillAnim = Math.min(1, s.fillAnim + FILL_SPEED * ms);
        if (s.fillAnim >= 0.95 && !s.completed) {
          s.completed = true;
        }
      }

      cb.onStateChange?.(s.filled ? easeOutCubic(s.fillAnim) : 0);

      const fill = easeOutCubic(s.fillAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Static hexagonal mold, filled
        const hexR = px(SIZE.md, minDim);
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const hx = cx + Math.cos(a) * hexR;
          const hy = cy + Math.sin(a) * hexR;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(MOLD_STROKE_FRAC, minDim);
        ctx.stroke();

        const gR = hexR * GLOW_RADIUS_MULT;
        const sg = ctx.createRadialGradient(cx, cy, hexR * 0.3, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Liquid particles ────────────────────────────
      for (const pt of s.particles) {
        pt.phase += 0.02 * ms;

        if (s.filled) {
          // Attract toward mold center
          const tX = s.moldCenter.x;
          const tY = s.moldCenter.y;
          pt.vx += (tX - pt.x) * ATTRACTION_SPEED * fill * ms;
          pt.vy += (tY - pt.y) * ATTRACTION_SPEED * fill * ms;
          pt.vx *= 0.95;
          pt.vy *= 0.95;
        } else {
          // Random drift
          pt.vx += (Math.random() - 0.5) * 0.02;
          pt.vy += (Math.random() - 0.5) * 0.02;
          pt.vx *= 0.98;
          pt.vy *= 0.98;
        }

        pt.x += pt.vx * 0.01 * ms;
        pt.y += pt.vy * 0.01 * ms;

        // Wrap
        if (pt.x < 0) pt.x = 1;
        if (pt.x > 1) pt.x = 0;
        if (pt.y < 0) pt.y = 1;
        if (pt.y > 1) pt.y = 0;

        const pSize = px(PARTICLE_R_FRAC + Math.sin(pt.phase) * 0.001, minDim);
        const isInMold = s.filled && s.path.length > 3 && pointInPath(pt.x * w, pt.y * h, s.path, w, h);
        const ptAlpha = isInMold
          ? ALPHA.content.max * (0.15 + fill * 0.2)
          : ALPHA.content.max * 0.1;

        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, pSize, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          isInMold ? s.primaryRgb : s.accentRgb,
          ptAlpha * entrance,
        );
        ctx.fill();
      }

      // ── Drawn path (mold boundary) ──────────────────
      if (s.path.length > 2) {
        ctx.beginPath();
        ctx.moveTo(s.path[0].x * w, s.path[0].y * h);
        for (let i = 1; i < s.path.length; i++) {
          ctx.lineTo(s.path[i].x * w, s.path[i].y * h);
        }
        if (s.filled) ctx.closePath();

        // Boundary stroke
        const boundaryAlpha = ALPHA.content.max * (s.filled ? 0.35 : 0.2) * entrance;
        ctx.strokeStyle = rgba(s.filled ? s.primaryRgb : s.accentRgb, boundaryAlpha);
        ctx.lineWidth = px(MOLD_STROKE_FRAC, minDim);
        ctx.stroke();

        // Fill glow inside mold
        if (s.filled && fill > 0.1) {
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * fill * entrance);
          ctx.fill();

          // Center glow
          const mcx = s.moldCenter.x * w;
          const mcy = s.moldCenter.y * h;
          const gR = px(SIZE.md, minDim) * GLOW_RADIUS_MULT;
          const fg = ctx.createRadialGradient(mcx, mcy, 0, mcx, mcy, gR);
          fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * FILL_GLOW_INTENSITY * fill * entrance));
          fg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * fill * entrance));
          fg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = fg;
          ctx.fillRect(mcx - gR, mcy - gR, gR * 2, gR * 2);

          // Bright core
          if (fill > 0.5) {
            const coreR = px(0.02, minDim) * fill;
            ctx.beginPath();
            ctx.arc(mcx, mcy, coreR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(
              lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
              ALPHA.focal.max * 0.25 * fill * entrance,
            );
            ctx.fill();
          }
        }
      }

      // ── Drawing cursor trail ────────────────────────
      if (s.drawing && s.path.length > 0) {
        const last = s.path[s.path.length - 1];
        const trailR = px(0.008, minDim);
        ctx.beginPath();
        ctx.arc(last.x * w, last.y * h, trailR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.filled) return;
      s.drawing = true;
      s.path = [];
      s.fillAnim = 0;
      const rect = canvas.getBoundingClientRect();
      s.path.push({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      s.path.push({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    const onUp = () => {
      const s = stateRef.current;
      if (!s.drawing) return;
      s.drawing = false;

      if (s.path.length >= MIN_PATH_POINTS) {
        // Check if path is roughly closed
        const first = s.path[0];
        const last = s.path[s.path.length - 1];
        const dist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);

        if (dist < CLOSURE_THRESHOLD) {
          s.filled = true;
          // Calculate mold center
          const sumX = s.path.reduce((a, p) => a + p.x, 0) / s.path.length;
          const sumY = s.path.reduce((a, p) => a + p.y, 0) / s.path.length;
          s.moldCenter = { x: sumX, y: sumY };
          callbacksRef.current.onHaptic('drag_snap');
        }
      }
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
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}
