/**
 * ATOM 008: THE OPTICAL ENGINE
 * ==============================
 * Series 1 — Physics Engines · Position 8
 *
 * You cannot always change the problem, but you can change
 * the lens. A movable spotlight illuminates an abstract scene
 * of layered depth planes. Where the light falls, color and
 * clarity bloom. A rotational focus ring scrubs depth-of-field,
 * clicking through detent positions like a heavy DSLR lens.
 *
 * PHYSICS:
 *   - Movable radial spotlight with soft falloff
 *   - 4 depth layers of abstract shapes (foreground ego → far context)
 *   - Scrubable focus ring controlling depth-of-field plane
 *   - Areas outside spotlight rendered desaturated + dimmed
 *   - Focal detents at each depth layer fire step_advance
 *   - Spotlight position = perspective (ego-centric → empathic)
 *
 * INTERACTION:
 *   Drag (anywhere)   → moves the spotlight cone
 *   Scrub (bottom)    → rotates focus ring (depth-of-field)
 *   Tap (shape)       → brief flash-pulse at that depth
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No shape drift, no spotlight bloom pulse
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, desaturate, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of depth layers */
const DEPTH_LAYERS = 4;
/** Shapes per depth layer */
const SHAPES_PER_LAYER = [8, 6, 5, 4]; // foreground → background
/** Spotlight radius as fraction of min dimension */
const SPOTLIGHT_RADIUS_FRAC = 0.28;
/** Spotlight soft edge width */
const SPOTLIGHT_SOFT = 0.4;
/** Focus ring height as fraction of viewport */
const FOCUS_RING_ZONE = 0.18;
/** Focus detent positions (0 = foreground, 1 = background) */
const FOCAL_DETENTS = [0.0, 0.33, 0.66, 1.0];
/** Detent snap strength */
const DETENT_SNAP = 0.06;
/** Focus ring visual radius */
const RING_RADIUS_FRAC = 0.07;
/** Shape drift speed */
const SHAPE_DRIFT = 0.15;

// =====================================================================
// SHAPE TYPES
// =====================================================================

interface DepthShape {
  /** Center X (0–1 normalized) */
  x: number;
  /** Center Y (0–1 normalized) */
  y: number;
  /** Base radius (px) */
  radius: number;
  /** Shape type */
  type: 'circle' | 'ellipse' | 'blob';
  /** Depth layer (0 = foreground, 3 = background) */
  layer: number;
  /** Individual hue offset */
  hueShift: number;
  /** Drift angle */
  driftAngle: number;
  /** Drift speed multiplier */
  driftSpeed: number;
  /** Rotation (for ellipses/blobs) */
  rotation: number;
  /** Rotation speed */
  rotSpeed: number;
  /** Aspect ratio (for ellipses) */
  aspect: number;
  /** Blob deformation seed */
  blobSeed: number;
}

function createShapes(w: number, h: number): DepthShape[] {
  const shapes: DepthShape[] = [];
  const minDim = Math.min(w, h);

  for (let layer = 0; layer < DEPTH_LAYERS; layer++) {
    const count = SHAPES_PER_LAYER[layer];
    const layerScale = 0.6 + layer * 0.25; // Background shapes are bigger
    const spread = 0.15 + layer * 0.15; // Background more spread

    for (let i = 0; i < count; i++) {
      // Distribute shapes in a ring pattern, with some randomness
      const baseAngle = (i / count) * Math.PI * 2 + layer * 0.5;
      const dist = 0.15 + spread * (0.5 + Math.random() * 0.5);
      const types: DepthShape['type'][] = ['circle', 'ellipse', 'blob'];

      shapes.push({
        x: 0.5 + Math.cos(baseAngle) * dist,
        y: 0.5 + Math.sin(baseAngle) * dist,
        radius: (12 + Math.random() * 25) * layerScale * (minDim / 400),
        type: types[Math.floor(Math.random() * types.length)],
        layer,
        hueShift: Math.random(),
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: 0.3 + Math.random() * 0.7,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.005,
        aspect: 0.5 + Math.random() * 0.5,
        blobSeed: Math.random() * 100,
      });
    }
  }

  return shapes;
}

// =====================================================================
// COLOR
// =====================================================================

