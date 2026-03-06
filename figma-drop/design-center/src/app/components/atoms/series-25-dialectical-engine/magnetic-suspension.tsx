/**
 * ATOM 246: THE MAGNETIC SUSPENSION ENGINE
 * ==========================================
 * Series 25 — Dialectical Engine · Position 6
 *
 * Truth is found hovering in the uncomfortable space between extremes.
 * Hold the node in the dead zone — the precarious equilibrium between
 * four magnetic poles that want to capture you.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - Four magnetic poles emit field wavefronts
 *   - Interference patterns visible as iron-filing-like particles
 *     that align along field lines of constructive interference
 *   - At dead center, all four waves cancel → destructive zone = calm
 *   - Moving away from center → chaotic constructive fringes pull you
 *   - 200+ field particles respond to interference intensity
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + dead-zone glow
 *   2. Magnetic field interference fringes (200+ particles)
 *   3. Pole shadows
 *   4. Pole bodies with multi-stop gradients + specular
 *   5. Field lines connecting poles (Fresnel glow)
 *   6. Draggable node with glow layers
 *   7. Suspension glow / completion burst
 *   8. Progress ring
 *
 * INTERACTION:
 *   Drag node → navigate to dead zone (drag_snap, error_boundary, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Node centered with full field visible, static
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Pole positions (viewport fractions, 4 corners of a diamond) */
const POLES = [
  { x: 0.5, y: 0.22 },   // top
  { x: 0.5, y: 0.78 },   // bottom
  { x: 0.22, y: 0.5 },   // left
  { x: 0.78, y: 0.5 },   // right
];
/** Magnetic attraction force coefficient */
const ATTRACT_K = 0.0003;
/** Node velocity damping */
const NODE_DAMP = 0.92;
/** Dead zone radius (viewport fraction) */
const DEAD_ZONE_R = 0.04;
/** Snap zone — distance at which error fires */
const SNAP_ZONE = 0.08;
/** Frames in dead zone for completion */
const SUSPEND_FRAMES = 90;
/** Pole visual radius */
const POLE_R = 0.02;
/** Node visual radius */
const NODE_R = SIZE.md * 0.12;
/** Field particle count */
const FIELD_PARTICLE_COUNT = 200;
/** Glow layers */
const GLOW_LAYERS = 5;
/** Interference fringe wavelength */
const FRINGE_LAMBDA = 0.035;
/** Field line count per pole pair */
const FIELD_LINE_COUNT = 8;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Breath modulation on field intensity */
const BREATH_FIELD_MOD = 0.12;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

