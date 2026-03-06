# Recoverlution UI

Shared component primitives and compositional surface contracts should converge here.
Use this package as the clean landing zone for promoted UI work.

## Current Authority Slice

The first promoted primitives are:

- `button`
- `card`
- `badge`
- `input`
- `textarea`
- `label`
- `separator`
- `utils`

These files are authoritative in `packages/ui/src/primitives/*`.
`apps/design-center/src/app/components/ui/*` is currently the consumer mirror.

Until the deploy model supports direct workspace package consumption without compromise,
sync is explicit and enforced rather than assumed.
