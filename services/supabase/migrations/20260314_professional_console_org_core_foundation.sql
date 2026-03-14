-- Professional Console and Organisational Core foundation
-- Date: 2026-03-14
-- Purpose: establish the Recoverlution-owned operational substrate for
-- practitioner identity, org membership, scheduling, conferencing, booking,
-- billing, and appointment state before provider-specific sync workers go live.

create table if not exists public.professional_profiles (
  professional_profile_id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  primary_organization_id uuid references public.organizations(id) on delete set null,
  professional_status text not null default 'draft',
  intake_state text not null default 'unconfigured',
  display_name text,
  professional_role text,
  practice_name text,
  timezone text,
  cronofy_account_id text,
  stripe_customer_id text,
  stripe_connected_account_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (professional_status in ('draft', 'active', 'paused', 'retired')),
  check (intake_state in ('unconfigured', 'profile_ready', 'calendar_ready', 'billing_ready', 'live'))
);

create index if not exists idx_professional_profiles_primary_org_status
  on public.professional_profiles (primary_organization_id, professional_status);

create table if not exists public.organization_professional_memberships (
  organization_professional_membership_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(professional_profile_id) on delete cascade,
  membership_role text not null default 'practitioner',
  membership_status text not null default 'invited',
  scheduling_scope text not null default 'own',
  can_manage_clients boolean not null default false,
  can_manage_billing boolean not null default false,
  can_manage_reporting boolean not null default false,
  joined_at timestamptz,
  left_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, professional_profile_id),
  check (membership_role in ('owner', 'admin', 'operator', 'practitioner', 'viewer', 'billing_admin')),
  check (membership_status in ('invited', 'active', 'paused', 'revoked')),
  check (scheduling_scope in ('own', 'team', 'organization'))
);

create index if not exists idx_org_professional_memberships_org_status
  on public.organization_professional_memberships (organization_id, membership_status);

