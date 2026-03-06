/**
 * NAVICUE COMPOSITION CONTRACT
 * ============================
 *
 * The type-only foundation for the 7-layer NaviCue Composition Stack.
 * Every layer, every variable, every constraint — expressed as types.
 *
 * This file imports NOTHING. It is the bedrock.
 *
 * ARCHITECTURE:
 *   Layer 1: Diagnostic Core    — clinical targeting (backend-resolved)
 *   Layer 2: Living Atmosphere  — color, engine, response profile
 *   Layer 3: Pulse & Motion     — breath, motion curves, timing
 *   Layer 4: Persona            — voice lane, typography, materialization
 *   Layer 5: Temporal Bookends  — entrance choreography, exit transition
 *   Layer 6: Hero Physics       — the atom (pure physics engine)
 *   Layer 7: Atomic Voice       — 8-variable typographic instrument
 *
 * CONSUMERS:
 *   - NaviCue Player (the composition renderer)
 *   - Atom components (via `composed` flag)
 *   - Voice Library (static copy dictionaries)
 *   - Backend LLM pipeline (JSON payload schema)
 *   - Design Center labs (composition workspace)
 *
 * RULE: This file defines shapes, not values. Data lives elsewhere.
 * RULE: Every constraint from the Entrance Matrix is encoded as a type.
 * RULE: If a number appears here, it is a hard limit, not a suggestion.
 */

// =====================================================================
// LAYER 1: DIAGNOSTIC CORE
// (The Invisible Trigger — backend-resolved, frontend-received)
// =====================================================================

/**
 * The psychological architecture driving the mindblock.
 * Dictates WHY we intervene. Resolved by clinical AI.
 */
export type SchemaTarget =
  | 'defectiveness'
  | 'abandonment'
  | 'unrelenting-standards'
  | 'enmeshment'
  | 'emotional-inhibition'
  | 'subjugation'
  | 'mistrust'
  | 'vulnerability'
  | 'failure'
  | 'entitlement'
  | 'insufficient-self-control'
  | 'self-sacrifice'
  | 'approval-seeking'
  | 'negativity'
  | 'punitiveness';

/**
 * The user's autonomic velocity. 1 = calm resting, 5 = amygdala hijack.
 * Dictates HOW we intervene. At high heat, complex reading is locked out
 * and the system forces pure somatic mechanics.
 */
export type HeatBand = 1 | 2 | 3 | 4 | 5;

/**
 * The temporal reality of the moment.
 * Dictates WHEN we intervene. Morning needs emergence; night needs dissolution.
 */
export type ChronoContext = 'morning' | 'work' | 'social' | 'night';

/** The complete Layer 1 input from the backend. */
export interface DiagnosticCore {
  schemaTarget: SchemaTarget;
  heatBand: HeatBand;
  chronoContext: ChronoContext;
}

// =====================================================================
// LAYER 2: THE LIVING ATMOSPHERE
// (The Background Engine — 4,608 unique skies)
// =====================================================================

/**
 * 8 Color Signatures — the emotional hue of the glass.
 * Each maps to a full palette (primary, accent, glow, surface).
 */
export type ColorSignatureId =
  | 'sacred-ordinary'     // Warm earth, grounded, present
  | 'quiet-authority'     // Deep purple, sovereign, regal
  | 'neural-reset'        // Clinical cyan, diagnostic, clear
  | 'amber-resonance'     // Warm gold, activating, energetic
  | 'void-presence'       // Near-black, spacious, empty
  | 'verdant-calm'        // Forest green, organic, safe
  | 'twilight-shift'      // Dusk blue-pink, transitional, liminal
  | 'radiant-white';      // Pure light, clarity, resolution

export interface ColorSignature {
  id: ColorSignatureId;
  name: string;
  /** Primary brand color (hex) */
  primary: string;
  /** Accent for interactive elements (rgba) */
  accent: string;
  /** Ambient glow for atmosphere (rgba) */
  glow: string;
  /** Surface tint (rgba) */
  surface: string;
  /** Secondary complement (rgba) */
  secondary: string;
}

/**
 * 6 Visual Engines — the WebGL/Canvas material reality.
 */
