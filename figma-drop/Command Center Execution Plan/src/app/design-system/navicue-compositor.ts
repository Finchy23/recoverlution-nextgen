/**
 * NAVICUE COMPOSITOR
 * ==================
 * 
 * The compositional brain for systematised variety across ~2,000 NaviCues.
 * 
 * PHILOSOPHY: Same grammar, unique poetry. Every specimen gets a deterministic
 * but unique combination of scene, atmosphere mode, entry choreography,
 * interaction shape, color temperature, typography mood, and transition style.
 * 
 * 7 LIBRARIES:
 *   1. Scene Backgrounds   (12) -- the world you see
 *   2. Atmosphere Modes    (10) -- how the particles breathe
 *   3. Entry Patterns      (10) -- how the experience begins
 *   4. Interaction Shapes  (10) -- what the user does
 *   5. Color Temperatures  (5)  -- linked to chrono context
 *   6. Typography Moods    (5)  -- linked to chrono x kbe
 *   7. Transition Styles   (5)  -- linked to magic signature
 * 
 * AFFINITY MATRIX:
 *   Weighted connections between signature, form, chrono, kbe, hook, and
 *   each library. The matrix is NOT fixed -- it provides weighted probabilities
 *   that the seeded PRNG resolves into a specific selection.
 * 
 * SEEDED PRNG:
 *   Every specimen has a specimenSeed (typically its specimen number).
 *   The same seed always produces the same combination, ensuring deterministic
 *   rendering while guaranteeing variety across the full corpus.
 * 
 * IMPORTANT: NaviCues are NOT linear. There is no "finishing" or "sealing"
 * in the traditional sense. The system decides what comes next based on the
 * user's needs. A user could go from #3 to #665 to #54 to #1098. The
 * compositor ensures each one feels like its own world.
 */

import type { MagicSignatureKey, NaviCueForm } from './navicue-blueprint';

// =====================================================================
// SEEDED PRNG (Mulberry32)
// =====================================================================

/**
 * Deterministic pseudo-random number generator.
 * Same seed always produces the same sequence.
 * Used so every specimen gets a unique but repeatable combination.
 */
export function createPRNG(seed: number) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick from a weighted array using PRNG.
 * weights: Record<key, number> where number is relative weight.
 */
function weightedPick<T extends string>(
  weights: Record<T, number>,
  rand: () => number,
): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// =====================================================================
// LIBRARY 1: SCENE BACKGROUNDS (12)
// =====================================================================

/**
 * Scene backgrounds define the visual world the user enters.
 * Each scene provides SVG-based visual primitives that respond
 * to breathAmplitude (0-1) and interactionProgress (0-1).
 */
export type SceneBackground =
  | 'deep_field'      // Vast star field, multiple depth layers
  | 'aurora'          // Curtains of light rippling overhead
  | 'grid_pulse'      // Minimal grid that pulses with breath
  | 'ember_rise'      // Sparks climbing from a low source
  | 'refraction'      // Light bending through geometric prisms
  | 'liquid_dark'     // Slow-moving dark fluid with surface tension
  | 'cathedral'       // Tall vertical light shafts, reverence
  | 'interference'    // Wave interference patterns, moire
  | 'horizon_line'    // Single horizon with gradient sky above/below
  | 'frost_glass'     // Crystalline frost patterns growing on glass
  | 'constellation'   // Connected star patterns forming shapes
  | 'smoke_drift';    // Organic smoke tendrils drifting lazily

export interface SceneConfig {
  id: SceneBackground;
  /** Number of SVG elements the scene generates */
  elementCount: number;
  /** Base animation duration in seconds */
  baseDuration: number;
  /** Whether the scene responds strongly to breath */
  breathResponsive: boolean;
  /** Whether the scene responds to interaction progress */
  interactionResponsive: boolean;
  /** Dominant visual axis: 'vertical' | 'horizontal' | 'radial' | 'scattered' */
  axis: 'vertical' | 'horizontal' | 'radial' | 'scattered';
  /** Visual density: affects how much of the viewport is filled */
  density: number;
}

