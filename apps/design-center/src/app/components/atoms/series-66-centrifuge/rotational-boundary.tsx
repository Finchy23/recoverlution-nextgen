/**
 * ATOM 651: THE ROTATIONAL BOUNDARY ENGINE
 * ==========================================
 * Series 66 — The Centrifuge · Position 1
 *
 * Cure emotional contagion. Trace a fast tight circle on your
 * core — centrifugal force throws every toxic particle to the
 * extreme outer edges creating a massive silent safety circle.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — particles
 * visibly repelled along radial streamlines from spinning core.
 *
 * PHYSICS:
 *   - Core swarmed by erratic toxic particles (chaotic buzz)
 *   - Trace circular gesture on core to spin it up
 *   - RPM increases → centrifugal force field expands outward
 *   - Toxic particles violently thrown to screen edges
 *   - Silent empty safety zone expands around core
 *   - Radial repulsion streamlines visible during spin
 *
 * INTERACTION: Drag (circular trace) → spin up → repulsion field
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static safety zone
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

const CORE_RADIUS      = 0.03;
const GLOW_R_CORE      = 0.12;
const TOXIC_COUNT      = 80;
const SPIN_DECAY       = 0.992;        // RPM decay per frame
const SPIN_GAIN        = 0.008;        // RPM gain per circular pixel
const REPULSION_FORCE  = 0.0004;       // outward force per RPM unit
const RPM_THRESHOLD    = 0.3;          // minimum RPM for repulsion
const COMPLETION_CLEAR = 0.85;         // fraction of particles at edge
const SAFETY_RING_CT   = 3;            // concentric safety rings
const RADIAL_LINE_CT   = 12;           // repulsion streamlines
const RESPAWN_DELAY    = 90;

// =====================================================================
// STATE
// =====================================================================

interface ToxicParticle {
  x: number; y: number; vx: number; vy: number;
  size: number; phase: number;
}

interface SpinState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  rpm: number;
  angle: number;              // total rotation angle
  toxics: ToxicParticle[];
  dragging: boolean;
  lastX: number;
  lastY: number;
  prevAngle: number;
  completed: boolean;
  respawnTimer: number;
  moatStrength: number;
}

function makeToxics(): ToxicParticle[] {
  const particles: ToxicParticle[] = [];
  for (let i = 0; i < TOXIC_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.05 + Math.random() * 0.15;
    particles.push({
      x: 0.5 + Math.cos(angle) * dist,
      y: 0.5 + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      size: 0.003 + Math.random() * 0.004,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

function freshState(color: string, accent: string): SpinState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    rpm: 0, angle: 0,
    toxics: makeToxics(),
    dragging: false, lastX: 0, lastY: 0, prevAngle: 0,
    completed: false, respawnTimer: 0, moatStrength: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function RotationalBoundaryAtom({
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
      const coreR = px(CORE_RADIUS, minDim);

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        // RPM decay
        s.rpm *= SPIN_DECAY;
        s.angle += s.rpm * 0.1;

        // Centrifugal force on toxic particles
        if (s.rpm > RPM_THRESHOLD) {
          let edgeCount = 0;
          for (const t of s.toxics) {
            const dx = t.x - 0.5;
            const dy = t.y - 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.01) continue;
            const nx = dx / dist;
            const ny = dy / dist;
            const force = REPULSION_FORCE * s.rpm;
            t.vx += nx * force;
            t.vy += ny * force;
            if (dist > 0.45) edgeCount++;
          }
          s.moatStrength = Math.min(1, edgeCount / (TOXIC_COUNT * COMPLETION_CLEAR));

          // Check completion
          if (edgeCount / TOXIC_COUNT > COMPLETION_CLEAR) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
        if (s.rpm <= RPM_THRESHOLD) s.moatStrength *= 0.97;

        // Update toxic positions
        for (const t of s.toxics) {
          t.x += t.vx;
          t.y += t.vy;
          t.vx *= 0.98;
          t.vy *= 0.98;
          // Wander when not repelled
          if (s.rpm < RPM_THRESHOLD) {
            t.vx += Math.sin(s.frameCount * 0.03 + t.phase) * 0.0002;
            t.vy += Math.cos(s.frameCount * 0.025 + t.phase * 1.3) * 0.0002;
            // Drift toward center
            t.vx += (0.5 - t.x) * 0.0003;
            t.vy += (0.5 - t.y) * 0.0003;
          }
          // Clamp to screen
          t.x = Math.max(0, Math.min(1, t.x));
          t.y = Math.max(0, Math.min(1, t.y));
        }

        cb.onStateChange?.(Math.min(1, s.rpm / 0.8));
      }

      // ── LAYER 2: Safety zone (expanding clear area) ─────────────
      const safeRadius = px(Math.min(0.4, s.rpm * 0.5), minDim);
      if (s.rpm > RPM_THRESHOLD) {
        const safeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, safeRadius);
        safeGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance));
        safeGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.background.min * entrance));
        safeGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = safeGrad;
        ctx.fillRect(cx - safeRadius, cy - safeRadius, safeRadius * 2, safeRadius * 2);
      }

      // ── LAYER 3: Safety rings ───────────────────────────────────
      if (s.rpm > RPM_THRESHOLD) {
        for (let i = 0; i < SAFETY_RING_CT; i++) {
          const ringR = safeRadius * (0.4 + i * 0.3);
          const ringAlpha = ALPHA.atmosphere.min * (1 - i * 0.25) * (s.rpm / 1) * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ringAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      const moatStrength = s.completed ? 1 : s.moatStrength;
      if (moatStrength > 0.01) {
        const moatInner = safeRadius * 1.02;
        const moatOuter = safeRadius * (1.28 + moatStrength * 0.22);
        ctx.beginPath();
        ctx.arc(cx, cy, moatOuter, 0, Math.PI * 2);
        ctx.arc(cx, cy, moatInner, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, 0.08 * moatStrength * entrance);
        ctx.fill();

        for (let i = 0; i < 8; i++) {
          const gateA = s.angle * 0.3 + (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx, cy, (moatInner + moatOuter) * 0.5, gateA - 0.18, gateA + 0.18);
          ctx.strokeStyle = rgba(s.primaryRgb, 0.12 * moatStrength * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 4: Radial repulsion streamlines ──────────────────
      if (s.rpm > RPM_THRESHOLD * 1.5) {
        for (let i = 0; i < RADIAL_LINE_CT; i++) {
          const lineAngle = s.angle + (i / RADIAL_LINE_CT) * Math.PI * 2;
          const innerR = coreR * 1.5;
          const outerR = safeRadius * 0.9;
          const sx = cx + Math.cos(lineAngle) * innerR;
          const sy = cy + Math.sin(lineAngle) * innerR;
          const ex = cx + Math.cos(lineAngle) * outerR;
          const ey = cy + Math.sin(lineAngle) * outerR;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          const lineAlpha = ALPHA.atmosphere.min * 0.4 * (s.rpm / 1) * entrance * ms;
          ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();

          // Arrow tip
          const arrowLen = px(0.008, minDim);
          const arrowAngle = lineAngle;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - Math.cos(arrowAngle - 0.4) * arrowLen,
                     ey - Math.sin(arrowAngle - 0.4) * arrowLen);
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - Math.cos(arrowAngle + 0.4) * arrowLen,
                     ey - Math.sin(arrowAngle + 0.4) * arrowLen);
          ctx.stroke();
        }
      }

      // ── LAYER 5: Toxic particles ───────────────────────────────
      for (const t of s.toxics) {
        const tx = t.x * w;
        const ty = t.y * h;
        const dist = Math.sqrt((t.x - 0.5) ** 2 + (t.y - 0.5) ** 2);
        const tAlpha = Math.min(1, 0.3 + dist * 1.5) * ALPHA.content.max * entrance * ms;

        // Toxic glow (faint)
        ctx.beginPath();
        ctx.arc(tx, ty, px(t.size * 2.5, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.glow.max * 0.1 * entrance * ms);
        ctx.fill();

        // Toxic core
        ctx.beginPath();
        ctx.arc(tx, ty, px(t.size, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, tAlpha);
        ctx.fill();
      }

      // ── LAYER 6: Spinning core ─────────────────────────────────
      // Core glow
      const gr = px(GLOW_R_CORE, minDim);
      const glowInt = 0.2 + s.rpm * 0.5;
      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow;
      ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);

      // Core body
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * (1 + breath * 0.04), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Spin indicator marks
      if (s.rpm > 0.05) {
        for (let i = 0; i < 4; i++) {
          const markAngle = s.angle + i * Math.PI / 2;
          const markR = coreR * 0.6;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(markAngle) * markR, cy + Math.sin(markAngle) * markR,
                  px(0.003, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
                               ALPHA.content.max * 0.5 * entrance);
          ctx.fill();
        }
      }

      // ── LAYER 7: RPM gauge arc ─────────────────────────────────
      const gaugeR = px(SIZE.md * 0.6, minDim);
      const gaugeStart = -Math.PI * 0.75;
      const gaugeEnd = Math.PI * 0.75;
      const gaugeFill = gaugeStart + (gaugeEnd - gaugeStart) * Math.min(1, s.rpm);

      // Gauge background
      ctx.beginPath();
      ctx.arc(cx, cy, gaugeR, gaugeStart, gaugeEnd);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Gauge fill
      if (s.rpm > 0.02) {
        ctx.beginPath();
        ctx.arc(cx, cy, gaugeR, gaugeStart, gaugeFill);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.rpm > RPM_THRESHOLD) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText('REPELLING', cx, cy + gaugeR + px(0.03, minDim));
      } else if (!s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('TRACE CIRCLE TO SPIN', cx, cy + gaugeR + px(0.03, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        // Static safety zone
        ctx.beginPath();
        ctx.arc(cx, cy, px(0.2, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.rpm = 0; s.angle = 0; s.toxics = makeToxics();
          s.completed = false; s.moatStrength = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.lastX = (e.clientX - rect.left) / rect.width;
      s.lastY = (e.clientY - rect.top) / rect.height;
      s.prevAngle = Math.atan2(s.lastY - 0.5, s.lastX - 0.5);
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const angle = Math.atan2(my - 0.5, mx - 0.5);
      let delta = angle - s.prevAngle;
      // Normalize to -PI..PI
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;

      s.rpm = Math.min(1, s.rpm + Math.abs(delta) * SPIN_GAIN * 10);
      s.prevAngle = angle;
      s.lastX = mx;
      s.lastY = my;

      const tier = Math.floor(s.rpm * 5);
      if (tier > 0 && s.frameCount % 15 === 0) {
        cbRef.current.onHaptic('step_advance');
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
