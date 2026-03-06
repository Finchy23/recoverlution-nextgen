/**
 * ATOM 645: THE BOW WAVE ENGINE
 * ===============================
 * Series 65 — The Slipstream · Position 5
 *
 * Surf the terrifying approaching wave instead of running. Slow
 * down and position on the leading geometric edge — physics locks
 * you into the bow wave riding its massive kinetic energy.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — colossal wave
 * with spray particles, bow-crest edge geometry, and speed trail
 * streamlines behind the surfer node.
 *
 * PHYSICS:
 *   - Massive wave approaches from the right (behind user)
 *   - Running away (moving right) causes submersion + chaotic haptics
 *   - Slow down dramatically to match wave speed
 *   - Position on the leading bow-crest edge
 *   - Lock into wave physics: free ride at massive velocity
 *   - Spray streamlines erupt from bow edge as you surf
 *
 * INTERACTION: Drag (slow down + position on edge) → bow lock → surf
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static wave crest
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

const WAVE_SPEED       = 0.002;       // wave advance speed (fraction/frame)
const WAVE_HEIGHT      = 0.35;        // wave face height fraction
const WAVE_WIDTH       = 0.25;        // wave face width fraction
const NODE_RADIUS      = 0.018;
const GLOW_R_NODE      = 0.08;
const CREST_ZONE_W     = 0.06;        // horizontal lock zone
const CREST_ZONE_H     = 0.08;        // vertical lock zone
const SPRAY_COUNT      = 20;          // spray particles at bow
const SUBMERSION_SHAKE = 0.006;       // shake amplitude when submerged
const SURF_TRAIL_CT    = 8;           // speed trail lines when surfing
const RESPAWN_DELAY    = 100;

// =====================================================================
// STATE
// =====================================================================

interface WaveState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  waveX: number;           // wave leading edge X (fraction)
  userX: number;
  userY: number;
  dragging: boolean;
  locked: boolean;         // bow-locked
  submerged: boolean;
  surfTime: number;
  completed: boolean;
  respawnTimer: number;
  spray: { x: number; y: number; vx: number; vy: number; life: number }[];
}

function freshState(color: string, accent: string): WaveState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    waveX: 1.2, userX: 0.3, userY: 0.45,
    dragging: false, locked: false, submerged: false,
    surfTime: 0, completed: false, respawnTimer: 0, spray: [],
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function BowWaveSurfAtom({
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
      if (!p.reducedMotion && !s.completed) {
        // Wave advances leftward
        s.waveX -= WAVE_SPEED;

        // Submersion check: user is behind wave face
        s.submerged = !s.locked && s.userX > s.waveX - WAVE_WIDTH * 0.3;

        if (s.submerged && !s.locked) {
          cb.onHaptic('error_boundary');
        }

        // Bow lock check
        if (!s.locked && !s.submerged) {
          const dx = Math.abs(s.userX - s.waveX);
          const dy = Math.abs(s.userY - 0.4);
          if (dx < CREST_ZONE_W && dy < CREST_ZONE_H) {
            s.locked = true;
            cb.onHaptic('drag_snap');
          }
        }

        // Surfing: user rides the wave
        if (s.locked) {
          s.userX = s.waveX;
          s.userY += (0.38 - s.userY) * 0.05;
          s.surfTime++;
          cb.onStateChange?.(Math.min(1, s.surfTime / 200));

          // Spray generation
          if (s.frameCount % 3 === 0) {
            s.spray.push({
              x: s.userX, y: s.userY,
              vx: -0.003 - Math.random() * 0.005,
              vy: -0.002 - Math.random() * 0.004,
              life: 30 + Math.random() * 20,
            });
          }

          if (s.surfTime >= 200) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Wave wrap
        if (s.waveX < -0.3 && !s.locked) s.waveX = 1.2;

        // Spray physics
        for (const sp of s.spray) {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.0002; // gravity
          sp.life--;
        }
        s.spray = s.spray.filter(sp => sp.life > 0);
      }

      // ── LAYER 2: Ocean surface ──────────────────────────────────
      const oceanY = h * 0.55;
      const oceanGrad = ctx.createLinearGradient(0, oceanY, 0, h);
      oceanGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance));
      oceanGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.background.min * 4 * entrance));
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, oceanY, w, h - oceanY);

      // Ocean ripples
      for (let i = 0; i < 6; i++) {
        const ry = oceanY + i * h * 0.06;
        ctx.beginPath();
        for (let t = 0; t <= 30; t++) {
          const rx = (t / 30) * w;
          const rOff = Math.sin(t * 0.5 + s.frameCount * 0.02 * ms + i) * px(0.004, minDim);
          if (t === 0) ctx.moveTo(rx, ry + rOff); else ctx.lineTo(rx, ry + rOff);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Wave body ──────────────────────────────────────
      const waveLeadX = s.waveX * w;
      const waveTopY  = h * (0.55 - WAVE_HEIGHT);
      const waveBaseY = h * 0.55;

      ctx.beginPath();
      ctx.moveTo(waveLeadX, waveBaseY);
      // Curl up to crest
      ctx.quadraticCurveTo(
        waveLeadX + w * 0.02, waveTopY - px(0.02, minDim),
        waveLeadX + w * 0.05, waveTopY
      );
      // Curl lip
      ctx.quadraticCurveTo(
        waveLeadX + w * 0.08, waveTopY + px(0.02, minDim),
        waveLeadX + w * WAVE_WIDTH, waveBaseY
      );
      ctx.lineTo(waveLeadX + w * WAVE_WIDTH + w * 0.1, waveBaseY);
      ctx.lineTo(waveLeadX + w * WAVE_WIDTH + w * 0.1, h);
      ctx.lineTo(waveLeadX, h);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(waveLeadX, waveTopY, waveLeadX, h);
      waveGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
      waveGrad.addColorStop(0.5, rgba(lerpColor(s.accentRgb, s.primaryRgb, 0.3), ALPHA.content.max * 0.15 * entrance));
      waveGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
      ctx.fillStyle = waveGrad;
      ctx.fill();

      // Wave crest highlight
      ctx.beginPath();
      ctx.moveTo(waveLeadX, waveBaseY);
      ctx.quadraticCurveTo(
        waveLeadX + w * 0.02, waveTopY - px(0.02, minDim),
        waveLeadX + w * 0.05, waveTopY
      );
      ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
                             ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // ── LAYER 4: Spray particles ───────────────────────────────
      for (const sp of s.spray) {
        const spx = sp.x * w;
        const spy = sp.y * h;
        const spAlpha = (sp.life / 50) * ALPHA.atmosphere.max * entrance;
        ctx.beginPath();
        ctx.arc(spx, spy, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5), spAlpha);
        ctx.fill();
      }

      // ── LAYER 5: Crest zone indicator ──────────────────────────
      if (!s.locked && !s.completed && s.waveX < 0.8) {
        const czX = s.waveX * w;
        const czY = waveTopY + px(0.01, minDim);
        ctx.setLineDash([px(0.004, minDim), px(0.006, minDim)]);
        ctx.beginPath();
        ctx.arc(czX + w * 0.02, czY, px(CREST_ZONE_W, w) * 0.5, 0, Math.PI * 2);
        const pulseAlpha = 0.3 + Math.sin(s.frameCount * 0.08) * 0.1;
        ctx.strokeStyle = rgba(s.primaryRgb, pulseAlpha * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── LAYER 6: Surf speed trails ─────────────────────────────
      if (s.locked && !s.completed) {
        const nx = s.userX * w;
        const ny = s.userY * h;
        for (let i = 0; i < SURF_TRAIL_CT; i++) {
          const spread = (i - (SURF_TRAIL_CT - 1) / 2) * px(0.004, minDim);
          const len = px(0.04 + i * 0.005, minDim);
          ctx.beginPath();
          ctx.moveTo(nx + nodeR, ny + spread);
          ctx.lineTo(nx + nodeR + len, ny + spread);
          const tAlpha = ALPHA.atmosphere.min * (1 - Math.abs(i - 3.5) * 0.12) * entrance;
          ctx.strokeStyle = rgba(s.primaryRgb, tAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: User node ──────────────────────────────────────
      if (!s.completed) {
        const nx = s.userX * w;
        const ny = s.userY * h;
        const shake = s.submerged
          ? Math.sin(s.frameCount * 0.6 * ms) * px(SUBMERSION_SHAKE, minDim)
          : 0;

        // Glow
        const gr = px(GLOW_R_NODE, minDim);
        const glowInt = s.locked ? 0.45 : s.submerged ? 0.1 : 0.25;
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

        // Core
        ctx.beginPath();
        ctx.arc(nx + shake, ny + shake * 0.5, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        const coreAlpha = s.submerged ? 0.4 : 1;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * coreAlpha * entrance);
        ctx.fill();

        // Surf ring
        if (s.locked) {
          const ringR = nodeR * (2.5 + Math.sin(s.frameCount * 0.06) * 0.4);
          ctx.beginPath();
          ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.locked) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText('SURFING', cx, h - px(0.035, minDim));
      } else if (s.submerged) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('SUBMERGED', cx, h - px(0.035, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, h * 0.35, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.waveX = 1.2; s.userX = 0.3; s.userY = 0.45;
          s.locked = false; s.submerged = false;
          s.surfTime = 0; s.completed = false; s.spray = [];
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.locked || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      s.userX = (e.clientX - rect.left) / rect.width;
      s.userY = (e.clientY - rect.top) / rect.height;
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
