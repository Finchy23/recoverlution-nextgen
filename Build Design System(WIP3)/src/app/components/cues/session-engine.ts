/**
 * SESSION ENGINE — The Clinical Intelligence
 *
 * Selects compositions based on what data the system needs.
 * Rotates the library so no session feels like data collection.
 * Tracks which capture modes have been gathered and which
 * compositions have been experienced, biasing toward variety.
 *
 * ═══════════════════════════════════════════════════════
 * THE ROTATION PRINCIPLE
 * ═══════════════════════════════════════════════════════
 *
 * The clinical engine has a need (e.g. "we have no voice data
 * for this person" or "we need a binary signal on their
 * relationship to stillness"). It asks the session engine:
 * "give me a composition that captures [mode] in [posture]."
 *
 * The session engine finds compositions that match, then
 * filters out recently experienced ones, biasing toward
 * the least-seen. If nothing matches, it falls back to
 * a PULSE (no capture, pure presence) and tries again next time.
 *
 * ═══════════════════════════════════════════════════════
 * NO PERSON EVER SEES THE ENGINE
 * ═══════════════════════════════════════════════════════
 *
 * To the person, each session is a rhythm.
 * A PULSE. Maybe a TWIN. Maybe a TRI.
 * The capture overlay appears or it doesn't.
 * They respond or they don't.
 * Both are signal.
 */

import type {
  Composition,
  CaptureMode,
  OverlayCaptureMode,
  CompositionType,
} from './composition-types';
import { getOverlayCaptures } from './composition-types';
import { ALL_COMPOSITIONS, getCompositionsByType } from './composition-library';
import type { CompositionSessionRecord } from './CompositionEngine';

// ═══════════════════════════════════════════════════════
// SESSION STATE — What we know about this person
// ═══════════════════════════════════════════════════════

export interface SessionProfile {
  /** Composition IDs the person has experienced (most recent first) */
  recentCompositions: string[];
  /** Capture modes we have data for, with count */
  captureHistory: Partial<Record<CaptureMode, number>>;
  /** Session count (total compositions completed) */
  sessionCount: number;
  /** How many sessions since last overlay capture */
  sessionsSinceCapture: number;
}

export function createEmptyProfile(): SessionProfile {
  return {
    recentCompositions: [],
    captureHistory: {},
    sessionCount: 0,
    sessionsSinceCapture: 0,
  };
}

// ═══════════════════════════════════════════════════════
// SELECTION — Pick the next composition
// ═══════════════════════════════════════════════════════

export interface SelectionCriteria {
  /** Preferred composition type. If null, engine chooses. */
  preferredType?: CompositionType;
  /** Preferred capture mode to gather. If null, engine assesses need. */
  preferredCapture?: OverlayCaptureMode;
  /** Maximum complexity (1=pulse, 2=twin, 3=tri, 4=arc) */
  maxComplexity?: number;
  /** Force a specific composition (bypass selection logic) */
  forceCompositionId?: string;
}

/** Complexity score per type */
const TYPE_COMPLEXITY: Record<CompositionType, number> = {
  pulse: 1,
  twin: 2,
  tri: 3,
  arc: 4,
};

/**
 * Select the next composition based on profile and criteria.
 *
 * The algorithm:
 * 1. If forced, return that composition.
 * 2. Filter by max complexity.
 * 3. If a capture mode is needed, filter to compositions that carry it.
 * 4. Remove recently experienced (last 3).
 * 5. Score remaining by freshness and capture relevance.
 * 6. Return the highest scored composition.
 * 7. If nothing matches, return a random PULSE.
 */
export function selectNextComposition(
  profile: SessionProfile,
  criteria: SelectionCriteria = {},
): Composition {
  // 1. Forced selection
  if (criteria.forceCompositionId) {
    const forced = ALL_COMPOSITIONS.find(c => c.id === criteria.forceCompositionId);
    if (forced) return forced;
  }

  // 2. Base pool
  let pool = [...ALL_COMPOSITIONS];

  // Filter by max complexity
  if (criteria.maxComplexity) {
    pool = pool.filter(c => TYPE_COMPLEXITY[c.type] <= criteria.maxComplexity!);
  }

  // Filter by preferred type
  if (criteria.preferredType) {
    const typed = pool.filter(c => c.type === criteria.preferredType);
    if (typed.length > 0) pool = typed;
  }

  // 3. Filter by capture mode need
  const neededCapture = criteria.preferredCapture ?? assessCaptureNeed(profile);
  if (neededCapture) {
    const withCapture = pool.filter(c => {
      const overlays = getOverlayCaptures(c);
      return overlays.some(b => b.capture === neededCapture);
    });
    if (withCapture.length > 0) pool = withCapture;
  }

  // 4. Remove recently experienced (last 3)
  const recentSet = new Set(profile.recentCompositions.slice(0, 3));
  const fresh = pool.filter(c => !recentSet.has(c.id));
  if (fresh.length > 0) pool = fresh;

  // 5. Score remaining
  const scored = pool.map(c => ({
    composition: c,
    score: scoreComposition(c, profile, neededCapture),
  }));

  scored.sort((a, b) => b.score - a.score);

  // 6. Return highest scored
  if (scored.length > 0) return scored[0].composition;

  // 7. Fallback: random pulse
  const pulses = getCompositionsByType('pulse');
  return pulses[Math.floor(Math.random() * pulses.length)];
}

