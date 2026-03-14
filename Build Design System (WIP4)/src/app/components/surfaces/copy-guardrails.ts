/**
 * COPY GUARDRAILS — The Language of the Glass
 *
 * Every word is a design decision. Every character counts.
 * Copy in Recoverlution follows strict typographic and tonal rules.
 *
 * The glass speaks in whispers, not shouts.
 * No marketing. No motivation. No exclamation marks.
 * No time references. No numbers. No metrics.
 *
 * ─── TIERS ───
 *
 * EYEBROW (Modality Signal)
 *   Font: Inter · 8px · Weight 500 · Tracking 0.28em
 *   Color: Modality color · Opacity 0.35
 *   Content: 4-letter modality name ONLY (FLOW, MOVE, FUEL, HOLD, RISE)
 *   Max: 4 characters. No exceptions.
 *
 * HEADLINE (Practice Title)
 *   Font: Crimson Pro · 28px · Weight 300 · Line-height 1.2
 *   Color: #F9F8FF · Opacity 0.85
 *   Max: 28 characters. Sentence case. No periods. No exclamation.
 *   Tone: Evocative, not descriptive. A name, not a label.
 *   Examples: "Autonomic Reset" · "Still Point" · "Morning Ground"
 *   Anti-examples: "10 Min Breathing Exercise" · "Quick Yoga Flow!"
 *
 * DESCRIPTION (The Whisper)
 *   Font: Crimson Pro italic · 13px · Weight 300 · Line-height 1.5
 *   Color: #F9F8FF · Opacity 0.25
 *   Max: 80 characters. One breath of context.
 *   Tone: Poetic, not explanatory. An invitation, not a summary.
 *   Examples: "The fastest remote control for your nervous system"
 *   Anti-examples: "This is a 6 minute breathwork session for beginners"
 *
 * GESTURE (Action Cue)
 *   Font: Inter · 7px · Weight 400 · Tracking 0.2em
 *   Color: Modality color · Opacity 0.15
 *   Max: 8 characters. Uppercase.
 *   Values: "ENTER" · "BEGIN" · "STEP IN"
 *
 * ─── PROHIBITIONS ───
 *
 *   ✗ Numbers (no duration, no counts, no indices)
 *   ✗ Time words (minutes, seconds, "quick", "short", "long")
 *   ✗ Difficulty labels (beginner, advanced, level)
 *   ✗ Marketing language (transform, unlock, boost, crush)
 *   ✗ Exclamation marks
 *   ✗ Emojis
 *   ✗ "Library" or "browse" or "catalog" or "collection"
 *   ✗ Progress indicators (1/12, step 3 of 5)
 *
 * ─── THE RULE ───
 *
 *   If removing the word makes the glass feel lighter, remove it.
 */

import { font, weight, typeSize, tracking, leading } from '../design-system/surface-tokens';

// ─── Character limits ───

export const COPY_LIMITS = {
  eyebrow: 4,       // FLOW, MOVE, FUEL, HOLD, RISE — exactly 4
  headline: 28,      // Practice title
  description: 80,   // One breath of context
  gesture: 8,        // Action word
} as const;

// ─── Enforce limits (truncate gracefully) ───

export function clampHeadline(text: string): string {
  if (text.length <= COPY_LIMITS.headline) return text;
  // Truncate at last word boundary within limit
  const trimmed = text.slice(0, COPY_LIMITS.headline);
  const lastSpace = trimmed.lastIndexOf(' ');
  return lastSpace > 10 ? trimmed.slice(0, lastSpace) : trimmed;
}

export function clampDescription(text: string): string {
  if (!text) return '';
  if (text.length <= COPY_LIMITS.description) return text;
  const trimmed = text.slice(0, COPY_LIMITS.description);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed) + '\u2026';
}

// ─── Sanitize — strip prohibited patterns ───

const PROHIBITED_PATTERNS = [
  /\d+\s*min(ute)?s?/gi,     // "10 min", "5 minutes"
  /\d+\s*sec(ond)?s?/gi,     // "30 seconds"
  /level\s*\d+/gi,           // "level 3"
  /step\s*\d+/gi,            // "step 2"
  /beginner|intermediate|advanced/gi,
  /[!]/g,                     // exclamation marks
  /\d+\s*\/\s*\d+/g,         // "1/12"
];

export function sanitize(text: string): string {
  let result = text;
  for (const pattern of PROHIBITED_PATTERNS) {
    result = result.replace(pattern, '').trim();
  }
  // Collapse multiple spaces
  return result.replace(/\s+/g, ' ').trim();
}

// ─── Typography specs (for reference — applied inline in components) ───

export const TYPOGRAPHY = {
  eyebrow: {
    fontFamily: font.sans,
    fontSize: typeSize.label,
    fontWeight: weight.medium,
    letterSpacing: tracking.eyebrow,
  },
  headline: {
    fontFamily: font.serif,
    fontSize: typeSize.display,
    fontWeight: weight.light,
    lineHeight: leading.heading,
  },
  description: {
    fontFamily: font.serif,
    fontSize: typeSize.reading,
    fontWeight: weight.light,
    fontStyle: 'italic' as const,
    lineHeight: leading.body,
  },
  gesture: {
    fontFamily: font.sans,
    fontSize: typeSize.micro,
    fontWeight: weight.regular,
    letterSpacing: tracking.normal,
  },
} as const;