/**
 * CUE LIBRARY — The Somatic Vocabulary
 *
 * A CUE = ATOM (canvas physics) + SYNC (copy choreography).
 *
 * ═══════════════════════════════════════════════════════
 * THE ATOMIC UNIT
 * ═══════════════════════════════════════════════════════
 *
 * At its smallest, a CUE is:
 *   { atomId, canopy, gesture, receipt }
 *
 * That's it. Four fields. The engine derives everything else.
 *
 * durationMs is per-CUE because dosage varies — a breath CUE
 * wants 18 seconds (3-4 full cycles), a tap CUE wants 12 seconds.
 * At 10,000 scale, duration is derived from atom metadata.
 *
 * ═══════════════════════════════════════════════════════
 * EXIT MODEL — ONE MODE, NO BRANCHING
 * ═══════════════════════════════════════════════════════
 *
 * Every CUE runs on a DURATION TIMER. Period.
 * If the atom fires onResolve before the timer → early seal.
 * If not → timer seals it.
 *
 * No `exit: 'completion' | 'duration'` branching.
 * One model. One code path. Scales to 10,000 atoms without
 * needing to classify each one.
 *
 * onResolve is always an ACCELERATOR, never a requirement.
 *
 * ═══════════════════════════════════════════════════════
 * THE VOICE OF THE GLASS
 * ═══════════════════════════════════════════════════════
 *
 * The glass is a tuning fork, not a doctor.
 *
 * CANOPY — The invitation. Questions, paradoxes, observations.
 *          Never about the user's specific state.
 *          Never promising outcomes. Timeless.
 *
 * GESTURE — The physics. Pure physical instruction for the thumbs.
 *           No emotional content. No psychological narrative.
 *
 * RECEIPT — The lingering chord. Not a period — an ellipsis.
 *           Never claims what happened. Leaves space.
 *           A Zen koan that unfolds after the screen fades.
 *
 * THE ONLY TRUTH IS "I AM."
 * THE ONLY TIME IS NOW.
 *
 * ═══════════════════════════════════════════════════════
 * THE ARC — 10 CUEs, one continuous sequence
 * ══════════════════════════════════════════════════════
 *
 * ARRIVE → GROUND → RELEASE → PERCEIVE → SOFTEN →
 * NOTICE → BALANCE → REFLECT → PLANT → CROSS
 *
 * Then it loops. After crossing, you arrive again.
 * The loop is the journey. There is no end.
 */

export interface Cue {
  /** Unique identifier */
  id: string;
  /** Which atom to render — must match atom-registry id */
  atomId: string;
  /** Live phase duration in ms. Timer always runs. onResolve → early exit. */
  durationMs: number;
  /** The invitation — widens the aperture */
  canopy: string;
  /** The physics — what the thumbs do */
  gesture: string;
  /** The lingering chord — the open ending */
  receipt: string;
}

/**
 * THE SEQUENCE — 10 CUEs, each a unique somatic intervention.
 *
 *  1. Still Point      — OBSERVE — koan voice
 *  2. Tidal Breath     — BREATH  — koan voice
 *  3. Weight Release   — DRAG    — monolith voice
 *  4. Signal Fire      — OBSERVE — clinical voice
 *  5. Dissolve         — HOLD    — scattered voice
 *  6. Ember Grid       — TAP     — clinical voice
 *  7. Pendulum Rest    — BREATH  — whisper voice
 *  8. Mirror Breath    — HOLD    — somatic voice
 *  9. Root Pulse       — TAP     — organic voice
 * 10. Threshold        — HOLD    — monolith voice
 */
export const CUE_SEQUENCE: Cue[] = [
  {
    id: 'cue-still-point',
    atomId: 'still-point',
    durationMs: 14000,
    canopy: 'What if arriving is not something that happens next, but something that already has?',
    gesture: 'Be still.',
    receipt: '...here',
  },
  {
    id: 'cue-tidal-breath',
    atomId: 'tidal-breath',
    durationMs: 20000,
    canopy: 'The tide has no agenda. It simply moves. And everything near it eventually moves with it.',
    gesture: 'Breathe with it.',
    receipt: '...rhythm',
  },
  {
    id: 'cue-weight-release',
    atomId: 'weight-release',
    durationMs: 15000,
    canopy: 'There is something being carried. It has mass. It can be set down. That\'s all this is.',
    gesture: 'Drag it down.',
    receipt: '...lighter?',
  },
  {
    id: 'cue-signal-fire',
    atomId: 'signal-fire',
    durationMs: 16000,
    canopy: 'Where there is noise, there is signal. Not hidden. Just at a different frequency.',
    gesture: 'Watch.',
    receipt: '...emerging',
  },
  {
    id: 'cue-dissolve',
    atomId: 'dissolve',
    durationMs: 14000,
    canopy: 'Every wall is a decision that made sense once. This is not about whether it still does.',
    gesture: 'Hold the edge.',
    receipt: '...softening?',
  },
  {
    id: 'cue-ember-grid',
    atomId: 'ember-grid',
    durationMs: 12000,
    canopy: 'Not everything dimmed. Some things are still glowing. What catches the eye?',
    gesture: 'Touch.',
    receipt: '...glowing',
  },
  {
    id: 'cue-pendulum-rest',
    atomId: 'pendulum-rest',
    durationMs: 18000,
    canopy: 'The swing doesn\'t stop because it\'s told to. It stops because the energy finds center on its own.',
    gesture: 'Breathe slower.',
    receipt: '...settling',
  },
  {
    id: 'cue-mirror-breath',
    atomId: 'mirror-breath',
    durationMs: 14000,
    canopy: 'What is seen changes the seer. Not the other way around.',
    gesture: 'Hold. Watch.',
    receipt: '...reflecting',
  },
  {
    id: 'cue-root-pulse',
    atomId: 'root-pulse',
    durationMs: 14000,
    canopy: 'Growth is not linear. It finds its own path. Underground, lateral, unexpected.',
    gesture: 'Touch.',
    receipt: '...connected',
  },
  {
    id: 'cue-threshold',
    atomId: 'threshold',
    durationMs: 16000,
    canopy: 'There is a line here. Not between then and now. There is no then. Between this breath and the next.',
    gesture: 'Hold.',
    receipt: '...',
  },
];

/** Total CUE count */
const CUE_COUNT = CUE_SEQUENCE.length;

/** Get the next CUE in sequence (wraps) */
export function getNextCue(currentIndex: number): { cue: Cue; index: number } {
  const nextIndex = (currentIndex + 1) % CUE_COUNT;
  return { cue: CUE_SEQUENCE[nextIndex], index: nextIndex };
}