/**
 * ATOM 617: THE U-TURN SLINGSHOT ENGINE
 * =======================================
 * Series 62 — Bezier Curve · Position 7
 *
 * Cure the sunk cost fallacy. Hit the wall — curve the trajectory
 * 180° back on itself. The perfect U-turn slingshots you out of
 * the trap faster than you entered.
 *
 * SIGNATURE TECHNIQUE: Phase Portrait Flow Fields
 *   - Flow arrows show forward momentum hitting a dead end
 *   - As U-turn forms, flow field curves 180° creating a slingshot topology
 *   - Acceleration vectors visible on exit path (longer arrows = faster)
 *   - Physics teaches: turning back can accelerate you forward
 *
 * PHYSICS:
 *   - Node travels right and hits impenetrable wall
 *   - Dead stop with crash haptics
 *   - Drag to curve trajectory into U-turn
 *   - Perfect 180° creates slingshot acceleration
 *   - Exit velocity > entry velocity (visible in flow field)
 *   - Breath modulates wall pulse + node trail glow
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + wall impact field
 *   2. Flow field with slingshot acceleration
 *   3. Wall with glass/crack effects
 *   4. Path shadow + body with speed gradient
 *   5. U-turn arc with velocity-proportional glow
 *   6. Travelling node with motion blur trail
 *   7. Speed indicator particles
 *   8. Progress ring + completion bloom
 *
 * INTERACTION: Drag (curve path downward into U-turn) → slingshot escape
 * RENDER: Canvas 2D (rAF) · REDUCED MOTION: Static U-turn path
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, PARTICLE_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Wall X position */
const WALL_X = 0.78;
/** Wall height fraction */
const WALL_H = 0.7;
/** Wall width */
const WALL_W = STROKE.heavy;
/** Wall glow layers */
const WALL_GLOW_LAYERS = 3;
/** Node start X */
const NODE_START_X = 0.08;
/** Node Y (center line) */
const NODE_Y = 0.38;
/** Node radius */
const NODE_R = PARTICLE_SIZE.xl;
/** Node glow layers */
const NODE_GLOW_LAYERS = 4;
/** U-turn radius */
const UTURN_R = SIZE.md;
/** Path stroke */
const PATH_STROKE = STROKE.bold;
/** Path glow width */
const PATH_GLOW_W = 0.006;
/** Trail particle count */
const TRAIL_COUNT = 20;
/** Speed particle count */
const SPEED_PARTICLES = 40;
/** Flow cols */
const FLOW_COLS = 16;
/** Flow rows */
const FLOW_ROWS = 10;
/** Flow arrow length */
const FLOW_ARROW_LEN = 0.022;
/** Crash shake duration */
const CRASH_SHAKE_DUR = 18;
/** Crash shake amp */
const CRASH_SHAKE_AMP = 0.005;
/** Completion threshold */
const COMPLETE_THRESHOLD = 0.92;
/** Progress ring radius */
const PROGRESS_R = SIZE.sm;
/** Bloom frames */
const BLOOM_FRAMES = 30;
/** Node travel speed */
const NODE_SPEED = 0.004;
/** Slingshot exit speed multiplier */
const SLINGSHOT_BOOST = 1.8;

// =====================================================================
// STATE TYPES
// =====================================================================

interface TrailDot {
  x: number; y: number;
  alpha: number;
}

