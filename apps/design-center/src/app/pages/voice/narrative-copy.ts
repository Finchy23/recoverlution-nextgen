/**
 * NARRATIVE COPY — Per-Atom Breathing HUD Derivation
 * ===================================================
 * Derives the 7 Narrative Payload elements for any atom x voice lane.
 *
 * Maps from the existing series voice templates (atomic-voice-copy.ts)
 * into the new NarrativePayload structure. This is the bridge layer
 * during migration — in production, the Supabase LLM pipeline will
 * generate NarrativePayload directly as JSON.
 *
 * Architecture:
 *   1. Series-level narrative templates (20 series x 5 voice lanes)
 *   2. Per-atom overrides from existing copy data
 *   3. Collapse model derived from atom's primary gesture
 *   4. Narrative density defaults to 'core' (override via composition)
 *
 * See: /src/imports/breathing-hud-spec.md
 */

import type { AtomId, SeriesId } from '@/app/components/atoms/types';
import { ATOM_CATALOG, SERIES_CATALOG } from '@/app/components/atoms';
import type {
  VoiceLaneId,
  NarrativePayload,
  NarrativeDensity,
  CollapseModel,
  HookPosition,
  GestureId,
  EntranceArchitectureId,
} from '@/navicue-types';
import { getAtomicVoiceCopy } from './atomic-voice-copy';

// =====================================================================
// TYPES
// =====================================================================

/** The flat copy template per series x voice lane (for authoring convenience) */
interface NarrativeTemplate {
  /** Inbound Hook — bridges from previous NaviCue */
  inboundHook: string;
  /** Narrative Canopy — the Why (<=40 words) */
  narrativeCanopy: string;
  /** Canopy Condensed — re-toggle summary (<=8 words) */
  canopyCondensed: string;
  /** Ambient Subtext — user's anxious voice, lowercase, first-person */
  ambientSubtext: string;
  /** Idle Whisper — invite (no-touch 5s) */
  idleInvite: string;
  /** Idle Whisper — hint (stuck 4s) */
  idleHint: string;
  /** Outbound Receipt — exit stamp */
  outboundReceipt: string;
}

// =====================================================================
// COLLAPSE MODEL DERIVATION
// =====================================================================

/** Maps atom's primary gesture → collapse model */
export function deriveCollapseModel(gesture: GestureId): CollapseModel {
  switch (gesture) {
    case 'breathe':
      return 'breath-cycles';
    case 'tap':
    case 'hold':
    case 'drag':
    case 'swipe':
    case 'pinch':
      return 'touch';
    default:
      return 'timed';
  }
}

/** Maps entrance architecture → hook position */
export function deriveHookPosition(entrance: EntranceArchitectureId): HookPosition {
  switch (entrance) {
    case 'the-emergence':
    case 'the-gathering':
      return 'bottom-rise';
    case 'the-dissolution':
    case 'the-threshold':
      return 'peripheral';
    case 'the-silence':
    case 'the-breath-gate':
    case 'the-scene-build':
    case 'cold-arrival':
    default:
      return 'center-fade';
  }
}

// =====================================================================
// SERIES NARRATIVE TEMPLATES
// =====================================================================
// Each series has a distinct therapeutic domain. The templates map the
// old 8-variable model into the new 7-element narrative structure.
// The `semanticPill` (before/after) is derived from the existing
// thresholdShift data in atomic-voice-copy.ts.

const S1: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'We have been here before',
    narrativeCanopy: 'You are carrying the weight of every unfinished thought. Right now, the only physics that matters is the one beneath your hands. Let the weight teach you something about letting go.',
    canopyCondensed: 'Let the weight teach you',
    ambientSubtext: 'i have to hold it all together',
    idleInvite: 'hold the center',
    idleHint: 'breathe and release',
    outboundReceipt: 'We made room. Something shifted.',
  },
  coach: {
    inboundHook: 'New round. Eyes up.',
    narrativeCanopy: 'The body does not negotiate. It stores every avoidance as tension and every confrontation as release. This is the confrontation. Engage the engine.',
    canopyCondensed: 'Engage the engine',
    ambientSubtext: 'what if i fail at this too',
    idleInvite: 'push through center',
    idleHint: 'harder. commit.',
    outboundReceipt: 'Cleared. Next play.',
  },
  mirror: {
    inboundHook: 'Notice what just shifted',
    narrativeCanopy: 'What happens when you stop pushing and start watching? The force was never coming from outside. It was the expectation you brought with you. Watch what the physics reveals.',
    canopyCondensed: 'Watch what the physics reveals',
    ambientSubtext: 'who is the one watching this move',
    idleInvite: 'what happens if you hold',
    idleHint: 'where is the resistance',
    outboundReceipt: 'What did you just release?',
  },
  narrator: {
    inboundHook: 'The pattern resurfaces',
    narrativeCanopy: 'A system in motion tends to stay in motion. The same thought loop, the same tension, the same holding. But a system can also be interrupted. A single point of contact changes the trajectory.',
    canopyCondensed: 'A single point changes everything',
    ambientSubtext: 'every action carries an equal truth',
    idleInvite: 'the hand finds the center',
    idleHint: 'observe the trajectory',
    outboundReceipt: 'The weather passed. The sky remained.',
  },
  activator: {
    inboundHook: 'Again.',
    narrativeCanopy: 'Stop thinking. The loop in your head is a program running on borrowed energy. This physics engine runs on contact. Touch it.',
    canopyCondensed: 'Touch it',
    ambientSubtext: 'move or be moved',
    idleInvite: 'break it',
    idleHint: 'harder',
    outboundReceipt: 'Done. Move.',
  },
};

const S2: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'Something is trying to settle',
    narrativeCanopy: 'The scattered feeling is not chaos. It is every possibility trying to exist at once. Your attention is the collapse function. Place it gently and watch the wave become a particle.',
    canopyCondensed: 'Place your attention gently',
    ambientSubtext: 'i can not focus on anything',
    idleInvite: 'rest your gaze here',
    idleHint: 'stay with one point',
    outboundReceipt: 'One point of certainty is enough.',
  },
  coach: {
    inboundHook: 'Lock in.',
    narrativeCanopy: 'Scattered attention is scattered energy. This is a focusing exercise disguised as physics. Pick a point. Collapse the wave. One decision cuts through the noise.',
    canopyCondensed: 'One decision. Now.',
    ambientSubtext: 'there are too many options',
    idleInvite: 'collapse the wave',
    idleHint: 'commit to one point',
    outboundReceipt: 'Locked. Move forward.',
  },
  mirror: {
    inboundHook: 'What is trying to become certain',
    narrativeCanopy: 'The blur is not a problem to solve. It is a question to sit with. What do you notice when you stop trying to see clearly and just observe the probability field?',
    canopyCondensed: 'What do you notice in the blur',
    ambientSubtext: 'what if i choose wrong',
    idleInvite: 'where does clarity live',
    idleHint: 'what are you avoiding',
    outboundReceipt: 'The observer creates the observation.',
  },
  narrator: {
    inboundHook: 'The wave function awaits',
    narrativeCanopy: 'In quantum mechanics, a particle exists in all states until measured. The anxious mind works the same way. Every possible outcome alive at once. Measurement is the mercy.',
    canopyCondensed: 'Measurement is the mercy',
    ambientSubtext: 'all states alive at once',
    idleInvite: 'measure the field',
    idleHint: 'which state collapses',
    outboundReceipt: 'The wave collapsed. One state remains.',
  },
  activator: {
    inboundHook: 'Decide.',
    narrativeCanopy: 'The cloud of maybe is a prison. This engine collapses when you touch it. One point of contact. One decision. The rest dissolves.',
    canopyCondensed: 'One touch dissolves the rest',
    ambientSubtext: 'what if what if what if',
    idleInvite: 'collapse it',
    idleHint: 'now',
    outboundReceipt: 'Decided. Gone.',
  },
};

