import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function ExhaleReleaseAtom({
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ color, accentColor, phase, composed });
  const holdRef = useRef(false);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    freeze: 0,
    release: 0,
    completionFired: false,
  });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { color, accentColor, phase, composed }; }, [color, accentColor, phase, composed]);
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const particles = Array.from({ length: 36 }, (_, i) => ({
      x: 0.14 + ((i * 0.071) % 0.72),
      y: 0.2 + ((i * 0.097) % 0.46),
      dx: ((i % 5) - 2) * 0.008,
      dy: ((i % 7) - 3) * 0.007,
    }));

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (holdRef.current) s.freeze = clamp(s.freeze + dt * 0.45, 0, 1);
      else if (s.freeze > 0.45) s.release = clamp(s.release + dt * 0.52, 0, 1);
      const resolve = easeOutCubic(s.release);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([10, 12, 16], s.primaryRgb, 0.16);
      const particle = lerpColor([210, 226, 255], s.primaryRgb, 0.28);
      const pulse = lerpColor([248, 214, 166], s.accentRgb, 0.34);
      ctx.fillStyle = rgba(bg, 0.98 * entrance);
      ctx.fillRect(0, 0, w, h);

      for (const pt of particles) {
        if (!holdRef.current) {
          pt.x += pt.dx * (0.4 + resolve * 2.2);
          pt.y += pt.dy * (0.4 + resolve * 2.2);
          if (pt.x < 0.1 || pt.x > 0.9) pt.dx *= -1;
          if (pt.y < 0.16 || pt.y > 0.82) pt.dy *= -1;
        }
        ctx.beginPath();
        ctx.arc(w * pt.x, h * pt.y, minDim * (0.008 + s.freeze * 0.004), 0, Math.PI * 2);
        ctx.fillStyle = rgba(resolve > 0 ? pulse : particle, (0.14 + (1 - s.freeze) * 0.26 + resolve * 0.22) * entrance);
        ctx.fill();
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      holdRef.current = true;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      holdRef.current = false;
      callbacksRef.current.onHaptic('hold_release');
      canvas.releasePointerCapture(e.pointerId);
    };

    raf = window.requestAnimationFrame(render);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return <div style={{ position: 'absolute', inset: 0 }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }} /></div>;
}
