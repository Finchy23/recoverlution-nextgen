/**
 * ATOM 284: THE CYMATIC RESONANCE ENGINE
 * =========================================
 * Series 29 — Interoceptive Anchor · Position 4
 *
 * Sound is physical geometry. Hold to sustain a tone — chaotic
 * particles sweep into a breathtaking symmetric mandala pattern.
 * Release and they scatter. Hold long enough → crystallized completion.
 *
 * SIGNATURE TECHNIQUE: Topographic contour lines + Chladni patterns
 *   - THIS IS THE SERIES CENTERPIECE — Chladni plate simulation
 *   - Particles migrate to nodal lines of vibrating plate equation
 *   - Frequency increases with hold duration → more complex patterns
 *   - Topographic contour underlays show the "landscape" of resonance
 *   - Contours deform as the resonance frequency shifts
 *
 * PHYSICS:
 *   - 120 particles scattered randomly → migrate to Chladni nodal lines
 *   - Chladni equation: cos(n*pi*x)*cos(m*pi*y) - cos(m*pi*x)*cos(n*pi*y)
 *   - n,m increase as hold progresses → more complex mandala
 *   - 8 layers: contour terrain, Chladni field background, guide rings,
 *     particle connections, particles with glow, center resonator,
 *     frequency indicator, crystallized seal
 *   - Breath couples to: particle drift speed, contour warmth, glow pulse
 *   - ~5s sustained hold → crystallized completion
 *
 * INTERACTION:
 *   Hold → particles form Chladni pattern (hold_start, step_advance)
 *   Release → scatter back to chaos
 *   Sustained hold → crystallized (completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static crystallized Chladni mandala
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Total resonant particles in the system */
const PARTICLE_COUNT = 120;
/** Base symmetry order for the mandala */
const SYMMETRY = 6;
/** Number of concentric guide rings */
const GUIDE_RINGS = 5;
/** Guide ring spacing (fraction of minDim) */
const RING_SPACING = 0.065;
/** Particle visual radius (fraction of minDim) */
const PARTICLE_R = 0.0035;
/** Migration speed toward Chladni targets */
const MIGRATION_SPEED = 0.025;
/** Scatter speed when released */
const SCATTER_SPEED = 0.01;
/** Frames of hold needed for full crystallization (~5s) */
const CRYSTALLIZE_HOLD = 300;
/** Number of glow layers for center resonator */
const CENTER_GLOW_LAYERS = 5;
/** Topographic contour ring count */
const CONTOUR_RINGS = 10;
/** Contour spacing (fraction of minDim) */
const CONTOUR_SPACING = 0.035;
/** Chladni background field resolution */
const CHLADNI_BG_RES = 30;
/** Chladni background dot radius */
const CHLADNI_BG_DOT = 0.002;
/** Chladni zero-crossing threshold for background */
const CHLADNI_BG_THRESH = 0.18;
/** Breath particle drift coupling */
const BREATH_DRIFT = 0.04;
/** Breath glow pulse coupling */
const BREATH_GLOW = 0.06;
/** Specular on crystallized center */
const SPECULAR_R = 0.18;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Resonant particle that migrates between chaos and Chladni nodal lines */
interface CymaticParticle {
  /** Current position (0-1 normalized) */
  x: number; y: number;
  /** Random scatter home position */
  homeX: number; homeY: number;
  /** Current Chladni target position */
  targetX: number; targetY: number;
  /** Phase offset for individual drift */
  phase: number;
  /** Size variation multiplier */
  sizeVar: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Evaluate Chladni plate equation at normalized coordinates.
 * Returns value at (nx, ny) for modal numbers (n, m).
 */
function chladni(nx: number, ny: number, n: number, m: number): number {
  return Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny)
       - Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny);
}

/**
 * Find Chladni nodal positions (zero-crossings) by sampling.
 * Returns array of (x, y) positions where |chladni| < threshold.
 */
function findChladniTargets(
  n: number, m: number, count: number, threshold = 0.08,
): { x: number; y: number }[] {
  const targets: { x: number; y: number }[] = [];
  const res = 60;
  const candidates: { x: number; y: number; val: number }[] = [];

  for (let xi = 0; xi < res; xi++) {
    for (let yi = 0; yi < res; yi++) {
      const nx = (xi / (res - 1)) * 2 - 1;
      const ny = (yi / (res - 1)) * 2 - 1;
      if (nx * nx + ny * ny > 1) continue;
      const val = Math.abs(chladni(nx, ny, n, m));
      if (val < threshold) {
        candidates.push({ x: 0.5 + nx * 0.4, y: 0.5 + ny * 0.4, val });
      }
    }
  }

  // Sort by closest to zero, take count
  candidates.sort((a, b) => a.val - b.val);
  for (let i = 0; i < Math.min(count, candidates.length); i++) {
    targets.push({ x: candidates[i].x, y: candidates[i].y });
  }

  // Fill remaining with random nodal positions
  while (targets.length < count) {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.1 + Math.random() * 0.3;
    targets.push({ x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r });
  }

  return targets;
}

