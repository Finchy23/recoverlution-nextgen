/**
 * NAVICUE REGISTRY -- Move 1: The Map
 * ====================================
 *
 * The satellite view of all 1,000 NaviCue specimens.
 *
 * This file is the SINGLE queryable index for:
 *   - What do we have? (specimen enumeration)
 *   - Where is it? (5D coordinates: signature, mechanism, kbe, form, series)
 *   - What generation? (Gen 1/2/3 structural classification)
 *   - What traits? (Shell, quickstart, seriesThemes, new primitives)
 *   - What color authority? (tokens_direct, palette_only, palette_plus_theme, full_stack)
 *
 * ARCHITECTURE:
 *   - Imports series-level data from atlas-series-metadata.ts
 *   - Adds generation classification, structural traits, color authority
 *   - Enumerates all 1,000 specimens (50 Foundation + 950 Lab)
 *   - Exports query functions for the Command Center and routing engine
 *
 * DOES NOT:
 *   - Import from MasterRenderer (no circular dependency)
 *   - Modify any implementation file
 *   - Duplicate runtime rendering logic
 *
 * GENERATIONS:
 *   Gen 1 (33 files):  Clinical Integrations. No NaviCueShell. Imports design-tokens
 *                      directly. Props: { primary_prompt, cta_primary, onComplete }.
 *                      Foundation bespoke files + 1 Novice outlier.
 *
 *   Gen 2 (316 files): Foundation Series. NaviCueShell + navicueQuickstart + palette.
 *                      Single color authority. Clean, self-contained.
 *                      Series 6-34 (minus 1 outlier) + Ouroboros (100) + Foundation Gen 2.
 *
 *   Gen 3 (651 files): Extended Series. Full Gen 2 pattern PLUS seriesThemes as
 *                      secondary color authority via themeColor(TH.accentHSL, alpha, offset).
 *                      Dual color system. Series 35-99 + MysticSeal outlier.
 *
 *   Reference (1 file): Mystic_TranscendenceSeal. The canonical template.
 *                       Uses the complete new stack: quickstart + composeMechanics +
 *                       useBreathEngine + useTextMaterializer + useReceiptCeremony +
 *                       useNaviCueStages. Single color authority. Tagged as Gen 3
 *                       by series placement (S92) but structurally pioneering.
 *
 * TOTAL: 33 + 316 + 651 = 1,000
 */

import { ALL_SERIES, type SeriesMeta } from './atlas-series-metadata';
import {
  SERIES_REGISTRY,
  type SeriesRegistryEntry,
  getSeriesRegistryEntry,
  registryThemeColor,
  registryFlashColor,
  navicueQuickstart,
  getSeriesAtmosphere,
  type MagicSignatureKey,
  type NaviCueForm,
} from '@/app/design-system/navicue-blueprint';

// Re-export the canonical color authority functions so consumers
// can import from the registry instead of the blueprint directly.
export {
  SERIES_REGISTRY,
  type SeriesRegistryEntry,
  getSeriesRegistryEntry,
  registryThemeColor,
  registryFlashColor,
};

// =====================================================================
// TYPES
// =====================================================================

export type Generation = 1 | 2 | 3;

export type ColorAuthority =
  | 'tokens_direct'        // Gen 1: imports from design-tokens directly
  | 'palette_only'         // Gen 2: navicueQuickstart palette
  | 'palette_plus_theme'   // Gen 3: palette + seriesThemes dual system
  | 'full_stack';          // Reference: palette + composeMechanics + new primitives

export interface StructuralTraits {
  /** Uses NaviCueShell container */
  usesNaviCueShell: boolean;
  /** Uses navicueQuickstart() for palette/atmosphere/motion */
  usesQuickstart: boolean;
  /** Imports from seriesThemes.tsx (dual color authority) */
  usesSeriesThemes: boolean;
  /** Uses composeMechanics() from navicue-mechanics.ts */
  usesComposeMechanics: boolean;
  /** Uses new primitives: useBreathEngine, useTextMaterializer, useReceiptCeremony */
  usesNewPrimitives: boolean;
  /** Uses useNaviCueStages for lifecycle management */
  usesNaviCueStages: boolean;
}

/** Trait profile per generation */
const GEN_TRAITS: Record<Generation, StructuralTraits> = {
  1: {
    usesNaviCueShell: false,
    usesQuickstart: false,
    usesSeriesThemes: false,
    usesComposeMechanics: false,
    usesNewPrimitives: false,
    usesNaviCueStages: false,
  },
  2: {
    usesNaviCueShell: true,
    usesQuickstart: true,
    usesSeriesThemes: false,
    usesComposeMechanics: false,
    usesNewPrimitives: false,
    usesNaviCueStages: false,
  },
  3: {
    usesNaviCueShell: true,
    usesQuickstart: true,
    usesSeriesThemes: true,
    usesComposeMechanics: false,
    usesNewPrimitives: false,
    usesNaviCueStages: false,
  },
};

/** The reference specimen's traits (TranscendenceSeal) */
const REFERENCE_TRAITS: StructuralTraits = {
  usesNaviCueShell: true,
  usesQuickstart: true,
  usesSeriesThemes: false,
  usesComposeMechanics: true,
  usesNewPrimitives: true,
  usesNaviCueStages: true,
};

// =====================================================================
// SERIES CLASSIFICATION
// =====================================================================

/**
 * Extended series metadata with generation classification.
 * Extends the atlas SeriesMeta with registry-specific data.
 */
export interface SeriesClassification {
  /** Series number from atlas metadata */
  seriesNumber: number;
  /** Dominant generation of files in this series */
  generation: Generation;
  /** Color authority used by this series */
  colorAuthority: ColorAuthority;
  /** Structural traits (applies to most/all specimens in series) */
  traits: StructuralTraits;
  /** Number of Gen 1 outliers within this series (0 for most) */
  gen1Outliers: number;
  /** Number of Gen 3 outliers within a Gen 2 series (0 for most) */
  gen3Outliers: number;
  /** Whether this series contains the reference specimen */
  hasReferenceSpecimen: boolean;
}

/**
 * Gen 3 series numbers: S35-S99 (continuous range).
 * These are the Extended Series that use seriesThemes (dual color authority).
 *
 * Notable: S33 (base Mystic) is Gen 2 but MysticSeal is a Gen 3 outlier.
 *          S100 (Ouroboros) is Gen 2 despite being the last series.
 */
const GEN3_RANGE_START = 35;
const GEN3_RANGE_END = 99;

/**
 * Classify a series by its series number.
 * Foundation series (century 0) are special-cased.
 */
export function classifySeries(meta: SeriesMeta): SeriesClassification {
  const { seriesNumber, century } = meta;

  // Foundation series (century 0): mix of Gen 1 and Gen 2
  if (century === 0) {
    return {
      seriesNumber,
      generation: 1,   // dominant for Foundation: most files are Gen 1
      colorAuthority: 'tokens_direct',
      traits: GEN_TRAITS[1],
      gen1Outliers: 0,  // Gen 1 IS the dominant here
      gen3Outliers: 0,
      hasReferenceSpecimen: false,
    };
  }

  // Gen 3: S35-S99
  if (seriesNumber >= GEN3_RANGE_START && seriesNumber <= GEN3_RANGE_END) {
    // S92 (Mystic Transcendence) contains the reference specimen
    const isTranscendence = seriesNumber === 92;
    return {
      seriesNumber,
      generation: 3,
      colorAuthority: 'palette_plus_theme',
      traits: GEN_TRAITS[3],
      gen1Outliers: 0,
      gen3Outliers: 0,
      hasReferenceSpecimen: isTranscendence,
    };
  }

  // Gen 2: S6-S34, S100
  // S6 (Novice) has 1 Gen 1 outlier (PatternGlitch)
  // S33 (base Mystic) has 1 Gen 3 outlier (MysticSeal)
  return {
    seriesNumber,
    generation: 2,
    colorAuthority: 'palette_only',
    traits: GEN_TRAITS[2],
    gen1Outliers: seriesNumber === 6 ? 1 : 0,   // Novice_PatternGlitch
    gen3Outliers: seriesNumber === 33 ? 1 : 0,   // Mystic_MysticSeal
    hasReferenceSpecimen: false,
  };
}

/** Cached classification for all series */
export const SERIES_CLASSIFICATIONS: SeriesClassification[] =
  ALL_SERIES.map(classifySeries);

/** Lookup classification by series number */
const _classificationIndex = new Map<number, SeriesClassification>();
SERIES_CLASSIFICATIONS.forEach(c => _classificationIndex.set(c.seriesNumber, c));

export function getSeriesClassification(seriesNumber: number): SeriesClassification | undefined {
  return _classificationIndex.get(seriesNumber);
}

// =====================================================================
// SPECIMEN ENTRIES
// =====================================================================

/**
 * A single specimen in the registry.
 */
export interface SpecimenEntry {
  /** Component name (e.g., 'Novice_PatternGlitch') */
  componentName: string;
  /** File name without extension (same as componentName for lab specimens) */
  fileName: string;
  /** typeId for routing (e.g., 'lab__novice__pattern_glitch') */
  typeId: string;
  /** Series slug (e.g., 'novice') for lab; form name for foundation */
  seriesSlug: string;
  /** Specimen slug (e.g., 'pattern_glitch') */
  specimenSlug: string;
  /** Position within series (1-indexed) */
  position: number;
  /** Generation (may differ from series dominant if outlier) */
  generation: Generation;
  /** Whether this is the reference specimen */
  isReference: boolean;
}

