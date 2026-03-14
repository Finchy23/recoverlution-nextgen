/**
 * REST SURFACE — The Parasympathetic Exhale
 *
 * The biological promise that you do not have to fix yourself right now.
 * The environment slows to a deep, resonant master breath cycle.
 * From this grounded state, you choose your active recovery.
 *
 * Stub — atmospheric placeholder. Full implementation incoming.
 */

import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { font, typeSize, leading, weight, opacity, refract } from '../design-system/surface-tokens';
import { motion } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';

interface RestSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

export function RestSurface({ mode, breath }: RestSurfaceProps) {
  const breathScale = 0.97 + breath * 0.03;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Deep breath field — the exhale is the intervention */}
      <motion.div
        className="relative flex flex-col items-center"
        animate={{ scale: breathScale }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        {/* Resonant glow — parasympathetic signal */}
        <div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background: `radial-gradient(circle, ${mode.color}08 0%, ${mode.color}03 40%, transparent 70%)`,
            filter: refract.thick,
          }}
        />

        {/* Canopy — the emotional headline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: opacity.steady, y: 0 }}
          transition={{ delay: 1.2, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: font.serif,
            fontSize: typeSize.prose,
            fontWeight: weight.light,
            fontStyle: 'italic',
            color: mode.color,
            textAlign: 'center',
            maxWidth: '260px',
            lineHeight: leading.relaxed,
          }}
        >
          {mode.canopy}
        </motion.p>
      </motion.div>
    </div>
  );
}