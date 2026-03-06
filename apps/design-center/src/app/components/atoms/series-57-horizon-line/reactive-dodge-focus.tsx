import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function ReactiveDodgeFocusAtom({
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
  const holdRef = useRef<{ active: boolean; startedAt: number }>({ active: false, startedAt: 0 });
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    focus: 0,
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

    const debris = Array.from({ length: 11 }, (_, i) => ({
      x: 0.16 + ((i * 0.077) % 0.68),
      y: -0.2 - i * 0.12,
      speed: 0.22 + (i % 4) * 0.05,
      size: 0.02 + (i % 3) * 0.008,
    }));

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.6, w, h, minDim, s.primaryRgb, entrance);

      if (holdRef.current.active) {
        s.focus = clamp(s.focus + dt * 0.52, 0, 1);
      } else {
        s.focus = clamp(s.focus - dt * 0.18, 0, 1);
      }
      const resolve = easeOutCubic(s.focus);
      cb.onStateChange?.(resolve);
      if (resolve >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const bg = lerpColor([12, 12, 18], s.primaryRgb, 0.14);
      const debrisColor = lerpColor([238, 108, 108], s.accentRgb, 0.18);
      const horizon = lerpColor([248, 235, 194], s.accentRgb, 0.3);
      const focusNode = lerpColor([198, 220, 255], s.primaryRgb, 0.36);
      ctx.fillStyle = rgba(bg, 0.97 * entrance);
      ctx.fillRect(0, 0, w, h);

      const zoom = 1 + resolve * 0.42;
      const horizonY = h * (0.2 - resolve * 0.05);
      ctx.strokeStyle = rgba(horizon, (0.24 + resolve * 0.6) * entrance);
      ctx.lineWidth = px(0.006, minDim);
      ctx.beginPath();
      ctx.moveTo(w * 0.18, horizonY);
      ctx.lineTo(w * 0.82, horizonY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, horizonY, minDim * (0.028 + resolve * 0.012), 0, Math.PI * 2);
      ctx.fillStyle = rgba(focusNode, (0.5 + resolve * 0.35) * entrance);
      ctx.fill();

      for (const d of debris) {
        d.y += d.speed * dt * (1 - resolve * 0.72);
        if (d.y > 1.1) d.y = -0.18;
        const blur = 1 - resolve;
        const x = w * d.x;
        const y = h * d.y;
        const sz = minDim * d.size * zoom;
        ctx.fillStyle = rgba(debrisColor, (0.32 + blur * 0.4) * entrance * blur);
        ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz * (1.3 - blur * 0.4));
      }

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    const getLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const pt = getLocal(e);
      if (pt.y > viewport.height * 0.34) {
        callbacksRef.current.onHaptic('error_boundary');
        return;
      }
      holdRef.current = { active: true, startedAt: performance.now() };
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      holdRef.current.active = false;
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
