/**
 * TALK SEEDS — The Prompt Library
 *
 * These are the luminous doorways. The precision prompts.
 * Each one is an invitation to fill in a piece of the puzzle.
 *
 * Prompts are organized by depth tier (1-5) and lane.
 * The corridor selects 2-3 prompts at a time, mixing lanes
 * to give the user genuine choice while secretly mapping
 * the therapeutic terrain.
 *
 * Tier 1: Surface — safe, present, low cognitive load
 * Tier 2: Narrative — story-opening, who/what/when
 * Tier 3: Pattern — recognizing repetition, the loop
 * Tier 4: Root — origin, the first time, the architect
 * Tier 5: Integration — what this means now, the rewrite
 *
 * Copy guardrails:
 *   - Never assume. Never diagnose. Never rank.
 *   - Questions are invitations, not interrogations.
 *   - The voice is warm, spacious, and unhurried.
 *   - Every prompt should feel like something Ram Dass
 *     would ask while sitting on the floor with you.
 */

import type { TalkPrompt, TalkReflection, TalkLane, TalkEntry } from './talk-types';

// ═══════════════════════════════════════════════════
// TIER 1 — SURFACE (Opening the door)
// ═══════════════════════════════════════════════════

const TIER_1: TalkPrompt[] = [
  { id: 't1-present-1', text: 'What are you carrying right now?', lane: 'present', depth: 1 },
  { id: 't1-present-2', text: 'If this feeling had a colour, what would it be?', lane: 'present', depth: 1 },
  { id: 't1-body-1', text: 'Where in your body do you feel it most?', lane: 'body', depth: 1 },
  { id: 't1-present-3', text: 'What word keeps circling in your mind today?', lane: 'present', depth: 1 },
  { id: 't1-present-4', text: 'What happened just before you opened this?', lane: 'present', depth: 1 },
  { id: 't1-body-2', text: 'Take a breath. What does the exhale say?', lane: 'body', depth: 1 },
  { id: 't1-desire-1', text: 'What do you wish someone would ask you?', lane: 'desire', depth: 1 },
];

// ═══════════════════════════════════════════════════
// TIER 2 — NARRATIVE (Opening the story)
// ═══════════════════════════════════════════════════

const TIER_2: TalkPrompt[] = [
  { id: 't2-relationship-1', text: 'Who is in the room with you, even when they\'re not here?', lane: 'relationship', depth: 2 },
  { id: 't2-pattern-1', text: 'Does this feeling have a familiar shape?', lane: 'pattern', depth: 2 },
  { id: 't2-present-1', text: 'What were you about to say, but didn\'t?', lane: 'present', depth: 2 },
  { id: 't2-relationship-2', text: 'Whose voice do you hear when you doubt yourself?', lane: 'relationship', depth: 2 },
  { id: 't2-body-1', text: 'If the tightness in your body could speak, what would it say?', lane: 'body', depth: 2 },
  { id: 't2-fear-1', text: 'What are you afraid will happen if you stop holding it together?', lane: 'fear', depth: 2 },
  { id: 't2-pattern-2', text: 'When was the last time you felt exactly like this?', lane: 'pattern', depth: 2 },
  { id: 't2-desire-1', text: 'What would it feel like to put this down?', lane: 'desire', depth: 2 },
];

// ═══════════════════════════════════════════════════
// TIER 3 — PATTERN (Recognizing the loop)
// ═══════════════════════════════════════════════════

const TIER_3: TalkPrompt[] = [
  { id: 't3-pattern-1', text: 'What rule did you make about yourself that you\'ve never questioned?', lane: 'pattern', depth: 3 },
  { id: 't3-relationship-1', text: 'Who taught you that love looks like this?', lane: 'relationship', depth: 3 },
  { id: 't3-pattern-2', text: 'What do you keep doing even though you know it doesn\'t serve you?', lane: 'pattern', depth: 3 },
  { id: 't3-fear-1', text: 'What is the story you tell yourself about why things went wrong?', lane: 'fear', depth: 3 },
  { id: 't3-body-1', text: 'When you imagine saying "no", where does the resistance appear?', lane: 'body', depth: 3 },
  { id: 't3-desire-1', text: 'What part of yourself have you been waiting for permission to be?', lane: 'desire', depth: 3 },
  { id: 't3-pattern-3', text: 'What is the quiet deal you made with yourself to stay safe?', lane: 'pattern', depth: 3 },
];

// ═══════════════════════════════════════════════════
// TIER 4 — ROOT (Finding the origin)
// ═══════════════════════════════════════════════════

const TIER_4: TalkPrompt[] = [
  { id: 't4-origin-1', text: 'When was the first time you remember feeling this way?', lane: 'origin', depth: 4 },
  { id: 't4-origin-2', text: 'What did the room feel like when you were small?', lane: 'origin', depth: 4 },
  { id: 't4-relationship-1', text: 'What did they need from you that you couldn\'t give?', lane: 'relationship', depth: 4 },
  { id: 't4-origin-3', text: 'What did you learn to do to keep the peace?', lane: 'origin', depth: 4 },
  { id: 't4-fear-1', text: 'What would happen if you stopped being the person everyone needed you to be?', lane: 'fear', depth: 4 },
  { id: 't4-origin-4', text: 'Who did you become to survive that room?', lane: 'origin', depth: 4 },
  { id: 't4-body-1', text: 'Where does the child in you still hide?', lane: 'body', depth: 4 },
];

// ═══════════════════════════════════════════════════
// TIER 5 — INTEGRATION (The rewrite)
// ═══════════════════════════════════════════════════

