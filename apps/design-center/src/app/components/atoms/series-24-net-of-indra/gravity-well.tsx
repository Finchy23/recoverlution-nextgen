/**
 * ATOM 237: THE GRAVITY WELL ENGINE
 * ====================================
 * Series 24 — Net of Indra · Position 7
 *
 * Your mass affects their trajectory. Move with mindful slowness —
 * let smaller nodes establish safe orbit. Move too fast and you
 * fling them off-screen.
 *
 * PHYSICS:
 *   - Central massive body (SIZE.md) controlled by pointer
 *   - 12 smaller orbital nodes with Newtonian gravitation
 *   - Spacetime grid (15x15) that deforms around the massive body
 *   - Grid deformation = visual analogy for spacetime curvature
 *   - Slow movement → nodes achieve stable orbit → warm glow
 *   - Fast movement → nodes flung into chaos → grid distortion spikes
 *   - 5+ nodes in stable orbit = completion
 *   - Breath modulates gravitational constant (calmer = gentler pull)
 *
 * INTERACTION:
 *   Pointer position → moves massive body (the gravity well)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static orbital diagram with grid
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

/** Massive body visual radius */
const MASS_R = SIZE.md;
/** Orbital node count */
const NODE_COUNT = 12;
/** Node visual radius */
const NODE_R = 0.008;
/** Gravitational constant */
const G = 0.00008;
/** Minimum orbit distance (prevents infinite force) */
const MIN_DIST = 0.04;
/** Stable orbit speed range */
const STABLE_SPEED_MIN = 0.001;
const STABLE_SPEED_MAX = 0.006;
/** Stable orbit distance range */
const STABLE_ORBIT_MIN = 0.08;
const STABLE_ORBIT_MAX = 0.35;
/** Grid cell count per axis */
const GRID_CELLS = 14;
/** Grid deformation strength */
const GRID_DEFORM = 0.03;
/** Breath gravity modulation */
const BREATH_GRAVITY = 0.25;
/** Nodes in orbit for completion */
const ORBIT_NEEDED = 5;
/** Frames of orbit for "stable" */
const STABLE_FRAMES = 120;
/** Mass body movement speed damping */
const MASS_FOLLOW_SPEED = 0.04;

// =====================================================================
// STATE TYPES
// =====================================================================

