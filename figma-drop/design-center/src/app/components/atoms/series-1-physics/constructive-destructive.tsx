/**
 * ATOM 005: THE CONSTRUCTIVE / DESTRUCTIVE ENGINE
 * =================================================
 * Series 1 — Physics Engines · Position 5
 *
 * The physical manifestation of saying "No."
 * Heavy digital blocks are dragged from quarry-darkness
 * and placed to build a luminous, immovable boundary wall.
 * Each block has real mass — momentum lag, gravitational
 * settling, magnetic snap into the wall grid.
 *
 * PHYSICS:
 *   - Blocks with simulated mass and drag momentum lag
 *   - Gravity pulls unsupported / misaligned blocks back
 *   - Magnetic snap zone near wall grid positions
 *   - Micro-bounce + lock on successful placement
 *   - Mortar glow intensifies as wall grows
 *   - Completed wall pulses with permanence
 *
 * INTERACTION:
 *   Tap (quarry)     → breaks next block free
 *   Drag (block)     → lifts and moves with mass-lag
 *   Drop (snap zone) → magnetic settle into wall
 *   Swipe (wall)     → seals completed wall (completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No bounce/pulse, instant snap, static glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, roundedRect, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Wall grid: columns × rows */
const WALL_COLS = 5;
const WALL_ROWS = 4;
const TOTAL_BLOCKS = WALL_COLS * WALL_ROWS;
/** Block corner radius fraction of block width */
const BLOCK_RADIUS_FRAC = 0.08;
/** Drag momentum lag (0 = instant, 1 = infinite) */
const DRAG_LAG = 0.12;
/** Gravity acceleration (px/frame²) */
const GRAVITY = 0.35;
/** Magnetic snap distance (fraction of block width) */
const SNAP_DISTANCE = 2.5;
/** Snap spring stiffness */
const SNAP_SPRING = 0.15;
/** Bounce dampening on placement */
const BOUNCE_DAMP = 0.4;
/** Settle threshold (px) — below this, lock the block */
const SETTLE_THRESHOLD = 0.8;
/** Quarry zone: bottom fraction of viewport */
const QUARRY_ZONE = 0.28;
/** Wall zone: vertical center offset from top */
const WALL_TOP_FRAC = 0.08;
/** Gap between blocks (fraction of block width) */
const BLOCK_GAP_FRAC = 0.06;

// =====================================================================
// BLOCK TYPES
// =====================================================================

interface Block {
  /** Unique ID */
  id: number;
  /** Current visual X */
  x: number;
  /** Current visual Y */
  y: number;
  /** Velocity X */
  vx: number;
  /** Velocity Y */
  vy: number;
  /** Target grid col (assigned when freed) */
  gridCol: number;
  /** Target grid row */
  gridRow: number;
  /** State machine */
  state: 'quarry' | 'freed' | 'dragging' | 'falling' | 'snapping' | 'placed';
  /** Rough-to-smooth transition (0 = rough, 1 = smooth/luminous) */
  polish: number;
  /** Bounce phase (for settle animation) */
  bouncePhase: number;
  /** Glow intensity */
  glow: number;
  /** Noise seed for texture */
  noiseSeed: number;
  /** Width (computed) */
  w: number;
  /** Height (computed) */
  h: number;
}

// =====================================================================
// COLOR SYSTEM
// =====================================================================

// Palette
const QUARRY_DARK: RGB = [35, 30, 45];
const MORTAR_WARM: RGB = [200, 175, 140];
const BLOCK_ROUGH: RGB = [75, 68, 85];
const BLOCK_PLACED: RGB = [120, 110, 135];

// =====================================================================
// PROCEDURAL NOISE (simple hash for block texture)
// =====================================================================

