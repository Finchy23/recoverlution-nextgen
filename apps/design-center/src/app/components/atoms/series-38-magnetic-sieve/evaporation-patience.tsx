/**
 * ATOM 378: THE EVAPORATION PATIENCE ENGINE
 * ============================================
 * Series 38 — Magnetic Sieve · Position 8
 *
 * Cure the urge to judge raw creative output immediately.
 * Apply gentle heat and wait — the murk evaporates to reveal crystal.
 *
 * PHYSICS:
 *   - Screen flooded with murky unreadable liquid — dense particle fog
 *   - Cannot swipe or tap away — only patience works
 *   - Hold hand over screen to generate radial heat
 *   - Liquid slowly evaporates over ~5 seconds of sustained hold
 *   - Rising steam particles drift upward as murk clears
 *   - Crystalline geometric structure materializes at center
 *   - Breath modulates the warmth glow (slower breath = more warmth)
 *
 * INTERACTION:
 *   Hold → generates heat, evaporates murk
 *   Release → evaporation pauses, murk slowly creeps back
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static crystalline structure with faint murk around edges
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Evaporation rate per frame while holding */
const EVAP_RATE = 0.0033;
/** Murk return rate per frame when released */
const RETURN_RATE = 0.0005;
/** Number of murk particles */
const MURK_PARTICLE_COUNT = 200;
/** Murk particle size range */
const MURK_R_MIN = 0.004;
const MURK_R_MAX = 0.018;
/** Steam particle count */
const MAX_STEAM = 40;
/** Steam spawn rate (per frame while evaporating) */
const STEAM_SPAWN_CHANCE = 0.3;
/** Crystal structure: number of vertices */
const CRYSTAL_VERTICES = 6;
/** Crystal outer radius */
const CRYSTAL_R_FRAC = 0.22;
/** Crystal inner detail radius */
const CRYSTAL_INNER_R = 0.12;
/** Heat glow radius */
const HEAT_GLOW_R = 0.35;
/** Breath warmth factor */
const BREATH_WARMTH_FACTOR = 0.15;
/** Completion threshold */
const EVAP_COMPLETE = 0.92;

// =====================================================================
// STATE TYPES
// =====================================================================

interface MurkParticle {
  x: number;
  y: number;
  radius: number;
  driftAngle: number;
  driftSpeed: number;
  phase: number;
}

interface SteamParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  life: number;
  radius: number;
}

// =====================================================================
// HELPERS
// =====================================================================

