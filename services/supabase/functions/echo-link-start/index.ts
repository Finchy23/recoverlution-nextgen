import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import {
  buildCallbackUrl,
  buildProviderLaunchUrl,
  buildReturnUrl,
  corsHeaders,
  deriveLaunchMode,
  isProviderKey,
  json,
  normalizeReturnPath,
  parseStartInput,
  redirect,
  required,
  resolveIndividualId,
  type EchoLinkProviderCatalogRow,
} from '../_shared/echo-link.ts';

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
    const input = await parseStartInput(req);

    if (!isProviderKey(input.providerKey)) {
      return json({ error: 'Missing or unsupported provider' }, 400);
    }

    const individualId = resolveIndividualId(input.individualId);
    if (!individualId) {
      return json({ error: 'Missing individual_id and no ECHO_LINK_DEFAULT_INDIVIDUAL_ID configured' }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: provider, error: providerError } = await supabase
      .from('integration_provider_catalog')
      .select('provider_key, display_name, auth_mode, supported_scopes, signal_types')
      .eq('provider_key', input.providerKey)
      .maybeSingle();

    const providerRow = provider as EchoLinkProviderCatalogRow | null;

    if (providerError || !providerRow) {
      return json({ error: providerError?.message ?? 'Provider is not configured in integration_provider_catalog' }, 404);
    }

    const returnPath = normalizeReturnPath(input.returnPath);
    const callbackUrl = buildCallbackUrl(supabaseUrl);
    const stateToken = crypto.randomUUID();
    const launchHref = buildProviderLaunchUrl(providerRow.provider_key, callbackUrl, stateToken);
    const launchMode = deriveLaunchMode(providerRow.auth_mode, Boolean(launchHref));
    const startState =
      launchMode === 'redirect'
        ? 'redirect_ready'
        : launchMode === 'native_bridge'
          ? 'native_bridge_required'
          : launchMode === 'device_bridge'
            ? 'device_bridge_required'
            : launchMode === 'manual'
              ? 'manual_required'
              : 'provider_unconfigured';
    const nextAction =
      launchMode === 'redirect'
        ? 'redirect_to_provider'
        : launchMode === 'native_bridge'
          ? 'open_native_bridge'
          : launchMode === 'device_bridge'
            ? 'open_device_bridge'
            : launchMode === 'manual'
              ? 'await_manual_link'
              : 'configure_provider';
    const transactionStatus = launchMode === 'redirect' ? 'launched' : launchMode === 'unconfigured' ? 'blocked' : 'created';
    const providerLaunchUrl = launchMode === 'redirect' ? launchHref : undefined;

    const { error: accountError } = await supabase
      .from('integration_accounts')
      .upsert(
        {
          individual_id: individualId,
          provider_key: providerRow.provider_key,
          account_status: launchMode === 'unconfigured' ? 'attention' : 'pending',
          auth_mode: providerRow.auth_mode,
          last_error_code: launchMode === 'unconfigured' ? 'provider_unconfigured' : null,
          last_error_message:
            launchMode === 'unconfigured'
              ? 'Provider auth URL is not configured yet. Complete the provider env contract before live launch.'
              : null,
          updated_at: new Date().toISOString(),
          meta: {
            source_surface: input.sourceSurface ?? 'link',
            start_state: startState,
            next_action: nextAction,
          },
        },
        { onConflict: 'individual_id,provider_key' },
      );

    if (accountError) {
      return json({ error: accountError.message }, 500);
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('integration_connection_transactions')
      .insert({
        individual_id: individualId,
        provider_key: providerRow.provider_key,
        auth_mode: providerRow.auth_mode,
        launch_mode: launchMode,
        transaction_status: transactionStatus,
        state_token: stateToken,
        return_path: returnPath,
        source_surface: input.sourceSurface ?? 'link',
        redirect_uri: callbackUrl,
        provider_launch_url: providerLaunchUrl ?? null,
        launched_at: launchMode === 'redirect' ? new Date().toISOString() : null,
        meta: {
          display_name: providerRow.display_name,
          supported_scopes: providerRow.supported_scopes ?? [],
          signal_types: providerRow.signal_types ?? [],
        },
      })
      .select('integration_connection_transaction_id')
      .single();

    if (transactionError || !transaction) {
      return json({ error: transactionError?.message ?? 'Failed to create integration connection transaction' }, 500);
    }

    const response = {
      ok: true as const,
      providerKey: providerRow.provider_key,
      authMode: providerRow.auth_mode,
      launchMode,
      transactionStatus,
      startState,
      nextAction,
      transactionId: transaction.integration_connection_transaction_id,
      stateToken,
      returnPath,
      callbackHref: callbackUrl,
      providerHref: providerLaunchUrl,
      detail:
        launchMode === 'unconfigured'
          ? 'Provider routing is scaffolded, but auth URL configuration is not live yet.'
          : launchMode === 'redirect'
            ? 'Provider launch is ready.'
            : 'This provider returns through the LINK bridge instead of a web OAuth redirect.',
    };

    if (req.method === 'GET') {
      if (launchMode === 'redirect' && providerLaunchUrl) {
        return redirect(providerLaunchUrl);
      }

      return redirect(
        buildReturnUrl(returnPath, [
          ['provider', providerRow.provider_key],
          ['transaction_id', transaction.integration_connection_transaction_id],
          ['callback_state', launchMode === 'unconfigured' ? 'provider_error' : 'manual_return'],
          ['launch_mode', launchMode],
        ]),
      );
    }

    return json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown echo-link start error';
    return json({ error: message }, 500);
  }
});
