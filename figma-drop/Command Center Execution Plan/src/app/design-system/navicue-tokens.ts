/**
 * @deprecated — LEGACY TOKEN FILE. DO NOT USE IN NEW CODE.
 *
 * This file contains parallel definitions that have been superseded by:
 *
 *   Colors / Magic    → `magicSignatures` in `/src/design-tokens.ts`
 *                        `createNaviCuePalette()` in `navicue-blueprint.ts`
 *   Typography        → `navicueType` in `navicue-blueprint.ts`
 *   Interaction       → `navicueInteraction` + `navicueButtonStyle()` in `navicue-blueprint.ts`
 *   Mechanism Accents → `MECHANISM_ACCENTS` in `navicue-blueprint.ts`
 *
 * Exports are preserved for backward compatibility with legacy specimens.
 * All new specimens MUST use navicue-blueprint.ts exclusively.
 *
 * Tracked for removal in: DESIGN_SYSTEM_CLEANUP
 */

import { colors, fonts } from '@/design-tokens';

// ==========================================
// NAVICUE MAGIC SIGNATURES
// ==========================================

export const navicueMagic = {
  // 1. Sacred Ordinary - Meaning in ordinary moments
  sacredOrdinary: {
    gradient: `radial-gradient(circle at 30% 40%, rgba(232, 221, 210, 0.12) 0%, transparent 60%)`,
    accent: 'rgba(212, 197, 184, 0.35)',
    text: colors.neutral.white,
    motion: {
      entry: 800,
      dwell: 2000,
      exit: 600,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  // 2. Witness / Ritual - Safety and continuity
  witnessRitual: {
    gradient: `radial-gradient(circle at 50% 30%, rgba(139, 157, 195, 0.15) 0%, transparent 65%)`,
    accent: 'rgba(139, 157, 195, 0.4)',
    text: colors.neutral.white,
    motion: {
      entry: 1000,
      dwell: 2500,
      exit: 700,
      ease: [0.19, 1, 0.22, 1],
    },
  },

  // 3. Poetic Precision - Insight with minimal words
  poeticPrecision: {
    gradient: `linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, transparent 70%)`,
    accent: 'rgba(0, 217, 255, 0.3)',
    text: colors.neutral.white,
    motion: {
      entry: 400,
      dwell: 1500,
      exit: 300,
      ease: [0.16, 1, 0.3, 1],
    },
  },

  // 4. Science × Soul - Authority with humanity
  scienceSoul: {
    gradient: `radial-gradient(ellipse at 40% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)`,
    accent: 'rgba(245, 158, 11, 0.45)',
    text: colors.neutral.white,
    motion: {
      entry: 600,
      dwell: 2000,
      exit: 500,
      ease: [0.25, 1, 0.5, 1],
    },
  },

  // 5. Koan / Paradox - Unlock reframing tension
  koanParadox: {
    gradient: `radial-gradient(circle at 60% 50%, rgba(124, 58, 237, 0.15) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 70%)`,
    accent: 'rgba(124, 58, 237, 0.4)',
    text: colors.neutral.white,
    motion: {
      entry: 700,
      dwell: 2200,
      exit: 600,
      ease: [0.65, 0, 0.35, 1],
    },
  },

  // 6. Pattern Glitch - Break autopilot
  patternGlitch: {
    gradient: `linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(251, 191, 36, 0.08) 100%)`,
    accent: 'rgba(239, 68, 68, 0.5)',
    text: colors.neutral.white,
    motion: {
      entry: 200,
      dwell: 1000,
      exit: 400,
      ease: [0.87, 0, 0.13, 1],
    },
  },

  // 7. Sensory Cinema - Embodied presence
  sensoryCinema: {
    gradient: `radial-gradient(ellipse at 50% 60%, rgba(30, 58, 95, 0.2) 0%, rgba(139, 157, 195, 0.08) 40%, transparent 70%)`,
    accent: 'rgba(139, 157, 195, 0.4)',
    text: colors.neutral.white,
    motion: {
      entry: 1200,
      dwell: 3000,
      exit: 1000,
      ease: [0.4, 0, 0.2, 1],
    },
  },

  // 8. Relational Ghost - Felt support without dependency
  relationalGhost: {
    gradient: `radial-gradient(circle at 40% 40%, rgba(233, 213, 255, 0.12) 0%, rgba(251, 207, 232, 0.08) 50%, transparent 70%)`,
    accent: 'rgba(233, 213, 255, 0.35)',
    text: colors.neutral.white,
    motion: {
      entry: 900,
      dwell: 2400,
      exit: 800,
      ease: [0.33, 1, 0.68, 1],
    },
  },
} as const;

// ==========================================
// MECHANISM ACCENTS
// ==========================================

export const mechanismAccents = {
  Metacognition: 'rgba(0, 217, 255, 0.4)', // cool cyan - clarity
  'Attention Shift': 'rgba(245, 158, 11, 0.4)', // amber - redirect
  'Self-Compassion': 'rgba(251, 207, 232, 0.4)', // soft pink - kindness
  'Values Clarification': 'rgba(212, 197, 184, 0.4)', // earth - meaning
  Exposure: 'rgba(107, 114, 128, 0.4)', // neutral gray - steady
  'Cognitive Restructuring': 'rgba(124, 58, 237, 0.4)', // purple - reframe
  'Somatic Regulation': 'rgba(139, 157, 195, 0.4)', // sky blue - breath
  'Somatic Awareness': 'rgba(30, 58, 95, 0.4)', // deep blue - body
  'Self-Advocacy': 'rgba(253, 228, 231, 0.4)', // soft pink - boundary
  Reparenting: 'rgba(233, 213, 255, 0.4)', // lavender - care
  Connection: 'rgba(251, 207, 232, 0.4)', // pink - relational
} as const;

// ==========================================
// NAVICUE TYPOGRAPHY
// ==========================================

export const navicueTypography = {
  // Primary prompt - Large, presence-filled
  primaryPrompt: {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: '300',
    lineHeight: '1.25',
    fontFamily: fonts.secondary,
    letterSpacing: '-0.01em',
  },

  // Secondary text - Supporting context
  secondaryText: {
    fontSize: 'clamp(16px, 2.5vw, 20px)',
    fontWeight: '400',
    lineHeight: '1.6',
    fontFamily: fonts.primary,
    opacity: 0.7,
  },

  // Micro copy - Labels, metadata
  microCopy: {
    fontSize: '11px',
    fontWeight: '600',
    lineHeight: '1.4',
    fontFamily: fonts.primary,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    opacity: 0.5,
  },

  // Swatch labels - Emotion/choice labels
  swatchLabel: {
    fontSize: '15px',
    fontWeight: '500',
    lineHeight: '1.3',
    fontFamily: fonts.primary,
    letterSpacing: '0',
  },

  // Response options - Choice buttons
  responseOption: {
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
    fontFamily: fonts.primary,
  },
} as const;

// ==========================================
// INTERACTION PATTERNS
// ==========================================

export const interactionPatterns = {
  // Swatch Constellation - Tactile color clusters
  swatchConstellation: {
    sizes: {
      small: '56px',
      medium: '72px',
      large: '88px',
    },
    spacing: '12px',
    borderRadius: '50%',
    hoverScale: 1.05,
    tapScale: 0.95,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Breath Gate - Hold-to-continue
  breathGate: {
    circleSize: 'clamp(140px, 20vw, 200px)',
    pulseScale: [1, 1.15, 1],
    pulseDuration: 6,
    inhaleSeconds: 4,
    exhaleSeconds: 6,
    cycles: 3,
  },

  // Paradox Flip - Card flip reframe
  paradoxFlip: {
    flipDuration: 0.6,
    flipEase: [0.65, 0, 0.35, 1],
    perspective: '1000px',
  },

  // Silent Cue - Contemplative pause
  silentCue: {
    silenceDuration: 3000, // 3 seconds
    pulseOpacity: [0.3, 0.8, 0.3],
    pulseDuration: 3,
  },
} as const;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get magic signature based on intent
 */
export function getMagicSignature(intent: string): keyof typeof navicueMagic {
  const intentMap: Record<string, keyof typeof navicueMagic> = {
    Interrupt: 'patternGlitch',
    Integrate: 'sacredOrdinary',
    Reframe: 'koanParadox',
    Regulate: 'sensoryCinema',
    Repair: 'relationalGhost',
  };
  return intentMap[intent] || 'sacredOrdinary';
}

/**
 * Get mechanism accent color
 */
export function getMechanismAccent(mechanism: string): string {
  return mechanismAccents[mechanism as keyof typeof mechanismAccents] || mechanismAccents['Attention Shift'];
}

/**
 * Get combined aesthetic
 */
export function getNaviCueAesthetic(intent: string, mechanism?: string) {
  const signature = getMagicSignature(intent);
  const magic = navicueMagic[signature];
  
  return {
    signature,
    gradient: magic.gradient,
    accent: mechanism ? getMechanismAccent(mechanism) : magic.accent,
    text: magic.text,
    motion: magic.motion,
  };
}