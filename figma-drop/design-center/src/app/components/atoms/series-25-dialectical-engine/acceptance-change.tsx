/**
 * ATOM 247: THE ACCEPTANCE/CHANGE ENGINE
 * ========================================
 * Series 25 — Dialectical Engine · Position 7
 *
 * Pull the spring to exactly 50% tension. Pure acceptance droops limp;
 * pure change tears apart. The sweet spot sings — a beautiful helical
 * spring finding its resonant frequency.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - The spring coils emit standing waves along their length
 *   - At resonant tension (50%), constructive interference creates
 *     bright fringe bands between coils — the spring "sings"
 *   - Over/under tension → destructive interference → fringes vanish
 *   - Harmonic overtone fringes appear at perfect tension
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + tension field glow
 *   2. Standing wave interference fringes between coils
 *   3. Spring shadow
 *   4. Spring coils with per-wire highlights + gradient
 *   5. Spring endpoints with specular
 *   6. Resonance harmonic waves
 *   7. Tension indicator + sweet spot glow
 *   8. Progress ring
 *
 * INTERACTION:
 *   Drag vertically → adjust spring tension (drag_snap, error_boundary, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Spring at resonant 50% with full fringes, static
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/** Compute resonance proximity (0 at extremes, 1 at 50% tension) */
function resonanceFromTension(tension: number): number {
  return 1 - Math.abs(tension - 0.5) * 2;
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Spring visual width (viewport fraction) */
const SPRING_WIDTH = 0.15;
/** Spring coil count */
const COIL_COUNT = 14;
/** Spring top anchor Y */
const ANCHOR_TOP_Y = 0.18;
/** Spring bottom range Y */
const ANCHOR_BOT_MIN = 0.45;
/** Spring bottom range max Y */
const ANCHOR_BOT_MAX = 0.85;
/** Endpoint radius */
const ENDPOINT_R = 0.018;
/** Resonance threshold for "sweet spot" */
const RESONANCE_THRESHOLD = 0.85;
/** Frames at resonance for completion */
const RESONANCE_FRAMES = 80;
/** Glow layers */
const GLOW_LAYERS = 5;
/** Interference fringe count per coil gap */
const FRINGE_PER_GAP = 3;
/** Fringe wavelength */
const FRINGE_LAMBDA = 0.012;
/** Harmonic overtone count */
const HARMONIC_COUNT = 3;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Breath modulation on spring oscillation */
const BREATH_SPRING_MOD = 0.02;
/** Spring wire visual width */
const WIRE_WIDTH = 0.003;
/** Tear threshold — too much tension */
const TEAR_THRESHOLD = 0.92;
/** Droop threshold — too little tension */
const DROOP_THRESHOLD = 0.08;

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ════════════════════════════════════════════���════════════════════════

export default function AcceptanceChangeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    tension: 0.2, // 0 = fully limp, 1 = fully stretched
    dragging: false, dragNotified: false, errorNotified: false,
    resonanceFrames: 0, completed: false,
    springOsc: 0, // oscillation phase for micro-vibration
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const time = s.frameCount * 0.012;
      const breath = p.breathAmplitude;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.tension = 0.5; s.completed = true; s.resonanceFrames = RESONANCE_FRAMES + 1;
      }

      const resonance = resonanceFromTension(s.tension);
      s.springOsc += (0.05 + resonance * 0.1) * ms;
      const breathMod = 1 + breath * BREATH_SPRING_MOD;

      // Spring geometry
      const topY = ANCHOR_TOP_Y * h;
      const botY = (ANCHOR_BOT_MIN + s.tension * (ANCHOR_BOT_MAX - ANCHOR_BOT_MIN)) * h;
      const springH = botY - topY;
      const coilSpacing = springH / COIL_COUNT;
      const springHalfW = px(SPRING_WIDTH * 0.5, minDim);

      // Resonance tracking
      if (resonance > RESONANCE_THRESHOLD) s.resonanceFrames += ms;
      else s.resonanceFrames = Math.max(0, s.resonanceFrames - 2);

      // Haptics
      if ((s.tension > TEAR_THRESHOLD || s.tension < DROOP_THRESHOLD) && !s.errorNotified) {
        s.errorNotified = true; cb.onHaptic('error_boundary');
        setTimeout(() => { stateRef.current.errorNotified = false; }, 800);
      }
      if (s.resonanceFrames > RESONANCE_FRAMES && !s.completed) {
        s.completed = true; cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.completed ? 1 : resonance * 0.95);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Tension field glow
      // ════════════════════════════════════════════════════
      const glowCx = cx; const glowCy = (topY + botY) / 2;
      for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = px(GLOW.md * (0.2 + resonance * 0.4 + gi * 0.1), minDim) * breathMod;
        const gA = ALPHA.glow.max * (0.01 + resonance * 0.06) * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(glowCx, glowCy, 0, glowCx, glowCy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.5));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(glowCx - gR, glowCy - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Standing wave interference fringes (SIGNATURE)
      // ════════════════════════════════════════════════════
      if (resonance > 0.2) {
        const fringeIntensity = (resonance - 0.2) / 0.8;
        const lambda = px(FRINGE_LAMBDA, minDim);
        for (let ci = 0; ci < COIL_COUNT - 1; ci++) {
          const gapY = topY + (ci + 0.5) * coilSpacing;
          for (let fi = -FRINGE_PER_GAP; fi <= FRINGE_PER_GAP; fi++) {
            const fOffset = fi * coilSpacing * 0.1;
            const fy = gapY + fOffset;
            // Standing wave: cos² pattern along spring length
            const wavePos = (ci + 0.5) / COIL_COUNT;
            const standing = Math.pow(Math.cos(wavePos * Math.PI * 2 + time * 0.6), 2);
            const fA = ALPHA.glow.max * 0.04 * standing * fringeIntensity * entrance;
            if (fA < 0.001) continue;
            const fWidth = springHalfW * (0.5 + standing * 0.5);
            ctx.beginPath();
            ctx.moveTo(cx - fWidth, fy);
            ctx.lineTo(cx + fWidth, fy);
            ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, standing), fA);
            ctx.lineWidth = px(STROKE.hairline, minDim) * (0.5 + standing);
            ctx.stroke();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Spring shadow
      // ════════════════════════════════════════════════════
      for (let ci = 0; ci < COIL_COUNT; ci++) {
        const y = topY + ci * coilSpacing;
        const nextY = y + coilSpacing;
        const osc = Math.sin(s.springOsc + ci * 0.4) * (1 - resonance * 0.5);
        const xOff = osc * springHalfW * 0.15;
        ctx.beginPath();
        ctx.moveTo(cx - springHalfW + xOff + 2, y + 3);
        ctx.bezierCurveTo(
          cx + springHalfW + xOff + 2, y + coilSpacing * 0.25 + 3,
          cx - springHalfW - xOff + 2, y + coilSpacing * 0.75 + 3,
          cx + springHalfW - xOff + 2, nextY + 3,
        );
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.03 * entrance);
        ctx.lineWidth = px(WIRE_WIDTH * 1.5, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Spring coils with per-wire highlights
      // ════════════════════════════════════════════════════
      for (let ci = 0; ci < COIL_COUNT; ci++) {
        const y = topY + ci * coilSpacing;
        const nextY = y + coilSpacing;
        const osc = Math.sin(s.springOsc + ci * 0.4) * (1 - resonance * 0.5);
        const xOff = osc * springHalfW * 0.15;
        const tensionColor = lerpColor(s.primaryRgb, s.accentRgb, s.tension);

        // Main wire
        ctx.beginPath();
        ctx.moveTo(cx - springHalfW + xOff, y);
        ctx.bezierCurveTo(
          cx + springHalfW + xOff, y + coilSpacing * 0.25,
          cx - springHalfW - xOff, y + coilSpacing * 0.75,
          cx + springHalfW - xOff, nextY,
        );
        const coilGrad = ctx.createLinearGradient(cx - springHalfW, y, cx + springHalfW, nextY);
        const cA = ALPHA.content.max * (0.1 + resonance * 0.2) * entrance;
        coilGrad.addColorStop(0, rgba(lerpColor(tensionColor, [255, 255, 255] as RGB, 0.25), cA));
        coilGrad.addColorStop(0.3, rgba(tensionColor, cA * 0.85));
        coilGrad.addColorStop(0.7, rgba(tensionColor, cA * 0.65));
        coilGrad.addColorStop(1, rgba(lerpColor(tensionColor, [255, 255, 255] as RGB, 0.15), cA * 0.8));
        ctx.strokeStyle = coilGrad;
        ctx.lineWidth = px(WIRE_WIDTH, minDim);
        ctx.stroke();

        // Wire highlight (top edge Fresnel)
        ctx.beginPath();
        ctx.moveTo(cx - springHalfW + xOff, y - px(WIRE_WIDTH * 0.3, minDim));
        ctx.bezierCurveTo(
          cx + springHalfW + xOff, y + coilSpacing * 0.25 - px(WIRE_WIDTH * 0.3, minDim),
          cx - springHalfW - xOff, y + coilSpacing * 0.75 - px(WIRE_WIDTH * 0.3, minDim),
          cx + springHalfW - xOff, nextY - px(WIRE_WIDTH * 0.3, minDim),
        );
        ctx.strokeStyle = rgba([255, 255, 255] as RGB, 0.06 * entrance * (0.5 + resonance * 0.5));
        ctx.lineWidth = px(WIRE_WIDTH * 0.3, minDim);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Endpoints with specular
      // ════════════════════════════════════════════════════
      const endpoints = [
        { x: cx, y: topY },
        { x: cx, y: botY },
      ];
      for (const ep of endpoints) {
        const eR = px(ENDPOINT_R, minDim);
        // Shadow
        const esg = ctx.createRadialGradient(ep.x, ep.y + eR * 0.3, 0, ep.x, ep.y + eR * 0.3, eR * 2.5);
        esg.addColorStop(0, rgba([0, 0, 0] as RGB, 0.04 * entrance));
        esg.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
        ctx.fillStyle = esg; ctx.fillRect(ep.x - eR * 2.5, ep.y - eR * 2, eR * 5, eR * 5);

        // Body
        const eg = ctx.createRadialGradient(ep.x - eR * 0.2, ep.y - eR * 0.2, eR * 0.1, ep.x, ep.y, eR);
        const eA = ALPHA.content.max * 0.3 * entrance;
        eg.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4), eA));
        eg.addColorStop(0.4, rgba(s.primaryRgb, eA * 0.8));
        eg.addColorStop(1, rgba(s.primaryRgb, eA * 0.2));
        ctx.beginPath(); ctx.arc(ep.x, ep.y, eR, 0, Math.PI * 2);
        ctx.fillStyle = eg; ctx.fill();
        // Specular
        ctx.beginPath();
        ctx.ellipse(ep.x - eR * 0.2, ep.y - eR * 0.25, eR * 0.3, eR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance); ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Resonance harmonic waves
      // ════════════════════════════════════════════════════
      if (resonance > 0.5) {
        const harmonicIntensity = (resonance - 0.5) / 0.5;
        for (let hi = 1; hi <= HARMONIC_COUNT; hi++) {
          const harmonicFreq = hi + 1;
          ctx.beginPath();
          for (let si = 0; si <= 50; si++) {
            const t = si / 50;
            const sy = topY + t * springH;
            const harmAmp = Math.sin(t * Math.PI * harmonicFreq + time * (1 + hi * 0.3)) * springHalfW * 0.4 * harmonicIntensity;
            const sx = cx + harmAmp;
            if (si === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = rgba(
            lerpColor(s.primaryRgb, s.accentRgb, hi / HARMONIC_COUNT),
            ALPHA.glow.max * 0.03 * harmonicIntensity * entrance / hi,
          );
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Tension indicator + sweet spot glow
      // ════════════════════════════════════════════════════
      // Vertical tension gauge on right
      const gaugeX = cx + px(SPRING_WIDTH * 0.8, minDim);
      const gaugeTopY = topY; const gaugeBotY = topY + (ANCHOR_BOT_MAX - ANCHOR_TOP_Y) * h;
      const gaugeH = gaugeBotY - gaugeTopY;
      // Track
      ctx.beginPath();
      ctx.moveTo(gaugeX, gaugeTopY);
      ctx.lineTo(gaugeX, gaugeBotY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * entrance);
      ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
      // Sweet spot marker (at 50%)
      const sweetY = gaugeTopY + gaugeH * 0.5;
      ctx.beginPath();
      ctx.arc(gaugeX, sweetY, px(0.005, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance * (0.5 + resonance * 0.5));
      ctx.fill();
      // Current position
      const currentY = gaugeTopY + gaugeH * s.tension;
      ctx.beginPath();
      ctx.arc(gaugeX, currentY, px(0.004, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance);
      ctx.fill();

      // Sweet spot glow when near resonance
      if (resonance > 0.7) {
        const ssGlow = (resonance - 0.7) / 0.3;
        const ssR = px(0.05, minDim) * ssGlow * breathMod;
        const ssg = ctx.createRadialGradient(glowCx, glowCy, 0, glowCx, glowCy, ssR);
        ssg.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.3), ALPHA.glow.max * 0.08 * ssGlow * entrance));
        ssg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.max * 0.03 * ssGlow * entrance));
        ssg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = ssg; ctx.fillRect(glowCx - ssR, glowCy - ssR, ssR * 2, ssR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : Math.min(1, s.resonanceFrames / RESONANCE_FRAMES);
      if (prog > 0.01) {
        ctx.beginPath(); ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      if (!stateRef.current.dragNotified) {
        stateRef.current.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      s.tension = Math.max(0, Math.min(1, (my - ANCHOR_TOP_Y) / (ANCHOR_BOT_MAX - ANCHOR_TOP_Y)));
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}
