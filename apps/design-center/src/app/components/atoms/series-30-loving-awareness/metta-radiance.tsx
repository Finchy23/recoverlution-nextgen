/**
 * ATOM 292: THE METTA RADIANCE ENGINE
 * =====================================
 * Series 30 — Loving Awareness · Position 2
 *
 * Extend compassion in concentric rings — self, loved ones,
 * strangers, enemies, cosmos. Drag the light to the absolute edge.
 *
 * PHYSICS:
 *   - Five concentric ring zones, each representing a metta stage
 *   - Central warm glow starts small (self-compassion)
 *   - Drag outward to expand radiance through each zone
 *   - Each zone crossing triggers step_advance + sacred ring illumination
 *   - Ring surfaces shimmer with breath-coupled luminosity
 *   - Sacred geometry mandala pattern emerges within each activated ring
 *   - Volumetric light shafts radiate from center through activated rings
 *   - Specular highlights on ring edges (Fresnel glow)
 *   - 100+ radiant particles stream outward along expansion
 *   - Breath modulates glow warmth, particle speed, ring shimmer amplitude
 *   - At full extension, viewport becomes blinding light source
 *
 * INTERACTION:
 *   Drag (outward from center) → expand compassion rings
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static full-expansion radiance
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Five metta stages at these radii (fractions of minDim) */
const STAGE_RADII = [0.06, 0.14, 0.24, 0.36, 0.50];
/** Expansion rate when dragging outward */
const EXPAND_SPEED = 0.008;
/** Contraction rate when released */
const CONTRACT_SPEED = 0.002;
/** Central glow minimum radius */
const CORE_R_MIN = 0.04;
/** Central glow maximum radius at full expansion */
const CORE_R_MAX = 0.52;
/** Number of radiant particles streaming outward */
const PARTICLE_COUNT = 100;
/** Particle radial speed */
const PARTICLE_SPEED = 0.0018;
/** Particle spawn inner radius */
const PARTICLE_SPAWN_INNER = 0.02;
/** Breath modulation of glow warmth */
const BREATH_WARMTH = 0.07;
/** Breath modulation of particle speed */
const BREATH_PARTICLE = 0.05;
/** Breath modulation of ring shimmer */
const BREATH_SHIMMER = 0.04;
/** Ring thickness fraction */
const RING_THICKNESS = 0.003;
/** Ring glow spread */
const RING_GLOW_SPREAD = 0.028;
/** Number of glow layers for core */
const CORE_GLOW_LAYERS = 5;
/** Volumetric ray count from center */
const VOL_RAY_COUNT = 12;
/** Ray max length */
const VOL_RAY_LENGTH = 0.45;
/** Sacred geometry petal count per ring */
const RING_PETALS = 8;
/** Specular Fresnel edge highlight width */
const FRESNEL_WIDTH = 0.004;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Radiant particle streaming outward */
interface RadiantParticle {
  angle: number;
  dist: number;
  speed: number;
  size: number;
  phase: number;
  /** Orbit wobble for organic feel */
  wobble: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function MettaRadianceAtom({
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
    expansion: 0,
    targetExpansion: 0,
    dragging: false,
    dragStartDist: 0,
    dragStartExpansion: 0,
    highestStage: -1,
    stagesNotified: [false, false, false, false, false],
    completed: false,
    particles: Array.from({ length: PARTICLE_COUNT }, (): RadiantParticle => ({
      angle: Math.random() * Math.PI * 2,
      dist: PARTICLE_SPAWN_INNER + Math.random() * 0.08,
      speed: PARTICLE_SPEED * (0.5 + Math.random()),
      size: 0.0015 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
      wobble: (Math.random() - 0.5) * 0.001,
    })),
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
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const warmColor = lerpColor(s.primaryRgb, s.accentRgb, 0.2 + breath * BREATH_WARMTH);

      // ── Reduced motion ──────────────────────────────────────
      if (p.reducedMotion) {
        for (let i = STAGE_RADII.length - 1; i >= 0; i--) {
          const stageR = px(STAGE_RADII[i], minDim);
          const warmth = (i + 1) / STAGE_RADII.length;
          const stageColor = lerpColor(s.primaryRgb, s.accentRgb, warmth * 0.4);
          const sGlow = ctx.createRadialGradient(cx, cy, stageR * 0.8, cx, cy, stageR * 1.2);
          sGlow.addColorStop(0, rgba(stageColor, ALPHA.glow.max * 0.2 * entrance));
          sGlow.addColorStop(1, rgba(stageColor, 0));
          ctx.fillStyle = sGlow;
          ctx.fillRect(cx - stageR * 1.2, cy - stageR * 1.2, stageR * 2.4, stageR * 2.4);
          ctx.beginPath();
          ctx.arc(cx, cy, stageR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(stageColor, ALPHA.content.max * 0.3 * entrance);
          ctx.lineWidth = px(RING_THICKNESS, minDim);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, px(0.03, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.8 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (p.phase === 'resolve') { s.targetExpansion = 1; }

      s.expansion += (s.targetExpansion - s.expansion) * 0.055 * ms;
      if (!s.dragging && p.phase !== 'resolve') {
        s.targetExpansion = Math.max(0, s.targetExpansion - CONTRACT_SPEED * ms);
      }

      const exp = s.expansion;
      const currentRadius = CORE_R_MIN + exp * (CORE_R_MAX - CORE_R_MIN);
      const time = s.frameCount * 0.012;
      const breathParticle = 1 + breath * BREATH_PARTICLE;

      // ── Stage detection & haptics ─────────────────────────
      for (let i = 0; i < STAGE_RADII.length; i++) {
        const stageThreshold = STAGE_RADII[i] / CORE_R_MAX;
        if (exp >= stageThreshold && !s.stagesNotified[i]) {
          s.stagesNotified[i] = true;
          s.highestStage = i;
          cb.onHaptic('step_advance');
        }
      }

      if (exp >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(exp);

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 1: Volumetric light rays from center
      // ═════════════════════════════════════════════════════════════
      if (exp > 0.1) {
        for (let i = 0; i < VOL_RAY_COUNT; i++) {
          const rayAngle = (i / VOL_RAY_COUNT) * Math.PI * 2 + time * 0.025;
          const rayLen = px(VOL_RAY_LENGTH * exp * (0.5 + 0.5 * Math.sin(time * 0.5 + i * 0.9)), minDim);
          const rx1 = cx + Math.cos(rayAngle) * px(0.02, minDim);
          const ry1 = cy + Math.sin(rayAngle) * px(0.02, minDim);
          const rx2 = cx + Math.cos(rayAngle) * rayLen;
          const ry2 = cy + Math.sin(rayAngle) * rayLen;

          const rg = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
          const ra = ALPHA.glow.max * 0.07 * exp * entrance;
          rg.addColorStop(0, rgba(warmColor, ra));
          rg.addColorStop(0.2, rgba(warmColor, ra * 0.5));
          rg.addColorStop(0.5, rgba(warmColor, ra * 0.12));
          rg.addColorStop(1, rgba(warmColor, 0));
          ctx.beginPath();
          ctx.moveTo(rx1, ry1);
          ctx.lineTo(rx2, ry2);
          ctx.strokeStyle = rg;
          ctx.lineWidth = px(0.005 * exp, minDim);
          ctx.stroke();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 2: Stage rings with sacred geometry + Fresnel
      // ═════════════════════════════════════════════════════════════
      for (let i = STAGE_RADII.length - 1; i >= 0; i--) {
        const stageR = px(STAGE_RADII[i], minDim);
        const stageThreshold = STAGE_RADII[i] / CORE_R_MAX;
        const isActive = exp >= stageThreshold;
        const warmth = (i + 1) / STAGE_RADII.length;
        const stageColor = lerpColor(s.primaryRgb, s.accentRgb, warmth * 0.4);
        const shimmer = breath * BREATH_SHIMMER;

        // Ring glow (when active) — 3-stop radial
        if (isActive) {
          const glowR = px(RING_GLOW_SPREAD, minDim);
          const pulse = 0.6 + 0.4 * Math.sin(time + i * 1.2) + shimmer;
          const ringGlow = ctx.createRadialGradient(
            cx, cy, stageR - glowR, cx, cy, stageR + glowR,
          );
          ringGlow.addColorStop(0, rgba(stageColor, 0));
          ringGlow.addColorStop(0.45, rgba(stageColor, ALPHA.glow.max * 0.16 * pulse * entrance));
          ringGlow.addColorStop(1, rgba(stageColor, 0));
          ctx.fillStyle = ringGlow;
          ctx.beginPath();
          ctx.arc(cx, cy, stageR + glowR, 0, Math.PI * 2);
          ctx.fill();

          // Sacred geometry petals on active ring
          const petalAlpha = ALPHA.content.max * 0.08 * pulse * entrance;
          for (let j = 0; j < RING_PETALS; j++) {
            const pa = (j / RING_PETALS) * Math.PI * 2 + time * 0.03 * (i % 2 === 0 ? 1 : -1);
            const px1 = cx + Math.cos(pa) * (stageR * 0.85);
            const py1 = cy + Math.sin(pa) * (stageR * 0.85);
            const px2 = cx + Math.cos(pa) * (stageR * 1.12);
            const py2 = cy + Math.sin(pa) * (stageR * 1.12);
            ctx.beginPath();
            ctx.moveTo(px1, py1);
            ctx.lineTo(px2, py2);
            ctx.strokeStyle = rgba(stageColor, petalAlpha);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }

        // Ring line
        const ringAlpha = isActive
          ? ALPHA.content.max * 0.4 * entrance * (0.6 + 0.4 * Math.sin(time * 0.5 + i))
          : ALPHA.content.max * 0.07 * entrance;
        ctx.beginPath();
        ctx.arc(cx, cy, stageR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(stageColor, ringAlpha);
        ctx.lineWidth = px(isActive ? RING_THICKNESS * 1.5 : RING_THICKNESS * 0.5, minDim);
        ctx.stroke();

        // Fresnel edge highlight (active rings only)
        if (isActive) {
          ctx.beginPath();
          ctx.arc(cx, cy, stageR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(stageColor, ALPHA.content.max * 0.06 * (0.5 + 0.5 * Math.sin(time * 1.5 + i * 2)) * entrance);
          ctx.lineWidth = px(FRESNEL_WIDTH, minDim);
          ctx.stroke();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 3: Core radiance (5-stop gradient)
      // ═════════════════════════════════════════════════════════════
      const coreR = px(currentRadius, minDim);
      const breathPulse = 1 + breath * 0.04;

      for (let i = CORE_GLOW_LAYERS - 1; i >= 0; i--) {
        const layerR = coreR * breathPulse * (0.4 + i * 0.35);
        const layerAlpha = ALPHA.glow.max * (0.08 + exp * 0.32) * entrance / (i + 1);
        const coreColor = lerpColor(s.primaryRgb, s.accentRgb, exp * 0.3);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerR);
        cg.addColorStop(0, rgba(coreColor, layerAlpha));
        cg.addColorStop(0.15, rgba(coreColor, layerAlpha * 0.7));
        cg.addColorStop(0.35, rgba(coreColor, layerAlpha * 0.3));
        cg.addColorStop(0.65, rgba(coreColor, layerAlpha * 0.08));
        cg.addColorStop(1, rgba(coreColor, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - layerR, cy - layerR, layerR * 2, layerR * 2);
      }

      // Core solid with specular
      const coreInnerR = px(CORE_R_MIN * 0.8, minDim) * breathPulse;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreInnerR);
      coreGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * (0.65 + exp * 0.3) * entrance));
      coreGrad.addColorStop(0.6, rgba(warmColor, ALPHA.content.max * (0.3 + exp * 0.2) * entrance));
      coreGrad.addColorStop(1, rgba(warmColor, 0));
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreInnerR, 0, Math.PI * 2);
      ctx.fill();

      // Specular on core
      const specR = coreInnerR * 0.35;
      const specG = ctx.createRadialGradient(cx - specR * 0.5, cy - specR * 0.6, 0, cx - specR * 0.5, cy - specR * 0.6, specR);
      specG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance));
      specG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = specG;
      ctx.fillRect(cx - specR * 1.5, cy - specR * 1.6, specR * 2, specR * 2);

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 4: Radiant particles
      // ═════════════════════════════════════════════════════════════
      for (const pt of s.particles) {
        pt.dist += pt.speed * ms * (0.4 + exp * 0.8) * breathParticle;
        pt.angle += pt.wobble * ms;
        if (pt.dist > CORE_R_MAX + 0.1) {
          pt.dist = PARTICLE_SPAWN_INNER;
          pt.angle = Math.random() * Math.PI * 2;
        }

        if (pt.dist > currentRadius * 1.1) continue;

        const ptX = cx + Math.cos(pt.angle) * px(pt.dist, minDim);
        const ptY = cy + Math.sin(pt.angle) * px(pt.dist, minDim);
        const ptR = px(pt.size, minDim);
        const distRatio = pt.dist / currentRadius;
        const ptAlpha = ALPHA.content.max * 0.35 * (1 - distRatio) * exp * entrance;
        const pulse = 0.5 + 0.5 * Math.sin(time * 2 + pt.phase);

        // Particle glow
        const ptGlow = ctx.createRadialGradient(ptX, ptY, 0, ptX, ptY, ptR * 3);
        ptGlow.addColorStop(0, rgba(warmColor, ptAlpha * pulse));
        ptGlow.addColorStop(0.5, rgba(warmColor, ptAlpha * pulse * 0.2));
        ptGlow.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = ptGlow;
        ctx.fillRect(ptX - ptR * 3, ptY - ptR * 3, ptR * 6, ptR * 6);

        ctx.beginPath();
        ctx.arc(ptX, ptY, ptR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmColor, ptAlpha * pulse * 0.8);
        ctx.fill();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 5: Expansion edge shimmer
      // ═════════════════════════════════════════════════════════════
      if (exp > 0.05) {
        const edgeR = px(currentRadius, minDim);
        const shimmer = 0.4 + 0.6 * Math.sin(time * 3);
        ctx.beginPath();
        ctx.arc(cx, cy, edgeR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(warmColor, ALPHA.content.max * 0.12 * shimmer * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      s.dragStartDist = Math.sqrt(mx * mx + my * my);
      s.dragStartExpansion = s.targetExpansion;
      s.dragging = true;
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const currentDist = Math.sqrt(mx * mx + my * my);
      const delta = (currentDist - s.dragStartDist) * 3;
      s.targetExpansion = Math.max(0, Math.min(1, s.dragStartExpansion + delta));
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
