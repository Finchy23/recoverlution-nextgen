/**
 * ATOM 295: THE NAMASTE LENS ENGINE
 * ====================================
 * Series 30 — Loving Awareness · Position 5
 *
 * Underneath the terrifying armor of your enemy is the same Soul
 * that lives in you. Pull the armor apart to find the identical light.
 *
 * PHYSICS:
 *   - Jagged dark armor shell (SIZE.xl) surrounds a hidden light core
 *   - Hold center to gradually peel armor fragments away
 *   - Each fragment peels with satisfying weight and metallic Fresnel glow
 *   - As armor opens, volumetric light shafts bleed through cracks
 *   - Sacred geometry halo ring emanates from the revealed inner light
 *   - At 60% peeled: step_advance — inner light becomes visible
 *   - Fully peeled: identical golden light revealed with specular crown
 *   - Two matching lights pulse in sync (recognition moment)
 *   - Breath modulates light warmth, fragment drift speed, and halo spin
 *
 * INTERACTION:
 *   Hold (center) → armor fragments peel outward over time
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static revealed light with scattered armor fragments
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale, FONT_SIZE,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Outer armor shell radius — hero instrument size */
const ARMOR_R = SIZE.xl;                   // 0.42
/** Inner soul-light radius revealed after peeling */
const INNER_LIGHT_R = SIZE.md;             // 0.22
/** Number of armor fragments ringing the core */
const FRAGMENT_COUNT = 18;
/** Rate peel progresses while holding (per frame) */
const PEEL_RATE = 0.007;
/** Individual fragment outward drift speed */
const PEEL_DRIFT = 0.003;
/** Fragment tumble rotation speed */
const FRAG_ROT_SPEED = 0.018;
/** Light starts bleeding through at this peel fraction */
const LIGHT_BLEED_START = 0.15;
/** Step haptic fires at this peel fraction */
const STEP_HAPTIC_AT = 0.6;
/** Breath modulates light warmth (color blend factor) */
const BREATH_WARMTH = 0.08;
/** Breath modulates fragment drift speed */
const BREATH_DRIFT = 0.04;
/** Breath modulates halo ring spin */
const BREATH_HALO = 0.03;
/** Multi-layer glow passes for depth */
const GLOW_LAYERS = 5;
/** Crack light volumetric intensity */
const CRACK_GLOW_INTENSITY = 0.4;
/** Number of volumetric light shaft rays through cracks */
const LIGHT_SHAFT_COUNT = 12;
/** Volumetric shaft max length (minDim fraction) */
const SHAFT_LENGTH = 0.35;
/** Sacred geometry halo ring count */
const HALO_RINGS = 3;
/** Sacred geometry petal count (12-fold symmetry) */
const SACRED_PETALS = 12;
/** Specular highlight radius fraction */
const SPECULAR_R = 0.025;
/** Specular secondary ellipse offset */
const SPECULAR_OFFSET = 0.015;
/** Recognition pulse speed (post-reveal) */
const RECOGNITION_SPEED = 0.025;
/** Post-reveal particle count for golden dust */
const DUST_COUNT = 80;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Individual armor shard with physics and visual state */
interface ArmorFragment {
  angle: number;
  arcWidth: number;
  dist: number;
  baseDist: number;
  rotation: number;
  peeled: boolean;
  peelProgress: number;
  thickness: number;
  /** Unique wobble phase for organic motion */
  wobblePhase: number;
}

/** Golden dust particle emitted post-reveal */
interface DustMote {
  angle: number;
  dist: number;
  speed: number;
  size: number;
  phase: number;
  drift: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER: Draw sacred geometry halo
// ═════════════════════════════════════════════════════════════════════

function drawSacredHalo(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, rotation: number,
  color: RGB, alpha: number,
  petals: number, minDim: number,
) {
  // Outer petal ring
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + rotation;
    const petalLen = radius * 0.2;
    const px1 = cx + Math.cos(a) * (radius - petalLen * 0.3);
    const py1 = cy + Math.sin(a) * (radius - petalLen * 0.3);
    const px2 = cx + Math.cos(a) * (radius + petalLen);
    const py2 = cy + Math.sin(a) * (radius + petalLen);
    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.strokeStyle = rgba(color, alpha * (0.4 + 0.6 * Math.sin(a * 3 + rotation * 2)));
    ctx.lineWidth = px(0.0015, minDim);
    ctx.stroke();
  }
  // Ring arc
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(color, alpha * 0.5);
  ctx.lineWidth = px(0.001, minDim);
  ctx.stroke();
}

