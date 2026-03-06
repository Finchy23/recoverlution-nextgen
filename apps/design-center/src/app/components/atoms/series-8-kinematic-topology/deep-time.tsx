/**
 * ATOM 073: THE DEEP TIME ENGINE
 * =================================
 * Series 8 — Kinematic Topology · Position 3
 *
 * The ego panics in hours. The earth thinks in millennia.
 * This atom accelerates time to geological speeds, proving
 * that every mountain eventually becomes dust.
 *
 * PHYSICS:
 *   - Terrain: 120 y-values, initially jagged peaks
 *   - Erosion: each time step lerps values toward neighbour average
 *   - Sky gradient transitions from stormy grey to warm amber
 *   - Grass particles spawn on flat sections
 *   - Timeline labels at millennium markers
 *
 * INTERACTION:
 *   Drag (horizontal) → scrub through geological time
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Discrete terrain states per scrub increment
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

const TERRAIN_ROCK: RGB = [80, 70, 65];
const TERRAIN_EARTH: RGB = [120, 100, 70];
const TERRAIN_GREEN: RGB = [80, 120, 60];
const SKY_STORM: RGB = [45, 45, 55];
const SKY_AMBER: RGB = [180, 140, 80];
const GRASS_COLOR: RGB = [70, 130, 50];
const LABEL_COLOR: RGB = [180, 175, 190];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const TERRAIN_POINTS = 120;
const EROSION_PASSES_PER_STEP = 3;
const TERRAIN_BASE_Y = 0.6; // fraction of height
const PEAK_HEIGHT = 0.35; // fraction of height

// =====================================================================
// TERRAIN GENERATION
// =====================================================================

function generateTerrain(count: number): number[] {
  const terrain: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    // Multiple sine waves for jagged mountains
    const peak = Math.sin(t * 5) * 0.3 +
      Math.sin(t * 13) * 0.2 +
      Math.sin(t * 29 + 1) * 0.15 +
      Math.sin(t * 47 + 2) * 0.08;
    terrain.push(Math.max(0, peak + 0.1)); // normalize to positive
  }
  return terrain;
}

function erodeTerrain(terrain: number[], passes: number): number[] {
  const result = [...terrain];
  for (let p = 0; p < passes; p++) {
    for (let i = 1; i < result.length - 1; i++) {
      result[i] = result[i] * 0.7 + (result[i - 1] + result[i + 1]) * 0.15;
    }
  }
  return result;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function DeepTimeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    timeT: 0, // 0 = NOW, 1 = 10,000 years
    targetTimeT: 0,
    baseTerrain: null as number[] | null,
    isDragging: false,
    dragStartX: 0,
    dragStartT: 0,
    lastDetent: -1,
    resolved: false,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isDragging = true;
      s.dragStartX = e.clientX;
      s.dragStartT = s.timeT;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const deltaX = e.clientX - s.dragStartX;
      const range = w * 0.7;
      s.targetTimeT = Math.max(0, Math.min(1, s.dragStartT + deltaX / range));
      const detent = Math.floor(s.targetTimeT * 10);
      if (detent !== s.lastDetent) {
        s.lastDetent = detent;
        onHaptic('drag_snap');
        if (detent === 5) onHaptic('step_advance');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isDragging = false;
      if (s.targetTimeT > 0.9 && !s.resolved) {
        s.targetTimeT = 1;
        s.resolved = true;
        onHaptic('completion');
        onResolve?.();
      }
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

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const timeLerp = p.reducedMotion ? 0.3 : 0.05;
      s.timeT += (s.targetTimeT - s.timeT) * timeLerp;

      onStateChange?.(s.timeT);

      // Generate base terrain once
      if (!s.baseTerrain) {
        s.baseTerrain = generateTerrain(TERRAIN_POINTS);
      }

      // Erode terrain based on time
      const erosionPasses = Math.round(s.timeT * 80);
      const terrain = erodeTerrain(s.baseTerrain, erosionPasses);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // ── Sky gradient ───────────────────────────────────
      const skyTop = lerpColor(
        lerpColor(SKY_STORM, primaryRgb, 0.03),
        lerpColor(SKY_AMBER, primaryRgb, 0.04),
        s.timeT,
      );
      const skyAlpha = ELEMENT_ALPHA.secondary.max * ent;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * TERRAIN_BASE_Y);
      skyGrad.addColorStop(0, rgba(skyTop, skyAlpha));
      skyGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), skyAlpha * 0.3));
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * TERRAIN_BASE_Y);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Terrain ────────────────────────────────────────
      const baseY = h * TERRAIN_BASE_Y;
      const peakScale = h * PEAK_HEIGHT;

      // Terrain colour transitions from rock to earth to green
      const terrainCol = lerpColor(
        lerpColor(TERRAIN_ROCK, primaryRgb, 0.04),
        lerpColor(
          lerpColor(TERRAIN_EARTH, primaryRgb, 0.04),
          lerpColor(TERRAIN_GREEN, primaryRgb, 0.04),
          Math.max(0, s.timeT * 2 - 1), // green only in second half
        ),
        s.timeT,
      );
      const terrainAlpha = ELEMENT_ALPHA.primary.max * ent;

      ctx.fillStyle = rgba(terrainCol, terrainAlpha);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < TERRAIN_POINTS; i++) {
        const x = (i / (TERRAIN_POINTS - 1)) * w;
        const y = baseY - terrain[i] * peakScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Terrain edge line
      ctx.strokeStyle = rgba(terrainCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      for (let i = 0; i < TERRAIN_POINTS; i++) {
        const x = (i / (TERRAIN_POINTS - 1)) * w;
        const y = baseY - terrain[i] * peakScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // ── Grass particles (on flat sections at high timeT) ──
      if (s.timeT > 0.6 && !p.reducedMotion) {
        const grassCol = lerpColor(GRASS_COLOR, primaryRgb, 0.05);
        const grassAlpha = ELEMENT_ALPHA.secondary.max * ent * Math.min(1, (s.timeT - 0.6) / 0.3);
        for (let i = 2; i < TERRAIN_POINTS - 2; i += 3) {
          const slope = Math.abs(terrain[i + 1] - terrain[i - 1]);
          if (slope < 0.01) {
            const gx = (i / (TERRAIN_POINTS - 1)) * w;
            const gy = baseY - terrain[i] * peakScale;
            // Small grass blades
            for (let g = 0; g < 3; g++) {
              const bx = gx + (g - 1) * minDim * 0.004;
              const bh = minDim * 0.008 * (0.7 + Math.sin(s.frame * 0.03 + i + g) * 0.3);
              ctx.strokeStyle = rgba(grassCol, grassAlpha);
              ctx.lineWidth = minDim * 0.0006;
              ctx.beginPath();
              ctx.moveTo(bx, gy);
              ctx.lineTo(bx + Math.sin(s.frame * 0.02 + g) * minDim * 0.002, gy - bh);
              ctx.stroke();
            }
          }
        }
      }

      // ── Timeline bar ───────────────────────────────────
      const barY = h * 0.88;
      const barX = w * 0.1;
      const barW = w * 0.8;
      const barCol = lerpColor(LABEL_COLOR, primaryRgb, 0.05);

      // Track
      ctx.fillStyle = rgba(barCol, ELEMENT_ALPHA.tertiary.max * ent);
      const barH = minDim * 0.002;
      ctx.fillRect(barX, barY, barW, barH);

      // Progress indicator
      ctx.fillStyle = rgba(barCol, ELEMENT_ALPHA.primary.min * ent);
      ctx.beginPath();
      ctx.arc(barX + barW * s.timeT, barY, minDim * 0.006, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.font = `${Math.round(minDim * 0.011)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(barCol, ELEMENT_ALPHA.text.min * ent * 0.6);
      const labels = ['NOW', '2,500', '5,000', '7,500', '10,000 YRS'];
      for (let i = 0; i < labels.length; i++) {
        const lx = barX + barW * (i / (labels.length - 1));
        ctx.fillText(labels[i], lx, barY + minDim * 0.025);
      }

      // ── Instruction ────────────────────────────────────
      if (s.timeT < 0.05 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(barCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('drag right to erode the mountains', cx, h * 0.95);
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
      }}
    />
  );
}