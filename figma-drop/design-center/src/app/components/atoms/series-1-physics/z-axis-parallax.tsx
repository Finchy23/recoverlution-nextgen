/**
 * ATOM 003: THE Z-AXIS PARALLAX ENGINE
 * ======================================
 * Series 1 — Physics Engines · Position 3
 *
 * Cognitive fusion is the belief that "I am my thoughts."
 * This atom forces the Overview Effect — an exponential pull
 * backward through scale until the problem is a speck in the void.
 *
 * PHYSICS:
 *   - True 3D perspective projection (not CSS transforms)
 *   - Exponential camera zoom along Z-axis
 *   - Pointer-driven parallax tilt (gyroscope simulation)
 *   - Depth-sorted star field with 5 scale domains
 *   - Central "problem mass" that shrinks to insignificance
 *   - Atmospheric density gradient (claustrophobic → vacuum)
 *
 * INTERACTION:
 *   Scroll / Pinch  → exponential zoom in/out along Z
 *   Pointer move     → parallax tilt (gyroscope proxy)
 *   Observable       → auto-drift outward if idle
 *
 * SCALE DOMAINS:
 *   0.0–0.15  Street   — dense, chaotic, claustrophobic
 *   0.15–0.35 City     — structure emerges from noise
 *   0.35–0.55 Planet   — patterns become singular shape
 *   0.55–0.80 Cosmos   — shape becomes dot among dots
 *   0.80–1.00 Void     — near-total emptiness, one point
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static depth, no drift, instant zoom, no tilt
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total particles in the 3D volume */
const PARTICLE_COUNT = 350;
/** Focal length for perspective projection */
const FOCAL_LENGTH = 400;
/** Minimum camera Z (zoomed all the way in) */
const CAMERA_Z_MIN = 0;
/** Maximum camera Z (zoomed all the way out) */
const CAMERA_Z_MAX = 4000;
/** How fast scroll maps to zoom (exponential base) */
const ZOOM_SENSITIVITY = 0.0012;
/** Parallax tilt strength (pointer offset to camera offset) */
const TILT_STRENGTH = 80;
/** Smoothing factor for camera movement */
const CAMERA_SMOOTHING = 0.06;
/** Auto-drift speed when idle (normalized units/frame) */
const IDLE_DRIFT_SPEED = 0.00008;
/** Frames of no interaction before idle drift starts */
const IDLE_THRESHOLD = 180; // ~3s at 60fps
/** Scale thresholds for step_advance haptics */
const SCALE_THRESHOLDS = [0.15, 0.35, 0.55, 0.80, 0.95];
/** Spread of particles in X/Y world space */
const WORLD_SPREAD_XY = 2000;
/** Spread of particles in Z world space */
const WORLD_SPREAD_Z = 5000;

// =====================================================================
// 3D PARTICLE SYSTEM
// =====================================================================

interface DepthParticle {
  /** World X */
  wx: number;
  /** World Y */
  wy: number;
  /** World Z (depth) — larger = farther */
  wz: number;
  /** Base size */
  size: number;
  /** Base brightness */
  brightness: number;
  /** Color warmth — 0 = cool blue, 1 = warm amber */
  warmth: number;
  /** Shimmer phase */
  shimmerPhase: number;
  /** Shimmer speed */
  shimmerSpeed: number;
  /** Is this a "structure" particle (forms patterns at city scale) */
  isStructure: boolean;
  /** Structure ring index (for organized patterns) */
  structureRing: number;
  /** Structure angle on ring */
  structureAngle: number;
}

