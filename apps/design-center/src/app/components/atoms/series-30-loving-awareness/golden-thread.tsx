/**
 * ATOM 293: THE GOLDEN THREAD ENGINE
 * =====================================
 * Series 30 — Loving Awareness · Position 3
 *
 * Connect the Pain, the Surviving, and the Now with a single thread.
 * The pain is retroactively transformed into fuel.
 *
 * PHYSICS:
 *   - Three glowing nodes arranged vertically: Pain (top, dim),
 *     Surviving (middle, pulsing), Now (bottom, bright)
 *   - Drag from Now upward to draw a golden Bezier thread
 *   - As thread touches each node, the node transforms from dim→golden
 *   - Sacred geometry ring emanates around each connected node
 *   - Thread shimmer particles flow along the golden thread
 *   - A pulse of golden light travels backward along the thread
 *   - Specular highlights appear on illuminated nodes
 *   - Volumetric light shafts emanate from fully connected nodes
 *   - Breath modulates node glow warmth, thread shimmer speed, and pulse depth
 *   - Completion: all three connected, single golden lifeline pulses
 *
 * INTERACTION:
 *   Drag (upward from bottom node) → draws golden thread through timeline
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static connected thread with golden nodes
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Node vertical positions (fraction of viewport height) */
const NODE_Y_PAIN = 0.2;
const NODE_Y_SURVIVE = 0.5;
const NODE_Y_NOW = 0.8;
/** Node radius */
const NODE_R_FRAC = 0.038;
/** Node connection hit distance */
const NODE_HIT_DIST = 0.06;
/** Thread draw width */
const THREAD_WIDTH = 0.004;
/** Golden pulse speed (normalized per frame) */
const PULSE_SPEED = 0.012;
/** Glow layers per node */
const NODE_GLOW_LAYERS = 4;
/** Connection illumination speed */
const ILLUMINATE_RATE = 0.028;
/** Breath modulates glow warmth */
const BREATH_WARMTH = 0.06;
/** Breath modulates thread shimmer speed */
const BREATH_SHIMMER = 0.05;
/** Breath modulates pulse depth */
const BREATH_PULSE = 0.04;
/** Spark count per connection */
const SPARKS_PER_NODE = 10;
/** Spark life */
const SPARK_LIFE = 50;
/** Thread curvature control offset */
const BEZIER_OFFSET_X = 0.12;
/** Thread shimmer particle count */
const SHIMMER_COUNT = 30;
/** Shimmer particle speed along thread */
const SHIMMER_SPEED = 0.008;
/** Sacred geometry ring petals per node */
const SACRED_PETALS = 6;
/** Sacred ring radius multiplier */
const SACRED_RING_R = 2.2;
/** Specular highlight size */
const SPECULAR_R = 0.012;
/** Volumetric ray count per illuminated node */
const NODE_RAY_COUNT = 6;
/** Node ray max length */
const NODE_RAY_LENGTH = 0.12;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Spark particle emitted on connection */
interface GoldenSpark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
}

/** Timeline node */
interface TimelineNode {
  y: number;
  connected: boolean;
  illumination: number;
  label: string;
}

/** Thread shimmer particle */
interface ShimmerParticle {
  t: number;       // position along thread 0–1
  speed: number;
  size: number;
  phase: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function GoldenThreadAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
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
    nodes: [
      { y: NODE_Y_PAIN, connected: false, illumination: 0, label: 'Pain' },
      { y: NODE_Y_SURVIVE, connected: false, illumination: 0, label: 'Surviving' },
      { y: NODE_Y_NOW, connected: true, illumination: 1, label: 'Now' },
    ] as TimelineNode[],
    dragging: false,
    threadY: NODE_Y_NOW,
    threadProgress: 0,
    pulsePhase: -1,
    sparks: [] as GoldenSpark[],
    shimmerParticles: Array.from({ length: SHIMMER_COUNT }, (): ShimmerParticle => ({
      t: Math.random(),
      speed: SHIMMER_SPEED * (0.5 + Math.random()),
      size: 0.0015 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2,
    })),
    completed: false,
    stepNotified: [false, false],
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

    const getGoldRgb = (primary: RGB): RGB => lerpColor(primary, [240, 200, 100] as RGB, 0.6);

    /** Get point on the Bezier thread at parameter t (0=Now, 1=tip) */
    const threadPoint = (t: number, cx: number, h: number, threadTop: number, threadBot: number, bezX: number) => {
      const u = 1 - t;
      const midY = (threadBot + threadTop) / 2;
      const x = u * u * u * cx + 3 * u * u * t * bezX + 3 * u * t * t * bezX + t * t * t * cx;
      const y = u * u * u * threadBot + 3 * u * u * t * midY + 3 * u * t * t * midY + t * t * t * threadTop;
      return { x, y };
    };

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

