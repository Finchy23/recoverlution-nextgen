/**
 * ATOM 020: THE HOLOGRAPHIC ENGINE
 * ==================================
 * Series 2 — Quantum Mechanics · Position 10
 *
 * You are not a tiny broken piece. The entire universe is
 * folded perfectly inside you. A cosmic scene fills the
 * viewport — stars, nebulae, geometric constellations. In
 * the center: a tiny crystalline shard. Pinch-zoom into the
 * shard. Inside: THE EXACT SAME UNIVERSE. The same stars.
 * The same shard. Infinite recursion. Seamless loop.
 *
 * The Net of Indra — every fragment contains the whole.
 *
 * PHYSICS:
 *   - Procedural starfield + nebula cloud
 *   - Central crystalline shard (faceted, refractive)
 *   - Pinch-zoom approaches the shard
 *   - At ~8x zoom: seamless crossfade → same scene at 1x
 *   - Each recursion gets a subtle color-shift (harmonic)
 *   - step_advance at each recursion boundary
 *   - Infinite descent — never bottoms out
 *
 * INTERACTION:
 *   Pinch/Zoom   → approach the shard
 *   Observable   → stars drift, shard rotates gently
 *   Scroll/wheel → zoom proxy on desktop
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static stars, no drift, instant recursion
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS (viewport-relative via minDim * factor)
// =====================================================================

/** Number of stars in the field */
const STAR_COUNT = 200;
/** Number of nebula blobs */
const NEBULA_COUNT = 8;
/** Shard radius as fraction of min dimension */
const SHARD_R_FRAC = 0.03;
/** Shard facet count */
const SHARD_FACETS = 7;
/** Zoom level that triggers recursion */
const RECURSION_ZOOM = 8;
/** Crossfade duration (frames) */
const CROSSFADE_FRAMES = 40;
/** Zoom decay (return to 1 when not pinching) */
const ZOOM_DECAY = 0.005;
/** Star drift speed */
const STAR_DRIFT = 0.1;

// =====================================================================
// STARFIELD
// =====================================================================

interface Star {
  x: number;
  y: number;
  /** Size as fraction of minDim */
  sizeFrac: number;
  brightness: number;
  twinklePhase: number;
  twinkleSpeed: number;
  /** Depth layer (0 = near, 1 = far) */
  depth: number;
}

function createStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    sizeFrac: 0.0008 + Math.random() * 0.004,
    brightness: 0.2 + Math.random() * 0.8,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.01 + Math.random() * 0.03,
    depth: Math.random(),
  }));
}

interface NebulaBlob {
  x: number;
  y: number;
  radius: number;
  hueShift: number;
  brightness: number;
  driftPhase: number;
  driftSpeed: number;
}

function createNebulae(): NebulaBlob[] {
  return Array.from({ length: NEBULA_COUNT }, () => ({
    x: 0.15 + Math.random() * 0.7,
    y: 0.15 + Math.random() * 0.7,
    radius: 0.06 + Math.random() * 0.12,
    hueShift: Math.random(),
    brightness: 0.15 + Math.random() * 0.25,
    driftPhase: Math.random() * Math.PI * 2,
    driftSpeed: 0.001 + Math.random() * 0.003,
  }));
}

// =====================================================================
// COLOR
// =====================================================================