function createParticles(): DepthParticle[] {
  const particles: DepthParticle[] = [];

  // Layer 1: Dense chaotic near-field (street)
  for (let i = 0; i < 80; i++) {
    particles.push({
      wx: (Math.random() - 0.5) * WORLD_SPREAD_XY * 0.3,
      wy: (Math.random() - 0.5) * WORLD_SPREAD_XY * 0.3,
      wz: Math.random() * 200 + 50,
      size: 1 + Math.random() * 3,
      brightness: 0.3 + Math.random() * 0.7,
      warmth: 0.6 + Math.random() * 0.4,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.02 + Math.random() * 0.04,
      isStructure: false,
      structureRing: 0,
      structureAngle: 0,
    });
  }

  // Layer 2: Structure particles (city — concentric rings)
  for (let ring = 0; ring < 5; ring++) {
    const ringRadius = 100 + ring * 120;
    const count = 8 + ring * 6;
    for (let j = 0; j < count; j++) {
      const angle = (j / count) * Math.PI * 2 + ring * 0.3;
      particles.push({
        wx: Math.cos(angle) * ringRadius + (Math.random() - 0.5) * 30,
        wy: Math.sin(angle) * ringRadius + (Math.random() - 0.5) * 30,
        wz: 300 + ring * 150 + (Math.random() - 0.5) * 50,
        size: 1.5 + Math.random() * 2,
        brightness: 0.4 + Math.random() * 0.5,
        warmth: 0.3 + Math.random() * 0.4,
        shimmerPhase: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.01 + Math.random() * 0.02,
        isStructure: true,
        structureRing: ring,
        structureAngle: angle,
      });
    }
  }

  // Layer 3: Mid-field scattered (planet/continent)
  for (let i = 0; i < 80; i++) {
    particles.push({
      wx: (Math.random() - 0.5) * WORLD_SPREAD_XY,
      wy: (Math.random() - 0.5) * WORLD_SPREAD_XY,
      wz: 800 + Math.random() * 1500,
      size: 0.8 + Math.random() * 2,
      brightness: 0.2 + Math.random() * 0.6,
      warmth: 0.1 + Math.random() * 0.3,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.005 + Math.random() * 0.015,
      isStructure: false,
      structureRing: 0,
      structureAngle: 0,
    });
  }

  // Layer 4: Deep field (cosmos)
  for (let i = 0; i < 100; i++) {
    particles.push({
      wx: (Math.random() - 0.5) * WORLD_SPREAD_XY * 2,
      wy: (Math.random() - 0.5) * WORLD_SPREAD_XY * 2,
      wz: 2000 + Math.random() * 3000,
      size: 0.4 + Math.random() * 1.2,
      brightness: 0.1 + Math.random() * 0.4,
      warmth: Math.random() * 0.15,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.003 + Math.random() * 0.008,
      isStructure: false,
      structureRing: 0,
      structureAngle: 0,
    });
  }

  return particles;
}

// =====================================================================
// COLOR SYSTEM
// =====================================================================

