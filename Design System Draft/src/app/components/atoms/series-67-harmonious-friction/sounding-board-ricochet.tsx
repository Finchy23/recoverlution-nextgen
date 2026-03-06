/**
 * ATOM 668: THE SOUNDING BOARD ENGINE
 * =====================================
 * Series 67 — Harmonious Friction · Position 8
 *
 * Prove hard truth doubles your velocity. Soft wall absorbs energy.
 * Dense unyielding wall perfectly reflects — the violent ricochet
 * doubles kinetic velocity blasting through the actual target.
 *
 * SIGNATURE TECHNIQUE: Directional friction — projectile trajectory,
 * wall absorption vs reflection physics, velocity doubling
 * visualization, comparative outcomes.
 *
 * INTERACTION: Swipe (fire projectile) → choose wall → observe
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static diagram
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const NODE_RADIUS      = 0.015;
const PROJECTILE_SPEED = 0.006;
const SOFT_WALL_X      = 0.35;
const HARD_WALL_X      = 0.65;
const WALL_Y_TOP       = 0.3;
const WALL_Y_BOT       = 0.7;
const TARGET_X         = 0.9;
const LAUNCH_X         = 0.1;
const LAUNCH_Y         = 0.5;
const RESPAWN_DELAY    = 100;

type WallTarget = 'soft' | 'hard' | null;

interface RicoState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  projX: number;
  projY: number;
  projVx: number;
  projVy: number;
  fired: boolean;
  targetWall: WallTarget;
  absorbed: boolean;
  reflected: boolean;
  hitTarget: boolean;
  trail: { x: number; y: number }[];
  completed: boolean;
  respawnTimer: number;
  round: number;
}

function freshState(c: string, a: string): RicoState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    projX: LAUNCH_X, projY: LAUNCH_Y, projVx: 0, projVy: 0,
    fired: false, targetWall: null,
    absorbed: false, reflected: false, hitTarget: false,
    trail: [], completed: false, respawnTimer: 0, round: 0,
  };
}

export default function SoundingBoardRicochetAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && s.fired && !s.absorbed && !s.hitTarget) {
        s.projX += s.projVx;
        s.projY += s.projVy;
        s.trail.push({ x: s.projX, y: s.projY });
        if (s.trail.length > 30) s.trail.shift();

        // Soft wall collision
        if (s.projX >= SOFT_WALL_X - 0.02 && s.projX <= SOFT_WALL_X + 0.02
            && s.projY > WALL_Y_TOP && s.projY < WALL_Y_BOT && s.targetWall === 'soft') {
          s.absorbed = true;
          s.projVx = 0;
          s.projVy = 0;
          cb.onHaptic('error_boundary');
          // Round 1 done: show failure, then prompt for round 2
          s.respawnTimer = 60;
        }

        // Hard wall collision
        if (s.projX >= HARD_WALL_X - 0.02 && s.projX <= HARD_WALL_X + 0.02
            && s.projY > WALL_Y_TOP && s.projY < WALL_Y_BOT && s.targetWall === 'hard' && !s.reflected) {
          s.reflected = true;
          s.projVx = Math.abs(s.projVx) * 1.5; // doubled velocity
          s.projVy = -0.002; // slight angle toward target
          cb.onHaptic('swipe_commit');
        }

        // Target hit
        if (s.projX >= TARGET_X && s.reflected) {
          s.hitTarget = true;
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }

        // Out of bounds
        if (s.projX > 1.1 || s.projX < -0.1 || s.projY > 1.1 || s.projY < -0.1) {
          if (!s.reflected && !s.absorbed) {
            s.absorbed = true;
            s.respawnTimer = 60;
          }
        }
      }

      // Auto-reset after soft wall fail
      if (s.absorbed && !s.completed) {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.projX = LAUNCH_X; s.projY = LAUNCH_Y;
          s.projVx = 0; s.projVy = 0;
          s.fired = false; s.absorbed = false; s.reflected = false;
          s.targetWall = null; s.trail = []; s.round++;
        }
      }

      // ── LAYER 2: Soft wall ─────────────────────────
      const swX = SOFT_WALL_X * w;
      const wTop = WALL_Y_TOP * h;
      const wBot = WALL_Y_BOT * h;
      const wallW = px(0.025, minDim);

      // Soft wall (yielding, curved)
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.fillRect(swX - wallW / 2, wTop, wallW, wBot - wTop);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.strokeRect(swX - wallW / 2, wTop, wallW, wBot - wTop);

      const sfFont = Math.max(6, px(FONT_SIZE.xs, minDim));
      ctx.font = `${sfFont}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * entrance);
      ctx.fillText('SOFT', swX, wTop - px(0.01, minDim));

      // ── LAYER 3: Hard wall ─────────────────────────
      const hwX = HARD_WALL_X * w;
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.fillRect(hwX - wallW / 2, wTop, wallW, wBot - wTop);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.strokeRect(hwX - wallW / 2, wTop, wallW, wBot - wTop);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
      ctx.fillText('HARD', hwX, wTop - px(0.01, minDim));

      // ── LAYER 4: Target ────────────────────────────
      const tX = TARGET_X * w;
      ctx.beginPath();
      ctx.arc(tX, cy, px(0.03, minDim), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tX, cy, px(0.01, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.fill();

      // ── LAYER 5: Trail ─────────────────────────────
      if (s.trail.length > 1) {
        ctx.beginPath();
        for (let i = 0; i < s.trail.length; i++) {
          const pt = s.trail[i];
          if (i === 0) ctx.moveTo(pt.x * w, pt.y * h);
          else ctx.lineTo(pt.x * w, pt.y * h);
        }
        const trColor = s.reflected ? s.primaryRgb : s.accentRgb;
        ctx.strokeStyle = rgba(trColor, ALPHA.atmosphere.min * 0.5 * entrance * ms);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 6: Projectile ────────────────────────
      if (s.fired && !s.hitTarget) {
        const px2 = s.projX * w;
        const py2 = s.projY * h;

        // Velocity glow (bigger when faster)
        const speed = Math.sqrt(s.projVx ** 2 + s.projVy ** 2);
        const glowR = px(0.04 + speed * 5, minDim);
        const pGlow = ctx.createRadialGradient(px2, py2, 0, px2, py2, glowR);
        pGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        pGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pGlow;
        ctx.fillRect(px2 - glowR, py2 - glowR, glowR * 2, glowR * 2);

        ctx.beginPath();
        ctx.arc(px2, py2, nodeR, 0, Math.PI * 2);
        const pColor = s.reflected ? lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3) : s.primaryRgb;
        ctx.fillStyle = rgba(pColor, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── LAYER 7: Launch node ───────────────────────
      if (!s.fired) {
        const lx = LAUNCH_X * w;
        const ly = LAUNCH_Y * h;
        ctx.beginPath();
        ctx.arc(lx, ly, nodeR * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();

        // Arrow hints
        for (const [tx, ty, label] of [[SOFT_WALL_X, LAUNCH_Y, '↗ SOFT'], [HARD_WALL_X, LAUNCH_Y, '→ HARD']] as [number, number, string][]) {
          ctx.setLineDash([px(0.004, minDim), px(0.006, minDim)]);
          ctx.beginPath();
          ctx.moveTo(lx + nodeR * 2, ly + (ty === LAUNCH_Y ? 0 : (ty - LAUNCH_Y) * h * 0.3));
          ctx.lineTo(tx * w - wallW, ty * h);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.hitTarget) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('DOUBLED VELOCITY', cx, h - px(0.035, minDim));
      } else if (s.absorbed) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.4 * entrance);
        ctx.fillText('ABSORBED · NO ENERGY', cx, h - px(0.035, minDim));
      } else if (!s.fired) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        const hint = s.round === 0 ? 'SWIPE RIGHT TO FIRE' : 'TRY THE HARD WALL';
        ctx.fillText(hint, cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        // Static diagram
        ctx.setLineDash([px(0.004, minDim), px(0.006, minDim)]);
        ctx.beginPath();
        ctx.moveTo(LAUNCH_X * w, LAUNCH_Y * h);
        ctx.lineTo(hwX, cy);
        ctx.lineTo(tX, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          Object.assign(s, freshState(color, accentColor));
          s.entranceProgress = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.fired || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      // Determine aim: upper half → soft wall, lower half → hard wall
      if (my < 0.5) {
        s.targetWall = 'soft';
        s.projVx = PROJECTILE_SPEED;
        s.projVy = -0.001;
      } else {
        s.targetWall = 'hard';
        s.projVx = PROJECTILE_SPEED;
        s.projVy = 0.001;
      }
      s.fired = true;
      s.projX = LAUNCH_X;
      s.projY = LAUNCH_Y;
      cbRef.current.onHaptic('swipe_commit');
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
