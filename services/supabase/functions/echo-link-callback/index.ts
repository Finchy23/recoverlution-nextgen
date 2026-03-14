import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import {
  buildReturnUrl,
  corsHeaders,
  isProviderKey,
  json,
  normalizeReturnPath,
  parseCallbackInput,
  redirect,
  required,
  splitScopes,
  type EchoLinkProviderCatalogRow,
  type EchoLinkTransactionRow,
} from '../_shared/echo-link.ts';

function callbackStateFromInput(input: { error?: string; code?: string }) {
  if (input.error) return 'provider_error' as const;
  if (input.code) return 'provider_returned' as const;
  return 'manual_return' as const;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = required('SUPABASE_URL');
    const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
    const input = await parseCallbackInput(req);
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let transaction: EchoLinkTransactionRow | null = null;

    if (input.stateToken) {
      const { data } = await supabase
        .from('integration_connection_transactions')
        .select('integration_connection_transaction_id, individual_id, provider_key, auth_mode, launch_mode, transaction_status, state_token, return_path, source_surface, redirect_uri, provider_launch_url, expires_at')
        .eq('state_token', input.stateToken)
        .maybeSingle();
      transaction = (data as EchoLinkTransactionRow | null) ?? null;
    } else if (input.transactionId) {
      const { data } = await supabase
        .from('integration_connection_transactions')
        .select('integration_connection_transaction_id, individual_id, provider_key, auth_mode, launch_mode, transaction_status, state_token, return_path, source_surface, redirect_uri, provider_launch_url, expires_at')
        .eq('integration_connection_transaction_id', input.transactionId)
        .maybeSingle();
      transaction = (data as EchoLinkTransactionRow | null) ?? null;
    }

    if (!transaction) {
      const returnPath = normalizeReturnPath(undefined);
      const response = {
        ok: true as const,
        callbackState: 'missing_transaction' as const,
        nextAction: 'retry_provider_connect' as const,
        returnPath,
        redirectHref: buildReturnUrl(returnPath, [
          ['callback_state', 'missing_transaction'],
          ['provider', input.providerKey],
        ]),
        detail: 'Provider returned without a recoverable LINK transaction envelope.',
      };
      if (req.method === 'GET') return redirect(response.redirectHref);
      return json(response, 404);
    }

    const now = new Date();
    const expired = new Date(transaction.expires_at).getTime() < now.getTime();
    const providerMismatch = input.providerKey && isProviderKey(input.providerKey) && input.providerKey !== transaction.provider_key;
    const callbackState = expired
      ? 'expired_transaction'
      : providerMismatch
        ? 'provider_mismatch'
        : callbackStateFromInput(input);

    const returnPath = normalizeReturnPath(transaction.return_path);

    const { data: provider } = await supabase
      .from('integration_provider_catalog')
      .select('provider_key, display_name, auth_mode, supported_scopes, signal_types')
      .eq('provider_key', transaction.provider_key)
      .maybeSingle();

    const providerRow = provider as EchoLinkProviderCatalogRow | null;

    const accountStatus =
      callbackState === 'provider_error'
        ? 'attention'
        : callbackState === 'provider_returned'
          ? 'pending'
          : callbackState === 'manual_return'
            ? 'pending'
            : 'attention';
    const transactionStatus =
      callbackState === 'provider_returned' || callbackState === 'manual_return'
        ? 'provider_returned'
        : callbackState === 'expired_transaction'
          ? 'expired'
          : 'attention';
    const nextAction =
      callbackState === 'provider_error' || callbackState === 'provider_mismatch' || callbackState === 'expired_transaction'
        ? 'retry_provider_connect'
        : callbackState === 'provider_returned'
          ? 'review_provider_setup'
          : 'return_to_link';

    const grantedScopes = splitScopes(input.scope).filter((scope) => (providerRow?.supported_scopes ?? []).includes(scope));
    const signalTypes = providerRow?.signal_types ?? [];

    await supabase
      .from('integration_connection_transactions')
      .update({
        transaction_status: transactionStatus,
        provider_callback_state: callbackState,
        provider_code_present: Boolean(input.code),
        error_code: input.error ?? (callbackState === 'expired_transaction' ? 'expired_transaction' : callbackState === 'provider_mismatch' ? 'provider_mismatch' : null),
        error_message:
          input.errorDescription ??
          (callbackState === 'expired_transaction'
            ? 'Provider returned after the transaction envelope had expired.'
            : callbackState === 'provider_mismatch'
              ? 'Provider returned against a different provider than the one that started the flow.'
              : null),
        returned_at: now.toISOString(),
        updated_at: now.toISOString(),
        meta: {
          callback_scope: grantedScopes,
          source: 'echo-link-callback',
        },
      })
      .eq('integration_connection_transaction_id', transaction.integration_connection_transaction_id);

    await supabase
      .from('integration_accounts')
      .upsert(
        {
          individual_id: transaction.individual_id,
          provider_key: transaction.provider_key,
          account_status: accountStatus,
          auth_mode: transaction.auth_mode,
          latest_sync_status: callbackState === 'provider_error' ? 'attention' : 'idle',
          last_error_code: input.error ?? (callbackState === 'expired_transaction' ? 'expired_transaction' : callbackState === 'provider_mismatch' ? 'provider_mismatch' : null),
          last_error_message:
            input.errorDescription ??
            (callbackState === 'provider_returned'
              ? 'Provider returned successfully. Token exchange and sync workers are not live yet, so LINK is holding this connection in pending.'
              : callbackState === 'manual_return'
                ? 'Native or manual bridge returned to LINK. Final bridge implementation is not live yet.'
                : callbackState === 'expired_transaction'
                  ? 'Provider returned after the transaction envelope had expired.'
                  : callbackState === 'provider_mismatch'
                    ? 'Provider returned against a different provider than the one that started the flow.'
                    : input.errorDescription ?? 'Provider returned an error.'),
          provider_profile: {
            callback_state: callbackState,
            callback_received_at: now.toISOString(),
            granted_scopes: grantedScopes,
            code_present: Boolean(input.code),
          },
          meta: {
            awaiting_token_exchange: callbackState === 'provider_returned',
            launch_mode: transaction.launch_mode,
            transaction_id: transaction.integration_connection_transaction_id,
          },
          updated_at: now.toISOString(),
        },
        { onConflict: 'individual_id,provider_key' },
      );

    if ((callbackState === 'provider_returned' || callbackState === 'manual_return') && signalTypes.length > 0) {
      const contractRows = signalTypes.map((signalType) => ({
        individual_id: transaction.individual_id,
        provider_key: transaction.provider_key,
        signal_type: signalType,
        contract_status: 'paused',
        freshness_tier: 'unknown',
        latest_sync_status: 'idle',
        payload_contract: {
          awaiting_sync_worker: true,
          transaction_id: transaction.integration_connection_transaction_id,
        },
        source_meta: {
          callback_state: callbackState,
        },
        updated_at: now.toISOString(),
      }));

      await supabase.from('external_signal_contracts').upsert(contractRows, {
        onConflict: 'individual_id,provider_key,signal_type',
      });
    }

    if (grantedScopes.length > 0) {
      const consentRows = grantedScopes.map((scope) => ({
        individual_id: transaction.individual_id,
        provider_key: transaction.provider_key,
        scope_id: scope,
        granted: true,
        granted_at: now.toISOString(),
        revoked_at: null,
        source_surface: transaction.source_surface ?? 'link',
        metadata: {
          transaction_id: transaction.integration_connection_transaction_id,
          callback_state: callbackState,
        },
        updated_at: now.toISOString(),
      }));

      await supabase.from('integration_consent').upsert(consentRows, {
        onConflict: 'individual_id,provider_key,scope_id',
      });
    }

    const response = {
      ok: true as const,
      providerKey: transaction.provider_key,
      callbackState,
      nextAction,
      transactionId: transaction.integration_connection_transaction_id,
      transactionStatus,
      accountStatus: accountStatus,
      returnPath,
      redirectHref: buildReturnUrl(returnPath, [
        ['provider', transaction.provider_key],
        ['transaction_id', transaction.integration_connection_transaction_id],
        ['callback_state', callbackState],
      ]),
      detail:
        callbackState === 'provider_returned'
          ? 'Provider returned successfully. LINK has preserved the connection state and is waiting for token exchange and sync plumbing.'
          : callbackState === 'manual_return'
            ? 'LINK has captured the return from a native or manual bridge.'
            : callbackState === 'expired_transaction'
              ? 'Provider returned after the LINK transaction envelope expired.'
              : callbackState === 'provider_mismatch'
                ? 'Provider returned against a different LINK transaction provider.'
                : input.errorDescription ?? 'Provider returned an error.',
    };

    if (req.method === 'GET') {
      return redirect(response.redirectHref);
    }

    return json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown echo-link callback error';
    return json({ error: message }, 500);
  }
});
