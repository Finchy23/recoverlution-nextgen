/**
 * ATOM 618: THE INTERSECTION OVERPASS ENGINE
 * ============================================
 * Series 62 — Bezier Curve · Position 8
 *
 * Keep toxic trajectories from derailing yours. Tap your path before
 * the intersection — a Z-axis Bezier overpass curves gracefully over
 * the chaotic red line without losing momentum.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Two crossing flow streams visible at the intersection
 *   - User's stream shows smooth laminar flow
 *   - Chaotic stream shows turbulent erratic arrows
 *   - After overpass: user stream flows over, chaotic passes underneath
 *   - Visible separation of flow layers teaches boundary maintenance
 *
 * PHYSICS:
 *   - User's smooth blue path and chaotic red path intersect
 *   - Collision at intersection would shatter both
 *   - Tap own path to raise it into Z-axis overpass
 *   - Blue path curves up (Bezier hump) over red line
 *   - Both paths continue without interference
 *   - Breath modulates overpass arc height + glow
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + intersection danger glow
 *   2. Flow field (dual streams)
 *   3. Chaotic path with jagged rendering
 *   4. Overpass shadow on ground plane
 *   5. User path with overpass hump
 *   6. Intersection zone indicator
 *   7. Tap prompt / elevation indicator
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Tap (on path before intersection) → raises overpass
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static overpass
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, PARTICLE_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Intersection center */
const CROSS_X = 0.5;
const CROSS_Y = 0.5;
/** User path endpoints */
const USER_START_X = 0.05;
const USER_END_X = 0.95;
const USER_Y = 0.5;
/** Chaotic path endpoints */
const CHAOS_START_Y = 0.08;
const CHAOS_END_Y = 0.92;
const CHAOS_X = 0.5;
/** Overpass height */
const OVERPASS_H = SIZE.md;
/** Overpass width zone */
const OVERPASS_W = SIZE.lg;
/** Path strokes */
const PATH_STROKE = STROKE.bold;
/** Path glow */
const PATH_GLOW_W = 0.006;
/** Chaotic jitter amplitude */
const CHAOS_JITTER = 0.012;
/** Chaotic jitter points */
const CHAOS_POINTS = 40;
/** Flow cols */
const FLOW_COLS = 14;
/** Flow rows */
const FLOW_ROWS = 10;
/** Flow arrow len */
const FLOW_ARROW_LEN = 0.02;
/** Danger zone radius */
const DANGER_R = SIZE.sm;
/** Overpass raise speed */
const RAISE_SPEED = 0.025;
/** Shadow offset */
const SHADOW_OFFSET = 0.008;
/** Progress ring */
const PROGRESS_R = SIZE.sm;
/** Bloom frames */
const BLOOM_FRAMES = 30;
/** Elevation indicator pulsing */
const ELEV_PULSE_FREQ = 0.06;
/** Breath arc mod */
const BREATH_ARC_MOD = 0.03;

// =====================================================================
// STATE TYPES
// =====================================================================

