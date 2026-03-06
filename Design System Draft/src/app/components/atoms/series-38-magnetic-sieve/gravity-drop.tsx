/**
 * ATOM 371: THE GRAVITY DROP ENGINE
 * ====================================
 * Series 38 — Magnetic Sieve · Position 1
 *
 * Cure information gluttony. Turn on gravity — the lightweight
 * distractions crash out, the dense essentials remain suspended.
 *
 * PHYSICS:
 *   - 30 nodes floating in zero-gravity field, drifting lazily
 *   - User swipes down to engage gravity
 *   - 27 lightweight nodes accelerate downward with trailing streaks
 *   - 3 dense essential nodes resist gravity, float to center triangle
 *   - Essentials connected by luminous geometry after separation
 *   - Breath amplitude modulates essential node glow radius
 *
 * INTERACTION:
 *   Swipe down → engages gravity field
 *   Observable  → essentials drift to center naturally
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static scene showing 3 essentials in triangle, others dimmed below
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total number of floating nodes */
const NODE_COUNT = 30;
/** Number of dense essential nodes that survive gravity */
const ESSENTIAL_COUNT = 3;
/** Gravity acceleration per frame (fraction of h) */
const GRAVITY_ACCEL = 0.0006;
/** Zero-G drift speed — lazy floating before gravity engages */
const DRIFT_SPEED = 0.0004;
/** How fast essential nodes seek their triangle position */
const SEEK_STRENGTH = 0.015;
/** Velocity damping for essential node seeking */
const SEEK_DAMPING = 0.92;
/** Swipe distance in px to trigger gravity */
const SWIPE_THRESHOLD = 35;
/** Essential node radius as fraction of minDim */
const ESSENTIAL_R_FRAC = 0.028;
/** Non-essential node radius range */
const NODE_R_MIN = 0.008;
const NODE_R_MAX = 0.016;
/** Triangle radius — how far essentials sit from center */
const TRIANGLE_R_FRAC = 0.18;
/** Glow halo multiplier for essentials */
const ESSENTIAL_GLOW_MULT = 5;
/** Connection line glow width */
const CONNECTION_GLOW_FRAC = 0.002;
/** Trail length (number of positions stored) */
const TRAIL_LENGTH = 12;
/** How much breath modulates essential glow */
const BREATH_GLOW_FACTOR = 0.15;

// =====================================================================
// STATE TYPES
// =====================================================================

interface NodeState {
  x: number;          // fraction of viewport width
  y: number;          // fraction of viewport height
  vx: number;         // velocity x
  vy: number;         // velocity y
  radius: number;     // fraction of minDim
  essential: boolean;
  fallen: boolean;    // dropped off screen
  driftAngle: number; // unique drift direction
  driftSpeed: number; // unique drift magnitude
  trail: { x: number; y: number }[];
  opacity: number;    // current visual opacity factor
}

// =====================================================================
// HELPERS
// =====================================================================

function createNodes(): NodeState[] {
  const nodes: NodeState[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const isEssential = i < ESSENTIAL_COUNT;
    nodes.push({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      vx: 0,
      vy: 0,
      radius: isEssential
        ? ESSENTIAL_R_FRAC
        : NODE_R_MIN + Math.random() * (NODE_R_MAX - NODE_R_MIN),
      essential: isEssential,
      fallen: false,
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: DRIFT_SPEED * (0.5 + Math.random()),
      trail: [],
      opacity: 1,
    });
  }
  return nodes;
}

