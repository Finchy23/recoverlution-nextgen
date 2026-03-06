/**
 * ATOM 659: THE TETHER SNAP ENGINE
 * ==================================
 * Series 66 — The Centrifuge · Position 9
 *
 * Cure the savior complex. Increase rotational speed to exceed
 * the tether tensile strength — the dead weight snaps free,
 * flung off screen. Core locks into flawless high-speed hum.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — visible
 * tether stretching under centrifugal load, wobble physics,
 * dramatic snap moment with tangential launch.
 *
 * INTERACTION: Drag (circular) → spin up → exceed tensile → snap
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static freed core
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const CORE_RADIUS      = 0.025;
const WEIGHT_RADIUS    = 0.035;
const TETHER_LENGTH    = 0.15;
const SNAP_RPM         = 0.7;
const SPIN_DECAY       = 0.994;
const SPIN_GAIN        = 0.008;
const WOBBLE_FACTOR    = 0.03;
const LAUNCH_SPEED     = 0.025;
const HUM_DURATION     = 120;
const RESPAWN_DELAY    = 100;

interface TetherState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  rpm: number;
  angle: number;
  snapped: boolean;
  weightX: number;
  weightY: number;
  weightVx: number;
  weightVy: number;
  humTimer: number;
  dragging: boolean;
  prevAngle: number;
  completed: boolean;
  respawnTimer: number;
  releaseField: number;
}

function freshState(c: string, a: string): TetherState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    rpm: 0, angle: 0, snapped: false,
    weightX: 0.5 + TETHER_LENGTH, weightY: 0.5,
    weightVx: 0, weightVy: 0, humTimer: 0,
    dragging: false, prevAngle: 0,
    completed: false, respawnTimer: 0, releaseField: 0,
  };
}

export default function TetherSnapReleaseAtom({
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
      const coreR = px(CORE_RADIUS, minDim);
      const weightR = px(WEIGHT_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.rpm *= SPIN_DECAY;
        s.angle += s.rpm * 0.12;

        if (!s.snapped) {
          // Weight orbits with wobble
          const wobble = WOBBLE_FACTOR * s.rpm;
          const tetherR = TETHER_LENGTH + wobble * Math.sin(s.frameCount * 0.3);
          s.weightX = 0.5 + Math.cos(s.angle) * tetherR;
          s.weightY = 0.5 + Math.sin(s.angle) * tetherR;

          // Snap check
          if (s.rpm >= SNAP_RPM) {
            s.snapped = true;
            const tangent = s.angle + Math.PI / 2;
            s.weightVx = Math.cos(tangent) * LAUNCH_SPEED * s.rpm;
            s.weightVy = Math.sin(tangent) * LAUNCH_SPEED * s.rpm;
            cb.onHaptic('swipe_commit');
          }

          cb.onStateChange?.(Math.min(1, s.rpm / SNAP_RPM));
        } else {
          // Weight flies away
          s.weightX += s.weightVx;
          s.weightY += s.weightVy;

          // Core stabilizes (hum)
          s.humTimer++;
          s.releaseField = Math.min(1, s.releaseField + 0.015);
          s.rpm = Math.min(1, s.rpm * 1.001); // slight acceleration (freed!)

          if (s.humTimer >= HUM_DURATION) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
        if (!s.snapped) s.releaseField *= 0.95;
      }

      // ── LAYER 2: Tether tension visualization ───────
      if (!s.snapped) {
        const tension = s.rpm / SNAP_RPM;
        const wx = s.weightX * w;
        const wy = s.weightY * h;

        // Tether line with tension color
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(wx, wy);
        const tetherColor = lerpColor(s.primaryRgb, s.accentRgb, tension);
        ctx.strokeStyle = rgba(tetherColor, ALPHA.content.max * (0.3 + tension * 0.4) * entrance);
        ctx.lineWidth = px(STROKE.medium + tension * 0.002, minDim);
        ctx.stroke();

        // Tension stress marks near snap
        if (tension > 0.6) {
          const stressCount = Math.floor((tension - 0.6) * 10);
          const midX2 = (cx + wx) / 2;
          const midY2 = (cy + wy) / 2;
          for (let i = 0; i < stressCount; i++) {
            const sa = Math.random() * Math.PI * 2;
            const sd = px(0.01 + Math.random() * 0.01, minDim);
            ctx.beginPath();
            ctx.moveTo(midX2 + Math.cos(sa) * sd, midY2 + Math.sin(sa) * sd);
            ctx.lineTo(midX2 + Math.cos(sa) * sd * 2, midY2 + Math.sin(sa) * sd * 2);
            ctx.strokeStyle = rgba(s.accentRgb, tension * ALPHA.content.max * 0.3 * entrance * ms);
            ctx.lineWidth = px(STROKE.thin, minDim);
            ctx.stroke();
          }
        }
      }

      // ── LAYER 3: Snap flash ─────────────────────────
      if (s.snapped && s.humTimer < 10) {
        const flashAlpha = (1 - s.humTimer / 10) * ALPHA.glow.max * 0.4 * entrance;
        const flashR = px(0.15, minDim);
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
        flash.addColorStop(0, rgba(s.primaryRgb, flashAlpha));
        flash.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = flash;
        ctx.fillRect(cx - flashR, cy - flashR, flashR * 2, flashR * 2);
      }

      // ── LAYER 4: Weight node ────────────────────────
      if (!s.snapped || (s.weightX > -0.1 && s.weightX < 1.1 && s.weightY > -0.1 && s.weightY < 1.1)) {
        const wx = s.weightX * w;
        const wy = s.weightY * h;

        ctx.beginPath();
        ctx.arc(wx, wy, weightR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();

        // Heavy indicator
        ctx.beginPath();
        ctx.arc(wx, wy, weightR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();
      }

      // ── LAYER 5: Orbit trail ────────────────────────
      if (!s.snapped && s.rpm > 0.05) {
        const trailCount = 12;
        for (let i = 0; i < trailCount; i++) {
          const ta = s.angle - (i + 1) * 0.15;
          const tr = TETHER_LENGTH;
          const tx = 0.5 + Math.cos(ta) * tr;
          const ty = 0.5 + Math.sin(ta) * tr;
          const frac = 1 - i / trailCount;
          ctx.beginPath();
          ctx.arc(tx * w, ty * h, weightR * frac * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * frac * 0.3 * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 6: Core glow + body ──────────────────
      const wobbleShake = !s.snapped && s.rpm > 0.2
        ? Math.sin(s.frameCount * 0.3 * ms) * px(WOBBLE_FACTOR * s.rpm, minDim) : 0;

      const gr = px(0.1, minDim);
      const glowInt = s.snapped ? 0.5 : 0.2;
      const cGlow = ctx.createRadialGradient(cx + wobbleShake, cy, 0, cx + wobbleShake, cy, gr);
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow;
      ctx.fillRect(cx - gr + wobbleShake, cy - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(cx + wobbleShake, cy, coreR * (1 + breath * 0.04), 0, Math.PI * 2);
      const coreColor = s.snapped
        ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2) : s.primaryRgb;
      ctx.fillStyle = rgba(coreColor, ALPHA.content.max * entrance);
      ctx.fill();

      // Hum ring (post-snap)
      if (s.snapped) {
        const humR = coreR * (2 + Math.sin(s.frameCount * 0.1) * 0.3);
        ctx.beginPath();
        ctx.arc(cx, cy, humR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      const releaseStrength = s.completed ? 1 : s.releaseField;
      if (releaseStrength > 0.01) {
        for (let i = 0; i < 4; i++) {
          const frac = i / 3;
          const ringR = coreR * (3.2 + frac * 2.4 + Math.sin(s.frameCount * 0.05 + i) * 0.12);
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, (0.05 + frac * 0.04) * releaseStrength * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        for (let i = 0; i < 6; i++) {
          const lineA = s.angle * 0.2 + (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(lineA) * coreR * 1.2, cy + Math.sin(lineA) * coreR * 1.2);
          ctx.lineTo(cx + Math.cos(lineA) * px(0.22, minDim), cy + Math.sin(lineA) * px(0.22, minDim));
          ctx.strokeStyle = rgba(s.primaryRgb, 0.05 * releaseStrength * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: Tension gauge ──────────────────────
      const barW = px(SIZE.md * 0.7, minDim);
      const barH = px(0.008, minDim);
      const barX = cx - barW / 2;
      const barY = h - px(0.06, minDim);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);

      const tension2 = Math.min(1, s.rpm / SNAP_RPM);
      const tColor = tension2 > 0.8 ? s.accentRgb : s.primaryRgb;
      ctx.fillStyle = rgba(tColor, ALPHA.content.max * 0.5 * entrance);
      ctx.fillRect(barX, barY, barW * tension2, barH);

      // Snap threshold
      ctx.setLineDash([px(0.003, minDim), px(0.004, minDim)]);
      ctx.beginPath();
      ctx.moveTo(barX + barW, barY - px(0.005, minDim));
      ctx.lineTo(barX + barW, barY + barH + px(0.005, minDim));
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.5 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.snapped) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('FREED', cx, barY - px(0.018, minDim));
      } else {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText('SPIN TO SNAP TETHER', cx, barY - px(0.018, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.rpm = 0; s.angle = 0; s.snapped = false;
          s.weightX = 0.5 + TETHER_LENGTH; s.weightY = 0.5;
          s.weightVx = 0; s.weightVy = 0; s.humTimer = 0;
          s.completed = false; s.releaseField = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.snapped) return;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      s.prevAngle = Math.atan2(my - 0.5, mx - 0.5);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const angle = Math.atan2(my - 0.5, mx - 0.5);
      let delta = angle - s.prevAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.rpm = Math.min(1, s.rpm + Math.abs(delta) * SPIN_GAIN * 10);
      s.prevAngle = angle;
      if (s.frameCount % 12 === 0 && s.rpm > 0.1) cbRef.current.onHaptic('step_advance');
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
