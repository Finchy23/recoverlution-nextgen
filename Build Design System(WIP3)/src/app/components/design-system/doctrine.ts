/**
 * DOCTRINE DNA
 *
 * The genetic code of the Sentient Canvas.
 *
 * Every variable in this system is named by its CLINICAL PURPOSE,
 * not by its rendering technique. "somatic-breath" not "breathe".
 * "floating-particle-displacement" not "particles".
 *
 * Architecture:
 *   - Temperature GOVERNS Motion (not peers)
 *   - Each variable carries its own transition identity
 *   - Each variable has an attenuation cost
 *   - Each variable declares its forbidden combinations
 *   - Renderers are swappable implementations of doctrine variables
 *
 * Naming convention:
 *   rv-{layer}-{family}
 *   e.g. rv-motion-somatic-breath, rv-inter-floating-particle-displacement
 */

// ═══════════════════════════════════════════════════
// GOVERNOR LAYERS
// ═══════════════════════════════════════════════════

export type GovernorLayer = 'atmosphere' | 'motion' | 'interaction' | 'temperature' | 'color';

export const governorLayers: {
  id: GovernorLayer;
  label: string;
  role: string;
  question: string;
}[] = [
  {
    id: 'temperature',
    label: 'Temperature',
    role: 'The Governor. Not a style — a permission system.',
    question: 'How much can the room ask of the user right now?',
  },
  {
    id: 'atmosphere',
    label: 'Atmosphere',
    role: 'Spatial and emotional safety of the room.',
    question: 'How safe does the room feel?',
  },
  {
    id: 'motion',
    label: 'Motion',
    role: 'Biological rhythm and material behavior. Governed by Temperature.',
    question: 'How does the environment breathe?',
  },
  {
    id: 'interaction',
    label: 'Interaction',
    role: 'Sentient response of the environment.',
    question: 'How does the glass know I am here?',
  },
  {
    id: 'color',
    label: 'Color',
    role: 'Psychological frequency. Not branding.',
    question: 'What biological signal is this room projecting?',
  },
];

// ═══════════════════════════════════════════════════
// EASING LIBRARY — named by feel, not math
// ═══════════════════════════════════════════════════

export type EasingName =
  | 'organic-arrive'    // Quick attack, long settle
  | 'graceful-depart'   // Slow release, quick vanish
  | 'measured-confidence' // Neither rushed nor hesitant
  | 'physical-weight'   // Overshoot then settle
  | 'geological-patience' // Slow start, slow end, very slow
  | 'cold-snap';        // Immediate, no ceremony

export const easingFunctions: Record<EasingName, {
  fn: (t: number) => number;
  css: string;
  feel: string;
}> = {
  'organic-arrive': {
    fn: (t) => 1 - Math.pow(1 - t, 3),
    css: 'cubic-bezier(0.16, 1, 0.3, 1)',
    feel: 'Quick attack, long settle — organic materialisation',
  },
  'graceful-depart': {
    fn: (t) => t * t * t,
    css: 'cubic-bezier(0.55, 0, 1, 0.45)',
    feel: 'Slow release, quick vanish — graceful departure',
  },
  'measured-confidence': {
    fn: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    css: 'cubic-bezier(0.65, 0, 0.35, 1)',
    feel: 'Measured confidence — neither rushed nor hesitant',
  },
  'physical-weight': {
    fn: (t) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    css: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    feel: 'Overshoot then settle — proof of physical weight',
  },
  'geological-patience': {
    fn: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    css: 'cubic-bezier(0.37, 0, 0.63, 1)',
    feel: 'Slow start, slow end — geological patience',
  },
  'cold-snap': {
    fn: (t) => t < 0.5 ? 0 : 1,
    css: 'steps(1)',
    feel: 'Immediate. No ceremony. Amygdala override.',
  },
};

// ═══════════════════════════════════════════════════
// TRANSITION IDENTITY
// ═══════════════════════════════════════════════════

export interface TransitionIdentity {
  enterMs: number;
  exitMs: number;
  enterCurve: EasingName;
  exitCurve: EasingName;
  description: string;
}

// ═══════════════════════════════════════════════════
// TEMPERATURE — THE GOVERNOR
//
// Temperature is not a peer of Motion or Color.
// It is the hierarchical governor that RESTRICTS
// what other variables are permitted.
//
// Band 4: Zero scrolling. Zero reading. Zero choices.
// Band 0: Full creative freedom.
// ═══════════════════════════════════════════════════

export type HeatBandId = 0 | 1 | 2 | 3 | 4;

export interface HeatBand {
  id: HeatBandId;
  label: string;
  clinicalName: string;
  description: string;
  color: string;

  // Governance constraints
  maxMotionSpeed: number;        // 0-1, how fast motion may be
  maxInteractionComplexity: number; // 0-1
  maxCopyDensity: 'whisper' | 'light' | 'moderate';
  maxScrolling: boolean;
  maxChoices: number;            // how many options the UI may present

  // What this band ALLOWS
  allowedMotions: string[];
  allowedInteractions: string[];
  allowedAtmospheres: string[];
  allowedColors: string[];

  // Commands (non-negotiable)
  commands: string[];
}

export const heatBands: HeatBand[] = [
  {
    id: 0,
    label: 'Safe & Social',
    clinicalName: 'Ventral Vagal',
    description: 'The prefrontal cortex is online. Social engagement system active. Full creative latitude.',
    color: 'hsl(160, 60%, 50%)',
    maxMotionSpeed: 1.0,
    maxInteractionComplexity: 1.0,
    maxCopyDensity: 'moderate',
    maxScrolling: true,
    maxChoices: 8,
    allowedMotions: ['somatic-breath', 'viscous-unspooling', 'pendulum-settle', 'defocus-dissolve', 'cymatic-ripple', 'tectonic-drift'],
    allowedInteractions: ['gyroscopic-parallax', 'haptic-entrainment', 'floating-particle-displacement', 'surface-refraction', 'acoustic-flutter', 'viscous-drag'],
    allowedAtmospheres: ['sanctuary', 'cryo-chamber', 'abyssal-void', 'bioluminescent-mesh', 'chiaroscuro-spotlight', 'twilight-shroud'],
    allowedColors: ['neural-reset', 'amber-resonance', 'quiet-authority', 'sacred-ordinary', 'verdant-calm', 'void-presence', 'twilight-shift'],
    commands: ['Full creative freedom.'],
  },
  {
    id: 1,
    label: 'Alert & Regulated',
    clinicalName: 'Sympathetic Mild',
    description: 'Heightened awareness but still regulated. Some cognitive narrowing. Reduce complexity.',
    color: 'hsl(140, 50%, 45%)',
    maxMotionSpeed: 0.7,
    maxInteractionComplexity: 0.7,
    maxCopyDensity: 'light',
    maxScrolling: true,
    maxChoices: 4,
    allowedMotions: ['somatic-breath', 'viscous-unspooling', 'pendulum-settle', 'defocus-dissolve', 'tectonic-drift'],
    allowedInteractions: ['floating-particle-displacement', 'surface-refraction', 'viscous-drag'],
    allowedAtmospheres: ['sanctuary', 'bioluminescent-mesh', 'twilight-shroud'],
    allowedColors: ['neural-reset', 'amber-resonance', 'sacred-ordinary', 'verdant-calm'],
    commands: ['Reduce visual complexity.', 'Slow motion to 70%.', 'Maximum 4 choices.'],
  },
  {
    id: 2,
    label: 'Early Dysregulation',
    clinicalName: 'Sympathetic Active',
    description: 'The window of tolerance is narrowing. Prefrontal starting to go offline. Simplify aggressively.',
    color: 'hsl(45, 90%, 55%)',
    maxMotionSpeed: 0.4,
    maxInteractionComplexity: 0.3,
    maxCopyDensity: 'whisper',
    maxScrolling: true,
    maxChoices: 2,
    allowedMotions: ['somatic-breath', 'tectonic-drift', 'defocus-dissolve'],
    allowedInteractions: ['floating-particle-displacement', 'viscous-drag'],
    allowedAtmospheres: ['sanctuary', 'twilight-shroud'],
    allowedColors: ['neural-reset', 'verdant-calm', 'sacred-ordinary'],
    commands: ['Maximum 2 choices.', 'Copy whisper only.', 'Motion at 40% maximum.', 'No sharp transitions.'],
  },
  {
    id: 3,
    label: 'Sympathetic Activation',
    clinicalName: 'Fight/Flight',
    description: 'The amygdala is taking over. The room must become simple, direct, and grounding.',
    color: 'hsl(25, 90%, 55%)',
    maxMotionSpeed: 0.15,
    maxInteractionComplexity: 0.1,
    maxCopyDensity: 'whisper',
    maxScrolling: false,
    maxChoices: 1,
    allowedMotions: ['somatic-breath', 'tectonic-drift'],
    allowedInteractions: ['viscous-drag'],
    allowedAtmospheres: ['sanctuary'],
    allowedColors: ['neural-reset', 'verdant-calm'],
    commands: ['One choice only.', 'No scrolling.', 'Near-stillness.', 'Somatic breath only.', 'Single grounding interaction.'],
  },
  {
    id: 4,
    label: 'Survival Mode',
    clinicalName: 'Amygdala Hijack',
    description: 'The prefrontal cortex is offline. Zero ceremony. One visceral physical interaction.',
    color: 'hsl(30, 90%, 50%)',
    maxMotionSpeed: 0,
    maxInteractionComplexity: 0,
    maxCopyDensity: 'whisper',
    maxScrolling: false,
    maxChoices: 1,
    allowedMotions: [],
    allowedInteractions: [],
    allowedAtmospheres: ['sanctuary'],
    allowedColors: ['neural-reset'],
    commands: [
      'Zero scrolling.',
      'Zero reading.',
      'Zero choices.',
      'Immediate snap entrance (0ms).',
      'Single visceral physical interaction.',
      'The glass allows nothing but the intervention.',
    ],
  },
];