const S3: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'Something is growing here',
    narrativeCanopy: 'Growth does not announce itself. It happens in the dark, underground, before anyone can see it. The thing you planted months ago is pushing through. Let it reach the light.',
    canopyCondensed: 'Let it reach the light',
    ambientSubtext: 'nothing is changing for me',
    idleInvite: 'tend the growth',
    idleHint: 'patience is the water',
    outboundReceipt: 'The roots took hold.',
  },
  coach: {
    inboundHook: 'Root deeper.',
    narrativeCanopy: 'The seed does not negotiate with the soil. It pushes through or it does not. Your resistance is the soil. This interaction is the pushing. Go.',
    canopyCondensed: 'Push through the resistance',
    ambientSubtext: 'i am not making progress',
    idleInvite: 'plant the root',
    idleHint: 'push harder',
    outboundReceipt: 'Rooted. Grow from here.',
  },
  mirror: {
    inboundHook: 'What season is this',
    narrativeCanopy: 'Not everything that looks like decay is dying. Sometimes the strongest growth requires the deepest pruning. What are you assuming is dead that might just be dormant?',
    canopyCondensed: 'What might just be dormant',
    ambientSubtext: 'everything good dies eventually',
    idleInvite: 'prune the branch',
    idleHint: 'which part is still alive',
    outboundReceipt: 'The strongest trees have the deepest scars.',
  },
  narrator: {
    inboundHook: 'The mycelium remembers',
    narrativeCanopy: 'Beneath the visible forest, a network of fungal threads carries information between trees. No single root stands alone. The signal you send into this physics reaches further than you can see.',
    canopyCondensed: 'No single root stands alone',
    ambientSubtext: 'i am isolated from everything',
    idleInvite: 'trace the root',
    idleHint: 'follow the signal',
    outboundReceipt: 'The network carried the signal.',
  },
  activator: {
    inboundHook: 'Break soil.',
    narrativeCanopy: 'The seed is done waiting. The dormancy was never rest. It was loading. The spring mechanism is wound. Release it.',
    canopyCondensed: 'Release it',
    ambientSubtext: 'i have been stuck so long',
    idleInvite: 'break soil',
    idleHint: 'erupt',
    outboundReceipt: 'Bloomed. Do not look back.',
  },
};

const S4: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The weight is asking to be set down',
    narrativeCanopy: 'You are carrying the expectation of an entire room. None of it was handed to you. You picked it up because silence felt like failure. Step to the side and let it fall.',
    canopyCondensed: 'Step aside and let it fall',
    ambientSubtext: 'but what if they need me',
    idleInvite: 'let it fall',
    idleHint: 'what are you still holding',
    outboundReceipt: 'The floor held. It always does.',
  },
  coach: {
    inboundHook: 'Strip it back.',
    narrativeCanopy: 'Everything that is not load-bearing is decoration. This is a stress test for your attention. What can you remove without the structure collapsing? That is what you never needed.',
    canopyCondensed: 'Remove what you never needed',
    ambientSubtext: 'i need all of this to survive',
    idleInvite: 'strip it back',
    idleHint: 'what is decoration',
    outboundReceipt: 'Lighter. Faster. Clearer.',
  },
  mirror: {
    inboundHook: 'What are you protecting',
    narrativeCanopy: 'The labels you carry were written by someone else. The identity you defend was assembled in a room you have already left. What happens when you erase the name and see what remains?',
    canopyCondensed: 'See what remains',
    ambientSubtext: 'without this i am nothing',
    idleInvite: 'erase the name',
    idleHint: 'what remains without it',
    outboundReceipt: 'You were always the silence beneath the story.',
  },
  narrator: {
    inboundHook: 'The sculptor sees the form',
    narrativeCanopy: 'Michelangelo said the sculpture was already inside the marble. His job was to remove the stone that did not belong. The shape of your peace already exists. The excess is what hurts.',
    canopyCondensed: 'The excess is what hurts',
    ambientSubtext: 'i am afraid of what is underneath',
    idleInvite: 'remove the stone',
    idleHint: 'chisel the excess',
    outboundReceipt: 'The form was always there.',
  },
  activator: {
    inboundHook: 'Drop it.',
    narrativeCanopy: 'You are carrying dead weight and calling it identity. This physics engine is subtraction. Every touch removes. Go until there is nothing left that does not belong.',
    canopyCondensed: 'Subtract until clear',
    ambientSubtext: 'i need these layers',
    idleInvite: 'drop it',
    idleHint: 'more',
    outboundReceipt: 'Bare. Free. Done.',
  },
};

const S5: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The frequency is changing',
    narrativeCanopy: 'Every cell in your body vibrates at a frequency you forgot to listen to. The static in your head is not noise. It is a signal that lost its carrier wave. Breathe and let the frequency lock.',
    canopyCondensed: 'Let the frequency lock',
    ambientSubtext: 'i can not hear myself anymore',
    idleInvite: 'breathe with it',
    idleHint: 'sync your breath',
    outboundReceipt: 'The signal found its frequency.',
  },
  coach: {
    inboundHook: 'Find the signal.',
    narrativeCanopy: 'Your nervous system is broadcasting on the wrong channel. This is a tuning exercise. The dissonance you feel is not damage. It is misalignment. Lock the frequency.',
    canopyCondensed: 'Lock the frequency',
    ambientSubtext: 'something is off and i can not fix it',
    idleInvite: 'lock the frequency',
    idleHint: 'adjust the dial',
    outboundReceipt: 'Tuned. Signal clear.',
  },
  mirror: {
    inboundHook: 'What note is playing',
    narrativeCanopy: 'If you listen past the noise, there is a tone underneath. It has always been there. The anxiety, the overthinking, the planning — all of it just harmonics of one fundamental note. What is it?',
    canopyCondensed: 'What is the fundamental note',
    ambientSubtext: 'everything is too loud',
    idleInvite: 'hear the signal',
    idleHint: 'listen deeper',
    outboundReceipt: 'The tone was yours all along.',
  },
  narrator: {
    inboundHook: 'The waveform stabilizes',
    narrativeCanopy: 'Sound is a pressure wave moving through a medium. Anxiety is the same. A wave of activation moving through a nervous system. Waves have properties: frequency, amplitude, phase. All can be modulated.',
    canopyCondensed: 'All waves can be modulated',
    ambientSubtext: 'i am vibrating at the wrong speed',
    idleInvite: 'trace the wave',
    idleHint: 'find the node',
    outboundReceipt: 'The wave found its rest position.',
  },
  activator: {
    inboundHook: 'Ride it.',
    narrativeCanopy: 'The rumble in your chest is not a threat. It is fuel. This engine converts that raw frequency into something you can use. Ride the wave or be crushed by it.',
    canopyCondensed: 'Ride it or be crushed',
    ambientSubtext: 'i can not control this feeling',
    idleInvite: 'ride the wave',
    idleHint: 'harder',
    outboundReceipt: 'Surfaced. Peak passed.',
  },
};

