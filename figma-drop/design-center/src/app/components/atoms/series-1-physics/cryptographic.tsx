/**
 * ATOM 006: THE CRYPTOGRAPHIC ENGINE
 * ====================================
 * Series 1 — Physics Engines · Position 6
 *
 * The ego hides truth behind noise, distraction, and defense.
 * Three layers of digital condensation obscure a luminous
 * geometric truth. The user wipes the screen — physically
 * clearing fog like condensation off a mirror — to reveal
 * what was always there beneath.
 *
 * PHYSICS:
 *   - 3 stacked fog/frost layers at decreasing density
 *   - Touch/drag creates circular wipe brush with velocity-scaling
 *   - Each layer dissolves when ~35% surface area is cleared
 *   - Beneath all layers: procedural sacred geometry that pulses
 *   - Wipe edges sparkle with cleared particles
 *   - The truth was never hidden — only obscured
 *
 * INTERACTION:
 *   Drag (finger)  → wipe brush clears fog layers
 *   Tap (anywhere)  → small burst clear at point
 *   Observable      → fog slowly re-condenses if abandoned
 *
 * LAYERS:
 *   3 (top)  Dense dark fog — almost opaque, warm grey noise
 *   2 (mid)  Translucent crystalline frost — cooler
 *   1 (base) Thin mist — barely visible, softening
 *   0 (truth) Pulsing geometric mandala in series colors
 *
 * RENDER: Canvas 2D with offscreen layer canvases
 * REDUCED MOTION: No geometry rotation, no sparkle drift
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, MASK_WHITE, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of fog layers */
const LAYER_COUNT = 3;
/** Fraction of layer that must be cleared to dissolve it */
const DISSOLVE_THRESHOLD = 0.32;
/** Wipe brush base radius (px) */
const BRUSH_BASE_RADIUS = 28;
/** Brush radius boost from velocity */
const BRUSH_VEL_SCALE = 0.4;
/** Max brush radius multiplier */
const BRUSH_MAX_SCALE = 2.8;
/** Fog re-condensation rate (pixels per frame when idle) — disabled */
const RECONDENSE_RATE = 0;
/** Sparkle particles at wipe edge */
const MAX_SPARKLES = 60;
/** Geometry rotation speed (rad/frame) */
const GEO_ROTATE_SPEED = 0.001;
/** Number of petals in the mandala */
const MANDALA_PETALS = 12;
/** Mandala ring count */
const MANDALA_RINGS = 5;

/** Fog layer base colors (front → back): dark smoke, deep haze, subtle mist */
const FOG_COLORS: RGB[] = [
  [28, 24, 35],   // Layer 0 (top): dense dark smoke — nearly opaque, warm-dark
  [38, 35, 50],   // Layer 1 (mid): translucent deep haze — cooler violet
  [50, 48, 65],   // Layer 2 (base): thin dark mist — slightly lighter, softening
];

// =====================================================================
// SPARKLE PARTICLE
// =====================================================================

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  brightness: number;
}

// =====================================================================
// PROCEDURAL FOG TEXTURE
// =====================================================================

