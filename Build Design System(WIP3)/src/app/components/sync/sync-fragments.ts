/**
 * SYNC FRAGMENTS — Atomic Decomposition of Copy Compositions
 *
 * Breaks every SyncComposition into its smallest gated units.
 * Each fragment is a single copy event with:
 *   - Its own entry behavior (how it appears)
 *   - Its own exit behavior (how it leaves)
 *   - Its depth layer assignment
 *   - Its timing envelope (delay → fadeIn → hold → fadeOut)
 *   - Its anchor position
 *   - Its typography config
 *
 * This is the contract surface for JSON-driven content.
 * Every fragment can be previewed, gated, and timed independently.
 */

import type {
  SyncComposition,
  SyncPayload,
  Beat,
  CopyType,
  DepthLayer,
  TypoConfig,
} from './sync-types';
import { BEAT_TIMING, TYPO_CONFIG, DEPTH_LAYERS } from './sync-types';
import { weight, font, typeSize, tracking, leading, opacity } from '../design-system/surface-tokens';

// ═══════════════════════════════════════════════════
// FRAGMENT TYPES
// ═══════════════════════════════════════════════════

export type EntryBehavior =
  | 'fade'              // Simple opacity ramp
  | 'emerge-from-depth' // Blur+opacity+scale from background → foreground
  | 'lock-on'           // Snap to touch position
  | 'ambient';          // Ultra-low opacity atmospheric drift

export type ExitBehavior =
  | 'recede'            // Push to midground (blur + fade)
  | 'vanish'            // Instant opacity kill
  | 'dissolve'          // Slow opacity + letter-spacing drift
  | 'blur-out'          // Blur to background then fade
  | 'persist';          // Stays until beat change forces it

export type FragmentRole =
  | 'atmospheric'
  | 'entrance-primary'
  | 'entrance-anecdote'
  | 'friction-directive'
  | 'friction-reframe'
  | 'release-resolution';

export interface TimingEnvelope {
  /** Delay from beat start before entry begins (seconds) */
  delay: number;
  /** Duration of entry animation (seconds) */
  fadeIn: number;
  /** How long the fragment holds at peak visibility (seconds) */
  hold: number;
  /** Duration of exit animation (seconds) */
  fadeOut: number;
  /** Total lifecycle = delay + fadeIn + hold + fadeOut */
  total: number;
}

export interface DepthBehavior {
  /** Starting depth layer */
  entryLayer: DepthLayer;
  /** Peak depth layer (where it lives during hold) */
  peakLayer: DepthLayer;
  /** Exit depth layer */
  exitLayer: DepthLayer;
  /** Entry blur (px) */
  entryBlur: number;
  /** Peak blur (px) */
  peakBlur: number;
  /** Exit blur (px) */
  exitBlur: number;
  /** Entry opacity */
  entryOpacity: number;
  /** Peak opacity */
  peakOpacity: number;
  /** Exit opacity */
  exitOpacity: number;
  /** Entry scale */
  entryScale: number;
  /** Peak scale */
  peakScale: number;
  /** Exit scale */
  exitScale: number;
}

export interface SyncFragment {
  /** Unique fragment identifier within composition */
  id: string;
  /** Human label */
  label: string;
  /** Which role in the composition */
  role: FragmentRole;
  /** Which beat this fragment belongs to */
  beat: Beat;
  /** The copy type of the payload */
  copyType: CopyType;
  /** The copy payload */
  payload: SyncPayload;
  /** Typography configuration */
  typography: TypoConfig;
  /** How the fragment enters */
  entry: EntryBehavior;
  /** How the fragment exits */
  exit: ExitBehavior;
  /** Full timing envelope */
  timing: TimingEnvelope;
  /** Depth behavior through lifecycle */
  depth: DepthBehavior;
  /** Whether this fragment is progress-driven (tied to atom interaction) */
  progressDriven: boolean;
  /** Whether this fragment is touch-locked */
  touchLocked: boolean;
  /** JSON-ready flag — can this fragment receive external content? */
  jsonReady: boolean;
}

// ═══════════════════════════════════════════════════
// DECOMPOSITION ENGINE
// ══════════════════════════════════════════════════

function makeEnvelope(delay: number, fadeIn: number, hold: number, fadeOut: number): TimingEnvelope {
  return { delay, fadeIn, hold, fadeOut, total: delay + fadeIn + hold + fadeOut };
}

