/**
 * ATOM 039: THE NOISE GATE ENGINE (Selective Deafness)
 * =====================================================
 * Series 4 — Via Negativa · Position 9
 *
 * To train the user's attention filter. Not every thought or
 * external critique deserves to be heard. The user must set a
 * threshold for what enters their consciousness.
 *
 * The canvas displays 10 overlapping waveforms — some small
 * and jittery (noise: intrusive thoughts, petty worries,
 * others' opinions), some large and smooth (signal: truth,
 * purpose, sovereignty). A horizontal gate line sits at the
 * bottom. The user drags it upward.
 *
 * As the gate rises, any waveform whose peak amplitude falls
 * below the gate line is CLIPPED — instantly deleted from the
 * render loop. The small, erratic waves vanish first. Each
 * deletion is a haptic step_advance. As noise is gated, the
 * remaining signal waves gain space, luminosity, and room to
 * breathe. At maximum gate: only the single most powerful
 * wave remains — massive, smooth, unimpeachable truth.
 *
 * PHYSICS:
 *   - 10 waveforms with distinct amplitudes (0.1–1.0)
 *   - Low-amplitude waves are jittery, chaotic, thin
 *   - High-amplitude waves are smooth, wide, luminous
 *   - Gate Y position: 0 (bottom) to 1 (top)
 *   - Wave clipped when its amplitude < gate position
 *   - Clipped waves dissolve (alpha → 0 over 20 frames)
 *   - Surviving waves gain brightness + line width
 *
 * HAPTIC JOURNEY:
 *   Drag gate → drag_snap (each notch)
 *   Each wave gated → step_advance
 *   Only signal remains → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static waveforms, no jitter on noise waves
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const WAVE_COUNT = 10;
/** Gate handle height as fraction of minDim */
const GATE_HANDLE_H_FRAC = 0.015;
/** Gate handle width as fraction of viewport */
const GATE_HANDLE_W_FRAC = 0.15;
/** Waveform samples across width */
const WAVE_SAMPLES = 200;
/** Dissolve speed (alpha reduction per frame) */
const DISSOLVE_SPEED = 0.06;

// =====================================================================
// WAVEFORM DATA
// =====================================================================

interface WaveformDef {
  /** Peak amplitude 0–1 (determines clip threshold) */
  amplitude: number;
  /** Frequency (higher = more cycles) */
  frequency: number;
  /** Phase offset */
  phase: number;
  /** Jitter magnitude (chaos) */
  jitter: number;
  /** Waveform thickness */
  thickness: number;
  /** Current render alpha */
  alpha: number;
  /** Whether gated (dissolving or gone) */
  gated: boolean;
  /** Vertical center offset (normalized -0.3 to 0.3) */
  yOffset: number;
}

