-- Echo > Link integration foundation
-- Date: 2026-03-14
-- Purpose: make the external integration spine real so Navigate / LINK and
-- Signal can read from governed integration state instead of implied tables.
--
-- Important: the dev project already contains older integration tables from
-- an earlier pass. This migration upgrades those tables in place instead of
-- assuming a clean slate.

create table if not exists public.integration_provider_catalog (
  provider_key text primary key,
  provider_domain text not null,
  display_name text not null,
  description text,
  auth_mode text not null,
  signal_types text[] not null default '{}'::text[],
  supported_scopes text[] not null default '{}'::text[],
  is_identity_provider boolean not null default false,
  is_echo_link_provider boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (provider_domain in ('identity_gate', 'biology', 'recovery', 'movement', 'attention', 'frequency')),
  check (auth_mode in ('oauth', 'native_aggregate', 'device_bridge', 'manual'))
);

insert into public.integration_provider_catalog (
  provider_key,
  provider_domain,
  display_name,
  description,
  auth_mode,
  signal_types,
  supported_scopes,
  is_identity_provider,
  is_echo_link_provider
)
values
  ('apple', 'identity_gate', 'Sign in with Apple', 'Private, low-friction identity binding for companion entry.', 'oauth', array['identity'], array['identity_basic'], true, true),
  ('google', 'identity_gate', 'Sign in with Google', 'Low-friction identity binding for web and Android entry.', 'oauth', array['identity'], array['identity_basic'], true, true),
  ('healthkit', 'biology', 'Apple Health', 'Apple health aggregate for sleep, workouts, steps, heart rate, and HRV.', 'native_aggregate', array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], false, true),
  ('health_connect', 'biology', 'Health Connect', 'Android health aggregate for sleep, workouts, steps, heart rate, and HRV.', 'native_aggregate', array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], false, true),
  ('oura', 'recovery', 'Oura', 'Recovery, readiness, sleep architecture, heart rate, and HRV.', 'oauth', array['sleep', 'recovery', 'readiness', 'activity', 'heart_rate', 'hrv'], array['sleep', 'recovery', 'readiness', 'activity', 'heart_rate', 'hrv'], false, true),
  ('whoop', 'recovery', 'Whoop', 'Strain, recovery, sleep, heart rate, and HRV.', 'oauth', array['sleep', 'recovery', 'strain', 'activity', 'heart_rate', 'hrv'], array['sleep', 'recovery', 'strain', 'activity', 'heart_rate', 'hrv'], false, true),
  ('strava', 'movement', 'Strava', 'Outdoor movement and exertion signals.', 'oauth', array['workout', 'activity', 'heart_rate'], array['workout', 'activity', 'heart_rate'], false, true),
  ('garmin', 'movement', 'Garmin', 'Endurance movement, sleep, heart rate, and HRV signals.', 'oauth', array['workout', 'activity', 'sleep', 'heart_rate', 'hrv'], array['workout', 'activity', 'sleep', 'heart_rate', 'hrv'], false, true),
  ('coros', 'movement', 'Coros', 'Endurance movement and heart-rate effort signals.', 'oauth', array['workout', 'activity', 'heart_rate'], array['workout', 'activity', 'heart_rate'], false, true),
  ('screen_time', 'attention', 'Screen Time', 'Digital load and pickup frequency from the device.', 'device_bridge', array['screen_time'], array['screen_time'], false, true),
  ('focus_modes', 'attention', 'Focus Modes', 'Attention posture and interruption state from device focus configuration.', 'device_bridge', array['focus_state'], array['focus_state'], false, true),
  ('spotify', 'frequency', 'Spotify', 'Listening posture and musical frequency signals.', 'oauth', array['music_activity', 'playback_state'], array['music_activity', 'playback_state'], false, true),
  ('apple_music', 'frequency', 'Apple Music', 'Playback posture and listening-state signals.', 'oauth', array['music_activity', 'playback_state'], array['music_activity', 'playback_state'], false, true),
  ('apple_healthkit', 'biology', 'Apple HealthKit (Legacy)', 'Legacy HealthKit bridge retained for dev compatibility.', 'native_aggregate', array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], false, false),
  ('apple_health', 'biology', 'Apple Health (Legacy)', 'Legacy Apple Health contract seed retained for migration compatibility.', 'native_aggregate', array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], false, false),
  ('google_health', 'biology', 'Google Health (Legacy)', 'Legacy Google health aggregate retained for migration compatibility.', 'native_aggregate', array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], false, false),
  ('fitbit', 'recovery', 'Fitbit (Legacy)', 'Legacy Fitbit recovery/activity integration retained for migration compatibility.', 'oauth', array['sleep', 'recovery', 'activity', 'heart_rate'], array['sleep', 'recovery', 'activity', 'heart_rate'], false, false)
