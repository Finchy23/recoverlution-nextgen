/**
 * ATOM 657: THE FLYWHEEL ENGINE
 * ===============================
 * Series 66 — The Centrifuge · Position 7
 *
 * Prove daily effort stores permanently. Keep swiping the heavy
 * wheel — friction drops with each rotation. After 10 swipes it
 * spins entirely on its own with infinite self-sustaining momentum.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — massive
 * flywheel with visible spokes, decreasing friction particles,
 * stored energy glow intensifying with each revolution.
 *
 * INTERACTION: Swipe (repeated) → friction drops → self-sustaining spin
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static spinning wheel
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  motionScale, type RGB,
} from '../atom-utils';

const WHEEL_RADIUS     = 0.28;
const SPOKE_COUNT      = 8;
const SWIPES_NEEDED    = 10;
const FRICTION_INIT    = 0.96;
const FRICTION_FINAL   = 0.9997;
const SPIN_PER_SWIPE   = 0.08;
const SELF_SUSTAIN_RPM = 0.3;
const GLOW_R_HUB       = 0.06;
const RESPAWN_DELAY    = 100;

interface WheelState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  rpm: number;
  angle: number;
  swipes: number;
  friction: number;
  dragging: boolean;
  lastX: number;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): WheelState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    rpm: 0, angle: 0, swipes: 0,
    friction: FRICTION_INIT, dragging: false, lastX: 0,
    completed: false, respawnTimer: 0,
  };
}

export default function FlywheelMomentumAtom({
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
      const wheelR = px(WHEEL_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.rpm *= s.friction;
        s.angle += s.rpm;

        // Self-sustaining check
        if (s.swipes >= SWIPES_NEEDED && s.rpm > 0.01 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // ── LAYER 2: Friction sparks (decrease with swipes) ─────
      const frictionLevel = 1 - s.swipes / SWIPES_NEEDED;
      if (s.rpm > 0.02 && frictionLevel > 0.1) {
        const sparkCount = Math.floor(frictionLevel * 6);
        for (let i = 0; i < sparkCount; i++) {
          const sa = s.angle + Math.random() * Math.PI * 2;
          const sr = wheelR + px(0.005 + Math.random() * 0.01, minDim);
          const sx = cx + Math.cos(sa) * sr;
          const sy = cy + Math.sin(sa) * sr;
          ctx.beginPath();
          ctx.arc(sx, sy, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, frictionLevel * ALPHA.content.max * 0.4 * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 3: Wheel rim ──────────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, wheelR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // Inner rim
      ctx.beginPath();
      ctx.arc(cx, cy, wheelR * 0.85, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── LAYER 4: Spokes ─────────────────────────────
      for (let i = 0; i < SPOKE_COUNT; i++) {
        const spokeAngle = s.angle + (i / SPOKE_COUNT) * Math.PI * 2;
        const sx = cx + Math.cos(spokeAngle) * px(0.03, minDim);
        const sy = cy + Math.sin(spokeAngle) * px(0.03, minDim);
        const ex = cx + Math.cos(spokeAngle) * wheelR * 0.85;
        const ey = cy + Math.sin(spokeAngle) * wheelR * 0.85;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Stored energy glow ─────────────────
      const storedEnergy = s.swipes / SWIPES_NEEDED;
      if (storedEnergy > 0) {
        const eGlow = ctx.createRadialGradient(cx, cy, wheelR * 0.3, cx, cy, wheelR);
        eGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * storedEnergy * entrance));
        eGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = eGlow;
        ctx.fillRect(cx - wheelR, cy - wheelR, wheelR * 2, wheelR * 2);
      }

      // ── LAYER 6: Hub ────────────────────────────────
      const hubR = px(GLOW_R_HUB, minDim);
      const hubGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR * 2);
      hubGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.2 + storedEnergy * 0.3) * entrance));
      hubGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = hubGlow;
      ctx.fillRect(cx - hubR * 2, cy - hubR * 2, hubR * 4, hubR * 4);

      ctx.beginPath();
      ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 7: Progress bar ───────────────────────
      const barW = px(SIZE.md * 0.7, minDim);
      const barH = px(0.008, minDim);
      const barX = cx - barW / 2;
      const barY = h - px(0.06, minDim);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fillRect(barX, barY, barW * storedEnergy, barH);

      // Swipe count markers
      for (let i = 0; i <= SWIPES_NEEDED; i++) {
        const mx = barX + (i / SWIPES_NEEDED) * barW;
        ctx.beginPath();
        ctx.moveTo(mx, barY - px(0.003, minDim));
        ctx.lineTo(mx, barY + barH + px(0.003, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`${s.swipes}/${SWIPES_NEEDED} REVOLUTIONS`, cx, barY - px(0.018, minDim));

      if (s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('SELF-SUSTAINING', cx, barY - px(0.04, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, wheelR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim);
        ctx.stroke();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.rpm = 0; s.angle = 0; s.swipes = 0;
          s.friction = FRICTION_INIT; s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

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
      const dx = mx - s.lastX;

      if (Math.abs(dx) > 0.06) {
        s.rpm = Math.min(0.5, s.rpm + SPIN_PER_SWIPE);
        s.swipes = Math.min(SWIPES_NEEDED, s.swipes + 1);
        // Friction decreases with each swipe
        const t = s.swipes / SWIPES_NEEDED;
        s.friction = FRICTION_INIT + t * (FRICTION_FINAL - FRICTION_INIT);
        s.lastX = mx;
        cbRef.current.onHaptic('swipe_commit');
        cbRef.current.onStateChange?.(t);
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
