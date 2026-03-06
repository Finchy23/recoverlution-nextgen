/**
 * ATOM 177: THE COURAGE MAP ENGINE · Series 18 · Position 7
 * Dark patches with beacons. Tap/drag to light waypoints.
 * Each beacon flares with warm permanent light.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Beacon { x: number; y: number; anim: number; lit: boolean; }

export default function CourageMapAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    beacons: [] as Beacon[], inited: false, litCount: 0, completionFired: false,
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
      const positions = [
        { x: cx0 - minDim0 * 0.12, y: cy0 - minDim0 * 0.08 },
        { x: cx0 + minDim0 * 0.08, y: cy0 - minDim0 * 0.1 },
        { x: cx0 - minDim0 * 0.05, y: cy0 + minDim0 * 0.06 },
        { x: cx0 + minDim0 * 0.14, y: cy0 + minDim0 * 0.04 },
        { x: cx0, y: cy0 - minDim0 * 0.02 },
      ];
      s.beacons = positions.map(p => ({ x: p.x, y: p.y, anim: 0, lit: false }));
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
      const warmC: RGB = lerpColor(accentC, [240, 200, 100], 0.3);
      const darkC: RGB = lerpColor(baseC, [30, 30, 40], 0.5);

      for (const b of s.beacons) if (b.lit) b.anim = Math.min(1, b.anim + 0.03);

      // Background — darker
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(darkC, ELEMENT_ALPHA.glow.max * 0.5 * entrance));
      bgGrad.addColorStop(1, rgba(darkC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Dark patches
      for (let i = 0; i < 4; i++) {
        const dpx = cx + Math.sin(i * 2.5) * minDim * 0.12;
        const dpy = cy + Math.cos(i * 1.8) * minDim * 0.08;
        const dGrad = ctx.createRadialGradient(dpx, dpy, 0, dpx, dpy, minDim * 0.08);
        dGrad.addColorStop(0, rgba(darkC, ELEMENT_ALPHA.primary.max * 0.5 * entrance));
        dGrad.addColorStop(1, rgba(darkC, 0));
        ctx.fillStyle = dGrad;
        ctx.fillRect(dpx - minDim * 0.08, dpy - minDim * 0.08, minDim * 0.16, minDim * 0.16);
      }

      // Path lines between beacons
      ctx.beginPath();
      for (let i = 0; i < s.beacons.length; i++) {
        const b = s.beacons[i];
        if (i === 0) ctx.moveTo(b.x, b.y); else ctx.lineTo(b.x, b.y);
      }
      ctx.setLineDash([minDim * 0.005, minDim * 0.005]);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
      ctx.lineWidth = minDim * 0.0006; ctx.stroke();
      ctx.setLineDash([]);

      // Beacons
      for (const b of s.beacons) {
        const ba = easeOutCubic(b.anim);
        const r = minDim * 0.008;
        if (b.lit) {
          // Warm glow
          const gR = minDim * 0.04 * ba;
          const bGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, gR);
          bGrad.addColorStop(0, rgba(warmC, EMPHASIS_ALPHA.focal.min * ba * entrance));
          bGrad.addColorStop(1, rgba(warmC, 0));
          ctx.fillStyle = bGrad;
          ctx.fillRect(b.x - gR, b.y - gR, gR * 2, gR * 2);
          ctx.beginPath(); ctx.arc(b.x, b.y, r * (1 + ba * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = rgba(warmC, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
          ctx.lineWidth = minDim * 0.0008; ctx.stroke();
        }
      }

      s.litCount = s.beacons.filter(b => b.lit).length;
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.litCount < s.beacons.length) ctx.fillText(`Light beacons (${s.litCount}/${s.beacons.length})`, cx, cy + minDim * 0.2);
      else ctx.fillText('Path illuminated.', cx, cy + minDim * 0.2);

      if (s.litCount >= s.beacons.length && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(s.litCount / s.beacons.length);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      for (const b of stateRef.current.beacons) {
        if (b.lit) continue;
        if (Math.sqrt((px - b.x) ** 2 + (py - b.y) ** 2) < minDim2 * 0.03) {
          b.lit = true; cbRef.current.onHaptic('tap'); break;
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}