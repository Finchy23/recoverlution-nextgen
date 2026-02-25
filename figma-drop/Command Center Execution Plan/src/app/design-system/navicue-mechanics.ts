/**
 * NAVICUE MECHANICS LAYER
 * =======================
 *
 * The composition engine for the next 10,000 NaviCues.
 *
 * This is the ROUTE layer of the operating loop:
 *   Sense -> ROUTE -> Deliver -> Seal
 *
 * It defines three subsystems:
 *   1. MECHANIC PROFILES  -- 9 therapeutic engines with heat band gating
 *   2. RECEIPT PROFILES   -- 6 proof/rep types for pathway sealing
 *   3. CHRONO MODIFIERS   -- 4 time-of-day atmosphere shifts
 *
 * Plus the composition function that wires them together:
 *   composeMechanics(config) -> complete delivery specification
 *
 * PHILOSOPHY:
 *   The system is a gym, not an ambulance.
 *   Receipts are reps, not cures. The counter only goes up. Never resets.
 *   Green/Amber is the training ground (90% of real work).
 *   Red is pure presence. No cognitive load. Just a tether.
 *   No streaks. No achievements. No gamification.
 *   Only physics: "The pathway is physically different today."
 *
 * ARCHITECTURE:
 *   - This file is imported BY navicue-blueprint.ts (or consumed alongside it)
 *   - Specimens never import from here directly
 *   - The quickstart compositor in blueprint calls composeMechanics()
 *     to produce the interaction + receipt + chrono specification
 *
 * DEPENDENCY: navicue-blueprint.ts types (MagicSignatureKey, NaviCueForm)
 */

import type { MagicSignatureKey, NaviCueForm } from './navicue-blueprint';

// =====================================================================
// TYPES
// =====================================================================

export type HeatBand = 'green' | 'amber' | 'red';

export type MechanicId =
  | 'counterfactual_flip'     // K: Simulate the opposite
  | 'narrative_edit'          // K: Retype with new valence
  | 'parts_dialogue'          // K/B: Talk TO the feeling, not AS it
  | 'prediction_bet'          // B: State negative outcome, then test
  | 'future_self'             // B: Bridge the empathy gap
  | 'paradoxical_intention'   // B/E: Prescribe the symptom
  | 'friction_design'         // E: Forced delay, urge surf
  | 'somatic_entrainment'     // E: Bypass language, regulate body
  | 'social_ping';            // E: Break isolation

export type ReceiptId =
  | 'tap'          // Micro-proof: instant confirmation
  | 'hold'         // Somatic-proof: sustained physical engagement
  | 'voice'        // Audio-proof: record and playback
  | 'lens'         // Visual-proof: camera capture
  | 'burn'         // Destructive-proof: type then shatter
  | 'ping';        // Relational-proof: send to trusted contact

export type ChronoContext = 'morning' | 'work' | 'social' | 'night';

export type KBELevel = 'knowing' | 'believing' | 'embodying';

export type CognitiveLoad = 'minimal' | 'moderate' | 'full';

/**
 * Interaction modality -- what part of the brain/body is doing the work.
 *
 * cognitive:   Prefrontal cortex. Reframing, simulating, analyzing.
 * predictive:  Making a bet against reality and testing it.
 * somatic:     Body-first. Breath, touch, physical presence.
 * relational:  Breaking isolation through connection.
 */
export type Modality = 'cognitive' | 'predictive' | 'somatic' | 'relational';

/**
 * The primary interaction hook this mechanic composes with.
 * Maps to the existing interaction hooks in /interactions/.
 */
export type InteractionShape =
  | 'type'        // useTypeInteraction
  | 'hold'        // useHoldInteraction
  | 'drag'        // useDragInteraction
  | 'draw'        // useDrawInteraction
  | 'observe'     // No hook needed -- pure text/presence
  | 'countdown'   // Custom timer-based (could compose with hold)
  | 'dialogue';   // Multi-turn conversational (future hook)

/**
 * Text materialization mode -- how words arrive on glass.
 * Delivered by useTextMaterializer in the magic layer.
 */
export type TextMaterializeMode =
  | 'emerge'      // Characters rise from behind glass surface
  | 'dissolve'    // Fade in from noise/static
  | 'inscribe'    // Write stroke by stroke, visible pen
  | 'burn_in'     // Slowly sear into the surface
  | 'immediate';  // No animation. For Red state: just be present.

