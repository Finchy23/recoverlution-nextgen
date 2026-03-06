/**
 * ATOM 627: THE SHAPE MEMORY ENGINE
 * ===================================
 * Series 63 — Elastic Yield · Position 7
 *
 * Prove compromise cannot erase your core. The hydraulic press crushes
 * the alloy into an ugly disk. Apply thermal warmth — the shape-memory
 * geometry remembers and unfolds to its flawless original state.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Original geometry rendered with zero-stress cool blue lattice
 *   - Crush phase: stress concentrates at compression zones (blue→red→white)
 *   - Flattened disk shows maximum stress (uniform hot red)
 *   - Thermal warmth: stress dissipates radially as geometry recovers
 *   - Recovery: stress field cools from center outward (red→green→blue)
 *   - Final state: pristine zero-stress geometry with specular highlights
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + thermal ambient gradient
 *   2. Stress field halo beneath geometry
 *   3. Shadow beneath geometry
 *   4. Geometry body with per-vertex stress coloring
 *   5. Internal lattice lines (stress-colored structural members)
 *   6. Hydraulic press with force indicators
 *   7. Thermal warmth overlay + spark particles
 *   8. Progress ring + completion bloom
 *
 * PHYSICS:
 *   - Geometry has 12 vertices defining a complex polyhedron
 *   - Crush deforms all vertices toward flat disk (scaleY → 0.2)
 *   - Hold to apply warmth; vertices lerp back to original positions
 *   - Per-vertex stress = deviation from rest position
 *   - Breath modulates warmth glow + geometry shimmer
 *
 * INTERACTION:
 *   Hold (apply warmth) → geometry recalls original shape
 *   (entrance_land, hold_start, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static pristine geometry with cool lattice
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, FONT_SIZE, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS TENSOR HELPER
// ═════════════════════════════════════════════════════════════════════

function stressHeat(s: number): RGB {
  if (s < 0.25) return lerpColor([50, 90, 200] as RGB, [60, 180, 130] as RGB, s / 0.25);
  if (s < 0.5) return lerpColor([60, 180, 130] as RGB, [220, 200, 50] as RGB, (s - 0.25) / 0.25);
  if (s < 0.75) return lerpColor([220, 200, 50] as RGB, [220, 80, 60] as RGB, (s - 0.5) / 0.25);
  return lerpColor([220, 80, 60] as RGB, [255, 240, 240] as RGB, (s - 0.75) / 0.25);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Geometry base radius (hero element) */
