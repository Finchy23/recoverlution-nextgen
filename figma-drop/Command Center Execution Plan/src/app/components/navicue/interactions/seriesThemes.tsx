/**
 * SERIES THEMES -- THIN RE-EXPORT SHIM
 * =====================================
 *
 * DEPRECATED: This file is a backward-compatibility shim.
 *
 * The SINGLE AUTHORITY for series colors is now:
 *   navicue-blueprint.ts -> SERIES_REGISTRY
 *
 * This shim exists so that 651 Gen 3 files that import from here
 * continue to work without modification. New code should import
 * directly from navicue-blueprint.ts or navicue-registry.ts.
 *
 * Migration target: Remove all imports from this file.
 * Reference specimen: Mystic_TranscendenceSeal (uses palette-only pattern).
 */

import {
  SERIES_REGISTRY,
  registryThemeColor,
  registryFlashColor,
  type SeriesRegistryEntry,
} from '@/app/design-system/navicue-blueprint';

// ── Re-export the SeriesTheme interface (backward-compatible shape) ──

export interface SeriesTheme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  void: string;
  primaryHSL: [number, number, number];
  accentHSL: [number, number, number];
  voidHSL: [number, number, number];
}

// ── Helper: reconstruct full SeriesTheme from registry entry ──

function toSeriesTheme(entry: SeriesRegistryEntry): SeriesTheme {
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

// ── Re-export every named theme constant (reads from SERIES_REGISTRY) ──

export const BENDER_THEME       = toSeriesTheme(SERIES_REGISTRY.bender);
export const MAGNET_THEME       = toSeriesTheme(SERIES_REGISTRY.magnet);
export const ORACLE_THEME       = toSeriesTheme(SERIES_REGISTRY.oracle);
export const MAESTRO_THEME      = toSeriesTheme(SERIES_REGISTRY.maestro);
export const SHAMAN_THEME       = toSeriesTheme(SERIES_REGISTRY.shaman);
export const STARGAZER_THEME    = toSeriesTheme(SERIES_REGISTRY.stargazer);
export const MYTHMAKER_THEME    = toSeriesTheme(SERIES_REGISTRY.mythmaker);
export const SHAPESHIFTER_THEME = toSeriesTheme(SERIES_REGISTRY.shapeshifter);
export const DREAMWALKER_THEME  = toSeriesTheme(SERIES_REGISTRY.dreamwalker);
export const MAGNUMOPUS_THEME   = toSeriesTheme(SERIES_REGISTRY.magnumopus);
export const TIMEWEAVER_THEME   = toSeriesTheme(SERIES_REGISTRY.timeweaver);
export const RESONATOR_THEME    = toSeriesTheme(SERIES_REGISTRY.resonator);
export const PRISM_THEME        = toSeriesTheme(SERIES_REGISTRY.prism);
export const GRAVITON_THEME     = toSeriesTheme(SERIES_REGISTRY.graviton);
export const OBSERVER_THEME     = toSeriesTheme(SERIES_REGISTRY.observer);
export const TIMECAPSULE_THEME  = toSeriesTheme(SERIES_REGISTRY.timecapsule);
export const LOOPBREAKER_THEME  = toSeriesTheme(SERIES_REGISTRY.loopbreaker);
export const RETROCAUSAL_THEME  = toSeriesTheme(SERIES_REGISTRY.retrocausal);
export const THRESHOLD_THEME    = toSeriesTheme(SERIES_REGISTRY.threshold);
export const SOMA_THEME         = toSeriesTheme(SERIES_REGISTRY.soma);
export const FREQUENCY_THEME    = toSeriesTheme(SERIES_REGISTRY.frequency);
export const TUNER_THEME        = toSeriesTheme(SERIES_REGISTRY.tuner);
export const BROADCAST_THEME    = toSeriesTheme(SERIES_REGISTRY.broadcast);
export const SCHRODINGER_THEME  = toSeriesTheme(SERIES_REGISTRY.schrodinger);
export const GLITCH_THEME       = toSeriesTheme(SERIES_REGISTRY.glitch);
export const CONSTRUCT_THEME    = toSeriesTheme(SERIES_REGISTRY.construct);
export const BIOGRAPHER_THEME   = toSeriesTheme(SERIES_REGISTRY.biographer);
export const OPTICIAN_THEME     = toSeriesTheme(SERIES_REGISTRY.optician);
export const INTERPRETER_THEME  = toSeriesTheme(SERIES_REGISTRY.interpreter);
export const SOCIALPHYSICS_THEME = toSeriesTheme(SERIES_REGISTRY.socialphysics);
export const TRIBALIST_THEME    = toSeriesTheme(SERIES_REGISTRY.tribalist);
export const VALUATOR_THEME     = toSeriesTheme(SERIES_REGISTRY.valuator);
export const EDITOR_THEME       = toSeriesTheme(SERIES_REGISTRY.editor);
export const GRANDMASTER_THEME  = toSeriesTheme(SERIES_REGISTRY.grandmaster);
export const CATALYST_THEME     = toSeriesTheme(SERIES_REGISTRY.catalyst);
export const KINETIC_THEME      = toSeriesTheme(SERIES_REGISTRY.kinetic);
export const ADAPTIVE_THEME     = toSeriesTheme(SERIES_REGISTRY.adaptive);
export const SHADOW_THEME       = toSeriesTheme(SERIES_REGISTRY.shadow);
export const ANCESTOR_THEME     = toSeriesTheme(SERIES_REGISTRY.ancestor);
export const TRICKSTER_THEME    = toSeriesTheme(SERIES_REGISTRY.trickster);
export const ASTRONAUT_THEME    = toSeriesTheme(SERIES_REGISTRY.astronaut);
export const WONDERER_THEME     = toSeriesTheme(SERIES_REGISTRY.wonderer);
export const SURFER_THEME       = toSeriesTheme(SERIES_REGISTRY.surfer);
export const MEANING_THEME      = toSeriesTheme(SERIES_REGISTRY.meaning);
export const SERVANT_THEME      = toSeriesTheme(SERIES_REGISTRY.servant);
export const SYNTHESIS_THEME    = toSeriesTheme(SERIES_REGISTRY.synthesis);
export const FUTUREWEAVER_THEME = toSeriesTheme(SERIES_REGISTRY.futureweaver);
export const COMPOSER_THEME     = toSeriesTheme(SERIES_REGISTRY.composer);
export const ZENITH_THEME       = toSeriesTheme(SERIES_REGISTRY.zenith);
export const MULTIVERSE_THEME   = toSeriesTheme(SERIES_REGISTRY.multiverse);
export const ETHICIST_THEME     = toSeriesTheme(SERIES_REGISTRY.ethicist);
export const ELEMENTALIST_THEME = toSeriesTheme(SERIES_REGISTRY.elementalist);
export const MENTAT_THEME       = toSeriesTheme(SERIES_REGISTRY.mentat);
export const INTUITION_THEME    = toSeriesTheme(SERIES_REGISTRY.intuition);
export const ENGINEER_THEME     = toSeriesTheme(SERIES_REGISTRY.engineer);
export const ALCHEMISTIV_THEME  = toSeriesTheme(SERIES_REGISTRY.alchemistiv);
export const COGNITIVE_THEME    = toSeriesTheme(SERIES_REGISTRY.cognitive);
export const SAGE_THEME         = toSeriesTheme(SERIES_REGISTRY.sage);
export const GAIA_THEME         = toSeriesTheme(SERIES_REGISTRY.gaia);
export const MYSTIC_THEME       = toSeriesTheme(SERIES_REGISTRY.mystic);
export const ASCENDANT_THEME    = toSeriesTheme(SERIES_REGISTRY.ascendant);
export const GARDENER_THEME     = toSeriesTheme(SERIES_REGISTRY.gardener);
export const ANCESTORII_THEME   = toSeriesTheme(SERIES_REGISTRY.ancestorii);
export const MASTERY_THEME      = toSeriesTheme(SERIES_REGISTRY.mastery);
export const HORIZON_THEME      = toSeriesTheme(SERIES_REGISTRY.horizon);
export const VOID_THEME         = toSeriesTheme(SERIES_REGISTRY.void);
export const UNITY_THEME        = toSeriesTheme(SERIES_REGISTRY.unity);
export const OUROBOROS_THEME    = toSeriesTheme(SERIES_REGISTRY.ouroboros);

// ── Second Millennium — 11th Century (Series 101–110) ──
export const PROJECTOR_THEME       = toSeriesTheme(SERIES_REGISTRY.projector);
export const CHRONOMANCER_THEME    = toSeriesTheme(SERIES_REGISTRY.chronomancer);
export const MATERIALIST_THEME     = toSeriesTheme(SERIES_REGISTRY.materialist);
export const ENGINE_THEME          = toSeriesTheme(SERIES_REGISTRY.engine);
export const CATALYSTII_THEME      = toSeriesTheme(SERIES_REGISTRY.catalystii);
export const QUANTUMARCHITECT_THEME = toSeriesTheme(SERIES_REGISTRY.quantumarchitect);
export const TRANSMUTER_THEME      = toSeriesTheme(SERIES_REGISTRY.transmuter);
export const CYBERNETICIST_THEME   = toSeriesTheme(SERIES_REGISTRY.cyberneticist);

// ── Re-export helper functions (now delegate to blueprint) ──

export function themeColor(
  hsl: [number, number, number],
  alpha: number,
  lightnessOffset = 0,
): string {
  return registryThemeColor(hsl, alpha, lightnessOffset);
}

export function flashColor(theme: SeriesTheme): string {
  return registryFlashColor({
    id: theme.id,
    name: theme.name,
    primaryHSL: theme.primaryHSL,
    accentHSL: theme.accentHSL,
    voidHSL: theme.voidHSL,
  });
}
