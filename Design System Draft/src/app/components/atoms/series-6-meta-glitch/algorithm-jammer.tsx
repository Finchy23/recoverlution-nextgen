/**
 * ATOM 055: THE ALGORITHM JAMMER ENGINE (Doomscroll Braking)
 * ===========================================================
 * Series 6 — Meta-System & Glitch · Position 5
 *
 * The infinite scroll is the most elegant dopamine trap ever
 * designed. Content tiles cascade downward at high velocity —
 * each one a micro-hit of novelty. The hand moves. The thumb
 * flicks. The eyes glaze. You've been here for forty minutes
 * and you don't remember any of it.
 *
 * This atom recreates that exact kinetic momentum — a fast,
 * blurry column of abstract content tiles scrolling vertically
 * at sickening speed. The user must physically ARREST it.
 *
 * Press and HOLD. The physics engine applies massive kinetic
 * friction — exponentially decelerating. The tiles SHUDDER.
 * They SQUEAL (haptic grinding). The speed drops. The blur
 * clears. The tiles sharpen. Individual "content" becomes
 * legible for the first time.
 *
 * At full stop: silence. Clarity. A single tile remains in
 * focus: "You stopped. That took strength."
 *
 * PHYSICS:
 *   - Initial velocity: 800 px/s (doomscroll speed)
 *   - Kinetic friction (while holding): v *= 0.93 per frame
 *   - When released: v accelerates back toward initial speed
 *   - Deceleration produces shudder (random x-offset jitter)
 *   - Tile blur = velocity-mapped Gaussian approximation
 *   - Full stop threshold: < 0.5 px/frame
 *
 * HAPTIC:
 *   Hold start → hold_start
 *   Grinding deceleration → drag_snap (every speed tier)
 *   Full stop → completion
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: Slower initial speed, no blur, instant stop
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const INITIAL_VELOCITY_FRAC = 0.028; // velocity as fraction of minDim per frame
const FRICTION = 0.93;              // Per-frame multiplier while holding
const RECOVERY_RATE_FRAC = 0.0003;  // accel as fraction of minDim per frame²
const STOP_THRESHOLD_FRAC = 0.001;  // stop threshold as fraction of minDim
const TILE_COUNT = 18;              // Visible tile slots
const TILE_GAP_FRAC = 0.02;        // Gap as fraction of viewport height
const TILE_HEIGHT_FRAC = 0.065;    // Tile height as fraction of viewport height
const SHUDDER_SCALE = 0.8;         // Max horizontal pixel jitter
const SPEED_SNAP_COUNT = 6;        // Haptic tiers during deceleration

// Palette
const BG_DARK: RGB = [4, 4, 5];
const TILE_BG: RGB = [25, 24, 26];
const TILE_BORDER: RGB = [45, 42, 48];
const TILE_LINE: RGB = [60, 55, 58];        // "Content" text-line placeholder
const TILE_LINE_DIM: RGB = [40, 38, 42];
const TILE_ACCENT: RGB = [75, 68, 65];      // Thumbnail placeholder
const NOISE_OVERLAY: RGB = [100, 70, 65];   // Warm noise that fades with speed
const STOP_TEXT: RGB = [155, 148, 130];
const STOP_GLOW: RGB = [140, 135, 115];
const LABEL_DIM: RGB = [55, 50, 45];

// Pre-generate tile "content" (abstract line widths)
interface TileData {
  lines: number[];           // Line widths as fraction (0.3–0.9)
  hasThumb: boolean;         // Whether tile has a "thumbnail" block
  thumbSide: 'left' | 'right';
  seed: number;
}

function generateTile(seed: number): TileData {
  const rng = mulberry32(seed);
  const lineCount = 2 + Math.floor(rng() * 3);
  return {
    lines: Array.from({ length: lineCount }, () => 0.3 + rng() * 0.6),
    hasThumb: rng() > 0.5,
    thumbSide: rng() > 0.5 ? 'left' : 'right',
    seed,
  };
}

function mulberry32(a: number) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function AlgorithmJammerAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    velocity: 0, // initialized in useEffect from minDim
    scrollY: 0,
    isHolding: false,
    holdFired: false,
    stopped: false,
    resolved: false,
    lastSpeedTier: SPEED_SNAP_COUNT,
    tiles: [] as TileData[],
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
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
    const initialVelocity = minDim * INITIAL_VELOCITY_FRAC;
    const recoveryRate = minDim * RECOVERY_RATE_FRAC;
    const stopThreshold = minDim * STOP_THRESHOLD_FRAC;

    // Initialize velocity on first run
    if (s.velocity === 0 && !s.stopped) {
      s.velocity = initialVelocity;
    }

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.resolved) return;
      s.isHolding = true;
      if (!s.holdFired) {
        s.holdFired = true;
        cbRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isHolding = false;
      s.holdFired = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const tileH = h * TILE_HEIGHT_FRAC;
    const tileGap = h * TILE_GAP_FRAC;
    const tileStep = tileH + tileGap;
    const tileW = w * 0.85;
    const tileX = (w - tileW) / 2;

    if (!s.initialized) {
      s.tiles = Array.from({ length: 40 }, (_, i) => generateTile(i * 7 + 13));
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

      // Entrance
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const ent = easeOutExpo(s.entranceProgress);

      // ── Physics ────────────────────────────────────────
      if (!s.stopped) {
        if (s.isHolding) {
          // Massive friction
          const frictionRate = p.reducedMotion ? 0.85 : FRICTION;
          s.velocity *= frictionRate;
        } else {
          // Recovery — accelerate back toward initial
          s.velocity = Math.min(initialVelocity,
            s.velocity + recoveryRate);
        }

        // Scroll
        s.scrollY += s.velocity;

        // Speed tier haptics (grinding shudder)
        const normalizedSpeed = s.velocity / initialVelocity;
        const tier = Math.floor(normalizedSpeed * SPEED_SNAP_COUNT);
        if (tier < s.lastSpeedTier && s.isHolding) {
          s.lastSpeedTier = tier;
          cb.onHaptic('drag_snap');
        }
        if (tier > s.lastSpeedTier) {
          s.lastSpeedTier = tier;
        }

        // Stop detection
        if (s.velocity < stopThreshold && s.isHolding) {
          s.velocity = 0;
          s.stopped = true;
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // State
      const calmness = 1 - (s.velocity / initialVelocity);
      cb.onStateChange?.(Math.max(0, Math.min(1, calmness)));

      // ── Derived visual params ──────────────────────────
      const speedNorm = Math.min(1, s.velocity / initialVelocity);
      /** Motion blur: tile vertical stretch factor */
      const blurStretch = p.reducedMotion ? 1 : 1 + speedNorm * 0.5;
      /** Shudder: horizontal jitter */
      const shudder = (p.reducedMotion || s.stopped) ? 0 :
        (Math.random() - 0.5) * minDim * 0.0016 * speedNorm * (s.isHolding ? 3 : 0.5);
      /** Tile clarity: alpha scaling */
      const clarity = 0.5 + (1 - speedNorm) * 0.5;

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ══════════════════════════════════════════════════

      const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Noise overlay (fades as speed drops) ───────────
      if (speedNorm > 0.1 && !p.reducedMotion) {
        const noiseCol = lerpColor(NOISE_OVERLAY, s.primaryRgb, 0.03);
        const noiseAlpha = speedNorm * 0.012 * ent;
        // Horizontal noise bands
        for (let i = 0; i < 8; i++) {
          const ny = Math.random() * h;
          const nh = 1 + Math.random() * 3;
          ctx.fillStyle = rgba(noiseCol, noiseAlpha * Math.random());
          ctx.fillRect(0, ny, w, nh);
        }
      }

      // ══════════════════════════════════════════════════
      // CONTENT TILES
      // ══════════════════════════════════════════════════

      const totalH = s.tiles.length * tileStep;
      const baseY = -(s.scrollY % totalH);

      ctx.save();
      if (shudder !== 0) ctx.translate(shudder, 0);

      for (let i = 0; i < s.tiles.length; i++) {
        const tile = s.tiles[i];
        let ty = baseY + i * tileStep;

        // Wrap
        while (ty < -tileStep) ty += totalH;
        while (ty > h + tileStep) ty -= totalH;

        if (ty < -tileStep || ty > h + tileStep) continue;

        // Tile background
        const tileBgCol = lerpColor(TILE_BG, s.primaryRgb, 0.008);
        const tileAlpha = 0.06 * clarity * ent;
        const drawH = tileH * blurStretch;
        const drawY = ty - (drawH - tileH) / 2; // Center the blur stretch

        ctx.fillStyle = rgba(tileBgCol, tileAlpha);
        roundRect(ctx, tileX, drawY, tileW, drawH, 3);
        ctx.fill();

        // Tile border
        const tileBorderCol = lerpColor(TILE_BORDER, s.primaryRgb, 0.01);
        ctx.beginPath();
        roundRect(ctx, tileX, drawY, tileW, drawH, 3);
        ctx.strokeStyle = rgba(tileBorderCol, tileAlpha * 0.3);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();

        // Only render content when sufficiently slowed
        if (clarity > 0.55) {
          const contentAlpha = (clarity - 0.55) / 0.45 * tileAlpha;
          const pad = tileW * 0.04;

          // Thumbnail block
          if (tile.hasThumb) {
            const thumbW = tileW * 0.15;
            const thumbH = tileH * 0.7;
            const thumbY = drawY + (drawH - thumbH) / 2;
            const thumbX = tile.thumbSide === 'left'
              ? tileX + pad
              : tileX + tileW - pad - thumbW;
            const thumbCol = lerpColor(TILE_ACCENT, s.accentRgb, 0.04);
            ctx.fillStyle = rgba(thumbCol, contentAlpha * 0.5);
            ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
          }

          // Text lines
          const textArea = tile.hasThumb ? tileW * 0.7 : tileW * 0.85;
          const textStartX = tile.hasThumb && tile.thumbSide === 'left'
            ? tileX + tileW * 0.25
            : tileX + pad;
          const lineY0 = drawY + drawH * 0.2;
          const lineSpacing = drawH * 0.18;

          for (let l = 0; l < tile.lines.length; l++) {
            const lineW = textArea * tile.lines[l];
            const ly = lineY0 + l * lineSpacing;
            const lineCol = l === 0
              ? lerpColor(TILE_LINE, s.accentRgb, 0.03)
              : lerpColor(TILE_LINE_DIM, s.primaryRgb, 0.03);
            ctx.fillStyle = rgba(lineCol, contentAlpha * (l === 0 ? 0.7 : 0.4));
            ctx.fillRect(textStartX, ly, lineW, 1.5);
          }
        }
      }

      ctx.restore();

      // ── Stopped state text ─────────────────────────────
      if (s.stopped) {
        const fadeIn = Math.min(1, (s.frameCount - s.frameCount) * 0.01 + 0.5);
        const textCol = lerpColor(STOP_TEXT, s.accentRgb, 0.06);
        const fontSize = Math.round(minDim * 0.022);
        ctx.font = `200 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Background dim
        ctx.fillStyle = rgba(lerpColor(BG_DARK, s.primaryRgb, 0.003), 0.08 * ent);
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = rgba(textCol, 0.07 * fadeIn * ent);
        ctx.fillText('You stopped.', w / 2, h / 2 - fontSize);
        ctx.fillStyle = rgba(textCol, 0.04 * fadeIn * ent);
        ctx.fillText('That took strength.', w / 2, h / 2 + fontSize);

        // Warm glow
        const glowCol = lerpColor(STOP_GLOW, s.accentRgb, 0.08);
        const glowR = minDim * 0.15;
        const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowR);
        const gAlpha = 0.006 * fadeIn * (1 + p.breathAmplitude * 0.3) * ent;
        glowGrad.addColorStop(0, rgba(glowCol, gAlpha));
        glowGrad.addColorStop(0.5, rgba(glowCol, gAlpha * 0.2));
        glowGrad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Hold hint ──────────────────────────────────────
      if (!s.holdFired && s.frameCount > 40 && s.frameCount < 200) {
        const hintAlpha = Math.min(0.025, (s.frameCount - 40) / 200 * 0.025) * ent;
        const hintCol = lerpColor(LABEL_DIM, s.primaryRgb, 0.04);
        const hintSize = Math.round(minDim * 0.015);
        ctx.font = `300 ${hintSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(hintCol, hintAlpha);
        ctx.fillText('press and hold', w / 2, h * 0.88);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}