export type VisualEngineId =
  | 'particle-field'    // Floating dots — a living, breathing sky
  | 'gradient-mesh'     // Morphing color blobs — Northern Lights
  | 'noise-fabric'      // Perlin noise — tactile cloth beneath words
  | 'constellation'     // Connected dots — neural pathways visible
  | 'liquid-pool'       // Fluid simulation — warmth pooling toward touch
  | 'void';             // Almost nothing — the power of emptiness

export interface VisualEngineParams {
  density: number;      // 0–1 particle/node count multiplier
  speed: number;        // 0–1 animation velocity
  complexity: number;   // 0–1 structural detail
  reactivity: number;   // 0–1 response to touch/breath
  depth: number;        // 0–1 parallax/z-depth
}

/**
 * 4 Response Profiles — kinetic empathy between user and environment.
 */
export type ResponseProfileId =
  | 'resonance'   // Echo — the background mirrors the gesture
  | 'contrast'    // Koan — the background does the opposite
  | 'witness'     // Ghost — notices but doesn't perform
  | 'immersion';  // Dissolve — boundary between hero and background erased

export interface LivingAtmosphere {
  colorSignature: ColorSignatureId;
  visualEngine: VisualEngineId;
  engineParams: VisualEngineParams;
  responseProfile: ResponseProfileId;
}

// =====================================================================
// LAYER 3: PULSE & MOTION
// (The Nervous System — breath, easing, timing)
// =====================================================================

/**
 * Breath patterns — the master sine-based timing function.
 * Referenced from useBreathEngine; defined here for composition contracts.
 */
export type BreathPatternId = 'calm' | 'box' | 'simple' | 'energize';

/**
 * Motion curves — the physics of feeling.
 * Each is a named easing preset with exact cubic-bezier values.
 */
export type MotionCurveId =
  | 'arrival'     // Generous deceleration — how insight lands
  | 'departure'   // Quick, clean, complete — how pain leaves
  | 'spring';     // Organic 2px overshoot — digital mass has weight

export interface MotionCurve {
  id: MotionCurveId;
  /** CSS cubic-bezier string */
  cubicBezier: string;
  /** Framer Motion easing array [x1, y1, x2, y2] */
  motionEasing: readonly [number, number, number, number];
  /** Human description */
  feel: string;
}

export interface PulseMotion {
  breathPattern: BreathPatternId;
  /** Which motion curve governs text/element arrival */
  arrivalCurve: MotionCurveId;
  /** Which motion curve governs text/element departure */
  departureCurve: MotionCurveId;
}

// =====================================================================
// LAYER 4: THE PERSONA
// (Voice lane, typography binding, materialization)
// =====================================================================

/**
 * 5 Voice Lanes — the psychological archetype the system adopts.
 * Each lane has strict copy rules encoded in VoiceLaneConstraints.
 */
export type VoiceLaneId =
  | 'companion'   // Warm, alongside. "We," "Here," "With me." Max 10 words.
  | 'coach'       // Direct, encouraging. Verbs. Max 8 words.
  | 'mirror'      // Reflective, spacious. Questions. Max 10 words.
  | 'narrator'    // Observational, decentered. Third-person only. Max 12 words.
  | 'activator';  // Energetic, brief. Pattern-breaking. Max 6 words.

export interface VoiceLaneConstraints {
  id: VoiceLaneId;
  name: string;
  /** The emotional vibe in one phrase */
  vibe: string;
  /** Hard word ceiling for entrance copy */
  wordMax: number;
  /** Pronoun/grammar rules */
  grammarRules: string[];
  /** Typography preference: which font stack this voice gravitates to */
  typographyAffinity: 'primary' | 'secondary' | 'mono';
}

/**
 * 4 Materializations — how text physically enters the glass.
 * Each has an exact millisecond duration. Timing shapes meaning.
 */
export type MaterializationId =
  | 'emerge'      // Opacity 0→1 over 1200ms. Smooth, breathing.
  | 'dissolve'    // Opacity 1→0 over 2000ms. Letting go.
  | 'burn-in'     // Contrast drop + brightness spike over 800ms. Hard truth.
  | 'immediate';  // 0ms. Pattern disruption. Smelling salts.

