/**
 * ATOMIC VOICE COPY — Per-Atom Voice Derivation
 * ==============================================
 * Replaces the single ATOM_112_WORKED_EXAMPLES with a system that
 * derives voice copy for ANY atom based on its metadata (series, intent, name).
 *
 * Architecture:
 *   1. Series-level copy templates (20 series x 5 voice lanes)
 *   2. Atom-specific kinetic payloads derived from atom name/intent
 *   3. Same 5-slot structure as the canonical layout
 *
 * Rules (from entrance-matrix-copy.md):
 *   - Anchor prompt: max 12 words, 65 chars
 *   - Kinetic payload: max 4 words, 30 chars (the big transformative noun)
 *   - Metacognitive tag: max 4 words, 25 chars (HUD state label)
 *   - Gesture label: max 6 words (kinetic verb)
 *   - Ambient: the whispered internal monologue
 */

import type { AtomId, SeriesId } from '@/app/components/atoms/types';
import { ATOM_CATALOG, SERIES_CATALOG } from '@/app/components/atoms';
import type { VoiceLaneId } from '@/navicue-types';

// =====================================================================
// TYPES
// =====================================================================

export interface AtomicVoiceCopy {
  metacognitiveTag: string;
  ambientSubtext: string;
  anchorPrompt: string;
  kineticPayload: string;
  midInteraction:
    | { type: 'friction'; start: string; mid: string; max: string }
    | { type: 'sequence'; steps: string[] };
  shadowNode?: string;
  thresholdShift: { before: string; after: string };
  gestureLabel: string;
}

// =====================================================================
// SERIES VOICE TEMPLATES — the therapeutic voice per series per lane
// =====================================================================
// Each series has a distinct therapeutic domain. The voice lanes shape
// HOW that domain is delivered.

interface SeriesVoiceTemplate {
  /** HUD state label */
  metacognitiveTag: string;
  /** The whispered truth behind the glass */
  ambientSubtext: string;
  /** The guiding prompt — max 12 words */
  anchorPrompt: string;
  /** Friction/sequence interaction */
  midInteraction:
    | { type: 'friction'; start: string; mid: string; max: string }
    | { type: 'sequence'; steps: string[] };
  /** The hidden deeper truth */
  shadowNode?: string;
  /** The transformation arc */
  thresholdShift: { before: string; after: string };
  /** Gesture CTA */
  gestureLabel: string;
}

// ── Series 1: Physics Engines — Time, Transmutation, Balance ─────────
const S1: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: GROUNDING',
    ambientSubtext: 'the body remembers what the mind forgets',
    anchorPrompt: 'Feel the weight. Let it teach you something.',
    midInteraction: { type: 'friction', start: 'Settling...', mid: 'Almost still...', max: 'Grounded.' },
    shadowNode: 'The chaos was always just energy without direction.',
    thresholdShift: { before: 'THE CHAOS', after: 'THE CALM' },
    gestureLabel: 'HOLD TO GROUND',
  },
  coach: {
    metacognitiveTag: 'FRICTION: ACTIVE',
    ambientSubtext: 'physics does not negotiate',
    anchorPrompt: 'The body does not lie. Trust the signal.',
    midInteraction: { type: 'friction', start: 'Tension...', mid: 'Building...', max: 'Release.' },
    thresholdShift: { before: 'THE RESISTANCE', after: 'THE FLOW' },
    gestureLabel: 'ENGAGE THE ENGINE',
  },
  mirror: {
    metacognitiveTag: 'OBSERVING',
    ambientSubtext: 'who is the one watching this move',
    anchorPrompt: 'What happens when you stop pushing?',
    midInteraction: { type: 'sequence', steps: ['Notice', 'Release', 'Watch'] },
    shadowNode: 'The force was never coming from outside.',
    thresholdShift: { before: 'THE FORCE', after: 'THE SPACE' },
    gestureLabel: 'WATCH THE SHIFT',
  },
  narrator: {
    metacognitiveTag: 'MECHANICS',
    ambientSubtext: 'every action carries an equal and opposite truth',
    anchorPrompt: 'A system in motion tends to stay in motion.',
    midInteraction: { type: 'sequence', steps: ['Mass', 'Velocity', 'Direction', 'Rest'] },
    thresholdShift: { before: 'THE INERTIA', after: 'THE STILLNESS' },
    gestureLabel: 'OBSERVE THE LAW',
  },
  activator: {
    metacognitiveTag: 'KINETIC',
    ambientSubtext: 'move or be moved',
    anchorPrompt: 'Stop thinking. Start moving.',
    midInteraction: { type: 'friction', start: 'Loading...', mid: 'Locked...', max: 'Fire.' },
    thresholdShift: { before: 'THE FREEZE', after: 'THE ACTION' },
    gestureLabel: 'IGNITE',
  },
};

// ── Series 2: Quantum Mechanics — Attention & Observation ────────────
const S2: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: OBSERVING',
    ambientSubtext: 'the watched thing changes',
    anchorPrompt: 'Your attention shapes what you see.',
    midInteraction: { type: 'sequence', steps: ['Look', 'Notice', 'Allow'] },
    shadowNode: 'You were never separate from what you observe.',
    thresholdShift: { before: 'THE BLUR', after: 'THE FOCUS' },
    gestureLabel: 'GENTLY OBSERVE',
  },
  coach: {
    metacognitiveTag: 'ATTENTION: LOCKED',
    ambientSubtext: 'the mind renders what it expects',
    anchorPrompt: 'Lock your attention. The noise collapses.',
    midInteraction: { type: 'friction', start: 'Scattered...', mid: 'Narrowing...', max: 'Collapsed.' },
    thresholdShift: { before: 'THE PROBABILITY', after: 'THE CERTAINTY' },
    gestureLabel: 'COLLAPSE THE WAVE',
  },
  mirror: {
    metacognitiveTag: 'SUPERPOSITION',
    ambientSubtext: 'both things are true until you choose',
    anchorPrompt: 'Which version are you choosing to see?',
    midInteraction: { type: 'sequence', steps: ['Both', 'Neither', 'This one'] },
    shadowNode: 'The observer creates the observation.',
    thresholdShift: { before: 'THE UNKNOWN', after: 'THE CHOSEN' },
    gestureLabel: 'CHOOSE THE STATE',
  },
  narrator: {
    metacognitiveTag: 'PROBABILITY',
    ambientSubtext: 'reality is a vote not a fact',
    anchorPrompt: 'The particle exists everywhere until measured.',
    midInteraction: { type: 'sequence', steps: ['Cloud', 'Collapse', 'Point', 'Certainty'] },
    thresholdShift: { before: 'THE WAVE', after: 'THE PARTICLE' },
    gestureLabel: 'MEASURE THE FIELD',
  },
  activator: {
    metacognitiveTag: 'QUANTUM',
    ambientSubtext: 'look and it changes',
    anchorPrompt: 'Look harder. It collapses.',
    midInteraction: { type: 'friction', start: 'Fuzzy...', mid: 'Sharpening...', max: 'Locked.' },
    thresholdShift: { before: 'THE CLOUD', after: 'THE POINT' },
    gestureLabel: 'COLLAPSE IT',
  },
};

