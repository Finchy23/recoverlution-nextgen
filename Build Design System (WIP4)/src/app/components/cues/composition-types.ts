/**
 * COMPOSITION TYPE SYSTEM — The Rhythmic Scale
 *
 * CUE is the genus. PULSE, TWIN, TRI, ARC are species.
 *
 * A CUE is not a static feature; it is a dynamic orchestration.
 * The OS reads the heat and pressure of the moment and generates
 * a CUE across a precise rhythmic scale.
 *
 * ═══════════════════════════════════════════════════════
 * THE VOICE OF THE GLASS
 * ═══════════════════════════════════════════════════════
 *
 * The glass is not a doctor. It is a tuning fork.
 * When struck, it does not tell the user what note to sing —
 * it holds a pure frequency and allows the nervous system
 * to match it on its own terms.
 *
 * The words on the screen are entirely untethered from the
 * "timeline" of the app. They address the timeless, continuous
 * hum of the human mind. They do not declare victory.
 * They do not command state. They merely open a door
 * to what is possible.
 *
 * THE ONLY TRUTH IS "I AM."
 * THE ONLY TIME IS NOW.
 *
 * ═══════════════════════════════════════════════════════
 * THE CHOREOGRAPHY OF THE CUE
 * ═══════════════════════════════════════════════════════
 *
 * 1 BEAT  | PULSE  — The Singularity.
 *   One note. Not a cure — a frequency. The glass holds
 *   a single tone. The nervous system decides what to do with it.
 *
 * 2 BEATS | TWIN   — The Binary Shift.
 *   Two notes. Contrast is the oldest teacher.
 *   The nervous system hears the first and already
 *   anticipates the second. The space between is the work.
 *
 * 3 BEATS | TRI    — The Resolution.
 *   Three notes — the simplest structure that contains
 *   a beginning, a middle, and whatever comes next.
 *   The body recognizes threes the way the ear recognizes a chord.
 *
 * 4+ BEATS | ARC   — The Thermodynamic Corridor.
 *   A sustained sequence. Not a journey from here to there —
 *   there is no there. A series of frequencies.
 *   The nervous system walks through them.
 *
 * ═══════════════════════════════════════════════════════
 * THE ARCHITECTURE OF RESONANCE
 * ═══════════════════════════════════════════════════════
 *
 * I. THE ENTRANCE: Widening the Aperture
 *    Not an instruction. Not an observation of the user's state.
 *    An invitation to shift perspective. Epistemic humility.
 *    Questions. Paradoxes. The dissolution of the problem.
 *    Universally true. Timeless.
 *
 * II. THE KINETIC CORE: The Silent Alchemy
 *    The intellect yields to the body. Physics, not philosophy.
 *    "Release the tension" — never "Release your anxiety."
 *    The text becomes the physical object on the glass.
 *    The body performs the psychological translation.
 *
 * III. THE SEAL: The Lingering Chord
 *    Not a period. An ellipsis.
 *    Never tells the user what they achieved.
 *    Leaves immense, quiet space.
 *    A Zen koan that unfolds after the screen fades.
 *
 * ═══════════════════════════════════════════════════════
 * ATOM ROLES — Compositional Fitness
 * ═══════════════════════════════════════════════════════
 *
 * Not every atom works in every position. An atom's role
 * affinity determines where it belongs in a composition.
 *
 *   intercept  — Arrest momentum. Absorb inertia. Create the bind.
 *   mirror     — Illuminate the invisible. Reflect the pattern.
 *   parallax   — The cognitive turn. Shatter the old baseline.
 *   synthesis  — Demand agency. Hand momentum back to the user.
 *   seal       — Lock the shift into biology. The autonomic exhale.
 *
 * ═══════════════════════════════════════════════════════
 * TRANSITION PHYSICS
 * ═══════════════════════════════════════════════════════
 *
 * The space between beats is as important as the beats themselves.
 *
 *   snap       — Sharp Z-axis cut. The TWIN's dissonant contrast.
 *   flow       — Fluid continuity. Each beat bleeding into the next.
 *   breathe    — Slow, respiratory transition. The ARC's deep tide.
 */

