/**
 * ATOM 615: THE TANGENT HANDLE ENGINE
 * =====================================
 * Series 62 — Bezier Curve · Position 5
 *
 * Cure anxiety spiraling. The control handle is pulled too far out
 * causing the path to wildly loop. Grab it and pull tightly back —
 * the chaotic loop snaps into a tight efficient controlled corner.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Flow arrows spiral outward when handle is extended (chaos)
 *   - As handle retracts, flow vectors tighten into ordered radial pattern
 *   - The visible transition from turbulent to laminar flow teaches control
 *   - Vorticity decreases as retraction increases
 *
 * PHYSICS:
 *   - Bezier curve with control handle extended way too far
 *   - Path loops wildly, crossing itself
 *   - Drag handle inward to retract
 *   - Loop tightens into efficient controlled corner
 *   - Flow field transitions from chaotic spiral to ordered curve
 *   - Breath modulates loop oscillation + glow warmth
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + chaos glow field
 *   2. Flow field vortex arrows
 *   3. Bezier curve shadow + glow
 *   4. Bezier curve body with multi-stop gradient
 *   5. Anchor points with specular
 *   6. Control handle with Fresnel line + glass dot
 *   7. Vorticity indicator ring
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Drag (handle inward toward anchor) → tightens loop
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static controlled curve
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

/** Anchor point 1 position */
const ANCHOR1_X = 0.25;
const ANCHOR1_Y = 0.55;
/** Anchor point 2 position */
const ANCHOR2_X = 0.75;
const ANCHOR2_Y = 0.55;
/** Control handle max extension */
const HANDLE_MAX_EXT = SIZE.xl;
/** Control handle min (retracted) */
const HANDLE_MIN_EXT = SIZE.xs;
/** Handle initial extension (wild) */
const HANDLE_INIT_EXT = 0.95;
/** Anchor dot radius */
const ANCHOR_R = PARTICLE_SIZE.lg;
/** Handle dot radius */
const HANDLE_R = PARTICLE_SIZE.xl;
/** Handle glow layers */
const HANDLE_GLOW_LAYERS = 4;
/** Bezier path stroke */
const PATH_STROKE = STROKE.bold;
/** Path glow width */
const PATH_GLOW_W = 0.007;
/** Flow grid density */
const FLOW_GRID = 11;
/** Flow arrow length */
const FLOW_ARROW_LEN = 0.024;
/** Vorticity ring radius */
const VORT_R = SIZE.md * 0.6;
/** Vorticity ring segments */
const VORT_SEGS = 36;
/** Completion retraction threshold */
const COMPLETE_THRESHOLD = 0.12;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Bloom frames */
const BLOOM_FRAMES = 30;
/** Breath oscillation on loop */
const BREATH_LOOP_OSC = 0.008;
/** Specular offset */
const SPECULAR_OFFSET = 0.003;
/** Chaos glow radius */
const CHAOS_GLOW_R = SIZE.lg;

// =====================================================================
// STATE TYPES
// =====================================================================

