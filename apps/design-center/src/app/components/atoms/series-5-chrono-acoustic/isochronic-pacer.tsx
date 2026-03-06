/**
 * ATOM 043: THE ISOCHRONIC PACER ENGINE (Neural Entrainment)
 * ===========================================================
 * Series 5 — Chrono-Acoustic · Position 3
 *
 * The anxious brain fires erratically. Isochronic tones —
 * regular, distinct beats of a single tone — naturally force
 * brainwaves to sync to a steady, predictable grid. This is
 * not meditation advice. This is physics.
 *
 * A central orb sits at the heart of the field, surrounded by
 * concentric timing rings. The orb pulses with metronomic
 * precision — perfectly timed via Web Audio API scheduling
 * (not setTimeout/setInterval, which are too imprecise for
 * neural entrainment).
 *
 * Each pulse:
 *   - The orb scales from rest to peak and back
 *   - A ring of light expands outward (timing wave)
 *   - A deep, subsonic haptic thud fires
 *   - An audio tone gates on/off (pure 90 Hz, 50ms duration)
 *
 * The peripheral field starts chaotic — scattered, erratic
 * particle noise representing the disordered neural state.
 * As the user holds the device and breathes with the rhythm,
 * the field gradually ENTRAINS: particles organise into
 * concentric rings synced to the beat. Order emerges from
 * chaos. The brain follows.
 *
 * TIMING:
 *   Default: 60 BPM (1 beat/sec) — resting heart rate target
 *   Uses AudioContext.currentTime for sub-millisecond precision
 *   Visual sync: canvas reads scheduled beat times
 *
 * 4-7-8 BREATH OVERLAY:
 *   A subtle outer arc indicates the breath cycle:
 *   - 4 beats inhale, 7 beats hold, 8 beats exhale
 *   - Total: 19 beats per cycle (~19 seconds)
 *
 * HAPTIC JOURNEY:
 *   Each beat → tap (metronomic precision)
 *   First breath cycle complete → step_advance
 *   Sustained entrainment (3 cycles) → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No expanding rings, static orb scale, dim particles
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const BPM = 60;
const BEAT_INTERVAL = 60 / BPM;      // seconds
const TONE_FREQ = 90;                 // Hz — deep, subsonic
const TONE_DURATION = 0.05;           // seconds
const TONE_GAIN = 0.08;               // Quiet
const ORB_BASE_FRAC = 0.06;          // Orb radius as fraction of minDim
const ORB_PULSE_SCALE = 1.3;         // Peak scale on beat
const PULSE_DECAY_FRAMES = 30;       // Frames for pulse to decay
const RING_WAVE_SPEED_FRAC = 0.005;  // Expanding ring speed as fraction of minDim
const RING_WAVE_LIFE = 120;          // frames
const PARTICLE_COUNT = 80;
/** 4-7-8 pattern */
const BREATH_INHALE = 4;
const BREATH_HOLD = 7;
const BREATH_EXHALE = 8;
const BREATH_CYCLE = BREATH_INHALE + BREATH_HOLD + BREATH_EXHALE; // 19 beats
const ENTRAINMENT_CYCLES = 3;        // Cycles for completion

// =====================================================================
// DATA
// =====================================================================

interface TimingRing {
  radius: number;
  life: number;
  maxLife: number;
}

interface EntrainMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Target orbital angle (set once entrained) */
  targetAngle: number;
  /** Target orbital radius */
  targetRadius: number;
  /** Entrainment level 0–1 */
  entrained: number;
  size: number;
  alpha: number;
  phase: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [4, 3, 5];
const ORB_CORE: RGB = [170, 150, 110];        // Warm metronomic gold
const ORB_GLOW: RGB = [150, 135, 100];        // Pulse glow
const RING_WAVE_COLOR: RGB = [120, 110, 90];  // Expanding timing wave
const MOTE_CHAOS: RGB = [80, 65, 70];         // Erratic neural noise
const MOTE_ENTRAINED: RGB = [130, 120, 100];  // Ordered, calm
const BREATH_ARC: RGB = [100, 95, 85];        // Breath cycle indicator
const LABEL_COLOR: RGB = [65, 60, 55];

// =====================================================================
// COMPONENT
// =====================================================================

