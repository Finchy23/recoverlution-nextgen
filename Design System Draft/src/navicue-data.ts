/**
 * NAVICUE STATIC DATA
 * ===================
 *
 * All static, non-LLM-generated data for the NaviCue Composition Stack.
 * This is the front-end dictionary — the words, timing, and constraints
 * that never drift, never hallucinate, and always hit with Apple-grade precision.
 *
 * ARCHITECTURE:
 *   Types come from ../navicue-types.ts (the contract)
 *   Values live here (the dictionary)
 *
 * CONTENTS:
 *   1. Voice Lane Constraints (5 lanes with rules)
 *   2. Motion Curves (3 easing presets)
 *   3. Materialization Specs (4 text entrance animations)
 *   4. Entrance Specs (8 choreographies)
 *   5. Exit Specs (4 transitions)
 *   6. Color Signatures (8 emotional palettes)
 *   7. Gesture Copy Library (5 voices × 6 gestures = 30 entries)
 *   8. Entrance Copy Library (8 architectures × 5 voices = 40 entries)
 *   9. Exit Copy Library (4 transitions × 5 voices = 20 entries)
 *  10. Vocal Families (30 Pre-Configured Architectural Threads)
 *
 * RULE: Every string here is hand-crafted, not AI-generated.
 * RULE: Every duration is in milliseconds. Every count is a hard limit.
 */

import type {
  VoiceLaneId,
  VoiceLaneConstraints,
  MotionCurve,
  MotionCurveId,
  MaterializationId,
  MaterializationSpec,
  EntranceArchitectureId,
  EntranceSpec,
  ExitTransitionId,
  ExitSpec,
  ColorSignatureId,
  ColorSignature,
  GestureId,
  VocalFamilyId,
  VocalFamily,
} from './navicue-types';

import { colors, withAlpha } from './design-tokens';

// =====================================================================
// 1. VOICE LANE CONSTRAINTS
// =====================================================================

export const VOICE_LANES: Record<VoiceLaneId, VoiceLaneConstraints> = {
  companion: {
    id: 'companion',
    name: 'The Companion',
    vibe: 'Warm, alongside. A hand on the shoulder.',
    wordMax: 10,
    grammarRules: [
      'Uses "We," "Here," "With me"',
      'Never directive — always alongside',
      'Validates the defense mechanism immediately',
    ],
    typographyAffinity: 'secondary',
  },
  coach: {
    id: 'coach',
    name: 'The Coach',
    vibe: 'Direct, encouraging. The locker room at halftime.',
    wordMax: 8,
    grammarRules: [
      'Uses verbs — grounded, forward-facing',
      'No hedging, no qualifiers',
      'Action-oriented sentence structure',
    ],
    typographyAffinity: 'primary',
  },
  mirror: {
    id: 'mirror',
    name: 'The Mirror',
    vibe: 'Reflective, spacious. The Zen Koan.',
    wordMax: 10,
    grammarRules: [
      'Uses questions — forces user to look at themselves',
      'Never provides answers directly',
      'Creates space, not direction',
    ],
    typographyAffinity: 'secondary',
  },
  narrator: {
    id: 'narrator',
    name: 'The Narrator',
    vibe: 'Observational, decentered. Alan Watts looking at a galaxy.',
    wordMax: 12,
    grammarRules: [
      'Third-person only — neutralizes the ego',
      'Poetic, philosophical register',
      'Never uses "you" — always observational',
    ],
    typographyAffinity: 'secondary',
  },
  activator: {
    id: 'activator',
    name: 'The Activator',
    vibe: 'Energetic, brief. Smelling salts.',
    wordMax: 6,
    grammarRules: [
      'Extremely short — pattern-breaking',
      'Imperative mood only',
      'Violence in the verbs (break, shatter, burn)',
    ],
    typographyAffinity: 'mono',
  },
};

export const VOICE_LANE_IDS: VoiceLaneId[] = [
  'companion', 'coach', 'mirror', 'narrator', 'activator',
];

// =====================================================================
// 2. MOTION CURVES
// =====================================================================

export const MOTION_CURVES: Record<MotionCurveId, MotionCurve> = {
  arrival: {
    id: 'arrival',
    cubicBezier: 'cubic-bezier(0.22, 1, 0.36, 1)',
    motionEasing: [0.22, 1, 0.36, 1],
    feel: 'Generous, beautiful deceleration — how insight lands with patience and weight.',
  },
  departure: {
    id: 'departure',
    cubicBezier: 'cubic-bezier(0.55, 0, 1, 0.45)',
    motionEasing: [0.55, 0, 1, 0.45],
    feel: 'Quick, clean, complete — no lingering opacity. How pain leaves the system.',
  },
  spring: {
    id: 'spring',
    cubicBezier: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    motionEasing: [0.34, 1.56, 0.64, 1],
    feel: 'Living, organic 2px overshoot on landing — proves digital mass has weight.',
  },
};

// =====================================================================
// 3. MATERIALIZATION SPECS
// =====================================================================

export const MATERIALIZATIONS: Record<MaterializationId, MaterializationSpec> = {
  emerge: {
    id: 'emerge',
    durationMs: 1200,
    feel: 'Rises softly from the depth. Trusting gravity. Gentle realizations.',
    animation: {
      opacityFrom: 0,
      opacityTo: 1,
    },
  },
  dissolve: {
    id: 'dissolve',
    durationMs: 2000,
    feel: 'Fades slowly into nothingness. Letting go of rigid thoughts.',
    animation: {
      opacityFrom: 1,
      opacityTo: 0,
      blurFrom: 0,
    },
  },
  'burn-in': {
    id: 'burn-in',
    durationMs: 800,
    feel: 'Contrast drops, brightness spikes, locks into pure white. Hard truths.',
    animation: {
      opacityFrom: 0.3,
      opacityTo: 1,
      brightnessSpike: 2.0,
    },
  },
  immediate: {
    id: 'immediate',
    durationMs: 0,
    feel: 'A sudden snap. 0ms. Pattern disruption. Smelling salts.',
    animation: {
      opacityFrom: 1,
      opacityTo: 1,
    },
  },
};

