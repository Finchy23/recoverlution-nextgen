/**
 * ATOM 091: THE ATMOSPHERE ENGINE
 * =================================
 * Series 10 — Reality Bender · Position 1
 *
 * Do not just enter the room. Happen to the room. You bring the
 * weather. Gesture velocity determines the weather system: slow
 * gentle strokes → warm sun; fast swipes → lightning storm.
 *
 * PHYSICS:
 *   - Gesture velocity analysis per frame
 *   - Slow (<2 px/f) → warm sun particles, golden glow
 *   - Medium (2-6) → rain particles falling, grey wash
 *   - Fast (>6) → lightning flash, sharp white particles
 *   - Ambient shift: background colour morphs with weather
 *   - No resolution — continuous mood instrument
 *
 * INTERACTION:
 *   Draw / swipe → generate weather based on velocity
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Tap cycles through 3 weather modes
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const SUN_COLOR: RGB = [240, 210, 130];
const RAIN_COLOR: RGB = [120, 140, 180];
const STORM_COLOR: RGB = [240, 240, 255];
const SKY_WARM: RGB = [60, 50, 35];
const SKY_GREY: RGB = [40, 42, 50];
const SKY_DARK: RGB = [20, 18, 30];
const BG_BASE: RGB = [18, 16, 24];

interface WeatherParticle { x: number; y: number; vx: number; vy: number; alpha: number; size: number; type: 'sun' | 'rain' | 'storm'; }

export default function AtmosphereWeatherAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<WeatherParticle[]>([]);
  const stateRef = useRef({
    entranceProgress: 0, isPointerDown: false,
    lastX: 0, lastY: 0, velocity: 0,
    weatherMode: 0, // 0=sun, 0.5=rain, 1=storm (smoothed)
    lightningFlash: 0, reducedIdx: 0,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      s.isPointerDown = true;
      s.lastX = (e.clientX - rect.left) / rect.width * w;
      s.lastY = (e.clientY - rect.top) / rect.height * h;
      if (propsRef.current.reducedMotion) {
        s.reducedIdx = (s.reducedIdx + 1) % 3;
        s.weatherMode = s.reducedIdx * 0.5;
        onHaptic('step_advance');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isPointerDown) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const dx = px - s.lastX, dy = py - s.lastY;
      s.velocity = Math.sqrt(dx * dx + dy * dy);
      s.lastX = px; s.lastY = py;
      const spread = minDim * 0.03;
      const ptSize = minDim * 0.003;
      const velLow = minDim * 0.004;
      const velHigh = minDim * 0.012;
      const type: WeatherParticle['type'] = s.velocity < velLow ? 'sun' : s.velocity < velHigh ? 'rain' : 'storm';
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: px + (Math.random() - 0.5) * spread,
          y: py + (Math.random() - 0.5) * spread,
          vx: type === 'sun' ? (Math.random() - 0.5) * minDim * 0.001 : dx * 0.1 + (Math.random() - 0.5) * minDim * 0.002,
          vy: type === 'rain' ? minDim * (0.004 + Math.random() * 0.006) : type === 'storm' ? (Math.random() - 0.5) * minDim * 0.008 : -Math.random() * minDim * 0.001,
          alpha: ELEMENT_ALPHA.primary.max,
          size: type === 'storm' ? ptSize * (0.6 + Math.random() * 0.4) : ptSize * (0.6 + Math.random() * 1),
          type,
        });
      }
      if (type === 'storm' && s.lightningFlash < 0.01) {
        s.lightningFlash = 0.08;
        onHaptic('drag_snap');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isPointerDown = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;

      // Smooth weather mode
      const velLow = minDim * 0.004;
      const velHigh = minDim * 0.012;
      const targetMode = s.velocity < velLow ? 0 : s.velocity < velHigh ? 0.5 : 1;
      if (!p.reducedMotion) s.weatherMode += (targetMode - s.weatherMode) * 0.05;

      s.lightningFlash *= 0.85;
      if (!s.isPointerDown) s.velocity *= 0.95;

      onStateChange?.(s.weatherMode);

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Sky background
      const skyCol = s.weatherMode < 0.33
        ? lerpColor(lerpColor(SKY_WARM, primaryRgb, 0.04), lerpColor(SKY_GREY, primaryRgb, 0.03), s.weatherMode * 3)
        : lerpColor(lerpColor(SKY_GREY, primaryRgb, 0.03), lerpColor(SKY_DARK, primaryRgb, 0.02), (s.weatherMode - 0.33) * 1.5);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(skyCol, ELEMENT_ALPHA.secondary.max * ent));
      bgGrad.addColorStop(0.6, rgba(skyCol, ELEMENT_ALPHA.secondary.max * ent * 0.5));
      bgGrad.addColorStop(1, rgba(skyCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03);
      ctx.fillRect(0, 0, w, h);

      // Lightning flash
      if (s.lightningFlash > 0.005) {
        ctx.fillStyle = rgba(lerpColor(STORM_COLOR, primaryRgb, 0.03), s.lightningFlash * ent);
        ctx.fillRect(0, 0, w, h);
      }

      // Update and draw particles
      const particles = particlesRef.current;
      const sunCol = lerpColor(SUN_COLOR, primaryRgb, 0.05);
      const rainCol = lerpColor(RAIN_COLOR, primaryRgb, 0.05);
      const stormCol = lerpColor(STORM_COLOR, primaryRgb, 0.04);

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx; pt.y += pt.vy;
        if (pt.type === 'sun') { pt.vy -= 0.01; pt.alpha *= 0.985; }
        else if (pt.type === 'rain') { pt.alpha *= 0.98; }
        else { pt.alpha *= 0.97; }

        if (pt.alpha < 0.005 || pt.y > h + minDim * 0.02 || pt.y < -minDim * 0.02 || pt.x < -minDim * 0.02 || pt.x > w + minDim * 0.02) {
          particles.splice(i, 1); continue;
        }

        const col = pt.type === 'sun' ? sunCol : pt.type === 'rain' ? rainCol : stormCol;
        ctx.fillStyle = rgba(col, pt.alpha * ent);
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.type === 'rain' ? pt.size * 3 : pt.size);
      }

      // Sun glow (when warm)
      if (s.weatherMode < 0.3) {
        const sunGlow = (0.3 - s.weatherMode) / 0.3;
        const gr = minDim * 0.15;
        const grad = ctx.createRadialGradient(cx, h * 0.2, 0, cx, h * 0.2, gr);
        grad.addColorStop(0, rgba(sunCol, ELEMENT_ALPHA.glow.max * ent * sunGlow * 0.3));
        grad.addColorStop(1, rgba(sunCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, h * 0.2, gr, 0, Math.PI * 2); ctx.fill();
      }

      // Instruction
      if (s.frame < 120) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(RAIN_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.6);
        ctx.fillText(p.reducedMotion ? 'tap to change the weather' : 'draw to bring the weather', cx, h * 0.92);
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'crosshair' }}
    />
  );
}