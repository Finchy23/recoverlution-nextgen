/**
 * GENESIS INNOVATION SYSTEM
 * =========================
 *
 * Typed architecture for the next-batch NaviCue evolution.
 * This file defines the creative sandbox with clear guardrails:
 * - 10 innovation domains (technology scopes)
 * - Hero interaction library
 * - Atmosphere library
 * - Reactive background engines
 * - Entrance materialization patterns
 *
 * Use this as the source of truth when briefing UI/creative engineering.
 */

export type GenesisDomainId =
  | 'sensor_metaphors'
  | 'advanced_webgl'
  | 'kinematic_typography'
  | 'audio_haptics'
  | 'entrance_materialization'
  | 'bio_optic_feedback'
  | 'chrono_mechanics'
  | 'holographic_parallax'
  | 'thermodynamic_ui'
  | 'wave_interference';

export type HeroPlayId =
  | 'velocity_yield'
  | 'phase_alignment'
  | 'radial_expansion'
  | 'gravitational_anchor'
  | 'paradox_weave'
  | 'focal_collapse'
  | 'kinetic_scrub'
  | 'somatic_drop';

export type AtmosphereId =
  | 'apex_void'
  | 'dawn_calculus'
  | 'abyssal_trench'
  | 'stratospheric_clear'
  | 'interference_pattern'
  | 'cathedral'
  | 'mycelial_network'
  | 'event_horizon';

export type BackgroundEngineId =
  | 'fluid_topography'
  | 'volumetric_breath'
  | 'gyroscopic_abyss'
  | 'symbiotic_shadow'
  | 'real_world_mirror';

export type EntrancePatternId =
  | 'condensation_reveal'
  | 'magnetic_assembly'
  | 'depth_surfacing'
  | 'typographic_breathing'
  | 'ink_drop'
  | 'eclipse_reveal'
  | 'loom_assembly';

export interface GenesisDomain {
  id: GenesisDomainId;
  title: string;
  intent: string;
  scope: string;
  tech: string[];
}

export interface HeroPlay {
  id: HeroPlayId;
  title: string;
  interactionVerb: string;
  input: string;
  outcome: string;
}

export interface AtmosphereProfile {
  id: AtmosphereId;
  title: string;
  psychology: string;
  renderNotes: string;
}

export interface BackgroundEngine {
  id: BackgroundEngineId;
  title: string;
  behavior: string;
  trigger: string;
}

export interface EntrancePattern {
  id: EntrancePatternId;
  title: string;
  mechanism: string;
  feel: string;
}

export interface GenesisCueSpec {
  cueId: string;
  title: string;
  psychologicalIntent: string;
  domains: GenesisDomainId[];
  heroPlay: HeroPlayId;
  atmosphere: AtmosphereId;
  backgroundEngine: BackgroundEngineId;
  entrancePattern: EntrancePatternId;
  notes?: string;
}

export interface GenesisGuardrails {
  foundationLocks: string[];
  qualityBar: string[];
  accessibility: string[];
  performance: string[];
  fallbackRules: string[];
}

export interface GenesisCreativeCharter {
  nonNegotiables: string[];
  freedomZones: string[];
  antiPatterns: string[];
  northStarQuestion: string;
}