/**
 * Receipt ceremony mode -- how the seal moment feels.
 * Delivered by useReceiptCeremony in the magic layer.
 */
export type ReceiptCeremonyMode =
  | 'absorb'          // Content shrinks to glowing point, received
  | 'crystallize'     // Frost pattern locks the moment
  | 'dissolve'        // Peaceful fade, leaving a subtle trace
  | 'shatter_reform'; // Old text breaks, reforms into new statement

/**
 * Breath pattern for somatic synchronization.
 */
export type BreathPattern =
  | 'calm_478'    // 4s inhale, 7s hold, 8s exhale (parasympathetic)
  | 'box'         // 4s inhale, 4s hold, 4s exhale, 4s hold (regulation)
  | 'simple'      // 4s inhale, 4s exhale (baseline calm)
  | 'energize';   // 2s inhale, 1s hold, 4s exhale (activating)

// =====================================================================
// MECHANIC PROFILES
// =====================================================================

export interface MechanicProfile {
  id: MechanicId;
  name: string;

  // ── What the brain is doing ──
  modality: Modality;
  kbeAlignment: 'K' | 'K/B' | 'B' | 'B/E' | 'E';

  /** How much prefrontal cortex this mechanic demands */
  cognitiveLoad: CognitiveLoad;

  /** Which heat bands can dispatch this mechanic */
  heatBandAccess: HeatBand[];

  // ── Interaction composition ──
  primaryInteraction: InteractionShape;
  interactionDefaults: Record<string, unknown>;

  /** Preferred text materialization for this mechanic */
  textMode: TextMaterializeMode;

  /** Preferred receipt ceremony */
  ceremonyMode: ReceiptCeremonyMode;

  /** Compatible receipt types (ordered by preference) */
  receipts: ReceiptId[];

  /** Preferred breath pattern (null = no breath sync) */
  breathPattern: BreathPattern | null;

  // ── Timing arc (ms) -- how this mechanic unfolds ──
  timing: {
    /** How long to frame the moment (setup, context, invitation) */
    setup: number;
    /** How long the active engagement lasts */
    engagement: number;
    /** How long the insight settles (landing, reflection) */
    landing: number;
  };

  // ── Sensory affinity -- which signatures feel most natural ──
  preferredSignatures: MagicSignatureKey[];
  preferredForms: NaviCueForm[];

  // ── Myelination metadata ──

  /** What "one rep" of this mechanic means. For cumulative reflection. */
  repUnit: string;

  /**
   * What the system does when the user doesn't finish.
   * NEVER punishment. The pathway doesn't un-myelinate.
   *
   * silent:      Say nothing. It's fine.
   * acknowledge: "Noted. We're here tomorrow."
   * validate:    "Stepping away IS the right call sometimes."
   */
  incompleteResponse: 'silent' | 'acknowledge' | 'validate';
}

// ── The 9 Mechanics ──────────────────────────────────────────────────

