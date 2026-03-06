/**
 * ATOM 092: THE DISTORTION ENGINE
 * Series 10 — Reality Bender · Position 2
 * Grid vertex displacement with gaussian touch influence and spring-return.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const GRID_COLOR: RGB = [100, 90, 130];
const GRID_STRESS: RGB = [180, 100, 120];
const DOT_COLOR: RGB = [120, 110, 150];
const BG_BASE: RGB = [18, 16, 24];

const COLS = 20; const ROWS = 16;
const INFLUENCE_RATIO = 0.12; const SPRING_K = 0.04;

export default function DistortionGridAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<{ homeX: number; homeY: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const stateRef = useRef({
    entranceProgress: 0, isPointerDown: false, pointerX: 0, pointerY: 0,
    maxDisplacement: 0, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const { width: w, height: h } = viewport;
    const grid: typeof gridRef.current = [];
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const hx = (c / COLS) * w;
        const hy = (r / ROWS) * h;
        grid.push({ homeX: hx, homeY: hy, x: hx, y: hy, vx: 0, vy: 0 });
      }
    }
    gridRef.current = grid;
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current; const rect = canvas.getBoundingClientRect();
      s.isPointerDown = true;
      s.pointerX = (e.clientX - rect.left) / rect.width * w;
      s.pointerY = (e.clientY - rect.top) / rect.height * h;
      onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isPointerDown) return;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width * w;
      s.pointerY = (e.clientY - rect.top) / rect.height * h;
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isPointerDown = false;
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

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const grid = gridRef.current;
      let maxD = 0;

      // Physics: apply pointer influence + spring return
      for (const node of grid) {
        if (s.isPointerDown && !p.reducedMotion) {
          const influenceR = minDim * INFLUENCE_RATIO;
          const dx = node.homeX - s.pointerX;
          const dy = node.homeY - s.pointerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < influenceR) {
            const force = (1 - dist / influenceR) * minDim * 0.016;
            node.vx += (dx / dist) * force * 0.15;
            node.vy += (dy / dist) * force * 0.15;
          }
        }
        // Spring return
        node.vx += (node.homeX - node.x) * SPRING_K;
        node.vy += (node.homeY - node.y) * SPRING_K;
        node.vx *= 0.88; node.vy *= 0.88;
        node.x += node.vx; node.y += node.vy;

        const d = Math.sqrt((node.x - node.homeX) ** 2 + (node.y - node.homeY) ** 2);
        if (d > maxD) maxD = d;
      }
      s.maxDisplacement = maxD;
      const stressNorm = minDim * 0.06;
      onStateChange?.(Math.min(1, maxD / stressNorm));

      const gridCol = lerpColor(GRID_COLOR, primaryRgb, 0.04);
      const stressCol = lerpColor(GRID_STRESS, primaryRgb, 0.05);
      const dotCol = lerpColor(DOT_COLOR, primaryRgb, 0.04);

      const colCount = COLS + 1;

      // Draw grid lines
      ctx.lineWidth = minDim * 0.0004;
      // Horizontal
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c <= COLS; c++) {
          const idx = r * colCount + c;
          const n = grid[idx];
          const d = Math.sqrt((n.x - n.homeX) ** 2 + (n.y - n.homeY) ** 2);
          const stress = Math.min(1, d / stressNorm);
          ctx.strokeStyle = rgba(lerpColor(gridCol, stressCol, stress), ELEMENT_ALPHA.secondary.max * ent);
          if (c === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
      }
      // Vertical
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        for (let r = 0; r <= ROWS; r++) {
          const idx = r * colCount + c;
          const n = grid[idx];
          if (r === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        }
        ctx.stroke();
      }

      // Intersection dots
      const dotSize = minDim * 0.001;
      for (const n of grid) {
        const d = Math.sqrt((n.x - n.homeX) ** 2 + (n.y - n.homeY) ** 2);
        const stress = Math.min(1, d / stressNorm);
        ctx.fillStyle = rgba(lerpColor(dotCol, stressCol, stress), ELEMENT_ALPHA.primary.min * ent);
        ctx.fillRect(n.x - dotSize / 2, n.y - dotSize / 2, dotSize, dotSize);
      }

      if (s.frame < 120) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(GRID_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.6);
        ctx.fillText('drag to warp reality', w / 2, h * 0.92);
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
  }, [viewport, onStateChange, onHaptic]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'grab' }}
    />
  );
}