-- Promote approved atom stage rows into the live atom contract tables
-- Run after:
--   1) navicue-atom-staging-schema.sql
--   2) services/supabase/migrations/20260306_navicue_atom_contracts.sql
--   3) navicue-atom-approved-stage-rows.sql

begin;

select public.f_navicue_atom_promote_batch('navicue-atom-approved-2026-03-06T21:43:20.605Z');

select atom_id, approved_grade, source, reviewed_at
from public.v_navicue_atom_backend_ready
where atom_id in (select atom_id from public.stg_navicue_atom_payloads where batch_id = 'navicue-atom-approved-2026-03-06T21:43:20.605Z')
order by reviewed_at desc, atom_id;

commit;