export const MECHANICS: Record<MechanicId, MechanicProfile> = {

  // ═══════════════════════════════════════════════════════════════════
  // KNOWING (K) -- Sparking new pathways. Low-to-moderate friction.
  // Available in GREEN only. Full cognitive load.
  // ═══════════════════════════════════════════════════════════════════

  counterfactual_flip: {
    id: 'counterfactual_flip',
    name: 'Counterfactual Flip',
    modality: 'cognitive',
    kbeAlignment: 'K',
    cognitiveLoad: 'full',
    heatBandAccess: ['green'],
    primaryInteraction: 'observe',
    interactionDefaults: {},
    textMode: 'emerge',
    ceremonyMode: 'absorb',
    receipts: ['tap', 'burn'],
    breathPattern: null,
    timing: { setup: 3000, engagement: 15000, landing: 4000 },
    preferredSignatures: ['koan_paradox', 'poetic_precision'],
    preferredForms: ['Mirror', 'Theater'],
    repUnit: 'pathway simulated',
    incompleteResponse: 'silent',
  },

  narrative_edit: {
    id: 'narrative_edit',
    name: 'Narrative Edit',
    modality: 'cognitive',
    kbeAlignment: 'K',
    cognitiveLoad: 'full',
    heatBandAccess: ['green'],
    primaryInteraction: 'type',
    interactionDefaults: { minLength: 5, exactMatch: false },
    textMode: 'inscribe',
    ceremonyMode: 'shatter_reform',
    receipts: ['burn', 'tap'],
    breathPattern: null,
    timing: { setup: 3000, engagement: 25000, landing: 4000 },
    preferredSignatures: ['poetic_precision', 'witness_ritual'],
    preferredForms: ['Theater', 'Mirror'],
    repUnit: 'belief rewritten',
    incompleteResponse: 'acknowledge',
  },

  parts_dialogue: {
    id: 'parts_dialogue',
    name: 'Parts Dialogue',
    modality: 'cognitive',
    kbeAlignment: 'K/B',
    cognitiveLoad: 'full',
    heatBandAccess: ['green'],
    primaryInteraction: 'dialogue',
    interactionDefaults: {},
    textMode: 'emerge',
    ceremonyMode: 'absorb',
    receipts: ['tap', 'voice'],
    breathPattern: 'simple',
    timing: { setup: 3500, engagement: 30000, landing: 5000 },
    preferredSignatures: ['relational_ghost', 'witness_ritual'],
    preferredForms: ['Hearth', 'PartsRollcall'],
    repUnit: 'part witnessed',
    incompleteResponse: 'validate',
  },

  // ═══════════════════════════════════════════════════════════════════
  // BELIEVING (B) -- Testing against reality. Moderate friction.
  // Available in GREEN and AMBER. Moderate cognitive load.
  // ═══════════════════════════════════════════════════════════════════

  prediction_bet: {
    id: 'prediction_bet',
    name: 'Prediction Bet',
    modality: 'predictive',
    kbeAlignment: 'B',
    cognitiveLoad: 'moderate',
    heatBandAccess: ['green', 'amber'],
    primaryInteraction: 'type',
    interactionDefaults: { minLength: 3, exactMatch: false },
    textMode: 'dissolve',
    ceremonyMode: 'crystallize',
    receipts: ['tap', 'voice'],
    breathPattern: null,
    timing: { setup: 2500, engagement: 20000, landing: 4000 },
    preferredSignatures: ['science_x_soul', 'poetic_precision'],
    preferredForms: ['Circuit', 'Probe'],
    repUnit: 'prediction tested',
    incompleteResponse: 'silent',
  },

  future_self: {
    id: 'future_self',
    name: 'Future-Self Bridge',
    modality: 'predictive',
    kbeAlignment: 'B',
    cognitiveLoad: 'moderate',
    heatBandAccess: ['green', 'amber'],
    primaryInteraction: 'observe',
    interactionDefaults: {},
    textMode: 'burn_in',
    ceremonyMode: 'crystallize',
    receipts: ['tap', 'voice', 'lens'],
    breathPattern: 'simple',
    timing: { setup: 3000, engagement: 20000, landing: 5000 },
    preferredSignatures: ['sensory_cinema', 'sacred_ordinary'],
    preferredForms: ['Cosmos', 'Stellar'],
    repUnit: 'bridge extended',
    incompleteResponse: 'silent',
  },

  paradoxical_intention: {
    id: 'paradoxical_intention',
    name: 'Paradoxical Intention',
    modality: 'predictive',
    kbeAlignment: 'B/E',
    cognitiveLoad: 'moderate',
    heatBandAccess: ['green', 'amber'],
    primaryInteraction: 'observe',
    interactionDefaults: {},
    textMode: 'dissolve',
    ceremonyMode: 'absorb',
    receipts: ['tap', 'hold'],
    breathPattern: null,
    timing: { setup: 2000, engagement: 15000, landing: 3000 },
    preferredSignatures: ['koan_paradox', 'pattern_glitch'],
    preferredForms: ['Storm', 'IdentityKoan'],
    repUnit: 'pattern inverted',
    incompleteResponse: 'silent',
  },

  // ═══════════════════════════════════════════════════════════════════
  // EMBODYING (E) -- Somatic loop. Hard behavioral proof.
  // friction_design + somatic_entrainment survive into RED.
  // social_ping available GREEN + AMBER.
  // ═══════════════════════════════════════════════════════════════════

  friction_design: {
    id: 'friction_design',
    name: 'Friction Design',
    modality: 'somatic',
    kbeAlignment: 'E',
    cognitiveLoad: 'minimal',
    heatBandAccess: ['green', 'amber', 'red'],
    primaryInteraction: 'countdown',
    interactionDefaults: { countdownDuration: 20000 },
    textMode: 'immediate',
    ceremonyMode: 'dissolve',
    receipts: ['hold', 'tap'],
    breathPattern: 'calm_478',
    timing: { setup: 1500, engagement: 20000, landing: 2000 },
    preferredSignatures: ['pattern_glitch', 'koan_paradox'],
    preferredForms: ['Storm', 'Ocean'],
    repUnit: 'pause held',
    incompleteResponse: 'silent',
  },

  somatic_entrainment: {
    id: 'somatic_entrainment',
    name: 'Somatic Entrainment',
    modality: 'somatic',
    kbeAlignment: 'E',
    cognitiveLoad: 'minimal',
    heatBandAccess: ['green', 'amber', 'red'],
    primaryInteraction: 'hold',
    interactionDefaults: { maxDuration: 15000, tickRate: 50 },
    textMode: 'immediate',
    ceremonyMode: 'dissolve',
    receipts: ['hold', 'tap'],
    breathPattern: 'calm_478',
    timing: { setup: 2000, engagement: 19000, landing: 4000 },
    preferredSignatures: ['sensory_cinema', 'sacred_ordinary'],
    preferredForms: ['Ocean', 'Hearth'],
    repUnit: 'breath anchored',
    incompleteResponse: 'silent',
  },

  social_ping: {
    id: 'social_ping',
    name: 'Social Ping',
    modality: 'relational',
    kbeAlignment: 'E',
    cognitiveLoad: 'minimal',
    heatBandAccess: ['green', 'amber'],
    primaryInteraction: 'observe',
    interactionDefaults: {},
    textMode: 'emerge',
    ceremonyMode: 'absorb',
    receipts: ['ping', 'tap'],
    breathPattern: null,
    timing: { setup: 2000, engagement: 10000, landing: 3000 },
    preferredSignatures: ['relational_ghost', 'sacred_ordinary'],
    preferredForms: ['Hearth', 'Canopy'],
    repUnit: 'connection made',
    incompleteResponse: 'validate',
  },
};

