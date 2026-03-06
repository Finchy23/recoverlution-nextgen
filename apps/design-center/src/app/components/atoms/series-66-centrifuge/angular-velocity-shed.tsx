/**
 * ATOM 652: THE ANGULAR VELOCITY ENGINE
 * =======================================
 * Series 66 — The Centrifuge · Position 2
 *
 * Speed is immunity. Rev up angular velocity past the critical
 * threshold — the rotational speed makes it impossible for sticky
 * drama sludge to maintain grip. It shears off into the void.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — sludge nodes
 * visibly shearing off the spinning core at critical RPM.
 *
 * PHYSICS:
 *   - Node moves slowly, heavy sludge attaches and drags
 *   - Swipe across node repeatedly to rev up like flywheel
 *   - Angular velocity accumulates with each swipe
 *   - At critical threshold: shear forces exceed sludge adhesion
 *   - Sludge tears off and flings away along tangent lines
 *   - Clean high-speed node remains
 *
 * INTERACTION: Swipe (repeated) → rev up → critical threshold → shed
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static clean node
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

const CORE_RADIUS      = 0.028;
const GLOW_R_CORE      = 0.1;
const SLUDGE_COUNT     = 8;
const SLUDGE_RADIUS    = 0.015;
const CRITICAL_RPM     = 0.75;         // threshold for shedding
const SPIN_GAIN        = 0.06;         // RPM per swipe
const SPIN_DECAY       = 0.995;
const SHED_VELOCITY    = 0.02;         // tangential launch speed
const RESPAWN_DELAY    = 90;

// =====================================================================
// STATE
// =====================================================================

interface SludgeNode {
  angle: number;              // position angle around core
  dist: number;               // distance from core center
  attached: boolean;
  shedVx: number;
  shedVy: number;
  shedX: number;
  shedY: number;
}

interface VelocityState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  rpm: number;
  rotAngle: number;
  sludge: SludgeNode[];
  dragging: boolean;
  lastX: number;
  swipeCount: number;
  completed: boolean;
  respawnTimer: number;
}

function makeSludge(): SludgeNode[] {
  return Array.from({ length: SLUDGE_COUNT }, (_, i) => ({
    angle: (i / SLUDGE_COUNT) * Math.PI * 2,
    dist: 0.05 + Math.random() * 0.02,
    attached: true,
    shedVx: 0, shedVy: 0, shedX: 0, shedY: 0,
  }));
}

function freshState(color: string, accent: string): VelocityState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    rpm: 0, rotAngle: 0,
    sludge: makeSludge(),
    dragging: false, lastX: 0, swipeCount: 0,
    completed: false, respawnTimer: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function AngularVelocityShedAtom({
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
      const coreR = px(CORE_RADIUS, minDim);

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.rpm *= SPIN_DECAY;
        s.rotAngle += s.rpm * 0.15;

        // Check shedding at critical RPM
        if (s.rpm >= CRITICAL_RPM) {
          for (const sl of s.sludge) {
            if (!sl.attached) continue;
            // Shed along tangent
            const worldAngle = sl.angle + s.rotAngle;
            const tangentAngle = worldAngle + Math.PI / 2;
            sl.attached = false;
            sl.shedX = 0.5 + Math.cos(worldAngle) * sl.dist;
            sl.shedY = 0.5 + Math.sin(worldAngle) * sl.dist;
            sl.shedVx = Math.cos(tangentAngle) * SHED_VELOCITY * s.rpm;
            sl.shedVy = Math.sin(tangentAngle) * SHED_VELOCITY * s.rpm;
          }
        }

        // Update shed particles
        let allShed = true;
        for (const sl of s.sludge) {
          if (sl.attached) { allShed = false; continue; }
          sl.shedX += sl.shedVx;
          sl.shedY += sl.shedVy;
          sl.shedVx *= 0.99;
          sl.shedVy *= 0.99;
        }

        // Progress
        const attachedCount = s.sludge.filter(sl => sl.attached).length;
        cb.onStateChange?.(1 - attachedCount / SLUDGE_COUNT);

        if (allShed && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // ── LAYER 2: Speed blur ring ───────────────────────────────
      if (s.rpm > 0.1) {
        const blurR = coreR + px(0.06, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, blurR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * s.rpm * entrance * ms);
        ctx.lineWidth = px(0.01 * s.rpm, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Tangent shed trails ───────────────────────────
      for (const sl of s.sludge) {
        if (sl.attached) continue;
        const sx = sl.shedX * w;
        const sy = sl.shedY * h;
        // Trail line from core to current position
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.2 * entrance * ms);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 4: Rotation motion lines ─────────────────────────
      if (s.rpm > 0.2) {
        const arcR = coreR * 2;
        for (let i = 0; i < 6; i++) {
          const startA = s.rotAngle + i * Math.PI / 3;
          const sweep = Math.min(Math.PI / 4, s.rpm * 0.5);
          ctx.beginPath();
          ctx.arc(cx, cy, arcR, startA, startA + sweep);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.4 * entrance * ms);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 5: Sludge nodes ──────────────────────────────────
      for (const sl of s.sludge) {
        let sx: number, sy: number;
        if (sl.attached) {
          const worldAngle = sl.angle + s.rotAngle;
          sx = cx + Math.cos(worldAngle) * px(sl.dist, minDim);
          sy = cy + Math.sin(worldAngle) * px(sl.dist, minDim);
        } else {
          sx = sl.shedX * w;
          sy = sl.shedY * h;
        }

        // Sludge glow
        const sgr = px(SLUDGE_RADIUS * 2.5, minDim);
        const sGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, sgr);
        sGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.15 * entrance));
        sGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = sGlow;
        ctx.fillRect(sx - sgr, sy - sgr, sgr * 2, sgr * 2);

        // Sludge body
        ctx.beginPath();
        ctx.arc(sx, sy, px(SLUDGE_RADIUS, minDim), 0, Math.PI * 2);
        const slAlpha = sl.attached ? ALPHA.content.max * 0.6 : ALPHA.content.max * 0.3;
        ctx.fillStyle = rgba(s.accentRgb, slAlpha * entrance);
        ctx.fill();

        // Connection line to core when attached
        if (sl.attached) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.4 * entrance);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 6: Core node ─────────────────────────────────────
      const gr = px(GLOW_R_CORE, minDim);
      const glowInt = 0.2 + s.rpm * 0.4;
      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow;
      ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * (1 + breath * 0.04), 0, Math.PI * 2);
      const coreColor = s.rpm > CRITICAL_RPM
        ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3)
        : s.primaryRgb;
      ctx.fillStyle = rgba(coreColor, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 7: RPM bar ───────────────────────────────────────
      const barW = px(SIZE.md * 0.7, minDim);
      const barH = px(0.008, minDim);
      const barX = cx - barW / 2;
      const barY = h - px(0.06, minDim);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);

      const barFill = Math.min(1, s.rpm / CRITICAL_RPM);
      const barColor = s.rpm >= CRITICAL_RPM ? s.primaryRgb : s.accentRgb;
      ctx.fillStyle = rgba(barColor, ALPHA.content.max * 0.5 * entrance);
      ctx.fillRect(barX, barY, barW * barFill, barH);

      // Critical threshold marker
      const threshX = barX + barW;
      ctx.setLineDash([px(0.003, minDim), px(0.004, minDim)]);
      ctx.beginPath();
      ctx.moveTo(threshX, barY - px(0.005, minDim));
      ctx.lineTo(threshX, barY + barH + px(0.005, minDim));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.rpm >= CRITICAL_RPM ? s.primaryRgb : s.accentRgb,
                           ALPHA.text.max * 0.4 * entrance);
      if (s.rpm >= CRITICAL_RPM) {
        ctx.fillText('SHEDDING', cx, barY - px(0.018, minDim));
      } else if (!s.completed) {
        ctx.fillText('SWIPE TO REV', cx, barY - px(0.018, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.rpm = 0; s.rotAngle = 0; s.sludge = makeSludge();
          s.completed = false; s.swipeCount = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.lastX = (e.clientX - rect.left) / rect.width;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const dx = Math.abs(mx - s.lastX);

      if (dx > 0.05) {
        s.rpm = Math.min(1, s.rpm + SPIN_GAIN);
        s.swipeCount++;
        s.lastX = mx;
        cbRef.current.onHaptic('step_advance');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