// ═══════════════════════════════════════════════════
// DOCTRINE VARIABLE — the DNA unit
// ═══════════════════════════════════════════════════

export interface DoctrineVariable {
  id: string;
  layer: GovernorLayer;
  label: string;
  description: string;
  metaphor: string;

  // Transition identity — how this variable enters and leaves
  transition: TransitionIdentity;

  // Energy budget
  attenuationCost: number; // 0-1, how much attention this consumes

  // Temperature governance
  allowedBands: HeatBandId[];

  // Compatibility
  forbiddenWith: string[]; // IDs of variables this conflicts with
  harmonicWith: string[];  // IDs of variables this pairs well with

  // Renderer binding (swappable)
  renderer: string;
}

// ═══════════════════════════════════════════════════
// ATMOSPHERE VARIABLES
// ═══════════════════════════════════════════════════

export const atmosphereVariables: DoctrineVariable[] = [
  {
    id: 'sanctuary',
    layer: 'atmosphere',
    label: 'Sanctuary',
    description: 'Thick, volumetric shadows illuminated by a slowly pulsing warm golden light. A protective womb for vulnerable moments.',
    metaphor: 'The amber hearth. Safe darkness with warmth at the edges.',
    transition: {
      enterMs: 1400,
      exitMs: 900,
      enterCurve: 'geological-patience',
      exitCurve: 'graceful-depart',
      description: 'Emerges slowly like eyes adjusting to candlelight. Leaves like a sunset.',
    },
    attenuationCost: 0.15,
    allowedBands: [0, 1, 2, 3, 4],
    forbiddenWith: [],
    harmonicWith: ['somatic-breath', 'floating-particle-displacement', 'amber-resonance', 'verdant-calm'],
    renderer: 'atmosphere-sanctuary',
  },
  {
    id: 'cryo-chamber',
    layer: 'atmosphere',
    label: 'Cryo-Chamber',
    description: 'Clinical precision. Cold blue-white sterility. A stripped-back void that says: here, we work.',
    metaphor: 'The surgical suite. No warmth, only clarity.',
    transition: {
      enterMs: 600,
      exitMs: 800,
      enterCurve: 'measured-confidence',
      exitCurve: 'organic-arrive',
      description: 'Arrives with measured confidence. Departs slowly, letting warmth return.',
    },
    attenuationCost: 0.08,
    allowedBands: [0, 1],
    forbiddenWith: ['amber-resonance', 'sacred-ordinary'],
    harmonicWith: ['pendulum-settle', 'surface-refraction', 'neural-reset', 'quiet-authority'],
    renderer: 'atmosphere-cryo',
  },
  {
    id: 'abyssal-void',
    layer: 'atmosphere',
    label: 'Abyssal Void',
    description: 'Near-black with impossible depth. Faint bioluminescent traces at extreme distance. The user floats in formless space.',
    metaphor: 'The deep ocean. Pressure without walls.',
    transition: {
      enterMs: 1800,
      exitMs: 1200,
      enterCurve: 'geological-patience',
      exitCurve: 'geological-patience',
      description: 'Descends with geological patience. Surfaces equally slowly.',
    },
    attenuationCost: 0.05,
    allowedBands: [0, 1],
    forbiddenWith: ['amber-resonance'],
    harmonicWith: ['tectonic-drift', 'defocus-dissolve', 'void-presence'],
    renderer: 'atmosphere-abyss',
  },
  {
    id: 'bioluminescent-mesh',
    layer: 'atmosphere',
    label: 'Bioluminescent Mesh',
    description: 'A living neural network of soft light. Nodes pulse asynchronously. Connections form and dissolve.',
    metaphor: 'The synapse garden. Intelligence made visible.',
    transition: {
      enterMs: 1200,
      exitMs: 1000,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'Nodes appear one by one. Connections dissolve before nodes fade.',
    },
    attenuationCost: 0.25,
    allowedBands: [0, 1],
    forbiddenWith: ['somatic-breath'], // too much rhythmic competition
    harmonicWith: ['cymatic-ripple', 'haptic-entrainment', 'neural-reset', 'twilight-shift'],
    renderer: 'atmosphere-bio-mesh',
  },
  {
    id: 'chiaroscuro-spotlight',
    layer: 'atmosphere',
    label: 'Chiaroscuro Spotlight',
    description: 'A single cone of warm light in absolute darkness. Everything outside the cone is void. Total focus.',
    metaphor: 'The interrogation lamp, but gentle. Truth in a column of light.',
    transition: {
      enterMs: 800,
      exitMs: 600,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'The light finds its subject quickly. Fades like a dimmer switch.',
    },
    attenuationCost: 0.10,
    allowedBands: [0, 1, 2],
    forbiddenWith: ['cymatic-ripple', 'gyroscopic-parallax'], // spotlight demands stillness
    harmonicWith: ['pendulum-settle', 'viscous-drag', 'quiet-authority'],
    renderer: 'atmosphere-chiaroscuro',
  },
  {
    id: 'twilight-shroud',
    layer: 'atmosphere',
    label: 'Twilight Shroud',
    description: 'The liminal hour. Neither day nor night. Soft purples and deep blues with no clear light source.',
    metaphor: 'The threshold. Between states. The moment before sleep.',
    transition: {
      enterMs: 1600,
      exitMs: 1400,
      enterCurve: 'geological-patience',
      exitCurve: 'geological-patience',
      description: 'Arrives like dusk — imperceptibly until it surrounds you.',
    },
    attenuationCost: 0.12,
    allowedBands: [0, 1, 2],
    forbiddenWith: ['amber-resonance'],
    harmonicWith: ['somatic-breath', 'defocus-dissolve', 'twilight-shift', 'void-presence'],
    renderer: 'atmosphere-twilight',
  },
];

