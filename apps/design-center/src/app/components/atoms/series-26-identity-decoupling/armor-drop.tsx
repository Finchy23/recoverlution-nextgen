/**
 * ATOM 252: THE ARMOR DROP ENGINE
 * ==================================
 * Series 26 — Identity Decoupling · Position 2
 *
 * Defense mechanisms that saved you in childhood are now suffocating you.
 * Unlatch the iron plates — float. Each dropped plate sends a
 * floor-shaking thud. The figure rises, glows, becomes weightless.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Armor plates rendered as SDF sharp-cornered rectangles
 *   - As each plate drops, its SDF morphs from rigid box → soft
 *     crumbling shape with dissolving edges
 *   - The figure underneath morphs from SDF angular silhouette →
 *     smooth luminous SDF circle (rigid identity → fluid essence)
 *   - SDF edge glow intensifies on the freed figure
 *
 * PHYSICS:
 *   - Central figure wearing 8 heavy armor plates
 *   - Tap a plate → latch snaps, plate falls with gravity
 *   - Floor impact → shockwave ring + dust particles
 *   - Figure rises incrementally, SDF softens with each plate
 *   - 8 render layers: atmosphere, figure glow, figure body,
 *     ghost plates, armor plates, plate SDF edges, shockwaves, dust
 *
 * INTERACTION:
 *   Tap armor plate → drop it (tap, step_advance, completion)
 *
 * RENDER: Canvas 2D with SDF plate morphing + rising figure
 * REDUCED MOTION: All plates dropped, figure floating in glow
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Number of armor plates to shed */
const PLATE_COUNT = 8;
/** Figure height fraction */
const FIGURE_HEIGHT = 0.28;
/** Figure width fraction */
const FIGURE_WIDTH = 0.08;
/** Gravitational acceleration for falling plates */
const GRAVITY = 0.0012;
/** Floor Y position (fraction) */
const FLOOR_Y = 0.86;
/** Bounce energy retention */
const BOUNCE_DAMPING = 0.28;
/** Ghost plate trail decay */
const GHOST_DECAY = 0.987;
/** Dust particles per impact */
const DUST_COUNT = 8;
/** Dust lifetime */
const DUST_LIFE = 0.85;
/** Figure glow layers */
const GLOW_LAYERS = 5;
/** Shockwave expansion speed */
const SHOCKWAVE_SPEED = 0.014;
/** SDF edge softness for plates */
const PLATE_SDF_EDGE = 0.006;
/** Maximum figure rise from center */
const RISE_AMOUNT = 0.16;
/** Specular offset ratio */
const SPECULAR_OFF = 0.18;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface PlateConfig {
  label: string;
  xOff: number; yOff: number;
  w: number; h: number;
}

interface Plate extends PlateConfig {
  dropped: boolean; y: number; vy: number; landed: boolean;
  rotation: number; rotSpeed: number;
  /** SDF dissolve morph: 0 = rigid box, 1 = dissolved */
  dissolve: number;
}

interface DustMote {
  x: number; y: number; vx: number; vy: number; life: number; size: number;
}

interface Shockwave {
  x: number; y: number; radius: number; alpha: number;
}

interface GhostPlate {
  x: number; y: number; w: number; h: number; alpha: number;
}