interface OrbitalNode {
  x: number; y: number;
  vx: number; vy: number;
  /** Frames in stable orbit */
  stableFrames: number;
  brightness: number;
  phase: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function createNodes(): OrbitalNode[] {
  return Array.from({ length: NODE_COUNT }, (_, i) => {
    const angle = (i / NODE_COUNT) * Math.PI * 2;
    const dist = 0.12 + Math.random() * 0.25;
    return {
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.5 + Math.sin(angle) * dist,
      vx: -Math.sin(angle) * 0.002,
      vy: Math.cos(angle) * 0.002,
      stableFrames: 0,
      brightness: 0.4 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    };
  });
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function GravityWellAtom({
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
    massX: 0.5,
    massY: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    nodes: createNodes(),
    completed: false,
    stepNotified: false,
    completionGlow: 0,
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

      // Smooth mass body movement
      s.massX += (s.targetX - s.massX) * MASS_FOLLOW_SPEED * ms;
      s.massY += (s.targetY - s.massY) * MASS_FOLLOW_SPEED * ms;

      if (p.phase === 'resolve') {
        s.nodes.forEach(n => { n.stableFrames = STABLE_FRAMES; });
        s.completed = true;
      }

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        // Static orbital diagram
        const massRPx = px(MASS_R, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, massRPx, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.fill();
        for (let i = 0; i < NODE_COUNT; i++) {
          const angle = (i / NODE_COUNT) * Math.PI * 2;
          const dist = 0.12 + (i % 3) * 0.06;
          const nx = cx + Math.cos(angle) * px(dist, minDim);
          const ny = cy + Math.sin(angle) * px(dist, minDim);
          ctx.beginPath();
          ctx.arc(nx, ny, px(NODE_R, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
          ctx.fill();
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // NEWTONIAN GRAVITY PHYSICS
      // ════════════════════════════════════════════════════
      const gMod = G * (1 - breath * BREATH_GRAVITY * 0.5);
      let stableCount = 0;

      for (const n of s.nodes) {
        const dx = s.massX - n.x;
        const dy = s.massY - n.y;
        const dist = Math.max(MIN_DIST, Math.sqrt(dx * dx + dy * dy));

        // Gravitational force
        const force = gMod / (dist * dist);
        n.vx += (dx / dist) * force * ms;
        n.vy += (dy / dist) * force * ms;

        n.x += n.vx * ms;
        n.y += n.vy * ms;

        // Boundary bounce
        if (n.x < 0.02 || n.x > 0.98) { n.vx *= -0.6; n.x = Math.max(0.02, Math.min(0.98, n.x)); }
        if (n.y < 0.02 || n.y > 0.98) { n.vy *= -0.6; n.y = Math.max(0.02, Math.min(0.98, n.y)); }

        // Stable orbit detection
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        const inOrbit = dist > STABLE_ORBIT_MIN && dist < STABLE_ORBIT_MAX &&
          speed > STABLE_SPEED_MIN && speed < STABLE_SPEED_MAX;

        if (inOrbit) {
          n.stableFrames = Math.min(STABLE_FRAMES, n.stableFrames + ms);
        } else {
          n.stableFrames = Math.max(0, n.stableFrames - ms * 0.3);
        }

        if (n.stableFrames >= STABLE_FRAMES) stableCount++;
      }

      if (stableCount >= Math.floor(ORBIT_NEEDED * 0.5) && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (stableCount >= ORBIT_NEEDED && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      }

      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : (stableCount / ORBIT_NEEDED) * 0.5);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Spacetime grid
      // ════════════════════════════════════════════════════
      const gridAlpha = ALPHA.content.max * 0.04 * entrance;
      for (let gx = 0; gx <= GRID_CELLS; gx++) {
        ctx.beginPath();
        for (let gy = 0; gy <= GRID_CELLS; gy++) {
          let px2 = gx / GRID_CELLS;
          let py2 = gy / GRID_CELLS;

          // Deform toward mass
          const gdx = s.massX - px2;
          const gdy = s.massY - py2;
          const gDist = Math.max(0.03, Math.sqrt(gdx * gdx + gdy * gdy));
          const deform = GRID_DEFORM / (gDist * gDist + 0.01);
          px2 += gdx * deform;
          py2 += gdy * deform;

          if (gy === 0) ctx.moveTo(px2 * w, py2 * h);
          else ctx.lineTo(px2 * w, py2 * h);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, gridAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }
      // Horizontal lines
      for (let gy = 0; gy <= GRID_CELLS; gy++) {
        ctx.beginPath();
        for (let gx = 0; gx <= GRID_CELLS; gx++) {
          let px2 = gx / GRID_CELLS;
          let py2 = gy / GRID_CELLS;
          const gdx = s.massX - px2;
          const gdy = s.massY - py2;
          const gDist = Math.max(0.03, Math.sqrt(gdx * gdx + gdy * gdy));
          const deform = GRID_DEFORM / (gDist * gDist + 0.01);
          px2 += gdx * deform;
          py2 += gdy * deform;
          if (gx === 0) ctx.moveTo(px2 * w, py2 * h);
          else ctx.lineTo(px2 * w, py2 * h);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, gridAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Gravity well depression glow
      // ════════════════════════════════════════════════════
      const massPx = s.massX * w;
      const massPy = s.massY * h;
      const wellR = px(MASS_R * 1.8, minDim);
      const wellGrad = ctx.createRadialGradient(massPx, massPy, 0, massPx, massPy, wellR);
      wellGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
      wellGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * entrance));
      wellGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.max * 0.008 * entrance));
      wellGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = wellGrad;
      ctx.fillRect(massPx - wellR, massPy - wellR, wellR * 2, wellR * 2);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Orbital nodes
      // ════════════════════════════════════════════════════
      for (const n of s.nodes) {
        const nx = n.x * w;
        const ny = n.y * h;
        const stability = n.stableFrames / STABLE_FRAMES;
        const nR = px(NODE_R + stability * 0.004, minDim);
        const nodeColor = lerpColor(s.accentRgb, s.primaryRgb, stability);

        // Node glow
        if (stability > 0.2 || n.brightness > 0.6) {
          const ngR = nR * (2 + stability * 3);
          const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, ngR);
          ng.addColorStop(0, rgba(nodeColor, ALPHA.glow.max * 0.08 * (0.3 + stability * 0.7) * entrance));
          ng.addColorStop(0.4, rgba(nodeColor, ALPHA.glow.max * 0.02 * entrance));
          ng.addColorStop(1, rgba(nodeColor, 0));
          ctx.fillStyle = ng;
          ctx.fillRect(nx - ngR, ny - ngR, ngR * 2, ngR * 2);
        }

        // Node body
        const nGrad = ctx.createRadialGradient(nx - nR * 0.2, ny - nR * 0.2, nR * 0.1, nx, ny, nR);
        nGrad.addColorStop(0, rgba(lerpColor(nodeColor, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * (0.2 + stability * 0.3) * entrance));
        nGrad.addColorStop(0.5, rgba(nodeColor, ALPHA.content.max * (0.15 + stability * 0.25) * entrance));
        nGrad.addColorStop(1, rgba(nodeColor, ALPHA.content.max * 0.05 * entrance));
        ctx.beginPath();
        ctx.arc(nx, ny, nR, 0, Math.PI * 2);
        ctx.fillStyle = nGrad;
        ctx.fill();

        // Orbit trail (for stable nodes)
        if (stability > 0.3) {
          const dist = Math.sqrt(Math.pow(n.x - s.massX, 2) + Math.pow(n.y - s.massY, 2));
          ctx.beginPath();
          ctx.arc(massPx, massPy, dist * minDim, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(nodeColor, ALPHA.content.max * 0.03 * stability * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Massive body
      // ════════════════════════════════════════════════════
      const massRPx = px(MASS_R * 0.3, minDim);

      // Shadow
      const shadowR = massRPx * 2.5;
      const shadow = ctx.createRadialGradient(massPx, massPy + massRPx * 0.3, 0, massPx, massPy, shadowR);
      shadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.05 * entrance));
      shadow.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(massPx - shadowR, massPy - shadowR, shadowR * 2, shadowR * 2);

      // Body
      const massGrad = ctx.createRadialGradient(
        massPx - massRPx * 0.2, massPy - massRPx * 0.2, massRPx * 0.1,
        massPx, massPy, massRPx,
      );
      massGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.5 * entrance));
      massGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance));
      massGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance));
      ctx.beginPath();
      ctx.arc(massPx, massPy, massRPx, 0, Math.PI * 2);
      ctx.fillStyle = massGrad;
      ctx.fill();

      // Specular
      ctx.beginPath();
      ctx.ellipse(massPx - massRPx * 0.2, massPy - massRPx * 0.25, massRPx * 0.3, massRPx * 0.18, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance);
      ctx.fill();

      // ── Progress ───────────────────────────────────────
      if (!s.completed && stableCount > 0) {
        const progR = px(SIZE.xs, minDim);
        const prog = stableCount / ORBIT_NEEDED;
        ctx.beginPath();
        ctx.arc(massPx, massPy - px(MASS_R * 0.5, minDim), progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.targetX = (e.clientX - rect.left) / rect.width;
      stateRef.current.targetY = (e.clientY - rect.top) / rect.height;
    };
    const onLeave = () => {
      stateRef.current.targetX = 0.5;
      stateRef.current.targetY = 0.5;
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'none' }}
      />
    </div>
  );
}
