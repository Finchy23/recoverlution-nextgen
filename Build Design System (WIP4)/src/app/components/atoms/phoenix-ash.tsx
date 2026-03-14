/**
 * ATOM: PHOENIX ASH — Shadow Transmutation
 * Series 9 — Shadow Crucible · Particulate transformation
 *
 * Dark ash particles drift downward. Breath transforms them —
 * each exhale converts ash to luminous ember particles that
 * float upward. Hold to ignite a localized transmutation field.
 *
 * INTERACTION: Breath (transmutation) · Hold (ignition)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB, ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';

const ASH_COUNT = 160;

interface AshParticle {
  x: number; y: number; vx: number; vy: number;
  size: number; phase: number;
  transmuted: number; // 0 = ash, 1 = ember
  brightness: number;
}

const ASH_COLOR: RGB = [45, 38, 35];
const EMBER_COLOR: RGB = [220, 120, 50];
const EMBER_GLOW: RGB = [255, 180, 80];

function createAsh(w: number, h: number): AshParticle[] {
  return Array.from({ length: ASH_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.2,
    vy: 0.1 + Math.random() * 0.3, // Ash falls
    size: 0.8 + Math.random() * 2.5,
    phase: Math.random() * Math.PI * 2,
    transmuted: 0,
    brightness: 0.2 + Math.random() * 0.6,
  }));
}

export default function PhoenixAshAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    particles: [] as AshParticle[],
    isHolding: false, holdX: 0, holdY: 0, holdStrength: 0,
    prevBreath: 0, totalTransmuted: 0,
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = viewport.width, h = viewport.height, s = stateRef.current;
    const minDim = Math.min(w, h);

    if (!s.initialized) { s.particles = createAsh(w, h); s.initialized = true; }

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isHolding = true; s.holdX = (e.clientX - rect.left) / rect.width * w; s.holdY = (e.clientY - rect.top) / rect.height * h;
      cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (s.isHolding) { s.holdX = (e.clientX - rect.left) / rect.width * w; s.holdY = (e.clientY - rect.top) / rect.height * h; }
    };
    const onUp = (e: PointerEvent) => { s.isHolding = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const igniteRadius = minDim * 0.2;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h); s.frameCount++;

      if (s.entranceProgress < 1) s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      const entrance = easeOutExpo(s.entranceProgress);

      // Hold ignition ramp
      if (s.isHolding) s.holdStrength = Math.min(1, s.holdStrength + 0.012);
      else s.holdStrength = Math.max(0, s.holdStrength - 0.02);

      // Breath-driven transmutation: rising breath transmutes nearby ash
      const breathRising = p.breathAmplitude > s.prevBreath + 0.01;
      s.prevBreath = p.breathAmplitude;

      let totalT = 0;

      for (const pt of s.particles) {
        const spdMult = p.reducedMotion ? 0.3 : 1;

        // Transmutation force from hold
        if (s.holdStrength > 0.1) {
          const dx = s.holdX - pt.x, dy = s.holdY - pt.y;
          const dist = Math.hypot(dx, dy);
          if (dist < igniteRadius) {
            const force = (1 - dist / igniteRadius) * s.holdStrength;
            pt.transmuted = Math.min(1, pt.transmuted + force * 0.015);
          }
        }

        // Breath transmutation
        if (breathRising && p.breathAmplitude > 0.4) {
          pt.transmuted = Math.min(1, pt.transmuted + p.breathAmplitude * 0.003);
        }

        // Physics — ash falls, ember rises
        const fallSpeed = (1 - pt.transmuted) * 0.3;
        const riseSpeed = pt.transmuted * -0.4;
        pt.vy += ((fallSpeed + riseSpeed) - pt.vy) * 0.03 * spdMult;
        pt.vx += (Math.random() - 0.5) * 0.02 * spdMult;
        pt.vx *= 0.98; pt.vy *= 0.99;
        pt.x += pt.vx; pt.y += pt.vy;

        // Shimmer
        pt.phase += 0.02 + pt.transmuted * 0.03;

        // Wrap
        if (pt.y > h + 10) { pt.y = -10; pt.x = Math.random() * w; pt.transmuted *= 0.5; }
        if (pt.y < -10) { pt.y = h + 10; pt.x = Math.random() * w; pt.transmuted *= 0.8; }
        if (pt.x < -10) pt.x = w + 10;
        if (pt.x > w + 10) pt.x = -10;

        totalT += pt.transmuted;
      }

      s.totalTransmuted = totalT / ASH_COUNT;
      cb.onStateChange?.(s.totalTransmuted);

      // Background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.5);
      bgGrad.addColorStop(0, rgba(lerpColor([8, 5, 4], s.primaryRgb, 0.02), entrance * 0.03));
      bgGrad.addColorStop(1, rgba([3, 2, 2], 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Ignition field glow
      if (s.holdStrength > 0.05) {
        const igGrad = ctx.createRadialGradient(s.holdX, s.holdY, 0, s.holdX, s.holdY, igniteRadius);
        igGrad.addColorStop(0, rgba(lerpColor(EMBER_COLOR, s.accentRgb, 0.2), s.holdStrength * 0.04 * entrance));
        igGrad.addColorStop(0.5, rgba(EMBER_COLOR, s.holdStrength * 0.01 * entrance));
        igGrad.addColorStop(1, rgba(EMBER_COLOR, 0));
        ctx.fillStyle = igGrad; ctx.fillRect(s.holdX - igniteRadius, s.holdY - igniteRadius, igniteRadius * 2, igniteRadius * 2);
      }

      // Particles
      for (const pt of s.particles) {
        const shimmer = p.reducedMotion ? 0.8 : 0.6 + 0.4 * Math.sin(pt.phase);
        const t = pt.transmuted;
        const pColor = lerpColor(lerpColor(ASH_COLOR, s.primaryRgb, 0.05), lerpColor(EMBER_COLOR, s.accentRgb, 0.15), t);
        const alpha = pt.brightness * shimmer * entrance * (0.06 + t * 0.4);
        if (alpha < 0.003) continue;

        // Ember glow
        if (t > 0.3) {
          const glowR = pt.size * (3 + t * 4);
          const gGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, glowR);
          gGrad.addColorStop(0, rgba(lerpColor(EMBER_GLOW, s.accentRgb, 0.1), alpha * 0.15 * t));
          gGrad.addColorStop(1, rgba(EMBER_GLOW, 0));
          ctx.fillStyle = gGrad; ctx.fillRect(pt.x - glowR, pt.y - glowR, glowR * 2, glowR * 2);
        }

        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size * (0.6 + t * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, alpha); ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}
