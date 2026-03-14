-- Professional Console / Organisational Core provider sync foundation
-- Date: 2026-03-14
-- Purpose: attach Cronofy and Stripe operational sync/webhook substrate to the
-- Console/Core foundation without making external providers the primary truth.

create table if not exists public.cronofy_notification_channels (
  cronofy_notification_channel_id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete cascade,
  professional_calendar_connection_id uuid references public.professional_calendar_connections(professional_calendar_connection_id) on delete cascade,
  booking_link_id uuid references public.booking_links(booking_link_id) on delete cascade,
  channel_scope text not null,
  channel_status text not null default 'pending',
  cronofy_channel_id text unique,
  callback_url text,
  callback_path text,
  verification_mode text not null default 'hmac',
  last_notified_at timestamptz,
  last_changes_since timestamptz,
  last_error_code text,
  last_error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (channel_scope in ('calendar_sync', 'availability_sync', 'scheduling_request')),
  check (channel_status in ('pending', 'active', 'attention', 'error', 'revoked')),
  check (verification_mode in ('hmac', 'none'))
);

create index if not exists idx_cronofy_notification_channels_professional_scope
  on public.cronofy_notification_channels (professional_profile_id, channel_scope, channel_status);

create index if not exists idx_cronofy_notification_channels_org_scope
  on public.cronofy_notification_channels (organization_id, channel_scope, channel_status);

create table if not exists public.cronofy_sync_cursors (
  cronofy_sync_cursor_id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete cascade,
  professional_calendar_connection_id uuid references public.professional_calendar_connections(professional_calendar_connection_id) on delete cascade,
  booking_link_id uuid references public.booking_links(booking_link_id) on delete cascade,
  cursor_scope text not null,
  cursor_status text not null default 'idle',
  cursor_value text,
  last_changes_since timestamptz,
  last_sync_at timestamptz,
  latest_sync_status text not null default 'idle',
  last_error_code text,
  last_error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cursor_scope in ('events', 'availability', 'scheduling_request')),
  check (cursor_status in ('idle', 'active', 'attention', 'error', 'paused')),
  check (latest_sync_status in ('idle', 'queued', 'syncing', 'success', 'attention', 'failed', 'stale'))
);

create index if not exists idx_cronofy_sync_cursors_professional_scope
  on public.cronofy_sync_cursors (professional_profile_id, cursor_scope, latest_sync_status);

create table if not exists public.cronofy_webhook_events (
  cronofy_webhook_event_id uuid primary key default gen_random_uuid(),
  cronofy_notification_channel_id uuid references public.cronofy_notification_channels(cronofy_notification_channel_id) on delete set null,
  cronofy_channel_id text,
  provider_event_kind text not null,
  changes_since timestamptz,
  scheduling_request_id text,
  verified boolean not null default false,
  processed_status text not null default 'received',
  event_headers jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  check (provider_event_kind in ('change', 'scheduling_request', 'unknown')),
  check (processed_status in ('received', 'queued', 'processed', 'ignored', 'failed'))
);

create index if not exists idx_cronofy_webhook_events_channel_received
  on public.cronofy_webhook_events (cronofy_channel_id, received_at desc);

