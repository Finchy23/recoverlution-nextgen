export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export type EchoLinkProviderKey =
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
  | 'apple_music';

export type EchoLinkAuthMode = 'oauth' | 'native_aggregate' | 'device_bridge' | 'manual';
export type EchoLinkLaunchMode = 'redirect' | 'native_bridge' | 'device_bridge' | 'manual' | 'unconfigured';
export type EchoLinkTransactionStatus =
  | 'created'
  | 'launched'
  | 'provider_returned'
  | 'completed'
  | 'attention'
  | 'expired'
  | 'blocked'
  | 'cancelled';

export interface EchoLinkStartInput {
  providerKey?: string;
  individualId?: string;
  returnPath?: string;
  sourceSurface?: string;
}

export interface EchoLinkCallbackInput {
  providerKey?: string;
  stateToken?: string;
  transactionId?: string;
  code?: string;
  error?: string;
  errorDescription?: string;
  scope?: string;
}

export interface EchoLinkProviderCatalogRow {
  provider_key: EchoLinkProviderKey;
  display_name: string;
  auth_mode: EchoLinkAuthMode;
  supported_scopes: string[] | null;
  signal_types: string[] | null;
}

export interface EchoLinkTransactionRow {
  integration_connection_transaction_id: string;
  individual_id: string;
  provider_key: EchoLinkProviderKey;
  auth_mode: EchoLinkAuthMode;
  launch_mode: EchoLinkLaunchMode;
  transaction_status: EchoLinkTransactionStatus;
  state_token: string;
  return_path: string;
  source_surface: string | null;
  redirect_uri: string | null;
  provider_launch_url: string | null;
  expires_at: string;
}

const VALID_PROVIDERS = new Set<EchoLinkProviderKey>([
  'apple',
  'google',
  'healthkit',
  'health_connect',
  'oura',
  'whoop',
  'strava',
  'garmin',
  'coros',
  'screen_time',
  'focus_modes',
  'spotify',
  'apple_music',
]);

export function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export function optional(name: string): string {
  return Deno.env.get(name) ?? '';
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function redirect(location: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: {
      ...corsHeaders,
      Location: location,
    },
  });
}

export function isProviderKey(value: string | undefined | null): value is EchoLinkProviderKey {
  return Boolean(value && VALID_PROVIDERS.has(value as EchoLinkProviderKey));
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export async function parseStartInput(req: Request): Promise<EchoLinkStartInput> {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    return {
      providerKey: url.searchParams.get('provider') ?? undefined,
      individualId: url.searchParams.get('individual_id') ?? undefined,
      returnPath: url.searchParams.get('return_path') ?? undefined,
      sourceSurface: url.searchParams.get('source_surface') ?? undefined,
    };
  }

  const body = (await readJson<Record<string, unknown>>(req)) ?? {};
  return {
    providerKey: typeof body.providerKey === 'string' ? body.providerKey : typeof body.provider === 'string' ? body.provider : undefined,
    individualId: typeof body.individualId === 'string' ? body.individualId : typeof body.individual_id === 'string' ? body.individual_id : undefined,
    returnPath: typeof body.returnPath === 'string' ? body.returnPath : typeof body.return_path === 'string' ? body.return_path : undefined,
    sourceSurface: typeof body.sourceSurface === 'string' ? body.sourceSurface : typeof body.source_surface === 'string' ? body.source_surface : undefined,
  };
}

