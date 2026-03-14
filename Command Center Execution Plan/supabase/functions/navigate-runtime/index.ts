import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

type NavigateMode = 'self_first' | 'support_first' | 'professional_first' | 'parallel';
type SupportRecipientTier = 'external_support' | 'member_support' | 'professional' | 'organization';

type SupportPingRequest = {
  individual_id?: string | null;
  support_contact_id?: string | null;
  reason_code?: string | null;
  context_payload?: Record<string, unknown> | null;
};

type SosRequest = {
  individual_id?: string | null;
  mode?: NavigateMode | null;
  reason_code?: string | null;
  note?: string | null;
  source_surface?: string | null;
  source_ref?: Record<string, unknown> | null;
  allow_external_support?: boolean;
  allow_professional?: boolean;
  allow_organization?: boolean;
};

const app = new Hono();
const FUNCTION_PREFIX = '/navigate-runtime';
const VERSION = '2026-03-07';

app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }),
);

function aliases(path: string): string[] {
  return [path, `${FUNCTION_PREFIX}${path}`];
}

function routeGet(path: string, handler: any) {
  for (const alias of aliases(path)) app.get(alias, handler);
}

function routePost(path: string, handler: any) {
  for (const alias of aliases(path)) app.post(alias, handler);
}

function envRequired(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function adminClient() {
  return createClient(envRequired('SUPABASE_URL'), envRequired('SUPABASE_SERVICE_ROLE_KEY'));
}

function asNullable(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function clampInt(
  value: string | null | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return Object.prototype.toString.call(error);
    }
  }
  return String(error);
}

function logError(scope: string, error: unknown) {
  console.error(`[navigate-runtime] ${scope}`, errorText(error));
}

function parseMode(value: string | null | undefined): NavigateMode {
  switch ((value ?? '').trim()) {
    case 'self_first':
    case 'professional_first':
    case 'parallel':
      return value as NavigateMode;
    case 'support_first':
    default:
      return 'support_first';
  }
}

function requiredIndividualId(
  fromQuery: string | null | undefined,
  fromBody?: string | null,
): string {
  const value = asNullable(fromBody) ?? asNullable(fromQuery);
  if (!value) throw new Error('Missing required individual_id');
  return value;
}

function maybeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function buildNotificationCopy(
  kind: 'support_ping' | 'escalation',
  params: {
    recipientName?: string | null;
    reasonCode?: string | null;
    deepLink?: string | null;
  },
) {
  if (kind === 'support_ping') {
    return {
      templateId: 'support_ping.in_app.v1',
      title: params.recipientName
        ? `Support line open: ${params.recipientName}`
        : 'Support is available',
      body: 'A support line is open. Take the easier route now.',
      deepLink: params.deepLink ?? '/navigate',
      priority: 'normal',
      category: 'support_ping',
      purpose: 'care',
      dataTier: 'tier1',
    };
  }

  return {
    templateId: 'escalation.in_app.navigate.v1',
    title: 'Support route activated',
    body: 'We opened the safest available route. Review the next move now.',
    deepLink: params.deepLink ?? '/navigate',
    priority: 'urgent',
    category: 'escalation',
    purpose: 'care',
    dataTier: 'tier1',
  };
}