function createWaves(): WaveformDef[] {
  // Carefully designed: lowest amplitude = most chaotic
  return [
    // NOISE — small, jittery, thin
    { amplitude: 0.08, frequency: 12,  phase: 0.0, jitter: 0.7,  thickness: 0.4, alpha: 1, gated: false, yOffset: -0.15 },
    { amplitude: 0.13, frequency: 15,  phase: 1.2, jitter: 0.65, thickness: 0.5, alpha: 1, gated: false, yOffset:  0.10 },
    { amplitude: 0.20, frequency: 9,   phase: 2.5, jitter: 0.5,  thickness: 0.6, alpha: 1, gated: false, yOffset: -0.08 },
    { amplitude: 0.28, frequency: 11,  phase: 0.8, jitter: 0.4,  thickness: 0.7, alpha: 1, gated: false, yOffset:  0.20 },
    { amplitude: 0.35, frequency: 7,   phase: 3.1, jitter: 0.3,  thickness: 0.8, alpha: 1, gated: false, yOffset: -0.22 },
    // TRANSITION
    { amplitude: 0.45, frequency: 5,   phase: 1.5, jitter: 0.15, thickness: 1.0, alpha: 1, gated: false, yOffset:  0.05 },
    { amplitude: 0.55, frequency: 4,   phase: 0.3, jitter: 0.08, thickness: 1.2, alpha: 1, gated: false, yOffset: -0.12 },
    // SIGNAL — large, smooth, powerful
    { amplitude: 0.70, frequency: 3,   phase: 2.0, jitter: 0.03, thickness: 1.5, alpha: 1, gated: false, yOffset:  0.15 },
    { amplitude: 0.85, frequency: 2.5, phase: 0.7, jitter: 0.01, thickness: 1.8, alpha: 1, gated: false, yOffset: -0.05 },
    // THE TRUTH — singular, massive, serene
    { amplitude: 1.00, frequency: 1.5, phase: 0.0, jitter: 0.00, thickness: 2.2, alpha: 1, gated: false, yOffset:  0.00 },
  ];
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [4, 4, 5];
const NOISE_COLOR: RGB = [90, 65, 70];         // Anxious, reddish-grey
const SIGNAL_COLOR: RGB = [140, 135, 120];     // Warm, clear, sovereign
const GATE_LINE_COLOR: RGB = [120, 110, 100];  // The threshold
const GATE_HANDLE_COLOR: RGB = [160, 145, 130];

// =====================================================================
// COMPONENT
// =====================================================================

export default function NoiseGateAtom({
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
    waves: [] as WaveformDef[],
    gatePosition: 0, // 0 = bottom (no gating), 1 = top (gate everything)
    isDragging: false,
    gatedCount: 0,
    resolved: false,
    lastSnapGate: 0,
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

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.isDragging = true;
      const py = (e.clientY - rect.top) / rect.height;
      stateRef.current.gatePosition = Math.max(0, Math.min(1, 1 - py));
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const py = (e.clientY - rect.top) / rect.height;
      stateRef.current.gatePosition = Math.max(0, Math.min(1, 1 - py));
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.waves = createWaves();
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

      // ── Gate logic: clip waves below threshold ────────
      let newGatedCount = 0;
      for (const wave of s.waves) {
        if (wave.amplitude < s.gatePosition && !wave.gated) {
          wave.gated = true;
          cb.onHaptic('step_advance');
        }
        // Un-gate immediately when amplitude rises above gate (user drags back down)
        if (wave.amplitude >= s.gatePosition && wave.gated) {
          wave.gated = false;
        }
        if (wave.gated) {
          wave.alpha = Math.max(0, wave.alpha - DISSOLVE_SPEED);
          newGatedCount++;
        }
        if (!wave.gated && wave.alpha < 1) {
          wave.alpha = Math.min(1, wave.alpha + 0.03);
        }
      }

      // Drag snap haptic (every 0.1 of gate position)
      const snapStep = Math.floor(s.gatePosition * 10);
      if (snapStep !== s.lastSnapGate && s.isDragging) {
        s.lastSnapGate = snapStep;
        cb.onHaptic('drag_snap');
      }

      s.gatedCount = newGatedCount;

      // Completion: only the strongest wave remains
      if (s.gatedCount >= WAVE_COUNT - 1 && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const activeCount = s.waves.filter(w => !w.gated || w.alpha > 0.01).length;
      const signalBoost = 1 + (WAVE_COUNT - activeCount) * 0.06;

      cb.onStateChange?.(s.gatePosition);

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

      // ══════════════════════════════════════════════════
      // WAVEFORMS
      // ══════════════════════════════════════════════════

      const waveAreaTop = h * 0.08;
      const waveAreaBot = h * 0.85;
      const waveAreaH = waveAreaBot - waveAreaTop;
      const waveCenterY = waveAreaTop + waveAreaH * 0.5;

      for (const wave of s.waves) {
        if (wave.alpha < 0.005) continue;

        // Color: noise is chaotic-red, signal is warm-clear
        const signalness = wave.amplitude; // 0 = noise, 1 = signal
        const waveColor = lerpColor(
          lerpColor(NOISE_COLOR, s.primaryRgb, 0.05),
          lerpColor(SIGNAL_COLOR, s.accentRgb, 0.08),
          signalness,
        );

        // Amplitude in pixels
        const ampPx = wave.amplitude * waveAreaH * 0.35 * (wave.gated ? 1 : signalBoost);
        const centerY = waveCenterY + wave.yOffset * waveAreaH * 0.4;

        // Alpha: base + signal boost
        const baseAlpha = (0.03 + signalness * 0.06) * wave.alpha * entrance;
        const lineW = wave.thickness * minDim * 0.002 * (wave.gated ? 1 : signalBoost * 0.8);

        ctx.beginPath();
        for (let i = 0; i <= WAVE_SAMPLES; i++) {
          const t = i / WAVE_SAMPLES;
          const x = t * w;

          // Base sine
          const angle = t * wave.frequency * Math.PI * 2 + wave.phase +
            (p.reducedMotion ? 0 : s.frameCount * 0.01 * (1 + wave.jitter * 2));

          let y = Math.sin(angle) * ampPx;

          // Jitter (noise waves shake)
          if (!p.reducedMotion && wave.jitter > 0) {
            y += Math.sin(angle * 7.3 + s.frameCount * 0.08) * ampPx * wave.jitter * 0.3;
            y += Math.sin(angle * 13.1 + s.frameCount * 0.12) * ampPx * wave.jitter * 0.15;
          }

          const py = centerY + y;

          if (i === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }

        ctx.strokeStyle = rgba(waveColor, baseAlpha);
        ctx.lineWidth = lineW;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Glow for signal waves
        if (signalness > 0.6 && !wave.gated) {
          ctx.strokeStyle = rgba(waveColor, baseAlpha * 0.15);
          ctx.lineWidth = lineW * 3;
          ctx.stroke();
        }
      }

      // ══════════════════════════════════════════════════
      // GATE LINE
      // ══════════════════════════════════════════════════

      const gateY = h * (1 - s.gatePosition);
      const gateAlpha = (0.04 + (s.isDragging ? 0.04 : 0)) * entrance;
      const gateColor = lerpColor(GATE_LINE_COLOR, s.accentRgb, 0.08);

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, gateY);
      ctx.lineTo(w, gateY);
      ctx.strokeStyle = rgba(gateColor, gateAlpha);
      ctx.lineWidth = minDim * 0.001;
      ctx.stroke();

      // Gate handle
      const handleH = minDim * GATE_HANDLE_H_FRAC;
      const handleW = w * GATE_HANDLE_W_FRAC;
      const handleX = (w - handleW) / 2;
      const handleColor = lerpColor(GATE_HANDLE_COLOR, s.accentRgb, 0.06);
      const handleAlpha = gateAlpha * 1.5;

      ctx.fillStyle = rgba(handleColor, handleAlpha);
      ctx.beginPath();
      ctx.roundRect(handleX, gateY - handleH / 2, handleW, handleH, minDim * 0.006);
      ctx.fill();

      // Gate label (very faint)
      if (s.gatePosition > 0.02) {
        const fontSize = Math.round(minDim * 0.018);
        ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = rgba(gateColor, gateAlpha * 0.5);
        ctx.fillText('GATE', w - minDim * 0.02, gateY - minDim * 0.01);
      }

      // ── Clipped zone (below gate — darkened) ──────────
      if (s.gatePosition > 0.02) {
        const clipGrad = ctx.createLinearGradient(0, gateY, 0, h);
        clipGrad.addColorStop(0, rgba(bgColor, 0));
        clipGrad.addColorStop(0.3, rgba(bgColor, 0.4 * s.gatePosition));
        clipGrad.addColorStop(1, rgba(bgColor, 0.6 * s.gatePosition));
        ctx.fillStyle = clipGrad;
        ctx.fillRect(0, gateY, w, h - gateY);
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