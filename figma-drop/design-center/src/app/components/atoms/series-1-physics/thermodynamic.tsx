/**
 * ATOM 010: THE THERMODYNAMIC ENGINE
 * =====================================
 * Series 1 — Physics Engines · Position 10
 *
 * Emotions are energy states. This atom treats anger as heat,
 * apathy as cold. 200+ particles with individual temperature,
 * velocity, and color form a living thermodynamic system.
 * The user forges chaos into structure — tap as hammer-strike,
 * hold as cooling, drag as flow direction.
 *
 * PHYSICS:
 *   - Individual particle temperature → velocity + color + glow
 *   - Tap creates shockwave (redistributes energy, doesn't remove it)
 *   - Hold creates cooling field at touch point
 *   - Drag creates directional flow (organizing particles)
 *   - Global temperature = average of all particles
 *   - Temperature thresholds fire step_advance
 *   - At equilibrium temp: particles crystallize into lattice
 *   - Heat haze distortion at high temperatures
 *   - Breath modulates cooling efficiency
 *
 * TEMPERATURE MAP:
 *   1.0  Inferno — white-hot, chaotic, violent
 *   0.8  Forge   — red-orange, energetic, hammerable
 *   0.5  Warm    — amber, flowing, workable
 *   0.3  Cool    — blue, calm, orderly
 *   0.1  Ice     — pale blue-white, crystalline, still
 *   0.0  Frozen  — locked lattice, completion
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No particle drift, static temperature display
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, roundedRect, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Total particles in the thermodynamic system */
const PARTICLE_COUNT = 180;
/** Starting global temperature (0–1) */
const INITIAL_TEMP = 0.85;
/** Cooling rate per frame when holding */
const HOLD_COOL_RATE = 0.004;
/** Cooling field radius (fraction of min dim) */
const COOL_FIELD_RADIUS = 0.2;
/** Tap shockwave radius (fraction of min dim) */
const SHOCKWAVE_RADIUS = 0.3;
/** Tap energy redistribution (doesn't remove, reorganizes) */
const TAP_REORGANIZE = 0.4;
/** Drag flow strength */
const DRAG_FLOW_STRENGTH = 0.04;
/** Temperature where crystallization begins */
const CRYSTAL_TEMP = 0.12;
/** Temperature thresholds for step_advance */
const TEMP_THRESHOLDS = [0.7, 0.5, 0.3, 0.15];
/** Particle max speed at temperature 1.0 */
const MAX_SPEED = 3.5;
/** Particle min speed at temperature 0.0 */
const MIN_SPEED = 0.05;
/** Natural cooling rate (ambient dissipation per frame) */
const AMBIENT_COOL = 0.0002;
/** Lattice grid spacing for crystallization */
const LATTICE_SPACING_FRAC = 0.04;
/** Hold frames before cooling activates */
const HOLD_ACTIVATE = 10;

// =====================================================================
// PARTICLE
// =====================================================================

interface ThermoParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Individual temperature 0–1 */
  temp: number;
  /** Base size */
  size: number;
  /** Individual noise seed */
  seed: number;
  /** Whether this particle has crystallized */
  crystallized: boolean;
  /** Crystal lattice target X */
  crystalX: number;
  /** Crystal lattice target Y */
  crystalY: number;
}

function createParticles(w: number, h: number): ThermoParticle[] {
  const particles: ThermoParticle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const temp = INITIAL_TEMP + (Math.random() - 0.5) * 0.2;
    const speed = temp * MAX_SPEED;
    const angle = Math.random() * Math.PI * 2;
    particles.push({
      x: w * 0.15 + Math.random() * w * 0.7,
      y: h * 0.15 + Math.random() * h * 0.7,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      temp: Math.max(0, Math.min(1, temp)),
      size: 1.5 + Math.random() * 2.5,
      seed: Math.random() * 100,
      crystallized: false,
      crystalX: 0,
      crystalY: 0,
    });
  }
  return particles;
}