const PLATE_CONFIGS: PlateConfig[] = [
  { label: 'CONTROL',      xOff: -0.08, yOff: -0.12, w: 0.055, h: 0.072 },
  { label: 'PERFECTION',   xOff:  0.08, yOff: -0.12, w: 0.055, h: 0.072 },
  { label: 'AVOIDANCE',    xOff:  0.00, yOff: -0.04, w: 0.10,  h: 0.06 },
  { label: 'PEOPLE-PLEAS', xOff:  0.00, yOff:  0.04, w: 0.085, h: 0.055 },
  { label: 'HYPERVIG',     xOff: -0.06, yOff:  0.10, w: 0.045, h: 0.072 },
  { label: 'NUMBING',      xOff:  0.06, yOff:  0.10, w: 0.045, h: 0.072 },
  { label: 'INTELLECTU',   xOff:  0.00, yOff: -0.20, w: 0.065, h: 0.045 },
  { label: 'RAGE',         xOff:  0.00, yOff:  0.18, w: 0.072, h: 0.045 },
];

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw SDF-edged armor plate with dissolve morph */
function drawSdfPlate(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  minDim: number, color: RGB, alpha: number, entrance: number,
  dissolve: number, label: string,
) {
  // Corner radius morphs from sharp to dissolved
  const cornerR = w * 0.08 * (1 + dissolve * 3);
  const bodyA = ALPHA.content.max * alpha * (1 - dissolve * 0.7) * entrance;

  // ── Plate shadow ────────────────────────────────────────────
  const shY = px(0.005, minDim);
  ctx.fillStyle = rgba(color, bodyA * 0.15);
  ctx.beginPath();
  ctx.roundRect(x - w / 2 + 1, y + shY, w, h, cornerR);
  ctx.fill();

  // ── Plate body with 4-stop gradient ─────────────────────────
  ctx.beginPath();
  ctx.roundRect(x - w / 2, y, w, h, cornerR);
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, rgba(color, bodyA * 1.1));
  grad.addColorStop(0.3, rgba(color, bodyA * 0.8));
  grad.addColorStop(0.7, rgba(color, bodyA * 0.6));
  grad.addColorStop(1, rgba(color, bodyA * 0.4));
  ctx.fillStyle = grad;
  ctx.fill();

  // ── SDF edge glow ───────────────────────────────────────────
  ctx.strokeStyle = rgba(color, bodyA * 0.7);
  ctx.lineWidth = px(STROKE.thin, minDim);
  ctx.stroke();

  // ── Outer edge glow (SDF signature) ─────────────────────────
  const edgeGlowW = px(PLATE_SDF_EDGE, minDim);
  ctx.shadowColor = rgba(color, bodyA * 0.3);
  ctx.shadowBlur = edgeGlowW;
  ctx.strokeStyle = rgba(color, bodyA * 0.2);
  ctx.lineWidth = px(STROKE.hairline, minDim);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ── Rivets (4 corners) ──────────────────────────────────────
  if (dissolve < 0.5) {
    const rivetR = px(0.002, minDim);
    const rivetA = bodyA * 0.5 * (1 - dissolve * 2);
    for (const [rx, ry] of [[-0.35, 0.12], [0.35, 0.12], [-0.35, 0.88], [0.35, 0.88]]) {
      ctx.beginPath();
      ctx.arc(x + w * rx, y + h * (ry as number), rivetR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, rivetA);
      ctx.fill();
    }
  }

  // ── Plate specular highlight ────────────────────────────────
  const specW = w * 0.4;
  const specH = h * 0.2;
  const specGrad = ctx.createRadialGradient(x - w * 0.1, y + h * 0.2, 0, x - w * 0.1, y + h * 0.2, specW);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, bodyA * 0.12));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.fillRect(x - w / 2, y, w, h * 0.4);

  // ── Weight hash lines (iron texture) ────────────────────────
  if (dissolve < 0.3) {
    const hashA = bodyA * 0.08 * (1 - dissolve * 3);
    for (let hi = 0; hi < 3; hi++) {
      const hy = y + h * (0.25 + hi * 0.25);
      ctx.beginPath();
      ctx.moveTo(x - w * 0.35, hy);
      ctx.lineTo(x + w * 0.35, hy);
      ctx.strokeStyle = rgba(color, hashA);
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();
    }
  }
}

