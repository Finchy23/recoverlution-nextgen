/**
 * ATOM 042: THE VAGAL RESONANCE ENGINE (Bio-Acoustic Feedback)
 * =============================================================
 * Series 5 — Chrono-Acoustic · Position 2
 *
 * You cannot simply tell someone to "calm down." You must
 * physically stimulate the vagus nerve. The vagus nerve passes
 * through the vocal cords — humming at the right frequency
 * creates real, measurable biological coherence.
 *
 * The atom presents a TARGET FREQUENCY — a warm, deep reference
 * tone rendered as a slowly pulsing ring at the centre. The
 * user's job: hum. The microphone listens. Pitch detection
 * via autocorrelation determines the user's fundamental
 * frequency in real time.
 *
 * Two concentric rings:
 *   - OUTER ring: the target frequency (136.1 Hz — OM frequency)
 *   - INNER ring: the user's detected pitch, scaled to show
 *     how close they are
 *
 * As the user's hum converges on the target:
 *   - The rings merge toward each other
 *   - Colour shifts from cool searching to warm resonant gold
 *   - A massive, continuous warm haptic begins
 *   - Background particles drift into concentric alignment
 *   - At sustained match (3s): completion — the phone purrs
 *
 * GRACEFUL DEGRADATION:
 *   If microphone is denied: becomes a breath-coupled visual
 *   meditation. The outer ring pulses with breathAmplitude.
 *   The user still experiences the calming visual field.
 *
 * AUDIO ENGINE:
 *   getUserMedia → AnalyserNode → autocorrelation pitch detect
 *   Pitch detection at ~20fps (every 3 frames)
 *   Target: 136.1 Hz (vagal stimulation OM frequency)
 *   Tolerance: ±8 Hz for partial match, ±3 Hz for full lock
 *
 * HAPTIC JOURNEY:
 *   Mic access → entrance_land (we hear you)
 *   Partial match → breath_peak (warming up)
 *   Full sustained lock → completion (the phone purrs)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static rings, no particles, faster convergence
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const TARGET_FREQ = 136.1;        // Hz — vagal OM frequency
const TOLERANCE_PARTIAL = 8;      // Hz — partial resonance
const TOLERANCE_LOCK = 3;         // Hz — full lock
const LOCK_SUSTAIN_FRAMES = 180;  // ~3 seconds of sustained lock
const PARTICLE_COUNT = 60;
const FFT_SIZE = 2048;
/** Pitch detection runs every N frames */
const PITCH_DETECT_INTERVAL = 3;

// =====================================================================
// PITCH DETECTION (autocorrelation)
// =====================================================================