// ═════════════════════════════════════════════════════════════════════
// HELPER: Draw specular highlight
// ═════════════════════════════════════════════════════════════════════

function drawSpecular(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number, alpha: number,
  color: RGB, offsetX: number, offsetY: number,
) {
  // Primary bright spot
  const sg = ctx.createRadialGradient(
    cx + offsetX, cy + offsetY, 0,
    cx + offsetX, cy + offsetY, r,
  );
  sg.addColorStop(0, rgba(color, alpha));
  sg.addColorStop(0.4, rgba(color, alpha * 0.3));
  sg.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = sg;
  ctx.fillRect(cx + offsetX - r, cy + offsetY - r, r * 2, r * 2);

  // Secondary reflection ellipse
  ctx.save();
  ctx.translate(cx - offsetX * 0.6, cy - offsetY * 0.6);
  ctx.scale(1, 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(color, alpha * 0.2);
  ctx.fill();
  ctx.restore();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function NamasteLensAtom({
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
    holding: false,
    holdTime: 0,
    peelProgress: 0,
    fragments: Array.from({ length: FRAGMENT_COUNT }, (_, i): ArmorFragment => ({
      angle: (i / FRAGMENT_COUNT) * Math.PI * 2,
      arcWidth: (Math.PI * 2 / FRAGMENT_COUNT) * 0.88,
      dist: ARMOR_R * 0.48,
      baseDist: ARMOR_R * 0.48,
      rotation: 0,
      peeled: false,
      peelProgress: 0,
      thickness: 0.018 + Math.random() * 0.014,
      wobblePhase: Math.random() * Math.PI * 2,
    })),
    dust: Array.from({ length: DUST_COUNT }, (): DustMote => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.02 + Math.random() * 0.15,
      speed: 0.0005 + Math.random() * 0.001,
      size: 0.0015 + Math.random() * 0.003,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.002,
    })),
    nextPeelIndex: 0,
    stepNotified: false,
    completed: false,
    haloRotation: 0,
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

    // ── Render loop ─────────────────────────────────────────────────
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

      const time = s.frameCount * 0.012;
      const breathWarmth = breath * BREATH_WARMTH;
      const breathDrift = 1 + breath * BREATH_DRIFT;
      const breathHalo = breath * BREATH_HALO;

      // ── Reduced motion: static revealed state ─────────────────
      if (p.reducedMotion) {
        const rR = px(INNER_LIGHT_R * 0.5, minDim);
        // Multi-layer glow
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = rR * (1.8 + i * 1.2);
          const gA = ALPHA.glow.max * 0.3 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.25, rgba(s.primaryRgb, gA * 0.6));
          gg.addColorStop(0.55, rgba(s.primaryRgb, gA * 0.2));
          gg.addColorStop(0.8, rgba(s.primaryRgb, gA * 0.05));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        // Core
        ctx.beginPath();
        ctx.arc(cx, cy, rR, 0, Math.PI * 2);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rR);
        cg.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.85 * entrance));
        cg.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cg;
        ctx.fill();
        // Halo ring
        drawSacredHalo(ctx, cx, cy, rR * 1.8, 0, s.primaryRgb, ALPHA.content.max * 0.2 * entrance, SACRED_PETALS, minDim);
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      // ── Hold → peel ─────────────────────────────────────────────
      if (s.holding || p.phase === 'resolve') {
        s.holdTime += ms;
        if (s.holdTime > 15) {
          s.peelProgress = Math.min(1, s.peelProgress + PEEL_RATE * ms);
          const targetPeeled = Math.floor(s.peelProgress * FRAGMENT_COUNT);
          while (s.nextPeelIndex < targetPeeled && s.nextPeelIndex < FRAGMENT_COUNT) {
            s.fragments[s.nextPeelIndex].peeled = true;
            s.nextPeelIndex++;
          }
        }
      }

      // Animate peeled fragments
      for (const frag of s.fragments) {
        if (frag.peeled) {
          frag.peelProgress = Math.min(1, frag.peelProgress + PEEL_DRIFT * ms * breathDrift);
          frag.dist = frag.baseDist + easeOutExpo(frag.peelProgress) * ARMOR_R * 0.9;
          frag.rotation += FRAG_ROT_SPEED * ms * (1 - frag.peelProgress * 0.6);
        }
      }

      // Haptics
      if (s.peelProgress >= STEP_HAPTIC_AT && !s.stepNotified) {
        s.stepNotified = true;
        cb.onHaptic('step_advance');
      }
      if (s.peelProgress >= 0.95 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(s.peelProgress);

      // Halo rotation — breath-coupled
      s.haloRotation += (0.003 + breathHalo) * ms;

      const easedPeel = easeOutExpo(s.peelProgress);
      const warmColor = lerpColor(s.primaryRgb, s.accentRgb, 0.25 + breathWarmth);

      // ═══════════════════════════════════════════════════════════════
      // RENDER PASS 1: Volumetric light shafts through cracks
      // ═══════════════════════════════════════════════════════════════
      if (s.peelProgress > LIGHT_BLEED_START) {
        const shaftIntensity = (s.peelProgress - LIGHT_BLEED_START) / (1 - LIGHT_BLEED_START);
        for (let i = 0; i < LIGHT_SHAFT_COUNT; i++) {
          const shaftAngle = (i / LIGHT_SHAFT_COUNT) * Math.PI * 2 + time * 0.05;
          const shaftLen = px(SHAFT_LENGTH * shaftIntensity * (0.6 + 0.4 * Math.sin(time + i * 1.1)), minDim);
          const sx = cx + Math.cos(shaftAngle) * px(0.04, minDim);
          const sy = cy + Math.sin(shaftAngle) * px(0.04, minDim);
          const ex = cx + Math.cos(shaftAngle) * shaftLen;
          const ey = cy + Math.sin(shaftAngle) * shaftLen;

          const shaftGrad = ctx.createLinearGradient(sx, sy, ex, ey);
          const sa = ALPHA.glow.max * 0.12 * shaftIntensity * entrance;
          shaftGrad.addColorStop(0, rgba(warmColor, sa));
          shaftGrad.addColorStop(0.3, rgba(warmColor, sa * 0.5));
          shaftGrad.addColorStop(0.7, rgba(warmColor, sa * 0.15));
          shaftGrad.addColorStop(1, rgba(warmColor, 0));

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = shaftGrad;
          ctx.lineWidth = px(0.008 * shaftIntensity, minDim);
          ctx.stroke();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // RENDER PASS 2: Inner light core (bleeds through cracks)
      // ═══════════════════════════════════════════════════════════════
      if (s.peelProgress > LIGHT_BLEED_START) {
        const lightIntensity = (s.peelProgress - LIGHT_BLEED_START) / (1 - LIGHT_BLEED_START);
        const lightR = px(INNER_LIGHT_R * 0.5 * lightIntensity, minDim) * (1 + breath * 0.04);

        // 5-stop radial glow layers
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = lightR * (1.5 + i * 1.1);
          const gA = ALPHA.glow.max * 0.18 * lightIntensity * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(warmColor, gA));
          gg.addColorStop(0.2, rgba(warmColor, gA * 0.7));
          gg.addColorStop(0.45, rgba(warmColor, gA * 0.3));
          gg.addColorStop(0.75, rgba(warmColor, gA * 0.08));
          gg.addColorStop(1, rgba(warmColor, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }

        // Core light body
        if (lightIntensity > 0.2) {
          const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, lightR * 0.7);
          coreGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * lightIntensity * 0.8 * entrance));
          coreGrad.addColorStop(0.4, rgba(warmColor, ALPHA.content.max * lightIntensity * 0.4 * entrance));
          coreGrad.addColorStop(1, rgba(warmColor, 0));
          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, lightR * 0.7, 0, Math.PI * 2);
          ctx.fill();

          // Specular highlight on inner light
          drawSpecular(
            ctx, cx, cy,
            px(SPECULAR_R, minDim) * lightIntensity,
            ALPHA.content.max * 0.5 * lightIntensity * entrance,
            s.primaryRgb,
            -px(SPECULAR_OFFSET, minDim),
            -px(SPECULAR_OFFSET, minDim),
          );
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // RENDER PASS 3: Sacred geometry halo rings
      // ═══════════════════════════════════════════════════════════════
      if (easedPeel > 0.3) {
        const haloAlpha = ALPHA.content.max * (easedPeel - 0.3) / 0.7 * 0.3 * entrance;
        for (let ring = 0; ring < HALO_RINGS; ring++) {
          const hR = px(INNER_LIGHT_R * 0.5 * (1.4 + ring * 0.5), minDim);
          const rot = s.haloRotation * (ring % 2 === 0 ? 1 : -0.7);
          drawSacredHalo(ctx, cx, cy, hR, rot, warmColor, haloAlpha / (ring + 1), SACRED_PETALS, minDim);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // RENDER PASS 4: Armor fragments
      // ═══════════════════════════════════════════════════════════════
      for (const frag of s.fragments) {
        const fragDist = px(frag.dist, minDim);
        const wobble = Math.sin(time * 1.5 + frag.wobblePhase) * px(0.003, minDim);
        const fragX = cx + Math.cos(frag.angle) * (fragDist + wobble);
        const fragY = cy + Math.sin(frag.angle) * (fragDist + wobble);
        const fragR = px(frag.thickness, minDim);
        const peelFade = frag.peeled ? (1 - frag.peelProgress * 0.85) : 1;
        const fragAlpha = ALPHA.content.max * peelFade * 0.45 * entrance;

        if (fragAlpha < 0.01) continue;

        ctx.save();
        ctx.translate(fragX, fragY);
        ctx.rotate(frag.angle + frag.rotation);

        // Fragment shape — angular shard with 4-stop gradient fill
        const fragLen = px(0.045 + frag.arcWidth * 0.02, minDim);
        ctx.beginPath();
        ctx.moveTo(-fragLen * 0.5, -fragR);
        ctx.lineTo(fragLen * 0.5, -fragR * 0.65);
        ctx.lineTo(fragLen * 0.35, fragR);
        ctx.lineTo(-fragLen * 0.45, fragR * 0.85);
        ctx.closePath();

        // Multi-stop gradient fill for metallic feel
        const fragGrad = ctx.createLinearGradient(-fragLen * 0.5, -fragR, fragLen * 0.5, fragR);
        fragGrad.addColorStop(0, rgba(s.accentRgb, fragAlpha * 0.6));
        fragGrad.addColorStop(0.3, rgba(s.accentRgb, fragAlpha));
        fragGrad.addColorStop(0.7, rgba(s.accentRgb, fragAlpha * 0.7));
        fragGrad.addColorStop(1, rgba(s.accentRgb, fragAlpha * 0.3));
        ctx.fillStyle = fragGrad;
        ctx.fill();

        // Fresnel edge highlight
        ctx.strokeStyle = rgba(lerpColor(s.accentRgb, s.primaryRgb, 0.4), fragAlpha * 0.6);
        ctx.lineWidth = px(0.0012, minDim);
        ctx.stroke();

        // Specular micro-highlight on fragment
        if (!frag.peeled || frag.peelProgress < 0.5) {
          const specR = fragR * 0.3;
          ctx.beginPath();
          ctx.arc(-fragLen * 0.15, -fragR * 0.3, specR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, fragAlpha * 0.25);
          ctx.fill();
        }

        ctx.restore();

        // Crack light between fragments during peeling
        if (frag.peeled && frag.peelProgress > 0.05 && frag.peelProgress < 0.6) {
          const crackR = fragR * 5;
          const crackGlow = ctx.createRadialGradient(fragX, fragY, 0, fragX, fragY, crackR);
          const crackA = ALPHA.glow.max * CRACK_GLOW_INTENSITY * (1 - frag.peelProgress / 0.6) * entrance;
          crackGlow.addColorStop(0, rgba(warmColor, crackA));
          crackGlow.addColorStop(0.3, rgba(warmColor, crackA * 0.4));
          crackGlow.addColorStop(1, rgba(warmColor, 0));
          ctx.fillStyle = crackGlow;
          ctx.fillRect(fragX - crackR, fragY - crackR, crackR * 2, crackR * 2);
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // RENDER PASS 5: Golden dust motes (post-reveal atmosphere)
      // ═══════════════════════════════════════════════════════════════
      if (easedPeel > 0.4) {
        const dustAlphaBase = (easedPeel - 0.4) / 0.6;
        for (const mote of s.dust) {
          mote.angle += mote.drift * ms;
          mote.dist += mote.speed * ms * breathDrift;
          if (mote.dist > 0.45) {
            mote.dist = 0.02 + Math.random() * 0.05;
            mote.angle = Math.random() * Math.PI * 2;
          }

          const mx = cx + Math.cos(mote.angle) * px(mote.dist, minDim);
          const my = cy + Math.sin(mote.angle) * px(mote.dist, minDim);
          const pulse = 0.5 + 0.5 * Math.sin(time * 2 + mote.phase);
          const mAlpha = ALPHA.content.max * 0.25 * dustAlphaBase * pulse * entrance;
          const mR = px(mote.size, minDim);

          // Mote glow
          const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mR * 3);
          mg.addColorStop(0, rgba(warmColor, mAlpha));
          mg.addColorStop(1, rgba(warmColor, 0));
          ctx.fillStyle = mg;
          ctx.fillRect(mx - mR * 3, my - mR * 3, mR * 6, mR * 6);

          ctx.beginPath();
          ctx.arc(mx, my, mR, 0, Math.PI * 2);
          ctx.fillStyle = rgba(warmColor, mAlpha * 0.8);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // RENDER PASS 6: Recognition pulse (post-completion)
      // ═══════════════════════════════════════════════════════════════
      if (s.completed) {
        const rTime = s.frameCount * RECOGNITION_SPEED;
        // Dual-pulse synchronization (recognition: same soul in both)
        const pulseA = Math.pow(Math.max(0, Math.sin(rTime)), 4);
        const pulseB = Math.pow(Math.max(0, Math.sin(rTime + 0.1)), 4);

        // Expanding recognition rings
        for (let i = 0; i < 4; i++) {
          const ringProgress = (rTime * 0.08 + i * 0.25) % 1;
          const ringR = px(INNER_LIGHT_R * 0.5 * (0.6 + ringProgress * 2.5), minDim);
          const ringA = ALPHA.content.max * 0.1 * (1 - ringProgress) * pulseA * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmColor, ringA);
          ctx.lineWidth = px(0.0015, minDim);
          ctx.stroke();
        }

        // Central brightness pulse — heartbeat of recognition
        const pulseR = px(0.03, minDim) * (1 + pulseB * 0.3);
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * (0.4 + pulseB * 0.4) * entrance);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════════════
      // RENDER PASS 7: Progress indicator ring
      // ═══════════════════════════════════════════════════════════════
      if (!s.completed && s.peelProgress > 0.01) {
        const progR = px(SIZE.xs, minDim);
        const progAngle = s.peelProgress * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy - px(INNER_LIGHT_R * 0.55, minDim), progR, -Math.PI / 2, -Math.PI / 2 + progAngle);
        ctx.strokeStyle = rgba(warmColor, ALPHA.content.max * 0.25 * entrance);
        ctx.lineWidth = px(0.002, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers (native addEventListener) ──────────────
    const onDown = () => {
      stateRef.current.holding = true;
      stateRef.current.holdTime = 0;
      callbacksRef.current.onHaptic('hold_start');
    };
    const onUp = () => { stateRef.current.holding = false; };

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
