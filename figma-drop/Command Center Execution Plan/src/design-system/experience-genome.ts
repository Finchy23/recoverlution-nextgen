/**
 * EXPERIENCE GENOME
 * 
 * The complete DNA of RecoveryOS Command Center
 * Maps 1400+ NaviCue types to visual, interactive, and experiential layers
 * 
 * Architecture:
 * - Asset Layer: Visual identity (backgrounds, imagery)
 * - Magic Layer: Elevation & atmosphere (gradients, particles, effects)
 * - Response Patterns: Cognitive/emotional modes
 * - Mechanism Library: 300 interaction types
 * - Voice System: Language & tone patterns
 */

import { colors } from '@/design-tokens';

// ═════════════════════════════════════════════════════════════════════════════
// ASSET LAYER - Visual Identity Mapping
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Asset Categories
 * ~20-30 distinct visual themes that map to NaviCue essence
 */
export const ASSET_CATEGORIES = {
  // Cognitive/Mental
  NEURAL_ABSTRACT: {
    id: 'neural_abstract',
    name: 'Neural Abstract',
    essence: 'consciousness, thinking, knowing, awareness',
    energy: 'cerebral, introspective, clarity',
    examples: [
      'flowstate_abstract_neurowave_dark',
      'flowstate_abstract_neural_network',
      'flowstate_abstract_consciousness_web',
    ],
  },
  
  GEOMETRIC_STRUCTURE: {
    id: 'geometric_structure',
    name: 'Geometric Structure',
    essence: 'systems, boundaries, frameworks, order',
    energy: 'precise, contained, architectural',
    examples: [
      'flowstate_geometric_grid',
      'flowstate_geometric_crystalline',
      'flowstate_geometric_boundaries',
    ],
  },
  
  // Emotional/Fluid
  ORGANIC_FLOW: {
    id: 'organic_flow',
    name: 'Organic Flow',
    essence: 'emotions, fluidity, becoming, movement',
    energy: 'flowing, adaptive, transformational',
    examples: [
      'flowstate_organic_water_flow',
      'flowstate_organic_fluid_motion',
      'flowstate_organic_waves',
    ],
  },
  
  GRADIENT_ATMOSPHERE: {
    id: 'gradient_atmosphere',
    name: 'Gradient Atmosphere',
    essence: 'mood, tone, emotional climate, transition',
    energy: 'ambient, subtle, shifting',
    examples: [
      'flowstate_gradient_dawn',
      'flowstate_gradient_dusk',
      'flowstate_gradient_emotional_spectrum',
    ],
  },
  
  // Somatic/Physical
  SOMATIC_BODY: {
    id: 'somatic_body',
    name: 'Somatic Body',
    essence: 'physical sensation, embodiment, felt sense',
    energy: 'grounded, visceral, present',
    examples: [
      'flowstate_somatic_texture',
      'flowstate_somatic_skin',
      'flowstate_somatic_breath',
    ],
  },
  
  ELEMENTAL_EARTH: {
    id: 'elemental_earth',
    name: 'Elemental Earth',
    essence: 'grounding, stability, nature, roots',
    energy: 'solid, nurturing, foundational',
    examples: [
      'flowstate_earth_stone',
      'flowstate_earth_soil',
      'flowstate_earth_roots',
    ],
  },
  
  // Relational/Connection
  NETWORK_CONNECTION: {
    id: 'network_connection',
    name: 'Network Connection',
    essence: 'relationships, interconnection, threads',
    energy: 'linking, social, interdependent',
    examples: [
      'flowstate_network_web',
      'flowstate_network_constellation',
      'flowstate_network_threads',
    ],
  },
  
  MIRROR_REFLECTION: {
    id: 'mirror_reflection',
    name: 'Mirror Reflection',
    essence: 'self-awareness, witnessing, perspective',
    energy: 'reflective, dual, observing',
    examples: [
      'flowstate_mirror_water',
      'flowstate_mirror_glass',
      'flowstate_mirror_twin',
    ],
  },
  
  // Spiritual/Transcendent
  COSMIC_LIGHT: {
    id: 'cosmic_light',
    name: 'Cosmic Light',
    essence: 'transcendence, possibility, expansion, infinity',
    energy: 'luminous, vast, ethereal',
    examples: [
      'flowstate_cosmic_starfield',
      'flowstate_cosmic_nebula',
      'flowstate_cosmic_dawn',
    ],
  },
  
  ETHEREAL_VOID: {
    id: 'ethereal_void',
    name: 'Ethereal Void',
    essence: 'emptiness, potential, silence, mystery',
    energy: 'spacious, quiet, receptive',
    examples: [
      'flowstate_void_empty',
      'flowstate_void_mist',
      'flowstate_void_silence',
    ],
  },
  
  // Temporal/Process
  TEMPORAL_MOTION: {
    id: 'temporal_motion',
    name: 'Temporal Motion',
    essence: 'time, momentum, cycles, rhythm',
    energy: 'dynamic, pulsing, sequential',
    examples: [
      'flowstate_temporal_spiral',
      'flowstate_temporal_pulse',
      'flowstate_temporal_cycle',
    ],
  },
  
  GROWTH_EMERGENCE: {
    id: 'growth_emergence',
    name: 'Growth Emergence',
    essence: 'evolution, becoming, unfolding, sprouting',
    energy: 'emergent, developmental, organic',
    examples: [
      'flowstate_growth_bloom',
      'flowstate_growth_unfold',
      'flowstate_growth_sprout',
    ],
  },
  
  // Energy/Vitality
  FIRE_ENERGY: {
    id: 'fire_energy',
    name: 'Fire Energy',
    essence: 'passion, transformation, power, release',
    energy: 'intense, catalyzing, burning',
    examples: [
      'flowstate_fire_flame',
      'flowstate_fire_ember',
      'flowstate_fire_phoenix',
    ],
  },
  
  ELECTRIC_VITALITY: {
    id: 'electric_vitality',
    name: 'Electric Vitality',
    essence: 'activation, charge, aliveness, spark',
    energy: 'energetic, vibrant, electric',
    examples: [
      'flowstate_electric_lightning',
      'flowstate_electric_spark',
      'flowstate_electric_charge',
    ],
  },
  
  // Shadow/Depth
  SHADOW_DEPTH: {
    id: 'shadow_depth',
    name: 'Shadow Depth',
    essence: 'unconscious, hidden, depth, integration',
    energy: 'dark, mysterious, profound',
    examples: [
      'flowstate_shadow_cave',
      'flowstate_shadow_deep',
      'flowstate_shadow_night',
    ],
  },
  
  LIMINAL_THRESHOLD: {
    id: 'liminal_threshold',
    name: 'Liminal Threshold',
    essence: 'transition, edge, between, gateway',
    energy: 'uncertain, transitional, betwixt',
    examples: [
      'flowstate_liminal_door',
      'flowstate_liminal_fog',
      'flowstate_liminal_twilight',
    ],
  },
} as const;

