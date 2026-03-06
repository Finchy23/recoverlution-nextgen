/**
 * ATOM 351: THE FLINT STRIKE ENGINE
 * ===================================
 * Series 36 — Friction Spark · Position 1
 *
 * Cure waiting for inspiration to magically appear.
 * Violent repeated friction on the flint generates the spark yourself.
 *
 * PHYSICS:
 *   - Cold heavy dark block of digital flint fills lower third
 *   - User violently swipes back and forth across it
 *   - UI resists with visual drag, embers fly from contact
 *   - At 100% heat threshold flint catches fire
 *   - Explosion into sustained screen-filling light
 *
 * INTERACTION: Rapid horizontal swipes on the flint block
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════
const FLINT_WIDTH = 0.6;
const FLINT_HEIGHT = 0.2;
const FLINT_Y = 0.65;
const HEAT_PER_SWIPE = 0.06;
const HEAT_DECAY = 0.001;
const IGNITION_THRESHOLD = 1.0;
const MAX_EMBERS = 40;
const EMBER_SPAWN_PER_SWIPE = 6;

interface Ember {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number;
}

export default function FlintStrikeAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    heat: 0, ignited: false, igniteAnim: 0, completed: false,
    embers: [] as Ember[],
    swiping: false, lastX: 0, lastDir: 0,
    flameParticles: [] as { x: number; y: number; vy: number; life: number; r: number }[],
    screenFlash: 0,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const spawnEmbers = (x: number) => {
      const s = stateRef.current;
      for (let i = 0; i < EMBER_SPAWN_PER_SWIPE; i++) {
        if (s.embers.length >= MAX_EMBERS) s.embers.shift();
        s.embers.push({
          x, y: FLINT_Y - 0.01,
          vx: (Math.random() - 0.5) * 0.008,
          vy: -(0.003 + Math.random() * 0.008),
          life: 1, maxLife: 0.5 + Math.random() * 0.5,
          size: 0.002 + Math.random() * 0.004,
        });
      }
    };

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve' && !s.ignited) s.heat = 1;

      // ── Heat decay ───────────────────────────��──────
      if (!s.ignited) s.heat = Math.max(0, s.heat - HEAT_DECAY * ms);

      // ── Ignition check ──────────────────────────────
      if (s.heat >= IGNITION_THRESHOLD && !s.ignited) {
        s.ignited = true; s.screenFlash = 1;
        cb.onHaptic('completion');
        // Spawn flame particles
        for (let i = 0; i < 30; i++) {
          s.flameParticles.push({
            x: 0.3 + Math.random() * 0.4,
            y: FLINT_Y - Math.random() * 0.1,
            vy: -(0.002 + Math.random() * 0.006),
            life: 1, r: 0.01 + Math.random() * 0.03,
          });
        }
      }
      if (s.ignited) s.igniteAnim = Math.min(1, s.igniteAnim + 0.008 * ms);
      cb.onStateChange?.(s.ignited ? 0.5 + s.igniteAnim * 0.5 : s.heat * 0.5);

      // ── Screen flash on ignition ────────────────────
      if (s.screenFlash > 0) {
        s.screenFlash = Math.max(0, s.screenFlash - 0.03);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * s.screenFlash * 0.3 * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Draw flint block ────────────────────────────
      const flintW = minDim * FLINT_WIDTH;
      const flintH = minDim * FLINT_HEIGHT;
      const flintX = cx - flintW / 2;
      const flintY = FLINT_Y * h;

      // Flint shadow
      const shadowGrad = ctx.createRadialGradient(cx, flintY + flintH * 0.6, 0, cx, flintY + flintH * 0.6, flintW * 0.8);
      shadowGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.15 * entrance));
      shadowGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(cx - flintW * 0.8, flintY - flintH * 0.2, flintW * 1.6, flintH * 1.8);

      // Heat glow on flint surface
      if (s.heat > 0.1) {
        const heatGrad = ctx.createLinearGradient(flintX, flintY, flintX, flintY + flintH);
        heatGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * s.heat * 0.4 * entrance));
        heatGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = heatGrad;
        ctx.fillRect(flintX, flintY, flintW, flintH);
      }

      // Flint body — massive dark slab
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (s.ignited ? 0.2 : 0.35) * entrance);
      ctx.fillRect(flintX, flintY, flintW, flintH);

      // Flint texture — rough horizontal striations
      for (let i = 0; i < 8; i++) {
        const ty = flintY + (i / 8) * flintH;
        ctx.beginPath(); ctx.moveTo(flintX, ty); ctx.lineTo(flintX + flintW, ty);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance);
        ctx.lineWidth = px(0.0004, minDim); ctx.stroke();
      }

      // ── Embers ──────────────────────────────────────
      for (let i = s.embers.length - 1; i >= 0; i--) {
        const e = s.embers[i];
        e.x += e.vx * ms; e.y += e.vy * ms; e.vy += 0.0001 * ms;
        e.life -= (1 / (60 * e.maxLife));
        if (e.life <= 0) { s.embers.splice(i, 1); continue; }
        const eR = px(e.size * e.life, minDim);
        const eGlow = px(e.size * 3, minDim);
        // Ember glow
        const eg = ctx.createRadialGradient(e.x * w, e.y * h, 0, e.x * w, e.y * h, eGlow);
        eg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.6 * e.life * entrance));
        eg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = eg; ctx.fillRect(e.x * w - eGlow, e.y * h - eGlow, eGlow * 2, eGlow * 2);
        // Ember core
        ctx.beginPath(); ctx.arc(e.x * w, e.y * h, eR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * e.life * entrance); ctx.fill();
      }

      // ── Flame (post-ignition) ───────────────────────
      if (s.ignited) {
        for (let i = s.flameParticles.length - 1; i >= 0; i--) {
          const f = s.flameParticles[i];
          f.y += f.vy * ms; f.life -= 0.003;
          f.x += Math.sin(s.frameCount * 0.05 + i) * 0.001;
          if (f.life <= 0) { s.flameParticles.splice(i, 1); continue; }
          // Replenish
          if (s.flameParticles.length < 25 && Math.random() < 0.1) {
            s.flameParticles.push({
              x: 0.3 + Math.random() * 0.4, y: FLINT_Y - Math.random() * 0.05,
              vy: -(0.001 + Math.random() * 0.004), life: 1, r: 0.01 + Math.random() * 0.025,
            });
          }
          const fR = px(f.r * f.life, minDim);
          const fGlowR = fR * 4;
          const fg = ctx.createRadialGradient(f.x * w, f.y * h, 0, f.x * w, f.y * h, fGlowR);
          fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * f.life * s.igniteAnim * entrance));
          fg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * f.life * s.igniteAnim * entrance));
          fg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = fg; ctx.fillRect(f.x * w - fGlowR, f.y * h - fGlowR, fGlowR * 2, fGlowR * 2);
        }

        // Rising light pillar
        const pillarAlpha = s.igniteAnim * 0.15;
        const pillarGrad = ctx.createLinearGradient(cx, h, cx, 0);
        pillarGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * pillarAlpha * entrance));
        pillarGrad.addColorStop(0.4, rgba(s.primaryRgb, ALPHA.glow.min * pillarAlpha * entrance));
        pillarGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pillarGrad;
        ctx.fillRect(cx - minDim * 0.15, 0, minDim * 0.3, h);
      }

      // ── Heat bar ────────────────────────────────────
      if (!s.ignited && s.heat > 0.02) {
        const barW = px(0.003, minDim);
        const barMaxH = minDim * 0.15;
        const barH = barMaxH * s.heat;
        const barX = flintX - minDim * 0.04;
        const barY = flintY + flintH - barH;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * s.heat * entrance);
        ctx.fillRect(barX, barY, barW, barH);
        // Bar glow
        const bg = ctx.createRadialGradient(barX, barY, 0, barX, barY, barW * 6);
        bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * s.heat * entrance));
        bg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bg; ctx.fillRect(barX - barW * 6, barY - barW * 6, barW * 12, barH + barW * 12);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ──────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.ignited) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (my >= FLINT_Y - 0.05 && my <= FLINT_Y + FLINT_HEIGHT + 0.05) {
        s.swiping = true; s.lastX = e.clientX; s.lastDir = 0;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.swiping || s.ignited) return;
      const dx = e.clientX - s.lastX;
      const dir = dx > 0 ? 1 : -1;
      if (Math.abs(dx) > 15 && dir !== s.lastDir) {
        // Direction change = friction strike
        s.heat = Math.min(IGNITION_THRESHOLD, s.heat + HEAT_PER_SWIPE);
        s.lastDir = dir; s.lastX = e.clientX;
        callbacksRef.current.onHaptic('swipe_commit');
        const rect = canvas.getBoundingClientRect();
        spawnEmbers((e.clientX - rect.left) / rect.width);
      }
    };
    const onUp = () => { stateRef.current.swiping = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
