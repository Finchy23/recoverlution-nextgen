/**
 * ATOM 019: THE RETROCAUSAL ENGINE
 * ==================================
 * Series 2 — Quantum Mechanics · Position 9
 *
 * The ego believes the past dictates the present. Quantum
 * architecture allows that how you act today literally changes
 * the structural meaning of what happened yesterday.
 *
 * The viewport's left region ("the past") contains ~20 fractured
 * geometric elements — shattered, scattered, desaturated.
 * A horizontal timeline scrubber at the bottom represents the
 * present moment. As the user drags it forward, the past HEALS.
 * Fragments drift home. Fracture lines close. Colors warm.
 * Chaos resolves into a coherent mandala.
 *
 * PHYSICS:
 *   - 20 geometric elements with "fractured" and "integrated" states
 *   - Timeline scrubber (0–1 horizontal drag)
 *   - Each element has: home position, fractured offset, rotation,
 *     opacity, color temperature, fracture line visibility
 *   - Elements heal in reverse chronological order as scrubber advances
 *   - Each healing step: snap haptic
 *   - At full integration: all elements form a mandala
 *
 * INTERACTION:
 *   Drag (horizontal) → advance timeline scrubber
 *   Observable        → fragments drift subtly in chaos
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No drift, immediate healing transitions
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS (all viewport-relative via minDim * factor)
// =====================================================================

/** Number of geometric elements */
const ELEMENT_COUNT = 20;
/** Scrubber height as fraction of minDim */
const SCRUBBER_H_FRAC = 0.006;
/** Scrubber Y from bottom as fraction of h */
const SCRUBBER_BOTTOM_FRAC = 0.09;
/** Scrubber handle radius as fraction of minDim */
const HANDLE_R_FRAC = 0.02;
/** Scrubber horizontal padding as fraction of w */
const SCRUBBER_PAD_FRAC = 0.08;
/** Maximum fracture offset as fraction of min dimension */
const MAX_FRACTURE_OFFSET = 0.25;
/** Maximum fracture rotation (radians) */
const MAX_FRACTURE_ROTATION = Math.PI * 0.6;
/** Healing smoothing rate */
const HEAL_SMOOTH = 0.06;
/** Tick half-height as fraction of minDim */
const TICK_H_FRAC = 0.008;

// =====================================================================
// GEOMETRIC ELEMENTS
// =====================================================================

type ShapeType = 'triangle' | 'diamond' | 'circle' | 'hexagon' | 'square';

interface PastElement {
  /** Home position (mandala position) — normalized 0–1 */
  homeX: number;
  homeY: number;
  /** Fractured offset from home */
  fractureX: number;
  fractureY: number;
  /** Fractured rotation */
  fractureRot: number;
  /** Current interpolated position */
  currentX: number;
  currentY: number;
  currentRot: number;
  currentAlpha: number;
  /** Shape type */
  shape: ShapeType;
  /** Size as fraction of min dimension */
  size: number;
  /** Which scrubber position (0–1) heals this element */
  healThreshold: number;
  /** Drift phase for idle animation */
  driftPhase: number;
  driftSpeed: number;
  /** Element index for ordering */
  index: number;
}

function createElements(): PastElement[] {
  const elements: PastElement[] = [];
  const shapes: ShapeType[] = ['triangle', 'diamond', 'circle', 'hexagon', 'square'];

  for (let i = 0; i < ELEMENT_COUNT; i++) {
    // Mandala home position: concentric ring arrangement
    const ring = Math.floor(i / 6);
    const posInRing = i % 6;
    const ringR = 0.06 + ring * 0.065;
    const angle = (posInRing / Math.max(1, Math.min(6, 6))) * Math.PI * 2 + ring * 0.3;

    const homeX = 0.5 + Math.cos(angle) * ringR;
    const homeY = 0.45 + Math.sin(angle) * ringR;

    elements.push({
      homeX,
      homeY,
      fractureX: (Math.random() - 0.5) * MAX_FRACTURE_OFFSET * 2,
      fractureY: (Math.random() - 0.5) * MAX_FRACTURE_OFFSET * 2,
      fractureRot: (Math.random() - 0.5) * MAX_FRACTURE_ROTATION * 2,
      currentX: homeX + (Math.random() - 0.5) * MAX_FRACTURE_OFFSET * 2,
      currentY: homeY + (Math.random() - 0.5) * MAX_FRACTURE_OFFSET * 2,
      currentRot: (Math.random() - 0.5) * MAX_FRACTURE_ROTATION * 2,
      currentAlpha: 0.15 + Math.random() * 0.15,
      shape: shapes[i % shapes.length],
      size: 0.02 + Math.random() * 0.02,
      // Heal in reverse order: last element heals first (backwards causality)
      healThreshold: (ELEMENT_COUNT - 1 - i) / ELEMENT_COUNT,
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: 0.003 + Math.random() * 0.006,
      index: i,
    });
  }
  return elements;
}

