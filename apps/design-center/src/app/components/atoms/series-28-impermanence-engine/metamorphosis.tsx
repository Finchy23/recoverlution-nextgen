/**
 * ATOM 276: THE METAMORPHOSIS ENGINE
 * =====================================
 * Series 28 — Impermanence Engine · Position 6
 *
 * What the caterpillar calls the end, the master calls a butterfly.
 * Destruction is preamble to expansion.
 *
 * SIGNATURE TECHNIQUE: Fabric/Cloth Simulation + Entropy Rendering
 *   - Cocoon rendered as tightly wound cloth wrapping (spiral fibers)
 *   - Tapping causes internal pressure → cloth fibers stretch + tear
 *   - Voronoi-style fractures along fiber boundaries
 *   - Entropy arc: ordered cocoon wrap → chaotic fracture → radiant emergence
 *   - Butterfly wings as unfurling cloth membranes with vein fibers
 *
 * PHYSICS:
 *   - Cocoon: elliptical shape with wrapped fiber spirals
 *   - Each tap adds internal pressure → cracks appear along fiber seams
 *   - Pressure > threshold → cascading Voronoi fracture
 *   - Cocoon fragments scatter with cloth-drape flutter
 *   - Light bursts from within through cracks
 *   - Butterfly emerges: cloth wings unfurl with vein patterns
 *   - 8 render layers: atmosphere, cocoon shadow, cocoon body, fiber wrapping,
 *     fracture glow, fragments, butterfly wings, specular + completion halo
 *
 * INTERACTION:
 *   Tap → add pressure (tap, step_advance at 60%, completion on shatter)
 *
 * RENDER: Canvas 2D with cloth-cocoon fracture + wing unfurl
 * REDUCED MOTION: Static butterfly with spread wings
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, motionScale,
  easeOutCubic, easeOutExpo,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Cocoon width (fraction of minDim) */
const COCOON_W = 0.15;
/** Cocoon height (fraction of minDim) */
const COCOON_H = 0.28;
/** Taps needed to shatter cocoon */
const TAPS_TO_SHATTER = 8;
/** Number of spiral fiber wrapping lines */
const SPIRAL_FIBERS = 16;
/** Maximum crack lines before shatter */
const MAX_CRACKS = 12;
/** Number of cocoon fragments on shatter */
const FRAGMENT_COUNT = 24;
/** Fragment scatter velocity */
const FRAGMENT_SPEED = 0.004;
/** Fragment flutter rotation speed */
const FRAGMENT_FLUTTER = 0.06;
/** Internal light burst intensity */
const BURST_DECAY = 0.96;
/** Butterfly wing span (fraction of minDim) */
const WING_SPAN = 0.32;
/** Wing unfurl animation speed */
const UNFURL_SPEED = 0.012;
/** Wing vein count per wing */
const WING_VEINS = 6;
/** Wing cloth drape wave amplitude */
const WING_DRAPE = 0.015;
/** Glow layers for butterfly emergence */
const EMERGE_GLOW = 5;

// ═════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═════════════════════════════════════════════════════════════════════

interface CrackLine {
  angle: number;
  length: number;
  width: number;
}

interface Fragment {
  x: number; y: number;
  vx: number; vy: number;
  angle: number; rotSpeed: number;
  size: number; life: number;
  /** Cloth drape phase offset */
  drapePhase: number;
}