// ═══════════════════════════════════════════════════
// MOTION VARIABLES ��� governed by Temperature
// ═══════════════════════════════════════════════════

export const motionVariables: DoctrineVariable[] = [
  {
    id: 'somatic-breath',
    layer: 'motion',
    label: 'Somatic Breath',
    description: '5.5 breaths per minute. 10.9s cycle. The entire canvas inhales and exhales as one organism. Scale, opacity, and position oscillate on the breath curve.',
    metaphor: 'The resting exhale of a sleeping body.',
    transition: {
      enterMs: 2000,
      exitMs: 1400,
      enterCurve: 'geological-patience',
      exitCurve: 'geological-patience',
      description: 'Rhythm establishes over two full cycles. Fades by reducing amplitude to zero.',
    },
    attenuationCost: 0.08,
    allowedBands: [0, 1, 2, 3],
    forbiddenWith: ['bioluminescent-mesh'],
    harmonicWith: ['sanctuary', 'floating-particle-displacement', 'verdant-calm', 'amber-resonance'],
    renderer: 'motion-breath',
  },
  {
    id: 'viscous-unspooling',
    layer: 'motion',
    label: 'Viscous Unspooling',
    description: 'Elements move as though pulled through honey. High viscosity, long settle curves. Nothing snaps — everything drags.',
    metaphor: 'Amber resin flowing. Inevitable but unhurried.',
    transition: {
      enterMs: 1200,
      exitMs: 800,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'Viscosity increases from zero. On exit, everything reaches its rest position and stops.',
    },
    attenuationCost: 0.12,
    allowedBands: [0, 1],
    forbiddenWith: ['cymatic-ripple'], // competing rhythms
    harmonicWith: ['viscous-drag', 'quiet-authority', 'chiaroscuro-spotlight'],
    renderer: 'motion-viscous',
  },
  {
    id: 'pendulum-settle',
    layer: 'motion',
    label: 'Pendulum Settle',
    description: 'Overshoot-and-return. Elements swing past their target and settle with decreasing amplitude. Physics of a weighted pendulum.',
    metaphor: 'A grandfather clock finding its rhythm.',
    transition: {
      enterMs: 900,
      exitMs: 700,
      enterCurve: 'physical-weight',
      exitCurve: 'measured-confidence',
      description: 'First swing arrives with overshoot. Settles over 3 diminishing oscillations.',
    },
    attenuationCost: 0.15,
    allowedBands: [0, 1],
    forbiddenWith: ['tectonic-drift'], // competing motion models
    harmonicWith: ['cryo-chamber', 'surface-refraction', 'neural-reset'],
    renderer: 'motion-pendulum',
  },
  {
    id: 'defocus-dissolve',
    layer: 'motion',
    label: 'Defocus Dissolve',
    description: 'Elements do not move — they blur. Focus shifts between depth planes. Camera rack-focus behavior applied to the canvas.',
    metaphor: 'The world going soft when you zone out.',
    transition: {
      enterMs: 1000,
      exitMs: 800,
      enterCurve: 'measured-confidence',
      exitCurve: 'organic-arrive',
      description: 'Blur ramps smoothly. Sharpness returns with a slight snap.',
    },
    attenuationCost: 0.10,
    allowedBands: [0, 1, 2],
    forbiddenWith: ['gyroscopic-parallax'], // parallax needs sharp planes
    harmonicWith: ['abyssal-void', 'twilight-shroud', 'void-presence'],
    renderer: 'motion-defocus',
  },
  {
    id: 'cymatic-ripple',
    layer: 'motion',
    label: 'Cymatic Ripple',
    description: 'Sound-frequency visualization. Standing wave patterns that oscillate in response to audio or simulated frequency input.',
    metaphor: 'Water on a speaker cone.',
    transition: {
      enterMs: 1100,
      exitMs: 900,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'First ring expands from center. Rings expand to infinity on exit.',
    },
    attenuationCost: 0.22,
    allowedBands: [0],
    forbiddenWith: ['viscous-unspooling', 'chiaroscuro-spotlight', 'verdant-calm'],
    harmonicWith: ['bioluminescent-mesh', 'acoustic-flutter', 'neural-reset'],
    renderer: 'motion-cymatic',
  },
  {
    id: 'tectonic-drift',
    layer: 'motion',
    label: 'Tectonic Drift',
    description: 'Near-stillness with imperceptible movement. Continents drifting. Only noticeable if you look away and look back.',
    metaphor: 'The hour hand of a clock. Moving, but you cannot see it move.',
    transition: {
      enterMs: 3000,
      exitMs: 2000,
      enterCurve: 'geological-patience',
      exitCurve: 'geological-patience',
      description: 'Begins imperceptibly. Ends imperceptibly. You never see the transition.',
    },
    attenuationCost: 0.03,
    allowedBands: [0, 1, 2, 3],
    forbiddenWith: ['pendulum-settle'],
    harmonicWith: ['abyssal-void', 'sanctuary', 'sacred-ordinary', 'void-presence'],
    renderer: 'motion-tectonic',
  },
];

// ═══════════════════════════════════════════════════
// INTERACTION VARIABLES
// ══════════════════════════════════════════════════

