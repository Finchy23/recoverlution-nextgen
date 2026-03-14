import type {
  EchoLinkCallbackResponse,
  EchoLinkProviderKey,
  EchoLinkStartResponse,
} from '@/runtime-services';
import { siteIntegrationConfig } from './config';
import { buildSupabaseFunctionHeaders } from './supabase-function-auth';

export interface StartEchoLinkConnectionInput {
  providerKey: EchoLinkProviderKey;
  individualId?: string;
  returnPath?: string;
  sourceSurface?: string;
}

export async function startEchoLinkConnection(
  input: StartEchoLinkConnectionInput,
): Promise<EchoLinkStartResponse> {
  if (!siteIntegrationConfig.echoLinkStartEndpoint) {
    throw new Error('No ECHO > LINK start endpoint configured');
  }

  const response = await fetch(siteIntegrationConfig.echoLinkStartEndpoint, {
    method: 'POST',
    headers: buildSupabaseFunctionHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      providerKey: input.providerKey,
      individualId: input.individualId,
      returnPath: input.returnPath,
      sourceSurface: input.sourceSurface,
    }),
  });

  if (!response.ok) {
    throw new Error(`ECHO > LINK start failed (${response.status})`);
  }

  return (await response.json()) as EchoLinkStartResponse;
}

export async function finalizeEchoLinkCallback(
  search:
    | string
    | URL
    | URLSearchParams
    | {
        providerKey?: EchoLinkProviderKey;
        stateToken?: string;
        transactionId?: string;
        code?: string;
        error?: string;
        errorDescription?: string;
        scope?: string;
      },
): Promise<EchoLinkCallbackResponse> {
  if (!siteIntegrationConfig.echoLinkCallbackEndpoint) {
    throw new Error('No ECHO > LINK callback endpoint configured');
  }

  const params =
    search instanceof URL
      ? search.searchParams
      : search instanceof URLSearchParams
        ? search
        : typeof search === 'string'
          ? new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
          : new URLSearchParams(
              Object.entries(search).flatMap(([key, value]) =>
                value ? [[key, value]] : [],
              ),
            );

  const response = await fetch(siteIntegrationConfig.echoLinkCallbackEndpoint, {
    method: 'POST',
    headers: buildSupabaseFunctionHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      providerKey: params.get('provider') ?? params.get('providerKey') ?? undefined,
      stateToken: params.get('state') ?? params.get('stateToken') ?? undefined,
      transactionId: params.get('transaction_id') ?? params.get('transactionId') ?? undefined,
      code: params.get('code') ?? undefined,
      error: params.get('error') ?? undefined,
      errorDescription: params.get('error_description') ?? params.get('errorDescription') ?? undefined,
      scope: params.get('scope') ?? undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`ECHO > LINK callback failed (${response.status})`);
  }

  return (await response.json()) as EchoLinkCallbackResponse;
}
