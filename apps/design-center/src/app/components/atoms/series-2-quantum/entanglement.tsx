/**
 * ATOM 015: THE ENTANGLEMENT ENGINE
 * ===================================
 * Series 2 — Quantum Mechanics · Position 5
 *
 * Distance and separation are illusions. What you heal in
 * yourself, you instantly heal in the network. Two particles
 * sit on opposite sides of absolute darkness. Drag one —
 * the other mirrors EXACTLY, inverted. The mathematical
 * precision IS the point. They are the same entity.
 *
 * PHYSICS:
 *   - Two particles with perfect inverted coordinate mirroring
 *   - Quantum field lines (Bezier curves) connecting them
 *   - Field luminosity proportional to distance (more = brighter)
 *   - Breath amplitude reveals latent field structure
 *   - Drag haptic snaps when particles align on axes
 *   - When particles overlap: merge glow, unified radiance
 *   - Idle: particles pulse in sync (already entangled)
 *
 * INTERACTION:
 *   Drag (either particle) → the other mirrors (-x, -y)
 *   Observable             → sync pulse, field shimmer
 *   Breath (modulates)     → reveals field structure depth
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static positions, no field shimmer
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Particle radius as fraction of minDim */
const PARTICLE_R_FRAC = 0.022;
/** Particle glow multiplier */
const GLOW_MULT = 6;
/** Number of quantum field lines */
const FIELD_LINE_COUNT = 7;
/** Field line control point variance */
const FIELD_VARIANCE = 0.35;
/** Merge distance threshold (fraction of min dimension) */
const MERGE_THRESHOLD_FRAC = 0.04;
/** Axis snap distance for haptic (fraction of viewport) */
const AXIS_SNAP_FRAC = 0.02;
/** Idle orbit radius (fraction of min dimension) */
const IDLE_ORBIT_FRAC = 0.15;
/** Idle orbit speed */
const IDLE_ORBIT_SPEED = 0.005;

// =====================================================================
// COLOR
// =====================================================================

const SELF_WARM: RGB = [220, 160, 120];
const OTHER_COOL: RGB = [120, 160, 220];
const FIELD_COLOR: RGB = [160, 150, 200];
const MERGE_COLOR: RGB = [230, 225, 255];
const SYNC_PULSE: RGB = [180, 170, 220];

// =====================================================================
// FIELD LINE GENERATION
// =====================================================================

interface FieldLine {
  offset: number;
  width: number;
  brightness: number;
  shimmerPhase: number;
  shimmerSpeed: number;
}

