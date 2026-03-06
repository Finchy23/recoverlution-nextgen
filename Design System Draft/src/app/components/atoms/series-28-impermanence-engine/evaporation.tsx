/**
 * ATOM 272: THE EVAPORATION ENGINE
 * ===================================
 * Series 28 — Impermanence Engine · Position 2
 *
 * Grief is heavy liquid. Heat (awareness/touch) changes the
 * state of matter — liquid becomes weightless golden steam.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Liquid surface rendered as taut cloth membrane (tension grid)
 *   - Heat tears the membrane → particles escape upward through rips
 *   - Surface tension fibers stretch, thin, and snap under thermal load
 *   - Entropy arc: cohesive liquid → thermal agitation → peaceful steam
 *   - Cloth vertices simulate surface tension bonds between particles
 *
 * PHYSICS:
 *   - Dense liquid particle pool at bottom (80+ particles)
 *   - Surface tension membrane across top of liquid (cloth grid)
 *   - Hold = heat → membrane stretches, fibers thin, particles vibrate
 *   - Membrane tears → particles escape as buoyant golden steam
 *   - 8 render layers: atmosphere, liquid pool glow, surface membrane,
 *     liquid particles, rising steam, membrane tear glow, specular, progress
 *   - Breath couples to: steam drift speed, membrane flutter
 *
 * INTERACTION:
 *   Hold → heat liquid (hold_start → hold_threshold → completion)
 *
 * RENDER: Canvas 2D with tension membrane + phase-shifting particles
 * REDUCED MOTION: Static golden mist at top, clear bottom
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  easeOutCubic,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Number of liquid particles in the pool */
const LIQUID_COUNT = 90;
/** Number of steam particles that can exist simultaneously */
const STEAM_MAX = 100;
/** Surface membrane grid columns */
const MEMBRANE_COLS = 20;
/** Surface membrane vertical amplitude */
const MEMBRANE_WAVE_AMP = 0.008;
/** Heat accumulation rate per frame while holding */
const HEAT_RATE = 0.005;
/** Heat threshold for phase transition to begin */
const PHASE_THRESHOLD = 0.3;
/** Liquid-to-steam conversion rate above threshold */
const CONVERSION_RATE = 0.008;
/** Steam buoyancy (upward velocity per frame) */
const STEAM_BUOYANCY = 0.0015;
/** Steam expansion rate (size growth per frame) */
const STEAM_EXPAND = 0.0003;
/** Liquid pool top baseline (fraction of viewport height) */
const POOL_TOP = 0.55;
/** Liquid pool bottom */
const POOL_BOTTOM = 0.92;
/** Breath coupling to steam drift */
const BREATH_DRIFT = 0.006;
/** Number of membrane tear glow dots */
const TEAR_GLOW_COUNT = 12;
/** Specular highlight position offset */
const SPEC_OFFSET = 0.22;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface LiquidParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  /** 0=liquid, 1=fully steam */
  phase: number;
  hueShift: number;
}

interface SteamParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  life: number;
  opacity: number;
}

interface MembranePoint {
  x: number;
  restY: number;
  y: number;
  py: number;
  tension: number;
  torn: boolean;
}

// ═════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════

function createLiquidPool(): LiquidParticle[] {
  const particles: LiquidParticle[] = [];
  for (let i = 0; i < LIQUID_COUNT; i++) {
    particles.push({
      x: 0.1 + Math.random() * 0.8,
      y: POOL_TOP + Math.random() * (POOL_BOTTOM - POOL_TOP),
      vx: (Math.random() - 0.5) * 0.0005,
      vy: (Math.random() - 0.5) * 0.0003,
      size: 0.005 + Math.random() * 0.008,
      phase: 0,
      hueShift: Math.random() * 0.3,
    });
  }
  return particles;
}

function createMembrane(): MembranePoint[] {
  const points: MembranePoint[] = [];
  for (let i = 0; i <= MEMBRANE_COLS; i++) {
    const x = i / MEMBRANE_COLS;
    points.push({
      x,
      restY: POOL_TOP,
      y: POOL_TOP,
      py: POOL_TOP,
      tension: 1,
      torn: false,
    });
  }
  return points;
}

