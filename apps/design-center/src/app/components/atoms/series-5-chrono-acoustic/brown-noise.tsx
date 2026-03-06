/**
 * ATOM 046: THE BROWN NOISE ENGINE (Sensory Masking)
 * ====================================================
 * Series 5 — Chrono-Acoustic · Position 6
 *
 * Sometimes the world is simply too sharp. Every sound, every
 * notification, every edge cuts. The user doesn't need to fix
 * the sharpness — they need a blanket. Brown noise mimics the
 * deep roar of a waterfall, a cosmic hum, the sound of being
 * held. It masks the sharp transients of anxiety.
 *
 * The top of the canvas is sharp, bright, agitated — jagged
 * crystalline fragments representing the harsh outside world.
 * The bottom is deep, warm, soft, safe. Between them: a
 * BLANKET LINE that the user drags downward.
 *
 * As the blanket descends:
 *   - Everything above softens, blurs, dims
 *   - Brown noise low-pass cutoff drops (deeper = more muffled)
 *   - Sharp fragments above the line dissolve
 *   - Warm particles below multiply and drift
 *   - The visual field becomes a cocoon
 *
 * At full coverage: the entire screen is a thick, warm,
 * impenetrable field of safety. One deep breath. Done.
 *
 * AUDIO ENGINE:
 *   Brown noise: pre-generated via random walk buffer
 *   Low-pass BiquadFilterNode: cutoff tracks blanket position
 *   Full coverage: cutoff at 80 Hz — pure deep rumble
 *   Graceful: visual-only if AudioContext unavailable
 *
 * HAPTIC JOURNEY:
 *   Drag blanket → hold_start (wrapping begins)
 *   50% covered → step_advance (halfway safe)
 *   Full coverage → completion (wrapped, held, safe)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No fragment animation, no particle drift, static blanket
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Sharp fragment count (above blanket) */
const FRAGMENT_COUNT = 50;
/** Warm particles (below blanket) */
const WARM_PARTICLE_COUNT = 40;
/** Brown noise buffer length (seconds) */
const NOISE_BUFFER_SEC = 3;
/** Noise gain */
const NOISE_GAIN = 0.08;
/** Cutoff range */
const CUTOFF_HIGH = 4000;  // Hz — unfiltered (sharp)
const CUTOFF_LOW = 80;     // Hz — full blanket (deep rumble)

// =====================================================================
// DATA
// =====================================================================

interface SharpFragment {
  x: number;
  y: number; // Normalised 0–1 (0 = top)
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  points: number; // 3–6 sided
  phase: number;
}