// =====================================================================
// RECEIPT PROFILES
// =====================================================================

export interface ReceiptProfile {
  id: ReceiptId;
  name: string;

  /** What gesture completes this receipt */
  gesture: 'tap' | 'long-press' | 'record' | 'capture' | 'type-destroy' | 'send';

  /** Minimum engagement duration to count as a real rep (ms) */
  minimumDuration: number;

  /** Cognitive load of this receipt type */
  receiptLoad: CognitiveLoad;

  /** Visual feedback character */
  feedback: 'instant' | 'progressive' | 'destructive' | 'outbound';

  /** Which existing interaction hook handles this (or 'custom') */
  hook: 'none' | 'hold' | 'type' | 'custom';

  /** Default hook configuration */
  hookDefaults: Record<string, unknown>;

  /**
   * Cumulative narrative -- how this receipt type accumulates.
   * NOT achievements. NOT streaks.
   * PHYSICS: "The neural pathway is physically different."
   */
  cumulativeNarrative: {
    /** Plural unit name: "breaths anchored", "beliefs rewritten" */
    unit: string;
    /**
     * Reflection template. Tokens: {count}, {daysSinceFirst}.
     * Tone: always physics, never gamification.
     */
    reflectionTemplate: string;
  };

  /**
   * What happens on missed days or incomplete receipts.
   * NEVER punishment. The pathway doesn't un-myelinate.
   *
   * invisible:     Don't mention it. Zero friction.
   * gentle_return: "The path is still here. Welcome back."
   */
  missedResponse: 'invisible' | 'gentle_return';
}

