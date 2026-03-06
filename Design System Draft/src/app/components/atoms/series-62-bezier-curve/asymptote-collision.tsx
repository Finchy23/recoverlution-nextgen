/**
 * ATOM 616: THE ASYMPTOTE ENGINE
 * =================================
 * Series 62 — Bezier Curve · Position 6
 *
 * Cure perfectionism. The path gets infinitely close but never touches
 * the target. Double-tap to shatter the constraint then violently jam
 * the line into the target — messy but done.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Flow arrows show approach trajectories converging on target
 *   - Near-target, arrows compress into a frustrating "wall" of deceleration
 *   - After constraint shatter, flow vectors blast straight through
 *   - Physics teaches: done beats perfect
 *
 * PHYSICS:
 *   - Asymptotic curve approaches glowing target but never reaches
 *   - Exponentially decelerating approach (Zeno's paradox)
 *   - Double-tap shatters mathematical constraint (visible crack)
 *   - Drag endpoint to jam into target (messy collision)
 *   - Impact creates satisfying explosion of imperfect sparks
 *   - Breath modulates approach shimmer + target pulse
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + frustration haze
 *   2. Flow field approach vectors
 *   3. Asymptotic curve shadow + body
 *   4. Constraint barrier (glass wall effect)
 *   5. Target orb with multi-layer gradient
 *   6. Approaching tip with energy buildup glow
 *   7. Shatter particles / impact sparks
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Double-tap (shatter) → Drag (jam into target) → completion
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static completed collision
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, PARTICLE_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Target position (right side) */
const TARGET_X = 0.78;
const TARGET_Y = 0.48;
/** Target orb radius */
const TARGET_R = SIZE.sm * 1.3;
/** Target glow layers */
const TARGET_GLOW_LAYERS = 4;
/** Curve start (left side) */
const CURVE_START_X = 0.08;
const CURVE_START_Y = 0.48;
/** Asymptotic approach gap (never reaches) */
const ASYM_GAP = 0.04;
/** Curve sample points */
const CURVE_POINTS = 50;
/** Tip radius */
const TIP_R = PARTICLE_SIZE.lg;
/** Tip energy glow layers */
const TIP_GLOW_LAYERS = 3;
/** Constraint barrier width */
const BARRIER_W = 0.003;
/** Barrier height */
const BARRIER_H = SIZE.md;
/** Flow grid cols */
const FLOW_COLS = 16;
/** Flow grid rows */
const FLOW_ROWS = 10;
/** Flow arrow length */
const FLOW_ARROW_LEN = 0.02;
/** Shatter particle count */
const SHATTER_COUNT = 30;
/** Shatter particle life */
const SHATTER_LIFE = 40;
/** Impact spark count */
const IMPACT_SPARKS = 20;
/** Impact spark life */
const IMPACT_LIFE = 35;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Bloom frames */
const BLOOM_FRAMES = 30;
/** Frustration haze radius */
const FRUST_HAZE_R = SIZE.lg;
/** Breath target pulse */
const BREATH_TARGET_PULSE = 0.04;

