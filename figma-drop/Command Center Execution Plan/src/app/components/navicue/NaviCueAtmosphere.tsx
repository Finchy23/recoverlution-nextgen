/**
 * NAVICUE ATMOSPHERE
 * 
 * Shared ambient visual layer for all NaviCues.
 * Provides: background gradient, floating particles, bottom breath line,
 * secondary layers (vignette/depth), ambient glow orb.
 * 
 * Every NaviCue is a tiny world. This is the sky, the air, the light.
 * The bespoke implementation provides the ground, the interaction, the poetry.
 * 
 * MOBILE-FIRST: All animation is autonomous -- no cursor/pointer dependency.
 * Particles drift, glow orbs breathe, breath lines pulse on their own.
 * The atmosphere is alive without requiring interaction.
 * 
 * V4: Full atmosphere mode support -- 10 distinct particle motion systems
 * driven by the compositor's atmosphereMode selection. Each mode creates
 * a fundamentally different particle behavior:
 * 
 *   drift       -- Lazy upward float, barely there (default)
 *   orbital     -- Circular paths around center
 *   convergent  -- Drawn toward center, then released
 *   cascade     -- Waterfall downward, scatter at bottom
 *   tidal       -- Rhythmic lateral sweep synced to breath
 *   swarm       -- Organic clustering, seeking behavior
 *   radial      -- Outward pulse from center on breath peaks
 *   lattice     -- Grid-locked with subtle oscillation
 *   spiral      -- Logarithmic spiral, slow tightening
 *   brownian    -- True random walk, chaotic but gentle
 * 
 * Usage:
 * ```tsx
 * <NaviCueAtmosphere
 *   palette={palette}
 *   atmosphere={atmosphere}
 *   atmosphereMode="orbital"
 *   breathProgress={0.5}
 * />
 * ```
 */

import { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  type NaviCuePalette, 
  type NaviCueAtmosphereConfig,
  generateParticles,
  type ParticleConfig,
} from '@/app/design-system/navicue-blueprint';
import type { AtmosphereMode } from '@/app/design-system/navicue-compositor';

// =====================================================================
// MOTION VECTOR CALCULATORS PER ATMOSPHERE MODE
// =====================================================================

/**
 * Each mode returns { x: number[], y: number[] } keyframe arrays
 * that motion/react will animate through. The particle config (p)
 * provides per-particle variation via its randomized properties.
 * 
 * All values are in px (relative to particle's initial position).
 * speedMult scales the overall animation speed.
 * drift is the configured drift range from the atmosphere mood.
 */
interface MotionVectors {
  x: number[];
  y: number[];
}

function calcDrift(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Original: gentle upward float with lateral wander
  return {
    x: [0, Math.sin(p.angle) * (drift / 2.6) * speed],
    y: [0, -30 * speed, -60 * speed],
  };
}

function calcOrbital(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Circular paths around the particle's local origin
  const radius = (drift * 0.6) + (p.size * 4);
  const steps = 4;
  const startAngle = (p.angle / 360) * Math.PI * 2;
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (i / steps) * Math.PI * 2;
    x.push(Math.cos(angle) * radius * speed * 0.5);
    y.push(Math.sin(angle) * radius * speed * 0.5);
  }
  return { x, y };
}

function calcConvergent(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Draw toward center (50%, 50%), then spring back
  const centerPullX = (50 - p.x) * 0.3 * speed;
  const centerPullY = (50 - p.y) * 0.3 * speed;
  return {
    x: [0, centerPullX, centerPullX * 0.3, 0],
    y: [0, centerPullY, centerPullY * 0.3, 0],
  };
}

function calcCascade(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Waterfall: strong downward with lateral scatter at bottom
  const lateralScatter = Math.sin(p.angle) * drift * 0.4 * speed;
  return {
    x: [0, lateralScatter * 0.2, lateralScatter],
    y: [0, 40 * speed, 80 * speed],
  };
}

function calcTidal(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Rhythmic lateral sweep -- breath-synced wave
  const amplitude = drift * 0.8 * speed;
  const verticalDrift = (p.angle / 360 - 0.5) * 10 * speed;
  return {
    x: [-amplitude, amplitude, -amplitude],
    y: [0, verticalDrift, 0],
  };
}

function calcSwarm(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Organic clustering: move toward a local attractor, then jitter
  const attractorX = Math.sin(p.id * 1.7) * drift * 0.3;
  const attractorY = Math.cos(p.id * 2.3) * drift * 0.3;
  const jitterX = Math.sin(p.angle * 3.1) * drift * 0.15 * speed;
  const jitterY = Math.cos(p.angle * 2.7) * drift * 0.15 * speed;
  return {
    x: [0, attractorX * speed, attractorX * speed + jitterX, attractorX * speed * 0.5],
    y: [0, attractorY * speed, attractorY * speed + jitterY, attractorY * speed * 0.5],
  };
}