// ─── Composition Species ───

export type CompositionType = 'pulse' | 'twin' | 'tri' | 'arc';

// ─── Beat Roles ───

export type BeatRole =
  | 'intercept'   // Arrest momentum — friction, weight, capture
  | 'mirror'      // Illuminate — reflection, observation, naming
  | 'parallax'    // Cognitive turn — new angle, dimensional rotation
  | 'synthesis'   // Demand agency — user-driven threshold crossing
  | 'seal';       // Lock the shift — equilibrium, grounding, proof

// ─── Transition Physics ��──

export type TransitionType =
  | 'snap'        // Sharp cut — maximum contrast (TWIN default)
  | 'flow'        // Fluid continuity — accelerating (TRI default)
  | 'breathe';    // Slow respiratory — deep tide (ARC default)

// ─── Environmental Posture ───

/**
 * How the environment holds itself around the person.
 * The posture determines lighting, pacing, and copy density.
 * Not what the glass does — how the room feels.
 */
export type EnvironmentalPosture =
  | 'observe'     // Spacious, listening. The glass waits.
  | 'diffuse'     // Lighter, yielding. The glass softens.
  | 'provoke'     // Sharper contrast. The glass questions.
  | 'install'     // Steadier, resonant. The glass anchors.
  | 'seal';       // Quieter, more open. The glass holds.

// ─── Atom Role Affinity ───

/** Maps atoms to the roles they naturally embody */
export interface AtomRoleAffinity {
  atomId: string;
  /** Primary role — where this atom is most at home */
  primary: BeatRole;
  /** Secondary roles — where this atom can also serve */
  secondary: BeatRole[];
}

/**
 * ATOM ROLE MAP
 *
 * Each implemented atom classified by compositional fitness.
 * This is how the clinical engine knows which instruments
 * to select for each position in a composition.
 */
export const ATOM_ROLE_MAP: AtomRoleAffinity[] = [
  // ── Interceptors — absorb inertia, create the bind ──
  { atomId: 'still-point',       primary: 'intercept', secondary: ['seal'] },
  { atomId: 'tidal-breath',      primary: 'intercept', secondary: ['seal', 'mirror'] },
  { atomId: 'weight-release',    primary: 'intercept', secondary: ['synthesis'] },
  { atomId: 'somatic-resonance', primary: 'intercept', secondary: ['mirror'] },

  // ── Mirrors — illuminate the invisible ──
  { atomId: 'mirror-breath',     primary: 'mirror',    secondary: ['parallax'] },
  { atomId: 'signal-fire',       primary: 'mirror',    secondary: ['parallax', 'seal'] },
  { atomId: 'dark-matter',       primary: 'mirror',    secondary: ['intercept'] },

  // ── Parallax — the cognitive turn ──
  { atomId: 'dissolve',          primary: 'parallax',  secondary: ['mirror', 'seal'] },
  { atomId: 'wave-collapse',     primary: 'parallax',  secondary: ['synthesis'] },
  { atomId: 'cymatic-coherence', primary: 'parallax',  secondary: ['mirror'] },

  // ── Synthesis — demand agency ──
  { atomId: 'ember-grid',        primary: 'synthesis', secondary: ['mirror'] },
  { atomId: 'root-pulse',        primary: 'synthesis', secondary: ['seal'] },
  { atomId: 'mycelial-routing',  primary: 'synthesis', secondary: ['parallax'] },

  // ── Seal — lock the shift ──
  { atomId: 'threshold',         primary: 'seal',      secondary: ['synthesis'] },
  { atomId: 'pendulum-rest',     primary: 'seal',      secondary: ['intercept'] },
  { atomId: 'phoenix-ash',       primary: 'seal',      secondary: ['parallax'] },
  { atomId: 'future-memory',     primary: 'seal',      secondary: ['synthesis'] },
];