export interface MaterializationSpec {
  id: MaterializationId;
  /** Duration in milliseconds (0 for immediate) */
  durationMs: number;
  /** Human description of the kinetic feel */
  feel: string;
  /** CSS/Motion animation properties */
  animation: {
    /** Starting opacity */
    opacityFrom: number;
    /** Ending opacity */
    opacityTo: number;
    /** Optional brightness spike (for burn-in) */
    brightnessSpike?: number;
    /** Optional blur start (for dissolve) */
    blurFrom?: number;
  };
}

export interface Persona {
  voiceLane: VoiceLaneId;
  /** Override typography stack (defaults to voice affinity) */
  typographyOverride?: 'primary' | 'secondary' | 'mono';
  /** Materialization for entrance copy */
  entranceMaterialization: MaterializationId;
  /** Materialization for exit copy */
  exitMaterialization: MaterializationId;
}

// =====================================================================
// LAYER 5: THE TEMPORAL BOOKENDS
// (Opening & Closing — the ceremony's boundaries)
// =====================================================================

/**
 * 8 Entrance Architectures — how the intervention begins.
 * Each has a unique physics signature and psychological vibe.
 */
export type EntranceArchitectureId =
  | 'the-silence'      // void → signal → void → reveal. Profound decentering.
  | 'the-breath-gate'  // atmosphere → signal → reveal. Breath opens the door.
  | 'the-dissolution'  // signal(blur) → reveal(defrost). Piercing the illusion.
  | 'the-scene-build'  // void → atmosphere → signal → reveal. Safe container.
  | 'the-emergence'    // atmosphere → signal → reveal. Truth rises from below.
  | 'the-gathering'    // Fragments converge. Meaning assembles itself.
  | 'the-threshold'    // Boundary waits. Tap to cross. Agency and permission.
  | 'cold-arrival';    // Already here. Zero easing. Hard truth reset.

/**
 * Entrance Copy Mode — determines what text (if any) appears during entering phase.
 *
 *   'ceremony'   — Z-4 entrance copy runs its full choreography (signal phase text),
 *                  then clears. Anchor prompt appears fresh when active begins.
 *                  Used when the COPY IS the entrance (The Silence, Breath Gate,
 *                  Threshold, Scene Build).
 *
 *   'hero-voice' — No Z-4 entrance copy. Instead, the anchor prompt (Z-3) fades in
 *                  AS the entrance, creating a seamless entering→active transition
 *                  with zero text swap. The visual transition IS the ceremony.
 *                  Used for The Emergence, Dissolution, Gathering.
 *
 *   'silent'     — No copy at all during entering. Atmosphere + atom entrance
 *                  animation only. Anchor prompt appears when active starts.
 *                  Used for Cold Arrival (the absence of ceremony IS the intervention).
 */
export type EntranceCopyMode = 'ceremony' | 'hero-voice' | 'silent';

export interface EntranceSpec {
  id: EntranceArchitectureId;
  /** Phase sequence: what appears in what order */
  phaseSequence: readonly ('void' | 'atmosphere' | 'signal' | 'reveal' | 'interaction')[];
  /** Total entrance duration in ms (before active phase begins) */
  durationMs: number;
  /** Psychological vibe in one phrase */
  vibe: string;
  /** Whether the user must take an action to proceed (e.g., breathe, tap) */
  requiresUserAction: boolean;
  /** What text layer (if any) is visible during the entering phase */
  copyMode: EntranceCopyMode;
}

/**
 * 4 Exit Transitions — how the intervention resolves.
 * The somatic save-state. The stamp on the brain.
 */
export type ExitTransitionId =
  | 'dissolve'    // Slow fade to #000 void. Relief and letting go.
  | 'burn-in'     // Contrast drop + brightness spike. Hard truth locked.
  | 'emerge'      // Elements rise softly. Hope and lingering resonance.
  | 'immediate';  // Instant snap. Pattern disruption.

export interface ExitSpec {
  id: ExitTransitionId;
  /** Duration in ms */
  durationMs: number;
  /** What the final visual state is */
  finalState: 'void' | 'white' | 'atmosphere' | 'frozen';
  /** Psychological vibe */
  vibe: string;
}

export interface TemporalBookends {
  entrance: EntranceArchitectureId;
  exit: ExitTransitionId;
}

// =====================================================================
// VOCAL FAMILIES
// (The 30 Pre-Configured Architectural Threads)
// =====================================================================

