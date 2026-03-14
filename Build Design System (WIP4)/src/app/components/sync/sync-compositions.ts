/**
 * SYNC COMPOSITIONS — Seed Copy for the 7 Implemented Atoms
 *
 * Each composition maps a 3-beat typographic sequence to an atom.
 * These are the editorial payloads that give the physics meaning.
 *
 * Copy guardrails apply:
 *   - No time words (quick, fast, minutes)
 *   - No difficulty labels (easy, hard, simple)
 *   - No marketing language (unlock, transform, journey)
 *   - Description ≤ 80 chars
 */

import type { SyncComposition } from './sync-types';

export const SYNC_COMPOSITIONS: SyncComposition[] = [
  // ─── SOMATIC RESONANCE ───
  {
    atomId: 'somatic-resonance',
    atmospheric: 'YOUR BODY IS ALREADY RESPONDING',
    entrance: {
      primary: {
        type: 'mirror',
        text: 'Your breath is the only clock that matters right now.',
      },
      anecdote: {
        type: 'anecdote',
        text: 'Every mammal breathes to regulate. This is biology, not therapy.',
      },
    },
    friction: {
      directive: {
        type: 'directive',
        text: 'HOLD TO FEEL THE BILATERAL PULSE',
      },
      reframe: {
        type: 'reframe',
        text: 'The membrane moves because you move. You are not watching — you are conducting.',
      },
    },
    release: {
      resolution: {
        type: 'resolution',
        text: 'Resonance found.',
        subtext: 'The rhythm was always yours.',
      },
    },
  },

  // ─── WAVE COLLAPSE ───
  {
    atomId: 'wave-collapse',
    atmospheric: 'PROBABILITY IS NOT UNCERTAINTY',
    entrance: {
      primary: {
        type: 'probe',
        text: 'What if the thing you avoid looking at is the thing that resolves?',
      },
    },
    friction: {
      directive: {
        type: 'directive',
        text: 'HOLD TO OBSERVE · BREATHE TO COLLAPSE',
      },
      reframe: {
        type: 'reframe',
        text: 'Observation is not passive. Where you look is where reality crystallises.',
      },
    },
    release: {
      resolution: {
        type: 'resolution',
        text: 'Collapsed.',
        subtext: 'You chose to look. That was the whole act.',
      },
    },
  },

  // ─── DARK MATTER ───
  {
    atomId: 'dark-matter',
    atmospheric: 'WHAT YOU CANNOT SEE STILL SHAPES YOU',
    entrance: {
      primary: {
        type: 'mirror',
        text: 'You carry weight you cannot name. It bends everything around it.',
      },
      anecdote: {
        type: 'anecdote',
        text: '85% of the universe is invisible mass. Influence does not require visibility.',
      },
    },
    friction: {
      directive: {
        type: 'directive',
        text: 'HOLD TO CREATE A GRAVITY WELL',
      },
      reframe: {
        type: 'reframe',
        text: 'The invisible thing is not absence. It is the densest presence in the room.',
      },
    },
    release: {
      resolution: {
        type: 'resolution',
        text: 'The mass was acknowledged.',
        subtext: 'Naming is not required. Recognition is.',
      },
    },
  },

  // ─── MYCELIAL ROUTING ───
  {
    atomId: 'mycelial-routing',
    atmospheric: 'NETWORKS FORM WITHOUT ARCHITECTS',
    entrance: {
      primary: {
        type: 'probe',
        text: 'What if healing is not a line but a network?',
      },
    },
    friction: {
      directive: {
        type: 'directive',
        text: 'TAP TO SEED A NEW NODE',
      },
      reframe: {
        type: 'reframe',
        text: 'Growth finds the path of least resistance. You are not forcing — you are routing.',
      },
    },
    release: {
      resolution: {
        type: 'resolution',
        text: 'Connected.',
        subtext: 'The network remembers every point you planted.',
      },
    },
  },

  // ─── PHOENIX ASH ───
  {
    atomId: 'phoenix-ash',
    atmospheric: 'ASH IS NOT THE END OF FIRE',
    entrance: {
      primary: {
        type: 'mirror',
        text: 'Something burned down. The residue is still warm.',
      },
      anecdote: {
        type: 'anecdote',
        text: 'Forest fires are required for certain seeds to germinate.',
      },
    },
    friction: {
      directive: {
        type: 'directive',
        text: 'HOLD TO IGNITE · BREATHE TO TRANSMUTE',
      },
      reframe: {
        type: 'reframe',
        text: 'The ash is not what you lost. It is the raw material for what comes next.',
      },
    },
    release: {
      resolution: {
        type: 'resolution',
        text: 'Transmuted.',
        subtext: 'Heat was always potential, not destruction.',
      },
    },
  },

  // ─── CYMATIC COHERENCE ───
  {
    atomId: 'cymatic-coherence',
    atmospheric: 'CHAOS IS UNRESOLVED FREQUENCY',
    entrance: {
      primary: {
        type: 'probe',
        text: 'What if disorder is just a frequency you have not found yet?',
      },
      anecdote: {
        type: 'anecdote',
        text: 'Sand on a vibrating plate arranges into geometry. Order is not imposed — it is revealed.',
      },
    },
    friction: {
      directive: {
        type: 'directive',
        text: 'BREATHE TO FIND THE PATTERN',
      },
      reframe: {
        type: 'reframe',
        text: 'You are not creating order. You are removing the noise that hides it.',
      },
    },
    release: {
      resolution: {
        type: 'resolution',
        text: 'Coherent.',
        subtext: 'The pattern was waiting for your frequency.',
      },
    },
  },

  // ─── FUTURE MEMORY ───
  {
    atomId: 'future-memory',
    atmospheric: 'MEMORY IS NOT ONLY BACKWARDS',
    entrance: {
      primary: {
        type: 'mirror',
        text: 'You already know what the next version of this feels like.',
      },
    },
    friction: {
      directive: {
        type: 'directive',
        text: 'DRAW THE SHAPE OF WHAT COMES NEXT',
      },
      reframe: {
        type: 'reframe',
        text: 'The hand knows before the mind. What you trace is not imagination — it is anticipation.',
      },
    },
    release: {
      resolution: {
        type: 'resolution',
        text: 'Remembered forward.',
        subtext: 'The shape was already forming before you drew it.',
      },
    },
  },
];

/** Look up a composition by atom ID */
export function getComposition(atomId: string): SyncComposition | undefined {
  return SYNC_COMPOSITIONS.find(c => c.atomId === atomId);
}