create table if not exists public.individual_professional_assignments (
  individual_professional_assignment_id uuid primary key default gen_random_uuid(),
  individual_id uuid not null references public.profiles(id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles(professional_profile_id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  assignment_role text not null default 'primary',
  assignment_status text not null default 'active',
  care_case_ref text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (assignment_role in ('primary', 'supporting', 'triage', 'covering')),
  check (assignment_status in ('active', 'paused', 'completed', 'revoked'))
);

create index if not exists idx_individual_professional_assignments_individual_status
  on public.individual_professional_assignments (individual_id, assignment_status, starts_at desc);

create index if not exists idx_individual_professional_assignments_professional_status
  on public.individual_professional_assignments (professional_profile_id, assignment_status, starts_at desc);

create table if not exists public.professional_calendar_connections (
  professional_calendar_connection_id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles(professional_profile_id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  orchestration_provider text not null default 'cronofy',
  calendar_provider text not null,
  connection_status text not null default 'pending',
  orchestration_account_ref text,
  external_account_ref text,
  external_calendar_ref text,
  is_primary boolean not null default false,
  auth_scopes text[] not null default '{}'::text[],
  last_sync_at timestamptz,
  latest_sync_status text not null default 'idle',
  last_error_code text,
  last_error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (orchestration_provider in ('cronofy')),
  check (calendar_provider in ('google_calendar', 'microsoft365', 'icloud')),
  check (connection_status in ('pending', 'active', 'paused', 'attention', 'error', 'revoked')),
  check (latest_sync_status in ('idle', 'queued', 'syncing', 'success', 'attention', 'failed', 'stale'))
);

create index if not exists idx_professional_calendar_connections_professional_status
  on public.professional_calendar_connections (professional_profile_id, connection_status, calendar_provider);

create unique index if not exists idx_professional_calendar_connections_unique_calendar
  on public.professional_calendar_connections (
    professional_profile_id,
    calendar_provider,
    coalesce(external_calendar_ref, 'default')
  );

create table if not exists public.organization_scheduling_settings (
  organization_scheduling_setting_id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  orchestration_provider text not null default 'cronofy',
  booking_mode text not null default 'individual',
  default_conference_provider text not null default 'none',
  default_duration_minutes integer not null default 50,
  min_notice_minutes integer not null default 60,
  buffer_before_minutes integer not null default 5,
  buffer_after_minutes integer not null default 5,
  allow_reschedule boolean not null default true,
  allow_cancel boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (orchestration_provider in ('cronofy')),
  check (booking_mode in ('individual', 'pooled', 'round_robin', 'service_line')),
  check (default_conference_provider in ('none', 'zoom', 'teams', 'google_meet')),
  check (default_duration_minutes > 0),
  check (min_notice_minutes >= 0),
  check (buffer_before_minutes >= 0),
  check (buffer_after_minutes >= 0)
);

create table if not exists public.conference_provider_connections (
  conference_provider_connection_id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete cascade,
  orchestration_provider text not null default 'cronofy',
  conference_provider text not null,
  connection_status text not null default 'pending',
  orchestration_account_ref text,
  external_account_ref text,
  last_sync_at timestamptz,
  latest_sync_status text not null default 'idle',
  last_error_code text,
  last_error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (orchestration_provider in ('cronofy')),
  check (conference_provider in ('zoom', 'teams', 'google_meet')),
  check (connection_status in ('pending', 'active', 'paused', 'attention', 'error', 'revoked')),
  check (latest_sync_status in ('idle', 'queued', 'syncing', 'success', 'attention', 'failed', 'stale')),
  check (
    (organization_id is not null and professional_profile_id is null)
    or (organization_id is null and professional_profile_id is not null)
  )
);

create index if not exists idx_conference_provider_connections_org
  on public.conference_provider_connections (organization_id, connection_status, conference_provider);

create index if not exists idx_conference_provider_connections_professional
  on public.conference_provider_connections (professional_profile_id, connection_status, conference_provider);

create table if not exists public.booking_links (
  booking_link_id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete cascade,
  link_status text not null default 'draft',
  booking_mode text not null default 'individual',
  slug text not null unique,
  title text not null,
  public_title text,
  description text,
  orchestration_provider text not null default 'cronofy',
  external_schedule_ref text,
  default_conference_provider text not null default 'none',
  duration_minutes integer not null default 50,
  payment_requirement text not null default 'none',
  payment_price_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (link_status in ('draft', 'active', 'paused', 'retired')),
  check (booking_mode in ('individual', 'pooled', 'round_robin', 'service_line')),
  check (orchestration_provider in ('cronofy')),
  check (default_conference_provider in ('none', 'zoom', 'teams', 'google_meet')),
  check (payment_requirement in ('none', 'optional', 'required', 'subscription_gate')),
  check (duration_minutes > 0),
  check (organization_id is not null or professional_profile_id is not null)
);

create index if not exists idx_booking_links_professional_status
  on public.booking_links (professional_profile_id, link_status);

create index if not exists idx_booking_links_organization_status
  on public.booking_links (organization_id, link_status);

create table if not exists public.billing_accounts (
  billing_account_id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete cascade,
  billing_owner_type text not null,
  billing_provider text not null default 'stripe',
  account_status text not null default 'draft',
  stripe_customer_id text,
  stripe_connected_account_id text,
  stripe_default_payment_method_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (billing_owner_type in ('organization', 'professional')),
  check (billing_provider in ('stripe')),
  check (account_status in ('draft', 'active', 'past_due', 'paused', 'closed', 'attention')),
  check (
    (billing_owner_type = 'organization' and organization_id is not null and professional_profile_id is null)
    or (billing_owner_type = 'professional' and organization_id is null and professional_profile_id is not null)
  )
);

create unique index if not exists idx_billing_accounts_unique_org
  on public.billing_accounts (organization_id)
  where organization_id is not null;

create unique index if not exists idx_billing_accounts_unique_professional
  on public.billing_accounts (professional_profile_id)
  where professional_profile_id is not null;

create table if not exists public.billing_subscriptions (
  billing_subscription_id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references public.billing_accounts(billing_account_id) on delete cascade,
  subscription_scope text not null,
  subscription_status text not null default 'incomplete',
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (subscription_scope in ('platform', 'organization_plan', 'professional_plan', 'booking_product')),
  check (subscription_status in ('trialing', 'active', 'past_due', 'paused', 'canceled', 'incomplete'))
);

create index if not exists idx_billing_subscriptions_account_status
  on public.billing_subscriptions (billing_account_id, subscription_status);

create table if not exists public.appointment_sessions (
  appointment_session_id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  professional_profile_id uuid not null references public.professional_profiles(professional_profile_id) on delete restrict,
  individual_id uuid not null references public.profiles(id) on delete restrict,
  booking_link_id uuid references public.booking_links(booking_link_id) on delete set null,
  assignment_id uuid references public.individual_professional_assignments(individual_professional_assignment_id) on delete set null,
  appointment_status text not null default 'scheduled',
  payment_status text not null default 'not_required',
  conference_status text not null default 'none',
  scheduling_provider text not null default 'cronofy',
  conference_provider text not null default 'none',
  external_schedule_ref text,
  external_calendar_event_ref text,
  external_conference_ref text,
  care_case_ref text,
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz not null,
  cancelled_at timestamptz,
  cancellation_reason text,
  rescheduled_from_id uuid references public.appointment_sessions(appointment_session_id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (appointment_status in ('draft', 'scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')),
  check (payment_status in ('not_required', 'unpaid', 'pending', 'paid', 'refunded', 'waived')),
  check (conference_status in ('none', 'pending', 'ready', 'updated', 'attention', 'failed', 'ended')),
  check (scheduling_provider in ('cronofy')),
  check (conference_provider in ('none', 'zoom', 'teams', 'google_meet')),
  check (scheduled_end_at > scheduled_start_at)
);

create index if not exists idx_appointment_sessions_professional_start
  on public.appointment_sessions (professional_profile_id, scheduled_start_at desc);

create index if not exists idx_appointment_sessions_individual_start
  on public.appointment_sessions (individual_id, scheduled_start_at desc);

create index if not exists idx_appointment_sessions_org_status_start
  on public.appointment_sessions (organization_id, appointment_status, scheduled_start_at desc);

create table if not exists public.appointment_attendees (
  appointment_attendee_id uuid primary key default gen_random_uuid(),
  appointment_session_id uuid not null references public.appointment_sessions(appointment_session_id) on delete cascade,
  attendee_kind text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  email text,
  display_name text,
  attendance_status text not null default 'invited',
  join_url text,
  host_url text,
  external_attendee_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (attendee_kind in ('individual', 'professional', 'organization_member', 'guest')),
  check (attendance_status in ('invited', 'accepted', 'declined', 'joined', 'no_show'))
);

create index if not exists idx_appointment_attendees_session_status
  on public.appointment_attendees (appointment_session_id, attendance_status);

create table if not exists public.appointment_change_log (
  appointment_change_log_id uuid primary key default gen_random_uuid(),
  appointment_session_id uuid not null references public.appointment_sessions(appointment_session_id) on delete cascade,
  change_kind text not null,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_role text,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (change_kind in ('created', 'rescheduled', 'cancelled', 'status_changed', 'conference_updated', 'payment_updated', 'notes_updated'))
);

create index if not exists idx_appointment_change_log_session_created
  on public.appointment_change_log (appointment_session_id, created_at desc);

create table if not exists public.payment_transactions (
  payment_transaction_id uuid primary key default gen_random_uuid(),
  billing_account_id uuid references public.billing_accounts(billing_account_id) on delete set null,
  appointment_session_id uuid references public.appointment_sessions(appointment_session_id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  professional_profile_id uuid references public.professional_profiles(professional_profile_id) on delete set null,
  individual_id uuid references public.profiles(id) on delete set null,
  payment_provider text not null default 'stripe',
  payment_status text not null default 'pending',
  stripe_payment_intent_id text unique,
  stripe_invoice_id text,
  amount_minor integer not null default 0,
  currency text not null default 'usd',
  occurred_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (payment_provider in ('stripe')),
  check (payment_status in ('draft', 'pending', 'paid', 'refunded', 'failed', 'voided')),
  check (amount_minor >= 0)
);

create index if not exists idx_payment_transactions_billing_status
  on public.payment_transactions (billing_account_id, payment_status, occurred_at desc);

create index if not exists idx_payment_transactions_appointment_status
  on public.payment_transactions (appointment_session_id, payment_status, occurred_at desc);

drop view if exists public.v_professional_console_upcoming_sessions;
create view public.v_professional_console_upcoming_sessions as
select
  s.professional_profile_id,
  s.organization_id,
  s.appointment_session_id,
  s.individual_id,
  s.appointment_status,
  s.payment_status,
  s.conference_status,
  s.conference_provider,
  s.scheduled_start_at,
  s.scheduled_end_at,
  s.booking_link_id,
  s.assignment_id,
  count(a.appointment_attendee_id)::int as attendee_count
from public.appointment_sessions s
left join public.appointment_attendees a on a.appointment_session_id = s.appointment_session_id
where s.scheduled_start_at >= now() - interval '12 hours'
group by
  s.professional_profile_id,
  s.organization_id,
  s.appointment_session_id,
  s.individual_id,
  s.appointment_status,
  s.payment_status,
  s.conference_status,
  s.conference_provider,
  s.scheduled_start_at,
  s.scheduled_end_at,
  s.booking_link_id,
  s.assignment_id;

comment on view public.v_professional_console_upcoming_sessions is
  'Professional Console scheduling surface: upcoming and recently started sessions with payment and conferencing posture.';

drop view if exists public.v_organizational_core_operational_snapshot_30d;
create view public.v_organizational_core_operational_snapshot_30d as
select
  s.organization_id,
  count(*)::int as total_sessions_30d,
  count(*) filter (where s.appointment_status = 'completed')::int as completed_sessions_30d,
  count(*) filter (where s.appointment_status = 'cancelled')::int as cancelled_sessions_30d,
  count(*) filter (where s.appointment_status = 'no_show')::int as no_show_sessions_30d,
  count(*) filter (where s.payment_status in ('paid', 'refunded'))::int as monetized_sessions_30d,
  count(*) filter (where s.conference_status in ('attention', 'failed'))::int as conference_attention_sessions_30d,
  coalesce(sum(pt.paid_amount_minor), 0)::bigint as paid_amount_minor_30d,
  count(distinct s.professional_profile_id)::int as active_professionals_30d,
  count(distinct s.individual_id)::int as active_individuals_30d
from public.appointment_sessions s
left join (
  select
    appointment_session_id,
    sum(amount_minor) filter (where payment_status = 'paid')::bigint as paid_amount_minor
  from public.payment_transactions
  where appointment_session_id is not null
  group by appointment_session_id
) pt on pt.appointment_session_id = s.appointment_session_id
where s.organization_id is not null
  and s.scheduled_start_at >= now() - interval '30 days'
group by s.organization_id;

comment on view public.v_organizational_core_operational_snapshot_30d is
  'Organisational Core rollup for session volume, monetization, conference health, and active population over the last 30 days.';