const STAR_WHITE: RGB = [220, 230, 255];
const NEBULA_COLORS: RGB[] = [
  [100, 60, 180],
  [60, 80, 200],
  [160, 80, 140],
  [80, 120, 200],
];
const SHARD_CORE: RGB = [200, 210, 255];
const SHARD_EDGE: RGB = [140, 130, 200];
const RECURSION_FLASH: RGB = [180, 175, 240];

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function HolographicAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; },
    [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  // ── Single effect: native events + rAF loop ──────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    // ── Mutable state ──────────────────────────────────
    const s = {
      stars: createStars(),
      nebulae: createNebulae(),
      // Zoom
      currentZoom: 1,
      targetZoom: 1,
      isPinching: false,
      lastPinchDist: 0,
      // Pointer-drag zoom (vertical drag = zoom)
      isDragging: false,
      dragStartY: 0,
      dragBaseZoom: 1,
      // Recursion
      recursionDepth: 0,
      crossfadeProgress: 0,
      isCrossfading: false,
      recursionFlash: 0,
      // Shard rotation
      shardRotation: 0,
      // Entrance
      entranceProgress: 0,
      frameCount: 0,
      primaryRgb: parseColor(color),
      accentRgb: parseColor(accentColor),
      // Touch tracking
      touches: new Map<number, { x: number; y: number }>(),
    };

    // ── Native wheel handler (passive: false) ──────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.005;
      s.targetZoom = Math.max(1, s.targetZoom * (1 + zoomDelta));
    };

    // ── Native touch handlers (pinch zoom) ─────────────
    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        s.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (s.touches.size === 2) {
        const pts = Array.from(s.touches.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        s.lastPinchDist = Math.sqrt(dx * dx + dy * dy);
        s.isPinching = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        s.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (s.isPinching && s.touches.size === 2) {
        const pts = Array.from(s.touches.values());
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ratio = dist / Math.max(1, s.lastPinchDist);
        s.targetZoom = Math.max(1, s.targetZoom * ratio);
        s.lastPinchDist = dist;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        s.touches.delete(e.changedTouches[i].identifier);
      }
      if (s.touches.size < 2) {
        s.isPinching = false;
      }
    };

    // ── Native pointer handlers (click-drag vertical = zoom) ──
    const onPointerDown = (e: PointerEvent) => {
      // Single pointer drag for desktop zoom
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        s.isDragging = true;
        s.dragStartY = e.clientY;
        s.dragBaseZoom = s.targetZoom;
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.isDragging) return;
      const dy = s.dragStartY - e.clientY; // drag up = zoom in
      const zoomFactor = dy / (h * 0.3); // 30% of height = full zoom range
      s.targetZoom = Math.max(1, s.dragBaseZoom * (1 + zoomFactor));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (s.isDragging) {
        s.isDragging = false;
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // ── Animation loop ─────────────────────────────────
    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;

      s.primaryRgb = parseColor(p.color);
      s.accentRgb = parseColor(p.accentColor);

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

      const cx = w / 2;
      const cy = h / 2;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Zoom physics ──────────────────────────────────
      if (!s.isPinching && !s.isDragging) {
        s.targetZoom = Math.max(1, s.targetZoom - ZOOM_DECAY * (s.targetZoom - 1));
      }
      s.currentZoom += (s.targetZoom - s.currentZoom) * 0.06;

      // ── Recursion trigger ─────────────────────────────
      if (s.currentZoom >= RECURSION_ZOOM && !s.isCrossfading) {
        s.isCrossfading = true;
        s.crossfadeProgress = 0;
        s.recursionFlash = 1;
        cb.onHaptic('step_advance');
      }

      if (s.isCrossfading) {
        s.crossfadeProgress += 1 / CROSSFADE_FRAMES;
        if (s.crossfadeProgress >= 1) {
          s.isCrossfading = false;
          s.crossfadeProgress = 0;
          s.recursionDepth++;
          s.currentZoom = 1;
          s.targetZoom = 1;
          s.dragBaseZoom = 1;
          for (const star of s.stars) {
            star.x = (star.x + 0.1) % 1;
            star.y = (star.y + 0.07) % 1;
          }
        }
      }

      if (s.recursionFlash > 0) {
        s.recursionFlash = Math.max(0, s.recursionFlash - 0.03);
      }

      // ── Shard rotation ────────────────────────────────
      if (!p.reducedMotion) {
        s.shardRotation += 0.004;
      }

      // ── State reporting ───────────────────────────────
      const zoomNorm = Math.min(1, (s.currentZoom - 1) / (RECURSION_ZOOM - 1));
      cb.onStateChange?.(zoomNorm);

      // ══════════════════════════════════════════════════
      // RENDER SCENE
      // ══════════════════════════════════════════════════

      const depthHue = s.recursionDepth * 0.15;
      const depthColorShift: RGB = [
        Math.round(Math.sin(depthHue) * 15),
        Math.round(Math.sin(depthHue + 2) * 15),
        Math.round(Math.sin(depthHue + 4) * 15),
      ];

      const renderScene = (alpha: number, zoomLevel: number) => {
        if (alpha < 0.01) return;

        const scale = zoomLevel;

        // ── Deep space background ──────────────────────
        const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
        const bgCore: RGB = [
          Math.max(0, Math.min(255, 6 + depthColorShift[0])),
          Math.max(0, Math.min(255, 4 + depthColorShift[1])),
          Math.max(0, Math.min(255, 16 + depthColorShift[2])),
        ];
        bgGrad.addColorStop(0, rgba(lerpColor(bgCore, s.primaryRgb, 0.03), alpha * entrance * 0.03));
        bgGrad.addColorStop(0.6, rgba(bgCore, alpha * entrance * 0.015));
        bgGrad.addColorStop(1, rgba(bgCore, 0));
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // ── Nebulae ────────────────────────────────────
        for (const neb of s.nebulae) {
          let nx = neb.x;
          let ny = neb.y;
          if (!p.reducedMotion) {
            nx += Math.sin(s.frameCount * neb.driftSpeed + neb.driftPhase) * 0.01;
            ny += Math.cos(s.frameCount * neb.driftSpeed * 1.3 + neb.driftPhase) * 0.008;
          }

          const snx = cx + (nx - 0.5) * w * scale;
          const sny = cy + (ny - 0.5) * h * scale;
          const nebR = neb.radius * minDim * scale;

          if (snx < -nebR || snx > w + nebR || sny < -nebR || sny > h + nebR) continue;

          const nebIdx = Math.floor(neb.hueShift * NEBULA_COLORS.length);
          const nebColor = lerpColor(
            NEBULA_COLORS[nebIdx % NEBULA_COLORS.length],
            s.primaryRgb,
            0.1,
          );
          const shifted: RGB = [
            Math.max(0, Math.min(255, nebColor[0] + depthColorShift[0])),
            Math.max(0, Math.min(255, nebColor[1] + depthColorShift[1])),
            Math.max(0, Math.min(255, nebColor[2] + depthColorShift[2])),
          ];

          const nebGrad = ctx.createRadialGradient(snx, sny, 0, snx, sny, nebR);
          nebGrad.addColorStop(0, rgba(shifted, neb.brightness * alpha * 0.06 * entrance));
          nebGrad.addColorStop(0.4, rgba(shifted, neb.brightness * alpha * 0.025 * entrance));
          nebGrad.addColorStop(1, rgba(shifted, 0));
          ctx.fillStyle = nebGrad;
          ctx.fillRect(snx - nebR, sny - nebR, nebR * 2, nebR * 2);
        }

        // ── Stars ──────────────────────────────────────
        for (const star of s.stars) {
          const twinkle = p.reducedMotion ? 0.7 :
            0.5 + 0.5 * Math.sin(s.frameCount * star.twinkleSpeed + star.twinklePhase);

          let sx = star.x;
          let sy = star.y;
          if (!p.reducedMotion) {
            sx += s.frameCount * STAR_DRIFT * star.depth * 0.00001;
            sy += s.frameCount * STAR_DRIFT * star.depth * 0.00001 * 0.3;
            sx = sx % 1;
            sy = sy % 1;
          }

          const ssx = cx + (sx - 0.5) * w * scale;
          const ssy = cy + (sy - 0.5) * h * scale;
          const starSize = star.sizeFrac * minDim;

          if (ssx < -starSize * 4 || ssx > w + starSize * 4 ||
              ssy < -starSize * 4 || ssy > h + starSize * 4) continue;

          const starAlpha = star.brightness * twinkle * alpha * entrance * 0.5;
          const shifted: RGB = [
            Math.max(0, Math.min(255, STAR_WHITE[0] + depthColorShift[0])),
            Math.max(0, Math.min(255, STAR_WHITE[1] + depthColorShift[1])),
            Math.max(0, Math.min(255, STAR_WHITE[2] + depthColorShift[2])),
          ];

          if (star.brightness > 0.7 && star.sizeFrac > minDim * 0.000003) {
            const glowR = starSize * 3;
            const glowGrad = ctx.createRadialGradient(ssx, ssy, 0, ssx, ssy, glowR);
            glowGrad.addColorStop(0, rgba(shifted, starAlpha * 0.15));
            glowGrad.addColorStop(1, rgba(shifted, 0));
            ctx.fillStyle = glowGrad;
            ctx.fillRect(ssx - glowR, ssy - glowR, glowR * 2, glowR * 2);
          }

          ctx.beginPath();
          ctx.arc(ssx, ssy, Math.max(minDim * 0.0005, starSize * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = rgba(shifted, starAlpha);
          ctx.fill();
        }

        // ── Central shard ──────────────────────────────
        const shardR = minDim * SHARD_R_FRAC * scale;
        if (shardR < minDim * 0.5 && shardR > minDim * 0.002) {
          const sColor = lerpColor(SHARD_CORE, s.accentRgb, 0.15);
          const shifted: RGB = [
            Math.max(0, Math.min(255, sColor[0] + depthColorShift[0])),
            Math.max(0, Math.min(255, sColor[1] + depthColorShift[1])),
            Math.max(0, Math.min(255, sColor[2] + depthColorShift[2])),
          ];

          // Shard glow
          const sgR = shardR * 5;
          const sgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sgR);
          sgGrad.addColorStop(0, rgba(shifted, 0.06 * alpha * entrance));
          sgGrad.addColorStop(0.3, rgba(shifted, 0.015 * alpha * entrance));
          sgGrad.addColorStop(1, rgba(shifted, 0));
          ctx.fillStyle = sgGrad;
          ctx.fillRect(cx - sgR, cy - sgR, sgR * 2, sgR * 2);

          // Shard body (faceted polygon)
          ctx.beginPath();
          for (let i = 0; i <= SHARD_FACETS; i++) {
            const angle = (i / SHARD_FACETS) * Math.PI * 2 + s.shardRotation;
            const facetR = shardR * (0.85 + (i % 2 === 0 ? 0.15 : 0));
            const fx = cx + Math.cos(angle) * facetR;
            const fy = cy + Math.sin(angle) * facetR;
            if (i === 0) ctx.moveTo(fx, fy);
            else ctx.lineTo(fx, fy);
          }
          ctx.closePath();

          const shardGrad = ctx.createRadialGradient(
            cx - shardR * 0.2, cy - shardR * 0.2, shardR * 0.1,
            cx, cy, shardR,
          );
          shardGrad.addColorStop(0, rgba(lerpColor(shifted, [255, 255, 255], 0.3), 0.2 * alpha * entrance));
          shardGrad.addColorStop(0.5, rgba(shifted, 0.08 * alpha * entrance));
          shardGrad.addColorStop(1, rgba(lerpColor(SHARD_EDGE, s.primaryRgb, 0.1), 0.04 * alpha * entrance));
          ctx.fillStyle = shardGrad;
          ctx.fill();

          // Shard edge
          ctx.strokeStyle = rgba(shifted, 0.15 * alpha * entrance);
          ctx.lineWidth = minDim * 0.001;
          ctx.stroke();

          // Inner refraction lines
          for (let i = 0; i < 3; i++) {
            const a1 = (i / 3) * Math.PI * 2 + s.shardRotation;
            const a2 = a1 + Math.PI * 0.5;
            ctx.beginPath();
            ctx.moveTo(
              cx + Math.cos(a1) * shardR * 0.6,
              cy + Math.sin(a1) * shardR * 0.6,
            );
            ctx.lineTo(
              cx + Math.cos(a2) * shardR * 0.4,
              cy + Math.sin(a2) * shardR * 0.4,
            );
            ctx.strokeStyle = rgba(shifted, 0.06 * alpha * entrance);
            ctx.lineWidth = minDim * 0.0007;
            ctx.stroke();
          }
        }
      };

      // ── Render main scene ─────────────────────────────
      if (s.isCrossfading) {
        renderScene(1 - s.crossfadeProgress, s.currentZoom);
        renderScene(s.crossfadeProgress, 1);
      } else {
        renderScene(1, s.currentZoom);
      }

      // ── Recursion flash ───────────────────────────────
      if (s.recursionFlash > 0) {
        const flashColor = lerpColor(RECURSION_FLASH, s.accentRgb, 0.2);
        ctx.fillStyle = rgba(flashColor, s.recursionFlash * 0.06 * entrance);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Depth counter (extremely subtle) ──────────────
      if (s.recursionDepth > 0) {
        const fontSize = Math.max(minDim * 0.018, minDim * 0.015);
        ctx.font = `${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillStyle = rgba(SHARD_EDGE, 0.06 * entrance);
        ctx.fillText(`∞ · ${s.recursionDepth}`, w - minDim * 0.04, h - minDim * 0.03);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
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
          cursor: 'zoom-in',
        }}
      />
    </div>
  );
}