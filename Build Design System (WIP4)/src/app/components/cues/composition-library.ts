/**
 * COMPOSITION LIBRARY — The Scored Vocabulary
 *
 * 24 compositions across the rhythmic scale.
 * 7 Pulses. 8 Twins. 6 Tris. 3 Arcs.
 *
 * Every one of the 17 implemented atoms appears
 * in at least two compositions. The library covers
 * all five environmental postures (observe, diffuse,
 * provoke, install, seal) and all seven capture modes
 * (none, gesture, binary, select, whisper, thought, voice).
 *
 * TWINs and TRIs carry at most ONE soft capture each.
 * ARCs carry 2 soft captures, spaced across phases.
 * Over many sessions, the clinical engine rotates
 * compositions to gradually collect all data modalities
 * without any single session feeling like intake.
 *
 * A declined invitation is itself signal.
 *
 * ═══════════════════════════════════════════════════════
 * VOICE PRINCIPLES
 * ═══════════════════════════════════════════════════════
 *
 * The glass is a tuning fork, not a doctor.
 * No dashes. No hyphens. Period. New sentence.
 *
 * CANOPY (the invitation):
 *   Questions. Paradoxes. Observations about physics and nature.
 *   Never about the user's specific state. Never promising outcomes.
 *   Timeless. Epistemic humility. We do not know their pain.
 *
 * GESTURE (the physics):
 *   Pure physical instruction for the thumbs on the glass.
 *   No emotional content. No psychological narrative.
 *
 * RECEIPT (the lingering chord):
 *   Not a period. An ellipsis. Never claims what happened.
 *   Leaves immense, quiet space.
 *
 * ═══════════════════════════════════════════════════════
 * NAMING CONVENTION
 * ═══════════════════════════════════════════════════════
 *
 * PULSE:  Named for the quality (e.g., "Arrival")
 * TWIN:   Named for the duality (e.g., "Weight & Light")
 * TRI:    Named for the motion (e.g., "The Clearing")
 * ARC:    Named for the corridor (e.g., "The Descent")
 */

import type { Composition } from './composition-types';

// ═══════════════════════════════════════════════════════
// PULSES — 1 Beat
// ═══════════════════════════════════════════════════════

export const PULSE_COMPOSITIONS: Composition[] = [
  {
    id: 'pulse-arrival',
    type: 'pulse',
    name: 'Arrival',
    essence: 'What if arriving has already happened?',
    posture: 'observe',
    beats: [{
      position: 0,
      role: 'intercept',
      atomId: 'still-point',
      sync: {
        canopy: 'What if arriving already happened.',
        gesture: 'Be still.',
        receipt: '...here',
      },
      capture: 'none',
      durationMs: 14000,
    }],
  },
  {
    id: 'pulse-tide',
    type: 'pulse',
    name: 'Entrainment',
    essence: 'The rhythm was never lost.',
    posture: 'observe',
    beats: [{
      position: 0,
      role: 'intercept',
      atomId: 'tidal-breath',
      sync: {
        canopy: 'The tide has no agenda. It just moves.',
        gesture: 'Breathe with it.',
        receipt: '...rhythm',
      },
      capture: 'gesture',
      durationMs: 20000,
    }],
  },
  {
    id: 'pulse-release',
    type: 'pulse',
    name: 'Setting Down',
    essence: 'Mass can be set down. That\'s all.',
    posture: 'diffuse',
    beats: [{
      position: 0,
      role: 'intercept',
      atomId: 'weight-release',
      sync: {
        canopy: 'Something has mass. It can be set down.',
        gesture: 'Drag it down.',
        receipt: '...lighter?',
      },
      capture: 'gesture',
      durationMs: 15000,
    }],
  },
  {
    id: 'pulse-frequency',
    type: 'pulse',
    name: 'The Frequency',
    essence: 'Chaos is order at a frequency not yet matched.',
    posture: 'provoke',
    beats: [{
      position: 0,
      role: 'parallax',
      atomId: 'cymatic-coherence',
      sync: {
        canopy: 'Chaos is order at a frequency not yet matched.',
        gesture: 'Breathe.',
        receipt: '...pattern',
      },
      capture: 'gesture',
      durationMs: 18000,
    }],
  },
  {
    id: 'pulse-dark-field',
    type: 'pulse',
    name: 'Dark Field',
    essence: 'The most powerful forces are invisible.',
    posture: 'observe',
    beats: [{
      position: 0,
      role: 'mirror',
      atomId: 'dark-matter',
      sync: {
        canopy: 'The most powerful forces are invisible.',
        gesture: 'Hold.',
        receipt: '...gravity',
      },
      capture: 'none',
      durationMs: 16000,
    }],
  },
  {
    id: 'pulse-soma',
    type: 'pulse',
    name: 'The Soma',
    essence: 'The membrane does not wait for permission.',
    posture: 'install',
    beats: [{
      position: 0,
      role: 'intercept',
      atomId: 'somatic-resonance',
      sync: {
        canopy: 'The membrane does not wait for permission.',
        gesture: 'Breathe.',
        receipt: '...humming',
      },
      capture: 'gesture',
      durationMs: 18000,
    }],
  },
  {
    id: 'pulse-remnant',
    type: 'pulse',
    name: 'The Remnant',
    essence: 'What remains is still glowing.',
    posture: 'provoke',
    beats: [{
      position: 0,
      role: 'synthesis',
      atomId: 'ember-grid',
      sync: {
        canopy: 'Not everything dimmed. Something is glowing.',
        gesture: 'Touch.',
        receipt: '...warm',
      },
      capture: 'gesture',
      durationMs: 12000,
    }],
  },
];

