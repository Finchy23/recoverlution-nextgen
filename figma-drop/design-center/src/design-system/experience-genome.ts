/**
 * EXPERIENCE GENOME
 * =================
 *
 * The DNA-level specification for how all NaviCue interactions, transitions,
 * and emotional arcs are composed. Defines the genetic traits, arc patterns,
 * and contour shapes that govern every specimen's behavior.
 *
 * The original file (59KB) contains a full genome catalog with ~300 entries.
 * This implementation covers the complete type system, arc pattern library,
 * contour generators, and a representative catalog.
 */

export const EXPERIENCE_GENOME_VERSION = '1.0.0';

// =====================================================================
// Core types used by mechanisms-300 files
// =====================================================================

export type MechanismCategory =
  | 'spatial'
  | 'somatic'
  | 'temporal'
  | 'emotional'
  | 'relational'
  | 'cognitive'
  | 'energetic'
  | 'ritual';

export type MechanismComplexity = 'simple' | 'medium' | 'complex';

export type MechanismModality = 'visual' | 'kinesthetic' | 'auditory' | 'temporal';

export type MechanismOutcome =
  | 'awareness'
  | 'decision'
  | 'grounding'
  | 'activation'
  | 'integration'
  | 'release';

export interface Mechanism {
  id: string;
  name: string;
  category: MechanismCategory | string;
  complexity: MechanismComplexity;
  modality: (MechanismModality | string)[];
  outcome: (MechanismOutcome | string)[];
  description: string;
  interactionType: string;
  duration: 'instant' | 'short' | 'medium' | 'long';
  responseAffinity: string[];
}

// =====================================================================
// Genetic traits — the atoms of experience
// =====================================================================

export interface GeneticTrait {
  name: string;
  category: 'emotional' | 'cognitive' | 'somatic' | 'relational';
  intensity: number; // 0-1
  valence: 'positive' | 'negative' | 'neutral' | 'paradoxical';
}

export type ArcPatternId =
  | 'rising_crescendo'
  | 'descent_return'
  | 'spiral_deepening'
  | 'plateau_release'
  | 'oscillating_balance'
  | 'threshold_crossing'
  | 'containment_bloom'
  | 'fractal_expansion'
  | 'grief_wave'
  | 'joy_cascade'
  | 'stillness_emergence'
  | 'paradox_hold';

export interface ArcPattern {
  id: ArcPatternId;
  name: string;
  shape: number[]; // Emotional intensity curve (0-1) over normalized time
  peakPosition: number; // 0-1 where peak occurs
  restPosition: number; // Baseline intensity level
  description: string;
}

// =====================================================================
// Experience Genome — the full DNA of a NaviCue experience
// =====================================================================

export interface ExperienceGenome {
  id: string;
  /** Traits that define the emotional/cognitive DNA */
  traits: GeneticTrait[];
  /** Arc pattern governing the emotional contour */
  arcPattern: ArcPatternId;
  /** Emotional intensity at each normalized time point (0-1 scale, 10 points) */
  emotionalContour: number[];
  /** Normalized time positions where transitions occur */
  transitionPoints: number[];
  /** Stage durations in ms */
  stageDurations: {
    arrival: number;
    prompt: number;
    interaction: number;
    resonant: number;
    afterglow: number;
  };
  /** Which KBE layer this genome is tuned for */
  kbeAffinity: 'knowing' | 'believing' | 'embodying';
  /** Chrono window compatibility */
  chronoWindows: ('morning' | 'work' | 'social' | 'night')[];
  /** Which magic signatures this genome harmonizes with */
  signatureAffinity: string[];
}

// =====================================================================
// ARC PATTERN LIBRARY
// =====================================================================