/**
 * 30 Vocal Families — pre-configured composition presets that auto-fill
 * voice lane, entrance, gesture, exit, breath, and color signature.
 * They are starting points, not prisons — every dial can be overridden.
 *
 * Families 1–10: Primary (core therapeutic arcs)
 * Families 11–20: Secondary (specialized threads)
 * Families 21–30: Tertiary (integration & performance threads)
 */
export type VocalFamilyId =
  // ── Primary (1–10) ─────────────────────────────────────────
  | 'the-downshift'       //  1 — Arrest panic, restore baseline
  | 'the-disruption'      //  2 — Break rumination loop
  | 'the-witness'         //  3 — Cognitive defusion, dissolve ego
  | 'the-architect'       //  4 — Future-self, boundary setting
  | 'the-surgeon'         //  5 — Tactical thought decoupling
  | 'the-alchemist'       //  6 — Creative block, flow states
  | 'the-purge'           //  7 — Catharsis, releasing grief/rage
  | 'the-archaeologist'   //  8 — Shadow work, subconscious
  | 'the-anchor'          //  9 — Existential dread, grounding
  | 'the-weaver'          // 10 — Integration, kintsugi
  // ── Secondary (11–20) ──────────────────────────────────────
  | 'the-lullaby'         // 11 — Insomnia, hypnagogic descent
  | 'the-crucible'        // 12 — Distress tolerance, grit
  | 'the-prism'           // 13 — Cognitive reframing
  | 'the-metronome'       // 14 — ADHD, deep work
  | 'the-pendulum'        // 15 — Splitting, middle path
  | 'the-sieve'           // 16 — Information overload
  | 'the-decoupler'       // 17 — Trauma untangling
  | 'the-chasm'           // 18 — Leap of faith
  | 'the-compass'         // 19 — Ambivalence, values
  | 'the-kintsugi'        // 20 — Self-compassion
  // ── Tertiary (21–30) ───────────────────────────────────────
  | 'the-tether'          // 21 — Anxious attachment
  | 'the-grounding-wire'  // 22 — Dissociation
  | 'the-forge'           // 23 — Post-failure resilience
  | 'the-tuning-fork'     // 24 — Gut vs brain
  | 'the-sculptor'        // 25 — Addiction, bad habits
  | 'the-echo'            // 26 — Imposter syndrome
  | 'the-valve'           // 27 — Micro-frustrations
  | 'the-horizon'         // 28 — Apathy, nihilism
  | 'the-mirror-neuron'   // 29 — Resentment
  | 'the-catalyst';       // 30 — Consumption to creation

/**
 * A Vocal Family definition — the complete preset that auto-fills
 * all composition dials when selected.
 */
export interface VocalFamily {
  id: VocalFamilyId;
  /** Family number (1–30) */
  number: number;
  /** Human name */
  name: string;
  /** Therapeutic goal */
  goal: string;
  /** Clinical target description */
  clinicalTarget: string;
  /** Heat band range [min, max] */
  heatRange: readonly [HeatBand, HeatBand];
  /** Target schemas */
  schemas: readonly SchemaTarget[];
  /** One-line vibe */
  vibe: string;
  /** Tier classification */
  tier: 'primary' | 'secondary' | 'tertiary';

  // ── The preset dials ────────────────────────────────────────
  /** Default voice lane */
  voiceAnchor: VoiceLaneId;
  /** Default color signature */
  colorSignature: ColorSignatureId;
  /** Default visual engine (from environment column) */
  visualEngine: VisualEngineId;
  /** Default entrance architecture */
  entrance: EntranceArchitectureId;
  /** Default gesture */
  gesture: GestureId;
  /** Default exit transition */
  exit: ExitTransitionId;
  /** Default breath pattern */
  breathPattern: BreathPatternId;
}

// =====================================================================
// ATOM CONTENT PROFILE
// (The content contract for each atom — which voice slots it consumes)
// =====================================================================

/**
 * The 8 atomic voice variable keys.
 * Each atom declares which of these it consumes.
 */
export type AtomicVoiceSlot =
  | 'anchorPrompt'
  | 'kineticPayload'
  | 'reactiveFriction'
  | 'ambientSubtext'
  | 'metacognitiveTag'
  | 'progressiveSequence'
  | 'shadowNode'
  | 'thresholdShift';

