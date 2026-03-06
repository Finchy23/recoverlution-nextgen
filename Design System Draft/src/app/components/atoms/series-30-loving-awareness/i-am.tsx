/**
 * ATOM 298: THE I AM ENGINE
 * ===========================
 * Series 30 — Loving Awareness · Position 8
 *
 * Strip every noun and adjective. What remains? "I AM" —
 * merging into a single blindingly bright sphere of white light.
 *
 * PHYSICS:
 *   - Multiple identity-label particles orbit center in sacred geometry
 *   - Each label is a luminous particle with faint text-energy glow
 *   - Draw/swipe over labels to dissolve them into the center
 *   - Dissolved labels emit a chromatic dissolution trail toward center
 *   - As labels dissolve, center light grows with 5-stop radial gradient
 *   - Sacred geometry mandala emerges as labels clear (12-fold symmetry)
 *   - Specular highlight on central sphere intensifies with purity
 *   - Breath modulates center warmth, label drift speed, mandala rotation
 *   - Final state: single overwhelming light with volumetric god rays
 *
 * INTERACTION:
 *   Draw/swipe over labels → dissolves them into center light
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static bright center with sacred geometry, no labels
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

/** Center light minimum radius (tiny seed) */
const CENTER_R_MIN = 0.055;
/** Center light maximum radius at full dissolution (hero scale) */
const CENTER_R_MAX = SIZE.xl;                  // 0.42
/** Inner orbit radius for labels */
const LABEL_ORBIT_MIN = 0.16;
/** Outer orbit radius for labels */
const LABEL_ORBIT_MAX = 0.36;
/** Label particle visual radius */
const LABEL_R = 0.022;
/** Hit distance for label dissolution */
const DISSOLVE_HIT_DIST = 0.065;
/** Dissolution animation speed */
const DISSOLVE_SPEED = 0.035;
/** Base orbit speed for labels */
const ORBIT_SPEED = 0.0025;
/** Breath modulates center warmth (color blend) */
const BREATH_WARMTH = 0.07;
/** Breath modulates label drift speed */
const BREATH_DRIFT = 0.05;
/** Breath modulates mandala rotation */
const BREATH_MANDALA = 0.03;
/** Glow rendering layers */
const GLOW_LAYERS = 5;
/** Volumetric god ray count (final state) */
const GOD_RAY_COUNT = 16;
/** God ray max length */
const GOD_RAY_LENGTH = 0.48;
/** Sacred mandala arm count (12-fold symmetry) */
const MANDALA_ARMS = 12;
/** Mandala visibility threshold (dissolveRatio) */
const MANDALA_THRESHOLD = 0.3;
/** Specular highlight radius */
const SPECULAR_R = 0.03;
/** Dissolution trail particle count per label */
const TRAIL_PARTICLES = 6;
/** Trail particle life */
const TRAIL_LIFE = 30;

/** Identity labels — predicates after "I AM" */
const LABELS = [
  'smart', 'broken', 'strong', 'weak',
  'beautiful', 'ugly', 'enough', 'too much',
  'worthy', 'lost',
];

// ═════════════════════════════════════════════════════════════════════
// STATE TYPES
// ═════════════════════════════════════════════════════════════════════

/** An orbiting identity label particle */
interface LabelParticle {
  text: string;
  angle: number;
  orbitR: number;
  orbitSpeed: number;
  dissolved: boolean;
  dissolveProgress: number;
  brightness: number;
  /** Unique wobble phase for organic feel */
  wobblePhase: number;
}

/** Trail particle emitted during dissolution */
interface TrailParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  hue: number;
}

// ═════════════════════════════════════════════════════════════════════
// HELPER: Draw sacred mandala pattern
// ═════════════════════════════════════════════════════════════════════