interface WarmMote {
  x: number;
  y: number; // Normalised 0–1
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette — sharp world → warm blanket
const BG_SHARP: RGB = [8, 7, 9];               // Exposed, cold
const BG_WARM: RGB = [18, 14, 12];             // Deep, held, safe
const FRAGMENT_COLD: RGB = [130, 115, 130];    // Sharp crystalline
const FRAGMENT_EDGE: RGB = [150, 130, 140];    // Fragment edges
const BLANKET_LINE: RGB = [140, 120, 95];      // The threshold
const BLANKET_GLOW: RGB = [120, 100, 75];      // Warm edge glow
const WARM_MOTE: RGB = [100, 80, 60];          // Safe particles
const DEEP_FIELD: RGB = [50, 40, 30];          // Deep brown field
const LABEL_COLOR: RGB = [70, 60, 50];

// =====================================================================
// COMPONENT
// =====================================================================

export default function BrownNoiseAtom({
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
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  const stateRef = useRef({
    fragments: [] as SharpFragment[],
    warmMotes: [] as WarmMote[],
    blanketPos: 0, // 0 = top (no coverage), 1 = bottom (full)
    isDragging: false,
    holdFired: false,
    halfFired: false,
    resolved: false,
    audioStarted: false,
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
    return () => {
      try {
        noiseSourceRef.current?.stop();
        audioCtxRef.current?.close();
      } catch { /* */ }
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
        const bufferSize = Math.round(actx.sampleRate * NOISE_BUFFER_SEC);
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastVal = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastVal = (lastVal + white * 0.02) * 0.998;
          data[i] = lastVal;
        }
        let maxAbs = 0;
        for (let i = 0; i < bufferSize; i++) {
          if (Math.abs(data[i]) > maxAbs) maxAbs = Math.abs(data[i]);
        }
        if (maxAbs > 0) {
          for (let i = 0; i < bufferSize; i++) data[i] /= maxAbs;
        }
        const source = actx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        noiseSourceRef.current = source;
        const filter = actx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = CUTOFF_HIGH;
        filter.Q.value = 0.5;
        filterRef.current = filter;
        const gain = actx.createGain();
        gain.gain.value = NOISE_GAIN;
        noiseGainRef.current = gain;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(actx.destination);
        source.start();
        s.audioStarted = true;
      } catch { /* no audio */ }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = true;
      if (!s.holdFired) {
        s.holdFired = true;
        cbRef.current.onHaptic('hold_start');
      }
      ensureAudio();
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      if (!s.isDragging) return;
      s.blanketPos = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
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
      // Sharp fragments (spread across the full height)
      s.fragments = Array.from({ length: FRAGMENT_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random(),
        size: minDim * (0.004 + Math.random() * 0.012),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        alpha: 0.03 + Math.random() * 0.06,
        points: 3 + Math.floor(Math.random() * 4),
        phase: Math.random() * Math.PI * 2,
      }));

      // Warm motes (concentrated in lower half)
      s.warmMotes = Array.from({ length: WARM_PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: 0.5 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * minDim * 0.0004,
        vy: (Math.random() - 0.5) * minDim * 0.0002,
        size: minDim * (0.001 + Math.random() * 0.003),
        alpha: 0.01 + Math.random() * 0.03,
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

      const coverage = s.blanketPos;

      // Haptics
      if (coverage >= 0.5 && !s.halfFired) {
        s.halfFired = true;
        cb.onHaptic('step_advance');
      }
      if (coverage >= 0.92 && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      // Update audio filter
      if (filterRef.current) {
        // Log interpolation for natural frequency response
        const cutoff = CUTOFF_HIGH * Math.pow(CUTOFF_LOW / CUTOFF_HIGH, coverage);
        filterRef.current.frequency.value = cutoff;
      }
      if (noiseGainRef.current) {
        // Volume rises slightly as blanket covers (more immersive)
        noiseGainRef.current.gain.value = NOISE_GAIN * (0.5 + coverage * 0.5);
      }

      cb.onStateChange?.(coverage);

      // ══════════════════════════════════════════════════
      // BACKGROUND (gradient: sharp → warm)
      // ══════════════════════════════════════════════════

      const bgTop = lerpColor(BG_SHARP, s.primaryRgb, 0.005);
      const bgBot = lerpColor(BG_WARM, s.primaryRgb, 0.01);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, rgba(bgTop, entrance * 0.03));
      bgGrad.addColorStop(1, rgba(bgBot, entrance * 0.02));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const blanketY = coverage * h;

      // ══════════════════════════════════════════════════
      // SHARP FRAGMENTS (above blanket — the harsh world)
      // ═════════════════════════════════════════════════

      for (const frag of s.fragments) {
        const fy = frag.y * h;
        // Fragments above blanket are visible; below blanket: hidden
        const aboveBlanket = fy < blanketY;
        if (!aboveBlanket) continue;

        // Soften fragments near the blanket line
        const distToBlanket = (blanketY - fy) / h;
        const soften = Math.max(0, 1 - distToBlanket * 3);
        // As blanket descends, fragments above it dissolve
        const dissolve = coverage > 0.3 ? Math.max(0, 1 - (coverage - 0.3) * 1.5) : 1;

        const fragAlpha = frag.alpha * dissolve * (1 - soften * 0.5) * entrance;
        if (fragAlpha < 0.003) continue;

        if (!p.reducedMotion) {
          frag.rotation += frag.rotSpeed * (1 - coverage * 0.5);
        }

        const fragColor = lerpColor(FRAGMENT_COLD, s.primaryRgb, 0.05);

        ctx.save();
        ctx.translate(frag.x, fy);
        ctx.rotate(frag.rotation);

        // Draw polygon
        ctx.beginPath();
        for (let i = 0; i < frag.points; i++) {
          const a = (i / frag.points) * Math.PI * 2;
          const r = frag.size * (0.7 + 0.3 * Math.sin(a * 2 + frag.phase));
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(lerpColor(FRAGMENT_EDGE, s.primaryRgb, 0.04), fragAlpha);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();

        // Fragment fill (very subtle)
        ctx.fillStyle = rgba(fragColor, fragAlpha * 0.2);
        ctx.fill();

        ctx.restore();
      }

      // ══════════════════════════════════════════════════
      // WARM FIELD (below blanket — the cocoon)
      // ══════════════════════════════════════════════════

      if (coverage > 0.05) {
        // Deep brown overlay below blanket line
        const deepColor = lerpColor(DEEP_FIELD, s.primaryRgb, 0.02);
        const deepAlpha = coverage * 0.12 * entrance;
        const deepGrad = ctx.createLinearGradient(0, blanketY, 0, h);
        deepGrad.addColorStop(0, rgba(deepColor, deepAlpha * 0.3));
        deepGrad.addColorStop(0.3, rgba(deepColor, deepAlpha));
        deepGrad.addColorStop(1, rgba(deepColor, deepAlpha * 1.2));
        ctx.fillStyle = deepGrad;
        ctx.fillRect(0, blanketY, w, h - blanketY);

        // Warm motes (only below blanket, more visible with coverage)
        for (const mote of s.warmMotes) {
          const my = mote.y * h;
          if (my < blanketY) continue;

          if (!p.reducedMotion) {
            mote.x += mote.vx;
            mote.y += mote.vy * 0.001;
            mote.vx += (Math.random() - 0.5) * 0.005;
            mote.vx *= 0.99;
            if (mote.x < -10) mote.x = w + 10;
            if (mote.x > w + 10) mote.x = -10;
          }

          const shimmer = p.reducedMotion ? 0.6 :
            0.4 + 0.6 * Math.sin(s.frameCount * 0.015 + mote.phase);
          const mColor = lerpColor(WARM_MOTE, s.accentRgb, 0.06);
          const mAlpha = mote.alpha * shimmer * coverage * entrance;

          if (mAlpha < 0.003) continue;

          ctx.beginPath();
          ctx.arc(mote.x, my, mote.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = rgba(mColor, mAlpha);
          ctx.fill();

          // Soft glow
          if (mote.size > minDim * 0.002) {
            const glowR = mote.size * 2;
            const glowGrad = ctx.createRadialGradient(mote.x, my, 0, mote.x, my, glowR);
            glowGrad.addColorStop(0, rgba(mColor, mAlpha * 0.15));
            glowGrad.addColorStop(1, rgba(mColor, 0));
            ctx.fillStyle = glowGrad;
            ctx.fillRect(mote.x - glowR, my - glowR, glowR * 2, glowR * 2);
          }
        }
      }

      // ══════════════════════════════════════════════════
      // THE BLANKET LINE
      // ══════════════════════════════════════════════════

      if (coverage > 0.01 && coverage < 0.98) {
        const lineColor = lerpColor(BLANKET_LINE, s.accentRgb, 0.08);
        const lineAlpha = (0.06 + (s.isDragging ? 0.04 : 0)) * entrance;

        // Soft gradient edge (the blanket's weight)
        const edgeH = minDim * 0.04;
        const edgeGrad = ctx.createLinearGradient(0, blanketY - edgeH, 0, blanketY + edgeH);
        const glowColor = lerpColor(BLANKET_GLOW, s.primaryRgb, 0.06);
        edgeGrad.addColorStop(0, rgba(glowColor, 0));
        edgeGrad.addColorStop(0.4, rgba(glowColor, lineAlpha * 0.3));
        edgeGrad.addColorStop(0.5, rgba(glowColor, lineAlpha * 0.5));
        edgeGrad.addColorStop(0.6, rgba(glowColor, lineAlpha * 0.3));
        edgeGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(0, blanketY - edgeH, w, edgeH * 2);

        // The line itself — a gentle horizontal stroke
        ctx.beginPath();
        ctx.moveTo(0, blanketY);
        ctx.lineTo(w, blanketY);
        ctx.strokeStyle = rgba(lineColor, lineAlpha);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();

        // Breath-coupled gentle wave on the blanket line
        if (!p.reducedMotion) {
          const breathMod = p.breathAmplitude * 2;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 3) {
            const wave = Math.sin(x * 0.01 + s.frameCount * 0.008) * breathMod;
            if (x === 0) ctx.moveTo(x, blanketY + wave);
            else ctx.lineTo(x, blanketY + wave);
          }
          ctx.strokeStyle = rgba(lineColor, lineAlpha * 0.4);
          ctx.lineWidth = minDim * 0.0012;
          ctx.stroke();
        }
      }

      // ── Drag hint ──────────────────────────────────────
      if (coverage < 0.02 && s.frameCount > 90 && s.frameCount < 360 && !s.isDragging) {
        const hintAlpha = Math.min(0.03, (s.frameCount - 90) / 300 * 0.03) * entrance;
        const hintColor = lerpColor(LABEL_COLOR, s.primaryRgb, 0.04);
        const fontSize = Math.round(minDim * 0.015);
        ctx.font = `300 ${fontSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(hintColor, hintAlpha);
        ctx.fillText('drag down', w / 2, h * 0.12);
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