function generateFogTexture(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  w: number,
  h: number,
  layerIndex: number,
  fogColor: RGB,
): void {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  if (!ctx) return;

  // Base fill — dark, dense
  const baseAlpha = [0.4, 0.28, 0.15][layerIndex] ?? 0.25;
  ctx.fillStyle = rgba(fogColor, baseAlpha);
  ctx.fillRect(0, 0, w, h);

  // Noise clouds — lighter patches for texture/depth (like digital interference)
  const cloudCount = [22, 14, 10][layerIndex] ?? 12;
  const cloudScale = [1.2, 0.9, 0.7][layerIndex] ?? 1;

  for (let i = 0; i < cloudCount; i++) {
    const cx = Math.random() * w;
    const cy = Math.random() * h;
    const r = (40 + Math.random() * 100) * cloudScale;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const cloudAlpha = (0.08 + Math.random() * 0.18) * baseAlpha;
    // Lighter patches in the dark fog — creates visual noise/texture
    const lighter: RGB = [
      Math.min(255, fogColor[0] + 30 + Math.random() * 25),
      Math.min(255, fogColor[1] + 25 + Math.random() * 20),
      Math.min(255, fogColor[2] + 35 + Math.random() * 30),
    ];
    grad.addColorStop(0, rgba(lighter, cloudAlpha));
    grad.addColorStop(0.5, rgba(fogColor, cloudAlpha * 0.4));
    grad.addColorStop(1, rgba(fogColor, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  // Fine grain noise for digital texture (top layer gets most)
  const grainCount = [200, 100, 40][layerIndex] ?? 60;
  for (let i = 0; i < grainCount; i++) {
    const gx = Math.random() * w;
    const gy = Math.random() * h;
    const gs = 1 + Math.random() * 2;
    const ga = (0.03 + Math.random() * 0.08) * baseAlpha;
    ctx.fillStyle = rgba([80, 75, 95], ga);
    ctx.fillRect(gx, gy, gs, gs);
  }
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function CryptographicAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange, onResolve };
  }, [onHaptic, onStateChange, onResolve]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef<{
    fogLayers: (HTMLCanvasElement | null)[];
    maskLayers: (HTMLCanvasElement | null)[];
    layerCleared: number[];
    layerDissolved: boolean[];
    totalLayersCleared: number;
    sparkles: Sparkle[];
    geoRotation: number;
    pointerDown: boolean;
    prevPointerX: number;
    prevPointerY: number;
    entranceProgress: number;
    frameCount: number;
    primaryRgb: RGB;
    accentRgb: RGB;
    initialized: boolean;
    allRevealed: boolean;
    revealGlow: number;
    compositeCanvases: HTMLCanvasElement[];
  }>({
    fogLayers: [],
    maskLayers: [],
    layerCleared: [0, 0, 0],
    layerDissolved: [false, false, false],
    totalLayersCleared: 0,
    sparkles: [],
    geoRotation: 0,
    pointerDown: false,
    prevPointerX: -1,
    prevPointerY: -1,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
    allRevealed: false,
    revealGlow: 0,
    compositeCanvases: [],
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Init fog layers (inline) ────────────────────────
    const s = stateRef.current;
    if (!s.initialized) {
      s.fogLayers = [];
      s.maskLayers = [];
      for (let i = 0; i < LAYER_COUNT; i++) {
        const fog = document.createElement('canvas');
        fog.width = w;
        fog.height = h;
        generateFogTexture(fog, w, h, i, FOG_COLORS[i]);
        s.fogLayers.push(fog);

        const mask = document.createElement('canvas');
        mask.width = w;
        mask.height = h;
        const mctx = mask.getContext('2d');
        if (mctx) {
          mctx.fillStyle = MASK_WHITE;
          mctx.fillRect(0, 0, w, h);
        }
        s.maskLayers.push(mask);
      }
      s.layerCleared = [0, 0, 0];
      s.layerDissolved = [false, false, false];
      s.totalLayersCleared = 0;
      s.allRevealed = false;
      s.initialized = true;
      s.compositeCanvases = [];
      for (let i = 0; i < LAYER_COUNT; i++) {
        const comp = document.createElement('canvas');
        comp.width = w;
        comp.height = h;
        s.compositeCanvases.push(comp);
      }
    }

    // ── Wipe helper (inline) ────────────────────────────
    const wipeAt = (x: number, y: number, radius: number) => {
      let activeLayer = -1;
      for (let i = 0; i < LAYER_COUNT; i++) {
        if (!s.layerDissolved[i]) { activeLayer = i; break; }
      }
      if (activeLayer === -1) return;

      const mask = s.maskLayers[activeLayer];
      if (!mask) return;
      const mctx = mask.getContext('2d');
      if (!mctx) return;

      mctx.globalCompositeOperation = 'destination-out';
      const grad = mctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      mctx.fillStyle = grad;
      mctx.beginPath();
      mctx.arc(x, y, radius, 0, Math.PI * 2);
      mctx.fill();
      mctx.globalCompositeOperation = 'source-over';

      const totalPixels = mask.width * mask.height;
      const wipedPixels = Math.PI * radius * radius * 0.7;
      s.layerCleared[activeLayer] += wipedPixels / totalPixels;

      if (s.layerCleared[activeLayer] >= DISSOLVE_THRESHOLD && !s.layerDissolved[activeLayer]) {
        s.layerDissolved[activeLayer] = true;
        s.totalLayersCleared++;
        callbacksRef.current.onHaptic('step_advance');
        mctx.clearRect(0, 0, mask.width, mask.height);
        if (s.totalLayersCleared === LAYER_COUNT && !s.allRevealed) {
          s.allRevealed = true;
          callbacksRef.current.onHaptic('completion');
          callbacksRef.current.onResolve?.();
        }
      }

      if (!propsRef.current.reducedMotion) {
        const sparkleCount = Math.min(3, MAX_SPARKLES - s.sparkles.length);
        for (let i = 0; i < sparkleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = radius * (0.6 + Math.random() * 0.4);
          s.sparkles.push({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * (0.5 + Math.random()),
            vy: Math.sin(angle) * (0.5 + Math.random()),
            life: 1,
            maxLife: 30 + Math.random() * 30,
            size: 0.8 + Math.random() * 1.5,
            brightness: 0.5 + Math.random() * 0.5,
          });
        }
      }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.pointerDown = true;
      s.prevPointerX = px;
      s.prevPointerY = py;
      wipeAt(px, py, BRUSH_BASE_RADIUS);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!s.pointerDown) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      const dx = px - s.prevPointerX;
      const dy = py - s.prevPointerY;
      const vel = Math.sqrt(dx * dx + dy * dy);
      const brushScale = Math.min(BRUSH_MAX_SCALE, 1 + vel * BRUSH_VEL_SCALE * 0.05);

      const steps = Math.max(1, Math.floor(vel / 8));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const ix = s.prevPointerX + dx * t;
        const iy = s.prevPointerY + dy * t;
        wipeAt(ix, iy, BRUSH_BASE_RADIUS * brushScale);
      }

      s.prevPointerX = px;
      s.prevPointerY = py;
    };
    const onUp = (e: PointerEvent) => {
      s.pointerDown = false;
      callbacksRef.current.onHaptic('swipe_commit');
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = advanceEntrance(s.entranceProgress);

      // ── Geometry rotation ─────────────────────────────
      if (!p.reducedMotion) {
        s.geoRotation += GEO_ROTATE_SPEED;
      }

      // ── State ─────────────────────────────────────────
      const progress = s.totalLayersCleared / LAYER_COUNT;
      cb.onStateChange?.(progress);

      if (s.allRevealed) {
        s.revealGlow = Math.min(1, s.revealGlow + 0.01);
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const cx = w / 2;
      const cy = h / 2;

      // ── Background ────────────────────────────────────
      // Deep dark base — the void behind the fog
      const bgBase = lerpColor([8, 6, 14], s.primaryRgb, 0.08);
      ctx.fillStyle = rgba(bgBase, entrance * 0.03);
      ctx.fillRect(0, 0, w, h);

      // Subtle radial warmth at center — hint that something lives beneath
      const bgGlowR = minDim * 0.5;
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, bgGlowR);
      bgGlow.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.2), 0.06 * entrance));
      bgGlow.addColorStop(0.6, rgba(s.primaryRgb, 0.02 * entrance));
      bgGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // ── Sacred Geometry (truth beneath) ───────────────
      // Starts dim, revealed through wiping. Always there — the user discovers it.
      const geoAlpha = (0.25 + progress * 0.55 + s.revealGlow * 0.2) * entrance;
      const breathPulse = 1 + p.breathAmplitude * 0.05;

      ctx.save();
      ctx.translate(cx, cy);
      if (!p.reducedMotion) ctx.rotate(s.geoRotation);

      // Mandala: concentric rings of petal curves
      for (let ring = 0; ring < MANDALA_RINGS; ring++) {
        const ringR = (minDim * 0.08 + ring * minDim * 0.07) * breathPulse;
        const ringAlpha = geoAlpha * (0.3 + ring * 0.15);
        const ringColor = lerpColor(s.primaryRgb, s.accentRgb, ring / MANDALA_RINGS);

        ctx.strokeStyle = rgba(ringColor, ringAlpha);
        ctx.lineWidth = minDim * (0.0012 + (MANDALA_RINGS - ring) * 0.0004);

        for (let petal = 0; petal < MANDALA_PETALS; petal++) {
          const baseAngle = (petal / MANDALA_PETALS) * Math.PI * 2;
          const petalSpread = (Math.PI / MANDALA_PETALS) * 0.7;

          ctx.beginPath();
          ctx.moveTo(0, 0);

          // Quadratic bezier petal
          const cpDist = ringR * 0.9;
          const cpAngle = baseAngle;
          const endAngle1 = baseAngle - petalSpread;
          const endAngle2 = baseAngle + petalSpread;

          const cpx = Math.cos(cpAngle) * cpDist;
          const cpy = Math.sin(cpAngle) * cpDist;

          ctx.quadraticCurveTo(
            cpx, cpy,
            Math.cos(endAngle1) * ringR, Math.sin(endAngle1) * ringR,
          );

          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            cpx, cpy,
            Math.cos(endAngle2) * ringR, Math.sin(endAngle2) * ringR,
          );

          ctx.stroke();
        }

        // Ring circle
        ctx.beginPath();
        ctx.arc(0, 0, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ringAlpha * 0.5);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();
      }

      // Central glow
      const coreR = minDim * 0.06 * breathPulse;
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
      coreGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [255, 255, 255], 0.3), geoAlpha * 0.5));
      coreGrad.addColorStop(0.5, rgba(s.primaryRgb, geoAlpha * 0.2));
      coreGrad.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGrad;
      ctx.fillRect(-coreR, -coreR, coreR * 2, coreR * 2);

      ctx.restore();

      // ── Outer radial glow on reveal ──────────────────
      if (s.revealGlow > 0) {
        const glowR = minDim * 0.45;
        const rGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        rGrad.addColorStop(0, rgba(s.accentRgb, s.revealGlow * 0.12 * entrance));
        rGrad.addColorStop(0.5, rgba(s.primaryRgb, s.revealGlow * 0.04 * entrance));
        rGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rGrad;
        ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);
      }

      // ── Fog layers (top-down: layer 0 is topmost) ─────
      for (let i = LAYER_COUNT - 1; i >= 0; i--) {
        if (s.layerDissolved[i]) continue;

        const fog = s.fogLayers[i];
        const mask = s.maskLayers[i];
        if (!fog || !mask) continue;

        // Create temporary composite
        const tempCanvas = s.compositeCanvases[i];
        const tctx = tempCanvas.getContext('2d');
        if (!tctx) continue;

        // Clear and draw fog
        tctx.clearRect(0, 0, w, h);
        tctx.globalCompositeOperation = 'source-over';
        tctx.drawImage(fog, 0, 0);

        // Apply mask (only show where mask is white)
        tctx.globalCompositeOperation = 'destination-in';
        tctx.drawImage(mask, 0, 0);

        // Draw composite onto main canvas
        ctx.globalAlpha = entrance;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalAlpha = 1;
      }

      // ── Sparkle particles ─────────────────────────────
      if (!p.reducedMotion) {
        for (let i = s.sparkles.length - 1; i >= 0; i--) {
          const sp = s.sparkles[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.96;
          sp.vy *= 0.96;
          sp.life -= 1 / sp.maxLife;

          if (sp.life <= 0) {
            s.sparkles.splice(i, 1);
            continue;
          }

          const spAlpha = sp.life * sp.brightness * entrance;
          const spColor = lerpColor(s.accentRgb, [255, 255, 255], 0.4);

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
          ctx.fillStyle = rgba(spColor, spAlpha);
          ctx.fill();

          // Tiny glow
          if (sp.size > 1) {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size * 3 * sp.life, 0, Math.PI * 2);
            ctx.fillStyle = rgba(spColor, spAlpha * 0.15);
            ctx.fill();
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}