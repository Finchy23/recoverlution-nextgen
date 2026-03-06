/**
 * ATOM 186: THE DANCE OF SHIVA ENGINE · Series 19 · Position 6
 * Creation and Destruction are the same energy. Drag to crumble
 * structures — same particles rebuild into a stunning new lotus.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Particle { x: number; y: number; tx: number; ty: number; ox: number; oy: number; t: number; }

export default function DanceOfShivaAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    particles: [] as Particle[], inited: false, destroyProgress: 0,
    dragging: false, lastX: 0, rebuildAnim: 0, completed: false, completionFired: false,
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
      // Grid structure
      for (let i = 0; i < 40; i++) {
        const col = i % 8; const row = Math.floor(i / 8);
        const ox = cx0 - minDim0 * 0.1 + col * minDim0 * 0.03;
        const oy = cy0 - minDim0 * 0.06 + row * minDim0 * 0.03;
        // Lotus target
        const angle = (i / 40) * Math.PI * 2;
        const lr = minDim0 * (0.04 + Math.abs(Math.sin(angle * 3)) * 0.04);
        s.particles.push({
          ox, oy,
          x: ox, y: oy,
          tx: cx0 + Math.cos(angle) * lr,
          ty: cy0 + Math.sin(angle) * lr,
          t: 0,
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
      const destroyC: RGB = lerpColor(accentC, [200, 80, 60], 0.3);
      const createC: RGB = lerpColor(accentC, [220, 160, 200], 0.3);

      const rebuilding = s.destroyProgress >= 1;
      if (rebuilding) s.rebuildAnim = Math.min(1, s.rebuildAnim + 0.008);
      const ra = easeOutCubic(s.rebuildAnim);
      if (ra >= 1 && !s.completed) s.completed = true;

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      const dp = s.destroyProgress;
      for (const pt of s.particles) {
        let px: number, py: number;
        if (!rebuilding) {
          // Scatter from original position
          const scatter = dp * minDim * 0.15;
          px = pt.ox + (Math.random() - 0.5) * scatter * dp;
          py = pt.oy + (Math.random() - 0.5) * scatter * dp;
          pt.x = px; pt.y = py;
        } else {
          // Interpolate from scattered to lotus target
          px = pt.x + (pt.tx - pt.x) * ra;
          py = pt.y + (pt.ty - pt.y) * ra;
        }
        const colr = rebuilding ? lerpColor(destroyC, createC, ra) : lerpColor(baseC, destroyC, dp);
        const r = minDim * 0.003;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(colr, EMPHASIS_ALPHA.focal.max * entrance); ctx.fill();
      }

      // Lotus glow at completion
      if (ra > 0.5) {
        const lGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.1 * ra);
        lGrad.addColorStop(0, rgba(createC, ELEMENT_ALPHA.glow.max * (ra - 0.5) * 2 * entrance));
        lGrad.addColorStop(1, rgba(createC, 0));
        ctx.fillStyle = lGrad; ctx.fillRect(0, 0, w, h);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!rebuilding) ctx.fillText('Drag to destroy', cx, h - minDim * 0.04);
      else if (!s.completed) ctx.fillText('Rebuilding...', cx, h - minDim * 0.04);
      else ctx.fillText('Nothing is lost.', cx, h - minDim * 0.04);

      if (s.completed && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(rebuilding ? 0.5 + ra * 0.5 : dp * 0.5);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; stateRef.current.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging || s.destroyProgress >= 1) return;
      const dx = Math.abs(e.clientX - s.lastX);
      s.destroyProgress = Math.min(1, s.destroyProgress + dx * 0.003);
      s.lastX = e.clientX;
      if (s.destroyProgress >= 1) cbRef.current.onHaptic('drag_snap');
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}