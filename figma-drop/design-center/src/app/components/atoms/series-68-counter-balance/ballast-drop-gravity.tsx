/**
 * ATOM 673: THE BALLAST DROP ENGINE
 * ====================================
 * Series 68 — Counter-Balance · Position 3
 *
 * Cure top-heavy fragility. Tap the release valve — heavy anxiety
 * nodes drop from top to base. Center of gravity shifts below
 * pivot. Structure becomes self-righting.
 *
 * SIGNATURE TECHNIQUE: Equilibrium counter-balance — center of
 * gravity visualization, tilt physics, ballast drop animation,
 * self-righting demonstration.
 *
 * INTERACTION: Tap → release ballast → self-righting stability
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static stable
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const STRUCT_WIDTH     = 0.08;
const STRUCT_HEIGHT    = 0.4;
const PIVOT_Y          = 0.55;
const BALLAST_COUNT    = 4;
const TILT_RATE        = 0.001;
const SELF_RIGHT_RATE  = 0.03;
const SURVIVE_TILTS    = 3;
const RESPAWN_DELAY    = 100;

interface BallastState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  tilt: number;
  tiltVel: number;
  ballastDropped: boolean;
  cogY: number;                 // center of gravity Y (0 = top, 1 = bottom)
  tiltsSurvived: number;
  tiltTimer: number;
  completed: boolean;
  respawnTimer: number;
  dropAnim: number;
}

function freshState(c: string, a: string): BallastState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    tilt: 0, tiltVel: 0, ballastDropped: false,
    cogY: 0.2, tiltsSurvived: 0, tiltTimer: 60,
    completed: false, respawnTimer: 0, dropAnim: 0,
  };
}

export default function BallastDropGravityAtom({
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

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        // Drop animation
        if (s.ballastDropped && s.dropAnim < 1) {
          s.dropAnim = Math.min(1, s.dropAnim + 0.02);
          s.cogY = 0.2 + s.dropAnim * 0.6;
        }

        // Tilt forcing
        s.tiltTimer--;
        if (s.tiltTimer <= 0) {
          s.tiltVel += (Math.random() > 0.5 ? 1 : -1) * 0.008;
          s.tiltTimer = 80 + Math.floor(Math.random() * 40);
        }

        // Physics: top-heavy = unstable, bottom-heavy = self-righting
        const stabilityFactor = s.cogY > 0.5 ? SELF_RIGHT_RATE : TILT_RATE;
        if (s.cogY > 0.5) {
          s.tiltVel -= s.tilt * stabilityFactor;
        } else {
          s.tiltVel += s.tilt * TILT_RATE * 0.5;
        }
        s.tiltVel *= 0.97;
        s.tilt += s.tiltVel;

        if (s.ballastDropped && s.dropAnim >= 1) {
          if (Math.abs(s.tilt) < 0.05 && Math.abs(s.tiltVel) < 0.002) {
            s.tiltsSurvived++;
            if (s.tiltsSurvived >= SURVIVE_TILTS) {
              s.completed = true;
              cb.onHaptic('completion');
              cb.onStateChange?.(1);
              s.respawnTimer = RESPAWN_DELAY;
            } else {
              cb.onHaptic('step_advance');
            }
          }
        }

        cb.onStateChange?.(s.ballastDropped ? 0.5 + (s.tiltsSurvived / SURVIVE_TILTS) * 0.5 : 0.1);

        // Capsize check (top-heavy)
        if (!s.ballastDropped && Math.abs(s.tilt) > 0.5) {
          cb.onHaptic('error_boundary');
        }
      }

      const pivotY = h * PIVOT_Y;
      const structW = px(STRUCT_WIDTH, minDim);
      const structH = px(STRUCT_HEIGHT, minDim);

      // ── LAYER 2: Tilting platform ──────────────────
      ctx.save();
      ctx.translate(cx, pivotY);
      ctx.rotate(s.tilt);

      // Structure body
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
      ctx.fillRect(-structW / 2, -structH, structW, structH);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.strokeRect(-structW / 2, -structH, structW, structH);

      // Ballast nodes (migrate from top to bottom)
      for (let i = 0; i < BALLAST_COUNT; i++) {
        const topY = -structH * (0.8 - i * 0.15);
        const botY = -structH * 0.1 + i * px(0.015, minDim);
        const by = topY + (botY - topY) * s.dropAnim;
        ctx.beginPath();
        ctx.arc(0, by, px(0.01, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
      }

      // Center of gravity marker
      const cogMarkerY = -structH * (1 - s.cogY);
      ctx.beginPath();
      ctx.moveTo(-structW / 2 - px(0.01, minDim), cogMarkerY);
      ctx.lineTo(-structW / 2 - px(0.02, minDim), cogMarkerY - px(0.006, minDim));
      ctx.lineTo(-structW / 2 - px(0.02, minDim), cogMarkerY + px(0.006, minDim));
      ctx.closePath();
      ctx.fillStyle = rgba(s.cogY > 0.5 ? s.primaryRgb : s.accentRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fill();

      ctx.restore();

      // ── LAYER 3: Pivot point ───────────────────────
      ctx.beginPath();
      ctx.moveTo(cx, pivotY);
      ctx.lineTo(cx - px(0.015, minDim), pivotY + px(0.03, minDim));
      ctx.lineTo(cx + px(0.015, minDim), pivotY + px(0.03, minDim));
      ctx.closePath();
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fill();

      // ── LAYER 4: Tilt gauge ────────────────────────
      const gaugeY = h - px(0.1, minDim);
      const gaugeW = px(0.2, minDim);
      ctx.beginPath();
      ctx.moveTo(cx - gaugeW, gaugeY);
      ctx.lineTo(cx + gaugeW, gaugeY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      // Tilt needle
      const needleX = cx + s.tilt * gaugeW * 3;
      ctx.beginPath();
      ctx.arc(Math.max(cx - gaugeW, Math.min(cx + gaugeW, needleX)), gaugeY, px(0.005, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(Math.abs(s.tilt) > 0.1 ? s.accentRgb : s.primaryRgb, ALPHA.content.max * 0.6 * entrance);
      ctx.fill();

      // ── LAYER 5: Release valve button ──────────────
      if (!s.ballastDropped) {
        const btnX = cx;
        const btnY = px(0.08, minDim);
        const btnR = px(0.025, minDim);
        ctx.beginPath();
        ctx.arc(btnX, btnY, btnR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        const vFont = Math.max(6, px(FONT_SIZE.xs, minDim));
        ctx.font = `${vFont}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.text.max * 0.5 * entrance);
        ctx.fillText('▼', btnX, btnY);
        ctx.textBaseline = 'alphabetic';
      }

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      const tiltDeg = Math.round(s.tilt * 180 / Math.PI);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
      ctx.fillText(`${tiltDeg}°`, cx, h - px(0.035, minDim));

      if (!s.ballastDropped) {
        const hFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('TAP TO DROP BALLAST', cx, h - px(0.06, minDim));
      }

      if (p.reducedMotion) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * entrance);
        ctx.fillRect(cx - structW / 2, pivotY - structH, structW, structH);
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
      if (!s.ballastDropped) {
        s.ballastDropped = true;
        cbRef.current.onHaptic('tap');
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