function detectPitch(analyser: AnalyserNode, sampleRate: number, buffer: Float32Array): number {
  analyser.getFloatTimeDomainData(buffer);

  // Check for silence
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return -1;

  // Autocorrelation
  const size = buffer.length;
  const corr = new Float32Array(size);
  for (let lag = 0; lag < size; lag++) {
    let sum = 0;
    for (let i = 0; i < size - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    corr[lag] = sum;
  }

  // Find first dip then first peak after it
  let foundDip = false;
  let bestLag = -1;
  let bestVal = -Infinity;

  // Min lag: sampleRate/500 (~500 Hz max), Max lag: sampleRate/60 (~60 Hz min)
  const minLag = Math.floor(sampleRate / 500);
  const maxLag = Math.min(size - 1, Math.floor(sampleRate / 60));

  for (let lag = minLag; lag < maxLag; lag++) {
    if (!foundDip && corr[lag] < corr[lag - 1]) {
      foundDip = true;
    }
    if (foundDip && corr[lag] > bestVal) {
      bestVal = corr[lag];
      bestLag = lag;
    }
    if (foundDip && corr[lag] < bestVal * 0.8 && bestLag > 0) {
      break; // Past the peak
    }
  }

  if (bestLag < 0 || bestVal < corr[0] * 0.3) return -1;

  return sampleRate / bestLag;
}

// =====================================================================
// PARTICLE
// =====================================================================

interface ResonanceMote {
  angle: number;
  radius: number;
  baseRadius: number;
  speed: number;
  size: number;
  alpha: number;
  phase: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [4, 4, 5];
const TARGET_RING: RGB = [160, 145, 115];     // Warm gold — the reference
const USER_RING_FAR: RGB = [90, 80, 110];     // Cool searching — far from match
const USER_RING_NEAR: RGB = [150, 140, 110];  // Warm approaching
const RESONANCE_GLOW: RGB = [180, 160, 120];  // Locked — deep resonance
const MOTE_COLOR: RGB = [100, 90, 80];
const LABEL_DIM: RGB = [70, 65, 60];

// =====================================================================
// COMPONENT
// =====================================================================

export default function VagalResonanceAtom({
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

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pitchBufferRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stateRef = useRef({
    particles: [] as ResonanceMote[],
    micActive: false,
    micDenied: false,
    detectedPitch: -1,     // Hz, or -1 if silent
    coherence: 0,           // 0 = no match, 1 = perfect lock
    sustainedLockFrames: 0, // How many frames of continuous lock
    resolved: false,
    partialFired: false,
    micFired: false,
    // Animation
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

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      try { audioCtxRef.current?.close(); } catch { /* */ }
    };
  }, []);

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
    const cy = h / 2;

    if (!s.initialized) {
      s.particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const radius = minDim * (0.15 + Math.random() * 0.35);
        return {
          angle: Math.random() * Math.PI * 2,
          radius,
          baseRadius: radius,
          speed: (0.001 + Math.random() * 0.003) * (Math.random() > 0.5 ? 1 : -1),
          size: 0.3 + Math.random() * 1,
          alpha: 0.01 + Math.random() * 0.03,
          phase: Math.random() * Math.PI * 2,
        };
      });
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

      // ── Pitch detection ───────────────────────────────
      if (s.micActive && analyserRef.current && pitchBufferRef.current &&
          s.frameCount % PITCH_DETECT_INTERVAL === 0) {
        const sampleRate = audioCtxRef.current?.sampleRate ?? 44100;
        s.detectedPitch = detectPitch(analyserRef.current, sampleRate, pitchBufferRef.current);
      }

      // ── Coherence calculation ─────────────────────────
      if (s.detectedPitch > 0) {
        const delta = Math.abs(s.detectedPitch - TARGET_FREQ);
        if (delta <= TOLERANCE_LOCK) {
          s.coherence = Math.min(1, s.coherence + 0.03);
          s.sustainedLockFrames++;
        } else if (delta <= TOLERANCE_PARTIAL) {
          const partial = 1 - (delta - TOLERANCE_LOCK) / (TOLERANCE_PARTIAL - TOLERANCE_LOCK);
          s.coherence = Math.min(0.7, s.coherence + 0.01) * partial +
            s.coherence * (1 - partial);
          s.sustainedLockFrames = 0;
        } else {
          s.coherence = Math.max(0, s.coherence - 0.02);
          s.sustainedLockFrames = 0;
        }
      } else if (!s.micActive) {
        // Fallback: breath-coupled mode
        s.coherence = p.breathAmplitude * 0.3;
        s.sustainedLockFrames = 0;
      } else {
        // Silence — decay
        s.coherence = Math.max(0, s.coherence - 0.01);
        s.sustainedLockFrames = 0;
      }

      // Partial match haptic
      if (s.coherence > 0.4 && !s.partialFired) {
        s.partialFired = true;
        cb.onHaptic('breath_peak');
      }
      if (s.coherence < 0.3) s.partialFired = false;

      // Full sustained lock
      if (s.sustainedLockFrames >= LOCK_SUSTAIN_FRAMES && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.coherence);

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ═════════════════════════════════════════════════

      const bgColor = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Resonance glow
      if (s.coherence > 0.2) {
        const resAlpha = (s.coherence - 0.2) * 0.025 * entrance;
        const resColor = lerpColor(RESONANCE_GLOW, s.accentRgb, 0.1);
        const resR = minDim * (0.3 + s.coherence * 0.15);
        const resGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, resR);
        resGrad.addColorStop(0, rgba(resColor, resAlpha));
        resGrad.addColorStop(0.4, rgba(resColor, resAlpha * 0.3));
        resGrad.addColorStop(1, rgba(resColor, 0));
        ctx.fillStyle = resGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ══════════════════════════════════════════════════
      // PARTICLES (drift toward concentricity with coherence)
      // ══════════════════════════════════════════════════

      const targetOrbitR = minDim * 0.18;
      for (const mote of s.particles) {
        if (!p.reducedMotion) {
          mote.angle += mote.speed;
          // Pull radius toward target orbit as coherence increases
          const targetR = mote.baseRadius + (targetOrbitR - mote.baseRadius) * s.coherence * 0.6;
          mote.radius += (targetR - mote.radius) * 0.01;
        }

        const mx = cx + Math.cos(mote.angle) * mote.radius;
        const my = cy + Math.sin(mote.angle) * mote.radius;

        const shimmer = p.reducedMotion ? 0.6 :
          0.4 + 0.6 * Math.sin(s.frameCount * 0.02 + mote.phase);
        const mColor = lerpColor(MOTE_COLOR, s.primaryRgb, 0.05);
        const mAlpha = mote.alpha * shimmer * entrance * (0.7 + s.coherence * 0.3);

        ctx.beginPath();
        ctx.arc(mx, my, mote.size * minDim * 0.001, 0, Math.PI * 2);
        ctx.fillStyle = rgba(mColor, mAlpha);
        ctx.fill();
      }

      // ══════════════════════════════════════════════════
      // TARGET RING (outer — the reference frequency)
      // ══════════════════════════════════════════════════

      const targetR = minDim * 0.2;
      const targetPulse = p.reducedMotion ? 1 :
        1 + Math.sin(s.frameCount * 0.008) * 0.02 * (1 + p.breathAmplitude * 0.3);
      const targetDrawR = targetR * targetPulse;
      const tRingColor = lerpColor(TARGET_RING, s.accentRgb, 0.08);
      const tRingAlpha = (0.06 + s.coherence * 0.04) * entrance;

      ctx.beginPath();
      ctx.arc(cx, cy, targetDrawR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(tRingColor, tRingAlpha);
      ctx.lineWidth = minDim * (0.0016 + s.coherence * 0.001);
      ctx.stroke();

      // Target ring glow
      const tGlowR = targetDrawR * 1.3;
      const tGlowGrad = ctx.createRadialGradient(
        cx, cy, targetDrawR * 0.9, cx, cy, tGlowR,
      );
      tGlowGrad.addColorStop(0, rgba(tRingColor, tRingAlpha * 0.15));
      tGlowGrad.addColorStop(1, rgba(tRingColor, 0));
      ctx.fillStyle = tGlowGrad;
      ctx.fillRect(cx - tGlowR, cy - tGlowR, tGlowR * 2, tGlowR * 2);

      // ══════════════════════════════════════════════════
      // USER RING (inner — the detected pitch)
      // ══════════════════════════════════════════════════

      // User ring radius: maps pitch distance to visual distance
      let userR: number;
      if (s.detectedPitch > 0) {
        const pitchDelta = Math.abs(s.detectedPitch - TARGET_FREQ);
        const normalizedDelta = Math.min(1, pitchDelta / 50);
        userR = targetR * (0.4 + normalizedDelta * 0.4);
      } else {
        // No pitch: ring at inner position
        userR = targetR * (s.micActive ? 0.5 : 0.6 + p.breathAmplitude * 0.15);
      }

      // Converge toward target ring as coherence increases
      userR = userR + (targetDrawR - userR) * s.coherence * 0.8;

      const uRingColor = lerpColor(
        lerpColor(USER_RING_FAR, s.primaryRgb, 0.05),
        lerpColor(USER_RING_NEAR, s.accentRgb, 0.08),
        s.coherence,
      );
      const uRingAlpha = (s.micActive || !s.micDenied ? 0.06 : 0.03) * entrance;

      ctx.beginPath();
      ctx.arc(cx, cy, userR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(uRingColor, uRingAlpha + s.coherence * 0.04);
      ctx.lineWidth = minDim * (0.0012 + s.coherence * 0.0016);
      ctx.stroke();

      // ══════════════════════════════════════════════════
      // CENTER DOT (the convergence point)
      // ══════════════════════════════════════════════════

      if (s.coherence > 0.3) {
        const dotR = minDim * 0.003 + s.coherence * minDim * 0.005;
        const dotColor = lerpColor(RESONANCE_GLOW, s.accentRgb, 0.06);
        const dotAlpha = s.coherence * 0.15 * entrance;

        ctx.beginPath();
        ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dotColor, dotAlpha);
        ctx.fill();
      }

      // ══════════════════════════════════════════════════
      // LABELS
      // ══════════════════════════════════════════════════

      const labelColor = lerpColor(LABEL_DIM, s.primaryRgb, 0.04);
      const fontSize = Math.round(minDim * 0.015);
      ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';

      // Target label
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = rgba(labelColor, 0.03 * entrance);
      ctx.fillText(`${TARGET_FREQ} Hz`, cx, cy - targetDrawR - minDim * 0.01);

      // User pitch label
      if (s.detectedPitch > 0) {
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgba(labelColor, 0.03 * entrance);
        ctx.fillText(`${s.detectedPitch.toFixed(0)} Hz`, cx, cy + userR + minDim * 0.01);
      }

      // Mic prompt (if not yet active)
      if (!s.micActive && !s.micDenied && s.frameCount > 60) {
        const promptAlpha = Math.min(0.04, (s.frameCount - 60) * 0.0003) * entrance;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(labelColor, promptAlpha);
        ctx.fillText('tap to begin', cx, cy + minDim * 0.32);
      }

      // Breath mode label (if mic denied)
      if (s.micDenied) {
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(labelColor, 0.025 * entrance);
        ctx.fillText('breathe', cx, cy + minDim * 0.32);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    // ── Mic helper (inline) ─────────────────────────────
    const requestMic = async () => {
      const s = stateRef.current;
      if (s.micActive || s.micDenied) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const actx = new AudioContext();
        audioCtxRef.current = actx;
        const source = actx.createMediaStreamSource(stream);
        const analyser = actx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        source.connect(analyser);
        analyserRef.current = analyser;
        pitchBufferRef.current = new Float32Array(analyser.fftSize);
        s.micActive = true;
        if (!s.micFired) {
          s.micFired = true;
          cbRef.current.onHaptic('entrance_land');
        }
      } catch {
        s.micDenied = true;
      }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      requestMic();
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    animId = requestAnimationFrame(render);
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