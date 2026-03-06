/**
 * ATOM 375: THE NOISE THRESHOLD ENGINE
 * ======================================
 * Series 38 — Magnetic Sieve · Position 5
 *
 * Cure constant context-switching. Raise the noise gate until
 * only the highest most critical peaks remain visible.
 *
 * PHYSICS:
 *   - Massive chaotic waveform fills viewport vertically
 *   - Multiple overlapping frequency bands creating visual noise
 *   - User drags horizontal noise gate bar upward
 *   - Everything below threshold instantly muted (faded to near-zero)
 *   - Only highest critical peaks survive above the gate
 *   - At ~85% threshold, clarity lock — only 2-3 peaks remain
 *   - Breath modulates the surviving peak glow intensity
 *
 * INTERACTION:
 *   Drag (vertical) → raises/lowers the noise gate threshold
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static waveform with threshold line at 80%
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Number of waveform frequency bands */
const BAND_COUNT = 5;
/** Waveform sample resolution (points per band) */
const WAVE_RESOLUTION = 80;
/** Number of critical peaks that survive high threshold */
const CRITICAL_PEAKS = 3;
/** Peak locations (normalized 0-1 across X axis) */
const PEAK_POSITIONS = [0.22, 0.55, 0.82];
/** Peak heights (normalized 0-1, how tall they are) */
const PEAK_HEIGHTS = [0.88, 0.95, 0.78];
/** Noise amplitude for non-peak waveform */
const NOISE_AMPLITUDE = 0.45;
/** Waveform animation speed */
const WAVE_SPEED = 0.015;
/** Gate bar visual thickness */
const GATE_BAR_FRAC = 0.004;
/** Gate handle radius */
const GATE_HANDLE_R = 0.015;
/** Completion threshold position (0=bottom, 1=top) */
const COMPLETION_GATE = 0.75;
/** Gate glow extent below the bar */
const GATE_GLOW_DEPTH = 0.15;
/** Breath modulation on surviving peaks */
const BREATH_PEAK_FACTOR = 0.1;
/** Muted zone alpha */
const MUTED_ALPHA = 0.04;
/** Active zone alpha */
const ACTIVE_ALPHA = 0.35;

// =====================================================================
// HELPERS
// =====================================================================