export default function IsochronicPacerAtom({
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
  const nextBeatTimeRef = useRef(0);

  const stateRef = useRef({
    particles: [] as EntrainMote[],
    rings: [] as TimingRing[],
    beatCount: 0,
    beatPulse: 0,         // Frames since last beat (for visual pulse)
    breathBeat: 0,        // Beat within breath cycle (0–18)
    cyclesCompleted: 0,
    resolved: false,
    firstCycleFired: false,
    audioStarted: false,
    isHolding: false,
    // Entrainment builds while holding
    globalEntrainment: 0, // 0 = chaos, 1 = fully entrained
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

  // Cleanup audio
  useEffect(() => {
    return () => {
      try { audioCtxRef.current?.close(); } catch { /* */ }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2 = canvas.getContext('2d');
    if (!ctx2) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const orbBase = minDim * ORB_BASE_FRAC;

    // ── Audio helpers (inline) ──────────────────────────
    const ensureAudio = () => {
      const s = stateRef.current;
      if (s.audioStarted) return;
      try {
        const actx = new AudioContext();
        audioCtxRef.current = actx;
        nextBeatTimeRef.current = actx.currentTime + 0.1;
        s.audioStarted = true;
      } catch { /* no audio */ }
    };
    const scheduleTone = (time: number) => {
      const actx = audioCtxRef.current;
      if (!actx) return;
      try {
        const osc = actx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = TONE_FREQ;
        const gain = actx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(TONE_GAIN, time + 0.005);
        gain.gain.linearRampToValueAtTime(0, time + TONE_DURATION);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(time);
        osc.stop(time + TONE_DURATION + 0.01);
      } catch { /* */ }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.isHolding = true;
      ensureAudio();
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isHolding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * minDim * 0.004,
        vy: (Math.random() - 0.5) * minDim * 0.004,
        targetAngle: Math.random() * Math.PI * 2,
        targetRadius: minDim * (0.12 + Math.random() * 0.3),
        entrained: 0,
        size: 0.4 + Math.random() * 1.2,
        alpha: 0.02 + Math.random() * 0.04,
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

      ctx2.save();
      ctx2.scale(dpr, dpr);
      ctx2.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ────────────────────��─────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Beat scheduling (Web Audio precision) ─────────
      const audioCtx = audioCtxRef.current;
      if (audioCtx && s.audioStarted) {
        const now = audioCtx.currentTime;
        // Schedule beats ahead (look-ahead window = 0.1s)
        while (nextBeatTimeRef.current < now + 0.1) {
          scheduleTone(nextBeatTimeRef.current);
          nextBeatTimeRef.current += BEAT_INTERVAL;
        }

        // Check if a beat just happened (within last frame, ~16ms)
        const timeSinceLastBeat = (now - (nextBeatTimeRef.current - BEAT_INTERVAL));
        if (timeSinceLastBeat >= 0 && timeSinceLastBeat < 0.02 && s.beatPulse > 5) {
          // BEAT!
          s.beatPulse = 0;
          s.beatCount++;
          s.breathBeat = (s.breathBeat + 1) % BREATH_CYCLE;
          cb.onHaptic('tap');

          // Add expanding ring
          if (!p.reducedMotion) {
            s.rings.push({
              radius: orbBase,
              life: RING_WAVE_LIFE,
              maxLife: RING_WAVE_LIFE,
            });
          }

          // Breath cycle tracking
          if (s.breathBeat === 0) {
            s.cyclesCompleted++;
            if (!s.firstCycleFired && s.cyclesCompleted >= 1) {
              s.firstCycleFired = true;
              cb.onHaptic('step_advance');
            }
            if (s.cyclesCompleted >= ENTRAINMENT_CYCLES && !s.resolved) {
              s.resolved = true;
              cb.onHaptic('completion');
              cb.onResolve?.();
            }
          }
        }
      }

      s.beatPulse++;

      // ── Entrainment (builds while holding) ────────────
      if (s.isHolding) {
        s.globalEntrainment = Math.min(1, s.globalEntrainment + (p.reducedMotion ? 0.003 : 0.0008));
      } else {
        s.globalEntrainment = Math.max(0, s.globalEntrainment - 0.0003);
      }

      // Particles entrain gradually
      for (const mote of s.particles) {
        mote.entrained = Math.min(1, mote.entrained +
          (s.globalEntrainment > mote.entrained ? 0.002 : -0.001));
      }

      cb.onStateChange?.(s.globalEntrainment);

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ════════════════════════════════════════════════���═

      const bgColor = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx2.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx2.fillStyle = bgGrad;
      ctx2.fillRect(0, 0, w, h);

      // ══════════════════════════════════════════════════
      // EXPANDING TIMING RINGS
      // ══════════════════════════════════════════════════

      for (let i = s.rings.length - 1; i >= 0; i--) {
        const ring = s.rings[i];
        ring.radius += RING_WAVE_SPEED_FRAC * minDim;
        ring.life--;
        if (ring.life <= 0) {
          s.rings.splice(i, 1);
          continue;
        }

        const lifeFrac = ring.life / ring.maxLife;
        const ringColor = lerpColor(RING_WAVE_COLOR, s.primaryRgb, 0.06);
        const ringAlpha = lifeFrac * lifeFrac * 0.03 * entrance;

        ctx2.beginPath();
        ctx2.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx2.strokeStyle = rgba(ringColor, ringAlpha);
        ctx2.lineWidth = minDim * 0.0008;
        ctx2.stroke();
      }

      // ══════════════════════════════════════════════════
      // PARTICLES
      // ══════════════════════════════════════════════════

      for (const mote of s.particles) {
        if (!p.reducedMotion) {
          // Chaotic drift (fades with entrainment)
          const chaosScale = 1 - mote.entrained;
          mote.vx += (Math.random() - 0.5) * 0.08 * chaosScale;
          mote.vy += (Math.random() - 0.5) * 0.08 * chaosScale;
          mote.vx *= 0.97;
          mote.vy *= 0.97;

          // Orbital pull (grows with entrainment)
          if (mote.entrained > 0.1) {
            const targetX = cx + Math.cos(mote.targetAngle) * mote.targetRadius;
            const targetY = cy + Math.sin(mote.targetAngle) * mote.targetRadius;
            const pull = mote.entrained * 0.01;
            mote.vx += (targetX - mote.x) * pull;
            mote.vy += (targetY - mote.y) * pull;
            // Slow orbital rotation
            mote.targetAngle += 0.001 * mote.entrained;
          }

          mote.x += mote.vx;
          mote.y += mote.vy;

          // Wrap
          if (mote.x < -15) mote.x = w + 15;
          if (mote.x > w + 15) mote.x = -15;
          if (mote.y < -15) mote.y = h + 15;
          if (mote.y > h + 15) mote.y = -15;
        }

        const shimmer = p.reducedMotion ? 0.5 :
          0.4 + 0.6 * Math.sin(s.frameCount * 0.02 + mote.phase);
        const mColor = lerpColor(
          lerpColor(MOTE_CHAOS, s.primaryRgb, 0.04),
          lerpColor(MOTE_ENTRAINED, s.accentRgb, 0.06),
          mote.entrained,
        );
        const mAlpha = mote.alpha * shimmer * entrance;

        ctx2.beginPath();
        ctx2.arc(mote.x, mote.y, mote.size * 0.3, 0, Math.PI * 2);
        ctx2.fillStyle = rgba(mColor, mAlpha);
        ctx2.fill();
      }

      // ══════════════════════════════════════════════════
      // THE ORB (metronomic center)
      // ══════════════════════════════════════════════════

      // Pulse: peaks at beat, decays over PULSE_DECAY_FRAMES
      const pulseFrac = Math.max(0, 1 - s.beatPulse / PULSE_DECAY_FRAMES);
      const pulseEase = p.reducedMotion ? 0 : pulseFrac * pulseFrac;
      const orbScale = 1 + (ORB_PULSE_SCALE - 1) * pulseEase;
      const orbR = orbBase * orbScale;

      // Orb glow
      const glowR = orbR * 3;
      const glowColor = lerpColor(ORB_GLOW, s.accentRgb, 0.08);
      const glowAlpha = (0.01 + pulseEase * 0.025) * entrance;
      const glowGrad = ctx2.createRadialGradient(cx, cy, orbR * 0.3, cx, cy, glowR);
      glowGrad.addColorStop(0, rgba(glowColor, glowAlpha));
      glowGrad.addColorStop(0.3, rgba(glowColor, glowAlpha * 0.3));
      glowGrad.addColorStop(1, rgba(glowColor, 0));
      ctx2.fillStyle = glowGrad;
      ctx2.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      // Orb body
      const orbBodyGrad = ctx2.createRadialGradient(
        cx - orbR * 0.15, cy - orbR * 0.15, orbR * 0.05,
        cx, cy, orbR,
      );
      const orbCoreColor = lerpColor(ORB_CORE, s.accentRgb, 0.06);
      const orbAlpha = (0.1 + pulseEase * 0.12) * entrance;
      orbBodyGrad.addColorStop(0, rgba(orbCoreColor, orbAlpha));
      orbBodyGrad.addColorStop(0.5, rgba(orbCoreColor, orbAlpha * 0.5));
      orbBodyGrad.addColorStop(1, rgba(orbCoreColor, orbAlpha * 0.1));

      ctx2.beginPath();
      ctx2.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx2.fillStyle = orbBodyGrad;
      ctx2.fill();

      // Orb edge
      ctx2.strokeStyle = rgba(orbCoreColor, orbAlpha * 0.3);
      ctx2.lineWidth = minDim * 0.0008;
      ctx2.stroke();

      // ══════════════════════════════════════════════════
      // 4-7-8 BREATH ARC
      // ════���═════════════════════════════════════════════

      const breathArcR = minDim * 0.28;
      const breathColor = lerpColor(BREATH_ARC, s.primaryRgb, 0.06);

      // Background arc (full circle, very dim)
      ctx2.beginPath();
      ctx2.arc(cx, cy, breathArcR, 0, Math.PI * 2);
      ctx2.strokeStyle = rgba(breathColor, 0.012 * entrance);
      ctx2.lineWidth = minDim * 0.003;
      ctx2.stroke();

      // Current position in breath cycle
      if (s.beatCount > 0) {
        const beatInCycle = s.breathBeat;
        const totalBeats = BREATH_CYCLE;
        const progressAngle = (beatInCycle / totalBeats) * Math.PI * 2 - Math.PI / 2;

        // Phase sections
        const inhaleEnd = (BREATH_INHALE / totalBeats) * Math.PI * 2 - Math.PI / 2;
        const holdEnd = ((BREATH_INHALE + BREATH_HOLD) / totalBeats) * Math.PI * 2 - Math.PI / 2;

        // Determine current phase for color/intensity
        let phaseAlpha = 0.04;
        if (beatInCycle < BREATH_INHALE) {
          phaseAlpha = 0.05; // Inhale — slightly brighter
        } else if (beatInCycle < BREATH_INHALE + BREATH_HOLD) {
          phaseAlpha = 0.03; // Hold — dimmer, still
        } else {
          phaseAlpha = 0.04; // Exhale — medium
        }

        // Progress arc
        ctx2.beginPath();
        ctx2.arc(cx, cy, breathArcR, -Math.PI / 2, progressAngle);
        ctx2.strokeStyle = rgba(
          lerpColor(breathColor, s.accentRgb, 0.06),
          phaseAlpha * entrance,
        );
        ctx2.lineWidth = minDim * 0.004;
        ctx2.lineCap = 'round';
        ctx2.stroke();

        // Phase divider marks (subtle ticks)
        const tickLen = minDim * 0.008;
        for (const divAngle of [inhaleEnd, holdEnd]) {
          const tx1 = cx + Math.cos(divAngle) * (breathArcR - tickLen);
          const ty1 = cy + Math.sin(divAngle) * (breathArcR - tickLen);
          const tx2 = cx + Math.cos(divAngle) * (breathArcR + tickLen);
          const ty2 = cy + Math.sin(divAngle) * (breathArcR + tickLen);
          ctx2.beginPath();
          ctx2.moveTo(tx1, ty1);
          ctx2.lineTo(tx2, ty2);
          ctx2.strokeStyle = rgba(breathColor, 0.025 * entrance);
          ctx2.lineWidth = minDim * 0.0008;
          ctx2.lineCap = 'butt';
          ctx2.stroke();
        }
      }

      ctx2.restore();
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