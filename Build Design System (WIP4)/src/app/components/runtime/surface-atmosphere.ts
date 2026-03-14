import { projectId } from '../../../../utils/supabase/info';

export type SurfaceAtmosphereSurfaceKey =
  | 'home'
  | 'echo'
  | 'link'
  | 'talk'
  | 'read'
  | 'know'
  | 'form'
  | 'map'
  | 'plot'
  | 'tune'
  | 'play';

export type SurfaceAtmosphereSceneId =
  | 'atomic_canopy'
  | 'reflective_chamber'
  | 'control_silence'
  | 'held_corridor'
  | 'quiet_line'
  | 'embodied_precision'
  | 'constellation_drift'
  | 'yielding_canopy'
  | 'station_escalation';

export type SurfaceAtmosphereIntensity = 'off' | 'subtle' | 'immersive';
export type SurfaceAtmosphereChannelRole =
  | 'bed_main'
  | 'bed_low'
  | 'bed_texture'
  | 'transition_fx';

export interface SurfaceAtmosphereSettings {
  enabled: boolean;
  intensity: SurfaceAtmosphereIntensity;
  adaptToSurface: boolean;
  rememberPreference: boolean;
  spatialHeadphonesMode: boolean;
}

interface SurfaceAtmosphereFamily {
  familyId: string;
  label: string;
  deliveryStatus: 'fallback_live' | 'dedicated_available';
  objectRoot: string;
  fallbackPlayFamilyIds: readonly string[];
}

interface SurfaceAtmosphereScene {
  sceneId: SurfaceAtmosphereSceneId;
  label: string;
  description: string;
  familyId: string;
  warmth01: number;
  motion01: number;
  pulse01: number;
  brightness01: number;
  space01: number;
}

export interface SurfaceAtmosphereResolvedState {
  surfaceKey: SurfaceAtmosphereSurfaceKey;
  sceneId: SurfaceAtmosphereSceneId;
  label: string;
  description: string;
  familyId: string;
  delivery: 'dedicated' | 'fallback';
  yieldsToPlay: boolean;
  warmth01: number;
  motion01: number;
  pulse01: number;
  brightness01: number;
  space01: number;
}

export interface SurfaceAtmosphereDeckSpec {
  key: string;
  surfaceKey: SurfaceAtmosphereSurfaceKey;
  sceneId: SurfaceAtmosphereSceneId;
  variantIndex: number;
  primaryUrl: string | null;
  secondaryUrl: string | null;
  transitionUrl: string | null;
  primaryGain01: number;
  secondaryGain01: number;
  transitionGain01: number;
  delivery: 'dedicated' | 'fallback';
}

export interface SurfaceAtmosphereTransitionContract {
  durationMs: number;
  tailCarryMs: number;
  bloomMs: number;
}

export const DEFAULT_SURFACE_ATMOSPHERE_SETTINGS: SurfaceAtmosphereSettings = {
  enabled: true,
  intensity: 'subtle',
  adaptToSurface: true,
  rememberPreference: true,
  spatialHeadphonesMode: false,
};

const FAMILIES: Record<string, SurfaceAtmosphereFamily> = {
  'atmo-atomic-canopy': {
    familyId: 'atmo-atomic-canopy',
    label: 'Atomic Canopy',
    deliveryStatus: 'dedicated_available',
    objectRoot: 'surface-atmosphere/families/atmo-atomic-canopy',
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'focus-lumen-corridor', 'focus-glass-corridor'],
  },
  'atmo-reflective-chamber': {
    familyId: 'atmo-reflective-chamber',
    label: 'Reflective Chamber',
    deliveryStatus: 'dedicated_available',
    objectRoot: 'surface-atmosphere/families/atmo-reflective-chamber',
    fallbackPlayFamilyIds: ['focus-centering-glow', 'focus-hearth-hold'],
  },
  'atmo-control-silence': {
    familyId: 'atmo-control-silence',
    label: 'Control Silence',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-control-silence',
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'focus-centering-glow'],
  },
  'atmo-held-corridor': {
    familyId: 'atmo-held-corridor',
    label: 'Held Corridor',
    deliveryStatus: 'dedicated_available',
    objectRoot: 'surface-atmosphere/families/atmo-held-corridor',
    fallbackPlayFamilyIds: ['focus-glass-corridor', 'focus-lumen-corridor'],
  },
  'atmo-quiet-line': {
    familyId: 'atmo-quiet-line',
    label: 'Quiet Line',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-quiet-line',
    fallbackPlayFamilyIds: ['focus-centering-glow', 'focus-hearth-hold'],
  },
  'atmo-constellation-drift': {
    familyId: 'atmo-constellation-drift',
    label: 'Constellation Drift',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-constellation-drift',
    fallbackPlayFamilyIds: ['drift-midnight-canopy', 'focus-hearth-hold'],
  },
  'atmo-yielding-canopy': {
    familyId: 'atmo-yielding-canopy',
    label: 'Yielding Canopy',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-yielding-canopy',
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'drive-rise-up-current', 'focus-lumen-corridor'],
  },
  'atmo-station-escalation': {
    familyId: 'atmo-station-escalation',
    label: 'Station Escalation',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-station-escalation',
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'drive-rise-up-current', 'drift-midnight-canopy'],
  },
};

