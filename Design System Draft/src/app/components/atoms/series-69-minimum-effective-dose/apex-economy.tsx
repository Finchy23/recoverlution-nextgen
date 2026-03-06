/**
 * ATOM 690: THE APEX ECONOMY ENGINE
 * ====================================
 * Series 69 — Minimum Effective Dose · Position 10 (Series Capstone)
 *
 * True masters do not sweat. Energy locked at 0.01%. Observe the
 * entire board. Wait for maximum structural tension. Deliver one
 * perfectly placed effortless swipe — a board-wide chain reaction
 * destroys the chaos. Zero energy spent. Total dominance.
 *
 * PHYSICS:
 *   - 25+ threat nodes in chaotic orbital motion
 *   - Tension field: invisible structural stress between nodes
 *   - Tension builds naturally over time (observable)
 *   - Energy bar locked at 0.01% — can only swipe ONCE
 *   - Premature swipe: chain reaction fizzles (partial clear)
 *   - Wait for MAX tension → swipe → perfect cascade
 *   - Chain reaction: nodes destroy each other sequentially
 *   - Each destruction spawns energy burst hitting adjacent nodes
 *   - Seal stamp at full board clear
 *
 * INTERACTION:
 *   Observe → tension builds naturally
 *   Swipe at max tension → perfect chain reaction (seal_stamp)
 *   Swipe too early → partial clear (step_advance only)
 *
 * RENDER: Canvas 2D with tension field visualization + cascade
 * REDUCED MOTION: Static serene center with seal ring
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const THREAT_COUNT = 25;
const THREAT_R = 0.01;
const ORBIT_BASE_R = 0.28;
const ORBIT_SPEED = 0.003;
const TENSION_BUILD_RATE = 0.0012;
const TENSION_MAX_FRAMES = 480;      // ~8 seconds for max tension
const CHAIN_SPEED = 0.025;
const CHAIN_EXPLOSION_R = 0.06;
const CHAIN_TRIGGER_DIST = 0.08;
const ENERGY_BAR_FILL = 0.01;
const SWIPE_MIN_DX = 0.08;
const SEAL_R = 0.16;
const CORE_R = 0.015;
const GLOW_LAYERS = 4;

interface Threat {
  x: number; y: number;
  angle: number;
  orbitR: number;
  orbitSpeed: number;
  alive: boolean;
  exploding: boolean;
  explodeProgress: number;
}

export default function ApexEconomyAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
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
    threats: Array.from({ length: THREAT_COUNT }, (): Threat => ({
      x: 0.5, y: 0.5,
      angle: Math.random() * Math.PI * 2,
      orbitR: ORBIT_BASE_R * (0.5 + Math.random() * 0.5),
      orbitSpeed: ORBIT_SPEED * (0.5 + Math.random()),
      alive: true,
      exploding: false,
      explodeProgress: 0,
    })),
    tension: 0,
    triggered: false,
    chainActive: false,
    swiping: false,
    swipeStartX: 0,
    sealed: false,
    stepNotified: false,
    partialClear: false,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        const cR = px(CORE_R * 2, minDim);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = cR * (3 + i * 3);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance / (i + 1)));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.8 * entrance);
        ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, px(SEAL_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') {
        s.tension = 1; s.triggered = true; s.chainActive = true;
      }

      // ── Tension build ─────────────────────────────────────
      if (!s.triggered) {
        s.tension = Math.min(1, s.tension + TENSION_BUILD_RATE * ms);
      }

      // ── Orbit + chain physics ─────────────────────────────
      let aliveCount = 0;
      for (const t of s.threats) {
        if (!t.alive) continue;
        aliveCount++;

        if (!s.chainActive) {
          // Orbit
          t.angle += t.orbitSpeed * ms;
          t.x = 0.5 + Math.cos(t.angle) * t.orbitR;
          t.y = 0.5 + Math.sin(t.angle) * t.orbitR;
        }

        if (t.exploding) {
          t.explodeProgress = Math.min(1, t.explodeProgress + CHAIN_SPEED * ms);
          if (t.explodeProgress >= 1) {
            t.alive = false;
            // Chain reaction: trigger nearby threats
            for (const other of s.threats) {
              if (!other.alive || other.exploding) continue;
              const dx = other.x - t.x;
              const dy = other.y - t.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < CHAIN_TRIGGER_DIST) {
                other.exploding = true;
              }
            }
          }
        }
      }

      // Seal check
      if (s.chainActive && aliveCount === 0 && !s.sealed) {
        s.sealed = true;
        cb.onHaptic('seal_stamp');
        cb.onStateChange?.(1);
      }

      if (!s.sealed) {
        const destroyed = THREAT_COUNT - aliveCount;
        cb.onStateChange?.(s.chainActive
          ? 0.5 + destroyed / THREAT_COUNT * 0.5
          : s.tension * 0.5);
      }

      // ── 1. Tension field visualization ────────────────────
      if (!s.chainActive && s.tension > 0.1) {
        // Tension lines between nearby threats
        for (let i = 0; i < s.threats.length; i++) {
          for (let j = i + 1; j < s.threats.length; j++) {
            const ti = s.threats[i]; const tj = s.threats[j];
            if (!ti.alive || !tj.alive) continue;
            const dx = ti.x - tj.x; const dy = ti.y - tj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CHAIN_TRIGGER_DIST * 1.5) {
              const tensionLine = s.tension * (1 - dist / (CHAIN_TRIGGER_DIST * 1.5));
              ctx.beginPath();
              ctx.moveTo(ti.x * w, ti.y * h);
              ctx.lineTo(tj.x * w, tj.y * h);
              ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.04 * tensionLine * entrance);
              ctx.lineWidth = px(0.0005, minDim);
              ctx.stroke();
            }
          }
        }

        // Tension glow at center
        const tR = px(ORBIT_BASE_R * 0.6 * s.tension, minDim);
        const tg = ctx.createRadialGradient(cx, cy, 0, cx, cy, tR);
        tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.03 * s.tension * entrance));
        tg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = tg;
        ctx.fillRect(cx - tR, cy - tR, tR * 2, tR * 2);
      }

      // ── 2. Threats ────────────────────────────────────────
      for (const t of s.threats) {
        if (!t.alive && !t.exploding) continue;
        const tx = t.x * w;
        const ty = t.y * h;
        const tR = px(THREAT_R, minDim);

        if (t.exploding) {
          // Explosion ring
          const eR = px(CHAIN_EXPLOSION_R * t.explodeProgress, minDim);
          const eAlpha = ALPHA.content.max * 0.15 * (1 - t.explodeProgress) * entrance;
          ctx.beginPath();
          ctx.arc(tx, ty, eR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, eAlpha);
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();

          // Fading core
          const fadeR = tR * (1 - t.explodeProgress * 0.8);
          if (fadeR > 0.5) {
            ctx.beginPath();
            ctx.arc(tx, ty, fadeR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * (1 - t.explodeProgress) * entrance);
            ctx.fill();
          }
        } else {
          // Normal threat
          const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, tR * 2);
          tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * entrance));
          tg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(tx - tR * 2, ty - tR * 2, tR * 4, tR * 4);

          ctx.beginPath();
          ctx.arc(tx, ty, tR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.35 * entrance);
          ctx.fill();
        }
      }

      // ── 3. Core ───────────────────────────────────────────
      const coreR = px(CORE_R, minDim) * (1 + p.breathAmplitude * 0.05);
      const coreIntensity = s.sealed ? 0.9 : 0.3 + s.tension * 0.2;

      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = coreR * (2 + i * 3 + (s.sealed ? 6 : 0));
        const gA = ALPHA.glow.max * coreIntensity * 0.12 * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.3));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * coreIntensity * entrance);
      ctx.fill();

      // ── 4. Energy bar ─────────────────────────────────────
      if (!s.triggered) {
        const barW = px(0.15, minDim);
        const barH = px(0.004, minDim);
        const barX = cx - barW / 2;
        const barY = h * 0.92;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        // Tiny energy fill
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(barX, barY, barW * ENERGY_BAR_FILL, barH);
      }

      // ── 5. Tension meter ──────────────────────────────────
      if (!s.triggered) {
        const tmR = px(SIZE.xs * 0.8, minDim);
        const tmAngle = s.tension * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.06, minDim), tmR, -Math.PI / 2, -Math.PI / 2 + tmAngle);
        const tmColor = s.tension > 0.9 ? s.primaryRgb : lerpColor(s.accentRgb, s.primaryRgb, s.tension);
        ctx.strokeStyle = rgba(tmColor, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();

        // "MAX" pulse at full tension
        if (s.tension > 0.95) {
          const pulse = 0.5 + 0.5 * Math.sin(time * 4);
          ctx.beginPath();
          ctx.arc(cx, cy - px(0.06, minDim), tmR * 1.3, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * pulse * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── 6. Seal ring ──────────────────────────────────────
      if (s.sealed) {
        ctx.beginPath();
        ctx.arc(cx, cy, px(SEAL_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        for (let i = 0; i < 4; i++) {
          const rPhase = (time * 0.1 + i * 0.25) % 1;
          const rR = px(CORE_R * 3 + rPhase * SEAL_R, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(0.0005, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Swipe to trigger
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.triggered || s.sealed) return;
      s.swiping = true;
      s.swipeStartX = e.clientX;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      const cb = callbacksRef.current;
      if (!s.swiping || s.triggered) { s.swiping = false; return; }

      const dx = Math.abs(e.clientX - s.swipeStartX);
      const rect = canvas.getBoundingClientRect();
      const dxFrac = dx / rect.width;

      if (dxFrac > SWIPE_MIN_DX) {
        s.triggered = true;
        s.chainActive = true;
        cb.onHaptic('swipe_commit');

        // Start chain reaction: trigger first few threats based on tension
        const triggerable = Math.max(1, Math.floor(s.tension * 5));
        let triggered = 0;
        for (const t of s.threats) {
          if (triggered >= triggerable) break;
          if (t.alive && !t.exploding) {
            t.exploding = true;
            triggered++;
          }
        }

        if (s.tension < 0.8) {
          s.partialClear = true;
          cb.onHaptic('step_advance');
        }
      }
      s.swiping = false;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', () => { stateRef.current.swiping = false; });

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
