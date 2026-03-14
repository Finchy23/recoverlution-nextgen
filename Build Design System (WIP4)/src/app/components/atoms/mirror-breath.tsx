/**
 * ATOM: MIRROR-BREATH — The Observer Paradox
 * Approach: Provoke thought — the reflection reveals
 *
 * Touch creates a point. The system mirrors it across center —
 * but with a delay and subtle transformation. The mirror isn't
 * perfect; it's slightly warped, slightly beautiful. Movement
 * creates mirrored trails. The delayed reflection reveals
 * something the user didn't consciously intend.
 *
 * INTERACTION: Hold (observe the mirror)
 * RESOLVE: Duration — mirror slowly clarifies
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance, drawAtmosphere,
  pointerToCanvas, clamp,
} from './atom-utils';

const TRAIL_LENGTH = 40;
const MIRROR_DELAY = 8;            // frames of delay
const WARP_DECAY = 0.996;          // warp slowly reduces over time

interface TrailPoint {
  x: number; y: number;
  alpha: number;
}

export default function MirrorBreathAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    // Touch state
    touching: false,
    touchX: 0, touchY: 0,
    // Trails
    userTrail: [] as TrailPoint[],
    mirrorTrail: [] as TrailPoint[],
    // Position history for delay
    posHistory: [] as { x: number; y: number }[],
    // Warp
    warpAmount: 1,
    resolved: false,
    resolveGlow: 0,
    // Ambient particles when not touching
    ambientAngle: 0,
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
    const cx = w / 2, cy = h / 2;

    const onDown = (e: PointerEvent) => {
      s.touching = true;
      const pt = pointerToCanvas(e, canvas, w, h);
      s.touchX = pt.x; s.touchY = pt.y;
      s.posHistory = [];
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!s.touching) return;
      const pt = pointerToCanvas(e, canvas, w, h);
      s.touchX = pt.x; s.touchY = pt.y;
    };
    const onUp = (e: PointerEvent) => {
      s.touching = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Warp decays over time (mirror clarifies)
      // Touching accelerates clarification — engagement reveals truth
      const decayRate = s.touching ? WARP_DECAY * 0.997 : WARP_DECAY;
      s.warpAmount *= decayRate;
      const clarity = 1 - s.warpAmount;
      cb.onStateChange?.(clarity);

      // ── Mirror axis (vertical center line, very faint) ──
      const axisAlpha = 0.015 * entrance;
      const axisGrad = ctx.createLinearGradient(0, 0, 0, h);
      axisGrad.addColorStop(0, 'rgba(0,0,0,0)');
      axisGrad.addColorStop(0.2, rgba(s.accentRgb, axisAlpha));
      axisGrad.addColorStop(0.5, rgba(s.accentRgb, axisAlpha * 1.5));
      axisGrad.addColorStop(0.8, rgba(s.accentRgb, axisAlpha));
      axisGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = axisGrad;
      ctx.fillRect(cx - 0.3, 0, 0.6, h);

      if (s.touching) {
        // Record position history
        s.posHistory.push({ x: s.touchX, y: s.touchY });
        if (s.posHistory.length > MIRROR_DELAY + 5) s.posHistory.shift();

        // User point
        s.userTrail.push({ x: s.touchX, y: s.touchY, alpha: 1 });
        if (s.userTrail.length > TRAIL_LENGTH) s.userTrail.shift();

        // Delayed mirror point (with warp)
        const delayIdx = Math.max(0, s.posHistory.length - MIRROR_DELAY);
        const delayed = s.posHistory[delayIdx] || { x: s.touchX, y: s.touchY };

        // Mirror across center with warp
        const mx = cx + (cx - delayed.x) * (1 + s.warpAmount * 0.15);
        const my = cy + (cy - delayed.y) * (1 - s.warpAmount * 0.08);
        // Add slight oscillating warp
        const warpX = mx + Math.sin(s.frameCount * 0.03) * s.warpAmount * 8;
        const warpY = my + Math.cos(s.frameCount * 0.025) * s.warpAmount * 5;

        s.mirrorTrail.push({ x: warpX, y: warpY, alpha: 1 });
        if (s.mirrorTrail.length > TRAIL_LENGTH) s.mirrorTrail.shift();
      }

      // ── Render user trail ──
      for (const t of s.userTrail) {
        t.alpha *= 0.94;
        if (t.alpha < 0.01) continue;
        const glowR = 6 + t.alpha * 4;
        const gGrad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, glowR);
        gGrad.addColorStop(0, rgba(s.primaryRgb, t.alpha * 0.2 * entrance));
        gGrad.addColorStop(0.4, rgba(s.primaryRgb, t.alpha * 0.05 * entrance));
        gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(t.x - glowR, t.y - glowR, glowR * 2, glowR * 2);

        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, t.alpha * 0.35 * entrance);
        ctx.fill();
      }

      // ── Render mirror trail ──
      for (const t of s.mirrorTrail) {
        t.alpha *= 0.94;
        if (t.alpha < 0.01) continue;
        const glowR = 6 + t.alpha * 4;
        const gGrad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, glowR);
        gGrad.addColorStop(0, rgba(s.accentRgb, t.alpha * 0.15 * entrance));
        gGrad.addColorStop(0.4, rgba(s.accentRgb, t.alpha * 0.04 * entrance));
        gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(t.x - glowR, t.y - glowR, glowR * 2, glowR * 2);

        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, t.alpha * 0.3 * entrance);
        ctx.fill();
      }

      // ── Ambient breathing when not touching ──
      if (!s.touching) {
        if (!p.reducedMotion) s.ambientAngle += 0.005;
        const breathR = minDim * 0.08 + p.breathAmplitude * minDim * 0.04;
        const ax1 = cx - breathR * Math.cos(s.ambientAngle);
        const ay1 = cy + breathR * Math.sin(s.ambientAngle * 0.7);
        const ax2 = cx + breathR * Math.cos(s.ambientAngle);
        const ay2 = cy - breathR * Math.sin(s.ambientAngle * 0.7);

        for (const [px, py, color] of [[ax1, ay1, s.primaryRgb], [ax2, ay2, s.accentRgb]] as [number, number, RGB][]) {
          const glowR = minDim * 0.04;
          const gGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
          gGrad.addColorStop(0, rgba(color, 0.08 * entrance));
          gGrad.addColorStop(0.5, rgba(color, 0.02 * entrance));
          gGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gGrad;
          ctx.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2);

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = rgba(color, 0.2 * entrance);
          ctx.fill();
        }
      }

      // ── Resolution ──
      if (clarity > 0.85 && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const rR = minDim * 0.3;
        const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rR);
        rGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), s.resolveGlow * 0.04 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(cx - rR, cy - rR, rR * 2, rR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [props.viewport.width, props.viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}