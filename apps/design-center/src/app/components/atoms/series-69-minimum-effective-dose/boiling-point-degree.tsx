/**
 * ATOM 687: THE BOILING POINT ENGINE
 * =====================================
 * Series 69 — Minimum Effective Dose · Position 7
 *
 * The final step requires the least effort. Water at 99°.
 * One microscopic fraction of a degree crosses the phase-change
 * threshold — instant massive violent eruption into transformation.
 *
 * PHYSICS:
 *   - Digital pot of water rendered as horizontal fluid surface
 *   - Temperature gauge slowly building from 95° to 99°
 *   - At 99°: water looks completely static despite massive energy
 *   - Single tap: adds final 0.1° crossing 100° threshold
 *   - Phase change: water surface erupts into violent rolling boil
 *   - Bubble particles rise from bottom with acceleration
 *   - Steam particles rise from surface
 *   - Surface wave dynamics during boil
 *
 * INTERACTION:
 *   Wait for 99° plateau → single tap → phase change eruption (completion)
 *
 * RENDER: Canvas 2D with fluid dynamics + bubble simulation
 * REDUCED MOTION: Static boiling surface with steam
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

const WATER_TOP_Y = 0.5;
const WATER_BOTTOM_Y = 0.85;
const TEMP_START = 95;
const TEMP_PLATEAU = 99;
const TEMP_BOIL = 100;
const HEAT_RATE = 0.008;
const PLATEAU_WAIT = 180;          // frames at 99 before tap is available
const BUBBLE_COUNT = 40;
const BUBBLE_SPEED = 0.003;
const BUBBLE_SIZE_MAX = 0.008;
const STEAM_COUNT = 20;
const STEAM_SPEED = 0.002;
const SURFACE_WAVES = 8;
const WAVE_AMP = 0.008;
const GLOW_LAYERS = 3;

interface Bubble {
  x: number; y: number;
  size: number;
  speed: number;
  wobble: number;
}

interface Steam {
  x: number; y: number;
  vy: number;
  size: number;
  alpha: number;
}

export default function BoilingPointDegreeAtom({
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
    temp: TEMP_START,
    plateauFrames: 0,
    boiling: false,
    boilProgress: 0,
    bubbles: [] as Bubble[],
    steams: [] as Steam[],
    tappable: false,
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
        // Static boiling surface
        const surfY = WATER_TOP_Y * h;
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.fillRect(0, surfY, w, (WATER_BOTTOM_Y - WATER_TOP_Y) * h);
        // Bubbles
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * w, surfY + Math.random() * h * 0.2, px(0.004, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
          ctx.lineWidth = px(0.0005, minDim);
          ctx.stroke();
        }
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') { s.temp = TEMP_BOIL; s.boiling = true; }

      // ── Temperature physics ───────────────────────────────
      if (!s.boiling) {
        if (s.temp < TEMP_PLATEAU) {
          s.temp = Math.min(TEMP_PLATEAU, s.temp + HEAT_RATE * ms);
        } else {
          s.plateauFrames += ms;
          if (s.plateauFrames > PLATEAU_WAIT && !s.tappable) {
            s.tappable = true;
            cb.onHaptic('step_advance');
            s.stepNotified = true;
          }
        }
      }

      if (s.boiling) {
        s.boilProgress = Math.min(1, s.boilProgress + 0.008 * ms);

        // Spawn bubbles
        if (s.frameCount % 2 === 0 && s.bubbles.length < BUBBLE_COUNT) {
          s.bubbles.push({
            x: 0.1 + Math.random() * 0.8,
            y: WATER_BOTTOM_Y - 0.02,
            size: BUBBLE_SIZE_MAX * (0.3 + Math.random() * 0.7),
            speed: BUBBLE_SPEED * (0.5 + Math.random()),
            wobble: Math.random() * Math.PI * 2,
          });
        }

        // Spawn steam
        if (s.frameCount % 8 === 0 && s.steams.length < STEAM_COUNT) {
          s.steams.push({
            x: 0.15 + Math.random() * 0.7,
            y: WATER_TOP_Y,
            vy: -STEAM_SPEED * (0.5 + Math.random()),
            size: 0.006 + Math.random() * 0.008,
            alpha: 0.12,
          });
        }

        if (s.boilProgress >= 0.9 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      // Bubble physics
      for (let i = s.bubbles.length - 1; i >= 0; i--) {
        const b = s.bubbles[i];
        b.y -= b.speed * ms;
        b.x += Math.sin(b.wobble + s.frameCount * 0.05) * 0.0003;
        if (b.y < WATER_TOP_Y) s.bubbles.splice(i, 1);
      }

      // Steam physics
      for (let i = s.steams.length - 1; i >= 0; i--) {
        const st = s.steams[i];
        st.y += st.vy * ms;
        st.x += (Math.random() - 0.5) * 0.0005;
        st.alpha *= 0.997;
        if (st.alpha < 0.01 || st.y < 0) s.steams.splice(i, 1);
      }

      cb.onStateChange?.(s.boiling ? 0.5 + s.boilProgress * 0.5 :
        (s.temp - TEMP_START) / (TEMP_PLATEAU - TEMP_START) * 0.5);

      // ── 1. Water body ─────────────────────────────────────
      const surfY = WATER_TOP_Y * h;
      const waterH = (WATER_BOTTOM_Y - WATER_TOP_Y) * h;

      // Water gradient
      const wg = ctx.createLinearGradient(0, surfY, 0, surfY + waterH);
      wg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance));
      wg.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance));
      ctx.fillStyle = wg;
      ctx.fillRect(0, surfY, w, waterH);

      // Surface waves
      if (s.boiling) {
        ctx.beginPath();
        ctx.moveTo(0, surfY);
        for (let x = 0; x <= w; x += 3) {
          const t2 = x / w;
          const waveY = surfY + Math.sin(t2 * SURFACE_WAVES * Math.PI + time * 4) *
            px(WAVE_AMP * s.boilProgress, minDim);
          ctx.lineTo(x, waveY);
        }
        ctx.lineTo(w, surfY + px(0.01, minDim));
        ctx.lineTo(0, surfY + px(0.01, minDim));
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.fill();
      }

      // ── 2. Bubbles ───────────────────────────────────────
      for (const b of s.bubbles) {
        const bx = b.x * w;
        const by = b.y * h;
        const bR = px(b.size, minDim);
        ctx.beginPath();
        ctx.arc(bx, by, bR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.stroke();
        // Bubble highlight
        ctx.beginPath();
        ctx.arc(bx - bR * 0.3, by - bR * 0.3, bR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
        ctx.fill();
      }

      // ── 3. Steam ─────────────────────────────────────────
      for (const st of s.steams) {
        const sx = st.x * w;
        const sy = st.y * h;
        const sR = px(st.size, minDim);
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * st.alpha * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(sx - sR, sy - sR, sR * 2, sR * 2);
      }

      // ── 4. Temperature gauge ──────────────────────────────
      const gaugeX = w * 0.9;
      const gaugeTop = h * 0.25;
      const gaugeH = h * 0.5;
      const gaugeW = px(0.006, minDim);
      const tempFill = (s.temp - TEMP_START) / (TEMP_BOIL - TEMP_START);

      // Gauge background
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
      ctx.fillRect(gaugeX - gaugeW / 2, gaugeTop, gaugeW, gaugeH);

      // Gauge fill
      const fillColor = s.boiling
        ? lerpColor(s.accentRgb, s.primaryRgb, s.boilProgress)
        : s.accentRgb;
      ctx.fillStyle = rgba(fillColor, ALPHA.content.max * 0.3 * entrance);
      ctx.fillRect(gaugeX - gaugeW / 2, gaugeTop + gaugeH * (1 - tempFill), gaugeW, gaugeH * tempFill);

      // 99° / 100° mark
      const markY = gaugeTop + gaugeH * (1 - (TEMP_PLATEAU - TEMP_START) / (TEMP_BOIL - TEMP_START));
      ctx.beginPath();
      ctx.moveTo(gaugeX - gaugeW, markY);
      ctx.lineTo(gaugeX + gaugeW, markY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.lineWidth = px(0.0005, minDim);
      ctx.stroke();

      // ── 5. Tap prompt ─────────────────────────────────────
      if (s.tappable && !s.boiling) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.5);
        const promptR = px(0.015, minDim);
        ctx.beginPath();
        ctx.arc(cx, surfY - px(0.04, minDim), promptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * pulse * entrance);
        ctx.fill();
      }

      // ── 6. Transformation glow ────────────────────────────
      if (s.boilProgress > 0.5) {
        const tR = px(SIZE.sm * s.boilProgress, minDim);
        const tg = ctx.createRadialGradient(cx, surfY, 0, cx, surfY, tR * 3);
        tg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * s.boilProgress * entrance));
        tg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tg;
        ctx.fillRect(cx - tR * 3, surfY - tR * 3, tR * 6, tR * 6);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = () => {
      const s = stateRef.current;
      if (s.boiling || s.completed) return;
      if (s.tappable && s.temp >= TEMP_PLATEAU) {
        s.temp = TEMP_BOIL;
        s.boiling = true;
        callbacksRef.current.onHaptic('tap');
      } else {
        callbacksRef.current.onHaptic('step_advance');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