/** Get atoms that fit a given role (primary or secondary) */
export function getAtomsForRole(role: BeatRole): AtomRoleAffinity[] {
  return ATOM_ROLE_MAP.filter(a => a.primary === role || a.secondary.includes(role));
}

/** Get an atom's role affinity */
export function getAtomRole(atomId: string): AtomRoleAffinity | undefined {
  return ATOM_ROLE_MAP.find(a => a.atomId === atomId);
}

// ─── Capture Modes ───

/**
 * What the glass asks back. Not every beat needs a response.
 * Some are pure receiving. Some are pure physics.
 * The capture mode determines what the UI presents.
 */
export type CaptureMode =
  | 'none'          // Pure observation. No response requested.
  | 'gesture'       // The interaction IS the response. Tap, drag, hold, breath.
  | 'binary'        // Two choices on the glass. Either. Or.
  | 'select'        // A small selection from resonant options. Three to five.
  | 'whisper'       // Brief text input. A phrase, not a paragraph.
  | 'thought'       // Quick voice to text thought capture.
  | 'voice';        // Raw voice fragment. Unprocessed. Kept as audio.

/**
 * OVERLAY CAPTURE MODES
 *
 * These are the 5 capture modes that require a UI overlay
 * on top of the atom canvas. Gesture and none are ambient —
 * the atom canvas IS the interaction. These five open a door.
 *
 * The overlay fades in softly. The timer always runs.
 * A declined invitation is itself signal.
 */
export type OverlayCaptureMode = 'binary' | 'select' | 'whisper' | 'thought' | 'voice';

/** Does this capture mode require a UI overlay on the glass? */
export function isOverlayCapture(mode: CaptureMode): mode is OverlayCaptureMode {
  return mode !== 'none' && mode !== 'gesture';
}

// ─── Capture Options ───

/**
 * Data the beat carries for overlay captures.
 * The runtime reads this to know what to render.
 *
 * For binary: two options on the glass.
 * For select: three to five resonant words.
 * For whisper/thought/voice: an ambient prompt (optional).
 */
export interface CaptureOptions {
  /** For binary: exactly 2 choices. For select: 3 to 5 options. */
  options?: string[];
  /** Ambient prompt. Not an instruction. A whispered invitation. */
  prompt?: string;
}

// ─── Capture Results ───

/**
 * What each capture produces. The data contract.
 *
 * Every beat in a composition produces a CaptureResult.
 * The full composition produces CaptureResult[] — the sequence
 * of responses across all beats. This is what gets minted
 * into telemetry.
 *
 * null values represent declined captures — the timer ran out
 * and the person did not engage. This is valid signal.
 * The system knows a door was opened and not walked through.
 */
export type CaptureResult =
  | { mode: 'none' }
  | { mode: 'gesture'; atomId: string; durationMs: number }
  | { mode: 'binary'; chosen: 'a' | 'b' | null; options: [string, string] }
  | { mode: 'select'; chosen: string[]; options: string[] }
  | { mode: 'whisper'; text: string | null }
  | { mode: 'thought'; text: string | null; durationMs: number }
  | { mode: 'voice'; durationMs: number; declined: boolean };

// ─── Beat ───

export interface Beat {
  /** Position in the composition (0-indexed) */
  position: number;
  /** The role this beat serves in the composition */
  role: BeatRole;
  /** Which atom renders this beat */
  atomId: string;
  /** Sync copy — the three-layer voice */
  sync: {
    canopy: string;   // the invitation
    gesture: string;  // the physics
    receipt: string;  // the lingering chord
  };
  /** Duration in ms. Timer always runs. onResolve → early exit. */
  durationMs: number;
  /** What the glass asks back on this beat */
  capture?: CaptureMode;
  /**
   * Data for overlay captures (binary/select/whisper/thought/voice).
   * The runtime reads this to render the capture UI.
   * Ignored for 'none' and 'gesture' capture modes.
   */
  captureOptions?: CaptureOptions;
  /** Transition TO the next beat (undefined for last beat) */
  transitionOut?: TransitionType;
}

