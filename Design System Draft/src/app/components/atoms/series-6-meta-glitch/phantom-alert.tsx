/**
 * ATOM 053: THE PHANTOM ALERT ENGINE (Dopamine Hijack)
 * =====================================================
 * Series 6 — Meta-System & Glitch · Position 3
 *
 * A red "1" badge. That's all it takes. The most powerful
 * psychological trigger in the modern world — a tiny red
 * circle with a number inside it. Your heart rate spikes
 * before your conscious mind even registers what happened.
 * Pavlov's bell, redesigned in San Francisco.
 *
 * This atom exploits that reflex to EXPOSE it. The canvas
 * starts quiet and still. Then: a cluster of phantom
 * notification badges materialises — red circles, each with
 * a number. They look REAL. They look URGENT.
 *
 * The user's autonomic system fires. Heart rate up.
 * Cortisol spike. The hand moves to tap.
 *
 * The moment a finger touches a badge: it disintegrates.
 * Particles of red dissolve downward like ash, pulled by
 * gravity. The badge falls apart with a hollow, deflating
 * haptic sigh. It was never real. The tiger was never real.
 *
 * As badges dissolve, text emerges:
 *   "See how your heart jumped?"
 *   "You are addicted to the alarm."
 *   "The tiger is not real."
 *
 * When all badges are dissolved: completion.
 *
 * VISUAL:
 *   1. Quiet field (2 seconds)
 *   2. Badges materialise (staggered, with urgency)
 *   3. Each touch → badge disintegrates into falling ash
 *   4. Text emerges as badges clear
 *   5. All clear → completion
 *
 * HAPTIC:
 *   Badge appears → entrance_land (the spike)
 *   Badge dissolved → tap (hollow deflation)
 *   All dissolved → completion
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: No particle dissolution — badges simply fade out.
 *   Faster materialisation.
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const BADGE_COUNT = 5;
const BADGE_RADIUS_FRAC = 0.025;    // Badge radius as fraction of minDim
const ASH_PARTICLES_PER_BADGE = 25;
const ASH_GRAVITY = 0.06;           // px/frame²
const APPEAR_DELAY_FRAMES = 120;    // ~2s before first badge
const BADGE_STAGGER_FRAMES = 20;    // Frames between each badge appearing

// Palette
const BG_DARK: RGB = [4, 4, 5];
const BADGE_RED: RGB = [210, 55, 45];
const BADGE_NUMBER: RGB = [255, 255, 255];
const BADGE_GLOW: RGB = [200, 50, 40];
const ASH_COLOR: RGB = [160, 60, 50];
const ASH_DARK: RGB = [70, 30, 25];
const REVEAL_TEXT: RGB = [140, 135, 120];
const EMPHASIS_TEXT: RGB = [160, 150, 125];
const LABEL_DIM: RGB = [55, 50, 45];

// =====================================================================
// DATA
// =====================================================================

interface Badge {
  x: number; y: number;
  number: number;         // The count displayed
  radius: number;
  alive: boolean;
  appeared: boolean;
  appearFrame: number;    // Frame when badge appears
  alpha: number;
  dissolveFrame: number;  // Frame when dissolved (for fade)
}

interface AshMote {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  color: RGB;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function PhantomAlertAtom({
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
    badges: [] as Badge[],
    ash: [] as AshMote[],
    allAppeared: false,
    allDissolved: false,
    dissolved: 0,
    resolved: false,
    firstAppearFired: false,
    revealAlpha: 0,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
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
    const cx = w / 2;
    const cy = h / 2;
    const badgeR = minDim * BADGE_RADIUS_FRAC;

    if (!s.initialized) {
      // Generate badge positions (clustered in upper-right quadrant like real notifications)
      const clusterCX = cx + minDim * 0.08;
      const clusterCY = cy - minDim * 0.05;
      const spread = minDim * 0.2;

      s.badges = Array.from({ length: BADGE_COUNT }, (_, i) => {
        const angle = (i / BADGE_COUNT) * Math.PI * 1.5 - Math.PI * 0.3;
        const dist = spread * (0.3 + Math.random() * 0.7);
        return {
          x: clusterCX + Math.cos(angle) * dist + (Math.random() - 0.5) * minDim * 0.04,
          y: clusterCY + Math.sin(angle) * dist + (Math.random() - 0.5) * minDim * 0.04,
          number: Math.floor(Math.random() * 12) + 1,
          radius: badgeR * (0.8 + Math.random() * 0.4),
          alive: true,
          appeared: false,
          appearFrame: APPEAR_DELAY_FRAMES + i * BADGE_STAGGER_FRAMES,
          alpha: 0,
          dissolveFrame: -1,
        };
      });
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

      // ── Badge appearance ───────────────────────��──────
      let anyNewAppeared = false;
      for (const badge of s.badges) {
        if (!badge.appeared && s.frameCount >= badge.appearFrame) {
          badge.appeared = true;
          anyNewAppeared = true;
        }
        if (badge.appeared && badge.alive) {
          badge.alpha = Math.min(1, badge.alpha + (p.reducedMotion ? 0.08 : 0.04));
        }
      }

      if (anyNewAppeared && !s.firstAppearFired) {
        s.firstAppearFired = true;
        cb.onHaptic('entrance_land');
      }

      // Check all appeared
      if (!s.allAppeared && s.badges.every(b => b.appeared)) {
        s.allAppeared = true;
      }

      // Reveal text after dissolution
      if (s.allDissolved) {
        s.revealAlpha = Math.min(1, s.revealAlpha + (p.reducedMotion ? 0.02 : 0.008));
        if (s.revealAlpha >= 0.95 && !s.resolved) {
          s.resolved = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // State metric
      const progress = s.allDissolved
        ? 0.7 + s.revealAlpha * 0.3
        : s.dissolved / BADGE_COUNT * 0.7;
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

      // ── Badges ─────────────────────────────────────────
      for (const badge of s.badges) {
        if (!badge.appeared) continue;

        let bAlpha = badge.alpha;

        // Dissolve fade (non-reduced-motion uses ash; reduced uses fade)
        if (!badge.alive) {
          if (p.reducedMotion) {
            const elapsed = s.frameCount - badge.dissolveFrame;
            bAlpha = Math.max(0, badge.alpha * (1 - elapsed / 30));
          } else {
            bAlpha = 0; // Particles handle the visual
            continue;
          }
          if (bAlpha <= 0) continue;
        }

        const badgeCol = lerpColor(BADGE_RED, s.primaryRgb, 0.02);

        // Badge glow (the urgency halo)
        const glowCol = lerpColor(BADGE_GLOW, s.primaryRgb, 0.03);
        const glowR = badge.radius * 3;
        const glowGrad = ctx.createRadialGradient(
          badge.x, badge.y, badge.radius * 0.5,
          badge.x, badge.y, glowR,
        );
        glowGrad.addColorStop(0, rgba(glowCol, 0.015 * bAlpha * ent));
        glowGrad.addColorStop(0.5, rgba(glowCol, 0.005 * bAlpha * ent));
        glowGrad.addColorStop(1, rgba(glowCol, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(badge.x - glowR, badge.y - glowR, glowR * 2, glowR * 2);

        // Badge circle
        ctx.beginPath();
        ctx.arc(badge.x, badge.y, badge.radius, 0, Math.PI * 2);
        ctx.fillStyle = rgba(badgeCol, 0.18 * bAlpha * ent);
        ctx.fill();

        // Badge number
        const numCol = lerpColor(BADGE_NUMBER, s.accentRgb, 0.01);
        const numSize = Math.round(badge.radius * 1.1);
        ctx.font = `600 ${numSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(numCol, 0.2 * bAlpha * ent);
        ctx.fillText(String(badge.number), badge.x, badge.y + minDim * 0.001);

        // Subtle pulse (urgency)
        if (badge.alive && !p.reducedMotion) {
          const pulse = Math.sin(s.frameCount * 0.06 + badge.x * 0.01) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(badge.x, badge.y, badge.radius * (1.1 + pulse * 0.15), 0, Math.PI * 2);
          ctx.strokeStyle = rgba(badgeCol, 0.03 * bAlpha * ent * pulse);
          ctx.lineWidth = minDim * 0.0008;
          ctx.stroke();
        }
      }

      // ── Ash particles ──────────────────────────────────
      for (let i = s.ash.length - 1; i >= 0; i--) {
        const mote = s.ash[i];
        mote.vy += ASH_GRAVITY;
        mote.x += mote.vx;
        mote.y += mote.vy;
        mote.vx *= 0.98;
        mote.alpha *= 0.985;

        if (mote.alpha < 0.003 || mote.y > h + minDim * 0.04) {
          s.ash.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = rgba(mote.color, mote.alpha * ent);
        ctx.fill();
      }

      // ── Reveal text ────────────────────────────────────
      if (s.revealAlpha > 0) {
        const revealLines = [
          'See how your heart jumped?',
          '',
          'You are addicted to the alarm.',
          '',
          'The tiger is not real.',
        ];

        const fontSize = Math.round(minDim * 0.022);
        const lineHeight = fontSize * 2.2;
        const blockH = revealLines.length * lineHeight;
        const startY = cy - blockH / 2;

        ctx.font = `200 ${fontSize}px -apple-system, 'Helvetica Neue', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < revealLines.length; i++) {
          if (!revealLines[i]) continue;

          // Stagger
          const lineDelay = i * 0.12;
          const lineT = Math.max(0, Math.min(1, (s.revealAlpha - lineDelay) / (1 - lineDelay)));
          const lineAlpha = easeOutExpo(lineT);

          const isLast = i === revealLines.length - 1;
          const col = isLast
            ? lerpColor(EMPHASIS_TEXT, s.accentRgb, 0.08)
            : lerpColor(REVEAL_TEXT, s.accentRgb, 0.04);
          const alpha = (isLast ? 0.08 : 0.055) * lineAlpha * ent;

          ctx.fillStyle = rgba(col, alpha);
          ctx.fillText(revealLines[i], cx, startY + i * lineHeight);
        }
      }

      // ── Pre-badge hint ─────────────────────────────────
      if (!s.allAppeared && s.frameCount < APPEAR_DELAY_FRAMES && s.frameCount > 40) {
        const hintAlpha = Math.min(0.02, (s.frameCount - 40) / 200 * 0.02) * ent;
        const hintCol = lerpColor(LABEL_DIM, s.primaryRgb, 0.04);
        const hintSize = Math.round(minDim * 0.014);
        ctx.font = `300 ${hintSize}px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(hintCol, hintAlpha);
        // Subtle breath coupling
        const breathOffset = p.reducedMotion ? 0 : p.breathAmplitude * minDim * 0.003;
        ctx.fillText('wait', cx, cy + breathOffset);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    // ── Native pointer handler ──────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;

      for (const badge of s.badges) {
        if (!badge.alive || !badge.appeared) continue;
        const dist = Math.hypot(px - badge.x, py - badge.y);
        if (dist < badge.radius * 2.5) {
          badge.alive = false;
          badge.dissolveFrame = s.frameCount;
          s.dissolved++;
          cbRef.current.onHaptic('tap');

          const p = propsRef.current;
          if (!p.reducedMotion) {
            for (let i = 0; i < ASH_PARTICLES_PER_BADGE; i++) {
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.3 + Math.random() * 1.5;
              const ashCol: RGB = Math.random() > 0.5
                ? lerpColor(ASH_COLOR, s.primaryRgb, 0.06)
                : lerpColor(ASH_DARK, s.primaryRgb, 0.04);
              s.ash.push({
                x: badge.x + (Math.random() - 0.5) * badge.radius,
                y: badge.y + (Math.random() - 0.5) * badge.radius,
                vx: Math.cos(angle) * speed * 0.5,
                vy: Math.sin(angle) * speed * -0.3 + 0.2,
                size: minDim * (0.001 + Math.random() * 0.005),
                alpha: 0.08 + Math.random() * 0.06,
                color: ashCol,
              });
            }
          }

          if (s.dissolved >= BADGE_COUNT && !s.resolved) {
            s.allDissolved = true;
          }
          break;
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