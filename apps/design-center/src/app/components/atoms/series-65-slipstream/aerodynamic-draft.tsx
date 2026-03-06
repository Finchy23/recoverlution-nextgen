/**
 * ATOM 641: THE AERODYNAMIC DRAFT ENGINE
 * ========================================
 * Series 65 — The Slipstream · Position 1
 *
 * Cure ego-driven self-reliance. Drag behind the massive Mentor
 * node plowing through headwind — inside the drafting pocket
 * haptics go silent and you match top speed at zero energy cost.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — visible laminar
 * flow lines split around the mentor, forming a calm pocket void.
 *
 * PHYSICS:
 *   - Massive mentor node plows rightward through brutal headwind
 *   - Wind streamlines split around mentor in aerodynamic V-wake
 *   - User node outside pocket: buffeted, energy drains rapidly
 *   - Drag user into the slipstream pocket behind mentor
 *   - Inside pocket: wind drops to zero, speed matches for free
 *   - Energy bar refills; mentor tows user at max velocity
 *
 * INTERACTION: Drag (position behind mentor) -> pocket entry -> free ride
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static drafting diagram
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

const MENTOR_RADIUS   = 0.055;       // fraction of minDim — massive presence
const USER_RADIUS     = 0.018;       // small ego node
const MENTOR_SPEED    = 0.0025;      // steady rightward velocity
const POCKET_OFFSET   = 0.12;        // distance behind mentor center
const POCKET_HALF_W   = 0.055;       // horizontal tolerance
const POCKET_HALF_H   = 0.065;       // vertical tolerance
const WIND_COUNT      = 32;          // headwind streamline count
const STREAMLINE_CT   = 18;          // aerodynamic flow lines around mentor
const ENERGY_DRAIN    = 0.003;       // energy loss per frame outside pocket
const ENERGY_REFILL   = 0.008;       // energy gain inside pocket
const DRAFT_THRESHOLD = 180;         // frames in pocket to complete
const RESPAWN_DELAY   = 90;
const SHAKE_AMPLITUDE = 0.004;       // buffet shake outside pocket
const TRAIL_LENGTH    = 12;          // trailing afterimage count
const GLOW_RADIUS_M   = 0.15;       // mentor glow radius
const GLOW_RADIUS_U   = 0.06;       // user glow radius

// =====================================================================
// STATE
// =====================================================================

interface DraftState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  mentorX: number;
  mentorY: number;
  userX: number;
  userY: number;
  inPocket: boolean;
  draftTime: number;
  energy: number;
  dragging: boolean;
  completed: boolean;
  respawnTimer: number;
  trail: { x: number; y: number }[];
  hapticSent: boolean;
  pocketWake: number;
}

function freshState(color: string, accent: string): DraftState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    mentorX: 0.25, mentorY: 0.5,
    userX: 0.6, userY: 0.55,
    inPocket: false, draftTime: 0, energy: 1,
    dragging: false, completed: false, respawnTimer: 0,
    trail: [], hapticSent: false, pocketWake: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function AerodynamicDraftAtom({
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

    // ── RENDER LOOP ──────────────────────────────────────────────────
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

      const mentorR = px(MENTOR_RADIUS, minDim);
      const userR   = px(USER_RADIUS, minDim);

      // ── LAYER 1: Atmosphere ──────────────��──────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      // ── PHYSICS UPDATE ──────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        // Mentor advances rightward, wraps
        s.mentorX += MENTOR_SPEED;
        if (s.mentorX > 1.15) s.mentorX = -0.15;

        // Pocket check
        const pocketCx = s.mentorX - POCKET_OFFSET;
        const dx = Math.abs(s.userX - pocketCx);
        const dy = Math.abs(s.userY - s.mentorY);

        if (!s.inPocket && dx < POCKET_HALF_W && dy < POCKET_HALF_H) {
          s.inPocket = true;
          cb.onHaptic('drag_snap');
          s.hapticSent = false;
        }

        if (s.inPocket) {
          // Lock user into pocket
          s.userX = s.mentorX - POCKET_OFFSET;
          s.userY += (s.mentorY - s.userY) * 0.08;
          s.energy = Math.min(1, s.energy + ENERGY_REFILL);
          s.draftTime++;
          s.pocketWake = Math.min(1, s.pocketWake + 0.02);
          cb.onStateChange?.(Math.min(1, s.draftTime / DRAFT_THRESHOLD));
          if (s.draftTime >= DRAFT_THRESHOLD && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else {
          // Outside pocket: energy drains, buffeted
          s.energy = Math.max(0, s.energy - ENERGY_DRAIN);
          s.pocketWake *= 0.96;
          if (s.energy <= 0.05 && !s.hapticSent) {
            cb.onHaptic('error_boundary');
            s.hapticSent = true;
          }
        }

        // Trail history
        s.trail.push({ x: s.userX, y: s.userY });
        if (s.trail.length > TRAIL_LENGTH) s.trail.shift();
      }

      // ── LAYER 2: Headwind streamlines ───────────────────────────
      for (let i = 0; i < WIND_COUNT; i++) {
        const seed  = i * 137;
        const baseY = h * 0.05 + ((seed * 73) % (h * 0.9));
        const t     = ((s.frameCount * 2.5 + seed) % (w + 100)) / (w + 100);
        const headX = w * (1 - t);
        const len   = px(0.025, minDim) * (0.6 + (seed % 5) * 0.1);

        // Wind diminishes inside pocket region
        const pocketX = s.mentorX * w - px(POCKET_OFFSET, w);
        const inShadow = s.inPocket &&
          Math.abs(headX - pocketX) < px(POCKET_HALF_W * 2, w) &&
          Math.abs(baseY - s.mentorY * h) < px(POCKET_HALF_H * 2, h);
        const wAlpha = inShadow ? 0.02 : 0.6;

        ctx.beginPath();
        ctx.moveTo(headX, baseY);
        ctx.lineTo(headX + len, baseY);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * wAlpha * entrance * ms);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Aerodynamic streamlines around mentor ──────────
      const mx = s.mentorX * w;
      const my = s.mentorY * h;
      for (let i = 0; i < STREAMLINE_CT; i++) {
        const angle = (i / STREAMLINE_CT) * Math.PI * 2;
        const deflect = Math.abs(Math.cos(angle));
        const startR  = mentorR * 1.2;
        const endR    = mentorR * (2.5 + deflect * 2);

        const sx = mx + Math.cos(angle) * startR;
        const sy = my + Math.sin(angle) * startR;
        // Streamlines curve rearward
        const curveAngle = angle + Math.PI * 0.3 * Math.sign(Math.sin(angle));
        const ex = mx + Math.cos(curveAngle) * endR - px(0.04, minDim);
        const ey = my + Math.sin(curveAngle) * endR;

        const cpx = (sx + ex) / 2 - px(0.02, minDim);
        const cpy = (sy + ey) / 2 + Math.sin(angle) * px(0.01, minDim);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cpx, cpy, ex, ey);
        const streamAlpha = (0.15 + deflect * 0.2) * entrance * ms;
        ctx.strokeStyle = rgba(s.primaryRgb, streamAlpha);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 4: Slipstream V-pocket zone ───────────────────────
      const pocketApex = mx - mentorR;
      const pocketLen  = px(POCKET_OFFSET * 1.5, w);
      const pocketSpread = px(0.07, h);
      ctx.beginPath();
      ctx.moveTo(pocketApex, my);
      ctx.lineTo(pocketApex - pocketLen, my - pocketSpread);
      ctx.lineTo(pocketApex - pocketLen, my + pocketSpread);
      ctx.closePath();
      const pocketAlpha = s.inPocket ? 0.12 : 0.04;
      const pocketGrad = ctx.createLinearGradient(pocketApex, my, pocketApex - pocketLen, my);
      pocketGrad.addColorStop(0, rgba(s.primaryRgb, pocketAlpha * entrance));
      pocketGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = pocketGrad;
      ctx.fill();

      // Pocket boundary glow when active
      if (s.inPocket) {
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // Draft corridor: once the pocket is found, the whole field reorganizes
      // into a visible towing lane instead of a small local benefit.
      const wakeStrength = s.completed ? 1 : s.pocketWake;
      if (wakeStrength > 0.01) {
        const corridorY = my;
        const corridorStart = pocketApex - pocketLen;
        const corridorEnd = Math.min(w * 1.02, mx + px(0.26, minDim));
        const corridorHalfH = px(0.045 + wakeStrength * 0.03, minDim);

        for (let i = 0; i < 4; i++) {
          const frac = i / 3;
          const laneY = corridorY + (frac - 0.5) * corridorHalfH * 1.6;
          ctx.beginPath();
          for (let t = 0; t <= 24; t++) {
            const lineX = corridorStart + (t / 24) * (corridorEnd - corridorStart);
            const taper = 1 - t / 24;
            const wobble = Math.sin(t * 0.7 + s.frameCount * 0.05 + i) * corridorHalfH * 0.12 * taper;
            const bow = Math.sin((t / 24) * Math.PI) * corridorHalfH * 0.18 * (frac - 0.5);
            const lineY = laneY + wobble + bow;
            if (t === 0) ctx.moveTo(lineX, lineY);
            else ctx.lineTo(lineX, lineY);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, (0.05 + frac * 0.05) * wakeStrength * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        for (let i = 0; i < 3; i++) {
          const ringX = corridorStart + ((s.frameCount * 2 + i * 60) % Math.max(80, corridorEnd - corridorStart));
          const ringY = corridorY;
          const ringR = corridorHalfH * (0.7 + i * 0.18);
          ctx.beginPath();
          ctx.ellipse(ringX, ringY, ringR * 1.5, ringR, 0, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, 0.08 * wakeStrength * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 5: Mentor node with wake glow ─────────────────────
      // Outer glow
      const mGlow = ctx.createRadialGradient(mx, my, 0, mx, my, px(GLOW_RADIUS_M, minDim));
      mGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.25 * entrance));
      mGlow.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * entrance));
      mGlow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = mGlow;
      ctx.fillRect(mx - px(GLOW_RADIUS_M, minDim), my - px(GLOW_RADIUS_M, minDim),
                   px(GLOW_RADIUS_M * 2, minDim), px(GLOW_RADIUS_M * 2, minDim));

      // Core
      ctx.beginPath();
      ctx.arc(mx, my, mentorR * (1 + breath * 0.03), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.7 * entrance);
      ctx.fill();

      // Leading-edge highlight
      ctx.beginPath();
      ctx.arc(mx + mentorR * 0.3, my, mentorR * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.3),
                           ALPHA.content.max * 0.15 * entrance);
      ctx.fill();

      // ── LAYER 6: User trail ─────────────────────────────────────
      if (!s.completed && s.trail.length > 2) {
        for (let i = 0; i < s.trail.length; i++) {
          const t = s.trail[i];
          const frac = i / s.trail.length;
          ctx.beginPath();
          ctx.arc(t.x * w, t.y * h, userR * frac * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * frac * 0.5 * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 7: User node ──────────────────────────────────────
      if (!s.completed) {
        const ux = s.userX * w;
        const uy = s.userY * h;
        const shake = s.inPocket ? 0 : Math.sin(s.frameCount * 0.3 * ms) * px(SHAKE_AMPLITUDE, minDim);

        // User glow
        const uGlow = ctx.createRadialGradient(ux, uy, 0, ux, uy, px(GLOW_RADIUS_U, minDim));
        const glowIntensity = s.inPocket ? 0.4 : 0.15;
        uGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowIntensity * entrance));
        uGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = uGlow;
        const gr = px(GLOW_RADIUS_U, minDim);
        ctx.fillRect(ux - gr, uy - gr, gr * 2, gr * 2);

        // Core node
        ctx.beginPath();
        ctx.arc(ux + shake, uy, userR * (1 + breath * 0.08), 0, Math.PI * 2);
        const coreAlpha = s.inPocket ? ALPHA.content.max : ALPHA.content.max * (0.5 + s.energy * 0.5);
        ctx.fillStyle = rgba(s.primaryRgb, coreAlpha * entrance);
        ctx.fill();

        // Ring indicator when in pocket
        if (s.inPocket) {
          const ringR = userR * (2 + Math.sin(s.frameCount * 0.05) * 0.3);
          ctx.beginPath();
          ctx.arc(ux, uy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 8: Energy bar + HUD ──────────────────────────────
      const barW  = px(SIZE.md * 0.8, minDim);
      const barH  = px(0.008, minDim);
      const barX  = cx - barW / 2;
      const barY  = h - px(0.06, minDim);

      // Bar background
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * entrance);
      ctx.fillRect(barX, barY, barW, barH);

      // Bar fill
      const eColor = s.energy > 0.3 ? s.primaryRgb : s.accentRgb;
      ctx.fillStyle = rgba(eColor, ALPHA.content.max * 0.6 * entrance);
      ctx.fillRect(barX, barY, barW * s.energy, barH);

      // Speed indicator text
      if (s.inPocket) {
        const fontSize = Math.max(9, px(FONT_SIZE.sm, minDim));
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('DRAFTING', cx, barY - px(0.015, minDim));
      }

      // ── Reduced motion fallback ─────────────────────────────────
      if (p.reducedMotion) {
        // Static: mentor at center-right, user behind in pocket
        const smx = cx + px(0.1, minDim);
        const smy = cy;
        ctx.beginPath();
        ctx.arc(smx, smy, mentorR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();

        const sux = smx - px(POCKET_OFFSET, w);
        ctx.beginPath();
        ctx.arc(sux, smy, userR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Dashed pocket zone
        ctx.setLineDash([px(0.005, minDim), px(0.008, minDim)]);
        ctx.beginPath();
        ctx.moveTo(smx - mentorR, smy);
        ctx.lineTo(sux - px(0.04, minDim), smy - px(0.05, minDim));
        ctx.lineTo(sux - px(0.04, minDim), smy + px(0.05, minDim));
        ctx.closePath();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.mentorX = 0.25; s.mentorY = 0.5;
          s.userX = 0.6; s.userY = 0.55;
          s.inPocket = false; s.draftTime = 0; s.energy = 1;
          s.completed = false; s.hapticSent = false; s.trail = []; s.pocketWake = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS (native) ───────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.inPocket || s.completed) return;
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