create table if not exists public.billing_invoice_records (
  billing_invoice_record_id uuid primary key default gen_random_uuid(),
  billing_account_id uuid references public.billing_accounts(billing_account_id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete set null,
  appointment_session_id uuid references public.appointment_sessions(appointment_session_id) on delete set null,
  invoice_status text not null default 'draft',
  stripe_invoice_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  amount_due_minor integer not null default 0,
  amount_paid_minor integer not null default 0,
  currency text not null default 'usd',
  hosted_invoice_url text,
  invoice_pdf_url text,
  due_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (invoice_status in ('draft', 'open', 'paid', 'void', 'uncollectible', 'failed')),
  check (amount_due_minor >= 0),
  check (amount_paid_minor >= 0)
);

create index if not exists idx_billing_invoice_records_account_status
  on public.billing_invoice_records (billing_account_id, invoice_status, created_at desc);

create table if not exists public.payout_records (
  payout_record_id uuid primary key default gen_random_uuid(),
  billing_account_id uuid references public.billing_accounts(billing_account_id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete set null,
  payout_status text not null default 'pending',
  stripe_payout_id text unique,
  stripe_connected_account_id text,
  amount_minor integer not null default 0,
  currency text not null default 'usd',
  arrived_at timestamptz,
  failure_code text,
  failure_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (payout_status in ('pending', 'paid', 'failed', 'canceled')),
  check (amount_minor >= 0)
);

create index if not exists idx_payout_records_account_status
  on public.payout_records (billing_account_id, payout_status, created_at desc);

create table if not exists public.stripe_webhook_events (
  stripe_webhook_event_id uuid primary key default gen_random_uuid(),
  billing_account_id uuid references public.billing_accounts(billing_account_id) on delete set null,
  stripe_event_id text not null unique,
  stripe_account_id text,
  event_type text not null,
  livemode boolean not null default false,
  verified boolean not null default false,
  processed_status text not null default 'received',
  event_headers jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  check (processed_status in ('received', 'queued', 'processed', 'ignored', 'failed'))
);

create index if not exists idx_stripe_webhook_events_type_received
  on public.stripe_webhook_events (event_type, received_at desc);

drop view if exists public.v_console_core_provider_connection_health;
create view public.v_console_core_provider_connection_health as
select
  'calendar'::text as connection_class,
  c.organization_id,
  c.professional_profile_id,
  c.calendar_provider as provider_name,
  c.connection_status as connection_status,
  c.latest_sync_status,
  c.last_sync_at,
  c.last_error_code,
  c.last_error_message,
  count(distinct ch.cronofy_notification_channel_id)::int as aux_channel_count,
  count(distinct cur.cronofy_sync_cursor_id)::int as aux_cursor_count,
  max(ev.received_at) as last_webhook_at
from public.professional_calendar_connections c
left join public.cronofy_notification_channels ch
  on ch.professional_calendar_connection_id = c.professional_calendar_connection_id
left join public.cronofy_sync_cursors cur
  on cur.professional_calendar_connection_id = c.professional_calendar_connection_id
left join public.cronofy_webhook_events ev
  on ev.cronofy_notification_channel_id = ch.cronofy_notification_channel_id
group by
  c.organization_id,
  c.professional_profile_id,
  c.calendar_provider,
  c.connection_status,
  c.latest_sync_status,
  c.last_sync_at,
  c.last_error_code,
  c.last_error_message

union all

select
  'conference'::text as connection_class,
  c.organization_id,
  c.professional_profile_id,
  c.conference_provider as provider_name,
  c.connection_status as connection_status,
  c.latest_sync_status,
  c.last_sync_at,
  c.last_error_code,
  c.last_error_message,
  0::int as aux_channel_count,
  0::int as aux_cursor_count,
  null::timestamptz as last_webhook_at
from public.conference_provider_connections c

union all

select
  'billing'::text as connection_class,
  b.organization_id,
  b.professional_profile_id,
  b.billing_provider as provider_name,
  b.account_status as connection_status,
  null::text as latest_sync_status,
  null::timestamptz as last_sync_at,
  null::text as last_error_code,
  null::text as last_error_message,
  0::int as aux_channel_count,
  0::int as aux_cursor_count,
  max(e.received_at) as last_webhook_at
from public.billing_accounts b
left join public.stripe_webhook_events e
  on e.billing_account_id = b.billing_account_id
group by
  b.organization_id,
  b.professional_profile_id,
  b.billing_provider,
  b.account_status;

comment on view public.v_console_core_provider_connection_health is
  'Unified provider connection health view for Professional Console and Organisational Core across calendar, conference, and billing spines.';
