/**
 * ATOM 212: THE RAW DATA ENGINE
 * ================================
 * Series 22 — Predictive Override · Position 2
 *
 * Blur reality until the brain gives up labeling. Just experience
 * light and color. Scrub to extreme bokeh — labels impossible.
 *
 * SIGNATURE TECHNIQUE: Sensory deconstruction — progressive bokeh
 * rendering, labeled shapes dissolving into pure luminance blobs,
 * category text fading as blur increases.
 *
 * INTERACTION: Scrub (drag vertical) → blur increases → labels vanish
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static soft bokeh
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const OBJECT_COUNT = 6;
const RESPAWN_DELAY = 100;

interface SceneObj { x: number; y: number; size: number; label: string; color: RGB; shape: 'circle' | 'rect' | 'tri'; }

function makeObjects(primary: RGB, accent: RGB): SceneObj[] {
  const labels = ['THREAT', 'DANGER', 'PAIN', 'LOSS', 'FEAR', 'SHAME'];
  return Array.from({ length: OBJECT_COUNT }, (_, i) => ({
    x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.6,
    size: 0.03 + Math.random() * 0.04,
    label: labels[i], color: i % 2 === 0 ? accent : primary,
    shape: (['circle', 'rect', 'tri'] as const)[i % 3],
  }));
}

interface RawState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  blurAmount: number; objects: SceneObj[]; dragging: boolean; lastY: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): RawState {
  const p = parseColor(c); const ac = parseColor(a);
  return { entranceProgress: 0, frameCount: 0, primaryRgb: p, accentRgb: ac,
    blurAmount: 0, objects: makeObjects(p, ac), dragging: false, lastY: 0,
    completed: false, respawnTimer: 0 }; }

export default function RawDataAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      const blur = s.blurAmount;
      cb.onStateChange?.(blur);

      if (blur >= 1 && !s.completed) {
        s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY;
      }

      // ── LAYER 2-5: Scene objects (sharp → bokeh) ────
      for (const obj of s.objects) {
        const ox = obj.x * w; const oy = obj.y * h;
        const oSize = px(obj.size + blur * 0.03, minDim);

        // Bokeh glow (grows with blur)
        if (blur > 0.2) {
          const bokehR = oSize * (1 + blur * 3);
          const bokeh = ctx.createRadialGradient(ox, oy, 0, ox, oy, bokehR);
          bokeh.addColorStop(0, rgba(obj.color, blur * ALPHA.glow.max * 0.3 * entrance));
          bokeh.addColorStop(1, rgba(obj.color, 0));
          ctx.fillStyle = bokeh;
          ctx.fillRect(ox - bokehR, oy - bokehR, bokehR * 2, bokehR * 2);
        }

        // Shape (sharp when blur=0, blobby when high)
        const sharpAlpha = Math.max(0, 1 - blur * 1.5) * ALPHA.content.max * entrance;
        if (sharpAlpha > 0.01) {
          ctx.beginPath();
          if (obj.shape === 'circle') { ctx.arc(ox, oy, oSize, 0, Math.PI * 2); }
          else if (obj.shape === 'rect') { ctx.rect(ox - oSize, oy - oSize, oSize * 2, oSize * 2); }
          else { ctx.moveTo(ox, oy - oSize); ctx.lineTo(ox + oSize, oy + oSize); ctx.lineTo(ox - oSize, oy + oSize); ctx.closePath(); }
          ctx.fillStyle = rgba(obj.color, sharpAlpha * 0.3);
          ctx.fill();
          ctx.strokeStyle = rgba(obj.color, sharpAlpha);
          ctx.lineWidth = px(STROKE.medium, minDim);
          ctx.stroke();
        }

        // Label (fades early)
        const labelAlpha = Math.max(0, 1 - blur * 3) * ALPHA.text.max * 0.5 * entrance;
        if (labelAlpha > 0.01) {
          const lFont = Math.max(7, px(FONT_SIZE.xs, minDim));
          ctx.font = `${lFont}px monospace`;
          ctx.textAlign = 'center';
          ctx.fillStyle = rgba(obj.color, labelAlpha);
          ctx.fillText(obj.label, ox, oy - oSize - px(0.01, minDim));
        }
      }

      // ── LAYER 6: Pure luminance overlay ────────────
      if (blur > 0.6) {
        const lumAlpha = (blur - 0.6) * 2.5 * ALPHA.glow.max * 0.15 * entrance;
        const lumGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.5);
        lumGrad.addColorStop(0, rgba(s.primaryRgb, lumAlpha));
        lumGrad.addColorStop(0.5, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.4), lumAlpha * 0.7));
        lumGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = lumGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── LAYER 7: Blur slider ───────────────────────
      const sliderX = w - px(0.04, minDim); const sliderH = px(0.3, minDim);
      const sliderY = cy - sliderH / 2;
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
      ctx.fillRect(sliderX - px(0.002, minDim), sliderY, px(0.004, minDim), sliderH);
      const knobY = sliderY + sliderH * (1 - blur);
      ctx.beginPath(); ctx.arc(sliderX, knobY, px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('PURE LIGHT', cx, h - px(0.035, minDim)); }
      else if (blur < 0.1) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('DRAG UP TO DEFOCUS', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance); ctx.fillText(`BLUR ${Math.round(blur * 100)}%`, cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { for (const obj of s.objects) { const bokehR = px(obj.size * 2, minDim);
        const bokeh = ctx.createRadialGradient(obj.x * w, obj.y * h, 0, obj.x * w, obj.y * h, bokehR);
        bokeh.addColorStop(0, rgba(obj.color, ALPHA.glow.max * 0.3 * entrance)); bokeh.addColorStop(1, rgba(obj.color, 0));
        ctx.fillStyle = bokeh; ctx.fillRect(obj.x * w - bokehR, obj.y * h - bokehR, bokehR * 2, bokehR * 2); } }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { const s = stateRef.current; if (s.completed) return;
      s.dragging = true; const rect = canvas.getBoundingClientRect(); s.lastY = (e.clientY - rect.top) / rect.height;
      canvas.setPointerCapture(e.pointerId); cbRef.current.onHaptic('hold_start'); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect(); const my = (e.clientY - rect.top) / rect.height;
      const dy = s.lastY - my; s.blurAmount = Math.max(0, Math.min(1, s.blurAmount + dy * 2)); s.lastY = my;
      if (Math.abs(dy) > 0.005) cbRef.current.onHaptic('drag_snap'); };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} /></div>);
}