const TIER_5: TalkPrompt[] = [
  { id: 't5-mirror-1', text: 'What would you say to yourself if you could go back to that moment?', lane: 'mirror', depth: 5 },
  { id: 't5-desire-1', text: 'What does the version of you that isn\'t afraid look like?', lane: 'desire', depth: 5 },
  { id: 't5-mirror-2', text: 'What truth have you always known but never said out loud?', lane: 'mirror', depth: 5 },
  { id: 't5-desire-2', text: 'If nothing was at risk, what would you do tomorrow?', lane: 'desire', depth: 5 },
  { id: 't5-mirror-3', text: 'What part of this story is ready to be set down?', lane: 'mirror', depth: 5 },
  { id: 't5-desire-3', text: 'What are you actually grieving?', lane: 'desire', depth: 5 },
  { id: 't5-mirror-4', text: 'You already know the answer. What is it?', lane: 'mirror', depth: 5 },
];

// ═══════════════════════════════════════════════════
// ALL PROMPTS
// ═══════════════════════════════════════════════════

export const ALL_PROMPTS: TalkPrompt[] = [
  ...TIER_1, ...TIER_2, ...TIER_3, ...TIER_4, ...TIER_5,
];

// ═══════════════════════════════════════════════════
// PROMPT SELECTION ENGINE
// ═══════════════════════════════════════════════════

/**
 * Select 2-3 prompts for the current corridor state.
 * Mixes lanes. Respects depth progression.
 * Never repeats a prompt already used in this session.
 */
export function selectPrompts(
  sessionDepth: number,
  usedPromptIds: Set<string>,
  _previousLane?: TalkLane,
): TalkPrompt[] {
  // Determine which tier to draw from
  // sessionDepth 0-1 → Tier 1, 2-3 → Tier 2, 4-5 → Tier 3, etc.
  const targetTier = Math.min(5, Math.floor(sessionDepth / 2) + 1);

  // Allow adjacent tiers for variety
  const validTiers = [targetTier];
  if (targetTier > 1) validTiers.push(targetTier - 1);
  if (targetTier < 5) validTiers.push(targetTier + 1);

  // Get available prompts
  const available = ALL_PROMPTS.filter(
    p => validTiers.includes(p.depth) && !usedPromptIds.has(p.id)
  );

  if (available.length === 0) {
    // Fallback: re-use from target tier
    const fallback = ALL_PROMPTS.filter(p => p.depth === targetTier);
    return shuffle(fallback).slice(0, 2);
  }

  // Select 2-3, preferring lane diversity
  const count = sessionDepth < 2 ? 3 : 2;
  const selected: TalkPrompt[] = [];
  const usedLanes = new Set<TalkLane>();

  // Shuffle and pick, preferring diverse lanes
  const shuffled = shuffle(available);
  for (const prompt of shuffled) {
    if (selected.length >= count) break;
    if (!usedLanes.has(prompt.lane) || selected.length < 1) {
      selected.push(prompt);
      usedLanes.add(prompt.lane);
    }
  }

  // If we didn't get enough, fill in
  while (selected.length < Math.min(count, shuffled.length)) {
    const remaining = shuffled.find(p => !selected.includes(p));
    if (remaining) selected.push(remaining);
    else break;
  }

  return selected;
}

// ═══════════════════════════════════════════════════
// REFLECTION GENERATION
// ═══════════════════════════════════════════════════

/**
 * Generate a reflection based on the most recent entry.
 * In production this would use the LLM. Here we use
 * template-based reflections that honor the lane.
 *
 * Reflections never interpret. They mirror. They reframe.
 * They open the next lane without forcing it.
 */
export function generateReflection(entry: TalkEntry): TalkReflection | null {
  // Only reflect every 2-3 entries
  const shouldReflect = entry.depth >= 2 && Math.random() < 0.5;
  if (!shouldReflect) return null;

  const reflections: Record<TalkLane, string[]> = {
    present: [
      'You named what was unnamed. That alone shifts the weight.',
      'The present is the only place where change is possible.',
    ],
    origin: [
      'The room you described still exists somewhere inside you. But you are no longer small.',
      'To name the origin is to begin to separate from it.',
    ],
    pattern: [
      'You see the pattern now. Seeing it is the first crack in the wall.',
      'The loop only has power when it runs unobserved.',
    ],
    relationship: [
      'The people we carry shape the architecture of our silence.',
      'Their story became yours. But it was never yours to begin with.',
    ],
    body: [
      'The body remembers what the mind tries to forget. You just listened to it.',
      'Naming where it lives is the beginning of releasing it.',
    ],
    fear: [
      'You looked at the shadow. It did not grow. It became observable.',
      'The worst-case scenario is almost always a memory dressed as a forecast.',
    ],
    desire: [
      'What you want is not selfish. It is the architecture of becoming.',
      'Permission was never theirs to give. It was always yours.',
    ],
    mirror: [
      'You already knew. You just needed to hear yourself say it.',
      'The truth you carry is not a burden. It is a compass.',
    ],
  };

  const options = reflections[entry.lane];
  const text = options[Math.floor(Math.random() * options.length)];

  // Next lane should be different from current
  const laneOptions: TalkLane[] = ['origin', 'present', 'pattern', 'relationship', 'body', 'fear', 'desire', 'mirror'];
  const nextLanes = laneOptions.filter(l => l !== entry.lane);
  const opensLane = nextLanes[Math.floor(Math.random() * nextLanes.length)];

  return {
    text,
    entryId: entry.id,
    opensLane,
  };
}

// ═══════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