// ─── Composition ───

export interface Composition {
  /** Unique identifier */
  id: string;
  /** Composition species */
  type: CompositionType;
  /** Display name */
  name: string;
  /** One-line essence */
  essence: string;
  /** How the environment holds itself */
  posture: EnvironmentalPosture;
  /** The beats — 1 for pulse, 2 for twin, 3 for tri, 4+ for arc */
  beats: Beat[];
}

// ─── Composition Metadata ───

export interface CompositionMeta {
  type: CompositionType;
  label: string;
  beatCount: string;
  essence: string;
  philosophy: string;
  mechanic: string;
  invitation: string;
}

export const COMPOSITION_META: CompositionMeta[] = [
  {
    type: 'pulse',
    label: 'Pulse',
    beatCount: '1 beat',
    essence: 'The Singularity',
    philosophy: 'One note. Not a cure. A frequency. The glass holds a single tone and the nervous system decides what to do with it. There is nothing to achieve here. Nothing to become. Only this.',
    mechanic: 'One atom. One breath. Duration runs. The body responds on its own terms.',
    invitation: 'What if one moment is not the beginning of something, but the entire thing?',
  },
  {
    type: 'twin',
    label: 'Twin',
    beatCount: '2 beats',
    essence: 'The Binary Shift',
    philosophy: 'Two notes. The nervous system hears the first and already anticipates the second. The space between is where recalibration happens. Not because the glass commands it. Because contrast is the oldest teacher in the natural world.',
    mechanic: 'Two beats across the Z axis. The first scene holds one physics. The second delivers its opposite. The nervous system bridges the gap on its own terms.',
    invitation: 'The mind holds one thing at a time. What happens when the thing changes?',
  },
  {
    type: 'tri',
    label: 'Tri',
    beatCount: '3 beats',
    essence: 'The Architecture of Resolution',
    philosophy: 'Three notes. The simplest structure that contains a beginning, a middle, and whatever comes next. Not a destination. A rhythm. The body recognizes threes the way the ear recognizes a chord.',
    mechanic: 'Three beats in continuous flow. Anchor, turn, open. The rhythm is the intervention. What happens inside it belongs to whoever is holding the glass.',
    invitation: 'Three breaths. Not to arrive somewhere. To notice where this already is.',
  },
  {
    type: 'arc',
    label: 'Arc',
    beatCount: '4+ beats',
    essence: 'The Thermodynamic Corridor',
    philosophy: 'A sustained sequence. Not a journey from here to there. There is no there. The corridor holds a series of frequencies. The nervous system walks through them. What happens is neither predicted nor prescribed.',
    mechanic: 'Four or more beats threaded through breathe transitions. Each scene holds a different physics. The sequence creates a thermodynamic gradient. The body follows on its own terms.',
    invitation: 'This is not a journey with a destination. It is a series of nows. Each one complete. Each one enough.',
  },
];

/** Get composition metadata by type */
export function getCompositionMeta(type: CompositionType): CompositionMeta {
  return COMPOSITION_META.find(m => m.type === type)!;
}

// ─── Role Metadata ───

export interface RoleMeta {
  role: BeatRole;
  label: string;
  verb: string;
  essence: string;
  color: string;
}

export const ROLE_META: RoleMeta[] = [
  { role: 'intercept', label: 'Intercept', verb: 'Arrest',     essence: 'Capture momentum. Meet the velocity and absorb it.',       color: '#C8A064' },
  { role: 'mirror',    label: 'Mirror',    verb: 'Illuminate', essence: 'Bring the implicit pattern into explicit awareness.',       color: '#78B4D4' },
  { role: 'parallax',  label: 'Parallax',  verb: 'Turn',       essence: 'Introduce the variable that shatters the old baseline.',    color: '#B0A0E0' },
  { role: 'synthesis', label: 'Synthesis',  verb: 'Demand',     essence: 'Hand momentum back. Insight without action is entertainment.', color: '#78BC78' },
  { role: 'seal',      label: 'Seal',      verb: 'Lock',       essence: 'The autonomic exhale. The shift mints into biology.',       color: '#D4C4A8' },
];

