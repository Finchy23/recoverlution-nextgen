import { projectId as generatedProjectId, publicAnonKey as generatedAnonKey } from '@/utils/supabaseInfo';

export interface SiteIntegrationConfig {
  appEnv: string;
  supabaseProjectId: string;
  supabaseAnonKey: string;
  companionAuthMode: 'preview' | 'provider';
  companionAuthProviders: {
    email: boolean;
    google: boolean;
    apple: boolean;
  };
  companionAuthProviderStartUrls: {
    email: string;
    google: string;
    apple: string;
  };
  companionPrimaryIdentityProvider: 'google' | 'apple' | 'email' | 'manual';
  companionAuthRedirectPath: string;
  companionAuthPreviewSessionId: string;
  companionAuthPreviewOrigin: string;
  echoLinkEnabled: boolean;
  echoLinkStartEndpoint: string;
  echoLinkProviderStartUrls: Partial<Record<
    | 'apple'
    | 'google'
    | 'healthkit'
    | 'health_connect'
    | 'oura'
    | 'whoop'
    | 'strava'
    | 'garmin'
    | 'coros'
    | 'screen_time'
    | 'focus_modes'
    | 'spotify'
    | 'apple_music',
    string
  >>;
  echoLinkReturnPath: string;
  stripePublishableKey: string;
  stripePriceMonthly: string;
  stripePriceYearly: string;
  stripePriceLifetime: string;
  stripePaymentLinkMonthly: string;
  stripePaymentLinkYearly: string;
  stripePaymentLinkLifetime: string;
  stripeCheckoutSessionEndpoint: string;
  stripeCheckoutSessionConfirmEndpoint: string;
  companionBootstrapEndpoint: string;
  companionIdentityBindingEndpoint: string;
  stripeSuccessPath: string;
  stripeCancelPath: string;
  companionEntryUrl: string;
  companionBootstrapIndividualId: string;
  runtimePreviewIndividualId: string;
  runtimePreviewCaseId: string;
  runtimePreviewOrganizationId: string;
  jwPlayerLibraryId: string;
  assetResolverEndpoint: string;
  assetRuntimeObservationEndpoint: string;
  altitudeRuntimeEndpoint: string;
}

function env(key: string, fallback = ''): string {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  return value ?? fallback;
}