function hashNoise(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 113.5) * 43758.5453;
  return n - Math.floor(n);
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ConstructiveDestructiveAtom({
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

  const stateRef = useRef<{
    blocks: Block[];
    nextFreeIndex: number;
    dragBlockId: number | null;
    dragOffsetX: number;
    dragOffsetY: number;
    pointerX: number;
    pointerY: number;
    wallProgress: number;
    wallSealed: boolean;
    entranceProgress: number;
    frameCount: number;
    primaryRgb: RGB;
    accentRgb: RGB;
    blockW: number;
    blockH: number;
    wallLeft: number;
    wallTop: number;
    initialized: boolean;
    /** Occupied grid slots — true if a block is placed/snapping there */
    occupied: boolean[][];
    /** Nearest unoccupied slot while dragging (for visual guide) */
    nearestSlot: { col: number; row: number } | null;
  }>({
    blocks: [],
    nextFreeIndex: 0,
    dragBlockId: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    pointerX: 0,
    pointerY: 0,
    wallProgress: 0,
    wallSealed: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    blockW: 0,
    blockH: 0,
    wallLeft: 0,
    wallTop: 0,
    initialized: false,
    occupied: Array.from({ length: WALL_ROWS }, () => Array(WALL_COLS).fill(false)),
    nearestSlot: null,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Init helpers (inline) ───────────────────────────
    const gap = w * BLOCK_GAP_FRAC / WALL_COLS;
    const totalGapX = gap * (WALL_COLS + 1);
    const bw = (w * 0.85 - totalGapX) / WALL_COLS;
    const bh = bw * 0.55;
    const wallWidth = WALL_COLS * bw + (WALL_COLS - 1) * gap;
    const wallLeft = (w - wallWidth) / 2;
    const wallTop = h * WALL_TOP_FRAC + 20;

    const s = stateRef.current;
    s.blockW = bw;
    s.blockH = bh;
    s.wallLeft = wallLeft;
    s.wallTop = wallTop;

    if (!s.initialized) {
      const blocks: Block[] = [];
      const quarryY = h * (1 - QUARRY_ZONE) + 20;
      for (let row = WALL_ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < WALL_COLS; col++) {
          const idx = blocks.length;
          const qx = w * 0.1 + Math.random() * w * 0.8;
          const qy = quarryY + Math.random() * (h * QUARRY_ZONE * 0.5);
          blocks.push({
            id: idx, x: qx, y: qy, vx: 0, vy: 0,
            gridCol: col, gridRow: row, state: 'quarry',
            polish: 0, bouncePhase: 0, glow: 0,
            noiseSeed: Math.random() * 1000, w: bw, h: bh,
          });
        }
      }
      s.blocks = blocks;
      s.initialized = true;
    } else {
      for (const b of s.blocks) { b.w = bw; b.h = bh; }
    }

    const getGridPos = (col: number, row: number) => ({
      x: wallLeft + col * (bw + gap),
      y: wallTop + row * (bh + gap),
    });

    const findNearestSlot = (bx: number, by: number, blockW: number, blockH: number) => {
      const blockCx = bx + blockW / 2;
      const blockCy = by + blockH / 2;
      let best: { col: number; row: number; dist: number } | null = null;
      for (let row = 0; row < WALL_ROWS; row++) {
        for (let col = 0; col < WALL_COLS; col++) {
          if (s.occupied[row][col]) continue;
          const pos = getGridPos(col, row);
          const slotCx = pos.x + bw / 2;
          const slotCy = pos.y + bh / 2;
          const dx = blockCx - slotCx;
          const dy = blockCy - slotCy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (!best || dist < best.dist) best = { col, row, dist };
        }
      }
      return best;
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.pointerX = px;
      s.pointerY = py;

      const hitPad = Math.max(bw, bh) * 0.35;

      let hit: Block | null = null;
      for (let i = s.blocks.length - 1; i >= 0; i--) {
        const b = s.blocks[i];
        if (b.state === 'placed' || b.state === 'snapping' || b.state === 'quarry') continue;
        if (px >= b.x - hitPad && px <= b.x + b.w + hitPad &&
            py >= b.y - hitPad && py <= b.y + b.h + hitPad) {
          hit = b;
          break;
        }
      }

      if (!hit && s.nextFreeIndex < s.blocks.length) {
        const quarryTopY = h * (1 - QUARRY_ZONE);
        if (py >= quarryTopY - 20) {
          const nextBlock = s.blocks[s.nextFreeIndex];
          if (nextBlock && nextBlock.state === 'quarry') {
            nextBlock.state = 'freed';
            nextBlock.x = px - nextBlock.w / 2;
            nextBlock.y = py - nextBlock.h / 2;
            s.nextFreeIndex++;
            callbacksRef.current.onHaptic('tap');
            hit = nextBlock;
          }
        }
      }

      if (!hit && s.nextFreeIndex < s.blocks.length) {
        const b = s.blocks[s.nextFreeIndex];
        if (b && b.state === 'quarry' &&
            px >= b.x - hitPad && px <= b.x + b.w + hitPad &&
            py >= b.y - hitPad && py <= b.y + b.h + hitPad) {
          b.state = 'freed';
          s.nextFreeIndex++;
          callbacksRef.current.onHaptic('tap');
          hit = b;
        }
      }

      if (hit) {
        hit.state = 'dragging';
        hit.vx = 0;
        hit.vy = 0;
        s.dragBlockId = hit.id;
        s.dragOffsetX = px - hit.x;
        s.dragOffsetY = py - hit.y;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width * w;
      s.pointerY = (e.clientY - rect.top) / rect.height * h;
    };
    const onUp = (e: PointerEvent) => {
      if (s.dragBlockId === null) return;
      const block = s.blocks[s.dragBlockId];
      if (!block) return;

      const nearest = findNearestSlot(block.x, block.y, block.w, block.h);

      if (nearest && nearest.dist < block.w * SNAP_DISTANCE) {
        block.gridCol = nearest.col;
        block.gridRow = nearest.row;
        block.state = 'snapping';
        block.bouncePhase = 0;
        s.occupied[nearest.row][nearest.col] = true;
        callbacksRef.current.onHaptic('drag_snap');
      } else {
        block.state = 'falling';
      }

      s.dragBlockId = null;
      s.nearestSlot = null;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

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

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ══════════════════════════════════════════════════
      // PHYSICS UPDATE
      // ══════════════════════════════════════════════════

      let placedCount = 0;

      for (const block of s.blocks) {
        if (block.state === 'placed') {
          placedCount++;
          // Polish transition
          block.polish = Math.min(1, block.polish + 0.02);
          // Glow pulse
          if (!p.reducedMotion) {
            block.glow = 0.3 + 0.15 * Math.sin(s.frameCount * 0.03 + block.id * 0.5);
          } else {
            block.glow = 0.4;
          }
          continue;
        }

        if (block.state === 'quarry') continue;

        if (block.state === 'dragging') {
          // Mass-lag: block chases pointer with momentum
          const targetX = s.pointerX - s.dragOffsetX;
          const targetY = s.pointerY - s.dragOffsetY;
          block.vx += (targetX - block.x) * DRAG_LAG;
          block.vy += (targetY - block.y) * DRAG_LAG;
          block.vx *= 0.7;
          block.vy *= 0.7;
          block.x += block.vx;
          block.y += block.vy;

          // Find nearest unoccupied slot
          const nearest = findNearestSlot(block.x, block.y, block.w, block.h);
          if (nearest) {
            s.nearestSlot = nearest;
          } else {
            s.nearestSlot = null;
          }
        }

        if (block.state === 'falling') {
          // Gravity
          block.vy += GRAVITY;
          block.x += block.vx;
          block.y += block.vy;
          block.vx *= 0.98;

          // Reset to quarry if fallen below screen
          if (block.y > h + 50) {
            block.state = 'freed';
            block.y = h * (1 - QUARRY_ZONE) + 30 + Math.random() * 40;
            block.x = w * 0.15 + Math.random() * w * 0.7;
            block.vx = 0;
            block.vy = 0;
          }
        }

        if (block.state === 'snapping') {
          const target = getGridPos(block.gridCol, block.gridRow);
          const dx = target.x - block.x;
          const dy = target.y - block.y;

          if (p.reducedMotion) {
            block.x = target.x;
            block.y = target.y;
            block.state = 'placed';
            block.polish = 0.5;
          } else {
            // Spring toward target with bounce
            block.bouncePhase += 0.08;
            const springForce = SNAP_SPRING;
            block.vx += dx * springForce;
            block.vy += dy * springForce;
            block.vx *= 0.75;
            block.vy *= 0.75;
            block.x += block.vx;
            block.y += block.vy;

            // Check if settled
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = Math.sqrt(block.vx * block.vx + block.vy * block.vy);
            if (dist < SETTLE_THRESHOLD && speed < SETTLE_THRESHOLD) {
              block.x = target.x;
              block.y = target.y;
              block.state = 'placed';
              block.polish = 0;
            }
          }
        }
      }

      // ── Wall progress ─────────────────────────────────
      s.wallProgress = placedCount / TOTAL_BLOCKS;
      cb.onStateChange?.(s.wallProgress);

      // ── Completion check ──────────────────────────────
      if (placedCount === TOTAL_BLOCKS && !s.wallSealed) {
        s.wallSealed = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      // ════��═════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([8, 7, 12], s.primaryRgb, 0.05);
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, rgba(lerpColor(bgBase, [18, 15, 24], 0.4), entrance * 0.03));
      bgGrad.addColorStop(0.5, rgba(bgBase, entrance * 0.025));
      bgGrad.addColorStop(1, rgba(lerpColor(bgBase, [3, 2, 8], 0.5), entrance * 0.02));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Quarry zone ───────────────────────────────────
      const quarryTop = h * (1 - QUARRY_ZONE);
      const quarryGrad = ctx.createLinearGradient(0, quarryTop - 30, 0, h);
      quarryGrad.addColorStop(0, rgba(QUARRY_DARK, 0));
      quarryGrad.addColorStop(0.15, rgba(QUARRY_DARK, 0.4 * entrance));
      quarryGrad.addColorStop(1, rgba(lerpColor(QUARRY_DARK, [15, 12, 22], 0.5), 0.7 * entrance));
      ctx.fillStyle = quarryGrad;
      ctx.fillRect(0, quarryTop - 30, w, h - quarryTop + 30);

      // Quarry dividing line — subtle horizon
      ctx.beginPath();
      ctx.moveTo(0, quarryTop);
      ctx.lineTo(w, quarryTop);
      ctx.strokeStyle = rgba(lerpColor(MORTAR_WARM, s.primaryRgb, 0.4), 0.12 * entrance);
      ctx.lineWidth = minDim * 0.002;
      ctx.stroke();

      // ── Wall grid ghost (target positions) ────────────
      for (let row = 0; row < WALL_ROWS; row++) {
        for (let col = 0; col < WALL_COLS; col++) {
          const pos = getGridPos(col, row);
          const isOccupied = s.occupied[row][col];
          if (!isOccupied) {
            // Check if this is the nearest slot while dragging
            const isNearest = s.dragBlockId !== null && s.nearestSlot &&
              s.nearestSlot.col === col && s.nearestSlot.row === row;

            if (isNearest) {
              // Bright pulsing highlight for the snap target
              const guidePulse = 0.4 + 0.2 * Math.sin(s.frameCount * 0.06);
              ctx.save();
              // Filled guide ghost
              ctx.fillStyle = rgba(
                lerpColor(s.accentRgb, s.primaryRgb, 0.3),
                guidePulse * 0.15 * entrance,
              );
              roundedRect(ctx, pos.x, pos.y, s.blockW, s.blockH, s.blockW * BLOCK_RADIUS_FRAC);
              ctx.fill();
              // Solid border
              ctx.strokeStyle = rgba(s.accentRgb, guidePulse * entrance);
              ctx.lineWidth = minDim * 0.004;
              roundedRect(ctx, pos.x, pos.y, s.blockW, s.blockH, s.blockW * BLOCK_RADIUS_FRAC);
              ctx.stroke();
              ctx.restore();
            } else {
              // Dashed outline for empty slots
              ctx.save();
              ctx.setLineDash([minDim * 0.008, minDim * 0.008]);
              ctx.strokeStyle = rgba(
                lerpColor(MORTAR_WARM, s.primaryRgb, 0.3),
                0.15 * entrance * (0.6 + s.wallProgress * 0.4),
              );
              ctx.lineWidth = minDim * 0.002;
              roundedRect(ctx, pos.x, pos.y, s.blockW, s.blockH, s.blockW * BLOCK_RADIUS_FRAC);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      // ── Mortar glow between placed blocks ─────────────
      if (s.wallProgress > 0) {
        const mortarAlpha = s.wallProgress * 0.12 * entrance;
        for (const block of s.blocks) {
          if (block.state !== 'placed') continue;
          const cx = block.x + block.w / 2;
          const cy = block.y + block.h / 2;
          const glowR = Math.max(block.w, block.h) * 0.8;
          const mGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
          mGrad.addColorStop(0, rgba(lerpColor(MORTAR_WARM, s.accentRgb, 0.3), mortarAlpha * block.polish));
          mGrad.addColorStop(0.6, rgba(MORTAR_WARM, mortarAlpha * block.polish * 0.3));
          mGrad.addColorStop(1, rgba(MORTAR_WARM, 0));
          ctx.fillStyle = mGrad;
          ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
        }
      }

      // ── Draw blocks ───────────────────────────────────
      // Sort: quarry first, then by state priority
      const drawOrder = [...s.blocks].sort((a, b) => {
        const priority: Record<string, number> = { quarry: 0, falling: 1, freed: 2, snapping: 3, placed: 4, dragging: 5 };
        return (priority[a.state] ?? 0) - (priority[b.state] ?? 0);
      });

      for (const block of drawOrder) {
        if (block.state === 'quarry' && block.id >= s.nextFreeIndex) {
          // Show the next 3 quarry blocks with decreasing visibility
          const peekOffset = block.id - s.nextFreeIndex;
          if (peekOffset < 3) {
            drawBlock(ctx, block, s, p, entrance, true, peekOffset, minDim);
          }
          continue;
        }
        drawBlock(ctx, block, s, p, entrance, false, -1, minDim);
      }

      // ── Wall completion glow ──────────────────────────
      if (s.wallSealed) {
        const sealPulse = p.reducedMotion ? 0.15 : 0.1 + 0.05 * Math.sin(s.frameCount * 0.02);
        const wallCx = s.wallLeft + (WALL_COLS * s.blockW) / 2;
        const wallCy = s.wallTop + (WALL_ROWS * s.blockH) / 2;
        const wallR = Math.max(WALL_COLS * s.blockW, WALL_ROWS * s.blockH) * 0.8;
        const sealGrad = ctx.createRadialGradient(wallCx, wallCy, 0, wallCx, wallCy, wallR);
        sealGrad.addColorStop(0, rgba(s.accentRgb, sealPulse * entrance));
        sealGrad.addColorStop(0.5, rgba(s.primaryRgb, sealPulse * 0.3 * entrance));
        sealGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sealGrad;
        ctx.fillRect(wallCx - wallR, wallCy - wallR, wallR * 2, wallR * 2);
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

// =====================================================================
// DRAW HELPERS
// =====================================================================

function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  s: { primaryRgb: RGB; accentRgb: RGB; frameCount: number },
  p: { breathAmplitude: number; reducedMotion: boolean; color: string; accentColor: string },
  entrance: number,
  isQuarryPeek: boolean,
  peekOffset: number,
  minDim: number,
) {
  const { w, h, polish, glow, noiseSeed, state } = block;
  const radius = w * BLOCK_RADIUS_FRAC;
  const isDragging = state === 'dragging';

  // Apply gentle floating offset for quarry/freed blocks
  let drawX = block.x;
  let drawY = block.y;
  if (!p.reducedMotion && (isQuarryPeek || state === 'freed')) {
    const bobPhase = s.frameCount * 0.02 + block.id * 1.7;
    drawY += Math.sin(bobPhase) * 3;
    drawX += Math.sin(bobPhase * 0.7 + 0.5) * 1.5;
  }

  const x = drawX;
  const y = drawY;

  ctx.save();

  // Shadow for dragged block
  if (isDragging) {
    ctx.shadowColor = rgba([0, 0, 0], 0.4);
    ctx.shadowBlur = minDim * 0.04;
    ctx.shadowOffsetY = minDim * 0.016;
  }

  // Block body
  const blockColor = lerpColor(
    BLOCK_ROUGH,
    lerpColor(BLOCK_PLACED, s.primaryRgb, 0.3),
    polish,
  );
  const alpha = isQuarryPeek ? 0.5 - 0.15 * peekOffset : (isDragging ? 0.95 : 0.85 + polish * 0.15);

  // Fill
  ctx.fillStyle = rgba(blockColor, alpha * entrance);
  roundedRect(ctx, x, y, w, h, radius);
  ctx.fill();

  // Texture noise (rough blocks only)
  if (polish < 0.8 && !p.reducedMotion) {
    for (let nx = 0; nx < 6; nx++) {
      for (let ny = 0; ny < 4; ny++) {
        const noiseVal = hashNoise(nx, ny, noiseSeed);
        if (noiseVal > 0.6) {
          const npx = x + (nx / 6) * w + w * 0.05;
          const npy = y + (ny / 4) * h + h * 0.05;
          const nSize = 2 + noiseVal * 3;
          ctx.fillStyle = rgba([20, 18, 25], (1 - polish) * 0.3 * entrance);
          ctx.fillRect(npx, npy, nSize, nSize * 0.6);
        }
      }
    }
  }

  // Edge highlight (top + left)
  if (polish > 0.1) {
    ctx.strokeStyle = rgba(
      lerpColor(s.primaryRgb, [255, 255, 255], 0.2),
      polish * 0.2 * entrance,
    );
    ctx.lineWidth = minDim * 0.002;
    roundedRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, radius);
    ctx.stroke();
  }

  // Inner glow for placed blocks
  if (glow > 0 && state === 'placed') {
    const gcx = x + w / 2;
    const gcy = y + h / 2;
    const glowGrad = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, w * 0.5);
    glowGrad.addColorStop(0, rgba(s.accentRgb, glow * 0.15 * entrance));
    glowGrad.addColorStop(1, rgba(s.accentRgb, 0));
    ctx.fillStyle = glowGrad;
    roundedRect(ctx, x, y, w, h, radius);
    ctx.fill();
  }

  // Dragging highlight
  if (isDragging) {
    ctx.strokeStyle = rgba(s.accentRgb, 0.4 * entrance);
    ctx.lineWidth = minDim * 0.004;
    roundedRect(ctx, x - 1, y - 1, w + 2, h + 2, radius + 1);
    ctx.stroke();
  }

  // Quarry peek: pulsing attention glow on the primary (clickable) block
  if (isQuarryPeek && peekOffset === 0) {
    const pulse = 0.25 + 0.15 * Math.sin(s.frameCount * 0.04);
    // Outer glow
    ctx.save();
    ctx.shadowColor = rgba(s.accentRgb, pulse * 0.8);
    ctx.shadowBlur = minDim * 0.024;
    ctx.strokeStyle = rgba(s.accentRgb, pulse * entrance);
    ctx.lineWidth = minDim * 0.003;
    roundedRect(ctx, x - 1, y - 1, w + 2, h + 2, radius + 1);
    ctx.stroke();
    ctx.restore();

    // Subtle border highlight
    ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255], 0.3), 0.2 * entrance);
    ctx.lineWidth = minDim * 0.002;
    roundedRect(ctx, x, y, w, h, radius);
    ctx.stroke();
  }

  ctx.restore();
}