export default function EvaporationAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    heat: 0,
    holding: false,
    holdNotified: false,
    thresholdNotified: false,
    completed: false,
    evaporated: 0,
    liquid: createLiquidPool(),
    steam: [] as SteamParticle[],
    membrane: createMembrane(),
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
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0) * BREATH_DRIFT;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        s.evaporated = 1; s.completed = true;
      }
      if (p.phase === 'resolve') { s.evaporated = 1; }

      // ── Heat physics ───────────────────────────────────────────
      if (s.holding) {
        s.heat = Math.min(1, s.heat + HEAT_RATE * ms);
        if (s.heat > PHASE_THRESHOLD && !s.thresholdNotified) {
          s.thresholdNotified = true;
          cb.onHaptic('hold_threshold');
        }
      } else {
        s.heat = Math.max(0, s.heat - 0.003 * ms);
      }

      // Convert liquid to steam above threshold
      if (s.heat > PHASE_THRESHOLD && s.evaporated < 1) {
        s.evaporated = Math.min(1, s.evaporated + CONVERSION_RATE * (s.heat - PHASE_THRESHOLD) * ms);
        // Spawn steam from liquid particles transitioning
        if (s.frameCount % 2 === 0 && s.steam.length < STEAM_MAX) {
          const liq = s.liquid[Math.floor(Math.random() * s.liquid.length)];
          if (liq && liq.phase < 0.8) {
            liq.phase = Math.min(1, liq.phase + 0.05);
            s.steam.push({
              x: liq.x,
              y: liq.y,
              vx: (Math.random() - 0.5) * 0.001,
              vy: -STEAM_BUOYANCY * (0.5 + Math.random()),
              size: 0.006 + Math.random() * 0.01,
              life: 1,
              opacity: 0.6 + Math.random() * 0.4,
            });
          }
        }
        if (s.evaporated >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }
      cb.onStateChange?.(s.completed ? 1 : s.evaporated);

      // ── Update membrane physics ─────────────────────────────────
      for (const mp of s.membrane) {
        const wave = Math.sin(time * 2.5 + mp.x * Math.PI * 4) * MEMBRANE_WAVE_AMP;
        const heatBubble = s.heat * 0.015 * Math.sin(time * 5 + mp.x * 12);
        const breathWave = breath * Math.sin(time + mp.x * 6);
        const targetY = mp.restY + (1 - s.evaporated) * (wave + heatBubble + breathWave);
        const ny = mp.y * 2 - mp.py;
        mp.py = mp.y;
        mp.y = ny + (targetY - ny) * 0.3;
        mp.tension = Math.max(0, 1 - s.heat * 1.2 - s.evaporated * 0.5);
        if (s.heat > 0.6 && Math.random() < 0.002 * s.heat) mp.torn = true;
        if (s.evaporated > 0.8) mp.torn = true;
      }

      // ── Update liquid particles ─────────────────────────────────
      for (const liq of s.liquid) {
        if (liq.phase >= 1) continue;
        // Thermal agitation
        liq.vx += (Math.random() - 0.5) * 0.0001 * (1 + s.heat * 8) * ms;
        liq.vy += (Math.random() - 0.5) * 0.0001 * (1 + s.heat * 6) * ms;
        // Gravity keeps liquid down
        liq.vy += 0.00005 * (1 - liq.phase) * ms;
        // Damping
        liq.vx *= 0.97; liq.vy *= 0.97;
        liq.x += liq.vx * ms; liq.y += liq.vy * ms;
        // Bounds
        liq.x = Math.max(0.05, Math.min(0.95, liq.x));
        liq.y = Math.max(POOL_TOP * (1 - s.evaporated * 0.5), Math.min(POOL_BOTTOM, liq.y));
      }

      // ── Update steam particles ──────────────────────────────────
      for (let i = s.steam.length - 1; i >= 0; i--) {
        const st = s.steam[i];
        st.vy -= 0.00002 * ms; // buoyancy
        st.vx += breath * 0.1 * Math.sin(time + i);
        st.x += st.vx * ms; st.y += st.vy * ms;
        st.size += STEAM_EXPAND * ms;
        st.life -= 0.004 * ms;
        if (st.life <= 0 || st.y < -0.1) s.steam.splice(i, 1);
      }

      // ── 1. Liquid pool back-glow ────────────────────────────────
      const poolCy = (POOL_TOP + POOL_BOTTOM) * 0.5 * h;
      const poolR = px(0.35, minDim);
      const poolGlow = ctx.createRadialGradient(cx, poolCy, 0, cx, poolCy, poolR);
      const liquidAlpha = (1 - s.evaporated) * entrance;
      poolGlow.addColorStop(0, rgba(s.primaryRgb, 0.06 * liquidAlpha));
      poolGlow.addColorStop(0.4, rgba(s.primaryRgb, 0.03 * liquidAlpha));
      poolGlow.addColorStop(0.7, rgba(s.primaryRgb, 0.01 * liquidAlpha));
      poolGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = poolGlow;
      ctx.fillRect(0, poolCy - poolR, w, poolR * 2);

      // Heat shimmer beneath liquid
      if (s.heat > 0.1) {
        const heatR = px(0.25 + s.heat * 0.1, minDim);
        const heatG = ctx.createRadialGradient(cx, POOL_BOTTOM * h, 0, cx, POOL_BOTTOM * h, heatR);
        const warmCol: RGB = [Math.min(255, s.primaryRgb[0] + 40), s.primaryRgb[1], Math.max(0, s.primaryRgb[2] - 30)];
        heatG.addColorStop(0, rgba(warmCol, ALPHA.glow.max * 0.08 * s.heat * entrance));
        heatG.addColorStop(0.5, rgba(warmCol, ALPHA.glow.max * 0.03 * s.heat * entrance));
        heatG.addColorStop(1, rgba(warmCol, 0));
        ctx.fillStyle = heatG;
        ctx.fillRect(cx - heatR, POOL_BOTTOM * h - heatR, heatR * 2, heatR * 2);
      }

      // ── 2. Surface tension membrane ─────────────────────────────
      if (s.evaporated < 0.95) {
        ctx.beginPath();
        for (let i = 0; i <= MEMBRANE_COLS; i++) {
          const mp = s.membrane[i];
          if (mp.torn) continue;
          const mx = mp.x * w;
          const my = mp.y * h;
          if (i === 0) ctx.moveTo(mx, my);
          else ctx.lineTo(mx, my);
        }
        const membraneColor = lerpColor(s.primaryRgb, s.accentRgb, s.heat * 0.4);
        ctx.strokeStyle = rgba(membraneColor, ALPHA.content.max * 0.18 * (1 - s.evaporated) * entrance);
        ctx.lineWidth = px(STROKE.light, minDim) * (0.5 + s.membrane[0].tension * 0.5);
        ctx.stroke();

        // Membrane fiber stress dots
        for (const mp of s.membrane) {
          if (mp.torn) continue;
          const mx = mp.x * w;
          const my = mp.y * h;
          const stress = 1 - mp.tension;
          if (stress > 0.3) {
            const dotR = px(0.003 + stress * 0.004, minDim);
            const dotG = ctx.createRadialGradient(mx, my, 0, mx, my, dotR);
            dotG.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * stress * entrance));
            dotG.addColorStop(1, rgba(s.accentRgb, 0));
            ctx.fillStyle = dotG;
            ctx.fillRect(mx - dotR, my - dotR, dotR * 2, dotR * 2);
          }
        }

        // Vertical fiber threads (weft)
        for (let i = 0; i < MEMBRANE_COLS; i += 3) {
          const mp = s.membrane[i];
          if (mp.torn) continue;
          const mx = mp.x * w;
          const topY = mp.y * h;
          const botY = topY + px(0.04 * (1 - s.evaporated), minDim);
          ctx.beginPath();
          ctx.moveTo(mx, topY);
          ctx.lineTo(mx, botY);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * mp.tension * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ── 3. Liquid particles ─────────────────────────────────────
      for (const liq of s.liquid) {
        if (liq.phase >= 1) continue;
        const lx = liq.x * w;
        const ly = liq.y * h;
        const lr = px(liq.size * (1 - liq.phase * 0.3), minDim);
        const lAlpha = (1 - liq.phase) * ALPHA.content.max * 0.25 * entrance;
        const lCol = lerpColor(s.primaryRgb, s.accentRgb, liq.hueShift + s.heat * 0.3);
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        lg.addColorStop(0, rgba(lCol, lAlpha));
        lg.addColorStop(0.5, rgba(lCol, lAlpha * 0.5));
        lg.addColorStop(1, rgba(lCol, 0));
        ctx.fillStyle = lg;
        ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
      }

      // ── 4. Rising steam particles ───────────────────────────────
      for (const st of s.steam) {
        const sx = st.x * w;
        const sy = st.y * h;
        const sr = px(st.size, minDim);
        const sAlpha = ALPHA.content.max * 0.12 * st.life * st.opacity * entrance;
        const steamCol: RGB = [
          Math.min(255, s.primaryRgb[0] + 50 * st.life),
          Math.min(255, s.primaryRgb[1] + 30 * st.life),
          Math.min(255, s.primaryRgb[2] + 10),
        ];
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        sg.addColorStop(0, rgba(steamCol, sAlpha));
        sg.addColorStop(0.35, rgba(steamCol, sAlpha * 0.5));
        sg.addColorStop(0.7, rgba(steamCol, sAlpha * 0.15));
        sg.addColorStop(1, rgba(steamCol, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      }

      // ── 5. Golden completion haze at top ────────────────────────
      if (s.evaporated > 0.3) {
        const hazeH = h * 0.45 * s.evaporated;
        const hazeG = ctx.createLinearGradient(0, 0, 0, hazeH);
        const goldCol: RGB = [
          Math.min(255, s.primaryRgb[0] + 40),
          Math.min(255, s.primaryRgb[1] + 20),
          s.primaryRgb[2],
        ];
        hazeG.addColorStop(0, rgba(goldCol, ALPHA.atmosphere.max * 0.06 * s.evaporated * entrance));
        hazeG.addColorStop(0.5, rgba(goldCol, ALPHA.atmosphere.max * 0.03 * s.evaporated * entrance));
        hazeG.addColorStop(1, rgba(goldCol, 0));
        ctx.fillStyle = hazeG;
        ctx.fillRect(0, 0, w, hazeH);
      }

      // ── 6. Specular on liquid surface ───────────────────────────
      if (s.evaporated < 0.8) {
        const surfaceY = POOL_TOP * h * (1 + s.evaporated * 0.1);
        const specX = cx - px(0.05, minDim);
        const specR = px(0.025, minDim);
        const specG = ctx.createRadialGradient(specX, surfaceY, 0, specX, surfaceY, specR);
        specG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.14 * (1 - s.evaporated) * entrance));
        specG.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.04 * entrance));
        specG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
        ctx.fillStyle = specG;
        ctx.fillRect(specX - specR, surfaceY - specR, specR * 2, specR * 2);
      }

      // ── 7. Heat indicator ring ──────────────────────────────────
      if (s.holding && s.heat > 0.05) {
        const heatArc = s.heat * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, POOL_BOTTOM * h, px(0.04, minDim), -Math.PI / 2, -Math.PI / 2 + heatArc);
        const hRingCol = s.heat > PHASE_THRESHOLD ? s.accentRgb : s.primaryRgb;
        ctx.strokeStyle = rgba(hRingCol, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();
      }

      // ── 8. Completion radiance ──────────────────────────────────
      if (s.completed) {
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.04 + i * 0.33) % 1;
          const rY = h * 0.2;
          const rR = px(0.08 + rPhase * 0.25, minDim);
          ctx.beginPath();
          ctx.arc(cx, rY, rR, 0, Math.PI * 2);
          const rAlpha = ALPHA.content.max * 0.04 * (1 - rPhase) * entrance;
          ctx.strokeStyle = rgba(s.primaryRgb, rAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      s.holding = true;
      if (!s.holdNotified) {
        s.holdNotified = true;
        callbacksRef.current.onHaptic('hold_start');
      }
    };
    const onUp = () => { stateRef.current.holding = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
