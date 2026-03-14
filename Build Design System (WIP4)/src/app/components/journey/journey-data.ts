/**
 * JOURNEY DATA — The E.R.A. Cycle
 *
 * A Journey is an 8-beat sequence spread across a week.
 * Each beat is a scene. Each scene is a cue dropped onto the Stream.
 *
 * Scene types:
 *   PRIMER       — Opening narrative. Normalizing. No interaction.
 *   EXPERIENCE   — The seed. Somatic catching. Light haptic sync.
 *   INTROSPECTION — The download. A safe input screen. Journaling.
 *   RECOGNIZE    — The depth. Interrogation. Peeling back layers.
 *   ALIGN        — The experiment. Opening possibility. Low stakes.
 *   ANCHOR       — The accumulation. Closing the micro-chapter.
 *
 * The E.R.A. acronym:
 *   [E]xperience → [R]ecognize → [A]lign
 *   With Introspection beats woven between them.
 *   Primer opens. Anchor closes.
 *
 * Cadence: ~24 hours between beats.
 * The cue stays on the Stream until the next one replaces it.
 *
 * JOURNEYS is the slow, deep, life-altering work.
 * FORM is the fast kinetic intervention.
 * JOURNEYS is the tuning fork.
 */

// ─── Scene Types ───

export type JourneySceneType =
  | 'primer'
  | 'experience'
  | 'introspection'
  | 'recognize'
  | 'align'
  | 'anchor';

export interface JourneyScene {
  /** Scene ID within the journey */
  id: string;
  /** Scene type determines rendering */
  type: JourneySceneType;
  /** Day number (1-8) */
  day: number;
  /** The copy — narrative text for narrative scenes, prompt for introspection */
  copy: string;
  /** Sub-copy — secondary text, instruction, or context */
  subCopy?: string;
  /** The seed text — the real-world instruction (Experience/Recognize/Align only) */
  seed?: string;
  /** Color accent for this scene */
  color?: string;
}

export interface Journey {
  /** Unique journey ID */
  id: string;
  /** Internal schema this journey works on (maps to SEEK insights) */
  schema: string;
  /** The insight ID this journey correlates to */
  insightId: string;
  /** Journey color — inherited from the insight */
  color: string;
  /** The 8 scenes of the E.R.A. cycle */
  scenes: JourneyScene[];
}

// ─── Journey State ───

export interface JourneyEntry {
  /** Scene ID this entry belongs to */
  sceneId: string;
  /** User's introspection text */
  text: string;
  /** Timestamp of entry */
  timestamp: number;
}

export interface JourneyState {
  /** Which journey is active */
  journeyId: string;
  /** Current scene index (0-7) */
  currentScene: number;
  /** Whether the current scene has been sealed (read/completed) */
  sealed: boolean;
  /** Timestamp when each scene was first opened */
  sceneTimestamps: Record<string, number>;
  /** Introspection entries */
  entries: JourneyEntry[];
  /** Journey started at */
  startedAt: number;
  /** Journey completed at (null if in progress) */
  completedAt: number | null;
}

// ─── Cadence Constants ───

/** Minimum time between scenes (ms) — 20 hours to allow some flexibility */
export const SCENE_INTERVAL_MS = 20 * 60 * 60 * 1000;

/** Time after which the current cue "expires" and the next one unlocks (ms) — 28 hours */
export const SCENE_EXPIRY_MS = 28 * 60 * 60 * 1000;

// ─── Helper: Is next scene ready? ───

export function isNextSceneReady(state: JourneyState): boolean {
  if (!state.sealed) return false;

  const currentSceneId = state.journeyId + '-' + state.currentScene;
  const openedAt = state.sceneTimestamps[currentSceneId];
  if (!openedAt) return true; // Never opened — allow progression

  const elapsed = Date.now() - openedAt;
  return elapsed >= SCENE_INTERVAL_MS;
}

/** Check if the current cue has expired (next should auto-advance) */
export function hasCueExpired(state: JourneyState): boolean {
  const currentSceneId = state.journeyId + '-' + state.currentScene;
  const openedAt = state.sceneTimestamps[currentSceneId];
  if (!openedAt) return false;

  const elapsed = Date.now() - openedAt;
  return state.sealed && elapsed >= SCENE_EXPIRY_MS;
}

// ═══════════════════════════════════════════════════
// THE JOURNEYS
// ═══════════════════════════════════════════════════

