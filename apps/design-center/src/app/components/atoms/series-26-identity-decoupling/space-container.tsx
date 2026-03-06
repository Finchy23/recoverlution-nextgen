/**
 * ATOM 257: THE SPACE CONTAINER ENGINE
 * =======================================
 * Series 26 — Identity Decoupling · Position 7
 *
 * You are not the furniture — you are the room. Expand the bounding
 * box into a massive cathedral; thoughts become insignificant marbles.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Room rendered as SDF box that expands with smooth anti-aliased edges
 *   - Marbles (thoughts) are SDF circles with soft procedural boundaries
 *   - As room expands, marble SDF radii stay constant but appear
 *     relatively tiny — the SDF ratio shift IS the therapeutic insight
 *   - Room edge SDF glow intensifies as expansion reveals vastness
 *   - Floor grid lines use SDF-derived opacity for depth perspective
 *
 * PHYSICS:
 *   - Initial: cluttered wireframe room, marbles nearly fill it
 *   - Hold → room SDF box expands outward (3D perspective wireframe)
 *   - Marbles bounce with gravity, stay same absolute size
 *   - Ghost wireframes of previous room sizes linger
 *   - Vastness glow fills expanded space — cathedral ambience
 *   - 8 render layers: atmosphere, vastness glow, ghost wireframes,
 *     room wireframe, floor grid, marbles, marble specular, progress
 *
 * INTERACTION:
 *   Hold to expand room (hold_start, step_advance, completion)
 *
 * RENDER: Canvas 2D with SDF box expansion + bouncing marbles
 * REDUCED MOTION: Fully expanded cathedral, tiny marbles
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Initial room half-width (fraction of minDim) */
const ROOM_MIN = 0.08;
/** Maximum room half-width */
const ROOM_MAX = 0.38;
/** Expansion rate per frame while holding */
const EXPAND_RATE = 0.003;
/** Number of thought-marbles */
const MARBLE_COUNT = 7;
/** Marble radius (constant, stays small) */
const MARBLE_R = 0.012;
/** Marble gravity */
const MARBLE_GRAVITY = 0.00008;
/** Marble bounce damping */
const MARBLE_BOUNCE = 0.65;
/** Ghost wireframe decay */
const GHOST_DECAY = 0.985;
/** Maximum ghost count */
const GHOST_MAX = 5;
/** Glow layers for vastness */
const GLOW_LAYERS = 5;
/** Floor grid line count */
const GRID_LINES = 6;
/** 3D depth perspective factor */
const DEPTH_FACTOR = 0.6;
/** Vanishing point Y offset */
const VANISH_Y_OFF = -0.15;
/** Step haptic threshold */
const STEP_THRESHOLD = 0.5;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface Marble {
  x: number; y: number; vx: number; vy: number;
  hue: number;
}

interface GhostRoom {
  size: number; alpha: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw 3D perspective wireframe room */
function drawRoom(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, halfW: number, alpha: number,
  entrance: number, isGhost: boolean,
) {
  const pxW = px(halfW, minDim);
  const pxH = pxW * 0.9;
  const depthW = pxW * DEPTH_FACTOR;
  const depthH = pxH * DEPTH_FACTOR;
  const vanishY = cy + px(VANISH_Y_OFF, minDim);

  const lineA = ALPHA.content.max * alpha * entrance * (isGhost ? 0.3 : 1);
  const lineW = px(isGhost ? STROKE.hairline : STROKE.thin, minDim);

  // Front face
  ctx.beginPath();
  ctx.rect(cx - pxW, cy - pxH, pxW * 2, pxH * 2);
  ctx.strokeStyle = rgba(color, lineA * 0.5);
  ctx.lineWidth = lineW;
  ctx.stroke();

  // Back face (smaller, shifted toward vanishing point)
  ctx.beginPath();
  ctx.rect(cx - depthW, vanishY - depthH, depthW * 2, depthH * 2);
  ctx.strokeStyle = rgba(color, lineA * 0.25);
  ctx.lineWidth = lineW * 0.7;
  ctx.stroke();

  // Connecting depth lines (corners)
  const corners = [
    [cx - pxW, cy - pxH, cx - depthW, vanishY - depthH],
    [cx + pxW, cy - pxH, cx + depthW, vanishY - depthH],
    [cx - pxW, cy + pxH, cx - depthW, vanishY + depthH],
    [cx + pxW, cy + pxH, cx + depthW, vanishY + depthH],
  ];
  for (const [x1, y1, x2, y2] of corners) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = rgba(color, lineA * 0.15);
    ctx.lineWidth = lineW * 0.5;
    ctx.stroke();
  }

