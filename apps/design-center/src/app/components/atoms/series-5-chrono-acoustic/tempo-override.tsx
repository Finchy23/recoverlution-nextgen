/**
 * ATOM 047: THE TEMPO OVERRIDE ENGINE (Kinetic Rhythm)
 * =====================================================
 * Series 5 — Chrono-Acoustic · Position 7
 *
 * The conscious mind is too slow to interrupt a panic attack.
 * But the body can intercept it through rhythm. When the
 * world speeds up, you slow down — physically, kinetically,
 * undeniably — and the world has no choice but to follow.
 *
 * The screen starts FRANTIC: concentric pulse rings expanding
 * outward at 140 BPM (tachycardia tempo). Everything throbs
 * too fast. Too much. Panic frequency.
 *
 * The user taps. Each tap registers. The engine detects the
 * inter-tap interval and computes the user's BPM. If the
 * user taps slower — 80, 70, 60 BPM — the environment begins
 * to DRAG. The frantic rings decelerate. The colour cools.
 * The pulse deepens. The user's rhythm becomes dominant.
 *
 * The physics: exponential weighted moving average of tap
 * intervals, with momentum. The environment BPM lerps toward
 * the user's BPM, but with inertia — you have to COMMIT to
 * your slower rhythm for the world to believe you.
 *
 * At rest-rate lock (≤65 BPM): the frantic assault becomes a
 * single, deep, sovereign heartbeat. Completion.
 *
 * HAPTIC: Each tap → tap; BPM within 10 of target → step_advance;
 *         Lock at rest rate → completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No expanding rings, static pulse indicator
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo as easeOut, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const PANIC_BPM = 140;
const REST_BPM = 60;
const LOCK_THRESHOLD = 65;      // BPM ≤ this = locked
const NEAR_THRESHOLD = 75;      // BPM ≤ this = step_advance
const ENV_LERP_RATE = 0.008;    // Environment BPM catch-up per frame
const MAX_RINGS = 12;
const RING_EXPAND_FRAC = 0.006; // Ring expand speed as fraction of minDim at 60 BPM
const TAP_HISTORY = 6;          // Taps to average
const BPM_DECAY_RATE = 0.3;     // BPM/frame drift back toward panic when not tapping

const BG: RGB = [5, 4, 6];
const RING_PANIC: RGB = [140, 65, 65];
const RING_CALM: RGB = [130, 125, 100];
const CORE_PANIC: RGB = [160, 70, 70];
const CORE_CALM: RGB = [160, 150, 115];
const LABEL: RGB = [70, 65, 60];

interface PulseRing { radius: number; birth: number; }

export default function TempoOverrideAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    envBpm: PANIC_BPM,
    userBpm: -1,
    tapTimes: [] as number[],
    rings: [] as PulseRing[],
    lastBeatTime: 0,
    coreScale: 1,
    nearFired: false,
    resolved: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
  });
  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = viewport.width, h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2, cy = h / 2;
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // Entrance
      if (s.entranceProgress < 1) {
        s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      }
      const ent = easeOut(s.entranceProgress);

      // Environment BPM dynamics
      if (s.userBpm > 0) {
        // Lerp env toward user BPM (with inertia)
        s.envBpm += (s.userBpm - s.envBpm) * ENV_LERP_RATE;
      } else {
        // Drift back toward panic if no tapping
        s.envBpm = Math.min(PANIC_BPM, s.envBpm + BPM_DECAY_RATE * 0.05);
      }
      // Decay user BPM memory if no recent taps
      const now = performance.now();
      if (s.tapTimes.length > 0 && now - s.tapTimes[s.tapTimes.length - 1] > 3000) {
        s.userBpm = -1;
        s.tapTimes = [];
        // Slow drift back to panic
        s.envBpm = Math.min(PANIC_BPM, s.envBpm + BPM_DECAY_RATE);
      }

      // Calm metric 0–1
      const calm = Math.max(0, Math.min(1, 1 - (s.envBpm - REST_BPM) / (PANIC_BPM - REST_BPM)));

      // Haptics
      if (s.envBpm <= NEAR_THRESHOLD && !s.nearFired) {
        s.nearFired = true;
        cb.onHaptic('step_advance');
      }
      if (s.envBpm > NEAR_THRESHOLD + 5) s.nearFired = false;
      if (s.envBpm <= LOCK_THRESHOLD && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }
      cb.onStateChange?.(calm);

      // Beat timing
      const beatInterval = 60 / s.envBpm; // seconds
      const timeSec = s.frameCount / 60; // approximate
      if (timeSec - s.lastBeatTime >= beatInterval) {
        s.lastBeatTime = timeSec;
        if (!p.reducedMotion) s.coreScale = 1.4;
        // Spawn ring
        if (!p.reducedMotion && s.rings.length < MAX_RINGS) {
          s.rings.push({ radius: minDim * 0.03, birth: s.frameCount });
        }
      }

      // Core pulse decay (gated by reducedMotion)
      if (!p.reducedMotion) {
        s.coreScale += (1 - s.coreScale) * 0.08;
      } else {
        s.coreScale = 1;
      }

      // ── Background ─────────────────────────────────────
      const bg = lerpColor(BG, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Central glow
      const glowColor = lerpColor(
        lerpColor(CORE_PANIC, s.primaryRgb, 0.04),
        lerpColor(CORE_CALM, s.accentRgb, 0.08),
        calm,
      );
      const glowR = minDim * (0.15 + calm * 0.1);
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glowGrad.addColorStop(0, rgba(glowColor, (0.04 + calm * 0.03) * ent));
      glowGrad.addColorStop(0.5, rgba(glowColor, 0.01 * ent));
      glowGrad.addColorStop(1, rgba(glowColor, 0));
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Expanding pulse rings ──────────────────────────
      const ringColor = lerpColor(
        lerpColor(RING_PANIC, s.primaryRgb, 0.04),
        lerpColor(RING_CALM, s.accentRgb, 0.06),
        calm,
      );
      const expandSpeed = RING_EXPAND_FRAC * minDim * (s.envBpm / REST_BPM);
      for (let i = s.rings.length - 1; i >= 0; i--) {
        const ring = s.rings[i];
        ring.radius += expandSpeed;
        const maxR = minDim * 0.5;
        const life = 1 - ring.radius / maxR;
        if (life <= 0) { s.rings.splice(i, 1); continue; }
        const alpha = life * life * (0.04 + calm * 0.03) * ent;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, alpha);
        ctx.lineWidth = minDim * (0.0008 + life * 0.0016);
        ctx.stroke();
      }

      // ── Core orb ───────────────────────────────────────
      const breathMod = 1 + p.breathAmplitude * 0.05;
      const coreR = minDim * 0.03 * s.coreScale * breathMod;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      const coreAlpha = (0.1 + calm * 0.1) * ent;
      coreGrad.addColorStop(0, rgba(glowColor, coreAlpha));
      coreGrad.addColorStop(0.6, rgba(glowColor, coreAlpha * 0.4));
      coreGrad.addColorStop(1, rgba(glowColor, 0));
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // ── BPM display ────────────────────────────────────
      const lbl = lerpColor(LABEL, s.primaryRgb, 0.04);
      const fontSize = Math.round(minDim * 0.022);
      ctx.font = `200 ${fontSize}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = rgba(lbl, 0.035 * ent);
      ctx.fillText(`${Math.round(s.envBpm)} bpm`, cx, cy + minDim * 0.28);

      // Tap hint
      if (s.tapTimes.length < 2 && s.frameCount > 90 && s.frameCount < 400) {
        const hAlpha = Math.min(0.03, (s.frameCount - 90) / 400 * 0.03) * ent;
        const hFontSize = Math.round(minDim * 0.015);
        ctx.font = `300 ${hFontSize}px -apple-system, sans-serif`;
        ctx.fillStyle = rgba(lbl, hAlpha);
        ctx.fillText('tap your rhythm', cx, cy + minDim * 0.35);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const now = performance.now();
      s.tapTimes.push(now);
      if (s.tapTimes.length > TAP_HISTORY + 1) s.tapTimes.shift();
      cbRef.current.onHaptic('tap');

      if (s.tapTimes.length >= 3) {
        let sum = 0;
        let count = 0;
        for (let i = 1; i < s.tapTimes.length; i++) {
          const interval = s.tapTimes[i] - s.tapTimes[i - 1];
          if (interval > 150 && interval < 3000) {
            sum += interval;
            count++;
          }
        }
        if (count > 0) {
          s.userBpm = 60000 / (sum / count);
        }
      }

      canvas.setPointerCapture(e.pointerId);
    };
    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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