/**
 * ATOM 329: THE DOMINO VECTOR ENGINE
 * Series 33 — Catalyst Web · Position 9
 *
 * Line of upright rigid bodies. Flick the first one.
 * Physics cascades collapse until final block reveals insight.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, FONT_SIZE, type RGB,
} from '../atom-utils';

const DOMINO_COUNT = 10;

export default function DominoVectorAtom({
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
    dominoes: Array.from({ length: DOMINO_COUNT }, (_, i) => ({
      x: 0.12 + i * 0.078, angle: 0, fallen: false, falling: false,
    })),
    started: false, allFallen: false, fallAnim: 0, completed: false,
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
      if (p.phase === 'resolve' && !s.started) { s.started = true; s.dominoes[0].falling = true; }

      // Physics
      for (let i = 0; i < DOMINO_COUNT; i++) {
        const d = s.dominoes[i];
        if (d.falling && !d.fallen) {
          d.angle = Math.min(Math.PI / 2.2, d.angle + 0.04 * ms);
          if (d.angle >= Math.PI / 2.2) { d.fallen = true; cb.onHaptic('step_advance'); }
          // Trigger next
          if (d.angle > Math.PI / 4 && i < DOMINO_COUNT - 1 && !s.dominoes[i + 1].falling) {
            s.dominoes[i + 1].falling = true;
          }
        }
      }

      const fallenCount = s.dominoes.filter(d => d.fallen).length;
      if (fallenCount === DOMINO_COUNT && !s.allFallen) { s.allFallen = true; cb.onHaptic('completion'); }
      if (s.allFallen) s.fallAnim = Math.min(1, s.fallAnim + 0.012 * ms);
      cb.onStateChange?.(s.allFallen ? 0.5 + s.fallAnim * 0.5 : fallenCount / DOMINO_COUNT * 0.5);

      const baseY = h * 0.65;
      const dW = px(0.006, minDim); const dH = px(0.06, minDim);

      for (const d of s.dominoes) {
        const dx = d.x * w;
        ctx.save(); ctx.translate(dx, baseY); ctx.rotate(d.angle);
        ctx.fillStyle = rgba(d.fallen ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (d.fallen ? 0.5 : 0.35) * entrance);
        ctx.fillRect(-dW / 2, -dH, dW, dH);
        ctx.restore();
      }

      // Final revelation text
      if (s.allFallen) {
        ctx.save(); ctx.globalAlpha = s.fallAnim * entrance;
        ctx.font = `${FONT_SIZE.sm(minDim)}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('the chain was already complete', cx, h * 0.35);
        ctx.restore();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    const onDown = () => {
      if (!st.current.started) {
        st.current.started = true; st.current.dominoes[0].falling = true;
        cbRef.current.onHaptic('swipe_commit');
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
