/**
 * ATOM 394: THE QUENCH ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 4
 *
 * Cure vulnerability hangover after a major launch or hard conversation.
 * Drop the red-hot node into the pool to harden into impervious steel.
 *
 * PHYSICS:
 *   - Glowing red-hot soft-body node at top of viewport
 *   - Deep liquid pool occupies lower 35% of viewport
 *   - Pool surface has subtle wave animation
 *   - Drag node downward into pool
 *   - On contact: massive steam eruption (40+ particles)
 *   - Node sinks, color shifts from hot-glow to cool-steel
 *   - Hardened node rises back to center with crystalline edge ring
 *   - Final state: impervious steel sphere with protective aura
 *
 * INTERACTION:
 *   Drag vertically → moves node toward pool
 *   Pool contact → irreversible quench sequence
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static hardened sphere above pool with cool glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Node radius (hero sized) */
const NODE_RADIUS_FRAC = SIZE.md;
/** Pool surface Y position (fraction from top) */
const POOL_SURFACE_Y = 0.62;
/** Pool depth (fraction of viewport) */
const POOL_DEPTH = 0.30;
/** Node starting Y (fraction) */
const NODE_START_Y = 0.25;
/** Steam particle count on quench */
const STEAM_COUNT = 45;
/** Steam rise speed range */
const STEAM_SPEED_MIN = 1.5;
const STEAM_SPEED_MAX = 5.0;
/** Steam spread range */
const STEAM_SPREAD = 0.15;
/** Hardening animation speed */
const HARDEN_SPEED = 0.006;
/** Node rise-back speed after quench */
const RISE_SPEED = 0.003;
/** Pool wave amplitude */
const WAVE_AMP = 0.006;
/** Pool wave frequency */
const WAVE_FREQ = 0.04;
/** Hot glow radius multiplier */
const HOT_GLOW_MULT = 2.0;
/** Hardened aura multiplier */
const HARD_AURA_MULT = 1.5;

// =====================================================================
// STATE TYPES
// =====================================================================

interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function QuenchHardenAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodeY: NODE_START_Y,
    dragging: false,
    quenched: false,
    hardenAnim: 0,
    riseAnim: 0,
    completed: false,
    steam: [] as SteamParticle[],
    splashFrame: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;

      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.quenched) {
        s.nodeY = POOL_SURFACE_Y + 0.05;
      }

      // ── Quench detection ────────────────────────────
      if (s.nodeY >= POOL_SURFACE_Y && !s.quenched) {
        s.quenched = true;
        s.splashFrame = s.frameCount;
        cb.onHaptic('completion');
        // Spawn massive steam
        for (let i = 0; i < STEAM_COUNT; i++) {
          s.steam.push({
            x: cx + (Math.random() - 0.5) * px(STEAM_SPREAD, minDim) * 2,
            y: POOL_SURFACE_Y * h,
            vx: (Math.random() - 0.5) * 3,
            vy: -(STEAM_SPEED_MIN + Math.random() * (STEAM_SPEED_MAX - STEAM_SPEED_MIN)),
            life: 0.7 + Math.random() * 0.3,
            size: 0.005 + Math.random() * 0.008,
          });
        }
      }

      if (s.quenched) {
        s.hardenAnim = Math.min(1, s.hardenAnim + HARDEN_SPEED * ms);
        if (s.hardenAnim > 0.4) {
          s.riseAnim = Math.min(1, s.riseAnim + RISE_SPEED * ms);
        }
        if (s.hardenAnim >= 0.95 && s.riseAnim >= 0.95 && !s.completed) {
          s.completed = true;
        }
      }

      cb.onStateChange?.(s.quenched
        ? 0.5 + easeOutCubic(Math.min(s.hardenAnim, s.riseAnim)) * 0.5
        : 0);

      const nodeR = px(NODE_RADIUS_FRAC, minDim);
      const harden = easeOutCubic(s.hardenAnim);
      const rise = easeOutCubic(s.riseAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Pool
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.fillRect(0, POOL_SURFACE_Y * h, w, POOL_DEPTH * h);

        // Hardened node
        const gR = nodeR * HARD_AURA_MULT;
        const sg = ctx.createRadialGradient(cx, cy, nodeR * 0.3, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.beginPath();
        ctx.arc(cx, cy, nodeR * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const poolSurfaceY = POOL_SURFACE_Y * h;

      // ── Pool ────────────────────────────────────────
      // Pool body
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
      ctx.fillRect(0, poolSurfaceY, w, POOL_DEPTH * h);

      // Pool surface with waves
      ctx.beginPath();
      ctx.moveTo(0, poolSurfaceY);
      for (let x = 0; x <= w; x += 4) {
        const waveY = Math.sin(x * 0.02 + s.frameCount * WAVE_FREQ) * px(WAVE_AMP, minDim);
        ctx.lineTo(x, poolSurfaceY + waveY);
      }
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // Pool depth gradient
      const poolGrad = ctx.createLinearGradient(0, poolSurfaceY, 0, poolSurfaceY + POOL_DEPTH * h);
      poolGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.12 * entrance));
      poolGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = poolGrad;
      ctx.fillRect(0, poolSurfaceY, w, POOL_DEPTH * h);

      // ── Steam particles ─────────────────────────────
      for (let i = s.steam.length - 1; i >= 0; i--) {
        const sp = s.steam[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy *= 0.995; // Slow deceleration
        sp.vx += (Math.random() - 0.5) * 0.3; // Drift
        sp.life -= 0.008;
        if (sp.life <= 0) { s.steam.splice(i, 1); continue; }

        const spR = px(sp.size * sp.life, minDim);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [200, 210, 220] as RGB, 0.4),
          ALPHA.content.max * sp.life * 0.3 * entrance,
        );
        ctx.fill();
      }

      // ── Node position calculation ───────────────────
      let nodeDrawY: number;
      if (s.quenched) {
        // Sink then rise
        const sinkY = (POOL_SURFACE_Y + 0.08) * h;
        const riseY = cy;
        nodeDrawY = sinkY + (riseY - sinkY) * rise;
      } else {
        nodeDrawY = s.nodeY * h;
      }

      // ── Hot glow (fades during hardening) ───────────
      if (!s.quenched || harden < 0.6) {
        const hotFade = s.quenched ? 1 - harden * 1.6 : 1;
        if (hotFade > 0) {
          const hotR = nodeR * HOT_GLOW_MULT;
          const hg = ctx.createRadialGradient(cx, nodeDrawY, 0, cx, nodeDrawY, hotR);
          hg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.45 * hotFade * entrance));
          hg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.min * hotFade * entrance));
          hg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = hg;
          ctx.fillRect(cx - hotR, nodeDrawY - hotR, hotR * 2, hotR * 2);
        }
      }

      // ── Node body ───────────────────────────────────
      const nodeColor = lerpColor(s.accentRgb, s.primaryRgb, harden) as RGB;
      ctx.beginPath();
      ctx.arc(cx, nodeDrawY, nodeR * (0.85 + harden * 0.15), 0, Math.PI * 2);
      ctx.fillStyle = rgba(nodeColor, ALPHA.content.max * (0.3 + harden * 0.15) * entrance);
      ctx.fill();

      // ── Crystalline edge ring (appears during hardening) ──
      if (harden > 0.3) {
        const edgeAlpha = (harden - 0.3) * 1.4;
        ctx.beginPath();
        ctx.arc(cx, nodeDrawY, nodeR * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * edgeAlpha * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Inner crystalline detail
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + s.frameCount * 0.003;
          const innerR = nodeR * 0.5;
          const outerR = nodeR * 0.85;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * innerR, nodeDrawY + Math.sin(a) * innerR);
          ctx.lineTo(cx + Math.cos(a) * outerR, nodeDrawY + Math.sin(a) * outerR);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * edgeAlpha * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Hardened protective aura ────────────────────
      if (s.quenched && harden > 0.5) {
        const auraAlpha = (harden - 0.5) * 2;
        const auraR = nodeR * HARD_AURA_MULT;
        const ag = ctx.createRadialGradient(cx, nodeDrawY, nodeR * 0.5, cx, nodeDrawY, auraR);
        ag.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * auraAlpha * rise * entrance));
        ag.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.min * auraAlpha * rise * entrance));
        ag.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ag;
        ctx.fillRect(cx - auraR, nodeDrawY - auraR, auraR * 2, auraR * 2);
      }

      // ── Splash ripple at pool surface ───────────────
      if (s.quenched && s.frameCount - s.splashFrame < 60) {
        const splashT = (s.frameCount - s.splashFrame) / 60;
        const rippleR = px(0.05 + splashT * 0.15, minDim);
        ctx.beginPath();
        ctx.arc(cx, poolSurfaceY, rippleR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * (1 - splashT) * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = () => {
      stateRef.current.dragging = true;
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.quenched) return;
      const rect = canvas.getBoundingClientRect();
      s.nodeY = Math.max(0.1, Math.min(0.8, (e.clientY - rect.top) / rect.height));
    };

    const onUp = () => {
      stateRef.current.dragging = false;
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
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'ns-resize',
        }}
      />
    </div>
  );
}
