/**
 * ATOM 016: THE UNCERTAINTY BLUR ENGINE
 * =======================================
 * Series 2 — Quantum Mechanics · Position 6
 *
 * The obsession with knowing exactly what will happen creates
 * paralysis. Heisenberg's Uncertainty Principle made tactile:
 * you cannot simultaneously know position AND momentum. The act
 * of measuring destroys the thing you're measuring.
 *
 * A beautiful crystalline structure exists at a comfortable
 * viewing distance. Zoom in (scroll / drag / pinch) — it BLURS.
 * The harder you try to see the details, the more they evade you.
 * Pull back, accept the gist, and the structure becomes razor-sharp.
 *
 * PHYSICS:
 *   - Nested geometric crystal structure (sacred geometry)
 *   - Zoom mapped INVERSELY to blur
 *   - Zoom in → blur increases exponentially
 *   - Zoom out (or rest) → clarity increases, sharpens
 *   - Particles scatter with zoom (momentum uncertainty)
 *   - Particles lock when relaxed (position certainty)
 *   - The "comfortable zone" ~1x is where truth lives
 *
 * INTERACTION:
 *   Scroll / Drag vertical / Pinch → inverse blur response
 *   Observable → crystal rotates gently, clear at rest
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static crystal, no rotation, direct blur response
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of crystal vertices per ring */
const VERTICES_PER_RING = 6;
/** Number of concentric crystal rings */
const RING_COUNT = 5;
/** Ring spacing as fraction of min dimension */
const RING_SPACING_FRAC = 0.04;
/** Base crystal radius as fraction of min dimension */
const CRYSTAL_BASE_R_FRAC = 0.06;
/** Orbital particle count */
const ORBITAL_COUNT = 40;
/** Maximum zoom before saturation */
const MAX_ZOOM = 3;
/** Blur exponent — how aggressively blur scales with zoom */
const BLUR_EXPONENT = 2.5;
/** Maximum blur radius as fraction of minDim */
const MAX_BLUR_FRAC = 0.07;
/** Clarity zone center (zoom level where things are sharpest) */
const CLARITY_CENTER = 1.0;
/** How fast zoom decays back to 1 when not interacting */
const ZOOM_DECAY = 0.015;
/** Rotation speed */
const ROTATION_SPEED = 0.003;
/** Scatter strength (how much particles flee zoom) */
const SCATTER_STRENGTH = 0.15;
/** Drag-to-zoom sensitivity (normalised pixels → zoom units) */
const DRAG_ZOOM_SENSITIVITY = 0.005;

// =====================================================================
// CRYSTAL GEOMETRY
// =====================================================================

interface CrystalVertex {
  angle: number;
  ring: number;
  homeR: number;
  currentR: number;
  size: number;
  brightness: number;
  scatterAngle: number;
}

function createCrystal(minDim: number): CrystalVertex[] {
  const vertices: CrystalVertex[] = [];
  const baseR = minDim * CRYSTAL_BASE_R_FRAC;

  for (let ring = 0; ring < RING_COUNT; ring++) {
    const ringR = baseR + ring * minDim * RING_SPACING_FRAC;
    const count = VERTICES_PER_RING + ring * 2;
    const angleOffset = ring * Math.PI / VERTICES_PER_RING;

    for (let v = 0; v < count; v++) {
      const angle = (v / count) * Math.PI * 2 + angleOffset;
      vertices.push({
        angle,
        ring,
        homeR: ringR,
        currentR: ringR,
        size: minDim * (0.003 + (RING_COUNT - ring) * 0.0008),
        brightness: 0.4 + (RING_COUNT - ring) * 0.1 + Math.random() * 0.2,
        scatterAngle: angle + (Math.random() - 0.5) * 0.5,
      });
    }
  }

  return vertices;
}

interface Orbital {
  angle: number;
  r: number;
  speed: number;
  size: number;
  brightness: number;
  phase: number;
}

