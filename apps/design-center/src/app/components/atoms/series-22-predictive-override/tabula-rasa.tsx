/**
 * ATOM 216: THE TABULA RASA ENGINE · S22 · Position 6
 * Labels make you blind. Erase every category to reveal raw luminance.
 * INTERACTION: Draw (erase labels) → luminance revealed
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static luminance
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const LABELS_GRID = ['GOOD', 'BAD', 'RIGHT', 'WRONG', 'SAFE', 'DANGER', 'NORMAL', 'BROKEN', 'STRONG', 'WEAK', 'SMART', 'STUPID'];
const GRID_COLS = 3; const GRID_ROWS = 4; const ERASE_RADIUS = 0.04; const RESPAWN_DELAY = 100;

interface LabelCell { text: string; erased: number; x: number; y: number; }

interface RasaState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  cells: LabelCell[]; erasedCount: number; drawing: boolean; luminance: number;
  completed: boolean; respawnTimer: number; }

function makeCells(): LabelCell[] {
  return LABELS_GRID.map((text, i) => ({
    text, erased: 0,
    x: ((i % GRID_COLS) + 0.5) / GRID_COLS * 0.6 + 0.2,
    y: (Math.floor(i / GRID_COLS) + 0.5) / GRID_ROWS * 0.6 + 0.15,
  }));
}

function freshState(c: string, a: string): RasaState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    cells: makeCells(), erasedCount: 0, drawing: false, luminance: 0,
    completed: false, respawnTimer: 0 }; }

export default function TabulaRasaAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress; const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      s.luminance = s.erasedCount / LABELS_GRID.length;
      cb.onStateChange?.(s.luminance);

      // Luminance base (grows as labels erased)
      if (s.luminance > 0) {
        const lumR = minDim * 0.5 * s.luminance;
        const lumGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lumR);
        lumGrad.addColorStop(0, rgba(s.primaryRgb, s.luminance * ALPHA.glow.max * 0.3 * entrance));
        lumGrad.addColorStop(0.5, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.3), s.luminance * ALPHA.glow.max * 0.15 * entrance));
        lumGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lumGrad; ctx.fillRect(cx - lumR, cy - lumR, lumR * 2, lumR * 2);
      }

      // Label cells
      const cellFont = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${cellFont}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

      for (const cell of s.cells) {
        const cellX = cell.x * w; const cellY = cell.y * h;
        const alive = 1 - cell.erased;

        if (alive > 0.01) {
          // Box
          const boxW = px(0.08, minDim); const boxH = px(0.035, minDim);
          ctx.fillStyle = rgba(s.accentRgb, alive * ALPHA.content.max * 0.1 * entrance);
          ctx.fillRect(cellX - boxW / 2, cellY - boxH / 2, boxW, boxH);
          ctx.strokeStyle = rgba(s.accentRgb, alive * ALPHA.content.max * 0.2 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.strokeRect(cellX - boxW / 2, cellY - boxH / 2, boxW, boxH);
          // Text
          ctx.fillStyle = rgba(s.accentRgb, alive * ALPHA.text.max * 0.5 * entrance);
          ctx.fillText(cell.text, cellX, cellY);
        }

        // Glow where erased
        if (cell.erased > 0.5) {
          const glowR = px(0.03, minDim) * cell.erased;
          const glow = ctx.createRadialGradient(cellX, cellY, 0, cellX, cellY, glowR);
          glow.addColorStop(0, rgba(s.primaryRgb, cell.erased * ALPHA.glow.max * 0.2 * entrance));
          glow.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = glow; ctx.fillRect(cellX - glowR, cellY - glowR, glowR * 2, glowR * 2);
        }
      }
      ctx.textBaseline = 'alphabetic';

      // Progress
      const barW = px(SIZE.md * 0.7, minDim); const barH = px(0.005, minDim);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(cx - barW / 2, h - px(0.07, minDim), barW, barH);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(cx - barW / 2, h - px(0.07, minDim), barW * s.luminance, barH);

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('LUMINANCE', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('DRAW TO ERASE LABELS', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { const sfR = px(SIZE.md, minDim); const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sfR);
        g.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance)); g.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = g; ctx.fillRect(cx - sfR, cy - sfR, sfR * 2, sfR * 2); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const eraseAt = (mx: number, my: number) => {
      const s = stateRef.current;
      for (const cell of s.cells) {
        if (cell.erased >= 1) continue;
        const dist = Math.sqrt((mx - cell.x) ** 2 + (my - cell.y) ** 2);
        if (dist < ERASE_RADIUS) {
          cell.erased = Math.min(1, cell.erased + 0.15);
          if (cell.erased >= 1) { s.erasedCount++; cbRef.current.onHaptic('drag_snap');
            if (s.erasedCount >= LABELS_GRID.length && !s.completed) { s.completed = true; cbRef.current.onHaptic('completion'); cbRef.current.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
          }
        }
      }
    };

    const onDown = (e: PointerEvent) => { stateRef.current.drawing = true; canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect(); eraseAt((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height); };
    const onMove = (e: PointerEvent) => { if (!stateRef.current.drawing) return;
      const rect = canvas.getBoundingClientRect(); eraseAt((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height); };
    const onUp = (e: PointerEvent) => { stateRef.current.drawing = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
