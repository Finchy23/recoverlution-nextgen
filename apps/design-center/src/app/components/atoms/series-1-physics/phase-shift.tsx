/**
 * ATOM 002: THE PHASE-SHIFT ENGINE
 * =================================
 * Series 1 — Physics Engines · Position 2
 *
 * Moving from brokenness to integration.
 * The user physically seals fracture lines on a dark vessel
 * with liquid gold — kintsugi made interactive.
 *
 * PHYSICS:
 *   - Procedurally generated fracture network (Bezier curves)
 *   - Liquid gold flow simulation along fracture paths
 *   - Multi-pass volumetric gold rendering (glow → body → highlight)
 *   - Particle emission at the flow front
 *   - Breath modulates gold luminosity and flow speed
 *   - Progressive resolution: each sealed fracture advances state
 *
 * INTERACTION:
 *   Tap (near fracture)  → begins gold flow from that point
 *   Hold / Drag (along)  → sustains and accelerates flow
 *   Breath (passive)     → pulses gold warmth and glow
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Gold fills instantly on tap, no flow animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** How fast gold flows along a fracture (progress/frame, 0-1 scale) */
const FLOW_SPEED = 0.008;
/** Breath multiplier on flow speed (faster flow on inhale peak) */
const BREATH_FLOW_BOOST = 0.006;
/** How close a tap must be to a fracture to trigger healing (ratio of minDim) */
const TAP_PROXIMITY_RATIO = 0.12;
/** Number of sample points per fracture for distance computation */
const CURVE_SAMPLES = 48;
/** Gold particle count at the flow front */
const FLOW_PARTICLES = 12;
/** Glow intensity for sealed fractures */
const SEALED_GLOW_BASE = 0.4;
/** Overall radiance boost per healed fracture */
const RADIANCE_PER_HEAL = 0.08;
/** Frames after tap before we check for hold */
const HOLD_FRAMES = 20;
/** Hold speed multiplier */
const HOLD_SPEED_MULT = 1.6;

// =====================================================================
// FRACTURE GEOMETRY
// =====================================================================

interface FracturePoint {
  x: number;
  y: number;
}

interface Fracture {
  /** Bezier control points (start, control1, [control2], end) */
  points: FracturePoint[];
  /** Cached sampled points along the curve */
  samples: FracturePoint[];
  /** Cumulative arc lengths at each sample */
  arcLengths: number[];
  /** Total arc length */
  totalLength: number;
  /** Healing progress 0-1 */
  healProgress: number;
  /** Whether healing is currently active */
  isFlowing: boolean;
  /** Whether fully sealed */
  isSealed: boolean;
  /** Direction of flow: 0 = from start, 1 = from end, 0.5 = from middle */
  flowOrigin: number;
  /** Visual width variation seed */
  widthSeed: number;
  /** Individual shimmer phase */
  shimmerPhase: number;
}

/**
 * Generate a natural kintsugi fracture network.
 * Cracks radiate from a slightly off-center impact point
 * with organic branching and gentle curves.
 */