function createOrbitals(minDim: number): Orbital[] {
  const orbitals: Orbital[] = [];
  for (let i = 0; i < ORBITAL_COUNT; i++) {
    orbitals.push({
      angle: Math.random() * Math.PI * 2,
      r: 0.12 + Math.random() * 0.2,
      speed: 0.002 + Math.random() * 0.006,
      size: minDim * (0.001 + Math.random() * 0.003),
      brightness: 0.15 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return orbitals;
}

// =====================================================================
// COLOR
// =====================================================================

const CRYSTAL_CLEAR: RGB = [190, 200, 240];
const CRYSTAL_BLURRED: RGB = [120, 110, 170];
const CONNECTION_COLOR: RGB = [150, 145, 200];
const ORBITAL_COLOR: RGB = [140, 150, 210];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function UncertaintyBlurAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange };
  }, [onHaptic, onStateChange]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Single effect: native events + rAF loop ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);
    const maxBlurPx = minDim * MAX_BLUR_FRAC;

    // ── Mutable state ──────────────────────────────────
    const s = {
      crystal: createCrystal(minDim),
      orbitals: createOrbitals(minDim),
      currentZoom: 1,
      targetZoom: 1,
      isInteracting: false,
      // Pointer drag state
      pointerDown: false,
      lastPointerY: 0,
      pointerId: -1,
      // Pinch state
      touches: new Map<number, { x: number; y: number }>(),
      lastPinchDist: 0,
      isPinching: false,
      // Blur / rotation
      currentBlur: 0,
      rotation: 0,
      lastStepIndex: 0,
      entranceProgress: 0,
      frameCount: 0,
      primaryRgb: parseColor(color),
      accentRgb: parseColor(accentColor),
    };

    // ── Pointer handlers (drag vertical = zoom) ────────
    const onPointerDown = (e: PointerEvent) => {
      if (s.isPinching) return;
      s.pointerDown = true;
      s.lastPointerY = e.clientY;
      s.pointerId = e.pointerId;
      s.isInteracting = true;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.pointerDown || s.isPinching) return;
      const dy = e.clientY - s.lastPointerY;
      // Drag up = zoom in (increase), drag down = zoom out (decrease)
      s.targetZoom = Math.max(0.3, Math.min(MAX_ZOOM, s.targetZoom - dy * DRAG_ZOOM_SENSITIVITY));
      s.lastPointerY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId === s.pointerId) {
        s.pointerDown = false;
        s.isInteracting = false;
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    // ── Wheel handler (needs { passive: false }) ───────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.isInteracting = true;
      s.targetZoom = Math.max(0.3, Math.min(MAX_ZOOM, s.targetZoom + e.deltaY * 0.003));
      // Release after a short idle
      clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => { s.isInteracting = false; }, 200);
    };
    let wheelTimer = 0;

    // ── Touch handlers (pinch-to-zoom) ─────────────────
    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        s.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (s.touches.size >= 2) {
        const pts = Array.from(s.touches.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        s.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
        s.isPinching = true;
        s.isInteracting = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        s.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (s.isPinching && s.touches.size >= 2) {
        const pts = Array.from(s.touches.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / Math.max(1, s.lastPinchDist);
        s.targetZoom = Math.max(0.3, Math.min(MAX_ZOOM, s.targetZoom * ratio));
        s.lastPinchDist = dist;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        s.touches.delete(e.changedTouches[i].identifier);
      }
      if (s.touches.size < 2) {
        s.isPinching = false;
        s.isInteracting = false;
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    // ── Animation loop ─────────────────────────────────
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      s.primaryRgb = parseColor(p.color);
      s.accentRgb = parseColor(p.accentColor);

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      const centerX = w / 2;
      const centerY = h / 2;

      // ── Entrance ──────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Zoom physics ──────────────────────────────
      if (!s.isInteracting) {
        s.targetZoom += (CLARITY_CENTER - s.targetZoom) * ZOOM_DECAY;
      }
      s.currentZoom += (s.targetZoom - s.currentZoom) * 0.08;

      // ── Blur computation (INVERSE of zoom clarity) ─
      const zoomDelta = Math.abs(s.currentZoom - CLARITY_CENTER);
      const blurNorm = Math.min(1, Math.pow(zoomDelta / (MAX_ZOOM - CLARITY_CENTER), BLUR_EXPONENT));
      const targetBlur = blurNorm * maxBlurPx;
      s.currentBlur += (targetBlur - s.currentBlur) * 0.12;

      const clarity = Math.max(0, 1 - s.currentBlur / maxBlurPx);
      cb.onStateChange?.(clarity);

      // ── Step advance haptics ──────────────────────
      const stepIndex = Math.floor(clarity * 5);
      if (stepIndex !== s.lastStepIndex) {
        cb.onHaptic('step_advance');
        s.lastStepIndex = stepIndex;
      }

      // ── Crystal rotation ──────────────────────────
      if (!p.reducedMotion) {
        s.rotation += ROTATION_SPEED;
      }

      // ── Scatter ───────────────────────────────────
      const scatter = blurNorm * SCATTER_STRENGTH * minDim;

      // ══════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════

      // ── Background ────────────────────────────────
      const bgBase = lerpColor([4, 3, 12], s.primaryRgb, 0.03);
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Blur haze
      if (s.currentBlur > minDim * 0.004) {
        const hazeAlpha = (s.currentBlur / maxBlurPx) * 0.06 * entrance;
        const hazeColor = lerpColor(CRYSTAL_BLURRED, s.primaryRgb, 0.2);
        const hazeGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, minDim * 0.4);
        hazeGrad.addColorStop(0, rgba(hazeColor, hazeAlpha));
        hazeGrad.addColorStop(0.6, rgba(hazeColor, hazeAlpha * 0.3));
        hazeGrad.addColorStop(1, rgba(hazeColor, 0));
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Crystal vertices ──────────────────────────
      const zoomScale = s.currentZoom;
      const blurAmount = s.currentBlur;

      const vertexColor = lerpColor(
        lerpColor(CRYSTAL_CLEAR, s.accentRgb, 0.15),
        lerpColor(CRYSTAL_BLURRED, s.primaryRgb, 0.15),
        blurNorm,
      );

      // Draw connections first
      if (clarity > 0.3) {
        const connAlpha = (clarity - 0.3) * 0.08 * entrance;
        const connColor = lerpColor(CONNECTION_COLOR, s.primaryRgb, 0.15);
        ctx.lineWidth = minDim * (0.0006 + clarity * 0.001);

        for (let i = 0; i < s.crystal.length; i++) {
          const a = s.crystal[i];
          const ax = centerX + Math.cos(a.angle + s.rotation) * a.currentR * zoomScale;
          const ay = centerY + Math.sin(a.angle + s.rotation) * a.currentR * zoomScale;

          for (let j = i + 1; j < s.crystal.length; j++) {
            const b = s.crystal[j];
            if (b.ring !== a.ring && Math.abs(b.ring - a.ring) > 1) continue;
            if (b.ring === a.ring) {
              const angleDiff = Math.abs(b.angle - a.angle);
              if (angleDiff > Math.PI * 2 / (VERTICES_PER_RING + a.ring * 2) * 1.5 &&
                  angleDiff < Math.PI * 2 - 0.1) continue;
            }
            const bx = centerX + Math.cos(b.angle + s.rotation) * b.currentR * zoomScale;
            const by = centerY + Math.sin(b.angle + s.rotation) * b.currentR * zoomScale;
            const dist = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
            if (dist > minDim * 0.1 * zoomScale) continue;

            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = rgba(connColor, connAlpha * (1 - dist / (minDim * 0.1 * zoomScale)));
            ctx.stroke();
          }
        }
      }

      // Draw crystal vertices
      for (const vertex of s.crystal) {
        const targetR = vertex.homeR + (blurNorm > 0.1
          ? Math.sin(vertex.scatterAngle * 3) * scatter
          : 0);
        vertex.currentR += (targetR - vertex.currentR) * 0.08;

        const vx = centerX + Math.cos(vertex.angle + s.rotation) * vertex.currentR * zoomScale;
        const vy = centerY + Math.sin(vertex.angle + s.rotation) * vertex.currentR * zoomScale;

        const vAlpha = vertex.brightness * entrance * (0.2 + clarity * 0.6);

        if (blurAmount > minDim * 0.006) {
          const blobR = vertex.size + blurAmount * 0.5;
          const blobGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, blobR);
          blobGrad.addColorStop(0, rgba(vertexColor, vAlpha * 0.3));
          blobGrad.addColorStop(0.4, rgba(vertexColor, vAlpha * 0.1));
          blobGrad.addColorStop(1, rgba(vertexColor, 0));
          ctx.fillStyle = blobGrad;
          ctx.fillRect(vx - blobR, vy - blobR, blobR * 2, blobR * 2);
        }

        const coreR = vertex.size * (0.3 + clarity * 0.7);
        ctx.beginPath();
        ctx.arc(vx, vy, Math.max(minDim * 0.001, coreR), 0, Math.PI * 2);
        ctx.fillStyle = rgba(vertexColor, vAlpha);
        ctx.fill();

        if (clarity > 0.8) {
          ctx.beginPath();
          ctx.arc(vx - coreR * 0.15, vy - coreR * 0.15, coreR * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255], (clarity - 0.8) * vAlpha * 0.4);
          ctx.fill();
        }
      }

      // ── Orbital particles ─────────────────────────
      if (!p.reducedMotion) {
        for (const orbital of s.orbitals) {
          orbital.angle += orbital.speed * (1 + blurNorm * 2);

          const orR = orbital.r * minDim * zoomScale;
          const oox = centerX + Math.cos(orbital.angle + s.rotation * 0.3) * orR;
          const ooy = centerY + Math.sin(orbital.angle + s.rotation * 0.3) * orR;

          const orbScatter = blurNorm * minDim * 0.04;
          const osx = oox + Math.sin(s.frameCount * 0.05 + orbital.phase) * orbScatter;
          const osy = ooy + Math.cos(s.frameCount * 0.05 + orbital.phase) * orbScatter;

          const oAlpha = orbital.brightness * entrance * (0.1 + clarity * 0.15);
          if (oAlpha < 0.01) continue;

          const oColor = lerpColor(ORBITAL_COLOR, s.primaryRgb, 0.15);

          if (blurAmount > minDim * 0.01) {
            const glowR = orbital.size * 3 + blurAmount * 0.3;
            const glowGrad = ctx.createRadialGradient(osx, osy, 0, osx, osy, glowR);
            glowGrad.addColorStop(0, rgba(oColor, oAlpha * 0.15));
            glowGrad.addColorStop(1, rgba(oColor, 0));
            ctx.fillStyle = glowGrad;
            ctx.fillRect(osx - glowR, osy - glowR, glowR * 2, glowR * 2);
          }

          ctx.beginPath();
          ctx.arc(osx, osy, Math.max(minDim * 0.001, orbital.size * (0.5 + clarity * 0.5)), 0, Math.PI * 2);
          ctx.fillStyle = rgba(oColor, oAlpha);
          ctx.fill();
        }
      }

      // ── Center crystal core ───────────────────────
      const coreR = minDim * 0.02 * (0.5 + clarity * 0.5);
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreR * 3);
      coreGrad.addColorStop(0, rgba(
        lerpColor(CRYSTAL_CLEAR, [255, 255, 255], clarity * 0.3),
        (0.1 + clarity * 0.25) * entrance,
      ));
      coreGrad.addColorStop(0.4, rgba(vertexColor, 0.05 * entrance));
      coreGrad.addColorStop(1, rgba(vertexColor, 0));
      ctx.fillStyle = coreGrad;
      ctx.fillRect(centerX - coreR * 3, centerY - coreR * 3, coreR * 6, coreR * 6);

      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(minDim * 0.001, coreR * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(vertexColor, [255, 255, 255], 0.2),
        (0.2 + clarity * 0.4) * entrance,
      );
      ctx.fill();

      // ── Zoom indicator ────────────────────────────
      if (Math.abs(s.currentZoom - CLARITY_CENTER) > 0.1) {
        const zoomAlpha = Math.min(0.06, Math.abs(s.currentZoom - CLARITY_CENTER) * 0.04) * entrance;
        const indicatorR = minDim * 0.35;
        ctx.beginPath();
        ctx.arc(centerX, centerY, indicatorR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(
          s.currentZoom > CLARITY_CENTER
            ? lerpColor(CRYSTAL_BLURRED, s.primaryRgb, 0.3)
            : lerpColor(CRYSTAL_CLEAR, s.accentRgb, 0.3),
          zoomAlpha,
        );
        ctx.lineWidth = minDim * 0.002;
        ctx.setLineDash([minDim * 0.008, minDim * 0.016]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(wheelTimer);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
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
          cursor: 'ns-resize',
        }}
      />
    </div>
  );
}