export const GENESIS_DOMAINS: readonly GenesisDomain[] = [
  {
    id: 'sensor_metaphors',
    title: 'Sensor-Driven Metaphors',
    intent: 'Use body-level input to create embodied cognition.',
    scope: 'Touch is not enough. Device orientation, motion, pressure, and context can drive state.',
    tech: ['DeviceOrientation', 'DeviceMotion', 'Pointer velocity', 'Sensor permission gating'],
  },
  {
    id: 'advanced_webgl',
    title: 'Advanced WebGL',
    intent: 'Render interactions as living matter, not flat UI.',
    scope: 'Use GPU-backed scenes when the metaphor needs physical believability.',
    tech: ['WebGL', 'Three.js', 'Custom shaders', 'GPU particle systems'],
  },
  {
    id: 'kinematic_typography',
    title: 'Kinematic Typography',
    intent: 'Make words behave like physical material.',
    scope: 'Typography can stretch, dissolve, magnetize, or phase-shift as part of interaction.',
    tech: ['Variable fonts', 'Canvas text particles', 'Physics-based glyph transforms'],
  },
  {
    id: 'audio_haptics',
    title: 'Symbiotic Audio-Haptics',
    intent: 'Synchronize sound and haptics as one nervous-system channel.',
    scope: 'No generic taps. Haptic texture and tone should map to interaction state.',
    tech: ['Web Audio API', 'Haptics bridge (native wrapper)', 'Frequency mapping'],
  },
  {
    id: 'entrance_materialization',
    title: 'Entrance Materialization',
    intent: 'Arrival should feel like an event, not a fade.',
    scope: 'Prompts materialize through physical metaphors (thawing, assembly, depth emergence).',
    tech: ['Masking', 'Shader reveals', 'Typographic state interpolation'],
  },
  {
    id: 'bio_optic_feedback',
    title: 'Bio-Optic Feedback',
    intent: 'Support presence with private, local camera-derived signals.',
    scope: 'Gaze and facial tension can modulate environment if user consents.',
    tech: ['WebRTC camera', 'Local facial landmarks', 'On-device signal extraction'],
  },
  {
    id: 'chrono_mechanics',
    title: 'Chrono-Mechanics',
    intent: 'Let users feel deep-time perspective shifts.',
    scope: 'Interactions scrub through temporal transformations (erosion, reweave, horizon).',
    tech: ['Timeline scrubbing', 'Procedural state interpolation', 'Particle trajectory rewind'],
  },
  {
    id: 'holographic_parallax',
    title: 'Holographic Parallax',
    intent: 'Use depth to create metacognitive distance.',
    scope: 'Foreground problems recede into deep spatial context.',
    tech: ['Layered parallax', 'Z-depth scene composition', 'Camera matrix transforms'],
  },
  {
    id: 'thermodynamic_ui',
    title: 'Thermodynamic UI',
    intent: 'Visualize voltage, heat, entropy, and charge recovery.',
    scope: 'Energy metaphors should feel physically consistent and measurable.',
    tech: ['Heatmap interpolation', 'Bloom/decay shaders', 'State-driven color thermals'],
  },
  {
    id: 'wave_interference',
    title: 'Wave Interference',
    intent: 'Resolve conflict through harmonic alignment.',
    scope: 'Competing signals cancel or entrain through frequency matching.',
    tech: ['Sine/cosine fields', 'Frequency sliders', 'Audio-reactive waveforms'],
  },
] as const;

export const HERO_PLAYS: readonly HeroPlay[] = [
  {
    id: 'velocity_yield',
    title: 'Velocity Yield',
    interactionVerb: 'Yield',
    input: 'Velocity-sensitive drag/swipe',
    outcome: 'Fast force hardens the obstacle; slow deliberate movement liquefies it.',
  },
  {
    id: 'phase_alignment',
    title: 'Phase Alignment',
    interactionVerb: 'Align',
    input: 'Rotary tuning or dual-axis scrubbing',
    outcome: 'When phase sync is reached, interference collapses into a stable signal.',
  },
  {
    id: 'radial_expansion',
    title: 'Radial Expansion',
    interactionVerb: 'Expand',
    input: 'Reverse pinch from center outward',
    outcome: 'Noise is pushed to the periphery, revealing central void clarity.',
  },
  {
    id: 'gravitational_anchor',
    title: 'Gravitational Anchor',
    interactionVerb: 'Anchor',
    input: 'Stationary hold at center',
    outcome: 'Fragmented elements are drawn into coherent orbit around grounded presence.',
  },
  {
    id: 'paradox_weave',
    title: 'Paradox Weave',
    interactionVerb: 'Synthesize',
    input: 'Two-finger opposing drag toward center',
    outcome: 'Opposing poles weave into a higher-order unified state.',
  },
  {
    id: 'focal_collapse',
    title: 'Focal Collapse',
    interactionVerb: 'Reframe',
    input: 'Continuous macro/micro depth scrub',
    outcome: 'Immediate crisis collapses into wide-system perspective.',
  },
  {
    id: 'kinetic_scrub',
    title: 'Kinetic Scrub',
    interactionVerb: 'Clear',
    input: 'Freeform scrub/wipe',
    outcome: 'Distortion is removed to reveal existing clarity beneath.',
  },
  {
    id: 'somatic_drop',
    title: 'Somatic Drop',
    interactionVerb: 'Release',
    input: 'Timed hold + breath-synced release',
    outcome: 'Burden drops only when release timing aligns with exhale state.',
  },
] as const;

