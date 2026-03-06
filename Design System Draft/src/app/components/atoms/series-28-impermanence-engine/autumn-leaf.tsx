/**
 * ATOM 273: THE AUTUMN LEAF ENGINE
 * ===================================
 * Series 28 — Impermanence Engine · Position 3
 *
 * The tree does not fight autumn. Swipe the stem — the chaotic
 * wind dies, and the leaf drifts in gorgeous slow-motion peace.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Leaf rendered as soft-body cloth with fiber veins
 *   - Wind buffets cloth fibers chaotically before severance
 *   - Stem = taut fiber bundle connecting leaf cloth to branch
 *   - Sever → fibers snap one by one, wind entropy collapses
 *   - Post-sever: cloth leaf flutters with pendulum drape physics
 *   - Entropy arc: chaotic wind disorder → severed peaceful drift
 *
 * PHYSICS:
 *   - Leaf shape: cloth mesh with 12 vein fibers radiating from stem
 *   - Branch anchor at top, stem fiber bundle connecting leaf
 *   - Wind particles swirl chaotically (high entropy state)
 *   - Swipe across stem → fibers snap sequentially
 *   - Leaf enters slow-motion gravity with cloth draping
 *   - Pendulum-like rotation, afterimage trail
 *   - 8 render layers: atmosphere, branch, wind particles, stem fibers,
 *     leaf shadow, leaf cloth body, leaf veins + specular, trail
 *   - Breath couples to: wind particle speed, leaf flutter amplitude
 *
 * INTERACTION:
 *   Swipe across stem → sever (swipe_commit → completion on landing)
 *
 * RENDER: Canvas 2D with cloth-leaf + fiber severance
 * REDUCED MOTION: Static leaf at rest on ground
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Leaf width (fraction of minDim) */
const LEAF_W = 0.18;
/** Leaf height (fraction of minDim) */
const LEAF_H = 0.24;
/** Branch anchor Y position (fraction of viewport height) */
const BRANCH_Y = 0.12;
/** Branch width (fraction of viewport width) */
const BRANCH_W = 0.45;
/** Stem length from branch to leaf top */
const STEM_LENGTH = 0.08;
/** Number of stem fiber strands */
const STEM_FIBERS = 6;
/** Number of leaf vein lines */
const VEIN_COUNT = 12;
/** Wind particle count during chaotic phase */
const WIND_PARTICLES = 60;
/** Wind maximum speed */
const WIND_SPEED = 0.004;
/** Swipe threshold to sever stem (fraction of viewport width) */
const SWIPE_THRESHOLD = 0.12;
/** Gravity during slow-motion drift (fraction per frame) */
const DRIFT_GRAVITY = 0.00006;
/** Leaf rotation rate during drift (radians per frame) */
const DRIFT_ROTATE = 0.008;
/** Horizontal pendulum amplitude during drift */
const PENDULUM_AMP = 0.1;
/** Pendulum frequency */
const PENDULUM_FREQ = 0.025;
/** Landing Y position (fraction of viewport height) */
const LANDING_Y = 0.88;
/** Trail afterimage count */
const TRAIL_COUNT = 6;
/** Breath coupling to wind speed */
const BREATH_WIND = 0.5;
/** Cloth drape amplitude for leaf deformation */
const DRAPE_AMP = 0.012;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface WindMote {
  x: number; y: number;
  vx: number; vy: number;
  size: number; life: number;
}

