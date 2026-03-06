/**
 * ATOM 236: THE MURMURATION ENGINE
 * ===================================
 * Series 24 — Net of Indra · Position 6
 *
 * Do not herd the flock. Move one particle with grace — the Boids
 * algorithm aligns the rest into a breathtaking murmuration.
 * Emergent harmony from simple local rules.
 *
 * PHYSICS:
 *   - 200 boid particles with cohesion, separation, alignment rules
 *   - Boids start scattered randomly across viewport
 *   - User drags one "leader" boid — others follow via Boids algorithm
 *   - Cohesion: steer toward average position of nearby boids
 *   - Separation: steer away from very close boids
 *   - Alignment: match velocity of nearby boids
 *   - As flock coheres: trailing ribbons emerge between aligned boids
 *   - Full murmuration → sweeping synchronized glow wave
 *   - Breath modulates boid perception radius (calmer = wider awareness)
 *
 * INTERACTION:
 *   Drag → moves leader boid, flock follows
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static cohered flock pattern with glow
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

/** Total boid count */
const BOID_COUNT = 200;
/** Boid visual size */
const BOID_SIZE = 0.003;
/** Leader boid size (larger) */
const LEADER_SIZE = 0.006;
/** Perception radius for boid rules */
const PERCEPTION_R = 0.12;
/** Separation distance */
const SEPARATION_DIST = 0.02;
/** Cohesion strength */
const COHESION_FORCE = 0.0003;
/** Separation strength */
const SEPARATION_FORCE = 0.001;
/** Alignment strength */
const ALIGNMENT_FORCE = 0.0005;
/** Leader attraction strength */
const LEADER_ATTRACT = 0.0002;
/** Maximum boid speed */
const MAX_SPEED = 0.004;
/** Breath perception radius multiplier */
const BREATH_PERCEPTION = 0.3;
/** Coherence threshold for completion (0-1) */
const COHERENCE_THRESHOLD = 0.7;
/** Coherence frames needed */
const COHERENCE_FRAMES = 120;
/** Trail ribbon max length */
const TRAIL_LENGTH = 6;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Boid {
  x: number; y: number;
  vx: number; vy: number;
  /** Recent positions for trail */
  trail: Array<{ x: number; y: number }>;
  /** Individual brightness */
  brightness: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function createBoids(): Boid[] {
  return Array.from({ length: BOID_COUNT }, () => ({
    x: 0.1 + Math.random() * 0.8,
    y: 0.1 + Math.random() * 0.8,
    vx: (Math.random() - 0.5) * 0.002,
    vy: (Math.random() - 0.5) * 0.002,
    trail: [],
    brightness: 0.3 + Math.random() * 0.7,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MurmurationAtom({
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
    boids: createBoids(),
    leaderIdx: 0,
    dragging: false,
    dragX: 0.5,
    dragY: 0.5,
    coherence: 0,
    coherenceFrames: 0,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        // Static cohered flock as arc pattern
        for (let i = 0; i < BOID_COUNT; i++) {
          const angle = (i / BOID_COUNT) * Math.PI * 1.5 - Math.PI * 0.25;
          const dist = 0.15 + (i % 5) * 0.03;
          const bx = (0.5 + Math.cos(angle) * dist) * w;
          const by = (0.5 + Math.sin(angle) * dist) * h;
          const bR = px(BOID_SIZE, minDim);
          ctx.beginPath();
          ctx.arc(bx, by, bR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
          ctx.fill();
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (p.phase === 'resolve') {
        s.coherenceFrames = COHERENCE_FRAMES;
        s.completed = true;
      }

      // ════════════════════════════════════════════════════
      // BOIDS PHYSICS
      // ════════════════════════════════════════════════════
      const percR = PERCEPTION_R * (1 + breath * BREATH_PERCEPTION);
      const leader = s.boids[s.leaderIdx];

      // Move leader toward drag point
      if (s.dragging) {
        leader.vx += (s.dragX - leader.x) * 0.008 * ms;
        leader.vy += (s.dragY - leader.y) * 0.008 * ms;
      }

      let totalAlignment = 0;

      for (let i = 0; i < BOID_COUNT; i++) {
        const b = s.boids[i];
        if (i === s.leaderIdx && s.dragging) {
          // Leader handled above
        } else {
          let cohX = 0, cohY = 0, cohCount = 0;
          let sepX = 0, sepY = 0;
          let aliVx = 0, aliVy = 0, aliCount = 0;

          for (let j = 0; j < BOID_COUNT; j++) {
            if (i === j) continue;
            const other = s.boids[j];
            const dx = other.x - b.x;
            const dy = other.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < percR) {
              // Cohesion
              cohX += other.x;
              cohY += other.y;
              cohCount++;

              // Alignment
              aliVx += other.vx;
              aliVy += other.vy;
              aliCount++;

              // Separation
              if (dist < SEPARATION_DIST && dist > 0.001) {
                sepX -= dx / dist * (SEPARATION_DIST - dist);
                sepY -= dy / dist * (SEPARATION_DIST - dist);
              }
            }
          }

          if (cohCount > 0) {
            b.vx += ((cohX / cohCount - b.x) * COHESION_FORCE) * ms;
            b.vy += ((cohY / cohCount - b.y) * COHESION_FORCE) * ms;
          }
          b.vx += sepX * SEPARATION_FORCE * ms;
          b.vy += sepY * SEPARATION_FORCE * ms;
          if (aliCount > 0) {
            b.vx += ((aliVx / aliCount - b.vx) * ALIGNMENT_FORCE) * ms;
            b.vy += ((aliVy / aliCount - b.vy) * ALIGNMENT_FORCE) * ms;
          }

          // Leader attraction
          const ldx = leader.x - b.x;
          const ldy = leader.y - b.y;
          b.vx += ldx * LEADER_ATTRACT * ms;
          b.vy += ldy * LEADER_ATTRACT * ms;
        }

        // Speed limit
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > MAX_SPEED) {
          b.vx = (b.vx / speed) * MAX_SPEED;
          b.vy = (b.vy / speed) * MAX_SPEED;
        }
        totalAlignment += speed > 0.0005 ? 1 : 0;

        // Integrate
        b.x += b.vx * ms;
        b.y += b.vy * ms;

        // Boundary wrapping
        if (b.x < 0.02) b.x = 0.98;
        if (b.x > 0.98) b.x = 0.02;
        if (b.y < 0.02) b.y = 0.98;
        if (b.y > 0.98) b.y = 0.02;

        // Trail
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > TRAIL_LENGTH) b.trail.shift();
      }

      // ── Coherence measurement ──────────────────────────
      // Measure average distance to center of mass
      let avgX = 0, avgY = 0;
      for (const b of s.boids) { avgX += b.x; avgY += b.y; }
      avgX /= BOID_COUNT;
      avgY /= BOID_COUNT;

      let totalDist = 0;
      for (const b of s.boids) {
        totalDist += Math.sqrt(Math.pow(b.x - avgX, 2) + Math.pow(b.y - avgY, 2));
      }
      const avgDist = totalDist / BOID_COUNT;
      s.coherence = Math.max(0, Math.min(1, 1 - avgDist / 0.3));

      if (s.coherence > COHERENCE_THRESHOLD) {
        s.coherenceFrames = Math.min(COHERENCE_FRAMES, s.coherenceFrames + ms);
      } else {
        s.coherenceFrames = Math.max(0, s.coherenceFrames - ms * 0.5);
      }

      if (s.coherenceFrames >= COHERENCE_FRAMES * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.coherenceFrames >= COHERENCE_FRAMES && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      }

      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : s.coherence * 0.5);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Flock center glow
      // ════════════════════════════════════════════════════
      if (s.coherence > 0.2) {
        const glowR = px(0.15 + s.coherence * 0.15, minDim);
        const fg = ctx.createRadialGradient(avgX * w, avgY * h, 0, avgX * w, avgY * h, glowR);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * s.coherence * entrance));
        fg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * s.coherence * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(avgX * w - glowR, avgY * h - glowR, glowR * 2, glowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Trail ribbons (between aligned boids)
      // ════════════════════════════════════════════════════
      if (s.coherence > 0.3) {
        const trailAlpha = ALPHA.content.max * 0.03 * (s.coherence - 0.3) / 0.7 * entrance;
        for (const b of s.boids) {
          if (b.trail.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(b.trail[0].x * w, b.trail[0].y * h);
          for (let ti = 1; ti < b.trail.length; ti++) {
            ctx.lineTo(b.trail[ti].x * w, b.trail[ti].y * h);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, trailAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Boid particles
      // ════════════════════════════════════════════════════
      for (let i = 0; i < BOID_COUNT; i++) {
        const b = s.boids[i];
        const bx = b.x * w;
        const by = b.y * h;
        const isLeader = i === s.leaderIdx;
        const bR = px(isLeader ? LEADER_SIZE : BOID_SIZE, minDim);
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const speedAlpha = 0.15 + Math.min(0.3, speed * 80);

        // Boid glow (leaders and bright boids)
        if (isLeader || b.brightness > 0.7) {
          const bgR = bR * (isLeader ? 4 : 2.5);
          const bg = ctx.createRadialGradient(bx, by, 0, bx, by, bgR);
          bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (isLeader ? 0.1 : 0.05) * entrance));
          bg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = bg;
          ctx.fillRect(bx - bgR, by - bgR, bgR * 2, bgR * 2);
        }

        // Boid body — oriented triangle for direction
        const angle = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(bR * 1.5, 0);
        ctx.lineTo(-bR * 0.8, -bR * 0.7);
        ctx.lineTo(-bR * 0.8, bR * 0.7);
        ctx.closePath();
        ctx.fillStyle = rgba(
          isLeader ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3) : s.primaryRgb,
          ALPHA.content.max * speedAlpha * b.brightness * entrance,
        );
        ctx.fill();

        ctx.restore();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Completion murmuration wave
      // ════════════════════════════════════════════════════
      if (s.completionGlow > 0) {
        for (let i = 0; i < 3; i++) {
          const wavePhase = (s.frameCount * 0.008 + i * 0.33) % 1;
          const waveR = px(0.05 + wavePhase * 0.3, minDim);
          ctx.beginPath();
          ctx.arc(avgX * w, avgY * h, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * (1 - wavePhase) * s.completionGlow * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Progress ───────────────────────────────────────
      if (!s.completed && s.coherence > 0.1) {
        const progR = px(SIZE.xs, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.42, minDim), progR, -Math.PI / 2, -Math.PI / 2 + s.coherence * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Drag leader boid ────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      s.dragging = true;
      s.dragX = (e.clientX - rect.left) / rect.width;
      s.dragY = (e.clientY - rect.top) / rect.height;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.dragX = (e.clientX - rect.left) / rect.width;
      s.dragY = (e.clientY - rect.top) / rect.height;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
