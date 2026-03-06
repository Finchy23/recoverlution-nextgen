/**
 * ATOM 670: THE APEX CARVE ENGINE
 * =================================
 * Series 67 — Harmonious Friction · Position 10 (Apex)
 *
 * The apex: seek the exact friction required to conquer the course.
 * Toggle between smooth glide and harsh carve — slam into violent
 * carve friction at every corner apex to pull G-force and rocket
 * out with maximised exit velocity.
 *
 * SIGNATURE TECHNIQUE: Directional friction — slalom gates, glide/carve
 * state toggle, G-force visualization, exit velocity measurement,
 * corner apex timing mechanic.
 *
 * INTERACTION: Tap (toggle carve) + Drag (steer) → apex timing → speed
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static slalom diagram
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const NODE_RADIUS      = 0.018;
const GATE_COUNT       = 6;
const GATE_SPACING     = 0.13;
const GATE_WIDTH       = 0.15;
const BASE_SPEED       = 0.003;
const CARVE_FRICTION   = 0.7;         // speed multiplier when carving
const CARVE_TURN_RATE  = 0.012;       // lateral movement when carving
const GLIDE_TURN_RATE  = 0.002;       // minimal lateral when gliding
const APEX_ZONE        = 0.03;        // distance to gate center for perfect apex
const SPEED_BONUS      = 0.001;       // per perfect apex
const RESPAWN_DELAY    = 110;

interface Gate {
  y: number;                    // scroll position
  xCenter: number;              // lateral center
  passed: boolean;
  perfect: boolean;
}

interface SlalomState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  scrollY: number;
  speed: number;
  carving: boolean;
  gates: Gate[];
  gatesPassed: number;
  perfectApex: number;
  targetX: number;
  dragging: boolean;
  completed: boolean;
  respawnTimer: number;
}

function makeGates(): Gate[] {
  return Array.from({ length: GATE_COUNT }, (_, i) => ({
    y: 0.3 + i * GATE_SPACING,
    xCenter: i % 2 === 0 ? 0.35 : 0.65,
    passed: false, perfect: false,
  }));
}

function freshState(c: string, a: string): SlalomState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.5, scrollY: 0, speed: BASE_SPEED,
    carving: false, gates: makeGates(), gatesPassed: 0, perfectApex: 0,
    targetX: 0.5, dragging: false,
    completed: false, respawnTimer: 0,
  };
}

export default function ApexCarveSlalomAtom({
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
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);
      const nodeScreenY = h * 0.75;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.scrollY += s.speed;

        // Lateral movement
        const turnRate = s.carving ? CARVE_TURN_RATE : GLIDE_TURN_RATE;
        const dx = s.targetX - s.nodeX;
        s.nodeX += dx * turnRate;

        // Speed: carving slows, gliding maintains
        if (s.carving) {
          s.speed = Math.max(BASE_SPEED * 0.5, s.speed * CARVE_FRICTION);
        } else {
          s.speed = Math.min(BASE_SPEED * 2, s.speed * 1.005);
        }

        // Gate passing
        for (const gate of s.gates) {
          if (gate.passed) continue;
          const gateScreenY = gate.y - s.scrollY;
          if (gateScreenY < 0) {
            gate.passed = true;
            s.gatesPassed++;

            const dist = Math.abs(s.nodeX - gate.xCenter);
            if (dist < APEX_ZONE) {
              gate.perfect = true;
              s.perfectApex++;
              s.speed += SPEED_BONUS;
              cb.onHaptic('step_advance');
            } else if (dist < GATE_WIDTH / 2) {
              cb.onHaptic('drag_snap');
            } else {
              cb.onHaptic('error_boundary');
            }

            cb.onStateChange?.(s.gatesPassed / GATE_COUNT);
          }
        }

        if (s.gatesPassed >= GATE_COUNT) {
          s.completed = true;
          cb.onHaptic('seal_stamp');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // ── LAYER 2: Course edges ──────────────────────
      const courseLeft = w * 0.1;
      const courseRight = w * 0.9;
      ctx.beginPath();
      ctx.moveTo(courseLeft, 0); ctx.lineTo(courseLeft, h);
      ctx.moveTo(courseRight, 0); ctx.lineTo(courseRight, h);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // ── LAYER 3: Gates ─────────────────────────────
      for (const gate of s.gates) {
        const gy = (gate.y - s.scrollY) * h + h * 0.25;
        if (gy < -50 || gy > h + 50) continue;

        const gx = gate.xCenter * w;
        const gw = GATE_WIDTH * w / 2;

        // Gate posts
        ctx.beginPath();
        ctx.moveTo(gx - gw, gy - px(0.01, minDim));
        ctx.lineTo(gx - gw, gy + px(0.01, minDim));
        ctx.moveTo(gx + gw, gy - px(0.01, minDim));
        ctx.lineTo(gx + gw, gy + px(0.01, minDim));
        const gateColor = gate.passed
          ? (gate.perfect ? s.primaryRgb : s.accentRgb) : s.primaryRgb;
        ctx.strokeStyle = rgba(gateColor, ALPHA.content.max * (gate.passed ? 0.3 : 0.5) * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim);
        ctx.stroke();

        // Gate line
        ctx.beginPath();
        ctx.moveTo(gx - gw, gy);
        ctx.lineTo(gx + gw, gy);
        ctx.strokeStyle = rgba(gateColor, ALPHA.atmosphere.min * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // Apex dot
        ctx.beginPath();
        ctx.arc(gx, gy, px(0.004, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(gateColor, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
      }

      // ── LAYER 4: Carve marks ───────────────────────
      if (s.carving && s.speed > 0.001) {
        const nx = s.nodeX * w;
        // Friction marks behind node
        for (let i = 0; i < 4; i++) {
          const my = nodeScreenY + px(0.01 + i * 0.008, minDim);
          const mx2 = nx + (Math.random() - 0.5) * px(0.01, minDim);
          ctx.beginPath();
          ctx.arc(mx2, my, px(PARTICLE_SIZE.xs, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 5: G-force indicator ─────────────────
      if (s.carving) {
        const nx = s.nodeX * w;
        const lateralForce = Math.abs(s.targetX - s.nodeX) * 10;
        const gForceR = px(0.02 + lateralForce * 0.05, minDim);
        const gGlow = ctx.createRadialGradient(nx, nodeScreenY, 0, nx, nodeScreenY, gForceR);
        gGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.2 * entrance));
        gGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = gGlow;
        ctx.fillRect(nx - gForceR, nodeScreenY - gForceR, gForceR * 2, gForceR * 2);
      }

      // ── LAYER 6: Node ──────────────────────────────
      const nx = s.nodeX * w;
      const gr = px(0.06, minDim);
      const nGlow = ctx.createRadialGradient(nx, nodeScreenY, 0, nx, nodeScreenY, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(nx - gr, nodeScreenY - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(nx, nodeScreenY, nodeR, 0, Math.PI * 2);
      const nodeColor = s.carving
        ? lerpColor(s.primaryRgb, s.accentRgb, 0.3) : s.primaryRgb;
      ctx.fillStyle = rgba(nodeColor, ALPHA.content.max * entrance);
      ctx.fill();

      if (s.perfectApex > 0) {
        const laneWidth = px(0.018, minDim) * Math.min(1.8, 0.9 + s.perfectApex * 0.12);
        ctx.beginPath();
        ctx.moveTo(nx, nodeScreenY - laneWidth * 0.45);
        ctx.lineTo(nx + px(0.09 + s.perfectApex * 0.01, minDim), nodeScreenY - px(0.11, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * 0.12 * entrance);
        ctx.lineWidth = laneWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(nx, nodeScreenY - laneWidth * 0.15);
        ctx.lineTo(nx + px(0.09 + s.perfectApex * 0.01, minDim), nodeScreenY - px(0.11, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance);
        ctx.lineWidth = px(0.0022, minDim);
        ctx.stroke();
      }

      // Mode ring
      const modeR = nodeR * 1.6;
      ctx.beginPath();
      ctx.arc(nx, nodeScreenY, modeR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.carving ? s.accentRgb : s.primaryRgb,
                             ALPHA.atmosphere.max * 0.3 * entrance);
      ctx.lineWidth = px(s.carving ? STROKE.bold : STROKE.thin, minDim);
      ctx.stroke();

      // ── LAYER 7: Speed bar ─────────────────────────
      const barW = px(SIZE.md * 0.5, minDim);
      const barH = px(0.006, minDim);
      const barX = cx - barW / 2;
      const barY = h - px(0.08, minDim);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      const speedFrac = Math.min(1, s.speed / (BASE_SPEED * 2));
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(barX, barY, barW * speedFrac, barH);

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      // Mode label
      ctx.fillStyle = rgba(s.carving ? s.accentRgb : s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(s.carving ? 'CARVE' : 'GLIDE', cx, px(0.04, minDim));

      // Gate progress
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
      ctx.fillText(`${s.gatesPassed}/${GATE_COUNT} · ${s.perfectApex} PERFECT`, cx, h - px(0.035, minDim));

      if (p.reducedMotion) {
        // Static slalom diagram
        for (let i = 0; i < 4; i++) {
          const gx2 = (i % 2 === 0 ? 0.35 : 0.65) * w;
          const gy2 = h * (0.25 + i * 0.15);
          ctx.beginPath();
          ctx.arc(gx2, gy2, px(0.005, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
          ctx.fill();
        }
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
      s.carving = !s.carving;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.targetX = (e.clientX - rect.left) / rect.width;
      cbRef.current.onHaptic('tap');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.targetX = (e.clientX - rect.left) / rect.width;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
