/**
 * ATOM 152: THE PULSE READER ENGINE · Series 16 · Position 2
 * Tap in rhythm with your heartbeat. Concentric rings expand in sync.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface Ring { born: number; }

export default function PulseReaderAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    rings: [] as Ring[], tapTimes: [] as number[], bpm: 0,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const pulseC: RGB = lerpColor(accentC, [220, 80, 80], 0.3);

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Center heartbeat dot
      const dotPulse = !p.reducedMotion && s.tapTimes.length > 0
        ? 1 + Math.sin(s.frameCount * 0.15 * ms) * 0.2 : 1;
      const dotR = minDim * 0.018 * dotPulse;
      ctx.beginPath(); ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(pulseC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Expanding rings
      const maxLife = 120;
      s.rings = s.rings.filter(r => s.frameCount - r.born < maxLife);
      for (const ring of s.rings) {
        const age = (s.frameCount - ring.born) / maxLife;
        const rr = minDim * 0.02 + age * minDim * 0.25;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(pulseC, ELEMENT_ALPHA.primary.max * (1 - age) * 1.5 * entrance);
        ctx.lineWidth = minDim * 0.001 * (1 - age * 0.7);
        ctx.stroke();
      }

      // BPM display
      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (s.bpm > 0) {
        ctx.font = `600 ${Math.max(10, minDim * 0.022)}px -apple-system, sans-serif`;
        ctx.fillStyle = rgba(pulseC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillText(`${Math.round(s.bpm)} BPM`, cx, cy + minDim * 0.12);
      }
      ctx.font = `${fs}px -apple-system, sans-serif`;
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Tap your heartbeat', cx, cy + minDim * 0.17);

      cbRef.current.onStateChange?.(Math.min(1, s.tapTimes.length / 8));
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = () => {
      const s = stateRef.current;
      const now = performance.now();
      s.tapTimes.push(now);
      s.rings.push({ born: s.frameCount });
      cbRef.current.onHaptic('tap');
      // Keep last 8 taps for BPM calc
      if (s.tapTimes.length > 8) s.tapTimes.shift();
      if (s.tapTimes.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < s.tapTimes.length; i++) intervals.push(s.tapTimes[i] - s.tapTimes[i - 1]);
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        s.bpm = 60000 / avg;
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}