// Palette: claustrophobic warm → vast cool
const NEAR_WARM: RGB = [255, 180, 120]; // Anxious amber
const FAR_COOL: RGB = [100, 140, 220];  // Cosmic blue
const VOID_PALE: RGB = [200, 210, 240]; // Near-white void

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ZAxisParallaxAtom({
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
    particles: createParticles(),
    // Camera state
    cameraZ: 0,             // Current camera Z
    targetCameraZ: 0,       // Target camera Z (smooth interpolation)
    cameraTiltX: 0,         // Current parallax X offset
    cameraTiltY: 0,         // Current parallax Y offset
    targetTiltX: 0,
    targetTiltY: 0,
    // Interaction
    pointerX: 0.5,          // Normalised pointer X (0-1)
    pointerY: 0.5,          // Normalised pointer Y (0-1)
    idleFrames: 0,
    lastInteractionFrame: 0,
    // Zoom state
    normalizedZoom: 0,       // 0 = close, 1 = far
    lastThresholdIndex: -1,  // Which scale threshold we last crossed
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    // Colors
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    // Pinch tracking
    lastPinchDist: 0,
    isPinching: false,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // Touch pinch support
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer/touch/wheel handlers ─────────────
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
      s.idleFrames = 0;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      const zoomFactor = 1 + Math.abs(s.targetCameraZ) * 0.001;
      s.targetCameraZ += e.deltaY * ZOOM_SENSITIVITY * CAMERA_Z_MAX * zoomFactor;
      s.targetCameraZ = Math.max(CAMERA_Z_MIN, Math.min(CAMERA_Z_MAX, s.targetCameraZ));
      s.idleFrames = 0;
    };
    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        touchesRef.current.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (touchesRef.current.size === 2) {
        const pts = Array.from(touchesRef.current.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        stateRef.current.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
        stateRef.current.isPinching = true;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        touchesRef.current.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      const s = stateRef.current;
      if (s.isPinching && touchesRef.current.size === 2) {
        const pts = Array.from(touchesRef.current.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = s.lastPinchDist - dist;
        const zoomFactor = 1 + Math.abs(s.targetCameraZ) * 0.001;
        s.targetCameraZ += delta * 0.8 * zoomFactor;
        s.targetCameraZ = Math.max(CAMERA_Z_MIN, Math.min(CAMERA_Z_MAX, s.targetCameraZ));
        s.lastPinchDist = dist;
        s.idleFrames = 0;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        touchesRef.current.delete(e.changedTouches[i].identifier);
      }
      if (touchesRef.current.size < 2) {
        stateRef.current.isPinching = false;
      }
    };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;

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
        s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Idle drift ────────────────────────────────────
      s.idleFrames++;
      if (!p.reducedMotion && s.idleFrames > IDLE_THRESHOLD) {
        s.targetCameraZ = Math.min(CAMERA_Z_MAX, s.targetCameraZ + IDLE_DRIFT_SPEED * CAMERA_Z_MAX);
      }

      // ── Camera smooth interpolation ───────────────────
      if (p.reducedMotion) {
        s.cameraZ = s.targetCameraZ;
        s.cameraTiltX = 0;
        s.cameraTiltY = 0;
      } else {
        s.cameraZ += (s.targetCameraZ - s.cameraZ) * CAMERA_SMOOTHING;
        // Parallax tilt from pointer
        s.targetTiltX = (s.pointerX - 0.5) * TILT_STRENGTH;
        s.targetTiltY = (s.pointerY - 0.5) * TILT_STRENGTH;
        s.cameraTiltX += (s.targetTiltX - s.cameraTiltX) * 0.04;
        s.cameraTiltY += (s.targetTiltY - s.cameraTiltY) * 0.04;
      }

      // ── Normalized zoom ───────────────────────────────
      s.normalizedZoom = s.cameraZ / CAMERA_Z_MAX;
      cb.onStateChange?.(s.normalizedZoom);

      // ── Scale threshold haptics ───────────────────────
      let currentThreshold = -1;
      for (let i = SCALE_THRESHOLDS.length - 1; i >= 0; i--) {
        if (s.normalizedZoom >= SCALE_THRESHOLDS[i]) {
          currentThreshold = i;
          break;
        }
      }
      if (currentThreshold > s.lastThresholdIndex) {
        cb.onHaptic('step_advance');
        s.lastThresholdIndex = currentThreshold;
      } else if (currentThreshold < s.lastThresholdIndex) {
        s.lastThresholdIndex = currentThreshold;
      }

      // ── Breath peak in void zone ──────────────────────
      if (s.normalizedZoom > 0.8 && p.breathAmplitude > 0.7) {
        if (s.frameCount % 90 === 0) {
          cb.onHaptic('breath_peak');
        }
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ═════════════════════════════════════════════════

      const cx = w / 2;
      const cy = h / 2;
      const zoom = s.normalizedZoom;

      // ── Background gradient ───────────────────────────
      // Near: warm, dense, hazy. Far: cool, clear, void.
      const bgNear = lerpColor(s.primaryRgb, NEAR_WARM, 0.4);
      const bgFar = lerpColor([5, 5, 12], FAR_COOL, 0.15);
      const bgColor = lerpColor(bgNear, bgFar, zoom);
      const bgDark = lerpColor(bgColor, [2, 2, 6], 0.7);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
      bgGrad.addColorStop(0, rgba(lerpColor(bgColor, [20, 18, 25], 0.3), entrance * 0.03));
      bgGrad.addColorStop(0.5, rgba(bgDark, entrance * 0.025));
      bgGrad.addColorStop(1, rgba(lerpColor(bgDark, [1, 1, 3], 0.5), entrance * 0.02));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Atmospheric haze (fades with zoom) ────────────
      if (zoom < 0.5) {
        const hazeAlpha = (1 - zoom * 2) * 0.15 * entrance;
        const hazeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
        hazeGrad.addColorStop(0, rgba(bgNear, hazeAlpha));
        hazeGrad.addColorStop(0.6, rgba(bgNear, hazeAlpha * 0.3));
        hazeGrad.addColorStop(1, rgba(bgNear, 0));
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Project and render particles ──────────────────
      // Sort by depth (back to front)
      const projected: {
        sx: number; sy: number; size: number; alpha: number;
        warmth: number; shimmer: number; depth: number;
        isStructure: boolean;
      }[] = [];

      for (const particle of s.particles) {
        // Camera-relative Z
        const relZ = particle.wz - s.cameraZ;

        // Cull particles behind camera or too close
        if (relZ < 10) continue;

        // Perspective projection
        const scale = FOCAL_LENGTH / relZ;
        const sx = cx + (particle.wx - s.cameraTiltX) * scale;
        const sy = cy + (particle.wy - s.cameraTiltY) * scale;

        // Cull off-screen (with generous margin)
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;

        // Depth-based alpha (fog)
        const depthNorm = Math.min(1, relZ / WORLD_SPREAD_Z);
        const fogAlpha = 1 - depthNorm * depthNorm;

        // Size scales with projection
        const projSize = particle.size * scale * 2;
        if (projSize < 0.2) continue; // Too small to see

        // Shimmer
        const shimmer = p.reducedMotion ? 1 :
          0.7 + 0.3 * Math.sin(s.frameCount * particle.shimmerSpeed + particle.shimmerPhase);

        projected.push({
          sx, sy,
          size: projSize,
          alpha: particle.brightness * fogAlpha * shimmer * entrance,
          warmth: particle.warmth,
          shimmer,
          depth: relZ,
          isStructure: particle.isStructure,
        });
      }

      // Sort back to front
      projected.sort((a, b) => b.depth - a.depth);

      // Draw particles
      for (const p of projected) {
        if (p.alpha < 0.01) continue;

        // Color: blend between warm/cool based on particle warmth and zoom level
        const particleColor = lerpColor(
          lerpColor(FAR_COOL, VOID_PALE, zoom * 0.5),
          NEAR_WARM,
          p.warmth * (1 - zoom * 0.7),
        );

        // Also blend with the series color
        const finalColor = lerpColor(particleColor, stateRef.current.primaryRgb, 0.15);

        // Draw
        if (p.size > 1.5) {
          // Large particles get a glow halo
          const glowGrad = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, p.size * 3);
          glowGrad.addColorStop(0, rgba(finalColor, p.alpha * 0.15));
          glowGrad.addColorStop(0.5, rgba(finalColor, p.alpha * 0.04));
          glowGrad.addColorStop(1, rgba(finalColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(p.sx - p.size * 3, p.sy - p.size * 3, p.size * 6, p.size * 6);
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.max(0.3, p.size * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = rgba(finalColor, Math.min(1, p.alpha));
        ctx.fill();

        // Structure particles at mid-zoom get connecting lines
        if (p.isStructure && zoom > 0.1 && zoom < 0.5 && p.size > 0.8) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, p.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba(finalColor, p.alpha * 0.8);
          ctx.fill();
        }
      }

      // ── Central problem mass ──────────────────────────
      // Starts as a large, anxious glow; shrinks to a dot
      const problemRelZ = 100 - s.cameraZ;
      if (problemRelZ > 5) {
        const problemScale = FOCAL_LENGTH / problemRelZ;
        const problemR = Math.max(0.5, 60 * problemScale);
        const problemSx = cx + (0 - s.cameraTiltX * 0.2) * problemScale;
        const problemSy = cy + (0 - s.cameraTiltY * 0.2) * problemScale;

        const problemAlpha = Math.min(1, problemScale * 2) * entrance;

        if (problemR > 0.5) {
          // Outer anxious glow
          const pGrad = ctx.createRadialGradient(
            problemSx, problemSy, 0,
            problemSx, problemSy, problemR * 4,
          );

          // Color shifts from anxious warm to neutral as you zoom out
          const pColor = lerpColor(NEAR_WARM, stateRef.current.accentRgb, zoom);
          pGrad.addColorStop(0, rgba(pColor, problemAlpha * 0.4));
          pGrad.addColorStop(0.2, rgba(pColor, problemAlpha * 0.15));
          pGrad.addColorStop(0.5, rgba(pColor, problemAlpha * 0.04));
          pGrad.addColorStop(1, rgba(pColor, 0));
          ctx.fillStyle = pGrad;
          const pSize = problemR * 8;
          ctx.fillRect(problemSx - pSize / 2, problemSy - pSize / 2, pSize, pSize);

          // Core
          ctx.beginPath();
          ctx.arc(problemSx, problemSy, Math.max(0.3, problemR * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(pColor, [255, 255, 255], 0.3), problemAlpha * 0.7);
          ctx.fill();

          // Pulsing ring (anxiety) — only when zoomed in
          if (zoom < 0.3 && !p.reducedMotion) {
            const pulsePhase = (s.frameCount * 0.04) % (Math.PI * 2);
            const pulseR = problemR * (1.5 + Math.sin(pulsePhase) * 0.5);
            const pulseAlpha = (1 - zoom / 0.3) * 0.15 * (0.5 + 0.5 * Math.sin(pulsePhase));
            ctx.beginPath();
            ctx.arc(problemSx, problemSy, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(NEAR_WARM, pulseAlpha * entrance);
            ctx.lineWidth = minDim * 0.002;
            ctx.stroke();
          }
        }
      }

      // ── Void zone: single point of light ──────────────
      if (zoom > 0.85) {
        const voidAlpha = (zoom - 0.85) / 0.15 * entrance;
        // A tiny, distant, serene point
        const voidGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 3);
        voidGrad.addColorStop(0, rgba(VOID_PALE, voidAlpha * 0.6));
        voidGrad.addColorStop(0.5, rgba(FAR_COOL, voidAlpha * 0.15));
        voidGrad.addColorStop(1, rgba(FAR_COOL, 0));
        ctx.fillStyle = voidGrad;
        const dotR = minDim * 0.006;
        ctx.fillRect(cx - dotR, cy - dotR, dotR * 2, dotR * 2);
      }

      // ── Depth scale rings (very subtle) ───────────────
      if (!p.reducedMotion) {
        for (let i = 0; i < SCALE_THRESHOLDS.length; i++) {
          const threshold = SCALE_THRESHOLDS[i];
          const thresholdZ = threshold * CAMERA_Z_MAX;
          const relZ = thresholdZ - s.cameraZ;
          if (relZ < 20 || relZ > 3000) continue;

          const ringScale = FOCAL_LENGTH / relZ;
          const ringR = 300 * ringScale;
          if (ringR < 2 || ringR > Math.max(w, h)) continue;

          const ringAlpha = Math.max(0, 0.04 - Math.abs(s.normalizedZoom - threshold) * 0.2);
          if (ringAlpha < 0.005) continue;

          ctx.beginPath();
          ctx.arc(
            cx + (-s.cameraTiltX) * ringScale * 0.3,
            cy + (-s.cameraTiltY) * ringScale * 0.3,
            ringR, 0, Math.PI * 2,
          );
          ctx.strokeStyle = rgba(
            lerpColor(FAR_COOL, VOID_PALE, 0.5),
            ringAlpha * entrance,
          );
          ctx.lineWidth = minDim * 0.001;
          ctx.stroke();
        }
      }

      // ── Resolve phase: drift gently outward ───────────
      if (p.phase === 'resolve' && !p.reducedMotion) {
        s.targetCameraZ = Math.min(CAMERA_Z_MAX, s.targetCameraZ + 0.3);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
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