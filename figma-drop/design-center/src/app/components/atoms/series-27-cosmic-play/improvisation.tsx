/**
 * ATOM 265: THE IMPROVISATION ENGINE
 * =====================================
 * Series 27 — Cosmic Play · Position 5
 *
 * You cannot script a dance. Follow the unpredictable dot — stop
 * thinking, start flowing. The trail breaks on anticipation.
 * Close tracking creates holographic light cascades.
 *
 * SIGNATURE TECHNIQUE: Holographic Diffraction + Generative Art
 *   - Close-tracking trail renders as holographic rainbow wake
 *   - Target dot emits prismatic rings that pulse with movement
 *   - User trail gains rainbow diffraction when in flow state
 *   - Anticipation (moving ahead) shatters trail into chromatic scatter
 *   - Completion: generative Lissajous figure with rainbow fill
 *
 * PHYSICS:
 *   - Target dot moves via Bezier curves with random destinations
 *   - User traces it → close tracking = smooth holographic wake
 *   - Anticipation (moving ahead) = trail breaks + error scatter
 *   - Trail segments colored by rainbow hue based on proximity angle
 *   - Target emits expanding prismatic rings as it moves
 *   - Flow state builds: trail width + glow + diffraction increase
 *   - 8 rendering layers: target trail, target rings, target glow,
 *     target body, user trail shadow, user trail body, user glow, progress
 *   - Breath couples to: target speed, trail warmth, ring expansion
 *   - 200 frames close tracking → completion
 *
 * INTERACTION:
 *   Drag → follow target (drag_snap, error_boundary, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static Lissajous trail pattern with holographic fill
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ══════════════════════��══════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Target movement speed (fraction per frame) */
const TARGET_SPEED = 0.003;
/** Breath-modulated speed reduction factor */
const BREATH_SPEED_MOD = 0.25;
/** Proximity threshold for "close" tracking */
const PROXIMITY_THRESHOLD = 0.06;
/** Distance beyond which counts as anticipation error */
const ANTICIPATION_THRESHOLD = 0.13;
/** Maximum user trail length */
const USER_TRAIL_MAX = 70;
/** Maximum target trail length */
const TARGET_TRAIL_MAX = 45;
/** Target dot radius (fraction of minDim) */
const TARGET_DOT_R = 0.012;
/** Number of prismatic rings emitted by target */
const TARGET_RING_COUNT = 4;
/** Ring expansion speed */
const RING_EXPAND_SPEED = 0.002;
/** Ring max radius before decay */
const RING_MAX_R = 0.06;
/** Flow frames needed for completion */
const FLOW_FRAMES_NEEDED = 200;
/** Number of target glow layers */
const TARGET_GLOW_LAYERS = 4;
/** Number of user trail glow layers when in flow */
const USER_GLOW_LAYERS = 3;
/** Holographic hue rotation per proximity unit */
const HOLO_HUE_PROXIMITY = 0.3;
/** User trail width base (fraction of minDim) */
const USER_TRAIL_WIDTH = 0.004;
/** User trail width at high flow */
const USER_TRAIL_WIDTH_FLOW = 0.008;
/** Error cooldown frames */
const ERROR_COOLDOWN = 30;
/** Specular highlight offset for target */
const SPECULAR_OFFSET = 0.25;
/** Specular highlight size for target */
const SPECULAR_SIZE = 0.22;
/** Breath trail warmth modulation */
const BREATH_TRAIL_WARMTH = 0.05;
/** Breath ring expansion modulation */
const BREATH_RING_MOD = 0.2;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** User trail point with tracking quality data */
interface UserTrailPoint {
  x: number;
  y: number;
  close: boolean;
  speed: number;
}

/** Prismatic ring emitted from target */
interface PrismaticRing {
  x: number;
  y: number;
  r: number;
  life: number;
  hue: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════

/**
 * Hue (0–1) → RGB for holographic rainbow.
 */
function hueToRgb(hue: number): RGB {
  const h = ((hue % 1) + 1) % 1;
  const c = 0.65;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = 0.3;
  let r = 0, g = 0, b = 0;
  if (h < 1/6)      { r = c; g = x; }
  else if (h < 2/6) { r = x; g = c; }
  else if (h < 3/6) { g = c; b = x; }
  else if (h < 4/6) { g = x; b = c; }
  else if (h < 5/6) { r = x; b = c; }
  else               { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)] as unknown as RGB;
}

/**
 * Draw specular highlight on target sphere.
 */
