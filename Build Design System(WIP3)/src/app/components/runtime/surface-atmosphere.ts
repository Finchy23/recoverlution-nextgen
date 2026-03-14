import { projectId } from '../../../../utils/supabase/info';

export type SurfaceAtmosphereSurfaceKey =
  | 'home'
  | 'echo'
  | 'link'
  | 'talk'
  | 'rest'
  | 'read'
  | 'know'
  | 'insight'
  | 'seek'
  | 'form'
  | 'action'
  | 'map'
  | 'plot'
  | 'tune'
  | 'studio'
  | 'play';

export type SurfaceAtmosphereSceneId =
  | 'atomic_canopy'
  | 'reflective_chamber'
  | 'control_silence'
  | 'held_corridor'
  | 'parasympathetic_exhale'
  | 'quiet_line'
  | 'curious_aperture'
  | 'embodied_precision'
  | 'constellation_drift'
  | 'yielding_canopy'
  | 'station_escalation';

export type SurfaceAtmosphereIntensity = 'off' | 'subtle' | 'immersive';
export type SurfaceAtmosphereVariant = 'reduced' | 'primary' | 'rich';
export type SurfaceAtmosphereSourceKind =
  | 'play_family_derivative'
  | 'atmosphere_original'
  | 'inherited';
export type SurfaceAtmosphereChannelRole =
  | 'bed_main'
  | 'bed_low'
  | 'bed_texture'
  | 'transition_fx';
export type SurfaceAtmosphereDeliveryStatus =
  | 'planned'
  | 'fallback_live'
  | 'dedicated_available';
export type SurfaceAtmosphereTransitionLaw =
  | 'soft_crossfade'
  | 'tail_carry'
  | 'slow_bloom'
  | 'media_yield'
  | 'station_escalation';

export interface SurfaceAtmosphereSourceFamily {
  familyId: string;
  weight: number;
  channelRoles: readonly SurfaceAtmosphereChannelRole[];
}

export interface SurfaceAtmosphereFamilyContract {
  familyId: string;
  label: string;
  sourceKind: SurfaceAtmosphereSourceKind;
  deliveryStatus: SurfaceAtmosphereDeliveryStatus;
  objectRoot: string;
  intendedScenes: readonly SurfaceAtmosphereSceneId[];
  fallbackPlayFamilyIds: readonly string[];
  channelRoles: readonly SurfaceAtmosphereChannelRole[];
}

export interface SurfaceAtmosphereSettings {
  enabled: boolean;
  intensity: SurfaceAtmosphereIntensity;
  adaptToSurface: boolean;
  rememberPreference: boolean;
  spatialHeadphonesMode: boolean;
}

export interface SurfaceAtmosphereSceneContract {
  sceneId: SurfaceAtmosphereSceneId;
  label: string;
  description: string;
  sourceKind: SurfaceAtmosphereSourceKind;
  warmth01: number;
  motion01: number;
  pulse01: number;
  brightness01: number;
  space01: number;
  defaultTransitionLaw: SurfaceAtmosphereTransitionLaw;
  atmosphereFamilyHints: readonly string[];
  playFamilyHints: readonly string[];
  sourceFamilies: readonly SurfaceAtmosphereSourceFamily[];
}

export interface SurfaceAtmosphereResolvedState {
  surfaceKey: SurfaceAtmosphereSurfaceKey;
  sceneId: SurfaceAtmosphereSceneId;
  label: string;
  variant: SurfaceAtmosphereVariant;
  sourceKind: SurfaceAtmosphereSourceKind;
  transitionLaw: SurfaceAtmosphereTransitionLaw;
  atmosphereFamilyHints: readonly string[];
  playFamilyHints: readonly string[];
  sourceFamilies: readonly SurfaceAtmosphereSourceFamily[];
  warmth01: number;
  motion01: number;
  pulse01: number;
  brightness01: number;
  space01: number;
}

export interface SurfaceAtmosphereTransitionContract {
  law: SurfaceAtmosphereTransitionLaw;
  durationMs: number;
  tailCarryMs: number;
  bloomMs: number;
  duckToGain01: number;
}

