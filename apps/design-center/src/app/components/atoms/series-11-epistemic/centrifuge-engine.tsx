/**
 * ATOM 101: THE CENTRIFUGE ENGINE
 * =================================
 * Series 11 — Epistemic Constructs · Position 1
 *
 * The anxious mind blends facts and feelings into a single
 * terrifying smoothie. This atom uses rotational physics to
 * separate the heavy, undeniable data from the lightweight,
 * swirling anxiety.
 *
 * PHYSICS:
 *   - Central blended mass of particles at varying densities
 *   - User spins a dial to apply centrifugal force
 *   - Dense "fact" particles settle toward center
 *   - Light "feeling" particles fling outward and evaporate
 *   - Density stratification creates visible separation bands
 *   - Breath modulates the glow intensity of the settled core
 *
 * INTERACTION:
 *   Drag (rotational) → spins the centrifuge, increasing RPM
 *   Hold (sustained)  → maintains current RPM without decay
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static layered rings showing pre-separated state
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutExpo,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

// =====================================================================
// PHYSICS CONSTANTS
// =====================================================================

const FRICTION = 0.985;
const MAX_RPM = 0.15;
const RPM_EPSILON = 0.0002;
const DRAG_SENSITIVITY = 0.35;
const DRAG_THRESHOLD = 4;
const HOLD_ACCEL = 0.0002;
const HOLD_THRESHOLD_FRAMES = 25;

// =====================================================================
// PARTICLE SYSTEM
// =====================================================================

const PARTICLE_COUNT = 180;

interface CentrifugeParticle {
  /** 0 = heavy fact, 1 = light feeling */
  density: number;
  /** Current radial distance from center (0–1 normalized) */
  radius: number;
  /** Angle on the disc */
  angle: number;
  /** Angular velocity offset */
  angularOffset: number;
  /** Visual size fraction of minDim */
  sizeFrac: number;
  /** Base brightness */
  brightness: number;
  /** Shimmer phase offset */
  phase: number;
  /** Original random radius before separation */
  originRadius: number;
}

