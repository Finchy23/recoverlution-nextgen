/**
 * ATOM 646: THE WAKE RIDE ENGINE
 * ================================
 * Series 65 — The Slipstream · Position 6
 *
 * Cure jealousy of pioneers. They broke the ice for you. Steer
 * into the cleared wake of the massive pioneer node — frictionless
 * high-speed cruise through otherwise impenetrable terrain.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — thick ice fracture
 * lines radiating from pioneer, cleared liquid channel with smooth
 * streamline flow visible in the wake.
 *
 * PHYSICS:
 *   - Screen covered in thick high-friction digital ice (texture)
 *   - Massive pioneer node smashes through leaving liquid channel
 *   - Trying to carve own path → grinding stall with haptic friction
 *   - Steer into the cleared wake → instant frictionless cruise
 *   - Streamlines visible in the clear channel
 *   - Ice fracture effects around pioneer node
 *
 * INTERACTION: Drag (steer into wake channel) → frictionless cruise
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static wake channel
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

const PIONEER_RADIUS   = 0.05;
const PIONEER_SPEED    = 0.003;
const NODE_RADIUS      = 0.016;
const GLOW_R_NODE      = 0.07;
const WAKE_HALF_H      = 0.065;        // channel half-height
const ICE_FRICTION     = 0.92;         // velocity damping on ice
const WAKE_FRICTION    = 0.998;        // nearly frictionless in wake
const CRUISE_SPEED     = 0.004;        // speed in wake
const ICE_SPEED        = 0.0003;       // crawl on ice
const FRACTURE_CT      = 12;           // ice fracture lines around pioneer
const STREAM_CT        = 8;            // streamlines in wake channel
const ICE_GRAIN_CT     = 60;           // ice texture grain count
const RESPAWN_DELAY    = 90;
const CRUISE_THRESHOLD = 200;          // frames to complete

// =====================================================================
// STATE
// =====================================================================

interface WakeState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  pioneerX: number;
  pioneerY: number;
  userX: number;
  userY: number;
  inWake: boolean;
  onIce: boolean;
  cruiseTime: number;
  dragging: boolean;
  completed: boolean;
  respawnTimer: number;
  iceGrains: { x: number; y: number; size: number }[];
}

function freshState(color: string, accent: string): WakeState {
  const grains = [];
  for (let i = 0; i < ICE_GRAIN_CT; i++) {
    grains.push({ x: Math.random(), y: Math.random(), size: 0.001 + Math.random() * 0.003 });
  }
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    pioneerX: 0.15, pioneerY: 0.5,
    userX: 0.55, userY: 0.7,
    inWake: false, onIce: true, cruiseTime: 0,
    dragging: false, completed: false, respawnTimer: 0,
    iceGrains: grains,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function WakeRidePioneerAtom({
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
      const pionR = px(PIONEER_RADIUS, minDim);

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        // Pioneer advances rightward
        s.pioneerX += PIONEER_SPEED;
        if (s.pioneerX > 1.15) s.pioneerX = -0.1;

        // Wake check: user is behind pioneer AND in the channel
        const behindPioneer = s.userX > s.pioneerX;
        const inChannel = Math.abs(s.userY - s.pioneerY) < WAKE_HALF_H;
        const wasInWake = s.inWake;
        s.inWake = behindPioneer && inChannel && s.userX < s.pioneerX + 0.5;
        s.onIce = !s.inWake;

        if (s.inWake && !wasInWake) {
          cb.onHaptic('drag_snap');
        }

        if (s.inWake) {
          // Cruise in wake
          s.userX += CRUISE_SPEED;
          s.userY += (s.pioneerY - s.userY) * 0.02;
          s.cruiseTime++;
          cb.onStateChange?.(Math.min(1, s.cruiseTime / CRUISE_THRESHOLD));

          if (s.cruiseTime >= CRUISE_THRESHOLD) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else if (s.dragging) {
          // On ice: friction haptic every 30 frames
          if (s.frameCount % 30 === 0) cb.onHaptic('error_boundary');
        }
      }

      // ── LAYER 2: Ice texture ──────────────────────────────────��─
      for (const grain of s.iceGrains) {
        // Skip grains that are in the wake channel
        const inChannel = grain.x > s.pioneerX && grain.x < s.pioneerX + 0.5 &&
                          Math.abs(grain.y - s.pioneerY) < WAKE_HALF_H;
        if (inChannel) continue;

        ctx.beginPath();
        ctx.arc(grain.x * w, grain.y * h, px(grain.size, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.background.min * 1.5 * entrance);
        ctx.fill();
      }

      // Ice surface overall tint
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.background.min * 0.5 * entrance);
      ctx.fillRect(0, 0, w, h);

      // ── LAYER 3: Cleared wake channel ──────────────────────────
      if (s.pioneerX > 0) {
        const chStartX = Math.max(0, (s.pioneerX - 0.02) * w);
        const chEndX = Math.min(w, (s.pioneerX + 0.5) * w);
        const chTopY = (s.pioneerY - WAKE_HALF_H) * h;
        const chBotY = (s.pioneerY + WAKE_HALF_H) * h;
        const chH = chBotY - chTopY;

        // Clear channel (darker = liquid)
        const chGrad = ctx.createLinearGradient(0, chTopY, 0, chBotY);
        chGrad.addColorStop(0, rgba(s.primaryRgb, 0));
        chGrad.addColorStop(0.2, rgba(s.primaryRgb, ALPHA.background.min * 3 * entrance));
        chGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.background.min * 4 * entrance));
        chGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.background.min * 3 * entrance));
        chGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = chGrad;
        ctx.fillRect(chStartX, chTopY, chEndX - chStartX, chH);

        // Channel edge lines (fracture edges)
        for (const yFrac of [s.pioneerY - WAKE_HALF_H, s.pioneerY + WAKE_HALF_H]) {
          ctx.beginPath();
          for (let t = 0; t <= 20; t++) {
            const fx = chStartX + (t / 20) * (chEndX - chStartX);
            const fy = yFrac * h + Math.sin(t * 2.3 + s.frameCount * 0.01 * ms) * px(0.003, minDim);
            if (t === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.6 * entrance);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();
        }

        // ── LAYER 4: Wake streamlines ─────────────────────────────
        for (let i = 0; i < STREAM_CT; i++) {
          const streamY = chTopY + (i + 0.5) / STREAM_CT * chH;
          ctx.beginPath();
          for (let t = 0; t <= 15; t++) {
            const sx = chStartX + (t / 15) * (chEndX - chStartX);
            const sOff = Math.sin(t * 0.8 + s.frameCount * 0.03 * ms + i) * px(0.002, minDim);
            if (t === 0) ctx.moveTo(sx, streamY + sOff); else ctx.lineTo(sx, streamY + sOff);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 5: Pioneer node with fracture aura ───────────────
      const piX = s.pioneerX * w;
      const piY = s.pioneerY * h;

      // Fracture lines radiating outward
      for (let i = 0; i < FRACTURE_CT; i++) {
        const angle = (i / FRACTURE_CT) * Math.PI * 2;
        const len = pionR * (1.5 + Math.sin(s.frameCount * 0.05 + i) * 0.3);
        ctx.beginPath();
        ctx.moveTo(piX + Math.cos(angle) * pionR, piY + Math.sin(angle) * pionR);
        ctx.lineTo(piX + Math.cos(angle) * len, piY + Math.sin(angle) * len);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.5 * entrance * ms);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // Pioneer glow
      const pGlow = ctx.createRadialGradient(piX, piY, 0, piX, piY, pionR * 3);
      pGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.3 * entrance));
      pGlow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = pGlow;
      ctx.fillRect(piX - pionR * 3, piY - pionR * 3, pionR * 6, pionR * 6);

      // Pioneer core
      ctx.beginPath();
      ctx.arc(piX, piY, pionR * (1 + breath * 0.02), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.65 * entrance);
      ctx.fill();

      // Leading edge highlight
      ctx.beginPath();
      ctx.arc(piX + pionR * 0.35, piY - pionR * 0.1, pionR * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.3),
                           ALPHA.content.max * 0.12 * entrance);
      ctx.fill();

      // ── LAYER 6: Ice grinding effect (when user on ice) ────────
      if (s.onIce && s.dragging && !s.completed) {
        const ux = s.userX * w;
        const uy = s.userY * h;
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = nodeR + Math.random() * px(0.015, minDim);
          const sparkX = ux + Math.cos(angle) * dist;
          const sparkY = uy + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, px(PARTICLE_SIZE.dot, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.4 * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 7: User node ──────────────────────────────────────
      if (!s.completed) {
        const ux = s.userX * w;
        const uy = s.userY * h;
        const iceShake = s.onIce && s.dragging
          ? Math.sin(s.frameCount * 0.4 * ms) * px(0.003, minDim) : 0;

        // Glow
        const gr = px(GLOW_R_NODE, minDim);
        const glowInt = s.inWake ? 0.4 : 0.15;
        const nGlow = ctx.createRadialGradient(ux, uy, 0, ux, uy, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(ux - gr, uy - gr, gr * 2, gr * 2);

        // Core
        ctx.beginPath();
        ctx.arc(ux + iceShake, uy, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Wake indicator ring
        if (s.inWake) {
          const ringR = nodeR * (2.2 + Math.sin(s.frameCount * 0.05) * 0.3);
          ctx.beginPath();
          ctx.arc(ux, uy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.35 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.inWake) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText('CRUISING IN WAKE', cx, h - px(0.035, minDim));
      } else if (s.onIce && s.dragging) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText('GRINDING ICE', cx, h - px(0.035, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        // Static cleared channel
        const chY = cy - px(WAKE_HALF_H, h);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 3 * entrance);
        ctx.fillRect(0, chY, w, px(WAKE_HALF_H * 2, h));
        ctx.beginPath();
        ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ───��─────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.pioneerX = 0.15; s.userX = 0.55; s.userY = 0.7;
          s.inWake = false; s.onIce = true; s.cruiseTime = 0;
          s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      if (!s.inWake) {
        s.userX = (e.clientX - rect.left) / rect.width;
        s.userY = (e.clientY - rect.top) / rect.height;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