// =====================================================================
// FOUNDATION SPECIMENS (50 entries)
// =====================================================================

/**
 * Foundation bespoke specimens.
 * Routed by form+mechanism+kbe key (buildKey), not typeId.
 *
 * These are the clinical integration forms:
 *   Mirror (9), Practice (8), Probe (7), Key (7),
 *   PartsRollcall (7), InventorySpark (7),
 *   Identity Koans (5: Exposure, Metacognition, SelfCompassion x2, ValuesClarification)
 */
export interface FoundationSpecimen {
  componentName: string;
  fileName: string;
  form: string;
  mechanism: string;
  kbe: 'B' | 'E';
  generation: Generation;
  /** True if this is an Identity Koan variant */
  isIdentityKoan: boolean;
}

/**
 * Gen 1 specimen file names (no NaviCueShell).
 * Used to classify Foundation specimens.
 */
const GEN1_FILES = new Set([
  'Mirror_Integrate_BehavioralActivation_B',
  'Mirror_Integrate_Exposure_B',
  'Mirror_Integrate_Metacognition_B',
  'Mirror_Integrate_SelfCompassion_B',
  'Mirror_Integrate_SelfCompassion_E',
  'Mirror_Integrate_ValuesClarification_B',
  'Mirror_Integrate_ValuesClarification_E',
  'Practice_Integrate_BehavioralActivation_B',
  'Practice_Integrate_BehavioralActivation_E',
  'Practice_Integrate_Exposure_E',
  'Practice_Integrate_Metacognition_E',
  'Practice_Integrate_SelfCompassion_E',
  'Practice_Integrate_ValuesClarification_E',
  'Probe_Integrate_BehavioralActivation_E',
  'Probe_Integrate_Exposure_B',
  'Probe_Integrate_Exposure_E',
  'Probe_Integrate_Metacognition_E',
  'Probe_Integrate_SelfCompassion_B',
  'Probe_Integrate_ValuesClarification_B',
  'PartsRollcall_Integrate_BehavioralActivation_E',
  'PartsRollcall_Integrate_Metacognition_E',
  'PartsRollcall_Integrate_SelfCompassion_B',
  'PartsRollcall_Integrate_SelfCompassion_E',
  'PartsRollcall_Integrate_ValuesClarification_E',
  'InventorySpark_Integrate_Metacognition_E',
  'InventorySpark_Integrate_SelfCompassion_B',
  'InventorySpark_Integrate_SelfCompassion_E',
  'InventorySpark_Integrate_ValuesClarification_B',
  'Metacognition_IdentityKoan_Integrate_E',
  'SelfCompassion_IdentityKoan_Integrate_B',
  'SelfCompassion_IdentityKoan_Integrate_E',
  'ValuesClarification_IdentityKoan_Integrate_B',
  // Plus 1 Novice outlier (tracked separately)
]);

/** The lone Gen 1 outlier in a numbered series */
const GEN1_NOVICE_OUTLIER = 'Novice_PatternGlitch';