export const interactionVariables: DoctrineVariable[] = [
  {
    id: 'gyroscopic-parallax',
    layer: 'interaction',
    label: 'Gyroscopic Parallax',
    description: 'Device tilt moves depth planes at different rates. The glass becomes a window into a 3D space that responds to physical orientation.',
    metaphor: 'Looking through a porthole into a deep room.',
    transition: {
      enterMs: 600,
      exitMs: 400,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'Depth separation establishes quickly. Planes collapse to flat on exit.',
    },
    attenuationCost: 0.18,
    allowedBands: [0],
    forbiddenWith: ['defocus-dissolve', 'chiaroscuro-spotlight'],
    harmonicWith: ['abyssal-void', 'floating-particle-displacement', 'twilight-shift'],
    renderer: 'interaction-parallax',
  },
  {
    id: 'haptic-entrainment',
    layer: 'interaction',
    label: 'Haptic Entrainment',
    description: 'Device vibration synchronized to the breath cycle. The phone becomes a breathing guide through tactile feedback.',
    metaphor: 'Holding a sleeping animal. Feeling its breath through your hands.',
    transition: {
      enterMs: 800,
      exitMs: 1200,
      enterCurve: 'organic-arrive',
      exitCurve: 'geological-patience',
      description: 'First pulse arrives gently. Rhythm fades rather than stops.',
    },
    attenuationCost: 0.05,
    allowedBands: [0, 1],
    forbiddenWith: [],
    harmonicWith: ['somatic-breath', 'sanctuary', 'bioluminescent-mesh'],
    renderer: 'interaction-haptic',
  },
  {
    id: 'floating-particle-displacement',
    layer: 'interaction',
    label: 'Floating Particle Displacement',
    description: 'Touch displaces particles on three depth planes. Far plane: slow, large, dim. Near plane: fast, small, bright. Creates a volumetric response to presence.',
    metaphor: 'Disturbing motes of dust in a shaft of sunlight.',
    transition: {
      enterMs: 800,
      exitMs: 600,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'Particles scatter from center on enter. Exhale outward on exit.',
    },
    attenuationCost: 0.20,
    allowedBands: [0, 1, 2],
    forbiddenWith: [],
    harmonicWith: ['somatic-breath', 'sanctuary', 'gyroscopic-parallax', 'amber-resonance', 'verdant-calm'],
    renderer: 'interaction-particles',
  },
  {
    id: 'surface-refraction',
    layer: 'interaction',
    label: 'Surface Refraction',
    description: 'Touch creates lens-like distortion. Light bends around the contact point. The glass acts like water surface disrupted by a finger.',
    metaphor: 'Touching the surface of a still pond.',
    transition: {
      enterMs: 900,
      exitMs: 700,
      enterCurve: 'measured-confidence',
      exitCurve: 'organic-arrive',
      description: 'Distortion field appears measured. Settles back to flat with a slight ring.',
    },
    attenuationCost: 0.15,
    allowedBands: [0, 1],
    forbiddenWith: [],
    harmonicWith: ['cryo-chamber', 'pendulum-settle', 'neural-reset', 'quiet-authority'],
    renderer: 'interaction-refraction',
  },
  {
    id: 'acoustic-flutter',
    layer: 'interaction',
    label: 'Acoustic Flutter',
    description: 'Voice input creates visible disturbance in the canvas. Speaking into the device makes the environment flutter and respond.',
    metaphor: 'Breathing onto a spider web.',
    transition: {
      enterMs: 400,
      exitMs: 600,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'Responds immediately to voice. Settles slowly when voice stops.',
    },
    attenuationCost: 0.12,
    allowedBands: [0],
    forbiddenWith: [],
    harmonicWith: ['cymatic-ripple', 'bioluminescent-mesh'],
    renderer: 'interaction-acoustic',
  },
  {
    id: 'viscous-drag',
    layer: 'interaction',
    label: 'Viscous Drag',
    description: 'Touch-and-drag with resistance. The interface pushes back proportional to speed. Slow drags move freely; fast drags meet increasing resistance.',
    metaphor: 'Pulling your hand through thick water.',
    transition: {
      enterMs: 300,
      exitMs: 500,
      enterCurve: 'organic-arrive',
      exitCurve: 'measured-confidence',
      description: 'Resistance engages immediately. Releases smoothly to rest.',
    },
    attenuationCost: 0.08,
    allowedBands: [0, 1, 2, 3],
    forbiddenWith: [],
    harmonicWith: ['viscous-unspooling', 'chiaroscuro-spotlight', 'quiet-authority', 'sanctuary'],
    renderer: 'interaction-drag',
  },
];

// ═══════════════════════════════════════════════════
// COLOR VARIABLES — psychological frequency
// ═══════════════════════════════════════════════════

export const colorVariables: DoctrineVariable[] = [
  {
    id: 'neural-reset',
    layer: 'color',
    label: 'Neural Reset',
    description: 'Cool desaturated blue-grey. The color of a screen at 3am. Strips emotional noise. Clinical without being cold.',
    metaphor: 'The moment after crying. Clear, clean, emptied.',
    transition: {
      enterMs: 800,
      exitMs: 600,
      enterCurve: 'measured-confidence',
      exitCurve: 'graceful-depart',
      description: 'Color drains from warm to cool. Returns warmth gradually.',
    },
    attenuationCost: 0.05,
    allowedBands: [0, 1, 2, 3, 4],
    forbiddenWith: [],
    harmonicWith: ['cryo-chamber', 'pendulum-settle', 'surface-refraction'],
    renderer: 'color-neural-reset',
  },
  {
    id: 'amber-resonance',
    layer: 'color',
    label: 'Amber Resonance',
    description: 'Deep amber-gold (#E8A64C). The color of firelight, honey, and safety. Parasympathetic activation through warmth.',
    metaphor: 'Firelight on skin. The warmth of being held.',
    transition: {
      enterMs: 1200,
      exitMs: 900,
      enterCurve: 'geological-patience',
      exitCurve: 'graceful-depart',
      description: 'Warmth builds slowly like a fire catching. Cools like embers.',
    },
    attenuationCost: 0.10,
    allowedBands: [0, 1],
    forbiddenWith: ['cryo-chamber', 'abyssal-void', 'twilight-shroud'],
    harmonicWith: ['sanctuary', 'somatic-breath', 'floating-particle-displacement'],
    renderer: 'color-amber',
  },
  {
    id: 'quiet-authority',
    layer: 'color',
    label: 'Quiet Authority',
    description: 'Deep indigo-violet (#2A1F7A to #6B52FF). The color of deep competence. Trust through depth, not brightness.',
    metaphor: 'The therapist who says nothing but you feel understood.',
    transition: {
      enterMs: 900,
      exitMs: 700,
      enterCurve: 'measured-confidence',
      exitCurve: 'measured-confidence',
      description: 'Arrives with measured confidence. Departs the same way.',
    },
    attenuationCost: 0.08,
    allowedBands: [0, 1],
    forbiddenWith: [],
    harmonicWith: ['cryo-chamber', 'chiaroscuro-spotlight', 'viscous-unspooling', 'viscous-drag'],
    renderer: 'color-authority',
  },
  {
    id: 'sacred-ordinary',
    layer: 'color',
    label: 'Sacred Ordinary',
    description: 'Warm stone (#D4C5B8). The color of linen, clay, and wood. Unspectacular but deeply grounding. Anti-digital.',
    metaphor: 'A hand-thrown bowl. Beautiful because it is plain.',
    transition: {
      enterMs: 1000,
      exitMs: 800,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'Appears like natural light entering a room. Leaves like a closing door.',
    },
    attenuationCost: 0.04,
    allowedBands: [0, 1, 2],
    forbiddenWith: ['cryo-chamber'],
    harmonicWith: ['sanctuary', 'tectonic-drift'],
    renderer: 'color-sacred',
  },
  {
    id: 'verdant-calm',
    layer: 'color',
    label: 'Verdant Calm',
    description: 'Deep emerald-teal (#25D494). Parasympathetic signal. The color of living things. Growth without urgency.',
    metaphor: 'Forest light through canopy. Life that does not hurry.',
    transition: {
      enterMs: 1100,
      exitMs: 800,
      enterCurve: 'organic-arrive',
      exitCurve: 'graceful-depart',
      description: 'Grows in like moss. Recedes like the tide.',
    },
    attenuationCost: 0.06,
    allowedBands: [0, 1, 2, 3],
    forbiddenWith: ['cymatic-ripple'],
    harmonicWith: ['sanctuary', 'somatic-breath', 'floating-particle-displacement', 'tectonic-drift'],
    renderer: 'color-verdant',
  },
  {
    id: 'void-presence',
    layer: 'color',
    label: 'Void Presence',
    description: 'Near-black with faint violet undertone (#0F0D1A). Not absence — the presence of depth. The color of a room before dawn.',
    metaphor: 'The space between stars. Not empty — full of potential.',
    transition: {
      enterMs: 1400,
      exitMs: 1000,
      enterCurve: 'geological-patience',
      exitCurve: 'geological-patience',
      description: 'Darkness deepens imperceptibly. Light returns as slowly.',
    },
    attenuationCost: 0.02,
    allowedBands: [0, 1, 2],
    forbiddenWith: [],
    harmonicWith: ['abyssal-void', 'twilight-shroud', 'tectonic-drift', 'defocus-dissolve'],
    renderer: 'color-void',
  },
  {
    id: 'twilight-shift',
    layer: 'color',
    label: 'Twilight Shift',
    description: 'Slow hue rotation through purples and blues. The color of transition. Never settles — always becoming.',
    metaphor: 'The sky at dusk. Every second a different color, but you cannot see it change.',
    transition: {
      enterMs: 2000,
      exitMs: 1400,
      enterCurve: 'geological-patience',
      exitCurve: 'geological-patience',
      description: 'Shift begins imperceptibly. Settles on a final hue on exit.',
    },
    attenuationCost: 0.14,
    allowedBands: [0],
    forbiddenWith: [],
    harmonicWith: ['bioluminescent-mesh', 'gyroscopic-parallax', 'twilight-shroud'],
    renderer: 'color-twilight',
  },
];