export const RECEIPTS: Record<ReceiptId, ReceiptProfile> = {

  tap: {
    id: 'tap',
    name: 'Tap',
    gesture: 'tap',
    minimumDuration: 0,
    receiptLoad: 'minimal',
    feedback: 'instant',
    hook: 'none',
    hookDefaults: {},
    cumulativeNarrative: {
      unit: 'moments acknowledged',
      reflectionTemplate:
        'You have paused and chosen awareness {count} times. ' +
        'Each pause is a micro-decision that reshapes the default.',
    },
    missedResponse: 'invisible',
  },

  hold: {
    id: 'hold',
    name: 'Hold',
    gesture: 'long-press',
    minimumDuration: 8000,
    receiptLoad: 'minimal',
    feedback: 'progressive',
    hook: 'hold',
    hookDefaults: { maxDuration: 15000, tickRate: 50 },
    cumulativeNarrative: {
      unit: 'breaths anchored',
      reflectionTemplate:
        'You have held presence {count} times across {daysSinceFirst} days. ' +
        'The physical structure of your nervous system is different today.',
    },
    missedResponse: 'invisible',
  },

  voice: {
    id: 'voice',
    name: 'Voice Note',
    gesture: 'record',
    minimumDuration: 5000,
    receiptLoad: 'moderate',
    feedback: 'progressive',
    hook: 'custom',
    hookDefaults: { maxDuration: 30000 },
    cumulativeNarrative: {
      unit: 'truths spoken aloud',
      reflectionTemplate:
        'You have spoken {count} truths out loud. ' +
        'Hearing your own voice reshape a belief is different from reading it.',
    },
    missedResponse: 'invisible',
  },

  lens: {
    id: 'lens',
    name: 'Lens',
    gesture: 'capture',
    minimumDuration: 0,
    receiptLoad: 'minimal',
    feedback: 'instant',
    hook: 'custom',
    hookDefaults: {},
    cumulativeNarrative: {
      unit: 'moments captured',
      reflectionTemplate:
        'You have lifted your gaze {count} times. ' +
        'The act of looking up literally changes the posture of thought.',
    },
    missedResponse: 'invisible',
  },

  burn: {
    id: 'burn',
    name: 'Burn',
    gesture: 'type-destroy',
    minimumDuration: 3000,
    receiptLoad: 'moderate',
    feedback: 'destructive',
    hook: 'type',
    hookDefaults: { minLength: 5 },
    cumulativeNarrative: {
      unit: 'old beliefs released',
      reflectionTemplate:
        'You have named and released {count} beliefs. ' +
        'The old pathway doesn\'t disappear, but the grip loosens each time.',
    },
    missedResponse: 'gentle_return',
  },

  ping: {
    id: 'ping',
    name: 'Ping',
    gesture: 'send',
    minimumDuration: 0,
    receiptLoad: 'minimal',
    feedback: 'outbound',
    hook: 'custom',
    hookDefaults: {},
    cumulativeNarrative: {
      unit: 'connections reached for',
      reflectionTemplate:
        'You have reached out {count} times. ' +
        'Each reach rewires the isolation reflex into a connection reflex.',
    },
    missedResponse: 'invisible',
  },
};

// =====================================================================
// CHRONO MODIFIERS
// =====================================================================

/**
 * Time-of-day modifiers that shift the palette warmth, atmosphere energy,
 * and motion pacing. Applied as multipliers/offsets on top of the base
 * signature + form atmosphere.
 *
 * Morning/Night are prime training windows (highest plasticity).
 * Work/Social are field practice (apply what you've trained).
 */
export interface ChronoModifiers {
  /** Palette: shift primary hue warmth. Positive = warmer, negative = cooler. */
  warmthOffset: number;
  /** Palette: multiply base saturation. <1 = more muted, >1 = more vivid. */
  saturationMultiplier: number;
  /** Palette: shift base lightness. Positive = brighter, negative = deeper. */
  lightnessOffset: number;

  /** Atmosphere: multiply particle speed. <1 = calmer, >1 = more active. */
  particleSpeedMultiplier: number;
  /** Atmosphere: multiply particle count. <1 = sparser, >1 = denser. */
  particleCountMultiplier: number;

  /** Motion: multiply entry animation speed. <1 = gentler entrance, >1 = snappier. */
  entrySpeedMultiplier: number;

  /** Stage timing: multiply arriving stage duration. >1 = longer threshold. */
  arrivingMultiplier: number;

  /** Preferred text materialization for this time of day. */
  textMode: TextMaterializeMode;

  /** Preferred breath pattern for this time of day (or null). */
  breathPattern: BreathPattern | null;
}

