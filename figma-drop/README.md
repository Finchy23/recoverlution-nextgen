# Figma Drop

This is the GitHub-facing workspace for Figma and frontend build threads.

## Use This First

- `design-center/` is the clean frontend authority for tokens, composition, atoms, motion, voice, and marketing-facing primitives.
- `design-center/handoff/FIGMA_HANDOFF.md` is the first read for Figma AI.
- `design-center/tokens/design-tokens.flat.json` is the generated token export for frontend work.

## Folder Roles

- `design-center/`
  - Clean frontend handoff surface.
  - Use this for marketing builds and token-led UI work.
  - This is the correct entry point for new frontend implementation.
- `Command Center Execution Plan/`
  - Legacy runtime/context mirror.
  - Keep for reference only.
  - Do not use this as the primary surface for new marketing work.

## Rules

- Do not edit generated token artifacts directly.
- Edit source files inside `design-center/src/` and regenerate.
- Treat `design-center` as the canonical Figma-facing frontend surface.
- Treat `Command Center Execution Plan` as legacy context until explicitly replaced.