function createParticles(): CentrifugeParticle[] {
  const particles: CentrifugeParticle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const density = Math.random();
    const r = 0.05 + Math.random() * 0.35;
    particles.push({
      density,
      radius: r,
      angle: Math.random() * Math.PI * 2,
      angularOffset: 0.3 + Math.random() * 1.4,
      sizeFrac: 0.001 + (1 - density) * 0.003 + Math.random() * 0.001,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      originRadius: r,
    });
  }
  return particles;
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function CentrifugeEngineAtom({
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
    rpm: 0,
    masterAngle: 0,
    particles: createParticles(),
    isDragging: false,
    isHolding: false,
    holdFrames: 0,
    lastPointerAngle: 0,
    pointerStartX: 0,
    pointerStartY: 0,
    hasMoved: false,
    entranceProgress: 0,
    frameCount: 0,
    separationProgress: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    lastRpmTier: 0,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  // ── Main render loop ────────────────────────────────────────
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
      const maxR = minDim * 0.42;
      const breath = p.breathAmplitude;
      s.frameCount++;

      // ── Entrance ──────────────────────────────────────
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // ── Hold detection ────────────────────────────────
      if (s.isDragging && !s.hasMoved) {
        s.holdFrames++;
        if (!s.isHolding && s.holdFrames > HOLD_THRESHOLD_FRAMES) {
          s.isHolding = true;
          cb.onHaptic('hold_start');
        }
      }

      // ── Physics ───────────────────────────────────────
      if (!p.reducedMotion) {
        if (s.isHolding) {
          const dir = s.rpm >= 0 ? 1 : -1;
          const holdDir = s.rpm === 0 ? 1 : dir;
          s.rpm += HOLD_ACCEL * holdDir;
          s.rpm = Math.max(-MAX_RPM, Math.min(MAX_RPM, s.rpm));
        }

        if (!s.isDragging || !s.hasMoved) {
          s.rpm *= FRICTION;
        }

        if (Math.abs(s.rpm) < RPM_EPSILON) {
          s.rpm = 0;
        }

        s.masterAngle += s.rpm;
      }

      const normalizedRpm = Math.min(1, Math.abs(s.rpm) / MAX_RPM);

      // RPM tier haptic feedback
      const rpmTier = Math.floor(normalizedRpm * 5);
      if (rpmTier !== s.lastRpmTier && rpmTier > s.lastRpmTier) {
        cb.onHaptic('step_advance');
        s.lastRpmTier = rpmTier;
      }
      s.lastRpmTier = rpmTier;

      // Separation progress: increases with sustained RPM
      if (normalizedRpm > 0.3) {
        s.separationProgress = Math.min(1, s.separationProgress + 0.003 * normalizedRpm);
      } else if (normalizedRpm < 0.05) {
        // Very slowly drift back toward blended when stopped
        s.separationProgress = Math.max(0, s.separationProgress - 0.0005);
      }

      // Report state
      cb.onStateChange?.(s.separationProgress);

      // Check for completion
      if (s.separationProgress >= 0.99 && normalizedRpm > 0.5) {
        cb.onHaptic('completion');
        s.separationProgress = 1;
      }

      // ── Color computation ─────────────────────────────
      const factColor: RGB = s.primaryRgb;
      const feelingColor: RGB = s.accentRgb;
      const activeColor = lerpColor(factColor, feelingColor, 0.5);

      // ── Layer 1: Radial glow background ───────────────
      const glowR = maxR * (1.2 + breath * 0.08) * entrance;
      const glowAlpha = ELEMENT_ALPHA.glow.min + normalizedRpm * (ELEMENT_ALPHA.glow.max - ELEMENT_ALPHA.glow.min);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(activeColor, glowAlpha * entrance));
      bgGrad.addColorStop(0.5, rgba(activeColor, glowAlpha * 0.3 * entrance));
      bgGrad.addColorStop(1, rgba(activeColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Layer 2: Centrifuge chamber ring ───────────────
      const chamberR = maxR * entrance;
      const chamberLineW = minDim * 0.001;
      const chamberAlpha = ELEMENT_ALPHA.secondary.min + entrance * (ELEMENT_ALPHA.secondary.max - ELEMENT_ALPHA.secondary.min);

      ctx.beginPath();
      ctx.arc(cx, cy, chamberR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(activeColor, chamberAlpha);
      ctx.lineWidth = chamberLineW;
      ctx.stroke();

      // Inner ring (separation boundary)
      const innerR = maxR * 0.25 * entrance;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(factColor, chamberAlpha * 0.6);
      ctx.lineWidth = chamberLineW * 0.7;
      if (!p.reducedMotion) {
        ctx.setLineDash([minDim * 0.004, minDim * 0.008]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Layer 3: Dial marks ───────────────────────────
      const dialTickCount = 24;
      const dialTickStep = (Math.PI * 2) / dialTickCount;
      const baseDialAngle = p.reducedMotion ? 0 : s.masterAngle;

      for (let i = 0; i < dialTickCount; i++) {
        const tickAngle = baseDialAngle + i * dialTickStep;
        const cos = Math.cos(tickAngle);
        const sin = Math.sin(tickAngle);
        const isMajor = i % 6 === 0;
        const tickInner = chamberR - minDim * (isMajor ? 0.02 : 0.01);
        const tickOuter = chamberR + minDim * (isMajor ? 0.01 : 0.005);

        ctx.beginPath();
        ctx.moveTo(cx + cos * tickInner, cy + sin * tickInner);
        ctx.lineTo(cx + cos * tickOuter, cy + sin * tickOuter);
        ctx.strokeStyle = rgba(activeColor, (isMajor ? 0.08 : 0.04) * entrance);
        ctx.lineWidth = minDim * (isMajor ? 0.001 : 0.0006);
        ctx.stroke();
      }

      // ── Layer 4: Particles ────────────────────────────
      for (const particle of s.particles) {
        const particleEntrance = entrance;
        if (particleEntrance <= 0) continue;

        // Separation physics: heavy particles settle inward, light ones fling out
        const sep = s.separationProgress;
        const targetR = particle.density < 0.4
          ? 0.05 + particle.density * 0.4  // facts settle near center
          : 0.3 + (particle.density - 0.4) * 0.7; // feelings fling outward

        const currentTargetR = particle.originRadius * (1 - sep) + targetR * sep;
        particle.radius += (currentTargetR - particle.radius) * 0.02;

        // Rotate particles
        if (!p.reducedMotion) {
          particle.angle += s.rpm * particle.angularOffset;
        }

        const r = particle.radius * maxR * entrance;
        const px = cx + Math.cos(particle.angle) * r;
        const py = cy + Math.sin(particle.angle) * r;

        // Shimmer
        const shimmer = 0.6 + 0.4 * Math.sin(s.frameCount * 0.025 * ms + particle.phase);

        // Color: facts are primary, feelings are accent
        const pColor = lerpColor(factColor, feelingColor, particle.density);

        // Evaporation: high-density-outward particles fade as they separate
        const evaporation = particle.density > 0.6 && sep > 0.5
          ? Math.max(0, 1 - (sep - 0.5) * 2 * (particle.density - 0.6) * 1.5)
          : 1;

        const pAlpha = particle.brightness * shimmer * particleEntrance * evaporation *
          (ELEMENT_ALPHA.primary.min + normalizedRpm * (ELEMENT_ALPHA.primary.max - ELEMENT_ALPHA.primary.min));

        if (pAlpha < 0.001) continue;

        const pSize = particle.sizeFrac * minDim;

        // Draw particle
        ctx.beginPath();
        ctx.arc(px, py, pSize * (1 + breath * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = rgba(pColor, pAlpha);
        ctx.fill();

        // Glow on bright heavy particles near center
        if (particle.density < 0.3 && particle.brightness > 0.6 && sep > 0.3) {
          ctx.beginPath();
          ctx.arc(px, py, pSize * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = rgba(factColor, pAlpha * 0.12);
          ctx.fill();
        }
      }

      // ── Layer 5: Central "fact" glow (emerges with separation) ──
      if (s.separationProgress > 0.2) {
        const factGlowR = innerR * (0.8 + breath * 0.1);
        const factAlpha = (s.separationProgress - 0.2) * 1.25 * ELEMENT_ALPHA.glow.max * entrance;
        const factGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, factGlowR);
        factGrad.addColorStop(0, rgba(factColor, factAlpha));
        factGrad.addColorStop(0.6, rgba(factColor, factAlpha * 0.3));
        factGrad.addColorStop(1, rgba(factColor, 0));
        ctx.fillStyle = factGrad;
        ctx.fillRect(cx - factGlowR, cy - factGlowR, factGlowR * 2, factGlowR * 2);
      }

      // ── Center dot ────────────────────────────────────
      const centerSize = minDim * (0.003 + breath * 0.001 + s.separationProgress * 0.002) * entrance;
      const centerAlpha = (0.2 + s.separationProgress * 0.3 + breath * 0.1) * entrance;
      ctx.beginPath();
      ctx.arc(cx, cy, centerSize, 0, Math.PI * 2);
      ctx.fillStyle = rgba(factColor, centerAlpha);
      ctx.fill();

      // ── Resolve phase ─────────────────────────────────
      if (p.phase === 'resolve') {
        s.rpm *= 0.96;
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ────────────────────────
    const getPointerAngle = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const pcx = rect.width / 2;
      const pcy = rect.height / 2;
      const dx = clientX - rect.left - pcx;
      const dy = clientY - rect.top - pcy;
      return Math.atan2(dy, dx);
    };

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = true;
      s.isHolding = false;
      s.holdFrames = 0;
      s.hasMoved = false;
      s.lastPointerAngle = getPointerAngle(e.clientX, e.clientY);
      s.pointerStartX = e.clientX;
      s.pointerStartY = e.clientY;
      callbacksRef.current.onHaptic('tap');
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const dx = e.clientX - s.pointerStartX;
      const dy = e.clientY - s.pointerStartY;
      if (!s.hasMoved && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        s.hasMoved = true;
        s.isHolding = false;
        s.holdFrames = 0;
      }
      if (s.hasMoved) {
        const newAngle = getPointerAngle(e.clientX, e.clientY);
        let delta = newAngle - s.lastPointerAngle;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        s.rpm += delta * DRAG_SENSITIVITY;
        s.rpm = Math.max(-MAX_RPM, Math.min(MAX_RPM, s.rpm));
        s.lastPointerAngle = newAngle;
      }
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isDragging = false;
      s.isHolding = false;
      s.holdFrames = 0;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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
          cursor: 'grab',
        }}
      />
    </div>
  );
}