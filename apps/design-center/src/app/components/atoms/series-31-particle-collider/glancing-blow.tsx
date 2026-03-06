/**
 * ATOM 308: THE GLANCING BLOW ENGINE · S31 · Position 8
 * Head-on fails. Tangential scraping generates friction sparks → fire.
 * INTERACTION: Drag for tangential scrapes → friction → combustion
 * RENDER: Canvas 2D · REDUCED MOTION: Static fire
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const SCRAPES_NEEDED = 3; const SPARK_COUNT = 8; const RESPAWN_DELAY = 100;

interface Spark { x: number; y: number; vx: number; vy: number; life: number; }

interface GlancingState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  blockX: number; dragging: boolean; lastX: number; frictionHeat: number;
  scrapes: number; sparks: Spark[]; ignited: boolean; fireAnim: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): GlancingState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    blockX: 0.5, dragging: false, lastX: 0, frictionHeat: 0,
    scrapes: 0, sparks: [], ignited: false, fireAnim: 0,
    completed: false, respawnTimer: 0 }; }

export default function GlancingBlowAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
        s.frictionHeat *= 0.98;
        // Update sparks
        for (const sp of s.sparks) { sp.x += sp.vx * ms; sp.y += sp.vy * ms; sp.vy += 0.0003; sp.life--; }
        s.sparks = s.sparks.filter(sp => sp.life > 0);

        if (s.ignited) {
          s.fireAnim = Math.min(1, s.fireAnim + 0.01);
          cb.onStateChange?.(s.fireAnim);
          if (s.fireAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      const blockR = px(SIZE.md * 0.4, minDim);

      // Block
      ctx.beginPath(); ctx.arc(cx, cy, blockR, 0, Math.PI * 2);
      const heatColor = lerpColor(s.accentRgb, [255, 120, 30] as RGB, s.frictionHeat);
      ctx.fillStyle = rgba(heatColor, ALPHA.content.max * 0.2 * entrance); ctx.fill();
      ctx.strokeStyle = rgba(heatColor, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();

      // Heat glow
      if (s.frictionHeat > 0.2) {
        const hg = ctx.createRadialGradient(cx, cy, blockR * 0.8, cx, cy, blockR * 1.5);
        hg.addColorStop(0, rgba([255, 120, 30] as RGB, s.frictionHeat * ALPHA.glow.max * 0.2 * entrance));
        hg.addColorStop(1, rgba([255, 120, 30] as RGB, 0));
        ctx.fillStyle = hg; ctx.fillRect(cx - blockR * 1.5, cy - blockR * 1.5, blockR * 3, blockR * 3);
      }

      // Sparks
      for (const sp of s.sparks) {
        const spx = sp.x * w; const spy = sp.y * h;
        ctx.beginPath(); ctx.arc(spx, spy, px(0.002, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 200, 50] as RGB, (sp.life / 30) * ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
      }

      // Fire
      if (s.ignited) {
        const fireR = blockR * (1 + s.fireAnim * 2);
        for (let i = 0; i < 5; i++) {
          const fa = (i / 5) * Math.PI * 2 + s.frameCount * 0.05;
          const fr = fireR * (0.5 + Math.sin(s.frameCount * 0.1 + i) * 0.3);
          const fg = ctx.createRadialGradient(cx + Math.cos(fa) * fr * 0.3, cy + Math.sin(fa) * fr * 0.3, 0,
            cx + Math.cos(fa) * fr * 0.3, cy + Math.sin(fa) * fr * 0.3, fr * 0.5);
          fg.addColorStop(0, rgba([255, 150, 30] as RGB, s.fireAnim * ALPHA.glow.max * 0.15 * entrance * ms));
          fg.addColorStop(1, rgba([255, 80, 0] as RGB, 0));
          ctx.fillStyle = fg;
          ctx.fillRect(cx - fireR, cy - fireR, fireR * 2, fireR * 2);
        }
      }

      // Scrape counter
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba([255, 150, 30] as RGB, ALPHA.text.max * 0.5 * entrance); ctx.fillText('COMBUSTION', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText(`SCRAPE ACROSS (${s.scrapes}/${SCRAPES_NEEDED})`, cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { const s = stateRef.current; s.dragging = true;
      const rect = canvas.getBoundingClientRect(); s.lastX = (e.clientX - rect.left) / rect.width;
      canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging || s.ignited) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width;
      const speed = Math.abs(mx - s.lastX);
      if (speed > 0.01) {
        s.frictionHeat = Math.min(1, s.frictionHeat + speed * 3);
        // Sparks
        for (let i = 0; i < 2; i++) {
          s.sparks.push({ x: 0.5 + (Math.random() - 0.5) * 0.1, y: 0.5 + (Math.random() - 0.5) * 0.1,
            vx: (Math.random() - 0.5) * 0.005, vy: -Math.random() * 0.003, life: 15 + Math.random() * 15 });
        }
        if (speed > 0.03) cbRef.current.onHaptic('drag_snap');
      }
      s.lastX = mx;
      if (s.frictionHeat > 0.8) {
        s.scrapes++; s.frictionHeat = 0;
        cbRef.current.onHaptic('step_advance');
        if (s.scrapes >= SCRAPES_NEEDED) { s.ignited = true; cbRef.current.onHaptic('completion'); }
      }
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} /></div>);
}