/** Draw the rising figure silhouette with SDF morphing */
function drawFigure(
  ctx: CanvasRenderingContext2D,
  fX: number, fY: number, fW: number, fH: number,
  minDim: number, color: RGB, glow: number, entrance: number,
  breathMod: number,
) {
  const bodyAlpha = ALPHA.content.max * (0.12 + glow * 0.45) * entrance;

  // ── Figure glow field ───────────────────────────────────────
  for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
    const gR = fH * (0.5 + glow * 1.8 + i * 0.25) * breathMod;
    const gA = ALPHA.glow.max * (0.03 + glow * 0.18) * entrance / (i + 1);
    const gg = ctx.createRadialGradient(fX, fY, 0, fX, fY, gR);
    gg.addColorStop(0, rgba(color, gA));
    gg.addColorStop(0.25, rgba(color, gA * 0.45));
    gg.addColorStop(0.6, rgba(color, gA * 0.1));
    gg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(fX - gR, fY - gR, gR * 2, gR * 2);
  }

  // Head — morphs from angular to circular with glow
  const headR = fW * (0.35 + glow * 0.15);
  ctx.beginPath();
  ctx.arc(fX, fY - fH * 0.35, headR, 0, Math.PI * 2);
  const headGrad = ctx.createRadialGradient(fX, fY - fH * 0.35, 0, fX, fY - fH * 0.35, headR);
  headGrad.addColorStop(0, rgba(color, bodyAlpha * 1.2));
  headGrad.addColorStop(0.5, rgba(color, bodyAlpha * 0.7));
  headGrad.addColorStop(1, rgba(color, bodyAlpha * 0.3));
  ctx.fillStyle = headGrad;
  ctx.fill();

  // Torso — softens corners as glow increases
  const torsoCorner = fW * 0.05 * (1 + glow * 4);
  ctx.beginPath();
  ctx.roundRect(fX - fW * 0.38, fY - fH * 0.15, fW * 0.76, fH * 0.32, torsoCorner);
  ctx.fillStyle = rgba(color, bodyAlpha * 0.75);
  ctx.fill();

  // Legs
  const legCorner = fW * 0.04 * (1 + glow * 3);
  ctx.beginPath();
  ctx.roundRect(fX - fW * 0.24, fY + fH * 0.17, fW * 0.18, fH * 0.28, legCorner);
  ctx.fillStyle = rgba(color, bodyAlpha * 0.6);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(fX + fW * 0.06, fY + fH * 0.17, fW * 0.18, fH * 0.28, legCorner);
  ctx.fill();

  // ── Head specular ───────────────────────────────────────────
  const specX = fX - headR * 0.3;
  const specY = fY - fH * 0.35 - headR * 0.2;
  const specR = headR * 0.3;
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, bodyAlpha * 0.18 * glow));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, specR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ArmorDropAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const buildPlates = (): Plate[] =>
    PLATE_CONFIGS.map(cfg => ({
      ...cfg, dropped: false, y: cfg.yOff, vy: 0, landed: false,
      rotation: 0, rotSpeed: 0, dissolve: 0,
    }));

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    plates: buildPlates(),
    figureY: 0.5, figureGlow: 0,
    dust: [] as DustMote[],
    shockwaves: [] as Shockwave[],
    ghosts: [] as GhostPlate[],
    stepNotified: false, completed: false,
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
        s.plates.forEach(pl => { pl.dropped = true; pl.landed = true; pl.y = FLOOR_Y; pl.dissolve = 1; });
        s.completed = true;
      }

      const breathMod = 1 + p.breathAmplitude * 0.04;
      const breathGlow = 1 + p.breathAmplitude * 0.12;

      // ── Plate physics ──────────────────────────────────────
      for (const pl of s.plates) {
        if (pl.dropped && !pl.landed) {
          pl.vy += GRAVITY * ms;
          pl.y += pl.vy * ms;
          pl.rotation += pl.rotSpeed * ms;
          pl.dissolve = Math.min(1, pl.dissolve + 0.008 * ms);
          if (pl.y >= FLOOR_Y) {
            pl.y = FLOOR_Y;
            if (pl.vy > 0.005) {
              pl.vy = -pl.vy * BOUNCE_DAMPING;
              for (let d = 0; d < DUST_COUNT; d++) {
                s.dust.push({
                  x: 0.5 + pl.xOff + (Math.random() - 0.5) * 0.05,
                  y: FLOOR_Y,
                  vx: (Math.random() - 0.5) * 0.004,
                  vy: -Math.random() * 0.004 - 0.001,
                  life: DUST_LIFE, size: 0.002 + Math.random() * 0.004,
                });
              }
            } else {
              pl.landed = true; pl.vy = 0;
              cb.onHaptic('tap');
              s.shockwaves.push({ x: 0.5 + pl.xOff, y: FLOOR_Y, radius: 0, alpha: 0.45 });
            }
          }
        }
      }

      // Dust physics
      for (let i = s.dust.length - 1; i >= 0; i--) {
        const d = s.dust[i];
        d.x += d.vx * ms; d.y += d.vy * ms;
        d.vy += 0.00002 * ms; d.life -= 0.007 * ms;
        if (d.life <= 0) s.dust.splice(i, 1);
      }

      // Shockwaves
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.radius += SHOCKWAVE_SPEED * ms; sw.alpha *= 0.955;
        if (sw.alpha < 0.005) s.shockwaves.splice(i, 1);
      }

      // Ghost decay
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      const droppedCount = s.plates.filter(pl => pl.dropped).length;
      const lightness = droppedCount / PLATE_COUNT;
      s.figureGlow += (lightness - s.figureGlow) * 0.025 * ms;
      s.figureY = 0.5 - lightness * RISE_AMOUNT;

      if (droppedCount >= 4 && !s.stepNotified) { s.stepNotified = true; cb.onHaptic('step_advance'); }
      if (droppedCount >= PLATE_COUNT && !s.completed) { s.completed = true; cb.onHaptic('completion'); }
      cb.onStateChange?.(droppedCount / PLATE_COUNT);

      const fH = px(FIGURE_HEIGHT, minDim);
      const fW = px(FIGURE_WIDTH, minDim);
      const fX = cx;
      const fY = s.figureY * h;

      // ═══════════════════════════════════════════════════════
      // LAYER 1–2: Figure glow + body
      // ═══════════════════════════════════════════════════════
      drawFigure(ctx, fX, fY, fW, fH, minDim, s.primaryRgb, s.figureGlow, entrance, breathGlow);

      // ═══════════════════════════════════════════════════════
      // LAYER 3: Ghost afterimages
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * g.alpha * 0.15 * entrance);
        ctx.beginPath();
        ctx.roundRect(g.x * w - g.w / 2, g.y * h, g.w, g.h, g.w * 0.1);
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 4: Armor plates (SDF-morphed)
      // ═══════════════════════════════════════════════════════
      for (const pl of s.plates) {
        const plx = (0.5 + pl.xOff) * w;
        const ply = pl.dropped ? pl.y * h : (s.figureY + pl.yOff) * h;
        const plw = px(pl.w, minDim);
        const plh = px(pl.h, minDim);

        ctx.save();
        if (pl.dropped && !pl.landed) {
          ctx.translate(plx, ply);
          ctx.rotate(pl.rotation);
          ctx.translate(-plx, -ply);
        }

        const plColor = pl.landed ? s.accentRgb : lerpColor(s.accentRgb, s.primaryRgb, 0.15);
        const plAlpha = pl.landed ? 0.05 : 0.22;

        drawSdfPlate(ctx, plx, ply, plw, plh, minDim, plColor, plAlpha, entrance, pl.dissolve, pl.label);
        ctx.restore();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 5: Shockwaves
      // ═══════════════════════════════════════════════════════
      for (const sw of s.shockwaves) {
        const swR = px(sw.radius, minDim);
        ctx.beginPath();
        ctx.arc(sw.x * w, sw.y * h, swR, 0, Math.PI * 2);
        const swGrad = ctx.createRadialGradient(sw.x * w, sw.y * h, swR * 0.8, sw.x * w, sw.y * h, swR);
        swGrad.addColorStop(0, rgba(s.accentRgb, 0));
        swGrad.addColorStop(0.7, rgba(s.accentRgb, ALPHA.content.max * sw.alpha * 0.4 * entrance));
        swGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.strokeStyle = swGrad;
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 6: Dust particles with glow
      // ═══════════════════════════════════════════════════════
      for (const d of s.dust) {
        const dR = px(d.size, minDim);
        const dGrad = ctx.createRadialGradient(d.x * w, d.y * h, 0, d.x * w, d.y * h, dR * 2);
        dGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.15 * d.life * entrance));
        dGrad.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = dGrad;
        ctx.fillRect(d.x * w - dR * 2, d.y * h - dR * 2, dR * 4, dR * 4);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 7: Floor line with subtle glow
      // ═══════════════════════════════════════════════════════
      const floorGrad = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, 0);
      floorGrad.addColorStop(0, rgba(s.accentRgb, 0));
      floorGrad.addColorStop(0.3, rgba(s.accentRgb, ALPHA.content.max * 0.04 * entrance));
      floorGrad.addColorStop(0.7, rgba(s.accentRgb, ALPHA.content.max * 0.04 * entrance));
      floorGrad.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.beginPath();
      ctx.moveTo(w * 0.08, FLOOR_Y * h + px(0.008, minDim));
      ctx.lineTo(w * 0.92, FLOOR_Y * h + px(0.008, minDim));
      ctx.strokeStyle = floorGrad;
      ctx.lineWidth = px(STROKE.hairline, minDim);
      ctx.stroke();

      // ═══════════════════════════════════════════════════════
      // LAYER 8: Progress ring
      // ═══════════════════════════════════════════════════════
      if (!s.completed && droppedCount > 0) {
        const pR = px(0.36, minDim);
        const pAngle = lightness * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pR, -Math.PI / 2, -Math.PI / 2 + pAngle);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.1 * entrance);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Interaction: tap plate to drop ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      for (const pl of s.plates) {
        if (pl.dropped) continue;
        const plx = 0.5 + pl.xOff;
        const ply = s.figureY + pl.yOff;
        if (Math.abs(mx - plx) < pl.w * 0.9 && Math.abs(my - ply) < pl.h * 0.9) {
          const minD = Math.min(viewport.width, viewport.height);
          s.ghosts.push({
            x: plx, y: ply,
            w: px(pl.w, minD), h: px(pl.h, minD),
            alpha: 0.5,
          });
          pl.dropped = true; pl.y = ply; pl.vy = 0;
          pl.rotSpeed = (Math.random() - 0.5) * 0.04;
          callbacksRef.current.onHaptic('tap');
          break;
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
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'pointer',
      }} />
    </div>
  );
}
