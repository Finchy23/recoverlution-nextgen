/**
 * ATOM 041: THE PHASE LOCK ENGINE (Harmonic Alignment)
 * =====================================================
 * Series 5 — Chrono-Acoustic · Position 1
 *
 * Conflict in the mind feels like terrible noise. Two thoughts,
 * two obligations, two selves — all clashing. This atom
 * visualises that internal dissonance as two waveforms fighting
 * each other, and lets the user physically drag them into
 * mathematical harmony.
 *
 * Two sine waves render across the canvas: Wave A (fixed,
 * sovereign, steady) and Wave B (the user's — initially
 * detuned, creating an ugly beating interference pattern).
 * Below both, the SUPERPOSITION wave shows their combined
 * reality — warped, chaotic, trembling.
 *
 * The user drags horizontally to tune Wave B's frequency toward
 * Wave A. As the frequencies converge:
 *   - The beat pattern slows
 *   - The superposition wave smooths
 *   - The colour shifts from discordant to harmonic
 *   - The audio (two detuned oscillators) resolves to a chord
 *
 * At perfect lock: one massive unified wave. One pure tone.
 * One breath. Completion.
 *
 * AUDIO ENGINE:
 *   Two OscillatorNodes (220Hz base). Wave B detuned by ±12Hz.
 *   User drag adjusts Wave B frequency. When Δf → 0: pure tone.
 *   GainNodes at very low volume (therapeutic, not intrusive).
 *   AudioContext created on first interaction (browser policy).
 *   Graceful degradation: visual-only if audio unavailable.
 *
 * HAPTIC JOURNEY:
 *   Drag → drag_snap (each Hz step)
 *   Within 1Hz → step_advance (almost there)
 *   Perfect lock → completion (devastating harmonic resolution)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static waveforms, no animation, faster lock
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const BASE_FREQ = 220;       // Hz — A3, warm and deep
const MAX_DETUNE = 12;       // Hz — initial offset
const WAVE_SAMPLES = 300;    // Points per waveform
const LOCK_THRESHOLD = 0.15; // Hz — close enough for lock
const NEAR_THRESHOLD = 1.0;  // Hz — step_advance threshold
const AUDIO_GAIN = 0.06;     // Very quiet — therapeutic, not blaring
/** Waveform amplitude as fraction of available height per lane */
const WAVE_AMP_FRAC = 0.35;

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [5, 5, 6];
const WAVE_A_COLOR: RGB = [160, 145, 120];     // Sovereign — warm gold
const WAVE_B_DISCORD: RGB = [120, 70, 75];     // Discordant — anxious red
const WAVE_B_HARMONY: RGB = [145, 140, 115];   // Harmonic — approaching gold
const SUPER_DISCORD: RGB = [90, 55, 60];       // Chaos superposition
const SUPER_HARMONY: RGB = [180, 165, 130];    // Unified superposition
const LOCK_GLOW: RGB = [200, 180, 140];        // Resolution glow
const LABEL_COLOR: RGB = [80, 75, 70];
const GUIDE_COLOR: RGB = [60, 55, 50];

// =====================================================================
// COMPONENT
// =====================================================================