function createFieldLines(): FieldLine[] {
  const lines: FieldLine[] = [];
  for (let i = 0; i < FIELD_LINE_COUNT; i++) {
    const t = FIELD_LINE_COUNT === 1 ? 0 : (i / (FIELD_LINE_COUNT - 1)) * 2 - 1;
    lines.push({
      offset: t * FIELD_VARIANCE + (Math.random() - 0.5) * 0.1,
      width: 0.3 + Math.random() * 0.8,
      brightness: 0.3 + Math.random() * 0.7,
      shimmerPhase: Math.random() * Math.PI * 2,
      shimmerSpeed: 0.01 + Math.random() * 0.02,
    });
  }
  return lines;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function EntanglementAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange };
  }, [onHaptic, onStateChange]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Single effect: native events + rAF loop ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Mutable state ──────────────────────────────────
    const s = {
      fieldLines: createFieldLines(),
      selfX: 0.3,
      selfY: 0.5,
      otherX: 0.7,
      otherY: 0.5,
      smoothSelfX: 0.3,
      smoothSelfY: 0.5,
      smoothOtherX: 0.7,
      smoothOtherY: 0.5,
      isDragging: false,
      dragTarget: 'self' as 'self' | 'other',
      dragOffsetX: 0,
      dragOffsetY: 0,
      // Idle orbit
      idlePhase: 0,
      lastSnapX: false,
      lastSnapY: false,
      syncPulsePhase: 0,
      entranceProgress: 0,
      frameCount: 0,
      primaryRgb: parseColor(color),
      accentRgb: parseColor(accentColor),
    };

    // ── Helper: get normalised pointer position ────────
    const getNorm = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height,
      ];
    };

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const [nx, ny] = getNorm(e);

      // Pixel-space distances
      const dSelf = Math.sqrt(
        ((nx - s.smoothSelfX) * w) ** 2 + ((ny - s.smoothSelfY) * h) ** 2,
      );
      const dOther = Math.sqrt(
        ((nx - s.smoothOtherX) * w) ** 2 + ((ny - s.smoothOtherY) * h) ** 2,
      );

      s.isDragging = true;
      s.dragTarget = dSelf <= dOther ? 'self' : 'other';

      if (s.dragTarget === 'self') {
        s.dragOffsetX = nx - s.smoothSelfX;
        s.dragOffsetY = ny - s.smoothSelfY;
      } else {
        s.dragOffsetX = nx - s.smoothOtherX;
        s.dragOffsetY = ny - s.smoothOtherY;
      }

      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('tap');
    };

    const onMove = (e: PointerEvent) => {
      if (!s.isDragging) return;
      const [nx, ny] = getNorm(e);

      if (s.dragTarget === 'self') {
        s.selfX = Math.max(0.05, Math.min(0.95, nx - s.dragOffsetX));
        s.selfY = Math.max(0.05, Math.min(0.95, ny - s.dragOffsetY));
        s.otherX = 1 - s.selfX;
        s.otherY = 1 - s.selfY;
      } else {
        s.otherX = Math.max(0.05, Math.min(0.95, nx - s.dragOffsetX));
        s.otherY = Math.max(0.05, Math.min(0.95, ny - s.dragOffsetY));
        s.selfX = 1 - s.otherX;
        s.selfY = 1 - s.otherY;
      }
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

      // Sync colors from props
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

      const breath = p.breathAmplitude;
      const particleR = minDim * PARTICLE_R_FRAC;

      // ── Entrance ──────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Idle orbit (when not dragging) ────────────
      if (!s.isDragging && !p.reducedMotion) {
        s.idlePhase += IDLE_ORBIT_SPEED;
        const orbitR = IDLE_ORBIT_FRAC;
        s.selfX = 0.3 + Math.cos(s.idlePhase) * orbitR * 0.5;
        s.selfY = 0.5 + Math.sin(s.idlePhase) * orbitR * 0.3;
        s.otherX = 1 - s.selfX;
        s.otherY = 1 - s.selfY;
      }

      // ── Smooth positions ──────────────────────────
      const smoothing = s.isDragging ? 0.3 : 0.06;
      s.smoothSelfX += (s.selfX - s.smoothSelfX) * smoothing;
      s.smoothSelfY += (s.selfY - s.smoothSelfY) * smoothing;
      s.smoothOtherX += (s.otherX - s.smoothOtherX) * smoothing;
      s.smoothOtherY += (s.otherY - s.smoothOtherY) * smoothing;

      const sx = s.smoothSelfX * w;
      const sy = s.smoothSelfY * h;
      const ox = s.smoothOtherX * w;
      const oy = s.smoothOtherY * h;

      // ── Distance metrics ──────────────────────────
      const dx = ox - sx;
      const dy = oy - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / Math.sqrt(w * w + h * h);
      const mergeThreshold = minDim * MERGE_THRESHOLD_FRAC;
      const isMerged = dist < mergeThreshold;

      // ── Axis snap haptics ─────────────────────────
      if (s.isDragging) {
        const activeX = s.dragTarget === 'self' ? s.selfX : s.otherX;
        const activeY = s.dragTarget === 'self' ? s.selfY : s.otherY;
        const onVerticalAxis = Math.abs(activeX - 0.5) < AXIS_SNAP_FRAC;
        const onHorizontalAxis = Math.abs(activeY - 0.5) < AXIS_SNAP_FRAC;

        if (onVerticalAxis && !s.lastSnapX) {
          cb.onHaptic('drag_snap');
          s.lastSnapX = true;
        } else if (!onVerticalAxis) {
          s.lastSnapX = false;
        }

        if (onHorizontalAxis && !s.lastSnapY) {
          cb.onHaptic('drag_snap');
          s.lastSnapY = true;
        } else if (!onHorizontalAxis) {
          s.lastSnapY = false;
        }
      }

      // ── Sync pulse ────────────────────────────────
      if (!p.reducedMotion) {
        s.syncPulsePhase += 0.025;
      }
      const syncPulse = Math.sin(s.syncPulsePhase);

      // State reporting
      cb.onStateChange?.(normDist);

      // ══════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════

      // ── Background ────────────────────────────────
      const bgBase = lerpColor([3, 2, 8], s.primaryRgb, 0.02);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle center axis markers
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.strokeStyle = rgba(FIELD_COLOR, 0.015 * entrance);
      ctx.lineWidth = minDim * 0.001;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // ── Quantum field lines ───────────────────────
      const fieldVisibility = 0.3 + breath * 0.5 + (s.isDragging ? 0.2 : 0);
      const fieldAlpha = normDist * fieldVisibility * entrance;

      if (fieldAlpha > 0.005) {
        const midX = (sx + ox) / 2;
        const midY = (sy + oy) / 2;
        const perpX = -dy / (dist || 1);
        const perpY = dx / (dist || 1);

        for (const line of s.fieldLines) {
          const shimmer = p.reducedMotion ? 0.7 :
            0.5 + 0.5 * Math.sin(s.frameCount * line.shimmerSpeed + line.shimmerPhase);

          const lineAlpha = fieldAlpha * line.brightness * shimmer * 0.15;
          if (lineAlpha < 0.003) continue;

          const cpOffset = line.offset * dist * 0.4;
          const cpX = midX + perpX * cpOffset;
          const cpY = midY + perpY * cpOffset;

          const fColor = lerpColor(FIELD_COLOR, s.primaryRgb, 0.15);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(cpX, cpY, ox, oy);
          ctx.strokeStyle = rgba(fColor, lineAlpha);
          ctx.lineWidth = line.width * (minDim * 0.002);
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Central field node
        const midR = minDim * (0.008 + breath * 0.015);
        const midGrad = ctx.createRadialGradient(midX, midY, 0, midX, midY, midR);
        midGrad.addColorStop(0, rgba(FIELD_COLOR, fieldAlpha * 0.2));
        midGrad.addColorStop(1, rgba(FIELD_COLOR, 0));
        ctx.fillStyle = midGrad;
        ctx.fillRect(midX - midR, midY - midR, midR * 2, midR * 2);
      }

      // ── Merge glow ────────────────────────────────
      if (isMerged) {
        const mergeR = minDim * 0.08;
        const mergeX = (sx + ox) / 2;
        const mergeY = (sy + oy) / 2;
        const mGrad = ctx.createRadialGradient(mergeX, mergeY, 0, mergeX, mergeY, mergeR);
        mGrad.addColorStop(0, rgba(MERGE_COLOR, 0.35 * entrance));
        mGrad.addColorStop(0.3, rgba(lerpColor(SELF_WARM, OTHER_COOL, 0.5), 0.15 * entrance));
        mGrad.addColorStop(1, rgba(MERGE_COLOR, 0));
        ctx.fillStyle = mGrad;
        ctx.fillRect(mergeX - mergeR, mergeY - mergeR, mergeR * 2, mergeR * 2);
      }

      // ── Self particle (warm) ──────────────────────
      const selfColor = lerpColor(SELF_WARM, s.accentRgb, 0.15);
      const selfPulse = 1 + (p.reducedMotion ? 0 : syncPulse * 0.08);
      const selfR = particleR * selfPulse;

      // Glow
      const selfGlowR = selfR * GLOW_MULT;
      const selfGlowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, selfGlowR);
      selfGlowGrad.addColorStop(0, rgba(selfColor, 0.12 * entrance));
      selfGlowGrad.addColorStop(0.3, rgba(selfColor, 0.04 * entrance));
      selfGlowGrad.addColorStop(1, rgba(selfColor, 0));
      ctx.fillStyle = selfGlowGrad;
      ctx.fillRect(sx - selfGlowR, sy - selfGlowR, selfGlowR * 2, selfGlowR * 2);

      // Body
      const selfGrad = ctx.createRadialGradient(
        sx - selfR * 0.2, sy - selfR * 0.2, selfR * 0.1,
        sx, sy, selfR,
      );
      selfGrad.addColorStop(0, rgba(lerpColor(selfColor, [255, 255, 255], 0.25), 0.7 * entrance));
      selfGrad.addColorStop(0.6, rgba(selfColor, 0.5 * entrance));
      selfGrad.addColorStop(1, rgba(selfColor, 0.1 * entrance));
      ctx.beginPath();
      ctx.arc(sx, sy, selfR, 0, Math.PI * 2);
      ctx.fillStyle = selfGrad;
      ctx.fill();

      // ── Other particle (cool) ─────────────────────
      const otherColor = lerpColor(OTHER_COOL, s.primaryRgb, 0.15);
      const otherPulse = 1 + (p.reducedMotion ? 0 : syncPulse * 0.08);
      const otherR = particleR * otherPulse;

      // Glow
      const otherGlowR = otherR * GLOW_MULT;
      const otherGlowGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, otherGlowR);
      otherGlowGrad.addColorStop(0, rgba(otherColor, 0.12 * entrance));
      otherGlowGrad.addColorStop(0.3, rgba(otherColor, 0.04 * entrance));
      otherGlowGrad.addColorStop(1, rgba(otherColor, 0));
      ctx.fillStyle = otherGlowGrad;
      ctx.fillRect(ox - otherGlowR, oy - otherGlowR, otherGlowR * 2, otherGlowR * 2);

      // Body
      const otherGrad = ctx.createRadialGradient(
        ox - otherR * 0.2, oy - otherR * 0.2, otherR * 0.1,
        ox, oy, otherR,
      );
      otherGrad.addColorStop(0, rgba(lerpColor(otherColor, [255, 255, 255], 0.25), 0.7 * entrance));
      otherGrad.addColorStop(0.6, rgba(otherColor, 0.5 * entrance));
      otherGrad.addColorStop(1, rgba(otherColor, 0.1 * entrance));
      ctx.beginPath();
      ctx.arc(ox, oy, otherR, 0, Math.PI * 2);
      ctx.fillStyle = otherGrad;
      ctx.fill();

      // ── Sync heartbeat rings ──────────────────────
      if (!p.reducedMotion && syncPulse > 0.7) {
        const ringAlpha = (syncPulse - 0.7) * 0.15 * entrance;
        const ringR = particleR * 2 + (syncPulse - 0.7) * minDim * 0.03;
        const ringColor = lerpColor(SYNC_PULSE, s.accentRgb, 0.15);

        ctx.beginPath();
        ctx.arc(sx, sy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ringAlpha);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ox, oy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ringAlpha);
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
          cursor: 'grab',
        }}
      />
    </div>
  );
}