// =====================================================================
// STATE TYPES
// =====================================================================

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface AsymState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  phase: 'approach' | 'shattered' | 'jamming' | 'done';
  approachT: number;
  shatterParticles: Particle[];
  impactSparks: Particle[];
  jamProgress: number;
  completed: boolean;
  bloomTimer: number;
  frustration: number;
  lastTapTime: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function AsymptoteCollisionAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<AsymState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    phase: 'approach',
    approachT: 0,
    shatterParticles: [],
    impactSparks: [],
    jamProgress: 0,
    completed: false,
    bloomTimer: 0,
    frustration: 0,
    lastTapTime: 0,
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
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const tx = w * TARGET_X;
      const ty = h * TARGET_Y;
      const sx = w * CURVE_START_X;
      const sy = h * CURVE_START_Y;

      // Advance approach
      if (s.phase === 'approach' && !p.reducedMotion) {
        s.approachT = Math.min(0.99, s.approachT + 0.003 * ms);
        s.frustration = Math.min(1, s.frustration + 0.001);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + FRUSTRATION HAZE
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      if (s.phase === 'approach' && s.frustration > 0.3) {
        const hazeR = px(FRUST_HAZE_R, minDim) * (0.5 + s.frustration * 0.5);
        const haze = ctx.createRadialGradient(tx, ty, 0, tx, ty, hazeR);
        haze.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * s.frustration * entrance * 0.4));
        haze.addColorStop(0.6, rgba(s.accentRgb, ALPHA.glow.min * s.frustration * entrance));
        haze.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, w, h);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD
      // ═══════════════════════════════════════════════════════════
      {
        ctx.lineWidth = px(STROKE.hairline, minDim);
        const arrowLen = px(FLOW_ARROW_LEN, minDim);
        const shattered = s.phase !== 'approach';

        for (let col = 0; col < FLOW_COLS; col++) {
          for (let row = 0; row < FLOW_ROWS; row++) {
            const fx = w * 0.06 + (col / (FLOW_COLS - 1)) * w * 0.88;
            const fy = h * 0.12 + (row / (FLOW_ROWS - 1)) * h * 0.76;

            // Direction toward target
            const dtx = tx - fx;
            const dty = ty - fy;
            const dist = Math.sqrt(dtx * dtx + dty * dty) + 0.001;
            let dx = dtx / dist;
            let dy = dty / dist;

            // Near-target deceleration wall (before shatter)
            if (!shattered) {
              const nearness = Math.max(0, 1 - dist / (minDim * 0.3));
              const decel = nearness * nearness;
              dx *= (1 - decel * 0.95);
              dy *= (1 - decel * 0.95);
            }

            const mag = Math.sqrt(dx * dx + dy * dy);
            const alpha = ALPHA.background.max * entrance * (0.3 + mag * 0.7);
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, shattered ? 1 : 0.3);
            ctx.strokeStyle = rgba(arrowColor, alpha);

            const aLen = arrowLen * (0.3 + mag * 0.7);
            const ex = fx + dx * aLen;
            const ey = fy + dy * aLen;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            const a = Math.atan2(dy, dx);
            const hl = aLen * 0.25;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * hl, ey - Math.sin(a - 0.5) * hl);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: ASYMPTOTIC CURVE
      // ═══════════════════════════════════════════════════════════
      {
        const gap = s.phase === 'approach' ? ASYM_GAP * (1 - s.approachT * 0.7) : 0;
        const endX = s.phase === 'done' || s.phase === 'jamming' ? tx : tx - px(gap, minDim) * minDim;

        // Glow
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(
          sx + (endX - sx) * 0.5, sy - minDim * 0.08,
          endX - minDim * 0.1, ty + minDim * 0.05,
          endX, ty,
        );
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * entrance);
        ctx.lineWidth = px(0.006, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.bezierCurveTo(
          sx + (endX - sx) * 0.5, sy - minDim * 0.08,
          endX - minDim * 0.1, ty + minDim * 0.05,
          endX, ty,
        );
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.focal.max * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4: CONSTRAINT BARRIER
      // ═══════════════════════════════════════════════════════════
      if (s.phase === 'approach') {
        const barrierX = tx - px(ASYM_GAP * 0.5, minDim) * minDim;
        const barrierH = px(BARRIER_H, minDim);
        const barrierW = px(BARRIER_W, minDim);
        const shimmer = Math.sin(s.frameCount * 0.08 * ms) * 0.3 + 0.7;

        // Glass wall effect
        const wallGrad = ctx.createLinearGradient(barrierX - barrierW, ty - barrierH / 2, barrierX + barrierW, ty - barrierH / 2);
        wallGrad.addColorStop(0, 'rgba(0,0,0,0)');
        wallGrad.addColorStop(0.3, rgba(s.accentRgb, ALPHA.content.min * shimmer * entrance));
        wallGrad.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.content.min * shimmer * entrance * 0.5));
        wallGrad.addColorStop(0.7, rgba(s.accentRgb, ALPHA.content.min * shimmer * entrance));
        wallGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(barrierX - barrierW * 3, ty - barrierH / 2, barrierW * 6, barrierH);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 5: TARGET ORB
      // ═══════════════════════════════════════════════════════════
      {
        const tr = px(TARGET_R, minDim) * (1 + breath * BREATH_TARGET_PULSE);

        for (let g = TARGET_GLOW_LAYERS; g >= 1; g--) {
          const gr = tr * (1 + g * 1.3);
          const tGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, gr);
          tGlow.addColorStop(0, rgba(s.primaryRgb, (ALPHA.glow.max / g) * entrance * 0.7));
          tGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = tGlow;
          ctx.beginPath();
          ctx.arc(tx, ty, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        const tGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, tr);
        tGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.5), ALPHA.accent.max * entrance));
        tGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        tGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        tGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tGrad;
        ctx.beginPath();
        ctx.arc(tx, ty, tr, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(tx - tr * 0.3, ty - tr * 0.3, tr * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: TIP WITH ENERGY BUILDUP
      // ═══════════════════════════════════════════════════════════
      if (s.phase === 'approach' || s.phase === 'shattered') {
        const gap = ASYM_GAP * (1 - s.approachT * 0.7);
        const tipX = tx - px(gap, minDim) * minDim;
        const tipY = ty;
        const energy = s.frustration;

        for (let g = TIP_GLOW_LAYERS; g >= 1; g--) {
          const gr = px(TIP_R, minDim) * (1 + g * 1.5 * energy);
          const tGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, gr);
          tGlow.addColorStop(0, rgba(s.accentRgb, (ALPHA.glow.max / g) * energy * entrance));
          tGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = tGlow;
          ctx.beginPath();
          ctx.arc(tipX, tipY, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        const tipGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, px(TIP_R, minDim));
        tipGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, energy * 0.4), ALPHA.accent.max * entrance));
        tipGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.focal.max * entrance));
        tipGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = tipGrad;
        ctx.beginPath();
        ctx.arc(tipX, tipY, px(TIP_R, minDim), 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: SHATTER + IMPACT PARTICLES
      // ═══════════════════════════════════════════════════════════
      // Update shatter particles
      const aliveShatter: Particle[] = [];
      for (const sp of s.shatterParticles) {
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.00004;
        sp.life -= ms;
        if (sp.life > 0) {
          aliveShatter.push(sp);
          const t = sp.life / sp.maxLife;
          const spx = sp.x * w;
          const spy = sp.y * h;
          ctx.beginPath();
          ctx.arc(spx, spy, px(sp.size, minDim) * t, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * t * entrance);
          ctx.fill();
        }
      }
      s.shatterParticles = aliveShatter;

      // Update impact sparks
      const aliveImpact: Particle[] = [];
      for (const sp of s.impactSparks) {
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.00003;
        sp.life -= ms;
        if (sp.life > 0) {
          aliveImpact.push(sp);
          const t = sp.life / sp.maxLife;
          const spx = sp.x * w;
          const spy = sp.y * h;

          const sparkGlow = ctx.createRadialGradient(spx, spy, 0, spx, spy, px(sp.size * 3, minDim));
          sparkGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * t * entrance));
          sparkGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = sparkGlow;
          ctx.beginPath();
          ctx.arc(spx, spy, px(sp.size * 3, minDim), 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(spx, spy, px(sp.size, minDim) * (0.5 + t * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.focal.max * t * entrance);
          ctx.fill();
        }
      }
      s.impactSparks = aliveImpact;

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS + COMPLETION
      // ═══════════════════════════════════════════════════════════
      {
        const ringR = px(PROGRESS_R, minDim);
        const ringX = w * 0.08;
        const ringY = h * 0.08;
        const prog = s.phase === 'done' ? 1 : s.phase === 'jamming' ? 0.7 : s.phase === 'shattered' ? 0.4 : s.approachT * 0.3;

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (s.bloomTimer > 0) {
        s.bloomTimer -= ms;
        const bloomT = Math.max(0, s.bloomTimer / BLOOM_FRAMES);
        const bloomR = px(SIZE.lg, minDim) * (1 - bloomT);
        const bloom = ctx.createRadialGradient(tx, ty, 0, tx, ty, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(tx, ty, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const now = performance.now();

      if (s.phase === 'approach') {
        // Double-tap detection
        if (now - s.lastTapTime < 350) {
          // Shatter!
          s.phase = 'shattered';
          callbacksRef.current.onHaptic('tap');
          // Spawn shatter particles
          const txNorm = TARGET_X;
          const tyNorm = TARGET_Y;
          for (let i = 0; i < SHATTER_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.001 + Math.random() * 0.004;
            s.shatterParticles.push({
              x: txNorm - ASYM_GAP * 0.5 + (Math.random() - 0.5) * 0.02,
              y: tyNorm + (Math.random() - 0.5) * 0.05,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: SHATTER_LIFE,
              maxLife: SHATTER_LIFE,
              size: PARTICLE_SIZE.dot + Math.random() * PARTICLE_SIZE.sm,
            });
          }
        }
        s.lastTapTime = now;
      } else if (s.phase === 'shattered') {
        s.phase = 'jamming';
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.phase !== 'jamming') return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      s.jamProgress = Math.min(1, mx / TARGET_X);

      if (s.jamProgress >= 0.95 && !s.completed) {
        s.phase = 'done';
        s.completed = true;
        s.bloomTimer = BLOOM_FRAMES;
        callbacksRef.current.onHaptic('completion');
        callbacksRef.current.onStateChange?.(1);

        // Impact sparks
        for (let i = 0; i < IMPACT_SPARKS; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.002 + Math.random() * 0.005;
          s.impactSparks.push({
            x: TARGET_X,
            y: TARGET_Y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: IMPACT_LIFE,
            maxLife: IMPACT_LIFE,
            size: PARTICLE_SIZE.sm + Math.random() * PARTICLE_SIZE.md,
          });
        }
      }
    };

    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
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
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