export const SCENE_CONFIGS: Record<SceneBackground, SceneConfig> = {
  deep_field: {
    id: 'deep_field',
    elementCount: 60,
    baseDuration: 20,
    breathResponsive: false,
    interactionResponsive: true,
    axis: 'scattered',
    density: 0.7,
  },
  aurora: {
    id: 'aurora',
    elementCount: 5,
    baseDuration: 12,
    breathResponsive: true,
    interactionResponsive: false,
    axis: 'horizontal',
    density: 0.4,
  },
  grid_pulse: {
    id: 'grid_pulse',
    elementCount: 24,
    baseDuration: 4,
    breathResponsive: true,
    interactionResponsive: true,
    axis: 'radial',
    density: 0.3,
  },
  ember_rise: {
    id: 'ember_rise',
    elementCount: 20,
    baseDuration: 8,
    breathResponsive: false,
    interactionResponsive: true,
    axis: 'vertical',
    density: 0.5,
  },
  refraction: {
    id: 'refraction',
    elementCount: 8,
    baseDuration: 15,
    breathResponsive: false,
    interactionResponsive: true,
    axis: 'radial',
    density: 0.35,
  },
  liquid_dark: {
    id: 'liquid_dark',
    elementCount: 4,
    baseDuration: 18,
    breathResponsive: true,
    interactionResponsive: false,
    axis: 'horizontal',
    density: 0.6,
  },
  cathedral: {
    id: 'cathedral',
    elementCount: 6,
    baseDuration: 14,
    breathResponsive: true,
    interactionResponsive: false,
    axis: 'vertical',
    density: 0.25,
  },
  interference: {
    id: 'interference',
    elementCount: 12,
    baseDuration: 10,
    breathResponsive: true,
    interactionResponsive: true,
    axis: 'radial',
    density: 0.45,
  },
  horizon_line: {
    id: 'horizon_line',
    elementCount: 3,
    baseDuration: 25,
    breathResponsive: true,
    interactionResponsive: false,
    axis: 'horizontal',
    density: 0.2,
  },
  frost_glass: {
    id: 'frost_glass',
    elementCount: 16,
    baseDuration: 30,
    breathResponsive: false,
    interactionResponsive: true,
    axis: 'scattered',
    density: 0.5,
  },
  constellation: {
    id: 'constellation',
    elementCount: 18,
    baseDuration: 22,
    breathResponsive: false,
    interactionResponsive: true,
    axis: 'scattered',
    density: 0.4,
  },
  smoke_drift: {
    id: 'smoke_drift',
    elementCount: 6,
    baseDuration: 16,
    breathResponsive: true,
    interactionResponsive: false,
    axis: 'vertical',
    density: 0.35,
  },
};

// =====================================================================
// LIBRARY 2: ATMOSPHERE MODES (10)
// =====================================================================

/**
 * Atmosphere modes define HOW the ambient particles move.
 * The existing NaviCueAtmosphere renders particles; these modes
 * specify the motion character so the same particle system
 * feels radically different per specimen.
 */
export type AtmosphereMode =
  | 'drift'       // Lazy float, barely there (default / current)
  | 'orbital'     // Circular paths around a center point
  | 'convergent'  // Particles drawn toward center, then released
  | 'cascade'     // Waterfall downward, lateral scatter at bottom
  | 'tidal'       // Rhythmic lateral sweep, synchronized to breath
  | 'swarm'       // Organic clustering, seeking behavior
  | 'radial'      // Outward pulse from center on breath peaks
  | 'lattice'     // Grid-locked positions with subtle oscillation
  | 'spiral'      // Logarithmic spiral path, slow tightening
  | 'brownian';   // True random walk, chaotic but gentle

export interface AtmosphereModeConfig {
  id: AtmosphereMode;
  /** Motion vector function type */
  motionType: 'linear' | 'circular' | 'spring' | 'noise';
  /** How strongly breath amplitude affects particle motion (0-1) */
  breathCoupling: number;
  /** Base speed multiplier */
  speedMultiplier: number;
  /** Whether particles cluster or spread */
  clustering: number; // -1 (spread) to 1 (cluster)
  /** Y-axis bias: -1 (upward) to 1 (downward) */
  gravityBias: number;
}

