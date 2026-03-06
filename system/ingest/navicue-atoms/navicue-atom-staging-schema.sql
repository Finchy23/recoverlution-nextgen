create table if not exists public.stg_navicue_atom_payloads (
  batch_id text not null,
  atom_id text not null,
  payload jsonb not null,
  source text,
  inserted_at timestamptz not null default now(),
  primary key (batch_id, atom_id)
);

create index if not exists idx_stg_navicue_atom_payloads_atom_id
  on public.stg_navicue_atom_payloads (atom_id);

create index if not exists idx_stg_navicue_atom_payloads_inserted_at
  on public.stg_navicue_atom_payloads (inserted_at desc);

comment on table public.stg_navicue_atom_payloads is
  'Staging payloads for atom audit, signoff, benchmark, hero, and remediation ingest.';
