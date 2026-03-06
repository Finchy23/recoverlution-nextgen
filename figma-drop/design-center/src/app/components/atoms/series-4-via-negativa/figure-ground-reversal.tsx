/**
 * ATOM 033: THE FIGURE-GROUND REVERSAL ENGINE (Ego Death)
 * ========================================================
 * Series 4 — Via Negativa · Position 3
 *
 * The ego believes it is the most important object in the room
 * (the figure). This atom shifts perception so the user
 * identifies with the vast space containing them (the ground).
 *
 * A complex, intricate geometric mandala sits center-screen —
 * solid, important-looking, the "ego." The background is vast,
 * dark, seemingly empty. As the user holds/touches the shape,
 * it begins to DISSOLVE — its pixels bleeding outward into the
 * background. Simultaneously, the "empty" space brightens.
 *
 * The reversal: what was figure becomes ground, what was ground
 * becomes figure. The background — the vastness, the space, the
 * context — was always the real protagonist. At full dissolution,
 * the ego shape is gone, and the entire field glows with quiet,
 * spacious light. The nothing was everything.
 *
 * PHYSICS:
 *   - Ego mandala: procedural radial geometry, ~200 vertices
 *   - Dissolution: each vertex has an "attachment" value 0–1
 *   - Hold = reduce attachment → vertices drift outward
 *   - As ego dissolves, background luminosity rises
 *   - Particle emission from dissolving edges (ego bleeding)
 *   - Color inversion: ego darkens, space brightens
 *   - At full dissolution: uniform spacious glow, no center
 *
 * HAPTIC JOURNEY:
 *   Hold → hold_start (ego begins to shake)
 *   25% dissolved → step_advance (first crack)
 *   50% dissolved → step_advance (boundaries soften)
 *   Full dissolution → completion (spacious emptiness)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Faster dissolution, no particle emission
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Number of mandala vertices */
const VERTEX_COUNT = 120;
/** Number of concentric rings in the mandala */
const RING_COUNT = 5;
/** Vertices per ring */
const VERTS_PER_RING = VERTEX_COUNT / RING_COUNT;
/** Mandala base radius as fraction of min dimension */
const MANDALA_RADIUS_FRAC = 0.2;
/** Ring spacing as fraction of base radius */
const RING_SPACING = 0.2;
/** Dissolution rate per frame while holding */
const DISSOLVE_RATE = 0.0012;
/** Max dissolved particles */
const MAX_PARTICLES = 150;
/** Step advance thresholds */
const STEP_THRESHOLDS = [0.25, 0.5];

// =====================================================================
// DATA STRUCTURES
// =====================================================================

interface MandalaVertex {
  /** Angle (fixed) */
  angle: number;
  /** Ring index (0 = innermost) */
  ring: number;
  /** Base radius (fixed) */
  baseR: number;
  /** Attachment: 1 = solid, 0 = fully dissolved */
  attachment: number;
  /** Drift offset (increases as attachment decreases) */
  driftR: number;
  driftAngle: number;
  /** Individual wobble phase */
  wobblePhase: number;
  /** Size */
  size: number;
}

interface DissolveParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
}

// =====================================================================
// COLOR
// =====================================================================

// Palette
const EGO_SOLID: RGB = [120, 105, 95];           // Dense, self-important
const EGO_INNER: RGB = [140, 120, 105];          // Warm center
const EGO_GLOW: RGB = [160, 140, 120];           // Edge glow
const SPACE_DARK: RGB = [4, 4, 5];               // Background void
const SPACE_AWAKENED: RGB = [130, 125, 115];      // Spacious light
const DISSOLVE_PARTICLE: RGB = [150, 135, 120];   // Ego fragments

// =====================================================================
// GENERATION
// =====================================================================

