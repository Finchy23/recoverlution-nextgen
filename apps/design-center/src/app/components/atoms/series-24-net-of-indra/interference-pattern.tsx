/**
 * ATOM 239: THE INTERFERENCE PATTERN ENGINE
 * ============================================
 * Series 24 — Net of Indra · Position 9
 *
 * When your frequency aligns with reality, waves amplify.
 * Fight it and they cancel. Tap in rhythm with the natural
 * oscillation to create constructive interference.
 *
 * PHYSICS:
 *   - Two circular wave sources on left and right of viewport
 *   - Left source oscillates at natural frequency (the "reality" wave)
 *   - Right source fires on each tap (the "you" wave)
 *   - Waves rendered as concentric rings from each source
 *   - Where waves meet: constructive interference → bright bands
 *   - Where waves oppose: destructive interference → dark bands
 *   - Rhythmic tapping (in-phase) creates standing wave → completion
 *   - Off-rhythm tapping creates chaotic cancellation
 *   - Interference field rendered as full-viewport pattern
 *   - Breath modulates natural frequency (calmer = slower)
 *
 * INTERACTION:
 *   Tap → fires wave from right source (timing matters)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static constructive interference pattern
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Natural oscillation period (frames) */
const NATURAL_PERIOD = 60;
/** Wave propagation speed */
const WAVE_SPEED = 0.006;
/** Wave decay rate */
const WAVE_DECAY = 0.008;
/** Max concurrent wave fronts per source */
const MAX_FRONTS = 8;
/** Source positions (fraction) */
const LEFT_SOURCE_X = 0.3;
const RIGHT_SOURCE_X = 0.7;
const SOURCE_Y = 0.5;
/** Source visual radius */
const SOURCE_R = 0.015;
/** Phase tolerance for "in sync" (fraction of period) */
const SYNC_TOLERANCE = 0.2;
/** In-sync taps needed for completion */
const SYNC_TAPS_NEEDED = 8;
/** Interference field resolution */
const FIELD_RES = 40;
/** Breath frequency modulation */
const BREATH_FREQ = 0.2;
/** Constructive band glow intensity */
const CONSTRUCTIVE_GLOW = 0.12;

// =====================================================================
// STATE TYPES
// =====================================================================

interface WaveFront {
  /** Radius (fraction of minDim) */
  radius: number;
  /** Amplitude 0-1 */
  amplitude: number;
  /** Source: 0 = left (natural), 1 = right (user) */
  source: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function InterferencePatternAtom({
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
    waveFronts: [] as WaveFront[],
    naturalPhase: 0,
    syncTaps: 0,
    consecutiveSync: 0,
    completed: false,
    stepNotified: false,
    completionGlow: 0,
    lastNaturalEmit: 0,
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
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.phase === 'resolve') { s.completed = true; s.completionGlow = 1; }

      // ── Reduced motion ──────────────────────────────────
      if (p.reducedMotion) {
        // Static interference pattern (constructive bands)
        for (let y = 0; y < FIELD_RES; y++) {
          for (let x = 0; x < FIELD_RES; x++) {
            const fx = x / FIELD_RES;
            const fy = y / FIELD_RES;
            const d1 = Math.sqrt(Math.pow(fx - LEFT_SOURCE_X, 2) + Math.pow(fy - SOURCE_Y, 2));
            const d2 = Math.sqrt(Math.pow(fx - RIGHT_SOURCE_X, 2) + Math.pow(fy - SOURCE_Y, 2));
            const interference = (Math.cos(d1 * 60) + Math.cos(d2 * 60)) * 0.5;
            if (interference > 0.3) {
              const cellW = w / FIELD_RES;
              const cellH = h / FIELD_RES;
              ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * interference * 0.08 * entrance);
              ctx.fillRect(fx * w, fy * h, cellW, cellH);
            }
          }
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ════════════════════════════════════════════════════
      // WAVE PHYSICS
      // ════════════════════════════════════════════════════
      const period = NATURAL_PERIOD * (1 + breath * BREATH_FREQ);
      s.naturalPhase = (s.naturalPhase + 1) % period;

      // Natural source auto-emits
      if (s.naturalPhase < 1 && s.waveFronts.filter(f => f.source === 0).length < MAX_FRONTS) {
        s.waveFronts.push({ radius: 0.01, amplitude: 1, source: 0 });
        s.lastNaturalEmit = s.frameCount;
      }

      // Update wave fronts
      for (let i = s.waveFronts.length - 1; i >= 0; i--) {
        const wf = s.waveFronts[i];
        wf.radius += WAVE_SPEED * ms;
        wf.amplitude -= WAVE_DECAY * ms;
        if (wf.amplitude <= 0) s.waveFronts.splice(i, 1);
      }

      // Completion
      if (s.syncTaps >= SYNC_TAPS_NEEDED * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.syncTaps >= SYNC_TAPS_NEEDED && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);
      }

      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : (s.syncTaps / SYNC_TAPS_NEEDED) * 0.5);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Interference field
      // ════════════════════════════════════════════════════
      const cellW = w / FIELD_RES;
      const cellH = h / FIELD_RES;

