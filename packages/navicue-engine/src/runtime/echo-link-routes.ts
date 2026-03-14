import type {
  EchoLinkConnectHrefInput,
  EchoLinkProviderKey,
  EchoLinkProviderLaunch,
} from '@recoverlution/types';

export interface EchoLinkRouteConfig {
  startEndpoint?: string;
  providerStartUrls?: Partial<Record<EchoLinkProviderKey, string>>;
}

function buildQuery(params: Array<[string, string | undefined]>): string {
  const search = new URLSearchParams();
  for (const [key, value] of params) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function buildEchoLinkConnectHref(
  config: EchoLinkRouteConfig,
  input: EchoLinkConnectHrefInput,
): string {
  const explicitHref = config.providerStartUrls?.[input.providerKey];
  if (explicitHref) {
    try {
      const url = new URL(explicitHref);
      if (input.individualId) url.searchParams.set('individual_id', input.individualId);
      if (input.returnPath) url.searchParams.set('return_path', input.returnPath);
      if (input.sourceSurface) url.searchParams.set('source_surface', input.sourceSurface);
      return url.toString();
    } catch {
      return explicitHref;
    }
  }

  const startEndpoint = config.startEndpoint ?? '';
  if (!startEndpoint) return '';
  return `${startEndpoint}${buildQuery([
    ['provider', input.providerKey],
    ['individual_id', input.individualId],
    ['return_path', input.returnPath],
    ['source_surface', input.sourceSurface],
  ])}`;
}

export function buildEchoLinkProviderLaunches(
  config: EchoLinkRouteConfig,
  providers: readonly EchoLinkProviderKey[],
  input: Omit<EchoLinkConnectHrefInput, 'providerKey'>,
): EchoLinkProviderLaunch[] {
  return providers.map((providerKey) => ({
    providerKey,
    href: buildEchoLinkConnectHref(config, { ...input, providerKey }),
  }));
}
