/**
 * ATOM 648: THE PHASE ALIGNMENT ENGINE
 * ======================================
 * Series 65 — The Slipstream · Position 8
 *
 * Cure poor timing friction. Stop forcing through the oscillating
 * gate. Match the exact rhythmic frequency — once phases align
 * you glide through with absolute zero resistance.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — oscillating gate
 * bars with phase-wave visualization, frequency matching indicator,
 * and streamline flow that only appears when phases sync.
 *
 * PHYSICS:
 *   - Digital gate opens/closes in pulsing oscillating rhythm
 *   - Forcing node through causes crushing haptics
 *   - Scrub to adjust node frequency to match gate frequency
 *   - Phase alignment visualized as overlapping sine waves
 *   - Once aligned: gate opens permanently, zero resistance passage
 *   - Breath modulates the phase wave amplitude
 *
 * INTERACTION: Scrub (frequency) → phase match → zero-resistance passage
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static open gate
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const NODE_RADIUS      = 0.018;
const GLOW_R_NODE      = 0.08;
const GATE_X           = 0.5;          // gate X position
const GATE_BASE_FREQ   = 0.04;         // gate oscillation frequency
const GATE_AMPLITUDE   = 0.18;         // gate opening amplitude
const BAR_THICKNESS    = 0.015;        // gate bar thickness
const PHASE_TOLERANCE  = 0.08;         // frequency match tolerance
const WAVE_DISPLAY_W   = 0.35;         // wave visualization width
const NODE_START_X     = 0.15;
const NODE_PASS_SPEED  = 0.005;        // speed when passing through
const CRUSH_SHAKE      = 0.006;
const CRUSH_DURATION   = 20;
const RESPAWN_DELAY    = 90;

// =====================================================================
// STATE
// =====================================================================

interface PhaseState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  userFreq: number;          // 0-1 mapped to frequency range
  gatePhase: number;
  nodeX: number;
  nodeY: number;
  aligned: boolean;
  passing: boolean;
  crushTimer: number;
  completed: boolean;
  respawnTimer: number;
  dragging: boolean;
  lastTier: number;
}

function freshState(color: string, accent: string): PhaseState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    userFreq: 0.2, gatePhase: 0,
    nodeX: NODE_START_X, nodeY: 0.5,
    aligned: false, passing: false, crushTimer: 0,
    completed: false, respawnTimer: 0, dragging: false, lastTier: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function PhaseAlignmentGateAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef     = useRef({ onHaptic, onStateChange });
  const propsRef  = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef(freshState(color, accentColor));

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb  = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s  = stateRef.current;
      const p  = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.gatePhase += GATE_BASE_FREQ;
        s.crushTimer = Math.max(0, s.crushTimer - 1);

        // Gate opening = sine of gate phase
        const gateOpen = Math.sin(s.gatePhase) * GATE_AMPLITUDE;

        // User wave = sine of user frequency
        const userPhase = s.frameCount * (GATE_BASE_FREQ * 0.5 + s.userFreq * GATE_BASE_FREQ * 1.5);
        const userOpen = Math.sin(userPhase);

        // Phase alignment check
        const freqMatch = Math.abs(s.userFreq - 0.5); // 0.5 = perfect match
        s.aligned = freqMatch < PHASE_TOLERANCE;

        if (s.aligned) {
          cb.onStateChange?.(Math.min(1, 1 - freqMatch / PHASE_TOLERANCE));
        }

        // Passing through
        if (s.passing) {
          s.nodeX += NODE_PASS_SPEED;
          if (s.nodeX > 0.85) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Crush: node tries to pass when not aligned
        if (!s.aligned && !s.passing && s.nodeX > GATE_X - 0.08 && s.crushTimer <= 0) {
          // Push back
          s.nodeX = NODE_START_X;
          s.crushTimer = CRUSH_DURATION;
          cb.onHaptic('error_boundary');
        }
      }

      const gateX   = GATE_X * w;
      const gateOpen = s.aligned ? GATE_AMPLITUDE : Math.sin(s.gatePhase) * GATE_AMPLITUDE;
      const topBarY  = cy - gateOpen * h;
      const botBarY  = cy + gateOpen * h;

      // ── LAYER 2: Phase wave display ────────────────────────────
      const waveX = cx - px(WAVE_DISPLAY_W / 2, w);
      const waveW = px(WAVE_DISPLAY_W, w);
      const waveY = h * 0.12;
      const waveH = px(0.08, h);

      // Gate frequency wave (accent)
      ctx.beginPath();
      for (let t = 0; t <= 60; t++) {
        const frac = t / 60;
        const wx = waveX + frac * waveW;
        const wy = waveY + waveH / 2 + Math.sin(frac * Math.PI * 4 + s.gatePhase) * waveH * 0.4;
        if (t === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.5 * entrance * ms);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // User frequency wave (primary)
      const userFreqActual = GATE_BASE_FREQ * 0.5 + s.userFreq * GATE_BASE_FREQ * 1.5;
      ctx.beginPath();
      for (let t = 0; t <= 60; t++) {
        const frac = t / 60;
        const wx = waveX + frac * waveW;
        const breathMod = 1 + breath * 0.1;
        const wy = waveY + waveH / 2 + Math.sin(frac * Math.PI * 4 * (userFreqActual / GATE_BASE_FREQ) +
                   s.frameCount * userFreqActual) * waveH * 0.4 * breathMod;
        if (t === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance * ms);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Alignment indicator
      if (s.aligned) {
        const syncGlow = ctx.createRadialGradient(cx, waveY + waveH / 2, 0, cx, waveY + waveH / 2, waveW * 0.3);
        syncGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        syncGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = syncGlow;
        ctx.fillRect(cx - waveW * 0.3, waveY - waveH * 0.3, waveW * 0.6, waveH * 1.6);
      }

      // ── LAYER 3: Gate structure ────────────────────────────────
      const barH = px(BAR_THICKNESS, h);

      // Top bar (from top to topBarY)
      const topGrad = ctx.createLinearGradient(0, 0, 0, topBarY + barH);
      topGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.05 * entrance));
      topGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
      ctx.fillStyle = topGrad;
      ctx.fillRect(gateX - px(0.01, w), 0, px(0.02, w), topBarY + barH);

      // Bottom bar (from botBarY to bottom)
      const botGrad = ctx.createLinearGradient(0, botBarY - barH, 0, h);
      botGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
      botGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.05 * entrance));
      ctx.fillStyle = botGrad;
      ctx.fillRect(gateX - px(0.01, w), botBarY - barH, px(0.02, w), h - botBarY + barH);

      // Gate edges (bright lines)
      ctx.beginPath();
      ctx.moveTo(gateX - px(0.01, w), topBarY);
      ctx.lineTo(gateX + px(0.01, w), topBarY);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(gateX - px(0.01, w), botBarY);
      ctx.lineTo(gateX + px(0.01, w), botBarY);
      ctx.stroke();

      // ── LAYER 4: Opening zone glow ─────────────────────────────
      if (s.aligned) {
        const openGlow = ctx.createLinearGradient(0, topBarY, 0, botBarY);
        openGlow.addColorStop(0, rgba(s.primaryRgb, 0));
        openGlow.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        openGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        openGlow.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        openGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = openGlow;
        ctx.fillRect(gateX - px(0.03, w), topBarY, px(0.06, w), botBarY - topBarY);
      }

      // ── LAYER 5: Streamlines through opening ───────────────────
      if (s.aligned || s.passing) {
        for (let i = 0; i < 5; i++) {
          const streamY = topBarY + (i + 0.5) / 5 * (botBarY - topBarY);
          ctx.beginPath();
          for (let t = 0; t <= 20; t++) {
            const frac = t / 20;
            const sx = gateX - px(0.08, w) + frac * px(0.16, w);
            const sOff = Math.sin(t * 0.5 + s.frameCount * 0.04 * ms) * px(0.002, minDim);
            if (t === 0) ctx.moveTo(sx, streamY + sOff); else ctx.lineTo(sx, streamY + sOff);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 6: Crush effect ──────────────────────────────────
      if (s.crushTimer > 0) {
        const crushAlpha = (s.crushTimer / CRUSH_DURATION) * ALPHA.accent.max * 0.2 * entrance;
        ctx.fillStyle = rgba(s.accentRgb, crushAlpha);
        ctx.fillRect(gateX - px(0.05, w), cy - px(0.05, h), px(0.1, w), px(0.1, h));
      }

      // ── LAYER 7: Node ──────────────────────────────────────────
      if (!s.completed) {
        const nx = s.nodeX * w;
        const ny = s.nodeY * h;
        const crushShake = s.crushTimer > 0
          ? Math.sin(s.frameCount * 0.7) * px(CRUSH_SHAKE, minDim) * (s.crushTimer / CRUSH_DURATION)
          : 0;

        // Glow
        const gr = px(GLOW_R_NODE, minDim);
        const glowInt = s.aligned ? 0.45 : 0.2;
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

        // Core
        ctx.beginPath();
        ctx.arc(nx + crushShake, ny, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Aligned ring
        if (s.aligned) {
          const ringR = nodeR * (2.5 + Math.sin(s.frameCount * 0.06) * 0.3);
          ctx.beginPath();
          ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.35 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: Frequency slider + HUD ────────────────────────
      const sliderY = h - px(0.055, minDim);
      const sliderW = px(0.35, w);
      const sliderX = cx - sliderW / 2;
      const knobR   = px(0.012, minDim);
      const knobX   = sliderX + sliderW * s.userFreq;

      // Track
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(sliderX, sliderY - px(0.003, minDim), sliderW, px(0.006, minDim));

      // Fill
      ctx.fillStyle = rgba(s.aligned ? s.primaryRgb : s.accentRgb, ALPHA.atmosphere.max * entrance);
      ctx.fillRect(sliderX, sliderY - px(0.003, minDim), sliderW * s.userFreq, px(0.006, minDim));

      // Knob
      ctx.beginPath();
      ctx.arc(knobX, sliderY, knobR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Labels
      const fontSize = Math.max(7, px(FONT_SIZE.xs, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.aligned ? s.primaryRgb : s.accentRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(s.aligned ? 'PHASES ALIGNED' : 'ADJUST FREQUENCY', cx, sliderY - px(0.02, minDim));

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        // Static: gate open, node passing through
        ctx.beginPath();
        ctx.arc(gateX, cy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.userFreq = 0.2; s.nodeX = NODE_START_X; s.nodeY = 0.5;
          s.aligned = false; s.passing = false; s.crushTimer = 0;
          s.completed = false; s.lastTier = 0; s.gatePhase = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ─────────────────────────���──────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;

      // If aligned and not yet passing, start passage
      if (s.aligned && !s.passing) {
        s.passing = true;
        cbRef.current.onHaptic('drag_snap');
      }

      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.passing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const slW = 0.35;
      const slStart = 0.5 - slW / 2;
      s.userFreq = Math.max(0, Math.min(1, (mx - slStart) / slW));

      const tier = Math.floor(s.userFreq * 5);
      if (tier !== s.lastTier) {
        cbRef.current.onHaptic('step_advance');
        s.lastTier = tier;
      }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
