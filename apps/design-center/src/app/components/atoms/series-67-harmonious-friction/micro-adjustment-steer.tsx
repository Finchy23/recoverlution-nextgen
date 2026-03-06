/**
 * ATOM 669: THE MICRO-ADJUSTMENT ENGINE
 * ========================================
 * Series 67 — Harmonious Friction · Position 9
 *
 * Prevent the crash with constant tiny friction. Rhythmically apply
 * microscopic frictional taps to keep the heavy node in perfect
 * center alignment — annoying but preventing catastrophic collision.
 *
 * SIGNATURE TECHNIQUE: Directional friction — narrow channel with
 * drift physics, micro-correction visualizations, alignment gauge,
 * cumulative correction count proving consistency.
 *
 * INTERACTION: Tap (rhythmic micro-corrections) → sustained alignment
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static centered node
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const NODE_RADIUS      = 0.02;
const CHANNEL_WIDTH    = 0.12;
const DRIFT_FORCE      = 0.00015;
const TAP_CORRECTION   = 0.008;
const JOURNEY_LENGTH   = 600;          // frames to complete
const WALL_HIT_ZONE    = 0.05;
const RESPAWN_DELAY    = 100;

interface SteerState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;                // center = 0.5
  velX: number;
  journeyProgress: number;     // 0-1
  corrections: number;
  wallHits: number;
  scrollY: number;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): SteerState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.5, velX: 0, journeyProgress: 0,
    corrections: 0, wallHits: 0, scrollY: 0,
    completed: false, respawnTimer: 0,
  };
}

export default function MicroAdjustmentSteerAtom({
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
      if (!p.reducedMotion && !s.completed) {
        // Natural drift toward left wall
        const driftDir = Math.sin(s.frameCount * 0.007) > 0 ? -1 : -0.5;
        s.velX += DRIFT_FORCE * driftDir;
        s.velX *= 0.98;
        s.nodeX += s.velX;

        s.journeyProgress = Math.min(1, s.journeyProgress + 1 / JOURNEY_LENGTH);
        s.scrollY += 0.002;
        cb.onStateChange?.(s.journeyProgress);

        // Wall collision check
        const leftWall = 0.5 - CHANNEL_WIDTH / 2;
        const rightWall = 0.5 + CHANNEL_WIDTH / 2;
        if (s.nodeX < leftWall + WALL_HIT_ZONE) {
          s.nodeX = leftWall + WALL_HIT_ZONE;
          s.velX = Math.abs(s.velX) * 0.3;
          s.wallHits++;
          cb.onHaptic('error_boundary');
        }
        if (s.nodeX > rightWall - WALL_HIT_ZONE) {
          s.nodeX = rightWall - WALL_HIT_ZONE;
          s.velX = -Math.abs(s.velX) * 0.3;
          s.wallHits++;
        }

        if (s.journeyProgress >= 1) {
          s.completed = true;
          cb.onHaptic('completion');
          cb.onStateChange?.(1);
          s.respawnTimer = RESPAWN_DELAY;
        }
      }

      const leftW = (0.5 - CHANNEL_WIDTH / 2) * w;
      const rightW = (0.5 + CHANNEL_WIDTH / 2) * w;
      const nodeY = h * 0.65;

      // ── LAYER 2: Channel walls ─────────────────────
      // Left wall
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.1 * entrance);
      ctx.fillRect(0, 0, leftW, h);
      ctx.beginPath();
      ctx.moveTo(leftW, 0);
      ctx.lineTo(leftW, h);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // Right wall
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.05 * entrance);
      ctx.fillRect(rightW, 0, w - rightW, h);
      ctx.beginPath();
      ctx.moveTo(rightW, 0);
      ctx.lineTo(rightW, h);
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // ── LAYER 3: Centerline ────────────────────────
      ctx.setLineDash([px(0.006, minDim), px(0.01, minDim)]);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── LAYER 4: Scrolling distance marks ──────────
      const markSpacing = px(0.06, minDim);
      const markOffset = (s.scrollY * minDim * 10) % markSpacing;
      for (let y = -markOffset; y < h; y += markSpacing) {
        ctx.beginPath();
        ctx.moveTo(leftW + px(0.005, minDim), y);
        ctx.lineTo(leftW + px(0.015, minDim), y);
        ctx.moveTo(rightW - px(0.005, minDim), y);
        ctx.lineTo(rightW - px(0.015, minDim), y);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance * ms);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Drift indicator arrow ─────────────
      if (Math.abs(s.velX) > 0.0001) {
        const arrowDir = s.velX > 0 ? 1 : -1;
        const arrowLen = Math.min(px(0.04, minDim), Math.abs(s.velX) * 5000);
        const ax = s.nodeX * w + arrowDir * nodeR * 2;
        ctx.beginPath();
        ctx.moveTo(ax, nodeY);
        ctx.lineTo(ax + arrowDir * arrowLen, nodeY);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance * ms);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── LAYER 6: Correction flash ──────────────────
      // (brief flash at node position on tap)

      // ── LAYER 7: Node ──────────────────────────────
      const nx = s.nodeX * w;
      const gr = px(0.07, minDim);
      const nGlow = ctx.createRadialGradient(nx, nodeY, 0, nx, nodeY, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(nx - gr, nodeY - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(nx, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // Alignment quality indicator (distance from center)
      const deviation = Math.abs(s.nodeX - 0.5) / (CHANNEL_WIDTH / 2);
      const alignColor = deviation < 0.3 ? s.primaryRgb : s.accentRgb;

      // Alignment ring
      const alignR = nodeR * (1.5 + deviation * 0.5);
      ctx.beginPath();
      ctx.arc(nx, nodeY, alignR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(alignColor, ALPHA.atmosphere.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      // Journey progress
      const barW = px(SIZE.md * 0.7, minDim);
      const barH = px(0.006, minDim);
      const barX = cx - barW / 2;
      const barY = px(0.04, minDim);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(barX, barY, barW * s.journeyProgress, barH);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
      ctx.fillText(`${s.corrections} corrections`, cx, barY + px(0.025, minDim));

      if (s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('ALIGNED', cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('TAP TO CORRECT RIGHT', cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.arc(cx, nodeY, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
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
      if (s.completed) return;
      // Micro-correction to the right (counter-drift)
      s.velX += TAP_CORRECTION;
      s.corrections++;
      cbRef.current.onHaptic('tap');
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