function calcRadial(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Outward pulse from center on breath peaks
  const angle = (p.angle / 360) * Math.PI * 2;
  const outward = drift * 0.7 * speed;
  return {
    x: [0, Math.cos(angle) * outward * 0.3, Math.cos(angle) * outward, 0],
    y: [0, Math.sin(angle) * outward * 0.3, Math.sin(angle) * outward, 0],
  };
}

function calcLattice(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Grid-locked positions with subtle oscillation
  const oscillateX = Math.sin(p.angle) * 3 * speed;
  const oscillateY = Math.cos(p.angle) * 3 * speed;
  return {
    x: [0, oscillateX, -oscillateX, 0],
    y: [0, oscillateY, -oscillateY, 0],
  };
}

function calcSpiral(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Logarithmic spiral: increasing radius as angle increases
  const steps = 5;
  const startAngle = (p.angle / 360) * Math.PI * 2;
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startAngle + t * Math.PI * 1.5; // 3/4 turn
    const radius = (t * drift * 0.5 + 2) * speed * 0.4;
    x.push(Math.cos(angle) * radius);
    y.push(Math.sin(angle) * radius - t * 8 * speed); // slight upward bias
  }
  return { x, y };
}

function calcBrownian(p: ParticleConfig, drift: number, speed: number): MotionVectors {
  // Random walk: zigzag path with no directional bias
  const steps = 5;
  const stepSize = drift * 0.25 * speed;
  const x: number[] = [0];
  const y: number[] = [0];
  // Use particle properties as pseudo-random source for determinism
  let seedX = p.angle * 13.7;
  let seedY = p.angle * 7.3 + p.id * 3.1;
  for (let i = 1; i <= steps; i++) {
    seedX = (seedX * 9.1 + 0.3) % 1;
    seedY = (seedY * 7.7 + 0.7) % 1;
    x.push(x[i - 1] + (Math.sin(seedX * Math.PI * 2) * stepSize));
    y.push(y[i - 1] + (Math.cos(seedY * Math.PI * 2) * stepSize));
  }
  return { x, y };
}

/**
 * Resolve motion vectors for a particle based on the atmosphere mode.
 */
function getMotionVectors(
  mode: AtmosphereMode | undefined,
  p: ParticleConfig,
  drift: number,
  speed: number,
): MotionVectors {
  switch (mode) {
    case 'orbital':     return calcOrbital(p, drift, speed);
    case 'convergent':  return calcConvergent(p, drift, speed);
    case 'cascade':     return calcCascade(p, drift, speed);
    case 'tidal':       return calcTidal(p, drift, speed);
    case 'swarm':       return calcSwarm(p, drift, speed);
    case 'radial':      return calcRadial(p, drift, speed);
    case 'lattice':     return calcLattice(p, drift, speed);
    case 'spiral':      return calcSpiral(p, drift, speed);
    case 'brownian':    return calcBrownian(p, drift, speed);
    case 'drift':
    default:            return calcDrift(p, drift, speed);
  }
}

/**
 * Get the CSS animation easing for a mode.
 * Some modes benefit from spring-like or stepped easing.
 */
function getModeEasing(mode: AtmosphereMode | undefined): string {
  switch (mode) {
    case 'convergent':  return 'easeInOut';
    case 'tidal':       return 'easeInOut';
    case 'radial':      return 'easeOut';
    case 'lattice':     return 'easeInOut';
    case 'spiral':      return 'easeInOut';
    default:            return 'linear';
  }
}

// =====================================================================
// COMPONENT
// =====================================================================

interface NaviCueAtmosphereProps {
  palette: NaviCuePalette;
  atmosphere: NaviCueAtmosphereConfig;
  /** Atmosphere mode from compositor (determines particle motion) */
  atmosphereMode?: AtmosphereMode;
  /** Optional: 0-1 progress for the bottom breath line */
  breathProgress?: number;
  /** Optional: override particle seed for unique variations */
  particleSeed?: number;
  /** Whether the atmosphere is in afterglow state (warmer, slower) */
  isAfterglow?: boolean;
  /** Chrono-world speed multiplier (morning=0.85, work=1.25, night=0.75) */
  chronoSpeedMult?: number;
  /** Interaction hook type (for ceremony grammar atmospheric response) */
  interactionHook?: string;
  /** Whether the user is currently in the active interaction stage */
  interactionActive?: boolean;
}