interface TrailGhost {
  x: number; y: number;
  angle: number; alpha: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════

function spawnWind(): WindMote[] {
  const motes: WindMote[] = [];
  for (let i = 0; i < WIND_PARTICLES; i++) {
    motes.push({
      x: Math.random(),
      y: 0.05 + Math.random() * 0.85,
      vx: (Math.random() - 0.3) * WIND_SPEED,
      vy: (Math.random() - 0.5) * WIND_SPEED * 0.5,
      size: 0.002 + Math.random() * 0.004,
      life: 0.5 + Math.random() * 0.5,
    });
  }
  return motes;
}

/** Draw a leaf shape path centered at (0,0) */
function leafPath(ctx: CanvasRenderingContext2D, lw: number, lh: number) {
  ctx.beginPath();
  ctx.moveTo(0, -lh * 0.5);
  ctx.bezierCurveTo(lw * 0.6, -lh * 0.35, lw * 0.55, lh * 0.1, lw * 0.1, lh * 0.5);
  ctx.lineTo(0, lh * 0.45);
  ctx.lineTo(-lw * 0.1, lh * 0.5);
  ctx.bezierCurveTo(-lw * 0.55, lh * 0.1, -lw * 0.6, -lh * 0.35, 0, -lh * 0.5);
  ctx.closePath();
}

export default function AutumnLeafAtom({
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
    severed: false,
    swiping: false,
    swipeStartX: 0,
    leafX: 0.5,
    leafY: BRANCH_Y + STEM_LENGTH + LEAF_H * 0.3,
    leafAngle: 0,
    leafVY: 0,
    driftTime: 0,
    landed: false,
    completed: false,
    windMotes: spawnWind(),
    fibersCut: 0,
    trail: [] as TrailGhost[],
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
      const breath = (p.breathAmplitude ?? 0) * BREATH_WIND;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        s.severed = true; s.landed = true; s.completed = true;
        s.leafY = LANDING_Y; s.leafAngle = 0.15;
      }
      if (p.phase === 'resolve' && !s.completed) {
        s.severed = true; s.landed = true; s.completed = true;
        s.leafY = LANDING_Y;
      }

      const lw = px(LEAF_W, minDim);
      const lh = px(LEAF_H, minDim);

      // ── Wind / drift physics ────────────────────────────────────
      if (!s.severed) {
        // Chaotic wind
        for (const wm of s.windMotes) {
          wm.x += wm.vx * (1 + breath) * ms;
          wm.y += wm.vy * ms;
          if (wm.x > 1.1 || wm.x < -0.1) { wm.x = wm.vx > 0 ? -0.05 : 1.05; wm.y = Math.random(); }
          if (wm.y > 1 || wm.y < 0) wm.vy *= -1;
        }
        // Leaf sways on stem
        const sway = Math.sin(time * 1.5) * 0.03 + Math.sin(time * 3.7) * 0.015;
        s.leafAngle = sway;
        s.leafX = 0.5 + Math.sin(time * 0.8) * 0.02;
      } else if (!s.landed) {
        // Slow-motion drift
        s.driftTime += 0.015 * ms;
        s.leafVY = Math.min(0.003, s.leafVY + DRIFT_GRAVITY * ms);
        s.leafY += s.leafVY * ms;
        s.leafX += Math.sin(s.driftTime * PENDULUM_FREQ * 60) * PENDULUM_AMP * 0.001 * ms;
        s.leafAngle = Math.sin(s.driftTime * DRIFT_ROTATE * 60) * 0.4 * (1 - (s.leafY - 0.3));

        // Trail
        if (s.frameCount % 4 === 0) {
          s.trail.push({ x: s.leafX, y: s.leafY, angle: s.leafAngle, alpha: 0.3 });
          if (s.trail.length > TRAIL_COUNT) s.trail.shift();
        }
        for (const t of s.trail) t.alpha *= 0.95;

        // Wind fades
        for (const wm of s.windMotes) wm.life -= 0.02 * ms;
        s.windMotes = s.windMotes.filter(wm => wm.life > 0);

        if (s.leafY >= LANDING_Y) {
          s.landed = true;
          s.leafY = LANDING_Y;
          if (!s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
          }
        }
      }
      cb.onStateChange?.(s.completed ? 1 : s.severed ? Math.min(0.95, (s.leafY - 0.3) / (LANDING_Y - 0.3)) : 0);

      // ── 1. Branch ──────────────────────────────────────────────
      const branchY = BRANCH_Y * h;
      const branchLeft = cx - px(BRANCH_W * 0.5, minDim);
      const branchRight = cx + px(BRANCH_W * 0.5, minDim);
      ctx.beginPath();
      ctx.moveTo(branchLeft, branchY);
      ctx.quadraticCurveTo(cx, branchY - px(0.01, minDim), branchRight, branchY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // Branch texture nodes
      for (let i = 0; i < 5; i++) {
        const nx = branchLeft + (branchRight - branchLeft) * (0.15 + i * 0.18);
        const nr = px(0.004, minDim);
        ctx.beginPath();
        ctx.arc(nx, branchY, nr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.fill();
      }

      // ── 2. Wind particles ──────────────────────────────────────
      for (const wm of s.windMotes) {
        const wx = wm.x * w;
        const wy = wm.y * h;
        const wr = px(wm.size, minDim);
        const wAlpha = ALPHA.content.max * 0.08 * wm.life * entrance;
        // Wind streak
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx - wm.vx * 800, wy - wm.vy * 200);
        ctx.strokeStyle = rgba(s.accentRgb, wAlpha * 0.5);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
        // Wind dot
        const wg = ctx.createRadialGradient(wx, wy, 0, wx, wy, wr);
        wg.addColorStop(0, rgba(s.accentRgb, wAlpha));
        wg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = wg;
        ctx.fillRect(wx - wr, wy - wr, wr * 2, wr * 2);
      }

      // ── 3. Stem fibers ─────────────────────────────────────────
      const stemTopX = cx;
      const stemTopY = branchY;
      const stemBotX = s.leafX * w;
      const stemBotY = s.leafY * h - lh * 0.5;

      if (!s.severed) {
        for (let f = 0; f < STEM_FIBERS; f++) {
          const offset = (f - STEM_FIBERS / 2) * px(0.002, minDim);
          const wave = Math.sin(time * 3 + f * 1.2) * px(0.003, minDim);
          ctx.beginPath();
          ctx.moveTo(stemTopX + offset, stemTopY);
          ctx.quadraticCurveTo(
            (stemTopX + stemBotX) / 2 + wave, (stemTopY + stemBotY) / 2,
            stemBotX + offset * 0.5, stemBotY
          );
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      } else if (s.fibersCut < STEM_FIBERS) {
        // Snapping fibers during severance animation
        s.fibersCut = Math.min(STEM_FIBERS, s.fibersCut + 0.15 * ms);
        const remaining = STEM_FIBERS - Math.floor(s.fibersCut);
        for (let f = 0; f < remaining; f++) {
          const offset = (f - remaining / 2) * px(0.002, minDim);
          const recoil = px(0.02 * (s.fibersCut / STEM_FIBERS), minDim);
          ctx.beginPath();
          ctx.moveTo(stemTopX + offset, stemTopY);
          ctx.lineTo(stemTopX + offset + recoil, stemTopY + px(STEM_LENGTH * 0.3, minDim));
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── 4. Trail afterimages ───────────────────────────────────
      for (const t of s.trail) {
        if (t.alpha < 0.01) continue;
        ctx.save();
        ctx.translate(t.x * w, t.y * h);
        ctx.rotate(t.angle);
        ctx.globalAlpha = t.alpha * entrance;
        leafPath(ctx, lw * 0.9, lh * 0.9);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // ── 5. Leaf shadow ─────────────────────────────────────────
      const shadowX = s.leafX * w + px(0.01, minDim);
      const shadowY = s.leafY * h + px(0.015, minDim);
      ctx.save();
      ctx.translate(shadowX, shadowY);
      ctx.rotate(s.leafAngle);
      leafPath(ctx, lw, lh);
      const shadowG = ctx.createRadialGradient(0, 0, 0, 0, 0, lh * 0.6);
      shadowG.addColorStop(0, rgba(s.primaryRgb, 0.04 * entrance));
      shadowG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = shadowG;
      ctx.fill();
      ctx.restore();

      // ── 6. Leaf cloth body ─────────────────────────────────────
      const leafCx = s.leafX * w;
      const leafCy = s.leafY * h;
      ctx.save();
      ctx.translate(leafCx, leafCy);
      ctx.rotate(s.leafAngle);

      // Cloth drape deformation (subtle S-curve on the leaf edge)
      const drape = s.severed ? Math.sin(s.driftTime * 3) * DRAPE_AMP : Math.sin(time * 2) * DRAPE_AMP * 0.3;

      leafPath(ctx, lw * (1 + drape), lh * (1 - drape * 0.3));
      const leafGrad = ctx.createRadialGradient(-lw * 0.1, -lh * 0.15, 0, 0, 0, lh * 0.55);
      const leafCol = lerpColor(s.primaryRgb, s.accentRgb, 0.2);
      leafGrad.addColorStop(0, rgba(leafCol, ALPHA.content.max * 0.32 * entrance));
      leafGrad.addColorStop(0.3, rgba(leafCol, ALPHA.content.max * 0.24 * entrance));
      leafGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.content.max * 0.16 * entrance));
      leafGrad.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance));
      leafGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance));
      ctx.fillStyle = leafGrad;
      ctx.fill();

