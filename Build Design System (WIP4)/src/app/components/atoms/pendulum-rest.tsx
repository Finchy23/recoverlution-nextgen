/**
 * ATOM: PENDULUM-REST — The Natural Return
 * Approach: Install schema — equilibrium as concept
 *
 * A luminous pendulum swings back and forth. Its arc leaves
 * ghostly afterimages that fade. Breath controls the damping —
 * deeper, slower breath = faster settling. The pendulum
 * gradually comes to rest at center. The resting point glows.
 *
 * INTERACTION: Breath (damping control)
 * RESOLVE: Pendulum reaches near-stillness
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance, drawAtmosphere,
  clamp,
} from './atom-utils';

const GRAVITY = 0.0006;
const NATURAL_DAMPING = 0.9965;    // Base damping — settles ~22s without breath
const BREATH_DAMPING = 0.005;      // Breath accelerates settling — ~13s with engagement
const TRAIL_COUNT = 24;
const RESOLVE_THRESHOLD = 0.01;    // angle threshold for resolve (radians)
const INITIAL_ANGLE = Math.PI * 0.35;

interface TrailPoint {
  angle: number;
  alpha: number;
}

export default function PendulumRestAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    angle: INITIAL_ANGLE,
    angularVel: 0,
    trail: [] as TrailPoint[],
    resolved: false,
    resolveGlow: 0,
    steadyFrames: 0,
  });

  useEffect(() => { cbRef.current = { onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve }; }, [props.onHaptic, props.onStateChange, props.onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor }; }, [props.breathAmplitude, props.reducedMotion, props.phase, props.color, props.accentColor]);
  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(props.color); s.accentRgb = parseColor(props.accentColor); }, [props.color, props.accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = props.viewport.width, h = props.viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const cx = w / 2;
    const pivotY = h * 0.12;
    const armLength = minDim * 0.35;

    let animId: number;
    let trailTimer = 0;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      drawAtmosphere(ctx, cx, h * 0.45, w, h, minDim, s.primaryRgb, entrance);

      // ── Physics ──
      if (!p.reducedMotion) {
        // Gravity torque
        const accel = -GRAVITY * Math.sin(s.angle);
        s.angularVel += accel;

        // Damping — breath makes it settle faster
        const breathDamp = 1 - (p.breathAmplitude * BREATH_DAMPING);
        s.angularVel *= NATURAL_DAMPING * breathDamp;

        s.angle += s.angularVel;
      }

      // Progress = how close to rest
      const amplitude = Math.abs(s.angle);
      const settledFrac = clamp(1 - amplitude / INITIAL_ANGLE, 0, 1);
      cb.onStateChange?.(settledFrac);

      // Bob position
      const bobX = cx + Math.sin(s.angle) * armLength;
      const bobY = pivotY + Math.cos(s.angle) * armLength;

      // ── Trail ──
      trailTimer++;
      if (trailTimer % 3 === 0) {
        s.trail.push({ angle: s.angle, alpha: 1 });
        if (s.trail.length > TRAIL_COUNT) s.trail.shift();
      }

      // Render trail (ghostly afterimages)
      for (let i = 0; i < s.trail.length; i++) {
        const t = s.trail[i];
        t.alpha *= 0.96;
        if (t.alpha < 0.01) continue;

        const tx = cx + Math.sin(t.angle) * armLength;
        const ty = pivotY + Math.cos(t.angle) * armLength;
        const trailAlpha = t.alpha * 0.12 * entrance;

        const glowR = minDim * 0.02;
        const tGrad = ctx.createRadialGradient(tx, ty, 0, tx, ty, glowR);
        tGrad.addColorStop(0, rgba(s.accentRgb, trailAlpha));
        tGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = tGrad;
        ctx.fillRect(tx - glowR, ty - glowR, glowR * 2, glowR * 2);
      }

      // ── Pivot point ──
      ctx.beginPath();
      ctx.arc(cx, pivotY, minDim * 0.003, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, 0.15 * entrance);
      ctx.fill();

      // ── Arm ──
      ctx.beginPath();
      ctx.moveTo(cx, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.3), 0.04 * entrance);
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // ── Bob ──
      const bobR = minDim * 0.015;
      const breathPulse = p.reducedMotion ? 0.9 : 0.8 + p.breathAmplitude * 0.2;

      // Bob glow
      const bobGlowR = bobR * 8;
      const bGrad = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, bobGlowR);
      bGrad.addColorStop(0, rgba(s.accentRgb, 0.12 * breathPulse * entrance));
      bGrad.addColorStop(0.2, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), 0.04 * entrance));
      bGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bGrad;
      ctx.fillRect(bobX - bobGlowR, bobY - bobGlowR, bobGlowR * 2, bobGlowR * 2);

      // Bob core
      ctx.beginPath();
      ctx.arc(bobX, bobY, bobR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, 0.35 * entrance);
      ctx.fill();

      // Specular
      ctx.beginPath();
      ctx.arc(bobX - bobR * 0.2, bobY - bobR * 0.2, bobR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.15 * entrance);
      ctx.fill();

      // ── Center rest marker (very faint) ──
      const centerX = cx;
      const centerY = pivotY + armLength;
      const restAlpha = settledFrac * 0.06 * entrance;
      ctx.beginPath();
      ctx.arc(centerX, centerY, minDim * 0.002, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, restAlpha);
      ctx.fill();

      // ── Resolution ──
      if (amplitude < RESOLVE_THRESHOLD && Math.abs(s.angularVel) < 0.0002) {
        s.steadyFrames++;
        if (s.steadyFrames > 60 && !s.resolved) {
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      } else {
        s.steadyFrames = 0;
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const rR = minDim * 0.12;
        const rGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, rR);
        rGrad.addColorStop(0, rgba(s.accentRgb, s.resolveGlow * 0.08 * entrance));
        rGrad.addColorStop(0.4, rgba(s.primaryRgb, s.resolveGlow * 0.03 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(centerX - rR, centerY - rR, rR * 2, rR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); };
  }, [props.viewport.width, props.viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}