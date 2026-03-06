/**
 * ATOM 248: THE MOBIUS STRIP ENGINE
 * ===================================
 * Series 25 — Dialectical Engine · Position 8
 *
 * Inside and outside are the same continuous surface. Trace the white
 * side — arrive on the black without crossing an edge. The topology
 * of non-duality: there is no boundary between self and other.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - The Möbius surface is rendered as two "sides" that emit wave fields
 *   - As the tracer crosses the twist, the two side-waves superpose:
 *     interference fringes appear showing both sides are ONE surface
 *   - At completion, standing-wave fringes fill the strip proving non-duality
 *   - Chromatic fringing at the twist point (RGB split)
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + depth fog
 *   2. Interference fringe field along strip surface
 *   3. Möbius strip shadow
 *   4. Möbius strip body with per-face shading + z-sort
 *   5. Surface detail lines + twist highlight
 *   6. Tracer with glow trail
 *   7. Chromatic fringe at twist + completion glow
 *   8. Progress ring
 *
 * PHYSICS:
 *   - 3D Möbius strip projected to 2D with parametric equations
 *   - Tracer follows strip surface; color transitions smoothly
 *   - Z-sorting renders front faces over back faces
 *   - Breath modulates strip rotation + fringe wavelength
 *
 * INTERACTION:
 *   Drag → advance tracer along strip (drag_snap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Full strip visible with standing-wave fringes, static
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

/** Parametric Möbius strip point (u: 0–2π along strip, v: -1 to 1 across width) */
function mobiusPoint(u: number, v: number, R: number, halfW: number, rotY: number): { x: number; y: number; z: number } {
  const hw = halfW * v;
  const cosU = Math.cos(u); const sinU = Math.sin(u);
  const cosHalf = Math.cos(u / 2); const sinHalf = Math.sin(u / 2);
  const x3d = (R + hw * cosHalf) * cosU;
  const y3d = (R + hw * cosHalf) * sinU;
  const z3d = hw * sinHalf;
  // Rotate around Y axis
  const cosR = Math.cos(rotY); const sinR = Math.sin(rotY);
  const rx = x3d * cosR - z3d * sinR;
  const rz = x3d * sinR + z3d * cosR;
  return { x: rx, y: y3d, z: rz };
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Möbius major radius */
const MOBIUS_R = SIZE.lg * 0.45;
/** Strip half-width */
const STRIP_W = SIZE.md * 0.15;
/** Number of segments around the strip */
const U_SEGMENTS = 60;
/** Width segments across strip */
const V_SEGMENTS = 6;
/** Tracer speed per frame */
const TRACER_SPEED = 0.004;
/** Trail length */
const TRAIL_LENGTH = 40;
/** Glow layers */
const GLOW_LAYERS = 5;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Fringe wavelength */
const FRINGE_LAMBDA = 0.015;
/** Rotation speed */
const ROT_SPEED = 0.003;
/** Breath rotation modulation */
const BREATH_ROT_MOD = 0.01;
/** Full traversal requires 2 loops (one-sided surface) */
const FULL_TRAVERSAL = 2;
/** Depth fog intensity */
const DEPTH_FOG_ALPHA = 0.035;
/** Chromatic fringe spread (px fraction) */
const CHROMATIC_SPREAD = 0.004;
/** Fresnel edge glow width */
const FRESNEL_EDGE_W = 0.003;
/** Specular highlight intensity */
const SPECULAR_INTENSITY = 0.25;
/** Depth fog layers for background */
const FOG_LAYERS = 3;

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function MobiusStripAtom({
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
    tracerU: 0, tracerLoops: 0,
    trail: [] as { x: number; y: number; side: number }[],
    dragging: false, dragNotified: false, stepNotified: false,
    completed: false, rotY: 0.3,
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

      // ════════════════════════════════════════════════════
      // RENDER LAYER 0: Depth fog (atmospheric distance)
      // ════════════════════════════════════════════════════
      for (let fi = 0; fi < FOG_LAYERS; fi++) {
        const fogR = px(GLOW.lg * (0.5 + fi * 0.3), minDim);
        const fogA = DEPTH_FOG_ALPHA * entrance / (fi + 1);
        const fogY = cy + minDim * 0.05 * fi;
        const fog = ctx.createRadialGradient(cx, fogY, 0, cx, fogY, fogR);
        fog.addColorStop(0, rgba(lerpColor(s.primaryRgb, [10, 8, 20] as RGB, 0.7), fogA));
        fog.addColorStop(0.4, rgba(lerpColor(s.primaryRgb, [10, 8, 20] as RGB, 0.85), fogA * 0.5));
        fog.addColorStop(0.7, rgba([10, 8, 20] as RGB, fogA * 0.2));
        fog.addColorStop(1, rgba([10, 8, 20] as RGB, 0));
        ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
      }

      if (p.reducedMotion || p.phase === 'resolve') {
        s.completed = true; s.tracerLoops = FULL_TRAVERSAL;
      }

      // ── Strip rotation ────────────────────────────────────
      s.rotY += ROT_SPEED * ms + Math.sin(time * 0.3) * BREATH_ROT_MOD * breath;
      const R = px(MOBIUS_R, minDim);
      const halfW = px(STRIP_W, minDim);

      // ── Tracer physics ────────────────────────────────────
      if (s.dragging && !s.completed) {
        const prevU = s.tracerU;
        s.tracerU += TRACER_SPEED * ms;
        if (s.tracerU >= Math.PI * 2) {
          s.tracerU -= Math.PI * 2;
          s.tracerLoops++;
          if (!s.stepNotified) { s.stepNotified = true; cb.onHaptic('step_advance'); }
          setTimeout(() => { stateRef.current.stepNotified = false; }, 500);
        }
        // Trail
        const side = Math.cos(s.tracerU / 2); // +1 or -1 as twist progresses
        const tp = mobiusPoint(s.tracerU, 0, R, halfW, s.rotY);
        const proj = { x: cx + tp.x, y: cy + tp.y, side };
        s.trail.unshift(proj);
        if (s.trail.length > TRAIL_LENGTH) s.trail.length = TRAIL_LENGTH;
      }

      // Completion check
      if (s.tracerLoops >= FULL_TRAVERSAL && !s.completed) {
        s.completed = true; cb.onHaptic('completion');
      }

      const totalProgress = Math.min(1, (s.tracerLoops + s.tracerU / (Math.PI * 2)) / FULL_TRAVERSAL);
      cb.onStateChange?.(s.completed ? 1 : totalProgress);

      // ── Generate strip mesh ───────────────────────────────
      interface StripFace {
        pts: { x: number; y: number }[];
        z: number;
        side: number;
        uPos: number;
      }
      const faces: StripFace[] = [];
      const duStep = (Math.PI * 2) / U_SEGMENTS;

      for (let ui = 0; ui < U_SEGMENTS; ui++) {
        const u0 = ui * duStep;
        const u1 = u0 + duStep;
        for (let vi = 0; vi < V_SEGMENTS; vi++) {
          const v0 = -1 + (vi / V_SEGMENTS) * 2;
          const v1 = v0 + 2 / V_SEGMENTS;
          const p00 = mobiusPoint(u0, v0, R, halfW, s.rotY);
          const p10 = mobiusPoint(u1, v0, R, halfW, s.rotY);
          const p11 = mobiusPoint(u1, v1, R, halfW, s.rotY);
          const p01 = mobiusPoint(u0, v1, R, halfW, s.rotY);
          const avgZ = (p00.z + p10.z + p11.z + p01.z) / 4;
          const side = Math.cos(u0 / 2);
          faces.push({
            pts: [
              { x: cx + p00.x, y: cy + p00.y },
              { x: cx + p10.x, y: cy + p10.y },
              { x: cx + p11.x, y: cy + p11.y },
              { x: cx + p01.x, y: cy + p01.y },
            ],
            z: avgZ,
            side,
            uPos: u0 / (Math.PI * 2),
          });
        }
      }
      // Z-sort (back to front)
      faces.sort((a, b) => a.z - b.z);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Interference fringes along surface
      // ════════════════════════════════════════════════════
      if (totalProgress > 0.1) {
        const fringeIntensity = Math.min(1, totalProgress * 1.5);
        const lambda = px(FRINGE_LAMBDA, minDim);
        for (let fi = 0; fi < U_SEGMENTS; fi += 2) {
          const u = (fi / U_SEGMENTS) * Math.PI * 2;
          const fp = mobiusPoint(u, 0, R, halfW, s.rotY);
          const fpx = cx + fp.x; const fpy = cy + fp.y;
          // Two-source interference: "white side" and "black side"
          const d1 = u; const d2 = u + Math.PI; // opposite side of twist
          const phaseDiff = ((d1 - d2) / (Math.PI * 2)) * R / lambda;
          const intensity = Math.pow(Math.cos(phaseDiff * Math.PI + time * 0.4), 2);
          const fA = ALPHA.glow.max * 0.03 * intensity * fringeIntensity * entrance;
          if (fA < 0.001 || fp.z < -halfW * 0.5) continue;
          const dotR = px(0.003, minDim) * (0.4 + intensity * 0.6);
          ctx.beginPath(); ctx.arc(fpx, fpy, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, intensity), fA);
          ctx.fill();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3-4: Strip mesh (shadow + body)
      // ════════════════════════════════════════════════════
      for (const face of faces) {
        const sideT = (face.side + 1) * 0.5; // 0–1
        const depthFade = Math.max(0.2, (face.z + halfW) / (halfW * 2));
        const faceColor = lerpColor(s.primaryRgb, s.accentRgb, sideT);
        const faceAlpha = ALPHA.content.max * (0.06 + depthFade * 0.12) * entrance;

        ctx.beginPath();
        ctx.moveTo(face.pts[0].x, face.pts[0].y);
        for (let i = 1; i < face.pts.length; i++) ctx.lineTo(face.pts[i].x, face.pts[i].y);
        ctx.closePath();
        ctx.fillStyle = rgba(lerpColor(faceColor, [255, 255, 255] as RGB, depthFade * 0.15), faceAlpha);
        ctx.fill();
        ctx.strokeStyle = rgba(faceColor, faceAlpha * 0.3);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Twist highlight + surface lines
      // ════════════════════════════════════════════════════
      // Center line of strip
      ctx.beginPath();
      for (let ui = 0; ui <= U_SEGMENTS; ui++) {
        const u = (ui / U_SEGMENTS) * Math.PI * 2;
        const cp = mobiusPoint(u, 0, R, halfW, s.rotY);
        if (ui === 0) ctx.moveTo(cx + cp.x, cy + cp.y);
        else ctx.lineTo(cx + cp.x, cy + cp.y);
      }
      ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2), ALPHA.content.max * 0.05 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();

      // ── Fresnel edge glow on strip outer edges ──────────
      for (const edgeV of [-1, 1]) {
        ctx.beginPath();
        for (let ui = 0; ui <= U_SEGMENTS; ui++) {
          const u = (ui / U_SEGMENTS) * Math.PI * 2;
          const ep = mobiusPoint(u, edgeV, R, halfW, s.rotY);
          if (ui === 0) ctx.moveTo(cx + ep.x, cy + ep.y);
          else ctx.lineTo(cx + ep.x, cy + ep.y);
        }
        ctx.strokeStyle = rgba(
          lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.4),
          ALPHA.content.max * 0.04 * entrance
        );
        ctx.lineWidth = px(FRESNEL_EDGE_W, minDim);
        ctx.stroke();
      }

      // ── Chromatic RGB fringe at twist point (u ≈ π) ─────
      const twistU = Math.PI;
      const twistP = mobiusPoint(twistU, 0, R, halfW, s.rotY);
      const twistX = cx + twistP.x; const twistY = cy + twistP.y;
      const spreadPx = px(CHROMATIC_SPREAD, minDim);
      const chromaticColors: RGB[] = [[255, 60, 60], [60, 255, 60], [80, 80, 255]];
      const chromaticOffsets = [-1, 0, 1];
      for (let ci = 0; ci < 3; ci++) {
        const offX = chromaticOffsets[ci] * spreadPx;
        const cGlowR = px(0.02, minDim);
        const cg = ctx.createRadialGradient(twistX + offX, twistY, 0, twistX + offX, twistY, cGlowR);
        cg.addColorStop(0, rgba(chromaticColors[ci], ALPHA.glow.max * 0.06 * totalProgress * entrance));
        cg.addColorStop(0.5, rgba(chromaticColors[ci], ALPHA.glow.max * 0.02 * totalProgress * entrance));
        cg.addColorStop(1, rgba(chromaticColors[ci], 0));
        ctx.fillStyle = cg; ctx.fillRect(twistX + offX - cGlowR, twistY - cGlowR, cGlowR * 2, cGlowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Tracer with glow trail
      // ════════════════════════════════════════════════════
      if (s.trail.length > 0) {
        for (let ti = s.trail.length - 1; ti >= 0; ti--) {
          const t = 1 - ti / s.trail.length;
          const tp = s.trail[ti];
          const tR = px(0.004 * t, minDim);
          const sideColor = tp.side > 0 ? s.primaryRgb : s.accentRgb;
          // Trail glow
          const tgR = tR * 3;
          const tg = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tgR);
          tg.addColorStop(0, rgba(sideColor, ALPHA.glow.max * 0.06 * t * entrance));
          tg.addColorStop(1, rgba(sideColor, 0));
          ctx.fillStyle = tg; ctx.fillRect(tp.x - tgR, tp.y - tgR, tgR * 2, tgR * 2);
          // Dot
          ctx.beginPath(); ctx.arc(tp.x, tp.y, tR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(sideColor, [255, 255, 255] as RGB, t * 0.4), ALPHA.content.max * 0.4 * t * entrance);
          ctx.fill();
        }
        // Tracer head
        const head = s.trail[0];
        const headR = px(0.008, minDim);
        const headColor = head.side > 0 ? s.primaryRgb : s.accentRgb;
        ctx.beginPath(); ctx.arc(head.x, head.y, headR, 0, Math.PI * 2);
        const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, headR);
        hg.addColorStop(0, rgba(lerpColor(headColor, [255, 255, 255] as RGB, 0.5), ALPHA.content.max * 0.5 * entrance));
        hg.addColorStop(0.5, rgba(headColor, ALPHA.content.max * 0.3 * entrance));
        hg.addColorStop(1, rgba(headColor, 0));
        ctx.fillStyle = hg; ctx.fill();
        // ── Specular highlight on tracer head ──────────
        ctx.beginPath();
        ctx.ellipse(head.x - headR * 0.25, head.y - headR * 0.3, headR * 0.35, headR * 0.18, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, SPECULAR_INTENSITY * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Chromatic fringe + completion glow
      // ════════════════════════════════════════════════════
      if (s.completed) {
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = R * (1.2 + gi * 0.3);
          const gA = ALPHA.glow.max * 0.04 * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, gR);
          gg.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), gA));
          gg.addColorStop(0.5, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      if (totalProgress > 0.01) {
        ctx.beginPath(); ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * totalProgress);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.dragging = true;
      if (!s.dragNotified) { s.dragNotified = true; callbacksRef.current.onHaptic('drag_snap'); }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}