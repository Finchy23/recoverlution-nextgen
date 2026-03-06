/**
 * ATOM 699: THE GHOST NODE ENGINE
 * =================================
 * Series 70 — Wu Wei Master · Position 9
 *
 * Thoughts are passing weather, not your identity. Toggle dis-identify —
 * your core becomes a ghost. Terrifying nodes plummet through you
 * causing zero damage.
 *
 * PHYSICS:
 *   - Heavy dark threat nodes rain from top (labeled energy: fear, shame, etc.)
 *   - Solid core: threats collide → screen shake, damage haptics
 *   - Tap to toggle "ghost mode" — core becomes translucent wireframe
 *   - Ghost core: threats pass directly through — zero collision
 *   - Each pass-through builds dis-identification confidence
 *   - After 8 clean pass-throughs → completion
 *   - Visual: threats leave no trace on ghost core, just gentle ripples
 *
 * INTERACTION:
 *   Tap → toggle ghost/solid
 *   Ghost + threats passing through → step_advance → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static ghost wireframe with faded threats below
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const CORE_R = SIZE.md;
const THREAT_R = 0.04;
const THREAT_FALL_SPEED = 0.004;
const THREAT_SPAWN_INTERVAL = 50;
const MAX_THREATS = 6;
const PASS_THROUGHS_FOR_COMPLETION = 8;
const GHOST_RINGS = 4;
const GHOST_SEGMENTS = 10;
const SCREEN_SHAKE_DECAY = 0.9;
const SCREEN_SHAKE_MAG = 0.008;
const RIPPLE_SPEED = 0.005;
const RIPPLE_LIFE = 40;
const GLOW_LAYERS = 3;

interface ThreatNode {
  x: number; y: number;
  speed: number;
  size: number;
  passed: boolean;
  collided: boolean;
}

interface GhostRipple {
  radius: number;
  life: number;
  maxLife: number;
}

export default function GhostNodeDisidentifyAtom({
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
    ghost: false,
    threats: [] as ThreatNode[],
    nextSpawnIn: THREAT_SPAWN_INTERVAL,
    passThroughs: 0,
    screenShake: 0,
    ripples: [] as GhostRipple[],
    completed: false,
    stepNotified: false,
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

      // Apply screen shake
      const shakeX = s.screenShake * (Math.random() - 0.5) * px(SCREEN_SHAKE_MAG, minDim) * 2;
      const shakeY = s.screenShake * (Math.random() - 0.5) * px(SCREEN_SHAKE_MAG, minDim) * 2;
      s.screenShake *= SCREEN_SHAKE_DECAY;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        const cR = px(CORE_R * 0.3, minDim);
        for (let ring = 1; ring <= GHOST_RINGS; ring++) {
          const rR = cR * (ring / GHOST_RINGS);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
        cb.onStateChange?.(1);
        ctx.restore(); ctx.restore();
        animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.ghost = true; s.passThroughs = PASS_THROUGHS_FOR_COMPLETION; }

      // ── Threat spawning ───────────────────────────────────
      s.nextSpawnIn -= ms;
      if (s.nextSpawnIn <= 0 && s.threats.length < MAX_THREATS && !s.completed) {
        s.threats.push({
          x: 0.2 + Math.random() * 0.6,
          y: -0.08,
          speed: THREAT_FALL_SPEED * (0.7 + Math.random() * 0.6),
          size: THREAT_R * (0.7 + Math.random() * 0.6),
          passed: false,
          collided: false,
        });
        s.nextSpawnIn = THREAT_SPAWN_INTERVAL;
      }

      // ── Threat physics ────────────────────────────────────
      for (let i = s.threats.length - 1; i >= 0; i--) {
        const t = s.threats[i];
        t.y += t.speed * ms;

        // Core collision zone
        if (!t.passed && !t.collided) {
          const dx = t.x - 0.5;
          const dy = t.y - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const hitDist = (CORE_R * 0.3 + t.size);

          if (dist < hitDist) {
            if (s.ghost) {
              // Pass through!
              t.passed = true;
              s.passThroughs++;
              s.ripples.push({ radius: 0, life: RIPPLE_LIFE, maxLife: RIPPLE_LIFE });

              if (s.passThroughs >= 3 && !s.stepNotified) {
                s.stepNotified = true;
                cb.onHaptic('step_advance');
              }
              if (s.passThroughs >= PASS_THROUGHS_FOR_COMPLETION && !s.completed) {
                s.completed = true;
                cb.onHaptic('completion');
              }
            } else {
              // Collision!
              t.collided = true;
              s.screenShake = 1;
              cb.onHaptic('error_boundary');
            }
          }
        }

        // Remove off-screen threats
        if (t.y > 1.2 || t.collided) {
          s.threats.splice(i, 1);
        }
      }

      // Ripples
      for (let i = s.ripples.length - 1; i >= 0; i--) {
        const r = s.ripples[i];
        r.radius += RIPPLE_SPEED * ms;
        r.life -= ms;
        if (r.life <= 0) s.ripples.splice(i, 1);
      }

      cb.onStateChange?.(s.completed ? 1 : s.passThroughs / PASS_THROUGHS_FOR_COMPLETION);

      // ── 1. Threats ────────────────────────────────────────
      for (const t of s.threats) {
        const tx = t.x * w;
        const ty = t.y * h;
        const tR = px(t.size, minDim);

        // Threat shadow/glow
        const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, tR * 2);
        tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.2 * entrance));
        tg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = tg;
        ctx.fillRect(tx - tR * 2, ty - tR * 2, tR * 4, tR * 4);

        // Threat body — fading if passed through
        const threatAlpha = t.passed ? 0.15 : 0.45;
        ctx.beginPath();
        ctx.arc(tx, ty, tR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * threatAlpha * entrance);
        ctx.fill();

        // Fall trail
        ctx.beginPath();
        ctx.moveTo(tx, ty - tR);
        ctx.lineTo(tx, ty - tR * 3);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── 2. Core node ──────────────────────────────────────
      const coreR = px(CORE_R * 0.3, minDim);
      const breathPulse = 1 + p.breathAmplitude * 0.04;

      if (s.ghost) {
        // Ghost wireframe
        for (let ring = 1; ring <= GHOST_RINGS; ring++) {
          const rR = coreR * (ring / GHOST_RINGS) * breathPulse;
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();

          // Segment dots
          for (let seg = 0; seg < GHOST_SEGMENTS; seg++) {
            const a = (seg / GHOST_SEGMENTS) * Math.PI * 2 + time * 0.02 * ring;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * rR, cy + Math.sin(a) * rR, px(0.002, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance);
            ctx.fill();
          }
        }

        // Ghost center — very faint
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 0.5);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.05 * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - coreR * 0.5, cy - coreR * 0.5, coreR, coreR);
      } else {
        // Solid core
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = coreR * (1.3 + i * 1) * breathPulse;
          const gA = ALPHA.glow.max * 0.1 * entrance / (i + 1);
          const gg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg2.addColorStop(0, rgba(s.primaryRgb, gA));
          gg2.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg2;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, coreR * breathPulse, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
      }

      // ── 3. Ghost ripples ──────────────────────────────────
      for (const ripple of s.ripples) {
        const rR = px(ripple.radius, minDim);
        const rAlpha = ALPHA.content.max * 0.1 * (ripple.life / ripple.maxLife) * entrance;
        ctx.beginPath();
        ctx.arc(cx, cy, rR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, rAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── 4. Progress ───────────────────────────────────────
      if (!s.completed && s.passThroughs > 0) {
        const progR = px(SIZE.xs * 0.7, minDim);
        const prog = s.passThroughs / PASS_THROUGHS_FOR_COMPLETION;
        ctx.beginPath();
        ctx.arc(cx, cy - coreR * 1.8, progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      // ── 5. Ghost mode indicator ───────────────────────────
      const indR = px(0.008, minDim);
      ctx.beginPath();
      ctx.arc(cx, cy + coreR * 1.5, indR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.ghost ? s.primaryRgb : s.accentRgb, ALPHA.content.max * 0.25 * entrance);
      ctx.fill();

      ctx.restore(); // undo translate
      ctx.restore(); // undo setupCanvas
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = () => {
      const s = stateRef.current;
      if (s.completed) return;
      s.ghost = !s.ghost;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
