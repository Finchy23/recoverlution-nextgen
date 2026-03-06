/**
 * ATOM 288: THE THERMAL BOUNDARY ENGINE
 * ========================================
 * Series 29 — Interoceptive Anchor · Position 8
 *
 * Where do you end and the world begin? Trace the outline
 * of your hand on the glass — draw the perimeter of your safety.
 * A warm thermal glow follows the drawing path.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - Drawing path generates topographic thermal contours that
 *     radiate outward from the boundary like heat elevation lines
 *   - Enclosed area fills with Chladni resonance pattern — the
 *     body's inner resonance made visible within your perimeter
 *   - Teaches: drawing your boundary creates inner resonance
 *
 * PHYSICS:
 *   - Drag to draw continuous thermal boundary on glass
 *   - Trail renders as warm gradient with heat dissipation
 *   - Thermal contours emanate outward from the drawn path
 *   - When path closes → enclosed area fills with Chladni pattern
 *   - Heat particles rise from the boundary line
 *   - 8 layers: thermal contours, Chladni fill, enclosed glow,
 *     trail path with glow, start indicator, drawing cursor,
 *     heat particles, completion radiance
 *   - Breath couples to: contour warmth, heat intensity, fill glow
 *
 * INTERACTION:
 *   Draw continuous path (drag_snap → step_advance → completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static closed warm boundary with Chladni fill
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Trail stroke width (fraction of minDim) */
const TRAIL_WIDTH = STROKE.bold;
/** Distance threshold for closing the path (fraction) */
const CLOSE_DISTANCE = 0.04;
/** Minimum points before close detection */
const MIN_POINTS = 15;
/** Heat particle rise speed */
const HEAT_PARTICLE_SPEED = 0.001;
/** Heat particle lifespan in frames */
const HEAT_PARTICLE_LIFE = 45;
/** Maximum concurrent heat particles */
const MAX_HEAT_PARTICLES = 40;
/** Thermal contour count (radiating from trail) */
const THERMAL_CONTOUR_COUNT = 6;
/** Thermal contour spacing (fraction of minDim) */
const THERMAL_CONTOUR_SPACING = 0.012;
/** Chladni grid resolution for enclosed fill */
const CHLADNI_RES = 20;
/** Chladni threshold */
const CHLADNI_THRESH = 0.16;
/** Chladni dot radius */
const CHLADNI_DOT = 0.0025;
/** Glow layers for trail path */
const TRAIL_GLOW_LAYERS = 3;
/** Breath warmth coupling */
const BREATH_WARMTH = 0.06;
/** Breath heat intensity coupling */
const BREATH_HEAT = 0.04;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Point on the drawn boundary trail */
interface TrailPoint { x: number; y: number; }