export const CHRONO: Record<ChronoContext, ChronoModifiers> = {

  /**
   * MORNING (The Prime)
   * Warm, gentle, slow build. The mind is fresh.
   * Prime window for cognitive work (K mechanics).
   * Higher lightness, slower particles, contemplative pacing.
   */
  morning: {
    warmthOffset: 5,
    saturationMultiplier: 1.05,
    lightnessOffset: 3,
    particleSpeedMultiplier: 0.7,
    particleCountMultiplier: 1.0,
    entrySpeedMultiplier: 0.85,
    arrivingMultiplier: 1.15,
    textMode: 'emerge',
    breathPattern: 'simple',
  },

  /**
   * WORK (The Stress-Test)
   * Crisp, focused, efficient entry. Field practice under load.
   * Neutral warmth, faster motion, respect the user's time pressure.
   * Best for B mechanics (test beliefs against real situations).
   */
  work: {
    warmthOffset: 0,
    saturationMultiplier: 0.95,
    lightnessOffset: 0,
    particleSpeedMultiplier: 1.15,
    particleCountMultiplier: 0.8,
    entrySpeedMultiplier: 1.25,
    arrivingMultiplier: 0.75,
    textMode: 'dissolve',
    breathPattern: null,
  },

  /**
   * SOCIAL (The Mirror)
   * Slightly elevated energy, warm-neutral. Relational field.
   * Good for paradoxical intention and social ping mechanics.
   * The user is around other humans -- the cue should feel portable.
   */
  social: {
    warmthOffset: 2,
    saturationMultiplier: 1.0,
    lightnessOffset: 1,
    particleSpeedMultiplier: 1.0,
    particleCountMultiplier: 0.9,
    entrySpeedMultiplier: 1.1,
    arrivingMultiplier: 0.85,
    textMode: 'dissolve',
    breathPattern: null,
  },

  /**
   * NIGHT (The Seal)
   * Cool, deep, spacious. Neural consolidation window.
   * Lower saturation, fewer particles, longer threshold.
   * Prime window for somatic entrainment and reflection.
   * The brain processes the day's training during sleep.
   */
  night: {
    warmthOffset: -3,
    saturationMultiplier: 0.85,
    lightnessOffset: -2,
    particleSpeedMultiplier: 0.55,
    particleCountMultiplier: 0.65,
    entrySpeedMultiplier: 0.75,
    arrivingMultiplier: 1.3,
    textMode: 'burn_in',
    breathPattern: 'calm_478',
  },
};

// =====================================================================
// HEAT BAND ROUTING
// =====================================================================

/**
 * Visual intensity modifiers per heat band.
 *
 * Green: full sensory richness. The gym is well-lit.
 * Amber: moderate. Some sensory reduction. Focus sharpens.
 * Red:   stripped. Near-monochrome. Breathing circle and nothing else.
 *        Sensory overload during autonomic hijack increases arousal.
 */
export interface HeatBandVisuals {
  /** Particle opacity multiplier. Red = almost invisible. */
  particleOpacityMultiplier: number;
  /** Particle count multiplier. Red = very few. */
  particleCountMultiplier: number;
  /** Gradient intensity multiplier. Red = barely there. */
  gradientIntensityMultiplier: number;
  /** Whether to show the glow orb. Red = no. */
  showGlowOrb: boolean;
  /** Whether to show secondary layers. Red = no. */
  showSecondaryLayers: boolean;
  /** Maximum cognitive load allowed at this band. */
  maxCognitiveLoad: CognitiveLoad;
  /** Text materialization override (Red forces immediate). */
  textModeOverride: TextMaterializeMode | null;
  /** Tone of non-completion. Red = always silent. */
  incompleteTone: 'as_defined' | 'silent';
}

