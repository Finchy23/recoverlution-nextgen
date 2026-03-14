/**
 * READ CALIBRATION — The Tri-Dial Aperture
 *
 * Three axes that tune the Infinite Book.
 * The user never sees a database. They never see schema names.
 * They simply move three dials to match the shape of
 * the space they are currently standing in.
 *
 * FOCUS — Where is the friction hurting?
 *   self         The closed loop. Identity, the body, the inner critic.
 *   relations    The relational field. Boundaries, enmeshment, social exhaustion.
 *   path         The existential vector. Purpose, fear, forward momentum.
 *
 * LENS — Which language do you need?
 *   science      Clinical, objective. The mechanism explained.
 *   psyche       Psychological, reflective. The defense mechanisms named.
 *   wisdom       Philosophical, spacious. The continuum of experience.
 *
 * MODE — How much cognitive bandwidth?
 *   theory       The analytical deep dive. The "why."
 *   playbook     Pure tactical application. The "how."
 *   story        Narrative and metaphor. The "feeling."
 *
 * Every article in the library carries a coordinate:
 *   { focus: 'self', lens: 'science', mode: 'theory' }
 *
 * The calibration state determines which articles surface.
 * When multiple articles match, they thread in sequence.
 * The user simply reads. The book turns itself.
 */

import { room } from '../design-system/surface-tokens';

// ─── Axis Types ───

export type FocusValue = 'self' | 'relations' | 'path';
export type LensValue = 'science' | 'psyche' | 'wisdom';
export type ModeValue = 'theory' | 'playbook' | 'story';

export interface CalibrationState {
  focus: FocusValue;
  lens: LensValue;
  mode: ModeValue;
}

// ─── Axis Option Metadata ───

export interface AxisOption<T extends string> {
  value: T;
  label: string;           // What appears on the dial
  whisper: string;          // The sub-line
  color: string;            // Tint when active
}

export interface AxisMeta<T extends string> {
  id: string;               // 'focus' | 'lens' | 'mode'
  question: string;         // The felt question
  options: AxisOption<T>[];
}

// ─── Focus Axis — "Where is the friction?" ───

export const FOCUS_AXIS: AxisMeta<FocusValue> = {
  id: 'focus',
  question: 'Where is it',
  options: [
    {
      value: 'self',
      label: 'The Self',
      whisper: 'The closed loop',
      color: '#B8A0FF',
    },
    {
      value: 'relations',
      label: 'Relations',
      whisper: 'The relational field',
      color: '#80C8A0',
    },
    {
      value: 'path',
      label: 'The Path',
      whisper: 'The existential vector',
      color: '#FFB088',
    },
  ],
};

// ─── Lens Axis — "Which language?" ───

export const LENS_AXIS: AxisMeta<LensValue> = {
  id: 'lens',
  question: 'Which voice',
  options: [
    {
      value: 'science',
      label: 'Science',
      whisper: 'The mechanism',
      color: '#A8B5FF',
    },
    {
      value: 'psyche',
      label: 'Psyche',
      whisper: 'The mirror',
      color: '#D4A8E0',
    },
    {
      value: 'wisdom',
      label: 'Wisdom',
      whisper: 'The continuum',
      color: '#E0C888',
    },
  ],
};

// ─── Mode Axis — "How much energy?" ───

export const MODE_AXIS: AxisMeta<ModeValue> = {
  id: 'mode',
  question: 'How deep',
  options: [
    {
      value: 'theory',
      label: 'Theory',
      whisper: 'The why',
      color: room.fg,
    },
    {
      value: 'playbook',
      label: 'Playbook',
      whisper: 'The how',
      color: room.fg,
    },
    {
      value: 'story',
      label: 'Story',
      whisper: 'The feeling',
      color: room.fg,
    },
  ],
};

// ─── All Axes ───

export const ALL_AXES = [FOCUS_AXIS, LENS_AXIS, MODE_AXIS] as const;

// ─── Defaults ───

export const DEFAULT_CALIBRATION: CalibrationState = {
  focus: 'self',
  lens: 'science',
  mode: 'theory',
};

// ─── Article Coordinate ───

export interface ArticleCoordinate {
  focus: FocusValue;
  lens: LensValue;
  mode: ModeValue;
}

// ─── Matching ───

/**
 * Score how well an article coordinate matches the calibration.
 * 3 = exact match, 2 = two axes match, 1 = one axis, 0 = none.
 */
export function matchScore(
  calibration: CalibrationState,
  coordinate: ArticleCoordinate,
): number {
  let score = 0;
  if (calibration.focus === coordinate.focus) score++;
  if (calibration.lens === coordinate.lens) score++;
  if (calibration.mode === coordinate.mode) score++;
  return score;
}

/**
 * Get the active color for the current calibration.
 * Blends the focus color (where it hurts) as the primary tint.
 */
export function getCalibrationColor(calibration: CalibrationState): string {
  const focusOption = FOCUS_AXIS.options.find(o => o.value === calibration.focus);
  return focusOption?.color ?? '#B8A0FF';
}

/**
 * Cycle to the next value in an axis.
 */
export function cycleAxis<T extends string>(
  current: T,
  options: AxisOption<T>[],
): T {
  const idx = options.findIndex(o => o.value === current);
  const next = (idx + 1) % options.length;
  return options[next].value;
}