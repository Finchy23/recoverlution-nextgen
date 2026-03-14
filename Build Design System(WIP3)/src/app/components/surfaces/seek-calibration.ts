/**
 * SEEK CALIBRATION — The Spatial Documentary Engine
 *
 * Three axes that calibrate the physics of deconstruction.
 * The user tells the system where the pain is,
 * how far back to look, and how to break the illusion.
 *
 * FOCUS — Where is the illusion hurting?
 *   self         The closed loop. Identity, the body, the inner critic.
 *   relations    The relational field. Boundaries, enmeshment, social exhaustion.
 *   path         The existential vector. Purpose, fear, forward momentum.
 *
 * DEPTH — How far back do we look?
 *   moment       The immediate trigger. Slows time to examine today's friction.
 *   cycle        The repeating pattern. Maps the predictable loop.
 *   origin       The foundational genesis. Gently traces the structural root.
 *
 * FRAME — How do we visually deconstruct this?
 *   layers       Peeling away the noise. Armor dissolves to reveal the core.
 *   shift        Rotating the dimension. The solid wall reveals itself hollow.
 *   thread       Tracing the dominoes. A tangled knot untangles chronologically.
 *
 * Every documentary carries a coordinate:
 *   { focus: 'self', depth: 'cycle', frame: 'shift' }
 *
 * The calibration determines which spatial experience materializes.
 */

import { room } from '../design-system/surface-tokens';

// ─── Axis Types ───

export type FocusValue = 'self' | 'relations' | 'path';
export type DepthValue = 'moment' | 'cycle' | 'origin';
export type FrameValue = 'layers' | 'shift' | 'thread';

export interface SeekCalibrationState {
  focus: FocusValue;
  depth: DepthValue;
  frame: FrameValue;
}

// ─── Shared Axis Option Type ───

export interface AxisOption<T extends string> {
  value: T;
  label: string;
  whisper: string;
  color: string;
}

export interface AxisMeta<T extends string> {
  id: string;
  question: string;
  options: AxisOption<T>[];
}

// ─── Focus Axis — "Where is the illusion?" ───

