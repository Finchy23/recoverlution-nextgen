# Single Source of Truth (SSOT)

This platform has one canonical source per active domain.

## Canonical Domains

1. Cue Catalog + Live Runtime Policy
- Canonical: `services/supabase/migrations/*` + deployed Supabase schema
- Core tables: `navicue_cues`, `navicue_cue_versions`, `navicue_cue_deployments`, `navicue_dispatch_index`
- Rule: cue state is authoritative in the database, not in ad hoc JSON copies

2. Design Tokens
- Canonical: `packages/design-system/src/runtime/design-tokens.ts`
- Package entry: `packages/design-system/src/index.ts`
- Derived app mirror: `apps/design-center/src/design-tokens.ts`
- Rule: tokens are owned in the package, not inside apps

3. Frontend Review Surface
- Canonical app: `apps/design-center/`
- Rule: live frontend review, token review, composition review, and design QA run through Design Center

4. Shared UI + Interaction System
- Canonical targets: `packages/ui/` and the future atoms/interactions package
- Rule: apps consume packages; apps do not become the design system

5. Product Taxonomy + Surface Architecture
- Canonical: `docs/architecture/PLATFORM_ARCHITECTURE.md`
- Rule: new surfaces map here before implementation

6. Engineering Delivery Rules
- Canonical: `docs/runbooks/ENGINEERING_DIRECTIVE.md`
- Rule: no module ships outside the defined delivery process

7. Messaging + Approved Copy
- Canonical: `packages/content/`
- Rule: reusable approved copy is promoted into versioned content, not left in design files or notes

## Legacy Boundary

- `Command Center Execution Plan/` is legacy source material only
- `Design System Draft/` is legacy draft material only
- neither folder is an active runtime authority
- neither folder should be used for new root workflows, release gates, or deploy assumptions

## Guardrails

- no local token systems inside individual apps
- no production routing through legacy folders
- no Figma-origin code becomes canonical until it is curated into packages or active apps
- no duplicated authority for tokens, primitives, or interaction contracts

## Decision Hierarchy

1. Supabase runtime schema and policies
2. Shared packages (`packages/design-system`, `packages/ui`, future interaction packages)
3. Active apps (`apps/design-center`, `apps/marketing`, `apps/web`, etc.)
4. Legacy/reference folders

If layers conflict, the higher layer wins.