export const ATMOSPHERE_MODE_CONFIGS: Record<AtmosphereMode, AtmosphereModeConfig> = {
  drift: {
    id: 'drift',
    motionType: 'linear',
    breathCoupling: 0.2,
    speedMultiplier: 1.0,
    clustering: 0,
    gravityBias: -0.3, // gentle upward
  },
  orbital: {
    id: 'orbital',
    motionType: 'circular',
    breathCoupling: 0.3,
    speedMultiplier: 0.8,
    clustering: 0.4,
    gravityBias: 0,
  },
  convergent: {
    id: 'convergent',
    motionType: 'spring',
    breathCoupling: 0.6,
    speedMultiplier: 0.5,
    clustering: 0.8,
    gravityBias: 0,
  },
  cascade: {
    id: 'cascade',
    motionType: 'linear',
    breathCoupling: 0.1,
    speedMultiplier: 1.4,
    clustering: -0.3,
    gravityBias: 0.7, // downward pull
  },
  tidal: {
    id: 'tidal',
    motionType: 'spring',
    breathCoupling: 0.9,
    speedMultiplier: 0.7,
    clustering: 0,
    gravityBias: 0,
  },
  swarm: {
    id: 'swarm',
    motionType: 'noise',
    breathCoupling: 0.3,
    speedMultiplier: 1.2,
    clustering: 0.6,
    gravityBias: 0,
  },
  radial: {
    id: 'radial',
    motionType: 'spring',
    breathCoupling: 0.8,
    speedMultiplier: 1.0,
    clustering: -0.5, // outward pulse
    gravityBias: 0,
  },
  lattice: {
    id: 'lattice',
    motionType: 'spring',
    breathCoupling: 0.4,
    speedMultiplier: 0.3,
    clustering: 0.2,
    gravityBias: 0,
  },
  spiral: {
    id: 'spiral',
    motionType: 'circular',
    breathCoupling: 0.5,
    speedMultiplier: 0.6,
    clustering: 0.3,
    gravityBias: -0.1,
  },
  brownian: {
    id: 'brownian',
    motionType: 'noise',
    breathCoupling: 0.1,
    speedMultiplier: 1.1,
    clustering: -0.2,
    gravityBias: 0,
  },
};

// =====================================================================
// LIBRARY 3: ENTRY PATTERNS (10)
// =====================================================================

/**
 * Entry patterns define how the first 3-8 seconds feel.
 * This is the choreography of arrival -- what the user sees,
 * hears (visually), and feels before any content appears.
 * 
 * Some patterns are silence-heavy. Some skip silence entirely.
 * The variety prevents the "every NaviCue starts the same" problem.
 */
export type EntryPattern =
  | 'fade_text'        // Standard: atmosphere 2s, text fades in gently
  | 'scene_first'      // Scene builds for 4s, text arrives after
  | 'object_first'     // Central interactive element appears first, context after
  | 'silence_first'    // 5 seconds of pure atmosphere, then a single word sears in
  | 'cold_open'        // No threshold. Content is immediately present. Startling.
  | 'breath_gate'      // Atmosphere holds until one full breath cycle completes
  | 'particle_gather'  // Particles converge from edges into formation, then text
  | 'emergence'        // Text emerges letter by letter from the particle field
  | 'split_reveal'     // Two halves of the screen slide apart to reveal content
  | 'dissolve_in';     // Everything starts visible but deeply blurred, slowly focuses

export interface EntryPatternConfig {
  id: EntryPattern;
  /** Duration of the entry sequence in ms */
  durationMs: number;
  /** Whether atmosphere renders before content */
  atmosphereFirst: boolean;
  /** Delay before text appears (ms) */
  textDelayMs: number;
  /** Whether this entry requires breath engine sync */
  requiresBreath: boolean;
  /** CSS animation keyframes type */
  animationType: 'opacity' | 'transform' | 'filter' | 'clip' | 'none';
}

export const ENTRY_PATTERN_CONFIGS: Record<EntryPattern, EntryPatternConfig> = {
  fade_text: {
    id: 'fade_text',
    durationMs: 3000,
    atmosphereFirst: true,
    textDelayMs: 1500,
    requiresBreath: false,
    animationType: 'opacity',
  },
  scene_first: {
    id: 'scene_first',
    durationMs: 5000,
    atmosphereFirst: true,
    textDelayMs: 3500,
    requiresBreath: false,
    animationType: 'opacity',
  },
  object_first: {
    id: 'object_first',
    durationMs: 3500,
    atmosphereFirst: false,
    textDelayMs: 800,
    requiresBreath: false,
    animationType: 'transform',
  },
  silence_first: {
    id: 'silence_first',
    durationMs: 7000,
    atmosphereFirst: true,
    textDelayMs: 5000,
    requiresBreath: false,
    animationType: 'opacity',
  },
  cold_open: {
    id: 'cold_open',
    durationMs: 800,
    atmosphereFirst: false,
    textDelayMs: 0,
    requiresBreath: false,
    animationType: 'none',
  },
  breath_gate: {
    id: 'breath_gate',
    durationMs: 8000, // max, but exits early on breath completion
    atmosphereFirst: true,
    textDelayMs: 0, // gated by breath, not time
    requiresBreath: true,
    animationType: 'opacity',
  },
  particle_gather: {
    id: 'particle_gather',
    durationMs: 4500,
    atmosphereFirst: true,
    textDelayMs: 3000,
    requiresBreath: false,
    animationType: 'transform',
  },
  emergence: {
    id: 'emergence',
    durationMs: 5000,
    atmosphereFirst: true,
    textDelayMs: 2000,
    requiresBreath: false,
    animationType: 'opacity',
  },
  split_reveal: {
    id: 'split_reveal',
    durationMs: 3500,
    atmosphereFirst: true,
    textDelayMs: 2000,
    requiresBreath: false,
    animationType: 'clip',
  },
  dissolve_in: {
    id: 'dissolve_in',
    durationMs: 4000,
    atmosphereFirst: false,
    textDelayMs: 0,
    requiresBreath: false,
    animationType: 'filter',
  },
};

