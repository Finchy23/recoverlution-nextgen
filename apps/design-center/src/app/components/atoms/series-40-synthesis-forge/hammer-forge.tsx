/**
 * ATOM 398: THE HAMMER FORGE ENGINE
 * ====================================
 * Series 40 — Synthesis Forge · Position 8
 *
 * Cure the delusion that passion is found, not forged.
 * 20 rhythmic concussive strikes shape crude iron into a razor-sharp blade.
 *
 * PHYSICS:
 *   - Crude bulky lump of digital iron (amorphous blob)
 *   - Each tap delivers a concussive strike with screen flash
 *   - Progressive shape morph: blob → rough form → refined blade
 *   - Strike impact sends sparks flying
 *   - Geometry mathematically sharpens with each strike
 *   - After 20 strikes: razor-sharp blade with metallic gleam
 *   - Strike counter shown as circular progress ring
 *
 * INTERACTION:
 *   Tap → delivers one concussive strike
 *   20 strikes → completion with final luminous flash
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static refined blade with gleam
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Total strikes required */
const MAX_STRIKES = 20;
/** Hero shape base size */
const SHAPE_BASE_FRAC = SIZE.lg;
/** Blob base width-to-height ratio (starts wide, becomes tall/narrow) */
const BLOB_ASPECT_START = 1.4;
const BLADE_ASPECT_END = 0.35;
/** Flash decay rate */
const FLASH_DECAY = 0.06;
/** Screen shake amplitude (decays) */
const SHAKE_AMP = 6;
const SHAKE_DECAY = 0.85;
/** Spark count per strike */
const SPARKS_PER_STRIKE = 8;
/** Max sparks alive */
const MAX_SPARKS = 80;
/** Blade tip sharpness (angle in radians) */
const BLADE_TIP_ANGLE = 0.12;
/** Completion glow */
const COMPLETE_GLOW_MULT = 1.6;
/** Completion animation speed */
const COMPLETE_SPEED = 0.008;
/** Progress ring radius offset */
const PROG_RING_OFFSET = 0.03;

// =====================================================================
// STATE TYPES
// =====================================================================

