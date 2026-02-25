# Figma Make Drop

Use this folder as the single handoff point for generated code from Figma Make.

## Where to place files
- Put generated source code in `figma-make-drop/incoming/`.
- Put generated images or static files in `figma-make-drop/incoming/assets/`.
- Update `figma-make-drop/metadata/export-manifest.json` before each push.

## Simple push flow
1. Create a branch from `main` (example: `figma-drop/2026-02-25-homepage`).
2. Replace the contents inside `figma-make-drop/incoming/` with the new export.
3. Update manifest and notes in `figma-make-drop/metadata/`.
4. Commit and open a PR to `main`.

Keep this folder deterministic so review is fast and diff quality stays high.