// =====================================================================
// LIBRARY 4: INTERACTION SHAPES (10)
// =====================================================================

/**
 * Interaction shapes define the structural pattern of the user's engagement.
 * This is not the specific hook (hold/drag/type) but the SHAPE of the
 * experience -- how the interaction unfolds over time.
 */
export type InteractionShape =
  | 'single_action'      // One decisive moment -- tap/hold/swipe and done
  | 'progressive_strip'  // Sequential reveals, each action unlocks the next
  | 'physics_sim'        // Physics metaphor -- gravity, momentum, friction
  | 'transformation'     // Something changes form through the interaction
  | 'observation'        // Watch and witness, breath-synced, passive presence
  | 'calibration'        // Adjust/tune a value to find the right balance
  | 'construction'       // Build something piece by piece
  | 'deconstruction'     // Take something apart, reveal what's underneath
  | 'choice_branch'      // Binary or ternary choice, each path different
  | 'ritual';            // Multi-step ceremony with deliberate pacing

export interface InteractionShapeConfig {
  id: InteractionShape;
  /** Typical number of user actions */
  actionCount: number;
  /** Average active phase duration in seconds */
  activeDurationSec: number;
  /** Whether the shape has multiple distinct phases */
  isMultiPhase: boolean;
  /** Cognitive load: 'minimal' | 'moderate' | 'full' */
  cognitiveLoad: 'minimal' | 'moderate' | 'full';
}

export const INTERACTION_SHAPE_CONFIGS: Record<InteractionShape, InteractionShapeConfig> = {
  single_action: {
    id: 'single_action',
    actionCount: 1,
    activeDurationSec: 5,
    isMultiPhase: false,
    cognitiveLoad: 'minimal',
  },
  progressive_strip: {
    id: 'progressive_strip',
    actionCount: 4,
    activeDurationSec: 15,
    isMultiPhase: true,
    cognitiveLoad: 'moderate',
  },
  physics_sim: {
    id: 'physics_sim',
    actionCount: 2,
    activeDurationSec: 12,
    isMultiPhase: false,
    cognitiveLoad: 'moderate',
  },
  transformation: {
    id: 'transformation',
    actionCount: 2,
    activeDurationSec: 10,
    isMultiPhase: true,
    cognitiveLoad: 'moderate',
  },
  observation: {
    id: 'observation',
    actionCount: 0,
    activeDurationSec: 15,
    isMultiPhase: false,
    cognitiveLoad: 'minimal',
  },
  calibration: {
    id: 'calibration',
    actionCount: 3,
    activeDurationSec: 12,
    isMultiPhase: false,
    cognitiveLoad: 'moderate',
  },
  construction: {
    id: 'construction',
    actionCount: 5,
    activeDurationSec: 20,
    isMultiPhase: true,
    cognitiveLoad: 'full',
  },
  deconstruction: {
    id: 'deconstruction',
    actionCount: 3,
    activeDurationSec: 12,
    isMultiPhase: true,
    cognitiveLoad: 'moderate',
  },
  choice_branch: {
    id: 'choice_branch',
    actionCount: 1,
    activeDurationSec: 8,
    isMultiPhase: false,
    cognitiveLoad: 'full',
  },
  ritual: {
    id: 'ritual',
    actionCount: 4,
    activeDurationSec: 25,
    isMultiPhase: true,
    cognitiveLoad: 'full',
  },
};

// =====================================================================
// LIBRARY 5: COLOR TEMPERATURES (5)
// =====================================================================

/**
 * Color temperatures shift the palette warmth/coolness.
 * Linked primarily to chrono context but also influenced by signature.
 */
export type ColorTemperature = 'warm' | 'cool' | 'neutral' | 'muted' | 'vivid';

export interface ColorTemperatureConfig {
  id: ColorTemperature;
  /** Hue shift applied to primary (-15 to +15) */
  hueShift: number;
  /** Saturation multiplier (0.7 to 1.3) */
  saturationMult: number;
  /** Lightness shift (-5 to +5) */
  lightnessShift: number;
}