const SCENES: Record<SurfaceAtmosphereSceneId, SurfaceAtmosphereScene> = {
  atomic_canopy: {
    sceneId: 'atomic_canopy',
    label: 'Atomic Canopy',
    description: 'The living canopy behind the home shell and the resting glass.',
    familyId: 'atmo-atomic-canopy',
    warmth01: 0.46,
    motion01: 0.34,
    pulse01: 0.18,
    brightness01: 0.44,
    space01: 0.72,
  },
  reflective_chamber: {
    sceneId: 'reflective_chamber',
    label: 'Reflective Chamber',
    description: 'An inward chamber for proof, memory, and reflective control.',
    familyId: 'atmo-reflective-chamber',
    warmth01: 0.54,
    motion01: 0.2,
    pulse01: 0.08,
    brightness01: 0.28,
    space01: 0.58,
  },
  control_silence: {
    sceneId: 'control_silence',
    label: 'Control Silence',
    description: 'Low-information continuity for LINK and configuration space.',
    familyId: 'atmo-control-silence',
    warmth01: 0.36,
    motion01: 0.08,
    pulse01: 0.04,
    brightness01: 0.18,
    space01: 0.52,
  },
  held_corridor: {
    sceneId: 'held_corridor',
    label: 'Held Corridor',
    description: 'A warm corridor for TALK and guided holding.',
    familyId: 'atmo-held-corridor',
    warmth01: 0.62,
    motion01: 0.16,
    pulse01: 0.06,
    brightness01: 0.24,
    space01: 0.5,
  },
  quiet_line: {
    sceneId: 'quiet_line',
    label: 'Quiet Line',
    description: 'Low-cognitive-load support for reading and intelligence surfaces.',
    familyId: 'atmo-quiet-line',
    warmth01: 0.42,
    motion01: 0.12,
    pulse01: 0.03,
    brightness01: 0.26,
    space01: 0.6,
  },
  embodied_precision: {
    sceneId: 'embodied_precision',
    label: 'Embodied Precision',
    description: 'A steadier lane for tuned practice, action, and embodied work.',
    familyId: 'atmo-yielding-canopy',
    warmth01: 0.4,
    motion01: 0.26,
    pulse01: 0.11,
    brightness01: 0.24,
    space01: 0.48,
  },
  constellation_drift: {
    sceneId: 'constellation_drift',
    label: 'Constellation Drift',
    description: 'A spatial map field with more dimensional drift.',
    familyId: 'atmo-constellation-drift',
    warmth01: 0.33,
    motion01: 0.22,
    pulse01: 0.05,
    brightness01: 0.2,
    space01: 0.82,
  },
  yielding_canopy: {
    sceneId: 'yielding_canopy',
    label: 'Yielding Canopy',
    description: 'A rhythm-aware layer that stays out of the way while tuning happens.',
    familyId: 'atmo-yielding-canopy',
    warmth01: 0.38,
    motion01: 0.28,
    pulse01: 0.14,
    brightness01: 0.22,
    space01: 0.56,
  },
  station_escalation: {
    sceneId: 'station_escalation',
    label: 'Station Escalation',
    description: 'A handoff into PLAY where the canopy should yield to the station.',
    familyId: 'atmo-station-escalation',
    warmth01: 0.32,
    motion01: 0.44,
    pulse01: 0.2,
    brightness01: 0.3,
    space01: 0.62,
  },
};