// ── Series 3: Biomimetic — Organic Growth ────────────────────────────
const S3: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: GROWING',
    ambientSubtext: 'you do not build a tree you grow it',
    anchorPrompt: 'Growth does not rush. It roots first.',
    midInteraction: { type: 'sequence', steps: ['Seed', 'Root', 'Branch', 'Canopy'] },
    shadowNode: 'The decay feeds the next season.',
    thresholdShift: { before: 'THE SEED', after: 'THE FOREST' },
    gestureLabel: 'TEND THE GROWTH',
  },
  coach: {
    metacognitiveTag: 'SYSTEM: ORGANIC',
    ambientSubtext: 'nature never forces the bloom',
    anchorPrompt: 'The system is alive. Feed the right root.',
    midInteraction: { type: 'friction', start: 'Germinating...', mid: 'Branching...', max: 'Rooted.' },
    thresholdShift: { before: 'THE SOIL', after: 'THE CANOPY' },
    gestureLabel: 'PLANT THE ROOT',
  },
  mirror: {
    metacognitiveTag: 'ECOLOGY',
    ambientSubtext: 'what are you watering',
    anchorPrompt: 'What in your life is asking to be pruned?',
    midInteraction: { type: 'sequence', steps: ['Examine', 'Prune', 'Nourish'] },
    shadowNode: 'The strongest trees have the deepest scars.',
    thresholdShift: { before: 'THE TANGLE', after: 'THE SHAPE' },
    gestureLabel: 'PRUNE THE BRANCH',
  },
  narrator: {
    metacognitiveTag: 'SYMBIOSIS',
    ambientSubtext: 'the mycelium connects every root in the forest',
    anchorPrompt: 'The forest is one organism. So are you.',
    midInteraction: { type: 'sequence', steps: ['Spore', 'Network', 'Signal', 'Bloom'] },
    thresholdShift: { before: 'THE ISOLATION', after: 'THE NETWORK' },
    gestureLabel: 'TRACE THE ROOT',
  },
  activator: {
    metacognitiveTag: 'GROWTH',
    ambientSubtext: 'grow or decay there is no middle',
    anchorPrompt: 'Root down. Grow up.',
    midInteraction: { type: 'friction', start: 'Breaking soil...', mid: 'Rising...', max: 'Bloomed.' },
    thresholdShift: { before: 'THE DORMANCY', after: 'THE BLOOM' },
    gestureLabel: 'BREAK SOIL',
  },
};

// ── Series 4: Via Negativa — Subtraction & Void ──────────────────────
const S4: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: RELEASING',
    ambientSubtext: 'the quiet is not empty it is full',
    anchorPrompt: 'You do not need to add. Just let go.',
    midInteraction: { type: 'sequence', steps: ['Release', 'Soften', 'Empty'] },
    shadowNode: 'The void is not darkness. It is space.',
    thresholdShift: { before: 'THE NOISE', after: 'THE SILENCE' },
    gestureLabel: 'LET IT FALL',
  },
  coach: {
    metacognitiveTag: 'SUBTRACTING',
    ambientSubtext: 'remove the unnecessary',
    anchorPrompt: 'Strip it back. Find the signal in the noise.',
    midInteraction: { type: 'friction', start: 'Heavy...', mid: 'Lighter...', max: 'Clear.' },
    thresholdShift: { before: 'THE CLUTTER', after: 'THE ESSENTIAL' },
    gestureLabel: 'STRIP IT BACK',
  },
  mirror: {
    metacognitiveTag: 'VOID',
    ambientSubtext: 'what remains when you remove everything',
    anchorPrompt: 'What is left when you stop performing?',
    midInteraction: { type: 'sequence', steps: ['Name it', 'Un-name it', 'Sit'] },
    shadowNode: 'You were always the silence beneath the story.',
    thresholdShift: { before: 'THE LABEL', after: 'THE SPACE' },
    gestureLabel: 'ERASE THE NAME',
  },
  narrator: {
    metacognitiveTag: 'NEGATION',
    ambientSubtext: 'enlightenment is a subtractive process',
    anchorPrompt: 'The sculptor removes marble to find the form.',
    midInteraction: { type: 'sequence', steps: ['Excess', 'Chisel', 'Form', 'Nothing'] },
    thresholdShift: { before: 'THE EXCESS', after: 'THE FORM' },
    gestureLabel: 'REMOVE THE STONE',
  },
  activator: {
    metacognitiveTag: 'SUBTRACT',
    ambientSubtext: 'less',
    anchorPrompt: 'Drop it. All of it.',
    midInteraction: { type: 'friction', start: 'Loaded...', mid: 'Shedding...', max: 'Bare.' },
    thresholdShift: { before: 'THE WEIGHT', after: 'THE NOTHING' },
    gestureLabel: 'DROP IT',
  },
};

// ── Series 5: Chrono-Acoustic — Sound & Frequency ────────────────────
const S5: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: LISTENING',
    ambientSubtext: 'the body hears what the mind ignores',
    anchorPrompt: 'Close your eyes. Follow the vibration.',
    midInteraction: { type: 'sequence', steps: ['Listen', 'Sync', 'Dissolve'] },
    shadowNode: 'Every cell vibrates at a frequency you forgot.',
    thresholdShift: { before: 'THE STATIC', after: 'THE HUM' },
    gestureLabel: 'BREATHE WITH IT',
  },
  coach: {
    metacognitiveTag: 'FREQUENCY: LOCKED',
    ambientSubtext: 'find the frequency that shakes the cage',
    anchorPrompt: 'Lock into the rhythm. Let it drive.',
    midInteraction: { type: 'friction', start: 'Off-beat...', mid: 'Syncing...', max: 'Locked.' },
    thresholdShift: { before: 'THE DISSONANCE', after: 'THE RESONANCE' },
    gestureLabel: 'LOCK THE FREQUENCY',
  },
  mirror: {
    metacognitiveTag: 'RESONANCE',
    ambientSubtext: 'what frequency are you broadcasting',
    anchorPrompt: 'What sound does your anxiety make?',
    midInteraction: { type: 'sequence', steps: ['Noise', 'Tone', 'Harmony'] },
    thresholdShift: { before: 'THE NOISE', after: 'THE TONE' },
    gestureLabel: 'HEAR THE SIGNAL',
  },
  narrator: {
    metacognitiveTag: 'WAVEFORM',
    ambientSubtext: 'the universe is a standing wave',
    anchorPrompt: 'Every emotion has a waveform. This one too.',
    midInteraction: { type: 'sequence', steps: ['Frequency', 'Amplitude', 'Phase', 'Rest'] },
    thresholdShift: { before: 'THE WAVE', after: 'THE SILENCE' },
    gestureLabel: 'TRACE THE WAVE',
  },
  activator: {
    metacognitiveTag: 'SONIC',
    ambientSubtext: 'vibrate higher',
    anchorPrompt: 'Feel the pulse. Ride it out.',
    midInteraction: { type: 'friction', start: 'Rumbling...', mid: 'Rising...', max: 'Peak.' },
    thresholdShift: { before: 'THE RUMBLE', after: 'THE CLARITY' },
    gestureLabel: 'RIDE THE WAVE',
  },
};

// ── Series 6: Meta-System Glitch — Breaking Autopilot ────────────────
const S6: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: AWAKENING',
    ambientSubtext: 'the pattern runs so deep you forgot it was there',
    anchorPrompt: 'You were on autopilot. Let us pause here.',
    midInteraction: { type: 'sequence', steps: ['Notice', 'Interrupt', 'Choose'] },
    shadowNode: 'The glitch is the cure.',
    thresholdShift: { before: 'THE LOOP', after: 'THE CHOICE' },
    gestureLabel: 'BREAK THE LOOP',
  },
  coach: {
    metacognitiveTag: 'SYSTEM: OVERRIDE',
    ambientSubtext: 'the autopilot is not your friend',
    anchorPrompt: 'The algorithm has you. Override it.',
    midInteraction: { type: 'friction', start: 'Trapped...', mid: 'Cracking...', max: 'Free.' },
    thresholdShift: { before: 'THE PROGRAM', after: 'THE OVERRIDE' },
    gestureLabel: 'CRASH THE SYSTEM',
  },
  mirror: {
    metacognitiveTag: 'GLITCH',
    ambientSubtext: 'who wrote the code you are running',
    anchorPrompt: 'What if this reaction was installed by someone else?',
    midInteraction: { type: 'sequence', steps: ['Detect', 'Inspect', 'Rewrite'] },
    shadowNode: 'You are not the software. You are the admin.',
    thresholdShift: { before: 'THE SCRIPT', after: 'THE REWRITE' },
    gestureLabel: 'INSPECT THE CODE',
  },
  narrator: {
    metacognitiveTag: 'META-SYSTEM',
    ambientSubtext: 'the fourth wall was never real',
    anchorPrompt: 'A pattern repeats until it is seen.',
    midInteraction: { type: 'sequence', steps: ['Loop', 'Glitch', 'Break', 'Reboot'] },
    thresholdShift: { before: 'THE PATTERN', after: 'THE AWARENESS' },
    gestureLabel: 'BREAK THE WALL',
  },
  activator: {
    metacognitiveTag: 'INTERRUPT',
    ambientSubtext: 'wake up',
    anchorPrompt: 'Snap out of it. Now.',
    midInteraction: { type: 'friction', start: 'Looping...', mid: 'Tearing...', max: 'Broken.' },
    thresholdShift: { before: 'THE TRANCE', after: 'THE WAKE' },
    gestureLabel: 'TEAR IT',
  },
};

