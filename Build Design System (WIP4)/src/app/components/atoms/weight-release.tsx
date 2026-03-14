/**
 * ATOM: WEIGHT-RELEASE — Setting It Down
 * Approach: Perceptual thought — feel the weight, then the relief
 *
 * Heavy dark particles coalesce into a dense mass in the upper center.
 * Touch and drag downward. The mass stretches like gravity, resists.
 * Past a threshold (~60%), it releases — particles burst upward
 * as luminous specks. Weight becomes lightness.
 *
 * INTERACTION: Drag (weight transfer)
 * RESOLVE: Mass dragged past the release threshold
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance, drawAtmosphere,
  pointerToCanvas, clamp,
} from './atom-utils';

const HEAVY_COUNT = 60;
const RELEASE_THRESHOLD = 0.62;     // fraction of screen height
const MASS_CENTER_Y = 0.28;         // starting position
const STRETCH_RESISTANCE = 0.4;     // how much it resists dragging

interface HeavyParticle {
  ox: number; oy: number;           // offset from mass center
  x: number; y: number;
  size: number;
  brightness: number;
  phase: number;
  released: boolean;
  releaseVx: number;
  releaseVy: number;
  releaseAlpha: number;
}

function createHeavyParticles(w: number, h: number): HeavyParticle[] {
  const minDim = Math.min(w, h);
  const spread = minDim * 0.08;
  return Array.from({ length: HEAVY_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * spread * Math.sqrt(Math.random()); // clustered
    return {
      ox: Math.cos(angle) * dist,
      oy: Math.sin(angle) * dist * 0.7,
      x: 0, y: 0,
      size: 1.2 + Math.random() * 2.5,
      brightness: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      released: false,
      releaseVx: 0, releaseVy: 0,
      releaseAlpha: 1,
    };
  });
}

export default function WeightReleaseAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    particles: [] as HeavyParticle[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    // Drag state
    dragging: false,
    massY: 0,              // current mass center Y (0-1 fraction)
    massTargetY: MASS_CENTER_Y,
    // Release
    released: false,
    releaseProgress: 0,
    resolved: false,
    resolveGlow: 0,
    initialized: false,
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

    if (!s.initialized) { s.particles = createHeavyParticles(w, h); s.massY = MASS_CENTER_Y; s.initialized = true; }

    let dragStartY = 0;
    let massStartY = 0;

    const onDown = (e: PointerEvent) => {
      if (s.released) return;
      const pt = pointerToCanvas(e, canvas, w, h);
      const massPxY = s.massY * h;
      const dist = Math.abs(pt.y - massPxY);
      if (dist < minDim * 0.2) {
        s.dragging = true;
        dragStartY = pt.y;
        massStartY = s.massY;
        cbRef.current.onHaptic('hold_start');
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = 'grabbing';
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const pt = pointerToCanvas(e, canvas, w, h);
      const dy = (pt.y - dragStartY) / h;
      // Only allow dragging downward, with resistance
      const effectiveDy = dy > 0 ? dy * STRETCH_RESISTANCE : dy * 0.1;
      s.massTargetY = clamp(massStartY + effectiveDy, MASS_CENTER_Y, 0.85);
    };

    const onUp = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = 'grab';

      if (s.massY >= RELEASE_THRESHOLD && !s.released) {
        // RELEASE!
        s.released = true;
        cbRef.current.onHaptic('hold_release');
        // Set release velocities for each particle
        for (const pt of s.particles) {
          pt.released = true;
          pt.releaseVx = (Math.random() - 0.5) * 3;
          pt.releaseVy = -(2 + Math.random() * 4); // burst upward
          pt.releaseAlpha = 1;
        }
      } else {
        // Snap back
        s.massTargetY = MASS_CENTER_Y;
      }
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

      // Atmosphere
      drawAtmosphere(ctx, cx, h * 0.4, w, h, minDim, s.primaryRgb, entrance);

      // ── Ease mass position ──
      s.massY += (s.massTargetY - s.massY) * (s.dragging ? 0.15 : 0.04);
      const massPxY = s.massY * h;

      // ── Drag progress ──
      const dragFrac = clamp((s.massY - MASS_CENTER_Y) / (RELEASE_THRESHOLD - MASS_CENTER_Y), 0, 1);
      cb.onStateChange?.(s.released ? 1 : dragFrac);

      // ── Stretch line (while dragging) ──
      if (!s.released && dragFrac > 0.05) {
        const stretchAlpha = dragFrac * 0.06 * entrance;
        ctx.beginPath();
        ctx.moveTo(cx, h * MASS_CENTER_Y);
        ctx.quadraticCurveTo(cx + Math.sin(s.frameCount * 0.02) * 5, massPxY * 0.7, cx, massPxY);
        ctx.strokeStyle = rgba(s.primaryRgb, stretchAlpha);
        ctx.lineWidth = 2 - dragFrac;
        ctx.stroke();
      }

      // ── Particles ──
      for (const pt of s.particles) {
        if (pt.released) {
          // Float upward, becoming luminous
          if (!p.reducedMotion) {
            pt.releaseVy += 0.01; // slight deceleration
            pt.x += pt.releaseVx;
            pt.y += pt.releaseVy;
            pt.releaseVx *= 0.99;
          }
          // Alpha decay is state, not animation — always runs
          pt.releaseAlpha *= 0.993;

          const pColor = lerpColor(s.primaryRgb, s.accentRgb, clamp(1 - pt.releaseAlpha, 0, 1));
          const alpha = pt.releaseAlpha * pt.brightness * entrance * 0.5;

          if (alpha > 0.005) {
            // Luminous glow
            const glowR = pt.size * 6 * (1 + (1 - pt.releaseAlpha) * 2);
            const gGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
            gGrad.addColorStop(0, rgba(pColor, alpha * 0.25));
            gGrad.addColorStop(0.3, rgba(s.accentRgb, alpha * 0.08));
            gGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gGrad;
            ctx.fillRect(pt.x - glowR, pt.y - glowR, glowR * 2, glowR * 2);

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size * (0.5 + (1 - pt.releaseAlpha) * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = rgba(s.accentRgb, alpha * 0.6);
            ctx.fill();
          }
        } else {
          // Heavy mass — particles cluster around mass center
          const breathWobble = p.reducedMotion ? 0 : Math.sin(s.frameCount * 0.012 + pt.phase) * 1.5;
          pt.x = cx + pt.ox + breathWobble;
          pt.y = massPxY + pt.oy + breathWobble * 0.5;

          const pColor = lerpColor(s.primaryRgb, [30, 25, 20] as RGB, 0.3);
          const alpha = pt.brightness * entrance * 0.4;

          // Heavy glow
          const glowR = pt.size * 3;
          const gGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
          gGrad.addColorStop(0, rgba(pColor, alpha * 0.2));
          gGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = gGrad;
          ctx.fillRect(pt.x - glowR, pt.y - glowR, glowR * 2, glowR * 2);

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba(pColor, alpha);
          ctx.fill();
        }
      }

      // ── Resolution ──
      if (s.released && !s.resolved) {
        s.releaseProgress += 0.008;
        if (s.releaseProgress > 0.6) {
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.006);
        const glowR = minDim * 0.35;
        const rGrad = ctx.createRadialGradient(cx, h * 0.4, 0, cx, h * 0.4, glowR);
        rGrad.addColorStop(0, rgba(s.accentRgb, s.resolveGlow * 0.04 * entrance));
        rGrad.addColorStop(0.6, rgba(s.accentRgb, s.resolveGlow * 0.01 * entrance));
        rGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rGrad;
        ctx.fillRect(cx - glowR, h * 0.4 - glowR, glowR * 2, glowR * 2);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}