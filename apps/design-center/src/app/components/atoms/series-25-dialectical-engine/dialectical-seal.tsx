/**
 * ATOM 250: THE DIALECTICAL SEAL
 * =================================
 * Series 25 — Dialectical Engine · Position 10 (Capstone)
 *
 * The capstone: Taijitu. White and black particles catch a vortex
 * and form a flawless Yin-Yang. The deep eternal cyclical breath.
 * Thesis and antithesis spiral into synthesis.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - 200+ particles split into thesis (primary) and antithesis (accent)
 *   - Each group emits circular wavefronts from its current center of mass
 *   - As particles organize into Yin-Yang, the two wave patterns create
 *     a standing interference fringe pattern — the Taijitu radiates fringes
 *   - Completion: permanent standing-wave halo around the symbol
 *   - The interference IS the synthesis: separate waves, unified pattern
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + vortex field glow
 *   2. Interference fringe field from thesis/antithesis centers
 *   3. Vortex flow lines (spiral)
 *   4. Particle field (200+ thesis/antithesis particles)
 *   5. Yin-Yang form with multi-stop fill (when organized)
 *   6. Synthesis dots (eyes of Yin-Yang) with specular
 *   7. Standing-wave fringe halo + breath pulse
 *   8. Progress ring
 *
 * PHYSICS:
 *   - 200+ particles with vortex dynamics + noise
 *   - Hold/drag → spin vortex → particles organize into Yin-Yang
 *   - Organization measured by particle alignment to ideal positions
 *   - Breath modulates vortex rotation speed + fringe wavelength
 *   - Completion triggers seal_stamp haptic
 *
 * INTERACTION:
 *   Hold/drag → spin vortex (drag_snap, step_advance, seal_stamp)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Formed Yin-Yang with stable fringe halo, static
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Total particle count */
const PARTICLE_COUNT = 200;
/** Vortex radius (forms the Yin-Yang) */
const VORTEX_R = SIZE.lg * 0.4;
/** Vortex spin speed when interacting */
const VORTEX_SPEED = 0.015;
/** Natural decay of vortex when not interacting */
const VORTEX_DECAY = 0.995;
/** Particle attraction to ideal position */
const ATTRACT_K = 0.003;
/** Particle damping */
const PART_DAMP = 0.94;
/** Organization threshold for completion */
const ORG_THRESHOLD = 0.85;
/** Frames organized for seal */
const ORG_FRAMES = 70;
/** Glow layers */
const GLOW_LAYERS = 6;
/** Interference fringe rings in halo */
const FRINGE_RINGS = 20;
/** Fringe wavelength */
const FRINGE_LAMBDA = 0.02;
/** Vortex flow line count */
const FLOW_LINE_COUNT = 8;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Breath vortex modulation */
const BREATH_VORTEX_MOD = 0.2;
/** Synthesis dot radius */
const DOT_R = 0.018;
/** Standing wave rings at completion */
const STANDING_RINGS = 12;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

interface VortexParticle {
  x: number; y: number;
  vx: number; vy: number;
  side: number; // 0 = thesis (primary), 1 = antithesis (accent)
  idealAngle: number;
  idealR: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/** Generate particles with random initial positions */
function initParticles(): VortexParticle[] {
  const pts: VortexParticle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const side = i < PARTICLE_COUNT / 2 ? 0 : 1;
    const angle = Math.random() * Math.PI * 2;
    const r = 0.05 + Math.random() * 0.35;
    // Ideal Yin-Yang position: each side occupies one half
    const idealAngle = side === 0
      ? -Math.PI / 2 + (i / (PARTICLE_COUNT / 2)) * Math.PI
      : Math.PI / 2 + ((i - PARTICLE_COUNT / 2) / (PARTICLE_COUNT / 2)) * Math.PI;
    const idealR = VORTEX_R * (0.2 + Math.random() * 0.7);
    pts.push({
      x: 0.5 + Math.cos(angle) * r,
      y: 0.5 + Math.sin(angle) * r,
      vx: (Math.random() - 0.5) * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      side, idealAngle, idealR,
    });
  }
  return pts;
}