on conflict (provider_key) do update
set
  provider_domain = excluded.provider_domain,
  display_name = excluded.display_name,
  description = excluded.description,
  auth_mode = excluded.auth_mode,
  signal_types = excluded.signal_types,
  supported_scopes = excluded.supported_scopes,
  is_identity_provider = excluded.is_identity_provider,
  is_echo_link_provider = excluded.is_echo_link_provider,
  updated_at = now();

-- Mirror provider rows into the legacy integration_providers table while
-- integration_accounts still carries a historical FK there in upgraded dev
-- environments. This keeps LINK-compatible provider keys insertable without
-- forcing a risky FK rewrite mid-flight.
create table if not exists public.integration_providers (
  provider_key text primary key,
  display_name text,
  connector_mode text,
  source_key text,
  status text,
  scope_defaults text[],
  docs_url text,
  notes text,
  config jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

insert into public.integration_providers (
  provider_key,
  display_name,
  connector_mode,
  source_key,
  status,
  scope_defaults,
  docs_url,
  notes,
  config,
  created_at,
  updated_at
)
select
  ipc.provider_key,
  ipc.display_name,
  case ipc.auth_mode
    when 'native_aggregate' then 'app_native'
    when 'device_bridge' then 'hybrid'
    when 'manual' then 'hybrid'
    else 'oauth2_cloud'
  end as connector_mode,
  ipc.provider_domain as source_key,
  case when ipc.is_echo_link_provider then 'active' else 'deprecated' end as status,
  ipc.supported_scopes as scope_defaults,
  null::text as docs_url,
  case when ipc.is_echo_link_provider then 'Seeded from integration_provider_catalog for upgraded LINK compatibility.' else 'Legacy compatibility provider mirrored from integration_provider_catalog.' end as notes,
  jsonb_build_object(
    'mirrored_from_catalog', true,
    'provider_domain', ipc.provider_domain,
    'auth_mode', ipc.auth_mode,
    'signal_types', ipc.signal_types,
    'supported_scopes', ipc.supported_scopes,
    'is_identity_provider', ipc.is_identity_provider,
    'is_echo_link_provider', ipc.is_echo_link_provider
  ) as config,
  now(),
  now()
from public.integration_provider_catalog ipc
on conflict (provider_key) do update
set
  display_name = excluded.display_name,
  connector_mode = excluded.connector_mode,
  source_key = excluded.source_key,
  status = excluded.status,
  scope_defaults = excluded.scope_defaults,
  notes = excluded.notes,
  config = coalesce(public.integration_providers.config, '{}'::jsonb) || excluded.config,
  updated_at = now();

create table if not exists public.integration_accounts (
  integration_account_id uuid primary key default gen_random_uuid(),
  individual_id uuid not null references public.profiles(id) on delete cascade,
  provider_key text not null,
  account_status text not null default 'pending',
  auth_mode text,
  external_account_ref text,
  connected_at timestamptz,
  disconnected_at timestamptz,
  last_sync_at timestamptz,
  last_webhook_at timestamptz,
  latest_sync_status text not null default 'idle',
  latest_sync_finished_at timestamptz,
  last_error_code text,
  last_error_message text,
  provider_profile jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (individual_id, provider_key)
);

-- Upgrade legacy integration_accounts columns in place when they already exist.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.integration_accounts'::regclass
      and conname = 'integration_accounts_status_check'
  ) then
    alter table public.integration_accounts drop constraint integration_accounts_status_check;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'integration_accounts'
      and column_name = 'account_id'
  ) then
    alter table public.integration_accounts rename column account_id to integration_account_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'integration_accounts'
      and column_name = 'external_account_id'
  ) then
    alter table public.integration_accounts rename column external_account_id to external_account_ref;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'integration_accounts'
      and column_name = 'status'
  ) then
    alter table public.integration_accounts rename column status to account_status;
  end if;
end $$;

