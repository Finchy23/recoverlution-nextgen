/**
 * ATOM 070: THE THIRD-PERSON SHIFT ENGINE
 * ==========================================
 * Series 7 — Retro-Causal · Position 10
 *
 * When fused with a memory, you experience it first-person with
 * all the original pain. This atom forces the camera into third-
 * person, turning the user from victim into Director.
 *
 * PHYSICS:
 *   - Tight first-person view: large rect fills 80% of frame + vignette
 *   - Two-finger twist (or single-finger horizontal drag) rotates camera
 *   - Rect shrinks, tilts into isometric projection
 *   - Tiny avatar figure appears as camera shifts
 *   - Grid floor materialises
 *   - Vignette dissolves — spacious, objective view
 *
 * INTERACTION:
 *   Pinch-rotate / drag → rotate camera from first to third person
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Tap toggles between first and third person instantly
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeInOutCubic, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

// =====================================================================
// PALETTE
// =====================================================================

const MEMORY_RECT: RGB = [70, 60, 85];
const MEMORY_INNER: RGB = [90, 80, 110];
const VIGNETTE_DARK: RGB = [10, 8, 16];
const GRID_LINE: RGB = [60, 55, 75];
const AVATAR_COLOR: RGB = [200, 190, 210];
const DIRECTOR_LABEL: RGB = [180, 175, 195];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const TRANSITION_SPEED = 0.008;
const TRANSITION_SPEED_REDUCED = 1; // instant

// =====================================================================
// COMPONENT
// =====================================================================

export default function ThirdPersonShiftAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    transition: 0, // 0 = first-person, 1 = third-person (Director)
    targetTransition: 0,
    // Drag tracking
    isDragging: false,
    dragStartX: 0,
    dragStartTransition: 0,
    // Two-touch rotation
    pointers: new Map<number, { x: number; y: number }>(),
    initialAngle: 0,
    lastDetent: -1,
    resolved: false,
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
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.pointers.set(e.pointerId, { x: px, y: py });

      if (propsRef.current.reducedMotion) {
        s.targetTransition = s.targetTransition < 0.5 ? 1 : 0;
        if (s.targetTransition >= 1 && !s.resolved) {
          s.resolved = true;
          onHaptic('completion');
          onResolve?.();
        } else {
          onHaptic('step_advance');
        }
        return;
      }

      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        s.initialAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      } else {
        s.isDragging = true;
        s.dragStartX = px;
        s.dragStartTransition = s.transition;
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      if (!s.pointers.has(e.pointerId)) return;
      s.pointers.set(e.pointerId, { x: px, y: py });

      if (s.pointers.size === 2) {
        const pts = Array.from(s.pointers.values());
        const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
        const delta = angle - s.initialAngle;
        s.targetTransition = Math.max(0, Math.min(1, s.dragStartTransition + Math.abs(delta) / (Math.PI * 0.4)));
      } else if (s.isDragging) {
        const deltaX = px - s.dragStartX;
        const range = w * 0.4;
        s.targetTransition = Math.max(0, Math.min(1, s.dragStartTransition + Math.abs(deltaX) / range));
      }

      const detent = Math.floor(s.targetTransition * 4);
      if (detent !== s.lastDetent && detent > s.lastDetent) {
        s.lastDetent = detent;
        onHaptic(detent < 4 ? 'drag_snap' : 'step_advance');
      }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      s.pointers.delete(e.pointerId);
      s.isDragging = false;

      if (s.targetTransition > 0.85 && !s.resolved) {
        s.targetTransition = 1;
        s.resolved = true;
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

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      // Transition smoothing
      const tLerp = p.reducedMotion ? 0.5 : 0.04;
      s.transition += (s.targetTransition - s.transition) * tLerp;

      onStateChange?.(s.transition);

      const primaryRgb = parseColor(p.color);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const t = easeInOutCubic(s.transition);

      // ── Grid floor (appears at t > 0.4) ────────────────
      if (t > 0.4) {
        const gridAlpha = ELEMENT_ALPHA.tertiary.max * ent * Math.min(1, (t - 0.4) / 0.3);
        const gridCol = lerpColor(GRID_LINE, primaryRgb, 0.04);
        ctx.strokeStyle = rgba(gridCol, gridAlpha);
        ctx.lineWidth = minDim * 0.0004;

        const gridY = cy + minDim * 0.12;
        const gridSpacing = minDim * 0.04;
        const perspectiveScale = 0.3 + t * 0.5;

        // Horizontal lines (perspective)
        for (let i = 0; i < 8; i++) {
          const lineY = gridY + i * gridSpacing * perspectiveScale;
          if (lineY > h) break;
          const spread = (lineY - gridY) / (h - gridY);
          const x1 = cx - minDim * 0.3 * (1 + spread);
          const x2 = cx + minDim * 0.3 * (1 + spread);
          ctx.beginPath();
          ctx.moveTo(x1, lineY);
          ctx.lineTo(x2, lineY);
          ctx.stroke();
        }

        // Vertical lines (converging)
        for (let i = -4; i <= 4; i++) {
          const topX = cx + i * gridSpacing * 0.5;
          const bottomX = cx + i * gridSpacing * 2;
          ctx.beginPath();
          ctx.moveTo(topX, gridY);
          ctx.lineTo(bottomX, h);
          ctx.stroke();
        }
      }

      // ── Memory rectangle ───────────────────────────────
      // In first-person: fills 80% of viewport
      // In third-person: small tilted rect in the scene
      const fpW = minDim * 0.75;
      const fpH = minDim * 0.55;
      const tpW = minDim * 0.15;
      const tpH = minDim * 0.1;

      const rectW = fpW + (tpW - fpW) * t;
      const rectH = fpH + (tpH - fpH) * t;
      const rectX = cx;
      const rectY = cy + t * minDim * 0.02; // shifts down slightly in 3rd person

      // Isometric tilt
      const skewX = t * 0.15; // horizontal skew for isometric feel

      const rectCol = lerpColor(MEMORY_RECT, primaryRgb, 0.04);
      const innerCol = lerpColor(MEMORY_INNER, primaryRgb, 0.04);
      const rectAlpha = ELEMENT_ALPHA.primary.max * ent;

      ctx.save();
      ctx.translate(rectX, rectY);
      ctx.transform(1, -skewX * 0.3, skewX, 1, 0, 0);

      // Memory rect body
      ctx.fillStyle = rgba(rectCol, rectAlpha);
      ctx.fillRect(-rectW / 2, -rectH / 2, rectW, rectH);

      // Inner content suggestion
      ctx.fillStyle = rgba(innerCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.fillRect(-rectW * 0.35, -rectH * 0.25, rectW * 0.7, rectH * 0.08);
      ctx.fillRect(-rectW * 0.35, -rectH * 0.05, rectW * 0.5, rectH * 0.08);
      ctx.fillRect(-rectW * 0.35, rectH * 0.15, rectW * 0.3, rectH * 0.08);

      // Border
      ctx.strokeStyle = rgba(rectCol, ELEMENT_ALPHA.secondary.max * ent);
      ctx.lineWidth = minDim * 0.0006;
      ctx.strokeRect(-rectW / 2, -rectH / 2, rectW, rectH);

      ctx.restore();

      // ── Avatar figure (appears at t > 0.3) ─────────────
      if (t > 0.3) {
        const avatarAlpha = ELEMENT_ALPHA.primary.min * ent * Math.min(1, (t - 0.3) / 0.3);
        const avatarCol = lerpColor(AVATAR_COLOR, primaryRgb, 0.05);
        const avatarX = rectX + rectW * 0.4 * t;
        const avatarY = rectY + rectH * 0.3;
        const avatarH = minDim * 0.04 * t;

        ctx.fillStyle = rgba(avatarCol, avatarAlpha);

        // Head
        ctx.beginPath();
        ctx.arc(avatarX, avatarY - avatarH * 0.8, avatarH * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillRect(avatarX - avatarH * 0.08, avatarY - avatarH * 0.55, avatarH * 0.16, avatarH * 0.55);

        // "YOU" label
        if (t > 0.7) {
          const youAlpha = ELEMENT_ALPHA.text.min * ent * Math.min(1, (t - 0.7) / 0.2);
          ctx.font = `${Math.round(minDim * 0.01)}px system-ui, -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = rgba(avatarCol, youAlpha);
          ctx.fillText('YOU', avatarX, avatarY + avatarH * 0.15);
        }
      }

      // ── Vignette (fades out with transition) ───────────
      if (t < 0.95) {
        const vigAlpha = ELEMENT_ALPHA.secondary.max * ent * (1 - t);
        const vigCol = lerpColor(VIGNETTE_DARK, primaryRgb, 0.01);
        const vigGrad = ctx.createRadialGradient(cx, cy, minDim * 0.15 * (1 + t * 2), cx, cy, minDim * 0.5);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, rgba(vigCol, vigAlpha));
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ── Labels ─────────────────────────────────────────
      const labelCol = lerpColor(DIRECTOR_LABEL, primaryRgb, 0.05);

      if (t < 0.3) {
        const fpAlpha = ELEMENT_ALPHA.text.min * ent * (1 - t / 0.3) * 0.6;
        ctx.font = `${Math.round(minDim * 0.013)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(labelCol, fpAlpha);
        ctx.fillText('FIRST PERSON', cx, h * 0.92);
      }

      if (t > 0.7) {
        const tpAlpha = ELEMENT_ALPHA.text.min * ent * Math.min(1, (t - 0.7) / 0.2) * 0.6;
        ctx.font = `${Math.round(minDim * 0.013)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(labelCol, tpAlpha);
        ctx.fillText("DIRECTOR'S VIEW", cx, h * 0.92);
      }

      // ── Instruction ────────────────────────────────────
      if (t < 0.1 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(labelCol, ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText(
          p.reducedMotion ? 'tap to shift perspective' : 'drag to shift perspective',
          cx, h * 0.12,
        );
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