/**
 * ATOM 683: THE LEAD DOMINO ENGINE
 * ==================================
 * Series 69 — Minimum Effective Dose · Position 3
 *
 * Solve 50 problems with one nudge. Find the lead domino.
 * Apply a microscopic nudge — watch all 50 topple in cascading silence.
 *
 * PHYSICS:
 *   - 50 domino rectangles arranged in a curved cascade path
 *   - Each domino: upright rectangle that can tip and hit the next
 *   - Only the FIRST domino in the chain is tappable
 *   - Tapping any other domino = error (they're bolted)
 *   - Tapping lead domino: kinetic cascade starts
 *   - Each domino tips at 0.8 rad then contacts next one
 *   - Cascade speed increases slightly per domino (momentum)
 *   - Beautiful sequential tipping with haptic pulses at milestones
 *
 * INTERACTION:
 *   Tap lead domino → cascade begins (tap → step_advance → completion)
 *   Tap wrong domino → error_boundary
 *
 * RENDER: Canvas 2D with sequential domino tipping animation
 * REDUCED MOTION: Static all-toppled cascade
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const DOMINO_COUNT = 50;
const DOMINO_W = 0.006;
const DOMINO_H = 0.035;
const TIP_ANGLE = 0.85;            // radians to fully tip
const TIP_SPEED_BASE = 0.025;
const TIP_ACCELERATION = 1.01;     // each successive domino tips slightly faster
const CASCADE_CONTACT_ANGLE = 0.6; // angle at which next domino starts
const PATH_RADIUS = 0.32;          // curved path radius
const PATH_ARC = Math.PI * 1.4;    // total arc of the curve
const LEAD_PULSE_SPEED = 2;
const HIT_ZONE_R = 0.03;
const GLOW_LAYERS = 3;

interface Domino {
  x: number; y: number;
  baseAngle: number;    // orientation on path
  tipProgress: number;  // 0 = upright, 1 = fully tipped
  tipping: boolean;
  tipSpeed: number;
  isLead: boolean;
}

export default function LeadDominoCascadeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildDominos = (): Domino[] => {
    return Array.from({ length: DOMINO_COUNT }, (_, i) => {
      const t = i / (DOMINO_COUNT - 1);
      const angle = -PATH_ARC / 2 + t * PATH_ARC;
      return {
        x: 0.5 + Math.cos(angle + Math.PI / 2) * PATH_RADIUS,
        y: 0.5 + Math.sin(angle + Math.PI / 2) * PATH_RADIUS * 0.6,
        baseAngle: angle,
        tipProgress: 0,
        tipping: false,
        tipSpeed: TIP_SPEED_BASE * Math.pow(TIP_ACCELERATION, i),
        isLead: i === 0,
      };
    });
  };

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    dominos: buildDominos(),
    cascadeStarted: false,
    tippedCount: 0,
    milestone25: false,
    milestone75: false,
    completed: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        // All toppled
        for (const d of s.dominos) {
          const dx = d.x * w;
          const dy = d.y * h;
          const dW = px(DOMINO_W, minDim);
          const dH = px(DOMINO_H, minDim);
          ctx.save();
          ctx.translate(dx, dy);
          ctx.rotate(d.baseAngle + TIP_ANGLE);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
          ctx.fillRect(-dW / 2, -dH, dW, dH);
          ctx.restore();
        }
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve' && !s.cascadeStarted) {
        s.cascadeStarted = true;
        s.dominos[0].tipping = true;
      }

      // ── Cascade physics ───────────────────────────────────
      s.tippedCount = 0;
      for (let i = 0; i < s.dominos.length; i++) {
        const d = s.dominos[i];
        if (d.tipping) {
          d.tipProgress = Math.min(1, d.tipProgress + d.tipSpeed * ms);
          // Contact next domino
          if (d.tipProgress * TIP_ANGLE > CASCADE_CONTACT_ANGLE && i < s.dominos.length - 1) {
            s.dominos[i + 1].tipping = true;
          }
        }
        if (d.tipProgress >= 1) s.tippedCount++;
      }

      // Milestones
      if (s.tippedCount >= DOMINO_COUNT * 0.25 && !s.milestone25) {
        s.milestone25 = true;
        cb.onHaptic('step_advance');
      }
      if (s.tippedCount >= DOMINO_COUNT * 0.75 && !s.milestone75) {
        s.milestone75 = true;
        cb.onHaptic('step_advance');
      }
      if (s.tippedCount >= DOMINO_COUNT && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }

      cb.onStateChange?.(s.tippedCount / DOMINO_COUNT);

      // ── 1. Cascade path (subtle guide) ────────────────────
      ctx.beginPath();
      for (let i = 0; i < DOMINO_COUNT; i++) {
        const d = s.dominos[i];
        if (i === 0) ctx.moveTo(d.x * w, d.y * h);
        else ctx.lineTo(d.x * w, d.y * h);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // ── 2. Dominos ────────────────────────────────────────
      for (let i = 0; i < s.dominos.length; i++) {
        const d = s.dominos[i];
        const dx = d.x * w;
        const dy = d.y * h;
        const dW = px(DOMINO_W, minDim);
        const dH = px(DOMINO_H, minDim);
        const tipAngle = d.tipProgress * TIP_ANGLE;

        ctx.save();
        ctx.translate(dx, dy);
        ctx.rotate(d.baseAngle + tipAngle);

        // Domino body
        const domColor = d.tipProgress >= 1
          ? lerpColor(s.accentRgb, s.primaryRgb, 0.6)
          : d.tipping
            ? lerpColor(s.accentRgb, s.primaryRgb, d.tipProgress * 0.3)
            : s.accentRgb;
        const domAlpha = ALPHA.content.max * (d.tipProgress >= 1 ? 0.15 : 0.35) * entrance;
        ctx.fillStyle = rgba(domColor, domAlpha);
        ctx.fillRect(-dW / 2, -dH, dW, dH);

        // Center line on domino
        ctx.beginPath();
        ctx.moveTo(0, -dH * 0.2);
        ctx.lineTo(0, -dH * 0.8);
        ctx.strokeStyle = rgba(domColor, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.stroke();

        ctx.restore();

        // Lead domino glow
        if (d.isLead && !s.cascadeStarted) {
          const pulse = 0.5 + 0.5 * Math.sin(time * LEAD_PULSE_SPEED);
          const lg = ctx.createRadialGradient(dx, dy, 0, dx, dy, px(HIT_ZONE_R, minDim));
          lg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * pulse * entrance));
          lg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = lg;
          ctx.fillRect(dx - px(HIT_ZONE_R, minDim), dy - px(HIT_ZONE_R, minDim),
            px(HIT_ZONE_R * 2, minDim), px(HIT_ZONE_R * 2, minDim));
        }

        // Active tipping glow
        if (d.tipping && d.tipProgress < 1) {
          const tg = ctx.createRadialGradient(dx, dy, 0, dx, dy, dH * 0.8);
          tg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * entrance));
          tg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(dx - dH, dy - dH, dH * 2, dH * 2);
        }
      }

      // ── 3. Completion glow ────────────────────────────────
      if (s.completed) {
        const cR = px(SIZE.sm, minDim);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * 4);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.12 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - cR * 4, cy - cR * 4, cR * 8, cR * 8);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.cascadeStarted) return;
      const cb = callbacksRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Check lead domino
      const lead = s.dominos[0];
      if (Math.hypot(mx - lead.x, my - lead.y) < HIT_ZONE_R * 1.5) {
        s.cascadeStarted = true;
        lead.tipping = true;
        cb.onHaptic('tap');
        return;
      }

      // Wrong domino
      cb.onHaptic('error_boundary');
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
