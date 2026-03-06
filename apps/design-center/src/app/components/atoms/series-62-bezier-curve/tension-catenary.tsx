/**
 * ATOM 619: THE TENSION CATENARY ENGINE
 * =======================================
 * Series 62 — Bezier Curve · Position 9
 *
 * Cure snapping under rigid expectations. Let go of the perfectly
 * straight tense line — it relaxes into a beautiful natural catenary
 * curve. Unshakeable effortless physics replaces the tension.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Tense: flow arrows rigid/horizontal, compressed, vibrating
 *   - Releasing: arrows begin curving downward following gravity
 *   - Catenary: arrows trace the natural sag curve, laminar + calm
 *   - Flow field teaches: gravity is not the enemy — it's the shape
 *
 * PHYSICS:
 *   - Held tense line across screen (horizontal, vibrating)
 *   - Hold = tension, vibration, threat of snapping
 *   - Release finger → line sags into catenary curve
 *   - Catenary = natural hanging shape (cosh curve)
 *   - Tension drops to zero, line becomes unbreakable
 *   - Breath modulates sag depth + glow warmth
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + tension field
 *   2. Flow field (rigid → gravitational)
 *   3. Line shadow
 *   4. Line body with tension gradient (red→blue)
 *   5. Anchor points with glass render
 *   6. Tension indicator (vibration particles)
 *   7. Catenary sag depth indicator
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Hold (tense) → Release (catenary relaxation)
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static catenary
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

/** Anchor positions */
const ANCHOR_L_X = 0.1;
const ANCHOR_R_X = 0.9;
const ANCHOR_Y = 0.38;
/** Anchor radius */
const ANCHOR_R = PARTICLE_SIZE.lg;
/** Catenary max sag depth */
const MAX_SAG = SIZE.lg;
/** Line sample points */
const LINE_POINTS = 50;
/** Line stroke */
const LINE_STROKE = STROKE.bold;
/** Line glow width */
const LINE_GLOW_W = 0.006;
/** Tension vibration amplitude */
const VIB_AMP = 0.004;
/** Vibration frequency */
const VIB_FREQ = 0.25;
/** Tension particles */
const TENSION_PARTICLES = 30;
/** Sag relaxation speed */
const SAG_SPEED = 0.012;
/** Flow cols */
const FLOW_COLS = 16;
/** Flow rows */
const FLOW_ROWS = 8;
/** Flow arrow len */
const FLOW_ARROW_LEN = 0.02;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Bloom frames */
const BLOOM_FRAMES = 30;
/** Breath sag modulation */
const BREATH_SAG_MOD = 0.06;

// =====================================================================
// STATE TYPES
// =====================================================================

interface TensionParticle {
  t: number;
  offset: number;
  speed: number;
}

interface CatenaryState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  holding: boolean;
  sag: number;
  tension: number;
  particles: TensionParticle[];
  completed: boolean;
  bloomTimer: number;
  snapWarning: number;
}

// =====================================================================
// HELPER: CATENARY Y
// =====================================================================

/**
 * Compute catenary curve Y offset at normalized position t (0-1).
 * Uses parabolic approximation (close to cosh for display).
 */
