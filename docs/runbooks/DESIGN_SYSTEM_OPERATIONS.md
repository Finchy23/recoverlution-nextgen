# Design System Operations

## Objective

Run a code-first universal design system with deterministic governance.

## Standard Flow

1. Update source tokens under:
- `packages/design-system/tokens/source`

2. Run quality gate:

```bash
npm run tokens:universal:check
```

3. Review reports:
- `docs/reports/design-system-catalog.md`
- `docs/reports/design-system-diff.md`

4. Export integration artifacts:

```bash
npm run tokens:universal:export
```

5. If approved as new baseline:

```bash
npm run tokens:universal:baseline:promote
```

## Strict Gate

```bash
npm run tokens:universal:gate
```

This fails when:
- baseline is missing
- breaking changes exist (removed tokens or token type changes)

## Integration Targets

- `zeroheight-import/universal.*.json` (optional external docs import target)
- `Command Center Execution Plan/tokens/universal.*.json`

## Governance Rules

- Code is source of truth.
- Downstream artifacts are generated only.
- No manual edits inside `tokens/dist` or exported artifacts.
