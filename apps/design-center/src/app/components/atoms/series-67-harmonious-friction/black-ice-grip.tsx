/**
 * ATOM 661: THE BLACK ICE ENGINE
 * ================================
 * Series 67 — Harmonious Friction · Position 1
 *
 * Prove compliance kills control. Deploy harsh spikes into
 * frictionless ice — loud grinding but the sudden friction
 * executes the exact directional turn saving the node.
 *
 * SIGNATURE TECHNIQUE: Directional friction — visible ice surface,
 * friction coefficient visualization, spike grinding marks, heat
 * streaks from deliberate friction deployment.
 *
 * PHYSICS:
 *   - Node slides at high speed across frictionless ice
 *   - Massive hazard approaches, steering fails without friction
 *   - Tap to deploy grip spikes into ice
 *   - Brutal grinding haptics, friction marks on surface
 *   - Sudden heavy friction executes precise directional turn
 *   - Node saved by deliberate friction deployment
 *
 * INTERACTION: Tap → deploy spikes → grinding turn → save
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static gripped node
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const NODE_RADIUS      = 0.022;
const GLOW_R_NODE      = 0.08;
const SLIDE_SPEED      = 0.004;        // initial frictionless speed
const ICE_FRICTION     = 0.0001;       // near-zero ice friction
const SPIKE_FRICTION   = 0.006;        // heavy spike friction
const HAZARD_X         = 0.85;         // wall position
const TURN_TARGET_Y    = 0.3;          // safe corridor Y
const GRIND_SPARK_CT   = 6;
const SPIKE_COUNT      = 5;
const SAVE_ZONE_X      = 0.75;         // must turn before this
const APPROACH_SPEED   = 0.002;
const RESPAWN_DELAY    = 100;

// =====================================================================
// STATE
// =====================================================================

interface GrindSpark {
  x: number; y: number; vx: number; vy: number; life: number;
}

interface IceState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  nodeY: number;
  velX: number;
  velY: number;
  spikesDeployed: boolean;
  grinding: boolean;
  grindTimer: number;
  sparks: GrindSpark[];
  grindMarks: { x: number; y: number }[];
  saved: boolean;
  crashed: boolean;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): IceState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.1, nodeY: 0.65, velX: SLIDE_SPEED, velY: 0,
    spikesDeployed: false, grinding: false, grindTimer: 0,
    sparks: [], grindMarks: [],
    saved: false, crashed: false,
    completed: false, respawnTimer: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function BlackIceGripAtom({
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
        const friction = s.spikesDeployed ? SPIKE_FRICTION : ICE_FRICTION;

        if (s.spikesDeployed && !s.saved && !s.crashed) {
          s.grinding = true;
          s.grindTimer++;
          // Apply turning force toward safe corridor
          const dy = TURN_TARGET_Y - s.nodeY;
          s.velY += dy * 0.0008;
          s.velX *= (1 - friction);
          s.velY *= (1 - friction * 0.3);

          // Grind sparks
          if (s.frameCount % 3 === 0) {
            s.sparks.push({
              x: s.nodeX, y: s.nodeY,
              vx: -0.003 + Math.random() * 0.006,
              vy: 0.001 + Math.random() * 0.003,
              life: 20 + Math.random() * 15,
            });
          }
          // Grind marks
          if (s.frameCount % 4 === 0) {
            s.grindMarks.push({ x: s.nodeX, y: s.nodeY });
          }

          if (s.grindTimer % 6 === 0) cb.onHaptic('error_boundary');
        }

        s.nodeX += s.velX;
        s.nodeY += s.velY;

        // Spark physics
        for (const sp of s.sparks) {
          sp.x += sp.vx; sp.y += sp.vy; sp.life--;
        }
        s.sparks = s.sparks.filter(sp => sp.life > 0);

        // Check outcomes
        if (s.nodeX >= HAZARD_X && !s.saved) {
          if (Math.abs(s.nodeY - TURN_TARGET_Y) < 0.12) {
            s.saved = true;
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          } else {
            s.crashed = true;
            cb.onHaptic('error_boundary');
            s.respawnTimer = RESPAWN_DELAY;
            s.completed = true;
          }
        }

        if (!s.spikesDeployed) {
          cb.onStateChange?.(Math.min(0.3, s.nodeX / HAZARD_X));
        } else {
          cb.onStateChange?.(0.3 + 0.7 * Math.min(1, s.grindTimer / 40));
        }
      }

      // ── LAYER 2: Ice surface ────────────────────────
      // Ice sheen
      const iceGrad = ctx.createLinearGradient(0, 0, w, 0);
      iceGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 0.5 * entrance));
      iceGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance));
      iceGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.background.min * 0.5 * entrance));
      ctx.fillStyle = iceGrad;
      ctx.fillRect(0, h * 0.45, w, h * 0.35);

      // Ice reflection streaks
      for (let i = 0; i < 8; i++) {
        const iy = h * (0.48 + i * 0.04);
        ctx.beginPath();
        ctx.moveTo(0, iy);
        ctx.lineTo(w, iy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Hazard wall ────────────────────────
      const wallX = HAZARD_X * w;
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.fillRect(wallX, 0, w - wallX, h);
      ctx.beginPath();
      ctx.moveTo(wallX, 0);
      ctx.lineTo(wallX, h);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // Safe corridor indicator
      const safeY = TURN_TARGET_Y * h;
      const safeH = h * 0.24;
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
      ctx.fillRect(wallX, safeY - safeH / 2, w - wallX, safeH);

      // ── LAYER 4: Grind marks on ice ─────────────────
      for (const gm of s.grindMarks) {
        ctx.beginPath();
        ctx.arc(gm.x * w, gm.y * h, px(0.003, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.4 * entrance);
        ctx.fill();
      }

      // ── LAYER 5: Grinding sparks ───────────────────
      for (const sp of s.sparks) {
        const spx = sp.x * w;
        const spy = sp.y * h;
        const spAlpha = (sp.life / 35) * ALPHA.content.max * 0.6 * entrance * ms;
        ctx.beginPath();
        ctx.arc(spx, spy, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.accentRgb, [255, 220, 100] as RGB, 0.5), spAlpha);
        ctx.fill();
      }

      // ── LAYER 6: Spikes visualization ───────────────
      if (s.spikesDeployed) {
        const nx = s.nodeX * w;
        const ny = s.nodeY * h;
        for (let i = 0; i < SPIKE_COUNT; i++) {
          const sa = (i / SPIKE_COUNT) * Math.PI * 2 + s.frameCount * 0.02;
          const sLen = px(0.012, minDim);
          ctx.beginPath();
          ctx.moveTo(nx + Math.cos(sa) * nodeR, ny + Math.sin(sa) * nodeR);
          ctx.lineTo(nx + Math.cos(sa) * (nodeR + sLen), ny + Math.sin(sa) * (nodeR + sLen));
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: Node ──────────────────────────────
      const nx = s.nodeX * w;
      const ny = s.nodeY * h;

      // Glow
      const gr = px(GLOW_R_NODE, minDim);
      const glowInt = s.grinding ? 0.4 : 0.2;
      const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(nx, ny, nodeR * (1 + breath * 0.04), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Speed trail
      if (s.velX > 0.001) {
        const trailLen = Math.min(px(0.15, minDim), s.velX * w * 8);
        const trailGrad = ctx.createLinearGradient(nx - trailLen, ny, nx, ny);
        trailGrad.addColorStop(0, rgba(s.primaryRgb, 0));
        trailGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.4 * entrance * ms));
        ctx.beginPath();
        ctx.moveTo(nx - trailLen, ny - nodeR * 0.4);
        ctx.lineTo(nx, ny - nodeR * 0.4);
        ctx.lineTo(nx, ny + nodeR * 0.4);
        ctx.lineTo(nx - trailLen, ny + nodeR * 0.4);
        ctx.closePath();
        ctx.fillStyle = trailGrad;
        ctx.fill();
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.saved) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('CONTROLLED', cx, h - px(0.035, minDim));
      } else if (s.crashed) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('IMPACT', cx, h - px(0.035, minDim));
      } else if (!s.spikesDeployed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('TAP TO DEPLOY SPIKES', cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.35 * entrance);
        ctx.fillText('GRINDING', cx, h - px(0.035, minDim));
      }

      // Friction coefficient
      const mu = s.spikesDeployed ? 'μ = 0.82' : 'μ = 0.01';
      const muFont = Math.max(7, px(FONT_SIZE.xs, minDim));
      ctx.font = `${muFont}px monospace`;
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
      ctx.fillText(mu, cx, px(0.04, minDim));

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

    const onDown = () => {
      const s = stateRef.current;
      if (!s.spikesDeployed && !s.completed) {
        s.spikesDeployed = true;
        cbRef.current.onHaptic('tap');
      }
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
