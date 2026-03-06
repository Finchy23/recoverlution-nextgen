/**
 * ATOM 209: THE HOLOGRAPHIC PARALLAX ENGINE
 * ==========================================
 * Series 21 — Metacognitive Mirror · Position 9
 *
 * A tangled knot is just a straight line from the wrong angle. Drag
 * to shift perspective — layers separate to reveal the simple truth.
 *
 * PHYSICS:
 *   - Overlapping tangled lines appear chaotic when viewed flat
 *   - Drag horizontally to shift the viewing angle
 *   - Parallax separates layers — tangled illusion dissolves
 *   - At the right angle, lines align into clean parallel paths
 *   - Resolution: chaos was just a perspective problem
 *
 * INTERACTION:
 *   Horizontal drag → shifts parallax viewing angle
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static resolved state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const LAYER_COUNT = 5;
const DRAG_SENSITIVITY = 0.003;
const SOLUTION_ANGLE = 0.75; // target angle for resolution
const TOLERANCE = 0.08;

interface ParallaxLayer {
  baseX: number; // layer offset factor
  color: number; // 0=primary, 1=accent, 0.5=mix
  points: { x: number; y: number }[];
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function HolographicParallaxAtom({
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
    // Viewing angle: 0–1 normalized
    angle: 0,
    // Interaction
    dragging: false,
    dragStartX: 0,
    dragStartAngle: 0,
    // State
    resolved: false,
    resolveGlow: 0,
    stepNotified: false,
    // Layers
    layers: [] as ParallaxLayer[],
    initialized: false,
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

      // ── Init layers ───────────────────────────────────
      if (!s.initialized) {
        s.layers = [];
        for (let i = 0; i < LAYER_COUNT; i++) {
          const t = i / (LAYER_COUNT - 1);
          // Each layer has a smooth curve that looks tangled when overlaid
          const pts: { x: number; y: number }[] = [];
          const yBase = 0.25 + t * 0.5;
          for (let j = 0; j <= 20; j++) {
            pts.push({
              x: j / 20,
              y: yBase + Math.sin(j * 0.5 + i * 1.3) * 0.08 + Math.cos(j * 0.3 + i * 2.1) * 0.05,
            });
          }
          s.layers.push({
            baseX: (t - 0.5) * 0.3, // parallax displacement factor
            color: t,
            points: pts,
          });
        }
        s.initialized = true;
      }

      // ── Auto-resolve ──────────────────────────────────
      if (p.phase === 'resolve' && !s.resolved) {
        s.angle += (SOLUTION_ANGLE - s.angle) * 0.03;
      }

      // ── Check resolution ──────────────────────────────
      const closeness = 1 - Math.abs(s.angle - SOLUTION_ANGLE) / SOLUTION_ANGLE;
      const nearSolution = Math.abs(s.angle - SOLUTION_ANGLE) < TOLERANCE;

      if (nearSolution && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
      }

      if (closeness > 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.02 * ms);
      }

      cb.onStateChange?.(s.resolved ? 1 : closeness * 0.9);

      // ── Draw layers with parallax ─────────────────────
      const viewAngle = s.angle;

      for (let i = 0; i < s.layers.length; i++) {
        const layer = s.layers[i];
        const parallaxOffset = layer.baseX * viewAngle * w;

        // When resolved, layers separate cleanly
        const separationY = s.resolved ? s.resolveGlow * 0.02 * (i - LAYER_COUNT / 2) : 0;

        const layerColor = lerpColor(s.primaryRgb, s.accentRgb, layer.color);
        const layerAlpha = ALPHA.content.max * entrance * (0.4 + (s.resolved ? s.resolveGlow * 0.4 : 0));

        ctx.beginPath();
        for (let j = 0; j < layer.points.length; j++) {
          const pt = layer.points[j];
          const px2 = pt.x * w + parallaxOffset;
          const py2 = (pt.y + separationY) * h;
          if (j === 0) ctx.moveTo(px2, py2);
          else ctx.lineTo(px2, py2);
        }
        ctx.strokeStyle = rgba(layerColor, layerAlpha);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();

        // Layer depth indicator (small dot at start)
        if (s.resolved && s.resolveGlow > 0.5) {
          const startPt = layer.points[0];
          const dotX = startPt.x * w + parallaxOffset;
          const dotY = (startPt.y + separationY) * h;
          ctx.beginPath();
          ctx.arc(dotX, dotY, px(0.004, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(layerColor, layerAlpha * 0.8);
          ctx.fill();
        }
      }

      // ── Resolution glow ───────────────────────────────
      if (s.resolveGlow > 0) {
        const glowR = px(0.2 * s.resolveGlow, minDim);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.resolveGlow * entrance));
        glow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
      }

      // ── Angle indicator ───────────────────────────────
      const indicatorY = h * 0.92;
      const indicatorW = w * 0.3;
      const indicatorX = cx - indicatorW / 2;
      const indicatorAlpha = ALPHA.atmosphere.min * entrance * (s.resolved ? 0.3 : 0.7);

      // Track
      ctx.fillStyle = rgba(s.primaryRgb, indicatorAlpha * 0.3);
      ctx.fillRect(indicatorX, indicatorY, indicatorW, px(0.002, minDim));

      // Cursor
      const cursorX = indicatorX + s.angle * indicatorW;
      ctx.beginPath();
      ctx.arc(cursorX, indicatorY, px(0.005, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, indicatorAlpha);
      ctx.fill();

      // Target zone
      const targetX = indicatorX + SOLUTION_ANGLE * indicatorW;
      ctx.beginPath();
      ctx.arc(targetX, indicatorY, px(0.008, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, indicatorAlpha * 0.5);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      s.dragStartX = e.clientX;
      s.dragStartAngle = s.angle;
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.dragStartX;
      s.angle = Math.max(0, Math.min(1, s.dragStartAngle + dx * DRAG_SENSITIVITY));
    };

    const onUp = () => {
      stateRef.current.dragging = false;
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }}
      />
    </div>
  );
}
