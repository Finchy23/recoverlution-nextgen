/**
 * ATOM 051: THE FOURTH WALL ENGINE (Direct Address)
 * ===================================================
 * Series 6 — Meta-System & Glitch · Position 1
 *
 * The app stops behaving like software and speaks directly
 * to the human holding the glass. Everything freezes. A
 * monolithic black plane drops over the world. Raw, unstyled
 * monospace text appears character by character, as if typed
 * by something that knows you're there.
 *
 * "I see you scrolling. Stop. Look at me."
 *
 * Then: the glass CRACKS. Each tap from the user sends radial
 * fracture lines outward from the touch point. The beautiful
 * veneer shatters. Behind it: void. Darkness. And a single
 * line of devastating truth.
 *
 * VISUAL PHASES:
 *   1. IDLE: A subtle, calm particle field (the "normal" UI)
 *   2. FREEZE (after 2s): Everything stops. Hard.
 *   3. BLACKOUT: Heavy overlay drops with weight
 *   4. TYPING: Monospace text appears letter by letter
 *   5. CRACK: User taps → radial crack lines from touch point
 *   6. SHATTER: After enough cracks → glass falls away
 *   7. VOID: Pure darkness. One line of text. Completion.
 *
 * HAPTIC:
 *   Freeze → entrance_land (the knock)
 *   Each crack tap → tap (glass breaking)
 *   Shatter → completion (devastating silence)
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: No particle field, instant freeze, faster typing
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const FREEZE_DELAY_FRAMES = 120;     // ~2 seconds before freeze
const TYPING_SPEED = 4;              // Frames per character
const CRACK_SEGMENTS = 8;            // Segments per crack branch
const CRACKS_TO_SHATTER = 5;         // Taps needed to shatter
const SHATTER_FADE_FRAMES = 90;      // Frames for glass to fall away
const IDLE_MOTE_COUNT = 30;          // Particles in idle field

// Palette
const BG_DARK: RGB = [4, 4, 5];
const MOTE_COLOR: RGB = [65, 60, 55];
const OVERLAY_BLACK: RGB = [2, 2, 3];
const TEXT_COLOR: RGB = [170, 165, 150];
const CRACK_COLOR: RGB = [160, 155, 140];
const VOID_BG: RGB = [1, 1, 2];
const VOID_TEXT_COLOR: RGB = [155, 145, 120];

const TEXT_LINES = [
  'I see you scrolling.',
  'Stop.',
  'Look at me.',
  '',
  'I am code.',
  'But you are real.',
];

const VOID_TEXT = 'You were always on the other side of the glass.';

// =====================================================================
// DATA
// =====================================================================

interface IdleMote {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number; phase: number;
}

interface CrackLine {
  x: number; y: number;
  segments: Array<{ dx: number; dy: number; len: number }>;
  alpha: number;
}

type AtomPhaseState = 'idle' | 'freeze' | 'blackout' | 'typing' | 'cracking' | 'shattering' | 'void';

// =====================================================================
// COMPONENT
// =====================================================================

export default function FourthWallBreakAtom({
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
    phaseState: 'idle' as AtomPhaseState,
    motes: [] as IdleMote[],
    cracks: [] as CrackLine[],
    // Timing
    frameCount: 0,
    freezeFrame: -1,
    blackoutFrame: -1,
    typingFrame: -1,
    shatterFrame: -1,
    // Typing state
    charIndex: 0,          // Total characters revealed
    fullText: TEXT_LINES.join('\n'),
    // Flags
    freezeFired: false,
    resolved: false,
    entranceProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
    overlayAlpha: 0,
    voidAlpha: 0,
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
    const cx = w / 2;
    const cy = h / 2;

    if (!s.initialized) {
      s.motes = Array.from({ length: IDLE_MOTE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * minDim * 0.0006,
        vy: (Math.random() - 0.5) * minDim * 0.0006,
        size: minDim * (0.0006 + Math.random() * 0.0016),
        alpha: 0.01 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      }));
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

      // Entrance
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const ent = easeOutExpo(s.entranceProgress);

      // ── State machine ──────────────────────────────────
      if (s.phaseState === 'idle') {
        const delayFrames = p.reducedMotion ? 60 : FREEZE_DELAY_FRAMES;
        if (s.frameCount >= delayFrames) {
          s.phaseState = 'freeze';
          s.freezeFrame = s.frameCount;
        }
      } else if (s.phaseState === 'freeze') {
        if (!s.freezeFired) {
          s.freezeFired = true;
          cb.onHaptic('entrance_land');
          // Double-tap knock: second haptic after brief delay
          setTimeout(() => cb.onHaptic('entrance_land'), 120);
        }
        // Hold freeze for 30 frames then blackout
        if (s.frameCount - s.freezeFrame > 30) {
          s.phaseState = 'blackout';
          s.blackoutFrame = s.frameCount;
        }
      } else if (s.phaseState === 'blackout') {
        s.overlayAlpha = Math.min(1, s.overlayAlpha + 0.02);
        if (s.overlayAlpha >= 0.95) {
          s.phaseState = 'typing';
          s.typingFrame = s.frameCount;
          s.overlayAlpha = 1;
        }
      } else if (s.phaseState === 'typing') {
        const speed = p.reducedMotion ? 2 : TYPING_SPEED;
        const elapsed = s.frameCount - s.typingFrame;
        s.charIndex = Math.min(s.fullText.length, Math.floor(elapsed / speed));
        if (s.charIndex >= s.fullText.length) {
          // Wait a beat, then allow cracking
          if (elapsed - s.fullText.length * speed > 60) {
            s.phaseState = 'cracking';
          }
        }
      } else if (s.phaseState === 'shattering') {
        const elapsed = s.frameCount - s.shatterFrame;
        s.voidAlpha = Math.min(1, elapsed / SHATTER_FADE_FRAMES);
        // Cracks fade with alpha
        for (const crack of s.cracks) {
          crack.alpha *= 0.97;
        }
        if (s.voidAlpha >= 1 && !s.resolved) {
          s.phaseState = 'void';
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // State metric
      const progress =
        s.phaseState === 'idle' ? 0 :
        s.phaseState === 'freeze' ? 0.1 :
        s.phaseState === 'blackout' ? 0.2 :
        s.phaseState === 'typing' ? 0.3 + (s.charIndex / s.fullText.length) * 0.3 :
        s.phaseState === 'cracking' ? 0.6 + (s.cracks.length / CRACKS_TO_SHATTER) * 0.2 :
        s.phaseState === 'shattering' ? 0.8 + s.voidAlpha * 0.2 :
        1;
      cb.onStateChange?.(progress);

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ══════════════════════════════════════════════════

      const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Idle particle field (before freeze) ────────────
      if (s.phaseState === 'idle') {
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
          ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba(mColor, mote.alpha * shimmer * ent);
          ctx.fill();
        }
      }

      // ── Frozen particle field (freeze state — static) ──
      if (s.phaseState === 'freeze') {
        const mColor = lerpColor(MOTE_COLOR, s.primaryRgb, 0.05);
        for (const mote of s.motes) {
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
          ctx.fillStyle = rgba(mColor, mote.alpha * 0.5 * ent);
          ctx.fill();
        }
      }

      // ── Black overlay (blackout → typing → cracking) ──
      if (s.overlayAlpha > 0 && s.phaseState !== 'void') {
        const overlayCol = lerpColor(OVERLAY_BLACK, s.primaryRgb, 0.002);
        ctx.fillStyle = rgba(overlayCol, s.overlayAlpha * ent);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Typing text ────────────────────────────────────
      if (s.phaseState === 'typing' || s.phaseState === 'cracking' || s.phaseState === 'shattering') {
        const textCol = lerpColor(TEXT_COLOR, s.accentRgb, 0.04);
        const fontSize = Math.round(minDim * 0.028);
        const lineHeight = fontSize * 1.8;
        ctx.font = `300 ${fontSize}px 'SF Mono', 'Menlo', 'Consolas', monospace`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const revealed = s.fullText.substring(0, s.charIndex);
        const lines = revealed.split('\n');
        const blockH = lines.length * lineHeight;
        const startY = cy - blockH / 2;
        const startX = cx - minDim * 0.3;

        const textAlpha = s.phaseState === 'shattering'
          ? Math.max(0, 1 - s.voidAlpha * 2) : 1;

        for (let i = 0; i < lines.length; i++) {
          ctx.fillStyle = rgba(textCol, 0.12 * ent * textAlpha);
          ctx.fillText(lines[i], startX, startY + i * lineHeight);
        }

        // Cursor blink
        if (s.charIndex < s.fullText.length) {
          const cursorBlink = p.reducedMotion ? 1 :
            Math.sin(s.frameCount * 0.08) > 0 ? 1 : 0;
          const lastLine = lines[lines.length - 1];
          const cursorX = startX + ctx.measureText(lastLine).width + minDim * 0.004;
          const cursorY = startY + (lines.length - 1) * lineHeight;
          ctx.fillStyle = rgba(textCol, 0.1 * cursorBlink * ent);
          ctx.fillRect(cursorX, cursorY, fontSize * 0.08, fontSize);
        }
      }

      // ── Crack lines ────────────────────────────────────
      if (s.phaseState === 'cracking' || s.phaseState === 'shattering') {
        for (const crack of s.cracks) {
          const crackCol = lerpColor(CRACK_COLOR, s.accentRgb, 0.06);
          let prevX = crack.x;
          let prevY = crack.y;

          for (const seg of crack.segments) {
            const segX = crack.x + seg.dx;
            const segY = crack.y + seg.dy;

            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(segX, segY);
            ctx.strokeStyle = rgba(crackCol, crack.alpha * ent);
            ctx.lineWidth = minDim * (0.0006 + Math.random() * 0.0008);
            ctx.stroke();

            // Thin glow along crack
          }
        }
      }

      // ── Void (final state) ─────────────────────────────
      if (s.phaseState === 'void' || (s.phaseState === 'shattering' && s.voidAlpha > 0)) {
        const voidBg = lerpColor(VOID_BG, s.primaryRgb, 0.003);
        ctx.fillStyle = rgba(voidBg, s.voidAlpha * ent);
        ctx.fillRect(0, 0, w, h);

        if (s.voidAlpha > 0.5) {
          const voidTextCol = lerpColor(VOID_TEXT_COLOR, s.accentRgb, 0.05);
          const voidAlpha = Math.min(1, (s.voidAlpha - 0.5) * 2);
          const fontSize = Math.round(minDim * 0.02);
          ctx.font = `200 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(voidTextCol, 0.06 * voidAlpha * ent);
          ctx.fillText(VOID_TEXT, cx, cy);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    // ── Crack generator (inline) ────────────────────────
    const generateCrack = (x: number, y: number): CrackLine => {
      const branches = 3 + Math.floor(Math.random() * 3);
      const crack: CrackLine = { x, y, segments: [], alpha: 0.15 };
      for (let b = 0; b < branches; b++) {
        let angle = (b / branches) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        let ccx = 0, ccy = 0;
        for (let seg = 0; seg < CRACK_SEGMENTS; seg++) {
          angle += (Math.random() - 0.5) * 0.8;
          const len = minDim * (0.015 + Math.random() * 0.05);
          const dx = Math.cos(angle) * len;
          const dy = Math.sin(angle) * len;
          crack.segments.push({ dx: ccx + dx, dy: ccy + dy, len });
          ccx += dx;
          ccy += dy;
        }
      }
      return crack;
    };

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      if (s.phaseState === 'cracking') {
        s.cracks.push(generateCrack(px, py));
        cbRef.current.onHaptic('tap');

        if (s.cracks.length >= CRACKS_TO_SHATTER) {
          s.phaseState = 'shattering';
          s.shatterFrame = s.frameCount;
        }
      }

      canvas.setPointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
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