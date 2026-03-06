/**
 * ATOM 242: THE BOTH/AND ENGINE
 * ================================
 * Series 25 — Dialectical Engine · Position 2
 *
 * Replace "Or" with "And." Force two magnetically repelling probability
 * clouds to overlap — the Venn intersection bursts with brilliant light.
 * The physics of superposition teaches that opposites can coexist.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - Each cloud emits circular wavefronts that propagate outward
 *   - Where wavefronts overlap, interference fringes appear:
 *     constructive (bright) where in-phase, destructive (dark) where anti-phase
 *   - Fusion produces a standing-wave interference pattern — the visual
 *     language of "both/and" made literal through wave physics
 *   - Post-fusion: unified field radiates interference rings
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + background field
 *   2. Wave propagation rings from each source
 *   3. Interference fringe field between clouds
 *   4. Cloud body shells with shimmer
 *   5. Cloud core + specular highlights
 *   6. Overlap glow / fused orb with specular
 *   7. Fusion burst particles
 *   8. Progress ring
 *
 * PHYSICS:
 *   - Two hero-sized probability clouds (primary + accent)
 *   - Magnetic repulsion (inverse-square) pushes them apart
 *   - Drag to overcome repulsion → fuse → cascading glow burst
 *   - 80+ wave ring particles propagate from each cloud center
 *   - Interference computed as cos²(Δphase) at each fringe point
 *   - Breath modulates cloud pulsation + fringe wavelength
 *
 * INTERACTION:
 *   Drag either sphere → overcome repulsion → fuse (drag_snap, error_boundary, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Fused orb with standing-wave fringes, static
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/** Compute double-slit interference intensity at a point from two sources */
function interferenceFringeIntensity(
  x: number, y: number,
  s1x: number, s1y: number,
  s2x: number, s2y: number,
  wavelength: number,
  time: number,
): number {
  const d1 = Math.hypot(x - s1x, y - s1y);
  const d2 = Math.hypot(x - s2x, y - s2y);
  const phaseDiff = ((d1 - d2) / wavelength + time) * Math.PI * 2;
  return Math.pow(Math.cos(phaseDiff * 0.5), 2); // cos² gives 0–1
}

/** Generate specular highlight on a sphere */
function drawSpecular(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  entrance: number,
): void {
  // Primary specular
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.2, cy - r * 0.25, r * 0.22, r * 0.12, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance);
  ctx.fill();
  // Secondary reflection
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.1, cy + r * 0.15, r * 0.08, r * 0.04, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.08 * entrance);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Hero cloud radius (viewport fraction) */
const CLOUD_R = SIZE.md * 0.55;
/** Magnetic repulsion coefficient */
const REPULSION_K = 0.0006;
/** Distance threshold for fusion trigger */
const FUSION_DIST = 0.08;
/** Distance for warning haptic */
const WARNING_DIST = 0.18;
/** Layered shell count per cloud */
const CLOUD_SHELLS = 6;
/** Glow bloom layer count */
const GLOW_LAYERS = 6;
/** Post-fusion animation speed */
const FUSE_SPEED = 0.016;
/** Fusion burst particle count */
const PARTICLE_COUNT = 80;
/** Particle lifetime (frames) */
const PARTICLE_LIFE = 55;
/** Cloud surface shimmer speed */
const SHIMMER_SPEED = 0.022;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Interference fringe wavelength */
const FRINGE_LAMBDA = 0.04;
/** Number of propagating wave rings per source */
const WAVE_RING_COUNT = 8;
/** Wave ring expansion speed */
const WAVE_RING_SPEED = 0.008;
/** Interference field sample grid density */
const FRINGE_GRID_SIZE = 28;
/** Fringe field render radius */
const FRINGE_FIELD_R = 0.35;
/** Breath modulation on fringe wavelength */
const BREATH_FRINGE_MOD = 0.15;
/** Breath scale modulation */
const BREATH_SCALE = 0.04;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

interface FuseParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

interface WaveRing {
  cx: number; cy: number;
  radius: number;
  source: 'a' | 'b';
  birth: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function BothAndAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    aX: 0.3, aY: 0.5, bX: 0.7, bY: 0.5,
    dragTarget: '' as '' | 'a' | 'b',
    fused: false, fuseAnim: 0,
    particles: [] as FuseParticle[],
    waveRings: [] as WaveRing[],
    dragNotified: false, errorNotified: false, completed: false,
    waveTimer: 0,
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
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const time = s.frameCount * 0.012;
      const breath = p.breathAmplitude;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') { s.fused = true; s.fuseAnim = 1; s.completed = true; }

      const dist = Math.hypot(s.aX - s.bX, s.aY - s.bY);
      const breathMod = 1 + breath * BREATH_SCALE;
      const shimmer = Math.sin(s.frameCount * SHIMMER_SPEED);

