/**
 * ATOM 377: THE MAGNETIC PULL ENGINE
 * ====================================
 * Series 38 — Magnetic Sieve · Position 7
 *
 * Cure losing your Why in the weeds of the How. Drag the magnet
 * across the sea — it only picks up the 3 matching truths.
 *
 * PHYSICS:
 *   - Screen littered with hundreds of identical-looking nodes
 *   - User drags a heavy magnet node across the field
 *   - Only 3 specific nodes have matching polarity — snap to magnet
 *   - Non-matching nodes are gently repelled away
 *   - Each snap produces a satisfying click with glow burst
 *   - After collecting all 3, magnet and truths form constellation
 *   - Breath modulates the magnet's sensing field radius
 *
 * INTERACTION:
 *   Drag → moves magnet across the field
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static view with 3 truths attached to magnet at center
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total field nodes */
const FIELD_COUNT = 80;
/** Matching truth nodes */
const TRUTH_COUNT = 3;
/** Magnet visual radius */
const MAGNET_R_FRAC = 0.032;
/** Magnet sensing field radius (for attraction) */
const SENSE_R_FRAC = 0.18;
/** Field node radius */
const NODE_R_FRAC = 0.008;
/** Truth node radius (slightly larger when revealed) */
const TRUTH_R_FRAC = 0.014;
/** Snap attraction speed (how fast truth pulls to magnet) */
const SNAP_SPEED = 0.08;
/** Repulsion force on non-matching nodes */
const REPEL_FORCE = 0.003;
/** Repulsion range */
const REPEL_RANGE = 0.12;
/** Orbit radius when truth is attached to magnet */
const ORBIT_R_FRAC = 0.06;
/** How much breath extends the sensing field */
const BREATH_SENSE_FACTOR = 0.15;
/** Magnet trail length */
const TRAIL_LENGTH = 15;
/** Constellation line reveal speed */
const CONSTELLATION_SPEED = 0.015;

// =====================================================================
// STATE TYPES
// =====================================================================

