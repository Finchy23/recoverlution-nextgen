# NaviCue Atom Signoff And Ingest

This is the operational path from a finished atom catalog to backend-ready matching data.

## Rule

Do not ingest atoms straight from implementation status.

Implementation proves the engine exists.
Signoff proves the engine is strong enough, distinct enough, and reusable enough to enter the live content system.

## Pipeline

1. Run the full audit.
2. Seed the signoff scaffold.
3. Curate by review lane.
4. Promote curated rows to backend-ready.
5. Ingest the payload pack.

## Commands

```bash
npm run atoms:audit:full
npm run atoms:signoff:seed
```

## Generated Artifacts

- `docs/reports/navicue-atoms-full-audit.json`
- `docs/reports/navicue-atoms-full-audit.md`
- `docs/reports/navicue-atom-matching-matrix.csv`
- `docs/reports/navicue-atom-signoff-scaffold.json`
- `docs/reports/navicue-atom-signoff-scaffold.csv`
- `docs/reports/navicue-atom-signoff-and-ingest.md`
- `system/ingest/navicue-atoms/navicue-atom-ingest-pack.json`

## Review Lanes

- `signature-pass`
  - rare atoms with the strongest structural and matching profile
- `hero-pass`
  - strong atoms likely fit for live hero use after curation
- `composition-pass`
  - good engines that need wrapper, scale, payoff, or repetition review
- `rebuild-pass`
  - engines that should not be ingested until redesigned

## Manual Signoff Fields

The scaffold is seeded, not final.

The manual pass should update:
- `manual_hero_grade`
- `manual_override_reason`
- `reviewer`
- `reviewed_at`
- `signoff_status`

## Ingest Rule

Only rows that are manually reviewed should move from:
- `hold`
to
- `backend-ready`

The ingest pack is intentionally shaped as `atomId + payload` so it can be adapted to a staging table without lossy transformations.
