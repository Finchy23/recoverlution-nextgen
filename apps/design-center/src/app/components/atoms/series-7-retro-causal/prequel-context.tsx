/**
 * ATOM 065: THE PREQUEL ENGINE
 * ==============================
 * Series 7 — Retro-Causal · Position 5
 *
 * They were not reacting to you. You walked into the middle of
 * their movie. Drag the timeline backward to see the wound
 * behind the attack.
 *
 * PHYSICS:
 *   - Red jagged "Attack" node at centre
 *   - Horizontal drag scrolls the timeline backward (rightward)
 *   - Bleeding "Wound" node slides in from the left
 *   - Connecting bezier reveals causation
 *   - Attack node vertices soften as context emerges
 *   - Labels morph: "ATTACK" → "REACTION", "WOUND" appears
 *
 * INTERACTION:
 *   Drag (horizontal) → scroll timeline backward
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Discrete step positions, no smooth scrolling
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const ATTACK_RED: RGB = [200, 60, 60];
const ATTACK_SOFT: RGB = [140, 100, 130];
const WOUND_BLUE: RGB = [90, 70, 150];
const CONNECTION: RGB = [150, 100, 140];
const LABEL_COLOR: RGB = [190, 185, 200];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const NODE_RADIUS_RATIO = 0.08;
const WOUND_RADIUS_RATIO = 0.1;
const JAGGED_POINTS = 10;
const SMOOTH_LERP = 0.7; // how much jagged→smooth at full scroll

// =====================================================================
// GENERATE JAGGED VERTICES
// =====================================================================

function generateJaggedVertices(count: number, baseR: number, seed: number): number[] {
  const radii: number[] = [];
  for (let i = 0; i < count; i++) {
    const noise = Math.sin(seed + i * 7.3) * 0.4 + Math.sin(seed + i * 13.1) * 0.2;
    radii.push(baseR * (1 + noise));
  }
  return radii;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function PrequelContextAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    scrollT: 0, // 0 = no context, 1 = full wound visible
    targetScrollT: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartT: 0,
    lastDetent: -1,
    resolved: false,
    attackRadii: null as number[] | null,
    frame: 0,
  });
  const propsRef = useRef({
    breathAmplitude, reducedMotion, phase, color, accentColor,
  });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Render loop ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isDragging = true;
      s.dragStartX = e.clientX;
      s.dragStartT = s.scrollT;
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const deltaX = e.clientX - s.dragStartX;
      const range = w * 0.6;
      const newT = Math.max(0, Math.min(1, s.dragStartT + deltaX / range));
      s.targetScrollT = newT;
      const detent = Math.floor(newT * 4);
      if (detent !== s.lastDetent && detent > s.lastDetent) {
        s.lastDetent = detent;
        onHaptic('drag_snap');
        if (detent === 2) onHaptic('step_advance');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isDragging = false;
      if (s.targetScrollT > 0.9 && !s.resolved) {
        s.resolved = true;
        s.targetScrollT = 1;
        onHaptic('completion');
        onResolve?.();
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      // Entrance
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Scroll smoothing
      const scrollLerp = p.reducedMotion ? 0.5 : 0.06;
      s.scrollT += (s.targetScrollT - s.scrollT) * scrollLerp;

      onStateChange?.(s.scrollT);

      const primaryRgb = parseColor(p.color);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);
      const { cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Generate jagged radii once
      if (!s.attackRadii) {
        s.attackRadii = generateJaggedVertices(JAGGED_POINTS, minDim * NODE_RADIUS_RATIO, 42);
      }

      const attackR = minDim * NODE_RADIUS_RATIO;
      const woundR = minDim * WOUND_RADIUS_RATIO;

      // Attack node position — shifts right as scroll increases
      const attackX = cx + s.scrollT * minDim * 0.2;
      const attackY = cy;

      // Wound node position — slides in from off-screen left
      const woundOffscreen = -woundR * 2;
      const woundVisible = cx - minDim * 0.25;
      const woundX = woundOffscreen + (woundVisible - woundOffscreen) * s.scrollT;
      const woundY = cy;

      // ── Connection line ────────────────────────────────
      if (s.scrollT > 0.1) {
        const connAlpha = ELEMENT_ALPHA.secondary.max * ent * Math.min(1, (s.scrollT - 0.1) / 0.3);
        const connCol = lerpColor(CONNECTION, primaryRgb, 0.05);
        ctx.strokeStyle = rgba(connCol, connAlpha);
        ctx.lineWidth = minDim * 0.0012;
        ctx.beginPath();
        ctx.moveTo(woundX + woundR * 0.8, woundY);
        const cpx1 = (woundX + attackX) / 2;
        const cpy1 = woundY - minDim * 0.06;
        ctx.quadraticCurveTo(cpx1, cpy1, attackX - attackR * 0.8, attackY);
        ctx.stroke();

        // Arrow head at attack end
        const arrowSize = minDim * 0.012;
        ctx.fillStyle = rgba(connCol, connAlpha);
        ctx.beginPath();
        ctx.moveTo(attackX - attackR * 0.8, attackY);
        ctx.lineTo(attackX - attackR * 0.8 - arrowSize, attackY - arrowSize * 0.5);
        ctx.lineTo(attackX - attackR * 0.8 - arrowSize, attackY + arrowSize * 0.5);
        ctx.closePath();
        ctx.fill();
      }

      // ── Wound node ─────────────────────────────────────
      if (s.scrollT > 0.05) {
        const woundAlpha = ELEMENT_ALPHA.primary.max * ent * Math.min(1, s.scrollT / 0.4);
        const woundCol = lerpColor(WOUND_BLUE, primaryRgb, 0.05);

        // Wound glow
        const glowR = woundR * 1.5;
        const grad = ctx.createRadialGradient(woundX, woundY, 0, woundX, woundY, glowR);
        grad.addColorStop(0, rgba(woundCol, ELEMENT_ALPHA.glow.min * ent * s.scrollT));
        grad.addColorStop(1, rgba(woundCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(woundX, woundY, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Wound body — soft, round
        ctx.fillStyle = rgba(woundCol, woundAlpha);
        ctx.beginPath();
        ctx.arc(woundX, woundY, woundR, 0, Math.PI * 2);
        ctx.fill();

        // "Bleeding" drip particles
        if (!p.reducedMotion) {
          for (let i = 0; i < 3; i++) {
            const dripY = woundY + woundR + (s.frame * 0.3 + i * 12) % (minDim * 0.06);
            const dripX = woundX + Math.sin(i * 2.5) * woundR * 0.3;
            const dripAlpha = woundAlpha * 0.3 * (1 - dripY / (woundY + woundR + minDim * 0.06));
            ctx.fillStyle = rgba(woundCol, Math.max(0, dripAlpha));
            ctx.beginPath();
            ctx.arc(dripX, dripY, minDim * 0.004, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Wound label
        if (s.scrollT > 0.4) {
          const labelAlpha = ELEMENT_ALPHA.text.min * ent * Math.min(1, (s.scrollT - 0.4) / 0.2);
          ctx.font = `600 ${Math.round(minDim * 0.016)}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = rgba(lerpColor(LABEL_COLOR, primaryRgb, 0.05), labelAlpha);
          ctx.fillText('WOUND', woundX, woundY + woundR + minDim * 0.04);
        }
      }

      // ── Attack node ────────────────────────────────────
      {
        const softening = s.scrollT * SMOOTH_LERP;
        const attackCol = lerpColor(
          lerpColor(ATTACK_RED, primaryRgb, 0.05),
          lerpColor(ATTACK_SOFT, primaryRgb, 0.05),
          softening,
        );
        const attackAlpha = ELEMENT_ALPHA.primary.max * ent;

        // Draw jagged/softening polygon
        ctx.fillStyle = rgba(attackCol, attackAlpha);
        ctx.beginPath();
        for (let i = 0; i < JAGGED_POINTS; i++) {
          const angle = (i / JAGGED_POINTS) * Math.PI * 2;
          const jaggedR = s.attackRadii![i];
          const smoothR = attackR; // perfect circle
          const r = jaggedR + (smoothR - jaggedR) * softening;
          const px = attackX + Math.cos(angle) * r;
          const py = attackY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Attack label — morphs from "ATTACK" to "REACTION"
        const labelAlpha = ELEMENT_ALPHA.text.max * ent;
        ctx.font = `600 ${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';

        if (s.scrollT < 0.5) {
          ctx.fillStyle = rgba(lerpColor(LABEL_COLOR, primaryRgb, 0.05), labelAlpha * (1 - s.scrollT * 2));
          ctx.fillText('ATTACK', attackX, attackY + attackR + minDim * 0.035);
        }
        if (s.scrollT > 0.3) {
          const reactAlpha = Math.min(1, (s.scrollT - 0.3) / 0.4);
          ctx.fillStyle = rgba(lerpColor(LABEL_COLOR, primaryRgb, 0.05), labelAlpha * reactAlpha);
          ctx.fillText('REACTION', attackX, attackY + attackR + minDim * 0.035);
        }
      }

      // ── Timeline arrow ─────────────────────────────────
      const arrowY = cy + minDim * 0.2;
      const arrowCol = lerpColor(LABEL_COLOR, primaryRgb, 0.04);
      ctx.strokeStyle = rgba(arrowCol, ELEMENT_ALPHA.tertiary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      ctx.moveTo(w * 0.15, arrowY);
      ctx.lineTo(w * 0.85, arrowY);
      ctx.stroke();
      // Arrow head pointing left (past)
      const arrowSize = minDim * 0.012;
      ctx.fillStyle = rgba(arrowCol, ELEMENT_ALPHA.tertiary.max * ent);
      ctx.beginPath();
      ctx.moveTo(w * 0.15, arrowY);
      ctx.lineTo(w * 0.15 + arrowSize, arrowY - arrowSize * 0.5);
      ctx.lineTo(w * 0.15 + arrowSize, arrowY + arrowSize * 0.5);
      ctx.closePath();
      ctx.fill();

      // Timeline labels
      ctx.font = `${Math.round(minDim * 0.011)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillStyle = rgba(arrowCol, ELEMENT_ALPHA.text.min * ent * 0.6);
      ctx.fillText('PAST', w * 0.15, arrowY + minDim * 0.02);
      ctx.textAlign = 'right';
      ctx.fillText('PRESENT', w * 0.85, arrowY + minDim * 0.02);

      // ── Instruction ────────────────────────────────────
      if (s.scrollT < 0.15 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(LABEL_COLOR, primaryRgb, 0.05), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('drag right to reveal the prequel', cx, h * 0.88);
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
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: viewport.width,
        height: viewport.height,
        display: 'block',
        touchAction: 'none',
      }}
    />
  );
}