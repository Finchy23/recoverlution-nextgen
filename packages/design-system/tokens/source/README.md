# Token Source Contract

Place canonical token files in this tree only.

## Folders

- `primitives/` raw scales
- `semantic/global/` cross-product intent tokens
- `semantic/domains/<domain>/` domain-specific tokens
- `runtime/<axis>/` context overlays (chrono, heat, platform, a11y)

## File format

Accepted leaf forms:

1. Plain scalar:

```json
{ "stack": "1rem" }
```

2. DTCG-like token node:

```json
{
  "stack": {
    "$value": "1rem",
    "$type": "dimension"
  }
}
```

Reference syntax:

```json
{ "$value": "{primitives.spacing.5}" }
```

## Rules

- Keep names stable and predictable.
- Use references for semantic/domain layers where possible.
- Do not commit manual edits to `tokens/dist`.