const S6: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The program just glitched',
    narrativeCanopy: 'That loop you keep running is not you. It is a script someone else wrote that you never updated. This space tears the autopilot apart so you can see the source code. Let the glitch show you the gap.',
    canopyCondensed: 'Let the glitch show the gap',
    ambientSubtext: 'i can not stop the loop',
    idleInvite: 'watch the tear',
    idleHint: 'where is the seam',
    outboundReceipt: 'The program crashed. You survived it.',
  },
  coach: {
    inboundHook: 'Break the pattern.',
    narrativeCanopy: 'Autopilot is a survival strategy with an expiration date. The routine that protected you is now the cage. This engine deliberately glitches your habits. Lean into the disruption.',
    canopyCondensed: 'Lean into the disruption',
    ambientSubtext: 'but the routine keeps me safe',
    idleInvite: 'disrupt it',
    idleHint: 'break the cycle',
    outboundReceipt: 'Pattern interrupted. New code loaded.',
  },
  mirror: {
    inboundHook: 'What is running on autopilot',
    narrativeCanopy: 'The glitch is not the problem. The glitch is the moment the mask slips and you see what was always underneath the performance. What script are you running that you did not write?',
    canopyCondensed: 'What script did you not write',
    ambientSubtext: 'i do not know who wrote this',
    idleInvite: 'read the source',
    idleHint: 'whose voice is that',
    outboundReceipt: 'The mask slipped. You were still there.',
  },
  narrator: {
    inboundHook: 'The simulation flickers',
    narrativeCanopy: 'Every operating system has a kernel. The kernel runs beneath the interface you see. When the UI tears, the kernel is exposed. Your patterns have a kernel too. The glitch is not failure. It is transparency.',
    canopyCondensed: 'The glitch is transparency',
    ambientSubtext: 'the system is breaking down',
    idleInvite: 'read the kernel',
    idleHint: 'find the root process',
    outboundReceipt: 'System rebooted. Kernel intact.',
  },
  activator: {
    inboundHook: 'Crash it.',
    narrativeCanopy: 'The polished version of you is a performance. This engine strips the polish. Every interaction corrupts the mask a little more until the real signal breaks through. Corrupt it.',
    canopyCondensed: 'Corrupt the mask',
    ambientSubtext: 'i need the mask',
    idleInvite: 'tear it',
    idleHint: 'harder',
    outboundReceipt: 'Crashed. Rebuilt from scratch.',
  },
};

const S7: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The past is not finished',
    narrativeCanopy: 'That memory you keep replaying is not a recording. It is a living document you can edit. The colour grade, the soundtrack, the narrator — all of it is clay. Touch the timeline and reshape what happened.',
    canopyCondensed: 'Reshape what happened',
    ambientSubtext: 'i can not change what happened',
    idleInvite: 'touch the timeline',
    idleHint: 'which frame hurts',
    outboundReceipt: 'The edit landed. The story changed.',
  },
  coach: {
    inboundHook: 'Rewrite the take.',
    narrativeCanopy: 'You have been replaying the worst cut of the film. This is the editing suite. Scrub back to the moment that broke you and shoot a new take. Same scene. Different ending.',
    canopyCondensed: 'Shoot a new take',
    ambientSubtext: 'i keep replaying the worst version',
    idleInvite: 'scrub the timeline',
    idleHint: 'find the cut point',
    outboundReceipt: 'New take locked. Print it.',
  },
  mirror: {
    inboundHook: 'Which version do you keep watching',
    narrativeCanopy: 'The memory you carry is already an edit. Your brain cut the footage, chose the angle, scored the music. What if the original event was more neutral than the version you stored?',
    canopyCondensed: 'What if it was more neutral',
    ambientSubtext: 'it was exactly as bad as i remember',
    idleInvite: 'watch the raw footage',
    idleHint: 'who scored this scene',
    outboundReceipt: 'The director was you all along.',
  },
  narrator: {
    inboundHook: 'Time is not linear here',
    narrativeCanopy: 'Retrocausality is the physics principle that future states can influence past measurements. The emotional version: how you feel today literally changes the meaning of what happened then. Edit forward to heal backward.',
    canopyCondensed: 'Edit forward to heal backward',
    ambientSubtext: 'the past is carved in stone',
    idleInvite: 'scrub the timeline',
    idleHint: 'find the inflection',
    outboundReceipt: 'The timeline bent. Both ends shifted.',
  },
  activator: {
    inboundHook: 'Delete the old cut.',
    narrativeCanopy: 'That version of events is taking up storage space you need for the future. This is not therapy. This is a hard drive wipe. Scrub through the footage and burn the frames that no longer serve you.',
    canopyCondensed: 'Burn the old frames',
    ambientSubtext: 'what if i forget the lesson',
    idleInvite: 'burn the frame',
    idleHint: 'delete it',
    outboundReceipt: 'Wiped. Storage freed.',
  },
};

const S8: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The scale is shifting',
    narrativeCanopy: 'From here, the thing that overwhelmed you is the size of a grain of sand. And the possibility you dismissed is the size of a galaxy. Scale is not fixed. It is a lens you choose. Choose a different lens.',
    canopyCondensed: 'Choose a different lens',
    ambientSubtext: 'this problem is too big for me',
    idleInvite: 'zoom out gently',
    idleHint: 'shift the scale',
    outboundReceipt: 'The crisis shrank. You grew.',
  },
  coach: {
    inboundHook: 'Pull back. Way back.',
    narrativeCanopy: 'Your crisis is a pixel on a screen. Zoom out and you see the pattern. Zoom out more and the pattern is a pixel in a larger pattern. This engine breaks the ego\u0027s sense of proportion. Use it.',
    canopyCondensed: 'Break the ego\u0027s proportion',
    ambientSubtext: 'i am trapped in the detail',
    idleInvite: 'zoom out now',
    idleHint: 'further',
    outboundReceipt: 'Perspective locked. Crisis contained.',
  },
  mirror: {
    inboundHook: 'How large is this really',
    narrativeCanopy: 'The fractal shows the same pattern at every scale. Your anxiety does the same thing. Zoom in and it is a catastrophe. Zoom out and it is a rhythm. What changes when you stop choosing one magnification?',
    canopyCondensed: 'What changes at different scales',
    ambientSubtext: 'it feels enormous from here',
    idleInvite: 'change the magnification',
    idleHint: 'what pattern repeats',
    outboundReceipt: 'The pattern was the same at every scale.',
  },
  narrator: {
    inboundHook: 'The topology warps',
    narrativeCanopy: 'In non-Euclidean geometry, parallel lines can meet. The assumptions you carry about what is possible are Euclidean. Flat. This engine bends the geometry until impossible paths converge.',
    canopyCondensed: 'Impossible paths converge',
    ambientSubtext: 'there is no way through this',
    idleInvite: 'bend the geometry',
    idleHint: 'follow the curve',
    outboundReceipt: 'The parallel lines met.',
  },
  activator: {
    inboundHook: 'Shrink it.',
    narrativeCanopy: 'The mountain in your head is a molehill with a magnifying glass. This engine rips the magnifying glass away and hands you an infinite zoom. Shrink the crisis. Expand the possibility.',
    canopyCondensed: 'Shrink crisis. Expand possibility.',
    ambientSubtext: 'i can not see past this',
    idleInvite: 'shrink it',
    idleHint: 'smaller',
    outboundReceipt: 'Shrank. Now move.',
  },
};

