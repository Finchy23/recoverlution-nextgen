/**
 * ATOM 358: THE RESONANCE CASCADE ENGINE
 * Series 36 — Friction Spark · Position 8
 *
 * Cure the belief you must personally supply 100% of energy.
 * Single tap transfers perfectly through chain of dense nodes.
 * Zero additional effort illuminates the entire screen.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, motionScale } from '../atom-utils';

const NODE_COUNT = 15;
const NODE_R = 0.025;
const CASCADE_DELAY = 8; // frames between each node lighting

export default function ResonanceCascadeAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    nodes: Array.from({ length: NODE_COUNT }, (_, i) => {
      const angle = (i / NODE_COUNT) * Math.PI * 2;
      const r = 0.12 + (i % 3) * 0.06;
      return { x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r, lit: false, litFrame: 0 };
    }),
    tapped: false, cascadeFrame: 0, allLit: false, litAnim: 0, completed: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;
    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.tapped = true;

      // Cascade logic
      if (s.tapped) {
        s.cascadeFrame++;
        const idx = Math.floor(s.cascadeFrame / CASCADE_DELAY);
        if (idx < NODE_COUNT && !s.nodes[idx].lit) {
          s.nodes[idx].lit = true; s.nodes[idx].litFrame = s.frameCount;
          cb.onHaptic('step_advance');
        }
        if (s.nodes.every(n => n.lit) && !s.allLit) { s.allLit = true; cb.onHaptic('completion'); }
      }
      if (s.allLit) s.litAnim = Math.min(1, s.litAnim + 0.01 * ms);
      cb.onStateChange?.(s.allLit ? 0.5 + s.litAnim * 0.5 : s.nodes.filter(n => n.lit).length / NODE_COUNT * 0.5);

      // Connection lines between adjacent nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        const next = (i + 1) % NODE_COUNT;
        const bothLit = s.nodes[i].lit && s.nodes[next].lit;
        ctx.beginPath();
        ctx.moveTo(s.nodes[i].x * w, s.nodes[i].y * h);
        ctx.lineTo(s.nodes[next].x * w, s.nodes[next].y * h);
        ctx.strokeStyle = rgba(bothLit ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (bothLit ? 0.25 : 0.06) * entrance);
        ctx.lineWidth = px(bothLit ? 0.001 : 0.0004, minDim); ctx.stroke();
      }

      // Nodes
      const nR = minDim * NODE_R;
      for (const n of s.nodes) {
        if (n.lit) {
          const age = Math.min(1, (s.frameCount - n.litFrame) / 30);
          const glowR = nR * (2 + age * 2);
          const ng = ctx.createRadialGradient(n.x * w, n.y * h, 0, n.x * w, n.y * h, glowR);
          ng.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * age * entrance));
          ng.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * age * entrance));
          ng.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = ng; ctx.fillRect(n.x * w - glowR, n.y * h - glowR, glowR * 2, glowR * 2);
        }
        ctx.beginPath(); ctx.arc(n.x * w, n.y * h, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(n.lit ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (n.lit ? 0.6 : 0.2) * entrance);
        ctx.fill();
      }

      // All-lit screen glow
      if (s.allLit) {
        const gR = minDim * 0.3 * s.litAnim;
        const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        ag.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.litAnim * entrance));
        ag.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ag; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { if (!stateRef.current.tapped) { stateRef.current.tapped = true; callbacksRef.current.onHaptic('tap'); } };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
