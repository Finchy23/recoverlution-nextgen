import type {
  EchoLinkConnectedProvider,
  EchoLinkDomain,
  EchoLinkDomainGroup,
  EchoLinkManifest,
  EchoLinkProviderContract,
  EchoLinkProviderKey,
} from '@recoverlution/types';

const DOMAIN_COPY: Record<EchoLinkDomain, { title: string; promptLine: string }> = {
  identity_gate: {
    title: 'Identity Gate',
    promptLine: 'Keep entry friction low when the nervous system is already carrying weight.',
  },
  biology: {
    title: 'To Read the Body',
    promptLine: 'Let the OS listen to the quiet rhythms of sleep, recovery, and baseline state.',
  },
  recovery: {
    title: 'To Read Recovery',
    promptLine: 'Attach the deeper recovery signals that show whether the body is under load or returning home.',
  },
  movement: {
    title: 'To Map the Movement',
    promptLine: 'Track how heavy energy is being metabolized through forward motion and exertion.',
  },
  attention: {
    title: 'To Measure the Noise',
    promptLine: 'Make cognitive drag visible before the mind has words for it.',
  },
  frequency: {
    title: 'To Anchor the Frequency',
    promptLine: 'Track the music and sonic posture the nervous system reaches for when it needs regulation.',
  },
};

export const ECHO_LINK_PROVIDER_CATALOG: readonly EchoLinkProviderContract[] = [
  {
    providerKey: 'apple',
    domain: 'identity_gate',
    displayName: 'Sign in with Apple',
    description: 'Private, low-friction identity binding for iOS and the companion shell.',
    authMode: 'oauth',
    signalTypes: ['identity'],
    supportedScopes: ['identity_basic'],
    isIdentityProvider: true,
  },
  {
    providerKey: 'google',
    domain: 'identity_gate',
    displayName: 'Sign in with Google',
    description: 'Low-friction identity binding for Android, web, and browser return flow.',
    authMode: 'oauth',
    signalTypes: ['identity'],
    supportedScopes: ['identity_basic'],
    isIdentityProvider: true,
  },
  {
    providerKey: 'healthkit',
    domain: 'biology',
    displayName: 'Apple Health',
    description: 'Steps, sleep, workouts, heart rate, and HRV through the Apple health aggregate.',
    authMode: 'native_aggregate',
    signalTypes: ['sleep', 'steps', 'workout', 'heart_rate', 'hrv'],
    supportedScopes: ['sleep', 'steps', 'workout', 'heart_rate', 'hrv'],
  },
  {
    providerKey: 'health_connect',
    domain: 'biology',
    displayName: 'Health Connect',
    description: 'Android health aggregate for sleep, workouts, steps, heart rate, and HRV.',
    authMode: 'native_aggregate',
    signalTypes: ['sleep', 'steps', 'workout', 'heart_rate', 'hrv'],
    supportedScopes: ['sleep', 'steps', 'workout', 'heart_rate', 'hrv'],
  },
  {
    providerKey: 'oura',
    domain: 'recovery',
    displayName: 'Oura',
    description: 'Sleep architecture, readiness, recovery, heart rate, and vagal-tone signals.',
    authMode: 'oauth',
    signalTypes: ['sleep', 'recovery', 'readiness', 'activity', 'heart_rate', 'hrv'],
    supportedScopes: ['sleep', 'recovery', 'readiness', 'activity', 'heart_rate', 'hrv'],
  },
  {
    providerKey: 'whoop',
    domain: 'recovery',
    displayName: 'Whoop',
    description: 'Strain, recovery, sleep, heart rate, and HRV for deeper load detection.',
    authMode: 'oauth',
    signalTypes: ['sleep', 'recovery', 'strain', 'activity', 'heart_rate', 'hrv'],
    supportedScopes: ['sleep', 'recovery', 'strain', 'activity', 'heart_rate', 'hrv'],
  },
  {
    providerKey: 'strava',
    domain: 'movement',
    displayName: 'Strava',
    description: 'Outdoor movement and exertion signals for forward momentum and kinetic discharge.',
    authMode: 'oauth',
    signalTypes: ['workout', 'activity', 'heart_rate'],
    supportedScopes: ['workout', 'activity', 'heart_rate'],
  },
  {
    providerKey: 'garmin',
    domain: 'movement',
    displayName: 'Garmin',
    description: 'Endurance telemetry for workouts, activity load, sleep, and heart rate trends.',
    authMode: 'oauth',
    signalTypes: ['workout', 'activity', 'sleep', 'heart_rate', 'hrv'],
    supportedScopes: ['workout', 'activity', 'sleep', 'heart_rate', 'hrv'],
  },
  {
    providerKey: 'coros',
    domain: 'movement',
    displayName: 'Coros',
    description: 'Endurance movement signals for workouts, activity load, and heart-rate effort.',
    authMode: 'oauth',
    signalTypes: ['workout', 'activity', 'heart_rate'],
    supportedScopes: ['workout', 'activity', 'heart_rate'],
  },
  {
    providerKey: 'screen_time',
    domain: 'attention',
    displayName: 'Screen Time',
    description: 'Digital load, pickup frequency, and attention drag signals from the device itself.',
    authMode: 'device_bridge',
    signalTypes: ['screen_time'],
    supportedScopes: ['screen_time'],
  },
  {
    providerKey: 'focus_modes',
    domain: 'attention',
    displayName: 'Focus Modes',
    description: 'Attention posture and interruption-state signals from device focus configuration.',
    authMode: 'device_bridge',
    signalTypes: ['focus_state'],
    supportedScopes: ['focus_state'],
  },
  {
    providerKey: 'spotify',
    domain: 'frequency',
    displayName: 'Spotify',
    description: 'Listening posture and musical frequency signals for ambient regulation learning.',
    authMode: 'oauth',
    signalTypes: ['music_activity', 'playback_state'],
    supportedScopes: ['music_activity', 'playback_state'],
  },
  {
    providerKey: 'apple_music',
    domain: 'frequency',
    displayName: 'Apple Music',
    description: 'Playback posture and listening-state signals for frequency-based regulation.',
    authMode: 'oauth',
    signalTypes: ['music_activity', 'playback_state'],
    supportedScopes: ['music_activity', 'playback_state'],
  },
] as const;

