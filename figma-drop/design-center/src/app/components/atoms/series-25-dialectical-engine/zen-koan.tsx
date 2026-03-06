/**
 * ATOM 243: THE ZEN KOAN ENGINE
 * ================================
 * Series 25 — Dialectical Engine · Position 3
 *
 * An impossible Penrose triangle. Trace the line — it loops forever.
 * The solution: tap the empty center. Logic surrenders. Liberation.
 *
 * SIGNATURE TECHNIQUE: Interference Fringes + Superposition
 *   - The three bars of the Penrose triangle each emit wave fronts
 *   - Where bars overlap in the impossible depth illusion, interference
 *     fringes appear — constructive where the paradox is strongest
 *   - Tapping center creates a destructive-interference cancellation wave
 *     that shatters the pattern — logic cannot resolve paradox, surrender can
 *   - Liberation birds carry fading fringe patterns on their wings
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere
 *   2. Interference fringe field across triangle interior
 *   3. Triangle bar shadows
 *   4. Triangle bars with depth-overlap gradients
 *   5. Tracer dot with glow trail
 *   6. Center void pulse with fringe rings
 *   7. Liberation birds / shatter fragments
 *   8. Progress ring + liberation glow
 *
 * PHYSICS:
 *   - Impossible Penrose triangle (3 bars with depth-overlap illusion)
 *   - Tracer dot follows impossible edge in infinite loop
 *   - Loop count tracked — frustration builds (haptics accelerate)
 *   - Central void pulses, inviting tap → shatter into bird fragments
 *   - Birds flock upward with wing-beat animation
 *   - Breath modulates void pulse intensity + fringe wavelength
 *
 * INTERACTION:
 *   Drag edge → trace loop (drag_snap), Tap center void → shatter (tap, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Shattered liberation state with birds and glow
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

/** Compute point on triangle perimeter (0–1 maps to full loop) */
function trianglePoint(t: number, verts: { x: number; y: number }[]): { x: number; y: number } {
  const n = verts.length;
  const total = t * n;
  const seg = Math.floor(total) % n;
  const frac = total - Math.floor(total);
  const a = verts[seg];
  const b = verts[(seg + 1) % n];
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
}