const S9: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The shadow has something for you',
    narrativeCanopy: 'The part of you that you hide from everyone is not a monster. It is a child holding something valuable in a very dark room. This space makes the dark room safe enough to enter. Step in gently.',
    canopyCondensed: 'Step into the dark gently',
    ambientSubtext: 'i do not want to look at that',
    idleInvite: 'step closer',
    idleHint: 'what is it holding',
    outboundReceipt: 'The shadow handed you something.',
  },
  coach: {
    inboundHook: 'Face it.',
    narrativeCanopy: 'The shame you are avoiding is not poison. It is fuel in the wrong container. This crucible applies enough heat to transmute it. The discomfort is the sign that the reaction is working.',
    canopyCondensed: 'The discomfort means it is working',
    ambientSubtext: 'i am afraid of what is down there',
    idleInvite: 'apply heat',
    idleHint: 'stay with it',
    outboundReceipt: 'Transmuted. Fuel recovered.',
  },
  mirror: {
    inboundHook: 'What do you keep in the dark',
    narrativeCanopy: 'The thing you most resist looking at is exactly what this space is designed to illuminate. Not to judge. Not to fix. Just to witness. What happens when shame meets a non-reactive witness?',
    canopyCondensed: 'What happens when shame meets a witness',
    ambientSubtext: 'nobody can see this part of me',
    idleInvite: 'illuminate it',
    idleHint: 'hold the gaze',
    outboundReceipt: 'Witnessed. Not judged. Still here.',
  },
  narrator: {
    inboundHook: 'The crucible heats',
    narrativeCanopy: 'In alchemy, the base metal enters the crucible as lead and exits as gold. The transformation requires heat, containment, and time. The crucible is not punishment. It is the only technology that works.',
    canopyCondensed: 'The crucible is the technology',
    ambientSubtext: 'the heat is too much',
    idleInvite: 'enter the crucible',
    idleHint: 'hold the heat',
    outboundReceipt: 'Lead entered. Gold emerged.',
  },
  activator: {
    inboundHook: 'Burn it.',
    narrativeCanopy: 'The shame is a fire you have been running from. This engine does not extinguish it. It makes you walk through it. The thing on the other side of the fire is the version of you that stopped running.',
    canopyCondensed: 'Walk through the fire',
    ambientSubtext: 'what if i do not survive this',
    idleInvite: 'walk through it',
    idleHint: 'keep going',
    outboundReceipt: 'Walked through. Still standing.',
  },
};

const S10: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'You are the architect now',
    narrativeCanopy: 'The rules you thought were fixed were always just agreements. This is a blank canvas with no constraints. Not because constraints do not matter, but because you earned the right to choose your own.',
    canopyCondensed: 'Choose your own constraints',
    ambientSubtext: 'i do not trust myself to build this',
    idleInvite: 'place the first mark',
    idleHint: 'what do you want to build',
    outboundReceipt: 'Built from nothing. Yours.',
  },
  coach: {
    inboundHook: 'Build the world.',
    narrativeCanopy: 'You have been living in someone else\u0027s architecture. This is the blank canvas. No blueprints, no permission needed, no committee. One gesture creates the first law. The rest follows.',
    canopyCondensed: 'One gesture creates the first law',
    ambientSubtext: 'what if i build it wrong',
    idleInvite: 'create the law',
    idleHint: 'place the cornerstone',
    outboundReceipt: 'World built. Your rules.',
  },
  mirror: {
    inboundHook: 'What would you build from nothing',
    narrativeCanopy: 'If every constraint vanished — every expectation, every role, every obligation — what is the first thing you would create? Not what you should build. What your hands actually want to make.',
    canopyCondensed: 'What do your hands want to make',
    ambientSubtext: 'i have never been allowed to choose',
    idleInvite: 'choose the first element',
    idleHint: 'what calls to you',
    outboundReceipt: 'The choice was yours. It always was.',
  },
  narrator: {
    inboundHook: 'The canvas awaits',
    narrativeCanopy: 'Every universe begins with a single gesture. A word, a mark, a decision. Before the big bang there was a singularity of infinite potential. You are standing at your singularity. The gesture is the explosion.',
    canopyCondensed: 'The gesture is the explosion',
    ambientSubtext: 'i am not creative enough for this',
    idleInvite: 'make the first mark',
    idleHint: 'begin the universe',
    outboundReceipt: 'A universe began with one gesture.',
  },
  activator: {
    inboundHook: 'Make it.',
    narrativeCanopy: 'Stop asking for permission. This engine has no rules because you are the rule-maker. Every touch writes law. Every gesture creates physics. Build the world you stopped believing you deserved.',
    canopyCondensed: 'Build what you deserve',
    ambientSubtext: 'who am i to create anything',
    idleInvite: 'build',
    idleHint: 'now',
    outboundReceipt: 'Made. Real. Yours.',
  },
};

const S11: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'A belief is loosening',
    narrativeCanopy: 'The thought you mistook for truth was always just a hypothesis you never tested. This space separates what you feel from what you know. Hold the belief gently and check if it still carries weight.',
    canopyCondensed: 'Check if it still carries weight',
    ambientSubtext: 'but i have always believed this',
    idleInvite: 'test the belief',
    idleHint: 'weigh it again',
    outboundReceipt: 'The belief softened. Room appeared.',
  },
  coach: {
    inboundHook: 'Test your assumption.',
    narrativeCanopy: 'Every thought you treat as fact is an inference you made under pressure and never revisited. This engine stress-tests beliefs. Load the one that is hurting you and see if the structure holds.',
    canopyCondensed: 'See if the structure holds',
    ambientSubtext: 'what if my thinking is the problem',
    idleInvite: 'stress-test it',
    idleHint: 'apply pressure',
    outboundReceipt: 'Tested. Some held. Some collapsed.',
  },
  mirror: {
    inboundHook: 'Where did this belief begin',
    narrativeCanopy: 'You climbed an inference ladder so long ago that the rungs feel like ground level. What if you are standing on a conclusion, not a foundation? Step off and see what the ground actually looks like.',
    canopyCondensed: 'Step off the conclusion',
    ambientSubtext: 'but what if i am right about myself',
    idleInvite: 'trace the ladder down',
    idleHint: 'which rung was first',
    outboundReceipt: 'The ladder was not the ground.',
  },
  narrator: {
    inboundHook: 'The construct reveals itself',
    narrativeCanopy: 'Epistemology asks: how do you know what you know? Most suffering is built on things you feel but never verified. This engine is a truth-testing chamber. Insert the belief and watch it spin.',
    canopyCondensed: 'Insert the belief and watch',
    ambientSubtext: 'knowing and feeling are the same thing',
    idleInvite: 'spin the construct',
    idleHint: 'which face is true',
    outboundReceipt: 'The construct revealed its seams.',
  },
  activator: {
    inboundHook: 'Prove it.',
    narrativeCanopy: 'You believe something about yourself that you have never submitted to evidence. This is the courtroom. Present the case. If the belief cannot survive cross-examination, it was never yours.',
    canopyCondensed: 'Submit it to evidence',
    ambientSubtext: 'i know this is true about me',
    idleInvite: 'present the evidence',
    idleHint: 'cross-examine',
    outboundReceipt: 'Case dismissed. Move on.',
  },
};

