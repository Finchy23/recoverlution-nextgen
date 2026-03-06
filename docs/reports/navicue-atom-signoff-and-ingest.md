# NaviCue Atom Signoff And Ingest

Generated: 2026-03-06T21:43:19.344Z

## What This Pack Does

- Seeds a manual signoff row for every atom
- Translates the audit into review lanes instead of one flat queue
- Produces an ingest pack shaped as `atomId + payload` for backend staging

## Seeded Signoff Totals

- Total atoms: 700
- Signature pass candidates: 30
- Hero pass candidates: 107
- Composition pass atoms: 561
- Rebuild pass atoms: 2
- Curation-ready for ingest: 137
- Hold before ingest: 563

## Recommended Signoff Order

1. Signature + hero pass (137 atoms)
2. Critical/high composition queue (60 atoms surfaced)
3. Rebuild pass (2 atoms)

## Output Files

- JSON scaffold: `docs/reports/navicue-atom-signoff-scaffold.json`
- CSV scaffold: `docs/reports/navicue-atom-signoff-scaffold.csv`
- Ingest pack: `system/ingest/navicue-atoms/navicue-atom-ingest-pack.json`

## How To Use

1. Review the CSV scaffold by lane, not by atom number.
2. Promote or downgrade `manual_hero_grade` where needed.
3. Fill reviewer, reviewed_at, and manual_override_reason during curation.
4. Only promote rows from `curation-ready` to `backend-ready` after manual signoff.