alter table public.integration_accounts add column if not exists auth_mode text;
alter table public.integration_accounts add column if not exists disconnected_at timestamptz;
alter table public.integration_accounts add column if not exists latest_sync_status text default 'idle';
alter table public.integration_accounts add column if not exists latest_sync_finished_at timestamptz;
alter table public.integration_accounts add column if not exists last_error_code text;
alter table public.integration_accounts add column if not exists last_error_message text;
alter table public.integration_accounts add column if not exists provider_profile jsonb default '{}'::jsonb;
alter table public.integration_accounts add column if not exists meta jsonb default '{}'::jsonb;

update public.integration_accounts
set account_status = case
  when account_status in ('connected', 'active') then 'active'
  when account_status in ('needs_reauth', 'attention') then 'attention'
  when account_status in ('error', 'failed') then 'error'
  when account_status in ('revoked', 'disconnected') then 'revoked'
  when account_status = 'paused' then 'paused'
  when account_status = 'available' then 'available'
  else 'pending'
end
where account_status is null
   or account_status not in ('available', 'pending', 'active', 'paused', 'attention', 'error', 'revoked');

update public.integration_accounts
set auth_mode = case
  when provider_key in ('healthkit', 'health_connect', 'apple_healthkit', 'apple_health', 'google_health') then 'native_aggregate'
  when provider_key in ('screen_time', 'focus_modes') then 'device_bridge'
  else 'oauth'
end
where auth_mode is null;

update public.integration_accounts
set latest_sync_status = case
  when account_status in ('attention', 'error') then 'attention'
  when last_sync_at is not null then 'success'
  else 'idle'
end
where latest_sync_status is null
   or latest_sync_status not in ('idle', 'queued', 'syncing', 'success', 'attention', 'failed', 'stale');

update public.integration_accounts
set latest_sync_finished_at = coalesce(latest_sync_finished_at, last_sync_at)
where last_sync_at is not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'integration_accounts'
      and column_name = 'metadata'
  ) then
    execute $sql$
      update public.integration_accounts
      set meta = coalesce(meta, metadata, '{}'::jsonb)
      where meta is null or meta = '{}'::jsonb
    $sql$;
  end if;
end $$;

drop index if exists public.idx_integration_accounts_individual_status;
create index if not exists idx_integration_accounts_individual_status
  on public.integration_accounts (individual_id, account_status, provider_key);

-- Legacy external_signal_contracts was previously a provider signal registry.
-- Preserve it under a new name, then create the per-individual runtime contract table.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'external_signal_contracts'
      and column_name = 'source'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'external_signal_contracts'
      and column_name = 'individual_id'
  ) then
    if not exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'external_signal_contract_definitions'
    ) then
      alter table public.external_signal_contracts rename to external_signal_contract_definitions;
    end if;
  end if;
end $$;

create table if not exists public.integration_consent (
  integration_consent_id uuid primary key default gen_random_uuid(),
  individual_id uuid not null references public.profiles(id) on delete cascade,
  provider_key text not null references public.integration_provider_catalog(provider_key) on delete cascade,
  scope_id text not null,
  granted boolean not null default true,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  source_surface text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (individual_id, provider_key, scope_id),
  check (
    scope_id in (
      'identity_basic',
      'sleep',
      'recovery',
      'activity',
      'steps',
      'workout',
      'heart_rate',
      'hrv',
      'strain',
      'readiness',
      'screen_time',
      'focus_state',
      'music_activity',
      'playback_state'
    )
  )
);

create index if not exists idx_integration_consent_individual_provider
  on public.integration_consent (individual_id, provider_key, granted);

create table if not exists public.external_signal_contracts (
  external_signal_contract_id uuid primary key default gen_random_uuid(),
  individual_id uuid not null references public.profiles(id) on delete cascade,
  provider_key text not null references public.integration_provider_catalog(provider_key) on delete cascade,
  signal_type text not null,
  contract_status text not null default 'active',
  freshness_tier text not null default 'unknown',
  last_event_at timestamptz,
  last_sync_at timestamptz,
  last_webhook_at timestamptz,
  latest_sync_status text not null default 'idle',
  latest_sync_finished_at timestamptz,
  events_7d integer not null default 0,
  events_30d integer not null default 0,
  payload_contract jsonb not null default '{}'::jsonb,
  source_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (individual_id, provider_key, signal_type),
  check (
    signal_type in (
      'identity',
      'sleep',
      'recovery',
      'activity',
      'steps',
      'workout',
      'heart_rate',
      'hrv',
      'strain',
      'readiness',
      'screen_time',
      'focus_state',
      'music_activity',
      'playback_state'
    )
  ),
  check (contract_status in ('active', 'paused', 'stale', 'attention', 'error', 'revoked')),
  check (freshness_tier in ('fresh', 'steady', 'aging', 'stale', 'unknown')),
  check (latest_sync_status in ('idle', 'queued', 'syncing', 'success', 'attention', 'failed', 'stale')),
  check (events_7d >= 0),
  check (events_30d >= 0)
);