function generateFractures(w: number, h: number): { fractures: Fracture[]; centerX: number; centerY: number } {
  const cx = w * (0.45 + Math.random() * 0.1);
  const cy = h * (0.42 + Math.random() * 0.08);
  const maxR = Math.min(w, h) * 0.42;

  const fractures: Fracture[] = [];
  const crackCount = 7;

  // Distribute initial angles with some jitter
  const baseAngles: number[] = [];
  for (let i = 0; i < crackCount; i++) {
    baseAngles.push((i / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4);
  }

  for (let i = 0; i < crackCount; i++) {
    const angle = baseAngles[i];
    const length = maxR * (0.55 + Math.random() * 0.4);

    // Start slightly away from center (impact void)
    const startDist = maxR * 0.05;
    const sx = cx + Math.cos(angle) * startDist;
    const sy = cy + Math.sin(angle) * startDist;

    // End point
    const ex = cx + Math.cos(angle) * length;
    const ey = cy + Math.sin(angle) * length;

    // Control point — offset perpendicular for curve
    const perpAngle = angle + Math.PI / 2;
    const curvature = length * (0.05 + Math.random() * 0.12) * (Math.random() > 0.5 ? 1 : -1);
    const cpx = (sx + ex) / 2 + Math.cos(perpAngle) * curvature;
    const cpy = (sy + ey) / 2 + Math.sin(perpAngle) * curvature;

    const points = [
      { x: sx, y: sy },
      { x: cpx, y: cpy },
      { x: ex, y: ey },
    ];

    const { samples, arcLengths, totalLength } = sampleBezier(points);

    fractures.push({
      points,
      samples,
      arcLengths,
      totalLength,
      healProgress: 0,
      isFlowing: false,
      isSealed: false,
      flowOrigin: 0,
      widthSeed: Math.random(),
      shimmerPhase: Math.random() * Math.PI * 2,
    });
  }

  return { fractures, centerX: cx, centerY: cy };
}

/** Sample a quadratic Bezier curve into N points */
function sampleBezier(points: FracturePoint[]): {
  samples: FracturePoint[];
  arcLengths: number[];
  totalLength: number;
} {
  const samples: FracturePoint[] = [];
  const arcLengths: number[] = [0];
  let totalLength = 0;

  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const t = i / CURVE_SAMPLES;
    let x: number, y: number;

    if (points.length === 3) {
      // Quadratic Bezier
      const t1 = 1 - t;
      x = t1 * t1 * points[0].x + 2 * t1 * t * points[1].x + t * t * points[2].x;
      y = t1 * t1 * points[0].y + 2 * t1 * t * points[1].y + t * t * points[2].y;
    } else {
      // Linear fallback
      x = points[0].x + (points[points.length - 1].x - points[0].x) * t;
      y = points[0].y + (points[points.length - 1].y - points[0].y) * t;
    }

    samples.push({ x, y });

    if (i > 0) {
      const dx = x - samples[i - 1].x;
      const dy = y - samples[i - 1].y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
      arcLengths.push(totalLength);
    }
  }

  return { samples, arcLengths, totalLength };
}

/** Find minimum distance from a point to a sampled fracture, and the parameter t */
function distToFracture(px: number, py: number, fracture: Fracture): { dist: number; t: number } {
  let minDist = Infinity;
  let bestT = 0;

  for (let i = 0; i < fracture.samples.length; i++) {
    const s = fracture.samples[i];
    const dx = px - s.x;
    const dy = py - s.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < minDist) {
      minDist = d;
      bestT = i / CURVE_SAMPLES;
    }
  }

  return { dist: minDist, t: bestT };
}

// =====================================================================
// COLOR SYSTEM
// =====================================================================

// ── Gold palette ────────────────────────────────────────────
// Three tones for the multi-pass gold rendering
const GOLD_DEEP: RGB = [180, 130, 40];    // Deep amber base
const GOLD_WARM: RGB = [220, 175, 60];    // Warm mid-tone
const GOLD_BRIGHT: RGB = [255, 230, 150]; // Specular highlight

// =====================================================================
// FLOW-FRONT PARTICLES
// =====================================================================

interface FlowParticle {
  /** Offset from flow front along fracture (negative = behind) */
  offset: number;
  /** Perpendicular offset from fracture center line */
  perpOffset: number;
  /** Size */
  size: number;
  /** Brightness */
  brightness: number;
  /** Individual drift speed */
  drift: number;
  /** Life phase */
  life: number;
}

