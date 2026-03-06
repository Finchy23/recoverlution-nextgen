/**
 * ATOM 054: THE KERNEL PANIC ENGINE (The Ego Overload)
 * =====================================================
 * Series 6 — Meta-System & Glitch · Position 4
 *
 * When the user is ruminating in a catastrophic loop, the brain
 * has crashed. We visualise this as a fatal system error. The
 * screen tears. RGB channels split. A wall of hexadecimal
 * memory dumps scrolls at terrifying speed — evidence of the
 * system trying to dump state before the crash. Then: HALT.
 *
 * FATAL ERROR: EGO OVERLOAD
 * Process "rumination.loop" consumed 99.7% of available
 * cognitive resources. Hard reboot required.
 *
 * The user taps. The screen cuts to absolute black. Dead
 * silence. Then, slowly, warmth returns. A single line fades
 * in: "You are not your errors." Completion.
 *
 * VISUAL PHASES:
 *   1. CALM: Subtle mote field (the "normal" state)
 *   2. GLITCH (~1.5s): Screen begins tearing, RGB splits
 *   3. CRASH: Blue screen floods in, hex dump scrolls
 *   4. HALT: Scroll freezes. Error message rendered.
 *   5. User taps → hard reboot sequence
 *   6. VOID: Black. Warm text. Completion.
 *
 * CRT EFFECTS (all canvas-based):
 *   - Chromatic aberration: text drawn 3x with R/G/B offsets
 *   - Scan lines: alternating alpha rows
 *   - Screen tear: horizontal displacement of scanline bands
 *   - Flicker: random global alpha modulation
 *
 * HAPTIC:
 *   Crash → entrance_land (sharp electrical buzz)
 *   Halt → step_advance (the system stopping)
 *   Reboot complete → completion
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: No screen tear, no flicker, static hex dump,
 *   faster transitions
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const CALM_FRAMES = 90;           // ~1.5s of calm
const GLITCH_FRAMES = 60;        // ~1s of growing distortion
const HEX_SCROLL_SPEED = 4;      // Lines per frame
const HEX_LINES_VISIBLE = 30;    // Lines on screen at once
const HEX_HALT_AFTER = 120;      // Frames of scrolling before halt
const REBOOT_FADE_FRAMES = 90;   // Black fade duration
const WARM_FADE_FRAMES = 120;    // Text warmth fade in
const MOTE_COUNT = 20;

const ERROR_LINES = [
  '*** FATAL ERROR: EGO OVERLOAD ***',
  '',
  'Process "rumination.loop" consumed',
  '99.7% of available cognitive resources.',
  '',
  'Stack trace:',
  '  at fear.cascade(0x7F3A)',
  '  at self.doubt.recursive(0x8E1C)',
  '  at identity.crisis.unresolved(0xA041)',
  '',
  'Hard reboot required.',
  '',
  '[tap to reboot]',
];

// Palette
const BG_DARK: RGB = [3, 3, 4];
const MOTE_COLOR: RGB = [65, 60, 55];
const BSOD_BG: RGB = [0, 10, 80];         // Classic blue
const BSOD_TEXT: RGB = [180, 180, 200];    // CRT white-blue
const HEX_DIM: RGB = [60, 65, 120];       // Dim hex dump
const GLITCH_RED: RGB = [200, 30, 30];
const GLITCH_GREEN: RGB = [30, 200, 30];
const GLITCH_BLUE: RGB = [80, 80, 255];
const VOID_BG: RGB = [1, 1, 2];
const WARM_TEXT: RGB = [155, 145, 120];
const SCAN_LINE: RGB = [0, 0, 0];

type KernelPhase = 'calm' | 'glitch' | 'crash' | 'halt' | 'rebooting' | 'void';

// Pre-generate hex dump lines
function generateHexLine(seed: number): string {
  const addr = (seed * 16).toString(16).toUpperCase().padStart(8, '0');
  let hex = '';
  for (let i = 0; i < 16; i++) {
    hex += ((seed * 7 + i * 13 + 0xA5) & 0xFF).toString(16).toUpperCase().padStart(2, '0') + ' ';
  }
  return `0x${addr}  ${hex}`;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function KernelPanicAtom({
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
    phase: 'calm' as KernelPhase,
    motes: [] as Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number; phase: number }>,
    hexLines: [] as string[],
    hexScrollOffset: 0,
    phaseFrame: 0,           // Frames since current phase started
    crashFired: false,
    haltFired: false,
    resolved: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
    rebootAlpha: 0,
    voidTextAlpha: 0,
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

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      if (s.phase === 'halt') {
        s.phase = 'rebooting';
        s.phaseFrame = 0;
      }
      canvas.setPointerCapture(e.pointerId);
    };
    canvas.addEventListener('pointerdown', onDown);

    if (!s.initialized) {
      s.motes = Array.from({ length: MOTE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * minDim * 0.0004,
        vy: (Math.random() - 0.5) * minDim * 0.0004,
        size: minDim * (0.0006 + Math.random() * 0.0014),
        alpha: 0.01 + Math.random() * 0.025,
        phase: Math.random() * Math.PI * 2,
      }));
      // Pre-generate 200 hex lines
      s.hexLines = Array.from({ length: 200 }, (_, i) => generateHexLine(i + 42));
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

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
      s.phaseFrame++;

      // Entrance
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const ent = easeOutExpo(s.entranceProgress);

      // ── State machine ──────────────────────────────────
      const calmDelay = p.reducedMotion ? 60 : CALM_FRAMES;
      if (s.phase === 'calm' && s.phaseFrame >= calmDelay) {
        s.phase = 'glitch';
        s.phaseFrame = 0;
      }
      if (s.phase === 'glitch' && s.phaseFrame >= (p.reducedMotion ? 20 : GLITCH_FRAMES)) {
        s.phase = 'crash';
        s.phaseFrame = 0;
        if (!s.crashFired) {
          s.crashFired = true;
          cb.onHaptic('entrance_land');
        }
      }
      if (s.phase === 'crash' && s.phaseFrame >= (p.reducedMotion ? 40 : HEX_HALT_AFTER)) {
        s.phase = 'halt';
        s.phaseFrame = 0;
        if (!s.haltFired) {
          s.haltFired = true;
          cb.onHaptic('step_advance');
        }
      }
      if (s.phase === 'rebooting') {
        s.rebootAlpha = Math.min(1, s.phaseFrame / REBOOT_FADE_FRAMES);
        if (s.rebootAlpha >= 1) {
          s.phase = 'void';
          s.phaseFrame = 0;
        }
      }
      if (s.phase === 'void') {
        s.voidTextAlpha = Math.min(1, s.phaseFrame / WARM_FADE_FRAMES);
        if (s.voidTextAlpha >= 0.95 && !s.resolved) {
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // Progress
      const progress =
        s.phase === 'calm' ? 0 :
        s.phase === 'glitch' ? 0.1 :
        s.phase === 'crash' ? 0.2 + (s.phaseFrame / HEX_HALT_AFTER) * 0.3 :
        s.phase === 'halt' ? 0.5 :
        s.phase === 'rebooting' ? 0.5 + s.rebootAlpha * 0.2 :
        0.7 + s.voidTextAlpha * 0.3;
      cb.onStateChange?.(Math.min(1, progress));

      // ══════════════════════════════════════════════════
      // RENDER BY PHASE
      // ══════════════════════════════════════════════════

      if (s.phase === 'calm') {
        // ── Calm background + motes ──────────────────────
        const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
        bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
        bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
        bgGrad.addColorStop(1, rgba(bg, 0));
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        const mColor = lerpColor(MOTE_COLOR, s.primaryRgb, 0.05);
        for (const mote of s.motes) {
          if (!p.reducedMotion) {
            mote.x += mote.vx;
            mote.y += mote.vy;
            if (mote.x < 0 || mote.x > w) mote.vx *= -1;
            if (mote.y < 0 || mote.y > h) mote.vy *= -1;
          }
          const shimmer = p.reducedMotion ? 0.6 :
            0.4 + 0.6 * Math.sin(s.frameCount * 0.02 + mote.phase);
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = rgba(mColor, mote.alpha * shimmer * ent);
          ctx.fill();
        }
      }

      if (s.phase === 'glitch') {
        // ── Glitch transition ────────────────────────────
        const glitchT = s.phaseFrame / GLITCH_FRAMES;
        const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
        ctx.fillStyle = rgba(bg, ent);
        ctx.fillRect(0, 0, w, h);

        // Screen tear bands (horizontal displacement)
        if (!p.reducedMotion) {
          const tearCount = Math.floor(glitchT * 8);
          for (let t = 0; t < tearCount; t++) {
            const ty = Math.random() * h;
            const th = minDim * (0.002 + Math.random() * 0.008);
            const offset = (Math.random() - 0.5) * minDim * 0.025 * glitchT;
            // RGB split tear
            const tearAlpha = 0.04 * glitchT;
            ctx.fillStyle = rgba(lerpColor(GLITCH_RED, s.primaryRgb, 0.02), tearAlpha);
            ctx.fillRect(offset - minDim * 0.004, ty, w, th);
            ctx.fillStyle = rgba(lerpColor(GLITCH_GREEN, s.primaryRgb, 0.02), tearAlpha * 0.6);
            ctx.fillRect(offset + minDim * 0.004, ty + minDim * 0.001, w, th);
            ctx.fillStyle = rgba(lerpColor(GLITCH_BLUE, s.primaryRgb, 0.02), tearAlpha * 0.8);
            ctx.fillRect(offset, ty - minDim * 0.001, w, th);
          }
        }

        // Blue bleed
        const bleedAlpha = glitchT * 0.06 * ent;
        const bsodCol = lerpColor(BSOD_BG, s.primaryRgb, 0.01);
        ctx.fillStyle = rgba(bsodCol, bleedAlpha);
        ctx.fillRect(0, 0, w, h);
      }

      if (s.phase === 'crash' || s.phase === 'halt') {
        // ── Blue Screen ───────────────────��──────────────
        const bsodCol = lerpColor(BSOD_BG, s.primaryRgb, 0.008);
        ctx.fillStyle = rgba(bsodCol, 0.15 * ent);
        ctx.fillRect(0, 0, w, h);

        // CRT flicker
        const flicker = p.reducedMotion ? 1 :
          0.92 + Math.random() * 0.08;

        // Scan lines
        if (!p.reducedMotion) {
          const scanStep = Math.max(2, Math.round(minDim * 0.006));
          for (let sy = 0; sy < h; sy += scanStep) {
            const scanCol = lerpColor(SCAN_LINE, s.primaryRgb, 0.001);
            ctx.fillStyle = rgba(scanCol, 0.015 * flicker);
            ctx.fillRect(0, sy, w, minDim * 0.002);
          }
        }

        // Hex dump
        const fontSize = Math.round(minDim * 0.016);
        const lineH = fontSize * 1.4;
        ctx.font = `400 ${fontSize}px 'SF Mono', 'Menlo', 'Consolas', monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        if (s.phase === 'crash' && !p.reducedMotion) {
          s.hexScrollOffset += HEX_SCROLL_SPEED;
        }

        const startLine = Math.floor(s.hexScrollOffset / lineH) % s.hexLines.length;
        const yOff = -(s.hexScrollOffset % lineH);
        const hexCol = lerpColor(HEX_DIM, s.accentRgb, 0.03);

        for (let i = 0; i < HEX_LINES_VISIBLE + 2; i++) {
          const lineIdx = (startLine + i) % s.hexLines.length;
          const y = yOff + i * lineH;
          if (y > h + lineH || y < -lineH) continue;

          const lineAlpha = 0.06 * flicker * ent;

          if (!p.reducedMotion) {
            // Chromatic aberration — draw text 3x with RGB offsets
            const abOffset = minDim * 0.0016;
            const rCol = lerpColor(GLITCH_RED, s.primaryRgb, 0.02);
            const gCol = lerpColor(GLITCH_GREEN, s.primaryRgb, 0.02);
            const bCol = lerpColor(GLITCH_BLUE, s.primaryRgb, 0.02);
            const textMargin = minDim * 0.016;

            ctx.fillStyle = rgba(rCol, lineAlpha * 0.4);
            ctx.fillText(s.hexLines[lineIdx], textMargin - abOffset, y);
            ctx.fillStyle = rgba(gCol, lineAlpha * 0.3);
            ctx.fillText(s.hexLines[lineIdx], textMargin + abOffset, y + abOffset * 0.5);
            ctx.fillStyle = rgba(bCol, lineAlpha * 0.5);
            ctx.fillText(s.hexLines[lineIdx], textMargin, y - abOffset * 0.3);
          }

          // Main text
          ctx.fillStyle = rgba(hexCol, lineAlpha);
          ctx.fillText(s.hexLines[lineIdx], minDim * 0.016, y);
        }

        // Screen tears during crash scroll
        if (s.phase === 'crash' && !p.reducedMotion && Math.random() > 0.7) {
          const tearY = Math.random() * h;
          const tearH = minDim * (0.004 + Math.random() * 0.012);
          const tearOff = (Math.random() - 0.5) * minDim * 0.04;
          ctx.save();
          ctx.translate(tearOff, 0);
          ctx.fillStyle = rgba(bsodCol, 0.1);
          ctx.fillRect(-tearOff, tearY, w + Math.abs(tearOff) * 2, tearH);
          ctx.restore();
        }

        // ── HALT: Error message overlay ──────────────────
        if (s.phase === 'halt') {
          const errBg = lerpColor(BSOD_BG, s.primaryRgb, 0.005);
          const errBgAlpha = Math.min(0.12, s.phaseFrame * 0.002) * ent;
          ctx.fillStyle = rgba(errBg, errBgAlpha);
          ctx.fillRect(0, 0, w, h);

          const errFontSize = Math.round(minDim * 0.02);
          const errLineH = errFontSize * 1.8;
          ctx.font = `400 ${errFontSize}px 'SF Mono', 'Menlo', 'Consolas', monospace`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const blockH = ERROR_LINES.length * errLineH;
          const startY = (h - blockH) / 2;
          const startX = w * 0.1;

          const errTextCol = lerpColor(BSOD_TEXT, s.accentRgb, 0.04);

          for (let i = 0; i < ERROR_LINES.length; i++) {
            const lineDelay = i * 3;
            const lineAlpha = Math.min(1, Math.max(0, (s.phaseFrame - lineDelay) / 20));
            if (lineAlpha <= 0) continue;

            const isFatal = i === 0;
            const isPrompt = i === ERROR_LINES.length - 1;
            let alpha = 0.08 * lineAlpha * ent;

            if (isFatal) alpha = 0.12 * lineAlpha * ent;
            if (isPrompt) {
              const blink = p.reducedMotion ? 0.7 :
                0.4 + 0.6 * Math.sin(s.frameCount * 0.05);
              alpha = 0.05 * blink * lineAlpha * ent;
            }

            ctx.fillStyle = rgba(errTextCol, alpha);
            ctx.fillText(ERROR_LINES[i], startX, startY + i * errLineH);
          }
        }
      }

      // ── Reboot overlay (fade to black) ─────────────────
      if (s.phase === 'rebooting' || s.phase === 'void') {
        const voidCol = lerpColor(VOID_BG, s.primaryRgb, 0.003);
        const fadeAlpha = s.phase === 'void' ? 1 : s.rebootAlpha;
        ctx.fillStyle = rgba(voidCol, fadeAlpha * ent);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Void text ──────────────────────────────────────
      if (s.phase === 'void' && s.voidTextAlpha > 0) {
        const textCol = lerpColor(WARM_TEXT, s.accentRgb, 0.06);
        const fontSize = Math.round(minDim * 0.022);
        ctx.font = `200 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tAlpha = easeOutExpo(s.voidTextAlpha) * 0.07 * ent;
        ctx.fillStyle = rgba(textCol, tAlpha);
        ctx.fillText('You are not your errors.', w / 2, h / 2);

        // Warm glow
        if (s.voidTextAlpha > 0.3) {
          const glowR = minDim * 0.15;
          const glowCol = lerpColor(WARM_TEXT, s.accentRgb, 0.08);
          const glowGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowR);
          const gAlpha = (s.voidTextAlpha - 0.3) * 0.008 * (1 + p.breathAmplitude * 0.3) * ent;
          glowGrad.addColorStop(0, rgba(glowCol, gAlpha));
          glowGrad.addColorStop(0.5, rgba(glowCol, gAlpha * 0.2));
          glowGrad.addColorStop(1, rgba(glowCol, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(0, 0, w, h);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
          cursor: 'default',
        }}
      />
    </div>
  );
}