interface UTurnState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodePhase: 'approaching' | 'crashed' | 'turning' | 'escaping' | 'done';
  nodeT: number;
  turnProgress: number;
  exitT: number;
  crashShake: number;
  dragging: boolean;
  trail: TrailDot[];
  completed: boolean;
  bloomTimer: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function UTurnSlingshotAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef<UTurnState>({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    nodePhase: 'approaching',
    nodeT: 0,
    turnProgress: 0,
    exitT: 0,
    crashShake: 0,
    dragging: false,
    trail: [],
    completed: false,
    bloomTimer: 0,
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
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const wallX = w * WALL_X;
      const nodeY = h * NODE_Y;
      const turnR = px(UTURN_R, minDim);
      const turnCenterX = wallX - px(0.02, minDim);
      const turnCenterY = nodeY + turnR;
      const exitY = nodeY + turnR * 2;

      // ═══════════════════════════════════════════════════════════
      // NODE PHYSICS
      // ═══════════════════════════════════════════════════════════
      if (!p.reducedMotion) {
        if (s.nodePhase === 'approaching') {
          s.nodeT += NODE_SPEED * ms;
          if (s.nodeT >= 0.95) {
            s.nodePhase = 'crashed';
            s.nodeT = 0.95;
            s.crashShake = CRASH_SHAKE_DUR;
            cb.onHaptic('error_boundary');
          }
        }
        if (s.nodePhase === 'escaping') {
          s.exitT += NODE_SPEED * SLINGSHOT_BOOST * ms;
          if (s.exitT >= 1 && !s.completed) {
            s.nodePhase = 'done';
            s.completed = true;
            s.bloomTimer = BLOOM_FRAMES;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
          }
        }
        if (s.crashShake > 0) s.crashShake--;
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 1: ATMOSPHERE + WALL IMPACT FIELD
      // ═══════════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      if (s.nodePhase === 'crashed') {
        const impactGlow = ctx.createRadialGradient(wallX, nodeY, 0, wallX, nodeY, px(SIZE.md, minDim));
        impactGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * entrance * 0.5));
        impactGlow.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.min * entrance));
        impactGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = impactGlow;
        ctx.fillRect(0, 0, w, h);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 2: FLOW FIELD
      // ═══════════════════════════════════════════════════════════
      {
        ctx.lineWidth = px(STROKE.hairline, minDim);
        const arrowLen = px(FLOW_ARROW_LEN, minDim);
        const hasTurn = s.turnProgress > 0.3;

        for (let col = 0; col < FLOW_COLS; col++) {
          for (let row = 0; row < FLOW_ROWS; row++) {
            const fx = w * 0.04 + (col / (FLOW_COLS - 1)) * w * 0.92;
            const fy = h * 0.1 + (row / (FLOW_ROWS - 1)) * h * 0.8;

            let dx = 1;
            let dy = 0;

            if (fx > wallX - minDim * 0.15 && !hasTurn) {
              // Near wall: deceleration
              const nearness = Math.max(0, 1 - (wallX - fx) / (minDim * 0.15));
              dx *= (1 - nearness * 0.95);
            } else if (hasTurn) {
              // U-turn flow: curve around
              const dtcx = fx - turnCenterX;
              const dtcy = fy - turnCenterY;
              const dist = Math.sqrt(dtcx * dtcx + dtcy * dtcy);
              const influence = Math.max(0, 1 - Math.abs(dist - turnR) / (turnR * 0.8));

              if (influence > 0.1 && fx > turnCenterX - turnR) {
                const angle = Math.atan2(dtcy, dtcx) - Math.PI / 2;
                dx = dx * (1 - influence) + Math.cos(angle) * influence;
                dy = dy * (1 - influence) + Math.sin(angle) * influence;
              }

              // Exit path: accelerated leftward
              if (fy > exitY - minDim * 0.1 && fx < turnCenterX) {
                dx = -SLINGSHOT_BOOST;
                dy = 0;
              }
            }

            const mag = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const alpha = ALPHA.background.max * entrance * Math.min(1, mag * 0.8);
            const arrowColor = lerpColor(s.accentRgb, s.primaryRgb, s.turnProgress);
            ctx.strokeStyle = rgba(arrowColor, alpha);

            const ndx = dx / mag;
            const ndy = dy / mag;
            const aLen = arrowLen * Math.min(2, mag);
            const ex = fx + ndx * aLen;
            const ey = fy + ndy * aLen;

            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            const a = Math.atan2(ndy, ndx);
            const hl = aLen * 0.25;
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - Math.cos(a - 0.5) * hl, ey - Math.sin(a - 0.5) * hl);
            ctx.stroke();
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 3: WALL
      // ═══════════════════════════════════════════════════════════
      {
        const wallH = h * WALL_H;
        const wallTop = cy - wallH / 2;
        const shake = s.crashShake > 0 ? Math.sin(s.crashShake * 3) * px(CRASH_SHAKE_AMP, minDim) : 0;

        // Wall glow
        for (let g = WALL_GLOW_LAYERS; g >= 1; g--) {
          const gw = px(WALL_W * (1 + g * 3), minDim);
          const wGlow = ctx.createLinearGradient(wallX - gw + shake, 0, wallX + gw + shake, 0);
          wGlow.addColorStop(0, 'rgba(0,0,0,0)');
          wGlow.addColorStop(0.5, rgba(s.accentRgb, (ALPHA.glow.max / g) * entrance * 0.5));
          wGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = wGlow;
          ctx.fillRect(wallX - gw + shake, wallTop, gw * 2, wallH);
        }

        // Wall body
        const wGrad = ctx.createLinearGradient(wallX + shake, wallTop, wallX + shake, wallTop + wallH);
        wGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.min * entrance));
        wGrad.addColorStop(0.3, rgba(s.accentRgb, ALPHA.focal.max * entrance));
        wGrad.addColorStop(0.7, rgba(s.accentRgb, ALPHA.focal.max * entrance));
        wGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.min * entrance));
        ctx.fillStyle = wGrad;
        ctx.fillRect(wallX - px(WALL_W, minDim) + shake, wallTop, px(WALL_W * 2, minDim), wallH);

        // Specular edge
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.min * entrance);
        ctx.fillRect(wallX - px(WALL_W * 0.3, minDim) + shake, wallTop, px(WALL_W * 0.3, minDim), wallH);
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 4-5: PATH + U-TURN ARC
      // ═══════════════════════════════════════════════════════════
      {
        // Approach path
        const approachEnd = wallX - px(0.02, minDim);
        ctx.beginPath();
        ctx.moveTo(w * NODE_START_X, nodeY);
        ctx.lineTo(approachEnd, nodeY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * entrance);
        ctx.lineWidth = px(PATH_GLOW_W, minDim);
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(w * NODE_START_X, nodeY);
        ctx.lineTo(approachEnd, nodeY);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.focal.max * entrance);
        ctx.lineWidth = px(PATH_STROKE, minDim);
        ctx.stroke();

        // U-turn arc
        if (s.turnProgress > 0.05) {
          const arcAngle = Math.PI * s.turnProgress;
          ctx.beginPath();
          ctx.arc(turnCenterX, turnCenterY, turnR, -Math.PI / 2, -Math.PI / 2 + arcAngle);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * s.turnProgress * entrance);
          ctx.lineWidth = px(PATH_GLOW_W, minDim);
          ctx.stroke();

          // Speed gradient: entry → exit gets brighter/wider
          const arcGrad = ctx.createLinearGradient(
            turnCenterX + turnR, nodeY,
            turnCenterX - turnR, exitY,
          );
          arcGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
          arcGrad.addColorStop(1, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2), ALPHA.accent.max * entrance));

          ctx.beginPath();
          ctx.arc(turnCenterX, turnCenterY, turnR, -Math.PI / 2, -Math.PI / 2 + arcAngle);
          ctx.strokeStyle = arcGrad;
          ctx.lineWidth = px(PATH_STROKE * (1 + s.turnProgress * 0.5), minDim);
          ctx.stroke();
        }

        // Exit path
        if (s.turnProgress > 0.9) {
          const exitStart = turnCenterX;
          ctx.beginPath();
          ctx.moveTo(exitStart, exitY);
          ctx.lineTo(w * NODE_START_X, exitY);
          ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.15), ALPHA.focal.max * entrance);
          ctx.lineWidth = px(PATH_STROKE * 1.3, minDim);
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 6: TRAVELLING NODE
      // ═══════════════════════════════════════════════════════════
      {
        let nx: number, ny: number;
        if (s.nodePhase === 'approaching' || s.nodePhase === 'crashed') {
          nx = w * NODE_START_X + s.nodeT * (wallX - px(0.03, minDim) - w * NODE_START_X);
          ny = nodeY;
        } else if (s.nodePhase === 'turning') {
          const angle = -Math.PI / 2 + s.turnProgress * Math.PI;
          nx = turnCenterX + Math.cos(angle) * turnR;
          ny = turnCenterY + Math.sin(angle) * turnR;
        } else if (s.nodePhase === 'escaping') {
          nx = turnCenterX - s.exitT * (turnCenterX - w * NODE_START_X);
          ny = exitY;
        } else {
          nx = w * NODE_START_X;
          ny = exitY;
        }

        const shake = s.crashShake > 0 ? Math.sin(s.crashShake * 3) * px(CRASH_SHAKE_AMP, minDim) : 0;
        nx += shake;

        // Trail
        if (ms > 0) {
          s.trail.push({ x: nx / w, y: ny / h, alpha: 1 });
          if (s.trail.length > TRAIL_COUNT) s.trail.shift();
        }
        for (let i = 0; i < s.trail.length; i++) {
          const t = s.trail[i];
          t.alpha *= 0.92;
          if (t.alpha > 0.01) {
            ctx.beginPath();
            ctx.arc(t.x * w, t.y * h, px(NODE_R * 0.6, minDim) * t.alpha, 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.primaryRgb, ALPHA.glow.max * t.alpha * entrance);
            ctx.fill();
          }
        }

        // Node glow
        for (let g = NODE_GLOW_LAYERS; g >= 1; g--) {
          const gr = px(NODE_R, minDim) * (1 + g * 1.2);
          const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
          nGlow.addColorStop(0, rgba(s.primaryRgb, (ALPHA.glow.max / g) * entrance));
          nGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = nGlow;
          ctx.beginPath();
          ctx.arc(nx, ny, gr, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node body
        const nr = px(NODE_R, minDim) * (1 + breath * 0.1);
        const nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        nGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), ALPHA.accent.max * entrance));
        nGrad.addColorStop(0.35, rgba(s.primaryRgb, ALPHA.focal.max * entrance));
        nGrad.addColorStop(0.75, rgba(s.primaryRgb, ALPHA.content.max * entrance));
        nGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.fill();

        // Specular
        ctx.beginPath();
        ctx.arc(nx - nr * 0.3, ny - nr * 0.3, nr * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════
      // LAYER 8: PROGRESS + COMPLETION
      // ═══════════════════════════════════════════════════════════
      {
        const ringR = px(PROGRESS_R, minDim);
        const ringX = w * 0.08;
        const ringY = h * 0.08;
        const prog = s.nodePhase === 'done' ? 1
          : s.nodePhase === 'escaping' ? 0.7 + s.exitT * 0.3
          : s.nodePhase === 'turning' ? 0.3 + s.turnProgress * 0.4
          : s.nodeT * 0.3;

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (s.bloomTimer > 0) {
        s.bloomTimer -= ms;
        const bloomT = Math.max(0, s.bloomTimer / BLOOM_FRAMES);
        const bloomR = px(SIZE.lg, minDim) * (1 - bloomT);
        const bloom = ctx.createRadialGradient(w * NODE_START_X, exitY, 0, w * NODE_START_X, exitY, bloomR);
        bloom.addColorStop(0, rgba(s.primaryRgb, ALPHA.accent.max * bloomT * entrance));
        bloom.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * bloomT * entrance));
        bloom.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bloom;
        ctx.beginPath();
        ctx.arc(w * NODE_START_X, exitY, bloomR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ═══════════════════════════════════════════════════════════════
    // POINTER EVENTS
    // ═══════════════════════════════════════════════════════════════
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.nodePhase === 'crashed') {
        s.nodePhase = 'turning';
        s.dragging = true;
        canvas.setPointerCapture(e.pointerId);
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.nodePhase !== 'turning') return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      const newTurn = Math.min(1, Math.max(0, (my - 0.3) / 0.4));
      if (newTurn > s.turnProgress) {
        s.turnProgress = newTurn;
        callbacksRef.current.onStateChange?.(s.turnProgress * 0.7);
      }

      if (s.turnProgress >= COMPLETE_THRESHOLD) {
        s.nodePhase = 'escaping';
        s.dragging = false;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }}
      />
    </div>
  );
}