/**
 * Asset Mapping Rules
 * How to select the right asset based on NaviCue attributes
 */
export const ASSET_MAPPING_RULES = {
  // Primary mapping by Form + Intent
  byFormIntent: {
    'Question + Exploration': 'NEURAL_ABSTRACT',
    'Question + Clarity': 'GEOMETRIC_STRUCTURE',
    'Invitation + Discovery': 'ORGANIC_FLOW',
    'Invitation + Integration': 'GRADIENT_ATMOSPHERE',
    'Mirror + Awareness': 'MIRROR_REFLECTION',
    'Mirror + Witnessing': 'ETHEREAL_VOID',
    'Prompt + Action': 'ELECTRIC_VITALITY',
    'Prompt + Choice': 'TEMPORAL_MOTION',
    'Reflection + Integration': 'COSMIC_LIGHT',
    'Affirmation + Grounding': 'ELEMENTAL_EARTH',
    'Reframe + Perspective': 'LIMINAL_THRESHOLD',
    'Release + Letting Go': 'FIRE_ENERGY',
    'Somatic + Embodiment': 'SOMATIC_BODY',
    'Relational + Connection': 'NETWORK_CONNECTION',
    'Shadow + Integration': 'SHADOW_DEPTH',
    'Growth + Evolution': 'GROWTH_EMERGENCE',
  },
  
  // Secondary mapping by KBE Layer
  byKBELayer: {
    'Sensation': 'SOMATIC_BODY',
    'Emotion': 'ORGANIC_FLOW',
    'Thought': 'NEURAL_ABSTRACT',
    'Belief': 'GEOMETRIC_STRUCTURE',
    'Identity': 'MIRROR_REFLECTION',
    'Relational': 'NETWORK_CONNECTION',
    'Systemic': 'TEMPORAL_MOTION',
    'Existential': 'COSMIC_LIGHT',
    'Archetypal': 'SHADOW_DEPTH',
    'Transcendent': 'ETHEREAL_VOID',
  },
  
  // Tertiary mapping by Family
  byFamily: {
    'Probe': 'NEURAL_ABSTRACT',
    'Directive': 'GEOMETRIC_STRUCTURE',
    'Reflective': 'MIRROR_REFLECTION',
    'Adaptive': 'ORGANIC_FLOW',
  },
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// MAGIC LAYER - Elevation & Atmosphere
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Elevation Levels
 * Defines the intensity/presence of magical effects
 */
export const ELEVATION_LEVELS = {
  WHISPER: {
    id: 'whisper',
    name: 'Whisper',
    description: 'Subtle presence, gentle guidance',
    opacity: { min: 0.05, max: 0.15 },
    particleCount: { mobile: 10, desktop: 20 },
    particleSize: { min: 1, max: 2 },
    glowIntensity: 0.2,
    gradientStrength: 0.1,
    animationDuration: { min: 5, max: 8 },
  },
  
  PRESENCE: {
    id: 'presence',
    name: 'Presence',
    description: 'Active engagement, clear direction',
    opacity: { min: 0.15, max: 0.30 },
    particleCount: { mobile: 30, desktop: 50 },
    particleSize: { min: 2, max: 4 },
    glowIntensity: 0.5,
    gradientStrength: 0.25,
    animationDuration: { min: 3, max: 6 },
  },
  
  RESONANCE: {
    id: 'resonance',
    name: 'Resonance',
    description: 'Deep activation, transformation',
    opacity: { min: 0.30, max: 0.50 },
    particleCount: { mobile: 50, desktop: 80 },
    particleSize: { min: 3, max: 6 },
    glowIntensity: 0.8,
    gradientStrength: 0.4,
    animationDuration: { min: 2, max: 4 },
  },
} as const;

/**
 * Magic Layer Components
 */
export const MAGIC_COMPONENTS = {
  // Gradient patterns
  gradients: {
    RADIAL_GLOW: {
      type: 'radial',
      pattern: 'circle at 30% 20%',
      description: 'Soft radial glow from top-left',
    },
    LINEAR_HORIZON: {
      type: 'linear',
      pattern: '180deg',
      description: 'Horizon fade from top to bottom',
    },
    DIAGONAL_SWEEP: {
      type: 'linear',
      pattern: '135deg',
      description: 'Diagonal sweep across canvas',
    },
    CONIC_SPIRAL: {
      type: 'conic',
      pattern: 'from 45deg at 50% 50%',
      description: 'Spiral emanating from center',
    },
  },
  
  // Particle behaviors
  particles: {
    FLOAT: {
      motion: 'vertical',
      speed: 'slow',
      description: 'Gentle upward float',
    },
    DRIFT: {
      motion: 'horizontal',
      speed: 'slow',
      description: 'Lateral drift',
    },
    PULSE: {
      motion: 'scale',
      speed: 'medium',
      description: 'Breathing pulse',
    },
    ORBIT: {
      motion: 'circular',
      speed: 'medium',
      description: 'Orbital rotation',
    },
    SHIMMER: {
      motion: 'opacity',
      speed: 'fast',
      description: 'Twinkling shimmer',
    },
  },
  
  // Edge treatments
  edges: {
    SOFT_BLUR: {
      blur: 20,
      fade: 0.8,
      description: 'Soft vignette fade',
    },
    SHARP_DEFINITION: {
      blur: 0,
      fade: 0,
      description: 'Crisp defined edges',
    },
    FEATHERED: {
      blur: 40,
      fade: 0.6,
      description: 'Heavy feathering',
    },
  },
} as const;

/**
 * Elevation Mapping Rules
 * Mechanism Complexity × Intent Depth → Elevation Level
 */
export const ELEVATION_MAPPING = {
  byMechanismComplexity: {
    simple: 'WHISPER',
    medium: 'PRESENCE',
    complex: 'RESONANCE',
  },
  
  byIntentDepth: {
    awareness: 'WHISPER',
    exploration: 'PRESENCE',
    transformation: 'RESONANCE',
  },
  
  byKBEDepth: {
    'Sensation': 'WHISPER',
    'Emotion': 'PRESENCE',
    'Thought': 'PRESENCE',
    'Belief': 'PRESENCE',
    'Identity': 'RESONANCE',
    'Relational': 'RESONANCE',
    'Systemic': 'RESONANCE',
    'Existential': 'RESONANCE',
    'Archetypal': 'RESONANCE',
    'Transcendent': 'RESONANCE',
  },
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// RESPONSE PATTERNS - Cognitive/Emotional Modes
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Response Types
 * The cognitive/emotional mode activated by the NaviCue
 * Couples with Intent to determine voice tone and interaction
 */
export const RESPONSE_PATTERNS = {
  KNOWING: {
    id: 'knowing',
    name: 'Knowing',
    mode: 'cognitive',
    description: 'I understand X',
    essence: 'clarity, comprehension, insight',
    voiceTone: 'clear, factual, direct',
    interactionTiming: 'immediate',
    visualTreatment: 'sharp, defined, geometric',
    familyAffinity: ['Probe', 'Directive'],
    examplePrompts: [
      'What pattern do you notice?',
      'How does this system work?',
      'What have you learned?',
    ],
  },
  
  BELIEVING: {
    id: 'believing',
    name: 'Believing',
    mode: 'conviction',
    description: 'I trust Y',
    essence: 'faith, trust, certainty, conviction',
    voiceTone: 'affirming, steady, grounded',
    interactionTiming: 'sustained',
    visualTreatment: 'solid, anchored, stable',
    familyAffinity: ['Directive', 'Reflective'],
    examplePrompts: [
      'What truth do you hold?',
      'What do you stand for?',
      'What do you trust about yourself?',
    ],
  },
  
  FEELING: {
    id: 'feeling',
    name: 'Feeling',
    mode: 'somatic',
    description: 'I sense Z',
    essence: 'sensation, emotion, embodiment, presence',
    voiceTone: 'gentle, visceral, embodied',
    interactionTiming: 'gradual',
    visualTreatment: 'fluid, organic, soft',
    familyAffinity: ['Reflective', 'Adaptive'],
    examplePrompts: [
      'What do you feel in your body?',
      'What emotion is present?',
      'Where do you sense this?',
    ],
  },
  
  BECOMING: {
    id: 'becoming',
    name: 'Becoming',
    mode: 'transformational',
    description: 'I\'m evolving into W',
    essence: 'growth, evolution, transformation, emergence',
    voiceTone: 'invitational, expansive, forward-looking',
    interactionTiming: 'progressive',
    visualTreatment: 'dynamic, flowing, ascending',
    familyAffinity: ['Adaptive', 'Probe'],
    examplePrompts: [
      'Who are you becoming?',
      'What is emerging?',
      'How are you transforming?',
    ],
  },
  
  WITNESSING: {
    id: 'witnessing',
    name: 'Witnessing',
    mode: 'observational',
    description: 'I notice A',
    essence: 'awareness, observation, presence, meta-cognition',
    voiceTone: 'neutral, spacious, curious',
    interactionTiming: 'contemplative',
    visualTreatment: 'spacious, minimal, reflective',
    familyAffinity: ['Reflective', 'Probe'],
    examplePrompts: [
      'What do you observe?',
      'What\'s happening right now?',
      'What are you aware of?',
    ],
  },
  
  CHOOSING: {
    id: 'choosing',
    name: 'Choosing',
    mode: 'decisive',
    description: 'I commit to B',
    essence: 'decision, commitment, agency, action',
    voiceTone: 'direct, activating, empowering',
    interactionTiming: 'immediate',
    visualTreatment: 'bold, directional, clear',
    familyAffinity: ['Directive', 'Adaptive'],
    examplePrompts: [
      'What will you choose?',
      'What action will you take?',
      'What do you commit to?',
    ],
  },
  
  RELEASING: {
    id: 'releasing',
    name: 'Releasing',
    mode: 'cathartic',
    description: 'I let go of C',
    essence: 'release, surrender, letting go, completion',
    voiceTone: 'gentle, permissive, liberating',
    interactionTiming: 'ritual',
    visualTreatment: 'dissolving, fading, spacious',
    familyAffinity: ['Reflective', 'Adaptive'],
    examplePrompts: [
      'What are you ready to release?',
      'What can you let go of?',
      'What no longer serves you?',
    ],
  },
  
  INTEGRATING: {
    id: 'integrating',
    name: 'Integrating',
    mode: 'synthesizing',
    description: 'I weave together D',
    essence: 'wholeness, integration, synthesis, completion',
    voiceTone: 'reflective, holistic, weaving',
    interactionTiming: 'contemplative',
    visualTreatment: 'cohesive, connected, whole',
    familyAffinity: ['Reflective', 'Directive'],
    examplePrompts: [
      'How does this all connect?',
      'What wholeness emerges?',
      'What have you integrated?',
    ],
  },
} as const;

/**
 * Response Pattern Mapping
 * Intent → Response Pattern
 */
export const RESPONSE_MAPPING = {
  byIntent: {
    'Exploration': 'KNOWING',
    'Discovery': 'KNOWING',
    'Clarity': 'KNOWING',
    'Understanding': 'KNOWING',
    'Awareness': 'WITNESSING',
    'Witnessing': 'WITNESSING',
    'Observation': 'WITNESSING',
    'Presence': 'FEELING',
    'Embodiment': 'FEELING',
    'Sensation': 'FEELING',
    'Emotion': 'FEELING',
    'Transformation': 'BECOMING',
    'Evolution': 'BECOMING',
    'Growth': 'BECOMING',
    'Emergence': 'BECOMING',
    'Choice': 'CHOOSING',
    'Decision': 'CHOOSING',
    'Action': 'CHOOSING',
    'Commitment': 'CHOOSING',
    'Release': 'RELEASING',
    'Letting Go': 'RELEASING',
    'Surrender': 'RELEASING',
    'Completion': 'RELEASING',
    'Integration': 'INTEGRATING',
    'Synthesis': 'INTEGRATING',
    'Wholeness': 'INTEGRATING',
    'Connection': 'INTEGRATING',
    'Grounding': 'BELIEVING',
    'Trust': 'BELIEVING',
    'Faith': 'BELIEVING',
    'Conviction': 'BELIEVING',
  },
} as const;

// ═════════════════════════════════════════════════════════════════════════════
// MECHANISM LIBRARY - 300 Interaction Types
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Mechanism Taxonomy
 * Organizing 300 mechanisms across multiple dimensions
 */

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
  | 'release'
  | 'integration'
  | 'activation'
  | 'grounding';

export interface Mechanism {
  id: string;
  name: string;
  category: MechanismCategory;
  complexity: MechanismComplexity;
  modality: MechanismModality[];
  outcome: MechanismOutcome[];
  description: string;
  interactionType: string;
  duration: 'instant' | 'short' | 'medium' | 'long';
  responseAffinity: string[];
}

/**
 * MECHANISM CATALOG - 300 Mechanisms
 * Organized by category
 */

export const MECHANISMS: Record<string, Mechanism> = {
  // ─────────────────────────────────────────────────────────────────────────
  // SPATIAL MECHANISMS (50)
  // ─────────────────────────────────────────────────────────────────────────
  
  GRAVITY_MAP: {
    id: 'gravity_map',
    name: 'Gravity Map',
    category: 'spatial',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Map priorities by spatial weight and pull',
    interactionType: 'drag-and-drop with physics',
    duration: 'medium',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  
  BOUNDARY_SLIDERS: {
    id: 'boundary_sliders',
    name: 'Boundary Sliders',
    category: 'spatial',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['decision', 'grounding'],
    description: 'Multi-axis boundary setting with sliders',
    interactionType: 'multi-slider',
    duration: 'short',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  
  ANCHOR_POINTS: {
    id: 'anchor_points',
    name: 'Anchor Points',
    category: 'spatial',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['grounding', 'awareness'],
    description: 'Place stability markers in space',
    interactionType: 'tap-to-place',
    duration: 'short',
    responseAffinity: ['BELIEVING', 'GROUNDING'],
  },
  
  CONTAINER_BUILDER: {
    id: 'container_builder',
    name: 'Container Builder',
    category: 'spatial',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['grounding', 'integration'],
    description: 'Build emotional capacity container',
    interactionType: 'draw-and-shape',
    duration: 'medium',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  
  THRESHOLD_DIAL: {
    id: 'threshold_dial',
    name: 'Threshold Dial',
    category: 'spatial',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Adjust edge awareness threshold',
    interactionType: 'circular-dial',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'CHOOSING'],
  },
  
  SPIRAL_PATH: {
    id: 'spiral_path',
    name: 'Spiral Path',
    category: 'spatial',
    complexity: 'medium',
    modality: ['visual', 'temporal'],
    outcome: ['awareness', 'integration'],
    description: 'Progress visualization as spiral journey',
    interactionType: 'path-following',
    duration: 'medium',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  
  FULL_CIRCLE: {
    id: 'full_circle',
    name: 'Full Circle',
    category: 'spatial',
    complexity: 'medium',
    modality: ['visual', 'temporal'],
    outcome: ['integration', 'awareness'],
    description: 'Complete the circle to integrate',
    interactionType: 'trace-path',
    duration: 'medium',
    responseAffinity: ['INTEGRATING', 'RELEASING'],
  },
  
  ZONE_MAPPING: {
    id: 'zone_mapping',
    name: 'Zone Mapping',
    category: 'spatial',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Map experiences into spatial zones',
    interactionType: 'drag-to-zone',
    duration: 'medium',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  
  DISTANCE_GAUGE: {
    id: 'distance_gauge',
    name: 'Distance Gauge',
    category: 'spatial',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Measure emotional/relational distance',
    interactionType: 'slider',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'FEELING'],
  },
  
  PROXIMITY_SCATTER: {
    id: 'proximity_scatter',
    name: 'Proximity Scatter',
    category: 'spatial',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Scatter and cluster by relationship proximity',
    interactionType: 'multi-drag',
    duration: 'long',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  
  // Continue with 40 more spatial mechanisms...
  ALTITUDE_SLIDER: {
    id: 'altitude_slider',
    name: 'Altitude Slider',
    category: 'spatial',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Adjust perspective altitude (zoom out/in)',
    interactionType: 'vertical-slider',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  
  BORDER_DRAW: {
    id: 'border_draw',
    name: 'Border Draw',
    category: 'spatial',
    complexity: 'medium',
    modality: ['kinesthetic'],
    outcome: ['decision', 'grounding'],
    description: 'Draw your own boundaries',
    interactionType: 'freehand-draw',
    duration: 'short',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  
  TERRITORY_CLAIM: {
    id: 'territory_claim',
    name: 'Territory Claim',
    category: 'spatial',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['decision', 'grounding'],
    description: 'Claim your energetic territory',
    interactionType: 'tap-to-expand',
    duration: 'short',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  
  LAYERED_DEPTH: {
    id: 'layered_depth',
    name: 'Layered Depth',
    category: 'spatial',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Navigate through layers of depth',
    interactionType: 'layer-navigation',
    duration: 'medium',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  
  HORIZON_LINE: {
    id: 'horizon_line',
    name: 'Horizon Line',
    category: 'spatial',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness', 'grounding'],
    description: 'Set your horizon/baseline',
    interactionType: 'drag-horizontal-line',
    duration: 'instant',
    responseAffinity: ['BELIEVING', 'WITNESSING'],
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // SOMATIC MECHANISMS (40)
  // ─────────────────────────────────────────────────────────────────────────
  
  TENSION_BODY_MAP: {
    id: 'tension_body_map',
    name: 'Tension Body Map',
    category: 'somatic',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'release'],
    description: 'Map tension in body regions',
    interactionType: 'tap-body-regions',
    duration: 'short',
    responseAffinity: ['FEELING', 'RELEASING'],
  },
  
  CAPACITY_GAUGE: {
    id: 'capacity_gauge',
    name: 'Capacity Gauge',
    category: 'somatic',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Measure current bandwidth/capacity',
    interactionType: 'gauge-tap',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'FEELING'],
  },
  
  VOICE_VOLUME: {
    id: 'voice_volume',
    name: 'Voice Volume',
    category: 'somatic',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Adjust inner critic volume',
    interactionType: 'volume-slider',
    duration: 'short',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  
  SENSORY_SNAPSHOT: {
    id: 'sensory_snapshot',
    name: 'Sensory Snapshot',
    category: 'somatic',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['grounding', 'awareness'],
    description: 'Capture current sensory experience',
    interactionType: 'tap-senses',
    duration: 'short',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  BREATH_RHYTHM: {
    id: 'breath_rhythm',
    name: 'Breath Rhythm',
    category: 'somatic',
    complexity: 'simple',
    modality: ['visual', 'temporal'],
    outcome: ['grounding'],
    description: 'Follow visual breath guidance',
    interactionType: 'animated-breathing',
    duration: 'short',
    responseAffinity: ['FEELING', 'GROUNDING'],
  },
  
  HEART_PULSE: {
    id: 'heart_pulse',
    name: 'Heart Pulse',
    category: 'somatic',
    complexity: 'simple',
    modality: ['visual', 'temporal'],
    outcome: ['awareness', 'grounding'],
    description: 'Sync with visual heartbeat',
    interactionType: 'pulse-sync',
    duration: 'short',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  TEMPERATURE_SLIDER: {
    id: 'temperature_slider',
    name: 'Temperature Slider',
    category: 'somatic',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Sense emotional temperature',
    interactionType: 'thermometer-slider',
    duration: 'instant',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  GROUNDING_ROOTS: {
    id: 'grounding_roots',
    name: 'Grounding Roots',
    category: 'somatic',
    complexity: 'medium',
    modality: ['visual', 'temporal'],
    outcome: ['grounding'],
    description: 'Grow roots into earth',
    interactionType: 'hold-to-grow',
    duration: 'medium',
    responseAffinity: ['FEELING', 'BELIEVING'],
  },
  
  SENSATION_SCAN: {
    id: 'sensation_scan',
    name: 'Sensation Scan',
    category: 'somatic',
    complexity: 'medium',
    modality: ['visual', 'temporal'],
    outcome: ['awareness'],
    description: 'Sequential body scan',
    interactionType: 'guided-scan',
    duration: 'long',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  PRESSURE_POINTS: {
    id: 'pressure_points',
    name: 'Pressure Points',
    category: 'somatic',
    complexity: 'simple',
    modality: ['kinesthetic'],
    outcome: ['release', 'awareness'],
    description: 'Tap pressure release points',
    interactionType: 'tap-points',
    duration: 'short',
    responseAffinity: ['FEELING', 'RELEASING'],
  },
  
  // Continue with 30 more somatic mechanisms...
  
  // ─────────────────────────────────────────────────────────────────────────
  // TEMPORAL MECHANISMS (35)
  // ─────────────────────────────────────────────────────────────────────────
  
  MOMENTUM_TRACKER: {
    id: 'momentum_tracker',
    name: 'Momentum Tracker',
    category: 'temporal',
    complexity: 'medium',
    modality: ['visual', 'temporal'],
    outcome: ['awareness', 'activation'],
    description: 'Track progress momentum over time',
    interactionType: 'timeline-graph',
    duration: 'medium',
    responseAffinity: ['BECOMING', 'KNOWING'],
  },
  
  PATTERN_INTERRUPT: {
    id: 'pattern_interrupt',
    name: 'Pattern Interrupt',
    category: 'temporal',
    complexity: 'simple',
    modality: ['kinesthetic', 'temporal'],
    outcome: ['awareness', 'activation'],
    description: 'Break repetitive loop',
    interactionType: 'shake-to-break',
    duration: 'instant',
    responseAffinity: ['CHOOSING', 'RELEASING'],
  },
  
  MICRO_COMMITMENT: {
    id: 'micro_commitment',
    name: 'Micro-Commitment',
    category: 'temporal',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['decision', 'activation'],
    description: 'Make tiny actionable promise',
    interactionType: 'tap-to-commit',
    duration: 'instant',
    responseAffinity: ['CHOOSING', 'BECOMING'],
  },
  
  FUTURE_SELF_POSTCARD: {
    id: 'future_self_postcard',
    name: 'Future Self Postcard',
    category: 'temporal',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['integration', 'awareness'],
    description: 'Message from/to future self',
    interactionType: 'text-input',
    duration: 'long',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  
  CYCLE_WHEEL: {
    id: 'cycle_wheel',
    name: 'Cycle Wheel',
    category: 'temporal',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness'],
    description: 'Visualize cyclical patterns',
    interactionType: 'circular-drag',
    duration: 'medium',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  
  TIMELINE_PINPOINT: {
    id: 'timeline_pinpoint',
    name: 'Timeline Pinpoint',
    category: 'temporal',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness'],
    description: 'Mark moment on timeline',
    interactionType: 'tap-timeline',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  
  RHYTHM_TAP: {
    id: 'rhythm_tap',
    name: 'Rhythm Tap',
    category: 'temporal',
    complexity: 'simple',
    modality: ['kinesthetic', 'auditory'],
    outcome: ['grounding', 'awareness'],
    description: 'Tap your natural rhythm',
    interactionType: 'tap-rhythm',
    duration: 'short',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  DURATION_SLIDER: {
    id: 'duration_slider',
    name: 'Duration Slider',
    category: 'temporal',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Estimate time duration',
    interactionType: 'time-slider',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  
  SEASON_SELECTOR: {
    id: 'season_selector',
    name: 'Season Selector',
    category: 'temporal',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Identify current life season',
    interactionType: 'seasonal-tap',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  
  PACE_ADJUSTER: {
    id: 'pace_adjuster',
    name: 'Pace Adjuster',
    category: 'temporal',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['decision', 'grounding'],
    description: 'Set your sustainable pace',
    interactionType: 'speed-slider',
    duration: 'instant',
    responseAffinity: ['CHOOSING', 'FEELING'],
  },
  
  // Continue with 25 more temporal mechanisms...
  
  // ─────────────────────────────────────────────────────────────────────────
  // EMOTIONAL MECHANISMS (50)
  // ─────────────────────────────────────────────────────────────────────────
  
  MOOD_MOLECULE: {
    id: 'mood_molecule',
    name: 'Mood Molecule',
    category: 'emotional',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Build complex emotional molecule',
    interactionType: 'connect-emotions',
    duration: 'medium',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  
  BELIEF_WEATHER: {
    id: 'belief_weather',
    name: 'Belief Weather',
    category: 'emotional',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Map internal climate/weather',
    interactionType: 'weather-select',
    duration: 'short',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  RESISTANCE_RADAR: {
    id: 'resistance_radar',
    name: 'Resistance Radar',
    category: 'emotional',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness'],
    description: 'Map avoidance patterns',
    interactionType: 'radar-plot',
    duration: 'medium',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  
  FORGIVENESS_FLAME: {
    id: 'forgiveness_flame',
    name: 'Forgiveness Flame',
    category: 'emotional',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['release', 'integration'],
    description: 'Ritual flame release',
    interactionType: 'swipe-to-burn',
    duration: 'medium',
    responseAffinity: ['RELEASING', 'INTEGRATING'],
  },
  
  EMOTION_SPECTRUM: {
    id: 'emotion_spectrum',
    name: 'Emotion Spectrum',
    category: 'emotional',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Locate emotion on spectrum',
    interactionType: 'spectrum-slider',
    duration: 'instant',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  HEART_COMPASS: {
    id: 'heart_compass',
    name: 'Heart Compass',
    category: 'emotional',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Follow heart direction',
    interactionType: 'compass-spin',
    duration: 'short',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  
  GRATITUDE_GARDEN: {
    id: 'gratitude_garden',
    name: 'Gratitude Garden',
    category: 'emotional',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['integration', 'grounding'],
    description: 'Plant gratitude flowers',
    interactionType: 'tap-to-plant',
    duration: 'medium',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  
  EMOTION_LAYERS: {
    id: 'emotion_layers',
    name: 'Emotion Layers',
    category: 'emotional',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Peel back emotional layers',
    interactionType: 'swipe-to-reveal',
    duration: 'medium',
    responseAffinity: ['FEELING', 'KNOWING'],
  },
  
  JOY_SPARK: {
    id: 'joy_spark',
    name: 'Joy Spark',
    category: 'emotional',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['activation'],
    description: 'Ignite joy moment',
    interactionType: 'tap-to-spark',
    duration: 'instant',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  
  GRIEF_WAVE: {
    id: 'grief_wave',
    name: 'Grief Wave',
    category: 'emotional',
    complexity: 'medium',
    modality: ['visual', 'temporal'],
    outcome: ['release', 'awareness'],
    description: 'Ride wave of grief',
    interactionType: 'wave-animation',
    duration: 'medium',
    responseAffinity: ['FEELING', 'RELEASING'],
  },
  
  // Continue with 40 more emotional mechanisms...
  
  // ─────────────────────────────────────────────────────────────────────────
  // RELATIONAL MECHANISMS (35)
  // ─────────────────────────────────────────────────────────────────────────
  
  ENERGY_EXCHANGE: {
    id: 'energy_exchange',
    name: 'Energy Exchange',
    category: 'relational',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Balance give/receive',
    interactionType: 'balance-slider',
    duration: 'short',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  
  CONNECTION_WEB: {
    id: 'connection_web',
    name: 'Connection Web',
    category: 'relational',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Map relationship network',
    interactionType: 'node-linking',
    duration: 'long',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  
  MIRROR_CONVERSATION: {
    id: 'mirror_conversation',
    name: 'Mirror Conversation',
    category: 'relational',
    complexity: 'complex',
    modality: ['visual'],
    outcome: ['awareness', 'integration'],
    description: 'Dialogue with self/other',
    interactionType: 'text-dialogue',
    duration: 'long',
    responseAffinity: ['WITNESSING', 'INTEGRATING'],
  },
  
  ATTACHMENT_STYLE: {
    id: 'attachment_style',
    name: 'Attachment Style',
    category: 'relational',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Map attachment pattern',
    interactionType: 'style-select',
    duration: 'short',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  
  NEEDS_INVENTORY: {
    id: 'needs_inventory',
    name: 'Needs Inventory',
    category: 'relational',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Identify current needs',
    interactionType: 'multi-select',
    duration: 'short',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  
  BOUNDARY_RING: {
    id: 'boundary_ring',
    name: 'Boundary Ring',
    category: 'relational',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['decision', 'grounding'],
    description: 'Set relationship boundary',
    interactionType: 'circular-boundary',
    duration: 'short',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  
  EMPATHY_BRIDGE: {
    id: 'empathy_bridge',
    name: 'Empathy Bridge',
    category: 'relational',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['awareness', 'integration'],
    description: 'Build understanding bridge',
    interactionType: 'bridge-build',
    duration: 'medium',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  
  PROJECTION_SCREEN: {
    id: 'projection_screen',
    name: 'Projection Screen',
    category: 'relational',
    complexity: 'complex',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Recognize projections',
    interactionType: 'reflection-select',
    duration: 'medium',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  
  CODEPENDENCE_SCALE: {
    id: 'codependence_scale',
    name: 'Codependence Scale',
    category: 'relational',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Measure enmeshment level',
    interactionType: 'scale-slider',
    duration: 'instant',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  
  REPAIR_RITUAL: {
    id: 'repair_ritual',
    name: 'Repair Ritual',
    category: 'relational',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['integration', 'release'],
    description: 'Relational repair process',
    interactionType: 'ritual-steps',
    duration: 'long',
    responseAffinity: ['INTEGRATING', 'RELEASING'],
  },
  
  // Continue with 25 more relational mechanisms...
  
  // ─────────────────────────────────────────────────────────────────────────
  // COGNITIVE MECHANISMS (40)
  // ─────────────────────────────────────────────────────────────────────────
  
  WISDOM_WELL: {
    id: 'wisdom_well',
    name: 'Wisdom Well',
    category: 'cognitive',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Draw from inner knowing',
    interactionType: 'tap-to-reveal',
    duration: 'short',
    responseAffinity: ['KNOWING', 'BELIEVING'],
  },
  
  NARRATIVE_THREAD: {
    id: 'narrative_thread',
    name: 'Narrative Thread',
    category: 'cognitive',
    complexity: 'complex',
    modality: ['visual'],
    outcome: ['integration', 'awareness'],
    description: 'Connect story threads',
    interactionType: 'thread-weaving',
    duration: 'long',
    responseAffinity: ['INTEGRATING', 'KNOWING'],
  },
  
  BELIEF_BUBBLE: {
    id: 'belief_bubble',
    name: 'Belief Bubble',
    category: 'cognitive',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'release'],
    description: 'Pop limiting belief',
    interactionType: 'tap-to-pop',
    duration: 'instant',
    responseAffinity: ['KNOWING', 'RELEASING'],
  },
  
  VALUE_STACK: {
    id: 'value_stack',
    name: 'Value Stack',
    category: 'cognitive',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['decision', 'awareness'],
    description: 'Order values by priority',
    interactionType: 'drag-to-order',
    duration: 'medium',
    responseAffinity: ['CHOOSING', 'KNOWING'],
  },
  
  ASSUMPTION_FILTER: {
    id: 'assumption_filter',
    name: 'Assumption Filter',
    category: 'cognitive',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Identify hidden assumptions',
    interactionType: 'reveal-filter',
    duration: 'short',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  
  PERSPECTIVE_SHIFT: {
    id: 'perspective_shift',
    name: 'Perspective Shift',
    category: 'cognitive',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Shift viewpoint',
    interactionType: 'rotate-view',
    duration: 'short',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  
  REFRAME_LENS: {
    id: 'reframe_lens',
    name: 'Reframe Lens',
    category: 'cognitive',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['awareness', 'integration'],
    description: 'Apply reframing lens',
    interactionType: 'lens-select',
    duration: 'short',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  
  THOUGHT_SORTING: {
    id: 'thought_sorting',
    name: 'Thought Sorting',
    category: 'cognitive',
    complexity: 'medium',
    modality: ['kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Sort thoughts into categories',
    interactionType: 'swipe-to-sort',
    duration: 'medium',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  
  MEANING_MAKER: {
    id: 'meaning_maker',
    name: 'Meaning Maker',
    category: 'cognitive',
    complexity: 'complex',
    modality: ['visual'],
    outcome: ['integration'],
    description: 'Construct personal meaning',
    interactionType: 'text-synthesis',
    duration: 'long',
    responseAffinity: ['INTEGRATING', 'KNOWING'],
  },
  
  COGNITIVE_TRIANGLE: {
    id: 'cognitive_triangle',
    name: 'Cognitive Triangle',
    category: 'cognitive',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'integration'],
    description: 'Map thought-feeling-behavior',
    interactionType: 'triangle-plot',
    duration: 'medium',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  
  // Continue with 30 more cognitive mechanisms...
  
  // ─────────────────────────────────────────────────────────────────────────
  // ENERGETIC MECHANISMS (30)
  // ─────────────────────────────────────────────────────────────────────────
  
  ENERGY_PIES: {
    id: 'energy_pies',
    name: 'Energy Pies',
    category: 'energetic',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness', 'decision'],
    description: 'Allocate energy visually',
    interactionType: 'pie-chart-adjust',
    duration: 'short',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  
  VITALITY_GAUGE: {
    id: 'vitality_gauge',
    name: 'Vitality Gauge',
    category: 'energetic',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Measure life force level',
    interactionType: 'gauge-tap',
    duration: 'instant',
    responseAffinity: ['WITNESSING', 'FEELING'],
  },
  
  CHARGE_BATTERY: {
    id: 'charge_battery',
    name: 'Charge Battery',
    category: 'energetic',
    complexity: 'simple',
    modality: ['visual', 'temporal'],
    outcome: ['grounding', 'activation'],
    description: 'Recharge energy battery',
    interactionType: 'hold-to-charge',
    duration: 'short',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  
  CHAKRA_SCAN: {
    id: 'chakra_scan',
    name: 'Chakra Scan',
    category: 'energetic',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['awareness'],
    description: 'Scan energy centers',
    interactionType: 'body-tap-sequence',
    duration: 'medium',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  
  DRAIN_DETECTOR: {
    id: 'drain_detector',
    name: 'Drain Detector',
    category: 'energetic',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['awareness'],
    description: 'Identify energy drains',
    interactionType: 'multi-select',
    duration: 'short',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  
  RESTORATION_RITUAL: {
    id: 'restoration_ritual',
    name: 'Restoration Ritual',
    category: 'energetic',
    complexity: 'complex',
    modality: ['visual', 'temporal'],
    outcome: ['grounding', 'integration'],
    description: 'Multi-step energy restoration',
    interactionType: 'ritual-sequence',
    duration: 'long',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  
  FLOW_STATE_DIAL: {
    id: 'flow_state_dial',
    name: 'Flow State Dial',
    category: 'energetic',
    complexity: 'simple',
    modality: ['visual'],
    outcome: ['awareness', 'activation'],
    description: 'Tune into flow state',
    interactionType: 'dial-adjust',
    duration: 'instant',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  
  AURA_EXPANSION: {
    id: 'aura_expansion',
    name: 'Aura Expansion',
    category: 'energetic',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['grounding', 'activation'],
    description: 'Expand energetic field',
    interactionType: 'pinch-to-expand',
    duration: 'short',
    responseAffinity: ['FEELING', 'BELIEVING'],
  },
  
  VIBRATION_TUNER: {
    id: 'vibration_tuner',
    name: 'Vibration Tuner',
    category: 'energetic',
    complexity: 'simple',
    modality: ['visual', 'auditory'],
    outcome: ['grounding'],
    description: 'Tune energetic frequency',
    interactionType: 'frequency-slider',
    duration: 'short',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  
  PROTECTION_SHIELD: {
    id: 'protection_shield',
    name: 'Protection Shield',
    category: 'energetic',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['grounding', 'decision'],
    description: 'Activate protective boundary',
    interactionType: 'tap-to-shield',
    duration: 'instant',
    responseAffinity: ['BELIEVING', 'CHOOSING'],
  },
  
  // Continue with 20 more energetic mechanisms...
  
  // ─────────────────────────────────────────────────────────────────────────
  // RITUAL MECHANISMS (20)
  // ─────────────────────────────────────────────────────────────────────────
  
  PERMISSION_STAMPS: {
    id: 'permission_stamps',
    name: 'Permission Stamps',
    category: 'ritual',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['activation', 'decision'],
    description: 'Self-authorization stamps',
    interactionType: 'tap-to-stamp',
    duration: 'instant',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  
  CELEBRATION_CONFETTI: {
    id: 'celebration_confetti',
    name: 'Celebration Confetti',
    category: 'ritual',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['integration'],
    description: 'Honor wins ritual',
    interactionType: 'shake-for-confetti',
    duration: 'instant',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  
  COMMITMENT_WEIGHT: {
    id: 'commitment_weight',
    name: 'Commitment Weight',
    category: 'ritual',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['decision', 'awareness'],
    description: 'Feel responsibility weight',
    interactionType: 'hold-to-feel',
    duration: 'short',
    responseAffinity: ['CHOOSING', 'FEELING'],
  },
  
  RESOURCE_INVENTORY: {
    id: 'resource_inventory',
    name: 'Resource Inventory',
    category: 'ritual',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['awareness', 'activation'],
    description: 'Activate available tools',
    interactionType: 'multi-select',
    duration: 'short',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  
  THRESHOLD_CROSSING: {
    id: 'threshold_crossing',
    name: 'Threshold Crossing',
    category: 'ritual',
    complexity: 'medium',
    modality: ['visual', 'kinesthetic'],
    outcome: ['activation', 'integration'],
    description: 'Cross symbolic threshold',
    interactionType: 'swipe-to-cross',
    duration: 'medium',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  
  VOW_RECITATION: {
    id: 'vow_recitation',
    name: 'Vow Recitation',
    category: 'ritual',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['decision', 'grounding'],
    description: 'Speak personal vow',
    interactionType: 'text-recite',
    duration: 'medium',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  
  ALTAR_BUILD: {
    id: 'altar_build',
    name: 'Altar Build',
    category: 'ritual',
    complexity: 'complex',
    modality: ['visual', 'kinesthetic'],
    outcome: ['integration', 'grounding'],
    description: 'Create symbolic altar',
    interactionType: 'drag-objects',
    duration: 'long',
    responseAffinity: ['INTEGRATING', 'BELIEVING'],
  },
  
  BLESSING_CAST: {
    id: 'blessing_cast',
    name: 'Blessing Cast',
    category: 'ritual',
    complexity: 'simple',
    modality: ['visual', 'kinesthetic'],
    outcome: ['activation', 'integration'],
    description: 'Cast blessing gesture',
    interactionType: 'gesture-draw',
    duration: 'instant',
    responseAffinity: ['BELIEVING', 'INTEGRATING'],
  },
  
  PHOENIX_RISE: {
    id: 'phoenix_rise',
    name: 'Phoenix Rise',
    category: 'ritual',
    complexity: 'complex',
    modality: ['visual', 'temporal'],
    outcome: ['integration', 'activation'],
    description: 'Transformation rebirth ritual',
    interactionType: 'animation-sequence',
    duration: 'long',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  
  WITNESS_CIRCLE: {
    id: 'witness_circle',
    name: 'Witness Circle',
    category: 'ritual',
    complexity: 'medium',
    modality: ['visual'],
    outcome: ['integration', 'grounding'],
    description: 'Be witnessed in circle',
    interactionType: 'circle-animation',
    duration: 'medium',
    responseAffinity: ['WITNESSING', 'INTEGRATING'],
  },
  
  // Continue with 10 more ritual mechanisms...
};

// Note: This represents ~90 mechanisms fully defined
// We'll expand to 300 total across all categories

// ═════════════════════════════════════════════════════════════════════════════
// MASTER MAPPING SYSTEM
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Complete NaviCue Type → Experience Mapping
 * This is the "genome" that connects everything
 */
export interface ExperienceMapping {
  // Input: NaviCue attributes
  form: string;
  family: string;
  kbe_layer: string;
  intent: string;
  mechanism: string;
  
  // Output: Experience configuration
  assetCategory: keyof typeof ASSET_CATEGORIES;
  elevationLevel: keyof typeof ELEVATION_LEVELS;
  responsePattern: keyof typeof RESPONSE_PATTERNS;
  mechanismId: string;
  
  // Computed properties
  voiceTone: string;
  visualTreatment: string;
  interactionTiming: string;
  magicGradient: string;
  particleBehavior: string;
}

/**
 * Mapping Engine
 * Takes NaviCue attributes and returns complete experience configuration
 */
export function mapNaviCueToExperience(navicue: {
  form: string;
  family: string;
  kbe_layer: string;
  intent: string;
  mechanism?: string;
}): ExperienceMapping {
  // 1. Determine Asset Category
  const formIntentKey = `${navicue.form} + ${navicue.intent}`;
  const assetCategory = 
    (ASSET_MAPPING_RULES.byFormIntent[formIntentKey as keyof typeof ASSET_MAPPING_RULES.byFormIntent] as keyof typeof ASSET_CATEGORIES) ||
    (ASSET_MAPPING_RULES.byKBELayer[navicue.kbe_layer as keyof typeof ASSET_MAPPING_RULES.byKBELayer] as keyof typeof ASSET_CATEGORIES) ||
    (ASSET_MAPPING_RULES.byFamily[navicue.family as keyof typeof ASSET_MAPPING_RULES.byFamily] as keyof typeof ASSET_CATEGORIES) ||
    'NEURAL_ABSTRACT';
  
  // 2. Determine Elevation Level
  const elevationLevel = 
    (ELEVATION_MAPPING.byKBEDepth[navicue.kbe_layer as keyof typeof ELEVATION_MAPPING.byKBEDepth] as keyof typeof ELEVATION_LEVELS) ||
    'PRESENCE';
  
  // 3. Determine Response Pattern
  const responsePattern = 
    (RESPONSE_MAPPING.byIntent[navicue.intent as keyof typeof RESPONSE_MAPPING.byIntent] as keyof typeof RESPONSE_PATTERNS) ||
    'KNOWING';
  
  // 4. Get mechanism (use provided or default)
  const mechanismId = navicue.mechanism || 'GRAVITY_MAP';
  
  // 5. Get response pattern details
  const response = RESPONSE_PATTERNS[responsePattern];
  
  // 6. Get elevation details
  const elevation = ELEVATION_LEVELS[elevationLevel];
  
  return {
    form: navicue.form,
    family: navicue.family,
    kbe_layer: navicue.kbe_layer,
    intent: navicue.intent,
    mechanism: mechanismId,
    assetCategory,
    elevationLevel,
    responsePattern,
    mechanismId,
    voiceTone: response.voiceTone,
    visualTreatment: response.visualTreatment,
    interactionTiming: response.interactionTiming,
    magicGradient: 'RADIAL_GLOW', // Could be computed from family
    particleBehavior: 'FLOAT', // Could be computed from elevation
  };
}

/**
 * Utility: Get all mechanisms by category
 */
export function getMechanismsByCategory(category: MechanismCategory): Mechanism[] {
  return Object.values(MECHANISMS).filter(m => m.category === category);
}

/**
 * Utility: Get mechanisms by complexity
 */
export function getMechanismsByComplexity(complexity: MechanismComplexity): Mechanism[] {
  return Object.values(MECHANISMS).filter(m => m.complexity === complexity);
}

/**
 * Utility: Get mechanisms by outcome
 */
export function getMechanismsByOutcome(outcome: MechanismOutcome): Mechanism[] {
  return Object.values(MECHANISMS).filter(m => m.outcome.includes(outcome));
}

/**
 * Utility: Get recommended mechanisms for response pattern
 */
export function getRecommendedMechanisms(responsePattern: keyof typeof RESPONSE_PATTERNS): Mechanism[] {
  const responseId = RESPONSE_PATTERNS[responsePattern].id;
  return Object.values(MECHANISMS).filter(m => 
    m.responseAffinity.includes(responseId.toUpperCase())
  );
}
