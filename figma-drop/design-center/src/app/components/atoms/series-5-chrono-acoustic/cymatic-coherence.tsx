/**
 * ATOM 044: THE CYMATIC COHERENCE ENGINE (Visualizing Sound)
 * ===========================================================
 * Series 5 — Chrono-Acoustic · Position 4
 *
 * What does panic actually LOOK like? If you could see the
 * waveform of an anxious nervous system, it would be a jagged,
 * erratic, fractured mess — harmonics fighting harmonics. But
 * a regulated nervous system produces smooth, beautiful,
 * mathematically perfect geometry — like Chladni figures on a
 * vibrating plate.
 *
 * This atom renders a real-time cymatic pattern: a circular
 * interference figure driven by superimposed sine harmonics.
 * In its chaotic state: 12 overlapping harmonics with random
 * phases create an ugly, spiky, asymmetric mess. The user's
 * job: calm it.
 *
 * Touch the field. Hold still. Breathe slowly. As touch
 * velocity drops toward zero, harmonics begin to LOCK — their
 * random phases align, their amplitudes regularise. The jagged
 * interference resolves into a perfect, symmetrical cymatic
 * mandala. A waveform trace at the bottom shows the raw signal
 * smoothing from noise into a clean sine.
 *
 * PHYSICS:
 *   - 12 harmonic components, each with frequency, amplitude, phase
 *   - Chaos: random phase offsets per harmonic, erratic amplitudes
 *   - Coherence: phases align to 0, amplitudes lock to harmonic series
 *   - Touch velocity → chaos injection (fast = more chaos)
 *   - breathAmplitude → pattern scale (breath = life)
 *   - Cymatic render: polar plot of summed harmonics
 *   - Waveform trace: 1D slice of the harmonic sum
 *
 * HAPTIC JOURNEY:
 *   Touch → hold_start (the measurement begins)
 *   50% coherent → step_advance (pattern emerging)
 *   Full coherence → completion (perfect geometry)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No phase animation, faster coherence, static pattern
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const HARMONIC_COUNT = 12;
/** Points around the cymatic circle */
const POLAR_SAMPLES = 360;
/** Waveform samples along the bottom */
const WAVE_SAMPLES = 250;
/** Coherence gain per frame when still */
const COHERENCE_GAIN = 0.003;
/** Coherence loss per frame from touch velocity */
const CHAOS_SENSITIVITY = 0.015;
/** Cymatic radius as fraction of minDim */
const CYMATIC_RADIUS_FRAC = 0.25;
/** Waveform lane height fraction */
const WAVE_LANE_FRAC = 0.18;

// =====================================================================
// HARMONIC DATA
// =====================================================================

interface Harmonic {
  /** Frequency multiplier (1, 2, 3, ...) */
  freqMult: number;
  /** Symmetry fold (determines the visual pattern) */
  fold: number;
  /** Current amplitude (0–1) */
  amplitude: number;
  /** Target amplitude (harmonic series) */
  targetAmplitude: number;
  /** Current phase offset (radians) — chaos shifts this randomly */
  phase: number;
  /** Target phase (0 = coherent) */
  targetPhase: number;
  /** Phase drift rate (per frame, when chaotic) */
  driftRate: number;
}

function createHarmonics(): Harmonic[] {
  return Array.from({ length: HARMONIC_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      freqMult: n,
      fold: n + 2, // 3, 4, 5, ... fold symmetry
      amplitude: 0.3 + Math.random() * 0.7, // Start chaotic
      targetAmplitude: 1 / n, // Harmonic series: 1, 1/2, 1/3, ...
      phase: Math.random() * Math.PI * 2, // Random start
      targetPhase: 0,
      driftRate: (Math.random() - 0.5) * 0.02,
    };
  });
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [4, 4, 5];
const CYMATIC_CHAOS: RGB = [110, 70, 75];       // Jagged — anxious red
const CYMATIC_COHERENT: RGB = [160, 150, 115];  // Perfect — golden geometry
const CYMATIC_GLOW: RGB = [140, 130, 100];      // Inner glow
const WAVE_CHAOS: RGB = [100, 65, 70];          // Noise trace
const WAVE_CLEAN: RGB = [150, 140, 110];        // Clean sine trace
const GUIDE_COLOR: RGB = [50, 48, 45];
const LABEL_COLOR: RGB = [65, 60, 55];

// =====================================================================
// COMPONENT
// =====================================================================

