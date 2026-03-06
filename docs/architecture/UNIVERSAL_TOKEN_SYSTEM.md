# Universal Token System

## Purpose

One code-first design token source across all Recoverlution products.

Figma and Zeroheight consume generated artifacts from this system.
They do not define runtime truth.

## Package

- `packages/design-system`

## Layering

1. `tokens/source/primitives`
2. `tokens/source/semantic/global`
3. `tokens/source/semantic/domains/*`
4. `tokens/source/runtime/*`

NaviCue is one domain namespace within this system (`semantic/domains/navicue`).

## Build Outputs

- `packages/design-system/tokens/dist/canonical.tokens.json`
- `packages/design-system/tokens/dist/dtcg.tokens.json`
- `packages/design-system/tokens/dist/zeroheight.tokens.json`
- `packages/design-system/tokens/dist/web/tokens.css`
- `packages/design-system/tokens/dist/token-manifest.json`

## Export Targets

`tokens:universal:export` mirrors built artifacts to:

- `zeroheight-import/universal.*.json`
- `Command Center Execution Plan/tokens/universal.*.json`

## Commands

```bash
npm run tokens:universal:validate
npm run tokens:universal:build
npm run tokens:universal:report
npm run tokens:universal:diff
npm run tokens:universal:baseline:promote
npm run tokens:universal:export
```

Strict gate:

```bash
npm run tokens:universal:gate
```

## Governance

- No hardcoded raw design values in product code.
- Token changes must pass validation before build/export.
- Downstream artifacts are generated only; no manual edits.
- Breaking change detection is baseline-driven via token diff reports.