/** The 800ms Rule: text waits this long after atmosphere renders */
export const ATMOSPHERE_SETTLE_MS = 800;

// =====================================================================
// 4. ENTRANCE SPECS
// =====================================================================

export const ENTRANCES: Record<EntranceArchitectureId, EntranceSpec> = {
  'the-silence': {
    id: 'the-silence',
    phaseSequence: ['void', 'signal', 'void', 'reveal'],
    durationMs: 7000,
    vibe: 'The double absence. Void, a single word, void again, then the reveal. The ego goes offline in the gap.',
    requiresUserAction: false,
    copyMode: 'ceremony',
  },
  'the-breath-gate': {
    id: 'the-breath-gate',
    phaseSequence: ['atmosphere', 'signal', 'reveal'],
    durationMs: 8000,
    vibe: 'Somatic entrainment. The atmosphere blooms but the door only opens when the breath lands. Body-first.',
    requiresUserAction: true,
    copyMode: 'ceremony',
  },
  'the-dissolution': {
    id: 'the-dissolution',
    phaseSequence: ['signal', 'reveal'],
    durationMs: 4800,
    vibe: 'Signal-first. Text arrives through blur and slowly defocuses into clarity. The defrost IS the teaching.',
    requiresUserAction: false,
    copyMode: 'hero-voice',
  },
  'the-scene-build': {
    id: 'the-scene-build',
    phaseSequence: ['void', 'atmosphere', 'signal', 'reveal'],
    durationMs: 6000,
    vibe: 'The full ceremony. Void clears the room, atmosphere rebuilds it, signal arrives. The most cinematic entrance.',
    requiresUserAction: false,
    copyMode: 'ceremony',
  },
  'the-emergence': {
    id: 'the-emergence',
    phaseSequence: ['atmosphere', 'signal', 'reveal'],
    durationMs: 4000,
    vibe: 'Vertical excavation. Atmosphere holds space while content rises from the depth. Truth surfaces upward.',
    requiresUserAction: false,
    copyMode: 'hero-voice',
  },
  'the-gathering': {
    id: 'the-gathering',
    phaseSequence: ['atmosphere', 'signal', 'reveal'],
    durationMs: 5000,
    vibe: 'Horizontal convergence. Scattered fragments pull inward. Chaos organizes itself into coherent meaning.',
    requiresUserAction: false,
    copyMode: 'hero-voice',
  },
  'the-threshold': {
    id: 'the-threshold',
    phaseSequence: ['atmosphere', 'signal', 'interaction', 'reveal'],
    durationMs: 0, // User-driven — no fixed duration
    vibe: 'The chosen crossing. Atmosphere and signal prepare the line, but the user must decide to step over it.',
    requiresUserAction: true,
    copyMode: 'ceremony',
  },
  'cold-arrival': {
    id: 'cold-arrival',
    phaseSequence: ['reveal'],
    durationMs: 0,
    vibe: 'No ceremony. No buildup. The reveal IS the entrance. Pattern disruption as therapeutic intervention.',
    requiresUserAction: false,
    copyMode: 'silent',
  },
};

export const ENTRANCE_IDS: EntranceArchitectureId[] = [
  'the-silence', 'the-breath-gate', 'the-dissolution', 'the-scene-build',
  'the-emergence', 'the-gathering', 'the-threshold', 'cold-arrival',
];

// =====================================================================
// 5. EXIT SPECS
// =====================================================================

export const EXITS: Record<ExitTransitionId, ExitSpec> = {
  dissolve: {
    id: 'dissolve',
    durationMs: 2000,
    finalState: 'void',
    vibe: 'Slow fade to void. Relief, decentering, and letting go. The intervention dissolves so the insight remains.',
  },
  'burn-in': {
    id: 'burn-in',
    durationMs: 800,
    finalState: 'white',
    vibe: 'Contrast drops, brightness spikes, locks to white. The hard truth seared into memory. Permanent.',
  },
  emerge: {
    id: 'emerge',
    durationMs: 1500,
    finalState: 'atmosphere',
    vibe: 'Elements rise softly into atmosphere. Hope lingers. The exit feels like a beginning, not an ending.',
  },
  immediate: {
    id: 'immediate',
    durationMs: 0,
    finalState: 'frozen',
    vibe: 'Instant snap. Zero transition. The abruptness IS the therapeutic intervention. Smelling salts.',
  },
};

export const EXIT_IDS: ExitTransitionId[] = [
  'dissolve', 'burn-in', 'emerge', 'immediate',
];

// =====================================================================
// 6. COLOR SIGNATURES (8 emotional palettes)
// =====================================================================