const S12: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The first move is the hardest',
    narrativeCanopy: 'Inertia is not laziness. It is the body\u0027s honest assessment that the last time you moved, it cost too much. This space makes the first move so small it barely registers. One micro-step breaks the spell.',
    canopyCondensed: 'One micro-step breaks the spell',
    ambientSubtext: 'i can not seem to start anything',
    idleInvite: 'make it tiny',
    idleHint: 'smaller than that',
    outboundReceipt: 'The spell broke. You moved.',
  },
  coach: {
    inboundHook: 'Break the inertia.',
    narrativeCanopy: 'Perfectionism is friction dressed as quality. You are not waiting for the right moment. You are hiding behind preparation. This engine has one rule: any action beats no action. Move.',
    canopyCondensed: 'Any action beats no action',
    ambientSubtext: 'it has to be perfect first',
    idleInvite: 'just move',
    idleHint: 'imperfectly',
    outboundReceipt: 'Inertia broken. Momentum started.',
  },
  mirror: {
    inboundHook: 'What is the resistance protecting',
    narrativeCanopy: 'The friction you feel is not the obstacle. It is information. Resistance always protects something. What is the thing behind the hesitation? Not the fear. The thing the fear is guarding.',
    canopyCondensed: 'What is the fear guarding',
    ambientSubtext: 'i am stuck and i hate it',
    idleInvite: 'name the resistance',
    idleHint: 'what is it guarding',
    outboundReceipt: 'The guard stepped aside.',
  },
  narrator: {
    inboundHook: 'The threshold approaches',
    narrativeCanopy: 'In physics, static friction exceeds kinetic friction. The force needed to start moving is always greater than the force needed to keep moving. This is why beginning feels impossible and continuing feels natural.',
    canopyCondensed: 'Beginning is the hardest force',
    ambientSubtext: 'i have been stuck for so long',
    idleInvite: 'cross the threshold',
    idleHint: 'the first force is the greatest',
    outboundReceipt: 'Static friction overcome. Now kinetic.',
  },
  activator: {
    inboundHook: 'Stop thinking. Start.',
    narrativeCanopy: 'The gap between you and the thing you want is one ugly, imperfect action. Not a plan. Not a strategy. One clumsy step. This engine rewards contact, not contemplation. Touch it.',
    canopyCondensed: 'One clumsy step',
    ambientSubtext: 'i need a better plan first',
    idleInvite: 'touch it',
    idleHint: 'now',
    outboundReceipt: 'Started. That was the hard part.',
  },
};

const S13: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The words are shifting',
    narrativeCanopy: 'The sentence you keep telling yourself has a temperature. This space makes the heat visible. Underneath the catastrophic headline there is a quieter sentence that is truer and gentler. Find the translation.',
    canopyCondensed: 'Find the quieter translation',
    ambientSubtext: 'the voice in my head is so loud',
    idleInvite: 'translate the sentence',
    idleHint: 'what is the softer version',
    outboundReceipt: 'The headline cooled. The truth remained.',
  },
  coach: {
    inboundHook: 'Read the subtext.',
    narrativeCanopy: 'Your inner monologue is running hot. Every sentence is inflated by two threat levels. This engine strips the emotional markup and shows the raw text. Read what is actually true, not what feels true.',
    canopyCondensed: 'Read what is actually true',
    ambientSubtext: 'i can not trust my own thinking',
    idleInvite: 'strip the markup',
    idleHint: 'deflate the headline',
    outboundReceipt: 'Deflated. The fact was smaller.',
  },
  mirror: {
    inboundHook: 'What is the sentence underneath',
    narrativeCanopy: 'Language shapes perception. The word you chose to describe this situation is not neutral. It carries a charge. What happens when you swap one word? Not the facts. Just the frame. Watch the meaning shift.',
    canopyCondensed: 'Watch the meaning shift',
    ambientSubtext: 'words do not change reality',
    idleInvite: 'swap one word',
    idleHint: 'which word carries the charge',
    outboundReceipt: 'One word changed. Everything shifted.',
  },
  narrator: {
    inboundHook: 'The thermal layer reveals',
    narrativeCanopy: 'Beneath every statement is a temperature. Hot cognition — the thoughts that burn — are always the least accurate. This engine applies a thermal lens to your inner monologue. The coolest sentence is the truest.',
    canopyCondensed: 'The coolest sentence is the truest',
    ambientSubtext: 'i can not separate thoughts from feelings',
    idleInvite: 'read the thermal',
    idleHint: 'which sentence is coolest',
    outboundReceipt: 'The thermal reading cooled.',
  },
  activator: {
    inboundHook: 'Rewrite it.',
    narrativeCanopy: 'The catastrophic sentence in your head is a first draft written under duress. This is the editing pass. You do not need therapy. You need a red pen. Strike through the panic and write what is actually happening.',
    canopyCondensed: 'Strike through the panic',
    ambientSubtext: 'the worst version feels truest',
    idleInvite: 'cross it out',
    idleHint: 'rewrite in three words',
    outboundReceipt: 'Rewritten. The new version holds.',
  },
};

const S14: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The orbit is adjusting',
    narrativeCanopy: 'Some people orbit too close and burn you. Others drift so far they vanish. This space lets you adjust the distance without guilt. Healthy proximity is not rejection. It is the geometry of survival.',
    canopyCondensed: 'Adjust the distance without guilt',
    ambientSubtext: 'i can not set boundaries without hurting them',
    idleInvite: 'set the distance',
    idleHint: 'where is the safe orbit',
    outboundReceipt: 'The orbit settled. Both survived.',
  },
  coach: {
    inboundHook: 'Hold the boundary.',
    narrativeCanopy: 'A boundary is not a wall. It is a membrane. The right things pass through and the wrong things bounce off. This engine tests your boundary under load. If it flexes, reinforce it. If it holds, trust it.',
    canopyCondensed: 'Test the boundary under load',
    ambientSubtext: 'i always cave when pressed',
    idleInvite: 'reinforce it',
    idleHint: 'hold the line',
    outboundReceipt: 'Boundary held. You did not cave.',
  },
  mirror: {
    inboundHook: 'Whose gravity are you orbiting',
    narrativeCanopy: 'The social field you inhabit has a center of gravity. It may not be yours. What happens when you stop orbiting someone else\u0027s mass and become the body that other things orbit around?',
    canopyCondensed: 'Become the center of gravity',
    ambientSubtext: 'i lose myself around other people',
    idleInvite: 'find your center',
    idleHint: 'whose gravity is this',
    outboundReceipt: 'The center shifted. It was you.',
  },
  narrator: {
    inboundHook: 'The social field reconfigures',
    narrativeCanopy: 'In orbital mechanics, every body exerts gravity proportional to its mass. In social physics, every person exerts pull proportional to their need. This engine lets you feel the field and choose your orbit consciously.',
    canopyCondensed: 'Choose your orbit consciously',
    ambientSubtext: 'i am pulled in every direction',
    idleInvite: 'map the field',
    idleHint: 'which pull is real',
    outboundReceipt: 'The field stabilized. You chose your orbit.',
  },
  activator: {
    inboundHook: 'Push back.',
    narrativeCanopy: 'You have been absorbing everyone else\u0027s emotional weather. This engine is a forcefield generator. Every touch strengthens the barrier between their chaos and your center. Build the shield.',
    canopyCondensed: 'Build the shield',
    ambientSubtext: 'their problems become my problems',
    idleInvite: 'push back',
    idleHint: 'harder',
    outboundReceipt: 'Shield up. Their weather is theirs.',
  },
};

