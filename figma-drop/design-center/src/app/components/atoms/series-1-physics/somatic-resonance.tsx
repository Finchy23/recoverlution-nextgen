/**
 * ATOM 004: THE SOMATIC RESONANCE ENGINE
 * ========================================
 * Series 1 — Physics Engines · Position 4
 *
 * You cannot reason with a hijacked amygdala.
 * This atom bypasses the intellect entirely — using breath,
 * bilateral stimulation, and resonant vibration to directly
 * entrain the autonomic nervous system.
 *
 * PHYSICS:
 *   - Bioluminescent organic membrane driven by breath amplitude
 *   - Perimeter deformation via layered sine waves + noise
 *   - Multi-layer volumetric rendering (3 concentric shells)
 *   - Bilateral oscillation mode on sustained hold
 *   - Peripheral particle field responding to inhale/exhale
 *   - Color temperature shifts with breath phase
 *
 * INTERACTION:
 *   Breath (drives)    → primary input; controls everything
 *   Hold (sustained)   → activates bilateral oscillation mode
 *   Observable          → the membrane lives even without input
 *
 * THE MEMBRANE:
 *   Not a circle. Not a lung. A living, luminous, irregular
 *   organic form — like a bioluminescent jellyfish seen from
 *   below, a breathing nebula, a cell membrane under a microscope.
 *   60 control points around the perimeter, each independently
 *   deformed by layered sine waves with breath-coupled amplitude.
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static form at current breath, no deformation anim
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

/** Control points around the membrane perimeter */
const PERIMETER_POINTS = 64;
/** Base radius as fraction of min(width, height) / 2 */
const BASE_RADIUS_RATIO = 0.28;
/** How much breath expands the membrane (fraction of base) */
const BREATH_EXPANSION = 0.35;
/** Number of concentric membrane shells */
const SHELL_COUNT = 4;
/** Shell spacing as fraction of base radius */
const SHELL_SPACING = 0.12;
/** Peripheral particle count */
const PARTICLE_COUNT = 80;
/** Bilateral oscillation frequency (cycles/frame) */
const BILATERAL_FREQ = 0.02;
/** Bilateral offset strength (fraction of base radius) */
const BILATERAL_STRENGTH = 0.25;
/** Hold frames before bilateral mode activates */
const HOLD_ACTIVATE_FRAMES = 24;
/** Deformation wave layers */
const WAVE_LAYERS = 4;
/** Breath peak detection threshold */
const BREATH_PEAK_THRESHOLD = 0.75;
/** Minimum frames between breath_peak haptics */
const BREATH_PEAK_COOLDOWN = 60;

// =====================================================================
// MEMBRANE DEFORMATION SYSTEM
// =====================================================================

interface WaveLayer {
  /** Frequency (number of lobes around perimeter) */
  frequency: number;
  /** Amplitude as fraction of base radius */
  amplitude: number;
  /** Phase rotation speed per frame */
  phaseSpeed: number;
  /** How strongly breath modulates this layer's amplitude */
  breathCoupling: number;
  /** Current phase */
  phase: number;
}

function createWaveLayers(): WaveLayer[] {
  return [
    { frequency: 3,  amplitude: 0.08,  phaseSpeed: 0.008,  breathCoupling: 0.6,  phase: 0 },
    { frequency: 5,  amplitude: 0.04,  phaseSpeed: -0.012, breathCoupling: 0.4,  phase: Math.PI * 0.7 },
    { frequency: 7,  amplitude: 0.025, phaseSpeed: 0.018,  breathCoupling: 0.8,  phase: Math.PI * 1.3 },
    { frequency: 11, amplitude: 0.015, phaseSpeed: -0.006, breathCoupling: 0.3,  phase: Math.PI * 0.4 },
  ];
}

// =====================================================================
// PARTICLE SYSTEM
// =====================================================================

interface ResParticle {
  /** Angle from center */
  angle: number;
  /** Distance from center as ratio of viewport min dimension */
  distance: number;
  /** Base distance (home position) */
  homeDistance: number;
  /** Size */
  size: number;
  /** Brightness */
  brightness: number;
  /** Individual phase offset */
  phase: number;
  /** Drift speed */
  drift: number;
  /** Orbital speed (angular) */
  orbital: number;
}

