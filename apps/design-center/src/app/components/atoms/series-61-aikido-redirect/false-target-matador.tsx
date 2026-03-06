/**
 * ATOM 608: THE FALSE TARGET ENGINE
 * ====================================
 * Series 61 — Aikido Redirect · Position 8
 *
 * Never feed the trolls. Tap the glass to spawn a glowing hologram
 * decoy — the aggressor locks onto the ghost while your true core
 * remains completely still and untouched in the background.
 *
 * PHYSICS:
 *   - Fast aggressive node charges at user
 *   - Tap to spawn hologram decoy slightly off-center
 *   - Aggressor locks onto hologram signature
 *   - Violently attacks empty ghost
 *   - User's true core remains still and untouched
 *
 * INTERACTION:
 *   Tap → spawns hologram decoy
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static decoy + aggressor locked on ghost
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

const CORE_R_FRAC = 0.02;
const AGGRESSOR_R_FRAC = 0.022;
const HOLOGRAM_R_FRAC = 0.018;
const CHARGE_SPEED = 0.006;
const ATTACK_DURATION = 50;
const SETTLE_DURATION = 60;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function FalseTargetMatadorAtom({
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
    // Aggressor
    aggX: 0.5,
    aggY: 0.08,
    aggCharging: true,
    aggLocked: false,
    aggAttacking: false,
    aggAttackFrame: 0,
    // Hologram
    holoActive: false,
    holoX: 0,
    holoY: 0,
    holoFlicker: 0,
    // Core
    coreFade: 0, // 0 = normal, 1 = faded into background
    // State
    completed: false,
    settleFrame: 0,
    respawnTimer: 0,
    completions: 0,
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

      const coreR = px(CORE_R_FRAC, minDim);
      const aggR = px(AGGRESSOR_R_FRAC, minDim);
      const holoR = px(HOLOGRAM_R_FRAC, minDim);
      const coreX = cx;
      const coreY = h * 0.65;

      // ── Aggressor physics ───────────────────────────
      if (!p.reducedMotion) {
        if (s.aggCharging && !s.aggLocked) {
          // Target: hologram if active, else core
          const targetX = s.holoActive ? s.holoX : coreX / w;
          const targetY = s.holoActive ? s.holoY : coreY / h;
          const dx = targetX - s.aggX;
          const dy = targetY - s.aggY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.02) {
            s.aggX += (dx / dist) * CHARGE_SPEED;
            s.aggY += (dy / dist) * CHARGE_SPEED;
          } else if (s.holoActive) {
            // Locked onto hologram
            s.aggLocked = true;
            s.aggAttacking = true;
            s.aggAttackFrame = 0;
            cb.onHaptic('tap');
          } else {
            // Hit core — failure, respawn
            s.aggCharging = false;
            s.respawnTimer = 80;
            cb.onHaptic('error_boundary');
          }
        }

        // Attack animation on hologram
        if (s.aggAttacking) {
          s.aggAttackFrame++;
          // Violent shake around hologram
          const shake = Math.sin(s.aggAttackFrame * 1.2) * px(0.005, minDim);
          s.aggX = (s.holoActive ? s.holoX : 0.5) + shake / w;

          if (s.aggAttackFrame >= ATTACK_DURATION) {
            s.aggAttacking = false;
            s.completed = true;
            s.settleFrame = 0;
            s.completions++;
            cb.onHaptic('completion');
            cb.onStateChange?.(Math.min(1, s.completions / 3));
          }
        }

        // Core fades when hologram is active
        if (s.holoActive) {
          s.coreFade = Math.min(1, s.coreFade + 0.03);
        }

        // Settle / completion
        if (s.completed) {
          s.settleFrame++;
          if (s.settleFrame >= SETTLE_DURATION) {
            s.respawnTimer = 80;
            s.completed = false;
          }
        }
      }

      // ── Respawn ─────────────────────────────────────
      if ((!s.aggCharging || s.completed) && p.phase !== 'resolve') {
        if (s.respawnTimer > 0) s.respawnTimer--;
        if (s.respawnTimer <= 0 && !s.completed && !s.aggCharging) {
          s.aggX = 0.5;
          s.aggY = 0.08;
          s.aggCharging = true;
          s.aggLocked = false;
          s.aggAttacking = false;
          s.holoActive = false;
          s.coreFade = 0;
        }
      }

      // ── Draw true core ──────────────────────────────
      const coreAlpha = ALPHA.content.max * (1 - s.coreFade * 0.6) * entrance;
      const coreGlowAlpha = ALPHA.glow.max * 0.3 * (1 - s.coreFade * 0.5) * entrance;

      const coreGlow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreR * 4);
      coreGlow.addColorStop(0, rgba(s.primaryRgb, coreGlowAlpha));
      coreGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(coreX - coreR * 4, coreY - coreR * 4, coreR * 8, coreR * 8);

      ctx.beginPath();
      ctx.arc(coreX, coreY, coreR * (1 + breath * 0.08), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, coreAlpha);
      ctx.fill();

      // ── Draw hologram decoy ─────────────────────────
      if (s.holoActive) {
        const hx = s.holoX * w;
        const hy = s.holoY * h;
        const flicker = 0.5 + 0.5 * Math.sin(s.frameCount * 0.3 * ms);
        const holoAlpha = ALPHA.content.max * 0.7 * flicker * entrance;

        // Hologram glow (brighter than core — bait)
        const holoGlow = ctx.createRadialGradient(hx, hy, 0, hx, hy, holoR * 5);
        holoGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.6 * flicker * entrance));
        holoGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
        holoGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = holoGlow;
        ctx.fillRect(hx - holoR * 5, hy - holoR * 5, holoR * 10, holoR * 10);

        // Hologram ring (flickering)
        ctx.beginPath();
        ctx.arc(hx, hy, holoR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, holoAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.setLineDash([px(0.003, minDim), px(0.004, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Inner dot
        ctx.beginPath();
        ctx.arc(hx, hy, holoR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, holoAlpha * 0.8);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(coreX, coreY);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.18 * flicker * entrance);
        ctx.lineWidth = px(0.0011, minDim);
        ctx.stroke();

        if (s.completed) {
          const funnelR = holoR * (3 + s.settleFrame * 0.02);
          ctx.beginPath();
          ctx.arc(hx, hy, funnelR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.26 * entrance);
          ctx.lineWidth = px(0.0015, minDim);
          ctx.stroke();
        }
      }

      // ── Draw aggressor ──────────────────────────────
      if (s.aggCharging || s.aggAttacking) {
        const ax = s.aggX * w;
        const ay = s.aggY * h;

        // Aggressor glow
        const aggGlow = ctx.createRadialGradient(ax, ay, 0, ax, ay, aggR * 3);
        aggGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.4 * entrance));
        aggGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = aggGlow;
        ctx.fillRect(ax - aggR * 3, ay - aggR * 3, aggR * 6, aggR * 6);

        ctx.beginPath();
        ctx.arc(ax, ay, aggR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Charge trail
        if (s.aggCharging && !s.aggLocked) {
          ctx.beginPath();
          ctx.moveTo(ax, ay - aggR);
          ctx.lineTo(ax, ay - aggR - minDim * 0.03);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.holoActive || s.completed || !s.aggCharging) return;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Spawn hologram slightly offset from tap
      s.holoActive = true;
      s.holoX = mx;
      s.holoY = my;
      callbacksRef.current.onHaptic('tap');
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
