/**
 * ATOM 263: THE TOY BOX ENGINE
 * ===============================
 * Series 27 — Cosmic Play · Position 3
 *
 * The sharp aggressive threat drops — and bounces like a rubber ball.
 * The monster is just a toy. Deflate the threat through absurdity.
 *
 * PHYSICS:
 *   - 8 "threat" shapes drop from top with menacing appearance
 *   - Each starts as angular, dark, sharp-edged polygon
 *   - Tap a threat → it transforms into a bouncy soft circle
 *   - Transformed threats bounce with high restitution (0.85)
 *   - Gravity pulls all objects down; floor bounces them back
 *   - Each bounce slightly deforms the shape (squash & stretch)
 *   - Transform all threats → toy box complete
 *   - Breath modulates gravity strength (calmer = lighter)
 *
 * INTERACTION:
 *   Tap threat → transforms to toy (tap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static transformed toys at rest
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

/** Number of threat objects */
const THREAT_COUNT = 8;
/** Object size range */
const OBJ_R_MIN = 0.018;
const OBJ_R_MAX = 0.028;
/** Gravity acceleration */
const GRAVITY = 0.00015;
/** Bounce restitution (elasticity) */
const RESTITUTION = 0.82;
/** Floor Y position (fraction) */
const FLOOR_Y = 0.85;
/** Squash/stretch max */
const SQUASH_MAX = 0.3;
/** Squash recovery speed */
const SQUASH_RECOVERY = 0.06;
/** Transform animation speed */
const TRANSFORM_SPEED = 0.03;
/** Breath gravity modulation */
const BREATH_GRAVITY = 0.3;
/** Glow layers for transformed toys */
const GLOW_LAYERS = 3;
/** Horizontal spread */
const H_SPREAD = 0.7;
/** Drop stagger frames */
const DROP_STAGGER = 30;

// =====================================================================
// STATE TYPES
// =====================================================================

