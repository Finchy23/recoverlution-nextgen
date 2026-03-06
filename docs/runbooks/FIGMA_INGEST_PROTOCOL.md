# Figma Ingest Protocol

## Purpose

Figma can accelerate frontend generation.
It must not become a second runtime authority.

This protocol keeps Command Center as the canonical production source while still allowing large Figma pushes to land quickly.

## Canonical Rule

- Canonical runtime: `Command Center Execution Plan/src/`
- Canonical runtime entry: `apps/command-center/`
- Derived ingest mirror: `Command Center Execution Plan/figma-drop/`

`figma-drop/` is for ingest, inspection, and tooling access.
It is not a production build surface.

## What lands in `figma-drop/`

- generated component drafts
- token snapshots
- copied docs/guidelines
- MCP support files
- temporary Figma app scaffolds

These are inputs.
They are not trusted until curated.

## Promotion Flow

1. Figma push lands in `Command Center Execution Plan/figma-drop/`.
2. Review the push against the current SSOT:
   - design tokens
   - runtime architecture
   - navicue engine contracts
3. Promote only the accepted parts into:
   - `Command Center Execution Plan/src/`
   - `packages/design-system/` when token/system work is ready to promote
4. Re-sync canonical design-system authority back to `figma-drop/`.
5. Run:
   - `npm run command-center:ssot`
   - `npm run ship:check:command-center`
   - `npm run readiness`

## Non-Negotiable Rules

- Do not deploy from `figma-drop/`.
- Do not wire root scripts to `figma-drop/`.
- Do not treat Figma token files as canonical if Command Center differs.
- Do not preserve duplicated authorities for convenience.

## Acceptance Criteria For Promotion

A Figma-origin change is promotable only when:

- the file belongs to a canonical domain
- the runtime/design-system owner accepts the structure
- the change does not introduce a second token or component authority
- SSOT and build checks pass

## Operational Check

Use:

```bash
npm run command-center:ssot
```

This verifies:

- repo routing still goes through Command Center
- `figma-drop/` is still treated as mirror/ingest only
- authoritative design-system files remain synchronized
- SSOT manifest and runtime boundary docs are intact