// =====================================================================
// SHOCKWAVE
// =====================================================================

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
}

// =====================================================================
// COLOR
// =====================================================================

/** Temperature → color mapping */
function tempToColor(t: number, primary: RGB, accent: RGB): RGB {
  if (t > 0.8) {
    // White-hot → red
    return lerpColor([255, 80, 30], [255, 255, 200], (t - 0.8) / 0.2);
  } else if (t > 0.5) {
    // Red → amber
    return lerpColor(lerpColor([220, 140, 50], accent, 0.2), [255, 80, 30], (t - 0.5) / 0.3);
  } else if (t > 0.3) {
    // Amber → blue
    return lerpColor(lerpColor([80, 120, 200], primary, 0.2), [220, 140, 50], (t - 0.3) / 0.2);
  } else if (t > 0.1) {
    // Blue → ice
    return lerpColor([160, 200, 240], [80, 120, 200], (t - 0.1) / 0.2);
  } else {
    // Ice → crystalline white
    return lerpColor([220, 230, 250], [160, 200, 240], t / 0.1);
  }
}

// =====================================================================
// THE COMPONENT
// =====================================================================

export default function ThermodynamicAtom({
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

  const stateRef = useRef<{
    particles: ThermoParticle[];
    shockwaves: Shockwave[];
    globalTemp: number;
    isHolding: boolean;
    holdFrames: number;
    holdX: number;
    holdY: number;
    isDragging: boolean;
    dragX: number;
    dragY: number;
    prevDragX: number;
    prevDragY: number;
    lastThresholdIndex: number;
    crystallized: boolean;
    crystalProgress: number;
    entranceProgress: number;
    frameCount: number;
    primaryRgb: RGB;
    accentRgb: RGB;
    initialized: boolean;
  }>({
    particles: [],
    shockwaves: [],
    globalTemp: INITIAL_TEMP,
    isHolding: false,
    holdFrames: 0,
    holdX: 0,
    holdY: 0,
    isDragging: false,
    dragX: 0,
    dragY: 0,
    prevDragX: 0,
    prevDragY: 0,
    lastThresholdIndex: -1,
    crystallized: false,
    crystalProgress: 0,
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

  // ── Main render loop ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      s.isHolding = true;
      s.holdFrames = 0;
      s.holdX = px;
      s.holdY = py;
      s.isDragging = true;
      s.dragX = px;
      s.dragY = py;
      s.prevDragX = px;
      s.prevDragY = py;
      callbacksRef.current.onHaptic('tap');
      s.shockwaves.push({
        x: px, y: py, radius: 0,
        maxRadius: minDim * SHOCKWAVE_RADIUS, life: 1,
      });
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      if (s.isDragging) {
        s.prevDragX = s.dragX;
        s.prevDragY = s.dragY;
        s.dragX = px;
        s.dragY = py;
      }
      if (s.isHolding) {
        s.holdX = px;
        s.holdY = py;
      }
    };
    const onUp = (e: PointerEvent) => {
      if (s.holdFrames > HOLD_ACTIVATE) {
        callbacksRef.current.onHaptic('hold_release');
      }
      s.isHolding = false;
      s.holdFrames = 0;
      s.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    if (!s.initialized) {
      s.particles = createParticles(w, h);
      // Assign crystal lattice targets
      const spacing = minDim * LATTICE_SPACING_FRAC;
      const cols = Math.floor(w * 0.6 / spacing);
      const rows = Math.floor(h * 0.6 / spacing);
      const offsetX = (w - cols * spacing) / 2;
      const offsetY = (h - rows * spacing) / 2;
      for (let i = 0; i < s.particles.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols) % rows;
        s.particles[i].crystalX = offsetX + col * spacing + spacing / 2;
        s.particles[i].crystalY = offsetY + row * spacing + spacing / 2;
      }
      s.initialized = true;
    }

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
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

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── Hold state ─────────────────────────��─────────
      if (s.isHolding) {
        s.holdFrames++;
        if (s.holdFrames === HOLD_ACTIVATE) {
          cb.onHaptic('hold_start');
        }
        if (s.holdFrames === HOLD_ACTIVATE * 3) {
          cb.onHaptic('hold_threshold');
        }
      }

      // ══════════════════════════════════════════════════
      // PHYSICS
      // ══════════════════════════════════════════════════

      let tempSum = 0;

      for (const particle of s.particles) {
        if (p.reducedMotion) {
          // Static — just track temperature
          tempSum += particle.temp;
          continue;
        }

        // Ambient cooling
        particle.temp = Math.max(0, particle.temp - AMBIENT_COOL);

        // Breath-enhanced cooling (breathAmplitude increases cooling)
        if (p.breathAmplitude > 0.3) {
          particle.temp = Math.max(0, particle.temp - AMBIENT_COOL * p.breathAmplitude * 2);
        }

        // Hold cooling field
        if (s.isHolding && s.holdFrames > HOLD_ACTIVATE) {
          const dx = particle.x - s.holdX;
          const dy = particle.y - s.holdY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const fieldR = minDim * COOL_FIELD_RADIUS;
          if (dist < fieldR) {
            const influence = 1 - dist / fieldR;
            const breathBoost = 1 + p.breathAmplitude * BREATH_STEADYING_THERMO;
            particle.temp = Math.max(0, particle.temp - HOLD_COOL_RATE * influence * breathBoost);
          }
        }

        // Drag flow force
        if (s.isDragging) {
          const dx = particle.x - s.dragX;
          const dy = particle.y - s.dragY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDim * 0.15 && dist > 0) {
            const flowDx = s.dragX - s.prevDragX;
            const flowDy = s.dragY - s.prevDragY;
            const influence = (1 - dist / (minDim * 0.15)) * DRAG_FLOW_STRENGTH;
            particle.vx += flowDx * influence;
            particle.vy += flowDy * influence;
          }
        }

        // Velocity from temperature
        const targetSpeed = MIN_SPEED + particle.temp * (MAX_SPEED - MIN_SPEED);
        const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);

        if (currentSpeed > 0.01) {
          // Adjust speed toward temperature-appropriate level
          const speedScale = targetSpeed / Math.max(0.01, currentSpeed);
          const blend = 0.05; // Gradual adjustment
          particle.vx *= 1 + (speedScale - 1) * blend;
          particle.vy *= 1 + (speedScale - 1) * blend;

          // Random direction perturbation (chaos scales with temp)
          const chaos = particle.temp * 0.15;
          particle.vx += (Math.random() - 0.5) * chaos;
          particle.vy += (Math.random() - 0.5) * chaos;
        } else {
          // Restart with random direction
          const angle = Math.random() * Math.PI * 2;
          particle.vx = Math.cos(angle) * targetSpeed;
          particle.vy = Math.sin(angle) * targetSpeed;
        }

        // Crystallization pull
        if (particle.temp < CRYSTAL_TEMP) {
          const pull = (CRYSTAL_TEMP - particle.temp) / CRYSTAL_TEMP * 0.02;
          particle.vx += (particle.crystalX - particle.x) * pull;
          particle.vy += (particle.crystalY - particle.y) * pull;
          particle.vx *= 0.95;
          particle.vy *= 0.95;
          particle.crystallized = true;
        } else {
          particle.crystallized = false;
        }

        // Integrate
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        const wallMargin = minDim * 0.02;
        if (particle.x < wallMargin) { particle.x = wallMargin; particle.vx *= -0.7; }
        if (particle.x > w - wallMargin) { particle.x = w - wallMargin; particle.vx *= -0.7; }
        if (particle.y < wallMargin) { particle.y = wallMargin; particle.vy *= -0.7; }
        if (particle.y > h - wallMargin) { particle.y = h - wallMargin; particle.vy *= -0.7; }

        tempSum += particle.temp;
      }

      // ── Shockwave physics ─────────────────────────────
      const shockExpand = minDim * 0.015;
      const shockRingWidth = minDim * 0.04;
      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.radius += shockExpand;
        sw.life -= 0.025;

        if (sw.life <= 0) {
          s.shockwaves.splice(i, 1);
          continue;
        }

        // Redistribute particle energy near shockwave front
        if (!p.reducedMotion) {
          for (const particle of s.particles) {
            const dx = particle.x - sw.x;
            const dy = particle.y - sw.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ringDist = Math.abs(dist - sw.radius);
            if (ringDist < shockRingWidth) {
              // Push particles outward and normalize their temperature
              const pushStrength = (1 - ringDist / shockRingWidth) * TAP_REORGANIZE * sw.life;
              if (dist > 0) {
                particle.vx += (dx / dist) * pushStrength * 3;
                particle.vy += (dy / dist) * pushStrength * 3;
              }
              // Cool particles that get hit by the shockwave (forging = cooling through impact)
              particle.temp = Math.max(0, particle.temp - pushStrength * 0.08);
              // Normalize temperature toward average
              particle.temp += (s.globalTemp - particle.temp) * pushStrength * 0.3;
            }
          }
        }
      }

      // ── Global temperature ────────────────────────────
      s.globalTemp = tempSum / PARTICLE_COUNT;

      // ── Temperature threshold haptics ─────────────────
      let currentThreshold = -1;
      for (let i = TEMP_THRESHOLDS.length - 1; i >= 0; i--) {
        if (s.globalTemp <= TEMP_THRESHOLDS[i]) {
          currentThreshold = i;
          break;
        }
      }
      if (currentThreshold > s.lastThresholdIndex) {
        cb.onHaptic('step_advance');
        s.lastThresholdIndex = currentThreshold;
      }

      // ── Crystallization check ─────────────────────────
      if (s.globalTemp < CRYSTAL_TEMP && !s.crystallized) {
        s.crystallized = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }
      if (s.crystallized) {
        s.crystalProgress = Math.min(1, s.crystalProgress + 0.005);
      }

      // ── State reporting ───────────────────────────────
      // Invert: 1 = cool/regulated, 0 = hot/chaotic
      cb.onStateChange?.(1 - s.globalTemp);

      // ══════════════════════════════════════════════════
      // RENDER
      // ══════════════════════════════════════════════════

      // ── Background — heat-responsive ─────────────────
      const bgTemp = s.globalTemp;
      const bgHot: RGB = [25, 8, 5];
      const bgCool: RGB = [5, 8, 18];
      const bgBase = lerpColor(bgCool, bgHot, bgTemp);
      const bgColor = lerpColor(bgBase, s.primaryRgb, 0.04);

      ctx.fillStyle = rgba(bgColor, entrance * 0.03);
      ctx.fillRect(0, 0, w, h);

      // Heat haze at high temperatures — wavy horizontal lines
      if (!p.reducedMotion && bgTemp > 0.5) {
        const hazeAlpha = (bgTemp - 0.5) * 0.06 * entrance;
        for (let i = 0; i < 12; i++) {
          const hy = (i / 12) * h;
          const waveAmp = bgTemp * 4;
          const waveFreq = 0.02 + bgTemp * 0.01;
          ctx.beginPath();
          for (let x = 0; x < w; x += 4) {
            const dy = Math.sin(x * waveFreq + s.frameCount * 0.05 + i) * waveAmp;
            if (x === 0) ctx.moveTo(x, hy + dy);
            else ctx.lineTo(x, hy + dy);
          }
          ctx.strokeStyle = rgba(lerpColor(bgHot, [255, 100, 30], 0.2), hazeAlpha);
          ctx.lineWidth = minDim * 0.002;
          ctx.stroke();
        }
      }

      // ── Cooling field visualization ───────────────────
      if (s.isHolding && s.holdFrames > HOLD_ACTIVATE) {
        const fieldR = minDim * COOL_FIELD_RADIUS;
        const coolGrad = ctx.createRadialGradient(
          s.holdX, s.holdY, 0,
          s.holdX, s.holdY, fieldR,
        );
        const coolAlpha = Math.min(0.15, (s.holdFrames - HOLD_ACTIVATE) * 0.002) * entrance;
        coolGrad.addColorStop(0, rgba([100, 180, 255], coolAlpha));
        coolGrad.addColorStop(0.5, rgba([60, 120, 200], coolAlpha * 0.4));
        coolGrad.addColorStop(1, rgba([60, 120, 200], 0));
        ctx.fillStyle = coolGrad;
        ctx.fillRect(s.holdX - fieldR, s.holdY - fieldR, fieldR * 2, fieldR * 2);
      }

      // ── Shockwave visualization ───────────────────────
      for (const sw of s.shockwaves) {
        // Outer ring — bright, visible
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        const swColor = tempToColor(s.globalTemp, s.primaryRgb, s.accentRgb);
        ctx.strokeStyle = rgba(swColor, sw.life * 0.4 * entrance);
        ctx.lineWidth = minDim * 0.0006;
        ctx.stroke();

        // Inner glow fill
        const swGrad = ctx.createRadialGradient(sw.x, sw.y, sw.radius * 0.7, sw.x, sw.y, sw.radius);
        swGrad.addColorStop(0, rgba(swColor, 0));
        swGrad.addColorStop(0.7, rgba(swColor, sw.life * 0.06 * entrance));
        swGrad.addColorStop(1, rgba(swColor, 0));
        ctx.fillStyle = swGrad;
        ctx.fillRect(sw.x - sw.radius, sw.y - sw.radius, sw.radius * 2, sw.radius * 2);

        // Flash at the origin point (fades fast)
        if (sw.life > 0.7) {
          const flashR = minDim * 0.03;
          const flashGrad = ctx.createRadialGradient(sw.x, sw.y, 0, sw.x, sw.y, flashR);
          const flashAlpha = (sw.life - 0.7) / 0.3;
          flashGrad.addColorStop(0, rgba([255, 255, 255], flashAlpha * 0.5 * entrance));
          flashGrad.addColorStop(0.5, rgba(swColor, flashAlpha * 0.3 * entrance));
          flashGrad.addColorStop(1, rgba(swColor, 0));
          ctx.fillStyle = flashGrad;
          ctx.fillRect(sw.x - flashR, sw.y - flashR, flashR * 2, flashR * 2);
        }
      }

      // ── Particles ─────────────────────────────────────
      for (const particle of s.particles) {
        const pColor = tempToColor(particle.temp, s.primaryRgb, s.accentRgb);
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const sizeMult = 0.7 + particle.temp * 0.6;
        const r = particle.size * sizeMult;

        // Glow intensity scales with temperature
        if (particle.temp > 0.3 && !p.reducedMotion) {
          const glowR = r * (2 + particle.temp * 3);
          const glowGrad = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, glowR,
          );
          glowGrad.addColorStop(0, rgba(pColor, particle.temp * 0.08 * entrance));
          glowGrad.addColorStop(0.5, rgba(pColor, particle.temp * 0.02 * entrance));
          glowGrad.addColorStop(1, rgba(pColor, 0));
          ctx.fillStyle = glowGrad;
          ctx.fillRect(particle.x - glowR, particle.y - glowR, glowR * 2, glowR * 2);
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, r, 0, Math.PI * 2);
        const alpha = (0.3 + particle.temp * 0.5 + (particle.crystallized ? 0.2 : 0)) * entrance;
        ctx.fillStyle = rgba(pColor, alpha);
        ctx.fill();

        // Crystal lattice connections
        if (particle.crystallized && s.crystalProgress > 0.2) {
          const connAlpha = (s.crystalProgress - 0.2) * 0.1 * entrance;
          // Draw subtle lines to nearby crystallized particles
          const crystalNearDist = minDim * LATTICE_SPACING_FRAC * 1.5;
          // Only check a few neighbors (performance)
          for (let j = 0; j < Math.min(5, s.particles.length); j++) {
            const other = s.particles[(s.particles.indexOf(particle) + j + 1) % s.particles.length];
            if (!other.crystallized) continue;
            const dx = other.x - particle.x;
            const dy = other.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < crystalNearDist && dist > 5) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = rgba(lerpColor(pColor, [200, 220, 255], 0.5), connAlpha);
              ctx.lineWidth = minDim * 0.0006;
              ctx.stroke();
            }
          }
        }

        // Motion trail for hot particles
        if (!p.reducedMotion && particle.temp > 0.5 && speed > 1) {
          const trailLen = speed * 2;
          const nx = particle.vx / speed;
          const ny = particle.vy / speed;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - nx * trailLen, particle.y - ny * trailLen);
          ctx.strokeStyle = rgba(pColor, particle.temp * 0.15 * entrance);
          ctx.lineWidth = r * 0.6;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // ── Temperature gauge (subtle, right edge) ───────
      const gaugeW = minDim * 0.006;
      const gaugeH = h * 0.3;
      const gaugeX = w - minDim * 0.04;
      const gaugeY = h * 0.5 - gaugeH / 2;
      const gaugeR = gaugeW * 0.5;

      // Track
      ctx.fillStyle = rgba([30, 25, 40], 0.3 * entrance);
      roundedRect(ctx, gaugeX - gaugeW / 2, gaugeY, gaugeW, gaugeH, gaugeR);
      ctx.fill();

      // Fill
      const fillH = s.globalTemp * gaugeH;
      const fillY = gaugeY + gaugeH - fillH;
      const fillGrad = ctx.createLinearGradient(0, gaugeY + gaugeH, 0, gaugeY);
      fillGrad.addColorStop(0, rgba(lerpColor([80, 120, 200], s.primaryRgb, 0.15), 0.4 * entrance));
      fillGrad.addColorStop(0.5, rgba([220, 140, 50], 0.4 * entrance));
      fillGrad.addColorStop(1, rgba([255, 80, 30], 0.4 * entrance));
      ctx.fillStyle = fillGrad;
      roundedRect(ctx, gaugeX - gaugeW / 2, fillY, gaugeW, fillH, gaugeR);
      ctx.fill();

      // Gauge glow at current temperature level
      const glowY = fillY;
      const gaugeGlowR = minDim * 0.025;
      const gaugeGlowGrad = ctx.createRadialGradient(gaugeX, glowY, 0, gaugeX, glowY, gaugeGlowR);
      gaugeGlowGrad.addColorStop(0, rgba(tempToColor(s.globalTemp, s.primaryRgb, s.accentRgb), 0.15 * entrance));
      gaugeGlowGrad.addColorStop(1, rgba(tempToColor(s.globalTemp, s.primaryRgb, s.accentRgb), 0));
      ctx.fillStyle = gaugeGlowGrad;
      ctx.fillRect(gaugeX - gaugeGlowR, glowY - gaugeGlowR, gaugeGlowR * 2, gaugeGlowR * 2);

      // ── Crystal completion glow ───────────────────────
      if (s.crystalProgress > 0) {
        const cGlowR = minDim * 0.4;
        const cGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, cGlowR);
        const cPulse = p.reducedMotion ? 1 : (0.9 + 0.1 * Math.sin(s.frameCount * 0.02));
        cGrad.addColorStop(0, rgba([160, 200, 240], s.crystalProgress * 0.06 * cPulse * entrance));
        cGrad.addColorStop(0.5, rgba(s.primaryRgb, s.crystalProgress * 0.02 * entrance));
        cGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = cGrad;
        ctx.fillRect(w / 2 - cGlowR, h / 2 - cGlowR, cGlowR * 2, cGlowR * 2);
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
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

const BREATH_STEADYING_THERMO = 0.8;