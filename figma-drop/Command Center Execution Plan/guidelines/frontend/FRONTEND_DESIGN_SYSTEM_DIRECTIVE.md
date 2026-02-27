# Frontend Design-System Directive (Canonical)

Last updated: 2026-02-27
Audience: Frontend engineers shipping NaviCue experiences into Lab

## North Star

Ship Apple-grade elegance with zero drift.

- Atmosphere is context-sensible and stable.
- Entrance and hero interaction are where diversity and innovation live.
- Front-layer copy never claims instant transformation or finality.
- Every cue is one rep in a continuous stream.

## Pull Discipline

Before any frontend session:

```bash
git fetch --all --prune
git checkout <branch>
git pull --ff-only
```

Do not build on stale local state.

## Single Source of Truth

Use these in this order:

1. `src/app/design-system/navicue-blueprint.ts`
- Primary authority for palette, type, interaction geometry, motion, layout, and quickstart composition.

2. `src/design-tokens.ts`
- Global primitives only (brand/surfaces/radius/font stacks).

3. `src/app/components/navicue/NaviCueShell.tsx` and `src/app/components/navicue/NaviCueVerse.tsx`
- Runtime normalization and stage envelope.

Do not introduce new style authorities.

## Required Build Flow (No Exceptions)

1. Generate specimen scaffold:
```bash
./utils/create-navicue.sh --series "<Series>" --name "<Name>" --signature "<signature>" --form "<form>" --mechanism "<mechanism>" --kbe "<kbe>" --hook "<hook>"
```

2. Build inside system primitives:
- Use `navicueQuickstart`, `navicueType`, `navicueStyles`, `navicueInteraction`, `immersiveTapButton`.
- Use shared interaction hooks (`useHoldInteraction`, `useDragInteraction`, `useTypeInteraction`, `useDrawInteraction`) when applicable.

3. Gate the file before wiring:
```bash
./utils/navicue-file-gate.sh src/app/components/navicue/implementations/<Component>.tsx
```

4. Wire renderer + queue:
- Add import/mapping in `src/app/components/navicue/NaviCueMasterRenderer.tsx`.
- Clear item from `guidelines/NAVICUE_WIRING_QUEUE.md`.

5. Run batch audits:
```bash
./utils/navicue-token-health.sh
./utils/navicue-drift-audit.sh
```

## Copy Guardrails (Front Layer)

Never expose backend claims in user-facing copy.

Avoid:
- "Model updated"
- "Interface dissolved"
- "Code now runs as baseline biology"
- Any language implying one cue rewires identity in isolation

Use:
- One-moment framing
- One-rep framing
- Ongoing stream framing
- Neutral, elegant, non-judgmental language

Approved framing examples:
- "One clean rep."
- "Stay with what is here."
- "The path is still here."

## Hard Constraints

- No `navicueTypography` usage in new specimens.
- No bare font family literals (`monospace`, `serif`, `sans-serif`).
- Explicit font literals must remain in `11px-36px`.
- No off-grid radius/padding literals.
- No hardcoded color authority when palette/token alternative exists.
- No opaque replacement of glass/dark language for core specimen surfaces.

## Preferred Innovation Surface

Keep these stable:
- Atmosphere families and context mapping
- Color safety net by chrono/heat/profile

Push diversity here:
- Entrance choreography (`entrance_family`)
- Hero interaction physics (`hero_family`)
- Voice archetype expression (`voice_lane`)

If an atmosphere form is missing, add it as system evolution (do not patch ad hoc in specimen code).

## Definition of Done

A cue is done only if all are true:
- Wrapped by `NaviCueShell`/`NaviCueVerse`
- Uses blueprint tokens/primitives
- Passes `navicue-file-gate.sh`
- Wired in renderer
- Queue updated
- Batch audits clean
- Copy passes front-layer guardrails

## Quick Links

- `README.md`
- `guidelines/Guidelines.md`
- `NAVICUE_TOKEN_SYSTEM_CONTRACT.md`
- `ATLAS_GENESIS_BUILD_DIRECTIVE.md`
- `src/app/design-system/navicue-blueprint.ts`