      // Leaf edge
      leafPath(ctx, lw * (1 + drape), lh * (1 - drape * 0.3));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── 7. Leaf vein fibers (cloth warp/weft) ──────────────────
      // Central spine
      ctx.beginPath();
      ctx.moveTo(0, -lh * 0.45);
      ctx.lineTo(0, lh * 0.4);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      // Branching veins (cloth fiber pattern)
      for (let v = 0; v < VEIN_COUNT; v++) {
        const vFrac = (v + 1) / (VEIN_COUNT + 1);
        const vy = -lh * 0.45 + vFrac * lh * 0.85;
        const side = v % 2 === 0 ? 1 : -1;
        const vLen = lw * 0.35 * (1 - Math.abs(vFrac - 0.4) * 1.2);
        if (vLen < 0) continue;
        const wave = Math.sin(time * 2 + v * 0.8) * px(drape * 0.5, minDim);
        ctx.beginPath();
        ctx.moveTo(0, vy);
        ctx.quadraticCurveTo(side * vLen * 0.5, vy - lh * 0.03 + wave, side * vLen, vy - lh * 0.06);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── Specular highlight on leaf ─────────────────────────────
      const specR = lw * 0.22;
      const specG = ctx.createRadialGradient(-lw * 0.15, -lh * 0.2, 0, -lw * 0.15, -lh * 0.2, specR);
      specG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.12 * entrance));
      specG.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.03 * entrance));
      specG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = specG;
      ctx.beginPath();
      ctx.arc(-lw * 0.15, -lh * 0.2, specR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── 8. Ground line for landing ─────────────────────────────
      if (s.severed) {
        const groundY = LANDING_Y * h + lh * 0.5;
        const groundW = w * 0.6;
        const gAlpha = ALPHA.content.max * 0.04 * entrance;
        ctx.beginPath();
        ctx.moveTo(cx - groundW * 0.5, groundY);
        ctx.lineTo(cx + groundW * 0.5, groundY);
        ctx.strokeStyle = rgba(s.primaryRgb, gAlpha);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();

        // Landed glow
        if (s.landed) {
          const landR = px(0.15, minDim);
          const landG = ctx.createRadialGradient(leafCx, groundY, 0, leafCx, groundY, landR);
          landG.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * entrance));
          landG.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * entrance));
          landG.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = landG;
          ctx.fillRect(leafCx - landR, groundY - landR, landR * 2, landR * 2);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.severed) return;
      s.swiping = true;
      s.swipeStartX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.severed) return;
      const rect = canvas.getBoundingClientRect();
      const dx = Math.abs(e.clientX - s.swipeStartX) / rect.width;
      if (dx > SWIPE_THRESHOLD) {
        s.severed = true;
        s.swiping = false;
        s.leafVY = 0;
        callbacksRef.current.onHaptic('swipe_commit');
      }
    };
    const onUp = () => { stateRef.current.swiping = false; };

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