function createParticles(): ResParticle[] {
  const particles: ResParticle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const homeD = 0.25 + Math.random() * 0.35;
    particles.push({
      angle: Math.random() * Math.PI * 2,
      distance: homeD,
      homeDistance: homeD,
      size: 0.4 + Math.random() * 1.8,
      brightness: 0.15 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      drift: 0.0005 + Math.random() * 0.002,
      orbital: (Math.random() - 0.5) * 0.003,
    });
  }
  return particles;
}

// =====================================================================
// COLOR SYSTEM
// =====================================================================

// Breath palette: exhale = cool calm, inhale = warm alive
const EXHALE_COOL: RGB = [80, 100, 170];   // Deep calm blue
const INHALE_WARM: RGB = [200, 160, 100];   // Living amber
const MEMBRANE_GLOW: RGB = [140, 180, 220]; // Bioluminescent

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function SomaticResonanceAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => {
    callbacksRef.current = { onHaptic, onStateChange };
  }, [onHaptic, onStateChange]);

  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    waveLayers: createWaveLayers(),
    particles: createParticles(),
    // Bilateral hold state
    isHolding: false,
    holdFrames: 0,
    bilateralActive: false,
    bilateralPhase: 0,
    // Breath tracking
    smoothBreath: 0,         // Smoothed breath for visual (avoids jitter)
    prevBreath: 0,           // Previous frame's breath for peak detection
    breathPeakCooldown: 0,   // Frames since last breath_peak
    breathRising: false,     // Whether breath is currently rising
    resonanceScore: 0,       // How well the user is matching rhythm (0–1)
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

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;

    const render = () => {
      const p = propsRef.current;
      const cb = callbacksRef.current;
      const w = viewport.width;
      const h = viewport.height;
      const breath = p.breathAmplitude;

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
        s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Smooth breath ─────────────────────────────────
      s.smoothBreath += (breath - s.smoothBreath) * 0.12;

      // ── Breath peak detection ─────────────────────────
      s.breathPeakCooldown = Math.max(0, s.breathPeakCooldown - 1);
      if (breath > BREATH_PEAK_THRESHOLD && s.prevBreath <= BREATH_PEAK_THRESHOLD && s.breathPeakCooldown === 0) {
        cb.onHaptic('breath_peak');
        s.breathPeakCooldown = BREATH_PEAK_COOLDOWN;
        s.resonanceScore = Math.min(1, s.resonanceScore + 0.15);
      }
      s.breathRising = breath > s.prevBreath;
      s.prevBreath = breath;

      // Resonance decays slowly
      s.resonanceScore = Math.max(0, s.resonanceScore - 0.001);

      // ── Hold → bilateral ──────────────────────────────
      if (s.isHolding) {
        s.holdFrames++;
        if (!s.bilateralActive && s.holdFrames > HOLD_ACTIVATE_FRAMES) {
          s.bilateralActive = true;
          cb.onHaptic('hold_threshold');
        }
      }
      if (s.bilateralActive && !p.reducedMotion) {
        s.bilateralPhase += BILATERAL_FREQ;
      }

      // ── State reporting ───────────────────────────────
      cb.onStateChange?.(s.smoothBreath);

      // ── Wave layer animation ──────────────────────────
      if (!p.reducedMotion) {
        for (const wave of s.waveLayers) {
          wave.phase += wave.phaseSpeed;
        }
      }

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      const cx = w / 2;
      const cy = h / 2;
      const minDim = Math.min(w, h);
      const baseR = minDim * BASE_RADIUS_RATIO;
      const sb = s.smoothBreath; // shorthand

      // Bilateral offset
      const bilatX = s.bilateralActive
        ? Math.sin(s.bilateralPhase) * baseR * BILATERAL_STRENGTH
        : 0;

      // ── Color computation ─────────────────────────────
      // Breath drives color temperature
      const breathColor = lerpColor(EXHALE_COOL, INHALE_WARM, sb);
      const membraneColor = lerpColor(breathColor, s.primaryRgb, 0.25);
      const glowColor = lerpColor(MEMBRANE_GLOW, s.accentRgb, 0.2);

      // ── Layer 1: Deep background pulse ────────────────
      const bgPulse = 0.03 + sb * 0.02;
      const bgBase = lerpColor(membraneColor, [15, 12, 20], 0.7);
      const bgGrad = ctx.createRadialGradient(
        cx + bilatX * 0.3, cy, 0,
        cx, cy, Math.max(w, h) * 0.7,
      );
      bgGrad.addColorStop(0, rgba(lerpColor(bgBase, [18, 12, 22], 0.4), entrance * 0.03));
      bgGrad.addColorStop(0.5, rgba(bgBase, entrance * 0.025));
      bgGrad.addColorStop(1, rgba(lerpColor(bgBase, [4, 2, 8], 0.5), entrance * 0.02));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Layer 2: Peripheral particles ─────────────────
      if (!p.reducedMotion) {
        for (const particle of s.particles) {
          // Breath pulls particles inward on inhale, releases on exhale
          const breathPull = sb * 0.08;
          const targetDist = particle.homeDistance - breathPull;
          particle.distance += (targetDist - particle.distance) * 0.03;

          // Orbital drift
          particle.angle += particle.orbital;

          // Animate individual shimmer
          particle.phase += particle.drift;

          const shimmer = 0.5 + 0.5 * Math.sin(particle.phase);
          const px = cx + bilatX * 0.1 + Math.cos(particle.angle) * particle.distance * minDim;
          const py = cy + Math.sin(particle.angle) * particle.distance * minDim;

          const pAlpha = particle.brightness * shimmer * entrance * (0.15 + sb * 0.15);

          if (pAlpha < 0.01) continue;

          // Particle with tiny glow
          ctx.beginPath();
          ctx.arc(px, py, particle.size * (0.8 + sb * 0.3), 0, Math.PI * 2);
          ctx.fillStyle = rgba(glowColor, pAlpha);
          ctx.fill();

          if (particle.size > 1.2) {
            ctx.beginPath();
            ctx.arc(px, py, particle.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = rgba(glowColor, pAlpha * 0.1);
            ctx.fill();
          }
        }
      }

      // ── Layer 3: The Membrane ─────────────────────────
      // Draw multiple shells from outer to inner
      for (let shell = SHELL_COUNT - 1; shell >= 0; shell--) {
        const shellFraction = shell / SHELL_COUNT;
        const shellR = baseR * (1 + BREATH_EXPANSION * sb) * (1 - shellFraction * SHELL_SPACING);
        const shellAlpha = (0.04 + shellFraction * 0.08 + sb * 0.06) * entrance;

        // Compute deformed perimeter points
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i < PERIMETER_POINTS; i++) {
          const angle = (i / PERIMETER_POINTS) * Math.PI * 2;

          // Accumulate wave deformation
          let deformation = 0;
          if (!p.reducedMotion) {
            for (const wave of s.waveLayers) {
              const waveAmp = wave.amplitude * (1 + wave.breathCoupling * sb);
              deformation += Math.sin(angle * wave.frequency + wave.phase + shell * 0.3) * waveAmp;
            }
          }

          const r = shellR * (1 + deformation);

          // Bilateral offset affects membrane shape
          const bilatOffset = s.bilateralActive
            ? Math.cos(angle) * bilatX * (0.3 + shellFraction * 0.2)
            : 0;

          points.push({
            x: cx + bilatOffset + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
          });
        }

        // Draw smooth closed path through points using Catmull-Rom → Bezier
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const p0 = points[(i - 1 + points.length) % points.length];
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const p3 = points[(i + 2) % points.length];

          if (i === 0) {
            ctx.moveTo(p1.x, p1.y);
          }

          // Catmull-Rom to Cubic Bezier
          const cp1x = p1.x + (p2.x - p0.x) / 6;
          const cp1y = p1.y + (p2.y - p0.y) / 6;
          const cp2x = p2.x - (p3.x - p1.x) / 6;
          const cp2y = p2.y - (p3.y - p1.y) / 6;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
        ctx.closePath();

        // Shell fill — gradient from center
        const shellGrad = ctx.createRadialGradient(
          cx + bilatX * 0.2, cy, shellR * 0.1,
          cx + bilatX * 0.1, cy, shellR * 1.2,
        );

        const innerColor = lerpColor(membraneColor, [255, 255, 255], 0.1 + sb * 0.1);
        const outerColor = lerpColor(membraneColor, glowColor, shellFraction);

        shellGrad.addColorStop(0, rgba(innerColor, shellAlpha * (1.5 - shellFraction)));
        shellGrad.addColorStop(0.5, rgba(outerColor, shellAlpha * 0.5));
        shellGrad.addColorStop(1, rgba(outerColor, 0));

        ctx.fillStyle = shellGrad;
        ctx.fill();

        // Subtle edge glow on outer shells
        if (shell >= SHELL_COUNT - 2) {
          ctx.save();
          ctx.shadowColor = rgba(glowColor, 0.3 * entrance * (0.5 + sb * 0.5));
          ctx.shadowBlur = minDim * (0.04 + sb * 0.03);
          ctx.strokeStyle = rgba(glowColor, shellAlpha * 0.3);
          ctx.lineWidth = minDim * 0.0016;
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── Layer 4: Inner luminance core ─────────────────
      const coreR = baseR * 0.35 * (0.8 + sb * 0.4);
      const coreAlpha = (0.15 + sb * 0.25) * entrance;

      const coreGrad = ctx.createRadialGradient(
        cx + bilatX * 0.15, cy, 0,
        cx + bilatX * 0.1, cy, coreR,
      );
      const coreColor = lerpColor(membraneColor, [255, 240, 220], sb * 0.4);
      coreGrad.addColorStop(0, rgba(coreColor, coreAlpha));
      coreGrad.addColorStop(0.4, rgba(membraneColor, coreAlpha * 0.4));
      coreGrad.addColorStop(1, rgba(membraneColor, 0));
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - coreR + bilatX * 0.15, cy - coreR, coreR * 2, coreR * 2);

      // Central bright point
      ctx.beginPath();
      ctx.arc(cx + bilatX * 0.1, cy, minDim * (0.004 + sb * 0.004), 0, Math.PI * 2);
      ctx.fillStyle = rgba(lerpColor(coreColor, [255, 255, 255], 0.5), coreAlpha * 0.8);
      ctx.fill();

      // ── Layer 5: Bilateral visualization ──────────────
      if (s.bilateralActive && !p.reducedMotion) {
        // Two focus points that oscillate left/right
        const bilatNorm = Math.sin(s.bilateralPhase); // -1 to 1
        const focusX = cx + bilatNorm * baseR * BILATERAL_STRENGTH * 1.5;
        const focusR = 4 + sb * 3;
        const focusAlpha = 0.3 * entrance;

        // Active focus
        const focusGrad = ctx.createRadialGradient(
          focusX, cy, 0,
          focusX, cy, focusR * 5,
        );
        focusGrad.addColorStop(0, rgba(INHALE_WARM, focusAlpha));
        focusGrad.addColorStop(0.3, rgba(membraneColor, focusAlpha * 0.3));
        focusGrad.addColorStop(1, rgba(membraneColor, 0));
        ctx.fillStyle = focusGrad;
        ctx.fillRect(focusX - focusR * 5, cy - focusR * 5, focusR * 10, focusR * 10);

        // The dot itself
        ctx.beginPath();
        ctx.arc(focusX, cy, focusR * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = rgba([255, 230, 180], focusAlpha * 0.8);
        ctx.fill();

        // Trail (ghost of opposite position)
        const ghostX = cx - bilatNorm * baseR * BILATERAL_STRENGTH * 1.5;
        ctx.beginPath();
        ctx.arc(ghostX, cy, focusR * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(EXHALE_COOL, focusAlpha * 0.2);
        ctx.fill();
      }

      // ── Resonance score visualization ─────────────────
      // Subtle outer ring that brightens with resonance
      if (s.resonanceScore > 0.05) {
        const resR = baseR * (1.8 + sb * 0.3);
        ctx.beginPath();
        ctx.arc(cx, cy, resR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(
          glowColor,
          s.resonanceScore * 0.06 * entrance,
        );
        ctx.lineWidth = minDim * (0.001 + s.resonanceScore * 0.002);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isHolding = true;
      s.holdFrames = 0;
      callbacksRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.bilateralActive) {
        callbacksRef.current.onHaptic('hold_release');
      }
      s.isHolding = false;
      s.holdFrames = 0;
      s.bilateralActive = false;
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