// Layer color palette (warm foreground → cool background)
const LAYER_HUES: RGB[] = [
  [200, 120, 100], // Foreground: warm
  [180, 140, 130], // Mid-near
  [120, 140, 170], // Mid-far
  [90, 110, 160],  // Background: cool
];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function OpticalAtom({
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

  const stateRef = useRef({
    shapes: [] as DepthShape[],
    // Spotlight
    spotX: 0.5,       // Normalized position
    spotY: 0.4,
    targetSpotX: 0.5,
    targetSpotY: 0.4,
    // Focus ring
    focalDepth: 0,     // 0 = foreground, 1 = background
    targetFocalDepth: 0,
    lastDetentIndex: 0,
    // Interaction
    isDragging: false,
    isScrubbing: false,
    scrubStartX: 0,
    scrubStartFocal: 0,
    // Visuals
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;

    if (!s.initialized) {
      s.shapes = createShapes(w, h);
      s.initialized = true;
    }

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      if (py > 1 - FOCUS_RING_ZONE) {
        s.isScrubbing = true;
        s.scrubStartX = px;
        s.scrubStartFocal = s.targetFocalDepth;
        canvas.style.cursor = 'ew-resize';
      } else {
        s.isDragging = true;
        s.targetSpotX = px;
        s.targetSpotY = py;
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      if (s.isDragging) {
        s.targetSpotX = px;
        s.targetSpotY = py;
      }
      if (s.isScrubbing) {
        const delta = (px - s.scrubStartX) * 3.0;
        s.targetFocalDepth = Math.max(0, Math.min(1, s.scrubStartFocal + delta));
      }
      if (!s.isDragging && !s.isScrubbing) {
        canvas.style.cursor = py > 1 - FOCUS_RING_ZONE ? 'ew-resize' : 'crosshair';
      }
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = false;
      s.isScrubbing = false;
      canvas.style.cursor = 'crosshair';
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

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

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Smooth spotlight position ─────────────────────
      s.spotX += (s.targetSpotX - s.spotX) * 0.08;
      s.spotY += (s.targetSpotY - s.spotY) * 0.08;

      // ── Smooth focal depth with detent snapping ───────
      // Find nearest detent
      let nearestDetent = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < FOCAL_DETENTS.length; i++) {
        const d = Math.abs(s.targetFocalDepth - FOCAL_DETENTS[i]);
        if (d < nearestDist) {
          nearestDist = d;
          nearestDetent = i;
        }
      }
      // Soft snap toward detent
      if (nearestDist < 0.08 && !s.isScrubbing) {
        s.targetFocalDepth += (FOCAL_DETENTS[nearestDetent] - s.targetFocalDepth) * DETENT_SNAP;
      }
      // Fire haptic on detent change
      if (nearestDetent !== s.lastDetentIndex) {
        cb.onHaptic('step_advance');
        s.lastDetentIndex = nearestDetent;
      }

      s.focalDepth += (s.targetFocalDepth - s.focalDepth) * 0.1;

      // ── State reporting ───────────────────────────────
      // Composite of spotlight distance from center + focal depth
      const spotDist = Math.sqrt(
        (s.spotX - 0.5) ** 2 + (s.spotY - 0.5) ** 2,
      );
      const perspectiveShift = Math.min(1, spotDist * 2.5);
      const composite = (perspectiveShift + s.focalDepth) / 2;
      cb.onStateChange?.(composite);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const spotPx = s.spotX * w;
      const spotPy = s.spotY * h;
      const minDim = Math.min(w, h);
      const spotR = minDim * SPOTLIGHT_RADIUS_FRAC;

      // ── Background ────────────────────────────────────
      ctx.fillStyle = rgba(lerpColor([6, 5, 10], s.primaryRgb, 0.03), entrance * 0.03);
      ctx.fillRect(0, 0, w, h);

      // Subtle vignette
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      vigGrad.addColorStop(0, rgba([12, 10, 18], entrance * 0.01));
      vigGrad.addColorStop(1, rgba([3, 2, 5], entrance * 0.02));
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Render shapes by layer (back to front) ────────
      for (let layer = DEPTH_LAYERS - 1; layer >= 0; layer--) {
        const layerNorm = layer / (DEPTH_LAYERS - 1); // 0 = foreground, 1 = background
        const layerShapes = s.shapes.filter(sh => sh.layer === layer);

        // Depth-of-field: how "in focus" is this layer?
        const focalDist = Math.abs(layerNorm - s.focalDepth);
        const focusSharpness = Math.max(0, 1 - focalDist * 3.5); // 1 = sharp, 0 = blurred (steeper falloff)

        for (const shape of layerShapes) {
          // Drift
          if (!p.reducedMotion) {
            shape.x += Math.cos(shape.driftAngle) * shape.driftSpeed * SHAPE_DRIFT / w;
            shape.y += Math.sin(shape.driftAngle) * shape.driftSpeed * SHAPE_DRIFT / h;
            shape.rotation += shape.rotSpeed;

            // Wrap around
            if (shape.x < -0.1) shape.x = 1.1;
            if (shape.x > 1.1) shape.x = -0.1;
            if (shape.y < -0.1) shape.y = 1.1;
            if (shape.y > 1.1) shape.y = -0.1;
          }

          const sx = shape.x * w;
          const sy = shape.y * h;

          // Distance from spotlight center
          const dx = sx - spotPx;
          const dy = sy - spotPy;
          const distFromSpot = Math.sqrt(dx * dx + dy * dy);
          const spotInfluence = Math.max(0, 1 - distFromSpot / (spotR * (1 + SPOTLIGHT_SOFT)));

          // Color: saturated in spotlight, desaturated outside
          const layerColor = lerpColor(LAYER_HUES[layer], s.primaryRgb, shape.hueShift * 0.3);
          const litColor = lerpColor(layerColor, s.accentRgb, spotInfluence * 0.3);
          const finalColor = desaturate(litColor, (1 - spotInfluence) * (0.5 + (1 - focusSharpness) * 0.45));

          // Alpha: dramatic difference between in-focus and out-of-focus
          const focusAlpha = focusSharpness * focusSharpness; // quadratic for sharper transition
          const baseAlpha = 0.04 + focusAlpha * 0.55 + spotInfluence * 0.3;
          const alpha = baseAlpha * entrance;

          // Size: much larger when in focus, shrinks when blurred
          const sizeScale = 0.4 + focusSharpness * 0.7 + spotInfluence * 0.15;
          const r = shape.radius * sizeScale;

          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(shape.rotation);

          if (shape.type === 'circle') {
            // Glow
            if (spotInfluence > 0.2) {
              const gGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.5);
              gGrad.addColorStop(0, rgba(litColor, alpha * 0.1 * spotInfluence));
              gGrad.addColorStop(1, rgba(litColor, 0));
              ctx.fillStyle = gGrad;
              ctx.fillRect(-r * 2.5, -r * 2.5, r * 5, r * 5);
            }
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = rgba(finalColor, alpha);
            ctx.fill();
          } else if (shape.type === 'ellipse') {
            ctx.beginPath();
            ctx.ellipse(0, 0, r, r * shape.aspect, 0, 0, Math.PI * 2);
            ctx.fillStyle = rgba(finalColor, alpha * 0.85);
            ctx.fill();
          } else {
            // Blob: deformed circle
            ctx.beginPath();
            const pts = 8;
            for (let i = 0; i <= pts; i++) {
              const a = (i / pts) * Math.PI * 2;
              const deform = 1 + 0.2 * Math.sin(a * 3 + shape.blobSeed) +
                0.1 * Math.sin(a * 5 + shape.blobSeed * 2);
              const bx = Math.cos(a) * r * deform;
              const by = Math.sin(a) * r * deform * shape.aspect;
              if (i === 0) ctx.moveTo(bx, by);
              else ctx.lineTo(bx, by);
            }
            ctx.closePath();
            ctx.fillStyle = rgba(finalColor, alpha * 0.75);
            ctx.fill();
          }

          // Out-of-focus blur effect: concentric semi-transparent rings
          if (focusSharpness < 0.4 && alpha > 0.05) {
            const blurR = r * (1.5 + (1 - focusSharpness) * 1.5);
            const blurGrad = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, blurR);
            blurGrad.addColorStop(0, rgba(finalColor, alpha * 0.08));
            blurGrad.addColorStop(0.5, rgba(finalColor, alpha * 0.03));
            blurGrad.addColorStop(1, rgba(finalColor, 0));
            ctx.fillStyle = blurGrad;
            ctx.fillRect(-blurR, -blurR, blurR * 2, blurR * 2);
          }

          ctx.restore();
        }
      }

      // ── Spotlight cone ────────────────────────────────
      const spotGrad = ctx.createRadialGradient(spotPx, spotPy, 0, spotPx, spotPy, spotR * (1 + SPOTLIGHT_SOFT));
      const spotColor = lerpColor(s.accentRgb, [255, 240, 220], 0.3);
      spotGrad.addColorStop(0, rgba(spotColor, 0.06 * entrance));
      spotGrad.addColorStop(0.5, rgba(spotColor, 0.03 * entrance));
      spotGrad.addColorStop(0.8, rgba(spotColor, 0.01 * entrance));
      spotGrad.addColorStop(1, rgba(spotColor, 0));
      ctx.fillStyle = spotGrad;
      ctx.fillRect(0, 0, w, h);

      // Spotlight center point
      ctx.beginPath();
      ctx.arc(spotPx, spotPy, minDim * 0.006, 0, Math.PI * 2);
      ctx.fillStyle = rgba(spotColor, 0.25 * entrance);
      ctx.fill();

      // ── Focus ring indicator ──────────────────────────
      const ringY = h * (1 - FOCUS_RING_ZONE / 2);
      const ringR = minDim * RING_RADIUS_FRAC;
      const ringAngle = s.focalDepth * Math.PI * 2;
      const scrubHighlight = s.isScrubbing ? 0.5 : 0;
      const ringBaseAlpha = 0.15 + scrubHighlight;

      // Ring glow when scrubbing
      if (scrubHighlight > 0) {
        const glowGrad = ctx.createRadialGradient(w / 2, ringY, ringR * 0.5, w / 2, ringY, ringR * 2.5);
        glowGrad.addColorStop(0, rgba(s.accentRgb, 0.08 * entrance));
        glowGrad.addColorStop(0.5, rgba(s.accentRgb, 0.03 * entrance));
        glowGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(w / 2 - ringR * 2.5, ringY - ringR * 2.5, ringR * 5, ringR * 5);
      }

      // Ring track
      ctx.beginPath();
      ctx.arc(w / 2, ringY, ringR, 0, Math.PI * 2);
      const trackColor = s.isScrubbing
        ? lerpColor(s.primaryRgb, s.accentRgb, 0.4)
        : lerpColor(s.primaryRgb, [80, 80, 90], 0.5);
      ctx.strokeStyle = rgba(trackColor, ringBaseAlpha * entrance);
      ctx.lineWidth = s.isScrubbing ? 10 : 8;
      ctx.stroke();

      // Ring grip notches
      const notchAlpha = (0.12 + scrubHighlight * 0.25) * entrance;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + ringAngle;
        const innerR = ringR - (s.isScrubbing ? 6 : 5);
        const outerR = ringR + (s.isScrubbing ? 6 : 5);
        ctx.beginPath();
        ctx.moveTo(w / 2 + Math.cos(a) * innerR, ringY + Math.sin(a) * innerR);
        ctx.lineTo(w / 2 + Math.cos(a) * outerR, ringY + Math.sin(a) * outerR);
        ctx.strokeStyle = rgba(s.isScrubbing ? s.accentRgb : s.primaryRgb, notchAlpha);
        ctx.lineWidth = s.isScrubbing ? 2 : 1.5;
        ctx.stroke();
      }

      // Ring position marker
      const markerA = ringAngle;
      const mx = w / 2 + Math.cos(markerA) * ringR;
      const my = ringY + Math.sin(markerA) * ringR;
      ctx.beginPath();
      ctx.arc(mx, my, s.isScrubbing ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, (0.5 + scrubHighlight * 0.3) * entrance);
      ctx.fill();

      // Detent indicators
      for (let i = 0; i < FOCAL_DETENTS.length; i++) {
        const da = FOCAL_DETENTS[i] * Math.PI * 2;
        const ddx = w / 2 + Math.cos(da) * (ringR + 12);
        const ddy = ringY + Math.sin(da) * (ringR + 12);
        const isActive = i === s.lastDetentIndex;
        ctx.beginPath();
        ctx.arc(ddx, ddy, isActive ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          isActive ? s.accentRgb : s.primaryRgb,
          (isActive ? 0.6 : 0.2) * entrance,
        );
        ctx.fill();
      }

      // Focal depth label
      const depthLabels = ['Near', 'Mid-Near', 'Mid-Far', 'Far'];
      ctx.font = `${s.isScrubbing ? 12 : 10}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.isScrubbing ? s.accentRgb : s.primaryRgb, (0.2 + scrubHighlight * 0.4) * entrance);
      ctx.fillText(depthLabels[s.lastDetentIndex] || '', w / 2, ringY + ringR + 24);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}