/**
 * The content profile for a single atom.
 * Declares WHAT content slots the atom consumes, what gesture it uses,
 * and which vocal families / entrances / exits it has affinity for.
 *
 * This is metadata ON the atom — it lives alongside AtomMeta,
 * NOT inside the voice payload. It tells the composition system
 * "this atom needs these slots filled" before any copy is written.
 */
export interface AtomContentProfile {
  /** Which of the 8 voice variables this atom renders */
  voiceSlots: readonly AtomicVoiceSlot[];
  /** Whether mid-interaction uses reactive friction or progressive sequence */
  midInteractionMode: 'friction' | 'sequence' | 'none';
  /** Primary gesture (derived from atom's interaction surfaces) */
  primaryGesture: GestureId;
  /** Preferred entrance architectures (ordered by affinity, not exclusive) */
  entranceAffinity: readonly EntranceArchitectureId[];
  /** Preferred exit transitions (ordered by affinity) */
  exitAffinity: readonly ExitTransitionId[];
  /** Vocal families this atom maps well to (ordered by affinity) */
  vocalFamilyAffinity: readonly VocalFamilyId[];
}

// =====================================================================
// LAYER 6: HERO PHYSICS
// (The atom — references AtomId from atoms/types.ts)
// =====================================================================

/**
 * 6 Gesture types — the kinetic vocabulary.
 * Each gesture is a somatic rep, not a UI mechanic.
 */
export type GestureId =
  | 'tap'       // Quick, decisive agency
  | 'hold'      // Sustained presence, building heat
  | 'drag'      // Positional movement, creating paths
  | 'swipe'     // Erasing, severing, composting
  | 'pinch'     // Zooming, expanding, contracting
  | 'breathe';  // Microphone/breath input, somatic release

/**
 * Resolution Matrix — auto-binds gesture to optimal atmosphere.
 * The environment physically supports the action.
 */
export const RESOLUTION_MATRIX: Record<GestureId, VisualEngineId> = {
  tap: 'particle-field',     // Quick agency scatters particles
  hold: 'gradient-mesh',     // Patient presence = slow-morphing warmth
  drag: 'constellation',     // Movement leaves glowing neural pathways
  swipe: 'particle-field',   // Decisive swipe scatters/shatters
  pinch: 'noise-fabric',     // Scale gesture ripples through cloth
  breathe: 'void',           // Pure observation requires emptiness
} as const;

export interface HeroPhysics {
  /** The atom ID from the 200-atom library */
  atomId: string; // AtomId — kept as string to avoid circular import
  /** Primary gesture for this interaction */
  primaryGesture: GestureId;
  /** Whether the Resolution Matrix should auto-select the atmosphere engine */
  useResolutionMatrix: boolean;
  /**
   * Hero Zone — governs WHERE the atom canvas renders within the viewport.
   * All values are viewport-height fractions (0–1).
   *
   * The compositor constrains the Z-2 atom wrapper to this zone,
   * passing zone-relative dimensions to the atom component.
   * Space ABOVE the zone = anchor prompt safe area.
   * Space BELOW the zone = gesture CTA safe area.
   *
   * Default: { topFrac: 0.12, heightFrac: 0.76 } — centered with 12% safe zones.
   */
  heroZone?: {
    /** Top edge as viewport-height fraction (default 0.12) */
    topFrac: number;
    /** Zone height as viewport-height fraction (default 0.76) */
    heightFrac: number;
  };
}

// =====================================================================
// LAYER 7: THE ATOMIC VOICE
// (The 8-Variable Typographic Instrument)
// =====================================================================

// ── Typographic Throttle Limits ─────────────────────────────────────
// Hard mathematical constraints that prevent the Design Leak.
// The LLM's JSON schema enforces these via maxLength.

export interface ThrottleLimits {
  wordMax: number;
  charMax: number;
  lineMax: number;
}

