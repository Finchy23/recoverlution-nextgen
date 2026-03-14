/**
 * FORM CALIBRATION — The Somatic Compass
 *
 * Three axes that locate the right practice.
 * The user never browses. They never choose.
 * They simply describe the shape of their body right now
 * and the system gives them the one.
 *
 * BODY — Where is the weight?
 *   head       Thought loops, inner critic, cognitive noise.
 *   chest      Relational ache, grief, the hollow space.
 *   limbs      Restlessness, freeze, impulse to flee or fight.
 *
 * TONE — What quality of attention does the body need?
 *   soft       Gentle settling. Parasympathetic invitation.
 *   steady     Observational witnessing. Clinical presence.
 *   firm       Boundaried, active. Pushing back against the pattern.
 *
 * PACE — How does the practice move through time?
 *   brief      Contained. Three containers. A single breath exercise.
 *   sustained  Full protocol. Four containers. The standard arc.
 *   expansive  Complete. All five containers. The full consulting room.
 *
 * 3 x 3 x 3 = 27 coordinates. Each is occupied.
 * Every coordinate maps to a specific practice.
 * Some practices serve multiple coordinates
 * (the same room, approached from a different door).
 *
 * The calibration remembers which coordinates you have visited.
 * Over time, it gently invites you toward the ones you have not.
 */

import { room } from '../design-system/surface-tokens';

// ─── Axis Types ───

export type BodyValue = 'head' | 'chest' | 'limbs';
export type ToneValue = 'soft' | 'steady' | 'firm';
export type PaceValue = 'brief' | 'sustained' | 'expansive';

