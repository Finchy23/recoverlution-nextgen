/**
 * ATOM: DISSOLVE — The Boundary Question
 * Approach: Diffuse insight — boundaries soften, not shatter
 *
 * A sharp geometric ring in the center — a boundary.
 * Inside: warm color field. Outside: cool color field.
 * Hold the boundary and it begins to blur. Colors bleed.
 * The two regions merge into a unified gradient.
 * The boundary was always an illusion.
 *
 * INTERACTION: Hold (on the boundary edge)
 * RESOLVE: Boundary fully dissolved
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import {
  parseColor, lerpColor, rgba, type RGB,
  setupCanvas, advanceEntrance,
  pointerToCanvas, clamp,
} from './atom-utils';

const BOUNDARY_RADIUS_FRAC = 0.22;
const DISSOLVE_RATE = 0.003;
const DISSOLVE_PASSIVE = 0.0001;    // very slow passive dissolve
const PARTICLE_COUNT = 90;

interface BoundaryParticle {
  angle: number;          // on the boundary ring
  offset: number;         // radial offset from boundary (negative = inside)
  size: number;
  brightness: number;
  phase: number;
  drift: number;          // how far to drift when dissolved
}

function createParticles(): BoundaryParticle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    angle: Math.random() * Math.PI * 2,
    offset: (Math.random() - 0.5) * 0.1,
    size: 0.6 + Math.random() * 1.5,
    brightness: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    drift: (Math.random() - 0.5) * 0.3,
  }));
}

export default function DissolveAtom(props: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic: props.onHaptic, onStateChange: props.onStateChange, onResolve: props.onResolve });
  const propsRef = useRef({ breathAmplitude: props.breathAmplitude, reducedMotion: props.reducedMotion, phase: props.phase, color: props.color, accentColor: props.accentColor });
  const stateRef = useRef({
    particles: [] as BoundaryParticle[],
    primaryRgb: parseColor(props.color),
    accentRgb: parseColor(props.accentColor),
    entranceProgress: 0,
    frameCount: 0,
    holding: false,
    dissolveProgress: 0,     // 0 = sharp boundary, 1 = fully dissolved
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
    const cx = w / 2, cy = h / 2;
    const boundaryR = minDim * BOUNDARY_RADIUS_FRAC;

    if (!s.initialized) { s.particles = createParticles(); s.initialized = true; }

    const onDown = (e: PointerEvent) => {
      const pt = pointerToCanvas(e, canvas, w, h);
      const dist = Math.sqrt((pt.x - cx) ** 2 + (pt.y - cy) ** 2);
      // Must touch near the boundary
      if (Math.abs(dist - boundaryR) < minDim * 0.1) {
        s.holding = true;
        cbRef.current.onHaptic('hold_start');
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onUp = (e: PointerEvent) => { s.holding = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const warmInner: RGB = [180, 140, 100];
    const coolOuter: RGB = [80, 100, 160];

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      setupCanvas(canvas, ctx, w, h);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      // ── Dissolve progress ──
      if (s.holding) {
        s.dissolveProgress = Math.min(1, s.dissolveProgress + DISSOLVE_RATE + p.breathAmplitude * 0.002);
      } else {
        s.dissolveProgress = Math.min(1, s.dissolveProgress + DISSOLVE_PASSIVE);
      }
      cb.onStateChange?.(s.dissolveProgress);

      const d = s.dissolveProgress;
      const blurWidth = d * minDim * 0.15;   // boundary blur grows with dissolve
      const blendFrac = d;                    // color blending fraction

      // ── Inner field ──
      const innerColor = lerpColor(lerpColor(warmInner, s.primaryRgb, 0.3), lerpColor(coolOuter, s.accentRgb, 0.3), blendFrac * 0.5);
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, boundaryR + blurWidth);
      innerGrad.addColorStop(0, rgba(innerColor, 0.04 * entrance));
      innerGrad.addColorStop(0.7, rgba(innerColor, 0.025 * entrance));
      innerGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = innerGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Outer field ──
      const outerColor = lerpColor(lerpColor(coolOuter, s.accentRgb, 0.3), lerpColor(warmInner, s.primaryRgb, 0.3), blendFrac * 0.5);
      // Corners glow
      const cornerR = minDim * 0.5;
      for (const [ox, oy] of [[0, 0], [w, 0], [0, h], [w, h]]) {
        const oGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, cornerR);
        oGrad.addColorStop(0, rgba(outerColor, 0.02 * entrance * (1 - blendFrac * 0.5)));
        oGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = oGrad;
        ctx.fillRect(ox - cornerR, oy - cornerR, cornerR * 2, cornerR * 2);
      }

      // ── Boundary ring ──
      const ringAlpha = (1 - d) * 0.12 * entrance;
      if (ringAlpha > 0.002) {
        ctx.beginPath();
        ctx.arc(cx, cy, boundaryR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), ringAlpha);
        ctx.lineWidth = Math.max(0.3, 2 * (1 - d));
        ctx.stroke();

        // Boundary glow (fades with dissolve)
        if (d < 0.8) {
          const bGrad = ctx.createRadialGradient(cx, cy, boundaryR - blurWidth, cx, cy, boundaryR + blurWidth);
          bGrad.addColorStop(0, 'rgba(0,0,0,0)');
          bGrad.addColorStop(0.45, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), ringAlpha * 0.3));
          bGrad.addColorStop(0.55, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), ringAlpha * 0.3));
          bGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bGrad;
          ctx.fillRect(0, 0, w, h);
        }
      }

      // ─�� Boundary particles ──
      for (const pt of s.particles) {
        const effectiveOffset = pt.offset + pt.drift * d;
        const r = boundaryR * (1 + effectiveOffset);
        const wobble = p.reducedMotion ? 0 : Math.sin(s.frameCount * 0.008 + pt.phase) * d * 5;
        const px = cx + Math.cos(pt.angle + d * pt.drift * 0.5) * (r + wobble);
        const py = cy + Math.sin(pt.angle + d * pt.drift * 0.5) * (r + wobble);

        const isInside = (pt.offset + pt.drift * d) < 0;
        const pColor = isInside
          ? lerpColor(lerpColor(warmInner, s.primaryRgb, 0.4), outerColor, d * 0.5)
          : lerpColor(lerpColor(coolOuter, s.accentRgb, 0.4), innerColor, d * 0.5);

        const shimmer = p.reducedMotion ? 0.75 : 0.5 + 0.5 * Math.sin(s.frameCount * 0.015 + pt.phase);
        const alpha = pt.brightness * shimmer * entrance * (0.2 + d * 0.25);

        // Glow
        const glowR = pt.size * 4;
        const gGrad = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        gGrad.addColorStop(0, rgba(pColor, alpha * 0.2));
        gGrad.addColorStop(0.5, rgba(pColor, alpha * 0.05));
        gGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gGrad;
        ctx.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2);

        ctx.beginPath();
        ctx.arc(px, py, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, alpha * 0.5);
        ctx.fill();
      }

      // ── Resolution ──
      if (d > 0.92 && !s.resolved) {
        s.resolved = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      if (s.resolved) {
        s.resolveGlow = Math.min(1, s.resolveGlow + 0.005);
        const mergedColor = lerpColor(s.primaryRgb, s.accentRgb, 0.5);
        const rR = minDim * 0.3;
        const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rR);
        rGrad.addColorStop(0, rgba(mergedColor, s.resolveGlow * 0.04 * entrance));
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
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [props.viewport.width, props.viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}