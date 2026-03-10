import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import { LabShell } from './components/LabShell';

type ChamberId =
  | 'essence'
  | 'field'
  | 'atmosphere'
  | 'breath'
  | 'voice'
  | 'glass'
  | 'canopy'
  | 'proof'
  | 'atoms'
  | 'modalities'
  | 'altitudes'
  | 'interrogation';

type Chamber = {
  id: ChamberId;
  label: string;
  number: string;
  eyebrow: string;
  title: string;
  thesis: string;
  feeling: string;
  governs: string[];
  currentInputs: string[];
  asks: string[];
  downstream: string[];
  specimen: {
    lead: string;
    headline: string;
    body: string;
  };
  palette: {
    glowA: string;
    glowB: string;
    line: string;
    accent: string;
  };
};

const SANCTUARY = {
  void: '#090706',
  deep: '#100b09',
  field: '#16100d',
  paper: '#f4ecdf',
  mist: 'rgba(244, 236, 223, 0.72)',
  hush: 'rgba(244, 236, 223, 0.42)',
  line: 'rgba(244, 236, 223, 0.09)',
  ember: '#b66f49',
  amber: '#cc9a64',
  moss: '#6d8b6a',
  river: '#7f9ca4',
  dusk: '#85779d',
  rose: '#b57976',
} as const;

const PRINCIPLES = [
  'The brand must feel like an exhale before it explains anything.',
  'The glass must feel held, not decorated.',
  'Every layer must remove cognitive noise, not add it.',
  'The system must read as one organism across mind, body, and soul.',
] as const;

