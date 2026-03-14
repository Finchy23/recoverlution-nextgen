import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import {
  corsHeaders,
  headerContainsSignature,
  headerMap,
  hmacSha256Base64,
  json,
  optional,
  readRawBody,
  required,
  safeJsonParse,
} from '../_shared/console-core-provider-webhooks.ts';

interface CronofyChangePayload {
  notification?: {
    type?: string;
    changes_since?: string;
    triggered_at?: string;
  };
  channel?: {
    channel_id?: string;
    callback_url?: string;
  };
  scheduling_request?: {
    scheduling_request_id?: string;
    slot_selection?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = required('SUPABASE_URL');
    const serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
    const signingSecret = optional('CRONOFY_WEBHOOK_SIGNING_SECRET') || optional('CRONOFY_CLIENT_SECRET');
    const rawBody = await readRawBody(req);
    const payload = safeJsonParse<CronofyChangePayload>(rawBody);
    if (!payload) {
      return json({ error: 'Invalid JSON payload' }, 400);
    }

    const signatureHeader = req.headers.get('cronofy-hmac-sha256') ?? '';
    let verified = false;
    if (signingSecret && signatureHeader) {
      const digest = await hmacSha256Base64(signingSecret, rawBody);
      verified = headerContainsSignature(signatureHeader, digest);
    }

    const providerEventKind = payload.scheduling_request?.scheduling_request_id
      ? 'scheduling_request'
      : payload.notification?.type === 'change'
        ? 'change'
        : 'unknown';

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const cronofyChannelId = payload.channel?.channel_id ?? null;
    let localChannelId: string | null = null;
    let linkedProfessionalProfileId: string | null = null;
    let linkedOrganizationId: string | null = null;
    let linkedCalendarConnectionId: string | null = null;
    let linkedBookingLinkId: string | null = null;
    const eventTimestamp = payload.notification?.triggered_at ?? new Date().toISOString();
    const changesSince = payload.notification?.changes_since ?? null;
    const verificationFailed = Boolean(signingSecret) && !verified;
    const shouldQueue = Boolean(changesSince) || providerEventKind === 'scheduling_request';

    if (cronofyChannelId) {
      const { data: channel } = await supabase
        .from('cronofy_notification_channels')
        .select([
          'cronofy_notification_channel_id',
          'professional_profile_id',
          'organization_id',
          'professional_calendar_connection_id',
          'booking_link_id',
        ].join(', '))
        .eq('cronofy_channel_id', cronofyChannelId)
        .maybeSingle();
      localChannelId = channel?.cronofy_notification_channel_id ?? null;
      linkedProfessionalProfileId = channel?.professional_profile_id ?? null;
      linkedOrganizationId = channel?.organization_id ?? null;
      linkedCalendarConnectionId = channel?.professional_calendar_connection_id ?? null;
      linkedBookingLinkId = channel?.booking_link_id ?? null;

      await supabase
        .from('cronofy_notification_channels')
        .update({
          channel_status: verificationFailed ? 'attention' : 'active',
          last_notified_at: eventTimestamp,
          last_changes_since: changesSince,
          last_error_code: verificationFailed ? 'signature_verification_failed' : null,
          last_error_message:
            verificationFailed
              ? 'Cronofy webhook signature did not match the configured signing secret.'
              : null,
          updated_at: new Date().toISOString(),
        })
        .eq('cronofy_channel_id', cronofyChannelId);
    }

    if (changesSince && (linkedCalendarConnectionId || linkedBookingLinkId || linkedProfessionalProfileId || linkedOrganizationId)) {
      const scope = providerEventKind === 'scheduling_request' ? 'scheduling_request' : 'events';
      let cursorQuery = supabase
        .from('cronofy_sync_cursors')
        .update({
          last_changes_since: changesSince,
          latest_sync_status: verificationFailed ? 'attention' : 'queued',
          last_sync_at: eventTimestamp,
          last_error_code: verificationFailed ? 'signature_verification_failed' : null,
          last_error_message:
            verificationFailed
              ? 'Cronofy webhook signature did not match the configured signing secret.'
              : null,
          updated_at: new Date().toISOString(),
        })
        .eq('cursor_scope', scope);

      if (linkedCalendarConnectionId) {
        cursorQuery = cursorQuery.eq('professional_calendar_connection_id', linkedCalendarConnectionId);
      } else if (linkedBookingLinkId) {
        cursorQuery = cursorQuery.eq('booking_link_id', linkedBookingLinkId);
      } else if (linkedProfessionalProfileId) {
        cursorQuery = cursorQuery.eq('professional_profile_id', linkedProfessionalProfileId);
      } else if (linkedOrganizationId) {
        cursorQuery = cursorQuery.eq('organization_id', linkedOrganizationId);
      }

      await cursorQuery;
    }

    const { error: eventError } = await supabase.from('cronofy_webhook_events').insert({
      cronofy_notification_channel_id: localChannelId,
      cronofy_channel_id: cronofyChannelId,
      provider_event_kind: providerEventKind,
      changes_since: payload.notification?.changes_since ?? null,
      scheduling_request_id: payload.scheduling_request?.scheduling_request_id ?? null,
      verified,
      processed_status: shouldQueue ? 'queued' : 'received',
      event_headers: headerMap(req),
      payload,
      error_code: verificationFailed ? 'signature_verification_failed' : null,
      error_message:
        verificationFailed
          ? 'Cronofy webhook signature did not match the configured signing secret.'
          : null,
    });

    if (eventError) {
      return json({ error: eventError.message }, 500);
    }

    return json({
      ok: true,
      provider: 'cronofy',
      verified,
      eventKind: providerEventKind,
      queuedForSync: shouldQueue,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Cronofy webhook error';
    return json({ error: message }, 500);
  }
});
