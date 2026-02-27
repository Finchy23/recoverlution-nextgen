# Command Center Execution Plan

NaviCue build surface and runtime wiring.

## Frontend Handoff

Start here after pulling latest:

1. `guidelines/frontend/FRONTEND_DESIGN_SYSTEM_DIRECTIVE.md`
2. `guidelines/frontend/README.md`
3. `NAVICUE_TOKEN_SYSTEM_CONTRACT.md`
4. `guidelines/Guidelines.md`
5. `guidelines/README.md`

## Workspace Topology

- Primary workspace: this root folder.
- Mirror workspace: `figma-drop/` (keep docs synchronized if both are actively used by the team).
- Do not introduce separate design-system rules between the two roots.

## Runtime Shape (Source of Truth)

- Renderer wiring source:
  - `src/app/components/navicue/NaviCueMasterRenderer.tsx`
- Core lab metadata:
  - `src/app/data/lab/labMetadata.ts` (`LAB_SPECIMEN_TOTAL`)
- Atomic libraries:
  - `src/app/data/lab/atomicLibrary.ts`
  - `src/app/data/lab/atomicLibrary2601_2700.ts`
  - `src/app/data/lab/atomicLibrary2701_2800.ts`
  - `src/app/data/lab/atomicLibrary2801_2900.ts`
  - `src/app/data/lab/atomicLibrary2901_3000.ts`
  - `src/app/data/lab/atomicLibrary3001_3100.ts`
  - `src/app/data/lab/atomicLibrarySeries31_*.ts` (split files)
  - `src/app/data/lab/atomicLibrarySeries32_*.ts` (split files)
- Parked/unwired files:
  - `src/app/components/navicue/implementations/_orphaned/`

## Non-Negotiable Build Flow

1. Create from scaffold (never from scratch):

```bash
./utils/create-navicue.sh --series "Novice" --name "AnchorPoint" --signature "sacred_ordinary" --form "Key" --mechanism "Self-Compassion" --kbe "believing" --hook "tap"
```

2. Gate file before wiring:

```bash
./utils/navicue-file-gate.sh src/app/components/navicue/implementations/Novice_AnchorPoint.tsx
```

3. Wire renderer + clear queue:
- `src/app/components/navicue/NaviCueMasterRenderer.tsx`
- `guidelines/NAVICUE_WIRING_QUEUE.md`

4. Run audits:

```bash
./utils/navicue-token-health.sh
./utils/navicue-drift-audit.sh
```

## Design-System Authority

1. `src/app/design-system/navicue-blueprint.ts`
2. `src/design-tokens.ts`
3. `src/app/components/navicue/NaviCueShell.tsx` and `src/app/components/navicue/NaviCueVerse.tsx`

Do not introduce parallel style/token authorities in specimen files.