/** Compute center of mass for a subset of particles */
function centerOfMass(particles: VortexParticle[], side: number): { x: number; y: number } {
  let sx = 0, sy = 0, count = 0;
  for (const p of particles) {
    if (p.side === side) { sx += p.x; sy += p.y; count++; }
  }
  return count > 0 ? { x: sx / count, y: sy / count } : { x: 0.5, y: 0.5 };
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function DialecticalSealAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    particles: initParticles(),
    vortexSpeed: 0, vortexAngle: 0,
    spinning: false, dragNotified: false, stepNotified: false,
    organization: 0, orgFrames: 0, completed: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const time = s.frameCount * 0.012;
      const breath = p.breathAmplitude;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.completed = true; s.organization = 1; s.orgFrames = ORG_FRAMES + 1;
      }

      // ── Vortex physics ────────────────────────────────────
      if (s.spinning) {
        s.vortexSpeed = Math.min(VORTEX_SPEED, s.vortexSpeed + 0.001 * ms);
      } else {
        s.vortexSpeed *= VORTEX_DECAY;
      }
      s.vortexAngle += (s.vortexSpeed + breath * BREATH_VORTEX_MOD * 0.002) * ms;

      // ── Particle physics ──────────────────────────────────
      let totalDist = 0;
      const vR = px(VORTEX_R, minDim) / minDim; // in viewport fractions

      for (const pt of s.particles) {
        // Ideal position (rotated by vortex angle)
        const idealA = pt.idealAngle + s.vortexAngle;
        const idealX = 0.5 + Math.cos(idealA) * pt.idealR;
        const idealY = 0.5 + Math.sin(idealA) * pt.idealR;

        // Attraction to ideal + vortex rotation
        const dx = idealX - pt.x; const dy = idealY - pt.y;
        const attractStrength = ATTRACT_K * (0.3 + s.vortexSpeed / VORTEX_SPEED * 0.7);
        pt.vx += dx * attractStrength * ms;
        pt.vy += dy * attractStrength * ms;

        // Vortex tangential force
        const toCenterX = 0.5 - pt.x; const toCenterY = 0.5 - pt.y;
        const r = Math.hypot(toCenterX, toCenterY);
        if (r > 0.01) {
          const tangX = -toCenterY / r; const tangY = toCenterX / r;
          pt.vx += tangX * s.vortexSpeed * 0.3 * ms;
          pt.vy += tangY * s.vortexSpeed * 0.3 * ms;
        }

        pt.vx *= PART_DAMP; pt.vy *= PART_DAMP;
        pt.x += pt.vx * ms; pt.y += pt.vy * ms;

        // Track organization
        totalDist += Math.hypot(pt.x - idealX, pt.y - idealY);
      }

      s.organization = Math.max(0, Math.min(1, 1 - totalDist / (PARTICLE_COUNT * 0.08)));

      if (s.organization > ORG_THRESHOLD) s.orgFrames += ms;
      else s.orgFrames = Math.max(0, s.orgFrames - 2);

      // Haptics
      if (s.organization > 0.5 && !s.stepNotified) {
        s.stepNotified = true; cb.onHaptic('step_advance');
      }
      if (s.orgFrames > ORG_FRAMES && !s.completed) {
        s.completed = true; cb.onHaptic('seal_stamp');
      }
      cb.onStateChange?.(s.completed ? 1 : s.organization * 0.95);

      const breathMod = 1 + breath * 0.05;
      const vRpx = px(VORTEX_R, minDim);

      // Centers of mass for interference sources
      const com0 = centerOfMass(s.particles, 0);
      const com1 = centerOfMass(s.particles, 1);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Vortex field glow
      // ════════════════════════════════════════════════════
      for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = px(GLOW.md * (0.2 + s.organization * 0.5 + gi * 0.12), minDim) * breathMod;
        const gA = ALPHA.glow.max * (0.01 + s.organization * 0.06) * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.3, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), gA * 0.4));
        gg.addColorStop(0.7, rgba(s.accentRgb, gA * 0.1));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Interference fringe field (SIGNATURE)
      // ════════════════════════════════════════════════════
      if (s.organization > 0.2) {
        const fringeIntensity = (s.organization - 0.2) / 0.8;
        const lambda = px(FRINGE_LAMBDA, minDim);
        const s1x = com0.x * w; const s1y = com0.y * h;
        const s2x = com1.x * w; const s2y = com1.y * h;

        for (let ri = 0; ri < FRINGE_RINGS; ri++) {
          const t = ri / FRINGE_RINGS;
          const fR = vRpx * (0.5 + t * 1.2);
          const pts = 36;
          for (let pi = 0; pi < pts; pi++) {
            const pa = (pi / pts) * Math.PI * 2;
            const fpx = cx + Math.cos(pa) * fR;
            const fpy = cy + Math.sin(pa) * fR;
            const d1 = Math.hypot(fpx - s1x, fpy - s1y);
            const d2 = Math.hypot(fpx - s2x, fpy - s2y);
            const phaseDiff = ((d1 - d2) / lambda + time * 0.15) * Math.PI;
            const intensity = Math.pow(Math.cos(phaseDiff), 2);
            const fA = ALPHA.glow.max * 0.03 * intensity * fringeIntensity * entrance;
            if (fA < 0.001) continue;
            const dotR = px(0.002, minDim) * (0.4 + intensity * 0.6);
            const fCol = lerpColor(s.primaryRgb, s.accentRgb, 0.5 + (intensity - 0.5) * 0.3);
            ctx.beginPath(); ctx.arc(fpx, fpy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(fCol, fA);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Vortex flow lines
      // ════════════════════════════════════════════════════
      if (s.vortexSpeed > 0.001) {
        for (let fi = 0; fi < FLOW_LINE_COUNT; fi++) {
          const startAngle = s.vortexAngle + (fi / FLOW_LINE_COUNT) * Math.PI * 2;
          ctx.beginPath();
          for (let si = 0; si <= 30; si++) {
            const t = si / 30;
            const spiralR = vRpx * (0.2 + t * 0.8);
            const spiralA = startAngle + t * Math.PI * 1.5;
            const sx = cx + Math.cos(spiralA) * spiralR;
            const sy = cy + Math.sin(spiralA) * spiralR;
            if (si === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.02 * (s.vortexSpeed / VORTEX_SPEED) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Particle field
      // ════════════════════════════════════════════════════
      for (const pt of s.particles) {
        const ptx = pt.x * w; const pty = pt.y * h;
        const rgb = pt.side === 0 ? s.primaryRgb : s.accentRgb;
        const ptR = px(0.003, minDim);
        // Glow
        const pgR = ptR * 2.5;
        const pg = ctx.createRadialGradient(ptx, pty, 0, ptx, pty, pgR);
        pg.addColorStop(0, rgba(rgb, ALPHA.glow.max * 0.04 * entrance));
        pg.addColorStop(1, rgba(rgb, 0));
        ctx.fillStyle = pg; ctx.fillRect(ptx - pgR, pty - pgR, pgR * 2, pgR * 2);
        // Core
        ctx.beginPath(); ctx.arc(ptx, pty, ptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(rgb, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * 0.2 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Yin-Yang form (when organized)
      // ════════════════════════════════════════════════════
      if (s.organization > 0.6) {
        const formAlpha = (s.organization - 0.6) / 0.4;
        const halfAlpha = ALPHA.content.max * 0.08 * formAlpha * entrance;
        // Outer circle
        ctx.beginPath(); ctx.arc(cx, cy, vRpx * 0.95, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), halfAlpha * 0.5);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        // Yin (bottom-left)
        ctx.beginPath();
        ctx.arc(cx, cy, vRpx * 0.95, Math.PI / 2 + s.vortexAngle, -Math.PI / 2 + s.vortexAngle);
        const yinMidAngle = s.vortexAngle;
        ctx.arc(cx + Math.cos(yinMidAngle) * vRpx * 0.475, cy + Math.sin(yinMidAngle) * vRpx * 0.475, vRpx * 0.475, -Math.PI / 2 + s.vortexAngle, Math.PI / 2 + s.vortexAngle, true);
        const yangMidAngle = s.vortexAngle + Math.PI;
        ctx.arc(cx + Math.cos(yangMidAngle) * vRpx * 0.475, cy + Math.sin(yangMidAngle) * vRpx * 0.475, vRpx * 0.475, -Math.PI / 2 + s.vortexAngle, Math.PI / 2 + s.vortexAngle);
        ctx.fillStyle = rgba(s.accentRgb, halfAlpha);
        ctx.fill();
        // Yang (top-right)
        ctx.beginPath();
        ctx.arc(cx, cy, vRpx * 0.95, -Math.PI / 2 + s.vortexAngle, Math.PI / 2 + s.vortexAngle);
        ctx.arc(cx + Math.cos(yinMidAngle) * vRpx * 0.475, cy + Math.sin(yinMidAngle) * vRpx * 0.475, vRpx * 0.475, Math.PI / 2 + s.vortexAngle, -Math.PI / 2 + s.vortexAngle, true);
        ctx.arc(cx + Math.cos(yangMidAngle) * vRpx * 0.475, cy + Math.sin(yangMidAngle) * vRpx * 0.475, vRpx * 0.475, Math.PI / 2 + s.vortexAngle, -Math.PI / 2 + s.vortexAngle);
        ctx.fillStyle = rgba(s.primaryRgb, halfAlpha);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Synthesis dots with specular
      // ════════════════════════════════════════════════════
      if (s.organization > 0.7) {
        const dotAlpha = (s.organization - 0.7) / 0.3;
        const yinMidAngle = s.vortexAngle;
        const yangMidAngle = s.vortexAngle + Math.PI;
        const dots = [
          { x: cx + Math.cos(yinMidAngle) * vRpx * 0.475, y: cy + Math.sin(yinMidAngle) * vRpx * 0.475, rgb: s.accentRgb },
          { x: cx + Math.cos(yangMidAngle) * vRpx * 0.475, y: cy + Math.sin(yangMidAngle) * vRpx * 0.475, rgb: s.primaryRgb },
        ];
        for (const dot of dots) {
          const dR = px(DOT_R, minDim);
          // Glow
          const dgR = dR * 3;
          const dg = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dgR);
          dg.addColorStop(0, rgba(dot.rgb, ALPHA.glow.max * 0.06 * dotAlpha * entrance));
          dg.addColorStop(1, rgba(dot.rgb, 0));
          ctx.fillStyle = dg; ctx.fillRect(dot.x - dgR, dot.y - dgR, dgR * 2, dgR * 2);
          // Body
          const dotGrad = ctx.createRadialGradient(dot.x - dR * 0.2, dot.y - dR * 0.2, dR * 0.1, dot.x, dot.y, dR);
          const dA = ALPHA.content.max * 0.35 * dotAlpha * entrance;
          dotGrad.addColorStop(0, rgba(lerpColor(dot.rgb, [255, 255, 255] as RGB, 0.4), dA));
          dotGrad.addColorStop(0.4, rgba(dot.rgb, dA * 0.85));
          dotGrad.addColorStop(1, rgba(dot.rgb, dA * 0.2));
          ctx.beginPath(); ctx.arc(dot.x, dot.y, dR, 0, Math.PI * 2);
          ctx.fillStyle = dotGrad; ctx.fill();
          // Specular
          ctx.beginPath();
          ctx.ellipse(dot.x - dR * 0.2, dot.y - dR * 0.3, dR * 0.3, dR * 0.15, -0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * dotAlpha * entrance);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Standing-wave halo + breath pulse
      // ════════════════════════════════════════════════════
      if (s.completed) {
        for (let si = 0; si < STANDING_RINGS; si++) {
          const t = si / STANDING_RINGS;
          const sr = vRpx * (1.1 + t * 0.8) * breathMod;
          const standing = Math.pow(Math.cos(t * Math.PI * 3 + time * 0.3), 2);
          ctx.beginPath(); ctx.arc(cx, cy, sr, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(
            lerpColor(s.primaryRgb, s.accentRgb, t),
            ALPHA.glow.max * 0.025 * standing * entrance,
          );
          ctx.lineWidth = px(STROKE.hairline, minDim) * (0.5 + standing);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      if (s.organization > 0.01) {
        ctx.beginPath(); ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.organization);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.spinning = true;
      if (!stateRef.current.dragNotified) {
        stateRef.current.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.spinning = false;
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
