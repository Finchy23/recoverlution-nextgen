/**
 * ATOM CONTENT PROFILES
 * =====================
 * Instantiates an AtomContentProfile for every atom in the registry.
 * This is the bridge between atom metadata and the composition engine —
 * it tells the system "this atom needs these voice slots, this gesture,
 * these entrance/exit affinities" before any copy is written.
 *
 * Currently derived from static atom metadata. In production, these
 * will be persisted to Supabase and refinable per-atom.
 *
 * IMPORTS:
 *   - Atom registry (what atoms exist, their metadata)
 *   - NaviCue types (AtomContentProfile interface, gesture/entrance/exit IDs)
 *   - NaviCue data (vocal families for affinity matching)
 *
 * ZERO design tokens. ZERO React. Pure data derivation.
 */

import type {
  AtomContentProfile,
  AtomicVoiceSlot,
  GestureId,
  EntranceArchitectureId,
  ExitTransitionId,
  VocalFamilyId,
} from '@/navicue-types';

import type { AtomId, AtomMeta } from '@/app/components/atoms/types';
import { ATOM_CATALOG, ATOM_IDS } from '@/app/components/atoms';
import { VOCAL_FAMILIES, VOCAL_FAMILY_IDS } from '@/navicue-data';

// =====================================================================
// GESTURE DERIVATION
// =====================================================================

/**
 * Derive the primary gesture from atom interaction surfaces.
 * Priority: hold > drag > swipe > pinch > breathe > tap (default).
 */
function deriveGesture(meta: AtomMeta): GestureId {
  const s = meta.surfaces;
  if (s.includes('holdable')) return 'hold';
  if (s.includes('draggable') || s.includes('drawable')) return 'drag';
  if (s.includes('swipeable')) return 'swipe';
  if (s.includes('pinchable')) return 'pinch';
  if (s.includes('breathable') && s.includes('observable')) return 'breathe';
  if (s.includes('tappable')) return 'tap';
  return 'tap';
}

// =====================================================================
// VOICE SLOT DERIVATION
// =====================================================================

/**
 * Derive which of the 8 voice slots an atom uses, based on metadata.
 * Every atom gets anchorPrompt + metacognitiveTag at minimum.
 */
function deriveVoiceSlots(meta: AtomMeta): AtomicVoiceSlot[] {
  const slots: AtomicVoiceSlot[] = ['anchorPrompt', 'metacognitiveTag'];

  if (meta.hasResolution) {
    slots.push('kineticPayload', 'thresholdShift');
  }

  if (meta.continuous && meta.surfaces.includes('draggable')) {
    slots.push('reactiveFriction');
  } else if (!meta.continuous && meta.surfaces.includes('tappable')) {
    slots.push('progressiveSequence');
  }

  slots.push('ambientSubtext');

  if (meta.hasResolution && meta.surfaces.includes('draggable')) {
    slots.push('shadowNode');
  }

  return slots;
}

// =====================================================================
// MID-INTERACTION MODE
// =====================================================================

function deriveMidInteractionMode(
  voiceSlots: AtomicVoiceSlot[],
): 'friction' | 'sequence' | 'none' {
  if (voiceSlots.includes('reactiveFriction')) return 'friction';
  if (voiceSlots.includes('progressiveSequence')) return 'sequence';
  return 'none';
}

// =====================================================================
// ENTRANCE / EXIT AFFINITY
// =====================================================================

/**
 * Entrance affinity: derived from atom behavioral contract.
 * - breath-driven atoms → breath-gate, silence, gathering
 * - resolution atoms → emergence, scene-build, threshold
 * - continuous/ambient atoms → dissolution, silence
 * - interactive/discrete → cold-arrival, emergence
 */
