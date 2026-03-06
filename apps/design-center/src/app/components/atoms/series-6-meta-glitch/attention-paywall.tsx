/**
 * ATOM 059: THE ATTENTION PAYWALL ENGINE (Rumination Cost)
 * ========================================================
 * Series 6 — Meta-System & Glitch · Position 9
 *
 * Ruminating feels free, so the mind does it endlessly. This
 * atom visualizes the hidden metabolic cost of overthinking,
 * making the user "pay" for every anxious loop.
 *
 * A brilliant glowing battery sits in the center. Anxious
 * thoughts float by. If the user taps one to "read" it, the
 * battery physically drains by 10%, accompanied by a heavy,
 * draining, downward haptic slide. The user quickly learns
 * to let the thoughts pass to preserve their voltage.
 *
 * PHYSICS:
 *   - Central battery with 10-segment gauge
 *   - Thought bubbles drift across viewport at varied speeds
 *   - Tapping a thought: drains 10%, thought dissolves with cost
 *   - Letting thoughts pass: battery slowly recharges
 *   - Resolve: survive 30 seconds with battery > 0
 *
 * REDUCED MOTION: Thoughts appear/disappear without drift
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const BATTERY_SEGMENTS = 10;
const DRAIN_PER_TAP = 0.10;
const RECHARGE_RATE = 0.0003;    // per frame when not tapping
const THOUGHT_SPAWN_INTERVAL = 90; // frames between spawns
const RESOLVE_FRAME_COUNT = 1800; // ~30 seconds at 60fps

const BG_DARK: RGB = [5, 4, 7];
const BATTERY_SHELL: RGB = [50, 48, 55];
const BATTERY_FULL: RGB = [90, 150, 100];
const BATTERY_LOW: RGB = [170, 80, 60];
const BATTERY_GLOW: RGB = [110, 160, 100];
const THOUGHT_BG: RGB = [35, 32, 40];
const THOUGHT_TEXT: RGB = [130, 120, 105];
const COST_TEXT: RGB = [170, 70, 55];
const HINT_COL: RGB = [65, 60, 55];

const ANXIOUS_THOUGHTS = [
  'what if it goes wrong',
  'they probably hate you',
  'you should have said something',
  'this will never work',
  'everyone is watching',
  'you are falling behind',
  'it was your fault',
  'you are not ready',
  'what if they leave',
  'you wasted too much time',
  'you are not smart enough',
  'they are judging you',
  'something bad will happen',
  'you cannot handle this',
  'you missed your chance',
];

interface ThoughtBubble {
  text: string;
  x: number;
  y: number;
  vx: number;
  alpha: number;
  width: number;
  alive: boolean;
  tapped: boolean;
  tapAlpha: number;
}

export default function AttentionPaywallAtom({
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
    battery: 1.0,          // 0–1
    thoughts: [] as ThoughtBubble[],
    frameCount: 0,
    framesAlive: 0,        // Frames with battery > 0
    resolved: false,
    resolveAlpha: 0,
    dead: false,
    drainFlash: 0,
    thoughtIdx: 0,
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
    const dpr = window.devicePixelRatio || 1;
    const cx = w / 2;
    const cy = h / 2;

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (s.resolved || s.dead) return;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const fontSize = Math.round(minDim * 0.016);
      const bubbleH = fontSize * 2.2;

      for (const t of s.thoughts) {
        if (!t.alive || t.tapped) continue;
        if (px >= t.x && px <= t.x + t.width &&
            py >= t.y - bubbleH / 2 && py <= t.y + bubbleH / 2) {
          t.tapped = true;
          t.tapAlpha = 1;
          s.battery = Math.max(0, s.battery - DRAIN_PER_TAP);
          s.drainFlash = 1;
          cbRef.current.onHaptic('tap');
          if (s.battery <= 0) {
            s.dead = true;
            cbRef.current.onHaptic('step_advance');
          }
          cbRef.current.onStateChange?.(s.battery);
          break;
        }
      }
    };
    canvas.addEventListener('pointerdown', onDown);

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

      // Recharge when not tapping
      if (!s.dead && !s.resolved && s.battery < 1) {
        s.battery = Math.min(1, s.battery + RECHARGE_RATE);
      }

      // Survival timer
      if (!s.dead && !s.resolved && s.battery > 0 && s.entranceProgress > 0.5) {
        s.framesAlive++;
        if (s.framesAlive >= RESOLVE_FRAME_COUNT) {
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // Drain flash decay
      if (s.drainFlash > 0) {
        s.drainFlash *= p.reducedMotion ? 0.9 : 0.95;
        if (s.drainFlash < 0.001) s.drainFlash = 0;
      }

      // ── Spawn thoughts ─────────────────────────────────
      if (s.frameCount % THOUGHT_SPAWN_INTERVAL === 0 && !s.resolved && !s.dead) {
        const text = ANXIOUS_THOUGHTS[s.thoughtIdx % ANXIOUS_THOUGHTS.length];
        s.thoughtIdx++;
        const fontSize = Math.round(minDim * 0.016);
        const estWidth = text.length * fontSize * 0.5 + minDim * 0.04;
        const fromLeft = Math.random() > 0.5;

        s.thoughts.push({
          text,
          x: fromLeft ? -estWidth : w,
          y: h * 0.2 + Math.random() * h * 0.6,
          vx: (fromLeft ? 1 : -1) * (0.4 + Math.random() * 0.6),
          alpha: 0,
          width: estWidth,
          alive: true,
          tapped: false,
          tapAlpha: 0,
        });
      }

      // ── Update thoughts ────────────────────────────────
      for (const t of s.thoughts) {
        if (!t.alive) continue;

        if (!p.reducedMotion) {
          t.x += t.vx;
        }

        // Fade in/out
        if (!t.tapped) {
          t.alpha = Math.min(1, t.alpha + 0.02);
          // Kill if off screen
          if ((t.vx > 0 && t.x > w + 10) || (t.vx < 0 && t.x + t.width < -10)) {
            t.alive = false;
          }
        } else {
          t.tapAlpha *= 0.92;
          if (t.tapAlpha < 0.01) t.alive = false;
        }
      }

      // Cleanup dead thoughts
      s.thoughts = s.thoughts.filter(t => t.alive);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // Background
      const bg = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Battery ────────────────────────────────────────
      const batW = minDim * 0.08;
      const batH = minDim * 0.30;
      const batX = cx - batW / 2;
      const batY = cy - batH / 2;
      const batR = minDim * 0.008;
      const capH = minDim * 0.015;
      const capW = batW * 0.4;

      // Battery cap
      const shellCol = lerpColor(BATTERY_SHELL, s.primaryRgb, 0.03);
      ctx.fillStyle = rgba(shellCol, 0.06 * ent);
      ctx.fillRect(cx - capW / 2, batY - capH, capW, capH);

      // Battery shell
      ctx.beginPath();
      ctx.roundRect(batX, batY, batW, batH, batR);
      ctx.strokeStyle = rgba(shellCol, 0.06 * ent);
      ctx.lineWidth = minDim * 0.003;
      ctx.stroke();

      // Battery segments
      const segMargin = minDim * 0.004;
      const segH = (batH - segMargin * (BATTERY_SEGMENTS + 1)) / BATTERY_SEGMENTS;
      const filledSegs = Math.ceil(s.battery * BATTERY_SEGMENTS);

      for (let i = 0; i < BATTERY_SEGMENTS; i++) {
        const segIdx = BATTERY_SEGMENTS - 1 - i; // Bottom to top
        const sy = batY + segMargin + i * (segH + segMargin);
        const filled = segIdx < filledSegs;

        if (filled) {
          const t = s.battery;
          const segCol = lerpColor(BATTERY_LOW, BATTERY_FULL, t);
          const blended = lerpColor(segCol, s.accentRgb, 0.06);
          ctx.fillStyle = rgba(blended, 0.08 * ent);
          ctx.fillRect(batX + segMargin, sy, batW - segMargin * 2, segH);
        }
      }

      // Battery glow
      const glowR = minDim * 0.12 * (0.5 + s.battery * 0.5);
      const glowCol = lerpColor(BATTERY_GLOW, s.accentRgb, 0.08);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      const gA = 0.02 * s.battery * ent * (1 + p.breathAmplitude * 0.3);
      grad.addColorStop(0, rgba(glowCol, gA));
      grad.addColorStop(0.6, rgba(glowCol, gA * 0.3));
      grad.addColorStop(1, rgba(glowCol, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Drain flash
      if (s.drainFlash > 0.01) {
        const dCol = lerpColor(COST_TEXT, s.primaryRgb, 0.03);
        ctx.fillStyle = rgba(dCol, s.drainFlash * 0.04 * ent);
        ctx.fillRect(0, 0, w, h);
      }

      // ── Thoughts ───────────────────────────────────────
      const fontSize = Math.round(minDim * 0.016);
      const bubbleH = fontSize * 2.2;
      const bubblePadX = minDim * 0.025;

      for (const t of s.thoughts) {
        const a = t.tapped ? t.tapAlpha : t.alpha;
        if (a < 0.01) continue;

        // Bubble bg
        const tbg = lerpColor(THOUGHT_BG, s.primaryRgb, 0.02);
        ctx.fillStyle = rgba(tbg, 0.05 * a * ent);
        ctx.beginPath();
        ctx.roundRect(t.x, t.y - bubbleH / 2, t.width, bubbleH, minDim * 0.012);
        ctx.fill();

        // Thought text
        ctx.font = `300 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const ttc = t.tapped
          ? lerpColor(COST_TEXT, s.accentRgb, 0.05)
          : lerpColor(THOUGHT_TEXT, s.primaryRgb, 0.03);
        ctx.fillStyle = rgba(ttc, (t.tapped ? 0.06 : 0.05) * a * ent);
        ctx.fillText(t.text, t.x + bubblePadX, t.y);

        // Cost indicator when tapped
        if (t.tapped) {
          const costSize = Math.round(fontSize * 0.9);
          ctx.font = `500 ${costSize}px -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          const cc = lerpColor(COST_TEXT, s.accentRgb, 0.04);
          ctx.fillStyle = rgba(cc, 0.08 * t.tapAlpha * ent);
          ctx.fillText('-10%', t.x + t.width / 2, t.y - bubbleH * 0.7);
        }
      }

      // ── Percentage label ───────────────────────────────
      const pctSize = Math.round(minDim * 0.014);
      ctx.font = `300 ${pctSize}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const pctCol = lerpColor(BATTERY_SHELL, s.primaryRgb, 0.03);
      ctx.fillStyle = rgba(pctCol, 0.04 * ent);
      ctx.fillText(`${Math.round(s.battery * 100)}%`, cx, batY + batH + minDim * 0.02);

      // ── Hint ───────────────────────────────────────────
      if (s.frameCount > 180 && s.frameCount < 600 && !s.dead) {
        const hintSize = Math.round(minDim * 0.013);
        ctx.font = `300 ${hintSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        const hc = lerpColor(HINT_COL, s.primaryRgb, 0.03);
        ctx.fillStyle = rgba(hc, 0.03 * ent);
        ctx.fillText('let the thoughts pass', cx, h * 0.9);
      }

      // ── Dead state ─────────────────────────────────────
      if (s.dead) {
        const deadSize = Math.round(minDim * 0.018);
        ctx.font = `300 ${deadSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const dc = lerpColor(COST_TEXT, s.primaryRgb, 0.04);
        ctx.fillStyle = rgba(dc, 0.05 * ent);
        ctx.fillText('depleted', cx, h * 0.5 + batH);
      }

      // ── Resolved state ─────────────────────────────────
      if (s.resolved) {
        s.resolveAlpha = Math.min(1, s.resolveAlpha + 0.004);
        if (s.resolveAlpha > 0.2) {
          const rs = Math.round(minDim * 0.018);
          ctx.font = `200 ${rs}px -apple-system, 'Helvetica Neue', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const rc = lerpColor(BATTERY_FULL, s.accentRgb, 0.06);
          ctx.fillStyle = rgba(rc, easeOutExpo((s.resolveAlpha - 0.2) / 0.8) * 0.06 * ent);
          ctx.fillText('voltage preserved', cx, h * 0.88);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    let animId: number;
    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }} />
    </div>
  );
}