export const COLOR_SIGNATURES: Record<ColorSignatureId, ColorSignature> = {
  'sacred-ordinary': {
    id: 'sacred-ordinary',
    name: 'Sacred Ordinary',
    primary: colors.signature.sacredOrdinary,
    accent: withAlpha(colors.signature.sacredOrdinary, 0.35),
    glow: withAlpha(colors.signature.sacredOrdinary, 0.12),
    surface: withAlpha(colors.signature.sacredOrdinary, 0.06),
    secondary: withAlpha(colors.signature.warmProvocation, 0.08),
  },
  'quiet-authority': {
    id: 'quiet-authority',
    name: 'Quiet Authority',
    primary: colors.brand.purple.primary,
    accent: withAlpha(colors.brand.purple.primary, 0.35),
    glow: withAlpha(colors.brand.purple.light, 0.12),
    surface: withAlpha(colors.brand.purple.primary, 0.06),
    secondary: withAlpha(colors.brand.purple.dark, 0.15),
  },
  'neural-reset': {
    id: 'neural-reset',
    name: 'Neural Reset',
    primary: colors.accent.cyan.primary,
    accent: withAlpha(colors.accent.cyan.primary, 0.35),
    glow: withAlpha(colors.accent.cyan.primary, 0.12),
    surface: withAlpha(colors.accent.cyan.primary, 0.06),
    secondary: withAlpha(colors.accent.blue.primary, 0.12),
  },
  'amber-resonance': {
    id: 'amber-resonance',
    name: 'Amber Resonance',
    primary: colors.signature.warmProvocation,
    accent: withAlpha(colors.signature.warmProvocation, 0.35),
    glow: withAlpha(colors.signature.warmProvocation, 0.12),
    surface: withAlpha(colors.signature.warmProvocation, 0.06),
    secondary: withAlpha(colors.signature.sacredOrdinary, 0.1),
  },
  'void-presence': {
    id: 'void-presence',
    name: 'Void Presence',
    primary: colors.neutral.white,
    accent: withAlpha(colors.neutral.white, 0.15),
    glow: withAlpha(colors.neutral.white, 0.04),
    surface: withAlpha(colors.neutral.white, 0.02),
    secondary: withAlpha(colors.neutral.white, 0.01),
  },
  'verdant-calm': {
    id: 'verdant-calm',
    name: 'Verdant Calm',
    primary: colors.accent.green.primary,
    accent: withAlpha(colors.accent.green.primary, 0.35),
    glow: withAlpha(colors.accent.green.primary, 0.12),
    surface: withAlpha(colors.accent.green.primary, 0.06),
    secondary: withAlpha(colors.accent.cyan.primary, 0.08),
  },
  'twilight-shift': {
    id: 'twilight-shift',
    name: 'Twilight Shift',
    primary: colors.brand.purple.light,
    accent: withAlpha(colors.brand.purple.light, 0.30),
    glow: withAlpha(colors.ui.gateRose, 0.08),
    surface: withAlpha(colors.brand.purple.light, 0.05),
    secondary: withAlpha(colors.ui.gateRose, 0.06),
  },
  'radiant-white': {
    id: 'radiant-white',
    name: 'Radiant White',
    primary: colors.ui.pureWhite,
    accent: withAlpha(colors.ui.pureWhite, 0.25),
    glow: withAlpha(colors.ui.pureWhite, 0.08),
    surface: withAlpha(colors.ui.pureWhite, 0.03),
    secondary: withAlpha(colors.neutral.white, 0.02),
  },
};

export const COLOR_SIGNATURE_IDS: ColorSignatureId[] = [
  'sacred-ordinary', 'quiet-authority', 'neural-reset', 'amber-resonance',
  'void-presence', 'verdant-calm', 'twilight-shift', 'radiant-white',
];

// =====================================================================
// 7. GESTURE COPY LIBRARY (5 voices × 6 gestures)
// =====================================================================
// These are pulled from the local dictionary — never LLM-generated.
// The kinetic verb must match the physics.

export const GESTURE_COPY: Record<GestureId, Record<VoiceLaneId, string>> = {
  tap: {
    companion: 'Gently tap the glass.',
    coach: 'Tap to break the loop.',
    mirror: 'What happens if you touch it?',
    narrator: 'A single touch shifts the geometry.',
    activator: 'Shatter it. Now.',
  },
  hold: {
    companion: 'Rest your thumb here with me.',
    coach: 'Hold the center. Do not flinch.',
    mirror: 'Can you sit with this heavy feeling?',
    narrator: 'The weight settles beneath the finger.',
    activator: 'Anchor down. Hold it.',
  },
  swipe: {
    companion: 'Let\'s let this old story go.',
    coach: 'Swipe to cut the cord.',
    mirror: 'Watch the judgment turn to ash.',
    narrator: 'The friction erases the illusion.',
    activator: 'Incinerate it.',
  },
  pinch: {
    companion: 'Let\'s look a little deeper.',
    coach: 'Zoom out. See the whole board.',
    mirror: 'What is hiding underneath this word?',
    narrator: 'The aperture widens to the truth.',
    activator: 'Pull back. Drop the drama.',
  },
  breathe: {
    companion: 'Breathe with me. Slowly.',
    coach: 'One deep exhale. Let the tension drop.',
    mirror: 'What sound does this tension make?',
    narrator: 'The exhale carries what the mind cannot.',
    activator: 'Exhale. Hard.',
  },
  drag: {
    companion: 'We can move this together.',
    coach: 'Drag it to the center.',
    mirror: 'Where does it want to go?',
    narrator: 'The path reveals itself in motion.',
    activator: 'Pull it apart.',
  },
};

// ── Ping gesture (special case — maps to tap internally) ────────────
// "Tap the beat of your pulse" / "Match my rhythm" etc.
// These are used when atoms require rhythmic sequential tapping.
export const PING_COPY: Record<VoiceLaneId, string> = {
  companion: 'Match my rhythm. You are safe.',
  coach: 'Tap the beat of your pulse.',
  mirror: 'Notice the silence between the strikes.',
  narrator: 'A steady rhythm restores the system.',
  activator: 'Sync up. Lock in.',
};

// =====================================================================
// 8. Entrance Copy Library (8 architectures × 5 voices = 40 entries)
// =====================================================================
// Full 8 × 5 matrix. Every entrance works with every voice lane.
// Each pairing is psychologically tuned to how THAT voice would open
// THAT particular entrance choreography.

