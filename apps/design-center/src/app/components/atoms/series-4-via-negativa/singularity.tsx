/**
 * ATOM 040: THE SINGULARITY ENGINE (The Zero Point)
 * ===================================================
 * Series 4 — Via Negativa · Position 10
 *
 * The ultimate realization of the Via Negativa. Zero is not
 * empty; it is the origin point of all geometry, time, and
 * potential. The user collapses their entire sprawling,
 * complicated life into a single point of absolute power.
 *
 * The screen is filled with overwhelming visual complexity —
 * orbiting shapes, scattered text fragments, geometric debris,
 * concentric orbits, particle noise. Everything moving.
 * Everything demanding attention. Visual maximal overload.
 *
 * The user pinches inward (or holds the center). Everything
 * begins to collapse. Every element accelerates toward the
 * center — orbits tighten, text compresses, shapes merge.
 * The closer to center, the faster the compression.
 *
 * At full singularity: everything converges into a single,
 * blindingly bright 2-pixel dot at the dead center of the
 * screen. All that complexity. All that noise. Reduced to
 * a point. And in that point: infinite potential. Zero and
 * infinity, collapsed into the same coordinate.
 *
 * Then: the dot slowly breathes. The smallest thing in the
 * universe, containing everything.
 *
 * PHYSICS:
 *   - ~80 complexity elements (shapes, lines, orbits, text)
 *   - Each has position, orbit radius, angular velocity
 *   - Hold center → all orbit radii collapse toward 0
 *   - Collapse rate accelerates (gravitational funnel)
 *   - At singularity: all elements at (cx, cy), r → 0
 *   - Post-singularity: single dot with breath-coupled glow
 *   - Implosion haptic at moment of convergence
 *
 * HAPTIC JOURNEY:
 *   Hold → hold_start (gravity engages)
 *   50% collapsed → step_advance (can't stop now)
 *   Singularity → seal_stamp (massive implosion)
 *   Post-singularity → breath_peak (the dot breathes)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Faster collapse, no orbiting animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

const ELEMENT_COUNT = 80;
const COLLAPSE_RATE = 0.006;
const COLLAPSE_ACCEL = 1.02; // Rate multiplier per frame
/** Post-singularity dot size as fraction of minDim */
const SINGULARITY_DOT_FRAC = 0.002;
/** Post-singularity glow duration */
const POST_GLOW_RAMP = 180;

// =====================================================================
// COMPLEXITY ELEMENTS
// =====================================================================

type ElementKind = 'circle' | 'rect' | 'line' | 'text' | 'dot' | 'arc';

const TEXT_FRAGMENTS = [
  'TODO', 'URGENT', '?!', '...', 'FIX', 'HELP', 'WHY',
  'MORE', 'AGAIN', 'STOP', 'NOW', 'BUT', 'WAIT', 'NEED',
  'CAN\'T', 'SHOULD', 'NEVER', 'ALWAYS', 'WHAT IF',
];

interface ComplexElement {
  kind: ElementKind;
  /** Orbit radius (distance from center) */
  orbitR: number;
  /** Current angle */
  angle: number;
  /** Angular velocity (rad/frame) */
  angVel: number;
  /** Visual size */
  size: number;
  /** Base alpha */
  alpha: number;
  /** Text content (if text) */
  text: string;
  /** Rotation of the element itself */
  selfRotation: number;
  selfRotVel: number;
  /** Original orbit radius (for collapse calculation) */
  baseOrbitR: number;
}

function createElements(minDim: number): ComplexElement[] {
  const kinds: ElementKind[] = ['circle', 'rect', 'line', 'text', 'dot', 'arc'];
  return Array.from({ length: ELEMENT_COUNT }, (_, i) => {
    const kind = kinds[i % kinds.length];
    const orbitR = minDim * (0.08 + Math.random() * 0.42);
    return {
      kind,
      orbitR,
      angle: Math.random() * Math.PI * 2,
      angVel: (0.002 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1),
      size: minDim * (0.004 + Math.random() * 0.016),
      alpha: 0.03 + Math.random() * 0.07,
      text: TEXT_FRAGMENTS[Math.floor(Math.random() * TEXT_FRAGMENTS.length)],
      selfRotation: Math.random() * Math.PI * 2,
      selfRotVel: (Math.random() - 0.5) * 0.01,
      baseOrbitR: orbitR,
    };
  });
}

// =====================================================================
// COLOR
// =====================================================================