// ── Series 7: Retro-Causal — Rewriting Time ──────────────────────────
const S7: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: REWRITING',
    ambientSubtext: 'the past is not stone it is clay',
    anchorPrompt: 'The memory is still soft. We can reshape it.',
    midInteraction: { type: 'sequence', steps: ['Remember', 'Reframe', 'Release'] },
    shadowNode: 'The story hurts because you are still the author.',
    thresholdShift: { before: 'THE WOUND', after: 'THE WISDOM' },
    gestureLabel: 'REWRITE THE SCENE',
  },
  coach: {
    metacognitiveTag: 'TIMELINE: ACTIVE',
    ambientSubtext: 'you are the editor not the footage',
    anchorPrompt: 'Change the soundtrack. The footage transforms.',
    midInteraction: { type: 'friction', start: 'Raw...', mid: 'Grading...', max: 'Recut.' },
    thresholdShift: { before: 'THE FOOTAGE', after: 'THE EDIT' },
    gestureLabel: 'SCRUB THE TIMELINE',
  },
  mirror: {
    metacognitiveTag: 'CAUSALITY',
    ambientSubtext: 'the future can heal the past',
    anchorPrompt: 'What if this memory means something different now?',
    midInteraction: { type: 'sequence', steps: ['Then', 'Now', 'Rewritten'] },
    shadowNode: 'The one who was hurt is now the one who heals.',
    thresholdShift: { before: 'THE OLD STORY', after: 'THE NEW CUT' },
    gestureLabel: 'SHIFT THE LENS',
  },
  narrator: {
    metacognitiveTag: 'TEMPORAL',
    ambientSubtext: 'time moves in both directions for those who see',
    anchorPrompt: 'The past responds to the present tense.',
    midInteraction: { type: 'sequence', steps: ['Origin', 'Edit', 'Splice', 'Seal'] },
    thresholdShift: { before: 'THE RECORD', after: 'THE REVISION' },
    gestureLabel: 'EDIT THE MEMORY',
  },
  activator: {
    metacognitiveTag: 'REWRITE',
    ambientSubtext: 'delete the old version',
    anchorPrompt: 'Cut the scene. Reshoot.',
    midInteraction: { type: 'friction', start: 'Playing...', mid: 'Paused...', max: 'Reshot.' },
    thresholdShift: { before: 'THE TAKE', after: 'THE RESHOOT' },
    gestureLabel: 'CUT THE SCENE',
  },
};

// ── Series 8: Kinematic Topology — Perspective & Scale ───────────────
const S8: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: EXPANDING',
    ambientSubtext: 'from here it looks so small',
    anchorPrompt: 'Pull back. See how small it really is.',
    midInteraction: { type: 'sequence', steps: ['Close', 'Wide', 'Infinite'] },
    shadowNode: 'The crisis was always a matter of zoom level.',
    thresholdShift: { before: 'THE CRISIS', after: 'THE PERSPECTIVE' },
    gestureLabel: 'ZOOM OUT',
  },
  coach: {
    metacognitiveTag: 'SCALE: SHIFTING',
    ambientSubtext: 'the problem is the wrong zoom level',
    anchorPrompt: 'The problem is not big. Your lens is too close.',
    midInteraction: { type: 'friction', start: 'Micro...', mid: 'Shifting...', max: 'Macro.' },
    thresholdShift: { before: 'THE DETAIL', after: 'THE OVERVIEW' },
    gestureLabel: 'SHIFT THE SCALE',
  },
  mirror: {
    metacognitiveTag: 'TOPOLOGY',
    ambientSubtext: 'what does this look like from the moon',
    anchorPrompt: 'What would the mountain say about your crisis?',
    midInteraction: { type: 'sequence', steps: ['Magnify', 'Rotate', 'Dissolve'] },
    shadowNode: 'From far enough away, every tragedy becomes geography.',
    thresholdShift: { before: 'THE CLOSE-UP', after: 'THE VAST' },
    gestureLabel: 'CHANGE THE VIEW',
  },
  narrator: {
    metacognitiveTag: 'PARALLAX',
    ambientSubtext: 'the astronaut sees no borders from orbit',
    anchorPrompt: 'From orbit, the weather is just weather.',
    midInteraction: { type: 'sequence', steps: ['Atom', 'Cell', 'Body', 'Planet', 'Galaxy'] },
    thresholdShift: { before: 'THE PIXEL', after: 'THE COSMOS' },
    gestureLabel: 'EXPAND THE FIELD',
  },
  activator: {
    metacognitiveTag: 'ZOOM',
    ambientSubtext: 'pull back now',
    anchorPrompt: 'Zoom out. Right now.',
    midInteraction: { type: 'friction', start: 'Locked in...', mid: 'Pulling...', max: 'Free.' },
    thresholdShift: { before: 'THE TRAP', after: 'THE SKY' },
    gestureLabel: 'PULL BACK',
  },
};

// ── Series 9: Shadow & Crucible — Facing the Dark ────────────────────
const S9: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: HOLDING',
    ambientSubtext: 'the shadow is not the enemy it is the teacher',
    anchorPrompt: 'I am here. We go into this together.',
    midInteraction: { type: 'sequence', steps: ['Approach', 'Touch', 'Hold'] },
    shadowNode: 'The part you hide is the part that heals you.',
    thresholdShift: { before: 'THE SHADOW', after: 'THE GOLD' },
    gestureLabel: 'HOLD THE DARK',
  },
  coach: {
    metacognitiveTag: 'CRUCIBLE: HOT',
    ambientSubtext: 'the fire does not destroy it reveals',
    anchorPrompt: 'Walk into the fire. The gold is inside.',
    midInteraction: { type: 'friction', start: 'Cold...', mid: 'Heating...', max: 'Forged.' },
    thresholdShift: { before: 'THE RAW ORE', after: 'THE GOLD' },
    gestureLabel: 'ENTER THE FIRE',
  },
  mirror: {
    metacognitiveTag: 'SHADOW WORK',
    ambientSubtext: 'what you resist persists',
    anchorPrompt: 'What are you afraid to look at?',
    midInteraction: { type: 'sequence', steps: ['Deny', 'Face', 'Integrate'] },
    shadowNode: 'The monster was just a child in armor.',
    thresholdShift: { before: 'THE FEAR', after: 'THE TRUTH' },
    gestureLabel: 'FACE THE MIRROR',
  },
  narrator: {
    metacognitiveTag: 'ALCHEMY',
    ambientSubtext: 'solve et coagula dissolve and reform',
    anchorPrompt: 'The alchemist does not fear the furnace.',
    midInteraction: { type: 'sequence', steps: ['Nigredo', 'Albedo', 'Citrinitas', 'Rubedo'] },
    thresholdShift: { before: 'THE LEAD', after: 'THE GOLD' },
    gestureLabel: 'TRANSMUTE THE DARK',
  },
  activator: {
    metacognitiveTag: 'FORGE',
    ambientSubtext: 'burn it all',
    anchorPrompt: 'Into the fire. Do not flinch.',
    midInteraction: { type: 'friction', start: 'Ash...', mid: 'Ember...', max: 'Flame.' },
    thresholdShift: { before: 'THE ASH', after: 'THE PHOENIX' },
    gestureLabel: 'BURN IT DOWN',
  },
};