/** Rising heat particle from the boundary */
interface HeatParticle {
  x: number; y: number;
  vy: number; life: number;
  size: number; phase: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Draw thermal contour lines radiating outward from the trail path.
 * Each contour is an expanded version of the trail at increasing distance.
 */
function drawThermalContours(
  ctx: CanvasRenderingContext2D,
  trail: TrailPoint[], w: number, h: number, minDim: number,
  rgb: RGB, entrance: number, frame: number, breathAmp: number,
): void {
  if (trail.length < 5) return;
  for (let c = 0; c < THERMAL_CONTOUR_COUNT; c++) {
    const offset = (c + 1) * THERMAL_CONTOUR_SPACING;
    const breathMod = breathAmp * BREATH_WARMTH * 0.2 * Math.sin(c * 0.5 + frame * 0.004);
    const dist = px(offset + breathMod, minDim);
    const alpha = ALPHA.atmosphere.max * 0.2 * (1 - c / THERMAL_CONTOUR_COUNT) * entrance;

    // For each contour, offset the trail outward from centroid
    const centroid = trail.reduce(
      (a, p) => ({ x: a.x + p.x / trail.length, y: a.y + p.y / trail.length }),
      { x: 0, y: 0 }
    );

    ctx.beginPath();
    for (let i = 0; i < trail.length; i++) {
      const pt = trail[i];
      const dx = pt.x - centroid.x;
      const dy = pt.y - centroid.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const ox = pt.x * w + (dx / d) * dist;
      const oy = pt.y * h + (dy / d) * dist;
      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(c % 2 === 0 ? STROKE.thin : STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw Chladni resonance pattern inside the enclosed boundary.
 */
function drawEnclosedChladni(
  ctx: CanvasRenderingContext2D,
  trail: TrailPoint[], w: number, h: number, minDim: number,
  rgb: RGB, entrance: number, closeProgress: number,
): void {
  if (trail.length < 5 || closeProgress < 0.2) return;
  const vis = (closeProgress - 0.2) / 0.8;

  // Bounding box of trail
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const pt of trail) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  const n = 3; const m = 4;
  const dotR = px(CHLADNI_DOT, minDim);

  for (let xi = 0; xi < CHLADNI_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_RES; yi++) {
      const nx = (xi / (CHLADNI_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_RES - 1)) * 2 - 1;
      const val = Math.abs(
        Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny) -
        Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny)
      );
      if (val < CHLADNI_THRESH) {
        // Map to bounding box
        const px2 = minX + (xi / (CHLADNI_RES - 1)) * (maxX - minX);
        const py2 = minY + (yi / (CHLADNI_RES - 1)) * (maxY - minY);
        // Simple point-in-polygon check (ray casting)
        let inside = false;
        for (let i = 0, j = trail.length - 1; i < trail.length; j = i++) {
          const xi2 = trail[i].x, yi2 = trail[i].y;
          const xj = trail[j].x, yj = trail[j].y;
          if ((yi2 > py2) !== (yj > py2) &&
            px2 < (xj - xi2) * (py2 - yi2) / (yj - yi2) + xi2) {
            inside = !inside;
          }
        }
        if (inside) {
          const x = px2 * w;
          const y = py2 * h;
          const intensity = (1 - val / CHLADNI_THRESH) * vis;
          ctx.beginPath();
          ctx.arc(x, y, dotR * (0.4 + intensity * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.1 * intensity * entrance);
          ctx.fill();
        }
      }
    }
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ThermalBoundaryAtom({
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
    trail: [] as TrailPoint[],
    drawing: false,
    closed: false,
    closeProgress: 0,
    heatParticles: [] as HeatParticle[],
    dragNotified: false,
    stepNotified: false,
    completed: false,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb, p.breathAmplitude * BREATH_WARMTH);

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        const oR = px(SIZE.md, minDim);
        // Static contours
        for (let c = 0; c < 4; c++) {
          const r = oR * (1 + c * 0.15);
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 1.2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.1 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
        // Boundary
        ctx.beginPath();
        ctx.ellipse(cx, cy, oR, oR * 1.2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(TRAIL_WIDTH, minDim);
        ctx.stroke();
        // Fill
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, oR);
        fg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.15 * entrance));
        fg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.05 * entrance));
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(cx - oR, cy - oR * 1.2, oR * 2, oR * 2.4);
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // Close progress animation
      if (s.closed) s.closeProgress = Math.min(1, s.closeProgress + 0.015 * ms);

      // Heat particles
      if (s.trail.length > 5) {
        if (s.frameCount % 4 === 0 && s.heatParticles.length < MAX_HEAT_PARTICLES) {
          const idx = Math.floor(Math.random() * s.trail.length);
          const pt = s.trail[idx];
          s.heatParticles.push({
            x: pt.x + (Math.random() - 0.5) * 0.01,
            y: pt.y,
            vy: -HEAT_PARTICLE_SPEED * (0.5 + Math.random()) * (1 + p.breathAmplitude * BREATH_HEAT),
            life: HEAT_PARTICLE_LIFE,
            size: 0.002 + Math.random() * 0.004,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
      for (let i = s.heatParticles.length - 1; i >= 0; i--) {
        const hp = s.heatParticles[i];
        hp.y += hp.vy * ms;
        hp.x += Math.sin(hp.phase + s.frameCount * 0.03) * 0.0002;
        hp.life -= ms;
        if (hp.life <= 0) s.heatParticles.splice(i, 1);
      }

      cb.onStateChange?.(s.completed ? 1 :
        s.closed ? 0.7 + s.closeProgress * 0.3 :
        Math.min(0.7, s.trail.length / 50));

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Thermal contour lines (radiating from trail)
      // ═══════════════════════════════════════════════════════════════
      if (s.trail.length > 5) {
        drawThermalContours(ctx, s.trail, w, h, minDim,
          s.primaryRgb, entrance, s.frameCount, p.breathAmplitude);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni resonance fill (when closed)
      // ═══════════════════════════════════════════════════════════════
      if (s.closed) {
        drawEnclosedChladni(ctx, s.trail, w, h, minDim,
          warmRgb, entrance, s.closeProgress);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Enclosed area warm glow (when closed)
      // ═══════════════════════════════════════════════════════════════
      if (s.closed && s.trail.length > 3) {
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x * w, s.trail[0].y * h);
        for (let i = 1; i < s.trail.length; i++) {
          ctx.lineTo(s.trail[i].x * w, s.trail[i].y * h);
        }
        ctx.closePath();

        const centroid = s.trail.reduce(
          (a, p2) => ({ x: a.x + p2.x / s.trail.length, y: a.y + p2.y / s.trail.length }),
          { x: 0, y: 0 });
        const fillR = px(SIZE.md * s.closeProgress, minDim);
        const fg = ctx.createRadialGradient(
          centroid.x * w, centroid.y * h, 0,
          centroid.x * w, centroid.y * h, fillR);
        fg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.15 * s.closeProgress * entrance));
        fg.addColorStop(0.4, rgba(warmRgb, ALPHA.glow.max * 0.06 * s.closeProgress * entrance));
        fg.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * s.closeProgress * entrance));
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Trail path with glow + gradient stroke
      // ═══════════════════════════════════════════════════════════════
      if (s.trail.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Trail glow (atmospheric haze along path)
        for (let i = 0; i < s.trail.length; i += 3) {
          const pt = s.trail[i];
          const gR = px(0.018, minDim);
          const gg = ctx.createRadialGradient(pt.x * w, pt.y * h, 0, pt.x * w, pt.y * h, gR);
          gg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.05 * entrance));
          gg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.015 * entrance));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(pt.x * w - gR, pt.y * h - gR, gR * 2, gR * 2);
        }

