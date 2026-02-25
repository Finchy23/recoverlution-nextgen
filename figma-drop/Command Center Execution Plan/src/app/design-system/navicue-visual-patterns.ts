/**
 * NaviCue Visual Pattern Vocabulary
 * 
 * Maps Form archetypes to distinct visual languages
 * Ensures organic variety across 1,435 NaviCues
 * 
 * Philosophy: Same same but different
 * - Each form has a signature visual approach
 * - Each mechanism adds its own accent
 * - Each interaction pattern defines the gesture
 * - Magic signature controls timing/atmosphere
 */

export type FormArchetype = 
  | 'signal'      // Inventory Spark, Reveal
  | 'directional' // Key, Route  
  | 'reflective'  // Mirror, Parts Rollcall, Reframe Seed
  | 'action'      // Practice
  | 'depth';      // Probe

export type MechanismVisual =
  | 'behavioral_activation'  // Arrow/momentum aesthetics
  | 'exposure'               // Threshold/edge aesthetics  
  | 'metacognition'          // Observer/thought aesthetics
  | 'self_compassion'        // Heart/warmth aesthetics
  | 'values_clarification';  // Compass/anchor aesthetics

export type InteractionGesture =
  | 'tap_reveal'         // Single tap unveils
  | 'hold_to_continue'   // Press and hold
  | 'hold_to_reveal'     // Hold to slowly reveal
  | 'branch_fork'        // Choose between paths
  | 'paradox_flip'       // Flip or invert
  | 'swatch_constellation'; // Multiple touch points

/**
 * Visual Pattern Vocabulary
 */
export const visualPatterns = {
  
  // FORM ARCHETYPES - Base visual structure
  forms: {
    signal: {
      description: 'Centered reveal, radiating presence',
      coreShape: 'single orb with radiating signals',
      layout: 'centered with expansion',
      atmosphere: 'anticipation and arrival',
    },
    directional: {
      description: 'Asymmetric guide, flowing path',
      coreShape: 'arrow or flowing line',
      layout: 'diagonal or flowing composition',
      atmosphere: 'guidance and momentum',
    },
    reflective: {
      description: 'Symmetrical mirror, contemplative space',
      coreShape: 'mirrored elements or water-like surface',
      layout: 'symmetrical with breathing room',
      atmosphere: 'witnessing and recognition',
    },
    action: {
      description: 'Dynamic gesture, kinetic energy',
      coreShape: 'motion lines or active shapes',
      layout: 'diagonal thrust with impact point',
      atmosphere: 'activation and embodiment',
    },
    depth: {
      description: 'Layered inquiry, excavation',
      coreShape: 'concentric circles or depth layers',
      layout: 'centered with depth perspective',
      atmosphere: 'curiosity and discovery',
    },
  },

  // MECHANISM VISUALS - Accent aesthetics
  mechanisms: {
    behavioral_activation: {
      symbol: 'arrow or forward thrust',
      accentStyle: 'momentum lines, directional energy',
      colorTreatment: 'warm, energizing',
    },
    exposure: {
      symbol: 'threshold or doorway',
      accentStyle: 'edge reveal, gradual unveiling',
      colorTreatment: 'gentle contrast, safe boundary',
    },
    metacognition: {
      symbol: 'eye or observer bubble',
      accentStyle: 'thought clouds, witnessing distance',
      colorTreatment: 'cool clarity, spacious',
    },
    self_compassion: {
      symbol: 'heart or embracing arms',
      accentStyle: 'soft glow, warm embrace',
      colorTreatment: 'warm nurturing tones',
    },
    values_clarification: {
      symbol: 'compass or north star',
      accentStyle: 'directional marker, anchoring point',
      colorTreatment: 'grounded, purposeful',
    },
  },

  // INTERACTION GESTURES - How user engages
  interactions: {
    tap_reveal: {
      gesture: 'Single tap',
      feedback: 'Instant reveal with brief delay',
      visual: 'Opacity fade in, scale slightly',
    },
    hold_to_continue: {
      gesture: 'Press and hold',
      feedback: 'Progress ring fills during hold',
      visual: 'Circular progress indicator',
    },
    hold_to_reveal: {
      gesture: 'Sustained press',
      feedback: 'Gradual reveal tied to hold duration',
      visual: 'Mask dissolves progressively',
    },
    branch_fork: {
      gesture: 'Choose between paths',
      feedback: 'Paths illuminate on hover',
      visual: 'Branching lines, one highlights',
    },
    paradox_flip: {
      gesture: 'Tap to flip or invert',
      feedback: '3D flip or perspective shift',
      visual: 'Card flip or kaleidoscope turn',
    },
    swatch_constellation: {
      gesture: 'Multiple touchpoints',
      feedback: 'Each point glows when touched',
      visual: 'Constellation of orbs',
    },
  },
};

/**
 * Get visual recipe for a NaviCue combination
 */
export function getVisualRecipe(
  form: FormArchetype,
  mechanism: MechanismVisual,
  interaction: InteractionGesture
) {
  return {
    form: visualPatterns.forms[form],
    mechanism: visualPatterns.mechanisms[mechanism],
    interaction: visualPatterns.interactions[interaction],
  };
}

/**
 * Visual Pattern Helpers
 */
export const patternHelpers = {
  
  // Generate unique orb variations
  getOrbVariation: (index: number, total: number = 5) => {
    const variations = [
      'pulsing', 'breathing', 'spiraling', 'constellation', 'rippling'
    ];
    return variations[index % variations.length];
  },

  // Get stage-appropriate motion
  getStageMotion: (stage: 'dormant' | 'active' | 'complete', magicSignature: string) => {
    const baseMotions = {
      dormant: { scale: 1, opacity: 0.6, y: 0 },
      active: { scale: 1.1, opacity: 1, y: -5 },
      complete: { scale: 1, opacity: 0.8, y: 0 },
    };
    return baseMotions[stage];
  },

  // Color by mechanism
  getMechanismAccent: (mechanism: MechanismVisual, baseColor: string) => {
    const tints = {
      behavioral_activation: 'hsla(25, 80%, 60%, 1)', // Energetic orange
      exposure: 'hsla(195, 60%, 60%, 1)', // Safe blue
      metacognition: 'hsla(210, 50%, 65%, 1)', // Clear sky
      self_compassion: 'hsla(345, 60%, 65%, 1)', // Warm rose
      values_clarification: 'hsla(150, 50%, 55%, 1)', // Grounded teal
    };
    return tints[mechanism] || baseColor;
  },
};
