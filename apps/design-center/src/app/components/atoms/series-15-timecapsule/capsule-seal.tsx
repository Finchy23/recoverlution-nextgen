/**
 * ATOM 150: THE CAPSULE SEAL · Series 15 · Position 10
 * Drag 3 temporal rings into alignment. Deep grandfather clock strike.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance, ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale, type RGB } from '../atom-utils';

export default function CapsuleSealAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange, onResolve }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    rings: [0.3, 1.5, 3.0] as [number, number, number], // angle offsets
    dragging: -1, aligned: false, alignAnim: 0,
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
      const baseC = s.primaryRgb; const accentC = s.accentRgb;
      const goldC: RGB = lerpColor(accentC, [220, 190, 80], 0.4);

      if (s.aligned) s.alignAnim = Math.min(1, s.alignAnim + 0.015);
      const aa = easeOutCubic(s.alignAnim);

      // Check alignment
      if (!s.aligned) {
        const tolerance = 0.3;
        const allAligned = s.rings.every(r => {
          const norm = ((r % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          return norm < tolerance || norm > Math.PI * 2 - tolerance;
        });
        if (allAligned) { s.aligned = true; cb.onHaptic('seal_stamp'); }
      }

      // Background
      const ms = motionScale(p.reducedMotion);
      const glowR = minDim * (0.3 + p.breathAmplitude * 0.03 * ms + aa * 0.1) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(lerpColor(baseC, goldC, aa * 0.3), ELEMENT_ALPHA.glow.max * (1 + aa * 2) * entrance));
      bgGrad.addColorStop(1, rgba(baseC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 3 concentric rings
      const radii = [minDim * 0.06, minDim * 0.1, minDim * 0.14];
      const colors: RGB[] = [
        lerpColor(accentC, [255, 200, 80], 0.3),
        lerpColor(accentC, [200, 180, 100], 0.3),
        lerpColor(accentC, [160, 140, 80], 0.3),
      ];

      for (let i = 0; i < 3; i++) {
        const r = radii[i];
        const ringColor = colors[i];
        const angle = s.rings[i];

        // Ring arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, angle, angle + Math.PI * 1.5);
        ctx.strokeStyle = rgba(ringColor, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * (0.003 + aa * 0.002);
        ctx.stroke();

        // Notch marker
        const notchX = cx + Math.cos(angle) * r;
        const notchY = cy + Math.sin(angle) * r;
        ctx.beginPath(); ctx.arc(notchX, notchY, minDim * 0.006, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ringColor, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.fill();
      }

      // Alignment target (12 o'clock)
      ctx.beginPath();
      ctx.moveTo(cx, cy - radii[2] - minDim * 0.015);
      ctx.lineTo(cx - minDim * 0.005, cy - radii[2] - minDim * 0.005);
      ctx.lineTo(cx + minDim * 0.005, cy - radii[2] - minDim * 0.005);
      ctx.closePath();
      ctx.fillStyle = rgba(goldC, ELEMENT_ALPHA.primary.max * entrance);
      ctx.fill();

      // Center
      ctx.beginPath(); ctx.arc(cx, cy, minDim * 0.008, 0, Math.PI * 2);
      ctx.fillStyle = rgba(goldC, ELEMENT_ALPHA.primary.max * (1 + aa * 2) * entrance);
      ctx.fill();

      const fs = Math.max(8, minDim * 0.013);
      ctx.font = `${fs}px -apple-system, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      if (!s.aligned) ctx.fillText('Tap rings to align', cx, cy + radii[2] + minDim * 0.05);
      else if (aa > 0.5) ctx.fillText('Sealed.', cx, cy + radii[2] + minDim * 0.05);

      if (aa >= 1 && !s.completionFired) { s.completionFired = true; cb.onHaptic('completion'); cb.onResolve?.(); }
      cb.onStateChange?.(aa);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    const onDown = (e: PointerEvent) => {
      if (stateRef.current.aligned) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const cx2 = viewport.width / 2; const cy2 = viewport.height / 2;
      const dist = Math.sqrt((px - cx2) ** 2 + (py - cy2) ** 2);
      const minDim2 = Math.min(viewport.width, viewport.height);

      // Determine which ring was tapped and rotate it
      const radii = [minDim2 * 0.06, minDim2 * 0.1, minDim2 * 0.14];
      let closest = -1; let closestDist = Infinity;
      for (let i = 0; i < 3; i++) {
        const d = Math.abs(dist - radii[i]);
        if (d < closestDist && d < minDim2 * 0.03) { closestDist = d; closest = i; }
      }
      if (closest >= 0) {
        stateRef.current.rings[closest] = (stateRef.current.rings[closest] + Math.PI * 0.25) % (Math.PI * 2);
        cbRef.current.onHaptic('drag_snap');
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}