      // ── Repulsion physics ─────────────────────────────────
      if (!s.dragTarget && !s.fused && dist < 0.4 && dist > 0.01) {
        const angle = Math.atan2(s.aY - s.bY, s.aX - s.bX);
        const force = REPULSION_K / (dist * dist) * ms;
        s.aX += Math.cos(angle) * force; s.aY += Math.sin(angle) * force;
        s.bX -= Math.cos(angle) * force; s.bY -= Math.sin(angle) * force;
        s.aX = Math.max(0.1, Math.min(0.9, s.aX)); s.aY = Math.max(0.1, Math.min(0.9, s.aY));
        s.bX = Math.max(0.1, Math.min(0.9, s.bX)); s.bY = Math.max(0.1, Math.min(0.9, s.bY));
      }

      // ── Fusion check ──────────────────────────────────────
      if (dist < FUSION_DIST && !s.fused) {
        s.fused = true; cb.onHaptic('completion');
        const midX = (s.aX + s.bX) / 2; const midY = (s.aY + s.bY) / 2;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
          const speed = 0.002 + Math.random() * 0.005;
          s.particles.push({
            x: midX, y: midY,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: PARTICLE_LIFE * (0.6 + Math.random() * 0.4),
            maxLife: PARTICLE_LIFE,
            size: 0.003 + Math.random() * 0.004,
          });
        }
      }
      if (dist < WARNING_DIST && !s.fused && !s.errorNotified) {
        s.errorNotified = true; cb.onHaptic('error_boundary');
      }
      if (dist > WARNING_DIST + 0.05) s.errorNotified = false;

      if (s.fused) s.fuseAnim = Math.min(1, s.fuseAnim + FUSE_SPEED * ms);
      if (s.fuseAnim >= 0.95 && !s.completed) s.completed = true;

      const proximity = s.fused ? 1 : Math.max(0, 1 - dist / 0.5);
      cb.onStateChange?.(s.completed ? 1 : s.fused ? 0.5 + s.fuseAnim * 0.5 : proximity * 0.5);

      // ── Wave ring spawning ────────────────────────────────
      s.waveTimer += ms;
      if (s.waveTimer > 12 && !s.fused) {
        s.waveTimer = 0;
        s.waveRings.push({ cx: s.aX, cy: s.aY, radius: 0, source: 'a', birth: s.frameCount });
        s.waveRings.push({ cx: s.bX, cy: s.bY, radius: 0, source: 'b', birth: s.frameCount });
      }
      // Wave ring expansion
      for (let i = s.waveRings.length - 1; i >= 0; i--) {
        const wr = s.waveRings[i];
        wr.radius += WAVE_RING_SPEED * ms;
        if (wr.radius > 0.5) s.waveRings.splice(i, 1);
      }

      // ── Particle physics ──────────────────────────────────
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * ms; pt.y += pt.vy * ms;
        pt.vx *= 0.97; pt.vy *= 0.97;
        pt.life -= ms;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      const cR = px(CLOUD_R, minDim);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Wave propagation rings
      // ════════════════════════════════════════════════════
      for (const wr of s.waveRings) {
        const age = (s.frameCount - wr.birth) * 0.012;
        const fade = Math.max(0, 1 - wr.radius / 0.4);
        const rgb = wr.source === 'a' ? s.primaryRgb : s.accentRgb;
        const rPx = px(wr.radius, minDim);
        ctx.beginPath();
        ctx.arc(wr.cx * w, wr.cy * h, rPx, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(rgb, ALPHA.glow.max * 0.04 * fade * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Interference fringe field (SIGNATURE)
      // ════════════════════════════════════════════════════
      if (!s.fused && dist < 0.45) {
        const lambda = px(FRINGE_LAMBDA * (1 + breath * BREATH_FRINGE_MOD), minDim);
        const fieldR = px(FRINGE_FIELD_R, minDim);
        const midFx = (s.aX + s.bX) / 2 * w;
        const midFy = (s.aY + s.bY) / 2 * h;
        const fieldIntensity = Math.max(0, 1 - dist / 0.45);
        const step = (fieldR * 2) / FRINGE_GRID_SIZE;
        const blendRgb = lerpColor(s.primaryRgb, s.accentRgb, 0.5);

        for (let gx = 0; gx <= FRINGE_GRID_SIZE; gx++) {
          for (let gy = 0; gy <= FRINGE_GRID_SIZE; gy++) {
            const fx = midFx - fieldR + gx * step;
            const fy = midFy - fieldR + gy * step;
            const fDist = Math.hypot(fx - midFx, fy - midFy);
            if (fDist > fieldR) continue;
            const envelope = 1 - fDist / fieldR;
            const intensity = interferenceFringeIntensity(
              fx, fy, s.aX * w, s.aY * h, s.bX * w, s.bY * h, lambda, time * 0.3,
            );
            const fA = ALPHA.glow.max * 0.06 * intensity * envelope * fieldIntensity * entrance;
            if (fA < 0.002) continue;
            const dotR = step * 0.35 * (0.3 + intensity * 0.7);
            ctx.beginPath();
            ctx.arc(fx, fy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(lerpColor(blendRgb, [255, 255, 255] as RGB, intensity * 0.3), fA);
            ctx.fill();
          }
        }
      }

      // Standing-wave fringes post-fusion
      if (s.fused) {
        const fuseMx = (s.aX + s.bX) / 2 * w;
        const fuseMy = (s.aY + s.bY) / 2 * h;
        const standingR = cR * (1.5 + s.fuseAnim * 1.5);
        const ringCount = 12;
        const blendRgb = lerpColor(s.primaryRgb, s.accentRgb, 0.5);
        for (let ri = 0; ri < ringCount; ri++) {
          const t = ri / ringCount;
          const rr = standingR * t;
          // Standing wave: bright at antinodes, dark at nodes
          const standing = Math.pow(Math.cos(t * Math.PI * 4 + time * 0.6), 2);
          const sA = ALPHA.glow.max * 0.04 * standing * s.fuseAnim * entrance;
          if (sA < 0.001) continue;
          ctx.beginPath();
          ctx.arc(fuseMx, fuseMy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(lerpColor(blendRgb, [255, 255, 255] as RGB, standing * 0.4), sA);
          ctx.lineWidth = px(STROKE.thin, minDim) * (0.5 + standing);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4–5: Cloud bodies / Fused orb
      // ════════════════════════════════════════════════════
      if (!s.fused) {
        const drawCloud = (ox: number, oy: number, rgb: RGB) => {
          // Shadow beneath
          const shadowR = cR * 0.6;
          const shadowGrad = ctx.createRadialGradient(ox, oy + cR * 0.15, 0, ox, oy + cR * 0.15, shadowR);
          shadowGrad.addColorStop(0, rgba([0, 0, 0] as RGB, 0.03 * entrance));
          shadowGrad.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
          ctx.fillStyle = shadowGrad;
          ctx.fillRect(ox - shadowR, oy - shadowR, shadowR * 2, shadowR * 2);

          // Multi-shell cloud body
          for (let shell = CLOUD_SHELLS - 1; shell >= 0; shell--) {
            const t = shell / CLOUD_SHELLS;
            const sR = cR * (0.35 + t * 0.65 + shimmer * 0.03 * (shell % 2 === 0 ? 1 : -1)) * breathMod;
            const sA = ALPHA.content.max * (0.03 + (1 - t) * 0.09) * entrance;
            const grad = ctx.createRadialGradient(ox - sR * 0.1, oy - sR * 0.1, sR * 0.05, ox, oy, sR);
            grad.addColorStop(0, rgba(lerpColor(rgb, [255, 255, 255] as RGB, 0.2), sA * 1.2));
            grad.addColorStop(0.3, rgba(rgb, sA));
            grad.addColorStop(0.6, rgba(rgb, sA * 0.5));
            grad.addColorStop(0.85, rgba(rgb, sA * 0.15));
            grad.addColorStop(1, rgba(rgb, 0));
            ctx.fillStyle = grad; ctx.fillRect(ox - sR, oy - sR, sR * 2, sR * 2);
          }

          // Core
          const coreR = cR * 0.18;
          const coreGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, coreR);
          coreGrad.addColorStop(0, rgba(lerpColor(rgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.3 * entrance));
          coreGrad.addColorStop(0.5, rgba(rgb, ALPHA.content.max * 0.2 * entrance));
          coreGrad.addColorStop(1, rgba(rgb, 0));
          ctx.fillStyle = coreGrad;
          ctx.beginPath(); ctx.arc(ox, oy, coreR, 0, Math.PI * 2); ctx.fill();

          // Specular
          drawSpecular(ctx, ox, oy, cR * 0.3, entrance);
        };

        drawCloud(s.aX * w, s.aY * h, s.primaryRgb);
        drawCloud(s.bX * w, s.bY * h, s.accentRgb);

        // Overlap glow (when close)
        if (dist < 0.3) {
          const midX = (s.aX + s.bX) / 2 * w; const midY = (s.aY + s.bY) / 2 * h;
          const overlapIntensity = Math.max(0, 1 - dist / 0.3);
          const blendColor = lerpColor(s.primaryRgb, s.accentRgb, 0.5);
          for (let gi = 2; gi >= 0; gi--) {
            const oR = cR * (0.4 + gi * 0.3) * overlapIntensity;
            const og = ctx.createRadialGradient(midX, midY, 0, midX, midY, oR);
            const oA = ALPHA.glow.max * 0.08 * overlapIntensity * entrance / (gi + 1);
            og.addColorStop(0, rgba(lerpColor(blendColor, [255, 255, 255] as RGB, 0.3), oA));
            og.addColorStop(0.4, rgba(blendColor, oA * 0.6));
            og.addColorStop(1, rgba(blendColor, 0));
            ctx.fillStyle = og; ctx.fillRect(midX - oR, midY - oR, oR * 2, oR * 2);
          }
        }
      } else {
        // ── Post-fusion: Unified radiant orb ───────────────
        const fuseMidX = (s.aX + s.bX) / 2 * w;
        const fuseMidY = (s.aY + s.bY) / 2 * h;
        const blendColor = lerpColor(s.primaryRgb, s.accentRgb, 0.5);

        // Multi-layer glow field
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = cR * (1.0 + s.fuseAnim * 1.8 + gi * 0.4) * breathMod;
          const gA = ALPHA.glow.max * (0.04 + s.fuseAnim * 0.12) * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(fuseMidX, fuseMidY, 0, fuseMidX, fuseMidY, gR);
          gg.addColorStop(0, rgba(lerpColor(blendColor, [255, 255, 255] as RGB, 0.15), gA));
          gg.addColorStop(0.2, rgba(blendColor, gA * 0.6));
          gg.addColorStop(0.5, rgba(s.primaryRgb, gA * 0.2));
          gg.addColorStop(0.75, rgba(s.accentRgb, gA * 0.05));
          gg.addColorStop(1, rgba(blendColor, 0));
          ctx.fillStyle = gg; ctx.fillRect(fuseMidX - gR, fuseMidY - gR, gR * 2, gR * 2);
        }

        // Core orb with multi-stop gradient
        const orbR = cR * (0.25 + s.fuseAnim * 0.35) * breathMod;
        const orbGrad = ctx.createRadialGradient(
          fuseMidX - orbR * 0.15, fuseMidY - orbR * 0.15, orbR * 0.05,
          fuseMidX, fuseMidY, orbR,
        );
        orbGrad.addColorStop(0, rgba(lerpColor(blendColor, [255, 255, 255] as RGB, 0.5), ALPHA.content.max * 0.45 * s.fuseAnim * entrance));
        orbGrad.addColorStop(0.3, rgba(blendColor, ALPHA.content.max * 0.35 * s.fuseAnim * entrance));
        orbGrad.addColorStop(0.7, rgba(blendColor, ALPHA.content.max * 0.15 * s.fuseAnim * entrance));
        orbGrad.addColorStop(1, rgba(blendColor, 0));
        ctx.beginPath(); ctx.arc(fuseMidX, fuseMidY, orbR, 0, Math.PI * 2);
        ctx.fillStyle = orbGrad; ctx.fill();

        // Orb edge
        ctx.beginPath(); ctx.arc(fuseMidX, fuseMidY, orbR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(blendColor, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * 0.06 * s.fuseAnim * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();

        // Specular on fused orb
        drawSpecular(ctx, fuseMidX, fuseMidY, orbR, s.fuseAnim * entrance);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Fusion particles
      // ════════════════════════════════════════════════════
      for (const pt of s.particles) {
        const t = pt.life / pt.maxLife;
        const ptR = px(pt.size * t, minDim);
        const ptColor = lerpColor(s.primaryRgb, s.accentRgb, t);

        // Particle glow
        const pgR = ptR * 3;
        const pg = ctx.createRadialGradient(pt.x * w, pt.y * h, 0, pt.x * w, pt.y * h, pgR);
        pg.addColorStop(0, rgba(ptColor, ALPHA.glow.max * 0.08 * t * entrance));
        pg.addColorStop(1, rgba(ptColor, 0));
        ctx.fillStyle = pg;
        ctx.fillRect(pt.x * w - pgR, pt.y * h - pgR, pgR * 2, pgR * 2);

        // Particle core
        ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, ptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(ptColor, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * 0.5 * t * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : proximity;
      if (prog > 0.01) {
        ctx.beginPath(); ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.fused) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const dA = Math.hypot(mx - s.aX, my - s.aY);
      const dB = Math.hypot(mx - s.bX, my - s.bY);
      if (dA < 0.14 && dA < dB) s.dragTarget = 'a';
      else if (dB < 0.14) s.dragTarget = 'b';
      if (s.dragTarget && !s.dragNotified) {
        s.dragNotified = true; callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragTarget) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      if (s.dragTarget === 'a') { s.aX = mx; s.aY = my; } else { s.bX = mx; s.bY = my; }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragTarget = '';
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