export default function MetamorphosisAtom({
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
    tapCount: 0,
    shattered: false,
    completed: false,
    stepNotified: false,
    burstIntensity: 0,
    wingUnfurl: 0,
    cracks: [] as CrackLine[],
    fragments: [] as Fragment[],
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
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;
      const time = s.frameCount * 0.015;
      const breath = (p.breathAmplitude ?? 0);

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion) {
        s.shattered = true; s.completed = true; s.wingUnfurl = 1;
      }
      if (p.phase === 'resolve') { s.shattered = true; s.wingUnfurl = 1; s.completed = true; }

      // ── Physics updates ─────────────────────────────────────────
      s.burstIntensity *= BURST_DECAY;
      if (s.shattered && s.wingUnfurl < 1) {
        s.wingUnfurl = Math.min(1, s.wingUnfurl + UNFURL_SPEED * ms);
      }

      // Update fragments
      for (let i = s.fragments.length - 1; i >= 0; i--) {
        const fr = s.fragments[i];
        fr.x += fr.vx * ms; fr.y += fr.vy * ms;
        fr.vy += 0.00005 * ms; // gravity
        fr.angle += fr.rotSpeed * ms;
        fr.life -= 0.005 * ms;
        if (fr.life <= 0) s.fragments.splice(i, 1);
      }

      const cocoonW = px(COCOON_W, minDim);
      const cocoonH = px(COCOON_H, minDim);
      const pressure = s.tapCount / TAPS_TO_SHATTER;

      cb.onStateChange?.(s.completed ? 1 : s.shattered ? 0.7 + s.wingUnfurl * 0.3 : pressure * 0.7);

      if (!s.shattered) {
        // ── 1. Cocoon shadow ─────────────────────────────────────
        const shadowR = cocoonH * 0.7;
        const shadowY = cy + cocoonH * 0.4;
        const shadowG = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowR);
        shadowG.addColorStop(0, rgba(s.primaryRgb, 0.05 * entrance));
        shadowG.addColorStop(0.5, rgba(s.primaryRgb, 0.02 * entrance));
        shadowG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = shadowG;
        ctx.fillRect(cx - shadowR, shadowY - shadowR, shadowR * 2, shadowR * 2);

        // ── 2. Internal light (visible through cracks) ───────────
        if (pressure > 0.3) {
          const lightR = cocoonH * 0.5 * pressure;
          const lightG = ctx.createRadialGradient(cx, cy, 0, cx, cy, lightR);
          const lightCol: RGB = [
            Math.min(255, s.primaryRgb[0] + 60),
            Math.min(255, s.primaryRgb[1] + 40),
            Math.min(255, s.primaryRgb[2] + 20),
          ];
          lightG.addColorStop(0, rgba(lightCol, ALPHA.glow.max * 0.12 * pressure * entrance));
          lightG.addColorStop(0.5, rgba(lightCol, ALPHA.glow.max * 0.04 * pressure * entrance));
          lightG.addColorStop(1, rgba(lightCol, 0));
          ctx.fillStyle = lightG;
          ctx.fillRect(cx - lightR, cy - lightR, lightR * 2, lightR * 2);
        }

        // ── 3. Cocoon body (elliptical cloth wrapping) ───────────
        ctx.save();
        ctx.translate(cx, cy);
        // Cocoon body gradient
        ctx.beginPath();
        ctx.ellipse(0, 0, cocoonW, cocoonH, 0, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(-cocoonW * 0.2, -cocoonH * 0.2, 0, 0, 0, cocoonH);
        const bodyCol = lerpColor(s.primaryRgb, s.accentRgb, pressure * 0.3);
        bodyGrad.addColorStop(0, rgba(bodyCol, ALPHA.content.max * 0.30 * entrance));
        bodyGrad.addColorStop(0.3, rgba(bodyCol, ALPHA.content.max * 0.22 * entrance));
        bodyGrad.addColorStop(0.6, rgba(bodyCol, ALPHA.content.max * 0.14 * entrance));
        bodyGrad.addColorStop(0.85, rgba(bodyCol, ALPHA.content.max * 0.07 * entrance));
        bodyGrad.addColorStop(1, rgba(bodyCol, ALPHA.content.max * 0.02 * entrance));
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Cocoon edge
        ctx.beginPath();
        ctx.ellipse(0, 0, cocoonW, cocoonH, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(bodyCol, ALPHA.content.max * 0.14 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();

        // ── 4. Spiral fiber wrapping (cloth texture) ─────────────
        for (let f = 0; f < SPIRAL_FIBERS; f++) {
          const fPhase = f / SPIRAL_FIBERS;
          const startAngle = fPhase * Math.PI * 4;
          const wave = Math.sin(time * 1.5 + f) * 0.02 * (1 + pressure * 2);
          ctx.beginPath();
          for (let t = 0; t <= 1; t += 0.05) {
            const angle = startAngle + t * Math.PI * 2;
            const yOff = (t - 0.5) * cocoonH * 1.8;
            const xR = cocoonW * Math.cos(t * Math.PI) * (0.8 + wave);
            const fx = Math.cos(angle) * xR;
            const fy = yOff;
            if (t === 0) ctx.moveTo(fx, fy);
            else ctx.lineTo(fx, fy);
          }
          const fiberStress = pressure * 0.3 + Math.abs(Math.sin(fPhase * Math.PI * 3)) * 0.1;
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.06 + fiberStress * 0.08) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }

        // ── 5. Crack lines along fibers ──────────────────────────
        for (let i = 0; i < s.cracks.length; i++) {
          const crack = s.cracks[i];
          const cLen = cocoonH * crack.length * 0.6;
          const cEx = Math.cos(crack.angle) * cLen * (cocoonW / cocoonH);
          const cEy = Math.sin(crack.angle) * cLen;

          // Crack glow
          const gR = px(0.01, minDim);
          const cgx = cEx * 0.5;
          const cgy = cEy * 0.5;
          const cg = ctx.createRadialGradient(cgx, cgy, 0, cgx, cgy, gR);
          cg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.10 * entrance));
          cg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = cg;
          ctx.fillRect(cgx - gR, cgy - gR, gR * 2, gR * 2);

          // Crack line
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(cEx, cEy);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.18 * entrance);
          ctx.lineWidth = px(crack.width, minDim);
          ctx.stroke();
        }

        // Specular on cocoon
        const specR = cocoonW * 0.4;
        const specG = ctx.createRadialGradient(-cocoonW * 0.3, -cocoonH * 0.25, 0, -cocoonW * 0.3, -cocoonH * 0.25, specR);
        specG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.14 * entrance));
        specG.addColorStop(0.4, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.04 * entrance));
        specG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
        ctx.fillStyle = specG;
        ctx.beginPath();
        ctx.arc(-cocoonW * 0.3, -cocoonH * 0.25, specR, 0, Math.PI * 2);
        ctx.fill();

        // Pressure indicator arc
        if (pressure > 0.05) {
          ctx.beginPath();
          ctx.ellipse(0, 0, cocoonW * 1.2, cocoonH * 1.2, 0, -Math.PI / 2, -Math.PI / 2 + pressure * Math.PI * 2);
          ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.10 * entrance);
          ctx.lineWidth = px(STROKE.medium, minDim);
          ctx.stroke();
        }

        ctx.restore();
      }

      // ── 6. Burst flash ────────────────────────────────────────
      if (s.burstIntensity > 0.01) {
        const burstR = px(0.35, minDim) * s.burstIntensity;
        const burstG = ctx.createRadialGradient(cx, cy, 0, cx, cy, burstR);
        const burstCol: RGB = [
          Math.min(255, s.primaryRgb[0] + 80),
          Math.min(255, s.primaryRgb[1] + 60),
          Math.min(255, s.primaryRgb[2] + 30),
        ];
        burstG.addColorStop(0, rgba(burstCol, ALPHA.glow.max * 0.25 * s.burstIntensity * entrance));
        burstG.addColorStop(0.3, rgba(burstCol, ALPHA.glow.max * 0.10 * s.burstIntensity * entrance));
        burstG.addColorStop(0.6, rgba(burstCol, ALPHA.glow.max * 0.03 * s.burstIntensity * entrance));
        burstG.addColorStop(1, rgba(burstCol, 0));
        ctx.fillStyle = burstG;
        ctx.fillRect(cx - burstR, cy - burstR, burstR * 2, burstR * 2);
      }

      // ── 7. Cocoon fragments (cloth-drape flutter) ──────────────
      for (const fr of s.fragments) {
        const fx = fr.x * w;
        const fy = fr.y * h;
        const fSize = px(fr.size, minDim);
        const drape = Math.sin(time * 4 + fr.drapePhase) * fSize * 0.2;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(fr.angle);
        // Fragment as irregular quad (cloth scrap)
        ctx.beginPath();
        ctx.moveTo(-fSize + drape, -fSize * 0.6);
        ctx.lineTo(fSize, -fSize * 0.4 - drape);
        ctx.lineTo(fSize * 0.8 + drape, fSize * 0.5);
        ctx.lineTo(-fSize * 0.6, fSize * 0.7 + drape);
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * fr.life * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * fr.life * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
        ctx.restore();
      }

      // ── 8. Butterfly wings (unfurling cloth) ───────────────────
      if (s.shattered && s.wingUnfurl > 0.01) {
        const wingSpan = px(WING_SPAN, minDim) * easeOutCubic(s.wingUnfurl);
        const wingH = wingSpan * 0.7;
        const unfurl = easeOutExpo(s.wingUnfurl);

        // Emergence glow
        for (let i = EMERGE_GLOW - 1; i >= 0; i--) {
          const gR = wingSpan * (0.5 + i * 0.5 + unfurl * 1.5);
          const gA = ALPHA.glow.max * 0.06 * unfurl * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.4, rgba(s.primaryRgb, gA * 0.3));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Draw both wings
        for (const side of [-1, 1]) {
          ctx.save();
          ctx.translate(cx, cy);

          // Wing shape
          const drape = Math.sin(time * 2 + side) * WING_DRAPE * minDim * unfurl;
          ctx.beginPath();
          ctx.moveTo(0, -wingH * 0.3);
          ctx.bezierCurveTo(
            side * wingSpan * 0.6, -wingH * 0.5 + drape,
            side * wingSpan * 0.9, -wingH * 0.1,
            side * wingSpan * 0.5, wingH * 0.4 - drape
          );
          ctx.bezierCurveTo(
            side * wingSpan * 0.2, wingH * 0.5,
            0, wingH * 0.3,
            0, wingH * 0.1
          );
          ctx.closePath();

          const wingGrad = ctx.createRadialGradient(
            side * wingSpan * 0.2, 0, 0, side * wingSpan * 0.3, 0, wingSpan * 0.7);
          const wingCol = lerpColor(s.primaryRgb, s.accentRgb, 0.3);
          wingGrad.addColorStop(0, rgba(wingCol, ALPHA.content.max * 0.28 * unfurl * entrance));
          wingGrad.addColorStop(0.3, rgba(wingCol, ALPHA.content.max * 0.20 * unfurl * entrance));
          wingGrad.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.content.max * 0.12 * unfurl * entrance));
          wingGrad.addColorStop(0.85, rgba(s.primaryRgb, ALPHA.content.max * 0.05 * unfurl * entrance));
          wingGrad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = wingGrad;
          ctx.fill();

          // Wing edge
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.10 * unfurl * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim);
          ctx.stroke();

          // Wing vein fibers (cloth structure)
          for (let v = 0; v < WING_VEINS; v++) {
            const vFrac = (v + 1) / (WING_VEINS + 1);
            const vAngle = -0.3 + vFrac * 1.4;
            const vLen = wingSpan * (0.3 + vFrac * 0.4) * unfurl;
            const vWave = Math.sin(time * 1.5 + v * 0.8) * px(WING_DRAPE * 0.3, minDim);
            ctx.beginPath();
            ctx.moveTo(0, (-0.3 + vFrac * 0.4) * wingH);
            ctx.quadraticCurveTo(
              side * vLen * 0.5, (-0.3 + vFrac * 0.6) * wingH + vWave,
              side * vLen * 0.8, (-0.1 + vFrac * 0.3) * wingH
            );
            ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.07 * unfurl * entrance);
            ctx.lineWidth = px(STROKE.hairline, minDim);
            ctx.stroke();
          }

          // Wing specular
          const wSpecR = wingSpan * 0.12;
          const wSpecG = ctx.createRadialGradient(
            side * wingSpan * 0.25, -wingH * 0.15, 0,
            side * wingSpan * 0.25, -wingH * 0.15, wSpecR);
          wSpecG.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.10 * unfurl * entrance));
          wSpecG.addColorStop(0.5, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.03 * unfurl * entrance));
          wSpecG.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
          ctx.fillStyle = wSpecG;
          ctx.beginPath();
          ctx.arc(side * wingSpan * 0.25, -wingH * 0.15, wSpecR, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // Body center
        const bodyR = px(0.012, minDim);
        const bodyG = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyR);
        bodyG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.30 * unfurl * entrance));
        bodyG.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.15 * unfurl * entrance));
        bodyG.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bodyG;
        ctx.fillRect(cx - bodyR, cy - bodyR, bodyR * 2, bodyR * 2);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer events ─────────────────────────────────────
    const onDown = () => {
      const s = stateRef.current;
      const cb = callbacksRef.current;
      if (s.shattered) return;

      s.tapCount++;
      cb.onHaptic('tap');

      // Add crack along fiber boundary
      const angle = (s.tapCount / TAPS_TO_SHATTER) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      s.cracks.push({
        angle,
        length: 0.35 + Math.random() * 0.55,
        width: STROKE.hairline + Math.random() * STROKE.thin,
      });

      if (s.tapCount >= Math.floor(TAPS_TO_SHATTER * 0.6) && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }

      if (s.tapCount >= TAPS_TO_SHATTER) {
        s.shattered = true;
        s.burstIntensity = 1;
        s.completed = true;
        cb.onHaptic('completion');

        // Spawn cloth fragments
        for (let i = 0; i < FRAGMENT_COUNT; i++) {
          const fAngle = (i / FRAGMENT_COUNT) * Math.PI * 2 + Math.random() * 0.3;
          const speed = FRAGMENT_SPEED * (0.5 + Math.random());
          s.fragments.push({
            x: 0.5 + Math.cos(fAngle) * 0.02,
            y: 0.5 + Math.sin(fAngle) * 0.02,
            vx: Math.cos(fAngle) * speed,
            vy: Math.sin(fAngle) * speed - 0.001,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * FRAGMENT_FLUTTER,
            size: 0.008 + Math.random() * 0.015,
            life: 1,
            drapePhase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    canvas.addEventListener('pointerdown', onDown);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
