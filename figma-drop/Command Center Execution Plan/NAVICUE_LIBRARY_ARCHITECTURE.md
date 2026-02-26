# NaviCue Library Architecture (Incremental Refactor)

## Goal
Move from a monolithic `labNavicues.ts` + oversized renderer map toward a modular library where each NaviCue (or series) can be loaded and evolved independently.

## Current Step Landed
- Added `src/app/components/navicue/library/typeIdAliases.ts`
- `NaviCueMasterRenderer` now resolves alias IDs before map routing
- Result: restored IDs (S124/S127) are wired without duplicating component logic
- Added `src/app/data/lab/atomicLibrary.ts` for generated atomic specimens (`1401-2500`)
- Added `src/app/components/navicue/library/AtomicNaviCueRenderer.tsx` generic renderer path
- Lab Viewer now merges legacy + atomic data at load time

## Target Architecture
1. Data Library
- `src/app/data/lab/series/Sxxx_<series>.ts` (10 entries per series)
- `src/app/data/lab/library/manifest.ts` (series metadata + ranges + source)
- `src/app/data/lab/library/loadSeries.ts` (dynamic series loading)

2. Component Library
- `src/app/components/navicue/library/series/<Series>.ts` (typeId->component map per series)
- `src/app/components/navicue/library/resolveComponent.ts` (single resolver)
- Keep `NaviCueMasterRenderer` as orchestrator, not as giant map holder

3. Lab Viewer Loading
- Load only visible series windows + active specimen series
- Keep drawer searchable via manifest index (lightweight), then lazy-load full series data on demand

## Migration Phases
1. Phase 1 (safe):
- Extract S121-S140 data into series files + manifest
- Keep current API output as one merged array for compatibility

2. Phase 2 (safe):
- Extract renderer type maps S121-S140 into series map modules
- Keep legacy `NaviCueMasterRenderer` fallback path

3. Phase 3 (full):
- Switch LabViewer to manifest + on-demand series loading
- Retire monolithic `labNavicues.ts` once parity checks pass

## Guardrails
- Never change existing `navicue_type_id` once published
- Every newly added typeId must have either:
  - direct component mapping, or
  - alias mapping to canonical component
- CI check: all `labNavicue` IDs must resolve (direct, alias, or form/mechanism/kbe map)