export const ENTRANCE_COPY: Record<EntranceArchitectureId, Partial<Record<VoiceLaneId, {
  text: string;
  followText?: string;
  materialization: MaterializationId;
}>>> = {
  'the-silence': {
    companion: {
      text: 'We do not need words yet.',
      followText: 'Just this space.',
      materialization: 'emerge',
    },
    coach: {
      text: 'The noise is not your signal.',
      followText: 'Wait for clarity.',
      materialization: 'emerge',
    },
    mirror: {
      text: 'Listen to the silence...',
      followText: '...behind the noise.',
      materialization: 'dissolve',
    },
    narrator: {
      text: 'The volume is so high today.',
      followText: 'Let it fade.',
      materialization: 'emerge',
    },
    activator: {
      text: 'Stop.',
      followText: 'Everything. Listen.',
      materialization: 'immediate',
    },
  },
  'the-breath-gate': {
    companion: {
      text: 'I know it feels heavy. Breathe the door open.',
      materialization: 'emerge',
    },
    coach: {
      text: 'Your mind is moving too fast. Anchor the breath.',
      materialization: 'immediate',
    },
    mirror: {
      text: 'Where does the breath catch?',
      materialization: 'emerge',
    },
    narrator: {
      text: 'The atmosphere shifts when the exhale lands.',
      materialization: 'emerge',
    },
    activator: {
      text: 'Blow the door open.',
      materialization: 'immediate',
    },
  },
  'the-dissolution': {
    companion: {
      text: 'That thought is not you. Watch it dissolve.',
      materialization: 'dissolve',
    },
    coach: {
      text: 'The story is blurring because it is not true.',
      materialization: 'burn-in',
    },
    mirror: {
      text: 'Is this a fact, or just a familiar memory?',
      materialization: 'burn-in',
    },
    narrator: {
      text: 'The panic is a lens. Take it off.',
      materialization: 'emerge',
    },
    activator: {
      text: 'Fake. Dissolve it.',
      materialization: 'immediate',
    },
  },
  'the-scene-build': {
    companion: {
      text: 'You are safe here. Put the armor down.',
      materialization: 'emerge',
    },
    coach: {
      text: 'We are building the container. Trust the process.',
      materialization: 'emerge',
    },
    mirror: {
      text: 'What kind of room does this feeling need?',
      materialization: 'emerge',
    },
    narrator: {
      text: 'The void reshapes itself into a refuge.',
      materialization: 'emerge',
    },
    activator: {
      text: 'Reset the room. Start over.',
      materialization: 'immediate',
    },
  },
  'the-emergence': {
    companion: {
      text: 'Something wants to surface. Let it come.',
      materialization: 'emerge',
    },
    coach: {
      text: 'The anger is just a bodyguard. Let us see what it protects.',
      materialization: 'emerge',
    },
    mirror: {
      text: 'What have you been pushing down?',
      materialization: 'emerge',
    },
    narrator: {
      text: 'Beneath the noise, the truth is very quiet.',
      materialization: 'emerge',
    },
    activator: {
      text: 'It is coming up. Let it.',
      materialization: 'burn-in',
    },
  },
  'the-gathering': {
    companion: {
      text: 'All those pieces? They belong to the same thing.',
      materialization: 'emerge',
    },
    coach: {
      text: 'You are scattered. Pull the pieces to the center.',
      materialization: 'emerge',
    },
    mirror: {
      text: 'What pattern do the fragments make?',
      materialization: 'emerge',
    },
    narrator: {
      text: 'The fragments remember where they belong.',
      materialization: 'emerge',
    },
    activator: {
      text: 'Stop spinning. Gather the energy.',
      materialization: 'burn-in',
    },
  },
  'the-threshold': {
    companion: {
      text: 'Leave the heavy things on this side of the line.',
      materialization: 'emerge',
    },
    coach: {
      text: 'The door is open. Walk through it.',
      materialization: 'emerge',
    },
    mirror: {
      text: 'What are you leaving behind?',
      materialization: 'emerge',
    },
    narrator: {
      text: 'A threshold appears only for those ready to cross.',
      materialization: 'emerge',
    },
    activator: {
      text: 'You cannot heal in the room that broke you. Step out.',
      materialization: 'immediate',
    },
  },
  'cold-arrival': {
    companion: {
      text: 'I have been here the whole time.',
      materialization: 'immediate',
    },
    coach: {
      text: 'No buildup. The work starts now.',
      materialization: 'immediate',
    },
    mirror: {
      text: 'You are predicting a tragedy that has not happened.',
      materialization: 'immediate',
    },
    narrator: {
      text: 'The ego demands certainty. The universe refuses.',
      materialization: 'immediate',
    },
    activator: {
      text: 'Wake up.',
      materialization: 'immediate',
    },
  },
};

// =====================================================================
// 9. EXIT COPY LIBRARY (4 transitions × 5 voices = 20 receipts)
// =====================================================================
// The final somatic save-state. A stamp on the brain, not a lecture.
// Every receipt respects the exit's Typographic Throttle: max 10 words, 55 chars.

export const EXIT_COPY: Record<ExitTransitionId, Record<VoiceLaneId, string>> = {
  dissolve: {
    companion: 'You showed up. That was the hard part.',
    coach: 'Tension released. Carry this lightness forward.',
    mirror: 'Where did the heavy feeling go?',
    narrator: 'The illusion fades. The vast sky remains.',
    activator: 'Done. Move on.',
  },
  'burn-in': {
    companion: 'This truth is yours now. Hold it gently.',
    coach: 'The foundation is set. Go build on it.',
    mirror: 'You were never the broken thing.',
    narrator: 'The architecture of the mind is rewritten.',
    activator: 'Truth locked. Execute.',
  },
  emerge: {
    companion: 'There it is. We found the quiet again.',
    coach: 'You hold the pen. Write the next line.',
    mirror: 'A new choice is now possible.',
    narrator: 'The water settles into perfect, still glass.',
    activator: 'Space cleared. Mind sharp.',
  },
  immediate: {
    companion: 'I am right here.',
    coach: 'The loop is broken.',
    mirror: 'What was that really about?',
    narrator: 'Silence.',
    activator: 'You are here. Now.',
  },
};

// =====================================================================
// WORKED EXAMPLE: ATOM 112 (Micro-Step Engine) × 5 Voices
// =====================================================================
// This is the reference composition from the Entrance Matrix document.
// Used for testing the player — proves all 7 layers compose correctly.

