import { motion, AnimatePresence } from 'motion/react';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import { ChevronLeft, ChevronRight, Search, X, LayoutList } from 'lucide-react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NaviCueMasterRenderer } from '@/app/components/navicue/NaviCueMasterRenderer';
import { ACT_GROUPS, getActForIndex, type ActGroup } from '@/app/data/lab-act-groups';
import { NaviCueLabProvider } from '@/app/components/navicue/NaviCueLabContext';

interface LabViewerProps {
  mounted: boolean;
  previewMode: 'mobile' | 'desktop';
}

/**
 * LAB VIEWER
 *
 * Isolated playground for the 1380 NaviCues (1000 First Millennium + 200 Second Millennium + 180 Third Millennium).
 * 1000 specimens across 95 narrative acts + Foundation + 95 Series:
 * Foundation(5) | I(4) | II(4) | III(2) | IV(3) | V(2) | VI(3) | VII(3) | VIII(2) | IX(2) | X(5) | XI(5) | XII(5) | XIII(5)
 * | Act0-Novice(10) | Act1-Alchemist(10) | Act2-Architect(10) | Act3-Navigator(10) | Act4-Sage(10) | Act5-Mender(10) | Act6-Diplomat(10) | Act7-Weaver(10) | Act8-Visionary(10) | Act9-Luminary(10) | Act10-Hacker(10) | Act11-Chrononaut(10) | Act12-Mycelium(10) | Act13-Aesthete(10) | Act14-Elemental(10) | Act15-Phenomenologist(10) | Act16-AlchemistII(10) | Act17-ServantLeader(10) | Act18-OmegaPoint(10) | Act19-Source(10) | Act20-Stoic(10) | Act21-Lover(10) | Act22-Athlete(10) | Act23-Strategist(10) | Act24-Wilding(10) | Act25-Guardian(10) | Act26-Futurist(10)
 * | Act27-Mystic(10) | Act28-InfinitePlayer(10) | Act29-RealityBender(10) | Act30-Magnet(10) | Act31-Oracle(10) | Act32-Maestro(10) | Act33-Shaman(10) | Act34-Stargazer(10)
 * | Act35-MythMaker(10) | Act36-ShapeShifter(10) | Act37-DreamWalker(10) | Act38-MagnumOpus(10)
 * | Act39-Prism(10) | Act40-Graviton(10) | Act41-Observer(10)
 * | Act42-TimeCapsule(10) | Act43-LoopBreaker(10) | Act44-RetroCausal(10)
 * | Act45-Threshold(10) | Act46-Soma(10) | Act47-Frequency(10)
 * | Act48-Tuner(10) | Act49-Broadcast(10)
 * | Act50-Schrödinger(10) | Act51-Glitch(10)
 * | Act52-Construct(10) | Act53-Biographer(10)
 * | Act54-Optician(10) | Act55-Interpreter(10)
 * | Act56-SocialPhysics(10) | Act57-Tribalist(10)
 * | Act58-Valuator(10) | Act59-Editor(10)
 * | Act60-Grandmaster(10) | Act61-Catalyst(10)
 * | Act62-Kinetic(10) | Act63-Adaptive(10)
 * | Act64-ShadowWorker(10) | Act65-Ancestor(10)
 * | Act66-Trickster(10) | Act67-Astronaut(10)
 * | Act68-Wonderer(10) | Act69-Surfer(10)
 * | Act70-Meaning(10) | Act71-Servant(10)
 * | Act72-Synthesis(10) | Act73-FutureWeaver(10)
 * | Act74-Composer(10) | Act75-Zenith(10)
 * | Act76-Multiverse(10) | Act77-Ethicist(10)
 * | Act78-Elementalist(10) | Act79-Mentat(10)
 * | Act80-Intuition(10)    | Act81-Engineer(10)
 * | Act82-AlchemistIV(10)  | Act83-Cognitive(10)
 * | Act84-Sage(10)         | Act85-Gaia(10)
 * | Act86-Mystic(10)       | Act87-Ascendant(10)
 * | Act88-GardenerII(10)   | Act89-AncestorII(10)
 * | Act90-MagnumOpus(10)  | Act91-InfinitePlayer(10)
 * | Act92-ZeroPoint(10)   | Act93-Omega(10)
 * | Act94-Ouroboros(10)
 * | Act95-Projector(10)   | Act96-Chronomancer(10)
 * | Act97-Materialist(10)
 */

// ── The 1380 Lab Specimens ──────────────────────────────────────
// Minimal mock data objects with the fields MasterRenderer needs
// to route to the correct bespoke component.
const LAB_NAVICUES = [
  // ═══════════════════════════════════════════════════════════════
  // THE ORIGINAL 5 — Foundation Exemplars
  // ═══════════════════════════════════════════════════════════════
  {
    navicue_type_id: 'lab__mirror__metacognition__believing',
    navicue_type_name: 'The Witness',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'believing',
    magic_signature: 'witness_ritual',
    container_type: 'reflective',
    primary_prompt: null,
    cta_primary: null,
    _lab_title: 'The Witness',
    _lab_subtitle: 'Mirror \u00d7 Metacognition \u00d7 Believing',
    _lab_signature: 'witness_ritual',
  },
  {
    navicue_type_id: 'lab__probe__exposure__embodying',
    navicue_type_name: 'The Approach',
    form: 'Probe',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'embodying',
    magic_signature: 'sensory_cinema',
    container_type: 'depth',
    primary_prompt: null,
    cta_primary: null,
    _lab_title: 'The Approach',
    _lab_subtitle: 'Probe \u00d7 Exposure \u00d7 Embodying',
    _lab_signature: 'sensory_cinema',
  },
  {
    navicue_type_id: 'lab__practice__selfcompassion__believing',
    navicue_type_name: 'The Softening',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'sacred_ordinary',
    container_type: 'action',
    primary_prompt: null,
    cta_primary: null,
    _lab_title: 'The Softening',
    _lab_subtitle: 'Practice \u00d7 Self-Compassion \u00d7 Believing',
    _lab_signature: 'sacred_ordinary',
  },
  {
    navicue_type_id: 'lab__key__valuesclarification__embodying',
    navicue_type_name: 'The Paradox',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'embodying',
    magic_signature: 'koan_paradox',
    container_type: 'directional',
    primary_prompt: null,
    cta_primary: null,
    _lab_title: 'The Paradox',
    _lab_subtitle: 'Key \u00d7 Values Clarification \u00d7 Embodying',
    _lab_signature: 'koan_paradox',
  },
  {
    navicue_type_id: 'lab__inventoryspark__behavioralactivation__believing',
    navicue_type_name: 'The Crack',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'pattern_glitch',
    container_type: 'signal',
    primary_prompt: null,
    cta_primary: null,
    _lab_title: 'The Crack',
    _lab_subtitle: 'Inventory Spark \u00d7 Behavioral Activation \u00d7 Believing',
    _lab_signature: 'pattern_glitch',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT I — Deepening Observation (Metacognition family)
  // ═══════════════════════════════════════════════════════════════
  {
    // #6 — The Echo
    navicue_type_id: 'lab__partsrollcall__metacognition__believing',
    navicue_type_name: 'The Echo',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'believing',
    magic_signature: 'inner_chorus',
    container_type: 'reflective',
    primary_prompt: 'Which voice is speaking right now?',
    cta_primary: 'I hear it',
    _lab_title: 'The Echo',
    _lab_subtitle: 'Parts Rollcall \u00d7 Metacognition \u00d7 Believing',
    _lab_signature: 'inner_chorus',
  },
  {
    // #7 — The Notation
    navicue_type_id: 'lab__practice__metacognition__embodying',
    navicue_type_name: 'The Notation',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'embodying',
    magic_signature: 'thought_inscription',
    container_type: 'action',
    primary_prompt: 'Catch the thought before it lands.',
    cta_primary: 'Caught',
    _lab_title: 'The Notation',
    _lab_subtitle: 'Practice \u00d7 Metacognition \u00d7 Embodying',
    _lab_signature: 'thought_inscription',
  },
  {
    // #8 — The Splice
    navicue_type_id: 'lab__inventoryspark__metacognition__embodying',
    navicue_type_name: 'The Splice',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'embodying',
    magic_signature: 'thought_splice',
    container_type: 'signal',
    primary_prompt: 'There, in the gap between thoughts.',
    cta_primary: 'I see it',
    _lab_title: 'The Splice',
    _lab_subtitle: 'Inventory Spark \u00d7 Metacognition \u00d7 Embodying',
    _lab_signature: 'thought_splice',
  },
  {
    // #9 — The Lens
    navicue_type_id: 'lab__key__metacognition__embodying',
    navicue_type_name: 'The Lens',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'embodying',
    magic_signature: 'perception_shift',
    container_type: 'directional',
    primary_prompt: 'This is how you see it. Here is another way.',
    cta_primary: 'Shift',
    _lab_title: 'The Lens',
    _lab_subtitle: 'Key \u00d7 Metacognition \u00d7 Embodying',
    _lab_signature: 'perception_shift',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT II — Entering the Body (Exposure + Behavioral Activation)
  // ═══════════════════════════════════════════════════════════════
  {
    // #10 — The Threshold
    navicue_type_id: 'lab__probe__behavioralactivation__embodying',
    navicue_type_name: 'The Threshold',
    form: 'Probe',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'embodying',
    magic_signature: 'edge_pulse',
    container_type: 'depth',
    primary_prompt: 'The edge is closer than you think.',
    cta_primary: 'One step',
    _lab_title: 'The Threshold',
    _lab_subtitle: 'Probe \u00d7 Behavioral Activation \u00d7 Embodying',
    _lab_signature: 'edge_pulse',
  },
  {
    // #11 — The Reality Anchor
    navicue_type_id: 'lab__practice__exposure__embodying',
    navicue_type_name: 'The Reality Anchor',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'embodying',
    magic_signature: 'body_script',
    container_type: 'action',
    primary_prompt: 'Find the floor. Find the light. You are here.',
    cta_primary: 'Begin',
    _lab_title: 'The Reality Anchor',
    _lab_subtitle: 'Practice \u00d7 Exposure \u00d7 Embodying',
    _lab_signature: 'body_script',
  },
  {
    // #12 — The Uninvited
    navicue_type_id: 'lab__partsrollcall__exposure__believing',
    navicue_type_name: 'The Uninvited',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'believing',
    magic_signature: 'shadow_welcome',
    container_type: 'reflective',
    primary_prompt: 'The part you\'ve been avoiding has arrived.',
    cta_primary: 'Let it in',
    _lab_title: 'The Uninvited',
    _lab_subtitle: 'Parts Rollcall \u00d7 Exposure \u00d7 Believing',
    _lab_signature: 'shadow_welcome',
  },
  {
    // #13 — The Dissolution
    navicue_type_id: 'lab__mirror__exposure__embodying',
    navicue_type_name: 'The Dissolution',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'embodying',
    magic_signature: 'mirror_dissolve',
    container_type: 'reflective',
    primary_prompt: 'What seemed solid becomes movement.',
    cta_primary: 'Stay with it',
    _lab_title: 'The Dissolution',
    _lab_subtitle: 'Mirror \u00d7 Exposure \u00d7 Embodying',
    _lab_signature: 'mirror_dissolve',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT III — The Tender Turn (Self-Compassion)
  // ═══════════════════════════════════════════════════════════════
  {
    // #14 — The Council
    navicue_type_id: 'lab__partsrollcall__selfcompassion__believing',
    navicue_type_name: 'The Council',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'parts_gathering',
    container_type: 'reflective',
    primary_prompt: 'Each part is welcome here.',
    cta_primary: 'Gather',
    _lab_title: 'The Council',
    _lab_subtitle: 'Parts Rollcall \u00d7 Self-Compassion \u00d7 Believing',
    _lab_signature: 'parts_gathering',
  },
  {
    // #15 — The Offering
    navicue_type_id: 'lab__inventoryspark__selfcompassion__embodying',
    navicue_type_name: 'The Offering',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'embodying',
    magic_signature: 'gentle_audit',
    container_type: 'signal',
    primary_prompt: 'Touch each one. No fixing. Just gentleness.',
    cta_primary: 'Acknowledge',
    _lab_title: 'The Offering',
    _lab_subtitle: 'Inventory Spark \u00d7 Self-Compassion \u00d7 Embodying',
    _lab_signature: 'gentle_audit',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT IV — The Choosing (Values + Behavioral Activation)
  // ═══════════════════════════════════════════════════════════════
  {
    // #16 — The Price
    navicue_type_id: 'lab__mirror__valuesclarification__embodying',
    navicue_type_name: 'The Price',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'embodying',
    magic_signature: 'mirror_trade',
    container_type: 'reflective',
    primary_prompt: 'What is this value costing you?',
    cta_primary: 'Honor it',
    _lab_title: 'The Price',
    _lab_subtitle: 'Mirror \u00d7 Values Clarification \u00d7 Embodying',
    _lab_signature: 'mirror_trade',
  },
  {
    // #17 — The Micro-Proof
    navicue_type_id: 'lab__key__behavioralactivation__believing',
    navicue_type_name: 'The Micro-Proof',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'pivot_point',
    container_type: 'directional',
    primary_prompt: 'You just chose differently. Don\u2019t let it pass uncounted.',
    cta_primary: 'Capture',
    _lab_title: 'The Micro-Proof',
    _lab_subtitle: 'Key \u00d7 Behavioral Activation \u00d7 Believing',
    _lab_signature: 'pivot_point',
  },
  {
    // #18 — The Permission
    navicue_type_id: 'lab__inventoryspark__valuesclarification__believing',
    navicue_type_name: 'The Permission',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'believing',
    magic_signature: 'quiet_license',
    container_type: 'signal',
    primary_prompt: 'Some of these "shoulds" aren\'t yours.',
    cta_primary: 'Release',
    _lab_title: 'The Permission',
    _lab_subtitle: 'Inventory Spark \u00d7 Values Clarification \u00d7 Believing',
    _lab_signature: 'quiet_license',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT V — The Identity Frontier (Identity Koans)
  // ═══════════════════════════════════════════════════════════════
  {
    // #19 — The Mask (Identity Koan — routes via exact typeId)
    navicue_type_id: 'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__exposure__b',
    navicue_type_name: 'The Mask',
    form: 'Identity Koan',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'believing',
    magic_signature: 'identity_exposure',
    container_type: 'reflective',
    primary_prompt: 'Who are you beneath the performance?',
    cta_primary: 'Look',
    _lab_title: 'The Mask',
    _lab_subtitle: 'Identity Koan \u00d7 Exposure \u00d7 Believing',
    _lab_signature: 'identity_exposure',
  },
  {
    // #20 — The Wound (Identity Koan — routes via exact typeId)
    navicue_type_id: 'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__self_compassion__e',
    navicue_type_name: 'The Wound',
    form: 'Identity Koan',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'embodying',
    magic_signature: 'tender_archaeology',
    container_type: 'reflective',
    primary_prompt: 'The part of you that still hurts is still you.',
    cta_primary: 'Sit with it',
    _lab_title: 'The Wound',
    _lab_subtitle: 'Identity Koan \u00d7 Self-Compassion \u00d7 Embodying',
    _lab_signature: 'tender_archaeology',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT VI — The Deepening (body meets truth)
  // ═══════════════════════════════════════════════════════════════
  {
    // #21 — The Undertow
    navicue_type_id: 'lab__probe__selfcompassion__believing',
    navicue_type_name: 'The Undertow',
    form: 'Probe',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'compassionate_depth',
    container_type: 'depth',
    primary_prompt: 'What if the bottom isn\u2019t empty?',
    cta_primary: 'Descend',
    _lab_title: 'The Undertow',
    _lab_subtitle: 'Probe \u00d7 Self-Compassion \u00d7 Believing',
    _lab_signature: 'compassionate_depth',
  },
  {
    // #22 — The Compass
    navicue_type_id: 'lab__practice__valuesclarification__embodying',
    navicue_type_name: 'The Compass',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'embodying',
    magic_signature: 'body_compass',
    container_type: 'action',
    primary_prompt: 'Your body voted before you did.',
    cta_primary: 'Lean',
    _lab_title: 'The Compass',
    _lab_subtitle: 'Practice \u00d7 Values Clarification \u00d7 Embodying',
    _lab_signature: 'body_compass',
  },
  {
    // #23 — The Audit
    navicue_type_id: 'lab__partsrollcall__valuesclarification__embodying',
    navicue_type_name: 'The Audit',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'embodying',
    magic_signature: 'values_census',
    container_type: 'reflective',
    primary_prompt: 'Not all the voices agree on what matters.',
    cta_primary: 'Listen',
    _lab_title: 'The Audit',
    _lab_subtitle: 'Parts Rollcall \u00d7 Values Clarification \u00d7 Embodying',
    _lab_signature: 'values_census',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT VII — The Moving (the body leads)
  // ═══════════════════════════════════════════════════════════════
  {
    // #24 — The Signal
    navicue_type_id: 'lab__mirror__behavioralactivation__embodying',
    navicue_type_name: 'The Signal',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'embodying',
    magic_signature: 'action_mirror',
    container_type: 'reflective',
    primary_prompt: 'The mirror shows what you do, not who you are.',
    cta_primary: 'Watch',
    _lab_title: 'The Signal',
    _lab_subtitle: 'Mirror \u00d7 Behavioral Activation \u00d7 Embodying',
    _lab_signature: 'action_mirror',
  },
  {
    // #25 — The Return
    navicue_type_id: 'lab__practice__behavioralactivation__embodying',
    navicue_type_name: 'The Return',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'embodying',
    magic_signature: 'micro_momentum',
    container_type: 'action',
    primary_prompt: 'The body doesn\u2019t wait for permission.',
    cta_primary: 'Move',
    _lab_title: 'The Return',
    _lab_subtitle: 'Practice \u00d7 Behavioral Activation \u00d7 Embodying',
    _lab_signature: 'micro_momentum',
  },
  {
    // #26 — The Tide
    navicue_type_id: 'lab__probe__valuesclarification__believing',
    navicue_type_name: 'The Tide',
    form: 'Probe',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'believing',
    magic_signature: 'values_depth',
    container_type: 'depth',
    primary_prompt: 'Beneath the performance, something is real.',
    cta_primary: 'Go beneath',
    _lab_title: 'The Tide',
    _lab_subtitle: 'Probe \u00d7 Values Clarification \u00d7 Believing',
    _lab_signature: 'values_depth',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT VIII — The Facing (hard tenderness)
  // ═══════════════════════════════════════════════════════════════
  {
    // #27 — The Cartographer
    navicue_type_id: 'lab__key__exposure__embodying',
    navicue_type_name: 'The Cartographer',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'embodying',
    magic_signature: 'fear_map',
    container_type: 'directional',
    primary_prompt: 'The fear you named isn\u2019t the fear you have.',
    cta_primary: 'Open',
    _lab_title: 'The Cartographer',
    _lab_subtitle: 'Key \u00d7 Exposure \u00d7 Embodying',
    _lab_signature: 'fear_map',
  },
  {
    // #28 — The Anchor
    navicue_type_id: 'lab__mirror__selfcompassion__believing',
    navicue_type_name: 'The Anchor',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'tender_mirror',
    container_type: 'reflective',
    primary_prompt: 'What if you looked at yourself the way you look at someone you love?',
    cta_primary: 'See',
    _lab_title: 'The Anchor',
    _lab_subtitle: 'Mirror \u00d7 Self-Compassion \u00d7 Believing',
    _lab_signature: 'tender_mirror',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT IX — The Knowing (identity meets awareness)
  // ═══════════════════════════════════════════════════════════════
  {
    // #29 — The Constellation (Identity Koan — routes via exact typeId)
    navicue_type_id: 'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__metacognition__e',
    navicue_type_name: 'The Constellation',
    form: 'Identity Koan',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'embodying',
    magic_signature: 'identity_witness',
    container_type: 'reflective',
    primary_prompt: 'Who is watching you think?',
    cta_primary: 'Look',
    _lab_title: 'The Constellation',
    _lab_subtitle: 'Identity Koan \u00d7 Metacognition \u00d7 Embodying',
    _lab_signature: 'identity_witness',
  },
  {
    // #30 — The Ember (Identity Koan — routes via exact typeId)
    navicue_type_id: 'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__values_clarification__b',
    navicue_type_name: 'The Ember',
    form: 'Identity Koan',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'believing',
    magic_signature: 'identity_values',
    container_type: 'reflective',
    primary_prompt: 'What would survive the fire?',
    cta_primary: 'Stay',
    _lab_title: 'The Ember',
    _lab_subtitle: 'Identity Koan \u00d7 Values Clarification \u00d7 Believing',
    _lab_signature: 'identity_values',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT X — The Tender Deepening (self-compassion deepens)
  // ═══════════════════════════════════════════════════════════════
  {
    // #31 — The Somatic Sigh
    navicue_type_id: 'lab__practice__selfcompassion__embodying',
    navicue_type_name: 'The Somatic Sigh',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'embodying',
    magic_signature: 'gentle_lullaby',
    container_type: 'action',
    primary_prompt: 'Let everything else wait.',
    cta_primary: 'Breathe',
    _lab_title: 'The Somatic Sigh',
    _lab_subtitle: 'Practice \u00d7 Self-Compassion \u00d7 Embodying',
    _lab_signature: 'gentle_lullaby',
  },
  {
    // #32 — The Unveiling
    navicue_type_id: 'lab__mirror__selfcompassion__embodying',
    navicue_type_name: 'The Unveiling',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'embodying',
    magic_signature: 'tender_unveiling',
    container_type: 'reflective',
    primary_prompt: 'What if the face beneath the face\u2026 is the one worth knowing?',
    cta_primary: 'Let it show',
    _lab_title: 'The Unveiling',
    _lab_subtitle: 'Mirror \u00d7 Self-Compassion \u00d7 Embodying',
    _lab_signature: 'tender_unveiling',
  },
  {
    // #33 — The Heirloom
    navicue_type_id: 'lab__key__selfcompassion__believing',
    navicue_type_name: 'The Heirloom',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'inherited_door',
    container_type: 'directional',
    primary_prompt: 'Some doors were built before you were born.',
    cta_primary: 'Turn it',
    _lab_title: 'The Heirloom',
    _lab_subtitle: 'Key \u00d7 Self-Compassion \u00d7 Believing',
    _lab_signature: 'inherited_door',
  },
  {
    // #34 — The Cradle (Identity Koan — routes via exact typeId)
    navicue_type_id: 'nct__integrate__mirror_probe_reframe_practice_transfer_seal__identity_koan__self_compassion__b',
    navicue_type_name: 'The Cradle',
    form: 'Identity Koan',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'self_cradle',
    container_type: 'reflective',
    primary_prompt: 'You are both the child and the arms.',
    cta_primary: 'Hold',
    _lab_title: 'The Cradle',
    _lab_subtitle: 'Identity Koan \u00d7 Self-Compassion \u00d7 Believing',
    _lab_signature: 'self_cradle',
  },
  {
    // #35 — The Vault
    navicue_type_id: 'lab__probe__exposure__believing',
    navicue_type_name: 'The Vault',
    form: 'Probe',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'believing',
    magic_signature: 'buried_breath',
    container_type: 'depth',
    primary_prompt: 'You buried it so well, you forgot where.',
    cta_primary: 'Look down',
    _lab_title: 'The Vault',
    _lab_subtitle: 'Probe \u00d7 Exposure \u00d7 Believing',
    _lab_signature: 'buried_breath',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT XI — The Second Sight (seeing again with new eyes)
  // ═══════════════════════════════════════════════════════════════
  {
    // #36 — The Vigil
    navicue_type_id: 'lab__probe__metacognition__embodying',
    navicue_type_name: 'The Vigil',
    form: 'Probe',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'embodying',
    magic_signature: 'deep_vigil',
    container_type: 'depth',
    primary_prompt: 'Watch the watcher. What do you find?',
    cta_primary: 'Stay',
    _lab_title: 'The Vigil',
    _lab_subtitle: 'Probe \u00d7 Metacognition \u00d7 Embodying',
    _lab_signature: 'deep_vigil',
  },
  {
    // #37 — The Aftermath
    navicue_type_id: 'lab__mirror__exposure__believing',
    navicue_type_name: 'The Aftermath',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'believing',
    magic_signature: 'aftermath_glass',
    container_type: 'reflective',
    primary_prompt: 'The fog has lifted. What remains?',
    cta_primary: 'See',
    _lab_title: 'The Aftermath',
    _lab_subtitle: 'Mirror \u00d7 Exposure \u00d7 Believing',
    _lab_signature: 'aftermath_glass',
  },
  {
    // #38 — The Skeleton Key
    navicue_type_id: 'lab__key__metacognition__believing',
    navicue_type_name: 'The Skeleton Key',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'believing',
    magic_signature: 'master_thought',
    container_type: 'directional',
    primary_prompt: 'One thought beneath all the others.',
    cta_primary: 'Find it',
    _lab_title: 'The Skeleton Key',
    _lab_subtitle: 'Key \u00d7 Metacognition \u00d7 Believing',
    _lab_signature: 'master_thought',
  },
  {
    // #39 — The Inventory
    navicue_type_id: 'lab__inventoryspark__exposure__believing',
    navicue_type_name: 'The Inventory',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'believing',
    magic_signature: 'courage_tally',
    container_type: 'signal',
    primary_prompt: 'You\u2019ve already faced more than you remember.',
    cta_primary: 'Count them',
    _lab_title: 'The Inventory',
    _lab_subtitle: 'Inventory Spark \u00d7 Exposure \u00d7 Believing',
    _lab_signature: 'courage_tally',
  },
  {
    // #40 — The Parliament
    navicue_type_id: 'lab__partsrollcall__metacognition__embodying',
    navicue_type_name: 'The Parliament',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'embodying',
    magic_signature: 'full_chamber',
    container_type: 'reflective',
    primary_prompt: 'Every voice. One room. No one leads.',
    cta_primary: 'Gather',
    _lab_title: 'The Parliament',
    _lab_subtitle: 'Parts Rollcall \u00d7 Metacognition \u00d7 Embodying',
    _lab_signature: 'full_chamber',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT XII — The Gathering (collecting the pieces)
  // ═══════════════════════════════════════════════════════════════
  {
    // #41 — The Understudy
    navicue_type_id: 'lab__practice__behavioralactivation__believing',
    navicue_type_name: 'The Understudy',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'quiet_rehearsal',
    container_type: 'action',
    primary_prompt: 'Practice in the wings. No one is watching.',
    cta_primary: 'Begin',
    _lab_title: 'The Understudy',
    _lab_subtitle: 'Practice \u00d7 Behavioral Activation \u00d7 Believing',
    _lab_signature: 'quiet_rehearsal',
  },
  {
    // #42 — The Inheritance
    navicue_type_id: 'lab__mirror__valuesclarification__believing',
    navicue_type_name: 'The Inheritance',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'believing',
    magic_signature: 'compass_glass',
    container_type: 'reflective',
    primary_prompt: 'The mirror shows what you carry without choosing.',
    cta_primary: 'See',
    _lab_title: 'The Inheritance',
    _lab_subtitle: 'Mirror \u00d7 Values Clarification \u00d7 Believing',
    _lab_signature: 'compass_glass',
  },
  {
    // #43 — The Tending
    navicue_type_id: 'lab__inventoryspark__selfcompassion__believing',
    navicue_type_name: 'The Tending',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'warmth_web',
    container_type: 'signal',
    primary_prompt: 'Touch each one. Not to fix, just to tend.',
    cta_primary: 'Tend',
    _lab_title: 'The Tending',
    _lab_subtitle: 'Inventory Spark \u00d7 Self-Compassion \u00d7 Believing',
    _lab_signature: 'warmth_web',
  },
  {
    // #44 — The Ignition
    navicue_type_id: 'lab__key__behavioralactivation__embodying',
    navicue_type_name: 'The Ignition',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'embodying',
    magic_signature: 'key_turn',
    container_type: 'directional',
    primary_prompt: 'One turn. The still thing moves.',
    cta_primary: 'Turn',
    _lab_title: 'The Ignition',
    _lab_subtitle: 'Key \u00d7 Behavioral Activation \u00d7 Embodying',
    _lab_signature: 'key_turn',
  },
  {
    // #45 — The Assembly
    navicue_type_id: 'lab__partsrollcall__behavioralactivation__embodying',
    navicue_type_name: 'The Assembly',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'embodying',
    magic_signature: 'unified_motion',
    container_type: 'reflective',
    primary_prompt: 'Every voice agrees on one thing: forward.',
    cta_primary: 'Move',
    _lab_title: 'The Assembly',
    _lab_subtitle: 'Parts Rollcall \u00d7 Behavioral Activation \u00d7 Embodying',
    _lab_signature: 'unified_motion',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT XIII — The Homecoming (arriving where you started)
  // ═══════════════════════════════════════════════════════════════
  {
    // #46 — The Still Point
    navicue_type_id: 'lab__probe__behavioralactivation__believing',
    navicue_type_name: 'The Still Point',
    form: 'Probe',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'depth_core',
    container_type: 'depth',
    primary_prompt: 'Before the last step, the pause.',
    cta_primary: 'Arrive',
    _lab_title: 'The Still Point',
    _lab_subtitle: 'Probe \u00d7 Behavioral Activation \u00d7 Believing',
    _lab_signature: 'depth_core',
  },
  {
    // #47 — The Unfurling
    navicue_type_id: 'lab__inventoryspark__exposure__embodying',
    navicue_type_name: 'The Unfurling',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'embodying',
    magic_signature: 'open_field',
    container_type: 'signal',
    primary_prompt: 'Everything you carried, laid open at last.',
    cta_primary: 'Open',
    _lab_title: 'The Unfurling',
    _lab_subtitle: 'Inventory Spark \u00d7 Exposure \u00d7 Embodying',
    _lab_signature: 'open_field',
  },
  {
    // #48 — The Connection Thread
    navicue_type_id: 'lab__partsrollcall__selfcompassion__embodying',
    navicue_type_name: 'The Connection Thread',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'embodying',
    magic_signature: 'warm_hearth',
    container_type: 'reflective',
    primary_prompt: 'You are not alone in this dark.',
    cta_primary: 'Reach',
    _lab_title: 'The Connection Thread',
    _lab_subtitle: 'Parts Rollcall \u00d7 Self-Compassion \u00d7 Embodying',
    _lab_signature: 'warm_hearth',
  },
  {
    // #49 — The Almanac
    navicue_type_id: 'lab__practice__metacognition__believing',
    navicue_type_name: 'The Almanac',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'believing',
    magic_signature: 'thought_garden',
    container_type: 'action',
    primary_prompt: 'Notice what passes through. Written in your own hand.',
    cta_primary: 'Notice',
    _lab_title: 'The Almanac',
    _lab_subtitle: 'Practice \u00d7 Metacognition \u00d7 Believing',
    _lab_signature: 'thought_garden',
  },
  {
    // #50 — The Future Simulation
    navicue_type_id: 'lab__mirror__behavioralactivation__believing',
    navicue_type_name: 'The Future Simulation',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'future_mirror',
    container_type: 'reflective',
    primary_prompt: 'You already know how the old story ends.',
    cta_primary: 'Play',
    _lab_title: 'The Future Simulation',
    _lab_subtitle: 'Mirror \u00d7 Behavioral Activation \u00d7 Believing',
    _lab_signature: 'future_mirror',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT 0 — THE NOVICE COLLECTION (First Principles)
  // These are fundamental. Not simple — irreducible.
  // ═══════════════════════════════════════════════════════════════
  {
    // #51 — The Pattern Glitch (Novice)
    navicue_type_id: 'lab__novice__pattern_glitch',
    navicue_type_name: 'The Pattern Glitch',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'novice_pattern_glitch',
    container_type: 'signal',
    primary_prompt: 'Stop. You are playing a script.',
    cta_primary: null,
    _lab_title: 'The Pattern Glitch',
    _lab_subtitle: 'Novice \u00d7 Inhibitory Control',
    _lab_signature: 'novice_pattern_glitch',
  },
  {
    // #52 — The Somatic Sigh (Novice)
    navicue_type_id: 'lab__novice__somatic_sigh',
    navicue_type_name: 'The Somatic Sigh',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Somatic Regulation',
    kbe_layer: 'embodying',
    magic_signature: 'novice_somatic_sigh',
    container_type: 'action',
    primary_prompt: 'Nowhere to go. Nothing to be. Just this breath.',
    cta_primary: null,
    _lab_title: 'The Somatic Sigh',
    _lab_subtitle: 'Novice \u00d7 Vagal Downshift',
    _lab_signature: 'novice_somatic_sigh',
  },
  {
    // #53 — The Witness Window (Novice)
    navicue_type_id: 'lab__novice__witness_window',
    navicue_type_name: 'The Witness Window',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Metacognition',
    kbe_layer: 'believing',
    magic_signature: 'novice_witness_window',
    container_type: 'reflective',
    primary_prompt: 'You are not the storm. You are the sky watching the storm.',
    cta_primary: null,
    _lab_title: 'The Witness Window',
    _lab_subtitle: 'Novice \u00d7 Cognitive Defusion',
    _lab_signature: 'novice_witness_window',
  },
  {
    // #54 — The Permission Slip (Novice)
    navicue_type_id: 'lab__novice__permission_slip',
    navicue_type_name: 'The Permission Slip',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'believing',
    magic_signature: 'novice_permission_slip',
    container_type: 'directional',
    primary_prompt: 'You have permission to stop performing.',
    cta_primary: null,
    _lab_title: 'The Permission Slip',
    _lab_subtitle: 'Novice \u00d7 Self-Permission',
    _lab_signature: 'novice_permission_slip',
  },
  {
    // #55 — The Paradox Key (Novice)
    navicue_type_id: 'lab__novice__paradox_key',
    navicue_type_name: 'The Paradox Key',
    form: 'Key',
    intent: 'Integrate',
    mechanism: 'Cognitive Restructuring',
    kbe_layer: 'believing',
    magic_signature: 'novice_paradox_key',
    container_type: 'directional',
    primary_prompt: 'The harder you push, the more it stays.',
    cta_primary: null,
    _lab_title: 'The Paradox Key',
    _lab_subtitle: 'Novice \u00d7 Paradoxical Intention',
    _lab_signature: 'novice_paradox_key',
  },
  {
    // #56 — The Reality Anchor (Novice)
    navicue_type_id: 'lab__novice__reality_anchor',
    navicue_type_name: 'The Reality Anchor',
    form: 'Practice',
    intent: 'Integrate',
    mechanism: 'Exposure',
    kbe_layer: 'embodying',
    magic_signature: 'novice_reality_anchor',
    container_type: 'action',
    primary_prompt: 'Five points of contact with right now.',
    cta_primary: null,
    _lab_title: 'The Reality Anchor',
    _lab_subtitle: 'Novice \u00d7 Sensory Grounding',
    _lab_signature: 'novice_reality_anchor',
  },
  {
    // #57 — The Micro-Proof (Novice)
    navicue_type_id: 'lab__novice__micro_proof',
    navicue_type_name: 'The Micro-Proof',
    form: 'Inventory Spark',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'novice_micro_proof',
    container_type: 'signal',
    primary_prompt: 'You just chose differently.',
    cta_primary: null,
    _lab_title: 'The Micro-Proof',
    _lab_subtitle: 'Novice \u00d7 Evidence Logging',
    _lab_signature: 'novice_micro_proof',
  },
  {
    // #58 — The Value Compass (Novice)
    navicue_type_id: 'lab__novice__value_compass',
    navicue_type_name: 'The Value Compass',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Values Clarification',
    kbe_layer: 'embodying',
    magic_signature: 'novice_value_compass',
    container_type: 'reflective',
    primary_prompt: 'Both are yours. Which one pulls harder right now?',
    cta_primary: null,
    _lab_title: 'The Value Compass',
    _lab_subtitle: 'Novice \u00d7 Somatic Values',
    _lab_signature: 'novice_value_compass',
  },
  {
    // #59 — The Future Simulation (Novice)
    navicue_type_id: 'lab__novice__future_simulation',
    navicue_type_name: 'The Future Simulation',
    form: 'Mirror',
    intent: 'Integrate',
    mechanism: 'Behavioral Activation',
    kbe_layer: 'believing',
    magic_signature: 'novice_future_simulation',
    container_type: 'reflective',
    primary_prompt: 'You already know how the old story ends.',
    cta_primary: null,
    _lab_title: 'The Future Simulation',
    _lab_subtitle: 'Novice \u00d7 Prospective Memory',
    _lab_signature: 'novice_future_simulation',
  },
  {
    // #60 — The Connection Thread (Novice)
    navicue_type_id: 'lab__novice__connection_thread',
    navicue_type_name: 'The Connection Thread',
    form: 'Parts Rollcall',
    intent: 'Integrate',
    mechanism: 'Self-Compassion',
    kbe_layer: 'embodying',
    magic_signature: 'novice_connection_thread',
    container_type: 'reflective',
    primary_prompt: 'You are not alone in this.',
    cta_primary: null,
    _lab_title: 'The Connection Thread',
    _lab_subtitle: 'Novice \u00d7 Common Humanity',
    _lab_signature: 'novice_connection_thread',
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT 1 — THE ALCHEMIST COLLECTION (The Reframing Collection)
  // "The obstacle is the path." Cognition → Reframe
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__alchemist__craving_surf', navicue_type_name: 'The Craving Surf', form: 'Practice', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'believing', magic_signature: 'alchemist_craving_surf', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Craving Surf', _lab_subtitle: 'Alchemist \u00d7 Urge Surfing', _lab_signature: 'alchemist_craving_surf' },
  { navicue_type_id: 'lab__alchemist__story_edit', navicue_type_name: 'The Story Edit', form: 'Key', intent: 'Integrate', mechanism: 'Cognitive Restructuring', kbe_layer: 'believing', magic_signature: 'alchemist_story_edit', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Story Edit', _lab_subtitle: 'Alchemist \u00d7 Cognitive Reappraisal', _lab_signature: 'alchemist_story_edit' },
  { navicue_type_id: 'lab__alchemist__time_telescope', navicue_type_name: 'The Time Telescope', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'alchemist_time_telescope', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Time Telescope', _lab_subtitle: 'Alchemist \u00d7 Temporal Distancing', _lab_signature: 'alchemist_time_telescope' },
  { navicue_type_id: 'lab__alchemist__shadow_hug', navicue_type_name: 'The Shadow Hug', form: 'Mirror', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'believing', magic_signature: 'alchemist_shadow_hug', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Shadow Hug', _lab_subtitle: 'Alchemist \u00d7 Paradoxical Intention', _lab_signature: 'alchemist_shadow_hug' },
  { navicue_type_id: 'lab__alchemist__meaning_mine', navicue_type_name: 'The Meaning Mine', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'alchemist_meaning_mine', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Meaning Mine', _lab_subtitle: 'Alchemist \u00d7 Benefit Finding', _lab_signature: 'alchemist_meaning_mine' },
  { navicue_type_id: 'lab__alchemist__energy_transmute', navicue_type_name: 'The Energy Transmute', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'alchemist_energy_transmute', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Energy Transmute', _lab_subtitle: 'Alchemist \u00d7 Arousal Reattribution', _lab_signature: 'alchemist_energy_transmute' },
  { navicue_type_id: 'lab__alchemist__council_of_elders', navicue_type_name: 'The Council of Elders', form: 'Parts Rollcall', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'alchemist_council_of_elders', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Council of Elders', _lab_subtitle: 'Alchemist \u00d7 Social Modeling', _lab_signature: 'alchemist_council_of_elders' },
  { navicue_type_id: 'lab__alchemist__fact_checker', navicue_type_name: 'The Fact Checker', form: 'Key', intent: 'Integrate', mechanism: 'Cognitive Restructuring', kbe_layer: 'knowing', magic_signature: 'alchemist_fact_checker', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Fact Checker', _lab_subtitle: 'Alchemist \u00d7 Reality Testing', _lab_signature: 'alchemist_fact_checker' },
  { navicue_type_id: 'lab__alchemist__gratitude_sniper', navicue_type_name: 'The Gratitude Sniper', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Attention Shift', kbe_layer: 'embodying', magic_signature: 'alchemist_gratitude_sniper', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Gratitude Sniper', _lab_subtitle: 'Alchemist \u00d7 Attention Bias', _lab_signature: 'alchemist_gratitude_sniper' },
  { navicue_type_id: 'lab__alchemist__identity_vote', navicue_type_name: 'The Identity Vote', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'alchemist_identity_vote', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Identity Vote', _lab_subtitle: 'Alchemist \u00d7 Self-Perception', _lab_signature: 'alchemist_identity_vote' },

  // ═══════════════════════════════════════════════════��═══════════
  // ACT 2 — THE ARCHITECT COLLECTION (The Embodiment Collection)
  // "Real life is the gym." Behavior → Build
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__architect__boundary_brick', navicue_type_name: 'The Boundary Brick', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Advocacy', kbe_layer: 'embodying', magic_signature: 'architect_boundary_brick', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Boundary Brick', _lab_subtitle: 'Architect \u00d7 Assertiveness', _lab_signature: 'architect_boundary_brick' },
  { navicue_type_id: 'lab__architect__connection_bridge', navicue_type_name: 'The Connection Bridge', form: 'Practice', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'architect_connection_bridge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Connection Bridge', _lab_subtitle: 'Architect \u00d7 Social Engagement', _lab_signature: 'architect_connection_bridge' },
  { navicue_type_id: 'lab__architect__micro_yes', navicue_type_name: 'The Micro-Yes', form: 'Key', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'believing', magic_signature: 'architect_micro_yes', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Micro-Yes', _lab_subtitle: 'Architect \u00d7 Behavioral Activation', _lab_signature: 'architect_micro_yes' },
  { navicue_type_id: 'lab__architect__environment_sweep', navicue_type_name: 'The Environment Sweep', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Attention Shift', kbe_layer: 'embodying', magic_signature: 'architect_environment_sweep', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Environment Sweep', _lab_subtitle: 'Architect \u00d7 Choice Architecture', _lab_signature: 'architect_environment_sweep' },
  { navicue_type_id: 'lab__architect__mirror_gaze', navicue_type_name: 'The Mirror Gaze', form: 'Mirror', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'architect_mirror_gaze', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror Gaze', _lab_subtitle: 'Architect \u00d7 Self-Compassion', _lab_signature: 'architect_mirror_gaze' },
  { navicue_type_id: 'lab__architect__friction_remover', navicue_type_name: 'The Friction Remover', form: 'Key', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'knowing', magic_signature: 'architect_friction_remover', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Remover', _lab_subtitle: 'Architect \u00d7 Implementation Intention', _lab_signature: 'architect_friction_remover' },
  { navicue_type_id: 'lab__architect__value_stake', navicue_type_name: 'The Value Stake', form: 'Practice', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'architect_value_stake', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Value Stake', _lab_subtitle: 'Architect \u00d7 Values Affirmation', _lab_signature: 'architect_value_stake' },
  { navicue_type_id: 'lab__architect__vulnerability_drop', navicue_type_name: 'The Vulnerability Drop', form: 'Mirror', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'architect_vulnerability_drop', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Vulnerability Drop', _lab_subtitle: 'Architect \u00d7 Shame Resilience', _lab_signature: 'architect_vulnerability_drop' },
  { navicue_type_id: 'lab__architect__generosity_loop', navicue_type_name: 'The Generosity Loop', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'architect_generosity_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Generosity Loop', _lab_subtitle: 'Architect \u00d7 Helper\u2019s High', _lab_signature: 'architect_generosity_loop' },
  { navicue_type_id: 'lab__architect__identity_seal', navicue_type_name: 'The Identity Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'architect_identity_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Identity Seal', _lab_subtitle: 'Architect \u00d7 Identity Consolidation', _lab_signature: 'architect_identity_seal' },

  // ════════��══════════════════════════════════════════════════════
  // ACT 3 — THE NAVIGATOR COLLECTION (The Integration Collection)
  // "Flow is the new stability." Embodying → Flow
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__navigator__tempo_dial', navicue_type_name: 'The Tempo Dial', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'navigator_tempo_dial', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tempo Dial', _lab_subtitle: 'Navigator \u00d7 Autonomic Regulation', _lab_signature: 'navigator_tempo_dial' },
  { navicue_type_id: 'lab__navigator__friction_converter', navicue_type_name: 'The Friction Converter', form: 'Key', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'navigator_friction_converter', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Converter', _lab_subtitle: 'Navigator \u00d7 Stress Reappraisal', _lab_signature: 'navigator_friction_converter' },
  { navicue_type_id: 'lab__navigator__intuition_ping', navicue_type_name: 'The Intuition Ping', form: 'Probe', intent: 'Integrate', mechanism: 'Somatic Awareness', kbe_layer: 'embodying', magic_signature: 'navigator_intuition_ping', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Intuition Ping', _lab_subtitle: 'Navigator \u00d7 Interoception', _lab_signature: 'navigator_intuition_ping' },
  { navicue_type_id: 'lab__navigator__repair_stitch', navicue_type_name: 'The Repair Stitch', form: 'Mirror', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'navigator_repair_stitch', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Repair Stitch', _lab_subtitle: 'Navigator \u00d7 Interactive Repair', _lab_signature: 'navigator_repair_stitch' },
  { navicue_type_id: 'lab__navigator__drift_correction', navicue_type_name: 'The Drift Correction', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'navigator_drift_correction', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Drift Correction', _lab_subtitle: 'Navigator \u00d7 Error Monitoring', _lab_signature: 'navigator_drift_correction' },
  { navicue_type_id: 'lab__navigator__spotlight_shift', navicue_type_name: 'The Spotlight Shift', form: 'Mirror', intent: 'Integrate', mechanism: 'Attention Shift', kbe_layer: 'embodying', magic_signature: 'navigator_spotlight_shift', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Spotlight Shift', _lab_subtitle: 'Navigator \u00d7 Attentional Deployment', _lab_signature: 'navigator_spotlight_shift' },
  { navicue_type_id: 'lab__navigator__doubt_detox', navicue_type_name: 'The Doubt Detox', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'navigator_doubt_detox', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Doubt Detox', _lab_subtitle: 'Navigator \u00d7 Metacognition', _lab_signature: 'navigator_doubt_detox' },
  { navicue_type_id: 'lab__navigator__joy_snap', navicue_type_name: 'The Joy Snap', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Attention Shift', kbe_layer: 'embodying', magic_signature: 'navigator_joy_snap', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Joy Snap', _lab_subtitle: 'Navigator \u00d7 Savoring', _lab_signature: 'navigator_joy_snap' },
  { navicue_type_id: 'lab__navigator__values_jam', navicue_type_name: 'The Values Jam', form: 'Practice', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'navigator_values_jam', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Values Jam', _lab_subtitle: 'Navigator \u00d7 Psychological Flexibility', _lab_signature: 'navigator_values_jam' },
  { navicue_type_id: 'lab__navigator__flow_trigger', navicue_type_name: 'The Flow Trigger', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'navigator_flow_trigger', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Flow Trigger', _lab_subtitle: 'Navigator \u00d7 Transient Hypofrontality', _lab_signature: 'navigator_flow_trigger' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 4 — THE SAGE COLLECTION (The Wisdom Collection)
  // "Wisdom is not knowledge. It is the courage to act on what you know."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__sage__ego_zoom', navicue_type_name: 'The Ego Zoom', form: 'Mirror', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'sage_ego_zoom', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ego Zoom', _lab_subtitle: 'Sage × Self-Distancing', _lab_signature: 'sage_ego_zoom' },
  { navicue_type_id: 'lab__sage__generational_lens', navicue_type_name: 'The Generational Lens', form: 'Probe', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'knowing', magic_signature: 'sage_generational_lens', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Generational Lens', _lab_subtitle: 'Sage × Intergenerational Transmission', _lab_signature: 'sage_generational_lens' },
  { navicue_type_id: 'lab__sage__empty_boat', navicue_type_name: 'The Empty Boat', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'sage_empty_boat', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Empty Boat', _lab_subtitle: 'Sage × Non-Attachment', _lab_signature: 'sage_empty_boat' },
  { navicue_type_id: 'lab__sage__silence_soak', navicue_type_name: 'The Silence Soak', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'knowing', magic_signature: 'sage_silence_soak', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silence Soak', _lab_subtitle: 'Sage × Default Mode Network', _lab_signature: 'sage_silence_soak' },
  { navicue_type_id: 'lab__sage__compassion_core', navicue_type_name: 'The Compassion Core', form: 'Mirror', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'knowing', magic_signature: 'sage_compassion_core', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Compassion Core', _lab_subtitle: 'Sage × Self-Compassion', _lab_signature: 'sage_compassion_core' },
  { navicue_type_id: 'lab__sage__mortality_check', navicue_type_name: 'The Mortality Check', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'sage_mortality_check', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Mortality Check', _lab_subtitle: 'Sage × Terror Management', _lab_signature: 'sage_mortality_check' },
  { navicue_type_id: 'lab__sage__ripple_watch', navicue_type_name: 'The Ripple Watch', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'sage_ripple_watch', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Ripple Watch', _lab_subtitle: 'Sage × Consequential Thinking', _lab_signature: 'sage_ripple_watch' },
  { navicue_type_id: 'lab__sage__universal_breath', navicue_type_name: 'The Universal Breath', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'knowing', magic_signature: 'sage_universal_breath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Universal Breath', _lab_subtitle: 'Sage × Vagal Tone', _lab_signature: 'sage_universal_breath' },
  { navicue_type_id: 'lab__sage__love_broadcast', navicue_type_name: 'The Love Broadcast', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'knowing', magic_signature: 'sage_love_broadcast', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Love Broadcast', _lab_subtitle: 'Sage × Loving-Kindness', _lab_signature: 'sage_love_broadcast' },
  { navicue_type_id: 'lab__sage__legacy_stamp', navicue_type_name: 'The Legacy Stamp', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'knowing', magic_signature: 'sage_legacy_stamp', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Legacy Stamp', _lab_subtitle: 'Sage × Generativity', _lab_signature: 'sage_legacy_stamp' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 5 — THE MENDER COLLECTION (The Repair Collection)
  // "You are not broken. You are mid-repair."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__mender__kintsugi_file', navicue_type_name: 'The Kintsugi File', form: 'Mirror', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'mender_kintsugi_file', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Kintsugi File', _lab_subtitle: 'Mender × Self-Compassion', _lab_signature: 'mender_kintsugi_file' },
  { navicue_type_id: 'lab__mender__shame_scrum', navicue_type_name: 'The Shame Scrum', form: 'Parts Rollcall', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'believing', magic_signature: 'mender_shame_scrum', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Shame Scrum', _lab_subtitle: 'Mender × Shame Resilience', _lab_signature: 'mender_shame_scrum' },
  { navicue_type_id: 'lab__mender__data_harvest', navicue_type_name: 'The Data Harvest', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mender_data_harvest', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Data Harvest', _lab_subtitle: 'Mender × Benefit Finding', _lab_signature: 'mender_data_harvest' },
  { navicue_type_id: 'lab__mender__forgiveness_loop', navicue_type_name: 'The Forgiveness Loop', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'mender_forgiveness_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Forgiveness Loop', _lab_subtitle: 'Mender × Release', _lab_signature: 'mender_forgiveness_loop' },
  { navicue_type_id: 'lab__mender__reset_button', navicue_type_name: 'The Reset Button', form: 'Key', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'believing', magic_signature: 'mender_reset_button', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Reset Button', _lab_subtitle: 'Mender × Fresh Next Step', _lab_signature: 'mender_reset_button' },
  { navicue_type_id: 'lab__mender__vulnerability_vow', navicue_type_name: 'The Vulnerability Vow', form: 'Mirror', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'mender_vulnerability_vow', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Vulnerability Vow', _lab_subtitle: 'Mender × Courage', _lab_signature: 'mender_vulnerability_vow' },
  { navicue_type_id: 'lab__mender__dust_off', navicue_type_name: 'The Dust Off', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'mender_dust_off', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dust Off', _lab_subtitle: 'Mender × Resilience', _lab_signature: 'mender_dust_off' },
  { navicue_type_id: 'lab__mender__guardrail_build', navicue_type_name: 'The Guardrail Build', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'mender_guardrail_build', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Guardrail Build', _lab_subtitle: 'Mender × Prevention', _lab_signature: 'mender_guardrail_build' },
  { navicue_type_id: 'lab__mender__body_scan_damage', navicue_type_name: 'The Body Scan', form: 'Probe', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'mender_body_scan_damage', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Body Scan', _lab_subtitle: 'Mender × Somatic Witness', _lab_signature: 'mender_body_scan_damage' },
  { navicue_type_id: 'lab__mender__re_commitment', navicue_type_name: 'The Re-Commitment', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'mender_re_commitment', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Re-Commitment', _lab_subtitle: 'Mender × Renewed Vow', _lab_signature: 'mender_re_commitment' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 6 — THE DIPLOMAT COLLECTION (The Bridge Collection)
  // "See their side. Not to agree. To understand."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__diplomat__mirror_shield', navicue_type_name: 'The Mirror Shield', form: 'Mirror', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'diplomat_mirror_shield', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror Shield', _lab_subtitle: 'Diplomat × Decoding Aggression', _lab_signature: 'diplomat_mirror_shield' },
  { navicue_type_id: 'lab__diplomat__truce_table', navicue_type_name: 'The Truce Table', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'diplomat_truce_table', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Truce Table', _lab_subtitle: 'Diplomat × Good Faith', _lab_signature: 'diplomat_truce_table' },
  { navicue_type_id: 'lab__diplomat__perspective_swap', navicue_type_name: 'The Perspective Swap', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'diplomat_perspective_swap', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Perspective Swap', _lab_subtitle: 'Diplomat × Cognitive Empathy', _lab_signature: 'diplomat_perspective_swap' },
  { navicue_type_id: 'lab__diplomat__peace_thread', navicue_type_name: 'The Peace Thread', form: 'Key', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'diplomat_peace_thread', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Peace Thread', _lab_subtitle: 'Diplomat × Relational Repair', _lab_signature: 'diplomat_peace_thread' },
  { navicue_type_id: 'lab__diplomat__translator', navicue_type_name: 'The Translator', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'diplomat_translator', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Translator', _lab_subtitle: 'Diplomat × Deep Listening', _lab_signature: 'diplomat_translator' },
  { navicue_type_id: 'lab__diplomat__boundary_dance', navicue_type_name: 'The Boundary Dance', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'diplomat_boundary_dance', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Boundary Dance', _lab_subtitle: 'Diplomat × Optimal Distance', _lab_signature: 'diplomat_boundary_dance' },
  { navicue_type_id: 'lab__diplomat__empathy_bridge', navicue_type_name: 'The Empathy Bridge', form: 'Mirror', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'embodying', magic_signature: 'diplomat_empathy_bridge', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Empathy Bridge', _lab_subtitle: 'Diplomat × Perspective-Taking', _lab_signature: 'diplomat_empathy_bridge' },
  { navicue_type_id: 'lab__diplomat__de_escalation', navicue_type_name: 'The De-Escalation', form: 'Key', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'diplomat_de_escalation', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The De-Escalation', _lab_subtitle: 'Diplomat × Conflict Cooling', _lab_signature: 'diplomat_de_escalation' },
  { navicue_type_id: 'lab__diplomat__common_ground', navicue_type_name: 'The Common Ground', form: 'Probe', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'diplomat_common_ground', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Common Ground', _lab_subtitle: 'Diplomat × Shared Values', _lab_signature: 'diplomat_common_ground' },
  { navicue_type_id: 'lab__diplomat__sangha_search', navicue_type_name: 'The Sangha Search', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'embodying', magic_signature: 'diplomat_sangha_search', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Sangha Search', _lab_subtitle: 'Diplomat × Finding Your People', _lab_signature: 'diplomat_sangha_search' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 7 — THE WEAVER COLLECTION (The Pattern Collection)
  // "You are the witness and the weaver."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__weaver__thread_map', navicue_type_name: 'The Thread Map', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'weaver_thread_map', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Thread Map', _lab_subtitle: 'Weaver × Systems Thinking', _lab_signature: 'weaver_thread_map' },
  { navicue_type_id: 'lab__weaver__story_loom', navicue_type_name: 'The Story Loom', form: 'Mirror', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'weaver_story_loom', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Story Loom', _lab_subtitle: 'Weaver × Narrative Integration', _lab_signature: 'weaver_story_loom' },
  { navicue_type_id: 'lab__weaver__contradiction_hold', navicue_type_name: 'The Contradiction Hold', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'weaver_contradiction_hold', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Contradiction Hold', _lab_subtitle: 'Weaver × Dialectical Thinking', _lab_signature: 'weaver_contradiction_hold' },
  { navicue_type_id: 'lab__weaver__pattern_break', navicue_type_name: 'The Pattern Break', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'weaver_pattern_break', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pattern Break', _lab_subtitle: 'Weaver × Pattern Interruption', _lab_signature: 'weaver_pattern_break' },
  { navicue_type_id: 'lab__weaver__meaning_weave', navicue_type_name: 'The Meaning Weave', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'weaver_meaning_weave', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Meaning Weave', _lab_subtitle: 'Weaver × Meaning-Making', _lab_signature: 'weaver_meaning_weave' },
  { navicue_type_id: 'lab__weaver__integration_spiral', navicue_type_name: 'The Integration Spiral', form: 'Mirror', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'weaver_integration_spiral', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Integration Spiral', _lab_subtitle: 'Weaver × Spiral Dynamics', _lab_signature: 'weaver_integration_spiral' },
  { navicue_type_id: 'lab__weaver__complexity_breath', navicue_type_name: 'The Complexity Breath', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'weaver_complexity_breath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Complexity Breath', _lab_subtitle: 'Weaver × Embodied Cognition', _lab_signature: 'weaver_complexity_breath' },
  { navicue_type_id: 'lab__weaver__bridge_of_opposites', navicue_type_name: 'The Bridge of Opposites', form: 'Key', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'weaver_bridge_of_opposites', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Bridge of Opposites', _lab_subtitle: 'Weaver × Paradox Integration', _lab_signature: 'weaver_bridge_of_opposites' },
  { navicue_type_id: 'lab__weaver__witness_weave', navicue_type_name: 'The Witness Weave', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'weaver_witness_weave', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Witness Weave', _lab_subtitle: 'Weaver × Meta-Awareness', _lab_signature: 'weaver_witness_weave' },
  { navicue_type_id: 'lab__weaver__tapestry_seal', navicue_type_name: 'The Tapestry Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'weaver_tapestry_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Tapestry Seal', _lab_subtitle: 'Weaver × Unfinished Beauty', _lab_signature: 'weaver_tapestry_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 8 — THE VISIONARY COLLECTION (The Possibility Collection)
  // "What can you see that doesn't exist yet?"
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__visionary__horizon_scan', navicue_type_name: 'The Horizon Scan', form: 'Mirror', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'visionary_horizon_scan', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Horizon Scan', _lab_subtitle: 'Visionary × Future Visualization', _lab_signature: 'visionary_horizon_scan' },
  { navicue_type_id: 'lab__visionary__seed_vault', navicue_type_name: 'The Seed Vault', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'believing', magic_signature: 'visionary_seed_vault', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Seed Vault', _lab_subtitle: 'Visionary × Intentional Planting', _lab_signature: 'visionary_seed_vault' },
  { navicue_type_id: 'lab__visionary__possibility_prism', navicue_type_name: 'The Possibility Prism', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'visionary_possibility_prism', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Possibility Prism', _lab_subtitle: 'Visionary × Cognitive Flexibility', _lab_signature: 'visionary_possibility_prism' },
  { navicue_type_id: 'lab__visionary__fear_telescope', navicue_type_name: 'The Fear Telescope', form: 'Key', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'believing', magic_signature: 'visionary_fear_telescope', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Fear Telescope', _lab_subtitle: 'Visionary × Fear Mapping', _lab_signature: 'visionary_fear_telescope' },
  { navicue_type_id: 'lab__visionary__dream_audit', navicue_type_name: 'The Dream Audit', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'visionary_dream_audit', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Dream Audit', _lab_subtitle: 'Visionary × Values Differentiation', _lab_signature: 'visionary_dream_audit' },
  { navicue_type_id: 'lab__visionary__time_capsule', navicue_type_name: 'The Time Capsule', form: 'Mirror', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'embodying', magic_signature: 'visionary_time_capsule', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Time Capsule', _lab_subtitle: 'Visionary × Future Self', _lab_signature: 'visionary_time_capsule' },
  { navicue_type_id: 'lab__visionary__obstacle_flip', navicue_type_name: 'The Obstacle Flip', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'visionary_obstacle_flip', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Obstacle Flip', _lab_subtitle: 'Visionary × Cognitive Reframe', _lab_signature: 'visionary_obstacle_flip' },
  { navicue_type_id: 'lab__visionary__vision_board', navicue_type_name: 'The Vision Board', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'visionary_vision_board', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vision Board', _lab_subtitle: 'Visionary × Mental Rehearsal', _lab_signature: 'visionary_vision_board' },
  { navicue_type_id: 'lab__visionary__courage_map', navicue_type_name: 'The Courage Map', form: 'Probe', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'visionary_courage_map', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Courage Map', _lab_subtitle: 'Visionary × Courage Mapping', _lab_signature: 'visionary_courage_map' },
  { navicue_type_id: 'lab__visionary__becoming_seal', navicue_type_name: 'The Becoming Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'visionary_becoming_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Becoming Seal', _lab_subtitle: 'Visionary × Identity as Verb', _lab_signature: 'visionary_becoming_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 9 — THE LUMINARY COLLECTION (The Light Collection)
  // "You are one star in a constellation of light."
  // ═══════��═══════════════════════════════════════════════════════
  { navicue_type_id: 'lab__luminary__torch_pass', navicue_type_name: 'The Torch Pass', form: 'Mirror', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'luminary_torch_pass', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Torch Pass', _lab_subtitle: 'Luminary × Carrying Light', _lab_signature: 'luminary_torch_pass' },
  { navicue_type_id: 'lab__luminary__ripple_seed', navicue_type_name: 'The Ripple Seed', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'believing', magic_signature: 'luminary_ripple_seed', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ripple Seed', _lab_subtitle: 'Luminary × Ripple Effect', _lab_signature: 'luminary_ripple_seed' },
  { navicue_type_id: 'lab__luminary__legacy_letter', navicue_type_name: 'The Legacy Letter', form: 'Key', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'luminary_legacy_letter', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Legacy Letter', _lab_subtitle: 'Luminary × Legacy Intention', _lab_signature: 'luminary_legacy_letter' },
  { navicue_type_id: 'lab__luminary__gratitude_broadcast', navicue_type_name: 'The Gratitude Broadcast', form: 'Inventory Spark', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'luminary_gratitude_broadcast', container_type: 'signal', primary_prompt: null, cta_primary: null, _lab_title: 'The Gratitude Broadcast', _lab_subtitle: 'Luminary × Gratitude Radiation', _lab_signature: 'luminary_gratitude_broadcast' },
  { navicue_type_id: 'lab__luminary__mentor_mirror', navicue_type_name: 'The Mentor Mirror', form: 'Probe', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'luminary_mentor_mirror', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Mentor Mirror', _lab_subtitle: 'Luminary × Lineage', _lab_signature: 'luminary_mentor_mirror' },
  { navicue_type_id: 'lab__luminary__service_compass', navicue_type_name: 'The Service Compass', form: 'Practice', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'luminary_service_compass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Service Compass', _lab_subtitle: 'Luminary × Purpose Alignment', _lab_signature: 'luminary_service_compass' },
  { navicue_type_id: 'lab__luminary__generosity_engine', navicue_type_name: 'The Generosity Engine', form: 'Key', intent: 'Integrate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'luminary_generosity_engine', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Generosity Engine', _lab_subtitle: 'Luminary × Give-Receive Cycle', _lab_signature: 'luminary_generosity_engine' },
  { navicue_type_id: 'lab__luminary__purpose_pulse', navicue_type_name: 'The Purpose Pulse', form: 'Mirror', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'luminary_purpose_pulse', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Purpose Pulse', _lab_subtitle: 'Luminary × Embodied Purpose', _lab_signature: 'luminary_purpose_pulse' },
  { navicue_type_id: 'lab__luminary__dark_light', navicue_type_name: 'The Dark Light', form: 'Probe', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'luminary_dark_light', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Dark Light', _lab_subtitle: 'Luminary × Post-Traumatic Growth', _lab_signature: 'luminary_dark_light' },
  { navicue_type_id: 'lab__luminary__constellation_seal', navicue_type_name: 'The Constellation Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'embodying', magic_signature: 'luminary_constellation_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Constellation Seal', _lab_subtitle: 'Luminary × Belonging', _lab_signature: 'luminary_constellation_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 10 — THE HACKER COLLECTION (The De-Conditioning Collection)
  // "The Matrix is made of language. Re-write the code."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__hacker__label_peeler', navicue_type_name: 'The Label Peeler', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'hacker_label_peeler', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Label Peeler', _lab_subtitle: 'Hacker × General Semantics', _lab_signature: 'hacker_label_peeler' },
  { navicue_type_id: 'lab__hacker__status_glitch', navicue_type_name: 'The Status Glitch', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'hacker_status_glitch', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Status Glitch', _lab_subtitle: 'Hacker × Social Comparison', _lab_signature: 'hacker_status_glitch' },
  { navicue_type_id: 'lab__hacker__algorithm_jammer', navicue_type_name: 'The Algorithm Jammer', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'hacker_algorithm_jammer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Algorithm Jammer', _lab_subtitle: 'Hacker × Operant Extinction', _lab_signature: 'hacker_algorithm_jammer' },
  { navicue_type_id: 'lab__hacker__mimetic_check', navicue_type_name: 'The Mimetic Check', form: 'Mirror', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'hacker_mimetic_check', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mimetic Check', _lab_subtitle: 'Hacker × Mimetic Theory', _lab_signature: 'hacker_mimetic_check' },
  { navicue_type_id: 'lab__hacker__sunk_cost_cut', navicue_type_name: 'The Sunk Cost Cut', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'hacker_sunk_cost_cut', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Sunk Cost Cut', _lab_subtitle: 'Hacker × Sunk Cost Fallacy', _lab_signature: 'hacker_sunk_cost_cut' },
  { navicue_type_id: 'lab__hacker__script_burn', navicue_type_name: 'The Script Burn', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'hacker_script_burn', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Script Burn', _lab_subtitle: 'Hacker × Narrative Identity', _lab_signature: 'hacker_script_burn' },
  { navicue_type_id: 'lab__hacker__attention_paywall', navicue_type_name: 'The Attention Paywall', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'hacker_attention_paywall', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Attention Paywall', _lab_subtitle: 'Hacker × Cognitive Load', _lab_signature: 'hacker_attention_paywall' },
  { navicue_type_id: 'lab__hacker__role_reject', navicue_type_name: 'The Role Reject', form: 'Mirror', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'hacker_role_reject', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Role Reject', _lab_subtitle: 'Hacker × Dramaturgy', _lab_signature: 'hacker_role_reject' },
  { navicue_type_id: 'lab__hacker__should_deleter', navicue_type_name: 'The "Should" Deleter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'hacker_should_deleter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Should" Deleter', _lab_subtitle: 'Hacker × REBT', _lab_signature: 'hacker_should_deleter' },
  { navicue_type_id: 'lab__hacker__source_code', navicue_type_name: 'The Source Code', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'hacker_source_code', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Source Code', _lab_subtitle: 'Hacker × Self-Affirmation Theory', _lab_signature: 'hacker_source_code' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 11 — THE CHRONONAUT COLLECTION (The Time-Bending Collection)
  // "Time is a dimension, not a line. Move around in it."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__chrononaut__memory_remix', navicue_type_name: 'The Memory Remix', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'chrononaut_memory_remix', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Memory Remix', _lab_subtitle: 'Chrononaut × Memory Reconsolidation', _lab_signature: 'chrononaut_memory_remix' },
  { navicue_type_id: 'lab__chrononaut__deep_time', navicue_type_name: 'The Deep Time', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'chrononaut_deep_time', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Deep Time', _lab_subtitle: 'Chrononaut × Temporal Distancing', _lab_signature: 'chrononaut_deep_time' },
  { navicue_type_id: 'lab__chrononaut__slow_motion_day', navicue_type_name: 'The Slow-Motion Day', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'chrononaut_slow_motion_day', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Slow-Motion Day', _lab_subtitle: 'Chrononaut × Time Perception', _lab_signature: 'chrononaut_slow_motion_day' },
  { navicue_type_id: 'lab__chrononaut__future_visitor', navicue_type_name: 'The Future Visitor', form: 'Mirror', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'chrononaut_future_visitor', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Visitor', _lab_subtitle: 'Chrononaut × Episodic Future Thinking', _lab_signature: 'chrononaut_future_visitor' },
  { navicue_type_id: 'lab__chrononaut__patience_muscle', navicue_type_name: 'The Patience Muscle', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'chrononaut_patience_muscle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Patience Muscle', _lab_subtitle: 'Chrononaut × Inhibitory Control', _lab_signature: 'chrononaut_patience_muscle' },
  { navicue_type_id: 'lab__chrononaut__urgency_deleter', navicue_type_name: 'The Urgency Deleter', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'chrononaut_urgency_deleter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Urgency Deleter', _lab_subtitle: 'Chrononaut × Sympathetic Downregulation', _lab_signature: 'chrononaut_urgency_deleter' },
  { navicue_type_id: 'lab__chrononaut__regret_reversal', navicue_type_name: 'The Regret Reversal', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'chrononaut_regret_reversal', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Regret Reversal', _lab_subtitle: 'Chrononaut × Temporal Discounting', _lab_signature: 'chrononaut_regret_reversal' },
  { navicue_type_id: 'lab__chrononaut__ancestral_blink', navicue_type_name: 'The Ancestral Blink', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'chrononaut_ancestral_blink', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Ancestral Blink', _lab_subtitle: 'Chrononaut × Narrative Resilience', _lab_signature: 'chrononaut_ancestral_blink' },
  { navicue_type_id: 'lab__chrononaut__loop_spotter', navicue_type_name: 'The Loop Spotter', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'chrononaut_loop_spotter', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Loop Spotter', _lab_subtitle: 'Chrononaut × Pattern Recognition', _lab_signature: 'chrononaut_loop_spotter' },
  { navicue_type_id: 'lab__chrononaut__eternal_instant', navicue_type_name: 'The Eternal Instant', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'chrononaut_eternal_instant', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Eternal Instant', _lab_subtitle: 'Chrononaut × State Presence', _lab_signature: 'chrononaut_eternal_instant' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 12 — THE MYCELIUM COLLECTION (The Networked Collection)
  // "Trees don't fight; they trade sugar underground."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__mycelium__invisible_thread', navicue_type_name: 'The Invisible Thread', form: 'Practice', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'mycelium_invisible_thread', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Invisible Thread', _lab_subtitle: 'Mycelium × Interdependence Awareness', _lab_signature: 'mycelium_invisible_thread' },
  { navicue_type_id: 'lab__mycelium__hive_mind', navicue_type_name: 'The Hive Mind', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mycelium_hive_mind', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Hive Mind', _lab_subtitle: 'Mycelium × Distributed Cognition', _lab_signature: 'mycelium_hive_mind' },
  { navicue_type_id: 'lab__mycelium__symbiosis_check', navicue_type_name: 'The Symbiosis Check', form: 'Mirror', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'mycelium_symbiosis_check', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Symbiosis Check', _lab_subtitle: 'Mycelium × Reciprocal Altruism', _lab_signature: 'mycelium_symbiosis_check' },
  { navicue_type_id: 'lab__mycelium__root_share', navicue_type_name: 'The Root Share', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'mycelium_root_share', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Root Share', _lab_subtitle: 'Mycelium × Social Buffering', _lab_signature: 'mycelium_root_share' },
  { navicue_type_id: 'lab__mycelium__signal_pulse', navicue_type_name: 'The Signal Pulse', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'mycelium_signal_pulse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Signal Pulse', _lab_subtitle: 'Mycelium × Phatic Communication', _lab_signature: 'mycelium_signal_pulse' },
  { navicue_type_id: 'lab__mycelium__mirror_neuron', navicue_type_name: 'The Mirror Neuron', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'mycelium_mirror_neuron', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror Neuron', _lab_subtitle: 'Mycelium × Emotional Contagion', _lab_signature: 'mycelium_mirror_neuron' },
  { navicue_type_id: 'lab__mycelium__wide_net', navicue_type_name: 'The Wide Net', form: 'Key', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'mycelium_wide_net', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Wide Net', _lab_subtitle: 'Mycelium × Social Capital', _lab_signature: 'mycelium_wide_net' },
  { navicue_type_id: 'lab__mycelium__common_ground', navicue_type_name: 'The Common Ground', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'mycelium_common_ground', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Common Ground', _lab_subtitle: 'Mycelium × Superordinate Goals', _lab_signature: 'mycelium_common_ground' },
  { navicue_type_id: 'lab__mycelium__dunbar_sorter', navicue_type_name: 'The Dunbar Sorter', form: 'Key', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'mycelium_dunbar_sorter', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Dunbar Sorter', _lab_subtitle: 'Mycelium × Dunbar\'s Number', _lab_signature: 'mycelium_dunbar_sorter' },
  { navicue_type_id: 'lab__mycelium__mycelial_map', navicue_type_name: 'The Mycelial Map', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'mycelium_mycelial_map', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mycelial Map', _lab_subtitle: 'Mycelium × Self-Expansion Theory', _lab_signature: 'mycelium_mycelial_map' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 13 — THE AESTHETE COLLECTION (The Beauty Collection)
  // "Beauty is the ultimate utility."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__aesthete__golden_ratio', navicue_type_name: 'The Golden Ratio', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'aesthete_golden_ratio', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Golden Ratio', _lab_subtitle: 'Aesthete × Neuro-Aesthetics', _lab_signature: 'aesthete_golden_ratio' },
  { navicue_type_id: 'lab__aesthete__color_soak', navicue_type_name: 'The Color Soak', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'aesthete_color_soak', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Color Soak', _lab_subtitle: 'Aesthete × Chromotherapy', _lab_signature: 'aesthete_color_soak' },
  { navicue_type_id: 'lab__aesthete__wabi_sabi', navicue_type_name: 'The Wabi-Sabi', form: 'Mirror', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'aesthete_wabi_sabi', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Wabi-Sabi', _lab_subtitle: 'Aesthete × Acceptance of Imperfection', _lab_signature: 'aesthete_wabi_sabi' },
  { navicue_type_id: 'lab__aesthete__negative_space', navicue_type_name: 'The Negative Space', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'aesthete_negative_space', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Negative Space', _lab_subtitle: 'Aesthete × Visual De-cluttering', _lab_signature: 'aesthete_negative_space' },
  { navicue_type_id: 'lab__aesthete__texture_touch', navicue_type_name: 'The Texture Touch', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'aesthete_texture_touch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Texture Touch', _lab_subtitle: 'Aesthete × Somatosensory Integration', _lab_signature: 'aesthete_texture_touch' },
  { navicue_type_id: 'lab__aesthete__design_edit', navicue_type_name: 'The Design Edit', form: 'Key', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'aesthete_design_edit', container_type: 'directional', primary_prompt: null, cta_primary: null, _lab_title: 'The Design Edit', _lab_subtitle: 'Aesthete × Environmental Psychology', _lab_signature: 'aesthete_design_edit' },
  { navicue_type_id: 'lab__aesthete__sound_bath', navicue_type_name: 'The Sound Bath', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'aesthete_sound_bath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sound Bath', _lab_subtitle: 'Aesthete × Auditory Entrainment', _lab_signature: 'aesthete_sound_bath' },
  { navicue_type_id: 'lab__aesthete__light_sculpt', navicue_type_name: 'The Light Sculpt', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'aesthete_light_sculpt', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Light Sculpt', _lab_subtitle: 'Aesthete × Savoring', _lab_signature: 'aesthete_light_sculpt' },
  { navicue_type_id: 'lab__aesthete__taste_savor', navicue_type_name: 'The Taste Savor', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'aesthete_taste_savor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Taste Savor', _lab_subtitle: 'Aesthete × Mindful Eating', _lab_signature: 'aesthete_taste_savor' },
  { navicue_type_id: 'lab__aesthete__masterpiece_frame', navicue_type_name: 'The Masterpiece Frame', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'embodying', magic_signature: 'aesthete_masterpiece_frame', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Masterpiece Frame', _lab_subtitle: 'Aesthete × Aesthetic Reappraisal', _lab_signature: 'aesthete_masterpiece_frame' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 14 — THE ELEMENTAL COLLECTION (The Bio-Physics Collection)
  // "You are 70% water, standing on a rock, spinning near a fire."
  // ═════════════���═════════════════════════════════════════════════
  { navicue_type_id: 'lab__elemental__fire_gaze', navicue_type_name: 'The Fire Gaze', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'elemental_fire_gaze', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fire Gaze', _lab_subtitle: 'Elemental × Hypnotic Entrainment', _lab_signature: 'elemental_fire_gaze' },
  { navicue_type_id: 'lab__elemental__water_float', navicue_type_name: 'The Water Float', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elemental_water_float', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Water Float', _lab_subtitle: 'Elemental × Sensory Deprivation', _lab_signature: 'elemental_water_float' },
  { navicue_type_id: 'lab__elemental__wind_shear', navicue_type_name: 'The Wind Shear', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elemental_wind_shear', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wind Shear', _lab_subtitle: 'Elemental × Biophilia Response', _lab_signature: 'elemental_wind_shear' },
  { navicue_type_id: 'lab__elemental__stone_hold', navicue_type_name: 'The Stone Hold', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elemental_stone_hold', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Stone Hold', _lab_subtitle: 'Elemental × Object Permanence', _lab_signature: 'elemental_stone_hold' },
  { navicue_type_id: 'lab__elemental__ice_shock', navicue_type_name: 'The Ice Shock', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'elemental_ice_shock', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ice Shock', _lab_subtitle: 'Elemental × Mammalian Dive Reflex', _lab_signature: 'elemental_ice_shock' },
  { navicue_type_id: 'lab__elemental__root_drop', navicue_type_name: 'The Root Drop', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elemental_root_drop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Root Drop', _lab_subtitle: 'Elemental × Embodied Metaphor', _lab_signature: 'elemental_root_drop' },
  { navicue_type_id: 'lab__elemental__thunder_gap', navicue_type_name: 'The Thunder Gap', form: 'Practice', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'believing', magic_signature: 'elemental_thunder_gap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Thunder Gap', _lab_subtitle: 'Elemental × Anticipatory Regulation', _lab_signature: 'elemental_thunder_gap' },
  { navicue_type_id: 'lab__elemental__river_flow', navicue_type_name: 'The River Flow', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'elemental_river_flow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The River Flow', _lab_subtitle: 'Elemental × Adaptive Flexibility', _lab_signature: 'elemental_river_flow' },
  { navicue_type_id: 'lab__elemental__salt_cleanse', navicue_type_name: 'The Salt Cleanse', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elemental_salt_cleanse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Salt Cleanse', _lab_subtitle: 'Elemental × Somatic Release', _lab_signature: 'elemental_salt_cleanse' },
  { navicue_type_id: 'lab__elemental__elementalist_seal', navicue_type_name: 'The Elementalist Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elemental_elementalist_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Elementalist Seal', _lab_subtitle: 'Elemental × Embodied Verification', _lab_signature: 'elemental_elementalist_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 15 — THE PHENOMENOLOGIST COLLECTION (The Perception Collection)
  // "There is no world out there. There is only the world in here."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__phenomenologist__raw_data', navicue_type_name: 'The Raw Data', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'phenomenologist_raw_data', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Raw Data', _lab_subtitle: 'Phenomenologist × Bottom-Up Processing', _lab_signature: 'phenomenologist_raw_data' },
  { navicue_type_id: 'lab__phenomenologist__audio_zoom', navicue_type_name: 'The Audio Zoom', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'phenomenologist_audio_zoom', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Audio Zoom', _lab_subtitle: 'Phenomenologist × Auditory Selective Attention', _lab_signature: 'phenomenologist_audio_zoom' },
  { navicue_type_id: 'lab__phenomenologist__blind_walk', navicue_type_name: 'The Blind Walk', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'phenomenologist_blind_walk', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Blind Walk', _lab_subtitle: 'Phenomenologist × Sensory Substitution', _lab_signature: 'phenomenologist_blind_walk' },
  { navicue_type_id: 'lab__phenomenologist__taste_explode', navicue_type_name: 'The Taste Explode', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'phenomenologist_taste_explode', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Taste Explode', _lab_subtitle: 'Phenomenologist × Gustatory Mindfulness', _lab_signature: 'phenomenologist_taste_explode' },
  { navicue_type_id: 'lab__phenomenologist__temperature_scan', navicue_type_name: 'The Temperature Scan', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'phenomenologist_temperature_scan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Temperature Scan', _lab_subtitle: 'Phenomenologist × Interoceptive Accuracy', _lab_signature: 'phenomenologist_temperature_scan' },
  { navicue_type_id: 'lab__phenomenologist__proprioception_check', navicue_type_name: 'The Proprioception Check', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'phenomenologist_proprioception_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Proprioception Check', _lab_subtitle: 'Phenomenologist × Proprioceptive Awareness', _lab_signature: 'phenomenologist_proprioception_check' },
  { navicue_type_id: 'lab__phenomenologist__color_deconstruct', navicue_type_name: 'The Color Deconstruct', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'phenomenologist_color_deconstruct', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Color Deconstruct', _lab_subtitle: 'Phenomenologist × Analytical Perception', _lab_signature: 'phenomenologist_color_deconstruct' },
  { navicue_type_id: 'lab__phenomenologist__olfactory_hunt', navicue_type_name: 'The Olfactory Hunt', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'phenomenologist_olfactory_hunt', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Olfactory Hunt', _lab_subtitle: 'Phenomenologist × Olfactory Memory', _lab_signature: 'phenomenologist_olfactory_hunt' },
  { navicue_type_id: 'lab__phenomenologist__micro_texture', navicue_type_name: 'The Micro-Texture', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'phenomenologist_micro_texture', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Micro-Texture', _lab_subtitle: 'Phenomenologist × Tactile Discrimination', _lab_signature: 'phenomenologist_micro_texture' },
  { navicue_type_id: 'lab__phenomenologist__perception_seal', navicue_type_name: 'The Perception Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'phenomenologist_perception_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Perception Seal', _lab_subtitle: 'Phenomenologist × Meta-Awareness', _lab_signature: 'phenomenologist_perception_seal' },

  // ════════════════���══════════════════════════════════════════════
  // ACT 16 — THE ALCHEMIST II COLLECTION (The Transmutation Collection)
  // "Lead into Gold. Pain into Power."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__alchemistii__anger_forge', navicue_type_name: 'The Anger Forge', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'alchemistii_anger_forge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Anger Forge', _lab_subtitle: 'Alchemist II × Sublimation', _lab_signature: 'alchemistii_anger_forge' },
  { navicue_type_id: 'lab__alchemistii__grief_garden', navicue_type_name: 'The Grief Garden', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'alchemistii_grief_garden', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Grief Garden', _lab_subtitle: 'Alchemist II × Post-Traumatic Growth', _lab_signature: 'alchemistii_grief_garden' },
  { navicue_type_id: 'lab__alchemistii__fear_fuel', navicue_type_name: 'The Fear Fuel', form: 'Practice', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'alchemistii_fear_fuel', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fear Fuel', _lab_subtitle: 'Alchemist II × Arousal Reappraisal', _lab_signature: 'alchemistii_fear_fuel' },
  { navicue_type_id: 'lab__alchemistii__envy_map', navicue_type_name: 'The Envy Map', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'alchemistii_envy_map', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Envy Map', _lab_subtitle: 'Alchemist II × Projection Integration', _lab_signature: 'alchemistii_envy_map' },
  { navicue_type_id: 'lab__alchemistii__boredom_portal', navicue_type_name: 'The Boredom Portal', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'alchemistii_boredom_portal', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Boredom Portal', _lab_subtitle: 'Alchemist II × Default Mode Network', _lab_signature: 'alchemistii_boredom_portal' },
  { navicue_type_id: 'lab__alchemistii__anxiety_anchor', navicue_type_name: 'The Anxiety Anchor', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'alchemistii_anxiety_anchor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Anxiety Anchor', _lab_subtitle: 'Alchemist II × Eustress Conversion', _lab_signature: 'alchemistii_anxiety_anchor' },
  { navicue_type_id: 'lab__alchemistii__regret_compost', navicue_type_name: 'The Regret Compost', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'alchemistii_regret_compost', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Regret Compost', _lab_subtitle: 'Alchemist II × Counterfactual Thinking', _lab_signature: 'alchemistii_regret_compost' },
  { navicue_type_id: 'lab__alchemistii__shame_solvent', navicue_type_name: 'The Shame Solvent', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'alchemistii_shame_solvent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shame Solvent', _lab_subtitle: 'Alchemist II × Social Safety Buffering', _lab_signature: 'alchemistii_shame_solvent' },
  { navicue_type_id: 'lab__alchemistii__rejection_ricochet', navicue_type_name: 'The Rejection Ricochet', form: 'Practice', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'alchemistii_rejection_ricochet', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rejection Ricochet', _lab_subtitle: 'Alchemist II × Reactance Theory', _lab_signature: 'alchemistii_rejection_ricochet' },
  { navicue_type_id: 'lab__alchemistii__alchemy_seal', navicue_type_name: 'The Alchemy Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'alchemistii_alchemy_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Alchemy Seal', _lab_subtitle: 'Alchemist II × Emotional Granularity', _lab_signature: 'alchemistii_alchemy_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 17 — THE SERVANT LEADER COLLECTION (The Power Collection)
  // "To lead is to serve."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__servantleader__ego_check', navicue_type_name: 'The Ego Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'servantleader_ego_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ego Check', _lab_subtitle: 'Servant Leader × Intellectual Humility', _lab_signature: 'servantleader_ego_check' },
  { navicue_type_id: 'lab__servantleader__power_transfer', navicue_type_name: 'The Power Transfer', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'servantleader_power_transfer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Power Transfer', _lab_subtitle: 'Servant Leader × Trust Dynamics', _lab_signature: 'servantleader_power_transfer' },
  { navicue_type_id: 'lab__servantleader__silence_of_command', navicue_type_name: 'The Silence of Command', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'servantleader_silence_of_command', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silence of Command', _lab_subtitle: 'Servant Leader × Status Signaling', _lab_signature: 'servantleader_silence_of_command' },
  { navicue_type_id: 'lab__servantleader__praise_laser', navicue_type_name: 'The Praise Laser', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'servantleader_praise_laser', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Praise Laser', _lab_subtitle: 'Servant Leader × Positive Reinforcement', _lab_signature: 'servantleader_praise_laser' },
  { navicue_type_id: 'lab__servantleader__responsibility_take', navicue_type_name: 'The Responsibility Take', form: 'Practice', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'servantleader_responsibility_take', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Responsibility Take', _lab_subtitle: 'Servant Leader × Locus of Control', _lab_signature: 'servantleader_responsibility_take' },
  { navicue_type_id: 'lab__servantleader__vision_cast', navicue_type_name: 'The Vision Cast', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'servantleader_vision_cast', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vision Cast', _lab_subtitle: 'Servant Leader × Shared Intentionality', _lab_signature: 'servantleader_vision_cast' },
  { navicue_type_id: 'lab__servantleader__servant_bow', navicue_type_name: 'The Servant Bow', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'servantleader_servant_bow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Servant Bow', _lab_subtitle: 'Servant Leader × Elevation', _lab_signature: 'servantleader_servant_bow' },
  { navicue_type_id: 'lab__servantleader__conflict_dissolve', navicue_type_name: 'The Conflict Dissolve', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'servantleader_conflict_dissolve', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Conflict Dissolve', _lab_subtitle: 'Servant Leader × Conflict Transformation', _lab_signature: 'servantleader_conflict_dissolve' },
  { navicue_type_id: 'lab__servantleader__quiet_mentor', navicue_type_name: 'The Quiet Mentor', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'servantleader_quiet_mentor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Quiet Mentor', _lab_subtitle: 'Servant Leader × Autonomy Support', _lab_signature: 'servantleader_quiet_mentor' },
  { navicue_type_id: 'lab__servantleader__leader_seal', navicue_type_name: "The Leader's Seal", form: 'Identity Koan', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'servantleader_leader_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: "The Leader's Seal", _lab_subtitle: 'Servant Leader × Self-Sacrifice Signal', _lab_signature: 'servantleader_leader_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 18 — THE OMEGA POINT (The Convergence Collection)
  // "Everything that rises must converge."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__omegapoint__dot_connector', navicue_type_name: 'The Dot Connector', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'omegapoint_dot_connector', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dot Connector', _lab_subtitle: 'Omega Point × Integrative Complexity', _lab_signature: 'omegapoint_dot_connector' },
  { navicue_type_id: 'lab__omegapoint__binary_breaker', navicue_type_name: 'The Binary Breaker', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'omegapoint_binary_breaker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Binary Breaker', _lab_subtitle: 'Omega Point × Dialectical Thinking', _lab_signature: 'omegapoint_binary_breaker' },
  { navicue_type_id: 'lab__omegapoint__return_to_zero', navicue_type_name: 'The Return to Zero', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'omegapoint_return_to_zero', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Return to Zero', _lab_subtitle: 'Omega Point × Shoshin', _lab_signature: 'omegapoint_return_to_zero' },
  { navicue_type_id: 'lab__omegapoint__synthesis', navicue_type_name: 'The Synthesis', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'omegapoint_synthesis', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Synthesis', _lab_subtitle: 'Omega Point × Cognitive Resolution', _lab_signature: 'omegapoint_synthesis' },
  { navicue_type_id: 'lab__omegapoint__system_view', navicue_type_name: 'The System View', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'omegapoint_system_view', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The System View', _lab_subtitle: 'Omega Point × Systems Thinking', _lab_signature: 'omegapoint_system_view' },
  { navicue_type_id: 'lab__omegapoint__paradox_hold', navicue_type_name: 'The Paradox Hold', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'omegapoint_paradox_hold', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Paradox Hold', _lab_subtitle: 'Omega Point × Emotional Complexity', _lab_signature: 'omegapoint_paradox_hold' },
  { navicue_type_id: 'lab__omegapoint__pattern_match', navicue_type_name: 'The Pattern Match', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'omegapoint_pattern_match', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pattern Match', _lab_subtitle: 'Omega Point × Fractal Fluency', _lab_signature: 'omegapoint_pattern_match' },
  { navicue_type_id: 'lab__omegapoint__fourth_wall', navicue_type_name: 'The Fourth Wall', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'omegapoint_fourth_wall', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fourth Wall', _lab_subtitle: 'Omega Point × Meta-Cognition', _lab_signature: 'omegapoint_fourth_wall' },
  { navicue_type_id: 'lab__omegapoint__omega_pulse', navicue_type_name: 'The Omega Pulse', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'omegapoint_omega_pulse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Omega Pulse', _lab_subtitle: 'Omega Point × Self-Actualization', _lab_signature: 'omegapoint_omega_pulse' },
  { navicue_type_id: 'lab__omegapoint__convergence_seal', navicue_type_name: 'The Convergence Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'omegapoint_convergence_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Convergence Seal', _lab_subtitle: 'Omega Point × Coherence', _lab_signature: 'omegapoint_convergence_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 19 — THE SOURCE (The God Mode Collection)
  // "You are the universe playing hide and seek."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__source__i_am', navicue_type_name: 'The I AM', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'source_i_am', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The I AM', _lab_subtitle: 'Source × Ontological Self-Affirmation', _lab_signature: 'source_i_am' },
  { navicue_type_id: 'lab__source__stardust_check', navicue_type_name: 'The Stardust Check', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'source_stardust_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Stardust Check', _lab_subtitle: 'Source × Cosmic Perspective', _lab_signature: 'source_stardust_check' },
  { navicue_type_id: 'lab__source__final_breath', navicue_type_name: 'The Final Breath', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'source_final_breath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Final Breath', _lab_subtitle: 'Source × Transcendence', _lab_signature: 'source_final_breath' },
  { navicue_type_id: 'lab__source__unity', navicue_type_name: 'The Unity', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'source_unity', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Unity', _lab_subtitle: 'Source × Non-Dual Awareness', _lab_signature: 'source_unity' },
  { navicue_type_id: 'lab__source__infinite_loop', navicue_type_name: 'The Infinite Loop', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'source_infinite_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Infinite Loop', _lab_subtitle: 'Source × Cyclical Time', _lab_signature: 'source_infinite_loop' },
  { navicue_type_id: 'lab__source__awakening', navicue_type_name: 'The Awakening', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'source_awakening', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Awakening', _lab_subtitle: 'Source × Meta-Cognitive Insight', _lab_signature: 'source_awakening' },
  { navicue_type_id: 'lab__source__void', navicue_type_name: 'The Void', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'source_void', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Void', _lab_subtitle: 'Source × Sensory Deprivation', _lab_signature: 'source_void' },
  { navicue_type_id: 'lab__source__light_body', navicue_type_name: 'The Light Body', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'source_light_body', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Light Body', _lab_subtitle: 'Source × Visualization', _lab_signature: 'source_light_body' },
  { navicue_type_id: 'lab__source__universal_hum', navicue_type_name: 'The Universal Hum', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'source_universal_hum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Universal Hum', _lab_subtitle: 'Source × Vibrational Entrainment', _lab_signature: 'source_universal_hum' },
  { navicue_type_id: 'lab__source__source_seal', navicue_type_name: 'The Source Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'source_source_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Source Seal', _lab_subtitle: 'Source × Integration', _lab_signature: 'source_source_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 20 — THE STOIC (The Fortress Collection)
  // "The world breaks everyone. Afterward, some are strong at the broken places."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__stoic__citadel_visualization', navicue_type_name: 'The Citadel Visualization', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'stoic_citadel_visualization', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Citadel Visualization', _lab_subtitle: 'Stoic × Mental Shielding', _lab_signature: 'stoic_citadel_visualization' },
  { navicue_type_id: 'lab__stoic__voluntary_discomfort', navicue_type_name: 'The Voluntary Discomfort', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'stoic_voluntary_discomfort', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Voluntary Discomfort', _lab_subtitle: 'Stoic × Hormesis', _lab_signature: 'stoic_voluntary_discomfort' },
  { navicue_type_id: 'lab__stoic__view_from_above', navicue_type_name: 'The View from Above', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stoic_view_from_above', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The View from Above', _lab_subtitle: 'Stoic × Self-Distancing', _lab_signature: 'stoic_view_from_above' },
  { navicue_type_id: 'lab__stoic__negative_visualization', navicue_type_name: 'The Negative Visualization', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'stoic_negative_visualization', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Negative Visualization', _lab_subtitle: 'Stoic × Stress Inoculation', _lab_signature: 'stoic_negative_visualization' },
  { navicue_type_id: 'lab__stoic__control_dichotomy', navicue_type_name: 'The Control Dichotomy', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stoic_control_dichotomy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Control Dichotomy', _lab_subtitle: 'Stoic × Locus of Control', _lab_signature: 'stoic_control_dichotomy' },
  { navicue_type_id: 'lab__stoic__obstacle_flip', navicue_type_name: 'The Obstacle Flip', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'stoic_obstacle_flip', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Obstacle Flip', _lab_subtitle: 'Stoic × Cognitive Reframing', _lab_signature: 'stoic_obstacle_flip' },
  { navicue_type_id: 'lab__stoic__memento_mori', navicue_type_name: 'The Memento Mori', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stoic_memento_mori', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Memento Mori', _lab_subtitle: 'Stoic × Terror Management', _lab_signature: 'stoic_memento_mori' },
  { navicue_type_id: 'lab__stoic__inner_citadel', navicue_type_name: 'The Inner Citadel', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'stoic_inner_citadel', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inner Citadel', _lab_subtitle: 'Stoic × Stability Priming', _lab_signature: 'stoic_inner_citadel' },
  { navicue_type_id: 'lab__stoic__amor_fati', navicue_type_name: 'The Amor Fati', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'stoic_amor_fati', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Amor Fati', _lab_subtitle: 'Stoic × Radical Acceptance', _lab_signature: 'stoic_amor_fati' },
  { navicue_type_id: 'lab__stoic__stoic_seal', navicue_type_name: 'The Stoic Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'stoic_stoic_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Stoic Seal', _lab_subtitle: 'Stoic × Self-Efficacy', _lab_signature: 'stoic_stoic_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 21 — THE LOVER (The Intimacy Collection)
  // "To be known is to be loved."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__lover__armor_drop', navicue_type_name: 'The Armor Drop', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_armor_drop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Armor Drop', _lab_subtitle: 'Lover × Vagal Brake Release', _lab_signature: 'lover_armor_drop' },
  { navicue_type_id: 'lab__lover__30_second_gaze', navicue_type_name: 'The 30-Second Gaze', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_30_second_gaze', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The 30-Second Gaze', _lab_subtitle: 'Lover × Limbic Resonance', _lab_signature: 'lover_30_second_gaze' },
  { navicue_type_id: 'lab__lover__desire_audit', navicue_type_name: 'The Desire Audit', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'believing', magic_signature: 'lover_desire_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Desire Audit', _lab_subtitle: 'Lover × Approach Motivation', _lab_signature: 'lover_desire_audit' },
  { navicue_type_id: 'lab__lover__sacred_touch', navicue_type_name: 'The Sacred Touch', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_sacred_touch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sacred Touch', _lab_subtitle: 'Lover × C-Tactile Afferents', _lab_signature: 'lover_sacred_touch' },
  { navicue_type_id: 'lab__lover__listening_ear', navicue_type_name: 'The Listening Ear', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_listening_ear', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Listening Ear', _lab_subtitle: 'Lover × Active Constructive Responding', _lab_signature: 'lover_listening_ear' },
  { navicue_type_id: 'lab__lover__jealousy_transmute', navicue_type_name: 'The Jealousy Transmute', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'lover_jealousy_transmute', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Jealousy Transmute', _lab_subtitle: 'Lover × Projection Integration', _lab_signature: 'lover_jealousy_transmute' },
  { navicue_type_id: 'lab__lover__secret_share', navicue_type_name: 'The Secret Share', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_secret_share', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Secret Share', _lab_subtitle: 'Lover × Shame Resilience', _lab_signature: 'lover_secret_share' },
  { navicue_type_id: 'lab__lover__sex_spirit_bridge', navicue_type_name: 'The Sex/Spirit Bridge', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_sex_spirit_bridge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sex/Spirit Bridge', _lab_subtitle: 'Lover × Self-Expansion Theory', _lab_signature: 'lover_sex_spirit_bridge' },
  { navicue_type_id: 'lab__lover__partner_breath', navicue_type_name: 'The Partner Breath', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_partner_breath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Partner Breath', _lab_subtitle: 'Lover × Bio-Behavioral Synchrony', _lab_signature: 'lover_partner_breath' },
  { navicue_type_id: 'lab__lover__union_seal', navicue_type_name: 'The Union Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'lover_union_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Union Seal', _lab_subtitle: 'Lover × Interdependence', _lab_signature: 'lover_union_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 22 — THE ATHLETE (The Vitality Collection)
  // "The body is the temple, not the garage."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__athlete__oxygen_flood', navicue_type_name: 'The Oxygen Flood', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_oxygen_flood', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Oxygen Flood', _lab_subtitle: 'Athlete × Respiratory Alkalosis', _lab_signature: 'athlete_oxygen_flood' },
  { navicue_type_id: 'lab__athlete__fascia_release', navicue_type_name: 'The Fascia Release', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_fascia_release', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fascia Release', _lab_subtitle: 'Athlete × Progressive Muscle Relaxation', _lab_signature: 'athlete_fascia_release' },
  { navicue_type_id: 'lab__athlete__movement_snack', navicue_type_name: 'The Movement Snack', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_movement_snack', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Movement Snack', _lab_subtitle: 'Athlete × Neurogenesis', _lab_signature: 'athlete_movement_snack' },
  { navicue_type_id: 'lab__athlete__sleep_gate', navicue_type_name: 'The Sleep Gate', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_sleep_gate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sleep Gate', _lab_subtitle: 'Athlete × Glymphatic Clearance', _lab_signature: 'athlete_sleep_gate' },
  { navicue_type_id: 'lab__athlete__cold_shock', navicue_type_name: 'The Cold Shock', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_cold_shock', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cold Shock', _lab_subtitle: 'Athlete × Mammalian Dive Reflex', _lab_signature: 'athlete_cold_shock' },
  { navicue_type_id: 'lab__athlete__fuel_check', navicue_type_name: 'The Fuel Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'athlete_fuel_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fuel Check', _lab_subtitle: 'Athlete × Metabolic Regulation', _lab_signature: 'athlete_fuel_check' },
  { navicue_type_id: 'lab__athlete__posture_reset', navicue_type_name: 'The Posture Reset', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_posture_reset', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Posture Reset', _lab_subtitle: 'Athlete × Embodied Cognition', _lab_signature: 'athlete_posture_reset' },
  { navicue_type_id: 'lab__athlete__pain_cave', navicue_type_name: 'The Pain Cave', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_pain_cave', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pain Cave', _lab_subtitle: 'Athlete × Central Governor Theory', _lab_signature: 'athlete_pain_cave' },
  { navicue_type_id: 'lab__athlete__heart_coherence', navicue_type_name: 'The Heart Coherence', form: 'Practice', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_heart_coherence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Heart Coherence', _lab_subtitle: 'Athlete × Heart Rate Variability', _lab_signature: 'athlete_heart_coherence' },
  { navicue_type_id: 'lab__athlete__vitality_seal', navicue_type_name: 'The Vitality Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'athlete_vitality_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Vitality Seal', _lab_subtitle: 'Athlete × Interoceptive Trust', _lab_signature: 'athlete_vitality_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 23 — THE STRATEGIST (The Wealth Collection)
  // "Money is just energy. Master the flow."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__strategist__value_exchange', navicue_type_name: 'The Value Exchange', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_value_exchange', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Value Exchange', _lab_subtitle: 'Strategist × Self-Determination Theory', _lab_signature: 'strategist_value_exchange' },
  { navicue_type_id: 'lab__strategist__essentialism_filter', navicue_type_name: 'The Essentialism Filter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_essentialism_filter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Essentialism Filter', _lab_subtitle: 'Strategist × Cognitive Load Theory', _lab_signature: 'strategist_essentialism_filter' },
  { navicue_type_id: 'lab__strategist__compound_interest', navicue_type_name: 'The Compound Interest', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_compound_interest', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compound Interest', _lab_subtitle: 'Strategist × Delayed Gratification', _lab_signature: 'strategist_compound_interest' },
  { navicue_type_id: 'lab__strategist__deep_work_bunker', navicue_type_name: 'The Deep Work Bunker', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_deep_work_bunker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deep Work Bunker', _lab_subtitle: 'Strategist × Flow State Dynamics', _lab_signature: 'strategist_deep_work_bunker' },
  { navicue_type_id: 'lab__strategist__negotiation_pause', navicue_type_name: 'The Negotiation Pause', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_negotiation_pause', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Negotiation Pause', _lab_subtitle: 'Strategist × Social Pressure Regulation', _lab_signature: 'strategist_negotiation_pause' },
  { navicue_type_id: 'lab__strategist__abundance_scan', navicue_type_name: 'The Abundance Scan', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_abundance_scan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Abundance Scan', _lab_subtitle: 'Strategist × Asset-Based Thinking', _lab_signature: 'strategist_abundance_scan' },
  { navicue_type_id: 'lab__strategist__leverage_lever', navicue_type_name: 'The Leverage Lever', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_leverage_lever', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Leverage Lever', _lab_subtitle: 'Strategist × Metacognition', _lab_signature: 'strategist_leverage_lever' },
  { navicue_type_id: 'lab__strategist__specific_knowledge', navicue_type_name: 'The Specific Knowledge', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_specific_knowledge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Specific Knowledge', _lab_subtitle: 'Strategist × Signature Strengths', _lab_signature: 'strategist_specific_knowledge' },
  { navicue_type_id: 'lab__strategist__permissionless_build', navicue_type_name: 'The Permissionless Build', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_permissionless_build', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Permissionless Build', _lab_subtitle: 'Strategist × Internal Locus of Control', _lab_signature: 'strategist_permissionless_build' },
  { navicue_type_id: 'lab__strategist__wealth_seal', navicue_type_name: 'The Wealth Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'strategist_wealth_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Wealth Seal', _lab_subtitle: 'Strategist × Financial Well-being', _lab_signature: 'strategist_wealth_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 24 — THE WILDING (The Primal Collection)
  // "You are an animal. Act like one."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__wilding__cold_switch', navicue_type_name: 'The Cold Switch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wilding_cold_switch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cold Switch', _lab_subtitle: 'Wilding × Mammalian Dive Reflex', _lab_signature: 'wilding_cold_switch' },
  { navicue_type_id: 'lab__wilding__fire_watch', navicue_type_name: 'The Fire Watch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wilding_fire_watch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fire Watch', _lab_subtitle: 'Wilding × Evolutionary Fascination', _lab_signature: 'wilding_fire_watch' },
  { navicue_type_id: 'lab__wilding__panoramic_soften', navicue_type_name: 'The Panoramic Soften', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wilding_panoramic_soften', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Panoramic Soften', _lab_subtitle: 'Wilding × Peripheral Vision', _lab_signature: 'wilding_panoramic_soften' },
  { navicue_type_id: 'lab__wilding__terpene_inhale', navicue_type_name: 'The Terpene Inhale', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wilding_terpene_inhale', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Terpene Inhale', _lab_subtitle: 'Wilding × Phytoncides', _lab_signature: 'wilding_terpene_inhale' },
  { navicue_type_id: 'lab__wilding__lunar_pull', navicue_type_name: 'The Lunar Pull', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wilding_lunar_pull', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lunar Pull', _lab_subtitle: 'Wilding × Cyclical Biology', _lab_signature: 'wilding_lunar_pull' },
  { navicue_type_id: 'lab__wilding__dark_anchor', navicue_type_name: 'The Dark Anchor', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wilding_dark_anchor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dark Anchor', _lab_subtitle: 'Wilding × Melatonin Suppression', _lab_signature: 'wilding_dark_anchor' },
  { navicue_type_id: 'lab__wilding__barefoot_step', navicue_type_name: 'The Barefoot Step', form: 'Practice', intent: 'Integrate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'wilding_barefoot_step', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Barefoot Step', _lab_subtitle: 'Wilding × Grounding Reflex', _lab_signature: 'wilding_barefoot_step' },
  { navicue_type_id: 'lab__wilding__storm_breathe', navicue_type_name: 'The Storm Breathe', form: 'Practice', intent: 'Regulate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'wilding_storm_breathe', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Storm Breathe', _lab_subtitle: 'Wilding × Atmospheric Pressure', _lab_signature: 'wilding_storm_breathe' },
  { navicue_type_id: 'lab__wilding__feral_howl', navicue_type_name: 'The Feral Howl', form: 'Practice', intent: 'Activate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'wilding_feral_howl', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Feral Howl', _lab_subtitle: 'Wilding × Primal Vocalization', _lab_signature: 'wilding_feral_howl' },
  { navicue_type_id: 'lab__wilding__wild_seal', navicue_type_name: 'The Wild Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wilding_wild_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Wild Seal', _lab_subtitle: 'Wilding × Biophilia Hypothesis', _lab_signature: 'wilding_wild_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 25 — THE GUARDIAN (The Parenting/Inner Child Collection)
  // "Be the parent you needed."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__guardian__big_feeling', navicue_type_name: 'The Big Feeling', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'guardian_big_feeling', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Big Feeling', _lab_subtitle: 'Guardian × Name It to Tame It', _lab_signature: 'guardian_big_feeling' },
  { navicue_type_id: 'lab__guardian__co_regulation_breath', navicue_type_name: 'The Co-Regulation Breath', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'guardian_co_regulation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Co-Regulation Breath', _lab_subtitle: 'Guardian × Mirror Neurons', _lab_signature: 'guardian_co_regulation' },
  { navicue_type_id: 'lab__guardian__good_enough', navicue_type_name: 'The Good Enough Standard', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'guardian_good_enough', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Good Enough" Standard', _lab_subtitle: 'Guardian × Winnicott\'s Theory', _lab_signature: 'guardian_good_enough' },
  { navicue_type_id: 'lab__guardian__repair_ritual', navicue_type_name: 'The Repair Ritual', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'guardian_repair_ritual', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Repair Ritual', _lab_subtitle: 'Guardian × Rupture and Repair', _lab_signature: 'guardian_repair_ritual' },
  { navicue_type_id: 'lab__guardian__transition_buffer', navicue_type_name: 'The Transition Buffer', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'guardian_transition_buffer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Transition Buffer', _lab_subtitle: 'Guardian × Executive Function Support', _lab_signature: 'guardian_transition_buffer' },
  { navicue_type_id: 'lab__guardian__boundary_hug', navicue_type_name: 'The Boundary Hug', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'guardian_boundary_hug', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Boundary Hug', _lab_subtitle: 'Guardian × Containment', _lab_signature: 'guardian_boundary_hug' },
  { navicue_type_id: 'lab__guardian__safe_container', navicue_type_name: 'The Safe Container', form: 'Practice', intent: 'Regulate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'guardian_safe_container', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Safe Container', _lab_subtitle: 'Guardian × Holding Environment', _lab_signature: 'guardian_safe_container' },
  { navicue_type_id: 'lab__guardian__gentle_no', navicue_type_name: 'The Gentle No', form: 'Practice', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'guardian_gentle_no', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gentle No', _lab_subtitle: 'Guardian × Boundary Setting', _lab_signature: 'guardian_gentle_no' },
  { navicue_type_id: 'lab__guardian__bedtime_blessing', navicue_type_name: 'The Bedtime Blessing', form: 'Practice', intent: 'Regulate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'guardian_bedtime_blessing', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Bedtime Blessing', _lab_subtitle: 'Guardian × Sleep Ritual', _lab_signature: 'guardian_bedtime_blessing' },
  { navicue_type_id: 'lab__guardian__guardian_seal', navicue_type_name: 'The Guardian Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'guardian_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Guardian Seal', _lab_subtitle: 'Guardian × Secure Attachment Priming', _lab_signature: 'guardian_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 26 — THE FUTURIST (The Tech-Adaptation Collection)
  // "Master the machine, or it masters you."
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__futurist__notification_nuke', navicue_type_name: 'The Notification Nuke', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_notification_nuke', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Notification Nuke', _lab_subtitle: 'Futurist × Attentional Sovereignty', _lab_signature: 'futurist_notification_nuke' },
  { navicue_type_id: 'lab__futurist__input_diet', navicue_type_name: 'The Input Diet', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_input_diet', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Input Diet', _lab_subtitle: 'Futurist × Information Processing Theory', _lab_signature: 'futurist_input_diet' },
  { navicue_type_id: 'lab__futurist__human_handshake', navicue_type_name: 'The Human Handshake', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_human_handshake', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Human Handshake', _lab_subtitle: 'Futurist × Prosody Perception', _lab_signature: 'futurist_human_handshake' },
  { navicue_type_id: 'lab__futurist__doomscroll_brake', navicue_type_name: 'The Doomscroll Brake', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_doomscroll_brake', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Doomscroll Brake', _lab_subtitle: 'Futurist × Intermittent Variable Reward', _lab_signature: 'futurist_doomscroll_brake' },
  { navicue_type_id: 'lab__futurist__analog_switch', navicue_type_name: 'The Analog Switch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_analog_switch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Analog Switch', _lab_subtitle: 'Futurist × Haptic Encoding', _lab_signature: 'futurist_analog_switch' },
  { navicue_type_id: 'lab__futurist__deep_read', navicue_type_name: 'The Deep Read', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_deep_read', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deep Read', _lab_subtitle: 'Futurist × Linear vs Tabular Reading', _lab_signature: 'futurist_deep_read' },
  { navicue_type_id: 'lab__futurist__phantom_check', navicue_type_name: 'The Phantom Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_phantom_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phantom Check', _lab_subtitle: 'Futurist × Signal Detection Theory', _lab_signature: 'futurist_phantom_check' },
  { navicue_type_id: 'lab__futurist__mono_task', navicue_type_name: 'The Mono-Task', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_mono_task', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mono-Task', _lab_subtitle: 'Futurist × Switch Cost Effect', _lab_signature: 'futurist_mono_task' },
  { navicue_type_id: 'lab__futurist__comparison_blocker', navicue_type_name: 'The Comparison Blocker', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_comparison_blocker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Comparison Blocker', _lab_subtitle: 'Futurist × Social Comparison Theory', _lab_signature: 'futurist_comparison_blocker' },
  { navicue_type_id: 'lab__futurist__disconnect_seal', navicue_type_name: 'The Disconnect Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futurist_disconnect_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Disconnect Seal', _lab_subtitle: 'Futurist × Psychological Detachment', _lab_signature: 'futurist_disconnect_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 27 — THE MYSTIC (The Quantum Collection) [10]
  // Deep purple / cosmic indigo / starfield black
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__mystic__no_self', navicue_type_name: 'The No-Self', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_no_self', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The No-Self', _lab_subtitle: 'Mystic × Self-Referential Deactivation', _lab_signature: 'mystic_no_self' },
  { navicue_type_id: 'lab__mystic__now_point', navicue_type_name: 'The Now Point', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_now_point', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Now Point', _lab_subtitle: 'Mystic × Present Moment Awareness', _lab_signature: 'mystic_now_point' },
  { navicue_type_id: 'lab__mystic__deathbed', navicue_type_name: 'The Deathbed', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_deathbed', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Deathbed', _lab_subtitle: 'Mystic × Terror Management', _lab_signature: 'mystic_deathbed' },
  { navicue_type_id: 'lab__mystic__entanglement_check', navicue_type_name: 'The Entanglement Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_entanglement_check', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Entanglement Check', _lab_subtitle: 'Mystic × Non-Locality', _lab_signature: 'mystic_entanglement_check' },
  { navicue_type_id: 'lab__mystic__wave_collapse', navicue_type_name: 'The Wave Collapse', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_wave_collapse', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Wave Collapse', _lab_subtitle: 'Mystic × The Observer Effect', _lab_signature: 'mystic_wave_collapse' },
  { navicue_type_id: 'lab__mystic__hologram', navicue_type_name: 'The Hologram', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_hologram', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Hologram', _lab_subtitle: 'Mystic × Fractal Fluency', _lab_signature: 'mystic_hologram' },
  { navicue_type_id: 'lab__mystic__frequency_tune', navicue_type_name: 'The Frequency Tune', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_frequency_tune', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Frequency Tune', _lab_subtitle: 'Mystic × HRV Coherence', _lab_signature: 'mystic_frequency_tune' },
  { navicue_type_id: 'lab__mystic__maya_veil', navicue_type_name: 'The Maya Veil', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_maya_veil', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Maya Veil', _lab_subtitle: 'Mystic × De-Reification', _lab_signature: 'mystic_maya_veil' },
  { navicue_type_id: 'lab__mystic__universal_hum', navicue_type_name: 'The Universal Hum', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_universal_hum', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Universal Hum', _lab_subtitle: 'Mystic × Vagal Toning', _lab_signature: 'mystic_universal_hum' },
  { navicue_type_id: 'lab__mystic__quantum_seal', navicue_type_name: 'The Quantum Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mystic_quantum_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Quantum Seal', _lab_subtitle: 'Mystic × Superposition of Self', _lab_signature: 'mystic_quantum_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 28 — THE INFINITE PLAYER (The Joy Collection) [10]
  // Warm white / playful green / wonder gold / laughter coral
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__infinite__cosmic_joke', navicue_type_name: 'The Cosmic Joke', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_cosmic_joke', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cosmic Joke', _lab_subtitle: 'Infinite × Facial Feedback Hypothesis', _lab_signature: 'infinite_cosmic_joke' },
  { navicue_type_id: 'lab__infinite__absurdity_check', navicue_type_name: 'The Absurdity Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_absurdity_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Absurdity Check', _lab_subtitle: 'Infinite × Humor as Coping', _lab_signature: 'infinite_absurdity_check' },
  { navicue_type_id: 'lab__infinite__game_reset', navicue_type_name: 'The Game Reset', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_game_reset', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Game Reset', _lab_subtitle: 'Infinite × Playfulness', _lab_signature: 'infinite_game_reset' },
  { navicue_type_id: 'lab__infinite__dance_break', navicue_type_name: 'The Dance Break', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_dance_break', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dance Break', _lab_subtitle: 'Infinite × Somatic Discharge', _lab_signature: 'infinite_dance_break' },
  { navicue_type_id: 'lab__infinite__beginners_mind', navicue_type_name: 'The Beginner\'s Mind', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_beginners_mind', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Beginner\'s Mind', _lab_subtitle: 'Infinite × Shoshin', _lab_signature: 'infinite_beginners_mind' },
  { navicue_type_id: 'lab__infinite__pure_yes', navicue_type_name: 'The Pure Yes', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_pure_yes', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pure Yes', _lab_subtitle: 'Infinite × Acceptance & Commitment', _lab_signature: 'infinite_pure_yes' },
  { navicue_type_id: 'lab__infinite__wonder_walk', navicue_type_name: 'The Wonder Walk', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_wonder_walk', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wonder Walk', _lab_subtitle: 'Infinite × Awe', _lab_signature: 'infinite_wonder_walk' },
  { navicue_type_id: 'lab__infinite__unplanned_hour', navicue_type_name: 'The Unplanned Hour', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_unplanned_hour', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Unplanned Hour', _lab_subtitle: 'Infinite × Non-Teleological Action', _lab_signature: 'infinite_unplanned_hour' },
  { navicue_type_id: 'lab__infinite__laugh_track', navicue_type_name: 'The Laugh Track', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_laugh_track', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Laugh Track', _lab_subtitle: 'Infinite × Ego-Deflation', _lab_signature: 'infinite_laugh_track' },
  { navicue_type_id: 'lab__infinite__infinite_seal', navicue_type_name: 'The Infinite Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'infinite_infinite_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Infinite Seal', _lab_subtitle: 'Infinite × Infinite Game Theory', _lab_signature: 'infinite_infinite_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ARC II — BENDING REALITY
  // ═══════════════════════════════════════════════════════════════
  // ACT 29 — THE REALITY BENDER (The Agency Collection) [10]
  // Liquid mercury / iridescent violet / warped glass
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__bender__reality_distortion', navicue_type_name: 'The Reality Distortion', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_reality_distortion', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Reality Distortion', _lab_subtitle: 'Bender × Social Constructionism', _lab_signature: 'bender_reality_distortion' },
  { navicue_type_id: 'lab__bender__timeline_jump', navicue_type_name: 'The Timeline Jump', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_timeline_jump', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Timeline Jump', _lab_subtitle: 'Bender × Trajectory Modification', _lab_signature: 'bender_timeline_jump' },
  { navicue_type_id: 'lab__bender__luck_surface', navicue_type_name: 'The Luck Surface', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_luck_surface', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Luck Surface', _lab_subtitle: 'Bender × Serendipity Engineering', _lab_signature: 'bender_luck_surface' },
  { navicue_type_id: 'lab__bender__atmosphere_engineer', navicue_type_name: 'The Atmosphere Engineer', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_atmosphere_engineer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Atmosphere Engineer', _lab_subtitle: 'Bender × Affective Presence', _lab_signature: 'bender_atmosphere_engineer' },
  { navicue_type_id: 'lab__bender__narrative_override', navicue_type_name: 'The Narrative Override', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_narrative_override', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Narrative Override', _lab_subtitle: 'Bender × Cognitive Restructuring', _lab_signature: 'bender_narrative_override' },
  { navicue_type_id: 'lab__bender__future_memory', navicue_type_name: 'The Future Memory', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_future_memory', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Memory', _lab_subtitle: 'Bender × Prospective Memory Encoding', _lab_signature: 'bender_future_memory' },
  { navicue_type_id: 'lab__bender__silence_weapon', navicue_type_name: 'The Silence as Weapon', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_silence_weapon', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silence as Weapon', _lab_subtitle: 'Bender × Status Signaling', _lab_signature: 'bender_silence_weapon' },
  { navicue_type_id: 'lab__bender__invisible_hand', navicue_type_name: 'The Invisible Hand', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_invisible_hand', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Invisible Hand', _lab_subtitle: 'Bender × Choice Architecture', _lab_signature: 'bender_invisible_hand' },
  { navicue_type_id: 'lab__bender__belief_bridge', navicue_type_name: 'The Belief Bridge', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_belief_bridge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Belief Bridge', _lab_subtitle: 'Bender × Perceptual Set', _lab_signature: 'bender_belief_bridge' },
  { navicue_type_id: 'lab__bender__bender_seal', navicue_type_name: 'The Bender\'s Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'bender_bender_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Bender\'s Seal', _lab_subtitle: 'Bender × High Agency', _lab_signature: 'bender_bender_seal' },

  // ══════════════════════════���════════════════════════════════════
  // ACT 30 — THE MAGNET (The Attraction Collection) [10]
  // Deep iron purple / attraction gold / magnetic void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__magnet__reverse_orbit', navicue_type_name: 'The Reverse Orbit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_reverse_orbit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Reverse Orbit', _lab_subtitle: 'Magnet × Reactance Theory', _lab_signature: 'magnet_reverse_orbit' },
  { navicue_type_id: 'lab__magnet__mystery_gap', navicue_type_name: 'The Mystery Gap', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_mystery_gap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mystery Gap', _lab_subtitle: 'Magnet × Zeigarnik Effect', _lab_signature: 'magnet_mystery_gap' },
  { navicue_type_id: 'lab__magnet__whisper_frequency', navicue_type_name: 'The Whisper Frequency', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_whisper_frequency', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Whisper Frequency', _lab_subtitle: 'Magnet × Vocal Prosody', _lab_signature: 'magnet_whisper_frequency' },
  { navicue_type_id: 'lab__magnet__velvet_rope', navicue_type_name: 'The Velvet Rope', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_velvet_rope', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Velvet Rope', _lab_subtitle: 'Magnet × Scarcity Principle', _lab_signature: 'magnet_velvet_rope' },
  { navicue_type_id: 'lab__magnet__specific_praise', navicue_type_name: 'The Specific Praise', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_specific_praise', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Specific Praise', _lab_subtitle: 'Magnet × Attribution Theory', _lab_signature: 'magnet_specific_praise' },
  { navicue_type_id: 'lab__magnet__warmth_competence', navicue_type_name: 'The Warmth/Competence Grid', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_warmth_competence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Warmth/Competence Grid', _lab_subtitle: 'Magnet × Stereotype Content Model', _lab_signature: 'magnet_warmth_competence' },
  { navicue_type_id: 'lab__magnet__lighthouse_mode', navicue_type_name: 'The Lighthouse Mode', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_lighthouse_mode', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lighthouse Mode', _lab_subtitle: 'Magnet × Signal Theory', _lab_signature: 'magnet_lighthouse_mode' },
  { navicue_type_id: 'lab__magnet__yes_and_spiral', navicue_type_name: 'The Yes And Spiral', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_yes_and_spiral', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Yes, And" Spiral', _lab_subtitle: 'Magnet × Improvisational Co-Creation', _lab_signature: 'magnet_yes_and_spiral' },
  { navicue_type_id: 'lab__magnet__detachment_power', navicue_type_name: 'The Detachment Power', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_detachment_power', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Detachment Power', _lab_subtitle: 'Magnet × Outcome Independence', _lab_signature: 'magnet_detachment_power' },
  { navicue_type_id: 'lab__magnet__magnet_seal', navicue_type_name: 'The Magnet Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnet_magnet_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Magnet Seal', _lab_subtitle: 'Magnet × Social Gravity', _lab_signature: 'magnet_magnet_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 31 — THE ORACLE (The Intuition Collection) [10]
  // Third-eye indigo / amber sight / shadow blue
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__oracle__pattern_before_pattern', navicue_type_name: 'The Pattern Before the Pattern', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_pattern_before_pattern', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pattern Before the Pattern', _lab_subtitle: 'Oracle × Thin-Slicing', _lab_signature: 'oracle_pattern_before_pattern' },
  { navicue_type_id: 'lab__oracle__body_compass', navicue_type_name: 'The Body Compass', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_body_compass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Body Compass', _lab_subtitle: 'Oracle × Somatic Marker Hypothesis', _lab_signature: 'oracle_body_compass' },
  { navicue_type_id: 'lab__oracle__first_three_seconds', navicue_type_name: 'The First Three Seconds', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_first_three_seconds', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The First Three Seconds', _lab_subtitle: 'Oracle × Rapid Cognition', _lab_signature: 'oracle_first_three_seconds' },
  { navicue_type_id: 'lab__oracle__information_fast', navicue_type_name: 'The Information Fast', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_information_fast', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Information Fast', _lab_subtitle: 'Oracle × Decision Fatigue', _lab_signature: 'oracle_information_fast' },
  { navicue_type_id: 'lab__oracle__signal_in_noise', navicue_type_name: 'The Signal in the Noise', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_signal_in_noise', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Signal in the Noise', _lab_subtitle: 'Oracle × Signal Detection Theory', _lab_signature: 'oracle_signal_in_noise' },
  { navicue_type_id: 'lab__oracle__danger_beautiful', navicue_type_name: 'The Danger Beautiful', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_danger_beautiful', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Danger Beautiful', _lab_subtitle: 'Oracle × Gift of Fear', _lab_signature: 'oracle_danger_beautiful' },
  { navicue_type_id: 'lab__oracle__question_upgrade', navicue_type_name: 'The Question Upgrade', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_question_upgrade', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Question Upgrade', _lab_subtitle: 'Oracle × Reframing', _lab_signature: 'oracle_question_upgrade' },
  { navicue_type_id: 'lab__oracle__pre_mortem', navicue_type_name: 'The Pre-Mortem', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_pre_mortem', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pre-Mortem', _lab_subtitle: 'Oracle × Prospective Hindsight', _lab_signature: 'oracle_pre_mortem' },
  { navicue_type_id: 'lab__oracle__contrarian_proof', navicue_type_name: 'The Contrarian Proof', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_contrarian_proof', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Contrarian Proof', _lab_subtitle: 'Oracle × Dialectical Thinking', _lab_signature: 'oracle_contrarian_proof' },
  { navicue_type_id: 'lab__oracle__oracle_seal', navicue_type_name: 'The Oracle Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'oracle_oracle_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Oracle Seal', _lab_subtitle: 'Oracle × Integrated Cognition', _lab_signature: 'oracle_oracle_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 32 — THE MAESTRO (The Performance Collection) [10]
  // Concert black / brass gold / stage dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__maestro__crescendo', navicue_type_name: 'The Crescendo', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_crescendo', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Crescendo', _lab_subtitle: 'Maestro × Dynamic Range', _lab_signature: 'maestro_crescendo' },
  { navicue_type_id: 'lab__maestro__pause_as_currency', navicue_type_name: 'The Pause as Currency', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_pause_as_currency', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pause as Currency', _lab_subtitle: 'Maestro × Expectation Violation', _lab_signature: 'maestro_pause_as_currency' },
  { navicue_type_id: 'lab__maestro__emotional_score', navicue_type_name: 'The Emotional Score', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_emotional_score', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Emotional Score', _lab_subtitle: 'Maestro × Affect Labeling', _lab_signature: 'maestro_emotional_score' },
  { navicue_type_id: 'lab__maestro__stage_presence', navicue_type_name: 'The Stage Presence', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_stage_presence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Stage Presence', _lab_subtitle: 'Maestro × Embodied Cognition', _lab_signature: 'maestro_stage_presence' },
  { navicue_type_id: 'lab__maestro__tempo_control', navicue_type_name: 'The Tempo Control', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_tempo_control', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tempo Control', _lab_subtitle: 'Maestro × Chronemics', _lab_signature: 'maestro_tempo_control' },
  { navicue_type_id: 'lab__maestro__mirror_match', navicue_type_name: 'The Mirror Match', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_mirror_match', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror Match', _lab_subtitle: 'Maestro × Limbic Resonance', _lab_signature: 'maestro_mirror_match' },
  { navicue_type_id: 'lab__maestro__callback', navicue_type_name: 'The Callback', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_callback', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Callback', _lab_subtitle: 'Maestro × Thematic Recurrence', _lab_signature: 'maestro_callback' },
  { navicue_type_id: 'lab__maestro__tension_arc', navicue_type_name: 'The Tension Arc', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_tension_arc', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tension Arc', _lab_subtitle: 'Maestro × Dramatic Structure', _lab_signature: 'maestro_tension_arc' },
  { navicue_type_id: 'lab__maestro__standing_ovation', navicue_type_name: 'The Standing Ovation', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_standing_ovation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Standing Ovation', _lab_subtitle: 'Maestro × Collective Resonance', _lab_signature: 'maestro_standing_ovation' },
  { navicue_type_id: 'lab__maestro__maestro_seal', navicue_type_name: 'The Maestro Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'maestro_maestro_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Maestro Seal', _lab_subtitle: 'Maestro × Convergent Control', _lab_signature: 'maestro_maestro_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 33 — THE SHAMAN (The Ritual Collection) [10]
  // Ochre earth / sage smoke / cave dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__shaman__ancestor_call', navicue_type_name: 'The Ancestor Call', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_ancestor_call', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ancestor Call', _lab_subtitle: 'Shaman × Ancestral Wisdom', _lab_signature: 'shaman_ancestor_call' },
  { navicue_type_id: 'lab__shaman__plant_medicine', navicue_type_name: 'The Plant Medicine', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_plant_medicine', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Plant Medicine', _lab_subtitle: 'Shaman × Mycorrhizal Networks', _lab_signature: 'shaman_plant_medicine' },
  { navicue_type_id: 'lab__shaman__drum_circle', navicue_type_name: 'The Drum Circle', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_drum_circle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Drum Circle', _lab_subtitle: 'Shaman × Rhythmic Entrainment', _lab_signature: 'shaman_drum_circle' },
  { navicue_type_id: 'lab__shaman__sacred_fire', navicue_type_name: 'The Sacred Fire', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_sacred_fire', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sacred Fire', _lab_subtitle: 'Shaman × Fire Ceremony', _lab_signature: 'shaman_sacred_fire' },
  { navicue_type_id: 'lab__shaman__bone_reading', navicue_type_name: 'The Bone Reading', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_bone_reading', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Bone Reading', _lab_subtitle: 'Shaman × Pattern Recognition', _lab_signature: 'shaman_bone_reading' },
  { navicue_type_id: 'lab__shaman__shadow_walk', navicue_type_name: 'The Shadow Walk', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_shadow_walk', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shadow Walk', _lab_subtitle: 'Shaman × Shadow Integration', _lab_signature: 'shaman_shadow_walk' },
  { navicue_type_id: 'lab__shaman__water_blessing', navicue_type_name: 'The Water Blessing', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_water_blessing', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Water Blessing', _lab_subtitle: 'Shaman × Acceptance & Flow', _lab_signature: 'shaman_water_blessing' },
  { navicue_type_id: 'lab__shaman__spirit_animal', navicue_type_name: 'The Spirit Animal', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_spirit_animal', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Spirit Animal', _lab_subtitle: 'Shaman × Archetypal Identity', _lab_signature: 'shaman_spirit_animal' },
  { navicue_type_id: 'lab__shaman__vision_quest', navicue_type_name: 'The Vision Quest', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_vision_quest', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vision Quest', _lab_subtitle: 'Shaman × Liminal Journey', _lab_signature: 'shaman_vision_quest' },
  { navicue_type_id: 'lab__shaman__shaman_seal', navicue_type_name: 'The Shaman Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shaman_shaman_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Shaman Seal', _lab_subtitle: 'Shaman × Medicine Wheel', _lab_signature: 'shaman_shaman_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 34 — THE STARGAZER (The Cosmic Collection) [10]
  // Deep space navy / nebula violet / cosmos void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__stargazer__north_star', navicue_type_name: 'The North Star', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_north_star', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The North Star', _lab_subtitle: 'Stargazer × Teleological Focus', _lab_signature: 'stargazer_north_star' },
  { navicue_type_id: 'lab__stargazer__orbit_check', navicue_type_name: 'The Orbit Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_orbit_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Orbit Check', _lab_subtitle: 'Stargazer × Non-Linear Dynamics', _lab_signature: 'stargazer_orbit_check' },
  { navicue_type_id: 'lab__stargazer__gravity_assist', navicue_type_name: 'The Gravity Assist', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_gravity_assist', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gravity Assist', _lab_subtitle: 'Stargazer × Aikido Strategy', _lab_signature: 'stargazer_gravity_assist' },
  { navicue_type_id: 'lab__stargazer__eclipse', navicue_type_name: 'The Eclipse', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_eclipse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Eclipse', _lab_subtitle: 'Stargazer × Emotional Permanence', _lab_signature: 'stargazer_eclipse' },
  { navicue_type_id: 'lab__stargazer__constellation', navicue_type_name: 'The Constellation', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_constellation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Constellation', _lab_subtitle: 'Stargazer × Gestalt Perception', _lab_signature: 'stargazer_constellation' },
  { navicue_type_id: 'lab__stargazer__event_horizon', navicue_type_name: 'The Event Horizon', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_event_horizon', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Event Horizon', _lab_subtitle: 'Stargazer × Commitment Devices', _lab_signature: 'stargazer_event_horizon' },
  { navicue_type_id: 'lab__stargazer__supernova', navicue_type_name: 'The Supernova', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_supernova', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Supernova', _lab_subtitle: 'Stargazer × Post-Traumatic Growth', _lab_signature: 'stargazer_supernova' },
  { navicue_type_id: 'lab__stargazer__dark_matter', navicue_type_name: 'The Dark Matter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_dark_matter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dark Matter', _lab_subtitle: 'Stargazer × Implicit Trust', _lab_signature: 'stargazer_dark_matter' },
  { navicue_type_id: 'lab__stargazer__light_speed', navicue_type_name: 'The Light Speed', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_light_speed', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Light Speed', _lab_subtitle: 'Stargazer × Time Density', _lab_signature: 'stargazer_light_speed' },
  { navicue_type_id: 'lab__stargazer__stargazer_seal', navicue_type_name: 'The Stargazer Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'stargazer_stargazer_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Stargazer Seal', _lab_subtitle: 'Stargazer × The Overview Effect', _lab_signature: 'stargazer_stargazer_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 35 — THE MYTH MAKER (The Narrative Collection) [10]
  // Ancient gold / parchment cream / manuscript void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__mythmaker__incantation', navicue_type_name: 'The Incantation', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_incantation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Incantation', _lab_subtitle: 'Myth Maker × Linguistic Determinism', _lab_signature: 'mythmaker_incantation' },
  { navicue_type_id: 'lab__mythmaker__retcon', navicue_type_name: 'The Retcon', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_retcon', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Retcon', _lab_subtitle: 'Myth Maker × Narrative Identity', _lab_signature: 'mythmaker_retcon' },
  { navicue_type_id: 'lab__mythmaker__heros_call', navicue_type_name: 'The Hero\u2019s Call', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_heros_call', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Hero\u2019s Call', _lab_subtitle: 'Myth Maker × Approach Motivation', _lab_signature: 'mythmaker_heros_call' },
  { navicue_type_id: 'lab__mythmaker__villains_mask', navicue_type_name: 'The Villain\u2019s Mask', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_villains_mask', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Villain\u2019s Mask', _lab_subtitle: 'Myth Maker × Perspective Taking', _lab_signature: 'mythmaker_villains_mask' },
  { navicue_type_id: 'lab__mythmaker__plot_twist', navicue_type_name: 'The Plot Twist', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_plot_twist', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Plot Twist', _lab_subtitle: 'Myth Maker × Cognitive Reappraisal', _lab_signature: 'mythmaker_plot_twist' },
  { navicue_type_id: 'lab__mythmaker__mentor_summon', navicue_type_name: 'The Mentor Summon', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_mentor_summon', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mentor Summon', _lab_subtitle: 'Myth Maker × Solomon\u2019s Paradox', _lab_signature: 'mythmaker_mentor_summon' },
  { navicue_type_id: 'lab__mythmaker__chekhovs_gun', navicue_type_name: 'The Chekhov\u2019s Gun', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_chekhovs_gun', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chekhov\u2019s Gun', _lab_subtitle: 'Myth Maker × Resource Utilization', _lab_signature: 'mythmaker_chekhovs_gun' },
  { navicue_type_id: 'lab__mythmaker__fourth_wall', navicue_type_name: 'The Fourth Wall', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_fourth_wall', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fourth Wall', _lab_subtitle: 'Myth Maker × Meta-Cognitive Detachment', _lab_signature: 'mythmaker_fourth_wall' },
  { navicue_type_id: 'lab__mythmaker__cliffhanger', navicue_type_name: 'The Cliffhanger', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_cliffhanger', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cliffhanger', _lab_subtitle: 'Myth Maker × Uncertainty Tolerance', _lab_signature: 'mythmaker_cliffhanger' },
  { navicue_type_id: 'lab__mythmaker__mythic_seal', navicue_type_name: 'The Mythic Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'mythmaker_mythic_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mythic Seal', _lab_subtitle: 'Myth Maker × Locus of Control', _lab_signature: 'mythmaker_mythic_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 36 — THE SHAPE SHIFTER (The Identity Collection) [10]
  // Chrome silver / iridescent shift / mercury void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__shapeshifter__mirror_shift', navicue_type_name: 'The Mirror Shift', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_mirror_shift', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror Shift', _lab_subtitle: 'Shape Shifter × Self-Complexity', _lab_signature: 'shapeshifter_mirror_shift' },
  { navicue_type_id: 'lab__shapeshifter__skin_shed', navicue_type_name: 'The Skin Shed', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_skin_shed', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Skin Shed', _lab_subtitle: 'Shape Shifter × Psychological Flexibility', _lab_signature: 'shapeshifter_skin_shed' },
  { navicue_type_id: 'lab__shapeshifter__camouflage', navicue_type_name: 'The Camouflage', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_camouflage', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Camouflage', _lab_subtitle: 'Shape Shifter × Contextual Identity', _lab_signature: 'shapeshifter_camouflage' },
  { navicue_type_id: 'lab__shapeshifter__metamorphosis', navicue_type_name: 'The Metamorphosis', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_metamorphosis', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Metamorphosis', _lab_subtitle: 'Shape Shifter × Liminal Identity', _lab_signature: 'shapeshifter_metamorphosis' },
  { navicue_type_id: 'lab__shapeshifter__doppelganger', navicue_type_name: 'The Doppelganger', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_doppelganger', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Doppelganger', _lab_subtitle: 'Shape Shifter × Shadow Integration', _lab_signature: 'shapeshifter_doppelganger' },
  { navicue_type_id: 'lab__shapeshifter__costume', navicue_type_name: 'The Costume Change', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_costume', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Costume Change', _lab_subtitle: 'Shape Shifter × Role Fluidity', _lab_signature: 'shapeshifter_costume' },
  { navicue_type_id: 'lab__shapeshifter__chimera', navicue_type_name: 'The Chimera', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_chimera', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chimera', _lab_subtitle: 'Shape Shifter × Dialectical Self', _lab_signature: 'shapeshifter_chimera' },
  { navicue_type_id: 'lab__shapeshifter__proteus', navicue_type_name: 'The Proteus', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_proteus', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Proteus', _lab_subtitle: 'Shape Shifter × Adaptive Identity', _lab_signature: 'shapeshifter_proteus' },
  { navicue_type_id: 'lab__shapeshifter__chrysalis', navicue_type_name: 'The Chrysalis', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_chrysalis', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chrysalis', _lab_subtitle: 'Shape Shifter × Frustration Tolerance', _lab_signature: 'shapeshifter_chrysalis' },
  { navicue_type_id: 'lab__shapeshifter__shifter_seal', navicue_type_name: 'The Shifter Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shapeshifter_shifter_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Shifter Seal', _lab_subtitle: 'Shape Shifter × Self-Complexity', _lab_signature: 'shapeshifter_shifter_seal' },

  // ═══���═══════════════════════════════════════════════════════════
  // ACT 37 — THE DREAM WALKER (The Unconscious Collection) [10]
  // Deep indigo / bioluminescent cyan / night void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__dreamwalker__lucid_entry', navicue_type_name: 'The Lucid Entry', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_lucid_entry', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lucid Entry', _lab_subtitle: 'Dream Walker × Lucid Awareness', _lab_signature: 'dreamwalker_lucid_entry' },
  { navicue_type_id: 'lab__dreamwalker__sleep_architect', navicue_type_name: 'The Sleep Architect', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_sleep_architect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sleep Architect', _lab_subtitle: 'Dream Walker × Dream Incubation', _lab_signature: 'dreamwalker_sleep_architect' },
  { navicue_type_id: 'lab__dreamwalker__night_terrain', navicue_type_name: 'The Night Terrain', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_night_terrain', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Night Terrain', _lab_subtitle: 'Dream Walker × Unconscious Landscape', _lab_signature: 'dreamwalker_night_terrain' },
  { navicue_type_id: 'lab__dreamwalker__sleep_paralysis', navicue_type_name: 'The Sleep Paralysis', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_sleep_paralysis', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sleep Paralysis', _lab_subtitle: 'Dream Walker × Mindful Awareness', _lab_signature: 'dreamwalker_sleep_paralysis' },
  { navicue_type_id: 'lab__dreamwalker__recurring_door', navicue_type_name: 'The Recurring Door', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_recurring_door', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Recurring Door', _lab_subtitle: 'Dream Walker × Recurring Dreams', _lab_signature: 'dreamwalker_recurring_door' },
  { navicue_type_id: 'lab__dreamwalker__dream_journal', navicue_type_name: 'The Dream Journal', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_dream_journal', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dream Journal', _lab_subtitle: 'Dream Walker × Dream Journaling', _lab_signature: 'dreamwalker_dream_journal' },
  { navicue_type_id: 'lab__dreamwalker__somnambulant', navicue_type_name: 'The Somnambulant', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_somnambulant', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Somnambulant', _lab_subtitle: 'Dream Walker × Body Wisdom', _lab_signature: 'dreamwalker_somnambulant' },
  { navicue_type_id: 'lab__dreamwalker__hypnagogic_edge', navicue_type_name: 'The Hypnagogic Edge', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_hypnagogic_edge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Hypnagogic Edge', _lab_subtitle: 'Dream Walker × Creative Twilight', _lab_signature: 'dreamwalker_hypnagogic_edge' },
  { navicue_type_id: 'lab__dreamwalker__dream_symbol', navicue_type_name: 'The Dream Symbol', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_dream_symbol', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dream Symbol', _lab_subtitle: 'Dream Walker × Symbolic Thinking', _lab_signature: 'dreamwalker_dream_symbol' },
  { navicue_type_id: 'lab__dreamwalker__walker_seal', navicue_type_name: 'The Walker Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'dreamwalker_walker_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Walker Seal', _lab_subtitle: 'Dream Walker × Conscious Living', _lab_signature: 'dreamwalker_walker_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 38 — THE MAGNUM OPUS (The Alchemy Collection) [10]
  // Crucible amber / alchemical gold / furnace dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__magnumopus__prima_materia', navicue_type_name: 'Prima Materia', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_prima_materia', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Prima Materia', _lab_subtitle: 'Magnum Opus × Psychological Alchemy', _lab_signature: 'magnumopus_prima_materia' },
  { navicue_type_id: 'lab__magnumopus__crucible', navicue_type_name: 'The Crucible', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_crucible', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Crucible', _lab_subtitle: 'Magnum Opus × Distress Tolerance', _lab_signature: 'magnumopus_crucible' },
  { navicue_type_id: 'lab__magnumopus__lead_to_gold', navicue_type_name: 'Lead to Gold', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_lead_to_gold', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Lead to Gold', _lab_subtitle: 'Magnum Opus × Post-Traumatic Growth', _lab_signature: 'magnumopus_lead_to_gold' },
  { navicue_type_id: 'lab__magnumopus__philosophers_stone', navicue_type_name: 'The Philosopher\'s Stone', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_philosophers_stone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Philosopher\'s Stone', _lab_subtitle: 'Magnum Opus × Embodied Cognition', _lab_signature: 'magnumopus_philosophers_stone' },
  { navicue_type_id: 'lab__magnumopus__solve', navicue_type_name: 'Solve', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_solve', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Solve', _lab_subtitle: 'Magnum Opus × Cognitive Flexibility', _lab_signature: 'magnumopus_solve' },
  { navicue_type_id: 'lab__magnumopus__coagula', navicue_type_name: 'Coagula', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_coagula', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Coagula', _lab_subtitle: 'Magnum Opus × Gestalt Formation', _lab_signature: 'magnumopus_coagula' },
  { navicue_type_id: 'lab__magnumopus__athanor', navicue_type_name: 'The Athanor', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_athanor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Athanor', _lab_subtitle: 'Magnum Opus × Sustained Attention', _lab_signature: 'magnumopus_athanor' },
  { navicue_type_id: 'lab__magnumopus__tincture', navicue_type_name: 'The Tincture', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_tincture', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tincture', _lab_subtitle: 'Magnum Opus × Affect Labeling', _lab_signature: 'magnumopus_tincture' },
  { navicue_type_id: 'lab__magnumopus__ouroboros', navicue_type_name: 'The Ouroboros', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_ouroboros', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ouroboros', _lab_subtitle: 'Magnum Opus × Cyclical Acceptance', _lab_signature: 'magnumopus_ouroboros' },
  { navicue_type_id: 'lab__magnumopus__opus_seal', navicue_type_name: 'The Opus Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'magnumopus_opus_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Opus Seal', _lab_subtitle: 'Magnum Opus × Self-as-Masterwork', _lab_signature: 'magnumopus_opus_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 39 — THE PRISM (The Perspective Collection) [10]
  // Crystal glass / spectral violet / optical dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__prism__refraction', navicue_type_name: 'The Refraction', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_refraction', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Refraction', _lab_subtitle: 'Prism × First Principles', _lab_signature: 'prism_refraction' },
  { navicue_type_id: 'lab__prism__transparency', navicue_type_name: 'Transparency Mode', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_transparency', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Transparency Mode', _lab_subtitle: 'Prism × Radical Non-Resistance', _lab_signature: 'prism_transparency' },
  { navicue_type_id: 'lab__prism__laser_focus', navicue_type_name: 'Laser Focus', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_laser_focus', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Laser Focus', _lab_subtitle: 'Prism × Attentional Coherence', _lab_signature: 'prism_laser_focus' },
  { navicue_type_id: 'lab__prism__afterimage', navicue_type_name: 'The Afterimage', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_afterimage', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Afterimage', _lab_subtitle: 'Prism × Sensory Adaptation', _lab_signature: 'prism_afterimage' },
  { navicue_type_id: 'lab__prism__blind_spot', navicue_type_name: 'The Blind Spot', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_blind_spot', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Blind Spot', _lab_subtitle: 'Prism × Scotoma', _lab_signature: 'prism_blind_spot' },
  { navicue_type_id: 'lab__prism__focal_length', navicue_type_name: 'The Focal Length', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_focal_length', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Focal Length', _lab_subtitle: 'Prism × Selective Attention', _lab_signature: 'prism_focal_length' },
  { navicue_type_id: 'lab__prism__shadow_cast', navicue_type_name: 'The Shadow Cast', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_shadow_cast', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shadow Cast', _lab_subtitle: 'Prism × Contrast Effect', _lab_signature: 'prism_shadow_cast' },
  { navicue_type_id: 'lab__prism__bioluminescence', navicue_type_name: 'Bioluminescence', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_bioluminescence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Bioluminescence', _lab_subtitle: 'Prism × Internal Locus of Control', _lab_signature: 'prism_bioluminescence' },
  { navicue_type_id: 'lab__prism__infrared', navicue_type_name: 'The Infrared', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_infrared', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Infrared', _lab_subtitle: 'Prism × Emotional Temperature', _lab_signature: 'prism_infrared' },
  { navicue_type_id: 'lab__prism__prism_seal', navicue_type_name: 'The Prism Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'prism_prism_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Prism Seal', _lab_subtitle: 'Prism × Transpersonal Psychology', _lab_signature: 'prism_prism_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 40 — THE GRAVITON (The Presence Collection) [10]
  // Iron dark / gravitational blue / deep space
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__graviton__heavy_object', navicue_type_name: 'The Heavy Object', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_heavy_object', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Heavy Object', _lab_subtitle: 'Graviton × Social Dominance', _lab_signature: 'graviton_heavy_object' },
  { navicue_type_id: 'lab__graviton__escape_velocity', navicue_type_name: 'Escape Velocity', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_escape_velocity', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Escape Velocity', _lab_subtitle: 'Graviton × Activation Energy', _lab_signature: 'graviton_escape_velocity' },
  { navicue_type_id: 'lab__graviton__binary_star', navicue_type_name: 'The Binary Star', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_binary_star', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Binary Star', _lab_subtitle: 'Graviton × Assortative Partnership', _lab_signature: 'graviton_binary_star' },
  { navicue_type_id: 'lab__graviton__black_hole', navicue_type_name: 'The Black Hole', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_black_hole', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Black Hole', _lab_subtitle: 'Graviton × Containment', _lab_signature: 'graviton_black_hole' },
  { navicue_type_id: 'lab__graviton__tidal_force', navicue_type_name: 'The Tidal Force', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_tidal_force', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tidal Force', _lab_subtitle: 'Graviton × Emotional Contagion', _lab_signature: 'graviton_tidal_force' },
  { navicue_type_id: 'lab__graviton__inverse_square', navicue_type_name: 'The Inverse Square', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_inverse_square', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inverse Square', _lab_subtitle: 'Graviton × Proximity Principle', _lab_signature: 'graviton_inverse_square' },
  { navicue_type_id: 'lab__graviton__center_of_mass', navicue_type_name: 'The Center of Mass', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_center_of_mass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Center of Mass', _lab_subtitle: 'Graviton × Self-Regulation', _lab_signature: 'graviton_center_of_mass' },
  { navicue_type_id: 'lab__graviton__roche_limit', navicue_type_name: 'The Roche Limit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_roche_limit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Roche Limit', _lab_subtitle: 'Graviton × Differentiation of Self', _lab_signature: 'graviton_roche_limit' },
  { navicue_type_id: 'lab__graviton__dark_star', navicue_type_name: 'The Dark Star', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_dark_star', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dark Star', _lab_subtitle: 'Graviton × Information Gap Theory', _lab_signature: 'graviton_dark_star' },
  { navicue_type_id: 'lab__graviton__gravity_seal', navicue_type_name: 'The Gravity Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'graviton_gravity_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Gravity Seal', _lab_subtitle: 'Graviton × Embodied Cognition', _lab_signature: 'graviton_gravity_seal' },

  // ══════════════���════════════════════════════════════════════════
  // ACT 41 — THE OBSERVER (The Quantum Collection) [10]
  // Probability purple / superposition teal / quantum void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__observer__schrodingers_box', navicue_type_name: 'Schr\u00f6dinger\'s Box', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_schrodingers_box', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Schr\u00f6dinger\'s Box', _lab_subtitle: 'Observer × Superposition', _lab_signature: 'observer_schrodingers_box' },
  { navicue_type_id: 'lab__observer__wave_collapse', navicue_type_name: 'The Wave Collapse', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_wave_collapse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wave Collapse', _lab_subtitle: 'Observer × Observer Effect', _lab_signature: 'observer_wave_collapse' },
  { navicue_type_id: 'lab__observer__spooky_action', navicue_type_name: 'Spooky Action', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_spooky_action', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Spooky Action', _lab_subtitle: 'Observer × Quantum Entanglement', _lab_signature: 'observer_spooky_action' },
  { navicue_type_id: 'lab__observer__quantum_tunnel', navicue_type_name: 'The Quantum Tunnel', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_quantum_tunnel', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Quantum Tunnel', _lab_subtitle: 'Observer × Quantum Tunneling', _lab_signature: 'observer_quantum_tunnel' },
  { navicue_type_id: 'lab__observer__uncertainty_blur', navicue_type_name: 'The Uncertainty Blur', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_uncertainty_blur', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Uncertainty Blur', _lab_subtitle: 'Observer × Heisenberg Principle', _lab_signature: 'observer_uncertainty_blur' },
  { navicue_type_id: 'lab__observer__many_worlds', navicue_type_name: 'The Many Worlds', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_many_worlds', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Many Worlds', _lab_subtitle: 'Observer × Everett Interpretation', _lab_signature: 'observer_many_worlds' },
  { navicue_type_id: 'lab__observer__retrocausality', navicue_type_name: 'Retrocausality', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_retrocausality', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Retrocausality', _lab_subtitle: 'Observer × Delayed Choice', _lab_signature: 'observer_retrocausality' },
  { navicue_type_id: 'lab__observer__zero_point', navicue_type_name: 'The Zero Point', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_zero_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Zero Point', _lab_subtitle: 'Observer × Zero-Point Energy', _lab_signature: 'observer_zero_point' },
  { navicue_type_id: 'lab__observer__double_slit', navicue_type_name: 'The Double Slit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_double_slit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Double Slit', _lab_subtitle: 'Observer × Wave-Particle Duality', _lab_signature: 'observer_double_slit' },
  { navicue_type_id: 'lab__observer__observer_seal', navicue_type_name: 'The Observer Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'observer_observer_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Observer Seal', _lab_subtitle: 'Observer × Biocentrism', _lab_signature: 'observer_observer_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 42 — THE TIME CAPSULE (The Future Collection) [10]
  // Capsule amber / archive gold / temporal dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__timecapsule__open_when_seal', navicue_type_name: 'The "Open When" Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_open_when_seal', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Open When" Seal', _lab_subtitle: 'Time Capsule �� Affective Forecasting', _lab_signature: 'timecapsule_open_when_seal' },
  { navicue_type_id: 'lab__timecapsule__drift_bottle', navicue_type_name: 'The Drift Bottle', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_drift_bottle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Drift Bottle', _lab_subtitle: 'Time Capsule × Variable Rewards', _lab_signature: 'timecapsule_drift_bottle' },
  { navicue_type_id: 'lab__timecapsule__rage_vault', navicue_type_name: 'The Rage Vault', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_rage_vault', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rage Vault', _lab_subtitle: 'Time Capsule × Emotional Refractory Period', _lab_signature: 'timecapsule_rage_vault' },
  { navicue_type_id: 'lab__timecapsule__prediction_stake', navicue_type_name: 'The Prediction Stake', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_prediction_stake', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Prediction Stake', _lab_subtitle: 'Time Capsule × Calibration Training', _lab_signature: 'timecapsule_prediction_stake' },
  { navicue_type_id: 'lab__timecapsule__success_jar', navicue_type_name: 'The Success Jar', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_success_jar', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Success Jar', _lab_subtitle: 'Time Capsule × Savoring', _lab_signature: 'timecapsule_success_jar' },
  { navicue_type_id: 'lab__timecapsule__ten_year_echo', navicue_type_name: 'The 10-Year Echo', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_ten_year_echo', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The 10-Year Echo', _lab_subtitle: 'Time Capsule × Narrative Continuity', _lab_signature: 'timecapsule_ten_year_echo' },
  { navicue_type_id: 'lab__timecapsule__crisis_kit', navicue_type_name: 'The Crisis Kit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_crisis_kit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Crisis Kit', _lab_subtitle: 'Time Capsule × Implementation Intentions', _lab_signature: 'timecapsule_crisis_kit' },
  { navicue_type_id: 'lab__timecapsule__wine_cellar', navicue_type_name: 'The Wine Cellar', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_wine_cellar', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wine Cellar', _lab_subtitle: 'Time Capsule × Incubation Effect', _lab_signature: 'timecapsule_wine_cellar' },
  { navicue_type_id: 'lab__timecapsule__dead_mans_switch', navicue_type_name: 'The Dead Man\u2019s Switch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_dead_mans_switch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dead Man\u2019s Switch', _lab_subtitle: 'Time Capsule × Pre-Commitment', _lab_signature: 'timecapsule_dead_mans_switch' },
  { navicue_type_id: 'lab__timecapsule__capsule_seal', navicue_type_name: 'The Capsule Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'timecapsule_capsule_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Capsule Seal', _lab_subtitle: 'Time Capsule × Trans-Temporal Agency', _lab_signature: 'timecapsule_capsule_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 43 — THE LOOP BREAKER (The Cycle Collection) [10]
  // Loop silver / circuit green / iteration dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__loopbreaker__iteration_counter', navicue_type_name: 'The Iteration Counter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_iteration_counter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Iteration Counter', _lab_subtitle: 'Loop Breaker × Pattern Recognition', _lab_signature: 'loopbreaker_iteration_counter' },
  { navicue_type_id: 'lab__loopbreaker__trigger_map', navicue_type_name: 'The Trigger Map', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_trigger_map', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Trigger Map', _lab_subtitle: 'Loop Breaker × Antecedent Analysis', _lab_signature: 'loopbreaker_trigger_map' },
  { navicue_type_id: 'lab__loopbreaker__glitch_injection', navicue_type_name: 'The Glitch Injection', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_glitch_injection', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Glitch Injection', _lab_subtitle: 'Loop Breaker × Pattern Interrupt', _lab_signature: 'loopbreaker_glitch_injection' },
  { navicue_type_id: 'lab__loopbreaker__exit_ramp', navicue_type_name: 'The Exit Ramp', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_exit_ramp', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Exit Ramp', _lab_subtitle: 'Loop Breaker × Response Prevention', _lab_signature: 'loopbreaker_exit_ramp' },
  { navicue_type_id: 'lab__loopbreaker__reward_audit', navicue_type_name: 'The Reward Audit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_reward_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Reward Audit', _lab_subtitle: 'Loop Breaker × Functional Analysis', _lab_signature: 'loopbreaker_reward_audit' },
  { navicue_type_id: 'lab__loopbreaker__double_loop', navicue_type_name: 'The Double Loop', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_double_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Double Loop', _lab_subtitle: 'Loop Breaker × Double-Loop Learning', _lab_signature: 'loopbreaker_double_loop' },
  { navicue_type_id: 'lab__loopbreaker__spiral_check', navicue_type_name: 'The Spiral Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_spiral_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Spiral Check', _lab_subtitle: 'Loop Breaker × Cyclical Growth', _lab_signature: 'loopbreaker_spiral_check' },
  { navicue_type_id: 'lab__loopbreaker__friction_add', navicue_type_name: 'The Friction Add', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_friction_add', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Add', _lab_subtitle: 'Loop Breaker × Friction Engineering', _lab_signature: 'loopbreaker_friction_add' },
  { navicue_type_id: 'lab__loopbreaker__new_groove', navicue_type_name: 'The New Groove', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_new_groove', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The New Groove', _lab_subtitle: 'Loop Breaker × Myelination', _lab_signature: 'loopbreaker_new_groove' },
  { navicue_type_id: 'lab__loopbreaker__breaker_seal', navicue_type_name: 'The Breaker Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'loopbreaker_breaker_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Breaker Seal', _lab_subtitle: 'Loop Breaker × Extinction', _lab_signature: 'loopbreaker_breaker_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 44 — THE RETRO-CAUSAL (The History Collection) [10]
  // Celluloid warm / edit blue / memory dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__retrocausal__memory_rescore', navicue_type_name: 'The Memory Rescore', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_memory_rescore', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Memory Rescore', _lab_subtitle: 'Retro-Causal × Memory Reconsolidation', _lab_signature: 'retrocausal_memory_rescore' },
  { navicue_type_id: 'lab__retrocausal__deleted_scene', navicue_type_name: 'The Deleted Scene', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_deleted_scene', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deleted Scene', _lab_subtitle: 'Retro-Causal × Mood-Congruent Bias', _lab_signature: 'retrocausal_deleted_scene' },
  { navicue_type_id: 'lab__retrocausal__prequel', navicue_type_name: 'The Prequel', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_prequel', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Prequel', _lab_subtitle: 'Retro-Causal × Attributional Retraining', _lab_signature: 'retrocausal_prequel' },
  { navicue_type_id: 'lab__retrocausal__color_grade', navicue_type_name: 'The Color Grade', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_color_grade', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Color Grade', _lab_subtitle: 'Retro-Causal × Sensory Grounding', _lab_signature: 'retrocausal_color_grade' },
  { navicue_type_id: 'lab__retrocausal__narrative_flip', navicue_type_name: 'The Narrative Flip', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_narrative_flip', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Narrative Flip', _lab_subtitle: 'Retro-Causal × Redemptive Narrative', _lab_signature: 'retrocausal_narrative_flip' },
  { navicue_type_id: 'lab__retrocausal__forgiveness_filter', navicue_type_name: 'The Forgiveness Filter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_forgiveness_filter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Forgiveness Filter', _lab_subtitle: 'Retro-Causal × Empathy-Induced Forgiveness', _lab_signature: 'retrocausal_forgiveness_filter' },
  { navicue_type_id: 'lab__retrocausal__time_travel_rescue', navicue_type_name: 'The Time Travel Rescue', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_time_travel_rescue', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Time Travel Rescue', _lab_subtitle: 'Retro-Causal × Imagery Rescripting', _lab_signature: 'retrocausal_time_travel_rescue' },
  { navicue_type_id: 'lab__retrocausal__metadata_edit', navicue_type_name: 'The Metadata Edit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_metadata_edit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Metadata Edit', _lab_subtitle: 'Retro-Causal × Cognitive Reappraisal', _lab_signature: 'retrocausal_metadata_edit' },
  { navicue_type_id: 'lab__retrocausal__ancestral_cut', navicue_type_name: 'The Ancestral Cut', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_ancestral_cut', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ancestral Cut', _lab_subtitle: 'Retro-Causal × Intergenerational Differentiation', _lab_signature: 'retrocausal_ancestral_cut' },
  { navicue_type_id: 'lab__retrocausal__retro_seal', navicue_type_name: 'The Retro Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'retrocausal_retro_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Retro Seal', _lab_subtitle: 'Retro-Causal × Memory Malleability', _lab_signature: 'retrocausal_retro_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 45 — THE THRESHOLD (The Liminal Collection) [10]
  // Threshold obsidian / liminal violet / between void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__threshold__doorway', navicue_type_name: 'The Doorway', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_doorway', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Doorway', _lab_subtitle: 'Threshold × Liminal Space', _lab_signature: 'threshold_doorway' },
  { navicue_type_id: 'lab__threshold__in_between', navicue_type_name: 'The In-Between', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_in_between', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The In-Between', _lab_subtitle: 'Threshold × Binary Dissolution', _lab_signature: 'threshold_in_between' },
  { navicue_type_id: 'lab__threshold__dawn_watch', navicue_type_name: 'The Dawn Watch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_dawn_watch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dawn Watch', _lab_subtitle: 'Threshold × Gradient Transition', _lab_signature: 'threshold_dawn_watch' },
  { navicue_type_id: 'lab__threshold__breath_gap', navicue_type_name: 'The Breath Gap', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_breath_gap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Breath Gap', _lab_subtitle: 'Threshold × Respiratory Pause', _lab_signature: 'threshold_breath_gap' },
  { navicue_type_id: 'lab__threshold__chrysalis_wait', navicue_type_name: 'The Chrysalis Wait', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_chrysalis_wait', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chrysalis Wait', _lab_subtitle: 'Threshold × Metamorphosis Patience', _lab_signature: 'threshold_chrysalis_wait' },
  { navicue_type_id: 'lab__threshold__tidal_zone', navicue_type_name: 'The Tidal Zone', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_tidal_zone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tidal Zone', _lab_subtitle: 'Threshold × Intertidal Ecology', _lab_signature: 'threshold_tidal_zone' },
  { navicue_type_id: 'lab__threshold__question_mark', navicue_type_name: 'The Question Mark', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_question_mark', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Question Mark', _lab_subtitle: 'Threshold × Negative Capability', _lab_signature: 'threshold_question_mark' },
  { navicue_type_id: 'lab__threshold__dusk_walk', navicue_type_name: 'The Dusk Walk', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_dusk_walk', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dusk Walk', _lab_subtitle: 'Threshold × Crepuscular Advantage', _lab_signature: 'threshold_dusk_walk' },
  { navicue_type_id: 'lab__threshold__hinge_point', navicue_type_name: 'The Hinge Point', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_hinge_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Hinge Point', _lab_subtitle: 'Threshold × Bifurcation Points', _lab_signature: 'threshold_hinge_point' },
  { navicue_type_id: 'lab__threshold__threshold_seal', navicue_type_name: 'The Threshold Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'threshold_threshold_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Threshold Seal', _lab_subtitle: 'Threshold × Liminal Identity', _lab_signature: 'threshold_threshold_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 46 — THE SOMA (The Embodied Intelligence Collection) [10]
  // Flesh warm / nerve electric / marrow void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__soma__body_radar', navicue_type_name: 'The Body Scan Radar', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_body_radar', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Body Scan Radar', _lab_subtitle: 'Soma × Interoceptive Scanning', _lab_signature: 'soma_body_radar' },
  { navicue_type_id: 'lab__soma__gut_signal', navicue_type_name: 'The Gut Signal', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_gut_signal', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gut Signal', _lab_subtitle: 'Soma × Enteric Nervous System', _lab_signature: 'soma_gut_signal' },
  { navicue_type_id: 'lab__soma__skin_map', navicue_type_name: 'The Skin Map', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_skin_map', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Skin Map', _lab_subtitle: 'Soma × Somatotopic Mapping', _lab_signature: 'soma_skin_map' },
  { navicue_type_id: 'lab__soma__pulse_reader', navicue_type_name: 'The Pulse Reader', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_pulse_reader', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pulse Reader', _lab_subtitle: 'Soma × Cardiac Interoception', _lab_signature: 'soma_pulse_reader' },
  { navicue_type_id: 'lab__soma__joint_unlock', navicue_type_name: 'The Joint Unlock', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_joint_unlock', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Joint Unlock', _lab_subtitle: 'Soma × Fascial Adhesion', _lab_signature: 'soma_joint_unlock' },
  { navicue_type_id: 'lab__soma__fascia_wave', navicue_type_name: 'The Fascia Wave', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_fascia_wave', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fascia Wave', _lab_subtitle: 'Soma × Fascial Continuity', _lab_signature: 'soma_fascia_wave' },
  { navicue_type_id: 'lab__soma__voice_box', navicue_type_name: 'The Voice Box', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_voice_box', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Voice Box', _lab_subtitle: 'Soma × Vagus-Larynx Connection', _lab_signature: 'soma_voice_box' },
  { navicue_type_id: 'lab__soma__balance_point', navicue_type_name: 'The Balance Point', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_balance_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Balance Point', _lab_subtitle: 'Soma × Proprioceptive Centering', _lab_signature: 'soma_balance_point' },
  { navicue_type_id: 'lab__soma__cell_memory', navicue_type_name: 'The Cell Memory', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_cell_memory', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cell Memory', _lab_subtitle: 'Soma × Somatic Memory', _lab_signature: 'soma_cell_memory' },
  { navicue_type_id: 'lab__soma__soma_seal', navicue_type_name: 'The Soma Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'soma_soma_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Soma Seal', _lab_subtitle: 'Soma × Embodied Intelligence', _lab_signature: 'soma_soma_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 47 — THE FREQUENCY (The Vibrational Awareness Collection) [10]
  // Wave silver / harmonic gold / silence void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__frequency__baseline_hum', navicue_type_name: 'The Baseline Hum', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_baseline_hum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Baseline Hum', _lab_subtitle: 'Frequency × Baseline Oscillation', _lab_signature: 'frequency_baseline_hum' },
  { navicue_type_id: 'lab__frequency__dissonance_detector', navicue_type_name: 'The Dissonance Detector', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_dissonance_detector', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dissonance Detector', _lab_subtitle: 'Frequency × Anomaly Detection', _lab_signature: 'frequency_dissonance_detector' },
  { navicue_type_id: 'lab__frequency__harmony_map', navicue_type_name: 'The Harmony Map', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_harmony_map', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Harmony Map', _lab_subtitle: 'Frequency × Sympathetic Resonance', _lab_signature: 'frequency_harmony_map' },
  { navicue_type_id: 'lab__frequency__octave_jump', navicue_type_name: 'The Octave Jump', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_octave_jump', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Octave Jump', _lab_subtitle: 'Frequency × Octave Equivalence', _lab_signature: 'frequency_octave_jump' },
  { navicue_type_id: 'lab__frequency__standing_wave', navicue_type_name: 'The Standing Wave', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_standing_wave', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Standing Wave', _lab_subtitle: 'Frequency × Standing Wave Formation', _lab_signature: 'frequency_standing_wave' },
  { navicue_type_id: 'lab__frequency__interference_pattern', navicue_type_name: 'The Interference Pattern', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_interference_pattern', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Interference Pattern', _lab_subtitle: 'Frequency × Wave Interference', _lab_signature: 'frequency_interference_pattern' },
  { navicue_type_id: 'lab__frequency__overtone', navicue_type_name: 'The Overtone', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_overtone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Overtone', _lab_subtitle: 'Frequency × Harmonic Series', _lab_signature: 'frequency_overtone' },
  { navicue_type_id: 'lab__frequency__phase_lock', navicue_type_name: 'The Phase Lock', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_phase_lock', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phase Lock', _lab_subtitle: 'Frequency × Phase Synchronization', _lab_signature: 'frequency_phase_lock' },
  { navicue_type_id: 'lab__frequency__resonant_cavity', navicue_type_name: 'The Resonant Cavity', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_resonant_cavity', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Resonant Cavity', _lab_subtitle: 'Frequency × Acoustic Resonance', _lab_signature: 'frequency_resonant_cavity' },
  { navicue_type_id: 'lab__frequency__frequency_seal', navicue_type_name: 'The Frequency Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'frequency_frequency_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Frequency Seal', _lab_subtitle: 'Frequency × Vibrational Identity', _lab_signature: 'frequency_frequency_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 48 — THE TUNER (The Entrainment Collection) [10]
  // Tuning fork silver / frequency indigo / resonance void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__tuner__delta_drop', navicue_type_name: 'The Delta Drop', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_delta_drop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Delta Drop', _lab_subtitle: 'Tuner × Frequency Following Response', _lab_signature: 'tuner_delta_drop' },
  { navicue_type_id: 'lab__tuner__gamma_spike', navicue_type_name: 'The Gamma Spike', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_gamma_spike', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gamma Spike', _lab_subtitle: 'Tuner × Gamma Synchrony', _lab_signature: 'tuner_gamma_spike' },
  { navicue_type_id: 'lab__tuner__haptic_pacer', navicue_type_name: 'The 4-7-8 Haptic Pacer', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_haptic_pacer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The 4-7-8 Haptic Pacer', _lab_subtitle: 'Tuner × Parasympathetic Activation', _lab_signature: 'tuner_haptic_pacer' },
  { navicue_type_id: 'lab__tuner__vagal_hum', navicue_type_name: 'The Vagal Hum', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_vagal_hum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vagal Hum', _lab_subtitle: 'Tuner × Vagus Nerve Stimulation', _lab_signature: 'tuner_vagal_hum' },
  { navicue_type_id: 'lab__tuner__isochronic_focus', navicue_type_name: 'The Isochronic Focus', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_isochronic_focus', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Isochronic Focus', _lab_subtitle: 'Tuner × Cortical Entrainment', _lab_signature: 'tuner_isochronic_focus' },
  { navicue_type_id: 'lab__tuner__heart_coherence', navicue_type_name: 'The Heart Coherence Visualizer', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_heart_coherence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Heart Coherence Visualizer', _lab_subtitle: 'Tuner × HRV Coherence', _lab_signature: 'tuner_heart_coherence' },
  { navicue_type_id: 'lab__tuner__brown_noise', navicue_type_name: 'The Brown Noise Blanket', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_brown_noise', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Brown Noise Blanket', _lab_subtitle: 'Tuner × Stochastic Resonance', _lab_signature: 'tuner_brown_noise' },
  { navicue_type_id: 'lab__tuner__bilateral_tap', navicue_type_name: 'The Bilateral Tap', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_bilateral_tap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Bilateral Tap', _lab_subtitle: 'Tuner × EMDR Processing', _lab_signature: 'tuner_bilateral_tap' },
  { navicue_type_id: 'lab__tuner__solfeggio_528', navicue_type_name: 'The Solfeggio 528', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_solfeggio_528', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Solfeggio 528', _lab_subtitle: 'Tuner × Vibroacoustic Therapy', _lab_signature: 'tuner_solfeggio_528' },
  { navicue_type_id: 'lab__tuner__tuner_seal', navicue_type_name: 'The Tuner Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tuner_tuner_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Tuner Seal', _lab_subtitle: 'Tuner × Interoceptive Accuracy', _lab_signature: 'tuner_tuner_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 49 — THE BROADCAST (The Ambient Collection) [10]
  // Broadcast amber / signal rose / atmosphere void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__broadcast__circadian_tint', navicue_type_name: 'The Circadian Tint', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_circadian_tint', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Circadian Tint', _lab_subtitle: 'Broadcast × Melatonin Regulation', _lab_signature: 'broadcast_circadian_tint' },
  { navicue_type_id: 'lab__broadcast__subliminal_pulse', navicue_type_name: 'The Subliminal Pulse', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_subliminal_pulse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Subliminal Pulse', _lab_subtitle: 'Broadcast × Subliminal Priming', _lab_signature: 'broadcast_subliminal_pulse' },
  { navicue_type_id: 'lab__broadcast__haptic_heartbeat', navicue_type_name: 'The Haptic Heartbeat', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_haptic_heartbeat', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Haptic Heartbeat', _lab_subtitle: 'Broadcast × Social Presence', _lab_signature: 'broadcast_haptic_heartbeat' },
  { navicue_type_id: 'lab__broadcast__color_bath', navicue_type_name: 'The Color Bath', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_color_bath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Color Bath', _lab_subtitle: 'Broadcast × Chromotherapy', _lab_signature: 'broadcast_color_bath' },
  { navicue_type_id: 'lab__broadcast__silent_timer', navicue_type_name: 'The Silent Timer', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_silent_timer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silent Timer', _lab_subtitle: 'Broadcast × Time Perception', _lab_signature: 'broadcast_silent_timer' },
  { navicue_type_id: 'lab__broadcast__digital_candle', navicue_type_name: 'The Digital Candle', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_digital_candle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Digital Candle', _lab_subtitle: 'Broadcast × Environmental Biofeedback', _lab_signature: 'broadcast_digital_candle' },
  { navicue_type_id: 'lab__broadcast__presence_radar', navicue_type_name: 'The Presence Radar', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_presence_radar', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Presence Radar', _lab_subtitle: 'Broadcast × Ambient Intimacy', _lab_signature: 'broadcast_presence_radar' },
  { navicue_type_id: 'lab__broadcast__weather_window', navicue_type_name: 'The Weather Window', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_weather_window', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Weather Window', _lab_subtitle: 'Broadcast × Biophilia', _lab_signature: 'broadcast_weather_window' },
  { navicue_type_id: 'lab__broadcast__rhythm_background', navicue_type_name: 'The Rhythm Background', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_rhythm_background', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rhythm Background', _lab_subtitle: 'Broadcast × Visual-Respiratory Coupling', _lab_signature: 'broadcast_rhythm_background' },
  { navicue_type_id: 'lab__broadcast__broadcast_seal', navicue_type_name: 'The Broadcast Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'broadcast_broadcast_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Broadcast Seal', _lab_subtitle: 'Broadcast × Secure Attachment Base', _lab_signature: 'broadcast_broadcast_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 50 — THE SCHRÖDINGER BOX (The Superposition Collection) [10]
  // Probability dark / superposition teal / collapse void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__schrodinger__mystery_box', navicue_type_name: 'The Mystery Box', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_mystery_box', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mystery Box', _lab_subtitle: 'Schrödinger × Uncertainty Tolerance', _lab_signature: 'schrodinger_mystery_box' },
  { navicue_type_id: 'lab__schrodinger__parallel_self', navicue_type_name: 'The Parallel Self Chat', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_parallel_self', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Parallel Self Chat', _lab_subtitle: 'Schrödinger × Dialogical Self Theory', _lab_signature: 'schrodinger_parallel_self' },
  { navicue_type_id: 'lab__schrodinger__dice_roll', navicue_type_name: 'The Dice Roll', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_dice_roll', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dice Roll', _lab_subtitle: 'Schrödinger × Decision Fatigue Reduction', _lab_signature: 'schrodinger_dice_roll' },
  { navicue_type_id: 'lab__schrodinger__many_worlds_map', navicue_type_name: 'The Many-Worlds Map', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_many_worlds_map', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Many-Worlds Map', _lab_subtitle: 'Schrödinger × Prospective Simulation', _lab_signature: 'schrodinger_many_worlds_map' },
  { navicue_type_id: 'lab__schrodinger__quantum_coin', navicue_type_name: 'The Quantum Coin', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_quantum_coin', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Quantum Coin', _lab_subtitle: 'Schrödinger × Affective Forecasting', _lab_signature: 'schrodinger_quantum_coin' },
  { navicue_type_id: 'lab__schrodinger__random_act', navicue_type_name: 'The Random Act', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_random_act', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Random Act', _lab_subtitle: 'Schrödinger × Behavioral Activation', _lab_signature: 'schrodinger_random_act' },
  { navicue_type_id: 'lab__schrodinger__blur', navicue_type_name: 'The Blur', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_blur', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Blur', _lab_subtitle: 'Schrödinger × Opportunity Cost Salience', _lab_signature: 'schrodinger_blur' },
  { navicue_type_id: 'lab__schrodinger__oracle_deck', navicue_type_name: 'The Oracle Deck', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_oracle_deck', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Oracle Deck', _lab_subtitle: 'Schrödinger × Ideomotor Phenomenon', _lab_signature: 'schrodinger_oracle_deck' },
  { navicue_type_id: 'lab__schrodinger__double_slit', navicue_type_name: 'The Double Slit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_double_slit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Double Slit', _lab_subtitle: 'Schrödinger × The Audience Effect', _lab_signature: 'schrodinger_double_slit' },
  { navicue_type_id: 'lab__schrodinger__box_seal', navicue_type_name: 'The Box Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'schrodinger_box_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Box Seal', _lab_subtitle: 'Schrödinger × The Observer Effect', _lab_signature: 'schrodinger_box_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 51 — THE GLITCH (The Disruption Collection) [10]
  // Terminal green-dark / error red / digital void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__glitch__fourth_wall_break', navicue_type_name: 'The Fourth Wall Break', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_fourth_wall_break', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fourth Wall Break', _lab_subtitle: 'Glitch × Meta-Cognitive Prompting', _lab_signature: 'glitch_fourth_wall_break' },
  { navicue_type_id: 'lab__glitch__wrong_button', navicue_type_name: 'The Wrong Button', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_wrong_button', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wrong Button', _lab_subtitle: 'Glitch × Prediction Error', _lab_signature: 'glitch_wrong_button' },
  { navicue_type_id: 'lab__glitch__reverse_text', navicue_type_name: 'The Reverse Text', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_reverse_text', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Reverse Text', _lab_subtitle: 'Glitch × Disfluency Effect', _lab_signature: 'glitch_reverse_text' },
  { navicue_type_id: 'lab__glitch__lag_spike', navicue_type_name: 'The Lag Spike', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_lag_spike', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lag Spike', _lab_subtitle: 'Glitch × Frustration Tolerance', _lab_signature: 'glitch_lag_spike' },
  { navicue_type_id: 'lab__glitch__blue_screen', navicue_type_name: 'The Blue Screen', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_blue_screen', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Blue Screen', _lab_subtitle: 'Glitch × Cognitive Reset', _lab_signature: 'glitch_blue_screen' },
  { navicue_type_id: 'lab__glitch__fake_notification', navicue_type_name: 'The Fake Notification', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_fake_notification', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fake Notification', _lab_subtitle: 'Glitch × False Alarm Extinction', _lab_signature: 'glitch_fake_notification' },
  { navicue_type_id: 'lab__glitch__pixelated_self', navicue_type_name: 'The Pixelated Self', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_pixelated_self', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pixelated Self', _lab_subtitle: 'Glitch × Tactical Depersonalization', _lab_signature: 'glitch_pixelated_self' },
  { navicue_type_id: 'lab__glitch__loop_crash', navicue_type_name: 'The Loop Crash', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_loop_crash', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Loop Crash', _lab_subtitle: 'Glitch × Semantic Satiation', _lab_signature: 'glitch_loop_crash' },
  { navicue_type_id: 'lab__glitch__reality_tear', navicue_type_name: 'The Reality Tear', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_reality_tear', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Reality Tear', _lab_subtitle: 'Glitch × Reification', _lab_signature: 'glitch_reality_tear' },
  { navicue_type_id: 'lab__glitch__glitch_seal', navicue_type_name: 'The Glitch Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'glitch_glitch_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Glitch Seal', _lab_subtitle: 'Glitch × Signal-to-Noise Ratio', _lab_signature: 'glitch_glitch_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 52 — THE ARCHITECT (The Construct Collection) [10]
  // Sandstone warm / copper bronze / earthen void
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__construct__foundation_stone', navicue_type_name: 'The Foundation Stone', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_foundation_stone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Foundation Stone', _lab_subtitle: 'Construct × Cognitive Anchoring', _lab_signature: 'construct_foundation_stone' },
  { navicue_type_id: 'lab__construct__grief_cairn', navicue_type_name: 'The Grief Cairn', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_grief_cairn', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Grief Cairn', _lab_subtitle: 'Construct × Externalization of Grief', _lab_signature: 'construct_grief_cairn' },
  { navicue_type_id: 'lab__construct__memory_palace', navicue_type_name: 'The Memory Palace', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_memory_palace', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Memory Palace', _lab_subtitle: 'Construct × Method of Loci', _lab_signature: 'construct_memory_palace' },
  { navicue_type_id: 'lab__construct__zen_garden', navicue_type_name: 'The Zen Garden', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_zen_garden', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Zen Garden', _lab_subtitle: 'Construct × The Ikea Effect', _lab_signature: 'construct_zen_garden' },
  { navicue_type_id: 'lab__construct__fear_vault', navicue_type_name: 'The Fear Vault', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_fear_vault', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fear Vault', _lab_subtitle: 'Construct × Cognitive Offloading', _lab_signature: 'construct_fear_vault' },
  { navicue_type_id: 'lab__construct__council_table', navicue_type_name: 'The Council Table', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_council_table', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Council Table', _lab_subtitle: 'Construct × Internal Family Systems', _lab_signature: 'construct_council_table' },
  { navicue_type_id: 'lab__construct__lighthouse', navicue_type_name: 'The Lighthouse', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_lighthouse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lighthouse', _lab_subtitle: 'Construct × Hope Theory', _lab_signature: 'construct_lighthouse' },
  { navicue_type_id: 'lab__construct__workbench', navicue_type_name: 'The Workbench', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_workbench', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Workbench', _lab_subtitle: 'Construct × Resource Priming', _lab_signature: 'construct_workbench' },
  { navicue_type_id: 'lab__construct__greenhouse', navicue_type_name: 'The Greenhouse', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_greenhouse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Greenhouse', _lab_subtitle: 'Construct × Active Patience', _lab_signature: 'construct_greenhouse' },
  { navicue_type_id: 'lab__construct__architect_seal', navicue_type_name: 'The Architect Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'construct_architect_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Architect Seal', _lab_subtitle: 'Construct × Cumulative Achievement', _lab_signature: 'construct_architect_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 53 — THE BIOGRAPHER (The Mythos Collection) [10]
  // Sepia ink / gold leaf / leather dark
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__biographer__origin_story', navicue_type_name: 'The Origin Story', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_origin_story', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Origin Story', _lab_subtitle: 'Biographer × Narrative Identity', _lab_signature: 'biographer_origin_story' },
  { navicue_type_id: 'lab__biographer__character_sheet', navicue_type_name: 'The Character Sheet', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_character_sheet', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Character Sheet', _lab_subtitle: 'Biographer × Post-Traumatic Growth', _lab_signature: 'biographer_character_sheet' },
  { navicue_type_id: 'lab__biographer__third_person_shift', navicue_type_name: 'The Third-Person Shift', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_third_person_shift', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Third-Person Shift', _lab_subtitle: 'Biographer × Illeism', _lab_signature: 'biographer_third_person_shift' },
  { navicue_type_id: 'lab__biographer__yet_append', navicue_type_name: 'The "Yet" Append', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_yet_append', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Yet" Append', _lab_subtitle: 'Biographer × Growth Mindset', _lab_signature: 'biographer_yet_append' },
  { navicue_type_id: 'lab__biographer__antagonist_audit', navicue_type_name: 'The Antagonist Audit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_antagonist_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Antagonist Audit', _lab_subtitle: 'Biographer × Perspective Taking', _lab_signature: 'biographer_antagonist_audit' },
  { navicue_type_id: 'lab__biographer__plot_twist', navicue_type_name: 'The Plot Twist', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_plot_twist', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Plot Twist', _lab_subtitle: 'Biographer × Cognitive Reappraisal', _lab_signature: 'biographer_plot_twist' },
  { navicue_type_id: 'lab__biographer__future_memoir', navicue_type_name: 'The Future Memoir', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_future_memoir', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Memoir', _lab_subtitle: 'Biographer × Prospective Hindsight', _lab_signature: 'biographer_future_memoir' },
  { navicue_type_id: 'lab__biographer__genre_switch', navicue_type_name: 'The Genre Switch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_genre_switch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Genre Switch', _lab_subtitle: 'Biographer × Distance-Based Reappraisal', _lab_signature: 'biographer_genre_switch' },
  { navicue_type_id: 'lab__biographer__supporting_cast', navicue_type_name: 'The Supporting Cast', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_supporting_cast', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Supporting Cast', _lab_subtitle: 'Biographer × Relational Savoring', _lab_signature: 'biographer_supporting_cast' },
  { navicue_type_id: 'lab__biographer__mythos_seal', navicue_type_name: 'The Mythos Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'biographer_mythos_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mythos Seal', _lab_subtitle: 'Biographer × Locus of Control', _lab_signature: 'biographer_mythos_seal' },
  // ── Act 54: THE OPTICIAN (Clarity Collection) ─── #585–#594 ──
  { navicue_type_id: 'lab__optician__prescription_check', navicue_type_name: 'The Prescription Check', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'optician_prescription_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Prescription Check', _lab_subtitle: 'Optician × The Blur', _lab_signature: 'optician_prescription_check' },
  { navicue_type_id: 'lab__optician__frame_crop', navicue_type_name: 'The Frame Crop', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'optician_frame_crop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Frame Crop', _lab_subtitle: 'Optician × Attentional Narrowing', _lab_signature: 'optician_frame_crop' },
  { navicue_type_id: 'lab__optician__filter_scrub', navicue_type_name: 'The Filter Scrub', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'optician_filter_scrub', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Filter Scrub', _lab_subtitle: 'Optician × Confirmation Bias', _lab_signature: 'optician_filter_scrub' },
  { navicue_type_id: 'lab__optician__inversion_goggles', navicue_type_name: 'The Inversion Goggles', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'optician_inversion_goggles', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inversion Goggles', _lab_subtitle: 'Optician × Perspective Flip', _lab_signature: 'optician_inversion_goggles' },
  { navicue_type_id: 'lab__optician__focus_pull', navicue_type_name: 'The Focus Pull', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'optician_focus_pull', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Focus Pull', _lab_subtitle: 'Optician × Selective Attention', _lab_signature: 'optician_focus_pull' },
  { navicue_type_id: 'lab__optician__contrast_adjust', navicue_type_name: 'The Contrast Adjust', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'optician_contrast_adjust', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Contrast Adjust', _lab_subtitle: 'Optician × Weber–Fechner Law', _lab_signature: 'optician_contrast_adjust' },
  { navicue_type_id: 'lab__optician__peripheral_scan', navicue_type_name: 'The Peripheral Scan', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'optician_peripheral_scan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Peripheral Scan', _lab_subtitle: 'Optician × Open Monitoring', _lab_signature: 'optician_peripheral_scan' },
  { navicue_type_id: 'lab__optician__broken_mirror', navicue_type_name: 'The Broken Mirror', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'optician_broken_mirror', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Broken Mirror', _lab_subtitle: 'Optician × Self-Image Distortion', _lab_signature: 'optician_broken_mirror' },
  { navicue_type_id: 'lab__optician__night_vision', navicue_type_name: 'The Night Vision', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'optician_night_vision', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Night Vision', _lab_subtitle: 'Optician × Scotopic Adaptation', _lab_signature: 'optician_night_vision' },
  { navicue_type_id: 'lab__optician__optician_seal', navicue_type_name: 'The Optician Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'optician_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Optician Seal', _lab_subtitle: 'Optician × Perceptual Agency', _lab_signature: 'optician_seal' },
  // ── Act 55: THE INTERPRETER (Empathy Collection) ─── #595–#604 ──
  { navicue_type_id: 'lab__interpreter__subtext_scanner', navicue_type_name: 'The Subtext Scanner', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'interpreter_subtext_scanner', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Subtext Scanner', _lab_subtitle: 'Interpreter × Emotional Intelligence', _lab_signature: 'interpreter_subtext_scanner' },
  { navicue_type_id: 'lab__interpreter__villain_de_mask', navicue_type_name: 'The Villain De-Mask', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'interpreter_villain_de_mask', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Villain De-Mask', _lab_subtitle: 'Interpreter × Fundamental Attribution Error', _lab_signature: 'interpreter_villain_de_mask' },
  { navicue_type_id: 'lab__interpreter__ladder_of_inference', navicue_type_name: 'The Ladder of Inference', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'interpreter_ladder_of_inference', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ladder of Inference', _lab_subtitle: 'Interpreter × Argyris Ladder', _lab_signature: 'interpreter_ladder_of_inference' },
  { navicue_type_id: 'lab__interpreter__benefit_of_doubt', navicue_type_name: 'The Benefit of Doubt', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'interpreter_benefit_of_doubt', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Benefit of Doubt', _lab_subtitle: 'Interpreter × Charitable Interpretation', _lab_signature: 'interpreter_benefit_of_doubt' },
  { navicue_type_id: 'lab__interpreter__translation_ear', navicue_type_name: 'The Translation Ear', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'interpreter_translation_ear', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Translation Ear', _lab_subtitle: 'Interpreter × NVC Translation', _lab_signature: 'interpreter_translation_ear' },
  { navicue_type_id: 'lab__interpreter__third_chair', navicue_type_name: 'The Third Chair', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'interpreter_third_chair', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Third Chair', _lab_subtitle: 'Interpreter × Observer Position', _lab_signature: 'interpreter_third_chair' },
  { navicue_type_id: 'lab__interpreter__pause_button', navicue_type_name: 'The Pause Button', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'interpreter_pause_button', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pause Button', _lab_subtitle: 'Interpreter × Response Inhibition', _lab_signature: 'interpreter_pause_button' },
  { navicue_type_id: 'lab__interpreter__steel_man', navicue_type_name: 'The Steel Man', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'interpreter_steel_man', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Steel Man', _lab_subtitle: 'Interpreter × Steelmanning', _lab_signature: 'interpreter_steel_man' },
  { navicue_type_id: 'lab__interpreter__mirror_neurons', navicue_type_name: 'The Mirror Neurons', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'interpreter_mirror_neurons', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror Neurons', _lab_subtitle: 'Interpreter × Embodied Cognition', _lab_signature: 'interpreter_mirror_neurons' },
  { navicue_type_id: 'lab__interpreter__interpreter_seal', navicue_type_name: 'The Interpreter Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'interpreter_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Interpreter Seal', _lab_subtitle: 'Interpreter × Rosetta Stone', _lab_signature: 'interpreter_seal' },
  // ── Act 56: THE DIPLOMAT (Social Physics Collection) ─── #605–#614 ──
  { navicue_type_id: 'lab__socialphysics__energy_redirect', navicue_type_name: 'The Energy Redirect', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'socialphysics_energy_redirect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Energy Redirect', _lab_subtitle: 'Social Physics × Aikido Redirect', _lab_signature: 'socialphysics_energy_redirect' },
  { navicue_type_id: 'lab__socialphysics__status_see_saw', navicue_type_name: 'The Status See-Saw', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'socialphysics_status_see_saw', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Status See-Saw', _lab_subtitle: 'Social Physics × Status Games', _lab_signature: 'socialphysics_status_see_saw' },
  { navicue_type_id: 'lab__socialphysics__silent_mirror', navicue_type_name: 'The Silent Mirror', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'socialphysics_silent_mirror', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silent Mirror', _lab_subtitle: 'Social Physics × Inhibition Control', _lab_signature: 'socialphysics_silent_mirror' },
  { navicue_type_id: 'lab__socialphysics__values_compass', navicue_type_name: 'The Values Compass', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'socialphysics_values_compass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Values Compass', _lab_subtitle: 'Social Physics × Value Commitment', _lab_signature: 'socialphysics_values_compass' },
  { navicue_type_id: 'lab__socialphysics__empathy_bridge', navicue_type_name: 'The Empathy Bridge', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'socialphysics_empathy_bridge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Empathy Bridge', _lab_subtitle: 'Social Physics × NVC Sequencing', _lab_signature: 'socialphysics_empathy_bridge' },
  { navicue_type_id: 'lab__socialphysics__boundary_forcefield', navicue_type_name: 'The Boundary Forcefield', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'socialphysics_boundary_forcefield', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Boundary Forcefield', _lab_subtitle: 'Social Physics × Rejection Sensitivity', _lab_signature: 'socialphysics_boundary_forcefield' },
  { navicue_type_id: 'lab__socialphysics__yes_and_weaver', navicue_type_name: 'The Yes And Weaver', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'socialphysics_yes_and_weaver', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Yes, And" Weaver', _lab_subtitle: 'Social Physics × Creative Synthesis', _lab_signature: 'socialphysics_yes_and_weaver' },
  { navicue_type_id: 'lab__socialphysics__trigger_disarm', navicue_type_name: 'The Trigger Disarm', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'socialphysics_trigger_disarm', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Trigger Disarm', _lab_subtitle: 'Social Physics × Internalization', _lab_signature: 'socialphysics_trigger_disarm' },
  { navicue_type_id: 'lab__socialphysics__perspective_drone', navicue_type_name: 'The Perspective Drone', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'socialphysics_perspective_drone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Perspective Drone', _lab_subtitle: 'Social Physics × Solomon\'s Paradox', _lab_signature: 'socialphysics_perspective_drone' },
  { navicue_type_id: 'lab__socialphysics__diplomat_seal', navicue_type_name: 'The Diplomat Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'socialphysics_diplomat_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Diplomat\'s Seal', _lab_subtitle: 'Social Physics × Conflict Transformation', _lab_signature: 'socialphysics_diplomat_seal' },
  // ── Act 57: THE TRIBALIST (Belonging Collection) ─── #615–#624 ──
  { navicue_type_id: 'lab__tribalist__signal_fire', navicue_type_name: 'The Signal Fire', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tribalist_signal_fire', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Signal Fire', _lab_subtitle: 'Tribalist × Authenticity Risk', _lab_signature: 'tribalist_signal_fire' },
  { navicue_type_id: 'lab__tribalist__circle_audit', navicue_type_name: 'The Circle Audit', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'tribalist_circle_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Circle Audit', _lab_subtitle: 'Tribalist × Boundary Conviction', _lab_signature: 'tribalist_circle_audit' },
  { navicue_type_id: 'lab__tribalist__gift_loop', navicue_type_name: 'The Gift Loop', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'tribalist_gift_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gift Loop', _lab_subtitle: 'Tribalist × Reciprocity', _lab_signature: 'tribalist_gift_loop' },
  { navicue_type_id: 'lab__tribalist__role_call', navicue_type_name: 'The Role Call', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'tribalist_role_call', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Role Call', _lab_subtitle: 'Tribalist × Self-Concept Clarity', _lab_signature: 'tribalist_role_call' },
  { navicue_type_id: 'lab__tribalist__vulnerability_key', navicue_type_name: 'The Vulnerability Key', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tribalist_vulnerability_key', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vulnerability Key', _lab_subtitle: 'Tribalist × Secure Attachment', _lab_signature: 'tribalist_vulnerability_key' },
  { navicue_type_id: 'lab__tribalist__social_battery', navicue_type_name: 'The Social Battery', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'tribalist_social_battery', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Social Battery', _lab_subtitle: 'Tribalist × Interoception', _lab_signature: 'tribalist_social_battery' },
  { navicue_type_id: 'lab__tribalist__echo_chamber_break', navicue_type_name: 'The Echo Chamber Break', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'tribalist_echo_chamber_break', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Echo Chamber Break', _lab_subtitle: 'Tribalist × Intellectual Humility', _lab_signature: 'tribalist_echo_chamber_break' },
  { navicue_type_id: 'lab__tribalist__ritual_maker', navicue_type_name: 'The Ritual Maker', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'tribalist_ritual_maker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ritual Maker', _lab_subtitle: 'Tribalist × Community Commitment', _lab_signature: 'tribalist_ritual_maker' },
  { navicue_type_id: 'lab__tribalist__gossip_firewall', navicue_type_name: 'The Gossip Firewall', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'tribalist_gossip_firewall', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gossip Firewall', _lab_subtitle: 'Tribalist × Ethical Embodiment', _lab_signature: 'tribalist_gossip_firewall' },
  { navicue_type_id: 'lab__tribalist__tribal_seal', navicue_type_name: 'The Tribal Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'tribalist_tribal_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Tribal Seal', _lab_subtitle: 'Tribalist × Roseto Effect', _lab_signature: 'tribalist_tribal_seal' },
  // ── Act 58: THE VALUATOR (Worth Collection) ─── #625–#634 ──
  { navicue_type_id: 'lab__valuator__price_tag', navicue_type_name: 'The Price Tag', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'valuator_price_tag', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Price Tag', _lab_subtitle: 'Valuator × Self-Valuation', _lab_signature: 'valuator_price_tag' },
  { navicue_type_id: 'lab__valuator__sunk_cost_cut', navicue_type_name: 'The Sunk Cost Cut', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'valuator_sunk_cost_cut', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sunk Cost Cut', _lab_subtitle: 'Valuator × Letting Go', _lab_signature: 'valuator_sunk_cost_cut' },
  { navicue_type_id: 'lab__valuator__asset_audit', navicue_type_name: 'The Asset Audit', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'valuator_asset_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Asset Audit', _lab_subtitle: 'Valuator × Relational Clarity', _lab_signature: 'valuator_asset_audit' },
  { navicue_type_id: 'lab__valuator__inflation_check', navicue_type_name: 'The Inflation Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'valuator_inflation_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inflation Check', _lab_subtitle: 'Valuator × Reality Testing', _lab_signature: 'valuator_inflation_check' },
  { navicue_type_id: 'lab__valuator__opportunity_cost', navicue_type_name: 'The Opportunity Cost', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'valuator_opportunity_cost', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Opportunity Cost', _lab_subtitle: 'Valuator × Executive Function', _lab_signature: 'valuator_opportunity_cost' },
  { navicue_type_id: 'lab__valuator__energy_ledger', navicue_type_name: 'The Energy Ledger', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'valuator_energy_ledger', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Energy Ledger', _lab_subtitle: 'Valuator × Somatic Limit', _lab_signature: 'valuator_energy_ledger' },
  { navicue_type_id: 'lab__valuator__negotiation_table', navicue_type_name: 'The Negotiation Table', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'valuator_negotiation_table', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Negotiation Table', _lab_subtitle: 'Valuator × Entitlement Efficacy', _lab_signature: 'valuator_negotiation_table' },
  { navicue_type_id: 'lab__valuator__scarcity_flip', navicue_type_name: 'The Scarcity Flip', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'valuator_scarcity_flip', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Scarcity Flip', _lab_subtitle: 'Valuator × Cognitive Reframing', _lab_signature: 'valuator_scarcity_flip' },
  { navicue_type_id: 'lab__valuator__quality_control', navicue_type_name: 'The Quality Control', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'valuator_quality_control', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Quality Control', _lab_subtitle: 'Valuator × Automated Metacognition', _lab_signature: 'valuator_quality_control' },
  { navicue_type_id: 'lab__valuator__gold_standard', navicue_type_name: 'The Gold Standard', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'valuator_gold_standard', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Gold Standard', _lab_subtitle: 'Valuator × Unconditional Self-Worth', _lab_signature: 'valuator_gold_standard' },
  // ── Act 59: THE EDITOR (Signal Collection) ─── #635–#644 ──
  { navicue_type_id: 'lab__editor__noise_gate', navicue_type_name: 'The Noise Gate', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'editor_noise_gate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Noise Gate', _lab_subtitle: 'Editor × Attentional Control', _lab_signature: 'editor_noise_gate' },
  { navicue_type_id: 'lab__editor__headline_rewrite', navicue_type_name: 'The Headline Rewrite', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'editor_headline_rewrite', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Headline Rewrite', _lab_subtitle: 'Editor × Affective Labeling', _lab_signature: 'editor_headline_rewrite' },
  { navicue_type_id: 'lab__editor__algorithm_audit', navicue_type_name: 'The Algorithm Audit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'editor_algorithm_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Algorithm Audit', _lab_subtitle: 'Editor × Digital Autonomy', _lab_signature: 'editor_algorithm_audit' },
  { navicue_type_id: 'lab__editor__kill_your_darlings', navicue_type_name: 'Kill Your Darlings', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'editor_kill_your_darlings', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Kill Your Darlings', _lab_subtitle: 'Editor × Decision Clarity', _lab_signature: 'editor_kill_your_darlings' },
  { navicue_type_id: 'lab__editor__zoom_out', navicue_type_name: 'The Zoom Out', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'editor_zoom_out', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Zoom Out', _lab_subtitle: 'Editor × Solution Focus', _lab_signature: 'editor_zoom_out' },
  { navicue_type_id: 'lab__editor__fact_check', navicue_type_name: 'The Fact Check', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'editor_fact_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fact Check', _lab_subtitle: 'Editor × Epistemic Humility', _lab_signature: 'editor_fact_check' },
  { navicue_type_id: 'lab__editor__continuity_fix', navicue_type_name: 'The Continuity Fix', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'editor_continuity_fix', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Continuity Fix', _lab_subtitle: 'Editor × Self-Compassion', _lab_signature: 'editor_continuity_fix' },
  { navicue_type_id: 'lab__editor__mute_button', navicue_type_name: 'The Mute Button', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'editor_mute_button', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mute Button', _lab_subtitle: 'Editor × Selective Attention', _lab_signature: 'editor_mute_button' },
  { navicue_type_id: 'lab__editor__color_grade', navicue_type_name: 'The Color Grade', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'editor_color_grade', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Color Grade', _lab_subtitle: 'Editor × Positive Reappraisal', _lab_signature: 'editor_color_grade' },
  { navicue_type_id: 'lab__editor__final_cut', navicue_type_name: 'The Final Cut', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'editor_final_cut', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Final Cut', _lab_subtitle: 'Editor × Narrative Closure', _lab_signature: 'editor_final_cut' },
  // ── Act 60: THE GRANDMASTER (Systems Collection) ─── #645–#654 ──
  { navicue_type_id: 'lab__grandmaster__meta_view', navicue_type_name: 'The Meta-View', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'grandmaster_meta_view', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Meta-View', _lab_subtitle: 'Grandmaster × Systems Thinking', _lab_signature: 'grandmaster_meta_view' },
  { navicue_type_id: 'lab__grandmaster__second_order', navicue_type_name: 'The Second Order', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'grandmaster_second_order', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Second Order', _lab_subtitle: 'Grandmaster × Consequence Awareness', _lab_signature: 'grandmaster_second_order' },
  { navicue_type_id: 'lab__grandmaster__leverage_point', navicue_type_name: 'The Leverage Point', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'grandmaster_leverage_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Leverage Point', _lab_subtitle: 'Grandmaster × Strategic Efficiency', _lab_signature: 'grandmaster_leverage_point' },
  { navicue_type_id: 'lab__grandmaster__positive_sum', navicue_type_name: 'The Positive Sum', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'grandmaster_positive_sum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Positive Sum', _lab_subtitle: 'Grandmaster × Abundance Mindset', _lab_signature: 'grandmaster_positive_sum' },
  { navicue_type_id: 'lab__grandmaster__sunk_cost_eject', navicue_type_name: 'The Sunk Cost Eject', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'grandmaster_sunk_cost_eject', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sunk Cost Eject', _lab_subtitle: 'Grandmaster × Sunk Cost Resistance', _lab_signature: 'grandmaster_sunk_cost_eject' },
  { navicue_type_id: 'lab__grandmaster__fog_of_war', navicue_type_name: 'The Fog of War', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'grandmaster_fog_of_war', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fog of War', _lab_subtitle: 'Grandmaster × Risk Prioritization', _lab_signature: 'grandmaster_fog_of_war' },
  { navicue_type_id: 'lab__grandmaster__tempo_control', navicue_type_name: 'The Tempo Control', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'grandmaster_tempo_control', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tempo Control', _lab_subtitle: 'Grandmaster × Composure', _lab_signature: 'grandmaster_tempo_control' },
  { navicue_type_id: 'lab__grandmaster__inversion', navicue_type_name: 'The Inversion', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'grandmaster_inversion', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inversion', _lab_subtitle: 'Grandmaster × Via Negativa', _lab_signature: 'grandmaster_inversion' },
  { navicue_type_id: 'lab__grandmaster__optionality', navicue_type_name: 'The Optionality Key', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'grandmaster_optionality', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Optionality Key', _lab_subtitle: 'Grandmaster × Commitment Timing', _lab_signature: 'grandmaster_optionality' },
  { navicue_type_id: 'lab__grandmaster__grandmaster_seal', navicue_type_name: 'The Grandmaster Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'grandmaster_grandmaster_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Grandmaster Seal', _lab_subtitle: 'Grandmaster × Antifragility', _lab_signature: 'grandmaster_grandmaster_seal' },
  // ── Act 61: THE CATALYST (Influence Collection) ─── #655–#664 ──
  { navicue_type_id: 'lab__catalyst__activation_energy', navicue_type_name: 'The Activation Energy', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'catalyst_activation_energy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Activation Energy', _lab_subtitle: 'Catalyst × Empathy for Resistance', _lab_signature: 'catalyst_activation_energy' },
  { navicue_type_id: 'lab__catalyst__mirroring_tune', navicue_type_name: 'The Mirroring Tune', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'catalyst_mirroring_tune', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirroring Tune', _lab_subtitle: 'Catalyst × Rapport Building', _lab_signature: 'catalyst_mirroring_tune' },
  { navicue_type_id: 'lab__catalyst__trojan_horse', navicue_type_name: 'The Trojan Horse', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'catalyst_trojan_horse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Trojan Horse', _lab_subtitle: 'Catalyst × Narrative Persuasion', _lab_signature: 'catalyst_trojan_horse' },
  { navicue_type_id: 'lab__catalyst__silence_vacuum', navicue_type_name: 'The Silence Vacuum', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'catalyst_silence_vacuum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silence Vacuum', _lab_subtitle: 'Catalyst × Distress Tolerance', _lab_signature: 'catalyst_silence_vacuum' },
  { navicue_type_id: 'lab__catalyst__label_inception', navicue_type_name: 'The Label Inception', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'catalyst_label_inception', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Label Inception', _lab_subtitle: 'Catalyst × Pygmalion Effect', _lab_signature: 'catalyst_label_inception' },
  { navicue_type_id: 'lab__catalyst__vulnerability_drop', navicue_type_name: 'The Vulnerability Drop', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'catalyst_vulnerability_drop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vulnerability Drop', _lab_subtitle: 'Catalyst × First-Mover Trust', _lab_signature: 'catalyst_vulnerability_drop' },
  { navicue_type_id: 'lab__catalyst__but_to_and', navicue_type_name: 'The But to And', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'catalyst_but_to_and', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The But to And', _lab_subtitle: 'Catalyst × Inclusive Communication', _lab_signature: 'catalyst_but_to_and' },
  { navicue_type_id: 'lab__catalyst__future_pace', navicue_type_name: 'The Future Pace', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'catalyst_future_pace', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Pace', _lab_subtitle: 'Catalyst × Persuasive Visualization', _lab_signature: 'catalyst_future_pace' },
  { navicue_type_id: 'lab__catalyst__question_hook', navicue_type_name: 'The Question Hook', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'catalyst_question_hook', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Question Hook', _lab_subtitle: 'Catalyst × Epistemic Curiosity', _lab_signature: 'catalyst_question_hook' },
  { navicue_type_id: 'lab__catalyst__catalyst_seal', navicue_type_name: 'The Catalyst Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'catalyst_catalyst_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Catalyst Seal', _lab_subtitle: 'Catalyst × Social Contagion', _lab_signature: 'catalyst_catalyst_seal' },
  // ── Act 62: THE KINETIC (Action Collection) ─── #665–#674 ──
  { navicue_type_id: 'lab__kinetic__inertia_break', navicue_type_name: 'The Inertia Break', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'kinetic_inertia_break', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inertia Break', _lab_subtitle: 'Kinetic × Activation Energy', _lab_signature: 'kinetic_inertia_break' },
  { navicue_type_id: 'lab__kinetic__micro_step', navicue_type_name: 'The Micro-Step', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'kinetic_micro_step', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Micro-Step', _lab_subtitle: 'Kinetic × Operationalizing', _lab_signature: 'kinetic_micro_step' },
  { navicue_type_id: 'lab__kinetic__flow_trigger', navicue_type_name: 'The Flow Trigger', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'kinetic_flow_trigger', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Flow Trigger', _lab_subtitle: 'Kinetic × Cognitive Jitter', _lab_signature: 'kinetic_flow_trigger' },
  { navicue_type_id: 'lab__kinetic__burn_rate', navicue_type_name: 'The Burn Rate', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'kinetic_burn_rate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Burn Rate', _lab_subtitle: 'Kinetic × Sustainability', _lab_signature: 'kinetic_burn_rate' },
  { navicue_type_id: 'lab__kinetic__friction_polish', navicue_type_name: 'The Friction Polish', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'kinetic_friction_polish', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Polish', _lab_subtitle: 'Kinetic × Environmental Design', _lab_signature: 'kinetic_friction_polish' },
  { navicue_type_id: 'lab__kinetic__pivot', navicue_type_name: 'The Pivot', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'kinetic_pivot', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pivot', _lab_subtitle: 'Kinetic × Cognitive Agility', _lab_signature: 'kinetic_pivot' },
  { navicue_type_id: 'lab__kinetic__momentum_save', navicue_type_name: 'The Momentum Save', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'kinetic_momentum_save', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Momentum Save', _lab_subtitle: 'Kinetic × Compound Interest', _lab_signature: 'kinetic_momentum_save' },
  { navicue_type_id: 'lab__kinetic__good_enough_ship', navicue_type_name: 'The Good Enough Ship', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'kinetic_good_enough_ship', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Good Enough Ship', _lab_subtitle: 'Kinetic × Completion Bias', _lab_signature: 'kinetic_good_enough_ship' },
  { navicue_type_id: 'lab__kinetic__rest_stop', navicue_type_name: 'The Rest Stop', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'kinetic_rest_stop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rest Stop', _lab_subtitle: 'Kinetic × Active Recovery', _lab_signature: 'kinetic_rest_stop' },
  { navicue_type_id: 'lab__kinetic__kinetic_seal', navicue_type_name: 'The Kinetic Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'kinetic_kinetic_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Kinetic Seal', _lab_subtitle: 'Kinetic × Newton\'s First Law', _lab_signature: 'kinetic_kinetic_seal' },
  // ── Act 63: THE ADAPTIVE (Resilience Collection) ─── #675–#684 ──
  { navicue_type_id: 'lab__adaptive__elastic_snap', navicue_type_name: 'The Elastic Snap', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'adaptive_elastic_snap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Elastic Snap', _lab_subtitle: 'Adaptive × Stress Mindset', _lab_signature: 'adaptive_elastic_snap' },
  { navicue_type_id: 'lab__adaptive__kintsugi_repair', navicue_type_name: 'The Kintsugi Repair', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'adaptive_kintsugi_repair', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Kintsugi Repair', _lab_subtitle: 'Adaptive × Self-Acceptance', _lab_signature: 'adaptive_kintsugi_repair' },
  { navicue_type_id: 'lab__adaptive__immune_response', navicue_type_name: 'The Immune Response', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'adaptive_immune_response', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Immune Response', _lab_subtitle: 'Adaptive × Growth Mindset', _lab_signature: 'adaptive_immune_response' },
  { navicue_type_id: 'lab__adaptive__water_mode', navicue_type_name: 'The Water Mode', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'adaptive_water_mode', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Water Mode', _lab_subtitle: 'Adaptive × Somatic Fluidity', _lab_signature: 'adaptive_water_mode' },
  { navicue_type_id: 'lab__adaptive__shock_absorber', navicue_type_name: 'The Shock Absorber', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'adaptive_shock_absorber', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shock Absorber', _lab_subtitle: 'Adaptive × Body Awareness', _lab_signature: 'adaptive_shock_absorber' },
  { navicue_type_id: 'lab__adaptive__compost_bin', navicue_type_name: 'The Compost Bin', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'adaptive_compost_bin', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compost Bin', _lab_subtitle: 'Adaptive × Post-Traumatic Growth', _lab_signature: 'adaptive_compost_bin' },
  { navicue_type_id: 'lab__adaptive__scar_tissue', navicue_type_name: 'The Scar Tissue', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'adaptive_scar_tissue', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Scar Tissue', _lab_subtitle: 'Adaptive × Meaning Making', _lab_signature: 'adaptive_scar_tissue' },
  { navicue_type_id: 'lab__adaptive__root_deepen', navicue_type_name: 'The Root Deepen', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'adaptive_root_deepen', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Root Deepen', _lab_subtitle: 'Adaptive × Physiological Regulation', _lab_signature: 'adaptive_root_deepen' },
  { navicue_type_id: 'lab__adaptive__phoenix_burn', navicue_type_name: 'The Phoenix Burn', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'adaptive_phoenix_burn', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phoenix Burn', _lab_subtitle: 'Adaptive × Identity Renewal', _lab_signature: 'adaptive_phoenix_burn' },
  { navicue_type_id: 'lab__adaptive__adaptive_seal', navicue_type_name: 'The Adaptive Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'adaptive_adaptive_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Adaptive Seal', _lab_subtitle: 'Adaptive × Neuroplasticity', _lab_signature: 'adaptive_adaptive_seal' },
  // ── Act 64: THE SHADOW WORKER (Integration Collection) ─── #685–#694 ──
  { navicue_type_id: 'lab__shadow__projection_check', navicue_type_name: 'The Projection Check', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'shadow_projection_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Projection Check', _lab_subtitle: 'Shadow × Self-Awareness', _lab_signature: 'shadow_projection_check' },
  { navicue_type_id: 'lab__shadow__golden_shadow', navicue_type_name: 'The Golden Shadow', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shadow_golden_shadow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Golden Shadow', _lab_subtitle: 'Shadow × Self-Efficacy', _lab_signature: 'shadow_golden_shadow' },
  { navicue_type_id: 'lab__shadow__secret_oath', navicue_type_name: 'The Secret Oath', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'shadow_secret_oath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Secret Oath', _lab_subtitle: 'Shadow × Childhood Vows', _lab_signature: 'shadow_secret_oath' },
  { navicue_type_id: 'lab__shadow__monster_feed', navicue_type_name: 'The Monster Feed', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shadow_monster_feed', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Monster Feed', _lab_subtitle: 'Shadow × Internal Integration', _lab_signature: 'shadow_monster_feed' },
  { navicue_type_id: 'lab__shadow__shame_compass', navicue_type_name: 'The Shame Compass', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'shadow_shame_compass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shame Compass', _lab_subtitle: 'Shadow × Cognitive Reappraisal', _lab_signature: 'shadow_shame_compass' },
  { navicue_type_id: 'lab__shadow__inner_child_rescue', navicue_type_name: 'The Inner Child Rescue', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'shadow_inner_child_rescue', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inner Child Rescue', _lab_subtitle: 'Shadow × Self-Soothing', _lab_signature: 'shadow_inner_child_rescue' },
  { navicue_type_id: 'lab__shadow__dream_dive', navicue_type_name: 'The Dream Dive', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'shadow_dream_dive', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dream Dive', _lab_subtitle: 'Shadow × Symbolic Fluency', _lab_signature: 'shadow_dream_dive' },
  { navicue_type_id: 'lab__shadow__trigger_trace', navicue_type_name: 'The Trigger Trace', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'shadow_trigger_trace', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Trigger Trace', _lab_subtitle: 'Shadow × Psychodynamic Insight', _lab_signature: 'shadow_trigger_trace' },
  { navicue_type_id: 'lab__shadow__integration_dialogue', navicue_type_name: 'The Integration Dialogue', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'shadow_integration_dialogue', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Integration Dialogue', _lab_subtitle: 'Shadow × Internal Harmony', _lab_signature: 'shadow_integration_dialogue' },
  { navicue_type_id: 'lab__shadow__shadow_seal', navicue_type_name: 'The Shadow Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'shadow_shadow_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Shadow Seal', _lab_subtitle: 'Shadow × Individuation', _lab_signature: 'shadow_shadow_seal' },
  // ── Act 65: THE ANCESTOR (Lineage Collection) ─── #695–#704 ──
  { navicue_type_id: 'lab__ancestor__epigenetic_switch', navicue_type_name: 'The Epigenetic Switch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ancestor_epigenetic_switch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Epigenetic Switch', _lab_subtitle: 'Ancestor × Biological Plasticity', _lab_signature: 'ancestor_epigenetic_switch' },
  { navicue_type_id: 'lab__ancestor__lineage_audit', navicue_type_name: 'The Lineage Audit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ancestor_lineage_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lineage Audit', _lab_subtitle: 'Ancestor × Differentiation', _lab_signature: 'ancestor_lineage_audit' },
  { navicue_type_id: 'lab__ancestor__council_of_elders', navicue_type_name: 'The Council of Elders', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'ancestor_council_of_elders', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Council of Elders', _lab_subtitle: 'Ancestor × Deep Wisdom', _lab_signature: 'ancestor_council_of_elders' },
  { navicue_type_id: 'lab__ancestor__trauma_breaker', navicue_type_name: 'The Trauma Breaker', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ancestor_trauma_breaker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Trauma Breaker', _lab_subtitle: 'Ancestor × Circuit Breaker', _lab_signature: 'ancestor_trauma_breaker' },
  { navicue_type_id: 'lab__ancestor__gift_inheritance', navicue_type_name: 'The Gift Inheritance', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ancestor_gift_inheritance', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gift Inheritance', _lab_subtitle: 'Ancestor × Positive Identity', _lab_signature: 'ancestor_gift_inheritance' },
  { navicue_type_id: 'lab__ancestor__name_reclaim', navicue_type_name: 'The Name Reclaim', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ancestor_name_reclaim', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Name Reclaim', _lab_subtitle: 'Ancestor × Self-Definition', _lab_signature: 'ancestor_name_reclaim' },
  { navicue_type_id: 'lab__ancestor__seven_generations', navicue_type_name: 'The Seven Generations', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ancestor_seven_generations', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Seven Generations', _lab_subtitle: 'Ancestor × Cathedral Thinking', _lab_signature: 'ancestor_seven_generations' },
  { navicue_type_id: 'lab__ancestor__bone_wisdom', navicue_type_name: 'The Bone Wisdom', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'ancestor_bone_wisdom', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Bone Wisdom', _lab_subtitle: 'Ancestor × Somatic Grounding', _lab_signature: 'ancestor_bone_wisdom' },
  { navicue_type_id: 'lab__ancestor__torch_pass', navicue_type_name: 'The Torch Pass', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ancestor_torch_pass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Torch Pass', _lab_subtitle: 'Ancestor × Agency', _lab_signature: 'ancestor_torch_pass' },
  { navicue_type_id: 'lab__ancestor__ancestral_seal', navicue_type_name: 'The Ancestral Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'ancestor_ancestral_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ancestral Seal', _lab_subtitle: 'Ancestor × Transgenerational Resilience', _lab_signature: 'ancestor_ancestral_seal' },
  // ── Act 66: THE TRICKSTER (Play Collection) ─── #705–#714 ──
  { navicue_type_id: 'lab__trickster__absurdity_filter', navicue_type_name: 'The Absurdity Filter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'trickster_absurdity_filter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Absurdity Filter', _lab_subtitle: 'Trickster × Humor as Coping', _lab_signature: 'trickster_absurdity_filter' },
  { navicue_type_id: 'lab__trickster__wrong_answers_only', navicue_type_name: 'Wrong Answers Only', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'trickster_wrong_answers_only', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Wrong Answers Only', _lab_subtitle: 'Trickster × Lateral Thinking', _lab_signature: 'trickster_wrong_answers_only' },
  { navicue_type_id: 'lab__trickster__dance_break', navicue_type_name: 'The Dance Break', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'trickster_dance_break', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dance Break', _lab_subtitle: 'Trickster × Somatic Release', _lab_signature: 'trickster_dance_break' },
  { navicue_type_id: 'lab__trickster__rule_breaker', navicue_type_name: 'The Rule Breaker', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'trickster_rule_breaker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rule Breaker', _lab_subtitle: 'Trickster × Autonomous Thinking', _lab_signature: 'trickster_rule_breaker' },
  { navicue_type_id: 'lab__trickster__avatar_swap', navicue_type_name: 'The Avatar Swap', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'trickster_avatar_swap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Avatar Swap', _lab_subtitle: 'Trickster × Cognitive Flexibility', _lab_signature: 'trickster_avatar_swap' },
  { navicue_type_id: 'lab__trickster__mess_maker', navicue_type_name: 'The Mess Maker', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'trickster_mess_maker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mess Maker', _lab_subtitle: 'Trickster × Inhibition Release', _lab_signature: 'trickster_mess_maker' },
  { navicue_type_id: 'lab__trickster__primal_scream', navicue_type_name: 'The Primal Scream', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'trickster_primal_scream', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Primal Scream', _lab_subtitle: 'Trickster × Cathartic Release', _lab_signature: 'trickster_primal_scream' },
  { navicue_type_id: 'lab__trickster__yes_lets', navicue_type_name: 'The "Yes, Let\'s"', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'trickster_yes_lets', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Yes, Let\'s"', _lab_subtitle: 'Trickster × Spontaneity', _lab_signature: 'trickster_yes_lets' },
  { navicue_type_id: 'lab__trickster__sandbox_mode', navicue_type_name: 'Sandbox Mode', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'trickster_sandbox_mode', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Sandbox Mode', _lab_subtitle: 'Trickster × Intrinsic Motivation', _lab_signature: 'trickster_sandbox_mode' },
  { navicue_type_id: 'lab__trickster__trickster_seal', navicue_type_name: 'The Trickster Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'trickster_trickster_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Trickster Seal', _lab_subtitle: 'Trickster × Gelotology', _lab_signature: 'trickster_trickster_seal' },
  // ── Act 67: THE ASTRONAUT (Awe Collection) ─── #715–#724 ──
  { navicue_type_id: 'lab__astronaut__overview_effect', navicue_type_name: 'The Overview Effect', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'astronaut_overview_effect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Overview Effect', _lab_subtitle: 'Astronaut × Small Self', _lab_signature: 'astronaut_overview_effect' },
  { navicue_type_id: 'lab__astronaut__deep_time_scroll', navicue_type_name: 'The Deep Time Scroll', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'astronaut_deep_time_scroll', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deep Time Scroll', _lab_subtitle: 'Astronaut × Temporal Distancing', _lab_signature: 'astronaut_deep_time_scroll' },
  { navicue_type_id: 'lab__astronaut__fractal_zoom', navicue_type_name: 'The Fractal Zoom', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'astronaut_fractal_zoom', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fractal Zoom', _lab_subtitle: 'Astronaut × Deconstruction', _lab_signature: 'astronaut_fractal_zoom' },
  { navicue_type_id: 'lab__astronaut__nature_bath', navicue_type_name: 'The Nature Bath', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'astronaut_nature_bath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Nature Bath', _lab_subtitle: 'Astronaut × Attention Restoration', _lab_signature: 'astronaut_nature_bath' },
  { navicue_type_id: 'lab__astronaut__sonic_boom', navicue_type_name: 'The Sonic Boom', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'astronaut_sonic_boom', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sonic Boom', _lab_subtitle: 'Astronaut × Contrast Reset', _lab_signature: 'astronaut_sonic_boom' },
  { navicue_type_id: 'lab__astronaut__galaxy_spin', navicue_type_name: 'The Galaxy Spin', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'astronaut_galaxy_spin', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Galaxy Spin', _lab_subtitle: 'Astronaut × Cosmic Connection', _lab_signature: 'astronaut_galaxy_spin' },
  { navicue_type_id: 'lab__astronaut__ocean_breath', navicue_type_name: 'The Ocean Breath', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'astronaut_ocean_breath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ocean Breath', _lab_subtitle: 'Astronaut × Respiratory Entrainment', _lab_signature: 'astronaut_ocean_breath' },
  { navicue_type_id: 'lab__astronaut__altruism_spark', navicue_type_name: 'The Altruism Spark', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'astronaut_altruism_spark', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Altruism Spark', _lab_subtitle: 'Astronaut × Elevation', _lab_signature: 'astronaut_altruism_spark' },
  { navicue_type_id: 'lab__astronaut__deathbed_view', navicue_type_name: 'The Deathbed View', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'astronaut_deathbed_view', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deathbed View', _lab_subtitle: 'Astronaut × Mortality Salience', _lab_signature: 'astronaut_deathbed_view' },
  { navicue_type_id: 'lab__astronaut__astronaut_seal', navicue_type_name: 'The Astronaut Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'astronaut_astronaut_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Astronaut Seal', _lab_subtitle: 'Astronaut × Self-Transcendence', _lab_signature: 'astronaut_astronaut_seal' },
  // ── Act 68: THE WONDERER (Curiosity Collection) ─── #725–#734 ──
  { navicue_type_id: 'lab__wonderer__what_if_lever', navicue_type_name: 'The "What If" Lever', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wonderer_what_if_lever', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "What If" Lever', _lab_subtitle: 'Wonderer × Divergent Thinking', _lab_signature: 'wonderer_what_if_lever' },
  { navicue_type_id: 'lab__wonderer__shoshin_reset', navicue_type_name: 'The Shoshin Reset', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'wonderer_shoshin_reset', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shoshin Reset', _lab_subtitle: 'Wonderer × Cognitive Unlearning', _lab_signature: 'wonderer_shoshin_reset' },
  { navicue_type_id: 'lab__wonderer__fractal_question', navicue_type_name: 'The Fractal Question', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'wonderer_fractal_question', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fractal Question', _lab_subtitle: 'Wonderer × Deep Inquiry', _lab_signature: 'wonderer_fractal_question' },
  { navicue_type_id: 'lab__wonderer__rabbit_hole', navicue_type_name: 'The Rabbit Hole', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wonderer_rabbit_hole', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rabbit Hole', _lab_subtitle: 'Wonderer × Productive Procrastination', _lab_signature: 'wonderer_rabbit_hole' },
  { navicue_type_id: 'lab__wonderer__texture_audit', navicue_type_name: 'The Texture Audit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'wonderer_texture_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Texture Audit', _lab_subtitle: 'Wonderer × Sensory Grounding', _lab_signature: 'wonderer_texture_audit' },
  { navicue_type_id: 'lab__wonderer__jigsaw_pivot', navicue_type_name: 'The Jigsaw Pivot', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'wonderer_jigsaw_pivot', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Jigsaw Pivot', _lab_subtitle: 'Wonderer × Low Confirmation Bias', _lab_signature: 'wonderer_jigsaw_pivot' },
  { navicue_type_id: 'lab__wonderer__impossible_list', navicue_type_name: 'The Impossible List', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wonderer_impossible_list', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Impossible List', _lab_subtitle: 'Wonderer × Self-Efficacy', _lab_signature: 'wonderer_impossible_list' },
  { navicue_type_id: 'lab__wonderer__color_thief', navicue_type_name: 'The Color Thief', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'wonderer_color_thief', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Color Thief', _lab_subtitle: 'Wonderer × Exteroception', _lab_signature: 'wonderer_color_thief' },
  { navicue_type_id: 'lab__wonderer__mystery_door', navicue_type_name: 'The Mystery Door', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'wonderer_mystery_door', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mystery Door', _lab_subtitle: 'Wonderer × Growth Mindset', _lab_signature: 'wonderer_mystery_door' },
  { navicue_type_id: 'lab__wonderer__wonder_seal', navicue_type_name: 'The Wonder Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'wonderer_wonder_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Wonder Seal', _lab_subtitle: 'Wonderer × Epistemic Curiosity', _lab_signature: 'wonderer_wonder_seal' },
  // ── Act 69: THE SURFER (Flow Collection) ─── #735–#744 ──
  { navicue_type_id: 'lab__surfer__wu_wei_slide', navicue_type_name: 'The Wu Wei Slide', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'surfer_wu_wei_slide', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wu Wei Slide', _lab_subtitle: 'Surfer × Trust in Process', _lab_signature: 'surfer_wu_wei_slide' },
  { navicue_type_id: 'lab__surfer__rhythm_game', navicue_type_name: 'The Rhythm Game', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'surfer_rhythm_game', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rhythm Game', _lab_subtitle: 'Surfer × Transient Hypofrontality', _lab_signature: 'surfer_rhythm_game' },
  { navicue_type_id: 'lab__surfer__breath_synchro', navicue_type_name: 'The Breath Synchro', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'surfer_breath_synchro', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Breath Synchro', _lab_subtitle: 'Surfer × Physiological Entrainment', _lab_signature: 'surfer_breath_synchro' },
  { navicue_type_id: 'lab__surfer__friction_remover', navicue_type_name: 'The Friction Remover', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'surfer_friction_remover', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Remover', _lab_subtitle: 'Surfer × Systems Awareness', _lab_signature: 'surfer_friction_remover' },
  { navicue_type_id: 'lab__surfer__good_enough_release', navicue_type_name: 'The "Good Enough" Release', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'surfer_good_enough_release', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Good Enough" Release', _lab_subtitle: 'Surfer × Muscle Release', _lab_signature: 'surfer_good_enough_release' },
  { navicue_type_id: 'lab__surfer__current_check', navicue_type_name: 'The Current Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'surfer_current_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Current Check', _lab_subtitle: 'Surfer × Radical Acceptance', _lab_signature: 'surfer_current_check' },
  { navicue_type_id: 'lab__surfer__soft_eyes', navicue_type_name: 'Soft Eyes', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'surfer_soft_eyes', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Soft Eyes', _lab_subtitle: 'Surfer × Visual Gating', _lab_signature: 'surfer_soft_eyes' },
  { navicue_type_id: 'lab__surfer__micro_flow', navicue_type_name: 'The Micro-Flow', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'surfer_micro_flow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Micro-Flow', _lab_subtitle: 'Surfer × Yerkes-Dodson', _lab_signature: 'surfer_micro_flow' },
  { navicue_type_id: 'lab__surfer__momentum_save', navicue_type_name: 'The Momentum Save', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'surfer_momentum_save', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Momentum Save', _lab_subtitle: 'Surfer × Flywheel Effect', _lab_signature: 'surfer_momentum_save' },
  { navicue_type_id: 'lab__surfer__surfer_seal', navicue_type_name: 'The Surfer Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'surfer_surfer_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Surfer Seal', _lab_subtitle: 'Surfer × Flow State', _lab_signature: 'surfer_surfer_seal' },
  // ── Act 70: THE MEANING MAKER (Purpose Collection) ─── #745–#754 ──
  { navicue_type_id: 'lab__meaning__suffering_audit', navicue_type_name: 'The Suffering Audit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'meaning_suffering_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Suffering Audit', _lab_subtitle: 'Meaning × Cognitive Reframing', _lab_signature: 'meaning_suffering_audit' },
  { navicue_type_id: 'lab__meaning__legacy_letter', navicue_type_name: 'The Legacy Letter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'meaning_legacy_letter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Legacy Letter', _lab_subtitle: 'Meaning × Generativity', _lab_signature: 'meaning_legacy_letter' },
  { navicue_type_id: 'lab__meaning__tombstone_edit', navicue_type_name: 'The Tombstone Edit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'meaning_tombstone_edit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tombstone Edit', _lab_subtitle: 'Meaning × Intrinsic Values', _lab_signature: 'meaning_tombstone_edit' },
  { navicue_type_id: 'lab__meaning__ikigai_intersection', navicue_type_name: 'The Ikigai Intersection', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'meaning_ikigai_intersection', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ikigai Intersection', _lab_subtitle: 'Meaning × Self-Correction', _lab_signature: 'meaning_ikigai_intersection' },
  { navicue_type_id: 'lab__meaning__why_ladder', navicue_type_name: 'The "Why" Ladder', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'meaning_why_ladder', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The "Why" Ladder', _lab_subtitle: 'Meaning × Deep Motivation', _lab_signature: 'meaning_why_ladder' },
  { navicue_type_id: 'lab__meaning__service_shift', navicue_type_name: 'The Service Shift', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'meaning_service_shift', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Service Shift', _lab_subtitle: 'Meaning × Attentional Outwardness', _lab_signature: 'meaning_service_shift' },
  { navicue_type_id: 'lab__meaning__gratitude_lens', navicue_type_name: 'The Gratitude Lens', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'meaning_gratitude_lens', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gratitude Lens', _lab_subtitle: 'Meaning × Savoring', _lab_signature: 'meaning_gratitude_lens' },
  { navicue_type_id: 'lab__meaning__alignment_compass', navicue_type_name: 'The Alignment Compass', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'meaning_alignment_compass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Alignment Compass', _lab_subtitle: 'Meaning × Somatic Integrity', _lab_signature: 'meaning_alignment_compass' },
  { navicue_type_id: 'lab__meaning__cosmic_joke', navicue_type_name: 'The Cosmic Joke', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'meaning_cosmic_joke', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cosmic Joke', _lab_subtitle: 'Meaning × Transcendent Humor', _lab_signature: 'meaning_cosmic_joke' },
  { navicue_type_id: 'lab__meaning__meaning_seal', navicue_type_name: 'The Meaning Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'meaning_meaning_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Meaning Seal', _lab_subtitle: 'Meaning × Sense of Coherence', _lab_signature: 'meaning_meaning_seal' },
  // ── Act 71: THE SERVANT (Contribution Collection) ─── #755–#764 ──
  { navicue_type_id: 'lab__servant__ripple_effect', navicue_type_name: 'The Ripple Effect', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'servant_ripple_effect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ripple Effect', _lab_subtitle: 'Servant × Interconnectedness', _lab_signature: 'servant_ripple_effect' },
  { navicue_type_id: 'lab__servant__oxygen_mask', navicue_type_name: 'The Oxygen Mask', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'servant_oxygen_mask', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Oxygen Mask', _lab_subtitle: 'Servant × Strategic Self-Care', _lab_signature: 'servant_oxygen_mask' },
  { navicue_type_id: 'lab__servant__empty_chair', navicue_type_name: 'The Empty Chair', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'servant_empty_chair', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Empty Chair', _lab_subtitle: 'Servant × Prosocial Action', _lab_signature: 'servant_empty_chair' },
  { navicue_type_id: 'lab__servant__gardeners_patience', navicue_type_name: 'The Gardener\'s Patience', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'servant_gardeners_patience', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gardener\'s Patience', _lab_subtitle: 'Servant × Delayed Gratification', _lab_signature: 'servant_gardeners_patience' },
  { navicue_type_id: 'lab__servant__listening_ear', navicue_type_name: 'The Listening Ear', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'servant_listening_ear', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Listening Ear', _lab_subtitle: 'Servant × Active Listening', _lab_signature: 'servant_listening_ear' },
  { navicue_type_id: 'lab__servant__kindness_boomerang', navicue_type_name: 'The Kindness Boomerang', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'servant_kindness_boomerang', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Kindness Boomerang', _lab_subtitle: 'Servant × Reciprocity Faith', _lab_signature: 'servant_kindness_boomerang' },
  { navicue_type_id: 'lab__servant__ego_dissolve', navicue_type_name: 'The Ego Dissolve', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'servant_ego_dissolve', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ego Dissolve', _lab_subtitle: 'Servant × Ego Transcendence', _lab_signature: 'servant_ego_dissolve' },
  { navicue_type_id: 'lab__servant__mentors_hand', navicue_type_name: 'The Mentor\'s Hand', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'servant_mentors_hand', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mentor\'s Hand', _lab_subtitle: 'Servant × Generativity', _lab_signature: 'servant_mentors_hand' },
  { navicue_type_id: 'lab__servant__invisible_thread', navicue_type_name: 'The Invisible Thread', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'servant_invisible_thread', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Invisible Thread', _lab_subtitle: 'Servant × Interdependence', _lab_signature: 'servant_invisible_thread' },
  { navicue_type_id: 'lab__servant__servant_seal', navicue_type_name: 'The Servant Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'servant_servant_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Servant Seal', _lab_subtitle: 'Servant × Helper\'s High', _lab_signature: 'servant_servant_seal' },
  // ── Act 72: THE ALCHEMIST III (Synthesis Collection) ── #765–#774 ──
  { navicue_type_id: 'lab__synthesis__paradox_holder', navicue_type_name: 'The Paradox Holder', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'synthesis_paradox_holder', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Paradox Holder', _lab_subtitle: 'Synthesis × Dialectical Thinking', _lab_signature: 'synthesis_paradox_holder' },
  { navicue_type_id: 'lab__synthesis__emotion_blender', navicue_type_name: 'The Emotion Blender', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'synthesis_emotion_blender', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Emotion Blender', _lab_subtitle: 'Synthesis × Emotional Complexity', _lab_signature: 'synthesis_emotion_blender' },
  { navicue_type_id: 'lab__synthesis__shadow_hug', navicue_type_name: 'The Shadow Hug', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'synthesis_shadow_hug', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shadow Hug', _lab_subtitle: 'Synthesis × Self-Acceptance', _lab_signature: 'synthesis_shadow_hug' },
  { navicue_type_id: 'lab__synthesis__transmutation_fire', navicue_type_name: 'The Transmutation Fire', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'synthesis_transmutation_fire', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Transmutation Fire', _lab_subtitle: 'Synthesis × Post-Traumatic Growth', _lab_signature: 'synthesis_transmutation_fire' },
  { navicue_type_id: 'lab__synthesis__narrative_stitch', navicue_type_name: 'The Narrative Stitch', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'synthesis_narrative_stitch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Narrative Stitch', _lab_subtitle: 'Synthesis × Narrative Coherence', _lab_signature: 'synthesis_narrative_stitch' },
  { navicue_type_id: 'lab__synthesis__energy_exchange', navicue_type_name: 'The Energy Exchange', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'synthesis_energy_exchange', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Energy Exchange', _lab_subtitle: 'Synthesis × Homeostasis', _lab_signature: 'synthesis_energy_exchange' },
  { navicue_type_id: 'lab__synthesis__identity_fluidity', navicue_type_name: 'The Identity Fluidity', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'synthesis_identity_fluidity', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Identity Fluidity', _lab_subtitle: 'Synthesis × Role Flexibility', _lab_signature: 'synthesis_identity_fluidity' },
  { navicue_type_id: 'lab__synthesis__values_alloy', navicue_type_name: 'The Values Alloy', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'synthesis_values_alloy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Values Alloy', _lab_subtitle: 'Synthesis × Moral Identity', _lab_signature: 'synthesis_values_alloy' },
  { navicue_type_id: 'lab__synthesis__chaos_surfer', navicue_type_name: 'The Chaos Surfer', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'synthesis_chaos_surfer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chaos Surfer', _lab_subtitle: 'Synthesis × Dynamic Balance', _lab_signature: 'synthesis_chaos_surfer' },
  { navicue_type_id: 'lab__synthesis__synthesis_seal', navicue_type_name: 'The Synthesis Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'synthesis_synthesis_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Synthesis Seal', _lab_subtitle: 'Synthesis × Self-Complexity', _lab_signature: 'synthesis_synthesis_seal' },
  // ── Act 73: THE FUTURE WEAVER (Temporal Synthesis) ── #775–#784 ──
  { navicue_type_id: 'lab__futureweaver__future_memory', navicue_type_name: 'The Future Memory', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futureweaver_future_memory', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Memory', _lab_subtitle: 'FutureWeaver × Hope Theory', _lab_signature: 'futureweaver_future_memory' },
  { navicue_type_id: 'lab__futureweaver__regret_minimization', navicue_type_name: 'The Regret Minimization', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'futureweaver_regret_minimization', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Regret Minimization', _lab_subtitle: 'FutureWeaver × Anticipated Regret', _lab_signature: 'futureweaver_regret_minimization' },
  { navicue_type_id: 'lab__futureweaver__time_capsule_send', navicue_type_name: 'The Time Capsule (Send)', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'futureweaver_time_capsule_send', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Time Capsule (Send)', _lab_subtitle: 'FutureWeaver × Self-Continuity', _lab_signature: 'futureweaver_time_capsule_send' },
  { navicue_type_id: 'lab__futureweaver__pre_hindsight', navicue_type_name: 'The Pre-Hindsight', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'futureweaver_pre_hindsight', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pre-Hindsight', _lab_subtitle: 'FutureWeaver × Backcasting', _lab_signature: 'futureweaver_pre_hindsight' },
  { navicue_type_id: 'lab__futureweaver__branch_pruner', navicue_type_name: 'The Branch Pruner', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futureweaver_branch_pruner', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Branch Pruner', _lab_subtitle: 'FutureWeaver × Essentialism', _lab_signature: 'futureweaver_branch_pruner' },
  { navicue_type_id: 'lab__futureweaver__legacy_seed', navicue_type_name: 'The Legacy Seed', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'futureweaver_legacy_seed', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Legacy Seed', _lab_subtitle: 'FutureWeaver × Generativity', _lab_signature: 'futureweaver_legacy_seed' },
  { navicue_type_id: 'lab__futureweaver__worst_case_simulator', navicue_type_name: 'The Worst-Case Simulator', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'futureweaver_worst_case_simulator', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Worst-Case Simulator', _lab_subtitle: 'FutureWeaver × Catastrophizing Mgmt', _lab_signature: 'futureweaver_worst_case_simulator' },
  { navicue_type_id: 'lab__futureweaver__optimism_bias', navicue_type_name: 'The Optimism Bias', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'futureweaver_optimism_bias', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Optimism Bias', _lab_subtitle: 'FutureWeaver × Learned Optimism', _lab_signature: 'futureweaver_optimism_bias' },
  { navicue_type_id: 'lab__futureweaver__promise_keeper', navicue_type_name: 'The Promise Keeper', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'futureweaver_promise_keeper', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Promise Keeper', _lab_subtitle: 'FutureWeaver × Integrity', _lab_signature: 'futureweaver_promise_keeper' },
  { navicue_type_id: 'lab__futureweaver__weaver_seal', navicue_type_name: 'The Weaver Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'futureweaver_weaver_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Weaver Seal', _lab_subtitle: 'FutureWeaver × Temporal Integration', _lab_signature: 'futureweaver_weaver_seal' },
  // ── Act 74: THE COMPOSER (Harmony Collection) ── #785–#794 ──
  { navicue_type_id: 'lab__composer__discord_resolve', navicue_type_name: 'The Discord Resolve', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'composer_discord_resolve', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Discord Resolve', _lab_subtitle: 'Composer × Social Tuning', _lab_signature: 'composer_discord_resolve' },
  { navicue_type_id: 'lab__composer__tempo_control', navicue_type_name: 'The Tempo Control', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'composer_tempo_control', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tempo Control', _lab_subtitle: 'Composer × Entrainment Authority', _lab_signature: 'composer_tempo_control' },
  { navicue_type_id: 'lab__composer__leitmotif_scan', navicue_type_name: 'The Leitmotif Scan', form: 'Probe', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'composer_leitmotif_scan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Leitmotif Scan', _lab_subtitle: 'Composer × Narrative Identity', _lab_signature: 'composer_leitmotif_scan' },
  { navicue_type_id: 'lab__composer__rest_note', navicue_type_name: 'The Rest Note', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'composer_rest_note', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rest Note', _lab_subtitle: 'Composer × Strategic Recovery', _lab_signature: 'composer_rest_note' },
  { navicue_type_id: 'lab__composer__counterpoint', navicue_type_name: 'The Counterpoint', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'composer_counterpoint', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Counterpoint', _lab_subtitle: 'Composer × Paradox Tolerance', _lab_signature: 'composer_counterpoint' },
  { navicue_type_id: 'lab__composer__volume_knob', navicue_type_name: 'The Volume Knob', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'composer_volume_knob', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Volume Knob', _lab_subtitle: 'Composer × Intensity Regulation', _lab_signature: 'composer_volume_knob' },
  { navicue_type_id: 'lab__composer__tuning_fork', navicue_type_name: 'The Tuning Fork', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'composer_tuning_fork', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tuning Fork', _lab_subtitle: 'Composer × Vagal Tone', _lab_signature: 'composer_tuning_fork' },
  { navicue_type_id: 'lab__composer__ensemble_check', navicue_type_name: 'The Ensemble Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'composer_ensemble_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ensemble Check', _lab_subtitle: 'Composer × Executive Control', _lab_signature: 'composer_ensemble_check' },
  { navicue_type_id: 'lab__composer__improvisation', navicue_type_name: 'The Improvisation', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'composer_improvisation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Improvisation', _lab_subtitle: 'Composer × Adaptability', _lab_signature: 'composer_improvisation' },
  { navicue_type_id: 'lab__composer__composer_seal', navicue_type_name: 'The Composer Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'composer_composer_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Composer Seal', _lab_subtitle: 'Composer × Coherence', _lab_signature: 'composer_composer_seal' },
  // ── Act 75: THE ZENITH (Peak Collection) ── #795–#804 ──
  { navicue_type_id: 'lab__zenith__acclimatization', navicue_type_name: 'The Acclimatization', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'zenith_acclimatization', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Acclimatization', _lab_subtitle: 'Zenith × Pacing', _lab_signature: 'zenith_acclimatization' },
  { navicue_type_id: 'lab__zenith__false_summit', navicue_type_name: 'The False Summit', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'zenith_false_summit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The False Summit', _lab_subtitle: 'Zenith × Grit', _lab_signature: 'zenith_false_summit' },
  { navicue_type_id: 'lab__zenith__light_load', navicue_type_name: 'The Light Load', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'zenith_light_load', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Light Load', _lab_subtitle: 'Zenith × Essentialism', _lab_signature: 'zenith_light_load' },
  { navicue_type_id: 'lab__zenith__anchor', navicue_type_name: 'The Anchor', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'zenith_anchor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Anchor', _lab_subtitle: 'Zenith × System Trust', _lab_signature: 'zenith_anchor' },
  { navicue_type_id: 'lab__zenith__view', navicue_type_name: 'The View', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'zenith_view', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The View', _lab_subtitle: 'Zenith × Observer Self', _lab_signature: 'zenith_view' },
  { navicue_type_id: 'lab__zenith__descent', navicue_type_name: 'The Descent', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'zenith_descent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Descent', _lab_subtitle: 'Zenith × Humility', _lab_signature: 'zenith_descent' },
  { navicue_type_id: 'lab__zenith__sherpa_mindset', navicue_type_name: 'The Sherpa Mindset', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'zenith_sherpa_mindset', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sherpa Mindset', _lab_subtitle: 'Zenith × Altruistic Energy', _lab_signature: 'zenith_sherpa_mindset' },
  { navicue_type_id: 'lab__zenith__oxygen_check', navicue_type_name: 'The Oxygen Check', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'zenith_oxygen_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Oxygen Check', _lab_subtitle: 'Zenith × Breath Regulation', _lab_signature: 'zenith_oxygen_check' },
  { navicue_type_id: 'lab__zenith__whiteout', navicue_type_name: 'The Whiteout', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'zenith_whiteout', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Whiteout', _lab_subtitle: 'Zenith × Values-Based Action', _lab_signature: 'zenith_whiteout' },
  { navicue_type_id: 'lab__zenith__zenith_seal', navicue_type_name: 'The Zenith Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'zenith_zenith_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Zenith Seal', _lab_subtitle: 'Zenith × Peak Experience', _lab_signature: 'zenith_zenith_seal' },
  // ── Act 76: THE MULTIVERSE (Self-Concept Collection) ── #805–#814 ──
  { navicue_type_id: 'lab__multiverse__identity_prism', navicue_type_name: 'The Identity Prism', form: 'Practice', intent: 'Explore', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'multiverse_identity_prism', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Identity Prism', _lab_subtitle: 'Multiverse × Self-Complexity', _lab_signature: 'multiverse_identity_prism' },
  { navicue_type_id: 'lab__multiverse__both_and_bridge', navicue_type_name: 'The Both/And Bridge', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'multiverse_both_and_bridge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Both/And Bridge', _lab_subtitle: 'Multiverse × Dialectical Thinking', _lab_signature: 'multiverse_both_and_bridge' },
  { navicue_type_id: 'lab__multiverse__costume_change', navicue_type_name: 'The Costume Change', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'multiverse_costume_change', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Costume Change', _lab_subtitle: 'Multiverse × Role Exit', _lab_signature: 'multiverse_costume_change' },
  { navicue_type_id: 'lab__multiverse__future_draft', navicue_type_name: 'The Future Draft', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'multiverse_future_draft', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Draft', _lab_subtitle: 'Multiverse × Identity Plasticity', _lab_signature: 'multiverse_future_draft' },
  { navicue_type_id: 'lab__multiverse__committee_meeting', navicue_type_name: 'The Committee Meeting', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'multiverse_committee_meeting', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Committee Meeting', _lab_subtitle: 'Multiverse × Self-Leadership', _lab_signature: 'multiverse_committee_meeting' },
  { navicue_type_id: 'lab__multiverse__ghost_ship', navicue_type_name: 'The Ghost Ship', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'multiverse_ghost_ship', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ghost Ship', _lab_subtitle: 'Multiverse × Identity Release', _lab_signature: 'multiverse_ghost_ship' },
  { navicue_type_id: 'lab__multiverse__shapeshifter', navicue_type_name: 'The Shapeshifter', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'multiverse_shapeshifter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shapeshifter', _lab_subtitle: 'Multiverse × Adaptive Response', _lab_signature: 'multiverse_shapeshifter' },
  { navicue_type_id: 'lab__multiverse__shadow_dance', navicue_type_name: 'The Shadow Dance', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'multiverse_shadow_dance', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shadow Dance', _lab_subtitle: 'Multiverse × Shadow Integration', _lab_signature: 'multiverse_shadow_dance' },
  { navicue_type_id: 'lab__multiverse__empty_room', navicue_type_name: 'The Empty Room', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'multiverse_empty_room', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Empty Room', _lab_subtitle: 'Multiverse × Pure Awareness', _lab_signature: 'multiverse_empty_room' },
  { navicue_type_id: 'lab__multiverse__multiverse_seal', navicue_type_name: 'The Multiverse Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'multiverse_multiverse_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Multiverse Seal', _lab_subtitle: 'Multiverse × Meta-Cognition', _lab_signature: 'multiverse_multiverse_seal' },
  // ── Act 77: THE ETHICIST (Moral Architect) ── #815–#824 ──
  { navicue_type_id: 'lab__ethicist__integrity_gap', navicue_type_name: 'The Integrity Gap', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ethicist_integrity_gap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Integrity Gap', _lab_subtitle: 'Ethicist × Self-Concordance', _lab_signature: 'ethicist_integrity_gap' },
  { navicue_type_id: 'lab__ethicist__eulogy_test', navicue_type_name: 'The Eulogy Test', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ethicist_eulogy_test', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Eulogy Test', _lab_subtitle: 'Ethicist × Legacy Thinking', _lab_signature: 'ethicist_eulogy_test' },
  { navicue_type_id: 'lab__ethicist__hard_right', navicue_type_name: 'The Hard Right', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ethicist_hard_right', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Hard Right', _lab_subtitle: 'Ethicist × Moral Courage', _lab_signature: 'ethicist_hard_right' },
  { navicue_type_id: 'lab__ethicist__truth_serum', navicue_type_name: 'The Truth Serum', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ethicist_truth_serum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Truth Serum', _lab_subtitle: 'Ethicist × Radical Honesty', _lab_signature: 'ethicist_truth_serum' },
  { navicue_type_id: 'lab__ethicist__virtue_card', navicue_type_name: 'The Virtue Card', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ethicist_virtue_card', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Virtue Card', _lab_subtitle: 'Ethicist × Intentionality', _lab_signature: 'ethicist_virtue_card' },
  { navicue_type_id: 'lab__ethicist__whisper', navicue_type_name: 'The Whisper', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'ethicist_whisper', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Whisper', _lab_subtitle: 'Ethicist × Inner Listening', _lab_signature: 'ethicist_whisper' },
  { navicue_type_id: 'lab__ethicist__responsibility_weight', navicue_type_name: 'The Responsibility Weight', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'believing', magic_signature: 'ethicist_responsibility_weight', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Responsibility Weight', _lab_subtitle: 'Ethicist × Locus of Control', _lab_signature: 'ethicist_responsibility_weight' },
  { navicue_type_id: 'lab__ethicist__gratitude_tithe', navicue_type_name: 'The Gratitude Tithe', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'ethicist_gratitude_tithe', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gratitude Tithe', _lab_subtitle: 'Ethicist × Prosocial Embodiment', _lab_signature: 'ethicist_gratitude_tithe' },
  { navicue_type_id: 'lab__ethicist__apology_script', navicue_type_name: 'The Apology Script', form: 'Practice', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ethicist_apology_script', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Apology Script', _lab_subtitle: 'Ethicist × Relational Repair', _lab_signature: 'ethicist_apology_script' },
  { navicue_type_id: 'lab__ethicist__ethicist_seal', navicue_type_name: 'The Ethicist Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ethicist_ethicist_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ethicist Seal', _lab_subtitle: 'Ethicist × Moral Identity', _lab_signature: 'ethicist_ethicist_seal' },
  // ── Act 78: THE ELEMENTALIST (Nature Physics Collection) ── #825–#834 ──
  { navicue_type_id: 'lab__elementalist__earth_drop', navicue_type_name: 'The Earth Drop', form: 'Practice', intent: 'Regulate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elementalist_earth_drop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Earth Drop', _lab_subtitle: 'Elementalist × Somatic Grounding', _lab_signature: 'elementalist_earth_drop' },
  { navicue_type_id: 'lab__elementalist__air_filter', navicue_type_name: 'The Air Filter', form: 'Practice', intent: 'Regulate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elementalist_air_filter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Air Filter', _lab_subtitle: 'Elementalist × Physiological Reset', _lab_signature: 'elementalist_air_filter' },
  { navicue_type_id: 'lab__elementalist__fire_stoke', navicue_type_name: 'The Fire Stoke', form: 'Practice', intent: 'Activate', mechanism: 'Somatic Regulation', kbe_layer: 'knowing', magic_signature: 'elementalist_fire_stoke', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fire Stoke', _lab_subtitle: 'Elementalist × Drive Activation', _lab_signature: 'elementalist_fire_stoke' },
  { navicue_type_id: 'lab__elementalist__water_flow', navicue_type_name: 'The Water Flow', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'elementalist_water_flow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Water Flow', _lab_subtitle: 'Elementalist × Radical Acceptance', _lab_signature: 'elementalist_water_flow' },
  { navicue_type_id: 'lab__elementalist__storm_eye', navicue_type_name: 'The Storm Eye', form: 'Practice', intent: 'Regulate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elementalist_storm_eye', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Storm Eye', _lab_subtitle: 'Elementalist × Centering', _lab_signature: 'elementalist_storm_eye' },
  { navicue_type_id: 'lab__elementalist__stone_stack', navicue_type_name: 'The Stone Stack', form: 'Practice', intent: 'Regulate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elementalist_stone_stack', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Stone Stack', _lab_subtitle: 'Elementalist × Dynamic Balance', _lab_signature: 'elementalist_stone_stack' },
  { navicue_type_id: 'lab__elementalist__forest_bath', navicue_type_name: 'The Forest Bath', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'believing', magic_signature: 'elementalist_forest_bath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Forest Bath', _lab_subtitle: 'Elementalist × Interdependence', _lab_signature: 'elementalist_forest_bath' },
  { navicue_type_id: 'lab__elementalist__tide_chart', navicue_type_name: 'The Tide Chart', form: 'Practice', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'knowing', magic_signature: 'elementalist_tide_chart', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tide Chart', _lab_subtitle: 'Elementalist × Cyclical Wisdom', _lab_signature: 'elementalist_tide_chart' },
  { navicue_type_id: 'lab__elementalist__lightning_rod', navicue_type_name: 'The Lightning Rod', form: 'Practice', intent: 'Regulate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'elementalist_lightning_rod', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lightning Rod', _lab_subtitle: 'Elementalist × Somatic Release', _lab_signature: 'elementalist_lightning_rod' },
  { navicue_type_id: 'lab__elementalist__elemental_seal', navicue_type_name: 'The Elemental Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'knowing', magic_signature: 'elementalist_elemental_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Elemental Seal', _lab_subtitle: 'Elementalist × Biophilia', _lab_signature: 'elementalist_elemental_seal' },
  // ── Act 79: THE MENTAT (Super-Cognition Collection) ── #835–#844 ──
  { navicue_type_id: 'lab__mentat__deduction_palace', navicue_type_name: 'The Deduction Palace', form: 'Practice', intent: 'Explore', mechanism: 'Cognitive Enhancement', kbe_layer: 'knowing', magic_signature: 'mentat_deduction_palace', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deduction Palace', _lab_subtitle: 'Mentat × Root Cause Analysis', _lab_signature: 'mentat_deduction_palace' },
  { navicue_type_id: 'lab__mentat__speed_read', navicue_type_name: 'The Speed Read', form: 'Practice', intent: 'Explore', mechanism: 'Cognitive Enhancement', kbe_layer: 'knowing', magic_signature: 'mentat_speed_read', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Speed Read', _lab_subtitle: 'Mentat × Cognitive Compression', _lab_signature: 'mentat_speed_read' },
  { navicue_type_id: 'lab__mentat__logic_gate', navicue_type_name: 'The Logic Gate', form: 'Practice', intent: 'Integrate', mechanism: 'Cognitive Enhancement', kbe_layer: 'believing', magic_signature: 'mentat_logic_gate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Logic Gate', _lab_subtitle: 'Mentat × Contingency Planning', _lab_signature: 'mentat_logic_gate' },
  { navicue_type_id: 'lab__mentat__binary_choice', navicue_type_name: 'The Binary Choice', form: 'Practice', intent: 'Integrate', mechanism: 'Cognitive Enhancement', kbe_layer: 'believing', magic_signature: 'mentat_binary_choice', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Binary Choice', _lab_subtitle: 'Mentat × Decisiveness', _lab_signature: 'mentat_binary_choice' },
  { navicue_type_id: 'lab__mentat__memory_archive', navicue_type_name: 'The Memory Archive', form: 'Practice', intent: 'Explore', mechanism: 'Cognitive Enhancement', kbe_layer: 'knowing', magic_signature: 'mentat_memory_archive', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Memory Archive', _lab_subtitle: 'Mentat × Self-Efficacy Retrieval', _lab_signature: 'mentat_memory_archive' },
  { navicue_type_id: 'lab__mentat__focus_tunnel', navicue_type_name: 'The Focus Tunnel', form: 'Practice', intent: 'Regulate', mechanism: 'Cognitive Enhancement', kbe_layer: 'embodying', magic_signature: 'mentat_focus_tunnel', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Focus Tunnel', _lab_subtitle: 'Mentat × Attentional Control', _lab_signature: 'mentat_focus_tunnel' },
  { navicue_type_id: 'lab__mentat__pattern_match', navicue_type_name: 'The Pattern Match', form: 'Practice', intent: 'Explore', mechanism: 'Cognitive Enhancement', kbe_layer: 'knowing', magic_signature: 'mentat_pattern_match', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pattern Match', _lab_subtitle: 'Mentat × Systemic Insight', _lab_signature: 'mentat_pattern_match' },
  { navicue_type_id: 'lab__mentat__devils_advocate', navicue_type_name: 'The Devil\'s Advocate', form: 'Practice', intent: 'Integrate', mechanism: 'Cognitive Enhancement', kbe_layer: 'believing', magic_signature: 'mentat_devils_advocate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Devil\'s Advocate', _lab_subtitle: 'Mentat × Epistemic Resilience', _lab_signature: 'mentat_devils_advocate' },
  { navicue_type_id: 'lab__mentat__algorithm_rewrite', navicue_type_name: 'The Algorithm Rewrite', form: 'Practice', intent: 'Integrate', mechanism: 'Cognitive Enhancement', kbe_layer: 'knowing', magic_signature: 'mentat_algorithm_rewrite', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Algorithm Rewrite', _lab_subtitle: 'Mentat × Cognitive Restructuring', _lab_signature: 'mentat_algorithm_rewrite' },
  { navicue_type_id: 'lab__mentat__mentat_seal', navicue_type_name: 'The Mentat Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Cognitive Enhancement', kbe_layer: 'knowing', magic_signature: 'mentat_mentat_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mentat Seal', _lab_subtitle: 'Mentat × Fluid Intelligence', _lab_signature: 'mentat_mentat_seal' },
  // ── Act 80: THE ORACLE (Intuition Collection) ── #845–#854 ──
  { navicue_type_id: 'lab__intuition__gut_check', navicue_type_name: 'The Gut Check', form: 'Practice', intent: 'Explore', mechanism: 'Intuitive Intelligence', kbe_layer: 'embodying', magic_signature: 'intuition_gut_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gut Check', _lab_subtitle: 'Intuition × Somatic Trust', _lab_signature: 'intuition_gut_check' },
  { navicue_type_id: 'lab__intuition__coin_flip', navicue_type_name: 'The Coin Flip', form: 'Practice', intent: 'Explore', mechanism: 'Intuitive Intelligence', kbe_layer: 'knowing', magic_signature: 'intuition_coin_flip', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Coin Flip', _lab_subtitle: 'Intuition × Desire Recognition', _lab_signature: 'intuition_coin_flip' },
  { navicue_type_id: 'lab__intuition__shiver_scan', navicue_type_name: 'The Shiver Scan', form: 'Practice', intent: 'Explore', mechanism: 'Intuitive Intelligence', kbe_layer: 'embodying', magic_signature: 'intuition_shiver_scan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shiver Scan', _lab_subtitle: 'Intuition × Interoceptive Awareness', _lab_signature: 'intuition_shiver_scan' },
  { navicue_type_id: 'lab__intuition__sleep_on_it', navicue_type_name: 'The Sleep On It', form: 'Practice', intent: 'Integrate', mechanism: 'Intuitive Intelligence', kbe_layer: 'believing', magic_signature: 'intuition_sleep_on_it', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sleep On It', _lab_subtitle: 'Intuition × Cognitive Offloading', _lab_signature: 'intuition_sleep_on_it' },
  { navicue_type_id: 'lab__intuition__vibe_check', navicue_type_name: 'The Vibe Check', form: 'Practice', intent: 'Explore', mechanism: 'Intuitive Intelligence', kbe_layer: 'knowing', magic_signature: 'intuition_vibe_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vibe Check', _lab_subtitle: 'Intuition × Pattern Articulation', _lab_signature: 'intuition_vibe_check' },
  { navicue_type_id: 'lab__intuition__silence_vacuum', navicue_type_name: 'The Silence Vacuum', form: 'Practice', intent: 'Regulate', mechanism: 'Intuitive Intelligence', kbe_layer: 'embodying', magic_signature: 'intuition_silence_vacuum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silence Vacuum', _lab_subtitle: 'Intuition × Stillness', _lab_signature: 'intuition_silence_vacuum' },
  { navicue_type_id: 'lab__intuition__resonance_test', navicue_type_name: 'The Resonance Test', form: 'Practice', intent: 'Integrate', mechanism: 'Intuitive Intelligence', kbe_layer: 'believing', magic_signature: 'intuition_resonance_test', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Resonance Test', _lab_subtitle: 'Intuition × Alignment', _lab_signature: 'intuition_resonance_test' },
  { navicue_type_id: 'lab__intuition__future_self_consult', navicue_type_name: 'The Future Self Consult', form: 'Practice', intent: 'Explore', mechanism: 'Intuitive Intelligence', kbe_layer: 'knowing', magic_signature: 'intuition_future_self_consult', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Self Consult', _lab_subtitle: 'Intuition × Temporal Extension', _lab_signature: 'intuition_future_self_consult' },
  { navicue_type_id: 'lab__intuition__fear_vs_danger', navicue_type_name: 'The Fear vs. Danger', form: 'Practice', intent: 'Integrate', mechanism: 'Intuitive Intelligence', kbe_layer: 'believing', magic_signature: 'intuition_fear_vs_danger', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fear vs. Danger', _lab_subtitle: 'Intuition × Discernment', _lab_signature: 'intuition_fear_vs_danger' },
  { navicue_type_id: 'lab__intuition__oracle_seal', navicue_type_name: 'The Oracle Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Intuitive Intelligence', kbe_layer: 'knowing', magic_signature: 'intuition_oracle_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Oracle Seal', _lab_subtitle: 'Intuition × Implicit Learning', _lab_signature: 'intuition_oracle_seal' },
  // ── Act 81: THE ENGINEER (Systems Collection) ── #855–#864 ──
  { navicue_type_id: 'lab__engineer__default_setting', navicue_type_name: 'The Default Setting', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Design', kbe_layer: 'knowing', magic_signature: 'engineer_default_setting', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Default Setting', _lab_subtitle: 'Engineer × Choice Architecture', _lab_signature: 'engineer_default_setting' },
  { navicue_type_id: 'lab__engineer__friction_slider', navicue_type_name: 'The Friction Slider', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Design', kbe_layer: 'believing', magic_signature: 'engineer_friction_slider', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Slider', _lab_subtitle: 'Engineer × Environmental Design', _lab_signature: 'engineer_friction_slider' },
  { navicue_type_id: 'lab__engineer__commitment_device', navicue_type_name: 'The Commitment Device', form: 'Practice', intent: 'Activate', mechanism: 'Behavioral Design', kbe_layer: 'embodying', magic_signature: 'engineer_commitment_device', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Commitment Device', _lab_subtitle: 'Engineer × Loss Aversion', _lab_signature: 'engineer_commitment_device' },
  { navicue_type_id: 'lab__engineer__batch_process', navicue_type_name: 'The Batch Process', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Design', kbe_layer: 'knowing', magic_signature: 'engineer_batch_process', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Batch Process', _lab_subtitle: 'Engineer × Cognitive Efficiency', _lab_signature: 'engineer_batch_process' },
  { navicue_type_id: 'lab__engineer__check_engine_light', navicue_type_name: 'The Check Engine Light', form: 'Practice', intent: 'Explore', mechanism: 'Behavioral Design', kbe_layer: 'knowing', magic_signature: 'engineer_check_engine_light', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Check Engine Light', _lab_subtitle: 'Engineer × HALT Awareness', _lab_signature: 'engineer_check_engine_light' },
  { navicue_type_id: 'lab__engineer__redundancy', navicue_type_name: 'The Redundancy', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Design', kbe_layer: 'believing', magic_signature: 'engineer_redundancy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Redundancy', _lab_subtitle: 'Engineer × Risk Mitigation', _lab_signature: 'engineer_redundancy' },
  { navicue_type_id: 'lab__engineer__constraint', navicue_type_name: 'The Constraint', form: 'Practice', intent: 'Integrate', mechanism: 'Behavioral Design', kbe_layer: 'believing', magic_signature: 'engineer_constraint', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Constraint', _lab_subtitle: 'Engineer × Creative Constraint', _lab_signature: 'engineer_constraint' },
  { navicue_type_id: 'lab__engineer__feedback_loop', navicue_type_name: 'The Feedback Loop', form: 'Practice', intent: 'Explore', mechanism: 'Behavioral Design', kbe_layer: 'knowing', magic_signature: 'engineer_feedback_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Feedback Loop', _lab_subtitle: 'Engineer × Iterative Improvement', _lab_signature: 'engineer_feedback_loop' },
  { navicue_type_id: 'lab__engineer__maintenance_schedule', navicue_type_name: 'The Maintenance Schedule', form: 'Practice', intent: 'Regulate', mechanism: 'Behavioral Design', kbe_layer: 'embodying', magic_signature: 'engineer_maintenance_schedule', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Maintenance Schedule', _lab_subtitle: 'Engineer × Proactive Coping', _lab_signature: 'engineer_maintenance_schedule' },
  { navicue_type_id: 'lab__engineer__engineer_seal', navicue_type_name: 'The Engineer Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Behavioral Design', kbe_layer: 'knowing', magic_signature: 'engineer_engineer_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Engineer Seal', _lab_subtitle: 'Engineer × Nudge Theory', _lab_signature: 'engineer_engineer_seal' },
  // ── Act 82: THE ALCHEMIST IV (Emotion Collection) ── #865–#874 ──
  { navicue_type_id: 'lab__alchemistiv__anger_forge', navicue_type_name: 'The Anger Forge', form: 'Practice', intent: 'Integrate', mechanism: 'Emotional Regulation', kbe_layer: 'believing', magic_signature: 'alchemistiv_anger_forge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Anger Forge', _lab_subtitle: 'AlchemistIV × Sublimation', _lab_signature: 'alchemistiv_anger_forge' },
  { navicue_type_id: 'lab__alchemistiv__grief_garden', navicue_type_name: 'The Grief Garden', form: 'Practice', intent: 'Regulate', mechanism: 'Emotional Regulation', kbe_layer: 'embodying', magic_signature: 'alchemistiv_grief_garden', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Grief Garden', _lab_subtitle: 'AlchemistIV × Post-Traumatic Growth', _lab_signature: 'alchemistiv_grief_garden' },
  { navicue_type_id: 'lab__alchemistiv__fear_compass', navicue_type_name: 'The Fear Compass', form: 'Practice', intent: 'Explore', mechanism: 'Emotional Regulation', kbe_layer: 'knowing', magic_signature: 'alchemistiv_fear_compass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fear Compass', _lab_subtitle: 'AlchemistIV × Emotional Granularity', _lab_signature: 'alchemistiv_fear_compass' },
  { navicue_type_id: 'lab__alchemistiv__joy_reservoir', navicue_type_name: 'The Joy Reservoir', form: 'Practice', intent: 'Activate', mechanism: 'Emotional Regulation', kbe_layer: 'believing', magic_signature: 'alchemistiv_joy_reservoir', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Joy Reservoir', _lab_subtitle: 'AlchemistIV × Savoring', _lab_signature: 'alchemistiv_joy_reservoir' },
  { navicue_type_id: 'lab__alchemistiv__shame_solvent', navicue_type_name: 'The Shame Solvent', form: 'Practice', intent: 'Regulate', mechanism: 'Emotional Regulation', kbe_layer: 'embodying', magic_signature: 'alchemistiv_shame_solvent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Shame Solvent', _lab_subtitle: 'AlchemistIV × Shame Resilience', _lab_signature: 'alchemistiv_shame_solvent' },
  { navicue_type_id: 'lab__alchemistiv__envy_mirror', navicue_type_name: 'The Envy Mirror', form: 'Practice', intent: 'Explore', mechanism: 'Emotional Regulation', kbe_layer: 'knowing', magic_signature: 'alchemistiv_envy_mirror', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Envy Mirror', _lab_subtitle: 'AlchemistIV × Shadow Work', _lab_signature: 'alchemistiv_envy_mirror' },
  { navicue_type_id: 'lab__alchemistiv__sadness_river', navicue_type_name: 'The Sadness River', form: 'Practice', intent: 'Regulate', mechanism: 'Emotional Regulation', kbe_layer: 'embodying', magic_signature: 'alchemistiv_sadness_river', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sadness River', _lab_subtitle: 'AlchemistIV × Emotional Acceptance', _lab_signature: 'alchemistiv_sadness_river' },
  { navicue_type_id: 'lab__alchemistiv__anxiety_engine', navicue_type_name: 'The Anxiety Engine', form: 'Practice', intent: 'Integrate', mechanism: 'Emotional Regulation', kbe_layer: 'believing', magic_signature: 'alchemistiv_anxiety_engine', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Anxiety Engine', _lab_subtitle: 'AlchemistIV × Reframing', _lab_signature: 'alchemistiv_anxiety_engine' },
  { navicue_type_id: 'lab__alchemistiv__love_amplifier', navicue_type_name: 'The Love Amplifier', form: 'Practice', intent: 'Activate', mechanism: 'Emotional Regulation', kbe_layer: 'embodying', magic_signature: 'alchemistiv_love_amplifier', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Love Amplifier', _lab_subtitle: 'AlchemistIV × Metta', _lab_signature: 'alchemistiv_love_amplifier' },
  { navicue_type_id: 'lab__alchemistiv__transmutation_seal', navicue_type_name: 'The Transmutation Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Emotional Regulation', kbe_layer: 'knowing', magic_signature: 'alchemistiv_transmutation_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Transmutation Seal', _lab_subtitle: 'AlchemistIV × Emotional Agility', _lab_signature: 'alchemistiv_transmutation_seal' },
  // ── Act 83: THE ARCHITECT II (Cognitive Collection) ── #875–#884 ──
  { navicue_type_id: 'lab__cognitive__memory_palace_repair', navicue_type_name: 'The Memory Palace Repair', form: 'Practice', intent: 'Integrate', mechanism: 'Cognitive Structuring', kbe_layer: 'believing', magic_signature: 'cognitive_memory_palace_repair', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Memory Palace Repair', _lab_subtitle: 'Cognitive × Reconsolidation', _lab_signature: 'cognitive_memory_palace_repair' },
  { navicue_type_id: 'lab__cognitive__focus_fortress', navicue_type_name: 'The Focus Fortress', form: 'Practice', intent: 'Regulate', mechanism: 'Cognitive Structuring', kbe_layer: 'embodying', magic_signature: 'cognitive_focus_fortress', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Focus Fortress', _lab_subtitle: 'Cognitive × Deep Work', _lab_signature: 'cognitive_focus_fortress' },
  { navicue_type_id: 'lab__cognitive__logic_library', navicue_type_name: 'The Logic Library', form: 'Practice', intent: 'Explore', mechanism: 'Cognitive Structuring', kbe_layer: 'knowing', magic_signature: 'cognitive_logic_library', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Logic Library', _lab_subtitle: 'Cognitive × Critical Thinking', _lab_signature: 'cognitive_logic_library' },
  { navicue_type_id: 'lab__cognitive__perspective_balcony', navicue_type_name: 'The Perspective Balcony', form: 'Practice', intent: 'Explore', mechanism: 'Cognitive Structuring', kbe_layer: 'believing', magic_signature: 'cognitive_perspective_balcony', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Perspective Balcony', _lab_subtitle: 'Cognitive × Theory of Mind', _lab_signature: 'cognitive_perspective_balcony' },
  { navicue_type_id: 'lab__cognitive__value_vault', navicue_type_name: 'The Value Vault', form: 'Practice', intent: 'Integrate', mechanism: 'Cognitive Structuring', kbe_layer: 'knowing', magic_signature: 'cognitive_value_vault', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Value Vault', _lab_subtitle: 'Cognitive × Values Alignment', _lab_signature: 'cognitive_value_vault' },
  { navicue_type_id: 'lab__cognitive__decision_bridge', navicue_type_name: 'The Decision Bridge', form: 'Practice', intent: 'Integrate', mechanism: 'Cognitive Structuring', kbe_layer: 'believing', magic_signature: 'cognitive_decision_bridge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Decision Bridge', _lab_subtitle: 'Cognitive × Integrated Decision Making', _lab_signature: 'cognitive_decision_bridge' },
  { navicue_type_id: 'lab__cognitive__creativity_workshop', navicue_type_name: 'The Creativity Workshop', form: 'Practice', intent: 'Activate', mechanism: 'Cognitive Structuring', kbe_layer: 'embodying', magic_signature: 'cognitive_creativity_workshop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Creativity Workshop', _lab_subtitle: 'Cognitive × Creative Confidence', _lab_signature: 'cognitive_creativity_workshop' },
  { navicue_type_id: 'lab__cognitive__doubt_dungeon', navicue_type_name: 'The Doubt Dungeon', form: 'Practice', intent: 'Regulate', mechanism: 'Cognitive Structuring', kbe_layer: 'knowing', magic_signature: 'cognitive_doubt_dungeon', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Doubt Dungeon', _lab_subtitle: 'Cognitive × Compartmentalization', _lab_signature: 'cognitive_doubt_dungeon' },
  { navicue_type_id: 'lab__cognitive__future_observatory', navicue_type_name: 'The Future Observatory', form: 'Practice', intent: 'Explore', mechanism: 'Cognitive Structuring', kbe_layer: 'believing', magic_signature: 'cognitive_future_observatory', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Observatory', _lab_subtitle: 'Cognitive × Teleological Thinking', _lab_signature: 'cognitive_future_observatory' },
  { navicue_type_id: 'lab__cognitive__architect_seal', navicue_type_name: 'The Architect Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Cognitive Structuring', kbe_layer: 'knowing', magic_signature: 'cognitive_architect_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Architect Seal', _lab_subtitle: 'Cognitive × Cognitive Sovereignty', _lab_signature: 'cognitive_architect_seal' },
  // ── Act 84: THE SAGE (Wisdom Collection) ── #885–#894 ─────────
  { navicue_type_id: 'lab__sage__empty_cup', navicue_type_name: 'The Empty Cup', form: 'Practice', intent: 'Explore', mechanism: 'Transcendent Wisdom', kbe_layer: 'believing', magic_signature: 'sage_empty_cup', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Empty Cup', _lab_subtitle: 'Sage × Intellectual Humility', _lab_signature: 'sage_empty_cup' },
  { navicue_type_id: 'lab__sage__impermanence', navicue_type_name: 'The Impermanence', form: 'Practice', intent: 'Regulate', mechanism: 'Transcendent Wisdom', kbe_layer: 'embodying', magic_signature: 'sage_impermanence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Impermanence', _lab_subtitle: 'Sage × Non-Attachment', _lab_signature: 'sage_impermanence' },
  { navicue_type_id: 'lab__sage__middle_way', navicue_type_name: 'The Middle Way', form: 'Practice', intent: 'Regulate', mechanism: 'Transcendent Wisdom', kbe_layer: 'embodying', magic_signature: 'sage_middle_way', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Middle Way', _lab_subtitle: 'Sage × Dynamic Balance', _lab_signature: 'sage_middle_way' },
  { navicue_type_id: 'lab__sage__paradox_holder', navicue_type_name: 'The Paradox Holder', form: 'Practice', intent: 'Explore', mechanism: 'Transcendent Wisdom', kbe_layer: 'knowing', magic_signature: 'sage_paradox_holder', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Paradox Holder', _lab_subtitle: 'Sage × Dialectical Thinking', _lab_signature: 'sage_paradox_holder' },
  { navicue_type_id: 'lab__sage__silent_answer', navicue_type_name: 'The Silent Answer', form: 'Practice', intent: 'Regulate', mechanism: 'Transcendent Wisdom', kbe_layer: 'embodying', magic_signature: 'sage_silent_answer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silent Answer', _lab_subtitle: 'Sage × Tolerance of Ambiguity', _lab_signature: 'sage_silent_answer' },
  { navicue_type_id: 'lab__sage__observer_seat', navicue_type_name: 'The Observer Seat', form: 'Practice', intent: 'Explore', mechanism: 'Transcendent Wisdom', kbe_layer: 'knowing', magic_signature: 'sage_observer_seat', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Observer Seat', _lab_subtitle: 'Sage × Meta-Cognition', _lab_signature: 'sage_observer_seat' },
  { navicue_type_id: 'lab__sage__wu_wei', navicue_type_name: 'The Wu Wei', form: 'Practice', intent: 'Integrate', mechanism: 'Transcendent Wisdom', kbe_layer: 'believing', magic_signature: 'sage_wu_wei', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wu Wei', _lab_subtitle: 'Sage × Effortless Action', _lab_signature: 'sage_wu_wei' },
  { navicue_type_id: 'lab__sage__mirror_of_projection', navicue_type_name: 'The Mirror of Projection', form: 'Practice', intent: 'Explore', mechanism: 'Transcendent Wisdom', kbe_layer: 'knowing', magic_signature: 'sage_mirror_of_projection', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror of Projection', _lab_subtitle: 'Sage × Shadow Integration', _lab_signature: 'sage_mirror_of_projection' },
  { navicue_type_id: 'lab__sage__beginners_mind', navicue_type_name: 'The Beginners Mind', form: 'Practice', intent: 'Activate', mechanism: 'Transcendent Wisdom', kbe_layer: 'embodying', magic_signature: 'sage_beginners_mind', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Beginners Mind', _lab_subtitle: 'Sage × Perceptual Freshness', _lab_signature: 'sage_beginners_mind' },
  { navicue_type_id: 'lab__sage__sage_seal', navicue_type_name: 'The Sage Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Transcendent Wisdom', kbe_layer: 'knowing', magic_signature: 'sage_sage_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Sage Seal', _lab_subtitle: 'Sage × Wabi-Sabi', _lab_signature: 'sage_sage_seal' },
  // ── Act 85: THE GAIA (Connection Collection) ── #895–#904 ─────
  { navicue_type_id: 'lab__gaia__breath_exchange', navicue_type_name: 'The Breath Exchange', form: 'Practice', intent: 'Activate', mechanism: 'Systems Thinking', kbe_layer: 'embodying', magic_signature: 'gaia_breath_exchange', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Breath Exchange', _lab_subtitle: 'Gaia × Symbiosis', _lab_signature: 'gaia_breath_exchange' },
  { navicue_type_id: 'lab__gaia__mycelium_network', navicue_type_name: 'The Mycelium Network', form: 'Practice', intent: 'Explore', mechanism: 'Systems Thinking', kbe_layer: 'knowing', magic_signature: 'gaia_mycelium_network', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mycelium Network', _lab_subtitle: 'Gaia × Wood Wide Web', _lab_signature: 'gaia_mycelium_network' },
  { navicue_type_id: 'lab__gaia__zoom_out', navicue_type_name: 'The Zoom Out', form: 'Practice', intent: 'Explore', mechanism: 'Systems Thinking', kbe_layer: 'believing', magic_signature: 'gaia_zoom_out', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Zoom Out', _lab_subtitle: 'Gaia × Overview Effect', _lab_signature: 'gaia_zoom_out' },
  { navicue_type_id: 'lab__gaia__water_cycle', navicue_type_name: 'The Water Cycle', form: 'Practice', intent: 'Integrate', mechanism: 'Systems Thinking', kbe_layer: 'believing', magic_signature: 'gaia_water_cycle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Water Cycle', _lab_subtitle: 'Gaia × Conservation', _lab_signature: 'gaia_water_cycle' },
  { navicue_type_id: 'lab__gaia__deep_time', navicue_type_name: 'The Deep Time', form: 'Practice', intent: 'Explore', mechanism: 'Systems Thinking', kbe_layer: 'knowing', magic_signature: 'gaia_deep_time', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deep Time', _lab_subtitle: 'Gaia × Geological Time', _lab_signature: 'gaia_deep_time' },
  { navicue_type_id: 'lab__gaia__sun_source', navicue_type_name: 'The Sun Source', form: 'Practice', intent: 'Explore', mechanism: 'Systems Thinking', kbe_layer: 'knowing', magic_signature: 'gaia_sun_source', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sun Source', _lab_subtitle: 'Gaia × Ecological Literacy', _lab_signature: 'gaia_sun_source' },
  { navicue_type_id: 'lab__gaia__diversity_immunity', navicue_type_name: 'The Diversity Immunity', form: 'Practice', intent: 'Integrate', mechanism: 'Systems Thinking', kbe_layer: 'believing', magic_signature: 'gaia_diversity_immunity', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Diversity Immunity', _lab_subtitle: 'Gaia × Resilience', _lab_signature: 'gaia_diversity_immunity' },
  { navicue_type_id: 'lab__gaia__ocean_depth', navicue_type_name: 'The Ocean Depth', form: 'Practice', intent: 'Regulate', mechanism: 'Systems Thinking', kbe_layer: 'embodying', magic_signature: 'gaia_ocean_depth', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ocean Depth', _lab_subtitle: 'Gaia × Depth Regulation', _lab_signature: 'gaia_ocean_depth' },
  { navicue_type_id: 'lab__gaia__butterfly_effect', navicue_type_name: 'The Butterfly Effect', form: 'Practice', intent: 'Explore', mechanism: 'Systems Thinking', kbe_layer: 'knowing', magic_signature: 'gaia_butterfly_effect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Butterfly Effect', _lab_subtitle: 'Gaia × Chaos Theory', _lab_signature: 'gaia_butterfly_effect' },
  { navicue_type_id: 'lab__gaia__gaia_seal', navicue_type_name: 'The Gaia Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Systems Thinking', kbe_layer: 'knowing', magic_signature: 'gaia_gaia_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Gaia Seal', _lab_subtitle: 'Gaia × Overview Effect', _lab_signature: 'gaia_gaia_seal' },
  // ── Act 86: THE MYSTIC (Transcendence Collection) ── #905–#914 ─
  { navicue_type_id: 'lab__mystic__candle_gaze', navicue_type_name: 'The Candle Gaze', form: 'Practice', intent: 'Activate', mechanism: 'Non-Dual Awareness', kbe_layer: 'embodying', magic_signature: 'mystic_candle_gaze', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Candle Gaze', _lab_subtitle: 'Mystic × Trataka', _lab_signature: 'mystic_candle_gaze' },
  { navicue_type_id: 'lab__mystic__drop_in_ocean', navicue_type_name: 'The Drop in the Ocean', form: 'Practice', intent: 'Integrate', mechanism: 'Non-Dual Awareness', kbe_layer: 'believing', magic_signature: 'mystic_drop_in_ocean', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Drop in the Ocean', _lab_subtitle: 'Mystic × Ego Dissolution', _lab_signature: 'mystic_drop_in_ocean' },
  { navicue_type_id: 'lab__mystic__koan', navicue_type_name: 'The Koan', form: 'Practice', intent: 'Explore', mechanism: 'Non-Dual Awareness', kbe_layer: 'knowing', magic_signature: 'mystic_koan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Koan', _lab_subtitle: 'Mystic × Logical Bypass', _lab_signature: 'mystic_koan' },
  { navicue_type_id: 'lab__mystic__light_source', navicue_type_name: 'The Light Source', form: 'Practice', intent: 'Explore', mechanism: 'Non-Dual Awareness', kbe_layer: 'knowing', magic_signature: 'mystic_light_source', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Light Source', _lab_subtitle: 'Mystic × Source Awareness', _lab_signature: 'mystic_light_source' },
  { navicue_type_id: 'lab__mystic__space_between', navicue_type_name: 'The Space Between', form: 'Practice', intent: 'Regulate', mechanism: 'Non-Dual Awareness', kbe_layer: 'embodying', magic_signature: 'mystic_space_between', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Space Between', _lab_subtitle: 'Mystic × Witness Consciousness', _lab_signature: 'mystic_space_between' },
  { navicue_type_id: 'lab__mystic__dance_of_shiva', navicue_type_name: 'The Dance of Shiva', form: 'Practice', intent: 'Integrate', mechanism: 'Non-Dual Awareness', kbe_layer: 'believing', magic_signature: 'mystic_dance_of_shiva', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dance of Shiva', _lab_subtitle: 'Mystic × Equanimity', _lab_signature: 'mystic_dance_of_shiva' },
  { navicue_type_id: 'lab__mystic__golden_thread', navicue_type_name: 'The Golden Thread', form: 'Practice', intent: 'Explore', mechanism: 'Non-Dual Awareness', kbe_layer: 'knowing', magic_signature: 'mystic_golden_thread', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Golden Thread', _lab_subtitle: 'Mystic × Intuitive Trust', _lab_signature: 'mystic_golden_thread' },
  { navicue_type_id: 'lab__mystic__silence_bell', navicue_type_name: 'The Silence Bell', form: 'Practice', intent: 'Regulate', mechanism: 'Non-Dual Awareness', kbe_layer: 'embodying', magic_signature: 'mystic_silence_bell', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silence Bell', _lab_subtitle: 'Mystic × Deep Listening', _lab_signature: 'mystic_silence_bell' },
  { navicue_type_id: 'lab__mystic__net_of_indra', navicue_type_name: 'The Net of Indra', form: 'Practice', intent: 'Explore', mechanism: 'Non-Dual Awareness', kbe_layer: 'knowing', magic_signature: 'mystic_net_of_indra', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Net of Indra', _lab_subtitle: 'Mystic × Holographic Insight', _lab_signature: 'mystic_net_of_indra' },
  { navicue_type_id: 'lab__mystic__mystic_seal', navicue_type_name: 'The Mystic Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Non-Dual Awareness', kbe_layer: 'knowing', magic_signature: 'mystic_mystic_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mystic Seal', _lab_subtitle: 'Mystic × Non-Dual Awareness', _lab_signature: 'mystic_mystic_seal' },
  // ── Act 87: THE ASCENDANT (Integration Collection) ── #915–#924 ─
  { navicue_type_id: 'lab__ascendant__chop_wood', navicue_type_name: 'Chop Wood Carry Water', form: 'Practice', intent: 'Activate', mechanism: 'Integrated Living', kbe_layer: 'embodying', magic_signature: 'ascendant_chop_wood', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'Chop Wood, Carry Water', _lab_subtitle: 'Ascendant × Mindful Action', _lab_signature: 'ascendant_chop_wood' },
  { navicue_type_id: 'lab__ascendant__descent', navicue_type_name: 'The Descent', form: 'Practice', intent: 'Integrate', mechanism: 'Integrated Living', kbe_layer: 'believing', magic_signature: 'ascendant_descent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Descent', _lab_subtitle: 'Ascendant × Bodhisattva Vow', _lab_signature: 'ascendant_descent' },
  { navicue_type_id: 'lab__ascendant__marketplace_noise', navicue_type_name: 'The Marketplace Noise', form: 'Practice', intent: 'Regulate', mechanism: 'Integrated Living', kbe_layer: 'embodying', magic_signature: 'ascendant_marketplace_noise', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Marketplace Noise', _lab_subtitle: 'Ascendant × State Stability', _lab_signature: 'ascendant_marketplace_noise' },
  { navicue_type_id: 'lab__ascendant__dirty_hands', navicue_type_name: 'The Dirty Hands', form: 'Practice', intent: 'Explore', mechanism: 'Integrated Living', kbe_layer: 'knowing', magic_signature: 'ascendant_dirty_hands', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dirty Hands', _lab_subtitle: 'Ascendant × Engaged Spirituality', _lab_signature: 'ascendant_dirty_hands' },
  { navicue_type_id: 'lab__ascendant__ordinary_miracle', navicue_type_name: 'The Ordinary Miracle', form: 'Practice', intent: 'Integrate', mechanism: 'Integrated Living', kbe_layer: 'believing', magic_signature: 'ascendant_ordinary_miracle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ordinary Miracle', _lab_subtitle: 'Ascendant × Sacred Outlook', _lab_signature: 'ascendant_ordinary_miracle' },
  { navicue_type_id: 'lab__ascendant__broken_bowl', navicue_type_name: 'The Broken Bowl', form: 'Practice', intent: 'Explore', mechanism: 'Integrated Living', kbe_layer: 'knowing', magic_signature: 'ascendant_broken_bowl', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Broken Bowl', _lab_subtitle: 'Ascendant × Kintsugi', _lab_signature: 'ascendant_broken_bowl' },
  { navicue_type_id: 'lab__ascendant__ripple_maker', navicue_type_name: 'The Ripple Maker', form: 'Practice', intent: 'Activate', mechanism: 'Integrated Living', kbe_layer: 'believing', magic_signature: 'ascendant_ripple_maker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ripple Maker', _lab_subtitle: 'Ascendant × Agency', _lab_signature: 'ascendant_ripple_maker' },
  { navicue_type_id: 'lab__ascendant__human_touch', navicue_type_name: 'The Human Touch', form: 'Practice', intent: 'Regulate', mechanism: 'Integrated Living', kbe_layer: 'embodying', magic_signature: 'ascendant_human_touch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Human Touch', _lab_subtitle: 'Ascendant × Connection', _lab_signature: 'ascendant_human_touch' },
  { navicue_type_id: 'lab__ascendant__open_door', navicue_type_name: 'The Open Door', form: 'Practice', intent: 'Integrate', mechanism: 'Integrated Living', kbe_layer: 'believing', magic_signature: 'ascendant_open_door', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Open Door', _lab_subtitle: 'Ascendant × Emotional Courage', _lab_signature: 'ascendant_open_door' },
  { navicue_type_id: 'lab__ascendant__ascendant_seal', navicue_type_name: 'The Ascendant Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Integrated Living', kbe_layer: 'knowing', magic_signature: 'ascendant_ascendant_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ascendant Seal', _lab_subtitle: 'Ascendant × Integrated Functioning', _lab_signature: 'ascendant_ascendant_seal' },
  // ── Act 88: THE GARDENER II (Stewardship Collection) ── #925–#934
  { navicue_type_id: 'lab__gardener__seed_bank', navicue_type_name: 'The Seed Bank', form: 'Practice', intent: 'Activate', mechanism: 'Ecological Identity', kbe_layer: 'believing', magic_signature: 'gardener_seed_bank', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Seed Bank', _lab_subtitle: 'Gardener × Generativity', _lab_signature: 'gardener_seed_bank' },
  { navicue_type_id: 'lab__gardener__composting', navicue_type_name: 'The Composting', form: 'Practice', intent: 'Explore', mechanism: 'Ecological Identity', kbe_layer: 'knowing', magic_signature: 'gardener_composting', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Composting', _lab_subtitle: 'Gardener × Growth Mindset', _lab_signature: 'gardener_composting' },
  { navicue_type_id: 'lab__gardener__pruning_shears', navicue_type_name: 'The Pruning Shears', form: 'Practice', intent: 'Explore', mechanism: 'Ecological Identity', kbe_layer: 'knowing', magic_signature: 'gardener_pruning_shears', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pruning Shears', _lab_subtitle: 'Gardener × Essentialism', _lab_signature: 'gardener_pruning_shears' },
  { navicue_type_id: 'lab__gardener__mycelial_pulse', navicue_type_name: 'The Mycelial Pulse', form: 'Practice', intent: 'Activate', mechanism: 'Ecological Identity', kbe_layer: 'embodying', magic_signature: 'gardener_mycelial_pulse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mycelial Pulse', _lab_subtitle: 'Gardener × Altruism', _lab_signature: 'gardener_mycelial_pulse' },
  { navicue_type_id: 'lab__gardener__harvest_timing', navicue_type_name: 'The Harvest Timing', form: 'Practice', intent: 'Regulate', mechanism: 'Ecological Identity', kbe_layer: 'embodying', magic_signature: 'gardener_harvest_timing', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Harvest Timing', _lab_subtitle: 'Gardener × Patience', _lab_signature: 'gardener_harvest_timing' },
  { navicue_type_id: 'lab__gardener__drought_resilience', navicue_type_name: 'The Drought Resilience', form: 'Practice', intent: 'Regulate', mechanism: 'Ecological Identity', kbe_layer: 'believing', magic_signature: 'gardener_drought_resilience', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Drought Resilience', _lab_subtitle: 'Gardener × Deep Roots', _lab_signature: 'gardener_drought_resilience' },
  { navicue_type_id: 'lab__gardener__pollinator', navicue_type_name: 'The Pollinator', form: 'Practice', intent: 'Explore', mechanism: 'Ecological Identity', kbe_layer: 'knowing', magic_signature: 'gardener_pollinator', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pollinator', _lab_subtitle: 'Gardener × Cross-Pollination', _lab_signature: 'gardener_pollinator' },
  { navicue_type_id: 'lab__gardener__winter_rest', navicue_type_name: 'The Winter Rest', form: 'Practice', intent: 'Regulate', mechanism: 'Ecological Identity', kbe_layer: 'embodying', magic_signature: 'gardener_winter_rest', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Winter Rest', _lab_subtitle: 'Gardener × Dormancy', _lab_signature: 'gardener_winter_rest' },
  { navicue_type_id: 'lab__gardener__ecosystem_balance', navicue_type_name: 'The Ecosystem Balance', form: 'Practice', intent: 'Explore', mechanism: 'Ecological Identity', kbe_layer: 'knowing', magic_signature: 'gardener_ecosystem_balance', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ecosystem Balance', _lab_subtitle: 'Gardener × Systems Thinking', _lab_signature: 'gardener_ecosystem_balance' },
  { navicue_type_id: 'lab__gardener__gardener_seal', navicue_type_name: 'The Gardener Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Ecological Identity', kbe_layer: 'knowing', magic_signature: 'gardener_gardener_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Gardener Seal', _lab_subtitle: 'Gardener × Stewardship', _lab_signature: 'gardener_gardener_seal' },
  // ── Act 89: THE ANCESTOR II (Legacy Collection) ── #935–#944 ───
  { navicue_type_id: 'lab__ancestorii__100_year_plan', navicue_type_name: 'The 100-Year Plan', form: 'Practice', intent: 'Activate', mechanism: 'Transgenerational Meaning', kbe_layer: 'believing', magic_signature: 'ancestorii_100_year_plan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The 100-Year Plan', _lab_subtitle: 'Ancestor II × Cathedral Thinking', _lab_signature: 'ancestorii_100_year_plan' },
  { navicue_type_id: 'lab__ancestorii__chain_link', navicue_type_name: 'The Chain Link', form: 'Practice', intent: 'Explore', mechanism: 'Transgenerational Meaning', kbe_layer: 'knowing', magic_signature: 'ancestorii_chain_link', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chain Link', _lab_subtitle: 'Ancestor II × Cycle Breaking', _lab_signature: 'ancestorii_chain_link' },
  { navicue_type_id: 'lab__ancestorii__wisdom_capsule', navicue_type_name: 'The Wisdom Capsule', form: 'Practice', intent: 'Activate', mechanism: 'Transgenerational Meaning', kbe_layer: 'embodying', magic_signature: 'ancestorii_wisdom_capsule', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wisdom Capsule', _lab_subtitle: 'Ancestor II × Self-Transcendence', _lab_signature: 'ancestorii_wisdom_capsule' },
  { navicue_type_id: 'lab__ancestorii__name_etching', navicue_type_name: 'The Name Etching', form: 'Practice', intent: 'Explore', mechanism: 'Transgenerational Meaning', kbe_layer: 'knowing', magic_signature: 'ancestorii_name_etching', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Name Etching', _lab_subtitle: 'Ancestor II × Identity as Verb', _lab_signature: 'ancestorii_name_etching' },
  { navicue_type_id: 'lab__ancestorii__torch_pass', navicue_type_name: 'The Torch Pass', form: 'Practice', intent: 'Integrate', mechanism: 'Transgenerational Meaning', kbe_layer: 'believing', magic_signature: 'ancestorii_torch_pass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Torch Pass', _lab_subtitle: 'Ancestor II × Continuity', _lab_signature: 'ancestorii_torch_pass' },
  { navicue_type_id: 'lab__ancestorii__library_contribution', navicue_type_name: 'The Library Contribution', form: 'Practice', intent: 'Integrate', mechanism: 'Transgenerational Meaning', kbe_layer: 'knowing', magic_signature: 'ancestorii_library_contribution', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Library Contribution', _lab_subtitle: 'Ancestor II × Humility', _lab_signature: 'ancestorii_library_contribution' },
  { navicue_type_id: 'lab__ancestorii__ripple_watch', navicue_type_name: 'The Ripple Watch', form: 'Practice', intent: 'Activate', mechanism: 'Transgenerational Meaning', kbe_layer: 'believing', magic_signature: 'ancestorii_ripple_watch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ripple Watch', _lab_subtitle: 'Ancestor II × Unseen Impact', _lab_signature: 'ancestorii_ripple_watch' },
  { navicue_type_id: 'lab__ancestorii__council_seat', navicue_type_name: 'The Council Seat', form: 'Practice', intent: 'Regulate', mechanism: 'Transgenerational Meaning', kbe_layer: 'embodying', magic_signature: 'ancestorii_council_seat', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Council Seat', _lab_subtitle: 'Ancestor II × Maturity', _lab_signature: 'ancestorii_council_seat' },
  { navicue_type_id: 'lab__ancestorii__inheritance_audit', navicue_type_name: 'The Inheritance Audit', form: 'Practice', intent: 'Explore', mechanism: 'Transgenerational Meaning', kbe_layer: 'knowing', magic_signature: 'ancestorii_inheritance_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inheritance Audit', _lab_subtitle: 'Ancestor II × Differentiation', _lab_signature: 'ancestorii_inheritance_audit' },
  { navicue_type_id: 'lab__ancestorii__ancestor_seal', navicue_type_name: 'The Ancestor Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Transgenerational Meaning', kbe_layer: 'knowing', magic_signature: 'ancestorii_ancestor_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ancestor Seal', _lab_subtitle: 'Ancestor II × Generativity', _lab_signature: 'ancestorii_ancestor_seal' },
  // ── Act 90: THE MAGNUM OPUS (Mastery Collection) ── #944–#953 ───
  { navicue_type_id: 'lab__mastery__distillation', navicue_type_name: 'The Distillation', form: 'Practice', intent: 'Activate', mechanism: 'Mastery Integration', kbe_layer: 'believing', magic_signature: 'mastery_distillation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Distillation', _lab_subtitle: 'Magnum Opus × Essence Extraction', _lab_signature: 'mastery_distillation' },
  { navicue_type_id: 'lab__mastery__phoenix_ash', navicue_type_name: 'The Phoenix Ash', form: 'Practice', intent: 'Explore', mechanism: 'Mastery Integration', kbe_layer: 'knowing', magic_signature: 'mastery_phoenix_ash', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phoenix Ash', _lab_subtitle: 'Magnum Opus × Rebirth', _lab_signature: 'mastery_phoenix_ash' },
  { navicue_type_id: 'lab__mastery__gold_standard', navicue_type_name: 'The Gold Standard', form: 'Practice', intent: 'Activate', mechanism: 'Mastery Integration', kbe_layer: 'embodying', magic_signature: 'mastery_gold_standard', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gold Standard', _lab_subtitle: 'Magnum Opus × Excellence', _lab_signature: 'mastery_gold_standard' },
  { navicue_type_id: 'lab__mastery__masterpiece_reveal', navicue_type_name: 'The Masterpiece Reveal', form: 'Practice', intent: 'Explore', mechanism: 'Mastery Integration', kbe_layer: 'knowing', magic_signature: 'mastery_masterpiece_reveal', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Masterpiece Reveal', _lab_subtitle: 'Magnum Opus × Completion', _lab_signature: 'mastery_masterpiece_reveal' },
  { navicue_type_id: 'lab__mastery__chisel_strike', navicue_type_name: 'The Chisel Strike', form: 'Practice', intent: 'Activate', mechanism: 'Mastery Integration', kbe_layer: 'believing', magic_signature: 'mastery_chisel_strike', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chisel Strike', _lab_subtitle: 'Magnum Opus × Precision', _lab_signature: 'mastery_chisel_strike' },
  { navicue_type_id: 'lab__mastery__final_polish', navicue_type_name: 'The Final Polish', form: 'Practice', intent: 'Integrate', mechanism: 'Mastery Integration', kbe_layer: 'embodying', magic_signature: 'mastery_final_polish', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Final Polish', _lab_subtitle: 'Magnum Opus × Refinement', _lab_signature: 'mastery_final_polish' },
  { navicue_type_id: 'lab__mastery__key_turn', navicue_type_name: 'The Key Turn', form: 'Practice', intent: 'Activate', mechanism: 'Mastery Integration', kbe_layer: 'knowing', magic_signature: 'mastery_key_turn', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Key Turn', _lab_subtitle: 'Magnum Opus × Unlocking', _lab_signature: 'mastery_key_turn' },
  { navicue_type_id: 'lab__mastery__crown_weight', navicue_type_name: 'The Crown Weight', form: 'Practice', intent: 'Regulate', mechanism: 'Mastery Integration', kbe_layer: 'believing', magic_signature: 'mastery_crown_weight', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Crown Weight', _lab_subtitle: 'Magnum Opus × Responsibility', _lab_signature: 'mastery_crown_weight' },
  { navicue_type_id: 'lab__mastery__silent_nod', navicue_type_name: 'The Silent Nod', form: 'Practice', intent: 'Explore', mechanism: 'Mastery Integration', kbe_layer: 'embodying', magic_signature: 'mastery_silent_nod', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silent Nod', _lab_subtitle: 'Magnum Opus × Recognition', _lab_signature: 'mastery_silent_nod' },
  { navicue_type_id: 'lab__mastery__mastery_seal', navicue_type_name: 'The Mastery Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Mastery Integration', kbe_layer: 'knowing', magic_signature: 'mastery_mastery_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mastery Seal', _lab_subtitle: 'Magnum Opus × Opus Complete', _lab_signature: 'mastery_mastery_seal' },
  // ── Act 91: THE INFINITE PLAYER (Horizon Collection) ── #954–#963 ───
  { navicue_type_id: 'lab__horizon__horizon_line', navicue_type_name: 'The Horizon Line', form: 'Practice', intent: 'Activate', mechanism: 'Infinite Play', kbe_layer: 'believing', magic_signature: 'horizon_horizon_line', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Horizon Line', _lab_subtitle: 'Infinite Player × Endless Beginning', _lab_signature: 'horizon_horizon_line' },
  { navicue_type_id: 'lab__horizon__new_map', navicue_type_name: 'The New Map', form: 'Practice', intent: 'Explore', mechanism: 'Infinite Play', kbe_layer: 'knowing', magic_signature: 'horizon_new_map', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The New Map', _lab_subtitle: 'Infinite Player × Cartography', _lab_signature: 'horizon_new_map' },
  { navicue_type_id: 'lab__horizon__level_up', navicue_type_name: 'The Level Up', form: 'Practice', intent: 'Activate', mechanism: 'Infinite Play', kbe_layer: 'embodying', magic_signature: 'horizon_level_up', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Level Up', _lab_subtitle: 'Infinite Player × Emergence', _lab_signature: 'horizon_level_up' },
  { navicue_type_id: 'lab__horizon__open_door', navicue_type_name: 'The Open Door', form: 'Practice', intent: 'Explore', mechanism: 'Infinite Play', kbe_layer: 'knowing', magic_signature: 'horizon_open_door', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Open Door', _lab_subtitle: 'Infinite Player × Threshold', _lab_signature: 'horizon_open_door' },
  { navicue_type_id: 'lab__horizon__torch_relay', navicue_type_name: 'The Torch Relay', form: 'Practice', intent: 'Integrate', mechanism: 'Infinite Play', kbe_layer: 'believing', magic_signature: 'horizon_torch_relay', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Torch Relay', _lab_subtitle: 'Infinite Player × Continuity', _lab_signature: 'horizon_torch_relay' },
  { navicue_type_id: 'lab__horizon__sunrise', navicue_type_name: 'The Sunrise', form: 'Practice', intent: 'Activate', mechanism: 'Infinite Play', kbe_layer: 'embodying', magic_signature: 'horizon_sunrise', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sunrise', _lab_subtitle: 'Infinite Player × Renewal', _lab_signature: 'horizon_sunrise' },
  { navicue_type_id: 'lab__horizon__unfinished_symphony', navicue_type_name: 'The Unfinished Symphony', form: 'Practice', intent: 'Regulate', mechanism: 'Infinite Play', kbe_layer: 'knowing', magic_signature: 'horizon_unfinished_symphony', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Unfinished Symphony', _lab_subtitle: 'Infinite Player × Incompleteness', _lab_signature: 'horizon_unfinished_symphony' },
  { navicue_type_id: 'lab__horizon__vastness', navicue_type_name: 'The Vastness', form: 'Practice', intent: 'Explore', mechanism: 'Infinite Play', kbe_layer: 'believing', magic_signature: 'horizon_vastness', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vastness', _lab_subtitle: 'Infinite Player × Awe', _lab_signature: 'horizon_vastness' },
  { navicue_type_id: 'lab__horizon__question_mark', navicue_type_name: 'The Question Mark', form: 'Practice', intent: 'Activate', mechanism: 'Infinite Play', kbe_layer: 'embodying', magic_signature: 'horizon_question_mark', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Question Mark', _lab_subtitle: 'Infinite Player × Curiosity', _lab_signature: 'horizon_question_mark' },
  { navicue_type_id: 'lab__horizon__infinite_seal', navicue_type_name: 'The Infinite Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Infinite Play', kbe_layer: 'knowing', magic_signature: 'horizon_infinite_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Infinite Seal', _lab_subtitle: 'Infinite Player × The Game Continues', _lab_signature: 'horizon_infinite_seal' },
  // ── Act 92: THE ZERO POINT (Void Collection) ── #964–#973 ────────
  { navicue_type_id: 'lab__void__sensory_deprivation', navicue_type_name: 'The Sensory Deprivation', form: 'Practice', intent: 'Regulate', mechanism: 'Via Negativa', kbe_layer: 'embodying', magic_signature: 'void_sensory_deprivation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sensory Deprivation', _lab_subtitle: 'Zero Point × Subtraction', _lab_signature: 'void_sensory_deprivation' },
  { navicue_type_id: 'lab__void__nothing_box', navicue_type_name: 'The Nothing Box', form: 'Practice', intent: 'Explore', mechanism: 'Via Negativa', kbe_layer: 'knowing', magic_signature: 'void_nothing_box', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Nothing Box', _lab_subtitle: 'Zero Point × Emptiness', _lab_signature: 'void_nothing_box' },
  { navicue_type_id: 'lab__void__silence_vacuum', navicue_type_name: 'The Silence Vacuum', form: 'Practice', intent: 'Regulate', mechanism: 'Via Negativa', kbe_layer: 'embodying', magic_signature: 'void_silence_vacuum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silence Vacuum', _lab_subtitle: 'Zero Point × Silence', _lab_signature: 'void_silence_vacuum' },
  { navicue_type_id: 'lab__void__dark_matter', navicue_type_name: 'The Dark Matter', form: 'Practice', intent: 'Explore', mechanism: 'Via Negativa', kbe_layer: 'knowing', magic_signature: 'void_dark_matter', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dark Matter', _lab_subtitle: 'Zero Point × Invisible Force', _lab_signature: 'void_dark_matter' },
  { navicue_type_id: 'lab__void__ego_death', navicue_type_name: 'The Ego Death', form: 'Practice', intent: 'Integrate', mechanism: 'Via Negativa', kbe_layer: 'believing', magic_signature: 'void_ego_death', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ego Death', _lab_subtitle: 'Zero Point × Dissolution', _lab_signature: 'void_ego_death' },
  { navicue_type_id: 'lab__void__breath_hold', navicue_type_name: 'The Breath Hold', form: 'Practice', intent: 'Regulate', mechanism: 'Via Negativa', kbe_layer: 'embodying', magic_signature: 'void_breath_hold', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Breath Hold', _lab_subtitle: 'Zero Point × Suspension', _lab_signature: 'void_breath_hold' },
  { navicue_type_id: 'lab__void__un_naming', navicue_type_name: 'The Un-Naming', form: 'Practice', intent: 'Explore', mechanism: 'Via Negativa', kbe_layer: 'knowing', magic_signature: 'void_un_naming', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Un-Naming', _lab_subtitle: 'Zero Point × Deconstruction', _lab_signature: 'void_un_naming' },
  { navicue_type_id: 'lab__void__reset_button', navicue_type_name: 'The Reset Button', form: 'Practice', intent: 'Activate', mechanism: 'Via Negativa', kbe_layer: 'believing', magic_signature: 'void_reset_button', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Reset Button', _lab_subtitle: 'Zero Point × Return', _lab_signature: 'void_reset_button' },
  { navicue_type_id: 'lab__void__static_clear', navicue_type_name: 'The Static Clear', form: 'Practice', intent: 'Regulate', mechanism: 'Via Negativa', kbe_layer: 'embodying', magic_signature: 'void_static_clear', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Static Clear', _lab_subtitle: 'Zero Point × Signal Clearing', _lab_signature: 'void_static_clear' },
  { navicue_type_id: 'lab__void__zero_seal', navicue_type_name: 'The Zero Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Via Negativa', kbe_layer: 'knowing', magic_signature: 'void_zero_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Zero Seal', _lab_subtitle: 'Zero Point × The Origin', _lab_signature: 'void_zero_seal' },
  // ── Act 93: THE OMEGA (Unity Collection) ── #974–#983 ────────────
  { navicue_type_id: 'lab__unity__prism_return', navicue_type_name: 'The Prism Return', form: 'Practice', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'knowing', magic_signature: 'unity_prism_return', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Prism Return', _lab_subtitle: 'Omega × Reintegration', _lab_signature: 'unity_prism_return' },
  { navicue_type_id: 'lab__unity__symphony', navicue_type_name: 'The Symphony', form: 'Practice', intent: 'Explore', mechanism: 'Holistic Integration', kbe_layer: 'embodying', magic_signature: 'unity_symphony', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Symphony', _lab_subtitle: 'Omega × Harmony', _lab_signature: 'unity_symphony' },
  { navicue_type_id: 'lab__unity__fractal_zoom', navicue_type_name: 'The Fractal Zoom', form: 'Practice', intent: 'Explore', mechanism: 'Holistic Integration', kbe_layer: 'knowing', magic_signature: 'unity_fractal_zoom', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fractal Zoom', _lab_subtitle: 'Omega × Self-Similarity', _lab_signature: 'unity_fractal_zoom' },
  { navicue_type_id: 'lab__unity__entanglement', navicue_type_name: 'The Entanglement', form: 'Practice', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'believing', magic_signature: 'unity_entanglement', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Entanglement', _lab_subtitle: 'Omega × Connection', _lab_signature: 'unity_entanglement' },
  { navicue_type_id: 'lab__unity__golden_ratio', navicue_type_name: 'The Golden Ratio', form: 'Practice', intent: 'Explore', mechanism: 'Holistic Integration', kbe_layer: 'knowing', magic_signature: 'unity_golden_ratio', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Golden Ratio', _lab_subtitle: 'Omega × Sacred Proportion', _lab_signature: 'unity_golden_ratio' },
  { navicue_type_id: 'lab__unity__time_collapse', navicue_type_name: 'The Time Collapse', form: 'Practice', intent: 'Activate', mechanism: 'Holistic Integration', kbe_layer: 'embodying', magic_signature: 'unity_time_collapse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Time Collapse', _lab_subtitle: 'Omega × Eternal Present', _lab_signature: 'unity_time_collapse' },
  { navicue_type_id: 'lab__unity__event_horizon', navicue_type_name: 'The Event Horizon', form: 'Practice', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'believing', magic_signature: 'unity_event_horizon', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Event Horizon', _lab_subtitle: 'Omega × Point of No Return', _lab_signature: 'unity_event_horizon' },
  { navicue_type_id: 'lab__unity__mirror_of_truth', navicue_type_name: 'The Mirror of Truth', form: 'Practice', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'believing', magic_signature: 'unity_mirror_of_truth', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror of Truth', _lab_subtitle: 'Omega × Self-Acceptance', _lab_signature: 'unity_mirror_of_truth' },
  { navicue_type_id: 'lab__unity__final_exhale', navicue_type_name: 'The Final Exhale', form: 'Practice', intent: 'Regulate', mechanism: 'Holistic Integration', kbe_layer: 'embodying', magic_signature: 'unity_final_exhale', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Final Exhale', _lab_subtitle: 'Omega × Letting Go', _lab_signature: 'unity_final_exhale' },
  { navicue_type_id: 'lab__unity__atlas_seal', navicue_type_name: 'The Atlas Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'knowing', magic_signature: 'unity_atlas_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Atlas Seal', _lab_subtitle: 'Omega × You Are The Atlas', _lab_signature: 'unity_atlas_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 94 — THE OUROBOROS (The Eternal Return Collection)
  // Series 100 — 10 specimens — The thousandth mirrors the first
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__ouroboros__first_breath', navicue_type_name: 'The First Breath', form: 'Practice', intent: 'Regulate', mechanism: 'Metacognition', kbe_layer: 'embodying', magic_signature: 'ouroboros_first_breath', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The First Breath', _lab_subtitle: 'Ouroboros × Beginning Again', _lab_signature: 'ouroboros_first_breath' },
  { navicue_type_id: 'lab__ouroboros__mirror_loop', navicue_type_name: 'The Mirror Loop', form: 'Mirror', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ouroboros_mirror_loop', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Mirror Loop', _lab_subtitle: 'Ouroboros × Infinite Reflection', _lab_signature: 'ouroboros_mirror_loop' },
  { navicue_type_id: 'lab__ouroboros__seed_return', navicue_type_name: 'The Seed Return', form: 'Practice', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'believing', magic_signature: 'ouroboros_seed_return', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Seed Return', _lab_subtitle: 'Ouroboros × Planting Origins', _lab_signature: 'ouroboros_seed_return' },
  { navicue_type_id: 'lab__ouroboros__snake_skin', navicue_type_name: 'The Snake Skin', form: 'Practice', intent: 'Activate', mechanism: 'Exposure', kbe_layer: 'embodying', magic_signature: 'ouroboros_snake_skin', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Snake Skin', _lab_subtitle: 'Ouroboros × Shedding Cycles', _lab_signature: 'ouroboros_snake_skin' },
  { navicue_type_id: 'lab__ouroboros__circle_close', navicue_type_name: 'The Circle Close', form: 'Practice', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'knowing', magic_signature: 'ouroboros_circle_close', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Circle Close', _lab_subtitle: 'Ouroboros × Completion Ritual', _lab_signature: 'ouroboros_circle_close' },
  { navicue_type_id: 'lab__ouroboros__ash_sprout', navicue_type_name: 'The Ash Sprout', form: 'Practice', intent: 'Regulate', mechanism: 'Self-Compassion', kbe_layer: 'embodying', magic_signature: 'ouroboros_ash_sprout', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ash Sprout', _lab_subtitle: 'Ouroboros × Phoenix Cycle', _lab_signature: 'ouroboros_ash_sprout' },
  { navicue_type_id: 'lab__ouroboros__echo_origin', navicue_type_name: 'The Echo Origin', form: 'Probe', intent: 'Integrate', mechanism: 'Metacognition', kbe_layer: 'knowing', magic_signature: 'ouroboros_echo_origin', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Echo Origin', _lab_subtitle: 'Ouroboros × Source Signal', _lab_signature: 'ouroboros_echo_origin' },
  { navicue_type_id: 'lab__ouroboros__tail_swallow', navicue_type_name: 'The Tail Swallow', form: 'Practice', intent: 'Activate', mechanism: 'Behavioral Activation', kbe_layer: 'embodying', magic_signature: 'ouroboros_tail_swallow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tail Swallow', _lab_subtitle: 'Ouroboros × Self-Consumption', _lab_signature: 'ouroboros_tail_swallow' },
  { navicue_type_id: 'lab__ouroboros__alpha_omega', navicue_type_name: 'The Alpha Omega', form: 'Practice', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'knowing', magic_signature: 'ouroboros_alpha_omega', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Alpha Omega', _lab_subtitle: 'Ouroboros × First-Last Unity', _lab_signature: 'ouroboros_alpha_omega' },
  { navicue_type_id: 'lab__ouroboros__eternal_seal', navicue_type_name: 'The Eternal Seal', form: 'Identity Koan', intent: 'Integrate', mechanism: 'Holistic Integration', kbe_layer: 'knowing', magic_signature: 'ouroboros_eternal_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Eternal Seal', _lab_subtitle: 'Ouroboros × You Have Always Been Here', _lab_signature: 'ouroboros_eternal_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 95 — THE PROJECTOR (The Projection Collection)
  // Series 101 — 10 specimens — Theater form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__projector__film_swap', navicue_type_name: 'The Film Swap', form: 'Theater', intent: 'Integrate', mechanism: 'Projection', kbe_layer: 'believing', magic_signature: 'projector_film_swap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Film Swap', _lab_subtitle: 'Projector \u00d7 Sensory Cinema', _lab_signature: 'projector_film_swap' },
  { navicue_type_id: 'lab__projector__beam_focus', navicue_type_name: 'The Beam Focus', form: 'Theater', intent: 'Integrate', mechanism: 'Attention', kbe_layer: 'embodying', magic_signature: 'projector_beam_focus', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Beam Focus', _lab_subtitle: 'Projector \u00d7 Science x Soul', _lab_signature: 'projector_beam_focus' },
  { navicue_type_id: 'lab__projector__lens_shift', navicue_type_name: 'The Lens Shift', form: 'Theater', intent: 'Integrate', mechanism: 'Perspective', kbe_layer: 'knowing', magic_signature: 'projector_lens_shift', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Lens Shift', _lab_subtitle: 'Projector \u00d7 Poetic Precision', _lab_signature: 'projector_lens_shift' },
  { navicue_type_id: 'lab__projector__reality_lag', navicue_type_name: 'The Reality Lag', form: 'Theater', intent: 'Integrate', mechanism: 'Dissonance', kbe_layer: 'believing', magic_signature: 'projector_reality_lag', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Reality Lag', _lab_subtitle: 'Projector \u00d7 Koan Paradox', _lab_signature: 'projector_reality_lag' },
  { navicue_type_id: 'lab__projector__tuning_fork', navicue_type_name: 'The Tuning Fork', form: 'Theater', intent: 'Integrate', mechanism: 'Resonance', kbe_layer: 'embodying', magic_signature: 'projector_tuning_fork', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tuning Fork', _lab_subtitle: 'Projector \u00d7 Sensory Cinema', _lab_signature: 'projector_tuning_fork' },
  { navicue_type_id: 'lab__projector__silent_reel', navicue_type_name: 'The Silent Reel', form: 'Theater', intent: 'Integrate', mechanism: 'Witness', kbe_layer: 'embodying', magic_signature: 'projector_silent_reel', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Silent Reel', _lab_subtitle: 'Projector \u00d7 Witness Ritual', _lab_signature: 'projector_silent_reel' },
  { navicue_type_id: 'lab__projector__fourth_wall', navicue_type_name: 'The Fourth Wall', form: 'Theater', intent: 'Integrate', mechanism: 'Disruption', kbe_layer: 'believing', magic_signature: 'projector_fourth_wall', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fourth Wall', _lab_subtitle: 'Projector \u00d7 Pattern Glitch', _lab_signature: 'projector_fourth_wall' },
  { navicue_type_id: 'lab__projector__splice_point', navicue_type_name: 'The Splice Point', form: 'Theater', intent: 'Integrate', mechanism: 'Editing', kbe_layer: 'knowing', magic_signature: 'projector_splice_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Splice Point', _lab_subtitle: 'Projector \u00d7 Science x Soul', _lab_signature: 'projector_splice_point' },
  { navicue_type_id: 'lab__projector__ghost_light', navicue_type_name: 'The Ghost Light', form: 'Theater', intent: 'Integrate', mechanism: 'Presence', kbe_layer: 'believing', magic_signature: 'projector_ghost_light', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ghost Light', _lab_subtitle: 'Projector \u00d7 Relational Ghost', _lab_signature: 'projector_ghost_light' },
  { navicue_type_id: 'lab__projector__projector_seal', navicue_type_name: 'The Projector Seal', form: 'Theater', intent: 'Integrate', mechanism: 'Integration', kbe_layer: 'embodying', magic_signature: 'projector_projector_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Projector Seal', _lab_subtitle: 'Projector \u00d7 Sacred Ordinary', _lab_signature: 'projector_projector_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 96 — THE CHRONOMANCER (The Time Collection)
  // Series 102 — 10 specimens — Cosmos form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__chronomancer__past_edit', navicue_type_name: 'The Past Edit', form: 'Cosmos', intent: 'Integrate', mechanism: 'Temporal Reframe', kbe_layer: 'knowing', magic_signature: 'chronomancer_past_edit', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Past Edit', _lab_subtitle: 'Chronomancer \u00d7 Poetic Precision', _lab_signature: 'chronomancer_past_edit' },
  { navicue_type_id: 'lab__chronomancer__future_borrow', navicue_type_name: 'The Future Borrow', form: 'Cosmos', intent: 'Integrate', mechanism: 'Temporal Projection', kbe_layer: 'believing', magic_signature: 'chronomancer_future_borrow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Future Borrow', _lab_subtitle: 'Chronomancer \u00d7 Science x Soul', _lab_signature: 'chronomancer_future_borrow' },
  { navicue_type_id: 'lab__chronomancer__time_dilation', navicue_type_name: 'The Time Dilation', form: 'Cosmos', intent: 'Integrate', mechanism: 'Temporal Perception', kbe_layer: 'embodying', magic_signature: 'chronomancer_time_dilation', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Time Dilation', _lab_subtitle: 'Chronomancer \u00d7 Sensory Cinema', _lab_signature: 'chronomancer_time_dilation' },
  { navicue_type_id: 'lab__chronomancer__ancestral_link', navicue_type_name: 'The Ancestral Link', form: 'Cosmos', intent: 'Integrate', mechanism: 'Lineage', kbe_layer: 'believing', magic_signature: 'chronomancer_ancestral_link', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ancestral Link', _lab_subtitle: 'Chronomancer \u00d7 Sacred Ordinary', _lab_signature: 'chronomancer_ancestral_link' },
  { navicue_type_id: 'lab__chronomancer__legacy_cast', navicue_type_name: 'The Legacy Cast', form: 'Cosmos', intent: 'Integrate', mechanism: 'Future Legacy', kbe_layer: 'knowing', magic_signature: 'chronomancer_legacy_cast', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Legacy Cast', _lab_subtitle: 'Chronomancer \u00d7 Witness Ritual', _lab_signature: 'chronomancer_legacy_cast' },
  { navicue_type_id: 'lab__chronomancer__regret_reversal', navicue_type_name: 'The Regret Reversal', form: 'Cosmos', intent: 'Integrate', mechanism: 'Regret Reframe', kbe_layer: 'believing', magic_signature: 'chronomancer_regret_reversal', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Regret Reversal', _lab_subtitle: 'Chronomancer \u00d7 Koan Paradox', _lab_signature: 'chronomancer_regret_reversal' },
  { navicue_type_id: 'lab__chronomancer__deja_vu', navicue_type_name: 'The Deja Vu', form: 'Cosmos', intent: 'Integrate', mechanism: 'Pattern Recognition', kbe_layer: 'knowing', magic_signature: 'chronomancer_deja_vu', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deja Vu', _lab_subtitle: 'Chronomancer \u00d7 Pattern Glitch', _lab_signature: 'chronomancer_deja_vu' },
  { navicue_type_id: 'lab__chronomancer__wormhole', navicue_type_name: 'The Wormhole', form: 'Cosmos', intent: 'Integrate', mechanism: 'Temporal Bridge', kbe_layer: 'embodying', magic_signature: 'chronomancer_wormhole', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Wormhole', _lab_subtitle: 'Chronomancer \u00d7 Science x Soul', _lab_signature: 'chronomancer_wormhole' },
  { navicue_type_id: 'lab__chronomancer__eternal_now', navicue_type_name: 'The Eternal Now', form: 'Cosmos', intent: 'Integrate', mechanism: 'Present Moment', kbe_layer: 'embodying', magic_signature: 'chronomancer_eternal_now', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Eternal Now', _lab_subtitle: 'Chronomancer \u00d7 Sacred Ordinary', _lab_signature: 'chronomancer_eternal_now' },
  { navicue_type_id: 'lab__chronomancer__chronos_seal', navicue_type_name: 'The Chronos Seal', form: 'Cosmos', intent: 'Integrate', mechanism: 'Temporal Integration', kbe_layer: 'embodying', magic_signature: 'chronomancer_chronos_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Chronos Seal', _lab_subtitle: 'Chronomancer \u00d7 Science x Soul', _lab_signature: 'chronomancer_chronos_seal' },

  // ═══════════════════════════════════════════════════════════════
  // THE RESONATOR (The Frequency Collection)
  // Series 103 -- 10 specimens -- Ocean form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__resonator__noise_cancellation', navicue_type_name: 'The Noise Cancellation', form: 'Ocean', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'resonator_noise_cancellation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Noise Cancellation', _lab_subtitle: 'Resonator \u00d7 Sensory Cinema', _lab_signature: 'resonator_noise_cancellation' },
  { navicue_type_id: 'lab__resonator__carrier_wave', navicue_type_name: 'The Carrier Wave', form: 'Ocean', intent: 'Integrate', mechanism: 'Cognitive Restructuring', kbe_layer: 'believing', magic_signature: 'resonator_carrier_wave', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Carrier Wave', _lab_subtitle: 'Resonator \u00d7 Poetic Precision', _lab_signature: 'resonator_carrier_wave' },
  { navicue_type_id: 'lab__resonator__constructive_interference', navicue_type_name: 'The Constructive Interference', form: 'Ocean', intent: 'Integrate', mechanism: 'Resource Alignment', kbe_layer: 'knowing', magic_signature: 'resonator_constructive_interference', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Constructive Interference', _lab_subtitle: 'Resonator \u00d7 Science x Soul', _lab_signature: 'resonator_constructive_interference' },
  { navicue_type_id: 'lab__resonator__sympathetic_resonance', navicue_type_name: 'The Sympathetic Resonance', form: 'Ocean', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'resonator_sympathetic_resonance', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Sympathetic Resonance', _lab_subtitle: 'Resonator \u00d7 Relational Ghost', _lab_signature: 'resonator_sympathetic_resonance' },
  { navicue_type_id: 'lab__resonator__feedback_loop', navicue_type_name: 'The Feedback Loop', form: 'Ocean', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'resonator_feedback_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Feedback Loop', _lab_subtitle: 'Resonator \u00d7 Pattern Glitch', _lab_signature: 'resonator_feedback_loop' },
  { navicue_type_id: 'lab__resonator__pure_tone', navicue_type_name: 'The Pure Tone', form: 'Ocean', intent: 'Integrate', mechanism: 'Self-Advocacy', kbe_layer: 'embodying', magic_signature: 'resonator_pure_tone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pure Tone', _lab_subtitle: 'Resonator \u00d7 Witness Ritual', _lab_signature: 'resonator_pure_tone' },
  { navicue_type_id: 'lab__resonator__volume_knob', navicue_type_name: 'The Volume Knob', form: 'Ocean', intent: 'Integrate', mechanism: 'Attention Shift', kbe_layer: 'knowing', magic_signature: 'resonator_volume_knob', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Volume Knob', _lab_subtitle: 'Resonator \u00d7 Sacred Ordinary', _lab_signature: 'resonator_volume_knob' },
  { navicue_type_id: 'lab__resonator__echo_chamber', navicue_type_name: 'The Echo Chamber', form: 'Ocean', intent: 'Integrate', mechanism: 'Cognitive Restructuring', kbe_layer: 'believing', magic_signature: 'resonator_echo_chamber', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Echo Chamber', _lab_subtitle: 'Resonator \u00d7 Koan Paradox', _lab_signature: 'resonator_echo_chamber' },
  { navicue_type_id: 'lab__resonator__frequency_jammer', navicue_type_name: 'The Frequency Jammer', form: 'Ocean', intent: 'Integrate', mechanism: 'Attention Shift', kbe_layer: 'knowing', magic_signature: 'resonator_frequency_jammer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Frequency Jammer', _lab_subtitle: 'Resonator \u00d7 Pattern Glitch', _lab_signature: 'resonator_frequency_jammer' },
  { navicue_type_id: 'lab__resonator__resonator_seal', navicue_type_name: 'The Resonator Seal', form: 'Ocean', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'resonator_resonator_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Resonator Seal', _lab_subtitle: 'Resonator \u00d7 Sensory Cinema', _lab_signature: 'resonator_resonator_seal' },

  // ═══════════════════════════════════════════════════════════════
  // ACT 97 — THE MATERIALIST (The Matter Collection)
  // Series 104 — 10 specimens — Ember form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__materialist__first_brick', navicue_type_name: 'The First Brick', form: 'Ember', intent: 'Integrate', mechanism: 'Foundation', kbe_layer: 'embodying', magic_signature: 'materialist_first_brick', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The First Brick', _lab_subtitle: 'Materialist \u00d7 Sacred Ordinary', _lab_signature: 'materialist_first_brick' },
  { navicue_type_id: 'lab__materialist__blueprint_edit', navicue_type_name: 'The Blueprint Edit', form: 'Ember', intent: 'Integrate', mechanism: 'Design', kbe_layer: 'knowing', magic_signature: 'materialist_blueprint_edit', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Blueprint Edit', _lab_subtitle: 'Materialist \u00d7 Poetic Precision', _lab_signature: 'materialist_blueprint_edit' },
  { navicue_type_id: 'lab__materialist__gravity_well', navicue_type_name: 'The Gravity Well', form: 'Ember', intent: 'Integrate', mechanism: 'Weight', kbe_layer: 'believing', magic_signature: 'materialist_gravity_well', container_type: 'depth', primary_prompt: null, cta_primary: null, _lab_title: 'The Gravity Well', _lab_subtitle: 'Materialist \u00d7 Science x Soul', _lab_signature: 'materialist_gravity_well' },
  { navicue_type_id: 'lab__materialist__friction_test', navicue_type_name: 'The Friction Test', form: 'Ember', intent: 'Integrate', mechanism: 'Resistance', kbe_layer: 'believing', magic_signature: 'materialist_friction_test', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Test', _lab_subtitle: 'Materialist \u00d7 Witness Ritual', _lab_signature: 'materialist_friction_test' },
  { navicue_type_id: 'lab__materialist__scaffolding', navicue_type_name: 'The Scaffolding', form: 'Ember', intent: 'Integrate', mechanism: 'Structure', kbe_layer: 'knowing', magic_signature: 'materialist_scaffolding', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Scaffolding', _lab_subtitle: 'Materialist \u00d7 Koan Paradox', _lab_signature: 'materialist_scaffolding' },
  { navicue_type_id: 'lab__materialist__concrete_pour', navicue_type_name: 'The Concrete Pour', form: 'Ember', intent: 'Integrate', mechanism: 'Commitment', kbe_layer: 'embodying', magic_signature: 'materialist_concrete_pour', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Concrete Pour', _lab_subtitle: 'Materialist \u00d7 Sensory Cinema', _lab_signature: 'materialist_concrete_pour' },
  { navicue_type_id: 'lab__materialist__keystone', navicue_type_name: 'The Keystone', form: 'Ember', intent: 'Integrate', mechanism: 'Critical Point', kbe_layer: 'knowing', magic_signature: 'materialist_keystone', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Keystone', _lab_subtitle: 'Materialist \u00d7 Poetic Precision', _lab_signature: 'materialist_keystone' },
  { navicue_type_id: 'lab__materialist__demolition', navicue_type_name: 'The Demolition', form: 'Ember', intent: 'Integrate', mechanism: 'Destruction', kbe_layer: 'believing', magic_signature: 'materialist_demolition', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Demolition', _lab_subtitle: 'Materialist \u00d7 Pattern Glitch', _lab_signature: 'materialist_demolition' },
  { navicue_type_id: 'lab__materialist__inspection', navicue_type_name: 'The Inspection', form: 'Ember', intent: 'Integrate', mechanism: 'Assessment', kbe_layer: 'knowing', magic_signature: 'materialist_inspection', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Inspection', _lab_subtitle: 'Materialist \u00d7 Science x Soul', _lab_signature: 'materialist_inspection' },
  { navicue_type_id: 'lab__materialist__materialist_seal', navicue_type_name: 'The Materialist Seal', form: 'Ember', intent: 'Integrate', mechanism: 'Material Integration', kbe_layer: 'embodying', magic_signature: 'materialist_materialist_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Materialist Seal', _lab_subtitle: 'Materialist \u00d7 Sacred Ordinary', _lab_signature: 'materialist_materialist_seal' },
  // ═══════════════════════════════════════════════════════════════
  // ACT 99 — THE REFRACTOR (The Prism / Refraction Collection)
  // Series 105 — 10 specimens — Stellar form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__refractor__spectrum_split', navicue_type_name: 'The Spectrum Split', form: 'Stellar', intent: 'Integrate', mechanism: 'Decomposition', kbe_layer: 'knowing', magic_signature: 'refractor_spectrum_split', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Spectrum Split', _lab_subtitle: 'Refractor \u00d7 Science x Soul', _lab_signature: 'refractor_spectrum_split' },
  { navicue_type_id: 'lab__refractor__focal_point', navicue_type_name: 'The Focal Point', form: 'Stellar', intent: 'Integrate', mechanism: 'Focus', kbe_layer: 'embodying', magic_signature: 'refractor_focal_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Focal Point', _lab_subtitle: 'Refractor \u00d7 Sensory Cinema', _lab_signature: 'refractor_focal_point' },
  { navicue_type_id: 'lab__refractor__distortion_check', navicue_type_name: 'The Distortion Check', form: 'Stellar', intent: 'Integrate', mechanism: 'Reality Testing', kbe_layer: 'knowing', magic_signature: 'refractor_distortion_check', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Distortion Check', _lab_subtitle: 'Refractor \u00d7 Koan Paradox', _lab_signature: 'refractor_distortion_check' },
  { navicue_type_id: 'lab__refractor__color_grade', navicue_type_name: 'The Color Grade', form: 'Stellar', intent: 'Integrate', mechanism: 'Emotional Regulation', kbe_layer: 'believing', magic_signature: 'refractor_color_grade', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Color Grade', _lab_subtitle: 'Refractor \u00d7 Poetic Precision', _lab_signature: 'refractor_color_grade' },
  { navicue_type_id: 'lab__refractor__blind_spot', navicue_type_name: 'The Blind Spot', form: 'Stellar', intent: 'Integrate', mechanism: 'Shadow Work', kbe_layer: 'knowing', magic_signature: 'refractor_blind_spot', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Blind Spot', _lab_subtitle: 'Refractor \u00d7 Witness Ritual', _lab_signature: 'refractor_blind_spot' },
  { navicue_type_id: 'lab__refractor__polarizer', navicue_type_name: 'The Polarizer', form: 'Stellar', intent: 'Integrate', mechanism: 'Insight', kbe_layer: 'embodying', magic_signature: 'refractor_polarizer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Polarizer', _lab_subtitle: 'Refractor \u00d7 Pattern Glitch', _lab_signature: 'refractor_polarizer' },
  { navicue_type_id: 'lab__refractor__black_body', navicue_type_name: 'The Black Body', form: 'Stellar', intent: 'Integrate', mechanism: 'Boundaries', kbe_layer: 'believing', magic_signature: 'refractor_black_body', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Black Body', _lab_subtitle: 'Refractor \u00d7 Relational Ghost', _lab_signature: 'refractor_black_body' },
  { navicue_type_id: 'lab__refractor__laser', navicue_type_name: 'The Laser', form: 'Stellar', intent: 'Integrate', mechanism: 'Alignment', kbe_layer: 'embodying', magic_signature: 'refractor_laser', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Laser', _lab_subtitle: 'Refractor \u00d7 Science x Soul', _lab_signature: 'refractor_laser' },
  { navicue_type_id: 'lab__refractor__darkroom', navicue_type_name: 'The Darkroom', form: 'Stellar', intent: 'Integrate', mechanism: 'Incubation', kbe_layer: 'believing', magic_signature: 'refractor_darkroom', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Darkroom', _lab_subtitle: 'Refractor \u00d7 Sacred Ordinary', _lab_signature: 'refractor_darkroom' },
  { navicue_type_id: 'lab__refractor__prism_seal', navicue_type_name: 'The Prism Seal', form: 'Stellar', intent: 'Integrate', mechanism: 'Refraction', kbe_layer: 'embodying', magic_signature: 'refractor_prism_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Prism Seal', _lab_subtitle: 'Refractor \u00d7 Science x Soul', _lab_signature: 'refractor_prism_seal' },
  // ═══════════════════════════════════════════════════════════════
  // ACT 100 — THE ENGINE (The Thermodynamics Collection)
  // Series 106 — 10 specimens — Circuit form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__engine__entropy_check', navicue_type_name: 'The Entropy Check', form: 'Circuit', intent: 'Integrate', mechanism: 'Maintenance', kbe_layer: 'believing', magic_signature: 'engine_entropy_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Entropy Check', _lab_subtitle: 'Engine \u00d7 Sacred Ordinary', _lab_signature: 'engine_entropy_check' },
  { navicue_type_id: 'lab__engine__heat_sink', navicue_type_name: 'The Heat Sink', form: 'Circuit', intent: 'Integrate', mechanism: 'Somatic Regulation', kbe_layer: 'embodying', magic_signature: 'engine_heat_sink', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Heat Sink', _lab_subtitle: 'Engine \u00d7 Sensory Cinema', _lab_signature: 'engine_heat_sink' },
  { navicue_type_id: 'lab__engine__closed_loop', navicue_type_name: 'The Closed Loop', form: 'Circuit', intent: 'Integrate', mechanism: 'Resource Management', kbe_layer: 'knowing', magic_signature: 'engine_closed_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Closed Loop', _lab_subtitle: 'Engine \u00d7 Pattern Glitch', _lab_signature: 'engine_closed_loop' },
  { navicue_type_id: 'lab__engine__flywheel', navicue_type_name: 'The Flywheel', form: 'Circuit', intent: 'Integrate', mechanism: 'Momentum', kbe_layer: 'believing', magic_signature: 'engine_flywheel', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Flywheel', _lab_subtitle: 'Engine \u00d7 Science x Soul', _lab_signature: 'engine_flywheel' },
  { navicue_type_id: 'lab__engine__insulation', navicue_type_name: 'The Insulation', form: 'Circuit', intent: 'Integrate', mechanism: 'Environment Design', kbe_layer: 'knowing', magic_signature: 'engine_insulation', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Insulation', _lab_subtitle: 'Engine \u00d7 Relational Ghost', _lab_signature: 'engine_insulation' },
  { navicue_type_id: 'lab__engine__turbocharger', navicue_type_name: 'The Turbocharger', form: 'Circuit', intent: 'Integrate', mechanism: 'Reframing', kbe_layer: 'believing', magic_signature: 'engine_turbocharger', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Turbocharger', _lab_subtitle: 'Engine \u00d7 Koan Paradox', _lab_signature: 'engine_turbocharger' },
  { navicue_type_id: 'lab__engine__idle_state', navicue_type_name: 'The Idle State', form: 'Circuit', intent: 'Integrate', mechanism: 'Readiness', kbe_layer: 'embodying', magic_signature: 'engine_idle_state', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Idle State', _lab_subtitle: 'Engine \u00d7 Witness Ritual', _lab_signature: 'engine_idle_state' },
  { navicue_type_id: 'lab__engine__fuel_mix', navicue_type_name: 'The Fuel Mix', form: 'Circuit', intent: 'Integrate', mechanism: 'Balance', kbe_layer: 'knowing', magic_signature: 'engine_fuel_mix', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Fuel Mix', _lab_subtitle: 'Engine \u00d7 Science x Soul', _lab_signature: 'engine_fuel_mix' },
  { navicue_type_id: 'lab__engine__governor', navicue_type_name: 'The Governor', form: 'Circuit', intent: 'Integrate', mechanism: 'Self-Limitation', kbe_layer: 'believing', magic_signature: 'engine_governor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Governor', _lab_subtitle: 'Engine \u00d7 Poetic Precision', _lab_signature: 'engine_governor' },
  { navicue_type_id: 'lab__engine__engine_seal', navicue_type_name: 'The Engine Seal', form: 'Circuit', intent: 'Integrate', mechanism: 'Thermodynamic Integration', kbe_layer: 'embodying', magic_signature: 'engine_engine_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Engine Seal', _lab_subtitle: 'Engine \u00d7 Science x Soul', _lab_signature: 'engine_engine_seal' },
  // ═══════════════════════════════════════════════════════════════
  // ACT 101 — THE CATALYST (The Chemistry Collection)
  // Series 107 — 10 specimens — Glacier form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__catalyst__phase_change', navicue_type_name: 'The Phase Change', form: 'Glacier', intent: 'Integrate', mechanism: 'Perseverance', kbe_layer: 'believing', magic_signature: 'catalyst_phase_change', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phase Change', _lab_subtitle: 'Catalyst \u00d7 Sacred Ordinary', _lab_signature: 'catalyst_phase_change' },
  { navicue_type_id: 'lab__catalyst__precipitate', navicue_type_name: 'The Precipitate', form: 'Glacier', intent: 'Integrate', mechanism: 'Decision Making', kbe_layer: 'knowing', magic_signature: 'catalyst_precipitate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Precipitate', _lab_subtitle: 'Catalyst \u00d7 Science x Soul', _lab_signature: 'catalyst_precipitate' },
  { navicue_type_id: 'lab__catalyst__titration', navicue_type_name: 'The Titration', form: 'Glacier', intent: 'Integrate', mechanism: 'Calibrated Awareness', kbe_layer: 'embodying', magic_signature: 'catalyst_titration', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Titration', _lab_subtitle: 'Catalyst \u00d7 Poetic Precision', _lab_signature: 'catalyst_titration' },
  { navicue_type_id: 'lab__catalyst__compound', navicue_type_name: 'The Compound', form: 'Glacier', intent: 'Integrate', mechanism: 'Dialectical Synthesis', kbe_layer: 'knowing', magic_signature: 'catalyst_compound', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compound', _lab_subtitle: 'Catalyst \u00d7 Koan Paradox', _lab_signature: 'catalyst_compound' },
  { navicue_type_id: 'lab__catalyst__solvent', navicue_type_name: 'The Solvent', form: 'Glacier', intent: 'Integrate', mechanism: 'Plasticity', kbe_layer: 'believing', magic_signature: 'catalyst_solvent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Solvent', _lab_subtitle: 'Catalyst \u00d7 Pattern Glitch', _lab_signature: 'catalyst_solvent' },
  { navicue_type_id: 'lab__catalyst__chain_reaction', navicue_type_name: 'The Chain Reaction', form: 'Glacier', intent: 'Integrate', mechanism: 'Leverage', kbe_layer: 'knowing', magic_signature: 'catalyst_chain_reaction', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chain Reaction', _lab_subtitle: 'Catalyst \u00d7 Witness Ritual', _lab_signature: 'catalyst_chain_reaction' },
  { navicue_type_id: 'lab__catalyst__purification', navicue_type_name: 'The Purification', form: 'Glacier', intent: 'Integrate', mechanism: 'Essentialism', kbe_layer: 'believing', magic_signature: 'catalyst_purification', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Purification', _lab_subtitle: 'Catalyst \u00d7 Poetic Precision', _lab_signature: 'catalyst_purification' },
  { navicue_type_id: 'lab__catalyst__inert_gas', navicue_type_name: 'The Inert Gas', form: 'Glacier', intent: 'Integrate', mechanism: 'Shielding', kbe_layer: 'embodying', magic_signature: 'catalyst_inert_gas', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inert Gas', _lab_subtitle: 'Catalyst \u00d7 Relational Ghost', _lab_signature: 'catalyst_inert_gas' },
  { navicue_type_id: 'lab__catalyst__enzyme', navicue_type_name: 'The Enzyme', form: 'Glacier', intent: 'Integrate', mechanism: 'Accelerated Learning', kbe_layer: 'knowing', magic_signature: 'catalyst_enzyme', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Enzyme', _lab_subtitle: 'Catalyst \u00d7 Science x Soul', _lab_signature: 'catalyst_enzyme' },
  { navicue_type_id: 'lab__catalyst__equilibrium', navicue_type_name: 'The Equilibrium', form: 'Glacier', intent: 'Integrate', mechanism: 'Dynamic Acceptance', kbe_layer: 'embodying', magic_signature: 'catalyst_equilibrium', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Equilibrium', _lab_subtitle: 'Catalyst \u00d7 Koan Paradox', _lab_signature: 'catalyst_equilibrium' },
  // ═══════════════════════════════════════════════════════════════
  // ACT 102 — THE QUANTUM ARCHITECT (The Probability Collection)
  // Series 108 — 10 specimens — Tide form
  // ═══════════════════════════════════════════════════════════════
  { navicue_type_id: 'lab__quantumarchitect__superposition', navicue_type_name: 'The Superposition', form: 'Tide', intent: 'Integrate', mechanism: 'Uncertainty Tolerance', kbe_layer: 'believing', magic_signature: 'quantumarchitect_superposition', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Superposition', _lab_subtitle: 'Quantum Architect \u00d7 Koan Paradox', _lab_signature: 'quantumarchitect_superposition' },
  { navicue_type_id: 'lab__quantumarchitect__probability_cloud', navicue_type_name: 'The Probability Cloud', form: 'Tide', intent: 'Integrate', mechanism: 'Risk Assessment', kbe_layer: 'knowing', magic_signature: 'quantumarchitect_probability_cloud', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Probability Cloud', _lab_subtitle: 'Quantum Architect \u00d7 Science x Soul', _lab_signature: 'quantumarchitect_probability_cloud' },
  { navicue_type_id: 'lab__quantumarchitect__observer_effect', navicue_type_name: 'The Observer Effect', form: 'Tide', intent: 'Integrate', mechanism: 'Monitoring', kbe_layer: 'embodying', magic_signature: 'quantumarchitect_observer_effect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Observer Effect', _lab_subtitle: 'Quantum Architect \u00d7 Witness Ritual', _lab_signature: 'quantumarchitect_observer_effect' },
  { navicue_type_id: 'lab__quantumarchitect__multiverse_branch', navicue_type_name: 'The Multiverse Branch', form: 'Tide', intent: 'Integrate', mechanism: 'Commitment', kbe_layer: 'believing', magic_signature: 'quantumarchitect_multiverse_branch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Multiverse Branch', _lab_subtitle: 'Quantum Architect \u00d7 Sacred Ordinary', _lab_signature: 'quantumarchitect_multiverse_branch' },
  { navicue_type_id: 'lab__quantumarchitect__quantum_tunneling', navicue_type_name: 'The Quantum Tunneling', form: 'Tide', intent: 'Integrate', mechanism: 'Flow State', kbe_layer: 'embodying', magic_signature: 'quantumarchitect_quantum_tunneling', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Quantum Tunneling', _lab_subtitle: 'Quantum Architect \u00d7 Sensory Cinema', _lab_signature: 'quantumarchitect_quantum_tunneling' },
  { navicue_type_id: 'lab__quantumarchitect__entanglement', navicue_type_name: 'The Entanglement', form: 'Tide', intent: 'Integrate', mechanism: 'Connection', kbe_layer: 'believing', magic_signature: 'quantumarchitect_entanglement', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Entanglement', _lab_subtitle: 'Quantum Architect \u00d7 Relational Ghost', _lab_signature: 'quantumarchitect_entanglement' },
  { navicue_type_id: 'lab__quantumarchitect__wave_function_collapse', navicue_type_name: 'The Wave Function Collapse', form: 'Tide', intent: 'Integrate', mechanism: 'Attentional Control', kbe_layer: 'knowing', magic_signature: 'quantumarchitect_wave_function_collapse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wave Function Collapse', _lab_subtitle: 'Quantum Architect \u00d7 Poetic Precision', _lab_signature: 'quantumarchitect_wave_function_collapse' },
  { navicue_type_id: 'lab__quantumarchitect__uncertainty_principle', navicue_type_name: 'The Uncertainty Principle', form: 'Tide', intent: 'Integrate', mechanism: 'Trade-off Analysis', kbe_layer: 'knowing', magic_signature: 'quantumarchitect_uncertainty_principle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Uncertainty Principle', _lab_subtitle: 'Quantum Architect \u00d7 Pattern Glitch', _lab_signature: 'quantumarchitect_uncertainty_principle' },
  { navicue_type_id: 'lab__quantumarchitect__vacuum_fluctuation', navicue_type_name: 'The Vacuum Fluctuation', form: 'Tide', intent: 'Integrate', mechanism: 'Stillness', kbe_layer: 'embodying', magic_signature: 'quantumarchitect_vacuum_fluctuation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vacuum Fluctuation', _lab_subtitle: 'Quantum Architect \u00d7 Sacred Ordinary', _lab_signature: 'quantumarchitect_vacuum_fluctuation' },
  { navicue_type_id: 'lab__quantumarchitect__quantum_seal', navicue_type_name: 'The Quantum Seal', form: 'Tide', intent: 'Integrate', mechanism: 'Quantum Bayesianism', kbe_layer: 'embodying', magic_signature: 'quantumarchitect_quantum_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Quantum Seal', _lab_subtitle: 'Quantum Architect \u00d7 Science x Soul', _lab_signature: 'quantumarchitect_quantum_seal' },
  // ── S109 Transmuter (The Alchemy Collection) ── Seeds 1081-1090 ──
  { navicue_type_id: 'lab__transmuter__lead_weight', navicue_type_name: 'The Lead Weight', form: 'Ember', intent: 'Integrate', mechanism: 'Sublimation', kbe_layer: 'believing', magic_signature: 'transmuter_lead_weight', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lead Weight', _lab_subtitle: 'Transmuter \u00d7 Witness Ritual', _lab_signature: 'transmuter_lead_weight' },
  { navicue_type_id: 'lab__transmuter__calcination', navicue_type_name: 'The Calcination', form: 'Ember', intent: 'Integrate', mechanism: 'Essentialism', kbe_layer: 'knowing', magic_signature: 'transmuter_calcination', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Calcination', _lab_subtitle: 'Transmuter \u00d7 Sacred Ordinary', _lab_signature: 'transmuter_calcination' },
  { navicue_type_id: 'lab__transmuter__distillation', navicue_type_name: 'The Distillation', form: 'Ember', intent: 'Integrate', mechanism: 'Insight', kbe_layer: 'knowing', magic_signature: 'transmuter_distillation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Distillation', _lab_subtitle: 'Transmuter \u00d7 Poetic Precision', _lab_signature: 'transmuter_distillation' },
  { navicue_type_id: 'lab__transmuter__coagulation', navicue_type_name: 'The Coagulation', form: 'Ember', intent: 'Integrate', mechanism: 'Action', kbe_layer: 'embodying', magic_signature: 'transmuter_coagulation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Coagulation', _lab_subtitle: 'Transmuter \u00d7 Science x Soul', _lab_signature: 'transmuter_coagulation' },
  { navicue_type_id: 'lab__transmuter__fermentation', navicue_type_name: 'The Fermentation', form: 'Ember', intent: 'Integrate', mechanism: 'Patience', kbe_layer: 'believing', magic_signature: 'transmuter_fermentation', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Fermentation', _lab_subtitle: 'Transmuter \u00d7 Koan Paradox', _lab_signature: 'transmuter_fermentation' },
  { navicue_type_id: 'lab__transmuter__sublimation', navicue_type_name: 'The Sublimation', form: 'Ember', intent: 'Integrate', mechanism: 'Energy State', kbe_layer: 'embodying', magic_signature: 'transmuter_sublimation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sublimation', _lab_subtitle: 'Transmuter \u00d7 Sensory Cinema', _lab_signature: 'transmuter_sublimation' },
  { navicue_type_id: 'lab__transmuter__amalgam', navicue_type_name: 'The Amalgam', form: 'Ember', intent: 'Integrate', mechanism: 'Synthesis', kbe_layer: 'knowing', magic_signature: 'transmuter_amalgam', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Amalgam', _lab_subtitle: 'Transmuter \u00d7 Pattern Glitch', _lab_signature: 'transmuter_amalgam' },
  { navicue_type_id: 'lab__transmuter__universal_solvent', navicue_type_name: 'The Universal Solvent', form: 'Ember', intent: 'Integrate', mechanism: 'Release', kbe_layer: 'embodying', magic_signature: 'transmuter_universal_solvent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Universal Solvent', _lab_subtitle: 'Transmuter \u00d7 Relational Ghost', _lab_signature: 'transmuter_universal_solvent' },
  { navicue_type_id: 'lab__transmuter__philosophers_stone', navicue_type_name: 'The Philosopher\'s Stone', form: 'Ember', intent: 'Integrate', mechanism: 'Agency', kbe_layer: 'believing', magic_signature: 'transmuter_philosophers_stone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Philosopher\'s Stone', _lab_subtitle: 'Transmuter \u00d7 Sacred Ordinary', _lab_signature: 'transmuter_philosophers_stone' },
  { navicue_type_id: 'lab__transmuter__transmuter_seal', navicue_type_name: 'The Transmuter Seal', form: 'Ember', intent: 'Integrate', mechanism: 'Conservation of Energy', kbe_layer: 'embodying', magic_signature: 'transmuter_transmuter_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Transmuter Seal', _lab_subtitle: 'Transmuter \u00d7 Science x Soul', _lab_signature: 'transmuter_transmuter_seal' },
  // ── S110 Cyberneticist (The Steering Collection) ── Seeds 1091-1100 ──
  { navicue_type_id: 'lab__cyberneticist__error_signal', navicue_type_name: 'The Error Signal', form: 'Circuit', intent: 'Integrate', mechanism: 'Data Neutrality', kbe_layer: 'knowing', magic_signature: 'cyberneticist_error_signal', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Error Signal', _lab_subtitle: 'Cyberneticist \u00d7 Witness Ritual', _lab_signature: 'cyberneticist_error_signal' },
  { navicue_type_id: 'lab__cyberneticist__negative_feedback_loop', navicue_type_name: 'The Negative Feedback Loop', form: 'Circuit', intent: 'Integrate', mechanism: 'System Design', kbe_layer: 'believing', magic_signature: 'cyberneticist_negative_feedback_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Negative Feedback Loop', _lab_subtitle: 'Cyberneticist \u00d7 Science x Soul', _lab_signature: 'cyberneticist_negative_feedback_loop' },
  { navicue_type_id: 'lab__cyberneticist__positive_feedback_loop', navicue_type_name: 'The Positive Feedback Loop', form: 'Circuit', intent: 'Integrate', mechanism: 'Interruption', kbe_layer: 'embodying', magic_signature: 'cyberneticist_positive_feedback_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Positive Feedback Loop', _lab_subtitle: 'Cyberneticist \u00d7 Pattern Glitch', _lab_signature: 'cyberneticist_positive_feedback_loop' },
  { navicue_type_id: 'lab__cyberneticist__lag_time', navicue_type_name: 'The Lag Time', form: 'Circuit', intent: 'Integrate', mechanism: 'Patience', kbe_layer: 'believing', magic_signature: 'cyberneticist_lag_time', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Lag Time', _lab_subtitle: 'Cyberneticist \u00d7 Koan Paradox', _lab_signature: 'cyberneticist_lag_time' },
  { navicue_type_id: 'lab__cyberneticist__gain', navicue_type_name: 'The Gain', form: 'Circuit', intent: 'Integrate', mechanism: 'Regulation', kbe_layer: 'embodying', magic_signature: 'cyberneticist_gain', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gain', _lab_subtitle: 'Cyberneticist \u00d7 Sensory Cinema', _lab_signature: 'cyberneticist_gain' },
  { navicue_type_id: 'lab__cyberneticist__set_point', navicue_type_name: 'The Set Point', form: 'Circuit', intent: 'Integrate', mechanism: 'Standard Setting', kbe_layer: 'knowing', magic_signature: 'cyberneticist_set_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Set Point', _lab_subtitle: 'Cyberneticist \u00d7 Sacred Ordinary', _lab_signature: 'cyberneticist_set_point' },
  { navicue_type_id: 'lab__cyberneticist__feedforward', navicue_type_name: 'The Feedforward', form: 'Circuit', intent: 'Integrate', mechanism: 'Proactivity', kbe_layer: 'believing', magic_signature: 'cyberneticist_feedforward', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Feedforward', _lab_subtitle: 'Cyberneticist \u00d7 Poetic Precision', _lab_signature: 'cyberneticist_feedforward' },
  { navicue_type_id: 'lab__cyberneticist__oscillation', navicue_type_name: 'The Oscillation', form: 'Circuit', intent: 'Integrate', mechanism: 'Fine Motor Control', kbe_layer: 'embodying', magic_signature: 'cyberneticist_oscillation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Oscillation', _lab_subtitle: 'Cyberneticist \u00d7 Witness Ritual', _lab_signature: 'cyberneticist_oscillation' },
  { navicue_type_id: 'lab__cyberneticist__black_box', navicue_type_name: 'The Black Box', form: 'Circuit', intent: 'Integrate', mechanism: 'Input/Output Logic', kbe_layer: 'knowing', magic_signature: 'cyberneticist_black_box', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Black Box', _lab_subtitle: 'Cyberneticist \u00d7 Pattern Glitch', _lab_signature: 'cyberneticist_black_box' },
  { navicue_type_id: 'lab__cyberneticist__navigator_seal', navicue_type_name: 'The Navigator Seal', form: 'Circuit', intent: 'Integrate', mechanism: 'Cybernetics', kbe_layer: 'embodying', magic_signature: 'cyberneticist_navigator_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Navigator Seal', _lab_subtitle: 'Cyberneticist \u00d7 Science x Soul', _lab_signature: 'cyberneticist_navigator_seal' },
  // ── S111 FieldArchitect (The Magnetism Collection) ── Seeds 1101-1110 ──
  { navicue_type_id: 'lab__fieldarchitect__polarity_check', navicue_type_name: 'The Polarity Check', form: 'Stellar', intent: 'Integrate', mechanism: 'Social Calibration', kbe_layer: 'knowing', magic_signature: 'fieldarchitect_polarity_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Polarity Check', _lab_subtitle: 'FieldArchitect \u00d7 Witness Ritual', _lab_signature: 'fieldarchitect_polarity_check' },
  { navicue_type_id: 'lab__fieldarchitect__iron_filings', navicue_type_name: 'The Iron Filings', form: 'Stellar', intent: 'Integrate', mechanism: 'Purpose', kbe_layer: 'believing', magic_signature: 'fieldarchitect_iron_filings', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Iron Filings', _lab_subtitle: 'FieldArchitect \u00d7 Science x Soul', _lab_signature: 'fieldarchitect_iron_filings' },
  { navicue_type_id: 'lab__fieldarchitect__strange_attractor', navicue_type_name: 'The Strange Attractor', form: 'Stellar', intent: 'Integrate', mechanism: 'Stability', kbe_layer: 'embodying', magic_signature: 'fieldarchitect_strange_attractor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Strange Attractor', _lab_subtitle: 'FieldArchitect \u00d7 Pattern Glitch', _lab_signature: 'fieldarchitect_strange_attractor' },
  { navicue_type_id: 'lab__fieldarchitect__shield', navicue_type_name: 'The Shield', form: 'Stellar', intent: 'Integrate', mechanism: 'Boundaries', kbe_layer: 'believing', magic_signature: 'fieldarchitect_shield', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Shield', _lab_subtitle: 'FieldArchitect \u00d7 Koan Paradox', _lab_signature: 'fieldarchitect_shield' },
  { navicue_type_id: 'lab__fieldarchitect__induced_current', navicue_type_name: 'The Induced Current', form: 'Stellar', intent: 'Integrate', mechanism: 'Activation', kbe_layer: 'embodying', magic_signature: 'fieldarchitect_induced_current', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Induced Current', _lab_subtitle: 'FieldArchitect \u00d7 Sensory Cinema', _lab_signature: 'fieldarchitect_induced_current' },
  { navicue_type_id: 'lab__fieldarchitect__compass_needle', navicue_type_name: 'The Compass Needle', form: 'Stellar', intent: 'Integrate', mechanism: 'Values Clarification', kbe_layer: 'knowing', magic_signature: 'fieldarchitect_compass_needle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compass Needle', _lab_subtitle: 'FieldArchitect \u00d7 Sacred Ordinary', _lab_signature: 'fieldarchitect_compass_needle' },
  { navicue_type_id: 'lab__fieldarchitect__electro_magnet', navicue_type_name: 'The Electro-Magnet', form: 'Stellar', intent: 'Integrate', mechanism: 'Role Transition', kbe_layer: 'embodying', magic_signature: 'fieldarchitect_electro_magnet', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Electro-Magnet', _lab_subtitle: 'FieldArchitect \u00d7 Poetic Precision', _lab_signature: 'fieldarchitect_electro_magnet' },
  { navicue_type_id: 'lab__fieldarchitect__voltage_drop', navicue_type_name: 'The Voltage Drop', form: 'Stellar', intent: 'Integrate', mechanism: 'Resource Management', kbe_layer: 'knowing', magic_signature: 'fieldarchitect_voltage_drop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Voltage Drop', _lab_subtitle: 'FieldArchitect \u00d7 Pattern Glitch', _lab_signature: 'fieldarchitect_voltage_drop' },
  { navicue_type_id: 'lab__fieldarchitect__domain', navicue_type_name: 'The Domain', form: 'Stellar', intent: 'Integrate', mechanism: 'Agency', kbe_layer: 'believing', magic_signature: 'fieldarchitect_domain', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Domain', _lab_subtitle: 'FieldArchitect \u00d7 Witness Ritual', _lab_signature: 'fieldarchitect_domain' },
  { navicue_type_id: 'lab__fieldarchitect__field_seal', navicue_type_name: 'The Field Seal', form: 'Stellar', intent: 'Integrate', mechanism: 'Social Field Theory', kbe_layer: 'embodying', magic_signature: 'fieldarchitect_field_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Field Seal', _lab_subtitle: 'FieldArchitect \u00d7 Science x Soul', _lab_signature: 'fieldarchitect_field_seal' },
  // ── S112 Kineticist (The Momentum Collection) ── Seeds 1111-1120 ──
  { navicue_type_id: 'lab__kineticist__inertia_breaker', navicue_type_name: 'The Inertia Breaker', form: 'Storm', intent: 'Integrate', mechanism: 'Persistence', kbe_layer: 'embodying', magic_signature: 'kineticist_inertia_breaker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inertia Breaker', _lab_subtitle: 'Kineticist \u00d7 Witness Ritual', _lab_signature: 'kineticist_inertia_breaker' },
  { navicue_type_id: 'lab__kineticist__gravity_assist', navicue_type_name: 'The Gravity Assist', form: 'Storm', intent: 'Integrate', mechanism: 'Reframing Stress', kbe_layer: 'knowing', magic_signature: 'kineticist_gravity_assist', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gravity Assist', _lab_subtitle: 'Kineticist \u00d7 Science x Soul', _lab_signature: 'kineticist_gravity_assist' },
  { navicue_type_id: 'lab__kineticist__elastic_collision', navicue_type_name: 'The Elastic Collision', form: 'Storm', intent: 'Integrate', mechanism: 'Resilience', kbe_layer: 'believing', magic_signature: 'kineticist_elastic_collision', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Elastic Collision', _lab_subtitle: 'Kineticist \u00d7 Pattern Glitch', _lab_signature: 'kineticist_elastic_collision' },
  { navicue_type_id: 'lab__kineticist__terminal_velocity', navicue_type_name: 'The Terminal Velocity', form: 'Storm', intent: 'Integrate', mechanism: 'Acceptance', kbe_layer: 'believing', magic_signature: 'kineticist_terminal_velocity', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Terminal Velocity', _lab_subtitle: 'Kineticist \u00d7 Koan Paradox', _lab_signature: 'kineticist_terminal_velocity' },
  { navicue_type_id: 'lab__kineticist__rocket_equation', navicue_type_name: 'The Rocket Equation', form: 'Storm', intent: 'Integrate', mechanism: 'Subtraction', kbe_layer: 'knowing', magic_signature: 'kineticist_rocket_equation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rocket Equation', _lab_subtitle: 'Kineticist \u00d7 Sacred Ordinary', _lab_signature: 'kineticist_rocket_equation' },
  { navicue_type_id: 'lab__kineticist__orbit', navicue_type_name: 'The Orbit', form: 'Storm', intent: 'Integrate', mechanism: 'Rhythm', kbe_layer: 'embodying', magic_signature: 'kineticist_orbit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Orbit', _lab_subtitle: 'Kineticist \u00d7 Sensory Cinema', _lab_signature: 'kineticist_orbit' },
  { navicue_type_id: 'lab__kineticist__vector_addition', navicue_type_name: 'The Vector Addition', form: 'Storm', intent: 'Integrate', mechanism: 'Strategic Adjustment', kbe_layer: 'knowing', magic_signature: 'kineticist_vector_addition', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vector Addition', _lab_subtitle: 'Kineticist \u00d7 Poetic Precision', _lab_signature: 'kineticist_vector_addition' },
  { navicue_type_id: 'lab__kineticist__momentum_save', navicue_type_name: 'The Momentum Save', form: 'Storm', intent: 'Integrate', mechanism: 'Micro-Correction', kbe_layer: 'embodying', magic_signature: 'kineticist_momentum_save', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Momentum Save', _lab_subtitle: 'Kineticist \u00d7 Witness Ritual', _lab_signature: 'kineticist_momentum_save' },
  { navicue_type_id: 'lab__kineticist__impact_zone', navicue_type_name: 'The Impact Zone', form: 'Storm', intent: 'Integrate', mechanism: 'Decisiveness', kbe_layer: 'believing', magic_signature: 'kineticist_impact_zone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Impact Zone', _lab_subtitle: 'Kineticist \u00d7 Pattern Glitch', _lab_signature: 'kineticist_impact_zone' },
  { navicue_type_id: 'lab__kineticist__kinetic_seal', navicue_type_name: 'The Kinetic Seal', form: 'Storm', intent: 'Integrate', mechanism: 'Momentum Conservation', kbe_layer: 'embodying', magic_signature: 'kineticist_kinetic_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Kinetic Seal', _lab_subtitle: 'Kineticist \u00d7 Science x Soul', _lab_signature: 'kineticist_kinetic_seal' },
  // ── S113 Crystal (The Clarity Collection) ── Seeds 1121-1130 ──
  { navicue_type_id: 'lab__crystal__lattice', navicue_type_name: 'The Lattice', form: 'Glacier', intent: 'Integrate', mechanism: 'Structural Organization', kbe_layer: 'knowing', magic_signature: 'crystal_lattice', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lattice', _lab_subtitle: 'Crystal \u00d7 Witness Ritual', _lab_signature: 'crystal_lattice' },
  { navicue_type_id: 'lab__crystal__piezoelectric_spark', navicue_type_name: 'The Piezoelectric Spark', form: 'Glacier', intent: 'Integrate', mechanism: 'Stress Utilization', kbe_layer: 'believing', magic_signature: 'crystal_piezoelectric_spark', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Piezoelectric Spark', _lab_subtitle: 'Crystal \u00d7 Science x Soul', _lab_signature: 'crystal_piezoelectric_spark' },
  { navicue_type_id: 'lab__crystal__facet_cut', navicue_type_name: 'The Facet Cut', form: 'Glacier', intent: 'Integrate', mechanism: 'Endurance', kbe_layer: 'embodying', magic_signature: 'crystal_facet_cut', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Facet Cut', _lab_subtitle: 'Crystal \u00d7 Sensory Cinema', _lab_signature: 'crystal_facet_cut' },
  { navicue_type_id: 'lab__crystal__inclusion', navicue_type_name: 'The Inclusion', form: 'Glacier', intent: 'Integrate', mechanism: 'Self-Acceptance', kbe_layer: 'believing', magic_signature: 'crystal_inclusion', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Inclusion', _lab_subtitle: 'Crystal \u00d7 Koan Paradox', _lab_signature: 'crystal_inclusion' },
  { navicue_type_id: 'lab__crystal__resonant_frequency', navicue_type_name: 'The Resonant Frequency', form: 'Glacier', intent: 'Integrate', mechanism: 'Vocal Alignment', kbe_layer: 'embodying', magic_signature: 'crystal_resonant_frequency', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Resonant Frequency', _lab_subtitle: 'Crystal \u00d7 Sacred Ordinary', _lab_signature: 'crystal_resonant_frequency' },
  { navicue_type_id: 'lab__crystal__annealing', navicue_type_name: 'The Annealing', form: 'Glacier', intent: 'Integrate', mechanism: 'Trauma Processing', kbe_layer: 'knowing', magic_signature: 'crystal_annealing', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Annealing', _lab_subtitle: 'Crystal \u00d7 Pattern Glitch', _lab_signature: 'crystal_annealing' },
  { navicue_type_id: 'lab__crystal__transparency', navicue_type_name: 'The Transparency', form: 'Glacier', intent: 'Integrate', mechanism: 'Honesty', kbe_layer: 'believing', magic_signature: 'crystal_transparency', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Transparency', _lab_subtitle: 'Crystal \u00d7 Witness Ritual', _lab_signature: 'crystal_transparency' },
  { navicue_type_id: 'lab__crystal__nucleation_point', navicue_type_name: 'The Nucleation Point', form: 'Glacier', intent: 'Integrate', mechanism: 'Catalytic Action', kbe_layer: 'knowing', magic_signature: 'crystal_nucleation_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Nucleation Point', _lab_subtitle: 'Crystal \u00d7 Science x Soul', _lab_signature: 'crystal_nucleation_point' },
  { navicue_type_id: 'lab__crystal__prism_refraction', navicue_type_name: 'The Prism Refraction', form: 'Glacier', intent: 'Integrate', mechanism: 'Emotional Wholeness', kbe_layer: 'believing', magic_signature: 'crystal_prism_refraction', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Prism Refraction', _lab_subtitle: 'Crystal \u00d7 Poetic Precision', _lab_signature: 'crystal_prism_refraction' },
  { navicue_type_id: 'lab__crystal__crystal_seal', navicue_type_name: 'The Crystal Seal', form: 'Glacier', intent: 'Integrate', mechanism: 'Crystallography', kbe_layer: 'embodying', magic_signature: 'crystal_crystal_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Crystal Seal', _lab_subtitle: 'Crystal \u00d7 Science x Soul', _lab_signature: 'crystal_crystal_seal' },
  // ── S114 Hydrodynamicist (The Flow Collection) ── Seeds 1131-1140 ──
  { navicue_type_id: 'lab__hydrodynamicist__laminar_flow', navicue_type_name: 'The Laminar Flow', form: 'Tide', intent: 'Integrate', mechanism: 'Smoothness', kbe_layer: 'embodying', magic_signature: 'hydrodynamicist_laminar_flow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Laminar Flow', _lab_subtitle: 'Hydrodynamicist \u00d7 Sensory Cinema', _lab_signature: 'hydrodynamicist_laminar_flow' },
  { navicue_type_id: 'lab__hydrodynamicist__buoyancy_check', navicue_type_name: 'The Buoyancy Check', form: 'Tide', intent: 'Integrate', mechanism: 'Release', kbe_layer: 'believing', magic_signature: 'hydrodynamicist_buoyancy_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Buoyancy Check', _lab_subtitle: 'Hydrodynamicist \u00d7 Koan Paradox', _lab_signature: 'hydrodynamicist_buoyancy_check' },
  { navicue_type_id: 'lab__hydrodynamicist__path_of_least_resistance', navicue_type_name: 'The Path of Least Resistance', form: 'Tide', intent: 'Integrate', mechanism: 'Adaptability', kbe_layer: 'knowing', magic_signature: 'hydrodynamicist_path_of_least_resistance', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Path of Least Resistance', _lab_subtitle: 'Hydrodynamicist \u00d7 Poetic Precision', _lab_signature: 'hydrodynamicist_path_of_least_resistance' },
  { navicue_type_id: 'lab__hydrodynamicist__erosion', navicue_type_name: 'The Erosion', form: 'Tide', intent: 'Integrate', mechanism: 'Consistency', kbe_layer: 'believing', magic_signature: 'hydrodynamicist_erosion', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Erosion', _lab_subtitle: 'Hydrodynamicist \u00d7 Witness Ritual', _lab_signature: 'hydrodynamicist_erosion' },
  { navicue_type_id: 'lab__hydrodynamicist__hydraulic_press', navicue_type_name: 'The Hydraulic Press', form: 'Tide', intent: 'Integrate', mechanism: 'Leverage', kbe_layer: 'knowing', magic_signature: 'hydrodynamicist_hydraulic_press', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Hydraulic Press', _lab_subtitle: 'Hydrodynamicist \u00d7 Science x Soul', _lab_signature: 'hydrodynamicist_hydraulic_press' },
  { navicue_type_id: 'lab__hydrodynamicist__vortex', navicue_type_name: 'The Vortex', form: 'Tide', intent: 'Integrate', mechanism: 'Centering', kbe_layer: 'embodying', magic_signature: 'hydrodynamicist_vortex', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Vortex', _lab_subtitle: 'Hydrodynamicist \u00d7 Sacred Ordinary', _lab_signature: 'hydrodynamicist_vortex' },
  { navicue_type_id: 'lab__hydrodynamicist__surface_tension', navicue_type_name: 'The Surface Tension', form: 'Tide', intent: 'Integrate', mechanism: 'Vulnerability', kbe_layer: 'believing', magic_signature: 'hydrodynamicist_surface_tension', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Surface Tension', _lab_subtitle: 'Hydrodynamicist \u00d7 Pattern Glitch', _lab_signature: 'hydrodynamicist_surface_tension' },
  { navicue_type_id: 'lab__hydrodynamicist__phase_transition', navicue_type_name: 'The Phase Transition', form: 'Tide', intent: 'Integrate', mechanism: 'State Shift', kbe_layer: 'embodying', magic_signature: 'hydrodynamicist_phase_transition', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phase Transition', _lab_subtitle: 'Hydrodynamicist \u00d7 Witness Ritual', _lab_signature: 'hydrodynamicist_phase_transition' },
  { navicue_type_id: 'lab__hydrodynamicist__ocean_depth', navicue_type_name: 'The Ocean Depth', form: 'Tide', intent: 'Integrate', mechanism: 'Depth', kbe_layer: 'embodying', magic_signature: 'hydrodynamicist_ocean_depth', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Ocean Depth', _lab_subtitle: 'Hydrodynamicist \u00d7 Sensory Cinema', _lab_signature: 'hydrodynamicist_ocean_depth' },
  { navicue_type_id: 'lab__hydrodynamicist__hydro_seal', navicue_type_name: 'The Hydro Seal', form: 'Tide', intent: 'Integrate', mechanism: 'Fluid Mechanics', kbe_layer: 'embodying', magic_signature: 'hydrodynamicist_hydro_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Hydro Seal', _lab_subtitle: 'Hydrodynamicist \u00d7 Science x Soul', _lab_signature: 'hydrodynamicist_hydro_seal' },
  // ── S115 Aviator (The Lift Collection) ── Seeds 1141-1150 ──
  { navicue_type_id: 'lab__aviator__drag_check', navicue_type_name: 'The Drag Check', form: 'Drift', intent: 'Integrate', mechanism: 'Subtraction', kbe_layer: 'knowing', magic_signature: 'aviator_drag_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Drag Check', _lab_subtitle: 'Aviator \u00d7 Pattern Glitch', _lab_signature: 'aviator_drag_check' },
  { navicue_type_id: 'lab__aviator__angle_of_attack', navicue_type_name: 'The Angle of Attack', form: 'Drift', intent: 'Integrate', mechanism: 'Humility', kbe_layer: 'believing', magic_signature: 'aviator_angle_of_attack', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Angle of Attack', _lab_subtitle: 'Aviator \u00d7 Science x Soul', _lab_signature: 'aviator_angle_of_attack' },
  { navicue_type_id: 'lab__aviator__thrust_to_weight_ratio', navicue_type_name: 'The Thrust-to-Weight Ratio', form: 'Drift', intent: 'Integrate', mechanism: 'Prioritization', kbe_layer: 'knowing', magic_signature: 'aviator_thrust_to_weight_ratio', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Thrust-to-Weight Ratio', _lab_subtitle: 'Aviator \u00d7 Koan Paradox', _lab_signature: 'aviator_thrust_to_weight_ratio' },
  { navicue_type_id: 'lab__aviator__coffin_corner', navicue_type_name: 'The Coffin Corner', form: 'Drift', intent: 'Integrate', mechanism: 'Grounding', kbe_layer: 'believing', magic_signature: 'aviator_coffin_corner', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Coffin Corner', _lab_subtitle: 'Aviator \u00d7 Witness Ritual', _lab_signature: 'aviator_coffin_corner' },
  { navicue_type_id: 'lab__aviator__headwind', navicue_type_name: 'The Headwind', form: 'Drift', intent: 'Integrate', mechanism: 'Strategic Alignment', kbe_layer: 'knowing', magic_signature: 'aviator_headwind', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Headwind', _lab_subtitle: 'Aviator \u00d7 Poetic Precision', _lab_signature: 'aviator_headwind' },
  { navicue_type_id: 'lab__aviator__trim_tab', navicue_type_name: 'The Trim Tab', form: 'Drift', intent: 'Integrate', mechanism: 'Ease', kbe_layer: 'embodying', magic_signature: 'aviator_trim_tab', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Trim Tab', _lab_subtitle: 'Aviator \u00d7 Sensory Cinema', _lab_signature: 'aviator_trim_tab' },
  { navicue_type_id: 'lab__aviator__center_of_gravity', navicue_type_name: 'The Center of Gravity', form: 'Drift', intent: 'Integrate', mechanism: 'Temporal Focus', kbe_layer: 'knowing', magic_signature: 'aviator_center_of_gravity', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Center of Gravity', _lab_subtitle: 'Aviator \u00d7 Sacred Ordinary', _lab_signature: 'aviator_center_of_gravity' },
  { navicue_type_id: 'lab__aviator__ground_effect', navicue_type_name: 'The Ground Effect', form: 'Drift', intent: 'Integrate', mechanism: 'Resource Conservation', kbe_layer: 'embodying', magic_signature: 'aviator_ground_effect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ground Effect', _lab_subtitle: 'Aviator \u00d7 Witness Ritual', _lab_signature: 'aviator_ground_effect' },
  { navicue_type_id: 'lab__aviator__feathered_prop', navicue_type_name: 'The Feathered Prop', form: 'Drift', intent: 'Integrate', mechanism: 'Damage Control', kbe_layer: 'believing', magic_signature: 'aviator_feathered_prop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Feathered Prop', _lab_subtitle: 'Aviator \u00d7 Science x Soul', _lab_signature: 'aviator_feathered_prop' },
  { navicue_type_id: 'lab__aviator__aviator_seal', navicue_type_name: 'The Aviator Seal', form: 'Drift', intent: 'Integrate', mechanism: "Bernoulli's Principle", kbe_layer: 'embodying', magic_signature: 'aviator_aviator_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Aviator Seal', _lab_subtitle: 'Aviator \u00d7 Science x Soul', _lab_signature: 'aviator_aviator_seal' },
  // ── S116 Tensegrity (The Structure Collection) ── Seeds 1151-1160 ──
  { navicue_type_id: 'lab__tensegrity__floating_compression', navicue_type_name: 'The Floating Compression', form: 'Lattice', intent: 'Integrate', mechanism: 'Systemic Resilience', kbe_layer: 'knowing', magic_signature: 'tensegrity_floating_compression', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Floating Compression', _lab_subtitle: 'Tensegrity \u00d7 Science x Soul', _lab_signature: 'tensegrity_floating_compression' },
  { navicue_type_id: 'lab__tensegrity__pre_stress', navicue_type_name: 'The Pre-Stress', form: 'Lattice', intent: 'Integrate', mechanism: 'Activation', kbe_layer: 'embodying', magic_signature: 'tensegrity_pre_stress', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pre-Stress', _lab_subtitle: 'Tensegrity \u00d7 Sensory Cinema', _lab_signature: 'tensegrity_pre_stress' },
  { navicue_type_id: 'lab__tensegrity__load_distribution', navicue_type_name: 'The Load Distribution', form: 'Lattice', intent: 'Integrate', mechanism: 'Social Support', kbe_layer: 'believing', magic_signature: 'tensegrity_load_distribution', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Load Distribution', _lab_subtitle: 'Tensegrity \u00d7 Sacred Ordinary', _lab_signature: 'tensegrity_load_distribution' },
  { navicue_type_id: 'lab__tensegrity__omni_directional', navicue_type_name: 'The Omni-Directional', form: 'Lattice', intent: 'Integrate', mechanism: 'Antifragility', kbe_layer: 'knowing', magic_signature: 'tensegrity_omni_directional', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Omni-Directional', _lab_subtitle: 'Tensegrity \u00d7 Koan Paradox', _lab_signature: 'tensegrity_omni_directional' },
  { navicue_type_id: 'lab__tensegrity__fascial_release', navicue_type_name: 'The Fascial Release', form: 'Lattice', intent: 'Integrate', mechanism: 'Somatic Release', kbe_layer: 'embodying', magic_signature: 'tensegrity_fascial_release', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fascial Release', _lab_subtitle: 'Tensegrity \u00d7 Witness Ritual', _lab_signature: 'tensegrity_fascial_release' },
  { navicue_type_id: 'lab__tensegrity__space_frame', navicue_type_name: 'The Space Frame', form: 'Lattice', intent: 'Integrate', mechanism: 'Efficiency', kbe_layer: 'knowing', magic_signature: 'tensegrity_space_frame', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Space Frame', _lab_subtitle: 'Tensegrity \u00d7 Poetic Precision', _lab_signature: 'tensegrity_space_frame' },
  { navicue_type_id: 'lab__tensegrity__dynamic_equilibrium', navicue_type_name: 'The Dynamic Equilibrium', form: 'Lattice', intent: 'Integrate', mechanism: 'Oscillation', kbe_layer: 'embodying', magic_signature: 'tensegrity_dynamic_equilibrium', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dynamic Equilibrium', _lab_subtitle: 'Tensegrity \u00d7 Pattern Glitch', _lab_signature: 'tensegrity_dynamic_equilibrium' },
  { navicue_type_id: 'lab__tensegrity__yield_point', navicue_type_name: 'The Yield Point', form: 'Lattice', intent: 'Integrate', mechanism: 'Boundaries', kbe_layer: 'believing', magic_signature: 'tensegrity_yield_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Yield Point', _lab_subtitle: 'Tensegrity \u00d7 Science x Soul', _lab_signature: 'tensegrity_yield_point' },
  { navicue_type_id: 'lab__tensegrity__network_node', navicue_type_name: 'The Network Node', form: 'Lattice', intent: 'Integrate', mechanism: 'Diversification', kbe_layer: 'knowing', magic_signature: 'tensegrity_network_node', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Network Node', _lab_subtitle: 'Tensegrity \u00d7 Sacred Ordinary', _lab_signature: 'tensegrity_network_node' },
  { navicue_type_id: 'lab__tensegrity__tensegrity_seal', navicue_type_name: 'The Tensegrity Seal', form: 'Lattice', intent: 'Integrate', mechanism: 'Biotensegrity', kbe_layer: 'embodying', magic_signature: 'tensegrity_tensegrity_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Tensegrity Seal', _lab_subtitle: 'Tensegrity \u00d7 Science x Soul', _lab_signature: 'tensegrity_tensegrity_seal' },
  // ── S117 Wayfinder (The Navigation Collection) ── Seeds 1161-1170 ──
  { navicue_type_id: 'lab__wayfinder__dead_reckoning', navicue_type_name: 'The Dead Reckoning', form: 'Compass', intent: 'Integrate', mechanism: 'Self-Trust', kbe_layer: 'believing', magic_signature: 'wayfinder_dead_reckoning', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dead Reckoning', _lab_subtitle: 'Wayfinder \u00d7 Sacred Ordinary', _lab_signature: 'wayfinder_dead_reckoning' },
  { navicue_type_id: 'lab__wayfinder__swell_read', navicue_type_name: 'The Swell Read', form: 'Compass', intent: 'Integrate', mechanism: 'Somatic Sensing', kbe_layer: 'embodying', magic_signature: 'wayfinder_swell_read', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Swell Read', _lab_subtitle: 'Wayfinder \u00d7 Sensory Cinema', _lab_signature: 'wayfinder_swell_read' },
  { navicue_type_id: 'lab__wayfinder__zenith_star', navicue_type_name: 'The Zenith Star', form: 'Compass', intent: 'Integrate', mechanism: 'North Star', kbe_layer: 'knowing', magic_signature: 'wayfinder_zenith_star', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Zenith Star', _lab_subtitle: 'Wayfinder \u00d7 Koan Paradox', _lab_signature: 'wayfinder_zenith_star' },
  { navicue_type_id: 'lab__wayfinder__bird_sign', navicue_type_name: 'The Bird Sign', form: 'Compass', intent: 'Integrate', mechanism: 'Sign Detection', kbe_layer: 'believing', magic_signature: 'wayfinder_bird_sign', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Bird Sign', _lab_subtitle: 'Wayfinder \u00d7 Witness Ritual', _lab_signature: 'wayfinder_bird_sign' },
  { navicue_type_id: 'lab__wayfinder__cloud_stack', navicue_type_name: 'The Cloud Stack', form: 'Compass', intent: 'Integrate', mechanism: 'Pattern Recognition', kbe_layer: 'knowing', magic_signature: 'wayfinder_cloud_stack', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cloud Stack', _lab_subtitle: 'Wayfinder \u00d7 Pattern Glitch', _lab_signature: 'wayfinder_cloud_stack' },
  { navicue_type_id: 'lab__wayfinder__etak', navicue_type_name: 'The Etak', form: 'Compass', intent: 'Integrate', mechanism: 'Triangulation', kbe_layer: 'knowing', magic_signature: 'wayfinder_etak', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Etak', _lab_subtitle: 'Wayfinder \u00d7 Science x Soul', _lab_signature: 'wayfinder_etak' },
  { navicue_type_id: 'lab__wayfinder__phosphorescence', navicue_type_name: 'The Phosphorescence', form: 'Compass', intent: 'Integrate', mechanism: 'Activation', kbe_layer: 'embodying', magic_signature: 'wayfinder_phosphorescence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phosphorescence', _lab_subtitle: 'Wayfinder \u00d7 Sensory Cinema', _lab_signature: 'wayfinder_phosphorescence' },
  { navicue_type_id: 'lab__wayfinder__storm_drift', navicue_type_name: 'The Storm Drift', form: 'Compass', intent: 'Integrate', mechanism: 'Adaptability', kbe_layer: 'believing', magic_signature: 'wayfinder_storm_drift', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Storm Drift', _lab_subtitle: 'Wayfinder \u00d7 Sacred Ordinary', _lab_signature: 'wayfinder_storm_drift' },
  { navicue_type_id: 'lab__wayfinder__land_scent', navicue_type_name: 'The Land Scent', form: 'Compass', intent: 'Integrate', mechanism: 'Intuition', kbe_layer: 'embodying', magic_signature: 'wayfinder_land_scent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Land Scent', _lab_subtitle: 'Wayfinder \u00d7 Witness Ritual', _lab_signature: 'wayfinder_land_scent' },
  { navicue_type_id: 'lab__wayfinder__wayfinder_seal', navicue_type_name: 'The Wayfinder Seal', form: 'Compass', intent: 'Integrate', mechanism: 'Cognitive Mapping', kbe_layer: 'knowing', magic_signature: 'wayfinder_wayfinder_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Wayfinder Seal', _lab_subtitle: 'Wayfinder \u00d7 Science x Soul', _lab_signature: 'wayfinder_wayfinder_seal' },
  // ── S118 Receiver (The Signal Collection) ── Seeds 1171-1180 ──
  { navicue_type_id: 'lab__receiver__signal_to_noise_ratio', navicue_type_name: 'The Signal-to-Noise Ratio', form: 'Pulse', intent: 'Integrate', mechanism: 'Selective Attention', kbe_layer: 'knowing', magic_signature: 'receiver_signal_to_noise_ratio', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Signal-to-Noise Ratio', _lab_subtitle: 'Receiver \u00d7 Science x Soul', _lab_signature: 'receiver_signal_to_noise_ratio' },
  { navicue_type_id: 'lab__receiver__frequency_scan', navicue_type_name: 'The Frequency Scan', form: 'Pulse', intent: 'Integrate', mechanism: 'Patience', kbe_layer: 'embodying', magic_signature: 'receiver_frequency_scan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Frequency Scan', _lab_subtitle: 'Receiver \u00d7 Sensory Cinema', _lab_signature: 'receiver_frequency_scan' },
  { navicue_type_id: 'lab__receiver__squelch', navicue_type_name: 'The Squelch', form: 'Pulse', intent: 'Integrate', mechanism: 'Boundaries', kbe_layer: 'believing', magic_signature: 'receiver_squelch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Squelch', _lab_subtitle: 'Receiver \u00d7 Sacred Ordinary', _lab_signature: 'receiver_squelch' },
  { navicue_type_id: 'lab__receiver__antenna_gain', navicue_type_name: 'The Antenna Gain', form: 'Pulse', intent: 'Integrate', mechanism: 'State Elevation', kbe_layer: 'embodying', magic_signature: 'receiver_antenna_gain', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Antenna Gain', _lab_subtitle: 'Receiver \u00d7 Witness Ritual', _lab_signature: 'receiver_antenna_gain' },
  { navicue_type_id: 'lab__receiver__modulation', navicue_type_name: 'The Modulation', form: 'Pulse', intent: 'Integrate', mechanism: 'Modality Shift', kbe_layer: 'knowing', magic_signature: 'receiver_modulation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Modulation', _lab_subtitle: 'Receiver \u00d7 Koan Paradox', _lab_signature: 'receiver_modulation' },
  { navicue_type_id: 'lab__receiver__interference_pattern', navicue_type_name: 'The Interference Pattern', form: 'Pulse', intent: 'Integrate', mechanism: 'Differentiation', kbe_layer: 'knowing', magic_signature: 'receiver_interference_pattern', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Interference Pattern', _lab_subtitle: 'Receiver \u00d7 Pattern Glitch', _lab_signature: 'receiver_interference_pattern' },
  { navicue_type_id: 'lab__receiver__feedback_loop', navicue_type_name: 'The Feedback Loop', form: 'Pulse', intent: 'Integrate', mechanism: 'Interruption', kbe_layer: 'embodying', magic_signature: 'receiver_feedback_loop', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Feedback Loop', _lab_subtitle: 'Receiver \u00d7 Sensory Cinema', _lab_signature: 'receiver_feedback_loop' },
  { navicue_type_id: 'lab__receiver__encryption', navicue_type_name: 'The Encryption', form: 'Pulse', intent: 'Integrate', mechanism: 'Empathy', kbe_layer: 'believing', magic_signature: 'receiver_encryption', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Encryption', _lab_subtitle: 'Receiver \u00d7 Sacred Ordinary', _lab_signature: 'receiver_encryption' },
  { navicue_type_id: 'lab__receiver__broadcast_power', navicue_type_name: 'The Broadcast Power', form: 'Pulse', intent: 'Integrate', mechanism: 'Voice Projection', kbe_layer: 'embodying', magic_signature: 'receiver_broadcast_power', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Broadcast Power', _lab_subtitle: 'Receiver \u00d7 Witness Ritual', _lab_signature: 'receiver_broadcast_power' },
  { navicue_type_id: 'lab__receiver__receiver_seal', navicue_type_name: 'The Receiver Seal', form: 'Pulse', intent: 'Integrate', mechanism: 'Stochastic Resonance', kbe_layer: 'knowing', magic_signature: 'receiver_receiver_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Receiver Seal', _lab_subtitle: 'Receiver \u00d7 Science x Soul', _lab_signature: 'receiver_receiver_seal' },
  // ── S119 Vector (The Directional Force Collection) ── Seeds 1181-1190 ──
  { navicue_type_id: 'lab__vector__scalar_vs_vector', navicue_type_name: 'The Scalar vs. Vector', form: 'Drift', intent: 'Integrate', mechanism: 'Differentiation', kbe_layer: 'knowing', magic_signature: 'vector_scalar_vs_vector', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Scalar vs. Vector', _lab_subtitle: 'Vector \u00d7 Science x Soul', _lab_signature: 'vector_scalar_vs_vector' },
  { navicue_type_id: 'lab__vector__resultant_force', navicue_type_name: 'The Resultant Force', form: 'Drift', intent: 'Integrate', mechanism: 'Self-Sabotage Removal', kbe_layer: 'believing', magic_signature: 'vector_resultant_force', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Resultant Force', _lab_subtitle: 'Vector \u00d7 Sacred Ordinary', _lab_signature: 'vector_resultant_force' },
  { navicue_type_id: 'lab__vector__unit_vector', navicue_type_name: 'The Unit Vector', form: 'Drift', intent: 'Integrate', mechanism: 'Micro-Step', kbe_layer: 'embodying', magic_signature: 'vector_unit_vector', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Unit Vector', _lab_subtitle: 'Vector \u00d7 Witness Ritual', _lab_signature: 'vector_unit_vector' },
  { navicue_type_id: 'lab__vector__cross_product', navicue_type_name: 'The Cross Product', form: 'Drift', intent: 'Integrate', mechanism: 'Leverage', kbe_layer: 'knowing', magic_signature: 'vector_cross_product', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cross Product', _lab_subtitle: 'Vector \u00d7 Pattern Glitch', _lab_signature: 'vector_cross_product' },
  { navicue_type_id: 'lab__vector__dot_product', navicue_type_name: 'The Dot Product', form: 'Drift', intent: 'Integrate', mechanism: 'Alignment', kbe_layer: 'believing', magic_signature: 'vector_dot_product', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dot Product', _lab_subtitle: 'Vector \u00d7 Koan Paradox', _lab_signature: 'vector_dot_product' },
  { navicue_type_id: 'lab__vector__null_vector', navicue_type_name: 'The Null Vector', form: 'Drift', intent: 'Integrate', mechanism: 'Centering', kbe_layer: 'embodying', magic_signature: 'vector_null_vector', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Null Vector', _lab_subtitle: 'Vector \u00d7 Sensory Cinema', _lab_signature: 'vector_null_vector' },
  { navicue_type_id: 'lab__vector__acceleration_vector', navicue_type_name: 'The Acceleration Vector', form: 'Drift', intent: 'Integrate', mechanism: 'Discomfort Tolerance', kbe_layer: 'embodying', magic_signature: 'vector_acceleration_vector', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Acceleration Vector', _lab_subtitle: 'Vector \u00d7 Sensory Cinema', _lab_signature: 'vector_acceleration_vector' },
  { navicue_type_id: 'lab__vector__decomposition', navicue_type_name: 'The Decomposition', form: 'Drift', intent: 'Integrate', mechanism: 'Deconstruction', kbe_layer: 'knowing', magic_signature: 'vector_decomposition', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Decomposition', _lab_subtitle: 'Vector \u00d7 Science x Soul', _lab_signature: 'vector_decomposition' },
  { navicue_type_id: 'lab__vector__field_line', navicue_type_name: 'The Field Line', form: 'Drift', intent: 'Integrate', mechanism: 'Intuition', kbe_layer: 'believing', magic_signature: 'vector_field_line', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Field Line', _lab_subtitle: 'Vector \u00d7 Witness Ritual', _lab_signature: 'vector_field_line' },
  { navicue_type_id: 'lab__vector__vector_seal', navicue_type_name: 'The Vector Seal', form: 'Drift', intent: 'Integrate', mechanism: 'Vector Addition', kbe_layer: 'knowing', magic_signature: 'vector_vector_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Vector Seal', _lab_subtitle: 'Vector \u00d7 Science x Soul', _lab_signature: 'vector_vector_seal' },
  // ── S120 Tuning (The Harmonic Collection) ── Seeds 1191-1200 ──
  { navicue_type_id: 'lab__tuning__tension_check', navicue_type_name: 'The Tension Check', form: 'Echo', intent: 'Integrate', mechanism: 'Regulation', kbe_layer: 'embodying', magic_signature: 'tuning_tension_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tension Check', _lab_subtitle: 'Tuning \u00d7 Sensory Cinema', _lab_signature: 'tuning_tension_check' },
  { navicue_type_id: 'lab__tuning__dissonance_resolve', navicue_type_name: 'The Dissonance Resolve', form: 'Echo', intent: 'Integrate', mechanism: 'Conflict Resolution', kbe_layer: 'believing', magic_signature: 'tuning_dissonance_resolve', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dissonance Resolve', _lab_subtitle: 'Tuning \u00d7 Sacred Ordinary', _lab_signature: 'tuning_dissonance_resolve' },
  { navicue_type_id: 'lab__tuning__fundamental_frequency', navicue_type_name: 'The Fundamental Frequency', form: 'Echo', intent: 'Integrate', mechanism: 'Core Values', kbe_layer: 'knowing', magic_signature: 'tuning_fundamental_frequency', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fundamental Frequency', _lab_subtitle: 'Tuning \u00d7 Science x Soul', _lab_signature: 'tuning_fundamental_frequency' },
  { navicue_type_id: 'lab__tuning__sympathetic_vibration', navicue_type_name: 'The Sympathetic Vibration', form: 'Echo', intent: 'Integrate', mechanism: 'Vocal Resonance', kbe_layer: 'embodying', magic_signature: 'tuning_sympathetic_vibration', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sympathetic Vibration', _lab_subtitle: 'Tuning \u00d7 Witness Ritual', _lab_signature: 'tuning_sympathetic_vibration' },
  { navicue_type_id: 'lab__tuning__beat_frequency', navicue_type_name: 'The Beat Frequency', form: 'Echo', intent: 'Integrate', mechanism: 'Fine Tuning', kbe_layer: 'embodying', magic_signature: 'tuning_beat_frequency', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Beat Frequency', _lab_subtitle: 'Tuning \u00d7 Pattern Glitch', _lab_signature: 'tuning_beat_frequency' },
  { navicue_type_id: 'lab__tuning__overtone_series', navicue_type_name: 'The Overtone Series', form: 'Echo', intent: 'Integrate', mechanism: 'Depth', kbe_layer: 'knowing', magic_signature: 'tuning_overtone_series', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Overtone Series', _lab_subtitle: 'Tuning \u00d7 Koan Paradox', _lab_signature: 'tuning_overtone_series' },
  { navicue_type_id: 'lab__tuning__dead_spot', navicue_type_name: 'The Dead Spot', form: 'Echo', intent: 'Integrate', mechanism: 'Refuge', kbe_layer: 'embodying', magic_signature: 'tuning_dead_spot', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Dead Spot', _lab_subtitle: 'Tuning \u00d7 Sensory Cinema', _lab_signature: 'tuning_dead_spot' },
  { navicue_type_id: 'lab__tuning__amplifier', navicue_type_name: 'The Amplifier', form: 'Echo', intent: 'Integrate', mechanism: 'Modulation', kbe_layer: 'knowing', magic_signature: 'tuning_amplifier', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Amplifier', _lab_subtitle: 'Tuning \u00d7 Science x Soul', _lab_signature: 'tuning_amplifier' },
  { navicue_type_id: 'lab__tuning__fade_out', navicue_type_name: 'The Fade Out', form: 'Echo', intent: 'Integrate', mechanism: 'Closure', kbe_layer: 'embodying', magic_signature: 'tuning_fade_out', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fade Out', _lab_subtitle: 'Tuning \u00d7 Witness Ritual', _lab_signature: 'tuning_fade_out' },
  { navicue_type_id: 'lab__tuning__harmonic_seal', navicue_type_name: 'The Harmonic Seal', form: 'Echo', intent: 'Integrate', mechanism: 'Entrainment', kbe_layer: 'knowing', magic_signature: 'tuning_harmonic_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Harmonic Seal', _lab_subtitle: 'Tuning \u00d7 Science x Soul', _lab_signature: 'tuning_harmonic_seal' },
  // ═══════════════════════════════════════════════════════════════
  // S121-S140: THIRD MILLENNIUM COLLECTIONS (180 specimens)
  // ═══════════════════════════════════════════════════════════════
  // ── S121 Fulcrum (The Leverage Collection) ── Seeds 1201-1210 ──
  { navicue_type_id: 'lab__fulcrum__pivot_point', navicue_type_name: 'The Pivot Point', form: 'Practice', intent: 'Integrate', mechanism: 'Leverage', kbe_layer: 'embodying', magic_signature: 'fulcrum_pivot_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pivot Point', _lab_subtitle: 'Fulcrum \u00d7 Leverage Mechanics', _lab_signature: 'fulcrum_pivot_point' },
  { navicue_type_id: 'lab__fulcrum__long_lever', navicue_type_name: 'The Long Lever', form: 'Practice', intent: 'Integrate', mechanism: 'Force Amplification', kbe_layer: 'knowing', magic_signature: 'fulcrum_long_lever', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Long Lever', _lab_subtitle: 'Fulcrum \u00d7 Mechanical Advantage', _lab_signature: 'fulcrum_long_lever' },
  { navicue_type_id: 'lab__fulcrum__pulley_system', navicue_type_name: 'The Pulley System', form: 'Practice', intent: 'Integrate', mechanism: 'Redirection', kbe_layer: 'embodying', magic_signature: 'fulcrum_pulley_system', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pulley System', _lab_subtitle: 'Fulcrum \u00d7 Effort Distribution', _lab_signature: 'fulcrum_pulley_system' },
  { navicue_type_id: 'lab__fulcrum__gear_ratio', navicue_type_name: 'The Gear Ratio', form: 'Practice', intent: 'Integrate', mechanism: 'Transmission', kbe_layer: 'knowing', magic_signature: 'fulcrum_gear_ratio', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gear Ratio', _lab_subtitle: 'Fulcrum \u00d7 Speed vs Power', _lab_signature: 'fulcrum_gear_ratio' },
  { navicue_type_id: 'lab__fulcrum__wedge', navicue_type_name: 'The Wedge', form: 'Practice', intent: 'Integrate', mechanism: 'Splitting Force', kbe_layer: 'embodying', magic_signature: 'fulcrum_wedge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Wedge', _lab_subtitle: 'Fulcrum \u00d7 Inclined Plane', _lab_signature: 'fulcrum_wedge' },
  { navicue_type_id: 'lab__fulcrum__screw', navicue_type_name: 'The Screw', form: 'Practice', intent: 'Integrate', mechanism: 'Rotational Force', kbe_layer: 'knowing', magic_signature: 'fulcrum_screw', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Screw', _lab_subtitle: 'Fulcrum \u00d7 Spiral Leverage', _lab_signature: 'fulcrum_screw' },
  { navicue_type_id: 'lab__fulcrum__counterweight', navicue_type_name: 'The Counterweight', form: 'Practice', intent: 'Integrate', mechanism: 'Balance', kbe_layer: 'embodying', magic_signature: 'fulcrum_counterweight', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Counterweight', _lab_subtitle: 'Fulcrum \u00d7 Equilibrium', _lab_signature: 'fulcrum_counterweight' },
  { navicue_type_id: 'lab__fulcrum__domino', navicue_type_name: 'The Domino', form: 'Practice', intent: 'Integrate', mechanism: 'Chain Reaction', kbe_layer: 'knowing', magic_signature: 'fulcrum_domino', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Domino', _lab_subtitle: 'Fulcrum \u00d7 Cascade Effect', _lab_signature: 'fulcrum_domino' },
  { navicue_type_id: 'lab__fulcrum__tipping_point', navicue_type_name: 'The Tipping Point', form: 'Practice', intent: 'Integrate', mechanism: 'Critical Mass', kbe_layer: 'believing', magic_signature: 'fulcrum_tipping_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tipping Point', _lab_subtitle: 'Fulcrum \u00d7 Threshold Dynamics', _lab_signature: 'fulcrum_tipping_point' },
  { navicue_type_id: 'lab__fulcrum__fulcrum_seal', navicue_type_name: 'The Fulcrum Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Leverage Mastery', kbe_layer: 'knowing', magic_signature: 'fulcrum_fulcrum_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Fulcrum Seal', _lab_subtitle: 'Fulcrum \u00d7 Simple Machines', _lab_signature: 'fulcrum_fulcrum_seal' },
  // ── S122 Conductor (The Flow Collection) ── Seeds 1211-1220 ──
  { navicue_type_id: 'lab__conductor__resistance_check', navicue_type_name: 'The Resistance Check', form: 'Echo', intent: 'Integrate', mechanism: 'Impedance', kbe_layer: 'embodying', magic_signature: 'conductor_resistance_check', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Resistance Check', _lab_subtitle: 'Conductor \u00d7 Flow Dynamics', _lab_signature: 'conductor_resistance_check' },
  { navicue_type_id: 'lab__conductor__grounding_wire', navicue_type_name: 'The Grounding Wire', form: 'Echo', intent: 'Integrate', mechanism: 'Safety', kbe_layer: 'embodying', magic_signature: 'conductor_grounding_wire', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Grounding Wire', _lab_subtitle: 'Conductor \u00d7 Earth Connection', _lab_signature: 'conductor_grounding_wire' },
  { navicue_type_id: 'lab__conductor__circuit_breaker', navicue_type_name: 'The Circuit Breaker', form: 'Echo', intent: 'Integrate', mechanism: 'Protection', kbe_layer: 'knowing', magic_signature: 'conductor_circuit_breaker', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Circuit Breaker', _lab_subtitle: 'Conductor \u00d7 Overload Prevention', _lab_signature: 'conductor_circuit_breaker' },
  { navicue_type_id: 'lab__conductor__capacitor', navicue_type_name: 'The Capacitor', form: 'Echo', intent: 'Integrate', mechanism: 'Energy Storage', kbe_layer: 'knowing', magic_signature: 'conductor_capacitor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Capacitor', _lab_subtitle: 'Conductor \u00d7 Charge Accumulation', _lab_signature: 'conductor_capacitor' },
  { navicue_type_id: 'lab__conductor__transformer', navicue_type_name: 'The Transformer', form: 'Echo', intent: 'Integrate', mechanism: 'Voltage Conversion', kbe_layer: 'embodying', magic_signature: 'conductor_transformer', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Transformer', _lab_subtitle: 'Conductor \u00d7 Energy Translation', _lab_signature: 'conductor_transformer' },
  { navicue_type_id: 'lab__conductor__short_circuit', navicue_type_name: 'The Short Circuit', form: 'Echo', intent: 'Integrate', mechanism: 'Direct Path', kbe_layer: 'embodying', magic_signature: 'conductor_short_circuit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Short Circuit', _lab_subtitle: 'Conductor \u00d7 Bypass', _lab_signature: 'conductor_short_circuit' },
  { navicue_type_id: 'lab__conductor__parallel_circuit', navicue_type_name: 'The Parallel Circuit', form: 'Echo', intent: 'Integrate', mechanism: 'Distribution', kbe_layer: 'knowing', magic_signature: 'conductor_parallel_circuit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Parallel Circuit', _lab_subtitle: 'Conductor \u00d7 Multiple Paths', _lab_signature: 'conductor_parallel_circuit' },
  { navicue_type_id: 'lab__conductor__switch', navicue_type_name: 'The Switch', form: 'Echo', intent: 'Integrate', mechanism: 'Control', kbe_layer: 'believing', magic_signature: 'conductor_switch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Switch', _lab_subtitle: 'Conductor \u00d7 Binary Choice', _lab_signature: 'conductor_switch' },
  { navicue_type_id: 'lab__conductor__ac_dc', navicue_type_name: 'The AC/DC', form: 'Echo', intent: 'Integrate', mechanism: 'Current Type', kbe_layer: 'knowing', magic_signature: 'conductor_ac_dc', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The AC/DC', _lab_subtitle: 'Conductor \u00d7 Alternating Flow', _lab_signature: 'conductor_ac_dc' },
  { navicue_type_id: 'lab__conductor__conductor_seal', navicue_type_name: 'The Conductor Seal', form: 'Echo', intent: 'Integrate', mechanism: 'Conductance', kbe_layer: 'knowing', magic_signature: 'conductor_conductor_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Conductor Seal', _lab_subtitle: 'Conductor \u00d7 Flow Mastery', _lab_signature: 'conductor_conductor_seal' },
  // ── S123 Catalyst III (The Reaction Collection) ── Seeds 1221-1230 ──
  { navicue_type_id: 'lab__catalystiii__phase_change', navicue_type_name: 'The Phase Change', form: 'Practice', intent: 'Integrate', mechanism: 'State Transition', kbe_layer: 'embodying', magic_signature: 'catalystiii_phase_change', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Phase Change', _lab_subtitle: 'Catalyst III \u00d7 Matter States', _lab_signature: 'catalystiii_phase_change' },
  { navicue_type_id: 'lab__catalystiii__precipitate', navicue_type_name: 'The Precipitate', form: 'Practice', intent: 'Integrate', mechanism: 'Crystallization', kbe_layer: 'knowing', magic_signature: 'catalystiii_precipitate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Precipitate', _lab_subtitle: 'Catalyst III \u00d7 Emergence', _lab_signature: 'catalystiii_precipitate' },
  { navicue_type_id: 'lab__catalystiii__activation_energy', navicue_type_name: 'The Activation Energy', form: 'Practice', intent: 'Integrate', mechanism: 'Threshold', kbe_layer: 'embodying', magic_signature: 'catalystiii_activation_energy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Activation Energy', _lab_subtitle: 'Catalyst III \u00d7 Ignition Point', _lab_signature: 'catalystiii_activation_energy' },
  { navicue_type_id: 'lab__catalystiii__compound', navicue_type_name: 'The Compound', form: 'Practice', intent: 'Integrate', mechanism: 'Bonding', kbe_layer: 'knowing', magic_signature: 'catalystiii_compound', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compound', _lab_subtitle: 'Catalyst III \u00d7 Chemical Bond', _lab_signature: 'catalystiii_compound' },
  { navicue_type_id: 'lab__catalystiii__solvent', navicue_type_name: 'The Solvent', form: 'Practice', intent: 'Integrate', mechanism: 'Dissolution', kbe_layer: 'embodying', magic_signature: 'catalystiii_solvent', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Solvent', _lab_subtitle: 'Catalyst III \u00d7 Universal Dissolvent', _lab_signature: 'catalystiii_solvent' },
  { navicue_type_id: 'lab__catalystiii__chain_reaction', navicue_type_name: 'The Chain Reaction', form: 'Practice', intent: 'Integrate', mechanism: 'Propagation', kbe_layer: 'knowing', magic_signature: 'catalystiii_chain_reaction', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Chain Reaction', _lab_subtitle: 'Catalyst III \u00d7 Cascade', _lab_signature: 'catalystiii_chain_reaction' },
  { navicue_type_id: 'lab__catalystiii__purification', navicue_type_name: 'The Purification', form: 'Practice', intent: 'Integrate', mechanism: 'Refinement', kbe_layer: 'embodying', magic_signature: 'catalystiii_purification', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Purification', _lab_subtitle: 'Catalyst III \u00d7 Distillation', _lab_signature: 'catalystiii_purification' },
  { navicue_type_id: 'lab__catalystiii__inert_gas', navicue_type_name: 'The Inert Gas', form: 'Practice', intent: 'Integrate', mechanism: 'Noble Stability', kbe_layer: 'believing', magic_signature: 'catalystiii_inert_gas', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Inert Gas', _lab_subtitle: 'Catalyst III \u00d7 Noble Element', _lab_signature: 'catalystiii_inert_gas' },
  { navicue_type_id: 'lab__catalystiii__enzyme', navicue_type_name: 'The Enzyme', form: 'Practice', intent: 'Integrate', mechanism: 'Biological Catalyst', kbe_layer: 'knowing', magic_signature: 'catalystiii_enzyme', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Enzyme', _lab_subtitle: 'Catalyst III \u00d7 Living Chemistry', _lab_signature: 'catalystiii_enzyme' },
  { navicue_type_id: 'lab__catalystiii__catalyst_seal', navicue_type_name: 'The Catalyst Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Reaction Mastery', kbe_layer: 'knowing', magic_signature: 'catalystiii_catalyst_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Catalyst Seal', _lab_subtitle: 'Catalyst III \u00d7 Chemistry', _lab_signature: 'catalystiii_catalyst_seal' },
  // ── S125 Simulator (The Mental Model Collection) ── Seeds 1241-1250 ──
  { navicue_type_id: 'lab__simulator__map_vs_territory', navicue_type_name: 'The Map vs Territory', form: 'Mirror', intent: 'Integrate', mechanism: 'Model Fidelity', kbe_layer: 'knowing', magic_signature: 'simulator_map_vs_territory', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Map vs Territory', _lab_subtitle: 'Simulator \u00d7 Representation Gap', _lab_signature: 'simulator_map_vs_territory' },
  { navicue_type_id: 'lab__simulator__resolution_upgrade', navicue_type_name: 'The Resolution Upgrade', form: 'Mirror', intent: 'Integrate', mechanism: 'Detail Enhancement', kbe_layer: 'knowing', magic_signature: 'simulator_resolution_upgrade', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Resolution Upgrade', _lab_subtitle: 'Simulator \u00d7 Clarity Gain', _lab_signature: 'simulator_resolution_upgrade' },
  { navicue_type_id: 'lab__simulator__frame_rate', navicue_type_name: 'The Frame Rate', form: 'Mirror', intent: 'Integrate', mechanism: 'Temporal Resolution', kbe_layer: 'embodying', magic_signature: 'simulator_frame_rate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Frame Rate', _lab_subtitle: 'Simulator \u00d7 Perception Speed', _lab_signature: 'simulator_frame_rate' },
  { navicue_type_id: 'lab__simulator__sandbox_mode', navicue_type_name: 'The Sandbox Mode', form: 'Mirror', intent: 'Integrate', mechanism: 'Safe Experimentation', kbe_layer: 'believing', magic_signature: 'simulator_sandbox_mode', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sandbox Mode', _lab_subtitle: 'Simulator \u00d7 Risk-Free Play', _lab_signature: 'simulator_sandbox_mode' },
  { navicue_type_id: 'lab__simulator__algorithm_audit', navicue_type_name: 'The Algorithm Audit', form: 'Mirror', intent: 'Integrate', mechanism: 'Process Inspection', kbe_layer: 'knowing', magic_signature: 'simulator_algorithm_audit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Algorithm Audit', _lab_subtitle: 'Simulator \u00d7 Code Review', _lab_signature: 'simulator_algorithm_audit' },
  { navicue_type_id: 'lab__simulator__rendering_distance', navicue_type_name: 'The Rendering Distance', form: 'Mirror', intent: 'Integrate', mechanism: 'Scope', kbe_layer: 'knowing', magic_signature: 'simulator_rendering_distance', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rendering Distance', _lab_subtitle: 'Simulator \u00d7 Horizon Limit', _lab_signature: 'simulator_rendering_distance' },
  { navicue_type_id: 'lab__simulator__glitch', navicue_type_name: 'The Glitch', form: 'Mirror', intent: 'Integrate', mechanism: 'Error as Signal', kbe_layer: 'embodying', magic_signature: 'simulator_glitch', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Glitch', _lab_subtitle: 'Simulator \u00d7 Bug as Feature', _lab_signature: 'simulator_glitch' },
  { navicue_type_id: 'lab__simulator__compression', navicue_type_name: 'The Compression', form: 'Mirror', intent: 'Integrate', mechanism: 'Lossy Encoding', kbe_layer: 'knowing', magic_signature: 'simulator_compression', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compression', _lab_subtitle: 'Simulator \u00d7 Information Density', _lab_signature: 'simulator_compression' },
  { navicue_type_id: 'lab__simulator__user_interface', navicue_type_name: 'The User Interface', form: 'Mirror', intent: 'Integrate', mechanism: 'Interaction Layer', kbe_layer: 'believing', magic_signature: 'simulator_user_interface', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The User Interface', _lab_subtitle: 'Simulator \u00d7 Access Design', _lab_signature: 'simulator_user_interface' },
  { navicue_type_id: 'lab__simulator__simulator_seal', navicue_type_name: 'The Simulator Seal', form: 'Mirror', intent: 'Integrate', mechanism: 'Model Mastery', kbe_layer: 'knowing', magic_signature: 'simulator_simulator_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Simulator Seal', _lab_subtitle: 'Simulator \u00d7 Mental Models', _lab_signature: 'simulator_simulator_seal' },
  // ── S126 Editor (The Narrative Collection) ── Seeds 1251-1260 ──
  { navicue_type_id: 'lab__editor__jump_cut', navicue_type_name: 'The Jump Cut', form: 'Practice', intent: 'Integrate', mechanism: 'Temporal Skip', kbe_layer: 'knowing', magic_signature: 'editor_jump_cut', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Jump Cut', _lab_subtitle: 'Editor \u00d7 Narrative Compression', _lab_signature: 'editor_jump_cut' },
  { navicue_type_id: 'lab__editor__soundtrack_swap', navicue_type_name: 'The Soundtrack Swap', form: 'Practice', intent: 'Integrate', mechanism: 'Mood Reframe', kbe_layer: 'embodying', magic_signature: 'editor_soundtrack_swap', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Soundtrack Swap', _lab_subtitle: 'Editor \u00d7 Emotional Scoring', _lab_signature: 'editor_soundtrack_swap' },
  { navicue_type_id: 'lab__editor__flashback_edit', navicue_type_name: 'The Flashback Edit', form: 'Practice', intent: 'Integrate', mechanism: 'Memory Reframe', kbe_layer: 'knowing', magic_signature: 'editor_flashback_edit', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Flashback Edit', _lab_subtitle: 'Editor \u00d7 Temporal Recontextualization', _lab_signature: 'editor_flashback_edit' },
  { navicue_type_id: 'lab__editor__voiceover', navicue_type_name: 'The Voiceover', form: 'Practice', intent: 'Integrate', mechanism: 'Narrative Layer', kbe_layer: 'believing', magic_signature: 'editor_voiceover', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Voiceover', _lab_subtitle: 'Editor \u00d7 Inner Narrator', _lab_signature: 'editor_voiceover' },
  { navicue_type_id: 'lab__editor__b_roll', navicue_type_name: 'The B-Roll', form: 'Practice', intent: 'Integrate', mechanism: 'Supplementary View', kbe_layer: 'embodying', magic_signature: 'editor_b_roll', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The B-Roll', _lab_subtitle: 'Editor \u00d7 Context Footage', _lab_signature: 'editor_b_roll' },
  { navicue_type_id: 'lab__editor__plot_twist', navicue_type_name: 'The Plot Twist', form: 'Practice', intent: 'Integrate', mechanism: 'Expectation Violation', kbe_layer: 'knowing', magic_signature: 'editor_plot_twist', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Plot Twist', _lab_subtitle: 'Editor \u00d7 Narrative Reversal', _lab_signature: 'editor_plot_twist' },
  { navicue_type_id: 'lab__editor__character_arc', navicue_type_name: 'The Character Arc', form: 'Practice', intent: 'Integrate', mechanism: 'Growth Trajectory', kbe_layer: 'believing', magic_signature: 'editor_character_arc', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Character Arc', _lab_subtitle: 'Editor \u00d7 Transformation Story', _lab_signature: 'editor_character_arc' },
  { navicue_type_id: 'lab__editor__foley', navicue_type_name: 'The Foley', form: 'Practice', intent: 'Integrate', mechanism: 'Sound Design', kbe_layer: 'embodying', magic_signature: 'editor_foley', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Foley', _lab_subtitle: 'Editor \u00d7 Sensory Detail', _lab_signature: 'editor_foley' },
  { navicue_type_id: 'lab__editor__directors_cut', navicue_type_name: "The Director's Cut", form: 'Practice', intent: 'Integrate', mechanism: 'Creative Vision', kbe_layer: 'knowing', magic_signature: 'editor_directors_cut', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: "The Director's Cut", _lab_subtitle: 'Editor \u00d7 Authorial Intent', _lab_signature: 'editor_directors_cut' },
  { navicue_type_id: 'lab__editor__editor_seal', navicue_type_name: 'The Editor Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Narrative Craft', kbe_layer: 'knowing', magic_signature: 'editor_editor_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Editor Seal', _lab_subtitle: 'Editor \u00d7 Story Architecture', _lab_signature: 'editor_editor_seal' },
  // ── S128 Scout (The Horizon Collection) ── Seeds 1271-1280 ──
  { navicue_type_id: 'lab__scout__fog_of_war', navicue_type_name: 'The Fog of War', form: 'Probe', intent: 'Integrate', mechanism: 'Uncertainty Navigation', kbe_layer: 'embodying', magic_signature: 'scout_fog_of_war', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fog of War', _lab_subtitle: 'Scout \u00d7 Unknown Terrain', _lab_signature: 'scout_fog_of_war' },
  { navicue_type_id: 'lab__scout__breadcrumbs', navicue_type_name: 'The Breadcrumbs', form: 'Probe', intent: 'Integrate', mechanism: 'Trail Marking', kbe_layer: 'knowing', magic_signature: 'scout_breadcrumbs', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Breadcrumbs', _lab_subtitle: 'Scout \u00d7 Return Path', _lab_signature: 'scout_breadcrumbs' },
  { navicue_type_id: 'lab__scout__high_ground', navicue_type_name: 'The High Ground', form: 'Probe', intent: 'Integrate', mechanism: 'Vantage Point', kbe_layer: 'knowing', magic_signature: 'scout_high_ground', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The High Ground', _lab_subtitle: 'Scout \u00d7 Elevated Perspective', _lab_signature: 'scout_high_ground' },
  { navicue_type_id: 'lab__scout__night_vision', navicue_type_name: 'The Night Vision', form: 'Probe', intent: 'Integrate', mechanism: 'Dark Adaptation', kbe_layer: 'embodying', magic_signature: 'scout_night_vision', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Night Vision', _lab_subtitle: 'Scout \u00d7 Low-Light Sensing', _lab_signature: 'scout_night_vision' },
  { navicue_type_id: 'lab__scout__edge', navicue_type_name: 'The Edge', form: 'Probe', intent: 'Integrate', mechanism: 'Boundary Detection', kbe_layer: 'embodying', magic_signature: 'scout_edge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Edge', _lab_subtitle: 'Scout \u00d7 Frontier Mapping', _lab_signature: 'scout_edge' },
  { navicue_type_id: 'lab__scout__sample', navicue_type_name: 'The Sample', form: 'Probe', intent: 'Integrate', mechanism: 'Data Gathering', kbe_layer: 'knowing', magic_signature: 'scout_sample', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sample', _lab_subtitle: 'Scout \u00d7 Field Collection', _lab_signature: 'scout_sample' },
  { navicue_type_id: 'lab__scout__compass_bearing', navicue_type_name: 'The Compass Bearing', form: 'Probe', intent: 'Integrate', mechanism: 'Orientation', kbe_layer: 'believing', magic_signature: 'scout_compass_bearing', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compass Bearing', _lab_subtitle: 'Scout \u00d7 True North', _lab_signature: 'scout_compass_bearing' },
  { navicue_type_id: 'lab__scout__false_peak', navicue_type_name: 'The False Peak', form: 'Probe', intent: 'Integrate', mechanism: 'Deception Detection', kbe_layer: 'knowing', magic_signature: 'scout_false_peak', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The False Peak', _lab_subtitle: 'Scout \u00d7 Illusion of Arrival', _lab_signature: 'scout_false_peak' },
  { navicue_type_id: 'lab__scout__signal_fire', navicue_type_name: 'The Signal Fire', form: 'Probe', intent: 'Integrate', mechanism: 'Communication', kbe_layer: 'embodying', magic_signature: 'scout_signal_fire', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Signal Fire', _lab_subtitle: 'Scout \u00d7 Beacon', _lab_signature: 'scout_signal_fire' },
  { navicue_type_id: 'lab__scout__scout_seal', navicue_type_name: 'The Scout Seal', form: 'Probe', intent: 'Integrate', mechanism: 'Reconnaissance', kbe_layer: 'knowing', magic_signature: 'scout_scout_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Scout Seal', _lab_subtitle: 'Scout \u00d7 Horizon Mastery', _lab_signature: 'scout_scout_seal' },
  // ── S129 Weaver Pattern (The Pattern Collection) ── Seeds 1281-1290 ──
  { navicue_type_id: 'lab__weaverpattern__thread_pull', navicue_type_name: 'The Thread Pull', form: 'Drift', intent: 'Integrate', mechanism: 'Unraveling', kbe_layer: 'embodying', magic_signature: 'weaverpattern_thread_pull', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Thread Pull', _lab_subtitle: 'Weaver Pattern \u00d7 Deconstruction', _lab_signature: 'weaverpattern_thread_pull' },
  { navicue_type_id: 'lab__weaverpattern__knot', navicue_type_name: 'The Knot', form: 'Drift', intent: 'Integrate', mechanism: 'Binding', kbe_layer: 'embodying', magic_signature: 'weaverpattern_knot', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Knot', _lab_subtitle: 'Weaver Pattern \u00d7 Connection Point', _lab_signature: 'weaverpattern_knot' },
  { navicue_type_id: 'lab__weaverpattern__tapestry', navicue_type_name: 'The Tapestry', form: 'Drift', intent: 'Integrate', mechanism: 'Grand Picture', kbe_layer: 'knowing', magic_signature: 'weaverpattern_tapestry', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tapestry', _lab_subtitle: 'Weaver Pattern \u00d7 Full Composition', _lab_signature: 'weaverpattern_tapestry' },
  { navicue_type_id: 'lab__weaverpattern__fractal_zoom', navicue_type_name: 'The Fractal Zoom', form: 'Drift', intent: 'Integrate', mechanism: 'Self-Similarity', kbe_layer: 'knowing', magic_signature: 'weaverpattern_fractal_zoom', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fractal Zoom', _lab_subtitle: 'Weaver Pattern \u00d7 Scale Invariance', _lab_signature: 'weaverpattern_fractal_zoom' },
  { navicue_type_id: 'lab__weaverpattern__spiders_web', navicue_type_name: "The Spider's Web", form: 'Drift', intent: 'Integrate', mechanism: 'Structural Network', kbe_layer: 'embodying', magic_signature: 'weaverpattern_spiders_web', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: "The Spider's Web", _lab_subtitle: 'Weaver Pattern \u00d7 Natural Architecture', _lab_signature: 'weaverpattern_spiders_web' },
  { navicue_type_id: 'lab__weaverpattern__warp_and_weft', navicue_type_name: 'The Warp and Weft', form: 'Drift', intent: 'Integrate', mechanism: 'Orthogonal Integration', kbe_layer: 'knowing', magic_signature: 'weaverpattern_warp_and_weft', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Warp and Weft', _lab_subtitle: 'Weaver Pattern \u00d7 Cross-Threading', _lab_signature: 'weaverpattern_warp_and_weft' },
  { navicue_type_id: 'lab__weaverpattern__patchwork', navicue_type_name: 'The Patchwork', form: 'Drift', intent: 'Integrate', mechanism: 'Assemblage', kbe_layer: 'believing', magic_signature: 'weaverpattern_patchwork', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Patchwork', _lab_subtitle: 'Weaver Pattern \u00d7 Fragment Integration', _lab_signature: 'weaverpattern_patchwork' },
  { navicue_type_id: 'lab__weaverpattern__cut', navicue_type_name: 'The Cut', form: 'Drift', intent: 'Integrate', mechanism: 'Intentional Severance', kbe_layer: 'embodying', magic_signature: 'weaverpattern_cut', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cut', _lab_subtitle: 'Weaver Pattern \u00d7 Deliberate Release', _lab_signature: 'weaverpattern_cut' },
  { navicue_type_id: 'lab__weaverpattern__invisible_string', navicue_type_name: 'The Invisible String', form: 'Drift', intent: 'Integrate', mechanism: 'Hidden Connection', kbe_layer: 'believing', magic_signature: 'weaverpattern_invisible_string', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Invisible String', _lab_subtitle: 'Weaver Pattern \u00d7 Unseen Bond', _lab_signature: 'weaverpattern_invisible_string' },
  { navicue_type_id: 'lab__weaverpattern__weaver_seal', navicue_type_name: 'The Weaver Seal', form: 'Drift', intent: 'Integrate', mechanism: 'Pattern Mastery', kbe_layer: 'knowing', magic_signature: 'weaverpattern_weaver_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Weaver Seal', _lab_subtitle: 'Weaver Pattern \u00d7 Textile Wisdom', _lab_signature: 'weaverpattern_weaver_seal' },
  // ── S130 Anchor (The Stability Collection) ── Seeds 1291-1300 ──
  { navicue_type_id: 'lab__anchor__heavy_stone', navicue_type_name: 'The Heavy Stone', form: 'Practice', intent: 'Integrate', mechanism: 'Grounding Weight', kbe_layer: 'embodying', magic_signature: 'anchor_heavy_stone', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Heavy Stone', _lab_subtitle: 'Anchor \u00d7 Gravitational Hold', _lab_signature: 'anchor_heavy_stone' },
  { navicue_type_id: 'lab__anchor__deep_root', navicue_type_name: 'The Deep Root', form: 'Practice', intent: 'Integrate', mechanism: 'Foundation', kbe_layer: 'embodying', magic_signature: 'anchor_deep_root', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deep Root', _lab_subtitle: 'Anchor \u00d7 Underground Network', _lab_signature: 'anchor_deep_root' },
  { navicue_type_id: 'lab__anchor__gyroscope', navicue_type_name: 'The Gyroscope', form: 'Practice', intent: 'Integrate', mechanism: 'Rotational Stability', kbe_layer: 'knowing', magic_signature: 'anchor_gyroscope', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gyroscope', _lab_subtitle: 'Anchor \u00d7 Angular Momentum', _lab_signature: 'anchor_gyroscope' },
  { navicue_type_id: 'lab__anchor__keel', navicue_type_name: 'The Keel', form: 'Practice', intent: 'Integrate', mechanism: 'Ballast', kbe_layer: 'embodying', magic_signature: 'anchor_keel', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Keel', _lab_subtitle: 'Anchor \u00d7 Underwater Stability', _lab_signature: 'anchor_keel' },
  { navicue_type_id: 'lab__anchor__friction_brake', navicue_type_name: 'The Friction Brake', form: 'Practice', intent: 'Integrate', mechanism: 'Deceleration', kbe_layer: 'embodying', magic_signature: 'anchor_friction_brake', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Friction Brake', _lab_subtitle: 'Anchor \u00d7 Controlled Stop', _lab_signature: 'anchor_friction_brake' },
  { navicue_type_id: 'lab__anchor__center_of_mass', navicue_type_name: 'The Center of Mass', form: 'Practice', intent: 'Integrate', mechanism: 'Balance Point', kbe_layer: 'knowing', magic_signature: 'anchor_center_of_mass', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Center of Mass', _lab_subtitle: 'Anchor \u00d7 Equilibrium', _lab_signature: 'anchor_center_of_mass' },
  { navicue_type_id: 'lab__anchor__deadman_anchor', navicue_type_name: 'The Deadman Anchor', form: 'Practice', intent: 'Integrate', mechanism: 'Buried Hold', kbe_layer: 'embodying', magic_signature: 'anchor_deadman_anchor', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Deadman Anchor', _lab_subtitle: 'Anchor \u00d7 Earth Anchor', _lab_signature: 'anchor_deadman_anchor' },
  { navicue_type_id: 'lab__anchor__lighthouse', navicue_type_name: 'The Lighthouse', form: 'Practice', intent: 'Integrate', mechanism: 'Fixed Reference', kbe_layer: 'believing', magic_signature: 'anchor_lighthouse', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lighthouse', _lab_subtitle: 'Anchor \u00d7 Beacon', _lab_signature: 'anchor_lighthouse' },
  { navicue_type_id: 'lab__anchor__sediment', navicue_type_name: 'The Sediment', form: 'Practice', intent: 'Integrate', mechanism: 'Accumulation', kbe_layer: 'knowing', magic_signature: 'anchor_sediment', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sediment', _lab_subtitle: 'Anchor \u00d7 Slow Deposit', _lab_signature: 'anchor_sediment' },
  { navicue_type_id: 'lab__anchor__anchor_seal', navicue_type_name: 'The Anchor Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Stability Mastery', kbe_layer: 'knowing', magic_signature: 'anchor_anchor_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Anchor Seal', _lab_subtitle: 'Anchor \u00d7 Holding Fast', _lab_signature: 'anchor_anchor_seal' },
  // ── S131 Strategist (The Game Theory Collection) ── Seeds 1301-1310 ──
  { navicue_type_id: 'lab__strategist__first_mover', navicue_type_name: 'The First Mover', form: 'Practice', intent: 'Integrate', mechanism: 'Initiative', kbe_layer: 'knowing', magic_signature: 'strategist_first_mover', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The First Mover', _lab_subtitle: 'Strategist \u00d7 Opening Advantage', _lab_signature: 'strategist_first_mover' },
  { navicue_type_id: 'lab__strategist__sacrifice', navicue_type_name: 'The Sacrifice', form: 'Practice', intent: 'Integrate', mechanism: 'Strategic Loss', kbe_layer: 'believing', magic_signature: 'strategist_sacrifice', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sacrifice', _lab_subtitle: 'Strategist \u00d7 Delayed Return', _lab_signature: 'strategist_sacrifice' },
  { navicue_type_id: 'lab__strategist__titfortat', navicue_type_name: 'The Tit for Tat', form: 'Practice', intent: 'Integrate', mechanism: 'Reciprocity', kbe_layer: 'knowing', magic_signature: 'strategist_titfortat', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Tit for Tat', _lab_subtitle: 'Strategist \u00d7 Cooperative Strategy', _lab_signature: 'strategist_titfortat' },
  { navicue_type_id: 'lab__strategist__fog_of_war', navicue_type_name: 'The Fog of War', form: 'Practice', intent: 'Integrate', mechanism: 'Imperfect Information', kbe_layer: 'embodying', magic_signature: 'strategist_fog_of_war', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fog of War', _lab_subtitle: 'Strategist \u00d7 Uncertainty Play', _lab_signature: 'strategist_fog_of_war' },
  { navicue_type_id: 'lab__strategist__fork', navicue_type_name: 'The Fork', form: 'Practice', intent: 'Integrate', mechanism: 'Dual Threat', kbe_layer: 'knowing', magic_signature: 'strategist_fork', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fork', _lab_subtitle: 'Strategist \u00d7 Double Attack', _lab_signature: 'strategist_fork' },
  { navicue_type_id: 'lab__strategist__zugzwang', navicue_type_name: 'The Zugzwang', form: 'Practice', intent: 'Integrate', mechanism: 'Compelled Move', kbe_layer: 'believing', magic_signature: 'strategist_zugzwang', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Zugzwang', _lab_subtitle: 'Strategist \u00d7 Forced Disadvantage', _lab_signature: 'strategist_zugzwang' },
  { navicue_type_id: 'lab__strategist__endgame', navicue_type_name: 'The Endgame', form: 'Practice', intent: 'Integrate', mechanism: 'Final Phase', kbe_layer: 'knowing', magic_signature: 'strategist_endgame', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Endgame', _lab_subtitle: 'Strategist \u00d7 Closing Technique', _lab_signature: 'strategist_endgame' },
  { navicue_type_id: 'lab__strategist__stalemate', navicue_type_name: 'The Stalemate', form: 'Practice', intent: 'Integrate', mechanism: 'Draw State', kbe_layer: 'embodying', magic_signature: 'strategist_stalemate', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Stalemate', _lab_subtitle: 'Strategist \u00d7 Mutual Lock', _lab_signature: 'strategist_stalemate' },
  { navicue_type_id: 'lab__strategist__promotion', navicue_type_name: 'The Promotion', form: 'Practice', intent: 'Integrate', mechanism: 'Transformation', kbe_layer: 'believing', magic_signature: 'strategist_promotion', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Promotion', _lab_subtitle: 'Strategist \u00d7 Pawn to Queen', _lab_signature: 'strategist_promotion' },
  { navicue_type_id: 'lab__strategist__strategist_seal', navicue_type_name: 'The Strategist Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Game Mastery', kbe_layer: 'knowing', magic_signature: 'strategist_strategist_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Strategist Seal', _lab_subtitle: 'Strategist \u00d7 Game Theory', _lab_signature: 'strategist_strategist_seal' },
  // ── S132 Network (The Connection Collection) ── Seeds 1311-1320 ──
  { navicue_type_id: 'lab__network__node_strength', navicue_type_name: 'The Node Strength', form: 'Echo', intent: 'Integrate', mechanism: 'Connection Quality', kbe_layer: 'knowing', magic_signature: 'network_node_strength', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Node Strength', _lab_subtitle: 'Network \u00d7 Relational Density', _lab_signature: 'network_node_strength' },
  { navicue_type_id: 'lab__network__weak_tie', navicue_type_name: 'The Weak Tie', form: 'Echo', intent: 'Integrate', mechanism: 'Bridge Connection', kbe_layer: 'knowing', magic_signature: 'network_weak_tie', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Weak Tie', _lab_subtitle: 'Network \u00d7 Granovetter Strength', _lab_signature: 'network_weak_tie' },
  { navicue_type_id: 'lab__network__viral_coefficient', navicue_type_name: 'The Viral Coefficient', form: 'Echo', intent: 'Integrate', mechanism: 'Spread Rate', kbe_layer: 'embodying', magic_signature: 'network_viral_coefficient', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Viral Coefficient', _lab_subtitle: 'Network \u00d7 Contagion', _lab_signature: 'network_viral_coefficient' },
  { navicue_type_id: 'lab__network__echo_chamber', navicue_type_name: 'The Echo Chamber', form: 'Echo', intent: 'Integrate', mechanism: 'Feedback Loop', kbe_layer: 'knowing', magic_signature: 'network_echo_chamber', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Echo Chamber', _lab_subtitle: 'Network \u00d7 Information Bubble', _lab_signature: 'network_echo_chamber' },
  { navicue_type_id: 'lab__network__metcalfes_law', navicue_type_name: "Metcalfe's Law", form: 'Echo', intent: 'Integrate', mechanism: 'Network Value', kbe_layer: 'knowing', magic_signature: 'network_metcalfes_law', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: "Metcalfe's Law", _lab_subtitle: 'Network \u00d7 Exponential Value', _lab_signature: 'network_metcalfes_law' },
  { navicue_type_id: 'lab__network__packet_switching', navicue_type_name: 'The Packet Switching', form: 'Echo', intent: 'Integrate', mechanism: 'Distributed Routing', kbe_layer: 'embodying', magic_signature: 'network_packet_switching', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Packet Switching', _lab_subtitle: 'Network \u00d7 Data Flow', _lab_signature: 'network_packet_switching' },
  { navicue_type_id: 'lab__network__signal_boost', navicue_type_name: 'The Signal Boost', form: 'Echo', intent: 'Integrate', mechanism: 'Amplification', kbe_layer: 'embodying', magic_signature: 'network_signal_boost', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Signal Boost', _lab_subtitle: 'Network \u00d7 Reach Extension', _lab_signature: 'network_signal_boost' },
  { navicue_type_id: 'lab__network__firewall', navicue_type_name: 'The Firewall', form: 'Echo', intent: 'Integrate', mechanism: 'Boundary Protection', kbe_layer: 'believing', magic_signature: 'network_firewall', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Firewall', _lab_subtitle: 'Network \u00d7 Selective Permeability', _lab_signature: 'network_firewall' },
  { navicue_type_id: 'lab__network__neural_net', navicue_type_name: 'The Neural Net', form: 'Echo', intent: 'Integrate', mechanism: 'Learning Network', kbe_layer: 'knowing', magic_signature: 'network_neural_net', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Neural Net', _lab_subtitle: 'Network \u00d7 Adaptive Intelligence', _lab_signature: 'network_neural_net' },
  { navicue_type_id: 'lab__network__network_seal', navicue_type_name: 'The Network Seal', form: 'Echo', intent: 'Integrate', mechanism: 'Connection Mastery', kbe_layer: 'knowing', magic_signature: 'network_network_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Network Seal', _lab_subtitle: 'Network \u00d7 Topology', _lab_signature: 'network_network_seal' },
  // ── S133 Systems Architect (The Systems Collection) ── Seeds 1321-1330 ──
  { navicue_type_id: 'lab__systemsarchitect__bottleneck', navicue_type_name: 'The Bottleneck', form: 'Mirror', intent: 'Integrate', mechanism: 'Constraint Identification', kbe_layer: 'knowing', magic_signature: 'systemsarchitect_bottleneck', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Bottleneck', _lab_subtitle: 'Systems Architect \u00d7 Theory of Constraints', _lab_signature: 'systemsarchitect_bottleneck' },
  { navicue_type_id: 'lab__systemsarchitect__feedback_delay', navicue_type_name: 'The Feedback Delay', form: 'Mirror', intent: 'Integrate', mechanism: 'Lag Recognition', kbe_layer: 'knowing', magic_signature: 'systemsarchitect_feedback_delay', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Feedback Delay', _lab_subtitle: 'Systems Architect \u00d7 Temporal Offset', _lab_signature: 'systemsarchitect_feedback_delay' },
  { navicue_type_id: 'lab__systemsarchitect__redundancy', navicue_type_name: 'The Redundancy', form: 'Mirror', intent: 'Integrate', mechanism: 'Backup System', kbe_layer: 'embodying', magic_signature: 'systemsarchitect_redundancy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Redundancy', _lab_subtitle: 'Systems Architect \u00d7 Failsafe Design', _lab_signature: 'systemsarchitect_redundancy' },
  { navicue_type_id: 'lab__systemsarchitect__leverage_point', navicue_type_name: 'The Leverage Point', form: 'Mirror', intent: 'Integrate', mechanism: 'Intervention Point', kbe_layer: 'knowing', magic_signature: 'systemsarchitect_leverage_point', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Leverage Point', _lab_subtitle: 'Systems Architect \u00d7 Meadows Hierarchy', _lab_signature: 'systemsarchitect_leverage_point' },
  { navicue_type_id: 'lab__systemsarchitect__stock_and_flow', navicue_type_name: 'The Stock and Flow', form: 'Mirror', intent: 'Integrate', mechanism: 'Accumulation Dynamics', kbe_layer: 'knowing', magic_signature: 'systemsarchitect_stock_and_flow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Stock and Flow', _lab_subtitle: 'Systems Architect \u00d7 Resource Dynamics', _lab_signature: 'systemsarchitect_stock_and_flow' },
  { navicue_type_id: 'lab__systemsarchitect__oscillation_damping', navicue_type_name: 'The Oscillation Damping', form: 'Mirror', intent: 'Integrate', mechanism: 'Stability Control', kbe_layer: 'embodying', magic_signature: 'systemsarchitect_oscillation_damping', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Oscillation Damping', _lab_subtitle: 'Systems Architect \u00d7 Dampening', _lab_signature: 'systemsarchitect_oscillation_damping' },
  { navicue_type_id: 'lab__systemsarchitect__emergence', navicue_type_name: 'The Emergence', form: 'Mirror', intent: 'Integrate', mechanism: 'Emergent Properties', kbe_layer: 'believing', magic_signature: 'systemsarchitect_emergence', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Emergence', _lab_subtitle: 'Systems Architect \u00d7 Whole > Parts', _lab_signature: 'systemsarchitect_emergence' },
  { navicue_type_id: 'lab__systemsarchitect__scalability', navicue_type_name: 'The Scalability', form: 'Mirror', intent: 'Integrate', mechanism: 'Growth Architecture', kbe_layer: 'knowing', magic_signature: 'systemsarchitect_scalability', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Scalability', _lab_subtitle: 'Systems Architect \u00d7 Scale Design', _lab_signature: 'systemsarchitect_scalability' },
  { navicue_type_id: 'lab__systemsarchitect__black_swan', navicue_type_name: 'The Black Swan', form: 'Mirror', intent: 'Integrate', mechanism: 'Tail Risk', kbe_layer: 'knowing', magic_signature: 'systemsarchitect_black_swan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Black Swan', _lab_subtitle: 'Systems Architect \u00d7 Rare Event', _lab_signature: 'systemsarchitect_black_swan' },
  { navicue_type_id: 'lab__systemsarchitect__architect_seal', navicue_type_name: 'The Architect Seal', form: 'Mirror', intent: 'Integrate', mechanism: 'Systems Mastery', kbe_layer: 'knowing', magic_signature: 'systemsarchitect_architect_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Architect Seal', _lab_subtitle: 'Systems Architect \u00d7 Systems Thinking', _lab_signature: 'systemsarchitect_architect_seal' },
  // ── S134 Evolutionist (The Adaptation Collection) ── Seeds 1331-1340 ──
  { navicue_type_id: 'lab__evolutionist__mutation', navicue_type_name: 'The Mutation', form: 'Practice', intent: 'Integrate', mechanism: 'Random Variation', kbe_layer: 'embodying', magic_signature: 'evolutionist_mutation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mutation', _lab_subtitle: 'Evolutionist \u00d7 Genetic Drift', _lab_signature: 'evolutionist_mutation' },
  { navicue_type_id: 'lab__evolutionist__selection_pressure', navicue_type_name: 'The Selection Pressure', form: 'Practice', intent: 'Integrate', mechanism: 'Environmental Filter', kbe_layer: 'knowing', magic_signature: 'evolutionist_selection_pressure', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Selection Pressure', _lab_subtitle: 'Evolutionist \u00d7 Fitness Landscape', _lab_signature: 'evolutionist_selection_pressure' },
  { navicue_type_id: 'lab__evolutionist__niche', navicue_type_name: 'The Niche', form: 'Practice', intent: 'Integrate', mechanism: 'Ecological Fit', kbe_layer: 'embodying', magic_signature: 'evolutionist_niche', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Niche', _lab_subtitle: 'Evolutionist \u00d7 Specialization', _lab_signature: 'evolutionist_niche' },
  { navicue_type_id: 'lab__evolutionist__symbiosis', navicue_type_name: 'The Symbiosis', form: 'Practice', intent: 'Integrate', mechanism: 'Mutual Benefit', kbe_layer: 'believing', magic_signature: 'evolutionist_symbiosis', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Symbiosis', _lab_subtitle: 'Evolutionist \u00d7 Co-Evolution', _lab_signature: 'evolutionist_symbiosis' },
  { navicue_type_id: 'lab__evolutionist__red_queen', navicue_type_name: 'The Red Queen', form: 'Practice', intent: 'Integrate', mechanism: 'Arms Race', kbe_layer: 'knowing', magic_signature: 'evolutionist_red_queen', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Red Queen', _lab_subtitle: 'Evolutionist \u00d7 Competitive Adaptation', _lab_signature: 'evolutionist_red_queen' },
  { navicue_type_id: 'lab__evolutionist__extinction_event', navicue_type_name: 'The Extinction Event', form: 'Practice', intent: 'Integrate', mechanism: 'Mass Reset', kbe_layer: 'embodying', magic_signature: 'evolutionist_extinction_event', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Extinction Event', _lab_subtitle: 'Evolutionist \u00d7 Creative Destruction', _lab_signature: 'evolutionist_extinction_event' },
  { navicue_type_id: 'lab__evolutionist__sexual_selection', navicue_type_name: 'The Sexual Selection', form: 'Practice', intent: 'Integrate', mechanism: 'Mate Choice', kbe_layer: 'embodying', magic_signature: 'evolutionist_sexual_selection', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sexual Selection', _lab_subtitle: 'Evolutionist \u00d7 Display Fitness', _lab_signature: 'evolutionist_sexual_selection' },
  { navicue_type_id: 'lab__evolutionist__exaptation', navicue_type_name: 'The Exaptation', form: 'Practice', intent: 'Integrate', mechanism: 'Repurposing', kbe_layer: 'knowing', magic_signature: 'evolutionist_exaptation', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Exaptation', _lab_subtitle: 'Evolutionist \u00d7 Function Shift', _lab_signature: 'evolutionist_exaptation' },
  { navicue_type_id: 'lab__evolutionist__gene_drive', navicue_type_name: 'The Gene Drive', form: 'Practice', intent: 'Integrate', mechanism: 'Directed Evolution', kbe_layer: 'believing', magic_signature: 'evolutionist_gene_drive', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Gene Drive', _lab_subtitle: 'Evolutionist \u00d7 Intentional Mutation', _lab_signature: 'evolutionist_gene_drive' },
  { navicue_type_id: 'lab__evolutionist__evolution_seal', navicue_type_name: 'The Evolution Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Adaptation Mastery', kbe_layer: 'knowing', magic_signature: 'evolutionist_evolution_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Evolution Seal', _lab_subtitle: 'Evolutionist \u00d7 Natural Selection', _lab_signature: 'evolutionist_evolution_seal' },
  // ── S135 Economist (The Value Collection) ── Seeds 1341-1350 ──
  { navicue_type_id: 'lab__economist__opportunity_cost', navicue_type_name: 'The Opportunity Cost', form: 'Mirror', intent: 'Integrate', mechanism: 'Trade-Off', kbe_layer: 'knowing', magic_signature: 'economist_opportunity_cost', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Opportunity Cost', _lab_subtitle: 'Economist \u00d7 Path Not Taken', _lab_signature: 'economist_opportunity_cost' },
  { navicue_type_id: 'lab__economist__sunk_cost', navicue_type_name: 'The Sunk Cost', form: 'Mirror', intent: 'Integrate', mechanism: 'Irrecoverable Investment', kbe_layer: 'knowing', magic_signature: 'economist_sunk_cost', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sunk Cost', _lab_subtitle: 'Economist \u00d7 Let Go of Loss', _lab_signature: 'economist_sunk_cost' },
  { navicue_type_id: 'lab__economist__compound_interest', navicue_type_name: 'The Compound Interest', form: 'Mirror', intent: 'Integrate', mechanism: 'Exponential Growth', kbe_layer: 'knowing', magic_signature: 'economist_compound_interest', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compound Interest', _lab_subtitle: 'Economist \u00d7 Eighth Wonder', _lab_signature: 'economist_compound_interest' },
  { navicue_type_id: 'lab__economist__supply_and_demand', navicue_type_name: 'The Supply and Demand', form: 'Mirror', intent: 'Integrate', mechanism: 'Market Equilibrium', kbe_layer: 'embodying', magic_signature: 'economist_supply_and_demand', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Supply and Demand', _lab_subtitle: 'Economist \u00d7 Price Discovery', _lab_signature: 'economist_supply_and_demand' },
  { navicue_type_id: 'lab__economist__asymmetric_bet', navicue_type_name: 'The Asymmetric Bet', form: 'Mirror', intent: 'Integrate', mechanism: 'Convex Payoff', kbe_layer: 'knowing', magic_signature: 'economist_asymmetric_bet', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Asymmetric Bet', _lab_subtitle: 'Economist \u00d7 Upside Capture', _lab_signature: 'economist_asymmetric_bet' },
  { navicue_type_id: 'lab__economist__utility_function', navicue_type_name: 'The Utility Function', form: 'Mirror', intent: 'Integrate', mechanism: 'Satisfaction Curve', kbe_layer: 'embodying', magic_signature: 'economist_utility_function', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Utility Function', _lab_subtitle: 'Economist \u00d7 Diminishing Returns', _lab_signature: 'economist_utility_function' },
  { navicue_type_id: 'lab__economist__time_horizon', navicue_type_name: 'The Time Horizon', form: 'Mirror', intent: 'Integrate', mechanism: 'Temporal Discounting', kbe_layer: 'believing', magic_signature: 'economist_time_horizon', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Time Horizon', _lab_subtitle: 'Economist \u00d7 Future Value', _lab_signature: 'economist_time_horizon' },
  { navicue_type_id: 'lab__economist__arbitrage', navicue_type_name: 'The Arbitrage', form: 'Mirror', intent: 'Integrate', mechanism: 'Price Gap', kbe_layer: 'knowing', magic_signature: 'economist_arbitrage', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Arbitrage', _lab_subtitle: 'Economist \u00d7 Market Inefficiency', _lab_signature: 'economist_arbitrage' },
  { navicue_type_id: 'lab__economist__invisible_hand', navicue_type_name: 'The Invisible Hand', form: 'Mirror', intent: 'Integrate', mechanism: 'Emergent Order', kbe_layer: 'believing', magic_signature: 'economist_invisible_hand', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Invisible Hand', _lab_subtitle: 'Economist \u00d7 Self-Organization', _lab_signature: 'economist_invisible_hand' },
  { navicue_type_id: 'lab__economist__economist_seal', navicue_type_name: 'The Economist Seal', form: 'Mirror', intent: 'Integrate', mechanism: 'Value Mastery', kbe_layer: 'knowing', magic_signature: 'economist_economist_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Economist Seal', _lab_subtitle: 'Economist \u00d7 Economic Wisdom', _lab_signature: 'economist_economist_seal' },
  // ── S136 Politician (The Power Collection) ── Seeds 1351-1360 ──
  { navicue_type_id: 'lab__politician__coalition', navicue_type_name: 'The Coalition', form: 'Practice', intent: 'Integrate', mechanism: 'Alliance Building', kbe_layer: 'knowing', magic_signature: 'politician_coalition', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Coalition', _lab_subtitle: 'Politician \u00d7 Alliance Architecture', _lab_signature: 'politician_coalition' },
  { navicue_type_id: 'lab__politician__optics', navicue_type_name: 'The Optics', form: 'Practice', intent: 'Integrate', mechanism: 'Perception Management', kbe_layer: 'knowing', magic_signature: 'politician_optics', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Optics', _lab_subtitle: 'Politician \u00d7 Image Craft', _lab_signature: 'politician_optics' },
  { navicue_type_id: 'lab__politician__favor_bank', navicue_type_name: 'The Favor Bank', form: 'Practice', intent: 'Integrate', mechanism: 'Social Capital', kbe_layer: 'embodying', magic_signature: 'politician_favor_bank', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Favor Bank', _lab_subtitle: 'Politician \u00d7 Reciprocity Ledger', _lab_signature: 'politician_favor_bank' },
  { navicue_type_id: 'lab__politician__strange_bedfellow', navicue_type_name: 'The Strange Bedfellow', form: 'Practice', intent: 'Integrate', mechanism: 'Unlikely Alliance', kbe_layer: 'knowing', magic_signature: 'politician_strange_bedfellow', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Strange Bedfellow', _lab_subtitle: 'Politician \u00d7 Pragmatic Partnership', _lab_signature: 'politician_strange_bedfellow' },
  { navicue_type_id: 'lab__politician__silent_vote', navicue_type_name: 'The Silent Vote', form: 'Practice', intent: 'Integrate', mechanism: 'Hidden Preference', kbe_layer: 'believing', magic_signature: 'politician_silent_vote', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Silent Vote', _lab_subtitle: 'Politician \u00d7 Quiet Majority', _lab_signature: 'politician_silent_vote' },
  { navicue_type_id: 'lab__politician__compromise', navicue_type_name: 'The Compromise', form: 'Practice', intent: 'Integrate', mechanism: 'Negotiated Middle', kbe_layer: 'knowing', magic_signature: 'politician_compromise', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Compromise', _lab_subtitle: 'Politician \u00d7 Win-Win Framing', _lab_signature: 'politician_compromise' },
  { navicue_type_id: 'lab__politician__leverage', navicue_type_name: 'The Leverage', form: 'Practice', intent: 'Integrate', mechanism: 'Pressure Point', kbe_layer: 'embodying', magic_signature: 'politician_leverage', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Leverage', _lab_subtitle: 'Politician \u00d7 Power Dynamics', _lab_signature: 'politician_leverage' },
  { navicue_type_id: 'lab__politician__fall_guy', navicue_type_name: 'The Fall Guy', form: 'Practice', intent: 'Integrate', mechanism: 'Accountability Deflection', kbe_layer: 'knowing', magic_signature: 'politician_fall_guy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fall Guy', _lab_subtitle: 'Politician \u00d7 Scapegoat Mechanism', _lab_signature: 'politician_fall_guy' },
  { navicue_type_id: 'lab__politician__long_game', navicue_type_name: 'The Long Game', form: 'Practice', intent: 'Integrate', mechanism: 'Strategic Patience', kbe_layer: 'believing', magic_signature: 'politician_long_game', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Long Game', _lab_subtitle: 'Politician \u00d7 Generational Play', _lab_signature: 'politician_long_game' },
  { navicue_type_id: 'lab__politician__politician_seal', navicue_type_name: 'The Politician Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Power Mastery', kbe_layer: 'knowing', magic_signature: 'politician_politician_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Politician Seal', _lab_subtitle: 'Politician \u00d7 Realpolitik', _lab_signature: 'politician_politician_seal' },
  // ── S137 Warrior II (The Conflict Collection) ── Seeds 1361-1370 ──
  { navicue_type_id: 'lab__warriorii__formless', navicue_type_name: 'The Formless', form: 'Practice', intent: 'Integrate', mechanism: 'Adaptability', kbe_layer: 'embodying', magic_signature: 'warriorii_formless', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Formless', _lab_subtitle: 'Warrior II \u00d7 Water Strategy', _lab_signature: 'warriorii_formless' },
  { navicue_type_id: 'lab__warriorii__high_ground', navicue_type_name: 'The High Ground', form: 'Practice', intent: 'Integrate', mechanism: 'Positional Advantage', kbe_layer: 'knowing', magic_signature: 'warriorii_high_ground', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The High Ground', _lab_subtitle: 'Warrior II \u00d7 Terrain Mastery', _lab_signature: 'warriorii_high_ground' },
  { navicue_type_id: 'lab__warriorii__retreat', navicue_type_name: 'The Retreat', form: 'Practice', intent: 'Integrate', mechanism: 'Strategic Withdrawal', kbe_layer: 'embodying', magic_signature: 'warriorii_retreat', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Retreat', _lab_subtitle: 'Warrior II \u00d7 Tactical Withdrawal', _lab_signature: 'warriorii_retreat' },
  { navicue_type_id: 'lab__warriorii__spy', navicue_type_name: 'The Spy', form: 'Practice', intent: 'Integrate', mechanism: 'Intelligence Gathering', kbe_layer: 'knowing', magic_signature: 'warriorii_spy', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Spy', _lab_subtitle: 'Warrior II \u00d7 Information Warfare', _lab_signature: 'warriorii_spy' },
  { navicue_type_id: 'lab__warriorii__burning_bridge', navicue_type_name: 'The Burning Bridge', form: 'Practice', intent: 'Integrate', mechanism: 'No Retreat', kbe_layer: 'believing', magic_signature: 'warriorii_burning_bridge', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Burning Bridge', _lab_subtitle: 'Warrior II \u00d7 Commitment Device', _lab_signature: 'warriorii_burning_bridge' },
  { navicue_type_id: 'lab__warriorii__sun_at_your_back', navicue_type_name: 'The Sun at Your Back', form: 'Practice', intent: 'Integrate', mechanism: 'Environmental Advantage', kbe_layer: 'embodying', magic_signature: 'warriorii_sun_at_your_back', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Sun at Your Back', _lab_subtitle: 'Warrior II \u00d7 Natural Force', _lab_signature: 'warriorii_sun_at_your_back' },
  { navicue_type_id: 'lab__warriorii__empty_fort', navicue_type_name: 'The Empty Fort', form: 'Practice', intent: 'Integrate', mechanism: 'Deception', kbe_layer: 'knowing', magic_signature: 'warriorii_empty_fort', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Empty Fort', _lab_subtitle: 'Warrior II \u00d7 Bluff Strategy', _lab_signature: 'warriorii_empty_fort' },
  { navicue_type_id: 'lab__warriorii__flanking_maneuver', navicue_type_name: 'The Flanking Maneuver', form: 'Practice', intent: 'Integrate', mechanism: 'Indirect Approach', kbe_layer: 'embodying', magic_signature: 'warriorii_flanking_maneuver', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Flanking Maneuver', _lab_subtitle: 'Warrior II \u00d7 Oblique Attack', _lab_signature: 'warriorii_flanking_maneuver' },
  { navicue_type_id: 'lab__warriorii__peace_treaty', navicue_type_name: 'The Peace Treaty', form: 'Practice', intent: 'Integrate', mechanism: 'Conflict Resolution', kbe_layer: 'believing', magic_signature: 'warriorii_peace_treaty', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Peace Treaty', _lab_subtitle: 'Warrior II \u00d7 Negotiated End', _lab_signature: 'warriorii_peace_treaty' },
  { navicue_type_id: 'lab__warriorii__warrior_seal', navicue_type_name: 'The Warrior Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Conflict Mastery', kbe_layer: 'knowing', magic_signature: 'warriorii_warrior_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Warrior Seal', _lab_subtitle: 'Warrior II \u00d7 Art of War', _lab_signature: 'warriorii_warrior_seal' },
  // ── S138 Sovereign (The Governance Collection) ── Seeds 1371-1380 ──
  { navicue_type_id: 'lab__sovereign__constitution', navicue_type_name: 'The Constitution', form: 'Mirror', intent: 'Integrate', mechanism: 'Foundational Law', kbe_layer: 'knowing', magic_signature: 'sovereign_constitution', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Constitution', _lab_subtitle: 'Sovereign \u00d7 Founding Document', _lab_signature: 'sovereign_constitution' },
  { navicue_type_id: 'lab__sovereign__court', navicue_type_name: 'The Court', form: 'Mirror', intent: 'Integrate', mechanism: 'Inner Circle', kbe_layer: 'knowing', magic_signature: 'sovereign_court', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Court', _lab_subtitle: 'Sovereign \u00d7 Advisory Council', _lab_signature: 'sovereign_court' },
  { navicue_type_id: 'lab__sovereign__treasury', navicue_type_name: 'The Treasury', form: 'Mirror', intent: 'Integrate', mechanism: 'Resource Management', kbe_layer: 'embodying', magic_signature: 'sovereign_treasury', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Treasury', _lab_subtitle: 'Sovereign \u00d7 Wealth Stewardship', _lab_signature: 'sovereign_treasury' },
  { navicue_type_id: 'lab__sovereign__border', navicue_type_name: 'The Border', form: 'Mirror', intent: 'Integrate', mechanism: 'Boundary Definition', kbe_layer: 'embodying', magic_signature: 'sovereign_border', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Border', _lab_subtitle: 'Sovereign \u00d7 Territory Edge', _lab_signature: 'sovereign_border' },
  { navicue_type_id: 'lab__sovereign__decree', navicue_type_name: 'The Decree', form: 'Mirror', intent: 'Integrate', mechanism: 'Authoritative Command', kbe_layer: 'believing', magic_signature: 'sovereign_decree', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Decree', _lab_subtitle: 'Sovereign \u00d7 Executive Order', _lab_signature: 'sovereign_decree' },
  { navicue_type_id: 'lab__sovereign__succession', navicue_type_name: 'The Succession', form: 'Mirror', intent: 'Integrate', mechanism: 'Power Transfer', kbe_layer: 'knowing', magic_signature: 'sovereign_succession', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Succession', _lab_subtitle: 'Sovereign \u00d7 Legacy Planning', _lab_signature: 'sovereign_succession' },
  { navicue_type_id: 'lab__sovereign__diplomaticimmunity', navicue_type_name: 'The Diplomatic Immunity', form: 'Mirror', intent: 'Integrate', mechanism: 'Protected Status', kbe_layer: 'knowing', magic_signature: 'sovereign_diplomaticimmunity', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Diplomatic Immunity', _lab_subtitle: 'Sovereign \u00d7 Protected Channel', _lab_signature: 'sovereign_diplomaticimmunity' },
  { navicue_type_id: 'lab__sovereign__infrastructure', navicue_type_name: 'The Infrastructure', form: 'Mirror', intent: 'Integrate', mechanism: 'Foundation Building', kbe_layer: 'embodying', magic_signature: 'sovereign_infrastructure', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Infrastructure', _lab_subtitle: 'Sovereign \u00d7 System Backbone', _lab_signature: 'sovereign_infrastructure' },
  { navicue_type_id: 'lab__sovereign__rebellion', navicue_type_name: 'The Rebellion', form: 'Mirror', intent: 'Integrate', mechanism: 'Creative Dissent', kbe_layer: 'believing', magic_signature: 'sovereign_rebellion', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Rebellion', _lab_subtitle: 'Sovereign \u00d7 Principled Resistance', _lab_signature: 'sovereign_rebellion' },
  { navicue_type_id: 'lab__sovereign__sovereign_seal', navicue_type_name: 'The Sovereign Seal', form: 'Mirror', intent: 'Integrate', mechanism: 'Governance Mastery', kbe_layer: 'knowing', magic_signature: 'sovereign_sovereign_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Sovereign Seal', _lab_subtitle: 'Sovereign \u00d7 Self-Rule', _lab_signature: 'sovereign_sovereign_seal' },
  // ── S139 Historian (The Time Collection) ── Seeds 1381-1390 ──
  { navicue_type_id: 'lab__historian__lindyeffect', navicue_type_name: 'The Lindy Effect', form: 'Echo', intent: 'Integrate', mechanism: 'Time-Tested', kbe_layer: 'knowing', magic_signature: 'historian_lindyeffect', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Lindy Effect', _lab_subtitle: 'Historian \u00d7 Antifragile Knowledge', _lab_signature: 'historian_lindyeffect' },
  { navicue_type_id: 'lab__historian__cycle', navicue_type_name: 'The Cycle', form: 'Echo', intent: 'Integrate', mechanism: 'Recurrence', kbe_layer: 'knowing', magic_signature: 'historian_cycle', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Cycle', _lab_subtitle: 'Historian \u00d7 Rhythmic Return', _lab_signature: 'historian_cycle' },
  { navicue_type_id: 'lab__historian__blackswan', navicue_type_name: 'The Black Swan', form: 'Echo', intent: 'Integrate', mechanism: 'Unpredictable Event', kbe_layer: 'knowing', magic_signature: 'historian_blackswan', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Black Swan', _lab_subtitle: 'Historian \u00d7 Outlier Impact', _lab_signature: 'historian_blackswan' },
  { navicue_type_id: 'lab__historian__renaissance', navicue_type_name: 'The Renaissance', form: 'Echo', intent: 'Integrate', mechanism: 'Cultural Rebirth', kbe_layer: 'believing', magic_signature: 'historian_renaissance', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Renaissance', _lab_subtitle: 'Historian \u00d7 Renewal Period', _lab_signature: 'historian_renaissance' },
  { navicue_type_id: 'lab__historian__ruins', navicue_type_name: 'The Ruins', form: 'Echo', intent: 'Integrate', mechanism: 'Remnant Wisdom', kbe_layer: 'embodying', magic_signature: 'historian_ruins', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Ruins', _lab_subtitle: 'Historian \u00d7 Archaeological Mind', _lab_signature: 'historian_ruins' },
  { navicue_type_id: 'lab__historian__pendulum', navicue_type_name: 'The Pendulum', form: 'Echo', intent: 'Integrate', mechanism: 'Swing Dynamics', kbe_layer: 'embodying', magic_signature: 'historian_pendulum', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Pendulum', _lab_subtitle: 'Historian \u00d7 Oscillation of Eras', _lab_signature: 'historian_pendulum' },
  { navicue_type_id: 'lab__historian__goldenage', navicue_type_name: 'The Golden Age', form: 'Echo', intent: 'Integrate', mechanism: 'Peak Period', kbe_layer: 'believing', magic_signature: 'historian_goldenage', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Golden Age', _lab_subtitle: 'Historian \u00d7 Civilization Height', _lab_signature: 'historian_goldenage' },
  { navicue_type_id: 'lab__historian__fourthturning', navicue_type_name: 'The Fourth Turning', form: 'Echo', intent: 'Integrate', mechanism: 'Generational Cycle', kbe_layer: 'knowing', magic_signature: 'historian_fourthturning', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Fourth Turning', _lab_subtitle: 'Historian \u00d7 Saecular Rhythm', _lab_signature: 'historian_fourthturning' },
  { navicue_type_id: 'lab__historian__zeitgeist', navicue_type_name: 'The Zeitgeist', form: 'Echo', intent: 'Integrate', mechanism: 'Spirit of the Age', kbe_layer: 'believing', magic_signature: 'historian_zeitgeist', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Zeitgeist', _lab_subtitle: 'Historian \u00d7 Cultural Moment', _lab_signature: 'historian_zeitgeist' },
  { navicue_type_id: 'lab__historian__historian_seal', navicue_type_name: 'The Historian Seal', form: 'Echo', intent: 'Integrate', mechanism: 'Temporal Mastery', kbe_layer: 'knowing', magic_signature: 'historian_historian_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Historian Seal', _lab_subtitle: 'Historian \u00d7 Clio\'s Wisdom', _lab_signature: 'historian_historian_seal' },
  // ── S140 Game Designer (The Meta Collection) ── Seeds 1391-1400 ──
  { navicue_type_id: 'lab__gamedesigner__infinitegame', navicue_type_name: 'The Infinite Game', form: 'Practice', intent: 'Integrate', mechanism: 'Infinite Play', kbe_layer: 'believing', magic_signature: 'gamedesigner_infinitegame', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Infinite Game', _lab_subtitle: 'Game Designer \u00d7 Carse Philosophy', _lab_signature: 'gamedesigner_infinitegame' },
  { navicue_type_id: 'lab__gamedesigner__incentivestructure', navicue_type_name: 'The Incentive Structure', form: 'Practice', intent: 'Integrate', mechanism: 'Reward Architecture', kbe_layer: 'knowing', magic_signature: 'gamedesigner_incentivestructure', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Incentive Structure', _lab_subtitle: 'Game Designer \u00d7 Motivation Design', _lab_signature: 'gamedesigner_incentivestructure' },
  { navicue_type_id: 'lab__gamedesigner__mod', navicue_type_name: 'The Mod', form: 'Practice', intent: 'Integrate', mechanism: 'Custom Modification', kbe_layer: 'embodying', magic_signature: 'gamedesigner_mod', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Mod', _lab_subtitle: 'Game Designer \u00d7 Rule Hack', _lab_signature: 'gamedesigner_mod' },
  { navicue_type_id: 'lab__gamedesigner__npc', navicue_type_name: 'The NPC', form: 'Practice', intent: 'Integrate', mechanism: 'Scripted Behavior', kbe_layer: 'knowing', magic_signature: 'gamedesigner_npc', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The NPC', _lab_subtitle: 'Game Designer \u00d7 Autopilot Awareness', _lab_signature: 'gamedesigner_npc' },
  { navicue_type_id: 'lab__gamedesigner__levelup', navicue_type_name: 'The Level Up', form: 'Practice', intent: 'Integrate', mechanism: 'Skill Threshold', kbe_layer: 'embodying', magic_signature: 'gamedesigner_levelup', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Level Up', _lab_subtitle: 'Game Designer \u00d7 Growth Milestone', _lab_signature: 'gamedesigner_levelup' },
  { navicue_type_id: 'lab__gamedesigner__bossfight', navicue_type_name: 'The Boss Fight', form: 'Practice', intent: 'Integrate', mechanism: 'Peak Challenge', kbe_layer: 'embodying', magic_signature: 'gamedesigner_bossfight', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Boss Fight', _lab_subtitle: 'Game Designer \u00d7 Crucible Moment', _lab_signature: 'gamedesigner_bossfight' },
  { navicue_type_id: 'lab__gamedesigner__savepoint', navicue_type_name: 'The Save Point', form: 'Practice', intent: 'Integrate', mechanism: 'Progress Capture', kbe_layer: 'knowing', magic_signature: 'gamedesigner_savepoint', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Save Point', _lab_subtitle: 'Game Designer \u00d7 Checkpoint', _lab_signature: 'gamedesigner_savepoint' },
  { navicue_type_id: 'lab__gamedesigner__expansionpack', navicue_type_name: 'The Expansion Pack', form: 'Practice', intent: 'Integrate', mechanism: 'Extended Content', kbe_layer: 'believing', magic_signature: 'gamedesigner_expansionpack', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The Expansion Pack', _lab_subtitle: 'Game Designer \u00d7 New Territory', _lab_signature: 'gamedesigner_expansionpack' },
  { navicue_type_id: 'lab__gamedesigner__godmode', navicue_type_name: 'The God Mode', form: 'Practice', intent: 'Integrate', mechanism: 'Omniscient View', kbe_layer: 'knowing', magic_signature: 'gamedesigner_godmode', container_type: 'action', primary_prompt: null, cta_primary: null, _lab_title: 'The God Mode', _lab_subtitle: 'Game Designer \u00d7 Meta Perspective', _lab_signature: 'gamedesigner_godmode' },
  { navicue_type_id: 'lab__gamedesigner__atlas_seal', navicue_type_name: 'The Atlas Seal', form: 'Practice', intent: 'Integrate', mechanism: 'Game Mastery', kbe_layer: 'knowing', magic_signature: 'gamedesigner_atlas_seal', container_type: 'reflective', primary_prompt: null, cta_primary: null, _lab_title: 'The Atlas Seal', _lab_subtitle: 'Game Designer \u00d7 Meta Design', _lab_signature: 'gamedesigner_atlas_seal' },
];
// Signature color accents — unique hues across the full spectrum
const SIGNATURE_COLORS: Record<string, string> = {
  // Original 5
  witness_ritual:     'hsla(30, 25%, 50%, 0.6)',
  sensory_cinema:     'hsla(200, 35%, 45%, 0.6)',
  sacred_ordinary:    'hsla(35, 60%, 60%, 0.6)',
  koan_paradox:       'hsla(20, 50%, 50%, 0.6)',
  pattern_glitch:     'hsla(250, 50%, 58%, 0.6)',
  // Act I — Metacognition (cool observation tones)
  inner_chorus:       'hsla(210, 40%, 55%, 0.6)',
  thought_inscription:'hsla(180, 35%, 50%, 0.6)',
  thought_splice:     'hsla(265, 40%, 55%, 0.6)',
  perception_shift:   'hsla(170, 45%, 48%, 0.6)',
  // Act II — Exposure + Activation (warmer approach tones)
  edge_pulse:         'hsla(15, 55%, 52%, 0.6)',
  body_script:        'hsla(340, 40%, 55%, 0.6)',
  shadow_welcome:     'hsla(220, 35%, 48%, 0.6)',
  mirror_dissolve:    'hsla(190, 50%, 50%, 0.6)',
  // Act III — Self-Compassion (tender warmth)
  parts_gathering:    'hsla(280, 30%, 58%, 0.6)',
  gentle_audit:       'hsla(45, 50%, 55%, 0.6)',
  // Act IV — Values + Activation (grounded earth tones)
  mirror_trade:       'hsla(10, 45%, 50%, 0.6)',
  pivot_point:        'hsla(145, 40%, 45%, 0.6)',
  quiet_license:      'hsla(55, 45%, 50%, 0.6)',
  // Act V — Identity Koans (deep spectrum)
  identity_exposure:  'hsla(240, 45%, 55%, 0.6)',
  tender_archaeology: 'hsla(310, 35%, 55%, 0.6)',
  // Act VI — The Deepening (body meets truth)
  compassionate_depth: 'hsla(330, 35%, 52%, 0.6)',
  body_compass:        'hsla(160, 40%, 48%, 0.6)',
  values_census:       'hsla(85, 35%, 48%, 0.6)',
  // Act VII — The Moving (the body leads)
  action_mirror:       'hsla(120, 35%, 45%, 0.6)',
  micro_momentum:      'hsla(35, 45%, 48%, 0.6)',
  values_depth:        'hsla(195, 45%, 42%, 0.6)',
  // Act VIII — The Facing (hard tenderness)
  fear_map:            'hsla(225, 40%, 50%, 0.6)',
  tender_mirror:       'hsla(350, 30%, 55%, 0.6)',
  // Act IX — The Knowing (identity meets awareness)
  identity_witness:    'hsla(270, 40%, 52%, 0.6)',
  identity_values:     'hsla(15, 50%, 48%, 0.6)',
  // Act X — The Tender Deepening (self-compassion deepens)
  gentle_lullaby:      'hsla(60, 40%, 52%, 0.6)',
  tender_unveiling:    'hsla(305, 35%, 55%, 0.6)',
  inherited_door:      'hsla(150, 35%, 48%, 0.6)',
  self_cradle:         'hsla(325, 30%, 55%, 0.6)',
  buried_breath:       'hsla(235, 40%, 52%, 0.6)',
  // Act XI — The Second Sight (seeing again with new eyes)
  deep_vigil:          'hsla(205, 45%, 48%, 0.6)',
  aftermath_glass:     'hsla(25, 40%, 52%, 0.6)',
  master_thought:      'hsla(175, 38%, 46%, 0.6)',
  courage_tally:       'hsla(40, 50%, 50%, 0.6)',
  full_chamber:        'hsla(290, 32%, 52%, 0.6)',
  // Act XII — The Gathering (collecting the pieces)
  quiet_rehearsal:     'hsla(18, 55%, 50%, 0.6)',
  compass_glass:       'hsla(110, 35%, 45%, 0.6)',
  warmth_web:          'hsla(340, 40%, 52%, 0.6)',
  key_turn:            'hsla(52, 48%, 48%, 0.6)',
  unified_motion:      'hsla(195, 42%, 50%, 0.6)',
  // Act XIII — The Homecoming (arriving where you started)
  depth_core:          'hsla(262, 32%, 50%, 0.6)',
  open_field:          'hsla(95, 38%, 45%, 0.6)',
  warm_hearth:         'hsla(12, 45%, 52%, 0.6)',
  thought_garden:      'hsla(165, 36%, 48%, 0.6)',
  future_mirror:       'hsla(38, 50%, 50%, 0.6)',
  // Act 0 — The Novice Collection (luminous primaries)
  novice_pattern_glitch:    'hsla(250, 55%, 62%, 0.7)',
  novice_somatic_sigh:      'hsla(200, 40%, 65%, 0.7)',
  novice_witness_window:    'hsla(30, 28%, 55%, 0.7)',
  novice_permission_slip:   'hsla(35, 55%, 62%, 0.7)',
  novice_paradox_key:       'hsla(20, 50%, 58%, 0.7)',
  novice_reality_anchor:    'hsla(200, 45%, 55%, 0.7)',
  novice_micro_proof:       'hsla(145, 45%, 50%, 0.7)',
  novice_value_compass:     'hsla(160, 42%, 52%, 0.7)',
  novice_future_simulation: 'hsla(38, 52%, 58%, 0.7)',
  novice_connection_thread: 'hsla(12, 48%, 55%, 0.7)',
  // Act 1 — The Alchemist Collection (reframing spectrum)
  alchemist_craving_surf:      'hsla(200, 45%, 55%, 0.7)',
  alchemist_story_edit:        'hsla(265, 45%, 58%, 0.7)',
  alchemist_time_telescope:    'hsla(42, 50%, 55%, 0.7)',
  alchemist_shadow_hug:        'hsla(20, 48%, 55%, 0.7)',
  alchemist_meaning_mine:      'hsla(35, 55%, 58%, 0.7)',
  alchemist_energy_transmute:  'hsla(250, 50%, 60%, 0.7)',
  alchemist_council_of_elders: 'hsla(30, 30%, 52%, 0.7)',
  alchemist_fact_checker:      'hsla(42, 48%, 52%, 0.7)',
  alchemist_gratitude_sniper:  'hsla(250, 48%, 58%, 0.7)',
  alchemist_identity_vote:     'hsla(20, 50%, 52%, 0.7)',
  // Act 2 — The Architect Collection (embodiment spectrum)
  architect_boundary_brick:     'hsla(35, 55%, 55%, 0.7)',
  architect_connection_bridge:  'hsla(340, 35%, 55%, 0.7)',
  architect_micro_yes:          'hsla(35, 50%, 58%, 0.7)',
  architect_environment_sweep:  'hsla(250, 48%, 58%, 0.7)',
  architect_mirror_gaze:        'hsla(340, 38%, 52%, 0.7)',
  architect_friction_remover:   'hsla(265, 42%, 55%, 0.7)',
  architect_value_stake:        'hsla(20, 50%, 52%, 0.7)',
  architect_vulnerability_drop: 'hsla(340, 32%, 55%, 0.7)',
  architect_generosity_loop:    'hsla(35, 52%, 55%, 0.7)',
  architect_identity_seal:      'hsla(42, 50%, 52%, 0.7)',
  // Act 3 — The Navigator Collection (integration/flow spectrum)
  navigator_tempo_dial:          'hsla(200, 40%, 52%, 0.7)',
  navigator_friction_converter:  'hsla(42, 48%, 55%, 0.7)',
  navigator_intuition_ping:      'hsla(200, 42%, 50%, 0.7)',
  navigator_repair_stitch:       'hsla(340, 35%, 52%, 0.7)',
  navigator_drift_correction:    'hsla(250, 48%, 58%, 0.7)',
  navigator_spotlight_shift:     'hsla(30, 28%, 52%, 0.7)',
  navigator_doubt_detox:         'hsla(265, 42%, 55%, 0.7)',
  navigator_joy_snap:            'hsla(35, 55%, 58%, 0.7)',
  navigator_values_jam:          'hsla(20, 50%, 52%, 0.7)',
  navigator_flow_trigger:        'hsla(42, 50%, 55%, 0.7)',
  // Act 4 — The Sage Collection (wisdom/knowing spectrum)
  sage_ego_zoom:                 'hsla(30, 28%, 50%, 0.7)',
  sage_generational_lens:        'hsla(340, 30%, 48%, 0.7)',
  sage_empty_boat:               'hsla(20, 45%, 50%, 0.7)',
  sage_silence_soak:             'hsla(200, 35%, 50%, 0.7)',
  sage_compassion_core:          'hsla(35, 50%, 55%, 0.7)',
  sage_mortality_check:          'hsla(250, 40%, 52%, 0.7)',
  sage_ripple_watch:             'hsla(30, 30%, 52%, 0.7)',
  sage_universal_breath:         'hsla(200, 38%, 48%, 0.7)',
  sage_love_broadcast:           'hsla(340, 32%, 50%, 0.7)',
  sage_legacy_stamp:             'hsla(42, 48%, 52%, 0.7)',
  // Act 5 — The Mender Collection (repair/compassion spectrum)
  mender_kintsugi_file:          'hsla(45, 55%, 55%, 0.7)',
  mender_shame_scrum:            'hsla(30, 28%, 48%, 0.7)',
  mender_data_harvest:           'hsla(170, 35%, 48%, 0.7)',
  mender_forgiveness_loop:       'hsla(340, 28%, 50%, 0.7)',
  mender_reset_button:           'hsla(260, 40%, 55%, 0.7)',
  mender_vulnerability_vow:      'hsla(42, 45%, 52%, 0.7)',
  mender_dust_off:               'hsla(35, 55%, 55%, 0.7)',
  mender_guardrail_build:        'hsla(200, 35%, 50%, 0.7)',
  mender_body_scan_damage:       'hsla(20, 42%, 50%, 0.7)',
  mender_re_commitment:          'hsla(42, 50%, 55%, 0.7)',
  // Act 6 — The Diplomat Collection (bridge/empathy spectrum)
  diplomat_mirror_shield:        'hsla(30, 30%, 50%, 0.7)',
  diplomat_truce_table:          'hsla(35, 50%, 52%, 0.7)',
  diplomat_perspective_swap:     'hsla(20, 45%, 48%, 0.7)',
  diplomat_peace_thread:         'hsla(340, 25%, 48%, 0.7)',
  diplomat_translator:           'hsla(175, 30%, 48%, 0.7)',
  diplomat_boundary_dance:       'hsla(200, 35%, 50%, 0.7)',
  diplomat_empathy_bridge:       'hsla(42, 40%, 50%, 0.7)',
  diplomat_de_escalation:        'hsla(260, 35%, 52%, 0.7)',
  diplomat_common_ground:        'hsla(30, 28%, 48%, 0.7)',
  diplomat_sangha_search:        'hsla(340, 28%, 50%, 0.7)',
  // Act 7 — The Weaver Collection (pattern/integration spectrum)
  weaver_thread_map:             'hsla(270, 30%, 50%, 0.7)',
  weaver_story_loom:             'hsla(275, 35%, 48%, 0.7)',
  weaver_contradiction_hold:     'hsla(280, 28%, 52%, 0.7)',
  weaver_pattern_break:          'hsla(265, 35%, 50%, 0.7)',
  weaver_meaning_weave:          'hsla(42, 35%, 50%, 0.7)',
  weaver_integration_spiral:     'hsla(200, 30%, 48%, 0.7)',
  weaver_complexity_breath:      'hsla(285, 25%, 50%, 0.7)',
  weaver_bridge_of_opposites:    'hsla(260, 30%, 48%, 0.7)',
  weaver_witness_weave:          'hsla(30, 28%, 48%, 0.7)',
  weaver_tapestry_seal:          'hsla(340, 25%, 48%, 0.7)',
  // Act 8 — The Visionary Collection (possibility/future spectrum)
  visionary_horizon_scan:        'hsla(200, 40%, 52%, 0.7)',
  visionary_seed_vault:          'hsla(42, 45%, 50%, 0.7)',
  visionary_possibility_prism:   'hsla(280, 35%, 52%, 0.7)',
  visionary_fear_telescope:      'hsla(30, 30%, 48%, 0.7)',
  visionary_dream_audit:         'hsla(175, 30%, 48%, 0.7)',
  visionary_time_capsule:        'hsla(340, 28%, 50%, 0.7)',
  visionary_obstacle_flip:       'hsla(260, 35%, 50%, 0.7)',
  visionary_vision_board:        'hsla(200, 35%, 50%, 0.7)',
  visionary_courage_map:         'hsla(42, 40%, 48%, 0.7)',
  visionary_becoming_seal:       'hsla(280, 28%, 50%, 0.7)',
  // Act 9 — The Luminary Collection (light/purpose spectrum)
  luminary_torch_pass:           'hsla(42, 50%, 52%, 0.7)',
  luminary_ripple_seed:          'hsla(30, 30%, 48%, 0.7)',
  luminary_legacy_letter:        'hsla(175, 28%, 48%, 0.7)',
  luminary_gratitude_broadcast:  'hsla(340, 25%, 48%, 0.7)',
  luminary_mentor_mirror:        'hsla(200, 35%, 50%, 0.7)',
  luminary_service_compass:      'hsla(42, 45%, 48%, 0.7)',
  luminary_generosity_engine:    'hsla(260, 30%, 50%, 0.7)',
  luminary_purpose_pulse:        'hsla(200, 40%, 50%, 0.7)',
  luminary_dark_light:           'hsla(280, 30%, 48%, 0.7)',
  luminary_constellation_seal:   'hsla(30, 28%, 50%, 0.7)',
  // Act 10 — The Hacker Collection (de-conditioning/matrix spectrum)
  hacker_label_peeler:           'hsla(160, 45%, 42%, 0.7)',
  hacker_status_glitch:          'hsla(165, 40%, 44%, 0.7)',
  hacker_algorithm_jammer:       'hsla(170, 35%, 46%, 0.7)',
  hacker_mimetic_check:          'hsla(155, 30%, 42%, 0.7)',
  hacker_sunk_cost_cut:          'hsla(175, 28%, 44%, 0.7)',
  hacker_script_burn:            'hsla(150, 40%, 40%, 0.7)',
  hacker_attention_paywall:      'hsla(180, 35%, 42%, 0.7)',
  hacker_role_reject:            'hsla(145, 30%, 44%, 0.7)',
  hacker_should_deleter:         'hsla(158, 38%, 40%, 0.7)',
  hacker_source_code:            'hsla(140, 45%, 42%, 0.7)',
  // Act 11 — The Chrononaut Collection (time-bending/indigo-violet spectrum)
  chrononaut_memory_remix:       'hsla(260, 40%, 50%, 0.7)',
  chrononaut_deep_time:          'hsla(255, 35%, 48%, 0.7)',
  chrononaut_slow_motion_day:    'hsla(250, 30%, 52%, 0.7)',
  chrononaut_future_visitor:     'hsla(265, 35%, 50%, 0.7)',
  chrononaut_patience_muscle:    'hsla(245, 28%, 48%, 0.7)',
  chrononaut_urgency_deleter:    'hsla(270, 32%, 50%, 0.7)',
  chrononaut_regret_reversal:    'hsla(258, 30%, 46%, 0.7)',
  chrononaut_ancestral_blink:    'hsla(240, 25%, 48%, 0.7)',
  chrononaut_loop_spotter:       'hsla(262, 38%, 44%, 0.7)',
  chrononaut_eternal_instant:    'hsla(248, 42%, 50%, 0.7)',
  // Act 12 — The Mycelium Collection (networked/earth-green spectrum)
  mycelium_invisible_thread:     'hsla(90, 30%, 45%, 0.7)',
  mycelium_hive_mind:            'hsla(55, 35%, 48%, 0.7)',
  mycelium_symbiosis_check:      'hsla(100, 28%, 42%, 0.7)',
  mycelium_root_share:           'hsla(30, 25%, 40%, 0.7)',
  mycelium_signal_pulse:         'hsla(55, 40%, 50%, 0.7)',
  mycelium_mirror_neuron:        'hsla(85, 32%, 44%, 0.7)',
  mycelium_wide_net:             'hsla(110, 25%, 42%, 0.7)',
  mycelium_common_ground:        'hsla(45, 30%, 45%, 0.7)',
  mycelium_dunbar_sorter:        'hsla(95, 28%, 46%, 0.7)',
  mycelium_mycelial_map:         'hsla(80, 35%, 42%, 0.7)',
  // Act 13 — The Aesthete Collection (beauty/rose-gold/alabaster spectrum)
  aesthete_golden_ratio:         'hsla(42, 45%, 55%, 0.7)',
  aesthete_color_soak:           'hsla(225, 50%, 45%, 0.7)',
  aesthete_wabi_sabi:            'hsla(25, 35%, 48%, 0.7)',
  aesthete_negative_space:       'hsla(0, 0%, 60%, 0.5)',
  aesthete_texture_touch:        'hsla(280, 25%, 42%, 0.7)',
  aesthete_design_edit:          'hsla(0, 0%, 55%, 0.6)',
  aesthete_sound_bath:           'hsla(260, 30%, 50%, 0.7)',
  aesthete_light_sculpt:         'hsla(40, 50%, 55%, 0.7)',
  aesthete_taste_savor:          'hsla(35, 45%, 50%, 0.7)',
  aesthete_masterpiece_frame:    'hsla(42, 40%, 50%, 0.7)',
  // Act 14 — The Elemental Collection (fire/water/earth/ice spectrum)
  elemental_fire_gaze:           'hsla(25, 70%, 50%, 0.7)',
  elemental_water_float:         'hsla(200, 40%, 50%, 0.7)',
  elemental_wind_shear:          'hsla(160, 25%, 45%, 0.6)',
  elemental_stone_hold:          'hsla(25, 15%, 35%, 0.6)',
  elemental_ice_shock:           'hsla(200, 50%, 70%, 0.7)',
  elemental_root_drop:           'hsla(25, 20%, 30%, 0.6)',
  elemental_thunder_gap:         'hsla(50, 50%, 60%, 0.7)',
  elemental_river_flow:          'hsla(200, 35%, 50%, 0.6)',
  elemental_salt_cleanse:        'hsla(195, 30%, 50%, 0.6)',
  elemental_elementalist_seal:   'hsla(35, 30%, 45%, 0.7)',
  // Act 15 — The Phenomenologist Collection (perception/sensory spectrum)
  phenomenologist_raw_data:           'hsla(220, 25%, 50%, 0.6)',
  phenomenologist_audio_zoom:         'hsla(200, 30%, 55%, 0.6)',
  phenomenologist_blind_walk:         'hsla(0, 0%, 15%, 0.5)',
  phenomenologist_taste_explode:      'hsla(30, 50%, 50%, 0.6)',
  phenomenologist_temperature_scan:   'hsla(10, 50%, 50%, 0.6)',
  phenomenologist_proprioception_check: 'hsla(180, 30%, 50%, 0.6)',
  phenomenologist_color_deconstruct:  'hsla(280, 25%, 50%, 0.6)',
  phenomenologist_olfactory_hunt:     'hsla(30, 25%, 45%, 0.5)',
  phenomenologist_micro_texture:      'hsla(25, 15%, 45%, 0.5)',
  phenomenologist_perception_seal:    'hsla(220, 25%, 55%, 0.7)',
  // Act 16 — The Alchemist II Collection (transmutation/alchemy spectrum)
  alchemistii_anger_forge:           'hsla(5, 55%, 45%, 0.6)',
  alchemistii_grief_garden:          'hsla(280, 30%, 45%, 0.5)',
  alchemistii_fear_fuel:             'hsla(15, 60%, 50%, 0.6)',
  alchemistii_envy_map:              'hsla(120, 35%, 40%, 0.5)',
  alchemistii_boredom_portal:        'hsla(0, 0%, 35%, 0.4)',
  alchemistii_anxiety_anchor:        'hsla(250, 35%, 50%, 0.5)',
  alchemistii_regret_compost:        'hsla(25, 20%, 35%, 0.5)',
  alchemistii_shame_solvent:         'hsla(270, 20%, 35%, 0.5)',
  alchemistii_rejection_ricochet:    'hsla(20, 50%, 45%, 0.6)',
  alchemistii_alchemy_seal:          'hsla(45, 55%, 52%, 0.7)',
  // Act 17 — The Servant Leader Collection (authority/service blue-gold)
  servantleader_ego_check:           'hsla(220, 20%, 45%, 0.5)',
  servantleader_power_transfer:      'hsla(45, 40%, 55%, 0.5)',
  servantleader_silence_of_command:  'hsla(0, 0%, 45%, 0.4)',
  servantleader_praise_laser:        'hsla(45, 45%, 55%, 0.55)',
  servantleader_responsibility_take: 'hsla(220, 25%, 42%, 0.5)',
  servantleader_vision_cast:         'hsla(45, 35%, 52%, 0.5)',
  servantleader_servant_bow:         'hsla(30, 25%, 48%, 0.5)',
  servantleader_conflict_dissolve:   'hsla(120, 30%, 42%, 0.5)',
  servantleader_quiet_mentor:        'hsla(120, 25%, 40%, 0.45)',
  servantleader_leader_seal:         'hsla(220, 30%, 48%, 0.65)',
  // Act 18 — The Omega Point Collection (convergence cosmic-purple to unity-gold)
  omegapoint_dot_connector:          'hsla(270, 30%, 48%, 0.5)',
  omegapoint_binary_breaker:         'hsla(45, 45%, 52%, 0.55)',
  omegapoint_return_to_zero:         'hsla(0, 0%, 50%, 0.4)',
  omegapoint_synthesis:              'hsla(45, 50%, 55%, 0.55)',
  omegapoint_system_view:            'hsla(120, 25%, 42%, 0.5)',
  omegapoint_paradox_hold:           'hsla(270, 25%, 45%, 0.5)',
  omegapoint_pattern_match:          'hsla(30, 30%, 48%, 0.5)',
  omegapoint_fourth_wall:            'hsla(120, 30%, 42%, 0.5)',
  omegapoint_omega_pulse:            'hsla(45, 40%, 58%, 0.6)',
  omegapoint_convergence_seal:       'hsla(45, 45%, 55%, 0.7)',
  // Act 19 — The Source Collection (consciousness white to transcendence gold)
  source_i_am:                       'hsla(45, 35%, 55%, 0.55)',
  source_stardust_check:             'hsla(40, 40%, 52%, 0.55)',
  source_final_breath:               'hsla(0, 0%, 60%, 0.45)',
  source_unity:                      'hsla(200, 25%, 48%, 0.5)',
  source_infinite_loop:              'hsla(270, 25%, 48%, 0.5)',
  source_awakening:                  'hsla(45, 30%, 52%, 0.55)',
  source_void:                       'hsla(0, 0%, 20%, 0.35)',
  source_light_body:                 'hsla(45, 40%, 55%, 0.55)',
  source_universal_hum:              'hsla(270, 25%, 50%, 0.5)',
  source_source_seal:                'hsla(45, 45%, 58%, 0.7)',
  // Act 20 — The Stoic Collection (iron gray to fortress stone)
  stoic_citadel_visualization:       'hsla(140, 12%, 35%, 0.45)',
  stoic_voluntary_discomfort:        'hsla(200, 20%, 40%, 0.5)',
  stoic_view_from_above:             'hsla(210, 15%, 42%, 0.5)',
  stoic_negative_visualization:      'hsla(30, 10%, 38%, 0.45)',
  stoic_control_dichotomy:           'hsla(140, 15%, 38%, 0.45)',
  stoic_obstacle_flip:               'hsla(140, 18%, 38%, 0.5)',
  stoic_memento_mori:                'hsla(30, 8%, 35%, 0.4)',
  stoic_inner_citadel:               'hsla(210, 10%, 38%, 0.45)',
  stoic_amor_fati:                   'hsla(25, 25%, 45%, 0.5)',
  stoic_stoic_seal:                  'hsla(210, 12%, 40%, 0.55)',
  // Act 21 — The Lover Collection (rose, crimson, warm amber)
  lover_armor_drop:                  'hsla(15, 25%, 50%, 0.5)',
  lover_30_second_gaze:              'hsla(350, 25%, 48%, 0.5)',
  lover_desire_audit:                'hsla(42, 35%, 50%, 0.5)',
  lover_sacred_touch:                'hsla(15, 25%, 50%, 0.5)',
  lover_listening_ear:               'hsla(350, 22%, 48%, 0.45)',
  lover_jealousy_transmute:          'hsla(42, 30%, 48%, 0.5)',
  lover_secret_share:                'hsla(42, 30%, 48%, 0.5)',
  lover_sex_spirit_bridge:           'hsla(310, 25%, 48%, 0.5)',
  lover_partner_breath:              'hsla(350, 20%, 48%, 0.5)',
  lover_union_seal:                  'hsla(280, 18%, 48%, 0.55)',
  // Act 22 — The Athlete Collection (electric blue, oxygen white, muscle crimson, vitality gold)
  athlete_oxygen_flood:              'hsla(200, 30%, 50%, 0.5)',
  athlete_fascia_release:            'hsla(150, 20%, 45%, 0.45)',
  athlete_movement_snack:            'hsla(30, 30%, 50%, 0.5)',
  athlete_sleep_gate:                'hsla(250, 15%, 40%, 0.45)',
  athlete_cold_shock:                'hsla(200, 25%, 50%, 0.5)',
  athlete_fuel_check:                'hsla(35, 25%, 48%, 0.5)',
  athlete_posture_reset:             'hsla(180, 15%, 45%, 0.45)',
  athlete_pain_cave:                 'hsla(45, 20%, 45%, 0.5)',
  athlete_heart_coherence:           'hsla(0, 20%, 48%, 0.5)',
  athlete_vitality_seal:             'hsla(0, 18%, 48%, 0.55)',
  // Act 23 — The Strategist Collection (gold, graphite, money-green, vault-steel)
  strategist_value_exchange:         'hsla(42, 22%, 48%, 0.5)',
  strategist_essentialism_filter:    'hsla(160, 18%, 45%, 0.45)',
  strategist_compound_interest:      'hsla(150, 22%, 45%, 0.5)',
  strategist_deep_work_bunker:       'hsla(220, 18%, 45%, 0.5)',
  strategist_negotiation_pause:      'hsla(42, 20%, 45%, 0.5)',
  strategist_abundance_scan:         'hsla(180, 18%, 45%, 0.45)',
  strategist_leverage_lever:         'hsla(35, 20%, 48%, 0.5)',
  strategist_specific_knowledge:     'hsla(270, 18%, 48%, 0.5)',
  strategist_permissionless_build:   'hsla(140, 22%, 45%, 0.5)',
  strategist_wealth_seal:            'hsla(42, 25%, 52%, 0.55)',
  // Act 25 — The Wilding Collection (forest green, frost blue, ember orange, soil brown)
  wilding_cold_switch:               'hsla(200, 25%, 55%, 0.5)',
  wilding_fire_watch:                'hsla(25, 28%, 48%, 0.5)',
  wilding_panoramic_soften:          'hsla(180, 18%, 45%, 0.45)',
  wilding_terpene_inhale:            'hsla(140, 20%, 42%, 0.5)',
  wilding_lunar_pull:                'hsla(42, 20%, 48%, 0.5)',
  wilding_dark_anchor:               'hsla(270, 15%, 42%, 0.5)',
  wilding_barefoot_step:             'hsla(120, 18%, 38%, 0.5)',
  wilding_storm_breathe:             'hsla(220, 22%, 40%, 0.5)',
  wilding_feral_howl:                'hsla(15, 25%, 42%, 0.5)',
  wilding_wild_seal:                 'hsla(30, 18%, 42%, 0.55)',
  // Act 26 — The Guardian Collection (warm gold, gentle lavender, heartbeat rose, protective navy)
  guardian_big_feeling:              'hsla(210, 18%, 50%, 0.5)',
  guardian_co_regulation:            'hsla(210, 15%, 48%, 0.5)',
  guardian_good_enough:              'hsla(42, 22%, 50%, 0.5)',
  guardian_repair_ritual:            'hsla(42, 20%, 48%, 0.5)',
  guardian_transition_buffer:        'hsla(260, 14%, 45%, 0.45)',
  guardian_boundary_hug:             'hsla(42, 18%, 46%, 0.5)',
  guardian_safe_container:            'hsla(200, 16%, 46%, 0.5)',
  guardian_gentle_no:                'hsla(260, 12%, 44%, 0.5)',
  guardian_bedtime_blessing:         'hsla(240, 14%, 42%, 0.5)',
  guardian_seal:                     'hsla(340, 18%, 48%, 0.55)',
  // Act 27 — The Futurist Collection (electric blue, signal red, matte black, circuit green)
  futurist_notification_nuke:        'hsla(0, 45%, 45%, 0.5)',
  futurist_input_diet:               'hsla(160, 18%, 42%, 0.5)',
  futurist_human_handshake:          'hsla(25, 15%, 42%, 0.5)',
  futurist_doomscroll_brake:         'hsla(25, 15%, 40%, 0.5)',
  futurist_analog_switch:            'hsla(35, 15%, 40%, 0.5)',
  futurist_deep_read:                'hsla(0, 0%, 40%, 0.45)',
  futurist_phantom_check:            'hsla(260, 15%, 42%, 0.5)',
  futurist_mono_task:                'hsla(42, 18%, 42%, 0.5)',
  futurist_comparison_blocker:       'hsla(300, 12%, 40%, 0.45)',
  futurist_disconnect_seal:          'hsla(210, 18%, 48%, 0.55)',
  // Act 27 — Mystic (cosmic indigo / quantum violet)
  mystic_no_self:                    'hsla(260, 20%, 42%, 0.5)',
  mystic_now_point:                  'hsla(45, 15%, 42%, 0.5)',
  mystic_deathbed:                   'hsla(0, 0%, 50%, 0.45)',
  mystic_entanglement_check:         'hsla(260, 18%, 38%, 0.5)',
  mystic_wave_collapse:              'hsla(280, 18%, 42%, 0.5)',
  mystic_hologram:                   'hsla(275, 15%, 40%, 0.5)',
  mystic_frequency_tune:             'hsla(140, 15%, 38%, 0.5)',
  mystic_maya_veil:                  'hsla(45, 15%, 38%, 0.5)',
  mystic_universal_hum:              'hsla(280, 15%, 40%, 0.5)',
  mystic_quantum_seal:               'hsla(265, 22%, 45%, 0.55)',
  // Act 28 — Infinite Player (playful warm hues)
  infinite_cosmic_joke:              'hsla(45, 22%, 48%, 0.5)',
  infinite_absurdity_check:          'hsla(0, 18%, 45%, 0.5)',
  infinite_game_reset:               'hsla(120, 18%, 38%, 0.5)',
  infinite_dance_break:              'hsla(320, 18%, 42%, 0.5)',
  infinite_beginners_mind:           'hsla(0, 0%, 45%, 0.45)',
  infinite_pure_yes:                 'hsla(140, 20%, 40%, 0.5)',
  infinite_wonder_walk:              'hsla(35, 20%, 42%, 0.5)',
  infinite_unplanned_hour:           'hsla(0, 0%, 40%, 0.45)',
  infinite_laugh_track:              'hsla(350, 20%, 42%, 0.5)',
  infinite_infinite_seal:            'hsla(280, 18%, 48%, 0.55)',
  // Act 29 — Reality Bender (mercury / iridescent / warped glass)
  bender_reality_distortion:         'hsla(220, 12%, 48%, 0.5)',
  bender_timeline_jump:              'hsla(45, 22%, 45%, 0.5)',
  bender_luck_surface:               'hsla(200, 15%, 42%, 0.5)',
  bender_atmosphere_engineer:        'hsla(35, 18%, 42%, 0.5)',
  bender_narrative_override:         'hsla(0, 22%, 42%, 0.5)',
  bender_future_memory:              'hsla(35, 15%, 38%, 0.5)',
  bender_silence_weapon:             'hsla(220, 10%, 38%, 0.45)',
  bender_invisible_hand:             'hsla(260, 12%, 40%, 0.5)',
  bender_belief_bridge:              'hsla(280, 15%, 45%, 0.5)',
  bender_bender_seal:                'hsla(280, 18%, 50%, 0.55)',
  // Act 30 — Magnet (deep iron purple / attraction gold)
  magnet_reverse_orbit:              'hsla(270, 15%, 42%, 0.5)',
  magnet_mystery_gap:                'hsla(270, 12%, 38%, 0.5)',
  magnet_whisper_frequency:          'hsla(220, 15%, 42%, 0.5)',
  magnet_velvet_rope:                'hsla(42, 22%, 42%, 0.5)',
  magnet_specific_praise:            'hsla(42, 18%, 38%, 0.5)',
  magnet_warmth_competence:          'hsla(42, 20%, 40%, 0.5)',
  magnet_lighthouse_mode:            'hsla(42, 25%, 45%, 0.5)',
  magnet_yes_and_spiral:             'hsla(270, 12%, 40%, 0.5)',
  magnet_detachment_power:           'hsla(270, 15%, 40%, 0.5)',
  magnet_magnet_seal:                'hsla(42, 25%, 48%, 0.55)',
  // Act 31 — Oracle (third-eye indigo / amber sight)
  oracle_pattern_before_pattern:     'hsla(250, 18%, 42%, 0.5)',
  oracle_body_compass:               'hsla(35, 18%, 40%, 0.5)',
  oracle_first_three_seconds:        'hsla(250, 15%, 38%, 0.5)',
  oracle_information_fast:           'hsla(0, 0%, 40%, 0.45)',
  oracle_signal_in_noise:            'hsla(250, 20%, 44%, 0.5)',
  oracle_danger_beautiful:           'hsla(0, 18%, 42%, 0.5)',
  oracle_question_upgrade:           'hsla(35, 22%, 42%, 0.5)',
  oracle_pre_mortem:                 'hsla(250, 12%, 36%, 0.45)',
  oracle_contrarian_proof:           'hsla(35, 15%, 38%, 0.5)',
  oracle_oracle_seal:                'hsla(35, 22%, 48%, 0.55)',
  // Act 32 — Maestro (concert black / brass gold)
  maestro_crescendo:                 'hsla(45, 25%, 38%, 0.5)',
  maestro_pause_as_currency:         'hsla(0, 0%, 35%, 0.45)',
  maestro_emotional_score:           'hsla(45, 20%, 36%, 0.5)',
  maestro_stage_presence:            'hsla(45, 22%, 40%, 0.5)',
  maestro_tempo_control:             'hsla(0, 0%, 38%, 0.45)',
  maestro_mirror_match:              'hsla(45, 18%, 38%, 0.5)',
  maestro_callback:                  'hsla(45, 15%, 36%, 0.5)',
  maestro_tension_arc:               'hsla(0, 12%, 38%, 0.5)',
  maestro_standing_ovation:          'hsla(45, 25%, 42%, 0.5)',
  maestro_maestro_seal:              'hsla(45, 30%, 48%, 0.55)',
  // Act 33 — Shaman (ochre earth / sage smoke)
  shaman_ancestor_call:              'hsla(28, 22%, 38%, 0.5)',
  shaman_plant_medicine:             'hsla(120, 8%, 35%, 0.45)',
  shaman_drum_circle:                'hsla(28, 20%, 36%, 0.5)',
  shaman_sacred_fire:                'hsla(15, 25%, 38%, 0.5)',
  shaman_bone_reading:               'hsla(28, 18%, 34%, 0.5)',
  shaman_shadow_walk:                'hsla(28, 12%, 30%, 0.45)',
  shaman_water_blessing:             'hsla(200, 10%, 35%, 0.45)',
  shaman_spirit_animal:              'hsla(28, 22%, 36%, 0.5)',
  shaman_vision_quest:               'hsla(28, 20%, 38%, 0.5)',
  shaman_shaman_seal:                'hsla(120, 8%, 40%, 0.55)',
  // Act 34 — Stargazer (deep space navy / nebula violet)
  stargazer_north_star:              'hsla(230, 18%, 38%, 0.5)',
  stargazer_orbit_check:             'hsla(260, 15%, 36%, 0.45)',
  stargazer_gravity_assist:          'hsla(230, 20%, 40%, 0.5)',
  stargazer_eclipse:                 'hsla(45, 20%, 35%, 0.45)',
  stargazer_constellation:           'hsla(280, 15%, 38%, 0.5)',
  stargazer_event_horizon:           'hsla(230, 22%, 32%, 0.5)',
  stargazer_supernova:               'hsla(280, 20%, 40%, 0.55)',
  stargazer_dark_matter:             'hsla(230, 15%, 35%, 0.45)',
  stargazer_light_speed:             'hsla(230, 18%, 42%, 0.5)',
  stargazer_stargazer_seal:          'hsla(280, 18%, 42%, 0.55)',
  // Act 35 — Myth Maker (ancient gold / parchment cream)
  mythmaker_incantation:             'hsla(42, 22%, 42%, 0.5)',
  mythmaker_retcon:                  'hsla(35, 18%, 40%, 0.45)',
  mythmaker_heros_call:              'hsla(42, 25%, 44%, 0.5)',
  mythmaker_villains_mask:           'hsla(35, 15%, 38%, 0.45)',
  mythmaker_plot_twist:              'hsla(42, 20%, 42%, 0.5)',
  mythmaker_mentor_summon:           'hsla(35, 18%, 44%, 0.5)',
  mythmaker_chekhovs_gun:            'hsla(42, 22%, 40%, 0.5)',
  mythmaker_fourth_wall:             'hsla(35, 16%, 42%, 0.45)',
  mythmaker_cliffhanger:             'hsla(42, 18%, 38%, 0.45)',
  mythmaker_mythic_seal:             'hsla(42, 25%, 46%, 0.55)',
  // Act 36 — Shape Shifter (chrome silver / iridescent)
  shapeshifter_mirror_shift:         'hsla(210, 6%, 45%, 0.45)',
  shapeshifter_skin_shed:            'hsla(300, 12%, 42%, 0.45)',
  shapeshifter_camouflage:           'hsla(210, 8%, 40%, 0.45)',
  shapeshifter_metamorphosis:        'hsla(300, 10%, 44%, 0.5)',
  shapeshifter_doppelganger:         'hsla(210, 6%, 42%, 0.45)',
  shapeshifter_costume:              'hsla(300, 12%, 40%, 0.45)',
  shapeshifter_chimera:              'hsla(210, 8%, 44%, 0.5)',
  shapeshifter_proteus:              'hsla(300, 10%, 42%, 0.45)',
  shapeshifter_chrysalis:            'hsla(210, 6%, 38%, 0.45)',
  shapeshifter_shifter_seal:         'hsla(300, 14%, 46%, 0.55)',
  // Act 37 — Dream Walker (deep indigo / bioluminescent cyan)
  dreamwalker_lucid_entry:           'hsla(245, 22%, 35%, 0.45)',
  dreamwalker_sleep_architect:       'hsla(185, 18%, 38%, 0.45)',
  dreamwalker_night_terrain:         'hsla(245, 20%, 32%, 0.45)',
  dreamwalker_sleep_paralysis:       'hsla(185, 16%, 36%, 0.5)',
  dreamwalker_recurring_door:        'hsla(245, 18%, 34%, 0.45)',
  dreamwalker_dream_journal:         'hsla(185, 20%, 40%, 0.45)',
  dreamwalker_somnambulant:          'hsla(245, 22%, 30%, 0.45)',
  dreamwalker_hypnagogic_edge:       'hsla(185, 18%, 35%, 0.5)',
  dreamwalker_dream_symbol:          'hsla(245, 20%, 36%, 0.45)',
  dreamwalker_walker_seal:           'hsla(185, 22%, 42%, 0.55)',
  // Act 38 — Magnum Opus (crucible amber / alchemical gold)
  magnumopus_prima_materia:          'hsla(30, 28%, 35%, 0.45)',
  magnumopus_crucible:               'hsla(48, 30%, 40%, 0.5)',
  magnumopus_lead_to_gold:           'hsla(30, 25%, 32%, 0.45)',
  magnumopus_philosophers_stone:     'hsla(48, 32%, 42%, 0.5)',
  magnumopus_solve:                  'hsla(30, 22%, 30%, 0.45)',
  magnumopus_coagula:                'hsla(48, 28%, 38%, 0.45)',
  magnumopus_athanor:                'hsla(30, 30%, 33%, 0.5)',
  magnumopus_tincture:               'hsla(48, 25%, 36%, 0.45)',
  magnumopus_ouroboros:              'hsla(30, 26%, 34%, 0.45)',
  magnumopus_opus_seal:              'hsla(48, 35%, 45%, 0.55)',
  // Act 39 — Prism (crystal glass / spectral violet)
  prism_refraction:                  'hsla(280, 22%, 42%, 0.45)',
  prism_transparency:                'hsla(220, 12%, 35%, 0.45)',
  prism_laser_focus:                 'hsla(0, 40%, 40%, 0.45)',
  prism_afterimage:                  'hsla(280, 25%, 38%, 0.5)',
  prism_blind_spot:                  'hsla(280, 20%, 40%, 0.45)',
  prism_focal_length:                'hsla(220, 15%, 32%, 0.45)',
  prism_shadow_cast:                 'hsla(45, 30%, 38%, 0.45)',
  prism_bioluminescence:             'hsla(195, 35%, 35%, 0.5)',
  prism_infrared:                    'hsla(0, 25%, 35%, 0.45)',
  prism_prism_seal:                  'hsla(280, 25%, 45%, 0.55)',
  // Act 40 — Graviton (iron dark / gravitational blue)
  graviton_heavy_object:             'hsla(220, 8%, 28%, 0.45)',
  graviton_escape_velocity:          'hsla(200, 15%, 35%, 0.5)',
  graviton_binary_star:              'hsla(200, 18%, 32%, 0.45)',
  graviton_black_hole:               'hsla(220, 6%, 15%, 0.5)',
  graviton_tidal_force:              'hsla(200, 12%, 30%, 0.45)',
  graviton_inverse_square:           'hsla(200, 15%, 34%, 0.45)',
  graviton_center_of_mass:           'hsla(200, 12%, 28%, 0.45)',
  graviton_roche_limit:              'hsla(0, 20%, 30%, 0.45)',
  graviton_dark_star:                'hsla(220, 10%, 22%, 0.45)',
  graviton_gravity_seal:             'hsla(200, 18%, 38%, 0.55)',
  // Act 41 — Observer (probability purple / superposition teal)
  observer_schrodingers_box:         'hsla(260, 12%, 32%, 0.45)',
  observer_wave_collapse:            'hsla(180, 18%, 35%, 0.5)',
  observer_spooky_action:            'hsla(260, 15%, 35%, 0.45)',
  observer_quantum_tunnel:           'hsla(180, 20%, 32%, 0.45)',
  observer_uncertainty_blur:         'hsla(260, 10%, 30%, 0.45)',
  observer_many_worlds:              'hsla(180, 15%, 33%, 0.45)',
  observer_retrocausality:           'hsla(260, 14%, 34%, 0.45)',
  observer_zero_point:               'hsla(180, 18%, 30%, 0.45)',
  observer_double_slit:              'hsla(260, 12%, 28%, 0.45)',
  observer_observer_seal:            'hsla(180, 22%, 40%, 0.55)',
  // Act 42 — Time Capsule (capsule amber / archive gold)
  timecapsule_open_when_seal:        'hsla(35, 22%, 32%, 0.45)',
  timecapsule_drift_bottle:          'hsla(42, 25%, 35%, 0.5)',
  timecapsule_rage_vault:            'hsla(0, 18%, 30%, 0.45)',
  timecapsule_prediction_stake:      'hsla(35, 20%, 30%, 0.45)',
  timecapsule_success_jar:           'hsla(42, 28%, 38%, 0.5)',
  timecapsule_ten_year_echo:         'hsla(35, 18%, 28%, 0.45)',
  timecapsule_crisis_kit:            'hsla(0, 15%, 28%, 0.45)',
  timecapsule_wine_cellar:           'hsla(30, 22%, 30%, 0.45)',
  timecapsule_dead_mans_switch:      'hsla(35, 16%, 26%, 0.45)',
  timecapsule_capsule_seal:          'hsla(42, 28%, 42%, 0.55)',
  // Act 43 — Loop Breaker (loop silver / circuit green)
  loopbreaker_iteration_counter:     'hsla(210, 8%, 35%, 0.45)',
  loopbreaker_trigger_map:           'hsla(140, 12%, 30%, 0.45)',
  loopbreaker_glitch_injection:      'hsla(210, 10%, 38%, 0.5)',
  loopbreaker_exit_ramp:             'hsla(140, 15%, 32%, 0.45)',
  loopbreaker_reward_audit:          'hsla(210, 6%, 32%, 0.45)',
  loopbreaker_double_loop:           'hsla(140, 12%, 28%, 0.45)',
  loopbreaker_spiral_check:          'hsla(210, 8%, 36%, 0.45)',
  loopbreaker_friction_add:          'hsla(140, 10%, 30%, 0.45)',
  loopbreaker_new_groove:            'hsla(210, 10%, 34%, 0.45)',
  loopbreaker_breaker_seal:          'hsla(140, 15%, 36%, 0.55)',
  // Act 44 — Retro-Causal (celluloid warm / edit blue)
  retrocausal_memory_rescore:        'hsla(30, 18%, 30%, 0.45)',
  retrocausal_deleted_scene:         'hsla(205, 18%, 32%, 0.5)',
  retrocausal_prequel:               'hsla(30, 15%, 28%, 0.45)',
  retrocausal_color_grade:           'hsla(205, 20%, 35%, 0.45)',
  retrocausal_narrative_flip:        'hsla(30, 16%, 30%, 0.45)',
  retrocausal_forgiveness_filter:    'hsla(205, 15%, 30%, 0.45)',
  retrocausal_time_travel_rescue:    'hsla(30, 20%, 32%, 0.5)',
  retrocausal_metadata_edit:         'hsla(205, 18%, 33%, 0.45)',
  retrocausal_ancestral_cut:         'hsla(0, 15%, 28%, 0.45)',
  retrocausal_retro_seal:            'hsla(30, 22%, 36%, 0.55)',
  // Act 45 — Threshold (threshold obsidian / liminal violet)
  threshold_doorway:                 'hsla(270, 15%, 26%, 0.45)',
  threshold_in_between:              'hsla(285, 18%, 30%, 0.45)',
  threshold_dawn_watch:              'hsla(270, 12%, 28%, 0.45)',
  threshold_breath_gap:              'hsla(285, 20%, 34%, 0.5)',
  threshold_chrysalis_wait:          'hsla(270, 14%, 30%, 0.45)',
  threshold_tidal_zone:              'hsla(285, 16%, 28%, 0.45)',
  threshold_question_mark:           'hsla(270, 18%, 32%, 0.5)',
  threshold_dusk_walk:               'hsla(285, 14%, 30%, 0.45)',
  threshold_hinge_point:             'hsla(270, 16%, 28%, 0.45)',
  threshold_threshold_seal:          'hsla(280, 20%, 36%, 0.55)',
  // Act 46 — Soma (flesh warm / nerve electric)
  soma_body_radar:                   'hsla(15, 20%, 28%, 0.45)',
  soma_gut_signal:                   'hsla(45, 16%, 30%, 0.45)',
  soma_skin_map:                     'hsla(15, 18%, 30%, 0.45)',
  soma_pulse_reader:                 'hsla(45, 18%, 34%, 0.5)',
  soma_joint_unlock:                 'hsla(15, 16%, 28%, 0.45)',
  soma_fascia_wave:                  'hsla(45, 14%, 30%, 0.45)',
  soma_voice_box:                    'hsla(15, 20%, 32%, 0.5)',
  soma_balance_point:                'hsla(45, 16%, 28%, 0.45)',
  soma_cell_memory:                  'hsla(15, 18%, 30%, 0.45)',
  soma_soma_seal:                    'hsla(30, 22%, 36%, 0.55)',
  // Act 47 — Frequency (wave silver / harmonic gold)
  frequency_baseline_hum:            'hsla(210, 12%, 28%, 0.45)',
  frequency_dissonance_detector:     'hsla(48, 18%, 30%, 0.45)',
  frequency_harmony_map:             'hsla(210, 10%, 30%, 0.45)',
  frequency_octave_jump:             'hsla(48, 20%, 34%, 0.5)',
  frequency_standing_wave:           'hsla(210, 14%, 28%, 0.45)',
  frequency_interference_pattern:    'hsla(48, 16%, 30%, 0.45)',
  frequency_overtone:                'hsla(210, 12%, 32%, 0.5)',
  frequency_phase_lock:              'hsla(48, 14%, 28%, 0.45)',
  frequency_resonant_cavity:         'hsla(210, 10%, 30%, 0.45)',
  frequency_frequency_seal:          'hsla(230, 20%, 36%, 0.55)',
  // Act 48 — Tuner (tuning fork silver / frequency indigo)
  tuner_delta_drop:                  'hsla(230, 20%, 28%, 0.45)',
  tuner_gamma_spike:                 'hsla(45, 35%, 40%, 0.5)',
  tuner_haptic_pacer:                'hsla(200, 12%, 32%, 0.45)',
  tuner_vagal_hum:                   'hsla(230, 22%, 35%, 0.5)',
  tuner_isochronic_focus:            'hsla(200, 10%, 30%, 0.45)',
  tuner_heart_coherence:             'hsla(230, 18%, 32%, 0.45)',
  tuner_brown_noise:                 'hsla(200, 8%, 28%, 0.45)',
  tuner_bilateral_tap:               'hsla(230, 20%, 38%, 0.5)',
  tuner_solfeggio_528:               'hsla(140, 20%, 32%, 0.45)',
  tuner_tuner_seal:                  'hsla(230, 25%, 42%, 0.55)',
  // Act 49 — Broadcast (broadcast amber / signal rose)
  broadcast_circadian_tint:          'hsla(25, 20%, 30%, 0.45)',
  broadcast_subliminal_pulse:        'hsla(340, 15%, 32%, 0.45)',
  broadcast_haptic_heartbeat:        'hsla(340, 18%, 35%, 0.5)',
  broadcast_color_bath:              'hsla(350, 22%, 38%, 0.5)',
  broadcast_silent_timer:            'hsla(25, 18%, 28%, 0.45)',
  broadcast_digital_candle:          'hsla(30, 22%, 32%, 0.45)',
  broadcast_presence_radar:          'hsla(140, 15%, 30%, 0.45)',
  broadcast_weather_window:          'hsla(25, 15%, 30%, 0.45)',
  broadcast_rhythm_background:       'hsla(340, 14%, 30%, 0.45)',
  broadcast_broadcast_seal:          'hsla(25, 22%, 36%, 0.55)',
  // Act 50 — The Schrödinger Box (probability-teal spectrum)
  schrodinger_mystery_box:           'hsla(265, 18%, 28%, 0.5)',
  schrodinger_parallel_self:         'hsla(175, 22%, 32%, 0.5)',
  schrodinger_dice_roll:             'hsla(265, 14%, 30%, 0.5)',
  schrodinger_many_worlds_map:       'hsla(175, 18%, 34%, 0.5)',
  schrodinger_quantum_coin:          'hsla(265, 16%, 32%, 0.5)',
  schrodinger_random_act:            'hsla(175, 20%, 30%, 0.5)',
  schrodinger_blur:                  'hsla(265, 12%, 34%, 0.5)',
  schrodinger_oracle_deck:           'hsla(175, 16%, 32%, 0.5)',
  schrodinger_double_slit:           'hsla(265, 20%, 30%, 0.5)',
  schrodinger_box_seal:              'hsla(175, 24%, 36%, 0.55)',
  // Act 51 — The Glitch (terminal-green / error-red spectrum)
  glitch_fourth_wall_break:          'hsla(140, 15%, 28%, 0.5)',
  glitch_wrong_button:               'hsla(0, 30%, 35%, 0.5)',
  glitch_reverse_text:               'hsla(140, 12%, 30%, 0.5)',
  glitch_lag_spike:                  'hsla(0, 25%, 32%, 0.5)',
  glitch_blue_screen:                'hsla(140, 18%, 26%, 0.5)',
  glitch_fake_notification:          'hsla(0, 35%, 38%, 0.5)',
  glitch_pixelated_self:             'hsla(140, 10%, 32%, 0.5)',
  glitch_loop_crash:                 'hsla(0, 28%, 34%, 0.5)',
  glitch_reality_tear:               'hsla(140, 14%, 28%, 0.5)',
  glitch_glitch_seal:                'hsla(0, 32%, 36%, 0.55)',
  // Act 52 — The Architect (Construct) (sandstone/copper spectrum)
  construct_foundation_stone:        'hsla(30, 18%, 28%, 0.5)',
  construct_grief_cairn:             'hsla(25, 22%, 30%, 0.5)',
  construct_memory_palace:           'hsla(30, 16%, 32%, 0.5)',
  construct_zen_garden:              'hsla(25, 20%, 28%, 0.5)',
  construct_fear_vault:              'hsla(30, 14%, 30%, 0.5)',
  construct_council_table:           'hsla(25, 24%, 32%, 0.5)',
  construct_lighthouse:              'hsla(30, 18%, 34%, 0.5)',
  construct_workbench:               'hsla(25, 16%, 30%, 0.5)',
  construct_greenhouse:              'hsla(30, 20%, 28%, 0.5)',
  construct_architect_seal:          'hsla(25, 26%, 36%, 0.55)',
  // Act 53 — The Biographer (Mythos) (sepia/gold spectrum)
  biographer_origin_story:           'hsla(35, 14%, 28%, 0.5)',
  biographer_character_sheet:        'hsla(42, 20%, 32%, 0.5)',
  biographer_third_person_shift:     'hsla(35, 12%, 30%, 0.5)',
  biographer_yet_append:             'hsla(42, 18%, 28%, 0.5)',
  biographer_antagonist_audit:       'hsla(35, 16%, 32%, 0.5)',
  biographer_plot_twist:             'hsla(42, 22%, 30%, 0.5)',
  biographer_future_memoir:          'hsla(35, 14%, 34%, 0.5)',
  biographer_genre_switch:           'hsla(42, 16%, 28%, 0.5)',
  biographer_supporting_cast:        'hsla(35, 18%, 30%, 0.5)',
  biographer_mythos_seal:            'hsla(42, 24%, 36%, 0.55)',
  // Optician Collection — clinical ice-blue tones
  optician_prescription_check:       'hsla(200, 20%, 40%, 0.5)',
  optician_frame_crop:               'hsla(195, 18%, 38%, 0.5)',
  optician_filter_scrub:             'hsla(200, 22%, 36%, 0.5)',
  optician_inversion_goggles:        'hsla(195, 16%, 42%, 0.5)',
  optician_focus_pull:               'hsla(200, 20%, 34%, 0.5)',
  optician_contrast_adjust:          'hsla(195, 22%, 40%, 0.5)',
  optician_peripheral_scan:          'hsla(200, 18%, 38%, 0.5)',
  optician_broken_mirror:            'hsla(195, 16%, 36%, 0.5)',
  optician_night_vision:             'hsla(200, 22%, 32%, 0.5)',
  optician_seal:                     'hsla(195, 24%, 44%, 0.55)',
  // Interpreter Collection — warm terracotta-amber tones
  interpreter_subtext_scanner:       'hsla(15, 20%, 38%, 0.5)',
  interpreter_villain_de_mask:       'hsla(32, 18%, 36%, 0.5)',
  interpreter_ladder_of_inference:   'hsla(15, 22%, 40%, 0.5)',
  interpreter_benefit_of_doubt:      'hsla(32, 16%, 34%, 0.5)',
  interpreter_translation_ear:       'hsla(15, 20%, 42%, 0.5)',
  interpreter_third_chair:           'hsla(32, 22%, 38%, 0.5)',
  interpreter_pause_button:          'hsla(15, 18%, 36%, 0.5)',
  interpreter_steel_man:             'hsla(32, 20%, 34%, 0.5)',
  interpreter_mirror_neurons:        'hsla(15, 22%, 40%, 0.5)',
  interpreter_seal:                  'hsla(32, 24%, 42%, 0.55)',
  // Social Physics Collection — gunmetal-steel/aikido-teal tones
  socialphysics_energy_redirect:     'hsla(175, 20%, 38%, 0.5)',
  socialphysics_status_see_saw:      'hsla(215, 14%, 36%, 0.5)',
  socialphysics_silent_mirror:       'hsla(175, 18%, 36%, 0.5)',
  socialphysics_values_compass:      'hsla(215, 16%, 40%, 0.5)',
  socialphysics_empathy_bridge:      'hsla(175, 22%, 34%, 0.5)',
  socialphysics_boundary_forcefield: 'hsla(215, 12%, 38%, 0.5)',
  socialphysics_yes_and_weaver:      'hsla(175, 16%, 40%, 0.5)',
  socialphysics_trigger_disarm:      'hsla(215, 18%, 34%, 0.5)',
  socialphysics_perspective_drone:   'hsla(175, 20%, 36%, 0.5)',
  socialphysics_diplomat_seal:       'hsla(175, 24%, 42%, 0.55)',
  // Tribalist Collection — tribal-ochre/bonfire-amber tones
  tribalist_signal_fire:             'hsla(38, 22%, 38%, 0.5)',
  tribalist_circle_audit:            'hsla(25, 18%, 36%, 0.5)',
  tribalist_gift_loop:               'hsla(38, 24%, 40%, 0.5)',
  tribalist_role_call:               'hsla(25, 20%, 34%, 0.5)',
  tribalist_vulnerability_key:       'hsla(38, 18%, 36%, 0.5)',
  tribalist_social_battery:          'hsla(25, 22%, 38%, 0.5)',
  tribalist_echo_chamber_break:      'hsla(38, 16%, 34%, 0.5)',
  tribalist_ritual_maker:            'hsla(25, 24%, 40%, 0.5)',
  tribalist_gossip_firewall:         'hsla(38, 20%, 36%, 0.5)',
  tribalist_tribal_seal:             'hsla(38, 26%, 42%, 0.55)',
  // Valuator Collection — burnished gold/coin tones
  valuator_price_tag:                'hsla(42, 24%, 38%, 0.5)',
  valuator_sunk_cost_cut:            'hsla(45, 18%, 34%, 0.5)',
  valuator_asset_audit:              'hsla(42, 22%, 36%, 0.5)',
  valuator_inflation_check:          'hsla(45, 20%, 40%, 0.5)',
  valuator_opportunity_cost:         'hsla(42, 16%, 34%, 0.5)',
  valuator_energy_ledger:            'hsla(45, 22%, 38%, 0.5)',
  valuator_negotiation_table:        'hsla(42, 18%, 36%, 0.5)',
  valuator_scarcity_flip:            'hsla(45, 24%, 40%, 0.5)',
  valuator_quality_control:          'hsla(42, 20%, 34%, 0.5)',
  valuator_gold_standard:            'hsla(42, 28%, 44%, 0.55)',
  // Editor Collection — edit silver/signal blue tones
  editor_noise_gate:                 'hsla(200, 18%, 36%, 0.5)',
  editor_headline_rewrite:           'hsla(220, 12%, 34%, 0.5)',
  editor_algorithm_audit:            'hsla(200, 16%, 38%, 0.5)',
  editor_kill_your_darlings:         'hsla(220, 14%, 36%, 0.5)',
  editor_zoom_out:                   'hsla(200, 20%, 34%, 0.5)',
  editor_fact_check:                 'hsla(220, 10%, 38%, 0.5)',
  editor_continuity_fix:             'hsla(200, 18%, 36%, 0.5)',
  editor_mute_button:                'hsla(220, 12%, 34%, 0.5)',
  editor_color_grade:                'hsla(200, 22%, 38%, 0.5)',
  editor_final_cut:                  'hsla(200, 24%, 42%, 0.55)',
  // Grandmaster Collection — obsidian/checkmate gold tones
  grandmaster_meta_view:             'hsla(48, 20%, 36%, 0.5)',
  grandmaster_second_order:          'hsla(230, 8%, 28%, 0.5)',
  grandmaster_leverage_point:        'hsla(48, 18%, 34%, 0.5)',
  grandmaster_positive_sum:          'hsla(230, 6%, 26%, 0.5)',
  grandmaster_sunk_cost_eject:       'hsla(48, 22%, 38%, 0.5)',
  grandmaster_fog_of_war:            'hsla(230, 8%, 30%, 0.5)',
  grandmaster_tempo_control:         'hsla(48, 16%, 34%, 0.5)',
  grandmaster_inversion:             'hsla(230, 6%, 28%, 0.5)',
  grandmaster_optionality:           'hsla(48, 20%, 36%, 0.5)',
  grandmaster_grandmaster_seal:      'hsla(48, 24%, 40%, 0.55)',
  // Catalyst Collection — reaction indigo/catalyst violet tones
  catalyst_activation_energy:        'hsla(270, 14%, 36%, 0.5)',
  catalyst_mirroring_tune:           'hsla(240, 10%, 30%, 0.5)',
  catalyst_trojan_horse:             'hsla(270, 16%, 38%, 0.5)',
  catalyst_silence_vacuum:           'hsla(240, 8%, 28%, 0.5)',
  catalyst_label_inception:          'hsla(270, 14%, 36%, 0.5)',
  catalyst_vulnerability_drop:       'hsla(240, 10%, 30%, 0.5)',
  catalyst_but_to_and:               'hsla(270, 12%, 34%, 0.5)',
  catalyst_future_pace:              'hsla(240, 10%, 32%, 0.5)',
  catalyst_question_hook:            'hsla(270, 16%, 36%, 0.5)',
  catalyst_catalyst_seal:            'hsla(270, 18%, 42%, 0.55)',
  // Kinetic Collection — launch pad steel/ignition orange tones
  kinetic_inertia_break:             'hsla(25, 26%, 38%, 0.5)',
  kinetic_micro_step:                'hsla(220, 8%, 28%, 0.5)',
  kinetic_flow_trigger:              'hsla(25, 24%, 36%, 0.5)',
  kinetic_burn_rate:                 'hsla(220, 8%, 26%, 0.5)',
  kinetic_friction_polish:           'hsla(25, 28%, 38%, 0.5)',
  kinetic_pivot:                     'hsla(220, 10%, 28%, 0.5)',
  kinetic_momentum_save:             'hsla(25, 24%, 36%, 0.5)',
  kinetic_good_enough_ship:          'hsla(220, 8%, 26%, 0.5)',
  kinetic_rest_stop:                 'hsla(25, 26%, 38%, 0.5)',
  kinetic_kinetic_seal:              'hsla(25, 30%, 42%, 0.55)',
  // Adaptive Collection — biological green/resilience gold tones
  adaptive_elastic_snap:             'hsla(45, 18%, 36%, 0.5)',
  adaptive_kintsugi_repair:          'hsla(160, 10%, 26%, 0.5)',
  adaptive_immune_response:          'hsla(45, 20%, 38%, 0.5)',
  adaptive_water_mode:               'hsla(160, 12%, 28%, 0.5)',
  adaptive_shock_absorber:           'hsla(45, 18%, 36%, 0.5)',
  adaptive_compost_bin:              'hsla(160, 10%, 26%, 0.5)',
  adaptive_scar_tissue:              'hsla(45, 20%, 38%, 0.5)',
  adaptive_root_deepen:              'hsla(160, 12%, 28%, 0.5)',
  adaptive_phoenix_burn:             'hsla(45, 18%, 36%, 0.5)',
  adaptive_adaptive_seal:            'hsla(45, 22%, 40%, 0.55)',
  // Shadow Worker Collection — shadow obsidian/golden shadow tones
  shadow_projection_check:           'hsla(42, 22%, 34%, 0.5)',
  shadow_golden_shadow:              'hsla(270, 10%, 22%, 0.5)',
  shadow_secret_oath:                'hsla(42, 20%, 32%, 0.5)',
  shadow_monster_feed:               'hsla(270, 10%, 20%, 0.5)',
  shadow_shame_compass:              'hsla(42, 22%, 34%, 0.5)',
  shadow_inner_child_rescue:         'hsla(270, 10%, 22%, 0.5)',
  shadow_dream_dive:                 'hsla(42, 20%, 32%, 0.5)',
  shadow_trigger_trace:              'hsla(270, 10%, 20%, 0.5)',
  shadow_integration_dialogue:       'hsla(42, 22%, 34%, 0.5)',
  shadow_shadow_seal:                'hsla(42, 25%, 38%, 0.55)',
  // Ancestor Collection — ancient earth/lineage amber tones
  ancestor_epigenetic_switch:        'hsla(35, 22%, 36%, 0.5)',
  ancestor_lineage_audit:            'hsla(30, 18%, 24%, 0.5)',
  ancestor_council_of_elders:        'hsla(35, 20%, 34%, 0.5)',
  ancestor_trauma_breaker:           'hsla(30, 16%, 22%, 0.5)',
  ancestor_gift_inheritance:         'hsla(35, 22%, 36%, 0.5)',
  ancestor_name_reclaim:             'hsla(30, 18%, 24%, 0.5)',
  ancestor_seven_generations:        'hsla(35, 20%, 34%, 0.5)',
  ancestor_bone_wisdom:              'hsla(30, 16%, 22%, 0.5)',
  ancestor_torch_pass:               'hsla(35, 22%, 36%, 0.5)',
  ancestor_ancestral_seal:           'hsla(35, 25%, 40%, 0.55)',
  // Trickster Collection — jester amber/carnival rose tones
  trickster_absurdity_filter:        'hsla(340, 18%, 38%, 0.5)',
  trickster_wrong_answers_only:      'hsla(48, 16%, 24%, 0.5)',
  trickster_dance_break:             'hsla(340, 18%, 38%, 0.5)',
  trickster_rule_breaker:            'hsla(48, 16%, 24%, 0.5)',
  trickster_avatar_swap:             'hsla(340, 18%, 38%, 0.5)',
  trickster_mess_maker:              'hsla(48, 16%, 24%, 0.5)',
  trickster_primal_scream:           'hsla(340, 18%, 38%, 0.5)',
  trickster_yes_lets:                'hsla(48, 16%, 24%, 0.5)',
  trickster_sandbox_mode:            'hsla(340, 18%, 38%, 0.5)',
  trickster_trickster_seal:          'hsla(340, 22%, 42%, 0.55)',
  // Astronaut Collection — deep space/pale blue tones
  astronaut_overview_effect:         'hsla(210, 18%, 34%, 0.5)',
  astronaut_deep_time_scroll:        'hsla(225, 14%, 18%, 0.5)',
  astronaut_fractal_zoom:            'hsla(210, 18%, 34%, 0.5)',
  astronaut_nature_bath:             'hsla(225, 14%, 18%, 0.5)',
  astronaut_sonic_boom:              'hsla(210, 18%, 34%, 0.5)',
  astronaut_galaxy_spin:             'hsla(225, 14%, 18%, 0.5)',
  astronaut_ocean_breath:            'hsla(210, 18%, 34%, 0.5)',
  astronaut_altruism_spark:          'hsla(225, 14%, 18%, 0.5)',
  astronaut_deathbed_view:           'hsla(210, 18%, 34%, 0.5)',
  astronaut_astronaut_seal:          'hsla(210, 20%, 38%, 0.55)',
  // Wonderer Collection — wonder amber/question violet tones
  wonderer_what_if_lever:            'hsla(275, 14%, 36%, 0.5)',
  wonderer_shoshin_reset:            'hsla(38, 18%, 26%, 0.5)',
  wonderer_fractal_question:         'hsla(275, 14%, 36%, 0.5)',
  wonderer_rabbit_hole:              'hsla(38, 18%, 26%, 0.5)',
  wonderer_texture_audit:            'hsla(275, 14%, 36%, 0.5)',
  wonderer_jigsaw_pivot:             'hsla(38, 18%, 26%, 0.5)',
  wonderer_impossible_list:          'hsla(275, 14%, 36%, 0.5)',
  wonderer_color_thief:              'hsla(38, 18%, 26%, 0.5)',
  wonderer_mystery_door:             'hsla(275, 14%, 36%, 0.5)',
  wonderer_wonder_seal:              'hsla(275, 16%, 40%, 0.55)',
  // Surfer Collection — ocean deep/wave teal tones
  surfer_wu_wei_slide:               'hsla(170, 18%, 32%, 0.5)',
  surfer_rhythm_game:                'hsla(195, 14%, 22%, 0.5)',
  surfer_breath_synchro:             'hsla(170, 18%, 32%, 0.5)',
  surfer_friction_remover:           'hsla(195, 14%, 22%, 0.5)',
  surfer_good_enough_release:        'hsla(170, 18%, 32%, 0.5)',
  surfer_current_check:              'hsla(195, 14%, 22%, 0.5)',
  surfer_soft_eyes:                  'hsla(170, 18%, 32%, 0.5)',
  surfer_micro_flow:                 'hsla(195, 14%, 22%, 0.5)',
  surfer_momentum_save:              'hsla(170, 18%, 32%, 0.5)',
  surfer_surfer_seal:                'hsla(170, 20%, 36%, 0.55)',
  // Meaning Maker Collection — manuscript amber/lantern gold tones
  meaning_suffering_audit:           'hsla(45, 22%, 34%, 0.5)',
  meaning_legacy_letter:             'hsla(35, 16%, 24%, 0.5)',
  meaning_tombstone_edit:            'hsla(45, 22%, 34%, 0.5)',
  meaning_ikigai_intersection:       'hsla(35, 16%, 24%, 0.5)',
  meaning_why_ladder:                'hsla(45, 22%, 34%, 0.5)',
  meaning_service_shift:             'hsla(35, 16%, 24%, 0.5)',
  meaning_gratitude_lens:            'hsla(45, 22%, 34%, 0.5)',
  meaning_alignment_compass:         'hsla(35, 16%, 24%, 0.5)',
  meaning_cosmic_joke:               'hsla(45, 22%, 34%, 0.5)',
  meaning_meaning_seal:              'hsla(45, 25%, 38%, 0.55)',
  // Servant Collection — garden green/nurture gold tones
  servant_ripple_effect:             'hsla(42, 20%, 36%, 0.5)',
  servant_oxygen_mask:               'hsla(145, 12%, 22%, 0.5)',
  servant_empty_chair:               'hsla(42, 20%, 36%, 0.5)',
  servant_gardeners_patience:        'hsla(145, 12%, 22%, 0.5)',
  servant_listening_ear:             'hsla(42, 20%, 36%, 0.5)',
  servant_kindness_boomerang:        'hsla(145, 12%, 22%, 0.5)',
  servant_ego_dissolve:              'hsla(42, 20%, 36%, 0.5)',
  servant_mentors_hand:              'hsla(145, 12%, 22%, 0.5)',
  servant_invisible_thread:          'hsla(42, 20%, 36%, 0.5)',
  servant_servant_seal:              'hsla(42, 22%, 40%, 0.55)',
  // Synthesis Collection — crucible amber/alchemical gold tones
  synthesis_paradox_holder:          'hsla(48, 24%, 36%, 0.5)',
  synthesis_emotion_blender:         'hsla(30, 18%, 26%, 0.5)',
  synthesis_shadow_hug:              'hsla(48, 24%, 36%, 0.5)',
  synthesis_transmutation_fire:      'hsla(30, 18%, 26%, 0.5)',
  synthesis_narrative_stitch:        'hsla(48, 24%, 36%, 0.5)',
  synthesis_energy_exchange:         'hsla(30, 18%, 26%, 0.5)',
  synthesis_identity_fluidity:       'hsla(48, 24%, 36%, 0.5)',
  synthesis_values_alloy:            'hsla(30, 18%, 26%, 0.5)',
  synthesis_chaos_surfer:            'hsla(48, 24%, 36%, 0.5)',
  synthesis_synthesis_seal:          'hsla(48, 28%, 40%, 0.55)',
  // Future Weaver Collection — time indigo/horizon teal tones
  futureweaver_future_memory:        'hsla(175, 18%, 34%, 0.5)',
  futureweaver_regret_minimization:  'hsla(220, 12%, 24%, 0.5)',
  futureweaver_time_capsule_send:    'hsla(175, 18%, 34%, 0.5)',
  futureweaver_pre_hindsight:        'hsla(220, 12%, 24%, 0.5)',
  futureweaver_branch_pruner:        'hsla(175, 18%, 34%, 0.5)',
  futureweaver_legacy_seed:          'hsla(220, 12%, 24%, 0.5)',
  futureweaver_worst_case_simulator: 'hsla(175, 18%, 34%, 0.5)',
  futureweaver_optimism_bias:        'hsla(220, 12%, 24%, 0.5)',
  futureweaver_promise_keeper:       'hsla(175, 18%, 34%, 0.5)',
  futureweaver_weaver_seal:          'hsla(175, 20%, 38%, 0.55)',
  // Composer Collection — concert hall dark/brass gold tones
  composer_discord_resolve:          'hsla(45, 20%, 34%, 0.5)',
  composer_tempo_control:            'hsla(240, 8%, 22%, 0.5)',
  composer_leitmotif_scan:           'hsla(45, 20%, 34%, 0.5)',
  composer_rest_note:                'hsla(240, 8%, 22%, 0.5)',
  composer_counterpoint:             'hsla(45, 20%, 34%, 0.5)',
  composer_volume_knob:              'hsla(240, 8%, 22%, 0.5)',
  composer_tuning_fork:              'hsla(45, 20%, 34%, 0.5)',
  composer_ensemble_check:           'hsla(240, 8%, 22%, 0.5)',
  composer_improvisation:            'hsla(45, 20%, 34%, 0.5)',
  composer_composer_seal:            'hsla(45, 24%, 38%, 0.55)',
  // Zenith Collection — alpine steel/summit ice blue tones
  zenith_acclimatization:            'hsla(200, 16%, 38%, 0.5)',
  zenith_false_summit:               'hsla(210, 10%, 26%, 0.5)',
  zenith_light_load:                 'hsla(200, 16%, 38%, 0.5)',
  zenith_anchor:                     'hsla(210, 10%, 26%, 0.5)',
  zenith_view:                       'hsla(200, 16%, 38%, 0.5)',
  zenith_descent:                    'hsla(210, 10%, 26%, 0.5)',
  zenith_sherpa_mindset:             'hsla(200, 16%, 38%, 0.5)',
  zenith_oxygen_check:               'hsla(210, 10%, 26%, 0.5)',
  zenith_whiteout:                   'hsla(200, 16%, 38%, 0.5)',
  zenith_zenith_seal:                'hsla(200, 18%, 42%, 0.55)',
  // Multiverse Collection — quantum violet/spectrum cyan tones
  multiverse_identity_prism:         'hsla(195, 18%, 36%, 0.5)',
  multiverse_both_and_bridge:        'hsla(270, 12%, 22%, 0.5)',
  multiverse_costume_change:         'hsla(195, 18%, 36%, 0.5)',
  multiverse_future_draft:           'hsla(270, 12%, 22%, 0.5)',
  multiverse_committee_meeting:      'hsla(195, 18%, 36%, 0.5)',
  multiverse_ghost_ship:             'hsla(270, 12%, 22%, 0.5)',
  multiverse_shapeshifter:           'hsla(195, 18%, 36%, 0.5)',
  multiverse_shadow_dance:           'hsla(270, 12%, 22%, 0.5)',
  multiverse_empty_room:             'hsla(195, 18%, 36%, 0.5)',
  multiverse_multiverse_seal:        'hsla(195, 20%, 40%, 0.55)',
  // Ethicist Collection — marble grey/justice gold tones
  ethicist_integrity_gap:            'hsla(38, 18%, 34%, 0.5)',
  ethicist_eulogy_test:              'hsla(220, 6%, 24%, 0.5)',
  ethicist_hard_right:               'hsla(38, 18%, 34%, 0.5)',
  ethicist_truth_serum:              'hsla(220, 6%, 24%, 0.5)',
  ethicist_virtue_card:              'hsla(38, 18%, 34%, 0.5)',
  ethicist_whisper:                  'hsla(220, 6%, 24%, 0.5)',
  ethicist_responsibility_weight:    'hsla(38, 18%, 34%, 0.5)',
  ethicist_gratitude_tithe:          'hsla(220, 6%, 24%, 0.5)',
  ethicist_apology_script:           'hsla(38, 18%, 34%, 0.5)',
  ethicist_ethicist_seal:            'hsla(38, 22%, 38%, 0.55)',
  // Elementalist Collection — forest dark / earth amber tones
  elementalist_earth_drop:           'hsla(28, 22%, 34%, 0.5)',
  elementalist_air_filter:           'hsla(145, 14%, 22%, 0.5)',
  elementalist_fire_stoke:           'hsla(28, 22%, 34%, 0.5)',
  elementalist_water_flow:           'hsla(145, 14%, 22%, 0.5)',
  elementalist_storm_eye:            'hsla(28, 22%, 34%, 0.5)',
  elementalist_stone_stack:          'hsla(145, 14%, 22%, 0.5)',
  elementalist_forest_bath:          'hsla(28, 22%, 34%, 0.5)',
  elementalist_tide_chart:           'hsla(145, 14%, 22%, 0.5)',
  elementalist_lightning_rod:        'hsla(28, 22%, 34%, 0.5)',
  elementalist_elemental_seal:       'hsla(28, 25%, 38%, 0.55)',
  // Mentat Collection — circuit obsidian / logic teal tones
  mentat_deduction_palace:           'hsla(180, 15%, 32%, 0.5)',
  mentat_speed_read:                 'hsla(220, 10%, 20%, 0.5)',
  mentat_logic_gate:                 'hsla(180, 15%, 32%, 0.5)',
  mentat_binary_choice:              'hsla(220, 10%, 20%, 0.5)',
  mentat_memory_archive:             'hsla(180, 15%, 32%, 0.5)',
  mentat_focus_tunnel:               'hsla(220, 10%, 20%, 0.5)',
  mentat_pattern_match:              'hsla(180, 15%, 32%, 0.5)',
  mentat_devils_advocate:            'hsla(220, 10%, 20%, 0.5)',
  mentat_algorithm_rewrite:          'hsla(180, 15%, 32%, 0.5)',
  mentat_mentat_seal:                'hsla(180, 18%, 36%, 0.55)',
  // Intuition Collection — intuition indigo / oracle amber tones
  intuition_gut_check:               'hsla(265, 14%, 22%, 0.5)',
  intuition_coin_flip:               'hsla(38, 22%, 34%, 0.5)',
  intuition_shiver_scan:             'hsla(265, 14%, 22%, 0.5)',
  intuition_sleep_on_it:             'hsla(38, 22%, 34%, 0.5)',
  intuition_vibe_check:              'hsla(265, 14%, 22%, 0.5)',
  intuition_silence_vacuum:          'hsla(38, 22%, 34%, 0.5)',
  intuition_resonance_test:          'hsla(265, 14%, 22%, 0.5)',
  intuition_future_self_consult:     'hsla(38, 22%, 34%, 0.5)',
  intuition_fear_vs_danger:          'hsla(265, 14%, 22%, 0.5)',
  intuition_oracle_seal:             'hsla(38, 25%, 38%, 0.55)',
  // Engineer Collection — blueprint steel / copper bronze tones
  engineer_default_setting:          'hsla(210, 10%, 22%, 0.5)',
  engineer_friction_slider:          'hsla(25, 18%, 34%, 0.5)',
  engineer_commitment_device:        'hsla(210, 10%, 22%, 0.5)',
  engineer_batch_process:            'hsla(25, 18%, 34%, 0.5)',
  engineer_check_engine_light:       'hsla(210, 10%, 22%, 0.5)',
  engineer_redundancy:               'hsla(25, 18%, 34%, 0.5)',
  engineer_constraint:               'hsla(210, 10%, 22%, 0.5)',
  engineer_feedback_loop:            'hsla(25, 18%, 34%, 0.5)',
  engineer_maintenance_schedule:     'hsla(210, 10%, 22%, 0.5)',
  engineer_engineer_seal:            'hsla(25, 22%, 38%, 0.55)',
  // AlchemistIV Collection — crucible ember / alchemical gold tones
  alchemistiv_anger_forge:           'hsla(15, 18%, 22%, 0.5)',
  alchemistiv_grief_garden:          'hsla(42, 24%, 34%, 0.5)',
  alchemistiv_fear_compass:          'hsla(15, 18%, 22%, 0.5)',
  alchemistiv_joy_reservoir:         'hsla(42, 24%, 34%, 0.5)',
  alchemistiv_shame_solvent:         'hsla(15, 18%, 22%, 0.5)',
  alchemistiv_envy_mirror:           'hsla(42, 24%, 34%, 0.5)',
  alchemistiv_sadness_river:         'hsla(15, 18%, 22%, 0.5)',
  alchemistiv_anxiety_engine:        'hsla(42, 24%, 34%, 0.5)',
  alchemistiv_love_amplifier:        'hsla(15, 18%, 22%, 0.5)',
  alchemistiv_transmutation_seal:    'hsla(42, 28%, 38%, 0.55)',
  // Cognitive Collection — slate blue / library amber tones
  cognitive_memory_palace_repair:    'hsla(225, 12%, 22%, 0.5)',
  cognitive_focus_fortress:          'hsla(40, 18%, 34%, 0.5)',
  cognitive_logic_library:           'hsla(225, 12%, 22%, 0.5)',
  cognitive_perspective_balcony:     'hsla(40, 18%, 34%, 0.5)',
  cognitive_value_vault:             'hsla(225, 12%, 22%, 0.5)',
  cognitive_decision_bridge:         'hsla(40, 18%, 34%, 0.5)',
  cognitive_creativity_workshop:     'hsla(225, 12%, 22%, 0.5)',
  cognitive_doubt_dungeon:           'hsla(40, 18%, 34%, 0.5)',
  cognitive_future_observatory:      'hsla(225, 12%, 22%, 0.5)',
  cognitive_architect_seal:          'hsla(40, 22%, 38%, 0.55)',
  // Sage Collection — ink wash / tea amber tones
  sage_empty_cup:                    'hsla(30, 10%, 20%, 0.5)',
  sage_impermanence:                 'hsla(38, 18%, 32%, 0.5)',
  sage_middle_way:                   'hsla(30, 10%, 20%, 0.5)',
  sage_paradox_holder:               'hsla(38, 18%, 32%, 0.5)',
  sage_silent_answer:                'hsla(30, 10%, 20%, 0.5)',
  sage_observer_seat:                'hsla(38, 18%, 32%, 0.5)',
  sage_wu_wei:                       'hsla(30, 10%, 20%, 0.5)',
  sage_mirror_of_projection:         'hsla(38, 18%, 32%, 0.5)',
  sage_beginners_mind:               'hsla(30, 10%, 20%, 0.5)',
  sage_sage_seal:                    'hsla(38, 22%, 36%, 0.55)',
  // Gaia Collection — deep earth / atmosphere blue tones
  gaia_breath_exchange:              'hsla(155, 14%, 20%, 0.5)',
  gaia_mycelium_network:             'hsla(200, 16%, 34%, 0.5)',
  gaia_zoom_out:                     'hsla(155, 14%, 20%, 0.5)',
  gaia_water_cycle:                  'hsla(200, 16%, 34%, 0.5)',
  gaia_deep_time:                    'hsla(155, 14%, 20%, 0.5)',
  gaia_sun_source:                   'hsla(200, 16%, 34%, 0.5)',
  gaia_diversity_immunity:           'hsla(155, 14%, 20%, 0.5)',
  gaia_ocean_depth:                  'hsla(200, 16%, 34%, 0.5)',
  gaia_butterfly_effect:             'hsla(155, 14%, 20%, 0.5)',
  gaia_gaia_seal:                    'hsla(200, 20%, 38%, 0.55)',
  // Mystic Collection — deep violet / ethereal gold tones
  mystic_candle_gaze:                'hsla(270, 12%, 18%, 0.5)',
  mystic_drop_in_ocean:              'hsla(42, 16%, 32%, 0.5)',
  mystic_koan:                       'hsla(270, 12%, 18%, 0.5)',
  mystic_light_source:               'hsla(42, 16%, 32%, 0.5)',
  mystic_space_between:              'hsla(270, 12%, 18%, 0.5)',
  mystic_dance_of_shiva:             'hsla(42, 16%, 32%, 0.5)',
  mystic_golden_thread:              'hsla(270, 12%, 18%, 0.5)',
  mystic_silence_bell:               'hsla(42, 16%, 32%, 0.5)',
  mystic_net_of_indra:               'hsla(270, 12%, 18%, 0.5)',
  mystic_mystic_seal:                'hsla(42, 20%, 36%, 0.55)',
  // Ascendant Collection — warm earth / integration gold tones
  ascendant_chop_wood:               'hsla(28, 14%, 22%, 0.5)',
  ascendant_descent:                 'hsla(45, 20%, 36%, 0.5)',
  ascendant_marketplace_noise:       'hsla(28, 14%, 22%, 0.5)',
  ascendant_dirty_hands:             'hsla(45, 20%, 36%, 0.5)',
  ascendant_ordinary_miracle:        'hsla(28, 14%, 22%, 0.5)',
  ascendant_broken_bowl:             'hsla(45, 20%, 36%, 0.5)',
  ascendant_ripple_maker:            'hsla(28, 14%, 22%, 0.5)',
  ascendant_human_touch:             'hsla(45, 20%, 36%, 0.5)',
  ascendant_open_door:               'hsla(28, 14%, 22%, 0.5)',
  ascendant_ascendant_seal:          'hsla(45, 24%, 40%, 0.55)',
  // Gardener II Collection — deep loam / seed amber tones
  gardener_seed_bank:                'hsla(140, 14%, 20%, 0.5)',
  gardener_composting:               'hsla(38, 20%, 34%, 0.5)',
  gardener_pruning_shears:           'hsla(140, 14%, 20%, 0.5)',
  gardener_mycelial_pulse:           'hsla(38, 20%, 34%, 0.5)',
  gardener_harvest_timing:           'hsla(140, 14%, 20%, 0.5)',
  gardener_drought_resilience:       'hsla(38, 20%, 34%, 0.5)',
  gardener_pollinator:               'hsla(140, 14%, 20%, 0.5)',
  gardener_winter_rest:              'hsla(38, 20%, 34%, 0.5)',
  gardener_ecosystem_balance:        'hsla(140, 14%, 20%, 0.5)',
  gardener_gardener_seal:            'hsla(38, 24%, 38%, 0.55)',
  // Ancestor II Collection — heartwood brown / ring gold tones
  ancestorii_100_year_plan:          'hsla(25, 16%, 20%, 0.5)',
  ancestorii_chain_link:             'hsla(40, 20%, 34%, 0.5)',
  ancestorii_wisdom_capsule:         'hsla(25, 16%, 20%, 0.5)',
  ancestorii_name_etching:           'hsla(40, 20%, 34%, 0.5)',
  ancestorii_torch_pass:             'hsla(25, 16%, 20%, 0.5)',
  ancestorii_library_contribution:   'hsla(40, 20%, 34%, 0.5)',
  ancestorii_ripple_watch:           'hsla(25, 16%, 20%, 0.5)',
  ancestorii_council_seat:           'hsla(40, 20%, 34%, 0.5)',
  ancestorii_inheritance_audit:      'hsla(25, 16%, 20%, 0.5)',
  ancestorii_ancestor_seal:          'hsla(40, 24%, 38%, 0.55)',
  // Act 90 — THE MAGNUM OPUS (molten gold / forge amber)
  mastery_distillation:              'hsla(40, 80%, 50%, 0.6)',
  mastery_phoenix_ash:               'hsla(30, 75%, 45%, 0.5)',
  mastery_gold_standard:             'hsla(45, 85%, 52%, 0.6)',
  mastery_masterpiece_reveal:        'hsla(35, 78%, 48%, 0.5)',
  mastery_chisel_strike:             'hsla(30, 75%, 45%, 0.5)',
  mastery_final_polish:              'hsla(40, 80%, 50%, 0.6)',
  mastery_key_turn:                  'hsla(45, 85%, 52%, 0.5)',
  mastery_crown_weight:              'hsla(35, 78%, 48%, 0.6)',
  mastery_silent_nod:                'hsla(30, 75%, 45%, 0.5)',
  mastery_mastery_seal:              'hsla(40, 85%, 55%, 0.65)',
  // Act 91 — THE INFINITE PLAYER (twilight blue / dawn amber)
  horizon_horizon_line:              'hsla(225, 30%, 35%, 0.5)',
  horizon_new_map:                   'hsla(40, 65%, 55%, 0.5)',
  horizon_level_up:                  'hsla(225, 30%, 35%, 0.5)',
  horizon_open_door:                 'hsla(40, 65%, 55%, 0.5)',
  horizon_torch_relay:               'hsla(225, 35%, 40%, 0.5)',
  horizon_sunrise:                   'hsla(40, 70%, 58%, 0.6)',
  horizon_unfinished_symphony:       'hsla(225, 30%, 35%, 0.5)',
  horizon_vastness:                   'hsla(220, 28%, 32%, 0.5)',
  horizon_question_mark:             'hsla(40, 65%, 55%, 0.5)',
  horizon_infinite_seal:             'hsla(225, 35%, 42%, 0.6)',
  // Act 92 — The Zero Point (void black / quantum vacuum)
  void_sensory_deprivation:          'hsla(260, 8%, 18%, 0.5)',
  void_nothing_box:                  'hsla(0, 0%, 12%, 0.5)',
  void_silence_vacuum:               'hsla(260, 10%, 20%, 0.5)',
  void_dark_matter:                  'hsla(270, 8%, 16%, 0.5)',
  void_ego_death:                    'hsla(280, 10%, 18%, 0.5)',
  void_breath_hold:                  'hsla(260, 6%, 14%, 0.5)',
  void_un_naming:                    'hsla(250, 8%, 16%, 0.5)',
  void_reset_button:                 'hsla(0, 0%, 10%, 0.5)',
  void_static_clear:                 'hsla(260, 12%, 20%, 0.5)',
  void_zero_seal:                    'hsla(260, 10%, 22%, 0.6)',
  // Act 93 — The Omega (warm golden unity)
  unity_prism_return:                'hsla(42, 30%, 42%, 0.5)',
  unity_symphony:                    'hsla(38, 28%, 40%, 0.5)',
  unity_fractal_zoom:                'hsla(45, 32%, 44%, 0.5)',
  unity_entanglement:                'hsla(35, 26%, 38%, 0.5)',
  unity_golden_ratio:                'hsla(48, 35%, 46%, 0.5)',
  unity_time_collapse:               'hsla(32, 24%, 36%, 0.5)',
  unity_event_horizon:               'hsla(40, 28%, 40%, 0.5)',
  unity_mirror_of_truth:             'hsla(42, 30%, 42%, 0.5)',
  unity_final_exhale:                'hsla(36, 26%, 38%, 0.5)',
  unity_atlas_seal:                  'hsla(42, 32%, 45%, 0.6)',
  // Act 94 — The Ouroboros Collection (serpent emerald / eternal gold / ash charcoal / rebirth teal)
  ouroboros_first_breath:            'hsla(160, 22%, 32%, 0.5)',
  ouroboros_mirror_loop:             'hsla(42, 28%, 38%, 0.5)',
  ouroboros_seed_return:             'hsla(120, 18%, 30%, 0.5)',
  ouroboros_snake_skin:              'hsla(42, 22%, 34%, 0.5)',
  ouroboros_circle_close:            'hsla(160, 20%, 28%, 0.5)',
  ouroboros_ash_sprout:              'hsla(0, 0%, 28%, 0.5)',
  ouroboros_echo_origin:             'hsla(200, 18%, 32%, 0.5)',
  ouroboros_tail_swallow:            'hsla(42, 25%, 36%, 0.5)',
  ouroboros_alpha_omega:             'hsla(160, 24%, 35%, 0.5)',
  ouroboros_eternal_seal:            'hsla(42, 30%, 42%, 0.6)',
  // Act 95 — Projector (warm amber / theater gold / stage light)
  projector_film_swap:              'hsla(45, 35%, 40%, 0.5)',
  projector_beam_focus:             'hsla(40, 30%, 38%, 0.5)',
  projector_lens_shift:             'hsla(50, 28%, 42%, 0.5)',
  projector_reality_lag:            'hsla(35, 25%, 36%, 0.5)',
  projector_tuning_fork:            'hsla(48, 32%, 44%, 0.5)',
  projector_silent_reel:            'hsla(42, 22%, 34%, 0.5)',
  projector_fourth_wall:            'hsla(38, 30%, 40%, 0.5)',
  projector_splice_point:           'hsla(44, 26%, 38%, 0.5)',
  projector_ghost_light:            'hsla(52, 20%, 36%, 0.5)',
  projector_projector_seal:         'hsla(45, 35%, 45%, 0.6)',
  // Act 96 — Chronomancer (deep indigo / cosmos blue / temporal violet)
  chronomancer_past_edit:           'hsla(230, 22%, 38%, 0.5)',
  chronomancer_future_borrow:       'hsla(240, 25%, 42%, 0.5)',
  chronomancer_time_dilation:       'hsla(250, 20%, 36%, 0.5)',
  chronomancer_ancestral_link:      'hsla(220, 18%, 40%, 0.5)',
  chronomancer_legacy_cast:         'hsla(235, 24%, 44%, 0.5)',
  chronomancer_regret_reversal:     'hsla(260, 22%, 38%, 0.5)',
  chronomancer_deja_vu:             'hsla(245, 20%, 36%, 0.5)',
  chronomancer_wormhole:            'hsla(228, 26%, 42%, 0.5)',
  chronomancer_eternal_now:         'hsla(215, 18%, 38%, 0.5)',
  chronomancer_chronos_seal:        'hsla(230, 28%, 45%, 0.6)',
  // Resonator (deep teal / ocean frequency / vibrational blue-green)
  resonator_noise_cancellation:    'hsla(195, 28%, 36%, 0.5)',
  resonator_carrier_wave:          'hsla(200, 24%, 40%, 0.5)',
  resonator_constructive_interference: 'hsla(190, 30%, 38%, 0.5)',
  resonator_sympathetic_resonance: 'hsla(205, 22%, 42%, 0.5)',
  resonator_feedback_loop:         'hsla(185, 26%, 36%, 0.5)',
  resonator_pure_tone:             'hsla(210, 20%, 40%, 0.5)',
  resonator_volume_knob:           'hsla(198, 24%, 38%, 0.5)',
  resonator_echo_chamber:          'hsla(215, 22%, 36%, 0.5)',
  resonator_frequency_jammer:      'hsla(188, 28%, 40%, 0.5)',
  resonator_resonator_seal:        'hsla(195, 30%, 45%, 0.6)',
  // Act 97 — Materialist (burnt orange / ember copper / forge warmth)
  materialist_first_brick:          'hsla(32, 30%, 38%, 0.5)',
  materialist_blueprint_edit:       'hsla(28, 24%, 40%, 0.5)',
  materialist_gravity_well:         'hsla(36, 28%, 36%, 0.5)',
  materialist_friction_test:        'hsla(24, 26%, 42%, 0.5)',
  materialist_scaffolding:          'hsla(30, 22%, 38%, 0.5)',
  materialist_concrete_pour:        'hsla(20, 30%, 36%, 0.5)',
  materialist_keystone:             'hsla(34, 32%, 44%, 0.5)',
  materialist_demolition:           'hsla(18, 28%, 38%, 0.5)',
  materialist_inspection:           'hsla(26, 24%, 40%, 0.5)',
  materialist_materialist_seal:     'hsla(32, 32%, 45%, 0.6)',
  // Act 99 — Refractor (violet-blue / prismatic refraction / stellar light)
  refractor_spectrum_split:          'hsla(260, 28%, 42%, 0.5)',
  refractor_focal_point:             'hsla(270, 24%, 40%, 0.5)',
  refractor_distortion_check:        'hsla(250, 30%, 38%, 0.5)',
  refractor_color_grade:             'hsla(280, 26%, 44%, 0.5)',
  refractor_blind_spot:              'hsla(245, 22%, 40%, 0.5)',
  refractor_polarizer:               'hsla(265, 28%, 36%, 0.5)',
  refractor_black_body:              'hsla(275, 24%, 42%, 0.5)',
  refractor_laser:                   'hsla(255, 30%, 38%, 0.5)',
  refractor_darkroom:                'hsla(240, 22%, 36%, 0.5)',
  refractor_prism_seal:              'hsla(260, 32%, 45%, 0.6)',
  // Act 100 — Engine (steel blue-gray / thermal / circuit precision)
  engine_entropy_check:              'hsla(205, 26%, 36%, 0.5)',
  engine_heat_sink:                  'hsla(200, 22%, 40%, 0.5)',
  engine_closed_loop:                'hsla(210, 28%, 38%, 0.5)',
  engine_flywheel:                   'hsla(195, 24%, 42%, 0.5)',
  engine_insulation:                 'hsla(215, 22%, 36%, 0.5)',
  engine_turbocharger:               'hsla(208, 28%, 40%, 0.5)',
  engine_idle_state:                 'hsla(202, 24%, 38%, 0.5)',
  engine_fuel_mix:                   'hsla(212, 26%, 42%, 0.5)',
  engine_governor:                   'hsla(198, 22%, 36%, 0.5)',
  engine_engine_seal:                'hsla(205, 30%, 45%, 0.6)',
  // Act 101 — Catalyst S107 additions (ice blue / crystalline chemistry)
  catalyst_phase_change:             'hsla(190, 24%, 36%, 0.5)',
  catalyst_precipitate:              'hsla(185, 28%, 40%, 0.5)',
  catalyst_compound:                 'hsla(180, 26%, 42%, 0.5)',
  catalyst_solvent:                  'hsla(192, 24%, 36%, 0.5)',
  catalyst_chain_reaction:           'hsla(188, 28%, 40%, 0.5)',
  catalyst_purification:             'hsla(182, 22%, 38%, 0.5)',
  catalyst_inert_gas:                'hsla(196, 24%, 42%, 0.5)',
  catalyst_enzyme:                   'hsla(186, 26%, 36%, 0.5)',
  // Act 102 — Quantum Architect (teal / wave-particle / tidal probability)
  quantumarchitect_superposition:          'hsla(170, 22%, 36%, 0.5)',
  quantumarchitect_probability_cloud:      'hsla(165, 26%, 40%, 0.5)',
  quantumarchitect_observer_effect:        'hsla(175, 24%, 38%, 0.5)',
  quantumarchitect_multiverse_branch:      'hsla(160, 22%, 42%, 0.5)',
  quantumarchitect_quantum_tunneling:      'hsla(172, 28%, 36%, 0.5)',
  quantumarchitect_entanglement:           'hsla(168, 24%, 40%, 0.5)',
  quantumarchitect_wave_function_collapse: 'hsla(178, 22%, 38%, 0.5)',
  quantumarchitect_uncertainty_principle:  'hsla(162, 26%, 42%, 0.5)',
  quantumarchitect_vacuum_fluctuation:     'hsla(174, 24%, 36%, 0.5)',
  quantumarchitect_quantum_seal:           'hsla(170, 30%, 45%, 0.6)',
  // S109 Transmuter (The Alchemy Collection)
  transmuter_lead_weight:                  'hsla(30, 40%, 38%, 0.5)',
  transmuter_calcination:                  'hsla(25, 44%, 42%, 0.5)',
  transmuter_distillation:                 'hsla(35, 38%, 40%, 0.5)',
  transmuter_coagulation:                  'hsla(20, 42%, 38%, 0.5)',
  transmuter_fermentation:                 'hsla(340, 30%, 36%, 0.5)',
  transmuter_sublimation:                  'hsla(28, 46%, 42%, 0.5)',
  transmuter_amalgam:                      'hsla(32, 36%, 40%, 0.5)',
  transmuter_universal_solvent:            'hsla(22, 40%, 38%, 0.5)',
  transmuter_philosophers_stone:           'hsla(0, 45%, 42%, 0.5)',
  transmuter_transmuter_seal:              'hsla(30, 50%, 45%, 0.6)',
  // S110 Cyberneticist (The Steering Collection)
  cyberneticist_error_signal:              'hsla(205, 32%, 38%, 0.5)',
  cyberneticist_negative_feedback_loop:    'hsla(200, 28%, 42%, 0.5)',
  cyberneticist_positive_feedback_loop:    'hsla(210, 34%, 36%, 0.5)',
  cyberneticist_lag_time:                  'hsla(195, 26%, 40%, 0.5)',
  cyberneticist_gain:                      'hsla(208, 30%, 38%, 0.5)',
  cyberneticist_set_point:                 'hsla(202, 32%, 42%, 0.5)',
  cyberneticist_feedforward:               'hsla(212, 28%, 36%, 0.5)',
  cyberneticist_oscillation:               'hsla(198, 30%, 40%, 0.5)',
  cyberneticist_black_box:                 'hsla(215, 26%, 38%, 0.5)',
  cyberneticist_navigator_seal:            'hsla(205, 35%, 45%, 0.6)',
  // S111 FieldArchitect (The Magnetism Collection)
  fieldarchitect_polarity_check:           'hsla(260, 28%, 42%, 0.5)',
  fieldarchitect_iron_filings:             'hsla(255, 24%, 38%, 0.5)',
  fieldarchitect_strange_attractor:        'hsla(265, 30%, 40%, 0.5)',
  fieldarchitect_shield:                   'hsla(250, 26%, 42%, 0.5)',
  fieldarchitect_induced_current:          'hsla(45, 32%, 40%, 0.5)',
  fieldarchitect_compass_needle:           'hsla(258, 28%, 38%, 0.5)',
  fieldarchitect_electro_magnet:           'hsla(262, 24%, 40%, 0.5)',
  fieldarchitect_voltage_drop:             'hsla(40, 28%, 38%, 0.5)',
  fieldarchitect_domain:                   'hsla(255, 30%, 42%, 0.5)',
  fieldarchitect_field_seal:               'hsla(260, 32%, 45%, 0.6)',
  // S112 Kineticist (The Momentum Collection)
  kineticist_inertia_breaker:              'hsla(25, 35%, 40%, 0.5)',
  kineticist_gravity_assist:               'hsla(30, 30%, 38%, 0.5)',
  kineticist_elastic_collision:            'hsla(20, 32%, 42%, 0.5)',
  kineticist_terminal_velocity:            'hsla(28, 28%, 36%, 0.5)',
  kineticist_rocket_equation:              'hsla(35, 34%, 40%, 0.5)',
  kineticist_orbit:                        'hsla(22, 30%, 38%, 0.5)',
  kineticist_vector_addition:              'hsla(32, 26%, 42%, 0.5)',
  kineticist_momentum_save:                'hsla(18, 32%, 38%, 0.5)',
  kineticist_impact_zone:                  'hsla(28, 35%, 40%, 0.5)',
  kineticist_kinetic_seal:                 'hsla(25, 38%, 45%, 0.6)',
  // S113 Crystal (The Clarity Collection)
  crystal_lattice:                         'hsla(195, 30%, 42%, 0.5)',
  crystal_piezoelectric_spark:             'hsla(270, 28%, 40%, 0.5)',
  crystal_facet_cut:                       'hsla(45, 30%, 42%, 0.5)',
  crystal_inclusion:                       'hsla(145, 25%, 38%, 0.5)',
  crystal_resonant_frequency:              'hsla(200, 28%, 40%, 0.5)',
  crystal_annealing:                       'hsla(20, 30%, 40%, 0.5)',
  crystal_transparency:                    'hsla(0, 0%, 50%, 0.4)',
  crystal_nucleation_point:                'hsla(200, 32%, 42%, 0.5)',
  crystal_prism_refraction:                'hsla(280, 25%, 42%, 0.5)',
  crystal_crystal_seal:                    'hsla(270, 30%, 45%, 0.6)',
  // S114 Hydrodynamicist (The Flow Collection)
  hydrodynamicist_laminar_flow:            'hsla(200, 32%, 42%, 0.5)',
  hydrodynamicist_buoyancy_check:          'hsla(195, 28%, 40%, 0.5)',
  hydrodynamicist_path_of_least_resistance:'hsla(205, 30%, 38%, 0.5)',
  hydrodynamicist_erosion:                 'hsla(210, 25%, 42%, 0.5)',
  hydrodynamicist_hydraulic_press:         'hsla(200, 28%, 38%, 0.5)',
  hydrodynamicist_vortex:                  'hsla(215, 30%, 40%, 0.5)',
  hydrodynamicist_surface_tension:         'hsla(195, 32%, 42%, 0.5)',
  hydrodynamicist_phase_transition:        'hsla(200, 25%, 40%, 0.5)',
  hydrodynamicist_ocean_depth:             'hsla(220, 30%, 36%, 0.5)',
  hydrodynamicist_hydro_seal:              'hsla(205, 35%, 45%, 0.6)',
  // S115 Aviator (The Lift Collection)
  aviator_drag_check:                      'hsla(215, 22%, 42%, 0.5)',
  aviator_angle_of_attack:                 'hsla(210, 25%, 40%, 0.5)',
  aviator_thrust_to_weight_ratio:          'hsla(220, 20%, 38%, 0.5)',
  aviator_coffin_corner:                   'hsla(210, 18%, 36%, 0.5)',
  aviator_headwind:                        'hsla(205, 22%, 40%, 0.5)',
  aviator_trim_tab:                        'hsla(215, 20%, 42%, 0.5)',
  aviator_center_of_gravity:               'hsla(210, 22%, 38%, 0.5)',
  aviator_ground_effect:                   'hsla(200, 25%, 40%, 0.5)',
  aviator_feathered_prop:                  'hsla(215, 20%, 40%, 0.5)',
  aviator_aviator_seal:                    'hsla(210, 28%, 45%, 0.6)',
  // S116 Tensegrity (The Structure Collection)
  tensegrity_floating_compression:         'hsla(175, 25%, 40%, 0.5)',
  tensegrity_pre_stress:                   'hsla(180, 22%, 38%, 0.5)',
  tensegrity_load_distribution:            'hsla(170, 20%, 42%, 0.5)',
  tensegrity_omni_directional:             'hsla(175, 22%, 36%, 0.5)',
  tensegrity_fascial_release:              'hsla(180, 25%, 40%, 0.5)',
  tensegrity_space_frame:                  'hsla(172, 20%, 38%, 0.5)',
  tensegrity_dynamic_equilibrium:          'hsla(178, 22%, 42%, 0.5)',
  tensegrity_yield_point:                  'hsla(175, 20%, 38%, 0.5)',
  tensegrity_network_node:                 'hsla(180, 22%, 40%, 0.5)',
  tensegrity_tensegrity_seal:              'hsla(176, 28%, 44%, 0.6)',
  // S117 Wayfinder (The Navigation Collection)
  wayfinder_dead_reckoning:                'hsla(220, 22%, 42%, 0.5)',
  wayfinder_swell_read:                    'hsla(215, 25%, 40%, 0.5)',
  wayfinder_zenith_star:                   'hsla(225, 22%, 44%, 0.5)',
  wayfinder_bird_sign:                     'hsla(210, 20%, 42%, 0.5)',
  wayfinder_cloud_stack:                   'hsla(218, 22%, 40%, 0.5)',
  wayfinder_etak:                          'hsla(222, 25%, 42%, 0.5)',
  wayfinder_phosphorescence:               'hsla(160, 25%, 40%, 0.5)',
  wayfinder_storm_drift:                   'hsla(220, 20%, 38%, 0.5)',
  wayfinder_land_scent:                    'hsla(90, 18%, 42%, 0.5)',
  wayfinder_wayfinder_seal:                'hsla(220, 28%, 46%, 0.6)',
  // S118 Receiver (The Signal Collection)
  receiver_signal_to_noise_ratio:          'hsla(200, 22%, 40%, 0.5)',
  receiver_frequency_scan:                 'hsla(195, 25%, 38%, 0.5)',
  receiver_squelch:                        'hsla(205, 20%, 42%, 0.5)',
  receiver_antenna_gain:                   'hsla(200, 22%, 36%, 0.5)',
  receiver_modulation:                     'hsla(190, 25%, 40%, 0.5)',
  receiver_interference_pattern:           'hsla(200, 20%, 38%, 0.5)',
  receiver_feedback_loop:                  'hsla(0, 22%, 42%, 0.5)',
  receiver_encryption:                     'hsla(205, 22%, 40%, 0.5)',
  receiver_broadcast_power:                'hsla(195, 22%, 42%, 0.5)',
  receiver_receiver_seal:                  'hsla(200, 28%, 44%, 0.6)',
  // S119 Vector (The Directional Force Collection)
  vector_scalar_vs_vector:                 'hsla(240, 20%, 42%, 0.5)',
  vector_resultant_force:                  'hsla(235, 22%, 40%, 0.5)',
  vector_unit_vector:                      'hsla(245, 18%, 44%, 0.5)',
  vector_cross_product:                    'hsla(240, 22%, 38%, 0.5)',
  vector_dot_product:                      'hsla(238, 20%, 42%, 0.5)',
  vector_null_vector:                      'hsla(242, 18%, 40%, 0.5)',
  vector_acceleration_vector:              'hsla(235, 22%, 44%, 0.5)',
  vector_decomposition:                    'hsla(240, 20%, 38%, 0.5)',
  vector_field_line:                       'hsla(238, 22%, 42%, 0.5)',
  vector_vector_seal:                      'hsla(240, 26%, 46%, 0.6)',
  // S120 Tuning (The Harmonic Collection)
  tuning_tension_check:                    'hsla(30, 22%, 42%, 0.5)',
  tuning_dissonance_resolve:               'hsla(25, 25%, 40%, 0.5)',
  tuning_fundamental_frequency:            'hsla(35, 20%, 44%, 0.5)',
  tuning_sympathetic_vibration:            'hsla(30, 22%, 38%, 0.5)',
  tuning_beat_frequency:                   'hsla(28, 25%, 42%, 0.5)',
  tuning_overtone_series:                  'hsla(32, 20%, 40%, 0.5)',
  tuning_dead_spot:                        'hsla(25, 22%, 44%, 0.5)',
  tuning_amplifier:                        'hsla(35, 22%, 38%, 0.5)',
  tuning_fade_out:                         'hsla(28, 20%, 42%, 0.5)',
  tuning_harmonic_seal:                    'hsla(30, 26%, 46%, 0.6)',
  // S121 Fulcrum (The Leverage Collection)
  fulcrum_pivot_point:                     'hsla(15, 28%, 42%, 0.5)',
  fulcrum_long_lever:                      'hsla(20, 25%, 40%, 0.5)',
  fulcrum_pulley_system:                   'hsla(10, 22%, 44%, 0.5)',
  fulcrum_gear_ratio:                      'hsla(18, 25%, 38%, 0.5)',
  fulcrum_wedge:                           'hsla(12, 20%, 42%, 0.5)',
  fulcrum_screw:                           'hsla(22, 22%, 40%, 0.5)',
  fulcrum_counterweight:                   'hsla(16, 25%, 44%, 0.5)',
  fulcrum_domino:                          'hsla(8, 22%, 38%, 0.5)',
  fulcrum_tipping_point:                   'hsla(14, 20%, 42%, 0.5)',
  fulcrum_fulcrum_seal:                    'hsla(15, 30%, 46%, 0.6)',
  // S122 Conductor (The Flow Collection)
  conductor_resistance_check:              'hsla(45, 22%, 42%, 0.5)',
  conductor_grounding_wire:                'hsla(50, 25%, 40%, 0.5)',
  conductor_circuit_breaker:               'hsla(40, 22%, 44%, 0.5)',
  conductor_capacitor:                     'hsla(48, 20%, 38%, 0.5)',
  conductor_transformer:                   'hsla(42, 25%, 42%, 0.5)',
  conductor_short_circuit:                 'hsla(55, 22%, 40%, 0.5)',
  conductor_parallel_circuit:              'hsla(38, 20%, 44%, 0.5)',
  conductor_switch:                        'hsla(52, 22%, 38%, 0.5)',
  conductor_ac_dc:                         'hsla(44, 25%, 42%, 0.5)',
  conductor_conductor_seal:                'hsla(45, 28%, 46%, 0.6)',
  // S123 Catalyst III (The Reaction Collection)
  catalystiii_phase_change:                'hsla(280, 22%, 42%, 0.5)',
  catalystiii_precipitate:                 'hsla(275, 25%, 40%, 0.5)',
  catalystiii_activation_energy:           'hsla(285, 20%, 44%, 0.5)',
  catalystiii_compound:                    'hsla(278, 22%, 38%, 0.5)',
  catalystiii_solvent:                     'hsla(282, 25%, 42%, 0.5)',
  catalystiii_chain_reaction:              'hsla(270, 22%, 40%, 0.5)',
  catalystiii_purification:                'hsla(288, 20%, 44%, 0.5)',
  catalystiii_inert_gas:                   'hsla(276, 22%, 38%, 0.5)',
  catalystiii_enzyme:                      'hsla(284, 25%, 42%, 0.5)',
  catalystiii_catalyst_seal:               'hsla(280, 28%, 46%, 0.6)',
  // S125 Simulator (The Mental Model Collection)
  simulator_map_vs_territory:              'hsla(190, 22%, 42%, 0.5)',
  simulator_resolution_upgrade:            'hsla(185, 25%, 40%, 0.5)',
  simulator_frame_rate:                    'hsla(195, 20%, 44%, 0.5)',
  simulator_sandbox_mode:                  'hsla(188, 22%, 38%, 0.5)',
  simulator_algorithm_audit:               'hsla(192, 25%, 42%, 0.5)',
  simulator_rendering_distance:            'hsla(182, 22%, 40%, 0.5)',
  simulator_glitch:                        'hsla(198, 20%, 44%, 0.5)',
  simulator_compression:                   'hsla(186, 22%, 38%, 0.5)',
  simulator_user_interface:                'hsla(194, 25%, 42%, 0.5)',
  simulator_simulator_seal:                'hsla(190, 28%, 46%, 0.6)',
  // S126 Editor (The Narrative Collection)
  editor_jump_cut:                         'hsla(330, 22%, 42%, 0.5)',
  editor_soundtrack_swap:                  'hsla(325, 25%, 40%, 0.5)',
  editor_flashback_edit:                   'hsla(335, 20%, 44%, 0.5)',
  editor_voiceover:                        'hsla(328, 22%, 38%, 0.5)',
  editor_b_roll:                           'hsla(332, 25%, 42%, 0.5)',
  editor_plot_twist:                       'hsla(322, 22%, 40%, 0.5)',
  editor_character_arc:                    'hsla(338, 20%, 44%, 0.5)',
  editor_foley:                            'hsla(326, 22%, 38%, 0.5)',
  editor_directors_cut:                    'hsla(334, 25%, 42%, 0.5)',
  editor_editor_seal:                      'hsla(330, 28%, 46%, 0.6)',
  // S128 Scout (The Horizon Collection)
  scout_fog_of_war:                        'hsla(100, 22%, 42%, 0.5)',
  scout_breadcrumbs:                       'hsla(95, 25%, 40%, 0.5)',
  scout_high_ground:                       'hsla(105, 20%, 44%, 0.5)',
  scout_night_vision:                      'hsla(98, 22%, 38%, 0.5)',
  scout_edge:                              'hsla(102, 25%, 42%, 0.5)',
  scout_sample:                            'hsla(92, 22%, 40%, 0.5)',
  scout_compass_bearing:                   'hsla(108, 20%, 44%, 0.5)',
  scout_false_peak:                        'hsla(96, 22%, 38%, 0.5)',
  scout_signal_fire:                       'hsla(104, 25%, 42%, 0.5)',
  scout_scout_seal:                        'hsla(100, 28%, 46%, 0.6)',
  // S129 Weaver Pattern (The Pattern Collection)
  weaverpattern_thread_pull:               'hsla(260, 22%, 42%, 0.5)',
  weaverpattern_knot:                      'hsla(255, 25%, 40%, 0.5)',
  weaverpattern_tapestry:                  'hsla(265, 20%, 44%, 0.5)',
  weaverpattern_fractal_zoom:              'hsla(258, 22%, 38%, 0.5)',
  weaverpattern_spiders_web:               'hsla(262, 25%, 42%, 0.5)',
  weaverpattern_warp_and_weft:             'hsla(252, 22%, 40%, 0.5)',
  weaverpattern_patchwork:                 'hsla(268, 20%, 44%, 0.5)',
  weaverpattern_cut:                       'hsla(256, 22%, 38%, 0.5)',
  weaverpattern_invisible_string:          'hsla(264, 25%, 42%, 0.5)',
  weaverpattern_weaver_seal:               'hsla(260, 28%, 46%, 0.6)',
  // S130 Anchor (The Stability Collection)
  anchor_heavy_stone:                      'hsla(70, 18%, 42%, 0.5)',
  anchor_deep_root:                        'hsla(65, 20%, 40%, 0.5)',
  anchor_gyroscope:                        'hsla(75, 18%, 44%, 0.5)',
  anchor_keel:                             'hsla(68, 20%, 38%, 0.5)',
  anchor_friction_brake:                   'hsla(72, 18%, 42%, 0.5)',
  anchor_center_of_mass:                   'hsla(62, 20%, 40%, 0.5)',
  anchor_deadman_anchor:                   'hsla(78, 18%, 44%, 0.5)',
  anchor_lighthouse:                       'hsla(66, 20%, 38%, 0.5)',
  anchor_sediment:                         'hsla(74, 18%, 42%, 0.5)',
  anchor_anchor_seal:                      'hsla(70, 24%, 46%, 0.6)',
  // S131 Strategist (The Game Theory Collection)
  strategist_first_mover:                  'hsla(350, 22%, 42%, 0.5)',
  strategist_sacrifice:                    'hsla(345, 25%, 40%, 0.5)',
  strategist_titfortat:                    'hsla(355, 20%, 44%, 0.5)',
  strategist_fog_of_war:                   'hsla(348, 22%, 38%, 0.5)',
  strategist_fork:                         'hsla(352, 25%, 42%, 0.5)',
  strategist_zugzwang:                     'hsla(342, 22%, 40%, 0.5)',
  strategist_endgame:                      'hsla(358, 20%, 44%, 0.5)',
  strategist_stalemate:                    'hsla(346, 22%, 38%, 0.5)',
  strategist_promotion:                    'hsla(354, 25%, 42%, 0.5)',
  strategist_strategist_seal:              'hsla(350, 28%, 46%, 0.6)',
  // S132 Network (The Connection Collection)
  network_node_strength:                   'hsla(210, 22%, 42%, 0.5)',
  network_weak_tie:                        'hsla(205, 25%, 40%, 0.5)',
  network_viral_coefficient:               'hsla(215, 20%, 44%, 0.5)',
  network_echo_chamber:                    'hsla(208, 22%, 38%, 0.5)',
  network_metcalfes_law:                   'hsla(212, 25%, 42%, 0.5)',
  network_packet_switching:                'hsla(202, 22%, 40%, 0.5)',
  network_signal_boost:                    'hsla(218, 20%, 44%, 0.5)',
  network_firewall:                        'hsla(206, 22%, 38%, 0.5)',
  network_neural_net:                      'hsla(214, 25%, 42%, 0.5)',
  network_network_seal:                    'hsla(210, 28%, 46%, 0.6)',
  // S133 Systems Architect (The Systems Collection)
  systemsarchitect_bottleneck:             'hsla(300, 18%, 42%, 0.5)',
  systemsarchitect_feedback_delay:         'hsla(295, 20%, 40%, 0.5)',
  systemsarchitect_redundancy:             'hsla(305, 18%, 44%, 0.5)',
  systemsarchitect_leverage_point:         'hsla(298, 20%, 38%, 0.5)',
  systemsarchitect_stock_and_flow:         'hsla(302, 18%, 42%, 0.5)',
  systemsarchitect_oscillation_damping:    'hsla(292, 20%, 40%, 0.5)',
  systemsarchitect_emergence:              'hsla(308, 18%, 44%, 0.5)',
  systemsarchitect_scalability:            'hsla(296, 20%, 38%, 0.5)',
  systemsarchitect_black_swan:             'hsla(304, 18%, 42%, 0.5)',
  systemsarchitect_architect_seal:         'hsla(300, 24%, 46%, 0.6)',
  // S134 Evolutionist (The Adaptation Collection)
  evolutionist_mutation:                   'hsla(130, 22%, 42%, 0.5)',
  evolutionist_selection_pressure:         'hsla(125, 25%, 40%, 0.5)',
  evolutionist_niche:                      'hsla(135, 20%, 44%, 0.5)',
  evolutionist_symbiosis:                  'hsla(128, 22%, 38%, 0.5)',
  evolutionist_red_queen:                  'hsla(132, 25%, 42%, 0.5)',
  evolutionist_extinction_event:           'hsla(122, 22%, 40%, 0.5)',
  evolutionist_sexual_selection:           'hsla(138, 20%, 44%, 0.5)',
  evolutionist_exaptation:                 'hsla(126, 22%, 38%, 0.5)',
  evolutionist_gene_drive:                 'hsla(134, 25%, 42%, 0.5)',
  evolutionist_evolution_seal:             'hsla(130, 28%, 46%, 0.6)',
  // S135 Economist (The Value Collection)
  economist_opportunity_cost:              'hsla(55, 22%, 42%, 0.5)',
  economist_sunk_cost:                     'hsla(50, 25%, 40%, 0.5)',
  economist_compound_interest:             'hsla(60, 20%, 44%, 0.5)',
  economist_supply_and_demand:             'hsla(53, 22%, 38%, 0.5)',
  economist_asymmetric_bet:                'hsla(57, 25%, 42%, 0.5)',
  economist_utility_function:              'hsla(48, 22%, 40%, 0.5)',
  economist_time_horizon:                  'hsla(62, 20%, 44%, 0.5)',
  economist_arbitrage:                     'hsla(51, 22%, 38%, 0.5)',
  economist_invisible_hand:                'hsla(58, 25%, 42%, 0.5)',
  economist_economist_seal:                'hsla(55, 28%, 46%, 0.6)',
  // S136 Politician (The Power Collection)
  politician_coalition:                    'hsla(0, 22%, 42%, 0.5)',
  politician_optics:                       'hsla(355, 25%, 40%, 0.5)',
  politician_favor_bank:                   'hsla(5, 20%, 44%, 0.5)',
  politician_strange_bedfellow:            'hsla(358, 22%, 38%, 0.5)',
  politician_silent_vote:                  'hsla(2, 25%, 42%, 0.5)',
  politician_compromise:                   'hsla(352, 22%, 40%, 0.5)',
  politician_leverage:                     'hsla(8, 20%, 44%, 0.5)',
  politician_fall_guy:                     'hsla(356, 22%, 38%, 0.5)',
  politician_long_game:                    'hsla(4, 25%, 42%, 0.5)',
  politician_politician_seal:              'hsla(0, 28%, 46%, 0.6)',
  // S137 Warrior II (The Conflict Collection)
  warriorii_formless:                      'hsla(340, 22%, 42%, 0.5)',
  warriorii_high_ground:                   'hsla(335, 25%, 40%, 0.5)',
  warriorii_retreat:                       'hsla(345, 20%, 44%, 0.5)',
  warriorii_spy:                           'hsla(338, 22%, 38%, 0.5)',
  warriorii_burning_bridge:                'hsla(342, 25%, 42%, 0.5)',
  warriorii_sun_at_your_back:              'hsla(332, 22%, 40%, 0.5)',
  warriorii_empty_fort:                    'hsla(348, 20%, 44%, 0.5)',
  warriorii_flanking_maneuver:             'hsla(336, 22%, 38%, 0.5)',
  warriorii_peace_treaty:                  'hsla(344, 25%, 42%, 0.5)',
  warriorii_warrior_seal:                  'hsla(340, 28%, 46%, 0.6)',
  // S138 Sovereign (The Governance Collection)
  sovereign_constitution:                  'hsla(250, 22%, 42%, 0.5)',
  sovereign_court:                         'hsla(245, 25%, 40%, 0.5)',
  sovereign_treasury:                      'hsla(255, 20%, 44%, 0.5)',
  sovereign_border:                        'hsla(248, 22%, 38%, 0.5)',
  sovereign_decree:                        'hsla(252, 25%, 42%, 0.5)',
  sovereign_succession:                    'hsla(242, 22%, 40%, 0.5)',
  sovereign_diplomaticimmunity:            'hsla(258, 20%, 44%, 0.5)',
  sovereign_infrastructure:                'hsla(246, 22%, 38%, 0.5)',
  sovereign_rebellion:                     'hsla(254, 25%, 42%, 0.5)',
  sovereign_sovereign_seal:                'hsla(250, 28%, 46%, 0.6)',
  // S139 Historian (The Time Collection)
  historian_lindyeffect:                   'hsla(38, 22%, 42%, 0.5)',
  historian_cycle:                         'hsla(33, 25%, 40%, 0.5)',
  historian_blackswan:                     'hsla(43, 20%, 44%, 0.5)',
  historian_renaissance:                   'hsla(36, 22%, 38%, 0.5)',
  historian_ruins:                         'hsla(40, 25%, 42%, 0.5)',
  historian_pendulum:                      'hsla(30, 22%, 40%, 0.5)',
  historian_goldenage:                     'hsla(46, 20%, 44%, 0.5)',
  historian_fourthturning:                 'hsla(34, 22%, 38%, 0.5)',
  historian_zeitgeist:                     'hsla(42, 25%, 42%, 0.5)',
  historian_historian_seal:                'hsla(38, 28%, 46%, 0.6)',
  // S140 Game Designer (The Meta Collection)
  gamedesigner_infinitegame:               'hsla(160, 22%, 42%, 0.5)',
  gamedesigner_incentivestructure:         'hsla(155, 25%, 40%, 0.5)',
  gamedesigner_mod:                        'hsla(165, 20%, 44%, 0.5)',
  gamedesigner_npc:                        'hsla(158, 22%, 38%, 0.5)',
  gamedesigner_levelup:                    'hsla(162, 25%, 42%, 0.5)',
  gamedesigner_bossfight:                  'hsla(152, 22%, 40%, 0.5)',
  gamedesigner_savepoint:                  'hsla(168, 20%, 44%, 0.5)',
  gamedesigner_expansionpack:              'hsla(156, 22%, 38%, 0.5)',
  gamedesigner_godmode:                    'hsla(164, 25%, 42%, 0.5)',
  gamedesigner_atlas_seal:                 'hsla(160, 28%, 46%, 0.6)',
};

export function LabViewer({ mounted, previewMode }: LabViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [justCompleted, setJustCompleted] = useState(false);
  const justCompletedTimerRef = useRef<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setResetKey(prev => prev + 1);
    setJustCompleted(false);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < LAB_NAVICUES.length - 1) navigateTo(currentIndex + 1);
  }, [currentIndex, navigateTo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) navigateTo(currentIndex - 1);
  }, [currentIndex, navigateTo]);

  const handleResponse = useCallback(() => {
    setCompletedSet(prev => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
    setJustCompleted(true);
    if (justCompletedTimerRef.current) clearTimeout(justCompletedTimerRef.current);
    justCompletedTimerRef.current = window.setTimeout(() => setJustCompleted(false), 4000);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape' && drawerOpen) setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, drawerOpen]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (justCompletedTimerRef.current) clearTimeout(justCompletedTimerRef.current);
    };
  }, []);

  const previewDimensions = previewMode === 'mobile'
    ? { width: '390px', height: '844px' }
    : { width: '1440px', height: '900px' };

  const currentNavicue = LAB_NAVICUES[currentIndex];
  if (!currentNavicue) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.neutral.gray[400] }}>
        Loading specimens\u2026
      </div>
    );
  }

  const accentColor = SIGNATURE_COLORS[currentNavicue._lab_signature] || colors.accent.cyan.primary;
  const currentAct = getActForIndex(currentIndex);
  const specimenInAct = currentAct ? currentIndex - currentAct.start + 1 : 0;

  return (
    <div
      style={{
        height: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Collection Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <CollectionDrawer
            navicues={LAB_NAVICUES}
            currentIndex={currentIndex}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={navigateTo}
            onClose={() => setDrawerOpen(false)}
            completedSet={completedSet}
          />
        )}
      </AnimatePresence>

      {/* Navigation arrows */}
      <NavHint direction="left" onClick={goPrev} disabled={currentIndex === 0} />
      <NavHint direction="right" onClick={goNext} disabled={currentIndex === LAB_NAVICUES.length - 1} />

      {/* Main column: info strip + phone frame + scrubber */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '100%',
        }}
      >
        {/* \u2500\u2500 Enhanced Info Strip \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
        <motion.div
          key={`info-${currentIndex}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Act context */}
          {currentAct && (
            <div
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: colors.neutral.gray[400],
                fontFamily: fonts.mono,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {currentAct.label} \u00b7 {currentAct.subtitle}
            </div>
          )}

          {/* Specimen title */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: colors.neutral.white,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}
          >
            {currentNavicue._lab_title}
          </div>

          {/* Taxonomy */}
          <div
            style={{
              fontSize: '12px',
              color: colors.neutral.gray[400],
              fontFamily: fonts.mono,
              letterSpacing: '0.03em',
            }}
          >
            {currentNavicue._lab_subtitle}
          </div>

          {/* Signature + position */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: accentColor,
                  boxShadow: `0 0 8px ${accentColor}`,
                }}
              />
              <div
                style={{
                  fontSize: '11px',
                  color: accentColor,
                  fontFamily: fonts.mono,
                  letterSpacing: '0.05em',
                }}
              >
                {currentNavicue._lab_signature}
              </div>
            </div>
            {currentAct && (
              <div
                style={{
                  fontSize: '10px',
                  color: colors.neutral.gray[500],
                  fontFamily: fonts.mono,
                }}
              >
                {specimenInAct} of {currentAct.count}
              </div>
            )}
          </div>
        </motion.div>

        {/* \u2500\u2500 Phone / Desktop Frame (HERO) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: previewDimensions.width,
            height: previewDimensions.height,
            maxWidth: 'calc(100vw - 120px)',
            maxHeight: 'calc(100vh - 300px)',
            position: 'relative',
            borderRadius: previewMode === 'mobile' ? '48px' : '20px',
            overflow: 'hidden',
            boxShadow: previewMode === 'mobile'
              ? `0 60px 120px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 80px -20px ${accentColor}`
              : `0 40px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.03), 0 0 60px -20px ${accentColor}`,
            backgroundColor: surfaces.solid.base,
            transition: 'box-shadow 0.8s ease',
          }}
        >
          {/* Content layer */}
          <motion.div
            key={`lab-${resetKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overscrollBehavior: 'contain' as any,
              WebkitOverflowScrolling: 'touch' as any,
            }}
          >
            <NaviCueLabProvider>
              <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                <NaviCueMasterRenderer
                  navicueTypeData={currentNavicue}
                  onResponse={handleResponse}
                  previewMode={previewMode}
                />
              </div>
            </NaviCueLabProvider>
          </motion.div>

          {/* Counter \u2014 top right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              position: 'absolute',
              top: previewMode === 'mobile' ? '20px' : '24px',
              right: previewMode === 'mobile' ? '20px' : '32px',
              fontSize: '10px',
              fontWeight: 500,
              color: colors.neutral.gray[500],
              fontFamily: fonts.mono,
              zIndex: 20,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AnimatePresence>
              {justCompleted && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    color: accentColor,
                    fontSize: '10px',
                    fontFamily: fonts.mono,
                    letterSpacing: '0.05em',
                  }}
                >
                  arc complete
                </motion.span>
              )}
            </AnimatePresence>
            {currentIndex + 1}/{LAB_NAVICUES.length}
          </motion.div>
        </motion.div>

        {/* \u2500\u2500 Act Scrubber + Controls \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
        <div
          style={{
            width: previewMode === 'mobile' ? '420px' : '100%',
            maxWidth: previewMode === 'mobile' ? '420px' : previewDimensions.width,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <ActScrubber
            currentIndex={currentIndex}
            completedSet={completedSet}
            accentColor={accentColor}
            onNavigate={navigateTo}
          />

          {/* Bottom controls row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Drawer toggle */}
            <motion.button
              onClick={() => setDrawerOpen(!drawerOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: `1px solid ${colors.neutral.gray[100]}`,
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                color: colors.neutral.gray[400],
                fontSize: '11px',
                fontFamily: fonts.mono,
                letterSpacing: '0.03em',
              }}
            >
              <LayoutList size={12} />
              Collection
            </motion.button>

            {/* Counter */}
            <div
              style={{
                fontSize: '11px',
                color: colors.neutral.gray[500],
                fontFamily: fonts.mono,
                letterSpacing: '0.05em',
              }}
            >
              {currentIndex + 1} of {LAB_NAVICUES.length}
            </div>

            {/* Keyboard hint */}
            <div
              style={{
                fontSize: '10px',
                color: colors.neutral.gray[300],
                fontFamily: fonts.mono,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <kbd
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${colors.neutral.gray[100]}`,
                  borderRadius: '3px',
                  padding: '1px 5px',
                  fontSize: '10px',
                  color: colors.neutral.gray[400],
                  fontFamily: fonts.mono,
                }}
              >\u2190</kbd>
              <kbd
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${colors.neutral.gray[100]}`,
                  borderRadius: '3px',
                  padding: '1px 5px',
                  fontSize: '10px',
                  color: colors.neutral.gray[400],
                  fontFamily: fonts.mono,
                }}
              >\u2192</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// \u2500\u2500 Act Scrubber \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function ActScrubber({
  currentIndex,
  completedSet,
  accentColor,
  onNavigate,
}: {
  currentIndex: number;
  completedSet: Set<number>;
  accentColor: string;
  onNavigate: (index: number) => void;
}) {
  const [hoveredAct, setHoveredAct] = useState<ActGroup | null>(null);
  const total = LAB_NAVICUES.length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Scrubber track */}
      <div
        style={{
          display: 'flex',
          height: '4px',
          borderRadius: '2px',
          overflow: 'hidden',
          gap: '1px',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {ACT_GROUPS.map(act => {
          const width = (act.count / total) * 100;
          const isCurrent = currentIndex >= act.start && currentIndex < act.start + act.count;
          let completedInAct = 0;
          for (let j = act.start; j < act.start + act.count; j++) {
            if (completedSet.has(j)) completedInAct++;
          }
          const progress = completedInAct / act.count;

          return (
            <button
              key={act.id}
              onClick={() => onNavigate(act.start)}
              onMouseEnter={() => setHoveredAct(act)}
              onMouseLeave={() => setHoveredAct(null)}
              title={`${act.label} \u00b7 ${act.subtitle}`}
              style={{
                width: `${Math.max(width, 0.4)}%`,
                height: '100%',
                background: isCurrent
                  ? accentColor
                  : progress > 0
                    ? `rgba(255,255,255,${0.06 + progress * 0.18})`
                    : 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredAct && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '-28px',
              left: `${((hoveredAct.start + hoveredAct.count / 2) / total) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'rgba(17, 23, 30, 0.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${colors.neutral.gray[100]}`,
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '10px',
              color: colors.neutral.gray[600],
              fontFamily: fonts.mono,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            {hoveredAct.label} \u00b7 {hoveredAct.subtitle}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// \u2500\u2500 Collection Drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function CollectionDrawer({
  navicues,
  currentIndex,
  searchQuery,
  onSearchChange,
  onSelect,
  onClose,
  completedSet,
}: {
  navicues: typeof LAB_NAVICUES;
  currentIndex: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (index: number) => void;
  onClose: () => void;
  completedSet: Set<number>;
}) {
  const currentItemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to current on open
  useEffect(() => {
    const t = setTimeout(() => {
      if (currentItemRef.current) {
        currentItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const query = searchQuery.toLowerCase().trim();

  const filteredActs = useMemo(() => {
    return ACT_GROUPS.map(act => {
      const indices: number[] = [];
      for (let i = act.start; i < act.start + act.count; i++) {
        const nc = navicues[i];
        if (!nc) continue;
        if (!query || nc._lab_title.toLowerCase().includes(query) || nc._lab_signature.toLowerCase().includes(query) || nc._lab_subtitle.toLowerCase().includes(query)) {
          indices.push(i);
        }
      }
      return { ...act, indices };
    }).filter(a => a.indices.length > 0);
  }, [query, navicues]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 25,
        }}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '300px',
          background: 'rgba(17, 23, 30, 0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          borderRight: `1px solid ${colors.neutral.gray[100]}`,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 16px 12px',
            borderBottom: `1px solid ${colors.neutral.gray[50]}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: colors.neutral.white,
                fontFamily: fonts.primary,
              }}
            >
              Collection
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: colors.neutral.gray[400],
              }}
            >
              <X size={14} />
            </motion.button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.neutral.gray[400],
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search specimens\u2026"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${colors.neutral.gray[100]}`,
                borderRadius: radius.sm,
                padding: '7px 10px 7px 30px',
                color: colors.neutral.white,
                fontSize: '12px',
                fontFamily: fonts.primary,
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '10px',
              color: colors.neutral.gray[400],
              fontFamily: fonts.mono,
              marginTop: '8px',
              letterSpacing: '0.03em',
            }}
          >
            {completedSet.size} explored \u00b7 {navicues.length} total
          </div>
        </div>

        {/* Scrollable list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          {filteredActs.map(act => {
            const isCurrentAct = currentIndex >= act.start && currentIndex < act.start + act.count;
            let completedInAct = 0;
            for (let j = act.start; j < act.start + act.count; j++) {
              if (completedSet.has(j)) completedInAct++;
            }

            return (
              <div key={act.id}>
                {/* Act header */}
                <div
                  style={{
                    padding: '10px 16px 4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: isCurrentAct ? colors.neutral.gray[700] : colors.neutral.gray[400],
                      fontFamily: fonts.mono,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {act.label}
                    <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
                      {act.subtitle}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: colors.neutral.gray[300],
                      fontFamily: fonts.mono,
                    }}
                  >
                    {completedInAct}/{act.count}
                  </div>
                </div>

                {/* Specimens */}
                {act.indices.map(idx => {
                  const nc = navicues[idx];
                  if (!nc) return null;
                  const isCurrent = idx === currentIndex;
                  const isCompleted = completedSet.has(idx);
                  const sigColor = SIGNATURE_COLORS[nc._lab_signature] || colors.accent.cyan.primary;

                  return (
                    <button
                      key={nc.navicue_type_id}
                      ref={isCurrent ? currentItemRef : undefined}
                      onClick={() => onSelect(idx)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 16px 5px 24px',
                        background: isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left' as const,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: isCurrent
                            ? sigColor
                            : isCompleted
                              ? sigColor.replace(/[\d.]+\)$/, '0.4)')
                              : 'rgba(255,255,255,0.15)',
                          flexShrink: 0,
                          boxShadow: isCurrent ? `0 0 6px ${sigColor}` : 'none',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '12px',
                          color: isCurrent ? colors.neutral.white : colors.neutral.gray[500],
                          fontFamily: fonts.primary,
                          fontWeight: isCurrent ? 500 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {nc._lab_title}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// \u2500\u2500 Navigation arrow \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function NavHint({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  if (disabled) return null;
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        [direction]: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.neutral.gray[50]}`,
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: 0.3,
        transition: 'all 0.3s ease',
        zIndex: 10,
      }}
    >
      <Icon size={20} style={{ color: colors.neutral.white }} />
    </motion.button>
  );
}