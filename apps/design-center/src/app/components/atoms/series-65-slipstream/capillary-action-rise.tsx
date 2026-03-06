/**
 * ATOM 647: THE CAPILLARY ACTION ENGINE
 * =======================================
 * Series 65 — The Slipstream · Position 7
 *
 * Prove constraints generate automatic velocity. Drag two massive
 * walls inward — the intense constriction triggers capillary action
 * defying gravity, sucking the liquid node to the top.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — meniscus surface
 * tension visualization, capillary flow lines climbing the narrow
 * channel, converging wall geometry.
 *
 * PHYSICS:
 *   - Liquid node sits at bottom of wide flat container
 *   - Gravity holds it down; no upward movement possible
 *   - Drag two walls inward, constricting the horizontal space
 *   - Below a critical gap → capillary action triggers
 *   - Surface tension (meniscus) pulls liquid upward against gravity
 *   - Node rises automatically to the top as walls constrict
 *
 * INTERACTION: Drag (walls inward) → capillary trigger → rise
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static capillary
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

const NODE_RADIUS      = 0.018;
const GLOW_R_NODE      = 0.08;
const WALL_INIT_GAP    = 0.8;          // initial gap between walls (fraction of w)
const WALL_MIN_GAP     = 0.06;         // narrowest gap
const CAPILLARY_THRESH = 0.2;          // gap below which capillary triggers
const RISE_SPEED       = 0.004;        // rise speed when capillary active
const MENISCUS_HEIGHT  = 0.03;         // meniscus curve amplitude
const FLOW_LINE_CT     = 10;           // capillary flow streamlines
const SURFACE_DOTS     = 30;           // surface tension dots
const WALL_HEIGHT      = 0.85;         // wall coverage of viewport
const COMPLETION_Y     = 0.1;          // top threshold for completion
const RESPAWN_DELAY    = 90;

// =====================================================================
// STATE
// =====================================================================

interface CapillaryState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  leftWall: number;          // left wall X as fraction (0 = far left)
  rightWall: number;         // right wall X as fraction (1 = far right)
  nodeY: number;             // liquid level
  capillaryActive: boolean;
  dragging: 'left' | 'right' | null;
  completed: boolean;
  respawnTimer: number;
  lastTier: number;
  crownBloom: number;
}

function freshState(color: string, accent: string): CapillaryState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    leftWall: 0.1, rightWall: 0.9,
    nodeY: 0.85, capillaryActive: false,
    dragging: null, completed: false, respawnTimer: 0, lastTier: 0, crownBloom: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function CapillaryActionRiseAtom({
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

      const gap = s.rightWall - s.leftWall;
      const wallLx = s.leftWall * w;
      const wallRx = s.rightWall * w;
      const wallTop = h * (1 - WALL_HEIGHT) / 2;
      const wallBot = h - wallTop;

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        const wasActive = s.capillaryActive;
        s.capillaryActive = gap < CAPILLARY_THRESH;

        if (s.capillaryActive && !wasActive) {
          cb.onHaptic('step_advance');
        }

        if (s.capillaryActive) {
          // Rise speed proportional to constriction
          const constriction = 1 - (gap / CAPILLARY_THRESH);
          s.nodeY -= RISE_SPEED * (0.3 + constriction * 0.7);
          s.crownBloom = Math.min(1, s.crownBloom + 0.018);
          cb.onStateChange?.(Math.min(1, (0.85 - s.nodeY) / 0.75));

          if (s.nodeY <= COMPLETION_Y) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else {
          // Gravity pulls back down slowly
          s.nodeY = Math.min(0.85, s.nodeY + 0.0005);
          s.crownBloom *= 0.96;
        }
      }

      // ── LAYER 2: Background grid (wide = stagnant) ─────────────
      for (let i = 0; i < 8; i++) {
        const gy = wallTop + (i / 7) * (wallBot - wallTop);
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 0.5 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Wall structures ───────────────────────────────
      const wallW = px(0.02, minDim);

      // Left wall
      const lwGrad = ctx.createLinearGradient(wallLx - wallW, 0, wallLx + wallW, 0);
      lwGrad.addColorStop(0, rgba(s.accentRgb, 0));
      lwGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance));
      lwGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance));
      ctx.fillStyle = lwGrad;
      ctx.fillRect(wallLx - wallW, wallTop, wallW * 2, wallBot - wallTop);

      // Right wall
      const rwGrad = ctx.createLinearGradient(wallRx - wallW, 0, wallRx + wallW, 0);
      rwGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance));
      rwGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance));
      rwGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = rwGrad;
      ctx.fillRect(wallRx - wallW, wallTop, wallW * 2, wallBot - wallTop);

      // Wall inner edges
      ctx.beginPath();
      ctx.moveTo(wallLx, wallTop); ctx.lineTo(wallLx, wallBot);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wallRx, wallTop); ctx.lineTo(wallRx, wallBot);
      ctx.stroke();

      // ── LAYER 4: Liquid body (between walls, below nodeY) ──────
      const liquidTop = s.nodeY * h;
      if (liquidTop < wallBot) {
        const liqGrad = ctx.createLinearGradient(0, liquidTop, 0, wallBot);
        liqGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
        liqGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance));
        ctx.fillStyle = liqGrad;
        ctx.fillRect(wallLx, liquidTop, wallRx - wallLx, wallBot - liquidTop);
      }

      // ── LAYER 5: Meniscus curve ────────────────────────────────
      const menCx = (wallLx + wallRx) / 2;
      const menY  = liquidTop;
      const menAmp = px(MENISCUS_HEIGHT * (s.capillaryActive ? 1.5 : 0.3), h);

      ctx.beginPath();
      ctx.moveTo(wallLx, menY);
      ctx.quadraticCurveTo(menCx, menY - menAmp, wallRx, menY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Meniscus fill glow
      ctx.beginPath();
      ctx.moveTo(wallLx, menY);
      ctx.quadraticCurveTo(menCx, menY - menAmp, wallRx, menY);
      ctx.lineTo(wallRx, menY + px(0.01, h));
      ctx.lineTo(wallLx, menY + px(0.01, h));
      ctx.closePath();
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance);
      ctx.fill();

      // ── LAYER 6: Capillary flow streamlines ────────────────────
      if (s.capillaryActive) {
        for (let i = 0; i < FLOW_LINE_CT; i++) {
          const fx = wallLx + (i + 0.5) / FLOW_LINE_CT * (wallRx - wallLx);
          const flowLen = (0.85 - s.nodeY) * h * 0.8;
          const startY = wallBot - px(0.02, h);
          const endY = startY - flowLen;

          // Animated dash offset
          const dashOffset = (s.frameCount * 1.5 + i * 20) % 30;

          ctx.setLineDash([px(0.004, minDim), px(0.006, minDim)]);
          ctx.lineDashOffset = -dashOffset;
          ctx.beginPath();
          ctx.moveTo(fx, startY);
          ctx.lineTo(fx, endY);
          const flAlpha = ALPHA.atmosphere.min * 0.6 * entrance * ms;
          ctx.strokeStyle = rgba(s.primaryRgb, flAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.lineDashOffset = 0;

          // Arrow at top
          ctx.beginPath();
          ctx.moveTo(fx - px(0.003, minDim), endY + px(0.006, minDim));
          ctx.lineTo(fx, endY);
          ctx.lineTo(fx + px(0.003, minDim), endY + px(0.006, minDim));
          ctx.strokeStyle = rgba(s.primaryRgb, flAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      const crownStrength = s.completed ? 1 : s.crownBloom;
      if (crownStrength > 0.01) {
        const crownY = wallTop + px(0.05, h);
        const crownHalfW = (wallRx - wallLx) * (0.55 + crownStrength * 0.3);
        const crownHalfH = px(0.05 + crownStrength * 0.02, minDim);
        const crownGrad = ctx.createRadialGradient(menCx, crownY, 0, menCx, crownY, crownHalfW);
        crownGrad.addColorStop(0, rgba(s.primaryRgb, 0.14 * crownStrength * entrance));
        crownGrad.addColorStop(0.7, rgba(s.primaryRgb, 0.06 * crownStrength * entrance));
        crownGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = crownGrad;
        ctx.fillRect(menCx - crownHalfW, crownY - crownHalfH * 1.4, crownHalfW * 2, crownHalfH * 2.8);

        for (let i = 0; i < 5; i++) {
          const frac = i / 4;
          ctx.beginPath();
          ctx.moveTo(menCx, liquidTop - px(0.008, minDim));
          ctx.quadraticCurveTo(
            menCx + (frac - 0.5) * crownHalfW * 0.9,
            crownY + crownHalfH * (0.25 - frac * 0.3),
            menCx + (frac - 0.5) * crownHalfW,
            crownY
          );
          ctx.strokeStyle = rgba(s.primaryRgb, (0.05 + frac * 0.04) * crownStrength * entrance * ms);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: Surface tension dots along walls ──────────────
      for (let i = 0; i < SURFACE_DOTS; i++) {
        const dotY = liquidTop + (i / SURFACE_DOTS) * (wallBot - liquidTop);
        const side = i % 2 === 0 ? wallLx : wallRx;
        const inset = i % 2 === 0 ? px(0.004, minDim) : -px(0.004, minDim);
        const dotAlpha = (1 - i / SURFACE_DOTS) * ALPHA.atmosphere.min * 0.5 * entrance;

        ctx.beginPath();
        ctx.arc(side + inset, dotY, px(PARTICLE_SIZE.dot, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, dotAlpha);
        ctx.fill();
      }

      // ── LAYER 7b: Liquid node indicator ─────────────────────────
      if (!s.completed) {
        const nx = menCx;
        const ny = menY - menAmp * 0.5;

        // Glow
        const gr = px(GLOW_R_NODE, minDim);
        const glowInt = s.capillaryActive ? 0.4 : 0.2;
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

        // Core
        ctx.beginPath();
        ctx.arc(nx, ny, nodeR * (1 + breath * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── LAYER 8: HUD ───────────────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      // Gap indicator
      const gapPct = Math.round(gap * 100);
      ctx.fillStyle = rgba(s.capillaryActive ? s.primaryRgb : s.accentRgb,
                           ALPHA.text.max * 0.35 * entrance);
      ctx.fillText(`GAP ${gapPct}%`, cx, h - px(0.035, minDim));

      if (s.capillaryActive) {
        const smallFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${smallFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.45 * entrance);
        ctx.fillText('CAPILLARY ACTIVE', cx, h - px(0.06, minDim));
      }

      // Drag hints on walls
      if (!s.capillaryActive && !s.completed) {
        ctx.save();
        ctx.translate(wallLx + px(0.02, minDim), cy);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        const hintFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hintFont}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('◀ DRAG', 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(wallRx - px(0.02, minDim), cy);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.font = `${Math.max(7, px(FONT_SIZE.xs, minDim))}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('DRAG ▶', 0, 0);
        ctx.restore();
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        // Static: narrow walls, node at top
        ctx.beginPath();
        ctx.arc(cx, h * 0.15, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.leftWall = 0.1; s.rightWall = 0.9;
          s.nodeY = 0.85; s.capillaryActive = false;
          s.completed = false; s.lastTier = 0; s.crownBloom = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;

      // Determine which wall to drag
      const distL = Math.abs(mx - s.leftWall);
      const distR = Math.abs(mx - s.rightWall);
      s.dragging = distL < distR ? 'left' : 'right';
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;

      if (s.dragging === 'left') {
        s.leftWall = Math.max(0.02, Math.min(0.48, mx));
      } else {
        s.rightWall = Math.min(0.98, Math.max(0.52, mx));
      }

      // Ensure minimum gap
      if (s.rightWall - s.leftWall < WALL_MIN_GAP) {
        if (s.dragging === 'left') s.leftWall = s.rightWall - WALL_MIN_GAP;
        else s.rightWall = s.leftWall + WALL_MIN_GAP;
      }

      const gap = s.rightWall - s.leftWall;
      const tier = Math.floor((1 - gap / WALL_INIT_GAP) * 5);
      if (tier > s.lastTier) {
        cbRef.current.onHaptic('step_advance');
        s.lastTier = tier;
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = null;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
