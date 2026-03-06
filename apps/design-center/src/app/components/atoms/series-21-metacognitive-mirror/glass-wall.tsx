/**
 * ATOM 207: THE GLASS WALL ENGINE
 * =================================
 * Series 21 — Metacognitive Mirror · Position 7
 *
 * Observation does not require absorption. Draw an impenetrable glass
 * wall between you and the chaos. The particles slam against it
 * but cannot cross.
 *
 * PHYSICS:
 *   - Frantic particles swarm aggressively toward user's core
 *   - Draw a horizontal line across the canvas to place the glass wall
 *   - Particles slam against the barrier and deflect
 *   - Core remains serene on the safe side
 *   - Resolution: wall holds, chaos is contained
 *
 * INTERACTION:
 *   Draw horizontal line → places glass barrier
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static barrier state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PARTICLE_COUNT = 30;
const DRAW_THRESHOLD = 0.3; // fraction of width needed to lock wall

interface ChaosParticle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function GlassWallAtom({
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
    // Wall state
    wallPlaced: false,
    wallY: 0.5, // normalized
    wallSolidity: 0, // 0 = absent, 1 = fully solid glass
    wallDrawProgress: 0, // how much of the wall has been drawn (0–1)
    // Drawing
    drawing: false,
    drawStartX: 0,
    drawCurrentX: 0,
    drawY: 0.5,
    // Particles
    particles: [] as ChaosParticle[],
    initialized: false,
    // Completion
    completed: false,
    deflectionCount: 0,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ── Init particles ────────────────────────────────
      if (!s.initialized) {
        s.particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          s.particles.push({
            x: Math.random(),
            y: Math.random() * 0.35, // start in top zone (chaos side)
            vx: (Math.random() - 0.5) * 0.003,
            vy: 0.001 + Math.random() * 0.002,
            r: 0.003 + Math.random() * 0.004,
          });
        }
        s.initialized = true;
      }

      // ── Wall solidification ───────────────────────────
      if (s.wallPlaced) {
        s.wallSolidity = Math.min(1, s.wallSolidity + 0.02 * ms);
      }

      if (p.phase === 'resolve' && !s.wallPlaced) {
        s.wallPlaced = true;
        s.wallDrawProgress = 1;
      }

      // ── Update particles ──────────────────────────────
      const wallWorldY = s.wallY * h;

      for (const pt of s.particles) {
        if (!p.reducedMotion) {
          // Agitated movement toward core (bottom)
          pt.vx += (Math.random() - 0.5) * 0.0005;
          pt.vy += 0.00005; // subtle gravity toward core
          pt.vx *= 0.99;
          pt.vy *= 0.99;
          pt.x += pt.vx * ms;
          pt.y += pt.vy * ms;

          // Wall collision
          if (s.wallPlaced && s.wallSolidity > 0.3) {
            const ptWorldY = pt.y * h;
            if (ptWorldY > wallWorldY - px(0.005, minDim) && pt.vy > 0) {
              pt.vy *= -0.7; // bounce
              pt.y = (wallWorldY - px(0.005, minDim)) / h;
              if (s.deflectionCount < 50) {
                s.deflectionCount++;
                if (s.deflectionCount === 5 || s.deflectionCount === 15) {
                  cb.onHaptic('step_advance');
                }
              }
            }
          }

          // Bounds (chaos zone: top portion)
          if (pt.x < 0) { pt.x = 0; pt.vx *= -1; }
          if (pt.x > 1) { pt.x = 1; pt.vx *= -1; }
          if (pt.y < 0) { pt.y = 0; pt.vy *= -1; }
          if (!s.wallPlaced && pt.y > 0.9) { pt.y = 0.9; pt.vy *= -0.5; }
        }

        const ptX = pt.x * w;
        const ptY = pt.y * h;
        const ptR = px(pt.r, minDim);

        // Particle glow
        const ptAlpha = ALPHA.content.max * 0.6 * entrance;
        const glow = ctx.createRadialGradient(ptX, ptY, 0, ptX, ptY, ptR * 2);
        glow.addColorStop(0, rgba(s.accentRgb, ptAlpha));
        glow.addColorStop(0.5, rgba(s.accentRgb, ptAlpha * 0.3));
        glow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(ptX - ptR * 2, ptY - ptR * 2, ptR * 4, ptR * 4);

        ctx.beginPath();
        ctx.arc(ptX, ptY, ptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ptAlpha);
        ctx.fill();
      }

      // ── Draw glass wall ───────────────────────────────
      const drawProg = s.drawing ? Math.abs(s.drawCurrentX - s.drawStartX) / w : s.wallDrawProgress;

      if (drawProg > 0 || s.wallPlaced) {
        const wallAlpha = ALPHA.content.max * (s.wallPlaced ? s.wallSolidity * 0.8 : 0.4) * entrance;
        const wy = s.wallY * h;
        const wallWidth = s.wallPlaced ? w : drawProg * w;
        const wallStartX = s.wallPlaced ? 0 : Math.min(s.drawStartX, s.drawCurrentX) * w / viewport.width;

        // Glass surface
        ctx.beginPath();
        ctx.moveTo(s.wallPlaced ? 0 : wallStartX, wy);
        ctx.lineTo(s.wallPlaced ? w : wallStartX + wallWidth, wy);
        ctx.strokeStyle = rgba(s.primaryRgb, wallAlpha);
        ctx.lineWidth = px(0.003 * (0.5 + s.wallSolidity * 0.5), minDim);
        ctx.stroke();

        // Refraction shimmer
        if (s.wallSolidity > 0.3) {
          const shimmerAlpha = ALPHA.glow.max * 0.2 * (s.wallSolidity - 0.3) / 0.7 * entrance;
          const shimmerH = px(0.02, minDim);
          const shimGrad = ctx.createLinearGradient(0, wy - shimmerH, 0, wy + shimmerH);
          shimGrad.addColorStop(0, rgba(s.primaryRgb, 0));
          shimGrad.addColorStop(0.5, rgba(s.primaryRgb, shimmerAlpha));
          shimGrad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = shimGrad;
          ctx.fillRect(0, wy - shimmerH, w, shimmerH * 2);
        }
      }

      // ── User core (safe side) ─────────────────────────
      const coreY = h * 0.8;
      const coreR = px(0.015, minDim);
      const corePulse = 1 + breath * 0.06;
      const coreAlpha = ALPHA.content.max * entrance;

      // Core serenity glow (stronger when wall is up)
      const serenity = s.wallPlaced ? s.wallSolidity : 0;
      const coreGlowR = px(0.04 + serenity * 0.04, minDim);
      const coreGlow = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, coreGlowR);
      coreGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.2 + serenity * 0.3) * entrance));
      coreGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - coreGlowR, coreY - coreGlowR, coreGlowR * 2, coreGlowR * 2);

      ctx.beginPath();
      ctx.arc(cx, coreY, coreR * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, coreAlpha);
      ctx.fill();

      // ── Completion ────────────────────────────────────
      if (s.wallPlaced && s.wallSolidity > 0.9 && s.deflectionCount >= 3 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
        cb.onStateChange?.(1);
      } else if (!s.completed) {
        cb.onStateChange?.(s.wallPlaced ? s.wallSolidity * 0.8 : 0);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers (draw wall) ──────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.wallPlaced) return;
      s.drawing = true;
      const rect = canvas.getBoundingClientRect();
      s.drawStartX = e.clientX - rect.left;
      s.drawCurrentX = s.drawStartX;
      s.drawY = (e.clientY - rect.top) / rect.height;
      s.wallY = s.drawY;
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      s.drawCurrentX = e.clientX - rect.left;
    };

    const onUp = () => {
      const s = stateRef.current;
      if (!s.drawing) return;
      s.drawing = false;
      const drawLen = Math.abs(s.drawCurrentX - s.drawStartX);
      if (drawLen > viewport.width * DRAW_THRESHOLD) {
        s.wallPlaced = true;
        s.wallDrawProgress = 1;
        callbacksRef.current.onHaptic('drag_snap');
      }
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
      />
    </div>
  );
}