export default function CymaticCoherenceAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    harmonics: [] as Harmonic[],
    coherence: 0, // 0 = total chaos, 1 = perfect geometry
    isTouching: false,
    lastX: 0,
    lastY: 0,
    touchVelocity: 0,
    holdStartFired: false,
    halfFired: false,
    resolved: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2;
    const waveLaneH = h * WAVE_LANE_FRAC;
    const cymaticCy = (h - waveLaneH) * 0.48;
    const cymaticR = minDim * CYMATIC_RADIUS_FRAC;

    if (!s.initialized) {
      s.harmonics = createHarmonics();
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Coherence dynamics ────────────────────────────
      // Touch velocity decays
      s.touchVelocity *= 0.92;

      if (s.isTouching) {
        // Stillness → coherence, movement → chaos
        const chaosInjection = Math.min(1, s.touchVelocity * CHAOS_SENSITIVITY);
        const coherenceRate = p.reducedMotion ? COHERENCE_GAIN * 3 : COHERENCE_GAIN;
        s.coherence = Math.min(1, Math.max(0,
          s.coherence + coherenceRate - chaosInjection * 0.02));
      } else {
        // Meaningful decay when not touching (~5s to fully decay)
        s.coherence = Math.max(0, s.coherence - 0.003);
      }

      // ── Update harmonics ──────────────────────────────
      for (const harm of s.harmonics) {
        // Phase: drift when chaotic, lock when coherent
        if (!p.reducedMotion) {
          const driftScale = 1 - s.coherence;
          harm.phase += harm.driftRate * driftScale;
          // Pull toward target phase
          harm.phase += (harm.targetPhase - harm.phase) * s.coherence * 0.02;
        } else {
          harm.phase = harm.targetPhase * (1 - s.coherence) + harm.targetPhase * s.coherence;
        }

        // Amplitude: regularise toward harmonic series
        harm.amplitude += (harm.targetAmplitude - harm.amplitude) * s.coherence * 0.02;
        // Add noise when chaotic
        if (!p.reducedMotion) {
          harm.amplitude += (Math.random() - 0.5) * 0.01 * (1 - s.coherence);
          harm.amplitude = Math.max(0.01, Math.min(1, harm.amplitude));
        }
      }

      // Haptics
      if (s.coherence >= 0.5 && !s.halfFired) {
        s.halfFired = true;
        cb.onHaptic('step_advance');
      }
      if (s.coherence < 0.4) s.halfFired = false;

      if (s.coherence >= 0.95 && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.coherence);

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ══════════════════════════════════════════════════

      const bgColor = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Coherence glow
      if (s.coherence > 0.3) {
        const glowAlpha = (s.coherence - 0.3) * 0.02 * entrance;
        const glowColor = lerpColor(CYMATIC_GLOW, s.accentRgb, 0.1);
        const glowR = cymaticR * 1.8;
        const glowGrad = ctx.createRadialGradient(cx, cymaticCy, 0, cx, cymaticCy, glowR);
        glowGrad.addColorStop(0, rgba(glowColor, glowAlpha));
        glowGrad.addColorStop(0.5, rgba(glowColor, glowAlpha * 0.2));
        glowGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ══════════════════════════════════════════════════
      // CYMATIC PATTERN (polar harmonic superposition)
      // ══════════════════════════════════════════════════

      const breathScale = 1 + p.breathAmplitude * 0.08;
      const time = p.reducedMotion ? 0 : s.frameCount * 0.003;

      const patternColor = lerpColor(
        lerpColor(CYMATIC_CHAOS, s.primaryRgb, 0.05),
        lerpColor(CYMATIC_COHERENT, s.accentRgb, 0.08),
        s.coherence,
      );
      const patternAlpha = (0.06 + s.coherence * 0.08) * entrance;
      const lineW = minDim * 0.001 + s.coherence * minDim * 0.002;

      // Draw multiple concentric cymatic layers
      for (let layer = 0; layer < 3; layer++) {
        const layerScale = 0.6 + layer * 0.25;
        const layerAlpha = patternAlpha * (1 - layer * 0.25);

        ctx.beginPath();
        for (let i = 0; i <= POLAR_SAMPLES; i++) {
          const theta = (i / POLAR_SAMPLES) * Math.PI * 2;

          // Sum harmonics at this angle
          let r = 0;
          for (const harm of s.harmonics) {
            r += harm.amplitude * Math.sin(theta * harm.fold + harm.phase + time * harm.freqMult * 0.5);
          }

          // Normalise and scale
          const normalised = r / HARMONIC_COUNT;
          const radius = cymaticR * layerScale * breathScale * (1 + normalised * 0.4);

          const px = cx + Math.cos(theta) * radius;
          const py = cymaticCy + Math.sin(theta) * radius;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(patternColor, layerAlpha);
        ctx.lineWidth = lineW * (1 - layer * 0.2);
        ctx.stroke();

        // Fill (very subtle, inner layer only)
        if (layer === 0 && s.coherence > 0.5) {
          ctx.fillStyle = rgba(patternColor, layerAlpha * 0.05);
          ctx.fill();
        }
      }

      // Symmetry axis lines (emerge with coherence)
      if (s.coherence > 0.4 && !p.reducedMotion) {
        const axisCount = Math.round(3 + s.coherence * 6); // 3–9 fold symmetry
        const axisAlpha = (s.coherence - 0.4) * 0.015 * entrance;
        const axisColor = lerpColor(GUIDE_COLOR, s.primaryRgb, 0.04);

        for (let i = 0; i < axisCount; i++) {
          const a = (i / axisCount) * Math.PI * 2 + time * 0.1;
          const innerR = cymaticR * 0.15;
          const outerR = cymaticR * 1.1 * breathScale;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * innerR, cymaticCy + Math.sin(a) * innerR);
          ctx.lineTo(cx + Math.cos(a) * outerR, cymaticCy + Math.sin(a) * outerR);
          ctx.strokeStyle = rgba(axisColor, axisAlpha);
          ctx.lineWidth = minDim * 0.0004;
          ctx.stroke();
        }
      }

      // Center point
      {
        const dotColor = lerpColor(patternColor, s.accentRgb, 0.06);
        const dotAlpha = (0.05 + s.coherence * 0.1) * entrance;
        ctx.beginPath();
        ctx.arc(cx, cymaticCy, minDim * 0.003, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dotColor, dotAlpha);
        ctx.fill();
      }

      // ═════════════════════════════════════════════════
      // WAVEFORM TRACE (bottom lane)
      // ══════════════════════════════════════════════════

      const waveTop = h - waveLaneH;
      const waveCy = waveTop + waveLaneH * 0.5;
      const waveAmp = waveLaneH * 0.35;

      // Lane separator
      const sepColor = lerpColor(GUIDE_COLOR, s.primaryRgb, 0.03);
      ctx.beginPath();
      ctx.moveTo(0, waveTop);
      ctx.lineTo(w, waveTop);
      ctx.strokeStyle = rgba(sepColor, 0.015 * entrance);
      ctx.lineWidth = minDim * 0.0006;
      ctx.stroke();

      // Waveform
      const waveColor = lerpColor(
        lerpColor(WAVE_CHAOS, s.primaryRgb, 0.04),
        lerpColor(WAVE_CLEAN, s.accentRgb, 0.08),
        s.coherence,
      );
      const waveAlpha = (0.06 + s.coherence * 0.06) * entrance;

      ctx.beginPath();
      for (let i = 0; i <= WAVE_SAMPLES; i++) {
        const t = i / WAVE_SAMPLES;
        const x = t * w;

        // Sum harmonics (1D slice)
        let y = 0;
        for (const harm of s.harmonics) {
          y += harm.amplitude * Math.sin(
            t * harm.freqMult * Math.PI * 4 + harm.phase + time * harm.freqMult,
          );
        }

        // Normalise
        const normalised = y / HARMONIC_COUNT;
        const py = waveCy + normalised * waveAmp;

        if (i === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.strokeStyle = rgba(waveColor, waveAlpha);
      ctx.lineWidth = minDim * 0.0004;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Waveform glow (when coherent)
      if (s.coherence > 0.5) {
        ctx.strokeStyle = rgba(waveColor, waveAlpha * 0.15);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();
      }

      // Coherence label
      {
        const labelCol = lerpColor(LABEL_COLOR, s.primaryRgb, 0.04);
        const fontSize = Math.round(minDim * 0.014);
        ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = rgba(labelCol, 0.025 * entrance);
        ctx.fillText(`${Math.round(s.coherence * 100)}%`, w - minDim * 0.01, waveTop - minDim * 0.006);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isTouching = true;
      s.lastX = (e.clientX - rect.left) / rect.width * w;
      s.lastY = (e.clientY - rect.top) / rect.height * h;
      s.touchVelocity = 0;
      if (!s.holdStartFired) {
        s.holdStartFired = true;
        cbRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isTouching) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const dx = px - s.lastX;
      const dy = py - s.lastY;
      s.touchVelocity = Math.hypot(dx, dy);
      s.lastX = px;
      s.lastY = py;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isTouching = false;
      s.holdStartFired = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    animId = requestAnimationFrame(render);
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'default',
        }}
      />
    </div>
  );
}