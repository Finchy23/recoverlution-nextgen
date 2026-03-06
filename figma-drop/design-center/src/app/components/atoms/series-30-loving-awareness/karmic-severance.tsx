/**
 * ATOM 296: THE KARMIC SEVERANCE ENGINE
 * ========================================
 * Series 30 — Loving Awareness · Position 6
 *
 * Resentment is poison you drink yourself. Cut the chain — the weight
 * plummets, and your avatar shoots into the open sky.
 *
 * PHYSICS:
 *   - Avatar node (SIZE.md) tethered to heavy anchor weight below
 *   - Chain rendered as individual linked segments with tension glow
 *   - Chain vibrates with increasing resentment energy over time
 *   - Sever zone indicated by subtle pulse line
 *   - Swipe horizontally across chain to sever it
 *   - On sever: dramatic spark burst at sever point
 *   - Weight plummets with heavy acceleration + fade trail
 *   - Avatar shoots upward with buoyant acceleration + specular highlight
 *   - Volumetric sky light opens above with sacred freedom mandala
 *   - Soar trails emit luminous wake particles
 *   - Breath modulates avatar glow warmth, chain tension energy, sky depth
 *
 * INTERACTION:
 *   Swipe (horizontal across chain) → severs the link
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static freed avatar floating in open sky
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

/** Avatar radius — hero element */
const AVATAR_R = SIZE.md;                    // 0.22
/** Avatar starting Y position */
const AVATAR_START_Y = 0.44;
/** Anchor weight radius */
const WEIGHT_R = 0.14;
/** Anchor weight Y position */
const WEIGHT_Y = 0.82;
/** Chain sever zone Y */
const CHAIN_SEVER_Y = 0.63;
/** Vertical hit zone for sever detection */
const CHAIN_SEVER_ZONE = 0.08;
/** Minimum horizontal swipe distance */
const SWIPE_MIN_DX = 0.07;
/** Number of chain link segments */
const CHAIN_LINK_COUNT = 10;
/** Chain vibration rate increase */
const CHAIN_VIB_RATE = 0.003;
/** Maximum chain vibration amplitude */
const CHAIN_VIB_MAX = 0.014;
/** Avatar upward acceleration post-sever */
const AVATAR_RISE_ACCEL = 0.00035;
/** Avatar max rise speed */
const AVATAR_RISE_MAX = 0.014;
/** Weight downward acceleration */
const WEIGHT_FALL_ACCEL = 0.0007;
/** Weight max fall speed */
const WEIGHT_FALL_MAX = 0.022;
/** Snap spark count */
const SNAP_SPARK_COUNT = 24;
/** Snap spark lifetime */
const SNAP_SPARK_LIFE = 55;
/** Sky expansion rate */
const SKY_EXPAND_RATE = 0.012;
/** Breath modulates avatar glow */
const BREATH_GLOW = 0.06;
/** Breath modulates chain energy */
const BREATH_CHAIN = 0.03;
/** Breath modulates sky depth */
const BREATH_SKY = 0.04;
/** Glow rendering layers */
const GLOW_LAYERS = 5;
/** Soar trail wake particle count */
const SOAR_TRAIL_COUNT = 16;
/** Volumetric sky god ray count */
const SKY_RAY_COUNT = 10;
/** Sky ray max length */
const SKY_RAY_LENGTH = 0.4;
/** Sacred freedom mandala arms */
const FREEDOM_ARMS = 8;
/** Chain link glow energy color blend */
const CHAIN_ENERGY_BLEND = 0.3;

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** Spark particle from chain snap */
interface SnapSpark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

