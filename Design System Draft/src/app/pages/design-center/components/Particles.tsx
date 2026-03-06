/**
 * PARTICLES
 * ═════════
 * Atmospheric particle system used by DeviceMirror, Overview,
 * and AtmosphereLab. Generates floating ambient dots that
 * drift and pulse, creating the living-sky feel.
 *
 * Particles are generated once on mount (via useRef) so
 * random positions are stable across re-renders.
 *
 * SPATIAL GOVERNANCE:
 *   All sizes are minDim-relative via PARTICLE_SIZE tokens.
 *   Drift distances stored as minDim fractions.
 *   Alpha defaults align with ALPHA.atmosphere tier.
 */

import { useRef } from 'react';
import { motion } from 'motion/react';
import { px, PARTICLE_SIZE, ALPHA } from '@/universal-canvas';
import { colors, withAlpha } from '@/design-tokens';

interface ParticlesProps {
  /** Number of particles */
  count?: number;
  /** Particle color (rgba recommended) */
  color?: string;
  /** Vertical drift distance as minDim fraction (default ~0.06) */
  driftFrac?: number;
  /** Min opacity during cycle (default ALPHA.atmosphere.min) */
  opacityMin?: number;
  /** Max opacity during cycle (default ALPHA.atmosphere.max + headroom) */
  opacityMax?: number;
  /** Container dimensions for minDim-relative sizing */
  viewport?: { width: number; height: number };
}

export function Particles({
  count = 16,
  color = withAlpha(colors.brand.purple.primary, 0.15),
  driftFrac = 0.062,
  opacityMin = ALPHA.atmosphere.min,
  opacityMax = 0.35,
  viewport,
}: ParticlesProps) {
  const minDim = Math.min(viewport?.width ?? 320, viewport?.height ?? 652);

  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      /** minDim fraction — sm to lg particle range */
      sizeFrac: PARTICLE_SIZE.sm + Math.random() * (PARTICLE_SIZE.lg - PARTICLE_SIZE.sm),
      duration: 8 + Math.random() * 12,
      delay: Math.random() * -20,
      /** minDim fraction — lateral sway */
      lateralFrac: (Math.random() > 0.5 ? 1 : -1) * (0.006 + Math.random() * 0.019),
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -(driftFrac * minDim), 0],
            x: [0, p.lateralFrac * minDim, 0],
            opacity: [opacityMin, opacityMax, opacityMin],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: px(p.sizeFrac, minDim),
            height: px(p.sizeFrac, minDim),
            borderRadius: '50%',
            background: color,
          }}
        />
      ))}
    </div>
  );
}