// ═══════════════════════════════════════════════════
// ALL VARIABLES — unified registry
// ═══════════════════════════════════════════════════

export const allVariables: DoctrineVariable[] = [
  ...atmosphereVariables,
  ...motionVariables,
  ...interactionVariables,
  ...colorVariables,
];

export function getVariable(id: string): DoctrineVariable | undefined {
  return allVariables.find(v => v.id === id);
}

export function getVariablesByLayer(layer: GovernorLayer): DoctrineVariable[] {
  return allVariables.filter(v => v.layer === layer);
}

// ═══════════════════════════════════════════════════
// COMPATIBILITY MATRIX
// ═══════════════════════════════════════════════════

export type CompatibilityResult = 'harmonic' | 'neutral' | 'forbidden';

export function checkCompatibility(a: string, b: string): CompatibilityResult {
  const varA = getVariable(a);
  const varB = getVariable(b);
  if (!varA || !varB) return 'neutral';

  if (varA.forbiddenWith.includes(b) || varB.forbiddenWith.includes(a)) {
    return 'forbidden';
  }
  if (varA.harmonicWith.includes(b) || varB.harmonicWith.includes(a)) {
    return 'harmonic';
  }
  return 'neutral';
}

export function getTemperatureFiltered(band: HeatBandId): DoctrineVariable[] {
  return allVariables.filter(v => v.allowedBands.includes(band));
}

// ═══════════════════════════════════════════════════
// ATTENUATION — The Law of Attentional Physics
// ═══════════════════════════════════════════════════

export type AttenuationMode = 'open' | 'surface' | 'floor' | 'panel' | 'fused' | 'dark';

export interface AttenuationLevel {
  id: AttenuationMode;
  label: string;
  description: string;
  blur: number;
  overlayOpacity: number;
  motionYield: number;
  intensityScale: number;
  bgEnergy: number;
  transition: TransitionIdentity;
}

export const attenuationLevels: AttenuationLevel[] = [
  {
    id: 'open', label: 'Open',
    description: 'Home / Stream — the canvas breathes fully.',
    blur: 0, overlayOpacity: 0, motionYield: 0, intensityScale: 1, bgEnergy: 0.9,
    transition: { enterMs: 1200, exitMs: 800, enterCurve: 'organic-arrive', exitCurve: 'organic-arrive', description: 'Slow bloom — the canvas wakes up.' },
  },
  {
    id: 'surface', label: 'Surface',
    description: 'Light content overlay — canvas softens.',
    blur: 4, overlayOpacity: 0.15, motionYield: 0.25, intensityScale: 0.7, bgEnergy: 0.55,
    transition: { enterMs: 800, exitMs: 600, enterCurve: 'measured-confidence', exitCurve: 'measured-confidence', description: 'Measured thickening — the glass finds its depth.' },
  },
  {
    id: 'floor', label: 'Floor',
    description: 'Hero payload — canvas recedes behind the glass.',
    blur: 8, overlayOpacity: 0.35, motionYield: 0.5, intensityScale: 0.35, bgEnergy: 0.3,
    transition: { enterMs: 600, exitMs: 500, enterCurve: 'measured-confidence', exitCurve: 'measured-confidence', description: 'Purposeful recession — the canvas knows to step back.' },
  },
  {
    id: 'panel', label: 'Panel',
    description: 'Read state — canvas becomes a static painting.',
    blur: 24, overlayOpacity: 0.7, motionYield: 1.0, intensityScale: 0.05, bgEnergy: 0.1,
    transition: { enterMs: 1000, exitMs: 700, enterCurve: 'geological-patience', exitCurve: 'organic-arrive', description: 'Confident stillness — the canvas settles into silence.' },
  },
  {
    id: 'fused', label: 'Fused',
    description: 'Action state — canvas links to foreground physics.',
    blur: 0, overlayOpacity: 0.08, motionYield: 0.4, intensityScale: 0.5, bgEnergy: 0.5,
    transition: { enterMs: 400, exitMs: 300, enterCurve: 'organic-arrive', exitCurve: 'organic-arrive', description: 'Immediate link — physics must bind without delay.' },
  },
  {
    id: 'dark', label: 'Dark',
    description: 'Talk state — canvas holds space, empathic glow only.',
    blur: 0, overlayOpacity: 0.55, motionYield: 0.8, intensityScale: 0.15, bgEnergy: 0.2,
    transition: { enterMs: 900, exitMs: 700, enterCurve: 'geological-patience', exitCurve: 'geological-patience', description: 'Gentle withdrawal — the canvas dims like a room at dusk.' },
  },
];

// ═══════════════════════════════════════════════════
// UNIVERSAL LAWS
// ═══════════════════════════════════════════════════

export const universalLaws = [
  {
    id: 'attentional-physics',
    label: 'The Law of Attentional Physics',
    decree: 'The background does not disappear when a room becomes important. It yields.',
    detail: 'Blur, darkness, motion reduction, and depth attenuation must protect focus without killing the organism.',
  },
  {
    id: 'unbroken-surface',
    label: 'The Law of the Unbroken Surface',
    decree: 'We do not use borders, pills, or painted rectangles to separate information.',
    detail: 'The OS is a single, continuous sheet of dark glass. UI components do not sit on top of the glass; they emerge from within it through localized refraction, blur, and light. Hierarchy is created strictly through typographic proximity, depth of field, and volumetric glow — never by drawing a line.',
    alias: 'The Death of the Box',
  },
  {
    id: 'total-energy',
    label: 'The Total Energy Equation',
    decree: 'The screen has one energy budget.',
    detail: 'If the hero payload needs 90% of attention, the atmosphere must fall back to 10%. Background and foreground trade energy depending on room and state.',
  },
  {
    id: 'late-arrival',
    label: 'The Law of Late Arrival',
    decree: 'The most important controls should appear late.',
    detail: 'If the room can carry the user through atmosphere, geometry, or gravity alone, the shell should wait. 800ms minimum before copy arrives. Non-negotiable.',
  },
  {
    id: 'evaporation',
    label: 'The Law of Evaporation',
    decree: 'When a room becomes active, non-essential chrome must evaporate.',
    detail: 'The user should be left inside the experience, not surrounded by explanatory UI.',
  },
  {
    id: 'five-step-morph',
    label: 'The Five-Step Transition Sequence',
    decree: 'Nothing should feel like a cut to a new page.',
    detail: 'Every meaningful surface change moves through: Arrival → Threshold → Live State → Shift → Seal & Carry.',
    steps: ['Arrival', 'Threshold', 'Live State', 'Shift', 'Seal & Carry'],
  },
];

// ═══════════════════════════════════════════════════
// COPY LAYERS
// ═══════════════════════════════════════════════════

export const copyLayers = [
  { id: 'eyebrow', label: 'Eyebrow', maxWords: 4, energyCost: 0.02, description: 'Tiny orientation text. Room name or state.' },
  { id: 'canopy', label: 'Canopy', maxWords: 12, energyCost: 0.08, description: 'The emotional headline. What the room feels like.' },
  { id: 'guide', label: 'Guide', maxWords: 25, energyCost: 0.12, description: 'One line of instruction. What to do next.' },
  { id: 'gesture', label: 'Gesture', maxWords: 8, energyCost: 0.04, description: 'The action word. Begin, Release, Hold.' },
  { id: 'receipt', label: 'Receipt', maxWords: 20, energyCost: 0.10, description: 'What just happened. Validation of the moment.' },
  { id: 'route', label: 'Route', maxWords: 6, energyCost: 0.03, description: 'Where to go next. Continuity thread.' },
  { id: 'ambient', label: 'Ambient', maxWords: 8, energyCost: 0.01, description: 'Background murmur. Peripheral awareness.' },
];

