/**
 * ATOM 399: THE POLISH ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 9
 *
 * Cure impatient release of unfinished work. Rapid circular rubbing
 * transforms rough abrasive surface into hyper-reflective mirror.
 *
 * PHYSICS:
 *   - Large circular disc fills center viewport (hero sized)
 *   - Surface covered in rough texture (random speckles)
 *   - Circular finger motion acts as polishing friction
 *   - Roughness progressively smooths — speckles fade
 *   - Mirror reflections appear: moving highlight catchlight
 *   - Completed: pristine hyper-reflective surface with gleaming highlight
 *   - Polish progress shown as circular ring around disc
 *
 * INTERACTION:
 *   Circular drag → accumulates polish (angular motion)
 *   Each 20% step triggers haptic
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static polished mirror disc with gleam
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Disc radius (hero sized) */
const DISC_RADIUS_FRAC = SIZE.lg;
/** Total angular motion needed (radians) */
const POLISH_THRESHOLD = 22;
/** Roughness speckle count */
const SPECKLE_COUNT = 80;
/** Mirror highlight offset (orbits as you polish) */
const HIGHLIGHT_ORBIT_SPEED = 0.03;
/** Highlight size fraction */
const HIGHLIGHT_SIZE_FRAC = 0.08;
/** Glow expansion on completion */
const COMPLETE_GLOW_MULT = 1.5;
/** Completion anim speed */
const COMPLETE_SPEED = 0.01;
/** Step haptic interval */
const STEP_INTERVAL = 0.2;
/** Concentric ring count (depth illusion) */
const DEPTH_RINGS = 5;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function PolishRefineAtom({
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

  const specklesRef = useRef(
    Array.from({ length: SPECKLE_COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 0.1 + Math.random() * 0.85,
      size: 0.002 + Math.random() * 0.003,
    }))
  );

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    totalMotion: 0,
    dragging: false,
    lastAngle: 0,
    mirrored: false,
    completeAnim: 0,
    completed: false,
    lastStep: 0,
    highlightAngle: 0,
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
      const speckles = specklesRef.current;

      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.mirrored) {
        s.totalMotion = POLISH_THRESHOLD;
      }

      const polish = Math.min(1, s.totalMotion / POLISH_THRESHOLD);
      const roughness = 1 - polish;

      // ── Mirror detection ────────────────────────────
      if (polish >= 0.98 && !s.mirrored) {
        s.mirrored = true;
        cb.onHaptic('completion');
      }
      if (s.mirrored) {
        s.completeAnim = Math.min(1, s.completeAnim + COMPLETE_SPEED * ms);
      }

      // ── Step haptics ────────────────────────────────
      const currentStep = Math.floor(polish / STEP_INTERVAL);
      if (currentStep > s.lastStep && !s.mirrored) {
        s.lastStep = currentStep;
        cb.onHaptic('step_advance');
      }

      // ── Highlight orbit ─────────────────────────────
      s.highlightAngle += HIGHLIGHT_ORBIT_SPEED * ms;

      cb.onStateChange?.(s.mirrored
        ? 0.5 + easeOutCubic(s.completeAnim) * 0.5
        : polish * 0.5);

      const discR = px(DISC_RADIUS_FRAC, minDim);
      const complete = easeOutCubic(s.completeAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        const gR = discR * COMPLETE_GLOW_MULT;
        const sg = ctx.createRadialGradient(cx, cy, discR * 0.2, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.beginPath();
        ctx.arc(cx, cy, discR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
        ctx.fill();

        // Highlight
        const hlR = discR * HIGHLIGHT_SIZE_FRAC;
        const hlX = cx - discR * 0.25;
        const hlY = cy - discR * 0.25;
        const hg = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, hlR);
        hg.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
          ALPHA.focal.max * 0.3 * entrance,
        ));
        hg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(hlX - hlR, hlY - hlR, hlR * 2, hlR * 2);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Shadow ──────────────────────────────────────
      const shadowR = discR * 1.15;
      const shadow = ctx.createRadialGradient(cx, cy + discR * 0.05, discR * 0.3, cx, cy, shadowR);
      shadow.addColorStop(0, rgba(s.accentRgb, ALPHA.atmosphere.max * 0.06 * entrance));
      shadow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(cx - shadowR, cy - shadowR, shadowR * 2, shadowR * 2);

      // ── Disc body ───────────────────────────────────
      const discColor = lerpColor(s.accentRgb, s.primaryRgb, polish) as RGB;

      // Depth gradient (mirror effect)
      const discGrad = ctx.createRadialGradient(
        cx - discR * 0.2, cy - discR * 0.2, 0,
        cx, cy, discR,
      );
      discGrad.addColorStop(0, rgba(discColor, ALPHA.content.max * (0.15 + polish * 0.25) * entrance));
      discGrad.addColorStop(0.7, rgba(discColor, ALPHA.content.max * (0.1 + polish * 0.15) * entrance));
      discGrad.addColorStop(1, rgba(discColor, ALPHA.content.max * 0.08 * entrance));

      ctx.beginPath();
      ctx.arc(cx, cy, discR, 0, Math.PI * 2);
      ctx.fillStyle = discGrad;
      ctx.fill();

      // Disc edge
      ctx.strokeStyle = rgba(discColor, ALPHA.content.max * (0.15 + polish * 0.1) * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── Depth concentric rings (appear with polish) ──
      if (polish > 0.3) {
        const ringAlpha = (polish - 0.3) * 1.4;
        for (let i = 1; i <= DEPTH_RINGS; i++) {
          const rr = discR * (i / (DEPTH_RINGS + 1));
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * ringAlpha * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── Rough texture speckles (fade with polish) ───
      if (roughness > 0.02) {
        for (const sp of speckles) {
          const spR = discR * sp.radius;
          const spX = cx + Math.cos(sp.angle) * spR;
          const spY = cy + Math.sin(sp.angle) * spR;
          // Only draw if inside disc
          const dist = Math.sqrt((spX - cx) ** 2 + (spY - cy) ** 2);
          if (dist > discR) continue;

          ctx.beginPath();
          ctx.arc(spX, spY, px(sp.size, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * roughness * entrance);
          ctx.fill();
        }
      }

      // ── Mirror highlight (appears and orbits) ───────
      if (polish > 0.4) {
        const hlIntensity = (polish - 0.4) * 1.67;
        const hlDist = discR * 0.35;
        const hlX = cx + Math.cos(s.highlightAngle) * hlDist * 0.6;
        const hlY = cy + Math.sin(s.highlightAngle) * hlDist * 0.4;
        const hlR = discR * HIGHLIGHT_SIZE_FRAC * (1 + complete * 0.3);

        const hg = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, hlR);
        hg.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
          ALPHA.focal.max * 0.35 * hlIntensity * entrance,
        ));
        hg.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * hlIntensity * entrance));
        hg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = hg;
        ctx.fillRect(hlX - hlR, hlY - hlR, hlR * 2, hlR * 2);

        // Secondary highlight (opposite)
        const hl2X = cx - Math.cos(s.highlightAngle + 1) * hlDist * 0.3;
        const hl2Y = cy - Math.sin(s.highlightAngle + 1) * hlDist * 0.2;
        const hl2R = hlR * 0.5;
        const hg2 = ctx.createRadialGradient(hl2X, hl2Y, 0, hl2X, hl2Y, hl2R);
        hg2.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * hlIntensity * entrance));
        hg2.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = hg2;
        ctx.fillRect(hl2X - hl2R, hl2Y - hl2R, hl2R * 2, hl2R * 2);
      }

      // ── Completion radiance ─────────────────────────
      if (s.mirrored) {
        const gR = discR * COMPLETE_GLOW_MULT;
        const cg = ctx.createRadialGradient(cx, cy, discR * 0.3, cx, cy, gR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * complete * entrance));
        cg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * complete * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ── Polish progress ring ────────────────────────
      if (!s.mirrored && polish > 0) {
        const progAngle = polish * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, discR + px(0.025, minDim), -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      s.lastAngle = Math.atan2(
        e.clientY - rect.top - rect.height / 2,
        e.clientX - rect.left - rect.width / 2,
      );
      callbacksRef.current.onHaptic('drag_snap');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.mirrored) return;

      const rect = canvas.getBoundingClientRect();
      const a = Math.atan2(
        e.clientY - rect.top - rect.height / 2,
        e.clientX - rect.left - rect.width / 2,
      );
      let d = a - s.lastAngle;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      s.totalMotion += Math.abs(d);
      s.lastAngle = a;
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'grab',
        }}
      />
    </div>
  );
}
