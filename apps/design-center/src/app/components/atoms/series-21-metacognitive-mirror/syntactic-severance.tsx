/**
 * ATOM 203: THE SYNTACTIC SEVERANCE ENGINE
 * ==========================================
 * Series 21 — Metacognitive Mirror · Position 3
 *
 * The ego fuses identity to temporary states. Sever the pronoun from
 * the predicate — "I AM" remains, the label turns to ash.
 *
 * PHYSICS:
 *   - "I AM [LABEL]" displayed as connected typography
 *   - Swipe horizontally between "AM" and the label
 *   - The structural link snaps — label drifts away and dissolves
 *   - "I AM" locks to center with massive radiant glow
 *
 * INTERACTION:
 *   Horizontal swipe → severs the syntactic bond
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static severed state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale, FONT_SIZE,
  type RGB,
} from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const LABELS = ['anxious', 'broken', 'unworthy', 'failing', 'stuck', 'alone', 'weak'];
const SEVER_THRESHOLD = 0.15; // swipe distance as fraction of width
const DISSOLVE_RATE = 0.012;

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SyntacticSeveranceAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
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
    // Severance state
    severed: false,
    dissolveProgress: 0, // 0 = label solid, 1 = fully dissolved
    labelDriftX: 0,
    labelDriftY: 0,
    iAmGlow: 0,
    // Swipe tracking
    swipeStartX: 0,
    swipeStartY: 0,
    swiping: false,
    swipeDelta: 0,
    // Label
    currentLabel: LABELS[Math.floor(Math.random() * LABELS.length)],
    // Bond particles
    bondParticles: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
    completed: false,
    completions: 0,
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
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ── Post-severance animation ──────────────────────
      if (s.severed) {
        s.dissolveProgress = Math.min(1, s.dissolveProgress + DISSOLVE_RATE * ms);
        s.labelDriftX += px(0.002, minDim) * ms;
        s.labelDriftY += px(0.0005, minDim) * ms;
        s.iAmGlow = Math.min(1, s.iAmGlow + 0.015 * ms);
      }

      // Auto-resolve
      if (p.phase === 'resolve' && !s.severed) {
        s.severed = true;
        s.dissolveProgress = 0;
      }

      // ── Typography layout ─────────────────────────────
      const fontSize = FONT_SIZE.xl(minDim);
      const smallSize = FONT_SIZE.md(minDim);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // "I AM" position — locks to center after severance
      const iAmX = cx + (s.severed ? 0 : -px(0.05, minDim));
      const iAmY = cy;

      // Label position — drifts away after severance
      const labelBaseX = cx + px(0.12, minDim);
      const labelX = labelBaseX + s.labelDriftX;
      const labelY = cy + s.labelDriftY;

      // ── Draw connecting bond (before severance) ───────
      if (!s.severed) {
        const bondStartX = iAmX + px(0.06, minDim);
        const bondEndX = labelX - px(0.06, minDim);
        const bondAlpha = ALPHA.content.max * 0.4 * entrance;

        // Dashed connection line
        ctx.beginPath();
        ctx.moveTo(bondStartX, cy);
        ctx.lineTo(bondEndX, cy);
        ctx.strokeStyle = rgba(s.accentRgb, bondAlpha);
        ctx.lineWidth = px(0.002, minDim);
        ctx.setLineDash([px(0.004, minDim), px(0.003, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Swipe indicator line (during swipe)
        if (s.swiping && Math.abs(s.swipeDelta) > 0) {
          const cutX = (bondStartX + bondEndX) / 2;
          const cutAlpha = ALPHA.accent.max * Math.min(1, Math.abs(s.swipeDelta) / (w * SEVER_THRESHOLD)) * entrance;
          ctx.beginPath();
          ctx.moveTo(cutX, cy - px(0.03, minDim));
          ctx.lineTo(cutX, cy + px(0.03, minDim));
          ctx.strokeStyle = rgba(s.accentRgb, cutAlpha);
          ctx.lineWidth = px(0.003, minDim);
          ctx.stroke();
        }
      }

      // ── Bond break particles ──────────────────────────
      for (let i = s.bondParticles.length - 1; i >= 0; i--) {
        const bp = s.bondParticles[i];
        bp.x += bp.vx * ms;
        bp.y += bp.vy * ms;
        bp.vy += 0.1;
        bp.life -= 0.02;
        if (bp.life <= 0) { s.bondParticles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, px(0.002, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * bp.life * entrance);
        ctx.fill();
      }

      // ── Draw "I AM" ───────────────────────────────────
      const iAmAlpha = ALPHA.content.max * entrance;
      ctx.font = `${fontSize}px sans-serif`;

      // Glow behind "I AM" after severance
      if (s.iAmGlow > 0) {
        const glowR = px(0.08 + s.iAmGlow * 0.12, minDim);
        const glow = ctx.createRadialGradient(iAmX, iAmY, 0, iAmX, iAmY, glowR);
        glow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * s.iAmGlow * 0.6 * entrance));
        glow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * s.iAmGlow * 0.2 * entrance));
        glow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(iAmX - glowR, iAmY - glowR, glowR * 2, glowR * 2);
      }

      ctx.fillStyle = rgba(s.primaryRgb, iAmAlpha * (0.7 + s.iAmGlow * 0.3));
      ctx.fillText('I AM', iAmX, iAmY);

      // ── Draw label ────────────────────────────────────
      if (s.dissolveProgress < 1) {
        const labelAlpha = ALPHA.content.max * (1 - s.dissolveProgress) * entrance * 0.6;
        ctx.font = `${smallSize}px sans-serif`;
        ctx.fillStyle = rgba(s.accentRgb, labelAlpha);

        if (s.severed && s.dissolveProgress > 0.3) {
          // Letter-by-letter dissolution
          const letters = s.currentLabel.split('');
          let xOff = labelX - (letters.length * smallSize * 0.3);
          for (let i = 0; i < letters.length; i++) {
            const letterDiss = Math.min(1, Math.max(0, (s.dissolveProgress - 0.3 - i * 0.05) * 3));
            const ly = labelY + Math.sin(s.frameCount * 0.05 + i) * px(0.005, minDim) * letterDiss * ms;
            const la = labelAlpha * (1 - letterDiss);
            if (la > 0.005) {
              ctx.fillStyle = rgba(s.accentRgb, la);
              ctx.textAlign = 'left';
              ctx.fillText(letters[i], xOff, ly);
            }
            xOff += smallSize * 0.6;
          }
          ctx.textAlign = 'center';
        } else {
          ctx.fillText(s.currentLabel, labelX, labelY);
        }
      }

      // Completion state tracking
      if (s.severed && s.dissolveProgress >= 1 && !s.completed) {
        s.completed = true;
        s.completions++;
        cb.onStateChange?.(1);
      } else if (!s.completed) {
        cb.onStateChange?.(s.severed ? s.dissolveProgress * 0.9 : 0);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers (swipe to sever) ─────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.severed) return;
      s.swiping = true;
      s.swipeStartX = e.clientX;
      s.swipeStartY = e.clientY;
      s.swipeDelta = 0;
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.severed) return;
      s.swipeDelta = e.clientX - s.swipeStartX;
    };

    const onUp = () => {
      const s = stateRef.current;
      if (!s.swiping) return;
      s.swiping = false;

      if (!s.severed && Math.abs(s.swipeDelta) > viewport.width * SEVER_THRESHOLD) {
        // SEVER!
        s.severed = true;
        callbacksRef.current.onHaptic('swipe_commit');

        // Spawn bond-break particles
        const bondX = viewport.width / 2 + px(0.04, Math.min(viewport.width, viewport.height));
        const bondY = viewport.height / 2;
        for (let i = 0; i < 12; i++) {
          s.bondParticles.push({
            x: bondX,
            y: bondY,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            life: 0.6 + Math.random() * 0.4,
          });
        }
      }
      s.swipeDelta = 0;
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
      />
    </div>
  );
}