export const ATOM_112_WORKED_EXAMPLES: Record<VoiceLaneId, {
  entrance: EntranceArchitectureId;
  entranceCopy: string;
  metacognitiveTag: string;
  ambientSubtext: string;
  anchorPrompt: string;
  kineticPayload: string;
  /** Either reactive friction states or progressive sequence steps */
  midInteraction: { type: 'friction'; start: string; mid: string; max: string } |
                  { type: 'sequence'; steps: string[] };
  shadowNode?: string;
  thresholdShift: { before: string; after: string };
  gestureLabel: string;
  exit: ExitTransitionId;
  exitCopy: string;
}> = {
  companion: {
    entrance: 'the-scene-build',
    entranceCopy: 'It feels like too much today. Let\'s make it smaller.',
    metacognitiveTag: 'STATE: OVERWHELM',
    ambientSubtext: 'i can\'t carry this it\'s too heavy',
    anchorPrompt: 'We don\'t have to carry the whole thing.',
    kineticPayload: 'THE BURDEN',
    midInteraction: {
      type: 'friction',
      start: 'A little lighter...',
      mid: 'Almost there...',
      max: 'Just this piece.',
    },
    thresholdShift: { before: 'THE BURDEN', after: 'THE  STEP ' },
    gestureLabel: 'FLICK TO START',
    exit: 'emerge',
    exitCopy: 'Just one step. I am right here with you.',
  },
  coach: {
    entrance: 'cold-arrival',
    entranceCopy: 'Paralysis is just a math problem. Break the math.',
    metacognitiveTag: 'FRICTION: MAXIMUM',
    ambientSubtext: 'i don\'t know where to start',
    anchorPrompt: 'The mountain is an illusion. Find the rock.',
    kineticPayload: 'THE MOUNTAIN',
    midInteraction: {
      type: 'sequence',
      steps: ['Strike', 'Fracture', 'Reduce', 'Isolate'],
    },
    thresholdShift: { before: 'THE MOUNTAIN', after: 'THE  PEBBLE' },
    gestureLabel: 'CLEAR IT',
    exit: 'burn-in',
    exitCopy: 'Momentum is a choice. Keep moving.',
  },
  mirror: {
    entrance: 'the-dissolution',
    entranceCopy: 'Why do we build walls we cannot climb?',
    metacognitiveTag: 'LENS: MAGNIFICATION',
    ambientSubtext: 'it has to be perfect',
    anchorPrompt: 'If you change the scale, does the fear remain?',
    kineticPayload: 'THE IMPOSSIBLE',
    midInteraction: {
      type: 'friction',
      start: 'Look closer...',
      mid: 'What changes?',
      max: 'Was it ever real?',
    },
    shadowNode: 'Just an idea.',
    thresholdShift: { before: 'THE IMPOSSIBLE', after: 'THE  POSSIBLE' },
    gestureLabel: 'TAP TO RELEASE',
    exit: 'dissolve',
    exitCopy: 'How heavy was it, really?',
  },
  narrator: {
    entrance: 'the-silence',
    entranceCopy: 'The ego looks at the horizon and despairs.',
    metacognitiveTag: 'LAW: ENTROPY',
    ambientSubtext: 'forever forever forever',
    anchorPrompt: 'Time erodes all rigid structures into dust.',
    kineticPayload: 'THE MONOLITH',
    midInteraction: {
      type: 'friction',
      start: 'Eroding...',
      mid: 'Crumbling...',
      max: 'Dust.',
    },
    thresholdShift: { before: 'THE MONOLITH', after: 'THE   GRAIN ' },
    gestureLabel: 'SWIPE TO SCATTER',
    exit: 'dissolve',
    exitCopy: 'Even the highest mountains are swept away by the wind.',
  },
  activator: {
    entrance: 'the-threshold',
    entranceCopy: 'Stop staring at it. Break it.',
    metacognitiveTag: 'SYS.PARALYSIS_LOCKED',
    ambientSubtext: 'freeze freeze freeze',
    anchorPrompt: 'You are choosing to be stuck. Hit the glass.',
    kineticPayload: 'THE EXCUSE',
    midInteraction: {
      type: 'sequence',
      steps: ['Break', 'Break', 'Break', 'Gone'],
    },
    thresholdShift: { before: 'THE EXCUSE', after: 'THE ACTION' },
    gestureLabel: 'EXECUTE',
    exit: 'immediate',
    exitCopy: 'No more waiting. Go.',
  },
};

// =====================================================================
// 10. VOCAL FAMILIES (30 Pre-Configured Architectural Threads)
// =====================================================================
// Each family is a composition preset that auto-fills all voice/entrance/
// exit/gesture/breath/color dials simultaneously.
// Data sourced from the Vocal Families specification document.