function makeDepth(
  entryLayer: DepthLayer, peakLayer: DepthLayer, exitLayer: DepthLayer,
  overrides?: Partial<DepthBehavior>,
): DepthBehavior {
  const entry = DEPTH_LAYERS[entryLayer];
  const peak = DEPTH_LAYERS[peakLayer];
  const exit = DEPTH_LAYERS[exitLayer];
  return {
    entryLayer, peakLayer, exitLayer,
    entryBlur: entry.blur,
    peakBlur: peak.blur,
    exitBlur: exit.blur,
    entryOpacity: 0,
    peakOpacity: peak.opacity,
    exitOpacity: 0,
    entryScale: entry.scale,
    peakScale: peak.scale,
    exitScale: exit.scale,
    ...overrides,
  };
}

/**
 * Decompose a SyncComposition into its atomic fragments.
 * Returns an ordered array from first-to-appear to last-to-dissolve.
 */
export function decomposeComposition(comp: SyncComposition): SyncFragment[] {
  const fragments: SyncFragment[] = [];
  const atomId = comp.atomId;

  // ─── 1. ATMOSPHERIC ───
  if (comp.atmospheric) {
    fragments.push({
      id: `${atomId}::atmospheric`,
      label: 'Atmospheric',
      role: 'atmospheric',
      beat: 'entrance',
      copyType: 'mirror', // atmospheric uses no specific copy type but maps closest
      payload: { type: 'mirror', text: comp.atmospheric },
      typography: {
        fontFamily: font.sans,
        fontSize: typeSize.micro,
        fontWeight: weight.regular,
        letterSpacing: tracking.breath,
        lineHeight: leading.compact,
        textTransform: 'uppercase',
        anchor: 'upper-third',
        maxWidthFrac: 0.9,
      },
      entry: 'ambient',
      exit: 'vanish',
      timing: makeEnvelope(0, 1.5, 8, 0.15),
      depth: makeDepth('background', 'background', 'background', {
        peakOpacity: opacity.ghost,
        exitOpacity: 0,
      }),
      progressDriven: false,
      touchLocked: false,
      jsonReady: true,
    });
  }

  // ─── 2. ENTRANCE PRIMARY ───
  fragments.push({
    id: `${atomId}::entrance-primary`,
    label: 'Entrance Primary',
    role: 'entrance-primary',
    beat: 'entrance',
    copyType: comp.entrance.primary.type,
    payload: comp.entrance.primary,
    typography: TYPO_CONFIG[comp.entrance.primary.type],
    entry: 'fade',
    exit: 'recede',
    timing: makeEnvelope(
      0.1,
      BEAT_TIMING.entranceFadeIn,
      4.0, // holds until beat transition
      BEAT_TIMING.entranceRecede,
    ),
    depth: makeDepth('foreground', 'foreground', 'midground', {
      peakOpacity: opacity.full,
      exitBlur: 6,
    }),
    progressDriven: false,
    touchLocked: false,
    jsonReady: true,
  });

  // ─── 3. ENTRANCE ANECDOTE ───
  if (comp.entrance.anecdote) {
    fragments.push({
      id: `${atomId}::entrance-anecdote`,
      label: 'Entrance Anecdote',
      role: 'entrance-anecdote',
      beat: 'entrance',
      copyType: comp.entrance.anecdote.type,
      payload: comp.entrance.anecdote,
      typography: TYPO_CONFIG[comp.entrance.anecdote.type],
      entry: 'fade',
      exit: 'recede',
      timing: makeEnvelope(
        0.4, // slightly delayed from primary
        BEAT_TIMING.entranceFadeIn * 1.3,
        3.5,
        BEAT_TIMING.entranceRecede * 1.2,
      ),
      depth: makeDepth('midground', 'foreground', 'background', {
        peakBlur: 0,
        peakOpacity: opacity.spoken,
      }),
      progressDriven: false,
      touchLocked: false,
      jsonReady: true,
    });
  }

  // ─── 4. FRICTION DIRECTIVE ───
  fragments.push({
    id: `${atomId}::friction-directive`,
    label: 'Friction Directive',
    role: 'friction-directive',
    beat: 'friction',
    copyType: 'directive',
    payload: comp.friction.directive,
    typography: TYPO_CONFIG.directive,
    entry: 'lock-on',
    exit: 'vanish',
    timing: makeEnvelope(
      0,
      BEAT_TIMING.directiveAppear,
      6.0, // persists through friction
      BEAT_TIMING.releaseVanish,
    ),
    depth: makeDepth('foreground', 'foreground', 'foreground', {
      peakOpacity: opacity.full,
    }),
    progressDriven: false,
    touchLocked: true,
    jsonReady: true,
  });

  // ─── 5. FRICTION REFRAME ───
  fragments.push({
    id: `${atomId}::friction-reframe`,
    label: 'Friction Reframe',
    role: 'friction-reframe',
    beat: 'friction',
    copyType: 'reframe',
    payload: comp.friction.reframe,
    typography: TYPO_CONFIG.reframe,
    entry: 'emerge-from-depth',
    exit: 'vanish',
    timing: makeEnvelope(
      0.8, // delayed — emerges as interaction deepens
      BEAT_TIMING.reframeEmergence,
      4.0,
      BEAT_TIMING.releaseVanish,
    ),
    depth: makeDepth('background', 'foreground', 'foreground', {
      entryBlur: DEPTH_LAYERS.background.blur,
      peakBlur: 0,
      entryOpacity: 0,
      peakOpacity: opacity.bright,
    }),
    progressDriven: true,
    touchLocked: false,
    jsonReady: true,
  });

  // ─── 6. RELEASE RESOLUTION ───
  fragments.push({
    id: `${atomId}::release-resolution`,
    label: 'Release Resolution',
    role: 'release-resolution',
    beat: 'release',
    copyType: 'resolution',
    payload: comp.release.resolution,
    typography: TYPO_CONFIG.resolution,
    entry: 'fade',
    exit: 'dissolve',
    timing: makeEnvelope(
      0.2,
      BEAT_TIMING.resolutionAppear,
      BEAT_TIMING.resolutionLinger,
      BEAT_TIMING.resolutionDissolve,
    ),
    depth: makeDepth('foreground', 'foreground', 'foreground', {
      peakOpacity: opacity.solid,
      exitOpacity: 0,
    }),
    progressDriven: false,
    touchLocked: false,
    jsonReady: true,
  });

  return fragments;
}

