/**
 * ATOM 136: THE SOCIAL BATTERY ENGINE · Series 14 · Position 6
 * Your glowing node connected to 5 others via tubes. Golden liquid
 * drains out. Swipe to sever tethers and refill.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const TETHER_COUNT = 5;

export default function SocialBatteryAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    tethers: new Array(TETHER_COUNT).fill(true) as boolean[],
    energy: 0.3, refillAnim: 0,
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const goldC: RGB = lerpColor(accentC, [255, 210, 80], 0.4);

      // Drain energy through active tethers
      const activeTethers = s.tethers.filter(Boolean).length;
      if (activeTethers > 0 && !p.reducedMotion) s.energy = Math.max(0.05, s.energy - 0.0005 * activeTethers);

      // Refill when all severed
      if (activeTethers === 0) {
        s.energy = Math.min(1, s.energy + 0.003);
        s.refillAnim = Math.min(1, s.refillAnim + 0.01);
      }

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // User node (brightness = energy)
      const nodeR = minDim * 0.03;
      const nodeGlowR = nodeR * (2 + s.energy * 2);
      const nGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeGlowR);
      nGrad.addColorStop(0, rgba(goldC, ELEMENT_ALPHA.primary.max * s.energy * 2 * entrance));
      nGrad.addColorStop(1, rgba(goldC, 0));
      ctx.fillStyle = nGrad;
      ctx.fillRect(cx - nodeGlowR, cy - nodeGlowR, nodeGlowR * 2, nodeGlowR * 2);
      ctx.beginPath(); ctx.arc(cx, cy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(goldC, ELEMENT_ALPHA.primary.max * (0.5 + s.energy * 1.5) * entrance);
      ctx.fill();

      // Tethered nodes
      for (let i = 0; i < TETHER_COUNT; i++) {
        const angle = (i / TETHER_COUNT) * Math.PI * 2 - Math.PI / 2;
        const dist = minDim * 0.18;
        const nx = cx + Math.cos(angle) * dist;
        const ny = cy + Math.sin(angle) * dist;

        if (s.tethers[i]) {
          // Tether line
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
          ctx.strokeStyle = rgba(goldC, ELEMENT_ALPHA.primary.max * entrance);
          ctx.lineWidth = minDim * 0.002; ctx.stroke();

          // Flow particles along tether
          if (!p.reducedMotion) {
            const t = (s.frameCount * 0.02 * ms + i * 0.5) % 1;
            const fx = cx + (nx - cx) * t;
            const fy = cy + (ny - cy) * t;
            ctx.beginPath(); ctx.arc(fx, fy, minDim * 0.003, 0, Math.PI * 2);
            ctx.fillStyle = rgba(goldC, ELEMENT_ALPHA.primary.max * entrance);
            ctx.fill();
          }
        }

        // Other node
        ctx.beginPath(); ctx.arc(nx, ny, minDim * 0.012, 0, Math.PI * 2);
        ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * (s.tethers[i] ? 1.5 : 0.5) * entrance);
        ctx.fill();
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (activeTethers > 0) ctx.fillText('Tap tethers to sever', cx, cy + minDim * 0.25);
      else if (s.energy < 0.9) ctx.fillText('Recharging...', cx, cy + minDim * 0.25);
      else ctx.fillText('Recharged.', cx, cy + minDim * 0.25);

      if (s.energy >= 0.95 && activeTethers === 0 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(1 - activeTethers / TETHER_COUNT);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const cx2 = viewport.width / 2; const cy2 = viewport.height / 2;

      for (let i = 0; i < TETHER_COUNT; i++) {
        if (!stateRef.current.tethers[i]) continue;
        const angle = (i / TETHER_COUNT) * Math.PI * 2 - Math.PI / 2;
        const mid = minDim2 * 0.09;
        const mx = cx2 + Math.cos(angle) * mid; const my = cy2 + Math.sin(angle) * mid;
        if ((px - mx) ** 2 + (py - my) ** 2 < (minDim2 * 0.05) ** 2) {
          stateRef.current.tethers[i] = false;
          cbRef.current.onHaptic('swipe_commit');
          break;
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}