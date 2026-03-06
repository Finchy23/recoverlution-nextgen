/**
 * ATOM 045: THE AUDIO ZOOM ENGINE (Acoustic Isolation)
 * =====================================================
 * Series 5 — Chrono-Acoustic · Position 5
 *
 * In a state of overwhelm, everything feels equally loud.
 * Every criticism, every obligation, every fear — all at the
 * same volume, all at once. But there is always ONE true
 * signal hidden inside that wall of noise. This atom lets
 * the user surgically isolate it.
 *
 * The canvas renders a dense, chaotic multi-band frequency
 * spectrum — 24 overlapping frequency bands jittering,
 * pulsing, fighting for attention. Pure visual overwhelm.
 * Hidden inside: a single clean frequency band (the "bell
 * chime" — 528 Hz, the Solfeggio frequency of transformation).
 *
 * The user drags vertically to position a FOCUS WINDOW —
 * a horizontal band that highlights a narrow range of the
 * spectrum. As the window narrows (pinch or hold to focus),
 * bands outside the window fade and quiet. The window acts
 * as a visual bandpass filter.
 *
 * When the window centres on the hidden signal:
 *   - The noise bands dissolve entirely
 *   - The signal band brightens, smooths, becomes luminous
 *   - A pure bell chime tone emerges from the noise
 *   - The screen becomes spacious, clear, resolved
 *
 * AUDIO ENGINE:
 *   White noise source → BiquadFilterNode (bandpass)
 *   User controls centre frequency (drag Y) and Q (hold duration)
 *   Bell chime: OscillatorNode at 528 Hz, gated by proximity
 *   Graceful: visual-only if AudioContext unavailable
 *
 * HAPTIC JOURNEY:
 *   Drag → drag_snap (scanning through noise)
 *   Window approaches signal → step_advance (warming)
 *   Signal isolated → completion (clarity achieved)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static bands, no jitter, faster isolation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const BAND_COUNT = 24;
/** The hidden signal band index */
const SIGNAL_BAND = 12; // ~middle-high
/** Signal frequency in Hz */
const SIGNAL_FREQ = 528;
/** Focus window: initial width as fraction of total spectrum */
const INITIAL_WINDOW_FRAC = 0.5;
/** Window narrows per frame while holding */
const FOCUS_RATE = 0.001;
/** Minimum window width */
const MIN_WINDOW = 0.04;
/** Audio gain */
const NOISE_GAIN = 0.03;
const CHIME_GAIN = 0.06;

// =====================================================================
// BAND DATA
// =====================================================================

interface FreqBand {
  /** Normalised position (0–1) in the spectrum */
  position: number;
  /** Current visual amplitude */
  amplitude: number;
  /** Base amplitude (fixed) */
  baseAmplitude: number;
  /** Jitter speed */
  jitterSpeed: number;
  /** Phase */
  phase: number;
  /** Is this the hidden signal? */
  isSignal: boolean;
  /** Current visibility (0 = filtered out, 1 = visible) */
  visibility: number;
}