const CHAMBERS: Chamber[] = [
  {
    id: 'essence',
    label: 'essence',
    number: '01',
    eyebrow: 'who we are',
    title: 'The system must feel like home before it feels like software.',
    thesis: 'This chamber holds the emotional contract of RecoveryOS: sanctuary, authority, compassion, quiet gravity, and the biological reaction we want before a single feature is understood.',
    feeling: 'An exhale. Relief. Recognition. Quiet certainty.',
    governs: [
      'brand essence, archetype, and emotional promise',
      'what a human should feel, know, do, and say in the first ten seconds',
      'the internal standard for whether a surface feels like Recoverlution at all',
    ],
    currentInputs: [
      'RECOVERY OS: THE BRAND IDENTITY',
      'THE LIVING SANCTUARY',
      'Feature Set philosophy sections for Universal Interface, Journeys, NaviCues, and Insights',
    ],
    asks: [
      'If all the copy disappeared, would the room still feel compassionate and sovereign?',
      'What must someone feel in their body before they understand what this is?',
      'What would Steve Jobs cut because it explains instead of proves?',
      'What part of this chamber would still be unmistakable over someone’s shoulder?',
    ],
    downstream: [
      'every route, every motion choice, every voice line, every object law',
      'company-first launch identity before modality or feature explanation',
    ],
    specimen: {
      lead: 'the first reaction',
      headline: 'I am finally understood.',
      body: 'Not because the interface told me. Because the environment carried itself with calm intelligence, restraint, and grace.',
    },
    palette: {
      glowA: 'rgba(182, 111, 73, 0.30)',
      glowB: 'rgba(109, 139, 106, 0.18)',
      line: 'rgba(244, 236, 223, 0.10)',
      accent: SANCTUARY.amber,
    },
  },
  {
    id: 'field',
    label: 'field',
    number: '02',
    eyebrow: 'the room itself',
    title: 'The background is not wallpaper. It is the emotional weather of the organism.',
    thesis: 'The field chamber governs darkness, off-white, silence, depth, warmth, and how the environment holds the human before objects arrive. This is where we stop looking like a spaceship.',
    feeling: 'Held. Warm-dark. Spacious. Present.',
    governs: [
      'root darkness, paper tones, line restraint, and spatial silence',
      'how black becomes sanctuary instead of sci-fi void',
      'the difference between atmosphere and decoration',
    ],
    currentInputs: [
      'primitives/colors.json',
      'semantic/global/surface.json',
      'semantic/global/text.json',
      'runtime heat and chrono overlays as system evidence, not visual authority',
    ],
    asks: [
      'Does the darkness calm the nervous system, or perform for the designer?',
      'What makes the room feel human instead of cinematic-tech?',
      'Where should silence do the work instead of surface treatment?',
      'What is the minimum visible chrome required to still feel held?',
    ],
    downstream: [
      'site backgrounds, player shell roots, console fields, core atmosphere baselines',
    ],
    specimen: {
      lead: 'the first material',
      headline: 'Sanctuary black. Bone-light text. Warm residual light.',
      body: 'No stark whites. No neon cyan bias. The field should feel like dusk in a quiet room, not a control deck.',
    },
    palette: {
      glowA: 'rgba(182, 111, 73, 0.20)',
      glowB: 'rgba(133, 119, 157, 0.14)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.rose,
    },
  },
  {
    id: 'atmosphere',
    label: 'atmosphere',
    number: '03',
    eyebrow: 'living weather',
    title: 'Atmosphere should behave like a nervous system, not a theme picker.',
    thesis: 'This chamber is the living weather layer: signature palettes, engines, response profiles, and the way the environment changes across heat, chrono, and meaning without fragmenting the brand.',
    feeling: 'Adaptive. Alive. Listening.',
    governs: [
      '8 signature palettes, 6 visual engines, 4 response profiles',
      'how mornings, work, social, and night subtly shift the room',
      'how field behavior changes without becoming another product skin',
    ],
    currentInputs: [
      'Layer 2 Living Atmosphere in navicue-composition.ts',
      'SIGNATURE_PALETTES in dc-tokens.ts',
      '/surfaces workspace as current evidence',
    ],
    asks: [
      'Is atmosphere environmental or merely decorative?',
      'Can a human feel the room shift before they consciously notice color?',
      'Do the signatures feel like one family or unrelated moods?',
      'What does algorithmic empathy look like in the background alone?',
    ],
    downstream: [
      'all surfaces that need to breathe with state, context, and transition',
    ],
    specimen: {
      lead: 'the room listens',
      headline: 'Warm earth at dawn. Quiet river at work. Moss at regulation. Ember at truth.',
      body: 'Atmosphere is allowed to move, but never to shout. It should respond like weather through a window.',
    },
    palette: {
      glowA: 'rgba(127, 156, 164, 0.24)',
      glowB: 'rgba(109, 139, 106, 0.18)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.river,
    },
  },
  {
    id: 'breath',
    label: 'breath',
    number: '04',
    eyebrow: 'time and motion',
    title: 'Nothing should animate faster than trust can form.',
    thesis: 'This chamber governs breath patterns, motion curves, entry, release, and temporal cadence. The brand must breathe at human pace, not at dashboard pace.',
    feeling: 'Settling. Morphing. Receding.',
    governs: [
      'breath cadence, motion curves, entry and exit timing',
      'how the room settles, shifts, resolves, and disappears',
      'reduced-motion posture without losing the organism’s intelligence',
    ],
    currentInputs: [
      'Layer 3 Pulse & Motion and Layer 5 Temporal Bookends in navicue-composition.ts',
      'semantic/global/motion.json',
      'MotionLab and MotionBreath as existing reference spaces',
    ],
    asks: [
      'Does the room breathe or does it animate?',
      'Where should time stretch, and where should it release instantly?',
      'Can the motion be felt with sound off and haptics absent?',
      'What should disappear the instant touch begins so cognition can rest?',
    ],
    downstream: [
      'brand transitions, entry choreography, semantic-pill collapse, proof recede, all surface morphing',
    ],
    specimen: {
      lead: 'the temporal law',
      headline: 'Morph. Settle. Recede.',
      body: 'Never snap. Never flash. Every arrival and departure should feel biologically respectful.',
    },
    palette: {
      glowA: 'rgba(204, 154, 100, 0.26)',
      glowB: 'rgba(244, 236, 223, 0.10)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.amber,
    },
  },
  {
    id: 'voice',
    label: 'voice',
    number: '05',
    eyebrow: 'the guide',
    title: 'Voice is posture before it is copy.',
    thesis: 'This chamber governs the way the system speaks, appears, and dissolves. It carries the lexicon, lane posture, cadence, and materialization of language on the glass.',
    feeling: 'Definitive. Restrained. Caring.',
    governs: [
      'voice lanes, tone, cadence, and grammar pressure',
      'materialization rules for how text arrives and disappears',
      'owned and banned words, and the gap between poetry and vagueness',
    ],
    currentInputs: [
      'Layer 4 Persona and Layer 7 Atomic Voice in navicue-composition.ts',
      '/voice workspace and atomic voice libraries',
      'brand lexicon and authority documents',
    ],
    asks: [
      'Does this sound like a master guide or a coaching product?',
      'Where should language become almost silent because the room already says enough?',
      'What words create gravity, and which ones cheapen the system instantly?',
      'What line would make someone say “it feels like it knows me”?',
    ],
    downstream: [
      'narrative canopy, semantic pill, route copy, in-product guidance, launch headlines',
    ],
    specimen: {
      lead: 'the voice test',
      headline: 'Short. Declarative. Absolute.',
      body: 'State the truth. Let it resonate. Never perform reassurance. Never explain what the room already proves.',
    },
    palette: {
      glowA: 'rgba(182, 111, 73, 0.24)',
      glowB: 'rgba(204, 154, 100, 0.14)',
      line: 'rgba(244, 236, 223, 0.09)',
      accent: SANCTUARY.ember,
    },
  },
  {
    id: 'glass',
    label: 'glass',
    number: '06',
    eyebrow: 'the permanent shell',
    title: 'The glass is the brand’s body.',
    thesis: 'This chamber governs the permanent shell language: surface, anchor, stream, zones, hold mechanics, and the non-negotiables of the universal interface.',
    feeling: 'Unbroken. Tactile. Singular.',
    governs: [
      'surface, anchor, stream, zones, and shell continuity',
      'what is permanent on the glass and what must disappear',
      'how the UI stays one organism across all payloads',
    ],
    currentInputs: [
      'Universal Interface philosophy in Feature Set',
      'universal-player.ts shell contracts',
      'home-shell.ts and player shell prototypes as evidence only',
    ],
    asks: [
      'What must remain on the glass no matter which modality loads?',
      'Would this still be ours if you only saw the bottom third of the device?',
      'What does the shell remove so the intervention can land?',
      'What would Apple insist become simpler here?',
    ],
    downstream: [
      'Companion, modal transitions, shell signatures, all player-grade surfaces',
    ],
    specimen: {
      lead: 'the permanent grammar',
      headline: 'Surface. Anchor. Stream.',
      body: 'One breathing piece of glass. Not menus. Not tabs. Not a SaaS chrome stack.',
    },
    palette: {
      glowA: 'rgba(127, 156, 164, 0.16)',
      glowB: 'rgba(244, 236, 223, 0.10)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.river,
    },
  },
  {
    id: 'canopy',
    label: 'canopy',
    number: '07',
    eyebrow: 'the threshold of thought',
    title: 'The canopy should guide the mind and then get out of the way.',
    thesis: 'This chamber governs the narrative canopy, breathing HUD, semantic pill, and the protection of cognitive load before touch begins.',
    feeling: 'Named. Protected. Released.',
    governs: [
      'entry copy, closure copy, HUD modes, semantic-pill behavior',
      'how the system frames a moment before the body takes over',
      'how intellect yields to action without abruptness',
    ],
    currentInputs: [
      'NarrativeCanopyContract in universal-player.ts',
      'breathing-hud spec and canopy copy patterns',
      'Voice and motion families as inputs',
    ],
    asks: [
      'What must be said before touch, and what must disappear at touch?',
      'How much narrative is enough to orient without loading the prefrontal cortex?',
      'Can the canopy feel intelligent without becoming instructional clutter?',
      'What is the quietest possible semantic pill that still preserves meaning?',
    ],
    downstream: [
      'all intervention entry states, hero narration, overlay copy, HUD collapse laws',
    ],
    specimen: {
      lead: 'story before action',
      headline: 'The text names the weather. Then it dissolves.',
      body: 'The canopy exists to tune the mind, not to occupy the room once the hand engages.',
    },
    palette: {
      glowA: 'rgba(133, 119, 157, 0.20)',
      glowB: 'rgba(182, 111, 73, 0.12)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.dusk,
    },
  },
  {
    id: 'proof',
    label: 'proof',
    number: '08',
    eyebrow: 'evidence and recede',
    title: 'Proof should feel earned, quiet, and structurally undeniable.',
    thesis: 'This chamber governs micro-receipts, resolution, signal emission, and how the system seals change without turning proof into applause.',
    feeling: 'Credibility. Calm. New default.',
    governs: [
      'proof objects, receipt language, success signals, and recede behavior',
      'how change becomes identity without gamification',
      'how one action travels across companion, clinician, and organization',
    ],
    currentInputs: [
      'ProofContract in universal-player.ts',
      'Signal / micro-receipt doctrine in the brand documents',
      'runtime proof and signal surfaces as current evidence',
    ],
    asks: [
      'What is the quietest possible way to let someone know change held?',
      'Does proof feel biological and structural, or like software reward design?',
      'Where should proof remain visible, and where should it recede immediately?',
      'How does one receipt mean three different things without changing shape?',
    ],
    downstream: [
      'Signal, altitudes, proof surfaces, receipt language, identity reinforcement',
    ],
    specimen: {
      lead: 'the new default',
      headline: 'Belief is fragile. Proof is not.',
      body: 'The system does not celebrate for the human. It simply lets reality become undeniable.',
    },
    palette: {
      glowA: 'rgba(109, 139, 106, 0.22)',
      glowB: 'rgba(204, 154, 100, 0.12)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.moss,
    },
  },
  {
    id: 'atoms',
    label: 'atoms',
    number: '09',
    eyebrow: 'the physics vocabulary',
    title: 'Atoms are not a gallery. They are the tactile language of the organism.',
    thesis: 'This chamber governs the interactive physics vocabulary across the atom registry, so each atom feels like a sentence spoken by the same body rather than a collection of clever effects.',
    feeling: 'Physical. Intelligent. Coherent.',
    governs: [
      'physics families, haptic signatures, default scales, and state ranges',
      'how 700 atoms across 70 series still feel like one tactile language',
      'which atom qualities become brand signatures versus local interventions',
    ],
    currentInputs: [
      'atom-registry.ts and 70 series registries',
      '/atoms library and showcase routes',
      'Feature Set articulation of the physics of feeling',
    ],
    asks: [
      'What tactile qualities belong to Recoverlution even before the atom is identified?',
      'Which atoms feel like awe, and which feel like novelty?',
      'What is the recurring physical grammar across series, not just per series?',
      'What would happen if you removed haptics, motion, or atmosphere from the atom?',
    ],
    downstream: [
      'NaviCues, embedded Insight anchors, Journey interventions, brand signatures',
    ],
    specimen: {
      lead: 'the grammar of touch',
      headline: 'Seven hundred instruments. One body.',
      body: 'The registry is only useful if the hand can still feel one parent organism underneath every variation.',
    },
    palette: {
      glowA: 'rgba(182, 111, 73, 0.20)',
      glowB: 'rgba(127, 156, 164, 0.16)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.ember,
    },
  },
  {
    id: 'modalities',
    label: 'modalities',
    number: '10',
    eyebrow: 'the payloads',
    title: 'Every modality should feel like a different room in the same home.',
    thesis: 'This chamber governs how NaviCue, Journey, Insight, Studio, Play, Talk, Navigate, and Signal manifest differently without becoming separate products with separate brand languages.',
    feeling: 'Varied. Connected. Continuous.',
    governs: [
      'modality-specific expression inside one shared organism',
      'what is allowed to change between formats and what must remain fixed',
      'how the shell, field, voice, and proof spine travel across payload classes',
    ],
    currentInputs: [
      'RecoverlutionFormat and SceneModel in universal-player.ts',
      'Feature Set modality doctrines',
      'player and marketing reference surfaces',
    ],
    asks: [
      'Does this modality feel like a new room or a new company?',
      'Which modality is the clearest first proof of the whole system?',
      'What remains permanent when the format changes completely?',
      'Where should the room widen, and where should the organism tighten?',
    ],
    downstream: [
      'format-specific surface laws, launch narrative order, cross-modality continuity',
    ],
    specimen: {
      lead: 'one organism, many rooms',
      headline: 'The glass morphs. The identity does not.',
      body: 'A Journey and a NaviCue should feel different in purpose, not unrelated in soul.',
    },
    palette: {
      glowA: 'rgba(133, 119, 157, 0.18)',
      glowB: 'rgba(109, 139, 106, 0.16)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.dusk,
    },
  },
  {
    id: 'altitudes',
    label: 'altitudes',
    number: '11',
    eyebrow: 'one spine, three vantage points',
    title: 'Companion, Console, and Core should refract one truth at different heights.',
    thesis: 'This chamber governs the visual and emotional translation of the same operating truth across the person, the professional, and the organization.',
    feeling: 'Continuous. Trustworthy. Scaled.',
    governs: [
      'what changes between person, professional, and organizational altitudes',
      'how proof, support, and clarity scale without becoming colder',
      'how the same receipt keeps meaning across all three contexts',
    ],
    currentInputs: [
      'Three Altitudes doctrine in the brand and feature documents',
      '/design-center/altitudes and runtime altitude scaffolds',
      'proof spine and shell language as shared inputs',
    ],
    asks: [
      'What should remain emotionally human even at the organization altitude?',
      'How do we keep Console and Core from collapsing into enterprise software?',
      'Where does Companion stay sanctuary while the others become maps?',
      'What is the single visual law that proves these three belong together?',
    ],
    downstream: [
      'Companion shell, Console cartography, Core proof systems, product marketing hierarchy',
    ],
    specimen: {
      lead: 'the same moment traveling upward',
      headline: 'One receipt. Three meanings.',
      body: 'Identity reinforcement for the person. Clinical coherence for the practitioner. Defensible continuity for the organization.',
    },
    palette: {
      glowA: 'rgba(109, 139, 106, 0.18)',
      glowB: 'rgba(127, 156, 164, 0.14)',
      line: 'rgba(244, 236, 223, 0.08)',
      accent: SANCTUARY.moss,
    },
  },
  {
    id: 'interrogation',
    label: 'interrogation',
    number: '12',
    eyebrow: 'the apple-grade pressure',
    title: 'This chamber asks the questions that keep the organism honest.',
    thesis: 'This is the design and brand interrogation room. It forces the system to answer essence, not just composition, before anything is allowed to feel finished.',
    feeling: 'Sharp. Honest. Unsentimental.',
    governs: [
      'the recurring launch questions, doctrine checks, and ruthless cuts',
      'the difference between polished UI and true arrival',
      'what gets removed when elegance and truth diverge',
    ],
    currentInputs: [
      'founder question pattern across launch, brand, magic, authority, and arrival',
      'Apple-grade coherence doctrine line',
      'design-side challenge prompts gathered through this thread',
    ],
    asks: [
      'What do we want people to know, love, feel, say, express, and do?',
      'What is the one unmistakable signature over someone’s shoulder?',
      'What feels like software instead of sanctuary, and should be cut?',
      'If this were already the defining company in the category, what would never have shipped?',
      'What does the brand become when it has already arrived?',
    ],
    downstream: [
      'launch reviews, token doctrine, surface law, copy critique, product marketing judgment',
    ],
    specimen: {
      lead: 'the operating pressure',
      headline: 'Apple-grade coherence, but for mind, body, and soul.',
      body: 'Internal mantra only. Publicly, the bar stays simpler: one company, one calm intelligence, one unmistakable surface.',
    },
    palette: {
      glowA: 'rgba(204, 154, 100, 0.20)',
      glowB: 'rgba(182, 111, 73, 0.12)',
      line: 'rgba(244, 236, 223, 0.10)',
      accent: SANCTUARY.amber,
    },
  },
];