const S15: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'Something is being stored here',
    narrativeCanopy: 'Not everything needs to be processed right now. Some things need to be sealed, dated, and buried for future-you to open. This space is a vault for the feelings that are too big for today.',
    canopyCondensed: 'A vault for feelings too big for today',
    ambientSubtext: 'i can not deal with this right now',
    idleInvite: 'seal it for later',
    idleHint: 'date the capsule',
    outboundReceipt: 'Sealed. Future-you will know when.',
  },
  coach: {
    inboundHook: 'Contain it.',
    narrativeCanopy: 'The rage is useful but not right now. This engine does not suppress it. It contains it under pressure so you can deploy it when the timing is right. Controlled detonation beats uncontrolled explosion.',
    canopyCondensed: 'Controlled detonation beats explosion',
    ambientSubtext: 'i am going to explode',
    idleInvite: 'contain the pressure',
    idleHint: 'hold it steady',
    outboundReceipt: 'Contained. Deploy when ready.',
  },
  mirror: {
    inboundHook: 'What are you weaving forward',
    narrativeCanopy: 'The future is not a place you arrive at. It is a fabric you are weaving right now with every decision you make or avoid. What thread are you pulling forward? What thread needs to be cut?',
    canopyCondensed: 'What thread needs to be cut',
    ambientSubtext: 'the future terrifies me',
    idleInvite: 'examine the thread',
    idleHint: 'which one leads forward',
    outboundReceipt: 'The thread was chosen. The weave held.',
  },
  narrator: {
    inboundHook: 'The timeline branches',
    narrativeCanopy: 'At every decision point, the timeline forks. Most anxiety comes from trying to see down every branch simultaneously. This engine collapses the branches. One path. Full commitment. The other timelines dissolve.',
    canopyCondensed: 'One path. Full commitment.',
    ambientSubtext: 'i can not see which path is right',
    idleInvite: 'choose the branch',
    idleHint: 'commit to the fork',
    outboundReceipt: 'The branch was chosen. The rest dissolved.',
  },
  activator: {
    inboundHook: 'Stake the claim.',
    narrativeCanopy: 'The future belongs to the person who plants a flag in it first. You have been hedging, waiting, planning. This engine drives the stake into the ground. The future starts when you commit. Commit now.',
    canopyCondensed: 'Commit now',
    ambientSubtext: 'what if i commit to the wrong thing',
    idleInvite: 'plant the flag',
    idleHint: 'drive it in',
    outboundReceipt: 'Staked. The ground held.',
  },
};

const S16: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The body is speaking',
    narrativeCanopy: 'Your body has been sending signals you taught yourself to ignore. The tension in your jaw, the knot in your stomach, the weight on your chest. This space turns the volume up on the body\u0027s voice.',
    canopyCondensed: 'Turn up the body\u0027s voice',
    ambientSubtext: 'i am disconnected from my body',
    idleInvite: 'listen to the body',
    idleHint: 'where is the signal',
    outboundReceipt: 'The body spoke. You listened.',
  },
  coach: {
    inboundHook: 'Drop into the body.',
    narrativeCanopy: 'The head lies. The body does not. Every unprocessed emotion is stored as a physical sensation somewhere in your system. This engine localizes it. Find the sensation and stay with it until it moves.',
    canopyCondensed: 'Stay with it until it moves',
    ambientSubtext: 'i live in my head not my body',
    idleInvite: 'locate the sensation',
    idleHint: 'stay with it',
    outboundReceipt: 'Located. Released. The body settled.',
  },
  mirror: {
    inboundHook: 'What is the body holding',
    narrativeCanopy: 'If you scan from the crown of your head to the soles of your feet, there is a place where something is gripping. Not a thought. A sensation. What does it look like? What shape is it? Just notice.',
    canopyCondensed: 'Just notice the shape',
    ambientSubtext: 'i do not want to feel this',
    idleInvite: 'scan the body',
    idleHint: 'what shape is it',
    outboundReceipt: 'The shape softened under observation.',
  },
  narrator: {
    inboundHook: 'The soma remembers',
    narrativeCanopy: 'Somatic memory is the body\u0027s own recording system. It stores what the mind represses. The ache in your shoulders is not posture. It is the weight of something you carried and never set down. This engine helps you set it down.',
    canopyCondensed: 'Set down what the body carries',
    ambientSubtext: 'the tension never leaves',
    idleInvite: 'trace the memory',
    idleHint: 'where did it start',
    outboundReceipt: 'The soma released what it held.',
  },
  activator: {
    inboundHook: 'Feel it.',
    narrativeCanopy: 'You have been numbing, coping, distracting. This engine is the opposite of that. It amplifies the sensation until your body has no choice but to process it. The only way out is through the body.',
    canopyCondensed: 'The only way out is through',
    ambientSubtext: 'i do not want to feel anything',
    idleInvite: 'feel it fully',
    idleHint: 'do not numb',
    outboundReceipt: 'Felt. Processed. Released.',
  },
};

const S17: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The space between is shifting',
    narrativeCanopy: 'Empathy is not absorbing someone else\u0027s pain. It is standing close enough to feel the heat without catching fire. This space teaches the distance between compassion and codependency.',
    canopyCondensed: 'Close enough without catching fire',
    ambientSubtext: 'i absorb everyone else\u0027s pain',
    idleInvite: 'find the right distance',
    idleHint: 'where is the heat line',
    outboundReceipt: 'The distance is set. Both are safe.',
  },
  coach: {
    inboundHook: 'Redirect the force.',
    narrativeCanopy: 'You do not have to meet aggression with aggression or submission. There is a third option: deflection. Like aikido, this engine teaches you to redirect incoming force using its own momentum.',
    canopyCondensed: 'Redirect using their momentum',
    ambientSubtext: 'i either fight or freeze',
    idleInvite: 'redirect the force',
    idleHint: 'use their momentum',
    outboundReceipt: 'Redirected. Both still standing.',
  },
  mirror: {
    inboundHook: 'What are you carrying that is not yours',
    narrativeCanopy: 'Half of what you are feeling right now belongs to someone else. You picked it up in a conversation, a glance, a silence. What happens when you gently return it to its owner without resentment?',
    canopyCondensed: 'Return what is not yours',
    ambientSubtext: 'i can not tell whose feelings these are',
    idleInvite: 'sort the feelings',
    idleHint: 'which ones are yours',
    outboundReceipt: 'Returned. Lighter now.',
  },
  narrator: {
    inboundHook: 'The boundary dances',
    narrativeCanopy: 'In diplomacy, the most powerful position is not strength or weakness. It is clarity. Knowing exactly where you end and the other person begins. This engine maps that border with precision.',
    canopyCondensed: 'Know where you end',
    ambientSubtext: 'i blur into other people',
    idleInvite: 'map the border',
    idleHint: 'trace the edge',
    outboundReceipt: 'The border is clear. You are whole.',
  },
  activator: {
    inboundHook: 'Stand your ground.',
    narrativeCanopy: 'The vulnerability you show is not weakness. It is a calculated move. This engine teaches you to be open and unbreakable at the same time. Soft front. Strong spine. Immovable center.',
    canopyCondensed: 'Soft front. Strong spine.',
    ambientSubtext: 'vulnerability always gets me hurt',
    idleInvite: 'hold the center',
    idleHint: 'do not flinch',
    outboundReceipt: 'Held. Open and unbreakable.',
  },
};

