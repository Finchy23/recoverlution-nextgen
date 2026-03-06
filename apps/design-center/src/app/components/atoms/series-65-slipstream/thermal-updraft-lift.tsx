/**
 * ATOM 643: THE THERMAL UPDRAFT ENGINE
 * ======================================
 * Series 65 — The Slipstream · Position 3
 *
 * Prove forced hype drains you. Rapid upward swiping drains
 * battery for pitiful lift. Steer into the shimmering thermal
 * column — the updraft carries you to the top at 100% battery.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — shimmering
 * vertical thermal column with rising heat distortion particles.
 *
 * PHYSICS:
 *   - Node sinks slowly in cold digital sky under gravity
 *   - Rapid upward flapping (tapping) drains energy for tiny lift
 *   - Shimmering thermal column at a fixed X — heat particles rise
 *   - Steer node horizontally into column → updraft catches it
 *   - Node rises effortlessly to top; battery stays at 100%
 *   - Multi-layer heat shimmer, rising particles, altitude markers
 *
 * INTERACTION: Drag (horizontal into thermal) → effortless ascent
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static node at peak
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

const NODE_RADIUS    = 0.018;
const GLOW_R_NODE    = 0.08;
const GRAVITY        = 0.0004;        // sink rate per frame
const FLAP_LIFT      = -0.012;        // tiny lift per tap
const FLAP_DRAIN     = 0.08;          // energy cost per flap
const THERMAL_X      = 0.62;          // column center X
const THERMAL_WIDTH  = 0.08;          // column half-width
const UPDRAFT_SPEED  = 0.0035;        // rise speed in thermal
const UPDRAFT_REFILL = 0.005;         // energy gain in thermal
const HEAT_PARTICLE  = 24;            // shimmer particle count
const COLUMN_EDGE_CT = 2;             // column boundary lines
const ALT_MARKER_CT  = 5;             // altitude markers
const COMPLETION_Y   = 0.08;          // top threshold
const RESPAWN_DELAY  = 100;

// =====================================================================
// STATE
// =====================================================================

interface ThermalState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  nodeY: number;
  nodeVy: number;
  battery: number;
  inThermal: boolean;
  dragging: boolean;
  completed: boolean;
  respawnTimer: number;
  flapCooldown: number;
  heatParticles: { x: number; y: number; speed: number; size: number; alpha: number }[];
  thermalBloom: number;
}

function freshState(color: string, accent: string): ThermalState {
  const particles = [];
  for (let i = 0; i < HEAT_PARTICLE; i++) {
    particles.push({
      x: THERMAL_X + (Math.random() - 0.5) * THERMAL_WIDTH * 2,
      y: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      size: 0.003 + Math.random() * 0.004,
      alpha: 0.3 + Math.random() * 0.4,
    });
  }
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    nodeX: 0.25, nodeY: 0.75, nodeVy: 0,
    battery: 1, inThermal: false,
    dragging: false, completed: false, respawnTimer: 0,
    flapCooldown: 0, heatParticles: particles, thermalBloom: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function ThermalUpdraftLiftAtom({
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
        s.flapCooldown = Math.max(0, s.flapCooldown - 1);

        if (!s.inThermal) {
          // Gravity pulls down
          s.nodeVy += GRAVITY;
          s.nodeY = Math.min(0.88, s.nodeY + s.nodeVy);
          s.nodeVy *= 0.98; // drag
        } else {
          // Thermal updraft
          s.nodeY -= UPDRAFT_SPEED;
          s.nodeX += (THERMAL_X - s.nodeX) * 0.03; // center in column
          s.battery = Math.min(1, s.battery + UPDRAFT_REFILL);
          s.nodeVy = 0;
          s.thermalBloom = Math.min(1, s.thermalBloom + 0.018);
          cb.onStateChange?.(Math.max(0, 1 - s.nodeY));

          if (s.nodeY <= COMPLETION_Y) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Check thermal entry
        if (!s.inThermal && Math.abs(s.nodeX - THERMAL_X) < THERMAL_WIDTH) {
          s.inThermal = true;
          s.nodeVy = 0;
          cb.onHaptic('drag_snap');
        }
        if (!s.inThermal) s.thermalBloom *= 0.96;

        // Heat particles
        for (const hp of s.heatParticles) {
          hp.y -= hp.speed;
          hp.x += Math.sin(s.frameCount * 0.03 + hp.y * 10) * 0.0005;
          if (hp.y < -0.05) {
            hp.y = 1.05;
            hp.x = THERMAL_X + (Math.random() - 0.5) * THERMAL_WIDTH * 2;
          }
        }
      }

      // ── LAYER 2: Altitude markers ──────────────────────────────
      for (let i = 0; i < ALT_MARKER_CT; i++) {
        const my = h * (0.1 + i * 0.17);
        ctx.setLineDash([px(0.004, minDim), px(0.012, minDim)]);
        ctx.beginPath();
        ctx.moveTo(w * 0.08, my);
        ctx.lineTo(w * 0.92, my);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 0.8 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── LAYER 3: Thermal column background ─────────────────────
      const tcx = THERMAL_X * w;
      const colHalfW = THERMAL_WIDTH * w;
      const colGrad = ctx.createLinearGradient(tcx - colHalfW, 0, tcx + colHalfW, 0);
      colGrad.addColorStop(0, rgba(s.primaryRgb, 0));
      colGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance));
      colGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.background.min * 3 * entrance));
      colGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance));
      colGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = colGrad;
      ctx.fillRect(tcx - colHalfW, 0, colHalfW * 2, h);

      // Column edge lines
      for (const sign of [-1, 1]) {
        ctx.setLineDash([px(0.006, minDim), px(0.01, minDim)]);
        ctx.beginPath();
        ctx.moveTo(tcx + sign * colHalfW, 0);
        ctx.lineTo(tcx + sign * colHalfW, h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── LAYER 4: Heat shimmer particles ────────────────────────
      for (const hp of s.heatParticles) {
        const hpx = hp.x * w;
        const hpy = hp.y * h;
        const shimmer = Math.sin(s.frameCount * 0.1 + hp.y * 20) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(hpx, hpy, px(hp.size, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, hp.alpha * shimmer * ALPHA.atmosphere.min * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 5: Thermal updraft arrows ────────────────────────
      if (s.inThermal) {
        for (let i = 0; i < 3; i++) {
          const arrowY = ((s.frameCount * 2 + i * h / 3) % h);
          const arrowAlpha = (1 - arrowY / h) * 0.3 * entrance;
          ctx.beginPath();
          ctx.moveTo(tcx, arrowY - px(0.01, minDim));
          ctx.lineTo(tcx - px(0.008, minDim), arrowY + px(0.005, minDim));
          ctx.moveTo(tcx, arrowY - px(0.01, minDim));
          ctx.lineTo(tcx + px(0.008, minDim), arrowY + px(0.005, minDim));
          ctx.strokeStyle = rgba(s.primaryRgb, arrowAlpha);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();
        }
      }

      // Thermal bloom: once the column catches, the top of the scene becomes
      // a receiving canopy rather than a simple vertical rise.
      const bloomStrength = s.completed ? 1 : s.thermalBloom;
      if (bloomStrength > 0.01) {
        const canopyY = h * 0.16;
        const canopyHalfW = colHalfW * (1.5 + bloomStrength * 1.2);
        const canopyHalfH = px(0.045 + bloomStrength * 0.025, minDim);
        const canopy = ctx.createRadialGradient(tcx, canopyY, 0, tcx, canopyY, canopyHalfW * 1.1);
        canopy.addColorStop(0, rgba(s.primaryRgb, 0.14 * bloomStrength * entrance));
        canopy.addColorStop(0.55, rgba(s.primaryRgb, 0.06 * bloomStrength * entrance));
        canopy.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = canopy;
        ctx.fillRect(tcx - canopyHalfW * 1.1, canopyY - canopyHalfH * 1.6, canopyHalfW * 2.2, canopyHalfH * 3.2);

        for (let i = 0; i < 5; i++) {
          const frac = i / 4;
          ctx.beginPath();
          ctx.moveTo(tcx - colHalfW * (0.35 + frac * 0.28), h * 0.75 - frac * h * 0.12);
          ctx.quadraticCurveTo(
            tcx - colHalfW * (0.18 + frac * 0.12),
            h * (0.52 - frac * 0.07),
            tcx,
            canopyY + canopyHalfH * (frac - 0.5) * 0.5
          );
          ctx.moveTo(tcx + colHalfW * (0.35 + frac * 0.28), h * 0.75 - frac * h * 0.12);
          ctx.quadraticCurveTo(
            tcx + colHalfW * (0.18 + frac * 0.12),
            h * (0.52 - frac * 0.07),
            tcx,
            canopyY - canopyHalfH * (frac - 0.5) * 0.5
          );
          ctx.strokeStyle = rgba(s.primaryRgb, (0.05 + frac * 0.04) * bloomStrength * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 6: Battery bar ───────────────────────────────────
      const barX = w * 0.04;
      const barH = h * 0.35;
      const barY = cy - barH / 2;
      const barW = px(0.01, minDim);

      // Bar bg
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);

      // Bar fill
      const batColor = s.battery > 0.3 ? s.primaryRgb : s.accentRgb;
      ctx.fillStyle = rgba(batColor, ALPHA.content.max * 0.7 * entrance);
      ctx.fillRect(barX, barY + barH * (1 - s.battery), barW, barH * s.battery);

      // Battery label
      const bFontSize = Math.max(7, px(FONT_SIZE.xs, minDim));
      ctx.font = `${bFontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`${Math.round(s.battery * 100)}%`, barX + barW / 2, barY - px(0.01, minDim));

      // ── LAYER 7: Node with glow ────────────────────────────────
      if (!s.completed) {
        const nx = s.nodeX * w;
        const ny = s.nodeY * h;

        // Glow (brighter in thermal)
        const glowInt = s.inThermal ? 0.45 : 0.15;
        const gr = px(GLOW_R_NODE, minDim);
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

        // Core node
        const sinkShake = !s.inThermal ? Math.sin(s.frameCount * 0.2 * ms) * px(0.002, minDim) : 0;
        ctx.beginPath();
        ctx.arc(nx + sinkShake, ny, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Wing indicator (in thermal: expanded wings)
        if (s.inThermal) {
          const wingSpan = nodeR * 3;
          ctx.beginPath();
          ctx.moveTo(nx - wingSpan, ny);
          ctx.quadraticCurveTo(nx, ny - nodeR * 0.5, nx + wingSpan, ny);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.5 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: Status HUD ────────────────────────────────────
      if (s.inThermal && !s.completed) {
        const hFontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${hFontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
        const alt = Math.round((1 - s.nodeY) * 100);
        ctx.fillText(`ALT ${alt}%`, cx, h - px(0.03, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        // Static: node at top of thermal column
        ctx.beginPath();
        ctx.arc(tcx, h * 0.15, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.nodeX = 0.25; s.nodeY = 0.75; s.nodeVy = 0;
          s.battery = 1; s.inThermal = false;
          s.completed = false; s.flapCooldown = 0; s.thermalBloom = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);

      // Flapping behavior: tap to flap if not in thermal
      if (!s.inThermal && !s.completed && s.flapCooldown <= 0 && s.battery > 0.05) {
        s.nodeVy = FLAP_LIFT;
        s.battery = Math.max(0, s.battery - FLAP_DRAIN);
        s.flapCooldown = 10;
        cbRef.current.onHaptic('error_boundary');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      s.nodeX = (e.clientX - rect.left) / rect.width;
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