export const ARC_PATTERNS: Record<ArcPatternId, ArcPattern> = {
  rising_crescendo: {
    id: 'rising_crescendo',
    name: 'Rising Crescendo',
    shape: [0.1, 0.15, 0.25, 0.4, 0.55, 0.7, 0.85, 0.95, 1.0, 0.7],
    peakPosition: 0.85,
    restPosition: 0.1,
    description: 'Steady build toward powerful climax, gentle descent',
  },
  descent_return: {
    id: 'descent_return',
    name: 'Descent & Return',
    shape: [0.6, 0.5, 0.35, 0.2, 0.15, 0.1, 0.2, 0.4, 0.6, 0.7],
    peakPosition: 0.0,
    restPosition: 0.15,
    description: 'Dive into depths, then gradual ascent to new baseline',
  },
  spiral_deepening: {
    id: 'spiral_deepening',
    name: 'Spiral Deepening',
    shape: [0.3, 0.5, 0.3, 0.6, 0.35, 0.7, 0.4, 0.8, 0.5, 0.9],
    peakPosition: 0.9,
    restPosition: 0.3,
    description: 'Oscillating waves that deepen with each cycle',
  },
  plateau_release: {
    id: 'plateau_release',
    name: 'Plateau & Release',
    shape: [0.2, 0.5, 0.7, 0.7, 0.7, 0.7, 0.7, 0.5, 0.2, 0.1],
    peakPosition: 0.5,
    restPosition: 0.2,
    description: 'Quick rise, sustained hold, clean release',
  },
  oscillating_balance: {
    id: 'oscillating_balance',
    name: 'Oscillating Balance',
    shape: [0.5, 0.7, 0.3, 0.7, 0.3, 0.7, 0.3, 0.6, 0.5, 0.5],
    peakPosition: 0.5,
    restPosition: 0.5,
    description: 'Pendulum between opposites settling to center',
  },
  threshold_crossing: {
    id: 'threshold_crossing',
    name: 'Threshold Crossing',
    shape: [0.2, 0.2, 0.3, 0.3, 0.9, 0.9, 0.8, 0.6, 0.5, 0.5],
    peakPosition: 0.5,
    restPosition: 0.2,
    description: 'Gradual approach to edge, then sudden shift to new level',
  },
  containment_bloom: {
    id: 'containment_bloom',
    name: 'Containment → Bloom',
    shape: [0.3, 0.3, 0.3, 0.3, 0.35, 0.5, 0.7, 0.85, 0.95, 0.8],
    peakPosition: 0.85,
    restPosition: 0.3,
    description: 'Long holding pattern then sudden flowering',
  },
  fractal_expansion: {
    id: 'fractal_expansion',
    name: 'Fractal Expansion',
    shape: [0.2, 0.4, 0.3, 0.6, 0.5, 0.8, 0.7, 1.0, 0.9, 0.6],
    peakPosition: 0.75,
    restPosition: 0.2,
    description: 'Self-similar patterns at increasing scale',
  },
  grief_wave: {
    id: 'grief_wave',
    name: 'Grief Wave',
    shape: [0.4, 0.8, 0.9, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3, 0.3],
    peakPosition: 0.2,
    restPosition: 0.3,
    description: 'Intense initial wave, secondary swells, gradual settling',
  },
  joy_cascade: {
    id: 'joy_cascade',
    name: 'Joy Cascade',
    shape: [0.3, 0.5, 0.7, 0.6, 0.8, 0.7, 0.9, 0.85, 0.95, 0.8],
    peakPosition: 0.85,
    restPosition: 0.3,
    description: 'Cascading moments of delight building on each other',
  },
  stillness_emergence: {
    id: 'stillness_emergence',
    name: 'Stillness → Emergence',
    shape: [0.1, 0.1, 0.1, 0.15, 0.2, 0.3, 0.5, 0.7, 0.8, 0.6],
    peakPosition: 0.85,
    restPosition: 0.1,
    description: 'Deep quiet before something arises from nothing',
  },
  paradox_hold: {
    id: 'paradox_hold',
    name: 'Paradox Hold',
    shape: [0.5, 0.8, 0.2, 0.8, 0.2, 0.5, 0.5, 0.5, 0.5, 0.5],
    peakPosition: 0.5,
    restPosition: 0.5,
    description: 'Sharp oscillation between extremes settling to center',
  },
};

// =====================================================================
// CONTOUR GENERATORS
// =====================================================================

/**
 * Interpolate an emotional contour at any point (0-1).
 */
export function sampleContour(contour: number[], t: number): number {
  const idx = t * (contour.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, contour.length - 1);
  const frac = idx - lo;
  return contour[lo] * (1 - frac) + contour[hi] * frac;
}

/**
 * Generate a contour from an arc pattern with variation.
 */
export function generateContour(pattern: ArcPatternId, seed = 0): number[] {
  const arc = ARC_PATTERNS[pattern] || ARC_PATTERNS.rising_crescendo;
  return arc.shape.map((v, i) => {
    const noise = Math.sin(seed * 7 + i * 1.3) * 0.05;
    return Math.max(0, Math.min(1, v + noise));
  });
}

