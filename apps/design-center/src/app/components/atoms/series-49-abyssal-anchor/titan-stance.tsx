import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import { advanceEntrance, drawAtmosphere, easeOutCubic, lerpColor, parseColor, px, rgba, roundedRect, setupCanvas } from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const STEP_T = 0.48;
const COMPLETE_T = 0.985;

type Impact = { x: number; width: number; delay: number; kind: 'block' | 'shadow' };

export default function TitanStanceAtom({
  breathAmplitude,
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
  const propsRef = useRef({ breathAmplitude, color, accentColor, phase, composed });
  const impactsRef = useRef<Impact[]>([]);
  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    progress: 0,
    thresholdFired: false,
    completionFired: false,
    lastImpactIndex: -1,
  });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onResolve, onStateChange]);
  useEffect(() => {
    propsRef.current = { breathAmplitude, color, accentColor, phase, composed };
  }, [breathAmplitude, color, accentColor, phase, composed]);
  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);
  useEffect(() => {
    impactsRef.current = Array.from({ length: 7 }, (_, i) => ({
      x: 0.18 + (i % 4) * 0.18,
      width: 0.08 + (i % 3) * 0.05,
      delay: i * 360,
      kind: i % 2 === 0 ? 'block' : 'shadow',
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, h * 0.82, w, h, minDim, s.primaryRgb, entrance);

      s.progress = clamp(s.progress + (p.phase === 'resolve' ? 0.012 : 0.009), 0, 1);
      const reveal = easeOutCubic(s.progress);
      cb.onStateChange?.(reveal);
      if (reveal >= STEP_T && !s.thresholdFired) {
        s.thresholdFired = true;
        cb.onHaptic('step_advance');
      }
      if (reveal >= COMPLETE_T && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('seal_stamp');
        cb.onResolve?.();
      }

      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const deep = lerpColor([4, 6, 12], primary, 0.14);
      const bedrock = lerpColor([98, 110, 126], accent, 0.28);
      const node = lerpColor(primary, [246, 248, 255], 0.94);
      const dust = lerpColor(accent, [255, 216, 186], 0.72);

      ctx.fillStyle = rgba(deep, 0.95 * entrance);
      ctx.fillRect(0, 0, w, h);

      const bedrockY = h * 0.84;
      ctx.fillStyle = rgba(bedrock, (0.18 + reveal * 0.28) * entrance);
      ctx.fillRect(0, bedrockY, w, h - bedrockY);

      const now = performance.now();
      for (let i = 0; i < impactsRef.current.length; i += 1) {
        const impact = impactsRef.current[i];
        const local = clamp((now - impact.delay) / 1300, 0, 1);
        if (local <= 0 || local >= 1) continue;
        const x = w * impact.x;
        const fallY = h * (0.08 + local * 0.72);
        const impactP = clamp((local - 0.72) / 0.28, 0, 1);
        if (impactP > 0 && s.lastImpactIndex < i) {
          s.lastImpactIndex = i;
          cb.onHaptic('entrance_land');
        }

        if (impact.kind === 'block') {
          roundedRect(ctx, x - minDim * impact.width * 0.5, fallY - minDim * 0.07, minDim * impact.width, minDim * 0.12, minDim * 0.02);
          ctx.fillStyle = rgba(lerpColor(bedrock, node, 0.18), (0.18 + (1 - impactP) * 0.3) * entrance);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(x, fallY, minDim * impact.width * 0.65, minDim * 0.09, 0, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor([0, 0, 0], primary, 0.12), (0.12 + (1 - impactP) * 0.28) * entrance);
          ctx.fill();
        }

        if (impactP > 0) {
          for (let d = 0; d < 7; d += 1) {
            const angle = (d / 7) * Math.PI - Math.PI * 0.5;
            const len = minDim * (0.05 + impactP * 0.05);
            ctx.beginPath();
            ctx.moveTo(x, bedrockY);
            ctx.lineTo(x + Math.cos(angle) * len, bedrockY - Math.sin(angle) * len * 0.45);
            ctx.strokeStyle = rgba(dust, (1 - impactP) * 0.34 * entrance);
            ctx.lineWidth = px(0.0028, minDim);
            ctx.stroke();
          }
        }
      }

      const nodeY = bedrockY - minDim * 0.045;
      const radius = minDim * (0.04 + breathAmplitude * 0.002);
      const glow = ctx.createRadialGradient(cx, nodeY, 0, cx, nodeY, minDim * 0.32);
      glow.addColorStop(0, rgba(dust, (0.08 + reveal * 0.24) * entrance));
      glow.addColorStop(1, rgba(dust, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(cx - minDim * 0.32, nodeY - minDim * 0.32, minDim * 0.64, minDim * 0.64);

      ctx.beginPath();
      ctx.arc(cx, nodeY, radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(node, (0.22 + reveal * 0.66) * entrance);
      ctx.fill();

      ctx.restore();
      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(raf);
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