// ── Series 10: Reality Bender — Total Sovereignty ────────────────────
const S10: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: CREATING',
    ambientSubtext: 'you are the architect now',
    anchorPrompt: 'You built a cage. You can build a door.',
    midInteraction: { type: 'sequence', steps: ['See', 'Design', 'Build'] },
    shadowNode: 'The prison had no lock. Only a belief.',
    thresholdShift: { before: 'THE CAGE', after: 'THE BLUEPRINT' },
    gestureLabel: 'BUILD THE WORLD',
  },
  coach: {
    metacognitiveTag: 'SOVEREIGN',
    ambientSubtext: 'you hold the pen',
    anchorPrompt: 'Stop narrating the problem. Write the solution.',
    midInteraction: { type: 'friction', start: 'Blank...', mid: 'Sketching...', max: 'Architected.' },
    thresholdShift: { before: 'THE VICTIM', after: 'THE ARCHITECT' },
    gestureLabel: 'WRITE THE RULES',
  },
  mirror: {
    metacognitiveTag: 'SOVEREIGNTY',
    ambientSubtext: 'whose reality are you living in',
    anchorPrompt: 'What if you could change the laws of this place?',
    midInteraction: { type: 'sequence', steps: ['Question', 'Dissolve', 'Rebuild'] },
    shadowNode: 'You were always the author. You just forgot.',
    thresholdShift: { before: 'THE GIVEN', after: 'THE CHOSEN' },
    gestureLabel: 'BEND THE RULES',
  },
  narrator: {
    metacognitiveTag: 'REALITY',
    ambientSubtext: 'the universe is a canvas not a prison',
    anchorPrompt: 'Reality is not discovered. It is rendered.',
    midInteraction: { type: 'sequence', steps: ['Perceive', 'Question', 'Override', 'Create'] },
    thresholdShift: { before: 'THE DEFAULT', after: 'THE OVERRIDE' },
    gestureLabel: 'RENDER THE REAL',
  },
  activator: {
    metacognitiveTag: 'OVERRIDE',
    ambientSubtext: 'rewrite everything',
    anchorPrompt: 'Your reality. Your rules.',
    midInteraction: { type: 'friction', start: 'Loading...', mid: 'Overriding...', max: 'Rebuilt.' },
    thresholdShift: { before: 'THE OLD MAP', after: 'THE NEW WORLD' },
    gestureLabel: 'OVERRIDE NOW',
  },
};

// ── Series 11: Epistemic Constructs — Belief & Truth ─────────────────
const S11: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: EXAMINING',
    ambientSubtext: 'not every thought deserves to be believed',
    anchorPrompt: 'That feels true. Let us check the evidence.',
    midInteraction: { type: 'sequence', steps: ['Feel', 'Examine', 'Verify'] },
    shadowNode: 'The belief was inherited, not discovered.',
    thresholdShift: { before: 'THE BELIEF', after: 'THE EVIDENCE' },
    gestureLabel: 'TEST THE THOUGHT',
  },
  coach: {
    metacognitiveTag: 'LOGIC: ACTIVE',
    ambientSubtext: 'separate the data from the drama',
    anchorPrompt: 'Facts first. Feelings second. Separate them.',
    midInteraction: { type: 'friction', start: 'Tangled...', mid: 'Sorting...', max: 'Clear.' },
    thresholdShift: { before: 'THE ASSUMPTION', after: 'THE FACT' },
    gestureLabel: 'RUN THE LOGIC',
  },
  mirror: {
    metacognitiveTag: 'INFERENCE',
    ambientSubtext: 'how far up the ladder have you climbed',
    anchorPrompt: 'Is this a fact or a story you built on top?',
    midInteraction: { type: 'sequence', steps: ['Data', 'Story', 'Belief', 'Truth?'] },
    shadowNode: 'The conviction was always just a well-rehearsed inference.',
    thresholdShift: { before: 'THE STORY', after: 'THE DATA' },
    gestureLabel: 'CLIMB DOWN THE LADDER',
  },
  narrator: {
    metacognitiveTag: 'EPISTEMIC',
    ambientSubtext: 'certainty is the enemy of understanding',
    anchorPrompt: 'A belief held too tightly becomes a cage.',
    midInteraction: { type: 'sequence', steps: ['Axiom', 'Inference', 'Conclusion', 'Doubt'] },
    thresholdShift: { before: 'THE DOGMA', after: 'THE INQUIRY' },
    gestureLabel: 'EXAMINE THE AXIOM',
  },
  activator: {
    metacognitiveTag: 'TRUTH',
    ambientSubtext: 'test it or drop it',
    anchorPrompt: 'Prove it or release it.',
    midInteraction: { type: 'friction', start: 'Assumed...', mid: 'Testing...', max: 'Verified.' },
    thresholdShift: { before: 'THE OPINION', after: 'THE PROOF' },
    gestureLabel: 'STRESS TEST',
  },
};

// ── Series 12: Friction Mechanics — Action & Resistance ──────────────
const S12: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: OVERWHELM',
    ambientSubtext: 'the whole thing is just small pieces pretending to be big',
    anchorPrompt: 'We do not have to carry the whole thing.',
    midInteraction: { type: 'friction', start: 'A little lighter...', mid: 'Almost there...', max: 'Just this piece.' },
    shadowNode: 'The paralysis was not laziness. It was fear.',
    thresholdShift: { before: 'THE BURDEN', after: 'THE STEP' },
    gestureLabel: 'FLICK TO START',
  },
  coach: {
    metacognitiveTag: 'FRICTION: MAXIMUM',
    ambientSubtext: 'action defeats anxiety every single time',
    anchorPrompt: 'The resistance is the path. Break through it.',
    midInteraction: { type: 'friction', start: 'Stuck...', mid: 'Cracking...', max: 'Moving.' },
    thresholdShift: { before: 'THE WALL', after: 'THE MOMENTUM' },
    gestureLabel: 'BREAK THE INERTIA',
  },
  mirror: {
    metacognitiveTag: 'RESISTANCE',
    ambientSubtext: 'what are you avoiding by staying still',
    anchorPrompt: 'What is the smallest possible thing you could do?',
    midInteraction: { type: 'sequence', steps: ['Stare at it', 'Touch it', 'Move it'] },
    shadowNode: 'Perfectionism disguised itself as preparation.',
    thresholdShift: { before: 'THE PERFECT PLAN', after: 'THE FIRST MOVE' },
    gestureLabel: 'FIND THE MICRO-STEP',
  },
  narrator: {
    metacognitiveTag: 'INERTIA',
    ambientSubtext: 'an object at rest stays at rest unless acted upon',
    anchorPrompt: 'The first push is the hardest. Physics agrees.',
    midInteraction: { type: 'sequence', steps: ['Static', 'Friction', 'Motion', 'Momentum'] },
    thresholdShift: { before: 'THE PARALYSIS', after: 'THE VELOCITY' },
    gestureLabel: 'APPLY THE FORCE',
  },
  activator: {
    metacognitiveTag: 'KINETIC',
    ambientSubtext: 'just move',
    anchorPrompt: 'Stop planning. Start doing.',
    midInteraction: { type: 'friction', start: 'Frozen...', mid: 'Cracking...', max: 'GO.' },
    thresholdShift: { before: 'THE FREEZE', after: 'THE LAUNCH' },
    gestureLabel: 'LAUNCH',
  },
};

