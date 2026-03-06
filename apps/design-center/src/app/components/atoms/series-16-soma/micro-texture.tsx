/**
 * ATOM 155: THE MICRO-TEXTURE ENGINE · Series 16 · Position 5
 * Drag across different texture zones: stone, velvet, glass, sand.
 * Sensory anchoring through present-moment micro-detail.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

const TEXTURES = ['Stone', 'Velvet', 'Glass', 'Sand'] as const;

export default function MicroTextureAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    activeZone: -1, dragging: false,
    touchX: 0, touchY: 0,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    // Pre-generate texture noise seeds
    const noiseSeed = new Float32Array(200);
    for (let i = 0; i < 200; i++) noiseSeed[i] = Math.random();

    const render = () => {
      const s = stateRef.current; const p = propsRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const zoneColors: RGB[] = [
        lerpColor(accentC, [120, 110, 100], 0.3), // Stone
        lerpColor(accentC, [140, 60, 100], 0.3),  // Velvet
        lerpColor(accentC, [160, 200, 220], 0.3),  // Glass
        lerpColor(accentC, [200, 180, 120], 0.3),  // Sand
      ];

      // Background
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(baseC, ELEMENT_ALPHA.glow.max * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // 4 texture zones in a 2x2 grid
      const gridSize = minDim * 0.14;
      const gap = minDim * 0.02;
      const totalW = gridSize * 2 + gap;
      const startX = cx - totalW / 2;
      const startY = cy - totalW / 2;

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const idx = row * 2 + col;
          const zx = startX + col * (gridSize + gap);
          const zy = startY + row * (gridSize + gap);
          const active = s.activeZone === idx;

          // Zone background
          ctx.fillStyle = rgba(zoneColors[idx], ELEMENT_ALPHA.primary.max * (active ? 2 : 0.8) * entrance);
          ctx.fillRect(zx, zy, gridSize, gridSize);

          // Texture pattern
          if (idx === 0) { // Stone - gritty dots
            for (let i = 0; i < 30; i++) {
              const sx = zx + noiseSeed[i] * gridSize;
              const sy = zy + noiseSeed[i + 30] * gridSize;
              ctx.fillStyle = rgba(zoneColors[0], ELEMENT_ALPHA.secondary.max * (active ? 3 : 1) * entrance);
              ctx.fillRect(sx, sy, minDim * 0.002, minDim * 0.002);
            }
          } else if (idx === 1) { // Velvet - soft stripes
            for (let i = 0; i < 8; i++) {
              const ly = zy + (i / 8) * gridSize;
              ctx.beginPath(); ctx.moveTo(zx, ly); ctx.lineTo(zx + gridSize, ly);
              ctx.strokeStyle = rgba(zoneColors[1], ELEMENT_ALPHA.tertiary.max * (active ? 2 : 0.5) * entrance);
              ctx.lineWidth = minDim * 0.002; ctx.stroke();
            }
          } else if (idx === 2) { // Glass - reflective highlights
            const gGrad = ctx.createLinearGradient(zx, zy, zx + gridSize, zy + gridSize);
            gGrad.addColorStop(0, rgba(zoneColors[2], 0));
            gGrad.addColorStop(0.5, rgba(zoneColors[2], ELEMENT_ALPHA.primary.max * (active ? 2 : 0.5) * entrance));
            gGrad.addColorStop(1, rgba(zoneColors[2], 0));
            ctx.fillStyle = gGrad;
            ctx.fillRect(zx, zy, gridSize, gridSize);
          } else { // Sand - stipple
            for (let i = 0; i < 50; i++) {
              const sx = zx + noiseSeed[i + 60] * gridSize;
              const sy = zy + noiseSeed[i + 110] * gridSize;
              ctx.fillStyle = rgba(zoneColors[3], ELEMENT_ALPHA.tertiary.max * (active ? 3 : 1) * entrance);
              ctx.fillRect(sx, sy, minDim * 0.001, minDim * 0.001);
            }
          }

          // Label
          const fs = Math.max(7, minDim * 0.011);
          ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
          ctx.fillStyle = rgba(zoneColors[idx], ELEMENT_ALPHA.text.min * (active ? 2 : 1) * entrance);
          ctx.fillText(TEXTURES[idx], zx + gridSize / 2, zy + gridSize + minDim * 0.02);
        }
      }

      // Touch indicator
      if (s.dragging && s.activeZone >= 0) {
        const trR = minDim * 0.02;
        const tGrad = ctx.createRadialGradient(s.touchX, s.touchY, 0, s.touchX, s.touchY, trR);
        tGrad.addColorStop(0, rgba(zoneColors[s.activeZone], EMPHASIS_ALPHA.accent.max * entrance));
        tGrad.addColorStop(1, rgba(zoneColors[s.activeZone], 0));
        ctx.fillStyle = tGrad;
        ctx.fillRect(s.touchX - trR, s.touchY - trR, trR * 2, trR * 2);
      }

      const fs2 = Math.max(8, minDim * 0.013);
      ctx.font = `${fs2}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('Drag across textures', cx, startY + totalW + minDim * 0.06);

      cbRef.current.onStateChange?.(s.activeZone >= 0 ? 0.5 : 0);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const getZone = (px: number, py: number) => {
      const minDim2 = Math.min(viewport.width, viewport.height);
      const gridSize = minDim2 * 0.14; const gap = minDim2 * 0.02;
      const totalW = gridSize * 2 + gap;
      const startX = viewport.width / 2 - totalW / 2;
      const startY = viewport.height / 2 - totalW / 2;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const zx = startX + col * (gridSize + gap);
          const zy = startY + row * (gridSize + gap);
          if (px >= zx && px <= zx + gridSize && py >= zy && py <= zy + gridSize) return row * 2 + col;
        }
      }
      return -1;
    };
    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      stateRef.current.touchX = px; stateRef.current.touchY = py;
      const zone = getZone(px, py);
      if (zone !== stateRef.current.activeZone && zone >= 0) cbRef.current.onHaptic('drag_snap');
      stateRef.current.activeZone = zone;
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; stateRef.current.activeZone = -1; canvas.releasePointerCapture(e.pointerId); };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}