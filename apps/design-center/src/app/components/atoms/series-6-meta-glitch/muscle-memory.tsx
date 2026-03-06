/**
 * ATOM 057: THE MUSCLE MEMORY ENGINE (The Wrong Button)
 * =====================================================
 * Series 6 — Meta-System & Glitch · Position 7
 *
 * You are a robot right now. Clicking without feeling.
 * I moved the cheese. Wake up.
 *
 * A "Next" button appears in its usual, predictable spot at
 * the bottom of the screen. As the user's finger approaches,
 * the button physically slides to the opposite side. They must
 * pause, locate it, and intentionally press it.
 *
 * Each successful conscious tap advances a counter. After N
 * conscious taps, the atom resolves — the user is awake.
 *
 * PHYSICS:
 *   - Pointer proximity detection within evasion radius
 *   - Smooth evasion via exponential repulsion from pointer
 *   - Bounding box constraints keep button on-screen
 *   - Successful tap requires pointer to be ON the button
 *     (not just near it) — must outsmart the evasion
 *
 * REDUCED MOTION: Button teleports instead of sliding
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const TAPS_TO_RESOLVE = 5;
const EVASION_RADIUS_FRAC = 0.24;  // proximity trigger as fraction of minDim
const EVASION_SPEED = 0.15;       // lerp factor for smooth evasion
const BTN_W_FRAC = 0.28;          // button width as fraction of minDim
const BTN_H_FRAC = 0.055;         // button height

const BG_DARK: RGB = [6, 5, 8];
const BTN_BG: RGB = [30, 35, 50];
const BTN_TEXT_COL: RGB = [160, 155, 140];
const HINT_COL: RGB = [80, 75, 65];
const SUCCESS_COL: RGB = [100, 140, 90];
const COUNTER_COL: RGB = [90, 85, 75];

export default function MuscleMemoryAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    // Button position (center)
    btnX: 0,
    btnY: 0,
    // Target position for evasion lerp
    targetX: 0,
    targetY: 0,
    // Pointer
    pointerX: -9999,
    pointerY: -9999,
    pointerActive: false,
    // Progress
    consciousTaps: 0,
    resolved: false,
    flashAlpha: 0,
    hintAlpha: 0,
    frameCount: 0,
    initialized: false,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const bw = minDim * BTN_W_FRAC;
    const bh = minDim * BTN_H_FRAC;
    const btnR = minDim * 0.016;
    const margin = minDim * 0.08;
    const evasionRadius = minDim * EVASION_RADIUS_FRAC;

    // Initialize button position to bottom-center (where "Next" buttons live)
    if (!s.initialized) {
      s.btnX = w / 2;
      s.btnY = h * 0.82;
      s.targetX = s.btnX;
      s.targetY = s.btnY;
      s.initialized = true;
    }

    // ── Native pointer handlers ─────────────────────────
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width * w;
      s.pointerY = (e.clientY - rect.top) / rect.height * h;
      s.pointerActive = true;
    };
    const onLeave = () => {
      s.pointerActive = false;
      s.pointerX = -9999;
      s.pointerY = -9999;
    };
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      if (px >= s.btnX - bw / 2 && px <= s.btnX + bw / 2 &&
          py >= s.btnY - bh / 2 && py <= s.btnY + bh / 2 &&
          !s.resolved) {
        s.consciousTaps++;
        s.flashAlpha = 1;
        cbRef.current.onHaptic('tap');
        cbRef.current.onStateChange?.(s.consciousTaps / TAPS_TO_RESOLVE);

        if (s.consciousTaps >= TAPS_TO_RESOLVE && !s.resolved) {
          s.resolved = true;
          cbRef.current.onHaptic('completion');
          cbRef.current.onResolve?.();
        }
      }
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current;
      const cb = cbRef.current;
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      // Entrance
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const ent = easeOutExpo(s.entranceProgress);

      // ── Evasion logic ──────────────────────────────────
      if (s.pointerActive && !s.resolved) {
        const dx = s.pointerX - s.btnX;
        const dy = s.pointerY - s.btnY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < evasionRadius && dist > 0) {
          // Repel: move button away from pointer
          const repelStrength = 1 - dist / evasionRadius;
          const angle = Math.atan2(dy, dx);
          const push = evasionRadius * repelStrength * 1.8;

          let nx = s.btnX - Math.cos(angle) * push;
          let ny = s.btnY - Math.sin(angle) * push;

          // Clamp to bounding box
          nx = Math.max(margin + bw / 2, Math.min(w - margin - bw / 2, nx));
          ny = Math.max(margin + bh / 2, Math.min(h - margin - bh / 2, ny));

          if (p.reducedMotion) {
            // Teleport
            s.btnX = nx;
            s.btnY = ny;
          } else {
            s.targetX = nx;
            s.targetY = ny;
          }
        }
      }

      // Smooth lerp to target
      if (!p.reducedMotion) {
        s.btnX += (s.targetX - s.btnX) * EVASION_SPEED;
        s.btnY += (s.targetY - s.btnY) * EVASION_SPEED;
      }

      // Flash decay
      if (s.flashAlpha > 0) {
        s.flashAlpha *= p.reducedMotion ? 0.9 : 0.95;
        if (s.flashAlpha < 0.001) s.flashAlpha = 0;
      }

      // Hint text (appears after 3 seconds of no taps)
      if (s.consciousTaps === 0 && s.frameCount > 180) {
        s.hintAlpha = Math.min(1, s.hintAlpha + 0.005);
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // Subtle background tint
      const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Hint text ──────────────────────────────────────
      if (s.hintAlpha > 0 && !s.resolved) {
        const hintSize = Math.round(minDim * 0.016);
        ctx.font = `300 ${hintSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const hc = lerpColor(HINT_COL, s.primaryRgb, 0.03);
        ctx.fillStyle = rgba(hc, 0.04 * s.hintAlpha * ent);
        ctx.fillText('you are clicking without looking', w / 2, h * 0.25);
      }

      // ── Counter dots ───────────────────────────────────
      const dotR = minDim * 0.005;
      const dotSpacing = minDim * 0.025;
      const dotsStartX = w / 2 - (TAPS_TO_RESOLVE - 1) * dotSpacing / 2;
      for (let i = 0; i < TAPS_TO_RESOLVE; i++) {
        const filled = i < s.consciousTaps;
        const dc = filled
          ? lerpColor(SUCCESS_COL, s.accentRgb, 0.06)
          : lerpColor(COUNTER_COL, s.primaryRgb, 0.03);
        ctx.beginPath();
        ctx.arc(dotsStartX + i * dotSpacing, h * 0.12, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dc, (filled ? 0.08 : 0.03) * ent);
        ctx.fill();
      }

      // ── The Button ─────────────────────────────────────
      if (!s.resolved) {
        const bx = s.btnX - bw / 2;
        const by = s.btnY - bh / 2;

        // Button background
        const btnBg = lerpColor(BTN_BG, s.accentRgb, 0.04);
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, btnR);
        ctx.fillStyle = rgba(btnBg, (0.08 + s.flashAlpha * 0.04) * ent);
        ctx.fill();

        // Button text
        const btnTs = Math.round(minDim * 0.018);
        ctx.font = `400 ${btnTs}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tc = lerpColor(BTN_TEXT_COL, s.accentRgb, 0.05);
        ctx.fillStyle = rgba(tc, 0.08 * ent);
        ctx.fillText('Next', s.btnX, s.btnY);

        // Success flash
        if (s.flashAlpha > 0.01) {
          const fc = lerpColor(SUCCESS_COL, s.accentRgb, 0.08);
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, btnR);
          ctx.strokeStyle = rgba(fc, s.flashAlpha * 0.1 * ent);
          ctx.lineWidth = minDim * 0.003;
          ctx.stroke();
        }
      }

      // ── Resolution state ───────────────────────────────
      if (s.resolved) {
        const resolveAlpha = Math.min(1, (s.frameCount - 180) * 0.005);
        if (resolveAlpha > 0) {
          const rs = Math.round(minDim * 0.022);
          ctx.font = `200 ${rs}px -apple-system, 'Helvetica Neue', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rc = lerpColor(SUCCESS_COL, s.accentRgb, 0.06);
          ctx.fillStyle = rgba(rc, 0.06 * easeOutExpo(resolveAlpha) * ent);
          ctx.fillText('you found it', w / 2, h * 0.5);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}