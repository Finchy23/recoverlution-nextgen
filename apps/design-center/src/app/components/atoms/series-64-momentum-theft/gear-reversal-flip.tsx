/**
 * ATOM 634: THE GEAR REVERSAL ENGINE
 * ====================================
 * Series 64 — Momentum Theft · Position 4
 *
 * Use the manipulator against themselves. Mesh your teeth into
 * the massive spinning gear — its clockwise rotation forces you
 * counter-clockwise. The enemy does all the work.
 *
 * INTERACTION: Drag (mesh into gear) → counter-rotation
 * RENDER: Canvas 2D · REDUCED MOTION: Static meshed gears
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const BIG_TEETH = 16;
const SMALL_TEETH = 8;

export default function GearReversalFlipAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    bigAngle: 0,
    meshed: false,
    meshProgress: 0,     // 0→1
    smallAngle: 0,
    spins: 0,
    dragging: false,
    completed: false, respawnTimer: 0, lastTier: 0,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const drawGear = (x: number, y: number, r: number, teeth: number, angle: number, col: RGB, alpha: number) => {
      const toothH = r * 0.15;
      ctx.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a = angle + (Math.PI * 2 * i) / teeth;
        const a1 = a - Math.PI / teeth * 0.3;
        const a2 = a + Math.PI / teeth * 0.3;
        ctx.lineTo(x + Math.cos(a1) * r, y + Math.sin(a1) * r);
        ctx.lineTo(x + Math.cos(a1) * (r + toothH), y + Math.sin(a1) * (r + toothH));
        ctx.lineTo(x + Math.cos(a2) * (r + toothH), y + Math.sin(a2) * (r + toothH));
        ctx.lineTo(x + Math.cos(a2) * r, y + Math.sin(a2) * r);
      }
      ctx.closePath();
      ctx.fillStyle = rgba(col, alpha);
      ctx.fill();
      ctx.strokeStyle = rgba(col, alpha * 0.7);
      ctx.lineWidth = px(0.001, Math.min(viewport.width, viewport.height));
      ctx.stroke();
    };

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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const bigR = minDim * 0.12;
      const smallR = minDim * 0.06;
      const bigX = cx - minDim * 0.05;
      const bigY = cy;
      const smallX = bigX + bigR + smallR + minDim * 0.01;
      const smallY = bigY;

      // ── Rotation physics ───────────────────────────
      if (!p.reducedMotion) {
        s.bigAngle += 0.008 * ms;
        if (s.meshed) {
          // Counter-rotate: ratio = big teeth / small teeth
          s.smallAngle -= 0.008 * (BIG_TEETH / SMALL_TEETH) * ms;
          s.meshProgress = Math.min(1, s.meshProgress + 0.01);
          s.spins += 0.008 * (BIG_TEETH / SMALL_TEETH) / (Math.PI * 2);
          cb.onStateChange?.(Math.min(1, s.spins / 3));

          const tier = Math.floor(s.spins);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }

          if (s.spins >= 3 && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = 90;
          }
        }
      }

      // ── Draw big gear ──────────────────────────────
      drawGear(bigX, bigY, bigR, BIG_TEETH, s.bigAngle, s.accentRgb, ALPHA.content.max * 0.6 * entrance);

      // ── Draw small gear ────────────────────────────
      const sgAlpha = s.meshed ? ALPHA.content.max : ALPHA.content.max * 0.5;
      const sgColor = s.meshed ? s.primaryRgb : s.primaryRgb;
      drawGear(s.meshed ? smallX : smallX + minDim * 0.08, smallY, smallR, SMALL_TEETH, s.smallAngle, sgColor, sgAlpha * entrance);

      // Center dots
      ctx.beginPath();
      ctx.arc(bigX, bigY, px(0.004, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * entrance);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s.meshed ? smallX : smallX + minDim * 0.08, smallY, px(0.004, minDim) * (1 + breath * 0.15), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Mesh energy glow ───────────────────────────
      if (s.meshed && s.meshProgress > 0.3) {
        const mGlow = ctx.createRadialGradient(smallX, smallY, 0, smallX, smallY, smallR * 2);
        mGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.meshProgress * entrance));
        mGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mGlow;
        ctx.fillRect(smallX - smallR * 2, smallY - smallR * 2, smallR * 4, smallR * 4);
      }

      // ── Torque transfer corridor ──────────────────
      if (s.meshed && s.meshProgress > 0.15) {
        const corridorStartX = smallX + smallR * 1.2;
        const corridorEndX = w * 0.9;
        const laneOffsets = [-0.038, 0, 0.038];

        laneOffsets.forEach((offset, idx) => {
          const y = cy + minDim * offset;
          const laneAlpha = (0.12 + idx * 0.04) * s.meshProgress * entrance;

          ctx.beginPath();
          ctx.moveTo(corridorStartX, y);
          ctx.lineTo(corridorEndX, y);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * laneAlpha);
          ctx.lineWidth = px(0.01, minDim);
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(corridorStartX, y);
          ctx.lineTo(corridorEndX, y);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.22 * s.meshProgress * entrance);
          ctx.lineWidth = px(0.0022, minDim);
          ctx.stroke();

          for (let i = 0; i < 4; i++) {
            const t = ((s.frameCount * 0.014 * (1.2 + idx * 0.18)) + i * 0.22) % 1;
            const x = corridorStartX + (corridorEndX - corridorStartX) * t;
            ctx.beginPath();
            ctx.arc(x, y, px(0.0032, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * s.meshProgress * entrance);
            ctx.fill();
          }
        });
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.meshed = false; s.meshProgress = 0; s.smallAngle = 0;
          s.spins = 0; s.completed = false; s.lastTier = 0;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.meshed || s.completed) return;
      s.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.meshed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      // Moving left = toward big gear = meshing
      if (mx < 0.6) {
        s.meshed = true;
        s.dragging = false;
        cbRef.current.onHaptic('drag_snap');
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
