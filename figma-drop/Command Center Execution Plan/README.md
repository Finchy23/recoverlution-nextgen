# Command Center Execution Plan

This folder contains the NaviCue build surface imported from Figma Make.

## Current Runtime Shape

- Active specimen implementations: `2500`
- Renderer wiring source: `src/app/components/navicue/NaviCueMasterRenderer.tsx`
- Atomic library source: `src/app/data/lab/atomicLibrary.ts`
- Parked/unwired files: `src/app/components/navicue/implementations/_orphaned/`

## Design-System Alignment

Run the audit:

```bash
./utils/navicue-drift-audit.sh
./utils/navicue-token-health.sh
```

Read the rollout plan:

- `APPLE_ELEGANCE_ALIGNMENT_PLAN.md`
- `NAVICUE_TOKEN_SYSTEM_CONTRACT.md`
- `NAVICUE_1001_2000_COVERAGE_AUDIT.md`
- `NAVICUE_2001_2500_REMAP_AUDIT.md`
- `guidelines/Guidelines.md`

## Set-In-Stone Build System

Create new NaviCues from the canonical scaffold (never from scratch):

```bash
./utils/create-navicue.sh --series "Novice" --name "AnchorPoint" --signature "sacred_ordinary" --form "Key" --mechanism "Self-Compassion" --kbe "believing" --hook "tap"
```

Gate each new file before renderer wiring:

```bash
./utils/navicue-file-gate.sh src/app/components/navicue/implementations/Novice_AnchorPoint.tsx
```

Track unwired new components in:

- `guidelines/NAVICUE_WIRING_QUEUE.md`

## Push Strategy

Figma drops can continue landing in this repository. After each drop:
1. Run drift audit.
2. Review orphaned/wiring diffs.
3. Apply tokenization migrations by batch.