/**
 * Assess which capture mode the system most needs data for.
 * Returns the least-captured overlay mode, or null if we have
 * enough data across all modes.
 */
function assessCaptureNeed(profile: SessionProfile): OverlayCaptureMode | null {
  const overlayModes: OverlayCaptureMode[] = ['binary', 'select', 'whisper', 'thought', 'voice'];

  // Find the mode with the fewest captures
  let minCount = Infinity;
  let needed: OverlayCaptureMode | null = null;

  for (const mode of overlayModes) {
    const count = profile.captureHistory[mode] ?? 0;
    if (count < minCount) {
      minCount = count;
      needed = mode;
    }
  }

  // If we have at least 2 of every mode, don't force a specific need
  if (minCount >= 2) return null;

  return needed;
}

/**
 * Score a composition based on:
 * - Freshness (not recently seen)
 * - Capture relevance (carries needed mode)
 * - Progressive complexity (early sessions = simpler)
 */
function scoreComposition(
  c: Composition,
  profile: SessionProfile,
  neededCapture: OverlayCaptureMode | null,
): number {
  let score = 0;

  // Freshness bonus — further from recent = higher score
  const recentIdx = profile.recentCompositions.indexOf(c.id);
  if (recentIdx === -1) score += 10; // never seen
  else score += Math.min(recentIdx, 5); // seen, but further back = better

  // Capture relevance
  if (neededCapture) {
    const overlays = getOverlayCaptures(c);
    if (overlays.some(b => b.capture === neededCapture)) score += 8;
  }

  // Progressive complexity: early sessions prefer simpler compositions
  const complexity = TYPE_COMPLEXITY[c.type];
  if (profile.sessionCount < 3) {
    // First 3 sessions: strongly prefer pulse/twin
    score += Math.max(0, 4 - complexity) * 3;
  } else if (profile.sessionCount < 8) {
    // Sessions 3-7: allow tri, still bias simpler
    score += Math.max(0, 4 - complexity);
  }
  // After 8 sessions: no complexity bias

  // Small random jitter to avoid perfect determinism
  score += Math.random() * 2;

  return score;
}

// ═══════════════════════════════════════════════════════
// PROFILE UPDATE — After a session completes
// ═══════════════════════════════════════════════════════

/**
 * Update the session profile after a composition completes.
 * Returns a new profile (immutable).
 */
export function updateProfile(
  profile: SessionProfile,
  record: CompositionSessionRecord,
): SessionProfile {
  const newRecent = [
    record.compositionId,
    ...profile.recentCompositions,
  ].slice(0, 10); // keep last 10

  const newHistory = { ...profile.captureHistory };
  let hadOverlayCapture = false;

  for (const capture of record.captures) {
    if (capture.mode === 'none') continue;
    const prev = newHistory[capture.mode] ?? 0;
    newHistory[capture.mode] = prev + 1;

    if (capture.mode !== 'gesture') {
      hadOverlayCapture = true;
    }
  }

  return {
    recentCompositions: newRecent,
    captureHistory: newHistory,
    sessionCount: profile.sessionCount + 1,
    sessionsSinceCapture: hadOverlayCapture ? 0 : profile.sessionsSinceCapture + 1,
  };
}

// ═══════════════════════════════════════════════════════
// SESSION FLOW — Suggested session structure
// ═══════════════════════════════════════════════════════

/**
 * Generate a suggested session flow: a sequence of compositions
 * that builds in complexity and distributes capture modes.
 *
 * A typical session might be:
 *   PULSE → TWIN (with binary) → TRI (with whisper)
 * or:
 *   PULSE → PULSE → TWIN (with select)
 *
 * The flow respects the person's history and the clinical need.
 */
export function generateSessionFlow(
  profile: SessionProfile,
  targetLength: number = 3,
): Composition[] {
  const flow: Composition[] = [];
  let workingProfile = { ...profile };

  for (let i = 0; i < targetLength; i++) {
    // Progressive complexity: start simple, build up
    const maxComplexity = i === 0 ? 2 : i === 1 ? 3 : 4;

    const composition = selectNextComposition(workingProfile, { maxComplexity });
    flow.push(composition);

    // Simulate the profile update for selection diversity
    workingProfile = {
      ...workingProfile,
      recentCompositions: [composition.id, ...workingProfile.recentCompositions],
      sessionCount: workingProfile.sessionCount + 1,
    };
  }

  return flow;
}