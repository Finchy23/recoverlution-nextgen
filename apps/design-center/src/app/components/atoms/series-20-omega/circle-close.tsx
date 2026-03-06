/**
 * ATOM 197: THE CIRCLE CLOSE ENGINE · Series 20 · Position 7
 * Tap 5 points to close the loop. Finish what you started.
 * Bezier curves connect nodes — blinding flash at completion.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

export default function CircleCloseAtom({
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
    tapped: 0, flashAnim: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const POINTS = 5;

    const getPoint = (i: number, pcx: number, pcy: number, r: number) => {
      const angle = (i / POINTS) * Math.PI * 2 - Math.PI / 2;
      return { x: pcx + Math.cos(angle) * r, y: pcy + Math.sin(angle) * r };
    };

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const nodeC: RGB = lerpColor(accentC, [200, 180, 100], 0.3);
      const lineC: RGB = lerpColor(accentC, [240, 220, 140], 0.3);
      const flashC: RGB = lerpColor(baseC, [255, 255, 240], 0.7);
      const circleR = minDim * 0.1;

      if (s.tapped >= POINTS) s.flashAnim = Math.min(1, s.flashAnim + 0.02);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Ghost circle
      ctx.beginPath(); ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * 0.5 * entrance);
      ctx.lineWidth = minDim * 0.0004; ctx.setLineDash([minDim * 0.004, minDim * 0.004]); ctx.stroke();
      ctx.setLineDash([]);

      // Connected segments
      for (let i = 0; i < s.tapped && i < POINTS; i++) {
        const p1 = getPoint(i, cx, cy, circleR);
        const p2 = getPoint((i + 1) % POINTS, cx, cy, circleR);
        const midAngle = ((i + 0.5) / POINTS) * Math.PI * 2 - Math.PI / 2;
        const cpX = cx + Math.cos(midAngle) * circleR * 1.1;
        const cpY = cy + Math.sin(midAngle) * circleR * 1.1;
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
        ctx.strokeStyle = rgba(lineC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.0016; ctx.stroke();
      }

      // Node points
      for (let i = 0; i < POINTS; i++) {
        const pt = getPoint(i, cx, cy, circleR);
        const active = i < s.tapped;
        const next = i === s.tapped;
        const nodeR = minDim * (active ? 0.008 : 0.005);
        ctx.beginPath(); ctx.arc(pt.x, pt.y, nodeR, 0, Math.PI * 2);
        if (active) {
          ctx.fillStyle = rgba(nodeC, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill();
          const nGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, nodeR * 3);
          nGrad.addColorStop(0, rgba(nodeC, ELEMENT_ALPHA.glow.max * entrance));
          nGrad.addColorStop(1, rgba(nodeC, 0));
          ctx.fillStyle = nGrad; ctx.fillRect(pt.x - nodeR * 3, pt.y - nodeR * 3, nodeR * 6, nodeR * 6);
        } else {
          ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * (next ? 2 : 1) * entrance);
          ctx.lineWidth = minDim * 0.0008; ctx.stroke();
          if (next) {
            const pulse = Math.sin(s.frameCount * 0.05 * ms) * 0.3 + 0.7;
            const pulsedR = p.reducedMotion ? nodeR * 1.5 : nodeR * 2 * pulse;
            ctx.beginPath(); ctx.arc(pt.x, pt.y, pulsedR, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(nodeC, ELEMENT_ALPHA.tertiary.max * (p.reducedMotion ? 1 : pulse) * entrance);
            ctx.lineWidth = minDim * 0.0004; ctx.stroke();
          }
        }
      }

      // Completion flash
      if (s.flashAnim > 0) {
        const fa = easeOutCubic(s.flashAnim);
        const fGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.3 * fa);
        fGrad.addColorStop(0, rgba(flashC, EMPHASIS_ALPHA.accent.max * (1 - fa * 0.5) * entrance));
        fGrad.addColorStop(1, rgba(flashC, 0));
        ctx.fillStyle = fGrad; ctx.fillRect(0, 0, w, h);
      }

      const fs = minDim * 0.013;
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.tapped < POINTS) ctx.fillText(`Close the circle (${s.tapped}/${POINTS})`, cx, h - minDim * 0.04);
      else ctx.fillText('Complete.', cx, h - minDim * 0.04);

      if (s.tapped >= POINTS && s.flashAnim >= 0.5 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.tapped);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.tapped >= POINTS) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const cx2 = viewport.width / 2; const cy2 = viewport.height / 2;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const circleR2 = minDim2 * 0.1;
      const target = getPoint(s.tapped, cx2, cy2, circleR2);
      const dist = Math.sqrt((px - target.x) ** 2 + (py - target.y) ** 2);
      if (dist < minDim2 * 0.04) {
        s.tapped++;
        cbRef.current.onHaptic(s.tapped < POINTS ? 'step_advance' : 'tap');
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