export interface FormCalibrationState {
  body: BodyValue;
  tone: ToneValue;
  pace: PaceValue;
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

// ─── Body Axis — "Where is the weight?" ───

export const BODY_AXIS: AxisMeta<BodyValue> = {
  id: 'body',
  question: 'Where is it',
  options: [
    {
      value: 'head',
      label: 'The Head',
      whisper: 'Thought loops',
      color: '#B8A0FF',
    },
    {
      value: 'chest',
      label: 'The Chest',
      whisper: 'The hollow space',
      color: '#FF9EAE',
    },
    {
      value: 'limbs',
      label: 'The Limbs',
      whisper: 'Restless or frozen',
      color: '#80C8A0',
    },
  ],
};

// ─── Tone Axis — "What quality of attention?" ───

export const TONE_AXIS: AxisMeta<ToneValue> = {
  id: 'tone',
  question: 'What it needs',
  options: [
    {
      value: 'soft',
      label: 'Soft',
      whisper: 'Gentle settling',
      color: '#A8D4E0',
    },
    {
      value: 'steady',
      label: 'Steady',
      whisper: 'Clinical witness',
      color: '#D4A8E0',
    },
    {
      value: 'firm',
      label: 'Firm',
      whisper: 'Pushing back',
      color: '#FFB088',
    },
  ],
};

// ─── Pace Axis — "How does the practice move?" ───

export const PACE_AXIS: AxisMeta<PaceValue> = {
  id: 'pace',
  question: 'How long to stay',
  options: [
    {
      value: 'brief',
      label: 'Brief',
      whisper: 'A single breath',
      color: '#C8D4A0',
    },
    {
      value: 'sustained',
      label: 'Sustained',
      whisper: 'The full arc',
      color: '#A8B5FF',
    },
    {
      value: 'expansive',
      label: 'Expansive',
      whisper: 'The complete room',
      color: '#E0C888',
    },
  ],
};

// ─── Cycle helper ───

export function cycleAxis<T extends string>(
  current: T,
  options: AxisOption<T>[],
): T {
  const idx = options.findIndex(o => o.value === current);
  return options[(idx + 1) % options.length].value;
}

// ─── Default state ───

export const DEFAULT_FORM_CALIBRATION: FormCalibrationState = {
  body: 'chest',
  tone: 'soft',
  pace: 'sustained',
};

// ═══════════════════════════════════════════════════
// THE COORDINATE GRID — 27 addresses, each occupied
// ═══════════════════════════════════════════════════

/**
 * Each coordinate maps to a practiceId from form-practices.ts.
 *
 * The mapping is intentional:
 *   BODY determines the schema domain (where the friction lives)
 *   TONE determines the protocol quality (how clinical vs gentle)
 *   PACE determines the container count (3, 4, or 5 containers)
 *
 * Some practices serve multiple coordinates. This is by design.
 * The same room, approached from a different door, is a different experience.
 */

type CoordinateKey = `${BodyValue}:${ToneValue}:${PaceValue}`;

const COORDINATE_GRID: Record<CoordinateKey, string> = {
  // ─── HEAD (thought loops, inner critic, cognitive noise) ───

  // Head + Soft: gentle defusion, settling the mind
  'head:soft:brief':      'bilateral-chaos',       // Quick bilateral reset for racing thoughts
  'head:soft:sustained':  'defusion-alone',         // Gentle gravity defusion
  'head:soft:expansive':  'defusion-imposter',      // Full imposter defusion with all containers

  // Head + Steady: witnessing the thought pattern
  'head:steady:brief':    'bilateral-chaos',        // Bilateral coherence for clarity
  'head:steady:sustained': 'rescript-recovery',     // Rescripting the thought with witness presence
  'head:steady:expansive': 'defusion-imposter',     // Full clinical defusion, observer state

  // Head + Firm: actively pushing back against the loop
  'head:firm:brief':      'bilateral-chaos',        // Short, firm frequency reset
  'head:firm:sustained':  'unburdening-failure',    // Unburdening the part that carries the loop
  'head:firm:expansive':  'unburdening-failure',    // Full parts work, active separation

  // ─── CHEST (relational ache, grief, the hollow space) ───

  // Chest + Soft: gentle somatic settling of grief
  'chest:soft:brief':     'titration-chest',        // Brief body anchor, chest focus
  'chest:soft:sustained': 'titration-chest',        // Sustained somatic titration
  'chest:soft:expansive': 'bridge-repair',          // Full relational repair, gentle approach

  // Chest + Steady: witnessing the relational field
  'chest:steady:brief':   'titration-chest',        // Quick chest observation
  'chest:steady:sustained': 'defusion-alone',       // Steady witnessing of aloneness
  'chest:steady:expansive': 'bridge-repair',        // Full relational witness, all containers

  // Chest + Firm: holding ground in relational pain
  'chest:firm:brief':     'bridge-no',              // Brief grounding for relational boundary
  'chest:firm:sustained': 'bridge-no',              // Full boundary holding practice
  'chest:firm:expansive': 'bridge-repair',          // Complete relational repair with firm presence

  // ─── LIMBS (restlessness, freeze, impulse to flee) ───

  // Limbs + Soft: gentle thawing of freeze
  'limbs:soft:brief':     'pendulation-trust',      // Brief root pendulation, gentle
  'limbs:soft:sustained': 'pendulation-trust',      // Sustained rooting, gentle oscillation
  'limbs:soft:expansive': 'rescript-recovery',      // Full rescripting, forward memory

  // Limbs + Steady: witnessing the somatic impulse
  'limbs:steady:brief':   'shield-centrifuge',      // Quick centrifuge, separate noise
  'limbs:steady:sustained': 'shield-boundary',      // Sustained boundary casting
  'limbs:steady:expansive': 'shield-centrifuge',    // Full centrifuge, all containers

  // Limbs + Firm: active boundary work against the freeze/flight
  'limbs:firm:brief':     'shield-boundary',        // Brief perimeter cast
  'limbs:firm:sustained': 'shield-boundary',        // Full boundary protocol
  'limbs:firm:expansive': 'unburdening-failure',    // Complete unburdening of the frozen part
};

/**
 * Resolve a calibration state to a practice ID.
 * Every coordinate is occupied. This function always returns a value.
 */
export function resolvePractice(calibration: FormCalibrationState): string {
  const key: CoordinateKey = `${calibration.body}:${calibration.tone}:${calibration.pace}`;
  return COORDINATE_GRID[key];
}

/**
 * Get the coordinate key for display/tracking.
 */
export function getCoordinateKey(calibration: FormCalibrationState): string {
  return `${calibration.body}:${calibration.tone}:${calibration.pace}`;
}