// ── Series 13: Semantic Translators — Language & Meaning ─────────────
const S13: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: TRANSLATING',
    ambientSubtext: 'the words you use build the world you live in',
    anchorPrompt: 'The word is not the thing. Let us rename it.',
    midInteraction: { type: 'sequence', steps: ['Old word', 'Feel it', 'New word'] },
    shadowNode: 'The cruelest stories are the ones you tell yourself.',
    thresholdShift: { before: 'THE LABEL', after: 'THE MEANING' },
    gestureLabel: 'RENAME THE FEELING',
  },
  coach: {
    metacognitiveTag: 'LANGUAGE: ACTIVE',
    ambientSubtext: 'change the headline change the feeling',
    anchorPrompt: 'Rewrite the headline. The story follows.',
    midInteraction: { type: 'friction', start: 'Old draft...', mid: 'Editing...', max: 'Published.' },
    thresholdShift: { before: 'THE OLD HEADLINE', after: 'THE NEW FRAME' },
    gestureLabel: 'REWRITE THE HEADLINE',
  },
  mirror: {
    metacognitiveTag: 'SEMANTICS',
    ambientSubtext: 'the map is not the territory',
    anchorPrompt: 'What would this feel like with different words?',
    midInteraction: { type: 'sequence', steps: ['Surface', 'Subtext', 'Truth'] },
    shadowNode: 'You confused the menu for the meal.',
    thresholdShift: { before: 'THE WORD', after: 'THE FEELING' },
    gestureLabel: 'PEEL THE MEANING',
  },
  narrator: {
    metacognitiveTag: 'TRANSLATION',
    ambientSubtext: 'language is the operating system of consciousness',
    anchorPrompt: 'The syntax of the sentence shapes the suffering.',
    midInteraction: { type: 'sequence', steps: ['Decode', 'Translate', 'Recode', 'Speak'] },
    thresholdShift: { before: 'THE CURSE', after: 'THE BLESSING' },
    gestureLabel: 'DECODE THE SUBTEXT',
  },
  activator: {
    metacognitiveTag: 'REFRAME',
    ambientSubtext: 'say it differently',
    anchorPrompt: 'New words. New feeling. Say it again.',
    midInteraction: { type: 'friction', start: 'Old language...', mid: 'Shifting...', max: 'Renamed.' },
    thresholdShift: { before: 'THE NARRATIVE', after: 'THE REVISION' },
    gestureLabel: 'RENAME IT',
  },
};

// ── Series 14: Social Physics — Tribe & Boundary ─────────────────────
const S14: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: PROTECTING',
    ambientSubtext: 'you can love someone and still draw the line',
    anchorPrompt: 'Your boundary is not a wall. It is a door.',
    midInteraction: { type: 'sequence', steps: ['Notice', 'Claim', 'Hold'] },
    shadowNode: 'The resentment was just an unfenced garden.',
    thresholdShift: { before: 'THE ENMESHMENT', after: 'THE BOUNDARY' },
    gestureLabel: 'DRAW THE LINE',
  },
  coach: {
    metacognitiveTag: 'SOCIAL: ACTIVE',
    ambientSubtext: 'protect the perimeter',
    anchorPrompt: 'Know where you end and they begin.',
    midInteraction: { type: 'friction', start: 'Merged...', mid: 'Separating...', max: 'Sovereign.' },
    thresholdShift: { before: 'THE ORBIT', after: 'THE CENTER' },
    gestureLabel: 'SET THE BOUNDARY',
  },
  mirror: {
    metacognitiveTag: 'ORBIT',
    ambientSubtext: 'whose gravity are you trapped in',
    anchorPrompt: 'Are you orbiting them or yourself?',
    midInteraction: { type: 'sequence', steps: ['Orbit', 'Notice', 'Redirect'] },
    shadowNode: 'The need for approval was someone else\'s gravity.',
    thresholdShift: { before: 'THE PULL', after: 'THE FREEDOM' },
    gestureLabel: 'REVERSE THE ORBIT',
  },
  narrator: {
    metacognitiveTag: 'SOCIAL PHYSICS',
    ambientSubtext: 'every relationship has an orbit and a force',
    anchorPrompt: 'The healthy orbit has space between the bodies.',
    midInteraction: { type: 'sequence', steps: ['Attract', 'Collide', 'Balance', 'Orbit'] },
    thresholdShift: { before: 'THE COLLISION', after: 'THE DANCE' },
    gestureLabel: 'FIND THE ORBIT',
  },
  activator: {
    metacognitiveTag: 'BOUNDARY',
    ambientSubtext: 'claim your space',
    anchorPrompt: 'Your space. Your rules.',
    midInteraction: { type: 'friction', start: 'Invaded...', mid: 'Pushing back...', max: 'Clear.' },
    thresholdShift: { before: 'THE INVASION', after: 'THE SOVEREIGNTY' },
    gestureLabel: 'CLAIM THE SPACE',
  },
};

// ── Series 15: Time Capsule — Temporal Architecture ──────────────────
const S15: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: STORING',
    ambientSubtext: 'some truths need time to be ready',
    anchorPrompt: 'Store this for when you are ready to open it.',
    midInteraction: { type: 'sequence', steps: ['Capture', 'Seal', 'Store'] },
    shadowNode: 'The future version of you needs this gift.',
    thresholdShift: { before: 'THE MOMENT', after: 'THE CAPSULE' },
    gestureLabel: 'SEAL THE CAPSULE',
  },
  coach: {
    metacognitiveTag: 'TEMPORAL: LOCKED',
    ambientSubtext: 'the future is a commitment device',
    anchorPrompt: 'Lock it in. Your future self will thank you.',
    midInteraction: { type: 'friction', start: 'Drafting...', mid: 'Sealing...', max: 'Locked.' },
    thresholdShift: { before: 'THE WISH', after: 'THE PACT' },
    gestureLabel: 'LOCK THE COMMITMENT',
  },
  mirror: {
    metacognitiveTag: 'FUTURE',
    ambientSubtext: 'what would the older you say right now',
    anchorPrompt: 'What does the 80-year-old version of you know?',
    midInteraction: { type: 'sequence', steps: ['Now', 'Then', 'Always'] },
    shadowNode: 'The regret was always about what you did not do.',
    thresholdShift: { before: 'THE REGRET', after: 'THE DECISION' },
    gestureLabel: 'ASK THE FUTURE',
  },
  narrator: {
    metacognitiveTag: 'TEMPORAL',
    ambientSubtext: 'time is the only non-renewable resource',
    anchorPrompt: 'This decision echoes for a decade. Choose wisely.',
    midInteraction: { type: 'sequence', steps: ['Seed', 'Grow', 'Harvest', 'Legacy'] },
    thresholdShift: { before: 'THE IMPULSE', after: 'THE LEGACY' },
    gestureLabel: 'PLANT THE STAKE',
  },
  activator: {
    metacognitiveTag: 'TIME LOCK',
    ambientSubtext: 'commit now',
    anchorPrompt: 'Seal it. Move forward.',
    midInteraction: { type: 'friction', start: 'Open...', mid: 'Closing...', max: 'Sealed.' },
    thresholdShift: { before: 'THE DOUBT', after: 'THE LOCK' },
    gestureLabel: 'SEAL IT',
  },
};

