/**
 * ATOM 650: THE ZERO-DRAG ENGINE
 * ================================
 * Series 65 — The Slipstream · Position 10 (Apex)
 *
 * The apex: life is a fluid dynamic to navigate. Sculpt your own
 * geometry into a perfect aerodynamic teardrop — drag coefficient
 * drops to 0.00 and you shoot through chaos at infinite velocity
 * in dead breathtaking silence.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — wind tunnel with
 * visible streamlines splitting around the sculpted shape, drag
 * coefficient readout, progressive smoothing toward teardrop perfection.
 *
 * PHYSICS:
 *   - Massive high-speed wind tunnel with chaotic particles + roar
 *   - User draws/sculpts outer geometry of their node
 *   - Shape evaluation: smoothness, taper, curvature continuity
 *   - As drag coefficient drops: wind resistance diminishes
 *   - Perfect teardrop (Cd ≈ 0.00): total silence, infinite velocity
 *   - Streamlines visibly split and rejoin around the sculpted form
 *
 * INTERACTION: Draw (sculpt teardrop) → Cd drops → infinite silence
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static teardrop
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

const NODE_RADIUS      = 0.02;
const GLOW_R_NODE      = 0.1;
const WIND_PARTICLE_CT = 35;
const STREAMLINE_CT    = 14;           // streamlines around sculpted shape
const TUNNEL_SPEED_MIN = 2;            // wind speed when Cd=1
const TUNNEL_SPEED_MAX = 12;           // wind speed when Cd=0
const MIN_SCULPT_PTS   = 10;          // minimum points for a valid sculpture
const VELOCITY_MAX     = 1;
const VELOCITY_ACCEL   = 0.003;
const COMPLETION_V     = 0.95;
const RESPAWN_DELAY    = 110;

// =====================================================================
// STATE
// =====================================================================

interface SculptPoint { x: number; y: number; }

interface TeardropState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  sculptPts: SculptPoint[];
  drawing: boolean;
  sculptComplete: boolean;
  dragCoeff: number;         // 1 = rough, 0 = perfect
  velocity: number;
  nodeX: number;
  completed: boolean;
  respawnTimer: number;
  lastTier: number;
}

function freshState(color: string, accent: string): TeardropState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    sculptPts: [], drawing: false, sculptComplete: false,
    dragCoeff: 1, velocity: 0, nodeX: 0.15,
    completed: false, respawnTimer: 0, lastTier: 0,
  };
}

// Evaluate teardrop quality: smoothness + taper
function evaluateTeardrop(pts: SculptPoint[]): number {
  if (pts.length < MIN_SCULPT_PTS) return 1;

  // Smoothness: average cosine similarity of consecutive direction vectors
  let smoothness = 0;
  let count = 0;
  for (let i = 2; i < pts.length; i++) {
    const dx1 = pts[i - 1].x - pts[i - 2].x;
    const dy1 = pts[i - 1].y - pts[i - 2].y;
    const dx2 = pts[i].x - pts[i - 1].x;
    const dy2 = pts[i].y - pts[i - 1].y;
    const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (mag1 > 0.5 && mag2 > 0.5) {
      smoothness += (dx1 * dx2 + dy1 * dy2) / (mag1 * mag2);
      count++;
    }
  }
  if (count === 0) return 1;
  smoothness /= count;

  // Taper: check if shape narrows toward the right
  const midX = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  let leftSpread = 0, rightSpread = 0, leftCt = 0, rightCt = 0;
  const midY = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  for (const p of pts) {
    const dy = Math.abs(p.y - midY);
    if (p.x < midX) { leftSpread += dy; leftCt++; }
    else { rightSpread += dy; rightCt++; }
  }
  const leftAvg = leftCt > 0 ? leftSpread / leftCt : 0;
  const rightAvg = rightCt > 0 ? rightSpread / rightCt : 0;
  const taper = leftAvg > rightAvg ? 0.3 : 0; // bonus for taper

  const score = (smoothness + 1) / 2 + taper; // 0-1.3
  return Math.max(0, 1 - Math.min(1, score));
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function ZeroDragTeardropAtom({
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
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && s.sculptComplete && !s.completed) {
        s.velocity = Math.min(VELOCITY_MAX, s.velocity + VELOCITY_ACCEL * (1 - s.dragCoeff));
        s.nodeX += s.velocity * 0.01;
        cb.onStateChange?.(s.velocity);

        const tier = Math.floor(s.velocity * 5);
        if (tier > s.lastTier) {
          cb.onHaptic('step_advance');
          s.lastTier = tier;
        }

        if (s.velocity >= COMPLETION_V) {
          s.completed = true;
          cb.onHaptic('seal_stamp');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      const windSpeed = TUNNEL_SPEED_MIN + (1 - s.dragCoeff) * (TUNNEL_SPEED_MAX - TUNNEL_SPEED_MIN);

      // ── LAYER 2: Wind tunnel walls ─────────────────────────────
      const wallTop = h * 0.08;
      const wallBot = h * 0.92;
      ctx.beginPath();
      ctx.moveTo(0, wallTop); ctx.lineTo(w, wallTop);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, wallBot); ctx.lineTo(w, wallBot);
      ctx.stroke();

      // Tunnel gradient
      const tunnelGrad = ctx.createLinearGradient(0, wallTop, 0, wallBot);
      tunnelGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.background.min * 0.3 * entrance));
      tunnelGrad.addColorStop(0.5, rgba(s.accentRgb, 0));
      tunnelGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.background.min * 0.3 * entrance));
      ctx.fillStyle = tunnelGrad;
      ctx.fillRect(0, wallTop, w, wallBot - wallTop);

      // ── LAYER 3: Wind particles ────────────────────────────────
      const chaosAlpha = ALPHA.atmosphere.min * s.dragCoeff;
      for (let i = 0; i < WIND_PARTICLE_CT; i++) {
        const seed = i * 83;
        const t = ((s.frameCount * windSpeed + seed) % (w + 80)) / (w + 80);
        const headX = w * (1 - t);
        const headY = wallTop + ((seed * 73) % (wallBot - wallTop - 20)) + 10;
        const len = px(0.02 + s.velocity * 0.04, minDim);

        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX + len, headY);
        ctx.strokeStyle = rgba(s.accentRgb, chaosAlpha * entrance * ms);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 4: Sculpted shape ────────────────────────────────
      if (s.sculptPts.length > 2) {
        // Shape fill
        ctx.beginPath();
        ctx.moveTo(s.sculptPts[0].x, s.sculptPts[0].y);
        for (let i = 1; i < s.sculptPts.length; i++) {
          ctx.lineTo(s.sculptPts[i].x, s.sculptPts[i].y);
        }
        if (s.sculptComplete) ctx.closePath();

        if (s.sculptComplete) {
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.fill();
        }

        const shapeAlpha = s.sculptComplete ? ALPHA.content.max * 0.6 : ALPHA.atmosphere.max;
        ctx.strokeStyle = rgba(s.primaryRgb, shapeAlpha * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Streamlines around sculpted form ──────────────
      if (s.sculptComplete && s.sculptPts.length > 5) {
        // Compute bounding box of sculpture
        let minSx = Infinity, maxSx = -Infinity, minSy = Infinity, maxSy = -Infinity;
        for (const pt of s.sculptPts) {
          if (pt.x < minSx) minSx = pt.x;
          if (pt.x > maxSx) maxSx = pt.x;
          if (pt.y < minSy) minSy = pt.y;
          if (pt.y > maxSy) maxSy = pt.y;
        }
        const sMidY = (minSy + maxSy) / 2;
        const sHalfH = (maxSy - minSy) / 2;

        for (let i = 0; i < STREAMLINE_CT; i++) {
          const streamFrac = (i + 0.5) / STREAMLINE_CT;
          const streamY = wallTop + streamFrac * (wallBot - wallTop);
          const distFromCenter = Math.abs(streamY - sMidY);

          ctx.beginPath();
          for (let t = 0; t <= 30; t++) {
            const frac = t / 30;
            let sx = frac * w;
            let sy = streamY;

            // Deflect around shape
            if (sx > minSx - px(0.05, w) && sx < maxSx + px(0.05, w) && distFromCenter < sHalfH * 2) {
              const deflect = Math.max(0, 1 - distFromCenter / (sHalfH * 2));
              const side = streamY > sMidY ? 1 : -1;
              sy += side * deflect * px(0.04, h) * (1 - s.dragCoeff);
            }

            // Wind oscillation
            sy += Math.sin(frac * 3 + s.frameCount * 0.02 * ms) * px(0.002, minDim) * s.dragCoeff;

            if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          const stAlpha = ALPHA.atmosphere.min * (0.3 + (1 - s.dragCoeff) * 0.4) * entrance * ms;
          ctx.strokeStyle = rgba(s.primaryRgb, stAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 6: Velocity trail ────────────────────────────────
      if (s.velocity > 0.2 && !s.completed) {
        const nx = s.nodeX * w;
        for (let i = 0; i < 5; i++) {
          const trailLen = px(0.03 + s.velocity * 0.06, minDim);
          const spread = (i - 2) * px(0.004, minDim);
          ctx.beginPath();
          ctx.moveTo(nx - nodeR, cy + spread);
          ctx.lineTo(nx - nodeR - trailLen, cy + spread);
          const tAlpha = ALPHA.atmosphere.min * s.velocity * (1 - Math.abs(i - 2) * 0.2) * entrance;
          ctx.strokeStyle = rgba(s.primaryRgb, tAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: Core node ──────────────────────────────────────
      if (!s.completed) {
        const nx = s.nodeX * w;

        // Glow — intensifies with velocity
        const gr = px(GLOW_R_NODE * (1 + s.velocity * 0.5), minDim);
        const glowInt = 0.2 + s.velocity * 0.4;
        const nGlow = ctx.createRadialGradient(nx, cy, 0, nx, cy, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, cy - gr, gr * 2, gr * 2);

        // Core — whitens at high velocity
        const coreColor = s.velocity > 0.5
          ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, (s.velocity - 0.5) * 0.6)
          : s.primaryRgb;
        ctx.beginPath();
        ctx.arc(nx, cy, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = rgba(coreColor, ALPHA.content.max * entrance);
        ctx.fill();

        // Sonic ring at high velocity
        if (s.velocity > 0.7) {
          const sonicR = nodeR * (3 + (s.velocity - 0.7) * 5);
          ctx.beginPath();
          ctx.arc(nx, cy, sonicR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * (s.velocity - 0.7) * 3 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: Cd readout + HUD ──────────────────────────────
      const fontSize = Math.max(10, px(FONT_SIZE.lg, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.sculptComplete) {
        const cdStr = s.dragCoeff.toFixed(2);
        ctx.fillStyle = rgba(s.dragCoeff < 0.2 ? s.primaryRgb : s.accentRgb,
                             ALPHA.text.max * 0.6 * entrance);
        ctx.fillText(`Cd ${cdStr}`, cx, wallTop - px(0.015, minDim));

        if (s.velocity > 0) {
          const smallFont = Math.max(8, px(FONT_SIZE.sm, minDim));
          ctx.font = `${smallFont}px monospace`;
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
          const vPct = Math.round(s.velocity * 100);
          ctx.fillText(`V ${vPct}%`, cx, h - px(0.03, minDim));
        }
      } else if (!s.drawing) {
        const hintFont = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${hintFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText('DRAW YOUR SHAPE', cx, h - px(0.04, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        // Static teardrop outline
        ctx.beginPath();
        ctx.ellipse(cx, cy, nodeR * 3, nodeR * 1.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.sculptPts = []; s.sculptComplete = false;
          s.dragCoeff = 1; s.velocity = 0; s.nodeX = 0.15;
          s.completed = false; s.lastTier = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.sculptComplete || s.completed) return;
      s.drawing = true;
      s.sculptPts = [];
      const rect = canvas.getBoundingClientRect();
      s.sculptPts.push({
        x: (e.clientX - rect.left) * (viewport.width / rect.width),
        y: (e.clientY - rect.top) * (viewport.height / rect.height),
      });
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      s.sculptPts.push({
        x: (e.clientX - rect.left) * (viewport.width / rect.width),
        y: (e.clientY - rect.top) * (viewport.height / rect.height),
      });
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.drawing = false;
      canvas.releasePointerCapture(e.pointerId);
      if (s.sculptPts.length >= MIN_SCULPT_PTS) {
        s.sculptComplete = true;
        s.dragCoeff = evaluateTeardrop(s.sculptPts);
        cbRef.current.onHaptic('step_advance');
        cbRef.current.onStateChange?.(1 - s.dragCoeff);
      }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