function SanctuaryAtmosphere() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        animate={{ x: [0, 24, -16, 0], y: [0, -14, 10, 0], scale: [1, 1.06, 0.98, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 80,
          right: -80,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${'rgba(182, 111, 73, 0.22)'} 0%, transparent 70%)`,
          filter: 'blur(28px)',
        }}
      />
      <motion.div
        animate={{ x: [0, -18, 14, 0], y: [0, 20, -10, 0], scale: [1, 0.96, 1.03, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 80,
          left: -120,
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${'rgba(109, 139, 106, 0.18)'} 0%, transparent 70%)`,
          filter: 'blur(34px)',
        }}
      />
      <motion.div
        animate={{ opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: '0 0 auto',
          height: 520,
          background: `linear-gradient(180deg, ${'rgba(133, 119, 157, 0.12)'} 0%, transparent 72%)`,
          filter: 'blur(24px)',
        }}
      />
    </div>
  );
}

function HeroRule({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: SANCTUARY.hush,
        }}
      >
        law {index}
      </div>
      <div
        style={{
          fontFamily: fonts.primary,
          fontSize: 'clamp(16px, 2.1vw, 18px)',
          lineHeight: 1.72,
          color: SANCTUARY.mist,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ChamberRail({
  activeId,
  onSelect,
}: {
  activeId: ChamberId;
  onSelect: (id: ChamberId) => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
      }}
    >
      {CHAMBERS.map((chamber) => {
        const active = chamber.id === activeId;
        return (
          <button
            key={chamber.id}
            onClick={() => onSelect(chamber.id)}
            style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              padding: 0,
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: '34px 1fr',
              gap: 12,
              alignItems: 'start',
              color: active ? SANCTUARY.paper : SANCTUARY.hush,
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: active ? chamber.palette.accent : SANCTUARY.hush,
                paddingTop: 2,
              }}
            >
              {chamber.number}
            </div>
            <div
              style={{
                display: 'grid',
                gap: 5,
                paddingLeft: 14,
                borderLeft: `1px solid ${active ? chamber.palette.line : 'rgba(244, 236, 223, 0.05)'}`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: 16,
                  lineHeight: 1.3,
                  color: active ? SANCTUARY.paper : SANCTUARY.mist,
                }}
              >
                {chamber.label}
              </div>
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: SANCTUARY.hush,
                  maxWidth: 190,
                }}
              >
                {chamber.eyebrow}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MobileChamberStream({
  activeId,
  onSelect,
}: {
  activeId: ChamberId;
  onSelect: (id: ChamberId) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        overflowX: 'auto',
        paddingBottom: 8,
        scrollbarWidth: 'none',
      }}
    >
      {CHAMBERS.map((chamber) => {
        const active = chamber.id === activeId;
        return (
          <button
            key={chamber.id}
            onClick={() => onSelect(chamber.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'grid',
              gap: 6,
              minWidth: 118,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: active ? chamber.palette.accent : SANCTUARY.hush,
              }}
            >
              {chamber.number}
            </div>
            <div
              style={{
                fontFamily: fonts.primary,
                fontSize: 15,
                lineHeight: 1.3,
                color: active ? SANCTUARY.paper : SANCTUARY.mist,
              }}
            >
              {chamber.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DetailList({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: accent,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              display: 'grid',
              gridTemplateColumns: '10px 1fr',
              gap: 12,
              alignItems: 'start',
            }}
          >
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                marginTop: 10,
                background: accent,
                boxShadow: `0 0 18px ${accent}`,
              }}
            />
            <div
              style={{
                fontFamily: fonts.primary,
                fontSize: 'clamp(15px, 2vw, 17px)',
                lineHeight: 1.72,
                color: SANCTUARY.mist,
              }}
            >
              {item}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChamberStage({ chamber }: { chamber: Chamber }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chamber.id}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'grid', gap: 28 }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 36,
            minHeight: 420,
            padding: 'clamp(28px, 5vw, 48px)',
            background: `linear-gradient(180deg, rgba(15, 11, 9, 0.96) 0%, rgba(11, 8, 7, 0.9) 100%)`,
            border: `1px solid ${chamber.palette.line}`,
            boxShadow: '0 34px 120px rgba(0, 0, 0, 0.34)',
          }}
        >
          <motion.div
            animate={{ x: [0, 22, -10, 0], y: [0, -16, 10, 0], scale: [1, 1.05, 0.98, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: -40,
              right: -60,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${chamber.palette.glowA} 0%, transparent 72%)`,
              filter: 'blur(12px)',
            }}
          />
          <motion.div
            animate={{ x: [0, -18, 14, 0], y: [0, 16, -8, 0], scale: [1, 0.98, 1.04, 1] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              bottom: -60,
              left: -20,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${chamber.palette.glowB} 0%, transparent 72%)`,
              filter: 'blur(16px)',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 24 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: chamber.palette.accent,
                }}
              >
                {chamber.number} · {chamber.eyebrow}
              </div>
              <div
                style={{
                  fontFamily: fonts.secondary,
                  fontSize: 'clamp(42px, 6vw, 78px)',
                  lineHeight: 0.98,
                  letterSpacing: '-0.04em',
                  color: SANCTUARY.paper,
                  maxWidth: 900,
                }}
              >
                {chamber.title}
              </div>
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: 'clamp(18px, 2.6vw, 22px)',
                  lineHeight: 1.74,
                  color: SANCTUARY.mist,
                  maxWidth: 760,
                }}
              >
                {chamber.thesis}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 18,
                paddingTop: 12,
                borderTop: `1px solid ${chamber.palette.line}`,
              }}
            >
              <div style={{ display: 'grid', gap: 8 }}>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: chamber.palette.accent,
                  }}
                >
                  emotional target
                </div>
                <div
                  style={{
                    fontFamily: fonts.primary,
                    fontSize: 'clamp(16px, 2vw, 18px)',
                    lineHeight: 1.72,
                    color: SANCTUARY.mist,
                  }}
                >
                  {chamber.feeling}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: chamber.palette.accent,
                  }}
                >
                  specimen
                </div>
                <div
                  style={{
                    fontFamily: fonts.primary,
                    fontSize: 'clamp(16px, 2vw, 18px)',
                    lineHeight: 1.72,
                    color: SANCTUARY.mist,
                  }}
                >
                  {chamber.specimen.lead}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 12,
                paddingTop: 18,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.secondary,
                  fontSize: 'clamp(30px, 4vw, 44px)',
                  lineHeight: 1.02,
                  letterSpacing: '-0.03em',
                  color: SANCTUARY.paper,
                  maxWidth: 700,
                }}
              >
                {chamber.specimen.headline}
              </div>
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: 'clamp(17px, 2.2vw, 19px)',
                  lineHeight: 1.76,
                  color: SANCTUARY.mist,
                  maxWidth: 700,
                }}
              >
                {chamber.specimen.body}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          <DetailList title="governs" items={chamber.governs} accent={chamber.palette.accent} />
          <DetailList title="current inputs" items={chamber.currentInputs} accent={chamber.palette.accent} />
          <DetailList title="asks" items={chamber.asks} accent={chamber.palette.accent} />
          <DetailList title="downstream" items={chamber.downstream} accent={chamber.palette.accent} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SanctuaryLab() {
  const [activeChamber, setActiveChamber] = useState<ChamberId>('essence');
  const chamber = CHAMBERS.find((item) => item.id === activeChamber) ?? CHAMBERS[0];

  return (
    <LabShell eyebrow="living sanctuary" headline="" showHeader={false} showDevice={false}>
      <div
        style={{
          position: 'relative',
          isolation: 'isolate',
          minHeight: '100%',
          color: SANCTUARY.paper,
        }}
      >
        <SanctuaryAtmosphere />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 48 }}>
          <section
            style={{
              display: 'grid',
              gap: 26,
              paddingBottom: 18,
              borderBottom: `1px solid ${SANCTUARY.line}`,
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: SANCTUARY.hush,
              }}
            >
              living sanctuary · essence-first environment
            </div>

            <div
              style={{
                display: 'grid',
                gap: 14,
                maxWidth: 980,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.secondary,
                  fontSize: 'clamp(46px, 7vw, 88px)',
                  lineHeight: 0.96,
                  letterSpacing: '-0.05em',
                  color: SANCTUARY.paper,
                }}
              >
                Build the environment.
                <br />
                Let the system follow.
              </div>
              <div
                style={{
                  fontFamily: fonts.primary,
                  fontSize: 'clamp(19px, 2.8vw, 24px)',
                  lineHeight: 1.76,
                  color: SANCTUARY.mist,
                  maxWidth: 820,
                }}
              >
                This route does not inherit the old system page. It starts from essence,
                brand, sanctuary, and biological reality. Each chamber below gives one
                variable family its own room before any downstream design decision is made.
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 22,
                paddingTop: 10,
              }}
            >
              {PRINCIPLES.map((principle, index) => (
                <HeroRule key={principle} index={index + 1}>
                  {principle}
                </HeroRule>
              ))}
            </div>
          </section>

          <section
            style={{
              display: 'grid',
              gap: 24,
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: 18,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: SANCTUARY.hush,
                }}
              >
                chamber stream
              </div>
              <div className="sanctuary-mobile-stream">
                <MobileChamberStream activeId={activeChamber} onSelect={setActiveChamber} />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '260px minmax(0, 1fr)',
                gap: 36,
                alignItems: 'start',
              }}
              className="sanctuary-layout"
            >
              <aside className="sanctuary-desktop-rail">
                <div
                  style={{
                    position: 'sticky',
                    top: 92,
                    display: 'grid',
                    gap: 22,
                  }}
                >
                  <div
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: SANCTUARY.hush,
                    }}
                  >
                    dedicated chambers
                  </div>
                  <ChamberRail activeId={activeChamber} onSelect={setActiveChamber} />
                </div>
              </aside>

              <main>
                <ChamberStage chamber={chamber} />
              </main>
            </div>
          </section>
        </div>

        <style>{`
          .sanctuary-mobile-stream {
            display: none;
          }

          @media (max-width: 900px) {
            .sanctuary-layout {
              grid-template-columns: 1fr !important;
            }

            .sanctuary-desktop-rail {
              display: none;
            }

            .sanctuary-mobile-stream {
              display: block;
            }
          }
        `}</style>
      </div>
    </LabShell>
  );
}