export function NaviCueAtmosphere({
  palette,
  atmosphere,
  atmosphereMode,
  breathProgress = 0,
  particleSeed,
  isAfterglow = false,
  chronoSpeedMult = 1,
  interactionHook,
  interactionActive = false,
}: NaviCueAtmosphereProps) {
  const particles = useRef(
    generateParticles(atmosphere.particleCount, particleSeed)
  ).current;

  const speedMult = isAfterglow ? 0.5 : atmosphere.particleSpeed * chronoSpeedMult;
  const mood = atmosphere.mood;
  const opacityMax = mood?.particleOpacityMax ?? 0.25;
  const secondaryFraction = mood?.secondaryParticleFraction ?? 0;
  const secondaryColor = atmosphere.secondaryParticleColor;
  const driftRange = atmosphere.particleDrift;
  const easing = getModeEasing(atmosphereMode);

  // ── Ceremony Grammar: Atmospheric Response ──────────────────────────
  // From Blueprint XVII:
  //   During hold: particles slow to 60%, glow orb brightens 10%
  //   During observe: breath amplitude drives scale pulse on glow
  //   During type: subtle micro-ripple (handled at specimen level)
  // The interactionActive flag + hook type modulates the atmosphere.
  const interactionSlowdown = (interactionActive && interactionHook === 'hold') ? 0.6 : 1;
  const interactionGlowBoost = (interactionActive && interactionHook === 'hold') ? 1.1
    : (interactionActive && interactionHook === 'observe') ? 1.05
    : 1;

  // Apply interaction slowdown to effective speed
  const effectiveSpeedMult = speedMult * interactionSlowdown;

  return (
    <>
      {/* -- Secondary background layer (vignette, depth ring, sky wash) -- */}
      {atmosphere.secondaryLayerCSS && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: atmosphere.secondaryLayerCSS,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* -- Ambient glow orb -- soft radial light that breathes -- */}
      {/* Ceremony grammar: glow brightens 10% during hold, 5% during observe */}
      {atmosphere.glowOrb && (
        <motion.div
          initial={{
            opacity: isAfterglow
              ? atmosphere.glowOrb.opacity * 0.5 * interactionGlowBoost
              : atmosphere.glowOrb.opacity * 0.6 * interactionGlowBoost,
            scale: 1,
          }}
          animate={{
            opacity: isAfterglow
              ? [atmosphere.glowOrb.opacity * 0.5 * interactionGlowBoost, atmosphere.glowOrb.opacity * 0.8 * interactionGlowBoost, atmosphere.glowOrb.opacity * 0.5 * interactionGlowBoost]
              : [atmosphere.glowOrb.opacity * 0.6 * interactionGlowBoost, atmosphere.glowOrb.opacity * interactionGlowBoost, atmosphere.glowOrb.opacity * 0.6 * interactionGlowBoost],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: isAfterglow ? 8 : 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: atmosphere.glowOrb.x,
            top: atmosphere.glowOrb.y,
            width: atmosphere.glowOrb.size,
            height: atmosphere.glowOrb.size,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${atmosphere.glowOrb.color}, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* -- Ambient particles (mode-aware motion vectors) -- */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => {
          // Determine if this particle gets the secondary color
          const useSecondary = secondaryColor && i < particles.length * secondaryFraction;
          const color = useSecondary ? secondaryColor : atmosphere.particleColor;
          const particleOpacity = isAfterglow ? opacityMax * 0.6 : opacityMax;
          // Organic variation: stagger peak opacity
          const opacityVariation = 0.7 + (p.angle / 360) * 0.3;

          // Calculate motion vectors based on atmosphere mode
          const vectors = getMotionVectors(atmosphereMode, p, driftRange, effectiveSpeedMult);

          return (
            <motion.div
              key={p.id}
              initial={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                opacity: 0,
              }}
              animate={{
                opacity: [0, particleOpacity * opacityVariation, particleOpacity * 0.4, 0],
                x: vectors.x,
                y: vectors.y,
              }}
              transition={{
                duration: p.duration / effectiveSpeedMult,
                repeat: Infinity,
                delay: p.delay,
                ease: easing as any,
              }}
              style={{
                position: 'absolute',
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: color,
              }}
            />
          );
        })}
      </div>

      {/* -- Bottom breath line -- */}
      <motion.div
        initial={{
          scaleX: breathProgress,
          opacity: isAfterglow ? 0.5 : 0.3,
        }}
        animate={{
          scaleX: breathProgress,
          opacity: isAfterglow ? 0.5 : 0.3,
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${atmosphere.breathLineColor}, transparent)`,
          transformOrigin: 'center',
          zIndex: 2,
        }}
      />
    </>
  );
}