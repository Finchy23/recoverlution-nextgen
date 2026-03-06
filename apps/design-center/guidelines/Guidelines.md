# Recoverlution Design System Guidelines

## Token Governance

- `src/design-tokens.ts` is the only editable token authority.
- `src/styles/design-tokens.css` and `tokens/design-tokens.flat.json` are generated via `npm run tokens:export`.
- No hardcoded hex/rgba values in app-shell/UI code unless explicitly documented as temporary.

## Signature IDs

- Canonical signature IDs are `kebab-case`:
  - `sacred-ordinary`
  - `witness-ritual`
  - `poetic-precision`
  - `koan-paradox`
  - `sensory-cinema`
  - `quiet-authority`
  - `warm-provocation`
  - `neural-reset`

## Atom Delivery Rules

- Atoms can be `designed`, `building`, or `complete`.
- Player should only expose atoms with a registered component.
- Library may show blueprint placeholders for unimplemented atoms.
- No direct component usage without registration in `ATOM_COMPONENTS`.

## Quality Gates

- Before pushing:
  1. `npm run tokens:export`
  2. `npm run figma:handoff`
  3. `npm run typecheck`
  4. `npm run lint`
  5. `npm run format:check`
- Use `npm run qa` to run the full sequence.

## Figma Return Path

- Push cleaned code from this workspace, not from transient exports.
- Treat `handoff/figma-handoff.manifest.json` as the machine-readable handoff index.
- Treat `handoff/FIGMA_HANDOFF.md` as the human-readable handoff note.

## Visual Discipline

- Respect zero-cognitive-load UX.
- Keep transitions physical and minimal; avoid noisy motion.
- Prefer soft gradients, glass depth, and haptic-led interaction cues over decorative effects.