/** Get role metadata */
export function getRoleMeta(role: BeatRole): RoleMeta {
  return ROLE_META.find(r => r.role === role)!;
}

// ─── Transition Metadata ───

export interface TransitionMeta {
  type: TransitionType;
  label: string;
  durationMs: number;
  essence: string;
}

export const TRANSITION_META: TransitionMeta[] = [
  { type: 'snap',     label: 'Snap',     durationMs: 200,  essence: 'Sharp Z axis cut. Maximum contrast.' },
  { type: 'flow',     label: 'Flow',     durationMs: 600,  essence: 'Fluid continuity. Each beat bleeding into the next.' },
  { type: 'breathe',  label: 'Breathe',  durationMs: 1200, essence: 'Slow respiratory transition. The deep tide.' },
];

// ─── Posture Metadata ───

export interface PostureMeta {
  posture: EnvironmentalPosture;
  label: string;
  essence: string;
  color: string;
}

export const POSTURE_META: PostureMeta[] = [
  { posture: 'observe',  label: 'Observe',  essence: 'Spacious, listening. The glass waits.',              color: '#A89070' },
  { posture: 'diffuse',  label: 'Diffuse',  essence: 'Lighter, yielding. The glass softens.',              color: '#8C5028' },
  { posture: 'provoke',  label: 'Provoke',  essence: 'Sharper contrast. The glass questions.',             color: '#5A46B4' },
  { posture: 'install',  label: 'Install',  essence: 'Steadier, resonant. The glass anchors.',             color: '#6488C0' },
  { posture: 'seal',     label: 'Seal',     essence: 'Quieter, more open. The glass holds.',               color: '#4A7878' },
];

export function getPostureMeta(posture: EnvironmentalPosture): PostureMeta {
  return POSTURE_META.find(p => p.posture === posture)!;
}

// ─── Capture Metadata ───

export interface CaptureMeta {
  mode: CaptureMode;
  label: string;
  essence: string;
}

export const CAPTURE_META: CaptureMeta[] = [
  { mode: 'none',    label: 'None',    essence: 'Pure receiving. The glass asks nothing back.' },
  { mode: 'gesture', label: 'Gesture', essence: 'The interaction is the response.' },
  { mode: 'binary',  label: 'Binary',  essence: 'Two choices. Either. Or.' },
  { mode: 'select',  label: 'Select',  essence: 'A small field of resonant options.' },
  { mode: 'whisper', label: 'Whisper', essence: 'A phrase. Not a paragraph.' },
  { mode: 'thought', label: 'Thought', essence: 'Quick voice to text. A captured fragment.' },
  { mode: 'voice',   label: 'Voice',   essence: 'Raw audio. Unprocessed. Kept as felt.' },
];

export function getCaptureMeta(mode: CaptureMode): CaptureMeta {
  return CAPTURE_META.find(c => c.mode === mode)!;
}

// ─── Composition Helpers ───

/**
 * Get all overlay captures in a composition.
 * Returns beats that have non-ambient capture modes
 * (binary, select, whisper, thought, voice).
 * Gesture and none are ambient — they don't count as "asks."
 */
export function getOverlayCaptures(composition: Composition): Beat[] {
  return composition.beats.filter(b => b.capture && isOverlayCapture(b.capture));
}

/**
 * Get the soft capture summary for a composition.
 * Returns the distinct overlay capture modes used.
 */
export function getCaptureSummary(composition: Composition): OverlayCaptureMode[] {
  const overlays = getOverlayCaptures(composition);
  return [...new Set(overlays.map(b => b.capture as OverlayCaptureMode))];
}