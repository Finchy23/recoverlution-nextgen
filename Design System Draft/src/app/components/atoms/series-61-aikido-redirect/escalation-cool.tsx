/**
 * ATOM 604: THE ESCALATION COOL ENGINE
 * ======================================
 * Series 61 — Aikido Redirect · Position 4
 *
 * Cure matching toxic energy. Aggressive swiping causes the hot
 * particle to explode. Catch it with a perfectly slow gentle drag —
 * absorb the heat over 3 seconds cooling it to a safe still blue node.
 *
 * PHYSICS:
 *   - Violently vibrating hot particle enters screen
 *   - Aggressive swipe causes kinetic explosion
 *   - Slow, gentle drag absorbs heat over ~3s
 *   - Particle cools from accent (hot) → primary (cool)
 *   - Breath modulates the cooling glow
 *
 * INTERACTION:
 *   Drag (fast/aggressive) → explosion failure
 *   Drag (slow/gentle)     → thermal absorption → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static hot→cool gradient transformation
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

const PARTICLE_R_FRAC = 0.028;
const VIBRATION_SPEED = 0.8;
const VIBRATION_AMP = 0.008;
const AGGRESSIVE_THRESHOLD = 12;    // px/frame = "too fast"
const COOL_RATE = 0.005;             // per frame when gently held
const HEAT_RATE = 0.008;             // reheat rate when released
const EXPLOSION_PARTICLES = 30;
const EXPLOSION_DURATION = 50;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EscalationCoolAtom({
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
    // Particle
    px: 0.5,
    py: 0.25,
    heat: 1,              // 1 = max hot, 0 = fully cooled
    // Drag state
    dragActive: false,
    dragX: 0,
    dragY: 0,
    lastDragX: 0,
    lastDragY: 0,
    gentleHolding: false,
    // Explosion
    exploded: false,
    explosionFrame: 0,
    explosionParts: [] as { x: number; y: number; vx: number; vy: number; alpha: number }[],
    // Completion
    completed: false,
    respawnTimer: 0,
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

      const particleR = px(PARTICLE_R_FRAC, minDim);

      // ── Heat / cool physics ─────────────────────────
      if (!p.reducedMotion && !s.exploded && !s.completed) {
        if (s.gentleHolding) {
          s.heat = Math.max(0, s.heat - COOL_RATE);
          cb.onStateChange?.(1 - s.heat);
          if (s.heat <= 0.01) {
            s.completed = true;
            s.heat = 0;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = 100;
          }
        } else if (!s.dragActive) {
          // Slowly reheat when not being held
          s.heat = Math.min(1, s.heat + HEAT_RATE * 0.15);
        }
      }

      // ── Vibration ───────────────────────────────────
      const vibX = s.heat * Math.sin(s.frameCount * VIBRATION_SPEED * ms) * px(VIBRATION_AMP, minDim) * (s.exploded ? 0 : 1);
      const vibY = s.heat * Math.cos(s.frameCount * VIBRATION_SPEED * 1.3 * ms) * px(VIBRATION_AMP, minDim) * (s.exploded ? 0 : 1);

      const drawX = s.dragActive ? s.dragX : s.px * w + vibX;
      const drawY = s.dragActive ? s.dragY : s.py * h + vibY;

      // ── Explosion animation ─────────────────────────
      if (s.exploded) {
        s.explosionFrame++;
        const eProg = s.explosionFrame / EXPLOSION_DURATION;
        for (const ep of s.explosionParts) {
          ep.x += ep.vx;
          ep.y += ep.vy;
          ep.vx *= 0.97;
          ep.vy *= 0.97;
          const eAlpha = ep.alpha * (1 - eProg) * entrance;
          if (eAlpha > 0.001) {
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, px(0.004, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, eAlpha);
            ctx.fill();
          }
        }
        if (s.explosionFrame >= EXPLOSION_DURATION) {
          s.exploded = false;
          s.heat = 1;
          s.px = 0.5;
          s.py = 0.25;
          s.explosionParts = [];
        }
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (s.completed) {
        s.respawnTimer--;
        if (s.respawnTimer <= 0 && p.phase !== 'resolve') {
          s.completed = false;
          s.heat = 1;
          s.px = 0.5;
          s.py = 0.25;
        }
      }

      // ── Color interpolation ─────────────────────────
      const currentColor = lerpColor(s.primaryRgb, s.accentRgb, s.heat);

      // ── Draw particle ───────────────────────────────
      if (!s.completed) {
        // Glow
        const glowR = particleR * (2.5 + s.heat * 2 + breath * 0.3);
        const glowGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, glowR);
        glowGrad.addColorStop(0, rgba(currentColor, ALPHA.glow.max * (0.3 + s.heat * 0.4) * entrance));
        glowGrad.addColorStop(0.5, rgba(currentColor, ALPHA.glow.min * entrance));
        glowGrad.addColorStop(1, rgba(currentColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(drawX - glowR, drawY - glowR, glowR * 2, glowR * 2);

        // Body
        ctx.beginPath();
        ctx.arc(drawX, drawY, particleR * (1 + s.heat * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = rgba(currentColor, ALPHA.content.max * entrance);
        ctx.fill();

        // Inner bright core (hotter = brighter)
        if (s.heat > 0.3) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, particleR * 0.4 * s.heat, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(currentColor, [255, 255, 255] as RGB, 0.5), ALPHA.focal.max * s.heat * entrance);
          ctx.fill();
        }
      } else {
        // Completed: peaceful still node
        ctx.beginPath();
        ctx.arc(cx, cy, particleR * (1 + breath * 0.08), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        const peaceGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, particleR * 4);
        peaceGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        peaceGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = peaceGlow;
        ctx.fillRect(cx - particleR * 4, cy - particleR * 4, particleR * 8, particleR * 8);
      }

      // ── Reduced motion ──────────────────────────────
      if (p.reducedMotion && !s.completed) {
        // Static gradient bar showing hot→cool
        const barW = minDim * 0.3;
        const barH = px(0.006, minDim);
        const barX = cx - barW / 2;
        const barY = h * 0.85;
        const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        grad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * entrance));
        grad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        ctx.fillStyle = grad;
        ctx.fillRect(barX, barY, barW, barH);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.exploded || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      const px = s.px * viewport.width;
      const py = s.py * viewport.height;
      const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
      if (dist < viewport.width * 0.12) {
        s.dragActive = true;
        s.dragX = mx;
        s.dragY = my;
        s.lastDragX = mx;
        s.lastDragY = my;
        s.gentleHolding = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragActive) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      const speed = Math.sqrt((mx - s.lastDragX) ** 2 + (my - s.lastDragY) ** 2);

      if (speed > AGGRESSIVE_THRESHOLD) {
        // Too aggressive — EXPLODE
        s.exploded = true;
        s.explosionFrame = 0;
        s.dragActive = false;
        s.gentleHolding = false;
        s.explosionParts = [];
        for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
          const a = (Math.PI * 2 * i) / EXPLOSION_PARTICLES;
          const v = 2 + Math.random() * 4;
          s.explosionParts.push({
            x: s.dragX, y: s.dragY,
            vx: Math.cos(a) * v, vy: Math.sin(a) * v,
            alpha: 0.4 + Math.random() * 0.6,
          });
        }
        callbacksRef.current.onHaptic('error_boundary');
      } else {
        s.dragX = mx;
        s.dragY = my;
        s.gentleHolding = true;
      }
      s.lastDragX = mx;
      s.lastDragY = my;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragActive) {
        s.px = s.dragX / viewport.width;
        s.py = s.dragY / viewport.height;
      }
      s.dragActive = false;
      s.gentleHolding = false;
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
