/**
 * ATOM 649: THE BUOYANT ASCENT ENGINE
 * =====================================
 * Series 65 — The Slipstream · Position 9
 *
 * Prove micromanagement suffocates healing. Release your tight
 * grip at the bottom of the deep ocean — without your heavy input
 * the natural buoyancy floats the node peacefully to the surface.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — underwater bubble
 * streamlines rising, light shaft beams, pressure depth gradient,
 * and the buoyant ascent trail of sparkling bubbles.
 *
 * PHYSICS:
 *   - User holds node tightly at deep ocean bottom (heavy haptics)
 *   - Holding: pressure indicators, dark depth, tension markers
 *   - RELEASE: lift thumb completely off the glass
 *   - Natural buoyancy takes over — node rises peacefully
 *   - Ascending: light increases, bubbles trail upward
 *   - Reaches sunlit surface without any user intervention
 *
 * INTERACTION: Hold (maintain grip) → Release → buoyant ascent
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static at surface
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

const NODE_RADIUS      = 0.022;
const GLOW_R_NODE      = 0.1;
const BUOYANCY_SPEED   = 0.002;        // natural rise speed
const BUOYANCY_ACCEL   = 0.00005;      // acceleration as light approaches
const DEPTH_START      = 0.88;         // starting Y (deep)
const SURFACE_Y        = 0.08;         // surface threshold
const BUBBLE_RATE      = 4;            // frames between bubble spawns
const BUBBLE_RISE      = 0.003;        // bubble rise speed
const LIGHT_SHAFT_CT   = 5;            // sunlight shafts
const PRESSURE_LINE_CT = 8;            // depth pressure indicators
const HOLD_TENSION     = 0.12;         // visual tension radius when held
const RESPAWN_DELAY    = 100;

// =====================================================================
// STATE
// =====================================================================

interface Bubble { x: number; y: number; r: number; speed: number; }

interface BuoyState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeY: number;
  nodeVy: number;
  holding: boolean;
  released: boolean;
  holdTime: number;
  bubbles: Bubble[];
  completed: boolean;
  respawnTimer: number;
  holdHapticSent: boolean;
}

function freshState(color: string, accent: string): BuoyState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    nodeY: DEPTH_START, nodeVy: 0,
    holding: false, released: false, holdTime: 0,
    bubbles: [], completed: false, respawnTimer: 0,
    holdHapticSent: false,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function BuoyantAscentReleaseAtom({
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

      // ── LAYER 1: Deep ocean atmosphere ──────────────────────────
      // Depth-dependent background: dark at bottom, bright at top
      const depthFrac = s.nodeY; // 0 = surface, 1 = deep
      const bgDark: RGB = [8, 12, 25];
      const bgLight: RGB = [20, 40, 70];
      const bgBlend = lerpColor(bgLight, bgDark, depthFrac);

      if (!p.composed) {
        const depthGrad = ctx.createLinearGradient(0, 0, 0, h);
        depthGrad.addColorStop(0, rgba(lerpColor(bgBlend, s.primaryRgb, 0.1), 0.06 * entrance));
        depthGrad.addColorStop(1, rgba(lerpColor(bgBlend, s.primaryRgb, 0.05), 0.03 * entrance));
        ctx.fillStyle = depthGrad;
        ctx.fillRect(0, 0, w, h);
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);
      }

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (s.holding) {
          s.holdTime++;
          // Node stays pinned at depth
          s.nodeY = DEPTH_START;
          s.nodeVy = 0;
        } else if (s.released) {
          // Buoyant ascent
          s.nodeVy -= BUOYANCY_ACCEL;
          s.nodeVy = Math.max(-0.015, s.nodeVy - BUOYANCY_SPEED * 0.01);
          s.nodeY += s.nodeVy;
          s.nodeY = Math.max(-0.05, s.nodeY);

          // Spawn bubbles
          if (s.frameCount % BUBBLE_RATE === 0) {
            s.bubbles.push({
              x: cx / w + (Math.random() - 0.5) * 0.05,
              y: s.nodeY + 0.02,
              r: 0.002 + Math.random() * 0.004,
              speed: BUBBLE_RISE * (0.7 + Math.random() * 0.6),
            });
          }

          cb.onStateChange?.(Math.min(1, (DEPTH_START - s.nodeY) / (DEPTH_START - SURFACE_Y)));

          if (s.nodeY <= SURFACE_Y) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Bubble physics
        for (const b of s.bubbles) {
          b.y -= b.speed;
          b.x += Math.sin(s.frameCount * 0.05 + b.y * 30) * 0.0003;
        }
        s.bubbles = s.bubbles.filter(b => b.y > -0.05);
      }

      // ── LAYER 2: Light shafts from surface ─────────────────────
      const surfaceBrightness = 1 - Math.min(1, s.nodeY);
      for (let i = 0; i < LIGHT_SHAFT_CT; i++) {
        const shaftX = w * (0.15 + i * 0.18);
        const shaftW = px(0.04 + i * 0.01, minDim);
        const shaftGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
        const shaftAlpha = ALPHA.background.min * 2 * surfaceBrightness * entrance;
        shaftGrad.addColorStop(0, rgba(s.primaryRgb, shaftAlpha));
        shaftGrad.addColorStop(0.5, rgba(s.primaryRgb, shaftAlpha * 0.3));
        shaftGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = shaftGrad;

        ctx.save();
        ctx.translate(shaftX, 0);
        ctx.transform(1, 0, -0.1 + i * 0.05, 1, 0, 0); // skew
        ctx.fillRect(-shaftW / 2, 0, shaftW, h * 0.7);
        ctx.restore();
      }

      // ── LAYER 3: Pressure depth lines ──────────────────────────
      for (let i = 0; i < PRESSURE_LINE_CT; i++) {
        const py = h * (0.1 + i * 0.1);
        const pAlpha = ALPHA.background.min * (i / PRESSURE_LINE_CT) * entrance;
        ctx.setLineDash([px(0.008, minDim), px(0.015, minDim)]);
        ctx.beginPath();
        ctx.moveTo(w * 0.05, py);
        ctx.lineTo(w * 0.95, py);
        ctx.strokeStyle = rgba(s.accentRgb, pAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── LAYER 4: Bubbles ───────────────────────────────────────
      for (const b of s.bubbles) {
        const bx = b.x * w;
        const by = b.y * h;
        const br = px(b.r, minDim);

        // Bubble glow
        ctx.beginPath();
        ctx.arc(bx, by, br * 2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * entrance * ms);
        ctx.fill();

        // Bubble
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.5 * entrance * ms);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Highlight
        ctx.beginPath();
        ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5),
                             ALPHA.content.max * 0.2 * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 5: Surface ripple (at top) ───────────────────────
      const surfaceLineY = h * 0.06;
      ctx.beginPath();
      for (let t = 0; t <= 40; t++) {
        const sx = (t / 40) * w;
        const sOff = Math.sin(t * 0.5 + s.frameCount * 0.025 * ms) * px(0.003, minDim);
        if (t === 0) ctx.moveTo(sx, surfaceLineY + sOff); else ctx.lineTo(sx, surfaceLineY + sOff);
      }
      ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
                             ALPHA.atmosphere.max * 0.3 * entrance * ms);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ── LAYER 6: Holding tension indicators ────────────────────
      if (s.holding) {
        const nx = cx;
        const ny = s.nodeY * h;
        const tensionR = px(HOLD_TENSION, minDim);

        // Tension rings
        for (let i = 0; i < 3; i++) {
          const r = tensionR * (0.5 + i * 0.3) + Math.sin(s.frameCount * 0.1 + i) * px(0.005, minDim);
          ctx.beginPath();
          ctx.arc(nx, ny, r, 0, Math.PI * 2);
          const tAlpha = ALPHA.atmosphere.min * (1 - i * 0.3) * entrance;
          ctx.strokeStyle = rgba(s.accentRgb, tAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }

        // Pressure text
        const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('HOLDING', nx, ny - tensionR - px(0.02, minDim));

        // Downward chains
        for (let i = -1; i <= 1; i += 2) {
          const chainX = nx + i * px(0.03, minDim);
          ctx.setLineDash([px(0.003, minDim), px(0.005, minDim)]);
          ctx.beginPath();
          ctx.moveTo(chainX, ny + nodeR);
          ctx.lineTo(chainX, h);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.4 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── LAYER 7: Node ──────────────────────────────────────────
      if (!s.completed) {
        const nx = cx;
        const ny = s.nodeY * h;

        // Glow — brighter as ascending
        const glowInt = s.released ? 0.3 + (1 - s.nodeY) * 0.3 : 0.15;
        const gr = px(GLOW_R_NODE, minDim);
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

        // Core
        const holdShake = s.holding ? Math.sin(s.frameCount * 0.15 * ms) * px(0.002, minDim) : 0;
        ctx.beginPath();
        ctx.arc(nx + holdShake, ny, nodeR * (1 + breath * 0.05), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Ascent ring
        if (s.released && !s.completed) {
          const ringR = nodeR * (2.5 + Math.sin(s.frameCount * 0.06) * 0.4);
          ctx.beginPath();
          ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: Depth HUD ─────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.released && !s.completed) {
        const depthPct = Math.round((1 - s.nodeY) * 100);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText(`ASCENDING ${depthPct}%`, cx, h - px(0.035, minDim));
      } else if (!s.released && !s.completed) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.35 * entrance);
        ctx.fillText('HOLD — THEN RELEASE', cx, h - px(0.035, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, h * 0.1, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.nodeY = DEPTH_START; s.nodeVy = 0;
          s.holding = false; s.released = false; s.holdTime = 0;
          s.bubbles = []; s.completed = false; s.holdHapticSent = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.released) return;
      s.holding = true;
      if (!s.holdHapticSent) {
        cbRef.current.onHaptic('hold_start');
        s.holdHapticSent = true;
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.holding && !s.released) {
        s.holding = false;
        s.released = true;
        s.nodeVy = -BUOYANCY_SPEED;
        cbRef.current.onHaptic('hold_release');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
