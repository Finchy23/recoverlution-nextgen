/**
 * ATOM 698: THE VACUUM PULL ENGINE
 * ==================================
 * Series 70 — Wu Wei Master · Position 8
 *
 * Chasing pushes the target away. Aggressive swiping creates a
 * bow-wave of pressure. Stop dead — create a vacuum — the solution
 * is sucked directly into your resting core.
 *
 * PHYSICS:
 *   - Erratic floating solution node wandering randomly
 *   - Touching/swiping creates visible pressure wave pushing it away
 *   - Pressure is proportional to pointer velocity
 *   - Hands off for 4 seconds: velocity drops to zero
 *   - Zero velocity creates low-pressure vacuum at core
 *   - Solution node caught in vacuum — drawn toward core
 *   - Gentle absorption on contact — no collision, soft merge
 *
 * INTERACTION:
 *   Touch/swipe → pressure wave pushes solution away (error_boundary)
 *   Hands off 4s → vacuum → solution drawn in (completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static merged core with soft glow
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
const SOLUTION_R = 0.05;
const SOLUTION_WANDER_SPEED = 0.001;
const PRESSURE_PUSH = 0.025;
const PRESSURE_RADIUS = 0.3;
const VACUUM_FRAMES = 240;          // ~4 seconds
const VACUUM_PULL_STRENGTH = 0.002;
const VACUUM_VISUAL_R = 0.25;
const ABSORPTION_DIST = 0.04;
const GLOW_LAYERS = 4;
const PRESSURE_WAVE_COUNT = 3;

interface PressureWave {
  x: number; y: number;
  radius: number;
  life: number;
}

export default function VacuumPullMagnetismAtom({
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
    solutionX: 0.3 + Math.random() * 0.4,
    solutionY: 0.3 + Math.random() * 0.4,
    solutionVX: (Math.random() - 0.5) * SOLUTION_WANDER_SPEED,
    solutionVY: (Math.random() - 0.5) * SOLUTION_WANDER_SPEED,
    stillFrames: 0,
    vacuumActive: false,
    absorbed: false,
    absorptionProgress: 0,
    pressureWaves: [] as PressureWave[],
    lastPointerX: 0,
    lastPointerY: 0,
    stepNotified: false,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        const cR = px(CORE_R * 0.4, minDim);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = cR * (2 + i * 1.5);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance / (i + 1)));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.stillFrames = VACUUM_FRAMES + 60; }

      // ── Stillness → vacuum ────────────────────────────────
      s.stillFrames++;
      if (s.stillFrames > VACUUM_FRAMES && !s.vacuumActive && !s.absorbed) {
        s.vacuumActive = true;
        cb.onHaptic('step_advance');
        s.stepNotified = true;
      }

      // ── Solution physics ──────────────────────────────────
      if (!s.absorbed) {
        // Wander
        s.solutionVX += (Math.random() - 0.5) * 0.0002;
        s.solutionVY += (Math.random() - 0.5) * 0.0002;

        // Vacuum pull
        if (s.vacuumActive) {
          const dx = 0.5 - s.solutionX;
          const dy = 0.5 - s.solutionY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.01) {
            s.solutionVX += (dx / dist) * VACUUM_PULL_STRENGTH * ms;
            s.solutionVY += (dy / dist) * VACUUM_PULL_STRENGTH * ms;
          }
        }

        // Drag
        s.solutionVX *= 0.98;
        s.solutionVY *= 0.98;

        s.solutionX += s.solutionVX * ms;
        s.solutionY += s.solutionVY * ms;

        // Bounds bounce
        if (s.solutionX < 0.05 || s.solutionX > 0.95) s.solutionVX *= -0.8;
        if (s.solutionY < 0.05 || s.solutionY > 0.95) s.solutionVY *= -0.8;
        s.solutionX = Math.max(0.05, Math.min(0.95, s.solutionX));
        s.solutionY = Math.max(0.05, Math.min(0.95, s.solutionY));

        // Absorption check
        const dx = s.solutionX - 0.5;
        const dy = s.solutionY - 0.5;
        if (Math.sqrt(dx * dx + dy * dy) < ABSORPTION_DIST) {
          s.absorbed = true;
          cb.onHaptic('completion');
          s.completed = true;
        }
      } else {
        s.absorptionProgress = Math.min(1, s.absorptionProgress + 0.015 * ms);
      }

      cb.onStateChange?.(s.absorbed ? 0.5 + s.absorptionProgress * 0.5 :
        s.vacuumActive ? 0.3 : Math.min(0.3, s.stillFrames / VACUUM_FRAMES * 0.3));

      // Pressure waves animation
      for (let i = s.pressureWaves.length - 1; i >= 0; i--) {
        const pw = s.pressureWaves[i];
        pw.radius += 0.005 * ms;
        pw.life -= ms;
        if (pw.life <= 0) s.pressureWaves.splice(i, 1);
      }

      // ── 1. Vacuum field ───────────────────────────────────
      if (s.vacuumActive && !s.absorbed) {
        const vacR = px(VACUUM_VISUAL_R, minDim);
        const vacPulse = 0.8 + 0.2 * Math.sin(time * 2);

        // Inward spiral lines
        for (let i = 0; i < 6; i++) {
          const baseAngle = (i / 6) * Math.PI * 2 + time * 0.3;
          const spiralLen = vacR * vacPulse;
          ctx.beginPath();
          for (let t = 0; t < 1; t += 0.05) {
            const angle = baseAngle + t * Math.PI * 0.5;
            const r = spiralLen * (1 - t);
            const sx = cx + Math.cos(angle) * r;
            const sy = cy + Math.sin(angle) * r;
            if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }

        // Vacuum glow
        const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, vacR);
        vg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
        vg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * entrance));
        vg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = vg;
        ctx.fillRect(cx - vacR, cy - vacR, vacR * 2, vacR * 2);
      }

      // ── 2. Pressure waves ─────────────────────────────────
      for (const pw of s.pressureWaves) {
        const wR = px(pw.radius, minDim);
        const wAlpha = ALPHA.content.max * 0.1 * (pw.life / 40) * entrance;
        ctx.beginPath();
        ctx.arc(pw.x * w, pw.y * h, wR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, wAlpha);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      // ── 3. Solution node ──────────────────────────────────
      if (!s.absorbed) {
        const sx = s.solutionX * w;
        const sy = s.solutionY * h;
        const sR = px(SOLUTION_R, minDim);

        // Solution glow
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sR * 2.5);
        sg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(sx - sR * 2.5, sy - sR * 2.5, sR * 5, sR * 5);

        ctx.beginPath();
        ctx.arc(sx, sy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.45 * entrance);
        ctx.fill();

        // Pull line when vacuum active
        if (s.vacuumActive) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.setLineDash([px(0.003, minDim), px(0.003, minDim)]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── 4. Core ───────────────────────────────────────────
      const coreR = px(CORE_R * 0.25, minDim) * (1 + p.breathAmplitude * 0.04);
      const coreIntensity = s.absorbed ? 0.7 + s.absorptionProgress * 0.3 : s.vacuumActive ? 0.4 : 0.25;

      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = coreR * (1.5 + i * 1.2 + (s.absorbed ? s.absorptionProgress * 2 : 0));
        const gA = ALPHA.glow.max * (0.05 + coreIntensity * 0.2) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * coreIntensity * entrance);
      ctx.fill();

      // ── 5. Stillness progress ─────────────────────────────
      if (!s.vacuumActive && !s.absorbed && s.stillFrames > 30) {
        const progR = px(SIZE.xs * 0.7, minDim);
        const prog = Math.min(1, s.stillFrames / VACUUM_FRAMES);
        ctx.beginPath();
        ctx.arc(cx, cy - coreR * 2, progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.absorbed) return;
      s.stillFrames = 0;
      s.vacuumActive = false;
      s.stepNotified = false;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Push solution away
      const dx = s.solutionX - mx;
      const dy = s.solutionY - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < PRESSURE_RADIUS && dist > 0.01) {
        const force = PRESSURE_PUSH * (1 - dist / PRESSURE_RADIUS);
        s.solutionVX += (dx / dist) * force;
        s.solutionVY += (dy / dist) * force;
      }

      // Pressure wave
      s.pressureWaves.push({ x: mx, y: my, radius: 0.01, life: 40 });
      callbacksRef.current.onHaptic('error_boundary');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.absorbed) return;
      s.stillFrames = 0;
      s.vacuumActive = false;

      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const dx = s.solutionX - mx;
      const dy = s.solutionY - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < PRESSURE_RADIUS && dist > 0.01) {
        s.solutionVX += (dx / dist) * PRESSURE_PUSH * 0.3;
        s.solutionVY += (dy / dist) * PRESSURE_PUSH * 0.3;
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