function catenaryOffset(t: number, sagDepth: number): number {
  // Parabola: 4 * sag * t * (1 - t)
  return 4 * sagDepth * t * (1 - t);
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function TensionCatenaryAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildParticles = (): TensionParticle[] =>
    Array.from({ length: TENSION_PARTICLES }, () => ({
      t: Math.random(),
      offset: (Math.random() - 0.5) * 2,
      speed: 0.002 + Math.random() * 0.004,
    }));

  const stateRef = useRef<CatenaryState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    holding: true,
    sag: 0,
    tension: 1,
    particles: buildParticles(),
    completed: false,
    bloomTimer: 0,
    snapWarning: 0,
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

      // Physics: sag increases when not holding
      if (!p.reducedMotion) {
        if (s.holding) {
          // Build tension
          s.tension = Math.min(1, s.tension + 0.001 * ms);
          s.snapWarning = Math.min(1, s.snapWarning + 0.0005 * ms);
          s.sag = Math.max(0, s.sag - 0.01 * ms);
        } else {
          // Relax into catenary
          s.sag = Math.min(1, s.sag + SAG_SPEED * ms);
          s.tension = Math.max(0, s.tension - 0.02 * ms);

          if (s.sag >= 0.9 && !s.completed) {
            s.completed = true;
            s.bloomTimer = BLOOM_FRAMES;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
          }
        }
      }

      const sagDepth = px(MAX_SAG, minDim) * s.sag * (1 + breath * BREATH_SAG_MOD);
      const leftX = w * ANCHOR_L_X;
      const rightX = w * ANCHOR_R_X;
      const anchorY = h * ANCHOR_Y;
      const lineW = rightX - leftX;

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + TENSION FIELD
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      if (s.tension > 0.5) {
        const tensionGlow = ctx.createLinearGradient(leftX, anchorY, rightX, anchorY);
        tensionGlow.addColorStop(0, 'rgba(0,0,0,0)');
        tensionGlow.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.max * s.tension * entrance * 0.4));
        tensionGlow.addColorStop(0.7, rgba(s.accentRgb, ALPHA.glow.max * s.tension * entrance * 0.4));
        tensionGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tensionGlow;
        ctx.fillRect(leftX, anchorY - px(0.05, minDim), lineW, px(0.1, minDim));
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD
      // ═══════════════════════════════════════════════════════════
      {
        ctx.lineWidth = px(STROKE.hairline, minDim);
        const arrowLen = px(FLOW_ARROW_LEN, minDim);

        for (let col = 0; col < FLOW_COLS; col++) {
          for (let row = 0; row < FLOW_ROWS; row++) {
            const fx = w * 0.06 + (col / (FLOW_COLS - 1)) * w * 0.88;
            const fy = h * 0.2 + (row / (FLOW_ROWS - 1)) * h * 0.6;

            const t = (fx - leftX) / lineW;
            if (t < 0 || t > 1) continue;

            // Tense: horizontal rigid
            // Released: gravitational (downward curve-following)
            const sagAtT = catenaryOffset(t, sagDepth);
            const lineY = anchorY + sagAtT;
            const distToLine = fy - lineY;

            let dx: number, dy: number;
            if (s.sag < 0.3) {
              // Rigid horizontal + vibration
              dx = 1;
              dy = Math.sin(s.frameCount * VIB_FREQ + col) * s.tension * 0.3;
            } else {
              // Gravitational: following curve slope
              const slope = (catenaryOffset(t + 0.02, sagDepth) - catenaryOffset(t - 0.02, sagDepth)) / (0.04 * lineW);
              dx = 1;
              dy = slope * s.sag;
            }

            const mag = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const nearness = Math.max(0, 1 - Math.abs(distToLine) / (minDim * 0.15));
            const alpha = ALPHA.background.max * nearness * entrance;
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, s.sag);
            ctx.strokeStyle = rgba(arrowColor, alpha);

            const aLen = arrowLen * nearness;
            const ex = fx + (dx / mag) * aLen;
            const ey = fy + (dy / mag) * aLen;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            const a = Math.atan2(dy / mag, dx / mag);
            const hl = aLen * 0.25;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * hl, ey - Math.sin(a - 0.5) * hl);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: LINE SHADOW
      // ═══════════════════════════════════════════════════════════
      {
        const shOff = px(0.004, minDim);
        ctx.beginPath();
        for (let i = 0; i <= LINE_POINTS; i++) {
          const t = i / LINE_POINTS;
          const x = leftX + t * lineW;
          const sag = catenaryOffset(t, sagDepth);
          const vib = s.holding ? Math.sin(s.frameCount * VIB_FREQ + t * 20) * px(VIB_AMP, minDim) * s.tension * ms : 0;
          const y = anchorY + sag + vib + shOff;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.03 * entrance);
        ctx.lineWidth = px(LINE_STROKE * 1.5, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4: LINE BODY WITH TENSION GRADIENT
      // ═══════════════════════════════════════════════════════════
      {
        // Glow
        ctx.beginPath();
        for (let i = 0; i <= LINE_POINTS; i++) {
          const t = i / LINE_POINTS;
          const x = leftX + t * lineW;
          const sag = catenaryOffset(t, sagDepth);
          const vib = s.holding ? Math.sin(s.frameCount * VIB_FREQ + t * 20) * px(VIB_AMP, minDim) * s.tension * ms : 0;
          const y = anchorY + sag + vib;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const glowColor = lerpColor(s.accentRgb, s.primaryRgb, s.sag);
        ctx.strokeStyle = rgba(glowColor, ALPHA.glow.max * entrance);
        ctx.lineWidth = px(LINE_GLOW_W, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Body with gradient
        const lineGrad = ctx.createLinearGradient(leftX, anchorY, rightX, anchorY);
        const tensionColor = lerpColor(s.accentRgb, s.primaryRgb, s.sag);
        lineGrad.addColorStop(0, rgba(tensionColor, ALPHA.focal.max * entrance));
        lineGrad.addColorStop(0.5, rgba(lerpColor(tensionColor, [255, 255, 255] as RGB, 0.15), ALPHA.focal.max * entrance));
        lineGrad.addColorStop(1, rgba(tensionColor, ALPHA.focal.max * entrance));

        ctx.beginPath();
        for (let i = 0; i <= LINE_POINTS; i++) {
          const t = i / LINE_POINTS;
          const x = leftX + t * lineW;
          const sag = catenaryOffset(t, sagDepth);
          const vib = s.holding ? Math.sin(s.frameCount * VIB_FREQ + t * 20) * px(VIB_AMP, minDim) * s.tension * ms : 0;
          const y = anchorY + sag + vib;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = px(LINE_STROKE, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 5: ANCHOR POINTS
      // ═══════════════════════════════════════════════════════════
      for (const ax of [leftX, rightX]) {
        const ar = px(ANCHOR_R, minDim);

        const aGlow = ctx.createRadialGradient(ax, anchorY, 0, ax, anchorY, ar * 4);
        aGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * entrance));
        aGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = aGlow;
        ctx.beginPath();
        ctx.arc(ax, anchorY, ar * 4, 0, Math.PI * 2);
        ctx.fill();

        const aGrad = ctx.createRadialGradient(ax, anchorY, 0, ax, anchorY, ar);
        aGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.accent.max * entrance));
        aGrad.addColorStop(0.35, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        aGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        aGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.arc(ax, anchorY, ar, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(ax - ar * 0.3, anchorY - ar * 0.3, ar * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: TENSION PARTICLES
      // ═══════════════════════════════════════════════════════════
      if (s.tension > 0.3) {
        for (const tp of s.particles) {
          tp.t += tp.speed * ms;
          if (tp.t > 1) tp.t -= 1;

          const x = leftX + tp.t * lineW;
          const sag = catenaryOffset(tp.t, sagDepth);
          const vib = s.holding ? Math.sin(s.frameCount * VIB_FREQ + tp.t * 20) * px(VIB_AMP, minDim) * s.tension * ms : 0;
          const y = anchorY + sag + vib + tp.offset * px(0.01, minDim) * s.tension;

          const pAlpha = s.tension * ALPHA.content.min * entrance;
          ctx.beginPath();
          ctx.arc(x, y, px(PARTICLE_SIZE.dot, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, pAlpha);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 7: SAG DEPTH INDICATOR
      // ═══════════════════════════════════════════════════════════
      if (s.sag > 0.1) {
        const sagPx = sagDepth;
        const indicatorX = cx;
        const indicatorTop = anchorY;
        const indicatorBot = anchorY + sagPx;

        // Dashed vertical line
        ctx.beginPath();
        ctx.moveTo(indicatorX, indicatorTop);
        ctx.lineTo(indicatorX, indicatorBot);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.min * s.sag * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.setLineDash([px(0.003, minDim), px(0.005, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small dot at lowest point
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorBot, px(PARTICLE_SIZE.dot, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * s.sag * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS + COMPLETION
      // ═══════════════════════════════════════════════════════════
      {
        const ringR = px(PROGRESS_R, minDim);
        const ringX = w * 0.92;
        const ringY = h * 0.08;

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.sag);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (s.bloomTimer > 0) {
        s.bloomTimer -= ms;
        const bloomT = Math.max(0, s.bloomTimer / BLOOM_FRAMES);
        const bloomR = px(SIZE.md, minDim) * (1 - bloomT) * 2;
        const bloom = ctx.createRadialGradient(cx, anchorY + sagDepth, 0, cx, anchorY + sagDepth, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(cx, anchorY + sagDepth, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (_e: PointerEvent) => {
      const s = stateRef.current;
      s.holding = true;
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (_e: PointerEvent) => {
      const s = stateRef.current;
      if (s.holding) {
        s.holding = false;
        callbacksRef.current.onHaptic('hold_release');
      }
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
