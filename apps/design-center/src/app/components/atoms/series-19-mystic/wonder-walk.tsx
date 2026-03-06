/**
 * ATOM 188: THE WONDER WALK ENGINE · Series 19 · Position 8
 * Curiosity cures anxiety. Drag through fog to reveal hidden
 * micro-interactions emerging from the unknown.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Discovery { x: number; y: number; type: number; revealed: boolean; anim: number; }

export default function WonderWalkAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    pointerX: 0.5, pointerY: 0.5, discoveries: [] as Discovery[],
    inited: false, revealedCount: 0,
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
      for (let i = 0; i < 8; i++) {
        s.discoveries.push({
          x: cx0 + (Math.random() - 0.5) * minDim0 * 0.3,
          y: cy0 + (Math.random() - 0.5) * minDim0 * 0.25,
          type: Math.floor(Math.random() * 4),
          revealed: false, anim: 0,
        });
      }
      s.inited = true;
    }

    const render = () => {
      const s = stateRef.current; const p = propsRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const fogC: RGB = lerpColor(accentC, [150, 155, 160], 0.5);
      const colors: RGB[] = [
        lerpColor(accentC, [240, 180, 100], 0.3),
        lerpColor(accentC, [100, 200, 180], 0.3),
        lerpColor(accentC, [180, 120, 220], 0.3),
        lerpColor(accentC, [220, 120, 140], 0.3),
      ];

      for (const d of s.discoveries) if (d.revealed) d.anim = Math.min(1, d.anim + 0.03);

      // Background fog
      ctx.fillStyle = rgba(fogC, 0.02 * entrance);
      ctx.fillRect(0, 0, w, h);

      // Fog layers
      for (let i = 0; i < 6; i++) {
        const fx = cx + Math.sin(s.frameCount * 0.005 * ms + i * 1.3) * minDim * 0.15;
        const fy = cy + Math.cos(s.frameCount * 0.004 * ms + i * 0.9) * minDim * 0.1;
        const fR = minDim * (0.08 + i * 0.02);
        const fGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, fR);
        fGrad.addColorStop(0, rgba(fogC, ELEMENT_ALPHA.glow.max * 0.5 * entrance));
        fGrad.addColorStop(1, rgba(fogC, 0));
        ctx.fillStyle = fGrad; ctx.fillRect(fx - fR, fy - fR, fR * 2, fR * 2);
      }

      // Clearance around pointer
      const px = s.pointerX * w; const py = s.pointerY * h;
      const clearR = minDim * 0.06;

      // Check reveals
      for (const d of s.discoveries) {
        if (d.revealed) continue;
        if (Math.sqrt((px - d.x) ** 2 + (py - d.y) ** 2) < clearR) {
          d.revealed = true; s.revealedCount++;
          cbRef.current.onHaptic('drag_snap');
        }
      }

      // Discoveries
      for (const d of s.discoveries) {
        if (!d.revealed) continue;
        const da = easeOutCubic(d.anim);
        const colr = colors[d.type];
        const dR = minDim * 0.012 * da;
        // Glow
        const dGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, dR * 3);
        dGrad.addColorStop(0, rgba(colr, ELEMENT_ALPHA.glow.max * da * 2 * entrance));
        dGrad.addColorStop(1, rgba(colr, 0));
        ctx.fillStyle = dGrad; ctx.fillRect(d.x - dR * 3, d.y - dR * 3, dR * 6, dR * 6);
        // Shape
        if (d.type === 0) { ctx.beginPath(); ctx.arc(d.x, d.y, dR, 0, Math.PI * 2); ctx.fillStyle = rgba(colr, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill(); }
        else if (d.type === 1) { ctx.fillStyle = rgba(colr, EMPHASIS_ALPHA.focal.max * entrance); ctx.fillRect(d.x - dR, d.y - dR, dR * 2, dR * 2); }
        else if (d.type === 2) { ctx.beginPath(); ctx.moveTo(d.x, d.y - dR); ctx.lineTo(d.x + dR, d.y + dR); ctx.lineTo(d.x - dR, d.y + dR); ctx.closePath(); ctx.fillStyle = rgba(colr, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill(); }
        else { ctx.beginPath(); for (let j = 0; j < 5; j++) { const a = (j / 5) * Math.PI * 2 - Math.PI / 2; ctx.lineTo(d.x + Math.cos(a) * dR, d.y + Math.sin(a) * dR); } ctx.closePath(); ctx.fillStyle = rgba(colr, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill(); }
      }

      // Pointer light
      const pGrad = ctx.createRadialGradient(px, py, 0, px, py, clearR);
      pGrad.addColorStop(0, rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), ELEMENT_ALPHA.glow.max * entrance));
      pGrad.addColorStop(1, rgba(lerpColor(baseC, [255, 255, 255] as RGB, 0.85), 0));
      ctx.fillStyle = pGrad; ctx.fillRect(px - clearR, py - clearR, clearR * 2, clearR * 2);

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText(`Explore the fog (${s.revealedCount}/${s.discoveries.length})`, cx, h - minDim * 0.04);

      cbRef.current.onStateChange?.(s.revealedCount / s.discoveries.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointerX = (e.clientX - rect.left) / rect.width;
      stateRef.current.pointerY = (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener('pointermove', onMove);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointermove', onMove); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'none' }} /></div>);
}