// ── Series 16: Soma & Perception — Body & Senses ────────────────────
const S16: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: SENSING',
    ambientSubtext: 'the body speaks before the mind listens',
    anchorPrompt: 'Come back to the body. It has been waiting.',
    midInteraction: { type: 'sequence', steps: ['Scan', 'Feel', 'Release'] },
    shadowNode: 'The tension was a message you kept ignoring.',
    thresholdShift: { before: 'THE TENSION', after: 'THE SIGNAL' },
    gestureLabel: 'SCAN THE BODY',
  },
  coach: {
    metacognitiveTag: 'SOMATIC: ACTIVE',
    ambientSubtext: 'the body does not lie',
    anchorPrompt: 'Where is it sitting in your body right now?',
    midInteraction: { type: 'friction', start: 'Numb...', mid: 'Feeling...', max: 'Located.' },
    thresholdShift: { before: 'THE NUMBNESS', after: 'THE SENSATION' },
    gestureLabel: 'LOCATE THE FEELING',
  },
  mirror: {
    metacognitiveTag: 'SOMA',
    ambientSubtext: 'what is the body saying that the mind refuses to hear',
    anchorPrompt: 'If this feeling had a shape, what would it be?',
    midInteraction: { type: 'sequence', steps: ['Notice', 'Name', 'Breathe into'] },
    shadowNode: 'The anxiety was always a body sensation first.',
    thresholdShift: { before: 'THE THOUGHT', after: 'THE SENSATION' },
    gestureLabel: 'FEEL THE SHAPE',
  },
  narrator: {
    metacognitiveTag: 'PERCEPTION',
    ambientSubtext: 'consciousness is the body looking at itself',
    anchorPrompt: 'The nerve endings carry the truth the mind edits out.',
    midInteraction: { type: 'sequence', steps: ['Stimulus', 'Nerve', 'Signal', 'Awareness'] },
    thresholdShift: { before: 'THE NOISE', after: 'THE SIGNAL' },
    gestureLabel: 'READ THE NERVE',
  },
  activator: {
    metacognitiveTag: 'BODY',
    ambientSubtext: 'feel it now',
    anchorPrompt: 'Get out of your head. Into the body.',
    midInteraction: { type: 'friction', start: 'Disconnected...', mid: 'Arriving...', max: 'Here.' },
    thresholdShift: { before: 'THE HEAD', after: 'THE BODY' },
    gestureLabel: 'DROP IN',
  },
};

// ── Series 17: Diplomat & Empathy — Boundaries ──────────────────────
const S17: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: BRIDGING',
    ambientSubtext: 'understanding is not the same as agreeing',
    anchorPrompt: 'You can hold your truth and hear theirs.',
    midInteraction: { type: 'sequence', steps: ['Listen', 'Reflect', 'Bridge'] },
    shadowNode: 'The wall between you was built by both hands.',
    thresholdShift: { before: 'THE WALL', after: 'THE BRIDGE' },
    gestureLabel: 'BUILD THE BRIDGE',
  },
  coach: {
    metacognitiveTag: 'EMPATHY: ACTIVE',
    ambientSubtext: 'strength is not winning the argument',
    anchorPrompt: 'Steel-man their position. Then choose yours.',
    midInteraction: { type: 'friction', start: 'Defending...', mid: 'Listening...', max: 'Connected.' },
    thresholdShift: { before: 'THE DEFENSE', after: 'THE UNDERSTANDING' },
    gestureLabel: 'STEEL-MAN IT',
  },
  mirror: {
    metacognitiveTag: 'PERSPECTIVE',
    ambientSubtext: 'what does this look like from their chair',
    anchorPrompt: 'What if you sat in their seat for a moment?',
    midInteraction: { type: 'sequence', steps: ['Your view', 'Their view', 'The truth'] },
    shadowNode: 'The thing you hate in them lives somewhere in you.',
    thresholdShift: { before: 'THE JUDGMENT', after: 'THE MIRROR' },
    gestureLabel: 'SWAP THE CHAIR',
  },
  narrator: {
    metacognitiveTag: 'DIPLOMACY',
    ambientSubtext: 'the bridge is built from both sides',
    anchorPrompt: 'Between two truths, there is always a third chair.',
    midInteraction: { type: 'sequence', steps: ['Position A', 'Position B', 'The Bridge'] },
    thresholdShift: { before: 'THE CONFLICT', after: 'THE TRUCE' },
    gestureLabel: 'FIND THE THIRD CHAIR',
  },
  activator: {
    metacognitiveTag: 'REDIRECT',
    ambientSubtext: 'redirect do not resist',
    anchorPrompt: 'Do not push back. Redirect.',
    midInteraction: { type: 'friction', start: 'Clash...', mid: 'Absorbing...', max: 'Redirected.' },
    thresholdShift: { before: 'THE CLASH', after: 'THE FLOW' },
    gestureLabel: 'REDIRECT THE FORCE',
  },
};

// ── Series 18: Visionary & Strategist — Architecture of Future ──────
const S18: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: DESIGNING',
    ambientSubtext: 'the future is not something that happens to you',
    anchorPrompt: 'You are the architect of what comes next.',
    midInteraction: { type: 'sequence', steps: ['Dream', 'Plan', 'Build'] },
    shadowNode: 'The fear of success is quieter than the fear of failure.',
    thresholdShift: { before: 'THE DRIFT', after: 'THE DESIGN' },
    gestureLabel: 'DRAW THE MAP',
  },
  coach: {
    metacognitiveTag: 'STRATEGY: ACTIVE',
    ambientSubtext: 'clarity is the ultimate competitive advantage',
    anchorPrompt: 'One priority. Everything else is noise.',
    midInteraction: { type: 'friction', start: 'Scattered...', mid: 'Focusing...', max: 'Locked.' },
    thresholdShift: { before: 'THE NOISE', after: 'THE SIGNAL' },
    gestureLabel: 'LOCK THE PRIORITY',
  },
  mirror: {
    metacognitiveTag: 'VISION',
    ambientSubtext: 'what would you build if failure were impossible',
    anchorPrompt: 'What does the version of you who made it look like?',
    midInteraction: { type: 'sequence', steps: ['Fear', 'Clarity', 'Action'] },
    shadowNode: 'The obstacle is the way.',
    thresholdShift: { before: 'THE OBSTACLE', after: 'THE PATH' },
    gestureLabel: 'SEE THE VISION',
  },
  narrator: {
    metacognitiveTag: 'ARCHITECTURE',
    ambientSubtext: 'compound interest applies to courage too',
    anchorPrompt: 'Small bets compound into an unrecognizable life.',
    midInteraction: { type: 'sequence', steps: ['Seed', 'Compound', 'Harvest', 'Legacy'] },
    thresholdShift: { before: 'THE SMALL BET', after: 'THE EMPIRE' },
    gestureLabel: 'PLANT THE SEED',
  },
  activator: {
    metacognitiveTag: 'EXECUTE',
    ambientSubtext: 'build it now',
    anchorPrompt: 'Stop dreaming. Start building.',
    midInteraction: { type: 'friction', start: 'Planning...', mid: 'Building...', max: 'Shipped.' },
    thresholdShift: { before: 'THE PLAN', after: 'THE THING' },
    gestureLabel: 'SHIP IT',
  },
};

// ── Series 19: Mystic & Infinite Player — Transcendence & Play ──────
const S19: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: DISSOLVING',
    ambientSubtext: 'you are not a drop in the ocean you are the ocean in a drop',
    anchorPrompt: 'There is nothing to fix. Just something to see.',
    midInteraction: { type: 'sequence', steps: ['Soften', 'Expand', 'Dissolve'] },
    shadowNode: 'The seeker and the sought are the same thing.',
    thresholdShift: { before: 'THE SELF', after: 'THE WHOLE' },
    gestureLabel: 'LET IT DISSOLVE',
  },
  coach: {
    metacognitiveTag: 'PLAY: INFINITE',
    ambientSubtext: 'the game has no end only new levels',
    anchorPrompt: 'Play the infinite game. The rules are yours.',
    midInteraction: { type: 'friction', start: 'Serious...', mid: 'Loosening...', max: 'Playing.' },
    thresholdShift: { before: 'THE SCORE', after: 'THE PLAY' },
    gestureLabel: 'PLAY THE GAME',
  },
  mirror: {
    metacognitiveTag: 'MYSTERY',
    ambientSubtext: 'the answer was always the question',
    anchorPrompt: 'What if there is nothing wrong?',
    midInteraction: { type: 'sequence', steps: ['Seek', 'Surrender', 'See'] },
    shadowNode: 'The cosmic joke: you were already home.',
    thresholdShift: { before: 'THE SEARCH', after: 'THE FINDING' },
    gestureLabel: 'ASK THE QUESTION',
  },
  narrator: {
    metacognitiveTag: 'TRANSCENDENCE',
    ambientSubtext: 'the dance of shiva creates and destroys in the same breath',
    anchorPrompt: 'The universe laughs at the seriousness of the self.',
    midInteraction: { type: 'sequence', steps: ['Form', 'Formless', 'Form again'] },
    thresholdShift: { before: 'THE ILLUSION', after: 'THE WONDER' },
    gestureLabel: 'PIERCE THE VEIL',
  },
  activator: {
    metacognitiveTag: 'AWAKEN',
    ambientSubtext: 'see it all at once',
    anchorPrompt: 'Open your eyes. All of them.',
    midInteraction: { type: 'friction', start: 'Sleeping...', mid: 'Stirring...', max: 'Awake.' },
    thresholdShift: { before: 'THE DREAM', after: 'THE WAKE' },
    gestureLabel: 'OPEN THE EYES',
  },
};

