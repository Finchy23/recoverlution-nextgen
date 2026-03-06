/**
 * ATOM 391: THE CRUCIBLE HEAT ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 1
 *
 * Cure clinging to a past self that no longer serves you.
 * Apply intense heat until the rigid shape melts into fluid potential.
 *
 * PHYSICS:
 *   - Sharp crystalline geometric shape (dodecagon with faceted edges)
 *   - Press and hold to generate radial heat from below
 *   - Heat makes edges vibrate, soften, lose definition
 *   - Above melt threshold: shape liquefies into glowing fluid sphere
 *   - Fluid sphere gently undulates with organic movement
 *   - Multi-layer heat haze and ember particles during transition
 *
 * INTERACTION:
 *   Hold → accumulates heat (0→1 over ~5s)
 *   Release → heat slowly decays
 *   Threshold crossing → irreversible melt + completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static fluid sphere with warm glow
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

/** Hero shape radius — large viewport-filling presence */
const SHAPE_RADIUS_FRAC = SIZE.lg;
/** Heat accumulation rate per frame while holding */
const HEAT_RATE = 0.0025;
/** Heat decay rate per frame when released (before melt) */
const HEAT_DECAY = 0.0008;
/** Melt threshold — once crossed, irreversible */
const MELT_THRESHOLD = 0.92;
/** Melt animation speed */
const MELT_SPEED = 0.008;
/** Number of vertices on the crystalline shape */
const CRYSTAL_SIDES = 12;
/** Facet displacement amplitude (sharp edges) */
const FACET_AMP = 0.18;
/** Heat vibration amplitude at max heat */
const VIBRATION_AMP = 0.015;
/** Vibration frequency */
const VIBRATION_FREQ = 0.12;
/** Fluid undulation frequency */
const UNDULATE_FREQ = 0.025;
/** Fluid undulation amplitude */
const UNDULATE_AMP = 0.04;
/** Ember particle count */
const EMBER_COUNT = 40;
/** Heat haze ring count */
const HAZE_RINGS = 4;
/** Glow expansion multiplier */
const GLOW_MULT = 1.8;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Ember {
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

export default function CrucibleHeatAtom({
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
    holding: false,
    heat: 0,
    melted: false,
    meltAnim: 0,
    completed: false,
    embers: [] as Ember[],
    hapticFired: false,
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

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.melted) {
        s.heat = Math.min(1, s.heat + 0.02);
      }

      // ── Heat physics ────────────────────────────────
      if (s.holding && !s.melted) {
        s.heat = Math.min(1, s.heat + HEAT_RATE * ms);
      } else if (!s.melted) {
        s.heat = Math.max(0, s.heat - HEAT_DECAY * ms);
      }

      // ── Melt detection ──────────────────────────────
      if (s.heat >= MELT_THRESHOLD && !s.melted) {
        s.melted = true;
        cb.onHaptic('completion');
      }
      if (s.melted) {
        s.meltAnim = Math.min(1, s.meltAnim + MELT_SPEED * ms);
        if (s.meltAnim >= 0.95 && !s.completed) {
          s.completed = true;
        }
      }

      // ── Haptic at hold threshold ────────────────────
      if (s.heat > 0.5 && !s.hapticFired && !s.melted) {
        s.hapticFired = true;
        cb.onHaptic('hold_threshold');
      }

      cb.onStateChange?.(s.melted
        ? 0.5 + easeOutCubic(s.meltAnim) * 0.5
        : s.heat * 0.5);

      const shapeR = px(SHAPE_RADIUS_FRAC, minDim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Static fluid sphere
        const gR = shapeR * GLOW_MULT;
        const sg = ctx.createRadialGradient(cx, cy, shapeR * 0.3, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.beginPath();
        ctx.arc(cx, cy, shapeR * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
        ctx.fill();

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const heat = s.heat;
      const melt = easeOutCubic(s.meltAnim);
      const hotColor = lerpColor(s.accentRgb, s.primaryRgb, heat) as RGB;

      // ── Heat haze rings (behind shape) ──────────────
      if (heat > 0.2) {
        for (let i = 0; i < HAZE_RINGS; i++) {
          const hazePhase = s.frameCount * 0.015 + i * 1.2;
          const hazeR = shapeR * (1.2 + i * 0.3 + Math.sin(hazePhase) * 0.08);
          const hazeAlpha = (heat - 0.2) * 0.8 * (1 - i / HAZE_RINGS) * ALPHA.atmosphere.max * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, hazeR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, hazeAlpha * 0.5);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Radial heat glow (from below) ───────────────
      if (heat > 0.1) {
        const heatGlowR = shapeR * (1.5 + heat * 0.5);
        const hg = ctx.createRadialGradient(cx, cy + shapeR * 0.3, 0, cx, cy, heatGlowR);
        hg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * heat * entrance));
        hg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * heat * entrance));
        hg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(cx - heatGlowR, cy - heatGlowR, heatGlowR * 2, heatGlowR * 2);
      }

      // ── The shape (crystal → fluid) ─────────────────
      const vibOffset = heat * Math.sin(s.frameCount * VIBRATION_FREQ) * px(VIBRATION_AMP, minDim);

      ctx.beginPath();
      for (let i = 0; i <= CRYSTAL_SIDES; i++) {
        const angle = (i / CRYSTAL_SIDES) * Math.PI * 2;
        // Crystal facets flatten as heat rises
        const facet = (1 - heat) * Math.cos(angle * 3) * FACET_AMP;
        // Fluid undulation appears as melt progresses
        const undulate = melt * Math.sin(angle * 2 + s.frameCount * UNDULATE_FREQ) * UNDULATE_AMP;
        // Radius shrinks slightly as it melts to sphere
        const r = shapeR * (1 - melt * 0.15) * (1 + facet + undulate);

        const sx = cx + Math.cos(angle) * r + vibOffset;
        const sy = cy + Math.sin(angle) * r + vibOffset * 0.7;

        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();

      // Fill with heat-interpolated color
      const fillAlpha = ALPHA.content.max * (0.15 + heat * 0.2 + melt * 0.15) * entrance;
      ctx.fillStyle = rgba(hotColor, fillAlpha);
      ctx.fill();

      // Edge stroke (fades during melt)
      const strokeAlpha = ALPHA.content.max * (0.25 - melt * 0.2) * entrance;
      ctx.strokeStyle = rgba(hotColor, strokeAlpha);
      ctx.lineWidth = px(STROKE.thin * (1 - melt * 0.5), minDim);
      ctx.stroke();

      // ── Inner glow core (appears during melt) ───────
      if (melt > 0.1) {
        const coreR = shapeR * 0.4 * melt;
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        cg.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
          ALPHA.focal.max * 0.4 * melt * entrance,
        ));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2);
      }

      // ── Ember particles ─────────────────────────────
      if (heat > 0.3 && s.embers.length < EMBER_COUNT) {
        const angle = Math.random() * Math.PI * 2;
        const spawnR = shapeR * (0.8 + Math.random() * 0.3);
        s.embers.push({
          x: cx + Math.cos(angle) * spawnR,
          y: cy + Math.sin(angle) * spawnR,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(1 + Math.random() * 2.5),
          life: 1,
          size: 0.002 + Math.random() * 0.003,
        });
      }

      for (let i = s.embers.length - 1; i >= 0; i--) {
        const em = s.embers[i];
        em.x += em.vx * ms;
        em.y += em.vy * ms;
        em.life -= 0.015;
        if (em.life <= 0) { s.embers.splice(i, 1); continue; }

        const emR = px(em.size * em.life, minDim);
        ctx.beginPath();
        ctx.arc(em.x, em.y, emR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 220, 150] as RGB, 0.4),
          ALPHA.content.max * em.life * 0.5 * entrance,
        );
        ctx.fill();
      }

      // ── Completion glow pulse ───────────────────────
      if (s.melted) {
        const pulsePhase = Math.sin(s.frameCount * 0.03) * 0.5 + 0.5;
        const compGlowR = shapeR * GLOW_MULT;
        const cg = ctx.createRadialGradient(cx, cy, shapeR * 0.2, cx, cy, compGlowR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * melt * (0.8 + pulsePhase * 0.2) * entrance));
        cg.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.min * melt * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - compGlowR, cy - compGlowR, compGlowR * 2, compGlowR * 2);
      }

      // ── Heat progress indicator ─────────────────────
      if (!s.melted && heat > 0) {
        const progAngle = heat * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, shapeR + px(0.025, minDim), -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = () => {
      stateRef.current.holding = true;
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = () => {
      stateRef.current.holding = false;
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
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
