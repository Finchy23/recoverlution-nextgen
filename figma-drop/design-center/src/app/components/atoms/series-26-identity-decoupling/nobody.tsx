/**
 * ATOM 258: THE NOBODY ENGINE
 * ==============================
 * Series 26 — Identity Decoupling · Position 8
 *
 * Profound relief in being absolutely nobody. Dissolve the avatar
 * into the background color — total beautiful invisibility.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Avatar silhouette rendered as SDF composite (head circle +
 *     torso rounded-rect + limb capsules)
 *   - Scrub to dissolve: SDF boundary softens, edge width increases
 *     until the distance field becomes uniform → invisibility
 *   - Each feature's SDF dissolves independently in sequence
 *     (details first, then major features, then outline)
 *   - At full dissolve, residual SDF noise creates a beautiful
 *     pixelation effect — you can barely see where form was
 *
 * PHYSICS:
 *   - Central avatar silhouette (SDF composite shape)
 *   - Scrub right → SDF fields progressively flatten to zero
 *   - Each dissolved region spawns brief sparkle particles
 *   - Ghost afterimage of previous form lingers briefly
 *   - Background acquires warm, relieved glow at full dissolve
 *   - 8 render layers: atmosphere, relief glow, ghost silhouette,
 *     avatar body, avatar details, dissolve sparkles, SDF noise, label
 *
 * INTERACTION:
 *   Scrub horizontally to dissolve (drag_snap, completion)
 *
 * RENDER: Canvas 2D with SDF silhouette dissolution + relief glow
 * REDUCED MOTION: Fully dissolved, warm background glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Avatar height (fraction of minDim) */
const AVATAR_H = 0.30;
/** Avatar width */
const AVATAR_W = 0.10;
/** Head radius */
const HEAD_R = 0.04;
/** Dissolve sparkle count per region */
const SPARKLE_COUNT = 30;
/** Sparkle lifetime */
const SPARKLE_LIFE = 0.7;
/** Sparkle drift speed */
const SPARKLE_DRIFT = 0.002;
/** Ghost silhouette decay */
const GHOST_DECAY = 0.988;
/** Relief glow layers */
const GLOW_LAYERS = 6;
/** SDF noise particles at full dissolve */
const SDF_NOISE_COUNT = 40;
/** Relief glow radius */
const RELIEF_GLOW_R = 0.35;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface Sparkle {
  x: number; y: number; vx: number; vy: number;
  life: number; size: number;
}

