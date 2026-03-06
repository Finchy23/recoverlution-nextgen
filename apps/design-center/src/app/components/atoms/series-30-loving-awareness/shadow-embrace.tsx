/**
 * ATOM 291: THE SHADOW EMBRACE ENGINE
 * =====================================
 * Series 30 — Loving Awareness · Position 1
 *
 * The ego wars with darkness. Drag the shadow into your center —
 * it does not destroy; it expands your light by 200%.
 *
 * PHYSICS:
 *   - A luminous light-self pulses at center (SIZE.lg radius)
 *   - A dark mirror shadow-self orbits at distance, slightly trembling
 *   - Magnetic resistance opposes the merge — the closer, the stronger
 *   - As shadow approaches, dark tendrils reach out in fear
 *   - At merge threshold, resistance inverts to sudden attraction
 *   - Merged state: light explodes to 200%, shadow color-inverts to gold
 *   - Sparks cascade outward at the moment of integration
 *   - error_boundary haptic fires if user retreats after partial merge
 *
 * INTERACTION:
 *   Drag shadow toward center → magnetic resistance → snap merge
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static merged state — light and shadow overlapping, golden glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Light-self resting radius (hero size) */
const LIGHT_R_FRAC = SIZE.lg;                    // 0.32
/** Shadow-self radius — slightly smaller mirror */
const SHADOW_R_FRAC = 0.26;
/** Shadow starting distance from center (fraction of minDim) */
const SHADOW_ORBIT_DIST = 0.38;
/** Shadow tremor amplitude */
const TREMOR_AMP = 0.006;
/** Magnetic resistance force constant */
const RESIST_K = 0.0015;
/** Snap-merge threshold (distance fraction of minDim) */
const MERGE_SNAP_DIST = 0.08;
/** Merge progress rate once snapped */
const MERGE_RATE = 0.025;
/** Merge retreat rate when user pulls away */
const MERGE_DECAY = 0.004;
/** Light expansion factor at full merge (200% = 2.0) */
const EXPANSION_FACTOR = 2.0;
/** Retreat threshold that triggers error_boundary haptic */
const RETREAT_THRESHOLD = 0.35;
/** Number of integration sparks */
const SPARK_COUNT = 24;
/** Spark speed range */
const SPARK_SPEED_MIN = 0.004;
const SPARK_SPEED_MAX = 0.012;
/** Spark lifetime in frames */
const SPARK_LIFE = 60;
/** Tendril count during resistance phase */
const TENDRIL_COUNT = 8;
/** Tendril max length (fraction of minDim) */
const TENDRIL_LEN = 0.15;
/** Breath influence on light pulse */
const BREATH_PULSE = 0.06;
/** Glow layers for depth */
const GLOW_LAYERS = 4;
/** Progress at which step_advance fires */
const STEP_HAPTIC_AT = 0.5;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  hue: number; // 0 = primary, 1 = accent blend
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ShadowEmbraceAtom({
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
    // Shadow position (normalized 0–1)
    shadowX: 0.5 - SHADOW_ORBIT_DIST * 0.8,
    shadowY: 0.5,
    // Dragging
    dragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    // Merge state
    mergeProgress: 0,        // 0–1: how merged light and shadow are
    peakMerge: 0,            // highest merge ever reached
    merged: false,
    // Sparks
    sparks: [] as Spark[],
    // Haptic guards
    stepNotified: false,
    retreatNotified: false,
    completionNotified: false,
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

    // ── Render loop ────────────────────────────────────────────
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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ── Reduced motion: static merged state ───────────────
      if (p.reducedMotion) {
        const mergedR = px(LIGHT_R_FRAC * EXPANSION_FACTOR * 0.5, minDim);
        const blendRgb = lerpColor(s.primaryRgb, s.accentRgb, 0.3);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = mergedR * (1.2 + i * 0.8);
          const gA = ALPHA.glow.max * 0.25 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(blendRgb, gA));
          gg.addColorStop(1, rgba(blendRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath();
        ctx.arc(cx, cy, mergedR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(blendRgb, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Auto-resolve ──────────────────────────────────────
      if (p.phase === 'resolve' && !s.merged) {
        s.shadowX += (0.5 - s.shadowX) * 0.05;
        s.shadowY += (0.5 - s.shadowY) * 0.05;
      }

      // ── Distance & merge physics ──────────────────────────
      const dx = s.shadowX - 0.5;
      const dy = s.shadowY - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MERGE_SNAP_DIST && !s.merged) {
        s.mergeProgress = Math.min(1, s.mergeProgress + MERGE_RATE * ms);
      } else if (!s.merged) {
        s.mergeProgress = Math.max(0, s.mergeProgress - MERGE_DECAY * ms);
      }

      // Track peak for retreat detection
      if (s.mergeProgress > s.peakMerge) {
        s.peakMerge = s.mergeProgress;
      }

      // Retreat haptic
      if (s.peakMerge > RETREAT_THRESHOLD && s.mergeProgress < s.peakMerge * 0.5 && !s.retreatNotified && !s.merged) {
        s.retreatNotified = true;
        cb.onHaptic('error_boundary');
      }
      if (s.mergeProgress > RETREAT_THRESHOLD) {
        s.retreatNotified = false; // reset for next retreat
      }

      // Step haptic
      if (s.mergeProgress >= STEP_HAPTIC_AT && !s.stepNotified && !s.merged) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      // Completion
      if (s.mergeProgress >= 0.95 && !s.merged) {
        s.merged = true;
        s.mergeProgress = 1;
        s.completionNotified = true;
        cb.onHaptic('completion');
        // Spawn sparks
        for (let i = 0; i < SPARK_COUNT; i++) {
          const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.3;
          const speed = SPARK_SPEED_MIN + Math.random() * (SPARK_SPEED_MAX - SPARK_SPEED_MIN);
          s.sparks.push({
            x: 0.5, y: 0.5,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: SPARK_LIFE,
            maxLife: SPARK_LIFE,
            hue: Math.random(),
          });
        }
      }

      cb.onStateChange?.(s.mergeProgress);

      // ── Eased merge for rendering ─────────────────────────
      const easedMerge = easeOutExpo(s.mergeProgress);
      const time = s.frameCount * 0.015;

      // ── 1. Shadow tendrils (fear/resistance) ──────────────
      if (easedMerge < 0.8 && dist < SHADOW_ORBIT_DIST * 0.7) {
        const tendrilAlpha = ALPHA.content.max * 0.15 * (1 - easedMerge) * entrance;
        const shadowPx = s.shadowX * w;
        const shadowPy = s.shadowY * h;

        for (let i = 0; i < TENDRIL_COUNT; i++) {
          const baseAngle = (i / TENDRIL_COUNT) * Math.PI * 2;
          const waveAngle = baseAngle + Math.sin(time * 1.5 + i * 0.7) * 0.4;
          const len = px(TENDRIL_LEN * (0.3 + 0.7 * (1 - dist / SHADOW_ORBIT_DIST)), minDim);
          const segments = 8;

          ctx.beginPath();
          ctx.moveTo(shadowPx, shadowPy);
          for (let seg = 1; seg <= segments; seg++) {
            const t = seg / segments;
            const segAngle = waveAngle + Math.sin(time * 2 + i + seg * 0.5) * 0.3 * t;
            const segLen = len * t;
            ctx.lineTo(
              shadowPx + Math.cos(segAngle) * segLen,
              shadowPy + Math.sin(segAngle) * segLen
            );
          }
          ctx.strokeStyle = rgba(s.accentRgb, tendrilAlpha * (1 - dist / (SHADOW_ORBIT_DIST * 0.7)));
          ctx.lineWidth = px(0.002 * (1 - easedMerge), minDim);
          ctx.stroke();
        }
      }

      // ── 2. Light-self glow (center) ───────────────────────
      const lightExpansion = 1 + easedMerge * (EXPANSION_FACTOR - 1);
      const lightR = px(LIGHT_R_FRAC * 0.5 * lightExpansion, minDim);
      const lightPulse = 1 + breath * BREATH_PULSE;
      const lightEffectiveR = lightR * lightPulse;

      // Multi-layer glow
      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const layerR = lightEffectiveR * (1.5 + i * 1.2);
        const layerAlpha = ALPHA.glow.max * (0.15 + easedMerge * 0.25) * entrance / (i + 1);
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerR);
        const glowColor = lerpColor(s.primaryRgb, s.accentRgb, easedMerge * 0.3);
        glowGrad.addColorStop(0, rgba(glowColor, layerAlpha));
        glowGrad.addColorStop(0.4, rgba(glowColor, layerAlpha * 0.4));
        glowGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(cx - layerR, cy - layerR, layerR * 2, layerR * 2);
      }

      // Light core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lightEffectiveR * 0.6);
      coreGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * (0.6 + easedMerge * 0.3) * entrance));
      coreGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance));
      coreGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, lightEffectiveR * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright point
      const innerR = px(0.025, minDim) * lightPulse;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.9 * entrance);
      ctx.fill();

      // ── 3. Shadow-self ────────────────────────────────────
      if (!s.merged) {
        // Shadow tremor
        const tremX = Math.sin(time * 3.7) * TREMOR_AMP;
        const tremY = Math.cos(time * 4.3) * TREMOR_AMP;
        const sx = (s.shadowX + tremX) * w;
        const sy = (s.shadowY + tremY) * h;
        const shadowR = px(SHADOW_R_FRAC * 0.5, minDim) * (1 - easedMerge * 0.5);

        // Shadow darkness layers
        for (let i = 2; i >= 0; i--) {
          const sLayerR = shadowR * (1.3 + i * 0.8);
          const sAlpha = ALPHA.glow.max * 0.2 * (1 - easedMerge * 0.8) * entrance / (i + 1);
          const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sLayerR);
          sGrad.addColorStop(0, rgba(s.accentRgb, sAlpha));
          sGrad.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = sGrad;
          ctx.fillRect(sx - sLayerR, sy - sLayerR, sLayerR * 2, sLayerR * 2);
        }

        // Shadow core — inverts toward primary as merge increases
        const shadowBlend = lerpColor(s.accentRgb, s.primaryRgb, easedMerge * 0.6);
        ctx.beginPath();
        ctx.arc(sx, sy, shadowR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(shadowBlend, ALPHA.content.max * (0.5 - easedMerge * 0.2) * entrance);
        ctx.fill();

        // Resistance field — visible magnetic repulsion lines
        if (dist < SHADOW_ORBIT_DIST * 0.5 && easedMerge < 0.6) {
          const resistAlpha = ALPHA.content.max * 0.1 * (1 - easedMerge / 0.6) * entrance;
          const midX = (cx + sx) / 2;
          const midY = (cy + sy) / 2;
          const resistR = px(0.03, minDim);

          for (let i = 0; i < 5; i++) {
            const rAngle = (i / 5) * Math.PI * 2 + time * 0.8;
            const rx = midX + Math.cos(rAngle) * resistR;
            const ry = midY + Math.sin(rAngle) * resistR;
            ctx.beginPath();
            ctx.arc(rx, ry, px(0.004, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, resistAlpha * (0.5 + 0.5 * Math.sin(time * 3 + i)));
            ctx.fill();
          }
        }

        // Merge bridge — connecting thread when close
        if (dist < MERGE_SNAP_DIST * 2 && easedMerge > 0.1) {
          const bridgeAlpha = ALPHA.content.max * 0.3 * easedMerge * entrance;
          const bridgeGrad = ctx.createLinearGradient(cx, cy, sx, sy);
          bridgeGrad.addColorStop(0, rgba(s.primaryRgb, bridgeAlpha));
          bridgeGrad.addColorStop(0.5, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), bridgeAlpha * 0.6));
          bridgeGrad.addColorStop(1, rgba(s.accentRgb, bridgeAlpha));
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = bridgeGrad;
          ctx.lineWidth = px(0.004 * easedMerge, minDim);
          ctx.stroke();
        }
      }

      // ── 4. Integration sparks ─────────────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.life -= ms;
        sp.vy += 0.00003; // gentle gravity

        if (sp.life <= 0) {
          s.sparks.splice(i, 1);
          continue;
        }

        const lifeRatio = sp.life / sp.maxLife;
        const sparkAlpha = ALPHA.content.max * lifeRatio * 0.8 * entrance;
        const sparkR = px(0.005 * lifeRatio, minDim);
        const sparkColor = lerpColor(s.primaryRgb, s.accentRgb, sp.hue);
        const spx = sp.x * w;
        const spy = sp.y * h;

        // Spark glow
        const sparkGlowR = sparkR * 3;
        const sGlow = ctx.createRadialGradient(spx, spy, 0, spx, spy, sparkGlowR);
        sGlow.addColorStop(0, rgba(sparkColor, sparkAlpha * 0.5));
        sGlow.addColorStop(1, rgba(sparkColor, 0));
        ctx.fillStyle = sGlow;
        ctx.fillRect(spx - sparkGlowR, spy - sparkGlowR, sparkGlowR * 2, sparkGlowR * 2);

        // Spark core
        ctx.beginPath();
        ctx.arc(spx, spy, sparkR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sparkColor, sparkAlpha);
        ctx.fill();
      }

      // ── 5. Post-merge radiance rings ──────────────────────
      if (s.merged) {
        const rTime = (s.frameCount - SPARK_LIFE) * 0.008;
        if (rTime > 0) {
          for (let i = 0; i < 3; i++) {
            const ringProgress = (rTime * 0.3 + i * 0.33) % 1;
            const ringR = px(LIGHT_R_FRAC * 0.5 * EXPANSION_FACTOR * (0.5 + ringProgress * 1.5), minDim);
            const ringAlpha = ALPHA.content.max * 0.12 * (1 - ringProgress) * entrance;
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.3), ringAlpha);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
      }

      // ── 6. Progress ring ──────────────────────────────────
      if (!s.merged && s.mergeProgress > 0.01) {
        const progR = px(SIZE.xs, minDim);
        const progAngle = s.mergeProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy - lightEffectiveR * 0.8, progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.merged) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const dx = mx - s.shadowX;
      const dy = my - s.shadowY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Hit test against shadow
      if (dist < SHADOW_R_FRAC * 0.6) {
        s.dragging = true;
        s.dragOffsetX = dx;
        s.dragOffsetY = dy;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Apply magnetic resistance toward center
      let targetX = mx - s.dragOffsetX;
      let targetY = my - s.dragOffsetY;

      const dx = targetX - 0.5;
      const dy = targetY - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Resistance force increases near center (before snap threshold)
      if (dist > MERGE_SNAP_DIST && dist < SHADOW_ORBIT_DIST * 0.5) {
        const resistFactor = 1 - (dist - MERGE_SNAP_DIST) / (SHADOW_ORBIT_DIST * 0.5 - MERGE_SNAP_DIST);
        const resistForce = RESIST_K * resistFactor * resistFactor;
        targetX += dx * resistForce;
        targetY += dy * resistForce;
      }

      s.shadowX = Math.max(0.05, Math.min(0.95, targetX));
      s.shadowY = Math.max(0.05, Math.min(0.95, targetY));
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
