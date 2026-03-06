/**
 * ATOM 278: THE KINTSUGI ENGINE
 * ================================
 * Series 28 — Impermanence Engine · Position 8
 *
 * The break is not tragedy — it is history. Trace the cracks
 * with liquid gold. More beautiful for having been broken.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Vessel rendered as curved cloth surface with woven texture
 *   - Cracks = torn fiber seams in the cloth weave
 *   - Gold filling = re-weaving with luminous golden thread
 *   - Entropy arc: intact weave → torn entropy → golden re-integration
 *   - Each filled crack becomes a golden fiber stronger than original
 *   - Completed vessel: golden threadwork more luminous than intact cloth
 *
 * PHYSICS:
 *   - Bowl/vessel shape as curved cloth mesh (concentric rings + radials)
 *   - Crack network: branching tree of torn fiber paths
 *   - Drag along cracks → liquid gold fills the seam
 *   - Gold has metallic shimmer (specular dots along fill)
 *   - Each segment lights up permanently when filled
 *   - All cracks filled → vessel radiates golden completeness
 *   - 8 render layers: atmosphere, vessel shadow, vessel body, cloth mesh,
 *     unfilled cracks, gold-filled seams, specular highlights, completion halo
 *
 * INTERACTION:
 *   Drag along cracks → fill with gold (drag_snap, step_advance, completion)
 *
 * RENDER: Canvas 2D with cloth-vessel + golden thread repair
 * REDUCED MOTION: Static fully gold-filled vessel
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Vessel width (fraction of minDim) */
const VESSEL_W = 0.28;
/** Vessel height (fraction of minDim) */
const VESSEL_H = 0.22;
/** Vessel Y position (fraction of viewport height) */
const VESSEL_Y = 0.5;
/** Cloth mesh rings on vessel surface */
const CLOTH_RINGS = 6;
/** Cloth mesh radial spokes */
const CLOTH_SPOKES = 16;
/** Number of crack segments */
const CRACK_SEGMENTS = 10;
/** Fill proximity threshold (fraction of viewport) */
const FILL_RADIUS = 0.06;
/** Gold shimmer frequency */
const GOLD_SHIMMER_FREQ = 0.05;
/** Gold specular dot count per filled segment */
const GOLD_DOTS_PER_SEG = 3;
/** Golden thread glow radius */
const GOLD_GLOW_R = 0.008;
/** Completion halo layers */
const HALO_LAYERS = 5;
/** Gold base color warm shift */
const GOLD_WARM: RGB = [220, 185, 100];

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface CrackSegment {
  /** Start X (fraction of minDim from vessel center) */
  x1: number; y1: number;
  /** End X */
  x2: number; y2: number;
  /** Whether gold has filled this segment */
  filled: boolean;
  /** Fill animation progress 0-1 */
  fillProgress: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════

function generateCracks(): CrackSegment[] {
  const segments: CrackSegment[] = [];
  // Create branching crack tree from center
  const branches = 3 + Math.floor(Math.random() * 2);
  for (let b = 0; b < branches; b++) {
    const baseAngle = (b / branches) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    let cx = 0, cy = 0;
    const segCount = 2 + Math.floor(Math.random() * 2);
    for (let s = 0; s < segCount; s++) {
      const len = 0.04 + Math.random() * 0.06;
      const angle = baseAngle + (Math.random() - 0.5) * 0.8;
      const nx = cx + Math.cos(angle) * len;
      const ny = cy + Math.sin(angle) * len;
      segments.push({ x1: cx, y1: cy, x2: nx, y2: ny, filled: false, fillProgress: 0 });
      cx = nx; cy = ny;
    }
  }
  return segments.slice(0, CRACK_SEGMENTS);
}

/** Draw vessel (bowl) path */
function vesselPath(ctx: CanvasRenderingContext2D, vw: number, vh: number) {
  ctx.beginPath();
  ctx.moveTo(-vw, -vh * 0.3);
  ctx.bezierCurveTo(-vw * 0.9, vh * 0.4, -vw * 0.3, vh * 0.5, 0, vh * 0.5);
  ctx.bezierCurveTo(vw * 0.3, vh * 0.5, vw * 0.9, vh * 0.4, vw, -vh * 0.3);
  ctx.lineTo(vw * 0.85, -vh * 0.5);
  ctx.bezierCurveTo(vw * 0.5, -vh * 0.45, -vw * 0.5, -vh * 0.45, -vw * 0.85, -vh * 0.5);
  ctx.closePath();
}

export default function KintsugiAtom({
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
    cracks: generateCracks(),
    dragging: false,
    pointerX: 0,
    pointerY: 0,
    dragNotified: false,
    stepNotified: false,
    completed: false,
    filledCount: 0,
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
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0);

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        for (const c of s.cracks) { c.filled = true; c.fillProgress = 1; }
        s.completed = true;
      }
      if (p.phase === 'resolve') {
        for (const c of s.cracks) { c.filled = true; c.fillProgress = 1; }
        s.completed = true;
      }

      const vw = px(VESSEL_W, minDim);
      const vh = px(VESSEL_H, minDim);
      const vCy = VESSEL_Y * h;

      // ── Check pointer proximity to cracks ───────────────────────
      if (s.dragging) {
        // Convert pointer to vessel-local coords
        const localX = (s.pointerX - 0.5) * w / minDim;
        const localY = (s.pointerY - VESSEL_Y) * h / minDim;
        for (const seg of s.cracks) {
          if (seg.filled) continue;
          // Distance from pointer to segment midpoint
          const smx = (seg.x1 + seg.x2) / 2;
          const smy = (seg.y1 + seg.y2) / 2;
          const dist = Math.hypot(localX - smx, localY - smy);
          if (dist < FILL_RADIUS) {
            seg.fillProgress = Math.min(1, seg.fillProgress + 0.03 * ms);
            if (seg.fillProgress >= 1 && !seg.filled) {
              seg.filled = true;
              s.filledCount++;
              cb.onHaptic('drag_snap');
              if (s.filledCount >= Math.floor(s.cracks.length * 0.6) && !s.stepNotified) {
                s.stepNotified = true;
                cb.onHaptic('step_advance');
              }
              if (s.filledCount >= s.cracks.length && !s.completed) {
                s.completed = true;
                cb.onHaptic('completion');
              }
            }
          }
        }
      }

      // Animate fill progress on filled segments
      for (const seg of s.cracks) {
        if (seg.filled && seg.fillProgress < 1) {
          seg.fillProgress = Math.min(1, seg.fillProgress + 0.02 * ms);
        }
      }

      const filledFrac = s.filledCount / Math.max(1, s.cracks.length);
      cb.onStateChange?.(s.completed ? 1 : filledFrac);

      // ── 1. Vessel shadow ────────────────────────────────────────
      const shadowR = vw * 1.2;
      const shadowG = ctx.createRadialGradient(cx, vCy + vh * 0.4, 0, cx, vCy + vh * 0.4, shadowR);
      shadowG.addColorStop(0, rgba(s.primaryRgb, 0.05 * entrance));
      shadowG.addColorStop(0.5, rgba(s.primaryRgb, 0.02 * entrance));
      shadowG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = shadowG;
      ctx.fillRect(cx - shadowR, vCy - shadowR, shadowR * 2, shadowR * 2);

      // ── 2. Vessel body ──────────────────────────────────────────
      ctx.save();
      ctx.translate(cx, vCy);
      vesselPath(ctx, vw, vh);
      const bodyGrad = ctx.createRadialGradient(-vw * 0.15, -vh * 0.2, 0, 0, 0, Math.max(vw, vh));
      const bodyCol = lerpColor(s.primaryRgb, s.accentRgb, 0.1);
      bodyGrad.addColorStop(0, rgba(bodyCol, ALPHA.content.max * (0.28 + filledFrac * 0.1) * entrance));
      bodyGrad.addColorStop(0.3, rgba(bodyCol, ALPHA.content.max * 0.20 * entrance));
      bodyGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance));
      bodyGrad.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
      bodyGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.02 * entrance));
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Vessel edge
      vesselPath(ctx, vw, vh);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.14 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── 3. Cloth mesh texture on vessel ─────────────────────────
      // Horizontal rings
      for (let r = 1; r <= CLOTH_RINGS; r++) {
        const rFrac = r / (CLOTH_RINGS + 1);
        const ry = -vh * 0.5 + rFrac * vh;
        const rxScale = 1 - Math.abs(rFrac - 0.7) * 0.5;
        ctx.beginPath();
        ctx.moveTo(-vw * rxScale, ry);
        ctx.quadraticCurveTo(0, ry + vh * 0.02, vw * rxScale, ry);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // Vertical spokes
      for (let sp = 0; sp < CLOTH_SPOKES; sp++) {
        const spFrac = sp / (CLOTH_SPOKES - 1);
        const spX = -vw * 0.85 + spFrac * vw * 1.7;
        const topY = -vh * 0.45;
        const botY = vh * 0.45 * (1 - Math.abs(spFrac - 0.5) * 0.8);
        ctx.beginPath();
        ctx.moveTo(spX, topY);
        ctx.lineTo(spX, botY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── 4. Unfilled cracks (torn fibers) ────────────────────────
      for (const seg of s.cracks) {
        const sx = seg.x1 * minDim;
        const sy = seg.y1 * minDim;
        const ex = seg.x2 * minDim;
        const ey = seg.y2 * minDim;

        if (!seg.filled) {
          // Dark crack line
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.20 * entrance);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();

          // Crack edge glow
          const cmx = (sx + ex) / 2;
          const cmy = (sy + ey) / 2;
          const cgR = px(GOLD_GLOW_R, minDim);
          const cg = ctx.createRadialGradient(cmx, cmy, 0, cmx, cmy, cgR);
          cg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * entrance));
          cg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = cg;
          ctx.fillRect(cmx - cgR, cmy - cgR, cgR * 2, cgR * 2);
        }
      }

      // ── 5. Gold-filled seams ────────────────────────────────────
      for (const seg of s.cracks) {
        if (seg.fillProgress <= 0) continue;
        const sx = seg.x1 * minDim;
        const sy = seg.y1 * minDim;
        const ex = seg.x2 * minDim;
        const ey = seg.y2 * minDim;
        const fp = seg.fillProgress;

        // Interpolate fill endpoint
        const fx = sx + (ex - sx) * fp;
        const fy = sy + (ey - sy) * fp;

        // Gold thread line
        const goldShift = Math.sin(time * GOLD_SHIMMER_FREQ + seg.x1 * 10) * 0.5 + 0.5;
        const goldCol: RGB = [
          Math.min(255, GOLD_WARM[0] + goldShift * 35),
          Math.min(255, GOLD_WARM[1] + goldShift * 15),
          Math.max(0, GOLD_WARM[2] - goldShift * 20),
        ];
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(fx, fy);
        ctx.strokeStyle = rgba(goldCol, ALPHA.content.max * 0.28 * fp * entrance);
        ctx.lineWidth = px(STROKE.light, minDim) * 1.2;
        ctx.stroke();

        // Gold glow along seam
        const gmx = (sx + fx) / 2;
        const gmy = (sy + fy) / 2;
        const ggR = px(GOLD_GLOW_R * 1.5, minDim) * fp;
        const gg = ctx.createRadialGradient(gmx, gmy, 0, gmx, gmy, ggR);
        gg.addColorStop(0, rgba(goldCol, ALPHA.glow.max * 0.10 * fp * entrance));
        gg.addColorStop(0.5, rgba(goldCol, ALPHA.glow.max * 0.03 * fp * entrance));
        gg.addColorStop(1, rgba(goldCol, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(gmx - ggR, gmy - ggR, ggR * 2, ggR * 2);

        // Gold specular dots
        if (seg.filled) {
          for (let d = 0; d < GOLD_DOTS_PER_SEG; d++) {
            const df = (d + 1) / (GOLD_DOTS_PER_SEG + 1);
            const dx = sx + (ex - sx) * df;
            const dy = sy + (ey - sy) * df;
            const dotR = px(0.002, minDim);
            ctx.beginPath();
            ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = rgba([255, 255, 240] as RGB, ALPHA.content.max * 0.18 * entrance);
            ctx.fill();
          }
        }
      }

      // ── 6. Vessel specular ──────────────────────────────────────
      const vSpecR = vw * 0.22;
      const vSpecG = ctx.createRadialGradient(-vw * 0.3, -vh * 0.25, 0, -vw * 0.3, -vh * 0.25, vSpecR);
      vSpecG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.14 * entrance));
      vSpecG.addColorStop(0.4, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.04 * entrance));
      vSpecG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = vSpecG;
      ctx.beginPath();
      ctx.arc(-vw * 0.3, -vh * 0.25, vSpecR, 0, Math.PI * 2);
      ctx.fill();

      // Secondary reflection
      ctx.beginPath();
      ctx.ellipse(vw * 0.15, vh * 0.1, vw * 0.08, vh * 0.04, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.04 * entrance);
      ctx.fill();

      ctx.restore();

      // ── 7. Completion golden halo ───────────────────────────────
      if (s.completed) {
        for (let i = HALO_LAYERS - 1; i >= 0; i--) {
          const hR = px(0.18 + i * 0.08, minDim);
          const hA = ALPHA.glow.max * 0.05 * entrance / (i + 1);
          const hPhase = (time * 0.03 + i * 0.2) % 1;
          const hCol: RGB = [
            Math.min(255, GOLD_WARM[0] + Math.sin(hPhase * Math.PI * 2) * 20),
            GOLD_WARM[1],
            GOLD_WARM[2],
          ];
          const hg = ctx.createRadialGradient(cx, vCy, 0, cx, vCy, hR);
          hg.addColorStop(0, rgba(hCol, hA));
          hg.addColorStop(0.5, rgba(hCol, hA * 0.3));
          hg.addColorStop(1, rgba(hCol, 0));
          ctx.fillStyle = hg;
          ctx.fillRect(cx - hR, vCy - hR, hR * 2, hR * 2);
        }

        // Radiance rings
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.04 + i * 0.33) % 1;
          const rR = px(0.2 + rPhase * 0.15, minDim);
          ctx.beginPath();
          ctx.arc(cx, vCy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(GOLD_WARM, ALPHA.content.max * 0.03 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── 8. Fill progress indicator ──────────────────────────────
      if (!s.completed && s.filledCount > 0) {
        const progArc = filledFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, vCy, px(VESSEL_W * 0.55, minDim), -Math.PI / 2, -Math.PI / 2 + progArc);
        ctx.strokeStyle = rgba(GOLD_WARM, ALPHA.content.max * 0.10 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = () => { stateRef.current.dragging = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