export default function PhaseLockAtom({
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
  const oscARef = useRef<OscillatorNode | null>(null);
  const oscBRef = useRef<OscillatorNode | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);

  const stateRef = useRef({
    detune: MAX_DETUNE, // Current detune of Wave B (Hz from base)
    isDragging: false,
    dragStartX: 0,
    dragStartDetune: 0,
    lastSnapHz: MAX_DETUNE,
    nearFired: false,
    resolved: false,
    audioStarted: false,
    // Animation
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Cleanup audio on unmount ─────────────────────────────
  useEffect(() => {
    return () => {
      try {
        oscARef.current?.stop();
        oscBRef.current?.stop();
        audioCtxRef.current?.close();
      } catch { /* already closed */ }
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
        const gainA = actx.createGain();
        gainA.gain.value = AUDIO_GAIN;
        gainA.connect(actx.destination);
        gainARef.current = gainA;
        const gainB = actx.createGain();
        gainB.gain.value = AUDIO_GAIN;
        gainB.connect(actx.destination);
        gainBRef.current = gainB;
        const oscA = actx.createOscillator();
        oscA.type = 'sine';
        oscA.frequency.value = BASE_FREQ;
        oscA.connect(gainA);
        oscA.start();
        oscARef.current = oscA;
        const oscB = actx.createOscillator();
        oscB.type = 'sine';
        oscB.frequency.value = BASE_FREQ + s.detune;
        oscB.connect(gainB);
        oscB.start();
        oscBRef.current = oscB;
        s.audioStarted = true;
      } catch { /* Audio not available */ }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.isDragging = true;
      s.dragStartX = (e.clientX - rect.left) / rect.width * w;
      s.dragStartDetune = s.detune;
      ensureAudio();
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isDragging) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const dx = px - s.dragStartX;
      const detuneChange = -(dx / w) * MAX_DETUNE * 2;
      s.detune = Math.max(-MAX_DETUNE, Math.min(MAX_DETUNE,
        s.dragStartDetune + detuneChange));
      if (oscBRef.current) {
        oscBRef.current.frequency.value = BASE_FREQ + s.detune;
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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

      // ── Harmony metric ────────────────────────────────
      const absDetune = Math.abs(s.detune);
      const harmony = 1 - absDetune / MAX_DETUNE; // 0 = max discord, 1 = locked

      // Haptic snaps (every 2Hz step)
      const snapHz = Math.round(absDetune / 2) * 2;
      if (snapHz !== s.lastSnapHz && s.isDragging) {
        s.lastSnapHz = snapHz;
        cb.onHaptic('drag_snap');
      }

      // Near threshold
      if (absDetune < NEAR_THRESHOLD && !s.nearFired) {
        s.nearFired = true;
        cb.onHaptic('step_advance');
      }
      if (absDetune >= NEAR_THRESHOLD) {
        s.nearFired = false;
      }

      // Lock
      if (absDetune < LOCK_THRESHOLD && !s.resolved) {
        s.resolved = true;
        s.detune = 0;
        if (oscBRef.current) {
          oscBRef.current.frequency.value = BASE_FREQ;
        }
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(harmony);

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

      // Lock glow (emerges with harmony)
      if (harmony > 0.5) {
        const glowAlpha = (harmony - 0.5) * 2 * 0.015 * entrance;
        const glowColor = lerpColor(LOCK_GLOW, s.accentRgb, 0.1);
        const glowR = minDim * 0.4;
        const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowR);
        glowGrad.addColorStop(0, rgba(glowColor, glowAlpha));
        glowGrad.addColorStop(0.5, rgba(glowColor, glowAlpha * 0.2));
        glowGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ══════════════════════════════════════════════════
      // THREE-LANE WAVEFORM DISPLAY
      // ══════════════════════════════════════════════════

      const laneH = h / 3;
      const margin = laneH * 0.08;
      const time = p.reducedMotion ? 0 : s.frameCount * 0.015;

      // Lane separator lines
      const guideColor = lerpColor(GUIDE_COLOR, s.primaryRgb, 0.04);
      for (let lane = 1; lane < 3; lane++) {
        const ly = lane * laneH;
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(w, ly);
        ctx.strokeStyle = rgba(guideColor, 0.02 * entrance);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();
      }

      // ── LANE 1: Wave A (Sovereign — fixed) ─────────────
      {
        const centerY = laneH * 0.5;
        const amp = (laneH * 0.5 - margin) * WAVE_AMP_FRAC;
        const freq = BASE_FREQ;
        const waveColor = lerpColor(WAVE_A_COLOR, s.accentRgb, 0.08);
        const alpha = 0.12 * entrance;

        ctx.beginPath();
        for (let i = 0; i <= WAVE_SAMPLES; i++) {
          const t = i / WAVE_SAMPLES;
          const x = t * w;
          const angle = t * freq * 0.04 + time;
          const y = centerY + Math.sin(angle) * amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(waveColor, alpha);
        ctx.lineWidth = minDim * 0.0024;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Glow
        ctx.strokeStyle = rgba(waveColor, alpha * 0.2);
        ctx.lineWidth = minDim * 0.008;
        ctx.stroke();

        // Label
        const labelColor = lerpColor(LABEL_COLOR, s.primaryRgb, 0.05);
        const fontSize = Math.round(minDim * 0.016);
        ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgba(labelColor, 0.04 * entrance);
        ctx.fillText(`${BASE_FREQ} Hz`, minDim * 0.01, minDim * 0.008);
      }

      // ── LANE 2: Wave B (User — detuned) ───────────────
      {
        const centerY = laneH + laneH * 0.5;
        const amp = (laneH * 0.5 - margin) * WAVE_AMP_FRAC;
        const freq = BASE_FREQ + s.detune;
        const waveColor = lerpColor(
          lerpColor(WAVE_B_DISCORD, s.primaryRgb, 0.05),
          lerpColor(WAVE_B_HARMONY, s.accentRgb, 0.08),
          harmony,
        );
        const alpha = 0.12 * entrance;

        ctx.beginPath();
        for (let i = 0; i <= WAVE_SAMPLES; i++) {
          const t = i / WAVE_SAMPLES;
          const x = t * w;
          const angle = t * freq * 0.04 + time;
          const y = centerY + Math.sin(angle) * amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(waveColor, alpha);
        ctx.lineWidth = minDim * 0.0024;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Glow
        ctx.strokeStyle = rgba(waveColor, alpha * 0.2);
        ctx.lineWidth = minDim * 0.008;
        ctx.stroke();

        // Label
        const labelColor = lerpColor(LABEL_COLOR, s.primaryRgb, 0.05);
        const fontSize = Math.round(minDim * 0.016);
        ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = rgba(labelColor, 0.04 * entrance);
        ctx.fillText(`${freq.toFixed(1)} Hz`, minDim * 0.01, laneH + minDim * 0.008);
      }

      // ── LANE 3: Superposition (A + B combined) ─────────
      {
        const centerY = 2 * laneH + laneH * 0.5;
        const amp = (laneH * 0.5 - margin) * WAVE_AMP_FRAC;
        const freqA = BASE_FREQ;
        const freqB = BASE_FREQ + s.detune;

        const superColor = lerpColor(
          lerpColor(SUPER_DISCORD, s.primaryRgb, 0.04),
          lerpColor(SUPER_HARMONY, s.accentRgb, 0.1),
          harmony,
        );
        const alpha = (0.08 + harmony * 0.08) * entrance;
        const lineW = minDim * 0.002 + harmony * minDim * 0.003;

        ctx.beginPath();
        for (let i = 0; i <= WAVE_SAMPLES; i++) {
          const t = i / WAVE_SAMPLES;
          const x = t * w;
          const angleA = t * freqA * 0.04 + time;
          const angleB = t * freqB * 0.04 + time;
          // Superposition = normalized sum
          const yA = Math.sin(angleA);
          const yB = Math.sin(angleB);
          const combined = (yA + yB) * 0.5;
          const y = centerY + combined * amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(superColor, alpha);
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Superposition glow (stronger when locked)
        if (harmony > 0.3) {
          ctx.strokeStyle = rgba(superColor, alpha * 0.15 * harmony);
          ctx.lineWidth = lineW * 4;
          ctx.stroke();
        }
      }

      // ── Beat frequency indicator ────────────────────────
      if (absDetune > 0.3) {
        const beatFreq = absDetune;
        const beatText = `Δ ${beatFreq.toFixed(1)} Hz`;
        const labelColor = lerpColor(LABEL_COLOR, s.primaryRgb, 0.04);
        const fontSize = Math.round(minDim * 0.014);
        ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(labelColor, 0.03 * entrance * (1 - harmony));
        ctx.fillText(beatText, w / 2, h - minDim * 0.025);
      }

      // ── Drag hint (subtle) ──────────────────────────────
      if (!s.resolved && s.frameCount < 300 && !s.isDragging) {
        const hintAlpha = Math.max(0, (1 - s.frameCount / 300) * 0.03) * entrance;
        const hintColor = lerpColor(LABEL_COLOR, s.primaryRgb, 0.04);
        const fontSize = Math.round(minDim * 0.015);
        ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(hintColor, hintAlpha);
        ctx.fillText('← drag →', w / 2, laneH + laneH * 0.5 + (laneH * 0.5 - margin) * WAVE_AMP_FRAC + minDim * 0.02);
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
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
}