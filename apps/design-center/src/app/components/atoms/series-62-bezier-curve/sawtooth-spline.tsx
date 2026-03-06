/**
 * ATOM 612: THE SAWTOOTH SPLINE ENGINE
 * ======================================
 * Series 62 — Bezier Curve · Position 2
 *
 * Cure emotional overcorrection. Drag the master spline slider —
 * every violent sawtooth spike is mathematically sanded into a
 * gentle rolling sustained sine wave.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Vertical flow arrows above each wave peak/trough
 *   - Sawtooth → arrows erratic, crashing against each other
 *   - Sine → arrows smoothly undulate in laminar harmony
 *   - The flow field visualizes the derivative of the waveform
 *
 * PHYSICS:
 *   - 60-point waveform spans viewport width
 *   - Sawtooth: sharp triangular with violent spikes
 *   - Slider morphs sawtooth → sine continuously
 *   - Breath modulates wave amplitude + glow warmth
 *   - Node rides the wave, shaking violently on sawtooth
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + depth-of-field blur
 *   2. Flow field derivative arrows
 *   3. Wave shadow + glow trail
 *   4. Wave body with multi-stop gradient stroke
 *   5. Wave peaks with specular highlights
 *   6. Riding node with multi-glow
 *   7. Slider control with glass body
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Drag (horizontal slider) → smooths wave
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static sine wave
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, PARTICLE_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Number of wave sample points */
const WAVE_POINTS = 60;
/** Wave amplitude (viewport fraction of minDim) */
const WAVE_AMP = SIZE.md * 0.6;
/** Wave frequency (number of full cycles) */
const WAVE_FREQ = 3.5;
/** Slider width as fraction of viewport */
const SLIDER_W = 0.48;
/** Slider vertical position */
const SLIDER_Y_FRAC = 0.84;
/** Slider track height */
const SLIDER_TRACK_H = STROKE.bold;
/** Slider knob radius */
const KNOB_R = PARTICLE_SIZE.xl;
/** Knob glow layers */
const KNOB_GLOW_LAYERS = 3;
/** Flow arrow grid: columns */
const FLOW_COLS = 24;
/** Flow arrow rows above/below wave */
const FLOW_ROWS = 6;
/** Flow arrow length */
const FLOW_ARROW_LEN = 0.02;
/** Wave stroke weight */
const WAVE_STROKE = STROKE.bold;
/** Wave glow stroke (wider) */
const WAVE_GLOW_STROKE = 0.008;
/** Node riding the wave radius */
const RIDER_R = PARTICLE_SIZE.lg;
/** Rider glow layers */
const RIDER_GLOW_LAYERS = 4;
/** Rider position (fraction along wave) */
const RIDER_POS = 0.35;
/** Peak specular interval (every Nth point) */
const SPECULAR_INTERVAL = 8;
/** Breath wave modulation */
const BREATH_AMP_MOD = 0.08;
/** Breath glow warmth */
const BREATH_GLOW_WARMTH = 0.15;
/** Completion threshold */
const COMPLETION_THRESHOLD = 0.95;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Completion bloom duration */
const BLOOM_FRAMES = 30;

// =====================================================================
// STATE TYPES
// =====================================================================

interface WaveState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  smooth: number;
  dragging: boolean;
  lastTier: number;
  completed: boolean;
  bloomTimer: number;
}

// =====================================================================
// HELPER: WAVE Y VALUE
// =====================================================================

/**
 * Compute Y value for blended sawtooth→sine wave at position t.
 */
function waveY(t: number, smooth: number, phaseOff: number): number {
  // Sawtooth: triangle wave with sharp peaks
  const sawPhase = (t * WAVE_FREQ * 2 + phaseOff / Math.PI) % 1;
  const sawVal = sawPhase < 0.5
    ? sawPhase * 4 - 1
    : 3 - sawPhase * 4;

  // Sine: smooth harmonic
  const sinVal = Math.sin(t * Math.PI * 2 * WAVE_FREQ + phaseOff);

  // Blend
  return sawVal * (1 - smooth) + sinVal * smooth;
}

/**
 * Compute wave derivative (slope) at position t.
 */
