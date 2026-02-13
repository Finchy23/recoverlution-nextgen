# recoverlution-nextgen

Next generation of the Recoverlution system.

## Figma fail-safe push flow

This repo is configured so Figma exports can move fast without risking `main`.

- Push Figma output to `figma-drop/<date>-<topic>`.
- GitHub opens/reuses a PR into `main` automatically.
- `Figma Guardrails` runs checks for secrets, conflict markers, disallowed files, and file size limits.
- Merge only via PR after checks pass.

Full setup guide: `docs/FIGMA_PUSH_FAILSAFE.md`
