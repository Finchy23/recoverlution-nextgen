# Repo Setup

## Canonical rule
- `recoverlution-nextgen` is the primary repo.
- `/Users/daniel/Documents/New project` is the canonical local checkout.
- GitHub is the source of truth.
- Do not create a second repo for a "clean start".
- Use `docs/architecture/CANONICAL_REPO_MAP.md` as the authority for where code should live.

## 1) Initialize dependencies by project
Active frontend review app:
- `cd apps/design-center`
- `npm install`
- `npm run ship:check`

## 2) Root workspace note
This root is the canonical workspace and active app boundaries now live under `apps/`.

If `node` is missing at root, use absolute binary path for scripts:
- `/Users/daniel/.nvm/versions/node/v24.14.0/bin/node`
- `/Users/daniel/.nvm/versions/node/v24.14.0/bin/npm`

Example:
- `/Users/daniel/.nvm/versions/node/v24.14.0/bin/node scripts/generate-navicue-catalog-upserts.mjs <csv> <output.sql>`

## 3) Apply 10k backend migration
- Apply: `services/supabase/migrations/20260227_navicue_10000_management.sql`
- Then load scaffold into generated upserts SQL via script above.

## 4) Team operating rule
- Keep `apps/design-center` stable as the active frontend review surface.
- Build new modules into `apps/*` and shared contracts into `packages/*`.
- Use separate `codex/*` branches and git worktrees for parallel Codex lanes.

## 5) Clean-start rule
- Preserve all existing architecture, gates, and runtime work.
- Stop adding new top-level implementation directories outside `apps/*`, `packages/*`, `services/*`, `docs/*`, and `scripts/*`.
- Treat `Command Center Execution Plan/` and `Design System Draft/` as legacy source material only.
