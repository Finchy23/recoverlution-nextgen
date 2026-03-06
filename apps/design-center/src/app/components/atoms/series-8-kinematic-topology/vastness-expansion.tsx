/**
 * ATOM 077: THE VASTNESS ENGINE
 * ================================
 * Series 8 — Kinematic Topology · Position 7
 *
 * Claustrophobia of the mind. The walls close in. Place two
 * fingers and push outward. The walls yield, the vignette
 * dissolves, and a warm expansive background is revealed.
 *
 * PHYSICS:
 *   - Heavy dark vignette (4 wall panels closing inward)
 *   - Pinch-out (or single-finger outward drag) repels walls
 *   - Elastic overshoot when walls reach full extension
 *   - Warm ambient background revealed behind walls
 *   - Breath coupling: subtle wall pulse
 *
 * INTERACTION:
 *   Pinch-out / drag outward → push walls away
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Tap toggles between closed/open
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

const WALL_COLOR: RGB = [30, 25, 40];
const WALL_EDGE: RGB = [50, 45, 60];
const WARM_BG: RGB = [160, 130, 90];
const WARM_GLOW: RGB = [200, 170, 110];
const BG_BASE: RGB = [18, 16, 24];

export default function VastnessExpansionAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    openT: 0, // 0 = closed, 1 = fully open
    targetOpenT: 0,
    pointers: new Map<number, { x: number; y: number }>(),
    initialPinchDist: 0,
    singleDragStartDist: 0,
    isSingleDragging: false,
    lastDetent: -1,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (propsRef.current.reducedMotion) {
        s.targetOpenT = s.targetOpenT < 0.5 ? 1 : 0;
        if (s.targetOpenT >= 1 && !s.resolved) {
          s.resolved = true; onHaptic('completion'); onResolve?.();
        }
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.pointers.set(e.pointerId, { x: px, y: py });
      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        s.initialPinchDist = Math.sqrt(dx * dx + dy * dy);
      } else if (s.pointers.size === 1) {
        const cx = w / 2;
        const cy = h / 2;
        s.singleDragStartDist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        s.isSingleDragging = true;
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      if (!s.pointers.has(e.pointerId)) return;
      s.pointers.set(e.pointerId, { x: px, y: py });
      const maxDelta = minDim * 0.3;
      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = dist - s.initialPinchDist;
        s.targetOpenT = Math.max(0, Math.min(1, delta / maxDelta));
      } else if (s.isSingleDragging) {
        const cx = w / 2;
        const cy = h / 2;
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        const delta = dist - s.singleDragStartDist;
        s.targetOpenT = Math.max(s.targetOpenT, Math.min(1, delta / maxDelta));
      }
      const detent = Math.floor(s.targetOpenT * 4);
      if (detent !== s.lastDetent && detent > s.lastDetent) {
        s.lastDetent = detent;
        onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.pointers.delete(e.pointerId);
      s.isSingleDragging = false;
      if (s.targetOpenT > 0.85 && !s.resolved) {
        s.targetOpenT = 1; s.resolved = true;
        onHaptic('completion'); onResolve?.();
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf: number;
    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const oLerp = p.reducedMotion ? 0.3 : 0.04;
      s.openT += (s.targetOpenT - s.openT) * oLerp;
      onStateChange?.(s.openT);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Warm background (revealed as walls open)
      const warmCol = lerpColor(WARM_BG, primaryRgb, 0.04);
      const warmAlpha = ELEMENT_ALPHA.secondary.max * ent * s.openT;
      const warmGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.5);
      warmGrad.addColorStop(0, rgba(lerpColor(WARM_GLOW, primaryRgb, 0.04), warmAlpha));
      warmGrad.addColorStop(1, rgba(warmCol, warmAlpha * 0.3));
      ctx.fillStyle = warmGrad;
      ctx.fillRect(0, 0, w, h);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03 * (1 - s.openT * 0.5)));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015 * (1 - s.openT * 0.5)));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Breath pulse
      const breathPulse = p.reducedMotion ? 0 : p.breathAmplitude * minDim * 0.005;

      // Wall panels — 4 walls that retract outward
      const wallThickness = minDim * 0.35;
      const wallOffset = s.openT * (wallThickness + minDim * 0.1) + breathPulse;
      const wallCol = lerpColor(WALL_COLOR, primaryRgb, 0.02);
      const wallEdgeCol = lerpColor(WALL_EDGE, primaryRgb, 0.03);
      const wallAlpha = ELEMENT_ALPHA.primary.max * ent * (1 - s.openT * 0.6);

      // Left wall
      ctx.fillStyle = rgba(wallCol, wallAlpha);
      ctx.fillRect(-wallThickness + wallThickness * 0.3 - wallOffset, 0, wallThickness, h);
      // Right wall
      ctx.fillRect(w - wallThickness * 0.3 + wallOffset, 0, wallThickness, h);
      // Top wall
      ctx.fillRect(0, -wallThickness + wallThickness * 0.3 - wallOffset, w, wallThickness);
      // Bottom wall
      ctx.fillRect(0, h - wallThickness * 0.3 + wallOffset, w, wallThickness);

      // Wall edges (inner edges visible)
      ctx.strokeStyle = rgba(wallEdgeCol, ELEMENT_ALPHA.secondary.min * ent * (1 - s.openT));
      ctx.lineWidth = minDim * 0.0006;
      // Left edge
      ctx.beginPath();
      ctx.moveTo(wallThickness * 0.3 - wallOffset, 0);
      ctx.lineTo(wallThickness * 0.3 - wallOffset, h);
      ctx.stroke();
      // Right edge
      ctx.beginPath();
      ctx.moveTo(w - wallThickness * 0.3 + wallOffset, 0);
      ctx.lineTo(w - wallThickness * 0.3 + wallOffset, h);
      ctx.stroke();

      // Instruction
      if (s.openT < 0.1 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(WALL_EDGE, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText(p.reducedMotion ? 'tap to push the walls away' : 'spread to push the walls away', cx, cy);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none' }}
    />
  );
}