interface OverpassState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  elevation: number;
  tapped: boolean;
  completed: boolean;
  bloomTimer: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function IntersectionOverpassAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<OverpassState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    elevation: 0,
    tapped: false,
    completed: false,
    bloomTimer: 0,
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
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // Animate elevation
      if (s.tapped && s.elevation < 1) {
        s.elevation = Math.min(1, s.elevation + RAISE_SPEED * ms);
        cb.onStateChange?.(s.elevation * 0.95);
        if (s.elevation >= 0.5 && s.elevation < 0.55) cb.onHaptic('step_advance');
        if (s.elevation >= 1 && !s.completed) {
          s.completed = true;
          s.bloomTimer = BLOOM_FRAMES;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
        }
      }

      const elev = s.elevation;
      const overpassH = px(OVERPASS_H, minDim) * elev * (1 + breath * BREATH_ARC_MOD);
      const overpassW = px(OVERPASS_W, minDim);

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + DANGER GLOW
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      if (elev < 0.5) {
        const dangerR = px(DANGER_R, minDim) * (1.5 - elev * 2);
        const danger = ctx.createRadialGradient(cx, cy, 0, cx, cy, dangerR);
        danger.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * (1 - elev * 2) * entrance * 0.5));
        danger.addColorStop(0.6, rgba(s.accentRgb, ALPHA.glow.min * (1 - elev * 2) * entrance));
        danger.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = danger;
        ctx.fillRect(0, 0, w, h);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD
      // ═══════════════════════════════════════════════════════════
      {
        ctx.lineWidth = px(STROKE.hairline, minDim);
        const arrowLen = px(FLOW_ARROW_LEN, minDim);

        for (let col = 0; col < FLOW_COLS; col++) {
          for (let row = 0; row < FLOW_ROWS; row++) {
            const fx = w * 0.06 + (col / (FLOW_COLS - 1)) * w * 0.88;
            const fy = h * 0.06 + (row / (FLOW_ROWS - 1)) * h * 0.88;

            // Determine which stream dominates
            const distToUserPath = Math.abs(fy - cy);
            const distToChaosPath = Math.abs(fx - cx);
            const userInfluence = Math.max(0, 1 - distToUserPath / (h * 0.2));
            const chaosInfluence = Math.max(0, 1 - distToChaosPath / (w * 0.15));

            let dx: number, dy: number;
            if (userInfluence > chaosInfluence) {
              dx = 1;
              dy = 0;
            } else if (chaosInfluence > 0.1) {
              dx = (Math.random() - 0.5) * 0.3;
              dy = 1;
            } else {
              dx = 0.5;
              dy = 0.3;
            }

            const mag = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const influence = Math.max(userInfluence, chaosInfluence);
            const alpha = ALPHA.background.max * entrance * (0.2 + influence * 0.8);
            const isUser = userInfluence > chaosInfluence;
            const arrowColor = isUser
              ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.1)
              : s.accentRgb;
            ctx.strokeStyle = rgba(arrowColor, alpha);

            const aLen = arrowLen * (0.4 + influence * 0.6);
            const ex = fx + (dx / mag) * aLen;
            const ey = fy + (dy / mag) * aLen;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            const a = Math.atan2(dy / mag, dx / mag);
            const hl = aLen * 0.25;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * hl, ey - Math.sin(a - 0.5) * hl);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: CHAOTIC PATH (underneath)
      // ═══════════════════════════════════════════════════════════
      {
        const chaosAlpha = ALPHA.focal.max * entrance * (0.5 + (1 - elev) * 0.5);

        // Jagged chaotic path
        ctx.beginPath();
        for (let i = 0; i <= CHAOS_POINTS; i++) {
          const t = i / CHAOS_POINTS;
          const y = h * CHAOS_START_Y + t * h * (CHAOS_END_Y - CHAOS_START_Y);
          const jitter = Math.sin(t * 30 + s.frameCount * 0.05 * ms) * px(CHAOS_JITTER, minDim);
          const x = cx + jitter;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.glow.max * entrance * 0.5);
        ctx.lineWidth = px(PATH_GLOW_W, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i <= CHAOS_POINTS; i++) {
          const t = i / CHAOS_POINTS;
          const y = h * CHAOS_START_Y + t * h * (CHAOS_END_Y - CHAOS_START_Y);
          const jitter = Math.sin(t * 30 + s.frameCount * 0.05 * ms) * px(CHAOS_JITTER, minDim);
          const x = cx + jitter;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(s.accentRgb, chaosAlpha);
        ctx.lineWidth = px(PATH_STROKE, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4: OVERPASS SHADOW
      // ═══════════════════════════════════════════════════════════
      if (elev > 0.1) {
        const shadowOff = px(SHADOW_OFFSET, minDim) * elev;
        ctx.beginPath();
        ctx.moveTo(w * USER_START_X, cy + shadowOff);
        const overLeft = cx - overpassW / 2;
        const overRight = cx + overpassW / 2;
        ctx.lineTo(overLeft, cy + shadowOff);
        ctx.bezierCurveTo(
          overLeft + overpassW * 0.1, cy - overpassH + shadowOff,
          overRight - overpassW * 0.1, cy - overpassH + shadowOff,
          overRight, cy + shadowOff,
        );
        ctx.lineTo(w * USER_END_X, cy + shadowOff);
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.03 * elev * entrance);
        ctx.lineWidth = px(PATH_STROKE * 2, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 5: USER PATH WITH OVERPASS
      // ═══════════════════════════════════════════════════════════
      {
        const overLeft = cx - overpassW / 2;
        const overRight = cx + overpassW / 2;

        // Glow
        ctx.beginPath();
        ctx.moveTo(w * USER_START_X, cy);
        ctx.lineTo(overLeft, cy);
        ctx.bezierCurveTo(
          overLeft + overpassW * 0.1, cy - overpassH,
          overRight - overpassW * 0.1, cy - overpassH,
          overRight, cy,
        );
        ctx.lineTo(w * USER_END_X, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * entrance);
        ctx.lineWidth = px(PATH_GLOW_W, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(w * USER_START_X, cy);
        ctx.lineTo(overLeft, cy);
        ctx.bezierCurveTo(
          overLeft + overpassW * 0.1, cy - overpassH,
          overRight - overpassW * 0.1, cy - overpassH,
          overRight, cy,
        );
        ctx.lineTo(w * USER_END_X, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.focal.max * entrance);
        ctx.lineWidth = px(PATH_STROKE, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: INTERSECTION ZONE INDICATOR
      // ═══════════════════════════════════════════════════════════
      if (elev < 0.5) {
        const zoneR = px(DANGER_R * 0.5, minDim) * (1 + Math.sin(s.frameCount * 0.1 * ms) * 0.2);
        ctx.beginPath();
        ctx.arc(cx, cy, zoneR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.min * (1 - elev * 2) * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.setLineDash([px(0.003, minDim), px(0.003, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: TAP PROMPT / ELEVATION INDICATOR
      // ═══════════════════════════════════════════════════════════
      if (!s.tapped) {
        const pulse = 0.5 + Math.sin(s.frameCount * ELEV_PULSE_FREQ * ms) * 0.3;
        const promptR = px(PARTICLE_SIZE.xl, minDim) * (1 + pulse * 0.3);
        const promptX = cx - overpassW * 0.3;

        const pGlow = ctx.createRadialGradient(promptX, cy, 0, promptX, cy, promptR * 3);
        pGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * pulse * entrance));
        pGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(promptX, cy, promptR * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(promptX, cy, promptR, 0, Math.PI * 2);
        const pGrad = ctx.createRadialGradient(promptX, cy, 0, promptX, cy, promptR);
        pGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5), ALPHA.accent.max * pulse * entrance));
        pGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.focal.max * pulse * entrance));
        pGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pGrad;
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS + COMPLETION
      // ═══════════════════════════════════════════════════════════
      {
        const ringR = px(PROGRESS_R, minDim);
        const ringX = w * 0.92;
        const ringY = h * 0.08;

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * elev);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (s.bloomTimer > 0) {
        s.bloomTimer -= ms;
        const bloomT = Math.max(0, s.bloomTimer / BLOOM_FRAMES);
        const bloomR = px(SIZE.md, minDim) * (1 - bloomT) * 2;
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (_e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.tapped) {
        s.tapped = true;
        callbacksRef.current.onHaptic('tap');
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