export const COLOR_TEMPERATURE_CONFIGS: Record<ColorTemperature, ColorTemperatureConfig> = {
  warm: { id: 'warm', hueShift: 8, saturationMult: 1.1, lightnessShift: 2 },
  cool: { id: 'cool', hueShift: -8, saturationMult: 0.95, lightnessShift: -2 },
  neutral: { id: 'neutral', hueShift: 0, saturationMult: 1.0, lightnessShift: 0 },
  muted: { id: 'muted', hueShift: 0, saturationMult: 0.75, lightnessShift: -3 },
  vivid: { id: 'vivid', hueShift: 0, saturationMult: 1.25, lightnessShift: 3 },
};

// =====================================================================
// LIBRARY 6: TYPOGRAPHY MOODS (5)
// =====================================================================

/**
 * Typography moods shift how text feels without changing the type system.
 * Applied as CSS property overrides on top of navicueType tokens.
 */
export type TypographyMood = 'contemplative' | 'precise' | 'urgent' | 'expansive' | 'intimate';

export interface TypographyMoodConfig {
  id: TypographyMood;
  /** Letter spacing adjustment */
  letterSpacingShift: string;
  /** Line height multiplier */
  lineHeightMult: number;
  /** Animation speed for text reveals (multiplier) */
  revealSpeedMult: number;
  /** Word pacing emphasis multiplier for key words */
  emphasisMult: number;
}

export const TYPOGRAPHY_MOOD_CONFIGS: Record<TypographyMood, TypographyMoodConfig> = {
  contemplative: {
    id: 'contemplative',
    letterSpacingShift: '0.02em',
    lineHeightMult: 1.15,
    revealSpeedMult: 0.7,
    emphasisMult: 2.0,
  },
  precise: {
    id: 'precise',
    letterSpacingShift: '0',
    lineHeightMult: 1.0,
    revealSpeedMult: 1.3,
    emphasisMult: 1.2,
  },
  urgent: {
    id: 'urgent',
    letterSpacingShift: '-0.01em',
    lineHeightMult: 0.95,
    revealSpeedMult: 1.6,
    emphasisMult: 1.0,
  },
  expansive: {
    id: 'expansive',
    letterSpacingShift: '0.03em',
    lineHeightMult: 1.2,
    revealSpeedMult: 0.6,
    emphasisMult: 1.8,
  },
  intimate: {
    id: 'intimate',
    letterSpacingShift: '0.01em',
    lineHeightMult: 1.1,
    revealSpeedMult: 0.8,
    emphasisMult: 1.5,
  },
};

// =====================================================================
// LIBRARY 7: TRANSITION STYLES (5)
// =====================================================================

/**
 * How stages transition into each other within the NaviCue.
 * Linked primarily to magic signature.
 */
export type TransitionStyle =
  | 'crossfade'       // Smooth opacity crossfade (default)
  | 'particle_bridge' // Particles carry from one stage to the next
  | 'breath_bridge'   // Transition synced to a full breath cycle
  | 'hard_cut'        // Instant switch, no transition (for disruption)
  | 'dissolve_reform';// Content dissolves into particles, reforms as new

export interface TransitionStyleConfig {
  id: TransitionStyle;
  /** Duration in ms */
  durationMs: number;
  /** CSS ease curve */
  ease: string;
  /** Whether stages overlap visually */
  overlaps: boolean;
}

export const TRANSITION_STYLE_CONFIGS: Record<TransitionStyle, TransitionStyleConfig> = {
  crossfade: {
    id: 'crossfade',
    durationMs: 600,
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    overlaps: true,
  },
  particle_bridge: {
    id: 'particle_bridge',
    durationMs: 1200,
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    overlaps: true,
  },
  breath_bridge: {
    id: 'breath_bridge',
    durationMs: 2000,
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    overlaps: false,
  },
  hard_cut: {
    id: 'hard_cut',
    durationMs: 0,
    ease: 'linear',
    overlaps: false,
  },
  dissolve_reform: {
    id: 'dissolve_reform',
    durationMs: 1500,
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
    overlaps: true,
  },
};

// =====================================================================
// AFFINITY MATRICES
// =====================================================================

/**
 * Weighted affinity maps connecting context to library selections.
 * Higher weight = stronger affinity. Weights are relative, not absolute.
 * 
 * The PRNG uses these weights to make a deterministic selection for each
 * specimen, ensuring variety while respecting aesthetic coherence.
 */

