/**
 * ATOM 662: THE BRAKE CALIPER ENGINE
 * =====================================
 * Series 67 — Harmonious Friction · Position 2
 *
 * Learn to say no. Pinch violently inward on both sides of the
 * node — massive kinetic friction and visual heat. Hold the
 * painful tension until the node screeches to an absolute halt.
 *
 * SIGNATURE TECHNIQUE: Directional friction — dual caliper pads,
 * heat glow intensifying, friction coefficient rising, smoke
 * particles, screech visualization as node decelerates.
 *
 * PHYSICS:
 *   - Node dragged violently toward cliff edge
 *   - Place two fingers to engage brake caliper
 *   - Massive kinetic friction generates heat
 *   - Hold painful tension as node screeches to halt
 *   - Stop millimetres from the edge
 *
 * INTERACTION: Hold (press anywhere) → caliper squeeze → dead stop
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static stopped node
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const NODE_RADIUS      = 0.022;
const FALL_SPEED       = 0.003;
const BRAKE_FRICTION   = 0.0004;
const CLIFF_Y          = 0.88;
const CALIPER_WIDTH    = 0.04;
const SMOKE_SPAWN_RATE = 3;
const HEAT_BUILD_RATE  = 0.008;
const RESPAWN_DELAY    = 100;

interface SmokeP {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number;
}

interface BrakeState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeY: number;
  velY: number;
  braking: boolean;
  heat: number;
  smoke: SmokeP[];
  stopped: boolean;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): BrakeState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeY: 0.15, velY: FALL_SPEED, braking: false, heat: 0,
    smoke: [], stopped: false, completed: false, respawnTimer: 0,
  };
}

export default function BrakeCaliperStopAtom({
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
      const nodeR = px(NODE_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (s.braking && !s.stopped) {
          s.velY -= BRAKE_FRICTION * (1 + s.heat * 2);
          s.heat = Math.min(1, s.heat + HEAT_BUILD_RATE);
          if (s.velY <= 0) {
            s.velY = 0;
            s.stopped = true;
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
          // Smoke
          if (s.frameCount % SMOKE_SPAWN_RATE === 0) {
            s.smoke.push({
              x: cx / w + (Math.random() - 0.5) * 0.03,
              y: s.nodeY,
              vx: (Math.random() - 0.5) * 0.002,
              vy: -0.002 - Math.random() * 0.002,
              life: 30 + Math.random() * 20,
              maxLife: 30 + Math.random() * 20,
            });
          }
          if (s.frameCount % 5 === 0) cb.onHaptic('step_advance');
        } else if (!s.stopped) {
          s.velY = Math.min(0.008, s.velY + 0.00005);
        }

        s.nodeY += s.velY;

        // Cliff crash
        if (s.nodeY >= CLIFF_Y && !s.stopped) {
          s.completed = true;
          cb.onHaptic('error_boundary');
          s.respawnTimer = RESPAWN_DELAY;
        }

        // Smoke physics
        for (const sm of s.smoke) { sm.x += sm.vx; sm.y += sm.vy; sm.life--; }
        s.smoke = s.smoke.filter(sm => sm.life > 0);

        if (!s.stopped) {
          cb.onStateChange?.(s.braking ? Math.min(0.9, s.heat) : s.nodeY / CLIFF_Y * 0.3);
        }
      }

      const ny = s.nodeY * h;

      // ── LAYER 2: Track / channel ────────────────────
      const trackW = px(0.06, minDim);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(cx - trackW / 2, 0, trackW, h);

      // Distance markers
      for (let i = 0; i < 12; i++) {
        const my = h * (i / 12);
        ctx.beginPath();
        ctx.moveTo(cx - trackW / 2 - px(0.005, minDim), my);
        ctx.lineTo(cx - trackW / 2, my);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Cliff edge ─────────────────────────
      const cliffY = CLIFF_Y * h;
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.fillRect(0, cliffY, w, h - cliffY);
      ctx.beginPath();
      ctx.moveTo(0, cliffY);
      ctx.lineTo(w, cliffY);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // ── LAYER 4: Caliper pads ───────────────────────
      if (s.braking) {
        const padW = px(CALIPER_WIDTH, minDim);
        const padH = nodeR * 3;
        const squeeze = Math.min(1, s.heat * 1.5);
        const padDist = nodeR + padW * (1 - squeeze * 0.3);

        // Left pad
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (0.3 + s.heat * 0.3) * entrance);
        ctx.fillRect(cx - padDist - padW, ny - padH / 2, padW, padH);

        // Right pad
        ctx.fillRect(cx + padDist, ny - padH / 2, padW, padH);

        // Heat glow between pads
        if (s.heat > 0.2) {
          const heatGlow = ctx.createRadialGradient(cx, ny, nodeR, cx, ny, nodeR * 3);
          heatGlow.addColorStop(0, rgba(s.accentRgb, s.heat * ALPHA.glow.max * 0.3 * entrance));
          heatGlow.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = heatGlow;
          ctx.fillRect(cx - nodeR * 3, ny - nodeR * 3, nodeR * 6, nodeR * 6);
        }
      }

      // ── LAYER 5: Smoke particles ───────────────────
      for (const sm of s.smoke) {
        const smx = sm.x * w;
        const smy = sm.y * h;
        const frac = sm.life / sm.maxLife;
        const smR = px(0.004 + (1 - frac) * 0.006, minDim);
        ctx.beginPath();
        ctx.arc(smx, smy, smR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, frac * ALPHA.atmosphere.min * 0.4 * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 6: Speed streaks ─────────────────────
      if (s.velY > 0.001) {
        const streakCount = Math.floor(s.velY * 600);
        for (let i = 0; i < streakCount; i++) {
          const sx = cx + (Math.random() - 0.5) * trackW;
          const sy = ny - nodeR - Math.random() * px(0.08, minDim);
          const sLen = px(0.01 + s.velY * 5, minDim);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy - sLen);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: Node ──────────────────────────────
      const gr = px(0.08, minDim);
      const nGlow = ctx.createRadialGradient(cx, ny, 0, cx, ny, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(cx - gr, ny - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(cx, ny, nodeR * (1 + breath * 0.04), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.stopped) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('STOPPED', cx, px(0.04, minDim));
      } else if (s.braking) {
        const heatPct = Math.round(s.heat * 100);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText(`HEAT ${heatPct}%`, cx, px(0.04, minDim));
      } else {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('HOLD TO BRAKE', cx, px(0.04, minDim));
      }

      // Distance to cliff
      if (!s.stopped) {
        const dist = Math.max(0, CLIFF_Y - s.nodeY);
        const distPct = Math.round(dist * 100);
        const dFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${dFont}px monospace`;
        ctx.fillStyle = rgba(dist < 0.15 ? s.accentRgb : s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText(`${distPct}%`, cx, h - px(0.02, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
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
      const s = stateRef.current;
      if (s.completed) return;
      s.braking = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.braking = false;
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