// ── Series 20: Omega & Integration — Final Seal ─────────────────────
const S20: Record<VoiceLaneId, SeriesVoiceTemplate> = {
  companion: {
    metacognitiveTag: 'STATE: INTEGRATING',
    ambientSubtext: 'every fragment belongs to the same whole',
    anchorPrompt: 'All the pieces were always part of one thing.',
    midInteraction: { type: 'sequence', steps: ['Gather', 'Align', 'Seal'] },
    shadowNode: 'Nothing was wasted. Not even the pain.',
    thresholdShift: { before: 'THE FRAGMENTS', after: 'THE WHOLE' },
    gestureLabel: 'SEAL THE CIRCLE',
  },
  coach: {
    metacognitiveTag: 'OMEGA: FINAL',
    ambientSubtext: 'the beginning and the end are the same point',
    anchorPrompt: 'You have done the work. Seal it.',
    midInteraction: { type: 'friction', start: 'Gathering...', mid: 'Aligning...', max: 'Sealed.' },
    thresholdShift: { before: 'THE JOURNEY', after: 'THE ARRIVAL' },
    gestureLabel: 'COMPLETE THE SEAL',
  },
  mirror: {
    metacognitiveTag: 'INTEGRATION',
    ambientSubtext: 'who are you now that you have seen all of this',
    anchorPrompt: 'Look at where you started. Look at where you are.',
    midInteraction: { type: 'sequence', steps: ['Before', 'Through', 'Beyond'] },
    shadowNode: 'The hero was always just the person who kept walking.',
    thresholdShift: { before: 'THE QUESTION', after: 'THE ANSWER' },
    gestureLabel: 'CLOSE THE LOOP',
  },
  narrator: {
    metacognitiveTag: 'OMEGA',
    ambientSubtext: 'the golden spiral returns to where it started one octave higher',
    anchorPrompt: 'The circle closes. A new spiral begins.',
    midInteraction: { type: 'sequence', steps: ['Alpha', 'Journey', 'Omega', 'Alpha again'] },
    thresholdShift: { before: 'THE END', after: 'THE BEGINNING' },
    gestureLabel: 'CLOSE THE SPIRAL',
  },
  activator: {
    metacognitiveTag: 'SEALED',
    ambientSubtext: 'done',
    anchorPrompt: 'It is complete. Stand up.',
    midInteraction: { type: 'friction', start: 'Almost...', mid: 'There...', max: 'Done.' },
    thresholdShift: { before: 'THE WORK', after: 'THE SEAL' },
    gestureLabel: 'STAMP IT',
  },
};

// =====================================================================
// SERIES MAP
// =====================================================================

const SERIES_VOICE_MAP: Record<SeriesId, Record<VoiceLaneId, SeriesVoiceTemplate>> = {
  'physics-engines': S1,
  'quantum-mechanics': S2,
  'biomimetic-algorithms': S3,
  'via-negativa': S4,
  'chrono-acoustic': S5,
  'meta-system-glitch': S6,
  'retro-causal': S7,
  'kinematic-topology': S8,
  'shadow-crucible': S9,
  'reality-bender': S10,
  'epistemic-constructs': S11,
  'friction-mechanics': S12,
  'semantic-translators': S13,
  'social-physics': S14,
  'time-capsule': S15,
  'soma-perception': S16,
  'diplomat-empathy': S17,
  'visionary-strategist': S18,
  'mystic-infinite': S19,
  'omega-integration': S20,
};

// =====================================================================
// KINETIC PAYLOAD DERIVATION
// =====================================================================
// Extracts the transformative noun from the atom's name.
// e.g. "The Chrono-Kinetic Engine" → "THE TIME"
// e.g. "The Centrifuge Engine" → "THE CENTRIFUGE"