const SURFACE_SCENE_MAP: Record<SurfaceAtmosphereSurfaceKey, SurfaceAtmosphereSceneId> = {
  home: 'atomic_canopy',
  echo: 'reflective_chamber',
  link: 'control_silence',
  talk: 'held_corridor',
  read: 'quiet_line',
  know: 'quiet_line',
  form: 'embodied_precision',
  map: 'constellation_drift',
  plot: 'constellation_drift',
  tune: 'yielding_canopy',
  play: 'station_escalation',
};

const SUPABASE_ASSET_PROXY_BASE = `https://${projectId}.supabase.co/functions/v1/asset-object`;

function buildAudioProxyUrl(objectPath: string) {
  return `${SUPABASE_ASSET_PROXY_BASE}/audio?path=${encodeURIComponent(objectPath)}`;
}

function derivePlayBand(familyId: string) {
  if (familyId.startsWith('drive-')) return 'drive';
  if (familyId.startsWith('drift-')) return 'drift';
  return 'focus';
}

function objectNameForRole(
  role: SurfaceAtmosphereChannelRole,
  format: 'm4a' | 'mp3' = 'm4a',
) {
  if (role === 'transition_fx') {
    return `transition_fx--transition.${format}`;
  }
  return `${role}.${format}`;
}

function buildPlayFamilyChannelUrl(
  familyId: string,
  role: SurfaceAtmosphereChannelRole,
  format: 'm4a' | 'mp3' = 'm4a',
) {
  return buildAudioProxyUrl(
    `play/beds/${derivePlayBand(familyId)}/${familyId}/${objectNameForRole(role, format)}`,
  );
}

function buildDedicatedAtmosphereChannelUrl(
  family: SurfaceAtmosphereFamily,
  role: SurfaceAtmosphereChannelRole,
  format: 'm4a' | 'mp3' = 'm4a',
) {
  return buildAudioProxyUrl(`${family.objectRoot}/${objectNameForRole(role, format)}`);
}

function scaleForIntensity(value: number, intensity: SurfaceAtmosphereIntensity) {
  if (intensity === 'immersive') return Math.min(1, value * 1.16);
  if (intensity === 'off') return Math.max(0, value * 0.4);
  return value;
}

export function resolveSurfaceAtmosphereSurfaceKeyFromModeId(
  modeId: string | null | undefined,
): SurfaceAtmosphereSurfaceKey | null {
  switch (modeId) {
    case 'talk':
      return 'talk';
    case 'play':
      return 'play';
    case 'tune':
      return 'tune';
    case 'sync':
    case 'read':
      return 'read';
    case 'know':
      return 'know';
    case 'hone':
      return 'form';
    case 'echo':
      return 'echo';
    case 'plot':
      return 'plot';
    case 'map':
      return 'map';
    case 'link':
      return 'link';
    case 'home':
    case 'flow':
      return 'home';
    default:
      return null;
  }
}

export function resolveSurfaceAtmosphereSurfaceKeyFromPathname(
  pathname: string,
): SurfaceAtmosphereSurfaceKey {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/surfaces') || pathname.startsWith('/base')) return 'home';
  if (pathname.startsWith('/voice')) return 'talk';
  if (pathname.startsWith('/form')) return 'form';
  if (pathname.startsWith('/rooms')) return 'map';
  if (pathname.startsWith('/governors') || pathname.startsWith('/compatibility')) {
    return 'link';
  }
  if (
    pathname.startsWith('/tokens') ||
    pathname.startsWith('/typography') ||
    pathname.startsWith('/copy') ||
    pathname.startsWith('/motion') ||
    pathname.startsWith('/doctrine')
  ) {
    return 'read';
  }
  if (pathname.startsWith('/components') || pathname.startsWith('/atoms')) {
    return 'know';
  }
  if (pathname.startsWith('/cues') || pathname.startsWith('/sync')) {
    return 'tune';
  }
  return 'home';
}

export function resolveSurfaceAtmosphereState(
  surfaceKey: SurfaceAtmosphereSurfaceKey,
  settings: SurfaceAtmosphereSettings = DEFAULT_SURFACE_ATMOSPHERE_SETTINGS,
): SurfaceAtmosphereResolvedState {
  const sceneId = settings.adaptToSurface ? SURFACE_SCENE_MAP[surfaceKey] : SURFACE_SCENE_MAP.home;
  const scene = SCENES[sceneId];
  const family = FAMILIES[scene.familyId];

  return {
    surfaceKey,
    sceneId,
    label: scene.label,
    description: scene.description,
    familyId: family.familyId,
    delivery: family.deliveryStatus === 'dedicated_available' ? 'dedicated' : 'fallback',
    yieldsToPlay: surfaceKey === 'play',
    warmth01: scaleForIntensity(scene.warmth01, settings.enabled ? settings.intensity : 'off'),
    motion01: scaleForIntensity(scene.motion01, settings.enabled ? settings.intensity : 'off'),
    pulse01: scaleForIntensity(scene.pulse01, settings.enabled ? settings.intensity : 'off'),
    brightness01: scaleForIntensity(scene.brightness01, settings.enabled ? settings.intensity : 'off'),
    space01: scaleForIntensity(scene.space01, settings.enabled ? settings.intensity : 'off'),
  };
}

