/**
 * ATOM 306: THE FRAGMENTATION ENGINE · S31 · Position 6
 * Violent collision explodes into 30 raw creative fragments.
 * INTERACTION: Drag nodes together → explosion → creative fragments
 * RENDER: Canvas 2D · REDUCED MOTION: Static fragment field
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const FRAG_COUNT = 30; const RESPAWN_DELAY = 100;

interface Fragment { x: number; y: number; vx: number; vy: number; size: number; color: RGB; rot: number; rv: number; }

interface FragState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  nodeAx: number; nodeBx: number; dragging: 'A' | 'B' | null; exploded: boolean;
  fragments: Fragment[]; settleAnim: number; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): FragState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeAx: 0.25, nodeBx: 0.75, dragging: null, exploded: false,
    fragments: [], settleAnim: 0, completed: false, respawnTimer: 0 }; }

export default function FragmentationEngineAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
        if (!s.exploded && Math.abs(s.nodeAx - s.nodeBx) < 0.06) {
          s.exploded = true; cb.onHaptic('completion');
          for (let i = 0; i < FRAG_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2; const speed = 0.003 + Math.random() * 0.008;
            s.fragments.push({ x: 0.5, y: 0.5, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
              size: 0.005 + Math.random() * 0.012, color: lerpColor(s.primaryRgb, s.accentRgb, Math.random()),
              rot: Math.random() * Math.PI, rv: (Math.random() - 0.5) * 0.05 });
          }
        }
        if (s.exploded) {
          for (const f of s.fragments) {
            f.x += f.vx * ms; f.y += f.vy * ms; f.vx *= 0.98; f.vy *= 0.98; f.rot += f.rv;
            f.x = Math.max(0.02, Math.min(0.98, f.x)); f.y = Math.max(0.02, Math.min(0.98, f.y));
          }
          s.settleAnim = Math.min(1, s.settleAnim + 0.005);
          cb.onStateChange?.(s.settleAnim);
          if (s.settleAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      const nodeR = px(SIZE.md * 0.3, minDim);

      if (!s.exploded) {
        for (const [nx, col] of [[s.nodeAx, s.accentRgb], [s.nodeBx, s.primaryRgb]] as [number, RGB][]) {
          const nxp = nx * w;
          ctx.beginPath(); ctx.arc(nxp, cy, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(col, ALPHA.content.max * 0.3 * entrance); ctx.fill();
          ctx.strokeStyle = rgba(col, ALPHA.content.max * 0.4 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(s.nodeAx * w, cy); ctx.lineTo(s.nodeBx * w, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      }

      // Fragments
      for (const f of s.fragments) {
        const fx = f.x * w; const fy = f.y * h; const fr = px(f.size, minDim);
        ctx.save(); ctx.translate(fx, fy); ctx.rotate(f.rot);
        // Glow
        const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, fr * 2);
        fg.addColorStop(0, rgba(f.color, ALPHA.glow.max * 0.15 * entrance)); fg.addColorStop(1, rgba(f.color, 0));
        ctx.fillStyle = fg; ctx.fillRect(-fr * 2, -fr * 2, fr * 4, fr * 4);
        // Body
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2; const r = fr * (0.6 + Math.sin(i * 2.7) * 0.4);
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath(); ctx.fillStyle = rgba(f.color, ALPHA.content.max * 0.4 * entrance); ctx.fill();
        ctx.restore();
      }

      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('BEAUTIFUL CHAOS', cx, h - px(0.035, minDim)); }
      else if (!s.exploded) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('DRAG NODES TOGETHER', cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { const s = stateRef.current; if (s.exploded) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width;
      s.dragging = Math.abs(mx - s.nodeAx) < Math.abs(mx - s.nodeBx) ? 'A' : 'B';
      canvas.setPointerCapture(e.pointerId); cbRef.current.onHaptic('drag_snap'); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width;
      if (s.dragging === 'A') s.nodeAx = Math.max(0.05, Math.min(0.5, mx));
      else s.nodeBx = Math.max(0.5, Math.min(0.95, mx)); };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = null; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