/**
 * Get fragments filtered by beat
 */
export function getFragmentsByBeat(fragments: SyncFragment[], beat: Beat): SyncFragment[] {
  return fragments.filter(f => f.beat === beat);
}

/**
 * Get fragments filtered by copy type
 */
export function getFragmentsByCopyType(fragments: SyncFragment[], copyType: CopyType): SyncFragment[] {
  return fragments.filter(f => f.copyType === copyType);
}

/**
 * Get the total timeline duration for a set of fragments
 */
export function getTimelineDuration(fragments: SyncFragment[]): number {
  if (fragments.length === 0) return 0;
  return Math.max(...fragments.map(f => f.timing.delay + f.timing.total));
}

/**
 * All fragment roles in order
 */
export const FRAGMENT_ROLES: { role: FragmentRole; label: string; beat: Beat }[] = [
  { role: 'atmospheric', label: 'Atmospheric', beat: 'entrance' },
  { role: 'entrance-primary', label: 'Primary', beat: 'entrance' },
  { role: 'entrance-anecdote', label: 'Anecdote', beat: 'entrance' },
  { role: 'friction-directive', label: 'Directive', beat: 'friction' },
  { role: 'friction-reframe', label: 'Reframe', beat: 'friction' },
  { role: 'release-resolution', label: 'Resolution', beat: 'release' },
];

/**
 * Copy type display info
 */
export const COPY_TYPE_INFO: Record<CopyType, { label: string; glyph: string; description: string }> = {
  mirror:     { label: 'MIRROR',     glyph: '◉', description: 'Observation — undeniable truth' },
  probe:      { label: 'PROBE',      glyph: '◇', description: 'Question — pattern interrupt' },
  directive:  { label: 'DIRECTIVE',  glyph: '▸', description: 'Guide — mechanical instruction' },
  reframe:    { label: 'REFRAME',    glyph: '↻', description: 'Proposition — cognitive pivot' },
  anecdote:   { label: 'ANECDOTE',   glyph: '∿', description: 'Companion — normalizing context' },
  resolution: { label: 'RESOLUTION', glyph: '●', description: 'State shift — biological period' },
};