// ═══════════════════════════════════════════════════
// ROOM RECIPES — composition rules
// ═══════════════════════════════════════════════════

export interface RoomRecipe {
  id: string;
  label: string;
  family: 'callable' | 'slow-depth' | 'intelligence';
  color: string;
  description: string;
  verb: string;
  defaultAtmosphere: string;
  defaultMotion: string;
  defaultInteraction: string;
  defaultColor: string;
  defaultAttenuation: AttenuationMode;
  temperatureRange: [HeatBandId, HeatBandId]; // min, max
  magicLaw: string;
}

export const roomRecipes: RoomRecipe[] = [
  {
    id: 'navicues', label: 'NaviCues', family: 'callable',
    color: '#8A7AFF',
    description: 'The physics of feeling.',
    verb: 'friction becomes motion',
    defaultAtmosphere: 'sanctuary',
    defaultMotion: 'somatic-breath',
    defaultInteraction: 'floating-particle-displacement',
    defaultColor: 'amber-resonance',
    defaultAttenuation: 'fused',
    temperatureRange: [0, 4],
    magicLaw: 'Strongest authored entrance/mechanic/seal relationship. Minimal copy in live state. Physical interaction carries the meaning.',
  },
  {
    id: 'talk', label: 'Talk', family: 'callable',
    color: '#8B9DC3',
    description: 'The guided corridor.',
    verb: 'confusion becomes a carried corridor',
    defaultAtmosphere: 'twilight-shroud',
    defaultMotion: 'tectonic-drift',
    defaultInteraction: 'viscous-drag',
    defaultColor: 'void-presence',
    defaultAttenuation: 'dark',
    temperatureRange: [0, 3],
    magicLaw: 'A corridor, not chat. Openings should feel carried, not branched. Route emerges naturally.',
  },
  {
    id: 'play', label: 'Play', family: 'callable',
    color: '#FFB677',
    description: 'The soundtrack of becoming.',
    verb: 'mood becomes a sentient mix',
    defaultAtmosphere: 'bioluminescent-mesh',
    defaultMotion: 'cymatic-ripple',
    defaultInteraction: 'acoustic-flutter',
    defaultColor: 'twilight-shift',
    defaultAttenuation: 'fused',
    temperatureRange: [0, 1],
    magicLaw: 'A sentient mix, not a library. Invoked by mood/current. Less transport UI, more sonic field.',
  },
  {
    id: 'studio', label: 'Studio', family: 'callable',
    color: '#2FE6A6',
    description: 'The rhythm of regulation.',
    verb: 'media becomes sanctuary',
    defaultAtmosphere: 'sanctuary',
    defaultMotion: 'somatic-breath',
    defaultInteraction: 'haptic-entrainment',
    defaultColor: 'verdant-calm',
    defaultAttenuation: 'surface',
    temperatureRange: [0, 2],
    magicLaw: 'Sanctuary, not streaming app. Poster-to-immersion. Almost no media chrome.',
  },
  {
    id: 'journeys', label: 'Journeys', family: 'slow-depth',
    color: '#6B52FF',
    description: 'The architecture of becoming.',
    verb: 'awareness becomes lived becoming',
    defaultAtmosphere: 'twilight-shroud',
    defaultMotion: 'viscous-unspooling',
    defaultInteraction: 'viscous-drag',
    defaultColor: 'quiet-authority',
    defaultAttenuation: 'floor',
    temperatureRange: [0, 2],
    magicLaw: 'Path over time. Minimal scene bookkeeping. Real-world return matters.',
  },
  {
    id: 'insights', label: 'Insights', family: 'slow-depth',
    color: '#00CCE0',
    description: 'The anatomy of truth.',
    verb: 'theory becomes embodied recognition',
    defaultAtmosphere: 'chiaroscuro-spotlight',
    defaultMotion: 'defocus-dissolve',
    defaultInteraction: 'surface-refraction',
    defaultColor: 'neural-reset',
    defaultAttenuation: 'panel',
    temperatureRange: [0, 1],
    magicLaw: 'Descent, not article. Documentary depth fused with somatic lock points.',
  },
  {
    id: 'signal', label: 'Signal', family: 'intelligence',
    color: '#7C3AED',
    description: 'The architecture of proof.',
    verb: 'change becomes visible proof',
    defaultAtmosphere: 'cryo-chamber',
    defaultMotion: 'pendulum-settle',
    defaultInteraction: 'surface-refraction',
    defaultColor: 'quiet-authority',
    defaultAttenuation: 'surface',
    temperatureRange: [0, 1],
    magicLaw: 'Proof becomes graph geometry. K/B/E should be felt before it is read.',
  },
  {
    id: 'navigate', label: 'Navigate', family: 'intelligence',
    color: '#D4C5B8',
    description: 'The symbiotic infrastructure.',
    verb: 'support becomes felt proximity',
    defaultAtmosphere: 'sanctuary',
    defaultMotion: 'tectonic-drift',
    defaultInteraction: 'floating-particle-displacement',
    defaultColor: 'sacred-ordinary',
    defaultAttenuation: 'surface',
    temperatureRange: [0, 2],
    magicLaw: 'Support becomes proximity. Support rank and live cast should speak before labels.',
  },
  {
    id: 'read', label: 'Read', family: 'slow-depth',
    color: '#F9F8FF',
    description: 'The infinite book.',
    verb: 'noise becomes calm line',
    defaultAtmosphere: 'abyssal-void',
    defaultMotion: 'tectonic-drift',
    defaultInteraction: 'viscous-drag',
    defaultColor: 'void-presence',
    defaultAttenuation: 'panel',
    temperatureRange: [0, 1],
    magicLaw: 'Infinite book. Calm line. Almost no editorial clutter. Maximum attenuation.',
  },
  {
    id: 'practices', label: 'Practices', family: 'slow-depth',
    color: '#2FE6A6',
    description: 'The instruments of regulation.',
    verb: 'tools become held instruments',
    defaultAtmosphere: 'sanctuary',
    defaultMotion: 'somatic-breath',
    defaultInteraction: 'haptic-entrainment',
    defaultColor: 'verdant-calm',
    defaultAttenuation: 'fused',
    temperatureRange: [0, 3],
    magicLaw: 'Instruments, not toolkit. Held execution shell. Physical interaction carries the regulation.',
  },
  {
    id: 'map', label: '∞Map', family: 'intelligence',
    color: '#00CCE0',
    description: 'The constellation of the mind.',
    verb: 'friction becomes visible architecture',
    defaultAtmosphere: 'abyssal-void',
    defaultMotion: 'viscous-unspooling',
    defaultInteraction: 'surface-refraction',
    defaultColor: 'neural-reset',
    defaultAttenuation: 'floor',
    temperatureRange: [0, 1],
    magicLaw: 'Spatial navigation of the 3D mind. K.B.E. clusters felt before read. Pathways shift from friction to integration.',
  },
];

// ═══════════════════════════════════════════════════
// FORBIDDEN — rejection criteria
// ═══════════════════════════════════════════════════

