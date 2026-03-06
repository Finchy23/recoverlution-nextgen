/**
 * ATOM 665: THE MESHED GEARS ENGINE
 * ====================================
 * Series 67 — Harmonious Friction · Position 5
 *
 * Prove arguments are alignment mechanics. Drag disconnected gears
 * together — initial teeth collision is harsh jarring crunch. Force
 * through the clash and the teeth lock into a deep driving hum.
 *
 * SIGNATURE TECHNIQUE: Directional friction — gear teeth collision
 * particles, alignment transition from clash to synchronization,
 * combined power visualization.
 *
 * INTERACTION: Drag (gears together) → clash → force through → lock
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static meshed gears
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const GEAR_RADIUS      = 0.1;
const TOOTH_COUNT      = 12;
const TOOTH_HEIGHT     = 0.025;
const MESH_DISTANCE    = 0.22;
const CLASH_DURATION   = 60;
const LOCK_DISTANCE    = 0.21;
const RESPAWN_DELAY    = 100;

interface GearState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  gearAx: number; gearAy: number;
  gearBx: number; gearBy: number;
  gearAangle: number; gearBangle: number;
  meshing: boolean;
  meshTimer: number;
  locked: boolean;
  lockedHumTimer: number;
  clashSparks: { x: number; y: number; vx: number; vy: number; life: number }[];
  dragging: 'A' | 'B' | null;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): GearState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    gearAx: 0.3, gearAy: 0.5, gearBx: 0.7, gearBy: 0.5,
    gearAangle: 0, gearBangle: 0,
    meshing: false, meshTimer: 0, locked: false, lockedHumTimer: 0,
    clashSparks: [], dragging: null,
    completed: false, respawnTimer: 0,
  };
}

function drawGear(ctx: CanvasRenderingContext2D, x: number, y: number,
  radius: number, toothH: number, teeth: number, angle: number,
  color: RGB, alpha: number, minDim: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Outer teeth
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a1 = (i / teeth) * Math.PI * 2;
    const a2 = ((i + 0.3) / teeth) * Math.PI * 2;
    const a3 = ((i + 0.5) / teeth) * Math.PI * 2;
    const a4 = ((i + 0.8) / teeth) * Math.PI * 2;
    const r1 = radius;
    const r2 = radius + toothH;

    if (i === 0) ctx.moveTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
    ctx.lineTo(Math.cos(a2) * r1, Math.sin(a2) * r1);
    ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
    ctx.lineTo(Math.cos(a3) * r2, Math.sin(a3) * r2);
    ctx.lineTo(Math.cos(a4) * r1, Math.sin(a4) * r1);
  }
  ctx.closePath();
  ctx.fillStyle = rgba(color, alpha * 0.15);
  ctx.fill();
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = px(STROKE.medium, minDim);
  ctx.stroke();

  // Hub
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = rgba(color, alpha * 0.4);
  ctx.fill();

  // Spokes
  for (let i = 0; i < 4; i++) {
    const sa = i * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(sa) * radius * 0.25, Math.sin(sa) * radius * 0.25);
    ctx.lineTo(Math.cos(sa) * radius * 0.8, Math.sin(sa) * radius * 0.8);
    ctx.strokeStyle = rgba(color, alpha * 0.3);
    ctx.lineWidth = px(STROKE.light, minDim);
    ctx.stroke();
  }

  ctx.restore();
}

export default function MeshedGearsLockAtom({
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
      const gearR = px(GEAR_RADIUS, minDim);
      const toothH = px(TOOTH_HEIGHT, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        const dx = s.gearAx - s.gearBx;
        const dy = s.gearAy - s.gearBy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MESH_DISTANCE && !s.locked) {
          if (!s.meshing) {
            s.meshing = true;
            s.meshTimer = 0;
            cb.onHaptic('error_boundary');
          }
          s.meshTimer++;

          // Clash sparks during meshing
          if (s.meshTimer < CLASH_DURATION && s.frameCount % 4 === 0) {
            const midX = (s.gearAx + s.gearBx) / 2;
            const midY = (s.gearAy + s.gearBy) / 2;
            for (let i = 0; i < 3; i++) {
              const a = Math.random() * Math.PI * 2;
              s.clashSparks.push({
                x: midX, y: midY,
                vx: Math.cos(a) * 0.004, vy: Math.sin(a) * 0.004,
                life: 15 + Math.random() * 10,
              });
            }
            if (s.frameCount % 8 === 0) cb.onHaptic('drag_snap');
          }

          cb.onStateChange?.(Math.min(0.9, s.meshTimer / CLASH_DURATION));

          if (s.meshTimer >= CLASH_DURATION) {
            s.locked = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
          }
        } else if (dist >= MESH_DISTANCE && s.meshing && !s.locked) {
          s.meshing = false;
          s.meshTimer = 0;
        }

        // Gear rotation
        if (s.locked) {
          s.gearAangle += 0.02 * ms;
          s.gearBangle -= 0.02 * ms; // counter-rotate
          s.lockedHumTimer++;
          if (s.lockedHumTimer >= 90 && !s.completed) {
            s.completed = true;
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else {
          s.gearAangle += 0.01 * ms;
          s.gearBangle += 0.008 * ms;
        }

        // Spark physics
        for (const sp of s.clashSparks) { sp.x += sp.vx; sp.y += sp.vy; sp.life--; }
        s.clashSparks = s.clashSparks.filter(sp => sp.life > 0);
      }

      const ax = s.gearAx * w;
      const ay = s.gearAy * h;
      const bx = s.gearBx * w;
      const by = s.gearBy * h;

      // ── LAYER 2: Connection indicator ───────────────
      if (s.meshing || s.locked) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        const lineAlpha = s.locked ? 0.3 : 0.15;
        ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha * ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Clash sparks ──────────────────────
      const sparkColor: RGB = [255, 200, 80];
      for (const sp of s.clashSparks) {
        ctx.beginPath();
        ctx.arc(sp.x * w, sp.y * h, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(sparkColor, (sp.life / 25) * ALPHA.content.max * 0.6 * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 4: Mesh glow ─────────────────────────
      if (s.locked) {
        const midX = (ax + bx) / 2;
        const midY = (ay + by) / 2;
        const mGlow = ctx.createRadialGradient(midX, midY, 0, midX, midY, px(0.08, minDim));
        mGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        mGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mGlow;
        ctx.fillRect(midX - px(0.08, minDim), midY - px(0.08, minDim), px(0.16, minDim), px(0.16, minDim));
      }

      // ── LAYER 5-6: Gears ──────────────────────────
      const gearAlpha = ALPHA.content.max * 0.5 * entrance;
      drawGear(ctx, ax, ay, gearR, toothH, TOOTH_COUNT, s.gearAangle, s.primaryRgb, gearAlpha, minDim);
      drawGear(ctx, bx, by, gearR, toothH, TOOTH_COUNT, s.gearBangle, s.accentRgb, gearAlpha, minDim);

      // Locked hum rings
      if (s.locked) {
        for (const [gx, gy] of [[ax, ay], [bx, by]]) {
          const humR = gearR * (1.2 + Math.sin(s.frameCount * 0.08) * 0.05);
          ctx.beginPath();
          ctx.arc(gx, gy, humR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 7: Progress ──────────────────────────
      if (s.meshing && !s.locked) {
        const barW = px(SIZE.md * 0.5, minDim);
        const barH = px(0.006, minDim);
        const barX = cx - barW / 2;
        const barY = h - px(0.08, minDim);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fillRect(barX, barY, barW * (s.meshTimer / CLASH_DURATION), barH);
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      if (s.locked) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('SYNCHRONIZED', cx, h - px(0.035, minDim));
      } else if (s.meshing) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.35 * entrance);
        ctx.fillText('ALIGNING...', cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance);
        ctx.fillText('DRAG GEARS TOGETHER', cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        drawGear(ctx, cx - gearR, cy, gearR, toothH, TOOTH_COUNT, 0, s.primaryRgb, gearAlpha, minDim);
        drawGear(ctx, cx + gearR, cy, gearR, toothH, TOOTH_COUNT, Math.PI / TOOTH_COUNT, s.accentRgb, gearAlpha, minDim);
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
      if (s.completed || s.locked) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      const dA = Math.sqrt((mx - s.gearAx) ** 2 + (my - s.gearAy) ** 2);
      const dB = Math.sqrt((mx - s.gearBx) ** 2 + (my - s.gearBy) ** 2);
      if (dA < dB && dA < 0.15) s.dragging = 'A';
      else if (dB < 0.15) s.dragging = 'B';
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      if (s.dragging === 'A') { s.gearAx = mx; s.gearAy = my; }
      else { s.gearBx = mx; s.gearBy = my; }
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = null;
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