// ═══════════════════════════════════════════════════════
// TWINS — 2 Beats — The Architecture of Contrast
// ═══════════════════════════════════════════════════════
//
// A TWIN is a precision scalpel. Two beats. One intent.
// Beat 1 catches the inertia. Beat 2 applies the opposing force.
//
// THE SIX BINARY INTENTS:
//   OBSERVE  — Objectify the phenomenon. Then create distance.
//   ENGAGE   — Name the stasis. Then demand the strike.
//   DIFFUSE  — Match the pace. Then exhale.
//   PROVOKE  — Show the illusion. Then fracture it.
//   INSTALL  — Clear the field. Then plant one truth.
//   SEAL     — Synthesize what shifted. Then release.
//
// Every TWIN below has:
//   • Two different voice treatments (maximum typographic contrast)
//   • Contrasting gestures (Beat 1 ≠ Beat 2)
//   • Transition type matching intent
//   • At most one soft capture
//
// ═══════════════════════════════════════════════════════

export const TWIN_COMPOSITIONS: Composition[] = [

  // ─── OBSERVE: "Noise & Distance" ───
  // The static is objectified as a thing with shape.
  // Then the plane shifts. From here, it is weather.
  // clinical → whisper = sharp observation → peripheral fade
  {
    id: 'twin-noise-and-distance',
    type: 'twin',
    name: 'Noise & Distance',
    essence: 'Name it. Watch it pass.',
    posture: 'observe',
    beats: [
      {
        position: 0,
        role: 'mirror',
        atomId: 'signal-fire',
        sync: {
          canopy: 'The static has a shape.',
          gesture: 'Watch.',
          receipt: '...loud',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'snap',
      },
      {
        position: 1,
        role: 'seal',
        atomId: 'dark-matter',
        sync: {
          canopy: 'From here it is just weather.',
          gesture: 'Breathe.',
          receipt: '...passing',
        },
        capture: 'none',
        durationMs: 16000,
      },
    ],
  },

  // ─── OBSERVE 2: "Spin & Stillness" ───
  // Every possibility collapses at once. Scattered.
  // Then the Z axis cuts to the center that was there all along.
  // scattered → koan = fragmented chaos → centered contemplation
  {
    id: 'twin-spin-and-stillness',
    type: 'twin',
    name: 'Spin & Stillness',
    essence: 'Chaos. Then center.',
    posture: 'observe',
    beats: [
      {
        position: 0,
        role: 'mirror',
        atomId: 'wave-collapse',
        sync: {
          canopy: 'Everything at once.',
          gesture: 'Hold.',
          receipt: '...spinning',
        },
        capture: 'gesture',
        durationMs: 14000,
        transitionOut: 'snap',
      },
      {
        position: 1,
        role: 'seal',
        atomId: 'still-point',
        sync: {
          canopy: 'Stillness was here the whole time.',
          gesture: 'Be still.',
          receipt: '...center',
        },
        capture: 'none',
        durationMs: 16000,
      },
    ],
  },

  // ─── ENGAGE: "Lock & Strike" ───
  // The body is frozen. Somatic names where.
  // Then the monolith demands movement. Not understanding. Movement.
  // somatic → monolith = left-anchored body → stark singular demand
  {
    id: 'twin-lock-and-strike',
    type: 'twin',
    name: 'Lock & Strike',
    essence: 'The lock breaks.',
    posture: 'provoke',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'somatic-resonance',
        sync: {
          canopy: 'The body is holding.',
          gesture: 'Notice where.',
          receipt: '...locked',
        },
        capture: 'gesture',
        durationMs: 14000,
        transitionOut: 'snap',
      },
      {
        position: 1,
        role: 'synthesis',
        atomId: 'weight-release',
        sync: {
          canopy: 'Movement does not wait.',
          gesture: 'Drag it down.',
          receipt: '...moving',
        },
        capture: 'gesture',
        durationMs: 14000,
      },
    ],
  },

  // ─── DIFFUSE: "Velocity & Ground" ───
  // The frequency is high. Atmospheric text fills the glass.
  // Then the container expands. The koan finds the floor.
  // atmospheric → koan = text as environment → centered breath
  {
    id: 'twin-velocity-and-ground',
    type: 'twin',
    name: 'Velocity & Ground',
    essence: 'Velocity meets earth.',
    posture: 'diffuse',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'cymatic-coherence',
        sync: {
          canopy: 'The frequency is high.',
          gesture: 'Breathe.',
          receipt: '...fast',
        },
        capture: 'gesture',
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'seal',
        atomId: 'tidal-breath',
        sync: {
          canopy: 'The ground does not rush.',
          gesture: 'Slow.',
          receipt: '...settling',
        },
        capture: 'gesture',
        durationMs: 18000,
      },
    ],
  },

  // ─── DIFFUSE 2: "Heat & Cool" ───
  // Something is still burning. Clinical precision names it.
  // Then it bleeds to the edges. The whisper fades it out.
  // clinical → whisper = precise heat → peripheral fade
  {
    id: 'twin-heat-and-cool',
    type: 'twin',
    name: 'Heat & Cool',
    essence: 'Heat bleeds off.',
    posture: 'diffuse',
    beats: [
      {
        position: 0,
        role: 'mirror',
        atomId: 'ember-grid',
        sync: {
          canopy: 'Something is still burning.',
          gesture: 'Touch.',
          receipt: '...hot',
        },
        capture: 'gesture',
        durationMs: 14000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'seal',
        atomId: 'pendulum-rest',
        sync: {
          canopy: 'The swing finds center on its own.',
          gesture: 'Let it.',
          receipt: '...cooling',
        },
        capture: 'none',
        durationMs: 18000,
      },
    ],
  },

  // ─── PROVOKE: "Wall & Door" ───
  // The wall is scattered across the glass. Fragments of defense.
  // Then the monolith drops one truth. Walls are decisions.
  // scattered → monolith = fragmented architecture → singular fracture
  {
    id: 'twin-wall-and-door',
    type: 'twin',
    name: 'Wall & Door',
    essence: 'The wall becomes a door.',
    posture: 'provoke',
    beats: [
      {
        position: 0,
        role: 'parallax',
        atomId: 'dissolve',
        sync: {
          canopy: 'There is a wall. It was necessary once.',
          gesture: 'Hold the edge.',
          receipt: '...solid',
        },
        capture: 'gesture',
        durationMs: 14000,
        transitionOut: 'snap',
      },
      {
        position: 1,
        role: 'synthesis',
        atomId: 'threshold',
        sync: {
          canopy: 'Walls are decisions. Decisions end.',
          gesture: 'Step through.',
          receipt: '...open',
        },
        capture: 'binary',
        captureOptions: {
          options: ['hold', 'release'],
        },
        durationMs: 16000,
      },
    ],
  },

  // ─── INSTALL: "Dark & Seed" ───
  // The noise fades to the edges. Whisper dissolves the field.
  // Then something grows in the silence. Organic. Natural. Grounded.
  // whisper → organic = almost nothing → natural reading flow
  {
    id: 'twin-dark-and-seed',
    type: 'twin',
    name: 'Dark & Seed',
    essence: 'The cleared field receives.',
    posture: 'install',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'dark-matter',
        sync: {
          canopy: 'The noise fades.',
          gesture: 'Hold.',
          receipt: '...quiet',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'breathe',
      },
      {
        position: 1,
        role: 'seal',
        atomId: 'root-pulse',
        sync: {
          canopy: 'What grows here was waiting for silence.',
          gesture: 'Touch.',
          receipt: '...planted',
        },
        capture: 'whisper',
        captureOptions: {
          prompt: 'if a word arrives...',
        },
        durationMs: 18000,
      },
    ],
  },

  // ─── SEAL: "Ember & Day" ───
  // Something shifted. The atmospheric residue is still warm.
  // Then the body speaks. Somatic. Grounded. Back to life.
  // atmospheric → somatic = text as texture → left-anchored body
  {
    id: 'twin-ember-and-day',
    type: 'twin',
    name: 'Ember & Day',
    essence: 'Something shifted. The rest belongs to the day.',
    posture: 'seal',
    beats: [
      {
        position: 0,
        role: 'synthesis',
        atomId: 'phoenix-ash',
        sync: {
          canopy: 'Something shifted. The residue is warm.',
          gesture: 'Hold.',
          receipt: '...warm',
        },
        capture: 'gesture',
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'seal',
        atomId: 'mirror-breath',
        sync: {
          canopy: 'The rest belongs to the day.',
          gesture: 'Let go.',
          receipt: '...',
        },
        capture: 'none',
        durationMs: 14000,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// TRIS — 3 Beats
// The Architecture of Resolution.
// Every TRI runs a self-contained dialectic:
//   Beat 1 = Intercept (match inertia)
//   Beat 2 = Parallax (shift the dimension)
//   Beat 3 = Synthesis (demand agency)
//
// Five master architectures:
//   DISARM     — The false threat. Armor → Empty room → Drop.
//   EXCAVATE   — The root. Bodyguard → Hinge → Core.
//   RECALIBRATE — The center. Static → Tuning fork → Sync.
//   REFRAME    — The prism. Monolith → Rotation → Step.
//   TRANSMUTE  — Flow. Freeze → Heat → Current.
// ═══════════════════════════════════════════════════════

export const TRI_COMPOSITIONS: Composition[] = [

  // ─── DISARM: "The Clearing" ───
  // The system is braced. The room turns out to be empty.
  // The armor can find the floor.
  // koan → scattered → monolith
  {
    id: 'tri-the-clearing',
    type: 'tri',
    name: 'The Clearing',
    essence: 'Three notes. One chord.',
    posture: 'observe',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'still-point',
        sync: {
          canopy: 'The whole system is braced.',
          gesture: 'Be still.',
          receipt: '...holding',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'parallax',
        atomId: 'dissolve',
        sync: {
          canopy: 'The room, it turns out, is empty.',
          gesture: 'Watch.',
          receipt: '...clearing',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'flow',
      },
      {
        position: 2,
        role: 'synthesis',
        atomId: 'threshold',
        sync: {
          canopy: 'Let the armor find the floor.',
          gesture: 'Breathe.',
          receipt: '...through',
        },
        capture: 'none',
        durationMs: 16000,
      },
    ],
  },

  // ─── EXCAVATE: "The Naming" ───
  // The noise at the surface is validated. The layer peels.
  // What is still glowing underneath gets named.
  // clinical → somatic → clinical
  {
    id: 'tri-the-naming',
    type: 'tri',
    name: 'The Naming',
    essence: 'What is seen changes the seeing.',
    posture: 'install',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'signal-fire',
        sync: {
          canopy: 'The noise at the door is real.',
          gesture: 'Watch.',
          receipt: '...loud',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'parallax',
        atomId: 'mirror-breath',
        sync: {
          canopy: 'Behind the noise. Something quieter.',
          gesture: 'Hold.',
          receipt: '...underneath',
        },
        capture: 'gesture',
        durationMs: 14000,
        transitionOut: 'flow',
      },
      {
        position: 2,
        role: 'synthesis',
        atomId: 'ember-grid',
        sync: {
          canopy: 'Name what is still glowing.',
          gesture: 'Hold.',
          receipt: '...named',
        },
        capture: 'whisper',
        captureOptions: {
          prompt: 'if a word comes...',
        },
        durationMs: 18000,
      },
    ],
  },

  // ─── RECALIBRATE: "The Resonance" ───
  // The bandwidth is saturated. A single frequency emerges.
  // The body aligns before the mind catches up.
  // somatic → scattered → organic
  {
    id: 'tri-the-resonance',
    type: 'tri',
    name: 'The Resonance',
    essence: 'The body does not wait for permission.',
    posture: 'provoke',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'somatic-resonance',
        sync: {
          canopy: 'The bandwidth is saturated.',
          gesture: 'Breathe.',
          receipt: '...scattered',
        },
        capture: 'gesture',
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'parallax',
        atomId: 'wave-collapse',
        sync: {
          canopy: 'Listen for the single clear note.',
          gesture: 'Hold.',
          receipt: '...found',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'flow',
      },
      {
        position: 2,
        role: 'synthesis',
        atomId: 'mycelial-routing',
        sync: {
          canopy: 'Align to this frequency.',
          gesture: 'Touch.',
          receipt: '...synced',
        },
        capture: 'none',
        durationMs: 16000,
      },
    ],
  },

  // ─── REFRAME: "The Crossroads" ───
  // A thought solidified. The angle shifts. The structure
  // was hollow the whole time. Walk through.
  // monolith → whisper → koan
  {
    id: 'tri-the-crossroads',
    type: 'tri',
    name: 'The Crossroads',
    essence: 'Two paths. The fork is the turn.',
    posture: 'provoke',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'weight-release',
        sync: {
          canopy: 'The thought has turned to stone.',
          gesture: 'Hold.',
          receipt: '...heavy',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'parallax',
        atomId: 'pendulum-rest',
        sync: {
          canopy: 'Turn it. Notice how thin.',
          gesture: 'Notice.',
          receipt: '...thin',
        },
        capture: 'binary',
        captureOptions: {
          options: ['stay', 'move'],
        },
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 2,
        role: 'synthesis',
        atomId: 'tidal-breath',
        sync: {
          canopy: 'Walk through the paper wall.',
          gesture: 'Breathe.',
          receipt: '...open',
        },
        capture: 'none',
        durationMs: 16000,
      },
    ],
  },

  // ─── DISARM variant: "The Harvest" ───
  // A field of signals. Attention collapses to what persists.
  // Something grew. What catches.
  // atmospheric → scattered → organic
  {
    id: 'tri-the-harvest',
    type: 'tri',
    name: 'The Harvest',
    essence: 'What grew. What resonated. What remains.',
    posture: 'seal',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'cymatic-coherence',
        sync: {
          canopy: 'A field of signals. Something persists.',
          gesture: 'Watch.',
          receipt: '...emerging',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'parallax',
        atomId: 'wave-collapse',
        sync: {
          canopy: 'Attention lands where it is drawn.',
          gesture: 'Hold.',
          receipt: '...landed',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'flow',
      },
      {
        position: 2,
        role: 'synthesis',
        atomId: 'root-pulse',
        sync: {
          canopy: 'Something grew. What catches.',
          gesture: 'Notice.',
          receipt: '...gathered',
        },
        capture: 'select',
        captureOptions: {
          options: ['clarity', 'warmth', 'weight', 'space'],
        },
        durationMs: 16000,
      },
    ],
  },

  // ─── TRANSMUTE: "The Testimony" ───
  // Something in this room has weight. Warmth enters.
  // The current carries what remains.
  // whisper → atmospheric → organic
  {
    id: 'tri-the-testimony',
    type: 'tri',
    name: 'The Testimony',
    essence: 'Weight set down. Gravity noticed. What sound remains.',
    posture: 'diffuse',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'dark-matter',
        sync: {
          canopy: 'Something in this room has weight.',
          gesture: 'Hold.',
          receipt: '...dense',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'flow',
      },
      {
        position: 1,
        role: 'parallax',
        atomId: 'phoenix-ash',
        sync: {
          canopy: 'Warmth enters. The edges blur.',
          gesture: 'Breathe.',
          receipt: '...softening',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'flow',
      },
      {
        position: 2,
        role: 'synthesis',
        atomId: 'future-memory',
        sync: {
          canopy: 'Let the current carry it.',
          gesture: 'Breathe.',
          receipt: '...rising',
        },
        capture: 'voice',
        captureOptions: {
          prompt: 'let the sound carry it...',
        },
        durationMs: 18000,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// ARCS — 5 Beats — The Thermodynamic Corridor
// ═══════════════════════════════════════════════════════
//
// An ARC is a complete thermodynamic corridor. It takes
// a systemic, deeply rooted cognitive loop and entirely
// unspools it across five scenes:
//
//   Scene I   = Intercept (catch the raw inertia)
//   Scene II  = Mirror (reveal the hidden cost)
//   Scene III = Parallax (shift the entire dimension)
//   Scene IV  = Synthesis (demand kinetic agency)
//   Scene V   = Seal (the autonomic exhale)
//
// Three master corridors, covering the fundamental
// nervous system states:
//
//   DESCENT   — Architecture of Gravity.
//               Sympathetic overdrive → grounding.
//               Speed burns off. The earth holds.
//
//   IGNITION  — Architecture of Ignition.
//               Dorsal vagal shutdown → spark.
//               Ice thaws. The engine turns over.
//
//   SURRENDER — Architecture of the Current.
//               Rigid grasping → float.
//               The grip opens. The water carries.
//
// Each ARC carries exactly 2 soft captures, spaced
// across phases. Each uses 5 unique atoms with maximum
// typographic contrast across the treatment arc.
// All transitions use 'breathe' (1200ms respiratory).
// ═══════════════════════════════════════════════════════

export const ARC_COMPOSITIONS: Composition[] = [

  // ─── DESCENT: "The Descent" ───
  // The velocity is immense. The system cannot hold
  // this orbit. The fall is not the danger. The mass
  // pulls down. The earth holds.
  // atmospheric → clinical → scattered → monolith → koan
  {
    id: 'arc-the-descent',
    type: 'arc',
    name: 'The Descent',
    essence: 'Velocity burns off. Gravity holds.',
    posture: 'diffuse',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'cymatic-coherence',
        sync: {
          canopy: 'The velocity is immense.',
          gesture: 'Breathe.',
          receipt: '...burning',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'breathe',
      },
      {
        position: 1,
        role: 'mirror',
        atomId: 'signal-fire',
        sync: {
          canopy: 'The system cannot hold this orbit.',
          gesture: 'Watch.',
          receipt: '...straining',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'breathe',
      },
      {
        position: 2,
        role: 'parallax',
        atomId: 'dissolve',
        sync: {
          canopy: 'The fall is not the danger.',
          gesture: 'Notice.',
          receipt: '...falling',
        },
        capture: 'binary',
        captureOptions: {
          options: ['hold', 'release'],
        },
        durationMs: 16000,
        transitionOut: 'breathe',
      },
      {
        position: 3,
        role: 'synthesis',
        atomId: 'weight-release',
        sync: {
          canopy: 'Let the mass pull down.',
          gesture: 'Drag it down.',
          receipt: '...grounding',
        },
        capture: 'whisper',
        captureOptions: {
          prompt: 'if a word falls...',
        },
        durationMs: 18000,
        transitionOut: 'breathe',
      },
      {
        position: 4,
        role: 'seal',
        atomId: 'tidal-breath',
        sync: {
          canopy: 'The earth holds the weight.',
          gesture: 'Breathe.',
          receipt: '...',
        },
        capture: 'none',
        durationMs: 18000,
      },
    ],
  },

  // ─── IGNITION: "The Ignition" ───
  // The engine is quiet. The room is cold. The cold
  // preserves but also traps. An ember under the ash.
  // Feed the spark. The engine hums. The room is warm.
  // koan → whisper → atmospheric → somatic → organic
  {
    id: 'arc-the-ignition',
    type: 'arc',
    name: 'The Ignition',
    essence: 'Ash covers the ember. Not forever.',
    posture: 'provoke',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'still-point',
        sync: {
          canopy: 'The engine is quiet. The room is cold.',
          gesture: 'Be still.',
          receipt: '...frozen',
        },
        capture: 'none',
        durationMs: 18000,
        transitionOut: 'breathe',
      },
      {
        position: 1,
        role: 'mirror',
        atomId: 'dark-matter',
        sync: {
          canopy: 'The cold is a form of protection.',
          gesture: 'Hold.',
          receipt: '...preserving',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'breathe',
      },
      {
        position: 2,
        role: 'parallax',
        atomId: 'phoenix-ash',
        sync: {
          canopy: 'A single ember under the ash.',
          gesture: 'Breathe.',
          receipt: '...glowing',
        },
        capture: 'select',
        captureOptions: {
          options: ['warmth', 'rhythm', 'breath', 'light'],
        },
        durationMs: 18000,
        transitionOut: 'breathe',
      },
      {
        position: 3,
        role: 'synthesis',
        atomId: 'somatic-resonance',
        sync: {
          canopy: 'Feed the spark.',
          gesture: 'Breathe with it.',
          receipt: '...turning',
        },
        capture: 'voice',
        captureOptions: {
          prompt: 'let the engine turn over...',
        },
        durationMs: 20000,
        transitionOut: 'breathe',
      },
      {
        position: 4,
        role: 'seal',
        atomId: 'mycelial-routing',
        sync: {
          canopy: 'The engine hums. The room is warm.',
          gesture: 'Touch.',
          receipt: '...',
        },
        capture: 'none',
        durationMs: 16000,
      },
    ],
  },

  // ─── SURRENDER: "The Surrender" ───
  // The grip is absolute. The cost is visible. The hands
  // can open. The current takes it. The current was
  // always here.
  // monolith → clinical → scattered → organic → whisper
  {
    id: 'arc-the-surrender',
    type: 'arc',
    name: 'The Surrender',
    essence: 'The grip opens. The current carries.',
    posture: 'install',
    beats: [
      {
        position: 0,
        role: 'intercept',
        atomId: 'threshold',
        sync: {
          canopy: 'The grip is absolute.',
          gesture: 'Hold.',
          receipt: '...clenched',
        },
        capture: 'none',
        durationMs: 14000,
        transitionOut: 'breathe',
      },
      {
        position: 1,
        role: 'mirror',
        atomId: 'ember-grid',
        sync: {
          canopy: 'Notice the energy spent holding this.',
          gesture: 'Watch.',
          receipt: '...spending',
        },
        capture: 'thought',
        captureOptions: {
          prompt: 'what is the grip protecting...',
        },
        durationMs: 18000,
        transitionOut: 'breathe',
      },
      {
        position: 2,
        role: 'parallax',
        atomId: 'wave-collapse',
        sync: {
          canopy: 'What happens when the hands open.',
          gesture: 'Notice.',
          receipt: '...opening',
        },
        capture: 'none',
        durationMs: 16000,
        transitionOut: 'breathe',
      },
      {
        position: 3,
        role: 'synthesis',
        atomId: 'future-memory',
        sync: {
          canopy: 'Let the current take it.',
          gesture: 'Let go.',
          receipt: '...carried',
        },
        capture: 'binary',
        captureOptions: {
          options: ['clench', 'open'],
        },
        durationMs: 18000,
        transitionOut: 'breathe',
      },
      {
        position: 4,
        role: 'seal',
        atomId: 'pendulum-rest',
        sync: {
          canopy: 'The current was always here.',
          gesture: 'Breathe.',
          receipt: '...',
        },
        capture: 'none',
        durationMs: 18000,
      },
    ],
  },
];

// ─── Aggregated ───

export const ALL_COMPOSITIONS: Composition[] = [
  ...PULSE_COMPOSITIONS,
  ...TWIN_COMPOSITIONS,
  ...TRI_COMPOSITIONS,
  ...ARC_COMPOSITIONS,
];

/** Get compositions by type */
export function getCompositionsByType(type: Composition['type']): Composition[] {
  return ALL_COMPOSITIONS.filter(c => c.type === type);
}

/** Get composition by id */
export function getCompositionById(id: string): Composition | undefined {
  return ALL_COMPOSITIONS.find(c => c.id === id);
}

/** Get compositions by posture */
export function getCompositionsByPosture(posture: Composition['posture']): Composition[] {
  return ALL_COMPOSITIONS.filter(c => c.posture === posture);
}