async function queueOutbox(
  supabase: ReturnType<typeof adminClient>,
  payload: {
    audience: string;
    recipientProfileId?: string | null;
    professionalId?: string | null;
    organizationId?: string | null;
    channel: string;
    category: string;
    priority: string;
    templateId: string | null;
    title: string;
    body: string;
    deepLink: string | null;
    triggerSource: string;
    triggerRef: Record<string, unknown>;
    rationale?: Record<string, unknown>;
    purpose: string;
    dataTier: string;
    dedupeKey?: string | null;
    meta?: Record<string, unknown>;
  },
) {
  const { data, error } = await supabase
    .from('notifications_outbox')
    .insert({
      audience: payload.audience,
      recipient_profile_id: payload.recipientProfileId ?? null,
      professional_id: payload.professionalId ?? null,
      organization_id: payload.organizationId ?? null,
      channel: payload.channel,
      category: payload.category,
      priority: payload.priority,
      template_id: payload.templateId,
      rendered_title: payload.title,
      rendered_body: payload.body,
      deep_link: payload.deepLink,
      trigger_source: payload.triggerSource,
      trigger_ref: payload.triggerRef,
      rationale: payload.rationale ?? {},
      status: 'queued',
      purpose: payload.purpose,
      data_tier: payload.dataTier,
      meta: payload.meta ?? {},
      dedupe_key: payload.dedupeKey ?? null,
    })
    .select('id')
    .single();
  if (error) {
    const isDuplicate =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === '23505';
    if (isDuplicate && payload.recipientProfileId && payload.deepLink !== null) {
      const { data: existing, error: existingError } = await supabase
        .from('notifications_outbox')
        .select('id')
        .eq('recipient_profile_id', payload.recipientProfileId)
        .eq('channel', payload.channel)
        .eq('category', payload.category)
        .eq('deep_link', payload.deepLink)
        .eq('status', 'queued')
        .is('expires_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing?.id) return existing.id as string;
    }
    throw error;
  }
  return data.id as string;
}

async function queueInAppNotification(
  supabase: ReturnType<typeof adminClient>,
  payload: {
    outboxId?: string | null;
    individualId: string;
    category: string;
    priority: string;
    title: string;
    body: string;
    deepLink?: string | null;
  },
) {
  const { data, error } = await supabase
    .from('in_app_notifications')
    .insert({
      outbox_id: payload.outboxId ?? null,
      individual_id: payload.individualId,
      category: payload.category,
      priority: payload.priority,
      title: payload.title,
      body: payload.body,
      deep_link: payload.deepLink ?? null,
      is_read: false,
    })
    .select('id')
    .single();
  if (error) {
    const isDuplicate =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === '23505';
    if (isDuplicate && payload.outboxId) {
      const { data: existing, error: existingError } = await supabase
        .from('in_app_notifications')
        .select('id')
        .eq('outbox_id', payload.outboxId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing?.id) return existing.id as string;
    }
    throw error;
  }
  return data.id as string;
}

async function countRows(
  supabase: ReturnType<typeof adminClient>,
  tableOrView: string,
  column: string,
  filters: (query: any) => any,
): Promise<number> {
  let query = supabase.from(tableOrView).select(column, { head: true, count: 'exact' });
  query = filters(query);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function getManifest(supabase: ReturnType<typeof adminClient>, individualId: string) {
  const [
    queueItems,
    unreadNotifications,
    supportContacts,
    professionalLinks,
    organizationMemberships,
    connectedIntegrations,
    openRescue,
  ] = await Promise.all([
    countRows(supabase, 'user_feed_queue_store', 'id', (q) =>
      q.eq('individual_id', individualId).is('completed_at', null).is('skipped_at', null),
    ),
    countRows(supabase, 'v_notifications_inbox', 'id', (q) =>
      q.eq('individual_id', individualId).eq('is_read', false),
    ),
    countRows(supabase, 'v_support_contact_summary', 'support_contact_id', (q) =>
      q.eq('individual_id', individualId).eq('status', 'active'),
    ),
    countRows(supabase, 'v_professional_caseload', 'professional_id', (q) =>
      q.eq('individual_id', individualId).eq('status', 'active'),
    ),
    countRows(supabase, 'v_organization_roster', 'organization_id', (q) =>
      q.eq('individual_id', individualId).eq('membership_status', 'active'),
    ),
    countRows(supabase, 'v_external_signal_integration_health', 'provider_key', (q) =>
      q.eq('individual_id', individualId).eq('account_status', 'active'),
    ),
    countRows(supabase, 'v_back_on_track_guardrails', 'event_id', (q) =>
      q.eq('user_id', individualId).in('status', ['open', 'queued', 'acknowledged']),
    ),
  ]);

  return {
    modules: {
      compass: true,
      context: true,
      network: true,
      shared_room: true,
      inbox: true,
      rescue: true,
      sos: true,
    },
    counts: {
      queue_items: queueItems,
      unread_notifications: unreadNotifications,
      support_contacts: supportContacts,
      professional_links: professionalLinks,
      organization_memberships: organizationMemberships,
      connected_integrations: connectedIntegrations,
    },
    rescue: {
      back_on_track_open: openRescue > 0,
      sos_enabled: true,
      support_ping_enabled: supportContacts > 0,
    },
  };
}

async function getCompass(
  supabase: ReturnType<typeof adminClient>,
  individualId: string,
  limit: number,
) {
  const { data, error } = await supabase
    .from('user_feed_queue_store')
    .select(
      'id, item_kind, content_type, content_id, reason, scheduled_for, expires_at, priority, score, arousal_fit, context_tags, metadata',
    )
    .eq('individual_id', individualId)
    .is('completed_at', null)
    .is('skipped_at', null)
    .order('priority', { ascending: false })
    .order('score', { ascending: false, nullsFirst: false })
    .order('scheduled_for', { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;

  const cards = (data ?? []).map((row: any) => ({
    queue_id: row.id,
    item_kind: row.item_kind,
    content_type: row.content_type,
    content_id: row.content_id,
    reason: row.reason,
    scheduled_for: row.scheduled_for,
    expires_at: row.expires_at,
    priority: row.priority,
    score: row.score,
    arousal_fit: row.arousal_fit,
    context_tags: row.context_tags ?? [],
    metadata: row.metadata ?? {},
  }));

  const nextItem = cards[0] ?? null;
  return {
    headline: nextItem
      ? 'A low-friction next move is already waiting.'
      : 'The direction layer is quiet right now.',
    queue_summary: {
      pending_count: cards.length,
      high_priority_count: cards.filter(
        (item) => typeof item.priority === 'number' && item.priority >= 80,
      ).length,
      next_item: nextItem,
    },
    cards,
  };
}

async function getContext(supabase: ReturnType<typeof adminClient>, individualId: string) {
  const [
    { data: providers, error: providersError },
    { data: consentRows, error: consentError },
    { data: contractRows, error: contractError },
  ] = await Promise.all([
    supabase
      .from('v_external_signal_integration_health')
      .select(
        'provider_key, provider_domain, display_name, auth_mode, signal_types, supported_scopes, is_identity_provider, account_status, connected_at, last_sync_at, last_webhook_at, latest_sync_status, latest_sync_finished_at, events_7d, events_30d, last_event_at, attention_contract_count, error_contract_count, stale_contract_count',
      )
      .eq('individual_id', individualId)
      .order('provider_key', { ascending: true }),
    supabase
      .from('integration_consent')
      .select('provider_key, scope_id, granted')
      .eq('individual_id', individualId),
    supabase
      .from('external_signal_contracts')
      .select(
        'provider_key, signal_type, contract_status, freshness_tier, last_event_at, latest_sync_status, latest_sync_finished_at, events_7d, events_30d',
      )
      .eq('individual_id', individualId)
      .order('provider_key', { ascending: true }),
  ]);
  if (providersError) throw providersError;
  if (consentError) throw consentError;
  if (contractError) throw contractError;

  const consentMap = new Map<string, Record<string, boolean>>();
  for (const row of consentRows ?? []) {
    const scopeMap = consentMap.get(row.provider_key) ?? {};
    scopeMap[row.scope_id] = !!row.granted;
    consentMap.set(row.provider_key, scopeMap);
  }

  const contractMap = new Map<string, Array<Record<string, unknown>>>();
  for (const row of contractRows ?? []) {
    const providerContracts = contractMap.get(row.provider_key) ?? [];
    providerContracts.push({
      signal_type: row.signal_type,
      contract_status: row.contract_status,
      freshness_tier: row.freshness_tier,
      last_event_at: row.last_event_at,
      latest_sync_status: row.latest_sync_status,
      latest_sync_finished_at: row.latest_sync_finished_at,
      events_7d: row.events_7d,
      events_30d: row.events_30d,
    });
    contractMap.set(row.provider_key, providerContracts);
  }

  const connectedProviders = (providers ?? []).map((row: any) => ({
    provider_key: row.provider_key,
    provider_domain: row.provider_domain,
    display_name: row.display_name,
    auth_mode: row.auth_mode,
    signal_types: row.signal_types ?? [],
    supported_scopes: row.supported_scopes ?? [],
    is_identity_provider: !!row.is_identity_provider,
    status: row.account_status,
    connected_at: row.connected_at,
    last_sync_at: row.last_sync_at,
    last_webhook_at: row.last_webhook_at,
    latest_sync_status: row.latest_sync_status,
    latest_sync_finished_at: row.latest_sync_finished_at,
    events_7d: row.events_7d,
    events_30d: row.events_30d,
    last_event_at: row.last_event_at,
    consent: consentMap.get(row.provider_key) ?? {},
    contracts: contractMap.get(row.provider_key) ?? [],
  }));

  const pressureHints = connectedProviders.flatMap((provider: any) => {
    const hints: string[] = [];
    if (provider.latest_sync_status && provider.latest_sync_status !== 'success')
      hints.push(`${provider.provider_key}_sync_attention`);
    if ((provider.events_7d ?? 0) === 0) hints.push(`${provider.provider_key}_quiet`);
    for (const contract of provider.contracts ?? []) {
      if (
        contract.contract_status === 'attention' ||
        contract.contract_status === 'error' ||
        contract.contract_status === 'stale'
      ) {
        hints.push(`${provider.provider_key}_${contract.signal_type}_${contract.contract_status}`);
      }
    }
    return hints;
  });

  return {
    connected_providers: connectedProviders,
    pressure_hints: Array.from(new Set(pressureHints)),
  };
}

async function getNetwork(supabase: ReturnType<typeof adminClient>, individualId: string) {
  const [
    { data: supportContacts, error: supportError },
    { data: professionals, error: professionalsError },
    { data: organizations, error: organizationsError },
  ] = await Promise.all([
    supabase
      .from('v_support_contact_summary')
      .select(
        'support_contact_id, display_name, relationship_label, tier, status, is_platform_user, linked_profile_id, allowed_purposes, channels',
      )
      .eq('individual_id', individualId)
      .eq('status', 'active')
      .order('display_name', { ascending: true }),
    supabase
      .from('v_professional_caseload')
      .select(
        'professional_id, professional_name, status, consent_scope, organization_id, organization_name, started_at, ended_at',
      )
      .eq('individual_id', individualId)
      .eq('status', 'active')
      .order('professional_name', { ascending: true }),
    supabase
      .from('v_organization_roster')
      .select(
        'organization_id, organization_name, organization_type, member_roles, membership_status',
      )
      .eq('individual_id', individualId)
      .eq('membership_status', 'active')
      .order('organization_name', { ascending: true }),
  ]);
  if (supportError) throw supportError;
  if (professionalsError) throw professionalsError;
  if (organizationsError) throw organizationsError;

  return {
    self: { individual_id: individualId },
    support_contacts: (supportContacts ?? []).map((row: any) => ({
      support_contact_id: row.support_contact_id,
      display_name: row.display_name,
      relationship_label: row.relationship_label,
      tier: row.tier,
      status: row.status,
      is_platform_user: row.is_platform_user,
      linked_profile_id: row.linked_profile_id,
      consent_scope: row.allowed_purposes ?? [],
      available_actions: maybeArray<string>(row.allowed_purposes).filter((purpose) =>
        ['support_ping', 'sos_contact', 'wellbeing_check', 'shared_room'].includes(purpose),
      ),
      channels: row.channels ?? [],
    })),
    professionals: (professionals ?? []).map((row: any) => ({
      professional_id: row.professional_id,
      display_name: row.professional_name,
      status: row.status,
      consent_scope: row.consent_scope ?? [],
      organization_id: row.organization_id,
      organization_name: row.organization_name,
      started_at: row.started_at,
      ended_at: row.ended_at,
      available_actions: ['shared_room', 'continuity_summary', 'back_on_track_alert'],
    })),
    organizations: (organizations ?? []).map((row: any) => ({
      organization_id: row.organization_id,
      name: row.organization_name,
      organization_type: row.organization_type,
      member_roles: row.member_roles ?? [],
      status: row.membership_status,
      available_actions: ['view_membership', 'org_safe_continuity'],
    })),
  };
}

async function getSharedRoom(supabase: ReturnType<typeof adminClient>, individualId: string) {
  const [
    { data: professionals, error: professionalsError },
    { data: organizations, error: organizationsError },
    { data: continuityItems, error: continuityError },
  ] = await Promise.all([
    supabase
      .from('v_professional_caseload')
      .select(
        'professional_id, professional_name, organization_id, organization_name, consent_scope, status',
      )
      .eq('individual_id', individualId)
      .eq('status', 'active'),
    supabase
      .from('v_organization_roster')
      .select(
        'organization_id, organization_name, organization_type, member_roles, membership_status',
      )
      .eq('individual_id', individualId)
      .eq('membership_status', 'active'),
    supabase
      .from('v_notifications_inbox')
      .select('id, category, title, body, deep_link, created_at')
      .eq('individual_id', individualId)
      .in('category', ['appointment_prep', 'appointment_followup', 'scene_prompt', 'support_ping'])
      .order('created_at', { ascending: false })
      .limit(6),
  ]);
  if (professionalsError) throw professionalsError;
  if (organizationsError) throw organizationsError;
  if (continuityError) throw continuityError;

  return {
    professionals: professionals ?? [],
    organizations: organizations ?? [],
    continuity_cards: (continuityItems ?? []).map((row: any) => ({
      kind: row.category,
      title: row.title,
      body: row.body,
      deep_link: row.deep_link,
      created_at: row.created_at,
    })),
  };
}

async function getInbox(
  supabase: ReturnType<typeof adminClient>,
  individualId: string,
  limit: number,
  offset: number,
) {
  const { data, error, count } = await supabase
    .from('v_notifications_inbox')
    .select('id, category, priority, title, body, deep_link, is_read, read_at, created_at', {
      count: 'exact',
    })
    .eq('individual_id', individualId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;

  return {
    unread_count: (data ?? []).filter((row: any) => row.is_read === false).length,
    total: count ?? 0,
    items: data ?? [],
  };
}

async function getRescue(supabase: ReturnType<typeof adminClient>, individualId: string) {
  const { data, error } = await supabase
    .from('v_back_on_track_guardrails')
    .select(
      'event_id, signal_date, triggered_at, energy_delta, clarity_delta, anchorage_delta, composite_load_index, trigger_reason, rescue_route, status, notification_queued, updated_at',
    )
    .eq('user_id', individualId)
    .order('triggered_at', { ascending: false })
    .limit(5);
  if (error) throw error;

  return {
    open_event:
      (data ?? []).find((row: any) => ['open', 'queued', 'acknowledged'].includes(row.status)) ??
      null,
    recent_events: data ?? [],
  };
}

async function getActivePolicy(supabase: ReturnType<typeof adminClient>, individualId: string) {
  const { data, error } = await supabase
    .from('support_escalation_policies')
    .select(
      'escalation_policy_id, mode, allow_external_support, allow_professional, allow_organization',
    )
    .eq('individual_id', individualId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

async function createSupportPing(
  supabase: ReturnType<typeof adminClient>,
  payload: SupportPingRequest,
) {
  const individualId = requiredIndividualId(null, payload.individual_id);
  const supportContactId = asNullable(payload.support_contact_id);
  const reasonCode = asNullable(payload.reason_code) ?? 'need_human_presence';
  if (!supportContactId) throw new Error('Missing required support_contact_id');

  const { data: contact, error: contactError } = await supabase
    .from('v_support_contact_summary')
    .select('support_contact_id, display_name, tier, allowed_purposes, channels')
    .eq('individual_id', individualId)
    .eq('support_contact_id', supportContactId)
    .eq('status', 'active')
    .maybeSingle();
  if (contactError) throw contactError;
  if (!contact) throw new Error('Support contact not found or not active');

  const purposes = maybeArray<string>(contact.allowed_purposes);
  if (
    !purposes.includes('support_ping') &&
    !purposes.includes('urgent_contact') &&
    !purposes.includes('sos_contact')
  ) {
    throw new Error('Support contact is not permitted for support ping');
  }

  const policy = await getActivePolicy(supabase, individualId);
  const mode = parseMode(policy?.mode ?? 'support_first');

  const { data: incident, error: incidentError } = await supabase
    .from('sos_incidents')
    .insert({
      individual_id: individualId,
      escalation_policy_id: policy?.escalation_policy_id ?? null,
      mode,
      reason_code: reasonCode,
      status: 'queued',
      source_surface: 'navigate_support_ping',
      source_ref: payload.context_payload ?? {},
      note: `Support ping for ${contact.display_name}`,
    })
    .select('sos_incident_id, mode, reason_code, status, created_at')
    .single();
  if (incidentError) throw incidentError;

  const primaryChannel = Array.isArray(contact.channels)
    ? (contact.channels.find((channel: any) => channel?.is_primary)?.channel ??
      contact.channels[0]?.channel ??
      null)
    : null;

  const { data: dispatch, error: dispatchError } = await supabase
    .from('sos_dispatch_events')
    .insert({
      sos_incident_id: incident.sos_incident_id,
      recipient_tier: contact.tier === 'member_support' ? 'member_support' : 'external_support',
      support_contact_id: supportContactId,
      channel: primaryChannel,
      dispatch_status: 'queued',
      payload: {
        reason_code: reasonCode,
        context_payload: payload.context_payload ?? {},
      },
    })
    .select('sos_dispatch_event_id, recipient_tier, channel, dispatch_status')
    .single();
  if (dispatchError) throw dispatchError;

  const selfNotification = buildNotificationCopy('support_ping', {
    recipientName: contact.display_name,
    deepLink:
      typeof payload.context_payload?.deep_link === 'string'
        ? String(payload.context_payload?.deep_link)
        : '/navigate',
  });
  const outboxId = await queueOutbox(supabase, {
    audience: 'user',
    recipientProfileId: individualId,
    channel: 'in_app',
    category: selfNotification.category,
    priority: selfNotification.priority,
    templateId: selfNotification.templateId,
    title: selfNotification.title,
    body: selfNotification.body,
    deepLink: selfNotification.deepLink,
    triggerSource: 'incident',
    triggerRef: {
      incident_id: incident.sos_incident_id,
      dispatch_event_id: dispatch.sos_dispatch_event_id,
      support_contact_id: supportContactId,
    },
    rationale: { reason_code: reasonCode, mode: incident.mode },
    purpose: selfNotification.purpose,
    dataTier: selfNotification.dataTier,
    dedupeKey: `navigate_support_ping:${incident.sos_incident_id}:self`,
    meta: { support_contact_name: contact.display_name },
  });
  const inboxId = await queueInAppNotification(supabase, {
    outboxId,
    individualId,
    category: selfNotification.category,
    priority: selfNotification.priority,
    title: selfNotification.title,
    body: selfNotification.body,
    deepLink: selfNotification.deepLink,
  });

  return {
    incident_id: incident.sos_incident_id,
    mode: incident.mode,
    recipient: {
      support_contact_id: supportContactId,
      display_name: contact.display_name,
      tier: contact.tier,
      channel: primaryChannel,
    },
    dispatch,
    notification: {
      outbox_id: outboxId,
      inbox_id: inboxId,
    },
  };
}

async function createSos(supabase: ReturnType<typeof adminClient>, payload: SosRequest) {
  const individualId = requiredIndividualId(null, payload.individual_id);
  const policy = await getActivePolicy(supabase, individualId);
  const mode = parseMode(payload.mode ?? policy?.mode ?? 'support_first');
  const reasonCode = asNullable(payload.reason_code) ?? 'acute_overload';
  const note = asNullable(payload.note);
  const allowExternalSupport =
    payload.allow_external_support ?? policy?.allow_external_support ?? true;
  const allowProfessional = payload.allow_professional ?? policy?.allow_professional ?? true;
  const allowOrganization = payload.allow_organization ?? policy?.allow_organization ?? false;

  const { data: incident, error: incidentError } = await supabase
    .from('sos_incidents')
    .insert({
      individual_id: individualId,
      escalation_policy_id: policy?.escalation_policy_id ?? null,
      mode,
      reason_code: reasonCode,
      status: 'queued',
      source_surface: asNullable(payload.source_surface) ?? 'navigate',
      source_ref: payload.source_ref ?? {},
      note,
    })
    .select('sos_incident_id, mode, reason_code, status, created_at')
    .single();
  if (incidentError) throw incidentError;

  const dispatches: any[] = [];
  const notifications: Array<Record<string, unknown>> = [];

  const selfEscalation = buildNotificationCopy('escalation', { deepLink: '/navigate' });
  const selfOutboxId = await queueOutbox(supabase, {
    audience: 'user',
    recipientProfileId: individualId,
    channel: 'in_app',
    category: selfEscalation.category,
    priority: selfEscalation.priority,
    templateId: selfEscalation.templateId,
    title: selfEscalation.title,
    body: selfEscalation.body,
    deepLink: selfEscalation.deepLink,
    triggerSource: 'incident',
    triggerRef: { reason_code: reasonCode, mode, individual_id: individualId },
    rationale: {
      allow_external_support: allowExternalSupport,
      allow_professional: allowProfessional,
      allow_organization: allowOrganization,
    },
    purpose: selfEscalation.purpose,
    dataTier: selfEscalation.dataTier,
    dedupeKey: `navigate_sos:${incident.sos_incident_id}:self`,
    meta: { incident_id: incident.sos_incident_id },
  });
  const selfInboxId = await queueInAppNotification(supabase, {
    outboxId: selfOutboxId,
    individualId,
    category: selfEscalation.category,
    priority: selfEscalation.priority,
    title: selfEscalation.title,
    body: selfEscalation.body,
    deepLink: selfEscalation.deepLink,
  });
  notifications.push({ audience: 'user', outbox_id: selfOutboxId, inbox_id: selfInboxId });

  if (allowExternalSupport) {
    const { data: supportContacts, error: supportError } = await supabase
      .from('v_support_contact_summary')
      .select('support_contact_id, display_name, tier, allowed_purposes, channels')
      .eq('individual_id', individualId)
      .eq('status', 'active');
    if (supportError) throw supportError;

    const eligible = (supportContacts ?? []).filter((row: any) =>
      maybeArray<string>(row.allowed_purposes).includes('sos_contact'),
    );
    for (const row of eligible) {
      const channel = Array.isArray(row.channels)
        ? (row.channels.find((item: any) => item?.is_primary)?.channel ??
          row.channels[0]?.channel ??
          null)
        : null;
      const { data, error } = await supabase
        .from('sos_dispatch_events')
        .insert({
          sos_incident_id: incident.sos_incident_id,
          recipient_tier: row.tier === 'member_support' ? 'member_support' : 'external_support',
          support_contact_id: row.support_contact_id,
          channel,
          dispatch_status: 'queued',
          payload: { reason_code: reasonCode },
        })
        .select(
          'sos_dispatch_event_id, recipient_tier, support_contact_id, channel, dispatch_status',
        )
        .single();
      if (error) throw error;
      dispatches.push(data);
      const outboxId = await queueOutbox(supabase, {
        audience: 'support',
        channel: channel ?? 'sms',
        category: 'escalation',
        priority: 'urgent',
        templateId: null,
        title: 'Support route activated',
        body: 'A support route has been activated. Please check in as soon as you can.',
        deepLink: null,
        triggerSource: 'incident',
        triggerRef: {
          incident_id: incident.sos_incident_id,
          dispatch_event_id: data.sos_dispatch_event_id,
          support_contact_id: row.support_contact_id,
        },
        rationale: { reason_code: reasonCode },
        purpose: 'care',
        dataTier: 'tier2',
        dedupeKey: `navigate_sos:${incident.sos_incident_id}:support:${row.support_contact_id}`,
        meta: { support_contact_name: row.display_name },
      });
      notifications.push({
        audience: 'support',
        recipient_tier: 'external_support',
        outbox_id: outboxId,
        support_contact_id: row.support_contact_id,
      });
    }
  }

  if (allowProfessional) {
    const { data: professionals, error: professionalsError } = await supabase
      .from('v_professional_caseload')
      .select('professional_id, professional_name')
      .eq('individual_id', individualId)
      .eq('status', 'active');
    if (professionalsError) throw professionalsError;

    for (const row of professionals ?? []) {
      const { data, error } = await supabase
        .from('sos_dispatch_events')
        .insert({
          sos_incident_id: incident.sos_incident_id,
          recipient_tier: 'professional',
          professional_id: row.professional_id,
          channel: 'in_app',
          dispatch_status: 'queued',
          payload: { reason_code: reasonCode },
        })
        .select('sos_dispatch_event_id, recipient_tier, professional_id, channel, dispatch_status')
        .single();
      if (error) throw error;
      dispatches.push(data);
      const outboxId = await queueOutbox(supabase, {
        audience: 'clinician',
        recipientProfileId: row.professional_id,
        professionalId: row.professional_id,
        channel: 'in_app',
        category: 'escalation',
        priority: 'urgent',
        templateId: 'escalation.in_app.navigate.v1',
        title: 'Support route activated',
        body: 'A patient support route has been activated. Review the next move now.',
        deepLink: '/navigate',
        triggerSource: 'incident',
        triggerRef: {
          incident_id: incident.sos_incident_id,
          dispatch_event_id: data.sos_dispatch_event_id,
          professional_id: row.professional_id,
        },
        rationale: { reason_code: reasonCode },
        purpose: 'care',
        dataTier: 'tier1',
        dedupeKey: `navigate_sos:${incident.sos_incident_id}:professional:${row.professional_id}`,
        meta: {},
      });
      const inboxId = await queueInAppNotification(supabase, {
        outboxId,
        individualId: row.professional_id,
        category: 'escalation',
        priority: 'urgent',
        title: 'Support route activated',
        body: 'A patient support route has been activated. Review the next move now.',
        deepLink: '/navigate',
      });
      notifications.push({
        audience: 'clinician',
        recipient_tier: 'professional',
        outbox_id: outboxId,
        inbox_id: inboxId,
        professional_id: row.professional_id,
      });
    }
  }

  if (allowOrganization) {
    const { data: organizations, error: organizationsError } = await supabase
      .from('v_organization_roster')
      .select('organization_id')
      .eq('individual_id', individualId)
      .eq('membership_status', 'active');
    if (organizationsError) throw organizationsError;

    const uniqueOrganizationIds = Array.from(
      new Set((organizations ?? []).map((row: any) => row.organization_id).filter(Boolean)),
    );
    for (const organizationId of uniqueOrganizationIds) {
      const { data, error } = await supabase
        .from('sos_dispatch_events')
        .insert({
          sos_incident_id: incident.sos_incident_id,
          recipient_tier: 'organization',
          organization_id: organizationId,
          channel: 'in_app',
          dispatch_status: 'queued',
          payload: { reason_code: reasonCode },
        })
        .select('sos_dispatch_event_id, recipient_tier, organization_id, channel, dispatch_status')
        .single();
      if (error) throw error;
      dispatches.push(data);
      const outboxId = await queueOutbox(supabase, {
        audience: 'organization',
        organizationId,
        channel: 'in_app',
        category: 'escalation',
        priority: 'urgent',
        templateId: 'escalation.in_app.navigate.v1',
        title: 'Support route activated',
        body: 'A support route requires organizational continuity review.',
        deepLink: '/navigate',
        triggerSource: 'incident',
        triggerRef: {
          incident_id: incident.sos_incident_id,
          dispatch_event_id: data.sos_dispatch_event_id,
          organization_id: organizationId,
        },
        rationale: { reason_code: reasonCode },
        purpose: 'care',
        dataTier: 'tier1',
        dedupeKey: `navigate_sos:${incident.sos_incident_id}:organization:${organizationId}`,
        meta: {},
      });
      notifications.push({
        audience: 'organization',
        outbox_id: outboxId,
        organization_id: organizationId,
      });
    }
  }

  return {
    incident_id: incident.sos_incident_id,
    mode: incident.mode,
    recipients: dispatches,
    notifications,
    next_surface: {
      kind: 'navicue',
      route: '/player',
    },
  };
}

routeGet('/health', async (c) => {
  try {
    return c.json({ ok: true, service: 'navigate-runtime', version: VERSION });
  } catch (error) {
    logError('health', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routeGet('/manifest', async (c) => {
  try {
    const individualId = requiredIndividualId(c.req.query('individual_id'));
    const supabase = adminClient();
    const manifest = await getManifest(supabase, individualId);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      individual_id: individualId,
      ...manifest,
      routes: {
        health: '/health',
        manifest: '/manifest?individual_id=:individual_id',
        compass: '/compass?individual_id=:individual_id',
        context: '/context?individual_id=:individual_id',
        network: '/network?individual_id=:individual_id',
        shared_room: '/shared-room?individual_id=:individual_id',
        inbox: '/inbox?individual_id=:individual_id',
        rescue: '/rescue?individual_id=:individual_id',
        support_ping: '/support/ping',
        sos: '/sos',
      },
    });
  } catch (error) {
    logError('manifest', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routeGet('/compass', async (c) => {
  try {
    const individualId = requiredIndividualId(c.req.query('individual_id'));
    const limit = clampInt(c.req.query('limit'), 12, 1, 50);
    const supabase = adminClient();
    const compass = await getCompass(supabase, individualId, limit);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      individual_id: individualId,
      compass,
    });
  } catch (error) {
    logError('compass', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routeGet('/context', async (c) => {
  try {
    const individualId = requiredIndividualId(c.req.query('individual_id'));
    const supabase = adminClient();
    const context = await getContext(supabase, individualId);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      individual_id: individualId,
      context,
    });
  } catch (error) {
    logError('context', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routeGet('/network', async (c) => {
  try {
    const individualId = requiredIndividualId(c.req.query('individual_id'));
    const supabase = adminClient();
    const network = await getNetwork(supabase, individualId);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      individual_id: individualId,
      network,
    });
  } catch (error) {
    logError('network', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routeGet('/shared-room', async (c) => {
  try {
    const individualId = requiredIndividualId(c.req.query('individual_id'));
    const supabase = adminClient();
    const sharedRoom = await getSharedRoom(supabase, individualId);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      individual_id: individualId,
      shared_room: sharedRoom,
    });
  } catch (error) {
    logError('shared-room', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routeGet('/inbox', async (c) => {
  try {
    const individualId = requiredIndividualId(c.req.query('individual_id'));
    const limit = clampInt(c.req.query('limit'), 20, 1, 100);
    const offset = clampInt(c.req.query('offset'), 0, 0, 10_000);
    const supabase = adminClient();
    const inbox = await getInbox(supabase, individualId, limit, offset);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      individual_id: individualId,
      inbox,
    });
  } catch (error) {
    logError('inbox', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routeGet('/rescue', async (c) => {
  try {
    const individualId = requiredIndividualId(c.req.query('individual_id'));
    const supabase = adminClient();
    const rescue = await getRescue(supabase, individualId);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      individual_id: individualId,
      rescue,
    });
  } catch (error) {
    logError('rescue', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routePost('/support/ping', async (c) => {
  try {
    const payload = (await c.req.json()) as SupportPingRequest;
    const supabase = adminClient();
    const supportPing = await createSupportPing(supabase, payload);
    return c.json({
      ok: true,
      service: 'navigate-runtime',
      version: VERSION,
      support_ping: supportPing,
    });
  } catch (error) {
    logError('support/ping', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

routePost('/sos', async (c) => {
  try {
    const payload = (await c.req.json()) as SosRequest;
    const supabase = adminClient();
    const sos = await createSos(supabase, payload);
    return c.json({ ok: true, service: 'navigate-runtime', version: VERSION, sos });
  } catch (error) {
    logError('sos', error);
    return c.json({ ok: false, error: errorText(error) }, 500);
  }
});

Deno.serve(app.fetch);
