# Guidelines Index

This folder is the planning and execution surface for NaviCue production.

## Structure

- `frontend/`
  - Frontend implementation handoff and design-system directive.
- `series31/`
  - Series 31 block workbenches and trackers.
- `series32/`
  - Series 32 stream/block workbenches and trackers.
- `navicue_reverse_engineering/`
  - Planning scaffolds, enrichment reports, and backend/runbook artifacts.
- `NAVICUE_WIRING_QUEUE.md`
  - Queue of unwired specimen components.
- `Guidelines.md`
  - Canonical build flow and governance.

## Team Default

If you are implementing frontend work:

1. `guidelines/frontend/FRONTEND_DESIGN_SYSTEM_DIRECTIVE.md`
2. `guidelines/Guidelines.md`
3. `NAVICUE_TOKEN_SYSTEM_CONTRACT.md`

## Build and Audit

```bash
./utils/navicue-token-health.sh
./utils/navicue-drift-audit.sh
```
