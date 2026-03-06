/**
 * ATOM 686: THE KEYSTONE REMOVAL ENGINE
 * ========================================
 * Series 69 — Minimum Effective Dose · Position 6
 *
 * Don't rebuild your entire life. Find the single tiny keystone
 * holding the oppressive arch together — slide it out — gravity
 * collapses the massive architecture instantly.
 *
 * PHYSICS:
 *   - Towering arch made of stone blocks rendered as rectangles
 *   - Pushing pillars = error (bolted to bedrock)
 *   - Keystone: small wedge at the very top of the arch
 *   - Drag keystone outward to remove it
 *   - Without keystone: gravity cascade — blocks fall inward
 *   - Each block falls with acceleration, slight random delay
 *   - Dust cloud rises from collapsed rubble
 *
 * INTERACTION:
 *   Tap pillars → error_boundary (bolted)
 *   Drag keystone out → gravity collapse (completion)
 *
 * RENDER: Canvas 2D with architectural block collapse
 * REDUCED MOTION: Static collapsed rubble with clear space above
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const ARCH_BLOCKS = 11;             // odd number, center is keystone
const BLOCK_W = 0.045;
const BLOCK_H = 0.025;
const ARCH_RADIUS = 0.22;
const ARCH_CENTER_Y = 0.45;
const PILLAR_BLOCKS = 5;
const PILLAR_W = 0.04;
const PILLAR_H = 0.03;
const GRAVITY = 0.0004;
const KEYSTONE_DRAG_DIST = 0.06;
const DUST_COUNT = 15;
const DUST_SPEED = 0.0015;
const COLLAPSE_DELAY_PER = 3;      // frames delay between adjacent blocks
const GLOW_LAYERS = 3;

interface ArchBlock {
  x: number; y: number;
  angle: number;
  falling: boolean;
  fallDelay: number;
  vy: number;
  isKeystone: boolean;
  removed: boolean;
}

interface DustPuff {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  life: number;
}

export default function KeystoneRemovalAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildArch = (): ArchBlock[] => {
    const blocks: ArchBlock[] = [];
    const mid = Math.floor(ARCH_BLOCKS / 2);
    for (let i = 0; i < ARCH_BLOCKS; i++) {
      const t = (i - mid) / mid;
      const angle = t * (Math.PI * 0.45);
      const bx = 0.5 + Math.sin(angle) * ARCH_RADIUS;
      const by = ARCH_CENTER_Y - Math.cos(angle) * ARCH_RADIUS;
      blocks.push({
        x: bx, y: by, angle: angle,
        falling: false, fallDelay: Math.abs(i - mid) * COLLAPSE_DELAY_PER,
        vy: 0, isKeystone: i === mid, removed: false,
      });
    }
    // Pillar blocks (left and right)
    const leftBase = blocks[0];
    const rightBase = blocks[ARCH_BLOCKS - 1];
    for (let i = 0; i < PILLAR_BLOCKS; i++) {
      blocks.push({
        x: leftBase.x - 0.005, y: leftBase.y + (i + 1) * PILLAR_H,
        angle: 0, falling: false, fallDelay: (mid + i) * COLLAPSE_DELAY_PER,
        vy: 0, isKeystone: false, removed: false,
      });
      blocks.push({
        x: rightBase.x + 0.005, y: rightBase.y + (i + 1) * PILLAR_H,
        angle: 0, falling: false, fallDelay: (mid + i) * COLLAPSE_DELAY_PER,
        vy: 0, isKeystone: false, removed: false,
      });
    }
    return blocks;
  };

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    blocks: buildArch(),
    keystoneRemoved: false,
    collapseFrame: 0,
    draggingKeystone: false,
    keystoneDragY: 0,
    dusts: [] as DustPuff[],
    completed: false,
    stepNotified: false,
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        // Rubble at bottom
        for (let i = 0; i < 8; i++) {
          const rx = cx + (Math.random() - 0.5) * px(0.2, minDim);
          const ry = h * 0.85 + Math.random() * px(0.03, minDim);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
          ctx.fillRect(rx, ry, px(BLOCK_W * 0.5, minDim), px(BLOCK_H * 0.5, minDim));
        }
        // Freedom glow
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, px(SIZE.md, minDim));
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(cx - px(SIZE.md, minDim), cy - px(SIZE.md, minDim),
          px(SIZE.md * 2, minDim), px(SIZE.md * 2, minDim));
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve' && !s.keystoneRemoved) {
        s.keystoneRemoved = true;
      }

      // ── Collapse physics ──────────────────────────────────
      if (s.keystoneRemoved) {
        s.collapseFrame += ms;
        let fallenCount = 0;
        for (const b of s.blocks) {
          if (b.isKeystone || b.removed) continue;
          if (s.collapseFrame > b.fallDelay && !b.falling) {
            b.falling = true;
          }
          if (b.falling) {
            b.vy += GRAVITY * ms;
            b.y += b.vy * ms;
            // Land at bottom
            if (b.y > 0.88) {
              b.y = 0.88 + Math.random() * 0.02;
              b.vy = 0;
              b.falling = false;
              fallenCount++;
            }
          }
          if (b.y > 0.85) fallenCount++;
        }

        if (fallenCount > s.blocks.length * 0.3 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('drag_snap');
        }

        const totalNonKey = s.blocks.filter(b => !b.isKeystone).length;
        const landed = s.blocks.filter(b => !b.isKeystone && b.y > 0.85).length;
        if (landed >= totalNonKey && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
          // Dust
          for (let i = 0; i < DUST_COUNT; i++) {
            s.dusts.push({
              x: 0.3 + Math.random() * 0.4,
              y: 0.88,
              vx: (Math.random() - 0.5) * DUST_SPEED,
              vy: -DUST_SPEED * (0.5 + Math.random()),
              size: 0.004 + Math.random() * 0.006,
              life: 60 + Math.random() * 30,
            });
          }
        }

        cb.onStateChange?.(s.completed ? 1 : 0.3 + landed / totalNonKey * 0.7);
      }

      // Dust animation
      for (let i = s.dusts.length - 1; i >= 0; i--) {
        const d = s.dusts[i];
        d.x += d.vx * ms; d.y += d.vy * ms;
        d.vy *= 0.995;
        d.life -= ms;
        if (d.life <= 0) s.dusts.splice(i, 1);
      }

      // ── 1. Blocks ────────────────────────────────────────
      for (const b of s.blocks) {
        if (b.removed) continue;
        if (b.isKeystone && s.keystoneRemoved) continue;

        const bx = b.x * w;
        const by = b.y * h;
        const bW = px(b.isKeystone ? BLOCK_W * 0.7 : BLOCK_W, minDim);
        const bH = px(BLOCK_H, minDim);

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(b.angle * (b.falling ? 1 + b.vy * 3 : 1));

        // Block body
        ctx.fillStyle = rgba(
          b.isKeystone ? lerpColor(s.accentRgb, s.primaryRgb, 0.4) : s.accentRgb,
          ALPHA.content.max * (b.isKeystone ? 0.4 : 0.25) * entrance
        );
        ctx.fillRect(-bW / 2, -bH / 2, bW, bH);

        // Block outline
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(0.0005, minDim);
        ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);

        // Keystone glow
        if (b.isKeystone && !s.keystoneRemoved) {
          const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * 0.04);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * pulse * entrance);
          ctx.fillRect(-bW, -bH, bW * 2, bH * 2);
        }

        ctx.restore();
      }

      // ── 2. Dragging keystone ─────────────────────────────
      if (s.draggingKeystone) {
        const ks = s.blocks.find(b => b.isKeystone);
        if (ks) {
          const kx = ks.x * w;
          const ky = s.keystoneDragY * h;
          const kW = px(BLOCK_W * 0.7, minDim);
          const kH = px(BLOCK_H, minDim);
          ctx.fillStyle = rgba(lerpColor(s.accentRgb, s.primaryRgb, 0.5),
            ALPHA.content.max * 0.5 * entrance);
          ctx.fillRect(kx - kW / 2, ky - kH / 2, kW, kH);
        }
      }

      // ── 3. Dust ──────────────────────────────────────────
      for (const d of s.dusts) {
        const lr = d.life / 90;
        const dR = px(d.size * lr, minDim);
        const dg = ctx.createRadialGradient(d.x * w, d.y * h, 0, d.x * w, d.y * h, dR);
        dg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.08 * lr * entrance));
        dg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = dg;
        ctx.fillRect(d.x * w - dR, d.y * h - dR, dR * 2, dR * 2);
      }

      // ── 4. Freedom glow (post-collapse) ───────────────────
      if (s.completed) {
        const fR = px(SIZE.md, minDim);
        const fg = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy * 0.8, fR * 2);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(cx - fR * 2, cy * 0.8 - fR * 2, fR * 4, fR * 4);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed || s.keystoneRemoved) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Check keystone
      const ks = s.blocks.find(b => b.isKeystone);
      if (ks && Math.hypot(mx - ks.x, my - ks.y) < 0.04) {
        s.draggingKeystone = true;
        s.keystoneDragY = ks.y;
        callbacksRef.current.onHaptic('drag_snap');
        return;
      }

      // Tap pillar = error
      callbacksRef.current.onHaptic('error_boundary');
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.draggingKeystone) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      s.keystoneDragY = my;

      const ks = s.blocks.find(b => b.isKeystone);
      if (ks && Math.abs(my - ks.y) > KEYSTONE_DRAG_DIST) {
        s.keystoneRemoved = true;
        s.draggingKeystone = false;
        ks.removed = true;
        callbacksRef.current.onStateChange?.(0.3);
      }
    };

    const onUp = () => {
      const s = stateRef.current;
      if (s.draggingKeystone && !s.keystoneRemoved) {
        s.draggingKeystone = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
