# NaviCue Blueprint Matrix System Runbook

## Objective
Operate NaviCues through a governed Supabase matrix where:
- composition is profile + axis driven,
- design tokens are a single registry/snapshot source,
- backfill runs through contract payloads (not ad-hoc fields).

No fixed cap is assumed. Profile rules and token catalogs can grow indefinitely.

## System Layers
1. **Contract spine**: `public.navicue_contracts` + publish/runtime gates.
2. **Blueprint control plane**:
- `public.navicue_blueprint_axes`
- `public.navicue_blueprint_profiles`
- `public.navicue_blueprint_profile_axis_rules`
- `public.navicue_contract_profile_bindings`
- `public.v_navicue_blueprint_matrix_projection`
- `public.v_navicue_blueprint_axis_coverage`
3. **Token SSOT in Supabase**:
- `public.navicue_design_token_registry`
- `public.navicue_design_token_snapshots`
- `public.navicue_design_token_snapshot_items`
- `public.navicue_contract_token_bindings`

## One-Time Migration
Apply all migrations in order, including:
- `/Users/daniel/Documents/New project/services/supabase/migrations/20260227_navicue_northstar_contract_foundation.sql`
- `/Users/daniel/Documents/New project/services/supabase/migrations/20260227_navicue_northstar_runtime_dispatch.sql`
- `/Users/daniel/Documents/New project/services/supabase/migrations/20260228_navicue_blueprint_matrix_control_plane.sql`

## Token Pipeline (Repeatable)
1. Export canonical token JSON for zeroheight-compatible format:
```bash
npm run -s tokens:export
```
2. Build Supabase seed SQL + token ledger CSV:
```bash
npm run -s tokens:seed:build
```
3. Apply generated SQL from `Command Center Execution Plan/guidelines/navicue_reverse_engineering/out/`.

Result:
- registry upserted,
- snapshot created,
- token set is versioned and queryable.

## Contract Backfill Pipeline
1. Build staged contract payloads from curated CSV:
```bash
node "Command Center Execution Plan/scripts/build-navicue-contract-payloads.mjs" \
  --input "Command Center Execution Plan/guidelines/navicue_reverse_engineering/out/navicue_master_5000_contract_clean_v2_2026-02-27.csv"
```
2. Apply generated staging SQL.
3. Upsert staged payloads into contracts via service workflow/function.
4. Refresh default profile axis weights after major backfill:
```sql
select public.f_navicue_refresh_profile_axis_rules('global_default');
```

## Verification Queries
```sql
-- profile resolution + matrix picks
select *
from public.v_navicue_blueprint_matrix_projection
order by navicue_id
limit 50;

-- axis coverage and density
select *
from public.v_navicue_blueprint_axis_coverage
order by blueprint_profile_id, axis_key, token_kind;

-- runtime health
select * from public.f_navicue_contract_health_report();
```

## Operating Rules
- Add new atmospheres/background engines/voice lanes/tokens by inserting into catalog + token registry.
- Keep profile count unconstrained; control complexity through guardrails and axis rules.
- Bind specific cues only when needed (`override`/`locked`). Otherwise let profile inference handle selection.
- Treat token snapshots as release artifacts (use snapshot label/version/source_ref per release).
