/**
 * ATOM 400: THE MASTER FORGE ENGINE (APEX CAPSTONE)
 * ===================================================
 * Series 40 — Synthesis Forge · Position 10
 *
 * The apex of creation. Pull every particle from the entire collection
 * into dead center, ignite, and strike. You are the blacksmith.
 *
 * PHYSICS:
 *   - Screen flooded with 120 diverse particles (varied sizes/colors)
 *   - Press and hold to create gravitational pull toward center
 *   - Particles converge — forming growing dense mass
 *   - At convergence threshold: mass ignites (color shift + glow burst)
 *   - One final tap after ignition triggers monument formation
 *   - Blinding flash resolves into slowly rotating perfect octagonal monument
 *   - Multi-layer nested glow halos — the unshakeable achievement
 *   - Slow majestic rotation with internal geometric detail
 *
 * INTERACTION:
 *   Hold → gravitational convergence of all particles
 *   Convergence threshold → ignition (auto)
 *   Tap (post-ignition) → final strike, monument birth
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static monument with nested glow halos
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

/** Particle count (represents "all previous atoms") */
const PARTICLE_COUNT = 120;
/** Gravitational pull rate */
const PULL_RATE = 0.025;
/** Convergence rate while holding */
const CONVERGE_RATE = 0.003;
/** Convergence threshold for ignition */
const IGNITE_THRESHOLD = 0.92;
/** Monument radius (hero sized) */
const MONUMENT_RADIUS_FRAC = SIZE.md;
/** Monument sides (octagon = geometric perfection) */
const MONUMENT_SIDES = 8;
/** Monument rotation speed */
const MONUMENT_ROT_SPEED = 0.002;
/** Monument birth animation speed */
const MONUMENT_SPEED = 0.005;
/** Glow halo count */
const HALO_COUNT = 4;
/** Halo spacing multiplier */
const HALO_SPACING = 0.35;
/** Flash intensity on final strike */
const STRIKE_FLASH = 1.8;
/** Flash decay */
const FLASH_DECAY = 0.03;
/** Inner geometric detail rotation offset */
const INNER_ROT_OFFSET = Math.PI / MONUMENT_SIDES;
/** Central mass growth rate */
const MASS_GROWTH_RATE = 3;

// =====================================================================
// STATE TYPES
// =====================================================================

