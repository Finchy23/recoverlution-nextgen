/**
 * ATOM COPY PROFILE
 * =================
 * Derives spatial layout, word budgets, font sizes, and CTA mode
 * from atom metadata. This is the bridge between the atom's physical
 * characteristics and the voice/copy system.
 *
 * Extracted from VoiceWorkspace so it can be imported by:
 *   - VoiceWorkspace (copy preview)
 *   - DeliveryWorkspace (content authoring)
 *   - Future Supabase content pipeline (NaviCue generation)
 *
 * RULE: This module imports ONLY from the atom registry and types.
 *       It does NOT import design tokens — it deals in abstract
 *       spatial semantics, not pixels or colors.
 */

import type { AtomId, AtomScale } from '@/app/components/atoms/types';
import { ATOM_CATALOG } from '@/app/components/atoms';
import { THROTTLE } from '@/navicue-types';

// =====================================================================
// TYPES
// =====================================================================

/** Where on the viewport the copy zone lives */
export type CopyZone = 'extreme-edge' | 'outer-band' | 'mid-band' | 'near-center';

/** How visually present the copy feels */
export type CopyWeight = 'whisper' | 'light' | 'moderate' | 'present';

/** How the scene exits / closes out */
export type CtaMode = 'in-atom' | 'atmospheric' | 'ambient-prompt';

/** The complete copy profile for an atom */
export interface AtomCopyProfile {
  /** Where the anchor prompt text lives */
  anchorZone: CopyZone;
  /** Where the kinetic payload text lives */
  kineticZone: CopyZone;
  /** How visually present copy feels for this atom */
  copyWeight: CopyWeight;
  /** Max font size (px) for anchor prompt */
  anchorMaxFont: number;
  /** Max font size (px) for kinetic payload */
  kineticMaxFont: number;
  /** How the scene exits */
  ctaMode: CtaMode;
  /** Whether breath amplitude modulates copy opacity/position */
  breathModulatesCopy: boolean;
  /** Max word count for anchor prompt */
  anchorWordBudget: number;
  /** Max word count for kinetic payload */
  kineticWordBudget: number;
  /** Human-readable spatial guidance for copy authoring */
  spatialHint: string;
  /** Human-readable CTA guidance */
  ctaHint: string;
}

// =====================================================================
// SCALE → COPY ZONE PROFILES
// =====================================================================

// Word budgets are clamped to THROTTLE ceilings (navicue-types.ts).
// THROTTLE.anchorPrompt.wordMax = 8, THROTTLE.kineticPayload.wordMax = 2.
// Spatial budgets must NEVER exceed these typographic constraints.
const AW = THROTTLE.anchorPrompt.wordMax;   // 8
const KW = THROTTLE.kineticPayload.wordMax; // 2

const SCALE_PROFILES: Record<AtomScale, Partial<AtomCopyProfile>> = {
  full: {
    anchorZone: 'extreme-edge', kineticZone: 'outer-band',
    copyWeight: 'whisper', anchorMaxFont: 11, kineticMaxFont: 14,
    anchorWordBudget: Math.min(6, AW), kineticWordBudget: Math.min(1, KW),
    spatialHint: 'Full viewport — copy at extreme edges, nearly invisible',
  },
  field: {
    anchorZone: 'outer-band', kineticZone: 'outer-band',
    copyWeight: 'light', anchorMaxFont: 12, kineticMaxFont: 15,
    anchorWordBudget: Math.min(7, AW), kineticWordBudget: Math.min(2, KW),
    spatialHint: 'Distributed field — copy in the gaps between elements',
  },
  focus: {
    anchorZone: 'mid-band', kineticZone: 'outer-band',
    copyWeight: 'moderate', anchorMaxFont: 13, kineticMaxFont: 17,
    anchorWordBudget: AW, kineticWordBudget: KW,
    spatialHint: 'Central focus — copy frames above and below',
  },
  element: {
    anchorZone: 'near-center', kineticZone: 'mid-band',
    copyWeight: 'present', anchorMaxFont: 14, kineticMaxFont: 19,
    anchorWordBudget: AW, kineticWordBudget: KW,
    spatialHint: 'Compact element — copy breathes alongside it',
  },
  point: {
    anchorZone: 'near-center', kineticZone: 'near-center',
    copyWeight: 'present', anchorMaxFont: 15, kineticMaxFont: 20,
    anchorWordBudget: AW, kineticWordBudget: KW,
    spatialHint: 'Signal point — copy has the most freedom',
  },
};

// =====================================================================
// DERIVATION FUNCTION
// =====================================================================

/**
 * Derives the complete copy profile for an atom from its metadata.
 * This is the core function that tells the copy system:
 *   - WHERE to place text (zones)
 *   - HOW MUCH text is allowed (word budgets)
 *   - HOW BIG the text can be (font limits)
 *   - HOW the scene closes out (CTA mode)
 *   - WHETHER breath modulates copy opacity
 */
export function getAtomCopyProfile(atomId: AtomId): AtomCopyProfile {
  const meta = ATOM_CATALOG[atomId];
  const scale = meta?.defaultScale ?? 'focus';
  const hasRes = meta?.hasResolution ?? false;
  const breathDrives = meta?.breathCoupling === 'drives';
  const breathMods = meta?.breathCoupling === 'modulates';
  const sp = SCALE_PROFILES[scale] ?? SCALE_PROFILES.focus;
  const ctaMode: CtaMode = hasRes ? 'in-atom' : breathDrives ? 'ambient-prompt' : 'atmospheric';
  const ctaHint = hasRes
    ? 'Atom resolves itself — the interaction IS the close-out'
    : breathDrives
      ? 'Breath-driven — CTA fades in as exhale prompt'
      : 'Continuous — atmospheric text CTA after dwell';
  return {
    anchorZone: sp.anchorZone ?? 'mid-band',
    kineticZone: sp.kineticZone ?? 'outer-band',
    copyWeight: sp.copyWeight ?? 'moderate',
    anchorMaxFont: sp.anchorMaxFont ?? 13,
    kineticMaxFont: sp.kineticMaxFont ?? 17,
    ctaMode,
    breathModulatesCopy: breathMods || breathDrives,
    anchorWordBudget: sp.anchorWordBudget ?? 12,
    kineticWordBudget: sp.kineticWordBudget ?? 4,
    spatialHint: sp.spatialHint ?? '',
    ctaHint,
  };
}

// =====================================================================
// DISPLAY HELPERS
// =====================================================================

/** Convert a CopyZone to a CSS top percentage for rendering */
export function zoneToTop(zone: CopyZone): string {
  return ({ 'extreme-edge': '8%', 'outer-band': '14%', 'mid-band': '18%', 'near-center': '22%' })[zone];
}

/** Get the opacity range for a CopyWeight (inactive vs active) */
export function weightOpacity(weight: CopyWeight, active: boolean): number {
  const map: Record<CopyWeight, [number, number]> = {
    whisper: [0.03, 0.35], light: [0.06, 0.45], moderate: [0.1, 0.55], present: [0.15, 0.6],
  };
  return active ? map[weight][1] : map[weight][0];
}