/** Throttle presets for each text slot */
export const THROTTLE = {
  /** Entrance: h3, spacious and breathable */
  entrance:       { wordMax: 12, charMax: 65, lineMax: 2 },
  /** Hero Object: display.hero, massive weight */
  heroObject:     { wordMax: 2,  charMax: 14, lineMax: 1 },
  /** Hero Context: body.large, longest allowed */
  heroContext:     { wordMax: 15, charMax: 85, lineMax: 3 },
  /** Gesture CTA: label.medium, must fit button */
  gestureCta:     { wordMax: 3,  charMax: 20, lineMax: 1 },
  /** Exit Receipt: h1, definitive stamp */
  exitReceipt:    { wordMax: 10, charMax: 55, lineMax: 2 },
  /** Anchor Prompt: h3, breathing animation */
  anchorPrompt:   { wordMax: 8,  charMax: 45, lineMax: 2 },
  /** Kinetic Payload: display.hero, rigid body */
  kineticPayload: { wordMax: 2,  charMax: 14, lineMax: 1 },
  /** Reactive Friction: body.large italic, per state */
  reactiveFriction: { wordMax: 3, charMax: 20, lineMax: 1 },
  /** Ambient Subtext: h1 blurred, subconscious */
  ambientSubtext: { wordMax: 5,  charMax: 35, lineMax: 1 },
  /** Metacognitive Tag: mono 11px, clinical HUD */
  metacognitiveTag: { wordMax: 4, charMax: 25, lineMax: 1 },
  /** Progressive Sequence: per step */
  progressiveStep: { wordMax: 1, charMax: 12, lineMax: 1 },
  /** Shadow Node: counter-weight */
  shadowNode:     { wordMax: 3,  charMax: 20, lineMax: 1 },
  /** Threshold Shift: must match before-state char count */
  thresholdShift: { wordMax: 2,  charMax: 14, lineMax: 1 },
} as const;

// ── The 8 Typographic Variables ─────────────────────────────────────

/** 1. Anchor Prompt — the primary guide floating in the safe zone */
export interface AnchorPrompt {
  text: string;
  /** Type scale: heading.h3 */
  /** Physics: static, gentle breathing (scale 1.0→1.02) */
}

/** 2. Kinetic Payload — the heavy object mapped to rigid bodies */
export interface KineticPayload {
  text: string;
  /** Type scale: display.hero */
  /** Physics: Matter.js rigid body — carries mass, friction, restitution */
}

/** 3. Reactive Friction — velocity-mapped copy that responds to touch */
export interface ReactiveFriction {
  /** Copy shown at different interaction intensities */
  states: {
    start: string;   // User begins interaction
    mid: string;     // Intensity increases
    max: string;     // Maximum tension/velocity
  };
  /** Type scale: body.large (italics) */
  /** Physics: tied to touch velocity or sustained pressure */
}

/** 4. Ambient Subtext — faint, blurred text in the z-depth */
export interface AmbientSubtext {
  text: string;
  /** Type scale: heading.h1, blur(8px), opacity 0.08 */
  /** Physics: parallax scrolling (moves opposite to thumb) */
}

/** 5. Metacognitive Tag — clinical HUD data in the corner */
export interface MetacognitiveTag {
  text: string;
  /** Type scale: ui.caption 11px or fonts.mono, tracked out, uppercase */
  /** Physics: fixed position, pure white on deep black */
}

/** 6. Progressive Sequence — text that unrolls with sequential input */
export interface ProgressiveSequence {
  steps: string[];
  /** Type scale: label.medium */
  /** Physics: appends or swaps on each onTap/onStep event */
}

/** 7. Shadow Node — hidden counter-weight revealed by interaction */
export interface ShadowNode {
  text: string;
  /** Type scale: heading.h3 (color-inverted) */
  /** Physics: opacity tied to proximity, visible only when main node moves */
}

/** 8. Threshold Shift — semantic morph at the resolution moment */
export interface ThresholdShift {
  before: string;
  after: string;
  /** Type scale: inherits from Kinetic Payload, shifts font family */
  /** Physics: crossfade, letter-scrambling, or particle-reassembly */
  /** RULE: `after` char count must match `before` char count */
}

/**
 * The complete Atomic Voice payload.
 * Not every atom uses all 8 variables — each is optional.
 * The LLM acts as a symphonic composer, choosing which to activate.
 */
export interface AtomicVoicePayload {
  anchorPrompt?: AnchorPrompt;
  kineticPayload?: KineticPayload;
  reactiveFriction?: ReactiveFriction;
  ambientSubtext?: AmbientSubtext;
  metacognitiveTag?: MetacognitiveTag;
  progressiveSequence?: ProgressiveSequence;
  shadowNode?: ShadowNode;
  thresholdShift?: ThresholdShift;
}

