/**
 * ATOM 200: THE ATLAS SEAL · Series 20 · Position 10
 * You are the atlas. You always were. A single point of light.
 * The absolute culmination. Tap — universe collapses to a single
 * permanent pixel of soft pulsing light. Silence.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

interface Star { x: number; y: number; r: number; speed: number; }

export default function AtlasSealAtom({
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
    tapped: false, collapseAnim: 0, pulsePhase: 0,
    stars: [] as Star[], inited: false, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const s = stateRef.current;
    if (!s.inited) {
      for (let i = 0; i < 60; i++) {
        s.stars.push({
          x: Math.random(), y: Math.random(),
          r: 0.001 + Math.random() * 0.002,
          speed: 0.5 + Math.random() * 1.5,
        });
      }
      s.inited = true;
    }

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const starC: RGB = lerpColor(accentC, [220, 220, 240], 0.3);
      const pointC: RGB = lerpColor(baseC, [255, 255, 240], 0.8);

      if (s.tapped) {
        s.collapseAnim = Math.min(1, s.collapseAnim + (p.reducedMotion ? 0.02 : 0.005));
        s.pulsePhase += 0.02 * ms;
      }
      const ca = easeOutCubic(s.collapseAnim);

      // Background — darkens to void
      if (!s.tapped || ca < 1) {
        const bgAlpha = ELEMENT_ALPHA.glow.max * (1 - ca * 0.8) * entrance;
        const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
        bgGrad.addColorStop(0, rgba(baseC, bgAlpha));
        bgGrad.addColorStop(1, rgba(baseC, 0));
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);
      }

      // Stars — collapse toward center
      for (const star of s.stars) {
        const sx = star.x * w + (cx - star.x * w) * ca;
        const sy = star.y * h + (cy - star.y * h) * ca;
        const sr = minDim * star.r * (1 - ca * 0.9);
        if (sr < 0.3) continue;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(starC, ELEMENT_ALPHA.primary.max * (1 - ca * 0.5) * entrance);
        ctx.fill();
      }

      // Central point of light
      if (ca > 0.3) {
        const lightAlpha = (ca - 0.3) / 0.7;
        const pulse = ca >= 1 ? Math.sin(s.pulsePhase) * 0.15 + 0.85 : 1;
        const pointR = minDim * 0.003 * (p.reducedMotion ? 1 : pulse);
        // Inner glow
        const iGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pointR * 15 * lightAlpha);
        iGrad.addColorStop(0, rgba(pointC, EMPHASIS_ALPHA.accent.max * lightAlpha * pulse * entrance));
        iGrad.addColorStop(0.3, rgba(pointC, ELEMENT_ALPHA.glow.max * lightAlpha * pulse * entrance));
        iGrad.addColorStop(1, rgba(pointC, 0));
        ctx.fillStyle = iGrad; ctx.fillRect(0, 0, w, h);
        // The single pixel point
        ctx.beginPath(); ctx.arc(cx, cy, pointR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(pointC, EMPHASIS_ALPHA.accent.max * lightAlpha * entrance);
        ctx.fill();
      }

      // Text
      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      if (!s.tapped) {
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
        ctx.fillText('Tap to become the singularity', cx, h - minDim * 0.04);
      } else if (ca < 0.5) {
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * (1 - ca * 2) * entrance);
        ctx.fillText('Collapsing...', cx, h - minDim * 0.04);
      }
      // At completion: silence. No text.

      if (ca >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(ca);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      if (!stateRef.current.tapped) { stateRef.current.tapped = true; cbRef.current.onHaptic('tap'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