create index if not exists idx_external_signal_contracts_individual_provider
  on public.external_signal_contracts (individual_id, provider_key, contract_status);

insert into public.external_signal_contracts (
  individual_id,
  provider_key,
  signal_type,
  contract_status,
  freshness_tier,
  last_sync_at,
  last_webhook_at,
  latest_sync_status,
  latest_sync_finished_at,
  payload_contract,
  source_meta
)
select
  ia.individual_id,
  ia.provider_key,
  signal_type,
  case
    when ia.account_status = 'active' then 'active'
    when ia.account_status = 'attention' then 'attention'
    when ia.account_status = 'error' then 'error'
    when ia.account_status = 'revoked' then 'revoked'
    when ia.account_status = 'paused' then 'paused'
    else 'stale'
  end,
  case
    when ia.last_sync_at >= now() - interval '7 days' then 'fresh'
    when ia.last_sync_at >= now() - interval '30 days' then 'steady'
    when ia.last_sync_at is not null then 'aging'
    else 'unknown'
  end,
  ia.last_sync_at,
  ia.last_webhook_at,
  ia.latest_sync_status,
  ia.latest_sync_finished_at,
  jsonb_build_object('seed_source', 'integration_accounts_upgrade'),
  coalesce(ia.meta, '{}'::jsonb)
from public.integration_accounts ia
join public.integration_provider_catalog ipc
  on ipc.provider_key = ia.provider_key
cross join lateral unnest(ipc.signal_types) as signal_type
on conflict (individual_id, provider_key, signal_type) do nothing;

drop view if exists public.v_external_signal_integration_health;
create view public.v_external_signal_integration_health as
select
  a.individual_id,
  a.provider_key,
  c.provider_domain,
  c.display_name,
  c.description,
  c.auth_mode,
  c.signal_types,
  c.supported_scopes,
  c.is_identity_provider,
  c.is_echo_link_provider,
  a.account_status,
  a.connected_at,
  a.last_sync_at,
  a.last_webhook_at,
  coalesce(
    max(esc.latest_sync_status) filter (
      where esc.latest_sync_finished_at = (
        select max(inner_esc.latest_sync_finished_at)
        from public.external_signal_contracts inner_esc
        where inner_esc.individual_id = a.individual_id
          and inner_esc.provider_key = a.provider_key
      )
    ),
    a.latest_sync_status
  ) as latest_sync_status,
  coalesce(max(esc.latest_sync_finished_at), a.latest_sync_finished_at) as latest_sync_finished_at,
  coalesce(sum(esc.events_7d), 0)::int as events_7d,
  coalesce(sum(esc.events_30d), 0)::int as events_30d,
  max(esc.last_event_at) as last_event_at,
  count(*) filter (where esc.contract_status = 'attention')::int as attention_contract_count,
  count(*) filter (where esc.contract_status = 'error')::int as error_contract_count,
  count(*) filter (where esc.contract_status = 'stale')::int as stale_contract_count
from public.integration_accounts a
join public.integration_provider_catalog c
  on c.provider_key = a.provider_key
left join public.external_signal_contracts esc
  on esc.individual_id = a.individual_id
 and esc.provider_key = a.provider_key
group by
  a.individual_id,
  a.provider_key,
  c.provider_domain,
  c.display_name,
  c.description,
  c.auth_mode,
  c.signal_types,
  c.supported_scopes,
  c.is_identity_provider,
  c.is_echo_link_provider,
  a.account_status,
  a.connected_at,
  a.last_sync_at,
  a.last_webhook_at,
  a.latest_sync_status,
  a.latest_sync_finished_at;

comment on view public.v_external_signal_integration_health is
  'Compiled rollup of integration account health for Navigate / LINK and Signal.';