function deriveKineticPayload(atomName: string, intent: string): string {
  // Known payload overrides for specific atom name patterns
  const PAYLOAD_MAP: Record<string, string> = {
    'chrono-kinetic': 'THE TIME',
    'phase-shift': 'THE PHASE',
    'z-axis-parallax': 'THE DEPTH',
    'somatic-resonance': 'THE BODY',
    'constructive-destructive': 'THE WAVE',
    'cryptographic': 'THE CODE',
    'symbiotic': 'THE BOND',
    'optical': 'THE LENS',
    'equilibrium': 'THE BALANCE',
    'thermodynamic': 'THE HEAT',
    'wave-collapse': 'THE WAVE',
    'schrodinger-box': 'THE BOX',
    'double-slit': 'THE OBSERVER',
    'many-worlds': 'THE CHOICE',
    'entanglement': 'THE LINK',
    'uncertainty-blur': 'THE BLUR',
    'quantum-tunnel': 'THE WALL',
    'zero-point-field': 'THE VOID',
    'retrocausal': 'THE CAUSE',
    'holographic': 'THE WHOLE',
    'l-system-branching': 'THE BRANCH',
    'boids-flocking': 'THE FLOCK',
    'composting': 'THE DECAY',
    'mycelial-routing': 'THE ROOT',
    'symbiosis': 'THE EXCHANGE',
    'pruning': 'THE CUT',
    'dormancy': 'THE SLEEP',
    'ecosystem-balancer': 'THE SYSTEM',
    'pollination': 'THE SEED',
    'erosion': 'THE SHAPE',
    'sensory-deprivation': 'THE SILENCE',
    'un-naming': 'THE NAME',
    'figure-ground-reversal': 'THE GROUND',
    'vacuum-seal': 'THE SEAL',
    'dark-matter': 'THE UNSEEN',
    'static-clear': 'THE STATIC',
    'apneic-pause': 'THE PAUSE',
    'format-reset': 'THE FORMAT',
    'noise-gate': 'THE GATE',
    'singularity': 'THE POINT',
    'phase-lock': 'THE RHYTHM',
    'vagal-hum': 'THE HUM',
    'isochronic-pacer': 'THE PACE',
    'cymatic-coherence': 'THE PATTERN',
    'audio-zoom': 'THE SIGNAL',
    'brown-noise': 'THE NOISE',
    'tempo-override': 'THE TEMPO',
    'crescendo': 'THE CRESCENDO',
    'standing-wave': 'THE WAVE',
    'silent-rest': 'THE REST',
    'fourth-wall-break': 'THE WALL',
    'lag-spike': 'THE GLITCH',
    'phantom-alert': 'THE ALERT',
    'kernel-panic': 'THE PANIC',
    'algorithm-jammer': 'THE ALGORITHM',
    'reality-tear': 'THE TEAR',
    'muscle-memory': 'THE HABIT',
    'pixelation': 'THE PIXEL',
    'attention-paywall': 'THE ATTENTION',
    'semantic-crash': 'THE MEANING',
    'audio-rescore': 'THE SCORE',
    'chromatic-grade': 'THE COLOR',
    'narrative-flip': 'THE STORY',
    'splicing-timeline': 'THE TIMELINE',
    'prequel-context': 'THE ORIGIN',
    'metadata-rewrite': 'THE DATA',
    'forgiveness-filter': 'THE GRUDGE',
    'ancestral-cut': 'THE LINEAGE',
    'time-travel-rescue': 'THE RESCUE',
    'third-person-shift': 'THE SELF',
    'overview-effect': 'THE OVERVIEW',
    'fractal-zoom': 'THE FRACTAL',
    'deep-time': 'THE AEONS',
    'systemic-zoom': 'THE SYSTEM',
    'ego-zoom': 'THE EGO',
    'micro-step': 'THE STEP',
    'vastness-expansion': 'THE VASTNESS',
    'horizon-infinite': 'THE HORIZON',
    'stardust-dissolve': 'THE STARDUST',
    'holographic-drop': 'THE DROP',
    'crucible-fire': 'THE FIRE',
    'shadow-hug': 'THE SHADOW',
    'projection-mirror': 'THE PROJECTION',
    'solve-coagula': 'THE ALCHEMY',
    'paradox-tension': 'THE PARADOX',
    'monster-taming': 'THE MONSTER',
    'shame-compass': 'THE SHAME',
    'anger-forge': 'THE ANGER',
    'inner-child': 'THE CHILD',
    'phoenix-ash': 'THE ASH',
    'atmosphere-weather': 'THE WEATHER',
    'distortion-grid': 'THE GRID',
    'belief-bridge': 'THE BELIEF',
    'future-memory': 'THE FUTURE',
    'luck-surface': 'THE LUCK',
    'possibility-prism': 'THE PRISM',
    'architect-stone': 'THE STONE',
    'narrative-override': 'THE NARRATIVE',
    'pure-yes': 'THE YES',
    'infinite-ouroboros': 'THE CIRCLE',
    'centrifuge-engine': 'THE SPIN',
    'ladder-of-inference': 'THE LADDER',
    'logic-gate': 'THE LOGIC',
    'steel-man': 'THE ARGUMENT',
    'blind-spot': 'THE BLIND SPOT',
    'sunk-cost-severance': 'THE COST',
    'absurdity-deflation': 'THE ABSURD',
    'first-principles': 'THE PRINCIPLE',
    'echo-cancellation': 'THE ECHO',
    'axiomatic-seal': 'THE AXIOM',
    'inertia-break': 'THE INERTIA',
    'micro-step-shrink': 'THE MOUNTAIN',
    'ulysses-pact': 'THE PACT',
    'friction-injection': 'THE FRICTION',
    'flywheel': 'THE MOMENTUM',
    'good-enough': 'THE PERFECT',
    'burn-rate': 'THE BURN',
    'vector-pivot': 'THE VECTOR',
    'friction-polish': 'THE ROUGH',
    'kinetic-seal': 'THE MOTION',
    'subtext-scanner': 'THE SUBTEXT',
    'translator-peel': 'THE LAYER',
    'yet-append': 'THE YET',
    'conjunction-shift': 'THE BUT',
    'headline-rewrite': 'THE HEADLINE',
    'label-inception': 'THE LABEL',
    'meaning-mine': 'THE MEANING',
    'absurdity-filter': 'THE ABSURD',
    'silent-mirror': 'THE REFLECTION',
    'interpreter-seal': 'THE TRANSLATION',
    'reverse-orbit': 'THE ORBIT',
    'forcefield': 'THE FIELD',
    'status-seesaw': 'THE STATUS',
    'empathy-bridge': 'THE BRIDGE',
    'aikido-redirect': 'THE FORCE',
    'social-battery': 'THE BATTERY',
    'gossip-firewall': 'THE NOISE',
    'lighthouse': 'THE LIGHT',
    'roche-limit': 'THE LIMIT',
    'diplomat-seal': 'THE TRUCE',
    'open-when': 'THE LETTER',
    'rage-vault': 'THE RAGE',
    'prediction-stake': 'THE PREDICTION',
    'dead-mans-switch': 'THE SWITCH',
    'regret-minimization': 'THE REGRET',
    'pre-hindsight': 'THE HINDSIGHT',
    'branch-pruner': 'THE BRANCH',
    'worst-case-simulator': 'THE WORST CASE',
    'ten-year-echo': 'THE ECHO',
    'capsule-seal': 'THE CAPSULE',
    'skin-map': 'THE MAP',
    'pulse-reader': 'THE PULSE',
    'fascia-wave': 'THE FASCIA',
    'proprioception': 'THE POSITION',
    'micro-texture': 'THE TEXTURE',
    'voice-box': 'THE VOICE',
    'blind-walk': 'THE DARK',
    'temperature-scan': 'THE TEMPERATURE',
    'gut-signal': 'THE GUT',
    'soma-seal': 'THE SOMA',
    'mirror-shield': 'THE SHIELD',
    'truce-table': 'THE TABLE',
    'perspective-swap': 'THE PERSPECTIVE',
    'translation-ear': 'THE EAR',
    'boundary-dance': 'THE DANCE',
    'third-chair': 'THE CHAIR',
    'steel-man-build': 'THE STEEL MAN',
    'de-escalation': 'THE HEAT',
    'mirror-neuron': 'THE NEURON',
    'common-ground-seal': 'THE GROUND',
    'essentialism': 'THE ESSENTIAL',
    'compound-interest': 'THE COMPOUND',
    'deep-work': 'THE DEPTH',
    'leverage-engine': 'THE LEVER',
    'horizon-scan': 'THE HORIZON',
    'obstacle-flip': 'THE OBSTACLE',
    'courage-map': 'THE COURAGE',
    'abundance-scan': 'THE ABUNDANCE',
    'permissionless': 'THE PERMISSION',
    'becoming-seal': 'THE BECOMING',
    'maya-veil': 'THE VEIL',
    'no-self': 'THE SELF',
    'cosmic-joke': 'THE JOKE',
    'space-between': 'THE SPACE',
    'beginners-mind': 'THE MIND',
    'dance-of-shiva': 'THE DANCE',
    'unplanned-hour': 'THE HOUR',
    'wonder-walk': 'THE WONDER',
    'light-source': 'THE LIGHT',
    'mystic-seal': 'THE MYSTERY',
    'prism-return': 'THE PRISM',
    'golden-spiral': 'THE SPIRAL',
    'time-collapse': 'THE COLLAPSE',
    'mirror-of-truth': 'THE MIRROR',
    'event-horizon': 'THE HORIZON',
    'alpha-omega': 'THE ALPHA',
    'circle-close': 'THE CIRCLE',
    'final-exhale': 'THE EXHALE',
    'tail-swallow': 'THE TAIL',
    'atlas-seal': 'THE ATLAS',
  };

  return PAYLOAD_MAP[atomName] ?? 'THE TRUTH';
}

// =====================================================================
// PUBLIC API
// =====================================================================

/**
 * Derives atomic voice copy for any atom × voice lane combination.
 * Uses series-level templates customized with atom-specific kinetic payload.
 */
export function getAtomicVoiceCopy(atomId: AtomId, voiceLane: VoiceLaneId): AtomicVoiceCopy {
  const meta = ATOM_CATALOG[atomId];
  if (!meta) {
    // Fallback for unknown atoms
    return {
      metacognitiveTag: 'STATE: ACTIVE',
      ambientSubtext: 'breathe',
      anchorPrompt: 'Be here now.',
      kineticPayload: 'THE TRUTH',
      midInteraction: { type: 'friction', start: 'Beginning...', mid: 'Moving...', max: 'Here.' },
      thresholdShift: { before: 'THE OLD', after: 'THE NEW' },
      gestureLabel: 'ENGAGE',
    };
  }

  const seriesTemplate = SERIES_VOICE_MAP[meta.series]?.[voiceLane];
  if (!seriesTemplate) {
    // Fallback if series not yet mapped
    return {
      metacognitiveTag: 'STATE: ACTIVE',
      ambientSubtext: meta.intent.slice(0, 40).toLowerCase(),
      anchorPrompt: 'Be present with this.',
      kineticPayload: deriveKineticPayload(atomId, meta.intent),
      midInteraction: { type: 'friction', start: 'Beginning...', mid: 'Deepening...', max: 'Resolved.' },
      thresholdShift: { before: 'THE OLD', after: 'THE NEW' },
      gestureLabel: 'ENGAGE',
    };
  }

  return {
    ...seriesTemplate,
    kineticPayload: deriveKineticPayload(atomId, meta.intent),
  };
}