function createBands(): FreqBand[] {
  return Array.from({ length: BAND_COUNT }, (_, i) => ({
    position: (i + 0.5) / BAND_COUNT,
    amplitude: 0.3 + Math.random() * 0.7,
    baseAmplitude: 0.3 + Math.random() * 0.7,
    jitterSpeed: 0.02 + Math.random() * 0.06,
    phase: Math.random() * Math.PI * 2,
    isSignal: i === SIGNAL_BAND,
    visibility: 1,
  }));
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [4, 4, 5];
const NOISE_BAND: RGB = [90, 65, 70];          // Chaotic noise — anxious hue
const NOISE_BAND_HOT: RGB = [120, 75, 70];     // Brighter noise
const SIGNAL_COLOR: RGB = [180, 170, 130];     // The bell chime — golden
const SIGNAL_GLOW: RGB = [200, 185, 140];      // Signal glow at isolation
const WINDOW_EDGE: RGB = [110, 105, 90];       // Focus window boundary
const WINDOW_FILL: RGB = [60, 55, 50];         // Focus window interior
const LABEL_COLOR: RGB = [65, 60, 55];

// =====================================================================
// COMPONENT
// =====================================================================

export default function AudioZoomAtom({
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
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const chimeOscRef = useRef<OscillatorNode | null>(null);
  const chimeGainRef = useRef<GainNode | null>(null);

  const stateRef = useRef({
    bands: [] as FreqBand[],
    // Focus window
    windowCenter: 0.5,     // Normalised Y position (0 = top, 1 = bottom)
    windowWidth: INITIAL_WINDOW_FRAC,
    isDragging: false,
    isHolding: false,
    holdFrames: 0,
    lastSnapBand: -1,
    // Isolation state
    signalProximity: 0,    // 0 = far, 1 = centred on signal
    isolated: false,
    nearFired: false,
    resolved: false,
    audioStarted: false,
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

  useEffect(() => {
    return () => {
      try {
        noiseSourceRef.current?.stop();
        chimeOscRef.current?.stop();
        audioCtxRef.current?.close();
      } catch { /* */ }
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

    // ── Audio helper (inline) ───────────────────────────
    const ensureAudio = () => {
      const s = stateRef.current;
      if (s.audioStarted) return;
      try {
        const actx = new AudioContext();
        audioCtxRef.current = actx;
        const bufferSize = actx.sampleRate * 2;
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const source = actx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        noiseSourceRef.current = source;
        const filter = actx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        filterRef.current = filter;
        const noiseGain = actx.createGain();
        noiseGain.gain.value = NOISE_GAIN;
        noiseGainRef.current = noiseGain;
        source.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(actx.destination);
        source.start();
        const chimeOsc = actx.createOscillator();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.value = SIGNAL_FREQ;
        chimeOscRef.current = chimeOsc;
        const chimeGain = actx.createGain();
        chimeGain.gain.value = 0;
        chimeGainRef.current = chimeGain;
        chimeOsc.connect(chimeGain);
        chimeGain.connect(actx.destination);
        chimeOsc.start();
        s.audioStarted = true;
      } catch { /* no audio */ }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isDragging = true;
      s.isHolding = true;
      s.holdFrames = 0;
      s.windowCenter = (e.clientY - rect.top) / rect.height;
      ensureAudio();
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isDragging) return;
      s.windowCenter = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = false;
      s.isHolding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.bands = createBands();
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

      // ── Focus window dynamics ─────────────────────────
      if (s.isHolding) {
        s.holdFrames++;
        // Window narrows while holding
        const narrowRate = p.reducedMotion ? FOCUS_RATE * 3 : FOCUS_RATE;
        s.windowWidth = Math.max(MIN_WINDOW,
          s.windowWidth - narrowRate * (1 + s.holdFrames * 0.001));
      } else {
        // Window slowly widens when released
        s.windowWidth = Math.min(INITIAL_WINDOW_FRAC,
          s.windowWidth + 0.0005);
      }

      const winTop = s.windowCenter - s.windowWidth / 2;
      const winBot = s.windowCenter + s.windowWidth / 2;

      // ── Signal proximity ──────────────────────────────
      const signalPos = s.bands[SIGNAL_BAND].position;
      const distToSignal = Math.abs(s.windowCenter - signalPos);
      const signalInWindow = signalPos >= winTop && signalPos <= winBot;
      s.signalProximity = signalInWindow
        ? Math.min(1, (1 - distToSignal / (s.windowWidth * 0.5 + 0.001)) * (1 / Math.max(0.05, s.windowWidth)))
        : 0;
      s.signalProximity = Math.max(0, Math.min(1, s.signalProximity));

      // Update band visibility
      for (const band of s.bands) {
        const inWindow = band.position >= winTop && band.position <= winBot;
        const targetVis = inWindow ? 1 : 0.05;
        band.visibility += (targetVis - band.visibility) * 0.08;
        band.visibility = Math.max(0, Math.min(1, band.visibility));
      }

      // Drag snap haptic
      const currentBand = Math.floor(s.windowCenter * BAND_COUNT);
      if (currentBand !== s.lastSnapBand && s.isDragging) {
        s.lastSnapBand = currentBand;
        cb.onHaptic('drag_snap');
      }

      // Near signal
      if (s.signalProximity > 0.5 && !s.nearFired) {
        s.nearFired = true;
        cb.onHaptic('step_advance');
      }
      if (s.signalProximity < 0.3) s.nearFired = false;

      // Isolated
      if (s.signalProximity > 0.85 && s.windowWidth < 0.08 && !s.resolved) {
        s.resolved = true;
        s.isolated = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      // Update audio
      if (filterRef.current) {
        // Map window center to frequency (200–8000 Hz log scale)
        const freq = 200 * Math.pow(40, s.windowCenter);
        filterRef.current.frequency.value = freq;
        filterRef.current.Q.value = 1 + (1 / Math.max(0.05, s.windowWidth)) * 0.5;
      }
      if (noiseGainRef.current) {
        noiseGainRef.current.gain.value = NOISE_GAIN * (1 - s.signalProximity * 0.8);
      }
      if (chimeGainRef.current) {
        chimeGainRef.current.gain.value = CHIME_GAIN * Math.pow(s.signalProximity, 2);
      }

      cb.onStateChange?.(s.signalProximity);

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

      // Signal glow (when approaching isolation)
      if (s.signalProximity > 0.3) {
        const sGlowAlpha = (s.signalProximity - 0.3) * 0.02 * entrance;
        const sGlowColor = lerpColor(SIGNAL_GLOW, s.accentRgb, 0.1);
        const sigY = signalPos * h;
        const sGlowR = minDim * 0.3;
        const sGlowGrad = ctx.createRadialGradient(w / 2, sigY, 0, w / 2, sigY, sGlowR);
        sGlowGrad.addColorStop(0, rgba(sGlowColor, sGlowAlpha));
        sGlowGrad.addColorStop(0.5, rgba(sGlowColor, sGlowAlpha * 0.2));
        sGlowGrad.addColorStop(1, rgba(sGlowColor, 0));
        ctx.fillStyle = sGlowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ══════════════════════════════════════════════════
      // FREQUENCY BANDS
      // ══════════════════════════════════════════════════

      const bandH = h / BAND_COUNT;

      for (const band of s.bands) {
        const by = band.position * h;
        const jitter = p.reducedMotion ? 0 :
          Math.sin(s.frameCount * band.jitterSpeed + band.phase) * 0.3;
        const amp = (band.baseAmplitude + jitter) * band.visibility;

        if (amp < 0.01) continue;

        const bandWidth = w * amp * 0.6;
        const bx = (w - bandWidth) / 2;

        if (band.isSignal) {
          // Signal band — golden, clean, luminous
          const sigColor = lerpColor(SIGNAL_COLOR, s.accentRgb, 0.08);
          const sigAlpha = (0.04 + s.signalProximity * 0.12) * band.visibility * entrance;

          // Clean sine-shaped band
          ctx.beginPath();
          for (let i = 0; i <= 60; i++) {
            const t = i / 60;
            const x = bx + t * bandWidth;
            const envelope = Math.sin(t * Math.PI);
            const py = by + envelope * bandH * 0.3 * (p.reducedMotion ? 0.5 :
              (0.5 + 0.5 * Math.sin(s.frameCount * 0.01)));
            if (i === 0) ctx.moveTo(x, by - py + bandH * 0.15);
            else ctx.lineTo(x, by - py + bandH * 0.15);
          }
          ctx.strokeStyle = rgba(sigColor, sigAlpha);
          ctx.lineWidth = minDim * (0.002 + s.signalProximity * 0.004);
          ctx.lineCap = 'round';
          ctx.stroke();

          // Signal glow line
          if (s.signalProximity > 0.2) {
            ctx.strokeStyle = rgba(sigColor, sigAlpha * 0.2);
            ctx.lineWidth = minDim * (0.008 + s.signalProximity * 0.012);
            ctx.stroke();
          }
        } else {
          // Noise bands — chaotic, angular, harsh
          const noiseT = band.baseAmplitude;
          const noiseColor = lerpColor(
            lerpColor(NOISE_BAND, s.primaryRgb, 0.05),
            lerpColor(NOISE_BAND_HOT, s.primaryRgb, 0.06),
            noiseT,
          );
          const noiseAlpha = (0.03 + noiseT * 0.04) * band.visibility * entrance;
          // Reduce noise alpha as signal isolates
          const isolationFade = 1 - s.signalProximity * 0.7;

          // Jagged waveform per band
          ctx.beginPath();
          const segments = 40;
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = bx + t * bandWidth;
            const jagged = p.reducedMotion ? 0 :
              (Math.sin(t * 17 + s.frameCount * band.jitterSpeed * 3 + band.phase) * 0.5 +
               Math.sin(t * 31 + s.frameCount * band.jitterSpeed * 1.7) * 0.3) *
              bandH * 0.2 * (1 - s.signalProximity * 0.5);
            const py = by + jagged;
            if (i === 0) ctx.moveTo(x, py);
            else ctx.lineTo(x, py);
          }
          ctx.strokeStyle = rgba(noiseColor, noiseAlpha * isolationFade);
          ctx.lineWidth = minDim * (0.0008 + noiseT * 0.0008);
          ctx.stroke();
        }
      }

      // ══════════════════════════════════════════════════
      // FOCUS WINDOW
      // ══════════════════════════════════════════════════

      if (!s.isolated) {
        const fwTop = winTop * h;
        const fwBot = winBot * h;
        const fwH = fwBot - fwTop;

        // Window fill (very subtle highlight)
        const winFillColor = lerpColor(WINDOW_FILL, s.primaryRgb, 0.03);
        ctx.fillStyle = rgba(winFillColor, 0.015 * entrance);
        ctx.fillRect(0, fwTop, w, fwH);

        // Window edges
        const winEdgeColor = lerpColor(WINDOW_EDGE, s.accentRgb, 0.06);
        const edgeAlpha = (0.04 + (s.isDragging ? 0.03 : 0)) * entrance;

        ctx.beginPath();
        ctx.moveTo(0, fwTop);
        ctx.lineTo(w, fwTop);
        ctx.strokeStyle = rgba(winEdgeColor, edgeAlpha);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, fwBot);
        ctx.lineTo(w, fwBot);
        ctx.strokeStyle = rgba(winEdgeColor, edgeAlpha);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();

        // Window brackets (left/right)
        const bracketW = minDim * 0.012;
        const bracketAlpha = edgeAlpha * 0.8;
        // Left
        ctx.beginPath();
        ctx.moveTo(bracketW, fwTop);
        ctx.lineTo(0, fwTop);
        ctx.lineTo(0, fwBot);
        ctx.lineTo(bracketW, fwBot);
        ctx.strokeStyle = rgba(winEdgeColor, bracketAlpha);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
        // Right
        ctx.beginPath();
        ctx.moveTo(w - bracketW, fwTop);
        ctx.lineTo(w, fwTop);
        ctx.lineTo(w, fwBot);
        ctx.lineTo(w - bracketW, fwBot);
        ctx.stroke();

        // Dim zones outside window
        const dimAlpha = 0.3 * (1 - s.windowWidth / INITIAL_WINDOW_FRAC) * entrance;
        if (dimAlpha > 0.005) {
          ctx.fillStyle = rgba(bgColor, dimAlpha);
          if (fwTop > 0) ctx.fillRect(0, 0, w, fwTop);
          if (fwBot < h) ctx.fillRect(0, fwBot, w, h - fwBot);
        }

        // Focus label
        if (s.isDragging || s.holdFrames > 0) {
          const labelCol = lerpColor(LABEL_COLOR, s.primaryRgb, 0.04);
          const fontSize = Math.round(minDim * 0.013);
          ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = rgba(labelCol, 0.025 * entrance);
          ctx.fillText('FOCUS', w / 2, fwTop - minDim * 0.005);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

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
          cursor: 'ns-resize',
        }}
      />
    </div>
  );
}