function envFlag(key: string, fallback = false): boolean {
  const value = env(key);
  if (!value) return fallback;
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

function buildSupabaseAuthorizeUrl(
  projectId: string,
  provider: 'google' | 'apple',
  explicitUrl: string,
): string {
  if (explicitUrl) return explicitUrl;
  if (!projectId) return '';
  return `https://${projectId}.supabase.co/auth/v1/authorize?provider=${provider}`;
}

const supabaseProjectId = env('VITE_SUPABASE_PROJECT_ID', generatedProjectId);
const supabaseFunctionBase = supabaseProjectId
  ? `https://${supabaseProjectId}.supabase.co/functions/v1`
  : '';
const companionAuthProviders = {
  email: envFlag('VITE_COMPANION_AUTH_EMAIL_ENABLED'),
  google: envFlag('VITE_COMPANION_AUTH_GOOGLE_ENABLED'),
  apple: envFlag('VITE_COMPANION_AUTH_APPLE_ENABLED'),
};

function resolvePrimaryIdentityProvider(): 'google' | 'apple' | 'email' | 'manual' {
  if (companionAuthProviders.google) return 'google';
  if (companionAuthProviders.apple) return 'apple';
  if (companionAuthProviders.email) return 'email';
  return 'manual';
}

export const siteIntegrationConfig: SiteIntegrationConfig = {
  appEnv: env('VITE_APP_ENV', import.meta.env.MODE || 'development'),
  supabaseProjectId,
  supabaseAnonKey: env('VITE_SUPABASE_ANON_KEY', generatedAnonKey),
  companionAuthMode: env('VITE_COMPANION_AUTH_MODE', 'preview') === 'provider' ? 'provider' : 'preview',
  companionAuthProviders,
  companionAuthProviderStartUrls: {
    email: env('VITE_COMPANION_AUTH_EMAIL_URL'),
    google: buildSupabaseAuthorizeUrl(
      supabaseProjectId,
      'google',
      env('VITE_COMPANION_AUTH_GOOGLE_URL'),
    ),
    apple: buildSupabaseAuthorizeUrl(
      supabaseProjectId,
      'apple',
      env('VITE_COMPANION_AUTH_APPLE_URL'),
    ),
  },
  companionPrimaryIdentityProvider: resolvePrimaryIdentityProvider(),
  companionAuthRedirectPath: env('VITE_COMPANION_AUTH_REDIRECT_PATH', '/auth/callback'),
  companionAuthPreviewSessionId: env('VITE_COMPANION_AUTH_PREVIEW_SESSION_ID', 'preview-session'),
  companionAuthPreviewOrigin: env('VITE_COMPANION_AUTH_PREVIEW_ORIGIN'),
  echoLinkEnabled: envFlag('VITE_ECHO_LINK_ENABLED'),
  echoLinkStartEndpoint: env(
    'VITE_ECHO_LINK_START_ENDPOINT',
    supabaseFunctionBase ? `${supabaseFunctionBase}/echo-link-start` : '',
  ),
  echoLinkProviderStartUrls: {
    apple: env('VITE_ECHO_LINK_APPLE_URL'),
    google: env('VITE_ECHO_LINK_GOOGLE_URL'),
    healthkit: env('VITE_ECHO_LINK_HEALTHKIT_URL'),
    health_connect: env('VITE_ECHO_LINK_HEALTH_CONNECT_URL'),
    oura: env('VITE_ECHO_LINK_OURA_URL'),
    whoop: env('VITE_ECHO_LINK_WHOOP_URL'),
    strava: env('VITE_ECHO_LINK_STRAVA_URL'),
    garmin: env('VITE_ECHO_LINK_GARMIN_URL'),
    coros: env('VITE_ECHO_LINK_COROS_URL'),
    screen_time: env('VITE_ECHO_LINK_SCREEN_TIME_URL'),
    focus_modes: env('VITE_ECHO_LINK_FOCUS_MODES_URL'),
    spotify: env('VITE_ECHO_LINK_SPOTIFY_URL'),
    apple_music: env('VITE_ECHO_LINK_APPLE_MUSIC_URL'),
  },
  echoLinkReturnPath: env('VITE_ECHO_LINK_RETURN_PATH', '/link'),
  stripePublishableKey: env('VITE_STRIPE_PUBLISHABLE_KEY'),
  stripePriceMonthly: env('VITE_STRIPE_PRICE_MONTHLY'),
  stripePriceYearly: env('VITE_STRIPE_PRICE_YEARLY'),
  stripePriceLifetime: env('VITE_STRIPE_PRICE_LIFETIME'),
  stripePaymentLinkMonthly: env('VITE_STRIPE_PAYMENT_LINK_MONTHLY'),
  stripePaymentLinkYearly: env('VITE_STRIPE_PAYMENT_LINK_YEARLY'),
  stripePaymentLinkLifetime: env('VITE_STRIPE_PAYMENT_LINK_LIFETIME'),
  stripeCheckoutSessionEndpoint: env(
    'VITE_STRIPE_CHECKOUT_SESSION_ENDPOINT',
    supabaseFunctionBase ? `${supabaseFunctionBase}/create-stripe-checkout-session` : '',
  ),
  stripeCheckoutSessionConfirmEndpoint: env(
    'VITE_STRIPE_CHECKOUT_SESSION_CONFIRM_ENDPOINT',
    supabaseFunctionBase ? `${supabaseFunctionBase}/confirm-stripe-checkout-session` : '',
  ),
  companionBootstrapEndpoint: env(
    'VITE_COMPANION_BOOTSTRAP_ENDPOINT',
    supabaseFunctionBase ? `${supabaseFunctionBase}/companion-bootstrap` : '',
  ),
  companionIdentityBindingEndpoint: env(
    'VITE_COMPANION_IDENTITY_BINDING_ENDPOINT',
    supabaseFunctionBase ? `${supabaseFunctionBase}/companion-bind-identity` : '',
  ),
  stripeSuccessPath: env('VITE_STRIPE_SUCCESS_PATH', '/enter'),
  stripeCancelPath: env('VITE_STRIPE_CANCEL_PATH', '/pricing'),
  companionEntryUrl: env('VITE_COMPANION_ENTRY_URL'),
  companionBootstrapIndividualId: env('VITE_COMPANION_BOOTSTRAP_INDIVIDUAL_ID'),
  runtimePreviewIndividualId: env(
    'VITE_RUNTIME_PREVIEW_INDIVIDUAL_ID',
    env('VITE_COMPANION_BOOTSTRAP_INDIVIDUAL_ID', '647fdb75-f5dd-435f-9554-0f4dc5399fd2'),
  ),
  runtimePreviewCaseId: env(
    'VITE_RUNTIME_PREVIEW_CASE_ID',
    env('VITE_RUNTIME_PREVIEW_INDIVIDUAL_ID', env('VITE_COMPANION_BOOTSTRAP_INDIVIDUAL_ID', '647fdb75-f5dd-435f-9554-0f4dc5399fd2')),
  ),
  runtimePreviewOrganizationId: env(
    'VITE_RUNTIME_PREVIEW_ORGANIZATION_ID',
    'recoverlution-core',
  ),
  jwPlayerLibraryId: env('VITE_JWPLAYER_LIBRARY_ID'),
  assetResolverEndpoint: env('VITE_ASSET_RESOLVER_ENDPOINT'),
  assetRuntimeObservationEndpoint: env(
    'VITE_ASSET_RUNTIME_OBSERVATION_ENDPOINT',
    supabaseFunctionBase ? `${supabaseFunctionBase}/log-asset-runtime-observation` : '',
  ),
  altitudeRuntimeEndpoint: env(
    'VITE_ALTITUDE_RUNTIME_ENDPOINT',
    supabaseFunctionBase ? `${supabaseFunctionBase}/altitude-runtime` : '',
  ),
};
