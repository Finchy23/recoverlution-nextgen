/**
 * ATOM 610: THE KINETIC CONVERSION ENGINE
 * =========================================
 * Series 61 — Aikido Redirect · Position 10
 *
 * The apex: chaos is free energy. Place your thumb dead-center
 * converting your node into a fixed turbine. The massive chaos wave
 * strikes and spins it — 100% toxic kinetic energy becomes
 * blinding white power.
 *
 * PHYSICS:
 *   - Massive screen-filling wave of red chaos rushes user
 *   - Place thumb on center → node becomes fixed turbine
 *   - Chaos wave strikes → spins turbine violently
 *   - Physics converts kinetic energy → blinding white power
 *   - UI charges to maximum capacity
 *
 * INTERACTION:
 *   Hold (center) → converts node to turbine → captures chaos
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static turbine with energy bar
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const TURBINE_R_FRAC = 0.04;
const BLADE_COUNT = 6;
const WAVE_SPEED = 0.003;
const SPIN_ACCEL = 0.003;
const MAX_SPIN = 0.3;
const POWER_RATE = 0.004;
const CHAOS_PARTICLE_COUNT = 60;

interface ChaosParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
}

function createChaos(): ChaosParticle[] {
  const particles: ChaosParticle[] = [];
  for (let i = 0; i < CHAOS_PARTICLE_COUNT; i++) {
    particles.push({
      x: -0.1 - Math.random() * 0.3,
      y: Math.random(),
      vx: 0.003 + Math.random() * 0.005,
      vy: (Math.random() - 0.5) * 0.002,
      size: 0.003 + Math.random() * 0.006,
      alpha: 0.3 + Math.random() * 0.7,
    });
  }
  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function KineticConversionTurbineAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
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
    // Turbine
    holding: false,
    turbineActive: false,
    spinSpeed: 0,
    spinAngle: 0,
    power: 0,        // 0→1
    // Chaos wave
    chaosParticles: createChaos(),
    waveReached: false,
    // Completion
    completed: false,
    lastPowerTier: 0,
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
      const breath = p.breathAmplitude;
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      const turbineR = px(TURBINE_R_FRAC, minDim);

      // ── Chaos wave physics ──────────────────────────
      if (!p.reducedMotion) {
        let anyReached = false;
        for (const cp of s.chaosParticles) {
          cp.x += cp.vx;
          cp.y += cp.vy;
          cp.vy += (Math.random() - 0.5) * 0.0003;

          // Check if chaos reaches turbine
          if (cp.x > 0.45 && cp.x < 0.55 && s.turbineActive) {
            anyReached = true;
            // Absorbed — reset particle to left
            cp.x = -0.1 - Math.random() * 0.2;
            cp.y = Math.random();
          }

          // Wrap if it passes through without turbine
          if (cp.x > 1.2) {
            cp.x = -0.1 - Math.random() * 0.2;
            cp.y = Math.random();
          }
        }

        if (anyReached && s.turbineActive) {
          s.spinSpeed = Math.min(MAX_SPIN, s.spinSpeed + SPIN_ACCEL);
          s.power = Math.min(1, s.power + POWER_RATE);
          cb.onStateChange?.(s.power);

          const powerTier = Math.floor(s.power * 5);
          if (powerTier > s.lastPowerTier) {
            cb.onHaptic('step_advance');
            s.lastPowerTier = powerTier;
          }

          if (s.power >= 0.99 && !s.completed) {
            s.completed = true;
            cb.onHaptic('seal_stamp');
            cb.onStateChange?.(1);
          }
        }

        // Spin
        s.spinAngle += s.spinSpeed * ms;
        if (!s.holding) {
          s.spinSpeed *= 0.98;
        }
      }

      if (s.power > 0.02) {
        const conductorAlpha = ALPHA.atmosphere.max * s.power * 0.18 * entrance;
        for (let i = 0; i < 8; i++) {
          const rayAngle = s.spinAngle * 0.35 + (Math.PI * 2 * i) / 8;
          const rayX = cx + Math.cos(rayAngle) * minDim * 0.42;
          const rayY = cy + Math.sin(rayAngle) * minDim * 0.42;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(rayX, rayY);
          ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, s.power * 0.8), conductorAlpha);
          ctx.lineWidth = px(0.0012 + s.power * 0.001, minDim);
          ctx.stroke();
        }
      }

      // ── Draw chaos particles ────────────────────────
      for (const cp of s.chaosParticles) {
        const cpx = cp.x * w;
        const cpy = cp.y * h;
        const cps = px(cp.size, minDim);
        const cpAlpha = cp.alpha * ALPHA.content.max * entrance;

        if (cpx < -minDim * 0.05 || cpx > w + minDim * 0.05) continue;

        ctx.beginPath();
        ctx.arc(cpx, cpy, cps, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, cpAlpha);
        ctx.fill();
      }

      // ── Draw turbine ───────────────────────────────
      // Power glow
      if (s.power > 0) {
        const powerGlowR = turbineR * (3 + s.power * 4);
        const powerColor = lerpColor(s.primaryRgb, [255, 255, 255] as RGB, s.power * 0.6);
        const powerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, powerGlowR);
        powerGlow.addColorStop(0, rgba(powerColor, ALPHA.glow.max * s.power * entrance));
        powerGlow.addColorStop(0.5, rgba(powerColor, ALPHA.glow.min * s.power * entrance));
        powerGlow.addColorStop(1, rgba(powerColor, 0));
        ctx.fillStyle = powerGlow;
        ctx.fillRect(cx - powerGlowR, cy - powerGlowR, powerGlowR * 2, powerGlowR * 2);
      }

      // Turbine blades
      const nodeColor = s.turbineActive
        ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, s.power * 0.5)
        : s.primaryRgb;

      if (s.turbineActive) {
        for (let i = 0; i < BLADE_COUNT; i++) {
          const bladeAngle = s.spinAngle + (Math.PI * 2 * i) / BLADE_COUNT;
          const bx = cx + Math.cos(bladeAngle) * turbineR;
          const by = cy + Math.sin(bladeAngle) * turbineR;

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = rgba(nodeColor, ALPHA.content.max * entrance);
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();

          // Blade tip
          ctx.beginPath();
          ctx.arc(bx, by, px(0.004, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(nodeColor, ALPHA.content.max * entrance);
          ctx.fill();
        }
      }

      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, turbineR * (s.turbineActive ? 0.25 : 1) * (1 + breath * 0.06), 0, Math.PI * 2);
      ctx.fillStyle = rgba(nodeColor, ALPHA.content.max * entrance);
      ctx.fill();

      // Outer ring
      if (s.turbineActive) {
        ctx.beginPath();
        ctx.arc(cx, cy, turbineR * 1.1, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(nodeColor, ALPHA.atmosphere.max * 0.5 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── Prompt ring (before activation) ─────────────
      if (!s.turbineActive && !s.completed) {
        const promptAlpha = ALPHA.atmosphere.min * (0.5 + 0.5 * Math.sin(s.frameCount * 0.03 * ms)) * entrance;
        ctx.beginPath();
        ctx.arc(cx, cy, turbineR * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, promptAlpha);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.setLineDash([px(0.005, minDim), px(0.008, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const dist = Math.sqrt((mx - 0.5) ** 2 + (my - 0.5) ** 2);

      if (dist < 0.15) {
        s.holding = true;
        s.turbineActive = true;
        callbacksRef.current.onHaptic('hold_start');
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
