/**
 * ATOM 032: THE SEMANTIC ERASURE ENGINE (Un-Naming)
 * ==================================================
 * Series 4 — Via Negativa · Position 2
 *
 * Language is a filter that distorts reality. We judge an
 * emotion by the label we slap on it ("Anxiety," "Failure").
 * This atom lets the user physically scrub away the label
 * to see the raw, neutral energy underneath.
 *
 * A beautiful, raw geometric shape pulses gently beneath —
 * warm, alive, neutral, blameless. But it's obscured by
 * heavy, harsh text labels: "ANXIETY", "FAILURE", "BROKEN",
 * "WEAK", "WRONG". The user rubs the canvas to erase. The
 * globalCompositeOperation: 'destination-out' scratch-off
 * dissolves the cruel text, revealing the pure reality.
 *
 * ARCHITECTURE:
 *   - Main canvas: renders the beautiful geometric base
 *   - Offscreen canvas (pre-allocated): text mask layer
 *   - User scrub → draws erase circles on offscreen canvas
 *   - Main canvas composites offscreen mask on top
 *   - Track erase % per label region → step_advance per label
 *   - All labels erased → completion
 *
 * HAPTIC JOURNEY:
 *   Scrubbing → swipe_commit (rough scratchy feel)
 *   Each label substantially erased → step_advance
 *   All erased → completion (smooth glass)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static base shape, no pulse, faster erase
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Labels to erase */
const LABELS = ['ANXIETY', 'FAILURE', 'BROKEN', 'WEAK', 'WRONG'];
/** Erase brush radius as fraction of minDim */
const BRUSH_RADIUS_FRAC = 0.04;
/** Erase threshold per label to count as cleared (fraction of label pixels) */
const CLEAR_THRESHOLD = 0.55;
/** How many sample points per label to track erasure */
const SAMPLES_PER_LABEL = 24;
/** Font size as fraction of min dimension */
const LABEL_FONT_FRAC = 0.055;
/** Base shape pulse speed */
const SHAPE_PULSE_SPEED = 0.008;

// =====================================================================
// LABEL LAYOUT
// =====================================================================

interface LabelLayout {
  text: string;
  x: number;  // normalized 0–1
  y: number;  // normalized 0–1
  rotation: number; // radians
  cleared: boolean;
  /** Sample positions (pixel coords, set during init) */
  samples: { x: number; y: number }[];
}

