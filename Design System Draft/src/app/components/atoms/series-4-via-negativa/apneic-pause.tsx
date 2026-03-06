/**
 * ATOM 037: THE APNEIC PAUSE ENGINE (The Breath Hold)
 * ====================================================
 * Series 4 — Via Negativa · Position 7
 *
 * Most breathwork focuses on the inhale and exhale. This atom
 * focuses entirely on the cessation of movement — the absolute
 * stillness at the bottom of the exhale where true wisdom lives.
 *
 * A luminous orb breathes with the breath engine — expanding on
 * inhale, contracting on exhale. Around it, ambient particles
 * drift, background hue pulses, concentric rings breathe in
 * sympathy. Everything alive. Everything moving.
 *
 * Then the user holds. And everything stops.
 *
 * The orb freezes at its current size. Particles suspend mid-
 * flight — zero velocity, zero acceleration. The background
 * pulse flatlines. Rings lock. Haptics vanish. The app plays
 * dead. This is the apneic pause — the gap between exhale and
 * inhale where the nervous system meets absolute zero.
 *
 * The longer the hold, the deeper the state. A barely-visible
 * duration counter (faint serif numerals) marks the seconds
 * of perfect stillness. Release → everything slowly, gently
 * resumes. But the memory of the pause lingers.
 *
 * PHYSICS:
 *   - Orb radius = f(breathAmplitude) with gentle easing
 *   - 40 ambient particles with slow drift
 *   - 4 concentric rings that pulse with breath
 *   - On hold: ALL velocities → 0, all oscillations freeze
 *   - Frame counter pauses — animations literally stop
 *   - Faint duration counter in seconds (0.1s precision)
 *   - Release: resume with slow ramp (not instant)
 *
 * HAPTIC JOURNEY:
 *   Hold → hold_start (then total silence)
 *   Hold > 3s → breath_peak (one pulse proving life)
 *   Release → hold_release (gentle resumption)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static orb, no particles, instant freeze
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PARTICLE_COUNT = 40;
const RING_COUNT = 4;
const ORB_BASE_RADIUS_FRAC = 0.1;
const ORB_BREATH_RANGE = 0.04;
const PARTICLE_DRIFT = 0.12;
/** Frames to ramp animations back after release */
const RESUME_RAMP_FRAMES = 120;
/** Seconds of hold before breath_peak haptic */
const DEEP_HOLD_THRESHOLD = 3;

// =====================================================================
// DATA
// =====================================================================

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette — alive but quiet
const BG_VOID: RGB = [5, 5, 7];
const ORB_CORE: RGB = [140, 130, 120];
const ORB_GLOW: RGB = [170, 155, 140];
const ORB_EDGE: RGB = [100, 95, 88];
const RING_COLOR: RGB = [80, 75, 70];
const MOTE_COLOR: RGB = [90, 85, 78];
const COUNTER_COLOR: RGB = [100, 95, 90];

// =====================================================================
// COMPONENT
// =====================================================================

