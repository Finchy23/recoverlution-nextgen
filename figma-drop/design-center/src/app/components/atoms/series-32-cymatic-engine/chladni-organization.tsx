/**
 * ATOM 319: THE CHLADNI ORGANIZATION ENGINE
 * Series 32 — Cymatic Engine · Position 9
 *
 * 50 scattered nodes. Press and hold a tone. Acoustic vibration
 * forces nodes into perfect circle structure.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, type RGB,
} from '../atom-utils';

const NODE_COUNT = 50;

export default function ChladniOrganizationAtom({
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
    nodes: Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.7,
      targetAngle: (i / NODE_COUNT) * Math.PI * 2,
      targetR: 0.12 + (i % 3) * 0.04,
    })),
    holding: false, toneProgress: 0,
    organized: false, organizeAnim: 0, completed: false,
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
      if (p.phase === 'resolve') s.toneProgress = 1;

      if (s.holding) s.toneProgress = Math.min(1, s.toneProgress + 0.005 * ms);
      else if (!s.organized) s.toneProgress = Math.max(0, s.toneProgress - 0.002);

      if (s.toneProgress >= 0.98 && !s.organized) { s.organized = true; cb.onHaptic('completion'); }
      if (s.organized) s.organizeAnim = Math.min(1, s.organizeAnim + 0.012 * ms);
      cb.onStateChange?.(s.organized ? 0.5 + s.organizeAnim * 0.5 : s.toneProgress * 0.5);

      const pull = s.toneProgress * 0.03;

      for (const node of s.nodes) {
        const tX = 0.5 + Math.cos(node.targetAngle) * node.targetR;
        const tY = 0.5 + Math.sin(node.targetAngle) * node.targetR;
        node.x += (tX - node.x) * pull * ms;
        node.y += (tY - node.y) * pull * ms;
        // Random jitter when not organized
        if (!s.organized) {
          node.x += (Math.random() - 0.5) * 0.001 * (1 - s.toneProgress);
          node.y += (Math.random() - 0.5) * 0.001 * (1 - s.toneProgress);
        }

        const nR = px(0.003, minDim);
        ctx.beginPath(); ctx.arc(node.x * w, node.y * h, nR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.organized ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (0.3 + s.toneProgress * 0.3) * entrance);
        ctx.fill();
      }

      // Tone ring indicator
      if (s.holding && !s.organized) {
        ctx.beginPath(); ctx.arc(cx, cy, px(0.13, minDim), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * s.toneProgress);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(0.001, minDim); ctx.stroke();
      }

      // Organized glow
      if (s.organized) {
        const gR = px(0.15 * s.organizeAnim, minDim);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.organizeAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => { st.current.holding = true; cbRef.current.onHaptic('hold_start'); };
    const onUp = () => { st.current.holding = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
