/**
 * ATOM 022: THE BOIDS FLOCKING ENGINE
 * =====================================
 * Series 3 — Biomimetic Algorithms · Position 2
 *
 * The ego believes it is a single dictator commanding the brain.
 * The Sovereign Mind knows it is a parliament of parts. This atom
 * trains the user to guide chaotic thoughts like a flock of birds,
 * using influence rather than force.
 *
 * 120 luminous boids start scattered, moving erratically. Touch
 * the screen — your finger becomes a gentle gravitational attractor.
 * Move slowly and deliberately → the flock coheres into a beautiful
 * murmuration, flowing as one living entity. Move too fast → the
 * flock SCATTERS. Only patience and gentleness bring harmony.
 *
 * PHYSICS:
 *   - Craig Reynolds' Boids algorithm:
 *     1. Separation — steer away from crowding neighbors
 *     2. Alignment  — steer toward average heading of neighbors
 *     3. Cohesion   — steer toward average position of neighbors
 *   - Touch point = gentle attractor (inverse square, capped)
 *   - High touch velocity = scatter force (flock disperses)
 *   - Breath modulates perception radius (deeper = wider awareness)
 *   - Coherence metric: average alignment of velocity vectors
 *   - Each boid leaves a fading trail (3 history points)
 *
 * HAPTIC JOURNEY:
 *   Touch   → hold_start (attractor engaged)
 *   Coherence crosses 0.5, 0.75 → step_advance
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Boids visible but no trails, slower velocities
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const BOID_COUNT = 120;
/** Max speed */
const MAX_SPEED = 2.8;
/** Min speed (they never fully stop) */
const MIN_SPEED = 0.3;
/** Max steering force per frame */
const MAX_FORCE = 0.08;
/** Separation distance as fraction of minDim */
const SEP_DIST_FRAC = 0.05;
/** Alignment / cohesion perception radius as fraction of minDim */
const PERCEPTION_FRAC = 0.15;
/** Separation weight */
const W_SEP = 1.8;
/** Alignment weight */
const W_ALI = 1.0;
/** Cohesion weight */
const W_COH = 0.8;
/** Attractor force (gentle) */
const ATTRACTOR_FORCE = 0.015;
/** Attractor max range as fraction of min dimension */
const ATTRACTOR_RANGE_FRAC = 0.5;
/** Scatter threshold: touch velocity above this scatters */
const SCATTER_VELOCITY_THRESHOLD = 8;
/** Scatter force multiplier */
const SCATTER_FORCE = 0.12;
/** Trail history length */
const TRAIL_LEN = 4;
/** Coherence smoothing rate */
const COHERENCE_SMOOTH = 0.02;
/** Step advance thresholds */
const STEP_THRESHOLDS = [0.45, 0.7];

// =====================================================================
// BOID
// =====================================================================

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Trail history */
  trail: { x: number; y: number }[];
  /** Individual brightness */
  brightness: number;
  /** Size */
  size: number;
  /** Bioluminescence phase */
  glowPhase: number;
  glowSpeed: number;
}

function createBoids(w: number, h: number, minDim: number): Boid[] {
  return Array.from({ length: BOID_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = MIN_SPEED + Math.random() * (MAX_SPEED * 0.5);
    return {
      x: w * 0.15 + Math.random() * w * 0.7,
      y: h * 0.15 + Math.random() * h * 0.7,
      vx: Math.cos(angle) * speed * minDim * 0.002,
      vy: Math.sin(angle) * speed * minDim * 0.002,
      trail: [],
      brightness: 0.4 + Math.random() * 0.6,
      size: minDim * (0.003 + Math.random() * 0.004),
      glowPhase: Math.random() * Math.PI * 2,
      glowSpeed: 0.015 + Math.random() * 0.02,
    };
  });
}

// =====================================================================
// VECTOR HELPERS
// =====================================================================

