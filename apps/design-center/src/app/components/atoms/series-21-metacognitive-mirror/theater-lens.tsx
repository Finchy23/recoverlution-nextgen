/**
 * ATOM 201: THE THEATER LENS ENGINE
 * ====================================
 * Series 21 — Metacognitive Mirror · Position 1
 *
 * When fused with a thought, it presses against your cornea. Pull back —
 * reveal it is a tiny movie on a flat screen in a massive, silent theater.
 *
 * PHYSICS:
 *   - Initially the "thought" fills the entire viewport (fused to cornea)
 *   - Drag downward / pinch inward to exponentially pull the camera back
 *   - The thought shrinks to a tiny glowing screen in a vast dark theater
 *   - Theater seat rows emerge from the darkness
 *   - Resolution: the thought is a harmless movie playing far, far away
 *
 * INTERACTION:
 *   Drag down (or pinch) → Z-axis camera extraction
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static mid-pullback state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, FONT_SIZE,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** How fast pullback responds to drag (per pixel of movement) */
const DRAG_SENSITIVITY = 0.003;
/** Snap-back spring constant when released before threshold */
const SNAP_BACK_RATE = 0.04;
/** Completion threshold */
const COMPLETION_THRESHOLD = 0.92;
/** Number of seat rows to render */
const SEAT_ROWS = 6;

// =====================================================================
// HELPERS
// =====================================================================