export const ECHO_LINK_PROVIDER_ORDER: readonly EchoLinkProviderKey[] = ECHO_LINK_PROVIDER_CATALOG.map(
  (provider) => provider.providerKey,
);

export function getEchoLinkProvider(providerKey: EchoLinkProviderKey): EchoLinkProviderContract | undefined {
  return ECHO_LINK_PROVIDER_CATALOG.find((provider) => provider.providerKey === providerKey);
}

export function buildEchoLinkDomainGroups(): EchoLinkDomainGroup[] {
  const grouped = new Map<EchoLinkDomain, EchoLinkProviderContract[]>();

  for (const provider of ECHO_LINK_PROVIDER_CATALOG) {
    const bucket = grouped.get(provider.domain) ?? [];
    bucket.push(provider);
    grouped.set(provider.domain, bucket);
  }

  return Object.entries(DOMAIN_COPY).map(([domain, copy]) => ({
    domain: domain as EchoLinkDomain,
    title: copy.title,
    promptLine: copy.promptLine,
    providers: grouped.get(domain as EchoLinkDomain) ?? [],
  }));
}

export function buildEchoLinkManifest(
  connectedProviders: readonly EchoLinkConnectedProvider[],
): EchoLinkManifest['link'] {
  const connectedKeys = new Set(
    connectedProviders.filter((provider) => provider.status === 'active').map((provider) => provider.providerKey),
  );

  const attentionCount = connectedProviders.filter(
    (provider) =>
      provider.status === 'attention' ||
      provider.status === 'error' ||
      provider.latestSyncStatus === 'attention' ||
      provider.latestSyncStatus === 'failed' ||
      provider.latestSyncStatus === 'stale',
  ).length;

  return {
    groups: buildEchoLinkDomainGroups(),
    connectedCount: connectedKeys.size,
    attentionCount,
    identityGateProviders: ['apple', 'google'],
  };
}
