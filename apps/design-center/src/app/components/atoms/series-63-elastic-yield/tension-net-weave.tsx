/**
 * ATOM 625: THE TENSION NET ENGINE
 * ==================================
 * Series 63 — Elastic Yield · Position 5
 *
 * Cure the martyr complex. A single thread snaps under the boulder.
 * Weave a dense horizontal net — the load disperses across 50 nodes
 * catching the weight with zero broken threads.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Single thread shows stress concentration → yield → snap (red→white→break)
 *   - Woven net distributes stress across all nodes (even cool blue)
 *   - Each net node renders its local stress as color (based on proximity to boulder)
 *   - On catch: stress wave propagates outward from impact point
 *   - Beautiful stress distribution pattern = "community absorbs catastrophe"
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + gravity field gradient
 *   2. Net shadow beneath
 *   3. Broken thread with stress fracture glow
 *   4. Woven net with per-segment stress coloring
 *   5. Net node stress indicators (colored by load share)
 *   6. Boulder with specular + impact glow
 *   7. Stress wave propagation / catch bloom
 *   8. Progress ring
 *
 * PHYSICS:
 *   - Boulder drops under gravity
 *   - Single thread snaps (stress exceeds yield)
 *   - Draw to weave net; net density determines catch threshold
 *   - On catch: stress distributes mathematically across nodes
 *   - Breath modulates net glow + node pulse
 *
 * INTERACTION:
 *   Draw → weave net → boulder catches
 *   (error_boundary, drag_snap, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static net with evenly-distributed stress, boulder caught
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS HELPER
// ═════════════════════════════════════════════════════════════════════

/** Stress-to-heat color mapping */
function stressHeat(s: number): RGB {
  if (s < 0.25) return lerpColor([50, 90, 200] as RGB, [60, 180, 130] as RGB, s / 0.25);
  if (s < 0.5) return lerpColor([60, 180, 130] as RGB, [220, 200, 50] as RGB, (s - 0.25) / 0.25);
  if (s < 0.75) return lerpColor([220, 200, 50] as RGB, [220, 80, 60] as RGB, (s - 0.5) / 0.25);
  return lerpColor([220, 80, 60] as RGB, [255, 240, 240] as RGB, (s - 0.75) / 0.25);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Boulder radius (hero element) */
const BOULDER_R = SIZE.md * 0.18;
/** Net Y position (fraction from top) */
const NET_Y_FRAC = 0.58;
/** Boulder start Y */
const BOULDER_START_Y = 0.08;
/** Boulder gravity */
const BOULDER_GRAVITY = 0.003;
/** Single thread snap delay frames */
const SNAP_DELAY = 40;
/** Net catch threshold (density) */
const CATCH_THRESHOLD = 0.6;
/** Max weave points for full density */
const MAX_WEAVE_POINTS = 60;
/** Net extent (fraction of viewport) */
const NET_EXTENT = 0.35;
/** Stress wave speed */
const STRESS_WAVE_SPEED = 0.04;
/** Node stress dot radius */
const NODE_DOT_R = 0.004;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Respawn delay */
const RESPAWN_DELAY = 100;
/** Boulder reset Y (off screen) */
const BOULDER_RESET_Y = 1.3;
/** Specular intensity */
const SPECULAR_K = 0.25;
/** Breath net glow mod */
const BREATH_NET_MOD = 0.1;
/** Broken thread segments */
const BROKEN_THREAD_SEGS = 6;
/** Stress wave duration frames */
const STRESS_WAVE_LIFE = 40;

// ═════════════════════════════════════════════════════════════════════
// STATE
// ═════════════════════════════════════════════════════════════════════

interface NetNode {
  x: number; y: number;
  stress: number;
  connected: number; // number of connections
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function TensionNetWeaveAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    weavePoints: [] as { x: number; y: number }[],
    drawing: false,
    netDensity: 0,
    singleSnapped: false,
    boulderY: BOULDER_START_Y,
    boulderDropping: false,
    caught: false,
    completed: false,
    respawnTimer: 0,
    stressWaveTime: -1, // -1 = no wave
    stressWaveOrigin: { x: 0, y: 0 },
    catchBowDepth: 0, // how much net bows on catch
    snapNotified: false,
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
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude; s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + gravity field
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Subtle gravity gradient (darker at bottom)
      const gravGrad = ctx.createLinearGradient(0, 0, 0, h);
      gravGrad.addColorStop(0, rgba([0, 0, 0] as RGB, 0));
      gravGrad.addColorStop(0.8, rgba([0, 0, 0] as RGB, 0));
      gravGrad.addColorStop(1, rgba([0, 0, 0] as RGB, 0.025 * entrance));
      ctx.fillStyle = gravGrad; ctx.fillRect(0, 0, w, h);

      const netY = h * NET_Y_FRAC;
      const boulderR = px(BOULDER_R, minDim);
      const netLeft = cx - minDim * NET_EXTENT;
      const netRight = cx + minDim * NET_EXTENT;

      // ── Reduced motion ─────────────────────────────────
      if (p.reducedMotion) {
        // Static net with distributed stress
        const nodeCount = 12;
        for (let i = 0; i < nodeCount; i++) {
          const t = i / (nodeCount - 1);
          const nx = netLeft + t * (netRight - netLeft);
          const stress = 0.15 + 0.1 * Math.sin(t * Math.PI);
          const sc = stressHeat(stress);
          ctx.beginPath(); ctx.arc(nx, netY, px(NODE_DOT_R, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(sc, ALPHA.content.max * 0.2 * entrance); ctx.fill();
          if (i < nodeCount - 1) {
            const nx2 = netLeft + (i + 1) / (nodeCount - 1) * (netRight - netLeft);
            ctx.beginPath(); ctx.moveTo(nx, netY); ctx.lineTo(nx2, netY);
            ctx.strokeStyle = rgba(sc, ALPHA.content.max * 0.12 * entrance);
            ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
          }
        }
        ctx.beginPath(); ctx.arc(cx, netY - boulderR * 0.3, boulderR * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance); ctx.fill();
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Auto-snap single thread ────────────────────────
      if (!s.singleSnapped && s.frameCount > SNAP_DELAY) {
        s.singleSnapped = true;
        s.boulderDropping = true;
        cb.onHaptic('error_boundary');
      }

      // ── Boulder physics ────────────────────────────────
      if (s.boulderDropping && !s.caught && !s.completed) {
        s.boulderY += BOULDER_GRAVITY;
        if (s.boulderY * h >= netY - boulderR) {
          if (s.netDensity >= CATCH_THRESHOLD) {
            s.caught = true;
            s.stressWaveTime = 0;
            s.stressWaveOrigin = { x: cx, y: netY };
            cb.onHaptic('step_advance');
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          } else {
            if (s.boulderY > BOULDER_RESET_Y) {
              s.boulderY = BOULDER_START_Y;
              s.boulderDropping = false;
              setTimeout(() => {
                if (stateRef.current === s) s.boulderDropping = true;
              }, 1200);
            }
          }
        }
      }

      // Catch bow animation
      if (s.caught) {
        s.catchBowDepth = Math.min(1, s.catchBowDepth + 0.03);
        // Slow recovery
        if (s.catchBowDepth >= 0.8) {
          s.catchBowDepth = Math.max(0.3, s.catchBowDepth - 0.005);
        }
      }

      // Stress wave
      if (s.stressWaveTime >= 0) {
        s.stressWaveTime += STRESS_WAVE_SPEED;
        if (s.stressWaveTime > 1.5) s.stressWaveTime = -1;
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Net shadow
      // ════════════════════════════════════════════════════
      if (s.weavePoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(s.weavePoints[0].x, s.weavePoints[0].y + 3);
        for (let i = 1; i < s.weavePoints.length; i++) {
          ctx.lineTo(s.weavePoints[i].x, s.weavePoints[i].y + 3);
        }
        ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.02 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Broken single thread with stress glow
      // ════════════════════════════════════════════════════
      if (s.singleSnapped) {
        const threadTop = netY - minDim * 0.12;
        // Left dangling piece
        for (let si = 0; si < BROKEN_THREAD_SEGS; si++) {
          const t0 = si / BROKEN_THREAD_SEGS; const t1 = (si + 1) / BROKEN_THREAD_SEGS;
          const x0 = cx - minDim * 0.005 * t0;
          const y0 = threadTop + t0 * (netY - threadTop) * 0.5;
          const x1 = cx - minDim * 0.008 * t1;
          const y1 = threadTop + t1 * (netY - threadTop) * 0.5;
          const segStress = 0.8 + t0 * 0.2;
          const sc = stressHeat(segStress);
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
          ctx.strokeStyle = rgba(sc, ALPHA.content.max * 0.12 * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        }
        // Snap point glow
        const snapGlowR = px(0.015, minDim);
        const sg = ctx.createRadialGradient(cx, netY - minDim * 0.06, 0, cx, netY - minDim * 0.06, snapGlowR);
        sg.addColorStop(0, rgba(stressHeat(1.0), ALPHA.glow.max * 0.06 * entrance));
        sg.addColorStop(1, rgba(stressHeat(1.0), 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - snapGlowR, netY - minDim * 0.06 - snapGlowR, snapGlowR * 2, snapGlowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Woven net with stress coloring
      // ════════════════════════════════════════════════════
      if (s.weavePoints.length > 1) {
        const bowOffset = s.caught ? s.catchBowDepth * minDim * 0.04 : 0;

        for (let i = 0; i < s.weavePoints.length - 1; i++) {
          const p0 = s.weavePoints[i]; const p1 = s.weavePoints[i + 1];
          // Each segment's stress based on distance to boulder impact point
          const segMidX = (p0.x + p1.x) / 2;
          const segMidY = (p0.y + p1.y) / 2;
          let segStress: number;
          if (s.caught) {
            const distFromImpact = Math.hypot(segMidX - cx, segMidY - netY) / (minDim * NET_EXTENT);
            segStress = Math.max(0.05, 0.4 - distFromImpact * 0.35); // evenly distributed
          } else {
            segStress = 0.1; // low stress when just woven
          }
          const sc = stressHeat(segStress);
          const y0 = p0.y + (s.caught ? bowOffset * Math.sin(((p0.x - netLeft) / (netRight - netLeft)) * Math.PI) : 0);
          const y1 = p1.y + (s.caught ? bowOffset * Math.sin(((p1.x - netLeft) / (netRight - netLeft)) * Math.PI) : 0);

          ctx.beginPath(); ctx.moveTo(p0.x, y0); ctx.lineTo(p1.x, y1);
          ctx.strokeStyle = rgba(sc, ALPHA.content.max * (0.1 + segStress * 0.2) * entrance);
          ctx.lineWidth = px(STROKE.thin + segStress * STROKE.light, minDim);
          ctx.lineCap = 'round'; ctx.stroke();

          // Glow on stressed segments
          if (segStress > 0.2) {
            ctx.beginPath(); ctx.moveTo(p0.x, y0); ctx.lineTo(p1.x, y1);
            ctx.strokeStyle = rgba(sc, ALPHA.glow.max * 0.02 * segStress * entrance);
            ctx.lineWidth = px(STROKE.medium * 2, minDim); ctx.stroke();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Net node stress indicators
      // ════════════════════════════════════════════════════
      if (s.weavePoints.length > 0) {
        const step = Math.max(1, Math.floor(s.weavePoints.length / 25));
        for (let i = 0; i < s.weavePoints.length; i += step) {
          const pt = s.weavePoints[i];
          let nodeStress: number;
          if (s.caught) {
            const dist = Math.hypot(pt.x - cx, pt.y - netY) / (minDim * NET_EXTENT);
            nodeStress = Math.max(0.05, 0.35 - dist * 0.3);
            // Stress wave effect
            if (s.stressWaveTime >= 0) {
              const waveR = s.stressWaveTime * minDim * NET_EXTENT;
              const nodeDist = Math.hypot(pt.x - s.stressWaveOrigin.x, pt.y - s.stressWaveOrigin.y);
              const waveDelta = Math.abs(nodeDist - waveR) / (minDim * 0.05);
              if (waveDelta < 1) nodeStress = Math.min(1, nodeStress + (1 - waveDelta) * 0.4);
            }
          } else {
            nodeStress = 0.08;
          }
          const sc = stressHeat(nodeStress);
          const bowY = s.caught ? s.catchBowDepth * minDim * 0.04 * Math.sin(((pt.x - netLeft) / (netRight - netLeft)) * Math.PI) : 0;
          const dotR = px(NODE_DOT_R * (0.8 + nodeStress * 0.5), minDim) * (1 + breath * BREATH_NET_MOD);

          // Node glow
          const ngR = dotR * 3;
          const ng = ctx.createRadialGradient(pt.x, pt.y + bowY, 0, pt.x, pt.y + bowY, ngR);
          ng.addColorStop(0, rgba(sc, ALPHA.glow.max * 0.04 * nodeStress * entrance));
          ng.addColorStop(1, rgba(sc, 0));
          ctx.fillStyle = ng;
          ctx.fillRect(pt.x - ngR, pt.y + bowY - ngR, ngR * 2, ngR * 2);

          // Node dot
          ctx.beginPath(); ctx.arc(pt.x, pt.y + bowY, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(sc, ALPHA.content.max * (0.15 + nodeStress * 0.25) * entrance);
          ctx.fill();
        }
      }

      // Net density glow field
      if (s.netDensity > 0.2) {
        const netGlowR = minDim * 0.15 * s.netDensity * (1 + breath * 0.05);
        const ngg = ctx.createRadialGradient(cx, netY, 0, cx, netY, netGlowR);
        ngg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.04 * s.netDensity * entrance));
        ngg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.015 * s.netDensity * entrance));
        ngg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = ngg;
        ctx.fillRect(cx - netGlowR, netY - netGlowR, netGlowR * 2, netGlowR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Boulder with specular
      // ════════════════════════════════════════════════════
      const by = s.caught ? netY - boulderR * 0.3 + s.catchBowDepth * minDim * 0.04 : s.boulderY * h;

      // Boulder shadow
      ctx.beginPath();
      ctx.ellipse(cx + 2, by + boulderR * 0.7, boulderR * 0.5, boulderR * 0.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba([0, 0, 0] as RGB, 0.025 * entrance); ctx.fill();

      // Boulder glow
      const bgR = boulderR * 3;
      const bg = ctx.createRadialGradient(cx, by, 0, cx, by, bgR);
      bg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.05 * entrance));
      bg.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = bg; ctx.fillRect(cx - bgR, by - bgR, bgR * 2, bgR * 2);

      // Boulder body (5-stop gradient)
      const bBody = ctx.createRadialGradient(
        cx - boulderR * 0.15, by - boulderR * 0.15, boulderR * 0.05,
        cx, by, boulderR
      );
      const bA = ALPHA.content.max * 0.4 * entrance;
      bBody.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.3), bA));
      bBody.addColorStop(0.2, rgba(s.accentRgb, bA));
      bBody.addColorStop(0.5, rgba(s.accentRgb, bA * 0.8));
      bBody.addColorStop(0.8, rgba(lerpColor(s.accentRgb, [0, 0, 0] as RGB, 0.15), bA * 0.5));
      bBody.addColorStop(1, rgba(s.accentRgb, bA * 0.1));
      ctx.beginPath(); ctx.arc(cx, by, boulderR, 0, Math.PI * 2);
      ctx.fillStyle = bBody; ctx.fill();

      // Specular
      ctx.beginPath();
      ctx.ellipse(cx - boulderR * 0.2, by - boulderR * 0.25, boulderR * 0.28, boulderR * 0.14, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, SPECULAR_K * entrance); ctx.fill();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Stress wave / catch bloom
      // ════════════════════════════════════════════════════
      if (s.stressWaveTime >= 0 && s.stressWaveTime < 1.5) {
        const waveR = s.stressWaveTime * minDim * NET_EXTENT;
        const waveAlpha = (1 - s.stressWaveTime / 1.5) * ALPHA.glow.max * 0.06 * entrance;
        ctx.beginPath();
        ctx.arc(s.stressWaveOrigin.x, s.stressWaveOrigin.y, waveR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(stressHeat(0.3), waveAlpha);
        ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();
      }

      if (s.completed) {
        const bloomT = Math.min(1, (RESPAWN_DELAY - s.respawnTimer) / 30);
        const bloomR = minDim * 0.12 * (1 + bloomT * 0.5);
        const bloom = ctx.createRadialGradient(cx, netY, 0, cx, netY, bloomR);
        bloom.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.15), ALPHA.glow.max * 0.05 * bloomT * entrance));
        bloom.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.02 * bloomT * entrance));
        bloom.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bloom; ctx.fillRect(cx - bloomR, netY - bloomR, bloomR * 2, bloomR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : s.netDensity * 0.8;
      if (prog > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.weavePoints = []; s.netDensity = 0; s.singleSnapped = false;
          s.boulderY = BOULDER_START_Y; s.boulderDropping = false;
          s.caught = false; s.completed = false; s.stressWaveTime = -1;
          s.catchBowDepth = 0;
        }
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      s.drawing = true;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.weavePoints.push({ x: mx, y: my });
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.drawing) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (viewport.width / rect.width);
      const my = (e.clientY - rect.top) * (viewport.height / rect.height);
      s.weavePoints.push({ x: mx, y: my });
      s.netDensity = Math.min(1, s.weavePoints.length / MAX_WEAVE_POINTS);
      cbRef.current.onStateChange?.(s.netDensity * 0.8);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.drawing = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
