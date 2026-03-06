/**
 * ATOM 178: THE ABUNDANCE SCAN ENGINE · Series 18 · Position 8
 * A dark room. Drag a spotlight to reveal hidden resource nodes.
 * Dark room becomes a treasure vault.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Resource { x: number; y: number; revealed: boolean; anim: number; label: string; }

const LABELS = ['Resilience', 'Knowledge', 'Network', 'Health', 'Time', 'Creativity'];

export default function AbundanceScanAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    spotX: 0.5, spotY: 0.5, resources: [] as Resource[], inited: false,
    revealedCount: 0, completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const s = stateRef.current;
    if (!s.inited) {
      const minDim0 = Math.min(viewport.width, viewport.height);
      const cx0 = viewport.width / 2; const cy0 = viewport.height / 2;
      const angles = [0, 1, 2, 3, 4, 5].map(i => (i / 6) * Math.PI * 2);
      s.resources = angles.map((a, i) => ({
        x: cx0 + Math.cos(a) * minDim0 * (0.08 + Math.random() * 0.06),
        y: cy0 + Math.sin(a) * minDim0 * (0.06 + Math.random() * 0.05),
        revealed: false, anim: 0, label: LABELS[i],
      }));
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
      const spotC: RGB = lerpColor(accentC, [255, 240, 180], 0.3);
      const nodeC: RGB = lerpColor(accentC, [180, 200, 120], 0.3);

      for (const r of s.resources) if (r.revealed) r.anim = Math.min(1, r.anim + 0.03);

      // Background — dark
      ctx.fillStyle = rgba(lerpColor(baseC, [15, 15, 20] as RGB, 0.85), 0.02 * entrance);
      ctx.fillRect(0, 0, w, h);

      // Spotlight
      const sx = s.spotX * w; const sy = s.spotY * h;
      const spotR = minDim * 0.08;
      const sGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, spotR);
      sGrad.addColorStop(0, rgba(spotC, EMPHASIS_ALPHA.focal.min * entrance));
      sGrad.addColorStop(0.6, rgba(spotC, ELEMENT_ALPHA.glow.max * entrance));
      sGrad.addColorStop(1, rgba(spotC, 0));
      ctx.fillStyle = sGrad; ctx.fillRect(0, 0, w, h);

      // Check proximity for reveals
      for (const r of s.resources) {
        if (r.revealed) continue;
        const dist = Math.sqrt((sx - r.x) ** 2 + (sy - r.y) ** 2);
        if (dist < spotR * 0.7) { r.revealed = true; s.revealedCount++; cb.onHaptic('drag_snap'); }
      }

      // Resources
      for (const r of s.resources) {
        if (!r.revealed) continue;
        const ra = easeOutCubic(r.anim);
        const nR = minDim * 0.01 * (1 + ra * 0.5);
        // Glow
        const nGrad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, minDim * 0.03 * ra);
        nGrad.addColorStop(0, rgba(nodeC, ELEMENT_ALPHA.glow.max * ra * 2 * entrance));
        nGrad.addColorStop(1, rgba(nodeC, 0));
        ctx.fillStyle = nGrad;
        ctx.fillRect(r.x - minDim * 0.03, r.y - minDim * 0.03, minDim * 0.06, minDim * 0.06);
        // Node
        ctx.beginPath(); ctx.arc(r.x, r.y, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(nodeC, ELEMENT_ALPHA.primary.max * (1 + ra) * entrance); ctx.fill();
        // Label
        const fs = Math.max(6, minDim * 0.009);
        ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(nodeC, ELEMENT_ALPHA.text.min * ra * entrance);
        ctx.fillText(r.label, r.x, r.y + minDim * 0.02);
      }

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.revealedCount < s.resources.length) ctx.fillText(`Drag spotlight (${s.revealedCount}/${s.resources.length})`, cx, h - minDim * 0.04);
      else ctx.fillText('Abundance revealed.', cx, h - minDim * 0.04);

      if (s.revealedCount >= s.resources.length && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.revealedCount / s.resources.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.spotX = (e.clientX - rect.left) / rect.width;
      stateRef.current.spotY = (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener('pointermove', onMove);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointermove', onMove); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'none' }} /></div>);
}