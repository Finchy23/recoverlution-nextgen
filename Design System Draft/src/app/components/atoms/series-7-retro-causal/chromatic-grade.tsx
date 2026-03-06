/**
 * ATOM 062: THE CHROMATIC GRADE ENGINE
 * ======================================
 * Series 7 — Retro-Causal · Position 2
 *
 * Trauma desaturates memory, making it cold, isolated, and dead.
 * This atom allows the user to manually inject warmth and colour
 * back into their own history. Touch radiates warmth outward —
 * the longer you hold, the more the cold grey becomes golden-hour.
 *
 * PHYSICS:
 *   - Central "memory card" rendered in extreme desaturation (cold blue-grey)
 *   - User touch creates a radial warmth mask (gaussian falloff)
 *   - Multiple touch zones accumulate and merge
 *   - Composite canvas technique: cold scene + warm scene clipped to mask
 *   - Coverage tracking → resolution when >90% warm
 *
 * INTERACTION:
 *   Hold / Drag → warmth radiates from touch point
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Mask expansion is instant, no gradual growth
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const COLD_BG: RGB = [45, 55, 75];
const COLD_SHAPE_1: RGB = [60, 65, 80];
const COLD_SHAPE_2: RGB = [35, 40, 55];
const COLD_SHAPE_3: RGB = [50, 55, 70];

const WARM_BG: RGB = [200, 160, 100];
const WARM_SHAPE_1: RGB = [220, 180, 120];
const WARM_SHAPE_2: RGB = [180, 140, 90];
const WARM_SHAPE_3: RGB = [210, 170, 110];

const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const MAX_TOUCH_RADIUS_RATIO = 0.35; // of minDim
const RADIUS_GROW_SPEED = 2.5; // px per frame
const RADIUS_GROW_SPEED_REDUCED = 999; // instant in reduced motion
const CARD_W_RATIO = 0.7;
const CARD_H_RATIO = 0.5;
const CARD_RADIUS_RATIO = 0.018; // of minDim

// =====================================================================
// WARM ZONE TRACKER
// =====================================================================

interface WarmZone {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  growing: boolean;
}

// =====================================================================
// MEMORY CARD SHAPES — abstract geometric "memory" elements
// =====================================================================

interface MemoryShape {
  type: 'circle' | 'rect' | 'line';
  x: number; y: number;
  w: number; h: number;
  r?: number;
}

function generateMemoryShapes(cardX: number, cardY: number, cardW: number, cardH: number): MemoryShape[] {
  return [
    // Large circle (person silhouette suggestion)
    { type: 'circle', x: cardX + cardW * 0.3, y: cardY + cardH * 0.4, w: 0, h: 0, r: cardW * 0.1 },
    // Smaller circle
    { type: 'circle', x: cardX + cardW * 0.3, y: cardY + cardH * 0.22, w: 0, h: 0, r: cardW * 0.05 },
    // Horizontal line (horizon)
    { type: 'line', x: cardX + cardW * 0.1, y: cardY + cardH * 0.65, w: cardW * 0.8, h: 0 },
    // Rect block (building/structure)
    { type: 'rect', x: cardX + cardW * 0.55, y: cardY + cardH * 0.3, w: cardW * 0.15, h: cardH * 0.35 },
    // Rect block 2
    { type: 'rect', x: cardX + cardW * 0.72, y: cardY + cardH * 0.4, w: cardW * 0.1, h: cardH * 0.25 },
    // Small accent circles
    { type: 'circle', x: cardX + cardW * 0.15, y: cardY + cardH * 0.75, w: 0, h: 0, r: cardW * 0.025 },
    { type: 'circle', x: cardX + cardW * 0.85, y: cardY + cardH * 0.2, w: 0, h: 0, r: cardW * 0.02 },
  ];
}

function drawMemoryScene(
  ctx: CanvasRenderingContext2D,
  shapes: MemoryShape[],
  bgCol: RGB, s1: RGB, s2: RGB, s3: RGB,
  cardX: number, cardY: number, cardW: number, cardH: number,
  alpha: number,
  minDim: number,
) {
  // Card background
  ctx.fillStyle = rgba(bgCol, alpha * 0.8);
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, CARD_RADIUS_RATIO * cardW);
  ctx.fill();

  // Draw shapes
  for (let i = 0; i < shapes.length; i++) {
    const s = shapes[i];
    const col = i % 3 === 0 ? s1 : i % 3 === 1 ? s2 : s3;
    ctx.fillStyle = rgba(col, alpha * 0.6);
    ctx.strokeStyle = rgba(col, alpha * 0.4);
    ctx.lineWidth = minDim * 0.0012;

    if (s.type === 'circle') {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r!, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.type === 'rect') {
      ctx.fillRect(s.x, s.y, s.w, s.h);
    } else if (s.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.w, s.y);
      ctx.stroke();
    }
  }
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function ChromaticGradeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    warmZones: [] as WarmZone[],
    isPointerDown: false,
    pointerX: 0,
    pointerY: 0,
    activeZoneIndex: -1,
    lastCoverage: 0,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // Create offscreen mask canvas
  useEffect(() => {
    maskCanvasRef.current = document.createElement('canvas');
    return () => { maskCanvasRef.current = null; };
  }, []);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * w;
      const y = (e.clientY - rect.top) / rect.height * h;
      const s = stateRef.current;
      s.isPointerDown = true;
      s.pointerX = x;
      s.pointerY = y;
      s.warmZones.push({
        x, y, radius: 0,
        maxRadius: minDim * MAX_TOUCH_RADIUS_RATIO,
        growing: true,
      });
      s.activeZoneIndex = s.warmZones.length - 1;
      onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isPointerDown) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * w;
      const y = (e.clientY - rect.top) / rect.height * h;
      const dx = x - s.pointerX;
      const dy = y - s.pointerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > minDim * 0.06) {
        s.warmZones.push({
          x, y, radius: 0,
          maxRadius: minDim * MAX_TOUCH_RADIUS_RATIO * 0.7,
          growing: true,
        });
        s.activeZoneIndex = s.warmZones.length - 1;
        s.pointerX = x;
        s.pointerY = y;
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isPointerDown = false;
      if (s.activeZoneIndex >= 0) {
        s.warmZones[s.activeZoneIndex].growing = false;
      }
      s.activeZoneIndex = -1;
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      // Entrance
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Colors
      const primaryRgb = parseColor(p.color);
      const coldBg = lerpColor(COLD_BG, primaryRgb, 0.04);
      const warmBg = lerpColor(WARM_BG, primaryRgb, 0.04);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);

      const coldS1 = lerpColor(COLD_SHAPE_1, primaryRgb, 0.03);
      const coldS2 = lerpColor(COLD_SHAPE_2, primaryRgb, 0.03);
      const coldS3 = lerpColor(COLD_SHAPE_3, primaryRgb, 0.03);
      const warmS1 = lerpColor(WARM_SHAPE_1, primaryRgb, 0.03);
      const warmS2 = lerpColor(WARM_SHAPE_2, primaryRgb, 0.03);
      const warmS3 = lerpColor(WARM_SHAPE_3, primaryRgb, 0.03);

      // Canvas setup
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Card dimensions
      const cardW = minDim * CARD_W_RATIO;
      const cardH = minDim * CARD_H_RATIO;
      const cardX = cx - cardW / 2;
      const cardY = cy - cardH / 2;

      // Generate shapes (deterministic)
      const shapes = generateMemoryShapes(cardX, cardY, cardW, cardH);

      // Grow warm zones
      const growSpeed = p.reducedMotion ? RADIUS_GROW_SPEED_REDUCED : RADIUS_GROW_SPEED;
      for (const zone of s.warmZones) {
        if (zone.growing || zone.radius < zone.maxRadius) {
          zone.radius = Math.min(zone.maxRadius, zone.radius + growSpeed);
        }
      }

      // Draw cold scene (full card)
      const coldAlpha = ELEMENT_ALPHA.primary.max * ent;
      drawMemoryScene(ctx, shapes, coldBg, coldS1, coldS2, coldS3,
        cardX, cardY, cardW, cardH, coldAlpha, minDim);

      // Draw warm scene clipped to warm zones
      if (s.warmZones.length > 0) {
        ctx.save();

        // Create clip path from all warm zones
        ctx.beginPath();
        for (const zone of s.warmZones) {
          if (zone.radius > 0) {
            ctx.moveTo(zone.x + zone.radius, zone.y);
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
          }
        }
        ctx.clip();

        // Also clip to card bounds
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, CARD_RADIUS_RATIO * cardW);
        ctx.clip();

        // Draw warm scene over cold
        drawMemoryScene(ctx, shapes, warmBg, warmS1, warmS2, warmS3,
          cardX, cardY, cardW, cardH, coldAlpha, minDim);

        ctx.restore();
      }

      // Calculate coverage (approximate — sample grid points)
      let coveredCount = 0;
      const sampleStep = Math.max(5, Math.round(minDim * 0.025));
      let totalSamples = 0;
      for (let sy = cardY; sy < cardY + cardH; sy += sampleStep) {
        for (let sx = cardX; sx < cardX + cardW; sx += sampleStep) {
          totalSamples++;
          for (const zone of s.warmZones) {
            const dx = sx - zone.x;
            const dy = sy - zone.y;
            if (dx * dx + dy * dy < zone.radius * zone.radius) {
              coveredCount++;
              break;
            }
          }
        }
      }
      const coverage = totalSamples > 0 ? coveredCount / totalSamples : 0;

      // Haptic on coverage milestones
      if (coverage > 0.25 && s.lastCoverage <= 0.25) onHaptic('drag_snap');
      if (coverage > 0.5 && s.lastCoverage <= 0.5) onHaptic('drag_snap');
      if (coverage > 0.75 && s.lastCoverage <= 0.75) onHaptic('drag_snap');
      s.lastCoverage = coverage;

      onStateChange?.(coverage);

      // Resolution
      if (coverage > 0.9 && !s.resolved) {
        s.resolved = true;
        onHaptic('completion');
        onResolve?.();
      }

      // Card border (warm progress indicator)
      ctx.strokeStyle = rgba(
        lerpColor(coldBg, warmBg, coverage),
        ELEMENT_ALPHA.secondary.max * ent,
      );
      ctx.lineWidth = minDim * 0.0012;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, CARD_RADIUS_RATIO * cardW);
      ctx.stroke();

      // Labels
      const labelAlpha = ELEMENT_ALPHA.text.min * ent;
      ctx.font = `${Math.round(minDim * 0.016)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(lerpColor(coldBg, warmBg, coverage), labelAlpha);
      ctx.fillText(
        coverage < 0.5 ? 'touch to warm the memory' : 'warmth returning',
        cx, cardY + cardH + minDim * 0.04,
      );

      // Breath glow at touch points
      if (!p.reducedMotion && s.warmZones.length > 0) {
        const lastZone = s.warmZones[s.warmZones.length - 1];
        const glowR = lastZone.radius * (1 + p.breathAmplitude * 0.1);
        const glowAlpha = ELEMENT_ALPHA.glow.min * ent * 0.5;
        const grad = ctx.createRadialGradient(
          lastZone.x, lastZone.y, 0,
          lastZone.x, lastZone.y, glowR,
        );
        grad.addColorStop(0, rgba(warmBg, glowAlpha));
        grad.addColorStop(1, rgba(warmBg, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lastZone.x, lastZone.y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
        cursor: 'crosshair',
      }}
    />
  );
}