/**
 * ATOM 694: THE MUTUAL ANNIHILATION ENGINE
 * ==========================================
 * Series 70 — Wu Wei Master · Position 4
 *
 * Two threats from opposite sides. Stay perfectly dead-center.
 * They cross the null-zone simultaneously, annihilating each other.
 *
 * PHYSICS:
 *   - Two massive red threat vectors approach from opposite edges
 *   - Threats track user movement — dodging makes both aim at you
 *   - Hands off glass: core stays dead-center in null-zone
 *   - Threats cross at exact center → mutual collision → annihilation
 *   - Near-miss spark explosion at center, user untouched
 *   - Post-annihilation: serene center glow, debris drifts outward
 *   - Moving the core off-center causes threats to converge on YOU
 *
 * INTERACTION:
 *   Touch → moves core off-center (counterproductive, threats track)
 *   Hands off → stillness → threats collide → annihilation
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static center glow with debris scatter
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const THREAT_R = 0.06;
const THREAT_SPEED = 0.0025;
const THREAT_TRACK_SPEED = 0.008;
const CORE_R = SIZE.md;
const NULL_ZONE_R = 0.03;
const COLLISION_DIST = 0.04;
const ANNIHILATION_SPARKS = 30;
const SPARK_LIFE = 60;
const SPARK_SPEED = 0.008;
const DEBRIS_COUNT = 16;
const GLOW_LAYERS = 4;
const APPROACH_DELAY = 120;     // frames before threats start moving

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
}

interface Debris {
  angle: number; dist: number;
  speed: number; size: number;
}

export default function MutualAnnihilationAtom({
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
    // Threats
    threatL: { x: -0.1, y: 0.5 },
    threatR: { x: 1.1, y: 0.5 },
    threatActive: false,
    // Core
    coreX: 0.5,
    coreY: 0.5,
    coreDragged: false,
    // Annihilation
    annihilated: false,
    annihilationProgress: 0,
    sparks: [] as Spark[],
    debris: [] as Debris[],
    stepNotified: false,
    completed: false,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;

      if (p.reducedMotion) {
        const cR = px(CORE_R * 0.3, minDim);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = cR * (2 + i * 2);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance / (i + 1)));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath(); ctx.arc(cx, cy, cR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Approach phase ────────────────────────────────────
      if (s.frameCount > APPROACH_DELAY && !s.threatActive) {
        s.threatActive = true;
      }

      if (p.phase === 'resolve') {
        s.threatActive = true;
        s.coreX = 0.5; s.coreY = 0.5;
      }

      // ── Threat movement ───────────────────────────────────
      if (s.threatActive && !s.annihilated) {
        // Threats track user position (if moved off center)
        const targetY = s.coreY;
        s.threatL.y += (targetY - s.threatL.y) * THREAT_TRACK_SPEED * ms;
        s.threatR.y += (targetY - s.threatR.y) * THREAT_TRACK_SPEED * ms;

        // Advance toward center
        s.threatL.x += THREAT_SPEED * ms;
        s.threatR.x -= THREAT_SPEED * ms;

        // Step haptic at halfway
        if (s.threatL.x > 0.25 && !s.stepNotified) {
          s.stepNotified = true;
          cb.onHaptic('step_advance');
        }

        // Collision check
        const dx = s.threatL.x - s.threatR.x;
        const dy = s.threatL.y - s.threatR.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < COLLISION_DIST) {
          s.annihilated = true;
          // Check if core is in null-zone
          const coreDist = Math.sqrt((s.coreX - 0.5) ** 2 + (s.coreY - 0.5) ** 2);
          if (coreDist < NULL_ZONE_R * 2) {
            // Perfect — user survives
            cb.onHaptic('completion');
            s.completed = true;
          }

          // Spawn sparks
          const collisionX = (s.threatL.x + s.threatR.x) / 2;
          const collisionY = (s.threatL.y + s.threatR.y) / 2;
          for (let i = 0; i < ANNIHILATION_SPARKS; i++) {
            const angle = (i / ANNIHILATION_SPARKS) * Math.PI * 2;
            const speed = SPARK_SPEED * (0.3 + Math.random() * 0.7);
            s.sparks.push({
              x: collisionX, y: collisionY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: SPARK_LIFE, maxLife: SPARK_LIFE,
            });
          }
          // Debris
          for (let i = 0; i < DEBRIS_COUNT; i++) {
            s.debris.push({
              angle: (i / DEBRIS_COUNT) * Math.PI * 2 + Math.random() * 0.3,
              dist: 0.02,
              speed: 0.002 + Math.random() * 0.003,
              size: 0.003 + Math.random() * 0.004,
            });
          }
        }
      }

      if (s.annihilated) {
        s.annihilationProgress = Math.min(1, s.annihilationProgress + 0.012 * ms);
        for (const d of s.debris) { d.dist += d.speed * ms; }
      }

      cb.onStateChange?.(s.annihilated ? 0.5 + s.annihilationProgress * 0.5 :
        s.threatActive ? Math.max(0, s.threatL.x) * 0.5 : 0);

      // ── 1. Threat warning lines ───────────────────────────
      if (s.threatActive && !s.annihilated) {
        // Converging danger lines
        const lx = s.threatL.x * w;
        const ly = s.threatL.y * h;
        const rx = s.threatR.x * w;
        const ry = s.threatR.y * h;

        // Left threat trail
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(lx, ly);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();

        // Right threat trail
        ctx.beginPath();
        ctx.moveTo(w, ry);
        ctx.lineTo(rx, ry);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.stroke();
      }

      // ── 2. Threats ────────────────────────────────────────
      if (s.threatActive && !s.annihilated) {
        const threats = [s.threatL, s.threatR];
        for (const t of threats) {
          const tx = t.x * w;
          const ty = t.y * h;
          const tR = px(THREAT_R, minDim);

          // Threat glow
          const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, tR * 2);
          tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.25 * entrance));
          tg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(tx - tR * 2, ty - tR * 2, tR * 4, tR * 4);

          // Threat body
          ctx.beginPath();
          ctx.arc(tx, ty, tR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
          ctx.fill();

          // Speed lines
          const speedDir = t === s.threatL ? 1 : -1;
          for (let i = 0; i < 3; i++) {
            const lineX = tx - speedDir * tR * (1.5 + i * 0.5);
            ctx.beginPath();
            ctx.moveTo(lineX, ty - tR * 0.3);
            ctx.lineTo(lineX, ty + tR * 0.3);
            ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * (1 - i * 0.3) * entrance);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
        }
      }

      // ── 3. Core (dead center) ─────────────────────────────
      const coreX = s.coreX * w;
      const coreY = s.coreY * h;
      const coreR = px(CORE_R * 0.25, minDim);

      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = coreR * (1.5 + i * 1.2 + (s.annihilated ? s.annihilationProgress * 2 : 0));
        const gA = ALPHA.glow.max * (0.08 + (s.completed ? 0.2 : 0)) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(coreX - gR, coreY - gR, gR * 2, gR * 2);
      }

      ctx.beginPath();
      ctx.arc(coreX, coreY, coreR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.5 + (s.completed ? 0.3 : 0)) * entrance);
      ctx.fill();

      // Null-zone ring (subtle guide)
      if (!s.annihilated) {
        ctx.beginPath();
        ctx.arc(cx, cy, px(NULL_ZONE_R, minDim), 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(0.001, minDim);
        ctx.setLineDash([px(0.003, minDim), px(0.003, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── 4. Annihilation effects ───────────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms; sp.y += sp.vy * ms;
        sp.life -= ms;
        if (sp.life <= 0) { s.sparks.splice(i, 1); continue; }
        const lr = sp.life / sp.maxLife;
        const spx = sp.x * w; const spy = sp.y * h;
        const sR = px(0.004 * lr, minDim);

        const sg = ctx.createRadialGradient(spx, spy, 0, spx, spy, sR * 2);
        sg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.5 * lr * entrance));
        sg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(spx - sR * 2, spy - sR * 2, sR * 4, sR * 4);
        ctx.beginPath(); ctx.arc(spx, spy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.6 * lr * entrance);
        ctx.fill();
      }

      // Debris
      for (const d of s.debris) {
        const dx2 = cx + Math.cos(d.angle) * px(d.dist, minDim);
        const dy2 = cy + Math.sin(d.angle) * px(d.dist, minDim);
        const dAlpha = ALPHA.content.max * 0.2 * Math.max(0, 1 - d.dist / 0.5) * entrance;
        if (dAlpha < 0.01) continue;
        ctx.beginPath();
        ctx.arc(dx2, dy2, px(d.size, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, dAlpha);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Touch = move core off center (counterproductive)
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.annihilated) return;
      s.coreDragged = true;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.coreDragged || s.annihilated) return;
      const rect = canvas.getBoundingClientRect();
      s.coreX = (e.clientX - rect.left) / rect.width;
      s.coreY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = () => {
      stateRef.current.coreDragged = false;
      // Slowly return to center
      const drift = () => {
        const s = stateRef.current;
        if (!s.coreDragged && !s.annihilated) {
          s.coreX += (0.5 - s.coreX) * 0.02;
          s.coreY += (0.5 - s.coreY) * 0.02;
        }
      };
      drift(); // Start drift
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