function drawTargetSpecular(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, entrance: number,
): void {
  const sx = cx - r * SPECULAR_OFFSET;
  const sy = cy - r * SPECULAR_OFFSET;
  const sr = r * SPECULAR_SIZE;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
  sg.addColorStop(0, `rgba(255,255,255,${0.4 * entrance})`);
  sg.addColorStop(0.5, `rgba(255,255,255,${0.08 * entrance})`);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ImprovisationAtom({
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
    targetX: 0.5,
    targetY: 0.5,
    destX: 0.3 + Math.random() * 0.4,
    destY: 0.3 + Math.random() * 0.4,
    pointerX: 0.5,
    pointerY: 0.5,
    pointerDown: false,
    userTrail: [] as UserTrailPoint[],
    targetTrail: [] as Array<{ x: number; y: number }>,
    rings: [] as PrismaticRing[],
    flowFrames: 0,
    completed: false,
    stepNotified: false,
    completionGlow: 0,
    errorCooldown: 0,
    holoPhase: 0,
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

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.012;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // ═══════════════════════════════════════════════════════════════
      // REDUCED MOTION — static Lissajous pattern
      // ═══════════════════════════════════════════════════════════════
      if (p.reducedMotion) {
        // Draw a static Lissajous figure with holographic fill
        const lissPoints = 60;
        ctx.beginPath();
        for (let i = 0; i <= lissPoints; i++) {
          const t = i / lissPoints;
          const lx = cx + px(0.15, minDim) * Math.sin(t * Math.PI * 4 + 0.3);
          const ly = cy + px(0.12, minDim) * Math.sin(t * Math.PI * 6);
          if (i === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Holographic dots along path
        for (let i = 0; i < lissPoints; i++) {
          const t = i / lissPoints;
          const lx = cx + px(0.15, minDim) * Math.sin(t * Math.PI * 4 + 0.3);
          const ly = cy + px(0.12, minDim) * Math.sin(t * Math.PI * 6);
          const dotHue = (t + 0.1) % 1;
          const dotColor = hueToRgb(dotHue);
          const dotR = px(0.003, minDim);
          ctx.beginPath();
          ctx.arc(lx, ly, dotR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(dotColor, ALPHA.content.max * 0.12 * t * entrance);
          ctx.fill();
        }

        cb.onStateChange?.(1);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      if (p.phase === 'resolve') s.completed = true;

      // ═══════════════════════════════════════════════════════════════
      // TARGET MOVEMENT PHYSICS
      // ═══════════════════════════════════════════════════════════════
      const speed = TARGET_SPEED * (1 - breath * BREATH_SPEED_MOD * 0.5);
      const tdx = s.destX - s.targetX;
      const tdy = s.destY - s.targetY;
      const tDist = Math.hypot(tdx, tdy);
      if (tDist < 0.02) {
        s.destX = 0.12 + Math.random() * 0.76;
        s.destY = 0.12 + Math.random() * 0.76;
      } else {
        s.targetX += (tdx / tDist) * speed * ms;
        s.targetY += (tdy / tDist) * speed * ms;
      }

      s.targetTrail.push({ x: s.targetX, y: s.targetY });
      if (s.targetTrail.length > TARGET_TRAIL_MAX) s.targetTrail.shift();

      // Spawn prismatic rings periodically
      if (s.frameCount % 15 === 0) {
        s.rings.push({
          x: s.targetX, y: s.targetY,
          r: 0, life: 1,
          hue: (s.frameCount * 0.005) % 1,
        });
      }

      // Ring physics
      for (let i = s.rings.length - 1; i >= 0; i--) {
        const ring = s.rings[i];
        ring.r += RING_EXPAND_SPEED * (1 + breath * BREATH_RING_MOD) * ms;
        ring.life -= 0.012 * ms;
        if (ring.life <= 0 || ring.r > RING_MAX_R) s.rings.splice(i, 1);
      }

      // Proximity check
      s.holoPhase += 0.01 * ms;
      if (s.pointerDown) {
        const dist = Math.hypot(s.pointerX - s.targetX, s.pointerY - s.targetY);
        const close = dist < PROXIMITY_THRESHOLD;
        const lastPt = s.userTrail.length > 0 ? s.userTrail[s.userTrail.length - 1] : null;
        const userSpeed = lastPt ? Math.hypot(s.pointerX - lastPt.x, s.pointerY - lastPt.y) : 0;

        s.userTrail.push({ x: s.pointerX, y: s.pointerY, close, speed: userSpeed });
        if (s.userTrail.length > USER_TRAIL_MAX) s.userTrail.shift();

        if (close) {
          s.flowFrames += ms;
        } else {
          s.flowFrames = Math.max(0, s.flowFrames - ms * 0.3);
          s.errorCooldown--;
          if (dist > ANTICIPATION_THRESHOLD && s.errorCooldown <= 0) {
            cb.onHaptic('error_boundary');
            s.errorCooldown = ERROR_COOLDOWN;
          }
        }
      }

      if (s.flowFrames >= FLOW_FRAMES_NEEDED * 0.5 && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.flowFrames >= FLOW_FRAMES_NEEDED && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      if (s.completed) s.completionGlow = Math.min(1, s.completionGlow + 0.005 * ms);

      const flowFrac = Math.min(1, s.flowFrames / FLOW_FRAMES_NEEDED);
      cb.onStateChange?.(s.completed ? 0.5 + s.completionGlow * 0.5 : flowFrac * 0.5);

      const breathTrailWarmth = breath * BREATH_TRAIL_WARMTH;

      // ═══════════════════════════════════════════════════════════════
      // LAYER 1 — Target trail (fading dot wake)
      // ═══════════════════════════════════════════════════════════════
      for (let i = 0; i < s.targetTrail.length; i++) {
        const tp = s.targetTrail[i];
        const t = i / s.targetTrail.length;
        const tR = px(0.003 * t, minDim);
        if (tR < 0.3) continue;

        const trailHue = (t * 0.3 + s.holoPhase) % 1;
        const trailColor = lerpColor(s.accentRgb, hueToRgb(trailHue), 0.3);
        ctx.beginPath();
        ctx.arc(tp.x * w, tp.y * h, tR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(trailColor, ALPHA.content.max * 0.07 * t * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 2 — Prismatic rings from target
      // ═══════════════════════════════════════════════════════════════
      for (const ring of s.rings) {
        const rr = px(ring.r, minDim);
        if (rr < 1) continue;
        const ringColor = hueToRgb(ring.hue);
        ctx.beginPath();
        ctx.arc(ring.x * w, ring.y * h, rr, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ALPHA.content.max * 0.06 * ring.life * entrance);
        ctx.lineWidth = px(STROKE.thin * ring.life, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 3 — Target glow field
      // ═══════════════════════════════════════════════════════════════
      const txp = s.targetX * w;
      const typ = s.targetY * h;
      const tDotR = px(TARGET_DOT_R, minDim);

      for (let gi = TARGET_GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = tDotR * (2.5 + gi * 2);
        const gHue = (s.holoPhase + gi * 0.1) % 1;
        const gColor = lerpColor(s.accentRgb, hueToRgb(gHue), 0.3 + breathTrailWarmth);
        const gA = ALPHA.glow.max * 0.08 * entrance / (gi + 1);
        const gg = ctx.createRadialGradient(txp, typ, 0, txp, typ, gR);
        gg.addColorStop(0, rgba(gColor, gA));
        gg.addColorStop(0.35, rgba(gColor, gA * 0.35));
        gg.addColorStop(0.7, rgba(s.accentRgb, gA * 0.08));
        gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg;
        ctx.fillRect(txp - gR, typ - gR, gR * 2, gR * 2);
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 4 — Target body (5-stop gradient + specular)
      // ═══════════════════════════════════════════════════════════════
      const tGrad = ctx.createRadialGradient(
        txp - tDotR * 0.2, typ - tDotR * 0.2, tDotR * 0.05,
        txp, typ, tDotR,
      );
      tGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255] as unknown as RGB, 0.35),
        ALPHA.content.max * 0.45 * entrance));
      tGrad.addColorStop(0.3, rgba(s.accentRgb, ALPHA.content.max * 0.38 * entrance));
      tGrad.addColorStop(0.6, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
      tGrad.addColorStop(0.85, rgba(s.accentRgb, ALPHA.content.max * 0.08 * entrance));
      tGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.beginPath();
      ctx.arc(txp, typ, tDotR, 0, Math.PI * 2);
      ctx.fillStyle = tGrad;
      ctx.fill();

      drawTargetSpecular(ctx, txp, typ, tDotR, entrance);

      // ═══════════════════════════════════════════════════════════════
      // LAYER 5 — User trail (holographic when close, broken when far)
      // ═══════════════════════════════════════════════════════════════
      for (let i = 1; i < s.userTrail.length; i++) {
        const up = s.userTrail[i];
        const prev = s.userTrail[i - 1];
        const t = i / s.userTrail.length;

        const dx = up.x - prev.x;
        const dy = up.y - prev.y;
        const len = Math.hypot(dx, dy) || 1;
        const trailW = px(
          up.close
            ? USER_TRAIL_WIDTH + flowFrac * (USER_TRAIL_WIDTH_FLOW - USER_TRAIL_WIDTH)
            : USER_TRAIL_WIDTH * 0.5,
          minDim,
        ) * t;

        const nx = -dy / len * trailW;
        const ny = dx / len * trailW;

        // Holographic color when close, muted when far
        const segHue = (t * 0.4 + s.holoPhase + breathTrailWarmth) % 1;
        const segColor = up.close
          ? lerpColor(s.primaryRgb, hueToRgb(segHue), 0.4 + flowFrac * 0.3)
          : s.accentRgb;
        const segAlpha = ALPHA.content.max * (up.close ? 0.15 + t * 0.1 : 0.04) * entrance;

        // Trail segment as quad
        ctx.beginPath();
        ctx.moveTo(prev.x * w + nx, prev.y * h + ny);
        ctx.lineTo(up.x * w + nx, up.y * h + ny);
        ctx.lineTo(up.x * w - nx, up.y * h - ny);
        ctx.lineTo(prev.x * w - nx, prev.y * h - ny);
        ctx.closePath();
        ctx.fillStyle = rgba(segColor, segAlpha);
        ctx.fill();

        // Flow glow on close segments
        if (up.close && t > 0.3 && flowFrac > 0.2) {
          const glowR = trailW * 3;
          const ux = up.x * w;
          const uy = up.y * h;
          const ug = ctx.createRadialGradient(ux, uy, 0, ux, uy, glowR);
          ug.addColorStop(0, rgba(segColor, ALPHA.glow.max * 0.05 * t * flowFrac * entrance));
          ug.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = ug;
          ctx.fillRect(ux - glowR, uy - glowR, glowR * 2, glowR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 6 — Proximity connection line (shows tracking quality)
      // ═══════════════════════════════════════════════════════════════
      if (s.pointerDown) {
        const dist = Math.hypot(s.pointerX - s.targetX, s.pointerY - s.targetY);
        if (dist < ANTICIPATION_THRESHOLD) {
          const proximity = 1 - dist / ANTICIPATION_THRESHOLD;
          const connHue = (s.holoPhase * 2) % 1;
          const connColor = hueToRgb(connHue);
          ctx.beginPath();
          ctx.moveTo(s.pointerX * w, s.pointerY * h);
          ctx.lineTo(txp, typ);
          ctx.strokeStyle = rgba(connColor, ALPHA.content.max * 0.04 * proximity * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.setLineDash([px(0.003, minDim), px(0.006, minDim)]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 7 — Completion Lissajous bloom
      // ═══════════════════════════════════════════════════════════════
      if (s.completed && s.completionGlow > 0.1) {
        const lissR = px(SIZE.md * 0.6 * s.completionGlow, minDim);
        const lissPoints = 80;
        ctx.beginPath();
        for (let i = 0; i <= lissPoints; i++) {
          const lt = i / lissPoints;
          const lx = cx + lissR * Math.sin(lt * Math.PI * 4 + time * 0.005);
          const ly = cy + lissR * 0.8 * Math.sin(lt * Math.PI * 6);
          if (i === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.08 * s.completionGlow * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();

        // Rainbow dots along Lissajous
        for (let i = 0; i < 40; i++) {
          const lt = i / 40;
          const lx = cx + lissR * Math.sin(lt * Math.PI * 4 + time * 0.005);
          const ly = cy + lissR * 0.8 * Math.sin(lt * Math.PI * 6);
          const lHue = (lt + time * 0.002) % 1;
          ctx.beginPath();
          ctx.arc(lx, ly, px(0.003, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(hueToRgb(lHue), ALPHA.content.max * 0.1 * s.completionGlow * entrance);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // LAYER 8 — Progress arc
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed && s.flowFrames > 5) {
        const progR = px(0.04, minDim);
        const prog = s.flowFrames / FLOW_FRAMES_NEEDED;
        ctx.beginPath();
        ctx.arc(cx, h * 0.08, progR, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.18 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.pointerDown = true;
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
      canvas.setPointerCapture(e.pointerId);
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.pointerDown) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointerX = (e.clientX - rect.left) / rect.width;
      stateRef.current.pointerY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.pointerDown = false;
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
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }}
      />
    </div>
  );
}