interface ForgeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number; // 0=primary, 1=accent, 0.5=blend
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function MasterForgeAtom({
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
    particles: Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 0.002 + Math.random() * 0.004,
      hue: Math.random(),
    })) as ForgeParticle[],
    holding: false,
    convergence: 0,
    ignited: false,
    monument: false,
    monumentAnim: 0,
    completed: false,
    flash: 0,
    monumentAngle: 0,
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

    /** Draw the octagonal monument */
    function drawMonument(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      radius: number, rotation: number,
      minDim: number,
      rgb: RGB, entrance: number, anim: number,
    ) {
      // ── Nested glow halos ─────────────────────────
      for (let h = HALO_COUNT - 1; h >= 0; h--) {
        const haloR = radius * (1 + (h + 1) * HALO_SPACING);
        const haloAlpha = (HALO_COUNT - h) / HALO_COUNT * 0.15;
        const hg = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, haloR);
        hg.addColorStop(0, rgba(rgb, ALPHA.glow.max * haloAlpha * anim * entrance));
        hg.addColorStop(0.5, rgba(rgb, ALPHA.glow.min * haloAlpha * 0.5 * anim * entrance));
        hg.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(cx - haloR, cy - haloR, haloR * 2, haloR * 2);
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);

      // ── Outer octagon ───────────────────────────────
      ctx.beginPath();
      for (let i = 0; i <= MONUMENT_SIDES; i++) {
        const a = (i / MONUMENT_SIDES) * Math.PI * 2;
        const px2 = Math.cos(a) * radius;
        const py2 = Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.closePath();
      ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.4 * anim * entrance);
      ctx.fill();
      ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.3 * anim * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // ── Inner octagon (rotated) ─────────────────────
      const innerR = radius * 0.6;
      ctx.beginPath();
      for (let i = 0; i <= MONUMENT_SIDES; i++) {
        const a = (i / MONUMENT_SIDES) * Math.PI * 2 + INNER_ROT_OFFSET;
        const px2 = Math.cos(a) * innerR;
        const py2 = Math.sin(a) * innerR;
        if (i === 0) ctx.moveTo(px2, py2);
        else ctx.lineTo(px2, py2);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.15 * anim * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── Radial spokes ───────────────────────────────
      for (let i = 0; i < MONUMENT_SIDES; i++) {
        const a = (i / MONUMENT_SIDES) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * innerR * 0.3, Math.sin(a) * innerR * 0.3);
        ctx.lineTo(Math.cos(a) * radius * 0.95, Math.sin(a) * radius * 0.95);
        ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.08 * anim * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Central bright core ─────────────────────────
      const coreR = radius * 0.15;
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(rgb, [255, 255, 255] as RGB, 0.35),
        ALPHA.focal.max * 0.4 * anim * entrance,
      );
      ctx.fill();

      ctx.restore();
    }

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
      if (p.phase === 'resolve') {
        if (!s.ignited) s.convergence = Math.min(1, s.convergence + 0.02);
        if (s.ignited && !s.monument) {
          s.monument = true;
          s.flash = STRIKE_FLASH;
        }
      }

      // ── Convergence physics ─────────────────────────
      if (s.holding && !s.ignited) {
        s.convergence = Math.min(1, s.convergence + CONVERGE_RATE * ms);
      }

      // ── Ignition detection ──────────────────────────
      if (s.convergence >= IGNITE_THRESHOLD && !s.ignited) {
        s.ignited = true;
        cb.onHaptic('hold_threshold');
      }

      // ── Flash decay ─────────────────────────────────
      s.flash = Math.max(0, s.flash - FLASH_DECAY * ms);

      // ── Monument animation ──────────────────────────
      if (s.monument) {
        s.monumentAnim = Math.min(1, s.monumentAnim + MONUMENT_SPEED * ms);
        s.monumentAngle += MONUMENT_ROT_SPEED * ms;
        if (s.monumentAnim >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('seal_stamp');
        }
      }

      // ── Particle physics ────────────────────────────
      const pull = s.convergence * PULL_RATE;
      for (const pt of s.particles) {
        if (!s.monument) {
          pt.vx += (0.5 - pt.x) * pull * ms;
          pt.vy += (0.5 - pt.y) * pull * ms;
          pt.vx *= 0.97;
          pt.vy *= 0.97;
          pt.x += pt.vx * 0.01 * ms;
          pt.y += pt.vy * 0.01 * ms;
        }
      }

      cb.onStateChange?.(s.monument
        ? 0.5 + easeOutCubic(s.monumentAnim) * 0.5
        : s.convergence * 0.5);

      const monR = px(MONUMENT_RADIUS_FRAC, minDim);
      const monAnim = easeOutCubic(s.monumentAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        drawMonument(ctx, cx, cy, monR, 0, minDim, s.primaryRgb, entrance, 1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Particles (fade out as monument forms) ──────
      if (!s.monument || monAnim < 0.5) {
        const ptAlpha = s.monument ? (1 - monAnim * 2) : 1;
        for (const pt of s.particles) {
          const ptColor = lerpColor(s.accentRgb, s.primaryRgb, pt.hue) as RGB;
          const ptR = px(pt.size, minDim);
          ctx.beginPath();
          ctx.arc(pt.x * w, pt.y * h, ptR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            s.ignited ? s.primaryRgb : ptColor,
            ALPHA.content.max * (0.12 + s.convergence * 0.18) * ptAlpha * entrance,
          );
          ctx.fill();
        }
      }

      // ── Central mass (grows with convergence) ───────
      if (s.convergence > 0.2 && !s.monument) {
        const massR = monR * (s.convergence - 0.2) * MASS_GROWTH_RATE * 0.3;

        // Mass glow
        const massGlowR = massR * 3;
        const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, massGlowR);
        mg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.convergence * entrance));
        mg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * s.convergence * entrance));
        mg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(cx - massGlowR, cy - massGlowR, massGlowR * 2, massGlowR * 2);

        // Mass body
        ctx.beginPath();
        ctx.arc(cx, cy, massR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
      }

      // ── Ignition glow burst ─────────────────────────
      if (s.ignited && !s.monument) {
        const igR = monR * 0.8;
        const ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, igR);
        ig.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3),
          ALPHA.focal.max * 0.5 * entrance,
        ));
        ig.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        ig.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ig;
        ctx.fillRect(cx - igR, cy - igR, igR * 2, igR * 2);
      }

      // ── THE MONUMENT ────────────────────────────────
      if (s.monument) {
        drawMonument(
          ctx, cx, cy,
          monR * monAnim,
          s.monumentAngle,
          minDim,
          s.primaryRgb,
          entrance,
          monAnim,
        );
      }

      // ── Flash ───────────────────────────────────────
      if (s.flash > 0) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * Math.min(1, s.flash) * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Convergence progress ring ───────────────────
      if (!s.ignited && s.convergence > 0) {
        const progAngle = s.convergence * Math.PI * 2;
        const ringR = monR + px(0.03, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = () => {
      const s = stateRef.current;

      if (s.ignited && !s.monument) {
        // Final strike!
        s.monument = true;
        s.flash = STRIKE_FLASH;
        callbacksRef.current.onHaptic('hold_start');
      } else if (!s.ignited) {
        s.holding = true;
        callbacksRef.current.onHaptic('hold_start');
      }
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
