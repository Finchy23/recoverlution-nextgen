/**
 * ATOM 309: THE TRIANGULATION ENGINE · S31 · Position 9
 * Three chaotic nodes must align simultaneously into glowing tetrahedron.
 * INTERACTION: Drag 3 nodes toward center → alignment → geometric lock
 * RENDER: Canvas 2D · REDUCED MOTION: Static tetrahedron
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const TARGET_R = 0.12; const ALIGN_THRESHOLD = 0.04; const RESPAWN_DELAY = 100;

interface TriNode { x: number; y: number; targetX: number; targetY: number; }

interface TriState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  nodes: TriNode[]; draggingIdx: number; aligned: boolean; alignAnim: number;
  completed: boolean; respawnTimer: number; }

function makeNodes(): TriNode[] {
  const targets = [0, 1, 2].map(i => {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    return { targetX: 0.5 + Math.cos(a) * TARGET_R, targetY: 0.5 + Math.sin(a) * TARGET_R };
  });
  return targets.map(t => ({
    x: t.targetX + (Math.random() - 0.5) * 0.3,
    y: t.targetY + (Math.random() - 0.5) * 0.3,
    targetX: t.targetX, targetY: t.targetY,
  }));
}

function freshState(c: string, a: string): TriState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodes: makeNodes(), draggingIdx: -1, aligned: false, alignAnim: 0,
    completed: false, respawnTimer: 0 }; }

export default function TriangulationAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      // Check alignment
      if (!p.reducedMotion && !s.completed) {
        let totalDist = 0;
        for (const n of s.nodes) { totalDist += Math.sqrt((n.x - n.targetX) ** 2 + (n.y - n.targetY) ** 2); }
        const avgDist = totalDist / 3;
        cb.onStateChange?.(Math.max(0, 1 - avgDist / 0.2));

        if (avgDist < ALIGN_THRESHOLD && !s.aligned) { s.aligned = true; cb.onHaptic('completion'); }
        if (s.aligned) {
          s.alignAnim = Math.min(1, s.alignAnim + 0.012);
          // Snap to targets
          for (const n of s.nodes) { n.x += (n.targetX - n.x) * 0.1; n.y += (n.targetY - n.y) * 0.1; }
          if (s.alignAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        } else if (!p.reducedMotion) {
          // Chaotic drift
          for (const n of s.nodes) {
            if (s.draggingIdx === s.nodes.indexOf(n)) continue;
            n.x += Math.sin(s.frameCount * 0.01 + n.targetX * 10) * 0.0005 * ms;
            n.y += Math.cos(s.frameCount * 0.012 + n.targetY * 10) * 0.0005 * ms;
          }
        }
      }

      // Target triangle (ghost)
      if (!s.aligned) {
        ctx.setLineDash([px(0.003, minDim), px(0.005, minDim)]);
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const n = s.nodes[i];
          if (i === 0) ctx.moveTo(n.targetX * w, n.targetY * h);
          else ctx.lineTo(n.targetX * w, n.targetY * h);
        }
        ctx.closePath(); ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke(); ctx.setLineDash([]);
      }

      // Connection lines
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const a = s.nodes[i]; const b = s.nodes[(i + 1) % 3];
        ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h);
      }
      ctx.closePath();
      const lineAlpha = (s.aligned ? 0.4 + s.alignAnim * 0.3 : 0.15) * ALPHA.content.max * entrance;
      ctx.strokeStyle = rgba(s.aligned ? lerpColor(s.primaryRgb, s.accentRgb, 0.5) : s.primaryRgb, lineAlpha);
      ctx.lineWidth = px(s.aligned ? STROKE.medium : STROKE.thin, minDim); ctx.stroke();

      // Fill triangle
      if (s.aligned) {
        ctx.beginPath();
        for (let i = 0; i < 3; i++) { const n = s.nodes[i]; if (i === 0) ctx.moveTo(n.x * w, n.y * h); else ctx.lineTo(n.x * w, n.y * h); }
        ctx.closePath();
        ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), s.alignAnim * ALPHA.content.max * 0.1 * entrance);
        ctx.fill();
      }

      // Nodes
      for (let i = 0; i < 3; i++) {
        const n = s.nodes[i]; const nx2 = n.x * w; const ny2 = n.y * h;
        const nodeR = px(0.018, minDim);
        const ng = ctx.createRadialGradient(nx2, ny2, 0, nx2, ny2, nodeR * 2);
        ng.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance)); ng.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ng; ctx.fillRect(nx2 - nodeR * 2, ny2 - nodeR * 2, nodeR * 4, nodeR * 4);
        ctx.beginPath(); ctx.arc(nx2, ny2, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();
      }

      // Center glow (aligned)
      if (s.aligned) {
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, px(0.08, minDim) * s.alignAnim);
        cg.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), s.alignAnim * ALPHA.glow.max * 0.3 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg; ctx.fillRect(cx - px(0.08, minDim), cy - px(0.08, minDim), px(0.16, minDim), px(0.16, minDim));
      }

      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('TRIANGULATED', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('DRAG NODES TO ALIGN', cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { const s = stateRef.current; if (s.aligned) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      let closest = -1; let minD = 0.06;
      for (let i = 0; i < 3; i++) { const d = Math.sqrt((mx - s.nodes[i].x) ** 2 + (my - s.nodes[i].y) ** 2); if (d < minD) { minD = d; closest = i; } }
      s.draggingIdx = closest; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (s.draggingIdx < 0) return;
      const rect = canvas.getBoundingClientRect(); s.nodes[s.draggingIdx].x = (e.clientX - rect.left) / rect.width;
      s.nodes[s.draggingIdx].y = (e.clientY - rect.top) / rect.height; };
    const onUp = (e: PointerEvent) => { stateRef.current.draggingIdx = -1; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