// =====================================================================
// TRAIT LIBRARY
// =====================================================================

export const CORE_TRAITS: GeneticTrait[] = [
  { name: 'Curiosity', category: 'cognitive', intensity: 0.7, valence: 'positive' },
  { name: 'Vulnerability', category: 'emotional', intensity: 0.6, valence: 'neutral' },
  { name: 'Groundedness', category: 'somatic', intensity: 0.8, valence: 'positive' },
  { name: 'Connection', category: 'relational', intensity: 0.7, valence: 'positive' },
  { name: 'Tension', category: 'somatic', intensity: 0.5, valence: 'negative' },
  { name: 'Grief', category: 'emotional', intensity: 0.8, valence: 'negative' },
  { name: 'Clarity', category: 'cognitive', intensity: 0.9, valence: 'positive' },
  { name: 'Ambiguity', category: 'cognitive', intensity: 0.6, valence: 'paradoxical' },
  { name: 'Trust', category: 'relational', intensity: 0.7, valence: 'positive' },
  { name: 'Activation', category: 'somatic', intensity: 0.8, valence: 'positive' },
  { name: 'Stillness', category: 'somatic', intensity: 0.3, valence: 'neutral' },
  { name: 'Awe', category: 'emotional', intensity: 0.9, valence: 'positive' },
  { name: 'Resistance', category: 'emotional', intensity: 0.6, valence: 'negative' },
  { name: 'Acceptance', category: 'emotional', intensity: 0.7, valence: 'positive' },
  { name: 'Disorientation', category: 'cognitive', intensity: 0.5, valence: 'paradoxical' },
  { name: 'Safety', category: 'relational', intensity: 0.8, valence: 'positive' },
  { name: 'Courage', category: 'emotional', intensity: 0.7, valence: 'positive' },
  { name: 'Nostalgia', category: 'emotional', intensity: 0.5, valence: 'paradoxical' },
  { name: 'Flow', category: 'somatic', intensity: 0.9, valence: 'positive' },
  { name: 'Reverence', category: 'emotional', intensity: 0.8, valence: 'positive' },
];

// =====================================================================
// GENOME CATALOG (representative entries, ~50 of 300)
// =====================================================================

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

const ARC_IDS = Object.keys(ARC_PATTERNS) as ArcPatternId[];
const KBE_VALUES: ExperienceGenome['kbeAffinity'][] = ['knowing', 'believing', 'embodying'];
const CHRONO_OPTIONS: ExperienceGenome['chronoWindows'][number][] = [
  'morning',
  'work',
  'social',
  'night',
];
const SIG_OPTIONS = [
  'sacred-ordinary',
  'witness-ritual',
  'poetic-precision',
  'science-x-soul',
  'koan-paradox',
  'pattern-glitch',
  'sensory-cinema',
  'relational-ghost',
];

function generateGenomeCatalog(count: number): ExperienceGenome[] {
  const catalog: ExperienceGenome[] = [];

  for (let i = 0; i < count; i++) {
    const h = (i * 2654435761) & 0x7fffffff;
    const arcPattern = pick(ARC_IDS, h);
    const contour = generateContour(arcPattern, i);
    const kbe = pick(KBE_VALUES, h + 1);
    const traitCount = 2 + (i % 4);
    const traits: GeneticTrait[] = [];
    for (let t = 0; t < traitCount; t++) {
      traits.push(pick(CORE_TRAITS, h + t * 7));
    }

    // Transition points: 3-5 evenly spaced
    const numTransitions = 3 + (i % 3);
    const transitionPoints = Array.from(
      { length: numTransitions },
      (_, j) => (j + 1) / (numTransitions + 1),
    );

    // Stage durations
    const baseArrival = 2000 + (i % 5) * 500;
    const basePrompt = 3000 + (i % 4) * 1000;

    catalog.push({
      id: `genome-${String(i).padStart(3, '0')}`,
      traits,
      arcPattern,
      emotionalContour: contour,
      transitionPoints,
      stageDurations: {
        arrival: baseArrival,
        prompt: basePrompt,
        interaction: 0, // user-driven
        resonant: 2000 + (i % 3) * 500,
        afterglow: 1500 + (i % 4) * 500,
      },
      kbeAffinity: kbe,
      chronoWindows: [pick(CHRONO_OPTIONS, h), pick(CHRONO_OPTIONS, h + 3)].filter(
        (v, idx, arr) => arr.indexOf(v) === idx,
      ),
      signatureAffinity: [pick(SIG_OPTIONS, h), pick(SIG_OPTIONS, h + 5)].filter(
        (v, idx, arr) => arr.indexOf(v) === idx,
      ),
    });
  }

  return catalog;
}