interface GhostForm {
  dissolveLevel: number; alpha: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw avatar silhouette with SDF dissolve */
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, dissolve: number, entrance: number,
  breathMod: number, isGhost: boolean, ghostAlpha: number,
) {
  if (dissolve >= 1) return;

  const fH = px(AVATAR_H, minDim) * breathMod;
  const fW = px(AVATAR_W, minDim) * breathMod;
  const headR = px(HEAD_R, minDim) * breathMod;
  const remaining = 1 - dissolve;
  const alpha = isGhost ? ghostAlpha : remaining;
  const baseA = ALPHA.content.max * alpha * entrance * (isGhost ? 0.2 : 1);

  // SDF edge softening: stroke gets blurrier as dissolve increases
  const edgeBlur = dissolve * px(0.01, minDim);

  // ── Head (dissolves last) ───────────────────────────────────
  if (dissolve < 0.9) {
    const headDissolve = Math.max(0, (dissolve - 0.6) / 0.3);
    const headA = baseA * (0.3 - headDissolve * 0.25);
    const headGrad = ctx.createRadialGradient(cx, cy - fH * 0.32, 0, cx, cy - fH * 0.32, headR);
    headGrad.addColorStop(0, rgba(color, headA * 0.8));
    headGrad.addColorStop(0.5, rgba(color, headA * 0.5));
    headGrad.addColorStop(0.8, rgba(color, headA * 0.2));
    headGrad.addColorStop(1, rgba(color, headA * 0.02));
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - fH * 0.32, headR * (1 + headDissolve * 0.5), 0, Math.PI * 2);
    ctx.fill();

    if (!isGhost) {
      // Head specular
      const specR = headR * 0.2;
      const specGrad = ctx.createRadialGradient(cx - headR * 0.3, cy - fH * 0.32 - headR * 0.2, 0,
        cx - headR * 0.3, cy - fH * 0.32 - headR * 0.2, specR);
      specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, headA * 0.2));
      specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(cx - headR * 0.3, cy - fH * 0.32 - headR * 0.2, specR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Torso (dissolves at medium rate) ────────────────────────
  if (dissolve < 0.7) {
    const torsoDissolve = Math.max(0, (dissolve - 0.3) / 0.4);
    const torsoA = baseA * (0.22 - torsoDissolve * 0.18);
    const cornerR = fW * 0.15 * (1 + torsoDissolve * 3); // SDF corners soften
    ctx.beginPath();
    ctx.roundRect(cx - fW * 0.35, cy - fH * 0.1, fW * 0.7, fH * 0.3, cornerR);
    ctx.fillStyle = rgba(color, torsoA);
    ctx.fill();
  }

  // ── Legs (dissolve first) ───────────────────────────────────
  if (dissolve < 0.45) {
    const legDissolve = dissolve / 0.45;
    const legA = baseA * (0.18 - legDissolve * 0.15);
    const legW = fW * 0.14;
    const legCorner = legW * 0.3 * (1 + legDissolve * 2);
    ctx.beginPath();
    ctx.roundRect(cx - fW * 0.2, cy + fH * 0.22, legW, fH * 0.22, legCorner);
    ctx.fillStyle = rgba(color, legA);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(cx + fW * 0.06, cy + fH * 0.22, legW, fH * 0.22, legCorner);
    ctx.fill();
  }

  // ── Outline (SDF boundary, dissolves mid-range) ─────────────
  if (dissolve < 0.8 && !isGhost) {
    const outlineDissolve = dissolve / 0.8;
    const outlineA = baseA * 0.15 * (1 - outlineDissolve);
    // Simplified outline as oval
    ctx.beginPath();
    ctx.ellipse(cx, cy, fW * 0.45, fH * 0.48, 0, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(color, outlineA);
    ctx.lineWidth = px(STROKE.hairline, minDim) + edgeBlur;
    ctx.stroke();
  }
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function NobodyAtom({
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
    dissolve: 0,
    dragging: false, dragStartX: 0, dragNotified: false,
    sparkles: [] as Sparkle[],
    ghosts: [] as GhostForm[],
    completed: false,
    /** SDF noise seeds for residual pixelation */
    noiseSeeds: Array.from({ length: SDF_NOISE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 0.2,
      y: (Math.random() - 0.5) * 0.25,
      phase: Math.random() * Math.PI * 2,
    })),
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.dissolve = 1; s.completed = true;
      }

      const breathMod = 1 + p.breathAmplitude * 0.03;
      const breathGlow = 1 + p.breathAmplitude * 0.12;

      // Sparkle physics
      for (let i = s.sparkles.length - 1; i >= 0; i--) {
        const sp = s.sparkles[i];
        sp.x += sp.vx * ms; sp.y += sp.vy * ms;
        sp.life -= 0.008 * ms;
        if (sp.life <= 0) s.sparkles.splice(i, 1);
      }

      // Ghost decay
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      if (s.dissolve >= 0.95 && !s.completed) {
        s.dissolve = 1; s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.dissolve);

      // ═══════════════════════════════════════════════════════
      // LAYER 1: Relief glow (grows with dissolve)
      // ═══════════════════════════════════════════════════════
      if (s.dissolve > 0.3) {
        const reliefT = (s.dissolve - 0.3) / 0.7;
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = px(RELIEF_GLOW_R * (0.5 + reliefT * 0.5 + i * 0.1), minDim) * breathGlow;
          const gA = ALPHA.glow.max * reliefT * 0.08 * entrance / (i + 1);
          const warmColor = lerpColor(s.primaryRgb, [255, 245, 225] as RGB, reliefT * 0.3);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(warmColor, gA * 1.2));
          gg.addColorStop(0.3, rgba(warmColor, gA * 0.4));
          gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.08));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 2: Ghost silhouettes
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        drawAvatar(ctx, cx, cy, minDim, s.accentRgb, g.dissolveLevel, entrance, breathMod, true, g.alpha);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 3-4: Avatar silhouette (dissolving)
      // ═══════════════════════════════════════════════════════
      drawAvatar(ctx, cx, cy, minDim, s.primaryRgb, s.dissolve, entrance, breathMod, false, 0);

      // ═══════════════════════════════════════════════════════
      // LAYER 5: Dissolve sparkles
      // ═══════════════════════════════════════════════════════
      for (const sp of s.sparkles) {
        const spR = px(sp.size, minDim);
        const spGrad = ctx.createRadialGradient(
          cx + px(sp.x, minDim), cy + px(sp.y, minDim), 0,
          cx + px(sp.x, minDim), cy + px(sp.y, minDim), spR * 2,
        );
        spGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * sp.life * entrance));
        spGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = spGrad;
        ctx.fillRect(
          cx + px(sp.x, minDim) - spR * 2, cy + px(sp.y, minDim) - spR * 2,
          spR * 4, spR * 4,
        );
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 6: SDF noise residue (at high dissolve)
      // ═══════════════════════════════════════════════════════
      if (s.dissolve > 0.6 && s.dissolve < 1) {
        const noiseT = (s.dissolve - 0.6) / 0.4;
        for (const ns of s.noiseSeeds) {
          const nx = cx + px(ns.x, minDim);
          const ny = cy + px(ns.y, minDim);
          const nR = px(0.002, minDim) * (1 - noiseT);
          const flicker = Math.sin(s.frameCount * 0.05 + ns.phase) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(nx, ny, nR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * flicker * (1 - noiseT) * entrance);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 7: "nobody" label at full dissolve
      // ═══════════════════════════════════════════════════════
      if (s.dissolve > 0.8) {
        const labelA = ALPHA.content.max * 0.06 * Math.min(1, (s.dissolve - 0.8) * 5) * entrance;
        ctx.font = `${px(FONT_SIZE.xs, minDim)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(s.primaryRgb, labelA);
        ctx.fillText('nobody', cx, cy + px(AVATAR_H * 0.5 + 0.04, minDim));
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 8: Completion bloom rings
      // ═══════════════════════════════════════════════════════
      if (s.completed) {
        const time = s.frameCount * 0.008;
        for (let i = 0; i < 3; i++) {
          const rPhase = (time * 0.02 + i * 0.33) % 1;
          const rR = px(0.05 + rPhase * 0.3, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy, rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.03 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Interaction: scrub to dissolve ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      s.dragStartX = e.clientX;
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
      // Ghost trail
      if (s.ghosts.length < 4) {
        s.ghosts.push({ dissolveLevel: s.dissolve, alpha: 0.3 });
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed) return;
      const dx = (e.clientX - s.dragStartX) / viewport.width;
      if (dx > 0) {
        const prev = s.dissolve;
        s.dissolve = Math.min(1, s.dissolve + dx * 0.04);
        // Spawn sparkles on dissolve progress
        if (s.dissolve - prev > 0.01) {
          for (let sp = 0; sp < 3; sp++) {
            s.sparkles.push({
              x: (Math.random() - 0.5) * 0.1,
              y: (Math.random() - 0.5) * 0.15,
              vx: (Math.random() - 0.5) * SPARKLE_DRIFT,
              vy: (Math.random() - 0.5) * SPARKLE_DRIFT,
              life: SPARKLE_LIFE, size: 0.002 + Math.random() * 0.003,
            });
          }
        }
      }
      s.dragStartX = e.clientX;
    };
    const onUp = () => { stateRef.current.dragging = false; };

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
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'crosshair',
      }} />
    </div>
  );
}