export const SEEK_FOCUS_AXIS: AxisMeta<FocusValue> = {
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

// ─── Depth Axis — "How far back?" ───

export const SEEK_DEPTH_AXIS: AxisMeta<DepthValue> = {
  id: 'depth',
  question: 'How far back',
  options: [
    {
      value: 'moment',
      label: 'The Moment',
      whisper: 'The immediate trigger',
      color: '#A8B5FF',
    },
    {
      value: 'cycle',
      label: 'The Cycle',
      whisper: 'The repeating pattern',
      color: '#D4A8E0',
    },
    {
      value: 'origin',
      label: 'The Origin',
      whisper: 'The foundational root',
      color: '#E0C888',
    },
  ],
};

// ─── Frame Axis — "How do we break it?" ───

export const SEEK_FRAME_AXIS: AxisMeta<FrameValue> = {
  id: 'frame',
  question: 'How to see it',
  options: [
    {
      value: 'layers',
      label: 'Layers',
      whisper: 'Peel the armor',
      color: room.fg,
    },
    {
      value: 'shift',
      label: 'Shift',
      whisper: 'Rotate the dimension',
      color: room.fg,
    },
    {
      value: 'thread',
      label: 'Thread',
      whisper: 'Trace the dominoes',
      color: room.fg,
    },
  ],
};

// ─── All Axes ───

export const SEEK_ALL_AXES = [SEEK_FOCUS_AXIS, SEEK_DEPTH_AXIS, SEEK_FRAME_AXIS] as const;

// ─── Defaults ───

export const DEFAULT_SEEK_CALIBRATION: SeekCalibrationState = {
  focus: 'self',
  depth: 'cycle',
  frame: 'shift',
};

// ─── Documentary Coordinate ───

export interface DocCoordinate {
  focus: FocusValue;
  depth: DepthValue;
  frame: FrameValue;
}

// ─── Matching ───

export function seekMatchScore(
  calibration: SeekCalibrationState,
  coordinate: DocCoordinate,
): number {
  let score = 0;
  if (calibration.focus === coordinate.focus) score++;
  if (calibration.depth === coordinate.depth) score++;
  if (calibration.frame === coordinate.frame) score++;
  return score;
}

// ─── Cycle Helpers ───

export function cycleAxis<T extends string>(
  current: T,
  options: AxisOption<T>[],
): T {
  const idx = options.findIndex(o => o.value === current);
  const next = (idx + 1) % options.length;
  return options[next].value;
}

export function getSeekColor(calibration: SeekCalibrationState): string {
  const focusOption = SEEK_FOCUS_AXIS.options.find(o => o.value === calibration.focus);
  return focusOption?.color ?? '#B8A0FF';
}

// ─── Documentary Content ───

export interface SeekDocumentary {
  id: string;
  coordinate: DocCoordinate;
  /** The monolith title — what the object represents */
  monolith: string;
  /** The hook line that appears with the monolith */
  hook: string;
  /** The reveal lines that emerge during interaction */
  reveals: string[];
  /** The final truth that appears when deconstruction completes */
  truth: string;
  /** Color accent for the monolith */
  color: string;
}

export const SEEK_DOCUMENTARIES: SeekDocumentary[] = [
  // ── Self × Cycle × Shift (The default experience) ──
  {
    id: 'perfectionism-shift',
    coordinate: { focus: 'self', depth: 'cycle', frame: 'shift' },
    monolith: 'The pressure to be perfect',
    hook: 'It looks solid from the front.',
    reveals: [
      'The wall casts a long shadow.',
      'But the shadow is the whole trick.',
      'From this angle, there is no wall at all.',
      'Only a line. A single dimension.',
      'The belief was never structural.',
    ],
    truth: 'It was always projection, not architecture.',
    color: '#B8A0FF',
  },
  // ── Self × Moment × Layers ──
  {
    id: 'inner-critic-layers',
    coordinate: { focus: 'self', depth: 'moment', frame: 'layers' },
    monolith: 'The voice that says not enough',
    hook: 'Heavily armored. Loud. Certain.',
    reveals: [
      'The outer layer: rage. At yourself.',
      'Beneath that: exhaustion. Years of performing.',
      'Beneath that: a child trying very hard.',
      'And at the center, something quiet:',
      'The original wish to simply be seen.',
    ],
    truth: 'The cruelest voice was once the most tender.',
    color: '#B8A0FF',
  },
  // ── Relations × Cycle × Thread ──
  {
    id: 'boundary-thread',
    coordinate: { focus: 'relations', depth: 'cycle', frame: 'thread' },
    monolith: 'The inability to say no',
    hook: 'A knot. Dense and familiar.',
    reveals: [
      'The first thread: someone needed you.',
      'You learned that love was a transaction.',
      'The pattern replicated: give, collapse, resent.',
      'Each loop tighter than the last.',
      'But the thread has a beginning.',
    ],
    truth: 'Saying no was never the betrayal. Silence was.',
    color: '#80C8A0',
  },
  // ── Path × Origin × Layers ──
  {
    id: 'purpose-layers',
    coordinate: { focus: 'path', depth: 'origin', frame: 'layers' },
    monolith: 'The fear of wasting your life',
    hook: 'It towers. It dwarfs every decision.',
    reveals: [
      'The outermost shell: urgency. Time running out.',
      'Beneath: comparison. Other lives seem certain.',
      'Beneath that: a borrowed metric of success.',
      'And deeper still: the original curiosity.',
      'Before anyone told you what mattered.',
    ],
    truth: 'The path was never missing. It was buried under instructions.',
    color: '#FFB088',
  },
  // ── Self × Origin × Thread ──
  {
    id: 'shame-thread',
    coordinate: { focus: 'self', depth: 'origin', frame: 'thread' },
    monolith: 'The feeling of being fundamentally broken',
    hook: 'A dense tangle. No visible beginning.',
    reveals: [
      'Pull the first thread: a moment of exposure.',
      'A child misread silence as verdict.',
      'That verdict became identity.',
      'Identity became filter.',
      'Every experience passed through it, distorted.',
    ],
    truth: 'The brokenness was a story told by someone who was also broken.',
    color: '#B8A0FF',
  },
  // ── Relations × Moment × Shift ──
  {
    id: 'rejection-shift',
    coordinate: { focus: 'relations', depth: 'moment', frame: 'shift' },
    monolith: 'The sting of being left out',
    hook: 'A wall between you and them.',
    reveals: [
      'From the front: exclusion. A closed door.',
      'But the wall starts to turn.',
      'From the side: the door was never locked.',
      'It was your hand on the handle.',
      'The story of rejection wrote itself.',
    ],
    truth: 'The wall was a mirror you mistook for a barrier.',
    color: '#80C8A0',
  },
  // ── Path × Cycle × Shift ──
  {
    id: 'procrastination-shift',
    coordinate: { focus: 'path', depth: 'cycle', frame: 'shift' },
    monolith: 'The paralysis before every decision',
    hook: 'A massive block. Immovable.',
    reveals: [
      'Each cycle: the urgency builds.',
      'Then the freeze. Then the shame.',
      'But rotate the block and see:',
      'The paralysis is not weakness.',
      'It is a nervous system buying time.',
    ],
    truth: 'The freeze was protection, not failure.',
    color: '#FFB088',
  },
  // ── Path × Moment × Thread ──
  {
    id: 'anxiety-thread',
    coordinate: { focus: 'path', depth: 'moment', frame: 'thread' },
    monolith: 'The spiral that starts with one thought',
    hook: 'A single filament, vibrating.',
    reveals: [
      'One thought: what if it goes wrong.',
      'It pulls the next: what if I cannot handle it.',
      'Which pulls: what if I have always been this fragile.',
      'The cascade is instant.',
      'But the first thread was only a question.',
    ],
    truth: 'The spiral mistook curiosity for catastrophe.',
    color: '#FFB088',
  },
  // ── Relations × Origin × Layers ──
  {
    id: 'trust-layers',
    coordinate: { focus: 'relations', depth: 'origin', frame: 'layers' },
    monolith: 'The weight of never fully trusting',
    hook: 'Dense. Armored at every seam.',
    reveals: [
      'The surface: hypervigilance. Scanning for threat.',
      'Beneath: the exhaustion of constant readiness.',
      'Beneath that: a memory of rupture.',
      'Someone close became unpredictable.',
      'The armor was the only architecture that held.',
    ],
    truth: 'The armor worked. It is simply too heavy for now.',
    color: '#80C8A0',
  },
];

/**
 * Find the best documentary match for the current calibration.
 */
export function findDocumentary(calibration: SeekCalibrationState): SeekDocumentary {
  let best = SEEK_DOCUMENTARIES[0];
  let bestScore = 0;

  for (const doc of SEEK_DOCUMENTARIES) {
    const score = seekMatchScore(calibration, doc.coordinate);
    if (score > bestScore) {
      bestScore = score;
      best = doc;
    }
  }

  return best;
}
