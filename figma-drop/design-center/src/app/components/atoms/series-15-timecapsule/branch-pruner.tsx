/**
 * ATOM 147: THE BRANCH PRUNER ENGINE · Series 15 · Position 7
 * A tree of possibilities. Tap branches to prune them. Light concentrates.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const BRANCH_COUNT = 5;

export default function BranchPrunerAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    branches: new Array(BRANCH_COUNT).fill(true) as boolean[],
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

      const alive = s.branches.filter(Boolean).length;
      const concentration = 1 - (alive - 1) / (BRANCH_COUNT - 1);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Trunk
      const trunkBottom = cy + minDim * 0.12;
      const trunkTop = cy - minDim * 0.02;
      ctx.beginPath(); ctx.moveTo(cx, trunkBottom); ctx.lineTo(cx, trunkTop);
      ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
      ctx.lineWidth = minDim * 0.003; ctx.stroke();

      // Branches
      for (let i = 0; i < BRANCH_COUNT; i++) {
        const angle = -Math.PI * 0.4 + (i / (BRANCH_COUNT - 1)) * Math.PI * 0.8;
        const branchLen = minDim * 0.12;
        const endX = cx + Math.cos(angle - Math.PI / 2) * branchLen;
        const endY = trunkTop + Math.sin(angle - Math.PI / 2) * branchLen * 0.6;

        if (s.branches[i]) {
          const brightness = alive <= 1 ? 3 : 1 + concentration;
          ctx.beginPath(); ctx.moveTo(cx, trunkTop); ctx.lineTo(endX, endY);
          ctx.strokeStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * brightness * entrance);
          ctx.lineWidth = minDim * (alive <= 1 ? 0.003 : 0.0016); ctx.stroke();

          // Leaf/endpoint glow
          const leafR = minDim * (0.008 + (alive <= 1 ? 0.015 : 0));
          ctx.beginPath(); ctx.arc(endX, endY, leafR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(accentC, ELEMENT_ALPHA.primary.max * brightness * entrance);
          ctx.fill();

          if (alive <= 1) {
            const lGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, minDim * 0.06);
            lGrad.addColorStop(0, rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance));
            lGrad.addColorStop(1, rgba(accentC, 0));
            ctx.fillStyle = lGrad;
            ctx.fillRect(endX - minDim * 0.06, endY - minDim * 0.06, minDim * 0.12, minDim * 0.12);
          }
        } else {
          // Pruned stub
          const stubLen = branchLen * 0.2;
          const stubX = cx + Math.cos(angle - Math.PI / 2) * stubLen;
          const stubY = trunkTop + Math.sin(angle - Math.PI / 2) * stubLen * 0.6;
          ctx.beginPath(); ctx.moveTo(cx, trunkTop); ctx.lineTo(stubX, stubY);
          ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.tertiary.max * entrance);
          ctx.lineWidth = minDim * 0.001; ctx.stroke();
        }
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (alive > 1) ctx.fillText('Tap branches to prune', cx, trunkBottom + minDim * 0.05);
      else ctx.fillText('Focused.', cx, trunkBottom + minDim * 0.05);

      if (alive <= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(concentration);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const s = stateRef.current;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const cx2 = viewport.width / 2; const trunkTop2 = viewport.height / 2 - minDim2 * 0.02;
      const alive = s.branches.filter(Boolean).length;
      if (alive <= 1) return;

      for (let i = 0; i < BRANCH_COUNT; i++) {
        if (!s.branches[i]) continue;
        const angle = -Math.PI * 0.4 + (i / (BRANCH_COUNT - 1)) * Math.PI * 0.8;
        const branchLen = minDim2 * 0.12;
        const midX = cx2 + Math.cos(angle - Math.PI / 2) * branchLen * 0.6;
        const midY = trunkTop2 + Math.sin(angle - Math.PI / 2) * branchLen * 0.36;
        if ((px - midX) ** 2 + (py - midY) ** 2 < (minDim2 * 0.04) ** 2) {
          s.branches[i] = false;
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