// =====================================================================
// LAYER 7b: THE NARRATIVE PAYLOAD (Breathing HUD Architecture)
// (Replaces the 8-variable AtomicVoice with 7 narrative elements)
// See: /src/imports/breathing-hud-spec.md
// =====================================================================

/**
 * Narrative Density — how much text scaffolding this NaviCue carries.
 * Stream sequencing alternates densities like musical dynamics.
 */
export type NarrativeDensity = 'full' | 'core' | 'minimal' | 'silent';

/**
 * Collapse Model — how the Narrative Canopy collapses into the Semantic Pill.
 * Determined by the atom's primary interaction model.
 */
export type CollapseModel = 'touch' | 'breath-cycles' | 'timed';

/**
 * Hook Position — where the Inbound Hook materializes on screen.
 * Driven by entrance architecture type.
 */
export type HookPosition = 'center-fade' | 'bottom-rise' | 'peripheral';

/**
 * The complete Narrative Payload — the 7-element Breathing HUD data contract.
 *
 * Not every element is always present — `density` determines which subset
 * is active. The BreathingHUD component renders only what exists.
 *
 * DENSITY → ELEMENTS:
 *   'full'    → All 7 (hook + canopy + pill + ambient + whisper + morph + receipt)
 *   'core'    → hook + canopy + pill + morph + receipt
 *   'minimal' → hook + receipt only
 *   'silent'  → ambient only (zero readable text)
 */
export interface NarrativePayload {
  density: NarrativeDensity;
  collapseModel: CollapseModel;

  /** 1. Inbound Hook — bridges from previous NaviCue (voice-lane word ceiling) */
  inboundHook?: {
    text: string;
    position: HookPosition;
  };

  /** 2. Narrative Canopy — the Why (<=40 words, collapses on interaction) */
  narrativeCanopy?: {
    text: string;
    /** Shortened version shown on re-toggle (<=8 words) */
    condensed: string;
  };

  /**
   * 3+6. Semantic Pill + Threshold Morph
   * `before` is the pill label during ACTIVE; `after` is the morph target on RESOLVING.
   * The pill scrambles letter-by-letter from before→after.
   */
  semanticPill?: {
    before: string;
    after: string;
    /** If true, `before` = previous NaviCue's pill `after` (stream chaining) */
    chainPrevious?: boolean;
  };

  /** 4. Ambient Subtext — user's anxious voice (<=6 words, always lowercase, first-person) */
  ambientSubtext?: {
    text: string;
  };

  /** 5. Idle Whisper — dwell-triggered nudge with dual triggers */
  idleWhisper?: {
    /** Shown when user hasn't touched at all (5s timeout) */
    invite: string;
    /** Shown when user is stuck mid-interaction (4s no-resolution timeout) */
    hint: string;
  };

  /** 7. Outbound Receipt — final stamp after 1.5s afterglow gap (<=10 words) */
  outboundReceipt?: {
    text: string;
  };
}

/** Throttle presets for the 7 narrative elements */
export const NARRATIVE_THROTTLE = {
  /** Inbound Hook — per voice lane word ceiling */
  inboundHook: {
    companion: { wordMax: 10, charMax: 55 },
    coach:     { wordMax: 8,  charMax: 45 },
    mirror:    { wordMax: 10, charMax: 55 },
    narrator:  { wordMax: 12, charMax: 65 },
    activator: { wordMax: 6,  charMax: 30 },
  },
  /** Narrative Canopy — the main text block */
  narrativeCanopy: { wordMax: 40, charMax: 240, lineMax: 4 },
  /** Canopy Condensed — re-toggle summary */
  canopyCondensed: { wordMax: 8, charMax: 45 },
  /** Semantic Pill — the collapsed essence */
  semanticPill:    { wordMax: 2, charMax: 14 },
  /** Ambient Subtext — the subconscious whisper */
  ambientSubtext:  { wordMax: 6, charMax: 35 },
  /** Idle Whisper — dwell-triggered invite/hint */
  idleWhisper:     { wordMax: 4, charMax: 25 },
  /** Threshold Morph — pill after-state */
  thresholdMorph:  { wordMax: 2, charMax: 14 },
  /** Outbound Receipt — exit stamp */
  outboundReceipt: { wordMax: 10, charMax: 55, lineMax: 2 },
} as const;

