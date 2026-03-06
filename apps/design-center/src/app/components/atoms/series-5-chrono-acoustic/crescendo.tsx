/**
 * ATOM 048: THE CRESCENDO ENGINE (Tension & Release)
 * ====================================================
 * Series 5 — Chrono-Acoustic · Position 8
 *
 * Suppressing an emotion just stores it. Pressure with no
 * valve eventually explodes. This atom provides a safe,
 * structured container for the user to build an emotion to
 * its absolute maximum peak — and then experience the
 * cathartic, breathtaking release.
 *
 * LONG PRESS. That's the interaction. The user presses and
 * HOLDS. As they hold:
 *   - Particles converge inward from the edges (gathering)
 *   - The canvas trembles (shake amplitude grows exponentially)
 *   - Colour intensifies from cool darkness to searing warmth
 *   - An audio tone swells (exponential gain curve)
 *   - Haptic intensity escalates
 *
 * The buildup follows an ease-in (exponential) curve — slow at
 * first, then ACCELERATING. The last 10% is almost unbearable.
 * When the user reaches the breaking point and RELEASES:
 *
 *   - INSTANT silence. Zero audio.
 *   - All particles BURST outward in a radial explosion
 *   - The screen washes to near-black
 *   - A single, soft, beautiful echo tone rings out
 *   - The field settles into serene emptiness
 *   - Completion.
 *
 * If the user releases early, the buildup decays — no judgement.
 * They can try again. The crescendo waits.
 *
 * HAPTIC: hold_start → escalating taps → completion on release at peak
 * RENDER: Canvas 2D
 * REDUCED MOTION: No shake, slower particle convergence
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo as easeOut, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PARTICLE_COUNT = 100;
const PEAK_THRESHOLD = 0.92;    // Release above this = completion
const BUILD_RATE = 0.002;       // Per frame during hold
const DECAY_RATE = 0.006;       // Per frame when released
const SHAKE_MAX_FRAC = 0.015;   // Max canvas shake as fraction of minDim
const BURST_SPEED_FRAC = 0.015; // px/frame outward as fraction of minDim
const ECHO_FRAMES = 180;        // Echo ring duration

const BG: RGB = [4, 4, 5];
const PARTICLE_DIM: RGB = [70, 60, 65];
const PARTICLE_HOT: RGB = [180, 100, 70];
const CORE_DIM: RGB = [80, 70, 75];
const CORE_HOT: RGB = [220, 160, 100];
const ECHO_COLOR: RGB = [150, 145, 120];
const LABEL: RGB = [65, 60, 55];

interface CrescMote {
  // Home position (edge)
  homeX: number; homeY: number;
  // Current
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  phase: number;
  burst: boolean;
}

// =====================================================================
// AUDIO
// =====================================================================

function createBuildOsc(ctx: AudioContext): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = 80;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  return { osc, gain };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function CrescendoAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const buildOscRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);
  const echoOscRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const stateRef = useRef({
    particles: [] as CrescMote[],
    intensity: 0,           // 0–1 buildup
    isHolding: false,
    holdFired: false,
    released: false,        // Has the user released at peak?
    resolved: false,
    burstFrame: -1,         // Frame when burst happened
    echoFrame: -1,
    audioStarted: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
  });
  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    return () => {
      try { buildOscRef.current?.osc.stop(); echoOscRef.current?.osc.stop(); audioCtxRef.current?.close(); } catch { /* */ }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = viewport.width, h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2, cy = h / 2;
    const maxGatherR = minDim * 0.5;

    if (!s.initialized) {
      s.particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = maxGatherR * (0.7 + Math.random() * 0.3);
        const hx = cx + Math.cos(angle) * dist;
        const hy = cy + Math.sin(angle) * dist;
        return {
          homeX: hx, homeY: hy,
          x: hx, y: hy,
          vx: 0, vy: 0,
          size: 0.4 + Math.random() * 1.6,
          alpha: 0.02 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
          burst: false,
        };
      });
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save();
      ctx.scale(dpr, dpr);
      s.frameCount++;

      // Entrance
      if (s.entranceProgress < 1) {
        s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      }
      const ent = easeOut(s.entranceProgress);

      // Intensity dynamics
      if (s.isHolding && !s.resolved) {
        // Exponential buildup (ease-in)
        const rate = BUILD_RATE * (1 + s.intensity * 3);
        s.intensity = Math.min(1, s.intensity + rate);
      } else if (!s.resolved) {
        s.intensity = Math.max(0, s.intensity - DECAY_RATE);
      }

      // Audio gain follows intensity
      if (buildOscRef.current && !s.resolved) {
        const gain = Math.pow(s.intensity, 3) * 0.08;
        buildOscRef.current.gain.gain.value = gain;
        buildOscRef.current.osc.frequency.value = 80 + s.intensity * 200;
      }

      cb.onStateChange?.(s.intensity);

      // Shake
      const shakeAmt = p.reducedMotion ? 0 : Math.pow(s.intensity, 3) * SHAKE_MAX_FRAC * minDim;
      const shakeX = s.resolved ? 0 : (Math.random() - 0.5) * shakeAmt * 2;
      const shakeY = s.resolved ? 0 : (Math.random() - 0.5) * shakeAmt * 2;

      ctx.translate(shakeX, shakeY);
      ctx.clearRect(-shakeAmt, -shakeAmt, w + shakeAmt * 2, h + shakeAmt * 2);

      // ── Background ─────────────────────────────────────
      const bg = lerpColor(BG, s.primaryRgb, 0.005);
      const bgIntense = lerpColor(bg, [20, 10, 8], s.intensity * 0.3);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(s.resolved ? bg : bgIntense, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-10, -10, w + 20, h + 20);

      // ── Particles ──────────────────────────────────────
      const pColor = lerpColor(
        lerpColor(PARTICLE_DIM, s.primaryRgb, 0.04),
        lerpColor(PARTICLE_HOT, s.accentRgb, 0.06),
        s.intensity,
      );

      for (const mote of s.particles) {
        if (mote.burst) {
          // Burst outward
          mote.x += mote.vx;
          mote.y += mote.vy;
          mote.vx *= 0.97;
          mote.vy *= 0.97;
          mote.alpha *= 0.985;
        } else if (!s.resolved) {
          // Converge toward center with intensity
          const targetX = cx + (mote.homeX - cx) * (1 - s.intensity * 0.85);
          const targetY = cy + (mote.homeY - cy) * (1 - s.intensity * 0.85);
          const lerpRate = p.reducedMotion ? 0.03 : 0.015;
          mote.x += (targetX - mote.x) * lerpRate;
          mote.y += (targetY - mote.y) * lerpRate;
          // Jitter increases with intensity
          if (!p.reducedMotion) {
            mote.x += (Math.random() - 0.5) * s.intensity * 2;
            mote.y += (Math.random() - 0.5) * s.intensity * 2;
          }
        }

        const shimmer = p.reducedMotion ? 0.6 : 0.4 + 0.6 * Math.sin(s.frameCount * 0.03 + mote.phase);
        const mAlpha = mote.alpha * shimmer * ent * (0.5 + s.intensity * 0.5);
        if (mAlpha < 0.002) continue;

        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size * (0.3 + s.intensity * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, mAlpha);
        ctx.fill();
      }

      // ── Core glow ──────────────────────────────────────
      if (!s.resolved || s.frameCount - s.burstFrame < 10) {
        const coreColor = lerpColor(
          lerpColor(CORE_DIM, s.primaryRgb, 0.04),
          lerpColor(CORE_HOT, s.accentRgb, 0.08),
          s.intensity,
        );
        const coreR = minDim * (0.02 + s.intensity * 0.06);
        const coreAlpha = (0.03 + Math.pow(s.intensity, 2) * 0.15) * ent;
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
        coreGrad.addColorStop(0, rgba(coreColor, coreAlpha));
        coreGrad.addColorStop(0.3, rgba(coreColor, coreAlpha * 0.3));
        coreGrad.addColorStop(1, rgba(coreColor, 0));
        ctx.fillStyle = coreGrad;
        ctx.fillRect(cx - coreR * 3, cy - coreR * 3, coreR * 6, coreR * 6);
      }

      // ── Echo ring (post-release) ───────────────────────
      if (s.echoFrame > 0) {
        const elapsed = s.frameCount - s.echoFrame;
        if (elapsed < ECHO_FRAMES) {
          const t = elapsed / ECHO_FRAMES;
          const echoR = minDim * 0.05 + t * minDim * 0.4;
          const echoAlpha = (1 - t) * (1 - t) * 0.06 * ent;
          const echoCol = lerpColor(ECHO_COLOR, s.accentRgb, 0.08);
          ctx.beginPath();
          ctx.arc(cx, cy, echoR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(echoCol, echoAlpha);
          ctx.lineWidth = minDim * (0.0012 + (1 - t) * 0.002);
          ctx.stroke();
        }
      }

      // ── Label ──────────────────────────────────────────
      if (!s.resolved && s.intensity < 0.1 && s.frameCount > 90 && s.frameCount < 400) {
        const lbl = lerpColor(LABEL, s.primaryRgb, 0.04);
        const hAlpha = Math.min(0.03, (s.frameCount - 90) / 400 * 0.03) * ent;
        const fs = Math.round(minDim * 0.015);
        ctx.font = `300 ${fs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(lbl, hAlpha);
        ctx.fillText('press and hold', cx, cy + minDim * 0.3);
      }

      ctx.restore();
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
        buildOscRef.current = createBuildOsc(actx);
        s.audioStarted = true;
      } catch { /* */ }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.resolved) return;
      s.isHolding = true;
      if (!s.holdFired) { s.holdFired = true; cbRef.current.onHaptic('hold_start'); }
      ensureAudio();
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isHolding = false;
      s.holdFired = false;
      if (s.intensity >= PEAK_THRESHOLD && !s.resolved) {
        s.resolved = true;
        s.released = true;
        s.burstFrame = s.frameCount;
        s.echoFrame = s.frameCount;
        for (const p of s.particles) {
          const dx = p.x - w / 2;
          const dy = p.y - h / 2;
          const dist = Math.hypot(dx, dy) || 1;
          p.vx = (dx / dist) * BURST_SPEED_FRAC * minDim * (0.5 + Math.random());
          p.vy = (dy / dist) * BURST_SPEED_FRAC * minDim * (0.5 + Math.random());
          p.burst = true;
        }
        if (buildOscRef.current) buildOscRef.current.gain.gain.value = 0;
        if (audioCtxRef.current) {
          try {
            const actx = audioCtxRef.current;
            const osc = actx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 440;
            const gain = actx.createGain();
            gain.gain.value = 0.06;
            gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 3);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start();
            osc.stop(actx.currentTime + 3.1);
            echoOscRef.current = { osc, gain };
          } catch { /* */ }
        }
        cbRef.current.onHaptic('completion');
        cbRef.current.onResolve?.();
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }}
      />
    </div>
  );
}