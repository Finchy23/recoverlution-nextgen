/**
 * ATOM 658: THE EXPANDING RADIUS ENGINE
 * =======================================
 * Series 66 — The Centrifuge · Position 8
 *
 * Claim your sphere of influence. Spin your core then drag the
 * boundary outward — the faster you spin, the more force the
 * expanding radius has pushing aggressive nodes to screen edges.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — expanding
 * boundary ring with radial force arrows, aggressive nodes pushed.
 *
 * INTERACTION: Drag (circular + outward) → spin + expand → claim space
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static boundary
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
const AGGRO_COUNT      = 12;
const BOUNDARY_MIN     = 0.08;
const BOUNDARY_MAX     = 0.42;
const SPIN_DECAY       = 0.993;
const SPIN_GAIN        = 0.008;
const PUSH_FORCE       = 0.002;
const PUSH_THRESHOLD   = 0.85;         // fraction of aggros at edge to complete
const RESPAWN_DELAY    = 90;

interface AggroNode {
  x: number; y: number; vx: number; vy: number; pushed: boolean;
}

interface ExpandState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  rpm: number;
  angle: number;
  boundary: number;
  aggros: AggroNode[];
  dragging: boolean;
  prevAngle: number;
  completed: boolean;
  respawnTimer: number;
  claimStrength: number;
}

function makeAggros(): AggroNode[] {
  return Array.from({ length: AGGRO_COUNT }, () => {
    const a = Math.random() * Math.PI * 2;
    const d = 0.06 + Math.random() * 0.08;
    return { x: 0.5 + Math.cos(a) * d, y: 0.5 + Math.sin(a) * d, vx: 0, vy: 0, pushed: false };
  });
}

function freshState(c: string, a: string): ExpandState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    rpm: 0, angle: 0, boundary: BOUNDARY_MIN,
    aggros: makeAggros(), dragging: false, prevAngle: 0,
    completed: false, respawnTimer: 0, claimStrength: 0,
  };
}

export default function ExpandingRadiusAtom({
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
      const boundR = px(s.boundary, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.rpm *= SPIN_DECAY;
        s.angle += s.rpm * 0.15;

        // Expand boundary with RPM
        if (s.rpm > 0.1 && s.dragging) {
          s.boundary = Math.min(BOUNDARY_MAX, s.boundary + 0.001 * s.rpm);
        }

        // Push aggros outside boundary
        let edgeCount = 0;
        for (const ag of s.aggros) {
          const dx = ag.x - 0.5;
          const dy = ag.y - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < s.boundary && s.rpm > 0.1) {
            const force = PUSH_FORCE * s.rpm * (s.boundary - dist) / s.boundary;
            if (dist > 0.01) {
              ag.vx += (dx / dist) * force;
              ag.vy += (dy / dist) * force;
            }
            if (!ag.pushed) {
              ag.pushed = true;
              cb.onHaptic('step_advance');
            }
          }

          ag.x += ag.vx;
          ag.y += ag.vy;
          ag.vx *= 0.96;
          ag.vy *= 0.96;

          // Crowd back toward center when no spin
          if (s.rpm < 0.05) {
            ag.vx += (0.5 - ag.x) * 0.0003;
            ag.vy += (0.5 - ag.y) * 0.0003;
            ag.pushed = false;
          }

          ag.x = Math.max(0, Math.min(1, ag.x));
          ag.y = Math.max(0, Math.min(1, ag.y));
          if (dist > 0.42) edgeCount++;
        }

        s.claimStrength = Math.min(1, edgeCount / (AGGRO_COUNT * PUSH_THRESHOLD));

        cb.onStateChange?.(Math.min(1, edgeCount / (AGGRO_COUNT * PUSH_THRESHOLD)));

        if (edgeCount >= AGGRO_COUNT * PUSH_THRESHOLD) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
        if (s.rpm < 0.05) s.claimStrength *= 0.97;
      }

      // ── LAYER 2: Boundary field fill ────────────────
      const bGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, boundR);
      bGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 3 * entrance));
      bGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance));
      bGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bGrad;
      ctx.fillRect(cx - boundR, cy - boundR, boundR * 2, boundR * 2);

      // ── LAYER 3: Boundary ring ──────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, boundR, 0, Math.PI * 2);
      const ringPulse = s.rpm > 0.1 ? 0.5 + Math.sin(s.frameCount * 0.06) * 0.1 : 0.2;
      ctx.strokeStyle = rgba(s.primaryRgb, ringPulse * ALPHA.content.max * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      const claimStrength = s.completed ? 1 : s.claimStrength;
      if (claimStrength > 0.01) {
        for (let i = 0; i < 6; i++) {
          const beaconA = s.angle * 0.25 + (i / 6) * Math.PI * 2;
          const beaconR = boundR * (0.86 + claimStrength * 0.08);
          const bx = cx + Math.cos(beaconA) * beaconR;
          const by = cy + Math.sin(beaconA) * beaconR;
          ctx.beginPath();
          ctx.arc(bx, by, px(0.008 + claimStrength * 0.004, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, 0.1 * claimStrength * entrance);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(beaconA) * coreR * 1.6, cy + Math.sin(beaconA) * coreR * 1.6);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = rgba(s.primaryRgb, 0.05 * claimStrength * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 4: Radial force arrows ────────────────
      if (s.rpm > 0.1) {
        for (let i = 0; i < 8; i++) {
          const arrowA = s.angle + (i / 8) * Math.PI * 2;
          const innerR2 = coreR * 2;
          const outerR2 = boundR * 0.85;
          const ax1 = cx + Math.cos(arrowA) * innerR2;
          const ay1 = cy + Math.sin(arrowA) * innerR2;
          const ax2 = cx + Math.cos(arrowA) * outerR2;
          const ay2 = cy + Math.sin(arrowA) * outerR2;

          ctx.beginPath();
          ctx.moveTo(ax1, ay1);
          ctx.lineTo(ax2, ay2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * s.rpm * entrance * ms);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();

          // Arrow tip
          const tipLen = px(0.008, minDim);
          ctx.beginPath();
          ctx.moveTo(ax2, ay2);
          ctx.lineTo(ax2 - Math.cos(arrowA - 0.4) * tipLen, ay2 - Math.sin(arrowA - 0.4) * tipLen);
          ctx.moveTo(ax2, ay2);
          ctx.lineTo(ax2 - Math.cos(arrowA + 0.4) * tipLen, ay2 - Math.sin(arrowA + 0.4) * tipLen);
          ctx.stroke();
        }
      }

      // ── LAYER 5: Aggro nodes ────────────────────────
      for (const ag of s.aggros) {
        const agx = ag.x * w;
        const agy = ag.y * h;
        ctx.beginPath();
        ctx.arc(agx, agy, px(PARTICLE_SIZE.lg, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
      }

      // ── LAYER 6: Core glow + body ──────────────────
      const gr = px(0.1, minDim);
      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * (0.2 + s.rpm * 0.4) * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow;
      ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * (1 + breath * 0.04), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Spin marks
      if (s.rpm > 0.05) {
        for (let i = 0; i < 4; i++) {
          const ma = s.angle + i * Math.PI / 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ma) * coreR * 0.6, cy + Math.sin(ma) * coreR * 0.6,
                  px(0.003, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
                               ALPHA.content.max * 0.4 * entrance);
          ctx.fill();
        }
      }

      // ── LAYER 7-8: HUD ─────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      const radiusPct = Math.round((s.boundary - BOUNDARY_MIN) / (BOUNDARY_MAX - BOUNDARY_MIN) * 100);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`RADIUS ${radiusPct}%`, cx, h - px(0.035, minDim));

      if (s.rpm < 0.05 && !s.completed) {
        const hFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('SPIN AND EXPAND', cx, h - px(0.06, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, px(BOUNDARY_MAX, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.rpm = 0; s.boundary = BOUNDARY_MIN; s.aggros = makeAggros();
          s.completed = false; s.claimStrength = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
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
