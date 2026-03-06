/**
 * ATOM 654: THE GYROSCOPIC STABILIZER ENGINE
 * ============================================
 * Series 66 — The Centrifuge · Position 4
 *
 * Cure emotional fragility. Swipe a circular gesture to engage
 * the internal gyroscope — no matter how violently the external
 * UI tilts, shakes, or crashes, the node refuses to tip.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — gyroscopic
 * axis lock with visible precession rings, external chaos impacts,
 * and unshakeable vertical stability.
 *
 * PHYSICS:
 *   - Node rests on tilting platform
 *   - External impacts tilt the platform violently
 *   - Circular swipe engages internal gyroscope (visible spin rings)
 *   - Gyro-locked node maintains perfect vertical axis
 *   - Platform tilts, shakes, crashes — node stays upright
 *   - Precession rings visible around stabilized node
 *
 * INTERACTION: Drag (circular) → engage gyroscope → immune to tilt
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static stable node
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

const NODE_RADIUS      = 0.025;
const GLOW_R_NODE      = 0.1;
const PLATFORM_WIDTH   = 0.7;
const PLATFORM_Y       = 0.6;
const GYRO_RINGS       = 3;
const TILT_SPEED       = 0.02;
const TILT_MAX         = 0.25;
const IMPACT_INTERVAL  = 90;           // frames between impacts
const GYRO_THRESHOLD   = 0.4;          // spin needed to engage
const GYRO_DECAY       = 0.994;
const GYRO_GAIN        = 0.01;
const SURVIVE_IMPACTS  = 5;            // impacts to survive for completion
const RESPAWN_DELAY    = 90;

// =====================================================================
// STATE
// =====================================================================

interface GyroState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  platformTilt: number;       // -1 to 1
  gyroSpin: number;           // 0-1
  gyroAngle: number;
  gyroEngaged: boolean;
  impactTimer: number;
  impactDir: number;
  survivedImpacts: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
  prevAngle: number;
  completed: boolean;
  respawnTimer: number;
  shakeAmplitude: number;
}

function freshState(color: string, accent: string): GyroState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    platformTilt: 0, gyroSpin: 0, gyroAngle: 0,
    gyroEngaged: false, impactTimer: 60, impactDir: 1,
    survivedImpacts: 0, dragging: false, lastX: 0, lastY: 0, prevAngle: 0,
    completed: false, respawnTimer: 0, shakeAmplitude: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function GyroscopicStabilizerAtom({
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

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.gyroSpin *= GYRO_DECAY;
        s.gyroAngle += s.gyroSpin * 0.2;
        s.gyroEngaged = s.gyroSpin >= GYRO_THRESHOLD;
        s.shakeAmplitude *= 0.92;

        // Impact timer
        s.impactTimer--;
        if (s.impactTimer <= 0) {
          s.impactDir = Math.random() > 0.5 ? 1 : -1;
          s.platformTilt += s.impactDir * TILT_MAX * (0.5 + Math.random() * 0.5);
          s.platformTilt = Math.max(-TILT_MAX, Math.min(TILT_MAX, s.platformTilt));
          s.shakeAmplitude = 0.008;
          s.impactTimer = IMPACT_INTERVAL + Math.floor(Math.random() * 40);

          if (s.gyroEngaged) {
            s.survivedImpacts++;
            cb.onHaptic('drag_snap');
            cb.onStateChange?.(Math.min(1, s.survivedImpacts / SURVIVE_IMPACTS));
          } else {
            cb.onHaptic('error_boundary');
          }

          if (s.survivedImpacts >= SURVIVE_IMPACTS) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Platform slowly returns to level
        s.platformTilt *= 0.98;
      }

      const platY = h * PLATFORM_Y;
      const platW = w * PLATFORM_WIDTH;
      const tiltPx = s.platformTilt * px(0.15, h);

      // ── LAYER 2: Tilting platform ──────────────────────────────
      ctx.save();
      ctx.translate(cx, platY);

      // Platform body
      ctx.beginPath();
      ctx.moveTo(-platW / 2, tiltPx);
      ctx.lineTo(platW / 2, -tiltPx);
      ctx.lineTo(platW / 2, -tiltPx + px(0.015, h));
      ctx.lineTo(-platW / 2, tiltPx + px(0.015, h));
      ctx.closePath();
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.fill();
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Impact indicator
      if (s.shakeAmplitude > 0.001) {
        const impactX = s.impactDir > 0 ? platW / 2 : -platW / 2;
        const impactY = s.impactDir > 0 ? -tiltPx : tiltPx;
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * px(0.04, minDim);
          ctx.beginPath();
          ctx.arc(impactX + Math.cos(angle) * dist, impactY + Math.sin(angle) * dist,
                  px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, s.shakeAmplitude * 20 * ALPHA.content.max * entrance * ms);
          ctx.fill();
        }
      }

      ctx.restore();

      // ── LAYER 3: Support struts ────────────────────────────────
      // Fulcrum triangle
      ctx.beginPath();
      ctx.moveTo(cx, platY + px(0.02, h));
      ctx.lineTo(cx - px(0.02, minDim), platY + px(0.1, h));
      ctx.lineTo(cx + px(0.02, minDim), platY + px(0.1, h));
      ctx.closePath();
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.fill();

      // ── LAYER 4: Gyroscopic rings ─────────────────────────────
      const nodeY = platY - nodeR * 2;
      const shake = s.shakeAmplitude * Math.sin(s.frameCount * 0.8) * minDim;
      const nodeDrawX = s.gyroEngaged ? cx : cx + shake;
      const nodeDrawY = s.gyroEngaged ? nodeY : nodeY + Math.abs(shake) * 0.3;

      if (s.gyroSpin > 0.05) {
        for (let i = 0; i < GYRO_RINGS; i++) {
          const ringR = nodeR * (1.8 + i * 0.8);
          const ringAngle = s.gyroAngle + i * Math.PI / GYRO_RINGS;

          ctx.save();
          ctx.translate(nodeDrawX, nodeDrawY);
          ctx.rotate(ringAngle);
          ctx.scale(1, 0.3 + i * 0.1);

          ctx.beginPath();
          ctx.arc(0, 0, ringR, 0, Math.PI * 2);
          const ringAlpha = ALPHA.atmosphere.max * s.gyroSpin * (1 - i * 0.2) * entrance;
          ctx.strokeStyle = rgba(s.primaryRgb, ringAlpha);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();

          ctx.restore();
        }
      }

      // ── LAYER 5: Stability axis line ───────────────────────────
      if (s.gyroEngaged) {
        ctx.setLineDash([px(0.004, minDim), px(0.006, minDim)]);
        ctx.beginPath();
        ctx.moveTo(nodeDrawX, nodeDrawY - px(0.08, minDim));
        ctx.lineTo(nodeDrawX, nodeDrawY + px(0.08, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── LAYER 6: Node glow + core ─────────────────────────────
      const gr = px(GLOW_R_NODE, minDim);
      const glowInt = s.gyroEngaged ? 0.45 : 0.2;
      const nGlow = ctx.createRadialGradient(nodeDrawX, nodeDrawY, 0, nodeDrawX, nodeDrawY, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(nodeDrawX - gr, nodeDrawY - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(nodeDrawX, nodeDrawY, nodeR * (1 + breath * 0.04), 0, Math.PI * 2);
      const coreColor = s.gyroEngaged
        ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2)
        : s.primaryRgb;
      ctx.fillStyle = rgba(coreColor, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 7: Gyro RPM gauge ───────────────────────────────
      const gaugeR = px(0.18, minDim);
      const gaugeStart = Math.PI * 0.6;
      const gaugeEnd = Math.PI * 2.4;
      const gaugeFill = gaugeStart + (gaugeEnd - gaugeStart) * Math.min(1, s.gyroSpin);

      ctx.beginPath();
      ctx.arc(cx, cy - px(0.15, minDim), gaugeR, gaugeStart, gaugeEnd);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      if (s.gyroSpin > 0.02) {
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.15, minDim), gaugeR, gaugeStart, gaugeFill);
        const gColor = s.gyroEngaged ? s.primaryRgb : s.accentRgb;
        ctx.strokeStyle = rgba(gColor, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // Threshold marker
      const threshAngle = gaugeStart + (gaugeEnd - gaugeStart) * GYRO_THRESHOLD;
      const tmx = cx + Math.cos(threshAngle) * gaugeR;
      const tmy = cy - px(0.15, minDim) + Math.sin(threshAngle) * gaugeR;
      ctx.beginPath();
      ctx.arc(tmx, tmy, px(0.004, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.gyroEngaged) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.45 * entrance);
        ctx.fillText(`LOCKED ${s.survivedImpacts}/${SURVIVE_IMPACTS}`, cx, h - px(0.035, minDim));
      } else if (!s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('TRACE CIRCLE TO ENGAGE', cx, h - px(0.035, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, nodeY, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.platformTilt = 0; s.gyroSpin = 0; s.gyroEngaged = false;
          s.survivedImpacts = 0; s.impactTimer = 60; s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.lastX = (e.clientX - rect.left) / rect.width;
      s.lastY = (e.clientY - rect.top) / rect.height;
      s.prevAngle = Math.atan2(s.lastY - 0.5, s.lastX - 0.5);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const angle = Math.atan2(my - 0.5, mx - 0.5);
      let delta = angle - s.prevAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.gyroSpin = Math.min(1, s.gyroSpin + Math.abs(delta) * GYRO_GAIN * 10);
      s.prevAngle = angle;
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