export default function ApneicPauseAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; },
    [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    motes: [] as Mote[],
    isHolding: false,
    holdStartTime: 0,
    holdStartFired: false,
    deepHoldFired: false,
    // Frozen state
    frozenBreath: 0,
    frozenFrame: 0,
    // Resume ramp
    resumeProgress: 1, // 1 = fully alive, ramps from 0 on release
    // Animation time (pauses when holding)
    animTime: 0,
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
    const cy = h / 2;
    const orbBase = minDim * ORB_BASE_RADIUS_FRAC;

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isHolding = true;
      s.holdStartTime = Date.now();
      s.frozenBreath = propsRef.current.breathAmplitude;
      s.frozenFrame = s.animTime;
      s.deepHoldFired = false;
      if (!s.holdStartFired) {
        s.holdStartFired = true;
      }
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isHolding = false;
      s.holdStartFired = false;
      s.resumeProgress = 0;
      cbRef.current.onHaptic('hold_release');
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.motes = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * PARTICLE_DRIFT,
        vy: (Math.random() - 0.5) * PARTICLE_DRIFT,
        size: 0.3 + Math.random() * 1,
        alpha: 0.01 + Math.random() * 0.04,
        phase: Math.random() * Math.PI * 2,
      }));
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

      // ── Hold logic ────────────────────────────────────
      let liveness: number; // 0 = frozen, 1 = fully alive

      if (s.isHolding) {
        liveness = 0;
        const holdDuration = (Date.now() - s.holdStartTime) / 1000;

        // Deep hold haptic
        if (holdDuration >= DEEP_HOLD_THRESHOLD && !s.deepHoldFired) {
          s.deepHoldFired = true;
          cb.onHaptic('breath_peak');
        }

        // State = hold duration normalized (longer = deeper, cap at 30s)
        cb.onStateChange?.(Math.min(1, holdDuration / 30));
      } else {
        // Resume ramp
        if (s.resumeProgress < 1) {
          s.resumeProgress = Math.min(1, s.resumeProgress + 1 / RESUME_RAMP_FRAMES);
        }
        liveness = easeOutExpo(s.resumeProgress);
        cb.onStateChange?.(0);
      }

      // ── Animation time (pauses when holding) ──────────
      if (!s.isHolding && !p.reducedMotion) {
        s.animTime += liveness;
      }
      const t = s.isHolding ? s.frozenFrame : s.animTime;

      // ── Breath value (freezes when holding) ───────────
      const breath = s.isHolding ? s.frozenBreath :
        s.frozenBreath + (p.breathAmplitude - s.frozenBreath) * liveness;

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ══════════════════════════════════════════════════

      const bgPulse = p.reducedMotion ? 0 : Math.sin(t * 0.008) * 0.003 * liveness;
      const bgColor = lerpColor(BG_VOID, s.primaryRgb, 0.005 + bgPulse);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ══════════════════════════════════════════════════
      // CONCENTRIC RINGS (breathe with orb)
      // ══════════════════════════════════════════════════

      for (let i = 0; i < RING_COUNT; i++) {
        const ringBase = orbBase * (2 + i * 0.8);
        const ringBreath = p.reducedMotion ? 0 :
          Math.sin(t * 0.006 + i * 0.5) * orbBase * 0.06 * liveness;
        const ringR = ringBase + breath * orbBase * 0.3 + ringBreath;
        const ringAlpha = (0.012 - i * 0.002) * entrance;
        const ringColor = lerpColor(RING_COLOR, s.primaryRgb, 0.06 + i * 0.01);

        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ringAlpha);
        ctx.lineWidth = minDim * (0.0006 + (1 - liveness) * 0.0002); // Slightly thicker when frozen
        ctx.stroke();
      }

      // ══════════════════════════════════════════════════
      // AMBIENT MOTES
      // ══════════════════════════════════════════════════

      for (const m of s.motes) {
        // Only drift when alive
        if (liveness > 0.01 && !p.reducedMotion) {
          m.x += m.vx * liveness;
          m.y += m.vy * liveness;
          m.vx += (Math.random() - 0.5) * 0.003 * liveness;
          m.vy += (Math.random() - 0.5) * 0.003 * liveness;
          m.vx *= 0.995;
          m.vy *= 0.995;

          // Soft wrap
          if (m.x < -10) m.x = w + 10;
          if (m.x > w + 10) m.x = -10;
          if (m.y < -10) m.y = h + 10;
          if (m.y > h + 10) m.y = -10;
        }

        const shimmer = p.reducedMotion ? 0.6 :
          0.4 + 0.6 * Math.sin(t * 0.015 + m.phase) * liveness +
          (1 - liveness) * 0.5; // Dim but visible when frozen

        const mColor = lerpColor(MOTE_COLOR, s.primaryRgb, 0.05);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(mColor, m.alpha * shimmer * entrance);
        ctx.fill();
      }

      // ══════════════════════════════════════════════════
      // THE ORB
      // ═════════════════════════════════════════════════

      const orbR = orbBase + breath * orbBase * ORB_BREATH_RANGE * 10;

      // Outer glow
      const glowR = orbR * 2.5;
      const glowColor = lerpColor(ORB_GLOW, s.accentRgb, 0.08);
      const glowAlpha = (0.015 + breath * 0.005) * entrance;
      const glowGrad = ctx.createRadialGradient(cx, cy, orbR * 0.5, cx, cy, glowR);
      glowGrad.addColorStop(0, rgba(glowColor, glowAlpha));
      glowGrad.addColorStop(0.4, rgba(glowColor, glowAlpha * 0.2));
      glowGrad.addColorStop(1, rgba(glowColor, 0));
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      // Orb body
      const bodyGrad = ctx.createRadialGradient(
        cx - orbR * 0.15, cy - orbR * 0.15, orbR * 0.05,
        cx, cy, orbR,
      );
      const coreColor = lerpColor(ORB_CORE, s.accentRgb, 0.06);
      const edgeColor = lerpColor(ORB_EDGE, s.primaryRgb, 0.08);
      bodyGrad.addColorStop(0, rgba(coreColor, 0.12 * entrance));
      bodyGrad.addColorStop(0.5, rgba(coreColor, 0.06 * entrance));
      bodyGrad.addColorStop(0.85, rgba(edgeColor, 0.03 * entrance));
      bodyGrad.addColorStop(1, rgba(edgeColor, 0));

      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Orb edge
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(edgeColor, 0.04 * entrance);
      ctx.lineWidth = minDim * (0.0006 + (1 - liveness) * 0.0002); // Slightly thicker when frozen
      ctx.stroke();

      // ══════════════════════��═══════════════════════════
      // HOLD DURATION COUNTER (visible only when holding)
      // ═════════════════════════════════════════════════

      if (s.isHolding) {
        const holdSec = (Date.now() - s.holdStartTime) / 1000;
        const counterText = holdSec.toFixed(1);
        const counterAlpha = Math.min(0.06, holdSec * 0.01); // Fades in slowly
        const counterColor = lerpColor(COUNTER_COLOR, s.primaryRgb, 0.06);
        const fontSize = Math.round(minDim * 0.025);
        ctx.font = `300 ${fontSize}px Georgia, "Times New Roman", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(counterColor, counterAlpha * entrance);
        ctx.fillText(counterText, cx, cy + orbR + minDim * 0.06);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

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