export const VOCAL_FAMILIES: Record<VocalFamilyId, VocalFamily> = {
  // ── PRIMARY (1–10) ─────────────────────────────────────────

  'the-downshift': {
    id: 'the-downshift', number: 1, name: 'The Downshift', tier: 'primary',
    goal: 'Arrest panic, soothe acute anxiety, restore autonomic baseline.',
    clinicalTarget: 'High Heat (Level 4-5)',
    heatRange: [4, 5], schemas: ['defectiveness', 'abandonment', 'vulnerability'],
    vibe: 'A warm blanket in a cold room. A steady hand on the chest.',
    voiceAnchor: 'companion', colorSignature: 'sacred-ordinary', visualEngine: 'gradient-mesh',
    entrance: 'the-breath-gate', gesture: 'hold', exit: 'emerge', breathPattern: 'energize',
  },
  'the-disruption': {
    id: 'the-disruption', number: 2, name: 'The Disruption', tier: 'primary',
    goal: 'Break the rumination loop. Snap out of paralysis or addiction urgency.',
    clinicalTarget: 'Medium/High Heat (Level 3-4)',
    heatRange: [3, 4], schemas: ['negativity', 'subjugation'],
    vibe: 'Smelling salts. High-voltage clarity. The locker room at halftime.',
    voiceAnchor: 'activator', colorSignature: 'neural-reset', visualEngine: 'particle-field',
    entrance: 'cold-arrival', gesture: 'swipe', exit: 'burn-in', breathPattern: 'simple',
  },
  'the-witness': {
    id: 'the-witness', number: 3, name: 'The Witness', tier: 'primary',
    goal: 'Cognitive defusion. Dissolving the ego. Curing perfectionism.',
    clinicalTarget: 'Low/Medium Heat (Level 1-3)',
    heatRange: [1, 3], schemas: ['unrelenting-standards', 'punitiveness'],
    vibe: 'Alan Watts. The Zen Koan. Looking at a galaxy.',
    voiceAnchor: 'mirror', colorSignature: 'void-presence', visualEngine: 'void',
    entrance: 'the-silence', gesture: 'pinch', exit: 'dissolve', breathPattern: 'calm',
  },
  'the-architect': {
    id: 'the-architect', number: 4, name: 'The Architect', tier: 'primary',
    goal: 'Future-self orientation, boundary setting, identity integration.',
    clinicalTarget: 'Low/Medium Heat (Level 1-2)',
    heatRange: [1, 2], schemas: ['enmeshment', 'approval-seeking'],
    vibe: 'Cathedral building. Geological time. Unshakeable sovereignty.',
    voiceAnchor: 'coach', colorSignature: 'quiet-authority', visualEngine: 'constellation',
    entrance: 'the-gathering', gesture: 'tap', exit: 'emerge', breathPattern: 'calm',
  },
  'the-surgeon': {
    id: 'the-surgeon', number: 5, name: 'The Surgeon', tier: 'primary',
    goal: 'Tactical decoupling. Isolating toxic thoughts or cognitive distortions.',
    clinicalTarget: 'Medium Heat (Level 3)',
    heatRange: [3, 3], schemas: ['emotional-inhibition', 'negativity'],
    vibe: 'Clinical, sterile, highly precise. The operating table.',
    voiceAnchor: 'coach', colorSignature: 'neural-reset', visualEngine: 'noise-fabric',
    entrance: 'the-threshold', gesture: 'pinch', exit: 'immediate', breathPattern: 'simple',
  },
  'the-alchemist': {
    id: 'the-alchemist', number: 6, name: 'The Alchemist', tier: 'primary',
    goal: 'Overcome creative block, induce flow states, synthesize new meaning.',
    clinicalTarget: 'Low Heat (Level 1-2)',
    heatRange: [1, 2], schemas: ['failure', 'approval-seeking'],
    vibe: 'Spark, kinetic play, combinatorial magic. The artist\'s studio.',
    voiceAnchor: 'activator', colorSignature: 'amber-resonance', visualEngine: 'liquid-pool',
    entrance: 'the-scene-build', gesture: 'drag', exit: 'emerge', breathPattern: 'calm',
  },
  'the-purge': {
    id: 'the-purge', number: 7, name: 'The Purge', tier: 'primary',
    goal: 'Catharsis. Releasing pent-up grief, rage, or profound shame.',
    clinicalTarget: 'High Heat (Level 4-5)',
    heatRange: [4, 5], schemas: ['punitiveness', 'vulnerability'],
    vibe: 'Burning away. Violent release. The furnace.',
    voiceAnchor: 'activator', colorSignature: 'amber-resonance', visualEngine: 'particle-field',
    entrance: 'cold-arrival', gesture: 'swipe', exit: 'burn-in', breathPattern: 'energize',
  },
  'the-archaeologist': {
    id: 'the-archaeologist', number: 8, name: 'The Archaeologist', tier: 'primary',
    goal: 'Shadow work. Safely exploring deep, repressed subconscious fears.',
    clinicalTarget: 'Medium Heat (Level 2-3)',
    heatRange: [2, 3], schemas: ['defectiveness', 'emotional-inhibition'],
    vibe: 'Descending into the dark. Lantern light. Safe curiosity.',
    voiceAnchor: 'companion', colorSignature: 'void-presence', visualEngine: 'noise-fabric',
    entrance: 'the-dissolution', gesture: 'hold', exit: 'dissolve', breathPattern: 'box',
  },
  'the-anchor': {
    id: 'the-anchor', number: 9, name: 'The Anchor', tier: 'primary',
    goal: 'Curing existential dread. Grounding in deep, macro-time.',
    clinicalTarget: 'Medium/High Heat (Level 3-4)',
    heatRange: [3, 4], schemas: ['vulnerability', 'abandonment'],
    vibe: 'Geological weight. The root of the mountain. Eternal gravity.',
    voiceAnchor: 'narrator', colorSignature: 'sacred-ordinary', visualEngine: 'gradient-mesh',
    entrance: 'the-silence', gesture: 'hold', exit: 'burn-in', breathPattern: 'calm',
  },
  'the-weaver': {
    id: 'the-weaver', number: 10, name: 'The Weaver', tier: 'primary',
    goal: 'Integration. Healing cognitive dissonance. Bringing fragments together.',
    clinicalTarget: 'Low/Medium Heat (Level 2)',
    heatRange: [2, 2], schemas: ['emotional-inhibition', 'entitlement'],
    vibe: 'Golden repair. Harmonic resonance. Bringing the pieces home.',
    voiceAnchor: 'companion', colorSignature: 'sacred-ordinary', visualEngine: 'constellation',
    entrance: 'the-gathering', gesture: 'drag', exit: 'emerge', breathPattern: 'simple',
  },

  // ── SECONDARY (11–20) ──────────────────────────────────────

  'the-lullaby': {
    id: 'the-lullaby', number: 11, name: 'The Lullaby', tier: 'secondary',
    goal: 'Cure insomnia and night-time rumination by inducing hypnagogic state.',
    clinicalTarget: 'High Heat (Level 3-4)',
    heatRange: [3, 4], schemas: ['vulnerability', 'unrelenting-standards'],
    vibe: 'The heavy eyelid. Sinking into deep water. The twilight zone.',
    voiceAnchor: 'companion', colorSignature: 'void-presence', visualEngine: 'gradient-mesh',
    entrance: 'the-dissolution', gesture: 'breathe', exit: 'dissolve', breathPattern: 'energize',
  },
  'the-crucible': {
    id: 'the-crucible', number: 12, name: 'The Crucible', tier: 'secondary',
    goal: 'Building grit. Training the user to sit with massive discomfort.',
    clinicalTarget: 'High Heat (Level 4)',
    heatRange: [4, 4], schemas: ['insufficient-self-control', 'entitlement'],
    vibe: 'The weight room. Holding a heavy physical load. Trembling but holding.',
    voiceAnchor: 'coach', colorSignature: 'neural-reset', visualEngine: 'liquid-pool',
    entrance: 'cold-arrival', gesture: 'hold', exit: 'burn-in', breathPattern: 'box',
  },
  'the-prism': {
    id: 'the-prism', number: 13, name: 'The Prism', tier: 'secondary',
    goal: 'Cognitive reframing. Forcing a literal shift in perspective.',
    clinicalTarget: 'Medium Heat (Level 2-3)',
    heatRange: [2, 3], schemas: ['negativity', 'unrelenting-standards'],
    vibe: 'Turning a gem in the light. Optical illusion. A sudden Aha moment.',
    voiceAnchor: 'mirror', colorSignature: 'twilight-shift', visualEngine: 'constellation',
    entrance: 'the-scene-build', gesture: 'swipe', exit: 'emerge', breathPattern: 'simple',
  },
  'the-metronome': {
    id: 'the-metronome', number: 14, name: 'The Metronome', tier: 'secondary',
    goal: 'Curing executive dysfunction and paralysis. Entraining focus and rhythm.',
    clinicalTarget: 'Medium Heat (Level 3)',
    heatRange: [3, 3], schemas: ['failure', 'subjugation'],
    vibe: 'The ticking clock. A tightening aperture. The starting gun.',
    voiceAnchor: 'activator', colorSignature: 'quiet-authority', visualEngine: 'noise-fabric',
    entrance: 'the-threshold', gesture: 'tap', exit: 'immediate', breathPattern: 'simple',
  },
  'the-pendulum': {
    id: 'the-pendulum', number: 15, name: 'The Pendulum', tier: 'secondary',
    goal: 'Finding the middle path. Treating all-or-nothing emotional splitting.',
    clinicalTarget: 'High Heat (Level 4)',
    heatRange: [4, 4], schemas: ['abandonment', 'punitiveness'],
    vibe: 'Swinging momentum settling into dead center. The scales balancing.',
    voiceAnchor: 'narrator', colorSignature: 'void-presence', visualEngine: 'particle-field',
    entrance: 'the-gathering', gesture: 'pinch', exit: 'dissolve', breathPattern: 'calm',
  },
  'the-sieve': {
    id: 'the-sieve', number: 16, name: 'The Sieve', tier: 'secondary',
    goal: 'Reducing cognitive load. Filtering overwhelm from outside noise.',
    clinicalTarget: 'Medium Heat (Level 3)',
    heatRange: [3, 3], schemas: ['enmeshment', 'vulnerability'],
    vibe: 'Panning for gold. Sand falling through a mesh. Stark reduction.',
    voiceAnchor: 'coach', colorSignature: 'radiant-white', visualEngine: 'particle-field',
    entrance: 'the-scene-build', gesture: 'swipe', exit: 'burn-in', breathPattern: 'simple',
  },
  'the-decoupler': {
    id: 'the-decoupler', number: 17, name: 'The Decoupler', tier: 'secondary',
    goal: 'Separating past trauma response from present-day safe reality.',
    clinicalTarget: 'High Heat (Level 4)',
    heatRange: [4, 4], schemas: ['mistrust', 'emotional-inhibition'],
    vibe: 'Untying a knot. Precision mechanics. Unhooking a heavy chain.',
    voiceAnchor: 'companion', colorSignature: 'verdant-calm', visualEngine: 'constellation',
    entrance: 'the-breath-gate', gesture: 'drag', exit: 'dissolve', breathPattern: 'calm',
  },
  'the-chasm': {
    id: 'the-chasm', number: 18, name: 'The Chasm', tier: 'secondary',
    goal: 'Overcoming fear of failure before taking a major risk.',
    clinicalTarget: 'Medium/High Heat (Level 3-4)',
    heatRange: [3, 4], schemas: ['failure', 'approval-seeking'],
    vibe: 'Standing on the edge. The deep breath before the jump. Zero gravity.',
    voiceAnchor: 'activator', colorSignature: 'void-presence', visualEngine: 'void',
    entrance: 'the-threshold', gesture: 'swipe', exit: 'immediate', breathPattern: 'energize',
  },
  'the-compass': {
    id: 'the-compass', number: 19, name: 'The Compass', tier: 'secondary',
    goal: 'Finding true north when paralyzed by a difficult decision.',
    clinicalTarget: 'Low Heat (Level 2)',
    heatRange: [2, 2], schemas: ['subjugation', 'unrelenting-standards'],
    vibe: 'Magnetic alignment. The needle locking in. Deep resonance.',
    voiceAnchor: 'mirror', colorSignature: 'sacred-ordinary', visualEngine: 'gradient-mesh',
    entrance: 'the-gathering', gesture: 'pinch', exit: 'burn-in', breathPattern: 'calm',
  },
  'the-kintsugi': {
    id: 'the-kintsugi', number: 20, name: 'The Kintsugi', tier: 'secondary',
    goal: 'Radical self-acceptance. Treating broken parts as beautiful.',
    clinicalTarget: 'High Heat (Level 4-5)',
    heatRange: [4, 5], schemas: ['defectiveness', 'punitiveness'],
    vibe: 'Golden repair. Utter gentleness. The sacred artifact.',
    voiceAnchor: 'companion', colorSignature: 'amber-resonance', visualEngine: 'liquid-pool',
    entrance: 'the-scene-build', gesture: 'drag', exit: 'emerge', breathPattern: 'calm',
  },

  // ── TERTIARY (21–30) ───────────────────────────────────────

  'the-tether': {
    id: 'the-tether', number: 21, name: 'The Tether', tier: 'tertiary',
    goal: 'Soothing anxious attachment panic. Returning energy to center.',
    clinicalTarget: 'High Heat (Level 4)',
    heatRange: [4, 4], schemas: ['abandonment', 'subjugation'],
    vibe: 'Cutting the invisible string. Reeling the energy back in.',
    voiceAnchor: 'coach', colorSignature: 'neural-reset', visualEngine: 'particle-field',
    entrance: 'the-threshold', gesture: 'swipe', exit: 'burn-in', breathPattern: 'box',
  },
  'the-grounding-wire': {
    id: 'the-grounding-wire', number: 22, name: 'The Grounding Wire', tier: 'tertiary',
    goal: 'Pulling the user back into their body during dissociation.',
    clinicalTarget: 'High Heat (Level 4-5)',
    heatRange: [4, 5], schemas: ['vulnerability', 'emotional-inhibition'],
    vibe: 'Heavy gravity. The thud of reality. A warm blanket.',
    voiceAnchor: 'companion', colorSignature: 'sacred-ordinary', visualEngine: 'noise-fabric',
    entrance: 'the-gathering', gesture: 'tap', exit: 'emerge', breathPattern: 'simple',
  },
  'the-forge': {
    id: 'the-forge', number: 23, name: 'The Forge', tier: 'tertiary',
    goal: 'Metabolizing fresh failure into immediate antifragility.',
    clinicalTarget: 'Medium/High Heat (Level 3-4)',
    heatRange: [3, 4], schemas: ['failure', 'defectiveness'],
    vibe: 'Hammer striking hot iron. Bending but not breaking.',
    voiceAnchor: 'activator', colorSignature: 'amber-resonance', visualEngine: 'liquid-pool',
    entrance: 'cold-arrival', gesture: 'hold', exit: 'immediate', breathPattern: 'simple',
  },
  'the-tuning-fork': {
    id: 'the-tuning-fork', number: 24, name: 'The Tuning Fork', tier: 'tertiary',
    goal: 'Resolving the conflict between anxious overthinking and deep intuition.',
    clinicalTarget: 'Low/Medium Heat (Level 2-3)',
    heatRange: [2, 3], schemas: ['mistrust', 'enmeshment'],
    vibe: 'Finding the resonant frequency. Harmonics. Perfect alignment.',
    voiceAnchor: 'mirror', colorSignature: 'twilight-shift', visualEngine: 'gradient-mesh',
    entrance: 'the-scene-build', gesture: 'drag', exit: 'burn-in', breathPattern: 'calm',
  },
  'the-sculptor': {
    id: 'the-sculptor', number: 25, name: 'The Sculptor', tier: 'tertiary',
    goal: 'Chipping away at entrenched dopamine loops. Breaking bad habits.',
    clinicalTarget: 'Medium Heat (Level 3)',
    heatRange: [3, 3], schemas: ['insufficient-self-control'],
    vibe: 'Chisel on marble. Slow, deliberate friction. Earning the release.',
    voiceAnchor: 'coach', colorSignature: 'quiet-authority', visualEngine: 'void',
    entrance: 'the-threshold', gesture: 'tap', exit: 'emerge', breathPattern: 'simple',
  },
  'the-echo': {
    id: 'the-echo', number: 26, name: 'The Echo', tier: 'tertiary',
    goal: 'Destroying the fraud narrative before a big performance.',
    clinicalTarget: 'Medium/High Heat (Level 3-4)',
    heatRange: [3, 4], schemas: ['defectiveness', 'approval-seeking'],
    vibe: 'Soundproofing a room. Killing the feedback loop. Unshakable authority.',
    voiceAnchor: 'narrator', colorSignature: 'void-presence', visualEngine: 'void',
    entrance: 'the-silence', gesture: 'hold', exit: 'immediate', breathPattern: 'energize',
  },
  'the-valve': {
    id: 'the-valve', number: 27, name: 'The Valve', tier: 'tertiary',
    goal: 'Safely releasing buildup of micro-frustrations before explosion.',
    clinicalTarget: 'Medium/High Heat (Level 3-4)',
    heatRange: [3, 4], schemas: ['punitiveness', 'unrelenting-standards'],
    vibe: 'Venting steam. Controlled release. Decompression.',
    voiceAnchor: 'coach', colorSignature: 'neural-reset', visualEngine: 'particle-field',
    entrance: 'cold-arrival', gesture: 'pinch', exit: 'dissolve', breathPattern: 'box',
  },
  'the-horizon': {
    id: 'the-horizon', number: 28, name: 'The Horizon', tier: 'tertiary',
    goal: 'Waking up the nervous system from depressive flatness.',
    clinicalTarget: 'Low Heat (Level 1, under-aroused)',
    heatRange: [1, 1], schemas: ['emotional-inhibition', 'negativity'],
    vibe: 'The first ray of sun. Expanding the aperture. Subtle momentum.',
    voiceAnchor: 'companion', colorSignature: 'amber-resonance', visualEngine: 'gradient-mesh',
    entrance: 'the-dissolution', gesture: 'swipe', exit: 'emerge', breathPattern: 'simple',
  },
  'the-mirror-neuron': {
    id: 'the-mirror-neuron', number: 29, name: 'The Mirror Neuron', tier: 'tertiary',
    goal: 'Dropping a heavy grudge that only poisons the user.',
    clinicalTarget: 'Medium Heat (Level 3)',
    heatRange: [3, 3], schemas: ['punitiveness', 'mistrust'],
    vibe: 'Dropping a hot coal. Washing hands clean. Relinquishing the burden.',
    voiceAnchor: 'mirror', colorSignature: 'verdant-calm', visualEngine: 'liquid-pool',
    entrance: 'the-scene-build', gesture: 'hold', exit: 'dissolve', breathPattern: 'calm',
  },
  'the-catalyst': {
    id: 'the-catalyst', number: 30, name: 'The Catalyst', tier: 'tertiary',
    goal: 'Breaking doom-scrolling. Transitioning from consumer to creator.',
    clinicalTarget: 'Low/Medium Heat (Level 2)',
    heatRange: [2, 2], schemas: ['subjugation', 'failure'],
    vibe: 'Striking a match. The spark engine. Forward momentum.',
    voiceAnchor: 'activator', colorSignature: 'twilight-shift', visualEngine: 'constellation',
    entrance: 'cold-arrival', gesture: 'swipe', exit: 'immediate', breathPattern: 'simple',
  },
};

export const VOCAL_FAMILY_IDS: VocalFamilyId[] = [
  'the-downshift', 'the-disruption', 'the-witness', 'the-architect', 'the-surgeon',
  'the-alchemist', 'the-purge', 'the-archaeologist', 'the-anchor', 'the-weaver',
  'the-lullaby', 'the-crucible', 'the-prism', 'the-metronome', 'the-pendulum',
  'the-sieve', 'the-decoupler', 'the-chasm', 'the-compass', 'the-kintsugi',
  'the-tether', 'the-grounding-wire', 'the-forge', 'the-tuning-fork', 'the-sculptor',
  'the-echo', 'the-valve', 'the-horizon', 'the-mirror-neuron', 'the-catalyst',
];