function createFlowParticles(): FlowParticle[] {
  const particles: FlowParticle[] = [];
  for (let i = 0; i < FLOW_PARTICLES; i++) {
    particles.push({
      offset: -Math.random() * 0.06,
      perpOffset: (Math.random() - 0.5) * 16,
      size: 0.5 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      drift: 0.001 + Math.random() * 0.003,
      life: Math.random(),
    });
  }
  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function PhaseShiftAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Stable refs
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // Persistent state across frames
  const stateRef = useRef<{
    fractures: Fracture[];
    flowParticles: FlowParticle[];
    pointerDown: boolean;
    pointerX: number;
    pointerY: number;
    holdFrames: number;
    activeFractureIdx: number;
    sealedCount: number;
    totalRadiance: number;
    entranceProgress: number;
    completionFired: boolean;
    frameCount: number;
    noiseCanvas: HTMLCanvasElement | null;
    primaryRgb: RGB;
    accentRgb: RGB;
    resolveGlow: number;
    impactCenterX: number;
    impactCenterY: number;
    /** Completion burst animation progress 0→1 */
    completionBurst: number;
    /** Frame at which completion fired */
    completionFrame: number;
  } | null>(null);

  // Update colors when props change
  useEffect(() => {
    const s = stateRef.current;
    if (s) {
      s.primaryRgb = parseColor(color);
      s.accentRgb = parseColor(accentColor);
    }
  }, [color, accentColor]);

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // Lazy init state
    if (!stateRef.current) {
      const { fractures, centerX, centerY } = generateFractures(w, h);
      stateRef.current = {
        fractures,
        flowParticles: createFlowParticles(),
        pointerDown: false,
        pointerX: 0,
        pointerY: 0,
        holdFrames: 0,
        activeFractureIdx: -1,
        sealedCount: 0,
        totalRadiance: 0,
        entranceProgress: 0,
        completionFired: false,
        frameCount: 0,
        noiseCanvas: null,
        primaryRgb: parseColor(color),
        accentRgb: parseColor(accentColor),
        resolveGlow: 0,
        impactCenterX: centerX,
        impactCenterY: centerY,
        completionBurst: 0,
        completionFrame: -1,
      };
    }
    const s = stateRef.current!;

    // Generate noise texture
    const generateNoise = (nw: number, nh: number): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = Math.ceil(nw / 2);
      c.height = Math.ceil(nh / 2);
      const nctx = c.getContext('2d');
      if (nctx) {
        const imgData = nctx.createImageData(c.width, c.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = Math.random() * 25;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
          d[i + 3] = 12 + Math.random() * 8;
        }
        nctx.putImageData(imgData, 0, 0);
      }
      return c;
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      s.pointerDown = true;
      s.pointerX = px;
      s.pointerY = py;
      s.holdFrames = 0;

      let bestIdx = -1;
      let bestDist = TAP_PROXIMITY_RATIO * minDim;

      for (let i = 0; i < s.fractures.length; i++) {
        const f = s.fractures[i];
        if (f.isSealed || f.isFlowing) continue;
        const { dist, t } = distToFracture(px, py, f);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
          f.flowOrigin = t;
        }
      }

      if (bestIdx < 0) {
        bestDist = TAP_PROXIMITY_RATIO * minDim;
        for (let i = 0; i < s.fractures.length; i++) {
          const f = s.fractures[i];
          if (f.isSealed) continue;
          const { dist, t } = distToFracture(px, py, f);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
            f.flowOrigin = t;
          }
        }
      }

      if (bestIdx >= 0) {
        s.activeFractureIdx = bestIdx;
        const f = s.fractures[bestIdx];
        if (!f.isFlowing) {
          f.isFlowing = true;
          if (propsRef.current.reducedMotion) {
            f.healProgress = 1;
          }
        }
        callbacksRef.current.onHaptic('tap');
      }

      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!s.pointerDown) return;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width * w;
      s.pointerY = (e.clientY - rect.top) / rect.height * h;

      if (s.activeFractureIdx >= 0) {
        const dragProximity = TAP_PROXIMITY_RATIO * minDim * 1.5;
        let bestIdx = -1;
        let bestDist = dragProximity;

        for (let i = 0; i < s.fractures.length; i++) {
          const f = s.fractures[i];
          if (f.isSealed || f.isFlowing) continue;
          const { dist } = distToFracture(s.pointerX, s.pointerY, f);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        }

        if (bestIdx < 0) {
          bestDist = dragProximity;
          for (let i = 0; i < s.fractures.length; i++) {
            const f = s.fractures[i];
            if (f.isSealed) continue;
            const { dist } = distToFracture(s.pointerX, s.pointerY, f);
            if (dist < bestDist) {
              bestDist = dist;
              bestIdx = i;
            }
          }
        }

        if (bestIdx >= 0 && bestIdx !== s.activeFractureIdx) {
          const f = s.fractures[bestIdx];
          if (!f.isFlowing) {
            f.isFlowing = true;
            const { t } = distToFracture(s.pointerX, s.pointerY, f);
            f.flowOrigin = t;
            callbacksRef.current.onHaptic('tap');
          }
          s.activeFractureIdx = bestIdx;
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      s.pointerDown = false;
      s.holdFrames = 0;
      s.activeFractureIdx = -1;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const breath = p.breathAmplitude;

      // Bail out if viewport is zero-sized
      if (w <= 0 || h <= 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Resize canvas buffer
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Hold detection ────────────────────────────────
      if (s.pointerDown && s.activeFractureIdx >= 0) {
        s.holdFrames++;
      }
      const isHolding = s.holdFrames > HOLD_FRAMES;

      // ── Physics: advance gold flow ────────────────────
      if (!p.reducedMotion) {
        for (const f of s.fractures) {
          if (f.isFlowing && !f.isSealed) {
            let speed = FLOW_SPEED + breath * BREATH_FLOW_BOOST;
            if (isHolding && s.fractures.indexOf(f) === s.activeFractureIdx) {
              speed *= HOLD_SPEED_MULT;
            }
            f.healProgress = Math.min(1, f.healProgress + speed);

            // Check seal
            if (f.healProgress >= 1 && !f.isSealed) {
              f.isSealed = true;
              f.isFlowing = false;
              s.sealedCount++;
              cb.onHaptic('step_advance');

              // Check completion
              if (s.sealedCount >= s.fractures.length && !s.completionFired) {
                s.completionFired = true;
                cb.onHaptic('completion');
                cb.onResolve?.();
                s.completionFrame = s.frameCount;
              }
            }
          }
        }
      } else {
        // Reduced motion: check for newly flowing fractures and seal them
        for (const f of s.fractures) {
          if (f.isFlowing && f.healProgress >= 1 && !f.isSealed) {
            f.isSealed = true;
            f.isFlowing = false;
            s.sealedCount++;
            cb.onHaptic('step_advance');
            if (s.sealedCount >= s.fractures.length && !s.completionFired) {
              s.completionFired = true;
              cb.onHaptic('completion');
              cb.onResolve?.();
              s.completionFrame = s.frameCount;
            }
          }
        }
      }

      // ── State reporting ───────────────────────────────
      const totalProgress = s.fractures.reduce((sum, f) => sum + f.healProgress, 0) / s.fractures.length;
      cb.onStateChange?.(totalProgress);

      // ── Radiance accumulation ────────────────────────
      const targetRadiance = s.sealedCount * RADIANCE_PER_HEAL;
      s.totalRadiance += (targetRadiance - s.totalRadiance) * 0.02;

      // ── Resolve glow ──────────────────────────────────
      if (p.phase === 'resolve' || s.completionFired) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
      }

      // ── Completion burst animation ────────────────────
      if (s.completionFrame >= 0) {
        const burstFrames = p.reducedMotion ? 1 : 180;
        const rawBurst = Math.min(1, (s.frameCount - s.completionFrame) / burstFrames);
        s.completionBurst = easeOutExpo(rawBurst);
      }

      // ══════════════════════════════════════════════════
      // RENDER LAYERS
      // ═════════════════════════════════════════════════

      const goldBase = lerpColor(GOLD_DEEP, s.primaryRgb, 0.15);
      const goldMid = lerpColor(GOLD_WARM, s.accentRgb, 0.1);

      // ── Layer 1: Vessel surface ───────────────────────
      // Deep dark with subtle warmth from color story
      const surfaceColor = lerpColor([12, 10, 14], s.primaryRgb, 0.04);
      const surfaceGrad = ctx.createRadialGradient(
        w * 0.45, h * 0.4, 0,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.7,
      );
      surfaceGrad.addColorStop(0, rgba(lerpColor(surfaceColor, [25, 22, 28], 0.5), entrance * 0.03));
      surfaceGrad.addColorStop(0.6, rgba(surfaceColor, entrance * 0.025));
      surfaceGrad.addColorStop(1, rgba(lerpColor(surfaceColor, [5, 3, 8], 0.5), entrance * 0.02));
      ctx.fillStyle = surfaceGrad;
      ctx.fillRect(0, 0, w, h);

      // Noise texture overlay
      if (s.noiseCanvas) {
        ctx.globalAlpha = 0.3 * entrance;
        ctx.drawImage(s.noiseCanvas, 0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      // ── Layer 2: Radiance glow (accumulates with healing) ─
      if (s.totalRadiance > 0.01) {
        const icx = Number.isFinite(s.impactCenterX) ? s.impactCenterX : w * 0.5;
        const icy = Number.isFinite(s.impactCenterY) ? s.impactCenterY : h * 0.5;
        const radGrad = ctx.createRadialGradient(
          icx, icy, 0,
          w * 0.5, h * 0.5, Math.min(w, h) * 0.5,
        );
        const radAlpha = s.totalRadiance * (0.08 + breath * 0.04);
        radGrad.addColorStop(0, rgba(goldMid, radAlpha));
        radGrad.addColorStop(0.5, rgba(goldBase, radAlpha * 0.3));
        radGrad.addColorStop(1, rgba(goldBase, 0));
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Layer 3: Fracture lines and gold ──────────────
      for (let fi = 0; fi < s.fractures.length; fi++) {
        const f = s.fractures[fi];
        const fractureEntrance = easeOutExpo(
          Math.max(0, Math.min(1, (entrance - fi * 0.02) / 0.3)),
        );
        if (fractureEntrance <= 0) continue;

        // 3a: The dark crack (always visible, fades as gold covers it)
        const crackAlpha = (1 - f.healProgress * 0.85) * fractureEntrance;
        if (crackAlpha > 0.01) {
          drawFracturePath(ctx, f);

          // Shadow/depth
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = minDim * 0.008;
          ctx.strokeStyle = `rgba(0, 0, 0, ${crackAlpha * 0.6})`;
          ctx.lineWidth = minDim * 0.005;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();

          // Thin dark line
          ctx.strokeStyle = `rgba(0, 0, 0, ${crackAlpha * 0.9})`;
          ctx.lineWidth = minDim * 0.0024;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Subtle pulsing guide glow on unhealed, untouched fractures
          if (!f.isFlowing && !f.isSealed && !p.reducedMotion) {
            const pulse = 0.12 + 0.08 * Math.sin(s.frameCount * 0.04 + f.shimmerPhase);
            drawFracturePath(ctx, f);
            ctx.save();
            ctx.shadowColor = rgba(goldMid, pulse * 0.6);
            ctx.shadowBlur = minDim * 0.02;
            ctx.strokeStyle = rgba(goldBase, pulse * fractureEntrance);
            ctx.lineWidth = minDim * 0.006;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
          }
        }

        // 3b: Gold fill (if healing or healed)
        if (f.healProgress > 0) {
          const breathGlow = 0.8 + breath * 0.2;
          const shimmer = f.isSealed
            ? 0.85 + 0.15 * Math.sin(s.frameCount * 0.02 + f.shimmerPhase)
            : 1;

          // Calculate which portion of the path to fill
          const fillStart = Math.max(0, f.flowOrigin - f.healProgress * 0.5);
          const fillEnd = Math.min(1, f.flowOrigin + f.healProgress * 0.5);

          // Also expand from edges for natural coverage
          const expansionStart = Math.max(0, fillStart - f.healProgress * 0.5);
          const expansionEnd = Math.min(1, fillEnd + f.healProgress * 0.5);

          const drawStart = expansionStart;
          const drawEnd = expansionEnd;

          // Pass 1: Wide soft glow
          drawPartialFracture(ctx, f, drawStart, drawEnd);
          ctx.save();
          ctx.shadowColor = rgba(goldMid, 0.5 * breathGlow * shimmer);
          ctx.shadowBlur = minDim * (0.03 + breath * 0.016);
          ctx.strokeStyle = rgba(goldBase, 0.15 * fractureEntrance * breathGlow * shimmer);
          ctx.lineWidth = minDim * (0.02 + f.widthSeed * 0.008);
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();

          // Pass 2: Medium warm body
          drawPartialFracture(ctx, f, drawStart, drawEnd);
          ctx.save();
          ctx.shadowColor = rgba(goldMid, 0.3 * breathGlow);
          ctx.shadowBlur = minDim * 0.012;
          ctx.strokeStyle = rgba(goldMid, 0.5 * fractureEntrance * breathGlow * shimmer);
          ctx.lineWidth = minDim * (0.007 + f.widthSeed * 0.003);
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();

          // Pass 3: Thin bright specular center
          drawPartialFracture(ctx, f, drawStart, drawEnd);
          ctx.strokeStyle = rgba(
            GOLD_BRIGHT,
            0.7 * fractureEntrance * breathGlow * shimmer,
          );
          ctx.lineWidth = minDim * (0.0024 + f.widthSeed * 0.001);
          ctx.lineCap = 'round';
          ctx.stroke();

          // 3c: Flow front particles (only while flowing, not reduced motion)
          if (f.isFlowing && !f.isSealed && !p.reducedMotion) {
            const frontT = Math.min(1, drawEnd);
            const frontIdx = Math.round(frontT * CURVE_SAMPLES);
            const frontPt = f.samples[Math.min(frontIdx, f.samples.length - 1)];

            if (frontPt) {
              // Tangent for perpendicular offset
              const nextIdx = Math.min(frontIdx + 1, f.samples.length - 1);
              const prevIdx = Math.max(frontIdx - 1, 0);
              const tangentX = f.samples[nextIdx].x - f.samples[prevIdx].x;
              const tangentY = f.samples[nextIdx].y - f.samples[prevIdx].y;
              const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY) || 1;
              const perpX = -tangentY / tangentLen;
              const perpY = tangentX / tangentLen;

              for (const particle of s.flowParticles) {
                // Animate particle life
                particle.life += particle.drift;
                if (particle.life > 1) particle.life -= 1;

                const lifeAlpha = Math.sin(particle.life * Math.PI);
                const px = frontPt.x + perpX * particle.perpOffset * lifeAlpha;
                const py = frontPt.y + perpY * particle.perpOffset * lifeAlpha;

                ctx.beginPath();
                ctx.arc(px, py, particle.size * (0.5 + lifeAlpha * 0.5), 0, Math.PI * 2);
                ctx.fillStyle = rgba(
                  GOLD_BRIGHT,
                  particle.brightness * lifeAlpha * 0.4 * breathGlow,
                );
                ctx.fill();
              }

              // Flow front glow
              const flowGrad = ctx.createRadialGradient(frontPt.x, frontPt.y, 0, frontPt.x, frontPt.y, minDim * 0.04);
              flowGrad.addColorStop(0, rgba(GOLD_BRIGHT, 0.25 * breathGlow));
              flowGrad.addColorStop(0.5, rgba(goldMid, 0.08 * breathGlow));
              flowGrad.addColorStop(1, rgba(goldBase, 0));
              ctx.fillStyle = flowGrad;
              const flowR = minDim * 0.04;
              ctx.fillRect(frontPt.x - flowR, frontPt.y - flowR, flowR * 2, flowR * 2);

              // Also draw from the other direction
              const backT = Math.max(0, drawStart);
              const backIdx = Math.round(backT * CURVE_SAMPLES);
              const backPt = f.samples[Math.min(backIdx, f.samples.length - 1)];

              if (backPt && Math.abs(backT - frontT) > 0.05) {
                const backGrad = ctx.createRadialGradient(backPt.x, backPt.y, 0, backPt.x, backPt.y, minDim * 0.03);
                backGrad.addColorStop(0, rgba(GOLD_BRIGHT, 0.15 * breathGlow));
                backGrad.addColorStop(1, rgba(goldBase, 0));
                ctx.fillStyle = backGrad;
                const backR = minDim * 0.03;
                ctx.fillRect(backPt.x - backR, backPt.y - backR, backR * 2, backR * 2);
              }
            }
          }
        }
      }

      // ── Layer 4: Impact center void → transforms to golden sun ─
      const impactX = Number.isFinite(s.impactCenterX) ? s.impactCenterX : w * 0.5;
      const impactY = Number.isFinite(s.impactCenterY) ? s.impactCenterY : h * 0.5;
      const impactR = minDim * (0.008 + totalProgress * 0.016 + breath * 0.004);

      if (totalProgress < 0.5) {
        // Dark void
        const voidAlpha = (1 - totalProgress * 2) * 0.6 * entrance;
        const voidGrad = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, impactR * 3);
        voidGrad.addColorStop(0, `rgba(0, 0, 0, ${voidAlpha})`);
        voidGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = voidGrad;
        ctx.fillRect(impactX - impactR * 3, impactY - impactR * 3, impactR * 6, impactR * 6);
      }

      // Golden center (appears as healing progresses)
      if (totalProgress > 0.2) {
        const goldAlpha = Math.min(1, (totalProgress - 0.2) * 1.5) * entrance * (0.7 + breath * 0.3);
        ctx.beginPath();
        ctx.arc(impactX, impactY, impactR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(GOLD_BRIGHT, goldAlpha * 0.5);
        ctx.fill();

        // Radiant halo
        const haloGrad = ctx.createRadialGradient(impactX, impactY, 0, impactX, impactY, impactR * 2.5);
        haloGrad.addColorStop(0, rgba(goldMid, goldAlpha * 0.25));
        haloGrad.addColorStop(0.5, rgba(goldBase, goldAlpha * 0.08));
        haloGrad.addColorStop(1, rgba(goldBase, 0));
        ctx.fillStyle = haloGrad;
        ctx.fillRect(impactX - impactR * 3, impactY - impactR * 3, impactR * 6, impactR * 6);
      }

      // ── Layer 5: Resolve phase — full golden web radiance ─
      if (s.resolveGlow > 0.01) {
        const resolveAlpha = s.resolveGlow * (0.06 + breath * 0.04);
        const resolveGrad = ctx.createRadialGradient(
          w * 0.5, h * 0.45, 0,
          w * 0.5, h * 0.5, Math.max(w, h) * 0.6,
        );
        resolveGrad.addColorStop(0, rgba(GOLD_BRIGHT, resolveAlpha));
        resolveGrad.addColorStop(0.3, rgba(goldMid, resolveAlpha * 0.5));
        resolveGrad.addColorStop(1, rgba(goldBase, 0));
        ctx.fillStyle = resolveGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Resolve phase: slowly seal any remaining ──────
      if (p.phase === 'resolve') {
        for (const f of s.fractures) {
          if (!f.isSealed && !f.isFlowing) {
            f.isFlowing = true;
            f.flowOrigin = 0.5;
          }
        }
      }

      // ── Completion burst animation ────────────────────
      if (s.completionBurst > 0) {
        const burst = s.completionBurst;
        const minDim = Math.min(w, h);

        // Phase 1: Bright flash that fades (quick flash in first 30%)
        const flashT = Math.min(1, burst / 0.3);
        const flashAlpha = (1 - flashT) * 0.4;
        if (flashAlpha > 0.005) {
          const flashGrad = ctx.createRadialGradient(
            impactX, impactY, 0,
            impactX, impactY, minDim * 0.5,
          );
          flashGrad.addColorStop(0, rgba(GOLD_BRIGHT, flashAlpha));
          flashGrad.addColorStop(0.4, rgba(goldMid, flashAlpha * 0.4));
          flashGrad.addColorStop(1, rgba(goldBase, 0));
          ctx.fillStyle = flashGrad;
          ctx.fillRect(0, 0, w, h);
        }

        // Phase 2: Expanding golden ring
        const ringR = burst * minDim * 0.6;
        const ringWidth = minDim * 0.03 * (1 - burst * 0.7);
        const ringAlpha = (1 - burst) * 0.6;
        if (ringAlpha > 0.01 && ringWidth > 0.2) {
          ctx.beginPath();
          ctx.arc(impactX, impactY, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(GOLD_BRIGHT, ringAlpha);
          ctx.lineWidth = ringWidth;
          ctx.stroke();

          // Ring glow
          ctx.save();
          ctx.shadowColor = rgba(goldMid, ringAlpha * 0.5);
          ctx.shadowBlur = minDim * 0.04;
          ctx.beginPath();
          ctx.arc(impactX, impactY, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(goldMid, ringAlpha * 0.3);
          ctx.lineWidth = ringWidth * 2;
          ctx.stroke();
          ctx.restore();
        }

        // Phase 3: Persistent warm afterglow (settles in after burst)
        if (burst > 0.5) {
          const settleT = (burst - 0.5) * 2; // 0→1
          const afterAlpha = settleT * 0.08 * (0.7 + breath * 0.3);
          const afterGrad = ctx.createRadialGradient(
            impactX, impactY, 0,
            impactX, impactY, minDim * 0.45,
          );
          afterGrad.addColorStop(0, rgba(GOLD_BRIGHT, afterAlpha));
          afterGrad.addColorStop(0.5, rgba(goldMid, afterAlpha * 0.4));
          afterGrad.addColorStop(1, rgba(goldBase, 0));
          ctx.fillStyle = afterGrad;
          ctx.fillRect(0, 0, w, h);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}
    >
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

// =====================================================================
// DRAWING HELPERS
// =====================================================================

/** Draw the full fracture path as a Canvas path (does not stroke) */
function drawFracturePath(ctx: CanvasRenderingContext2D, f: Fracture) {
  ctx.beginPath();
  if (f.samples.length === 0) return;
  ctx.moveTo(f.samples[0].x, f.samples[0].y);
  for (let i = 1; i < f.samples.length; i++) {
    ctx.lineTo(f.samples[i].x, f.samples[i].y);
  }
}

/** Draw a partial fracture path between parameter tStart and tEnd */
function drawPartialFracture(
  ctx: CanvasRenderingContext2D,
  f: Fracture,
  tStart: number,
  tEnd: number,
) {
  const startIdx = Math.max(0, Math.floor(tStart * CURVE_SAMPLES));
  const endIdx = Math.min(CURVE_SAMPLES, Math.ceil(tEnd * CURVE_SAMPLES));

  ctx.beginPath();
  if (startIdx >= f.samples.length) return;
  ctx.moveTo(f.samples[startIdx].x, f.samples[startIdx].y);
  for (let i = startIdx + 1; i <= endIdx && i < f.samples.length; i++) {
    ctx.lineTo(f.samples[i].x, f.samples[i].y);
  }
}