// ── Gesture & Exit Copy (static front-end library, not LLM) ─────────

/**
 * Token format the LLM appends to reference static copy.
 * e.g., "swipe_coach" → front-end library resolves the exact words.
 */
export interface GestureToken {
  gesture: GestureId;
  voice: VoiceLaneId;
}

export interface ExitToken {
  exit: ExitTransitionId;
  voice: VoiceLaneId;
}

// =====================================================================
// THE FULL NAVICUE COMPOSITION
// (All 7 layers bound into a single deliverable)
// =====================================================================

/**
 * A fully resolved NaviCue composition — everything the player needs
 * to render a complete therapeutic interaction.
 *
 * In production: Layer 1 is resolved by clinical AI,
 * Layers 2–5 are derived from the Resolution Matrix + backend config,
 * Layer 6 is selected from the atom library,
 * Layer 7 is generated by the LLM.
 *
 * In the design center: all values are manually dialed for testing.
 */
export interface NaviCueComposition {
  /** Unique composition ID */
  id: string;

  // ── The 7 Layers ───────────────────────────────────────────
  diagnosticCore: DiagnosticCore;
  livingAtmosphere: LivingAtmosphere;
  pulseMotion: PulseMotion;
  persona: Persona;
  temporalBookends: TemporalBookends;
  heroPhysics: HeroPhysics;
  atomicVoice: AtomicVoicePayload;

  // ── Bookend Copy (resolved from voice library) ─────────────
  entranceCopy: {
    text: string;
    /** Optional follow-up line (for multi-beat entrances like The Silence) */
    followText?: string;
  };
  gestureLabel: string;
  exitReceipt: string;

  // ── Breathing HUD Narrative (Layer 7b) ─────────────────────
  /** The 7-element narrative payload for the Breathing HUD system.
   *  When present, the BreathingHUD component renders this instead of
   *  the legacy Z-3 atomicVoice slots. */
  narrative?: NarrativePayload;
}

// =====================================================================
// PLAYER RUNTIME STATE
// =====================================================================

/**
 * The player's real-time state during NaviCue playback.
 * Drives phase transitions, materialization, and resolution detection.
 */
export type PlayerPhase =
  | 'loading'     // Composition being resolved
  | 'entering'    // Entrance choreography playing
  | 'active'      // Hero physics + atomic voice live
  | 'resolving'   // Resolution detected, exit transition starting
  | 'receipt'     // Final exit receipt displayed
  | 'complete';   // NaviCue finished

export interface PlayerState {
  phase: PlayerPhase;
  /** Elapsed time in current phase (ms) */
  phaseElapsed: number;
  /** Total elapsed time since entering (ms) */
  totalElapsed: number;
  /** 0–1 atom state (from onStateChange callback) */
  atomState: number;
  /** Whether the atom has signaled resolution */
  resolved: boolean;
  /** Current breath amplitude (from breath engine) */
  breathAmplitude: number;
  /** Current breath phase name */
  breathPhase: string;
}

// =====================================================================
// COMPOSITION BUILDING HELPERS
// =====================================================================

/**
 * A test/preview composition with sensible defaults.
 * Used by the design center and player dev mode.
 */
export interface CompositionOverrides {
  atomId?: string;
  voiceLane?: VoiceLaneId;
  entrance?: EntranceArchitectureId;
  exit?: ExitTransitionId;
  colorSignature?: ColorSignatureId;
  visualEngine?: VisualEngineId;
  breathPattern?: BreathPatternId;
  heatBand?: HeatBand;
}

// =====================================================================
// FUTURE: JOURNEY / WELLBEING / TOOLKIT MODULE HOOKS
// =====================================================================
// The NaviCue Player is the bloodline. These types stub the future
// module system that will share the same player infrastructure.
// We define only the discriminant here — full types come with each module.

export type ModuleType =
  | 'navicue'     // The core therapeutic interaction (this system)
  | 'journey'     // Multi-step guided sequences
  | 'wellbeing'   // Ambient ongoing practices
  | 'toolkit'     // Articles / insights / practices
  | 'state';      // Real-time state tracking/check-in

/** Every playable module declares its type so the player can route. */
export interface PlayableModule {
  type: ModuleType;
  id: string;
  /** Human-readable title */
  title: string;
}