const GEO_R = SIZE.lg;
/** Vertex count for the complex polyhedron */
const VERTEX_COUNT = 12;
/** Lattice line pairs (internal structure) */
const LATTICE_PAIRS = 18;
/** Press width as fraction of minDim */
const PRESS_W_FRAC = 0.28;
/** Press bar height */
const PRESS_BAR_H = 0.025;
/** Crush speed (per frame) */
const CRUSH_SPEED = 0.004;
/** Crush flattening (scaleY minimum) */
const CRUSH_FLAT = 0.18;
/** Crush widening (scaleX maximum) */
const CRUSH_WIDE = 1.8;
/** Warmth recall speed (per frame) */
const RECALL_SPEED = 0.0035;
/** Thermal spark count */
const SPARK_COUNT = 25;
/** Spark lifetime */
const SPARK_LIFE = 40;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Respawn delay */
const RESPAWN_DELAY = 110;
/** Specular intensity */
const SPECULAR_K = 0.3;
/** Breath shimmer modulation */
const BREATH_SHIMMER = 0.12;
/** Bloom duration */
const BLOOM_DURATION = 55;
/** Auto-crush delay after entrance (frames) */
const CRUSH_START_DELAY = 45;
/** Stress field glow layers */
const FIELD_LAYERS = 3;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface Vertex {
  /** Rest angle (radians) */
  angle: number;
  /** Rest radius (fraction of GEO_R) */
  restR: number;
  /** Current deviation from rest (0 = at rest, 1 = fully crushed) */
  stress: number;
}

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  hue: number; // 0–1 maps to warm colors
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ShapeMemoryRecallAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  // Generate vertices with interesting asymmetric polygon
  const verticesRef = useRef<Vertex[]>(
    Array.from({ length: VERTEX_COUNT }, (_, i) => ({
      angle: (Math.PI * 2 * i) / VERTEX_COUNT + (Math.sin(i * 3.7) * 0.2),
      restR: 0.7 + 0.3 * Math.abs(Math.sin(i * 2.3 + 0.5)),
      stress: 0,
    }))
  );

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    // Phase flow
    crushPhase: false,
    crushProgress: 0,
    mangled: false,
    holding: false,
    recall: 0,
    completed: false,
    respawnTimer: 0,
    lastTier: 0,
    // Sparks
    sparks: [] as Spark[],
    // Bloom
    bloomT: -1,
    // Press Y offset (animated)
    pressY: 0,
    // Crush start timer
    crushDelay: CRUSH_START_DELAY,
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
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const verts = verticesRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude; s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const geoR = px(GEO_R, minDim);
      const pressW = minDim * PRESS_W_FRAC;
      const pressBarH = px(PRESS_BAR_H, minDim);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + thermal ambient
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Thermal ambient when holding
      if (s.holding && s.mangled) {
        const thermalGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
        const warmth = s.recall;
        thermalGrad.addColorStop(0, rgba([255, 180, 120] as RGB, ALPHA.glow.min * 0.06 * warmth * entrance));
        thermalGrad.addColorStop(0.5, rgba([255, 150, 80] as RGB, ALPHA.glow.min * 0.03 * warmth * entrance));
        thermalGrad.addColorStop(1, rgba([255, 150, 80] as RGB, 0));
        ctx.fillStyle = thermalGrad; ctx.fillRect(0, 0, w, h);
      }

      // ── Reduced motion ─────────────────────────────────
      if (p.reducedMotion) {
        // Static pristine geometry with cool lattice
        ctx.beginPath();
        for (let i = 0; i <= VERTEX_COUNT; i++) {
          const v = verts[i % VERTEX_COUNT];
          const vx = cx + Math.cos(v.angle) * v.restR * geoR;
          const vy = cy + Math.sin(v.angle) * v.restR * geoR;
          if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance); ctx.fill();
        ctx.strokeStyle = rgba(stressHeat(0.05), ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        // Lattice lines
        for (let i = 0; i < VERTEX_COUNT; i += 2) {
          const v = verts[i];
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(v.angle) * v.restR * geoR * 0.6, cy + Math.sin(v.angle) * v.restR * geoR * 0.6);
          ctx.strokeStyle = rgba(stressHeat(0.05), ALPHA.atmosphere.min * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        }
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Physics ─────────────────────────────────────────
      if (!s.completed) {
        // Auto-crush after delay
        if (!s.crushPhase && !s.mangled && s.crushDelay > 0) {
          s.crushDelay--;
          if (s.crushDelay <= 0) s.crushPhase = true;
        }

        // Crush animation
        if (s.crushPhase && !s.mangled) {
          s.crushProgress = Math.min(1, s.crushProgress + CRUSH_SPEED);
          s.pressY = s.crushProgress;
          // Update vertex stress during crush
          for (const v of verts) {
            v.stress = s.crushProgress;
          }
          if (s.crushProgress >= 1) {
            s.mangled = true;
            s.crushPhase = false;
            cb.onHaptic('entrance_land');
          }
        }

        // Thermal recall
        if (s.mangled && s.holding) {
          s.recall = Math.min(1, s.recall + RECALL_SPEED);
          // Stress decreases as geometry recalls
          for (const v of verts) {
            v.stress = Math.max(0, 1 - s.recall);
          }
          cb.onStateChange?.(s.recall);
          const tier = Math.floor(s.recall * 5);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

          // Spawn sparks
          if (s.frameCount % 3 === 0 && s.sparks.length < SPARK_COUNT) {
            const angle = Math.random() * Math.PI * 2;
            const dist = geoR * (0.3 + Math.random() * 0.5);
            s.sparks.push({
              x: cx + Math.cos(angle) * dist,
              y: cy + Math.sin(angle) * dist,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -(1 + Math.random() * 1.5),
              life: SPARK_LIFE,
              hue: 0.3 + Math.random() * 0.4,
            });
          }

          if (s.recall >= 0.98) {
            s.completed = true;
            s.bloomT = 0;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      // Spark physics
      for (const sp of s.sparks) {
        sp.x += sp.vx; sp.y += sp.vy;
        sp.vy -= 0.02; // float upward
        sp.life--;
      }
      s.sparks = s.sparks.filter(sp => sp.life > 0);

      // Bloom
      if (s.bloomT >= 0) {
        s.bloomT++;
        if (s.bloomT > BLOOM_DURATION) s.bloomT = -1;
      }

      // ── Compute deformation ─────────────────────────────
      const crush = s.crushPhase ? s.crushProgress : (s.mangled ? Math.max(0, 1 - s.recall) : 0);
      const scaleX = 1 + crush * (CRUSH_WIDE - 1);
      const scaleY = 1 - crush * (1 - CRUSH_FLAT);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Stress field halo
      // ════════════════════════════════════════════════════
      const avgStress = verts.reduce((a, v) => a + v.stress, 0) / verts.length;
      if (avgStress > 0.05) {
        for (let layer = 0; layer < FIELD_LAYERS; layer++) {
          const layerR = geoR * (1.3 + layer * 0.25);
          const layerAlpha = ALPHA.glow.max * 0.04 * avgStress * (1 - layer / FIELD_LAYERS) * entrance;
          const fieldGrad = ctx.createRadialGradient(cx, cy, geoR * 0.5, cx, cy, layerR);
          const fc = stressHeat(avgStress * 0.8);
          fieldGrad.addColorStop(0, rgba(fc, layerAlpha));
          fieldGrad.addColorStop(1, rgba(fc, 0));
          ctx.fillStyle = fieldGrad;
          ctx.fillRect(cx - layerR, cy - layerR, layerR * 2, layerR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Shadow beneath geometry
      // ════════════════════════════════════════════════════
      const shadowY = cy + geoR * scaleY * 0.6 + px(0.01, minDim);
      const shadowW = geoR * scaleX * 0.8;
      const shadowGrad = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowW);
      shadowGrad.addColorStop(0, rgba([0, 0, 0] as RGB, 0.03 * entrance));
      shadowGrad.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - shadowW, shadowY - shadowW * 0.3, shadowW * 2, shadowW * 0.6);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Geometry body with per-vertex stress
      // ════════════════════════════════════════════════════
      ctx.beginPath();
      for (let i = 0; i <= VERTEX_COUNT; i++) {
        const v = verts[i % VERTEX_COUNT];
        const r = v.restR * geoR;
        const shimmer = 1 + Math.sin(s.frameCount * 0.04 + v.angle * 3) * 0.01 * (1 - crush) * ms;
        const vx = cx + Math.cos(v.angle) * r * scaleX * shimmer;
        const vy = cy + Math.sin(v.angle) * r * scaleY * shimmer;
        if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
      }
      ctx.closePath();

      // Multi-stop gradient fill based on stress
      const geoGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, geoR * scaleX);
      const innerColor = stressHeat(avgStress * 0.3);
      const outerColor = stressHeat(avgStress);
      geoGrad.addColorStop(0, rgba(innerColor, ALPHA.content.max * 0.2 * entrance));
      geoGrad.addColorStop(0.6, rgba(lerpColor(innerColor, outerColor, 0.5), ALPHA.content.max * 0.15 * entrance));
      geoGrad.addColorStop(1, rgba(outerColor, ALPHA.content.max * 0.12 * entrance));
      ctx.fillStyle = geoGrad; ctx.fill();

      // Outline with stress color
      ctx.strokeStyle = rgba(stressHeat(avgStress), ALPHA.content.max * 0.35 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();

      // Specular highlight on geometry
      if (crush < 0.5) {
        const specX = cx - geoR * 0.2; const specY = cy - geoR * 0.25 * scaleY;
        const specR = geoR * 0.2 * (1 - crush);
        ctx.beginPath(); ctx.arc(specX, specY, specR, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.glow.max * SPECULAR_K * (1 - crush * 2) * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Internal lattice lines
      // ════════════════════════════════════════════════════
      const latticeAlpha = ALPHA.atmosphere.max * 0.25 * (0.3 + (1 - avgStress) * 0.7) * entrance;
      for (let i = 0; i < VERTEX_COUNT; i++) {
        // Lines from center to each vertex
        const v = verts[i];
        const r = v.restR * geoR * 0.7;
        const vx = cx + Math.cos(v.angle) * r * scaleX;
        const vy = cy + Math.sin(v.angle) * r * scaleY;
        const lineStress = v.stress;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(vx, vy);
        ctx.strokeStyle = rgba(stressHeat(lineStress * 0.6), latticeAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();

        // Cross-connections (every other vertex)
        if (i < VERTEX_COUNT - 2) {
          const v2 = verts[i + 2];
          const r2 = v2.restR * geoR * 0.55;
          const vx2 = cx + Math.cos(v2.angle) * r2 * scaleX;
          const vy2 = cy + Math.sin(v2.angle) * r2 * scaleY;
          ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx2, vy2);
          ctx.strokeStyle = rgba(stressHeat((lineStress + v2.stress) / 2 * 0.5), latticeAlpha * 0.5);
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        }
      }

      // Per-vertex stress dots
      for (let i = 0; i < VERTEX_COUNT; i++) {
        const v = verts[i];
        const r = v.restR * geoR;
        const vx = cx + Math.cos(v.angle) * r * scaleX;
        const vy = cy + Math.sin(v.angle) * r * scaleY;
        const dotR = px(0.004, minDim) * (1 + v.stress * 0.5);
        ctx.beginPath(); ctx.arc(vx, vy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(stressHeat(v.stress), ALPHA.content.max * 0.3 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Hydraulic press
      // ════════════════════════════════════════════════════
      if (s.crushPhase || (s.mangled && s.recall < 0.3)) {
        const pressAlpha = (s.crushPhase ? 1 : Math.max(0, 1 - s.recall * 3.3)) * entrance;
        const topPressY = cy - geoR * scaleY - pressBarH * (1 - s.crushProgress * 0.6);
        const botPressY = cy + geoR * scaleY + pressBarH * (1 - s.crushProgress * 0.6);

        // Top press bar
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * pressAlpha);
        ctx.fillRect(cx - pressW / 2, topPressY - pressBarH, pressW, pressBarH);
        // Bottom press bar
        ctx.fillRect(cx - pressW / 2, botPressY, pressW, pressBarH);

        // Force arrows on press
        if (s.crushPhase) {
          const arrowLen = px(0.015, minDim);
          // Top arrow pointing down
          ctx.beginPath();
          ctx.moveTo(cx, topPressY); ctx.lineTo(cx, topPressY + arrowLen);
          ctx.moveTo(cx, topPressY + arrowLen);
          ctx.lineTo(cx - px(0.005, minDim), topPressY + arrowLen - px(0.005, minDim));
          ctx.moveTo(cx, topPressY + arrowLen);
          ctx.lineTo(cx + px(0.005, minDim), topPressY + arrowLen - px(0.005, minDim));
          ctx.strokeStyle = rgba(stressHeat(s.crushProgress), ALPHA.content.max * 0.3 * pressAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Thermal warmth + sparks
      // ════════════════════════════════════════════════════
      if (s.holding && s.mangled && s.recall > 0) {
        // Warmth ring
        const warmR = geoR * (0.8 + s.recall * 0.4);
        const warmGrad = ctx.createRadialGradient(cx, cy, geoR * 0.3, cx, cy, warmR);
        warmGrad.addColorStop(0, rgba([255, 200, 130] as RGB, ALPHA.glow.max * 0.1 * s.recall * entrance * (1 + breath * BREATH_SHIMMER)));
        warmGrad.addColorStop(0.6, rgba([255, 160, 80] as RGB, ALPHA.glow.min * 0.05 * s.recall * entrance));
        warmGrad.addColorStop(1, rgba([255, 160, 80] as RGB, 0));
        ctx.fillStyle = warmGrad;
        ctx.fillRect(cx - warmR, cy - warmR, warmR * 2, warmR * 2);
      }

      // Sparks
      for (const sp of s.sparks) {
        const lifeAlpha = sp.life / SPARK_LIFE;
        const sparkColor = lerpColor([255, 220, 150] as RGB, [255, 140, 60] as RGB, sp.hue);
        ctx.beginPath(); ctx.arc(sp.x, sp.y, px(0.002, minDim) * lifeAlpha, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sparkColor, ALPHA.glow.max * 0.2 * lifeAlpha * entrance);
        ctx.fill();
      }

      // Completion bloom
      if (s.bloomT >= 0 && s.bloomT < BLOOM_DURATION) {
        const bf = s.bloomT / BLOOM_DURATION;
        const bR = geoR * (1 + bf * 1.5);
        const bAlpha = (1 - bf) * ALPHA.glow.max * 0.15 * entrance;
        const bGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bR);
        bGrad.addColorStop(0, rgba(s.primaryRgb, bAlpha));
        bGrad.addColorStop(0.4, rgba(stressHeat(0.05), bAlpha * 0.5));
        bGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bGrad;
        ctx.fillRect(cx - bR, cy - bR, bR * 2, bR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      if (s.recall > 0) {
        const ringR = px(PROGRESS_RING_R, minDim);
        const ringAngle = s.recall * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + ringAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();

        if (s.recall > 0.1) {
          const pct = Math.round(s.recall * 100);
          ctx.font = `${px(FONT_SIZE.xs, minDim)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.min * entrance);
          ctx.fillText(`${pct}%`, cx, cy + ringR + px(0.025, minDim));
        }
      }

      // ── Respawn ────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.crushPhase = false; s.crushProgress = 0; s.mangled = false;
          s.recall = 0; s.completed = false; s.lastTier = 0;
          s.sparks = []; s.bloomT = -1; s.pressY = 0;
          s.crushDelay = CRUSH_START_DELAY;
          for (const v of verts) v.stress = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.holding = true;
      canvas.setPointerCapture(e.pointerId);
      if (s.mangled) cbRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
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
