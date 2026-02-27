# NaviCue Build System (Set in Stone)

Date: 2026-02-25
Status: Canonical

## Frontend Entry Point

Use this first when re-pulling from GitHub:

- `guidelines/frontend/FRONTEND_DESIGN_SYSTEM_DIRECTIVE.md`
- `guidelines/frontend/README.md`

## Objective

Ship thousands of NaviCue types without style drift.

Every new NaviCue must:
- start from the same scaffold,
- use the same token authority,
- pass the same file gate,
- enter the same wiring queue,
- be measured by the same audits.

## Single Authority

1. `src/app/design-system/navicue-blueprint.ts`
- Specimen authority for palette, type, interaction geometry, layout, motion, and runtime style normalization.

2. `src/design-tokens.ts`
- Global primitives and Apple-first font stacks.

3. `src/app/components/navicue/NaviCueShell.tsx` + `NaviCueVerse.tsx`
- Runtime normalization and stage wrapper enforcement.

## Non-Negotiable Build Flow

1. Generate file from scaffold (never from scratch)
- `./utils/create-navicue.sh --series "..." --name "..." --signature "..." --form "..." --mechanism "..." --kbe "..." --hook "..."`

2. Implement specimen logic inside scaffold
- Keep all recurring styling tokenized.
- Prefer `immersiveTapButton`, `navicueStyles`, `navicueType`, interaction hooks.

3. Run per-file gate (must pass)
- `./utils/navicue-file-gate.sh src/app/components/navicue/implementations/<Component>.tsx`

4. Add renderer wiring
- Add import + mapping in `NaviCueMasterRenderer.tsx`.
- Remove entry from `guidelines/NAVICUE_WIRING_QUEUE.md` once wired.

5. Run portfolio audits
- `./utils/navicue-token-health.sh`
- `./utils/navicue-drift-audit.sh`

## Definition of Done (Per NaviCue)

A specimen is only done when all are true:
- Uses `NaviCueVerse` or `NaviCueShell`.
- Imports from `navicue-blueprint`.
- No `navicueTypography`.
- No generic `fontFamily` literals (`monospace`, `serif`, `sans-serif`).
- No sub-11px or over-36px explicit font sizes.
- No off-grid radius literals.
- No off-grid padding literals.
- Renderer wired and queue cleared.

## Governance Cadence

- Per file: run `navicue-file-gate.sh` before wiring.
- Per batch: run token + drift audits after every 10-20 files.
- Weekly: record totals in `APPLE_ELEGANCE_ALIGNMENT_PLAN.md`.

## Scripts

- Create scaffold: `npm run navicue:new -- --series "Novice" --name "AnchorPoint" --signature "sacred_ordinary" --form "Key" --mechanism "Self-Compassion" --kbe "believing" --hook "tap"`
- File gate: `npm run navicue:gate -- src/app/components/navicue/implementations/Novice_AnchorPoint.tsx`
- System audit: `npm run tokens:audit`
- Drift audit: `./utils/navicue-drift-audit.sh`

## Series 31 Planning Pack

Use the Series 31 pack when executing the one-cue-at-a-time workflow:

