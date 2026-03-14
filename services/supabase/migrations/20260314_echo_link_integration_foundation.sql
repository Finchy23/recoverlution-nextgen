-- Echo > Link integration foundation
-- Date: 2026-03-14
-- Purpose: make the external integration spine real so Navigate / LINK and
-- Signal can read from governed integration state instead of implied tables.

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
  is_identity_provider
)
values
  ('apple', 'identity_gate', 'Sign in with Apple', 'Private, low-friction identity binding for companion entry.', 'oauth', array['identity'], array['identity_basic'], true),
  ('google', 'identity_gate', 'Sign in with Google', 'Low-friction identity binding for web and Android entry.', 'oauth', array['identity'], array['identity_basic'], true),
  ('healthkit', 'biology', 'Apple Health', 'Apple health aggregate for sleep, workouts, steps, heart rate, and HRV.', 'native_aggregate', array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], false),
  ('health_connect', 'biology', 'Health Connect', 'Android health aggregate for sleep, workouts, steps, heart rate, and HRV.', 'native_aggregate', array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], array['sleep', 'steps', 'workout', 'heart_rate', 'hrv'], false),
  ('oura', 'recovery', 'Oura', 'Recovery, readiness, sleep architecture, heart rate, and HRV.', 'oauth', array['sleep', 'recovery', 'readiness', 'activity', 'heart_rate', 'hrv'], array['sleep', 'recovery', 'readiness', 'activity', 'heart_rate', 'hrv'], false),
  ('whoop', 'recovery', 'Whoop', 'Strain, recovery, sleep, heart rate, and HRV.', 'oauth', array['sleep', 'recovery', 'strain', 'activity', 'heart_rate', 'hrv'], array['sleep', 'recovery', 'strain', 'activity', 'heart_rate', 'hrv'], false),
  ('strava', 'movement', 'Strava', 'Outdoor movement and exertion signals.', 'oauth', array['workout', 'activity', 'heart_rate'], array['workout', 'activity', 'heart_rate'], false),
  ('garmin', 'movement', 'Garmin', 'Endurance movement, sleep, heart rate, and HRV signals.', 'oauth', array['workout', 'activity', 'sleep', 'heart_rate', 'hrv'], array['workout', 'activity', 'sleep', 'heart_rate', 'hrv'], false),
  ('coros', 'movement', 'Coros', 'Endurance movement and heart-rate effort signals.', 'oauth', array['workout', 'activity', 'heart_rate'], array['workout', 'activity', 'heart_rate'], false),
  ('screen_time', 'attention', 'Screen Time', 'Digital load and pickup frequency from the device.', 'device_bridge', array['screen_time'], array['screen_time'], false),
  ('focus_modes', 'attention', 'Focus Modes', 'Attention posture and interruption state from device focus configuration.', 'device_bridge', array['focus_state'], array['focus_state'], false),
  ('spotify', 'frequency', 'Spotify', 'Listening posture and musical frequency signals.', 'oauth', array['music_activity', 'playback_state'], array['music_activity', 'playback_state'], false),
  ('apple_music', 'frequency', 'Apple Music', 'Playback posture and listening-state signals.', 'oauth', array['music_activity', 'playback_state'], array['music_activity', 'playback_state'], false)
on conflict (provider_key) do update
set
  provider_domain = excluded.provider_domain,
  display_name = excluded.display_name,
  description = excluded.description,
  auth_mode = excluded.auth_mode,
  signal_types = excluded.signal_types,
  supported_scopes = excluded.supported_scopes,
  is_identity_provider = excluded.is_identity_provider,
  updated_at = now();

create table if not exists public.integration_accounts (
  integration_account_id uuid primary key default gen_random_uuid(),
  individual_id uuid not null references public.profiles(id) on delete cascade,
  provider_key text not null references public.integration_provider_catalog(provider_key) on delete restrict,
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
  unique (individual_id, provider_key),
  check (account_status in ('available', 'pending', 'active', 'paused', 'attention', 'error', 'revoked')),
  check (coalesce(auth_mode, 'oauth') in ('oauth', 'native_aggregate', 'device_bridge', 'manual')),
  check (latest_sync_status in ('idle', 'queued', 'syncing', 'success', 'attention', 'failed', 'stale'))
);

create index if not exists idx_integration_accounts_individual_status
  on public.integration_accounts (individual_id, account_status, provider_key);

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
  a.account_status,
  a.connected_at,
  a.last_sync_at,
  a.last_webhook_at,
  a.latest_sync_status,
  a.latest_sync_finished_at;

comment on view public.v_external_signal_integration_health is
  'Compiled rollup of integration account health for Navigate / LINK and Signal.';
