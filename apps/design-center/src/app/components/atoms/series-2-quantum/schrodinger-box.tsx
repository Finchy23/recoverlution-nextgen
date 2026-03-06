/**
 * ATOM 012: THE SCHRÖDINGER BOX ENGINE
 * ======================================
 * Series 2 — Quantum Mechanics · Position 2
 *
 * The ego demands immediate certainty. This atom trains the
 * nervous system to hold two completely contradictory outcomes
 * in superposition until the moment action is required.
 *
 * A luminous crystalline container floats center-screen.
 * Inside it, two contradictory states orbit in a Lissajous
 * figure-8 — simultaneously Challenge (warm) and Comfort (cool).
 * They don't flicker; they genuinely coexist via additive blending.
 *
 * PHYSICS:
 *   - Two state-orbs tracing a Lissajous superposition pattern
 *   - Orbital speed = uncertainty (starts fast, slows with observation)
 *   - Container shell with wavefunction probability shimmer
 *   - Tap initiates deceleration (measurement begins)
 *   - Sustained hold collapses to one state (coin slaps flat)
 *   - The "frantic toss" → sudden slam haptic
 *   - Observable: the longer paradox is held, the richer the insight
 *
 * INTERACTION:
 *   Observable      → superposition plays indefinitely
 *   Tap             → begin deceleration (measurement)
 *   Hold (sustained)→ collapse to one state
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static superposition, no orbital animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Container radius as fraction of min dimension */
const CONTAINER_RADIUS_FRAC = 0.22;
/** Container edge segments (hexagonal crystal) */
const CONTAINER_SIDES = 6;
/** Orb radius as fraction of container */
const ORB_RADIUS_FRAC = 0.18;
/** Starting orbital frequency (radians/frame) */
const INITIAL_ORBITAL_SPEED = 0.035;
/** Deceleration rate per frame after measurement starts */
const DECEL_RATE = 0.00012;
/** Random jitter range on deceleration so repeated clicks yield different outcomes */
const DECEL_JITTER = 0.00004;
/** Speed below which collapse snaps */
const COLLAPSE_SPEED_THRESHOLD = 0.004;
/** Lissajous frequency ratio (creates the figure-8) */
const LISSAJOUS_RATIO = 2;
/** Wavefunction shimmer points on container shell */
const SHELL_SHIMMER_POINTS = 48;
/** Superposition time before natural collapse (frames, ~15 sec) */
const NATURAL_COLLAPSE_FRAMES = 900;
/** Post-collapse delay before replay prompt appears (frames, ~2 sec) */
const REPLAY_DELAY_FRAMES = 120;
/** Replay prompt fade-in duration (frames) */
const REPLAY_FADE_FRAMES = 60;
/** Replay prompt ring radius as fraction of container radius */
const REPLAY_RING_FRAC = 0.35;

// =====================================================================
// COLOR
// =====================================================================

