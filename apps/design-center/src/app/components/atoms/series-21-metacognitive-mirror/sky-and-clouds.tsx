/**
 * ATOM 205: THE SKY AND CLOUDS ENGINE
 * =====================================
 * Series 21 — Metacognitive Mirror · Position 5
 *
 * The thoughts are clouds. You are the sky. The sky is never damaged
 * by the storm that passes through it. Pinch outward to reveal the
 * infinite sky behind dense thought-clouds.
 *
 * PHYSICS:
 *   - Dense dark cloud mass fills screen (overwhelming thoughts)
 *   - Pinch outward / drag to part the clouds
 *   - Radiant open sky emerges between the parted clouds
 *   - Clouds continue drifting — sky remains untouched
 *   - Resolution: vast luminous sky with tiny distant clouds
 *
 * INTERACTION:
 *   Pinch outward (or drag from center) → parts the clouds
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static parted state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const CLOUD_COUNT = 12;
const PART_RATE = 0.005;
const CLOSE_RATE = 0.008;

interface Cloud {
  x: number; y: number;
  rx: number; ry: number;
  drift: number;
  layer: number; // 0 = near, 1 = far
  density: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SkyAndCloudsAtom({
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
    // Parting: 0 = clouds dense, 1 = sky revealed
    parting: 0,
    holding: false,
    holdNotified: false,
    stepNotified: false,
    completed: false,
    // Clouds
    clouds: [] as Cloud[],
    initialized: false,
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

      // ── Init clouds ───────────────────────────────────
      if (!s.initialized) {
        s.clouds = [];
        for (let i = 0; i < CLOUD_COUNT; i++) {
          s.clouds.push({
            x: Math.random(),
            y: 0.15 + Math.random() * 0.7,
            rx: 0.08 + Math.random() * 0.12,
            ry: 0.03 + Math.random() * 0.05,
            drift: (Math.random() - 0.5) * 0.0003,
            layer: i < CLOUD_COUNT / 2 ? 0 : 1,
            density: 0.5 + Math.random() * 0.5,
          });
        }
        s.initialized = true;
      }

      // ── Parting physics ───────────────────────────────
      if (s.holding || p.phase === 'resolve') {
        s.parting = Math.min(1, s.parting + PART_RATE);
      } else if (!s.completed) {
        s.parting = Math.max(0, s.parting - CLOSE_RATE);
      }

      if (s.parting >= 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      if (s.parting >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      cb.onStateChange?.(s.parting);

      const part = s.parting;

      // ── Sky radiance (emerges behind clouds) ──────────
      const skyAlpha = ALPHA.glow.max * part * 0.5 * entrance;
      if (skyAlpha > 0.005) {
        const skyGrad = ctx.createRadialGradient(cx, cy * 0.7, 0, cx, cy * 0.7, px(0.5, minDim));
        skyGrad.addColorStop(0, rgba(s.primaryRgb, skyAlpha));
        skyGrad.addColorStop(0.4, rgba(s.primaryRgb, skyAlpha * 0.5));
        skyGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Draw clouds ───────────────────────────────────
      for (const c of s.clouds) {
        // Drift
        if (!p.reducedMotion) {
          c.x += c.drift * ms;
          if (c.x > 1.2) c.x = -0.2;
          if (c.x < -0.2) c.x = 1.2;
        }

        // Parting displacement: clouds push outward from center
        const dx = c.x - 0.5;
        const dy = c.y - 0.5;
        const partDisp = part * 0.4;
        const dispX = (c.x + dx * partDisp) * w;
        const dispY = (c.y + dy * partDisp * 0.3) * h;

        // Cloud scale shrinks with parting (receding)
        const scale = 1 - part * 0.4 * (c.layer === 0 ? 1 : 0.6);
        const cloudRx = px(c.rx * scale, minDim);
        const cloudRy = px(c.ry * scale, minDim);

        // Cloud opacity decreases with parting
        const cloudAlpha = ALPHA.content.max * c.density * (1 - part * 0.7) * entrance;
        if (cloudAlpha < 0.005) continue;

        // Soft elliptical cloud
        const cloudGrad = ctx.createRadialGradient(dispX, dispY, 0, dispX, dispY, cloudRx);
        const cloudColor = c.layer === 0 ? s.accentRgb : lerpColor(s.primaryRgb, s.accentRgb, 0.3);
        cloudGrad.addColorStop(0, rgba(cloudColor, cloudAlpha));
        cloudGrad.addColorStop(0.5, rgba(cloudColor, cloudAlpha * 0.5));
        cloudGrad.addColorStop(1, rgba(cloudColor, 0));

        ctx.save();
        ctx.translate(dispX, dispY);
        ctx.scale(1, cloudRy / cloudRx);
        ctx.fillStyle = cloudGrad;
        ctx.fillRect(-cloudRx, -cloudRx, cloudRx * 2, cloudRx * 2);
        ctx.restore();

        // Breath modulation on near clouds
        if (c.layer === 0) {
          const breathMod = breath * 0.03;
          const breathGrad = ctx.createRadialGradient(dispX, dispY, 0, dispX, dispY, cloudRx * (1 + breathMod));
          breathGrad.addColorStop(0, rgba(cloudColor, cloudAlpha * 0.2 * breathMod * 10));
          breathGrad.addColorStop(1, rgba(cloudColor, 0));
          ctx.save();
          ctx.translate(dispX, dispY);
          ctx.scale(1, cloudRy / cloudRx);
          ctx.fillStyle = breathGrad;
          ctx.fillRect(-cloudRx * 1.5, -cloudRx * 1.5, cloudRx * 3, cloudRx * 3);
          ctx.restore();
        }
      }

      // ── Central sky-self indicator ────────────────────
      if (part > 0.3) {
        const selfAlpha = ALPHA.content.max * Math.min(1, (part - 0.3) / 0.5) * entrance;
        const selfR = px(0.008, minDim);
        const selfY = cy * 0.7;

        // Subtle ring — the unchanging sky-self
        ctx.beginPath();
        ctx.arc(cx, selfY, selfR * (1 + breath * 0.05), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, selfAlpha * 0.6);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // Inner dot
        ctx.beginPath();
        ctx.arc(cx, selfY, selfR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, selfAlpha);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.completed) return;
      s.holding = true;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };

    const onUp = () => {
      stateRef.current.holding = false;
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