function createMurk(): MurkParticle[] {
  return Array.from({ length: MURK_PARTICLE_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: MURK_R_MIN + Math.random() * (MURK_R_MAX - MURK_R_MIN),
    driftAngle: Math.random() * Math.PI * 2,
    driftSpeed: 0.0001 + Math.random() * 0.0003,
    phase: Math.random() * Math.PI * 2,
  }));
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EvaporationPatienceAtom({
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
    murkParticles: createMurk(),
    steamParticles: [] as SteamParticle[],
    holding: false,
    evapProgress: 0,         // 0→1 how much has evaporated
    crystalReveal: 0,        // 0→1 crystal structure visibility
    completed: false,
    completionAnim: 0,
    heatGlow: 0,             // current heat visual intensity
    holdStartReported: false,
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
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve') {
        s.holding = true;
      }

      // ── Evaporation physics ─────────────────────────
      if (s.holding) {
        s.evapProgress = Math.min(1, s.evapProgress + EVAP_RATE * ms);
        s.heatGlow = Math.min(1, s.heatGlow + 0.02 * ms);
      } else {
        s.evapProgress = Math.max(0, s.evapProgress - RETURN_RATE * ms);
        s.heatGlow = Math.max(0, s.heatGlow - 0.01 * ms);
      }

      // Crystal reveals as murk clears
      s.crystalReveal = easeOutCubic(Math.max(0, (s.evapProgress - 0.3) / 0.7));

      // ── Steam spawning ──────────────────────────────
      if (s.holding && s.evapProgress < 0.95 && !p.reducedMotion) {
        if (Math.random() < STEAM_SPAWN_CHANCE && s.steamParticles.length < MAX_STEAM) {
          s.steamParticles.push({
            x: cx + (Math.random() - 0.5) * minDim * 0.3,
            y: cy + (Math.random() - 0.5) * minDim * 0.1,
            vy: -(1 + Math.random() * 2),
            vx: (Math.random() - 0.5) * 0.8,
            life: 1,
            radius: 0.008 + Math.random() * 0.015,
          });
        }
      }

      // ── Steam physics ───────────────────────────────
      for (let i = s.steamParticles.length - 1; i >= 0; i--) {
        const sp = s.steamParticles[i];
        sp.y += sp.vy * ms;
        sp.x += sp.vx * ms;
        sp.vx += (Math.random() - 0.5) * 0.05;
        sp.life -= 0.012;
        if (sp.life <= 0) {
          s.steamParticles.splice(i, 1);
        }
      }

      // ── Completion check ────────────────────────────
      if (s.evapProgress >= EVAP_COMPLETE && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) {
        s.completionAnim = Math.min(1, s.completionAnim + 0.008 * ms);
      }

      cb.onStateChange?.(s.completed
        ? 0.5 + s.completionAnim * 0.5
        : s.evapProgress * 0.5);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Draw crystal structure
        const cR = px(CRYSTAL_R_FRAC, minDim);
        drawCrystal(ctx, cx, cy, cR, minDim, s.primaryRgb, 1, entrance);

        // Faint murk at edges
        for (let i = 0; i < 30; i++) {
          const angle = (i / 30) * Math.PI * 2;
          const dist = cR * 1.5 + Math.random() * minDim * 0.1;
          const mx = cx + Math.cos(angle) * dist;
          const my = cy + Math.sin(angle) * dist;
          const mR = px(MURK_R_MAX, minDim);
          ctx.beginPath();
          ctx.arc(mx, my, mR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * 0.3 * entrance);
          ctx.fill();
        }

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Draw heat glow ──────────────────────────────
      if (s.heatGlow > 0.01) {
        const hR = px(HEAT_GLOW_R, minDim) * (1 + breath * BREATH_WARMTH_FACTOR);
        const heatGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hR);
        heatGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.heatGlow * entrance));
        heatGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * s.heatGlow * entrance));
        heatGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = heatGrad;
        ctx.fillRect(cx - hR, cy - hR, hR * 2, hR * 2);
      }

      // ── Draw crystal structure ──────────────────────
      if (s.crystalReveal > 0.02) {
        const cR = px(CRYSTAL_R_FRAC, minDim);
        drawCrystal(ctx, cx, cy, cR, minDim, s.primaryRgb, s.crystalReveal, entrance);
      }

      // ── Draw murk particles ─────────────────────────
      const murkOpacity = 1 - s.evapProgress;
      for (const mp of s.murkParticles) {
        // Murk drifts outward as it evaporates
        const evapOffset = s.evapProgress * 0.15;
        const mpx = (mp.x + Math.cos(mp.driftAngle) * evapOffset) * w;
        const mpy = (mp.y + Math.sin(mp.driftAngle) * evapOffset) * h;
        const mR = px(mp.radius, minDim);

        // Drift animation
        const dx = Math.cos(mp.driftAngle + s.frameCount * 0.003 + mp.phase) * px(0.005, minDim);
        const dy = Math.sin(mp.driftAngle * 1.3 + s.frameCount * 0.002 + mp.phase) * px(0.005, minDim);

        ctx.beginPath();
        ctx.arc(mpx + dx, mpy + dy, mR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.06 * murkOpacity * entrance);
        ctx.fill();
      }

      // ── Draw steam particles ───��────────────────────
      for (const sp of s.steamParticles) {
        const spR = px(sp.radius * sp.life, minDim);

        // Steam glow
        const sgR = spR * 3;
        const sg = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sgR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * sp.life * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(sp.x - sgR, sp.y - sgR, sgR * 2, sgR * 2);

        // Steam body
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255], 0.3),
          ALPHA.content.max * 0.12 * sp.life * entrance,
        );
        ctx.fill();
      }

      // ── Evaporation progress ring ───────────────────
      if (s.evapProgress > 0.02 && !s.completed) {
        const progR = px(0.04, minDim);
        const progAngle = s.evapProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, h * 0.1, progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    /** Draw the crystalline structure */
    function drawCrystal(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number, radius: number,
      minDim: number, rgb: RGB, reveal: number, entrance: number,
    ) {
      const innerR = px(CRYSTAL_INNER_R, minDim);

      // Crystal glow
      const glowR = radius * 2;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, rgba(rgb, ALPHA.glow.max * 0.35 * reveal * entrance));
      glow.addColorStop(0.3, rgba(rgb, ALPHA.glow.min * reveal * entrance));
      glow.addColorStop(1, rgba(rgb, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      // Outer hexagon
      ctx.beginPath();
      for (let i = 0; i <= CRYSTAL_VERTICES; i++) {
        const angle = -Math.PI / 2 + (i / CRYSTAL_VERTICES) * Math.PI * 2;
        const vx = cx + Math.cos(angle) * radius * reveal;
        const vy = cy + Math.sin(angle) * radius * reveal;
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.2 * reveal * entrance);
      ctx.lineWidth = px(0.0015, minDim);
      ctx.stroke();

      // Inner hexagon
      ctx.beginPath();
      for (let i = 0; i <= CRYSTAL_VERTICES; i++) {
        const angle = (i / CRYSTAL_VERTICES) * Math.PI * 2;
        const vx = cx + Math.cos(angle) * innerR * reveal;
        const vy = cy + Math.sin(angle) * innerR * reveal;
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.15 * reveal * entrance);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // Radial spokes connecting inner to outer
      for (let i = 0; i < CRYSTAL_VERTICES; i++) {
        const outerAngle = -Math.PI / 2 + (i / CRYSTAL_VERTICES) * Math.PI * 2;
        const innerAngle = (i / CRYSTAL_VERTICES) * Math.PI * 2;
        const ox = cx + Math.cos(outerAngle) * radius * reveal;
        const oy = cy + Math.sin(outerAngle) * radius * reveal;
        const ix = cx + Math.cos(innerAngle) * innerR * reveal;
        const iy = cy + Math.sin(innerAngle) * innerR * reveal;

        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ox, oy);
        ctx.strokeStyle = rgba(rgb, ALPHA.content.max * 0.08 * reveal * entrance);
        ctx.lineWidth = px(0.0008, minDim);
        ctx.stroke();
      }

      // Center point
      const centerR = px(0.008, minDim) * reveal;
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(
        lerpColor(rgb, [255, 255, 255], 0.3),
        ALPHA.content.max * 0.4 * reveal * entrance,
      );
      ctx.fill();

      // Vertex dots
      for (let i = 0; i < CRYSTAL_VERTICES; i++) {
        const angle = -Math.PI / 2 + (i / CRYSTAL_VERTICES) * Math.PI * 2;
        const vx = cx + Math.cos(angle) * radius * reveal;
        const vy = cy + Math.sin(angle) * radius * reveal;
        ctx.beginPath();
        ctx.arc(vx, vy, px(0.004, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.3 * reveal * entrance);
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.holding = true;
      if (!s.holdStartReported) {
        s.holdStartReported = true;
        callbacksRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };

    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      stateRef.current.holdStartReported = false;
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