// Superposition palette
const CHALLENGE_WARM: RGB = [230, 120, 80];    // Warm amber-red
const COMFORT_COOL: RGB = [80, 140, 230];      // Cool serene blue
const SHELL_COLOR: RGB = [120, 110, 160];       // Container crystal
const COLLAPSED_GLOW: RGB = [200, 200, 240];   // Post-collapse radiance

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SchrodingerBoxAtom({
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

  const stateRef = useRef({
    // Orbital state
    orbitalPhase: 0,
    orbitalSpeed: INITIAL_ORBITAL_SPEED,
    decelJitter: 0,
    // Measurement state
    measurementStarted: false,
    isHolding: false,
    holdFrames: 0,
    superpositionFrames: 0,
    // Collapse
    collapsed: false,
    collapsePhase: 0, // 0-1, where in the orbit it collapsed
    collapsedState: 0, // 0 = challenge, 1 = comfort
    collapseProgress: 0, // 0-1 transition to collapsed visual
    // Replay
    postCollapseFrames: 0,
    replayFade: 0,
    // Shell
    shellShimmerPhase: 0,
    // Entrance
    entranceProgress: 0,
    frameCount: 0,
    // Colors
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
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

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.collapsed && s.replayFade > 0.3) {
        s.orbitalPhase = Math.random() * Math.PI * 2;
        s.orbitalSpeed = INITIAL_ORBITAL_SPEED;
        s.decelJitter = (Math.random() - 0.5) * 2 * DECEL_JITTER;
        s.measurementStarted = false;
        s.isHolding = false;
        s.holdFrames = 0;
        s.superpositionFrames = 0;
        s.collapsed = false;
        s.collapsePhase = 0;
        s.collapsedState = 0;
        s.collapseProgress = 0;
        s.postCollapseFrames = 0;
        s.replayFade = 0;
        callbacksRef.current.onHaptic('tap');
        canvas.setPointerCapture(e.pointerId);
        return;
      }

      if (s.collapsed) return;

      s.isHolding = true;
      s.holdFrames = 0;

      if (!s.measurementStarted) {
        s.measurementStarted = true;
        s.decelJitter = (Math.random() - 0.5) * 2 * DECEL_JITTER;
        callbacksRef.current.onHaptic('tap');
      }

      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.isHolding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const s = stateRef.current;
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

      const cx = w / 2;
      const cy = h / 2;
      const containerR = minDim * CONTAINER_RADIUS_FRAC;
      const orbR = containerR * ORB_RADIUS_FRAC;

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Superposition time tracking ───────────────────
      if (!s.collapsed) {
        s.superpositionFrames++;
      }

      // ── Orbital physics ───────────────────────────────
      if (!p.reducedMotion && !s.collapsed) {
        s.orbitalPhase += s.orbitalSpeed;

        // Deceleration after measurement
        if (s.measurementStarted) {
          const decelMult = s.isHolding ? 3 : 1;
          s.orbitalSpeed = Math.max(0, s.orbitalSpeed - (DECEL_RATE + s.decelJitter) * decelMult);

          // Snap collapse when slow enough
          if (s.orbitalSpeed < COLLAPSE_SPEED_THRESHOLD) {
            s.collapsed = true;
            s.collapsePhase = s.orbitalPhase;
            // Determine which state "won" based on orbital position
            const orbNorm = ((s.orbitalPhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            s.collapsedState = orbNorm < Math.PI ? 0 : 1;
            cb.onHaptic('completion');
            cb.onResolve?.();
          }
        }

        // Natural slow-down over extended superposition
        if (!s.measurementStarted && s.superpositionFrames > NATURAL_COLLAPSE_FRAMES) {
          s.orbitalSpeed = Math.max(
            INITIAL_ORBITAL_SPEED * 0.4,
            s.orbitalSpeed - 0.000005,
          );
        }
      }

      // Collapse transition
      if (s.collapsed) {
        s.collapseProgress = Math.min(1, s.collapseProgress + 0.012);
        s.postCollapseFrames++;
        // Fade in replay prompt after delay
        if (s.postCollapseFrames > REPLAY_DELAY_FRAMES) {
          s.replayFade = Math.min(1, s.replayFade + 1 / REPLAY_FADE_FRAMES);
        }
      }

      // ── Shell shimmer ─────────────────────────────────
      if (!p.reducedMotion) {
        s.shellShimmerPhase += 0.02;
      }

      // ── State reporting ───────────────────────────────
      // Report orbital speed normalized (1 = full superposition, 0 = collapsed)
      const speedNorm = s.collapsed ? 0 : Math.min(1, s.orbitalSpeed / INITIAL_ORBITAL_SPEED);
      cb.onStateChange?.(speedNorm);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background ────────────────────────────────────
      const bgBase = lerpColor([6, 4, 14], s.primaryRgb, 0.03);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgBase, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgBase, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle radial atmosphere
      const atmGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
      atmGrad.addColorStop(0, rgba(lerpColor(s.primaryRgb, [20, 15, 35], 0.7), 0.04 * entrance));
      atmGrad.addColorStop(1, rgba(bgBase, 0));
      ctx.fillStyle = atmGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Compute orb positions ─────────────────────────
      const orbitalR = containerR * 0.55;
      const phase1 = s.collapsed ? s.collapsePhase : s.orbitalPhase;
      const phase2 = phase1 + Math.PI; // Opposite in superposition

      // Lissajous figure-8 path
      const orb1x = cx + Math.sin(phase1) * orbitalR;
      const orb1y = cy + Math.sin(phase1 * LISSAJOUS_RATIO) * orbitalR * 0.5;
      const orb2x = cx + Math.sin(phase2) * orbitalR;
      const orb2y = cy + Math.sin(phase2 * LISSAJOUS_RATIO) * orbitalR * 0.5;

      // ── Container shell (hexagonal crystal) ───────────
      const shellColor = lerpColor(SHELL_COLOR, s.primaryRgb, 0.2);

      // Wavefunction shimmer on shell
      ctx.beginPath();
      for (let i = 0; i <= CONTAINER_SIDES; i++) {
        const angle = (i / CONTAINER_SIDES) * Math.PI * 2 - Math.PI / 6;
        const shimmer = p.reducedMotion ? 0 :
          Math.sin(angle * 3 + s.shellShimmerPhase) * containerR * 0.02;
        const r = containerR + shimmer;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Shell fill — very subtle glass
      const shellGrad = ctx.createRadialGradient(
        cx - containerR * 0.15, cy - containerR * 0.15, 0,
        cx, cy, containerR,
      );
      shellGrad.addColorStop(0, rgba(shellColor, 0.03 * entrance));
      shellGrad.addColorStop(0.7, rgba(shellColor, 0.015 * entrance));
      shellGrad.addColorStop(1, rgba(shellColor, 0.005 * entrance));
      ctx.fillStyle = shellGrad;
      ctx.fill();

      // Shell edge
      ctx.strokeStyle = rgba(shellColor, 0.12 * entrance);
      ctx.lineWidth = minDim * 0.002;
      ctx.stroke();

      // Shell shimmer points
      if (!p.reducedMotion) {
        for (let i = 0; i < SHELL_SHIMMER_POINTS; i++) {
          const angle = (i / SHELL_SHIMMER_POINTS) * Math.PI * 2;
          const shimVal = Math.sin(angle * 5 + s.shellShimmerPhase * 1.5 + i * 0.3);
          if (shimVal < 0.5) continue;
          const shimAlpha = (shimVal - 0.5) * 0.15 * entrance;
          const shimR = containerR + Math.sin(angle * 3 + s.shellShimmerPhase) * containerR * 0.02;
          const sx = cx + Math.cos(angle) * shimR;
          const sy = cy + Math.sin(angle) * shimR;
          ctx.beginPath();
          ctx.arc(sx, sy, minDim * 0.0024, 0, Math.PI * 2);
          ctx.fillStyle = rgba(lerpColor(shellColor, [255, 255, 255], 0.5), shimAlpha);
          ctx.fill();
        }
      }

      // ── Lissajous trail (ghostly path) ────────────────
      if (!p.reducedMotion && !s.collapsed && s.orbitalSpeed > 0.005) {
        ctx.beginPath();
        const trailSteps = 80;
        for (let i = 0; i <= trailSteps; i++) {
          const t = (i / trailSteps) * Math.PI * 2;
          const tx = cx + Math.sin(t) * orbitalR;
          const ty = cy + Math.sin(t * LISSAJOUS_RATIO) * orbitalR * 0.5;
          if (i === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        }
        ctx.closePath();
        ctx.strokeStyle = rgba(shellColor, 0.04 * entrance);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }

      // ── The two state orbs ────────���───────────────────
      const collapseT = s.collapseProgress;
      const winner = s.collapsedState;

      // Orb 1: Challenge (warm)
      const o1Alpha = s.collapsed
        ? (winner === 0 ? 0.5 + collapseT * 0.3 : 0.5 * (1 - collapseT))
        : 0.5;
      const o1Size = s.collapsed
        ? (winner === 0 ? orbR * (1 + collapseT * 0.6) : orbR * (1 - collapseT * 0.5))
        : orbR;
      const o1Color = lerpColor(CHALLENGE_WARM, s.accentRgb, 0.15);

      // Orb glow
      const glow1R = o1Size * 4;
      const glow1Grad = ctx.createRadialGradient(orb1x, orb1y, 0, orb1x, orb1y, glow1R);
      glow1Grad.addColorStop(0, rgba(o1Color, o1Alpha * 0.15 * entrance));
      glow1Grad.addColorStop(0.4, rgba(o1Color, o1Alpha * 0.04 * entrance));
      glow1Grad.addColorStop(1, rgba(o1Color, 0));
      ctx.fillStyle = glow1Grad;
      ctx.fillRect(orb1x - glow1R, orb1y - glow1R, glow1R * 2, glow1R * 2);

      // Orb body
      const orb1Grad = ctx.createRadialGradient(
        orb1x - o1Size * 0.2, orb1y - o1Size * 0.2, o1Size * 0.1,
        orb1x, orb1y, o1Size,
      );
      orb1Grad.addColorStop(0, rgba(lerpColor(o1Color, [255, 255, 255], 0.2), o1Alpha * entrance));
      orb1Grad.addColorStop(0.6, rgba(o1Color, o1Alpha * 0.7 * entrance));
      orb1Grad.addColorStop(1, rgba(o1Color, o1Alpha * 0.15 * entrance));
      ctx.beginPath();
      ctx.arc(orb1x, orb1y, Math.max(0.5, o1Size), 0, Math.PI * 2);
      ctx.fillStyle = orb1Grad;
      ctx.fill();

      // Orb 2: Comfort (cool)
      const o2Alpha = s.collapsed
        ? (winner === 1 ? 0.5 + collapseT * 0.3 : 0.5 * (1 - collapseT))
        : 0.5;
      const o2Size = s.collapsed
        ? (winner === 1 ? orbR * (1 + collapseT * 0.6) : orbR * (1 - collapseT * 0.5))
        : orbR;
      const o2Color = lerpColor(COMFORT_COOL, s.primaryRgb, 0.15);

      // Orb glow
      const glow2R = o2Size * 4;
      const glow2Grad = ctx.createRadialGradient(orb2x, orb2y, 0, orb2x, orb2y, glow2R);
      glow2Grad.addColorStop(0, rgba(o2Color, o2Alpha * 0.15 * entrance));
      glow2Grad.addColorStop(0.4, rgba(o2Color, o2Alpha * 0.04 * entrance));
      glow2Grad.addColorStop(1, rgba(o2Color, 0));
      ctx.fillStyle = glow2Grad;
      ctx.fillRect(orb2x - glow2R, orb2y - glow2R, glow2R * 2, glow2R * 2);

      // Orb body
      const orb2Grad = ctx.createRadialGradient(
        orb2x - o2Size * 0.2, orb2y - o2Size * 0.2, o2Size * 0.1,
        orb2x, orb2y, o2Size,
      );
      orb2Grad.addColorStop(0, rgba(lerpColor(o2Color, [255, 255, 255], 0.2), o2Alpha * entrance));
      orb2Grad.addColorStop(0.6, rgba(o2Color, o2Alpha * 0.7 * entrance));
      orb2Grad.addColorStop(1, rgba(o2Color, o2Alpha * 0.15 * entrance));
      ctx.beginPath();
      ctx.arc(orb2x, orb2y, Math.max(0.5, o2Size), 0, Math.PI * 2);
      ctx.fillStyle = orb2Grad;
      ctx.fill();

      // ── Superposition interference zone ───────────────
      // Where the two orbs overlap, show additive blend
      if (!s.collapsed) {
        const overlapDx = orb2x - orb1x;
        const overlapDy = orb2y - orb1y;
        const overlapDist = Math.sqrt(overlapDx * overlapDx + overlapDy * overlapDy);
        const maxOverlap = orbR * 2;

        if (overlapDist < maxOverlap) {
          const overlapStrength = (1 - overlapDist / maxOverlap);
          const midX = (orb1x + orb2x) / 2;
          const midY = (orb1y + orb2y) / 2;
          const interR = orbR * overlapStrength * 1.5;

          const interGrad = ctx.createRadialGradient(midX, midY, 0, midX, midY, interR);
          const interColor = lerpColor(CHALLENGE_WARM, COMFORT_COOL, 0.5);
          interGrad.addColorStop(0, rgba(lerpColor(interColor, [255, 255, 255], 0.3),
            overlapStrength * 0.2 * entrance));
          interGrad.addColorStop(1, rgba(interColor, 0));
          ctx.fillStyle = interGrad;
          ctx.fillRect(midX - interR, midY - interR, interR * 2, interR * 2);
        }
      }

      // ── Collapsed state glow ──────────────────────────
      if (collapseT > 0.3) {
        const glowAlpha = (collapseT - 0.3) * 0.1 * entrance;
        const pulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.025));
        const collGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, containerR);
        const collGlowColor = lerpColor(COLLAPSED_GLOW, s.accentRgb, 0.15);
        collGrad.addColorStop(0, rgba(collGlowColor, glowAlpha * pulse));
        collGrad.addColorStop(0.5, rgba(s.primaryRgb, glowAlpha * 0.3 * pulse));
        collGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = collGrad;
        ctx.fillRect(cx - containerR, cy - containerR, containerR * 2, containerR * 2);
      }

      // ── Speed indicator (deceleration visualization) ──
      if (s.measurementStarted && !s.collapsed) {
        // Subtle arc showing remaining orbital energy
        const arcAngle = speedNorm * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, containerR + minDim * 0.025, -Math.PI / 2, -Math.PI / 2 + arcAngle);
        ctx.strokeStyle = rgba(shellColor, 0.1 * entrance);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }

      // ── Replay prompt ─────────────────────────────────
      if (s.replayFade > 0) {
        const rf = s.replayFade;
        const replayR = containerR * REPLAY_RING_FRAC;
        const replayPulse = p.reducedMotion ? 1 : (0.85 + 0.15 * Math.sin(s.frameCount * 0.04));
        const promptAlpha = rf * replayPulse * entrance;

        // Circular "observe again" ring
        ctx.beginPath();
        ctx.arc(cx, cy, replayR, 0, Math.PI * 2);
        const replayColor = lerpColor(shellColor, s.accentRgb, 0.3);
        ctx.strokeStyle = rgba(replayColor, promptAlpha * 0.25);
        ctx.lineWidth = minDim * 0.004;
        ctx.stroke();

        // Rotating arrow hint (two small arcs with arrow heads)
        const arrowAngle = p.reducedMotion ? 0 : s.frameCount * 0.015;
        for (let a = 0; a < 2; a++) {
          const startA = arrowAngle + a * Math.PI;
          const endA = startA + Math.PI * 0.4;
          ctx.beginPath();
          ctx.arc(cx, cy, replayR, startA, endA);
          ctx.strokeStyle = rgba(replayColor, promptAlpha * 0.35);
          ctx.lineWidth = minDim * 0.005;
          ctx.stroke();

          // Arrow head
          const headX = cx + Math.cos(endA) * replayR;
          const headY = cy + Math.sin(endA) * replayR;
          const tangentAngle = endA + Math.PI / 2;
          const headLen = minDim * 0.015;
          ctx.beginPath();
          ctx.moveTo(headX, headY);
          ctx.lineTo(
            headX + Math.cos(tangentAngle + Math.PI * 0.75) * headLen,
            headY + Math.sin(tangentAngle + Math.PI * 0.75) * headLen,
          );
          ctx.moveTo(headX, headY);
          ctx.lineTo(
            headX + Math.cos(tangentAngle - Math.PI * 0.75) * headLen,
            headY + Math.sin(tangentAngle - Math.PI * 0.75) * headLen,
          );
          ctx.strokeStyle = rgba(replayColor, promptAlpha * 0.35);
          ctx.lineWidth = minDim * 0.003;
          ctx.stroke();
        }

        // "Observe again" text
        const fontSize = minDim * 0.028;
        ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(replayColor, promptAlpha * 0.4);
        ctx.fillText('observe again', cx, cy + replayR + fontSize * 1.8);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}