/** Target triangle positions for 3 essentials around center */
function essentialTargets(cx: number, cy: number, r: number): { x: number; y: number }[] {
  return [0, 1, 2].map(i => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 3;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  });
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function GravityDropAtom({
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
    nodes: createNodes(),
    gravityOn: false,
    gravityAnim: 0,        // 0→1 progress of gravity engagement
    separationComplete: false,
    completionReported: false,
    triangleReveal: 0,     // 0→1 reveal of connection geometry
    // Swipe detection
    pointerDown: false,
    pointerStartY: 0,
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

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase auto-trigger ──────────────────
      if (p.phase === 'resolve' && !s.gravityOn) {
        s.gravityOn = true;
      }

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const triR = px(TRIANGLE_R_FRAC, minDim);
        const targets = essentialTargets(cx, cy, triR);
        const eR = px(ESSENTIAL_R_FRAC, minDim);

        // Draw dimmed fallen nodes at bottom
        for (let i = ESSENTIAL_COUNT; i < NODE_COUNT; i++) {
          const nx = (0.1 + ((i - ESSENTIAL_COUNT) / (NODE_COUNT - ESSENTIAL_COUNT)) * 0.8) * w;
          const ny = h * 0.88;
          const nR = px(NODE_R_MIN + (i % 5) * 0.002, minDim);
          ctx.beginPath();
          ctx.arc(nx, ny, nR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.5 * entrance);
          ctx.fill();
        }

        // Draw connection triangle
        ctx.beginPath();
        ctx.moveTo(targets[0].x, targets[0].y);
        ctx.lineTo(targets[1].x, targets[1].y);
        ctx.lineTo(targets[2].x, targets[2].y);
        ctx.closePath();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(CONNECTION_GLOW_FRAC, minDim);
        ctx.stroke();

        // Draw essential nodes with glow
        for (const t of targets) {
          const glowR = eR * ESSENTIAL_GLOW_MULT;
          const glow = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, glowR);
          glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * entrance));
          glow.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
          glow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = glow;
          ctx.fillRect(t.x - glowR, t.y - glowR, glowR * 2, glowR * 2);

          ctx.beginPath();
          ctx.arc(t.x, t.y, eR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance);
          ctx.fill();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Gravity animation progress ──────────────────
      if (s.gravityOn) {
        s.gravityAnim = Math.min(1, s.gravityAnim + 0.008 * ms);
      }

      // ── Node physics ────────────────────────────────
      const triR = px(TRIANGLE_R_FRAC, minDim);
      const targets = essentialTargets(cx, cy, triR);
      let fallenCount = 0;

      for (let i = 0; i < s.nodes.length; i++) {
        const n = s.nodes[i];
        if (n.fallen) { fallenCount++; continue; }

        if (s.gravityOn) {
          if (n.essential) {
            // Seek toward triangle target
            const target = targets[i];
            const tx = target.x / w;
            const ty = target.y / h;
            const dx = tx - n.x;
            const dy = ty - n.y;
            n.vx += dx * SEEK_STRENGTH * ms;
            n.vy += dy * SEEK_STRENGTH * ms;
            n.vx *= SEEK_DAMPING;
            n.vy *= SEEK_DAMPING;
            n.x += n.vx * ms;
            n.y += n.vy * ms;
          } else {
            // Gravity pulls down with acceleration
            n.vy += GRAVITY_ACCEL * ms;
            n.x += n.vx * ms;
            n.y += n.vy * ms;

            // Store trail position
            n.trail.push({ x: n.x, y: n.y });
            if (n.trail.length > TRAIL_LENGTH) n.trail.shift();

            // Fade out as approaching bottom
            if (n.y > 0.85) {
              n.opacity = Math.max(0, 1 - (n.y - 0.85) / 0.25);
            }

            // Mark as fallen when off screen
            if (n.y > 1.15) {
              n.fallen = true;
              fallenCount++;
            }
          }
        } else {
          // Zero-G lazy drift
          n.x += Math.cos(n.driftAngle) * n.driftSpeed * ms;
          n.y += Math.sin(n.driftAngle) * n.driftSpeed * ms;

          // Soft bounce off edges
          if (n.x < 0.05 || n.x > 0.95) n.driftAngle = Math.PI - n.driftAngle;
          if (n.y < 0.05 || n.y > 0.95) n.driftAngle = -n.driftAngle;

          // Subtle oscillation
          n.driftAngle += (Math.random() - 0.5) * 0.02;
        }
      }

      // ── Separation complete detection ───────────────
      const allNonEssentialFallen = s.nodes
        .filter(n => !n.essential)
        .every(n => n.fallen);

      if (allNonEssentialFallen && s.gravityOn && !s.separationComplete) {
        s.separationComplete = true;
      }

      if (s.separationComplete) {
        s.triangleReveal = Math.min(1, s.triangleReveal + 0.012 * ms);
      }

      if (s.separationComplete && s.triangleReveal > 0.9 && !s.completionReported) {
        s.completionReported = true;
        cb.onHaptic('completion');
      }

      // ── State reporting ─────────────────────────────
      cb.onStateChange?.(s.separationComplete
        ? 0.5 + s.triangleReveal * 0.5
        : s.gravityAnim * 0.5);

      // ── Draw non-essential nodes (with trails) ──────
      for (const n of s.nodes) {
        if (n.essential || n.fallen) continue;

        const nR = px(n.radius, minDim);
        const npx = n.x * w;
        const npy = n.y * h;
        const baseAlpha = ALPHA.content.max * 0.2 * n.opacity * entrance;

        // Trail streaks
        if (s.gravityOn && n.trail.length > 1) {
          for (let t = 0; t < n.trail.length - 1; t++) {
            const trailAlpha = (t / n.trail.length) * ALPHA.atmosphere.max * 0.4 * n.opacity * entrance;
            ctx.beginPath();
            ctx.moveTo(n.trail[t].x * w, n.trail[t].y * h);
            ctx.lineTo(n.trail[t + 1].x * w, n.trail[t + 1].y * h);
            ctx.strokeStyle = rgba(s.accentRgb, trailAlpha);
            ctx.lineWidth = px(n.radius * 0.5, minDim);
            ctx.stroke();
          }
        }

        // Node body
        ctx.beginPath();
        ctx.arc(npx, npy, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, baseAlpha);
        ctx.fill();
      }

      // ── Draw connection triangle ────────────────────
      if (s.triangleReveal > 0.05) {
        const tAlpha = ALPHA.content.max * 0.12 * easeOutCubic(s.triangleReveal) * entrance;

        // Triangle fill (very subtle)
        ctx.beginPath();
        ctx.moveTo(targets[0].x, targets[0].y);
        ctx.lineTo(targets[1].x, targets[1].y);
        ctx.lineTo(targets[2].x, targets[2].y);
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * s.triangleReveal * entrance);
        ctx.fill();

        // Triangle stroke
        ctx.strokeStyle = rgba(s.primaryRgb, tAlpha);
        ctx.lineWidth = px(CONNECTION_GLOW_FRAC, minDim);
        ctx.stroke();

        // Glow along each edge
        for (let i = 0; i < 3; i++) {
          const a = targets[i];
          const b = targets[(i + 1) % 3];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const glowR = px(0.06, minDim);
          const edgeGlow = ctx.createRadialGradient(mx, my, 0, mx, my, glowR);
          edgeGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.triangleReveal * entrance));
          edgeGlow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = edgeGlow;
          ctx.fillRect(mx - glowR, my - glowR, glowR * 2, glowR * 2);
        }
      }

      // ── Draw essential nodes ────────────────────────
      for (let i = 0; i < ESSENTIAL_COUNT; i++) {
        const n = s.nodes[i];
        const npx = n.x * w;
        const npy = n.y * h;
        const eR = px(ESSENTIAL_R_FRAC, minDim);
        const breathMod = 1 + breath * BREATH_GLOW_FACTOR;

        // Outer glow halo (breath-responsive)
        const glowR = eR * ESSENTIAL_GLOW_MULT * breathMod;
        const glow = ctx.createRadialGradient(npx, npy, 0, npx, npy, glowR);
        const glowIntensity = s.gravityOn
          ? 0.3 + s.gravityAnim * 0.3
          : 0.1;
        glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowIntensity * entrance));
        glow.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * glowIntensity * entrance));
        glow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(npx - glowR, npy - glowR, glowR * 2, glowR * 2);

        // Inner warm halo
        const innerR = eR * 2.5;
        const inner = ctx.createRadialGradient(npx, npy, 0, npx, npy, innerR);
        inner.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance));
        inner.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance));
        inner.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = inner;
        ctx.fillRect(npx - innerR, npy - innerR, innerR * 2, innerR * 2);

        // Node body
        const bodyR = eR * (1 + breath * 0.05);
        ctx.beginPath();
        ctx.arc(npx, npy, bodyR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.55 * entrance);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(npx, npy, bodyR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
          ALPHA.content.max * 0.35 * entrance,
        );
        ctx.fill();
      }

      // ── Gravity field indicator ─────────────────────
      if (s.gravityOn && s.gravityAnim < 0.5) {
        // Downward sweep lines showing gravity engaging
        const sweepAlpha = (1 - s.gravityAnim * 2) * ALPHA.atmosphere.max * entrance;
        for (let i = 0; i < 5; i++) {
          const sx = cx + (i - 2) * minDim * 0.12;
          const sy1 = h * 0.1 + s.gravityAnim * h * 0.4;
          const sy2 = sy1 + h * 0.15;
          ctx.beginPath();
          ctx.moveTo(sx, sy1);
          ctx.lineTo(sx, sy2);
          ctx.strokeStyle = rgba(s.accentRgb, sweepAlpha);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointerDown = true;
      s.pointerStartY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerDown || s.gravityOn) return;

      const dy = e.clientY - s.pointerStartY;
      if (dy > SWIPE_THRESHOLD) {
        s.gravityOn = true;
        callbacksRef.current.onHaptic('swipe_commit');
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.pointerDown = false;
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
          cursor: 's-resize',
        }}
      />
    </div>
  );
}