/** Magic Signature -> Scene Background affinities */
export const SIGNATURE_SCENE_AFFINITY: Record<MagicSignatureKey, Partial<Record<SceneBackground, number>>> = {
  sacred_ordinary:   { horizon_line: 5, smoke_drift: 4, cathedral: 3, ember_rise: 3, frost_glass: 2, liquid_dark: 2, deep_field: 1, aurora: 1 },
  witness_ritual:    { constellation: 5, deep_field: 4, horizon_line: 3, cathedral: 3, frost_glass: 2, smoke_drift: 2, interference: 1, liquid_dark: 1 },
  poetic_precision:  { frost_glass: 5, grid_pulse: 4, refraction: 4, constellation: 3, interference: 2, cathedral: 2, horizon_line: 1, deep_field: 1 },
  science_x_soul:    { interference: 5, grid_pulse: 4, refraction: 4, constellation: 3, deep_field: 3, aurora: 2, ember_rise: 1, frost_glass: 1 },
  koan_paradox:      { liquid_dark: 5, deep_field: 4, interference: 3, smoke_drift: 3, refraction: 2, cathedral: 2, frost_glass: 2, constellation: 1 },
  pattern_glitch:    { grid_pulse: 5, interference: 5, refraction: 3, frost_glass: 3, constellation: 2, deep_field: 2, ember_rise: 1, liquid_dark: 1 },
  sensory_cinema:    { aurora: 5, smoke_drift: 4, liquid_dark: 4, ember_rise: 3, deep_field: 3, cathedral: 2, horizon_line: 2, frost_glass: 1 },
  relational_ghost:  { smoke_drift: 5, cathedral: 4, horizon_line: 3, aurora: 3, constellation: 3, frost_glass: 2, liquid_dark: 2, deep_field: 1 },
};

/** Magic Signature -> Atmosphere Mode affinities */
export const SIGNATURE_ATMOSPHERE_AFFINITY: Record<MagicSignatureKey, Partial<Record<AtmosphereMode, number>>> = {
  sacred_ordinary:   { drift: 5, tidal: 4, convergent: 3, spiral: 2, radial: 1 },
  witness_ritual:    { convergent: 5, drift: 3, orbital: 3, spiral: 2, lattice: 2 },
  poetic_precision:  { lattice: 5, drift: 3, spiral: 3, convergent: 2, orbital: 1 },
  science_x_soul:    { radial: 5, orbital: 4, lattice: 3, spiral: 2, convergent: 2 },
  koan_paradox:      { spiral: 5, convergent: 4, brownian: 3, tidal: 2, drift: 2 },
  pattern_glitch:    { brownian: 5, swarm: 4, cascade: 3, radial: 2, lattice: 1 },
  sensory_cinema:    { tidal: 5, cascade: 4, drift: 3, swarm: 2, convergent: 2 },
  relational_ghost:  { orbital: 5, convergent: 4, drift: 3, tidal: 2, spiral: 2 },
};

/** Chrono Context -> Color Temperature affinities */
export const CHRONO_COLOR_AFFINITY: Record<string, Partial<Record<ColorTemperature, number>>> = {
  morning: { warm: 6, vivid: 3, neutral: 1 },
  work:    { cool: 5, neutral: 4, muted: 1 },
  social:  { warm: 5, neutral: 3, vivid: 2 },
  night:   { muted: 5, cool: 3, neutral: 1, vivid: 1 },
};

/** KBE -> Typography Mood affinities */
export const KBE_TYPOGRAPHY_AFFINITY: Record<string, Partial<Record<TypographyMood, number>>> = {
  knowing:   { precise: 5, contemplative: 3, expansive: 2 },
  believing: { contemplative: 5, intimate: 3, expansive: 2 },
  embodying: { intimate: 5, urgent: 4, precise: 2 },
  k:         { precise: 5, contemplative: 3, expansive: 2 },
  b:         { contemplative: 5, intimate: 3, expansive: 2 },
  e:         { intimate: 5, urgent: 4, precise: 2 },
};

/** Magic Signature -> Transition Style affinities */
export const SIGNATURE_TRANSITION_AFFINITY: Record<MagicSignatureKey, Partial<Record<TransitionStyle, number>>> = {
  sacred_ordinary:   { crossfade: 5, breath_bridge: 3, dissolve_reform: 2 },
  witness_ritual:    { breath_bridge: 5, crossfade: 3, dissolve_reform: 2 },
  poetic_precision:  { crossfade: 5, dissolve_reform: 3, particle_bridge: 2 },
  science_x_soul:    { particle_bridge: 5, crossfade: 3, dissolve_reform: 2 },
  koan_paradox:      { dissolve_reform: 5, hard_cut: 3, breath_bridge: 2 },
  pattern_glitch:    { hard_cut: 5, particle_bridge: 3, crossfade: 2 },
  sensory_cinema:    { dissolve_reform: 5, crossfade: 3, breath_bridge: 2 },
  relational_ghost:  { breath_bridge: 5, crossfade: 4, dissolve_reform: 1 },
};

