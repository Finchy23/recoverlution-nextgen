/**
 * ATOM 271: THE OPEN PALM ENGINE
 * =================================
 * Series 28 — Impermanence Engine · Position 1
 *
 * You cannot hold water by clenching. Press too hard and it
 * cracks. Rest weightlessly — the object heals and glows.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Central orb wrapped in delicate cloth membrane (verlet mesh)
 *   - Grip pressure compresses cloth → fibers stretch, tear, fray
 *   - Release → golden thread re-weaving + healing entropy reversal
 *   - Entropy arc: ordered weave → chaotic tear → golden reknitting
 *   - Cloth vertices simulated with spring constraints
 *
 * PHYSICS:
 *   - 2D cloth mesh (grid of verlet-integrated points + constraints)
 *   - Hold = inward pressure → mesh compresses, fibers snap
 *   - Pressure > threshold → cascading fiber tears + error_boundary
 *   - Release → spring-back + golden thread healing animation
 *   - 8 render layers: atmosphere, cloth shadow, cloth mesh,
 *     fracture glow, orb body, specular highlight, heal bloom, progress ring
 *   - Breath couples to: mesh flutter amplitude, glow warmth
 *
 * INTERACTION:
 *   Hold too long → cloth tears (hold_start, error_boundary)
 *   Release + wait → golden reweaving → glows (completion)
 *
 * RENDER: Canvas 2D with verlet cloth mesh + fracture entropy
 * REDUCED MOTION: Static healed golden-threaded orb
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Hero orb radius — benchmark platinum size */
const ORB_R = 0.28;
/** Cloth mesh grid: rows of concentric rings */
const CLOTH_RINGS = 8;
/** Spokes radiating from center for mesh grid */
const CLOTH_SPOKES = 24;
/** Rate pressure increases per frame while holding */
const PRESSURE_RATE = 0.006;
/** Pressure level where fibers begin snapping */
const CRACK_THRESHOLD = 0.50;
/** Rate healing progresses per frame after release */
const HEAL_RATE = 0.004;
/** Maximum inward compression fraction at full pressure */
const COMPRESS_DEPTH = 0.18;
/** Maximum number of fiber-tear lines */
const MAX_TEARS = 14;
/** Branch count per primary tear */
const TEAR_BRANCHES = 2;
/** Glow layer count for heal bloom */
const HEAL_GLOW_LAYERS = 5;
/** Cloth flutter amplitude from breath */
const BREATH_FLUTTER = 0.008;
/** Cloth spring stiffness for verlet relaxation */
const SPRING_STIFFNESS = 0.45;
/** Entropy particle count — fibers dissolving */
const ENTROPY_PARTICLES = 80;
/** Specular highlight offset from center (fraction of orb radius) */
const SPECULAR_OFFSET = 0.28;
/** Specular highlight size (fraction of orb radius) */
const SPECULAR_SIZE = 0.18;
/** Gold thread shimmer frequency */
const GOLD_SHIMMER_FREQ = 0.04;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface TearLine {
  /** Angular direction of the tear from center */
  angle: number;
  /** Length of tear as fraction of orb radius */
  length: number;
  /** Sub-branches of the tear */
  branches: { angle: number; length: number }[];
  /** Whether this tear has been healed */
  healed: number;
}

interface EntropyMote {
  /** X position (viewport fraction) */
  x: number;
  /** Y position (viewport fraction) */
  y: number;
  /** Horizontal velocity */
  vx: number;
  /** Vertical velocity */
  vy: number;
  /** Remaining lifetime 0-1 */
  life: number;
  /** Size factor */
  size: number;
}

interface ClothVertex {
  /** Current X offset from rest (fraction of minDim) */
  x: number;
  /** Current Y offset from rest (fraction of minDim) */
  y: number;
  /** Previous X for verlet integration */
  px: number;
  /** Previous Y for verlet integration */
  py: number;
  /** Whether this fiber connection is severed */
  torn: boolean;
}