export function resolveSurfaceAtmosphereTransitionContract(
  fromSurface: SurfaceAtmosphereSurfaceKey,
  toSurface: SurfaceAtmosphereSurfaceKey,
): SurfaceAtmosphereTransitionContract {
  if (fromSurface === 'play' || toSurface === 'play') {
    return { durationMs: 1400, tailCarryMs: 800, bloomMs: 900 };
  }
  if (fromSurface === 'talk' || toSurface === 'talk') {
    return { durationMs: 2500, tailCarryMs: 1400, bloomMs: 1600 };
  }
  if (fromSurface === 'map' || toSurface === 'map' || fromSurface === 'plot' || toSurface === 'plot') {
    return { durationMs: 2800, tailCarryMs: 1600, bloomMs: 2000 };
  }
  return { durationMs: 1800, tailCarryMs: 900, bloomMs: 1200 };
}

function intensityProfile(intensity: SurfaceAtmosphereIntensity) {
  if (intensity === 'immersive') {
    return { primary: 0.2, secondary: 0.12, transition: 0.08 };
  }
  if (intensity === 'off') {
    return { primary: 0.08, secondary: 0.04, transition: 0.03 };
  }
  return { primary: 0.14, secondary: 0.08, transition: 0.05 };
}

function deckSpecForVariant(
  state: SurfaceAtmosphereResolvedState,
  settings: SurfaceAtmosphereSettings,
  variantIndex: number,
): SurfaceAtmosphereDeckSpec {
  const family = FAMILIES[state.familyId];
  const dedicated = family.deliveryStatus === 'dedicated_available';
  const profile = intensityProfile(settings.enabled ? settings.intensity : 'off');
  const fallbacks = family.fallbackPlayFamilyIds;
  const primaryFallbackId = fallbacks[variantIndex % Math.max(1, fallbacks.length)] ?? 'focus-hearth-hold';
  const secondaryFallbackId =
    fallbacks[(variantIndex + 1) % Math.max(1, fallbacks.length)] ?? primaryFallbackId;
  const transitionFallbackId =
    fallbacks[Math.min(2, Math.max(0, fallbacks.length - 1))] ?? secondaryFallbackId;

  return {
    key: `${state.surfaceKey}:${state.sceneId}:${variantIndex}:${settings.intensity}:${family.familyId}`,
    surfaceKey: state.surfaceKey,
    sceneId: state.sceneId,
    variantIndex,
    primaryUrl: dedicated
      ? buildDedicatedAtmosphereChannelUrl(family, 'bed_main')
      : buildPlayFamilyChannelUrl(primaryFallbackId, 'bed_main'),
    secondaryUrl: dedicated
      ? buildDedicatedAtmosphereChannelUrl(family, 'bed_texture')
      : buildPlayFamilyChannelUrl(secondaryFallbackId, 'bed_texture'),
    transitionUrl: dedicated
      ? buildDedicatedAtmosphereChannelUrl(family, 'transition_fx')
      : buildPlayFamilyChannelUrl(transitionFallbackId, 'transition_fx'),
    primaryGain01: profile.primary,
    secondaryGain01: profile.secondary,
    transitionGain01: profile.transition,
    delivery: dedicated ? 'dedicated' : 'fallback',
  };
}

export function buildSurfaceAtmosphereDeckVariants(
  state: SurfaceAtmosphereResolvedState,
  settings: SurfaceAtmosphereSettings = DEFAULT_SURFACE_ATMOSPHERE_SETTINGS,
) {
  const family = FAMILIES[state.familyId];
  const variantCount =
    family.deliveryStatus === 'dedicated_available'
      ? 1
      : Math.min(2, Math.max(family.fallbackPlayFamilyIds.length, 1));

  return Array.from({ length: variantCount }, (_, index) =>
    deckSpecForVariant(state, settings, index),
  );
}
