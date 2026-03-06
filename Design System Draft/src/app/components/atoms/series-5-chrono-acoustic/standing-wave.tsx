/**
 * ATOM 049: THE STANDING WAVE ENGINE (Dynamic Stillness)
 * =======================================================
 * Series 5 — Chrono-Acoustic · Position 9
 *
 * True peace is not the absence of energy. It is energy in
 * perfect balance. A standing wave contains massive power —
 * two waves of equal amplitude and frequency traveling in
 * opposite directions — yet it appears completely still.
 * The nodes don't move. The antinodes pulse in place.
 * Frozen fury. Dynamic stillness.
 *
 * Two sine waves propagate across the canvas in opposite
 * directions. They are initially at different frequencies,
 * creating a chaotic, shifting interference pattern. The
 * user drags horizontally to adjust one wave's frequency
 * toward the other.
 *
 * As the frequencies converge:
 *   - The interference pattern slows
 *   - Nodes begin to appear (zero-crossings that don't move)
 *   - Antinodes pulse in place rather than traveling
 *
 * At perfect match: a classic standing wave — nodes frozen
 * in space, antinodes oscillating symmetrically. The wave
 * appears STILL despite containing maximum energy. A single
 * continuous haptic hum. The phone becomes the standing wave.
 *
 * AUDIO: Two counter-propagating oscillators. When matched:
 *   the beat frequency drops to zero → pure continuous tone.
 *
 * HAPTIC: drag_snap during tuning; step_advance near match;
 *         completion at lock → continuous hum
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: Static standing wave pattern, no propagation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo as easeOut, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

const BASE_FREQ = 3;             // Visual cycles across screen
const MAX_DETUNE = 1.5;          // Frequency offset
const LOCK_THRESHOLD = 0.02;
const NEAR_THRESHOLD = 0.15;
const SAMPLES = 400;
const NODE_COUNT_AT_LOCK = 6;    // Standing wave nodes visible
const AUDIO_BASE = 180;          // Hz
const AUDIO_DETUNE_MAX = 15;     // Hz
const AUDIO_GAIN = 0.05;

const BG: RGB = [4, 4, 5];
const WAVE_A: RGB = [130, 115, 100];
const WAVE_B: RGB = [100, 95, 120];
const STANDING: RGB = [170, 160, 125];
const NODE_DOT: RGB = [140, 135, 110];
const ENVELOPE: RGB = [90, 85, 75];
const LABEL: RGB = [65, 60, 55];

export default function StandingWaveAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscARef = useRef<OscillatorNode | null>(null);
  const oscBRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stateRef = useRef({
    detune: MAX_DETUNE,
    isDragging: false,
    dragStartX: 0,
    dragStartDetune: 0,
    lastSnapVal: MAX_DETUNE,
    nearFired: false,
    resolved: false,
    audioStarted: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
  });
  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    return () => { try { oscARef.current?.stop(); oscBRef.current?.stop(); audioCtxRef.current?.close(); } catch { /* */ } };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2 = canvas.getContext('2d');
    if (!ctx2) return;
    const w = viewport.width, h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cy = h / 2;
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx2.save();
      ctx2.scale(dpr, dpr);
      ctx2.clearRect(0, 0, w, h);
      s.frameCount++;

      if (s.entranceProgress < 1) {
        s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      }
      const ent = easeOut(s.entranceProgress);

      const absDetune = Math.abs(s.detune);
      const harmony = 1 - absDetune / MAX_DETUNE;
      const time = p.reducedMotion ? 0 : s.frameCount * 0.03;

      // Haptics
      const snapVal = Math.round(absDetune * 10);
      if (snapVal !== s.lastSnapVal && s.isDragging) {
        s.lastSnapVal = snapVal;
        cb.onHaptic('drag_snap');
      }
      if (absDetune < NEAR_THRESHOLD && !s.nearFired) {
        s.nearFired = true;
        cb.onHaptic('step_advance');
      }
      if (absDetune >= NEAR_THRESHOLD) s.nearFired = false;
      if (absDetune < LOCK_THRESHOLD && !s.resolved) {
        s.resolved = true;
        s.detune = 0;
        if (oscBRef.current) oscBRef.current.frequency.value = AUDIO_BASE;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }
      cb.onStateChange?.(harmony);

      // ── Background ─────────────────────────────────────
      const bg = lerpColor(BG, s.primaryRgb, 0.005);
      const bgGrad = ctx2.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx2.fillStyle = bgGrad;
      ctx2.fillRect(0, 0, w, h);

      // Standing wave glow at center
      if (harmony > 0.5) {
        const glowAlpha = (harmony - 0.5) * 2 * 0.015 * ent;
        const gc = lerpColor(STANDING, s.accentRgb, 0.1);
        const gr = minDim * 0.35;
        const gg = ctx2.createRadialGradient(w / 2, cy, 0, w / 2, cy, gr);
        gg.addColorStop(0, rgba(gc, glowAlpha));
        gg.addColorStop(0.5, rgba(gc, glowAlpha * 0.2));
        gg.addColorStop(1, rgba(gc, 0));
        ctx2.fillStyle = gg;
        ctx2.fillRect(0, 0, w, h);
      }

      const amp = h * 0.15 * (1 + p.breathAmplitude * 0.05);
      const freqA = BASE_FREQ;
      const freqB = BASE_FREQ + s.detune;

      // ── Wave A (right-traveling) ───────────────────────
      {
        const wc = lerpColor(WAVE_A, s.primaryRgb, 0.06);
        const wa = (0.04 + harmony * 0.02) * ent;
        ctx2.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
          const t = i / SAMPLES;
          const x = t * w;
          const y = cy + Math.sin(t * freqA * Math.PI * 2 + time) * amp;
          if (i === 0) ctx2.moveTo(x, y); else ctx2.lineTo(x, y);
        }
        ctx2.strokeStyle = rgba(wc, wa * (1 - harmony * 0.85));
        ctx2.lineWidth = minDim * 0.0012;
        ctx2.stroke();
      }

      // ── Wave B (left-traveling) ────────────────────────
      {
        const wc = lerpColor(WAVE_B, s.primaryRgb, 0.06);
        const wa = (0.04 + harmony * 0.02) * ent;
        ctx2.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
          const t = i / SAMPLES;
          const x = t * w;
          const y = cy + Math.sin(t * freqB * Math.PI * 2 - time) * amp;
          if (i === 0) ctx2.moveTo(x, y); else ctx2.lineTo(x, y);
        }
        ctx2.strokeStyle = rgba(wc, wa * (1 - harmony * 0.85));
        ctx2.lineWidth = minDim * 0.0012;
        ctx2.stroke();
      }

      // ── Superposition (the standing wave emerges) ──────
      {
        const sc = lerpColor(
          lerpColor(WAVE_A, s.primaryRgb, 0.04),
          lerpColor(STANDING, s.accentRgb, 0.08),
          harmony,
        );
        const sa = (0.05 + harmony * 0.08) * ent;
        const lw = minDim * 0.0016 + harmony * minDim * 0.004;

        ctx2.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
          const t = i / SAMPLES;
          const x = t * w;
          const yA = Math.sin(t * freqA * Math.PI * 2 + time);
          const yB = Math.sin(t * freqB * Math.PI * 2 - time);
          const y = cy + (yA + yB) * 0.5 * amp;
          if (i === 0) ctx2.moveTo(x, y); else ctx2.lineTo(x, y);
        }
        ctx2.strokeStyle = rgba(sc, sa);
        ctx2.lineWidth = lw;
        ctx2.lineCap = 'round';
        ctx2.lineJoin = 'round';
        ctx2.stroke();

        // Glow
        if (harmony > 0.3) {
          ctx2.strokeStyle = rgba(sc, sa * 0.12 * harmony);
          ctx2.lineWidth = lw * 4;
          ctx2.stroke();
        }
      }

      // ── Standing wave envelope (when near lock) ────────
      if (harmony > 0.7) {
        const envAlpha = (harmony - 0.7) * 3.3 * 0.025 * ent;
        const ec = lerpColor(ENVELOPE, s.accentRgb, 0.06);
        // Upper envelope
        ctx2.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
          const t = i / SAMPLES;
          const x = t * w;
          const env = Math.abs(Math.cos(t * BASE_FREQ * Math.PI)) * amp;
          if (i === 0) ctx2.moveTo(x, cy - env); else ctx2.lineTo(x, cy - env);
        }
        ctx2.strokeStyle = rgba(ec, envAlpha);
        ctx2.lineWidth = minDim * 0.0012;
        ctx2.setLineDash([minDim * 0.006, minDim * 0.008]);
        ctx2.stroke();
        // Lower envelope
        ctx2.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
          const t = i / SAMPLES;
          const x = t * w;
          const env = Math.abs(Math.cos(t * BASE_FREQ * Math.PI)) * amp;
          if (i === 0) ctx2.moveTo(x, cy + env); else ctx2.lineTo(x, cy + env);
        }
        ctx2.stroke();
        ctx2.setLineDash([]);
      }

      // ── Node dots (at standing wave zero-crossings) ────
      if (harmony > 0.6) {
        const nd = lerpColor(NODE_DOT, s.accentRgb, 0.06);
        const na = (harmony - 0.6) * 2.5 * 0.1 * ent;
        for (let n = 0; n <= NODE_COUNT_AT_LOCK; n++) {
          const nx = (n / NODE_COUNT_AT_LOCK) * w;
          ctx2.beginPath();
          ctx2.arc(nx, cy, minDim * 0.003, 0, Math.PI * 2);
          ctx2.fillStyle = rgba(nd, na);
          ctx2.fill();
        }
      }

      // ── Labels ─────────────────────────────────────────
      const lbl = lerpColor(LABEL, s.primaryRgb, 0.04);
      const fs = Math.round(minDim * 0.014);
      ctx2.font = `300 ${fs}px -apple-system, sans-serif`;
      ctx2.textAlign = 'center';

      if (absDetune > 0.05) {
        ctx2.textBaseline = 'top';
        ctx2.fillStyle = rgba(lbl, 0.025 * ent * (1 - harmony));
        ctx2.fillText(`Δf ${absDetune.toFixed(2)}`, w / 2, h - minDim * 0.03);
      }

      if (!s.resolved && s.frameCount < 300 && !s.isDragging) {
        const hAlpha = Math.max(0, (1 - s.frameCount / 300) * 0.03) * ent;
        ctx2.textBaseline = 'middle';
        ctx2.fillStyle = rgba(lbl, hAlpha);
        ctx2.fillText('← drag →', w / 2, cy + amp + minDim * 0.04);
      }

      ctx2.restore();
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Audio helper (inline) ───────────────────────────
    const ensureAudio = () => {
      const s = stateRef.current;
      if (s.audioStarted) return;
      try {
        const actx = new AudioContext();
        audioCtxRef.current = actx;
        const gain = actx.createGain();
        gain.gain.value = AUDIO_GAIN;
        gain.connect(actx.destination);
        gainRef.current = gain;
        const oscA = actx.createOscillator();
        oscA.type = 'sine';
        oscA.frequency.value = AUDIO_BASE;
        oscA.connect(gain);
        oscA.start();
        oscARef.current = oscA;
        const oscB = actx.createOscillator();
        oscB.type = 'sine';
        oscB.frequency.value = AUDIO_BASE + AUDIO_DETUNE_MAX;
        oscB.connect(gain);
        oscB.start();
        oscBRef.current = oscB;
        s.audioStarted = true;
      } catch { /* */ }
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
      s.detune = Math.max(-MAX_DETUNE, Math.min(MAX_DETUNE,
        s.dragStartDetune - (dx / w) * MAX_DETUNE * 2));
      if (oscBRef.current) {
        oscBRef.current.frequency.value = AUDIO_BASE + (s.detune / MAX_DETUNE) * AUDIO_DETUNE_MAX;
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
      <canvas ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }}
      />
    </div>
  );
}