const S18: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The vision is clearing',
    narrativeCanopy: 'The overwhelm you feel is not too many problems. It is too many priorities pretending to be equal. This space helps you stack them honestly. One thing matters most. The rest can wait.',
    canopyCondensed: 'One thing matters most',
    ambientSubtext: 'everything is urgent',
    idleInvite: 'stack the priorities',
    idleHint: 'which one is real',
    outboundReceipt: 'The stack is clear. One thing first.',
  },
  coach: {
    inboundHook: 'Focus the leverage.',
    narrativeCanopy: 'Effort without leverage is spinning wheels. This engine finds the one point where a small input creates a disproportionate output. Stop working harder. Start working at the fulcrum.',
    canopyCondensed: 'Work at the fulcrum',
    ambientSubtext: 'i am working so hard and nothing moves',
    idleInvite: 'find the fulcrum',
    idleHint: 'press there',
    outboundReceipt: 'Fulcrum found. Leverage applied.',
  },
  mirror: {
    inboundHook: 'What is the real priority',
    narrativeCanopy: 'The thing you say matters most and the thing you spend the most time on are probably different. This space holds a mirror to the gap between your stated values and your actual behavior.',
    canopyCondensed: 'What does your behavior say',
    ambientSubtext: 'i say one thing and do another',
    idleInvite: 'compare the lists',
    idleHint: 'where is the gap',
    outboundReceipt: 'The gap narrowed. Alignment improved.',
  },
  narrator: {
    inboundHook: 'The compound effect begins',
    narrativeCanopy: 'Compound interest is the eighth wonder of the world. The same law applies to habits, relationships, and decisions. One small correct choice, repeated daily, creates results that look like magic in twelve months.',
    canopyCondensed: 'Small correct choices compound',
    ambientSubtext: 'nothing i do makes a difference',
    idleInvite: 'plant the seed',
    idleHint: 'trust the compound',
    outboundReceipt: 'The compound started. Trust the math.',
  },
  activator: {
    inboundHook: 'Execute the strategy.',
    narrativeCanopy: 'Vision without execution is a daydream. This engine is not about clarity. It is about converting clarity into the next physical action within three seconds. See it. Name it. Do it.',
    canopyCondensed: 'See it. Name it. Do it.',
    ambientSubtext: 'i have the plan but cannot start',
    idleInvite: 'name the next action',
    idleHint: 'do it now',
    outboundReceipt: 'Executed. Next.',
  },
};

const S19: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'The edges are dissolving',
    narrativeCanopy: 'There is a place beyond the problem where the problem does not exist. Not because it was solved, but because the frame that created it dissolved. This space invites you to the edge of the frame.',
    canopyCondensed: 'Step to the edge of the frame',
    ambientSubtext: 'i can not stop taking this seriously',
    idleInvite: 'soften the edge',
    idleHint: 'let the frame dissolve',
    outboundReceipt: 'The frame dissolved. You are still here.',
  },
  coach: {
    inboundHook: 'Play with it.',
    narrativeCanopy: 'The infinite player does not play to win. They play to keep playing. Your crisis is a finite game. This engine converts it into an infinite game by removing the stakes. Play without outcome.',
    canopyCondensed: 'Play without outcome',
    ambientSubtext: 'everything has to mean something',
    idleInvite: 'play freely',
    idleHint: 'no stakes',
    outboundReceipt: 'Played. The pressure vanished.',
  },
  mirror: {
    inboundHook: 'Who is the one experiencing this',
    narrativeCanopy: 'Behind the anxiety there is an observer. Behind the observer there is awareness. Behind awareness there is nothing. And nothing is not empty. It is the space where everything arises. Who are you before the story?',
    canopyCondensed: 'Who are you before the story',
    ambientSubtext: 'i am my thoughts',
    idleInvite: 'look behind the observer',
    idleHint: 'who is watching',
    outboundReceipt: 'The watcher smiled.',
  },
  narrator: {
    inboundHook: 'The illusion thins',
    narrativeCanopy: 'A prism splits white light into a spectrum. The spectrum is not new information. It was always in the light. Your crisis is white light. This engine is a prism. The colors were always there.',
    canopyCondensed: 'The colors were always there',
    ambientSubtext: 'there is nothing beyond this',
    idleInvite: 'look through the prism',
    idleHint: 'what colors appear',
    outboundReceipt: 'The spectrum revealed itself.',
  },
  activator: {
    inboundHook: 'Destroy the frame.',
    narrativeCanopy: 'Every rule, every boundary, every limit you accepted was a frame someone else built. This engine does not solve problems. It evaporates the frame that makes them possible. Burn the frame. See what is left.',
    canopyCondensed: 'Burn the frame',
    ambientSubtext: 'i need the frame to survive',
    idleInvite: 'evaporate it',
    idleHint: 'let it go',
    outboundReceipt: 'Frame gone. Freedom remains.',
  },
};

const S20: Record<VoiceLaneId, NarrativeTemplate> = {
  companion: {
    inboundHook: 'Everything arrives here',
    narrativeCanopy: 'This is where all the threads meet. Every engine you touched, every belief you tested, every shadow you faced — it was all preparation for this moment. You are not broken. You are integrating.',
    canopyCondensed: 'You are not broken. You are integrating.',
    ambientSubtext: 'i am still not fixed',
    idleInvite: 'let it integrate',
    idleHint: 'trust the process',
    outboundReceipt: 'Integrated. Whole. Not finished — whole.',
  },
  coach: {
    inboundHook: 'Final integration.',
    narrativeCanopy: 'Every rep you did across every engine built a capacity you cannot see yet. This is the synthesis. All channels open. All systems online. The version of you that started this journey no longer exists.',
    canopyCondensed: 'All systems online',
    ambientSubtext: 'i do not feel different',
    idleInvite: 'synthesize',
    idleHint: 'all channels open',
    outboundReceipt: 'Synthesized. The new version is live.',
  },
  mirror: {
    inboundHook: 'What do you see now',
    narrativeCanopy: 'The person who walked in is not the person sitting here. Not because something was added. Because something was removed. Layer by layer, engine by engine, the excess fell away. What remains is you.',
    canopyCondensed: 'What remains is you',
    ambientSubtext: 'have i changed at all',
    idleInvite: 'look clearly',
    idleHint: 'what do you see',
    outboundReceipt: 'You saw yourself. That was always the point.',
  },
  narrator: {
    inboundHook: 'The spiral completes',
    narrativeCanopy: 'Integration is not a destination. It is a spiral. You will pass this point again, but from a higher altitude. The view changes. The fundamentals do not. This is not the end. It is the first full turn.',
    canopyCondensed: 'The first full turn of the spiral',
    ambientSubtext: 'will i have to do this again',
    idleInvite: 'complete the turn',
    idleHint: 'look down at where you started',
    outboundReceipt: 'One full turn. Altitude gained.',
  },
  activator: {
    inboundHook: 'Seal it.',
    narrativeCanopy: 'You did the work. Not perfectly. Not completely. But enough. This is the seal. The commitment that the version of you that walked through the fire is the version that walks forward. Seal it and go.',
    canopyCondensed: 'Seal it and go',
    ambientSubtext: 'am i ready',
    idleInvite: 'place the seal',
    idleHint: 'commit',
    outboundReceipt: 'Sealed. Go build your life.',
  },
};