      const goldRgb = getGoldRgb(s.primaryRgb);
      const warmGold = lerpColor(goldRgb, s.accentRgb, breath * BREATH_WARMTH);
      const time = s.frameCount * 0.015;
      const breathPulse = 1 + breath * BREATH_PULSE;

      // ── Reduced motion ──────────────────────────────────────
      if (p.reducedMotion) {
        const bezX = cx + px(BEZIER_OFFSET_X, minDim);
        ctx.beginPath();
        ctx.moveTo(cx, NODE_Y_NOW * h);
        ctx.bezierCurveTo(bezX, NODE_Y_SURVIVE * h, bezX, NODE_Y_SURVIVE * h, cx, NODE_Y_PAIN * h);
        ctx.strokeStyle = rgba(goldRgb, ALPHA.content.max * 0.6 * entrance);
        ctx.lineWidth = px(THREAD_WIDTH, minDim);
        ctx.stroke();

        for (const node of s.nodes) {
          const ny = node.y * h;
          const nr = px(NODE_R_FRAC, minDim);
          const gR = nr * 3;
          const ng = ctx.createRadialGradient(cx, ny, 0, cx, ny, gR);
          ng.addColorStop(0, rgba(goldRgb, ALPHA.glow.max * 0.4 * entrance));
          ng.addColorStop(1, rgba(goldRgb, 0));
          ctx.fillStyle = ng;
          ctx.fillRect(cx - gR, ny - gR, gR * 2, gR * 2);
          ctx.beginPath();
          ctx.arc(cx, ny, nr, 0, Math.PI * 2);
          ctx.fillStyle = rgba(goldRgb, ALPHA.content.max * 0.7 * entrance);
          ctx.fill();
        }
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Auto-resolve ──────────────────────────────────────
      if (p.phase === 'resolve') {
        s.threadY = Math.max(NODE_Y_PAIN, s.threadY - 0.005);
      }

      // ── Node connection detection ─────────────────────────
      for (let i = 0; i < s.nodes.length; i++) {
        const node = s.nodes[i];
        if (!node.connected && s.threadY <= node.y + NODE_HIT_DIST) {
          node.connected = true;
          if (i < 2 && !s.stepNotified[i]) {
            s.stepNotified[i] = true;
            cb.onHaptic('step_advance');
            for (let j = 0; j < SPARKS_PER_NODE; j++) {
              const angle = (j / SPARKS_PER_NODE) * Math.PI * 2;
              const speed = 0.003 + Math.random() * 0.006;
              s.sparks.push({
                x: 0.5, y: node.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: SPARK_LIFE, maxLife: SPARK_LIFE,
              });
            }
          }
        }
        if (node.connected) {
          node.illumination = Math.min(1, node.illumination + ILLUMINATE_RATE * ms);
        }
      }

      s.threadProgress = 1 - (s.threadY - NODE_Y_PAIN) / (NODE_Y_NOW - NODE_Y_PAIN);
      s.threadProgress = Math.max(0, Math.min(1, s.threadProgress));

      if (s.nodes.every(n => n.connected) && s.nodes.every(n => n.illumination > 0.8) && !s.completed) {
        s.completed = true;
        s.pulsePhase = 0;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.threadProgress);

      if (s.pulsePhase >= 0) {
        s.pulsePhase += PULSE_SPEED * ms;
        if (s.pulsePhase > 1.5) s.pulsePhase = 0;
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 1: Timeline axis (faint)
      // ═════════════════════════════════════════════════════════════
      ctx.beginPath();
      ctx.moveTo(cx, NODE_Y_PAIN * h - px(0.02, minDim));
      ctx.lineTo(cx, NODE_Y_NOW * h + px(0.02, minDim));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.25 * entrance);
      ctx.lineWidth = px(0.001, minDim);
      ctx.stroke();

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 2: Golden thread (drawn portion) + shimmer
      // ═════════════════════════════════════════════════════════════
      if (s.threadY < NODE_Y_NOW) {
        const threadTop = s.threadY * h;
        const threadBot = NODE_Y_NOW * h;
        const bezOffset = px(BEZIER_OFFSET_X, minDim);

        // Thread glow (wider, softer)
        ctx.beginPath();
        ctx.moveTo(cx, threadBot);
        ctx.bezierCurveTo(cx + bezOffset, (threadBot + threadTop) / 2, cx + bezOffset, (threadBot + threadTop) / 2, cx, threadTop);
        ctx.strokeStyle = rgba(warmGold, ALPHA.glow.max * 0.22 * entrance);
        ctx.lineWidth = px(THREAD_WIDTH * 3.5, minDim);
        ctx.stroke();

        // Thread core (bright)
        ctx.beginPath();
        ctx.moveTo(cx, threadBot);
        ctx.bezierCurveTo(cx + bezOffset, (threadBot + threadTop) / 2, cx + bezOffset, (threadBot + threadTop) / 2, cx, threadTop);
        ctx.strokeStyle = rgba(goldRgb, ALPHA.content.max * 0.65 * entrance);
        ctx.lineWidth = px(THREAD_WIDTH, minDim);
        ctx.stroke();

        // Shimmer particles along thread
        const breathShimmer = 1 + breath * BREATH_SHIMMER;
        for (const sh of s.shimmerParticles) {
          sh.t = (sh.t + sh.speed * ms * breathShimmer * 0.15) % 1;
          const pt = threadPoint(sh.t, cx, h, threadTop, threadBot, cx + bezOffset);
          const shimAlpha = ALPHA.content.max * 0.3 * (0.5 + 0.5 * Math.sin(time * 2 + sh.phase)) * entrance;
          const shimR = px(sh.size, minDim);

          const sg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, shimR * 2);
          sg.addColorStop(0, rgba(goldRgb, shimAlpha));
          sg.addColorStop(1, rgba(goldRgb, 0));
          ctx.fillStyle = sg;
          ctx.fillRect(pt.x - shimR * 2, pt.y - shimR * 2, shimR * 4, shimR * 4);
        }

        // Backward traveling pulse
        if (s.pulsePhase >= 0) {
          const pulseT = Math.min(1, s.pulsePhase);
          const pt = threadPoint(pulseT, cx, h, threadTop, threadBot, cx + bezOffset);
          if (pt.y >= threadTop && pt.y <= threadBot) {
            const pulseR = px(0.018, minDim) * breathPulse;
            const pg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pulseR * 3);
            pg.addColorStop(0, rgba(goldRgb, ALPHA.glow.max * 0.55 * entrance));
            pg.addColorStop(0.3, rgba(goldRgb, ALPHA.glow.max * 0.2 * entrance));
            pg.addColorStop(1, rgba(goldRgb, 0));
            ctx.fillStyle = pg;
            ctx.fillRect(pt.x - pulseR * 3, pt.y - pulseR * 3, pulseR * 6, pulseR * 6);
          }
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 3: Nodes with sacred geometry + specular + rays
      // ═════════════════════════════════════════════════════════════
      for (const node of s.nodes) {
        const ny = node.y * h;
        const nr = px(NODE_R_FRAC, minDim) * breathPulse;
        const illum = node.illumination;
        const nodeColor = lerpColor(s.accentRgb, warmGold, illum);

        // Volumetric rays from illuminated nodes
        if (illum > 0.5) {
          const rayAlpha = ALPHA.glow.max * 0.05 * (illum - 0.5) / 0.5 * entrance;
          for (let r = 0; r < NODE_RAY_COUNT; r++) {
            const ra = (r / NODE_RAY_COUNT) * Math.PI * 2 + time * 0.03;
            const rl = px(NODE_RAY_LENGTH * illum * (0.5 + 0.5 * Math.sin(time * 0.5 + r)), minDim);
            const rx1 = cx + Math.cos(ra) * nr;
            const ry1 = ny + Math.sin(ra) * nr;
            const rx2 = cx + Math.cos(ra) * (nr + rl);
            const ry2 = ny + Math.sin(ra) * (nr + rl);

            const rg = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
            rg.addColorStop(0, rgba(warmGold, rayAlpha));
            rg.addColorStop(0.4, rgba(warmGold, rayAlpha * 0.3));
            rg.addColorStop(1, rgba(warmGold, 0));
            ctx.beginPath();
            ctx.moveTo(rx1, ry1);
            ctx.lineTo(rx2, ry2);
            ctx.strokeStyle = rg;
            ctx.lineWidth = px(0.003, minDim);
            ctx.stroke();
          }
        }

        // Node glow (multi-layer, 4-stop)
        for (let i = NODE_GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = nr * (2 + i * 1.3) * (1 + illum * 0.5);
          const gA = ALPHA.glow.max * (0.05 + illum * 0.28) * entrance / (i + 1);
          const ng = ctx.createRadialGradient(cx, ny, 0, cx, ny, gR);
          ng.addColorStop(0, rgba(nodeColor, gA));
          ng.addColorStop(0.25, rgba(nodeColor, gA * 0.55));
          ng.addColorStop(0.6, rgba(nodeColor, gA * 0.12));
          ng.addColorStop(1, rgba(nodeColor, 0));
          ctx.fillStyle = ng;
          ctx.fillRect(cx - gR, ny - gR, gR * 2, gR * 2);
        }

        // Sacred geometry ring (illuminated nodes)
        if (illum > 0.3) {
          const sacredR = nr * SACRED_RING_R;
          const sacredAlpha = ALPHA.content.max * 0.1 * (illum - 0.3) / 0.7 * entrance;
          // Ring
          ctx.beginPath();
          ctx.arc(cx, ny, sacredR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmGold, sacredAlpha * 0.4);
          ctx.lineWidth = px(0.0008, minDim);
          ctx.stroke();
          // Petals
          for (let p2 = 0; p2 < SACRED_PETALS; p2++) {
            const pa = (p2 / SACRED_PETALS) * Math.PI * 2 + time * 0.02;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(pa) * nr * 1.1, ny + Math.sin(pa) * nr * 1.1);
            ctx.lineTo(cx + Math.cos(pa) * sacredR, ny + Math.sin(pa) * sacredR);
            ctx.strokeStyle = rgba(warmGold, sacredAlpha);
            ctx.lineWidth = px(0.0008, minDim);
            ctx.stroke();
          }
        }

        // Node core (3-stop gradient)
        ctx.beginPath();
        ctx.arc(cx, ny, nr * (0.55 + illum * 0.45), 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(cx, ny, 0, cx, ny, nr * (0.55 + illum * 0.45));
        coreGrad.addColorStop(0, rgba(nodeColor, ALPHA.content.max * (0.25 + illum * 0.6) * entrance));
        coreGrad.addColorStop(0.5, rgba(nodeColor, ALPHA.content.max * (0.1 + illum * 0.3) * entrance));
        coreGrad.addColorStop(1, rgba(nodeColor, 0));
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Specular highlight
        if (illum > 0.4) {
          const specR2 = px(SPECULAR_R, minDim) * illum;
          const specX = cx - nr * 0.2;
          const specY = ny - nr * 0.25;
          const specG = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR2);
          specG.addColorStop(0, rgba(goldRgb, ALPHA.content.max * 0.4 * illum * entrance));
          specG.addColorStop(0.4, rgba(goldRgb, ALPHA.content.max * 0.1 * illum * entrance));
          specG.addColorStop(1, rgba(goldRgb, 0));
          ctx.fillStyle = specG;
          ctx.fillRect(specX - specR2, specY - specR2, specR2 * 2, specR2 * 2);
        }

        // Progress ring (illuminating)
        if (illum > 0.05 && illum < 1) {
          const ringAngle = illum * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(cx, ny, nr * 1.3, -Math.PI / 2, -Math.PI / 2 + ringAngle);
          ctx.strokeStyle = rgba(goldRgb, ALPHA.content.max * 0.3 * entrance);
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 4: Sparks
      // ═════════════════════════════════════════════════════════════
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.life -= ms;
        if (sp.life <= 0) { s.sparks.splice(i, 1); continue; }

        const lifeRatio = sp.life / sp.maxLife;
        const spx = sp.x * w;
        const spy = sp.y * h;
        const spR = px(0.004 * lifeRatio, minDim);
        const spAlpha = ALPHA.content.max * 0.6 * lifeRatio * entrance;

        const spGlow = ctx.createRadialGradient(spx, spy, 0, spx, spy, spR * 2.5);
        spGlow.addColorStop(0, rgba(goldRgb, spAlpha * 0.5));
        spGlow.addColorStop(0.4, rgba(goldRgb, spAlpha * 0.12));
        spGlow.addColorStop(1, rgba(goldRgb, 0));
        ctx.fillStyle = spGlow;
        ctx.fillRect(spx - spR * 2.5, spy - spR * 2.5, spR * 5, spR * 5);

        ctx.beginPath();
        ctx.arc(spx, spy, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(goldRgb, spAlpha);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (Math.abs(my - Math.min(s.threadY + 0.05, NODE_Y_NOW)) < 0.15) {
        s.dragging = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const my = (e.clientY - rect.top) / rect.height;
      if (my < s.threadY) {
        s.threadY = Math.max(NODE_Y_PAIN - 0.02, my);
      }
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ns-resize' }} />
    </div>
  );
}
