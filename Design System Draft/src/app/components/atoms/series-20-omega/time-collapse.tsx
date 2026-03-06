/**
 * ATOM 193: THE TIME COLLAPSE ENGINE · Series 20 · Position 3
 * Collapse future anxiety and past regret into the only place
 * where power exists: Now. Hold to collapse timelines into dense sphere.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

interface TimeFragment { x: number; y: number; label: string; side: number; }

export default function TimeCollapseAtom({
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
    holding: false, collapseProgress: 0, holdStarted: false, completionFired: false,
    fragments: [] as TimeFragment[], inited: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const s = stateRef.current;
    if (!s.inited) {
      const pastLabels = ['Regret', 'Shame', 'If only', 'Lost time'];
      const futureLabels = ['What if', 'Worry', 'Not ready', 'Too late'];
      for (let i = 0; i < 4; i++) {
        s.fragments.push({ x: -0.15 - i * 0.06, y: (Math.random() - 0.5) * 0.15, label: pastLabels[i], side: -1 });
        s.fragments.push({ x: 0.15 + i * 0.06, y: (Math.random() - 0.5) * 0.15, label: futureLabels[i], side: 1 });
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
      const pastC: RGB = lerpColor(accentC, [100, 100, 160], 0.4);
      const futureC: RGB = lerpColor(accentC, [160, 100, 100], 0.4);
      const nowC: RGB = lerpColor(accentC, [255, 220, 120], 0.3);

      if (s.holding) s.collapseProgress = Math.min(1, s.collapseProgress + 0.008 * ms + (p.reducedMotion ? 0.008 : 0));
      const cp = easeOutCubic(s.collapseProgress);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Timeline axis
      const lineLen = minDim * 0.3 * (1 - cp);
      ctx.beginPath(); ctx.moveTo(cx - lineLen, cy); ctx.lineTo(cx + lineLen, cy);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * (1 - cp) * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();

      // Time fragments collapsing inward
      for (const frag of s.fragments) {
        const fx = cx + frag.x * minDim * (1 - cp);
        const fy = cy + frag.y * minDim * (1 - cp);
        const colr = frag.side < 0 ? pastC : futureC;
        const alpha = ELEMENT_ALPHA.primary.max * (1 - cp * 0.8) * entrance;
        const r = minDim * 0.008 * (1 - cp * 0.5);
        ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(colr, alpha); ctx.fill();
        if (cp < 0.5) {
          const lfs = minDim * 0.007 * (1 - cp * 2);
          ctx.font = `${lfs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
          ctx.fillStyle = rgba(colr, ELEMENT_ALPHA.text.min * (1 - cp * 2) * entrance);
          ctx.fillText(frag.label, fx, fy - r - minDim * 0.005);
        }
      }

      // Central NOW sphere — grows with collapse
      const nowR = minDim * (0.01 + cp * 0.06);
      const nGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nowR * 2);
      nGrad.addColorStop(0, rgba(nowC, ELEMENT_ALPHA.glow.max * (1 + cp) * entrance));
      nGrad.addColorStop(1, rgba(nowC, 0));
      ctx.fillStyle = nGrad; ctx.fillRect(cx - nowR * 2, cy - nowR * 2, nowR * 4, nowR * 4);
      ctx.beginPath(); ctx.arc(cx, cy, nowR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(nowC, EMPHASIS_ALPHA.focal.max * cp * entrance); ctx.fill();

      // Heartbeat pulse at completion
      if (cp > 0.8) {
        const pulse = Math.sin(s.frameCount * 0.08 * ms) * 0.5 + 0.5;
        const pR = nowR * (1 + pulse * 0.3 * ms);
        ctx.beginPath(); ctx.arc(cx, cy, pR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(nowC, ELEMENT_ALPHA.primary.max * pulse * entrance);
        ctx.lineWidth = minDim * 0.001; ctx.stroke();
      }

      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (cp < 0.95) ctx.fillText('Hold to collapse into Now', cx, h - minDim * 0.04);
      else ctx.fillText('Now.', cx, h - minDim * 0.04);

      if (cp >= 0.95 && !s.completionFired) { s.completionFired = true; cb.onHaptic('seal_stamp'); cb.onResolve?.(); }
      cb.onStateChange?.(s.collapseProgress);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => { stateRef.current.holding = true; if (!stateRef.current.holdStarted) { stateRef.current.holdStarted = true; cbRef.current.onHaptic('hold_start'); } };
    const onUp = () => { stateRef.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