export const GENOME_CATALOG: ExperienceGenome[] = generateGenomeCatalog(300);

// =====================================================================
// LOOKUP UTILITIES
// =====================================================================

export function getGenomeById(id: string): ExperienceGenome | undefined {
  return GENOME_CATALOG.find((g) => g.id === id);
}

export function getGenomesByArc(arc: ArcPatternId): ExperienceGenome[] {
  return GENOME_CATALOG.filter((g) => g.arcPattern === arc);
}

export function getGenomesByKBE(kbe: ExperienceGenome['kbeAffinity']): ExperienceGenome[] {
  return GENOME_CATALOG.filter((g) => g.kbeAffinity === kbe);
}

export function getGenomesBySignature(sig: string): ExperienceGenome[] {
  return GENOME_CATALOG.filter((g) => g.signatureAffinity.includes(sig));
}

// =====================================================================
// ADVANCED GENOME OPERATIONS
// =====================================================================

/**
 * Find genomes compatible with a given chrono window.
 */
export function getGenomesByChrono(
  chrono: 'morning' | 'work' | 'social' | 'night',
): ExperienceGenome[] {
  return GENOME_CATALOG.filter((g) => g.chronoWindows.includes(chrono));
}

/**
 * Get the dominant trait category for a genome.
 */
export function getDominantTraitCategory(genome: ExperienceGenome): GeneticTrait['category'] {
  const counts: Record<string, number> = {};
  genome.traits.forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + t.intensity;
  });
  let best = 'cognitive' as GeneticTrait['category'];
  let bestVal = 0;
  for (const [cat, val] of Object.entries(counts)) {
    if (val > bestVal) {
      best = cat as GeneticTrait['category'];
      bestVal = val;
    }
  }
  return best;
}

/**
 * Calculate emotional range (max - min) across a genome's contour.
 */
export function getEmotionalRange(genome: ExperienceGenome): number {
  const min = Math.min(...genome.emotionalContour);
  const max = Math.max(...genome.emotionalContour);
  return max - min;
}

/**
 * Blend two genomes' contours (for transition specimens).
 */
export function blendContours(a: number[], b: number[], ratio = 0.5): number[] {
  const len = Math.max(a.length, b.length);
  return Array.from({ length: len }, (_, i) => {
    const va = i < a.length ? a[i] : a[a.length - 1];
    const vb = i < b.length ? b[i] : b[b.length - 1];
    return va * (1 - ratio) + vb * ratio;
  });
}

/**
 * Get the total emotional intensity of a genome.
 */
export function getTotalIntensity(genome: ExperienceGenome): number {
  return genome.traits.reduce((sum, t) => sum + t.intensity, 0);
}

/**
 * Get genome statistics for dashboard displays.
 */
export function getGenomeStats() {
  const total = GENOME_CATALOG.length;
  const byKBE = { knowing: 0, believing: 0, embodying: 0 };
  const byArc: Record<string, number> = {};
  const byTraitCategory: Record<string, number> = {};

  GENOME_CATALOG.forEach((g) => {
    byKBE[g.kbeAffinity]++;
    byArc[g.arcPattern] = (byArc[g.arcPattern] || 0) + 1;
    const dominant = getDominantTraitCategory(g);
    byTraitCategory[dominant] = (byTraitCategory[dominant] || 0) + 1;
  });

  return { total, byKBE, byArc, byTraitCategory };
}

/**
 * Recommend a genome for a given context.
 */
export function recommendGenome(
  kbe: ExperienceGenome['kbeAffinity'],
  chrono: 'morning' | 'work' | 'social' | 'night',
  preferredSignature?: string,
): ExperienceGenome | undefined {
  let candidates = GENOME_CATALOG.filter(
    (g) => g.kbeAffinity === kbe && g.chronoWindows.includes(chrono),
  );
  if (preferredSignature) {
    const sigFiltered = candidates.filter((g) => g.signatureAffinity.includes(preferredSignature));
    if (sigFiltered.length > 0) candidates = sigFiltered;
  }
  return candidates[0];
}
