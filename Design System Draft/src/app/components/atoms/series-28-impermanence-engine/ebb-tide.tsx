/**
 * ATOM 275: THE EBB TIDE ENGINE
 * ================================
 * Series 28 — Impermanence Engine · Position 5
 *
 * Write your tragedy in the sand. Let the ocean wash it smooth.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Sand surface as woven cloth grid (interlocking fiber lattice)
 *   - Drawing disturbs fibers — pulls threads out of alignment
 *   - Tide = cloth tension restoration (fibers spring back to grid)
 *   - Entropy arc: ordered weave → disturbed marks → smoothed restoration
 *   - Water rendered as translucent cloth sheet sweeping across surface
 *
 * PHYSICS:
 *   - 2D fiber grid (20x14 points) representing sand surface
 *   - Drawing near fibers displaces them from rest position
 *   - Minimum marks threshold before tide triggers
 *   - Tide: sinusoidal sweep from right, resets fiber positions
 *   - Water sheet: cloth membrane with wave-crested edge
 *   - Foam particles along water leading edge
 *   - 8 render layers: atmosphere, sand base, fiber grid, marks,
 *     water sheet, foam particles, specular, completion glow
 *
 * INTERACTION:
 *   Draw on sand → leave marks (drag_snap)
 *   Release after enough marks → tide sweeps clean (completion)
 *
 * RENDER: Canvas 2D with fiber-grid sand + cloth-wave water
 * REDUCED MOTION: Static pristine sand surface
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Fiber grid columns */
const GRID_COLS = 22;
/** Fiber grid rows */
const GRID_ROWS = 16;
/** Sand area top (fraction of viewport height) */
const SAND_TOP = 0.35;
/** Sand area bottom */
const SAND_BOTTOM = 0.95;
/** Sand area left */
const SAND_LEFT = 0.04;
/** Sand area right */
const SAND_RIGHT = 0.96;
/** Drawing influence radius (fraction of viewport) */
const DRAW_RADIUS = 0.06;
/** Maximum fiber displacement */
const MAX_DISPLACE = 0.025;
/** Minimum marks before tide triggers */
const MIN_MARKS = 8;
/** Tide sweep speed (fraction per frame) */
const TIDE_SPEED = 0.008;
/** Water sheet wave amplitude */
const WAVE_AMP = 0.02;
/** Foam particle count along wave edge */
const FOAM_COUNT = 30;
/** Fiber spring-back rate during tide */
const SPRING_BACK = 0.04;
/** Breath coupling to wave motion */
const BREATH_WAVE = 0.005;
/** Water sheet cloth drape depth */
const WATER_DRAPE = 0.008;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface FiberNode {
  /** Rest X (fraction) */
  rx: number;
  /** Rest Y (fraction) */
  ry: number;
  /** Current displacement X */
  dx: number;
  /** Current displacement Y */
  dy: number;
  /** Whether this fiber has been disturbed */
  disturbed: boolean;
}

interface DrawMark {
  x: number; y: number;
  size: number;
}

