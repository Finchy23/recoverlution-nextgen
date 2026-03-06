/**
 * ATOM 653: THE VORTEX CORE ENGINE
 * ==================================
 * Series 66 — The Centrifuge · Position 3
 *
 * Find the eye of the storm. Fight through the violent outer bands
 * to reach dead center — the moment you cross the threshold the UI
 * drops to absolute breathtaking silence.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — concentric
 * rotation bands at increasing speeds, debris particles, eye-wall
 * threshold with dramatic silence transition.
 *
 * PHYSICS:
 *   - Massive tornado dominating the screen, debris orbiting
 *   - Outer bands: violent rotation, heavy haptic noise
 *   - Drag node through increasing wind resistance toward center
 *   - Cross eye-wall threshold → instant silence
 *   - Dead center: perfect stillness while chaos spins around
 *   - Multi-band rotation with speed gradient
 *
 * INTERACTION: Drag (fight to center) → eye threshold → silence
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static eye diagram
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const NODE_RADIUS      = 0.018;
const GLOW_R_NODE      = 0.08;
const EYE_RADIUS       = 0.06;         // eye threshold radius
const BAND_COUNT       = 5;            // rotation bands
const DEBRIS_COUNT     = 50;           // orbiting debris particles
const WIND_RESISTANCE  = 0.03;         // push-back from wind
const EYE_SNAP_DIST    = 0.08;         // distance to trigger eye snap
const DWELL_THRESHOLD  = 120;          // frames in eye to complete
const RESPAWN_DELAY    = 100;

// =====================================================================
// STATE
// =====================================================================

interface DebrisParticle {
  angle: number; dist: number; speed: number; size: number;
}

interface VortexState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  userX: number;
  userY: number;
  inEye: boolean;
  dwellTime: number;
  dragging: boolean;
  debris: DebrisParticle[];
  completed: boolean;
  respawnTimer: number;
}

function makeDebris(): DebrisParticle[] {
  return Array.from({ length: DEBRIS_COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist: 0.08 + Math.random() * 0.35,
    speed: 0.01 + Math.random() * 0.03,
    size: 0.002 + Math.random() * 0.005,
  }));
}

function freshState(color: string, accent: string): VortexState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    userX: 0.8, userY: 0.7,
    inEye: false, dwellTime: 0,
    dragging: false, debris: makeDebris(),
    completed: false, respawnTimer: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function VortexCoreStillnessAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef     = useRef({ onHaptic, onStateChange });
  const propsRef  = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef(freshState(color, accentColor));

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb  = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s  = stateRef.current;
      const p  = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);
      const eyeR = px(EYE_RADIUS, minDim);

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        // Update debris rotation
        for (const d of s.debris) {
          const bandSpeed = d.speed * (1 + (0.4 - Math.min(0.4, d.dist)) * 3);
          d.angle += bandSpeed * ms;
        }

        // Eye check
        const dx = s.userX - 0.5;
        const dy = s.userY - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const wasInEye = s.inEye;
        s.inEye = dist < EYE_SNAP_DIST;

        if (s.inEye && !wasInEye) {
          cb.onHaptic('drag_snap');
        }

        if (s.inEye) {
          s.userX += (0.5 - s.userX) * 0.05;
          s.userY += (0.5 - s.userY) * 0.05;
          s.dwellTime++;
          cb.onStateChange?.(Math.min(1, s.dwellTime / DWELL_THRESHOLD));

          if (s.dwellTime >= DWELL_THRESHOLD) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else if (s.dragging) {
          // Wind resistance pushes outward
          const pushDist = WIND_RESISTANCE * (0.4 - Math.min(0.4, dist));
          if (dist > 0.01) {
            s.userX += (dx / dist) * pushDist;
            s.userY += (dy / dist) * pushDist;
          }
          // Haptic wind noise
          if (s.frameCount % 8 === 0) cb.onHaptic('hold_start');
        }
      }

      // ── LAYER 2: Rotation bands ────────────────────────────────
      for (let i = 0; i < BAND_COUNT; i++) {
        const bandR = px(EYE_RADIUS + (i + 1) * 0.07, minDim);
        const bandSpeed = 0.02 + i * 0.008;
        const bandAngle = s.frameCount * bandSpeed * ms;

        // Arc segments representing rotation
        for (let j = 0; j < 3; j++) {
          const arcStart = bandAngle + j * Math.PI * 2 / 3;
          const arcEnd = arcStart + Math.PI * 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, bandR, arcStart, arcEnd);
          const bandAlpha = ALPHA.atmosphere.min * (0.2 + i * 0.08) * entrance * ms;
          ctx.strokeStyle = rgba(s.accentRgb, bandAlpha);
          ctx.lineWidth = px(STROKE.thin + i * 0.0003, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 3: Spiral arms ───────────────────────────────────
      for (let arm = 0; arm < 3; arm++) {
        const armBase = s.frameCount * 0.015 * ms + arm * Math.PI * 2 / 3;
        ctx.beginPath();
        for (let t = 0; t <= 60; t++) {
          const frac = t / 60;
          const spiralR = eyeR + frac * px(0.35, minDim);
          const spiralA = armBase + frac * Math.PI * 3;
          const sx = cx + Math.cos(spiralA) * spiralR;
          const sy = cy + Math.sin(spiralA) * spiralR;
          if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.25 * entrance * ms);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── LAYER 4: Debris particles ──────────────────────────────
      for (const d of s.debris) {
        const dx2 = cx + Math.cos(d.angle) * px(d.dist, minDim);
        const dy2 = cy + Math.sin(d.angle) * px(d.dist, minDim);
        ctx.beginPath();
        ctx.arc(dx2, dy2, px(d.size, minDim), 0, Math.PI * 2);
        const dAlpha = ALPHA.content.max * (0.2 + d.dist * 0.8) * entrance * ms;
        ctx.fillStyle = rgba(s.accentRgb, dAlpha);
        ctx.fill();
      }

      // ── LAYER 5: Eye wall boundary ─────────────────────────────
      // Eye wall glow ring
      const ewGlow = ctx.createRadialGradient(cx, cy, eyeR * 0.7, cx, cy, eyeR * 1.5);
      ewGlow.addColorStop(0, rgba(s.primaryRgb, 0));
      ewGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
      ewGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = ewGlow;
      ctx.fillRect(cx - eyeR * 1.5, cy - eyeR * 1.5, eyeR * 3, eyeR * 3);

      // Eye wall ring
      ctx.beginPath();
      ctx.arc(cx, cy, eyeR, 0, Math.PI * 2);
      const eyeAlpha = s.inEye ? 0.5 : 0.2 + Math.sin(s.frameCount * 0.06) * 0.1;
      ctx.strokeStyle = rgba(s.primaryRgb, eyeAlpha * ALPHA.content.max * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // ── LAYER 6: Eye interior (still zone) ─────────────────────
      if (s.inEye) {
        const eyeFill = ctx.createRadialGradient(cx, cy, 0, cx, cy, eyeR);
        eyeFill.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 4 * entrance));
        eyeFill.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = eyeFill;
        ctx.beginPath();
        ctx.arc(cx, cy, eyeR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── LAYER 7: User node ──────────────────────────────────────
      if (!s.completed) {
        const ux = s.userX * w;
        const uy = s.userY * h;
        const userDist = Math.sqrt((s.userX - 0.5) ** 2 + (s.userY - 0.5) ** 2);
        const windShake = s.inEye ? 0
          : Math.sin(s.frameCount * 0.4 * ms) * px(0.004, minDim) * Math.min(1, userDist * 5);

        // Glow
        const gr = px(GLOW_R_NODE, minDim);
        const glowInt = s.inEye ? 0.5 : 0.15;
        const nGlow = ctx.createRadialGradient(ux, uy, 0, ux, uy, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(ux - gr, uy - gr, gr * 2, gr * 2);

        // Core
        ctx.beginPath();
        ctx.arc(ux + windShake, uy + windShake * 0.5, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Stillness ring in eye
        if (s.inEye) {
          const stillR = nodeR * (2.5 + Math.sin(s.frameCount * 0.04) * 0.3);
          ctx.beginPath();
          ctx.arc(ux, uy, stillR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.inEye) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('STILLNESS', cx, h - px(0.035, minDim));
      } else if (!s.completed) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('FIGHT TO CENTER', cx, h - px(0.035, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, eyeR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.userX = 0.8; s.userY = 0.7;
          s.inEye = false; s.dwellTime = 0;
          s.debris = makeDebris(); s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.inEye || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      s.userX = (e.clientX - rect.left) / rect.width;
      s.userY = (e.clientY - rect.top) / rect.height;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
