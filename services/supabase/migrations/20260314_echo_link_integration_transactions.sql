-- Echo > Link connection transaction envelope
-- Date: 2026-03-14
-- Purpose: preserve provider launch intent across OAuth/native/device return
-- so LINK can route honestly before token custody and sync workers are live.

create table if not exists public.integration_connection_transactions (
  integration_connection_transaction_id uuid primary key default gen_random_uuid(),
  individual_id uuid not null references public.profiles(id) on delete cascade,
  provider_key text not null references public.integration_provider_catalog(provider_key) on delete cascade,
  auth_mode text not null,
  launch_mode text not null default 'redirect',
  transaction_status text not null default 'created',
  state_token text not null unique,
  return_path text not null default '/link',
  source_surface text,
  redirect_uri text,
  provider_launch_url text,
  provider_callback_state text,
  provider_code_present boolean not null default false,
  error_code text,
  error_message text,
  started_at timestamptz not null default now(),
  launched_at timestamptz,
  returned_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '20 minutes'),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (auth_mode in ('oauth', 'native_aggregate', 'device_bridge', 'manual')),
  check (launch_mode in ('redirect', 'native_bridge', 'device_bridge', 'manual', 'unconfigured')),
  check (transaction_status in ('created', 'launched', 'provider_returned', 'completed', 'attention', 'expired', 'blocked', 'cancelled'))
);

create index if not exists idx_integration_connection_transactions_individual_provider_status
  on public.integration_connection_transactions (individual_id, provider_key, transaction_status);

create index if not exists idx_integration_connection_transactions_expires_at
  on public.integration_connection_transactions (expires_at);

comment on table public.integration_connection_transactions is
  'Provider launch envelopes for ECHO > LINK. Tracks redirect/native/device bridge intent across start and callback before token exchange and sync are implemented.';