export const ATMOSPHERE_LIBRARY: readonly AtmosphereProfile[] = [
  {
    id: 'apex_void',
    title: 'Apex Void',
    psychology: 'Absolute stillness, surrender, parasympathetic downshift.',
    renderNotes: 'Near-black field, single distant orb, zero particle clutter.',
  },
  {
    id: 'dawn_calculus',
    title: 'Dawn Calculus',
    psychology: 'Fresh synthesis, first-light clarity.',
    renderNotes: 'Directional volumetric rays and rising steam-like particles.',
  },
  {
    id: 'abyssal_trench',
    title: 'Abyssal Trench',
    psychology: 'Heavy containment, deep emotional regulation.',
    renderNotes: 'Deep indigo pressure field, slow high-latency currents.',
  },
  {
    id: 'stratospheric_clear',
    title: 'Stratospheric Clear',
    psychology: 'Overview effect, metacognitive detachment.',
    renderNotes: 'Sparse crystalline dust, high-altitude silver/ozone palette.',
  },
  {
    id: 'interference_pattern',
    title: 'Interference Pattern',
    psychology: 'Paradox, non-dual synthesis.',
    renderNotes: 'Iridescent wave overlays and subtle moire field drift.',
  },
  {
    id: 'cathedral',
    title: 'Cathedral',
    psychology: 'Boundaries, structure, deep-time integrity.',
    renderNotes: 'Architectural light shafts with stable shadow pillars.',
  },
  {
    id: 'mycelial_network',
    title: 'Mycelial Network',
    psychology: 'Relational resonance, distributed intelligence.',
    renderNotes: 'Blurred mesh with traveling pulses on connective threads.',
  },
  {
    id: 'event_horizon',
    title: 'Event Horizon',
    psychology: 'Crisis transmutation, contained intensity.',
    renderNotes: 'Dark core sphere, bright corona, inward particle gravity.',
  },
] as const;

export const BACKGROUND_ENGINES: readonly BackgroundEngine[] = [
  {
    id: 'fluid_topography',
    title: 'Fluid Topography',
    behavior: 'High-viscosity flow that remembers motion trails.',
    trigger: 'Pointer drag and velocity wake.',
  },
  {
    id: 'volumetric_breath',
    title: 'Volumetric Breath',
    behavior: 'Background expands/contracts with breath engine phases.',
    trigger: 'Shared inhale/exhale cycle state.',
  },
  {
    id: 'gyroscopic_abyss',
    title: 'Gyroscopic Abyss',
    behavior: 'Extreme parallax depth shift on device tilt.',
    trigger: 'Device orientation matrix updates.',
  },
  {
    id: 'symbiotic_shadow',
    title: 'Symbiotic Shadow',
    behavior: 'Environmental light responds to hero interaction tension.',
    trigger: 'Hero state (strain, resolve, release).',
  },
  {
    id: 'real_world_mirror',
    title: 'Real-World Mirror',
    behavior: 'Ambient context maps into abstract environment render.',
    trigger: 'Time, ambient light, and weather context.',
  },
] as const;

export const ENTRANCE_PATTERNS: readonly EntrancePattern[] = [
  {
    id: 'condensation_reveal',
    title: 'Condensation Reveal',
    mechanism: 'Frost/thaw wipe exposing prompt beneath.',
    feel: 'Calm unveiling.',
  },
  {
    id: 'magnetic_assembly',
    title: 'Magnetic Assembly',
    mechanism: 'Fragmented glyphs attract and snap into form.',
    feel: 'Precision lock-in.',
  },
  {
    id: 'depth_surfacing',
    title: 'Depth Surfacing',
    mechanism: 'Blurred deep-layer prompt emerges through Z-axis.',
    feel: 'From distant to present.',
  },
  {
    id: 'typographic_breathing',
    title: 'Typographic Breathing',
    mechanism: 'Variable font axes pulse to resting readability.',
    feel: 'Living language.',
  },
  {
    id: 'ink_drop',
    title: 'Ink Drop',
    mechanism: 'Single impact point blooms text outward.',
    feel: 'Organic emergence.',
  },
  {
    id: 'eclipse_reveal',
    title: 'Eclipse Reveal',
    mechanism: 'Occultation event reveals text at totality.',
    feel: 'Cinematic gravitas.',
  },
  {
    id: 'loom_assembly',
    title: 'Loom Assembly',
    mechanism: 'Light threads weave frame and typography.',
    feel: 'Architectural build.',
  },
] as const;

