/**
 * ATOM 660: THE APEX CENTRIFUGE ENGINE
 * ======================================
 * Series 66 — The Centrifuge · Position 10 (Apex)
 *
 * The apex: control your axis and you control the room. Spin your
 * dead-center node — a blinding impenetrable sphere erupts outward
 * atomising the apocalypse into harmless white dust.
 *
 * SIGNATURE TECHNIQUE: Centrifugal force separation — apocalyptic
 * debris field, blinding sphere eruption, particle atomization
 * into white dust, sovereign stillness at center.
 *
 * INTERACTION: Drag (center spin) → sphere eruption → atomize chaos
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static sovereign sphere
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const CORE_RADIUS      = 0.03;
const CHAOS_COUNT      = 50;
const SPHERE_GROWTH    = 0.002;
const SPHERE_MAX       = 0.4;
const ATOMIZE_DIST     = 0.02;         // how close sphere needs to be
const DUST_LIFE        = 60;
const SPIN_DECAY       = 0.993;
const SPIN_GAIN        = 0.008;
const SPIN_THRESHOLD   = 0.3;
const RESPAWN_DELAY    = 110;

interface ChaosBlock {
  x: number; y: number; vx: number; vy: number;
  size: number; alive: boolean; angle: number; rotSpeed: number;
}

interface DustParticle {
  x: number; y: number; vx: number; vy: number; life: number;
}

interface ApexState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  rpm: number;
  spinAngle: number;
  sphereR: number;
  chaos: ChaosBlock[];
  dust: DustParticle[];
  dragging: boolean;
  prevAngle: number;
  completed: boolean;
  respawnTimer: number;
}

function makeChaos(): ChaosBlock[] {
  return Array.from({ length: CHAOS_COUNT }, () => {
    const a = Math.random() * Math.PI * 2;
    const d = 0.15 + Math.random() * 0.3;
    return {
      x: 0.5 + Math.cos(a) * d, y: 0.5 + Math.sin(a) * d,
      vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003,
      size: 0.005 + Math.random() * 0.012, alive: true,
      angle: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.05,
    };
  });
}

function freshState(c: string, a: string): ApexState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    rpm: 0, spinAngle: 0, sphereR: 0,
    chaos: makeChaos(), dust: [],
    dragging: false, prevAngle: 0,
    completed: false, respawnTimer: 0,
  };
}

export default function ApexCentrifugeAtom({
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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.xl);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.rpm *= SPIN_DECAY;
        s.spinAngle += s.rpm * 0.2;

        // Sphere growth
        if (s.rpm > SPIN_THRESHOLD) {
          s.sphereR = Math.min(SPHERE_MAX, s.sphereR + SPHERE_GROWTH * s.rpm);
        } else {
          s.sphereR *= 0.995;
        }

        // Chaos motion
        for (const ch of s.chaos) {
          if (!ch.alive) continue;
          ch.x += ch.vx;
          ch.y += ch.vy;
          ch.vx += (Math.random() - 0.5) * 0.0005;
          ch.vy += (Math.random() - 0.5) * 0.0005;
          ch.angle += ch.rotSpeed;

          // Bounce off edges
          if (ch.x < 0.02 || ch.x > 0.98) ch.vx *= -0.8;
          if (ch.y < 0.02 || ch.y > 0.98) ch.vy *= -0.8;
          ch.x = Math.max(0.02, Math.min(0.98, ch.x));
          ch.y = Math.max(0.02, Math.min(0.98, ch.y));

          // Atomize on sphere contact
          const dx = ch.x - 0.5;
          const dy = ch.y - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < s.sphereR + ATOMIZE_DIST && s.sphereR > 0.05) {
            ch.alive = false;
            // Spawn dust
            for (let d = 0; d < 4; d++) {
              const da = Math.random() * Math.PI * 2;
              s.dust.push({
                x: ch.x, y: ch.y,
                vx: Math.cos(da) * 0.004 + (dx / dist) * 0.003,
                vy: Math.sin(da) * 0.004 + (dy / dist) * 0.003,
                life: DUST_LIFE,
              });
            }
            cb.onHaptic('step_advance');
          }
        }

        // Dust physics
        for (const d of s.dust) {
          d.x += d.vx;
          d.y += d.vy;
          d.vx *= 0.97;
          d.vy *= 0.97;
          d.life--;
        }
        s.dust = s.dust.filter(d => d.life > 0);

        const aliveCount = s.chaos.filter(c2 => c2.alive).length;
        cb.onStateChange?.(1 - aliveCount / CHAOS_COUNT);

        if (aliveCount === 0) {
          s.completed = true;
          cb.onHaptic('seal_stamp');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // ── LAYER 2: Chaos blocks ───────────────────────
      for (const ch of s.chaos) {
        if (!ch.alive) continue;
        const bx = ch.x * w;
        const by = ch.y * h;
        const bs = px(ch.size, minDim);

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(ch.angle);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance * ms);
        ctx.fillRect(-bs / 2, -bs / 2, bs, bs);
        ctx.restore();
      }

      // ── LAYER 3: White dust ─────────────────────────
      const white: RGB = [255, 255, 255];
      for (const d of s.dust) {
        const dx2 = d.x * w;
        const dy2 = d.y * h;
        const dAlpha = (d.life / DUST_LIFE) * ALPHA.content.max * 0.4 * entrance * ms;
        ctx.beginPath();
        ctx.arc(dx2, dy2, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(white, dAlpha);
        ctx.fill();
      }

      // ── LAYER 4: Sphere glow ────────────────────────
      if (s.sphereR > 0.02) {
        const sphR = px(s.sphereR, minDim);
        const sphGlow = ctx.createRadialGradient(cx, cy, sphR * 0.5, cx, cy, sphR * 1.3);
        sphGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        sphGlow.addColorStop(0.7, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * entrance));
        sphGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sphGlow;
        ctx.fillRect(cx - sphR * 1.3, cy - sphR * 1.3, sphR * 2.6, sphR * 2.6);
      }

      // ── LAYER 5: Sphere boundary ───────────────────
      if (s.sphereR > 0.02) {
        const sphR = px(s.sphereR, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, sphR, 0, Math.PI * 2);
        const sphAlpha = 0.3 + s.rpm * 0.4;
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, white, 0.3),
                               sphAlpha * ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim);
        ctx.stroke();

        // Inner fill
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 3 * entrance);
        ctx.fill();

        // Spin arcs on sphere
        for (let i = 0; i < 6; i++) {
          const a = s.spinAngle + i * Math.PI / 3;
          ctx.beginPath();
          ctx.arc(cx, cy, sphR, a, a + Math.PI * 0.15);
          ctx.strokeStyle = rgba(white, ALPHA.atmosphere.min * s.rpm * entrance * ms);
          ctx.lineWidth = px(STROKE.light, minDim);
          ctx.stroke();
        }
      }

      // ── LAYER 6: Core ──────────────────────────────
      const gr = px(0.12, minDim);
      const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      const cGlowInt = 0.25 + s.rpm * 0.4;
      cGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * cGlowInt * entrance));
      cGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = cGlow;
      ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(cx, cy, coreR * (1 + breath * 0.04), 0, Math.PI * 2);
      const coreColor = s.rpm > 0.5
        ? lerpColor(s.primaryRgb, white, (s.rpm - 0.5) * 0.6) : s.primaryRgb;
      ctx.fillStyle = rgba(coreColor, ALPHA.content.max * entrance);
      ctx.fill();

      // Spin marks
      if (s.rpm > 0.05) {
        for (let i = 0; i < 4; i++) {
          const ma = s.spinAngle + i * Math.PI / 2;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ma) * coreR * 0.6, cy + Math.sin(ma) * coreR * 0.6,
                  px(0.003, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(white, ALPHA.content.max * 0.4 * entrance);
          ctx.fill();
        }
      }

      // ── LAYER 7-8: HUD ─────────────────────────────
      const aliveCount2 = s.chaos.filter(c2 => c2.alive).length;
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('SOVEREIGN', cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
        ctx.fillText(`${CHAOS_COUNT - aliveCount2}/${CHAOS_COUNT}`, cx, h - px(0.035, minDim));
      }

      if (s.rpm < 0.1 && !s.completed && s.sphereR < 0.05) {
        const hFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('SPIN CENTER TO UNLEASH', cx, h - px(0.06, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, cy, px(SPHERE_MAX, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim);
        ctx.stroke();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.rpm = 0; s.sphereR = 0; s.chaos = makeChaos();
          s.dust = []; s.completed = false;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.dragging = true;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      s.prevAngle = Math.atan2(my - 0.5, mx - 0.5);
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('hold_start');
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
      s.rpm = Math.min(1, s.rpm + Math.abs(delta) * SPIN_GAIN * 10);
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
