/**
 * ATOM 007: THE SYMBIOTIC ENGINE
 * ================================
 * Series 1 — Physics Engines · Position 7
 *
 * The ego operates in isolation; the Sovereign Mind operates
 * in connection. A luminous tapestry torn in two — the user
 * taps glowing anchor points to weave golden threads across
 * the dark divide. Each connection pulls the halves closer
 * until they merge and the seam blazes gold.
 *
 * PHYSICS:
 *   - Two fabric halves separated by a central void
 *   - Anchor points on each side for thread attachment
 *   - Tap any anchor → thread animates across to nearest match
 *   - Elastic bezier threads with gravity sag + spring tension
 *   - Breath modulates thread tension (inhale = taut, exhale = sway)
 *   - As threads connect, the gap narrows (halves pull together)
 *   - Completion: all threads woven, halves merge, seam glows
 *
 * INTERACTION:
 *   Tap (unconnected anchor) → thread flies across to match
 *   Breath (passive)         → modulates thread sway and tension
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No thread sway, no fabric drift, instant connection
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, easeInOutCubic, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of anchor points per side */
const ANCHORS_PER_SIDE = 7;
/** Gap between halves as fraction of viewport width */
const GAP_FRACTION = 0.22;
/** Minimum gap when all threads connected */
const MIN_GAP_FRACTION = 0.02;
/** Anchor radius as fraction of minDim */
const ANCHOR_RADIUS_FRAC = 0.015;
/** Anchor hit target radius as fraction of minDim */
const ANCHOR_HIT_FRAC = 0.08;
/** Thread gravity sag as fraction of minDim */
const THREAD_SAG_FRAC = 0.065;
/** Thread spring stiffness for vibration */
const THREAD_SPRING = 0.06;
/** Thread vibration dampening */
const THREAD_DAMP = 0.92;
/** Fabric vertical margin fraction */
const FABRIC_MARGIN = 0.12;
/** Number of fabric texture lines per side */
const FABRIC_LINES = 24;
/** Thread glow radius as fraction of minDim */
const THREAD_GLOW_FRAC = 0.006;
/** Frames for thread fly-across animation */
const FLY_DURATION = 45;

// =====================================================================
// DATA TYPES
// =====================================================================

interface Anchor {
  /** Side: 0 = left, 1 = right */
  side: 0 | 1;
  /** Index within side */
  index: number;
  /** X position (recalculated each frame based on gap) */
  baseX: number;
  /** Y position */
  y: number;
  /** Whether this anchor is connected */
  connected: boolean;
  /** Pulse phase */
  pulse: number;
}

interface Thread {
  /** Left anchor index */
  leftAnchor: number;
  /** Right anchor index */
  rightAnchor: number;
  /** Connection progress (0 = just connected, 1 = fully settled) */
  settleProgress: number;
  /** Vibration offset (spring physics) */
  vibration: number;
  /** Vibration velocity */
  vibVel: number;
  /** Individual hue shift */
  hueShift: number;
}

