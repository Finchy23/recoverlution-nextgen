/**
 * ATOM 629: THE NON-NEWTONIAN FLOOR ENGINE
 * ==========================================
 * Series 63 — Elastic Yield · Position 9
 *
 * Cure risk paralysis. Stir the concrete floor with two fingers
 * into high-viscosity non-Newtonian fluid — the falling node plunges
 * deep into the soft Z-axis safely decelerating to a perfect stop.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Concrete floor shows rigid stress concentration on impact (instant white fracture)
 *   - Stirring: floor segments transition stress state (grey→blue→fluid purple)
 *   - Non-Newtonian fluid: viscosity stress colored by shear rate
 *   - Node entry: stress wave propagates downward through fluid layers
 *   - Deceleration: per-layer stress decreases with depth (warm→cool gradient)
 *   - Final: zero-stress safe stop with cool blue cradle
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + gravity field gradient
 *   2. Floor body with per-segment viscosity stress coloring
 *   3. Floor surface line (concrete → wave → fluid)
 *   4. Falling node with velocity trail + impact glow
 *   5. Fluid deformation (z-axis sink visualization)
 *   6. Stir indicator (circular motion feedback)
 *   7. Stress wave propagation through fluid
 *   8. Progress ring + completion bloom
 *
 * PHYSICS:
 *   - Node in freefall (gravity acceleration)
 *   - Concrete floor = instant crash (stress → fracture)
 *   - Stir converts floor to non-Newtonian fluid (viscosity slider)
 *   - Fluid catches node: deceleration = viscosity × velocity²
 *   - Sink depth proportional to entry velocity
 *   - Breath modulates fluid surface wave amplitude
 *
 * INTERACTION:
 *   Circular drag (stir) → viscosity shift → safe catch
 *   (drag_snap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static fluid floor with node safely caught
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, FONT_SIZE, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS TENSOR HELPER
// ═════════════════════════════════════════════════════════════════════

function stressHeat(s: number): RGB {
  if (s < 0.25) return lerpColor([50, 90, 200] as RGB, [60, 180, 130] as RGB, s / 0.25);
  if (s < 0.5) return lerpColor([60, 180, 130] as RGB, [220, 200, 50] as RGB, (s - 0.25) / 0.25);
  if (s < 0.75) return lerpColor([220, 200, 50] as RGB, [220, 80, 60] as RGB, (s - 0.5) / 0.25);
  return lerpColor([220, 80, 60] as RGB, [255, 240, 240] as RGB, (s - 0.75) / 0.25);
}

/** Viscosity-to-color: grey concrete → cool fluid purple */
function viscosityColor(v: number, primary: RGB): RGB {
  if (v < 0.3) return lerpColor([120, 120, 130] as RGB, [80, 100, 180] as RGB, v / 0.3);
  if (v < 0.7) return lerpColor([80, 100, 180] as RGB, primary, (v - 0.3) / 0.4);
  return lerpColor(primary, [130, 80, 200] as RGB, (v - 0.7) / 0.3);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Floor Y position (fraction from top) */
const FLOOR_Y_FRAC = 0.62;
/** Floor depth (fraction of viewport height) */
const FLOOR_DEPTH_FRAC = 0.3;
/** Node radius (hero element) */
const NODE_R = SIZE.md * 0.15;
/** Node start Y (fraction from top) */
const NODE_START_Y = 0.06;
/** Gravity acceleration per frame */
const GRAVITY = 0.00045;
/** Stir full-circle requirement (radians) */
const STIR_FULL = Math.PI * 4;
/** Fluid viscosity threshold for safe catch */
const CATCH_VISCOSITY = 0.6;
/** Fluid deceleration multiplier */
const FLUID_DECEL = 0.91;
/** Max sink depth (fraction of floor depth) */
const MAX_SINK = 0.85;
/** Surface wave segments */
const WAVE_SEGS = 32;
/** Floor column count for stress visualization */
const FLOOR_COLS = 12;
/** Floor row count (depth layers) */
const FLOOR_ROWS = 6;
/** Stress wave speed through fluid */
const STRESS_WAVE_SPEED = 0.04;
/** Stress wave ring count */
const STRESS_RING_COUNT = 4;
/** Velocity trail length */
const TRAIL_LEN = 12;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Respawn delay */
const RESPAWN_DELAY = 110;
/** Bloom duration */
const BLOOM_DURATION = 50;
/** Breath wave modulation */
const BREATH_WAVE_MOD = 0.15;
/** Crash fragment count */
const CRASH_FRAG_COUNT = 14;
/** Fragment lifetime */
const FRAG_LIFE = 40;
/** Crash respawn delay */
const CRASH_RESPAWN = 80;
/** Specular on node */
const SPECULAR_K = 0.25;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface CrashFrag {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
}

interface StressRing {
  depth: number;  // 0–1 through fluid
  alpha: number;
  born: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function NonNewtonianFloorAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    // Floor state
    stir: 0,             // 0 = concrete, 1 = full fluid
    // Node state
    nodeY: NODE_START_Y,
    nodeVy: 0,
    falling: true,
    sinking: false,
    sinkDepth: 0,
    // Crash state
    crashed: false,
    crashFrags: [] as CrashFrag[],
    // Completion
    completed: false,
    respawnTimer: 0,
    lastTier: 0,
    // Stir tracking
    dragging: false,
    lastAngle: 0,
    stirAccum: 0,
    // Stress waves through fluid
    stressRings: [] as StressRing[],
    // Trail
    trail: [] as { y: number }[],
    // Bloom
    bloomT: -1,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude; s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const floorY = h * FLOOR_Y_FRAC;
      const floorDepth = h * FLOOR_DEPTH_FRAC;
      const nodeR = px(NODE_R, minDim);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + gravity field
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Gravity gradient (darker at bottom)
      const gravGrad = ctx.createLinearGradient(0, 0, 0, h);
      gravGrad.addColorStop(0, rgba([0, 0, 0] as RGB, 0));
      gravGrad.addColorStop(0.6, rgba([0, 0, 0] as RGB, 0));
      gravGrad.addColorStop(1, rgba([0, 0, 0] as RGB, 0.03 * entrance));
      ctx.fillStyle = gravGrad; ctx.fillRect(0, 0, w, h);

      // ── Reduced motion ─────────────────────────────────
      if (p.reducedMotion) {
        // Static fluid floor with node safely caught
        const vc = viscosityColor(0.8, s.primaryRgb);
        ctx.fillStyle = rgba(vc, ALPHA.content.max * 0.15 * entrance);
        ctx.fillRect(0, floorY, w, floorDepth);
        // Surface
        ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(w, floorY);
        ctx.strokeStyle = rgba(vc, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
        // Node caught in fluid
        const safeY = floorY + floorDepth * 0.4;
        ctx.beginPath(); ctx.arc(cx, safeY, nodeR * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance); ctx.fill();
        // Cradle glow
        const cg = ctx.createRadialGradient(cx, safeY, 0, cx, safeY, nodeR * 3);
        cg.addColorStop(0, rgba(stressHeat(0.05), ALPHA.glow.max * 0.06 * entrance));
        cg.addColorStop(1, rgba(stressHeat(0.05), 0));
        ctx.fillStyle = cg; ctx.fillRect(cx - nodeR * 3, safeY - nodeR * 3, nodeR * 6, nodeR * 6);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Physics ─────────────────────────────────────────
      if (!s.completed && !s.crashed) {
        if (s.falling) {
          s.nodeVy += GRAVITY;
          s.nodeY += s.nodeVy;
          // Trail
          s.trail.push({ y: s.nodeY });
          if (s.trail.length > TRAIL_LEN) s.trail.shift();

          if (s.nodeY * h >= floorY - nodeR) {
            if (s.stir >= CATCH_VISCOSITY) {
              s.falling = false;
              s.sinking = true;
              // Spawn stress waves
              for (let i = 0; i < STRESS_RING_COUNT; i++) {
                s.stressRings.push({ depth: 0, alpha: 1, born: s.frameCount + i * 6 });
              }
              cb.onHaptic('drag_snap');
            } else {
              // Crash on concrete
              s.crashed = true;
              s.falling = false;
              s.nodeY = (floorY - nodeR) / h;
              // Spawn fragments
              for (let i = 0; i < CRASH_FRAG_COUNT; i++) {
                const angle = Math.random() * Math.PI * 2;
                s.crashFrags.push({
                  x: cx + Math.cos(angle) * nodeR * 0.5,
                  y: floorY,
                  vx: Math.cos(angle) * (1 + Math.random() * 3),
                  vy: -(2 + Math.random() * 4),
                  life: FRAG_LIFE,
                });
              }
              cb.onHaptic('error_boundary');
              s.respawnTimer = CRASH_RESPAWN;
            }
          }
        }

        if (s.sinking) {
          s.nodeVy *= FLUID_DECEL;
          s.nodeY += s.nodeVy * 0.3;
          s.sinkDepth = Math.min(MAX_SINK, s.sinkDepth + 0.006 + s.nodeVy * 5);
          cb.onStateChange?.(0.5 + s.sinkDepth * 0.5 / MAX_SINK);
          const tier = Math.floor(s.sinkDepth / MAX_SINK * 4);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

          if (s.sinkDepth >= MAX_SINK * 0.95 || s.nodeVy < 0.0001) {
            s.completed = true;
            s.bloomT = 0;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Stress wave propagation
        for (const sr of s.stressRings) {
          if (s.frameCount >= sr.born) {
            sr.depth += STRESS_WAVE_SPEED;
            sr.alpha = Math.max(0, 1 - sr.depth * 1.2);
          }
        }
        s.stressRings = s.stressRings.filter(sr => sr.alpha > 0);
      }

      // Crash respawn
      if (s.crashed) {
        for (const f of s.crashFrags) {
          f.x += f.vx; f.y += f.vy; f.vy += 0.2; f.life--;
        }
        s.crashFrags = s.crashFrags.filter(f => f.life > 0);
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.crashed = false; s.nodeY = NODE_START_Y; s.nodeVy = 0;
          s.falling = true; s.trail = []; s.crashFrags = [];
        }
      }

      // Bloom
      if (s.bloomT >= 0) { s.bloomT++; if (s.bloomT > BLOOM_DURATION) s.bloomT = -1; }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Floor body with stress coloring
      // ════════════════════════════════════════════════════
      const colW = w / FLOOR_COLS;
      const rowH = floorDepth / FLOOR_ROWS;
      for (let r = 0; r < FLOOR_ROWS; r++) {
        for (let c = 0; c < FLOOR_COLS; c++) {
          const cellX = c * colW; const cellY = floorY + r * rowH;
          const depthFrac = r / FLOOR_ROWS;

          // Viscosity-based color
          const vc = viscosityColor(s.stir, s.primaryRgb);

          // Stress from sinking node proximity
          let cellStress = 0;
          if (s.sinking || s.completed) {
            const nodeSinkY = floorY + s.sinkDepth * floorDepth;
            const dx = Math.abs((cellX + colW / 2) - cx) / w;
            const dy = Math.abs((cellY + rowH / 2) - nodeSinkY) / floorDepth;
            cellStress = Math.max(0, 1 - (dx * 4 + dy * 2)) * 0.6;
          }

          const baseAlpha = ALPHA.content.max * (0.08 + s.stir * 0.12 + depthFrac * 0.05) * entrance;
          const finalColor = cellStress > 0.05 ? lerpColor(vc, stressHeat(cellStress * 0.5), cellStress) : vc;

          ctx.fillStyle = rgba(finalColor, baseAlpha);
          ctx.fillRect(cellX, cellY, colW, rowH);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Floor surface line
      // ════════════════════════════════════════════════════
      ctx.beginPath();
      const vc = viscosityColor(s.stir, s.primaryRgb);
      if (s.stir > 0.2) {
        for (let i = 0; i <= WAVE_SEGS; i++) {
          const t = i / WAVE_SEGS;
          const x = t * w;
          const waveAmp = minDim * 0.006 * s.stir * (1 + breath * BREATH_WAVE_MOD);
          const wave = Math.sin(t * 10 + s.frameCount * 0.04 * ms) * waveAmp
                     + Math.sin(t * 5 - s.frameCount * 0.02 * ms) * waveAmp * 0.5;
          if (i === 0) ctx.moveTo(x, floorY + wave); else ctx.lineTo(x, floorY + wave);
        }
      } else {
        ctx.moveTo(0, floorY); ctx.lineTo(w, floorY);
      }
      ctx.strokeStyle = rgba(vc, ALPHA.content.max * (0.3 + s.stir * 0.3) * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();

      // Concrete texture (when not stirred)
      if (s.stir < 0.5) {
        const texAlpha = ALPHA.atmosphere.min * (1 - s.stir * 2) * entrance;
        for (let i = 0; i < 20; i++) {
          const tx = (Math.sin(i * 7.3) * 0.5 + 0.5) * w;
          const ty = floorY + (Math.cos(i * 11.7) * 0.5 + 0.5) * floorDepth * 0.3;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + minDim * 0.01, ty + minDim * 0.003);
          ctx.strokeStyle = rgba([100, 100, 110] as RGB, texAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Falling node + velocity trail
      // ════════════════════════════════════════════════════
      const nodePixY = s.sinking ? floorY + s.sinkDepth * floorDepth : s.nodeY * h;
      const nodeVisible = !s.crashed && (!s.completed || s.bloomT >= 0);

      if (nodeVisible) {
        // Velocity trail
        if (s.falling && s.trail.length > 1) {
          for (let i = 0; i < s.trail.length - 1; i++) {
            const t = i / s.trail.length;
            const ty = s.trail[i].y * h;
            ctx.beginPath(); ctx.arc(cx, ty, nodeR * (0.15 + t * 0.2), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * t * entrance);
            ctx.fill();
          }
        }

        // Node glow
        const glowR = nodeR * (2.5 + (s.sinking ? (1 - s.sinkDepth / MAX_SINK) * 1.5 : s.nodeVy * 50));
        const nGlow = ctx.createRadialGradient(cx, nodePixY, nodeR * 0.5, cx, nodePixY, glowR);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * entrance));
        nGlow.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * 0.04 * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(cx - glowR, nodePixY - glowR, glowR * 2, glowR * 2);

        // Node body
        const sinkAlpha = s.sinking ? Math.max(0.3, 1 - s.sinkDepth * 0.7) : 1;
        ctx.beginPath();
        ctx.arc(cx, nodePixY, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        const nodeGrad = ctx.createRadialGradient(cx, nodePixY, 0, cx, nodePixY, nodeR);
        nodeGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * sinkAlpha * entrance));
        nodeGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * 0.6 * sinkAlpha * entrance));
        nodeGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.atmosphere.min * sinkAlpha * entrance));
        ctx.fillStyle = nodeGrad; ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(cx - nodeR * 0.2, nodePixY - nodeR * 0.25, nodeR * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.glow.max * SPECULAR_K * sinkAlpha * entrance);
        ctx.fill();
      }

      // Crash fragments
      for (const f of s.crashFrags) {
        const la = f.life / FRAG_LIFE;
        ctx.beginPath(); ctx.arc(f.x, f.y, px(0.003, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(stressHeat(0.8), ALPHA.content.max * la * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Fluid deformation (sink visualization)
      // ════════════════════════════════════════════════════
      if (s.sinking && s.sinkDepth > 0.05) {
        // Concentric depth rings showing z-axis deformation
        const rings = 4;
        for (let i = 1; i <= rings; i++) {
          const ringDepthFrac = (i / rings) * s.sinkDepth;
          const ringY = floorY + ringDepthFrac * floorDepth;
          const ringW = minDim * (0.08 - i * 0.015) * (1 - ringDepthFrac * 0.3);
          const ringStress = 0.3 - ringDepthFrac * 0.25;
          const ringAlpha = ALPHA.content.max * 0.12 * (1 - ringDepthFrac) * entrance;

          ctx.beginPath();
          ctx.ellipse(cx, ringY, ringW, ringW * 0.2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(stressHeat(Math.max(0, ringStress)), ringAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Stir indicator
      // ════════════════════════════════════════════════════
      if (s.stir > 0.05 && !s.sinking && !s.completed) {
        const stirR = minDim * (0.04 + s.stir * 0.03);
        const stirCy = floorY + minDim * 0.05;
        const stirAngle = s.frameCount * 0.05 * ms;

        // Rotating arc
        ctx.beginPath();
        ctx.arc(cx, stirCy, stirR, stirAngle, stirAngle + Math.PI * 1.2 * s.stir);
        ctx.strokeStyle = rgba(vc, ALPHA.atmosphere.max * 0.25 * s.stir * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();

        // Stir dots
        for (let i = 0; i < 4; i++) {
          const dotAngle = stirAngle + (Math.PI * 2 * i) / 4;
          const dx = cx + Math.cos(dotAngle) * stirR;
          const dy = stirCy + Math.sin(dotAngle) * stirR * 0.5;
          ctx.beginPath(); ctx.arc(dx, dy, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(vc, ALPHA.content.max * 0.2 * s.stir * entrance);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Stress wave through fluid
      // ════════════════════════════════════════════════════
      for (const sr of s.stressRings) {
        if (s.frameCount < sr.born || sr.alpha <= 0) continue;
        const ringY = floorY + sr.depth * floorDepth;
        const ringW = minDim * 0.12 * (1 - sr.depth * 0.4);
        if (ringW < 1) continue;

        ctx.beginPath();
        ctx.ellipse(cx, ringY, ringW, ringW * 0.15, 0, 0, Math.PI * 2);
        const ringStress = Math.max(0, 0.5 - sr.depth * 0.4);
        ctx.strokeStyle = rgba(stressHeat(ringStress), ALPHA.content.max * sr.alpha * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring + completion bloom
      // ════════════════════════════════════════════════════
      const progValue = s.sinking ? (0.5 + s.sinkDepth * 0.5 / MAX_SINK) : (s.completed ? 1 : s.stir * 0.5);
      if (progValue > 0) {
        const ringR = px(PROGRESS_RING_R, minDim);
        const ringAngle = progValue * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy * 0.5, ringR, -Math.PI / 2, -Math.PI / 2 + ringAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();

        if (progValue > 0.1) {
          ctx.font = `${px(FONT_SIZE.xs, minDim)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.min * entrance);
          ctx.fillText(`${Math.round(progValue * 100)}%`, cx, cy * 0.5 + ringR + px(0.025, minDim));
        }
      }

      // Completion bloom
      if (s.bloomT >= 0 && s.bloomT < BLOOM_DURATION) {
        const bf = s.bloomT / BLOOM_DURATION;
        const bR = minDim * (0.08 + bf * 0.25);
        const safeY = floorY + s.sinkDepth * floorDepth;
        const bAlpha = (1 - bf) * ALPHA.glow.max * 0.15 * entrance;
        const bGrad = ctx.createRadialGradient(cx, safeY, 0, cx, safeY, bR);
        bGrad.addColorStop(0, rgba(stressHeat(0.05), bAlpha));
        bGrad.addColorStop(0.5, rgba(s.primaryRgb, bAlpha * 0.4));
        bGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bGrad;
        ctx.fillRect(cx - bR, safeY - bR, bR * 2, bR * 2);
      }

      // ── Respawn ────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.stir = 0; s.nodeY = NODE_START_Y; s.nodeVy = 0;
          s.falling = true; s.sinking = false; s.sinkDepth = 0;
          s.completed = false; s.lastTier = 0; s.stirAccum = 0;
          s.stressRings = []; s.trail = []; s.bloomT = -1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const getAngle = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      return Math.atan2(my, mx);
    };

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.lastAngle = getAngle(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed || s.crashed) return;
      const angle = getAngle(e);
      let delta = angle - s.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.stirAccum += Math.abs(delta);
      const prevStir = s.stir;
      s.stir = Math.min(1, s.stirAccum / STIR_FULL);
      s.lastAngle = angle;
      cbRef.current.onStateChange?.(s.stir * 0.5);
      if (s.stir >= CATCH_VISCOSITY && prevStir < CATCH_VISCOSITY) {
        cbRef.current.onHaptic('drag_snap');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
