/**
 * ATOM 321: THE CENTRAL NODE ENGINE
 * Series 33 — Catalyst Web · Position 1
 *
 * 30 chaotic nodes in zero-gravity. Tap one to make it the
 * gravitational anchor pulling all others into orbital ring.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const NODE_COUNT = 30;

export default function CentralNodeAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const st = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    nodes: Array.from({ length: NODE_COUNT }, () => ({
      x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.002, vy: (Math.random() - 0.5) * 0.002,
      orbitAngle: 0, orbitR: 0,
    })),
    anchorIdx: -1, organized: false, organizeAnim: 0, completed: false,
  });
  useEffect(() => { st.current.primaryRgb = parseColor(color); st.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = st.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve' && s.anchorIdx < 0) s.anchorIdx = 0;

      if (s.anchorIdx >= 0) {
        s.organizeAnim = Math.min(1, s.organizeAnim + 0.008 * ms);
        if (s.organizeAnim >= 0.95 && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      }
      cb.onStateChange?.(s.anchorIdx >= 0 ? s.organizeAnim : 0);

      const nR = px(0.004, minDim);
      const anchorR = px(0.008, minDim);

      for (let i = 0; i < NODE_COUNT; i++) {
        const n = s.nodes[i];
        if (s.anchorIdx >= 0 && i !== s.anchorIdx) {
          // Assign orbit targets
          const orbitIdx = i > s.anchorIdx ? i - 1 : i;
          const targetAngle = (orbitIdx / (NODE_COUNT - 1)) * Math.PI * 2;
          const targetR = 0.12 + (orbitIdx % 3) * 0.03;
          const anchor = s.nodes[s.anchorIdx];
          const tX = anchor.x + Math.cos(targetAngle + s.frameCount * 0.003) * targetR;
          const tY = anchor.y + Math.sin(targetAngle + s.frameCount * 0.003) * targetR;
          n.x += (tX - n.x) * 0.02 * s.organizeAnim * ms;
          n.y += (tY - n.y) * 0.02 * s.organizeAnim * ms;
        } else if (s.anchorIdx < 0) {
          n.x += n.vx * ms; n.y += n.vy * ms;
          n.vx += (Math.random() - 0.5) * 0.0002; n.vy += (Math.random() - 0.5) * 0.0002;
          n.vx *= 0.99; n.vy *= 0.99;
          if (n.x < 0.05 || n.x > 0.95) n.vx *= -1;
          if (n.y < 0.05 || n.y > 0.95) n.vy *= -1;
        }

        const isAnchor = i === s.anchorIdx;
        const r = isAnchor ? anchorR : nR;
        ctx.beginPath(); ctx.arc(n.x * w, n.y * h, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(isAnchor ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (isAnchor ? 0.7 : 0.35) * entrance);
        ctx.fill();

        // Lines from anchor to orbiting nodes
        if (s.anchorIdx >= 0 && !isAnchor && s.organizeAnim > 0.2) {
          const anchor = s.nodes[s.anchorIdx];
          ctx.beginPath(); ctx.moveTo(anchor.x * w, anchor.y * h); ctx.lineTo(n.x * w, n.y * h);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * s.organizeAnim * entrance);
          ctx.lineWidth = px(0.0004, minDim); ctx.stroke();
        }
      }

      // Anchor glow
      if (s.anchorIdx >= 0) {
        const a = s.nodes[s.anchorIdx];
        const gR = px(0.04 * s.organizeAnim, minDim);
        const gg = ctx.createRadialGradient(a.x * w, a.y * h, 0, a.x * w, a.y * h, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.organizeAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(a.x * w - gR, a.y * h - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const s = st.current; if (s.anchorIdx >= 0) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      let closest = -1; let closestD = Infinity;
      for (let i = 0; i < NODE_COUNT; i++) {
        const d = Math.sqrt((mx - s.nodes[i].x) ** 2 + (my - s.nodes[i].y) ** 2);
        if (d < closestD) { closestD = d; closest = i; }
      }
      if (closestD < 0.08) { s.anchorIdx = closest; cbRef.current.onHaptic('tap'); }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