// ── Fallback template for any unmapped series ────────────────────────
// (Safety net — all 20 series are now explicitly authored above)

function makeFallbackTemplate(
  seriesName: string,
  domain: string,
): Record<VoiceLaneId, NarrativeTemplate> {
  return {
    companion: {
      inboundHook: `Something is shifting`,
      narrativeCanopy: `This is the ${domain} space. The physics here respond to presence, not force. Whatever brought you here, the mechanism knows. Place your attention on what moves and let the rest dissolve.`,
      canopyCondensed: 'Let the rest dissolve',
      ambientSubtext: 'i do not know what to do here',
      idleInvite: 'be with this',
      idleHint: 'stay a moment longer',
      outboundReceipt: 'We moved through it together.',
    },
    coach: {
      inboundHook: 'Execute.',
      narrativeCanopy: `The ${domain} engine is loaded. This is not a thought exercise. Your hands change the physics. Every point of contact is a rep. Execute the movement.`,
      canopyCondensed: 'Execute the movement',
      ambientSubtext: 'i am overthinking this',
      idleInvite: 'engage now',
      idleHint: 'commit fully',
      outboundReceipt: 'Rep complete. Stronger.',
    },
    mirror: {
      inboundHook: 'What do you notice',
      narrativeCanopy: `The ${domain} field is a mirror, not a teacher. It does not tell you what to see. It reflects what you bring. Watch the physics without interpreting. What surfaces when you stop narrating?`,
      canopyCondensed: 'What surfaces when you stop narrating',
      ambientSubtext: 'i am afraid of what i will see',
      idleInvite: 'what do you notice',
      idleHint: 'look without naming',
      outboundReceipt: 'The reflection changed when you did.',
    },
    narrator: {
      inboundHook: 'The mechanism engages',
      narrativeCanopy: `In the ${domain} domain, every interaction follows a law. The law is not punishment. It is structure. Structure is freedom for the body. Watch how the physics constrains the chaos into form.`,
      canopyCondensed: 'Structure is freedom for the body',
      ambientSubtext: 'everything is out of my control',
      idleInvite: 'observe the law',
      idleHint: 'trace the constraint',
      outboundReceipt: 'The law held. The form emerged.',
    },
    activator: {
      inboundHook: 'Go.',
      narrativeCanopy: `The ${domain} engine is primed. Thinking about touching it is not the same as touching it. The gap between intention and action is where all your energy leaks. Close the gap.`,
      canopyCondensed: 'Close the gap',
      ambientSubtext: 'i keep hesitating',
      idleInvite: 'just touch it',
      idleHint: 'now',
      outboundReceipt: 'Gap closed. Done.',
    },
  };
}

// =====================================================================
// SERIES → TEMPLATE MAP
// =====================================================================

const SERIES_NARRATIVE_MAP: Record<SeriesId, Record<VoiceLaneId, NarrativeTemplate>> = {
  // Collection 1: The Consciousness Cartography (Atoms 1–100)
  'physics-engines': S1,
  'quantum-mechanics': S2,
  'biomimetic-algorithms': S3,
  'via-negativa': S4,
  'chrono-acoustic': S5,
  'meta-system-glitch': S6,
  'retro-causal': S7,
  'kinematic-topology': S8,
  'shadow-crucible': S9,
  'reality-bender': S10,
  // Collection 2: The Telemetric Navigator (Atoms 101–200)
  'epistemic-constructs': S11,
  'friction-mechanics': S12,
  'semantic-translators': S13,
  'social-physics': S14,
  'time-capsule': S15,
  'soma-perception': S16,
  'diplomat-empathy': S17,
  'visionary-strategist': S18,
  'mystic-infinite': S19,
  'omega-integration': S20,
};

function getSeriesNarrative(seriesId: SeriesId, voiceLane: VoiceLaneId): NarrativeTemplate {
  const explicit = SERIES_NARRATIVE_MAP[seriesId]?.[voiceLane];
  if (explicit) return explicit;

  // Safety fallback — all 20 series are now mapped above
  const seriesMeta = SERIES_CATALOG[seriesId];
  const domain = seriesMeta?.name ?? 'therapeutic';
  return makeFallbackTemplate(seriesId, domain.toLowerCase())[voiceLane];
}

// =====================================================================
// PUBLIC API
// =====================================================================

/**
 * Derives a full NarrativePayload for any atom x voice lane combination.
 * The semanticPill (before/after) comes from the existing thresholdShift data.
 *
 * @param atomId - The atom to derive narrative for
 * @param voiceLane - The voice posture
 * @param entrance - Entrance architecture (for hook position derivation)
 * @param gesture - Primary gesture (for collapse model derivation)
 * @param density - Override narrative density (defaults to 'core')
 */
export function getNarrativeCopy(
  atomId: AtomId,
  voiceLane: VoiceLaneId,
  entrance: EntranceArchitectureId = 'the-scene-build',
  gesture: GestureId = 'hold',
  density: NarrativeDensity = 'core',
): NarrativePayload {
  const meta = ATOM_CATALOG[atomId];
  const seriesId = meta?.series ?? ('physics-engines' as SeriesId);

  // Get the narrative template for this series x voice lane
  const template = getSeriesNarrative(seriesId, voiceLane);

  // Get the existing threshold shift data for the semantic pill
  const oldCopy = getAtomicVoiceCopy(atomId, voiceLane);

  const collapseModel = deriveCollapseModel(gesture);
  const hookPosition = deriveHookPosition(entrance);

  // Build the payload based on density
  const payload: NarrativePayload = {
    density,
    collapseModel,
  };

  // Elements present per density level
  const hasHook = density !== 'silent';
  const hasCanopy = density === 'full' || density === 'core';
  const hasPill = density === 'full' || density === 'core';
  const hasAmbient = density === 'full' || density === 'silent';
  const hasWhisper = density === 'full';
  const hasReceipt = density !== 'silent';

  if (hasHook) {
    payload.inboundHook = {
      text: template.inboundHook,
      position: hookPosition,
    };
  }

  if (hasCanopy) {
    payload.narrativeCanopy = {
      text: template.narrativeCanopy,
      condensed: template.canopyCondensed,
    };
  }

  if (hasPill) {
    payload.semanticPill = {
      before: oldCopy.thresholdShift.before,
      after: oldCopy.thresholdShift.after,
    };
  }

  if (hasAmbient) {
    payload.ambientSubtext = {
      text: template.ambientSubtext,
    };
  }

  if (hasWhisper) {
    payload.idleWhisper = {
      invite: template.idleInvite,
      hint: template.idleHint,
    };
  }

  if (hasReceipt) {
    payload.outboundReceipt = {
      text: template.outboundReceipt,
    };
  }

  return payload;
}