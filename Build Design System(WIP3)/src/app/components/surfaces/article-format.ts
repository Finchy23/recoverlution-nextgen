/**
 * ARTICLE FORMAT — The Anatomy of a Page
 *
 * Every article in the Infinite Book is a sequence of typed blocks.
 * Each block has strict character limits, typography, and tonal rules.
 * This file is the single source of truth for article structure.
 *
 * ─── THE PAGE ───
 *
 * A page is not a web article. It is a descent.
 * The reader drops into darkness and discovers light.
 * There are no headers, no sidebars, no metadata.
 * Just glass, text, and breath.
 *
 * ─── BLOCK TYPES ───
 *
 *   mark  — Chapter word (4-letter pillar name)
 *   open  — Title (evocative, not descriptive)
 *   lede  — Opening breath (italic, one sentence)
 *   line  — Luminous filament (visual only, no text)
 *   body  — Reading paragraph
 *   pull  — Resonant truth / pull-quote
 *   rest  — Somatic breath point (visual only)
 *   turn  — Section transition (italic, whispered)
 *   land  — Closing paragraph
 *   seal  — Page endpoint (visual only)
 */

import { weight, font, typeSize, tracking, leading, opacity } from '../design-system/surface-tokens';
import type { ArticleCoordinate } from './read-calibration';

export type ArticleBlockType =
  | 'mark'   // Chapter word (4-letter pillar)
  | 'open'   // Title
  | 'lede'   // Opening breath
  | 'line'   // Luminous filament (visual only)
  | 'body'   // Reading paragraph
  | 'pull'   // Resonant truth / pull-quote
  | 'rest'   // Somatic breath point (visual only)
  | 'turn'   // Section transition
  | 'land'   // Closing paragraph
  | 'seal';  // Page endpoint (visual only)

export interface ArticleBlock {
  type: ArticleBlockType;
  /** Text content (empty for visual-only blocks) */
  text: string;
}

// ─── Character Limits ───

export const BLOCK_LIMITS = {
  mark: 4,
  open: 28,
  lede: 80,
  body: 280,
  pull: 80,
  turn: 28,
  land: 200,
} as const;

// ─── Typography Specs ───

export const BLOCK_TYPOGRAPHY = {
  mark: {
    fontFamily: font.sans,
    fontSize: typeSize.label,
    fontWeight: weight.medium,
    letterSpacing: tracking.eyebrow,
    textTransform: 'uppercase' as const,
  },
  open: {
    fontFamily: font.serif,
    fontSize: typeSize.title,
    fontWeight: weight.light,
    lineHeight: leading.compact,
  },
  lede: {
    fontFamily: font.serif,
    fontSize: typeSize.lede,
    fontWeight: weight.light,
    fontStyle: 'italic' as const,
    lineHeight: leading.relaxed,
  },
  body: {
    fontFamily: font.serif,
    fontSize: typeSize.body,
    fontWeight: weight.light,
    lineHeight: leading.breath,
  },
  pull: {
    fontFamily: font.serif,
    fontSize: typeSize.pull,
    fontWeight: weight.light,
    lineHeight: leading.body,
  },
  turn: {
    fontFamily: font.sans,
    fontSize: typeSize.label,
    fontWeight: weight.regular,
    fontStyle: 'italic' as const,
    letterSpacing: tracking.shelf,
  },
  land: {
    fontFamily: font.serif,
    fontSize: typeSize.body,
    fontWeight: weight.light,
    lineHeight: leading.breath,
  },
} as const;

// ─── Opacity per block type ───

export const BLOCK_OPACITY = {
  mark: opacity.spoken,
  open: opacity.clear,
  lede: opacity.lifted,
  body: opacity.body,
  pull: opacity.spoken,
  turn: opacity.murmur,
  land: opacity.land,
} as const;

// ─── Structure Limits ───

export const STRUCTURE_LIMITS = {
  mark: { min: 1, max: 1 },
  open: { min: 1, max: 1 },
  lede: { min: 1, max: 1 },
  line: { min: 1, max: 2 },
  body: { min: 4, max: 12 },
  pull: { min: 1, max: 3 },
  rest: { min: 1, max: 4 },
  turn: { min: 0, max: 3 },
  land: { min: 1, max: 1 },
  seal: { min: 1, max: 1 },
} as const;

export const PAGE_WORD_COUNT = { min: 400, max: 800 };

// ─── Validate a page ───