      for (let fy = 0; fy < FIELD_RES; fy++) {
        for (let fx = 0; fx < FIELD_RES; fx++) {
          const px2 = (fx + 0.5) / FIELD_RES;
          const py2 = (fy + 0.5) / FIELD_RES;

          let totalAmp = 0;
          for (const wf of s.waveFronts) {
            const srcX = wf.source === 0 ? LEFT_SOURCE_X : RIGHT_SOURCE_X;
            const dist = Math.sqrt(Math.pow(px2 - srcX, 2) + Math.pow(py2 - SOURCE_Y, 2));
            const waveDist = Math.abs(dist - wf.radius);
            if (waveDist < 0.03) {
              const waveVal = Math.cos(waveDist / 0.03 * Math.PI * 0.5) * wf.amplitude;
              totalAmp += waveVal;
            }
          }

          if (Math.abs(totalAmp) > 0.1) {
            const isConstructive = totalAmp > 0;
            const intensity = Math.min(1, Math.abs(totalAmp));
            const fieldColor = isConstructive ? s.primaryRgb : s.accentRgb;
            ctx.fillStyle = rgba(fieldColor, ALPHA.content.max * CONSTRUCTIVE_GLOW * intensity * entrance);
            ctx.fillRect(fx * cellW, fy * cellH, cellW, cellH);
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Wave front rings
      // ════════════════════════════════════════════════════
      for (const wf of s.waveFronts) {
        const srcX = (wf.source === 0 ? LEFT_SOURCE_X : RIGHT_SOURCE_X) * w;
        const srcY = SOURCE_Y * h;
        const ringR = px(wf.radius, minDim);
        const ringColor = wf.source === 0 ? s.primaryRgb : s.accentRgb;

        ctx.beginPath();
        ctx.arc(srcX, srcY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ALPHA.content.max * 0.1 * wf.amplitude * entrance);
        ctx.lineWidth = px(STROKE.thin + STROKE.hairline * wf.amplitude, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Source nodes
      // ════════════════════════════════════════════════════
      const sources = [
        { x: LEFT_SOURCE_X, label: 'natural', colorMix: 0 },
        { x: RIGHT_SOURCE_X, label: 'user', colorMix: 0.3 },
      ];

      for (const src of sources) {
        const sx = src.x * w;
        const sy = SOURCE_Y * h;
        const sR = px(SOURCE_R, minDim);
        const srcColor = lerpColor(s.primaryRgb, s.accentRgb, src.colorMix);

        // Source glow
        const sgR = sR * 4;
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sgR);
        sg.addColorStop(0, rgba(srcColor, ALPHA.glow.max * 0.1 * entrance));
        sg.addColorStop(0.3, rgba(srcColor, ALPHA.glow.max * 0.03 * entrance));
        sg.addColorStop(1, rgba(srcColor, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(sx - sgR, sy - sgR, sgR * 2, sgR * 2);

        // Source body
        const sGrad = ctx.createRadialGradient(sx - sR * 0.2, sy - sR * 0.2, sR * 0.1, sx, sy, sR);
        sGrad.addColorStop(0, rgba(lerpColor(srcColor, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.4 * entrance));
        sGrad.addColorStop(0.5, rgba(srcColor, ALPHA.content.max * 0.3 * entrance));
        sGrad.addColorStop(1, rgba(srcColor, ALPHA.content.max * 0.1 * entrance));
        ctx.beginPath();
        ctx.arc(sx, sy, sR, 0, Math.PI * 2);
        ctx.fillStyle = sGrad;
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.ellipse(sx - sR * 0.2, sy - sR * 0.25, sR * 0.3, sR * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Sync indicator
      // ════════════════════════════════════════════════════
      if (s.consecutiveSync > 0) {
        // Resonance line between sources
        const lineAlpha = Math.min(1, s.consecutiveSync / 3) * ALPHA.content.max * 0.08 * entrance;
        ctx.beginPath();
        ctx.moveTo(LEFT_SOURCE_X * w, SOURCE_Y * h);
        ctx.lineTo(RIGHT_SOURCE_X * w, SOURCE_Y * h);
        ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── Progress ───────────────────────────────────────
      if (!s.completed && s.syncTaps > 0) {
        const progR = px(SIZE.xs, minDim);
        const prog = s.syncTaps / SYNC_TAPS_NEEDED;
        ctx.beginPath();
        ctx.arc(cx, cy - px(0.38, minDim), progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Tap to emit user wave ───────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.waveFronts.filter(f => f.source === 1).length < MAX_FRONTS) {
        s.waveFronts.push({ radius: 0.01, amplitude: 1, source: 1 });
      }

      // Check if tap is in sync with natural rhythm
      const period = NATURAL_PERIOD * (1 + propsRef.current.breathAmplitude * BREATH_FREQ);
      const phaseFrac = s.naturalPhase / period;
      const inSync = phaseFrac < SYNC_TOLERANCE || phaseFrac > (1 - SYNC_TOLERANCE);

      if (inSync) {
        s.syncTaps++;
        s.consecutiveSync++;
        callbacksRef.current.onHaptic('tap');
      } else {
        s.consecutiveSync = 0;
        callbacksRef.current.onHaptic('error_boundary');
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
