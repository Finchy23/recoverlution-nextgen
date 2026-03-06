/**
 * ATOM 696: THE PERMEABLE MEMBRANE ENGINE
 * ==========================================
 * Series 70 — Wu Wei Master · Position 6
 *
 * Armor is unnecessary weight. Double-tap to become permeable —
 * the wall of force passes through your wireframe lattice.
 *
 * PHYSICS:
 *   - Core node as solid circle, force wall sweeps from left
 *   - Solid state: wall hits core, violently sweeps it off-screen
 *   - Double-tap: core transforms to wireframe lattice (permeable)
 *   - Wall of force passes THROUGH lattice without moving it
 *   - Multiple waves test the lesson — each wave bigger
 *   - Wireframe lattice renders as hexagonal mesh, slightly transparent
 *   - Force wave renders as thick moving gradient bar
 *
 * INTERACTION:
 *   Double-tap → toggle solid/permeable
 *   Solid + wave = swept away (error_boundary)
 *   Permeable + wave = passes through (step_advance → completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static wireframe lattice with faint wave ghost
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
const LATTICE_SEGMENTS = 8;
const LATTICE_RINGS = 3;
const WAVE_SPEED = 0.006;
const WAVE_WIDTH = 0.15;
const WAVE_INTERVAL = 240;           // frames between waves
const WAVES_FOR_COMPLETION = 3;
const SOLID_PUSH_SPEED = 0.02;
const RECOVERY_SPEED = 0.01;
const DOUBLE_TAP_WINDOW = 25;       // frames
const GLOW_LAYERS = 4;

interface ForceWave {
  x: number;         // 0–1 position across screen
  strength: number;  // visual intensity
  passed: boolean;
}

export default function PermeableMembraneAtom({
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
    permeable: false,
    coreX: 0.5,
    lastTapFrame: -100,
    waves: [] as ForceWave[],
    nextWaveIn: WAVE_INTERVAL,
    wavesPassedThrough: 0,
    sweptOff: false,
    sweptProgress: 0,
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
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        const cR = px(CORE_R * 0.35, minDim);
        // Wireframe lattice
        for (let ring = 1; ring <= LATTICE_RINGS; ring++) {
          const rR = cR * (ring / LATTICE_RINGS);
          for (let seg = 0; seg < LATTICE_SEGMENTS; seg++) {
            const a1 = (seg / LATTICE_SEGMENTS) * Math.PI * 2;
            const a2 = ((seg + 1) / LATTICE_SEGMENTS) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a1) * rR, cy + Math.sin(a1) * rR);
            ctx.lineTo(cx + Math.cos(a2) * rR, cy + Math.sin(a2) * rR);
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.permeable = true; s.wavesPassedThrough = WAVES_FOR_COMPLETION; }

      // ── Wave spawning ─────────────────────────────────────
      s.nextWaveIn -= ms;
      if (s.nextWaveIn <= 0 && !s.completed) {
        s.waves.push({ x: -WAVE_WIDTH, strength: 0.8 + s.waves.length * 0.1, passed: false });
        s.nextWaveIn = WAVE_INTERVAL;
      }

      // ── Wave physics ──────────────────────────────────────
      for (let i = s.waves.length - 1; i >= 0; i--) {
        const wave = s.waves[i];
        wave.x += WAVE_SPEED * ms;

        // Wave hits core zone
        if (!wave.passed && Math.abs(wave.x - s.coreX) < WAVE_WIDTH * 0.5 + 0.05) {
          wave.passed = true;
          if (s.permeable) {
            // Passes through!
            s.wavesPassedThrough++;
            if (s.wavesPassedThrough === 1) {
              cb.onHaptic('step_advance');
              s.stepNotified = true;
            }
            if (s.wavesPassedThrough >= WAVES_FOR_COMPLETION && !s.completed) {
              s.completed = true;
              cb.onHaptic('completion');
            }
          } else {
            // Swept away!
            s.sweptOff = true;
            s.sweptProgress = 0;
            cb.onHaptic('error_boundary');
          }
        }

        if (wave.x > 1.5) s.waves.splice(i, 1);
      }

      // Swept recovery
      if (s.sweptOff) {
        s.coreX += SOLID_PUSH_SPEED * ms;
        s.sweptProgress += 0.02 * ms;
        if (s.sweptProgress > 1) {
          s.sweptOff = false;
          s.coreX = 0.5;
        }
      } else if (Math.abs(s.coreX - 0.5) > 0.01) {
        s.coreX += (0.5 - s.coreX) * RECOVERY_SPEED;
      }

      cb.onStateChange?.(s.completed ? 1 : s.wavesPassedThrough / WAVES_FOR_COMPLETION * 0.8);

      // ── 1. Force waves ────────────────────────────────────
      for (const wave of s.waves) {
        const waveX = wave.x * w;
        const waveW = px(WAVE_WIDTH, minDim);
        const waveAlpha = ALPHA.content.max * 0.2 * wave.strength * entrance;

        const wg = ctx.createLinearGradient(waveX - waveW, 0, waveX + waveW, 0);
        wg.addColorStop(0, rgba(s.accentRgb, 0));
        wg.addColorStop(0.3, rgba(s.accentRgb, waveAlpha));
        wg.addColorStop(0.7, rgba(s.accentRgb, waveAlpha));
        wg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = wg;
        ctx.fillRect(waveX - waveW, 0, waveW * 2, h);
      }

      // ── 2. Core node ──────────────────────────────────────
      const coreX = s.coreX * w;
      const coreR = px(CORE_R * 0.35, minDim);
      const breathPulse = 1 + p.breathAmplitude * 0.04;

      if (s.permeable) {
        // Wireframe lattice
        for (let ring = 1; ring <= LATTICE_RINGS; ring++) {
          const rR = coreR * (ring / LATTICE_RINGS) * breathPulse;
          for (let seg = 0; seg < LATTICE_SEGMENTS; seg++) {
            const a1 = (seg / LATTICE_SEGMENTS) * Math.PI * 2 + time * 0.05;
            const a2 = ((seg + 1) / LATTICE_SEGMENTS) * Math.PI * 2 + time * 0.05;
            ctx.beginPath();
            ctx.moveTo(coreX + Math.cos(a1) * rR, cy + Math.sin(a1) * rR);
            ctx.lineTo(coreX + Math.cos(a2) * rR, cy + Math.sin(a2) * rR);
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
          // Radial spokes
          if (ring < LATTICE_RINGS) {
            for (let seg = 0; seg < LATTICE_SEGMENTS; seg += 2) {
              const a = (seg / LATTICE_SEGMENTS) * Math.PI * 2 + time * 0.05;
              const nextRR = coreR * ((ring + 1) / LATTICE_RINGS) * breathPulse;
              ctx.beginPath();
              ctx.moveTo(coreX + Math.cos(a) * rR, cy + Math.sin(a) * rR);
              ctx.lineTo(coreX + Math.cos(a) * nextRR, cy + Math.sin(a) * nextRR);
              ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
              ctx.lineWidth = px(0.0008, minDim);
              ctx.stroke();
            }
          }
        }

        // Soft center glow
        const lg = ctx.createRadialGradient(coreX, cy, 0, coreX, cy, coreR * 0.5);
        lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        lg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lg;
        ctx.fillRect(coreX - coreR * 0.5, cy - coreR * 0.5, coreR, coreR);
      } else {
        // Solid body
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = coreR * (1.2 + i * 0.8) * breathPulse;
          const gA = ALPHA.glow.max * 0.1 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(coreX, cy, 0, coreX, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(coreX - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath();
        ctx.arc(coreX, cy, coreR * breathPulse, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
      }

      // ── 3. State indicator ────────────────────────────────
      const stateR = px(SIZE.xs * 0.5, minDim);
      ctx.beginPath();
      ctx.arc(coreX, cy + coreR * 1.5, stateR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.permeable ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * 0.2 * entrance);
      ctx.fill();

      // ── 4. Completion radiance ────────────────────────────
      if (s.completed) {
        for (let i = 0; i < 3; i++) {
          const ringPhase = (time * 0.15 + i * 0.33) % 1;
          const rR = coreR * (1 + ringPhase * 2);
          ctx.beginPath();
          ctx.arc(coreX, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * (1 - ringPhase) * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Double-tap to toggle permeability
    const onDown = () => {
      const s = stateRef.current;
      if (s.completed) return;
      const now = s.frameCount;
      if (now - s.lastTapFrame < DOUBLE_TAP_WINDOW) {
        s.permeable = !s.permeable;
        callbacksRef.current.onHaptic('tap');
      }
      s.lastTapFrame = now;
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
