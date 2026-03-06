# Clean Start Protocol

## What "clean start" means here

It does not mean:

- abandoning `recoverlution-nextgen`
- creating a replacement repo
- deleting useful legacy source material immediately

It does mean:

- locking one repo as canonical
- defining where new work is allowed to land
- using branches and worktrees instead of mixed local chaos
- promoting mature work into stable packages and apps

## Immediate rules

1. All net-new product implementation lands in canonical directories:
- `apps/`
- `packages/`
- `services/`

2. Transitional directories are preserved but bounded:
- `Command Center Execution Plan/`
- `Design System Draft/`

Those directories are legacy reference inputs only.

3. Every substantial effort gets:
- its own `codex/*` branch
- its own workstream doc
- its own worktree when running in parallel

4. `main` is integration only:
- no direct feature work
- merge gated by readiness and quality checks
- release scope and ordering governed in Linear

## Execution order

1. Stabilize source-of-truth workflow
- GitHub repo is primary
- local root checkout is canonical
- lane model is enforced

2. Stabilize design-system promotion path
- `packages/design-system` remains the authority and `apps/design-center` remains the active review app

3. Stabilize runtime promotion path
- legacy runtime material is mined deliberately into packages and active apps, not treated as a live surface

4. Stand up clean platform targets
- marketing app
- platform app
- shared engine packages
- service integrations

## What to avoid

- new top-level implementation folders
- multiple Codex lanes in one checkout
- mixing ops, runtime, and design-system work in one branch
- shipping from draft directories without promotion intent
- treating release priority as a chat-only decision instead of a tracked Linear decision

## Required references

- `docs/architecture/CANONICAL_REPO_MAP.md`
- `docs/workstreams/WORKSTREAM_INDEX.md`
- `docs/workstreams/CODEX_LANES.md`