function magnitude(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function limitVec(x: number, y: number, max: number): [number, number] {
  const m = magnitude(x, y);
  if (m > max && m > 0) {
    return [x / m * max, y / m * max];
  }
  return [x, y];
}

// =====================================================================
// COLOR
// =====================================================================

// Bioluminescent swarm palette
const BOID_CORE: RGB = [120, 200, 100];       // Warm bioluminescent green
const BOID_GLOW: RGB = [80, 160, 60];         // Softer green glow
const TRAIL_COLOR: RGB = [60, 120, 50];       // Fading trail
const ATTRACTOR_COLOR: RGB = [140, 210, 120]; // Attractor highlight

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function BoidsFlockingAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; },
    [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    boids: [] as Boid[],
    // Interaction
    isTouching: false,
    touchX: 0,
    touchY: 0,
    touchVx: 0,
    touchVy: 0,
    prevTouchX: 0,
    prevTouchY: 0,
    // Coherence
    coherence: 0,
    smoothCoherence: 0,
    lastStep: -1,
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

  // ── Single effect: native events + rAF loop ─────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    if (!s.initialized) {
      s.boids = createBoids(w, h, minDim);
      s.initialized = true;
    }

    // ── Native pointer handlers ───────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isTouching = true;
      s.touchX = (e.clientX - rect.left) / rect.width * w;
      s.touchY = (e.clientY - rect.top) / rect.height * h;
      s.prevTouchX = s.touchX;
      s.prevTouchY = s.touchY;
      s.touchVx = 0;
      s.touchVy = 0;
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!s.isTouching) return;
      const rect = canvas.getBoundingClientRect();
      s.prevTouchX = s.touchX;
      s.prevTouchY = s.touchY;
      s.touchX = (e.clientX - rect.left) / rect.width * w;
      s.touchY = (e.clientY - rect.top) / rect.height * h;
      s.touchVx = s.touchX - s.prevTouchX;
      s.touchVy = s.touchY - s.prevTouchY;
    };
    const onUp = (e: PointerEvent) => {
      s.isTouching = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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

      // ── Breath modulates perception radius ────────────
      const breathMod = 1 + p.breathAmplitude * 0.4;
      const percRadius = minDim * PERCEPTION_FRAC * breathMod;

      // ── Touch scatter check ───────────────────────────
      const touchSpeed = magnitude(s.touchVx, s.touchVy);
      const isScattering = s.isTouching && touchSpeed > minDim * 0.016;
      const attractorRange = minDim * ATTRACTOR_RANGE_FRAC;

      // ══════════════════════════════════════════════════
      // BOIDS PHYSICS
      // ═════════════════════════════════════════════════

      let totalAlignX = 0;
      let totalAlignY = 0;
      let avgSpeed = 0;

      for (let i = 0; i < s.boids.length; i++) {
        const boid = s.boids[i];

        // Trail history
        if (!p.reducedMotion && s.frameCount % 3 === 0) {
          boid.trail.push({ x: boid.x, y: boid.y });
          if (boid.trail.length > TRAIL_LEN) boid.trail.shift();
        }

        // ── Three Boids forces ──────────────────────────
        let sepX = 0, sepY = 0, sepCount = 0;
        let aliX = 0, aliY = 0, aliCount = 0;
        let cohX = 0, cohY = 0, cohCount = 0;

        for (let j = 0; j < s.boids.length; j++) {
          if (i === j) continue;
          const other = s.boids[j];
          const dx = other.x - boid.x;
          const dy = other.y - boid.y;
          const dist = magnitude(dx, dy);

          // Separation
          if (dist < minDim * SEP_DIST_FRAC && dist > 0) {
            sepX -= dx / dist;
            sepY -= dy / dist;
            sepCount++;
          }

          // Alignment & Cohesion
          if (dist < percRadius) {
            aliX += other.vx;
            aliY += other.vy;
            aliCount++;
            cohX += other.x;
            cohY += other.y;
            cohCount++;
          }
        }

        // Compute steering forces
        let steerX = 0, steerY = 0;

        if (sepCount > 0) {
          const [sx, sy] = limitVec(sepX / sepCount, sepY / sepCount, MAX_FORCE);
          steerX += sx * W_SEP;
          steerY += sy * W_SEP;
        }

        if (aliCount > 0) {
          const desiredVx = aliX / aliCount;
          const desiredVy = aliY / aliCount;
          const [ax, ay] = limitVec(desiredVx - boid.vx, desiredVy - boid.vy, MAX_FORCE);
          steerX += ax * W_ALI;
          steerY += ay * W_ALI;
        }

        if (cohCount > 0) {
          const avgX = cohX / cohCount;
          const avgY = cohY / cohCount;
          const dx = avgX - boid.x;
          const dy = avgY - boid.y;
          const [cx, cy] = limitVec(dx, dy, MAX_FORCE);
          steerX += cx * W_COH;
          steerY += cy * W_COH;
        }

        // ── Attractor / Scatter ─────────────────────────
        if (s.isTouching) {
          const dx = s.touchX - boid.x;
          const dy = s.touchY - boid.y;
          const dist = magnitude(dx, dy);

          if (isScattering) {
            // SCATTER: push away from touch
            if (dist < attractorRange && dist > 0) {
              const force = SCATTER_FORCE * (1 - dist / attractorRange);
              steerX -= (dx / dist) * force;
              steerY -= (dy / dist) * force;
            }
          } else {
            // ATTRACT: gentle pull toward touch
            if (dist < attractorRange && dist > minDim * SEP_DIST_FRAC) {
              const force = ATTRACTOR_FORCE * (1 - dist / attractorRange);
              steerX += (dx / dist) * force;
              steerY += (dy / dist) * force;
            }
          }
        }

        // ── Edge avoidance (soft boundary) ──────────────
        const margin = minDim * 0.07;
        if (boid.x < margin) steerX += (margin - boid.x) * 0.01;
        if (boid.x > w - margin) steerX -= (boid.x - (w - margin)) * 0.01;
        if (boid.y < margin) steerY += (margin - boid.y) * 0.01;
        if (boid.y > h - margin) steerY -= (boid.y - (h - margin)) * 0.01;

        // ── Apply forces ────────────────────────────────
        boid.vx += steerX;
        boid.vy += steerY;

        // Speed limits (viewport-relative)
        const spd = magnitude(boid.vx, boid.vy);
        const maxSpd = (p.reducedMotion ? MAX_SPEED * 0.5 : MAX_SPEED) * minDim * 0.002;
        const minSpd = MIN_SPEED * minDim * 0.002;
        if (spd > maxSpd) {
          boid.vx = (boid.vx / spd) * maxSpd;
          boid.vy = (boid.vy / spd) * maxSpd;
        } else if (spd < minSpd && spd > 0) {
          boid.vx = (boid.vx / spd) * minSpd;
          boid.vy = (boid.vy / spd) * minSpd;
        }

        boid.x += boid.vx;
        boid.y += boid.vy;

        // Wrap edges softly
        const wrapMargin = minDim * 0.02;
        if (boid.x < -wrapMargin) boid.x = w + wrapMargin;
        if (boid.x > w + wrapMargin) boid.x = -wrapMargin;
        if (boid.y < -wrapMargin) boid.y = h + wrapMargin;
        if (boid.y > h + wrapMargin) boid.y = -wrapMargin;

        // Track alignment for coherence
        const normSpd = Math.max(0.001, spd);
        totalAlignX += boid.vx / normSpd;
        totalAlignY += boid.vy / normSpd;
        avgSpeed += spd;
      }

      // ── Coherence metric ──────────────────────────────
      const avgAlignX = totalAlignX / BOID_COUNT;
      const avgAlignY = totalAlignY / BOID_COUNT;
      s.coherence = magnitude(avgAlignX, avgAlignY); // 0–1 (1 = perfect alignment)
      s.smoothCoherence += (s.coherence - s.smoothCoherence) * COHERENCE_SMOOTH;

      // Step advance
      for (let si = 0; si < STEP_THRESHOLDS.length; si++) {
        if (s.smoothCoherence >= STEP_THRESHOLDS[si] && si > s.lastStep) {
          s.lastStep = si;
          cb.onHaptic('step_advance');
        }
      }
      if (s.smoothCoherence < 0.3 && s.lastStep >= 0) {
        s.lastStep = -1;
      }

      cb.onStateChange?.(s.smoothCoherence);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background (radial, glass-floating) ───────────
      const bgBase = lerpColor([4, 6, 4], s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric gradient
      const atmGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.4);
      atmGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [10, 15, 10], 0.8), 0.04 * entrance));
      atmGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = atmGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Attractor zone ────────────────────────────────
      if (s.isTouching) {
        const attrColor = lerpColor(ATTRACTOR_COLOR, s.accentRgb, 0.2);
        const attrGrad = ctx.createRadialGradient(
          s.touchX, s.touchY, 0,
          s.touchX, s.touchY, attractorRange * 0.5,
        );
        const attrAlpha = isScattering ? 0.015 : 0.025;
        attrGrad.addColorStop(0, rgba(attrColor, attrAlpha * entrance));
        attrGrad.addColorStop(0.4, rgba(attrColor, attrAlpha * 0.3 * entrance));
        attrGrad.addColorStop(1, rgba(attrColor, 0));
        ctx.fillStyle = attrGrad;
        const r = attractorRange * 0.5;
        ctx.fillRect(s.touchX - r, s.touchY - r, r * 2, r * 2);
      }

      // ── Boid trails ───────────────────────────────────
      if (!p.reducedMotion) {
        const trailBase = lerpColor(TRAIL_COLOR, s.primaryRgb, 0.12);
        for (const boid of s.boids) {
          if (boid.trail.length < 2) continue;
          const trailAlpha = boid.brightness * 0.04 * entrance;
          for (let t = 1; t < boid.trail.length; t++) {
            const prev = boid.trail[t - 1];
            const curr = boid.trail[t];
            const tFrac = t / boid.trail.length;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.strokeStyle = rgba(trailBase, trailAlpha * tFrac);
            ctx.lineWidth = boid.size * 0.3 * tFrac;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
          // Trail to current position
          const last = boid.trail[boid.trail.length - 1];
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(boid.x, boid.y);
          ctx.strokeStyle = rgba(trailBase, trailAlpha);
          ctx.lineWidth = boid.size * 0.3;
          ctx.stroke();
        }
      }

      // ── Boid bodies ───────────────────────────────────
      for (const boid of s.boids) {
        const glow = p.reducedMotion ? 0.7 :
          0.5 + 0.5 * Math.sin(s.frameCount * boid.glowSpeed + boid.glowPhase);

        // Coherence affects how "alive" each boid looks
        const aliveness = 0.5 + s.smoothCoherence * 0.5;

        const boidColor = lerpColor(
          lerpColor(BOID_GLOW, s.primaryRgb, 0.1),
          lerpColor(BOID_CORE, s.accentRgb, 0.15),
          aliveness,
        );

        const alpha = boid.brightness * glow * aliveness * 0.45 * entrance;

        // Glow
        if (alpha > 0.05) {
          const glowR = boid.size * 3;
          const glowGrad = ctx.createRadialGradient(boid.x, boid.y, 0, boid.x, boid.y, glowR);
          glowGrad.addColorStop(0, rgba(boidColor, alpha * 0.2));
          glowGrad.addColorStop(0.5, rgba(boidColor, alpha * 0.04));
          glowGrad.addColorStop(1, rgba(boidColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(boid.x - glowR, boid.y - glowR, glowR * 2, glowR * 2);
        }

        // Body (oriented triangle pointing in velocity direction)
        const angle = Math.atan2(boid.vy, boid.vx);
        const sz = boid.size * (0.7 + aliveness * 0.3);

        ctx.save();
        ctx.translate(boid.x, boid.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(sz * 1.5, 0);               // Nose
        ctx.lineTo(-sz * 0.8, -sz * 0.6);      // Left wing
        ctx.lineTo(-sz * 0.3, 0);               // Body indent
        ctx.lineTo(-sz * 0.8, sz * 0.6);       // Right wing
        ctx.closePath();
        ctx.fillStyle = rgba(boidColor, alpha);
        ctx.fill();

        ctx.restore();
      }

      // ── Coherence field (visible when flock is aligned) ─
      if (s.smoothCoherence > 0.4) {
        const fieldAlpha = (s.smoothCoherence - 0.4) * 0.03 * entrance;
        const fieldColor = lerpColor(BOID_GLOW, s.accentRgb, 0.15);

        // Find flock center
        let flockCx = 0, flockCy = 0;
        for (const boid of s.boids) { flockCx += boid.x; flockCy += boid.y; }
        flockCx /= BOID_COUNT;
        flockCy /= BOID_COUNT;

        const fieldR = minDim * 0.2 * s.smoothCoherence;
        const fieldGrad = ctx.createRadialGradient(flockCx, flockCy, 0, flockCx, flockCy, fieldR);
        fieldGrad.addColorStop(0, rgba(fieldColor, fieldAlpha));
        fieldGrad.addColorStop(0.5, rgba(fieldColor, fieldAlpha * 0.3));
        fieldGrad.addColorStop(1, rgba(fieldColor, 0));
        ctx.fillStyle = fieldGrad;
        ctx.fillRect(flockCx - fieldR, flockCy - fieldR, fieldR * 2, fieldR * 2);
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
          cursor: 'default',
        }}
      />
    </div>
  );
}