export const HEAT_BAND_VISUALS: Record<HeatBand, HeatBandVisuals> = {

  green: {
    particleOpacityMultiplier: 1.0,
    particleCountMultiplier: 1.0,
    gradientIntensityMultiplier: 1.0,
    showGlowOrb: true,
    showSecondaryLayers: true,
    maxCognitiveLoad: 'full',
    textModeOverride: null,
    incompleteTone: 'as_defined',
  },

  amber: {
    particleOpacityMultiplier: 0.7,
    particleCountMultiplier: 0.75,
    gradientIntensityMultiplier: 0.85,
    showGlowOrb: true,
    showSecondaryLayers: true,
    maxCognitiveLoad: 'moderate',
    textModeOverride: null,
    incompleteTone: 'as_defined',
  },

  red: {
    particleOpacityMultiplier: 0.25,
    particleCountMultiplier: 0.3,
    gradientIntensityMultiplier: 0.4,
    showGlowOrb: false,
    showSecondaryLayers: false,
    maxCognitiveLoad: 'minimal',
    textModeOverride: 'immediate',
    incompleteTone: 'silent',
  },
};

// =====================================================================
// TONE GUARDRAILS
// =====================================================================

/**
 * Hard constraints on language across all archetypal voices.
 * These are NOT suggestions. They are invariants.
 *
 * The myelination philosophy demands:
 * - No crisis promises ("use this when triggered")
 * - No achievement language ("great job!")
 * - No streak mechanics ("X days strong!")
 * - No gamification ("level up!", "badge earned!")
 * - No fixing language ("beat your addiction")
 *
 * Instead:
 * - Physics framing ("the pathway is physically different")
 * - Repetition celebration ("you've walked this path X times")
 * - Compassionate witnessing ("of course you feel this way")
 * - Zero-shame incompletion ("the path is still here")
 */
export const TONE_GUARDRAILS = {
  forbidden: [
    'great job',
    'well done',
    'you did it',
    'streak',
    'day streak',
    'days strong',
    'level up',
    'badge',
    'achievement',
    'beat your',
    'overcome your',
    'cure',
    'fix',
    'heal your',
    'you failed',
    'you missed',
    'broken streak',
    'try harder',
    'use this when triggered',
    'stop your',
    'fight your',
  ] as const,

  /**
   * Replacement patterns: if a forbidden phrase is detected,
   * the closest appropriate alternative.
   */
  alternatives: {
    completion: 'The track is deeper today.',
    progress: 'You\'ve walked this pathway {count} times.',
    encouragement: 'One more millimeter of track.',
    return_after_absence: 'The path is still here.',
    during_crisis: 'I see you. Ride the wave. Zero shame.',
    structural_validation: 'Given your source code, this makes complete sense.',
  } as const,
} as const;

// =====================================================================
// COMPOSITION ENGINE
// =====================================================================

/**
 * Input configuration for the 5D composition.
 * The schema/AI fills this; the design system produces the delivery spec.
 */
export interface MechanicsConfig {
  // ── Primary: User state (gates everything) ──
  heatBand: HeatBand;

  // ── Content routing ──
  mechanic: MechanicId;
  receipt?: ReceiptId;
  kbe?: KBELevel;

  // ── Temporal context ──
  chrono?: ChronoContext;
}

/**
 * Output: the complete delivery specification for a NaviCue.
 * This tells the render layer exactly how to Deliver and Seal.
 */
export interface DeliverySpec {
  /** The resolved mechanic profile (heat-band validated) */
  mechanic: MechanicProfile;

  /** The resolved receipt profile */
  receipt: ReceiptProfile;

  /** Resolved text materialization mode */
  textMode: TextMaterializeMode;

  /** Resolved receipt ceremony mode */
  ceremonyMode: ReceiptCeremonyMode;

  /** Resolved breath pattern (null = no somatic sync) */
  breathPattern: BreathPattern | null;

  /** Chrono modifiers (null = no time-of-day adjustment) */
  chrono: ChronoModifiers | null;

  /** Heat band visual constraints */
  heatVisuals: HeatBandVisuals;

  /** Timing arc (ms) -- possibly chrono-adjusted */
  timing: {
    setup: number;
    engagement: number;
    landing: number;
    total: number;
  };

  /**
   * Whether this delivery was downgraded from the requested mechanic.
   * true = the requested mechanic was too cognitive for the heat band,
   * so we fell back to somatic_entrainment.
   */
  downgraded: boolean;
}

/**
 * COGNITIVE LOAD HIERARCHY for comparison.
 * Used to validate mechanic against heat band ceiling.
 */
const LOAD_RANK: Record<CognitiveLoad, number> = {
  minimal: 0,
  moderate: 1,
  full: 2,
};