interface FoamDot {
  x: number; y: number;
  size: number; life: number;
  vx: number; vy: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════

function createFiberGrid(): FiberNode[][] {
  const grid: FiberNode[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const row: FiberNode[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      row.push({
        rx: SAND_LEFT + (c / (GRID_COLS - 1)) * (SAND_RIGHT - SAND_LEFT),
        ry: SAND_TOP + (r / (GRID_ROWS - 1)) * (SAND_BOTTOM - SAND_TOP),
        dx: 0, dy: 0,
        disturbed: false,
      });
    }
    grid.push(row);
  }
  return grid;
}

export default function EbbTideAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    drawing: false,
    pointerX: 0,
    pointerY: 0,
    marks: [] as DrawMark[],
    grid: createFiberGrid(),
    tideActive: false,
    tideProgress: 0,
    foam: [] as FoamDot[],
    completed: false,
    dragNotified: false,
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
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0) * BREATH_WAVE;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) { s.completed = true; s.tideProgress = 1; }
      if (p.phase === 'resolve') { s.tideProgress = 1; s.completed = true; }

      // ── Drawing: disturb fibers near pointer ────────────────────
      if (s.drawing) {
        const px_ = s.pointerX;
        const py_ = s.pointerY;
        for (const row of s.grid) {
          for (const node of row) {
            const dist = Math.hypot(node.rx - px_, node.ry - py_);
            if (dist < DRAW_RADIUS) {
              const force = 1 - dist / DRAW_RADIUS;
              const angle = Math.atan2(node.ry - py_, node.rx - px_);
              node.dx += Math.cos(angle) * force * MAX_DISPLACE * 0.3;
              node.dy += Math.sin(angle) * force * MAX_DISPLACE * 0.3;
              node.dx = Math.max(-MAX_DISPLACE, Math.min(MAX_DISPLACE, node.dx));
              node.dy = Math.max(-MAX_DISPLACE, Math.min(MAX_DISPLACE, node.dy));
              node.disturbed = true;
            }
          }
        }
        // Record mark
        if (s.frameCount % 3 === 0) {
          s.marks.push({ x: px_, y: py_, size: 0.005 + Math.random() * 0.008 });
        }
      }

      // ── Tide physics ────────────────────────────────────────────
      if (s.tideActive && !s.completed) {
        s.tideProgress = Math.min(1, s.tideProgress + TIDE_SPEED * ms);

        // Spawn foam along wave edge
        if (s.frameCount % 2 === 0 && s.foam.length < FOAM_COUNT) {
          const edgeX = 1.05 - s.tideProgress * 1.3;
          s.foam.push({
            x: edgeX + (Math.random() - 0.5) * 0.05,
            y: SAND_TOP + Math.random() * (SAND_BOTTOM - SAND_TOP),
            size: 0.003 + Math.random() * 0.005,
            life: 1,
            vx: -0.001, vy: (Math.random() - 0.5) * 0.001,
          });
        }

        // Spring fibers back as tide passes
        for (const row of s.grid) {
          for (const node of row) {
            const tideX = 1.05 - s.tideProgress * 1.3;
            if (node.rx < tideX + 0.1) {
              node.dx *= (1 - SPRING_BACK * ms);
              node.dy *= (1 - SPRING_BACK * ms);
              if (Math.abs(node.dx) < 0.0005 && Math.abs(node.dy) < 0.0005) {
                node.dx = 0; node.dy = 0; node.disturbed = false;
              }
            }
          }
        }

        // Fade marks as tide passes
        for (let i = s.marks.length - 1; i >= 0; i--) {
          const mk = s.marks[i];
          const tideX = 1.05 - s.tideProgress * 1.3;
          if (mk.x > tideX - 0.1) {
            s.marks.splice(i, 1);
          }
        }

        if (s.tideProgress >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      // Update foam
      for (let i = s.foam.length - 1; i >= 0; i--) {
        const fm = s.foam[i];
        fm.x += fm.vx * ms;
        fm.y += fm.vy * ms;
        fm.life -= 0.01 * ms;
        if (fm.life <= 0) s.foam.splice(i, 1);
      }

      cb.onStateChange?.(s.completed ? 1 : s.tideActive ? s.tideProgress * 0.9 : 0);

      // ── 1. Sand base gradient ───────────────────────────────────
      const sandH = (SAND_BOTTOM - SAND_TOP) * h;
      const sandY = SAND_TOP * h;
      const sandGrad = ctx.createLinearGradient(0, sandY, 0, sandY + sandH);
      sandGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.04 * entrance));
      sandGrad.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.06 * entrance));
      sandGrad.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.05 * entrance));
      sandGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.03 * entrance));
      ctx.fillStyle = sandGrad;
      ctx.fillRect(SAND_LEFT * w, sandY, (SAND_RIGHT - SAND_LEFT) * w, sandH);

      // ── 2. Fiber grid (cloth weave) ─────────────────────────────
      // Horizontal threads (warp)
      for (let r = 0; r < GRID_ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c < GRID_COLS; c++) {
          const node = s.grid[r][c];
          const nx = (node.rx + node.dx) * w;
          const ny = (node.ry + node.dy) * h;
          if (c === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        const rowAlpha = ALPHA.content.max * 0.06 * entrance;
        ctx.strokeStyle = rgba(s.primaryRgb, rowAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // Vertical threads (weft)
      for (let c = 0; c < GRID_COLS; c++) {
        ctx.beginPath();
        for (let r = 0; r < GRID_ROWS; r++) {
          const node = s.grid[r][c];
          const nx = (node.rx + node.dx) * w;
          const ny = (node.ry + node.dy) * h;
          if (r === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // Disturbed node stress dots
      for (const row of s.grid) {
        for (const node of row) {
          if (!node.disturbed) continue;
          const stress = Math.hypot(node.dx, node.dy) / MAX_DISPLACE;
          if (stress < 0.1) continue;
          const nx = (node.rx + node.dx) * w;
          const ny = (node.ry + node.dy) * h;
          const dotR = px(0.003 + stress * 0.004, minDim);
          const dotG = ctx.createRadialGradient(nx, ny, 0, nx, ny, dotR);
          dotG.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * stress * entrance));
          dotG.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = dotG;
          ctx.fillRect(nx - dotR, ny - dotR, dotR * 2, dotR * 2);
        }
      }

      // ── 3. Draw marks ──────────────────────────────────────────
      for (const mk of s.marks) {
        const mx = mk.x * w;
        const my = mk.y * h;
        const mr = px(mk.size, minDim);
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
        mg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance));
        mg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.06 * entrance));
        mg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = mg;
        ctx.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
      }

      // ── 4. Water sheet (cloth membrane) ─────────────────────────
      if (s.tideActive && s.tideProgress > 0 && s.tideProgress < 1.05) {
        const waveEdgeX = (1.05 - s.tideProgress * 1.3) * w;
        const waterLeft = Math.max(0, waveEdgeX - w * 0.4);
        const waterRight = Math.min(w, waveEdgeX);

        if (waterRight > waterLeft) {
          // Water body
          ctx.beginPath();
          ctx.moveTo(waterRight, sandY);
          // Wavy leading edge
          for (let wy = sandY; wy <= sandY + sandH; wy += 4) {
            const wFrac = (wy - sandY) / sandH;
            const waveX = waterRight + Math.sin(wFrac * Math.PI * 6 + time * 3) * px(WAVE_AMP, minDim)
              + Math.sin(wFrac * Math.PI * 3 + time) * breath * minDim;
            ctx.lineTo(waveX, wy);
          }
          ctx.lineTo(waterRight, sandY + sandH);
          ctx.lineTo(waterLeft, sandY + sandH);
          ctx.lineTo(waterLeft, sandY);
          ctx.closePath();

          const waterGrad = ctx.createLinearGradient(waterLeft, 0, waterRight, 0);
          const waterCol = lerpColor(s.primaryRgb, [100, 160, 220], 0.15);
          waterGrad.addColorStop(0, rgba(waterCol, ALPHA.content.max * 0.08 * entrance));
          waterGrad.addColorStop(0.6, rgba(waterCol, ALPHA.content.max * 0.14 * entrance));
          waterGrad.addColorStop(0.9, rgba(waterCol, ALPHA.content.max * 0.10 * entrance));
          waterGrad.addColorStop(1, rgba(waterCol, ALPHA.content.max * 0.04 * entrance));
          ctx.fillStyle = waterGrad;
          ctx.fill();

          // Water drape threads (horizontal)
          for (let r = 0; r < 6; r++) {
            const drapeY = sandY + (r / 5) * sandH;
            ctx.beginPath();
            for (let dx = waterLeft; dx <= waterRight; dx += 8) {
              const dFrac = (dx - waterLeft) / Math.max(1, waterRight - waterLeft);
              const dWave = Math.sin(dFrac * 10 + time * 2 + r) * px(WATER_DRAPE, minDim);
              if (dx === waterLeft) ctx.moveTo(dx, drapeY + dWave);
              else ctx.lineTo(dx, drapeY + dWave);
            }
            ctx.strokeStyle = rgba(waterCol, ALPHA.content.max * 0.05 * entrance);
            ctx.lineWidth = px(STROKE.hairline, minDim);
            ctx.stroke();
          }

          // Water specular
          const wSpecX = (waterLeft + waterRight) * 0.5;
          const wSpecY = sandY + sandH * 0.3;
          const wSpecR = px(0.04, minDim);
          const wSpecG = ctx.createRadialGradient(wSpecX, wSpecY, 0, wSpecX, wSpecY, wSpecR);
          wSpecG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.10 * entrance));
          wSpecG.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.03 * entrance));
          wSpecG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
          ctx.fillStyle = wSpecG;
          ctx.fillRect(wSpecX - wSpecR, wSpecY - wSpecR, wSpecR * 2, wSpecR * 2);
        }
      }

      // ── 5. Foam particles ──────────────────────────────────────
      for (const fm of s.foam) {
        const fx = fm.x * w;
        const fy = fm.y * h;
        const fr = px(fm.size, minDim);
        const fAlpha = ALPHA.content.max * 0.12 * fm.life * entrance;
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
        fg.addColorStop(0, rgba([255, 255, 255] as RGB, fAlpha));
        fg.addColorStop(0.5, rgba([255, 255, 255] as RGB, fAlpha * 0.3));
        fg.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2);
      }

      // ── 6. Horizon line ────────────────────────────────────────
      const horizY = SAND_TOP * h - px(0.01, minDim);
      const horizGrad = ctx.createLinearGradient(SAND_LEFT * w, 0, SAND_RIGHT * w, 0);
      horizGrad.addColorStop(0, rgba(s.primaryRgb, 0));
      horizGrad.addColorStop(0.2, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
      horizGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.10 * entrance));
      horizGrad.addColorStop(0.8, rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance));
      horizGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.beginPath();
      ctx.moveTo(SAND_LEFT * w, horizY);
      ctx.lineTo(SAND_RIGHT * w, horizY);
      ctx.strokeStyle = horizGrad;
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── 7. Completion pristine glow ────────────────────────────
      if (s.completed) {
        const pristR = px(0.3, minDim);
        const pristG = ctx.createRadialGradient(cx, cy, 0, cx, cy, pristR);
        pristG.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * entrance));
        pristG.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * entrance));
        pristG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pristG;
        ctx.fillRect(cx - pristR, cy - pristR, pristR * 2, pristR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.tideActive || s.completed) return;
      s.drawing = true;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = () => {
      const s = stateRef.current;
      s.drawing = false;
      if (s.marks.length >= MIN_MARKS && !s.tideActive) {
        s.tideActive = true;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
