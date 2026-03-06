/**
 * ATOM 390: THE PERPETUAL MOTION ENGINE (Capstone)
 * ==================================================
 * Series 39 — Momentum Wheel · Position 10
 *
 * The ultimate reward. User is locked out of interacting.
 * Watch the perfect frictionless orbit sustain itself in sync
 * with breath. Zero kinetic input required.
 *
 * PHYSICS:
 *   - 5 nodes in perfect pentagonal orbit configuration
 *   - Frictionless — zero decay, mathematically perpetual
 *   - Orbital speed synchronized to breath engine amplitude
 *   - Ephemeral geometric connections form between nodes
 *   - Golden ratio relationships in orbit radii
 *   - Inner counter-rotating geometric tracery
 *   - Progressive seal animation builds to completion stamp
 *   - Pure observation as the therapeutic mechanism
 *
 * INTERACTION:
 *   None — observation only. Breath drives the rhythm.
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static pentagonal arrangement with glow connections
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, easeSineInOut,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Number of orbiting nodes */
const NODE_COUNT = 5;
/** Primary orbit radius */
const ORBIT_R_FRAC = SIZE.md;
/** Secondary (inner) orbit radius — golden ratio */
const INNER_ORBIT_RATIO = 0.618;
/** Node radius */
const NODE_R_FRAC = 0.016;
/** Base orbital speed (rad/frame) */
const BASE_SPEED = 0.008;
/** Breath speed modulation range */
const BREATH_SPEED_RANGE = 0.004;
/** Inner counter-rotation speed ratio */
const INNER_SPEED_RATIO = -0.618;
/** Connection line opacity */
const CONNECTION_ALPHA_FRAC = 0.12;
/** Geometric tracery node count (inner ring) */
const TRACERY_COUNT = 8;
/** Tracery radius ratio */
const TRACERY_R_RATIO = 0.35;
/** Tracery node size */
const TRACERY_DOT_FRAC = 0.004;
/** Seal progress rate */
const SEAL_RATE = 0.004;
/** Seal stamp threshold */
const SEAL_THRESHOLD = 0.95;
/** Breath glow factor on nodes */
const BREATH_GLOW_FACTOR = 0.2;
/** Trail opacity per node */
const TRAIL_SEGMENTS = 15;
/** Trail angle span */
const TRAIL_SPAN = 0.35;
/** Orbit path ring count */
const ORBIT_RING_COUNT = 3;
/** Golden spiral increment per ring */
const GOLDEN_SPIRAL_RATIO = 1.618;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function PerpetualMotionAtom({
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
    angle: 0,
    innerAngle: 0,
    sealProgress: 0,
    sealed: false,
    breathPeakReported: false,
    lastBreathSign: 0,
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

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Orbital physics (breath-driven) ─────────────
      const speed = (BASE_SPEED + breath * BREATH_SPEED_RANGE) * ms;
      s.angle += speed;
      s.innerAngle += speed * INNER_SPEED_RATIO;

      // ── Seal progress ───────────────────────────────
      s.sealProgress = Math.min(1, s.sealProgress + SEAL_RATE * ms);
      if (s.sealProgress >= SEAL_THRESHOLD && !s.sealed) {
        s.sealed = true;
        cb.onHaptic('seal_stamp');
      }

      // ── Breath peak detection ───────────────────────
      const breathSign = breath > 0.5 ? 1 : -1;
      if (breathSign === 1 && s.lastBreathSign === -1 && !s.breathPeakReported) {
        cb.onHaptic('breath_peak');
        s.breathPeakReported = true;
      }
      if (breathSign === -1) s.breathPeakReported = false;
      s.lastBreathSign = breathSign;

      cb.onStateChange?.(s.sealProgress);

      const orbitR = px(ORBIT_R_FRAC, minDim);
      const innerOrbitR = orbitR * INNER_ORBIT_RATIO;
      const breathMod = 1 + breath * BREATH_GLOW_FACTOR;

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Static pentagonal arrangement
        for (let i = 0; i < NODE_COUNT; i++) {
          const a = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
          const nx = cx + Math.cos(a) * orbitR;
          const ny = cy + Math.sin(a) * orbitR;
          const nR = px(NODE_R_FRAC, minDim);

          // Connection to next
          const j = (i + 1) % NODE_COUNT;
          const ja = (j / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
          const jx = cx + Math.cos(ja) * orbitR;
          const jy = cy + Math.sin(ja) * orbitR;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(jx, jy);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * CONNECTION_ALPHA_FRAC * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();

          // Node glow
          const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nR * 4);
          ng.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
          ng.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = ng;
          ctx.fillRect(nx - nR * 4, ny - nR * 4, nR * 8, nR * 8);

          // Node body
          ctx.beginPath();
          ctx.arc(nx, ny, nR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
          ctx.fill();
        }

        // Orbit path
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Orbit path rings ────────────────────────────
      for (let ring = 0; ring < ORBIT_RING_COUNT; ring++) {
        const ringR = orbitR * (1 + (ring - 1) * 0.05);
        const ringAlpha = ALPHA.atmosphere.min * (1 - ring * 0.3) * entrance;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ringAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Inner orbit path ────────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, innerOrbitR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.6 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // ── Geometric tracery (inner counter-rotating) ──
      for (let i = 0; i < TRACERY_COUNT; i++) {
        const a = s.innerAngle + (i / TRACERY_COUNT) * Math.PI * 2;
        const tr = innerOrbitR * TRACERY_R_RATIO;
        const tx = cx + Math.cos(a) * tr;
        const ty = cy + Math.sin(a) * tr;
        const dotR = px(TRACERY_DOT_FRAC, minDim);

        ctx.beginPath();
        ctx.arc(tx, ty, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.fill();

        // Connect to opposite tracery node
        const opposite = (i + TRACERY_COUNT / 2) % TRACERY_COUNT;
        const oa = s.innerAngle + (opposite / TRACERY_COUNT) * Math.PI * 2;
        const ox = cx + Math.cos(oa) * tr;
        const oy = cy + Math.sin(oa) * tr;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ox, oy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Node positions ──────────────────────────────
      const nodes: { x: number; y: number }[] = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const a = s.angle + (i / NODE_COUNT) * Math.PI * 2;
        nodes.push({
          x: cx + Math.cos(a) * orbitR,
          y: cy + Math.sin(a) * orbitR,
        });
      }

      // ── Pentagonal connections ──────────────────────
      // Adjacent connections
      for (let i = 0; i < NODE_COUNT; i++) {
        const j = (i + 1) % NODE_COUNT;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * CONNECTION_ALPHA_FRAC * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // Star connections (pentagram — skip-one connections)
      for (let i = 0; i < NODE_COUNT; i++) {
        const j = (i + 2) % NODE_COUNT;
        const starAlpha = ALPHA.content.max * CONNECTION_ALPHA_FRAC * 0.5 * entrance;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = rgba(s.primaryRgb, starAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Node trails ─────────────────────────────────
      for (let i = 0; i < NODE_COUNT; i++) {
        const baseA = s.angle + (i / NODE_COUNT) * Math.PI * 2;
        for (let t = 1; t <= TRAIL_SEGMENTS; t++) {
          const trailA = baseA - (t / TRAIL_SEGMENTS) * TRAIL_SPAN;
          const tx = cx + Math.cos(trailA) * orbitR;
          const ty = cy + Math.sin(trailA) * orbitR;
          const trailAlpha = (1 - t / TRAIL_SEGMENTS) * ALPHA.content.max * 0.12 * entrance;
          const trailR = px(NODE_R_FRAC, minDim) * (1 - t / TRAIL_SEGMENTS) * 0.5;

          ctx.beginPath();
          ctx.arc(tx, ty, trailR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, trailAlpha);
          ctx.fill();
        }
      }

      // ── Nodes ───────────────────────────────────────
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        const nR = px(NODE_R_FRAC, minDim);

        // Glow halo (breath-responsive)
        const glowR = nR * (3 + breathMod);
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        ng.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * breathMod * s.sealProgress * entrance));
        ng.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.min * s.sealProgress * entrance));
        ng.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ng;
        ctx.fillRect(n.x - glowR, n.y - glowR, glowR * 2, glowR * 2);

        // Node body
        const bodyR = nR * (1 + breath * 0.05);
        ctx.beginPath();
        ctx.arc(n.x, n.y, bodyR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(n.x, n.y, bodyR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
          ALPHA.content.max * 0.25 * entrance,
        );
        ctx.fill();
      }

      // ── Center glow (seal progress) ─────────────────
      const sealGlowR = innerOrbitR * (0.5 + s.sealProgress * 0.8) * breathMod;
      const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sealGlowR);
      sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * s.sealProgress * entrance));
      sg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * s.sealProgress * 0.5 * entrance));
      sg.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(cx - sealGlowR, cy - sealGlowR, sealGlowR * 2, sealGlowR * 2);

      // ── Seal ring (shows completion progress) ───────
      if (s.sealProgress > 0.05) {
        const sealAngle = s.sealProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, innerOrbitR * 0.65, -Math.PI / 2, -Math.PI / 2 + sealAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * s.sealProgress * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── Center dot (appears at seal completion) ─────
      if (s.sealed) {
        const centerR = px(0.006, minDim) * easeOutCubic(Math.min(1, (s.sealProgress - SEAL_THRESHOLD) * 20));
        ctx.beginPath();
        ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
          ALPHA.content.max * 0.4 * entrance,
        );
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // No pointer handlers — user is locked out
    return () => {
      cancelAnimationFrame(animId);
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
        }}
      />
    </div>
  );
}