interface FieldNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isTruth: boolean;
  snapped: boolean;      // attached to magnet
  orbitAngle: number;    // current orbit position
  snapAnim: number;      // 0→1 snap animation progress
  driftAngle: number;
  driftSpeed: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function createField(): FieldNode[] {
  const nodes: FieldNode[] = [];
  // Place truth nodes at specific spots
  const truthPositions = [
    { x: 0.2 + Math.random() * 0.15, y: 0.25 + Math.random() * 0.15 },
    { x: 0.6 + Math.random() * 0.15, y: 0.45 + Math.random() * 0.15 },
    { x: 0.3 + Math.random() * 0.15, y: 0.7 + Math.random() * 0.15 },
  ];

  for (let i = 0; i < TRUTH_COUNT; i++) {
    nodes.push({
      x: truthPositions[i].x,
      y: truthPositions[i].y,
      vx: 0, vy: 0,
      isTruth: true,
      snapped: false,
      orbitAngle: (i / TRUTH_COUNT) * Math.PI * 2,
      snapAnim: 0,
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: 0.0002 + Math.random() * 0.0003,
    });
  }

  for (let i = 0; i < FIELD_COUNT - TRUTH_COUNT; i++) {
    nodes.push({
      x: 0.05 + Math.random() * 0.9,
      y: 0.05 + Math.random() * 0.9,
      vx: 0, vy: 0,
      isTruth: false,
      snapped: false,
      orbitAngle: 0,
      snapAnim: 0,
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: 0.0002 + Math.random() * 0.0003,
    });
  }

  return nodes;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MagneticPullAtom({
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
    nodes: createField(),
    magnetX: 0.5,
    magnetY: 0.5,
    dragging: false,
    truthsCollected: 0,
    completed: false,
    constellationReveal: 0,
    trail: [] as { x: number; y: number }[],
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

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const mR = px(MAGNET_R_FRAC, minDim);

        // Draw some field nodes dimmed
        for (let i = TRUTH_COUNT; i < Math.min(30, s.nodes.length); i++) {
          const n = s.nodes[i];
          const nR = px(NODE_R_FRAC, minDim);
          ctx.beginPath();
          ctx.arc(n.x * w, n.y * h, nR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance);
          ctx.fill();
        }

        // Magnet at center with truths orbiting
        const magGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, mR * 5);
        magGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        magGlow.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        magGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = magGlow;
        ctx.fillRect(cx - mR * 5, cy - mR * 5, mR * 10, mR * 10);

        ctx.beginPath();
        ctx.arc(cx, cy, mR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();

        // Truth nodes around magnet
        for (let i = 0; i < TRUTH_COUNT; i++) {
          const angle = (i / TRUTH_COUNT) * Math.PI * 2 - Math.PI / 2;
          const oR = px(ORBIT_R_FRAC, minDim);
          const tx = cx + Math.cos(angle) * oR;
          const ty = cy + Math.sin(angle) * oR;
          const tR = px(TRUTH_R_FRAC, minDim);

          ctx.beginPath();
          ctx.arc(tx, ty, tR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.45 * entrance);
          ctx.fill();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Store magnet trail ──────────────────────────
      if (s.dragging) {
        s.trail.push({ x: s.magnetX, y: s.magnetY });
        if (s.trail.length > TRAIL_LENGTH) s.trail.shift();
      }

      // ── Sensing field radius ────────────────────────
      const senseR = SENSE_R_FRAC * (1 + breath * BREATH_SENSE_FACTOR);

      // ── Node physics ────────────────────────────────
      let collected = 0;
      for (const n of s.nodes) {
        if (n.snapped) {
          collected++;
          n.snapAnim = Math.min(1, n.snapAnim + 0.02 * ms);
          // Orbit around magnet
          n.orbitAngle += 0.015 * ms;
          continue;
        }

        // Lazy drift
        n.x += Math.cos(n.driftAngle) * n.driftSpeed * ms;
        n.y += Math.sin(n.driftAngle) * n.driftSpeed * ms;
        n.driftAngle += (Math.random() - 0.5) * 0.01;

        // Soft bounce
        if (n.x < 0.03 || n.x > 0.97) n.driftAngle = Math.PI - n.driftAngle;
        if (n.y < 0.03 || n.y > 0.97) n.driftAngle = -n.driftAngle;

        const dx = n.x - s.magnetX;
        const dy = n.y - s.magnetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (n.isTruth && dist < senseR) {
          // Truth in range — attract to magnet
          n.x -= dx * SNAP_SPEED * ms;
          n.y -= dy * SNAP_SPEED * ms;

          // Close enough — snap!
          if (dist < 0.03) {
            n.snapped = true;
            cb.onHaptic('step_advance');
          }
        } else if (!n.isTruth && dist < REPEL_RANGE) {
          // Non-matching — gentle repulsion
          const norm = dist || 0.001;
          n.vx += (dx / norm) * REPEL_FORCE * ms;
          n.vy += (dy / norm) * REPEL_FORCE * ms;
        }

        // Apply velocity with damping
        n.x += n.vx * ms;
        n.y += n.vy * ms;
        n.vx *= 0.92;
        n.vy *= 0.92;
      }

      s.truthsCollected = collected;

      // ── Completion ──────────────────────────────────
      if (collected >= TRUTH_COUNT && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.constellationReveal = Math.min(1, s.constellationReveal + CONSTELLATION_SPEED * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.constellationReveal * 0.5
        : (collected / TRUTH_COUNT) * 0.5);

      // ── Draw magnet trail ───────────────────────────
      if (s.trail.length > 1) {
        for (let i = 0; i < s.trail.length - 1; i++) {
          const alpha = (i / s.trail.length) * ALPHA.atmosphere.max * 0.5 * entrance;
          ctx.beginPath();
          ctx.moveTo(s.trail[i].x * w, s.trail[i].y * h);
          ctx.lineTo(s.trail[i + 1].x * w, s.trail[i + 1].y * h);
          ctx.strokeStyle = rgba(s.primaryRgb, alpha);
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
      }

      // ── Draw field nodes ────────────────────────────
      for (const n of s.nodes) {
        if (n.snapped || n.isTruth) continue; // Draw truths separately

        const npx = n.x * w;
        const npy = n.y * h;
        const nR = px(NODE_R_FRAC, minDim);

        ctx.beginPath();
        ctx.arc(npx, npy, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.fill();
      }

      // ── Draw unsnapped truth nodes ──────────────────
      for (const n of s.nodes) {
        if (!n.isTruth || n.snapped) continue;

        const npx = n.x * w;
        const npy = n.y * h;
        const nR = px(NODE_R_FRAC, minDim); // Same size as field until snapped

        // Subtle distinction: very faint inner glow
        const dx = n.x - s.magnetX;
        const dy = n.y - s.magnetY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inRange = dist < senseR;

        if (inRange) {
          // Reveal glow when in sensing range
          const glowR = nR * 4;
          const g = ctx.createRadialGradient(npx, npy, 0, npx, npy, glowR);
          g.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
          g.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = g;
          ctx.fillRect(npx - glowR, npy - glowR, glowR * 2, glowR * 2);
        }

        ctx.beginPath();
        ctx.arc(npx, npy, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          inRange ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (inRange ? 0.3 : 0.1) * entrance,
        );
        ctx.fill();
      }

      // ── Draw magnet sensing field ───────────────────
      const mPx = s.magnetX * w;
      const mPy = s.magnetY * h;
      const senseRPx = px(senseR, minDim);

      // Sensing field ring (subtle)
      ctx.beginPath();
      ctx.arc(mPx, mPy, senseRPx, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
      ctx.lineWidth = px(0.0008, minDim);
      ctx.setLineDash([px(0.005, minDim), px(0.008, minDim)]);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Draw magnet node ────────────────────────────
      const mR = px(MAGNET_R_FRAC, minDim) * (1 + breath * 0.06);

      // Magnet outer glow
      const magGlowR = mR * 6;
      const magGlow = ctx.createRadialGradient(mPx, mPy, 0, mPx, mPy, magGlowR);
      magGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.35 * entrance));
      magGlow.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
      magGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = magGlow;
      ctx.fillRect(mPx - magGlowR, mPy - magGlowR, magGlowR * 2, magGlowR * 2);

      // Magnet body
      ctx.beginPath();
      ctx.arc(mPx, mPy, mR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      // Magnet bright core
      ctx.beginPath();
      ctx.arc(mPx, mPy, mR * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(s.primaryRgb, [255, 255, 255], 0.35),
        ALPHA.content.max * 0.3 * entrance,
      );
      ctx.fill();

      // ── Draw snapped truths orbiting magnet ─────────
      const orbitR = px(ORBIT_R_FRAC, minDim);
      const snappedNodes: { x: number; y: number }[] = [];

      for (const n of s.nodes) {
        if (!n.isTruth || !n.snapped) continue;

        const tx = mPx + Math.cos(n.orbitAngle) * orbitR * easeOutExpo(n.snapAnim);
        const ty = mPy + Math.sin(n.orbitAngle) * orbitR * easeOutExpo(n.snapAnim);
        snappedNodes.push({ x: tx, y: ty });
        const tR = px(TRUTH_R_FRAC, minDim) * easeOutExpo(n.snapAnim);

        // Truth glow
        const tGlowR = tR * 4;
        const tGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, tGlowR);
        tGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        tGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        tGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tGlow;
        ctx.fillRect(tx - tGlowR, ty - tGlowR, tGlowR * 2, tGlowR * 2);

        // Truth body
        ctx.beginPath();
        ctx.arc(tx, ty, tR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.45 * entrance);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(tx, ty, tR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
          ALPHA.content.max * 0.3 * entrance,
        );
        ctx.fill();
      }

      // ── Draw constellation lines ────────────────────
      if (s.completed && snappedNodes.length >= TRUTH_COUNT) {
        const lineAlpha = ALPHA.content.max * 0.1 * easeOutExpo(s.constellationReveal) * entrance;

        // Lines between truths and magnet
        for (const sn of snappedNodes) {
          ctx.beginPath();
          ctx.moveTo(mPx, mPy);
          ctx.lineTo(sn.x, sn.y);
          ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }

        // Lines between truths
        for (let i = 0; i < snappedNodes.length; i++) {
          const a = snappedNodes[i];
          const b = snappedNodes[(i + 1) % snappedNodes.length];
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha * 0.6);
          ctx.lineWidth = px(0.0008, minDim);
          ctx.stroke();
        }
      }

      // ── Collection counter ──────────────────────────
      if (s.truthsCollected > 0 && !s.completed) {
        const counterR = px(0.012, minDim);
        const counterAngle = (s.truthsCollected / TRUTH_COUNT) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(mPx, mPy, mR + px(0.015, minDim), -Math.PI / 2, -Math.PI / 2 + counterAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.magnetX = (e.clientX - rect.left) / rect.width;
      stateRef.current.magnetY = (e.clientY - rect.top) / rect.height;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.magnetX = (e.clientX - rect.left) / rect.width;
      stateRef.current.magnetY = (e.clientY - rect.top) / rect.height;
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      stateRef.current.trail = [];
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
          cursor: 'grab',
        }}
      />
    </div>
  );
}