export const forbiddenRules = [
  // ── The Death of the Box ──
  'Painted containers, cards, or boxes of any kind.',
  'UI "pills", chips, or badges with background colors.',
  'Hard 1px borders used to separate content zones.',
  'Traditional horizontal sliders with visible tracks and handles.',
  // ── Shell & Navigation ──
  'Obvious menu logic in the shell.',
  'Generic tab-bar thinking.',
  // ── Copy & Explanation ──
  'Visible over-explanation.',
  'Stacked shell recap.',
  'Copy doing the job of geometry.',
  'Copy arriving before 800ms after room load.',
  // ── Transitions ──
  'Harsh cut-to-black exits.',
  'Shell intrusion where room physics already communicate the action.',
  // ── Biology-Clashing Combinations ──
  'Parasympathetic color (verdant-calm) + high-friction motion curve (cold-snap).',
  'High-heat urgency (Band 3+) + expansive contemplative pacing (cymatic-ripple).',
  'Calming atmosphere (sanctuary) + aggressive interaction (acoustic-flutter at full intensity).',
  'Survival Mode (Band 4) + any scrolling or reading.',
  'Biology-clashing combinations of any kind.',
];

// ═══════════════════════════════════════════════════
// THE LANDING STATEMENT — §1
// ═══════════════════════════════════════════════════

export const landingStatement = {
  premise: 'Recoverlution should feel like one living operating system, not a set of beautiful surfaces.',
  theBrowserIs: ['one material', 'one shell', 'one nervous system', 'many rooms', 'very few controls', 'deeply differentiated emotional registers'],
  theUserShouldFeel: ['invoked', 'carried', 'held', 'resumed', 'changed'],
  theUserShouldNotFeel: ['switched', 'launched', 'navigated', 'briefed', 'managed'],
  coreInsight: 'The system is strongest when the user cannot quite tell where interface ends and guidance begins.',
  beliefs: ['atmosphere before explanation', 'pressure before buttons', 'geometry before labels', 'route before instruction', 'proof before analytics', 'support before orchestration', 'memory before navigation'],
  theMagicIs: ['the room feels alive before the user understands it', 'the controls feel like pressure rather than UI', 'the atmosphere feels aware of context', 'the shell remembers the current', 'the room grows simpler as engagement deepens', 'proof is seen in field behavior, not explained through software language'],
};

// ════════════════════════════════��══════════════════
// THE SHELL — §3
// ═══════════════════════════════════════════════════

export const shellModel = [
  { id: 'surface', label: 'Surface', description: 'The immersive hero canvas. The stage where the room happens.', feel: 'Should feel edge-to-edge and materially dominant, not like a component wrapper.' },
  { id: 'anchor', label: 'Anchor', description: 'The ritual point at the base of the glass.', feel: 'Should feel like grounding and invocation, not a control dock. Should carry pressure, not menu logic.' },
  { id: 'stream', label: 'Stream', description: 'The horizon. Carries ambient context, continuity, support drift, proof drift, and timing.', feel: 'Should feel like weather, not notifications.' },
];

export const shellOwnership = ['back posture', 'canopy posture', 'threshold posture', 'route invocation posture', 'continuity language', 'reopen behavior', 'ambient horizon behavior'];

// ═══════════════════════════════════════════════════
// CONTROL VOCABULARY — §6
// ═══════════════════════════════════════════════════

export const controlVocabulary = [
  { id: 'press', label: 'Press', uses: ['invocation', 'enter', 'continue', 'activate'], feel: 'Immediate. Clean.' },
  { id: 'hold', label: 'Hold', uses: ['deep invocation', 'state shift', 'grounding', 'escalation'], feel: 'Weighted. Intentional. Embodied.' },
  { id: 'drag', label: 'Drag', uses: ['somatic mechanics', 'corridor progression', 'field exploration', 'directional release'], feel: 'Physical. Inevitable.' },
  { id: 'scroll', label: 'Scroll / Descent', uses: ['deepening', 'not browsing'], feel: 'Entering depth.' },
  { id: 'tap', label: 'Tap on Live Element', uses: ['selecting a focus zone', 'following a route', 'touching a current'], feel: 'Direct contact with the room.' },
];

// ═══════════════════════════════════════════════════
// CONTROLS WITHOUT CONTAINERS — §6.X
// Because we ban traditional buttons and pills,
// controls must be defined by material physics.
// ═══════════════════════════════════════════════════

export const controlPhysics = [
  {
    id: 'haptic-threshold',
    label: 'The Haptic Threshold',
    description: 'A control is just typography floating in the void. Holding it increases localized glass refraction and haptic tension until it "snaps".',
    mechanism: 'No background. No border. The control reveals itself through pressure response — refraction, glow buildup, and snap release.',
  },
  {
    id: 'refractive-field',
    label: 'The Refractive Field',
    description: 'If a block of text needs elevation, do not draw a card. Use a soft, borderless pool of sub-surface light (frostedGlass.breath) illuminating from behind it.',
    mechanism: 'A radial gradient of near-invisible luminosity. The content floats above nothing visible — only perceived depth.',
  },
  {
    id: 'semantic-particle',
    label: 'The Semantic Particle',
    description: 'Instead of a colored "tag" or "pill" for metadata, use a single, glowing microscopic pixel of light next to tracked-out typography (marketing.eyebrow).',
    mechanism: 'A 2–4px luminous dot with a soft glow halo. The typography beside it carries the semantic weight. No container needed.',
  },
];

// ═══════════════════════════════════════════════════
// SEQUENCE THERMODYNAMICS — §11
// ═══════════════════════════════════════════════════

export const sequenceThermodynamics = {
  lawOfCooldown: 'A high-heat sequence should not remain at the same intensity. The room should visibly cool, soften, or integrate over time.',
  arcPatterns: [
    { id: 'plateau-release', label: 'Plateau & Release', description: 'Intensity holds steady then releases cleanly.' },
    { id: 'descent-return', label: 'Descent & Return', description: 'Deep dive followed by a surfacing.' },
    { id: 'containment-bloom', label: 'Containment to Bloom', description: 'Pressure builds in a held space, then opens.' },
  ],
  carry: 'One cue or room should leave a particle, trace, or current that becomes the seed of the next state. No cut-to-black thinking.',
};

// ═══════════════════════════════════════════════════
// FAILURE & RESILIENCE — §12
// ═══════════════════════════════════════════════════

export const failureStates = [
  { id: 'clouded-glass', label: 'Clouded Glass', description: 'Failure should feel like environmental dissonance, not modal error UI.' },
  { id: 'instinctive-affordance', label: 'Instinctive Affordance', description: 'The room should teach touch through gravity, light, and current — not through tutorial overlays.' },
  { id: 'sensory-override', label: 'Sensory Override', description: 'A hard floor must exist for sensory-sensitive users. The system must be able to collapse to quiet monochrome safety.' },
  { id: 'acoustic-materiality', label: 'Acoustic Materiality', description: 'The OS needs micro-acoustic rules, not just Play. Sound should confirm weight, drag, release, and receipt.' },
  { id: 'hardware-symbiosis', label: 'Hardware Symbiosis', description: 'The OS must adapt to battery, low-power, and hardware fatigue. Atmosphere and fidelity should reduce gracefully.' },
];

export const antifragilityPrinciple = {
  premise: 'When reality breaks, the product should become simpler, quieter, clearer, safer.',
  notBecome: ['louder', 'more literal', 'more software-like'],
  standard: 'A broken state should still feel like Recoverlution.',
};

// ═══════════════════════════════════════════════════
// SEMANTIC PHYSICS — §13
// ═══════════════════════════════════════════════════

