/**
 * ATOM 601: THE LINEAR STRIKE ENGINE
 * ====================================
 * Series 61 — Aikido Redirect · Position 1
 *
 * Cure defensive flinching. A head-on block fractures you.
 * Wait for the exact moment of impact and execute a smooth
 * horizontal swipe — the tangential force curves the threat
 * harmlessly off screen.
 *
 * PHYSICS:
 *   - Heavy vibrating red node shoots straight down Y-axis at core
 *   - Swiping straight up (blocking) causes brutal haptic crash
 *   - Wait until exact moment of impact → horizontal X-axis swipe
 *   - Tangential force curves threat trajectory off screen
 *   - Breath modulates the glow halo around user's core node
 *
 * INTERACTION:
 *   Swipe (horizontal at impact) → redirects threat
 *   Swipe (vertical / blocking)  → crashes and fractures UI
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static scene showing curved redirect path
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const THREAT_SPEED = 0.006;           // Y-axis descent speed per frame (fraction of h)
const THREAT_SIZE_FRAC = 0.04;        // Radius as fraction of minDim
const CORE_SIZE_FRAC = 0.025;         // User core radius
const VIBRATION_AMP = 0.003;          // Threat vibration amplitude
const REDIRECT_WINDOW = 0.12;         // Y-distance from core where swipe works
const SWIPE_THRESHOLD = 8;            // px to qualify as a swipe
const BLOCK_ANGLE_THRESH = Math.PI / 4; // < 45° from vertical = blocking
const CURVE_DURATION = 60;            // frames for the redirect curve animation
const FRACTURE_DURATION = 45;         // frames for the crash fracture animation
const RESPAWN_DELAY = 80;             // frames before next threat launches

// =====================================================================
// STATE
// =====================================================================

interface ThreatState {
  y: number;          // 0 = top, 1 = bottom (fraction of viewport)
  x: number;          // fraction of viewport width
  active: boolean;
  redirecting: boolean;
  redirectFrame: number;
  redirectDir: number; // -1 = left, 1 = right
  curveX: number;
  curveY: number;
  crashed: boolean;
  crashFrame: number;
}

function freshThreat(cx: number): ThreatState {
  return {
    y: -0.05,
    x: cx,
    active: true,
    redirecting: false,
    redirectFrame: 0,
    redirectDir: 1,
    curveX: cx,
    curveY: -0.05,
    crashed: false,
    crashFrame: 0,
  };
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function LinearStrikeRedirectAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  composed,
  onHaptic,
  onStateChange,
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
    threat: freshThreat(0.5),
    respawnTimer: 0,
    completions: 0,
    totalAttempts: 0,
    redirectWake: 0,
    // Swipe detection
    pointerDown: false,
    pointerStartX: 0,
    pointerStartY: 0,
    pointerStartTime: 0,
    // Fracture lines
    fractures: [] as { x1: number; y1: number; x2: number; y2: number; alpha: number }[],
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
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // ── Atmosphere ──────────────────────────────────
      if (!p.composed) {
        drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      }

      const coreY = h * 0.72;           // User core lives in lower third
      const coreX = cx;
      const coreR = px(CORE_SIZE_FRAC, minDim);
      const threatR = px(THREAT_SIZE_FRAC, minDim);
      s.redirectWake = Math.max(0, s.redirectWake - 0.018 * ms);

      // ── Threat physics ──────────────────────────────
      const t = s.threat;

      if (t.active && !t.redirecting && !t.crashed && !p.reducedMotion) {
        t.y += THREAT_SPEED;
        // Vibration
        const vib = Math.sin(s.frameCount * 0.7) * px(VIBRATION_AMP, minDim);
        t.x = 0.5 + vib / w;
      }

      // Check if threat reached core without being redirected
      if (t.active && !t.redirecting && !t.crashed && t.y * h >= coreY - threatR) {
        // Auto-crash if not swiped
        t.crashed = true;
        t.crashFrame = 0;
        s.totalAttempts++;
        cb.onHaptic('error_boundary');
        // Generate fracture lines
        s.fractures = [];
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
          const len = minDim * (0.08 + Math.random() * 0.15);
          s.fractures.push({
            x1: coreX, y1: coreY,
            x2: coreX + Math.cos(angle) * len,
            y2: coreY + Math.sin(angle) * len,
            alpha: 0.6 + Math.random() * 0.4,
          });
        }
      }

      // ── Redirect animation ──────────────────────────
      if (t.redirecting) {
        t.redirectFrame++;
        const prog = Math.min(1, t.redirectFrame / CURVE_DURATION);
        const easedProg = easeOutExpo(prog);
        // Bezier-like curve: starts at impact point, arcs out horizontally
        t.curveX = (0.5 + t.redirectDir * easedProg * 0.7) * w;
        t.curveY = coreY - threatR + (prog * prog - 2 * prog) * h * 0.3; // slight upward arc
        if (prog >= 1) {
          t.active = false;
          s.respawnTimer = RESPAWN_DELAY;
          s.redirectWake = 1;
          s.completions++;
          cb.onHaptic('completion');
          cb.onStateChange?.(Math.min(1, s.completions / 3));
        }
      }

      // ── Crash animation ─────────────────────────────
      if (t.crashed) {
        t.crashFrame++;
        if (t.crashFrame >= FRACTURE_DURATION) {
          t.active = false;
          s.respawnTimer = RESPAWN_DELAY;
          s.fractures = [];
        }
      }

      // ── Respawn timer ───────────────────────────────
      if (!t.active) {
        s.respawnTimer--;
        if (s.respawnTimer <= 0 && p.phase !== 'resolve') {
          s.threat = freshThreat(0.5);
          s.redirectWake = 0;
        }
      }

      // ── Draw user core ──────────────────────────────
      const coreBreathR = coreR * (1 + breath * 0.12);
      const wakeProgress = t.redirecting
        ? Math.min(1, t.redirectFrame / CURVE_DURATION)
        : s.redirectWake;

      if (wakeProgress > 0.001) {
        const clearanceAlpha = ALPHA.background.min * (1.8 + wakeProgress) * entrance;
        const corridorWidth = minDim * (0.18 + wakeProgress * 0.16);
        const exitX = coreX + t.redirectDir * w * 0.62;
        const exitY = coreY - h * (0.05 + wakeProgress * 0.12);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(coreX, coreY - threatR * 1.4);
        ctx.quadraticCurveTo(
          coreX + t.redirectDir * w * 0.18,
          coreY - h * 0.18,
          exitX,
          exitY,
        );
        ctx.lineWidth = corridorWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba(s.primaryRgb, clearanceAlpha);
        ctx.stroke();
        ctx.restore();

        for (const sign of [-1, 1]) {
          const laneOffset = corridorWidth * (0.22 + sign * 0.14);
          ctx.beginPath();
          ctx.moveTo(coreX, coreY - threatR * 1.4 + laneOffset * 0.08);
          ctx.quadraticCurveTo(
            coreX + t.redirectDir * w * 0.16,
            coreY - h * 0.16 + laneOffset * 0.08,
            exitX,
            exitY + laneOffset * 0.12,
          );
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.26 * wakeProgress * entrance);
          ctx.lineWidth = px(0.0014, minDim);
          ctx.stroke();
        }
      }

      // Core glow
      const coreGlow = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreBreathR * 4);
      coreGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.5 * entrance));
      coreGlow.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.min * entrance));
      coreGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = coreGlow;
      ctx.fillRect(coreX - coreBreathR * 4, coreY - coreBreathR * 4, coreBreathR * 8, coreBreathR * 8);

      // Core node
      ctx.beginPath();
      ctx.arc(coreX, coreY, coreBreathR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── Draw threat node ────────────────────────────
      if (t.active) {
        let tx: number, ty: number;
        if (t.redirecting) {
          tx = t.curveX;
          ty = t.curveY;
        } else {
          tx = t.x * w;
          ty = t.y * h;
        }

        const threatAlpha = t.crashed
          ? ALPHA.content.max * Math.max(0, 1 - t.crashFrame / FRACTURE_DURATION) * entrance
          : ALPHA.content.max * entrance;

        // Threat glow (warning)
        const threatGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, threatR * 3);
        threatGlow.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.4 * entrance));
        threatGlow.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = threatGlow;
        ctx.fillRect(tx - threatR * 3, ty - threatR * 3, threatR * 6, threatR * 6);

        // Threat body
        ctx.beginPath();
        ctx.arc(tx, ty, threatR * (t.crashed ? (1 + t.crashFrame * 0.02) : 1), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, threatAlpha);
        ctx.fill();

        // ── Redirect trail ────────────────────────────
        if (t.redirecting && t.redirectFrame > 2) {
          const trailAlpha = ALPHA.atmosphere.max * (1 - t.redirectFrame / CURVE_DURATION) * entrance;
          ctx.beginPath();
          ctx.moveTo(coreX, coreY - threatR);
          ctx.quadraticCurveTo(
            coreX + t.redirectDir * w * 0.2, coreY - h * 0.15,
            t.curveX, t.curveY,
          );
          ctx.strokeStyle = rgba(s.accentRgb, trailAlpha);
          ctx.lineWidth = px(0.002, minDim);
          ctx.stroke();
        }
      }

      // ── Draw fracture lines (crash state) ───────────
      if (t.crashed && s.fractures.length > 0) {
        const crashAlpha = Math.max(0, 1 - t.crashFrame / FRACTURE_DURATION);
        for (const f of s.fractures) {
          ctx.beginPath();
          ctx.moveTo(f.x1, f.y1);
          ctx.lineTo(f.x2, f.y2);
          ctx.strokeStyle = rgba(s.accentRgb, f.alpha * crashAlpha * entrance);
          ctx.lineWidth = px(0.001, minDim);
          ctx.stroke();
        }
      }

      // ── Redirect window indicator ───────────────────
      if (t.active && !t.redirecting && !t.crashed) {
        const windowTop = coreY - h * REDIRECT_WINDOW;
        const windowBot = coreY;
        const inWindow = t.y * h >= windowTop && t.y * h <= windowBot;
        if (inWindow) {
          // Subtle horizontal line showing "swipe zone"
          const zoneAlpha = ALPHA.atmosphere.min * entrance * (0.5 + 0.5 * Math.sin(s.frameCount * 0.1 * ms));
          ctx.beginPath();
          ctx.moveTo(cx - minDim * 0.15, coreY - threatR * 1.5);
          ctx.lineTo(cx + minDim * 0.15, coreY - threatR * 1.5);
          ctx.strokeStyle = rgba(s.primaryRgb, zoneAlpha);
          ctx.lineWidth = px(0.0008, minDim);
          ctx.setLineDash([px(0.005, minDim), px(0.005, minDim)]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // ── Reduced motion fallback ─────────────────────
      if (p.reducedMotion) {
        // Draw a static curved redirect path
        ctx.beginPath();
        ctx.moveTo(cx, h * 0.15);
        ctx.lineTo(cx, coreY - threatR * 2);
        ctx.quadraticCurveTo(cx, coreY - threatR, cx + minDim * 0.3, coreY - threatR - h * 0.1);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(0.0015, minDim);
        ctx.stroke();

        // Arrow head at curve end
        const arrowX = cx + minDim * 0.3;
        const arrowY = coreY - threatR - h * 0.1;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - px(0.01, minDim), arrowY - px(0.008, minDim));
        ctx.lineTo(arrowX - px(0.006, minDim), arrowY + px(0.006, minDim));
        ctx.closePath();
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      // ── Resolve phase wind-down ─────────────────────
      if (p.phase === 'resolve' && t.active && !t.redirecting) {
        // Gracefully slow threat
        t.y = Math.max(t.y - 0.001, -0.1);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointerDown = true;
      s.pointerStartX = e.clientX;
      s.pointerStartY = e.clientY;
      s.pointerStartTime = performance.now();
      canvas.setPointerCapture(e.pointerId);
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerDown) return;
      s.pointerDown = false;
      canvas.releasePointerCapture(e.pointerId);

      const dx = e.clientX - s.pointerStartX;
      const dy = e.clientY - s.pointerStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < SWIPE_THRESHOLD) return; // Not a swipe

      const angle = Math.atan2(Math.abs(dy), Math.abs(dx));
      const t = s.threat;

      if (!t.active || t.redirecting || t.crashed) return;

      const { h } = { h: viewport.height };
      const coreYPos = h * 0.72;
      const threatYPos = t.y * h;
      const inWindow = threatYPos >= coreYPos - h * REDIRECT_WINDOW && threatYPos <= coreYPos;

      if (!inWindow) return;

      // Determine if it's a block (vertical) or redirect (horizontal)
      if (angle > BLOCK_ANGLE_THRESH) {
        // Vertical swipe = blocking → CRASH
        t.crashed = true;
        t.crashFrame = 0;
        s.totalAttempts++;
        callbacksRef.current.onHaptic('error_boundary');
        s.fractures = [];
        const rect = canvas.getBoundingClientRect();
        const coreX = rect.width / 2;
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
          const len = Math.min(rect.width, rect.height) * (0.08 + Math.random() * 0.15);
          s.fractures.push({
            x1: coreX, y1: coreYPos,
            x2: coreX + Math.cos(a) * len,
            y2: coreYPos + Math.sin(a) * len,
            alpha: 0.6 + Math.random() * 0.4,
          });
        }
      } else {
        // Horizontal swipe = REDIRECT
        t.redirecting = true;
        t.redirectFrame = 0;
        t.redirectDir = dx > 0 ? 1 : -1;
        t.curveX = t.x * viewport.width;
        t.curveY = t.y * h;
        s.totalAttempts++;
        callbacksRef.current.onHaptic('swipe_commit');
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
          cursor: 'grab',
        }}
      />
    </div>
  );
}
