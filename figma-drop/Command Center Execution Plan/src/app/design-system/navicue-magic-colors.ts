/**
 * @deprecated — LEGACY FILE. DO NOT USE IN NEW CODE.
 *
 * This file defined a parallel color system (hex-based) alongside the
 * active HSLA-based `magicSignatures` in `/src/design-tokens.ts`.
 * The values here do NOT match the active system and exist only for
 * backward compatibility with any external tooling that may reference them.
 *
 * ACTIVE AUTHORITY:
 *   Colors     → `magicSignatures` in `/src/design-tokens.ts`
 *   Palette    → `createNaviCuePalette()` in `/src/app/design-system/navicue-blueprint.ts`
 *   Accents    → `MECHANISM_ACCENTS` in `/src/app/design-system/navicue-blueprint.ts`
 *
 * Tracked for removal in: DESIGN_SYSTEM_CLEANUP
 */

export const magicColors = {
  // 1. Sacred Ordinary - Meaning in ordinary moments
  sacredOrdinary: {
    primary: '#E8DDD2',
    secondary: '#D4C5B8',
    tertiary: '#C2B5A8',
    background: '#F5F1ED',
    accent: 'rgba(212, 197, 184, 0.35)',
  },

  // 2. Witness / Ritual - Safety and continuity
  witnessRitual: {
    primary: '#9CA3AF',
    secondary: '#6B7280',
    tertiary: '#8B9DC3',
    background: '#B8C5D6',
    accent: 'rgba(139, 157, 195, 0.4)',
  },

  // 3. Poetic Precision - Insight with minimal words
  poeticPrecision: {
    primary: '#FFFFFF',
    secondary: '#0B0B0C',
    tertiary: '#4B5563',
    background: '#1F2937',
    accent: 'rgba(0, 217, 255, 0.3)', // cyan
  },

  // 4. Science × Soul - Authority with humanity
  scienceSoul: {
    primary: '#374151',
    secondary: '#F59E0B',
    tertiary: '#FBBF24',
    background: '#E5E7EB',
    accent: 'rgba(245, 158, 11, 0.45)',
  },

  // 5. Koan / Paradox - Unlock reframing tension
  koanParadox: {
    primary: '#7C3AED', // purple
    secondary: '#10B981', // green
    tertiary: '#FFFFFF',
    background: '#1F2937',
    accent: 'rgba(124, 58, 237, 0.4)',
  },

  // 6. Pattern Glitch - Break autopilot
  patternGlitch: {
    primary: '#EF4444', // red
    secondary: '#FBBF24', // amber
    tertiary: '#0B0B0C',
    background: '#F3F4F6',
    accent: 'rgba(239, 68, 68, 0.5)',
  },

  // 7. Sensory Cinema - Embodied presence
  sensoryCinema: {
    primary: '#1E3A5F',
    secondary: '#4A5568',
    tertiary: '#8B9DC3',
    background: '#E0F2FE',
    accent: 'rgba(139, 157, 195, 0.4)',
  },

  // 8. Relational Ghost - Felt support without dependency
  relationalGhost: {
    primary: '#FDE4E7',
    secondary: '#FBCFE8',
    tertiary: '#E9D5FF',
    background: '#F3E8FF',
    accent: 'rgba(233, 213, 255, 0.35)',
  },
};

// Intent → Magic Signature mapping helpers
export const intentToMagicSignature = {
  Interrupt: ['patternGlitch', 'poeticPrecision'],
  Integrate: ['sacredOrdinary', 'witnessRitual'],
  Reframe: ['koanParadox', 'poeticPrecision'],
  Regulate: ['sensoryCinema', 'scienceSoul'],
  Repair: ['relationalGhost', 'witnessRitual'],
} as const;

// Mechanism → Color accent mapping
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

// Get magic color palette based on intent
export function getMagicPalette(intent: string, mechanism?: string) {
  const signatures = intentToMagicSignature[intent as keyof typeof intentToMagicSignature] || ['sacredOrdinary'];
  const primarySignature = signatures[0];
  const palette = magicColors[primarySignature as keyof typeof magicColors];
  
  // Override accent if mechanism provided
  if (mechanism && mechanism in mechanismAccents) {
    return {
      ...palette,
      accent: mechanismAccents[mechanism as keyof typeof mechanismAccents],
    };
  }
  
  return palette;
}

// Motion timing based on magic signature
export const magicMotion = {
  sacredOrdinary: {
    entry: 800,
    dwell: 2000,
    exit: 600,
    ease: [0.22, 1, 0.36, 1],
  },
  witnessRitual: {
    entry: 1000,
    dwell: 2500,
    exit: 700,
    ease: [0.19, 1, 0.22, 1],
  },
  poeticPrecision: {
    entry: 400,
    dwell: 1500,
    exit: 300,
    ease: [0.16, 1, 0.3, 1],
  },
  scienceSoul: {
    entry: 600,
    dwell: 2000,
    exit: 500,
    ease: [0.25, 1, 0.5, 1],
  },
  koanParadox: {
    entry: 700,
    dwell: 2200,
    exit: 600,
    ease: [0.65, 0, 0.35, 1],
  },
  patternGlitch: {
    entry: 200,
    dwell: 1000,
    exit: 400,
    ease: [0.87, 0, 0.13, 1],
  },
  sensoryCinema: {
    entry: 1200,
    dwell: 3000,
    exit: 1000,
    ease: [0.4, 0, 0.2, 1],
  },
  relationalGhost: {
    entry: 900,
    dwell: 2400,
    exit: 800,
    ease: [0.33, 1, 0.68, 1],
  },
} as const;

export function getMagicMotion(intent: string) {
  const signatures = intentToMagicSignature[intent as keyof typeof intentToMagicSignature] || ['sacredOrdinary'];
  const primarySignature = signatures[0];
  return magicMotion[primarySignature as keyof typeof magicMotion];
}