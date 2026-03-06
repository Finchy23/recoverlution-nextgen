/**
 * ATOM 644: THE PATH OF LEAST RESISTANCE ENGINE
 * ================================================
 * Series 65 — The Slipstream · Position 4
 *
 * Prove intelligence beats force. Double-tap to liquefy your
 * rigid node — the fluid seeks microscopic cracks in the
 * impenetrable dam, seeping effortlessly through.
 *
 * SIGNATURE TECHNIQUE: Aerodynamic streamlines — fluid particles
 * finding micro-channels through solid geometry, reforming on the
 * other side as coherent streamlines.
 *
 * PHYSICS:
 *   - Massive solid dam blocks the entire Y-axis
 *   - Rigid node crashes with warning haptics when pushed into dam
 *   - Double-tap to change state: solid → fluid (liquefaction)
 *   - Fluid particles seek invisible micro-cracks in dam geometry
 *   - Particles seep through, reform on other side
 *   - Fluid reassembles into node shape beyond the dam
 *
 * INTERACTION: Tap (double-tap liquefies) → fluid seeps through dam
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static fluid diagram
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const NODE_RADIUS     = 0.022;
const DAM_X           = 0.5;           // dam center X position
const DAM_WIDTH       = 0.035;         // dam thickness fraction
const DAM_HEIGHT      = 0.9;           // dam covers 90% of viewport
const CRACK_COUNT     = 7;             // micro-cracks in dam
const FLUID_PARTICLE  = 45;            // particle count when liquefied
const SEEP_SPEED      = 0.0015;        // seep velocity through cracks
const REFORM_SPEED    = 0.015;         // reassembly speed
const CRASH_SHAKE_AMP = 0.008;         // crash shake amplitude
const CRASH_DURATION  = 30;            // frames of crash animation
const GLOW_R_NODE     = 0.08;
const RESPAWN_DELAY   = 100;

// =====================================================================
// STATE
// =====================================================================

interface CrackDef { y: number; width: number; }

interface FluidParticle {
  x: number; y: number;
  targetCrack: number;    // which crack to seep through
  phase: 'seek' | 'seep' | 'reform';
  speed: number;
}

interface DamState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  nodeY: number;
  isFluid: boolean;
  particles: FluidParticle[];
  cracks: CrackDef[];
  crashTimer: number;
  seepProgress: number;    // 0-1 overall progress
  reformProgress: number;
  completed: boolean;
  respawnTimer: number;
  tapTime: number;         // last tap timestamp
}

function makeCracks(): CrackDef[] {
  const cracks: CrackDef[] = [];
  for (let i = 0; i < CRACK_COUNT; i++) {
    cracks.push({
      y: 0.1 + (i / (CRACK_COUNT - 1)) * 0.8,
      width: 0.002 + Math.random() * 0.004,
    });
  }
  return cracks;
}

function freshState(color: string, accent: string): DamState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accent),
    nodeX: 0.25, nodeY: 0.5,
    isFluid: false, particles: [],
    cracks: makeCracks(),
    crashTimer: 0, seepProgress: 0, reformProgress: 0,
    completed: false, respawnTimer: 0, tapTime: 0,
  };
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function PathLeastResistanceAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef     = useRef({ onHaptic, onStateChange });
  const propsRef  = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef(freshState(color, accentColor));

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb  = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s  = stateRef.current;
      const p  = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);
      const damCx = DAM_X * w;
      const damHalfW = DAM_WIDTH * w / 2;

      // ── LAYER 1: Atmosphere ─────────────────────────────────────
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        if (s.crashTimer > 0) s.crashTimer--;

        if (s.isFluid && s.particles.length > 0) {
          let seeped = 0;
          let reformed = 0;
          for (const pt of s.particles) {
            const crack = s.cracks[pt.targetCrack];
            if (pt.phase === 'seek') {
              // Move toward crack entrance
              const targetX = damCx - damHalfW;
              const targetY = crack.y * h;
              pt.x += (targetX - pt.x) * 0.04;
              pt.y += (targetY - pt.y) * 0.04;
              if (Math.abs(pt.x - targetX) < 2 && Math.abs(pt.y - targetY) < 2) {
                pt.phase = 'seep';
              }
            } else if (pt.phase === 'seep') {
              pt.x += pt.speed * w;
              if (pt.x > damCx + damHalfW + 5) {
                pt.phase = 'reform';
                seeped++;
              }
            } else {
              // Reform into node shape on the right
              const targetX = 0.75 * w;
              const targetY = cy;
              pt.x += (targetX - pt.x) * REFORM_SPEED;
              pt.y += (targetY - pt.y) * REFORM_SPEED;
              if (Math.abs(pt.x - targetX) < 3 && Math.abs(pt.y - targetY) < 3) reformed++;
            }
          }
          s.seepProgress = seeped / s.particles.length;
          s.reformProgress = reformed / s.particles.length;
          cb.onStateChange?.(s.seepProgress * 0.5 + s.reformProgress * 0.5);

          if (s.reformProgress > 0.9) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }
      }

      // ── LAYER 2: Background pressure lines (left side) ─────────
      for (let i = 0; i < 8; i++) {
        const lx = w * 0.05 + i * (damCx - damHalfW - w * 0.05) / 8;
        ctx.beginPath();
        ctx.moveTo(lx, h * 0.08);
        ctx.lineTo(lx, h * 0.92);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.background.min * 0.5 * entrance);
        ctx.lineWidth = px(STROKE.hairline, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Dam structure ──────────────────────────────────
      const damTop = h * (1 - DAM_HEIGHT) / 2;
      const damBot = h - damTop;

      // Dam body
      const damGrad = ctx.createLinearGradient(damCx - damHalfW, 0, damCx + damHalfW, 0);
      damGrad.addColorStop(0, rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance));
      damGrad.addColorStop(0.5, rgba(s.accentRgb, ALPHA.content.max * 0.25 * entrance));
      damGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.15 * entrance));
      ctx.fillStyle = damGrad;
      ctx.fillRect(damCx - damHalfW, damTop, damHalfW * 2, damBot - damTop);

      // Dam edges
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.beginPath();
      ctx.moveTo(damCx - damHalfW, damTop);
      ctx.lineTo(damCx - damHalfW, damBot);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(damCx + damHalfW, damTop);
      ctx.lineTo(damCx + damHalfW, damBot);
      ctx.stroke();

      // ── LAYER 4: Micro-cracks (always visible as faint lines) ──
      for (const crack of s.cracks) {
        const cy2 = crack.y * h;
        const crackAlpha = s.isFluid ? 0.5 : 0.1;
        ctx.beginPath();
        ctx.moveTo(damCx - damHalfW, cy2);
        // Jagged crack path
        const segs = 6;
        for (let j = 1; j <= segs; j++) {
          const jx = damCx - damHalfW + (j / segs) * damHalfW * 2;
          const jy = cy2 + (Math.sin(j * 3.7 + crack.y * 10) * px(crack.width * 3, minDim));
          ctx.lineTo(jx, jy);
        }
        ctx.strokeStyle = rgba(s.primaryRgb, crackAlpha * ALPHA.atmosphere.max * entrance);
        ctx.lineWidth = px(crack.width * 0.5, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Fluid particles ───────────────────────────────
      if (s.isFluid) {
        for (const pt of s.particles) {
          const pAlpha = pt.phase === 'seep' ? 0.8 : pt.phase === 'reform' ? 0.6 : 0.4;
          const pSize = pt.phase === 'seep' ? PARTICLE_SIZE.sm : PARTICLE_SIZE.md;

          // Particle glow
          if (pt.phase === 'seep') {
            const pGlow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, px(pSize * 4, minDim));
            pGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
            pGlow.addColorStop(1, rgba(s.primaryRgb, 0));
            ctx.fillStyle = pGlow;
            ctx.fillRect(pt.x - px(pSize * 4, minDim), pt.y - px(pSize * 4, minDim),
                         px(pSize * 8, minDim), px(pSize * 8, minDim));
          }

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, px(pSize, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, pAlpha * ALPHA.content.max * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 6: Solid node (pre-liquefaction) ──────────────────
      if (!s.isFluid && !s.completed) {
        const nx = s.nodeX * w;
        const ny = s.nodeY * h;
        const crashShake = s.crashTimer > 0
          ? Math.sin(s.frameCount * 0.8) * px(CRASH_SHAKE_AMP, minDim) * (s.crashTimer / CRASH_DURATION)
          : 0;

        // Node glow
        const gr = px(GLOW_R_NODE, minDim);
        const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
        nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = nGlow;
        ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

        // Rigid square node (emphasizes solidity)
        const halfR = nodeR * 0.85;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fillRect(nx - halfR + crashShake, ny - halfR, halfR * 2, halfR * 2);

        // Edge highlight
        ctx.strokeStyle = rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2),
                               ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.strokeRect(nx - halfR + crashShake, ny - halfR, halfR * 2, halfR * 2);
      }

      // ── LAYER 7: Reformed node (post-seep) ─────────────────────
      if (s.isFluid && s.reformProgress > 0.3) {
        const rfAlpha = easeOutCubic(Math.min(1, (s.reformProgress - 0.3) / 0.7));
        const rfx = 0.75 * w;
        const rfy = cy;

        const rfGlow = ctx.createRadialGradient(rfx, rfy, 0, rfx, rfy, px(GLOW_R_NODE, minDim));
        rfGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * rfAlpha * entrance));
        rfGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = rfGlow;
        const gr = px(GLOW_R_NODE, minDim);
        ctx.fillRect(rfx - gr, rfy - gr, gr * 2, gr * 2);

        ctx.beginPath();
        ctx.arc(rfx, rfy, nodeR * rfAlpha * (1 + breath * 0.05), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * rfAlpha * entrance);
        ctx.fill();
      }

      // ── LAYER 8: State label HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (!s.isFluid && !s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
        ctx.fillText('SOLID — DOUBLE TAP TO LIQUEFY', cx, h - px(0.04, minDim));
      } else if (s.isFluid && !s.completed) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
        const pct = Math.round((s.seepProgress * 50 + s.reformProgress * 50));
        ctx.fillText(`SEEPING ${pct}%`, cx, h - px(0.04, minDim));
      }

      // ── Reduced motion ──────────────────────────────────────────
      if (p.reducedMotion) {
        // Static: fluid particles shown mid-seep
        for (const crack of s.cracks) {
          ctx.beginPath();
          ctx.arc(damCx, crack.y * h, px(PARTICLE_SIZE.md, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
          ctx.fill();
        }
      }

      // ── Respawn ─────────────────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.nodeX = 0.25; s.nodeY = 0.5;
          s.isFluid = false; s.particles = [];
          s.crashTimer = 0; s.seepProgress = 0; s.reformProgress = 0;
          s.completed = false; s.cracks = makeCracks();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── POINTER EVENTS ────────────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.completed) return;
      const now = Date.now();

      if (!s.isFluid) {
        // Double-tap detection
        if (now - s.tapTime < 350) {
          // Liquefy!
          s.isFluid = true;
          // Spawn particles from node position
          const rect = canvas.getBoundingClientRect();
          const nx = s.nodeX * viewport.width;
          const ny = s.nodeY * viewport.height;
          s.particles = [];
          for (let i = 0; i < FLUID_PARTICLE; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * px(NODE_RADIUS * 1.5, Math.min(viewport.width, viewport.height));
            s.particles.push({
              x: nx + Math.cos(angle) * dist,
              y: ny + Math.sin(angle) * dist,
              targetCrack: Math.floor(Math.random() * CRACK_COUNT),
              phase: 'seek',
              speed: SEEP_SPEED * (0.8 + Math.random() * 0.4),
            });
          }
          cbRef.current.onHaptic('tap');
          cbRef.current.onStateChange?.(0.1);
        } else {
          // Single tap → crash against dam
          s.crashTimer = CRASH_DURATION;
          cbRef.current.onHaptic('error_boundary');
        }
        s.tapTime = now;
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}