interface StrikeSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function HammerForgeAtom({
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
    strikes: 0,
    forged: false,
    completeAnim: 0,
    completed: false,
    flash: 0,
    shakeX: 0,
    shakeY: 0,
    sparks: [] as StrikeSpark[],
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

    /** Draw the morphing shape from blob to blade */
    function drawShape(
      ctx: CanvasRenderingContext2D,
      cx: number, cy: number,
      minDim: number, ratio: number,
      rgb: RGB, alpha: number,
    ) {
      const baseR = px(SHAPE_BASE_FRAC, minDim);
      // Morph from wide blob to tall narrow blade
      const aspect = BLOB_ASPECT_START + (BLADE_ASPECT_END - BLOB_ASPECT_START) * ratio;
      const halfW = baseR * aspect * 0.5;
      const halfH = baseR * (0.5 + ratio * 0.4);

      ctx.beginPath();

      if (ratio < 0.5) {
        // Blob phase: irregular ellipse with bumps
        const blobiness = 1 - ratio * 2; // 1→0
        const pts = 24;
        for (let i = 0; i <= pts; i++) {
          const a = (i / pts) * Math.PI * 2;
          const bump = blobiness * Math.sin(a * 5 + ratio * 10) * baseR * 0.06;
          const rx = halfW + bump;
          const ry = halfH + bump * 0.5;
          const px2 = cx + Math.cos(a) * rx;
          const py2 = cy + Math.sin(a) * ry;
          if (i === 0) ctx.moveTo(px2, py2);
          else ctx.lineTo(px2, py2);
        }
      } else {
        // Blade phase: refined pointed shape
        const sharpness = (ratio - 0.5) * 2; // 0→1
        const tipExtend = sharpness * halfH * 0.3;

        // Blade tip (top)
        ctx.moveTo(cx, cy - halfH - tipExtend);
        // Right edge (slight curve)
        ctx.quadraticCurveTo(
          cx + halfW * (1 + sharpness * 0.1), cy - halfH * 0.2,
          cx + halfW * 0.8, cy + halfH * 0.3,
        );
        // Right guard
        ctx.lineTo(cx + halfW * 0.3, cy + halfH * 0.6);
        // Handle right
        ctx.lineTo(cx + halfW * 0.15, cy + halfH);
        // Handle bottom
        ctx.lineTo(cx - halfW * 0.15, cy + halfH);
        // Handle left
        ctx.lineTo(cx - halfW * 0.3, cy + halfH * 0.6);
        // Left edge
        ctx.quadraticCurveTo(
          cx - halfW * (1 + sharpness * 0.1), cy - halfH * 0.2,
          cx, cy - halfH - tipExtend,
        );
      }

      ctx.closePath();
      ctx.fillStyle = rgba(rgb, alpha);
      ctx.fill();
      ctx.strokeStyle = rgba(rgb, alpha * 0.7);
      ctx.lineWidth = px(STROKE.thin, minDim);
      ctx.stroke();
    }

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;

      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      // ── Resolve phase ───────────────────────────────
      if (p.phase === 'resolve' && !s.forged) {
        s.strikes = MAX_STRIKES;
      }

      const ratio = Math.min(1, s.strikes / MAX_STRIKES);

      // ── Forge detection ─────────────────────────────
      if (ratio >= 1 && !s.forged) {
        s.forged = true;
        s.flash = 1.5; // Extra big flash
        cb.onHaptic('completion');
      }
      if (s.forged) {
        s.completeAnim = Math.min(1, s.completeAnim + COMPLETE_SPEED * ms);
      }

      // ── Flash and shake decay ───────────────────────
      s.flash = Math.max(0, s.flash - FLASH_DECAY * ms);
      s.shakeX *= SHAKE_DECAY;
      s.shakeY *= SHAKE_DECAY;

      // ── Spark physics ───────────────────────────────
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.12; // Gravity
        sp.life -= 0.02;
        if (sp.life <= 0) s.sparks.splice(i, 1);
      }

      cb.onStateChange?.(s.forged
        ? 0.5 + easeOutCubic(s.completeAnim) * 0.5
        : ratio * 0.5);

      const complete = easeOutCubic(s.completeAnim);

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        drawShape(ctx, cx, cy, minDim, 1, s.primaryRgb, ALPHA.content.max * 0.35 * entrance);

        const gR = px(SHAPE_BASE_FRAC, minDim) * COMPLETE_GLOW_MULT;
        const sg = ctx.createRadialGradient(cx, cy, px(SHAPE_BASE_FRAC, minDim) * 0.2, cx, cy, gR);
        sg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);

        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ══════════════════════════════════════════════════
      // RENDER (with shake offset)
      // ══════════════════════════════════════════════════

      const drawCx = cx + s.shakeX;
      const drawCy = cy + s.shakeY;

      // ── Shadow ──────────────────────────────────────
      const shadowR = px(SHAPE_BASE_FRAC, minDim) * 1.1;
      const shadow = ctx.createRadialGradient(drawCx, drawCy + shadowR * 0.05, 0, drawCx, drawCy, shadowR);
      shadow.addColorStop(0, rgba(s.accentRgb, ALPHA.atmosphere.max * 0.06 * entrance));
      shadow.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = shadow;
      ctx.fillRect(drawCx - shadowR, drawCy - shadowR, shadowR * 2, shadowR * 2);

      // ── The shape ───────────────────────────────────
      const shapeColor = ratio > 0.7
        ? lerpColor(s.accentRgb, s.primaryRgb, (ratio - 0.7) * 3.33) as RGB
        : s.accentRgb;
      const shapeAlpha = ALPHA.content.max * (0.2 + ratio * 0.15 + complete * 0.1) * entrance;
      drawShape(ctx, drawCx, drawCy, minDim, ratio, shapeColor, shapeAlpha);

      // ── Metallic edge gleam (high ratio) ────────────
      if (ratio > 0.6) {
        const gleamIntensity = (ratio - 0.6) * 2.5;
        const gleamY = drawCy - px(SHAPE_BASE_FRAC, minDim) * 0.3;
        const gleamR = px(0.015, minDim);
        const gg = ctx.createRadialGradient(drawCx, gleamY, 0, drawCx, gleamY, gleamR);
        gg.addColorStop(0, rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
          ALPHA.focal.max * 0.3 * gleamIntensity * entrance,
        ));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(drawCx - gleamR, gleamY - gleamR, gleamR * 2, gleamR * 2);
      }

      // ── Sparks ──────────────────────────────────────
      for (const sp of s.sparks) {
        const spR = px(0.003 * sp.life, minDim);
        ctx.beginPath();
        ctx.arc(sp.x + s.shakeX, sp.y + s.shakeY, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          lerpColor(s.primaryRgb, [255, 200, 100] as RGB, 0.5),
          ALPHA.content.max * sp.life * 0.5 * entrance,
        );
        ctx.fill();
      }

      // ── Strike flash ────────────────────────────────
      if (s.flash > 0) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.12 * Math.min(1, s.flash) * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Completion glow ─────────────────────────────
      if (s.forged) {
        const gR = px(SHAPE_BASE_FRAC, minDim) * COMPLETE_GLOW_MULT;
        const cg = ctx.createRadialGradient(cx, cy, px(SHAPE_BASE_FRAC, minDim) * 0.2, cx, cy, gR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.25 * complete * entrance));
        cg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * complete * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ── Strike progress ring ────────────────────────
      if (!s.forged) {
        const ringR = px(SHAPE_BASE_FRAC + PROG_RING_OFFSET, minDim);
        const progAngle = ratio * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim);
        ctx.stroke();

        // Strike count dots
        for (let i = 0; i < MAX_STRIKES; i++) {
          const dotAngle = -Math.PI / 2 + (i / MAX_STRIKES) * Math.PI * 2;
          const dotR = px(0.003, minDim);
          const dx = cx + Math.cos(dotAngle) * ringR;
          const dy = cy + Math.sin(dotAngle) * ringR;
          ctx.beginPath();
          ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            i < s.strikes ? s.primaryRgb : s.accentRgb,
            ALPHA.content.max * (i < s.strikes ? 0.3 : 0.1) * entrance,
          );
          ctx.fill();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      if (s.forged) return;

      s.strikes = Math.min(MAX_STRIKES, s.strikes + 1);
      s.flash = 1;
      s.shakeX = (Math.random() - 0.5) * SHAKE_AMP;
      s.shakeY = (Math.random() - 0.5) * SHAKE_AMP;

      // Spawn sparks
      const minDim = Math.min(viewport.width, viewport.height);
      for (let i = 0; i < SPARKS_PER_STRIKE; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        s.sparks.push({
          x: viewport.width / 2,
          y: viewport.height / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 0.6 + Math.random() * 0.4,
        });
        if (s.sparks.length > MAX_SPARKS) s.sparks.shift();
      }

      callbacksRef.current.onHaptic('tap');
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