export interface SurfaceAtmosphereDeckSpec {
  key: string;
  surfaceKey: SurfaceAtmosphereSurfaceKey;
  sceneId: SurfaceAtmosphereSceneId;
  variantIndex: number;
  alternateCount: number;
  primaryUrl: string | null;
  secondaryUrl: string | null;
  transitionUrl: string | null;
  primaryGain01: number;
  secondaryGain01: number;
  transitionGain01: number;
  delivery: 'dedicated' | 'fallback';
}

export const DEFAULT_SURFACE_ATMOSPHERE_SETTINGS: SurfaceAtmosphereSettings = {
  enabled: true,
  intensity: 'subtle',
  adaptToSurface: true,
  rememberPreference: true,
  spatialHeadphonesMode: false,
};

export const SURFACE_ATMOSPHERE_SCENES: Record<
  SurfaceAtmosphereSceneId,
  SurfaceAtmosphereSceneContract
> = {
  atomic_canopy: {
    sceneId: 'atomic_canopy',
    label: 'Atomic Canopy',
    description: 'The living home climate behind atomic cues and the resting shell.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.46,
    motion01: 0.34,
    pulse01: 0.18,
    brightness01: 0.44,
    space01: 0.72,
    defaultTransitionLaw: 'soft_crossfade',
    atmosphereFamilyHints: ['atmo-atomic-canopy'],
    playFamilyHints: ['focus-hearth-hold', 'focus-lumen-corridor', 'focus-glass-corridor'],
    sourceFamilies: [
      { familyId: 'focus-hearth-hold', weight: 0.42, channelRoles: ['bed_main', 'bed_low', 'bed_texture'] },
      { familyId: 'focus-lumen-corridor', weight: 0.34, channelRoles: ['bed_main', 'bed_texture', 'transition_fx'] },
      { familyId: 'focus-glass-corridor', weight: 0.24, channelRoles: ['bed_texture', 'transition_fx'] },
    ],
  },
  reflective_chamber: {
    sceneId: 'reflective_chamber',
    label: 'Reflective Chamber',
    description: 'An inward, held chamber for ECHO and contemplative interiority.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.54,
    motion01: 0.2,
    pulse01: 0.08,
    brightness01: 0.28,
    space01: 0.58,
    defaultTransitionLaw: 'tail_carry',
    atmosphereFamilyHints: ['atmo-reflective-chamber'],
    playFamilyHints: ['focus-centering-glow', 'focus-hearth-hold'],
    sourceFamilies: [
      { familyId: 'focus-centering-glow', weight: 0.58, channelRoles: ['bed_main', 'bed_low', 'bed_texture'] },
      { familyId: 'focus-hearth-hold', weight: 0.42, channelRoles: ['bed_low', 'bed_texture', 'transition_fx'] },
    ],
  },
  control_silence: {
    sceneId: 'control_silence',
    label: 'Control Silence',
    description: 'Low-information continuity for LINK and settings-like infrastructure rooms.',
    sourceKind: 'inherited',
    warmth01: 0.36,
    motion01: 0.08,
    pulse01: 0.04,
    brightness01: 0.18,
    space01: 0.52,
    defaultTransitionLaw: 'soft_crossfade',
    atmosphereFamilyHints: ['atmo-control-silence'],
    playFamilyHints: ['focus-hearth-hold'],
    sourceFamilies: [
      { familyId: 'focus-hearth-hold', weight: 0.7, channelRoles: ['bed_low', 'bed_texture'] },
      { familyId: 'focus-centering-glow', weight: 0.3, channelRoles: ['bed_texture', 'transition_fx'] },
    ],
  },
  held_corridor: {
    sceneId: 'held_corridor',
    label: 'Held Corridor',
    description: 'A warm, emotionally safe corridor for TALK and guided holding.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.62,
    motion01: 0.16,
    pulse01: 0.06,
    brightness01: 0.24,
    space01: 0.5,
    defaultTransitionLaw: 'tail_carry',
    atmosphereFamilyHints: ['atmo-held-corridor'],
    playFamilyHints: ['focus-glass-corridor', 'focus-lumen-corridor'],
    sourceFamilies: [
      { familyId: 'focus-glass-corridor', weight: 0.56, channelRoles: ['bed_main', 'bed_low', 'bed_texture'] },
      { familyId: 'focus-lumen-corridor', weight: 0.44, channelRoles: ['bed_texture', 'transition_fx'] },
    ],
  },
  parasympathetic_exhale: {
    sceneId: 'parasympathetic_exhale',
    label: 'Parasympathetic Exhale',
    description: 'The deepest non-PLAY downshifting layer for REST and soft night descent.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.66,
    motion01: 0.06,
    pulse01: 0.02,
    brightness01: 0.16,
    space01: 0.84,
    defaultTransitionLaw: 'slow_bloom',
    atmosphereFamilyHints: ['atmo-parasympathetic-exhale'],
    playFamilyHints: ['drift-afterlight-sleep', 'drift-lantern-harbor', 'drift-midnight-canopy'],
    sourceFamilies: [
      { familyId: 'drift-afterlight-sleep', weight: 0.46, channelRoles: ['bed_main', 'bed_low', 'bed_texture'] },
      { familyId: 'drift-lantern-harbor', weight: 0.28, channelRoles: ['bed_texture', 'transition_fx'] },
      { familyId: 'drift-midnight-canopy', weight: 0.26, channelRoles: ['bed_low', 'bed_texture', 'transition_fx'] },
    ],
  },
  quiet_line: {
    sceneId: 'quiet_line',
    label: 'Quiet Line',
    description: 'Low-cognitive-load support for reading, knowing, and insight surfaces.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.42,
    motion01: 0.12,
    pulse01: 0.03,
    brightness01: 0.26,
    space01: 0.6,
    defaultTransitionLaw: 'soft_crossfade',
    atmosphereFamilyHints: ['atmo-quiet-line'],
    playFamilyHints: ['focus-centering-glow', 'focus-hearth-hold'],
    sourceFamilies: [
      { familyId: 'focus-centering-glow', weight: 0.54, channelRoles: ['bed_main', 'bed_texture'] },
      { familyId: 'focus-hearth-hold', weight: 0.46, channelRoles: ['bed_low', 'bed_texture'] },
    ],
  },
  curious_aperture: {
    sceneId: 'curious_aperture',
    label: 'Curious Aperture',
    description: 'A gently investigative opening for SEEK-like moments.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.38,
    motion01: 0.22,
    pulse01: 0.1,
    brightness01: 0.34,
    space01: 0.68,
    defaultTransitionLaw: 'soft_crossfade',
    atmosphereFamilyHints: ['atmo-curious-aperture'],
    playFamilyHints: ['focus-centering-glow', 'focus-hearth-hold'],
    sourceFamilies: [
      { familyId: 'focus-centering-glow', weight: 0.62, channelRoles: ['bed_main', 'bed_texture'] },
      { familyId: 'focus-hearth-hold', weight: 0.38, channelRoles: ['bed_low', 'transition_fx'] },
    ],
  },
  embodied_precision: {
    sceneId: 'embodied_precision',
    label: 'Embodied Precision',
    description: 'A lightly kinetic support bed for action, form, and doing.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.44,
    motion01: 0.3,
    pulse01: 0.18,
    brightness01: 0.38,
    space01: 0.56,
    defaultTransitionLaw: 'tail_carry',
    atmosphereFamilyHints: ['atmo-embodied-precision'],
    playFamilyHints: ['drive-rise-up-current', 'focus-centering-glow'],
    sourceFamilies: [
      { familyId: 'drive-rise-up-current', weight: 0.52, channelRoles: ['bed_low', 'transition_fx'] },
      { familyId: 'focus-centering-glow', weight: 0.48, channelRoles: ['bed_main', 'bed_texture'] },
    ],
  },
  constellation_drift: {
    sceneId: 'constellation_drift',
    label: 'Constellation Drift',
    description: 'An expansive but quiet topology layer for map and plot contexts.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.34,
    motion01: 0.18,
    pulse01: 0.05,
    brightness01: 0.22,
    space01: 0.86,
    defaultTransitionLaw: 'slow_bloom',
    atmosphereFamilyHints: ['atmo-constellation-drift'],
    playFamilyHints: ['drift-midnight-canopy', 'focus-hearth-hold'],
    sourceFamilies: [
      { familyId: 'drift-midnight-canopy', weight: 0.58, channelRoles: ['bed_main', 'bed_texture', 'transition_fx'] },
      { familyId: 'focus-hearth-hold', weight: 0.42, channelRoles: ['bed_low', 'bed_texture'] },
    ],
  },
  yielding_canopy: {
    sceneId: 'yielding_canopy',
    label: 'Yielding Canopy',
    description: 'A pre-roll frame that yields to foreground media without competing.',
    sourceKind: 'inherited',
    warmth01: 0.36,
    motion01: 0.1,
    pulse01: 0.04,
    brightness01: 0.22,
    space01: 0.7,
    defaultTransitionLaw: 'media_yield',
    atmosphereFamilyHints: ['atmo-yielding-canopy'],
    playFamilyHints: ['focus-hearth-hold', 'drift-midnight-canopy'],
    sourceFamilies: [
      { familyId: 'focus-hearth-hold', weight: 0.56, channelRoles: ['bed_low', 'bed_texture'] },
      { familyId: 'drift-midnight-canopy', weight: 0.44, channelRoles: ['bed_texture', 'transition_fx'] },
    ],
  },
  station_escalation: {
    sceneId: 'station_escalation',
    label: 'Station Escalation',
    description: 'The handoff layer from ambient product canopy into PLAY as an active station.',
    sourceKind: 'play_family_derivative',
    warmth01: 0.5,
    motion01: 0.36,
    pulse01: 0.24,
    brightness01: 0.4,
    space01: 0.72,
    defaultTransitionLaw: 'station_escalation',
    atmosphereFamilyHints: ['atmo-station-escalation'],
    playFamilyHints: ['focus-hearth-hold', 'drive-rise-up-current', 'drift-midnight-canopy'],
    sourceFamilies: [
      { familyId: 'focus-hearth-hold', weight: 0.4, channelRoles: ['bed_main', 'bed_texture'] },
      { familyId: 'drive-rise-up-current', weight: 0.32, channelRoles: ['bed_low', 'transition_fx'] },
      { familyId: 'drift-midnight-canopy', weight: 0.28, channelRoles: ['bed_texture', 'transition_fx'] },
    ],
  },
};