function deriveEntranceAffinity(meta: AtomMeta): EntranceArchitectureId[] {
  const affinities: EntranceArchitectureId[] = [];

  if (meta.breathCoupling === 'drives') {
    affinities.push('the-breath-gate', 'the-silence', 'the-gathering');
  } else if (meta.breathCoupling === 'modulates') {
    affinities.push('the-dissolution', 'the-silence', 'the-emergence');
  }

  if (meta.hasResolution) {
    affinities.push('the-emergence', 'the-scene-build', 'the-threshold');
  }

  if (meta.continuous && !meta.hasResolution) {
    affinities.push('the-dissolution', 'the-silence');
  }

  if (!meta.continuous) {
    affinities.push('cold-arrival', 'the-emergence');
  }

  // Deduplicate while preserving order
  return [...new Set(affinities)];
}

/**
 * Exit affinity: derived from resolution and breath coupling.
 * - resolution atoms → burn-in (they resolve and lock)
 * - breath-driven → dissolve (breath out)
 * - continuous → dissolve or emerge
 * - discrete → immediate or burn-in
 */
function deriveExitAffinity(meta: AtomMeta): ExitTransitionId[] {
  const affinities: ExitTransitionId[] = [];

  if (meta.hasResolution) {
    affinities.push('burn-in');
  }

  if (meta.breathCoupling === 'drives') {
    affinities.push('dissolve');
  }

  if (meta.continuous) {
    affinities.push('dissolve', 'emerge');
  } else {
    affinities.push('immediate', 'burn-in');
  }

  return [...new Set(affinities)];
}

// =====================================================================
// VOCAL FAMILY AFFINITY
// =====================================================================

/**
 * Find vocal families whose gesture matches this atom's primary gesture.
 * Limited to 6 for UI sanity.
 */
function deriveVocalFamilyAffinity(gesture: GestureId): VocalFamilyId[] {
  return VOCAL_FAMILY_IDS
    .filter(fId => VOCAL_FAMILIES[fId].gesture === gesture)
    .slice(0, 6);
}

// =====================================================================
// PROFILE BUILDER
// =====================================================================

/**
 * Build a complete AtomContentProfile from atom metadata.
 */
export function buildAtomContentProfile(atomId: AtomId): AtomContentProfile {
  const meta = ATOM_CATALOG[atomId];
  const gesture = deriveGesture(meta);
  const voiceSlots = deriveVoiceSlots(meta);

  return {
    voiceSlots,
    midInteractionMode: deriveMidInteractionMode(voiceSlots),
    primaryGesture: gesture,
    entranceAffinity: deriveEntranceAffinity(meta),
    exitAffinity: deriveExitAffinity(meta),
    vocalFamilyAffinity: deriveVocalFamilyAffinity(gesture),
  };
}

// =====================================================================
// REGISTRY — precomputed for every atom
// =====================================================================

/**
 * Map of every AtomId → AtomContentProfile.
 * Computed once at module load. Used by:
 *   - DeliveryWorkspace (content mapping UI)
 *   - composition-engine.ts (runtime assembly)
 *   - Future Supabase sync (initial seed data)
 */
export const ATOM_CONTENT_PROFILES: Record<AtomId, AtomContentProfile> =
  Object.fromEntries(
    ATOM_IDS.map(id => [id, buildAtomContentProfile(id)]),
  ) as Record<AtomId, AtomContentProfile>;

// =====================================================================
// STATS (useful for workspace display)
// =====================================================================

export function getContentProfileStats() {
  const profiles = Object.values(ATOM_CONTENT_PROFILES);
  const totalSlots = profiles.reduce((sum, p) => sum + p.voiceSlots.length, 0);
  const frictionCount = profiles.filter(p => p.midInteractionMode === 'friction').length;
  const sequenceCount = profiles.filter(p => p.midInteractionMode === 'sequence').length;
  const gestureDistribution = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.primaryGesture] = (acc[p.primaryGesture] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalAtoms: profiles.length,
    totalSlots,
    avgSlotsPerAtom: +(totalSlots / profiles.length).toFixed(1),
    frictionCount,
    sequenceCount,
    noneCount: profiles.length - frictionCount - sequenceCount,
    gestureDistribution,
  };
}
