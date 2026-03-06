# Recoverlution Universal Design System

This package is the canonical source of truth for design tokens across all product surfaces:

- Design Center / review surfaces
- Marketing
- Platform app (web/mobile)
- Analytics/reporting surfaces

## Architecture

Token source is layered and domain-aware:

1. `tokens/source/primitives`
2. `tokens/source/semantic/global`
3. `tokens/source/semantic/domains/*`
4. `tokens/source/runtime/*`

NaviCue is one domain namespace inside the full platform system.

## Commands

```bash
npm --prefix packages/design-system run -s tokens:validate
npm --prefix packages/design-system run -s tokens:build
npm --prefix packages/design-system run -s tokens:export
```

## Outputs

Generated artifacts are written to:

- `tokens/dist/canonical.tokens.json`
- `tokens/dist/dtcg.tokens.json`
- `tokens/dist/zeroheight.tokens.json`
- `tokens/dist/web/tokens.css`
- `tokens/dist/token-manifest.json`

Do not manually edit files in `tokens/dist`.

## Runtime Authority

Runtime-facing token exports now live in:

- `src/runtime/design-tokens.ts`
- `src/index.ts`

This package is the canonical token authority.
Apps should consume this package rather than owning local token files.