function createMandala(baseR: number): MandalaVertex[] {
  const vertices: MandalaVertex[] = [];

  for (let ring = 0; ring < RING_COUNT; ring++) {
    const ringR = baseR * (0.3 + ring * RING_SPACING);
    const count = VERTS_PER_RING;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      // Mandala-like modulation: different symmetry per ring
      const symmetry = ring + 3; // 3, 4, 5, 6, 7-fold symmetry
      const modulation = 1 + Math.sin(angle * symmetry) * 0.12 * (1 + ring * 0.15);
      const r = ringR * modulation;

      vertices.push({
        angle,
        ring,
        baseR: r,
        attachment: 1,
        driftR: 0,
        driftAngle: (Math.random() - 0.5) * 0.3,
        wobblePhase: Math.random() * Math.PI * 2,
        size: 0.8 + Math.random() * 1.2 + ring * 0.2,
      });
    }
  }

  return vertices;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function FigureGroundReversalAtom({
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
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    vertices: [] as MandalaVertex[],
    particles: [] as DissolveParticle[],
    isHolding: false,
    holdX: 0,
    holdY: 0,
    dissolution: 0,
    holdStartFired: false,
    stepsFired: 0,
    resolved: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    initialized: false,
    baseRadius: 0,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Single effect: native events + rAF ─────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const baseR = minDim * MANDALA_RADIUS_FRAC;
    const cx = w / 2;
    const cy = h / 2;

    if (!s.initialized) {
      s.baseRadius = baseR;
      s.vertices = createMandala(baseR);
      s.initialized = true;
    }

    // ── Native pointer handlers ───────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.isHolding = true;
      s.holdX = (e.clientX - rect.left) / rect.width * w;
      s.holdY = (e.clientY - rect.top) / rect.height * h;
      if (!s.holdStartFired) {
        s.holdStartFired = true;
        cbRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!s.isHolding) return;
      const rect = canvas.getBoundingClientRect();
      s.holdX = (e.clientX - rect.left) / rect.width * w;
      s.holdY = (e.clientY - rect.top) / rect.height * h;
    };
    const onUp = (e: PointerEvent) => {
      s.isHolding = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Dissolution (when holding) ────────────────────
      if (s.isHolding && s.dissolution < 1) {
        const rate = p.reducedMotion ? DISSOLVE_RATE * 4 : DISSOLVE_RATE;
        s.dissolution = Math.min(1, s.dissolution + rate);

        for (const v of s.vertices) {
          const ringFactor = 1 - v.ring / (RING_COUNT - 1);
          const dissolveThreshold = ringFactor * 0.7;
          if (s.dissolution > dissolveThreshold) {
            const localProgress = Math.min(1, (s.dissolution - dissolveThreshold) / (1 - dissolveThreshold));
            v.attachment = Math.max(0, 1 - localProgress);
            v.driftR = (1 - v.attachment) * baseR * (0.5 + v.ring * 0.3);
          }
        }

        if (!p.reducedMotion && s.particles.length < MAX_PARTICLES && s.frameCount % 3 === 0) {
          const dissolving = s.vertices.filter(v => v.attachment > 0.05 && v.attachment < 0.9);
          if (dissolving.length > 0) {
            const v = dissolving[Math.floor(Math.random() * dissolving.length)];
            const vr = v.baseR + v.driftR;
            const va = v.angle + v.driftAngle * (1 - v.attachment);
            const vx = cx + Math.cos(va) * vr;
            const vy = cy + Math.sin(va) * vr;
            const outAngle = va + (Math.random() - 0.5) * 0.5;
            s.particles.push({
              x: vx, y: vy,
              vx: Math.cos(outAngle) * minDim * (0.0006 + Math.random() * 0.0016),
              vy: Math.sin(outAngle) * minDim * (0.0006 + Math.random() * 0.0016),
              life: 80 + Math.random() * 60,
              maxLife: 80 + Math.random() * 60,
              size: minDim * (0.001 + Math.random() * 0.003),
              alpha: 0.15 + Math.random() * 0.1,
            });
          }
        }

        for (let i = 0; i < STEP_THRESHOLDS.length; i++) {
          if (s.dissolution >= STEP_THRESHOLDS[i] && s.stepsFired <= i) {
            s.stepsFired = i + 1;
            cb.onHaptic('step_advance');
          }
        }

        if (s.dissolution >= 0.95 && !s.resolved) {
          s.resolved = true;
          s.dissolution = 1;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // ── Particle physics ──────────────────────────────
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.995;
        pt.vy *= 0.995;
        pt.life--;
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      cb.onStateChange?.(s.dissolution);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background: space awakening (radial, glass-floating) ──
      const spaceLuminosity = s.dissolution;
      const bgColor = lerpColor(
        lerpColor(SPACE_DARK, s.primaryRgb, 0.008),
        lerpColor(SPACE_AWAKENED, s.primaryRgb, 0.06),
        spaceLuminosity * 0.08,
      );
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Spacious atmospheric glow (grows with dissolution)
      if (spaceLuminosity > 0.1) {
        const spaceAlpha = (spaceLuminosity - 0.1) * 0.04 * entrance;
        const spaceColor = lerpColor(SPACE_AWAKENED, s.primaryRgb, 0.1);
        const spaceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.5);
        spaceGrad.addColorStop(0, rgba(spaceColor, spaceAlpha));
        spaceGrad.addColorStop(0.5, rgba(spaceColor, spaceAlpha * 0.3));
        spaceGrad.addColorStop(1, rgba(spaceColor, 0));
        ctx.fillStyle = spaceGrad;
        ctx.fillRect(0, 0, w, h);

        // Subtle field lines radiating from center
        if (!p.reducedMotion) {
          const lineCount = 12;
          for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2 + s.frameCount * 0.0005;
            const r = minDim * 0.25 * spaceLuminosity;
            const lineAlpha = spaceAlpha * 0.3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
            ctx.strokeStyle = rgba(spaceColor, lineAlpha);
            ctx.lineWidth = minDim * 0.001;
            ctx.stroke();
          }
        }
      }

      // ── Mandala vertices ──────────────────────────────
      const breathPulse = p.reducedMotion ? 1 : (1 + Math.sin(s.frameCount * 0.02) * 0.02 * p.breathAmplitude);

      for (const v of s.vertices) {
        if (v.attachment < 0.01) continue;

        const wobble = p.reducedMotion ? 0
          : Math.sin(s.frameCount * 0.015 + v.wobblePhase) * minDim * 0.002 * (1 - v.attachment);
        const r = (v.baseR + v.driftR + wobble) * breathPulse;
        const a = v.angle + v.driftAngle * (1 - v.attachment);
        const vx = cx + Math.cos(a) * r;
        const vy = cy + Math.sin(a) * r;

        const ringT = v.ring / (RING_COUNT - 1);
        const vertColor = lerpColor(
          lerpColor(EGO_INNER, s.primaryRgb, 0.08),
          lerpColor(EGO_SOLID, s.accentRgb, 0.05),
          ringT,
        );

        const alpha = v.attachment * (0.15 + ringT * 0.15) * entrance;
        const sz = (v.size * minDim * 0.003) * (0.5 + v.attachment * 0.5);

        // Glow
        if (alpha > 0.03) {
          const glowR = sz * 3;
          const glowGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, glowR);
          glowGrad.addColorStop(0, rgba(lerpColor(vertColor, EGO_GLOW, 0.3), alpha * 0.3));
          glowGrad.addColorStop(1, rgba(vertColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(vx - glowR, vy - glowR, glowR * 2, glowR * 2);
        }

        // Vertex dot
        ctx.beginPath();
        ctx.arc(vx, vy, sz, 0, Math.PI * 2);
        ctx.fillStyle = rgba(vertColor, alpha);
        ctx.fill();
      }

      // ── Connect mandala rings ─────────────────────────
      ctx.globalAlpha = entrance;
      for (let ring = 0; ring < RING_COUNT; ring++) {
        const ringVerts = s.vertices.filter(v => v.ring === ring && v.attachment > 0.05);
        if (ringVerts.length < 2) continue;

        const ringColor = lerpColor(EGO_SOLID, s.primaryRgb, 0.06);
        const avgAttach = ringVerts.reduce((a, v) => a + v.attachment, 0) / ringVerts.length;

        ctx.beginPath();
        for (let i = 0; i <= ringVerts.length; i++) {
          const v = ringVerts[i % ringVerts.length];
          const r = (v.baseR + v.driftR) * breathPulse;
          const a = v.angle + v.driftAngle * (1 - v.attachment);
          const vx = cx + Math.cos(a) * r;
          const vy = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = rgba(ringColor, avgAttach * 0.06);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── Dissolve particles ────────────────────────────
      const ptColor = lerpColor(DISSOLVE_PARTICLE, s.accentRgb, 0.1);
      for (const pt of s.particles) {
        const lifeT = pt.life / pt.maxLife;
        const ptAlpha = pt.alpha * lifeT * entrance;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * lifeT, 0, Math.PI * 2);
        ctx.fillStyle = rgba(ptColor, ptAlpha);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
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
          cursor: 'default',
        }}
      />
    </div>
  );
}