// Palette — chaotic overwhelm → singularity
const BG_DARK: RGB = [3, 3, 4];
const CHAOS_DIM: RGB = [80, 70, 65];
const CHAOS_MID: RGB = [110, 95, 85];
const CHAOS_TEXT: RGB = [90, 75, 70];
const SINGULARITY_CORE: RGB = [220, 210, 195];
const SINGULARITY_GLOW: RGB = [180, 165, 145];

// =====================================================================
// COMPONENT
// =====================================================================

export default function SingularityAtom({
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
    elements: [] as ComplexElement[],
    isHolding: false,
    collapseProgress: 0, // 0 = spread, 1 = singularity
    collapseRate: COLLAPSE_RATE,
    holdStartFired: false,
    halfFired: false,
    singularity: false,
    postSingularityFrame: 0,
    breathPeakFired: false,
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

    if (!s.initialized) {
      s.elements = createElements(minDim);
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

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Collapse physics ──────────────────────────────
      if (s.isHolding && !s.singularity) {
        s.collapseRate *= COLLAPSE_ACCEL;
        const rate = p.reducedMotion ? s.collapseRate * 3 : s.collapseRate;
        s.collapseProgress = Math.min(1, s.collapseProgress + rate);

        if (s.collapseProgress >= 0.5 && !s.halfFired) {
          s.halfFired = true;
          cb.onHaptic('step_advance');
        }

        if (s.collapseProgress >= 0.98 && !s.singularity) {
          s.singularity = true;
          s.collapseProgress = 1;
          s.postSingularityFrame = 0;
          cb.onHaptic('seal_stamp');
          cb.onResolve?.();
        }
      }

      // Slow spring-back if released before singularity
      if (!s.isHolding && !s.singularity && s.collapseProgress > 0) {
        s.collapseProgress = Math.max(0, s.collapseProgress - 0.003);
        s.collapseRate = COLLAPSE_RATE;
      }

      // Post-singularity
      if (s.singularity) {
        s.postSingularityFrame++;
        if (s.postSingularityFrame > POST_GLOW_RAMP && !s.breathPeakFired) {
          s.breathPeakFired = true;
          cb.onHaptic('breath_peak');
        }
      }

      const collapse = s.collapseProgress;
      cb.onStateChange?.(collapse);

      // ── Update element positions ──────────────────────
      for (const el of s.elements) {
        // Orbit radius collapses
        el.orbitR = el.baseOrbitR * (1 - collapse);

        // Orbit (still moving, faster as collapsing)
        if (!p.reducedMotion) {
          const speedMult = 1 + collapse * collapse * 8;
          el.angle += el.angVel * speedMult;
          el.selfRotation += el.selfRotVel * speedMult;
        }
      }

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ══════════════════════════════════════════════════

      const bgColor = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ══════════════════════════════════════════════════
      // PRE-SINGULARITY: Render all complexity elements
      // ══════════════════════════════════════════════════

      if (!s.singularity) {
        // Center gravity funnel glow (visible during collapse)
        if (collapse > 0.1) {
          const funnelR = minDim * 0.15 * (1 - collapse);
          const funnelAlpha = collapse * 0.02 * entrance;
          const funnelColor = lerpColor(SINGULARITY_GLOW, s.accentRgb, 0.08);
          const funnelGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, funnelR + minDim * 0.01);
          funnelGrad.addColorStop(0, rgba(funnelColor, funnelAlpha));
          funnelGrad.addColorStop(0.5, rgba(funnelColor, funnelAlpha * 0.2));
          funnelGrad.addColorStop(1, rgba(funnelColor, 0));
          ctx.fillStyle = funnelGrad;
          ctx.fillRect(cx - funnelR - minDim * 0.01, cy - funnelR - minDim * 0.01, (funnelR + minDim * 0.01) * 2, (funnelR + minDim * 0.01) * 2);
        }

        for (const el of s.elements) {
          const ex = cx + Math.cos(el.angle) * el.orbitR;
          const ey = cy + Math.sin(el.angle) * el.orbitR;

          // Color blends toward singularity white as collapsing
          const baseColor = el.kind === 'text'
            ? lerpColor(CHAOS_TEXT, s.primaryRgb, 0.04)
            : lerpColor(CHAOS_DIM, s.primaryRgb, 0.05);
          const elColor = lerpColor(
            baseColor,
            lerpColor(SINGULARITY_CORE, s.accentRgb, 0.06),
            collapse * 0.4,
          );

          // Alpha increases slightly as collapsing (denser = brighter)
          const elAlpha = el.alpha * (1 + collapse * 2) * entrance;
          // Size shrinks as collapsing
          const elSize = el.size * (1 - collapse * 0.6);

          ctx.save();
          ctx.translate(ex, ey);
          ctx.rotate(el.selfRotation);

          switch (el.kind) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(0, 0, elSize * 0.4, 0, Math.PI * 2);
              ctx.strokeStyle = rgba(elColor, elAlpha);
              ctx.lineWidth = minDim * 0.0008;
              ctx.stroke();
              break;

            case 'rect':
              ctx.strokeStyle = rgba(elColor, elAlpha);
              ctx.lineWidth = minDim * 0.0006;
              ctx.strokeRect(-elSize * 0.3, -elSize * 0.3, elSize * 0.6, elSize * 0.6);
              break;

            case 'line':
              ctx.beginPath();
              ctx.moveTo(-elSize * 0.5, 0);
              ctx.lineTo(elSize * 0.5, 0);
              ctx.strokeStyle = rgba(elColor, elAlpha);
              ctx.lineWidth = minDim * 0.0006;
              ctx.stroke();
              break;

            case 'text': {
              const fontSize = Math.max(minDim * 0.006, Math.round(elSize * 0.8));
              ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = rgba(elColor, elAlpha * 0.7);
              ctx.fillText(el.text, 0, 0);
              break;
            }

            case 'dot':
              ctx.beginPath();
              ctx.arc(0, 0, elSize * 0.15, 0, Math.PI * 2);
              ctx.fillStyle = rgba(elColor, elAlpha);
              ctx.fill();
              break;

            case 'arc':
              ctx.beginPath();
              ctx.arc(0, 0, elSize * 0.5, 0, Math.PI * 1.3);
              ctx.strokeStyle = rgba(elColor, elAlpha * 0.8);
              ctx.lineWidth = minDim * 0.0004;
              ctx.stroke();
              break;
          }

          ctx.restore();
        }

        // Orbit trace lines (subtle, disappear with collapse)
        if (collapse < 0.5) {
          const traceAlpha = (1 - collapse * 2) * 0.005 * entrance;
          const traceColor = lerpColor(CHAOS_DIM, s.primaryRgb, 0.03);
          for (let i = 0; i < 6; i++) {
            const orbitR = minDim * (0.1 + i * 0.06);
            ctx.beginPath();
            ctx.arc(cx, cy, orbitR * (1 - collapse), 0, Math.PI * 2);
            ctx.strokeStyle = rgba(traceColor, traceAlpha);
            ctx.lineWidth = minDim * 0.0004;
            ctx.stroke();
          }
        }
      }

      // ══════════════════════════════════════════════════
      // POST-SINGULARITY: The Zero Point
      // ══════════════════════════════════════════════════

      if (s.singularity) {
        const postT = Math.min(1, s.postSingularityFrame / POST_GLOW_RAMP);
        const postEase = easeOutExpo(postT);

        // The dot — 1-2 pixels of infinite potential
        const dotR = minDim * SINGULARITY_DOT_FRAC;
        const dotColor = lerpColor(SINGULARITY_CORE, s.accentRgb, 0.05);
        const dotAlpha = (0.6 + postEase * 0.3) * entrance;

        // Breath-coupled glow
        const breathMod = p.reducedMotion ? 1 : (0.85 + p.breathAmplitude * 0.15);
        const glowR = minDim * (0.01 + postEase * 0.04) * breathMod;
        const glowColor = lerpColor(SINGULARITY_GLOW, s.primaryRgb, 0.06);
        const glowAlpha = postEase * 0.04 * entrance * breathMod;

        // Outer halo
        const haloR = glowR * 3;
        const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
        haloGrad.addColorStop(0, rgba(glowColor, glowAlpha));
        haloGrad.addColorStop(0.2, rgba(glowColor, glowAlpha * 0.3));
        haloGrad.addColorStop(0.5, rgba(glowColor, glowAlpha * 0.05));
        haloGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = haloGrad;
        ctx.fillRect(cx - haloR, cy - haloR, haloR * 2, haloR * 2);

        // Inner glow
        const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        innerGrad.addColorStop(0, rgba(dotColor, dotAlpha));
        innerGrad.addColorStop(0.3, rgba(dotColor, dotAlpha * 0.3));
        innerGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = innerGrad;
        ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

        // The dot itself
        ctx.beginPath();
        ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(dotColor, dotAlpha);
        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      if (s.singularity) return;
      s.isHolding = true;
      s.collapseRate = COLLAPSE_RATE;
      if (!s.holdStartFired) {
        s.holdStartFired = true;
        cbRef.current.onHaptic('hold_start');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      s.isHolding = false;
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