interface FlyingThread {
  /** Left anchor index */
  leftAnchor: number;
  /** Right anchor index */
  rightAnchor: number;
  /** Which side initiated (thread flies FROM this side) */
  sourceSide: 0 | 1;
  /** Animation progress 0→1 */
  progress: number;
  /** Hue shift */
  hueShift: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const VOID_DARK: RGB = [6, 5, 10];
const FABRIC_BASE: RGB = [25, 22, 32];
const THREAD_GOLD: RGB = [220, 190, 120];
const SEAM_GLOW: RGB = [255, 220, 140];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SymbioticAtom({
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
    leftAnchors: Anchor[];
    rightAnchors: Anchor[];
    threads: Thread[];
    flyingThreads: FlyingThread[];
    gapFraction: number;
    entranceProgress: number;
    frameCount: number;
    primaryRgb: RGB;
    accentRgb: RGB;
    initialized: boolean;
    allConnected: boolean;
    seamGlow: number;
    fabricLineSeeds: number[];
    /** Tracks recently-tapped anchor for visual flash feedback */
    tapFlash: { side: 0 | 1; index: number; life: number } | null;
  }>({
    leftAnchors: [],
    rightAnchors: [],
    threads: [],
    flyingThreads: [],
    gapFraction: GAP_FRACTION,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
    allConnected: false,
    seamGlow: 0,
    fabricLineSeeds: [],
    tapFlash: null,
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
    const s = stateRef.current;

    // ── Init anchors (inline) ───────────────────────────
    if (!s.initialized) {
      const marginY = h * FABRIC_MARGIN;
      const usableH = h - marginY * 2;
      const spacing = usableH / (ANCHORS_PER_SIDE + 1);
      const left: Anchor[] = [];
      const right: Anchor[] = [];
      for (let i = 0; i < ANCHORS_PER_SIDE; i++) {
        const y = marginY + spacing * (i + 1);
        left.push({ side: 0, index: i, baseX: 0, y, connected: false, pulse: Math.random() * Math.PI * 2 });
        right.push({ side: 1, index: i, baseX: 0, y, connected: false, pulse: Math.random() * Math.PI * 2 });
      }
      s.leftAnchors = left;
      s.rightAnchors = right;
      s.fabricLineSeeds = Array.from({ length: FABRIC_LINES * 2 }, () => Math.random());
      s.initialized = true;
    }

    // ── Helpers (inline) ────────────────────────────────
    const getAnchorX = (side: 0 | 1, vw: number, gapFrac: number) => {
      const gapW = vw * gapFrac;
      const gapLeft = (vw - gapW) / 2;
      return side === 0 ? gapLeft : gapLeft + gapW;
    };

    const connectAnchor = (sourceSide: 0 | 1, sourceIndex: number) => {
      const targetAnchors = sourceSide === 0 ? s.rightAnchors : s.leftAnchors;
      const sourceAnchor = (sourceSide === 0 ? s.leftAnchors : s.rightAnchors)[sourceIndex];
      const targetAnchor = targetAnchors[sourceIndex];
      if (!targetAnchor || targetAnchor.connected) return;
      sourceAnchor.connected = true;
      targetAnchor.connected = true;
      const leftIdx = sourceIndex;
      const rightIdx = sourceIndex;
      if (propsRef.current.reducedMotion) {
        s.threads.push({
          leftAnchor: leftIdx, rightAnchor: rightIdx,
          settleProgress: 0, vibration: 12 + Math.random() * 8,
          vibVel: 0, hueShift: Math.random() * 0.3,
        });
        finalizeConnection(s);
        callbacksRef.current.onHaptic('step_advance');
        if (s.allConnected) {
          callbacksRef.current.onHaptic('completion');
          callbacksRef.current.onResolve?.();
        }
      } else {
        s.flyingThreads.push({
          leftAnchor: leftIdx, rightAnchor: rightIdx,
          sourceSide, progress: 0, hueShift: Math.random() * 0.3,
        });
      }
      s.tapFlash = { side: sourceSide, index: sourceIndex, life: 1 };
      callbacksRef.current.onHaptic('drag_snap');
    };

    // ── Native pointer handler ──────────────────────────
    const onUp = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (s.allConnected) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      const allAnchors = [
        ...s.leftAnchors.map(a => ({ ...a, ax: getAnchorX(0, w, s.gapFraction) })),
        ...s.rightAnchors.map(a => ({ ...a, ax: getAnchorX(1, w, s.gapFraction) })),
      ];

      const hitR = ANCHOR_HIT_FRAC * minDim;
      let bestDist = hitR * hitR;
      let bestAnchor: (typeof allAnchors)[0] | null = null;

      for (const a of allAnchors) {
        if (a.connected) continue;
        const dx = px - a.ax;
        const dy = py - a.y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestAnchor = a;
        }
      }

      if (bestAnchor) {
        connectAnchor(bestAnchor.side, bestAnchor.index);
      }
    };

    canvas.addEventListener('pointerup', onUp);

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
      const entrance = easeOutExpo(s.entranceProgress);

      // ── State ─────────────────────────────────────────
      const totalConnected = s.threads.length + s.flyingThreads.length;
      const progress = totalConnected / ANCHORS_PER_SIDE;
      cb.onStateChange?.(progress);

      if (s.allConnected) {
        s.seamGlow = Math.min(1, s.seamGlow + 0.008);
      }

      // ── Positions ─────────────────────────────────────
      const leftX = getAnchorX(0, w, s.gapFraction);
      const rightX = getAnchorX(1, w, s.gapFraction);
      const gapCenter = (leftX + rightX) / 2;

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([8, 6, 14], s.primaryRgb, 0.06);
      ctx.fillStyle = rgba(bgBase, entrance * 0.03);
      ctx.fillRect(0, 0, w, h);

      // ── The Void (gap between halves) ─────────────────
      const voidGrad = ctx.createLinearGradient(leftX - 20, 0, rightX + 20, 0);
      voidGrad.addColorStop(0, rgba(VOID_DARK, 0));
      voidGrad.addColorStop(0.15, rgba(VOID_DARK, 0.12 * entrance));
      voidGrad.addColorStop(0.5, rgba([2, 1, 5], 0.18 * entrance));
      voidGrad.addColorStop(0.85, rgba(VOID_DARK, 0.12 * entrance));
      voidGrad.addColorStop(1, rgba(VOID_DARK, 0));
      ctx.fillStyle = voidGrad;
      ctx.fillRect(leftX - 20, 0, rightX - leftX + 40, h);

      // ── Fabric halves ─────────────────────────────────
      drawFabric(ctx, 0, 0, leftX, h, s, p, entrance, 'left', minDim);
      drawFabric(ctx, rightX, 0, w - rightX, h, s, p, entrance, 'right', minDim);

      // ── Fabric torn edge ──────────────────────────────
      drawTornEdge(ctx, leftX, h, s, entrance, 'left', minDim);
      drawTornEdge(ctx, rightX, h, s, entrance, 'right', minDim);

      // ── Connected threads ─────────────────────────────
      for (const thread of s.threads) {
        const la = s.leftAnchors[thread.leftAnchor];
        const ra = s.rightAnchors[thread.rightAnchor];
        const lx = leftX;
        const rx = rightX;

        // Settle animation
        if (thread.settleProgress < 1) {
          thread.settleProgress = Math.min(1, thread.settleProgress + 0.015);
        }

        // Spring vibration physics
        if (!p.reducedMotion) {
          thread.vibVel += -thread.vibration * THREAD_SPRING;
          thread.vibVel *= THREAD_DAMP;
          thread.vibration += thread.vibVel;
        } else {
          thread.vibration = 0;
        }

        // Breath modulates sag
        const breathSag = THREAD_SAG_FRAC * Math.min(w, h) * (1 - p.breathAmplitude * 0.5);
        const sag = breathSag + thread.vibration;

        // Draw thread as quadratic bezier
        const midX = (lx + rx) / 2;
        const midY = (la.y + ra.y) / 2 + sag;

        const threadColor = lerpColor(
          THREAD_GOLD,
          lerpColor(s.primaryRgb, s.accentRgb, thread.hueShift),
          0.3,
        );
        const threadAlpha = (0.4 + thread.settleProgress * 0.5) * entrance;

        // Glow layer
        ctx.beginPath();
        ctx.moveTo(lx, la.y);
        ctx.quadraticCurveTo(midX, midY, rx, ra.y);
        ctx.strokeStyle = rgba(threadColor, threadAlpha * 0.2);
        ctx.lineWidth = THREAD_GLOW_FRAC * Math.min(w, h) * 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Main thread
        ctx.beginPath();
        ctx.moveTo(lx, la.y);
        ctx.quadraticCurveTo(midX, midY, rx, ra.y);
        ctx.strokeStyle = rgba(threadColor, threadAlpha);
        ctx.lineWidth = minDim * (0.0024 + thread.settleProgress * 0.001);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bright core
        ctx.beginPath();
        ctx.moveTo(lx, la.y);
        ctx.quadraticCurveTo(midX, midY, rx, ra.y);
        ctx.strokeStyle = rgba(
          lerpColor(threadColor, [255, 255, 255], 0.3),
          threadAlpha * 0.6,
        );
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }

      // ── Flying threads (animating across the void) ────
      for (let fi = s.flyingThreads.length - 1; fi >= 0; fi--) {
        const ft = s.flyingThreads[fi];
        ft.progress += 1 / FLY_DURATION;

        if (ft.progress >= 1) {
          // Animation complete — promote to settled thread
          s.flyingThreads.splice(fi, 1);
          s.threads.push({
            leftAnchor: ft.leftAnchor,
            rightAnchor: ft.rightAnchor,
            settleProgress: 0,
            vibration: 12 + Math.random() * 8,
            vibVel: 0,
            hueShift: ft.hueShift,
          });
          finalizeConnection(s);
          cb.onHaptic('step_advance');
          // Fire completion when all threads are connected
          if (s.allConnected) {
            cb.onHaptic('completion');
            cb.onResolve?.();
          }
          continue;
        }

        // Draw partial bezier — thread grows from source to target
        const la = s.leftAnchors[ft.leftAnchor];
        const ra = s.rightAnchors[ft.rightAnchor];
        const lx = leftX;
        const rx = rightX;

        const t = easeInOutCubic(ft.progress);

        // Source and target positions
        const srcX = ft.sourceSide === 0 ? lx : rx;
        const srcY = ft.sourceSide === 0 ? la.y : ra.y;
        const tgtX = ft.sourceSide === 0 ? rx : lx;
        const tgtY = ft.sourceSide === 0 ? ra.y : la.y;

        // Current endpoint of the growing thread
        const curX = srcX + (tgtX - srcX) * t;
        const curY = srcY + (tgtY - srcY) * t;
        const midX = (srcX + curX) / 2;
        const midY = (srcY + curY) / 2 + THREAD_SAG_FRAC * Math.min(w, h) * 0.5 * t;

        const flyColor = lerpColor(
          THREAD_GOLD,
          lerpColor(s.primaryRgb, s.accentRgb, ft.hueShift),
          0.3,
        );
        const flyAlpha = 0.7 * entrance;

        // Glow
        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.quadraticCurveTo(midX, midY, curX, curY);
        ctx.strokeStyle = rgba(flyColor, flyAlpha * 0.25);
        ctx.lineWidth = THREAD_GLOW_FRAC * Math.min(w, h) * 5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Main
        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.quadraticCurveTo(midX, midY, curX, curY);
        ctx.strokeStyle = rgba(flyColor, flyAlpha);
        ctx.lineWidth = minDim * 0.003;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Bright tip
        const tipR = 4 + 2 * Math.sin(s.frameCount * 0.15);
        const tipGrad = ctx.createRadialGradient(curX, curY, 0, curX, curY, tipR);
        tipGrad.addColorStop(0, rgba([255, 240, 200], flyAlpha * 0.8));
        tipGrad.addColorStop(0.5, rgba(THREAD_GOLD, flyAlpha * 0.3));
        tipGrad.addColorStop(1, rgba(THREAD_GOLD, 0));
        ctx.fillStyle = tipGrad;
        ctx.fillRect(curX - tipR, curY - tipR, tipR * 2, tipR * 2);
      }

      // ── Anchor points ─────────────────────────────────
      const allAnchors = [
        ...s.leftAnchors.map(a => ({ ...a, ax: leftX })),
        ...s.rightAnchors.map(a => ({ ...a, ax: rightX })),
      ];

      // Tap flash decay
      if (s.tapFlash) {
        s.tapFlash.life -= 0.04;
        if (s.tapFlash.life <= 0) s.tapFlash = null;
      }

      for (const a of allAnchors) {
        if (!p.reducedMotion) a.pulse += 0.04;
        const pulseScale = a.connected ? 1 : (0.8 + 0.2 * Math.sin(a.pulse));
        const r = ANCHOR_RADIUS_FRAC * Math.min(w, h) * pulseScale;

        // Flash feedback on recently tapped anchor
        const isFlashed = s.tapFlash && s.tapFlash.side === a.side && s.tapFlash.index === a.index;

        const anchorColor = a.connected
          ? lerpColor(THREAD_GOLD, s.accentRgb, 0.3)
          : lerpColor(s.primaryRgb, [200, 195, 210], 0.4);
        const anchorAlpha = (a.connected ? 0.75 : 0.6) * entrance;

        // Flash burst
        if (isFlashed && s.tapFlash) {
          const flashR = r * (3 + (1 - s.tapFlash.life) * 6);
          const flashGrad = ctx.createRadialGradient(a.ax, a.y, 0, a.ax, a.y, flashR);
          flashGrad.addColorStop(0, rgba(THREAD_GOLD, s.tapFlash.life * 0.4 * entrance));
          flashGrad.addColorStop(0.4, rgba(THREAD_GOLD, s.tapFlash.life * 0.15 * entrance));
          flashGrad.addColorStop(1, rgba(THREAD_GOLD, 0));
          ctx.fillStyle = flashGrad;
          ctx.fillRect(a.ax - flashR, a.y - flashR, flashR * 2, flashR * 2);
        }

        // Outer glow (larger for unconnected to show interactivity)
        const glowR = a.connected ? r * 3 : r * 4;
        const aGrad = ctx.createRadialGradient(a.ax, a.y, 0, a.ax, a.y, glowR);
        aGrad.addColorStop(0, rgba(anchorColor, anchorAlpha * 0.5));
        aGrad.addColorStop(0.4, rgba(anchorColor, anchorAlpha * 0.15));
        aGrad.addColorStop(1, rgba(anchorColor, 0));
        ctx.fillStyle = aGrad;
        ctx.fillRect(a.ax - glowR, a.y - glowR, glowR * 2, glowR * 2);

        // Dot
        ctx.beginPath();
        ctx.arc(a.ax, a.y, r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(anchorColor, anchorAlpha);
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(a.ax, a.y, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 255, 255], anchorAlpha * 0.6);
        ctx.fill();

        // Pulsing ring on unconnected anchors (affordance: "tap me")
        if (!a.connected) {
          const ringPulse = 0.18 + 0.12 * Math.sin(a.pulse * 0.7);
          ctx.beginPath();
          ctx.arc(a.ax, a.y, r * 2.0, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(anchorColor, ringPulse * entrance);
          ctx.lineWidth = minDim * 0.0016;
          ctx.stroke();

          // Faint connecting hint: thin dashed line from this anchor toward center
          const hintLen = 12;
          const hintDir = a.side === 0 ? 1 : -1;
          const hintAlpha = (0.06 + 0.04 * Math.sin(a.pulse * 0.5)) * entrance;
          ctx.beginPath();
          ctx.moveTo(a.ax, a.y);
          ctx.lineTo(a.ax + hintLen * hintDir, a.y);
          ctx.strokeStyle = rgba(THREAD_GOLD, hintAlpha);
          ctx.lineWidth = minDim * 0.001;
          ctx.setLineDash([minDim * 0.004, minDim * 0.006]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── Seam glow (completion) ────────────────────────
      if (s.seamGlow > 0) {
        const seamX = gapCenter;
        const seamW = 6 + s.seamGlow * 4;
        const seamAlpha = s.seamGlow * 0.25 * entrance;
        const seamPulse = p.reducedMotion ? 1 : (0.85 + 0.15 * Math.sin(s.frameCount * 0.025));

        const seamGrad = ctx.createLinearGradient(seamX - seamW, 0, seamX + seamW, 0);
        seamGrad.addColorStop(0, rgba(SEAM_GLOW, 0));
        seamGrad.addColorStop(0.3, rgba(SEAM_GLOW, seamAlpha * seamPulse * 0.3));
        seamGrad.addColorStop(0.5, rgba(SEAM_GLOW, seamAlpha * seamPulse));
        seamGrad.addColorStop(0.7, rgba(SEAM_GLOW, seamAlpha * seamPulse * 0.3));
        seamGrad.addColorStop(1, rgba(SEAM_GLOW, 0));
        ctx.fillStyle = seamGrad;
        ctx.fillRect(seamX - seamW, 0, seamW * 2, h);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerup', onUp);
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

// =====================================================================
// HELPER: Finalize connection after thread lands
// =====================================================================

function finalizeConnection(s: {
  threads: Thread[];
  flyingThreads: FlyingThread[];
  gapFraction: number;
  allConnected: boolean;
}) {
  const connected = s.threads.length;
  const total = ANCHORS_PER_SIDE;
  const progress = connected / total;
  s.gapFraction = GAP_FRACTION - (GAP_FRACTION - MIN_GAP_FRACTION) * progress;

  if (connected === total && !s.allConnected) {
    s.allConnected = true;
  }
}

// =====================================================================
// DRAW HELPERS
// =====================================================================

function drawFabric(
  ctx: CanvasRenderingContext2D,
  x: number, _y: number,
  w: number, h: number,
  s: { primaryRgb: RGB; fabricLineSeeds: number[] },
  _p: { breathAmplitude: number; reducedMotion: boolean },
  entrance: number,
  side: 'left' | 'right',
  minDim: number,
) {
  const fabricColor = lerpColor(FABRIC_BASE, s.primaryRgb, 0.1);
  const fabricGrad = ctx.createLinearGradient(x, 0, x + w, 0);
  const edgeAlpha = 0.08 * entrance;
  const innerAlpha = 0.04 * entrance;

  if (side === 'left') {
    fabricGrad.addColorStop(0, rgba(fabricColor, innerAlpha));
    fabricGrad.addColorStop(0.7, rgba(fabricColor, edgeAlpha));
    fabricGrad.addColorStop(1, rgba(lerpColor(fabricColor, [40, 35, 50], 0.3), edgeAlpha));
  } else {
    fabricGrad.addColorStop(0, rgba(lerpColor(fabricColor, [40, 35, 50], 0.3), edgeAlpha));
    fabricGrad.addColorStop(0.3, rgba(fabricColor, edgeAlpha));
    fabricGrad.addColorStop(1, rgba(fabricColor, innerAlpha));
  }

  ctx.fillStyle = fabricGrad;
  ctx.fillRect(x, 0, w, h);

  // Horizontal texture lines (woven fabric feel)
  const lineOffset = side === 'left' ? 0 : FABRIC_LINES;
  for (let i = 0; i < FABRIC_LINES; i++) {
    const seed = s.fabricLineSeeds[i + lineOffset] ?? 0.5;
    const ly = (h / (FABRIC_LINES + 1)) * (i + 1);
    const lineAlpha = (0.03 + seed * 0.04) * entrance;

    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + w, ly);
    ctx.strokeStyle = rgba(
      lerpColor(fabricColor, [100, 90, 110], 0.3),
      lineAlpha,
    );
    ctx.lineWidth = minDim * (0.001 + seed * 0.002);
    ctx.stroke();
  }
}

function drawTornEdge(
  ctx: CanvasRenderingContext2D,
  edgeX: number,
  h: number,
  s: { primaryRgb: RGB },
  entrance: number,
  side: 'left' | 'right',
  minDim: number,
) {
  const segments = 40;
  const jaggedness = 8;

  ctx.beginPath();
  ctx.moveTo(edgeX, 0);

  for (let i = 0; i <= segments; i++) {
    const y = (i / segments) * h;
    const noise = Math.sin(i * 2.7 + 0.5) * jaggedness +
                  Math.sin(i * 5.3 + 1.2) * jaggedness * 0.4;
    const jx = edgeX + (side === 'left' ? noise : -noise);
    ctx.lineTo(jx, y);
  }

  ctx.lineTo(edgeX, h);
  ctx.closePath();

  const edgeGrad = ctx.createLinearGradient(edgeX - 10, 0, edgeX + 10, 0);
  const edgeColor = lerpColor(FABRIC_BASE, s.primaryRgb, 0.15);
  if (side === 'left') {
    edgeGrad.addColorStop(0, rgba(edgeColor, 0.3 * entrance));
    edgeGrad.addColorStop(1, rgba(edgeColor, 0));
  } else {
    edgeGrad.addColorStop(0, rgba(edgeColor, 0));
    edgeGrad.addColorStop(1, rgba(edgeColor, 0.3 * entrance));
  }
  ctx.fillStyle = edgeGrad;
  ctx.fill();

  // Fraying thread stubs
  for (let i = 0; i < 12; i++) {
    const fy = (h / 13) * (i + 1) + Math.sin(i * 3.1) * 10;
    const fLen = 4 + Math.sin(i * 7.2) * 6;
    const dir = side === 'left' ? 1 : -1;

    ctx.beginPath();
    ctx.moveTo(edgeX, fy);
    ctx.lineTo(edgeX + fLen * dir, fy + Math.sin(i * 2.1) * 3);
    ctx.strokeStyle = rgba(
      lerpColor(s.primaryRgb, [150, 140, 160], 0.4),
      0.15 * entrance,
    );
    ctx.lineWidth = minDim * 0.001;
    ctx.stroke();
  }
}