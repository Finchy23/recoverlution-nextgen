/**
 * ATOM 656: THE ORBITAL DEFLECTION ENGINE
 * =========================================
 * Series 66 — The Centrifuge · Position 6
 *
 * Deflect without shields. Initiate a slow steady rotational field
 * — the Coriolis effect curves incoming projectile trajectories
 * into harmless glancing deflections.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — visible
 * trajectory bending through rotational field, Coriolis curves.
 *
 * PHYSICS:
 *   - Projectiles fired directly at core node
 *   - Initiate rotational field via circular drag
 *   - Coriolis effect curves projectile paths
 *   - Direct hits bent into glancing deflections
 *   - Deflected projectiles spin off harmlessly
 *   - Field strength proportional to RPM
 *
 * INTERACTION: Drag (circular) → rotational field → deflect projectiles
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static deflection diagram
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const CORE_RADIUS      = 0.025;
const GLOW_R_CORE      = 0.1;
const FIELD_RADIUS     = 0.2;
const PROJECTILE_SPEED = 0.006;
const CORIOLIS_FACTOR  = 0.003;
const RPM_DECAY        = 0.993;
const RPM_GAIN         = 0.008;
const DEFLECT_COUNT    = 8;
const SPAWN_INTERVAL   = 70;
const FIELD_RING_CT    = 4;
const RESPAWN_DELAY    = 90;

interface Projectile {
  x: number; y: number; vx: number; vy: number;
  deflected: boolean; alive: boolean;
  trail: { x: number; y: number }[];
}

interface DeflectState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  rpm: number;
  fieldAngle: number;
  projectiles: Projectile[];
  spawnTimer: number;
  deflections: number;
  dragging: boolean;
  prevAngle: number;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): DeflectState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    rpm: 0, fieldAngle: 0, projectiles: [], spawnTimer: 30,
    deflections: 0, dragging: false, prevAngle: 0,
    completed: false, respawnTimer: 0,
  };
}

function spawnProjectile(): Projectile {
  const angle = Math.random() * Math.PI * 2;
  const dist = 0.55;
  return {
    x: 0.5 + Math.cos(angle) * dist,
    y: 0.5 + Math.sin(angle) * dist,
    vx: -Math.cos(angle) * PROJECTILE_SPEED,
    vy: -Math.sin(angle) * PROJECTILE_SPEED,
    deflected: false, alive: true,
    trail: [],
  };
}

export default function OrbitalDeflectionAtom({
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
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const coreR = px(CORE_RADIUS, minDim);
      const fieldR = px(FIELD_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.rpm *= RPM_DECAY;
        s.fieldAngle += s.rpm * 0.15;

        s.spawnTimer--;
        if (s.spawnTimer <= 0 && s.projectiles.filter(p2 => p2.alive).length < 4) {
          s.projectiles.push(spawnProjectile());
          s.spawnTimer = SPAWN_INTERVAL;
        }

        for (const proj of s.projectiles) {
          if (!proj.alive) continue;
          // Coriolis bending inside field
          const dx = proj.x - 0.5;
          const dy = proj.y - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < FIELD_RADIUS && s.rpm > 0.1) {
            const perp = Math.atan2(dy, dx) + Math.PI / 2;
            proj.vx += Math.cos(perp) * CORIOLIS_FACTOR * s.rpm;
            proj.vy += Math.sin(perp) * CORIOLIS_FACTOR * s.rpm;
            if (!proj.deflected) {
              proj.deflected = true;
              s.deflections++;
              cb.onHaptic('drag_snap');
              cb.onStateChange?.(Math.min(1, s.deflections / DEFLECT_COUNT));
            }
          }

          proj.trail.push({ x: proj.x, y: proj.y });
          if (proj.trail.length > 15) proj.trail.shift();

          proj.x += proj.vx;
          proj.y += proj.vy;

          // Hit core check (miss if deflected enough)
          if (dist < 0.03 && !proj.deflected) {
            cb.onHaptic('error_boundary');
            proj.alive = false;
          }
          if (proj.x < -0.1 || proj.x > 1.1 || proj.y < -0.1 || proj.y > 1.1) {
            proj.alive = false;
          }
        }

        if (s.deflections >= DEFLECT_COUNT) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // ── LAYER 2: Rotational field rings ─────────────
      if (s.rpm > 0.05) {
        for (let i = 0; i < FIELD_RING_CT; i++) {
          const ringR = fieldR * (0.3 + i * 0.2);
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * s.rpm * 0.5 * entrance * ms);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }

        // Rotation arcs
        for (let i = 0; i < 6; i++) {
          const a = s.fieldAngle + i * Math.PI / 3;
          ctx.beginPath();
          ctx.arc(cx, cy, fieldR * 0.8, a, a + Math.PI * 0.2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * s.rpm * entrance * ms);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();
        }
      }

      // Field boundary
      ctx.beginPath();
      ctx.arc(cx, cy, fieldR, 0, Math.PI * 2);
      ctx.setLineDash([px(0.005, minDim), px(0.008, minDim)]);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── LAYER 3: Projectile trails ──────────────────
      for (const proj of s.projectiles) {
        if (proj.trail.length < 2) continue;
        ctx.beginPath();
        for (let i = 0; i < proj.trail.length; i++) {
          const pt = proj.trail[i];
          if (i === 0) ctx.moveTo(pt.x * w, pt.y * h);
          else ctx.lineTo(pt.x * w, pt.y * h);
        }
        const trailColor = proj.deflected ? s.primaryRgb : s.accentRgb;
        ctx.strokeStyle = rgba(trailColor, ALPHA.atmosphere.min * 0.5 * entrance * ms);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 4: Projectile nodes ───────────────────
      for (const proj of s.projectiles) {
        if (!proj.alive) continue;
        const prx = proj.x * w;
        const pry = proj.y * h;

        ctx.beginPath();
        ctx.arc(prx, pry, px(PARTICLE_SIZE.lg, minDim), 0, Math.PI * 2);
        const pColor = proj.deflected ? s.primaryRgb : s.accentRgb;
        ctx.fillStyle = rgba(pColor, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
      }

      // ── LAYER 5-6: Core glow + body ─────────────────
      const gr = px(GLOW_R_CORE, minDim);
      const glowInt = 0.2 + s.rpm * 0.4;
      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * glowInt * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow;
      ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * (1 + breath * 0.04), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 7: Score ──────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`${s.deflections}/${DEFLECT_COUNT}`, cx, h - px(0.035, minDim));

      // ── LAYER 8: Hint ───────────────────────────────
      if (s.rpm < 0.1 && !s.completed) {
        const hFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('TRACE CIRCLE FOR FIELD', cx, h - px(0.06, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, fieldR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.rpm = 0; s.projectiles = []; s.deflections = 0;
          s.spawnTimer = 30; s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      s.prevAngle = Math.atan2(my - 0.5, mx - 0.5);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const angle = Math.atan2(my - 0.5, mx - 0.5);
      let delta = angle - s.prevAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      s.rpm = Math.min(1, s.rpm + Math.abs(delta) * RPM_GAIN * 10);
      s.prevAngle = angle;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
