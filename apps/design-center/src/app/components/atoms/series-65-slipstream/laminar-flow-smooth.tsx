/**
 * ATOM 642: THE LAMINAR FLOW ENGINE
 * ===================================
 * Series 65 — The Slipstream · Position 2
 *
 * Cure deliberately introducing drama into stability. Drag the
 * streamline slider — chaotic turbulent bouncing flawlessly smooths
 * into perfectly parallel laminar layers of silent frictionless glide.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — turbulent particles
 * reorganize into perfectly parallel laminar flow ribbons.
 *
 * PHYSICS:
 *   - 12+ horizontal flow layers rendered as Bézier ribbons
 *   - Turbulence parameter controls chaos: 1 = chaotic jitter, 0 = parallel
 *   - Node travels through the flow field; speed proportional to laminar %
 *   - Turbulent state: node bounces, shakes, energy wasted
 *   - Laminar state: ribbons align, node glides silently at max speed
 *   - Scrubable slider controls the streamline coefficient
 *
 * INTERACTION: Scrub (slider) → turbulence-to-laminar transition
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static laminar ribbons
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

const LAYER_COUNT      = 16;           // flow ribbon count
const NODE_RADIUS      = 0.018;        // user node radius fraction
const GLOW_R_NODE      = 0.07;         // node glow radius
const BASE_SPEED       = 0.0008;       // node speed when turbulent
const LAMINAR_SPEED    = 0.004;        // node speed when fully laminar
const TURB_BOUNCE_AMP  = 0.08;         // vertical bounce amplitude (turbulent)
const TURB_WAVE_FREQ   = 0.15;         // bounce frequency
const RIBBON_AMPLITUDE = 0.025;        // max ribbon y-offset (turbulent)
const SLIDER_WIDTH     = 0.35;         // slider track width fraction
const SLIDER_KNOB_R    = 0.012;        // knob radius fraction
const RIBBON_SEGMENTS  = 24;           // Bézier control points per ribbon
const SPEED_LINE_CT    = 6;            // afterimage speed lines
const RESPAWN_DELAY    = 90;
const COMPLETION_X     = 1.05;         // node X to trigger completion

// =====================================================================
// STATE
// =====================================================================

interface FlowState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  streamline: number;         // 0 = turbulent, 1 = laminar
  nodeX: number;
  nodeY: number;
  dragging: boolean;
  completed: boolean;
  respawnTimer: number;
  lastTier: number;
  turbParticles: { x: number; y: number; vx: number; vy: number }[];
}

function freshState(color: string, accent: string): FlowState {
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random(), y: 0.1 + Math.random() * 0.8,
      vx: -0.001 - Math.random() * 0.003, vy: (Math.random() - 0.5) * 0.002,
    });
  }
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    streamline: 0, nodeX: 0.08, nodeY: 0.5,
    dragging: false, completed: false, respawnTimer: 0, lastTier: 0,
    turbParticles: particles,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function LaminarFlowSmoothAtom({
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
      const turb = 1 - s.streamline;
      const nodeR = px(NODE_RADIUS, minDim);

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS UPDATE ──────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        const speed = BASE_SPEED + s.streamline * (LAMINAR_SPEED - BASE_SPEED);
        s.nodeX += speed;
        s.nodeY = 0.5 + Math.sin(s.frameCount * TURB_WAVE_FREQ * ms) * TURB_BOUNCE_AMP * turb;

        if (s.nodeX >= COMPLETION_X && s.streamline > 0.9) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
        if (s.nodeX > 1.15 && !s.completed) s.nodeX = 0.08;

        // Update turbulence particles
        for (const pt of s.turbParticles) {
          pt.x += pt.vx * (1 + turb * 2);
          pt.y += pt.vy * turb;
          pt.vy += (Math.random() - 0.5) * 0.0003 * turb;
          if (pt.x < -0.05) { pt.x = 1.05; pt.y = 0.1 + Math.random() * 0.8; }
        }
      }

      // ── LAYER 2: Turbulence particles (fade as laminar rises) ──
      if (turb > 0.05) {
        for (const pt of s.turbParticles) {
          ctx.beginPath();
          ctx.arc(pt.x * w, pt.y * h, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * turb * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 3: Flow ribbons ──────────────────────────────────
      for (let i = 0; i < LAYER_COUNT; i++) {
        const baseY = (i + 0.5) / LAYER_COUNT * h * 0.85 + h * 0.075;
        const ribbonColor = lerpColor(s.accentRgb, s.primaryRgb, s.streamline);
        const layerAlpha = (ALPHA.atmosphere.min + s.streamline * 0.15) * entrance;

        ctx.beginPath();
        for (let seg = 0; seg <= RIBBON_SEGMENTS; seg++) {
          const t = seg / RIBBON_SEGMENTS;
          const rx = t * w;
          const chaosOff = turb * Math.sin(t * 5 + s.frameCount * 0.04 * ms + i * 2.1) * px(RIBBON_AMPLITUDE, h);
          const driftOff = turb * Math.cos(t * 3.7 + i * 1.3 + s.frameCount * 0.025 * ms) * px(RIBBON_AMPLITUDE * 0.6, h);
          const ry = baseY + chaosOff + driftOff;
          if (seg === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
        }
        ctx.strokeStyle = rgba(ribbonColor, layerAlpha);
        ctx.lineWidth = px(s.streamline > 0.7 ? STROKE.light : STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 4: Laminar glow bands (appear as streamline→1) ──
      if (s.streamline > 0.4) {
        const glowAlpha = (s.streamline - 0.4) * 0.15 * entrance;
        for (let i = 0; i < 4; i++) {
          const bandY = h * (0.2 + i * 0.2);
          const grad = ctx.createLinearGradient(0, bandY - px(0.02, h), 0, bandY + px(0.02, h));
          grad.addColorStop(0, rgba(s.primaryRgb, 0));
          grad.addColorStop(0.5, rgba(s.primaryRgb, glowAlpha));
          grad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = grad;
          ctx.fillRect(0, bandY - px(0.02, h), w, px(0.04, h));
        }
      }

      // ── LAYER 5: Speed lines behind node ────────────────────────
      if (!s.completed && s.streamline > 0.3) {
        const nx = s.nodeX * w;
        const ny = s.nodeY * h;
        for (let i = 0; i < SPEED_LINE_CT; i++) {
          const spread = (i - (SPEED_LINE_CT - 1) / 2) * px(0.005, minDim);
          const lineLen = px(0.03 + s.streamline * 0.05, minDim);
          ctx.beginPath();
          ctx.moveTo(nx - nodeR, ny + spread);
          ctx.lineTo(nx - nodeR - lineLen, ny + spread);
          const lineAlpha = ALPHA.atmosphere.min * s.streamline * (1 - Math.abs(i - 2.5) * 0.15) * entrance;
          ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 6: Node glow ──────────────────────────────────────
      if (!s.completed) {
        const nx = s.nodeX * w;
        const ny = s.nodeY * h;
        const gr = px(GLOW_R_NODE, minDim);
        const glowInt = 0.2 + s.streamline * 0.3;
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

        // Core node
        const shake = turb * Math.sin(s.frameCount * 0.5 * ms) * px(0.004, minDim);
        ctx.beginPath();
        ctx.arc(nx + shake, ny, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Leading highlight
        if (s.streamline > 0.6) {
          ctx.beginPath();
          ctx.arc(nx + nodeR * 0.3, ny - nodeR * 0.2, nodeR * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
                               ALPHA.content.max * 0.15 * entrance);
          ctx.fill();
        }
      }

      // ── LAYER 7: Slider track + knob ───────────────────────────
      const sliderY = h - px(0.055, minDim);
      const sliderW = px(SLIDER_WIDTH, w);
      const sliderX = cx - sliderW / 2;
      const knobR   = px(SLIDER_KNOB_R, minDim);
      const knobX   = sliderX + sliderW * s.streamline;

      // Track bg
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(sliderX, sliderY - px(0.003, minDim), sliderW, px(0.006, minDim));

      // Track fill
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * entrance);
      ctx.fillRect(sliderX, sliderY - px(0.003, minDim), sliderW * s.streamline, px(0.006, minDim));

      // Knob glow
      const kGlow = ctx.createRadialGradient(knobX, sliderY, 0, knobX, sliderY, knobR * 3);
      kGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      kGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = kGlow;
      ctx.fillRect(knobX - knobR * 3, sliderY - knobR * 3, knobR * 6, knobR * 6);

      // Knob
      ctx.beginPath();
      ctx.arc(knobX, sliderY, knobR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 8: HUD labels ────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.xs, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * entrance);
      ctx.fillText('TURBULENT', sliderX, sliderY - px(0.018, minDim));
      ctx.textAlign = 'right';
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText('LAMINAR', sliderX + sliderW, sliderY - px(0.018, minDim));

      // ── Reduced motion fallback ─────────────────────────────────
      if (p.reducedMotion) {
        // Static laminar lines
        for (let i = 0; i < LAYER_COUNT; i++) {
          const ly = (i + 0.5) / LAYER_COUNT * h * 0.85 + h * 0.075;
          ctx.beginPath();
          ctx.moveTo(0, ly);
          ctx.lineTo(w, ly);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.6 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
        // Static node at center
        ctx.beginPath();
        ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.streamline = 0; s.nodeX = 0.08; s.nodeY = 0.5;
          s.completed = false; s.lastTier = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const slW = SLIDER_WIDTH;
      const slStart = 0.5 - slW / 2;
      const prev = s.streamline;
      s.streamline = Math.max(0, Math.min(1, (mx - slStart) / slW));
      cbRef.current.onStateChange?.(s.streamline);
      const tier = Math.floor(s.streamline * 5);
      if (tier > s.lastTier) { cbRef.current.onHaptic('step_advance'); s.lastTier = tier; }
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