/** Hook -> Entry Pattern affinities */
export const HOOK_ENTRY_AFFINITY: Record<string, Partial<Record<EntryPattern, number>>> = {
  hold:    { silence_first: 4, breath_gate: 4, fade_text: 3, scene_first: 2, emergence: 1 },
  tap:     { cold_open: 4, fade_text: 4, object_first: 3, split_reveal: 2, dissolve_in: 1 },
  drag:    { object_first: 4, scene_first: 3, fade_text: 3, split_reveal: 2, particle_gather: 2 },
  type:    { fade_text: 4, emergence: 4, dissolve_in: 3, scene_first: 2, silence_first: 1 },
  observe: { silence_first: 5, breath_gate: 4, scene_first: 3, particle_gather: 2, dissolve_in: 2, fade_text: 1 },
  draw:    { scene_first: 4, object_first: 3, fade_text: 3, particle_gather: 2, emergence: 2 },
};

/** Form -> Interaction Shape affinities */
export const FORM_SHAPE_AFFINITY: Record<string, Partial<Record<InteractionShape, number>>> = {
  Mirror:         { observation: 5, single_action: 3, calibration: 2, transformation: 2 },
  Probe:          { deconstruction: 5, calibration: 3, progressive_strip: 2, observation: 2 },
  Key:            { single_action: 5, construction: 3, choice_branch: 2, calibration: 1 },
  InventorySpark: { progressive_strip: 4, physics_sim: 3, transformation: 3, construction: 2 },
  Practice:       { observation: 4, single_action: 4, calibration: 3, progressive_strip: 2 },
  PartsRollcall:  { progressive_strip: 5, choice_branch: 3, ritual: 2, observation: 2 },
  IdentityKoan:   { single_action: 4, observation: 4, choice_branch: 3, ritual: 2 },
  Ember:          { transformation: 5, physics_sim: 3, ritual: 3, construction: 2 },
  Stellar:        { observation: 5, physics_sim: 3, calibration: 2, single_action: 2 },
  Canopy:         { observation: 4, calibration: 4, progressive_strip: 3, construction: 2 },
  Storm:          { physics_sim: 5, deconstruction: 4, transformation: 2, single_action: 2 },
  Ocean:          { observation: 5, single_action: 3, transformation: 2, progressive_strip: 2 },
  Theater:        { progressive_strip: 5, ritual: 4, transformation: 3, choice_branch: 2 },
  Hearth:         { calibration: 4, single_action: 4, construction: 3, ritual: 2 },
  Circuit:        { calibration: 5, construction: 3, physics_sim: 3, deconstruction: 2 },
  Cosmos:         { observation: 5, transformation: 3, single_action: 3, ritual: 2 },
  // Second Millennium forms
  Glacier:        { transformation: 4, calibration: 4, physics_sim: 3, observation: 2 },
  Tide:           { physics_sim: 4, observation: 4, calibration: 3, transformation: 2 },
  Lattice:        { construction: 5, physics_sim: 4, calibration: 3, deconstruction: 2 },
  Compass:        { calibration: 5, observation: 4, single_action: 3, choice_branch: 2 },
  Pulse:          { calibration: 4, physics_sim: 4, observation: 3, single_action: 2 },
  Drift:          { physics_sim: 5, calibration: 3, observation: 3, single_action: 2 },
  Echo:           { calibration: 5, observation: 4, transformation: 3, ritual: 2 },
};

// =====================================================================
// COMPOSITOR INPUT & OUTPUT
// =====================================================================

/**
 * Input to the compositor. A specimen provides these properties;
 * the compositor resolves everything else.
 */
export interface CompositorInput {
  /** Magic signature key */
  signature: MagicSignatureKey;
  /** NaviCue form (atmosphere archetype) */
  form: NaviCueForm;
  /** Chrono context */
  chrono: 'morning' | 'work' | 'social' | 'night';
  /** KBE layer */
  kbe: 'knowing' | 'believing' | 'embodying' | 'k' | 'b' | 'e';
  /** Interaction hook type */
  hook: 'hold' | 'tap' | 'drag' | 'type' | 'observe' | 'draw';
  /** Unique seed for this specimen (typically the specimen number) */
  specimenSeed: number;
  /** Whether this is a seal specimen (#10 per series) */
  isSeal: boolean;
}

/**
 * Output from the compositor. Everything needed to render a NaviCue.
 */