        // Trail stroke with progressive thickness + alpha
        for (let i = 1; i < s.trail.length; i++) {
          const t = i / s.trail.length;
          const lw = px(TRAIL_WIDTH * (0.5 + t * 0.6), minDim);
          ctx.beginPath();
          ctx.moveTo(s.trail[i - 1].x * w, s.trail[i - 1].y * h);
          ctx.lineTo(s.trail[i].x * w, s.trail[i].y * h);
          ctx.strokeStyle = rgba(warmRgb,
            ALPHA.content.max * (0.15 + t * 0.2 + s.closeProgress * 0.1) * entrance);
          ctx.lineWidth = lw;
          ctx.stroke();
        }
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Start point indicator (pulsing dot + close zone)
      // ═══════════════════════════════════════════════════════════════
      if (s.trail.length > 0 && !s.closed) {
        const sp = s.trail[0];
        const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.04);
        // Glow
        const sgR = px(0.015, minDim);
        const sg = ctx.createRadialGradient(sp.x * w, sp.y * h, 0, sp.x * w, sp.y * h, sgR);
        sg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.1 * pulse * entrance));
        sg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(sp.x * w - sgR, sp.y * h - sgR, sgR * 2, sgR * 2);
        // Dot
        ctx.beginPath();
        ctx.arc(sp.x * w, sp.y * h, px(0.008, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmRgb, ALPHA.content.max * 0.2 * pulse * entrance);
        ctx.fill();
        // Close zone ring
        ctx.beginPath();
        ctx.arc(sp.x * w, sp.y * h, px(CLOSE_DISTANCE * 0.8, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.setLineDash([px(0.004, minDim), px(0.004, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Drawing cursor (active drawing tip)
      // ═══════════════════════════════════════════════════════════════
      if (s.drawing && s.trail.length > 0) {
        const last = s.trail[s.trail.length - 1];
        const curR = px(0.006, minDim);
        // Cursor glow
        const cg = ctx.createRadialGradient(last.x * w, last.y * h, 0, last.x * w, last.y * h, curR * 3);
        cg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.15 * entrance));
        cg.addColorStop(0.5, rgba(warmRgb, ALPHA.glow.max * 0.04 * entrance));
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(last.x * w - curR * 3, last.y * h - curR * 3, curR * 6, curR * 6);
        // Cursor dot
        ctx.beginPath();
        ctx.arc(last.x * w, last.y * h, curR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmRgb, ALPHA.content.max * 0.35 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Heat particles (rising from boundary)
      // ═══════════════════════════════════════════════════════════════
      for (const hp of s.heatParticles) {
        const lr = hp.life / HEAT_PARTICLE_LIFE;
        const hR = px(hp.size * lr, minDim);
        // Particle glow
        const glowR = hR * 3;
        const hg = ctx.createRadialGradient(hp.x * w, hp.y * h, 0, hp.x * w, hp.y * h, glowR);
        hg.addColorStop(0, rgba(warmRgb, ALPHA.content.max * 0.08 * lr * entrance));
        hg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.02 * lr * entrance));
        hg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = hg;
        ctx.fillRect(hp.x * w - glowR, hp.y * h - glowR, glowR * 2, glowR * 2);
        // Particle body
        ctx.beginPath();
        ctx.arc(hp.x * w, hp.y * h, hR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmRgb, ALPHA.content.max * 0.12 * lr * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Completion radiance + seal
      // ═══════════════════════════════════════════════════════════════
      if (s.completed && s.trail.length > 3) {
        const centroid = s.trail.reduce(
          (a, p2) => ({ x: a.x + p2.x / s.trail.length, y: a.y + p2.y / s.trail.length }),
          { x: 0, y: 0 });
        const cxP = centroid.x * w;
        const cyP = centroid.y * h;

        // Completion bloom rings
        for (let i = 0; i < 3; i++) {
          const rPhase = (s.frameCount * 0.004 + i * 0.33) % 1;
          const rR = px(SIZE.sm * (0.5 + rPhase * 0.8), minDim);
          ctx.beginPath();
          ctx.arc(cxP, cyP, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.05 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // Center glow
        const cgR = px(SIZE.sm * 0.3 * s.closeProgress, minDim);
        const cg = ctx.createRadialGradient(cxP, cyP, 0, cxP, cyP, cgR);
        cg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.12 * s.closeProgress * entrance));
        cg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * s.closeProgress * entrance));
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(cxP - cgR, cyP - cgR, cgR * 2, cgR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.closed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      s.drawing = true;
      s.trail = [{ x: mx, y: my }];
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing || s.closed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const last = s.trail[s.trail.length - 1];
      if (Math.hypot(mx - last.x, my - last.y) < 0.008) return;

      s.trail.push({ x: mx, y: my });

      if (s.trail.length === 25 && !s.stepNotified) {
        s.stepNotified = true;
        callbacksRef.current.onHaptic('step_advance');
      }

      if (s.trail.length > MIN_POINTS) {
        const start = s.trail[0];
        const dist = Math.hypot(mx - start.x, my - start.y);
        if (dist < CLOSE_DISTANCE) {
          s.closed = true;
          s.drawing = false;
          s.completed = true;
          callbacksRef.current.onHaptic('completion');
        }
      }
    };

    const onUp = () => { stateRef.current.drawing = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
