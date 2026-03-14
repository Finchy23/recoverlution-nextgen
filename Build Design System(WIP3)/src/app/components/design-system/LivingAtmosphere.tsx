import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import { colors } from './tokens';
import { room as roomTokens, layer } from './surface-tokens';

interface AtmosphereSignature {
  primary: string;
  secondary: string;
  tertiary: string;
}

const signatures: Record<string, AtmosphereSignature> = {
  sanctuary: { primary: colors.brand.purple.deep, secondary: colors.accent.cyan.dark, tertiary: colors.brand.purple.primary },
  doctrine: { primary: colors.brand.purple.dark, secondary: colors.brand.purple.primary, tertiary: colors.brand.purple.light },
  governors: { primary: colors.brand.purple.mid, secondary: colors.brand.purple.primary, tertiary: colors.status.amber.bright },
  compatibility: { primary: colors.accent.cyan.primary, secondary: colors.status.green.bright, tertiary: colors.brand.purple.primary },
  tokens: { primary: colors.brand.purple.primary, secondary: colors.brand.purple.dark, tertiary: colors.brand.purple.light },
  surfaces: { primary: colors.accent.cyan.dark, secondary: colors.accent.cyan.primary, tertiary: colors.brand.purple.deep },
  typography: { primary: colors.brand.purple.dark, secondary: colors.brand.purple.light, tertiary: colors.brand.purple.deep },
  motion: { primary: colors.accent.cyan.primary, secondary: colors.accent.cyan.dark, tertiary: colors.brand.purple.primary },
  rooms: { primary: colors.accent.green.primary, secondary: colors.brand.purple.deep, tertiary: colors.accent.cyan.primary },
  components: { primary: colors.brand.purple.primary, secondary: colors.accent.cyan.primary, tertiary: colors.brand.purple.deep },
  interaction: { primary: colors.accent.cyan.primary, secondary: colors.brand.purple.primary, tertiary: colors.accent.cyan.dark },
};

interface LivingAtmosphereProps {
  room?: string;
}

export function LivingAtmosphere({ room = 'sanctuary' }: LivingAtmosphereProps) {
  const shouldReduceMotion = useReducedMotion();
  const [sig, setSig] = useState(signatures[room] || signatures.sanctuary);

  useEffect(() => {
    setSig(signatures[room] || signatures.sanctuary);
  }, [room]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: layer.canvas }}
      aria-hidden="true"
    >
      {/* Base field */}
      <div className="absolute inset-0" style={{ background: roomTokens.base }} />

      {/* Primary atmospheric layer — slow, deep breath */}
      <motion.div
        className="absolute inset-0"
        animate={shouldReduceMotion ? {} : {
          opacity: [0.25, 0.45, 0.25],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 10.9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(ellipse 70% 50% at 30% 25%, ${sig.primary}35 0%, transparent 70%)`,
          transformOrigin: '30% 25%',
        }}
      />

      {/* Secondary layer — offset phase, different position */}
      <motion.div
        className="absolute inset-0"
        animate={shouldReduceMotion ? {} : {
          opacity: [0.15, 0.3, 0.15],
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 10.9,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3.6, // ~1/3 phase offset
        }}
        style={{
          background: `radial-gradient(ellipse 50% 45% at 75% 70%, ${sig.secondary}25 0%, transparent 65%)`,
          transformOrigin: '75% 70%',
        }}
      />

      {/* Tertiary — very subtle, long period */}
      <motion.div
        className="absolute inset-0"
        animate={shouldReduceMotion ? {} : {
          opacity: [0.08, 0.18, 0.08],
        }}
        transition={{
          duration: 21.8, // double breath cycle, ultra slow
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 7.2,
        }}
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% 40%, ${sig.tertiary}12 0%, transparent 80%)`,
        }}
      />

      {/* Vignette — always present, grounds the edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, ${roomTokens.base} 100%)`,
        }}
      />
    </div>
  );
}