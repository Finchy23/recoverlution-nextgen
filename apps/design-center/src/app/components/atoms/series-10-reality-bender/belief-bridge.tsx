/**
 * ATOM 093: THE BELIEF BRIDGE ENGINE
 * Series 10 — Reality Bender · Position 3
 * Step into the void — tiles materialise under your feet.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const TILE_COLOR: RGB = [120, 110, 140];
const TILE_GLOW: RGB = [180, 170, 210];
const VOID_COLOR: RGB = [8, 6, 14];
const AVATAR: RGB = [200, 190, 220];
const BG_BASE: RGB = [18, 16, 24];

const TILE_COUNT = 12;
const TILE_PROXIMITY = 0.12; // ratio of minDim

export default function BeliefBridgeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0, avatarX: 0, avatarY: 0,
    isDragging: false, dragOffsetX: 0, dragOffsetY: 0,
    tiles: [] as { x: number; y: number; alpha: number; revealed: boolean }[],
    tilesRevealed: 0, resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const { width: w, height: h } = viewport;
    const minDim = Math.min(w, h);
    const s = stateRef.current;
    s.avatarX = w * 0.12; s.avatarY = h * 0.5;
    s.tiles = [];
    for (let i = 0; i < TILE_COUNT; i++) {
      s.tiles.push({
        x: w * 0.15 + (i + 1) * (w * 0.65 / TILE_COUNT),
        y: h * 0.5 + Math.sin(i * 0.7) * minDim * 0.03,
        alpha: 0, revealed: false,
      });
    }
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current; const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const d = Math.sqrt((px - s.avatarX) ** 2 + (py - s.avatarY) ** 2);
      if (d < minDim * 0.06) {
        s.isDragging = true;
        s.dragOffsetX = px - s.avatarX;
        s.dragOffsetY = py - s.avatarY;
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      s.avatarX = (e.clientX - rect.left) / rect.width * w - s.dragOffsetX;
      s.avatarY = (e.clientY - rect.top) / rect.height * h - s.dragOffsetY;
      const threshold = minDim * TILE_PROXIMITY;
      for (const tile of s.tiles) {
        if (tile.revealed) continue;
        const d = Math.sqrt((s.avatarX - tile.x) ** 2 + (s.avatarY - tile.y) ** 2);
        if (d < threshold) {
          tile.revealed = true;
          s.tilesRevealed++;
          onHaptic('seal_stamp');
          if (s.tilesRevealed >= TILE_COUNT && !s.resolved) {
            s.resolved = true; onHaptic('completion'); onResolve?.();
          }
        }
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isDragging = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;
      onStateChange?.(s.tilesRevealed / TILE_COUNT);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Void background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(VOID_COLOR, primaryRgb, 0.01), ELEMENT_ALPHA.secondary.max * ent));
      bgGrad.addColorStop(0.6, rgba(lerpColor(VOID_COLOR, primaryRgb, 0.01), ELEMENT_ALPHA.secondary.max * ent * 0.5));
      bgGrad.addColorStop(1, rgba(lerpColor(VOID_COLOR, primaryRgb, 0.01), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03);
      ctx.fillRect(0, 0, w, h);

      const tileW = minDim * 0.045;
      const tileH = minDim * 0.015;
      const tileCol = lerpColor(TILE_COLOR, primaryRgb, 0.04);
      const glowCol = lerpColor(TILE_GLOW, primaryRgb, 0.04);

      // Animate tile alphas
      for (const tile of s.tiles) {
        if (tile.revealed) tile.alpha = Math.min(1, tile.alpha + 0.05);
      }

      // Draw tiles
      for (const tile of s.tiles) {
        if (tile.alpha < 0.01) continue;
        // Glow
        const glowR = tileW * 0.8;
        const grad = ctx.createRadialGradient(tile.x, tile.y, 0, tile.x, tile.y, glowR);
        grad.addColorStop(0, rgba(glowCol, ELEMENT_ALPHA.glow.min * ent * tile.alpha));
        grad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(tile.x, tile.y, glowR, 0, Math.PI * 2); ctx.fill();

        // Tile body
        ctx.fillStyle = rgba(tileCol, ELEMENT_ALPHA.primary.max * ent * tile.alpha);
        ctx.fillRect(tile.x - tileW / 2, tile.y - tileH / 2, tileW, tileH);
      }

      // Draw avatar
      const avCol = lerpColor(AVATAR, primaryRgb, 0.05);
      const avR = minDim * 0.015;
      ctx.fillStyle = rgba(avCol, ELEMENT_ALPHA.primary.max * ent);
      ctx.beginPath(); ctx.arc(s.avatarX, s.avatarY - avR * 1.5, avR * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(s.avatarX - avR * 0.2, s.avatarY - avR * 0.8, avR * 0.4, avR * 1.2);

      // Instruction
      if (s.tilesRevealed === 0) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(TILE_GLOW, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('drag into the void — the bridge appears', cx, h * 0.88);
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
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'grab' }}
    />
  );
}