  // ── SDF edge glow on front face ─────────────────────────────
  if (!isGhost) {
    const edgeGlowW = px(0.015, minDim);
    const frontGrad = ctx.createRadialGradient(cx, cy, pxW * 0.8, cx, cy, pxW + edgeGlowW);
    frontGrad.addColorStop(0, rgba(color, 0));
    frontGrad.addColorStop(0.85, rgba(color, ALPHA.glow.max * alpha * 0.06 * entrance));
    frontGrad.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = frontGrad;
    ctx.fillRect(cx - pxW - edgeGlowW, cy - pxH - edgeGlowW,
      (pxW + edgeGlowW) * 2, (pxH + edgeGlowW) * 2);
  }
}

/** Draw floor grid with perspective */
function drawFloorGrid(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, halfW: number, entrance: number,
) {
  const pxW = px(halfW, minDim);
  const pxH = pxW * 0.9;
  const floorY = cy + pxH;

  for (let gl = 1; gl <= GRID_LINES; gl++) {
    const t = gl / (GRID_LINES + 1);
    const lineX = pxW * 2 * t - pxW;

    ctx.beginPath();
    ctx.moveTo(cx + lineX, floorY);
    ctx.lineTo(cx + lineX * DEPTH_FACTOR, cy + px(VANISH_Y_OFF, minDim) + px(halfW * DEPTH_FACTOR * 0.9, minDim));
    ctx.strokeStyle = rgba(color, ALPHA.content.max * 0.025 * entrance);
    ctx.lineWidth = px(STROKE.hairline, minDim);
    ctx.stroke();
  }
}

