/**
 * SEEK INSIGHTS — The Library of Ghosts
 *
 * Each insight is a complete cinematic arc — a JSON payload
 * that the engine renders into an interactive documentary.
 *
 * The clinical team composes arcs by selecting entry blocks,
 * transfer blocks, and ascertainment blocks. The engine does the rest.
 *
 * Block palette:
 *   ENTRY:       threshold-lock · somatic-sync · kinetic-clear
 *   TRANSFER:    focal-lens · pendulum-pan · depth-descent · somatic-gate
 *   KNOWING:     focus-pull · (alignment — future)
 *   BELIEVING:   gravity-drag · tension-tether
 *   EMBODYING:   topography-drop · ripple-radius
 *
 * Every insight uses a different combination. No two arcs feel the same.
 */

import type { SeekInsight } from './seek-types';

export const SEEK_INSIGHTS: SeekInsight[] = [
  // ═══════════════════════════════════════════════════
  // THE INNER CRITIC
  // Entry: Threshold Lock → heavy, deliberate consent
  // Believing: Tension Tether → pull on the old schema
  // Embodying: Topography Drop → place the truth on the body
  // ═══════════════════════════════════════════════════
  {
    id: 'inner-critic',
    title: 'The Wound of Unworthiness',
    schema: 'The Inner Critic',
    essence: 'The voice that judges you was built to protect you from someone else\'s judgement',
    color: '#B8A0FF',
    accentColor: '#E0D4FF',
    atomId: 'wave-collapse',
    scenes: [
      // ── ENTRY ──
      {
        id: 'entry-threshold',
        phase: 'entry',
        blockType: 'threshold-lock',
        copy: 'The Wound of Unworthiness',
        subCopy: 'The voice that judges you was built to protect you from someone else\'s judgement',
        instruction: 'PRESS AND HOLD TO BEGIN',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.3,
      },

      // ── TRANSFER: The Hook ──
      {
        id: 'transfer-hook',
        phase: 'transfer',
        blockType: 'focal-lens',
        copy: 'There is a voice inside you that knows exactly what to say to make you small.',
        sections: [
          'It speaks in your cadence, uses your vocabulary, knows your specific architecture of shame. It sounds so much like you that you have never thought to question its credentials.',
          'This voice is not a malfunction. It is a machine — assembled in childhood from the raw material of every correction, every disappointed look, every silence that lasted a beat too long.',
          'The inner critic is not your enemy. It is a bodyguard who never got the memo that you grew up.',
        ],
        instruction: 'DRAG TO ILLUMINATE',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.5,
      },

      // ── SOMATIC GATE: pause between revelation and descent ──
      {
        id: 'gate-descent',
        phase: 'transfer',
        blockType: 'somatic-gate',
        copy: 'Let the understanding arrive in the body before we go deeper.',
        instruction: 'HOLD TO PASS THROUGH',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.4,
      },

      // ── TRANSFER: The Mirror ──
      {
        id: 'transfer-mirror',
        phase: 'transfer',
        blockType: 'depth-descent',
        copy: 'The critic was born in the gap between who you were and who you were supposed to be.',
        sections: [
          'Every child needs to believe their caregivers are safe. When the environment delivers pain, the child faces an impossible equation: either the adults are wrong, or I am.',
          'The child always chooses the second option. Not because it is true — because it is survivable. If the problem is me, then maybe I can fix me. That is agency. That is hope dressed in self-blame.',
          'The inner critic is that child\'s solution, still running. It criticises you before anyone else can, because being first to the pain was once the only form of control available.',
        ],
        instruction: 'PULL TOWARD YOU',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.7,
      },

      // ── TRANSFER: The Descent ──
      {
        id: 'transfer-descent',
        phase: 'transfer',
        blockType: 'pendulum-pan',
        copy: 'The voice says you are not enough.',
        dualCopy: 'The truth is you were always enough for a room that could not hold you.',
        instruction: 'SHIFT BETWEEN TRUTHS',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.9,
      },

      // ── ASCERTAINMENT: KNOWING ──
      {
        id: 'ascertain-knowing',
        phase: 'ascertain',
        blockType: 'focus-pull',
        kbeDimension: 'knowing',
        copy: 'Bring the architecture into focus.',
        prompt: 'The critic is a protection that outlived its purpose',
        instruction: 'SHARPEN THE TRUTH',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.4,
      },

      // ── ASCERTAINMENT: BELIEVING — Tension Tether ──
      {
        id: 'ascertain-believing',
        phase: 'ascertain',
        blockType: 'tension-tether',
        kbeDimension: 'believing',
        copy: 'I am not enough.',
        prompt: 'This is the old string. Feel the tension. Then let it go.',
        instruction: 'PULL AND RELEASE',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.3,
      },

      // ── ASCERTAINMENT: EMBODYING — Topography Drop ──
      {
        id: 'ascertain-embodying',
        phase: 'ascertain',
        blockType: 'topography-drop',
        kbeDimension: 'embodying',
        copy: 'Where does this sit?',
        prompt: 'Place the light where the truth landed.',
        instruction: 'PLACE THE LIGHT',
        atomId: 'wave-collapse',
        atmosphereIntensity: 0.2,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // ENMESHMENT
  // Entry: Somatic Sync → settle the nervous system first
  // Believing: Gravity Drag → classic weight mechanic
  // Embodying: Ripple Radius → how far does this reach?
  // ═══════════════════════════════════════════════════
  {
    id: 'enmeshment',
    title: 'The Invisible Leash',
    schema: 'Enmeshment',
    essence: 'You learned to feel other people\'s feelings before you learned to feel your own',
    color: '#80C8A0',
    accentColor: '#B8E8C8',
    atomId: 'mycelial-routing',
    scenes: [
      // ── ENTRY: Somatic Sync — this insight needs baseline regulation ──
      {
        id: 'entry-sync',
        phase: 'entry',
        blockType: 'somatic-sync',
        copy: 'The Invisible Leash',
        subCopy: 'You learned to feel other people\'s feelings before you learned to feel your own',
        instruction: 'HOLD AND BREATHE WITH THE GLASS',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.3,
      },

      // ── TRANSFER: The Hook ──
      {
        id: 'transfer-hook',
        phase: 'transfer',
        blockType: 'focal-lens',
        copy: 'You walk into a room and you know. Before anyone speaks, before the first glance, your body has already mapped the emotional weather of every person present.',
        sections: [
          'This is not empathy. Empathy is a choice. This is surveillance — a hypervigilance of other people\'s internal states that was installed so early you cannot remember a time before it.',
          'You learned to read rooms because rooms were dangerous. The temperature of a parent\'s mood was the difference between safety and chaos. So your nervous system became an antenna, tuned to frequencies that were never yours to carry.',
          'The cost is invisible and total. You know what everyone else feels. You have no idea what you feel.',
        ],
        instruction: 'DRAG TO ILLUMINATE',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.5,
      },

      // ── SOMATIC GATE: the body needs to process this ──
      {
        id: 'gate-process',
        phase: 'transfer',
        blockType: 'somatic-gate',
        copy: 'The antenna is still scanning. Let it rest here for a moment.',
        instruction: 'HOLD TO PASS THROUGH',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.4,
      },

      // ── TRANSFER: The Mirror ──
      {
        id: 'transfer-descent',
        phase: 'transfer',
        blockType: 'depth-descent',
        copy: 'The leash was woven from love and necessity.',
        sections: [
          'A child who cannot influence the emotional state of their caregiver is a child in danger. So you became the thermostat. You learned to regulate the room — to anticipate eruptions, smooth tensions, fill silences with the exact performance that would keep the temperature stable.',
          'This was not a flaw. This was genius. A small human engineering their own survival by becoming essential to the emotional infrastructure of the household.',
          'But the leash does not dissolve when you leave the house. It stretches. Every relationship you enter, you enter as the thermostat. Every silence feels like a threat. Every mood you cannot fix feels like a failure that is somehow yours.',
        ],
        instruction: 'PULL TOWARD YOU',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.7,
      },

      // ── TRANSFER: The Pendulum ──
      {
        id: 'transfer-pan',
        phase: 'transfer',
        blockType: 'pendulum-pan',
        copy: 'Their pain is not your assignment.',
        dualCopy: 'Your stillness is not abandonment. It is the first act of self-retrieval.',
        instruction: 'SHIFT BETWEEN TRUTHS',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.9,
      },

      // ── ASCERTAINMENT: KNOWING ──
      {
        id: 'ascertain-knowing',
        phase: 'ascertain',
        blockType: 'focus-pull',
        kbeDimension: 'knowing',
        copy: 'Bring the pattern into focus.',
        prompt: 'Enmeshment is loyalty that forgot to include you',
        instruction: 'SHARPEN THE TRUTH',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.4,
      },

      // ── ASCERTAINMENT: BELIEVING — Gravity Drag ──
      {
        id: 'ascertain-believing',
        phase: 'ascertain',
        blockType: 'gravity-drag',
        kbeDimension: 'believing',
        copy: 'How heavy is this truth today?',
        prompt: 'Drag the weight upward. The resistance is the measure.',
        instruction: 'LIFT THE TRUTH',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.3,
      },

      // ── ASCERTAINMENT: EMBODYING — Ripple Radius ──
      {
        id: 'ascertain-embodying',
        phase: 'ascertain',
        blockType: 'ripple-radius',
        kbeDimension: 'embodying',
        copy: 'How far does this reach?',
        prompt: 'Hold to expand. The radius is the resonance.',
        instruction: 'HOLD AND EXPAND',
        atomId: 'mycelial-routing',
        atmosphereIntensity: 0.2,
      },
    ],
  },
];