export function validatePage(blocks: ArticleBlock[]): string[] {
  const errors: string[] = [];
  const counts: Partial<Record<ArticleBlockType, number>> = {};

  for (const block of blocks) {
    counts[block.type] = (counts[block.type] || 0) + 1;

    // Check character limits
    const limit = BLOCK_LIMITS[block.type as keyof typeof BLOCK_LIMITS];
    if (limit && block.text.length > limit) {
      errors.push(`${block.type.toUpperCase()}: "${block.text.slice(0, 20)}…" exceeds ${limit} chars (got ${block.text.length})`);
    }
  }

  // Check structure limits
  for (const [type, { min, max }] of Object.entries(STRUCTURE_LIMITS)) {
    const count = counts[type as ArticleBlockType] || 0;
    if (count < min) errors.push(`Missing required block: ${type.toUpperCase()} (need ${min}, got ${count})`);
    if (count > max) errors.push(`Too many ${type.toUpperCase()} blocks (max ${max}, got ${count})`);
  }

  // Check PULL blocks not consecutive
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].type === 'pull' && blocks[i - 1].type === 'pull') {
      errors.push('PULL blocks must not appear consecutively');
    }
  }

  // Word count
  const totalWords = blocks
    .filter(b => ['body', 'pull', 'land', 'lede'].includes(b.type))
    .reduce((sum, b) => sum + b.text.split(/\s+/).length, 0);
  if (totalWords < PAGE_WORD_COUNT.min) errors.push(`Page too short: ${totalWords} words (min ${PAGE_WORD_COUNT.min})`);
  if (totalWords > PAGE_WORD_COUNT.max) errors.push(`Page too long: ${totalWords} words (max ${PAGE_WORD_COUNT.max})`);

  return errors;
}

// ─── Demo Pages ───
// These demonstrate the format with Recoverlution-grade copy.
// Each one is a complete, valid page.

export interface DemoPage {
  chapterColor: string;
  coordinate: ArticleCoordinate;
  spark: string;              // The one massive truth — the intercept
  blocks: ArticleBlock[];
}