/** Draw a thick impossible bar between two points with depth gradient */
function drawImpossibleBar(
  ctx: CanvasRenderingContext2D,
  ax: number, ay: number, bx: number, by: number,
  barW: number, rgb: RGB, alpha: number, depthFlip: boolean,
): void {
  const angle = Math.atan2(by - ay, bx - ax);
  const perpX = -Math.sin(angle) * barW * 0.5;
  const perpY = Math.cos(angle) * barW * 0.5;
  const grad = ctx.createLinearGradient(
    ax + perpX, ay + perpY, ax - perpX, ay - perpY,
  );
  const topA = depthFlip ? alpha * 0.4 : alpha;
  const botA = depthFlip ? alpha : alpha * 0.4;
  grad.addColorStop(0, rgba(lerpColor(rgb, [255, 255, 255] as RGB, 0.25), topA));
  grad.addColorStop(0.3, rgba(rgb, (topA + botA) * 0.5));
  grad.addColorStop(0.7, rgba(rgb, (topA + botA) * 0.45));
  grad.addColorStop(1, rgba(lerpColor(rgb, [0, 0, 0] as RGB, 0.15), botA));
  ctx.beginPath();
  ctx.moveTo(ax + perpX, ay + perpY);
  ctx.lineTo(bx + perpX, by + perpY);
  ctx.lineTo(bx - perpX, by - perpY);
  ctx.lineTo(ax - perpX, ay - perpY);
  ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  // Edge highlight
  ctx.beginPath();
  ctx.moveTo(ax + perpX, ay + perpY);
  ctx.lineTo(bx + perpX, by + perpY);
  ctx.strokeStyle = rgba(lerpColor(rgb, [255, 255, 255] as RGB, 0.3), alpha * 0.3);
  ctx.lineWidth = 1; ctx.stroke();
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Hero triangle radius */
const TRI_RADIUS = SIZE.lg * 0.55;
/** Impossible bar visual width */
const BAR_WIDTH = SIZE.md * 0.13;
/** Tracer dot speed (fraction per frame) */
const TRACE_SPEED = 0.005;
/** Trail positions to remember */
const TRAIL_LENGTH = 35;
/** Void tap target radius */
const VOID_RADIUS = 0.045;
/** Void pulse animation speed */
const VOID_PULSE_SPEED = 0.02;
/** Liberation bird count */
const BIRD_COUNT = 24;
/** Bird upward drift speed */
const BIRD_DRIFT = 0.001;
/** Bird horizontal scatter */
const BIRD_SCATTER = 0.0025;
/** Glow layers for liberation field */
const GLOW_LAYERS = 6;
/** Liberation glow radius */
const LIBERATION_GLOW_R = SIZE.xl;
/** Interference fringe line count in triangle interior */
const FRINGE_LINES = 30;
/** Fringe wavelength */
const FRINGE_LAMBDA = 0.025;
/** Breath pulse on void intensity */
const BREATH_VOID_MOD = 0.2;
/** Progress indicator count */
const LOOP_COUNT_FOR_COMPLETE = 3;
/** Trail dot radius */
const TRAIL_DOT_R = 0.005;
/** Bird wing beat speed */
const WING_BEAT_SPEED = 0.12;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

interface Bird {
  x: number; y: number;
  vx: number; vy: number;
  angle: number;
  wingPhase: number;
  size: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ZenKoanAtom({
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
    tracerT: 0, trail: [] as { x: number; y: number }[],
    loopCount: 0, lastLoop: 0,
    shattered: false, shatterAnim: 0,
    birds: [] as Bird[],
    dragging: false, dragNotified: false, completed: false,
    voidPulse: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    // Triangle vertices (equilateral, pointing up)
    const verts = [0, 1, 2].map(i => {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      return { x: 0.5 + Math.cos(a) * TRI_RADIUS, y: 0.5 + Math.sin(a) * TRI_RADIUS };
    });

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
        s.shattered = true; s.shatterAnim = 1; s.completed = true;
        if (s.birds.length === 0) {
          for (let i = 0; i < BIRD_COUNT; i++) {
            s.birds.push({
              x: 0.5 + (Math.random() - 0.5) * 0.4,
              y: 0.2 + Math.random() * 0.3,
              vx: (Math.random() - 0.5) * BIRD_SCATTER,
              vy: -BIRD_DRIFT * (0.5 + Math.random()),
              angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.5,
              wingPhase: Math.random() * Math.PI * 2,
              size: 0.008 + Math.random() * 0.006,
            });
          }
        }
      }

      // ── Tracer physics ──────────────────────────────────
      if (!s.shattered) {
        const speed = TRACE_SPEED * (s.dragging ? 1.5 : 0.8) * ms;
        s.tracerT = (s.tracerT + speed) % 1;
        // Track loop completions
        if (s.tracerT < s.lastLoop) {
          s.loopCount++;
          cb.onHaptic('drag_snap');
        }
        s.lastLoop = s.tracerT;
        // Trail
        const tp = trianglePoint(s.tracerT, verts);
        s.trail.unshift(tp);
        if (s.trail.length > TRAIL_LENGTH) s.trail.length = TRAIL_LENGTH;
        s.voidPulse = (s.voidPulse + VOID_PULSE_SPEED * ms) % (Math.PI * 2);
      }

      // ── Bird physics ──────────────────────────────────────
      if (s.shattered) {
        s.shatterAnim = Math.min(1, s.shatterAnim + 0.012 * ms);
        for (const bird of s.birds) {
          bird.x += bird.vx * ms;
          bird.y += bird.vy * ms;
          bird.vy -= 0.00002 * ms; // gentle upward acceleration
          bird.wingPhase += WING_BEAT_SPEED * ms;
          // Wrap horizontally
          if (bird.x < -0.1) bird.x = 1.1;
          if (bird.x > 1.1) bird.x = -0.1;
        }
        if (s.shatterAnim >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      cb.onStateChange?.(s.completed ? 1 : s.shattered ? 0.5 + s.shatterAnim * 0.5 : Math.min(0.5, s.loopCount / LOOP_COUNT_FOR_COMPLETE * 0.5));

      const vertsPx = verts.map(v => ({ x: v.x * w, y: v.y * h }));
      const barW = px(BAR_WIDTH, minDim);
      const barAlpha = ALPHA.content.max * (0.15 + entrance * 0.15);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Interference fringe field (SIGNATURE)
      // ════════════════════════════════════════════════════
      if (!s.shattered) {
        const lambda = px(FRINGE_LAMBDA, minDim) * (1 + breath * 0.1);
        // Three wave sources at triangle vertices
        for (let fi = 0; fi < FRINGE_LINES; fi++) {
          const t = fi / FRINGE_LINES;
          // Sample along line from center to each vertex
          for (let vi = 0; vi < 3; vi++) {
            const vp = vertsPx[vi];
            const nextVp = vertsPx[(vi + 1) % 3];
            const lx = vp.x + (nextVp.x - vp.x) * t;
            const ly = vp.y + (nextVp.y - vp.y) * t;
            // Interference from all three sources
            const d1 = Math.hypot(lx - vertsPx[0].x, ly - vertsPx[0].y);
            const d2 = Math.hypot(lx - vertsPx[1].x, ly - vertsPx[1].y);
            const d3 = Math.hypot(lx - vertsPx[2].x, ly - vertsPx[2].y);
            const phase12 = Math.cos(Math.PI * (d1 - d2) / lambda + time * 0.5);
            const phase23 = Math.cos(Math.PI * (d2 - d3) / lambda + time * 0.5);
            const intensity = (phase12 * phase12 + phase23 * phase23) * 0.5;
            const fA = ALPHA.glow.max * 0.035 * intensity * entrance;
            if (fA < 0.001) continue;
            const dotR = px(0.003, minDim) * (0.5 + intensity * 0.5);
            const fringeColor = lerpColor(s.primaryRgb, s.accentRgb, intensity);
            ctx.beginPath();
            ctx.arc(lx, ly, dotR, 0, Math.PI * 2);
            ctx.fillStyle = rgba(fringeColor, fA);
            ctx.fill();
          }
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3-4: Triangle bars (shadow + body)
      // ════════════════════════════════════════════════════
      if (!s.shattered) {
        const shatterFade = 1;
        // Shadows
        for (let i = 0; i < 3; i++) {
          const a = vertsPx[i]; const b = vertsPx[(i + 1) % 3];
          ctx.beginPath();
          ctx.moveTo(a.x + 2, a.y + 3);
          ctx.lineTo(b.x + 2, b.y + 3);
          ctx.strokeStyle = rgba([0, 0, 0] as RGB, 0.04 * entrance * shatterFade);
          ctx.lineWidth = barW * 1.1;
          ctx.lineCap = 'round'; ctx.stroke();
        }
        // Bars with depth-overlap illusion
        for (let i = 0; i < 3; i++) {
          const a = vertsPx[i]; const b = vertsPx[(i + 1) % 3];
          drawImpossibleBar(ctx, a.x, a.y, b.x, b.y, barW, s.primaryRgb, barAlpha * shatterFade, i === 1);
        }
        // Depth-overlap junction patches (the impossible part)
        for (let i = 0; i < 3; i++) {
          const v = vertsPx[i];
          const jR = barW * 0.6;
          const jGrad = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, jR);
          jGrad.addColorStop(0, rgba(s.primaryRgb, barAlpha * 0.8 * shatterFade));
          jGrad.addColorStop(0.5, rgba(s.primaryRgb, barAlpha * 0.4 * shatterFade));
          jGrad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = jGrad;
          ctx.fillRect(v.x - jR, v.y - jR, jR * 2, jR * 2);
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Tracer dot with glow trail
      // ════════════════════════════════════════════════════
      if (!s.shattered && s.trail.length > 0) {
        // Trail
        for (let i = 0; i < s.trail.length; i++) {
          const t = 1 - i / s.trail.length;
          const tp = s.trail[i];
          const tR = px(TRAIL_DOT_R * t, minDim);
          // Trail glow
          const tgR = tR * 4;
          const tg = ctx.createRadialGradient(tp.x * w, tp.y * h, 0, tp.x * w, tp.y * h, tgR);
          tg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.06 * t * entrance));
          tg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = tg;
          ctx.fillRect(tp.x * w - tgR, tp.y * h - tgR, tgR * 2, tgR * 2);
          // Trail dot
          ctx.beginPath();
          ctx.arc(tp.x * w, tp.y * h, tR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, t * 0.3), ALPHA.content.max * 0.3 * t * entrance);
          ctx.fill();
        }
        // Main tracer head
        const head = s.trail[0];
        const headR = px(0.01, minDim);
        const headGrad = ctx.createRadialGradient(head.x * w, head.y * h, 0, head.x * w, head.y * h, headR);
        headGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.5), ALPHA.content.max * 0.5 * entrance));
        headGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance));
        headGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.beginPath(); ctx.arc(head.x * w, head.y * h, headR, 0, Math.PI * 2);
        ctx.fillStyle = headGrad; ctx.fill();
        // Specular on tracer
        ctx.beginPath();
        ctx.ellipse(head.x * w - headR * 0.2, head.y * h - headR * 0.25, headR * 0.3, headR * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.25 * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 6: Center void pulse with fringe rings
      // ════════════════════════════════════════════════════
      if (!s.shattered) {
        const voidIntensity = 0.5 + Math.sin(s.voidPulse) * 0.5;
        const breathVoid = 1 + breath * BREATH_VOID_MOD;
        const voidR = px(VOID_RADIUS, minDim) * (0.8 + voidIntensity * 0.3) * breathVoid;
        // Void fringe rings
        for (let ri = 0; ri < 5; ri++) {
          const ringR = voidR * (1.5 + ri * 0.8);
          const ringIntensity = Math.pow(Math.cos(ri * Math.PI * 0.5 + time * 0.8), 2);
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.glow.max * 0.02 * ringIntensity * voidIntensity * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
        // Void glow
        const vGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, voidR * 2);
        vGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.08 * voidIntensity * entrance));
        vGlow.addColorStop(0.3, rgba(s.accentRgb, ALPHA.glow.max * 0.04 * voidIntensity * entrance));
        vGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = vGlow;
        ctx.fillRect(cx - voidR * 2, cy - voidR * 2, voidR * 4, voidR * 4);
        // Void core
        ctx.beginPath(); ctx.arc(cx, cy, voidR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.4), ALPHA.content.max * 0.15 * voidIntensity * entrance);
        ctx.fill();
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Liberation birds
      // ════════════════════════════════════════════════════
      if (s.shattered) {
        // Liberation glow
        for (let gi = GLOW_LAYERS - 1; gi >= 0; gi--) {
          const gR = px(LIBERATION_GLOW_R * (0.3 + s.shatterAnim * 0.5 + gi * 0.15), minDim);
          const gA = ALPHA.glow.max * 0.04 * s.shatterAnim * entrance / (gi + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2), gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.4));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        // Birds
        for (const bird of s.birds) {
          const bx = bird.x * w; const by = bird.y * h;
          const wingSpread = Math.sin(bird.wingPhase) * 0.7;
          const bSize = px(bird.size, minDim);
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(bird.angle);
          // Body
          ctx.beginPath();
          ctx.moveTo(bSize, 0);
          ctx.quadraticCurveTo(0, -bSize * wingSpread, -bSize * 0.8, -bSize * wingSpread * 1.2);
          ctx.moveTo(bSize, 0);
          ctx.quadraticCurveTo(0, bSize * wingSpread, -bSize * 0.8, bSize * wingSpread * 1.2);
          ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.3), ALPHA.content.max * 0.25 * s.shatterAnim * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();
          // Bird glow
          const bgR = bSize * 2;
          const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, bgR);
          bg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * s.shatterAnim * entrance));
          bg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = bg;
          ctx.fillRect(-bgR, -bgR, bgR * 2, bgR * 2);
          ctx.restore();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring
      // ════════════════════════════════════════════════════
      const ringR = px(SIZE.md * 0.7, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : s.shattered ? s.shatterAnim : Math.min(1, s.loopCount / LOOP_COUNT_FOR_COMPLETE);
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
      if (Math.hypot(mx - 0.5, my - 0.5) < VOID_RADIUS * 1.5 && !s.shattered) {
        s.shattered = true;
        callbacksRef.current.onHaptic('tap');
        for (let i = 0; i < BIRD_COUNT; i++) {
          const src = verts[i % 3];
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
          s.birds.push({
            x: src.x, y: src.y,
            vx: Math.cos(angle) * BIRD_SCATTER * (0.5 + Math.random()),
            vy: Math.sin(angle) * BIRD_SCATTER * (0.5 + Math.random()) - BIRD_DRIFT,
            angle,
            wingPhase: Math.random() * Math.PI * 2,
            size: 0.008 + Math.random() * 0.006,
          });
        }
      } else if (!s.shattered) {
        s.dragging = true;
        if (!s.dragNotified) { s.dragNotified = true; callbacksRef.current.onHaptic('drag_snap'); }
      }
    };
    const onUp = () => { stateRef.current.dragging = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
