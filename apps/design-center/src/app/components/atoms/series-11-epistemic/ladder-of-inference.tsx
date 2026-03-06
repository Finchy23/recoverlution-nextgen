/**
 * ATOM 102: THE LADDER OF INFERENCE ENGINE
 * =========================================
 * Series 11 — Epistemic Constructs · Position 2
 *
 * You are not dying; someone just didn't reply to an email.
 * This atom walks the user backward from their catastrophic
 * conclusion down to the actual, boring data that triggered it.
 *
 * PHYSICS:
 *   - Towering stack of 7 inference layers, top = conclusion
 *   - Swipe down to crumble the topmost surviving layer
 *   - Crumbled layers fragment into falling particles
 *   - Each layer is progressively smaller toward the base
 *   - The final surviving block (Raw Data) glows peacefully
 *   - Breath modulates the gentle sway of the standing tower
 *
 * INTERACTION:
 *   Swipe down → crumbles the topmost surviving layer
 *   Tap        → highlights the topmost layer (pre-crumble)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static pre-deconstructed view showing only the base
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, easeOutExpo, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// LAYER DEFINITIONS
// =====================================================================

const LAYER_LABELS = [
  'Raw Data',         // 0 — bottom, the survivor
  'Selected Data',    // 1
  'Interpreted',      // 2
  'Assumptions',      // 3
  'Conclusions',      // 4
  'Beliefs',          // 5
  'Actions',          // 6 — top, most precarious
];

const LAYER_COUNT = LAYER_LABELS.length;

// =====================================================================
// DEBRIS PARTICLE
// =====================================================================

interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: RGB;
  rotation: number;
  rotSpeed: number;
}

function spawnDebris(
  cx: number,
  layerY: number,
  layerW: number,
  layerH: number,
  minDim: number,
  color: RGB,
): Debris[] {
  const count = 18 + Math.floor(Math.random() * 12);
  const particles: Debris[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: cx + (Math.random() - 0.5) * layerW,
      y: layerY + Math.random() * layerH,
      vx: (Math.random() - 0.5) * minDim * 0.008,
      vy: minDim * (0.001 + Math.random() * 0.004),
      size: minDim * (0.002 + Math.random() * 0.006),
      alpha: 0.6 + Math.random() * 0.4,
      color,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
    });
  }
  return particles;
}

// =====================================================================
// SWIPE DETECTION CONSTANTS
// =====================================================================

const SWIPE_MIN_DIST = 30;
const SWIPE_MAX_MS = 600;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function LadderOfInferenceAtom({
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

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    // How many layers have been destroyed (0 = all standing, 6 = only base remains)
    destroyed: 0,
    // Per-layer crumble animation progress (0 = solid, 1 = fully gone)
    crumbleProgress: new Array(LAYER_COUNT).fill(0) as number[],
    // Active crumble target (-1 = none)
    crumblingIndex: -1,
    debris: [] as Debris[],
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    // Swipe tracking
    pointerDown: false,
    pointerStartX: 0,
    pointerStartY: 0,
    pointerStartTime: 0,
    // Color cache
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    // Highlight
    highlightAlpha: 0,
    // Completion fired
    completionFired: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ────────────────────────────────────────
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

      // ── Entrance ──────────────────────────────────────
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Crumble animation ─────────────────────────────
      if (s.crumblingIndex >= 0 && !p.reducedMotion) {
        const ci = s.crumblingIndex;
        s.crumbleProgress[ci] = Math.min(1, s.crumbleProgress[ci] + 0.04);
        if (s.crumbleProgress[ci] >= 1) {
          s.crumblingIndex = -1;
        }
      }

      // ── Highlight decay ───────────────────────────────
      s.highlightAlpha *= 0.94;

      // ── Color computation ─────────────────────────────
      const baseColor: RGB = s.primaryRgb;
      const topColor: RGB = s.accentRgb;

      const ms = motionScale(p.reducedMotion);

      // ── Tower geometry ────────────────────────────────
      const towerBaseY = cy + minDim * 0.28;
      const layerH = minDim * 0.055;
      const layerGap = minDim * 0.008;
      const baseW = minDim * 0.12;
      const topW = minDim * 0.38;

      // ── Layer 0: Radial glow background ───────────────
      const glowR = minDim * (0.4 + breath * 0.04 * ms) * entrance;
      const glowColor = lerpColor(baseColor, topColor, 0.3);
      const glowAlpha = ELEMENT_ALPHA.glow.min + (s.destroyed / (LAYER_COUNT - 1)) * (ELEMENT_ALPHA.glow.max - ELEMENT_ALPHA.glow.min);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(glowColor, glowAlpha * entrance));
      bgGrad.addColorStop(0.6, rgba(glowColor, glowAlpha * 0.25 * entrance));
      bgGrad.addColorStop(1, rgba(glowColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Draw layers (bottom to top) ───────────────────
      for (let i = 0; i < LAYER_COUNT; i++) {
        const t = i / (LAYER_COUNT - 1); // 0=bottom, 1=top
        const layerW = baseW + (topW - baseW) * t;
        const layerY = towerBaseY - (i + 1) * (layerH + layerGap);

        // Breath sway — upper layers sway more
        const sway = p.reducedMotion ? 0 : Math.sin(s.frameCount * 0.015 * ms + i * 0.7) * minDim * 0.003 * t * (1 + breath * 0.5);

        const layerColor = lerpColor(baseColor, topColor, t);
        const crumble = s.crumbleProgress[i];

        if (crumble >= 1) continue; // fully destroyed

        const layerAlpha = (1 - crumble) *
          (ELEMENT_ALPHA.primary.min + entrance * (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min));

        // Crumble offset: layer drops and fades
        const crumbleOffsetY = crumble * minDim * 0.06 * easeOutCubic(crumble);
        const crumbleScale = 1 - crumble * 0.4;

        const lx = cx + sway - (layerW * crumbleScale) / 2;
        const ly = (layerY + crumbleOffsetY) * entrance + (1 - entrance) * cy;
        const lw = layerW * crumbleScale;
        const lh = layerH;

        // Rounded rect layer
        const r = minDim * 0.004;
        ctx.beginPath();
        ctx.moveTo(lx + r, ly);
        ctx.lineTo(lx + lw - r, ly);
        ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + r);
        ctx.lineTo(lx + lw, ly + lh - r);
        ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - r, ly + lh);
        ctx.lineTo(lx + r, ly + lh);
        ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - r);
        ctx.lineTo(lx, ly + r);
        ctx.quadraticCurveTo(lx, ly, lx + r, ly);
        ctx.closePath();

        ctx.fillStyle = rgba(layerColor, layerAlpha);
        ctx.fill();

        // Subtle border
        ctx.strokeStyle = rgba(layerColor, layerAlpha * 0.6);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();

        // Highlight on topmost surviving layer
        const isTopSurviving = i === (LAYER_COUNT - 1 - s.destroyed);
        if (isTopSurviving && s.highlightAlpha > 0.01 && crumble < 0.01) {
          ctx.fillStyle = rgba(lerpColor(baseColor, [255, 255, 255] as RGB, 0.85), s.highlightAlpha * 0.04 * entrance);
          ctx.fill();
        }

        // Layer label (very subtle)
        if (crumble < 0.3 && entrance > 0.5) {
          const fontSize = Math.max(8, minDim * 0.016);
          ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(layerColor, ELEMENT_ALPHA.text.min * entrance * (1 - crumble));
          ctx.fillText(LAYER_LABELS[i], cx + sway, ly + lh / 2);
        }
      }

      // ── Draw connecting scaffold lines ────────────────
      for (let i = 0; i < LAYER_COUNT - 1; i++) {
        if (s.crumbleProgress[i] >= 1 || s.crumbleProgress[i + 1] >= 1) continue;
        const t0 = i / (LAYER_COUNT - 1);
        const t1 = (i + 1) / (LAYER_COUNT - 1);
        const y0 = towerBaseY - (i + 1) * (layerH + layerGap);
        const y1 = towerBaseY - (i + 2) * (layerH + layerGap) + layerH;
        const scaffoldColor = lerpColor(baseColor, topColor, (t0 + t1) / 2);
        const scaffoldAlpha = ELEMENT_ALPHA.tertiary.max * entrance *
          (1 - Math.max(s.crumbleProgress[i], s.crumbleProgress[i + 1]));

        // Two thin lines on the sides
        const w0 = (baseW + (topW - baseW) * t0) / 2;
        const w1 = (baseW + (topW - baseW) * t1) / 2;

        ctx.beginPath();
        ctx.moveTo(cx - w0, y0 * entrance + (1 - entrance) * cy);
        ctx.lineTo(cx - w1, y1 * entrance + (1 - entrance) * cy);
        ctx.strokeStyle = rgba(scaffoldColor, scaffoldAlpha);
        ctx.lineWidth = minDim * 0.0004;
        ctx.setLineDash([minDim * 0.003, minDim * 0.006]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + w0, y0 * entrance + (1 - entrance) * cy);
        ctx.lineTo(cx + w1, y1 * entrance + (1 - entrance) * cy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── Draw debris particles ─────────────────────────
      if (!p.reducedMotion) {
        for (let i = s.debris.length - 1; i >= 0; i--) {
          const d = s.debris[i];
          d.x += d.vx;
          d.y += d.vy;
          d.vy += minDim * 0.00015; // gravity
          d.vx *= 0.99;
          d.alpha -= 0.008;
          d.rotation += d.rotSpeed;

          if (d.alpha <= 0 || d.y > h + 20) {
            s.debris.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(d.rotation);
          ctx.fillStyle = rgba(d.color, d.alpha * ELEMENT_ALPHA.primary.max * entrance);
          ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
          ctx.restore();
        }
      }

      // ── Final base glow (when all upper layers destroyed) ──
      if (s.destroyed >= LAYER_COUNT - 1) {
        const baseGlowR = minDim * (0.15 + breath * 0.03 * ms);
        const baseGlowY = towerBaseY - (layerH + layerGap);
        const baseAlpha = ELEMENT_ALPHA.glow.max * entrance;
        const bGrad = ctx.createRadialGradient(cx, baseGlowY, 0, cx, baseGlowY, baseGlowR);
        bGrad.addColorStop(0, rgba(baseColor, baseAlpha));
        bGrad.addColorStop(0.5, rgba(baseColor, baseAlpha * 0.3));
        bGrad.addColorStop(1, rgba(baseColor, 0));
        ctx.fillStyle = bGrad;
        ctx.fillRect(cx - baseGlowR, baseGlowY - baseGlowR, baseGlowR * 2, baseGlowR * 2);
      }

      // ── Report state ──────────────────────────────────
      cb.onStateChange?.(s.destroyed / (LAYER_COUNT - 1));

      // ── Completion ────────────────────────────────────
      if (s.destroyed >= LAYER_COUNT - 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointerDown = true;
      s.pointerStartX = e.clientX;
      s.pointerStartY = e.clientY;
      s.pointerStartTime = performance.now();

      // Tap highlight on topmost surviving layer
      const topIndex = LAYER_COUNT - 1 - s.destroyed;
      if (topIndex >= 0 && s.crumblingIndex < 0) {
        s.highlightAlpha = 1;
        callbacksRef.current.onHaptic('tap');
      }

      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (_e: PointerEvent) => {
      // swipe detection happens on up
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerDown) return;
      s.pointerDown = false;
      canvas.releasePointerCapture(e.pointerId);

      const dx = e.clientX - s.pointerStartX;
      const dy = e.clientY - s.pointerStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = performance.now() - s.pointerStartTime;

      // Detect downward swipe
      if (dist > SWIPE_MIN_DIST && elapsed < SWIPE_MAX_MS && dy > Math.abs(dx)) {
        // Trigger crumble of topmost surviving layer
        const topIndex = LAYER_COUNT - 1 - s.destroyed;
        if (topIndex > 0 && s.crumblingIndex < 0) {
          s.crumblingIndex = topIndex;
          s.destroyed++;

          // Spawn debris
          const minDim = Math.min(viewport.width, viewport.height);
          const towerBaseY = viewport.height / 2 + minDim * 0.28;
          const layerH2 = minDim * 0.055;
          const layerGap2 = minDim * 0.008;
          const t = topIndex / (LAYER_COUNT - 1);
          const baseW2 = minDim * 0.12;
          const topW2 = minDim * 0.38;
          const layerW = baseW2 + (topW2 - baseW2) * t;
          const layerY = towerBaseY - (topIndex + 1) * (layerH2 + layerGap2);
          const layerColor = lerpColor(s.primaryRgb, s.accentRgb, t);

          s.debris.push(...spawnDebris(viewport.width / 2, layerY, layerW, layerH2, minDim, layerColor));

          callbacksRef.current.onHaptic('swipe_commit');
          callbacksRef.current.onHaptic('step_advance');
        }
      }
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}