function drawMandala(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, rotation: number,
  color: RGB, alpha: number,
  arms: number, minDim: number,
) {
  // Inner ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(color, alpha * 0.3);
  ctx.lineWidth = px(0.001, minDim);
  ctx.stroke();

  // Radiating arms with petal tips
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2 + rotation;
    const innerR = radius * 0.4;
    const outerR = radius;
    const x1 = cx + Math.cos(a) * innerR;
    const y1 = cy + Math.sin(a) * innerR;
    const x2 = cx + Math.cos(a) * outerR;
    const y2 = cy + Math.sin(a) * outerR;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = rgba(color, alpha * (0.3 + 0.4 * Math.sin(a * 2)));
    ctx.lineWidth = px(0.001, minDim);
    ctx.stroke();

    // Petal circle at tip
    const petalR = px(0.004, minDim);
    ctx.beginPath();
    ctx.arc(x2, y2, petalR, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, alpha * 0.4);
    ctx.fill();
  }

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(color, alpha * 0.25);
  ctx.lineWidth = px(0.0008, minDim);
  ctx.stroke();
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function IAmAtom({
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
    labels: LABELS.map((text, i): LabelParticle => ({
      text,
      angle: (i / LABELS.length) * Math.PI * 2,
      orbitR: LABEL_ORBIT_MIN + Math.random() * (LABEL_ORBIT_MAX - LABEL_ORBIT_MIN),
      orbitSpeed: ORBIT_SPEED * (0.7 + Math.random() * 0.6) * (i % 2 === 0 ? 1 : -1),
      dissolved: false,
      dissolveProgress: 0,
      brightness: 0.35 + Math.random() * 0.35,
      wobblePhase: Math.random() * Math.PI * 2,
    })),
    trails: [] as TrailParticle[],
    dragging: false,
    pointerX: 0,
    pointerY: 0,
    dissolvedCount: 0,
    completed: false,
    mandalaRotation: 0,
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

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      const time = s.frameCount * 0.012;
      const breathDrift = 1 + breath * BREATH_DRIFT;
      const warmColor = lerpColor(s.primaryRgb, s.accentRgb, 0.2 + breath * BREATH_WARMTH);

      // ── Reduced motion: static pure light ────────────────────
      if (p.reducedMotion) {
        const rR = px(CENTER_R_MAX * 0.5, minDim);
        for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
          const gR = rR * (1.5 + i);
          const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
          gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance / (i + 1)));
          gg.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance / (i + 1)));
          gg.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.max * 0.06 * entrance / (i + 1)));
          gg.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = gg;
          ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
        }
        drawMandala(ctx, cx, cy, rR * 1.4, 0, s.primaryRgb, ALPHA.content.max * 0.25 * entrance, MANDALA_ARMS, minDim);
        ctx.beginPath();
        ctx.arc(cx, cy, rR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.8 * entrance);
        ctx.fill();
        cb.onStateChange?.(1);
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      if (p.phase === 'resolve') {
        for (const label of s.labels) { label.dissolved = true; }
      }

      // ── Dissolve check ──────────────────────────────────────
      if (s.dragging) {
        for (const label of s.labels) {
          if (label.dissolved) continue;
          const lx = 0.5 + Math.cos(label.angle) * label.orbitR;
          const ly = 0.5 + Math.sin(label.angle) * label.orbitR;
          const dx = s.pointerX - lx;
          const dy = s.pointerY - ly;
          if (Math.sqrt(dx * dx + dy * dy) < DISSOLVE_HIT_DIST) {
            label.dissolved = true;
            s.dissolvedCount++;
            cb.onHaptic('step_advance');
            // Spawn chromatic trail particles
            for (let t = 0; t < TRAIL_PARTICLES; t++) {
              const tAngle = Math.atan2(0.5 - ly, 0.5 - lx) + (Math.random() - 0.5) * 0.8;
              const tSpeed = 0.004 + Math.random() * 0.006;
              s.trails.push({
                x: lx, y: ly,
                vx: Math.cos(tAngle) * tSpeed,
                vy: Math.sin(tAngle) * tSpeed,
                life: TRAIL_LIFE, maxLife: TRAIL_LIFE,
                hue: Math.random(),
              });
            }
          }
        }
      }

      // Animate labels
      for (const label of s.labels) {
        label.angle += label.orbitSpeed * ms * breathDrift;
        if (label.dissolved) {
          label.dissolveProgress = Math.min(1, label.dissolveProgress + DISSOLVE_SPEED * ms);
          label.orbitR = Math.max(0, label.orbitR - 0.004 * ms);
        }
      }

      // Animate trails
      for (let i = s.trails.length - 1; i >= 0; i--) {
        const tr = s.trails[i];
        tr.x += tr.vx * ms;
        tr.y += tr.vy * ms;
        tr.life -= ms;
        if (tr.life <= 0) { s.trails.splice(i, 1); }
      }

      const dissolveRatio = s.labels.filter(l => l.dissolveProgress > 0.9).length / s.labels.length;

      if (dissolveRatio >= 1 && !s.completed) {
        s.completed = true;
        cb.onHaptic('completion');
      }
      cb.onStateChange?.(dissolveRatio);

      // Mandala rotation — breath-coupled
      s.mandalaRotation += (0.002 + breath * BREATH_MANDALA) * ms;

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 1: Volumetric god rays (emerge as labels dissolve)
      // ═════════════════════════════════════════════════════════════
      if (dissolveRatio > 0.5) {
        const rayIntensity = (dissolveRatio - 0.5) / 0.5;
        for (let i = 0; i < GOD_RAY_COUNT; i++) {
          const rayAngle = (i / GOD_RAY_COUNT) * Math.PI * 2 + time * 0.03;
          const rayLen = px(GOD_RAY_LENGTH * rayIntensity * (0.5 + 0.5 * Math.sin(time * 0.7 + i * 0.9)), minDim);
          const rx1 = cx + Math.cos(rayAngle) * px(0.03, minDim);
          const ry1 = cy + Math.sin(rayAngle) * px(0.03, minDim);
          const rx2 = cx + Math.cos(rayAngle) * rayLen;
          const ry2 = cy + Math.sin(rayAngle) * rayLen;

          const rg = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
          const ra = ALPHA.glow.max * 0.1 * rayIntensity * entrance;
          rg.addColorStop(0, rgba(warmColor, ra));
          rg.addColorStop(0.25, rgba(warmColor, ra * 0.5));
          rg.addColorStop(0.6, rgba(warmColor, ra * 0.12));
          rg.addColorStop(1, rgba(warmColor, 0));
          ctx.beginPath();
          ctx.moveTo(rx1, ry1);
          ctx.lineTo(rx2, ry2);
          ctx.strokeStyle = rg;
          ctx.lineWidth = px(0.006 * rayIntensity, minDim);
          ctx.stroke();
        }
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 2: Center light sphere (5-stop gradient)
      // ═════════════════════════════════════════════════════════════
      const centerR = CENTER_R_MIN + dissolveRatio * (CENTER_R_MAX - CENTER_R_MIN);
      const cR = px(centerR * 0.5, minDim) * (1 + breath * 0.04);

      for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
        const gR = cR * (1.3 + i * 0.85 + dissolveRatio * 0.6);
        const gA = ALPHA.glow.max * (0.06 + dissolveRatio * 0.35) * entrance / (i + 1);
        const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
        gg.addColorStop(0, rgba(warmColor, gA));
        gg.addColorStop(0.15, rgba(warmColor, gA * 0.75));
        gg.addColorStop(0.35, rgba(warmColor, gA * 0.35));
        gg.addColorStop(0.65, rgba(warmColor, gA * 0.1));
        gg.addColorStop(1, rgba(warmColor, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      // Core body
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cR * 0.4);
      coreGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.content.max * (0.5 + dissolveRatio * 0.45) * entrance));
      coreGrad.addColorStop(0.5, rgba(warmColor, ALPHA.content.max * (0.2 + dissolveRatio * 0.3) * entrance));
      coreGrad.addColorStop(1, rgba(warmColor, 0));
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, cR * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight — brightens with purity
      if (dissolveRatio > 0.1) {
        const specAlpha = ALPHA.content.max * 0.5 * dissolveRatio * entrance;
        const specSize = px(SPECULAR_R * (0.5 + dissolveRatio * 0.5), minDim);
        const offX = -specSize * 0.4;
        const offY = -specSize * 0.5;
        const sg = ctx.createRadialGradient(cx + offX, cy + offY, 0, cx + offX, cy + offY, specSize);
        sg.addColorStop(0, rgba(s.primaryRgb, specAlpha));
        sg.addColorStop(0.3, rgba(s.primaryRgb, specAlpha * 0.3));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx + offX - specSize, cy + offY - specSize, specSize * 2, specSize * 2);
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 3: Sacred mandala (emerges as labels clear)
      // ═════════════════════════════════════════════════════════════
      if (dissolveRatio > MANDALA_THRESHOLD) {
        const mandalaAlpha = (dissolveRatio - MANDALA_THRESHOLD) / (1 - MANDALA_THRESHOLD);
        drawMandala(
          ctx, cx, cy,
          cR * (1.2 + dissolveRatio),
          s.mandalaRotation,
          warmColor,
          ALPHA.content.max * 0.2 * mandalaAlpha * entrance,
          MANDALA_ARMS, minDim,
        );
        // Second ring, counter-rotating
        drawMandala(
          ctx, cx, cy,
          cR * (1.8 + dissolveRatio * 0.5),
          -s.mandalaRotation * 0.6,
          warmColor,
          ALPHA.content.max * 0.1 * mandalaAlpha * entrance,
          MANDALA_ARMS / 2, minDim,
        );
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 4: Label particles
      // ═════════════════════════════════════════════════════════════
      for (const label of s.labels) {
        const wobble = Math.sin(time * 1.2 + label.wobblePhase) * 0.005;
        const lx = cx + Math.cos(label.angle) * px(label.orbitR + wobble, minDim);
        const ly = cy + Math.sin(label.angle) * px(label.orbitR + wobble, minDim);
        const alpha = (1 - label.dissolveProgress) * label.brightness;
        if (alpha < 0.02) continue;

        const labelAlpha = ALPHA.content.max * alpha * entrance;
        const lR = px(LABEL_R, minDim) * (1 - label.dissolveProgress * 0.6);

        // Label outer glow (3-stop)
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lR * 2.5);
        lg.addColorStop(0, rgba(s.accentRgb, labelAlpha * 0.35));
        lg.addColorStop(0.5, rgba(s.accentRgb, labelAlpha * 0.1));
        lg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = lg;
        ctx.fillRect(lx - lR * 2.5, ly - lR * 2.5, lR * 5, lR * 5);

        // Label core
        ctx.beginPath();
        ctx.arc(lx, ly, lR * 0.5, 0, Math.PI * 2);
        const lcg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lR * 0.5);
        lcg.addColorStop(0, rgba(s.accentRgb, labelAlpha * 0.6));
        lcg.addColorStop(0.7, rgba(s.accentRgb, labelAlpha * 0.25));
        lcg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = lcg;
        ctx.fill();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 5: Dissolution trail particles
      // ═════════════════════════════════════════════════════════════
      for (const tr of s.trails) {
        const lr = tr.life / tr.maxLife;
        const tx = tr.x * w;
        const ty = tr.y * h;
        const tR = px(0.003 * lr, minDim);
        const tColor = lerpColor(s.accentRgb, warmColor, 1 - lr);
        const tAlpha = ALPHA.content.max * 0.5 * lr * entrance;

        const tg = ctx.createRadialGradient(tx, ty, 0, tx, ty, tR * 2);
        tg.addColorStop(0, rgba(tColor, tAlpha));
        tg.addColorStop(1, rgba(tColor, 0));
        ctx.fillStyle = tg;
        ctx.fillRect(tx - tR * 2, ty - tR * 2, tR * 4, tR * 4);

        ctx.beginPath();
        ctx.arc(tx, ty, tR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(tColor, tAlpha * 0.8);
        ctx.fill();
      }

      // ═════════════════════════════════════════════════════════════
      // RENDER PASS 6: Completion radiance rings
      // ═════════════════════════════════════════════════════════════
      if (dissolveRatio > 0.85) {
        const ringIntensity = (dissolveRatio - 0.85) / 0.15;
        for (let i = 0; i < 4; i++) {
          const ringPhase = (time * 0.15 + i * 0.25) % 1;
          const ringR = cR * (0.5 + ringPhase * 2.5);
          const ringA = ALPHA.content.max * 0.1 * (1 - ringPhase) * ringIntensity * entrance;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(warmColor, ringA);
          ctx.lineWidth = px(0.0012, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer handlers ──────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointerX = (e.clientX - rect.left) / rect.width;
      stateRef.current.pointerY = (e.clientY - rect.top) / rect.height;
      callbacksRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      if (!stateRef.current.dragging) return;
      const rect = canvas.getBoundingClientRect();
      stateRef.current.pointerX = (e.clientX - rect.left) / rect.width;
      stateRef.current.pointerY = (e.clientY - rect.top) / rect.height;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