/** Soar wake particle */
interface SoarWake {
  x: number; y: number;
  alpha: number;
  size: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function KarmicSeveranceAtom({
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
    severed: false,
    severProgress: 0,
    avatarY: AVATAR_START_Y,
    avatarVY: 0,
    weightY: WEIGHT_Y,
    weightVY: 0,
    chainVibration: 0,
    skyExpansion: 0,
    sparks: [] as SnapSpark[],
    soarTrails: [] as SoarWake[],
    swipeStartX: 0,
    swipeStartY: 0,
    swiping: false,
    completed: false,
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

    /** Spawn sparks at sever point */
    const spawnSparks = (s: typeof stateRef.current) => {
      for (let i = 0; i < SNAP_SPARK_COUNT; i++) {
        const angle = (i / SNAP_SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 0.003 + Math.random() * 0.009;
        s.sparks.push({
          x: 0.5, y: CHAIN_SEVER_Y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: SNAP_SPARK_LIFE, maxLife: SNAP_SPARK_LIFE,
          size: 0.003 + Math.random() * 0.005,
        });
      }
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

      const time = s.frameCount * 0.015;
      const warmColor = lerpColor(s.primaryRgb, s.accentRgb, 0.2 + breath * BREATH_GLOW);
      const breathPulse = 1 + breath * BREATH_GLOW;

      // ── Reduced motion ──────────────────────────────────────
      if (p.reducedMotion) {
        const avatarR = px(AVATAR_R * 0.45, minDim);
        const fy = h * 0.22;
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = avatarR * (2 + i * 1.3);
          const gA = ALPHA.glow.max * 0.28 * entrance / (i + 1);
          const gg = ctx.createRadialGradient(cx, fy, 0, cx, fy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, gA));
          gg.addColorStop(0.3, rgba(s.primaryRgb, gA * 0.45));
          gg.addColorStop(0.6, rgba(s.primaryRgb, gA * 0.1));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, fy - gR, gR * 2, gR * 2);
        }
        ctx.beginPath();
        ctx.arc(cx, fy, avatarR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.7 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (p.phase === 'resolve' && !s.severed) {
        s.severed = true;
        cb.onHaptic('swipe_commit');
        spawnSparks(s);
      }

      // ── Chain vibration ─────────────────────────────────────
      if (!s.severed) {
        s.chainVibration = Math.min(CHAIN_VIB_MAX, s.chainVibration + CHAIN_VIB_RATE * 0.01 * ms * (1 + breath * BREATH_CHAIN));
      }

      // ── Post-sever physics ──────────────────────────────────
      if (s.severed) {
        s.severProgress = Math.min(1, s.severProgress + 0.018 * ms);
        s.avatarVY = Math.max(-AVATAR_RISE_MAX, s.avatarVY - AVATAR_RISE_ACCEL * ms);
        s.avatarY += s.avatarVY * ms;
        s.avatarY = Math.max(0.04, s.avatarY);
        s.weightVY = Math.min(WEIGHT_FALL_MAX, s.weightVY + WEIGHT_FALL_ACCEL * ms);
        s.weightY += s.weightVY * ms;
        s.skyExpansion = Math.min(1, s.skyExpansion + SKY_EXPAND_RATE * ms);

        // Soar wake particles
        if (s.frameCount % 2 === 0 && s.avatarY > 0.05) {
          s.soarTrails.push({
            x: 0.5 + (Math.random() - 0.5) * 0.03,
            y: s.avatarY + 0.02,
            alpha: 1,
            size: 0.003 + Math.random() * 0.004,
          });
          if (s.soarTrails.length > SOAR_TRAIL_COUNT) s.soarTrails.shift();
        }
        for (const trail of s.soarTrails) { trail.alpha *= 0.94; }

        if (s.severProgress >= 0.95 && !s.completed) {
          s.completed = true;
          cb.onHaptic('completion');
        }
      }

      cb.onStateChange?.(s.severed ? 0.5 + s.severProgress * 0.5 : 0);

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 1: Sky field with volumetric god rays
      // ═════════════════════════════════════════════════════════════
      if (s.skyExpansion > 0) {
        const skyR = px(0.5 * s.skyExpansion, minDim);
        const skyY = h * 0.12;
        const sky = ctx.createRadialGradient(cx, skyY, 0, cx, skyY, skyR);
        sky.addColorStop(0, rgba(warmColor, ALPHA.glow.max * 0.15 * s.skyExpansion * entrance));
        sky.addColorStop(0.3, rgba(warmColor, ALPHA.glow.max * 0.07 * s.skyExpansion * entrance));
        sky.addColorStop(0.6, rgba(warmColor, ALPHA.glow.max * 0.02 * s.skyExpansion * entrance));
        sky.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = sky;
        ctx.fillRect(cx - skyR, skyY - skyR, skyR * 2, skyR * 2);

        // God rays downward from sky
        for (let i = 0; i < SKY_RAY_COUNT; i++) {
          const baseAngle = Math.PI * 0.3 + (i / (SKY_RAY_COUNT - 1)) * Math.PI * 0.4;
          const rayLen = px(SKY_RAY_LENGTH * s.skyExpansion * (0.5 + 0.5 * Math.sin(time * 0.4 + i)), minDim) * (1 + breath * BREATH_SKY);
          const rx = cx + (i - SKY_RAY_COUNT / 2) * px(0.04, minDim);
          const ry1 = skyY;
          const ry2 = ry1 + Math.sin(baseAngle) * rayLen;
          const rx2 = rx + Math.cos(baseAngle) * rayLen * 0.3;

          const rg = ctx.createLinearGradient(rx, ry1, rx2, ry2);
          const ra = ALPHA.glow.max * 0.06 * s.skyExpansion * entrance;
          rg.addColorStop(0, rgba(warmColor, ra));
          rg.addColorStop(0.3, rgba(warmColor, ra * 0.3));
          rg.addColorStop(1, rgba(warmColor, 0));
          ctx.beginPath();
          ctx.moveTo(rx, ry1);
          ctx.lineTo(rx2, ry2);
          ctx.strokeStyle = rg;
          ctx.lineWidth = px(0.004 * s.skyExpansion, minDim);
          ctx.stroke();
        }

        // Sacred freedom mandala in sky
        if (s.skyExpansion > 0.3) {
          const mandAlpha = ALPHA.content.max * 0.08 * (s.skyExpansion - 0.3) / 0.7 * entrance;
          const mandR = skyR * 0.4;
          for (let i = 0; i < FREEDOM_ARMS; i++) {
            const a = (i / FREEDOM_ARMS) * Math.PI * 2 + time * 0.02;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * mandR * 0.2, skyY + Math.sin(a) * mandR * 0.2);
            ctx.lineTo(cx + Math.cos(a) * mandR, skyY + Math.sin(a) * mandR);
            ctx.strokeStyle = rgba(warmColor, mandAlpha);
            ctx.lineWidth = px(0.001, minDim);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(cx, skyY, mandR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmColor, mandAlpha * 0.5);
          ctx.lineWidth = px(0.0008, minDim);
          ctx.stroke();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 2: Chain links (before sever)
      // ═════════════════════════════════════════════════════════════
      if (!s.severed) {
        const chainTopY = s.avatarY * h + px(AVATAR_R * 0.28, minDim);
        const chainBotY = s.weightY * h - px(WEIGHT_R * 0.45, minDim);

        for (let i = 0; i < CHAIN_LINK_COUNT; i++) {
          const t = i / (CHAIN_LINK_COUNT - 1);
          const linkY = chainTopY + t * (chainBotY - chainTopY);
          const vibX = Math.sin(time * 4 + i * 1.3) * px(s.chainVibration, minDim);
          const linkR = px(0.007, minDim);

          // Chain link energy glow
          const energyR = linkR * 3;
          const eAlpha = ALPHA.glow.max * 0.06 * (s.chainVibration / CHAIN_VIB_MAX) * entrance;
          const eg = ctx.createRadialGradient(cx + vibX, linkY, 0, cx + vibX, linkY, energyR);
          eg.addColorStop(0, rgba(s.accentRgb, eAlpha));
          eg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = eg;
          ctx.fillRect(cx + vibX - energyR, linkY - energyR, energyR * 2, energyR * 2);

          // Chain link body
          ctx.beginPath();
          ctx.arc(cx + vibX, linkY, linkR, 0, Math.PI * 2);
          const linkColor = lerpColor(s.accentRgb, s.primaryRgb, CHAIN_ENERGY_BLEND * (s.chainVibration / CHAIN_VIB_MAX));
          ctx.fillStyle = rgba(linkColor, ALPHA.content.max * 0.38 * entrance);
          ctx.fill();

          // Connection line to next link
          if (i < CHAIN_LINK_COUNT - 1) {
            const nextT = (i + 1) / (CHAIN_LINK_COUNT - 1);
            const nextY = chainTopY + nextT * (chainBotY - chainTopY);
            const nextVibX = Math.sin(time * 4 + (i + 1) * 1.3) * px(s.chainVibration, minDim);
            ctx.beginPath();
            ctx.moveTo(cx + vibX, linkY);
            ctx.lineTo(cx + nextVibX, nextY);
            ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.22 * entrance);
            ctx.lineWidth = px(0.002, minDim);
            ctx.stroke();
          }
        }

        // Sever zone indicator
        const severY = CHAIN_SEVER_Y * h;
        const severPulse = 0.4 + 0.6 * Math.sin(time * 2);
        const severAlpha = ALPHA.content.max * 0.07 * severPulse * entrance;
        ctx.beginPath();
        ctx.moveTo(cx - px(0.07, minDim), severY);
        ctx.lineTo(cx + px(0.07, minDim), severY);
        ctx.strokeStyle = rgba(s.primaryRgb, severAlpha);
        ctx.lineWidth = px(0.001, minDim);
        ctx.setLineDash([px(0.003, minDim), px(0.003, minDim)]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 3: Weight (anchor/burden)
      // ═════════════════════════════════════════════════════════════
      if (s.weightY < 1.5) {
        const wy = s.weightY * h;
        const wR = px(WEIGHT_R, minDim);
        const weightFade = s.severed ? Math.max(0, 1 - (s.weightY - WEIGHT_Y) * 3) : 1;
        if (weightFade > 0.01) {
          // Weight gradient (4-stop)
          const wg = ctx.createRadialGradient(cx, wy, 0, cx, wy, wR);
          wg.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.4 * weightFade * entrance));
          wg.addColorStop(0.3, rgba(s.accentRgb, ALPHA.content.max * 0.28 * weightFade * entrance));
          wg.addColorStop(0.65, rgba(s.accentRgb, ALPHA.content.max * 0.12 * weightFade * entrance));
          wg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = wg;
          ctx.beginPath();
          ctx.arc(cx, wy, wR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 4: Avatar (light self) with soar trails
      // ═════════════════════════════════════════════════════════════
      const avY = s.avatarY * h;
      const avR = px(AVATAR_R * 0.38, minDim) * breathPulse;

      // Soar wake trails
      for (const trail of s.soarTrails) {
        if (trail.alpha < 0.04) continue;
        const ty = trail.y * h;
        const tR = px(trail.size, minDim);
        const tGlow = ctx.createRadialGradient(cx, ty, 0, cx, ty, tR * 4);
        tGlow.addColorStop(0, rgba(warmColor, ALPHA.glow.max * 0.12 * trail.alpha * entrance));
        tGlow.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = tGlow;
        ctx.fillRect(cx - tR * 4, ty - tR * 4, tR * 8, tR * 8);
        ctx.beginPath();
        ctx.arc(cx, ty, tR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmColor, ALPHA.content.max * 0.2 * trail.alpha * entrance);
        ctx.fill();
      }

      // Avatar multi-layer glow (5-stop)
      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = avR * (1.5 + i * 1.1);
        const gA = ALPHA.glow.max * (0.1 + (s.severed ? 0.22 : 0)) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, avY, 0, cx, avY, gR);
        gg.addColorStop(0, rgba(warmColor, gA));
        gg.addColorStop(0.2, rgba(warmColor, gA * 0.6));
        gg.addColorStop(0.45, rgba(warmColor, gA * 0.2));
        gg.addColorStop(0.75, rgba(warmColor, gA * 0.04));
        gg.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, avY - gR, gR * 2, gR * 2);
      }

      // Avatar core
      const avGrad = ctx.createRadialGradient(cx, avY, 0, cx, avY, avR);
      avGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * (0.55 + (s.severed ? 0.35 : 0)) * entrance));
      avGrad.addColorStop(0.5, rgba(warmColor, ALPHA.content.max * 0.25 * entrance));
      avGrad.addColorStop(1, rgba(warmColor, 0));
      ctx.fillStyle = avGrad;
      ctx.beginPath();
      ctx.arc(cx, avY, avR, 0, Math.PI * 2);
      ctx.fill();

      // Specular on avatar
      const specR = avR * 0.25;
      const specG = ctx.createRadialGradient(cx - specR, avY - specR * 1.2, 0, cx - specR, avY - specR * 1.2, specR);
      specG.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance));
      specG.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = specG;
      ctx.fillRect(cx - specR * 2, avY - specR * 2.2, specR * 2, specR * 2);

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 5: Snap sparks
      // ═════════════════════════════════════════════════════════════
      for (let i = s.sparks.length - 1; i >= 0; i--) {
        const sp = s.sparks[i];
        sp.x += sp.vx * ms;
        sp.y += sp.vy * ms;
        sp.vy += 0.0001;
        sp.life -= ms;
        if (sp.life <= 0) { s.sparks.splice(i, 1); continue; }

        const lr = sp.life / sp.maxLife;
        const spx = sp.x * w;
        const spy = sp.y * h;
        const sR = px(sp.size * lr, minDim);
        const sA = ALPHA.content.max * 0.7 * lr * entrance;

        const sg = ctx.createRadialGradient(spx, spy, 0, spx, spy, sR * 2.5);
        sg.addColorStop(0, rgba(warmColor, sA * 0.5));
        sg.addColorStop(0.4, rgba(warmColor, sA * 0.15));
        sg.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(spx - sR * 2.5, spy - sR * 2.5, sR * 5, sR * 5);

        ctx.beginPath();
        ctx.arc(spx, spy, sR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(warmColor, sA);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.severed) return;
      const rect = canvas.getBoundingClientRect();
      s.swipeStartX = (e.clientX - rect.left) / rect.width;
      s.swipeStartY = (e.clientY - rect.top) / rect.height;
      s.swiping = true;
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.swiping || s.severed) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / rect.width;
      const currentY = (e.clientY - rect.top) / rect.height;
      const dx = Math.abs(currentX - s.swipeStartX);
      const nearSever = Math.abs(currentY - CHAIN_SEVER_Y) < CHAIN_SEVER_ZONE ||
                        Math.abs(s.swipeStartY - CHAIN_SEVER_Y) < CHAIN_SEVER_ZONE;

      if (dx >= SWIPE_MIN_DX && nearSever) {
        s.severed = true;
        s.swiping = false;
        callbacksRef.current.onHaptic('swipe_commit');
        spawnSparks(s);
      }
    };

    const onUp = () => { stateRef.current.swiping = false; };

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'ew-resize' }} />
    </div>
  );
}
