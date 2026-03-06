-- Navicue atom contracts and promotion flow

create table if not exists public.stg_navicue_atom_payloads (
  batch_id text not null,
  atom_id text not null,
  payload jsonb not null,
  source text,
  inserted_at timestamptz not null default now(),
  primary key (batch_id, atom_id),
  check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.navicue_atom_contracts (
  atom_id text primary key,
  atom_number integer not null unique,
  atom_name text not null,
  approved_grade text not null check (approved_grade in ('signature', 'hero-grade')),
  ingest_readiness text not null,
  reviewer text not null,
  reviewed_at timestamptz not null,
  source text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.navicue_atom_review_events (
  batch_id text not null,
  atom_id text not null references public.navicue_atom_contracts(atom_id) on delete cascade,
  approved_grade text not null,
  reviewer text not null,
  reviewed_at timestamptz not null,
  source text not null,
  payload jsonb not null,
  inserted_at timestamptz not null default now(),
  primary key (batch_id, atom_id),
  check (jsonb_typeof(payload) = 'object')
);

create index if not exists idx_navicue_atom_contracts_grade
  on public.navicue_atom_contracts (approved_grade, reviewed_at desc);

create index if not exists idx_navicue_atom_contracts_source
  on public.navicue_atom_contracts (source, reviewed_at desc);

create index if not exists idx_navicue_atom_review_events_reviewed_at
  on public.navicue_atom_review_events (reviewed_at desc);

create or replace function public.f_navicue_atom_promote_batch(
  p_batch_id text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  insert into public.navicue_atom_contracts (
    atom_id,
    atom_number,
    atom_name,
    approved_grade,
    ingest_readiness,
    reviewer,
    reviewed_at,
    source,
    payload
  )
  select
    s.atom_id,
    (s.payload->>'atom_number')::integer,
    s.payload->>'atom_name',
    s.payload->>'approved_grade',
    coalesce(s.payload->>'ingest_readiness', 'backend-ready'),
    coalesce(s.payload->>'reviewer', 'system'),
    coalesce((s.payload->>'reviewed_at')::timestamptz, now()),
    coalesce(s.payload->>'source', coalesce(s.source, 'unknown')),
    s.payload
  from public.stg_navicue_atom_payloads s
  where s.batch_id = p_batch_id
    and coalesce(s.payload->>'ingest_readiness', 'hold') = 'backend-ready'
  on conflict (atom_id) do update
  set atom_number = excluded.atom_number,
      atom_name = excluded.atom_name,
      approved_grade = excluded.approved_grade,
      ingest_readiness = excluded.ingest_readiness,
      reviewer = excluded.reviewer,
      reviewed_at = excluded.reviewed_at,
      source = excluded.source,
      payload = excluded.payload,
      updated_at = now();

  insert into public.navicue_atom_review_events (
    batch_id,
    atom_id,
    approved_grade,
    reviewer,
    reviewed_at,
    source,
    payload
  )
  select
    s.batch_id,
    s.atom_id,
    s.payload->>'approved_grade',
    coalesce(s.payload->>'reviewer', 'system'),
    coalesce((s.payload->>'reviewed_at')::timestamptz, now()),
    coalesce(s.payload->>'source', coalesce(s.source, 'unknown')),
    s.payload
  from public.stg_navicue_atom_payloads s
  where s.batch_id = p_batch_id
    and coalesce(s.payload->>'ingest_readiness', 'hold') = 'backend-ready'
  on conflict (batch_id, atom_id) do update
  set approved_grade = excluded.approved_grade,
      reviewer = excluded.reviewer,
      reviewed_at = excluded.reviewed_at,
      source = excluded.source,
      payload = excluded.payload,
      inserted_at = now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace view public.v_navicue_atom_backend_ready as
select
  atom_id,
  atom_number,
  atom_name,
  approved_grade,
  reviewer,
  reviewed_at,
  source,
  payload
from public.navicue_atom_contracts
where ingest_readiness = 'backend-ready';

grant all privileges on table public.stg_navicue_atom_payloads to service_role;
grant all privileges on table public.navicue_atom_contracts to service_role;
grant all privileges on table public.navicue_atom_review_events to service_role;
grant execute on function public.f_navicue_atom_promote_batch(text) to service_role;
grant select on public.v_navicue_atom_backend_ready to service_role;
