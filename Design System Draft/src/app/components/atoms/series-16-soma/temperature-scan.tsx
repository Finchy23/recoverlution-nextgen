/**
 * ATOM 158: THE TEMPERATURE SCAN ENGINE · Series 16 · Position 8
 * Thermal camera view. Tap hot zones to cool them down.
 * Chaotic red crackle resolves into cool blue stillness.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

interface HotZone { x: number; y: number; heat: number; }

export default function TemperatureScanAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    zones: [
      { x: 0.35, y: 0.35, heat: 1 },
      { x: 0.65, y: 0.4, heat: 1 },
      { x: 0.5, y: 0.6, heat: 1 },
      { x: 0.4, y: 0.55, heat: 1 },
    ] as HotZone[],
    completionFired: false,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;
      const hotC: RGB = lerpColor(accentC, [220, 60, 40], 0.3);
      const coolC: RGB = lerpColor(baseC, [60, 140, 200], 0.5);

      const avgHeat = s.zones.reduce((a, z) => a + z.heat, 0) / s.zones.length;

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(lerpColor(hotC, coolC, 1 - avgHeat), ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Hot zones
      for (const zone of s.zones) {
        const zx = zone.x * w; const zy = zone.y * h;
        const zoneColor: RGB = lerpColor(coolC, hotC, zone.heat);
        const zoneR = minDim * (0.04 + zone.heat * 0.03);

        // Zone glow
        const zGrad = ctx.createRadialGradient(zx, zy, 0, zx, zy, zoneR * 2.5);
        zGrad.addColorStop(0, rgba(zoneColor, ELEMENT_ALPHA.primary.max * (1 + zone.heat) * entrance));
        zGrad.addColorStop(0.5, rgba(zoneColor, ELEMENT_ALPHA.glow.max * zone.heat * entrance));
        zGrad.addColorStop(1, rgba(zoneColor, 0));
        ctx.fillStyle = zGrad;
        ctx.fillRect(zx - zoneR * 2.5, zy - zoneR * 2.5, zoneR * 5, zoneR * 5);

        // Core
        ctx.beginPath(); ctx.arc(zx, zy, zoneR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(zoneColor, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fill();

        // Crackle particles (hot only)
        if (zone.heat > 0.3 && !p.reducedMotion) {
          for (let i = 0; i < Math.ceil(zone.heat * 4); i++) {
            const pa = Math.sin(s.frameCount * 0.1 * ms + i * 2.3 + zone.x * 10);
            const px = zx + Math.cos(i * 1.6 + s.frameCount * 0.05 * ms) * zoneR * 1.2;
            const py = zy + Math.sin(i * 2.1 + s.frameCount * 0.07 * ms) * zoneR * 1.2;
            ctx.fillStyle = rgba(hotC, ELEMENT_ALPHA.tertiary.max * zone.heat * Math.abs(pa) * entrance);
            ctx.fillRect(px, py, minDim * 0.002, minDim * 0.002);
          }
        }

        // Temperature label
        const fs = Math.max(6, minDim * 0.009);
        ctx.font = `${fs}px monospace`; ctx.textAlign = 'center';
        ctx.fillStyle = rgba(zoneColor, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fillText(`${Math.round(36 + zone.heat * 5)}°C`, zx, zy + zoneR + minDim * 0.015);
      }

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (avgHeat > 0.1) ctx.fillText('Tap hot zones to cool', cx, h - minDim * 0.05);
      else ctx.fillText('Regulated.', cx, h - minDim * 0.05);

      if (avgHeat <= 0.05 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(1 - avgHeat);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      for (const zone of stateRef.current.zones) {
        const dist = Math.sqrt((px - zone.x) ** 2 + (py - zone.y) ** 2);
        if (dist < 0.1 && zone.heat > 0) {
          zone.heat = Math.max(0, zone.heat - 0.35);
          cbRef.current.onHaptic('tap');
          break;
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}