/**
 * Compose the complete delivery specification from a 5D config.
 *
 * This is the ROUTE function of the operating loop.
 * It validates the mechanic against the heat band, resolves
 * the receipt, applies chrono modifiers, and returns a
 * ready-to-render DeliverySpec.
 *
 * If the requested mechanic exceeds the heat band's cognitive ceiling,
 * the system silently downgrades to somatic_entrainment (the universal
 * fallback). No error. No shame. Just presence.
 */
export function composeMechanics(config: MechanicsConfig): DeliverySpec {
  const { heatBand, kbe } = config;

  const heatVisuals = HEAT_BAND_VISUALS[heatBand];
  const chronoMods = config.chrono ? CHRONO[config.chrono] : null;

  // ── Resolve mechanic (with heat band validation) ──
  let mechanicProfile = MECHANICS[config.mechanic];
  let downgraded = false;

  // Gate 1: Is this mechanic allowed at this heat band?
  if (!mechanicProfile.heatBandAccess.includes(heatBand)) {
    mechanicProfile = MECHANICS.somatic_entrainment;
    downgraded = true;
  }

  // Gate 2: Does the mechanic's cognitive load exceed the heat band ceiling?
  if (LOAD_RANK[mechanicProfile.cognitiveLoad] > LOAD_RANK[heatVisuals.maxCognitiveLoad]) {
    mechanicProfile = MECHANICS.somatic_entrainment;
    downgraded = true;
  }

  // ── Resolve receipt ──
  const requestedReceipt = config.receipt || mechanicProfile.receipts[0];
  const receiptProfile = RECEIPTS[requestedReceipt] || RECEIPTS.tap;

  // Validate receipt cognitive load against heat band
  const finalReceipt = LOAD_RANK[receiptProfile.receiptLoad] > LOAD_RANK[heatVisuals.maxCognitiveLoad]
    ? RECEIPTS.tap
    : receiptProfile;

  // ── Resolve text materialization ──
  // Priority: heat band override > chrono suggestion > mechanic default
  const textMode =
    heatVisuals.textModeOverride ||
    (chronoMods?.textMode && !downgraded ? chronoMods.textMode : null) ||
    mechanicProfile.textMode;

  // ── Resolve breath pattern ──
  // Priority: mechanic > chrono > none
  const breathPattern =
    mechanicProfile.breathPattern ||
    chronoMods?.breathPattern ||
    null;

  // ── Resolve timing (with chrono adjustments) ──
  const baseTiming = mechanicProfile.timing;
  const arrivingMult = chronoMods?.arrivingMultiplier ?? 1;
  const timing = {
    setup: Math.round(baseTiming.setup * arrivingMult),
    engagement: baseTiming.engagement,
    landing: baseTiming.landing,
    total: Math.round(baseTiming.setup * arrivingMult) + baseTiming.engagement + baseTiming.landing,
  };

  return {
    mechanic: mechanicProfile,
    receipt: finalReceipt,
    textMode,
    ceremonyMode: mechanicProfile.ceremonyMode,
    breathPattern,
    chrono: chronoMods,
    heatVisuals,
    timing,
    downgraded,
  };
}

// =====================================================================
// UTILITY: Get available mechanics for a heat band
// =====================================================================

/**
 * Returns all mechanics available at a given heat band.
 * Useful for the routing layer to know what it can dispatch.
 */
export function getAvailableMechanics(heatBand: HeatBand): MechanicProfile[] {
  const maxLoad = HEAT_BAND_VISUALS[heatBand].maxCognitiveLoad;
  return Object.values(MECHANICS).filter(m =>
    m.heatBandAccess.includes(heatBand) &&
    LOAD_RANK[m.cognitiveLoad] <= LOAD_RANK[maxLoad]
  );
}

/**
 * Returns compatible receipt types for a given mechanic + heat band.
 */
export function getAvailableReceipts(
  mechanicId: MechanicId,
  heatBand: HeatBand,
): ReceiptProfile[] {
  const mechanic = MECHANICS[mechanicId];
  const maxLoad = HEAT_BAND_VISUALS[heatBand].maxCognitiveLoad;
  return mechanic.receipts
    .map(id => RECEIPTS[id])
    .filter(r => LOAD_RANK[r.receiptLoad] <= LOAD_RANK[maxLoad]);
}