interface ThreatObj {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  /** 0 = threat, 1 = toy */
  toyness: number;
  /** Vertical squash factor (-1 to 1) */
  squash: number;
  /** Has been tapped */
  tapped: boolean;
  /** Drop delay (frames) */
  dropDelay: number;
  /** Polygon points (for threat shape) */
  points: number;
  /** Rotation */
  angle: number;
  rotSpeed: number;
  /** Individual phase */
  phase: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function createThreats(): ThreatObj[] {
  return Array.from({ length: THREAT_COUNT }, (_, i) => ({
    x: 0.15 + (i / (THREAT_COUNT - 1)) * H_SPREAD,
    y: -0.1 - Math.random() * 0.15,
    vx: (Math.random() - 0.5) * 0.001,
    vy: 0,
    size: OBJ_R_MIN + Math.random() * (OBJ_R_MAX - OBJ_R_MIN),
    toyness: 0,
    squash: 0,
    tapped: false,
    dropDelay: i * DROP_STAGGER,
    points: 3 + Math.floor(Math.random() * 3), // 3-5 sided polygon
    angle: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    phase: Math.random() * Math.PI * 2,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ToyBoxAtom({
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
    threats: createThreats(),
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

      if (p.phase === 'resolve') {
        s.threats.forEach(t => { t.tapped = true; t.toyness = 1; t.y = FLOOR_Y - t.size; });
        s.completed = true;
      }

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        for (const t of s.threats) {
          const tx = t.x * w;
          const ty = (FLOOR_Y - t.size) * h;
          const tR = px(t.size, minDim);
          ctx.beginPath();
          ctx.arc(tx, ty, tR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
          ctx.fill();
        }
        // Floor
        ctx.beginPath();
        ctx.moveTo(0, FLOOR_Y * h);
        ctx.lineTo(w, FLOOR_Y * h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // PHYSICS
      // ════════════════════════════════════════════════════
      const grav = GRAVITY * (1 - breath * BREATH_GRAVITY * 0.5);
      let toyCount = 0;

      for (const t of s.threats) {
        if (s.frameCount < t.dropDelay) continue;

        // Gravity
        t.vy += grav * ms;
        t.x += t.vx * ms;
        t.y += t.vy * ms;
        t.angle += t.rotSpeed * ms;

        // Transform animation
        if (t.tapped) {
          t.toyness = Math.min(1, t.toyness + TRANSFORM_SPEED * ms);
          t.rotSpeed *= 0.97; // slow rotation for toys
          toyCount++;
        }

        // Floor bounce
        if (t.y + t.size > FLOOR_Y) {
          t.y = FLOOR_Y - t.size;
          t.vy = -Math.abs(t.vy) * RESTITUTION;
          t.squash = -SQUASH_MAX;

          // Slight horizontal scatter on bounce
          t.vx += (Math.random() - 0.5) * 0.0005;
        }

        // Wall bounce
        if (t.x < t.size) { t.x = t.size; t.vx = Math.abs(t.vx) * 0.5; }
        if (t.x > 1 - t.size) { t.x = 1 - t.size; t.vx = -Math.abs(t.vx) * 0.5; }

        // Squash recovery
        t.squash += (0 - t.squash) * SQUASH_RECOVERY * ms;

        // Damping
        t.vx *= 0.999;
      }

      // ── Completion ──────────────────────────────────────
      if (toyCount >= THREAT_COUNT * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (toyCount >= THREAT_COUNT && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      }
      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : (toyCount / THREAT_COUNT) * 0.5);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Floor
      // ════════════════════════════════════════════════════
      const floorPxY = FLOOR_Y * h;
      ctx.beginPath();
      ctx.moveTo(0, floorPxY);
      ctx.lineTo(w, floorPxY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // Floor glow
      const floorGlowH = px(0.02, minDim);
      const fg = ctx.createLinearGradient(0, floorPxY, 0, floorPxY + floorGlowH);
      fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * entrance));
      fg.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = fg;
      ctx.fillRect(0, floorPxY, w, floorGlowH);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Objects
      // ════════════════════════════════════════════════════
      for (const t of s.threats) {
        if (s.frameCount < t.dropDelay) continue;

        const tx = t.x * w;
        const ty = t.y * h;
        const baseR = px(t.size, minDim);
        const squashX = 1 + t.squash * 0.5;
        const squashY = 1 - t.squash * 0.5;

        // Object color: threat=accent, toy=primary
        const objColor = lerpColor(s.accentRgb, s.primaryRgb, t.toyness);

        // Shadow
        const shadowY = floorPxY;
        const shadowR = baseR * (0.6 + t.toyness * 0.4);
        const shadowDist = Math.max(0, (FLOOR_Y - t.y - t.size) * 3);
        const shadowAlpha = 0.04 * Math.max(0, 1 - shadowDist) * entrance;
        if (shadowAlpha > 0.001) {
          ctx.beginPath();
          ctx.ellipse(tx, shadowY, shadowR, shadowR * 0.2, 0, 0, Math.PI * 2);
          ctx.fillStyle = rgba([0, 0, 0] as RGB, shadowAlpha);
          ctx.fill();
        }

        // Glow (for toys)
        if (t.toyness > 0.3) {
          for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
            const gR = baseR * (2 + gi * 1.5) * t.toyness;
            const gA = ALPHA.glow.max * 0.06 * t.toyness * entrance / (gi + 1);
            const gg = ctx.createRadialGradient(tx, ty, 0, tx, ty, gR);
            gg.addColorStop(0, rgba(s.primaryRgb, gA));
            gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
            gg.addColorStop(1, rgba(s.primaryRgb, 0));
            ctx.fillStyle = gg;
            ctx.fillRect(tx - gR, ty - gR, gR * 2, gR * 2);
          }
        }

        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(t.angle * (1 - t.toyness)); // toys don't rotate
        ctx.scale(squashX, squashY);

        if (t.toyness < 0.5) {
          // ── Threat shape: angular polygon ──────────────
          const points = t.points;
          ctx.beginPath();
          for (let i = 0; i <= points; i++) {
            const pa = (i / points) * Math.PI * 2 - Math.PI / 2;
            const pr = baseR * (0.8 + 0.2 * Math.cos(pa * 2));
            const ppx = Math.cos(pa) * pr;
            const ppy = Math.sin(pa) * pr;
            if (i === 0) ctx.moveTo(ppx, ppy);
            else ctx.lineTo(ppx, ppy);
          }
          ctx.closePath();
          ctx.fillStyle = rgba(objColor, ALPHA.content.max * (0.15 + (1 - t.toyness) * 0.15) * entrance);
          ctx.fill();
          ctx.strokeStyle = rgba(objColor, ALPHA.content.max * 0.08 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }

        if (t.toyness > 0) {
          // ── Toy shape: soft circle with gradient ───────
          const toyAlpha = t.toyness;
          const bodyGrad = ctx.createRadialGradient(
            -baseR * 0.15, -baseR * 0.15, baseR * 0.1,
            0, 0, baseR,
          );
          bodyGrad.addColorStop(0, rgba(lerpColor(objColor, [255, 255, 255] as RGB, 0.35), ALPHA.content.max * 0.35 * toyAlpha * entrance));
          bodyGrad.addColorStop(0.4, rgba(objColor, ALPHA.content.max * 0.3 * toyAlpha * entrance));
          bodyGrad.addColorStop(1, rgba(objColor, ALPHA.content.max * 0.08 * toyAlpha * entrance));
          ctx.beginPath();
          ctx.arc(0, 0, baseR, 0, Math.PI * 2);
          ctx.fillStyle = bodyGrad;
          ctx.fill();

          // Edge
          ctx.beginPath();
          ctx.arc(0, 0, baseR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(lerpColor(objColor, [255, 255, 255] as RGB, 0.1), ALPHA.content.max * 0.06 * toyAlpha * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();

          // Specular
          if (baseR > 2 && toyAlpha > 0.5) {
            ctx.beginPath();
            ctx.ellipse(-baseR * 0.2, -baseR * 0.25, baseR * 0.25, baseR * 0.15, -0.3, 0, Math.PI * 2);
            ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.18 * toyAlpha * entrance);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      // ── Progress ───────────────────────────────────────
      if (!s.completed && toyCount > 0) {
        const progR = px(SIZE.xs, minDim);
        const prog = toyCount / THREAT_COUNT;
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.38, minDim), progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Tap to transform threat ──────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      for (const t of s.threats) {
        if (t.tapped) continue;
        if (Math.hypot(mx - t.x, my - t.y) < t.size * 1.5) {
          t.tapped = true;
          t.vy = -0.004; // small bounce on transform
          callbacksRef.current.onHaptic('tap');
          break;
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
