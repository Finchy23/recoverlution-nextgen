/**
 * ATOM 208: THE ECHOMAKER ENGINE
 * ================================
 * Series 21 — Metacognitive Mirror · Position 8
 *
 * Hear your thought as if it belongs to someone else. Bounce it off
 * a canyon wall — realize it is just sound. Hold to push the waveform
 * deeper into the canyon where it echoes and fades.
 *
 * PHYSICS:
 *   - A harsh waveform sits close to user (the intrusive thought)
 *   - Hold to push it away into a deepening canyon
 *   - Waveform echoes, reverberates, becomes distant
 *   - Resolution: the thought is just fading sound in a vast space
 *
 * INTERACTION:
 *   Hold → pushes waveform into canyon depth
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static echoed state
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

const PUSH_RATE = 0.005;
const RELEASE_RATE = 0.008;
const ECHO_COUNT = 4;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EchomakerAtom({
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
    // Depth: 0 = close, 1 = deep canyon
    depth: 0,
    holding: false,
    holdNotified: false,
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
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ── Depth physics ─────────────────────────────────
      if (s.holding || p.phase === 'resolve') {
        s.depth = Math.min(1, s.depth + PUSH_RATE);
      } else if (!s.completed) {
        s.depth = Math.max(0, s.depth - RELEASE_RATE);
      }

      if (s.depth >= 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.depth >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.depth);

      const d = s.depth;
      const time = s.frameCount * 0.03 * ms;

      // ── Canyon walls ──────────────────────────────────
      // Perspective: walls converge with depth
      const wallAlpha = ALPHA.atmosphere.min * entrance;
      const converge = d * 0.3;

      // Left wall
      ctx.beginPath();
      ctx.moveTo(w * (0.05 + converge), 0);
      ctx.lineTo(w * (0.15 + converge * 0.5), h);
      ctx.strokeStyle = rgba(s.primaryRgb, wallAlpha * 0.6);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // Right wall
      ctx.beginPath();
      ctx.moveTo(w * (0.95 - converge), 0);
      ctx.lineTo(w * (0.85 - converge * 0.5), h);
      ctx.stroke();

      // Canyon depth gradient
      if (d > 0.1) {
        const depthGrad = ctx.createLinearGradient(0, 0, 0, h);
        const depthAlpha = ALPHA.atmosphere.min * d * 0.5 * entrance;
        depthGrad.addColorStop(0, rgba(s.primaryRgb, 0));
        depthGrad.addColorStop(0.3, rgba(s.primaryRgb, depthAlpha));
        depthGrad.addColorStop(1, rgba(s.primaryRgb, depthAlpha * 0.3));
        ctx.fillStyle = depthGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Primary waveform (the thought) ────────────────
      // Moves away from user as depth increases
      const waveY = cy * (0.6 + d * 0.6); // pushes deeper
      const waveAmplitude = px(0.04 * (1 - d * 0.7), minDim); // shrinks
      const waveWidth = w * (0.7 - d * 0.4);
      const waveStartX = cx - waveWidth / 2;
      const waveAlpha = ALPHA.content.max * (1 - d * 0.6) * entrance;

      // Jagged waveform
      ctx.beginPath();
      for (let x = 0; x <= waveWidth; x += 2) {
        const nx = x / waveWidth;
        // Harsh at close range, smooth at distance
        const harshness = 1 - d * 0.8;
        const wave = Math.sin(nx * 8 * Math.PI + time) * waveAmplitude;
        const jagged = Math.sin(nx * 23 * Math.PI + time * 1.7) * waveAmplitude * 0.4 * harshness;
        const py = waveY + wave + jagged;
        if (x === 0) ctx.moveTo(waveStartX + x, py);
        else ctx.lineTo(waveStartX + x, py);
      }
      ctx.strokeStyle = rgba(s.accentRgb, waveAlpha);
      ctx.lineWidth = px(0.002 * (1 - d * 0.5), minDim);
      ctx.stroke();

      // ── Echo waveforms ────────────────────────────────
      for (let echo = 0; echo < ECHO_COUNT; echo++) {
        const echoDelay = (echo + 1) * 0.15;
        const echoDepth = Math.max(0, d - echoDelay);
        if (echoDepth <= 0) continue;

        const echoY = waveY + px(0.03 * (echo + 1), minDim) * d;
        const echoAmp = waveAmplitude * 0.5 * Math.pow(0.6, echo) * echoDepth;
        const echoW = waveWidth * (0.8 - echo * 0.1);
        const echoStartX = cx - echoW / 2;
        const echoAlpha = waveAlpha * 0.4 * Math.pow(0.5, echo) * echoDepth;

        if (echoAlpha < 0.005) continue;

        ctx.beginPath();
        for (let x = 0; x <= echoW; x += 3) {
          const nx = x / echoW;
          const wave = Math.sin(nx * 8 * Math.PI + time - echoDelay * 10) * echoAmp;
          const py = echoY + wave;
          if (x === 0) ctx.moveTo(echoStartX + x, py);
          else ctx.lineTo(echoStartX + x, py);
        }

        const echoColor = lerpColor(s.accentRgb, s.primaryRgb, (echo + 1) / (ECHO_COUNT + 1));
        ctx.strokeStyle = rgba(echoColor, echoAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── User position (near side) ────────────────────
      const userY = h * 0.2;
      const userR = px(0.01, minDim);
      ctx.beginPath();
      ctx.arc(cx, userY, userR * (1 + breath * 0.05), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Listening lines (from user to waveform)
      if (d < 0.8) {
        const lineAlpha = ALPHA.atmosphere.min * (1 - d) * 0.4 * entrance;
        ctx.beginPath();
        ctx.moveTo(cx, userY + userR);
        ctx.lineTo(cx, waveY - waveAmplitude);
        ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.setLineDash([px(0.003, minDim), px(0.005, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
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