export const GENESIS_GUARDRAILS: GenesisGuardrails = {
  foundationLocks: [
    'Keep Living Glass, typography system, and atmosphere grammar consistent.',
    'Maintain existing token authority (navicueType, navicueLayout, navicueInteraction).',
    'Hero interactions remain primary; background must never steal focus.',
  ],
  qualityBar: [
    'Every interaction must map cleanly to psychological intent.',
    'No generic fade-only entrances for Genesis-tier specimens.',
    'All cues define explicit release/resolve state with meaningful feedback.',
  ],
  accessibility: [
    'Provide no-sensor fallback path for all hardware-gated interactions.',
    'Respect reduced-motion preferences with equivalent non-animated completion.',
    'Maintain 48px touch targets and text floor at 11px.',
  ],
  performance: [
    'Gracefully degrade GPU effects on low-power devices.',
    'Budget heavy shaders behind interaction-triggered activation windows.',
    'Avoid persistent high-frequency sensor loops when idle.',
  ],
  fallbackRules: [
    'If permission denied: downgrade to touch-only variant preserving psychology.',
    'If WebGL unavailable: swap to CSS/canvas fallback with same interaction verb.',
    'If haptics unavailable: mirror state via visual + audio confirmation.',
  ],
};

export const GENESIS_CREATIVE_CHARTER: GenesisCreativeCharter = {
  nonNegotiables: [
    'Preserve the emotional arc: atmosphere -> arrival -> hero interaction -> resonant landing -> afterglow.',
    'Preserve the living-glass visual language and typographic soul (mono precision + serif emotion).',
    'Preserve psychological integrity: interaction must embody the cue philosophy, not decorate it.',
    'Preserve nervous-system safety: pacing, clarity, and completion states must stay regulating.',
    'Preserve cue individuality: no flattening into one template interaction style.',
  ],
  freedomZones: [
    'Use any rendering strategy (CSS, SVG, Canvas, WebGL, shaders) when intent-to-interaction mapping is clear.',
    'Invent new interaction mechanics beyond the current libraries when they improve emotional truth.',
    'Use bold motion and material metaphors if they remain readable and performance-safe.',
    'Explore sensor/audio/depth layers with graceful fallback paths.',
    'Allow aesthetic surprise and signature moments per cue while honoring the shared grammar.',
  ],
  antiPatterns: [
    'Sterile enterprise UI that removes mystery and emotional depth.',
    'Tech demos that prioritize novelty over therapeutic coherence.',
    'Overly literal copy/mechanics that feel instructional instead of experiential.',
    'Uniform entrances and repeated hero interactions that collapse differentiation.',
    'Hardcoded visual drift that bypasses the design-system tokens and shared contracts.',
  ],
  northStarQuestion:
    'Does this feel like a living, elegant companion that deepens regulation and agency, or just a screen with animations?',
};

export function getGenesisDomain(id: GenesisDomainId): GenesisDomain {
  return GENESIS_DOMAINS.find(domain => domain.id === id)!;
}

export function getHeroPlay(id: HeroPlayId): HeroPlay {
  return HERO_PLAYS.find(play => play.id === id)!;
}

export function getAtmosphere(id: AtmosphereId): AtmosphereProfile {
  return ATMOSPHERE_LIBRARY.find(profile => profile.id === id)!;
}

export function getBackgroundEngine(id: BackgroundEngineId): BackgroundEngine {
  return BACKGROUND_ENGINES.find(engine => engine.id === id)!;
}

export function getEntrancePattern(id: EntrancePatternId): EntrancePattern {
  return ENTRANCE_PATTERNS.find(pattern => pattern.id === id)!;
}

export function validateGenesisCueSpec(spec: GenesisCueSpec): string[] {
  const issues: string[] = [];
  if (!spec.cueId.trim()) issues.push('cueId is required');
  if (!spec.title.trim()) issues.push('title is required');
  if (!spec.psychologicalIntent.trim()) issues.push('psychologicalIntent is required');
  if (!spec.domains.length) issues.push('At least one domain must be selected');
  if (spec.domains.length > 3) issues.push('Use max 3 domains to keep execution focused');
  return issues;
}

export function composeGenesisEngineeringBrief(spec: GenesisCueSpec): string {
  const domainNames = spec.domains.map(id => getGenesisDomain(id).title).join(' + ');
  const hero = getHeroPlay(spec.heroPlay).title;
  const atmosphere = getAtmosphere(spec.atmosphere).title;
  const background = getBackgroundEngine(spec.backgroundEngine).title;
  const entrance = getEntrancePattern(spec.entrancePattern).title;

  return [
    `Cue ${spec.cueId}: ${spec.title}`,
    `Intent: ${spec.psychologicalIntent}`,
    `Domains: ${domainNames}`,
    `Hero Play: ${hero}`,
    `Atmosphere: ${atmosphere}`,
    `Reactive Background: ${background}`,
    `Entrance Pattern: ${entrance}`,
    spec.notes ? `Notes: ${spec.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
