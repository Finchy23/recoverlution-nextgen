/**
 * FORM PRACTICES — The Clinical Library
 *
 * Each practice is a complete therapeutic exercise.
 * Once done, it is done. It does not loop. It does not flow.
 * It is a clinical instrument used with purpose.
 *
 * Every practice binds to an atom, follows a protocol,
 * belongs to a pillar, and sequences through clinical containers.
 *
 * The Four Pillars:
 *   BASELINE — breath, body, nervous system
 *   SHIELD   — boundaries, energy clearing, spatial safety
 *   REWIRE   — defusion, rescripting, bilateral processing
 *   BRIDGE   — relational scripts, ground-holding, the "no"
 *
 * The schema is the user's thought — the raw material.
 * In production, SEEK surfaces provide the schema.
 * Here we use seed schemas for workbench demonstration.
 *
 * Copy guardrails apply:
 *   - No time words, no difficulty labels, no marketing
 *   - Instructions are mechanical and clinical
 *   - Reframes are observational, never motivational
 */

import type { Practice } from './form-types';

export const FORM_PRACTICES: Practice[] = [

  // ═══════════════════════════════════════════════════
  // PILLAR: REWIRE — Therapeutic & Cognitive
  // ═══════════════════════════════════════════════════

  // ─── ACT DEFUSION — full 5-container protocol ───
  {
    id: 'defusion-imposter',
    name: 'Imposter Defusion',
    schema: 'I am fundamentally broken.',
    protocol: 'act-defusion',
    pillar: 'rewire',
    atomId: 'wave-collapse',
    essence: 'The thought collapses when observed from a distance.',
    steps: [
      {
        container: 'resource',
        copy: 'Notice the weight of the device in your hand.',
        subCopy: 'Feel the rhythm. Nothing else is required.',
        minDurationHint: 8,
      },
      {
        container: 'titration',
        copy: 'I am fundamentally broken.',
        subCopy: 'Observe the shape of this thought. It is contained here.',
        instruction: 'Read. Do not react. The pulse continues.',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Press and hold the thought.',
        instruction: 'Hold to observe. Release to return to the anchor.',
        minDurationHint: 12,
      },
      {
        container: 'defusion',
        copy: 'You are not the thought. You are the space where the thought happens.',
        subCopy: 'Watch it drift. It is still there. It is no longer you.',
        minDurationHint: 10,
      },
      {
        container: 'wash',
        copy: 'The thought remains. Your relationship to it has shifted.',
        minDurationHint: 8,
      },
    ],
  },

  // ─── SCHEMA DEFUSION — via dark matter ───
  {
    id: 'defusion-alone',
    name: 'Gravity Defusion',
    schema: 'I will always be alone.',
    protocol: 'act-defusion',
    pillar: 'rewire',
    atomId: 'dark-matter',
    essence: 'Invisible gravity. Observation changes the field.',
    steps: [
      {
        container: 'resource',
        copy: 'The gravity you feel is real.',
        subCopy: 'The interpretation is negotiable.',
        minDurationHint: 8,
      },
      {
        container: 'titration',
        copy: 'I will always be alone.',
        subCopy: 'A sentence. Not a sentence passed upon you.',
        instruction: 'Observe the mass. The field bends around it.',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Hold to create distance.',
        instruction: 'Pull the mass away from center. Feel the field shift.',
        minDurationHint: 12,
      },
      {
        container: 'defusion',
        copy: 'The mass was invisible. Now it is observed. Observation changes the field.',
        minDurationHint: 10,
      },
      {
        container: 'wash',
        copy: 'Gravity acknowledged. The orbit adjusts.',
        minDurationHint: 8,
      },
    ],
  },

  // ─── BILATERAL PROCESSING — via cymatic coherence ───
  {
    id: 'bilateral-chaos',
    name: 'Coherence Reset',
    schema: 'Nothing makes sense anymore.',
    protocol: 'bilateral-processing',
    pillar: 'rewire',
    atomId: 'cymatic-coherence',
    essence: 'Disorder is unresolved frequency.',
    steps: [
      {
        container: 'resource',
        copy: 'Disorder is unresolved frequency.',
        subCopy: 'Your breath carries the tuning.',
        minDurationHint: 8,
      },
      {
        container: 'titration',
        copy: 'Nothing makes sense anymore.',
        subCopy: 'The chaos is not a verdict. It is a frequency.',
        instruction: 'Follow the bilateral node. Left. Right. Left. Right.',
        minDurationHint: 15,
      },
      {
        container: 'wash',
        copy: 'The pattern re-emerged. It was waiting for your frequency.',
        minDurationHint: 10,
      },
    ],
  },

  // ─── PARTS UNBURDENING — via phoenix ash ───
  {
    id: 'unburdening-failure',
    name: 'Ash Unburdening',
    schema: 'I failed them.',
    protocol: 'parts-unburdening',
    pillar: 'rewire',
    atomId: 'phoenix-ash',
    essence: 'Ash is not the end of fire.',
    steps: [
      {
        container: 'resource',
        copy: 'Ash is warm. The fire is finished.',
        subCopy: 'What remains is raw material.',
        minDurationHint: 8,
      },
      {
        container: 'titration',
        copy: 'I failed them.',
        subCopy: 'The heat of this is real. The permanence is not.',
        instruction: 'A part of you carries this. Identify the part.',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Hold the heat. Then release.',
        instruction: 'Press to hold the burdened part. Release to separate.',
        minDurationHint: 12,
      },
      {
        container: 'defusion',
        copy: 'Failure is an event. Not an identity. The ash is not the fire.',
        subCopy: 'The part that carries this can step back.',
        minDurationHint: 10,
      },
      {
        container: 'wash',
        copy: 'Heat transmuted. The residue is potential.',
        minDurationHint: 8,
      },
    ],
  },

  // ─── SCHEMA RESCRIPTING — via future memory ───
  {
    id: 'rescript-recovery',
    name: 'Forward Memory',
    schema: 'I will never recover from this.',
    protocol: 'schema-rescripting',
    pillar: 'rewire',
    atomId: 'future-memory',
    essence: 'Memory is not only backward.',
    steps: [
      {
        container: 'resource',
        copy: 'Memory is not only backward.',
        subCopy: 'Your hand knows what comes next.',
        minDurationHint: 8,
      },
      {
        container: 'titration',
        copy: 'I will never recover from this.',
        subCopy: 'A prediction. Not a memory. Not yet true.',
        instruction: 'Draw the shape of what recovery looks like.',
        minDurationHint: 12,
      },
      {
        container: 'defusion',
        copy: 'You are authoring, not predicting. The shape was already forming.',
        subCopy: 'The capable self is already here.',
        minDurationHint: 10,
      },
      {
        container: 'wash',
        copy: 'Remembered forward. The architecture is yours.',
        minDurationHint: 8,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PILLAR: BASELINE — Somatic & Breath
  // ═══════════════════════════════════════════════════

  // ─── SOMATIC TITRATION — body-focused ───
  {
    id: 'titration-chest',
    name: 'Chest Anchor',
    schema: 'The tightness in my chest when I think of them.',
    protocol: 'somatic-titration',
    pillar: 'baseline',
    atomId: 'somatic-resonance',
    essence: 'The membrane moves because you move.',
    useBreathVolume: true,
    steps: [
      {
        container: 'resource',
        copy: 'Your breath is the anchor.',
        subCopy: 'The membrane moves because you move.',
        instruction: 'Press to inhale. Release to exhale. Match the glass.',
        minDurationHint: 10,
      },
      {
        container: 'titration',
        copy: 'The tightness in my chest when I think of them.',
        subCopy: 'Where does it live? What shape does it take?',
        instruction: 'Locate the sensation. Draw its boundary on the glass.',
        minDurationHint: 12,
      },
      {
        container: 'pendulation',
        copy: 'Breathe into the edges.',
        instruction: 'Slide toward the sensation. Slide back to the pulse.',
        subCopy: 'The nervous system learns the return path.',
        minDurationHint: 15,
      },
      {
        container: 'wash',
        copy: 'The edges soften. The signal was received.',
        minDurationHint: 8,
      },
    ],
  },

  // ─── GROWTH PENDULATION — via mycelial routing ───
  {
    id: 'pendulation-trust',
    name: 'Root Pendulation',
    schema: 'I cannot trust anyone.',
    protocol: 'somatic-titration',
    pillar: 'baseline',
    atomId: 'mycelial-routing',
    essence: 'Networks form without architects.',
    steps: [
      {
        container: 'resource',
        copy: 'A network forms without architects.',
        subCopy: 'Each node is a choice. Each connection is voluntary.',
        minDurationHint: 8,
      },
      {
        container: 'titration',
        copy: 'I cannot trust anyone.',
        subCopy: 'A belief that once served as protection.',
        instruction: 'Tap to seed a new path. Watch the network respond.',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Navigate between isolation and connection.',
        instruction: 'Tap near the schema to feel isolation. Tap the edges to feel the network.',
        subCopy: 'Protection is not the same as isolation.',
        minDurationHint: 15,
      },
      {
        container: 'wash',
        copy: 'New routes formed. The old path remains. Both are true.',
        minDurationHint: 8,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PILLAR: SHIELD — Energetic & Spatial
  // ═══════════════════════════════════════════════════

  // ─── ENERGETIC BOUNDARY — for HSPs and enmeshment ───
  {
    id: 'shield-boundary',
    name: 'Perimeter Cast',
    schema: 'I absorb everyone else\'s pain.',
    protocol: 'somatic-titration',
    pillar: 'shield',
    atomId: 'mycelial-routing',
    essence: 'The perimeter is not a wall. It is a membrane you control.',
    useBoundaryField: true,
    steps: [
      {
        container: 'resource',
        copy: 'You are the center of your own field.',
        subCopy: 'Before we address what comes in, we establish what is already here.',
        instruction: 'Press to inhale. Release to exhale. Find the rhythm.',
        minDurationHint: 10,
      },
      {
        container: 'titration',
        copy: 'I absorb everyone else\'s pain.',
        subCopy: 'This was once survival. It is no longer required.',
        instruction: 'Observe the thought. The boundary field awaits.',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Cast the boundary.',
        instruction: 'Press and hold to expand the perimeter. Release to observe. Watch what deflects.',
        subCopy: 'What is outside the field is not yours to carry.',
        minDurationHint: 20,
      },
      {
        container: 'wash',
        copy: 'The perimeter holds. It was always yours to define.',
        minDurationHint: 8,
      },
    ],
  },

  // ─── CENTRIFUGE — clearing external noise ───
  {
    id: 'shield-centrifuge',
    name: 'The Centrifuge',
    schema: 'I cannot tell which feelings are mine.',
    protocol: 'act-defusion',
    pillar: 'shield',
    atomId: 'cymatic-coherence',
    essence: 'Spin the noise outward. What remains at the center is yours.',
    useBoundaryField: true,
    steps: [
      {
        container: 'resource',
        copy: 'Stillness is the test.',
        subCopy: 'In the center of the spin, there is a point that does not move.',
        minDurationHint: 10,
      },
      {
        container: 'titration',
        copy: 'I cannot tell which feelings are mine.',
        subCopy: 'The confusion is real. The permanence is not.',
        instruction: 'Observe the interference pattern. The noise has a frequency.',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Separate the signal from the noise.',
        instruction: 'Press and hold center to cast the field. External frequencies deflect.',
        subCopy: 'Each deflection is something that was never yours.',
        minDurationHint: 18,
      },
      {
        container: 'defusion',
        copy: 'What remains at the center is the original signal. That is you.',
        subCopy: 'The noise was real. The ownership was inherited.',
        minDurationHint: 10,
      },
      {
        container: 'wash',
        copy: 'The field is clear. The center holds.',
        minDurationHint: 8,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PILLAR: BRIDGE — Relational & Social
  // ═══════════════════════════════════════════════════

  // ─── HOLDING GROUND — embodied "no" ───
  {
    id: 'bridge-no',
    name: 'The Ground',
    schema: 'I cannot say no without losing them.',
    protocol: 'somatic-titration',
    pillar: 'bridge',
    atomId: 'somatic-resonance',
    essence: 'A "no" delivered from the body is unshakeable.',
    useBreathVolume: true,
    steps: [
      {
        container: 'resource',
        copy: 'Feel the ground beneath you.',
        subCopy: 'Your feet are on the floor. Your weight is held. This is the foundation.',
        instruction: 'Press to inhale. Release to exhale. Root downward.',
        minDurationHint: 12,
      },
      {
        container: 'titration',
        copy: 'I cannot say no without losing them.',
        subCopy: 'The fear is in the anticipation. Not in the word.',
        instruction: 'Observe the weight of this belief. Where does it press?',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Hold the ground. Then breathe the word.',
        instruction: 'Drag downward to root. Drag upward to speak. Feel the oscillation between staying grounded and expressing the boundary.',
        subCopy: 'The ground does not leave when you speak from it.',
        minDurationHint: 18,
      },
      {
        container: 'wash',
        copy: 'The ground held. The word was spoken. Nothing collapsed.',
        minDurationHint: 10,
      },
    ],
  },

  // ─── RELATIONAL REPAIR — holding space ───
  {
    id: 'bridge-repair',
    name: 'Held Space',
    schema: 'If I show them what I actually feel, they will leave.',
    protocol: 'act-defusion',
    pillar: 'bridge',
    atomId: 'dark-matter',
    essence: 'Vulnerability is not weakness. It is the gravitational field that holds connection.',
    steps: [
      {
        container: 'resource',
        copy: 'The space between two people is not empty.',
        subCopy: 'It is held by the gravity of what is unsaid.',
        minDurationHint: 10,
      },
      {
        container: 'titration',
        copy: 'If I show them what I actually feel, they will leave.',
        subCopy: 'A prediction based on old architecture.',
        instruction: 'Observe the prediction. It is specific. It is old.',
        minDurationHint: 10,
      },
      {
        container: 'pendulation',
        copy: 'Hold the fear. Then hold the possibility.',
        instruction: 'Drag toward the fear. Drag toward the opening. Feel both.',
        subCopy: 'The oscillation is the practice. Staying with both is the skill.',
        minDurationHint: 15,
      },
      {
        container: 'defusion',
        copy: 'The prediction is a memory dressed as a forecast. You are authoring the next chapter, not repeating the last one.',
        subCopy: 'The person in front of you is not the person who left.',
        minDurationHint: 12,
      },
      {
        container: 'wash',
        copy: 'The space held. The gravity shifted. Something new is possible.',
        minDurationHint: 8,
      },
    ],
  },
];

/** Look up a practice by ID */
export function getPractice(id: string): Practice | undefined {
  return FORM_PRACTICES.find(p => p.id === id);
}

/** Get practices by protocol */
export function getPracticesByProtocol(protocol: string): Practice[] {
  return FORM_PRACTICES.filter(p => p.protocol === protocol);
}

/** Get practices by atom */
export function getPracticesByAtom(atomId: string): Practice[] {
  return FORM_PRACTICES.filter(p => p.atomId === atomId);
}

/** Get practices by pillar */
export function getPracticesByPillar(pillar: string): Practice[] {
  return FORM_PRACTICES.filter(p => p.pillar === pillar);
}
