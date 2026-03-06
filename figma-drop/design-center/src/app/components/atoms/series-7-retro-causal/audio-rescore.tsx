/**
 * ATOM 061: THE AUDIO RESCORE ENGINE
 * ====================================
 * Series 7 — Retro-Causal · Position 1
 *
 * A memory feels tragic because the ego plays a tragic soundtrack.
 * Change the music, change the neurochemistry. The user physically
 * scrubs a mixing fader to crossfade from a minor-key tragic drone
 * into a bright, rising, major-key ambient swell.
 *
 * PHYSICS:
 *   - Two Web Audio oscillator banks: tragic (low drone) + rising (bright pad)
 *   - GainNode crossfade controlled by vertical fader position
 *   - Waveform visualisation via AnalyserNode frequency data
 *   - Fader: draggable vertical track with snap detents at 10% increments
 *   - Visual: mirrored waveform bars — bottom (tragic, red) / top (bright, gold)
 *
 * AUDIO GRACEFUL DEGRADATION:
 *   If Web Audio is unavailable, render static waveform shapes that morph
 *   from compressed/jagged to smooth/expansive as the fader moves.
 *
 * INTERACTION:
 *   Drag (vertical) → controls crossfade position
 *
 * RENDER: Canvas 2D (requestAnimationFrame) + Web Audio API
 * REDUCED MOTION: Static mid-level bars, fader still draggable
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const TRAGIC_COLOR: RGB = [180, 60, 70];    // deep minor-key red
const RISING_COLOR: RGB = [220, 190, 90];   // bright major-key gold
const FADER_TRACK: RGB = [80, 75, 90];      // neutral track
const FADER_KNOB: RGB = [200, 195, 210];    // bright knob
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const BAR_COUNT = 48;
const FADER_WIDTH_RATIO = 0.015;
const FADER_HEIGHT_RATIO = 0.55;
const KNOB_WIDTH_RATIO = 0.06;
const KNOB_HEIGHT_RATIO = 0.025;
const SNAP_DETENTS = 11; // 0%, 10%, 20% ... 100%
const DRAG_THRESHOLD = 3;

// =====================================================================
// AUDIO ENGINE
// =====================================================================

interface AudioEngine {
  ctx: AudioContext;
  tragicGain: GainNode;
  risingGain: GainNode;
  analyserTragic: AnalyserNode;
  analyserRising: AnalyserNode;
  started: boolean;
}

function createAudioEngine(): AudioEngine | null {
  try {
    const ctx = new AudioContext();

    // Tragic drone: low, dissonant minor 2nd cluster
    const tragicOsc1 = ctx.createOscillator();
    tragicOsc1.type = 'sawtooth';
    tragicOsc1.frequency.value = 73.42; // D2
    const tragicOsc2 = ctx.createOscillator();
    tragicOsc2.type = 'sawtooth';
    tragicOsc2.frequency.value = 77.78; // D#2 (minor 2nd dissonance)

    const tragicGain = ctx.createGain();
    tragicGain.gain.value = 0.06;
    const tragicFilter = ctx.createBiquadFilter();
    tragicFilter.type = 'lowpass';
    tragicFilter.frequency.value = 400;

    const analyserTragic = ctx.createAnalyser();
    analyserTragic.fftSize = 128;

    tragicOsc1.connect(tragicFilter);
    tragicOsc2.connect(tragicFilter);
    tragicFilter.connect(tragicGain);
    tragicGain.connect(analyserTragic);
    analyserTragic.connect(ctx.destination);

    // Rising pad: bright, consonant major 9th stack
    const risingOsc1 = ctx.createOscillator();
    risingOsc1.type = 'sine';
    risingOsc1.frequency.value = 293.66; // D4
    const risingOsc2 = ctx.createOscillator();
    risingOsc2.type = 'sine';
    risingOsc2.frequency.value = 369.99; // F#4
    const risingOsc3 = ctx.createOscillator();
    risingOsc3.type = 'sine';
    risingOsc3.frequency.value = 440.0;  // A4
    const risingOsc4 = ctx.createOscillator();
    risingOsc4.type = 'triangle';
    risingOsc4.frequency.value = 329.63; // E4 (add9)

    const risingGain = ctx.createGain();
    risingGain.gain.value = 0.0;
    const risingFilter = ctx.createBiquadFilter();
    risingFilter.type = 'lowpass';
    risingFilter.frequency.value = 2000;

    const analyserRising = ctx.createAnalyser();
    analyserRising.fftSize = 128;

    risingOsc1.connect(risingFilter);
    risingOsc2.connect(risingFilter);
    risingOsc3.connect(risingFilter);
    risingOsc4.connect(risingFilter);
    risingFilter.connect(risingGain);
    risingGain.connect(analyserRising);
    analyserRising.connect(ctx.destination);

    return {
      ctx,
      tragicGain,
      risingGain,
      analyserTragic,
      analyserRising,
      started: false,
    };
  } catch {
    return null;
  }
}

function startAudioEngine(engine: AudioEngine) {
  if (engine.started) return;
  engine.started = true;
  if (engine.ctx.state === 'suspended') {
    engine.ctx.resume();
  }
  // Start all oscillators
  const now = engine.ctx.currentTime;
  engine.tragicGain.gain.setValueAtTime(0.06, now);
  engine.risingGain.gain.setValueAtTime(0.0, now);

  // The oscillators are connected but we need to start them via the nodes
  // We stored them in the chain — re-traverse isn't possible, so we start fresh
  // Actually we need references. Let's use a different approach:
  // Create and start oscillators now
  const tragicOsc1 = engine.ctx.createOscillator();
  tragicOsc1.type = 'sawtooth';
  tragicOsc1.frequency.value = 73.42;
  const tragicOsc2 = engine.ctx.createOscillator();
  tragicOsc2.type = 'sawtooth';
  tragicOsc2.frequency.value = 77.78;

  const tragicFilter = engine.ctx.createBiquadFilter();
  tragicFilter.type = 'lowpass';
  tragicFilter.frequency.value = 400;

  // Disconnect old chain and reconnect
  engine.tragicGain.disconnect();
  engine.analyserTragic.disconnect();

  tragicOsc1.connect(tragicFilter);
  tragicOsc2.connect(tragicFilter);
  tragicFilter.connect(engine.tragicGain);
  engine.tragicGain.connect(engine.analyserTragic);
  engine.analyserTragic.connect(engine.ctx.destination);

  tragicOsc1.start(now);
  tragicOsc2.start(now);

  const risingOsc1 = engine.ctx.createOscillator();
  risingOsc1.type = 'sine';
  risingOsc1.frequency.value = 293.66;
  const risingOsc2 = engine.ctx.createOscillator();
  risingOsc2.type = 'sine';
  risingOsc2.frequency.value = 369.99;
  const risingOsc3 = engine.ctx.createOscillator();
  risingOsc3.type = 'sine';
  risingOsc3.frequency.value = 440.0;
  const risingOsc4 = engine.ctx.createOscillator();
  risingOsc4.type = 'triangle';
  risingOsc4.frequency.value = 329.63;

  const risingFilter = engine.ctx.createBiquadFilter();
  risingFilter.type = 'lowpass';
  risingFilter.frequency.value = 2000;

  engine.risingGain.disconnect();
  engine.analyserRising.disconnect();

  risingOsc1.connect(risingFilter);
  risingOsc2.connect(risingFilter);
  risingOsc3.connect(risingFilter);
  risingOsc4.connect(risingFilter);
  risingFilter.connect(engine.risingGain);
  engine.risingGain.connect(engine.analyserRising);
  engine.analyserRising.connect(engine.ctx.destination);

  risingOsc1.start(now);
  risingOsc2.start(now);
  risingOsc3.start(now);
  risingOsc4.start(now);
}

function setCrossfade(engine: AudioEngine, t: number) {
  // t: 0 = full tragic, 1 = full rising
  const now = engine.ctx.currentTime;
  const tragicVol = 0.06 * (1 - t);
  const risingVol = 0.05 * t;
  engine.tragicGain.gain.setTargetAtTime(tragicVol, now, 0.05);
  engine.risingGain.gain.setTargetAtTime(risingVol, now, 0.05);
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function AudioRescoreAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioEngine | null>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    faderT: 0, // 0 = tragic, 1 = rising
    targetFaderT: 0,
    isDragging: false,
    dragStartY: 0,
    dragStartT: 0,
    lastDetent: -1,
    resolved: false,
    frame: 0,
    // Synthetic waveform data for when audio is unavailable
    syntheticBars: new Float32Array(BAR_COUNT),
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Audio lifecycle ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        try { audioRef.current.ctx.close(); } catch { /* */ }
        audioRef.current = null;
      }
    };
  }, []);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      if (!audioRef.current) {
        audioRef.current = createAudioEngine();
      }
      if (audioRef.current && !audioRef.current.started) {
        startAudioEngine(audioRef.current);
      }
      const s = stateRef.current;
      s.isDragging = true;
      s.dragStartY = e.clientY;
      s.dragStartT = s.faderT;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const faderHeight = h * FADER_HEIGHT_RATIO;
      const deltaY = s.dragStartY - e.clientY;
      const deltaT = deltaY / faderHeight;
      const newT = Math.max(0, Math.min(1, s.dragStartT + deltaT));
      s.targetFaderT = newT;
      const detent = Math.round(newT * (SNAP_DETENTS - 1));
      if (detent !== s.lastDetent) {
        s.lastDetent = detent;
        onHaptic('drag_snap');
      }
      if (newT > 0.25 && s.faderT <= 0.25) onHaptic('step_advance');
      if (newT > 0.5 && s.faderT <= 0.5) onHaptic('step_advance');
      if (newT > 0.75 && s.faderT <= 0.75) onHaptic('step_advance');
      if (audioRef.current?.started) {
        setCrossfade(audioRef.current, newT);
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isDragging = false;
      if (s.targetFaderT > 0.95 && !s.resolved) {
        s.resolved = true;
        onHaptic('completion');
        onResolve?.();
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      // Entrance
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Fader smoothing
      const faderLerp = p.reducedMotion ? 0.5 : 0.08;
      s.faderT += (s.targetFaderT - s.faderT) * faderLerp;

      // Report state
      onStateChange?.(s.faderT);

      // Colors
      const primaryRgb = parseColor(p.color);
      const accentRgb = parseColor(p.accentColor);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);
      const tragicCol = lerpColor(TRAGIC_COLOR, primaryRgb, 0.06);
      const risingCol = lerpColor(RISING_COLOR, primaryRgb, 0.04);
      const trackCol = lerpColor(FADER_TRACK, primaryRgb, 0.05);
      const knobCol = lerpColor(FADER_KNOB, accentRgb, 0.08);

      // Canvas setup
      const { cx, cy } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Waveform bars ──────────────────────────────────
      const barW = minDim * 0.006;
      const barGap = minDim * 0.004;
      const barAreaW = BAR_COUNT * (barW + barGap);
      const barStartX = cx - barAreaW / 2 - minDim * 0.06;
      const barMaxH = h * 0.25;

      // Get frequency data or generate synthetic
      const tragicData = new Uint8Array(BAR_COUNT);
      const risingData = new Uint8Array(BAR_COUNT);

      if (audioRef.current?.started) {
        const tBuf = new Uint8Array(audioRef.current.analyserTragic.frequencyBinCount);
        audioRef.current.analyserTragic.getByteFrequencyData(tBuf);
        const rBuf = new Uint8Array(audioRef.current.analyserRising.frequencyBinCount);
        audioRef.current.analyserRising.getByteFrequencyData(rBuf);
        // Map to bar count
        for (let i = 0; i < BAR_COUNT; i++) {
          const idx = Math.floor((i / BAR_COUNT) * tBuf.length);
          tragicData[i] = tBuf[idx];
          risingData[i] = rBuf[idx];
        }
      } else {
        // Synthetic waveform
        for (let i = 0; i < BAR_COUNT; i++) {
          const t = i / BAR_COUNT;
          const frame = p.reducedMotion ? 0 : s.frame;
          // Tragic: low, compressed, heavy
          const tragicBase = 0.3 + 0.2 * Math.sin(t * 3 + frame * 0.02);
          const tragicNoise = 0.1 * Math.sin(t * 7 + frame * 0.05);
          tragicData[i] = Math.round((tragicBase + tragicNoise) * 255 * (1 - s.faderT));

          // Rising: high, expansive, bright
          const risingBase = 0.2 + 0.4 * Math.sin(t * 2 + frame * 0.03);
          const risingHarmonics = 0.15 * Math.sin(t * 5 + frame * 0.04);
          risingData[i] = Math.round((risingBase + risingHarmonics) * 255 * s.faderT);
        }
      }

      // Draw tragic bars (below center, pointing down)
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = barStartX + i * (barW + barGap);
        const amplitude = (tragicData[i] / 255) * barMaxH * ent;
        const alpha = ELEMENT_ALPHA.primary.min +
          (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min) * (1 - s.faderT) * ent;
        ctx.fillStyle = rgba(tragicCol, alpha);
        ctx.fillRect(x, cy + minDim * 0.008, barW, amplitude);
      }

      // Draw rising bars (above center, pointing up)
      for (let i = 0; i < BAR_COUNT; i++) {
        const x = barStartX + i * (barW + barGap);
        const amplitude = (risingData[i] / 255) * barMaxH * ent;
        const alpha = ELEMENT_ALPHA.primary.min +
          (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min) * s.faderT * ent;
        ctx.fillStyle = rgba(risingCol, alpha);
        ctx.fillRect(x, cy - minDim * 0.008 - amplitude, barW, amplitude);
      }

      // ── Center divider line ────────────────────────────
      ctx.strokeStyle = rgba(trackCol, ELEMENT_ALPHA.tertiary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.moveTo(barStartX - minDim * 0.008, cy);
      ctx.lineTo(barStartX + barAreaW + minDim * 0.008, cy);
      ctx.stroke();

      // ── Fader track ────────────────────────────────────
      const faderX = cx + barAreaW / 2 + minDim * 0.06;
      const faderH = h * FADER_HEIGHT_RATIO;
      const faderY = cy - faderH / 2;
      const faderW = minDim * FADER_WIDTH_RATIO;

      // Track background
      ctx.fillStyle = rgba(trackCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.beginPath();
      ctx.roundRect(faderX - faderW / 2, faderY, faderW, faderH, faderW / 2);
      ctx.fill();

      // Track gradient (tragic bottom → rising top)
      const trackGrad = ctx.createLinearGradient(0, faderY + faderH, 0, faderY);
      trackGrad.addColorStop(0, rgba(tragicCol, ELEMENT_ALPHA.secondary.min * ent));
      trackGrad.addColorStop(1, rgba(risingCol, ELEMENT_ALPHA.secondary.min * ent));
      ctx.fillStyle = trackGrad;
      ctx.beginPath();
      ctx.roundRect(faderX - faderW / 2, faderY, faderW, faderH, faderW / 2);
      ctx.fill();

      // Detent marks
      for (let d = 0; d < SNAP_DETENTS; d++) {
        const dt = d / (SNAP_DETENTS - 1);
        const dy = faderY + faderH * (1 - dt);
        ctx.fillStyle = rgba(knobCol, ELEMENT_ALPHA.tertiary.min * ent);
        const markH = minDim * 0.001;
        ctx.fillRect(faderX - faderW, dy - markH / 2, faderW * 0.5, markH);
      }

      // Knob
      const knobY = faderY + faderH * (1 - s.faderT);
      const knobW = minDim * KNOB_WIDTH_RATIO;
      const knobH = minDim * KNOB_HEIGHT_RATIO;
      const knobAlpha = ELEMENT_ALPHA.primary.min +
        (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min) * ent;

      // Knob shadow
      ctx.fillStyle = rgba(bgCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.beginPath();
      ctx.roundRect(faderX - knobW / 2, knobY - knobH / 2 + minDim * 0.002, knobW, knobH, knobH / 3);
      ctx.fill();

      // Knob body — color blends from tragic to rising
      const knobColor = lerpColor(tragicCol, risingCol, s.faderT);
      ctx.fillStyle = rgba(knobColor, knobAlpha);
      ctx.beginPath();
      ctx.roundRect(faderX - knobW / 2, knobY - knobH / 2, knobW, knobH, knobH / 3);
      ctx.fill();

      // Knob center line
      const centerLineH = minDim * 0.001;
      ctx.fillStyle = rgba(knobCol, ELEMENT_ALPHA.tertiary.max * ent);
      ctx.fillRect(faderX - knobW * 0.25, knobY - centerLineH / 2, knobW * 0.5, centerLineH);

      // ── Labels ─────────────────────────────────────────
      const labelAlpha = ELEMENT_ALPHA.text.min * ent;
      ctx.font = `${Math.round(minDim * 0.018)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';

      // "TRAGEDY" label at bottom
      ctx.fillStyle = rgba(tragicCol, labelAlpha * (1 - s.faderT * 0.7));
      ctx.fillText('TRAGEDY', barStartX + barAreaW / 2, cy + barMaxH + minDim * 0.04);

      // "LESSON" label at top
      ctx.fillStyle = rgba(risingCol, labelAlpha * (0.3 + s.faderT * 0.7));
      ctx.fillText('LESSON', barStartX + barAreaW / 2, cy - barMaxH - minDim * 0.02);

      // ── Breath glow ────────────────────────────────────
      if (!p.reducedMotion) {
        const breathR = minDim * 0.15 * (1 + p.breathAmplitude * 0.2);
        const breathAlpha = ELEMENT_ALPHA.glow.min * ent * (0.3 + s.faderT * 0.7);
        const glowCol = lerpColor(tragicCol, risingCol, s.faderT);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, breathR);
        grad.addColorStop(0, rgba(glowCol, breathAlpha));
        grad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(cx - breathR, cy - breathR, breathR * 2, breathR * 2);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
        cursor: 'grab',
      }}
    />
  );
}