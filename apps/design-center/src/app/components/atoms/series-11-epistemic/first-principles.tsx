/**
 * ATOM 108: THE FIRST PRINCIPLES ENGINE
 * =======================================
 * Series 11 — Epistemic Constructs · Position 8
 *
 * Hold to trigger a seismic earthquake. Fragile assumptions
 * shatter and fall away. Only one unshakeable monolith survives.
 *
 * PHYSICS: Geological excavation, seismic sorting, absolute rigidity
 * INTERACTION: Hold button to trigger earthquake
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA,
  EMPHASIS_ALPHA,
  motionScale,
  type RGB,
} from '../atom-utils';

const FRAGMENTS = [
  'They think I\'m weak',
  'It has to be perfect',
  'I should know by now',
  'Everyone is watching',
  'I can\'t handle this',
  'It\'s too late',
];

interface Fragment {
  label: string;
  x: number; y: number; w: number; h: number;
  shattered: boolean;
  fallVy: number; fallRotation: number;
  alpha: number;
}

export default function FirstPrinciplesAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false,
    quakeProgress: 0, // 0→1: how much earthquake has happened
    fragments: null as Fragment[] | null,
    monolithGlow: 0,
    completionFired: false,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    // Initialize fragments on first run
    const initFragments = () => {
      const minDim = Math.min(viewport.width, viewport.height);
      const cx2 = viewport.width / 2;
      const cy2 = viewport.height / 2;
      return FRAGMENTS.map((label, i) => {
        const angle = (i / FRAGMENTS.length) * Math.PI * 2;
        const dist = minDim * (0.1 + Math.random() * 0.12);
        return {
          label,
          x: cx2 + Math.cos(angle) * dist,
          y: cy2 + Math.sin(angle) * dist - minDim * 0.05,
          w: minDim * (0.15 + Math.random() * 0.05),
          h: minDim * 0.04,
          shattered: false,
          fallVy: 0,
          fallRotation: 0,
          alpha: 1,
        };
      });
    };

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;

      if (!s.fragments) s.fragments = initFragments();

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;

      // Quake progression
      if (s.holding && s.quakeProgress < 1) {
        s.quakeProgress = Math.min(1, s.quakeProgress + 0.006);

        // Shatter fragments progressively
        const shatterThreshold = s.quakeProgress * FRAGMENTS.length;
        for (let i = 0; i < s.fragments.length; i++) {
          if (!s.fragments[i].shattered && i < shatterThreshold) {
            s.fragments[i].shattered = true;
            s.fragments[i].fallVy = minDim * 0.002;
            cb.onHaptic('step_advance');
          }
        }
      }

      // Screen shake
      const shakeIntensity = s.holding && s.quakeProgress < 1
        ? minDim * 0.004 * Math.min(1, s.quakeProgress * 2)
        : 0;
      const shakeX = !p.reducedMotion ? (Math.random() - 0.5) * shakeIntensity : 0;
      const shakeY = !p.reducedMotion ? (Math.random() - 0.5) * shakeIntensity : 0;

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Background glow
      const glowR = minDim * (0.35 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(-10, -10, w + 20, h + 20);

      // Draw fragments
      const fontSize = Math.max(7, minDim * 0.013);
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (const f of s.fragments) {
        if (f.shattered && !p.reducedMotion) {
          f.fallVy += minDim * 0.0002;
          f.y += f.fallVy;
          f.fallRotation += 0.02;
          f.alpha = Math.max(0, f.alpha - 0.01);
        }
        if (f.alpha <= 0) continue;

        const fragAlpha = f.alpha * ELEMENT_ALPHA.primary.max * entrance;
        ctx.save();
        ctx.translate(f.x, f.y);
        if (f.shattered) ctx.rotate(f.fallRotation);

        ctx.fillStyle = rgba(baseC, fragAlpha);
        ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
        ctx.strokeStyle = rgba(baseC, fragAlpha * 0.5);
        ctx.lineWidth = minDim * 0.0004;
        ctx.strokeRect(-f.w / 2, -f.h / 2, f.w, f.h);

        ctx.fillStyle = rgba(baseC, f.alpha * ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText(f.label, 0, 0);

        ctx.restore();
      }

      // Monolith (always present, glows as fragments clear)
      const allShattered = s.fragments.every(f => f.shattered);
      if (allShattered) s.monolithGlow = Math.min(1, s.monolithGlow + 0.02);

      const monolithW = minDim * 0.08;
      const monolithH = minDim * 0.1;
      const monoGlow = easeOutCubic(s.monolithGlow);
      const monoAlpha = (ELEMENT_ALPHA.primary.min + monoGlow * EMPHASIS_ALPHA.focal.max) * entrance;
      const monoColor = lerpColor(baseC, accentC, monoGlow);

      // Monolith glow
      if (monoGlow > 0) {
        const mgR = minDim * 0.12 * monoGlow;
        const mgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, mgR);
        mgGrad.addColorStop(0, rgba(monoColor, EMPHASIS_ALPHA.focal.min * entrance * monoGlow));
        mgGrad.addColorStop(1, rgba(monoColor, 0));
        ctx.fillStyle = mgGrad;
        ctx.fillRect(cx - mgR, cy - mgR, mgR * 2, mgR * 2);
      }

      ctx.fillStyle = rgba(monoColor, monoAlpha);
      ctx.fillRect(cx - monolithW / 2, cy - monolithH / 2, monolithW, monolithH);

      if (monoGlow > 0.5) {
        const tf = Math.max(7, minDim * 0.012);
        ctx.font = `600 ${tf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(monoColor, ELEMENT_ALPHA.text.max * entrance * (monoGlow - 0.5) * 2);
        ctx.fillText('THE TRUTH', cx, cy);
      }

      ctx.restore(); // undo shake

      // Hold prompt
      if (s.quakeProgress < 0.01) {
        const pf = Math.max(8, minDim * 0.014);
        ctx.font = `${pf}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance * (0.5 + Math.sin(s.frameCount * 0.03 * ms) * 0.3));
        ctx.fillText('Hold to shake', cx, cy + minDim * 0.22);
      }

      // Completion
      if (s.monolithGlow >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.quakeProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}