// ═════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Generate initial cloth mesh vertices */
function createClothMesh(): ClothVertex[][] {
  const mesh: ClothVertex[][] = [];
  for (let r = 0; r <= CLOTH_RINGS; r++) {
    const ring: ClothVertex[] = [];
    for (let s = 0; s < CLOTH_SPOKES; s++) {
      ring.push({ x: 0, y: 0, px: 0, py: 0, torn: false });
    }
    mesh.push(ring);
  }
  return mesh;
}

/** Hue-to-RGB for gold thread spectrum */
function goldShimmer(t: number, base: RGB): RGB {
  const warm = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
  return [
    Math.min(255, base[0] + warm * 40),
    Math.min(255, base[1] + warm * 15),
    Math.max(0, base[2] - warm * 20),
  ];
}

export default function OpenPalmAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
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
    pressure: 0,
    holding: false,
    holdNotified: false,
    healing: 0,
    tears: [] as TearLine[],
    tearIntensity: 0,
    errorNotified: false,
    completed: false,
    clothMesh: createClothMesh(),
    entropyMotes: [] as EntropyMote[],
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

    // Generate tear patterns
    const s = stateRef.current;
    if (s.tears.length === 0) {
      for (let i = 0; i < MAX_TEARS; i++) {
        const angle = (i / MAX_TEARS) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const branches: { angle: number; length: number }[] = [];
        for (let b = 0; b < TEAR_BRANCHES; b++) {
          branches.push({
            angle: angle + (Math.random() - 0.5) * 0.9,
            length: 0.25 + Math.random() * 0.35,
          });
        }
        s.tears.push({ angle, length: 0.45 + Math.random() * 0.55, branches, healed: 0 });
      }
    }

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0) * BREATH_FLUTTER;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        s.healing = 1; s.completed = true; s.pressure = 0; s.tearIntensity = 0;
      }
      if (p.phase === 'resolve') { s.healing = 1; }

      // ── Pressure / healing physics ──────────────────────────────
      if (s.holding) {
        s.pressure = Math.min(1, s.pressure + PRESSURE_RATE * ms);
        s.healing = Math.max(0, s.healing - 0.004 * ms);
        if (s.pressure > CRACK_THRESHOLD) {
          s.tearIntensity = Math.min(1, s.tearIntensity + 0.007 * ms);
          // Spawn entropy motes at tear points
          if (s.frameCount % 3 === 0 && s.entropyMotes.length < ENTROPY_PARTICLES) {
            const angle = Math.random() * Math.PI * 2;
            const dist = ORB_R * (0.3 + Math.random() * 0.7);
            s.entropyMotes.push({
              x: 0.5 + Math.cos(angle) * dist,
              y: 0.5 + Math.sin(angle) * dist,
              vx: (Math.random() - 0.5) * 0.002,
              vy: (Math.random() - 0.5) * 0.002 - 0.001,
              life: 1,
              size: 0.002 + Math.random() * 0.003,
            });
          }
          if (!s.errorNotified && s.tearIntensity > 0.25) {
            s.errorNotified = true;
            cb.onHaptic('error_boundary');
          }
        }
      } else {
        s.pressure = Math.max(0, s.pressure - 0.012 * ms);
        if (s.tearIntensity < 0.85) {
          s.healing = Math.min(1, s.healing + HEAL_RATE * ms);
          s.tearIntensity = Math.max(0, s.tearIntensity - 0.003 * ms);
          // Heal individual tears
          for (const tear of s.tears) {
            tear.healed = Math.min(1, tear.healed + 0.002 * ms);
          }
        }
        if (s.healing >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      // Update entropy motes
      for (let i = s.entropyMotes.length - 1; i >= 0; i--) {
        const m = s.entropyMotes[i];
        m.x += m.vx * ms;
        m.y += m.vy * ms;
        m.life -= 0.008 * ms;
        if (m.life <= 0) s.entropyMotes.splice(i, 1);
      }

      cb.onStateChange?.(s.completed ? 1 : s.healing);

      const orbR = px(ORB_R * (1 - s.pressure * COMPRESS_DEPTH), minDim);

      // ── Cloth mesh verlet simulation ────────────────────────────
      const mesh = s.clothMesh;
      for (let r = 0; r <= CLOTH_RINGS; r++) {
        const rFrac = r / CLOTH_RINGS;
        const restR = orbR * rFrac;
        for (let sp = 0; sp < CLOTH_SPOKES; sp++) {
          const v = mesh[r][sp];
          if (v.torn) continue;
          // Verlet integration
          const nx = v.x * 2 - v.px;
          const ny = v.y * 2 - v.py;
          v.px = v.x;
          v.py = v.y;
          // Spring back to rest position
          const angle = (sp / CLOTH_SPOKES) * Math.PI * 2;
          const restX = Math.cos(angle) * restR;
          const restY = Math.sin(angle) * restR;
          // Pressure pushes inward
          const pressureForce = s.pressure * COMPRESS_DEPTH * restR * (1 - rFrac * 0.3);
          const targetX = restX - Math.cos(angle) * pressureForce;
          const targetY = restY - Math.sin(angle) * pressureForce;
          // Breath flutter
          const flutterX = Math.sin(time * 2 + sp * 0.5 + r) * breath * minDim * rFrac;
          const flutterY = Math.cos(time * 1.7 + sp * 0.7 + r * 0.5) * breath * minDim * rFrac;
          v.x = nx + (targetX + flutterX - nx) * SPRING_STIFFNESS * ms;
          v.y = ny + (targetY + flutterY - ny) * SPRING_STIFFNESS * ms;
          // Tear if stretched too far
          if (s.tearIntensity > 0.5 && rFrac > 0.5 && Math.random() < 0.001 * s.tearIntensity) {
            v.torn = true;
          }
        }
      }
      // Reset torn vertices on heal
      if (s.healing > 0.7) {
        for (const ring of mesh) {
          for (const v of ring) v.torn = false;
        }
      }

      // ── 1. Cloth shadow beneath orb ─────────────────────────────
      const shadowR = orbR * 1.3;
      const shadowY = cy + orbR * 0.15;
      const shadowG = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowR);
      shadowG.addColorStop(0, rgba(s.primaryRgb, 0.06 * entrance));
      shadowG.addColorStop(0.4, rgba(s.primaryRgb, 0.03 * entrance));
      shadowG.addColorStop(0.7, rgba(s.primaryRgb, 0.01 * entrance));
      shadowG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = shadowG;
      ctx.fillRect(cx - shadowR, shadowY - shadowR, shadowR * 2, shadowR * 2);

      // ── 2. Heal bloom (behind orb) ──────────────────────────────
      if (s.healing > 0.15 && !s.holding) {
        for (let i = HEAL_GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = orbR * (1.4 + i * 1.8 + s.healing * 2.5);
          const gA = ALPHA.glow.max * 0.08 * s.healing * entrance / (i + 1);
          const warmth = s.healing * 0.3;
          const glowCol = lerpColor(s.primaryRgb, goldShimmer(time * GOLD_SHIMMER_FREQ + i * 0.2, s.primaryRgb), warmth);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(glowCol, gA));
          gg.addColorStop(0.3, rgba(glowCol, gA * 0.5));
          gg.addColorStop(0.6, rgba(glowCol, gA * 0.15));
          gg.addColorStop(1, rgba(glowCol, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ── 3. Cloth mesh wireframe ─────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      const meshAlpha = ALPHA.content.max * 0.10 * entrance;

      // Concentric rings (cloth warp threads)
      for (let r = 1; r <= CLOTH_RINGS; r++) {
        ctx.beginPath();
        for (let sp = 0; sp <= CLOTH_SPOKES; sp++) {
          const idx = sp % CLOTH_SPOKES;
          const v = mesh[r][idx];
          if (v.torn) {
            ctx.moveTo(v.x, v.y);
            continue;
          }
          if (sp === 0) ctx.moveTo(v.x, v.y);
          else ctx.lineTo(v.x, v.y);
        }
        const ringHeal = s.healing * 0.4;
        const ringTear = s.tearIntensity * 0.3;
        const ringColor = lerpColor(s.primaryRgb, s.accentRgb, ringTear);
        ctx.strokeStyle = rgba(ringColor, meshAlpha * (0.5 + ringHeal));
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // Radial spokes (cloth weft threads)
      for (let sp = 0; sp < CLOTH_SPOKES; sp++) {
        ctx.beginPath();
        let broken = false;
        for (let r = 0; r <= CLOTH_RINGS; r++) {
          const v = mesh[r][sp];
          if (v.torn) { broken = true; continue; }
          const vx = r === 0 ? 0 : v.x;
          const vy = r === 0 ? 0 : v.y;
          if (r === 0 || broken) { ctx.moveTo(vx, vy); broken = false; }
          else ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, meshAlpha * 0.35);
        ctx.lineWidth = px(STROKE.hairline * 0.7, minDim);
        ctx.stroke();
      }
      ctx.restore();

      // ── 4. Orb body with multi-stop gradient ───────────────────
      const bodyGrad = ctx.createRadialGradient(
        cx - orbR * 0.15, cy - orbR * 0.15, 0, cx, cy, orbR);
      const bodyCol = lerpColor(s.primaryRgb, s.accentRgb, s.pressure * 0.35);
      const healWarm = lerpColor(bodyCol, goldShimmer(time * 0.02, s.primaryRgb), s.healing * 0.3);
      bodyGrad.addColorStop(0, rgba(healWarm, ALPHA.content.max * (0.30 + s.healing * 0.15) * entrance));
      bodyGrad.addColorStop(0.25, rgba(healWarm, ALPHA.content.max * (0.22 + s.healing * 0.10) * entrance));
      bodyGrad.addColorStop(0.55, rgba(bodyCol, ALPHA.content.max * (0.15 + s.healing * 0.05) * entrance));
      bodyGrad.addColorStop(0.85, rgba(bodyCol, ALPHA.content.max * 0.06 * entrance));
      bodyGrad.addColorStop(1, rgba(bodyCol, ALPHA.content.max * 0.02 * entrance));
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Orb edge ring
      ctx.beginPath();
      ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(bodyCol, ALPHA.content.max * 0.14 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── 5. Fracture tear lines with entropy glow ───────────────
      if (s.tearIntensity > 0.02) {
        const visibleTears = Math.ceil(s.tearIntensity * MAX_TEARS);
        for (let i = 0; i < visibleTears; i++) {
          const tear = s.tears[i];
          const tearLen = orbR * tear.length * s.tearIntensity;
          const healFade = 1 - tear.healed * 0.85;

          // Tear glow aura
          const glowW = px(0.015, minDim) * s.tearIntensity;
          const tmx = cx + Math.cos(tear.angle) * tearLen * 0.5;
          const tmy = cy + Math.sin(tear.angle) * tearLen * 0.5;
          const tg = ctx.createRadialGradient(tmx, tmy, 0, tmx, tmy, glowW);
          tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * s.tearIntensity * healFade * entrance));
          tg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(tmx - glowW, tmy - glowW, glowW * 2, glowW * 2);

          // Main tear line
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(tear.angle) * tearLen, cy + Math.sin(tear.angle) * tearLen);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.22 * s.tearIntensity * healFade * entrance);
          ctx.lineWidth = px(STROKE.light, minDim) * (0.5 + s.tearIntensity * 0.5);
          ctx.stroke();

          // Tear branches
          for (const br of tear.branches) {
            const bStart = 0.35 + Math.random() * 0.3;
            const bsx = cx + Math.cos(tear.angle) * tearLen * bStart;
            const bsy = cy + Math.sin(tear.angle) * tearLen * bStart;
            const bLen = tearLen * br.length * 0.45;
            ctx.beginPath();
            ctx.moveTo(bsx, bsy);
            ctx.lineTo(bsx + Math.cos(br.angle) * bLen, bsy + Math.sin(br.angle) * bLen);
            ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * s.tearIntensity * healFade * entrance);
            ctx.lineWidth = px(STROKE.hairline, minDim);
            ctx.stroke();
          }

          // Golden healing thread over tear
          if (tear.healed > 0.2) {
            const goldLen = tearLen * Math.min(1, tear.healed * 1.3);
            const goldCol = goldShimmer(time * GOLD_SHIMMER_FREQ + i * 0.4, s.primaryRgb);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(tear.angle) * goldLen, cy + Math.sin(tear.angle) * goldLen);
            ctx.strokeStyle = rgba(goldCol, ALPHA.content.max * 0.18 * tear.healed * entrance);
            ctx.lineWidth = px(STROKE.light, minDim) * 0.8;
            ctx.stroke();

            // Gold stitch dots along healed seam
            const stitchCount = Math.floor(tear.healed * 5);
            for (let st = 1; st <= stitchCount; st++) {
              const sf = st / (stitchCount + 1);
              const sx = cx + Math.cos(tear.angle) * goldLen * sf;
              const sy = cy + Math.sin(tear.angle) * goldLen * sf;
              const sDot = px(0.003, minDim) * tear.healed;
              const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sDot);
              sg.addColorStop(0, rgba(goldCol, ALPHA.glow.max * 0.12 * tear.healed * entrance));
              sg.addColorStop(1, rgba(goldCol, 0));
              ctx.fillStyle = sg;
              ctx.fillRect(sx - sDot, sy - sDot, sDot * 2, sDot * 2);
            }
          }
        }
      }

      // ── 6. Entropy motes (floating fiber fragments) ────────────
      for (const m of s.entropyMotes) {
        const mx = m.x * w;
        const my = m.y * h;
        const mSize = px(m.size, minDim);
        const mAlpha = ALPHA.content.max * 0.15 * m.life * entrance;
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mSize);
        mg.addColorStop(0, rgba(s.accentRgb, mAlpha));
        mg.addColorStop(0.5, rgba(s.accentRgb, mAlpha * 0.3));
        mg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(mx - mSize, my - mSize, mSize * 2, mSize * 2);
      }

      // ── 7. Specular highlight ──────────────────────────────────
      const specX = cx - orbR * SPECULAR_OFFSET;
      const specY = cy - orbR * SPECULAR_OFFSET;
      const specR = orbR * SPECULAR_SIZE;
      const specG = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
      specG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.18 * entrance * (0.6 + s.healing * 0.4)));
      specG.addColorStop(0.4, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.06 * entrance));
      specG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = specG;
      ctx.beginPath();
      ctx.arc(specX, specY, specR, 0, Math.PI * 2);
      ctx.fill();

      // Secondary reflection ellipse
      const spec2X = cx + orbR * 0.15;
      const spec2Y = cy + orbR * 0.22;
      const spec2R = orbR * 0.08;
      ctx.beginPath();
      ctx.ellipse(spec2X, spec2Y, spec2R * 1.5, spec2R, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.04 * entrance);
      ctx.fill();

      // ── 8. Pressure ring / completion radiance ─────────────────
      if (s.holding) {
        const pAngle = s.pressure * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, orbR * 1.25, -Math.PI / 2, -Math.PI / 2 + pAngle);
        const pColor = s.pressure > CRACK_THRESHOLD ? s.accentRgb : s.primaryRgb;
        ctx.strokeStyle = rgba(pColor, ALPHA.content.max * 0.14 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Pressure haze
        const hazeR = orbR * (1.1 + s.pressure * 0.4);
        const hazeG = ctx.createRadialGradient(cx, cy, orbR * 0.9, cx, cy, hazeR);
        hazeG.addColorStop(0, rgba(s.accentRgb, ALPHA.atmosphere.max * 0.04 * s.pressure * entrance));
        hazeG.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = hazeG;
        ctx.fillRect(cx - hazeR, cy - hazeR, hazeR * 2, hazeR * 2);
      }

      if (s.completed) {
        for (let i = 0; i < 4; i++) {
          const rPhase = (time * 0.05 + i * 0.25) % 1;
          const rR = orbR * (1.15 + rPhase * 3.5);
          const rAlpha = ALPHA.content.max * 0.035 * (1 - rPhase) * entrance * easeOutCubic(1 - rPhase);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(goldShimmer(time * 0.03 + i, s.primaryRgb), rAlpha);
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
      stateRef.current.holding = true;
      if (!stateRef.current.holdNotified) {
        stateRef.current.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onUp = () => {
      stateRef.current.holding = false;
      stateRef.current.errorNotified = false;
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
