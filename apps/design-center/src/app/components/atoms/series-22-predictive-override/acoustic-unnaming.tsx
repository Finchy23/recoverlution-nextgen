/**
 * ATOM 215: THE ACOUSTIC UN-NAMING ENGINE · S22 · Position 5
 * Hear raw waveform not labeled source. Pinch to strip labels.
 * INTERACTION: Hold → waveform magnifies → labels dissolve
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static waveform
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const WAVE_POINTS = 80; const STRIP_RATE = 0.005; const RESPAWN_DELAY = 100;
const LABELS = ['ALARM', 'SIREN', 'SCREAM', 'THUNDER', 'CRASH'];

interface AcousticState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  holding: boolean; stripProgress: number; wavePhase: number; labelOpacity: number;
  magnification: number; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): AcousticState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    holding: false, stripProgress: 0, wavePhase: 0, labelOpacity: 1, magnification: 1,
    completed: false, respawnTimer: 0 }; }

export default function AcousticUnnamingAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      s.wavePhase += 0.03 * ms;

      if (!p.reducedMotion && !s.completed) {
        if (s.holding) {
          s.stripProgress = Math.min(1, s.stripProgress + STRIP_RATE);
          s.labelOpacity = Math.max(0, 1 - s.stripProgress * 2);
          s.magnification = 1 + s.stripProgress * 3;
          if (s.frameCount % 20 === 0) cb.onHaptic('step_advance');
          cb.onStateChange?.(s.stripProgress);
          if (s.stripProgress >= 1) { s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      // Waveform
      const waveY = cy; const waveH = px(0.08, minDim) * s.magnification;
      const waveColor = s.stripProgress > 0.5
        ? lerpColor(s.accentRgb, s.primaryRgb, (s.stripProgress - 0.5) * 2) : s.accentRgb;

      // Multiple harmonic layers
      for (let layer = 0; layer < 3; layer++) {
        const layerFreq = 2 + layer * 3;
        const layerAmp = waveH * (1 - layer * 0.3);
        const layerAlpha = ALPHA.content.max * (0.4 - layer * 0.1) * entrance;

        ctx.beginPath();
        for (let i = 0; i <= WAVE_POINTS; i++) {
          const t = i / WAVE_POINTS;
          const x = w * 0.1 + t * w * 0.8;
          const baseWave = Math.sin(t * Math.PI * layerFreq + s.wavePhase + layer) * layerAmp;
          const noise = s.stripProgress < 0.5 ? Math.sin(t * 17 + s.frameCount * 0.1) * waveH * 0.3 * (1 - s.stripProgress * 2) : 0;
          const y = waveY + baseWave + noise;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(waveColor, layerAlpha * ms);
        ctx.lineWidth = px(layer === 0 ? STROKE.medium : STROKE.thin, minDim);
        ctx.stroke();
      }

      // Labels (fade out)
      if (s.labelOpacity > 0.01) {
        const lFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${lFont}px monospace`; ctx.textAlign = 'center';
        for (let i = 0; i < LABELS.length; i++) {
          const lx = w * (0.15 + i * 0.175);
          const ly = waveY - waveH * 1.5 - px(0.02, minDim);
          ctx.fillStyle = rgba(s.accentRgb, s.labelOpacity * ALPHA.text.max * 0.4 * entrance);
          ctx.fillText(LABELS[i], lx, ly);
          // Arrow down to wave
          ctx.beginPath(); ctx.moveTo(lx, ly + px(0.005, minDim));
          ctx.lineTo(lx, waveY - waveH); ctx.strokeStyle = rgba(s.accentRgb, s.labelOpacity * ALPHA.atmosphere.min * 0.3 * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
        }
      }

      // "Raw waveform" label (fades in)
      if (s.stripProgress > 0.5) {
        const rawAlpha = (s.stripProgress - 0.5) * 2 * ALPHA.text.max * 0.4 * entrance;
        const rFont = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${rFont}px monospace`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, rawAlpha);
        ctx.fillText('PURE WAVEFORM', cx, waveY + waveH * 1.5 + px(0.03, minDim));
      }

      // Magnification indicator
      if (s.magnification > 1.1) {
        const magFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${magFont}px monospace`; ctx.textAlign = 'right';
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText(`${s.magnification.toFixed(1)}×`, w - px(0.03, minDim), px(0.04, minDim));
      }

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('JUST SOUND', cx, h - px(0.035, minDim)); }
      else if (!s.holding) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('HOLD TO STRIP LABELS', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { ctx.beginPath(); ctx.moveTo(w * 0.1, cy);
        for (let i = 0; i <= 40; i++) { ctx.lineTo(w * 0.1 + (i / 40) * w * 0.8, cy + Math.sin(i * 0.3) * px(0.05, minDim)); }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke(); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.holding = true; cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId); };
    const onUp = (e: PointerEvent) => { stateRef.current.holding = false; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