export async function parseCallbackInput(req: Request): Promise<EchoLinkCallbackInput> {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    return {
      providerKey: url.searchParams.get('provider') ?? undefined,
      stateToken: url.searchParams.get('state') ?? undefined,
      transactionId: url.searchParams.get('transaction_id') ?? undefined,
      code: url.searchParams.get('code') ?? undefined,
      error: url.searchParams.get('error') ?? undefined,
      errorDescription: url.searchParams.get('error_description') ?? undefined,
      scope: url.searchParams.get('scope') ?? undefined,
    };
  }

  const body = (await readJson<Record<string, unknown>>(req)) ?? {};
  return {
    providerKey: typeof body.providerKey === 'string' ? body.providerKey : typeof body.provider === 'string' ? body.provider : undefined,
    stateToken: typeof body.stateToken === 'string' ? body.stateToken : typeof body.state === 'string' ? body.state : undefined,
    transactionId: typeof body.transactionId === 'string' ? body.transactionId : typeof body.transaction_id === 'string' ? body.transaction_id : undefined,
    code: typeof body.code === 'string' ? body.code : undefined,
    error: typeof body.error === 'string' ? body.error : undefined,
    errorDescription:
      typeof body.errorDescription === 'string'
        ? body.errorDescription
        : typeof body.error_description === 'string'
          ? body.error_description
          : undefined,
    scope: typeof body.scope === 'string' ? body.scope : undefined,
  };
}

export function resolveDefaultReturnPath(): string {
  return normalizeReturnPath(optional('ECHO_LINK_DEFAULT_RETURN_PATH') || '/link');
}

export function normalizeReturnPath(input?: string | null): string {
  const value = (input ?? '').trim();
  if (!value) return resolveDefaultReturnPathFallback();
  if (!value.startsWith('/')) return resolveDefaultReturnPathFallback();
  if (value.startsWith('//')) return resolveDefaultReturnPathFallback();
  return value;
}

function resolveDefaultReturnPathFallback(): string {
  const envValue = (optional('ECHO_LINK_DEFAULT_RETURN_PATH') || '/link').trim();
  if (!envValue || !envValue.startsWith('/') || envValue.startsWith('//')) return '/link';
  return envValue;
}

export function resolveIndividualId(input?: string): string {
  const candidate = input?.trim() || optional('ECHO_LINK_DEFAULT_INDIVIDUAL_ID') || optional('COMPANION_BOOTSTRAP_INDIVIDUAL_ID');
  return candidate?.trim() || '';
}

export function buildFunctionBaseUrl(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1`;
}

export function buildCallbackUrl(supabaseUrl: string): string {
  return `${buildFunctionBaseUrl(supabaseUrl)}/echo-link-callback`;
}

export function buildReturnUrl(returnPath: string, params: Array<[string, string | undefined]>): string {
  const url = new URL(`https://recoverlution.local${normalizeReturnPath(returnPath)}`);
  for (const [key, value] of params) {
    if (value) url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}`;
}

export function getProviderAuthUrlEnvKey(providerKey: EchoLinkProviderKey): string {
  return `ECHO_LINK_${providerKey.toUpperCase()}_AUTH_URL`;
}

export function getProviderAuthorizeUrl(providerKey: EchoLinkProviderKey): string {
  return optional(getProviderAuthUrlEnvKey(providerKey));
}

export function buildProviderLaunchUrl(
  providerKey: EchoLinkProviderKey,
  callbackUrl: string,
  stateToken: string,
): string {
  const base = getProviderAuthorizeUrl(providerKey);
  if (!base) return '';
  try {
    const url = new URL(base);
    url.searchParams.set('state', stateToken);
    url.searchParams.set('redirect_uri', callbackUrl);
    return url.toString();
  } catch {
    return base;
  }
}

export function deriveLaunchMode(authMode: EchoLinkAuthMode, hasProviderUrl: boolean): EchoLinkLaunchMode {
  if (authMode === 'oauth') return hasProviderUrl ? 'redirect' : 'unconfigured';
  if (authMode === 'native_aggregate') return 'native_bridge';
  if (authMode === 'device_bridge') return 'device_bridge';
  return 'manual';
}

export function splitScopes(scope?: string | null): string[] {
  if (!scope) return [];
  return Array.from(new Set(scope.split(/[\s,]+/g).map((value) => value.trim()).filter(Boolean)));
}
