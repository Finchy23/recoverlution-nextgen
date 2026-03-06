import { useEffect, useRef } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor,
  lerpColor,
  rgba,
  easeOutCubic,
  setupCanvas,
  advanceEntrance,
  drawAtmosphere,
  px,
  motionScale,
  type RGB,
} from '../atom-utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const OBJECT_POS = { x: 0.5, y: 0.66 };
const LIGHTS = [
  { x: 0.18, y: 0.24, falseLight: true },
  { x: 0.5, y: 0.12, falseLight: false },
  { x: 0.82, y: 0.24, falseLight: true },
  { x: 0.24, y: 0.78, falseLight: true },
  { x: 0.76, y: 0.78, falseLight: true },
] as const;
const HIT_R = 0.085;
const FLASH_DECAY = 0.028;

function fillPolygon(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: RGB,
  alpha: number,
) {
  if (alpha <= 0 || points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = rgba(color, alpha);
  ctx.fill();
}

export default function MultipleSourcesAtom({
  breathAmplitude,
  reducedMotion,
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
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    falseActive: [true, true, true, true] as boolean[],
    revealFlash: 0,
    completionFired: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const falseCount = s.falseActive.filter(Boolean).length;
      const clarity = easeOutCubic(1 - falseCount / 4);
      const chaos = 1 - clarity;
      const stageBoost = p.composed ? 1.18 : 1;
      s.revealFlash = Math.max(0, s.revealFlash - FLASH_DECAY * (p.reducedMotion ? 0.65 : 1));
      cb.onStateChange?.(clarity);

      if (falseCount === 0 && !s.completionFired) {
        s.completionFired = true;
        s.revealFlash = 1;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      const objectX = OBJECT_POS.x * w;
      const objectY = OBJECT_POS.y * h;
      const primary = s.primaryRgb;
      const accent = s.accentRgb;
      const field = lerpColor(primary, accent, 0.26);
      const falseColor = lerpColor(accent, [255, 196, 164], 0.3);
      const trueColor = lerpColor(primary, [244, 248, 255], 0.9);
      const objectGlow = lerpColor(primary, [234, 240, 255], 0.82);
      const threat = lerpColor([7, 8, 14], accent, 0.12);
      const denseShadow = lerpColor([4, 5, 9], primary, 0.06);

      const stage = ctx.createRadialGradient(objectX, objectY + minDim * 0.02, 0, objectX, objectY + minDim * 0.02, minDim * 0.58);
      stage.addColorStop(0, rgba(field, Math.min(0.18, (0.04 + chaos * 0.1 + clarity * 0.04) * entrance * stageBoost)));
      stage.addColorStop(0.62, rgba(field, Math.min(0.08, (0.018 + chaos * 0.03) * entrance * stageBoost)));
      stage.addColorStop(1, rgba(field, 0));
      ctx.fillStyle = stage;
      ctx.fillRect(objectX - minDim * 0.56, objectY - minDim * 0.44, minDim * 1.12, minDim * 0.98);

      const veil = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, minDim * 1.02);
      veil.addColorStop(0, rgba(threat, Math.min(0.34, (0.1 + chaos * 0.18) * entrance * stageBoost)));
      veil.addColorStop(0.55, rgba(denseShadow, Math.min(0.22, (0.06 + chaos * 0.12) * entrance * stageBoost)));
      veil.addColorStop(1, rgba(denseShadow, 0));
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, w, h);

      ctx.beginPath();
      ctx.ellipse(objectX, objectY + px(0.034, minDim), px(0.13 + chaos * 0.03, minDim), px(0.036 + chaos * 0.01, minDim), 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(denseShadow, Math.min(0.22, (0.08 + chaos * 0.08) * entrance * stageBoost));
      ctx.fill();

      let falseIndex = 0;
      for (let i = 0; i < LIGHTS.length; i++) {
        const light = LIGHTS[i];
        const isFalse = light.falseLight;
        const active = isFalse ? s.falseActive[falseIndex] : true;
        if (isFalse) falseIndex++;

        const lx = light.x * w;
        const ly = light.y * h;
        const dx = objectX - lx;
        const dy = objectY - ly;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const dirX = dx / dist;
        const dirY = dy / dist;
        const perpX = -dirY;
        const perpY = dirX;

        const shadowLength = px(isFalse ? 1.22 : 0.44, minDim);
        const nearWidth = px(isFalse ? 0.018 : 0.014, minDim);
        const farWidth = px(isFalse ? 0.26 : 0.06, minDim);
        const endX = objectX + dirX * shadowLength;
        const endY = objectY + dirY * shadowLength;

        const opacityBase = isFalse
          ? Math.min(0.22, (0.06 + (active ? 0.12 : 0)) * entrance * stageBoost)
          : Math.min(0.22, (0.08 + clarity * 0.08) * entrance * stageBoost);
        const opacityCore = isFalse
          ? Math.min(0.36, (0.12 + (active ? 0.18 : 0)) * entrance * stageBoost)
          : Math.min(0.44, (0.18 + clarity * 0.16) * entrance * stageBoost);

        fillPolygon(
          ctx,
          [
            [objectX + perpX * nearWidth, objectY + perpY * nearWidth],
            [endX + perpX * farWidth, endY + perpY * farWidth],
            [endX - perpX * farWidth, endY - perpY * farWidth],
            [objectX - perpX * nearWidth, objectY - perpY * nearWidth],
          ],
          isFalse ? falseColor : trueColor,
          active ? opacityBase : opacityBase * 0.08,
        );
        fillPolygon(
          ctx,
          [
            [objectX + perpX * nearWidth * 0.6, objectY + perpY * nearWidth * 0.6],
            [endX + perpX * farWidth * 0.52, endY + perpY * farWidth * 0.52],
            [endX - perpX * farWidth * 0.52, endY - perpY * farWidth * 0.52],
            [objectX - perpX * nearWidth * 0.6, objectY - perpY * nearWidth * 0.6],
          ],
          denseShadow,
          active ? opacityCore : opacityCore * 0.08,
        );

        const pulse = 0.5 + 0.5 * Math.sin(s.frameCount * (isFalse ? 0.08 + falseIndex * 0.01 : 0.04) * ms + i * 1.2);
        const glowR = px(isFalse ? 0.09 : 0.11, minDim);
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, glowR * 2.8);
        const lightColor = isFalse ? falseColor : trueColor;
        const lightAlpha = active
          ? isFalse
            ? Math.min(0.34, (0.12 + pulse * 0.1) * entrance * stageBoost)
            : Math.min(0.28, (0.12 + clarity * 0.08 + pulse * 0.03) * entrance * stageBoost)
          : 0.04 * entrance;
        glow.addColorStop(0, rgba(lightColor, lightAlpha));
        glow.addColorStop(1, rgba(lightColor, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(lx - glowR * 3, ly - glowR * 3, glowR * 6, glowR * 6);

        ctx.beginPath();
        ctx.arc(lx, ly, px(isFalse ? 0.03 : 0.034, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(lightColor, active ? Math.min(0.96, (0.34 + (isFalse ? pulse * 0.34 : clarity * 0.5)) * entrance * stageBoost) : 0.12 * entrance);
        ctx.fill();

        if (!isFalse) {
          ctx.beginPath();
          ctx.arc(lx, ly, px(0.058, minDim), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(trueColor, Math.min(0.16, (0.06 + clarity * 0.08) * entrance * stageBoost));
          ctx.lineWidth = px(0.0012, minDim);
          ctx.stroke();
        }
      }

      const objectGlowGrad = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, px(0.16, minDim));
      objectGlowGrad.addColorStop(0, rgba(objectGlow, Math.min(0.4, (0.06 + clarity * 0.22 + s.revealFlash * 0.14) * entrance * stageBoost)));
      objectGlowGrad.addColorStop(1, rgba(objectGlow, 0));
      ctx.fillStyle = objectGlowGrad;
      ctx.fillRect(objectX - minDim * 0.16, objectY - minDim * 0.16, minDim * 0.32, minDim * 0.32);
      ctx.beginPath();
      ctx.roundRect(objectX - px(0.022, minDim), objectY - px(0.052, minDim), px(0.044, minDim), px(0.09, minDim), px(0.012, minDim));
      ctx.fillStyle = rgba(objectGlow, Math.min(0.94, (0.18 + clarity * 0.72) * entrance * stageBoost));
      ctx.fill();

      if (s.revealFlash > 0.001 || clarity > 0.9) {
        const flashAlpha = (s.revealFlash * 0.24 + Math.max(0, clarity - 0.9) * 0.6) * entrance;
        const corona = ctx.createRadialGradient(objectX, objectY, 0, objectX, objectY, minDim * 0.28);
        corona.addColorStop(0, rgba(trueColor, flashAlpha));
        corona.addColorStop(1, rgba(trueColor, 0));
        ctx.fillStyle = corona;
        ctx.fillRect(objectX - minDim * 0.28, objectY - minDim * 0.28, minDim * 0.56, minDim * 0.56);
      }

      ctx.restore();
      animId = window.requestAnimationFrame(render);
    };

    animId = window.requestAnimationFrame(render);

    const getPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * viewport.width,
        y: ((e.clientY - rect.top) / rect.height) * viewport.height,
      };
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const p = getPoint(e);
      let falseIndex = 0;
      for (let i = 0; i < LIGHTS.length; i++) {
        const light = LIGHTS[i];
        if (!light.falseLight) continue;
        if (!s.falseActive[falseIndex]) {
          falseIndex++;
          continue;
        }
        const lx = light.x * viewport.width;
        const ly = light.y * viewport.height;
        const hit = Math.min(viewport.width, viewport.height) * HIT_R;
        if (Math.hypot(p.x - lx, p.y - ly) <= hit) {
          s.falseActive[falseIndex] = false;
          s.revealFlash = 0.6;
          callbacksRef.current.onHaptic(s.falseActive.some(Boolean) ? 'tap' : 'step_advance');
          break;
        }
        falseIndex++;
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => {
      window.cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