export const JOURNEYS: Journey[] = [
  // ─── JOURNEY 1: The Invisible Conductor ───
  // Schema: Enmeshment / Over-responsibility
  // "The subtle hum in the background of our days"
  {
    id: 'invisible-conductor',
    schema: 'Enmeshment',
    insightId: 'enmeshment',
    color: '#A8B5FF',
    scenes: [
      // DAY 1: PRIMER — Setting the scene
      {
        id: 'ic-primer',
        type: 'primer',
        day: 1,
        copy: 'There is a subtle hum in the background of your days. A quiet, almost invisible pull to arrange the pieces, to step in when the energy shifts. It does not announce itself. It does not ask for credit. It simply runs.',
        subCopy: 'This is not a problem to solve. It is a pattern to notice.',
      },

      // DAY 2: EXPERIENCE — The seed
      {
        id: 'ic-experience',
        type: 'experience',
        day: 2,
        copy: 'The Seed',
        subCopy: 'Over the next day or two, see if you can catch the moment before the autopilot engages. You do not need to stop yourself from doing it. Just see if you can feel the exact second the urge arrives.',
        seed: 'Notice the pull. Not the action. The pull.',
      },

      // DAY 3: INTROSPECTION 1 — The download
      {
        id: 'ic-introspection-1',
        type: 'introspection',
        day: 3,
        copy: 'Did you catch any glimpses of that pull today? What did it feel like before the autopilot took over?',
        subCopy: 'Just drop it here. No structure needed.',
      },

      // DAY 4: RECOGNIZE — The depth
      {
        id: 'ic-recognize',
        type: 'recognize',
        day: 4,
        copy: 'When that urge arises, what is it actually responding to? Is it a requirement of the present moment, or an echo from an older room?',
        subCopy: 'See if it answers itself.',
        seed: 'Separate the present from the echo.',
      },

      // DAY 5: INTROSPECTION 2 — Processing recognition
      {
        id: 'ic-introspection-2',
        type: 'introspection',
        day: 5,
        copy: 'Did anything surprise you about where that urge might be coming from?',
        subCopy: 'There is no wrong answer. The observation is the work.',
      },

      // DAY 6: ALIGN — The experiment
      {
        id: 'ic-align',
        type: 'align',
        day: 6,
        copy: 'The next time the urge arrives, see what happens if you try a slightly different approach. Maybe you delay your response by just three seconds. Maybe you let someone else step in.',
        subCopy: 'Just see how your body reacts to a new variable.',
        seed: 'Run the experiment. The stakes are zero.',
      },

      // DAY 7: INTROSPECTION 3 — Reviewing the experiment
      {
        id: 'ic-introspection-3',
        type: 'introspection',
        day: 7,
        copy: 'Did you get a chance to run an experiment? How did the new variable feel? If the autopilot won this round, that is completely fine too.',
        subCopy: 'Every observation is data.',
      },

      // DAY 8: ANCHOR — The accumulation
      {
        id: 'ic-anchor',
        type: 'anchor',
        day: 8,
        copy: 'You do not rewrite years of autopilot in a single week. But every pause, every question, and every tiny experiment is a shift in the architecture. You are building a new capacity.',
        subCopy: 'The conductor does not need to stop. It just needs to know that you are watching.',
      },
    ],
  },

  // ─── JOURNEY 2: The Voice in the Walls ───
  // Schema: Inner Critic / Unworthiness
  {
    id: 'voice-in-walls',
    schema: 'The Inner Critic',
    insightId: 'inner-critic',
    color: '#B8A0FF',
    scenes: [
      {
        id: 'vw-primer',
        type: 'primer',
        day: 1,
        copy: 'There is a voice that knows exactly where to find you. It speaks in your cadence, uses your vocabulary, knows your specific architecture of doubt. It sounds so much like you that you have never thought to question its credentials.',
        subCopy: 'This voice is not a malfunction. It is a machine.',
      },
      {
        id: 'vw-experience',
        type: 'experience',
        day: 2,
        copy: 'The Frequency',
        subCopy: 'Over the next day, see if you can catch the voice mid-sentence. Not to argue with it. Not to silence it. Just to notice the exact moment it starts talking.',
        seed: 'Catch the voice. Not the content. The onset.',
      },
      {
        id: 'vw-introspection-1',
        type: 'introspection',
        day: 3,
        copy: 'Did you catch the voice today? What was it saying? More importantly — whose voice was it borrowing?',
        subCopy: 'Drop it here.',
      },
      {
        id: 'vw-recognize',
        type: 'recognize',
        day: 4,
        copy: 'The voice speaks loudest when you are about to do something brave. When you are about to be seen. When the stakes feel real. It is not random. It is a guardian.',
        subCopy: 'What is it guarding you from?',
        seed: 'Find the trigger. Not the content.',
      },
      {
        id: 'vw-introspection-2',
        type: 'introspection',
        day: 5,
        copy: 'What were you about to do when the voice got loud? What was at stake?',
        subCopy: 'The timing tells you everything.',
      },
      {
        id: 'vw-align',
        type: 'align',
        day: 6,
        copy: 'The next time the voice arrives, try something small. Instead of arguing or obeying, just say — out loud or silently — I hear you. And then do the thing anyway.',
        subCopy: 'Not defiance. Acknowledgment.',
        seed: 'Hear it. Then move.',
      },
      {
        id: 'vw-introspection-3',
        type: 'introspection',
        day: 7,
        copy: 'What happened when you acknowledged the voice instead of fighting it? Did the volume change?',
        subCopy: 'Every experiment counts.',
      },
      {
        id: 'vw-anchor',
        type: 'anchor',
        day: 8,
        copy: 'The voice will not disappear. It may never stop entirely. But the relationship between you and the voice — that is the variable. You are learning to hear it without believing it. That is the architecture of becoming.',
        subCopy: 'The voice is not you. You are the one who hears it.',
      },
    ],
  },
];

// ─── Default journey (first-time users) ───

export const DEFAULT_JOURNEY_ID = 'invisible-conductor';
