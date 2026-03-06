/** ATOM 370: CIRCUIT COMPLETE · S37 P10 (Capstone) — Complex circuit with one gap. Draw the final connection. Everything flows. */
import { useRef, useEffect } from 'react'; import type { AtomProps } from '../types'; import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';
const NODES = [{x:0.2,y:0.3},{x:0.4,y:0.15},{x:0.6,y:0.2},{x:0.8,y:0.35},{x:0.75,y:0.6},{x:0.55,y:0.75},{x:0.35,y:0.7},{x:0.2,y:0.55}];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]; // Gap: 7→0
export default function CircuitCompleteAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const cbRef = useRef({ onHaptic, onStateChange }); const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed }); useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]); useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const st = useRef({ entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(color), accentRgb: parseColor(accentColor), connected: false, connectAnim: 0, completed: false, flowPhase: 0, drawing: false, drawPath: [] as {x:number;y:number}[] });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; let animId: number;
    const render = () => { const s = st.current; const p = propsRef.current; const cb = cbRef.current; const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height); const ms = motionScale(p.reducedMotion); s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase); s.entranceProgress = progress; if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.connected = true;
      if (s.connected) { s.connectAnim = Math.min(1, s.connectAnim + 0.01 * ms); s.flowPhase += 0.02 * ms; if (s.connectAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); } }
      cb.onStateChange?.(s.connected ? s.connectAnim : 0);
      // Draw circuit edges
      for (const [a, b] of EDGES) { ctx.beginPath(); ctx.moveTo(NODES[a].x * w, NODES[a].y * h); ctx.lineTo(NODES[b].x * w, NODES[b].y * h);
        ctx.strokeStyle = rgba(s.connected ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (s.connected ? 0.3 + s.connectAnim * 0.2 : 0.15) * entrance); ctx.lineWidth = px(0.002, minDim); ctx.stroke(); }
      // Gap highlight
      if (!s.connected) { ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]); ctx.beginPath(); ctx.moveTo(NODES[7].x * w, NODES[7].y * h); ctx.lineTo(NODES[0].x * w, NODES[0].y * h);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance); ctx.lineWidth = px(0.001, minDim); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.beginPath(); ctx.moveTo(NODES[7].x * w, NODES[7].y * h); ctx.lineTo(NODES[0].x * w, NODES[0].y * h); ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * s.connectAnim * entrance); ctx.lineWidth = px(0.003, minDim); ctx.stroke(); }
      // Nodes
      for (let i = 0; i < NODES.length; i++) { const n = NODES[i]; const nR = px(0.01, minDim);
        if (s.connected) { const gR = nR * 3; const gg = ctx.createRadialGradient(n.x * w, n.y * h, 0, n.x * w, n.y * h, gR); gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.connectAnim * entrance)); gg.addColorStop(1, rgba(s.primaryRgb, 0)); ctx.fillStyle = gg; ctx.fillRect(n.x * w - gR, n.y * h - gR, gR * 2, gR * 2); }
        ctx.beginPath(); ctx.arc(n.x * w, n.y * h, nR, 0, Math.PI * 2); ctx.fillStyle = rgba(s.connected ? s.primaryRgb : s.accentRgb, ALPHA.content.max * (s.connected ? 0.5 : 0.25) * entrance); ctx.fill(); }
      // Flow animation
      if (s.connected) { for (let i = 0; i < NODES.length; i++) { const next = (i + 1) % NODES.length; const t = (s.flowPhase + i * 0.12) % 1; const fx = NODES[i].x + (NODES[next].x - NODES[i].x) * t; const fy = NODES[i].y + (NODES[next].y - NODES[i].y) * t;
          ctx.beginPath(); ctx.arc(fx * w, fy * h, px(0.004, minDim), 0, Math.PI * 2); ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * s.connectAnim * entrance); ctx.fill(); } }
      ctx.restore(); animId = requestAnimationFrame(render); };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.drawing = true; st.current.drawPath = []; }; const onMove = (e: PointerEvent) => { if (!st.current.drawing || st.current.connected) return; const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      // Check if draw path connects node 7 to node 0
      const d7 = Math.sqrt((mx - NODES[7].x) ** 2 + (my - NODES[7].y) ** 2); const d0 = Math.sqrt((mx - NODES[0].x) ** 2 + (my - NODES[0].y) ** 2);
      if (d7 < 0.06 || d0 < 0.06) st.current.drawPath.push({ x: mx, y: my });
      if (st.current.drawPath.length > 3 && d0 < 0.06 && st.current.drawPath.some(p => Math.sqrt((p.x - NODES[7].x) ** 2 + (p.y - NODES[7].y) ** 2) < 0.06)) { st.current.connected = true; cbRef.current.onHaptic('drag_snap'); } };
    const onUp = () => { st.current.drawing = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);
  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
