# NaviCue Atom Backend Ingest Workflow

This is the exact backend path for atom signoff and promotion.

## Files

- Schema bootstrap: `/Users/daniel/Documents/New project/system/ingest/navicue-atoms/navicue-atom-staging-schema.sql`
- Atom contract migration: `/Users/daniel/Documents/New project/services/supabase/migrations/20260306_navicue_atom_contracts.sql`
- Stage rows SQL: `/Users/daniel/Documents/New project/system/ingest/navicue-atoms/navicue-atom-approved-stage-rows.sql`
- Promotion SQL: `/Users/daniel/Documents/New project/system/ingest/navicue-atoms/navicue-atom-approved-promote.sql`

## Flow

1. Apply the atom contract migration.
2. Load the approved stage rows into `public.stg_navicue_atom_payloads`.
3. Run the promotion SQL.
4. Verify the promoted cohort in `public.v_navicue_atom_backend_ready`.

## Commands

Generate the latest assets:

```bash
npm run atoms:stage:sql
npm run atoms:stage:promote:sql
```

## Tables

- `public.stg_navicue_atom_payloads`
  - raw approved atom payloads by batch
- `public.navicue_atom_contracts`
  - live approved atom catalog
- `public.navicue_atom_review_events`
  - immutable-ish review event log by batch

## Promotion function

- `public.f_navicue_atom_promote_batch(p_batch_id text)`

This only promotes rows where:

- `payload.ingest_readiness = 'backend-ready'`

## Current approved cohort

The current generated batch contains:

- 10 `signature` atoms
- 24 `hero-grade` atoms
- 34 total approved rows

## Notes

- This workflow does not replace NaviCue contracts.
- It adds an atom-specific quality and approval spine so matching can be governed cleanly.
- Use the Collection 7 execution queue and cluster differentiation packs before promoting more atoms.