interface TangentState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  extension: number;
  dragging: boolean;
  dragStartDist: number;
  completed: boolean;
  bloomTimer: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function TangentHandleRetractAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<TangentState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    extension: HANDLE_INIT_EXT,
    dragging: false,
    dragStartDist: 0,
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
      const ext = s.extension;
      const retraction = 1 - ext; // 0=wild, 1=controlled

      // Geometry
      const a1x = w * ANCHOR1_X;
      const a1y = h * ANCHOR1_Y;
      const a2x = w * ANCHOR2_X;
      const a2y = h * ANCHOR2_Y;

      // Control point: extended upward from midpoint
      const midX = (a1x + a2x) / 2;
      const handleDist = px(HANDLE_MIN_EXT, minDim) + ext * px(HANDLE_MAX_EXT - HANDLE_MIN_EXT, minDim);
      const breathOsc = Math.sin(s.frameCount * 0.04) * px(BREATH_LOOP_OSC, minDim) * breath * ms * ext;
      const cpx = midX + breathOsc;
      const cpy = a1y - handleDist;

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + CHAOS GLOW
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // Chaos glow (intensifies with extension)
      if (ext > 0.3) {
        const chaosR = px(CHAOS_GLOW_R, minDim) * (0.5 + ext * 0.5);
        const chaosGlow = ctx.createRadialGradient(cpx, cpy, 0, cpx, cpy, chaosR);
        chaosGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * ext * entrance * 0.6));
        chaosGlow.addColorStop(0.4, rgba(s.accentRgb, ALPHA.glow.min * ext * entrance));
        chaosGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = chaosGlow;
        ctx.fillRect(0, 0, w, h);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD (Vortex Arrows)
      // ═══════════════════════════════════════════════════════════
      {
        const arrowLen = px(FLOW_ARROW_LEN, minDim);
        ctx.lineWidth = px(STROKE.hairline, minDim);

        for (let gx = 0; gx < FLOW_GRID; gx++) {
          for (let gy = 0; gy < FLOW_GRID; gy++) {
            const fx = w * 0.08 + (gx / (FLOW_GRID - 1)) * w * 0.84;
            const fy = h * 0.06 + (gy / (FLOW_GRID - 1)) * h * 0.88;

            // Direction: spiral around control point (chaotic) vs curve-following (controlled)
            const dx = fx - cpx;
            const dy = fy - cpy;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const influence = Math.max(0, 1 - dist / (minDim * 0.5));

            // Spiral component (chaos)
            const spiralAngle = Math.atan2(dy, dx) + Math.PI / 2;
            const spiralDx = Math.cos(spiralAngle);
            const spiralDy = Math.sin(spiralAngle);

            // Curve-following component (order)
            const curveAngle = Math.atan2(a2y - a1y, a2x - a1x);
            const curveDx = Math.cos(curveAngle);
            const curveDy = Math.sin(curveAngle);

            // Blend based on retraction
            const fdx = spiralDx * ext + curveDx * retraction;
            const fdy = spiralDy * ext + curveDy * retraction;
            const fMag = Math.sqrt(fdx * fdx + fdy * fdy) + 0.001;

            const alpha = ALPHA.background.max * influence * entrance * (0.4 + retraction * 0.6);
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, retraction);
            ctx.strokeStyle = rgba(arrowColor, alpha);

            const aLen = arrowLen * influence * (0.5 + ext * 0.5);
            const ex = fx + (fdx / fMag) * aLen;
            const ey = fy + (fdy / fMag) * aLen;

            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // Arrowhead
            const a = Math.atan2(fdy, fdx);
            const hl = aLen * 0.25;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * hl, ey - Math.sin(a - 0.5) * hl);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3-4: BEZIER CURVE (shadow + glow + body)
      // ═══════════════════════════════════════════════════════════
      const drawBezier = (offX: number, offY: number, color: string, width: number) => {
        ctx.beginPath();
        ctx.moveTo(a1x + offX, a1y + offY);
        ctx.quadraticCurveTo(cpx + offX, cpy + offY, a2x + offX, a2y + offY);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.stroke();
      };

      // Shadow
      const shOff = px(0.004, minDim);
      drawBezier(shOff, shOff, rgba([0, 0, 0] as RGB, 0.03 * entrance), px(PATH_STROKE * 1.5, minDim));

      // Glow
      const glowColor = lerpColor(s.accentRgb, s.primaryRgb, retraction);
      drawBezier(0, 0, rgba(glowColor, ALPHA.glow.max * entrance), px(PATH_GLOW_W, minDim));

      // Body
      const pathColor = lerpColor(s.accentRgb, s.primaryRgb, retraction);
      drawBezier(0, 0, rgba(pathColor, ALPHA.focal.max * entrance), px(PATH_STROKE, minDim));

      // ═══════════════════════════════════════════════════════════
      // LAYER 5: ANCHOR POINTS
      // ═══════════════════════════════════════════════════════════
      for (const [ax, ay] of [[a1x, a1y], [a2x, a2y]]) {
        const ar = px(ANCHOR_R, minDim);

        // Anchor glow
        const aGlow = ctx.createRadialGradient(ax, ay, 0, ax, ay, ar * 4);
        aGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * entrance));
        aGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        aGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aGlow;
        ctx.beginPath();
        ctx.arc(ax, ay, ar * 4, 0, Math.PI * 2);
        ctx.fill();

        // Anchor body
        const aGrad = ctx.createRadialGradient(ax, ay, 0, ax, ay, ar);
        aGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), ALPHA.focal.max * entrance));
        aGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        aGrad.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        aGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.arc(ax, ay, ar, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(ax - ar * 0.3, ay - ar * 0.3, ar * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: CONTROL HANDLE
      // ═══════════════════════════════════════════════════════════
      {
        // Fresnel line from midpoint to handle
        ctx.beginPath();
        ctx.moveTo(midX, a1y);
        ctx.lineTo(cpx, cpy);
        ctx.strokeStyle = rgba(pathColor, ALPHA.content.max * 0.5 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.setLineDash([px(0.004, minDim), px(0.004, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fresnel glow on line
        ctx.beginPath();
        ctx.moveTo(midX, a1y);
        ctx.lineTo(cpx, cpy);
        ctx.strokeStyle = rgba(pathColor, ALPHA.glow.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim);
        ctx.stroke();

        // Handle dot with multi-glow
        const hr = px(HANDLE_R, minDim) * (1 + breath * 0.1);
        for (let g = HANDLE_GLOW_LAYERS; g >= 1; g--) {
          const gr = hr * (1 + g * 1.1);
          const hGlow = ctx.createRadialGradient(cpx, cpy, 0, cpx, cpy, gr);
          const hColor = lerpColor(s.accentRgb, s.primaryRgb, retraction);
          hGlow.addColorStop(0, rgba(hColor, (ALPHA.glow.max / g) * entrance));
          hGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = hGlow;
          ctx.beginPath();
          ctx.arc(cpx, cpy, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Handle body — glass gradient
        const hGrad = ctx.createRadialGradient(cpx, cpy, 0, cpx, cpy, hr);
        const handleColor = lerpColor(s.accentRgb, s.primaryRgb, retraction);
        hGrad.addColorStop(0, rgba(lerpColor(handleColor, [255, 255, 255] as RGB, 0.45), ALPHA.accent.max * entrance));
        hGrad.addColorStop(0.3, rgba(handleColor, ALPHA.focal.max * entrance));
        hGrad.addColorStop(0.7, rgba(handleColor, ALPHA.content.max * entrance));
        hGrad.addColorStop(1, rgba(handleColor, 0));
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(cpx, cpy, hr, 0, Math.PI * 2);
        ctx.fill();

        // Handle specular
        ctx.beginPath();
        ctx.arc(cpx - hr * 0.25, cpy - hr * 0.25, hr * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.8 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: VORTICITY INDICATOR RING
      // ═══════════════════════════════════════════════════════════
      {
        const vr = px(VORT_R, minDim);
        ctx.beginPath();
        for (let i = 0; i <= VORT_SEGS; i++) {
          const t = i / VORT_SEGS;
          const angle = t * Math.PI * 2 - Math.PI / 2;
          const wobble = ext * Math.sin(t * 12 + s.frameCount * 0.06 * ms) * px(0.008, minDim);
          const rx = cpx + Math.cos(angle) * (vr + wobble);
          const ry = cpy + Math.sin(angle) * (vr + wobble);
          if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
        }
        ctx.strokeStyle = rgba(
          lerpColor(s.accentRgb, s.primaryRgb, retraction),
          ALPHA.content.min * entrance * (0.3 + ext * 0.7),
        );
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS RING + COMPLETION
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
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * retraction);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // Completion check
      if (ext <= COMPLETE_THRESHOLD && !s.completed) {
        s.completed = true;
        s.bloomTimer = BLOOM_FRAMES;
        cb.onHaptic('completion');
        cb.onStateChange?.(1);
      }

      if (s.bloomTimer > 0) {
        s.bloomTimer -= ms;
        const bloomT = Math.max(0, s.bloomTimer / BLOOM_FRAMES);
        const bloomR = px(SIZE.md, minDim) * (1 - bloomT) * 2;
        const bloom = ctx.createRadialGradient(midX, a1y, 0, midX, a1y, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(midX, a1y, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      // Pulling handle down (toward anchors) = retracting
      const newExt = Math.max(0, Math.min(1, (1 - my) * 1.8 - 0.4));
      if (Math.abs(newExt - s.extension) > 0.005) {
        s.extension = newExt;
        callbacksRef.current.onStateChange?.((1 - s.extension) * 0.95);
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }}
      />
    </div>
  );
}