interface FieldParticle {
  x: number; y: number;
  baseX: number; baseY: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function MagneticSuspensionAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  // Pre-generate field particles
  const initParticles = (): FieldParticle[] => {
    const pts: FieldParticle[] = [];
    for (let i = 0; i < FIELD_PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 0.08 + Math.random() * 0.35;
      const x = 0.5 + Math.cos(angle) * r;
      const y = 0.5 + Math.sin(angle) * r;
      pts.push({ x, y, baseX: x, baseY: y });
    }
    return pts;
  };

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    nodeX: 0.35, nodeY: 0.35, nodeVx: 0, nodeVy: 0,
    dragging: false, dragNotified: false, errorNotified: false,
    suspendFrames: 0, completed: false,
    fieldParticles: initParticles(),
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
        s.nodeX = 0.5; s.nodeY = 0.5; s.completed = true; s.suspendFrames = SUSPEND_FRAMES + 1;
      }

      // ── Node physics (magnetic attraction to poles) ────
      if (!s.dragging) {
        let fx = 0, fy = 0;
        for (const pole of POLES) {
          const dx = pole.x - s.nodeX;
          const dy = pole.y - s.nodeY;
          const dist = Math.max(0.02, Math.hypot(dx, dy));
          const force = ATTRACT_K / (dist * dist);
          fx += (dx / dist) * force * ms;
          fy += (dy / dist) * force * ms;
        }
        s.nodeVx = (s.nodeVx + fx) * NODE_DAMP;
        s.nodeVy = (s.nodeVy + fy) * NODE_DAMP;
        s.nodeX += s.nodeVx * ms;
        s.nodeY += s.nodeVy * ms;
        s.nodeX = Math.max(0.1, Math.min(0.9, s.nodeX));
        s.nodeY = Math.max(0.1, Math.min(0.9, s.nodeY));
      }

      const distToCenter = Math.hypot(s.nodeX - 0.5, s.nodeY - 0.5);
      const inDeadZone = distToCenter < DEAD_ZONE_R;
      const suspendProgress = Math.max(0, 1 - distToCenter / 0.3);

      if (inDeadZone) s.suspendFrames += ms;
      else s.suspendFrames = Math.max(0, s.suspendFrames - 2);

      // Haptics
      if (distToCenter < SNAP_ZONE && !inDeadZone && !s.errorNotified) {
        s.errorNotified = true; cb.onHaptic('error_boundary');
        setTimeout(() => { stateRef.current.errorNotified = false; }, 600);
      }
      if (s.suspendFrames > SUSPEND_FRAMES && !s.completed) {
        s.completed = true; cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.completed ? 1 : suspendProgress * 0.95);

      const breathMod = 1 + breath * BREATH_FIELD_MOD;

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Dead-zone glow
      // ════════════════════════════════════════════════════
      const dzR = px(DEAD_ZONE_R * 2.5, minDim) * breathMod;
      for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = dzR * (1 + gi * 0.5 + suspendProgress * 0.5);
        const gA = ALPHA.glow.max * (0.01 + suspendProgress * 0.06) * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(s.primaryRgb, gA));
        gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.5));
        gg.addColorStop(0.7, rgba(s.primaryRgb, gA * 0.1));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Field interference particles (SIGNATURE)
      // ════════════════════════════════════════════════════
      const lambda = px(FRINGE_LAMBDA, minDim);
      for (const fp of s.fieldParticles) {
        // Compute interference from all 4 poles at this particle position
        const fpx = fp.baseX * w;
        const fpy = fp.baseY * h;
        let phaseSum = 0;
        for (let pi = 0; pi < POLES.length; pi++) {
          const d = Math.hypot(fpx - POLES[pi].x * w, fpy - POLES[pi].y * h);
          phaseSum += Math.cos(d / lambda * Math.PI * 2 + time * 0.3 + pi * Math.PI * 0.5);
        }
        const intensity = (phaseSum / POLES.length + 1) * 0.5; // normalize to 0–1
        const nodeInfluence = Math.max(0, 1 - Math.hypot(fp.baseX - s.nodeX, fp.baseY - s.nodeY) / 0.3);
        const fA = ALPHA.content.max * 0.06 * intensity * (0.3 + nodeInfluence * 0.7) * entrance;
        if (fA < 0.001) continue;

        // Particles align along field lines (rotate toward nearest pole)
        let nearestAngle = 0; let nearestDist = 999;
        for (const pole of POLES) {
          const d = Math.hypot(fp.baseX - pole.x, fp.baseY - pole.y);
          if (d < nearestDist) { nearestDist = d; nearestAngle = Math.atan2(pole.y - fp.baseY, pole.x - fp.baseX); }
        }
        const pLen = px(0.005 * (0.3 + intensity * 0.7), minDim);
        const pCol = lerpColor(s.primaryRgb, s.accentRgb, intensity);
        ctx.beginPath();
        ctx.moveTo(fpx - Math.cos(nearestAngle) * pLen, fpy - Math.sin(nearestAngle) * pLen);
        ctx.lineTo(fpx + Math.cos(nearestAngle) * pLen, fpy + Math.sin(nearestAngle) * pLen);
        ctx.strokeStyle = rgba(pCol, fA);
        ctx.lineWidth = px(STROKE.hairline, minDim) * (0.5 + intensity);
        ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3-4: Magnetic poles
      // ════════════════════════════════════════════════════
      for (let pi = 0; pi < POLES.length; pi++) {
        const pole = POLES[pi];
        const ppx = pole.x * w; const ppy = pole.y * h;
        const pR = px(POLE_R, minDim);

        // Shadow
        const shadowR = pR * 2.5;
        const shadow = ctx.createRadialGradient(ppx, ppy + pR * 0.3, 0, ppx, ppy + pR * 0.3, shadowR);
        shadow.addColorStop(0, rgba([0, 0, 0] as RGB, 0.04 * entrance));
        shadow.addColorStop(1, rgba([0, 0, 0] as RGB, 0));
        ctx.fillStyle = shadow; ctx.fillRect(ppx - shadowR, ppy - shadowR, shadowR * 2, shadowR * 2);

        // Pole glow
        const pGlowR = pR * 4;
        const pg = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, pGlowR);
        pg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * entrance));
        pg.addColorStop(0.5, rgba(s.accentRgb, ALPHA.glow.max * 0.02 * entrance));
        pg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = pg; ctx.fillRect(ppx - pGlowR, ppy - pGlowR, pGlowR * 2, pGlowR * 2);

        // Pole body (4-stop gradient)
        const pGrad = ctx.createRadialGradient(ppx - pR * 0.2, ppy - pR * 0.2, pR * 0.1, ppx, ppy, pR);
        const pA = ALPHA.content.max * 0.3 * entrance;
        pGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.4), pA));
        pGrad.addColorStop(0.35, rgba(s.accentRgb, pA * 0.85));
        pGrad.addColorStop(0.7, rgba(s.accentRgb, pA * 0.5));
        pGrad.addColorStop(1, rgba(s.accentRgb, pA * 0.15));
        ctx.beginPath(); ctx.arc(ppx, ppy, pR, 0, Math.PI * 2);
        ctx.fillStyle = pGrad; ctx.fill();

        // Pole specular
        ctx.beginPath();
        ctx.ellipse(ppx - pR * 0.2, ppy - pR * 0.3, pR * 0.3, pR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Field lines (Fresnel glow)
      // ════════════════════════════════════════════════════
      for (let pi = 0; pi < POLES.length; pi++) {
        for (let pj = pi + 1; pj < POLES.length; pj++) {
          const p1 = POLES[pi]; const p2 = POLES[pj];
          const lineAlpha = ALPHA.content.max * 0.03 * entrance;
          // Curved field line
          ctx.beginPath();
          const midX = (p1.x + p2.x) / 2 * w;
          const midY = (p1.y + p2.y) / 2 * h;
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.quadraticCurveTo(midX + (cx - midX) * 0.3, midY + (cy - midY) * 0.3, p2.x * w, p2.y * h);
          ctx.strokeStyle = rgba(s.primaryRgb, lineAlpha);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
          // Fresnel glow
          ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), lineAlpha * 0.3);
          ctx.lineWidth = px(STROKE.hairline * 3, minDim);
          ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Draggable node
      // ════════════════════════════════════════════════════
      const nxPx = s.nodeX * w; const nyPx = s.nodeY * h;
      const nR = px(NODE_R, minDim);

      // Node multi-layer glow
      for (let gi = 3; gi >= 0; gi--) {
        const gR = nR * (2 + gi * 1.5 + suspendProgress * 2);
        const gA = ALPHA.glow.max * (0.03 + suspendProgress * 0.06) * entrance / (gi + 1);
        const ng = ctx.createRadialGradient(nxPx, nyPx, 0, nxPx, nyPx, gR);
        ng.addColorStop(0, rgba(s.primaryRgb, gA));
        ng.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
        ng.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ng; ctx.fillRect(nxPx - gR, nyPx - gR, gR * 2, gR * 2);
      }

      // Node body
      const nGrad = ctx.createRadialGradient(nxPx - nR * 0.2, nyPx - nR * 0.2, nR * 0.05, nxPx, nyPx, nR);
      const nA = ALPHA.content.max * (0.25 + suspendProgress * 0.2) * entrance;
      nGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.45), nA));
      nGrad.addColorStop(0.3, rgba(s.primaryRgb, nA * 0.85));
      nGrad.addColorStop(0.7, rgba(s.primaryRgb, nA * 0.5));
      nGrad.addColorStop(1, rgba(s.primaryRgb, nA * 0.15));
      ctx.beginPath(); ctx.arc(nxPx, nyPx, nR, 0, Math.PI * 2);
      ctx.fillStyle = nGrad; ctx.fill();
      // Edge
      ctx.beginPath(); ctx.arc(nxPx, nyPx, nR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.15), ALPHA.content.max * 0.06 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      // Specular
      ctx.beginPath();
      ctx.ellipse(nxPx - nR * 0.2, nyPx - nR * 0.3, nR * 0.3, nR * 0.15, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.2 * entrance); ctx.fill();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : Math.min(1, s.suspendFrames / SUSPEND_FRAMES);
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
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      if (Math.hypot(mx - s.nodeX, my - s.nodeY) < 0.08) {
        s.dragging = true;
        if (!s.dragNotified) { s.dragNotified = true; callbacksRef.current.onHaptic('drag_snap'); }
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.nodeX = (e.clientX - rect.left) / rect.width;
      s.nodeY = (e.clientY - rect.top) / rect.height;
      s.nodeVx = 0; s.nodeVy = 0;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
