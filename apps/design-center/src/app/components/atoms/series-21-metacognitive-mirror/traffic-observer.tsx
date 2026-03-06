/**
 * ATOM 204: THE TRAFFIC OBSERVER ENGINE
 * =======================================
 * Series 21 — Metacognitive Mirror · Position 4
 *
 * You are not the traffic — you are the one watching. Let thoughts
 * drive by without jumping in front. Hold to elevate to the overpass.
 *
 * PHYSICS:
 *   - "Thought vehicles" scroll horizontally at street level
 *   - User's observer node is near the road, tempted to engage
 *   - Hold finger → camera elevates to overpass perspective
 *   - Vehicles shrink, slow, become distant background noise
 *   - Resolution: serene elevated watching position
 *
 * INTERACTION:
 *   Hold → elevate to observer overpass
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static elevated state
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

const VEHICLE_COUNT = 8;
const ELEVATION_RATE = 0.006;
const DESCENT_RATE = 0.01;

interface Vehicle {
  x: number;       // 0–1 normalized position
  speed: number;    // normalized speed
  lane: number;     // 0 or 1
  width: number;    // normalized width
  colorMix: number; // 0 = primary, 1 = accent
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function TrafficObserverAtom({
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
    // Elevation: 0 = street level, 1 = overpass
    elevation: 0,
    holding: false,
    holdNotified: false,
    completed: false,
    // Vehicles
    vehicles: [] as Vehicle[],
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

      // ── Initialize vehicles ───────────────────────────
      if (!s.initialized) {
        s.vehicles = [];
        for (let i = 0; i < VEHICLE_COUNT; i++) {
          s.vehicles.push({
            x: Math.random(),
            speed: 0.002 + Math.random() * 0.003,
            lane: i % 2,
            width: 0.04 + Math.random() * 0.03,
            colorMix: Math.random(),
          });
        }
        s.initialized = true;
      }

      // ── Elevation physics ─────────────────────────────
      if (s.holding || p.phase === 'resolve') {
        s.elevation = Math.min(1, s.elevation + ELEVATION_RATE);
      } else if (!s.completed) {
        s.elevation = Math.max(0, s.elevation - DESCENT_RATE);
      }

      if (s.elevation >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      cb.onStateChange?.(s.elevation);

      const elev = s.elevation;

      // ── Road perspective ──────────────────────────────
      // At street level: road is at cy, wide. At overpass: road shrinks down.
      const roadY = cy * (0.65 + elev * 0.25);
      const roadH = px(0.06, minDim) * (1 - elev * 0.6);
      const perspective = 1 - elev * 0.7;

      // Road surface
      const roadAlpha = ALPHA.atmosphere.min * entrance * (0.5 + (1 - elev) * 0.5);
      ctx.fillStyle = rgba(s.primaryRgb, roadAlpha * 0.3);
      ctx.fillRect(0, roadY - roadH / 2, w, roadH);

      // Center line
      ctx.strokeStyle = rgba(s.primaryRgb, roadAlpha * 0.5);
      ctx.lineWidth = px(0.001, minDim);
      ctx.setLineDash([px(0.01, minDim), px(0.008, minDim)]);
      ctx.beginPath();
      ctx.moveTo(0, roadY);
      ctx.lineTo(w, roadY);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Draw vehicles (thoughts) ──────────────────────
      for (const v of s.vehicles) {
        // Move
        if (!p.reducedMotion) {
          const dir = v.lane === 0 ? 1 : -1;
          v.x += v.speed * dir * ms * (1 - elev * 0.4);
          // Wrap
          if (v.x > 1.15) v.x = -0.15;
          if (v.x < -0.15) v.x = 1.15;
        }

        const vx = v.x * w;
        const laneOffset = (v.lane === 0 ? -1 : 1) * roadH * 0.3;
        const vy = roadY + laneOffset;
        const vw = px(v.width * perspective, minDim);
        const vh = px(0.008 * perspective, minDim);

        const vColor = lerpColor(s.primaryRgb, s.accentRgb, v.colorMix);
        const vAlpha = ALPHA.content.max * entrance * (0.4 + (1 - elev) * 0.4);

        // Vehicle body
        ctx.fillStyle = rgba(vColor, vAlpha);
        ctx.fillRect(vx - vw / 2, vy - vh / 2, vw, vh);

        // Vehicle glow (more visible at street level)
        if (elev < 0.7) {
          const glowR = px(0.015 * (1 - elev), minDim);
          const glow = ctx.createRadialGradient(vx, vy, 0, vx, vy, glowR);
          glow.addColorStop(0, rgba(vColor, ALPHA.glow.max * 0.3 * (1 - elev) * entrance));
          glow.addColorStop(1, rgba(vColor, 0));
          ctx.fillStyle = glow;
          ctx.fillRect(vx - glowR, vy - glowR, glowR * 2, glowR * 2);
        }
      }

      // ── Observer node ─────────────────────────────────
      // Rises from street level to overpass
      const observerY = roadY - px(0.04 + elev * 0.25, minDim);
      const observerR = px(0.012, minDim);
      const observerPulse = 1 + breath * 0.06 + Math.sin(s.frameCount * 0.02 * ms) * 0.05;

      // Observer glow (expands with elevation — serenity)
      const obsGlowR = px(0.04 + elev * 0.08, minDim);
      const obsGlow = ctx.createRadialGradient(cx, observerY, 0, cx, observerY, obsGlowR);
      obsGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.2 + elev * 0.4) * entrance));
      obsGlow.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
      obsGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = obsGlow;
      ctx.fillRect(cx - obsGlowR, observerY - obsGlowR, obsGlowR * 2, obsGlowR * 2);

      // Observer dot
      ctx.beginPath();
      ctx.arc(cx, observerY, observerR * observerPulse, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Overpass structure (emerges with elevation) ───
      if (elev > 0.2) {
        const structAlpha = ALPHA.atmosphere.min * Math.min(1, (elev - 0.2) / 0.5) * entrance;
        const railY = observerY + observerR * 2;

        // Horizontal rail
        ctx.beginPath();
        ctx.moveTo(cx - px(0.15, minDim), railY);
        ctx.lineTo(cx + px(0.15, minDim), railY);
        ctx.strokeStyle = rgba(s.primaryRgb, structAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // Vertical supports
        const supportH = roadY - railY;
        for (const xOff of [-0.12, 0.12]) {
          ctx.beginPath();
          ctx.moveTo(cx + px(xOff, minDim), railY);
          ctx.lineTo(cx + px(xOff, minDim), railY + supportH);
          ctx.stroke();
        }
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
