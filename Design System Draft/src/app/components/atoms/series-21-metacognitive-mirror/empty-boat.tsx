/**
 * ATOM 206: THE EMPTY BOAT ENGINE
 * =================================
 * Series 21 — Metacognitive Mirror · Position 6
 *
 * Dark shapes float aggressively — tap each to reveal they are
 * completely hollow and empty inside. Attribution error dissolves.
 *
 * PHYSICS:
 *   - Dark menacing shapes float and bob on a fluid surface
 *   - Each looks heavy and solid, radiating threat
 *   - Tap one → it cracks open to reveal hollow emptiness inside
 *   - The shape becomes translucent, light, harmless
 *   - Resolution: all boats revealed as empty shells
 *
 * INTERACTION:
 *   Tap → reveal the shape is hollow
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static revealed state
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

const BOAT_COUNT = 5;
const REVEAL_SPEED = 0.03;

interface Boat {
  x: number; y: number;
  size: number;
  bobPhase: number;
  bobSpeed: number;
  driftX: number;
  revealed: boolean;
  revealProgress: number;
  shape: number; // 0=circle, 1=diamond, 2=triangle
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EmptyBoatAtom({
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
    boats: [] as Boat[],
    initialized: false,
    revealedCount: 0,
    completed: false,
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

      // ── Init boats ────────────────────────────────────
      if (!s.initialized) {
        s.boats = [];
        for (let i = 0; i < BOAT_COUNT; i++) {
          s.boats.push({
            x: 0.15 + (i / (BOAT_COUNT - 1)) * 0.7,
            y: 0.35 + (i % 2) * 0.2 + Math.random() * 0.1,
            size: 0.035 + Math.random() * 0.015,
            bobPhase: Math.random() * Math.PI * 2,
            bobSpeed: 0.015 + Math.random() * 0.01,
            driftX: (Math.random() - 0.5) * 0.0002,
            revealed: false,
            revealProgress: 0,
            shape: i % 3,
          });
        }
        s.initialized = true;
      }

      // ── Water surface ─────────────────────────────────
      const waterY = h * 0.72;
      const waterAlpha = ALPHA.atmosphere.min * 0.6 * entrance;
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      for (let x = 0; x <= w; x += 4) {
        const wave = Math.sin(x * 0.02 + s.frameCount * 0.02 * ms) * px(0.003, minDim);
        ctx.lineTo(x, waterY + wave);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = rgba(s.primaryRgb, waterAlpha);
      ctx.fill();

      // ── Draw boats ────────────────────────────────────
      for (const boat of s.boats) {
        // Advance reveal
        if (boat.revealed && boat.revealProgress < 1) {
          boat.revealProgress = Math.min(1, boat.revealProgress + REVEAL_SPEED * ms);
        }

        // Bob and drift
        if (!p.reducedMotion) {
          boat.x += boat.driftX * ms;
          if (boat.x < 0.05 || boat.x > 0.95) boat.driftX *= -1;
        }

        const bob = Math.sin(s.frameCount * boat.bobSpeed * ms + boat.bobPhase) * px(0.006, minDim);
        const bx = boat.x * w;
        const by = boat.y * h + bob;
        const sz = px(boat.size, minDim);
        const rev = boat.revealProgress;

        // Shadow / threat aura (diminishes with reveal)
        const threatAlpha = ALPHA.glow.max * 0.4 * (1 - rev) * entrance;
        if (threatAlpha > 0.005) {
          const threatGlow = ctx.createRadialGradient(bx, by, sz * 0.5, bx, by, sz * 2.5);
          threatGlow.addColorStop(0, rgba(s.accentRgb, threatAlpha));
          threatGlow.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = threatGlow;
          ctx.fillRect(bx - sz * 2.5, by - sz * 2.5, sz * 5, sz * 5);
        }

        // Shape body: solid → hollow transition
        const bodyAlpha = ALPHA.content.max * (1 - rev * 0.7) * entrance;
        const hollowAlpha = ALPHA.content.max * rev * 0.3 * entrance;

        ctx.beginPath();
        if (boat.shape === 0) {
          ctx.arc(bx, by, sz, 0, Math.PI * 2);
        } else if (boat.shape === 1) {
          // Diamond
          ctx.moveTo(bx, by - sz);
          ctx.lineTo(bx + sz, by);
          ctx.lineTo(bx, by + sz);
          ctx.lineTo(bx - sz, by);
          ctx.closePath();
        } else {
          // Triangle
          ctx.moveTo(bx, by - sz);
          ctx.lineTo(bx + sz * 0.86, by + sz * 0.5);
          ctx.lineTo(bx - sz * 0.86, by + sz * 0.5);
          ctx.closePath();
        }

        if (rev < 0.5) {
          // Solid fill transitioning to stroke
          ctx.fillStyle = rgba(s.accentRgb, bodyAlpha);
          ctx.fill();
        }
        // Hollow outline
        ctx.strokeStyle = rgba(rev > 0.5 ? s.primaryRgb : s.accentRgb, bodyAlpha * 0.8 + hollowAlpha);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();

        // Inner emptiness glow (appears with reveal)
        if (rev > 0.2) {
          const emptyAlpha = ALPHA.glow.max * 0.3 * Math.min(1, (rev - 0.2) / 0.5) * entrance;
          const emptyGlow = ctx.createRadialGradient(bx, by, 0, bx, by, sz * 0.8);
          emptyGlow.addColorStop(0, rgba(s.primaryRgb, emptyAlpha));
          emptyGlow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = emptyGlow;
          ctx.fillRect(bx - sz, by - sz, sz * 2, sz * 2);
        }

        // Breath on revealed boats
        if (rev > 0.8) {
          const breathR = sz * (1 + breath * 0.1);
          ctx.beginPath();
          ctx.arc(bx, by, breathR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * entrance * 0.5);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── State tracking ────────────────────────────────
      const revealed = s.boats.filter(b => b.revealed).length;
      if (revealed !== s.revealedCount) {
        s.revealedCount = revealed;
        cb.onStateChange?.(revealed / BOAT_COUNT);
      }
      if (revealed === BOAT_COUNT && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const minD = Math.min(viewport.width, viewport.height);

      // Hit test boats
      for (const boat of s.boats) {
        if (boat.revealed) continue;
        const dx = mx - boat.x;
        const dy = my - boat.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < boat.size * 1.5) {
          boat.revealed = true;
          callbacksRef.current.onHaptic('tap');
          break;
        }
      }
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
