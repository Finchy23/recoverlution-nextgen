/**
 * ATOM 063: THE NARRATIVE FLIP ENGINE
 * =====================================
 * Series 7 — Retro-Causal · Position 3
 *
 * The ego calls it "The End." The sovereign mind calls it
 * "The Inciting Incident." Swipe up to reverse gravity.
 *
 * PHYSICS:
 *   - Heavy geometric object falls under simulated gravity
 *   - Trailing afterimages show trajectory
 *   - Upward swipe inverts gravity, compresses + launches
 *   - Text morphs from "END" to "BEGIN"
 *
 * INTERACTION:
 *   Swipe up → reverses gravity
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Instant flip, no physics animation
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

const FALL_COLOR: RGB = [160, 65, 75];
const RISE_COLOR: RGB = [100, 190, 160];
const OBJECT_COLOR: RGB = [120, 110, 130];
const TEXT_COLOR: RGB = [200, 195, 210];
const BG_BASE: RGB = [18, 16, 24];

// =====================================================================
// CONSTANTS
// =====================================================================

const OBJECT_SIZE_RATIO = 0.1;
const GRAVITY_RATIO = 0.00024; // multiplied by minDim per frame
const MAX_AFTERIMAGES = 14;
const SWIPE_THRESHOLD_RATIO = 0.12; // of minDim
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const COMPRESSION_FRAMES = 18;
const LAUNCH_VELOCITY_RATIO = -0.012; // multiplied by minDim

type PhaseState = 'falling' | 'waiting' | 'compressing' | 'rising' | 'complete';

// =====================================================================
// COMPONENT
// =====================================================================

export default function NarrativeFlipAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    objectY: 0,
    velocity: 0,
    gravity: GRAVITY_RATIO,
    phaseState: 'falling' as PhaseState,
    afterimages: [] as { x: number; y: number; alpha: number }[],
    compressFrame: 0,
    scaleY: 1,
    textAlpha: 0, // 0 = show END, 1 = show BEGIN
    pointerStartY: 0,
    pointerStartTime: 0,
    isPointerDown: false,
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
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      s.isPointerDown = true;
      s.pointerStartY = e.clientY;
      s.pointerStartTime = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      const s = stateRef.current;
      if (!s.isPointerDown) return;
      s.isPointerDown = false;

      const deltaY = s.pointerStartY - e.clientY;
      const elapsed = (performance.now() - s.pointerStartTime) / 1000;
      const velocity = elapsed > 0 ? deltaY / elapsed / 60 : 0;

      if (s.phaseState === 'falling' || s.phaseState === 'waiting') {
        if (deltaY > SWIPE_THRESHOLD_RATIO * minDim && velocity > SWIPE_VELOCITY_THRESHOLD) {
          if (propsRef.current.reducedMotion) {
            s.phaseState = 'complete';
            s.objectAngle = Math.PI;
            s.objectY = h * 0.5;
            onStateChange?.(1);
            onResolve?.();
            s.resolved = true;
          } else {
            s.phaseState = 'compressing';
            s.compressFrame = 0;
            onHaptic('swipe_commit');
          }
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // Init position
    stateRef.current.objectY = h * 0.15;
    const gravity = minDim * GRAVITY_RATIO;
    const launchVel = minDim * LAUNCH_VELOCITY_RATIO;

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

      const primaryRgb = parseColor(p.color);
      const bgCol = lerpColor(BG_BASE, primaryRgb, 0.03);
      const { cx, cy } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgCol, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgCol, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bgCol, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const objSize = minDim * OBJECT_SIZE_RATIO;

      // Physics update
      if (!p.reducedMotion) {
        switch (s.phaseState) {
          case 'falling': {
            s.velocity += gravity;
            s.objectY += s.velocity;
            // Stop at 70% of viewport
            if (s.objectY > h * 0.7) {
              s.objectY = h * 0.7;
              s.velocity = 0;
              s.phaseState = 'waiting';
            }
            break;
          }
          case 'compressing': {
            s.compressFrame++;
            const t = s.compressFrame / COMPRESSION_FRAMES;
            // Spring compression then release
            if (t < 0.5) {
              s.scaleY = 1 - 0.4 * (t * 2); // compress to 0.6
            } else if (t < 0.8) {
              const rt = (t - 0.5) / 0.3;
              s.scaleY = 0.6 + 0.4 * rt; // release back to 1.0
            } else {
              s.scaleY = 1;
              s.phaseState = 'rising';
              s.velocity = launchVel;
              s.gravity = -Math.abs(gravity) * 0.5; // gentle upward pull
            }
            break;
          }
          case 'rising': {
            s.velocity += s.gravity;
            s.objectY += s.velocity;
            // Text morph
            s.textAlpha = Math.min(1, s.textAlpha + 0.02);
            // Complete when off top
            if (s.objectY < -objSize && !s.resolved) {
              s.phaseState = 'complete';
              s.resolved = true;
              onHaptic('completion');
              onResolve?.();
            }
            break;
          }
          default:
            break;
        }

        // Record afterimage
        if (s.phaseState === 'falling' || s.phaseState === 'rising') {
          s.afterimages.push({ x: cx, y: s.objectY, alpha: 0.06 });
          if (s.afterimages.length > MAX_AFTERIMAGES) {
            s.afterimages.shift();
          }
        }
      }

      // Fade afterimages
      for (const ai of s.afterimages) {
        ai.alpha *= 0.92;
      }

      // State report
      const progress = s.phaseState === 'complete' ? 1 :
        s.phaseState === 'rising' ? 0.5 + s.textAlpha * 0.5 :
        s.phaseState === 'compressing' ? 0.3 : 0;
      onStateChange?.(progress);

      // ── Draw afterimages ───────────────────────────────
      const isRising = s.phaseState === 'rising' || s.phaseState === 'complete';
      const trailCol = isRising
        ? lerpColor(RISE_COLOR, primaryRgb, 0.05)
        : lerpColor(FALL_COLOR, primaryRgb, 0.05);

      for (const ai of s.afterimages) {
        if (ai.alpha < 0.002) continue;
        ctx.fillStyle = rgba(trailCol, ai.alpha * ent);
        ctx.beginPath();
        ctx.roundRect(ai.x - objSize / 2, ai.y - objSize / 2, objSize, objSize, objSize * 0.15);
        ctx.fill();
      }

      // ── Draw main object ───────────────────────────────
      if (s.phaseState !== 'complete' || s.frame % 2 === 0) {
        const objCol = lerpColor(OBJECT_COLOR, primaryRgb, 0.05);
        const edgeCol = isRising ? lerpColor(RISE_COLOR, primaryRgb, 0.04) : lerpColor(FALL_COLOR, primaryRgb, 0.04);
        const objAlpha = ELEMENT_ALPHA.primary.max * ent;

        ctx.save();
        ctx.translate(cx, s.objectY);
        ctx.scale(1, s.scaleY);

        // Object body
        ctx.fillStyle = rgba(objCol, objAlpha);
        ctx.beginPath();
        ctx.roundRect(-objSize / 2, -objSize / 2, objSize, objSize, objSize * 0.15);
        ctx.fill();

        // Edge glow
        ctx.strokeStyle = rgba(edgeCol, ELEMENT_ALPHA.secondary.max * ent);
        ctx.lineWidth = minDim * 0.0012;
        ctx.beginPath();
        ctx.roundRect(-objSize / 2, -objSize / 2, objSize, objSize, objSize * 0.15);
        ctx.stroke();

        // Text on object
        const fontSize = Math.round(objSize * 0.22);
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // "END" fading out
        if (s.textAlpha < 1) {
          ctx.fillStyle = rgba(
            lerpColor(FALL_COLOR, primaryRgb, 0.06),
            ELEMENT_ALPHA.text.max * ent * (1 - s.textAlpha),
          );
          ctx.fillText('END', 0, 0);
        }
        // "BEGIN" fading in
        if (s.textAlpha > 0) {
          ctx.fillStyle = rgba(
            lerpColor(RISE_COLOR, primaryRgb, 0.04),
            ELEMENT_ALPHA.text.max * ent * s.textAlpha,
          );
          ctx.fillText('BEGIN', 0, 0);
        }

        ctx.restore();
      }

      // ── Rising particles ───────────────────────────────
      if (isRising && !p.reducedMotion) {
        const particleCol = lerpColor(RISE_COLOR, primaryRgb, 0.05);
        for (let i = 0; i < 6; i++) {
          const px = cx + (Math.sin(s.frame * 0.1 + i * 1.2) * objSize * 0.8);
          const py = s.objectY + objSize + i * minDim * 0.015 + (s.frame * 0.5 % (minDim * 0.08));
          if (py > 0 && py < h) {
            const pa = ELEMENT_ALPHA.secondary.max * ent * (1 - (py - s.objectY) / (h * 0.3));
            if (pa > 0) {
              ctx.fillStyle = rgba(particleCol, Math.max(0, pa));
              const ptSz = minDim * 0.003;
              ctx.fillRect(px - ptSz / 2, py - ptSz / 2, ptSz, ptSz);
            }
          }
        }
      }

      // ── Instruction label ──────────────────────────────
      if (s.phaseState === 'falling' || s.phaseState === 'waiting') {
        const labelAlpha = ELEMENT_ALPHA.text.min * ent * 0.8;
        ctx.font = `${Math.round(minDim * 0.016)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(TEXT_COLOR, primaryRgb, 0.05), labelAlpha);
        ctx.fillText('swipe up to flip the narrative', cx, h * 0.88);
      }

      ctx.restore();
    };

    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
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