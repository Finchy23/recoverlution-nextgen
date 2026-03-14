/**
 * CAPTURE PROMPTS — The Vocabulary of Invitation
 *
 * Multiple prompt variants per overlay capture mode.
 * The glass never uses the same invitation twice in a row.
 * Each prompt is a whisper, not an instruction.
 *
 * These are ambient prompts. They appear as soft text
 * on the overlay, fading in after the canopy settles.
 * They do not command. They open a door.
 *
 * Critical voice rule: no dashes, no hyphens, no "you will",
 * no claims of achievement. Only invitations and observations.
 */

import type { OverlayCaptureMode } from './composition-types';

export interface PromptVariant {
  /** The ambient text shown on the overlay */
  text: string;
  /** Optional: a shorter form for compact overlays */
  short?: string;
}

/**
 * Prompt variants indexed by overlay capture mode.
 * The runtime picks randomly or cycles through these
 * so the glass feels alive, not scripted.
 */
export const CAPTURE_PROMPTS: Record<OverlayCaptureMode, PromptVariant[]> = {

  binary: [
    { text: 'one or the other', short: 'one' },
    { text: 'notice which draws', short: 'which' },
    { text: 'where does attention land', short: 'where' },
    { text: 'neither is wrong', short: 'either' },
    { text: 'what is noticed first', short: 'first' },
  ],

  select: [
    { text: 'what catches', short: 'what' },
    { text: 'which ones resonate', short: 'resonate' },
    { text: 'notice what stays', short: 'stays' },
    { text: 'what the eye finds', short: 'finds' },
    { text: 'gather what belongs', short: 'gather' },
  ],

  whisper: [
    { text: 'if something comes...', short: 'comes' },
    { text: 'if a word arrives...', short: 'word' },
    { text: 'whatever is here...', short: 'here' },
    { text: 'name it or not...', short: 'name' },
    { text: 'a phrase, not a paragraph...', short: 'phrase' },
  ],

  thought: [
    { text: 'if something wants to be said...', short: 'said' },
    { text: 'speak it or let it pass...', short: 'speak' },
    { text: 'whatever surfaces...', short: 'surfaces' },
    { text: 'a thought, not a speech...', short: 'thought' },
    { text: 'if something wants to be named...', short: 'named' },
  ],

  voice: [
    { text: 'whatever wants out...', short: 'out' },
    { text: 'whatever sound comes...', short: 'sound' },
    { text: 'the raw thing...', short: 'raw' },
    { text: 'unprocessed, as felt...', short: 'felt' },
    { text: 'let the sound carry it...', short: 'carry' },
  ],

};

/**
 * Get a random prompt for a capture mode.
 * Avoids repeating the last used prompt index.
 */
const _lastIndices: Partial<Record<OverlayCaptureMode, number>> = {};

export function getRandomPrompt(mode: OverlayCaptureMode): PromptVariant {
  const variants = CAPTURE_PROMPTS[mode];
  const lastIdx = _lastIndices[mode] ?? -1;

  let nextIdx: number;
  do {
    nextIdx = Math.floor(Math.random() * variants.length);
  } while (nextIdx === lastIdx && variants.length > 1);

  _lastIndices[mode] = nextIdx;
  return variants[nextIdx];
}

/**
 * Get a specific prompt by index (for deterministic rendering
 * in the CuesPage preview, where randomness would cause flicker).
 */
export function getPromptByIndex(mode: OverlayCaptureMode, index: number): PromptVariant {
  const variants = CAPTURE_PROMPTS[mode];
  return variants[index % variants.length];
}