/**
 * ATOM 244: THE COMPLEMENTARY COLOR ENGINE
 * ==========================================
 * Series 25 — Dialectical Engine · Position 4
 *
 * Opposite emotions neutralize each other. Drag the exact complementary
 * wavelength over the aggression to reach calm grey. The chromatic wheel
 * teaches: your antidote already exists on the opposite side.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - Spectral color wheel rendered with real HSL computation per segment
 *   - Each hue emits wavefronts; complementary hues create destructive
 *     interference (cancellation → grey/calm) when overlapping
 *   - Non-complementary overlaps create constructive fringes (amplification)
 *   - The physics IS the lesson: only the exact opposite cancels the signal
 *   - Afterimage ghost rendering shows the complementary color persisting
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere
 *   2. Spectral interference field radiating from active hue
 *   3. Color wheel shadow
 *   4. Color wheel with per-segment HSL gradients + specular
 *   5. Active hue indicator + afterimage ghost
 *   6. Complementary overlay with interference pattern
 *   7. Neutralization glow / calm state
 *   8. Progress ring
 *
 * PHYSICS:
 *   - 360° chromatic wheel with 36 rendered segments
 *   - Drag to select complementary hue (scrub around wheel)
 *   - Proximity to exact complement creates destructive interference
 *   - Perfect complement → full cancellation → calm grey burst
 *   - Afterimage of complementary hue fades slowly
 *   - Breath modulates wheel pulsation + interference wavelength
 *
 * INTERACTION:
 *   Drag/scrub wheel → find complement (drag_snap, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Neutralized calm grey state, static
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/** Convert HSL (h: 0–360, s: 0–1, l: 0–1) to RGB tuple */
function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/** Compute angular distance between two hue values (0–360) */
function hueDist(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Wheel outer radius */
const WHEEL_R = SIZE.lg * 0.48;
/** Wheel inner radius (ring thickness) */
const WHEEL_INNER_R = SIZE.md * 0.3;
/** Number of wheel segments */
const SEGMENT_COUNT = 36;
/** Active hue (source of "aggression" — red-orange) */
const ACTIVE_HUE = 15;
/** Complement threshold (degrees) for neutralization */
const COMPLEMENT_THRESHOLD = 12;
/** Interference fringe ring count */
const FRINGE_RINGS = 20;
/** Interference fringe wavelength */
const FRINGE_LAMBDA = 0.02;
/** Afterimage persistence (frames) */
const AFTERIMAGE_LIFE = 120;
/** Glow layers for neutralization burst */
const GLOW_LAYERS = 6;
/** Neutralization glow radius */
const NEUTRAL_GLOW_R = SIZE.xl * 0.6;
/** Breath modulation on wheel pulsation */
const BREATH_WHEEL_MOD = 0.03;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Indicator dot radius */
const INDICATOR_R = 0.015;
/** Calm state animation speed */
const CALM_SPEED = 0.015;

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ComplementaryColorAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    selectedHue: 90, // starting away from complement
    dragging: false, dragNotified: false,
    neutralized: false, calmAnim: 0, completed: false,
    afterimageHue: -1, afterimageLife: 0,
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
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const time = s.frameCount * 0.012;
      const breath = p.breathAmplitude;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') { s.neutralized = true; s.calmAnim = 1; s.completed = true; }

      const complementHue = (ACTIVE_HUE + 180) % 360;
      const distToComplement = hueDist(s.selectedHue, complementHue);
      const proximity = Math.max(0, 1 - distToComplement / 90);
      const breathMod = 1 + breath * BREATH_WHEEL_MOD;

      // Neutralization check
      if (distToComplement < COMPLEMENT_THRESHOLD && !s.neutralized) {
        s.neutralized = true; cb.onHaptic('completion');
        s.afterimageHue = s.selectedHue;
        s.afterimageLife = AFTERIMAGE_LIFE;
      }
      if (s.neutralized) s.calmAnim = Math.min(1, s.calmAnim + CALM_SPEED * ms);
      if (s.calmAnim >= 0.95 && !s.completed) s.completed = true;

      // Afterimage decay
      if (s.afterimageLife > 0) s.afterimageLife -= ms;

      cb.onStateChange?.(s.completed ? 1 : s.neutralized ? 0.5 + s.calmAnim * 0.5 : proximity * 0.5);

      const outerR = px(WHEEL_R, minDim) * breathMod;
      const innerR = px(WHEEL_INNER_R, minDim) * breathMod;
      const activeRgb = hslToRgb(ACTIVE_HUE, 0.85, 0.55);
      const selectedRgb = hslToRgb(s.selectedHue, 0.85, 0.55);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Spectral interference field
      // ════════════════════════════════════════════════════
      if (!s.neutralized) {
        const lambda = px(FRINGE_LAMBDA, minDim);
        // Active hue emits wavefronts from its position on wheel
        const activeAngle = (ACTIVE_HUE / 360) * Math.PI * 2 - Math.PI / 2;
        const selAngle = (s.selectedHue / 360) * Math.PI * 2 - Math.PI / 2;
        const midR = (outerR + innerR) / 2;
        const src1x = cx + Math.cos(activeAngle) * midR;
        const src1y = cy + Math.sin(activeAngle) * midR;
        const src2x = cx + Math.cos(selAngle) * midR;
        const src2y = cy + Math.sin(selAngle) * midR;

        for (let ri = 0; ri < FRINGE_RINGS; ri++) {
          const t = ri / FRINGE_RINGS;
          const fringeR = innerR * 0.3 + t * outerR * 0.8;
          // Sample 40 points around each ring
          for (let pi = 0; pi < 40; pi++) {
            const pa = (pi / 40) * Math.PI * 2;
            const px2 = cx + Math.cos(pa) * fringeR;
            const py2 = cy + Math.sin(pa) * fringeR;
            const d1 = Math.hypot(px2 - src1x, py2 - src1y);
            const d2 = Math.hypot(px2 - src2x, py2 - src2y);
            const phaseDiff = ((d1 - d2) / lambda + time * 0.3) * Math.PI;
            const intensity = Math.pow(Math.cos(phaseDiff), 2);
            const destructive = 1 - intensity; // bright where destructive = complement working
            const fA = ALPHA.glow.max * 0.025 * (proximity * destructive + (1 - proximity) * intensity * 0.3) * entrance;
            if (fA < 0.001) continue;
            const dotR2 = px(0.002, minDim) * (0.4 + intensity);
            const fCol = proximity > 0.5
              ? lerpColor([180, 180, 180] as RGB, [255, 255, 255] as RGB, destructive)
              : lerpColor(activeRgb, selectedRgb, intensity);
            ctx.beginPath();
            ctx.arc(px2, py2, dotR2, 0, Math.PI * 2);
            ctx.fillStyle = rgba(fCol, fA);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3-4: Color wheel
      // ════════════════════════════════════════════════════
      if (!s.neutralized || s.calmAnim < 0.8) {
        const wheelAlpha = s.neutralized ? (1 - s.calmAnim) : 1;
        // Shadow
        ctx.beginPath();
        ctx.arc(cx + 2, cy + 3, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.03 * entrance * wheelAlpha);
        ctx.lineWidth = (outerR - innerR) * 1.1;
        ctx.stroke();

        // Segments
        const segAngle = (Math.PI * 2) / SEGMENT_COUNT;
        for (let i = 0; i < SEGMENT_COUNT; i++) {
          const startAngle = i * segAngle - Math.PI / 2;
          const endAngle = startAngle + segAngle + 0.01; // slight overlap
          const hue = (i / SEGMENT_COUNT) * 360;
          const segRgb = hslToRgb(hue, 0.8, 0.5);
          const nextRgb = hslToRgb(((i + 1) / SEGMENT_COUNT) * 360, 0.8, 0.5);
          const midAngle = startAngle + segAngle / 2;

          // Segment body
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, startAngle, endAngle);
          ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
          ctx.closePath();
          // 4-stop gradient from inner to outer
          const gx1 = cx + Math.cos(midAngle) * innerR;
          const gy1 = cy + Math.sin(midAngle) * innerR;
          const gx2 = cx + Math.cos(midAngle) * outerR;
          const gy2 = cy + Math.sin(midAngle) * outerR;
          const segGrad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
          const sA = ALPHA.content.max * 0.2 * entrance * wheelAlpha;
          segGrad.addColorStop(0, rgba(lerpColor(segRgb, [0, 0, 0] as RGB, 0.15), sA * 0.6));
          segGrad.addColorStop(0.3, rgba(segRgb, sA));
          segGrad.addColorStop(0.7, rgba(lerpColor(segRgb, nextRgb, 0.5), sA * 0.9));
          segGrad.addColorStop(1, rgba(lerpColor(segRgb, [255, 255, 255] as RGB, 0.2), sA * 0.7));
          ctx.fillStyle = segGrad;
          ctx.fill();
        }

        // Specular on wheel (top arc)
        ctx.beginPath();
        ctx.arc(cx, cy, outerR - (outerR - innerR) * 0.15, -Math.PI * 0.7, -Math.PI * 0.3);
        ctx.strokeStyle = rgba([255, 255, 255] as RGB, 0.06 * entrance * wheelAlpha);
        ctx.lineWidth = (outerR - innerR) * 0.15;
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Active hue + selected indicator + afterimage
      // ════════════════════════════════════════════════════
      if (!s.neutralized) {
        const midR = (outerR + innerR) / 2;
        // Active hue indicator (fixed)
        const activeA = (ACTIVE_HUE / 360) * Math.PI * 2 - Math.PI / 2;
        const aix = cx + Math.cos(activeA) * midR;
        const aiy = cy + Math.sin(activeA) * midR;
        const aiR = px(INDICATOR_R, minDim);
        // Glow
        const aiGlow = ctx.createRadialGradient(aix, aiy, 0, aix, aiy, aiR * 4);
        aiGlow.addColorStop(0, rgba(activeRgb, ALPHA.glow.max * 0.1 * entrance));
        aiGlow.addColorStop(1, rgba(activeRgb, 0));
        ctx.fillStyle = aiGlow;
        ctx.fillRect(aix - aiR * 4, aiy - aiR * 4, aiR * 8, aiR * 8);
        // Core
        ctx.beginPath(); ctx.arc(aix, aiy, aiR, 0, Math.PI * 2);
        const aiGrad = ctx.createRadialGradient(aix - aiR * 0.2, aiy - aiR * 0.2, aiR * 0.1, aix, aiy, aiR);
        aiGrad.addColorStop(0, rgba(lerpColor(activeRgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.5 * entrance));
        aiGrad.addColorStop(0.5, rgba(activeRgb, ALPHA.content.max * 0.4 * entrance));
        aiGrad.addColorStop(1, rgba(activeRgb, ALPHA.content.max * 0.15 * entrance));
        ctx.fillStyle = aiGrad; ctx.fill();

        // Selected hue indicator (draggable)
        const selA = (s.selectedHue / 360) * Math.PI * 2 - Math.PI / 2;
        const six = cx + Math.cos(selA) * midR;
        const siy = cy + Math.sin(selA) * midR;
        const siR = px(INDICATOR_R * 1.2, minDim);
        // Glow
        const siGlow = ctx.createRadialGradient(six, siy, 0, six, siy, siR * 4);
        siGlow.addColorStop(0, rgba(selectedRgb, ALPHA.glow.max * 0.12 * entrance));
        siGlow.addColorStop(1, rgba(selectedRgb, 0));
        ctx.fillStyle = siGlow;
        ctx.fillRect(six - siR * 4, siy - siR * 4, siR * 8, siR * 8);
        // Core with specular
        ctx.beginPath(); ctx.arc(six, siy, siR, 0, Math.PI * 2);
        const siGrad = ctx.createRadialGradient(six - siR * 0.2, siy - siR * 0.2, siR * 0.1, six, siy, siR);
        siGrad.addColorStop(0, rgba(lerpColor(selectedRgb, [255, 255, 255] as RGB, 0.5), ALPHA.content.max * 0.5 * entrance));
        siGrad.addColorStop(0.5, rgba(selectedRgb, ALPHA.content.max * 0.4 * entrance));
        siGrad.addColorStop(1, rgba(selectedRgb, ALPHA.content.max * 0.1 * entrance));
        ctx.fillStyle = siGrad; ctx.fill();
        // Specular
        ctx.beginPath();
        ctx.ellipse(six - siR * 0.2, siy - siR * 0.25, siR * 0.3, siR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.22 * entrance);
        ctx.fill();
      }

      // Afterimage ghost
      if (s.afterimageLife > 0) {
        const ghostAlpha = (s.afterimageLife / AFTERIMAGE_LIFE) * 0.15 * entrance;
        const ghostRgb = hslToRgb(s.afterimageHue, 0.6, 0.5);
        const ghostR = px(WHEEL_R * 0.3, minDim);
        const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, ghostR);
        ag.addColorStop(0, rgba(ghostRgb, ghostAlpha));
        ag.addColorStop(0.5, rgba(ghostRgb, ghostAlpha * 0.3));
        ag.addColorStop(1, rgba(ghostRgb, 0));
        ctx.fillStyle = ag;
        ctx.fillRect(cx - ghostR, cy - ghostR, ghostR * 2, ghostR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Neutralization glow
      // ════════════════════════════════════════════════════
      if (s.neutralized) {
        const calmRgb: RGB = [180, 180, 180];
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = px(NEUTRAL_GLOW_R * (0.3 + s.calmAnim * 0.6 + gi * 0.15), minDim) * breathMod;
          const gA = ALPHA.glow.max * (0.03 + s.calmAnim * 0.1) * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(lerpColor(calmRgb, [255, 255, 255] as RGB, 0.3), gA));
          gg.addColorStop(0.3, rgba(calmRgb, gA * 0.6));
          gg.addColorStop(0.6, rgba(s.primaryRgb, gA * 0.15));
          gg.addColorStop(1, rgba(calmRgb, 0));
          ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        // Calm core
        const coreR = px(0.05, minDim) * s.calmAnim * breathMod;
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        coreGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.3 * s.calmAnim * entrance));
        coreGrad.addColorStop(0.5, rgba(calmRgb, ALPHA.content.max * 0.15 * s.calmAnim * entrance));
        coreGrad.addColorStop(1, rgba(calmRgb, 0));
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad; ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : proximity;
      if (prog > 0.01) {
        ctx.beginPath(); ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.neutralized) return;
      s.dragging = true;
      if (!s.dragNotified) { s.dragNotified = true; callbacksRef.current.onHaptic('drag_snap'); }
      canvas.setPointerCapture(e.pointerId);
      // Update hue from pointer angle
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const angle = Math.atan2(my, mx) + Math.PI / 2;
      s.selectedHue = ((angle / (Math.PI * 2)) * 360 + 360) % 360;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      const angle = Math.atan2(my, mx) + Math.PI / 2;
      s.selectedHue = ((angle / (Math.PI * 2)) * 360 + 360) % 360;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
