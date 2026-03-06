/**
 * ATOM 671: THE PENDULUM DAMPENER ENGINE
 * ========================================
 * Series 68 — Counter-Balance · Position 1
 *
 * Cure all-or-nothing manic cycling. Place thumb at dead center
 * applying soft continuous friction — each pass dampens the wild
 * swing until perfect vertical equilibrium.
 *
 * SIGNATURE TECHNIQUE: Equilibrium counter-balance — visible
 * pendulum with amplitude decay envelope, friction pad glow,
 * oscillation damping toward mathematical center rest.
 *
 * INTERACTION: Hold (center friction pad) → dampen → rest
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static vertical
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const PIVOT_Y          = 0.15;
const PENDULUM_LENGTH  = 0.35;
const BOB_RADIUS       = 0.03;
const GRAVITY          = 0.0005;
const FREE_DAMPING     = 0.9998;
const FRICTION_DAMPING = 0.985;
const REST_THRESHOLD   = 0.015;
const PAD_RADIUS       = 0.05;
const RESPAWN_DELAY    = 100;

interface PendState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  angle: number;
  angVel: number;
  holding: boolean;
  maxAmplitude: number;
  completed: boolean;
  respawnTimer: number;
  trail: { x: number; y: number; alpha: number }[];
}

function freshState(c: string, a: string): PendState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    angle: Math.PI * 0.4, angVel: 0,
    holding: false, maxAmplitude: Math.PI * 0.4,
    completed: false, respawnTimer: 0, trail: [],
  };
}

export default function PendulumDampenerAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      const pivotX = cx;
      const pivotY = h * PIVOT_Y;
      const pendLen = px(PENDULUM_LENGTH, minDim);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        const damping = s.holding ? FRICTION_DAMPING : FREE_DAMPING;
        s.angVel += -GRAVITY * Math.sin(s.angle);
        s.angVel *= damping;
        s.angle += s.angVel;

        // Track amplitude
        s.maxAmplitude = Math.max(Math.abs(s.angle), s.maxAmplitude * 0.999);

        // Haptic at center crossing
        if (s.holding && Math.abs(s.angle) < 0.05 && Math.abs(s.angVel) > 0.001) {
          if (s.frameCount % 10 === 0) cb.onHaptic('step_advance');
        }

        const amplitude = Math.abs(s.angle);
        cb.onStateChange?.(1 - amplitude / (Math.PI * 0.4));

        if (amplitude < REST_THRESHOLD && Math.abs(s.angVel) < 0.001 && s.holding) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      const bobX = pivotX + Math.sin(s.angle) * pendLen;
      const bobY = pivotY + Math.cos(s.angle) * pendLen;
      const bobR = px(BOB_RADIUS, minDim);

      // Trail
      s.trail.push({ x: bobX / w, y: bobY / h, alpha: 0.4 });
      if (s.trail.length > 25) s.trail.shift();
      for (const t of s.trail) t.alpha *= 0.92;

      // ── LAYER 2: Amplitude envelope ────────────────
      const envX1 = pivotX - Math.sin(s.maxAmplitude) * pendLen;
      const envX2 = pivotX + Math.sin(s.maxAmplitude) * pendLen;
      ctx.setLineDash([px(0.004, minDim), px(0.006, minDim)]);
      ctx.beginPath();
      ctx.moveTo(envX1, bobY);
      ctx.lineTo(envX2, bobY);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── LAYER 3: Trail ─────────────────────────────
      for (const t of s.trail) {
        ctx.beginPath();
        ctx.arc(t.x * w, t.y * h, px(0.003, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, t.alpha * ALPHA.atmosphere.min * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 4: Pendulum arm ──────────────────────
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Pivot
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      // ── LAYER 5: Bob glow + body ───────────────────
      const gr = px(0.08, minDim);
      const nGlow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(bobX - gr, bobY - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(bobX, bobY, bobR * (1 + breath * 0.04), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 6: Friction pad at center ────────────
      const padX = pivotX;
      const padY = pivotY + pendLen;
      const padR = px(PAD_RADIUS, minDim);

      if (s.holding) {
        const padGlow = ctx.createRadialGradient(padX, padY, 0, padX, padY, padR * 2);
        padGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.2 * entrance));
        padGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = padGlow;
        ctx.fillRect(padX - padR * 2, padY - padR * 2, padR * 4, padR * 4);
      }

      ctx.beginPath();
      ctx.arc(padX, padY, padR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.holding ? s.accentRgb : s.primaryRgb,
                             ALPHA.content.max * (s.holding ? 0.4 : 0.2) * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ── LAYER 7: Vertical rest line ────────────────
      ctx.setLineDash([px(0.003, minDim), px(0.005, minDim)]);
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + pendLen + px(0.02, minDim));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      const ampDeg = Math.round(Math.abs(s.angle) * 180 / Math.PI);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
      ctx.fillText(`${ampDeg}°`, cx, h - px(0.035, minDim));

      if (!s.holding && !s.completed) {
        const hFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('HOLD CENTER TO DAMPEN', cx, h - px(0.06, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pivotX, pivotY + pendLen);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(pivotX, pivotY + pendLen, bobR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          Object.assign(s, freshState(color, accentColor));
          s.entranceProgress = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
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