function waveSlope(t: number, smooth: number, phaseOff: number): number {
  const dt = 0.002;
  return (waveY(t + dt, smooth, phaseOff) - waveY(t - dt, smooth, phaseOff)) / (dt * 2);
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SawtoothSplineAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<WaveState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    smooth: 0,
    dragging: false,
    lastTier: 0,
    completed: false,
    bloomTimer: 0,
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

    // ═══════════════════════════════════════════════════════════════
    // RENDER LOOP
    // ═══════════════════════════════════════════════════════════════
    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const sm = s.smooth;

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      const amp = px(WAVE_AMP, minDim) * (1 + breath * BREATH_AMP_MOD);
      const phaseOff = s.frameCount * 0.025 * ms;
      const waveLeft = w * 0.06;
      const waveRight = w * 0.94;
      const waveW = waveRight - waveLeft;
      const waveCy = cy * 0.85;

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD (Derivative Arrows)
      // ═══════════════════════════════════════════════════════════
      {
        const arrowLen = px(FLOW_ARROW_LEN, minDim);
        ctx.lineWidth = px(STROKE.hairline, minDim);

        for (let col = 0; col < FLOW_COLS; col++) {
          const t = col / (FLOW_COLS - 1);
          const xPos = waveLeft + t * waveW;
          const slope = waveSlope(t, sm, phaseOff);
          const baseY = waveCy + waveY(t, sm, phaseOff) * amp;

          for (let row = -FLOW_ROWS; row <= FLOW_ROWS; row++) {
            if (row === 0) continue;
            const fy = baseY + row * px(0.025, minDim);
            if (fy < h * 0.03 || fy > h * 0.75) continue;

            // Flow direction based on derivative
            const dist = Math.abs(fy - baseY) / (px(0.025, minDim) * FLOW_ROWS);
            const influence = Math.max(0, 1 - dist);
            const angle = Math.atan2(slope * influence, 1);
            const mag = 0.4 + influence * 0.6;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle) * 0.3;

            // Color: chaotic=accent, smooth=primary
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, sm);
            const alpha = ALPHA.background.max * mag * entrance * (0.5 + sm * 0.5);
            ctx.strokeStyle = rgba(arrowColor, alpha);

            ctx.beginPath();
            const aLen = arrowLen * mag;
            const ex = xPos + dx * aLen;
            const ey = fy + dy * aLen;
            ctx.moveTo(xPos, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // Tiny arrowhead
            const headLen = aLen * 0.25;
            const a = Math.atan2(dy, dx);
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * headLen, ey - Math.sin(a - 0.5) * headLen);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: WAVE GLOW TRAIL
      // ═══════════════════════════════════════════════════════════
      {
        ctx.beginPath();
        for (let i = 0; i <= WAVE_POINTS; i++) {
          const t = i / WAVE_POINTS;
          const x = waveLeft + t * waveW;
          const y = waveCy + waveY(t, sm, phaseOff) * amp;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const glowColor = lerpColor(s.primaryRgb, s.accentRgb, 1 - sm);
        ctx.strokeStyle = rgba(glowColor, ALPHA.glow.max * entrance * (0.4 + sm * 0.6));
        ctx.lineWidth = px(WAVE_GLOW_STROKE, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4: WAVE BODY
      // ═══════════════════════════════════════════════════════════
      {
        ctx.beginPath();
        for (let i = 0; i <= WAVE_POINTS; i++) {
          const t = i / WAVE_POINTS;
          const x = waveLeft + t * waveW;
          const y = waveCy + waveY(t, sm, phaseOff) * amp;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const waveColor = lerpColor(s.accentRgb, s.primaryRgb, sm);
        ctx.strokeStyle = rgba(waveColor, ALPHA.focal.max * entrance);
        ctx.lineWidth = px(WAVE_STROKE, minDim);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 5: WAVE PEAK SPECULARS
      // ═══════════════════════════════════════════════════════════
      for (let i = 0; i <= WAVE_POINTS; i += SPECULAR_INTERVAL) {
        const t = i / WAVE_POINTS;
        const yVal = waveY(t, sm, phaseOff);
        if (Math.abs(yVal) > 0.6) {
          const x = waveLeft + t * waveW;
          const y = waveCy + yVal * amp;
          const specR = px(PARTICLE_SIZE.dot, minDim) * (0.5 + sm * 0.5);
          ctx.beginPath();
          ctx.arc(x, y - specR * 2, specR, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.min * entrance * sm);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: RIDING NODE
      // ═══════════════════════════════════════════════════════════
      {
        const riderT = (RIDER_POS + s.frameCount * 0.001 * ms) % 1;
        const rx = waveLeft + riderT * waveW;
        const ry = waveCy + waveY(riderT, sm, phaseOff) * amp;
        const shake = (1 - sm) * Math.sin(s.frameCount * 0.5) * px(0.003, minDim) * ms;

        // Multi-glow
        for (let g = RIDER_GLOW_LAYERS; g >= 1; g--) {
          const gr = px(RIDER_R, minDim) * (1 + g * 1.3);
          const ga = (ALPHA.glow.max / g) * entrance;
          const rGlow = ctx.createRadialGradient(rx + shake, ry, 0, rx + shake, ry, gr);
          rGlow.addColorStop(0, rgba(s.primaryRgb, ga));
          rGlow.addColorStop(0.5, rgba(s.primaryRgb, ga * 0.3));
          rGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = rGlow;
          ctx.beginPath();
          ctx.arc(rx + shake, ry, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node body
        const nr = px(RIDER_R, minDim) * (1 + breath * 0.1);
        const nGrad = ctx.createRadialGradient(rx + shake, ry, 0, rx + shake, ry, nr);
        nGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.35), ALPHA.accent.max * entrance));
        nGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        nGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        nGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGrad;
        ctx.beginPath();
        ctx.arc(rx + shake, ry, nr, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(rx + shake - nr * 0.3, ry - nr * 0.3, nr * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: SLIDER CONTROL
      // ═══════════════════════════════════════════════════════════
      {
        const sliderY = h * SLIDER_Y_FRAC;
        const sliderW = w * SLIDER_W;
        const sliderX = cx - sliderW / 2;
        const trackH = px(SLIDER_TRACK_H, minDim);

        // Track background
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        const trackR = trackH / 2;
        ctx.beginPath();
        ctx.moveTo(sliderX + trackR, sliderY - trackH / 2);
        ctx.lineTo(sliderX + sliderW - trackR, sliderY - trackH / 2);
        ctx.arc(sliderX + sliderW - trackR, sliderY, trackR, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(sliderX + trackR, sliderY + trackH / 2);
        ctx.arc(sliderX + trackR, sliderY, trackR, Math.PI / 2, -Math.PI / 2);
        ctx.fill();

        // Filled portion
        const fillW = sliderW * sm;
        if (fillW > 0) {
          const fillGrad = ctx.createLinearGradient(sliderX, 0, sliderX + fillW, 0);
          fillGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.atmosphere.max * entrance));
          fillGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * entrance));
          ctx.fillStyle = fillGrad;
          ctx.fillRect(sliderX, sliderY - trackH / 2, fillW, trackH);
        }

        // Knob
        const knobX = sliderX + sliderW * sm;
        const knobR = px(KNOB_R, minDim) * (1 + breath * 0.05);

        // Knob glow
        for (let g = KNOB_GLOW_LAYERS; g >= 1; g--) {
          const gr = knobR * (1 + g * 0.8);
          const kGlow = ctx.createRadialGradient(knobX, sliderY, 0, knobX, sliderY, gr);
          kGlow.addColorStop(0, rgba(s.primaryRgb, (ALPHA.glow.max / g) * entrance));
          kGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = kGlow;
          ctx.beginPath();
          ctx.arc(knobX, sliderY, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Knob body — glass-like gradient
        const kGrad = ctx.createRadialGradient(knobX, sliderY, 0, knobX, sliderY, knobR);
        kGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5), ALPHA.accent.max * entrance));
        kGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        kGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        kGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = kGrad;
        ctx.beginPath();
        ctx.arc(knobX, sliderY, knobR, 0, Math.PI * 2);
        ctx.fill();

        // Knob specular
        ctx.beginPath();
        ctx.arc(knobX - knobR * 0.25, sliderY - knobR * 0.25, knobR * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // TIER HAPTICS + COMPLETION
      // ═══════════════════════════════════════════════════════════
      const tier = Math.floor(sm * 5);
      if (tier > s.lastTier) {
        cb.onHaptic('step_advance');
      }
      s.lastTier = tier;

      if (sm >= COMPLETION_THRESHOLD && !s.completed) {
        s.completed = true;
        s.bloomTimer = BLOOM_FRAMES;
        cb.onHaptic('completion');
        cb.onStateChange?.(1);
      }
      if (s.bloomTimer > 0) s.bloomTimer -= ms;

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS RING + COMPLETION BLOOM
      // ═══════════════════════════════════════════════════════════
      {
        const ringX = w * 0.92;
        const ringY = h * 0.08;
        const ringR = px(PROGRESS_R, minDim);

        // Background ring
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Progress arc
        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sm);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // Completion bloom
      if (s.bloomTimer > 0) {
        const bloomT = s.bloomTimer / BLOOM_FRAMES;
        const bloomR = px(SIZE.lg, minDim) * (1 - bloomT);
        const bloom = ctx.createRadialGradient(cx, waveCy, 0, cx, waveCy, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(cx, waveCy, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const sliderStart = 0.5 - SLIDER_W / 2;
      const newSmooth = Math.max(0, Math.min(1, (mx - sliderStart) / SLIDER_W));
      s.smooth = newSmooth;
      callbacksRef.current.onStateChange?.(s.smooth * 0.95);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }}
      />
    </div>
  );
}