- `guidelines/series31/SERIES31_EXECUTION_SYSTEM.md`
- `guidelines/series31/SERIES31_BLOCK_ARCHITECTURE.md`
- `guidelines/series31/SERIES31_CREATIVE_WEB_CATALOG.md`
- `guidelines/series31/SERIES31_CUE_WORKBENCH_TEMPLATE.md`
- `guidelines/series31/SERIES31_CUE_TRACKER_3001_3100.md`
- `guidelines/series31/SERIES31_CUE_TRACKER_3101_3200.md`
- `guidelines/series31/SERIES31_CUE_TRACKER_3201_3300.md`
- `guidelines/series31/SERIES31_CUE_TRACKER_3301_3400.md`
- `guidelines/series31/SERIES31_CUE_TRACKER_3401_3500.md`
- `guidelines/series31/SERIES31_CUE_TRACKER_3501_3600.md`
- `guidelines/series31/SERIES31_CUE_TRACKER_3601_3700.md`
- `guidelines/series31/SERIES31_BLOCK1_WORKBENCH_3001_3020.md`
- `guidelines/series31/SERIES31_BLOCK2_WORKBENCH_3021_3040.md`
- `guidelines/series31/SERIES31_BLOCK3_WORKBENCH_3041_3060.md`
- `guidelines/series31/SERIES31_BLOCK4_WORKBENCH_3061_3080.md`
- `guidelines/series31/SERIES31_BLOCK5_WORKBENCH_3081_3100.md`
- `guidelines/series31/SERIES31_BLOCK6_WORKBENCH_3101_3120.md`
- `guidelines/series31/SERIES31_BLOCK7_WORKBENCH_3121_3140.md`
- `guidelines/series31/SERIES31_BLOCK8_WORKBENCH_3141_3160.md`
- `guidelines/series31/SERIES31_BLOCK9_WORKBENCH_3161_3180.md`
- `guidelines/series31/SERIES31_BLOCK10_WORKBENCH_3181_3200.md`
- `guidelines/series31/SERIES31_BLOCK11_WORKBENCH_3201_3220.md`
- `guidelines/series31/SERIES31_BLOCK12_WORKBENCH_3221_3240.md`
- `guidelines/series31/SERIES31_BLOCK13_WORKBENCH_3241_3260.md`
- `guidelines/series31/SERIES31_BLOCK14_WORKBENCH_3261_3280.md`
- `guidelines/series31/SERIES31_BLOCK15_WORKBENCH_3281_3300.md`
- `guidelines/series31/SERIES31_BLOCK16_WORKBENCH_3301_3320.md`
- `guidelines/series31/SERIES31_BLOCK17_WORKBENCH_3321_3340.md`
- `guidelines/series31/SERIES31_BLOCK18_WORKBENCH_3341_3360.md`
- `guidelines/series31/SERIES31_BLOCK19_WORKBENCH_3361_3380.md`
- `guidelines/series31/SERIES31_BLOCK20_WORKBENCH_3381_3400.md`
- `guidelines/series31/SERIES31_BLOCK21_WORKBENCH_3401_3420.md`
- `guidelines/series31/SERIES31_BLOCK22_WORKBENCH_3421_3440.md`
- `guidelines/series31/SERIES31_BLOCK23_WORKBENCH_3441_3460.md`
- `guidelines/series31/SERIES31_BLOCK24_WORKBENCH_3461_3480.md`
- `guidelines/series31/SERIES31_BLOCK25_WORKBENCH_3481_3500.md`
- `guidelines/series31/SERIES31_BLOCK26_WORKBENCH_3501_3520.md`
- `guidelines/series31/SERIES31_BLOCK27_WORKBENCH_3521_3540.md`
- `guidelines/series31/SERIES31_BLOCK28_WORKBENCH_3541_3560.md`
- `guidelines/series31/SERIES31_BLOCK29_WORKBENCH_3561_3580.md`
- `guidelines/series31/SERIES31_BLOCK30_WORKBENCH_3581_3600.md`
- `guidelines/series31/SERIES31_BLOCK31_WORKBENCH_3601_3620.md`
- `guidelines/series31/SERIES31_BLOCK32_WORKBENCH_3621_3640.md`
- `guidelines/series31/SERIES31_BLOCK33_WORKBENCH_3641_3660.md`
- `guidelines/series31/SERIES31_BLOCK34_WORKBENCH_3661_3680.md`
- `guidelines/series31/SERIES31_BLOCK35_WORKBENCH_3681_3700.md`

## Series 32 Planning Pack (Next 1000)

Use the Series 32 pack for stream-first execution across cues `4001-5000` (internal/runtime indexing only):

- `guidelines/series32/SERIES32_MASTER_INDEX.md`
- `guidelines/series32/SERIES32_EXECUTION_SYSTEM.md`
- `guidelines/series32/SERIES32_BLOCK_ARCHITECTURE.md`
- `guidelines/series32/SERIES32_CREATIVE_WEB_CATALOG.md`
- `guidelines/series32/SERIES32_CUE_WORKBENCH_TEMPLATE.md`
- `guidelines/navicue_reverse_engineering/series32_runtime_queue_4001_5000.csv`

Regeneration command:

- `python3 guidelines/navicue_reverse_engineering/generate_series32_planning_pack.py`
