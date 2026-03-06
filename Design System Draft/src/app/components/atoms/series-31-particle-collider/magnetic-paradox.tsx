/**
 * ATOM 302: THE MAGNETIC PARADOX ENGINE · S31 · Position 2
 * Force two repelling nodes together until polarity flips to attraction.
 * INTERACTION: Hold + drag both nodes toward center → polarity flip
 * RENDER: Canvas 2D · REDUCED MOTION: Static merged
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const REPEL_FORCE = 0.002; const MERGE_DIST = 0.05; const RESPAWN_DELAY = 100;

interface MagState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  ax: number; bx: number; holding: boolean; polarity: 'repel' | 'attract' | 'merged';
  mergeAnim: number; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): MagState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    ax: 0.3, bx: 0.7, holding: false, polarity: 'repel', mergeAnim: 0,
    completed: false, respawnTimer: 0 }; }

export default function MagneticParadoxAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress; const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      if (!p.reducedMotion && !s.completed) {
        if (s.polarity === 'repel' && !s.holding) {
          // Repel when not holding
          const dist = s.bx - s.ax;
          if (dist < 0.5) { s.ax -= REPEL_FORCE; s.bx += REPEL_FORCE; }
          s.ax = Math.max(0.05, s.ax); s.bx = Math.min(0.95, s.bx);
        }
        if (s.holding && s.polarity === 'repel') {
          s.ax += 0.001; s.bx -= 0.001;
          if (s.bx - s.ax < MERGE_DIST) {
            s.polarity = 'attract'; cb.onHaptic('hold_threshold');
          }
          if (s.frameCount % 10 === 0) cb.onHaptic('hold_start');
        }
        if (s.polarity === 'attract') {
          s.ax += (0.5 - s.ax) * 0.05; s.bx += (0.5 - s.bx) * 0.05;
          s.mergeAnim = Math.min(1, s.mergeAnim + 0.01);
          cb.onStateChange?.(s.mergeAnim);
          if (s.mergeAnim >= 1) {
            s.polarity = 'merged'; s.completed = true; cb.onHaptic('completion');
            cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      const nodeR = px(SIZE.md * 0.3, minDim);

      // Magnetic field lines
      if (s.polarity !== 'merged') {
        const lineCount = 8;
        for (let i = 0; i < lineCount; i++) {
          const angle = (i / lineCount) * Math.PI * 2;
          const fieldR = px(0.08, minDim);
          for (const [nx, col] of [[s.ax, s.accentRgb], [s.bx, s.primaryRgb]] as [number, RGB][]) {
            const fx = nx * w + Math.cos(angle) * fieldR;
            const fy = cy + Math.sin(angle) * fieldR;
            ctx.beginPath(); ctx.arc(fx, fy, px(0.002, minDim), 0, Math.PI * 2);
            ctx.fillStyle = rgba(col, ALPHA.atmosphere.min * 0.3 * entrance * ms); ctx.fill();
          }
        }
      }

      // Repulsion/attraction indicator line
      if (s.polarity === 'repel') {
        const mid = (s.ax + s.bx) / 2 * w;
        ctx.beginPath(); ctx.moveTo(s.ax * w + nodeR, cy); ctx.lineTo(s.bx * w - nodeR, cy);
        ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke(); ctx.setLineDash([]);
      }

      // Nodes
      if (s.polarity !== 'merged') {
        for (const [nx, col] of [[s.ax, s.accentRgb], [s.bx, s.primaryRgb]] as [number, RGB][]) {
          const nxp = nx * w;
          const gr = nodeR * 2.5; const g = ctx.createRadialGradient(nxp, cy, 0, nxp, cy, gr);
          g.addColorStop(0, rgba(col, ALPHA.glow.max * 0.2 * entrance)); g.addColorStop(1, rgba(col, 0));
          ctx.fillStyle = g; ctx.fillRect(nxp - gr, cy - gr, gr * 2, gr * 2);
          ctx.beginPath(); ctx.arc(nxp, cy, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(col, ALPHA.content.max * 0.4 * entrance); ctx.fill();
          ctx.strokeStyle = rgba(col, ALPHA.content.max * 0.5 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
        }
      }

      // Merged node
      if (s.polarity === 'merged' || s.mergeAnim > 0.5) {
        const mergedR = nodeR * (1 + s.mergeAnim * 0.5);
        const mergedColor = lerpColor(s.primaryRgb, s.accentRgb, 0.5);
        const gr = mergedR * 3; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
        g.addColorStop(0, rgba(mergedColor, ALPHA.glow.max * 0.4 * s.mergeAnim * entrance));
        g.addColorStop(1, rgba(mergedColor, 0));
        ctx.fillStyle = g; ctx.fillRect(cx - gr, cy - gr, gr * 2, gr * 2);
        ctx.beginPath(); ctx.arc(cx, cy, mergedR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(mergedColor, ALPHA.content.max * 0.5 * s.mergeAnim * entrance); ctx.fill();
      }

      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('POLARITY FLIPPED', cx, h - px(0.035, minDim)); }
      else if (s.polarity === 'repel') { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('HOLD TO OVERCOME REPULSION', cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; canvas.setPointerCapture(e.pointerId); cbRef.current.onHaptic('hold_start'); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