/** Generate a waveform value at position x (0-1) with time offset */
function waveAt(x: number, time: number, band: number): number {
  // Base noise from multiple sine waves
  const freq1 = 3 + band * 2.7;
  const freq2 = 7 + band * 1.3;
  const freq3 = 11 + band * 3.1;
  let val = Math.sin(x * freq1 + time * (1 + band * 0.3)) * 0.3
    + Math.sin(x * freq2 - time * 0.7) * 0.2
    + Math.sin(x * freq3 + time * 1.2) * 0.15
    + Math.sin(x * 2.1 + band + time * 0.4) * 0.1;

  // Add critical peaks
  for (let p = 0; p < CRITICAL_PEAKS; p++) {
    const peakX = PEAK_POSITIONS[p];
    const peakH = PEAK_HEIGHTS[p];
    const dist = Math.abs(x - peakX);
    if (dist < 0.08) {
      const peakContrib = peakH * Math.exp(-(dist * dist) / (2 * 0.015 * 0.015));
      val = Math.max(val, peakContrib);
    }
  }

  return Math.max(0, Math.min(1, val * NOISE_AMPLITUDE + 0.1));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function NoiseThresholdAtom({
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
    gatePosition: 0.05,    // 0 = bottom, 1 = top (normalized)
    dragging: false,
    completed: false,
    completionAnim: 0,
    lastHapticZone: -1,
    waveTime: 0,
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
      s.waveTime += WAVE_SPEED * ms;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve') {
        s.gatePosition = Math.min(1, s.gatePosition + 0.005);
      }

      // ── Completion check ────────────────────────────
      if (s.gatePosition >= COMPLETION_GATE && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : Math.min(0.5, s.gatePosition / COMPLETION_GATE * 0.5));

      // ── Haptic zone feedback ────────────────────────
      const hapticZone = Math.floor(s.gatePosition * 10);
      if (hapticZone > s.lastHapticZone && s.dragging) {
        cb.onHaptic('step_advance');
        s.lastHapticZone = hapticZone;
      }

      // ── Coordinate mapping ──────────────────────────
      // Waveform fills the viewport vertically
      // Gate Y: gatePosition 0 = bottom of waveform area, 1 = top
      const waveTop = h * 0.08;
      const waveBottom = h * 0.92;
      const waveHeight = waveBottom - waveTop;
      const gateY = waveBottom - s.gatePosition * waveHeight;

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const staticGateY = waveBottom - 0.8 * waveHeight;

        // Draw static waveform bands
        for (let band = 0; band < BAND_COUNT; band++) {
          ctx.beginPath();
          for (let i = 0; i <= WAVE_RESOLUTION; i++) {
            const x = (i / WAVE_RESOLUTION) * w;
            const val = waveAt(i / WAVE_RESOLUTION, band * 0.5, band);
            const y = waveBottom - val * waveHeight;
            const aboveGate = y < staticGateY;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          const bandAlpha = (aboveGate: boolean) =>
            aboveGate ? ACTIVE_ALPHA : MUTED_ALPHA;
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }

        // Gate line
        ctx.beginPath();
        ctx.moveTo(0, staticGateY);
        ctx.lineTo(w, staticGateY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(GATE_BAR_FRAC, minDim);
        ctx.stroke();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Draw muted zone (below gate) ────────────────
      const muteGrad = ctx.createLinearGradient(0, gateY, 0, gateY + waveHeight * GATE_GLOW_DEPTH);
      muteGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance));
      muteGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = muteGrad;
      ctx.fillRect(0, gateY, w, waveHeight * GATE_GLOW_DEPTH);

      // ── Draw waveform bands ─────────────────────────
      for (let band = 0; band < BAND_COUNT; band++) {
        const bandOffset = band * 0.2;
        const bandColor = band < 2 ? s.primaryRgb : s.accentRgb;

        ctx.beginPath();
        for (let i = 0; i <= WAVE_RESOLUTION; i++) {
          const xFrac = i / WAVE_RESOLUTION;
          const x = xFrac * w;
          const val = waveAt(xFrac, s.waveTime + bandOffset, band);
          const y = waveBottom - val * waveHeight;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Split rendering: above gate is bright, below is muted
        ctx.strokeStyle = rgba(bandColor, ALPHA.content.max * 0.12 * entrance);
        ctx.lineWidth = px(0.001 + band * 0.0003, minDim);
        ctx.stroke();
      }

      // ── Draw peaks that survive above threshold ─────
      for (let p2 = 0; p2 < CRITICAL_PEAKS; p2++) {
        const peakX = PEAK_POSITIONS[p2] * w;
        const peakVal = PEAK_HEIGHTS[p2] * NOISE_AMPLITUDE + 0.1;
        const peakY = waveBottom - peakVal * waveHeight;
        const aboveGate = peakY < gateY;

        if (aboveGate) {
          const breathMod = 1 + breath * BREATH_PEAK_FACTOR;

          // Peak glow column
          const peakGlowW = px(0.03, minDim);
          const peakGlowH = gateY - peakY;
          const colGlow = ctx.createLinearGradient(peakX, peakY, peakX, gateY);
          colGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * breathMod * entrance));
          colGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * breathMod * entrance));
          colGlow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = colGlow;
          ctx.fillRect(peakX - peakGlowW, peakY, peakGlowW * 2, peakGlowH);

          // Peak tip glow
          const tipR = px(0.02, minDim) * breathMod;
          const tipGlow = ctx.createRadialGradient(peakX, peakY, 0, peakX, peakY, tipR);
          tipGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * entrance));
          tipGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
          tipGlow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = tipGlow;
          ctx.fillRect(peakX - tipR, peakY - tipR, tipR * 2, tipR * 2);

          // Peak dot
          ctx.beginPath();
          ctx.arc(peakX, peakY, px(0.005, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
            ALPHA.content.max * 0.5 * entrance,
          );
          ctx.fill();
        }
      }

      // ── Draw muted overlay below gate ───────────────
      // Darkening effect for everything below the gate
      const muteOverlay = ctx.createLinearGradient(0, gateY, 0, waveBottom);
      muteOverlay.addColorStop(0, rgba([0, 0, 0] as RGB, 0));
      muteOverlay.addColorStop(0.1, rgba([0, 0, 0] as RGB, 0.02 * s.gatePosition * entrance));
      muteOverlay.addColorStop(1, rgba([0, 0, 0] as RGB, 0.04 * s.gatePosition * entrance));
      ctx.fillStyle = muteOverlay;
      ctx.fillRect(0, gateY, w, waveBottom - gateY);

      // ── Draw gate bar ───────────────────────────────
      const barThick = px(GATE_BAR_FRAC, minDim);

      // Gate glow
      const gateGlowH = px(0.03, minDim);
      const gateGlow = ctx.createLinearGradient(0, gateY - gateGlowH, 0, gateY + gateGlowH);
      gateGlow.addColorStop(0, rgba(s.primaryRgb, 0));
      gateGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      gateGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = gateGlow;
      ctx.fillRect(0, gateY - gateGlowH, w, gateGlowH * 2);

      // Gate bar line
      ctx.beginPath();
      ctx.moveTo(0, gateY);
      ctx.lineTo(w, gateY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
      ctx.lineWidth = barThick;
      ctx.stroke();

      // Gate handle (center)
      const handleR = px(GATE_HANDLE_R, minDim);
      ctx.beginPath();
      ctx.arc(cx, gateY, handleR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      // Handle inner ring
      ctx.beginPath();
      ctx.arc(cx, gateY, handleR * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(
        lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
        ALPHA.content.max * 0.3 * entrance,
      );
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // ── Threshold percentage indicator ──────────────
      if (s.gatePosition > 0.08) {
        const pctY = gateY - px(0.025, minDim);
        const pctR = px(0.015, minDim);
        const arcAngle = s.gatePosition * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(w * 0.92, pctY, pctR, -Math.PI / 2, -Math.PI / 2 + arcAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const waveTop = viewport.height * 0.08;
      const waveBottom = viewport.height * 0.92;
      const waveHeight = waveBottom - waveTop;
      const currentGateY = waveBottom - s.gatePosition * waveHeight;
      const pointerY = e.clientY - rect.top;

      // Check if near the gate bar
      if (Math.abs(pointerY - currentGateY) < 40) {
        s.dragging = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;

      const rect = canvas.getBoundingClientRect();
      const waveTop = viewport.height * 0.08;
      const waveBottom = viewport.height * 0.92;
      const waveHeight = waveBottom - waveTop;
      const pointerY = e.clientY - rect.top;

      s.gatePosition = Math.max(0, Math.min(1, (waveBottom - pointerY) / waveHeight));
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
