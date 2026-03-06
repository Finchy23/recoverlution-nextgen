# NaviCue Infinite Catalog Backend Model

## Why this model
At scale, backend management fails if cues are treated as static files only.

You need:
1. Catalog hierarchy (stream/block/cue)
2. Immutable versioning
3. Explicit deployment channels
4. Fast dispatch index
5. User state + event telemetry
6. Governance reviews and quality gates

## Core entities
- `navicue_streams`: production streams
- `navicue_blocks`: 20-cue operating blocks
- `navicue_cues`: canonical cue identity (one row per cue number)
- `navicue_cue_versions`: immutable revisions
- `navicue_cue_deployments`: where/version/channel is live
- `navicue_dispatch_index`: fast runtime candidate table
- `navicue_user_state`: per-user progression snapshot
- `navicue_events`: high-volume telemetry
- `navicue_quality_reviews`: human review gates

## Runtime flow
1. Author cue version (`draft -> review -> approved`)
2. Mark cue `live_version_id`
3. Deploy to channel(s)
4. Refresh dispatch index (`refresh_navicue_dispatch_index()`)
5. Runtime picks candidates by heat/context/mechanic (`get_next_navicue_candidate(...)`)
6. Events + user state update after each interaction
7. Bandit/routing learns from telemetry, not hardcoded assumptions

## Scale notes for infinite growth
- Keep cue identity separate from version payload.
- Cache dispatch candidates (don’t query giant JSON at runtime).
- Partition telemetry by time.
- Add nightly summarization jobs for momentum dashboards.
- Use rollout percentages per channel for safe release.

## Immediate execution
- Apply migration: `services/supabase/migrations/20260227_navicue_10000_management.sql`
- Apply runtime function: `services/supabase/migrations/20260227_navicue_dispatch_function.sql`
- Backfill stream/block/cue records from your scaffold CSV.
- Map each cue to existing `navicue_type_id` where possible.
- Turn on review gates before bulk publishing.
