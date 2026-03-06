/**
 * ATOM 082: THE SHADOW HUG ENGINE
 * ==================================
 * Series 9 — Shadow & Crucible · Position 2
 *
 * We fight our demons, making them stronger. This atom requires
 * agonisingly slow approach. Move fast → shadow flees. Move slow
 * → shadow trembles but holds. Hold still near it → it yields.
 *
 * PHYSICS:
 *   - Jagged shadow blob at random position
 *   - Velocity-inverse evasion: fast pointer = fast flee
 *   - Slow approach < threshold → shadow doesn't flee
 *   - Hold near shadow for 2s → vertices smooth, light core appears
 *   - Jagged → smooth vertex morph on resolution
 *
 * INTERACTION:
 *   Slow drag → approach the shadow
 *   Hold → embrace for resolution
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Shadow doesn't flee, hold for resolution
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, type RGB,
} from '../atom-utils';

const SHADOW_DARK: RGB = [30, 25, 40];
const SHADOW_EDGE: RGB = [60, 50, 75];
const SHADOW_SMOOTH: RGB = [80, 70, 100];
const LIGHT_CORE: RGB = [220, 200, 160];
const BG_BASE: RGB = [18, 16, 24];

const SHADOW_POINTS = 12;
const VELOCITY_FLEE_RATIO = 0.008; // of minDim per frame — above this → shadow flees
const PROXIMITY_THRESHOLD_RATIO = 0.15;
const HOLD_NEAR_THRESHOLD = 120; // 2s at 60fps
const FLEE_SPEED_RATIO = 0.006;

export default function ShadowHugAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    shadowX: 0, shadowY: 0,
    shadowVx: 0, shadowVy: 0,
    pointerX: 0, pointerY: 0,
    lastPointerX: 0, lastPointerY: 0,
    pointerVelocity: 0,
    isPointerDown: false,
    nearFrames: 0, // frames spent near shadow slowly
    softening: 0, // 0 = jagged, 1 = smooth
    lightReveal: 0,
    jaggedRadii: null as number[] | null,
    resolved: false,
    hapticSent: false,
    frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const s = stateRef.current;
    s.shadowX = viewport.width * (0.3 + Math.random() * 0.4);
    s.shadowY = viewport.height * (0.3 + Math.random() * 0.4);
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      s.isPointerDown = true;
      s.pointerX = (e.clientX - rect.left) / rect.width * w;
      s.pointerY = (e.clientY - rect.top) / rect.height * h;
      s.lastPointerX = s.pointerX;
      s.lastPointerY = s.pointerY;
      if (!s.hapticSent) { onHaptic('hold_start'); s.hapticSent = true; }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isPointerDown) return;
      const rect = canvas.getBoundingClientRect();
      s.lastPointerX = s.pointerX;
      s.lastPointerY = s.pointerY;
      s.pointerX = (e.clientX - rect.left) / rect.width * w;
      s.pointerY = (e.clientY - rect.top) / rect.height * h;
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
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Generate jagged radii once
      if (!s.jaggedRadii) {
        s.jaggedRadii = [];
        for (let i = 0; i < SHADOW_POINTS; i++) {
          s.jaggedRadii.push(minDim * 0.06 * (0.7 + Math.sin(i * 5.3) * 0.4 + Math.sin(i * 11.7) * 0.2));
        }
      }

      // Pointer velocity
      const dx = s.pointerX - s.lastPointerX;
      const dy = s.pointerY - s.lastPointerY;
      s.pointerVelocity = Math.sqrt(dx * dx + dy * dy);

      // Distance to shadow
      const dsx = s.pointerX - s.shadowX;
      const dsy = s.pointerY - s.shadowY;
      const distToShadow = Math.sqrt(dsx * dsx + dsy * dsy);
      const proximityThreshold = minDim * PROXIMITY_THRESHOLD_RATIO;

      // Shadow AI
      if (!p.reducedMotion && s.isPointerDown && !s.resolved) {
        if (s.pointerVelocity > minDim * VELOCITY_FLEE_RATIO && distToShadow < minDim * 0.3) {
          // FLEE: fast movement detected
          const fleeAngle = Math.atan2(s.shadowY - s.pointerY, s.shadowX - s.pointerX);
          s.shadowVx += Math.cos(fleeAngle) * minDim * FLEE_SPEED_RATIO;
          s.shadowVy += Math.sin(fleeAngle) * minDim * FLEE_SPEED_RATIO;
          s.nearFrames = Math.max(0, s.nearFrames - 5);
        } else if (distToShadow < proximityThreshold && s.pointerVelocity < minDim * VELOCITY_FLEE_RATIO * 0.5) {
          // NEAR + SLOW: accumulate
          s.nearFrames++;
          if (s.nearFrames >= HOLD_NEAR_THRESHOLD * 0.5 && s.softening < 0.01) {
            onHaptic('hold_threshold');
          }
        }
      }

      if (p.reducedMotion && s.isPointerDown && distToShadow < proximityThreshold) {
        s.nearFrames += 2;
      }

      // Shadow physics
      s.shadowX += s.shadowVx;
      s.shadowY += s.shadowVy;
      s.shadowVx *= 0.9;
      s.shadowVy *= 0.9;
      // Bound to viewport
      s.shadowX = Math.max(minDim * 0.1, Math.min(w - minDim * 0.1, s.shadowX));
      s.shadowY = Math.max(minDim * 0.1, Math.min(h - minDim * 0.1, s.shadowY));

      // Softening
      const softTarget = Math.min(1, s.nearFrames / HOLD_NEAR_THRESHOLD);
      s.softening += (softTarget - s.softening) * 0.03;
      s.lightReveal = Math.max(0, s.softening - 0.5) * 2;

      if (s.softening > 0.95 && !s.resolved) {
        s.resolved = true;
        onHaptic('completion');
        onResolve?.();
      }

      onStateChange?.(s.softening);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Inner light (revealed behind shadow)
      if (s.lightReveal > 0) {
        const lightR = minDim * 0.025 * s.lightReveal;
        const lightCol = lerpColor(LIGHT_CORE, primaryRgb, 0.04);
        const lGrad = ctx.createRadialGradient(s.shadowX, s.shadowY, 0, s.shadowX, s.shadowY, lightR * 2);
        lGrad.addColorStop(0, rgba(lightCol, ELEMENT_ALPHA.glow.max * ent * s.lightReveal * 0.6));
        lGrad.addColorStop(1, rgba(lightCol, 0));
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.arc(s.shadowX, s.shadowY, lightR * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = rgba(lightCol, ELEMENT_ALPHA.primary.max * ent * s.lightReveal);
        ctx.beginPath();
        ctx.arc(s.shadowX, s.shadowY, lightR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Shadow blob
      const shadowCol = lerpColor(
        lerpColor(SHADOW_DARK, primaryRgb, 0.02),
        lerpColor(SHADOW_SMOOTH, primaryRgb, 0.03),
        s.softening,
      );
      const shadowAlpha = ELEMENT_ALPHA.primary.max * ent * (1 - s.lightReveal * 0.5);

      // Tremble
      const tremble = p.reducedMotion ? 0 : (1 - s.softening) * minDim * 0.003;

      ctx.fillStyle = rgba(shadowCol, shadowAlpha);
      ctx.beginPath();
      const smoothR = minDim * 0.06;
      for (let i = 0; i < SHADOW_POINTS; i++) {
        const angle = (i / SHADOW_POINTS) * Math.PI * 2;
        const jaggedR = s.jaggedRadii![i];
        const r = jaggedR + (smoothR - jaggedR) * s.softening;
        const tremX = (Math.random() - 0.5) * tremble;
        const tremY = (Math.random() - 0.5) * tremble;
        const px = s.shadowX + Math.cos(angle) * r + tremX;
        const py = s.shadowY + Math.sin(angle) * r + tremY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Shadow edge
      ctx.strokeStyle = rgba(lerpColor(SHADOW_EDGE, primaryRgb, 0.03), ELEMENT_ALPHA.secondary.min * ent * (1 - s.softening));
      ctx.lineWidth = minDim * 0.0006;
      ctx.beginPath();
      for (let i = 0; i < SHADOW_POINTS; i++) {
        const angle = (i / SHADOW_POINTS) * Math.PI * 2;
        const jaggedR = s.jaggedRadii![i];
        const r = jaggedR + (smoothR - jaggedR) * s.softening;
        const tremX = (Math.random() - 0.5) * tremble;
        const tremY = (Math.random() - 0.5) * tremble;
        const px = s.shadowX + Math.cos(angle) * r + tremX;
        const py = s.shadowY + Math.sin(angle) * r + tremY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Instruction
      if (s.softening < 0.1 && !s.resolved) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(SHADOW_EDGE, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('approach slowly. hold still.', cx, h * 0.9);
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
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none' }}
    />
  );
}