export const DEMO_PAGES: DemoPage[] = [
  {
    chapterColor: '#B8A0FF', // ROOT — developmental
    coordinate: { focus: 'self', lens: 'psyche', mode: 'story' },
    spark: 'The patterns you cannot name are the ones running the show.',
    blocks: [
      { type: 'mark', text: 'ROOT' },
      { type: 'open', text: 'The Ghost in the Machine' },
      { type: 'lede', text: 'The patterns you cannot name are the ones running the show' },
      { type: 'line', text: '' },

      { type: 'body', text: 'There is a version of you that learned to survive by becoming invisible. Not physically — you were always there. But the parts of you that needed something, the parts that felt too much or wanted too loudly, those went underground.' },
      { type: 'body', text: 'You did not choose this. It was not a decision made at a conference table inside your skull. It happened the way weather happens — slowly, then all at once, until the landscape looked entirely different and nobody could remember what was there before.' },
      { type: 'body', text: 'The machinery is still running. Every reaction you cannot explain, every tension that arrives without invitation, every moment you abandon yourself before anyone else gets the chance — that is the ghost, doing its job.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'The ghost does not haunt you. It is protecting you from a war that ended.' },

      { type: 'rest', text: '' },

      { type: 'body', text: 'Protection is the wrong word, actually. It implies something gentle. What the ghost does is closer to architecture — it builds walls so fast you never see the blueprint. You only notice the room has gotten smaller.' },
      { type: 'body', text: 'The room gets smaller in specific ways. You stop saying what you mean. You over-prepare for situations that require no preparation. You rehearse conversations with people who are not paying nearly as much attention as you think.' },

      { type: 'turn', text: 'the architecture' },

      { type: 'body', text: 'Here is what nobody tells you about the ghost: it is not broken. It is not a malfunction. It is a machine that was built for a specific environment, and it is running perfectly. The problem is that the environment changed and the machine did not get the memo.' },
      { type: 'body', text: 'You are not living in the house you grew up in. But your nervous system is still locking the same doors, still flinching at the same shadows, still rationing the same emotional resources that were scarce then but are abundant now.' },
      { type: 'body', text: 'The work is not to destroy the ghost. You cannot fight architecture with a hammer. The work is to let the machine see the new room — to give it updated coordinates. To let it discover, slowly, that the war is over.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'You are not broken. You are running old software in a new room.' },

      { type: 'rest', text: '' },

      { type: 'land', text: 'The ghost will not leave on command. It will not respond to logic or deadlines or the sheer force of wanting to be different. It responds to one thing only: safety. And safety is not a thought. It is a felt experience. The body has to believe it before the mind can follow.' },

      { type: 'seal', text: '' },
    ],
  },

  {
    chapterColor: '#A8B5FF', // CALM — nervous system
    coordinate: { focus: 'self', lens: 'science', mode: 'theory' },
    spark: 'The body holds what the mind cannot yet carry.',
    blocks: [
      { type: 'mark', text: 'CALM' },
      { type: 'open', text: 'The Weight Before Words' },
      { type: 'lede', text: 'Your body knew something was wrong before your mind had the vocabulary' },
      { type: 'line', text: '' },

      { type: 'body', text: 'You wake up heavy. Not tired — heavy. As though the atmosphere in the room has a different density than the one you fell asleep in. Your jaw is set. Your shoulders are already rehearsing the day. Nothing has happened yet, but your body is braced.' },
      { type: 'body', text: 'This is not anxiety, exactly. Anxiety has a story. This has no story. It is pre-verbal. It lives below the line where language can reach, in the deep tissue of the nervous system where the body keeps its oldest records.' },
      { type: 'body', text: 'You have tried to think your way through it. You have named it, labelled it, journalled about it. And sometimes that helps. But the weight returns because it was never a thought problem. It is a body problem wearing a thinking disguise.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'The body holds what the mind cannot yet carry' },

      { type: 'rest', text: '' },

      { type: 'turn', text: 'beneath the surface' },

      { type: 'body', text: 'Your nervous system has a memory that operates independently of your conscious recall. It remembers the temperature of rooms, the cadence of voices, the specific quality of silence that preceded something going wrong. It remembers all of this without pictures or words.' },
      { type: 'body', text: 'When the weight arrives without explanation, it is this memory surfacing. Not as a flashback. Not as a thought you can examine. But as a physical state — a full-body preparation for something that is not actually about to happen.' },
      { type: 'body', text: 'The exhale is more interesting than you think. Not as a technique. Not as a practice. But as the only voluntary access point you have to the system that is running the weight. You cannot will your heart rate down. You cannot instruct your muscles to release. But you can exhale.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'The exhale is the only door that opens from your side' },

      { type: 'rest', text: '' },

      { type: 'body', text: 'It is a small door. It does not lead to a cathedral of calm. It leads to one slightly different breath, which leads to another, which over time begins to signal something to the ancient machinery: the room is safe. The weight can be put down. Not all of it. Not today. But some.' },

      { type: 'land', text: 'You do not have to understand the weight to put it down. Understanding is the mind wanting control of a process it does not run. The body puts the weight down the same way it picked it up — without asking permission, without explanation. You just have to let it.' },

      { type: 'seal', text: '' },
    ],
  },

  {
    chapterColor: '#FFB088', // WIRE — cognitive
    coordinate: { focus: 'self', lens: 'psyche', mode: 'theory' },
    spark: 'The thoughts you think are yours were built by someone else entirely.',
    blocks: [
      { type: 'mark', text: 'WIRE' },
      { type: 'open', text: 'Still Architecture' },
      { type: 'lede', text: 'The thoughts you think are yours were built by someone else entirely' },
      { type: 'line', text: '' },

      { type: 'body', text: 'You are thinking right now. Not about these words — behind them. There is a commentary running underneath this moment, a narrator who has opinions about how this is going, whether you are doing it right, whether any of this matters.' },
      { type: 'body', text: 'That narrator feels like you. It uses your voice, your vocabulary, your specific way of framing the world. But it is not you. It is a construction — a pattern that was assembled over years from the raw material of every correction, every expectation, every look that lasted a beat too long.' },
      { type: 'body', text: 'The architecture of thought is inherited. You did not choose your first beliefs about yourself any more than you chose your eye colour. They arrived through repetition, through the slow accretion of other people\u2019s certainties, until they calcified into something that felt like truth.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'A belief is just a thought that forgot it was temporary' },

      { type: 'rest', text: '' },

      { type: 'turn', text: 'the quiet machinery' },

      { type: 'body', text: 'The machinery runs fastest when you are not watching. It edits your perception before you perceive. It filters your options before you choose. It writes the story of what just happened before you have finished experiencing it.' },
      { type: 'body', text: 'This is not a flaw. The machinery exists because processing everything in real time would overwhelm you. It is a compression algorithm — it takes the infinite data of each moment and reduces it to a manageable narrative. The problem is that the algorithm was written when you were small, and it has not been updated.' },
      { type: 'body', text: 'You are running adult decisions through a filter that was calibrated in childhood. The filter says: be careful. The filter says: do not want too much. The filter says: you know what happens when you trust people. And because the filter speaks in your voice, you mistake its caution for wisdom.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'You are not your thoughts. You are the space they move through.' },

      { type: 'rest', text: '' },

      { type: 'land', text: 'Rewiring is not replacement. You cannot swap an old belief for a new one the way you change a lightbulb. Rewiring is slower, more honest than that. It is the practice of catching the machinery mid-sentence and asking, gently, is this still true? Not every time. Just once. And then once more.' },

      { type: 'seal', text: '' },
    ],
  },

  {
    chapterColor: '#80C8A0', // BOND — relational
    coordinate: { focus: 'relations', lens: 'psyche', mode: 'story' },
    spark: 'Connection is not a skill you lost. It is a risk your body decided to stop taking.',
    blocks: [
      { type: 'mark', text: 'BOND' },
      { type: 'open', text: 'The Distance You Learned' },
      { type: 'lede', text: 'Connection is not a skill you lost. It is a risk your body decided to stop taking' },
      { type: 'line', text: '' },

      { type: 'body', text: 'You are good at being alone. Not in the way that sounds like freedom — in the way that sounds like practice. You have rehearsed solitude until it feels like preference, until the ache of it fades into the background hum of a life that looks, from the outside, perfectly composed.' },
      { type: 'body', text: 'The distance was never a choice you made consciously. It was a calibration your nervous system performed when proximity became associated with cost. Someone got too close and the cost was too high. The body remembers. The body adjusts.' },
      { type: 'body', text: 'Now you do the mathematics of closeness without realising. Every conversation has an optimal depth. Every relationship has a ceiling you installed without blueprints. You know exactly how much of yourself to offer before the exchange becomes dangerous.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'The walls you built are not the problem. The problem is you forgot you built them.' },

      { type: 'rest', text: '' },

      { type: 'turn', text: 'the cost of proximity' },

      { type: 'body', text: 'Attachment is not weakness. Your body decided it was because, once, attachment led to something that hurt more than the loneliness that replaced it. That equation was true then. It was a survival calculation made with the data available.' },
      { type: 'body', text: 'The data has changed. The people around you now are not the people who taught you to flinch. But the body does not update its records voluntarily. It needs new evidence, and it needs the evidence to arrive slowly enough that the alarm system does not override the experiment.' },
      { type: 'body', text: 'One degree of closeness. One conversation where you say the true thing instead of the safe thing. Not the whole truth. Not every truth. Just one, offered without apology, to see what happens when the wall lowers by an inch.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'Trust is rebuilt at the speed the nervous system will allow' },

      { type: 'rest', text: '' },

      { type: 'land', text: 'The distance you learned is real. It served you. It may still serve you in certain rooms with certain people. But the rooms have changed, and some of the people who are waiting on the other side of your wall have hands that know how to be gentle. You do not have to believe that yet. You just have to not lock the door.' },

      { type: 'seal', text: '' },
    ],
  },

  {
    chapterColor: '#E0A080', // EDGE — crisis & resilience
    coordinate: { focus: 'path', lens: 'wisdom', mode: 'story' },
    spark: 'The floor you land on is never the floor you were standing on.',
    blocks: [
      { type: 'mark', text: 'EDGE' },
      { type: 'open', text: 'The Floor Held' },
      { type: 'lede', text: 'You have been to the bottom. The interesting part is what you found there' },
      { type: 'line', text: '' },

      { type: 'body', text: 'There was a moment — you know the one — when everything that held you up simply stopped holding. Not gradually, not with warning. The floor opened and you fell through it, and on the way down you discovered that falling has its own physics.' },
      { type: 'body', text: 'At the bottom, there is nothing. That is the terrifying part and also, paradoxically, the useful part. When every construct you built to define yourself collapses, what remains is not rubble. What remains is the thing that was there before you started building.' },
      { type: 'body', text: 'You survived the bottom. You are reading this, which means the floor held. Not the floor you were standing on before — that one is gone. A different floor. One you did not know existed until you needed it.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'The floor you land on is never the floor you were standing on' },

      { type: 'rest', text: '' },

      { type: 'turn', text: 'what the fall teaches' },

      { type: 'body', text: 'Crisis strips the varnish off everything. The roles you play, the narratives you maintain, the careful performance of being fine — all of it goes. And in that stripping, something honest emerges. Not beautiful, not inspirational. Just honest.' },
      { type: 'body', text: 'The honest thing is this: you are more durable than you think. Not stronger — that word implies force. Durable. You can absorb impact and still be here. The shape changes. The material holds.' },
      { type: 'body', text: 'Recovery is not returning to the person you were before the floor opened. That person built a floor that could not hold. Recovery is building differently, with new materials and the hard-won knowledge of what weight actually feels like.' },

      { type: 'rest', text: '' },

      { type: 'pull', text: 'You do not bounce back. You grow forward from the point of impact.' },

      { type: 'rest', text: '' },

      { type: 'land', text: 'The edge is not a place to fear. It is a place you have already been. You have its coordinates. You know its texture. And you know — because you are here, because the floor held — that the edge is not the end of the territory. It is just the place where the old map stops and the new cartography begins.' },

      { type: 'seal', text: '' },
    ],
  },
];