// =====================================================================
// SHAPE DRAWING — path only, NO save/restore (caller manages transform)
// =====================================================================

function shapePath(
  ctx: CanvasRenderingContext2D,
  shape: ShapeType,
  size: number,
) {
  ctx.beginPath();
  switch (shape) {
    case 'triangle':
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.866, size * 0.5);
      ctx.lineTo(-size * 0.866, size * 0.5);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.7, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.7, 0);
      ctx.closePath();
      break;
    case 'circle':
      ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
      break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const px = Math.cos(a) * size * 0.7;
        const py = Math.sin(a) * size * 0.7;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'square':
      ctx.rect(-size * 0.5, -size * 0.5, size, size);
      break;
  }
}

// =====================================================================
// COLOR
// =====================================================================

const FRACTURED_COLD: RGB = [60, 55, 80];
const HEALED_WARM: RGB = [180, 160, 240];
const FRACTURE_LINE: RGB = [100, 50, 50];
const MANDALA_GLOW: RGB = [200, 190, 255];
const SCRUBBER_COLOR: RGB = [100, 90, 140];
const SCRUBBER_HANDLE: RGB = [170, 160, 220];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function RetrocausalAtom({
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
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Single effect: native events + rAF loop ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // Derived dimensions
    const scrubberH = minDim * SCRUBBER_H_FRAC;
    const scrubberBottom = h * SCRUBBER_BOTTOM_FRAC;
    const handleR = minDim * HANDLE_R_FRAC;
    const scrubPad = w * SCRUBBER_PAD_FRAC;
    const tickHalf = minDim * TICK_H_FRAC;

    const scrubY = h - scrubberBottom;
    const scrubLeft = scrubPad;
    const scrubW = w - scrubPad * 2;

    // ── Mutable state ──────────────────────────────────
    const s = {
      elements: createElements(),
      scrubberValue: 0,
      targetScrubberValue: 0,
      isDragging: false,
      healedCount: 0,
      lastHealedCount: 0,
      resolved: false,
      resolveGlow: 0,
      entranceProgress: 0,
      frameCount: 0,
      primaryRgb: parseColor(color),
      accentRgb: parseColor(accentColor),
    };

    // ── Helper: CSS-pixel coords from pointer event ────
    const getPos = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [
        (e.clientX - rect.left) / rect.width * w,
        (e.clientY - rect.top) / rect.height * h,
      ];
    };

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const [px, py] = getPos(e);
      // Check if near scrubber zone (bottom portion of canvas)
      if (py > scrubY - minDim * 0.06) {
        s.isDragging = true;
        s.targetScrubberValue = Math.max(0, Math.min(1, (px - scrubLeft) / scrubW));
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!s.isDragging) return;
      const [px] = getPos(e);
      s.targetScrubberValue = Math.max(0, Math.min(1, (px - scrubLeft) / scrubW));
    };

    const onUp = (e: PointerEvent) => {
      s.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // ── Animation loop ─────────────────────────────────
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      s.primaryRgb = parseColor(p.color);
      s.accentRgb = parseColor(p.accentColor);

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

      // ── Entrance ─────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Scrubber physics ──────────────────────────────
      s.scrubberValue += (s.targetScrubberValue - s.scrubberValue) * 0.08;

      // ── State reporting ───────────────────────────────
      cb.onStateChange?.(s.scrubberValue);

      // ── Element healing ───────────────────────────────
      let healedCount = 0;

      for (const el of s.elements) {
        const healed = s.scrubberValue >= el.healThreshold;
        if (healed) healedCount++;

        const healProgress = healed
          ? Math.min(1, (s.scrubberValue - el.healThreshold) / (1 / ELEMENT_COUNT) * 1.5)
          : 0;

        // Target positions
        const targetX = el.homeX + el.fractureX * (1 - healProgress);
        const targetY = el.homeY + el.fractureY * (1 - healProgress);
        const targetRot = el.fractureRot * (1 - healProgress);
        const targetAlpha = 0.15 + healProgress * 0.55;

        // Drift when fractured
        let driftX = 0;
        let driftY = 0;
        if (!p.reducedMotion && healProgress < 0.5) {
          driftX = Math.sin(s.frameCount * el.driftSpeed + el.driftPhase) * 0.005 * (1 - healProgress);
          driftY = Math.cos(s.frameCount * el.driftSpeed * 1.3 + el.driftPhase) * 0.003 * (1 - healProgress);
        }

        // Smooth interpolation
        const rate = p.reducedMotion ? 0.3 : HEAL_SMOOTH;
        el.currentX += (targetX + driftX - el.currentX) * rate;
        el.currentY += (targetY + driftY - el.currentY) * rate;
        el.currentRot += (targetRot - el.currentRot) * rate;
        el.currentAlpha += (targetAlpha - el.currentAlpha) * rate;
      }

      // Snap haptics on healing
      if (healedCount > s.lastHealedCount) {
        cb.onHaptic('drag_snap');
        cb.onHaptic('step_advance');
      }
      s.lastHealedCount = healedCount;
      s.healedCount = healedCount;

      // Resolution
      if (healedCount >= ELEMENT_COUNT && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }
      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.006);
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([5, 4, 12], s.primaryRgb, 0.03);
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Time arrow (very subtle gradient left=past, right=present)
      const timeGrad = ctx.createLinearGradient(0, 0, w, 0);
      timeGrad.addColorStop(0, rgba(FRACTURED_COLD, 0.015 * entrance));
      timeGrad.addColorStop(0.5, rgba(lerpColor(FRACTURED_COLD, HEALED_WARM, 0.5), 0));
      timeGrad.addColorStop(1, rgba(lerpColor(HEALED_WARM, s.primaryRgb, 0.3), 0.015 * entrance));
      ctx.fillStyle = timeGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Geometric elements ────────────────────────────
      for (const el of s.elements) {
        const px = el.currentX * w;
        const py = el.currentY * h;
        const size = el.size * minDim;
        const healT = Math.min(1, Math.max(0,
          s.scrubberValue >= el.healThreshold
            ? (s.scrubberValue - el.healThreshold) / (1 / ELEMENT_COUNT) * 1.5
            : 0));

        // Color: cold (fractured) → warm (healed)
        const elColor = lerpColor(
          lerpColor(FRACTURED_COLD, s.primaryRgb, 0.05),
          lerpColor(HEALED_WARM, s.accentRgb, 0.2),
          healT,
        );

        // Draw shape (fill + stroke inside same transform)
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(el.currentRot);

        shapePath(ctx, el.shape, size);
        ctx.fillStyle = rgba(elColor, el.currentAlpha * entrance);
        ctx.fill();

        shapePath(ctx, el.shape, size);
        ctx.strokeStyle = rgba(elColor, (el.currentAlpha * 0.4 + healT * 0.3) * entrance);
        ctx.lineWidth = minDim * 0.001 + healT * minDim * 0.001;
        ctx.stroke();

        // Fracture lines (visible when broken, fade when healed)
        if (healT < 0.8) {
          const fractureAlpha = (1 - healT) * 0.15 * entrance;
          const lineLen = size * 0.8;
          const fractColor = lerpColor(FRACTURE_LINE, s.primaryRgb, 0.15);
          // Still in translated/rotated space — draw relative to origin
          ctx.rotate(el.index * 0.7);
          ctx.beginPath();
          ctx.moveTo(-lineLen * 0.5, -lineLen * 0.3);
          ctx.lineTo(lineLen * 0.3, lineLen * 0.4);
          ctx.strokeStyle = rgba(fractColor, fractureAlpha);
          ctx.lineWidth = minDim * 0.001;
          ctx.stroke();
        }

        ctx.restore();

        // Healing glow (no transform needed — uses absolute px/py)
        if (healT > 0.5) {
          const glowR = size * 2;
          const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
          const gColor = lerpColor(HEALED_WARM, s.accentRgb, 0.2);
          glowGrad.addColorStop(0, rgba(gColor, (healT - 0.5) * 0.05 * entrance));
          glowGrad.addColorStop(1, rgba(gColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2);
        }
      }

      // ── Mandala connections (appear as elements heal) ──
      if (s.healedCount > 4) {
        const connAlpha = (s.healedCount / ELEMENT_COUNT) * 0.06 * entrance;
        const mColor = lerpColor(MANDALA_GLOW, s.primaryRgb, 0.15);
        ctx.lineWidth = minDim * 0.0008;

        const healedEls = s.elements.filter(el =>
          s.scrubberValue >= el.healThreshold &&
          Math.abs(el.currentX - el.homeX) < 0.01,
        );

        for (let i = 0; i < healedEls.length; i++) {
          const a = healedEls[i];
          for (let j = i + 1; j < healedEls.length; j++) {
            const b = healedEls[j];
            const dx = (b.homeX - a.homeX) * w;
            const dy = (b.homeY - a.homeY) * h;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > minDim * 0.15) continue;

            ctx.beginPath();
            ctx.moveTo(a.currentX * w, a.currentY * h);
            ctx.lineTo(b.currentX * w, b.currentY * h);
            ctx.strokeStyle = rgba(mColor, connAlpha * (1 - dist / (minDim * 0.15)));
            ctx.stroke();
          }
        }
      }

      // ── Resolution glow ───────────────────────────────
      if (s.resolveGlow > 0) {
        const rPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.02));
        const rR = minDim * 0.25;
        const rGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, rR);
        rGrad.addColorStop(0, rgba(MANDALA_GLOW, s.resolveGlow * 0.08 * rPulse * entrance));
        rGrad.addColorStop(0.5, rgba(s.accentRgb, s.resolveGlow * 0.02 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Timeline scrubber ─────────────────────────────
      // Track
      ctx.fillStyle = rgba(lerpColor(SCRUBBER_COLOR, s.primaryRgb, 0.1), 0.1 * entrance);
      ctx.fillRect(scrubLeft, scrubY - scrubberH / 2, scrubW, scrubberH);

      // Filled portion
      const fillW = s.scrubberValue * scrubW;
      const fillGrad = ctx.createLinearGradient(scrubLeft, 0, scrubLeft + fillW, 0);
      const fColor = lerpColor(SCRUBBER_HANDLE, s.accentRgb, 0.2);
      fillGrad.addColorStop(0, rgba(FRACTURED_COLD, 0.15 * entrance));
      fillGrad.addColorStop(1, rgba(fColor, 0.25 * entrance));
      ctx.fillStyle = fillGrad;
      ctx.fillRect(scrubLeft, scrubY - scrubberH / 2, fillW, scrubberH);

      // Handle
      const handleX = scrubLeft + s.scrubberValue * scrubW;
      const hColor = lerpColor(SCRUBBER_HANDLE, s.accentRgb, 0.2);

      // Handle glow
      const hGlowGrad = ctx.createRadialGradient(handleX, scrubY, 0, handleX, scrubY, handleR * 3);
      hGlowGrad.addColorStop(0, rgba(hColor, 0.1 * entrance));
      hGlowGrad.addColorStop(1, rgba(hColor, 0));
      ctx.fillStyle = hGlowGrad;
      ctx.fillRect(handleX - handleR * 3, scrubY - handleR * 3, handleR * 6, handleR * 6);

      // Handle body
      ctx.beginPath();
      ctx.arc(handleX, scrubY, handleR, 0, Math.PI * 2);
      const hGrad = ctx.createRadialGradient(
        handleX - handleR * 0.2, scrubY - handleR * 0.2, 0,
        handleX, scrubY, handleR,
      );
      hGrad.addColorStop(0, rgba(lerpColor(hColor, [255, 255, 255], 0.2), 0.5 * entrance));
      hGrad.addColorStop(0.6, rgba(hColor, 0.35 * entrance));
      hGrad.addColorStop(1, rgba(hColor, 0.1 * entrance));
      ctx.fillStyle = hGrad;
      ctx.fill();

      // Tick marks for healing milestones
      for (let i = 0; i < ELEMENT_COUNT; i++) {
        const el = s.elements[i];
        const tickX = scrubLeft + el.healThreshold * scrubW;
        const tickAlpha = s.scrubberValue >= el.healThreshold ? 0.15 : 0.04;
        ctx.beginPath();
        ctx.moveTo(tickX, scrubY - tickHalf);
        ctx.lineTo(tickX, scrubY + tickHalf);
        ctx.strokeStyle = rgba(hColor, tickAlpha * entrance);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
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
          cursor: 'ew-resize',
        }}
      />
    </div>
  );
}