export const semanticPhysics = {
  dimensions: [
    { id: 'heavy-matter', label: 'Heavy Matter', description: 'Text that carries weight. Drops into place. Resists movement.' },
    { id: 'kinetic-text', label: 'Kinetic Text', description: 'Text that moves with the room physics. Breathes, drifts, or settles.' },
    { id: 'atmospheric-subtext', label: 'Atmospheric Subtext', description: 'Text that is barely visible. Peripheral awareness. Almost subliminal.' },
    { id: 'semantic-morph', label: 'Semantic Morph', description: 'Text that transforms — collapses, expands, shifts meaning through form change.' },
  ],
  voiceThreads: [
    { id: 'companion', label: 'The Companion', feel: 'Warm, held, unconditional.' },
    { id: 'activator', label: 'The Activator', feel: 'Direct, physical, no-nonsense.' },
    { id: 'mirror', label: 'The Mirror', feel: 'Reflective, quiet, honest.' },
  ],
  timingLaw: 'Text should never arrive at the same instant as room load. Atmosphere first. Language second.',
  boundingLaw: 'Copy must be constrained by character and line budgets. The payload must fit the glass, not break it.',
  standard: 'The line should regulate, orient, guide, or seal. If it is branding, explanation, or filler in disguise, it should be removed.',
};

// ═══════════════════════════════════════════════════
// ROOM COMPOSITION ORDER — §5.2
// ═══════════════════════════════════════════════════

export const compositionOrder = [
  'What is the user\'s likely state?',
  'What is the room\'s therapeutic job?',
  'What should the shell own here?',
  'What should the atmosphere do before copy appears?',
  'What is the primary artifact or field behavior?',
  'What is the minimum viable copy?',
  'What trace or route should remain afterward?',
];

// ═══════════════════════════════════════════════════
// FIVE-STEP TRANSITION SEQUENCE — §2.5
// ═══════════════════════════════════════════════════

export interface TransitionStep {
  id: string;
  label: string;
  description: string;
  /** What the shell does at this step */
  shellBehavior: string;
  /** What the room does at this step */
  roomBehavior: string;
  /** Approximate timing from room entry (ms). -1 = user-driven. */
  timingMs: number;
}

export const transitionSequence: TransitionStep[] = [
  {
    id: 'arrival',
    label: 'Arrival',
    description: 'The atmosphere gets there first. Before a single word is read, the environment sets the tone.',
    shellBehavior: 'Atmosphere shifts. Stream color changes. Orb color transitions.',
    roomBehavior: 'Background renders. No copy yet. No controls visible.',
    timingMs: 0,
  },
  {
    id: 'threshold',
    label: 'Threshold',
    description: 'The user crosses from passive into engaged. The canopy appears. The invitation lands.',
    shellBehavior: 'Shell chrome recedes. Canopy copy fades in.',
    roomBehavior: 'Primary artifact begins to materialize. Narrative canopy appears.',
    timingMs: 800,
  },
  {
    id: 'live-state',
    label: 'Live State',
    description: 'The room is fully present. Chrome should recede. The body takes over.',
    shellBehavior: 'Maximum evaporation. Shell is near-invisible.',
    roomBehavior: 'Hero physics active. Copy collapses on touch. Pure interaction.',
    timingMs: 1600,
  },
  {
    id: 'shift',
    label: 'Shift',
    description: 'Something changes because the user acted, held, or stayed. The room responds.',
    shellBehavior: 'Shell observes the shift. Receipt posture may prepare.',
    roomBehavior: 'Matter resolves. Tension transforms. State change visible in field.',
    timingMs: -1,
  },
  {
    id: 'seal',
    label: 'Seal & Carry',
    description: 'The moment leaves behind a trace in the shell, stream, graph, or route.',
    shellBehavior: 'Receipt stamps. Route appears. Stream carries forward the trace.',
    roomBehavior: 'Resolution particle persists. Next state seeds naturally.',
    timingMs: -1,
  },
];

// ═══════════════════════════════════════════════════
// COPY OWNERSHIP — §7 (extended)
// ═══════════════════════════════════════════════════

export const copyOwnership = {
  /** Copy layers owned by the Universal Player shell */
  playerOwned: [
    { id: 'receipt', label: 'Receipt', description: 'What just happened. Validation of the moment.' },
    { id: 'route', label: 'Route', description: 'Where to go next. Continuity thread.' },
    { id: 'continuity', label: 'Continuity', description: 'Reopen language. Resumption posture.' },
    { id: 'ambient', label: 'Ambient Drift', description: 'Stream content. Peripheral context. Weather.' },
  ],
  /** Copy layers owned by individual rooms */
  roomOwned: [
    { id: 'canopy', label: 'Canopy', description: 'The narrative voice. Room-specific emotional register.' },
    { id: 'gesture', label: 'Gesture', description: 'The interaction prompt. What the room invites.' },
    { id: 'guide', label: 'Guide', description: 'Domain-specific instruction. Therapeutic framing.' },
    { id: 'eyebrow', label: 'Eyebrow', description: 'Contextual label. Room identity without explanation.' },
  ],
  /** Density levels */
  densityLevels: ['whisper', 'light', 'moderate'] as const,
  /** The standard */
  standard: 'If the field already says it, delete the text. If the shell is explaining what the room already proves, delete the shell line.',
};

// ═══════════════════════════════════════════════════
// CONTROL QUALITY — §6.1
// ═══════════════════════════════════════════════════

export const controlQuality = {
  magical: [
    'appears late',
    'feels physical',
    'says almost nothing',
    'inherits the room\'s emotional law',
    'leaves a trace when it matters',
  ],
  weak: [
    'explains itself too early',
    'duplicates what the field already proves',
    'looks selectable before it feels inevitable',
    'survives too long once the room becomes active',
  ],
};

// ═══════════════════════════════════════════════════
// ROOM BEHAVIOR MODEL — §5.1
// ═══════════════════════════════════════════════════

export const roomBehaviorModel = {
  /** What a magical room does (not just looks beautiful) */
  aRoomShould: [
    'lower the effort of entering',
    'reduce the number of decisions the user must make',
    'teach the body what to do through the field itself',
    'change state without needing a paragraph to justify itself',
    'leave behind evidence that the moment mattered',
  ],
  /** How rooms should transform under engagement */
  underEngagement: 'quieter',
  underPressure: 'clearer',
  afterCommitment: 'simpler',
  afterCompletion: 'more personal',
};

// ═══════════════════════════════════════════════════
// THE YIELD MODEL — §10.1
// ═══════════════════════════════════════════════════

export const yieldModel = {
  /** The environment should never "turn off" unless the safety floor requires it */
  principle: 'The user should feel the OS protecting focus, not removing beauty.',
  /** Yield operations (in order of intensity) */
  operations: ['yield', 'defocus', 'darken', 'slow', 'hold'] as const,
  /** Room-specific attenuation guidance */
  roomGuidance: {
    'read': 'Maximum attenuation. Almost no canvas energy.',
    'navicues': 'Harmonic fusion between background and hero mechanic.',
    'talk': 'Darkened, listening background with minimal distraction.',
    'play': 'Fused energy — canvas links to sonic field.',
    'studio': 'Surface attenuation — canvas softens for immersion.',
    'signal': 'Surface attenuation — clean field for proof geometry.',
  } as Record<string, string>,
};

// ═══════════════════════════════════════════════════
// ANTI-PATTERNS — §1.2
// ═══════════════════════════════════════════════════

export const antiPatterns = {
  doNotTreatAs: [
    'a menu of effects',
    'a pile of premium components',
    'a set of room skins',
    'a collection of beautiful cards',
    'a content experience with atmosphere added later',
  ],
  doNotDesign: 'a screen',
  insteadDesign: ['a current', 'a threshold', 'a field', 'a seal', 'a remembered trace'],
};