function createLabels(): LabelLayout[] {
  return [
    { text: 'ANXIETY',  x: 0.50, y: 0.22, rotation: -0.05, cleared: false, samples: [] },
    { text: 'FAILURE',  x: 0.48, y: 0.40, rotation:  0.03,  cleared: false, samples: [] },
    { text: 'BROKEN',   x: 0.52, y: 0.56, rotation: -0.02, cleared: false, samples: [] },
    { text: 'WEAK',     x: 0.45, y: 0.70, rotation:  0.04,  cleared: false, samples: [] },
    { text: 'WRONG',    x: 0.55, y: 0.84, rotation: -0.03, cleared: false, samples: [] },
  ];
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const LABEL_TEXT: RGB = [30, 25, 20];           // Harsh, dark, judgmental
const LABEL_BG: RGB = [15, 12, 10];             // Dark surface under labels
const SHAPE_CORE: RGB = [160, 140, 110];        // Raw neutral energy
const SHAPE_GLOW: RGB = [180, 155, 120];        // Warm glow
const SHAPE_OUTER: RGB = [120, 110, 95];        // Outer rings
const REVEALED_LIGHT: RGB = [200, 180, 140];    // Liberation glow

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function UnNamingAtom({
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
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    labels: [] as LabelLayout[],
    clearedCount: 0,
    resolved: false,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    scrubFrames: 0,
    lastHapticFrame: 0,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
    maskNeedsRedraw: true,
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
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const dpr = window.devicePixelRatio || 1;

    // ── Erase helper (inline) ───────────────────────────
    const eraseAt = (px: number, py: number) => {
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (!maskCtx) return;
      const brushR = minDim * BRUSH_RADIUS_FRAC;
      maskCtx.save();
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.beginPath();
      maskCtx.arc(px * dpr, py * dpr, brushR * dpr, 0, Math.PI * 2);
      maskCtx.fill();
      maskCtx.restore();

      s.scrubFrames++;
      if (s.scrubFrames - s.lastHapticFrame > 8) {
        s.lastHapticFrame = s.scrubFrames;
        cbRef.current.onHaptic('swipe_commit');
      }
    };

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isDrawing = true;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.lastX = px;
      s.lastY = py;
      eraseAt(px, py);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!s.isDrawing) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      const dx = px - s.lastX;
      const dy = py - s.lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.ceil(dist / (minDim * BRUSH_RADIUS_FRAC * 0.5)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        eraseAt(s.lastX + dx * t, s.lastY + dy * t);
      }
      s.lastX = px;
      s.lastY = py;
    };
    const onUp = (e: PointerEvent) => {
      s.isDrawing = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    // Initialize labels
    if (!s.initialized) {
      s.labels = createLabels();

      // Generate sample points per label for erasure tracking
      const fontSize = Math.round(minDim * LABEL_FONT_FRAC);
      for (const label of s.labels) {
        const cx = label.x * w;
        const cy = label.y * h;
        const textW = fontSize * label.text.length * 0.65;
        const textH = fontSize;
        for (let i = 0; i < SAMPLES_PER_LABEL; i++) {
          const sx = cx - textW / 2 + Math.random() * textW;
          const sy = cy - textH / 2 + Math.random() * textH;
          label.samples.push({ x: sx, y: sy });
        }
      }
      s.initialized = true;
    }

    // Pre-allocate mask canvas
    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement('canvas');
      s.maskNeedsRedraw = true;
    }
    const maskCanvas = maskCanvasRef.current;
    const mCW = Math.round(w * dpr);
    const mCH = Math.round(h * dpr);
    if (maskCanvas.width !== mCW || maskCanvas.height !== mCH) {
      maskCanvas.width = mCW;
      maskCanvas.height = mCH;
      s.maskNeedsRedraw = true;
    }

    // Draw mask (text labels) — only once, then user erases from it
    if (s.maskNeedsRedraw) {
      const maskCtx = maskCanvas.getContext('2d')!;
      maskCtx.save();
      maskCtx.scale(dpr, dpr);
      maskCtx.clearRect(0, 0, w, h);

      // Dark overlay background
      const maskBg = lerpColor(LABEL_BG, s.primaryRgb, 0.015);
      maskCtx.fillStyle = rgba(maskBg, 0.92);
      maskCtx.fillRect(0, 0, w, h);

      // Text labels — harsh, bold, judgmental
      const fontSize = Math.round(minDim * LABEL_FONT_FRAC);
      const labelColor = lerpColor(LABEL_TEXT, s.primaryRgb, 0.03);
      maskCtx.font = `900 ${fontSize}px -apple-system, "Helvetica Neue", Arial, sans-serif`;
      maskCtx.textAlign = 'center';
      maskCtx.textBaseline = 'middle';

      for (const label of s.labels) {
        maskCtx.save();
        maskCtx.translate(label.x * w, label.y * h);
        maskCtx.rotate(label.rotation);

        // Label background bar
        const textW = fontSize * label.text.length * 0.65;
        maskCtx.fillStyle = rgba(lerpColor([25, 20, 18], s.primaryRgb, 0.02), 0.85);
        maskCtx.fillRect(-textW / 2 - minDim * 0.012, -fontSize * 0.55, textW + minDim * 0.024, fontSize * 1.1);

        // The label text
        maskCtx.fillStyle = rgba(labelColor, 0.7);
        maskCtx.fillText(label.text, 0, 0);

        maskCtx.restore();
      }
      maskCtx.restore();
      s.maskNeedsRedraw = false;
    }

    let animId: number;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;

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
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Check label erasure ───────────────────────────
      // Throttled to every 10 frames (120 getImageData calls is expensive)
      if (s.frameCount % 10 === 0) {
        const maskCtx = maskCanvas.getContext('2d');
        if (maskCtx) {
          for (const label of s.labels) {
            if (label.cleared) continue;
            let erasedSamples = 0;
            for (const sample of label.samples) {
              const px = Math.round(sample.x * dpr);
              const py = Math.round(sample.y * dpr);
              const pixel = maskCtx.getImageData(px, py, 1, 1).data;
              if (pixel[3] < 30) erasedSamples++;
            }
            if (erasedSamples / SAMPLES_PER_LABEL > CLEAR_THRESHOLD) {
              label.cleared = true;
              s.clearedCount++;
              cb.onHaptic('step_advance');

              if (s.clearedCount >= LABELS.length && !s.resolved) {
                s.resolved = true;
                cb.onHaptic('completion');
                cb.onResolve?.();
              }
            }
          }
        }
      }

      cb.onStateChange?.(s.clearedCount / LABELS.length);

      // ══════════════════════════════════════════════════
      // LAYER 1: THE RAW REALITY (beautiful geometric shape)
      // ══════════════════════════════════════════════════

      // Background — warm dark
      const bgBase = lerpColor([8, 7, 6], s.primaryRgb, 0.02);
      const cx = w / 2;
      const cy = h / 2;
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Central shape — organic, warm, blameless
      const shapeR = minDim * 0.18;

      const pulse = p.reducedMotion ? 1 :
        0.95 + 0.05 * Math.sin(s.frameCount * SHAPE_PULSE_SPEED);
      const breathMod = 1 + p.breathAmplitude * 0.04;
      const r = shapeR * pulse * breathMod;

      // Outer rings (concentric, fading)
      for (let ring = 4; ring >= 0; ring--) {
        const ringR = r * (1.6 + ring * 0.25);
        const ringAlpha = 0.008 * (5 - ring) * entrance;
        const ringColor = lerpColor(SHAPE_OUTER, s.primaryRgb, 0.08 + ring * 0.02);

        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ringColor, ringAlpha);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();
      }

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
      const coreColor = lerpColor(SHAPE_GLOW, s.accentRgb, 0.1);
      coreGrad.addColorStop(0, rgba(coreColor, 0.06 * entrance));
      coreGrad.addColorStop(0.3, rgba(coreColor, 0.025 * entrance));
      coreGrad.addColorStop(0.6, rgba(lerpColor(SHAPE_CORE, s.primaryRgb, 0.1), 0.01 * entrance));
      coreGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, w, h);

      // Core body — soft organic form
      ctx.beginPath();
      // 8-point smooth organic shape
      const pts = 8;
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2;
        const wobble = p.reducedMotion ? 0 :
          Math.sin(a * 3 + s.frameCount * 0.005) * r * 0.04;
        const pr = r * (0.9 + 0.1 * Math.sin(a * 2 + 0.5)) + wobble;
        const px = cx + Math.cos(a) * pr;
        const py = cy + Math.sin(a) * pr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      const bodyGrad = ctx.createRadialGradient(
        cx - r * 0.15, cy - r * 0.15, r * 0.1,
        cx, cy, r * 1.1,
      );
      const bodyColor = lerpColor(SHAPE_CORE, s.accentRgb, 0.08);
      bodyGrad.addColorStop(0, rgba(lerpColor(bodyColor, [255, 255, 255], 0.08), 0.12 * entrance));
      bodyGrad.addColorStop(0.4, rgba(bodyColor, 0.08 * entrance));
      bodyGrad.addColorStop(1, rgba(bodyColor, 0.02 * entrance));
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Liberation glow (grows as labels are cleared)
      if (s.clearedCount > 0) {
        const libProgress = s.clearedCount / LABELS.length;
        const libAlpha = libProgress * 0.04 * entrance;
        const libPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.012));
        const libColor = lerpColor(REVEALED_LIGHT, s.accentRgb, 0.12);
        const libR = r * (1.2 + libProgress * 0.8);
        const libGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, libR);
        libGrad.addColorStop(0, rgba(libColor, libAlpha * libPulse));
        libGrad.addColorStop(0.4, rgba(libColor, libAlpha * 0.3 * libPulse));
        libGrad.addColorStop(1, rgba(libColor, 0));
        ctx.fillStyle = libGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // ══════════════════════════════════════════════════
      // LAYER 2: MASK (text labels — user erases this)
      // ══════════════════════════════════════════════════

      ctx.drawImage(maskCanvas, 0, 0, w, h);

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