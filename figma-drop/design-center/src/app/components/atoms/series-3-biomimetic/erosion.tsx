/**
 * ATOM 030: THE EROSION ENGINE
 * ===============================
 * Series 3 — Biomimetic Algorithms · Position 10
 *
 * Calming the frantic desire for instant transformation. Nature
 * does not use hammers to shape canyons; it uses water and time.
 *
 * A harsh, jagged rock dominates the center. Hold your finger
 * to apply a steady stream of water. Over sustained holding,
 * the rigid geometry procedurally smooths — edges round, texture
 * softens, roughness decreases. The harsh angular shard becomes
 * a perfectly smooth, beautiful river stone. The haptic signature
 * transitions from rough abrasive scratch to polished glide.
 *
 * PHYSICS:
 *   - Procedural rock: polygon vertices with roughness offsets
 *   - Hold = water pressure: roughness coefficient decreases
 *   - Water stream particles from hold point flowing over surface
 *   - Vertex smoothing algorithm (Laplacian-like, iterative)
 *   - Color transition: dark harsh grey → warm smooth stone
 *   - Water pooling at base, gentle ripples
 *   - Roughness 0 = completion (river stone achieved)
 *
 * HAPTIC JOURNEY:
 *   Hold start    → hold_start (abrasive scratch begins)
 *   25% smoothed  → hold_threshold (texture shifts)
 *   Full smooth   → completion (polished glide)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Faster smoothing, no water particles
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of vertices defining the rock shape */
const VERTEX_COUNT = 24;
/** Max roughness offset as fraction of base radius */
const MAX_ROUGHNESS = 0.4;
/** Smoothing rate per frame while holding */
const SMOOTH_RATE = 0.0015;
/** Water particle count */
const WATER_PARTICLE_COUNT = 40;
/** Base rock radius as fraction of min dimension */
const ROCK_RADIUS_FRAC = 0.18;
/** Hold threshold (fraction of smoothing) */
const HOLD_THRESHOLD_FRAC = 0.25;
/** Water stream speed */
const WATER_SPEED = 2;

// =====================================================================
// DATA STRUCTURES
// =====================================================================

interface RockVertex {
  /** Base angle (fixed) */
  angle: number;
  /** Base radius (fixed) */
  baseR: number;
  /** Current roughness offset (positive = outward jag) */
  roughness: number;
  /** Original roughness (for tracking progress) */
  originalRoughness: number;
}

interface WaterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface PoolRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const ROCK_HARSH: RGB = [55, 50, 45];         // Rough dark stone
const ROCK_MID: RGB = [100, 90, 80];          // Mid-erosion
const ROCK_SMOOTH: RGB = [140, 130, 115];     // Polished river stone
const ROCK_HIGHLIGHT: RGB = [170, 160, 145];  // Wet stone highlight
const WATER_BLUE: RGB = [100, 150, 200];      // Stream
const WATER_FOAM: RGB = [180, 210, 230];      // Splash
const POOL_COLOR: RGB = [80, 120, 170];       // Pool at base
const CANYON_BG: RGB = [12, 10, 8];           // Deep canyon

// =====================================================================
// GENERATION
// =====================================================================