export interface CompositorOutput {
  /** Resolved scene background */
  scene: SceneBackground;
  /** Resolved scene config */
  sceneConfig: SceneConfig;
  /** Resolved atmosphere mode */
  atmosphereMode: AtmosphereMode;
  /** Resolved atmosphere mode config */
  atmosphereModeConfig: AtmosphereModeConfig;
  /** Resolved entry pattern */
  entryPattern: EntryPattern;
  /** Resolved entry config */
  entryConfig: EntryPatternConfig;
  /** Resolved interaction shape */
  interactionShape: InteractionShape;
  /** Resolved interaction shape config */
  interactionShapeConfig: InteractionShapeConfig;
  /** Resolved color temperature */
  colorTemperature: ColorTemperature;
  /** Resolved color temperature config */
  colorConfig: ColorTemperatureConfig;
  /** Resolved typography mood */
  typographyMood: TypographyMood;
  /** Resolved typography mood config */
  typographyConfig: TypographyMoodConfig;
  /** Resolved transition style */
  transitionStyle: TransitionStyle;
  /** Resolved transition style config */
  transitionConfig: TransitionStyleConfig;
}

// =====================================================================
// WEIGHT HELPER
// =====================================================================

/**
 * Fill missing weights with a small default so every option has a chance.
 */
function fillWeights<T extends string>(
  partial: Partial<Record<T, number>>,
  allKeys: T[],
  defaultWeight = 1,
): Record<T, number> {
  const result = {} as Record<T, number>;
  for (const key of allKeys) {
    result[key] = (partial[key] ?? defaultWeight);
  }
  return result;
}

// =====================================================================
// MAIN COMPOSITOR FUNCTION
// =====================================================================

/**
 * Compose a full NaviCue experience from a CompositorInput.
 *
 * Uses the affinity matrices and seeded PRNG to deterministically
 * resolve a unique combination of scene, atmosphere, entry, interaction,
 * color, typography, and transition for each specimen.
 */
export function composeNaviCue(input: CompositorInput): CompositorOutput {
  const rand = createPRNG(input.specimenSeed);

  // 1. Scene Background
  const sceneWeights = fillWeights(
    SIGNATURE_SCENE_AFFINITY[input.signature] || {},
    Object.keys(SCENE_CONFIGS) as SceneBackground[],
  );
  const scene = weightedPick(sceneWeights, rand);

  // 2. Atmosphere Mode
  const atmosphereWeights = fillWeights(
    SIGNATURE_ATMOSPHERE_AFFINITY[input.signature] || {},
    Object.keys(ATMOSPHERE_MODE_CONFIGS) as AtmosphereMode[],
  );
  const atmosphereMode = weightedPick(atmosphereWeights, rand);

  // 3. Entry Pattern
  const entryWeights = fillWeights(
    HOOK_ENTRY_AFFINITY[input.hook] || {},
    Object.keys(ENTRY_PATTERN_CONFIGS) as EntryPattern[],
  );
  const entryPattern = weightedPick(entryWeights, rand);

  // 4. Interaction Shape
  const formKey = input.form || 'Practice';
  const shapeWeights = fillWeights(
    FORM_SHAPE_AFFINITY[formKey] || {},
    Object.keys(INTERACTION_SHAPE_CONFIGS) as InteractionShape[],
  );
  // Seal specimens always use ritual
  if (input.isSeal) {
    shapeWeights.ritual = (shapeWeights.ritual || 1) * 5;
  }
  const interactionShape = weightedPick(shapeWeights, rand);

  // 5. Color Temperature
  const colorWeights = fillWeights(
    CHRONO_COLOR_AFFINITY[input.chrono] || {},
    Object.keys(COLOR_TEMPERATURE_CONFIGS) as ColorTemperature[],
  );
  const colorTemperature = weightedPick(colorWeights, rand);

  // 6. Typography Mood
  const typoWeights = fillWeights(
    KBE_TYPOGRAPHY_AFFINITY[input.kbe] || {},
    Object.keys(TYPOGRAPHY_MOOD_CONFIGS) as TypographyMood[],
  );
  const typographyMood = weightedPick(typoWeights, rand);

  // 7. Transition Style
  const transitionWeights = fillWeights(
    SIGNATURE_TRANSITION_AFFINITY[input.signature] || {},
    Object.keys(TRANSITION_STYLE_CONFIGS) as TransitionStyle[],
  );
  const transitionStyle = weightedPick(transitionWeights, rand);

  return {
    scene,
    sceneConfig: SCENE_CONFIGS[scene],
    atmosphereMode,
    atmosphereModeConfig: ATMOSPHERE_MODE_CONFIGS[atmosphereMode],
    entryPattern,
    entryConfig: ENTRY_PATTERN_CONFIGS[entryPattern],
    interactionShape,
    interactionShapeConfig: INTERACTION_SHAPE_CONFIGS[interactionShape],
    colorTemperature,
    colorConfig: COLOR_TEMPERATURE_CONFIGS[colorTemperature],
    typographyMood,
    typographyConfig: TYPOGRAPHY_MOOD_CONFIGS[typographyMood],
    transitionStyle,
    transitionConfig: TRANSITION_STYLE_CONFIGS[transitionStyle],
  };
}