// ════════════���════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function SpaceContainerAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const initMarbles = (): Marble[] => {
    const marbles: Marble[] = [];
    for (let i = 0; i < MARBLE_COUNT; i++) {
      marbles.push({
        x: (Math.random() - 0.5) * ROOM_MIN * 1.2,
        y: (Math.random() - 0.5) * ROOM_MIN * 0.8,
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.001,
        hue: i / MARBLE_COUNT,
      });
    }
    return marbles;
  };

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    roomSize: ROOM_MIN,
    holding: false, holdNotified: false,
    marbles: initMarbles(),
    ghosts: [] as GhostRoom[],
    stepNotified: false, completed: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.roomSize = ROOM_MAX; s.completed = true;
      }

      const breathMod = 1 + p.breathAmplitude * 0.03;

      // Expand room
      if (s.holding && !s.completed) {
        const prevSize = s.roomSize;
        s.roomSize = Math.min(ROOM_MAX, s.roomSize + EXPAND_RATE * ms);
        // Spawn ghost on significant expansion
        if (s.roomSize - prevSize > 0.01 && s.ghosts.length < GHOST_MAX && s.frameCount % 20 === 0) {
          s.ghosts.push({ size: prevSize, alpha: 0.35 });
        }
      }

      // Marble physics
      for (const m of s.marbles) {
        m.vy += MARBLE_GRAVITY * ms;
        m.x += m.vx * ms;
        m.y += m.vy * ms;

        const bound = s.roomSize * 0.85;
        if (m.x > bound - MARBLE_R) { m.x = bound - MARBLE_R; m.vx = -m.vx * MARBLE_BOUNCE; }
        if (m.x < -bound + MARBLE_R) { m.x = -bound + MARBLE_R; m.vx = -m.vx * MARBLE_BOUNCE; }
        if (m.y > bound * 0.85 - MARBLE_R) { m.y = bound * 0.85 - MARBLE_R; m.vy = -m.vy * MARBLE_BOUNCE; }
        if (m.y < -bound * 0.85 + MARBLE_R) { m.y = -bound * 0.85 + MARBLE_R; m.vy = -m.vy * MARBLE_BOUNCE; }
      }

      // Ghost decay
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      const expandT = (s.roomSize - ROOM_MIN) / (ROOM_MAX - ROOM_MIN);

      if (expandT >= STEP_THRESHOLD && !s.stepNotified) {
        s.stepNotified = true; cb.onHaptic('step_advance');
      }
      if (expandT >= 0.95 && !s.completed) {
        s.completed = true; cb.onHaptic('completion');
      }
      cb.onStateChange?.(expandT);

      // ═══════════════════════════════════════════════════════
      // LAYER 1: Vastness glow (grows with expansion)
      // ═══════════════════════════════════════════════════════
      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = px(s.roomSize * (1.2 + i * 0.3), minDim);
        const gA = ALPHA.glow.max * expandT * 0.05 * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA * 0.6));
        gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.2));
        gg.addColorStop(0.8, rgba(s.primaryRgb, gA * 0.05));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 2: Ghost wireframes
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        drawRoom(ctx, cx, cy, minDim, s.accentRgb, g.size, g.alpha, entrance, true);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 3: Room wireframe
      // ═══════════════════════════════════════════════════════
      drawRoom(ctx, cx, cy, minDim, s.primaryRgb, s.roomSize, 0.15 + expandT * 0.1, entrance, false);

      // ═══════════════════════════════════════════════════════
      // LAYER 4: Floor grid
      // ═══════════════════════════════════════════════════════
      drawFloorGrid(ctx, cx, cy, minDim, s.primaryRgb, s.roomSize, entrance);

      // ═══════════════════════════════════════════════════════
      // LAYER 5-6: Marbles with SDF rendering + specular
      // ═══════════════════════════════════════════════════════
      for (const m of s.marbles) {
        const mx = cx + px(m.x, minDim);
        const my = cy + px(m.y, minDim);
        const mr = px(MARBLE_R, minDim) * breathMod;

        // Marble shadow
        ctx.beginPath();
        ctx.arc(mx + 1, my + 2, mr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.glow.min * 0.06 * entrance);
        ctx.fill();

        // Marble body (4-stop SDF gradient)
        const mColor = lerpColor(s.accentRgb, s.primaryRgb, m.hue);
        const mGrad = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
        mGrad.addColorStop(0, rgba(mColor, ALPHA.content.max * 0.35 * entrance));
        mGrad.addColorStop(0.3, rgba(mColor, ALPHA.content.max * 0.28 * entrance));
        mGrad.addColorStop(0.7, rgba(mColor, ALPHA.content.max * 0.18 * entrance));
        mGrad.addColorStop(1, rgba(mColor, ALPHA.content.max * 0.05 * entrance));
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mr, 0, Math.PI * 2);
        ctx.fill();

        // Marble specular
        const specX = mx - mr * 0.25;
        const specY = my - mr * 0.3;
        const specR = mr * 0.2;
        const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
        specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.2 * entrance));
        specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
        ctx.fillStyle = specGrad;
        ctx.beginPath();
        ctx.arc(specX, specY, specR, 0, Math.PI * 2);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 7: Progress ring
      // ═══════════════════════════════════════════════════════
      if (!s.completed && expandT > 0) {
        const pR = px(ROOM_MAX + 0.03, minDim);
        const pAngle = expandT * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pR, -Math.PI / 2, -Math.PI / 2 + pAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = () => {
      stateRef.current.holding = true;
      if (!stateRef.current.holdNotified) {
        stateRef.current.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onUp = () => { stateRef.current.holding = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'pointer',
      }} />
    </div>
  );
}