/**
 * Draw topographic contour field underneath the resonance.
 * Contours distort based on the current Chladni frequency.
 */
function drawContourTerrain(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number, formation: number,
  frame: number, breathAmp: number,
): void {
  for (let i = 0; i < CONTOUR_RINGS; i++) {
    const baseR = px(CONTOUR_SPACING * (i + 1.5), minDim);
    const breathDrift = breathAmp * px(0.003, minDim) * Math.sin(i * 0.6 + frame * 0.004);
    // Contours compress inward as formation increases (resonance focuses)
    const compress = 1 - formation * 0.2;
    const r = baseR * compress + breathDrift;
    const alpha = ALPHA.atmosphere.max * (0.1 + formation * 0.1) *
      (1 - i / CONTOUR_RINGS) * entrance * 0.4;

    ctx.beginPath();
    const steps = 48;
    for (let a = 0; a <= steps; a++) {
      const angle = (a / steps) * Math.PI * 2;
      const wobble = 1 + 0.06 * Math.sin(angle * (3 + Math.floor(formation * 3)) + i * 0.9 + frame * 0.003);
      const px2 = cx + Math.cos(angle) * r * wobble;
      const py2 = cy + Math.sin(angle) * r * wobble;
      if (a === 0) ctx.moveTo(px2, py2);
      else ctx.lineTo(px2, py2);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = px(i % 3 === 0 ? STROKE.thin : STROKE.hairline, minDim);
    ctx.stroke();
  }
}

/**
 * Draw the Chladni field as a background dot pattern.
 * Shows the full resonance landscape, not just nodal lines.
 */
function drawChladniBackground(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  rgb: RGB, entrance: number, n: number, m: number,
  formation: number,
): void {
  if (formation < 0.15) return;
  const fieldR = px(0.38, minDim);
  const dotR = px(CHLADNI_BG_DOT, minDim);
  const vis = Math.min(1, (formation - 0.15) / 0.4);

  for (let xi = 0; xi < CHLADNI_BG_RES; xi++) {
    for (let yi = 0; yi < CHLADNI_BG_RES; yi++) {
      const nx = (xi / (CHLADNI_BG_RES - 1)) * 2 - 1;
      const ny = (yi / (CHLADNI_BG_RES - 1)) * 2 - 1;
      if (nx * nx + ny * ny > 1) continue;

      const val = Math.abs(chladni(nx, ny, n, m));
      if (val < CHLADNI_BG_THRESH) {
        const x = cx + nx * fieldR;
        const y = cy + ny * fieldR;
        const intensity = (1 - val / CHLADNI_BG_THRESH) * vis;
        ctx.beginPath();
        ctx.arc(x, y, dotR * (0.3 + intensity * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = rgba(rgb, ALPHA.content.max * 0.06 * intensity * entrance);
        ctx.fill();
      }
    }
  }
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function CymaticResonanceAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildParticles = (): CymaticParticle[] => {
    const targets = findChladniTargets(2, 3, PARTICLE_COUNT);
    return targets.map((t, i) => ({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      homeX: 0.1 + Math.random() * 0.8,
      homeY: 0.1 + Math.random() * 0.8,
      targetX: t.x,
      targetY: t.y,
      phase: Math.random() * Math.PI * 2,
      sizeVar: 0.6 + Math.random() * 0.8,
    }));
  };

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    particles: buildParticles(),
    holding: false,
    holdNotified: false,
    holdFrames: 0,
    formation: 0,
    crystallized: false,
    stepNotified: false,
    completed: false,
    lastN: 2,
    lastM: 3,
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
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const active = s.holding || p.phase === 'resolve';

      if (p.reducedMotion || p.phase === 'resolve') {
        s.formation = 1;
        s.crystallized = true;
      }

      // ═══════════════════════════════════════════════════════════════
      // FORMATION PHYSICS — frequency shifts as hold progresses
      // ═══════════════════════════════════════════════════════════════
      const holdFrac = Math.min(1, s.holdFrames / CRYSTALLIZE_HOLD);
      // Modal numbers increase with hold duration
      const n = 2 + Math.floor(holdFrac * 3);
      const m = 3 + Math.floor(holdFrac * 2);

      // Recalculate targets when frequency changes
      if ((n !== s.lastN || m !== s.lastM) && !s.crystallized) {
        const newTargets = findChladniTargets(n, m, PARTICLE_COUNT);
        for (let i = 0; i < s.particles.length; i++) {
          s.particles[i].targetX = newTargets[i].x;
          s.particles[i].targetY = newTargets[i].y;
        }
        s.lastN = n;
        s.lastM = m;
      }

      if (active && !s.crystallized) {
        s.holdFrames += ms;
        s.formation = Math.min(1, s.formation + MIGRATION_SPEED * 0.018 * ms);

        if (s.holdFrames > CRYSTALLIZE_HOLD * 0.5 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }
        if (s.holdFrames >= CRYSTALLIZE_HOLD && !s.crystallized) {
          s.crystallized = true;
          s.formation = 1;
          cb.onHaptic('completion');
          s.completed = true;
        }
      } else if (!s.crystallized) {
        s.formation = Math.max(0, s.formation - SCATTER_SPEED * 0.018 * ms);
      }

      // Move particles toward target or home
      const breathDrift = p.breathAmplitude * BREATH_DRIFT * 0.01;
      for (const pt of s.particles) {
        const tx = s.formation * pt.targetX + (1 - s.formation) * pt.homeX;
        const ty = s.formation * pt.targetY + (1 - s.formation) * pt.homeY;
        const speed = s.crystallized ? 0.08 : 0.025;
        pt.x += (tx - pt.x) * speed * ms + breathDrift * Math.sin(pt.phase + s.frameCount * 0.01);
        pt.y += (ty - pt.y) * speed * ms + breathDrift * Math.cos(pt.phase + s.frameCount * 0.01);
      }

      cb.onStateChange?.(s.crystallized ? 1 : holdFrac);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Topographic contour terrain
      // ═══════════════════════════════════════════════════════════════
      drawContourTerrain(ctx, cx, cy, minDim, s.primaryRgb, entrance,
        s.formation, s.frameCount, p.breathAmplitude);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Chladni background field (nodal dot pattern)
      // ═══════════════════════════════════════════════════════════════
      const warmRgb = lerpColor(s.primaryRgb, s.accentRgb,
        p.breathAmplitude * BREATH_GLOW);
      drawChladniBackground(ctx, cx, cy, minDim, warmRgb, entrance, n, m, s.formation);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Guide rings + symmetry lines
      // ═══════════════════════════════════════════════════════════════
      if (s.formation > 0.25) {
        const vis = (s.formation - 0.25) / 0.75;
        for (let ring = 0; ring < GUIDE_RINGS; ring++) {
          const r = (ring + 1) * RING_SPACING;
          const rPx = r * minDim;
          ctx.beginPath();
          ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.025 * vis * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        for (let i = 0; i < SYMMETRY; i++) {
          const angle = (i / SYMMETRY) * Math.PI * 2;
          const lineR = GUIDE_RINGS * RING_SPACING * minDim;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * lineR, cy + Math.sin(angle) * lineR);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.02 * vis * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Particle connections (when forming)
      // ═══════════════════════════════════════════════════════════════
      if (s.formation > 0.45) {
        const connVis = (s.formation - 0.45) / 0.55;
        ctx.lineWidth = px(STROKE.hairline, minDim);
        for (let i = 0; i < s.particles.length; i++) {
          const pi = s.particles[i];
          for (let j = i + 1; j < Math.min(i + 6, s.particles.length); j++) {
            const pj = s.particles[j];
            const dist = Math.hypot(pi.x - pj.x, pi.y - pj.y);
            if (dist < RING_SPACING * 1.2) {
              const fade = 1 - dist / (RING_SPACING * 1.2);
              ctx.beginPath();
              ctx.moveTo(pi.x * w, pi.y * h);
              ctx.lineTo(pj.x * w, pj.y * h);
              ctx.strokeStyle = rgba(s.primaryRgb,
                ALPHA.content.max * 0.025 * connVis * fade * entrance);
              ctx.stroke();
            }
          }
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — Particles (with individual glow when formed)
      // ═══════════════════════════════════════════════════════════════
      const particleColor = lerpColor(s.accentRgb, s.primaryRgb, s.formation);
      for (const pt of s.particles) {
        const pxPos = pt.x * w;
        const pyPos = pt.y * h;
        const pR = px(PARTICLE_R * pt.sizeVar * (0.7 + s.formation * 0.5), minDim);

        // Individual particle glow (only when forming)
        if (s.formation > 0.5) {
          const glowR = pR * 3;
          const pg = ctx.createRadialGradient(pxPos, pyPos, 0, pxPos, pyPos, glowR);
          pg.addColorStop(0, rgba(warmRgb, ALPHA.glow.max * 0.05 * s.formation * entrance));
          pg.addColorStop(0.5, rgba(warmRgb, ALPHA.glow.max * 0.01 * s.formation * entrance));
          pg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = pg;
          ctx.fillRect(pxPos - glowR, pyPos - glowR, glowR * 2, glowR * 2);
        }

        // Particle body
        ctx.beginPath();
        ctx.arc(pxPos, pyPos, pR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(particleColor,
          ALPHA.content.max * (0.15 + s.formation * 0.4) * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Center resonator (multi-stop glow + specular)
      // ═══════════════════════════════════════════════════════════════
      if (s.formation > 0.15) {
        const coreVis = (s.formation - 0.15) / 0.85;
        const breathPulse = 1 + p.breathAmplitude * BREATH_GLOW;
        const coreR = px(SIZE.sm * 0.4 * coreVis * breathPulse, minDim);

        for (let i = CENTER_GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = coreR * (2 + i * 2.5);
          const gA = ALPHA.glow.max * 0.08 * coreVis * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(warmRgb, gA));
          gg.addColorStop(0.25, rgba(warmRgb, gA * 0.5));
          gg.addColorStop(0.55, rgba(s.primaryRgb, gA * 0.12));
          gg.addColorStop(0.85, rgba(s.primaryRgb, gA * 0.02));
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Center body
        const bodyG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        const bodyA = ALPHA.content.max * 0.3 * coreVis * entrance;
        bodyG.addColorStop(0, rgba(lerpColor(warmRgb, [255, 255, 255] as unknown as RGB, 0.12), bodyA));
        bodyG.addColorStop(0.4, rgba(warmRgb, bodyA * 0.7));
        bodyG.addColorStop(0.8, rgba(s.primaryRgb, bodyA * 0.3));
        bodyG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bodyG;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight on center
        if (coreR > 3) {
          const spX = cx - coreR * 0.25;
          const spY = cy - coreR * 0.25;
          const spR = coreR * SPECULAR_R;
          const sg = ctx.createRadialGradient(spX, spY, 0, spX, spY, spR);
          sg.addColorStop(0, `rgba(255,255,255,${0.25 * coreVis * entrance})`);
          sg.addColorStop(0.5, `rgba(255,255,255,${0.05 * coreVis * entrance})`);
          sg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.arc(spX, spY, spR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Tone/frequency indicator
      // ═══════════════════════════════════════════════════════════════
      if (active && !s.crystallized) {
        // Frequency indicator: expanding rings at bottom
        const toneY = h * 0.92;
        const toneR = px(0.008 + holdFrac * 0.012, minDim);
        const toneG = ctx.createRadialGradient(cx, toneY, 0, cx, toneY, toneR * 2);
        toneG.addColorStop(0, rgba(warmRgb, ALPHA.content.max * 0.2 * entrance));
        toneG.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
        toneG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = toneG;
        ctx.beginPath();
        ctx.arc(cx, toneY, toneR * 2, 0, Math.PI * 2);
        ctx.fill();

        // Progress ring around tone indicator
        const progAngle = holdFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, toneY, toneR * 3, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Crystallized seal + completion bloom
      // ═══════════════════════════════════════════════════════════════
      if (s.crystallized) {
        const sealR = GUIDE_RINGS * RING_SPACING * minDim * 1.15;

        // Seal ring (double)
        ctx.beginPath();
        ctx.arc(cx, cy, sealR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.14 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, sealR * 1.08, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Rotating symmetry dots on seal
        const rotSpeed = s.frameCount * 0.0004;
        for (let i = 0; i < SYMMETRY * 2; i++) {
          const angle = (i / (SYMMETRY * 2)) * Math.PI * 2 + rotSpeed;
          const tipR = sealR * 1.04;
          const dotR = px(0.003, minDim);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(angle) * tipR, cy + Math.sin(angle) * tipR, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(warmRgb, ALPHA.content.max * 0.12 * entrance);
          ctx.fill();
        }

        // Completion bloom rings
        for (let i = 0; i < 3; i++) {
          const rPhase = (s.frameCount * 0.003 + i * 0.33) % 1;
          const bloomR = sealR * (1 + rPhase * 0.4);
          ctx.beginPath();
          ctx.arc(cx, cy, bloomR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmRgb, ALPHA.content.max * 0.04 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      s.holding = true;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onUp = () => { stateRef.current.holding = false; };

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