/** Exponential mapping: small pullback → huge visual shift at start */
function expMap(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function TheaterLensAtom({
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
    // Pullback state: 0 = fused to cornea, 1 = fully extracted
    pullback: 0,
    targetPullback: 0,
    // Interaction
    dragging: false,
    dragStartY: 0,
    dragStartPullback: 0,
    // Pinch
    pinching: false,
    pinchStartDist: 0,
    pinchStartPullback: 0,
    // Completion
    completed: false,
    lastStepNotified: -1,
    // Noise seed for "thought" texture
    noiseSeed: Math.random() * 1000,
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

      // ── Pullback physics ──────────────────────────────
      if (!s.dragging && !s.pinching) {
        // Snap toward target
        if (s.completed) {
          s.targetPullback = 1;
        } else if (p.phase === 'resolve') {
          s.targetPullback = 1;
        } else if (s.targetPullback < COMPLETION_THRESHOLD) {
          // Snap back if not past threshold
          s.targetPullback *= (1 - SNAP_BACK_RATE);
        }
        s.pullback += (s.targetPullback - s.pullback) * 0.08;
      } else {
        s.pullback += (s.targetPullback - s.pullback) * 0.12;
      }

      // Clamp
      s.pullback = Math.max(0, Math.min(1, s.pullback));

      // Step notifications at 25% intervals
      const step = Math.floor(s.pullback * 4);
      if (step > s.lastStepNotified && step > 0) {
        s.lastStepNotified = step;
        cb.onHaptic('step_advance');
      }

      // Completion
      if (s.pullback >= COMPLETION_THRESHOLD && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      cb.onStateChange?.(Math.min(1, s.pullback));

      // ── Exponential Z-axis extraction ─────────────────
      const zFactor = expMap(s.pullback);

      // Screen dimensions: at pullback=0, fills viewport; at 1, tiny rectangle
      const screenScale = 1 - zFactor * 0.88;
      const screenW = w * screenScale;
      const screenH = h * 0.56 * screenScale;
      const screenX = cx - screenW / 2;
      const screenY = cy * (0.35 + zFactor * 0.15) - screenH / 2;

      // ── Draw theater darkness (emerges with pullback) ─
      if (zFactor > 0.05) {
        const theaterAlpha = ALPHA.background.max * zFactor * entrance;

        // Vast dark space
        const darkness = ctx.createRadialGradient(cx, cy * 0.6, px(0.02, minDim), cx, cy * 0.6, px(0.6, minDim));
        darkness.addColorStop(0, rgba(s.primaryRgb, theaterAlpha * 0.15));
        darkness.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = darkness;
        ctx.fillRect(0, 0, w, h);

        // ── Seat rows ─────────────────────────────────
        const seatAlpha = ALPHA.atmosphere.min * Math.min(1, zFactor * 2) * entrance;
        for (let row = 0; row < SEAT_ROWS; row++) {
          const rowT = row / SEAT_ROWS;
          const rowY = screenY + screenH + px(0.04 + rowT * 0.25, minDim) * zFactor;
          const rowWidth = screenW * (1.2 + rowT * 0.8) * Math.min(1, zFactor * 1.5);
          const rowX = cx - rowWidth / 2;
          const seatHeight = px(0.004, minDim) * (1 + rowT * 0.5);

          // Perspective: farther rows slightly dimmer
          const rowAlpha = seatAlpha * (1 - rowT * 0.4);

          ctx.fillStyle = rgba(s.primaryRgb, rowAlpha);
          // Draw individual seats as small rectangles
          const seatCount = 8 + row * 3;
          const seatW = rowWidth / (seatCount * 1.3);
          const gap = (rowWidth - seatW * seatCount) / (seatCount + 1);
          for (let seat = 0; seat < seatCount; seat++) {
            const sx = rowX + gap + seat * (seatW + gap);
            ctx.fillRect(sx, rowY, seatW, seatHeight);
          }
        }
      }

      // ── Draw the "thought screen" ─────────────────────
      // Screen glow (cinema projection light)
      const glowRadius = px(0.15 + (1 - zFactor) * 0.35, minDim);
      const screenGlow = ctx.createRadialGradient(
        cx, screenY + screenH / 2, 0,
        cx, screenY + screenH / 2, glowRadius,
      );
      const glowStrength = ALPHA.glow.max * (0.3 + (1 - zFactor) * 0.4) * entrance;
      screenGlow.addColorStop(0, rgba(s.primaryRgb, glowStrength));
      screenGlow.addColorStop(0.6, rgba(s.primaryRgb, glowStrength * 0.2));
      screenGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = screenGlow;
      ctx.fillRect(0, 0, w, h);

      // Screen border
      const borderAlpha = ALPHA.content.max * 0.4 * entrance * Math.min(1, zFactor * 3);
      if (borderAlpha > 0.005) {
        ctx.strokeStyle = rgba(s.primaryRgb, borderAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.strokeRect(screenX, screenY, screenW, screenH);
      }

      // ── "Thought" content inside screen ───────────────
      ctx.save();
      ctx.beginPath();
      ctx.rect(screenX, screenY, screenW, screenH);
      ctx.clip();

      // Animated chaotic "thought" patterns
      const time = s.frameCount * 0.02 * ms;
      const contentAlpha = ALPHA.content.max * entrance;

      // Agitated wave lines (the overwhelming thought)
      const lineCount = 5;
      for (let i = 0; i < lineCount; i++) {
        const t = i / lineCount;
        const yBase = screenY + screenH * (0.2 + t * 0.6);
        const amplitude = screenH * 0.08 * (1 - zFactor * 0.5);
        const freq = 3 + i * 1.5;
        const phaseOff = i * 1.7 + s.noiseSeed;

        ctx.beginPath();
        for (let x = 0; x <= screenW; x += 3) {
          const nx = x / screenW;
          const wave = Math.sin(nx * freq * Math.PI + time + phaseOff) * amplitude;
          const jitter = Math.sin(nx * 17 + time * 2.3 + i) * amplitude * 0.3 * (1 - zFactor);
          const py = yBase + (wave + jitter) * (1 + breath * 0.05);
          if (x === 0) ctx.moveTo(screenX + x, py);
          else ctx.lineTo(screenX + x, py);
        }

        const lineAlpha = contentAlpha * (0.3 + t * 0.4) * (1 - zFactor * 0.3);
        const lineColor = i % 2 === 0 ? s.primaryRgb : s.accentRgb;
        ctx.strokeStyle = rgba(lineColor, lineAlpha);
        ctx.lineWidth = px(0.002 * (1 - zFactor * 0.5), minDim);
        ctx.stroke();
      }

      // Central pulsing "thought mass"
      const massR = px(0.06 * screenScale, minDim);
      const massCx = screenX + screenW / 2;
      const massCy = screenY + screenH / 2;
      const massGlow = ctx.createRadialGradient(massCx, massCy, 0, massCx, massCy, massR);
      const massPulse = 0.6 + 0.4 * Math.sin(time * 1.5) * ms;
      massGlow.addColorStop(0, rgba(s.accentRgb, contentAlpha * 0.6 * massPulse));
      massGlow.addColorStop(0.5, rgba(s.accentRgb, contentAlpha * 0.2 * massPulse));
      massGlow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = massGlow;
      ctx.fillRect(massCx - massR, massCy - massR, massR * 2, massR * 2);

      ctx.restore(); // end clip

      // ── Pull-back prompt ──────────────────────────────
      if (s.pullback < 0.1 && !s.completed && entrance > 0.8) {
        const promptAlpha = ALPHA.text.min * entrance * (0.5 + 0.5 * Math.sin(s.frameCount * 0.03 * ms));
        ctx.fillStyle = rgba(s.primaryRgb, promptAlpha);
        ctx.font = `${FONT_SIZE.xs(minDim)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('drag down to pull back', cx, h * 0.88);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers (single finger drag) ─────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.dragging = true;
      s.dragStartY = e.clientY;
      s.dragStartPullback = s.targetPullback;
      callbacksRef.current.onHaptic('hold_start');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dy = e.clientY - s.dragStartY;
      // Drag down = pull back
      s.targetPullback = Math.max(0, Math.min(1, s.dragStartPullback + dy * DRAG_SENSITIVITY));
    };

    const onUp = () => {
      const s = stateRef.current;
      s.dragging = false;
      s.pinching = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
