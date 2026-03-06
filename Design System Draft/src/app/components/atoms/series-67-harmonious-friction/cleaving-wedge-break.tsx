/**
 * ATOM 667: THE CLEAVING WEDGE ENGINE
 * =====================================
 * Series 67 — Harmonious Friction · Position 7
 *
 * Execute the necessary break. Position the sharp wedge on the
 * fault line and deliver brutal kinetic strikes — the final strike
 * cleanly cleaves rot from pristine, saving the healthy half.
 *
 * SIGNATURE TECHNIQUE: Directional friction — wedge penetration
 * depth meter, fracture propagation lines, strike impact sparks,
 * dramatic cleave separation animation.
 *
 * INTERACTION: Tap (repeated strikes) → fracture propagation → cleave
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static cleaved halves
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const BLOCK_WIDTH      = 0.5;
const BLOCK_HEIGHT     = 0.25;
const STRIKES_NEEDED   = 8;
const FRACTURE_GROWTH  = 0.12;
const WEDGE_WIDTH      = 0.03;
const CLEAVE_SPEED     = 0.01;
const RESPAWN_DELAY    = 110;

interface CleaveState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  strikes: number;
  fracture: number;             // 0-1 crack depth
  cleaved: boolean;
  cleaveOffset: number;         // separation distance
  shakeAmplitude: number;
  sparks: { x: number; y: number; vx: number; vy: number; life: number }[];
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): CleaveState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    strikes: 0, fracture: 0, cleaved: false, cleaveOffset: 0,
    shakeAmplitude: 0, sparks: [],
    completed: false, respawnTimer: 0,
  };
}

export default function CleavingWedgeBreakAtom({
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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      const blockW = px(BLOCK_WIDTH, minDim);
      const blockH = px(BLOCK_HEIGHT, minDim);
      const blockX = cx - blockW / 2;
      const blockY = cy - blockH / 2;

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion) {
        s.shakeAmplitude *= 0.9;

        if (s.cleaved && !s.completed) {
          s.cleaveOffset = Math.min(0.15, s.cleaveOffset + CLEAVE_SPEED);
          cb.onStateChange?.(0.8 + s.cleaveOffset / 0.15 * 0.2);
          if (s.cleaveOffset >= 0.15) {
            s.completed = true;
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Spark physics
        for (const sp of s.sparks) { sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.0003; sp.life--; }
        s.sparks = s.sparks.filter(sp => sp.life > 0);
      }

      const shakeX = s.shakeAmplitude * Math.sin(s.frameCount * 0.8) * minDim;
      const splitOff = px(s.cleaveOffset, minDim);

      // ── LAYER 2: Left half (pristine) ──────────────
      ctx.save();
      ctx.translate(shakeX - splitOff, 0);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
      ctx.fillRect(blockX, blockY, blockW / 2, blockH);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.strokeRect(blockX, blockY, blockW / 2, blockH);

      // "Pristine" label
      const labelFont = Math.max(7, px(FONT_SIZE.xs, minDim));
      ctx.font = `${labelFont}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
      ctx.fillText('PRISTINE', blockX + blockW / 4, blockY + blockH / 2 + px(0.003, minDim));
      ctx.restore();

      // ── LAYER 3: Right half (rot) ──────────────────
      ctx.save();
      ctx.translate(shakeX + splitOff, 0);

      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.fillRect(cx, blockY, blockW / 2, blockH);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.strokeRect(cx, blockY, blockW / 2, blockH);

      // Rot spreading pattern
      for (let i = 0; i < 12; i++) {
        const rx = cx + Math.random() * blockW / 2;
        const ry = blockY + Math.random() * blockH;
        ctx.beginPath();
        ctx.arc(rx, ry, px(0.003 + Math.random() * 0.004, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.4 * entrance * ms);
        ctx.fill();
      }

      ctx.font = `${labelFont}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * entrance);
      ctx.fillText('ROT', cx + blockW / 4, blockY + blockH / 2 + px(0.003, minDim));
      ctx.restore();

      // ── LAYER 4: Fracture line ─────────────────────
      if (s.fracture > 0 && !s.cleaved) {
        const fractureDepth = blockH * s.fracture;
        ctx.beginPath();
        ctx.moveTo(cx + shakeX, blockY);
        // Jagged fracture line
        const segments = 8;
        for (let i = 1; i <= segments; i++) {
          const fy = blockY + (fractureDepth * i / segments);
          const fx = cx + shakeX + (Math.sin(i * 2.1) * px(0.005, minDim));
          ctx.lineTo(fx, fy);
        }
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * s.fracture * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Wedge ─────────────────────────────
      if (!s.cleaved) {
        const wedgeX = cx + shakeX;
        const wedgeY = blockY - px(0.02, minDim);
        const wedgeW = px(WEDGE_WIDTH, minDim);
        const wedgeH = px(0.04, minDim);

        // Wedge triangle
        ctx.beginPath();
        ctx.moveTo(wedgeX - wedgeW / 2, wedgeY);
        ctx.lineTo(wedgeX + wedgeW / 2, wedgeY);
        ctx.lineTo(wedgeX, wedgeY + wedgeH);
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 6: Impact sparks ─────────────────────
      const sparkColor: RGB = [255, 200, 80];
      for (const sp of s.sparks) {
        ctx.beginPath();
        ctx.arc(sp.x * w, sp.y * h, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(sparkColor, (sp.life / 20) * ALPHA.content.max * 0.6 * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 7: Strike counter ───────────────────
      const barW = px(SIZE.md * 0.7, minDim);
      const barH = px(0.006, minDim);
      const barX = cx - barW / 2;
      const barY = h - px(0.08, minDim);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fillRect(barX, barY, barW * s.fracture, barH);

      for (let i = 0; i <= STRIKES_NEEDED; i++) {
        const mx = barX + (i / STRIKES_NEEDED) * barW;
        ctx.beginPath();
        ctx.moveTo(mx, barY - px(0.003, minDim));
        ctx.lineTo(mx, barY + barH + px(0.003, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.cleaved) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('CLEAVED', cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText(`TAP TO STRIKE · ${s.strikes}/${STRIKES_NEEDED}`, cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.fillRect(blockX - px(0.05, minDim), blockY, blockW / 2, blockH);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.fillRect(cx + px(0.05, minDim), blockY, blockW / 2, blockH);
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

    const onDown = () => {
      const s = stateRef.current;
      if (s.completed || s.cleaved) return;
      s.strikes++;
      s.fracture = Math.min(1, s.fracture + FRACTURE_GROWTH);
      s.shakeAmplitude = 0.005;

      // Sparks at wedge point
      for (let i = 0; i < 5; i++) {
        const a = Math.random() * Math.PI - Math.PI / 2;
        s.sparks.push({
          x: 0.5, y: 0.5 - BLOCK_HEIGHT / 2,
          vx: Math.cos(a) * 0.005, vy: Math.sin(a) * 0.003 - 0.002,
          life: 15 + Math.random() * 10,
        });
      }

      cbRef.current.onHaptic('tap');
      cbRef.current.onStateChange?.(s.fracture * 0.8);

      if (s.fracture >= 1) {
        s.cleaved = true;
        cbRef.current.onHaptic('completion');
      }
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