export const FOUNDATION_SPECIMENS: FoundationSpecimen[] = [
  // ── Mirror (9) ──
  { componentName: 'Mirror_Integrate_BehavioralActivation_B', fileName: 'Mirror_Integrate_BehavioralActivation_B', form: 'Mirror', mechanism: 'Behavioral Activation', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_BehavioralActivation_E', fileName: 'Mirror_Integrate_BehavioralActivation_E', form: 'Mirror', mechanism: 'Behavioral Activation', kbe: 'E', generation: 2, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_Exposure_B', fileName: 'Mirror_Integrate_Exposure_B', form: 'Mirror', mechanism: 'Exposure', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_Exposure_E', fileName: 'Mirror_Integrate_Exposure_E', form: 'Mirror', mechanism: 'Exposure', kbe: 'E', generation: 2, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_Metacognition_B', fileName: 'Mirror_Integrate_Metacognition_B', form: 'Mirror', mechanism: 'Metacognition', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_SelfCompassion_B', fileName: 'Mirror_Integrate_SelfCompassion_B', form: 'Mirror', mechanism: 'Self-Compassion', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_SelfCompassion_E', fileName: 'Mirror_Integrate_SelfCompassion_E', form: 'Mirror', mechanism: 'Self-Compassion', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_ValuesClarification_B', fileName: 'Mirror_Integrate_ValuesClarification_B', form: 'Mirror', mechanism: 'Values Clarification', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Mirror_Integrate_ValuesClarification_E', fileName: 'Mirror_Integrate_ValuesClarification_E', form: 'Mirror', mechanism: 'Values Clarification', kbe: 'E', generation: 1, isIdentityKoan: false },

  // ── Practice (8) ──
  { componentName: 'Practice_Integrate_BehavioralActivation_B', fileName: 'Practice_Integrate_BehavioralActivation_B', form: 'Practice', mechanism: 'Behavioral Activation', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Practice_Integrate_BehavioralActivation_E', fileName: 'Practice_Integrate_BehavioralActivation_E', form: 'Practice', mechanism: 'Behavioral Activation', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Practice_Integrate_Exposure_E', fileName: 'Practice_Integrate_Exposure_E', form: 'Practice', mechanism: 'Exposure', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Practice_Integrate_Metacognition_B', fileName: 'Practice_Integrate_Metacognition_B', form: 'Practice', mechanism: 'Metacognition', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'Practice_Integrate_Metacognition_E', fileName: 'Practice_Integrate_Metacognition_E', form: 'Practice', mechanism: 'Metacognition', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Practice_Integrate_SelfCompassion_B', fileName: 'Practice_Integrate_SelfCompassion_B', form: 'Practice', mechanism: 'Self-Compassion', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'Practice_Integrate_SelfCompassion_E', fileName: 'Practice_Integrate_SelfCompassion_E', form: 'Practice', mechanism: 'Self-Compassion', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Practice_Integrate_ValuesClarification_E', fileName: 'Practice_Integrate_ValuesClarification_E', form: 'Practice', mechanism: 'Values Clarification', kbe: 'E', generation: 1, isIdentityKoan: false },

  // ── Probe (7) ──
  { componentName: 'Probe_Integrate_BehavioralActivation_B', fileName: 'Probe_Integrate_BehavioralActivation_B', form: 'Probe', mechanism: 'Behavioral Activation', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'Probe_Integrate_BehavioralActivation_E', fileName: 'Probe_Integrate_BehavioralActivation_E', form: 'Probe', mechanism: 'Behavioral Activation', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Probe_Integrate_Exposure_B', fileName: 'Probe_Integrate_Exposure_B', form: 'Probe', mechanism: 'Exposure', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Probe_Integrate_Exposure_E', fileName: 'Probe_Integrate_Exposure_E', form: 'Probe', mechanism: 'Exposure', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Probe_Integrate_Metacognition_E', fileName: 'Probe_Integrate_Metacognition_E', form: 'Probe', mechanism: 'Metacognition', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'Probe_Integrate_SelfCompassion_B', fileName: 'Probe_Integrate_SelfCompassion_B', form: 'Probe', mechanism: 'Self-Compassion', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'Probe_Integrate_ValuesClarification_B', fileName: 'Probe_Integrate_ValuesClarification_B', form: 'Probe', mechanism: 'Values Clarification', kbe: 'B', generation: 1, isIdentityKoan: false },

  // ── Key (7) ──
  { componentName: 'Key_Integrate_BehavioralActivation_B', fileName: 'Key_Integrate_BehavioralActivation_B', form: 'Key', mechanism: 'Behavioral Activation', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'Key_Integrate_BehavioralActivation_E', fileName: 'Key_Integrate_BehavioralActivation_E', form: 'Key', mechanism: 'Behavioral Activation', kbe: 'E', generation: 2, isIdentityKoan: false },
  { componentName: 'Key_Integrate_Exposure_E', fileName: 'Key_Integrate_Exposure_E', form: 'Key', mechanism: 'Exposure', kbe: 'E', generation: 2, isIdentityKoan: false },
  { componentName: 'Key_Integrate_Metacognition_B', fileName: 'Key_Integrate_Metacognition_B', form: 'Key', mechanism: 'Metacognition', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'Key_Integrate_Metacognition_E', fileName: 'Key_Integrate_Metacognition_E', form: 'Key', mechanism: 'Metacognition', kbe: 'E', generation: 2, isIdentityKoan: false },
  { componentName: 'Key_Integrate_SelfCompassion_B', fileName: 'Key_Integrate_SelfCompassion_B', form: 'Key', mechanism: 'Self-Compassion', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'Key_Integrate_ValuesClarification_E', fileName: 'Key_Integrate_ValuesClarification_E', form: 'Key', mechanism: 'Values Clarification', kbe: 'E', generation: 2, isIdentityKoan: false },

  // ── PartsRollcall (7) ──
  { componentName: 'PartsRollcall_Integrate_BehavioralActivation_E', fileName: 'PartsRollcall_Integrate_BehavioralActivation_E', form: 'Parts Rollcall', mechanism: 'Behavioral Activation', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'PartsRollcall_Integrate_Exposure_B', fileName: 'PartsRollcall_Integrate_Exposure_B', form: 'Parts Rollcall', mechanism: 'Exposure', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'PartsRollcall_Integrate_Metacognition_B', fileName: 'PartsRollcall_Integrate_Metacognition_B', form: 'Parts Rollcall', mechanism: 'Metacognition', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'PartsRollcall_Integrate_Metacognition_E', fileName: 'PartsRollcall_Integrate_Metacognition_E', form: 'Parts Rollcall', mechanism: 'Metacognition', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'PartsRollcall_Integrate_SelfCompassion_B', fileName: 'PartsRollcall_Integrate_SelfCompassion_B', form: 'Parts Rollcall', mechanism: 'Self-Compassion', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'PartsRollcall_Integrate_SelfCompassion_E', fileName: 'PartsRollcall_Integrate_SelfCompassion_E', form: 'Parts Rollcall', mechanism: 'Self-Compassion', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'PartsRollcall_Integrate_ValuesClarification_E', fileName: 'PartsRollcall_Integrate_ValuesClarification_E', form: 'Parts Rollcall', mechanism: 'Values Clarification', kbe: 'E', generation: 1, isIdentityKoan: false },

  // ── InventorySpark (7) ──
  { componentName: 'InventorySpark_Integrate_BehavioralActivation_B', fileName: 'InventorySpark_Integrate_BehavioralActivation_B', form: 'Inventory Spark', mechanism: 'Behavioral Activation', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'InventorySpark_Integrate_Exposure_B', fileName: 'InventorySpark_Integrate_Exposure_B', form: 'Inventory Spark', mechanism: 'Exposure', kbe: 'B', generation: 2, isIdentityKoan: false },
  { componentName: 'InventorySpark_Integrate_Exposure_E', fileName: 'InventorySpark_Integrate_Exposure_E', form: 'Inventory Spark', mechanism: 'Exposure', kbe: 'E', generation: 2, isIdentityKoan: false },
  { componentName: 'InventorySpark_Integrate_Metacognition_E', fileName: 'InventorySpark_Integrate_Metacognition_E', form: 'Inventory Spark', mechanism: 'Metacognition', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'InventorySpark_Integrate_SelfCompassion_B', fileName: 'InventorySpark_Integrate_SelfCompassion_B', form: 'Inventory Spark', mechanism: 'Self-Compassion', kbe: 'B', generation: 1, isIdentityKoan: false },
  { componentName: 'InventorySpark_Integrate_SelfCompassion_E', fileName: 'InventorySpark_Integrate_SelfCompassion_E', form: 'Inventory Spark', mechanism: 'Self-Compassion', kbe: 'E', generation: 1, isIdentityKoan: false },
  { componentName: 'InventorySpark_Integrate_ValuesClarification_B', fileName: 'InventorySpark_Integrate_ValuesClarification_B', form: 'Inventory Spark', mechanism: 'Values Clarification', kbe: 'B', generation: 1, isIdentityKoan: false },

  // ── Identity Koans (5) ──
  { componentName: 'Exposure_IdentityKoan_Integrate_B', fileName: 'Exposure_IdentityKoan_Integrate_B', form: 'Identity Koan', mechanism: 'Exposure', kbe: 'B', generation: 2, isIdentityKoan: true },
  { componentName: 'Metacognition_IdentityKoan_Integrate_E', fileName: 'Metacognition_IdentityKoan_Integrate_E', form: 'Identity Koan', mechanism: 'Metacognition', kbe: 'E', generation: 1, isIdentityKoan: true },
  { componentName: 'SelfCompassion_IdentityKoan_Integrate_B', fileName: 'SelfCompassion_IdentityKoan_Integrate_B', form: 'Identity Koan', mechanism: 'Self-Compassion', kbe: 'B', generation: 1, isIdentityKoan: true },
  { componentName: 'SelfCompassion_IdentityKoan_Integrate_E', fileName: 'SelfCompassion_IdentityKoan_Integrate_E', form: 'Identity Koan', mechanism: 'Self-Compassion', kbe: 'E', generation: 1, isIdentityKoan: true },
  { componentName: 'ValuesClarification_IdentityKoan_Integrate_B', fileName: 'ValuesClarification_IdentityKoan_Integrate_B', form: 'Identity Koan', mechanism: 'Values Clarification', kbe: 'B', generation: 1, isIdentityKoan: true },
];

// =====================================================================
// LAB SPECIMENS (950 entries, organized by series slug)
// =====================================================================

/**
 * Lab specimen index: maps series slug to specimen slugs.
 *
 * From this, you can derive:
 *   typeId:         `lab__${seriesSlug}__${specimenSlug}`
 *   componentName:  Derived from prefix + PascalCase(specimenSlug)
 *   fileName:       Same as componentName + '.tsx'
 *
 * Series slugs match the middle segment of typeIds (e.g., 'novice', 'alchemist').
 * Specimen slugs match the final segment (e.g., 'pattern_glitch', 'craving_surf').
 *
 * Entries are ordered by atlas series number.
 * Within each series, specimens are in their canonical order (1-10).
 */
export const LAB_SPECIMENS: Record<string, string[]> = {
  // ── 1st Century: Acts 0-9 (Series 6-15) ────────────────────

  novice: [
    'pattern_glitch', 'somatic_sigh', 'witness_window', 'permission_slip',
    'paradox_key', 'reality_anchor', 'micro_proof', 'value_compass',
    'future_simulation', 'connection_thread',
  ],
  alchemist: [
    'craving_surf', 'story_edit', 'time_telescope', 'shadow_hug',
    'meaning_mine', 'energy_transmute', 'council_of_elders', 'fact_checker',
    'gratitude_sniper', 'identity_vote',
  ],
  architect: [
    'boundary_brick', 'connection_bridge', 'micro_yes', 'environment_sweep',
    'mirror_gaze', 'friction_remover', 'value_stake', 'vulnerability_drop',
    'generosity_loop', 'identity_seal',
  ],
  navigator: [
    'tempo_dial', 'friction_converter', 'intuition_ping', 'repair_stitch',
    'drift_correction', 'spotlight_shift', 'doubt_detox', 'joy_snap',
    'values_jam', 'flow_trigger',
  ],
  sage: [
    'ego_zoom', 'generational_lens', 'empty_boat', 'silence_soak',
    'compassion_core', 'mortality_check', 'ripple_watch', 'universal_breath',
    'love_broadcast', 'legacy_stamp',
    // Sage Wisdom expansion (S90) shares the 'sage' slug
    'beginners_mind', 'empty_cup', 'impermanence', 'middle_way',
    'mirror_of_projection', 'observer_seat', 'paradox_holder', 'sage_seal',
    'silent_answer', 'wu_wei',
  ],
  mender: [
    'kintsugi_file', 'shame_scrum', 'data_harvest', 'forgiveness_loop',
    'reset_button', 'vulnerability_vow', 'dust_off', 'guardrail_build',
    'body_scan_damage', 're_commitment',
  ],
  diplomat: [
    'boundary_dance', 'common_ground', 'de_escalation', 'empathy_bridge',
    'mirror_shield', 'peace_thread', 'perspective_swap', 'sangha_search',
    'translator', 'truce_table',
  ],
  weaver: [
    'bridge_of_opposites', 'complexity_breath', 'contradiction_hold',
    'integration_spiral', 'meaning_weave', 'pattern_break', 'story_loom',
    'tapestry_seal', 'thread_map', 'witness_weave',
  ],
  visionary: [
    'becoming_seal', 'courage_map', 'dream_audit', 'fear_telescope',
    'horizon_scan', 'obstacle_flip', 'possibility_prism', 'seed_vault',
    'time_capsule', 'vision_board',
  ],
  luminary: [
    'constellation_seal', 'dark_light', 'generosity_engine', 'gratitude_broadcast',
    'legacy_letter', 'mentor_mirror', 'purpose_pulse', 'ripple_seed',
    'service_compass', 'torch_pass',
  ],

  // ── 2nd Century: Acts 10-19 (Series 16-25) ─────────────────

  hacker: [
    'algorithm_jammer', 'attention_paywall', 'label_peeler', 'mimetic_check',
    'role_reject', 'script_burn', 'should_deleter', 'source_code',
    'status_glitch', 'sunk_cost_cut',
  ],
  chrononaut: [
    'ancestral_blink', 'deep_time', 'eternal_instant', 'future_visitor',
    'loop_spotter', 'memory_remix', 'patience_muscle', 'regret_reversal',
    'slow_motion_day', 'urgency_deleter',
  ],
  mycelium: [
    'common_ground', 'dunbar_sorter', 'hive_mind', 'invisible_thread',
    'mirror_neuron', 'mycelial_map', 'root_share', 'signal_pulse',
    'symbiosis_check', 'wide_net',
  ],
  aesthete: [
    'color_soak', 'design_edit', 'golden_ratio', 'light_sculpt',
    'masterpiece_frame', 'negative_space', 'sound_bath', 'taste_savor',
    'texture_touch', 'wabi_sabi',
  ],
  elemental: [
    'elementalist_seal', 'fire_gaze', 'ice_shock', 'river_flow',
    'root_drop', 'salt_cleanse', 'stone_hold', 'thunder_gap',
    'water_float', 'wind_shear',
  ],
  phenomenologist: [
    'audio_zoom', 'blind_walk', 'color_deconstruct', 'micro_texture',
    'olfactory_hunt', 'perception_seal', 'proprioception_check', 'raw_data',
    'taste_explode', 'temperature_scan',
  ],
  alchemistii: [
    'alchemy_seal', 'anger_forge', 'anxiety_anchor', 'boredom_portal',
    'envy_map', 'fear_fuel', 'grief_garden', 'regret_compost',
    'rejection_ricochet', 'shame_solvent',
  ],
  servantleader: [
    'conflict_dissolve', 'ego_check', 'leader_seal', 'power_transfer',
    'praise_laser', 'quiet_mentor', 'responsibility_take', 'servant_bow',
    'silence_of_command', 'vision_cast',
  ],
  omegapoint: [
    'binary_breaker', 'convergence_seal', 'dot_connector', 'fourth_wall',
    'omega_pulse', 'paradox_hold', 'pattern_match', 'return_to_zero',
    'synthesis', 'system_view',
  ],
  source: [
    'awakening', 'final_breath', 'i_am', 'infinite_loop',
    'light_body', 'source_seal', 'stardust_check', 'unity',
    'universal_hum', 'void',
  ],

  // ── 3rd Century: Acts 20-29 (Series 26-35) ─────────────────

  stoic: [
    'amor_fati', 'citadel_visualization', 'control_dichotomy', 'inner_citadel',
    'memento_mori', 'negative_visualization', 'obstacle_flip', 'stoic_seal',
    'view_from_above', 'voluntary_discomfort',
  ],
  lover: [
    '30_second_gaze', 'armor_drop', 'desire_audit', 'jealousy_transmute',
    'listening_ear', 'partner_breath', 'sacred_touch', 'secret_share',
    'sex_spirit_bridge', 'union_seal',
  ],
  athlete: [
    'cold_shock', 'fascia_release', 'fuel_check', 'heart_coherence',
    'movement_snack', 'oxygen_flood', 'pain_cave', 'posture_reset',
    'sleep_gate', 'vitality_seal',
  ],
  strategist: [
    'abundance_scan', 'compound_interest', 'deep_work_bunker', 'essentialism_filter',
    'leverage_lever', 'negotiation_pause', 'permissionless_build', 'specific_knowledge',
    'value_exchange', 'wealth_seal',
  ],
  wilding: [
    'barefoot_step', 'cold_switch', 'dark_anchor', 'feral_howl',
    'fire_watch', 'lunar_pull', 'panoramic_soften', 'storm_breathe',
    'terpene_inhale', 'wild_seal',
  ],
  guardian: [
    'bedtime_blessing', 'big_feeling', 'boundary_hug', 'co_regulation_breath',
    'gentle_no', 'good_enough', 'guardian_seal', 'repair_ritual',
    'safe_container', 'transition_buffer',
  ],
  futurist: [
    'analog_switch', 'comparison_blocker', 'deep_read', 'disconnect_seal',
    'doomscroll_brake', 'human_handshake', 'input_diet', 'mono_task',
    'notification_nuke', 'phantom_check',
  ],
  mystic: [
    // Base Mystic (S33)
    'no_self', 'now_point', 'deathbed', 'entanglement_check',
    'wave_collapse', 'hologram', 'frequency_tune', 'maya_veil',
    'universal_hum', 'mystic_seal',
    // Mystic Transcendence expansion (S92)
    'candle_gaze', 'drop_in_ocean', 'koan', 'light_source',
    'space_between', 'dance_of_shiva', 'golden_thread', 'silence_bell',
    'net_of_indra', 'transcendence_seal',
  ],
  infinite: [
    'absurdity_check', 'beginners_mind', 'cosmic_joke', 'dance_break',
    'game_reset', 'infinite_seal', 'laugh_track', 'pure_yes',
    'unplanned_hour', 'wonder_walk',
  ],
  bender: [
    'atmosphere_engineer', 'belief_bridge', 'bender_seal', 'future_memory',
    'invisible_hand', 'luck_surface', 'narrative_override', 'reality_distortion',
    'silence_weapon', 'timeline_jump',
  ],

  // ── 4th Century: Acts 30-39 (Series 36-45) ─────────────────

  magnet: [
    'detachment_power', 'lighthouse_mode', 'magnet_seal', 'mystery_gap',
    'reverse_orbit', 'specific_praise', 'velvet_rope', 'warmth_competence',
    'whisper_frequency', 'yes_and_spiral',
  ],
  oracle: [
    'body_compass', 'contrarian_proof', 'danger_beautiful', 'first_three_seconds',
    'information_fast', 'oracle_seal', 'pattern_before_pattern', 'pre_mortem',
    'question_upgrade', 'signal_in_noise',
  ],
  maestro: [
    'callback', 'crescendo', 'emotional_score', 'maestro_seal',
    'mirror_match', 'pause_as_currency', 'stage_presence', 'standing_ovation',
    'tempo_control', 'tension_arc',
  ],
  shaman: [
    'ancestor_call', 'bone_reading', 'drum_circle', 'plant_medicine',
    'sacred_fire', 'shadow_walk', 'shaman_seal', 'spirit_animal',
    'vision_quest', 'water_blessing',
  ],
  stargazer: [
    'constellation', 'dark_matter', 'eclipse', 'event_horizon',
    'gravity_assist', 'light_speed', 'north_star', 'orbit_check',
    'stargazer_seal', 'supernova',
  ],
  mythmaker: [
    'chekhovs_gun', 'cliffhanger', 'fourth_wall', 'heros_call',
    'incantation', 'mentor_summon', 'mythic_seal', 'plot_twist',
    'retcon', 'villains_mask',
  ],
  shapeshifter: [
    'camouflage', 'chimera', 'chrysalis', 'costume',
    'doppelganger', 'metamorphosis', 'mirror_shift', 'proteus',
    'shifter_seal', 'skin_shed',
  ],
  dreamwalker: [
    'dream_journal', 'dream_symbol', 'hypnagogic_edge', 'lucid_entry',
    'night_terrain', 'recurring_door', 'sleep_architect', 'sleep_paralysis',
    'somnambulant', 'walker_seal',
  ],
  magnumopus: [
    'athanor', 'coagula', 'crucible', 'lead_to_gold',
    'opus_seal', 'ouroboros', 'philosophers_stone', 'prima_materia',
    'solve', 'tincture',
  ],
  prism: [
    'afterimage', 'bioluminescence', 'blind_spot', 'focal_length',
    'infrared', 'laser_focus', 'prism_seal', 'refraction',
    'shadow_cast', 'transparency',
  ],

  // ── 5th Century: Acts 40-49 (Series 46-55) ─────────────────

  graviton: [
    'binary_star', 'black_hole', 'center_of_mass', 'dark_star',
    'escape_velocity', 'gravity_seal', 'heavy_object', 'inverse_square',
    'roche_limit', 'tidal_force',
  ],
  observer: [
    'double_slit', 'many_worlds', 'observer_seal', 'quantum_tunnel',
    'retrocausality', 'schrodingers_box', 'spooky_action', 'uncertainty_blur',
    'wave_collapse', 'zero_point',
  ],
  timecapsule: [
    'capsule_seal', 'crisis_kit', 'dead_mans_switch', 'drift_bottle',
    'open_when_seal', 'prediction_stake', 'rage_vault', 'success_jar',
    'ten_year_echo', 'wine_cellar',
  ],
  loopbreaker: [
    'breaker_seal', 'double_loop', 'exit_ramp', 'friction_add',
    'glitch_injection', 'iteration_counter', 'new_groove', 'reward_audit',
    'spiral_check', 'trigger_map',
  ],
  retrocausal: [
    'ancestral_cut', 'color_grade', 'deleted_scene', 'forgiveness_filter',
    'memory_rescore', 'metadata_edit', 'narrative_flip', 'prequel',
    'retro_seal', 'time_travel_rescue',
  ],
  threshold: [
    'breath_gap', 'chrysalis_wait', 'dawn_watch', 'doorway',
    'dusk_walk', 'hinge_point', 'in_between', 'question_mark',
    'threshold_seal', 'tidal_zone',
  ],
  soma: [
    'balance_point', 'body_radar', 'cell_memory', 'fascia_wave',
    'gut_signal', 'joint_unlock', 'pulse_reader', 'skin_map',
    'soma_seal', 'voice_box',
  ],
  frequency: [
    'baseline_hum', 'dissonance_detector', 'frequency_seal', 'harmony_map',
    'interference_pattern', 'octave_jump', 'overtone', 'phase_lock',
    'resonant_cavity', 'standing_wave',
  ],
  tuner: [
    'bilateral_tap', 'brown_noise', 'delta_drop', 'gamma_spike',
    'haptic_pacer', 'heart_coherence', 'isochronic_focus', 'solfeggio_528',
    'tuner_seal', 'vagal_hum',
  ],
  broadcast: [
    'broadcast_seal', 'circadian_tint', 'color_bath', 'digital_candle',
    'haptic_heartbeat', 'presence_radar', 'rhythm_background', 'silent_timer',
    'subliminal_pulse', 'weather_window',
  ],

  // ── 6th Century: Acts 50-59 (Series 56-65) ─────────────────

  schrodinger: [
    'blur', 'box_seal', 'dice_roll', 'double_slit',
    'many_worlds_map', 'mystery_box', 'oracle_deck', 'parallel_self',
    'quantum_coin', 'random_act',
  ],
  glitch: [
    'blue_screen', 'fake_notification', 'fourth_wall_break', 'glitch_seal',
    'lag_spike', 'loop_crash', 'pixelated_self', 'reality_tear',
    'reverse_text', 'wrong_button',
  ],
  construct: [
    'architect_seal', 'council_table', 'fear_vault', 'foundation_stone',
    'greenhouse', 'grief_cairn', 'lighthouse', 'memory_palace',
    'workbench', 'zen_garden',
  ],
  biographer: [
    'antagonist_audit', 'character_sheet', 'future_memoir', 'genre_switch',
    'mythos_seal', 'origin_story', 'plot_twist', 'supporting_cast',
    'third_person_shift', 'yet_append',
  ],
  optician: [
    'broken_mirror', 'contrast_adjust', 'filter_scrub', 'focus_pull',
    'frame_crop', 'inversion_goggles', 'night_vision', 'optician_seal',
    'peripheral_scan', 'prescription_check',
  ],
  interpreter: [
    'benefit_of_doubt', 'interpreter_seal', 'ladder_of_inference', 'mirror_neurons',
    'pause_button', 'steel_man', 'subtext_scanner', 'third_chair',
    'translation_ear', 'villain_de_mask',
  ],
  socialphysics: [
    'boundary_forcefield', 'diplomat_seal', 'empathy_bridge', 'energy_redirect',
    'perspective_drone', 'silent_mirror', 'status_see_saw', 'trigger_disarm',
    'values_compass', 'yes_and_weaver',
  ],
  tribalist: [
    'circle_audit', 'echo_chamber_break', 'gift_loop', 'gossip_firewall',
    'ritual_maker', 'role_call', 'signal_fire', 'social_battery',
    'tribal_seal', 'vulnerability_key',
  ],
  valuator: [
    'asset_audit', 'energy_ledger', 'gold_standard', 'inflation_check',
    'negotiation_table', 'opportunity_cost', 'price_tag', 'quality_control',
    'scarcity_flip', 'sunk_cost_cut',
  ],
  editor: [
    'algorithm_audit', 'color_grade', 'continuity_fix', 'fact_check',
    'final_cut', 'headline_rewrite', 'kill_your_darlings', 'mute_button',
    'noise_gate', 'zoom_out',
  ],

  // ── 7th Century: Acts 60-69 (Series 66-75) ─────────────────

  grandmaster: [
    'fog_of_war', 'grandmaster_seal', 'inversion', 'leverage_point',
    'meta_view', 'optionality', 'positive_sum', 'second_order',
    'sunk_cost_eject', 'tempo_control',
  ],
  catalyst: [
    'activation_energy', 'but_to_and', 'catalyst_seal', 'future_pace',
    'label_inception', 'mirroring_tune', 'question_hook', 'silence_vacuum',
    'trojan_horse', 'vulnerability_drop',
    // S107 additions (The Chemistry Collection)
    'phase_change', 'precipitate', 'titration', 'compound',
    'solvent', 'chain_reaction', 'purification', 'inert_gas',
    'enzyme', 'equilibrium',
  ],
  kinetic: [
    'burn_rate', 'flow_trigger', 'friction_polish', 'good_enough_ship',
    'inertia_break', 'kinetic_seal', 'micro_step', 'momentum_save',
    'pivot', 'rest_stop',
  ],
  adaptive: [
    'adaptive_seal', 'compost_bin', 'elastic_snap', 'immune_response',
    'kintsugi_repair', 'phoenix_burn', 'root_deepen', 'scar_tissue',
    'shock_absorber', 'water_mode',
  ],
  shadow: [
    'dream_dive', 'golden_shadow', 'inner_child_rescue', 'integration_dialogue',
    'monster_feed', 'projection_check', 'secret_oath', 'shadow_seal',
    'shame_compass', 'trigger_trace',
  ],
  ancestor: [
    'ancestral_seal', 'bone_wisdom', 'council_of_elders', 'epigenetic_switch',
    'gift_inheritance', 'lineage_audit', 'name_reclaim', 'seven_generations',
    'torch_pass', 'trauma_breaker',
  ],
  trickster: [
    'absurdity_filter', 'avatar_swap', 'dance_break', 'mess_maker',
    'primal_scream', 'rule_breaker', 'sandbox_mode', 'trickster_seal',
    'wrong_answers_only', 'yes_lets',
  ],
  astronaut: [
    'altruism_spark', 'astronaut_seal', 'deathbed_view', 'deep_time_scroll',
    'fractal_zoom', 'galaxy_spin', 'nature_bath', 'ocean_breath',
    'overview_effect', 'sonic_boom',
  ],
  wonderer: [
    'color_thief', 'fractal_question', 'impossible_list', 'jigsaw_pivot',
    'mystery_door', 'rabbit_hole', 'shoshin_reset', 'texture_audit',
    'what_if_lever', 'wonder_seal',
  ],
  surfer: [
    'breath_synchro', 'current_check', 'friction_remover', 'good_enough_release',
    'micro_flow', 'momentum_save', 'rhythm_game', 'soft_eyes',
    'surfer_seal', 'wu_wei_slide',
  ],

  // ── 8th Century: Acts 70-79 (Series 76-85) ─────────────────

  meaning: [
    'alignment_compass', 'cosmic_joke', 'gratitude_lens', 'ikigai_intersection',
    'legacy_letter', 'meaning_seal', 'service_shift', 'suffering_audit',
    'tombstone_edit', 'why_ladder',
  ],
  servant: [
    'ego_dissolve', 'empty_chair', 'gardeners_patience', 'invisible_thread',
    'kindness_boomerang', 'listening_ear', 'mentors_hand', 'oxygen_mask',
    'ripple_effect', 'servant_seal',
  ],
  synthesis: [
    'chaos_surfer', 'emotion_blender', 'energy_exchange', 'identity_fluidity',
    'narrative_stitch', 'paradox_holder', 'shadow_hug', 'synthesis_seal',
    'transmutation_fire', 'values_alloy',
  ],
  futureweaver: [
    'branch_pruner', 'future_memory', 'legacy_seed', 'optimism_bias',
    'pre_hindsight', 'promise_keeper', 'regret_minimization', 'time_capsule_send',
    'weaver_seal', 'worst_case_simulator',
  ],
  composer: [
    'composer_seal', 'counterpoint', 'discord_resolve', 'ensemble_check',
    'improvisation', 'leitmotif_scan', 'rest_note', 'tempo_control',
    'tuning_fork', 'volume_knob',
  ],
  zenith: [
    'acclimatization', 'anchor', 'descent', 'false_summit',
    'light_load', 'oxygen_check', 'sherpa_mindset', 'view',
    'whiteout', 'zenith_seal',
  ],
  multiverse: [
    'both_and_bridge', 'committee_meeting', 'costume_change', 'empty_room',
    'future_draft', 'ghost_ship', 'identity_prism', 'multiverse_seal',
    'shadow_dance', 'shapeshifter',
  ],
  ethicist: [
    'apology_script', 'ethicist_seal', 'eulogy_test', 'gratitude_tithe',
    'hard_right', 'integrity_gap', 'responsibility_weight', 'truth_serum',
    'virtue_card', 'whisper',
  ],
  elementalist: [
    'air_filter', 'earth_drop', 'elemental_seal', 'fire_stoke',
    'forest_bath', 'lightning_rod', 'stone_stack', 'storm_eye',
    'tide_chart', 'water_flow',
  ],
  mentat: [
    'algorithm_rewrite', 'binary_choice', 'deduction_palace', 'devils_advocate',
    'focus_tunnel', 'logic_gate', 'memory_archive', 'mentat_seal',
    'pattern_match', 'speed_read',
  ],

  // ── 9th Century: Acts 80-94 (Series 86-100) ────────────────

  intuition: [
    'coin_flip', 'fear_vs_danger', 'future_self_consult', 'gut_check',
    'oracle_seal', 'resonance_test', 'shiver_scan', 'silence_vacuum',
    'sleep_on_it', 'vibe_check',
  ],
  engineer: [
    'batch_process', 'check_engine_light', 'commitment_device', 'constraint',
    'default_setting', 'engineer_seal', 'feedback_loop', 'friction_slider',
    'maintenance_schedule', 'redundancy',
  ],
  alchemistiv: [
    'anger_forge', 'anxiety_engine', 'envy_mirror', 'fear_compass',
    'grief_garden', 'joy_reservoir', 'love_amplifier', 'sadness_river',
    'shame_solvent', 'transmutation_seal',
  ],
  cognitive: [
    'architect_seal', 'creativity_workshop', 'decision_bridge', 'doubt_dungeon',
    'focus_fortress', 'future_observatory', 'logic_library', 'memory_palace_repair',
    'perspective_balcony', 'value_vault',
  ],
  // Sage Wisdom (S90): specimens stored under 'sage' key above
  gaia: [
    'breath_exchange', 'butterfly_effect', 'deep_time', 'diversity_immunity',
    'gaia_seal', 'mycelium_network', 'ocean_depth', 'sun_source',
    'water_cycle', 'zoom_out',
  ],
  // Mystic Transcendence (S92): specimens stored under 'mystic' key above
  ascendant: [
    'ascendant_seal', 'broken_bowl', 'chop_wood', 'descent',
    'dirty_hands', 'human_touch', 'marketplace_noise', 'open_door',
    'ordinary_miracle', 'ripple_maker',
  ],
  gardener: [
    'composting', 'drought_resilience', 'ecosystem_balance', 'gardener_seal',
    'harvest_timing', 'mycelial_pulse', 'pollinator', 'pruning_shears',
    'seed_bank', 'winter_rest',
  ],
  ancestorii: [
    '100_year_plan', 'ancestor_seal', 'chain_link', 'council_seat',
    'inheritance_audit', 'library_contribution', 'name_etching', 'ripple_watch',
    'torch_pass', 'wisdom_capsule',
  ],
  mastery: [
    'chisel_strike', 'crown_weight', 'distillation', 'final_polish',
    'gold_standard', 'key_turn', 'masterpiece_reveal', 'mastery_seal',
    'phoenix_ash', 'silent_nod',
  ],
  horizon: [
    'horizon_line', 'infinite_seal', 'level_up', 'new_map',
    'open_door', 'question_mark', 'sunrise', 'torch_relay',
    'unfinished_symphony', 'vastness',
  ],
  void: [
    'breath_hold', 'dark_matter', 'ego_death', 'nothing_box',
    'reset_button', 'sensory_deprivation', 'silence_vacuum', 'static_clear',
    'un_naming', 'zero_seal',
  ],
  unity: [
    'atlas_seal', 'entanglement', 'event_horizon', 'final_exhale',
    'fractal_zoom', 'golden_ratio', 'mirror_of_truth', 'prism_return',
    'symphony', 'time_collapse',
  ],
  ouroboros: [
    'alpha_omega', 'ash_sprout', 'circle_close', 'echo_origin',
    'eternal_seal', 'first_breath', 'mirror_loop', 'seed_return',
    'snake_skin', 'tail_swallow',
  ],

  // ── 11th Century: Series 101-110 (Second Millennium) ────────────

  projector: [
    'film_swap', 'beam_focus', 'lens_shift', 'reality_lag',
    'tuning_fork', 'silent_reel', 'fourth_wall', 'splice_point',
    'ghost_light', 'projector_seal',
  ],
  chronomancer: [
    'past_edit', 'future_borrow', 'time_dilation', 'ancestral_link',
    'legacy_cast', 'regret_reversal', 'deja_vu', 'wormhole',
    'eternal_now', 'chronos_seal',
  ],
  resonator: [
    'noise_cancellation', 'carrier_wave', 'constructive_interference',
    'sympathetic_resonance', 'feedback_loop', 'pure_tone', 'volume_knob',
    'echo_chamber', 'frequency_jammer', 'resonator_seal',
  ],
  materialist: [
    'first_brick', 'blueprint_edit', 'gravity_well', 'friction_test',
    'scaffolding', 'concrete_pour', 'keystone', 'demolition',
    'inspection', 'materialist_seal',
  ],
  refractor: [
    'spectrum_split', 'focal_point', 'distortion_check', 'color_grade',
    'blind_spot', 'polarizer', 'black_body', 'laser',
    'darkroom', 'prism_seal',
  ],
  engine: [
    'entropy_check', 'heat_sink', 'closed_loop', 'flywheel',
    'insulation', 'turbocharger', 'idle_state', 'fuel_mix',
    'governor', 'engine_seal',
  ],
  // S107 Catalyst additions merged into existing catalyst entry above
  quantumarchitect: [
    'superposition', 'probability_cloud', 'observer_effect', 'multiverse_branch',
    'quantum_tunneling', 'entanglement', 'wave_function_collapse', 'uncertainty_principle',
    'vacuum_fluctuation', 'quantum_seal',
  ],
  transmuter: [
    'lead_weight', 'calcination', 'distillation', 'coagulation',
    'fermentation', 'sublimation', 'amalgam', 'universal_solvent',
    'philosophers_stone', 'transmuter_seal',
  ],
  cyberneticist: [
    'error_signal', 'negative_feedback_loop', 'positive_feedback_loop', 'lag_time',
    'gain', 'set_point', 'feedforward', 'oscillation',
    'black_box', 'navigator_seal',
  ],
  fieldarchitect: [
    'polarity_check', 'iron_filings', 'strange_attractor', 'shield',
    'induced_current', 'compass_needle', 'electro_magnet', 'voltage_drop',
    'domain', 'field_seal',
  ],
  kineticist: [
    'inertia_breaker', 'gravity_assist', 'elastic_collision', 'terminal_velocity',
    'rocket_equation', 'orbit', 'vector_addition', 'momentum_save',
    'impact_zone', 'kinetic_seal',
  ],
  crystal: [
    'lattice', 'piezoelectric_spark', 'facet_cut', 'inclusion',
    'resonant_frequency', 'annealing', 'transparency', 'nucleation_point',
    'prism_refraction', 'crystal_seal',
  ],
  hydrodynamicist: [
    'laminar_flow', 'buoyancy_check', 'path_of_least_resistance', 'erosion',
    'hydraulic_press', 'vortex', 'surface_tension', 'phase_transition',
    'ocean_depth', 'hydro_seal',
  ],
  aviator: [
    'drag_check', 'angle_of_attack', 'thrust_to_weight_ratio', 'coffin_corner',
    'headwind', 'trim_tab', 'center_of_gravity', 'ground_effect',
    'feathered_prop', 'aviator_seal',
  ],
  tensegrity: [
    'floating_compression', 'pre_stress', 'load_distribution', 'omni_directional',
    'fascial_release', 'space_frame', 'dynamic_equilibrium', 'yield_point',
    'network_node', 'tensegrity_seal',
  ],
  wayfinder: [
    'dead_reckoning', 'swell_read', 'zenith_star', 'bird_sign',
    'cloud_stack', 'etak', 'phosphorescence', 'storm_drift',
    'land_scent', 'wayfinder_seal',
  ],
  receiver: [
    'signal_to_noise_ratio', 'frequency_scan', 'squelch', 'antenna_gain',
    'modulation', 'interference_pattern', 'feedback_loop', 'encryption',
    'broadcast_power', 'receiver_seal',
  ],
  vector: [
    'scalar_vs_vector', 'resultant_force', 'unit_vector', 'cross_product',
    'dot_product', 'null_vector', 'acceleration_vector', 'decomposition',
    'field_line', 'vector_seal',
  ],
  tuning: [
    'tension_check', 'dissonance_resolve', 'fundamental_frequency', 'sympathetic_vibration',
    'beat_frequency', 'overtone_series', 'dead_spot', 'amplifier',
    'fade_out', 'harmonic_seal',
  ],
};

// =====================================================================
// SERIES SLUG TO SERIES NUMBER MAPPING
// =====================================================================

/**
 * Maps series slug (typeId middle segment) to atlas series number(s).
 *
 * Most slugs map to a single series. Two exceptions:
 *   'sage'   -> S10 (base) + S90 (Wisdom expansion)
 *   'mystic' -> S33 (base) + S92 (Transcendence expansion)
 */
export const SLUG_TO_SERIES: Record<string, number[]> = {
  // 1st Century
  novice: [6], alchemist: [7], architect: [8], navigator: [9],
  sage: [10, 90], mender: [11], diplomat: [12], weaver: [13],
  visionary: [14], luminary: [15],
  // 2nd Century
  hacker: [16], chrononaut: [17], mycelium: [18], aesthete: [19],
  elemental: [20], phenomenologist: [21], alchemistii: [22],
  servantleader: [23], omegapoint: [24], source: [25],
  // 3rd Century
  stoic: [26], lover: [27], athlete: [28], strategist: [29],
  wilding: [30], guardian: [31], futurist: [32], mystic: [33, 92],
  infinite: [34], bender: [35],
  // 4th Century
  magnet: [36], oracle: [37], maestro: [38], shaman: [39],
  stargazer: [40], mythmaker: [41], shapeshifter: [42],
  dreamwalker: [43], magnumopus: [44], prism: [45],
  // 5th Century
  graviton: [46], observer: [47], timecapsule: [48], loopbreaker: [49],
  retrocausal: [50], threshold: [51], soma: [52], frequency: [53],
  tuner: [54], broadcast: [55],
  // 6th Century
  schrodinger: [56], glitch: [57], construct: [58], biographer: [59],
  optician: [60], interpreter: [61], socialphysics: [62], tribalist: [63],
  valuator: [64], editor: [65],
  // 7th Century
  grandmaster: [66], catalyst: [67, 107], kinetic: [68], adaptive: [69],
  shadow: [70], ancestor: [71], trickster: [72], astronaut: [73],
  wonderer: [74], surfer: [75],
  // 8th Century
  meaning: [76], servant: [77], synthesis: [78], futureweaver: [79],
  composer: [80], zenith: [81], multiverse: [82], ethicist: [83],
  elementalist: [84], mentat: [85],
  // 9th Century
  intuition: [86], engineer: [87], alchemistiv: [88], cognitive: [89],
  gaia: [91], ascendant: [93], gardener: [94], ancestorii: [95],
  mastery: [96], horizon: [97], void: [98], unity: [99], ouroboros: [100],
  // 11th Century (Second Millennium)
  projector: [101], chronomancer: [102], resonator: [103], materialist: [104],
  refractor: [105], engine: [106],
  quantumarchitect: [108],
  transmuter: [109],
  cyberneticist: [110],
  fieldarchitect: [111],
  kineticist: [112],
  crystal: [113],
  hydrodynamicist: [114],
  aviator: [115],
  tensegrity: [116],
  wayfinder: [117],
  receiver: [118],
  vector: [119],
  tuning: [120],
};

// =====================================================================
// SERIES SLUG TO GENERATION MAPPING (per-specimen precision)
// =====================================================================

/**
 * Maps a specimen's typeId to its generation.
 * Handles outliers: Novice_PatternGlitch (Gen 1 in Gen 2 series),
 * Mystic_MysticSeal (Gen 3 in Gen 2 series).
 */
export function getSpecimenGeneration(typeId: string): Generation {
  // Gen 1 outlier in numbered series
  if (typeId === 'lab__novice__pattern_glitch') return 1;

  // Gen 3 outlier in Gen 2 series (base Mystic)
  if (typeId === 'lab__mystic__mystic_seal') return 3;

  // Extract series slug
  const parts = typeId.split('__');
  if (parts.length < 3 || parts[0] !== 'lab') return 2; // fallback

  const seriesSlug = parts[1];
  const seriesNumbers = SLUG_TO_SERIES[seriesSlug];
  if (!seriesNumbers) return 2;

  // For dual-series slugs (sage, mystic), determine by specimen position
  if (seriesSlug === 'sage') {
    const sageBase = LAB_SPECIMENS.sage.slice(0, 10);
    const specimenSlug = parts.slice(2).join('__');
    return sageBase.includes(specimenSlug) ? 2 : 3;
  }
  if (seriesSlug === 'mystic') {
    const mysticBase = LAB_SPECIMENS.mystic.slice(0, 10);
    const specimenSlug = parts.slice(2).join('__');
    if (specimenSlug === 'transcendence_seal') return 3; // reference, tagged as Gen 3
    return mysticBase.includes(specimenSlug) ? 2 : 3;
  }

  // Standard: series number determines generation
  const primarySeries = seriesNumbers[0];
  if (primarySeries >= GEN3_RANGE_START && primarySeries <= GEN3_RANGE_END) return 3;
  return 2;
}

// =====================================================================
// DERIVED LOOKUPS
// =====================================================================

/**
 * Build a typeId from series slug and specimen slug.
 */
export function buildTypeId(seriesSlug: string, specimenSlug: string): string {
  return `lab__${seriesSlug}__${specimenSlug}`;
}

/**
 * Get all lab typeIds for a given series slug.
 */
export function getSeriesTypeIds(seriesSlug: string): string[] {
  const specimens = LAB_SPECIMENS[seriesSlug];
  if (!specimens) return [];
  return specimens.map(slug => buildTypeId(seriesSlug, slug));
}

/**
 * Get the atlas series metadata for a series slug.
 */
export function getSeriesMetadata(seriesSlug: string): SeriesMeta[] {
  const numbers = SLUG_TO_SERIES[seriesSlug];
  if (!numbers) return [];
  return numbers
    .map(n => ALL_SERIES.find(s => s.seriesNumber === n))
    .filter((s): s is SeriesMeta => !!s);
}

/**
 * Determine if a specimen is the reference specimen.
 */
export function isReferenceSpecimen(typeId: string): boolean {
  return typeId === 'lab__mystic__transcendence_seal';
}

/**
 * Get the traits for a specific specimen.
 */
export function getSpecimenTraits(typeId: string): StructuralTraits {
  if (isReferenceSpecimen(typeId)) return REFERENCE_TRAITS;
  const gen = getSpecimenGeneration(typeId);
  return GEN_TRAITS[gen];
}

// =====================================================================
// QUERY FUNCTIONS
// =====================================================================

/**
 * Get all series slugs for a given magic signature.
 */
export function queryBySignature(signature: string): string[] {
  const results: string[] = [];
  for (const [slug, seriesNumbers] of Object.entries(SLUG_TO_SERIES)) {
    for (const num of seriesNumbers) {
      const meta = ALL_SERIES.find(s => s.seriesNumber === num);
      if (meta && meta.magicSignature === signature) {
        results.push(slug);
        break; // only add slug once
      }
    }
  }
  return results;
}

/**
 * Get all typeIds for a given generation.
 */
export function queryByGeneration(gen: Generation): string[] {
  const results: string[] = [];

  // Foundation specimens
  for (const f of FOUNDATION_SPECIMENS) {
    if (f.generation === gen) {
      // Foundation specimens don't have standard typeIds
      results.push(`foundation__${f.componentName}`);
    }
  }

  // Lab specimens
  for (const [slug, specimens] of Object.entries(LAB_SPECIMENS)) {
    for (const specimen of specimens) {
      const typeId = buildTypeId(slug, specimen);
      if (getSpecimenGeneration(typeId) === gen) {
        results.push(typeId);
      }
    }
  }

  return results;
}

/**
 * Get all typeIds for a given century.
 */
export function queryByCentury(century: number): string[] {
  const seriesInCentury = ALL_SERIES.filter(s => s.century === century);
  const results: string[] = [];

  for (const series of seriesInCentury) {
    // Find the slug for this series number
    for (const [slug, numbers] of Object.entries(SLUG_TO_SERIES)) {
      if (numbers.includes(series.seriesNumber)) {
        const specimens = LAB_SPECIMENS[slug];
        if (specimens) {
          // For dual-series slugs, only include specimens belonging to this series
          if (slug === 'sage') {
            const offset = series.seriesNumber === 10 ? 0 : 10;
            const slice = specimens.slice(offset, offset + 10);
            results.push(...slice.map(s => buildTypeId(slug, s)));
          } else if (slug === 'mystic') {
            const offset = series.seriesNumber === 33 ? 0 : 10;
            const slice = specimens.slice(offset, offset + 10);
            results.push(...slice.map(s => buildTypeId(slug, s)));
          } else {
            results.push(...specimens.map(s => buildTypeId(slug, s)));
          }
        }
        break;
      }
    }
  }

  // Foundation (century 0)
  if (century === 0) {
    for (const f of FOUNDATION_SPECIMENS) {
      results.push(`foundation__${f.componentName}`);
    }
  }

  return results;
}

// =====================================================================
// STATISTICS
// =====================================================================

export interface RegistryStats {
  totalSpecimens: number;
  totalSeries: number;
  totalSeriesSlugs: number;

  byGeneration: { gen: Generation; count: number; percentage: number }[];
  bySignature: { signature: string; count: number; percentage: number }[];
  byCentury: { century: number; count: number }[];

  traits: {
    usesNaviCueShell: number;
    usesQuickstart: number;
    usesSeriesThemes: number;
    usesComposeMechanics: number;
    usesNewPrimitives: number;
  };

  referenceSpecimen: string;
  gen1OutlierCount: number;
}

export function getRegistryStats(): RegistryStats {
  const foundationCount = FOUNDATION_SPECIMENS.length;
  const labCount = Object.values(LAB_SPECIMENS).reduce((sum, arr) => sum + arr.length, 0);
  const total = foundationCount + labCount;

  // Generation counts
  const gen1 = FOUNDATION_SPECIMENS.filter(f => f.generation === 1).length + 1; // +1 for Novice_PatternGlitch
  const gen3Count = Object.entries(LAB_SPECIMENS).reduce((sum, [slug, specimens]) => {
    return sum + specimens.filter(spec => {
      const typeId = buildTypeId(slug, spec);
      return getSpecimenGeneration(typeId) === 3;
    }).length;
  }, 0);
  const gen2 = total - gen1 - gen3Count;

  // Signature counts
  const sigCounts = new Map<string, number>();
  for (const [slug, specimens] of Object.entries(LAB_SPECIMENS)) {
    const metas = getSeriesMetadata(slug);
    for (const meta of metas) {
      const current = sigCounts.get(meta.magicSignature) || 0;
      // Distribute specimens proportionally for dual-series slugs
      const perSeries = specimens.length / metas.length;
      sigCounts.set(meta.magicSignature, current + perSeries);
    }
  }

  // Century counts
  const centuryCounts = new Map<number, number>();
  centuryCounts.set(0, foundationCount);
  for (const series of ALL_SERIES) {
    if (series.century > 0) {
      const current = centuryCounts.get(series.century) || 0;
      centuryCounts.set(series.century, current + series.specimenCount);
    }
  }

  return {
    totalSpecimens: total,
    totalSeries: ALL_SERIES.length,
    totalSeriesSlugs: Object.keys(LAB_SPECIMENS).length,

    byGeneration: [
      { gen: 1, count: gen1, percentage: Math.round(gen1 / total * 100) },
      { gen: 2, count: gen2, percentage: Math.round(gen2 / total * 100) },
      { gen: 3, count: gen3Count, percentage: Math.round(gen3Count / total * 100) },
    ],

    bySignature: Array.from(sigCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([signature, count]) => ({
        signature,
        count: Math.round(count),
        percentage: Math.round(count / total * 100),
      })),

    byCentury: Array.from(centuryCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([century, count]) => ({ century, count })),

    traits: {
      usesNaviCueShell: total - gen1,     // 967
      usesQuickstart: total - gen1,        // 967
      usesSeriesThemes: gen3Count,         // 651
      usesComposeMechanics: 1,             // TranscendenceSeal only
      usesNewPrimitives: 1,               // TranscendenceSeal only
    },

    referenceSpecimen: 'Mystic_TranscendenceSeal',
    gen1OutlierCount: 1, // Novice_PatternGlitch
  };
}

// =====================================================================
// CONVENIENCE: Full specimen enumeration
// =====================================================================

/**
 * Enumerate ALL 1,000 specimens as SpecimenEntry objects.
 * This is the complete satellite view.
 *
 * Use sparingly; prefer targeted queries for performance.
 */
export function enumerateAllSpecimens(): SpecimenEntry[] {
  const entries: SpecimenEntry[] = [];

  // Foundation specimens
  for (let i = 0; i < FOUNDATION_SPECIMENS.length; i++) {
    const f = FOUNDATION_SPECIMENS[i];
    entries.push({
      componentName: f.componentName,
      fileName: f.fileName,
      typeId: `foundation__${f.componentName}`,
      seriesSlug: f.isIdentityKoan ? 'identity_koan' : f.form.toLowerCase().replace(/\s+/g, '_'),
      specimenSlug: f.componentName,
      position: i + 1,
      generation: f.generation,
      isReference: false,
    });
  }

  // Lab specimens
  for (const [slug, specimens] of Object.entries(LAB_SPECIMENS)) {
    for (let i = 0; i < specimens.length; i++) {
      const specimenSlug = specimens[i];
      const typeId = buildTypeId(slug, specimenSlug);
      entries.push({
        componentName: `${slug}_${specimenSlug}`, // approximation; exact names use PascalCase
        fileName: `${slug}_${specimenSlug}`,
        typeId,
        seriesSlug: slug,
        specimenSlug,
        position: (i % 10) + 1,
        generation: getSpecimenGeneration(typeId),
        isReference: isReferenceSpecimen(typeId),
      });
    }
  }

  return entries;
}

// =====================================================================
// SERIES QUICKSTART PARAMS -- Maps every slug to its quickstart arguments
// =====================================================================

/**
 * Pre-computed quickstart arguments for every series slug.
 * Usage: const params = SERIES_QUICKSTART_PARAMS['shaman'];
 *        const { palette, atmosphere, motion } = navicueQuickstart(...params);
 *
 * Each entry is [signatureKey, mechanism, kbe, form].
 * mechanism and kbe are undefined at series level (specimen-level concern).
 */
export const SERIES_QUICKSTART_PARAMS: Record<
  string,
  [MagicSignatureKey, string | undefined, string | undefined, NaviCueForm | undefined]
> = (() => {
  const params: Record<string, [MagicSignatureKey, string | undefined, string | undefined, NaviCueForm | undefined]> = {};
  for (const [slug, seriesNumbers] of Object.entries(SLUG_TO_SERIES)) {
    const primaryNum = seriesNumbers[0];
    const meta = ALL_SERIES.find(s => s.seriesNumber === primaryNum);
    if (meta) {
      const sig = (meta.magicSignature || 'sacred_ordinary') as MagicSignatureKey;
      const form = getSeriesAtmosphere(meta.prefix.replace(/_$/, ''));
      params[slug] = [sig, undefined, undefined, form];
    }
  }
  return params;
})();

// =====================================================================
// UNIFIED COLOR CONFIG -- Single-call resolver for palette + theme
// =====================================================================

/**
 * The complete color configuration for a series, resolved in one call.
 * Combines the blueprint's palette system with the series registry's theme data.
 */
export interface UnifiedColorConfig {
  /** The series registry entry (HSL tuples for primary/accent/void) */
  theme: SeriesRegistryEntry | null;
  /** Quick access: primary color at full opacity */
  primary: string;
  /** Quick access: accent color at full opacity */
  accent: string;
  /** Quick access: void/background color */
  void: string;
  /** Quick access: flash color for interaction feedback */
  flash: string;
  /** The series atmosphere archetype */
  atmosphere: NaviCueForm;
  /** The magic signature key */
  signatureKey: MagicSignatureKey;
  /** Whether this series has a registered theme in SERIES_REGISTRY */
  hasRegistryTheme: boolean;
}

/**
 * Get the complete unified color configuration for a series slug.
 * This is the ONE function specimens should call for all color needs.
 *
 * @param seriesSlug - e.g., 'shaman', 'astronaut', 'mystic'
 */
export function getUnifiedColorConfig(seriesSlug: string): UnifiedColorConfig {
  const entry = getSeriesRegistryEntry(seriesSlug);
  const seriesNumbers = SLUG_TO_SERIES[seriesSlug];
  const primaryNum = seriesNumbers?.[0];
  const meta = primaryNum != null ? ALL_SERIES.find(s => s.seriesNumber === primaryNum) : undefined;
  const sig = (meta?.magicSignature || 'sacred_ordinary') as MagicSignatureKey;
  const prefix = meta?.prefix?.replace(/_$/, '') || '';
  const atmosphere = getSeriesAtmosphere(prefix);

  if (entry) {
    return {
      theme: entry,
      primary: registryThemeColor(entry.primaryHSL, 1),
      accent: registryThemeColor(entry.accentHSL, 1),
      void: registryThemeColor(entry.voidHSL, 1),
      flash: registryFlashColor(entry),
      atmosphere,
      signatureKey: sig,
      hasRegistryTheme: true,
    };
  }

  // Fallback for series without registry themes (Gen 1/2)
  return {
    theme: null,
    primary: 'hsla(30, 15%, 30%, 1)',
    accent: 'hsla(42, 22%, 40%, 1)',
    void: 'hsla(0, 0%, 4%, 1)',
    flash: 'hsla(42, 22%, 50%, 0.06)',
    atmosphere,
    signatureKey: sig,
    hasRegistryTheme: false,
  };
}

// =====================================================================
// DUAL AUTHORITY AUDIT -- Migration progress tracker
// =====================================================================

/**
 * Audit result for the seriesThemes shim dependency.
 *
 * Reports how many files still import from the old seriesThemes.tsx shim
 * vs. using the palette-only pattern (like TranscendenceSeal).
 */
export interface DualAuthorityAudit {
  /** Total Gen 3 specimens (the migration target) */
  totalGen3: number;
  /** Files still importing from seriesThemes shim */
  shimDependents: number;
  /** Files already migrated to palette-only (single authority) */
  migrated: number;
  /** Migration percentage */
  migrationPct: number;
  /** The reference specimen that demonstrates the target pattern */
  referenceSpecimen: string;
  /** Series slugs that have registry themes */
  registeredSlugs: string[];
  /** Series slugs that are Gen 3 but missing from registry */
  unregisteredGen3Slugs: string[];
}

/**
 * Compute the dual-authority migration audit.
 *
 * This reports the current state of the migration from the old
 * seriesThemes dual-authority pattern to the single-palette-authority
 * pattern demonstrated by TranscendenceSeal.
 *
 * In production: shimDependents = 651, migrated = 1 (TranscendenceSeal).
 * After full migration: shimDependents = 0, migrated = 651.
 */
export function auditDualAuthorityDependencies(): DualAuthorityAudit {
  // Count Gen 3 specimens
  const gen3Slugs = new Set<string>();
  const gen3TypeIds = queryByGeneration(3);
  for (const typeId of gen3TypeIds) {
    const parts = typeId.split('__');
    if (parts[0] === 'lab' && parts[1]) {
      gen3Slugs.add(parts[1]);
    }
  }

  const registeredSlugs = Object.keys(SERIES_REGISTRY);
  const unregisteredGen3Slugs = Array.from(gen3Slugs).filter(
    slug => !registeredSlugs.includes(slug)
  );

  // In the current state, only TranscendenceSeal is migrated
  const migrated = 1;
  const totalGen3 = gen3TypeIds.length;
  const shimDependents = totalGen3 - migrated;

  return {
    totalGen3,
    shimDependents,
    migrated,
    migrationPct: Math.round((migrated / totalGen3) * 100),
    referenceSpecimen: 'Mystic_TranscendenceSeal',
    registeredSlugs,
    unregisteredGen3Slugs,
  };
}

// =====================================================================
// COMPATIBILITY SHIM HELPERS
// =====================================================================

/**
 * Reconstruct a full SeriesTheme object (matching the old seriesThemes.tsx
 * interface) from a registry entry. Used by the shim for backward compat.
 */
export function registryEntryToSeriesTheme(entry: SeriesRegistryEntry) {
  return {
    id: entry.id,
    name: entry.name,
    primary: registryThemeColor(entry.primaryHSL, 1),
    accent: registryThemeColor(entry.accentHSL, 1),
    void: registryThemeColor(entry.voidHSL, 1),
    primaryHSL: entry.primaryHSL,
    accentHSL: entry.accentHSL,
    voidHSL: entry.voidHSL,
  };
}

/**
 * Get a full SeriesTheme by slug (backward-compatible with old imports).
 */
export function getSeriesTheme(slug: string) {
  const entry = getSeriesRegistryEntry(slug);
  if (!entry) return undefined;
  return registryEntryToSeriesTheme(entry);
}

// Re-export themeColor and flashColor under their legacy names
export const themeColor = registryThemeColor;
export const flashColor = registryFlashColor;