function createRockVertices(baseRadius: number): RockVertex[] {
  const vertices: RockVertex[] = [];
  for (let i = 0; i < VERTEX_COUNT; i++) {
    const angle = (i / VERTEX_COUNT) * Math.PI * 2;
    const roughness = (Math.random() * 0.8 + 0.2) * MAX_ROUGHNESS * baseRadius;
    // Make jagged: alternating high/low
    const jag = i % 2 === 0 ? 1 : 0.5 + Math.random() * 0.5;
    vertices.push({
      angle,
      baseR: baseRadius * (0.85 + Math.random() * 0.15),
      roughness: roughness * jag,
      originalRoughness: roughness * jag,
    });
  }
  return vertices;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ErosionAtom({
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
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    vertices: [] as RockVertex[],
    waterParticles: [] as WaterParticle[],
    poolRipples: [] as PoolRipple[],
    // Hold
    isHolding: false,
    holdX: 0,
    holdY: 0,
    holdDuration: 0,
    holdStartFired: false,
    holdThresholdFired: false,
    // Smoothing
    smoothProgress: 0, // 0 = raw, 1 = polished
    resolved: false,
    // Pool level
    poolLevel: 0,
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
    baseRadius: 0,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isHolding = true;
      s.holdX = (e.clientX - rect.left) / rect.width * w;
      s.holdY = (e.clientY - rect.top) / rect.height * h;
      s.holdDuration = 0;
      s.holdStartFired = false;
      cbRef.current.onHaptic('hold_start');
      s.holdStartFired = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (s.isHolding) {
        s.holdX = (e.clientX - rect.left) / rect.width * w;
        s.holdY = (e.clientY - rect.top) / rect.height * h;
      }
    };
    const onUp = (e: PointerEvent) => {
      s.isHolding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.baseRadius = minDim * ROCK_RADIUS_FRAC;
      s.vertices = createRockVertices(s.baseRadius);
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

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

      // ── Smoothing (when holding) ──────────────────────
      if (s.isHolding && s.smoothProgress < 1) {
        s.holdDuration++;
        const rate = p.reducedMotion ? SMOOTH_RATE * 4 : SMOOTH_RATE;

        for (const v of s.vertices) {
          v.roughness = Math.max(0, v.roughness - v.originalRoughness * rate);
        }

        // Calculate overall smooth progress
        let totalRough = 0;
        let totalOriginal = 0;
        for (const v of s.vertices) {
          totalRough += v.roughness;
          totalOriginal += v.originalRoughness;
        }
        s.smoothProgress = totalOriginal > 0 ? 1 - (totalRough / totalOriginal) : 1;

        // Threshold haptic
        if (s.smoothProgress >= HOLD_THRESHOLD_FRAC && !s.holdThresholdFired) {
          s.holdThresholdFired = true;
          cb.onHaptic('hold_threshold');
        }

        // Completion
        if (s.smoothProgress >= 0.98 && !s.resolved) {
          s.resolved = true;
          s.smoothProgress = 1;
          for (const v of s.vertices) v.roughness = 0;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }

        // Emit water particles
        if (!p.reducedMotion && s.waterParticles.length < WATER_PARTICLE_COUNT) {
          const angle = Math.atan2(s.holdY - h * 0.42, s.holdX - w / 2);
          for (let i = 0; i < 2; i++) {
            const spread = (Math.random() - 0.5) * 0.5;
            s.waterParticles.push({
              x: s.holdX,
              y: s.holdY,
              vx: Math.cos(angle + spread) * WATER_SPEED * (0.7 + Math.random() * 0.6),
              vy: Math.sin(angle + spread) * WATER_SPEED * (0.7 + Math.random() * 0.6),
              life: 40 + Math.random() * 30,
              maxLife: 40 + Math.random() * 30,
              size: minDim * (0.002 + Math.random() * 0.004),
            });
          }
        }

        // Pool level rises
        s.poolLevel = Math.min(1, s.poolLevel + 0.0003);
      }

      // ── Water particle physics ────────────────────────
      for (let i = s.waterParticles.length - 1; i >= 0; i--) {
        const wp = s.waterParticles[i];
        wp.x += wp.vx;
        wp.y += wp.vy;
        wp.vy += 0.05; // gravity
        wp.life--;
        if (wp.life <= 0) {
          // Splash ripple
          if (wp.y > h * 0.42 + s.baseRadius * 0.8) {
            s.poolRipples.push({
              x: wp.x,
              y: wp.y,
              radius: 0,
              maxRadius: minDim * (0.01 + Math.random() * 0.02),
              alpha: 0.08,
            });
          }
          s.waterParticles.splice(i, 1);
        }
      }

      // Ripple expansion
      for (let i = s.poolRipples.length - 1; i >= 0; i--) {
        const rip = s.poolRipples[i];
        rip.radius += 0.3;
        rip.alpha -= 0.001;
        if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
          s.poolRipples.splice(i, 1);
        }
      }

      cb.onStateChange?.(s.smoothProgress);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // Background — deep canyon
      const bgBase = lerpColor(CANYON_BG, s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Canyon atmospheric gradient
      const canyonGrad = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, minDim * 0.4);
      canyonGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [15, 13, 10], 0.85), 0.03 * entrance));
      canyonGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = canyonGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Pool at base ──────────────────────────────────
      if (s.poolLevel > 0.01) {
        const poolY = h * 0.42 + s.baseRadius * 1.1;
        const poolH = minDim * 0.05 * s.poolLevel;
        const poolColor = lerpColor(POOL_COLOR, s.primaryRgb, 0.1);
        const poolGrad = ctx.createLinearGradient(0, poolY, 0, poolY + poolH);
        poolGrad.addColorStop(0, rgba(poolColor, 0.08 * entrance * s.poolLevel));
        poolGrad.addColorStop(0.5, rgba(poolColor, 0.04 * entrance * s.poolLevel));
        poolGrad.addColorStop(1, rgba(poolColor, 0));
        ctx.fillStyle = poolGrad;
        ctx.fillRect(w / 2 - s.baseRadius * 2, poolY, s.baseRadius * 4, poolH);

        // Ripples
        for (const rip of s.poolRipples) {
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(lerpColor(WATER_FOAM, s.accentRgb, 0.1), rip.alpha * entrance);
          ctx.lineWidth = minDim * 0.001;
          ctx.stroke();
        }
      }

      // ── Rock ──────────────────────────────────────────
      const rockColor = lerpColor(
        lerpColor(ROCK_HARSH, s.primaryRgb, 0.06),
        lerpColor(ROCK_SMOOTH, s.accentRgb, 0.06),
        s.smoothProgress,
      );
      const rockAlpha = 0.45 * entrance;

      // Rock shadow
      const shadowGrad = ctx.createRadialGradient(
        w / 2, h * 0.42 + s.baseRadius * 0.8, s.baseRadius * 0.2,
        w / 2, h * 0.42 + s.baseRadius * 1.2, s.baseRadius * 1.5,
      );
      shadowGrad.addColorStop(0, rgba(lerpColor([0, 0, 0], s.primaryRgb, 0.02), 0.06 * entrance));
      shadowGrad.addColorStop(1, rgba([0, 0, 0], 0));
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(w / 2 - s.baseRadius * 2, h * 0.42, s.baseRadius * 4, s.baseRadius * 2);

      // Rock body — polygon from vertices
      ctx.beginPath();
      for (let i = 0; i <= s.vertices.length; i++) {
        const v = s.vertices[i % s.vertices.length];
        const r = v.baseR + v.roughness;
        const px = w / 2 + Math.cos(v.angle) * r;
        const py = h * 0.42 + Math.sin(v.angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Rock fill with radial gradient for dimensionality
      const rockGrad = ctx.createRadialGradient(
        w / 2 - s.baseRadius * 0.15, h * 0.42 - s.baseRadius * 0.15, s.baseRadius * 0.1,
        w / 2, h * 0.42, s.baseRadius * 1.2,
      );
      rockGrad.addColorStop(0, rgba(
        lerpColor(rockColor, ROCK_HIGHLIGHT, 0.2 + s.smoothProgress * 0.3),
        rockAlpha,
      ));
      rockGrad.addColorStop(0.4, rgba(rockColor, rockAlpha));
      rockGrad.addColorStop(1, rgba(
        lerpColor(rockColor, [40, 35, 30], 0.3),
        rockAlpha * 0.7,
      ));
      ctx.fillStyle = rockGrad;
      ctx.fill();

      // Rock edge
      ctx.strokeStyle = rgba(
        lerpColor(rockColor, [200, 190, 170], s.smoothProgress * 0.2),
        rockAlpha * 0.3,
      );
      ctx.lineWidth = minDim * (0.001 + s.smoothProgress * 0.001);
      ctx.stroke();

      // Wet highlight (when water is flowing)
      if (s.isHolding && s.smoothProgress > 0.1) {
        const wetAlpha = 0.04 * s.smoothProgress * entrance;
        const wetColor = lerpColor(WATER_BLUE, s.accentRgb, 0.1);
        const wetGrad = ctx.createRadialGradient(
          w / 2 - s.baseRadius * 0.2, h * 0.42 - s.baseRadius * 0.2, 0,
          w / 2, h * 0.42, s.baseRadius,
        );
        wetGrad.addColorStop(0, rgba(wetColor, wetAlpha));
        wetGrad.addColorStop(0.5, rgba(wetColor, wetAlpha * 0.3));
        wetGrad.addColorStop(1, rgba(wetColor, 0));
        ctx.fillStyle = wetGrad;
        ctx.fill();
      }

      // Polished specular (high smoothness only)
      if (s.smoothProgress > 0.7) {
        const specAlpha = (s.smoothProgress - 0.7) * 0.12 * entrance;
        ctx.beginPath();
        ctx.ellipse(w / 2 - s.baseRadius * 0.18, h * 0.42 - s.baseRadius * 0.18, s.baseRadius * 0.15, s.baseRadius * 0.08, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255], specAlpha);
        ctx.fill();
      }

      // ── Water stream particles ────────────────────────
      for (const wp of s.waterParticles) {
        const lifeFrac = wp.life / wp.maxLife;
        const wpColor = lerpColor(WATER_BLUE, s.accentRgb, 0.1);
        const wpAlpha = lifeFrac * 0.2 * entrance;

        ctx.beginPath();
        ctx.arc(wp.x, wp.y, wp.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba(wpColor, wpAlpha);
        ctx.fill();

        // Tiny glow
        if (wp.size > minDim * 0.003) {
          const glowR = wp.size * 1.5;
          const gGrad = ctx.createRadialGradient(wp.x, wp.y, 0, wp.x, wp.y, glowR);
          gGrad.addColorStop(0, rgba(lerpColor(WATER_FOAM, s.accentRgb, 0.1), wpAlpha * 0.15));
          gGrad.addColorStop(1, rgba(wpColor, 0));
          ctx.fillStyle = gGrad;
          ctx.fillRect(wp.x - glowR, wp.y - glowR, glowR * 2, glowR * 2);
        }
      }

      // ── Water stream line (hold → rock center) ────────
      if (s.isHolding) {
        const streamColor = lerpColor(WATER_BLUE, s.accentRgb, 0.1);
        const streamAlpha = 0.04 * entrance;

        ctx.beginPath();
        ctx.moveTo(s.holdX, s.holdY);
        ctx.quadraticCurveTo(
          (s.holdX + w / 2) / 2 + (Math.random() - 0.5) * 3,
          (s.holdY + h * 0.42) / 2 + (Math.random() - 0.5) * 3,
          w / 2, h * 0.42,
        );
        ctx.strokeStyle = rgba(streamColor, streamAlpha);
        ctx.lineWidth = minDim * (0.001 + s.smoothProgress * 0.001);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ── Completion glow ───────────────────────────────
      if (s.resolved) {
        const glowPulse = p.reducedMotion ? 1 : 0.9 + 0.1 * Math.sin(s.frameCount * 0.02);
        const glowColor = lerpColor(ROCK_HIGHLIGHT, s.accentRgb, 0.15);
        const glowR = s.baseRadius * 1.5;
        const cGrad = ctx.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h * 0.42, glowR);
        cGrad.addColorStop(0, rgba(glowColor, 0.06 * glowPulse * entrance));
        cGrad.addColorStop(0.5, rgba(glowColor, 0.02 * entrance));
        cGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = cGrad;
        ctx.fillRect(w / 2 - glowR, h * 0.42 - glowR, glowR * 2, glowR * 2);
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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'default',
        }}
      />
    </div>
  );
}