export const SURFACE_ATMOSPHERE_FAMILIES: Record<string, SurfaceAtmosphereFamilyContract> = {
  'atmo-atomic-canopy': {
    familyId: 'atmo-atomic-canopy',
    label: 'Atomic Canopy',
    sourceKind: 'atmosphere_original',
    deliveryStatus: 'dedicated_available',
    objectRoot: 'surface-atmosphere/families/atmo-atomic-canopy',
    intendedScenes: ['atomic_canopy'],
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'focus-lumen-corridor', 'focus-glass-corridor'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-reflective-chamber': {
    familyId: 'atmo-reflective-chamber',
    label: 'Reflective Chamber',
    sourceKind: 'atmosphere_original',
    deliveryStatus: 'dedicated_available',
    objectRoot: 'surface-atmosphere/families/atmo-reflective-chamber',
    intendedScenes: ['reflective_chamber'],
    fallbackPlayFamilyIds: ['focus-centering-glow', 'focus-hearth-hold'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-control-silence': {
    familyId: 'atmo-control-silence',
    label: 'Control Silence',
    sourceKind: 'inherited',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-control-silence',
    intendedScenes: ['control_silence'],
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'focus-centering-glow'],
    channelRoles: ['bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-held-corridor': {
    familyId: 'atmo-held-corridor',
    label: 'Held Corridor',
    sourceKind: 'atmosphere_original',
    deliveryStatus: 'dedicated_available',
    objectRoot: 'surface-atmosphere/families/atmo-held-corridor',
    intendedScenes: ['held_corridor'],
    fallbackPlayFamilyIds: ['focus-glass-corridor', 'focus-lumen-corridor'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-parasympathetic-exhale': {
    familyId: 'atmo-parasympathetic-exhale',
    label: 'Parasympathetic Exhale',
    sourceKind: 'atmosphere_original',
    deliveryStatus: 'dedicated_available',
    objectRoot: 'surface-atmosphere/families/atmo-parasympathetic-exhale',
    intendedScenes: ['parasympathetic_exhale'],
    fallbackPlayFamilyIds: ['drift-afterlight-sleep', 'drift-lantern-harbor', 'drift-midnight-canopy'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-quiet-line': {
    familyId: 'atmo-quiet-line',
    label: 'Quiet Line',
    sourceKind: 'play_family_derivative',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-quiet-line',
    intendedScenes: ['quiet_line'],
    fallbackPlayFamilyIds: ['focus-centering-glow', 'focus-hearth-hold'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture'],
  },
  'atmo-curious-aperture': {
    familyId: 'atmo-curious-aperture',
    label: 'Curious Aperture',
    sourceKind: 'play_family_derivative',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-curious-aperture',
    intendedScenes: ['curious_aperture'],
    fallbackPlayFamilyIds: ['focus-centering-glow', 'focus-hearth-hold'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-embodied-precision': {
    familyId: 'atmo-embodied-precision',
    label: 'Embodied Precision',
    sourceKind: 'play_family_derivative',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-embodied-precision',
    intendedScenes: ['embodied_precision'],
    fallbackPlayFamilyIds: ['drive-rise-up-current', 'focus-centering-glow'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-constellation-drift': {
    familyId: 'atmo-constellation-drift',
    label: 'Constellation Drift',
    sourceKind: 'play_family_derivative',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-constellation-drift',
    intendedScenes: ['constellation_drift'],
    fallbackPlayFamilyIds: ['drift-midnight-canopy', 'focus-hearth-hold'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-yielding-canopy': {
    familyId: 'atmo-yielding-canopy',
    label: 'Yielding Canopy',
    sourceKind: 'inherited',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-yielding-canopy',
    intendedScenes: ['yielding_canopy'],
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'drift-midnight-canopy'],
    channelRoles: ['bed_low', 'bed_texture', 'transition_fx'],
  },
  'atmo-station-escalation': {
    familyId: 'atmo-station-escalation',
    label: 'Station Escalation',
    sourceKind: 'play_family_derivative',
    deliveryStatus: 'fallback_live',
    objectRoot: 'surface-atmosphere/families/atmo-station-escalation',
    intendedScenes: ['station_escalation'],
    fallbackPlayFamilyIds: ['focus-hearth-hold', 'drive-rise-up-current', 'drift-midnight-canopy'],
    channelRoles: ['bed_main', 'bed_low', 'bed_texture', 'transition_fx'],
  },
};

export const SURFACE_ATMOSPHERE_MAP: Record<
  SurfaceAtmosphereSurfaceKey,
  SurfaceAtmosphereSceneId
> = {
  home: 'atomic_canopy',
  echo: 'reflective_chamber',
  link: 'control_silence',
  talk: 'held_corridor',
  rest: 'parasympathetic_exhale',
  read: 'quiet_line',
  know: 'quiet_line',
  insight: 'quiet_line',
  seek: 'curious_aperture',
  form: 'embodied_precision',
  action: 'embodied_precision',
  map: 'constellation_drift',
  plot: 'constellation_drift',
  tune: 'yielding_canopy',
  studio: 'yielding_canopy',
  play: 'station_escalation',
};

const SUPABASE_ASSET_PROXY_BASE = `https://${projectId}.supabase.co/functions/v1/asset-object`;

function deriveFamilyBand(familyId: string) {
  if (familyId.startsWith('drive-')) return 'drive';
  if (familyId.startsWith('drift-')) return 'drift';
  return 'focus';
}

function objectNameForRole(
  role: SurfaceAtmosphereChannelRole,
  format: 'm4a' | 'mp3',
) {
  if (role === 'transition_fx') {
    return `transition_fx--transition.${format}`;
  }
  return `${role}.${format}`;
}

function buildAudioProxyUrl(objectPath: string) {
  return `${SUPABASE_ASSET_PROXY_BASE}/audio?path=${encodeURIComponent(objectPath)}`;
}

function buildPlayFamilyChannelUrl(
  familyId: string,
  role: SurfaceAtmosphereChannelRole,
  format: 'm4a' | 'mp3' = 'm4a',
) {
  const band = deriveFamilyBand(familyId);
  const objectPath = `play/beds/${band}/${familyId}/${objectNameForRole(role, format)}`;
  return buildAudioProxyUrl(objectPath);
}

function buildDedicatedAtmosphereChannelUrl(
  family: SurfaceAtmosphereFamilyContract,
  role: SurfaceAtmosphereChannelRole,
  format: 'm4a' | 'mp3' = 'm4a',
) {
  const objectPath = `${family.objectRoot}/${objectNameForRole(role, format)}`;
  return buildAudioProxyUrl(objectPath);
}

function resolveVariant(
  intensity: SurfaceAtmosphereSettings['intensity'],
): SurfaceAtmosphereVariant {
  switch (intensity) {
    case 'immersive':
      return 'rich';
    case 'off':
      return 'reduced';
    case 'subtle':
    default:
      return 'primary';
  }
}

function scaleValue(value: number, variant: SurfaceAtmosphereVariant) {
  if (variant === 'reduced') return Math.max(0, value * 0.4);
  if (variant === 'rich') return Math.min(1, value * 1.18);
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
    case 'know':
      return 'know';
    case 'read':
      return 'read';
    case 'seek':
      return 'seek';
    case 'form':
      return 'form';
    case 'echo':
      return 'echo';
    case 'plot':
      return 'plot';
    case 'map':
      return 'map';
    case 'link':
      return 'link';
    case 'sync':
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
  if (pathname.startsWith('/surfaces')) return 'home';
  if (pathname.startsWith('/voice')) return 'talk';
  if (pathname.startsWith('/form')) return 'form';
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
  if (pathname.startsWith('/cues') || pathname.startsWith('/sync')) {
    return 'action';
  }
  if (pathname.startsWith('/rooms')) return 'map';
  if (pathname.startsWith('/components') || pathname.startsWith('/atoms')) {
    return 'know';
  }
  if (pathname.startsWith('/base')) return 'home';
  return 'home';
}

export function resolveSurfaceAtmosphereState(
  surfaceKey: SurfaceAtmosphereSurfaceKey,
  settings: SurfaceAtmosphereSettings = DEFAULT_SURFACE_ATMOSPHERE_SETTINGS,
): SurfaceAtmosphereResolvedState {
  const sceneId = settings.adaptToSurface
    ? SURFACE_ATMOSPHERE_MAP[surfaceKey]
    : SURFACE_ATMOSPHERE_MAP.home;
  const scene = SURFACE_ATMOSPHERE_SCENES[sceneId];
  const variant = resolveVariant(settings.enabled ? settings.intensity : 'off');

  return {
    surfaceKey,
    sceneId,
    label: scene.label,
    variant,
    sourceKind: scene.sourceKind,
    transitionLaw: scene.defaultTransitionLaw,
    atmosphereFamilyHints: scene.atmosphereFamilyHints,
    playFamilyHints: scene.playFamilyHints,
    sourceFamilies: scene.sourceFamilies,
    warmth01: scaleValue(scene.warmth01, variant),
    motion01: scaleValue(scene.motion01, variant),
    pulse01: scaleValue(scene.pulse01, variant),
    brightness01: scaleValue(scene.brightness01, variant),
    space01: scaleValue(scene.space01, variant),
  };
}

export function resolveSurfaceAtmosphereTransitionContract(
  fromSurface: SurfaceAtmosphereSurfaceKey,
  toSurface: SurfaceAtmosphereSurfaceKey,
): SurfaceAtmosphereTransitionContract {
  const from = SURFACE_ATMOSPHERE_SCENES[SURFACE_ATMOSPHERE_MAP[fromSurface]];
  const to = SURFACE_ATMOSPHERE_SCENES[SURFACE_ATMOSPHERE_MAP[toSurface]];

  let law: SurfaceAtmosphereTransitionLaw = 'soft_crossfade';
  if (to.sceneId === 'station_escalation') law = 'station_escalation';
  else if (to.sceneId === 'yielding_canopy') law = 'media_yield';
  else if (
    from.sceneId === 'parasympathetic_exhale' ||
    to.sceneId === 'parasympathetic_exhale'
  ) {
    law = 'slow_bloom';
  } else if (from.sceneId === 'held_corridor' || to.sceneId === 'held_corridor') {
    law = 'tail_carry';
  }

  switch (law) {
    case 'station_escalation':
      return { law, durationMs: 3200, tailCarryMs: 1200, bloomMs: 2200, duckToGain01: 0.52 };
    case 'media_yield':
      return { law, durationMs: 1600, tailCarryMs: 900, bloomMs: 900, duckToGain01: 0.34 };
    case 'slow_bloom':
      return { law, durationMs: 4200, tailCarryMs: 1800, bloomMs: 2600, duckToGain01: 0.6 };
    case 'tail_carry':
      return { law, durationMs: 2600, tailCarryMs: 1400, bloomMs: 1500, duckToGain01: 0.72 };
    case 'soft_crossfade':
    default:
      return { law: 'soft_crossfade', durationMs: 1800, tailCarryMs: 900, bloomMs: 1200, duckToGain01: 0.82 };
  }
}

function familySupportsRole(
  family: SurfaceAtmosphereSourceFamily,
  role: SurfaceAtmosphereChannelRole,
) {
  return family.channelRoles.includes(role);
}

function atmosphereFamilySupportsRole(
  family: SurfaceAtmosphereFamilyContract,
  role: SurfaceAtmosphereChannelRole,
) {
  return family.channelRoles.includes(role);
}

function familiesForRole(
  state: SurfaceAtmosphereResolvedState,
  role: SurfaceAtmosphereChannelRole,
) {
  return state.sourceFamilies.filter((family) => familySupportsRole(family, role));
}

function pickFamily<T extends { familyId: string }>(
  candidates: T[],
  index: number,
  avoidFamilyId?: string | null,
) {
  if (candidates.length === 0) return null;

  const normalizedIndex =
    ((index % candidates.length) + candidates.length) % candidates.length;
  let family = candidates[normalizedIndex] ?? null;

  if (
    family &&
    avoidFamilyId &&
    family.familyId === avoidFamilyId &&
    candidates.length > 1
  ) {
    family = candidates[(normalizedIndex + 1) % candidates.length] ?? family;
  }

  return family;
}

function preferredDedicatedFamiliesForRole(
  state: SurfaceAtmosphereResolvedState,
  role: SurfaceAtmosphereChannelRole,
) {
  return state.atmosphereFamilyHints
    .map((familyId) => SURFACE_ATMOSPHERE_FAMILIES[familyId] ?? null)
    .filter((family): family is SurfaceAtmosphereFamilyContract => Boolean(family))
    .filter(
      (family) =>
        family.deliveryStatus === 'dedicated_available' &&
        atmosphereFamilySupportsRole(family, role),
    );
}

function resolveDeckSpecForVariant(
  state: SurfaceAtmosphereResolvedState,
  variantIndex: number,
): SurfaceAtmosphereDeckSpec {
  const primaryCandidates = [
    ...familiesForRole(state, 'bed_texture'),
    ...familiesForRole(state, 'bed_main').filter(
      (family) => !familySupportsRole(family, 'bed_texture'),
    ),
  ];
  const dedicatedPrimaryCandidates = preferredDedicatedFamiliesForRole(
    state,
    'bed_texture',
  );
  const secondaryCandidates =
    state.variant === 'reduced'
      ? []
      : [
          ...familiesForRole(state, 'bed_low'),
          ...familiesForRole(state, 'bed_main').filter(
            (family) => !familySupportsRole(family, 'bed_low'),
          ),
        ];
  const dedicatedSecondaryCandidates =
    state.variant === 'reduced'
      ? []
      : preferredDedicatedFamiliesForRole(state, 'bed_low');
  const transitionCandidates = familiesForRole(state, 'transition_fx');
  const dedicatedTransitionCandidates = preferredDedicatedFamiliesForRole(
    state,
    'transition_fx',
  );

  const primaryDedicatedFamily = pickFamily(dedicatedPrimaryCandidates, variantIndex);
  const primaryFamily =
    pickFamily(primaryCandidates, variantIndex) ??
    state.sourceFamilies[0] ??
    null;
  const secondaryDedicatedFamily =
    dedicatedSecondaryCandidates.length === 0
      ? null
      : pickFamily(
          dedicatedSecondaryCandidates,
          variantIndex + 1,
          primaryDedicatedFamily?.familyId,
        );
  const secondaryFamily =
    secondaryCandidates.length === 0
      ? null
      : pickFamily(secondaryCandidates, variantIndex + 1, primaryFamily?.familyId);
  const transitionDedicatedFamily =
    dedicatedTransitionCandidates.length === 0
      ? null
      : pickFamily(
          dedicatedTransitionCandidates,
          variantIndex + 2,
          secondaryDedicatedFamily?.familyId ?? primaryDedicatedFamily?.familyId,
        );
  const transitionFamily =
    pickFamily(
      transitionCandidates,
      variantIndex + 2,
      secondaryFamily?.familyId ?? primaryFamily?.familyId,
    ) ??
    primaryFamily ??
    secondaryFamily ??
    null;

  const primaryRole: SurfaceAtmosphereChannelRole =
    primaryFamily && familySupportsRole(primaryFamily, 'bed_texture')
      ? 'bed_texture'
      : 'bed_main';

  const secondaryRole: SurfaceAtmosphereChannelRole | null = secondaryFamily
    ? familySupportsRole(secondaryFamily, 'bed_low')
      ? 'bed_low'
      : 'bed_main'
    : null;

  const primaryUrl = primaryFamily
    ? primaryDedicatedFamily
      ? buildDedicatedAtmosphereChannelUrl(primaryDedicatedFamily, primaryRole)
      : buildPlayFamilyChannelUrl(primaryFamily.familyId, primaryRole)
    : null;
  const secondaryUrl =
    secondaryFamily && secondaryRole
      ? secondaryDedicatedFamily
        ? buildDedicatedAtmosphereChannelUrl(secondaryDedicatedFamily, secondaryRole)
        : buildPlayFamilyChannelUrl(secondaryFamily.familyId, secondaryRole)
      : null;
  const transitionUrl = transitionFamily
    ? transitionDedicatedFamily
      ? buildDedicatedAtmosphereChannelUrl(transitionDedicatedFamily, 'transition_fx')
      : buildPlayFamilyChannelUrl(transitionFamily.familyId, 'transition_fx')
    : null;

  const primaryGain01 =
    state.variant === 'rich' ? 0.14 : state.variant === 'reduced' ? 0.045 : 0.085;
  const secondaryGain01 =
    state.variant === 'rich'
      ? Math.max(0.035, Math.min(0.1, 0.02 + state.pulse01 * 0.12))
      : state.variant === 'reduced'
        ? 0
        : Math.max(0.018, Math.min(0.055, 0.01 + state.motion01 * 0.08));
  const transitionGain01 = Math.max(0.02, Math.min(0.08, 0.02 + state.space01 * 0.05));
  const delivery =
    primaryDedicatedFamily || secondaryDedicatedFamily || transitionDedicatedFamily
      ? 'dedicated'
      : 'fallback';

  return {
    key: [
      state.surfaceKey,
      state.sceneId,
      state.variant,
      `v${variantIndex}`,
      primaryDedicatedFamily?.familyId ?? 'fallback',
      primaryFamily?.familyId ?? 'none',
      secondaryDedicatedFamily?.familyId ?? 'fallback',
      secondaryFamily?.familyId ?? 'none',
      transitionDedicatedFamily?.familyId ?? 'fallback',
      transitionFamily?.familyId ?? 'none',
    ].join('|'),
    surfaceKey: state.surfaceKey,
    sceneId: state.sceneId,
    variantIndex,
    alternateCount: 1,
    primaryUrl,
    secondaryUrl,
    transitionUrl,
    primaryGain01,
    secondaryGain01,
    transitionGain01,
    delivery,
  };
}

export function buildSurfaceAtmosphereDeckVariants(
  state: SurfaceAtmosphereResolvedState,
): SurfaceAtmosphereDeckSpec[] {
  const candidateCount = Math.min(
    3,
    Math.max(
      1,
      familiesForRole(state, 'bed_texture').length,
      familiesForRole(state, 'bed_main').length,
      familiesForRole(state, 'bed_low').length,
      familiesForRole(state, 'transition_fx').length,
      preferredDedicatedFamiliesForRole(state, 'bed_texture').length,
      preferredDedicatedFamiliesForRole(state, 'bed_low').length,
      preferredDedicatedFamiliesForRole(state, 'transition_fx').length,
    ),
  );

  const seen = new Set<string>();
  const variants: SurfaceAtmosphereDeckSpec[] = [];

  for (let index = 0; index < candidateCount * 2; index += 1) {
    const spec = resolveDeckSpecForVariant(state, index);
    const uniquenessKey = [
      spec.primaryUrl ?? 'none',
      spec.secondaryUrl ?? 'none',
      spec.transitionUrl ?? 'none',
    ].join('|');

    if (seen.has(uniquenessKey)) continue;
    seen.add(uniquenessKey);
    variants.push(spec);

    if (variants.length === candidateCount) break;
  }

  return variants.map((spec, index, all) => ({
    ...spec,
    variantIndex: index,
    alternateCount: all.length,
  }));
}
