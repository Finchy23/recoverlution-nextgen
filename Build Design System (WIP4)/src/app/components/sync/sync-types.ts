/**
 * SYNC TYPE SYSTEM
 *
 * The semantic payload architecture for the default canvas.
 * Six psychological copy types orchestrated across a 3-beat
 * sequence (Entrance → Friction → Release) layered on three
 * depth planes (Foreground / Midground / Background).
 *
 * These types define the contract between the content runtime
 * and the SyncComposer — the frontend orchestrator that marries
 * atom physics to typographic emergence.
 */

import { weight, font, tracking, leading, opacity as op } from '../design-system/surface-tokens';

// ═══════════════════════════════════════════════════
// THE SIX SEMANTIC CONTAINERS
// ═══════════════════════════════════════════════════

export type CopyType =
  | 'mirror'      // Observation — undeniable truth of the moment
  | 'probe'       // Question — surgical pattern-interrupt
  | 'directive'   // Guide — mechanical instruction for atom interaction
  | 'reframe'     // Proposition — cognitive pivot introduced mid-friction
  | 'anecdote'    // Companion — normalizing micro-context
  | 'resolution'; // State shift — the biological period

/** A single semantic copy payload */
export interface SyncPayload {
  type: CopyType;
  /** Primary text — the sentence itself */
  text: string;
  /** Optional secondary line (e.g., attribution, elaboration) */
  subtext?: string;
}

// ═══════════════════════════════════════════════════
// THE 3-BEAT COMPOSITION
// ═══════════════════════════════════════════════════

export type Beat = 'entrance' | 'friction' | 'release';

/** Full composition for one atom experience */
export interface SyncComposition {
  /** Which atom this composition targets */
  atomId: string;
  /** Atmospheric context — time of day, biological baseline */
  atmospheric?: string;
  /** Beat 1: The Setup — establish reality before asking for action */
  entrance: {
    primary: SyncPayload;    // MIRROR or PROBE
    anecdote?: SyncPayload;  // Optional normalizing context
  };
  /** Beat 2: The Interaction — marry physical effort with cognitive rewiring */
  friction: {
    directive: SyncPayload;  // How to interact with the atom
    reframe: SyncPayload;    // The cognitive pivot, emerges as tension builds
  };
  /** Beat 3: The Release — the biological exhale */
  release: {
    resolution: SyncPayload; // The state-shift text
  };
}

// ═══════════════════════════════════════════════════
// DEPTH SYSTEM
// ═══════════════════════════════════════════════════

export type DepthLayer = 'foreground' | 'midground' | 'background';

/** Depth plane visual properties */
export interface DepthConfig {
  blur: number;      // CSS blur in px
  opacity: number;   // Base opacity
  scale: number;     // Transform scale (depth illusion)
}

export const DEPTH_LAYERS: Record<DepthLayer, DepthConfig> = {
  foreground: { blur: 0,   opacity: op.full, scale: 1.0 },
  midground:  { blur: 1.5, opacity: op.voice, scale: 0.98 },
  background: { blur: 5,   opacity: op.murmur, scale: 0.95 },
};

// ═══════════════════════════════════════════════════
// BEAT TRANSITION TIMING
// ═══════════════════════════════════════════════════

/** How fast each beat transition unfolds (in seconds) */
export const BEAT_TIMING = {
  /** Entrance text fade-in duration */
  entranceFadeIn: 1.8,
  /** Entrance → Friction: how fast entrance text recedes */
  entranceRecede: 0.9,
  /** Directive lock-on speed */
  directiveAppear: 0.4,
  /** Reframe emergence speed (tied to atom progress) */
  reframeEmergence: 1.2,
  /** All text vanish on release */
  releaseVanish: 0.15,
  /** Resolution fade-in */
  resolutionAppear: 0.8,
  /** Resolution linger before dissolve */
  resolutionLinger: 3.0,
  /** Resolution dissolve */
  resolutionDissolve: 2.5,
};

// ═══════════════════════════════════════════════════
// TYPOGRAPHIC WEIGHTS PER COPY TYPE
// ═══════════════════════════════════════════════════

export interface TypoConfig {
  fontFamily: string;
  fontSize: string;        // CSS value
  fontWeight: number;
  letterSpacing: string;   // CSS value
  lineHeight: number;
  textTransform?: string;
  fontStyle?: string;
  /** Where on the viewport this type naturally gravitates */
  anchor: 'center' | 'upper-third' | 'lower-third' | 'touch-locked';
  /** Maximum width as fraction of viewport */
  maxWidthFrac: number;
}

const SERIF = font.serif;
const SANS = font.sans;

export const TYPO_CONFIG: Record<CopyType, TypoConfig> = {
  mirror: {
    fontFamily: SERIF,
    fontSize: 'clamp(18px, 4.5vw, 28px)',
    fontWeight: weight.regular,
    letterSpacing: tracking.tight_neg,
    lineHeight: leading.firm,
    anchor: 'upper-third',
    maxWidthFrac: 0.72,
  },
  probe: {
    fontFamily: SERIF,
    fontSize: 'clamp(20px, 5vw, 32px)',
    fontWeight: weight.light,
    letterSpacing: tracking.body,
    lineHeight: leading.body,
    fontStyle: 'italic',
    anchor: 'center',
    maxWidthFrac: 0.65,
  },
  directive: {
    fontFamily: SANS,
    fontSize: 'clamp(10px, 2.2vw, 13px)',
    fontWeight: weight.medium,
    letterSpacing: tracking.spread,
    lineHeight: leading.compact,
    textTransform: 'uppercase',
    anchor: 'touch-locked',
    maxWidthFrac: 0.55,
  },
  reframe: {
    fontFamily: SERIF,
    fontSize: 'clamp(16px, 4vw, 24px)',
    fontWeight: weight.light,
    letterSpacing: tracking.none,
    lineHeight: leading.natural,
    anchor: 'center',
    maxWidthFrac: 0.7,
  },
  anecdote: {
    fontFamily: SERIF,
    fontSize: 'clamp(11px, 2.8vw, 14px)',
    fontWeight: weight.light,
    letterSpacing: tracking.hair,
    lineHeight: leading.relaxed,
    fontStyle: 'italic',
    anchor: 'lower-third',
    maxWidthFrac: 0.6,
  },
  resolution: {
    fontFamily: SERIF,
    fontSize: 'clamp(22px, 6vw, 38px)',
    fontWeight: weight.light,
    letterSpacing: tracking.data,
    lineHeight: leading.settled,
    anchor: 'center',
    maxWidthFrac: 0.8,
  },
};