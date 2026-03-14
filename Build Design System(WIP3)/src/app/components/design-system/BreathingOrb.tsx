/**
 * BREATHING ORB — Compact Focal Point
 *
 * The NavShell brand mark. A miniature focal well —
 * same material language as the Anchor: light gathered
 * within glass, not a solid circle sitting on it.
 *
 * Transparent center, refractive haze, breathing luminance.
 */

import { motion } from 'motion/react';
import { colors } from './tokens';

interface BreathingOrbProps {
  size?: number;
  color?: string;
  className?: string;
}

export function BreathingOrb({ size = 64, color = colors.brand.purple.primary, className = '' }: BreathingOrbProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer refractive haze */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 2.2,
          height: size * 2.2,
          background: `radial-gradient(circle, ${color}0a 0%, ${color}04 35%, transparent 60%)`,
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10.9, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Mid glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 1.4,
          height: size * 1.4,
          background: `radial-gradient(circle, ${color}10 0%, ${color}06 45%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10.9, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
      {/* Focal core — transparent center, matching the Anchor's material */}
      <motion.div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 38% 36%, ${color}40, ${color}1a 50%, ${color}08 80%, transparent 100%)`,
          boxShadow: `0 0 ${size * 0.6}px ${color}20, 0 0 ${size * 1.2}px ${color}08`,
        }}
        animate={{
          scale: [1, 1.06, 1],
          boxShadow: [
            `0 0 ${size * 0.6}px ${color}20, 0 0 ${size * 1.2}px ${color}08`,
            `0 0 ${size * 0.8}px ${color}2a, 0 0 ${size * 1.5}px ${color}10`,
            `0 0 ${size * 0.6}px ${color}20, 0 0 ${size * 1.2}px ${color}08`,
          ],
        }}
        transition={{ duration: 10.9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
